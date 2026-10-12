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
