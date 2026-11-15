-- Bot de WhatsApp de NAYA: conversaciones e historial (solo lo usa el servidor)

create table if not exists public.whatsapp_conversations (
  wa_id text primary key,                 -- número del cliente (ej. 573001234567)
  customer_name text,
  bot_paused_until timestamptz,           -- mientras esté en el futuro, el bot no responde (atiende una persona)
  handoff_requested_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id bigint generated always as identity primary key,
  wa_id text not null references public.whatsapp_conversations(wa_id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'owner')),
  content text not null,
  wa_message_id text unique,              -- evita responder dos veces el mismo mensaje
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_messages_wa_id_idx on public.whatsapp_messages (wa_id, created_at desc);

alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;

revoke all on public.whatsapp_conversations from anon, authenticated;
revoke all on public.whatsapp_messages from anon, authenticated;

-- Los administradores pueden leer las conversaciones desde el panel
drop policy if exists "Admins read whatsapp conversations" on public.whatsapp_conversations;
create policy "Admins read whatsapp conversations"
  on public.whatsapp_conversations for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins read whatsapp messages" on public.whatsapp_messages;
create policy "Admins read whatsapp messages"
  on public.whatsapp_messages for select to authenticated
  using (public.is_admin());

grant select on public.whatsapp_conversations to authenticated;
grant select on public.whatsapp_messages to authenticated;
grant all on public.whatsapp_conversations to service_role;
grant all on public.whatsapp_messages to service_role;
