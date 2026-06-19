-- =============================================================
-- Constraint UNIQUE en cédula del estudiante del concurso IA.
-- Evita que la misma persona pueda inscribirse 2 veces.
-- Pegar en Supabase → SQL Editor → New query → Run
-- =============================================================

-- Solo crea el constraint si NO existe ya (idempotente).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inscripciones_concurso_ia_cedula_unica'
  ) then
    alter table public.inscripciones_concurso_ia
      add constraint inscripciones_concurso_ia_cedula_unica
      unique (cedula_estudiante);
  end if;
end$$;

-- Si en el futuro alguien intenta insertar una cédula ya registrada,
-- Supabase devuelve un error 23505 (unique_violation) que el form
-- captura y muestra al usuario como "Ya existe una inscripción con esa cédula".
