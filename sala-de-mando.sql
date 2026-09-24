-- ═══════════════════════════════════════════════════════════════════════════
-- SALA DE MANDO · SQL de instalación
--
-- Pegar entero en Supabase → SQL Editor → Run. Es idempotente: se puede correr
-- más de una vez sin romper nada.
--
-- LO QUE **NO** ESTÁ ACÁ, A PROPÓSITO — ya existe y se reusa:
--   admin_tareas (+ checklist, comentarios, adjuntos) .. el sistema de tareas
--   profiles ................................. los clientes y su plan
--   campanas / creativos / creativo_assets ... las campañas por cliente
--   cliente_preactivacion_check .............. el checklist de lanzamiento
--   hoja_de_ruta / session_logs .............. el progreso en El Camino
-- Duplicarlas parte los datos en dos lugares. No crear sala_tareas ni
-- sala_clientes.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── 1 · Las tareas ganan procedencia ───────────────────────────────────────
-- Para poder filtrar "lo que generó la app" de "lo que cargó una persona".
alter table admin_tareas
  add column if not exists origen text
    check (origen in ('manual','matriz','diagnostico','riesgo','reunion'))
    default 'manual',
  add column if not exists ref uuid;


-- ── 2 · El recorrido vive en el cliente ────────────────────────────────────
alter table profiles
  add column if not exists ola smallint,
  add column if not exists fecha_venta date,
  add column if not exists fecha_activacion date,
  add column if not exists etapa_actual smallint,
  add column if not exists etapa_desde date,
  add column if not exists semaforo text check (semaforo in ('verde','amarillo','rojo')),
  add column if not exists dueno text;

-- ⚠️ RECORDATORIO: todo campo de profiles que la app lea DESDE EL NAVEGADOR
-- tiene que sumarse al espejo de syncProfileToLocalStorage (src/lib/auth.ts),
-- o la lente 8.1 de auditoria.py revienta la batería. Ya pasó una vez con
-- plan_comercial y dejó la escalera de planes abierta para todos.


-- ── 3 · Lo que sí es nuevo ─────────────────────────────────────────────────

create table if not exists sala_hitos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  titulo text not null,
  detalle text,
  tipo text,
  estado text default 'pendiente',
  created_at timestamptz default now()
);

create table if not exists sala_roles (
  id uuid primary key default gen_random_uuid(),
  cargo text not null,                -- el puesto, no la persona
  persona text,                       -- quién lo ocupa hoy (puede cambiar)
  sostiene text[],
  no_toca text[],
  techo int,                          -- cuántos clientes admite el cargo
  activo_desde date,
  activo_hasta date
);

create table if not exists sala_traspaso (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  de_cargo text,
  a_cargo text not null,              -- ningún ítem sin dueño
  fecha_limite date,
  estado text default 'pendiente'
);

create table if not exists sala_rituales (
  id uuid primary key default gen_random_uuid(),
  dia_semana smallint not null,       -- 1 = lunes
  hora time,
  titulo text not null,
  agenda text,
  participantes text[],
  presencial boolean default false,
  vigente_desde date,
  vigente_hasta date
);

create table if not exists sala_reuniones (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid references sala_rituales(id) on delete set null,
  titulo text not null,
  fecha timestamptz not null,
  tipo text,
  participantes text[],
  cliente_id uuid references profiles(id) on delete set null,
  notas text,
  cerrada boolean default false,
  created_at timestamptz default now()
);

create table if not exists sala_decisiones (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  motivo text,
  fecha date not null default current_date,
  decidida_por text,
  area text,
  cliente_id uuid references profiles(id) on delete set null,
  estado text default 'vigente' check (estado in ('vigente','revisada','revertida')),
  reunion_id uuid references sala_reuniones(id) on delete set null,
  reemplaza_a uuid references sala_decisiones(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists sala_etapas (
  id smallint primary key,            -- 0 a 8
  nombre text not null,
  dias_min smallint,
  dias_max smallint,
  dueno_cargo text,
  criterios_salida text[]
);

create table if not exists sala_riesgos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  senal text not null,
  detector text,
  protocolo text,
  activo boolean default true
);

create table if not exists sala_alertas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references profiles(id) on delete cascade,
  riesgo_id uuid references sala_riesgos(id) on delete cascade,
  disparada_en timestamptz default now(),
  resuelta_en timestamptz,
  tarea_id uuid
);

