-- ============================================================================
-- MIGRACIÓN: Diario del Fundador v3
-- Spec "Diario del Fundador" — reemplazo del cuestionario por:
--   energía + 3 dimensiones (cuerpo/mente/emociones) + logro + tags + checkeos
--   + bloqueo, con Score 0–100 calculado SERVER-SIDE y alarmas a Lupe (admins).
-- Aditiva: conserva las columnas previas de diario_entradas.
-- ============================================================================

-- 1. COLUMNAS NUEVAS ---------------------------------------------------------
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_cuerpo     INT;          -- 1–10
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_mente      INT;          -- 1–10
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_emociones  INT;          -- 1–10
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_logro      TEXT;         -- inmutable post-guardado (se aplica en el front)
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_tareas     TEXT[] DEFAULT '{}';  -- ids de tags multi-select
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_checkeos   TEXT[] DEFAULT '{}';  -- ids de chips bio
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_bloqueo    TEXT;         -- opcional
ALTER TABLE diario_entradas ADD COLUMN IF NOT EXISTS diario_score      INT;          -- 0–100, calculado server-side

COMMENT ON COLUMN diario_entradas.diario_score IS 'Score 0–100 calculado server-side por trigger trg_diario_score. No confiar en el valor enviado por el cliente.';

-- 2. CÁLCULO DEL SCORE (espejo exacto de src/lib/diarioCalcs.ts) -------------
-- score = 0.25 * (energiaNorm + prom3Norm + focoNegocio + checkeosComp), 0–100
CREATE OR REPLACE FUNCTION calcular_diario_score(
  p_energia    INT,
  p_cuerpo     INT,
  p_mente      INT,
  p_emociones  INT,
  p_tareas     TEXT[],
  p_checkeos   TEXT[]
)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  -- tags que NO cuentan como negocio
  no_negocio   TEXT[] := ARRAY['admin_gestion', 'descanso_intencional'];
  -- checkeos que restan bienestar
  negativos    TEXT[] := ARRAY['ansioso', 'solo'];
  checkeos_pos_total CONSTANT NUMERIC := 6;  -- nº de chips positivos

  energia_norm NUMERIC;
  prom3_norm   NUMERIC;
  foco         NUMERIC := 0;
  checkeos_comp NUMERIC;

  total_tareas INT;
  tareas_neg   INT;
  pos_count    INT := 0;
  neg_count    INT := 0;
  neto         NUMERIC;
  t            TEXT;
BEGIN
  energia_norm := (LEAST(GREATEST(COALESCE(p_energia, 0), 0), 10) / 10.0) * 100;
  prom3_norm   := ((COALESCE(p_cuerpo, 0) + COALESCE(p_mente, 0) + COALESCE(p_emociones, 0)) / 3.0 / 10.0) * 100;

  -- Foco en negocio
  total_tareas := COALESCE(array_length(p_tareas, 1), 0);
  IF total_tareas > 0 THEN
    tareas_neg := 0;
    FOREACH t IN ARRAY p_tareas LOOP
      IF t = ANY (no_negocio) THEN tareas_neg := tareas_neg + 1; END IF;
    END LOOP;
    foco := ((total_tareas - tareas_neg)::NUMERIC / total_tareas) * 100;
  END IF;

  -- Checkeos: positivos - negativos*0.5, clamp [0, total], normalizado a 0–100
  IF p_checkeos IS NOT NULL THEN
    FOREACH t IN ARRAY p_checkeos LOOP
      IF t = ANY (negativos) THEN neg_count := neg_count + 1;
      ELSE pos_count := pos_count + 1; END IF;
    END LOOP;
  END IF;
  neto := LEAST(GREATEST(pos_count - neg_count * 0.5, 0), checkeos_pos_total);
  checkeos_comp := (neto / checkeos_pos_total) * 100;

  RETURN ROUND(LEAST(GREATEST(0.25 * (energia_norm + prom3_norm + foco + checkeos_comp), 0), 100));
