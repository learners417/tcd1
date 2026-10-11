#!/usr/bin/env bash
#
# PRUEBA EL SQL CONTRA UN POSTGRESQL DE VERDAD.
#
# Por qué existe: `pglast` valida la SINTAXIS, no los TIPOS. Dio verde a
# `round(percentile_cont(...), 0)`, que revienta en Supabase porque round con
# dos argumentos solo existe para numeric y percentile_cont devuelve double
# precision. Un error así se descubre pegando el SQL en producción — que es
# el peor momento.
#
# Esto levanta una base descartable, arma el andamiaje mínimo que el SQL
# espera encontrar, lo corre ENTERO, lo corre OTRA VEZ (idempotencia) y
# ejecuta cada función para que los tipos se validen de verdad.
#
#   bash scripts/prueba-sql.sh
#
# Necesita PostgreSQL instalado. En un contenedor limpio:
#   apt-get update -qq && apt-get install -y -qq postgresql
set -uo pipefail

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1)
if [ -z "$PGBIN" ]; then
  echo "⚠  PostgreSQL no está instalado — se saltea la prueba del SQL."
  echo "   apt-get install -y postgresql"
  exit 0
fi

DATA=$(mktemp -d)
PORT=5433
SOCK=$(mktemp -d)
chmod 777 "$DATA" "$SOCK"
fallas=0

limpiar() {
  su postgres -c "$PGBIN/pg_ctl -D $DATA stop -m immediate" > /dev/null 2>&1 || true
  rm -rf "$DATA" "$SOCK"
}
trap limpiar EXIT

chown -R postgres "$DATA" "$SOCK" 2>/dev/null || true
su postgres -c "$PGBIN/initdb -D $DATA -A trust -U postgres" > /dev/null 2>&1
su postgres -c "$PGBIN/pg_ctl -D $DATA -l $DATA/log -o '-k $SOCK -p $PORT' start" > /dev/null 2>&1
sleep 2

psqlq() { su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -v ON_ERROR_STOP=1 $*"; }

# ── El andamiaje: lo que el SQL da por existente ───────────────────────────
# No es el esquema real de la app: es lo mínimo para que las referencias
# resuelvan y los tipos se validen. `authenticated` es un rol de Supabase que
# en un PostgreSQL de fábrica no existe.
# Con heredoc y no con -c: pasar el SQL por -c a través de `su` pierde las
# comillas y la sentencia llega partida.
psqlq << 'SQL' > /dev/null 2>&1
create role authenticated;
create role anon;
create role service_role;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
create table profiles (
  id uuid primary key, nombre text, email text, especialidad text,
  rol text default 'cliente', plan text, plan_comercial text,
  acceso_hasta timestamptz, fecha_inicio date,
  modulos_activos text[], agentes_activos text[],
  adn_avatar jsonb, metodo_nombre text, oferta_mid text);
-- La tabla de prueba tiene que parecerse a la real: le faltaban las
-- columnas de archivo y fechas, y por eso una función correcta fallaba acá.
-- La tabla de mensajes: sin ella, las funciones de soporte fallan en la
-- prueba aunque estén bien. La de prueba tiene que parecerse a la real.
create table mensajes (
  id uuid primary key default gen_random_uuid(),
  canal text, emisor_id uuid, receptor_id uuid, contenido text,
  respondido_en timestamptz, tipo text default 'duda',
  created_at timestamptz default now());

-- `notificaciones` NO va en el andamiaje: la crea la migración 20260518, y
-- una tabla de prueba parecida pero sin la columna `tipo` hacía que
-- `create table if not exists` la saltara y después fallara un insert
-- correcto. Lo que crean las migraciones, lo crean las migraciones.

create type admin_tarea_prioridad as enum ('baja','media','alta','urgente');

create table admin_tareas (
  id uuid primary key default gen_random_uuid(), titulo text, descripcion text,
  asignado_a uuid, creado_por uuid, cliente_id uuid, prioridad text,
  fecha_vencimiento date, status text,
  completada_at timestamptz, archivada_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now());
create table user_credits (
  user_id uuid primary key, monthly_quota_remaining int, topup_balance int);
create table credit_transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid, delta int,
  source text, reason text, created_at timestamptz default now());
