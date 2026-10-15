-- ════════════════════════════════════════════════════════════════════════
--  EL VEREDICTO QUEDA
--
--  ═══ QUÉ ESTABA PASANDO ═══
--
--  El testigo —la visión IA— ya miraba la foto y contestaba. Su respuesta
--  vivía en un `useState`, y el archivo que había rechazado quedaba en
--  Storage. `listarEvidencias` cuenta los archivos de la carpeta.
--
--  Entonces: el cliente subía la foto equivocada, la IA la rechazaba, la
--  pantalla le pedía otra. Recargaba. El archivo seguía ahí, contaba uno, y
--  la jornada se destrababa con la foto que la IA había rechazado.
--
--  Y nadie se enteraba. En el Admin la pestaña de evidencias lista archivos y
--  los abre: sin estado, sin motivo, sin botón.
--
--  ═══ CÓMO QUEDA ═══
--
--  La IA juzga las imágenes y su veredicto se guarda con su firma. Lo que
--  rechazó —y todo lo que no mira: el audio, el video, el PDF— le cae al
--  equipo en una cola, con el motivo de la IA al lado, y ahí se aprueba o se
--  confirma el rechazo en un toque.
--
--  Lo aprobado cuenta. Lo que espera a una persona cuenta también: nadie
--  queda trabado esperando que alguien abra el Admin. Lo rechazado no cuenta,
--  y el cliente recibe el aviso con el motivo.
--
--  ═══ POR QUÉ NO REABRE LA JORNADA CERRADA ═══
--
--  Porque reabrir el día 4 cuando el cliente está en el 40 le pone una
--  jornada vencida de hace cinco semanas en una pantalla que venía en verde.
--  Eso es la fatiga que esta app existe para no producir. La cola muestra que
--  esa jornada ya cerró, y quien acompaña decide qué hacer hablando con él.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1 · Dónde queda ───────────────────────────────────────────────────
--
-- La llave es el archivo: un veredicto por archivo, y el path de Storage ya
-- es único —lleva el milisegundo de la subida adelante del nombre.
create table if not exists public.evidencia_veredictos (
  archivo      text primary key,
  cliente_id   uuid not null references auth.users(id) on delete cascade,
  meta_codigo  text not null,
  estado       text not null check (estado in ('aprobada', 'pendiente', 'rechazada')),
  -- Quién dictó: la IA, o una persona del equipo.
  quien        text not null check (quien in ('ia', 'equipo')),
  decidido_por uuid references auth.users(id) on delete set null,
  motivo       text,
  decidido_en  timestamptz not null default now()
);

comment on table public.evidencia_veredictos is
  'El veredicto de cada evidencia, con la firma de quién lo dictó. La IA juzga las imágenes; el equipo decide lo que ella rechazó y lo que no mira.';

create index if not exists evidencia_veredictos_del_cliente
  on public.evidencia_veredictos (cliente_id, meta_codigo);

-- Para la cola: lo que espera una decisión es un puñado de filas entre miles.
create index if not exists evidencia_veredictos_pendientes
  on public.evidencia_veredictos (estado, decidido_en desc)
  where estado in ('pendiente', 'rechazada');

alter table public.evidencia_veredictos enable row level security;

-- ── 2 · Quién lee qué ─────────────────────────────────────────────────
--
-- El cliente LEE los suyos —necesita ver el motivo para saber qué subir— y no
-- los escribe: escribir es lo que convertiría «la IA me rechazó» en «yo me
-- aprobé». Para eso están las dos funciones de abajo.
drop policy if exists veredictos_el_cliente_lee_los_suyos on public.evidencia_veredictos;
create policy veredictos_el_cliente_lee_los_suyos on public.evidencia_veredictos
  for select to authenticated
  using (cliente_id = auth.uid());

drop policy if exists veredictos_el_equipo_todos on public.evidencia_veredictos;
create policy veredictos_el_equipo_todos on public.evidencia_veredictos
  for all to authenticated
  using (public.es_del_equipo(auth.uid()))
  with check (public.es_del_equipo(auth.uid()));

