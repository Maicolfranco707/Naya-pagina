-- Número de guía y transportadora del pedido (lo llena NAYA en el admin; el cliente lo ve en Mi cuenta)
alter table public.orders add column if not exists tracking_carrier text check (tracking_carrier is null or char_length(tracking_carrier) <= 40);
alter table public.orders add column if not exists tracking_number text check (tracking_number is null or char_length(tracking_number) <= 60);

-- Solo los administradores pueden actualizar pedidos (lo controla la política "Admins update orders").
grant update (tracking_carrier, tracking_number) on public.orders to authenticated;
