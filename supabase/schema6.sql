-- Resultados guardados del corrector de redacciones (sexta tanda). Ejecutar en el SQL Editor.
-- El mismo texto siempre recibe la misma corrección, y la versión corregida por la app puntúa 100.
create table if not exists public.write_results (
  hash text primary key,
  result jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.write_results enable row level security;  -- sin políticas: solo la función de servidor accede
