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
