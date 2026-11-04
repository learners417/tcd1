#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  LA PRUEBA DE `poner-al-dia-la-base.sql`                                   ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# El 4 de noviembre la base de producción tenía las migraciones corridas hasta
# principios de octubre: faltaban 16 funciones y 8 tablas que la app usa todos
# los días. `poner-al-dia-la-base.sql` las pone al día.
#
# Esta prueba responde tres cosas, contra un PostgreSQL de verdad:
#
#   1 · ¿Corre entero sin un error, partiendo de una base como la de Javo?
#   2 · ¿Corre DOS VECES sin error? Es lo que lo hace seguro sobre una base
#       donde parte ya está hecha, que es el caso real.
#   3 · ¿Quedan las 16 funciones, las 8 tablas y las políticas, y el equipo
#       puede editar la ficha de un cliente sin que un cliente pueda leer la
#       de otro?
#
# El andamiaje NO se copia: se reusa el de `prueba-sql.sh`, que ya sabe armar
# la base vieja leyendo las propias migraciones. Se corta en su marcador, así
# que si ese archivo crece, esto sigue andando.

set -u
cd "$(dirname "$0")/.." || exit 1

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -1)
if [ -z "$PGBIN" ]; then
  echo "sin PostgreSQL local: no se puede probar acá"
  exit 0
fi

MARCADOR='el SQL contra PostgreSQL real'
CORTE=$(grep -n "$MARCADOR" scripts/prueba-sql.sh | head -1 | cut -d: -f1)
if [ -z "$CORTE" ]; then
  echo "no encuentro el marcador «$MARCADOR» en scripts/prueba-sql.sh"
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
sed -n "1,$((CORTE - 1))p" scripts/prueba-sql.sh > "$TMP/corrida.sh"

cat >> "$TMP/corrida.sh" << 'RESTO'

# ── Lo que está en la base de Javo y ninguna migración crea ────────────────
#
# `metricas_v2` no la crea ningún .sql del repositorio —se hizo a mano en el
# panel— y la auditoría del 4 de noviembre confirma que en la base está. El
# andamiaje tiene que parecerse a la base real: sin esto, una migración
# correcta falla acá. Las columnas son las que le piden las migraciones y las
# pantallas.
psqlq << 'SQL' > /dev/null 2>&1
create table if not exists metricas_v2 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, semana text,
  met_periodo_tipo text, met_fecha_inicio date, met_fecha_fin date,
  met_ads_plataforma text, met_dms_organicos int,
  met_posts_feed_ig int, met_posts_reels_ig int, met_stories_ig int,
  met_posts_tiktok int, met_posts_shorts int, met_posts_facebook int,
  met_posts_linkedin int, met_roas numeric, met_proyeccion_mes numeric,
  created_at timestamptz default now());
SQL

# `sala-de-mando.sql` ya corrió en la base de Javo: crea `jornadas`,
# `sala_decisiones` y las demás, y la auditoría no las da por faltantes. Va
# ANTES y sin tabla de prueba propia: una tabla parecida pero con menos
# columnas hace que su `create table if not exists` la saltee, y después falla
# una consulta correcta.
psqlq -f sala-de-mando.sql > "$DATA/sdm.txt" 2>&1
marcar $? "la base de partida se arma igual a la de Javo"

cp poner-al-dia-la-base.sql "$DATA/puesta.sql"; chmod 644 "$DATA/puesta.sql"

echo ""
echo "══ poner-al-dia-la-base.sql ══"
psqlq -f "$DATA/puesta.sql" > "$DATA/p1.txt" 2>&1
marcar $? "corre entero sin un solo error"
grep -E "^ERROR|^psql.*ERROR" "$DATA/p1.txt" | head -5

psqlq -f "$DATA/puesta.sql" > "$DATA/p2.txt" 2>&1
marcar $? "corre DOS VECES sin error (seguro sobre una base a medias)"
grep -E "^ERROR|^psql.*ERROR" "$DATA/p2.txt" | head -5

