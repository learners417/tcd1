-- ═══════════════════════════════════════════════════════════════════════════
-- LA PORTADA DE YOUTUBE NO ENTRABA EN LA LISTA
--
-- `creativos.tipo` es una lista cerrada desde el 10 de abril
-- (20260410_campanas_creativos.sql) con dos valores: `imagen_single` y
-- `carrusel`. Nunca se amplió.
--
-- Pero la app tiene una tercera pestaña —«Portada YouTube», 1280x720— y todo
-- su camino está escrito: `TipoCreativo` la declara, `FORMATOS` le da su
-- tamaño, `campanasPrompts.ts` le arma su prompt 16:9 y `TIPO_LABELS` su
-- etiqueta. Lo único que no la tenía era la base.
--
-- Lo que pasaba, medido contra un PostgreSQL 16 de verdad: el cliente elegía
-- la pestaña, se generaba la imagen —y el crédito se cobra ANTES de llamar al
-- modelo—, y el insert moría con
--
--     ERROR: new row for relation "creativos" violates check constraint
--            "creativos_tipo_check"
--
-- `saveCreativo` lanza con ese mensaje, así que el cliente veía el error y
-- perdía la portada y el crédito. No es una pantalla que degrada: es la
-- función entera que no guarda nada.
--
-- No se afloja el candado ni se saca el CHECK: se agrega EL valor que la app
-- ya usa, y los otros dos quedan igual. Lo mide
-- `scripts/prueba-el-valor-que-la-base-rechaza.py`, que compara la lista del
-- catálogo con la del tipo de TypeScript.
--
-- Medido el 18 de noviembre de 2026.
-- ═══════════════════════════════════════════════════════════════════════════

-- Idempotente: la batería corre todo el SQL dos veces, y `DROP ... IF EXISTS`
-- más el `ADD` con el mismo nombre deja la tabla igual la segunda vez.
alter table public.creativos
  drop constraint if exists creativos_tipo_check;

alter table public.creativos
  add constraint creativos_tipo_check
  check (tipo in ('imagen_single', 'carrusel', 'yt_thumbnail'));
