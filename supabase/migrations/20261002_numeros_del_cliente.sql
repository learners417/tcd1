-- ══════════════════════════════════════════════════════════════════
-- LOS NÚMEROS DEL CLIENTE, A LA VISTA DEL EQUIPO
--
-- Hasta hoy cada cliente podía leer solo sus propias métricas, así que
-- quien acompaña no veía nada: para saber cómo iba una campaña había que
-- entrar con la cuenta del cliente o preguntarle por mensaje.
--
-- Esto agrega dos cosas:
--   1. El equipo puede LEER las métricas de todos. Solo leer: la carga
--      sigue siendo del cliente, que es parte de lo que se le enseña.
--   2. El diagnóstico de campaña queda guardado en la semana que lo
--      produjo, para poder comparar una semana con otra.
-- ══════════════════════════════════════════════════════════════════

-- 1 · El equipo lee las métricas de todos ───────────────────────────
drop policy if exists "metricas_v2_equipo_lee" on metricas_v2;
create policy "metricas_v2_equipo_lee" on metricas_v2
  for select
  using (exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin'));

-- 2 · El diagnóstico de la campaña, guardado donde pertenece ────────
alter table metricas_v2 add column if not exists met_diagnostico      text;
alter table metricas_v2 add column if not exists met_diagnostico_el   timestamptz;

comment on column metricas_v2.met_diagnostico is
  'La lectura de la campaña de esa semana. Se guarda para poder comparar.';

-- 3 · Buscar por fecha es lo que más se hace desde el Admin ─────────
create index if not exists idx_metricas_v2_fecha on metricas_v2(met_fecha_inicio);
