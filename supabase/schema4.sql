-- Glosario común (cuarta tanda). Ejecutar en el SQL Editor después de schema3.sql.
-- Respuestas válidas que los usuarios con permiso añaden y que se comparten con todos.
alter table public.allowed_users add column if not exists glossary_editor boolean not null default false;

create or replace function public.can_edit_glossary() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.allowed_users a
    where lower(a.email) = lower(coalesce(auth.jwt()->>'email','')) and a.glossary_editor
  );
$$;
grant execute on function public.can_edit_glossary() to authenticated;

create table if not exists public.glossary_alts (
  key text not null,
  alt text not null,
  added_by uuid,
  added_email text,
  added_at timestamptz not null default now(),
  primary key (key, alt)
);
alter table public.glossary_alts enable row level security;
drop policy if exists "glosario lectura" on public.glossary_alts;
create policy "glosario lectura" on public.glossary_alts for select using (public.is_allowed());
drop policy if exists "glosario alta" on public.glossary_alts;
create policy "glosario alta" on public.glossary_alts for insert with check (public.can_edit_glossary());
drop policy if exists "glosario baja" on public.glossary_alts;
create policy "glosario baja" on public.glossary_alts for delete using (public.can_edit_glossary());

create or replace function public.admin_set_glossary_editor(p_email text, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'no autorizado'; end if;
  update public.allowed_users set glossary_editor = coalesce(p_on,false) where lower(email) = lower(trim(p_email));
end $$;
grant execute on function public.admin_set_glossary_editor(text, boolean) to authenticated;
