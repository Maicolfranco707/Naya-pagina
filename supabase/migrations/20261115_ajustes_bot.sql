-- Ajustes de la tienda (por ahora: encender/apagar el bot de WhatsApp desde el admin)
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;
revoke all on public.store_settings from anon, authenticated;

drop policy if exists "Admins read settings" on public.store_settings;
create policy "Admins read settings"
  on public.store_settings for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins update settings" on public.store_settings;
create policy "Admins update settings"
  on public.store_settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;

insert into public.store_settings (key, value)
values ('whatsapp_bot_enabled', 'true'::jsonb)
on conflict (key) do nothing;
