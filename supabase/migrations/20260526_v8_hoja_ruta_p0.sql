-- ─── Migración: v8 — Renumerado de meta_codigo en hoja_de_ruta ───────────────
-- v8 (mejoras.html · mayo 2026) inserta nuevas HERRAMIENTAS antes de los COACH
-- en varios pilares, desplazando los COACH a códigos posteriores. Esta migración
-- renombra los meta_codigo de los COACH existentes para preservar el progreso
-- del usuario sin que aparezcan tareas "abandonadas" en la UI.
--
-- También maneja el reorden completo de P0 (de 2 a 5 tareas) y backfill P0.0.
--
-- Cambios v7 → v8:
--
--   P0 · de 2 a 5 tareas (reorden completo)
--     v7 P0.1 (VIDEO bienvenida)        → v8 P0.4 (VIDEO operativo)
--     v7 P0.2 (HERR formulario)         → v8 P0.1 (HERR formulario)
--     v8 P0.0 NUEVO (VIDEO filosófico)  ← backfill si v7 P0.1 estaba completo
--     v8 P0.2 NUEVO (HERR Foto Partida) — sin registros previos
--     v8 P0.3 NUEVO (HERR Welcome Wizard) — sin registros previos
--
--   P2 · COACH desplazado por nuevos HERR
--     v7 P2.4 (COACH Test propósito)    → v8 P2.6 (COACH)
--     v8 P2.4 NUEVO (HERR Diagnóstico Capa)
--     v8 P2.5 NUEVO (HERR Filtro del NO)
--
--   P4 · COACH desplazado por nuevo HERR
--     v7 P4.4 (COACH Validación avatar) → v8 P4.5 (COACH)
--     v8 P4.4 NUEVO (HERR Conexión avatar ↔ historia)
--
--   P5 · COACH desplazado, PUV separado del Embudo
--     v7 P5.3 (COACH Test diferenciación) → v8 P5.4 (COACH)
--     v8 P5.3 NUEVO (HERR Generador de PUV — separado del Embudo)
--
--   P7 · COACH desplazado por nuevo HERR
--     v7 P7.4 (COACH Naming método)     → v8 P7.5 (COACH)
--     v8 P7.4 NUEVO (HERR Mapeo Obstáculos B → Pasos)
--
--   P8 · Reestructura completa (4 → 9 tareas)
--     v7 P8.3 (HERR High+Low+Lead)      → v8 P8.4 (HERR Lead Magnet) +
--                                          v8 P8.5 (HERR Low) + v8 P8.6 (HERR High)
--     v7 P8.4 (COACH Validación precios) → v8 P8.9 (COACH)
--     v8 P8.3 NUEVO (HERR Ultra Low)
--     v8 P8.7 NUEVO (HERR Matemática $10K)
--     v8 P8.8 NUEVO (HERR Mapa Mamuska)
--
--   P9A · Refactor parcial (Genius Contenido → Validación orgánica)
--     v7 P9A.4 (HERR Genius Contenido)  → v8 P9A.3 ya cubre N1/N2/N3 (eliminado)
--     v7 P9A.5 (COACH revisión embudo)  → v8 P9A.6 (COACH, mantiene revisión)
--     v8 P9A.4 NUEVO (HERR Validación orgánica · OBLIGATORIO)
--     v8 P9A.5 NUEVO (HERR Configuración Meta Ads · BLOQUEADO sin P9A.4)
--
-- Nota P8.3: dato preexistente con meta_codigo='P8.3' contenía el output
-- generado de High+Low+Lead (JSON). En v8 esa tarea se divide en 3 (P8.4-P8.6).
-- Preservamos el registro como P8.4 (Lead Magnet) y dejamos al usuario completar
-- P8.5 y P8.6 con los datos del JSON ya almacenado en oferta_low/oferta_high.
--
-- Idempotente · transaccional. Si los UPDATE no afectan filas (porque ya fue
-- corrido), no pasa nada. ON CONFLICT DO NOTHING en los INSERT.

BEGIN;

-- ── Paso 1 · P0 — Swap P0.1 ↔ P0.2 (vía tmp) ─────────────────────────────────
UPDATE hoja_de_ruta SET meta_codigo = 'P0.4_TMP_V8' WHERE pilar_numero = 0 AND meta_codigo = 'P0.1';
UPDATE hoja_de_ruta SET meta_codigo = 'P0.1'        WHERE pilar_numero = 0 AND meta_codigo = 'P0.2';
UPDATE hoja_de_ruta SET meta_codigo = 'P0.4'        WHERE pilar_numero = 0 AND meta_codigo = 'P0.4_TMP_V8';

