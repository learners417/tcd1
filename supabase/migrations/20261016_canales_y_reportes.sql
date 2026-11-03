-- ════════════════════════════════════════════════════════════════════
--  CERRAR DISCORD Y SKOOL: LOS CANALES, LOS REPORTES Y LAS MENTORÍAS
--
--  Hoy el acompañamiento vive en tres lados y ninguno habla con la app:
--    · Discord — 5 canales grupales (#producto, #marketing, #ventas,
--      #compromisos, #victorias) más un canal privado por cliente.
--    · Skool — la comunidad.
--    · El calendario — las tres mentorías semanales, cuyo link se pasa
--      a mano cada vez.
--
--  Y hay un agujero que cuesta plata: la pantalla de Mensajes no mira
--  lo que contrató nadie, así que el de $1.000 tiene el MISMO chat que
--  el de $3.000. Una de las dos cosas que justifican el triple de
--  precio ya está regalada.
--
--  Esto trae las tres cosas acá:
--
--    canales_mensajes   los 5 canales grupales, con quién puede escribir
--    reportes           la vía de La Base: por turnos, como un correo
--    sesiones_grupales  las mentorías, con su link y su día
--
--  LA REGLA QUE EVITA EL CONFLICTO, Y ESTÁ EN LA BASE, NO EN LA APP:
--  quien contrató 'base' no puede insertar en canales_mensajes. No es
--  un cartel que le pide que no escriba — no puede. Porque si el
--  mensaje llega, alguien lo va a contestar, y con una sola respuesta
--  el plan de $3.000 deja de valer el triple para siempre.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── Quién es del equipo ────────────────────────────────────────────
-- El repo ya chequeaba el equipo con `rol = 'admin'` sobre profiles,
-- repetido dentro de cada política de cada migración. Acá se nombra
-- una vez: con la condición copiada, el día que haya un segundo rol
-- del equipo hay que acordarse de todos los lugares donde está.
create or replace function public.es_del_equipo(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and rol = 'admin');
$$;

comment on function public.es_del_equipo is
  'Si ese usuario es del equipo. Mismo criterio que ya usaban las políticas a mano: profiles.rol = admin.';

-- ── Quién tiene acompañamiento ─────────────────────────────────────
-- Una función, no la condición repetida en cada política: con la
-- condición copiada en siete lugares, el día que entre un escalón
-- nuevo hay que acordarse de los siete.
create or replace function public.tiene_acompanamiento(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select servicio_contratado in ('ascenso', 'instalacion')
       from public.profiles where id = uid),
    false);
$$;

comment on function public.tiene_acompanamiento is
  'Si le toca chat, canales grupales y mentorías. Derivado de servicio_contratado: nunca se marca a mano.';

-- ════════════════════════════════════════════════════════════════════
--  1 · LOS CANALES GRUPALES
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.canales_mensajes (
  id uuid primary key default gen_random_uuid(),
  canal text not null check (canal in
    ('producto', 'marketing', 'ventas', 'compromisos', 'victorias')),
  autor_id uuid not null references auth.users(id) on delete cascade,
  -- Se guarda el nombre junto al mensaje. Con solo el id, un mensaje de
  -- hace dos meses de alguien que se fue queda sin firma, y el canal se
  -- lee como si lo hubiera escrito nadie.
  autor_nombre text not null default '',
  -- Si lo escribió el equipo. Un mensaje de Javo en #producto no es lo
  -- mismo que uno de un compañero, y en Discord se distinguía por el rol.
  del_equipo boolean not null default false,
  texto text not null check (length(trim(texto)) > 0),
  -- Para los hilos: responder a un mensaje sin perder de qué se hablaba.
  responde_a uuid references public.canales_mensajes(id) on delete set null,
  creado_en timestamptz not null default now()
);

create index if not exists canales_mensajes_canal_idx
  on public.canales_mensajes (canal, creado_en desc);
create index if not exists canales_mensajes_hilo_idx
  on public.canales_mensajes (responde_a) where responde_a is not null;

alter table public.canales_mensajes enable row level security;

-- LEER · Victorias lo ve todo el mundo; los otros cuatro, solo quien
-- tiene acompañamiento. Ver avanzar a alguien que empezó igual es lo
-- que hace querer sumarse, y son los mensajes de verdad, no una
-- vidriera armada.
drop policy if exists "canales: leer" on public.canales_mensajes;
create policy "canales: leer" on public.canales_mensajes
  for select to authenticated
  using (
    canal = 'victorias'
    or public.tiene_acompanamiento(auth.uid())
    or public.es_del_equipo(auth.uid())
  );

