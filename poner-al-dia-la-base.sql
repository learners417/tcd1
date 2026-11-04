-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  PONER AL DÍA LA BASE                                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- 4 de noviembre de 2026.
--
-- La base tenía corridas las migraciones hasta principios de octubre y
-- algunas sueltas de después. Faltaban 16 funciones y 8 tablas que la app usa
-- todos los días, entre ellas:
--
--   · `marcar_servicio`, que sella qué contrató cada cliente y con qué fecha.
--     Esa fecha es la que hace correr el tope de los 90 días.
--   · `habilitar_migracion`, la llave de «trae tu trabajo».
--   · la política que le da al equipo permiso para EDITAR la ficha de un
--     cliente. Sin ella, el alta desde el panel guardaba cero filas y la
--     pantalla decía que había guardado.
--
-- Esto es el SQL del repositorio: los 23 archivos que van del 30 de septiembre
-- al 3 de noviembre, uno detrás del otro en orden de fecha. No es SQL nuevo:
-- es el que ya estaba escrito y nunca se corrió.
--
-- SE PUEDE CORRER AUNQUE PARTE YA ESTÉ HECHA. Los 23 archivos están escritos
-- para aguantar correrse de nuevo: cada tabla con `if not exists`, cada
-- función con `create or replace`, cada política y cada restricción mirando
-- antes si ya existe. Lo que ya está, no se toca.
--
-- Probado contra un PostgreSQL real, partiendo de una base armada igual a
-- esta: corre entero sin un error, corre dos veces sin un error, y al final
-- las 16 funciones y las 8 tablas están.
--
-- Corre todo junto o no corre nada: el editor de Supabase lo mete en una sola
-- operación. Si algo falla, la base queda como estaba.
--
-- Al final hay una consulta que dice qué quedó. Sin líneas que empiecen con
-- FALTA, está completo.


-- ───────────────────────────────────────────────────────────────────────────
-- 1 de 23 · 20260930_pausa_global.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════
-- LA PAUSA GLOBAL — parar el Camino de todos a la vez.
--
-- Primer uso: del 15 de diciembre al 15 de enero. Durante la pausa el
-- Camino queda a la vista, pero nadie acumula atraso ni aparece en el
-- semáforo. Al terminar, las fechas de todos se corren los días que
-- duró, con el progreso intacto.
--
-- Una sola fila activa por vez. Se guardan las anteriores para poder
-- mirar hacia atrás y para que las fechas sigan cuadrando después.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.pausas_globales (
  id uuid primary key default gen_random_uuid(),
  desde date not null,
  hasta date not null,
  motivo text,
  creada_por text,
  creada_el timestamptz default now(),
  check (hasta >= desde)
);

alter table public.pausas_globales enable row level security;

-- Todos la leen: el cliente necesita ver cuándo retoma su Camino.
drop policy if exists "pausas visibles para todos" on public.pausas_globales;
create policy "pausas visibles para todos"
  on public.pausas_globales for select
  to authenticated using (true);

-- Solo el equipo la crea o la levanta. Se mira la columna `rol`, igual que
-- todas las demás políticas de la base: `es_admin` no existe en profiles.
drop policy if exists "pausas las maneja el equipo" on public.pausas_globales;
create policy "pausas las maneja el equipo"
  on public.pausas_globales for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin'));

comment on table public.pausas_globales is
  'Los tramos en que el Camino se detuvo para todos. Las fechas de cada cliente se corren esos días.';


-- ───────────────────────────────────────────────────────────────────────────
-- 2 de 23 · 20261002_numeros_del_cliente.sql
-- ───────────────────────────────────────────────────────────────────────────

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


-- ───────────────────────────────────────────────────────────────────────────
-- 3 de 23 · 20261009_canal_unico_soporte.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  UN SOLO CANAL PARA EL SOPORTE
--
--  Hasta hoy había tres nombres de canal para la misma conversación:
--
--    · el cliente escribía en   'Consultas Generales'
--    · el Admin leía            'privado'
--    · la Bandeja de Soporte    'humano'
--
--  Resultado: el mensaje del cliente quedaba guardado acá y no aparecía
--  en ninguna pantalla del equipo. Y como 'Consultas Generales' no es
--  'privado', la política de lectura lo dejaba a la vista de CUALQUIER
--  cliente autenticado.
--
--  El canal único es 'privado', que es el que la política ya protege:
--  lo ven el emisor, el receptor y el equipo. Nadie más.
--
--    cliente → equipo:  canal='privado', emisor=cliente, receptor=NULL
--    equipo → cliente:  canal='privado', emisor=quien responde, receptor=cliente
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 · Las columnas del reloj de respuesta ─────────────────────────
-- Viven en sala-de-mando.sql, que quedó fuera de las migraciones y puede
-- no haber corrido nunca. Sin ellas el compromiso de 24 h es decorativo.

alter table public.mensajes add column if not exists tipo text;
alter table public.mensajes add column if not exists respondido_en timestamptz;

-- 'duda' espera un día; 'roto' le está costando dinero ahora.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mensajes_tipo_check'
  ) then
    alter table public.mensajes
      add constraint mensajes_tipo_check
      check (tipo is null or tipo in ('duda', 'roto'));
  end if;
end $$;

-- ── 2 · Mudar lo que ya está escrito ───────────────────────────────
-- Los mensajes que los clientes mandaron y nadie vio. Pasan a 'privado'
-- con receptor NULL, que es como se escribe de ahora en más.

update public.mensajes
   set canal = 'privado',
       receptor_id = null
 where canal = 'Consultas Generales';

-- Lo que el equipo mandó por el canal viejo. Acá el receptor ya venía
-- cargado; si no, no hay a quién devolvérselo y se deja como está.
update public.mensajes
   set canal = 'privado'
 where canal = 'humano'
   and receptor_id is not null;

-- ── 3 · Que el equipo entero reciba el aviso ───────────────────────
-- La función que avisa buscaba solo perfiles con rol='admin', así que
-- quien tiene admin_rol pero no ese rol no recibía nada, aunque la
-- política de lectura sí lo deje leer. Mismo criterio que is_team_member().

create or replace function public.ids_del_equipo()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles
   where rol = 'admin'
      or admin_rol in ('owner', 'manager', 'staff');
$$;

grant execute on function public.ids_del_equipo() to authenticated;

-- ── 4 · Buscar lo que espera respuesta, rápido ─────────────────────
create index if not exists idx_mensajes_soporte_pendiente
  on public.mensajes (created_at desc)
  where canal = 'privado' and receptor_id is null and respondido_en is null;

-- ── 5 · Marcar respondido ──────────────────────────────────────────
-- La versión de sala-de-mando.sql filtraba por canal='humano', así que
-- nunca marcaba nada. Esta trabaja sobre el canal único.

-- `marcar_respondido` ya existe en sala-de-mando.sql devolviendo void, y acá
-- devuelve cuántos mensajes marcó. `create or replace` no puede cambiar el
-- tipo de retorno de una función que ya está: hay que soltarla primero.
--
-- El drop va EN ESTA migración y no en una posterior: corriendo de arriba
-- hacia abajo, esta es la primera que toca la función, así que un drop más
-- abajo nunca llega a ejecutarse — la corrida se detiene acá.
drop function if exists public.marcar_respondido(uuid);

create or replace function public.marcar_respondido(p_cliente uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede marcar un mensaje como respondido';
  end if;

  update public.mensajes
     set respondido_en = now()
   where canal = 'privado'
     and emisor_id = p_cliente
     and receptor_id is null
     and respondido_en is null;

  get diagnostics v_filas = row_count;
  return v_filas;
end $$;

grant execute on function public.marcar_respondido(uuid) to authenticated;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) as sin_mudar from public.mensajes
--  where canal in ('Consultas Generales', 'humano');   -- debe dar 0


-- ───────────────────────────────────────────────────────────────────────────
-- 4 de 23 · 20261009_servicio_contratado.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  EL SERVICIO CONTRATADO, SEPARADO DEL PLAN DE ACCESO
--
--  Había una sola columna haciendo dos trabajos. `plan_comercial`
--  gobierna qué pantallas ve el cliente ($27 / $497 / $997), y el
--  código la traducía además a un escalón de servicio humano:
--
--      verde  → $5.000 de instalación
--      negro  → $10.000 con sesiones de dirección
--
--  O sea que alguien que pagó $497 de acceso aparecía en su ficha como
--  «la agencia instala 51 de 62 ítems». Quien trabajara contra ese
--  cuadro instalaba de regalo.
--
--  Son dos preguntas distintas y ahora son dos columnas distintas:
--
--      plan_comercial       → qué ve.    La decide el checkout.
--      servicio_contratado  → qué debe.  La marca una persona.
--
--  TODOS los clientes actuales quedan en el escalón más bajo. Es a
--  propósito: mostrarle de menos a quien pagó se arregla con un
--  mensaje; mostrarle de más hace trabajar al equipo gratis y nadie se
--  entera hasta que es tarde. Hay que marcar uno por uno en su ficha.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── El escalón de servicio ─────────────────────────────────────────
--   base         $1.000  los cuatro manuales, su plan, 3 sesiones 1-1, la app
--   ascenso      $3.000  los 90 días completos, grupales 3x semana, garantía
--   instalacion  $5.000  el equipo monta todo

alter table public.profiles
  add column if not exists servicio_contratado text not null default 'base';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_servicio_contratado_check'
  ) then
    alter table public.profiles
      add constraint profiles_servicio_contratado_check
      check (servicio_contratado in ('base', 'ascenso', 'instalacion'));
  end if;
end $$;

comment on column public.profiles.servicio_contratado is
  'Qué le debe el equipo. Se marca a mano en la ficha del cliente. NUNCA se deriva de plan_comercial: son dos escaleras distintas.';

-- ── La Cima, que se suma a cualquiera de los tres ──────────────────
-- Los cinco días en Bariloche. No cambia el reparto de los 62 ítems,
-- así que es un sí o no aparte y no un cuarto escalón.

alter table public.profiles
  add column if not exists cima_incluida boolean not null default false;

comment on column public.profiles.cima_incluida is
  'Los cinco días en Bariloche. Se suma a cualquier escalón de servicio.';

-- ── Quién puede cambiarlo ──────────────────────────────────────────
-- Solo el equipo, y queda registrado quién lo marcó y cuándo: es una
-- columna que decide trabajo pagado, no una preferencia.

alter table public.profiles
  add column if not exists servicio_marcado_por uuid references public.profiles(id),
  add column if not exists servicio_marcado_el timestamptz;

