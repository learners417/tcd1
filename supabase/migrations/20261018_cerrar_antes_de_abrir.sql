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