-- ESCRIBIR · Solo con acompañamiento, y firmando con su propio id.
drop policy if exists "canales: escribir" on public.canales_mensajes;
create policy "canales: escribir" on public.canales_mensajes
  for insert to authenticated
  with check (
    autor_id = auth.uid()
    and (public.tiene_acompanamiento(auth.uid()) or public.es_del_equipo(auth.uid()))
    -- Solo el equipo puede firmar como equipo.
    and (del_equipo = false or public.es_del_equipo(auth.uid()))
  );

-- BORRAR · Lo suyo, y el equipo lo que haga falta moderar.
drop policy if exists "canales: borrar" on public.canales_mensajes;
create policy "canales: borrar" on public.canales_mensajes
  for delete to authenticated
  using (autor_id = auth.uid() or public.es_del_equipo(auth.uid()));

-- ════════════════════════════════════════════════════════════════════
--  2 · LOS REPORTES — la vía de La Base
-- ════════════════════════════════════════════════════════════════════
-- No es un chat con otro nombre: es por turnos. Manda uno, el equipo
-- responde una vez, y queda cerrado. Eso es lo que hace que Lupe pueda
-- con todos en 6 horas por día, y es una diferencia que el cliente
-- entiende sin que nadie se la explique.

create table if not exists public.reportes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references auth.users(id) on delete cascade,
  -- Las tres preguntas del formulario. Separadas y no un campo libre:
  -- un reporte que dice «no me sale nada» no se puede contestar en una
  -- sola respuesta, y entonces hace falta el ida y vuelta que este plan
  -- justamente no incluye.
  donde_estoy text not null default '',
  que_trabo text not null default '',
  que_necesito text not null default '',
  creado_en timestamptz not null default now(),
  -- La respuesta. Una sola.
  respuesta text,
  respondido_por uuid references auth.users(id) on delete set null,
  respondido_en timestamptz,
  -- Cuándo vence el compromiso de 48 horas hábiles. Se calcula al
  -- insertar y queda guardado: si se calculara al leer, un feriado
  -- movería la fecha de un reporte viejo y el equipo vería vencido lo
  -- que contestó a tiempo.
  vence_en timestamptz not null default (now() + interval '48 hours')
);

create index if not exists reportes_cliente_idx
  on public.reportes (cliente_id, creado_en desc);
-- Los que esperan, que es la cola que mira el equipo.
create index if not exists reportes_pendientes_idx
  on public.reportes (vence_en) where respuesta is null;

alter table public.reportes enable row level security;

drop policy if exists "reportes: el cliente ve los suyos" on public.reportes;
create policy "reportes: el cliente ve los suyos" on public.reportes
  for select to authenticated
  using (cliente_id = auth.uid() or public.es_del_equipo(auth.uid()));

drop policy if exists "reportes: el cliente escribe los suyos" on public.reportes;
create policy "reportes: el cliente escribe los suyos" on public.reportes
  for insert to authenticated
  with check (cliente_id = auth.uid() and respuesta is null);

-- Responder es solo del equipo. Sin esta restricción, el cliente podría
-- escribir su propia respuesta y el reporte saldría de la cola sin que
-- nadie lo haya leído.
drop policy if exists "reportes: responde el equipo" on public.reportes;
create policy "reportes: responde el equipo" on public.reportes
  for update to authenticated
  using (public.es_del_equipo(auth.uid()))
  with check (public.es_del_equipo(auth.uid()));

-- ════════════════════════════════════════════════════════════════════
--  3 · LAS MENTORÍAS GRUPALES, CON SU LINK
-- ════════════════════════════════════════════════════════════════════
-- El link se pasaba a mano cada semana. Acá vive una vez y el cliente
-- entra directo desde su calendario.

create table if not exists public.sesiones_grupales (
  id uuid primary key default gen_random_uuid(),
  -- Qué se trata. El mismo reparto que los canales: así la duda del
  -- martes se hace en el canal del martes.
  tema text not null check (tema in ('producto', 'marketing', 'ventas')),
  -- Qué grupo. Hay dos horarios y van sumando clientes al segundo.
  grupo text not null default 'grupo_1',
  empieza_en timestamptz not null,
  duracion_min integer not null default 120 check (duracion_min between 15 and 480),
  -- El link de la videollamada. El que abre el botón.
  url_reunion text not null default '',
  -- Después: la grabación, para quien no pudo entrar.
  url_grabacion text,
  notas text,
  creada_en timestamptz not null default now()
);

create index if not exists sesiones_grupales_cuando_idx
  on public.sesiones_grupales (empieza_en desc);

alter table public.sesiones_grupales enable row level security;