create or replace function public.marcar_servicio(
  p_cliente uuid,
  p_servicio text,
  p_cima boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede marcar el servicio contratado';
  end if;

  if p_servicio not in ('base', 'ascenso', 'instalacion') then
    raise exception 'Escalón desconocido: %', p_servicio;
  end if;

  update public.profiles
     set servicio_contratado  = p_servicio,
         cima_incluida        = coalesce(p_cima, cima_incluida),
         servicio_marcado_por = auth.uid(),
         servicio_marcado_el  = now()
   where id = p_cliente;
end $$;

grant execute on function public.marcar_servicio(uuid, text, boolean) to authenticated;

-- ── La ventana de acceso ───────────────────────────────────────────
-- Treinta días, noventa, o en cuotas. Hasta hoy esto solo se podía
-- cargar a mano en la base o por script: el alta no lo pedía y no había
-- dónde editarlo después, así que los clientes quedaban sin ventana.

create or replace function public.marcar_acceso(
  p_cliente uuid,
  p_tipo    text,
  p_hasta   date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede cambiar la ventana de acceso';
  end if;

  if p_tipo not in ('treinta', 'noventa', 'cuotas') then
    raise exception 'Ventana desconocida: %', p_tipo;
  end if;

  update public.profiles
     set acceso_tipo  = p_tipo,
         acceso_hasta = p_hasta
   where id = p_cliente;
end $$;

grant execute on function public.marcar_acceso(uuid, text, date) to authenticated;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select servicio_contratado, count(*) from public.profiles
--  group by 1 order by 1;        -- al principio: todos en 'base'


-- ───────────────────────────────────────────────────────────────────────────
-- 5 de 23 · 20261010_mensajes_sin_leer.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  LOS MENSAJES SIN LEER, Y LOS ADJUNTOS DEL CLIENTE
--
--  Dos cosas que faltaban para que la app reemplace a Discord.
--
--  1 · NADIE SABÍA QUE TENÍA UN MENSAJE SIN LEER.
--      El contador del cliente estaba fijado en cero dentro del código,
--      y el del equipo se suscribía a una lista vacía. Los dos lados
--      dependían de abrir la pantalla por las dudas.
--
--  2 · EL CLIENTE SOLO PODÍA ESCRIBIR TEXTO.
--      La mitad de lo que manda alguien pidiendo ayuda es una captura
--      de pantalla. El bucket y las columnas existían en un archivo
--      suelto en la raíz del repo, fuera de las migraciones, así que no
--      hay forma de saber si llegaron a correr.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 · Cuándo lo leyó quien lo recibió ────────────────────────────
alter table public.mensajes add column if not exists leido_en timestamptz;

comment on column public.mensajes.leido_en is
  'Cuándo lo abrió quien lo recibió. Null = sin leer.';

create index if not exists idx_mensajes_sin_leer
  on public.mensajes (receptor_id)
  where canal = 'privado' and leido_en is null;

-- ── 2 · Marcar leída la conversación ───────────────────────────────
-- Se llama al abrir Soporte. Marca solo lo que le llegó a esa persona:
-- lo que ella misma escribió nunca cuenta como sin leer.

create or replace function public.marcar_leidos()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
begin
  update public.mensajes
     set leido_en = now()
   where canal = 'privado'
     and receptor_id = auth.uid()
     and leido_en is null;

  get diagnostics v_filas = row_count;
  return v_filas;
end $$;

grant execute on function public.marcar_leidos() to authenticated;

-- ── 3 · Cuántos esperan al equipo ──────────────────────────────────
-- Lo que escribió un cliente y todavía nadie respondió. El equipo no
-- tiene un receptor propio: los mensajes entrantes llegan sin destinatario.

create or replace function public.cuantos_esperan()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from public.profiles
       where id = auth.uid()
         and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
    )
    then (
      select count(*)::integer from public.mensajes
       where canal = 'privado'
         and receptor_id is null
         and respondido_en is null
    )
    else 0
  end;
$$;

grant execute on function public.cuantos_esperan() to authenticated;

-- ── 4 · Los adjuntos ───────────────────────────────────────────────
-- Estas dos columnas y el bucket vivían en media-migration.sql, en la
-- raíz del repo. Se repiten acá para que el estado quede garantizado.

alter table public.mensajes add column if not exists tipo_archivo text;
alter table public.mensajes add column if not exists archivo_url  text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mensajes_tipo_archivo_check'
  ) then
    alter table public.mensajes
      add constraint mensajes_tipo_archivo_check
      check (tipo_archivo is null or tipo_archivo in ('imagen', 'audio', 'archivo'));
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('mensajes-archivos', 'mensajes-archivos', true)
on conflict (id) do nothing;

-- Cada quien sube a su propia carpeta, que lleva su id. Así el borrado
-- por dueño funciona y nadie pisa los archivos de otro.
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'mensajes_archivos_upload'
  ) then
    create policy "mensajes_archivos_upload"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'mensajes-archivos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'mensajes_archivos_read'
  ) then
    create policy "mensajes_archivos_read"
      on storage.objects for select
      using (bucket_id = 'mensajes-archivos');
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'mensajes_archivos_delete'
  ) then
    create policy "mensajes_archivos_delete"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'mensajes-archivos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select public.cuantos_esperan();   -- desde una cuenta del equipo


-- ───────────────────────────────────────────────────────────────────────────
-- 6 de 23 · 20261011_matriz_compartida.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  LA MATRIZ, COMPARTIDA DE VERDAD
--
--  La pantalla promete que el estado de cada celda, la nota y el link
--  del anuncio los ve todo el equipo. No era así.
--
--  DOS COSAS ESTABAN ROTAS, Y LAS DOS EN SILENCIO:
--
--  1 · LAS COLUMNAS NO EXISTÍAN. El código escribe `estado`, `nota` y
--      `link`; la tabla solo tiene `notas`. El error se descartaba y
--      todo caía a localStorage: Lupe cargaba el link de un anuncio y
--      Javo, desde su teléfono, no veía nada.
--
--  2 · SE GUARDABA CON UN UPDATE, Y LA FILA SOLO EXISTE SI EL PASO ESTÁ
--      TILDADO. Así que poner una nota en un paso pendiente —que es
--      justo cuando una nota sirve— no guardaba nada, ni siquiera con
--      las columnas creadas.
--
--  El arreglo de fondo: una fila ahora puede existir SIN estar tildada.
--  `completado_at` pasa a poder ser nulo, y eso es lo que distingue
--  «tildado» de «tiene una nota y sigue pendiente».
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 · Una fila puede existir sin estar tildada ───────────────────
alter table public.cliente_preactivacion_check
  alter column completado_at drop not null,
  alter column completado_at drop default;

comment on column public.cliente_preactivacion_check.completado_at is
  'Cuándo se tildó. NULL = la fila existe por su nota, su link o su estado, y el paso sigue pendiente.';

-- ── 2 · Lo que cada celda guarda ───────────────────────────────────
alter table public.cliente_preactivacion_check
  add column if not exists estado text,
  add column if not exists nota   text,
  add column if not exists link   text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'preactivacion_estado_check'
  ) then
    alter table public.cliente_preactivacion_check
      add constraint preactivacion_estado_check
      check (estado is null or estado in ('pendiente', 'proceso', 'listo', 'na'));
  end if;
end $$;

-- `notas` (plural) es la columna vieja, que ninguna pantalla escribió nunca.
-- Lo que haya adentro se pasa a la nueva antes de dejarla quieta.
--
-- Va preguntando si la columna está, y no derecho: la tabla se creó a mano en
-- Supabase y no la crea ninguna migración de este repo, así que no hay dónde
-- leer si `notas` existe o no. Dando por hecho que está, la migración falla
-- en la base donde no está — y falla a mitad de camino, con los pasos de
-- arriba aplicados y los de abajo no.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'cliente_preactivacion_check'
      and column_name  = 'notas'
  ) then
    execute 'update public.cliente_preactivacion_check
                set nota = notas
              where nota is null and notas is not null';
  end if;
end $$;

-- ── 3 · Guardar sin pisar el tilde ─────────────────────────────────
-- Crea la fila si no está, y deja `completado_at` como esté: poner una
-- nota no tilda el paso, y tildarlo no borra la nota.

create or replace function public.guardar_extra_celda(
  p_cliente uuid,
  p_step    text,
  p_estado  text default null,
  p_nota    text default null,
  p_link    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede escribir en la matriz';
  end if;

  insert into public.cliente_preactivacion_check
         (cliente_id, step_id, completado_at, completado_por, estado, nota, link)
  values (p_cliente, p_step, null, auth.uid(), p_estado, p_nota, p_link)
  on conflict (cliente_id, step_id) do update
    set estado = coalesce(excluded.estado, cliente_preactivacion_check.estado),
        nota   = coalesce(excluded.nota,   cliente_preactivacion_check.nota),
        link   = coalesce(excluded.link,   cliente_preactivacion_check.link);

  -- Una celda que se queda sin nada y sin tilde no deja basura atrás.
  delete from public.cliente_preactivacion_check
   where cliente_id = p_cliente and step_id = p_step
     and completado_at is null
     and coalesce(estado, '') = '' and coalesce(nota, '') = '' and coalesce(link, '') = '';
end $$;

grant execute on function public.guardar_extra_celda(uuid, text, text, text, text) to authenticated;

-- ── 4 · El equipo puede leer el Camino de sus clientes ─────────────
--
-- Diecinueve de los 62 pasos se tildan solos cuando el cliente completa
-- su sesión. La única política de `hoja_de_ruta` era
-- `auth.uid() = usuario_id`, así que esa consulta devolvía las filas del
-- propio admin y nada más: los tildes automáticos no aparecían nunca.

do $$
begin
  if to_regclass('public.hoja_de_ruta') is not null then
    drop policy if exists "hoja_de_ruta_equipo_lee" on public.hoja_de_ruta;
    create policy "hoja_de_ruta_equipo_lee" on public.hoja_de_ruta
      for select using (
        exists (
          select 1 from public.profiles
           where id = auth.uid()
             and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
        )
      );
  end if;
end $$;

-- Solo lectura, a propósito: el Camino lo cierra el cliente. Si el
-- equipo pudiera tildarlo por él, el avance dejaría de querer decir algo.

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) from public.cliente_preactivacion_check
--  where completado_at is null;     -- celdas con nota y sin tildar


-- ───────────────────────────────────────────────────────────────────────────
-- 7 de 23 · 20261012_montaje_de_campana.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  EL MONTAJE DE LA CAMPAÑA, CON LOS DATOS ADENTRO
--
--  ═══ LOS DOS PROBLEMAS QUE RESUELVE ═══
--
--  1 · LOS OCHO CANDADOS VIVÍAN EN EL NAVEGADOR.
--      Lo que el cliente tilda antes de encender estaba en localStorage:
--      cambia de teléfono o limpia el navegador y lo pierde todo. Y el
--      equipo no lo veía nunca, aunque es el único gate real del botón
--      de encender.
--
--  2 · LA PIEZA REAL DE LA CAMPAÑA NO SE CARGABA EN NINGÚN LADO.
--      El link del anuncio corriendo en Meta, el píxel, el dominio, la
--      página de captura, el formulario y el calendario: ninguno tenía
--      dónde guardarse. Cuatro de ellos existían solo como un tilde de
--      sí o no, sin el dato.
--
--  La decisión que une las dos: EL CANDADO ES EL DATO. «Tu píxel está
--  activo» no se tilda a mano — se tilda porque el id del píxel está
--  cargado. Un tilde vacío no prueba nada y nadie lo puede verificar;
--  un dato sí, y además le sirve al equipo para mirarlo.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.montaje_campana (
  user_id uuid primary key references public.profiles(id) on delete cascade,

  -- ── Lo que se tilda porque el dato está ──────────────────────────
  palabra          text,   -- la palabra que dispara el recuperador
  url_pagina       text,   -- su página de venta, con precio y agenda
  pixel_id         text,   -- el píxel instalado y verificado
  url_perfil       text,   -- el link de su bio
  presupuesto_diario numeric,
  dias_sostenidos    integer,

  -- ── Lo que es una acción, no un dato ─────────────────────────────
  dm_probado  boolean not null default false,  -- escribió desde otra cuenta y le llegó
  trabajo_claro boolean not null default false,

  -- ── La pieza real, que hasta hoy no tenía dónde vivir ────────────
  url_anuncio_meta text,   -- el anuncio corriendo, para poder mirarlo
  dominio          text,
  url_formulario   text,
  url_calendario   text,

  actualizado_el timestamptz not null default now()
);

comment on table public.montaje_campana is
  'Lo que el cliente montó antes de encender. Cada candado guarda el dato que lo prueba, no un tilde suelto.';

create or replace function public.montaje_toca_fecha()
returns trigger language plpgsql as $$
begin
  new.actualizado_el := now();
  return new;
end $$;

drop trigger if exists montaje_campana_touch on public.montaje_campana;
create trigger montaje_campana_touch
  before update on public.montaje_campana
  for each row execute function public.montaje_toca_fecha();

-- ── Quién ve y quién escribe ───────────────────────────────────────
-- El cliente carga lo suyo. El equipo lee todo: es lo que necesita para
-- saber si alguien está listo para encender, y para mirar el anuncio.

alter table public.montaje_campana enable row level security;

drop policy if exists "montaje_cliente" on public.montaje_campana;
create policy "montaje_cliente" on public.montaje_campana
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "montaje_equipo_lee" on public.montaje_campana;
create policy "montaje_equipo_lee" on public.montaje_campana
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = auth.uid()
         and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
    )
  );

-- El equipo lee, no escribe: lo monta el cliente, y si lo cargara el
-- equipo por él nadie sabría si de verdad está hecho.

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) from public.montaje_campana;


