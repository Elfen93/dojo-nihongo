-- Dojo 日本語: esquema. Ejecutar en Supabase → SQL Editor.
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.gen_levels (
  user_id uuid not null references auth.users(id) on delete cascade,
  lv int not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, lv)
);
alter table public.progress enable row level security;
alter table public.gen_levels enable row level security;
-- Cada usuario solo ve y escribe lo suyo
create policy "progress propio" on public.progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "gen propio" on public.gen_levels for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
