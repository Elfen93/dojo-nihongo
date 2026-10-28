-- Lecturas importadas por el usuario. Ejecutar en el SQL Editor (segunda tanda).
create table if not exists public.user_readings (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.user_readings enable row level security;
create policy "lecturas propias" on public.user_readings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
