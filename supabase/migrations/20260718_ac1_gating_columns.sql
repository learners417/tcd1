-- ============================================================================
-- AC1 · EL LOOP AUTOMÁTICO — asegurar las columnas del gateo comercial
-- ----------------------------------------------------------------------------
-- El gateo de la Escalera de Compradores (planes.ts) lee `plan_comercial` y
-- `acceso_hasta` del perfil, y el Admin los escribe — pero no había migración
-- que los cree. Si nunca existieron, el gateo estaba INERTE (todos caían en
-- 'completo' = acceso total). Esta migración los crea de forma idempotente:
-- si ya existen (agregados a mano en Supabase), es un no-op; si no, los crea
-- y el gateo empieza a funcionar de verdad.
--
-- Aditivo y seguro. Rollback no recomendado (borraría datos de plan).
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_comercial text;   -- blanco|amarillo|verde|negro|completo
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_reservado text;   -- plan comprado y reservado (aún no activo)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acceso_hasta  timestamptz; -- fin de la Semana Blanca (o del acceso)