-- Sin alertas duplicadas mientras la anterior siga ABIERTA.
-- Tiene que ser un índice parcial: en Postgres los NULL son distintos entre
-- sí, así que un unique(cliente_id, riesgo_id, resuelta_en) dejaría entrar
-- infinitas alertas abiertas del mismo riesgo — justo lo que se quiere evitar.
create unique index if not exists sala_alertas_una_abierta
  on sala_alertas (cliente_id, riesgo_id)
  where resuelta_en is null;

create table if not exists sala_motor (           -- solo el dueño del criterio
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  tipo text check (tipo in ('lead','agenda','llamada','cierre')),
  nombre text,
  monto numeric,
  forma_pago text check (forma_pago in ('contado','tres_pagos')),
  proximo_paso text,
  estado text
);


-- ── 4 · Carga semanal de números, a mano ───────────────────────────────────
-- El puente hasta que la API de Meta traiga esto solo. Son 5 números por
-- anuncio, una vez por semana. La app calcula el resto.
create table if not exists sala_metricas_semana (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references profiles(id) on delete cascade,
  campana_id uuid,                    -- referencia a campanas si existe
  semana_iso text not null,           -- '2026-W31'
  anuncio text,                       -- cuál de los 3
  objetivo text default 'mensajes'
    check (objetivo in ('perfil','mensajes','mensajes_alto')),
  gasto numeric default 0,
  alcance int default 0,
  comentarios int default 0,
  conversaciones int default 0,
  agendas int default 0,
  llamadas int default 0,
  ventas int default 0,
  facturado numeric default 0,
  cargado_por text,
  created_at timestamptz default now(),
  unique (cliente_id, semana_iso, anuncio)
);


-- ── 5 · Todo cerrado, solo admins ──────────────────────────────────────────
-- La columna real es profiles.rol, con valores 'cliente' | 'admin'.
-- (admin_rol es OTRA columna, la que distingue owner de manager dentro del
--  equipo. Para RLS alcanza con rol = 'admin'.)
do $$
declare t text;
begin
  foreach t in array array[
    'sala_hitos','sala_roles','sala_traspaso','sala_rituales','sala_reuniones',
    'sala_decisiones','sala_etapas','sala_riesgos','sala_alertas','sala_motor',
    'sala_metricas_semana'
  ] loop
    execute format('alter table %I enable row level security', t);
    -- Dos EXECUTE separados: un solo EXECUTE con dos sentencias no es fiable.
    execute format('drop policy if exists %I on %I', t || '_admin', t);
    execute format(
      'create policy %I on %I for all to authenticated '
      'using (exists (select 1 from profiles p '
      '               where p.id = auth.uid() and p.rol = ''admin''))',
      t || '_admin', t);
  end loop;
end $$;


-- ── 6 · Las nueve etapas, cargadas ─────────────────────────────────────────
insert into sala_etapas (id, nombre, dias_min, dias_max, dueno_cargo) values
  (0,'Bienvenida',1,3,'operador'),
  (1,'Método y oferta',4,14,'dueno_criterio'),
  (2,'Activos',10,21,'productor'),
  (3,'Conexiones',18,25,'instalador'),
  (4,'Prueba de cadena',2,2,'instalador'),
  (5,'Activación',0,0,'dueno_criterio'),
  (6,'Primeras ventas',1,30,'operador'),
  (7,'Ritmo propio',30,90,'operador'),
  (8,'Cliente satisfecho',null,null,'operador')
on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPES DE USO DE IA (turno 1.2)
--
-- El freno de lo que NO cobra crédito: el Mentor, los Entrenadores y los
-- pasos del Camino. Antes esto vivía en localStorage del navegador, o sea
-- que no era un tope: se borraba desde las herramientas del navegador.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists uso_ia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  clave text not null,               -- mentor | agentes | sesion
  creado_en timestamptz not null default now()
);

create index if not exists uso_ia_user_fecha
  on uso_ia (user_id, clave, creado_en desc);

alter table uso_ia enable row level security;
-- Nadie escribe acá desde el navegador: solo el servidor, con la clave de
-- servicio. Por eso no hay policy de insert para authenticated.
drop policy if exists uso_ia_lee_lo_suyo on uso_ia;
create policy uso_ia_lee_lo_suyo on uso_ia
  for select to authenticated
  using (user_id = auth.uid());

-- Registra un uso y responde si se puede seguir. Todo en una sola llamada
-- para que no haya carrera entre contar y decidir.
create or replace function registrar_uso_ia(
  p_user_id uuid,
  p_clave text,
  p_tope_semana int,
  p_tope_dia int
) returns table (permitido boolean, restantes_semana int, motivo text)
language plpgsql security definer as $$
declare
  v_semana int;
  v_dia int;
