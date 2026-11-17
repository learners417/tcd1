-- ════════════════════════════════════════════════════════════════════
--  LA SALA DE MANDO NO PODÍA GUARDAR NI LISTAR UNA DECISIÓN
--
--  `sala_decisiones` la crea `sala-de-mando.sql` con estas columnas:
--  `texto`, `motivo`, `fecha`, `decidida_por`, `area`, `cliente_id`,
--  `estado` y `created_at`.
--
--  El código pedía otras CINCO: `titulo`, `criterio`, `contexto`,
--  `decidida_en` y `vigente`. Ninguna existe, y ninguna migración las
--  creó nunca. PostgREST no ignora la columna que no conoce: contesta
--  400 con 42703 y la sentencia ENTERA no se ejecuta. Así que:
--
--    · `listarDecisiones` fallaba y devolvía `[]` por su propio
--      `if (error || !data) return []`: el panel «Decisiones» de la
--      Sala estaba VACÍO siempre, sin decir nada.
--    · `guardarDecision` tiraba el error del motor en la cara —y es lo
--      que corre al cargar una sesión, por cada decisión extraída.
--    · `derogarDecision` tampoco podía.
--
--  El arreglo de fondo va del lado del código: habla con las columnas
--  que la tabla tiene (`src/lib/salaDeMandoStorage.ts`, con los alias
--  de PostgREST, así la pantalla no se toca). La tabla solo necesita
--  UNA columna que de verdad le falta y no tiene equivalente: el
--  `contexto` con el que `CargarSesion` deja dicho de qué sesión salió
--  cada decisión.
--
--  Medido el 17 de noviembre levantando la base y ejerciendo las tres
--  sentencias. Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

alter table public.sala_decisiones
  add column if not exists contexto text;

comment on column public.sala_decisiones.contexto is
  'De dónde salió la decisión: la sesión, con quién, el hilo. Lo escribe CargarSesion.';