echo ""
echo "══ lo que faltaba, después de correrlo ══"
su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A" << 'SQL' > "$DATA/q.txt" 2>&1
create temp view esperado as
with v(nombre, clase) as (values
  ('cargar_sesion','f'),('cerrar_mi_migracion','f'),('cola_de_evidencias','f'),
  ('cuantos_esperan','f'),('decidir_evidencia','f'),('estado_de_acompanamiento','f'),
  ('estado_de_migraciones','f'),('guardar_extra_celda','f'),('guardar_veredicto_ia','f'),
  ('habilitar_migracion','f'),('historial_avisos','f'),('marcar_acceso','f'),
  ('marcar_biblioteca','f'),('marcar_leidos','f'),('marcar_servicio','f'),
  ('tiene_acompanamiento','f'),('es_del_equipo','f'),
  ('asistencia_grupales','t'),('canales_mensajes','t'),('evidencia_veredictos','t'),
  ('montaje_campana','t'),('pausas_globales','t'),('reportes','t'),
  ('sesiones_asistentes','t'),('sesiones_grupales','t'))
select nombre,
  (clase='f' and exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                         where n.nspname='public' and p.proname=v.nombre))
  or (clase='t' and exists (select 1 from information_schema.tables
                            where table_schema='public' and table_name=v.nombre)) as quedo
from v;
select count(*) filter (where not quedo) from esperado;
select 'NO QUEDÓ · ' || nombre from esperado where not quedo;
SQL
sin_quedar=$(sed -n '2p' "$DATA/q.txt")
[ "$sin_quedar" = "0" ]; marcar $? "quedan las 16 funciones, las 8 tablas y es_del_equipo"
grep "NO QUEDÓ" "$DATA/q.txt" | head -10

# ── Las políticas, ejercidas como las ejerce la app ────────────────────────
#
# El andamiaje define auth.uid() como `null` fijo, con lo cual NINGUNA política
# puede dar verdadero y cualquier prueba de permisos sale «no puede» por el
# motivo equivocado. Acá auth.uid() lee quién está actuando.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << 'SQL' > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
insert into profiles (id, nombre, rol) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Javo','admin'),
  ('aaaaaaaa-0000-0000-0000-000000000002','Cliente','cliente'),
  ('aaaaaaaa-0000-0000-0000-000000000003','Otro','cliente')
  on conflict do nothing;
SQL

echo ""
echo "══ las políticas, ejercidas ══"

# El `returning` del alta: el UPDATE está permitido, pero devolver la fila
# necesita ADEMÁS permiso de lectura. Las dos cosas en una sola prueba.
# `psql` imprime también BEGIN, SET y ROLLBACK: la cuenta es la única línea
# que es un número sola. Sin este filtro las cuatro pruebas comparaban
# «BEGINSETSET1ROLLBACK» contra «1» y daban rojo estando todo bien.
solo_numero() { grep -E '^[0-9]+$' | head -1; }

como() {
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A" << SQL 2>&1 | solo_numero
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '$1';
with t as (update profiles set especialidad = 'x' where id = '$2' returning id)
  select count(*) from t;
rollback;
SQL
}
leer() {
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A" << SQL 2>&1 | solo_numero
begin;
set local role authenticated;
set local "request.jwt.claim.sub" = '$1';
select count(*) from profiles where id = '$2';
rollback;
SQL
}
A=aaaaaaaa-0000-0000-0000-000000000001   # equipo
C=aaaaaaaa-0000-0000-0000-000000000002   # cliente
O=aaaaaaaa-0000-0000-0000-000000000003   # otro cliente

[ "$(como $A $C)" = "1" ]
marcar $? "el equipo edita la ficha de un cliente y la recibe de vuelta"
[ "$(leer $C $O)" = "0" ]
marcar $? "un cliente no lee la ficha de otro"
[ "$(como $C $O)" = "0" ]
marcar $? "un cliente no edita la ficha de otro"
[ "$(leer $C $C)" = "1" ]
marcar $? "un cliente sí lee la suya"

echo ""
if [ "$fallas" -eq 0 ]; then echo "SIN FALLAS"; else echo "FALLAS: $fallas"; fi
exit "$fallas"
RESTO

bash "$TMP/corrida.sh"
