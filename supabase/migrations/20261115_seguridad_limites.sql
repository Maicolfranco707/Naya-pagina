-- Seguridad: límite de solicitudes por visitante y cupón de un uso por cliente (correo, celular o documento)

-- 1) Límite de solicitudes (lo usa el servidor con la llave de servicio)
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limits (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  -- Limpieza ocasional de ventanas viejas
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- 2) Cupón: un uso por cliente (correo, celular o documento)
drop function if exists public.evaluate_coupon(text, integer, text);

create or replace function public.evaluate_coupon(
  p_code text,
  p_subtotal integer,
  p_email text,
  p_phone text default null,
  p_identification text default null
)
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
  v_phone text := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  v_identification text := upper(regexp_replace(coalesce(p_identification, ''), '[^0-9A-Za-z]', '', 'g'));
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
  -- "Un uso por cliente": se reconoce al cliente por correo, celular o documento,
  -- así no se repite el cupón solo cambiando de correo.
  if v_coupon.one_per_email then
    if exists (
      select 1 from public.orders o
      where o.coupon_code = v_coupon.code
        and (o.payment_status = 'approved' or (o.payment_provider = 'whatsapp' and o.order_status <> 'cancelled'))
        and (
          (nullif(btrim(coalesce(p_email, '')), '') is not null and lower(o.customer_email) = lower(btrim(p_email)))
          or (length(v_phone) = 10 and right(regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g'), 10) = v_phone)
          or (length(v_identification) >= 5 and upper(regexp_replace(coalesce(o.customer_identification, ''), '[^0-9A-Za-z]', '', 'g')) = v_identification)
        )
    ) then
      return jsonb_build_object('valid', false, 'message', 'Este código es para la primera compra y ya fue usado por este cliente.');
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

revoke all on function public.evaluate_coupon(text, integer, text, text, text) from public;
grant execute on function public.evaluate_coupon(text, integer, text, text, text) to anon, authenticated;

-- 3) create_order pasa celular y documento al validar el cupón.
-- Se edita la definición que ya está en la base de datos (solo cambia esa llamada).
do $migracion$
declare
  v_def text := pg_get_functiondef('public.create_order(jsonb, jsonb, text, text)'::regprocedure);
  v_old text := 'public.evaluate_coupon(p_coupon, v_subtotal, v_email)';
  v_new text := 'public.evaluate_coupon(p_coupon, v_subtotal, v_email, v_phone, v_identification)';
begin
  if position(v_new in v_def) > 0 then
    return; -- ya estaba actualizada
  end if;
  if position(v_old in v_def) = 0 then
    raise exception 'create_order no tiene la llamada esperada a evaluate_coupon';
  end if;
  execute replace(v_def, v_old, v_new);
end;
$migracion$;
