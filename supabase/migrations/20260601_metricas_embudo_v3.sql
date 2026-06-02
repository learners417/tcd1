-- ============================================================================
-- MIGRACIÓN: Mi Embudo de Ventas · Métricas v3
-- Spec "Mi Embudo de Ventas · Métricas":
--   Bloque A (orgánico: posts por plataforma, stories, DMs) + Bloque B (ads)
--   con período explícito (día/semana), ROAS y proyección SERVER-SIDE, y
--   alarmas a Lupe (admins).
--
-- IMPORTANTE: la tabla metricas_v2 NUNCA se había creado en migraciones — el
-- front escribía ahí y fallaba en silencio (las métricas vivían en localStorage).
-- Esta migración la CREA con RLS y redirige get_user_metrics a leerla.
--
-- Depende de notificar_lupe() (creada en 20260601_diario_fundador_v3.sql, que
-- corre antes por orden alfabético).
-- ============================================================================

-- 0. TABLA + RLS -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metricas_v2 (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semana                  TEXT        NOT NULL,  -- ISO week ("2026-W23") o fecha ("2026-06-01") si es día
  -- 9 campos manuales del embudo (bloque B — ads)
  gasto_ads               NUMERIC     DEFAULT 0,
  mensajes_recibidos      INT         DEFAULT 0,
  formularios_completados INT         DEFAULT 0,
  agendados               INT         DEFAULT 0,
  shows                   INT         DEFAULT 0,
  llamadas_tomadas        INT         DEFAULT 0,
  ventas_cerradas         INT         DEFAULT 0,
  ingresos_cobrados       NUMERIC     DEFAULT 0,
  horas_trabajadas_semana NUMERIC     DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, semana)
);

CREATE INDEX IF NOT EXISTS idx_metricas_v2_user ON metricas_v2(user_id);

ALTER TABLE metricas_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metricas_v2_own_read" ON metricas_v2;
CREATE POLICY "metricas_v2_own_read" ON metricas_v2
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "metricas_v2_own_insert" ON metricas_v2;
CREATE POLICY "metricas_v2_own_insert" ON metricas_v2
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "metricas_v2_own_update" ON metricas_v2;
CREATE POLICY "metricas_v2_own_update" ON metricas_v2
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "metricas_v2_own_delete" ON metricas_v2;
CREATE POLICY "metricas_v2_own_delete" ON metricas_v2
  FOR DELETE USING (user_id = auth.uid());

-- 1. COLUMNAS v3 -------------------------------------------------------------
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_periodo_tipo  TEXT DEFAULT 'semana'; -- 'dia' | 'semana'
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_fecha_inicio  DATE;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_fecha_fin     DATE;

ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_posts_reels_ig INT DEFAULT 0;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_posts_feed_ig  INT DEFAULT 0;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_posts_tiktok   INT DEFAULT 0;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_posts_shorts   INT DEFAULT 0;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_posts_facebook INT DEFAULT 0;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_posts_linkedin INT DEFAULT 0;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_stories_ig     INT DEFAULT 0;
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_dms_organicos  INT DEFAULT 0;

ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_ads_plataforma TEXT;

ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_roas           NUMERIC; -- calculado server-side
ALTER TABLE metricas_v2 ADD COLUMN IF NOT EXISTS met_proyeccion_mes NUMERIC; -- calculado server-side

COMMENT ON COLUMN metricas_v2.met_roas IS 'ROAS = ingresos / gasto_ads. Calculado server-side por trg_metricas_kpis.';

-- 2. KPIs SERVER-SIDE (ROAS + proyección) ------------------------------------
CREATE OR REPLACE FUNCTION trg_metricas_kpis()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_dias INT;
BEGIN
  -- ROAS
  IF COALESCE(NEW.gasto_ads, 0) > 0 THEN
    NEW.met_roas := ROUND((NEW.ingresos_cobrados / NEW.gasto_ads)::numeric, 2);
  ELSE
    NEW.met_roas := NULL;
  END IF;

  -- Días del período
  v_dias := CASE
    WHEN NEW.met_fecha_inicio IS NOT NULL AND NEW.met_fecha_fin IS NOT NULL
      THEN GREATEST((NEW.met_fecha_fin - NEW.met_fecha_inicio) + 1, 1)
    WHEN NEW.met_periodo_tipo = 'dia' THEN 1
    ELSE 7
  END;

  -- Proyección mensual = ingresos × (30 / días período)
  NEW.met_proyeccion_mes := ROUND((COALESCE(NEW.ingresos_cobrados, 0) * (30.0 / v_dias))::numeric, 2);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS metricas_kpis_biud ON metricas_v2;
CREATE TRIGGER metricas_kpis_biud
  BEFORE INSERT OR UPDATE ON metricas_v2
  FOR EACH ROW EXECUTE FUNCTION trg_metricas_kpis();

-- 3. ALARMAS al guardar ------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_metricas_alarmas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre   TEXT;
  cnt_roas   INT;
  cnt_ventas INT;
  cnt_show   INT;
  cnt_cierre INT;
  cnt_posts  INT;
