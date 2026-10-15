-- ════════════════════════════════════════════════════════════════════════
--  LA ANTESALA — el detox que abre la sesión 1
--
--  El Camino arrancaba en el día 1 con 75 minutos: diez preguntas de medición,
--  el pacto, la hora real neta. Eso le pide claridad y energía a alguien que
--  llega agotado, y el que llega agotado es la mayoría: por eso compra.
--
--  Ahora antes del día 1 hay cinco a siete días que no construyen nada. El
--  cliente elige de tres a cinco movidas —sueño, pantallas, alimentación,
--  movimiento, silencio, agua—, las escribe con sus palabras y con un número,
--  y las tilda un día por día. Al quinto se abre su sesión 1.
--
--  Lo diseña él. Si le decimos a qué hora dormir y qué comer, le sumamos una
--  obligación más a alguien que ya tiene de sobra. Es la misma regla que el
--  día 4 del Camino ya usa.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists antesala jsonb not null default '{}'::jsonb;

comment on column public.profiles.antesala is
  'La antesala del Camino: { protocolo: [{area, loQueHago}], dias: [ISO], cerrada: ISO }. '
  'Las movidas son de tres a cinco y las escribe el cliente. Con cinco días '
  'tildados se abre la sesión 1, y al séptimo se cierra sola. La fecha con la '
  'que quedó lista es la que sella fecha_inicio: así los 90 días no arrancan '
  'contando mientras todavía está descansando.';

-- ── El cliente la escribe, el equipo la ve ────────────────────────────
--
-- No hace falta política nueva: `profiles` ya tiene «el cliente edita lo suyo»
-- y «el equipo edita cualquier ficha» desde 20261018. Esta columna entra bajo
-- las dos. Se deja anotado para que nadie agregue una tercera por las dudas.
