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