-- Lo que Supabase trae de fábrica y un PostgreSQL pelado no: sin esto, una
-- migración correcta falla acá y el error no dice nada sobre la migración.
create schema if not exists storage;
create table auth.users (id uuid primary key, email text, created_at timestamptz default now());
create table storage.buckets (
  id text primary key, name text, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text, name text,
  owner uuid, created_at timestamptz default now(), metadata jsonb);
create publication supabase_realtime;

-- Las tablas que las migraciones viejas ya dejaron en la base de Javo. Las
-- nuevas las dan por hechas, y es correcto que lo hagan.
create table hoja_de_ruta (
  id uuid primary key default gen_random_uuid(), user_id uuid, codigo text,
  estado text, hecho_afuera boolean default false, orden int,
  created_at timestamptz default now());
create table programa_videos (
  id uuid primary key default gen_random_uuid(), titulo text, url text,
  grupo text, pilar_id text, orden int);
create table sala_metricas_semana (
  id uuid primary key default gen_random_uuid(), cliente_id uuid not null,
  campana_id uuid, semana_iso text not null, anuncio text,
  objetivo text default 'mensajes', gasto numeric default 0,
  impresiones numeric default 0, alcance int default 0,
  comentarios int default 0, conversaciones int default 0, agendas int default 0,
  llamadas int default 0, ventas int default 0, facturado numeric default 0,
  cargado_por text, created_at timestamptz default now(),
  unique (cliente_id, semana_iso, anuncio));
SQL

marcar() {
  if [ "$1" -eq 0 ]; then echo "✓ $2"; else echo "✗ $2"; fallas=$((fallas + 1)); fi
}

# ── Lo que las migraciones viejas ya dejaron en la base de Javo ─────────────
#
# `profiles` tiene cerca de cien columnas agregadas a lo largo de sesenta
# migraciones, y las nuevas las dan por hechas. Se extraen de las propias
# migraciones en vez de copiarse a mano: con la lista escrita acá, la columna
# que agregue la próxima migración rompería esta prueba en vez de la base.
python3 - << 'PY' > "$DATA/viejo.sql"
import re, glob, os
col = re.compile(r'add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_0-9]+)\s+([A-Za-z0-9_]+(?:\s*\[\s*\])?)', re.I)
tab = re.compile(r'alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([a-z_0-9]+)', re.I)
vistas, salida = set(), []
for f in sorted(glob.glob('supabase/migrations/*.sql')):
    if os.path.basename(f) >= '20261009': continue
    texto = re.sub(r'--.*$', '', open(f, encoding='utf-8').read(), flags=re.M)
    for trozo in texto.split(';'):
        m = tab.search(trozo)
        if not m: continue
        for c in col.finditer(trozo):
            clave = (m.group(1), c.group(1).lower())
            if clave in vistas: continue
            vistas.add(clave)
            salida.append(f'alter table {m.group(1)} add column if not exists {c.group(1)} {c.group(2)};')
print('\n'.join(salida))
PY
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -f $DATA/viejo.sql" > /dev/null 2>&1

# Y las tablas y funciones que Supabase o una migración vieja ya crearon, que
# las nuevas usan sin crearlas.
psqlq << 'SQL' > /dev/null 2>&1
create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references profiles(id) on delete cascade,
  tipo text not null, titulo text not null, descripcion text,
  leida boolean default false, accion_url text,
  created_at timestamptz default now());
-- Como está en la base de Javo ANTES de la migración 20261011: `completado_at`
-- obligatorio y con default, que es justo lo que esa migración afloja para
-- poder distinguir «tildado» de «tiene una nota y sigue pendiente».
create table if not exists cliente_preactivacion_check (
  id uuid primary key default gen_random_uuid(), cliente_id uuid, paso text,
  completado_at timestamptz not null default now(),
  unique (cliente_id, paso));
