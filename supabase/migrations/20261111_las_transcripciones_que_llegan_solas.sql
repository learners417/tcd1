-- ════════════════════════════════════════════════════════════════════
--  LAS TRANSCRIPCIONES QUE LLEGAN SOLAS — turno 14
--
--  ═══ EL HUECO QUE CIERRA ═══
--
--  Fathom está vendido y contado —el video L-17 del día 23 lo enseña,
--  `preactivacionSteps` lo cuenta como paso del cliente, `cuadroTickets`
--  lo nombra— y no había ninguna ruta que recibiera una transcripción.
--  Terminaba la sesión y no entraba nada: alguien copiaba el texto a
--  mano en «Cargar sesión», o la sesión se perdía.
--
--  ═══ POR QUÉ UNA COLA Y NO UN GUARDADO ═══
--
--  `transcripcion.ts` tiene la regla escrita en su encabezado: nada se
--  guarda sin que un humano lo confirme, porque una transcripción mal
--  leída que se guarda sola se vuelve un dato falso con apariencia de
--  registro, y después alguien decide sobre él. El webhook, entonces,
--  **no extrae nada**: deja la transcripción acá, en estado 'pendiente',
--  y la pantalla que ya existe sigue siendo la que decide.
--
--  Lo que esta tabla NO es: el registro de que la sesión ocurrió. Eso es
--  `sesiones` + `sesiones_asistentes`, y lo sigue cargando una persona.
--  Una grabación no prueba una sesión: Fathom graba reuniones internas,
--  pruebas de audio y llamadas que se cortaron al minuto.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.transcripciones_recibidas (
  id uuid primary key default gen_random_uuid(),

  /* De dónde vino. Hoy sólo Fathom; el día que entre otra cosa, se
     distingue sin migrar nada. */
  origen text not null default 'fathom',

  /* `recording_id` de Fathom. La llave de la idempotencia: Fathom
     reintenta su webhook, y sin esto la misma sesión quedaría tres
     veces en la cola de revisión. */
  externo_id text not null,

  titulo text,
  fecha date not null default current_date,
  minutos integer,
  /* El enlace para ir a escuchar el momento exacto. */
  enlace text,
  quien_la_dio text,

  /* El texto aplanado: «Quien habla: lo que dijo», un renglón por turno. */
  transcripcion text not null,

  /* Los emails que venían en la invitación, como vinieron. Se guardan
     incluso cuando ninguno coincide con un cliente: es lo único con lo
     que una persona puede decidir de quién era la sesión. */
  participantes jsonb not null default '[]'::jsonb,

  /* A quién se la pudo colgar, y por qué email. NULL = llegó y nadie la
     reconoció — que es un estado legítimo, no un error: se muestra
     igual y el equipo elige el cliente a mano. */
  cliente_id uuid references public.profiles(id) on delete set null,
  email_detectado text,

  -- 'pendiente'   llegó y nadie la revisó todavía
  -- 'cargada'     una persona la revisó y confirmó lo que salía de ella
  -- 'descartada'  una persona la miró y decidió que no era una sesión
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'cargada', 'descartada')),
  revisada_por uuid references public.profiles(id) on delete set null,
  revisada_el timestamptz,

  created_at timestamptz not null default now()
);

/* La idempotencia de verdad.
   Dos trampas que este repo ya pisó dos veces y están escritas en
   COMO-FUNCIONA: un `unique` sobre una columna que puede ser NULL no
   restringe nada, porque en Postgres los nulos son distintos entre sí.
   Acá las dos columnas son `not null`, así que el único alcanza — y la
   llave es (origen, externo_id) y no `externo_id` solo, para que el día
   que entre otra herramienta su id no choque con el de Fathom. */
create unique index if not exists idx_transcripciones_recibidas_externo
  on public.transcripciones_recibidas (origen, externo_id);

create index if not exists idx_transcripciones_recibidas_pendientes
  on public.transcripciones_recibidas (estado, fecha desc);

create index if not exists idx_transcripciones_recibidas_cliente
  on public.transcripciones_recibidas (cliente_id);

comment on table public.transcripciones_recibidas is
  'Transcripciones que entran solas por webhook y esperan que una persona las revise. No son el registro de que la sesión ocurrió: eso es public.sesiones.';

-- ── Quién ve y quién escribe ───────────────────────────────────────
--
-- Sólo el equipo. El cliente NO ve esto, y no es un olvido: la
-- transcripción es la conversación cruda, con lo que se dijo de él y lo
-- que se dijo delante de él. Lo que el cliente recibe es el resumen que
-- una persona confirmó, y le llega como aviso desde «Cargar sesión».
--
-- La ruta escribe con la clave de servicio, que no pasa por RLS: estas
-- políticas son para la pantalla del Admin.

alter table public.transcripciones_recibidas enable row level security;

drop policy if exists "transcripciones_recibidas_equipo" on public.transcripciones_recibidas;
create policy "transcripciones_recibidas_equipo" on public.transcripciones_recibidas
  for all to authenticated
  using (
    exists (select 1 from public.profiles
             where id = auth.uid()
               and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff')))
  )
  with check (
    exists (select 1 from public.profiles
             where id = auth.uid()
               and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff')))
  );