-- ── Paso 2 · P0 — Backfill P0.0 (video filosófico nuevo) ─────────────────────
-- Si el usuario ya completó el viejo P0.1 (ahora P0.4), también P0.0 cuenta como
-- visto. Decisión UX para no forzar a re-ver lo equivalente.
INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, output_generado, es_estrella)
SELECT usuario_id, 0, 'P0.0', true, fecha_completada, NULL, true
FROM hoja_de_ruta
WHERE pilar_numero = 0 AND meta_codigo = 'P0.4' AND completada = true
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── Paso 3 · P2 — COACH Test propósito · P2.4 → P2.6 ─────────────────────────
UPDATE hoja_de_ruta SET meta_codigo = 'P2.6' WHERE pilar_numero = 2 AND meta_codigo = 'P2.4';

-- ── Paso 4 · P4 — COACH Validación avatar · P4.4 → P4.5 ──────────────────────
UPDATE hoja_de_ruta SET meta_codigo = 'P4.5' WHERE pilar_numero = 4 AND meta_codigo = 'P4.4';

-- ── Paso 5 · P5 — COACH Test diferenciación · P5.3 → P5.4 ────────────────────
UPDATE hoja_de_ruta SET meta_codigo = 'P5.4' WHERE pilar_numero = 5 AND meta_codigo = 'P5.3';

-- ── Paso 6 · P7 — COACH Naming método · P7.4 → P7.5 ──────────────────────────
UPDATE hoja_de_ruta SET meta_codigo = 'P7.5' WHERE pilar_numero = 7 AND meta_codigo = 'P7.4';

-- ── Paso 7a · P8 — Renombrado base (COACH + HERR combinada) ──────────────────
-- v7 P8.4 (COACH Validación precios) → v8 P8.9 (COACH) · vía tmp por colisión
UPDATE hoja_de_ruta SET meta_codigo = 'P8.9_TMP_V8' WHERE pilar_numero = 8 AND meta_codigo = 'P8.4';
-- v7 P8.3 (HERR High+Low+Lead combinado) → v8 P8.4 (HERR Lead Magnet — preservamos como punto de partida)
UPDATE hoja_de_ruta SET meta_codigo = 'P8.4' WHERE pilar_numero = 8 AND meta_codigo = 'P8.3';
UPDATE hoja_de_ruta SET meta_codigo = 'P8.9' WHERE pilar_numero = 8 AND meta_codigo = 'P8.9_TMP_V8';

-- ── Paso 7b · P8 — Auto-backfill P8.5/P8.6 si las ofertas ya estaban llenas ──
-- Si el usuario ya completó v7 P8.3 (ahora P8.4) y tiene oferta_low / oferta_high
-- poblados, marcamos las tareas equivalentes v8 como completas para no obligarle
-- a re-completar lo que ya hizo. Hereda fecha_completada y es_estrella del P8.4.

INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT
  h.usuario_id,
  8,
  'P8.5',
  true,
  h.fecha_completada,
  true
FROM hoja_de_ruta h
JOIN profiles p ON p.id = h.usuario_id
WHERE h.pilar_numero = 8
  AND h.meta_codigo = 'P8.4'
  AND h.completada = true
  AND p.oferta_low IS NOT NULL
  AND length(trim(p.oferta_low)) > 0
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

INSERT INTO hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada, es_estrella)
SELECT
  h.usuario_id,
  8,
  'P8.6',
  true,
  h.fecha_completada,
  true
FROM hoja_de_ruta h
JOIN profiles p ON p.id = h.usuario_id
WHERE h.pilar_numero = 8
  AND h.meta_codigo = 'P8.4'
  AND h.completada = true
  AND p.oferta_high IS NOT NULL
  AND length(trim(p.oferta_high)) > 0
ON CONFLICT (usuario_id, pilar_numero, meta_codigo) DO NOTHING;

-- ── Paso 8 · P9A — Refactor (Genius Contenido → Validación orgánica) ────────
-- v7 P9A.5 (COACH revisión embudo) → v8 P9A.6 (COACH revisión)
UPDATE hoja_de_ruta SET meta_codigo = 'P9A.6' WHERE pilar_numero = 9 AND meta_codigo = 'P9A.5';
-- v7 P9A.4 (HERR Genius Contenido) queda obsoleta — el contenido N1/N2/N3 se
-- integra en P9A.3 (Anuncios) y el plan semanal se movió al Creador de Contenido
-- (tab separado · post P6). Renombramos a P9A.4_legacy para preservar histórico.
UPDATE hoja_de_ruta SET meta_codigo = 'P9A.4_legacy' WHERE pilar_numero = 9 AND meta_codigo = 'P9A.4';

COMMIT;

-- ── Verificación post-migración ────────────────────────────────────────────────
-- Ejecutar manualmente para validar:
--   SELECT pilar_numero, meta_codigo, COUNT(*)
--   FROM hoja_de_ruta GROUP BY pilar_numero, meta_codigo
--   ORDER BY pilar_numero, meta_codigo;
-- Esperado: sólo códigos válidos v8 (más el legacy P9A.4_legacy si existió).
-- No debe quedar P0.1 viejo (era video), P2.4 (era coach), P4.4 (era coach),
-- P5.3 (era coach), P7.4 (era coach), P8.4 (era coach), P9A.5 (era coach).
