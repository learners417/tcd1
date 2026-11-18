#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  ¿QUIÉN PUEDE EJECUTAR LAS FUNCIONES QUE PASAN POR ENCIMA DE LA RLS?       ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# POR QUÉ EXISTE. El 17 de noviembre a las 19:30 quedó medido que la RLS de
# este repo está bien: las 60 tablas encendidas, las 210 políticas acotadas,
# ejercidas con dos sesiones distintas. Y cuatro horas después quedó medido
# que eso no alcanza, porque hay una puerta que la rodea entera:
#
#     UNA FUNCIÓN `SECURITY DEFINER` CORRE CON LOS PERMISOS DE SU DUEÑO,
#     ASÍ QUE NO LE APLICA LA RLS. Y EL PERMISO DE FÁBRICA DE PostgreSQL
#     ES `EXECUTE` PARA `PUBLIC`: nadie tiene que concederlo. PostgREST
#     publica toda función de `public` como `/rest/v1/rpc/<nombre>`, así
#     que con la llave publicable —la que viaja en el bundle— cualquiera
#     la llama.
#
# Medido contra un PostgreSQL de verdad con el esquema del repo: de las 51
# funciones SECURITY DEFINER de `public`, **49 las podía ejecutar
# `authenticated` y 42 `anon`**, y 25 no preguntaban quién llamaba. Probado
# ejecutando, sentado en la silla de un cliente cualquiera:
#
#   · `carga_semanal` le negó la fila (0 filas: la RLS cumplió) y
#     `carga_de_semana('<otro cliente>')` se la entregó entera. También al
#     rol `anon`, sin ninguna sesión.
#   · `devolver_credito('<otro>','robo')` cinco veces dejó el saldo comprado
#     de ese otro en 5; una sexta llamada SIN SESIÓN lo dejó en 6, con sus
#     seis asientos en `credit_transactions`.
#   · `guardar_campo` dejó a un cliente pisar el número que el equipo había
#     cargado en la semana de otro.
#
# QUÉ MIDE, y las dos mitades no se pueden separar:
#
#   1 · EL CATÁLOGO. Toda función SECURITY DEFINER de `public` que `anon` o
#       `authenticated` puedan ejecutar tiene que preguntar quién llama, o
#       estar en el PERDÓN con su motivo escrito. Leer el `.sql` no alcanza:
#       lo que decide es el permiso REAL, que nadie escribió nunca.
#   2 · LA SILLA. Las afirmaciones del catálogo se satisfacen escribiendo la
#       palabra `auth.uid()` en cualquier parte del cuerpo. Así que además se
#       SIENTA en la silla de un cliente, y en la de nadie (`anon`), y pide lo
#       de otro. Y se sienta en la del equipo y en la del service_role, para
#       que el arreglo no sea «cerrarlo todo»: lo que la app necesita sigue
#       andando.
#
# El andamiaje NO se copia: se reusa el de `prueba-sql.sh`, cortado en su
# marcador, igual que hace `prueba-puesta-al-dia.sh`.
#
#   bash scripts/prueba-las-funciones-preguntan-quien-llama.sh
#
# Sin PostgreSQL local sale en 0 diciendo que no puede: no vale frenar el
# paquete por una herramienta que falta en esta máquina.

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
psqlq << 'SQL' > /dev/null 2>&1
create table if not exists metricas_v2 (
  id uuid primary key default gen_random_uuid(), user_id uuid, semana text,
  met_periodo_tipo text, met_fecha_inicio date, met_fecha_fin date,
  met_ads_plataforma text, met_dms_organicos int, met_posts_feed_ig int,
  met_posts_reels_ig int, met_stories_ig int, met_posts_tiktok int,
  met_posts_shorts int, met_posts_facebook int, met_posts_linkedin int,
  met_roas numeric, met_proyeccion_mes numeric, created_at timestamptz default now());
SQL

# ── La base, armada en el orden real del repo ──────────────────────────────
psqlq -f sala-de-mando.sql > "$DATA/sdm.txt" 2>&1
marcar $? "sala-de-mando.sql corre entero"
grep -E "^ERROR" "$DATA/sdm.txt" | head -3