create or replace function storage.foldername(name text)
  returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
SQL

echo "══ el SQL contra PostgreSQL real ══"

psqlq -f sala-de-mando.sql > "$DATA/r1.txt" 2>&1
marcar $? "corre entero sin errores"
grep -E "^ERROR|^psql.*ERROR" "$DATA/r1.txt" | head -3

psqlq -f sala-de-mando.sql > "$DATA/r2.txt" 2>&1
marcar $? "corre DOS VECES sin errores (es idempotente)"

echo ""
echo "══ las funciones, ejecutadas ══"
psqlq << 'SQL' > "$DATA/f.txt" 2>&1
insert into profiles (id, nombre, rol, plan_comercial)
  values ('11111111-1111-1111-1111-111111111111','Prueba','cliente','completo')
  on conflict do nothing;
insert into user_credits values ('11111111-1111-1111-1111-111111111111', 30, 0)
  on conflict do nothing;
insert into gasto_ia (user_id, usd, modelo, tarea, ms, ok) values
  ('11111111-1111-1111-1111-111111111111', 0.05, 'claude-sonnet-4-6','guion', 3200, true),
  ('11111111-1111-1111-1111-111111111111', 0.02, 'claude-sonnet-4-6','guion', 9100, true),
  ('11111111-1111-1111-1111-111111111111', 0,    'deepseek-v4-pro',  'chat',  1200, false);
select * from panel_ia_por_modelo(7);
select * from panel_ia_fallas(10);
select * from panel_ia_total(30);
select * from gasto_ia_acumulado('11111111-1111-1111-1111-111111111111');
select * from gasto_ia_por_cliente(30);
select * from registrar_uso_ia('11111111-1111-1111-1111-111111111111','mentor',200,400);
select devolver_credito('11111111-1111-1111-1111-111111111111','prueba');
select limpiar_uso_ia();
select limpiar_gasto_ia();
select guardar_semana_cliente('11111111-1111-1111-1111-111111111111','2026-W31',
  '{"precio":1000,"gasto":250,"conversaciones":100,"agendas":35,"ventas":7}'::jsonb);
-- La jornada: abrir, abrir otra vez (no debe duplicar), cerrar, y leer.
select abrir_jornada('11111111-1111-1111-1111-111111111111', array['22222222-2222-2222-2222-222222222222']::uuid[]);
select abrir_jornada('11111111-1111-1111-1111-111111111111', array['33333333-3333-3333-3333-333333333333']::uuid[]);
select cerrar_jornada('11111111-1111-1111-1111-111111111111',
  array['33333333-3333-3333-3333-333333333333']::uuid[], 'no le llega el DM automatico', null);
select * from jornadas_recientes(7);
-- La carga compartida: guardar, corregir, y el webhook que SUMA sin pisar.
select guardar_campo('11111111-1111-1111-1111-111111111111','2026-W31','gasto',140,'lupe','Lupe');
select guardar_campo('11111111-1111-1111-1111-111111111111','2026-W31','gasto',160,'lupe','Lupe');
select sumar_campo('11111111-1111-1111-1111-111111111111','2026-W31','agendas',1,'webhook');
select sumar_campo('11111111-1111-1111-1111-111111111111','2026-W31','agendas',1,'webhook');
select sumar_campo('11111111-1111-1111-1111-111111111111','2026-W31','agendas',1,'webhook');
select * from carga_de_semana('11111111-1111-1111-1111-111111111111','2026-W31');
-- El soporte: un mensaje entra sin responder y se marca al contestarlo.
insert into mensajes (canal, emisor_id, contenido)
  values ('humano','22222222-2222-2222-2222-222222222222','no me llega el DM');