BEGIN
  SELECT COALESCE(nombre, 'Cliente') INTO v_nombre FROM profiles WHERE id = NEW.user_id;

  -- (a) ROAS < 2 por 2 períodos seguidos
  SELECT COUNT(*) INTO cnt_roas FROM (
    SELECT met_roas FROM metricas_v2 WHERE user_id = NEW.user_id
    ORDER BY COALESCE(met_fecha_inicio, created_at::date) DESC LIMIT 2
  ) s WHERE met_roas IS NOT NULL AND met_roas < 2;
  IF cnt_roas = 2 THEN
    PERFORM notificar_lupe('Alerta roja · ROAS bajo',
      v_nombre || ': el gasto en ads no se está recuperando (ROAS < 2 por 2 semanas).', '/admin');
  END IF;

  -- (b) 0 ventas cerradas por 3 períodos
  SELECT COUNT(*) INTO cnt_ventas FROM (
    SELECT ventas_cerradas FROM metricas_v2 WHERE user_id = NEW.user_id
    ORDER BY COALESCE(met_fecha_inicio, created_at::date) DESC LIMIT 3
  ) s WHERE COALESCE(ventas_cerradas, 0) = 0;
  IF cnt_ventas = 3 THEN
    PERFORM notificar_lupe('Alerta roja · embudo roto',
      v_nombre || ': 0 ventas cerradas por 3 semanas.', '/admin');
  END IF;

  -- (c) % Show < 50% por 2 períodos
  SELECT COUNT(*) INTO cnt_show FROM (
    SELECT CASE WHEN COALESCE(agendados,0) > 0 THEN (shows::numeric / agendados) * 100 ELSE NULL END AS ps
    FROM metricas_v2 WHERE user_id = NEW.user_id
    ORDER BY COALESCE(met_fecha_inicio, created_at::date) DESC LIMIT 2
  ) s WHERE ps IS NOT NULL AND ps < 50;
  IF cnt_show = 2 THEN
    PERFORM notificar_lupe('Alerta naranja · calidad de leads',
      v_nombre || ': % Show < 50% por 2 semanas.', '/admin');
  END IF;

  -- (d) Tasa de cierre < 10% por 3 períodos
  SELECT COUNT(*) INTO cnt_cierre FROM (
    SELECT CASE WHEN COALESCE(llamadas_tomadas,0) > 0 THEN (ventas_cerradas::numeric / llamadas_tomadas) * 100 ELSE NULL END AS tc
    FROM metricas_v2 WHERE user_id = NEW.user_id
    ORDER BY COALESCE(met_fecha_inicio, created_at::date) DESC LIMIT 3
  ) s WHERE tc IS NOT NULL AND tc < 10;
  IF cnt_cierre = 3 THEN
    PERFORM notificar_lupe('Alerta · script de ventas',
      v_nombre || ': tasa de cierre < 10% por 3 semanas.', '/admin');
  END IF;

  -- (e) 0 posts orgánicos en los 2 últimos períodos (~10 días)
  SELECT COUNT(*) INTO cnt_posts FROM (
    SELECT (COALESCE(met_posts_reels_ig,0)+COALESCE(met_posts_feed_ig,0)+COALESCE(met_posts_tiktok,0)
           +COALESCE(met_posts_shorts,0)+COALESCE(met_posts_facebook,0)+COALESCE(met_posts_linkedin,0)) AS total
    FROM metricas_v2 WHERE user_id = NEW.user_id
    ORDER BY COALESCE(met_fecha_inicio, created_at::date) DESC LIMIT 2
  ) s WHERE total = 0;
  IF cnt_posts = 2 THEN
    PERFORM notificar_lupe('Alerta naranja · sin contenido',
      v_nombre || ': ausencia total de contenido orgánico (0 posts ~10 días).', '/admin');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS metricas_alarmas_aiud ON metricas_v2;
CREATE TRIGGER metricas_alarmas_aiud
  AFTER INSERT OR UPDATE ON metricas_v2
  FOR EACH ROW EXECUTE FUNCTION trg_metricas_alarmas();

-- 4. INACTIVIDAD (métricas no cargadas por 10 días) — cron diario ------------
CREATE OR REPLACE FUNCTION detectar_metricas_inactivas()
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
           MAX(COALESCE(m.met_fecha_fin, m.created_at::date)) AS ultima
    FROM profiles p
    LEFT JOIN metricas_v2 m ON m.user_id = p.id
    WHERE p.rol <> 'admin' AND COALESCE(p.status, 'activo') = 'activo'
    GROUP BY p.id, p.nombre
    HAVING MAX(COALESCE(m.met_fecha_fin, m.created_at::date)) IS NULL
        OR MAX(COALESCE(m.met_fecha_fin, m.created_at::date)) <= CURRENT_DATE - INTERVAL '10 days'
  LOOP
    PERFORM notificar_lupe('Cliente sin métricas',
      r.nombre || ' lleva 10+ días sin cargar métricas.', '/admin');
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION detectar_metricas_inactivas() TO authenticated;

-- 5. RPC del admin: leer las métricas v3 de un cliente -----------------------
-- get_user_metrics existía leyendo la tabla vieja `metricas` (singular). Se
-- redirige a metricas_v2 para que el dashboard de Lupe vea los datos nuevos.
DROP FUNCTION IF EXISTS get_user_metrics(UUID);
CREATE OR REPLACE FUNCTION get_user_metrics(target_user_id UUID)
RETURNS SETOF metricas_v2
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM metricas_v2 WHERE user_id = target_user_id
  ORDER BY COALESCE(met_fecha_inicio, created_at::date);
$$;

GRANT EXECUTE ON FUNCTION get_user_metrics(UUID) TO authenticated;
