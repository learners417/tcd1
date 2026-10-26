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