begin
  select count(*) into v_semana
    from uso_ia
   where user_id = p_user_id and clave = p_clave
     and creado_en > now() - interval '7 days';

  select count(*) into v_dia
    from uso_ia
   where user_id = p_user_id
     and creado_en > now() - interval '1 day';

  if p_tope_dia is not null and v_dia >= p_tope_dia then
    return query select false, 0, 'tope_dia'::text;
    return;
  end if;

  if p_tope_semana is not null and v_semana >= p_tope_semana then
    return query select false, 0, 'tope_semana'::text;
    return;
  end if;

  insert into uso_ia (user_id, clave) values (p_user_id, p_clave);

  return query select
    true,
    case when p_tope_semana is null then null::int
         else greatest(p_tope_semana - v_semana - 1, 0) end,
    null::text;
end $$;

-- Limpieza: lo de más de 30 días no sirve para ninguna ventana.
create or replace function limpiar_uso_ia() returns void
language sql as $$
  delete from uso_ia where creado_en < now() - interval '30 days';
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- DEVOLUCIÓN DE CRÉDITO (turno 1.3)
--
-- El guardián cobra ANTES de llamar al modelo — es la única forma de que dos
-- pedidos simultáneos no gasten el mismo saldo. Si después la cadena entera
-- falla, el cliente pagó por aire. Esto lo compensa.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function devolver_credito(
  p_user_id uuid,
  p_motivo text
) returns void
language plpgsql security definer as $$
begin
  -- Vuelve al saldo comprado (topup), no a la cuota mensual: la cuota se
  -- repone sola el día 1 y devolverle ahí sería regalarle un crédito extra
  -- que el mes que viene se pisa igual.
  update user_credits
     set topup_balance = coalesce(topup_balance, 0) + 1
   where user_id = p_user_id;

  insert into credit_transactions (user_id, delta, source, reason)
  values (p_user_id, 1, 'devolucion', p_motivo);
end $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- GASTO DE IA POR CLIENTE (turno 1.4)
--
-- No está para racionar: está para SABER cuánto cuesta cada cliente, y para
-- que un bucle o una cuenta comprometida no puedan quemar la cuenta de la
-- API sin que nadie se entere. Con este número se decide el precio.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists gasto_ia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  usd numeric(10,6) not null,
  modelo text,
  tarea text,
  feature text,
  -- false = el precio del modelo es estimado, no confirmado con el proveedor
  precio_verificado boolean default false,
  creado_en timestamptz not null default now()
);

create index if not exists gasto_ia_user_fecha on gasto_ia (user_id, creado_en desc);
create index if not exists gasto_ia_fecha on gasto_ia (creado_en desc);

alter table gasto_ia enable row level security;
-- Solo el servidor escribe. El cliente puede ver lo suyo.
drop policy if exists gasto_ia_lee_lo_suyo on gasto_ia;
create policy gasto_ia_lee_lo_suyo on gasto_ia
  for select to authenticated
  using (user_id = auth.uid());
-- Los admins ven todo: de acá sale el panel de costos.
drop policy if exists gasto_ia_admin_ve_todo on gasto_ia;
create policy gasto_ia_admin_ve_todo on gasto_ia
  for select to authenticated
  using (exists (select 1 from profiles p
                 where p.id = auth.uid() and p.rol = 'admin'));

-- Cuánto lleva gastado hoy y este mes. Una sola consulta.
create or replace function gasto_ia_acumulado(p_user_id uuid)
returns table (usd_hoy numeric, usd_mes numeric)
language sql security definer as $$
  select
    coalesce(sum(usd) filter (where creado_en >= date_trunc('day', now())), 0),
    coalesce(sum(usd) filter (where creado_en >= date_trunc('month', now())), 0)
  from gasto_ia
  where user_id = p_user_id;
$$;

-- Para el panel: gasto por cliente en una ventana.
create or replace function gasto_ia_por_cliente(p_dias int default 30)
returns table (
  user_id uuid, usd_total numeric, llamadas bigint,
  usd_estimado numeric, ultima timestamptz
)
language sql security definer as $$
  select
    g.user_id,
    round(sum(g.usd), 4),
    count(*),
    round(coalesce(sum(g.usd) filter (where not g.precio_verificado), 0), 4),
    max(g.creado_en)
  from gasto_ia g
  where g.creado_en > now() - (p_dias || ' days')::interval
  group by g.user_id
  order by 2 desc;
$$;

-- Limpieza: el detalle de más de 180 días no sirve para ninguna ventana.
create or replace function limpiar_gasto_ia() returns void
language sql as $$
  delete from gasto_ia where creado_en < now() - interval '180 days';
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- PANEL DEL MOTOR DE IA (turno 1.5)
--
-- Sin esto, quien mantenga la app optimiza a ciegas: no sabe qué modelo se
-- usa, qué cuesta, qué falla ni qué tarda.
-- ═══════════════════════════════════════════════════════════════════════════

