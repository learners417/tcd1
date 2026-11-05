#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  LA PRUEBA DE `20261105_donde_cae_lo_que_se_rompe.sql`                     ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# La migración crea `fallas_vistas`, la tabla donde cae lo que se le rompe a un
# cliente, con dos reglas que son el punto entero del archivo:
#
#   · CUALQUIERA escribe, con sesión o sin ella. La falla la tiene el que se
#     rompió, y las que más duelen pasan ANTES de entrar —en el alta, en la
#     bienvenida, al volver de un pago—. Si ahí no puede dejar constancia, esos
#     son justo los casos de los que nunca nos enteramos.
#
#   · SOLO EL EQUIPO lee. Lo que cae es la pila y la dirección de CUALQUIER
#     cliente; uno no tiene por qué ver lo que le pasó a otro.
#
# Una política mal escrita acá no se nota mirando: la tabla se crea igual y la
# app escribe igual. Se nota el día que un cliente abre la consola y lee las
# fallas de los demás. Así que las cuatro se EJERCEN, con el rol y el usuario
# puestos como los pone PostgREST.
#
# El andamiaje se reusa de `prueba-sql.sh` cortando en su marcador, igual que
# `prueba-puesta-al-dia.sh`: si ese archivo crece, esto sigue andando.

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

# `psql` imprime también BEGIN, SET y ROLLBACK: la cuenta es la única línea que
# es un número sola. Sin este filtro las pruebas comparan «BEGINSET1ROLLBACK»
# contra «1» y dan rojo estando todo bien.
#
# Y con `-t` psql ALINEA la columna, o sea que la línea es «     1», con
# espacios adelante: un `^[0-9]+$` pelado no encuentra nada y las seis pruebas
# comparan la cadena vacía contra «1». Dan rojo estando todo bien, que es la
# peor clase de rojo: manda a arreglar lo que no está roto. Se permiten los
# espacios y después se sacan.
solo_numero() { grep -E '^[[:space:]]*[0-9]+[[:space:]]*$' | head -1 | tr -d '[:space:]'; }

# ─── «COMO SI FUERA FULANO» ───────────────────────────────────────────────
#
# `prueba-sql.sh` tiene este mismo ayudante, pero en la línea 380 — DESPUÉS
# del marcador por el que esta prueba corta, así que no llega. Se define acá,
# con la misma forma: redefinir `auth.uid()` es la única manera de cambiar de
# persona en este andamiaje, porque ahí `auth.uid()` está escrita fija en
# `select null::uuid` y no lee el `request.jwt.claim.sub` de Supabase.
#
# `set role` y no `set local role`: `local` solo vive dentro de una
# transacción, y acá cada llamada es una sesión suelta — sin BEGIN, `set
# local` avisa y no hace nada, así que la prueba correría como superusuario y
# daría verde sin haber probado ninguna política.
comoSi() {  # comoSi <uid> <sql>
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -v ON_ERROR_STOP=1" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$1'::uuid \$\$;
set role authenticated;
$2
reset role;
SQL
}

# Y para LEER hace falta otro: `comoSi` manda su salida a /dev/null, y una
# tabla temporal no sirve de puente porque cada llamada a psql es una sesión
# nueva — la temporal se crea y muere ahí mismo. Este cuenta y devuelve el
# número, con la persona puesta.
contarComo() {  # contarComo <uid> → cuántas fallas ve esa persona
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -t -v ON_ERROR_STOP=1" << SQL 2>&1 | solo_numero
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$1'::uuid \$\$;
set role authenticated;
select count(*) from public.fallas_vistas;
reset role;
SQL
}

# ── Lo que la migración da por hecho ───────────────────────────────────────
#
# `es_del_equipo` la crea una migración de octubre que sí está en el repo, pero
# el andamiaje de `prueba-sql.sh` arma una base mínima. Se pone acá con la
# misma forma que tiene en la base real: `security definer`, así que una
# política sobre `profiles` que la use no se llama a sí misma.
psqlq << 'SQL' > /dev/null 2>&1
create table if not exists auth.users (id uuid primary key);
create or replace function public.es_del_equipo(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = uid and rol in ('admin','equipo'));
$$;
SQL

echo "══ la migración ══"

MIG=supabase/migrations/20261105_donde_cae_lo_que_se_rompe.sql
psqlq -f "$MIG" > "$DATA/m1.txt" 2>&1
marcar $? "corre entero sin un solo error"
grep -E "^ERROR|^psql.*ERROR" "$DATA/m1.txt" | head -3

psqlq -f "$MIG" > "$DATA/m2.txt" 2>&1
marcar $? "corre DOS VECES sin error (seguro sobre una base a medias)"

echo ""
echo "══ las cuatro reglas, ejercidas ══"

# Dos personas: una del equipo y un cliente.
psqlq << 'SQL' > /dev/null 2>&1
insert into auth.users (id) values
  ('aaaaaaaa-0000-0000-0000-000000000001'),
  ('bbbbbbbb-0000-0000-0000-000000000002') on conflict do nothing;
insert into profiles (id, nombre, rol) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Del equipo','equipo'),
  ('bbbbbbbb-0000-0000-0000-000000000002','Un cliente','cliente')
  on conflict (id) do update set rol = excluded.rol;
