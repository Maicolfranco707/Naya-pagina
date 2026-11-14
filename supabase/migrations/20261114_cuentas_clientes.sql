-- ============================================================
-- Cuentas de clientes: pedidos ligados a la cuenta y datos de envío guardados
-- ============================================================

-- Cada pedido queda ligado a la cuenta que lo hizo (null si se compró sin cuenta).
-- create_order es security definer, pero auth.uid() sigue leyendo el JWT de la petición.
alter table public.orders
  add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);

create table if not exists public.customer_profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  identification text,
  phone text,
  address text,
  apartment text,
  region text,
  city text,
  postal_code text,
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = (select auth.uid())
  ));

drop policy if exists "Customers read own profile" on public.customer_profiles;
create policy "Customers read own profile"
  on public.customer_profiles for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Customers create own profile" on public.customer_profiles;
create policy "Customers create own profile"
  on public.customer_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Customers update own profile" on public.customer_profiles;
create policy "Customers update own profile"
  on public.customer_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Permisos de tabla (RLS decide qué filas ve cada quien: admins todo, clientes lo suyo).
-- Van al final porque más arriba se hace "revoke all" sobre orders y order_items.
grant select on public.orders to authenticated;
grant update (order_status, updated_at) on public.orders to authenticated;
grant select on public.order_items to authenticated;
revoke all on public.customer_profiles from anon;
grant select, insert, update on public.customer_profiles to authenticated;
