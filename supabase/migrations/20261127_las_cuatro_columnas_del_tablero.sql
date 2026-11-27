-- ════════════════════════════════════════════════════════════════════════════
-- LAS CUATRO COLUMNAS QUE ESTABAN EN LA BASE Y EN NINGÚN .SQL
-- ════════════════════════════════════════════════════════════════════════════
--
-- Qué pasó. La cuenta de agendas se construyó en la rama `mejoras` el 22 y el
-- 24 de noviembre, y sus cuatro columnas se crearon a mano en Supabase.
-- `api/ghl-webhook.ts` las escribe desde entonces, con el evento
-- `cita_agendada`, y funciona. Lo que faltaba era esto: el repo no podía
-- volver a armar la base, y ninguna lente las miraba.
--
-- Quién las lee: todavía nadie. El cliente ve su cuello de botella en
-- `TableroDeLaSemana`, con los números que carga él. Estas cuatro son para
-- cuando las agendas lleguen solas desde GHL, y se escriben desde ya para que
-- ese día haya historia y no un cero.
--
-- Es el mismo defecto que el `roi_mes` de MCD (18 nov): una pantalla que lee
-- una columna que ningún archivo del repo crea. Allá el cartel no se dibujó
-- nunca y nadie lo vio, porque la pantalla degradaba en silencio. Acá todavía
-- no mordió, porque las columnas sí existen en la base viva.
--
-- Esto NO cambia nada en producción. Son las cuatro columnas tal como están
-- hoy, medidas contra `information_schema` el 27 de noviembre de 2026:
--
--   agendas_count              integer      NOT NULL  default 0
--   processed_appointment_ids  jsonb        NOT NULL  default '[]'::jsonb
--   campaign_status            text         NULL      sin default
--   launched_at                timestamptz  NULL      sin default
--
-- Y no se inventa nada que no esté: `campaign_status` no tiene CHECK en la
-- base (verificado en pg_constraint), así que acá tampoco. Ojo con eso: en
-- TypeScript el tipo es `'installing' | 'launched' | null`, más angosto que la
-- columna. Si algún día algo escribe otro texto, la base lo acepta y el tipo
-- miente. Ponerle el CHECK es una decisión de Javo, no de esta migración.
--
-- Idempotente: se puede correr dos veces sin consecuencia.

alter table public.profiles
  add column if not exists agendas_count integer not null default 0;

alter table public.profiles
  add column if not exists processed_appointment_ids jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists campaign_status text;

alter table public.profiles
  add column if not exists launched_at timestamptz;

-- Para qué sirve cada una, en la base misma, para quien la abra sin el repo.
comment on column public.profiles.agendas_count is
  'Cuántas citas agendó este cliente. La suma api/ghl-webhook.ts con el evento cita_agendada.';
comment on column public.profiles.processed_appointment_ids is
  'Los ids de cita ya contados. Evita que un reenvío del webhook de GHL cuente dos veces la misma.';
comment on column public.profiles.campaign_status is
  'installing o launched: en qué parte está su campaña. Todavía no la lee ninguna pantalla.';
comment on column public.profiles.launched_at is
  'Cuándo lanzó su campaña. Todavía no la lee ninguna pantalla.';
