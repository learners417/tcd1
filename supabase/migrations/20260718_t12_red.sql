-- ============================================================================
-- T12 · LA RED — La Semana Blanca regalable + La Herencia de la cohorte
-- ----------------------------------------------------------------------------
-- Dos tablas nuevas y sus RPCs. Todo aditivo e idempotente (CREATE ... IF NOT
-- EXISTS + DROP POLICY IF EXISTS). La app FUNCIONA sin esta migración: la
-- página La Red muestra estados vacíos y nunca rompe. Al aplicarla, se
-- encienden las llaves (con límite 2/mes y atribución) y la Herencia anónima.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS generar_invitacion();
--   DROP FUNCTION IF EXISTS redimir_invitacion(text);
--   DROP FUNCTION IF EXISTS get_herencia();
--   DROP TABLE IF EXISTS invitaciones;
--   DROP TABLE IF EXISTS herencia_cohorte;
-- ============================================================================

-- ── Invitaciones (la Semana Blanca regalable) ───────────────────────────────
CREATE TABLE IF NOT EXISTS invitaciones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitador_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo       text NOT NULL UNIQUE,
  invitado_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estado       text NOT NULL DEFAULT 'pendiente',   -- 'pendiente' | 'redimida'
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;

-- El fundador lee sólo SUS invitaciones (la generación/redención van por RPC).
DROP POLICY IF EXISTS "invitaciones_owner_select" ON invitaciones;
CREATE POLICY "invitaciones_owner_select" ON invitaciones
  FOR SELECT USING (auth.uid() = invitador_id);

-- Genera una llave nueva (máx 2 en el mes calendario). Devuelve el código.
CREATE OR REPLACE FUNCTION generar_invitacion()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_count  int;
  v_codigo text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT count(*) INTO v_count
  FROM invitaciones
  WHERE invitador_id = v_uid
    AND created_at >= date_trunc('month', now());

  IF v_count >= 2 THEN
    RAISE EXCEPTION 'limite mensual de llaves alcanzado';
  END IF;

  v_codigo := upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 8));

  INSERT INTO invitaciones (invitador_id, codigo, estado)
  VALUES (v_uid, v_codigo, 'pendiente');

  RETURN v_codigo;
END;
$$;

GRANT EXECUTE ON FUNCTION generar_invitacion() TO authenticated;

-- Redime una llave: marca la invitación como redimida con el que la usa.
-- Idempotente y seguro: sólo si está pendiente, sin redimir, y no es propia.
CREATE OR REPLACE FUNCTION redimir_invitacion(p_codigo text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR p_codigo IS NULL THEN
    RETURN false;
  END IF;

  UPDATE invitaciones
  SET invitado_id = v_uid, estado = 'redimida'
  WHERE codigo = p_codigo
    AND estado = 'pendiente'
    AND invitado_id IS NULL
    AND invitador_id <> v_uid;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION redimir_invitacion(text) TO authenticated;

-- ── La Herencia de la cohorte (objeciones/hooks reales, anónimos) ───────────
CREATE TABLE IF NOT EXISTS herencia_cohorte (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo       text NOT NULL DEFAULT 'objecion',   -- 'objecion' | 'hook'
  texto      text NOT NULL,
  respuesta  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE herencia_cohorte ENABLE ROW LEVEL SECURITY;

-- El fundador inserta sólo con su propia autoría (la lectura va por RPC anónimo).
DROP POLICY IF EXISTS "herencia_insert_own" ON herencia_cohorte;
CREATE POLICY "herencia_insert_own" ON herencia_cohorte
  FOR INSERT WITH CHECK (auth.uid() = autor_id);

-- La Herencia anonimizada (alias estable irreconocible + es_tu vía auth.uid()).
CREATE OR REPLACE FUNCTION get_herencia()
RETURNS TABLE (
  id         uuid,
  alias      text,
  tipo       text,
  texto      text,
  respuesta  text,
  created_at timestamptz,
  es_tu      boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    h.id,
    CASE WHEN h.autor_id = auth.uid() THEN 'Vos'
         ELSE 'Fundador ' || upper(substr(md5(h.autor_id::text), 1, 4)) END AS alias,
    h.tipo::text        AS tipo,
    h.texto             AS texto,
    h.respuesta         AS respuesta,
    h.created_at        AS created_at,
    (h.autor_id = auth.uid()) AS es_tu
  FROM herencia_cohorte h
  ORDER BY h.created_at DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION get_herencia() TO authenticated;
