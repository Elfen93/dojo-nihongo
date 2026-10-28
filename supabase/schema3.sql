-- Autorización gestionada desde la app. Ejecutar en el SQL Editor (tercera tanda).
-- 1) Superusuario: cambia el correo si hace falta. Solo este correo puede administrar la lista.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt()->>'email','')) = lower('bl.oury94@gmail.com');
$$;

-- 2) Lista de correos autorizados
create table if not exists public.allowed_users (
  email text primary key,
  note text,
  added_by uuid,
  added_at timestamptz not null default now()
);
alter table public.allowed_users enable row level security;
drop policy if exists "admin gestiona lista" on public.allowed_users;
create policy "admin gestiona lista" on public.allowed_users for all
  using (public.is_admin()) with check (public.is_admin());
insert into public.allowed_users(email, note) values ('bl.oury94@gmail.com', 'superusuario') on conflict do nothing;

-- 3) ¿Está autorizado el usuario actual? (el admin siempre lo está)
create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.allowed_users a
    where lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))
  );
$$;
grant execute on function public.is_allowed() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- 4) Funciones de administración (solo admin): añadir y quitar
create or replace function public.admin_add_user(p_email text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'no autorizado'; end if;
  if p_email is null or position('@' in p_email) = 0 then raise exception 'correo no válido'; end if;
  insert into public.allowed_users(email, note, added_by) values (lower(trim(p_email)), p_note, auth.uid())
  on conflict (email) do update set note = excluded.note;
end $$;
create or replace function public.admin_remove_user(p_email text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'no autorizado'; end if;
  if lower(p_email) = lower('bl.oury94@gmail.com') then raise exception 'no se puede quitar al superusuario'; end if;
  delete from public.allowed_users where lower(email) = lower(trim(p_email));
end $$;
create or replace function public.admin_list_users() returns setof public.allowed_users
language sql security definer set search_path = public as $$
  select * from public.allowed_users where public.is_admin() order by added_at;
$$;
grant execute on function public.admin_add_user(text, text) to authenticated;
grant execute on function public.admin_remove_user(text) to authenticated;
grant execute on function public.admin_list_users() to authenticated;

-- 5) Todas las tablas de datos exigen ser el dueño Y estar autorizado
drop policy if exists "progress propio" on public.progress;
create policy "progress propio" on public.progress for all
  using (auth.uid() = user_id and public.is_allowed()) with check (auth.uid() = user_id and public.is_allowed());
drop policy if exists "gen propio" on public.gen_levels;
create policy "gen propio" on public.gen_levels for all
  using (auth.uid() = user_id and public.is_allowed()) with check (auth.uid() = user_id and public.is_allowed());
drop policy if exists "lecturas propias" on public.user_readings;
create policy "lecturas propias" on public.user_readings for all
  using (auth.uid() = user_id and public.is_allowed()) with check (auth.uid() = user_id and public.is_allowed());
drop policy if exists "push propio" on public.push_subs;
create policy "push propio" on public.push_subs for all
  using (auth.uid() = user_id and public.is_allowed()) with check (auth.uid() = user_id and public.is_allowed());