alter table gasto_ia
  add column if not exists ms int,
  add column if not exists ok boolean not null default true,
  add column if not exists error text;

create index if not exists gasto_ia_ok on gasto_ia (ok, creado_en desc);

-- Resumen por MODELO: qué se usa, qué cuesta, qué falla, qué tarda.
create or replace function panel_ia_por_modelo(p_dias int default 7)
returns table (
  modelo text, tarea text,
  llamadas bigint, fallas bigint, pct_falla numeric,
  usd_total numeric, ms_mediana numeric, ms_p95 numeric
)
language sql security definer as $$
  select
    coalesce(g.modelo, 'desconocido'),
    coalesce(g.tarea, 'sin_tarea'),
    count(*),
    count(*) filter (where not g.ok),
    round(100.0 * count(*) filter (where not g.ok) / nullif(count(*), 0), 1),
    round(sum(g.usd), 4),
    -- percentile_cont devuelve double precision, y round con dos argumentos
    -- solo existe para numeric. Sin el cast: "function round(double precision,
    -- integer) does not exist".
    round((percentile_cont(0.5) within group (order by g.ms))::numeric, 0),
    round((percentile_cont(0.95) within group (order by g.ms))::numeric, 0)
  from gasto_ia g
  where g.creado_en > now() - (p_dias || ' days')::interval
  group by 1, 2
  order by 6 desc nulls last;
$$;

-- Las últimas fallas, con su mensaje. Es lo primero que se mira cuando algo
-- anda mal: el número dice que falla, esta lista dice por qué.
create or replace function panel_ia_fallas(p_limite int default 30)
returns table (
  creado_en timestamptz, user_id uuid,
  modelo text, tarea text, feature text, error text
)
language sql security definer as $$
  select g.creado_en, g.user_id, g.modelo, g.tarea, g.feature, g.error
  from gasto_ia g
  where not g.ok
  order by g.creado_en desc
  limit p_limite;
$$;

-- El total del período, para saber si el negocio cierra.
create or replace function panel_ia_total(p_dias int default 30)
returns table (
  usd_total numeric, usd_estimado numeric,
  llamadas bigint, fallas bigint, clientes bigint
)
language sql security definer as $$
  select
    round(coalesce(sum(usd), 0), 4),
    round(coalesce(sum(usd) filter (where not precio_verificado), 0), 4),
    count(*),
    count(*) filter (where not ok),
    count(distinct user_id)
  from gasto_ia
  where creado_en > now() - (p_dias || ' days')::interval;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- LA MESA DE PLATA PERSISTE (turno 4.1)
--
-- sala_metricas_semana nació pensada para el desglose POR ANUNCIO, pero la
-- Mesa de plata necesita UNA fila por cliente y semana con la cadena de valor
-- entera. Se extiende la misma tabla en vez de crear otra: dos tablas con
-- datos que se pisan es peor que una con una columna nullable.
--
-- La fila con `anuncio` en null es el TOTAL de la semana de ese cliente.
-- ═══════════════════════════════════════════════════════════════════════════

alter table sala_metricas_semana
  -- El precio del programa: manda sobre todos los topes de costo.
  add column if not exists precio numeric default 0,
  -- Predictivos: lo que el cliente decide hacer.
  add column if not exists piezas_publicadas int default 0,
  add column if not exists mensajes_enviados int default 0,
  -- El tramo de conversión.
  add column if not exists llamadas_tomadas int default 0,
  add column if not exists ofertas_presentadas int default 0,
  -- El dinero, separado: vender no es cobrar.
  add column if not exists cobrado numeric default 0,
  add column if not exists cuotas_por_cobrar numeric default 0,
  add column if not exists cuotas_cobradas numeric default 0,
  -- Retención.
  add column if not exists clientes_activos int default 0,
  add column if not exists clientes_que_terminan int default 0,
  add column if not exists renovaciones int default 0,
  add column if not exists referidos int default 0,
  add column if not exists casos_de_exito int default 0,
  add column if not exists actualizado_en timestamptz default now();

-- ⚠️ El unique original `(cliente_id, semana_iso, anuncio)` NO dedupe la fila
-- del total: en Postgres los NULL son distintos entre sí, así que se podrían
-- cargar veinte totales de la misma semana. Es el mismo error que ya apareció
-- en sala_alertas. Se arregla con un índice parcial.
create unique index if not exists sala_metricas_total_semana
  on sala_metricas_semana (cliente_id, semana_iso)
  where anuncio is null;

