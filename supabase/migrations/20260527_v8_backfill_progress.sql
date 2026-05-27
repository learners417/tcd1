-- ─── Migración: v8 — Backfill de progreso para clientes con avance previo ───
--
-- PROBLEMA: la migración v8 inicial insertó tareas NUEVAS en medio de pilares
-- que muchos clientes ya tenían cerrados. Como `isPilarCompletado()` requiere
-- TODAS las metas con completada=true, los pilares previamente cerrados ahora
-- aparecen pendientes y bloquean el avance. Caso reportado: Sol estaba en P9A
-- y vio Pilar 1 (Historia) y Pilar 3 (Legado) con candado.
--
-- SOLUCIÓN: auto-completar las nuevas metas v8 usando los datos del perfil
-- como evidencia de que el cliente ya pasó por ese contenido en v7. No tocamos
-- ningún campo del ADN — sólo escribimos en `hoja_de_ruta` para que la lógica
-- de pilar completado se restaure.
--
-- TAREAS BACKFILLEADAS (11):
--   P0.2  · Foto de Partida           → si tiene P0.1 completo (cliente avanzado)
--   P0.3  · Welcome Wizard            → idem (es non-star, igual la marcamos)
--   P1.2b · Historia cruda            → si tiene historia_300 escrita
--   P2.4  · Diagnóstico de la Capa    → si tiene propósito escrito
--   P2.5  · Filtro del NO (5 NO)      → si tiene COACH P2 cerrado (P2.6)
--   P4.4  · Conexión avatar↔historia  → si tiene adn_avatar lleno
--   P5.3  · Generador PUV separado    → si tiene adn_usp lleno
--   P7.4  · Mapeo Obstáculos→Pasos    → si tiene metodo_pasos escrito
--   P8.3  · Diseñador Ultra Low Ticket → si ya empezó P9A (cliente en F4)
--   P8.7  · Matemática $10K           → si tiene adn_escenarios_roas escrito
--   P8.8  · Mapa Mamuska              → si ya empezó P9A (3 primeras metas)
--
-- TAREAS NO BACKFILLEADAS (deben hacerse en su momento natural):
--   P9A.4 · Validación orgánica       → requiere 3 piezas con métricas reales
--   P9A.5 · Configuración Meta Ads    → bloqueado por P9A.4 por diseño
--
-- Idempotente · transaccional · usa ON CONFLICT DO NOTHING. Re-correr la
-- migración es seguro: si una fila ya existe, no se duplica ni se sobreescribe.

BEGIN;

