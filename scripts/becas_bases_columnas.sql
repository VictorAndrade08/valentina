-- ============================================
-- FASE 2 — Bases completas de Becas IA
-- Agrega columnas para cronograma / premios / obligaciones / contacto
-- en la tabla cms_concurso_ia.
-- Idempotente: si las columnas ya existen no las recrea.
-- ============================================

ALTER TABLE public.cms_concurso_ia
  ADD COLUMN IF NOT EXISTS cronograma TEXT,
  ADD COLUMN IF NOT EXISTS premios TEXT,
  ADD COLUMN IF NOT EXISTS obligaciones TEXT,
  ADD COLUMN IF NOT EXISTS contacto TEXT;

-- Seed con contenido stub editable (solo si están vacías).
-- Génesis puede reemplazarlo desde el admin / Contenido / Becas IA.

UPDATE public.cms_concurso_ia
SET
  cronograma = COALESCE(NULLIF(cronograma, ''),
    '1) Apertura de inscripciones: por confirmar' || E'\n' ||
    '2) Cierre de inscripciones: por confirmar' || E'\n' ||
    '3) Evaluación del jurado: por confirmar' || E'\n' ||
    '4) Anuncio de ganadores: por confirmar' || E'\n' ||
    '5) Entrega de la beca: por confirmar'),
  premios = COALESCE(NULLIF(premios, ''),
    '• Beca completa para curso de formación en Inteligencia Artificial.' || E'\n' ||
    '• Mentoría especializada durante el programa.' || E'\n' ||
    '• Certificación oficial al culminar.' || E'\n' ||
    '• Reconocimiento público de la asambleísta.'),
  obligaciones = COALESCE(NULLIF(obligaciones, ''),
    '• Ser estudiante de un colegio de Manabí.' || E'\n' ||
    '• Tener autorización del representante legal.' || E'\n' ||
    '• Completar el formulario en su totalidad.' || E'\n' ||
    '• Asistir al programa de formación si resulta ganador/a.'),
  contacto = COALESCE(NULLIF(contacto, ''),
    'Por consultas, escribí al buzón ciudadano o contactanos por WhatsApp al +593 96 373 0513.')
WHERE TRUE;
