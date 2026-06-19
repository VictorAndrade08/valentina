-- =============================================================
-- FASE 1 — Concurso IA + Corcho de Noticias
-- Pegar en Supabase → SQL Editor → New query → Run
-- =============================================================

-- ============================================
-- TABLA cms_concurso_ia (textos editables del concurso)
-- ============================================
create table if not exists public.cms_concurso_ia (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  banner_url text,
  introduccion text,
  reglas text,
  fecha_inicio date,
  fecha_fin date,
  link_bases text,
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.cms_concurso_ia enable row level security;

drop policy if exists "Anon leer cms_concurso_ia" on public.cms_concurso_ia;
create policy "Anon leer cms_concurso_ia" on public.cms_concurso_ia
  for select to anon using (true);

drop policy if exists "Anon insertar cms_concurso_ia" on public.cms_concurso_ia;
create policy "Anon insertar cms_concurso_ia" on public.cms_concurso_ia
  for insert to anon with check (true);

drop policy if exists "Anon actualizar cms_concurso_ia" on public.cms_concurso_ia;
create policy "Anon actualizar cms_concurso_ia" on public.cms_concurso_ia
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar cms_concurso_ia" on public.cms_concurso_ia;
create policy "Anon eliminar cms_concurso_ia" on public.cms_concurso_ia
  for delete to anon using (true);

-- Semilla inicial (solo si la tabla está vacía)
insert into public.cms_concurso_ia
  (nombre, banner_url, introduccion, reglas, fecha_inicio, fecha_fin, link_bases, activo)
select
  'Concurso de Becas en Inteligencia Artificial',
  '',
  'Convocatoria abierta para estudiantes de colegio (información a completar).',
  'Reglas y bases del concurso (a completar).',
  '2026-06-22',
  '2026-07-22',
  '',
  true
where not exists (select 1 from public.cms_concurso_ia);

-- ============================================
-- TABLA inscripciones_concurso_ia
-- ============================================
-- AJUSTAR las columnas según los campos exactos que pase el cliente.
-- Este esquema cubre los campos típicos de un concurso escolar.

create table if not exists public.inscripciones_concurso_ia (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Datos del estudiante
  nombres_estudiante text,
  cedula_estudiante text,
  fecha_nacimiento date,
  edad text,
  genero text,

  -- Datos académicos
  colegio text,
  grado text,
  ciudad text,
  provincia text,

  -- Contacto del estudiante
  correo text,
  whatsapp text,

  -- Datos del representante
  nombres_representante text,
  cedula_representante text,
  correo_representante text,
  telefono_representante text,

  -- Adicionales
  motivacion text,
  proyecto text,
  archivo_url text,
  archivo_nombre text
);

alter table public.inscripciones_concurso_ia enable row level security;

drop policy if exists "Anon leer inscripciones_concurso_ia" on public.inscripciones_concurso_ia;
create policy "Anon leer inscripciones_concurso_ia" on public.inscripciones_concurso_ia
  for select to anon using (true);

drop policy if exists "Anon insertar inscripciones_concurso_ia" on public.inscripciones_concurso_ia;
create policy "Anon insertar inscripciones_concurso_ia" on public.inscripciones_concurso_ia
  for insert to anon with check (true);

drop policy if exists "Anon actualizar inscripciones_concurso_ia" on public.inscripciones_concurso_ia;
create policy "Anon actualizar inscripciones_concurso_ia" on public.inscripciones_concurso_ia
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar inscripciones_concurso_ia" on public.inscripciones_concurso_ia;
create policy "Anon eliminar inscripciones_concurso_ia" on public.inscripciones_concurso_ia
  for delete to anon using (true);

-- ============================================
-- TABLA cms_noticias (Corcho de noticias / anuncios)
-- ============================================
create table if not exists public.cms_noticias (
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  titulo text,
  imagen text,
  link_opcional text,
  fecha timestamptz,
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.cms_noticias enable row level security;

drop policy if exists "Anon leer cms_noticias" on public.cms_noticias;
create policy "Anon leer cms_noticias" on public.cms_noticias
  for select to anon using (true);

drop policy if exists "Anon insertar cms_noticias" on public.cms_noticias;
create policy "Anon insertar cms_noticias" on public.cms_noticias
  for insert to anon with check (true);

drop policy if exists "Anon actualizar cms_noticias" on public.cms_noticias;
create policy "Anon actualizar cms_noticias" on public.cms_noticias
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar cms_noticias" on public.cms_noticias;
create policy "Anon eliminar cms_noticias" on public.cms_noticias
  for delete to anon using (true);

-- =============================================================
-- FIN. Tablas listas para que el panel y el sitio público las usen.
-- =============================================================
