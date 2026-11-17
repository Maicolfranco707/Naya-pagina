-- Reseñas solo de clientes con cuenta: una por producto y por cliente, con marca de compra verificada
alter table public.product_reviews add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.product_reviews add column if not exists verified_purchase boolean not null default false;
create unique index if not exists product_reviews_una_por_cliente on public.product_reviews (product_id, user_id) where user_id is not null;