-- ───────────────────────────────────────────────────────────────────────────
-- 8 de 23 · 20261013_sesiones_humanas.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  LAS SESIONES CON PERSONAS
--
--  ═══ EL HUECO QUE CIERRA ═══
--
--  Lo que se vende es acompañamiento: la sesión uno a uno de arranque y
--  las mentorías grupales tres veces por semana durante 90 días. Es el
--  corazón de la oferta, y era **lo único que no dejaba rastro en la
--  app**: no había tabla, ni pantalla, ni registro de una sola sesión.
--
--  Lo más parecido que existía era «Cargar sesión», que guarda las
--  DECISIONES de una sesión. Útil, pero si una sesión no produjo una
--  decisión no quedaba nada — y el hecho de que la sesión ocurrió es lo
--  que sostiene la garantía y lo que el cliente necesita ver.
--
--  Dos tablas porque una grupal tiene varios asistentes: la sesión
--  ocurre una vez, y a ella va quien va.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.sesiones (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,

  -- 'arranque'   la uno a uno que abre los 90 días
  -- 'grupal'     las mentorías de tres veces por semana
  -- 'uno_a_uno'  cualquier otra sesión individual
  tipo text not null check (tipo in ('arranque', 'grupal', 'uno_a_uno')),

  quien_la_dio   text not null,
  quien_la_cargo uuid references public.profiles(id) on delete set null,

  /* Lo que pasó, en las palabras de quien la dio. */
  notas text,
  /* Lo que quedó para la próxima. */
  pendiente text,

  minutos integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_sesiones_fecha on public.sesiones (fecha desc);

comment on table public.sesiones is
  'Cada sesión con personas que ocurrió. Es lo que sostiene la promesa de acompañamiento.';

-- ── Quién estuvo ───────────────────────────────────────────────────
create table if not exists public.sesiones_asistentes (
  sesion_id  uuid not null references public.sesiones(id) on delete cascade,
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  /* Falso = estaba invitado y no vino. Se guarda igual: una grupal a la
     que alguien falta tres veces seguidas dice algo. */
  asistio boolean not null default true,
  primary key (sesion_id, cliente_id)
);

create index if not exists idx_sesiones_asistentes_cliente
  on public.sesiones_asistentes (cliente_id);

-- ── Quién ve y quién escribe ───────────────────────────────────────
-- Las carga el equipo. El cliente ve las suyas, y nada más: en una
-- grupal no tiene por qué saber quiénes fueron los demás.

alter table public.sesiones enable row level security;
alter table public.sesiones_asistentes enable row level security;

drop policy if exists "sesiones_equipo" on public.sesiones;
create policy "sesiones_equipo" on public.sesiones
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

drop policy if exists "sesiones_cliente_lee_las_suyas" on public.sesiones;
create policy "sesiones_cliente_lee_las_suyas" on public.sesiones
  for select to authenticated
  using (
    exists (select 1 from public.sesiones_asistentes a
             where a.sesion_id = sesiones.id and a.cliente_id = auth.uid())
  );

drop policy if exists "asistentes_equipo" on public.sesiones_asistentes;
create policy "asistentes_equipo" on public.sesiones_asistentes
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

drop policy if exists "asistentes_cliente_ve_su_fila" on public.sesiones_asistentes;
create policy "asistentes_cliente_ve_su_fila" on public.sesiones_asistentes
  for select to authenticated
  using (cliente_id = auth.uid());

-- ── Cargar una sesión con sus asistentes, de una sola vez ──────────
-- Si se hiciera en dos pasos desde la pantalla y el segundo fallara,
-- quedaría una sesión sin nadie adentro: un registro que dice que algo
-- pasó, sin decir a quién. Peor que no tenerlo.

create or replace function public.cargar_sesion(
  p_tipo       text,
  p_fecha      date,
  p_quien      text,
  p_clientes   uuid[],
  p_notas      text default null,
  p_pendiente  text default null,
  p_minutos    integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_cliente uuid;
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede cargar una sesión';
  end if;

  if p_clientes is null or array_length(p_clientes, 1) is null then
    raise exception 'Una sesión sin asistentes no dice nada: elige al menos uno';
  end if;

  insert into public.sesiones (tipo, fecha, quien_la_dio, quien_la_cargo, notas, pendiente, minutos)
  values (p_tipo, coalesce(p_fecha, current_date), p_quien, auth.uid(), p_notas, p_pendiente, p_minutos)
  returning id into v_id;

  foreach v_cliente in array p_clientes loop
    insert into public.sesiones_asistentes (sesion_id, cliente_id)
    values (v_id, v_cliente)
    on conflict do nothing;
  end loop;

  return v_id;
end $$;

grant execute on function public.cargar_sesion(text, date, text, uuid[], text, text, integer) to authenticated;

-- ── Hace cuánto que cada cliente no tiene una sesión ───────────────
-- El número que le sirve al equipo: quien lleva tres semanas sin una
-- está dejando de recibir lo que compró, y nadie se entera solo.

create or replace function public.dias_sin_sesion()
returns table (cliente_id uuid, ultima date, dias integer)
language sql
stable
security definer
set search_path = public
as $$
  select p.id,
         max(s.fecha) as ultima,
         (current_date - max(s.fecha))::integer as dias
    from public.profiles p
    left join public.sesiones_asistentes a on a.cliente_id = p.id and a.asistio
    left join public.sesiones s on s.id = a.sesion_id
   where exists (
     select 1 from public.profiles q
      where q.id = auth.uid()
        and (q.rol = 'admin' or q.admin_rol in ('owner', 'manager', 'staff'))
   )
   group by p.id;
$$;

grant execute on function public.dias_sin_sesion() to authenticated;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) from public.sesiones;


-- ───────────────────────────────────────────────────────────────────────────
-- 9 de 23 · 20261014_funciones_de_la_jornada.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  EN QUÉ FUNCIONES SE FUE EL DÍA
--
--  La Semana tiene una tabla de seis funciones que dice si el negocio escaló
--  o si simplemente hubo menos trabajo. Es el tablero que decide si el
--  modelo funciona.
--
--  No tenía con qué llenarse. La jornada guarda los minutos de reloj y a
--  quién atendió, pero no en qué trabajó, así que la pantalla recibía una
--  sola función con datos y las otras cinco en cero. Y «absorber» en cero,
--  siendo la única función que debe crecer, se leía como la peor noticia
--  posible: la tabla mostraba esa alerta todos los días desde que existe,
--  sin que nadie hubiera dejado de absorber nada.
--
--  Lo que se agrega es el dato que falta, y nada más: al cerrar el día la
--  persona marca EN QUÉ trabajó. Los minutos siguen siendo los del reloj y
--  se reparten entre lo que marcó. No se le preguntan minutos por función
--  —nadie los sabe— solo en qué se fue el día.
--
--  Idempotente: correrla dos veces no rompe nada.
-- ════════════════════════════════════════════════════════════════════════

alter table jornadas
  add column if not exists funciones text[] not null default '{}';

comment on column jornadas.funciones is
  'Los ids de funciones en las que trabajó ese día: criterio, instalacion, destrabar, absorber, producir, cobrar. Los minutos de reloj se reparten entre estas.';

-- Cierra el día, ahora con las funciones en las que se fue.
--
-- El parámetro va al final y con default, así que una app vieja que llame
-- cerrar_jornada(persona, atendidos, traba, traba_cliente) sigue andando:
-- guarda el día sin funciones, igual que antes.
-- Las dos firmas que puede haber dejado una versión anterior. Sin esto,
-- `create or replace` choca contra la que ya está y la corrida se detiene
-- acá, antes de llegar a cualquier migración posterior.
drop function if exists public.cerrar_jornada(uuid, uuid[], text, uuid);
drop function if exists public.cerrar_jornada(uuid, uuid[], text, uuid, text[]);

create or replace function cerrar_jornada(
  p_persona uuid,
  p_atendidos uuid[],
  p_traba text default null,
  p_traba_cliente uuid default null,
  p_funciones text[] default null
) returns void
language plpgsql security definer as $$
begin
  update jornadas
  set fin = now(),
      atendidos = coalesce(p_atendidos, '{}'),
      traba = nullif(trim(coalesce(p_traba, '')), ''),
      traba_cliente = p_traba_cliente,
      funciones = coalesce(p_funciones, funciones, '{}')
  where persona_id = p_persona and dia = current_date;
end $$;

-- Las jornadas de los últimos N días, ahora con sus funciones.
--
-- La Semana compara esta semana contra el promedio de las anteriores, así que
-- pide 28 días y agrupa. Antes pedía 7: con una sola semana no hay con qué
-- comparar y la columna de tendencia no podía mostrar nada nunca.
-- Suma la columna `funciones` a lo que devuelve, y eso cambia el tipo de
-- retorno: la de sala-de-mando.sql devuelve ocho columnas y esta nueve.
drop function if exists public.jornadas_recientes(int);

create or replace function jornadas_recientes(p_dias int default 7)
returns table (
  persona_id uuid, dia date, inicio timestamptz, fin timestamptz,
  planeados uuid[], atendidos uuid[], traba text, traba_cliente uuid,
  funciones text[]
)
language sql security definer as $$
  select j.persona_id, j.dia, j.inicio, j.fin,
         j.planeados, j.atendidos, j.traba, j.traba_cliente,
         coalesce(j.funciones, '{}')
  from jornadas j
  where j.dia > current_date - p_dias
    and exists (select 1 from profiles p
                where p.id = auth.uid() and p.rol = 'admin')
  order by j.dia desc, j.inicio desc;
$$;


-- ───────────────────────────────────────────────────────────────────────────
-- 10 de 23 · 20261015_biblioteca_por_cliente.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  LA BIBLIOTECA ABIERTA, CLIENTE POR CLIENTE
--
--  La Biblioteca junta todos los videos y tutoriales en un solo lugar, más
--  allá del día del Camino en que vaya cada uno. Hasta ahora lo único que
--  decidía qué podía ver era su avance: `minPilar: 2` para entrar y, adentro,
--  lo que ya hubiera desbloqueado.
--
--  Eso está bien como regla general —el Camino se recorre, no se saltea— pero
--  no deja hacer lo único que el equipo necesita: darle acceso completo a un
--  cliente puntual. Al de La Instalación, que no recorre el Camino. Al que
--  renovó. Al que pidió ver una clase que todavía no le toca.
--
--  Así que es un permiso explícito, no derivado del plan: se marca por
--  cliente y queda escrito quién lo dio y cuándo. Un permiso que se deduce de
--  otra cosa es un permiso que nadie puede explicar cuando hay que revisarlo.
--
--  Idempotente: correrla dos veces no rompe nada.
-- ════════════════════════════════════════════════════════════════════════

alter table profiles
  add column if not exists biblioteca_abierta boolean not null default false,
  add column if not exists biblioteca_abierta_por uuid references auth.users(id),
  add column if not exists biblioteca_abierta_el timestamptz;

comment on column profiles.biblioteca_abierta is
  'true = ve la Biblioteca completa, sin esperar su día del Camino. Se marca a mano desde el Admin.';

-- Abre o cierra la Biblioteca de un cliente.
--
-- Solo el equipo. Y queda la firma: quién la abrió y cuándo. Al cerrarla se
-- borra la firma, porque una firma vieja sobre un permiso que ya no está
-- cuenta una historia que no es.
-- Se suelta antes de crear porque la migración que la endurece después
-- (20261018) le deja un default en `p_quien`, y `create or replace` no puede
-- quitarle un default a una función que ya está. Sin este drop la corrida
-- funciona la primera vez y falla la segunda, que es la peor forma de fallar:
-- se descubre reaplicando, con la base a medio actualizar.
drop function if exists public.marcar_biblioteca(uuid, boolean, uuid);

create or replace function marcar_biblioteca(
  p_cliente uuid,
  p_abierta boolean,
  p_quien uuid
) returns void
language plpgsql security definer as $$
begin
  if not exists (
    select 1 from profiles p
    where p.id = p_quien
      and (p.rol = 'admin' or p.admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede abrir la Biblioteca de un cliente';
  end if;

  update profiles
  set biblioteca_abierta = p_abierta,
      biblioteca_abierta_por = case when p_abierta then p_quien else null end,
      biblioteca_abierta_el  = case when p_abierta then now() else null end
  where id = p_cliente;
end $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 11 de 23 · 20261016_canales_y_reportes.sql
-- ───────────────────────────────────────────────────────────────────────────

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


-- ───────────────────────────────────────────────────────────────────────────
-- 12 de 23 · 20261017_migracion_del_cliente.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  QUE EL CLIENTE SE MIGRE SOLO
--
--  El asistente de migración existe y funciona, pero vive en el Admin:
--  alguien del equipo abre la ficha de cada cliente, pega su material,
--  revisa los campos y confirma. Con diez clientes viejos a mudar de
--  Discord son diez sesiones de una persona copiando el trabajo de
--  otra — y nadie conoce el material del cliente mejor que él.
--
--  Esto agrega la llave: el equipo HABILITA, el cliente MIGRA.
--
--  Dos columnas y nada más. A propósito: la migración escribe en las
--  tablas que ya existen (profiles para el ADN, hoja_de_ruta para el
--  Camino). Una tabla nueva para «la migración» sería un segundo lugar
--  donde vive el mismo dato, y el día que no coincidan, el cliente ve
--  una cosa y el equipo otra.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── La llave ───────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists migracion_habilitada boolean not null default false;

comment on column public.profiles.migracion_habilitada is
  'Si el cliente puede migrarse solo. La enciende el equipo desde su ficha. Sin esto la pantalla no le aparece: un cliente nuevo que se migrara se saltearía su propio Camino.';

-- Cuándo la terminó. Sirve para dos cosas: que el equipo sepa quién ya
-- pasó, y que la pantalla no se le vuelva a ofrecer a quien ya migró
-- —ofrecerle migrar de nuevo a alguien que ya tiene su ADN cargado es
-- invitarlo a pisar su propio trabajo con un texto pegado apurado.
alter table public.profiles
  add column if not exists migrado_en timestamptz;

comment on column public.profiles.migrado_en is
  'Cuándo el cliente terminó su migración. Nulo si todavía no la hizo.';

-- ── Quién puede encender la llave ──────────────────────────────────
-- Solo el equipo. Si el cliente pudiera encenderla, la llave no sería
-- una llave.
create or replace function public.habilitar_migracion(
  cliente uuid,
  habilitar boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_del_equipo(auth.uid()) then
    raise exception 'Solo el equipo habilita migraciones';
  end if;

  update public.profiles
     set migracion_habilitada = habilitar
   where id = cliente;
end;
$$;

grant execute on function public.habilitar_migracion(uuid, boolean) to authenticated;

-- ── Cerrar la propia migración ─────────────────────────────────────
-- La escribe el cliente al terminar, y SOLO la suya. Sin esto tendría
-- que poder escribir `migrado_en` por una política abierta, y entonces
-- también podría escribir la de otro.
create or replace function public.cerrar_mi_migracion()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- La guarda importa: sin ella, un cliente al que nunca se le
  -- habilitó la migración podría marcarse como migrado y saltearse su
  -- Camino entero.
  if not exists (
    select 1 from public.profiles
     where id = auth.uid() and migracion_habilitada = true
  ) then
    raise exception 'Tu migración no está habilitada';
  end if;

  update public.profiles
     set migrado_en = now()
   where id = auth.uid()
     -- Una sola vez. Volver a correrla pisaría la fecha original, que
     -- es el dato con el que el equipo sabe quién pasó y cuándo.
     and migrado_en is null;
end;
$$;

grant execute on function public.cerrar_mi_migracion() to authenticated;

-- ── Lo que el equipo mira ──────────────────────────────────────────
create or replace function public.estado_de_migraciones()
returns table (
  cliente_id uuid,
  nombre text,
  habilitada boolean,
  migrado_en timestamptz,
  -- Cuántas piezas de ADN tiene cargadas de las cinco que hacen falta
  -- para armar una campaña. Es lo que dice si la migración sirvió:
  -- alguien «migrado» con dos de cinco llega a Campañas y sus anuncios
  -- salen de campos vacíos.
  piezas_para_campanas integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(p.nombre, ''),
    p.migracion_habilitada,
    p.migrado_en,
    (
      (case when length(trim(coalesce(p.nicho, ''))) >= 20 then 1 else 0 end) +
      (case when length(trim(coalesce(p.posicionamiento, ''))) >= 20 then 1 else 0 end) +
      (case when length(trim(coalesce(p.matriz_a, ''))) >= 20 then 1 else 0 end) +
      (case when length(trim(coalesce(p.metodo_nombre, ''))) >= 3 then 1 else 0 end) +
      (case when length(trim(coalesce(p.historia_150, ''))) >= 20 then 1 else 0 end)
    )::integer
  from public.profiles p
  where public.es_del_equipo(auth.uid())
  order by p.migracion_habilitada desc, p.nombre;
$$;

comment on function public.estado_de_migraciones is
  'Quién tiene la migración habilitada, quién ya la hizo, y con cuántas de las cinco piezas que una campaña necesita quedó.';

grant execute on function public.estado_de_migraciones() to authenticated;

-- ════════════════════════════════════════════════════════════════════
--  LOS PAÍSES DONDE CORRE LA CAMPAÑA
--
--  `calcularCadena` juzga el CPM contra la banda del mercado, y el
--  comentario del código dice por qué: «el techo argentino está por
--  debajo del piso español, y medirlos igual se equivoca en las dos
--  direcciones».
--
--  Pero `bandaDe(n.mercados ?? [])` recibía SIEMPRE una lista vacía:
--  nadie poblaba ese campo en ninguna parte. Y con la lista vacía,
--  `bandaDe` cae en `MERCADO_POR_DEFECTO = 'MX'`.
--
--  O sea que a TODA la cartera se le decía si su CPM está caro o barato
--  comparándolo con la banda mexicana — a los de España, Chile y
--  Argentina incluidos. En silencio, sin que nada en pantalla lo
--  indique, y dando la vuelta exacta que el módulo existe para evitar.
--
--  El dato ya lo elige el cliente al montar su campaña. Solo le
--  faltaba un lugar donde vivir.
-- ════════════════════════════════════════════════════════════════════

alter table public.montaje_campana
  add column if not exists paises text[] not null default '{}';

comment on column public.montaje_campana.paises is
  'Los países donde corre la campaña. Los elige el cliente en el asesor de montaje, y de acá sale la banda de CPM con la que se juzga su costo. Vacío = se usa la de referencia por defecto.';


-- ───────────────────────────────────────────────────────────────────────────
-- 13 de 23 · 20261018_cerrar_antes_de_abrir.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════
--  CORRER ESTA PRIMERA, ANTES DE DAR ACCESO A NADIE
--
--  Una auditoría de las políticas encontró que el cliente puede
--  escribir CUALQUIER columna de su propio perfil. Y entre esas
--  columnas están las cinco que las migraciones de octubre crearon
--  justamente para que las custodie el equipo:
--
--      servicio_contratado    el escalón de $5.000
--      cima_incluida          los días en Bariloche
--      migracion_habilitada   la llave de la migración
--      migrado_en             que ya migró
--      biblioteca_abierta     la Biblioteca
--
--  Cada una tiene su función guardiana, que verifica que quien la
--  llama sea del equipo. Y las cinco se saltean por completo con un
--  PATCH directo a /rest/v1/profiles, porque la política de UPDATE es
--  esta:
--
--      CREATE POLICY "Authenticated users can update own profile"
--        ON profiles FOR UPDATE USING (auth.uid() = id);
--
--  Sin WITH CHECK y sin lista de columnas. En un UPDATE, Postgres usa
--  el USING también como check: mientras el id no cambie, todo lo
--  demás es escribible por el dueño de la fila.
--
--  Peor todavía: `rol` y `admin_rol` están en la misma tabla. Un
--  cliente que se ponga rol='admin' lee la cartera entera.
--
--  Esto lo cierra con una lista blanca: el cliente escribe lo suyo, y
--  todo lo que decide qué compró o qué permisos tiene pasa por una
--  función que verifica quién llama.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 · El WITH CHECK que faltaba ─────────────────────────────────
--
-- Primero lo simple: sin WITH CHECK, un UPDATE podía dejar la fila con
-- otro id. Postgres usa el USING como check cuando no hay WITH CHECK,
-- así que esto no cambiaba mucho — pero escrito explícito es lo que
-- hace que la regla se lea de una vez.
--
-- NOTA sobre los grants por columna: los probé y no sirven acá. El
-- equipo edita fichas enteras desde el Admin, así que necesita UPDATE
-- sobre la tabla completa; y Postgres no permite grants distintos por
-- rol dentro de la misma tabla cuando los dos son `authenticated`. El
-- grant de tabla anula el de columna y queda todo abierto otra vez.
--
-- Por eso el candado real es el trigger del punto 2, que es lo único
-- que puede comparar el valor viejo con el nuevo y saber si la columna
-- CAMBIÓ. Lo dejo dicho para que nadie «simplifique» esto más adelante
-- cambiando el trigger por grants.

drop policy if exists "Authenticated users can update own profile" on public.profiles;
-- También la nueva, para poder correr el archivo dos veces: la primera
-- versión de esta migración no la borraba y la segunda corrida fallaba
-- con «policy already exists». Se reintenta a mano, así que tiene que
-- aguantar correrse de nuevo.
drop policy if exists "el cliente edita lo suyo" on public.profiles;
create policy "el cliente edita lo suyo" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

comment on policy "el cliente edita lo suyo" on public.profiles is
  'Reemplaza a la política que no tenía WITH CHECK. Lo que decide qué compró o qué permisos tiene lo cierra el trigger profiles_lo_que_compro.';

-- El equipo edita cualquier ficha desde el Admin.
drop policy if exists "el equipo edita cualquier ficha" on public.profiles;
create policy "el equipo edita cualquier ficha" on public.profiles
  for update to authenticated
  using (public.es_del_equipo(auth.uid()))
  with check (public.es_del_equipo(auth.uid()));

-- ── 2 · El trigger que cierra las columnas del equipo ──────────────
--
-- Es el candado de verdad. Los grants por columna no alcanzan cuando
-- el equipo necesita escribir la tabla entera, así que la regla se
-- aplica acá: si quien escribe no es del equipo y la fila cambia una
-- de las cinco, se rechaza.
--
-- Un trigger y no una política porque una política no puede comparar
-- el valor viejo con el nuevo: `with check` solo ve la fila nueva, y
-- lo que hace falta es ver si la columna CAMBIÓ.

create or replace function public.profiles_solo_el_equipo_cambia_lo_que_compro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.es_del_equipo(auth.uid()) then
    return new;
  end if;

  -- `is distinct from` y no `<>`: con nulos, `<>` devuelve nulo y la
  -- comparación no detecta el cambio.
  if new.servicio_contratado is distinct from old.servicio_contratado then
    raise exception 'El escalón de servicio lo marca el equipo';
  end if;
  if new.cima_incluida is distinct from old.cima_incluida then
    raise exception 'La Cima la marca el equipo';
  end if;
  if new.migracion_habilitada is distinct from old.migracion_habilitada then
    raise exception 'La migración la habilita el equipo';
  end if;
  if new.migrado_en is distinct from old.migrado_en then
    raise exception 'La migración se cierra con cerrar_mi_migracion()';
  end if;
  if new.biblioteca_abierta is distinct from old.biblioteca_abierta then
    raise exception 'La Biblioteca la abre el equipo';
  end if;
  if new.rol is distinct from old.rol or new.admin_rol is distinct from old.admin_rol then
    raise exception 'Los permisos los cambia el equipo';
  end if;
  if new.plan_comercial is distinct from old.plan_comercial then
    raise exception 'El plan lo marca el equipo';
  end if;
  if new.acceso_tipo is distinct from old.acceso_tipo
     or new.acceso_hasta is distinct from old.acceso_hasta then
    raise exception 'La ventana de acceso la marca el equipo';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_lo_que_compro on public.profiles;
create trigger profiles_lo_que_compro
  before update on public.profiles
  for each row
  execute function public.profiles_solo_el_equipo_cambia_lo_que_compro();

-- ── 3 · Las funciones que confiaban en un parámetro ────────────────
--
-- `marcar_biblioteca` recibía `p_quien` y verificaba que ESE uuid
-- fuera del equipo. Pero `p_quien` lo manda el navegador: cualquiera
-- pasa el uuid de un admin y la función lo acepta. Y los uuid del
-- equipo no son secretos — vienen en los mensajes que el cliente ya
-- puede leer.
--
-- Es la única de las diecinueve funciones de octubre que no usa
-- auth.uid(). Se corrige sin cambiar la firma, para que el front siga
-- funcionando: el parámetro se ignora.

-- Igual que arriba: 20261015 la declara con `p_quien uuid` sin default
-- y acá lleva `default null`, para que el front pueda dejar de mandarlo.
drop function if exists public.marcar_biblioteca(uuid, boolean, uuid);

create or replace function public.marcar_biblioteca(
  p_cliente uuid,
  p_abierta boolean,
  p_quien uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- `p_quien` queda en la firma para no romper al front, y NO se usa
  -- para decidir: quien manda es auth.uid(), que el cliente no puede
  -- falsificar.
  perform p_quien;

  if not public.es_del_equipo(auth.uid()) then
    raise exception 'Solo el equipo puede abrir la Biblioteca de un cliente';
  end if;

  update public.profiles
     set biblioteca_abierta = p_abierta
   where id = p_cliente;
end;
$$;

grant execute on function public.marcar_biblioteca(uuid, boolean, uuid) to authenticated;

-- ── 4 · `cerrar_jornada`: la jornada es de quien la cierra ─────────
--
-- Es `security definer` y recibe `p_persona` sin verificar quién
-- llama, así que saltea la política `jornada_propia`: cualquiera del
-- equipo —o cualquier autenticado— podía cerrar la jornada de otro,
-- con sus trabas y los clientes que atendió.

-- Se borra antes de crear: la versión de 20261014 declara
-- `p_funciones text[] default null` y esta usa `default '{}'`.
-- `create or replace` no puede cambiar los defaults de los parámetros
-- («cannot remove parameter defaults from existing function»), así que
-- sin el drop esta migración abortaba — el mismo tipo de choque que
-- viene a arreglar más arriba.
drop function if exists public.cerrar_jornada(uuid, uuid[], text, uuid, text[]);

create or replace function public.cerrar_jornada(
  p_persona uuid,
  p_atendidos uuid[],
  p_traba text,
  p_traba_cliente uuid,
  p_funciones text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_persona is distinct from auth.uid() and not public.es_del_equipo(auth.uid()) then
    raise exception 'Cada uno cierra su propia jornada';
  end if;

  update public.jornadas
     set fin = now(),
         atendidos = p_atendidos,
         traba = p_traba,
         traba_cliente = p_traba_cliente,
         funciones = p_funciones
   where persona_id = p_persona
     and dia = current_date;
end;
$$;

grant execute on function public.cerrar_jornada(uuid, uuid[], text, uuid, text[]) to authenticated;

-- La firma vieja de cuatro parámetros queda huérfana y hace ambigua
-- cualquier llamada por nombre: con las dos vivas, PostgREST recibe
-- «function is not unique». Se saca.
drop function if exists public.cerrar_jornada(uuid, uuid[], text, uuid);

-- ── 5 · `jornadas_recientes`: quién puede leerlas ──────────────────
--
-- La versión vieja es `security definer` SIN ningún chequeo: cualquier
-- autenticado leía las jornadas de todo el equipo. La nueva agrega el
-- chequeo, pero no se puede aplicar con `create or replace` porque
-- cambia el tipo de retorno (le suma la columna `funciones`), y
-- Postgres lo rechaza:
--
--     ERROR: cannot change return type of existing function
--
-- O sea que la migración abortaba y la vieja quedaba viva, con el
-- agujero abierto. Se borra primero.

drop function if exists public.jornadas_recientes(int);

create or replace function public.jornadas_recientes(p_dias int default 7)
returns table (
  persona_id uuid, dia date, inicio timestamptz, fin timestamptz,
  planeados uuid[], atendidos uuid[], traba text, traba_cliente uuid,
  funciones text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select j.persona_id, j.dia, j.inicio, j.fin,
         j.planeados, j.atendidos, j.traba, j.traba_cliente,
         coalesce(j.funciones, '{}')
    from public.jornadas j
   where j.dia >= current_date - p_dias
     and public.es_del_equipo(auth.uid())
   order by j.dia desc;
$$;

grant execute on function public.jornadas_recientes(int) to authenticated;

-- ── 6 · `marcar_respondido`: el mismo choque de tipo ───────────────
-- La versión vieja devuelve `void` y la nueva `integer`. Mismo error,
-- y además en el editor SQL todo el archivo corre en una transacción,
-- así que al abortar se revertía también la unificación del canal.

drop function if exists public.marcar_respondido(uuid);

create or replace function public.marcar_respondido(p_cliente uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  if not public.es_del_equipo(auth.uid()) then
    raise exception 'Solo el equipo marca respondido';
  end if;

  update public.mensajes
     set respondido_en = now()
   where emisor_id = p_cliente
     and respondido_en is null;

  get diagnostics n = row_count;
  return n;
end;
$$;

grant execute on function public.marcar_respondido(uuid) to authenticated;

-- ── 7 · Los archivos del chat: nadie sube a la carpeta de otro ─────
--
-- La política nueva agrega la restricción de carpeta, pero estaba
-- dentro de un `if not exists` que mira el NOMBRE. La política vieja
-- —sin la restricción— ya existe con ese nombre, así que la mejora se
-- salteaba en silencio y cualquiera podía subir a la carpeta de otro
-- cliente.

do $$
begin
  if exists (select 1 from pg_tables
              where schemaname = 'storage' and tablename = 'objects') then
    drop policy if exists "mensajes_archivos_upload" on storage.objects;
    create policy "mensajes_archivos_upload"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'mensajes-archivos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- ── 8 · El vencimiento del reporte no lo elige el cliente ──────────
--
-- La política de insert no mira `vence_en`, así que el cliente podía
-- mandarlo en el año 3000 y su reporte nunca salía como vencido en la
-- cola del equipo. El plazo de 48 horas es un compromiso del equipo:
-- lo pone la base, no quien escribe.
--
-- Mismo criterio que arriba: el trigger, no grants por columna.

-- El candado real, igual que con profiles: un trigger, porque una
-- política no puede comparar contra el default.
create or replace function public.reportes_el_plazo_lo_pone_la_base()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_del_equipo(auth.uid()) then
    new.vence_en := now() + interval '48 hours';
    new.respuesta := null;
    new.respondido_por := null;
    new.respondido_en := null;
  end if;
  return new;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.tables
              where table_schema = 'public' and table_name = 'reportes') then
    drop trigger if exists reportes_plazo on public.reportes;
    create trigger reportes_plazo
      before insert on public.reportes
      for each row
      execute function public.reportes_el_plazo_lo_pone_la_base();
  end if;
end $$;

-- ── 9 · La firma de los canales ───────────────────────────────────
-- `autor_nombre` no estaba chequeado: un cliente podía firmar con el
-- nombre de otro. El nombre lo pone la base desde su perfil.
create or replace function public.canales_la_firma_es_de_quien_escribe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.autor_nombre := coalesce(
    (select p.nombre from public.profiles p where p.id = new.autor_id), '');
  return new;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.tables
              where table_schema = 'public' and table_name = 'canales_mensajes') then
    drop trigger if exists canales_firma on public.canales_mensajes;
    create trigger canales_firma
      before insert on public.canales_mensajes
      for each row
      execute function public.canales_la_firma_es_de_quien_escribe();
  end if;
end $$;

-- ── 10 · Los search_path que faltaban ──────────────────────────────
-- Sin `set search_path`, una función `security definer` resuelve los
-- nombres con el search_path de quien la llama. Las tres que faltaban
-- quedaron corregidas arriba, al reescribirlas.

-- ── Verificación ───────────────────────────────────────────────────
-- Correr esto después y confirmar que no devuelve filas: si devuelve
-- alguna, hay alguien del equipo con admin_rol y sin rol='admin', y
-- esa persona vería los reportes y los canales vacíos sin error.
--
--   select id, email, rol, admin_rol from public.profiles
--    where admin_rol in ('owner','manager','staff')
--      and rol is distinct from 'admin';


-- ───────────────────────────────────────────────────────────────────────────
-- 14 de 23 · 20261019_los_avisos_salen.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  LOS AVISOS SALEN — y nadie puede escribir en el nombre de otro
--
--  Dos cosas, las dos encontradas en la revisión final.
--
--  1) EL AGUJERO. `crear_notificacion` es SECURITY DEFINER y no mira quién
--     llama. Cualquier persona con cuenta podía escribirle a cualquier otra
--     un aviso con el título, el texto y el enlace que quisiera: un «Lupe te
--     dejó una nota» falso, con el link a donde se le ocurra. Con la app
--     abierta para todos, eso es lo primero que hay que cerrar.
--
--     La regla queda en tres líneas: el equipo le escribe a cualquiera,
--     cualquiera se escribe a sí mismo, y cualquiera le escribe al equipo.
--     Eso cubre todo lo que la app ya hacía —el cliente avisando que algo se
--     rompió, el equipo cargando una sesión— y deja afuera lo único que
--     nunca tuvo sentido: un cliente escribiéndole a otro cliente.
--
--  2) LA MEMORIA DE LOS AVISOS. Los veinte avisos al cliente estaban
--     escritos y la regla de cuándo dejan de alcanzar también, pero no había
--     dónde leer cuántas veces salió cada uno. Sin eso, el aviso o no sale o
--     sale todos los días.
--
--     Se guarda en la misma tabla de notificaciones, en una columna, y se
--     lee con una función. Una segunda tabla con el mismo historial es una
--     segunda tabla que se puede desincronizar.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1 · La clave del aviso, para poder contarlos ──────────────────────
--
-- `clave` es el cuello de botella que lo originó ('show_rate', 'cpm'…).
-- Queda nula en todo lo que no es un aviso automático, que es la mayoría.
alter table public.notificaciones
  add column if not exists clave text;

comment on column public.notificaciones.clave is
  'El cuello de botella que originó el aviso automático. Nula en los demás. Con usuario_id forma el historial que decide si el aviso ya no alcanza.';

-- Para contar «cuántas veces le salió este aviso» sin leer la tabla entera.
create index if not exists idx_notificaciones_clave
  on public.notificaciones (usuario_id, clave, created_at desc)
  where clave is not null;

-- ── 2 · Quién puede escribirle a quién ────────────────────────────────
--
-- La firma cambia (entra `p_clave`), así que hay que soltar la vieja antes:
-- si quedaran las dos, una llamada con los cinco parámetros de siempre
-- encaja en las dos y Postgres corta por ambigüedad.
drop function if exists public.crear_notificacion(uuid, text, text, text, text);
drop function if exists public.crear_notificacion(uuid, text, text, text, text, text);

create or replace function public.crear_notificacion(
  p_usuario_id  uuid,
  p_tipo        text,
  p_titulo      text,
  p_descripcion text default null,
  p_accion_url  text default null,
  p_clave       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Hay que estar dentro de la app para avisar';
  end if;

  -- El equipo le escribe a cualquiera. Cualquiera se escribe a sí mismo.
  -- Y cualquiera le escribe al equipo, que es cómo un cliente reporta algo.
  if not (
    public.es_del_equipo(auth.uid())
    or p_usuario_id = auth.uid()
    or public.es_del_equipo(p_usuario_id)
  ) then
    raise exception 'Los avisos a otra persona los manda el equipo';
  end if;

  insert into public.notificaciones
    (usuario_id, tipo, titulo, descripcion, accion_url, clave)
  values
    (p_usuario_id, p_tipo, p_titulo, p_descripcion, p_accion_url, p_clave)
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.crear_notificacion is
  'Crea un aviso. El equipo le escribe a cualquiera; cualquiera se escribe a sí mismo o al equipo. Un cliente no puede escribirle a otro cliente.';

revoke all on function public.crear_notificacion(uuid, text, text, text, text, text) from public;
grant execute on function public.crear_notificacion(uuid, text, text, text, text, text) to authenticated;

-- ── 3 · El historial, para el equipo ──────────────────────────────────
--
-- Devuelve, por cliente y por aviso, cuántas veces salió y en qué semana
-- salió el último. La semana en formato ISO ('2026-W41') porque la regla es
-- «no dos veces en la misma semana», no «no dos veces en siete días»: con
-- los siete días corridos, el aviso se corre un día por semana y termina
-- cayendo cualquier día.
create or replace function public.historial_avisos(p_clientes uuid[])
returns table (cliente uuid, clave text, veces integer, ultima_semana text)
language sql
stable
security definer
set search_path = public
as $$
  select
    n.usuario_id as cliente,
    n.clave,
    count(*)::integer as veces,
    to_char(max(n.created_at), 'IYYY"-W"IW') as ultima_semana
  from public.notificaciones n
  where n.clave is not null
    and n.usuario_id = any (p_clientes)
    and public.es_del_equipo(auth.uid())
  group by n.usuario_id, n.clave;
$$;

comment on function public.historial_avisos is
  'Por cliente y aviso: cuántas veces salió y la semana ISO del último. Solo para el equipo. Es lo que decide si el aviso todavía alcanza o ya tiene que entrar una persona.';

revoke all on function public.historial_avisos(uuid[]) from public;
grant execute on function public.historial_avisos(uuid[]) to authenticated;

-- ── 4 · Que el equipo pueda leer lo que ya le avisó a un cliente ──────
--
-- Hasta ahora la política dejaba leer solo lo propio, así que desde el Admin
-- no había forma de ver qué se le había dicho ya. Se preguntaba por WhatsApp.
drop policy if exists "notif_read_equipo" on public.notificaciones;
create policy "notif_read_equipo" on public.notificaciones
  for select using (public.es_del_equipo(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════
--  LAS IMPRESIONES, QUE NUNCA SE PEDÍAN
--
--  Dos de los veinte avisos no podían salir nunca, y no por un error de
--  código: el dato no se pedía en ninguna parte. El costo de aparecer (CPM) y
--  la frecuencia se calculan con las impresiones, y `impresiones` no era una
--  columna de la tabla ni un campo del formulario de carga.
--
--  El CPM quedaba en «sin datos», que es correcto. La frecuencia era peor:
--  impresiones ÷ alcance con el numerador en cero da cero, y cero es la zona
--  sana — así que la app mostraba en VERDE un número que nunca midió. Y la
--  frecuencia es justo el número que evita tirar un creativo que estaba bien.
--
--  Son dos datos que Meta muestra en la misma pantalla que el gasto, así que
--  cargarlos no agrega trabajo: ya están a la vista cuando se carga la semana.
-- ════════════════════════════════════════════════════════════════════════

alter table public.sala_metricas_semana
  add column if not exists impresiones numeric default 0;

comment on column public.sala_metricas_semana.impresiones is
  'Cuántas veces se mostró el anuncio. Con el gasto da el CPM, y con el alcance la frecuencia. En cero los dos indicadores dicen «sin datos» en vez de opinar.';

-- La función que guarda la semana ignoraba la clave nueva, así que el campo
-- del formulario llegaría a la base y se perdería en silencio.
create or replace function public.guardar_semana_cliente(
  p_cliente_id uuid,
  p_semana_iso text,
  p_datos jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.sala_metricas_semana (
    cliente_id, semana_iso, anuncio, objetivo, precio,
    gasto, impresiones, alcance, comentarios, conversaciones, agendas,
    llamadas_tomadas, ofertas_presentadas, ventas,
    facturado, cobrado, cuotas_por_cobrar, cuotas_cobradas,
    piezas_publicadas, mensajes_enviados,
    clientes_activos, clientes_que_terminan, renovaciones,
    referidos, casos_de_exito, actualizado_en
  ) values (
    p_cliente_id, p_semana_iso, null,
    coalesce(p_datos->>'objetivo', 'mensajes'),
    coalesce((p_datos->>'precio')::numeric, 0),
    coalesce((p_datos->>'gasto')::numeric, 0),
    coalesce((p_datos->>'impresiones')::numeric, 0),
    coalesce((p_datos->>'alcance')::int, 0),
    coalesce((p_datos->>'comentarios')::int, 0),
    coalesce((p_datos->>'conversaciones')::int, 0),
    coalesce((p_datos->>'agendas')::int, 0),
    coalesce((p_datos->>'llamadasTomadas')::int, 0),
    coalesce((p_datos->>'ofertasPresentadas')::int, 0),
    coalesce((p_datos->>'ventas')::int, 0),
    coalesce((p_datos->>'facturado')::numeric, 0),
    coalesce((p_datos->>'cobrado')::numeric, 0),
    coalesce((p_datos->>'cuotasPorCobrar')::numeric, 0),
    coalesce((p_datos->>'cuotasCobradas')::numeric, 0),
    coalesce((p_datos->>'piezasPublicadas')::int, 0),
    coalesce((p_datos->>'mensajesEnviados')::int, 0),
    coalesce((p_datos->>'clientesActivos')::int, 0),
    coalesce((p_datos->>'clientesQueTerminan')::int, 0),
    coalesce((p_datos->>'renovaciones')::int, 0),
    coalesce((p_datos->>'referidos')::int, 0),
    coalesce((p_datos->>'casosDeExito')::int, 0),
    now()
  )
  on conflict (cliente_id, semana_iso) where anuncio is null
  do update set
    objetivo = excluded.objetivo, precio = excluded.precio,
    gasto = excluded.gasto, impresiones = excluded.impresiones,
    alcance = excluded.alcance,
    comentarios = excluded.comentarios, conversaciones = excluded.conversaciones,
    agendas = excluded.agendas, llamadas_tomadas = excluded.llamadas_tomadas,
    ofertas_presentadas = excluded.ofertas_presentadas, ventas = excluded.ventas,
    facturado = excluded.facturado, cobrado = excluded.cobrado,
    cuotas_por_cobrar = excluded.cuotas_por_cobrar,
    cuotas_cobradas = excluded.cuotas_cobradas,
    piezas_publicadas = excluded.piezas_publicadas,
    mensajes_enviados = excluded.mensajes_enviados,
    clientes_activos = excluded.clientes_activos,
    clientes_que_terminan = excluded.clientes_que_terminan,
    renovaciones = excluded.renovaciones, referidos = excluded.referidos,
    casos_de_exito = excluded.casos_de_exito, actualizado_en = now();
end $$;

grant execute on function public.guardar_semana_cliente(uuid, text, jsonb) to authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- 15 de 23 · 20261020_anuncios_que_agendan.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  ANUNCIOS QUE AGENDAN — las fichas, guardadas en la cuenta
--
--  La herramienta guardaba en el navegador. O sea que el trabajo vivía en la
--  computadora donde se escribió: el cliente cargaba su ficha, abría la app en
--  el teléfono y no había nada. Y si limpiaba el historial, tampoco.
--
--  Acá vive en su cuenta. Entra desde donde entre y está.
--
--  Una columna jsonb y no veinte columnas: la ficha va a cambiar —cada regla
--  nueva puede traer un campo— y con veinte columnas cada cambio sería una
--  migración más. Lo que sí va en columnas es lo que se consulta de afuera: de
--  quién es y cuándo se tocó. Nadie busca una ficha por el texto de su gancho.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.anuncios_fichas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  nombre          text,
  datos           jsonb not null default '{}'::jsonb,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

comment on table public.anuncios_fichas is
  'Las fichas de «Anuncios que Agendan»: la ficha del cliente, sus candidatas a EL 20, las plantillas elegidas y los anuncios escritos.';
comment on column public.anuncios_fichas.datos is
  'La ficha entera. En jsonb para que una ficha guardada antes de que existiera un campo abra igual, con ese campo vacío.';

-- La lista se pide siempre por dueño y ordenada por lo último tocado.
create index if not exists idx_anuncios_fichas_duenio
  on public.anuncios_fichas (user_id, actualizado_en desc);

alter table public.anuncios_fichas enable row level security;

-- ── Cada cliente, lo suyo ─────────────────────────────────────────
drop policy if exists anuncios_fichas_propias on public.anuncios_fichas;
create policy anuncios_fichas_propias on public.anuncios_fichas
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Y el equipo, todas ────────────────────────────────────────────
--
-- Porque acompañar a un cliente con sus anuncios es la mitad del servicio, y
-- sin esto Lupe tendría que pedirle que le pase capturas de su propia ficha.
drop policy if exists anuncios_fichas_equipo on public.anuncios_fichas;
create policy anuncios_fichas_equipo on public.anuncios_fichas
  for all to authenticated
  using (public.es_del_equipo(auth.uid()))
  with check (public.es_del_equipo(auth.uid()));

-- ── La fecha se pone sola ─────────────────────────────────────────
--
-- Va en un trigger y no en el código: con la fecha puesta desde el navegador,
-- un reloj mal configurado manda una ficha al futuro y queda primera en la
-- lista para siempre.
create or replace function public.anuncios_fichas_marcar_fecha()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists anuncios_fichas_fecha on public.anuncios_fichas;
create trigger anuncios_fichas_fecha
  before insert or update on public.anuncios_fichas
  for each row execute function public.anuncios_fichas_marcar_fecha();


-- ───────────────────────────────────────────────────────────────────────────
-- 16 de 23 · 20261021_sus_numeros_son_suyos.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  SUS NÚMEROS SON SUYOS
--
--  La tabla de la semana tenía una sola política: solo el equipo. O sea que el
--  cliente no podía leer sus propios números —los de su negocio— y cualquier
--  tablero que le mostráramos venía vacío.
--
--  Eso tenía sentido cuando los cargaba Lupe en la Mesa de plata y nadie más
--  los miraba. Dejó de tenerlo el día que el Camino le pide al cliente, en su
--  sesión del día 82, que mire «tus seis números de hoy».
--
--  Ahora cada uno lee y carga los suyos, y el equipo sigue viendo todos.
-- ════════════════════════════════════════════════════════════════════════

alter table public.sala_metricas_semana enable row level security;

-- ── Cada cliente, los suyos ───────────────────────────────────────
drop policy if exists sala_metricas_propias on public.sala_metricas_semana;
create policy sala_metricas_propias on public.sala_metricas_semana
  for all to authenticated
  using (cliente_id = auth.uid())
  with check (cliente_id = auth.uid());

-- ── Y el equipo, todos ────────────────────────────────────────────
--
-- Se recrea con `es_del_equipo` en vez de la condición escrita a mano: con la
-- condición copiada, el día que entre un rol nuevo hay que acordarse de este
-- archivo, y nadie se acuerda de un archivo que no falló nunca.
drop policy if exists sala_metricas_admin on public.sala_metricas_semana;
create policy sala_metricas_admin on public.sala_metricas_semana
  for all to authenticated
  using (public.es_del_equipo(auth.uid()))
  with check (public.es_del_equipo(auth.uid()));

-- ── Guardar la semana: el cliente guarda la suya ─────────────────
--
-- La función es SECURITY DEFINER, así que sin esta comprobación cualquiera
-- podría escribirle los números a cualquiera. Antes no hacía falta porque solo
-- la llamaba el Admin; ahora la llama el cliente desde su tablero.
create or replace function public.guardar_semana_cliente(
  p_cliente_id uuid,
  p_semana_iso text,
  p_datos jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and p_cliente_id <> auth.uid()
     and not public.es_del_equipo(auth.uid()) then
    raise exception 'Cada uno carga sus propios números';
  end if;

  insert into public.sala_metricas_semana (
    cliente_id, semana_iso, anuncio, objetivo, precio,
    gasto, impresiones, alcance, comentarios, conversaciones, agendas,
    llamadas_tomadas, ofertas_presentadas, ventas,
    facturado, cobrado, cuotas_por_cobrar, cuotas_cobradas,
    piezas_publicadas, mensajes_enviados,
    clientes_activos, clientes_que_terminan, renovaciones,
    referidos, casos_de_exito, actualizado_en
  ) values (
    p_cliente_id, p_semana_iso, null,
    coalesce(p_datos->>'objetivo', 'mensajes'),
    coalesce((p_datos->>'precio')::numeric, 0),
    coalesce((p_datos->>'gasto')::numeric, 0),
    coalesce((p_datos->>'impresiones')::numeric, 0),
    coalesce((p_datos->>'alcance')::int, 0),
    coalesce((p_datos->>'comentarios')::int, 0),
    coalesce((p_datos->>'conversaciones')::int, 0),
    coalesce((p_datos->>'agendas')::int, 0),
    coalesce((p_datos->>'llamadasTomadas')::int, 0),
    coalesce((p_datos->>'ofertasPresentadas')::int, 0),
    coalesce((p_datos->>'ventas')::int, 0),
    coalesce((p_datos->>'facturado')::numeric, 0),
    coalesce((p_datos->>'cobrado')::numeric, 0),
    coalesce((p_datos->>'cuotasPorCobrar')::numeric, 0),
    coalesce((p_datos->>'cuotasCobradas')::numeric, 0),
    coalesce((p_datos->>'piezasPublicadas')::int, 0),
    coalesce((p_datos->>'mensajesEnviados')::int, 0),
    coalesce((p_datos->>'clientesActivos')::int, 0),
    coalesce((p_datos->>'clientesQueTerminan')::int, 0),
    coalesce((p_datos->>'renovaciones')::int, 0),
    coalesce((p_datos->>'referidos')::int, 0),
    coalesce((p_datos->>'casosDeExito')::int, 0),
    now()
  )
  on conflict (cliente_id, semana_iso) where anuncio is null
  do update set
    objetivo = excluded.objetivo, precio = excluded.precio,
    gasto = excluded.gasto, impresiones = excluded.impresiones,
    alcance = excluded.alcance,
    comentarios = excluded.comentarios, conversaciones = excluded.conversaciones,
    agendas = excluded.agendas, llamadas_tomadas = excluded.llamadas_tomadas,
    ofertas_presentadas = excluded.ofertas_presentadas, ventas = excluded.ventas,
    facturado = excluded.facturado, cobrado = excluded.cobrado,
    cuotas_por_cobrar = excluded.cuotas_por_cobrar,
    cuotas_cobradas = excluded.cuotas_cobradas,
    piezas_publicadas = excluded.piezas_publicadas,
    mensajes_enviados = excluded.mensajes_enviados,
    clientes_activos = excluded.clientes_activos,
    clientes_que_terminan = excluded.clientes_que_terminan,
    renovaciones = excluded.renovaciones, referidos = excluded.referidos,
    casos_de_exito = excluded.casos_de_exito, actualizado_en = now();
end $$;

grant execute on function public.guardar_semana_cliente(uuid, text, jsonb) to authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- 17 de 23 · 20261022_la_antesala.sql
-- ───────────────────────────────────────────────────────────────────────────

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


-- ───────────────────────────────────────────────────────────────────────────
-- 18 de 23 · 20261024_los_mensajes_en_vivo.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  LOS MENSAJES, EN VIVO
--
--  Hay SEIS suscripciones en tiempo real sobre `public.mensajes`:
--
--    · Topbar.tsx          el contador de respuestas sin abrir del cliente
--    · BottomTabBar.tsx    el globo sobre «Contacto» en el teléfono
--    · Mensajes.tsx        su conversación, mientras la tiene abierta
--    · Admin.tsx (×3)      el aviso al equipo y las dos conversaciones
--
--  Y `mensajes` no estaba en la publicación `supabase_realtime`. Solo
--  `notificaciones`, que la agregó 20260519 con este mismo bloque.
--
--  Supabase solo empuja los cambios de las tablas publicadas, así que las seis
--  escuchaban una tabla que no habla. El síntoma no es «no me enteré»: los
--  contadores se recuperan al recargar porque además consultan directo. El
--  síntoma es «me enteré tarde» — el cliente escribe, el equipo contesta, y
--  ninguno de los dos ve la respuesta hasta que cierra y abre la app.
--
--  Lo mismo con `user_credits`, que tiene su suscripción en credits.ts.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════════

do $$
declare
  t text;
begin
  foreach t in array array['mensajes', 'user_credits']
  loop
    -- Si la tabla no existe todavía, se saltea en vez de cortar la corrida:
    -- `user_credits` vive detrás del sistema de créditos, que está apagado.
    if not exists (
      select 1 from information_schema.tables
       where table_schema = 'public' and table_name = t
    ) then
      raise notice 'public.% no existe todavía: se saltea', t;
      continue;
    end if;

    -- ADD TABLE no es idempotente si la tabla ya está en la publicación.
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
      raise notice 'public.% agregada a supabase_realtime', t;
    end if;

    -- Para que el payload de un UPDATE traiga también la fila vieja. Hace
    -- falta para «marcar leído» entre pestañas, que es justo lo que el
    -- contador del cliente necesita para no quedar desfasado.
    execute format('alter table public.%I replica identity full', t);
  end loop;
end $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 19 de 23 · 20261025_el_veredicto_queda.sql
-- ───────────────────────────────────────────────────────────────────────────

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


-- ───────────────────────────────────────────────────────────────────────────
-- 20 de 23 · 20261026_la_lista_de_migraciones_son_clientes.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  LA LISTA DE MIGRACIONES SON CLIENTES
--
--  `estado_de_migraciones` comprueba que quien pregunta sea del equipo, y
--  después devuelve TODAS las fichas. Las del equipo incluidas.
--
--  Así que la pantalla «Que se migren solos» mostraba a Lupe y a Javo en la
--  lista, con cero de cinco piezas y un botón para abrirles la migración. Y
--  cuanto más crece el equipo, más larga es la lista de personas que no se
--  migran, arriba de los clientes que sí.
--
--  El criterio es el mismo de siempre —`es_del_equipo`— para que el día que
--  entre un rol nuevo no haya que acordarse de este archivo.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.estado_de_migraciones()
returns table (
  cliente_id uuid,
  nombre text,
  habilitada boolean,
  migrado_en timestamptz,
  -- Cuántas piezas de ADN tiene cargadas de las cinco que hacen falta para
  -- armar una campaña. Es lo que dice si la migración sirvió: alguien
  -- «migrado» con dos de cinco llega a Campañas y sus anuncios salen de
  -- campos vacíos.
  piezas_para_campanas integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(p.nombre, ''),
    p.migracion_habilitada,
    p.migrado_en,
    (
      (case when length(trim(coalesce(p.nicho, ''))) >= 20 then 1 else 0 end) +
      (case when length(trim(coalesce(p.posicionamiento, ''))) >= 20 then 1 else 0 end) +
      (case when length(trim(coalesce(p.matriz_a, ''))) >= 20 then 1 else 0 end) +
      (case when length(trim(coalesce(p.metodo_nombre, ''))) >= 3 then 1 else 0 end) +
      (case when length(trim(coalesce(p.historia_150, ''))) >= 20 then 1 else 0 end)
    )::integer
  from public.profiles p
  where public.es_del_equipo(auth.uid())
    -- Y la ficha que se lista NO es del equipo: nadie del equipo se migra.
    and not public.es_del_equipo(p.id)
  order by p.migracion_habilitada desc, p.nombre;
$$;

comment on function public.estado_de_migraciones is
  'Qué CLIENTES tienen la migración habilitada, quién ya la hizo, y con cuántas de las cinco piezas que una campaña necesita quedó. El equipo no se lista: no se migra.';

revoke all on function public.estado_de_migraciones() from public;
grant execute on function public.estado_de_migraciones() to authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- 21 de 23 · 20261027_el_cliente_puede_cerrar_su_migracion.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════
--  EL CLIENTE PUEDE CERRAR SU MIGRACIÓN
--
--  ═══ QUÉ ESTABA PASANDO ═══
--
--  La migración del cliente entró el 17 de octubre. El disparador que impide
--  que un cliente se cambie a sí mismo lo que compró entró el 18.
--
--  Ese disparador prohíbe que alguien que no es del equipo toque
--  `migrado_en`. Y `migrado_en` es justo la columna que escribe
--  `cerrar_mi_migracion()`, que es la función oficial para cerrarla.
--
--  `cerrar_mi_migracion` es SECURITY DEFINER, pero el disparador no mira con
--  qué rol corre: mira `auth.uid()`, que sigue siendo el cliente. Así que el
--  disparador bloqueaba a la función que él mismo señala como la única manera
--  de hacerlo.
--
--  El efecto, desde el 18 de octubre: el cliente pegaba su material, su ADN
--  se guardaba —esas columnas el disparador no las mira— y el cierre fallaba.
--  Recibía un error, quedaba sin fechar, y la tarjeta «Trae tu trabajo» le
--  seguía apareciendo en su HOY. Para siempre.
--
--  ═══ CÓMO SE ARREGLA ═══
--
--  La función avisa, dentro de su propia transacción, que la que está
--  escribiendo es ella. El disparador lee ese aviso y deja pasar esa columna.
--
--  El candado no se afloja: un update a mano desde el navegador no trae el
--  aviso, y sigue rebotando con el mismo mensaje. Y el aviso es `is_local`,
--  así que muere con la transacción y no puede quedar encendido.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1 · La función avisa que es ella ──────────────────────────────────
create or replace function public.cerrar_mi_migracion()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- La guarda importa: sin ella, un cliente al que nunca se le habilitó la
  -- migración podría marcarse como migrado y saltearse su Camino entero.
  if not exists (
    select 1 from public.profiles
     where id = auth.uid() and migracion_habilitada = true
  ) then
    raise exception 'Tu migración no está habilitada';
  end if;

  -- El aviso para el disparador. El tercer argumento en `true` lo hace local
  -- a esta transacción: termina con ella, y no hay forma de dejarlo prendido.
  perform set_config('app.cerrando_migracion', 'si', true);

  update public.profiles
     set migrado_en = now()
   where id = auth.uid()
     -- Una sola vez. Volver a correrla pisaría la fecha original, que es el
     -- dato con el que el equipo sabe quién pasó y cuándo.
     and migrado_en is null;
end;
$$;

comment on function public.cerrar_mi_migracion is
  'El cliente cierra su propia migración. Avisa al disparador de profiles que la escritura viene de acá, dentro de su propia transacción.';

revoke all on function public.cerrar_mi_migracion() from public;
grant execute on function public.cerrar_mi_migracion() to authenticated;

-- ── 2 · El disparador escucha ese aviso ───────────────────────────────
--
-- Se recrea entero y no se parchea: la función del 18 de octubre cubre nueve
-- columnas, y dejar dos versiones de la misma lista es cómo se pierde una.
create or replace function public.profiles_solo_el_equipo_cambia_lo_que_compro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.es_del_equipo(auth.uid()) then
    return new;
  end if;

  -- `is distinct from` y no `<>`: con nulos, `<>` devuelve nulo y la
  -- comparación no detecta el cambio.
  if new.servicio_contratado is distinct from old.servicio_contratado then
    raise exception 'El escalón de servicio lo marca el equipo';
  end if;
  if new.cima_incluida is distinct from old.cima_incluida then
    raise exception 'La Cima la marca el equipo';
  end if;
  if new.migracion_habilitada is distinct from old.migracion_habilitada then
    raise exception 'La migración la habilita el equipo';
  end if;
  -- La única excepción de toda la lista: cerrar su propia migración. Pasa
  -- cuando la escritura viene de `cerrar_mi_migracion()`, que es la que pone
  -- el aviso. Un update a mano no lo trae y rebota igual que antes.
  if new.migrado_en is distinct from old.migrado_en
     and coalesce(current_setting('app.cerrando_migracion', true), '') <> 'si' then
    raise exception 'La migración se cierra con cerrar_mi_migracion()';
  end if;
  if new.biblioteca_abierta is distinct from old.biblioteca_abierta then
    raise exception 'La Biblioteca la abre el equipo';
  end if;
  if new.rol is distinct from old.rol or new.admin_rol is distinct from old.admin_rol then
    raise exception 'Los permisos los cambia el equipo';
  end if;
  if new.plan_comercial is distinct from old.plan_comercial then
    raise exception 'El plan lo marca el equipo';
  end if;
  if new.acceso_tipo is distinct from old.acceso_tipo
     or new.acceso_hasta is distinct from old.acceso_hasta then
    raise exception 'La ventana de acceso la marca el equipo';
  end if;

  return new;
end;
$$;

comment on function public.profiles_solo_el_equipo_cambia_lo_que_compro is
  'Lo que compró un cliente lo marca el equipo. Única excepción: cerrar su propia migración, y solo cuando la escritura viene de cerrar_mi_migracion().';


-- ───────────────────────────────────────────────────────────────────────────
-- 22 de 23 · 20261102_lo_que_el_cliente_guarda_el_dia_1.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  LO QUE EL CLIENTE GUARDA EL DÍA 1, Y NO SE GUARDABA                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Encontrado el 2 de nov, revisando qué se rompe cuando entra un cliente real.
-- Tres tablas y cinco columnas que el código escribe y que NINGÚN .sql del
-- repositorio crea. Comprobado contra los 69 archivos de migraciones y los 7
-- sueltos de la raíz: `el_numero`, `hitos_cinturon` y `diario_resumen` no
-- aparecen nombradas ni una vez, mientras `profiles` aparece en 61.
--
-- Por qué no lo vio ningún instrumento: el medidor mide pantallas y
-- `prueba-sql.sh` arma su propia base de prueba con las tablas que necesita.
-- Un hueco de esquema no se ve desde ninguno de los dos.
--
-- Y por qué no se veía EN LA APP: todas esas escrituras van con `void` o
-- dentro de un try/catch silencioso. El cliente toca «Guardar mi punto de
-- partida», lee que quedó guardado, y el dato no sale del teléfono.
--
-- Todo es `if not exists`: se puede correr más de una vez sin romper nada.

-- ── 1 · SU NÚMERO ──────────────────────────────────────────────────────────
-- El precio, los consultantes y las horas que carga el día 1, y su hora real
-- neta. Lo lee también la preventa del día 24. Hoy vivía solo en el navegador.
create table if not exists public.el_numero (
  usuario_id        uuid primary key references auth.users(id) on delete cascade,
  precio_sesion     numeric      not null default 0,
  pacientes_semana  numeric      not null default 0,
  horas_semana      numeric      not null default 0,
  phr               numeric      not null default 0,
  precio_nuevo      numeric,
  fecha_cambio      date,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

alter table public.el_numero enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='el_numero'
                   and policyname='el_numero_es_suyo') then
    create policy "el_numero_es_suyo" on public.el_numero
      for all to authenticated
      using (auth.uid() = usuario_id)
      with check (auth.uid() = usuario_id);
  end if;

  -- Y el equipo lo ve, que es lo que mira el Admin en la ficha del cliente.
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='el_numero'
                   and policyname='el_numero_lo_ve_el_equipo') then
    create policy "el_numero_lo_ve_el_equipo" on public.el_numero
      for select to authenticated
      using (exists (select 1 from public.profiles p
                      where p.id = auth.uid()
                        and (p.rol = 'admin' or p.admin_rol in ('owner','manager','staff'))));
  end if;
end $$;


-- ── 2 · LOS HITOS DE CINTURÓN ──────────────────────────────────────────────
-- La evidencia de cada grado: quién lo aprobó, cuándo y con qué comentario.
-- Sin esto, un cinturón ganado no deja rastro.
create table if not exists public.hitos_cinturon (
  id                 uuid primary key default gen_random_uuid(),
  usuario_id         uuid         not null references auth.users(id) on delete cascade,
  cinturon           text         not null,
  fase               int,
  tipo_verificacion  text,
  estado             text         not null default 'aprobado',
  agente             text,
  feedback_agente    text,
  aprobado_at        timestamptz,
  created_at         timestamptz  not null default now(),
  -- El código inserta sin mirar si ya estaba: un mismo grado no se gana dos
  -- veces, y el comentario del propio insert dice «duplicados: se ignoran».
  unique (usuario_id, cinturon)
);

alter table public.hitos_cinturon enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='hitos_cinturon'
                   and policyname='hitos_cinturon_son_suyos') then
    create policy "hitos_cinturon_son_suyos" on public.hitos_cinturon
      for all to authenticated
      using (auth.uid() = usuario_id)
      with check (auth.uid() = usuario_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='hitos_cinturon'
                   and policyname='hitos_cinturon_los_ve_el_equipo') then
    create policy "hitos_cinturon_los_ve_el_equipo" on public.hitos_cinturon
      for select to authenticated
      using (exists (select 1 from public.profiles p
                      where p.id = auth.uid()
                        and (p.rol = 'admin' or p.admin_rol in ('owner','manager','staff'))));
  end if;
end $$;


-- ── 3 · EL RESUMEN DE LA SEMANA ────────────────────────────────────────────
-- Lo que el Mentor escribe sobre el diario de la semana.
create table if not exists public.diario_resumen (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid         not null references auth.users(id) on delete cascade,
  semana_inicio  date         not null,
  resumen_texto  text         not null default '',
  created_at     timestamptz  not null default now(),
  unique (user_id, semana_inicio)
);

alter table public.diario_resumen enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='diario_resumen'
                   and policyname='diario_resumen_es_suyo') then
    create policy "diario_resumen_es_suyo" on public.diario_resumen
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;


-- ── 4 · LAS CINCO COLUMNAS DE `profiles` ───────────────────────────────────
--
-- Las dos primeras son las que más duelen: PostgREST rechaza el UPDATE ENTERO
-- si una columna del payload no está en el schema cache (PGRST204). El wizard
-- de bienvenida manda `avatar_tipo`, `diagnostico`, `adn_nicho` y
-- `adn_diagnostico_capa` en una sola llamada, así que faltando las dos
-- primeras tampoco se guardaban las otras dos, que sí existen. Y el Mentor lee
-- `avatar_tipo` para saber a quién le habla: sin dato, cae al avatar 'A' por
-- defecto desde el primer mensaje.
alter table public.profiles add column if not exists avatar_tipo  text;
alter table public.profiles add column if not exists diagnostico  jsonb;

-- La medición de entrada del día 1 y la de salida del día 83. Son los seis
-- números con los que el cliente se compara a sí mismo al final: el día 90 le
-- muestra el antes y el después, y el «antes» no se estaba guardando.
alter table public.profiles add column if not exists adn_medicion_entrada jsonb;
alter table public.profiles add column if not exists adn_medicion_salida  jsonb;

-- El grado visible en su ficha.
alter table public.profiles add column if not exists cinturon text;

comment on column public.profiles.avatar_tipo is
  'Qué avatar es, del diagnóstico del wizard. Lo lee el Mentor para saber a quién le habla.';
comment on column public.profiles.adn_medicion_entrada is
  'Los seis números del día 1 (src/lib/medicion.ts). El «antes» de la Foto del Día 90.';
comment on column public.profiles.adn_medicion_salida is
  'Los mismos seis números el día 83. El «después».';


-- ── 5 · LA EVIDENCIA DEL CLIENTE, QUE NO PODÍA SUBIR ───────────────────────
--
-- El día 1 pide dos evidencias con foto: «Foto del búnker» y «Pacto
-- publicado». Van al bucket `task-attachments`, bajo
-- `evidencias/{uid}/{meta_codigo}/`.
--
-- Ese bucket tenía sus tres políticas escritas para el EQUIPO
-- (20260515_admin_tareas_comments_attachments.sql): exigen rol admin. Un
-- cliente no podía subir, ni listar lo suyo, ni verlo. Y la pantalla le decía
-- que había quedado guardado.
--
-- Estas tres son solo para SU carpeta. La ruta empieza con `evidencias/`, así
-- que el uid es el SEGUNDO segmento, no el primero.
do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_sube') then
    create policy "evidencia_del_cliente_sube"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_lee') then
    create policy "evidencia_del_cliente_lee"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );
  end if;

  -- Puede borrar lo suyo mientras la jornada no cerró: subir la foto
  -- equivocada el día 1 no puede ser definitivo.
  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_borra') then
    create policy "evidencia_del_cliente_borra"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );
  end if;
end $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 23 de 23 · 20261103_el_equipo_lee_las_fichas.sql
-- ───────────────────────────────────────────────────────────────────────────

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  EL EQUIPO PODÍA EDITAR CUALQUIER FICHA, PERO NO PODÍA LEERLA            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Encontrado el 3 de nov, dando de alta al primer cliente real desde el Admin.
-- El alta terminaba en «La cuenta se creó, pero su ficha todavía no apareció
-- en la base», con la ficha ya creada y visible desde el editor SQL.
--
-- `profiles` tenía una sola política de lectura, la de
-- `fix-supabase.sql`:
--
--     "Authenticated users can view own profile"  FOR SELECT  (auth.uid() = id)
--
-- O sea: cada uno ve SU ficha y ninguna otra. Para el equipo había una de
-- escritura sobre todas (`el equipo edita cualquier ficha`,
-- 20261018_cerrar_antes_de_abrir.sql) pero NINGUNA de lectura. El Admin no se
-- daba cuenta porque la lista de clientes la trae el RPC `get_all_profiles`,
-- que es `security definer` y pasa por encima de RLS.
--
-- Lo que sí pasaba por RLS, y devolvía cero filas sin devolver error:
--
--   1 · La espera del alta (Admin.tsx): pregunta diez veces por la ficha con
--       un select directo. Nunca la veía, y el alta se cortaba ANTES de
--       marcar el servicio y antes de abrir la llave de la migración.
--
--   2 · El `update ... .select('id')` de la misma función. El UPDATE estaba
--       permitido, pero en Postgres el RETURNING necesita además permiso de
--       lectura sobre la fila: habría devuelto cero filas y el cartel
--       siguiente, «sus datos no se guardaron», con los datos guardados.
--
--   3 · El merge de columnas del plan en `cargarClientes()`. Trae
--       `servicio_contratado`, `acceso_tipo`, `cima_incluida`,
--       `biblioteca_abierta` y las demás con un select directo, y venía vacío
--       para TODOS los clientes. Es justo lo que su propio comentario dice que
--       evita: «sin estas tres, la ficha no sabe qué contrató y la matriz le
--       pide los 62 ítems a todo el mundo».
--
-- Es una línea: la lectura que faltaba, con el mismo criterio que la escritura
-- que ya estaba dada. No abre nada nuevo —quien ya podía editar cualquier
-- ficha ahora también puede leerla— y el cliente sigue viendo solo la suya,
-- porque las políticas se suman.

drop policy if exists "el equipo lee cualquier ficha" on public.profiles;
create policy "el equipo lee cualquier ficha" on public.profiles
  for select to authenticated
  using (public.es_del_equipo(auth.uid()));

comment on policy "el equipo lee cualquier ficha" on public.profiles is
  'La lectura que le faltaba al equipo. `es_del_equipo` es security definer, así que una política sobre profiles que la usa no se muerde la cola. Sin esto, el alta de un cliente desde el Admin no encontraba la ficha que el disparador acababa de crear.';


-- ───────────────────────────────────────────────────────────────────────────
-- QUÉ QUEDÓ
-- ───────────────────────────────────────────────────────────────────────────
with fn as (select unnest(string_to_array('abrir_jornada,admin_adjust_credits,admin_change_client_email,admin_delete_cliente,admin_delete_team_member,admin_migrate_profile,admin_set_monthly_quota,admin_update_adn_field,carga_de_semana,cargar_sesion,cerrar_jornada,cerrar_mi_migracion,cerrar_tarea,cola_de_evidencias,consume_credit,crear_notificacion,crear_tarea_del_sistema,cuantos_esperan,decidir_evidencia,devolver_credito,ensure_user_credits_row,es_del_equipo,estado_de_acompanamiento,estado_de_migraciones,gasto_ia_acumulado,gasto_ia_por_cliente,get_admin_tareas_with_users,get_all_profiles,get_metricas_globales,get_tarea_adjuntos,get_tarea_comentarios,get_team_members,get_user_diary,get_user_metrics,get_user_tasks,get_user_ventas,grant_credits,guardar_campo,guardar_extra_celda,guardar_respuestas,guardar_semana_cliente,guardar_veredicto_ia,habilitar_migracion,handle_new_user,historial_avisos,jornadas_recientes,marcar_acceso,marcar_biblioteca,marcar_leidos,marcar_respondido,marcar_servicio,mi_lista_de_hoy,monthly_reset_all,panel_ia_fallas,panel_ia_por_modelo,panel_ia_total,promover_a_admin,registrar_uso_ia,respuestas_de,sumar_campo,tiene_acompanamiento,toggle_full_agent_access,update_brand_manual,update_client_status', ',')) as nombre),
     tb as (select unnest(string_to_array('admin_notes,admin_tareas,admin_tareas_adjuntos,admin_tareas_comentarios,adn_audit_log,agent_conversations,agent_skill_progress,asistencia_grupales,campanas,canales_mensajes,cliente_preactivacion_check,coach_conversations,creativo_assets,creativos,credit_packs,credit_transactions,diario_entradas,diario_resumen,el_numero,evidencia_veredictos,gasto_ia,hitos_cinturon,hoja_de_ruta,jornadas,mensajes,metricas_v2,montaje_campana,notificaciones,pausas_globales,paypal_orders,pilar_satisfaction_ratings,profiles,programa_videos,reportes,sala_decisiones,sala_metricas_semana,sesion_respuestas,sesiones_asistentes,sesiones_grupales,session_logs,user_activity,user_credits,uso_ia,ventas_registradas', ',')) as nombre)
select 'FALTA FUNCIÓN · ' || nombre as estado from fn
where not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = fn.nombre)
union all
select 'FALTA TABLA · ' || nombre from tb
where not exists (select 1 from information_schema.tables
                  where table_schema = 'public' and table_name = tb.nombre)
union all
select 'POLÍTICA EN profiles · ' || cmd || ' · ' || policyname
from pg_policies where schemaname = 'public' and tablename = 'profiles'
order by estado;
