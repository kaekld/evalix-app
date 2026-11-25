-- ============================================================
-- Evalix - Migración: tablas en singular
--   examen / pregunta / opcion_multiple
-- Idempotente y NO destructiva:
--   - No elimina `evaluacion` ni `opcion` existentes.
--   - Reutiliza `pregunta` si ya existe y le agrega `examen_id`.
--   - Tipos de pregunta: CERRADA | ABIERTA (sin canvas).
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1) examen
-- ------------------------------------------------------------
create table if not exists public.examen (
  id uuid primary key default gen_random_uuid(),
  docente_id uuid not null references public.docente(id) on delete cascade,
  grupo_id uuid not null references public.grupo(id) on delete cascade,
  institucion_id uuid not null references public.institucion(id),
  titulo text not null,
  descripcion text,
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,
  tiempo_examen integer not null default 60,
  orden_aleatorio boolean not null default false,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'publicada', 'finalizada', 'cancelada')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_examen_docente on public.examen (docente_id);
create index if not exists idx_examen_grupo on public.examen (grupo_id);
create index if not exists idx_examen_estado on public.examen (estado);

-- Trigger de actualizado_en con función de nombre propio (no pisa otras)
create or replace function public.set_examen_actualizado_en()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists trg_examen_actualizado_en on public.examen;
create trigger trg_examen_actualizado_en
  before update on public.examen
  for each row execute function public.set_examen_actualizado_en();

-- ------------------------------------------------------------
-- 2) pregunta
--    Si ya existe (ligada a evaluacion) se conserva intacta y
--    sólo se le agrega examen_id. Si no existe, se crea.
-- ------------------------------------------------------------
create table if not exists public.pregunta (
  id uuid primary key default gen_random_uuid(),
  examen_id uuid references public.examen(id) on delete cascade,
  tipo text not null check (tipo in ('CERRADA', 'ABIERTA')),
  enunciado text not null,
  imagen_url text,
  tiempo_segundos integer not null default 60,
  orden integer not null default 0,
  creado_en timestamptz not null default now()
);

-- Columnas nuevas sobre una `pregunta` preexistente (no borra datos)
alter table public.pregunta add column if not exists examen_id uuid;
alter table public.pregunta add column if not exists creado_en timestamptz not null default now();

create index if not exists idx_pregunta_examen on public.pregunta (examen_id);

-- FK examen_id -> examen.id, sólo si no existe
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pregunta_examen_id_fkey'
  ) then
    alter table public.pregunta
      add constraint pregunta_examen_id_fkey
      foreign key (examen_id) references public.examen(id) on delete cascade;
  end if;
end $$;

-- Si la `pregunta` preexistente exige evaluacion_id, lo volvemos opcional
-- para permitir preguntas ligadas sólo a examen (sin borrar datos).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pregunta'
      and column_name = 'evaluacion_id'
      and is_nullable = 'NO'
  ) then
    alter table public.pregunta alter column evaluacion_id drop not null;
  end if;
end $$;

-- ------------------------------------------------------------
-- 3) opcion_multiple
-- ------------------------------------------------------------
create table if not exists public.opcion_multiple (
  id uuid primary key default gen_random_uuid(),
  pregunta_id uuid not null references public.pregunta(id) on delete cascade,
  texto text not null,
  es_correcta boolean not null default false,
  orden integer not null default 0
);

create index if not exists idx_opcion_multiple_pregunta on public.opcion_multiple (pregunta_id);

-- ------------------------------------------------------------
-- 4) Documentación
-- ------------------------------------------------------------
comment on table public.examen is 'Exámenes del docente (flujo nuevo en singular). No reemplaza ni borra evaluacion.';
comment on table public.pregunta is 'Preguntas de un examen. tipo = CERRADA | ABIERTA (sin canvas).';
comment on table public.opcion_multiple is 'Opciones de respuesta para preguntas de tipo CERRADA.';
