-- ============================================================================
-- T10 · EL JUEGO — RPCs de La Liga de Constancia y El Muro de Hitos
-- ----------------------------------------------------------------------------
-- Dos funciones SECURITY DEFINER que devuelven datos de la cohorte YA
-- ANONIMIZADOS. Los clientes NO leen las tablas de otros (RLS lo impide);
-- estas funciones agregan y anonimizan del lado del servidor, y sólo exponen
-- lo mínimo (alias, esfuerzo, hito, cuándo). El alias es estable por usuario
-- pero irreconocible. `es_tu` marca la fila del que llama (auth.uid()).
--
-- IMPORTANTE: la app FUNCIONA sin esta migración. Sin estos RPCs, la Liga y
-- el Muro muestran sólo el esfuerzo y los hitos propios (del progreso local)
-- y nunca rompen. Al correr este archivo en Supabase, se enciende la capa
-- social (la cohorte completa). Es aditivo y reversible (DROP FUNCTION).
-- ============================================================================

-- ── La Liga de Constancia (esfuerzo de la semana, JAMÁS ventas) ─────────────
-- Puntos = días activos ×10 + sesiones ×5. Semana = lunes (date_trunc week).
CREATE OR REPLACE FUNCTION get_liga_semanal()
RETURNS TABLE (
  alias        text,
  dias_activos int,
  sesiones     int,
  puntos       int,
  es_tu        boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH semana AS (
    SELECT date_trunc('week', now())::date AS lunes
  ),
  dias AS (
    SELECT ua.user_id, COUNT(DISTINCT ua.fecha)::int AS d
    FROM user_activity ua, semana s
    WHERE ua.fecha >= s.lunes
    GROUP BY ua.user_id
  ),
  ses AS (
    SELECT sl.user_id, COUNT(*)::int AS n
    FROM session_logs sl, semana s
    WHERE sl.created_at >= s.lunes
    GROUP BY sl.user_id
  )
  SELECT
    CASE WHEN p.id = auth.uid() THEN 'Vos'
         ELSE 'Fundador ' || upper(substr(md5(p.id::text), 1, 4)) END AS alias,
    COALESCE(d.d, 0)                                       AS dias_activos,
    COALESCE(sn.n, 0)                                      AS sesiones,
    (COALESCE(d.d, 0) * 10 + COALESCE(sn.n, 0) * 5)        AS puntos,
    (p.id = auth.uid())                                    AS es_tu
  FROM profiles p
  LEFT JOIN dias d  ON d.user_id  = p.id
  LEFT JOIN ses  sn ON sn.user_id = p.id
  WHERE p.rol = 'cliente'
    AND (COALESCE(d.d, 0) > 0 OR COALESCE(sn.n, 0) > 0 OR p.id = auth.uid())
  ORDER BY puntos DESC
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION get_liga_semanal() TO authenticated;

-- ── El Muro de Hitos (logros de la cohorte, anónimos, últimos 45 días) ──────
-- Sólo los momentos-quiebre del Camino. meta_codigo::text por si es enum.
CREATE OR REPLACE FUNCTION get_muro_hitos()
RETURNS TABLE (
  alias            text,
  meta_codigo      text,
  fecha_completada date,
  es_tu            boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE WHEN p.id = auth.uid() THEN 'Vos'
         ELSE 'Fundador ' || upper(substr(md5(p.id::text), 1, 4)) END AS alias,
    hr.meta_codigo::text        AS meta_codigo,
    hr.fecha_completada         AS fecha_completada,
    (p.id = auth.uid())         AS es_tu
  FROM hoja_de_ruta hr
  JOIN profiles p ON p.id = hr.usuario_id
  WHERE hr.completada = true
    AND hr.fecha_completada IS NOT NULL
    AND hr.fecha_completada >= current_date - 45
    AND p.rol = 'cliente'
    AND hr.meta_codigo::text IN ('P0.2','P1.3','P1.5','P4.3b','P4.4','P5.4','P6.3','P7.3')
  ORDER BY hr.fecha_completada DESC
  LIMIT 30;
$$;

GRANT EXECUTE ON FUNCTION get_muro_hitos() TO authenticated;

-- Rollback (si hiciera falta):
--   DROP FUNCTION IF EXISTS get_liga_semanal();
--   DROP FUNCTION IF EXISTS get_muro_hitos();