-- `usage on schema auth` lo tienen los dos roles en Supabase de verdad, y sin
-- eso `auth.uid()` —que es lo que la política de lectura consulta— muere con
-- «permission denied for schema auth» y el equipo no lee nada. El andamiaje de
-- `prueba-sql.sh` no lo da, así que la prueba daba rojo con la política bien
-- escrita: el andamiaje tiene que parecerse a la base real, no al revés.
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
grant insert on public.fallas_vistas to anon, authenticated;
grant select on public.fallas_vistas to authenticated;
SQL

# ─── QUIÉN DICE QUIÉN SOY ─────────────────────────────────────────────────
#
# El andamiaje define `auth.uid()` FIJO en `select null::uuid` (prueba-sql.sh
# línea 70) y para cambiarla trae su propio ayudante, `comoSi`, que la
# redefine. O sea que el `set_config('request.jwt.claim.sub', …)` que usa
# Supabase de verdad acá no hace nada: `auth.uid()` sigue devolviendo null,
# `es_del_equipo(null)` da falso y el equipo no lee nada.
#
# Se usa el ayudante de la casa. `comoSi` vive en el pedazo de `prueba-sql.sh`
# que esta prueba recorta, así que ya está definido acá.

# ─── SE ESCRIBE CON UN ROL Y SE CUENTA CON OTRO ───────────────────────────
#
# La primera versión de estas dos pruebas insertaba como `anon` y contaba
# TAMBIÉN como `anon`, en la misma transacción. Daban cero y parecía que la
# escritura no entraba. Entraba perfecto: `anon` no tiene política de LECTURA
# —ese es el punto de la tabla— así que el count no veía su propia fila.
#
# Es la misma lección que costó el alta de clientes en noviembre: escribir y
# leer son dos permisos, y `returning` necesita el de leer. Entonces se
# escribe con el rol que se quiere probar y se cuenta con `reset role`, sin
# política encima, antes de deshacer todo.

# 1 · El que todavía no entró puede dejar su falla. Es el caso del alta.
N=$(psqlq -t << 'SQL' 2>&1 | solo_numero
begin;
set local role anon;
insert into public.fallas_vistas (pantalla, mensaje, clase)
  values ('bienvenida','se cortó al guardar','rotura');
reset role;
select count(*) from public.fallas_vistas where mensaje = 'se cortó al guardar';
rollback;
SQL
)
[ "$N" = "1" ]; marcar $? "el que todavía no entró deja su falla (devolvió «$N»)"

# 2 · Un cliente con sesión también.
comoSi 'bbbbbbbb-0000-0000-0000-000000000002' \
  "insert into public.fallas_vistas (pantalla, mensaje, clase)
     values ('roadmap','no abre la sesión','rotura');"
N=$(psqlq -t << 'SQL' 2>&1 | solo_numero
select count(*) from public.fallas_vistas where mensaje = 'no abre la sesión';
SQL
)
[ "$N" = "1" ]; marcar $? "un cliente con sesión deja su falla (devolvió «$N»)"

# Una falla de verdad, para probar la lectura.
psqlq << 'SQL' > /dev/null 2>&1
insert into public.fallas_vistas (pantalla, mensaje, clase)
  values ('diario','algo se rompió','rotura');
SQL

# 3 · Un cliente NO lee las fallas. Es el punto de la política de lectura.
N=$(contarComo 'bbbbbbbb-0000-0000-0000-000000000002')
[ "$N" = "0" ]; marcar $? "un cliente NO lee ninguna falla (devolvió «$N», tiene que ser 0)"

# 4 · El equipo sí.
N=$(contarComo 'aaaaaaaa-0000-0000-0000-000000000001')
[ "${N:-0}" -ge 1 ] 2>/dev/null; marcar $? "el equipo las lee (devolvió «$N», tiene que ser 1 o más)"


echo ""
echo "══ la poda ══"

# Lo viejo se va y lo de hoy se queda. Sin esto, un bucle de render deja la
# tabla creciendo para siempre contra la base de Javo.
# `psqlq` pasa su línea por DOS shells —`su postgres -c "psql $*"`— así que un
# `-c "select ..."` pierde las comillas en el camino y el segundo shell se
# ahoga en el primer paréntesis. Por eso acá todo va por heredoc, que llega
# entero.
psqlq << 'SQL' > /dev/null 2>&1
insert into public.fallas_vistas (pantalla, mensaje, creado_en)
  values ('vieja','de hace dos meses', now() - interval '60 days');
select podar_fallas_viejas();
SQL
N=$(psqlq -t << 'SQL' 2>&1 | solo_numero
select count(*) from public.fallas_vistas where mensaje = 'de hace dos meses';
SQL
)
[ "$N" = "0" ]; marcar $? "la de hace dos meses se borró (quedaron «$N»)"
N=$(psqlq -t << 'SQL' 2>&1 | solo_numero
select count(*) from public.fallas_vistas where mensaje = 'algo se rompió';
SQL
)
[ "$N" = "1" ]; marcar $? "la de hoy sigue ahí (quedaron «$N»)"
RESTO

bash "$TMP/corrida.sh"