-- ── 3 · El veredicto de la IA ─────────────────────────────────────────
--
-- Lo guarda el navegador del cliente al volver de la visión, así que la
-- función comprueba dos cosas que el navegador no puede garantizar: que el
-- archivo está en SU carpeta, y que no pisa lo que ya decidió una persona.
create or replace function public.guardar_veredicto_ia(
  p_archivo     text,
  p_cliente_id  uuid,
  p_meta_codigo text,
  p_estado      text,
  p_motivo      text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and p_cliente_id <> auth.uid()
     and not public.es_del_equipo(auth.uid()) then
    raise exception 'El veredicto de una evidencia se guarda en la carpeta de su dueño';
  end if;

  -- El path lo arma el cliente. Sin esta comprobación podría escribir un
  -- veredicto apuntando al archivo de otro.
  if p_archivo is null or p_archivo not like ('evidencias/' || p_cliente_id::text || '/%') then
    raise exception 'Ese archivo no está en la carpeta de ese cliente';
  end if;

  insert into public.evidencia_veredictos (
    archivo, cliente_id, meta_codigo, estado, quien, decidido_por, motivo)
  values (
    p_archivo, p_cliente_id, p_meta_codigo, p_estado, 'ia', null, p_motivo)
  on conflict (archivo) do update
    set estado      = excluded.estado,
        motivo      = excluded.motivo,
        decidido_en = now()
    -- Si ya lo decidió una persona, la IA no lo vuelve a tocar.
    where evidencia_veredictos.quien = 'ia';
end;
$$;

comment on function public.guardar_veredicto_ia is
  'Guarda lo que dictó la visión IA sobre una evidencia. Solo en la carpeta del dueño, y nunca encima de una decisión del equipo.';

revoke all on function public.guardar_veredicto_ia(text, uuid, text, text, text) from public;
grant execute on function public.guardar_veredicto_ia(text, uuid, text, text, text) to authenticated;

-- ── 4 · La decisión del equipo ────────────────────────────────────────
--
-- Un toque: aprobar, o confirmar el rechazo con el motivo. Y el aviso al
-- cliente sale acá adentro, no desde el navegador: así no existe el caso de
-- la decisión guardada y el aviso que no salió.
-- Entra el cliente y la meta porque la decisión no siempre cae sobre una fila
-- que ya existe: en la ficha del cliente, el equipo puede decidir sobre una
-- evidencia que la IA no miró —una que ya estaba subida de antes, o una que la
-- IA no pudo leer— y de esas no hay fila todavía.
create or replace function public.decidir_evidencia(
  p_archivo     text,
  p_estado      text,
  p_motivo      text default null,
  p_cliente_id  uuid default null,
  p_meta_codigo text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente uuid;
  v_meta    text;
begin
  if not public.es_del_equipo(auth.uid()) then
    raise exception 'La decisión sobre una evidencia la toma el equipo';
  end if;

  if p_estado not in ('aprobada', 'rechazada') then
    raise exception 'Una persona aprueba o rechaza: pendiente es el estado de lo que todavía nadie miró';
  end if;

  select cliente_id, meta_codigo into v_cliente, v_meta
    from public.evidencia_veredictos where archivo = p_archivo;

  v_cliente := coalesce(v_cliente, p_cliente_id);
  v_meta    := coalesce(v_meta, p_meta_codigo);

  if v_cliente is null or v_meta is null then
    raise exception 'Falta saber de quién es esa evidencia y de qué jornada';
  end if;

  insert into public.evidencia_veredictos (
    archivo, cliente_id, meta_codigo, estado, quien, decidido_por, motivo)
  values (
    p_archivo, v_cliente, v_meta, p_estado, 'equipo', auth.uid(), p_motivo)
  on conflict (archivo) do update
    set estado       = excluded.estado,
        quien        = 'equipo',
        decidido_por = auth.uid(),
        motivo       = excluded.motivo,
        decidido_en  = now();

  -- El cliente se entera. Sin esto la decisión queda en una pantalla que él
  -- no abre nunca.
  perform public.crear_notificacion(
    v_cliente,
    'evidencia',
    case when p_estado = 'aprobada'
      then 'Tu evidencia quedó confirmada'
      else 'Tu evidencia necesita otra foto' end,
    case when p_estado = 'aprobada'
      then 'La revisamos y está. Tu jornada sigue.'
      else coalesce(nullif(p_motivo, ''), 'Sube otra que muestre lo que pide la jornada.') end,
    '/roadmap',
    -- La clave agrupa, no identifica: `historial_avisos` cuenta por clave, y
    -- una clave con el path adentro deja una fila suelta por archivo.
    'evidencia_decidida'
  );

  return v_cliente;
end;
$$;

comment on function public.decidir_evidencia is
  'El equipo aprueba o rechaza una evidencia, y el cliente recibe el aviso en el mismo movimiento.';

-- La firma vieja —tres parámetros— no quedó nunca en la base de Javo: esta
-- migración es la primera que crea la función. El drop está igual, porque la
-- próxima vez que le entre un parámetro las dos firmas van a convivir y una
-- llamada con los de siempre encaja en las dos.
drop function if exists public.decidir_evidencia(text, text, text);

revoke all on function public.decidir_evidencia(text, text, text, uuid, text) from public;
grant execute on function public.decidir_evidencia(text, text, text, uuid, text) to authenticated;

-- ── 5 · La cola ───────────────────────────────────────────────────────
--
-- Lo que espera una decisión, de todos los clientes, en una consulta. Sin
-- esto habría que abrir las treinta fichas para encontrar las dos que
-- esperan, y lo que hay que buscar no se mira.
create or replace function public.cola_de_evidencias()
returns table (
  archivo         text,
  cliente_id      uuid,
  cliente         text,
  meta_codigo     text,
  estado          text,
  quien           text,
  motivo          text,
  decidido_en     timestamptz,
  jornada_cerrada boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.archivo,
    v.cliente_id,
    coalesce(p.nombre, 'Un cliente'),
    v.meta_codigo,
    v.estado,
    v.quien,
    v.motivo,
    v.decidido_en,
    exists (
      select 1 from public.hoja_de_ruta h
       where h.usuario_id = v.cliente_id
         and h.meta_codigo = v.meta_codigo
         and h.completada)
  from public.evidencia_veredictos v
  left join public.profiles p on p.id = v.cliente_id
  where public.es_del_equipo(auth.uid())
    and v.estado in ('pendiente', 'rechazada')
  order by v.decidido_en asc;
$$;

comment on function public.cola_de_evidencias is
  'Las evidencias que esperan una decisión del equipo, de todos los clientes, con el motivo de la IA y si esa jornada ya cerró.';

revoke all on function public.cola_de_evidencias() from public;
grant execute on function public.cola_de_evidencias() to authenticated;