-- Guarda el total de la semana de un cliente. Si ya existía, lo reemplaza:
-- durante el viernes se carga, se corrige y se vuelve a cargar.
create or replace function guardar_semana_cliente(
  p_cliente_id uuid,
  p_semana_iso text,
  p_datos jsonb
) returns void
language plpgsql security definer as $$
begin
  insert into sala_metricas_semana (
    cliente_id, semana_iso, anuncio, objetivo, precio,
    gasto, alcance, comentarios, conversaciones, agendas,
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
    gasto = excluded.gasto, alcance = excluded.alcance,
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

alter table sala_metricas_semana enable row level security;
drop policy if exists sala_metricas_admin on sala_metricas_semana;
create policy sala_metricas_admin on sala_metricas_semana
  for all to authenticated
  using (exists (select 1 from profiles p
                 where p.id = auth.uid() and p.rol = 'admin'));


-- ═══════════════════════════════════════════════════════════════════════════
-- LA JORNADA — entrada, trabajo y salida (turno del cableado)
--
-- Vive en la base y no en el navegador porque las trabas que anota una
-- persona tienen que llegarle al resto el viernes. Si vivieran en el
-- navegador de cada uno, la lista de la semana estaría vacía para todos
-- menos para quien la escribió.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists jornadas (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null,
  dia date not null,
  inicio timestamptz not null default now(),
  fin timestamptz,
  -- En qué dijo que iba a trabajar y qué terminó atendiendo.
  planeados uuid[] default '{}',
  atendidos uuid[] default '{}',
  -- Lo que trabó. Es el dato más valioso de toda la tabla.
  traba text,
  traba_cliente uuid,
  creado_en timestamptz default now()
);

-- Una jornada por persona y día. Sin esto, tocar «Empezar» dos veces
-- duplicaría el día y contaría el trabajo dos veces.
create unique index if not exists jornada_persona_dia
  on jornadas (persona_id, dia);

create index if not exists jornada_por_dia on jornadas (dia desc);

alter table jornadas enable row level security;

-- Cada uno escribe la suya.
drop policy if exists jornada_propia on jornadas;
create policy jornada_propia on jornadas
  for all to authenticated
  using (persona_id = auth.uid())
  with check (persona_id = auth.uid());

-- Y todo el equipo lee las de todos: sin eso no hay lista de trabas
-- compartida, que es justo para lo que existe la tabla.
drop policy if exists jornada_equipo_lee on jornadas;
create policy jornada_equipo_lee on jornadas
  for select to authenticated
  using (exists (select 1 from profiles p
                 where p.id = auth.uid() and p.rol = 'admin'));

-- Abre el día. Si ya estaba abierto, actualiza lo planeado en vez de duplicar.
create or replace function abrir_jornada(
  p_persona uuid,
  p_planeados uuid[]
) returns uuid
language plpgsql security definer as $$
declare v_id uuid;
begin
  insert into jornadas (persona_id, dia, planeados)
  values (p_persona, current_date, coalesce(p_planeados, '{}'))
  on conflict (persona_id, dia)
  do update set planeados = excluded.planeados
  returning id into v_id;
  return v_id;
end $$;

-- Cierra el día.
create or replace function cerrar_jornada(
  p_persona uuid,
  p_atendidos uuid[],
  p_traba text default null,
  p_traba_cliente uuid default null
) returns void
language plpgsql security definer as $$
begin
  update jornadas
  set fin = now(),
      atendidos = coalesce(p_atendidos, '{}'),
      traba = nullif(trim(coalesce(p_traba, '')), ''),
      traba_cliente = p_traba_cliente
  where persona_id = p_persona and dia = current_date;
end $$;

-- Las jornadas de los últimos N días, para armar La Semana.
create or replace function jornadas_recientes(p_dias int default 7)
returns table (
  persona_id uuid, dia date, inicio timestamptz, fin timestamptz,
  planeados uuid[], atendidos uuid[], traba text, traba_cliente uuid
)
language sql security definer as $$
  select j.persona_id, j.dia, j.inicio, j.fin,
         j.planeados, j.atendidos, j.traba, j.traba_cliente
  from jornadas j
  where j.dia >= current_date - p_dias
  order by j.dia desc, j.inicio desc;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- LA CARGA COMPARTIDA — un formulario, dos puertas (turno 2)
--
-- Había dos tableros cargando lo mismo sin enterarse uno del otro: el cliente
-- en Campañas y el equipo en la Mesa de plata. Y si ninguno cargaba, la cola
-- quedaba ciega — no mostraba menos, mostraba que todo estaba bien.
--
-- Acá cada CAMPO es una fila con su firma. Así se sabe qué falta y quién lo
-- puso, sin coordinar nada entre las dos puertas.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists carga_semanal (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  semana_iso text not null,
  campo text not null,
  valor numeric not null default 0,
  -- Quién lo cargó. 'webhook' cuando entró solo.
  por_quien text not null,
  nombre_quien text,
  cargado_en timestamptz default now(),
  unique (cliente_id, semana_iso, campo)
);

create index if not exists carga_por_cliente
  on carga_semanal (cliente_id, semana_iso);

alter table carga_semanal enable row level security;

-- El cliente escribe la suya.
drop policy if exists carga_propia on carga_semanal;
create policy carga_propia on carga_semanal
  for all to authenticated
  using (cliente_id = auth.uid())
  with check (cliente_id = auth.uid());

-- Y el equipo escribe la de cualquiera: es la mitad del punto de todo esto.
drop policy if exists carga_equipo on carga_semanal;
create policy carga_equipo on carga_semanal
  for all to authenticated
  using (exists (select 1 from profiles p
                 where p.id = auth.uid() and p.rol = 'admin'));

-- Guarda un campo con su firma. Reemplaza si ya estaba: durante la semana se
-- corrige, y lo que vale es el último valor.
create or replace function guardar_campo(
  p_cliente uuid,
  p_semana text,
  p_campo text,
  p_valor numeric,
  p_quien text,
  p_nombre text default null
) returns void
language plpgsql security definer as $$
begin
  insert into carga_semanal (cliente_id, semana_iso, campo, valor, por_quien, nombre_quien)
  values (p_cliente, p_semana, p_campo, p_valor, p_quien, p_nombre)
  on conflict (cliente_id, semana_iso, campo)
  do update set valor = excluded.valor,
                por_quien = excluded.por_quien,
                nombre_quien = excluded.nombre_quien,
                cargado_en = now();
end $$;

-- Suma uno a un campo, sin pisar lo que hay. Es lo que usa el webhook de
-- agendas: cada cita que entra suma una, no reemplaza el total.
create or replace function sumar_campo(
  p_cliente uuid,
  p_semana text,
  p_campo text,
  p_cuanto numeric default 1,
  p_quien text default 'webhook'
) returns void
language plpgsql security definer as $$
begin
  insert into carga_semanal (cliente_id, semana_iso, campo, valor, por_quien)
  values (p_cliente, p_semana, p_campo, p_cuanto, p_quien)
  on conflict (cliente_id, semana_iso, campo)
  do update set valor = carga_semanal.valor + p_cuanto,
                cargado_en = now();
end $$;

-- La carga de una semana, con las firmas.
create or replace function carga_de_semana(p_cliente uuid, p_semana text)
returns table (campo text, valor numeric, por_quien text, nombre_quien text, cargado_en timestamptz)
language sql security definer as $$
  select c.campo, c.valor, c.por_quien, c.nombre_quien, c.cargado_en
  from carga_semanal c
  where c.cliente_id = p_cliente and c.semana_iso = p_semana;
$$;

-- Los mercados donde corre la pauta de cada cliente. NO es donde vive:
-- puede vivir en Chile y anunciar en Perú, Colombia y México.
alter table profiles
  add column if not exists mercados text[] default '{}',
  add column if not exists campana_desde date,
  add column if not exists campana_pausada boolean default false;

-- Lo que la app aprende de sus propios clientes, por mercado. En cuatro
-- semanas vale más que cualquier benchmark ajeno, porque es de este nicho,
-- a este precio.
create table if not exists mercado_aprendido (
  mercado text primary key,
  semanas int default 0,
  cpm_min numeric,
  cpm_max numeric,
  costo_conversacion numeric,
  pct_compra numeric,
  precio_min numeric,
  precio_max numeric,
  actualizado_en timestamptz default now()
);

alter table mercado_aprendido enable row level security;
drop policy if exists mercado_lee on mercado_aprendido;
create policy mercado_lee on mercado_aprendido
  for select to authenticated using (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- LO QUE EL CLIENTE ESCRIBE EN SUS SESIONES
--
-- El cronómetro y la emoción ya vivían en `session_logs`. Lo que el cliente
-- ESCRIBE —su método, su oferta, su avatar, sus artefactos— vivía SOLO en el
-- navegador. Si cambiaba de teléfono o limpiaba el navegador, lo perdía.
--
-- Y las sesiones guiadas SON el producto: perder eso es perder lo único que
-- justifica lo que pagó.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists sesion_respuestas (
  cliente_id uuid not null,
  meta_codigo text not null,
  -- El estado completo del paso a paso, tal como lo dejó.
  estado jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz default now(),
  primary key (cliente_id, meta_codigo)
);

create index if not exists sesion_resp_cliente
  on sesion_respuestas (cliente_id, actualizado_en desc);

alter table sesion_respuestas enable row level security;

-- Cada uno escribe y lee lo suyo.
drop policy if exists sesion_resp_propia on sesion_respuestas;
create policy sesion_resp_propia on sesion_respuestas
  for all to authenticated
  using (cliente_id = auth.uid())
  with check (cliente_id = auth.uid());

-- Y el equipo lee, para poder acompañar sin pedirle que reenvíe nada.
drop policy if exists sesion_resp_equipo on sesion_respuestas;
create policy sesion_resp_equipo on sesion_respuestas
  for select to authenticated
  using (exists (select 1 from profiles p
                 where p.id = auth.uid() and p.rol = 'admin'));

-- Guarda el estado de una sesión. Reemplaza: lo que vale es lo último.
create or replace function guardar_respuestas(
  p_cliente uuid,
  p_meta text,
  p_estado jsonb
) returns void
language plpgsql security definer as $$
begin
  insert into sesion_respuestas (cliente_id, meta_codigo, estado)
  values (p_cliente, p_meta, coalesce(p_estado, '{}'::jsonb))
  on conflict (cliente_id, meta_codigo)
  do update set estado = excluded.estado, actualizado_en = now();
end $$;

-- Todo lo que escribió, para poder retomarlo en cualquier dispositivo.
create or replace function respuestas_de(p_cliente uuid)
returns table (meta_codigo text, estado jsonb, actualizado_en timestamptz)
language sql security definer as $$
  select r.meta_codigo, r.estado, r.actualizado_en
  from sesion_respuestas r
  where r.cliente_id = p_cliente;
$$;


-- ═══════════════════════════════════════════════════════════════════════════
-- EL CEREBRO — que todo el trabajo viva en un solo lugar
--
-- La cola detectaba qué estaba roto, escribía la acción, y ahí se terminaba:
-- no creaba tarea, no quedaba asignada, no se podía modificar, y desaparecía
-- al recargar. Mientras tanto `admin_tareas` ya tenía todo lo que hacía falta.
--
-- Faltaban tres cosas: DE DÓNDE VINO la tarea (para poder contestar «¿por qué
-- esta tarea?»), A QUÉ APUNTA (para no crear la misma dos veces) y A DÓNDE
-- LLEVA (para que se pueda resolver en un toque, no buscando).
-- ═══════════════════════════════════════════════════════════════════════════

alter table admin_tareas
  -- cadena · soporte · recorrido · sesion · persona
  add column if not exists origen text default 'persona',
  -- El cuello, el mensaje o la etapa que la generó. Con cliente_id forma la
  -- huella que evita duplicar: la misma causa no crea dos tareas.
  add column if not exists ref text,
  -- mensaje · contenido · campana · conversacion · numeros · escalar · ninguno
  add column if not exists destino text default 'ninguno',
  -- Lo que hay que decir, ya escrito, cuando el destino es un mensaje.
  add column if not exists texto_listo text,
  -- Cuánto pesa en el orden. Lo calcula la app, no la persona.
  add column if not exists peso int default 0;

-- Una causa, una tarea. Sin esto, cada vez que se recalcula la cadena se
-- crearía otra tarea por el mismo cuello y la lista se volvería inusable.
create unique index if not exists tarea_por_causa
  on admin_tareas (cliente_id, origen, ref)
  where ref is not null and status <> 'completada';

create index if not exists tarea_por_dueno_status
  on admin_tareas (asignado_a, status, peso desc);

/**
 * Crea una tarea desde el sistema, sin duplicar.
 *
 * Si ya existe una abierta por la misma causa, ACTUALIZA su peso y su texto
 * en vez de crear otra: el cuello puede haber empeorado, y lo que hay que
 * decir puede haber cambiado, pero es la misma tarea.
 */
create or replace function crear_tarea_del_sistema(
  p_titulo text,
  p_descripcion text,
  p_asignado uuid,
  p_cliente uuid,
  p_origen text,
  p_ref text,
  p_destino text default 'ninguno',
  p_texto_listo text default null,
  p_peso int default 0,
  p_prioridad text default 'media',
  p_vence date default null
) returns uuid
language plpgsql security definer as $$
declare v_id uuid;
begin
  insert into admin_tareas (
    titulo, descripcion, asignado_a, creado_por, cliente_id,
    origen, ref, destino, texto_listo, peso, prioridad, fecha_vencimiento, status
  ) values (
    p_titulo, p_descripcion, p_asignado, p_asignado, p_cliente,
    p_origen, p_ref, p_destino, p_texto_listo, p_peso, p_prioridad::admin_tarea_prioridad,
    p_vence, 'pendiente'
  )
  on conflict (cliente_id, origen, ref) where ref is not null and status <> 'completada'
  do update set
    peso = excluded.peso,
    titulo = excluded.titulo,
    descripcion = excluded.descripcion,
    texto_listo = excluded.texto_listo,
    updated_at = now()
  returning id into v_id;
  return v_id;
end $$;

/**
 * La lista de hoy de una persona: TODO su trabajo, venga de donde venga.
 *
 * Es la misma lista que ve en Tareas. Nunca dos listas.
 */
create or replace function mi_lista_de_hoy(p_persona uuid)
returns table (
  id uuid, titulo text, descripcion text, cliente_id uuid,
  origen text, ref text, destino text, texto_listo text,
  peso int, prioridad text, fecha_vencimiento date, status text
)
language sql security definer as $$
  select t.id, t.titulo, t.descripcion, t.cliente_id,
         t.origen, t.ref, t.destino, t.texto_listo,
         t.peso, t.prioridad::text, t.fecha_vencimiento, t.status::text
  from admin_tareas t
  where t.asignado_a = p_persona
    and t.status <> 'completada'
    and t.archivada_at is null
  -- Lo vencido primero: una tarea vencida YA FALLÓ UNA VEZ.
  order by (t.fecha_vencimiento is not null and t.fecha_vencimiento < current_date) desc,
           t.peso desc,
           t.created_at asc;
$$;

/** Cierra una tarea y deja constancia de quién la cerró. */
create or replace function cerrar_tarea(p_tarea uuid, p_quien uuid)
returns void
language plpgsql security definer as $$
begin
  update admin_tareas
  set status = 'completada', completada_at = now(), updated_at = now()
  where id = p_tarea;
end $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- QUIÉN ESTÁ ESPERANDO RESPUESTA
--
-- El circuito de soporte funcionaba de punta a punta, pero SI NADIE RESPONDÍA
-- NADA LO SEÑALABA: un mensaje podía quedar tres días sin respuesta sin
-- aparecer en la cola, ni en la supervisión, ni en el marcador.
--
-- En un producto de miles, tres días de silencio es la diferencia entre un
-- cliente y un reembolso.
-- ═══════════════════════════════════════════════════════════════════════════

alter table mensajes
  -- Cuándo el equipo respondió. Null = todavía espera.
  add column if not exists respondido_en timestamptz,
  -- 'duda' o 'roto'. Se atienden distinto: una duda puede esperar un día,
  -- algo roto le está costando dinero ahora.
  add column if not exists tipo text default 'duda';

create index if not exists mensajes_sin_responder
  on mensajes (created_at)
  where respondido_en is null;

/**
 * Marca respondidos todos los mensajes de un cliente.
 *
 * Se llama cuando alguien del equipo le escribe: responder al último es
 * responder a todos los anteriores, y dejarlos abiertos haría que la bandeja
 * mostrara gente que ya fue atendida.
 */
create or replace function marcar_respondido(p_cliente uuid)
returns void
language plpgsql security definer as $$
begin
  update mensajes
  set respondido_en = now()
  where emisor_id = p_cliente
    and canal = 'humano'
    and respondido_en is null;
end $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- LOS DATOS QUE EL CRON NECESITA PARA MANDAR LOS AVISOS
--
-- `avisosCliente` estaba construido y probado, y NADIE LO DISPARABA — es el
-- módulo que hace que la app empuje sola. Sin esto, toda cuenta que se traba
-- espera a que una persona la mire, y el modelo entero deja de escalar.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function clientes_para_avisar(p_semana text)
returns table (cliente_id uuid, gasto numeric, conversaciones numeric,
               agendas numeric, ventas numeric, cargo boolean)
language sql security definer as $$
  select
    p.id,
    coalesce(max(case when c.campo = 'gasto' then c.valor end), 0),
    coalesce(max(case when c.campo = 'conversaciones' then c.valor end), 0),
    coalesce(max(case when c.campo = 'agendas' then c.valor end), 0),
    coalesce(max(case when c.campo = 'ventas' then c.valor end), 0),
    count(c.campo) > 0
  from profiles p
  left join carga_semanal c
    on c.cliente_id = p.id and c.semana_iso = p_semana
  where p.rol = 'cliente'
    and p.campana_desde is not null
    and coalesce(p.campana_pausada, false) = false
  group by p.id;
$$;
