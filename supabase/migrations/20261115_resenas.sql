-- Reseñas de clientes: las escriben los clientes y NAYA las aprueba en el admin antes de mostrarlas
create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  product_id bigint references public.products(id) on delete cascade,
  author_name text not null check (char_length(btrim(author_name)) between 2 and 60),
  city text check (city is null or char_length(city) <= 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 5 and 800),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_idx on public.product_reviews (product_id, approved, created_at desc);

alter table public.product_reviews enable row level security;
revoke all on public.product_reviews from anon, authenticated;

-- Todos ven solo las aprobadas
drop policy if exists "Anyone reads approved reviews" on public.product_reviews;
create policy "Anyone reads approved reviews"
  on public.product_reviews for select to anon, authenticated
  using (approved = true or public.is_admin());

-- Los administradores aprueban, ocultan y borran
drop policy if exists "Admins update reviews" on public.product_reviews;
create policy "Admins update reviews"
  on public.product_reviews for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete reviews" on public.product_reviews;
create policy "Admins delete reviews"
  on public.product_reviews for delete to authenticated
  using (public.is_admin());

grant select on public.product_reviews to anon, authenticated;
grant update (approved), delete on public.product_reviews to authenticated;
grant all on public.product_reviews to service_role;
