-- ============================================
-- OPERACIÓN VALENTÍA — SETUP COMPLETO
-- Pegar este bloque en Supabase SQL Editor (es idempotente).
-- ============================================

-- 1) Tabla CMS de la sección
CREATE TABLE IF NOT EXISTS cms_operacion_valentia (
  id BIGSERIAL PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION touch_operacion_valentia_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_operacion_valentia ON cms_operacion_valentia;
CREATE TRIGGER trg_touch_operacion_valentia
  BEFORE UPDATE ON cms_operacion_valentia
  FOR EACH ROW EXECUTE FUNCTION touch_operacion_valentia_updated_at();

-- 2) RLS — público lee, anon puede modificar (mismo patrón del resto del CMS)
ALTER TABLE cms_operacion_valentia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_anon" ON cms_operacion_valentia;
CREATE POLICY "select_anon" ON cms_operacion_valentia
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "insert_anon" ON cms_operacion_valentia;
CREATE POLICY "insert_anon" ON cms_operacion_valentia
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "update_anon" ON cms_operacion_valentia;
CREATE POLICY "update_anon" ON cms_operacion_valentia
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_anon" ON cms_operacion_valentia;
CREATE POLICY "delete_anon" ON cms_operacion_valentia
  FOR DELETE TO anon USING (true);

-- 3) Seed inicial con placeholders editables
INSERT INTO cms_operacion_valentia (clave, valor) VALUES
  ('activo', 'true'),
  ('tag', 'Iniciativa ciudadana'),
  ('titulo', 'OPERACIÓN VALENTÍA'),
  ('subtitulo', 'Una campaña por la transparencia, la juventud y la dignidad de Manabí'),
  ('descripcion', 'Operación Valentía es la línea estratégica que articula los esfuerzos legislativos de Valentina Centeno con las necesidades reales de la ciudadanía. Una iniciativa para llevar las voces del territorio al centro del debate nacional.'),
  ('imagen', '/imagenes/operacion-valentia.svg'),
  ('eje_1_titulo', 'Educación digna'),
  ('eje_1_desc', 'Becas, infraestructura y formación técnica para jóvenes de Manabí.'),
  ('eje_2_titulo', 'Salud sin abandono'),
  ('eje_2_desc', 'Acceso a hospitales, medicamentos y atención primaria garantizada.'),
  ('eje_3_titulo', 'Voz ciudadana'),
  ('eje_3_desc', 'Casos del buzón ciudadano convertidos en gestión política real.'),
  ('cta_texto', 'Conocer más'),
  ('cta_link', '/operacion-valentia')
ON CONFLICT (clave) DO NOTHING;

-- ✔ Listo. Verificá con:
-- SELECT * FROM cms_operacion_valentia ORDER BY clave;
