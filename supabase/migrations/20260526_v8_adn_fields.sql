-- ─── Migración: ADN v8 — 9 campos nuevos del documento maestro ───────────────
-- Agrega los campos del ADN v8 (Hoja de Ruta v8 — mejoras.html · mayo 2026).
-- Ver src/lib/adnSchema.ts y src/lib/supabase.ts (ProfileV2) para mapping completo.
-- SOLO agrega columnas — no elimina ni modifica columnas existentes.
-- Idempotente: se puede correr varias veces sin efectos secundarios.

-- ── Sección ID · Identidad · P1-P3 ────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_historia_cruda          text;  -- P1.2b — 500 palabras sin IA (crítico Día 45)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_diagnostico_capa        jsonb; -- P2.4 — síes con horas/semana + costo energético
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_cinco_no                jsonb; -- P2.5 — 5 NO concretos + 5 escenarios (crítico Día 45)

-- ── Sección IRR · Irresistible · P4-P7 ────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_avatar_conexion_historia text; -- P4.4 — cruce linea_tiempo × avatar_journey (crítico Día 45)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_mercado                  text; -- P5.2 — nivel 1 del embudo (Mercado → Nicho → Micronicho → Avatar)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_metodo_mapeo_obstaculos  jsonb; -- P7.4 — obstáculos B → pasos del método

-- ── Sección NEG · Negocio · P8 ────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_oferta_ultralow          jsonb; -- P8.3 — 5ta oferta de la escalera $17-47 DIY (crítico Día 45)

-- ── Sección INF · Infraestructura · P9A ───────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_validacion_organica      jsonb; -- P9A.4 — { piezas: [{ id, fecha, nivel, views_72h, comments, saves, dms }], pieza_ganadora_id }

-- ── Sección META · Onboarding · P0 ────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adn_autoevaluacion_dia1      jsonb; -- P0.2 — array 8 scores 1-5 (Foto de Partida, comparación Día 45)

-- ── Comentarios para documentación ────────────────────────────────────────────
COMMENT ON COLUMN profiles.adn_historia_cruda IS 'P1.2b · Historia personal escrita SIN IA en 500 palabras. Preserva la confrontación cruda. Crítico Día 45.';
COMMENT ON COLUMN profiles.adn_diagnostico_capa IS 'P2.4 · Síndrome de la capa. Array de SÍes con horas_semana + costo_energetico (1-10). IA calcula costo acumulado.';
COMMENT ON COLUMN profiles.adn_cinco_no IS 'P2.5 · Filtro del NO. 5 NOs concretos a 90 días + 5 escenarios de práctica con feedback IA. Crítico Día 45.';
COMMENT ON COLUMN profiles.adn_avatar_conexion_historia IS 'P4.4 · Conexión emocional avatar ↔ historia. Cruza IDlinea_tiempo × IRRavatar_journey. Crítico Día 45.';
COMMENT ON COLUMN profiles.adn_mercado IS 'P5.2 · Nivel 1 del embudo (más amplio). Ej: "negocios", "salud", "educación".';
COMMENT ON COLUMN profiles.adn_metodo_mapeo_obstaculos IS 'P7.4 · Matriz: cada obstáculo de Matriz B mapeado al paso del método que lo resuelve.';
COMMENT ON COLUMN profiles.adn_oferta_ultralow IS 'P8.3 · 5ta oferta. $17-47. DIY. JSON: { nombre, precio, duracion, modulos, resultado, bonus, garantia, nivel_acompanamiento: "DIY", horas_mes_consume }. Crítico Día 45.';
COMMENT ON COLUMN profiles.adn_validacion_organica IS 'P9A.4 · Validación orgánica obligatoria antes de Meta Ads. Schema: { piezas: [{ id, fecha, nivel: "N1"|"N2"|"N3", views_72h, comments, saves, dms }], pieza_ganadora_id }. Mínimo 3 piezas para desbloquear P9A.5.';
COMMENT ON COLUMN profiles.adn_autoevaluacion_dia1 IS 'P0.2 · Foto de Partida. Array 8 scores (1-5) en 8 dimensiones: historia, propósito, legado, avatar, método, escalera, contenido, sistema. Se compara con ADN real al día 45.';
