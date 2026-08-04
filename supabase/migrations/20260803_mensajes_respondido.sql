-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN: Registro de respuesta en mensajes (Turno 1 — el cableado)
-- Correr en Supabase SQL Editor.
--
-- POR QUÉ: la bandeja "quién espera respuesta" necesita saber CUÁNDO
-- se respondió cada mensaje entrante del cliente, para (a) mostrar el
-- reloj de espera y (b) calcular el tiempo de respuesta promedio del
-- equipo. Hoy la tabla `mensajes` no lo registra.
--
-- CÓMO: un trigger estampa `respondido_en` sobre los mensajes ENTRANTES
-- del cliente cuando un miembro del equipo (rol='admin') le responde.
-- El trigger es la fuente de verdad: no importa desde qué pantalla del
-- código se envíe la respuesta, el reloj se apaga igual.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. Columnas nuevas en `mensajes`
-- ───────────────────────────────────────────────────────────────
ALTER TABLE mensajes
  ADD COLUMN IF NOT EXISTS respondido_en  TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS respondido_por UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Índice para la bandeja "quién espera respuesta": mensajes entrantes
-- todavía sin responder, ordenados por antigüedad (el reloj manda).
CREATE INDEX IF NOT EXISTS idx_mensajes_sin_responder
  ON mensajes(created_at)
  WHERE respondido_en IS NULL AND receptor_id IS NULL;

-- ───────────────────────────────────────────────────────────────
-- 2. Trigger: al responder un admin, apagar el reloj de ese cliente
--    Se dispara en cada INSERT de mensajes. Si el emisor es admin y hay
--    un receptor (cliente), marca como respondidos todos los mensajes
--    previos de ese cliente que seguían en cero.
--    Cross-canal a propósito: cubre 'privado' y 'Consultas Generales'
--    (el cliente escribe en uno, el equipo a veces responde en otro).
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION marcar_mensajes_respondidos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo actúa cuando quien envía es del equipo y le escribe a un cliente.
  IF NEW.receptor_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM profiles WHERE id = NEW.emisor_id AND rol = 'admin')
  THEN
    UPDATE mensajes
       SET respondido_en  = NEW.created_at,
           respondido_por = NEW.emisor_id
     WHERE emisor_id   = NEW.receptor_id      -- mensajes de ESE cliente
       AND respondido_en IS NULL              -- que seguían sin respuesta
       AND created_at <= NEW.created_at        -- anteriores a esta respuesta
       AND canal IN ('privado', 'consultas', 'Consultas Generales');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marcar_respondidos ON mensajes;
CREATE TRIGGER trg_marcar_respondidos
  AFTER INSERT ON mensajes
  FOR EACH ROW
  EXECUTE FUNCTION marcar_mensajes_respondidos();

-- ───────────────────────────────────────────────────────────────
-- 3. Backfill histórico (best-effort)
--    Para conversaciones ya existentes: si un mensaje entrante del
--    cliente YA tiene una respuesta posterior del equipo, estampamos
--    respondido_en = la fecha de esa primera respuesta. Así el tiempo
--    de respuesta histórico no queda todo como "pendiente".
-- ───────────────────────────────────────────────────────────────
WITH respuestas AS (
  SELECT
    m.id,
    (SELECT r.created_at
       FROM mensajes r
       JOIN profiles p ON p.id = r.emisor_id AND p.rol = 'admin'
      WHERE r.receptor_id = m.emisor_id
        AND r.created_at >= m.created_at
      ORDER BY r.created_at ASC
      LIMIT 1) AS primera_respuesta,
    (SELECT r.emisor_id
       FROM mensajes r
       JOIN profiles p ON p.id = r.emisor_id AND p.rol = 'admin'
      WHERE r.receptor_id = m.emisor_id
        AND r.created_at >= m.created_at
      ORDER BY r.created_at ASC
      LIMIT 1) AS quien_respondio
  FROM mensajes m
  WHERE m.receptor_id IS NULL
    AND m.respondido_en IS NULL
    AND m.canal IN ('privado', 'consultas', 'Consultas Generales')
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = m.emisor_id AND p.rol = 'cliente')
)
UPDATE mensajes m
   SET respondido_en  = r.primera_respuesta,
       respondido_por = r.quien_respondio
  FROM respuestas r
 WHERE m.id = r.id
   AND r.primera_respuesta IS NOT NULL;
