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