-- ── P0.2 · Foto de Partida · clientes ya avanzados ────────────────────────
-- Para clientes que YA estaban en día > 7 al momento de la migración v8, no
-- tiene sentido pedirles "el snapshot del día 1". Marcamos la tarea como
-- completada en hoja_de_ruta SIN poblar `adn_autoevaluacion_dia1` (así el
-- banner de comparación día 45 no aparece para ellos · sólo para usuarios v8).
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT h.usuario_id, 0, 'P0.2', true, NOW(), true
FROM hoja_de_ruta h
WHERE h.pilar_numero = 0 AND h.meta_codigo = 'P0.1' AND h.completada = true
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P0.3 · Welcome Wizard · idem ──────────────────────────────────────────
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT h.usuario_id, 0, 'P0.3', true, NOW(), false
FROM hoja_de_ruta h
WHERE h.pilar_numero = 0 AND h.meta_codigo = 'P0.1' AND h.completada = true
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P1.2b · Historia cruda ─────────────────────────────────────────────────
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT p.id, 1, 'P1.2b', true, NOW(), true
FROM profiles p
WHERE p.historia_300 IS NOT NULL AND length(trim(p.historia_300)) > 0
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P2.4 · Diagnóstico de la Capa ─────────────────────────────────────────
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT p.id, 2, 'P2.4', true, NOW(), true
FROM profiles p
WHERE p.proposito IS NOT NULL AND length(trim(p.proposito)) > 0
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P2.5 · Filtro del NO (5 NO) ───────────────────────────────────────────
-- Usamos como prueba la COACH P2.6 (que en v7 era P2.4). Si la tiene cerrada,
-- el cliente ya validó propósito y por ende también el "filtro" implícito.
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT h.usuario_id, 2, 'P2.5', true, NOW(), true
FROM hoja_de_ruta h
WHERE h.pilar_numero = 2 AND h.meta_codigo = 'P2.6' AND h.completada = true
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P4.4 · Conexión emocional avatar ↔ historia ───────────────────────────
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT p.id, 4, 'P4.4', true, NOW(), true
FROM profiles p
WHERE p.adn_avatar IS NOT NULL
  AND p.adn_avatar::text NOT IN ('{}', 'null', '')
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P5.3 · Generador PUV (ahora separado del Embudo) ──────────────────────
-- En v7 la PUV se generaba dentro de P5.2 (combinado con Nicho). Si el cliente
-- tiene adn_usp lleno, ya pasó por esa lógica · auto-completamos P5.3.
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT p.id, 5, 'P5.3', true, NOW(), true
FROM profiles p
WHERE p.adn_usp IS NOT NULL AND length(trim(p.adn_usp)) > 0
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P7.4 · Mapeo Obstáculos B → Pasos del método ──────────────────────────
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT p.id, 7, 'P7.4', true, NOW(), true
FROM profiles p
WHERE p.metodo_pasos IS NOT NULL AND length(trim(p.metodo_pasos)) > 0
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P8.7 · Matemática $10K (benchmarks 2026) ──────────────────────────────
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT p.id, 8, 'P8.7', true, NOW(), true
FROM profiles p
WHERE p.adn_escenarios_roas IS NOT NULL AND length(trim(p.adn_escenarios_roas)) > 0
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P8.3 · Diseñador Ultra Low Ticket ─────────────────────────────────────
-- 5ta oferta totalmente nueva en v8. Para clientes que YA estaban en F4 (P9A.x)
-- al momento de la migración, no podemos pedirles que vuelvan a diseñar una
-- oferta inexistente. Marcamos la tarea como completada para desbloquear su
-- flujo · el campo `adn_oferta_ultralow` queda vacío y pueden completarlo
-- después si quieren agregar esa oferta a su escalera.
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT DISTINCT h.usuario_id, 8, 'P8.3', true, NOW(), true
FROM hoja_de_ruta h
WHERE h.pilar_numero = 9
  AND h.meta_codigo IN ('P9A.1', 'P9A.2', 'P9A.3')
  AND h.completada = true
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── P8.8 · Mapa Mamuska ───────────────────────────────────────────────────
-- Si ya empezaron P9A.1/.2/.3 (infraestructura), conceptualmente cerraron F3 ·
-- el Mamuska es una verificación cruzada de cosas que ya hicieron, sin datos
-- nuevos del ADN. Auto-completar para no bloquearles el flujo.
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT DISTINCT h.usuario_id, 8, 'P8.8', true, NOW(), true
FROM hoja_de_ruta h
WHERE h.pilar_numero = 9
  AND h.meta_codigo IN ('P9A.1', 'P9A.2', 'P9A.3')
  AND h.completada = true
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

COMMIT;

-- ── Verificación post-migración ────────────────────────────────────────────
-- Ejecutar manualmente:
--   SELECT meta_codigo, COUNT(*) FROM hoja_de_ruta
--   WHERE pilar_numero IN (1,2,4,5,7,8) AND completada = true
--   GROUP BY meta_codigo ORDER BY meta_codigo;
-- Esperado: P1.2b, P2.4, P2.5, P4.4, P5.3, P7.4, P8.7, P8.8 con conteos > 0
-- para los clientes que tenían avance previo en esos pilares.