cp poner-al-dia-la-base.sql "$DATA/puesta.sql"; chmod 644 "$DATA/puesta.sql"
psqlq -f "$DATA/puesta.sql" > "$DATA/p1.txt" 2>&1
marcar $? "poner-al-dia-la-base.sql corre entero"
grep -E "^ERROR" "$DATA/p1.txt" | head -3

_mal=0
for _m in $(ls supabase/migrations/*.sql | sort | awk -F/ '$NF >= "20261009"'); do
  cp "$_m" "$DATA/m.sql"; chmod 644 "$DATA/m.sql"
  psqlq -f "$DATA/m.sql" > "$DATA/m.txt" 2>&1
  if grep -qE "^ERROR" "$DATA/m.txt"; then
    echo "   ✗ $_m"; grep -E "^ERROR" "$DATA/m.txt" | head -2; _mal=$((_mal + 1))
  fi
done
[ "$_mal" -eq 0 ]; marcar $? "las migraciones nuevas corren sobre esa base"

# ── auth.uid() de verdad, y tres personas ──────────────────────────────────
#
# El andamiaje de `prueba-sql.sh` define `auth.uid()` como null fijo: con eso
# NINGUNA guarda puede dar verdadero y toda prueba de permiso sale «no puede»
# por el motivo equivocado. Acá lee quién está actuando, igual que PostgREST.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << 'SQL' > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
-- Y `auth.role()`: el andamiaje de `prueba-sql.sh` la deja clavada en
-- 'authenticated', con lo cual el service_role no se podía representar y la
-- guarda se medía contra una silla que no existe.
create or replace function auth.role() returns text language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''),
                     current_setting('role', true)) $$;
grant usage on schema auth to authenticated, anon, service_role;
grant execute on function auth.uid() to authenticated, anon, service_role;
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001','javo@ejemplo.com'),
  ('aaaaaaaa-0000-0000-0000-000000000002','cliente@ejemplo.com'),
  ('aaaaaaaa-0000-0000-0000-000000000003','otro@ejemplo.com') on conflict do nothing;
insert into profiles (id, nombre, rol) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Javo','admin'),
  ('aaaaaaaa-0000-0000-0000-000000000002','Cliente','cliente'),
  ('aaaaaaaa-0000-0000-0000-000000000003','Otro','cliente') on conflict do nothing;
SQL

# Y que los tres ESTÉN: sobre una tabla vacía, «no pudo leer lo de otro» sale
# verde por la razón equivocada. Es la trampa que ya se comió el arnés de la
# RLS el 17 de noviembre, contando filas en vez de dueños.
_cuantos=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A -c \"select count(*) from profiles where id in ('aaaaaaaa-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000003')\"" 2>&1)
[ "$_cuantos" = "3" ]; marcar $? "los tres perfiles de prueba entraron (si no, todo sale verde de mentira)"

# ── La siembra: datos que son DE OTRO, puestos por el dueño ────────────────
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << 'SQL' > /dev/null 2>&1
insert into user_credits (user_id) values ('aaaaaaaa-0000-0000-0000-000000000003')
  on conflict do nothing;
insert into carga_semanal (cliente_id, semana_iso, campo, valor, por_quien)
  values ('aaaaaaaa-0000-0000-0000-000000000003','2026-W47','ventas',999,'equipo')
  on conflict (cliente_id, semana_iso, campo) do update set valor = 999;
insert into sesion_respuestas (cliente_id, meta_codigo, estado)
  values ('aaaaaaaa-0000-0000-0000-000000000003','P0.1','{"secreto":"de otro"}'::jsonb)
  on conflict (cliente_id, meta_codigo) do update set estado = '{"secreto":"de otro"}'::jsonb;
-- Y UNA FILA DEL PROPIO CLIENTE. Sin ella, «lo suyo sí lo lee» mide una tabla
-- vacía y da cero, que es el mismo cero de «se lo cerré todo»: la lente no
-- podría distinguir un arreglo de un portazo.
insert into sesion_respuestas (cliente_id, meta_codigo, estado)
  values ('aaaaaaaa-0000-0000-0000-000000000002','P0.1','{"mio":true}'::jsonb)
  on conflict (cliente_id, meta_codigo) do update set estado = '{"mio":true}'::jsonb;
SQL
_sembrado=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A -c \"select (select count(*) from carga_semanal) + (select count(*) from sesion_respuestas) + (select count(*) from user_credits where user_id='aaaaaaaa-0000-0000-0000-000000000003')\"" 2>&1)
[ "$_sembrado" -ge 4 ] 2>/dev/null; marcar $? "la siembra está: $_sembrado filas (una semana y una sesión de OTRO, y una del cliente)"

CL=aaaaaaaa-0000-0000-0000-000000000002   # un cliente cualquiera
OT=aaaaaaaa-0000-0000-0000-000000000003   # otro cliente, el dueño de los datos
EQ=aaaaaaaa-0000-0000-0000-000000000001   # el equipo

dueno() { su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A -c \"$1\"" 2>&1 | tr -d '\n'; }
como()  { # $1 rol · $2 sub · $3 sql — queda COMMITEADO, para medir lo escrito
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A" 2>&1 << SQL | grep -vE '^(BEGIN|SET|COMMIT|ROLLBACK)$' | tr '\n' ' '
begin; set local role $1; set local "request.jwt.claim.sub" = '$2';
$3
commit;
SQL
}

echo ""
echo "══ 1 · EL CATÁLOGO: toda SECURITY DEFINER alcanzable pregunta quién llama ══"
#
# PERDÓN: las que pueden quedar abiertas, con el motivo escrito. No es una
# lista de nombres para tapar un rojo: es una lista de DECISIONES, y la lente
# falla si una de ellas deja de existir (así nadie la poda para ganar verde).
su postgres -c "psql -h $SOCK -p $PORT -U postgres -t -A -F '|'" << 'SQL' > "$DATA/cat.txt" 2>&1
with perdon(nombre, motivo) as (values
  -- Son LA pregunta: contestan si el que llama es del equipo. Sin ellas
  -- ninguna otra guarda puede existir, y `poner-al-dia-la-base.sql` concede
  -- `es_del_equipo` y `tiene_acompanamiento` a `authenticated` a propósito.
  ('el_que_llama_es_del_equipo','es la pregunta misma'),
  ('solo_el_equipo','es la pregunta misma'),
  ('es_del_equipo','solo dice si alguien es del equipo'),
  ('ids_del_equipo','solo lista al equipo, y lo usan las politicas'),
  ('tiene_acompanamiento','solo dice si un cliente tiene acompanamiento')
  -- El PERDÓN nombra SOLO funciones que esta base tiene de verdad: una
  -- línea sobre una función que no está es una línea que nadie puede
  -- revisar, y la lente la marca abajo como «perdón sin función».
  -- Catálogos y utilidades sin dueño: no hay «lo de otro» que filtrar.
), vivas as (
  select p.oid, p.proname,
         p.prosrc ~* '(auth\.uid|el_que_llama_es_del_equipo|solo_el_equipo|es_del_equipo|ids_del_equipo|NOT_AUTHORIZED|current_user\s*=)' as pregunta
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.prosecdef
     -- Las de disparador no se llaman por PostgREST: las dispara la tabla.
     and p.prorettype <> 'trigger'::regtype
     and (has_function_privilege('anon', p.oid, 'EXECUTE')
          or has_function_privilege('authenticated', p.oid, 'EXECUTE'))
)
select 'ABIERTA|' || v.proname
  from vivas v
 where not v.pregunta
   and v.proname not in (select nombre from perdon)
union all
select 'PERDON-MUERTO|' || p.nombre
  from perdon p
 where not exists (select 1 from pg_proc q join pg_namespace m on m.oid = q.pronamespace
                    where m.nspname = 'public' and q.proname = p.nombre)
union all
select 'CUENTA|' || count(*) from vivas;
SQL
_abiertas=$(grep -c '^ABIERTA|' "$DATA/cat.txt")
_cuenta=$(grep '^CUENTA|' "$DATA/cat.txt" | cut -d'|' -f2)
[ "$_abiertas" = "0" ]; marcar $? "las $_cuenta SECURITY DEFINER alcanzables preguntan quién llama"
grep '^ABIERTA|' "$DATA/cat.txt" | sed 's/^ABIERTA|/   ✗ no pregunta: /' | head -12
_muertos=$(grep -c '^PERDON-MUERTO|' "$DATA/cat.txt")
[ "$_muertos" = "0" ]; marcar $? "ninguna línea del PERDÓN sobra (nadie lo poda para ganar verde)"
grep '^PERDON-MUERTO|' "$DATA/cat.txt" | sed 's/^PERDON-MUERTO|/   ✗ perdón sin función: /' | head -8

echo ""
echo "══ 2 · LA SILLA: un cliente cualquiera pidiendo lo de otro ══"

# LA PLATA. No se mide por el error: se mide por el SALDO.
_antes=$(dueno "select topup_balance from user_credits where user_id='$OT'")
como authenticated "$CL" "select devolver_credito('$OT','robo') from generate_series(1,5);" > /dev/null 2>&1
como anon "" "select devolver_credito('$OT','sin sesion');" > /dev/null 2>&1
_despues=$(dueno "select topup_balance from user_credits where user_id='$OT'")
[ "$_antes" = "$_despues" ]; marcar $? "el saldo comprado de otro no se mueve ni con sesión ni sin ella ($_antes → $_despues)"

_asientos=$(dueno "select count(*) from credit_transactions where user_id='$OT' and source='refund'")
[ "$_asientos" = "0" ]; marcar $? "no quedó ni un asiento de devolución inventado ($_asientos)"

_g=$(como authenticated "$CL" "select consume_credit('$OT');")
case "$_g" in *permission*|*permiso*|*denied*|*no\ existe*|*does\ not\ exist*) true;; *) false;; esac
marcar $? "gastar el crédito de otro no se puede: $(echo "$_g" | cut -c1-60)"

# LOS DATOS DE OTRO. La RLS ya le dice no a la tabla; la función tiene que
# decir lo mismo, o la RLS no sirvió para nada.
_tabla=$(como authenticated "$CL" "select count(*) from carga_semanal where cliente_id='$OT';")
[ "$(echo $_tabla)" = "0" ]; marcar $? "la RLS le niega la tabla carga_semanal (control: $_tabla)"
_fn=$(como authenticated "$CL" "select count(*) from carga_de_semana('$OT','2026-W47');")
[ "$(echo $_fn)" = "0" ]; marcar $? "y carga_de_semana tampoco se la entrega ($_fn)"
_fna=$(como anon "" "select count(*) from carga_de_semana('$OT','2026-W47');")
case "$(echo $_fna)" in 0|*permission*|*denied*) true;; *) false;; esac
marcar $? "ni a nadie, sin sesión ($(echo "$_fna" | cut -c1-40))"

_r=$(como authenticated "$CL" "select count(*) from respuestas_de('$OT');")
[ "$(echo $_r)" = "0" ]; marcar $? "las respuestas de sesión de otro no se leen ($_r)"
_rp=$(como authenticated "$CL" "select count(*) from respuestas_de('$CL');")
[ "$(echo $_rp)" = "1" ]; marcar $? "y las PROPIAS sí las lee ($_rp) — si esto da 0 el arreglo fue un portazo"

# ESCRIBIR SOBRE LO DE OTRO.
como authenticated "$CL" "select guardar_campo('$OT','2026-W47','ventas',1,'yo');" > /dev/null 2>&1
_valor=$(dueno "select valor::int from carga_semanal where cliente_id='$OT' and campo='ventas' and semana_iso='2026-W47'")
[ "$_valor" = "999" ]; marcar $? "el número que cargó el equipo sigue siendo el del equipo ($_valor)"

como authenticated "$CL" "select guardar_respuestas('$OT','P0.1','{\"pisado\":true}'::jsonb);" > /dev/null 2>&1
_pis=$(dueno "select estado::text from sesion_respuestas where cliente_id='$OT' and meta_codigo='P0.1'")
case "$_pis" in *pisado*) false;; *) true;; esac
marcar $? "lo que escribió otro en su sesión no se pisa"

_cr=$(como authenticated "$CL" "select ensure_user_credits_row('$OT');")
case "$_cr" in *Cada\ uno*|*permission*|*denied*) true;; *) false;; esac
marcar $? "la fila de créditos de otro no se devuelve: $(echo "$_cr" | cut -c1-50)"

_hdr=$(como authenticated "$CL" "select count(*) from get_user_hoja_de_ruta('$OT');")
[ "$(echo $_hdr)" = "0" ]; marcar $? "la hoja de ruta de otro no se lee por RPC ($_hdr)"

# LA SALA DE MANDO ENTERA, sin ser del equipo.
_sala=$(como authenticated "$CL" "select count(*) from gasto_ia_por_cliente(30);")
[ "$(echo $_sala)" = "0" ]; marcar $? "el gasto de IA por cliente no se lista sin ser del equipo ($_sala)"
_lista=$(como authenticated "$CL" "select count(*) from mi_lista_de_hoy('$EQ');")
[ "$(echo $_lista)" = "0" ]; marcar $? "la lista de hoy de otra persona no se lee ($_lista)"
for _esc in "select abrir_jornada('$EQ', '{}'::uuid[]);" "select crear_tarea_del_sistema('t','d','$EQ',null,'manual',null);"; do
  _e=$(como authenticated "$CL" "$_esc")
  case "$_e" in *Solo\ el\ equipo*|*permission*|*denied*) true;; *) false;; esac
  marcar $? "   grita: $(echo "$_esc" | cut -c8-30)… → $(echo "$_e" | cut -c1-40)"
done

echo ""
echo "══ 3 · QUE EL ARREGLO NO SEA «CERRARLO TODO» ══"
#
# Una guarda que cierra de más rompe la app sin que nadie lo note hasta que un
# cliente escribe. Así que lo mismo, desde la silla que SÍ corresponde.
_eq1=$(como authenticated "$EQ" "select count(*) from carga_de_semana('$OT','2026-W47');")
[ "$(echo $_eq1)" = "1" ]; marcar $? "el equipo sí lee la semana de un cliente ($_eq1)"
como authenticated "$EQ" "select guardar_campo('$OT','2026-W47','ventas',1234,'equipo');" > /dev/null 2>&1
_eq2=$(dueno "select valor::int from carga_semanal where cliente_id='$OT' and campo='ventas' and semana_iso='2026-W47'")
[ "$_eq2" = "1234" ]; marcar $? "el equipo sí escribe el número de la semana ($_eq2)"
_eq3=$(como authenticated "$EQ" "select count(*) from gasto_ia_por_cliente(30);")
marcar 0 "   (el panel de IA del equipo responde: $_eq3 filas)"
_eq4=$(como authenticated "$EQ" "select abrir_jornada('$EQ', '{}'::uuid[]);")
case "$_eq4" in *Solo\ el\ equipo*) false;; *) true;; esac
marcar $? "el equipo sí abre su jornada"

# Y el service_role: la API de la casa no tiene sesión de navegador, así que
# `auth.uid()` le da null. Si la guarda lo mide con auth.uid() a secas, la
# devolución de un crédito por una imagen que falló deja de funcionar.
_sr_antes=$(dueno "select topup_balance from user_credits where user_id='$OT'")
_sr=$(como service_role "" "select devolver_credito('$OT','la imagen fallo');")
_sr_desp=$(dueno "select topup_balance from user_credits where user_id='$OT'")
[ "$_sr_desp" -gt "$_sr_antes" ] 2>/dev/null
marcar $? "el service_role sí devuelve el crédito ($_sr_antes → $_sr_desp)"
_srb=$(como service_role "" "select count(*) from carga_de_semana('$OT','2026-W47');")
[ "$(echo $_srb)" = "1" ]; marcar $? "y el service_role sigue leyendo lo que la API necesita ($_srb)"

echo ""
if [ "$fallas" -eq 0 ]; then echo "SIN FALLAS"; else echo "FALLAS: $fallas"; fi
exit "$fallas"

RESTO

bash "$TMP/corrida.sh"
