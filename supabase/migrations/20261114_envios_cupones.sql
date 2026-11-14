-- ============================================================
-- Envíos por zona (estilo Fauno), envío gratis y cupones de descuento
-- ============================================================

-- 1) Pedidos: descuento y cupón; el envío ya no está limitado a 25.000/30.000
alter table public.orders add column if not exists discount_cop integer not null default 0 check (discount_cop >= 0);
alter table public.orders add column if not exists coupon_code text;
alter table public.orders drop constraint if exists orders_shipping_cop_check;
alter table public.orders drop constraint if exists orders_total_cop_check;
-- Regla original sin nombre (total = subtotal + envío): no contempla el descuento.
alter table public.orders drop constraint if exists orders_check;
alter table public.orders add constraint orders_shipping_cop_check check (shipping_cop >= 0);
alter table public.orders add constraint orders_total_cop_check check (total_cop = subtotal_cop - discount_cop + shipping_cop);

-- 2) Cupones
create table if not exists public.coupons (
  code text primary key check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,30}$'),
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  min_subtotal_cop integer not null default 0 check (min_subtotal_cop >= 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  one_per_email boolean not null default false,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 100)
);

alter table public.coupons enable row level security;

drop policy if exists "Admins manage coupons" on public.coupons;
create policy "Admins manage coupons"
  on public.coupons for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.coupons from anon;
grant select, insert, update, delete on public.coupons to authenticated;

-- 3) Tarifa de envío (la misma regla la muestra el checkout)
create or replace function public.shipping_quote(p_region text, p_subtotal integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_subtotal >= 150000 then 0
    when translate(lower(coalesce(p_region, '')), 'áéíóú', 'aeiou') = 'antioquia' then 10000
    else 14900
  end;
$$;

-- 4) Validación de cupón (la usan el checkout y create_order)
create or replace function public.evaluate_coupon(p_code text, p_subtotal integer, p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_coupon public.coupons%rowtype;
  v_used integer;
  v_discount integer;
begin
  select * into v_coupon from public.coupons where code = upper(btrim(coalesce(p_code, '')));
  if not found or not v_coupon.active then
    return jsonb_build_object('valid', false, 'message', 'Este código no existe o ya no está activo.');
  end if;
  if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
    return jsonb_build_object('valid', false, 'message', 'Este código todavía no está disponible.');
  end if;
  if v_coupon.ends_at is not null and now() > v_coupon.ends_at then
    return jsonb_build_object('valid', false, 'message', 'Este código ya venció.');
  end if;
  if p_subtotal < v_coupon.min_subtotal_cop then
    return jsonb_build_object('valid', false, 'message',
      'Este código aplica para compras desde $' || to_char(v_coupon.min_subtotal_cop, 'FM999G999G999') || '.');
  end if;

  -- Solo cuentan pedidos reales: pagados con Wompi o pedidos por WhatsApp no cancelados.
  if v_coupon.max_uses is not null then
    select count(*) into v_used from public.orders o
    where o.coupon_code = v_coupon.code
      and (o.payment_status = 'approved' or (o.payment_provider = 'whatsapp' and o.order_status <> 'cancelled'));
    if v_used >= v_coupon.max_uses then
      return jsonb_build_object('valid', false, 'message', 'Este código ya alcanzó su límite de usos.');
    end if;
  end if;
  if v_coupon.one_per_email and nullif(btrim(coalesce(p_email, '')), '') is not null then
    if exists (
      select 1 from public.orders o
      where o.coupon_code = v_coupon.code
        and lower(o.customer_email) = lower(btrim(p_email))
        and (o.payment_status = 'approved' or (o.payment_provider = 'whatsapp' and o.order_status <> 'cancelled'))
    ) then
      return jsonb_build_object('valid', false, 'message', 'Ya usaste este código con este correo.');
    end if;
  end if;

  v_discount := case
    when v_coupon.discount_type = 'percent' then round(p_subtotal * v_coupon.discount_value / 100.0)::integer
    else least(v_coupon.discount_value, p_subtotal)
  end;

  return jsonb_build_object(
    'valid', true,
    'code', v_coupon.code,
    'discount', v_discount,
    'message', coalesce(v_coupon.description, 'Descuento aplicado.')
  );
end;
$$;

revoke all on function public.evaluate_coupon(text, integer, text) from public;
grant execute on function public.evaluate_coupon(text, integer, text) to anon, authenticated;

-- 5) create_order: el servidor calcula envío y descuento (el navegador no puede cambiarlos)
drop function if exists public.create_order(jsonb, jsonb, integer, text);

