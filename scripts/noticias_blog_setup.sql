-- ============================================
-- NOTICIAS COMO BLOG — agrega contenido editable
-- Pegar en Supabase SQL Editor (idempotente).
-- ============================================

-- 1) Columnas nuevas para el contenido del blog
ALTER TABLE public.cms_noticias
  ADD COLUMN IF NOT EXISTS contenido TEXT,
  ADD COLUMN IF NOT EXISTS resumen   TEXT;

-- ✔ Listo. Verificá con:
-- SELECT id, titulo, COALESCE(LENGTH(contenido), 0) AS chars_contenido FROM cms_noticias;
