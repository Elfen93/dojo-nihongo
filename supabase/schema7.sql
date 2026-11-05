-- Ejecutar en el SQL Editor de Supabase (se puede repetir sin problema).
-- Problema que resuelve: un correo autorizado que "no coincide" con la cuenta de Google porque lleva un carácter invisible
-- (espacio de no separación, espacio de ancho cero, etc., típico al copiar y pegar o con el teclado del móvil).
-- Ahora todas las comparaciones de correo ignoran mayúsculas y esos caracteres.

create or replace function public.norm_email(t text) returns text
language sql immutable as $$
  select lower(regexp_replace(coalesce(t,''), '[[:space:] ​-‍⁠﻿]', '', 'g'));
$$;

create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.allowed_users a
    where public.norm_email(a.email) = public.norm_email(auth.jwt()->>'email')
  );
$$;

create or replace function public.can_edit_glossary() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.allowed_users a
    where public.norm_email(a.email) = public.norm_email(auth.jwt()->>'email') and a.glossary_editor
  );
$$;

create or replace function public.is_reviewer() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.allowed_users a
    where public.norm_email(a.email) = public.norm_email(auth.jwt()->>'email') and a.reviewer
  );
$$;

create or replace function public.admin_add_user(p_email text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'no autorizado'; end if;
  if p_email is null or position('@' in p_email) = 0 then raise exception 'correo no válido'; end if;
  insert into public.allowed_users(email, note, added_by) values (public.norm_email(p_email), p_note, auth.uid())
  on conflict (email) do update set note = excluded.note;
end $$;

create or replace function public.admin_remove_user(p_email text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'no autorizado'; end if;
  if public.norm_email(p_email) = public.norm_email('bl.oury94@gmail.com') then raise exception 'no se puede quitar al superusuario'; end if;
  delete from public.allowed_users where public.norm_email(email) = public.norm_email(p_email);
end $$;

-- Limpia las filas que ya existen con caracteres raros (si no choca con otra fila)
update public.allowed_users u set email = public.norm_email(u.email)
where u.email <> public.norm_email(u.email)
  and not exists (select 1 from public.allowed_users b where b.email = public.norm_email(u.email));
