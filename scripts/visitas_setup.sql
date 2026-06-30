-- ============================================
-- CONTADOR DE VISITAS — pedido Génesis
-- Pegar en Supabase SQL Editor (es idempotente).
-- ============================================

-- 1) Tabla simple, una fila por visita
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- session_key permite contar 1 visita por sesión por path (evita inflar)
  session_key TEXT
);

-- Índices para que las consultas del admin sean rápidas
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON public.page_views (path);

-- 2) RLS — anon puede insertar visitas + leer (para admin dashboard)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_page_views" ON public.page_views;
CREATE POLICY "anon_insert_page_views" ON public.page_views
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_page_views" ON public.page_views;
CREATE POLICY "anon_select_page_views" ON public.page_views
  FOR SELECT TO anon USING (true);

-- ✔ Verificá con:
-- SELECT count(*) FROM page_views;
