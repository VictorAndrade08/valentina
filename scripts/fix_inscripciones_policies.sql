-- =============================================================
-- FIX — Políticas faltantes en inscripciones_concurso_ia
-- + limpieza de 10 inscripciones residuales del seed viejo.
-- Pegar en Supabase → SQL Editor → New query → Run
-- =============================================================

-- 1) Agregar políticas UPDATE y DELETE (las faltantes del SQL original)
drop policy if exists "Anon actualizar inscripciones_concurso_ia" on public.inscripciones_concurso_ia;
create policy "Anon actualizar inscripciones_concurso_ia" on public.inscripciones_concurso_ia
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar inscripciones_concurso_ia" on public.inscripciones_concurso_ia;
create policy "Anon eliminar inscripciones_concurso_ia" on public.inscripciones_concurso_ia
  for delete to anon using (true);

-- 2) Borrar inscripciones residuales del seed anterior (@test.com)
delete from public.inscripciones_concurso_ia
where correo like '%@test.com';

-- =============================================================
-- FIN. Después de esto: tabla limpia + el panel puede borrar inscripciones.
-- =============================================================
