-- Suscriptores del boletín (sección "Entérate primero de las promos")
create table if not exists public.newsletter_subscribers (
  email text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text not null default 'home',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);

drop policy if exists "Admins read subscribers" on public.newsletter_subscribers;
create policy "Admins read subscribers"
  on public.newsletter_subscribers for select to authenticated
  using (public.is_admin());

grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;
