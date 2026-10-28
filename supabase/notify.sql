-- Notificaciones push: tabla de suscripciones + tarea horaria. Ejecutar en el SQL Editor DESPUÉS de desplegar la función notify.
create table if not exists public.push_subs (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sub jsonb not null,
  last_sent timestamptz,
  last_kind text,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
create policy "push propio" on public.push_subs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tarea horaria (requiere las extensiones pg_cron y pg_net: Database → Extensions).
create extension if not exists pg_cron;
create extension if not exists pg_net;
-- Sustituye NOTIFY_SECRET por el mismo valor que pusiste en `supabase secrets set NOTIFY_SECRET=...`
select cron.schedule('dojo-notify', '7 * * * *', $$
  select net.http_post(
    url := 'https://ljszzzkqsoihcmglmxsw.supabase.co/functions/v1/notify',
    headers := '{"Content-Type":"application/json","x-notify-secret":"NOTIFY_SECRET"}'::jsonb,
    body := '{}'::jsonb
  );
$$);
