#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  LA PRUEBA DE `poner-al-dia-la-base-2.sql`                                 ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# El gemelo de `prueba-puesta-al-dia.sh`, para el segundo archivo: los once
# .sql que el repositorio escribió del 4 al 27 de noviembre y que la rama de
# producción —`mejoras`— no tiene.
#
# Por qué hace falta probarlo: ese archivo existe para que Javo lo pegue una
# sola vez en el SQL Editor de Supabase, sobre su base de verdad. Si se corta a
# la mitad, la transacción lo protege y no pierde nada, pero pierde el viaje y
# la confianza. Así que se contesta antes, contra un PostgreSQL de verdad:
#
#   1 · ¿Corre entero sin un error, partiendo de una base como la de Javo?
#   2 · ¿Corre DOS VECES sin error? Es lo que lo hace seguro sobre una base
#       donde parte ya está hecha, que es el caso real.
#   3 · ¿Su propia consulta final dice que no falta nada? Esa consulta es lo
#       único que Javo va a leer, así que si miente, miente en el único lugar
#       donde se la cree.
#
# Y una cuarta que el gemelo no necesita: que el archivo no borre datos. Se
# mide sobre el texto, no sobre la intención.
#
# La base de partida se arma igual que en el gemelo —el andamiaje de
# `prueba-sql.sh`, cortado en su marcador, más `sala-de-mando.sql`— y encima se
# corre el PRIMER `poner-al-dia-la-base.sql`. Esa es la base que creemos que
# tiene Javo: hasta el 3 de noviembre. El segundo archivo sigue desde ahí.
#
# Y el segundo archivo NO está en el repositorio: se arma acá con
# `scripts/armar-puesta-al-dia-2.py`. El motivo está escrito en el encabezado
# de ese archivo, y lo encontró esta misma batería: guardado al lado de las
# migraciones, su copia curaba los defectos que los arneses meten a propósito y
# tres lentes se volvían ciegas. Una sola copia de cada migración en el repo.
#
# Correr con: bash scripts/prueba-puesta-al-dia-2.sh

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

PAQUETE="$TMP/poner-al-dia-la-base-2.sql"
if ! python3 scripts/armar-puesta-al-dia-2.py "$PAQUETE" > /dev/null; then
  echo "✗ no se pudo armar el paquete con scripts/armar-puesta-al-dia-2.py"
  exit 1
fi

sed -n "1,$((CORTE - 1))p" scripts/prueba-sql.sh > "$TMP/corrida.sh"

cat >> "$TMP/corrida.sh" << 'RESTO'

# ── La base de partida, igual que en el gemelo ─────────────────────────────
#
# `metricas_v2` no la crea ningún .sql del repositorio: se hizo a mano en el
# panel y en la base está. El andamiaje tiene que parecerse a la base real;
# sin esto, una migración correcta falla acá por el motivo equivocado.
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

psqlq -f sala-de-mando.sql > "$DATA/sdm.txt" 2>&1
marcar $? "la base de partida se arma igual a la de Javo"

# Y las dos tablas de abril que estos once archivos tocan sin crear. En la base
# de Javo están desde abril —el informe del primer poner-al-día las nombra— y
# el andamiaje no las tenía: sin esto, el segundo archivo se cortaba en el
# `alter table public.adn_audit_log` y la prueba decía rojo por el motivo
# equivocado, culpando al archivo de un agujero del andamiaje.
psqlq -f supabase/migrations/20260410_campanas_creativos.sql > "$DATA/abr1.txt" 2>&1
marcar $? "y las de abril: creativos"
psqlq -f supabase/migrations/20260429_admin_adn_edit.sql > "$DATA/abr2.txt" 2>&1
marcar $? "y adn_audit_log"

cp poner-al-dia-la-base.sql "$DATA/puesta1.sql"; chmod 644 "$DATA/puesta1.sql"
psqlq -f "$DATA/puesta1.sql" > "$DATA/u1.txt" 2>&1
marcar $? "y encima corre el primer poner-al-dia (hasta el 3 de noviembre)"
grep -E "^ERROR|^psql.*ERROR" "$DATA/u1.txt" | head -3

cp "$PAQUETE" "$DATA/puesta2.sql"; chmod 644 "$DATA/puesta2.sql"

echo ""
echo "══ poner-al-dia-la-base-2.sql ══"
psqlq -f "$DATA/puesta2.sql" > "$DATA/d1.txt" 2>&1
marcar $? "corre entero sin un solo error"
grep -E "^ERROR|^psql.*ERROR" "$DATA/d1.txt" | head -5

psqlq -f "$DATA/puesta2.sql" > "$DATA/d2.txt" 2>&1
marcar $? "corre DOS VECES sin error (seguro sobre una base a medias)"
grep -E "^ERROR|^psql.*ERROR" "$DATA/d2.txt" | head -5

# ── Su propia consulta final, que es lo único que Javo va a leer ───────────
#
# No se escribe otra vez acá: se corta del archivo en su marcador. Si alguien
# le cambia la consulta al archivo, esta prueba mide la nueva.
echo ""
echo "══ la consulta final del archivo ══"
sed -n '/^-- QUÉ QUEDÓ$/,$p' "$DATA/puesta2.sql" > "$DATA/informe.sql"
[ -s "$DATA/informe.sql" ]
marcar $? "el archivo trae su consulta de «qué quedó»"

su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A -f $DATA/informe.sql" \
  > "$DATA/informe.txt" 2>&1
marcar $? "la consulta final corre sin error"

faltan=$(grep -c "^FALTA" "$DATA/informe.txt" 2>/dev/null | head -1)
faltan=${faltan:-0}
[ "$faltan" = "0" ]
marcar $? "después de correrlo, su propia consulta no dice FALTA ni una vez"
grep "^FALTA" "$DATA/informe.txt" | head -10

# Y que la consulta no esté diciendo «ok» sobre la nada: tiene que haber
# medido algo. Una consulta que no mira ningún objeto también sale sin FALTA.
medidos=$(grep -c "^ok" "$DATA/informe.txt" 2>/dev/null | head -1)
medidos=${medidos:-0}
[ "$medidos" -ge 25 ]
marcar $? "y midió de verdad: $medidos objetos revisados (no es un verde vacío)"

echo ""
if [ "$fallas" -eq 0 ]; then echo "SIN FALLAS"; else echo "FALLAS: $fallas"; fi
exit "$fallas"
RESTO

PAQUETE="$PAQUETE" bash "$TMP/corrida.sh"
salida=$?

# ── Que el archivo no borre datos. Se mide el texto, no la intención ───────
#
# Los `drop ... if exists` de políticas y restricciones son la forma de
# reemplazar una regla y están permitidos. Lo que no puede aparecer es borrar
# o pisar datos.
echo ""
echo "══ que no borre nada ══"
peligro=$(grep -inE "^[[:space:]]*(drop[[:space:]]+(table|schema|database|type)|truncate|delete[[:space:]]+from|update[[:space:]]+[a-z_.\"]+[[:space:]]+set)" \
  "$PAQUETE" | grep -v "delete from public.fallas_vistas where creado_en" | head -5)
if [ -z "$peligro" ]; then
  echo "  ✓ ni un drop table, ni un truncate, ni un delete o update de datos que se corra"
else
  echo "  ✗ hay statements que tocan datos:"
  echo "$peligro" | sed 's/^/      /'
  salida=$((salida + 1))
fi

exit "$salida"
