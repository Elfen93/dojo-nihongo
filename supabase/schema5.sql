-- Revisión de contenido (quinta tanda). Ejecutar en el SQL Editor después de schema4.sql.
alter table public.allowed_users add column if not exists reviewer boolean not null default false;

create or replace function public.is_reviewer() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.allowed_users a
    where lower(a.email) = lower(coalesce(auth.jwt()->>'email','')) and a.reviewer
  );
$$;
grant execute on function public.is_reviewer() to authenticated;

-- Avisos de error que envía cualquier usuario autorizado
create table if not exists public.content_reports (
  id bigint generated always as identity primary key,
  key text not null,
  label text,
  comment text not null,
  suggestion text,
  status text not null default 'open',      -- open | fixed | ok
  reporter uuid not null default auth.uid(),
  reporter_email text,
  created_at timestamptz not null default now(),
  resolved_email text,
  resolved_at timestamptz,
  note text
);
alter table public.content_reports enable row level security;
drop policy if exists "avisos lectura" on public.content_reports;
create policy "avisos lectura" on public.content_reports for select
  using (public.is_allowed() and (reporter = auth.uid() or public.is_reviewer()));
drop policy if exists "avisos alta" on public.content_reports;
create policy "avisos alta" on public.content_reports for insert
  with check (public.is_allowed() and reporter = auth.uid());
drop policy if exists "avisos gestion" on public.content_reports;
create policy "avisos gestion" on public.content_reports for update
  using (public.is_reviewer()) with check (public.is_reviewer());
drop policy if exists "avisos baja" on public.content_reports;
create policy "avisos baja" on public.content_reports for delete using (public.is_reviewer());

-- Ítems que ha revisado una persona nativa
create table if not exists public.content_reviewed (
  key text primary key,
  reviewer_email text,
  at timestamptz not null default now()
);
alter table public.content_reviewed enable row level security;
drop policy if exists "revisado lectura" on public.content_reviewed;
create policy "revisado lectura" on public.content_reviewed for select using (public.is_allowed());
drop policy if exists "revisado alta" on public.content_reviewed;
create policy "revisado alta" on public.content_reviewed for insert with check (public.is_reviewer());
drop policy if exists "revisado baja" on public.content_reviewed;
create policy "revisado baja" on public.content_reviewed for delete using (public.is_reviewer());

create or replace function public.admin_set_reviewer(p_email text, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'no autorizado'; end if;
  update public.allowed_users set reviewer = coalesce(p_on,false) where lower(email) = lower(trim(p_email));
end $$;
grant execute on function public.admin_set_reviewer(text, boolean) to authenticated;