select marcar_respondido('22222222-2222-2222-2222-222222222222');
SQL
marcar $? "las 17 funciones se ejecutan sin errores de tipo"
grep -E "^ERROR|^psql.*ERROR" "$DATA/f.txt" | head -3

# Guardar dos veces la misma semana no puede duplicar: el viernes se carga,
# se corrige y se vuelve a cargar.
psqlq << 'SQL' > /dev/null 2>&1
select guardar_semana_cliente('11111111-1111-1111-1111-111111111111','2026-W31',
  '{"gasto":300}'::jsonb);
SQL
FILAS=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select count(*) from sala_metricas_semana where anuncio is null;
SQL
)
JORN=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select count(*) from jornadas;
SQL
)
[ "$JORN" = "1" ]
marcar $? "abrir el día dos veces no duplica la jornada (filas: $JORN)"
GASTO=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select valor from carga_semanal where campo='gasto';
SQL
)
[ "$GASTO" = "160" ]
marcar $? "corregir un campo reemplaza, no duplica (gasto: $GASTO)"
AGEN=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select valor from carga_semanal where campo='agendas';
SQL
)
[ "$AGEN" = "3" ]
marcar $? "tres agendas por webhook SUMAN, no se pisan (agendas: $AGEN)"
TRABA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select coalesce(traba,'-') from jornadas limit 1;
SQL
)
[ "$TRABA" != "-" ]
marcar $? "la traba queda guardada y la puede leer todo el equipo"
[ "$FILAS" = "1" ]
marcar $? "guardar la misma semana dos veces reemplaza, no duplica (filas: $FILAS)"

# ── LAS MIGRACIONES, EN ORDEN ──────────────────────────────────────────────
#
# Por qué están acá y no en su propia prueba: `sala-de-mando.sql` vive en la
# raíz y no en supabase/migrations, así que nada chequeaba los choques entre
# los dos. De ahí salieron tres de los cuatro errores que impedían correr las
# migraciones de arriba hacia abajo —una función que cambia de tipo de
# retorno, otra que pierde un default— y ninguno se veía mirando el archivo
# nuevo solo. Se ven cuando corren todas juntas, que es como las corre Javo.
echo ""
echo "══ las migraciones, de arriba hacia abajo ══"