END;
$$;

-- Trigger: recalcula el score en cada insert/update, ignorando lo que mande el cliente.
CREATE OR REPLACE FUNCTION trg_diario_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.diario_score := calcular_diario_score(
    COALESCE(NEW.energia_nivel, 0),
    NEW.diario_cuerpo, NEW.diario_mente, NEW.diario_emociones,
    NEW.diario_tareas, NEW.diario_checkeos
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS diario_score_biud ON diario_entradas;
CREATE TRIGGER diario_score_biud
  BEFORE INSERT OR UPDATE ON diario_entradas
  FOR EACH ROW EXECUTE FUNCTION trg_diario_score();

-- 3. HELPER: notificar a Lupe (todos los admins) ----------------------------
-- Inserta una notificación 'admin' para cada profile con rol='admin'.
-- Idempotente por día+título: no repite la misma alarma el mismo día.
CREATE OR REPLACE FUNCTION notificar_lupe(
  p_titulo      TEXT,
  p_descripcion TEXT,
  p_accion_url  TEXT DEFAULT '/admin'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  FOR admin_id IN SELECT id FROM profiles WHERE rol = 'admin' LOOP
    IF NOT EXISTS (
      SELECT 1 FROM notificaciones
      WHERE usuario_id = admin_id
        AND titulo = p_titulo
        AND created_at::date = CURRENT_DATE
    ) THEN
      INSERT INTO notificaciones (usuario_id, tipo, titulo, descripcion, accion_url)
      VALUES (admin_id, 'admin', p_titulo, p_descripcion, p_accion_url);
    END IF;
  END LOOP;
END;
$$;

-- 4. DETECCIÓN DE ALARMAS al guardar -----------------------------------------
-- Evalúa las rachas terminando en la entrada recién guardada y, cuando una
-- condición CRUZA su umbral exacto, avisa a Lupe (una vez, vía notificar_lupe).
CREATE OR REPLACE FUNCTION trg_diario_alarmas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre        TEXT;
  cnt_energia     INT;
  cnt_score       INT;
  cnt_equilibrio  INT;
  cnt_bloqueo     INT;
  cnt_sin_negocio INT;
  no_negocio      TEXT[] := ARRAY['admin_gestion', 'descanso_intencional'];
BEGIN
  SELECT COALESCE(nombre, 'Cliente') INTO v_nombre FROM profiles WHERE id = NEW.user_id;

  -- (a) Energía ≤ 3 por 3 días seguidos
  SELECT COUNT(*) INTO cnt_energia FROM (
    SELECT energia_nivel FROM diario_entradas
    WHERE user_id = NEW.user_id ORDER BY fecha DESC LIMIT 3
  ) s WHERE energia_nivel <= 3;
  IF cnt_energia = 3 THEN
    PERFORM notificar_lupe(
      'Alerta roja · energía baja',
      v_nombre || ' lleva 3 días con energía ≤ 3. Revisá su estado.',
      '/admin');
  END IF;

  -- (b) Score < 40 por 3 días
  SELECT COUNT(*) INTO cnt_score FROM (
    SELECT diario_score FROM diario_entradas
    WHERE user_id = NEW.user_id ORDER BY fecha DESC LIMIT 3
  ) s WHERE diario_score < 40;
  IF cnt_score = 3 THEN
    PERFORM notificar_lupe(
      'Alerta naranja · rendimiento bajo',
      v_nombre || ' tiene score < 40 por 3 días seguidos.',
      '/admin');
  END IF;

  -- (c) Equilibrio integral < 3 por 5 días
  SELECT COUNT(*) INTO cnt_equilibrio FROM (
    SELECT (COALESCE(diario_cuerpo,0) + COALESCE(diario_mente,0) + COALESCE(diario_emociones,0)) / 3.0 AS eq
    FROM diario_entradas
    WHERE user_id = NEW.user_id ORDER BY fecha DESC LIMIT 5
  ) s WHERE eq < 3;
  IF cnt_equilibrio = 5 THEN
    PERFORM notificar_lupe(
      'Alerta roja · riesgo de abandono',
      v_nombre || ' tiene equilibrio integral < 3 por 5 días. Riesgo de abandono.',
      '/admin');
  END IF;

  -- (d) Mismo bloqueo 3 días seguidos (texto no vacío, normalizado)
  SELECT COUNT(*) INTO cnt_bloqueo FROM (
    SELECT lower(btrim(diario_bloqueo)) AS b FROM diario_entradas
    WHERE user_id = NEW.user_id ORDER BY fecha DESC LIMIT 3
  ) s
  WHERE b IS NOT NULL AND b <> ''
    AND b = lower(btrim(NEW.diario_bloqueo));
  IF NEW.diario_bloqueo IS NOT NULL AND btrim(NEW.diario_bloqueo) <> '' AND cnt_bloqueo = 3 THEN
    PERFORM notificar_lupe(
      'Alerta naranja · bloqueo recurrente',
      v_nombre || ' repitió el mismo bloqueo 3 días: "' || left(NEW.diario_bloqueo, 80) || '".',
      '/admin');
  END IF;

  -- (e) 0 tags de negocio por 7 días
  SELECT COUNT(*) INTO cnt_sin_negocio FROM (
    SELECT diario_tareas FROM diario_entradas
    WHERE user_id = NEW.user_id ORDER BY fecha DESC LIMIT 7
  ) s
  WHERE NOT EXISTS (
    SELECT 1 FROM unnest(s.diario_tareas) tg
    WHERE tg <> ALL (no_negocio)
  );
  IF cnt_sin_negocio = 7 THEN
    PERFORM notificar_lupe(
      'Alerta · sin trabajo de negocio',
      v_nombre || ' lleva 7 días sin ninguna tarea de negocio.',
      '/admin');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS diario_alarmas_aiud ON diario_entradas;
CREATE TRIGGER diario_alarmas_aiud
  AFTER INSERT OR UPDATE ON diario_entradas
  FOR EACH ROW EXECUTE FUNCTION trg_diario_alarmas();

-- 5. INACTIVIDAD (3 días sin llenar) — requiere invocación programada --------
-- No se puede disparar en un trigger de INSERT (insertar = sí llenó). Pensada
-- para un cron diario (pg_cron o Vercel Cron → RPC). Avisa a Lupe por cada
-- cliente activo cuya última entrada sea de hace >= 3 días.
CREATE OR REPLACE FUNCTION detectar_diario_inactivo()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  n INT := 0;
BEGIN
  FOR r IN
    SELECT p.id, COALESCE(p.nombre, 'Cliente') AS nombre,
           MAX(d.fecha) AS ultima
    FROM profiles p
    LEFT JOIN diario_entradas d ON d.user_id = p.id
    WHERE p.rol <> 'admin' AND COALESCE(p.status, 'activo') = 'activo'
    GROUP BY p.id, p.nombre
    HAVING MAX(d.fecha) IS NULL OR MAX(d.fecha) <= CURRENT_DATE - INTERVAL '3 days'
  LOOP
    PERFORM notificar_lupe(
      'Cliente sin diario',
      r.nombre || ' lleva 3+ días sin llenar el diario.',
      '/admin');
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION calcular_diario_score(INT, INT, INT, INT, TEXT[], TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION detectar_diario_inactivo() TO authenticated;

-- 6. BACKFILL: recalcular score de filas existentes que ya tengan dimensiones
UPDATE diario_entradas
SET diario_score = calcular_diario_score(
  COALESCE(energia_nivel, 0), diario_cuerpo, diario_mente, diario_emociones,
  COALESCE(diario_tareas, '{}'), COALESCE(diario_checkeos, '{}'))
WHERE diario_cuerpo IS NOT NULL;