-- Las ve quien tiene acompañamiento. El de La Base no las ve: en su
-- lugar ve la invitación a sumarse, que es otra conversación — una que
-- termina en venta y no en reclamo.
drop policy if exists "grupales: las ve quien las tiene" on public.sesiones_grupales;
create policy "grupales: las ve quien las tiene" on public.sesiones_grupales
  for select to authenticated
  using (public.tiene_acompanamiento(auth.uid()) or public.es_del_equipo(auth.uid()));

drop policy if exists "grupales: las carga el equipo" on public.sesiones_grupales;
create policy "grupales: las carga el equipo" on public.sesiones_grupales
  for all to authenticated
  using (public.es_del_equipo(auth.uid()))
  with check (public.es_del_equipo(auth.uid()));

-- ── Quién vino ─────────────────────────────────────────────────────
-- Para que el equipo vea quién dejó de entrar. Alguien que faltó a tres
-- seguidas está por irse, y hoy eso no se ve en ninguna parte.
create table if not exists public.asistencia_grupales (
  sesion_id uuid not null references public.sesiones_grupales(id) on delete cascade,
  cliente_id uuid not null references auth.users(id) on delete cascade,
  entro_en timestamptz not null default now(),
  primary key (sesion_id, cliente_id)
);

alter table public.asistencia_grupales enable row level security;

drop policy if exists "asistencia: la propia y la del equipo" on public.asistencia_grupales;
create policy "asistencia: la propia y la del equipo" on public.asistencia_grupales
  for select to authenticated
  using (cliente_id = auth.uid() or public.es_del_equipo(auth.uid()));

-- Se marca al tocar el botón de entrar: nadie tiene que acordarse de
-- tomar asistencia.
drop policy if exists "asistencia: se marca al entrar" on public.asistencia_grupales;
create policy "asistencia: se marca al entrar" on public.asistencia_grupales
  for insert to authenticated
  with check (cliente_id = auth.uid() and public.tiene_acompanamiento(auth.uid()));

-- ════════════════════════════════════════════════════════════════════
--  4 · LO QUE EL EQUIPO NECESITA DE UNA SOLA CONSULTA
-- ════════════════════════════════════════════════════════════════════
-- Sin esto, armar la pantalla del lunes son cuatro consultas por
-- cliente: con diez clientes son cuarenta viajes a la base para una
-- pantalla que se mira todos los días.

create or replace function public.estado_de_acompanamiento()
returns table (
  cliente_id uuid,
  nombre text,
  servicio text,
  reportes_sin_responder integer,
  reporte_mas_viejo timestamptz,
  vencido boolean,
  ultima_grupal_a_la_que_entro timestamptz,
  grupales_seguidas_sin_entrar integer
)
language sql
stable
security definer
set search_path = public
as $$
  with ultimas as (
    select id, empieza_en,
           row_number() over (order by empieza_en desc) as n
      from public.sesiones_grupales
     where empieza_en < now()
  )
  select
    p.id,
    coalesce(p.nombre, ''),
    p.servicio_contratado,
    (select count(*)::integer from public.reportes r
      where r.cliente_id = p.id and r.respuesta is null),
    (select min(r.creado_en) from public.reportes r
      where r.cliente_id = p.id and r.respuesta is null),
    coalesce((select min(r.vence_en) < now() from public.reportes r
      where r.cliente_id = p.id and r.respuesta is null), false),
    (select max(s.empieza_en) from public.asistencia_grupales a
       join public.sesiones_grupales s on s.id = a.sesion_id
      where a.cliente_id = p.id),
    -- Cuántas de las últimas seis se perdió seguidas. Seis son dos
    -- semanas: con menos, una gripe se ve igual que un cliente que se
    -- está yendo.
    (select count(*)::integer from ultimas u
      where u.n <= 6
        and not exists (select 1 from public.asistencia_grupales a
                         where a.sesion_id = u.id and a.cliente_id = p.id)
        and u.empieza_en > coalesce(
              (select max(s2.empieza_en) from public.asistencia_grupales a2
                 join public.sesiones_grupales s2 on s2.id = a2.sesion_id
                where a2.cliente_id = p.id), '-infinity'::timestamptz))
  from public.profiles p
  where public.es_del_equipo(auth.uid())
  order by 6 desc, 4 desc;
$$;

comment on function public.estado_de_acompanamiento is
  'Una fila por cliente con lo que el equipo necesita para el seguimiento: reportes esperando, si vencieron, y cuántas grupales seguidas se perdió.';

-- ── Permisos de ejecución ──────────────────────────────────────────
-- Sin esto las funciones existen y el cliente recibe «permission
-- denied»: el síntoma es una pantalla vacía sin error visible.
grant execute on function public.es_del_equipo(uuid) to authenticated;
grant execute on function public.tiene_acompanamiento(uuid) to authenticated;
grant execute on function public.estado_de_acompanamiento() to authenticated;