# Las que hay que correr ahora: desde 20261009. Las anteriores ya están
# aplicadas en la base de Javo, y reaplicarlas acá contra un andamiaje que no
# es el esquema real da errores que no dicen nada. Lo que se prueba es lo que
# él va a correr.
NUEVAS=$(ls supabase/migrations/*.sql | sort | awk -F/ '$NF >= "20261009"')
CUANTAS=$(echo "$NUEVAS" | wc -l)

corrida() {
  local salida="$1"; local malas=0
  : > "$salida"
  for m in $NUEVAS; do
    if ! psqlq -f "$m" >> "$salida" 2>&1; then
      echo "  ✗ $(basename "$m")"
      grep -E "^ERROR|^psql.*ERROR" "$salida" | tail -2 | sed 's/^/      /'
      malas=$((malas + 1))
      : > "$salida"
    fi
  done
  return "$malas"
}

corrida "$DATA/m1.txt"
marcar $? "las $CUANTAS migraciones nuevas corren en orden, sin errores"

corrida "$DATA/m2.txt"
marcar $? "y corren DOS VECES (son idempotentes, que es como se reaplican)"

echo ""
echo "══ el candado de los avisos ══"
#
# `crear_notificacion` era SECURITY DEFINER sin mirar quién llamaba: cualquier
# persona con cuenta podía escribirle a cualquier otra un aviso con el título
# y el enlace que quisiera. Esto prueba las cuatro combinaciones.
psqlq << 'SQL' > "$DATA/n.txt" 2>&1
insert into profiles (id, nombre, rol) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Cliente A','cliente'),
  ('aaaaaaaa-0000-0000-0000-000000000002','Cliente B','cliente'),
  ('bbbbbbbb-0000-0000-0000-000000000001','Lupe','admin')
  on conflict (id) do update set rol = excluded.rol;
SQL
marcar $? "se pueden crear las tres cuentas de prueba"

comoSi() {  # comoSi <uid> <sql> → corre con auth.uid() devolviendo ese uid
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -v ON_ERROR_STOP=1" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$1'::uuid \$\$;
$2
SQL
}

comoSi 'aaaaaaaa-0000-0000-0000-000000000001' \
  "select crear_notificacion('aaaaaaaa-0000-0000-0000-000000000002','admin','Lupe te dejó una nota','abrí esto','/x','');"
[ $? -ne 0 ]
marcar $? "un cliente NO puede escribirle a otro cliente"

comoSi 'aaaaaaaa-0000-0000-0000-000000000001' \
  "select crear_notificacion('aaaaaaaa-0000-0000-0000-000000000001','sistema','Mi propio aviso',null,null,null);"
marcar $? "pero sí puede escribirse a sí mismo"

comoSi 'aaaaaaaa-0000-0000-0000-000000000001' \
  "select crear_notificacion('bbbbbbbb-0000-0000-0000-000000000001','mensaje','Algo no funciona',null,null,null);"
marcar $? "y puede avisarle al equipo que algo se rompió"

comoSi 'bbbbbbbb-0000-0000-0000-000000000001' \
  "select crear_notificacion('aaaaaaaa-0000-0000-0000-000000000002','sistema','Faltan tus números','dos minutos','/campanas','no_cargo');"
marcar $? "el equipo le escribe a cualquiera"

echo ""
echo "══ el historial que decide si el aviso ya no alcanza ══"
comoSi 'bbbbbbbb-0000-0000-0000-000000000001' \
  "select crear_notificacion('aaaaaaaa-0000-0000-0000-000000000002','sistema','Faltan tus números','dos minutos','/campanas','no_cargo');"
VECES=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select veces from historial_avisos(array['aaaaaaaa-0000-0000-0000-000000000002']::uuid[]) where clave='no_cargo';
SQL
)
[ "$VECES" = "2" ]
marcar $? "cuenta los dos avisos que salieron (veces: $VECES)"

SEM=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select ultima_semana from historial_avisos(array['aaaaaaaa-0000-0000-0000-000000000002']::uuid[]) where clave='no_cargo';
SQL
)
echo "$SEM" | grep -qE '^[0-9]{4}-W[0-9]{2}$'
marcar $? "y la semana ISO viene en el formato que compara el frente ($SEM)"

comoSi 'aaaaaaaa-0000-0000-0000-000000000001' \
  "select count(*) from historial_avisos(array['aaaaaaaa-0000-0000-0000-000000000002']::uuid[]);"
FUERA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select count(*) from historial_avisos(array['aaaaaaaa-0000-0000-0000-000000000002']::uuid[]);
SQL
)
[ "$FUERA" = "0" ]
marcar $? "un cliente no puede leer el historial de otro (filas: $FUERA)"

echo ""
echo "══ las impresiones, que no se pedían ══"
#
# El costo de aparecer y la frecuencia se calculan con las impresiones, y la
# columna no existía. La frecuencia daba cero, y cero cae en la zona sana: la
# app mostraba en verde un número que nunca midió.
psqlq << 'SQL' > /dev/null 2>&1
select guardar_semana_cliente('11111111-1111-1111-1111-111111111111','2026-W42',
  '{"gasto":300,"impresiones":48000,"alcance":12000,"conversaciones":60}'::jsonb);
SQL
marcar $? "guardar la semana acepta las impresiones"
IMP=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select impresiones from sala_metricas_semana where semana_iso = '2026-W42';
SQL
)
[ "$IMP" = "48000" ]
marcar $? "y llegan a la tabla en vez de perderse en silencio (impresiones: $IMP)"

echo ""
if [ "$fallas" -eq 0 ]; then echo "✓ TODO EN VERDE"; else echo "✗ $fallas FALLAS"; fi
exit "$fallas"