create or replace function public.create_order(
  p_customer jsonb,
  p_items jsonb,
  p_payment_provider text,
  p_coupon text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_reference text := 'NAYA-' || replace(v_order_id::text, '-', '');
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_coupon_code text;
  v_coupon jsonb;
  v_shipping integer;
  v_total integer;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_name text;
  v_email text;
  v_phone text;
  v_identification text;
  v_company text;
  v_country text;
  v_address text;
  v_apartment text;
  v_city text;
  v_region text;
  v_postal_code text;
  v_notes text;
begin
  if p_payment_provider not in ('wompi', 'whatsapp') then
    raise exception 'Invalid payment provider';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'Invalid order items';
  end if;

  v_name := nullif(btrim(concat_ws(' ', nullif(btrim(p_customer->>'nombre'), ''), nullif(btrim(p_customer->>'apellidos'), ''))), '');
  v_email := nullif(btrim(p_customer->>'email'), '');
  v_phone := nullif(btrim(p_customer->>'telefono'), '');
  v_identification := nullif(btrim(p_customer->>'identificacion'), '');
  v_company := nullif(btrim(p_customer->>'empresa'), '');
  v_country := coalesce(nullif(btrim(p_customer->>'pais'), ''), 'Colombia');
  v_address := nullif(btrim(p_customer->>'direccion'), '');
  v_apartment := nullif(btrim(p_customer->>'apartamento'), '');
  v_city := nullif(btrim(p_customer->>'poblacion'), '');
  v_region := nullif(btrim(p_customer->>'departamento'), '');
  v_postal_code := nullif(btrim(p_customer->>'codigoPostal'), '');
  v_notes := nullif(btrim(p_customer->>'notas'), '');

  if v_name is null or v_email is null or v_phone is null or v_identification is null
    or v_address is null or v_city is null or v_region is null then
    raise exception 'Required customer data is missing';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item->>'id', '') !~ '^[0-9]+$' or coalesce(v_item->>'cantidad', '') !~ '^[0-9]+$' then
      raise exception 'Invalid product or quantity';
    end if;
    v_quantity := (v_item->>'cantidad')::integer;
    if v_quantity < 1 or v_quantity > 99 then
      raise exception 'Invalid product quantity';
    end if;
    select * into v_product from public.products where id = (v_item->>'id')::bigint and active = true;
    if not found then
      raise exception 'Product is unavailable';
    end if;
    v_subtotal := v_subtotal + v_product.price_cop * v_quantity;
  end loop;

  if nullif(btrim(coalesce(p_coupon, '')), '') is not null then
    v_coupon := public.evaluate_coupon(p_coupon, v_subtotal, v_email);
    if not (v_coupon->>'valid')::boolean then
      raise exception 'Coupon: %', v_coupon->>'message';
    end if;
    v_discount := (v_coupon->>'discount')::integer;
    v_coupon_code := v_coupon->>'code';
  end if;

  v_shipping := public.shipping_quote(v_region, v_subtotal - v_discount);
  v_total := v_subtotal - v_discount + v_shipping;

  insert into public.orders (
    id, reference, customer_name, customer_email, customer_phone,
    customer_identification, customer_company, shipping_country,
    shipping_address, shipping_apartment, shipping_city, shipping_region,
    shipping_postal_code, customer_notes, subtotal_cop, discount_cop, coupon_code,
    shipping_cop, total_cop, payment_provider
  ) values (
    v_order_id, v_reference, v_name, v_email, v_phone,
    v_identification, v_company, v_country, v_address, v_apartment,
    v_city, v_region, v_postal_code, v_notes, v_subtotal, v_discount, v_coupon_code,
    v_shipping, v_total, p_payment_provider
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'cantidad')::integer;
    select * into v_product from public.products where id = (v_item->>'id')::bigint and active = true;
    insert into public.order_items (
      order_id, product_id, product_name, unit_price_cop, quantity, line_total_cop
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.price_cop,
      v_quantity, v_product.price_cop * v_quantity
    );
  end loop;

  return jsonb_build_object(
    'id', v_order_id,
    'reference', v_reference,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'couponCode', v_coupon_code,
    'shippingCost', v_shipping,
    'total', v_total
  );
end;
$$;

revoke all on function public.create_order(jsonb, jsonb, text, text) from public;
grant execute on function public.create_order(jsonb, jsonb, text, text) to anon, authenticated;

-- 6) Cupón de bienvenida: 10%, un uso por correo
insert into public.coupons (code, description, discount_type, discount_value, one_per_email)
values ('BIENVENIDA10', '10% de descuento en tu primera compra', 'percent', 10, true)
on conflict (code) do nothing;
