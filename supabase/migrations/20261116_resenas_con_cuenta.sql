-- Reseñas solo de clientes con cuenta: una por producto y por cliente, con marca de compra verificada
alter table public.product_reviews add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.product_reviews add column if not exists verified_purchase boolean not null default false;
create unique index if not exists product_reviews_una_por_cliente on public.product_reviews (product_id, user_id) where user_id is not null;

-- Fotos de las reseñas (hasta 3), guardadas en el bucket público "review-photos"
alter table public.product_reviews add column if not exists photos text[] not null default '{}';
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
