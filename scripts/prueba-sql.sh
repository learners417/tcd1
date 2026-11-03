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
-- LOS PERMISOS QUE SUPABASE DA POR DEFECTO.
--
-- En Supabase, cada tabla nueva de `public` nace con permisos para
-- `authenticated`: lo que decide qué puede hacer un cliente es la RLS, no el
-- permiso. En un PostgreSQL de fábrica la tabla nace sin permisos, así que
-- una prueba de RLS daba verde porque faltaba el permiso, no porque la
-- política funcionara. Dos razones distintas para el mismo resultado.
grant usage on schema public to authenticated, anon, service_role;
alter default privileges in schema public
  grant all on tables to authenticated, anon, service_role;
alter default privileges in schema public
  grant all on sequences to authenticated, anon, service_role;
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
-- `hoja_de_ruta` con las columnas DE VERDAD.
--
-- Estaba declarada `(user_id, codigo, estado)`, que no existen en ninguna
-- parte: la tabla real es `(usuario_id, pilar_numero, meta_codigo,
-- completada, fecha_completada)` —así la crean las migraciones de abril y
-- mayo, y así la leen las catorce pantallas que la consultan.
--
-- O sea que una función nueva que la tocara bien fallaba acá, y una que la
-- tocara mal también podía pasar. Las dos respuestas sin valor.
create table hoja_de_ruta (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid, pilar_numero int, meta_codigo text,
  completada boolean default false, fecha_completada date,
  output_generado jsonb, es_estrella boolean default false,
  hecho_afuera boolean default false, marcado_por text, marcado_el timestamptz,
  created_at timestamptz default now(),
  unique (usuario_id, pilar_numero, meta_codigo));
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
#
# Y SE LEE TODO EL SQL DEL REPO, no solo `supabase/migrations/`. La columna
# `pais` la agrega `pais-migration.sql`, en la raíz: mirando solo las
# migraciones, el andamiaje no la tenía, y la escritura del onboarding
# —especialidad y país— fallaba en la prueba estando bien en la app.
python3 - << 'PY' > "$DATA/viejo.sql"
import re, glob, os
col = re.compile(r'add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_0-9]+)\s+([A-Za-z0-9_]+(?:\s*\[\s*\])?)', re.I)
tab = re.compile(r'alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([a-z_0-9]+)', re.I)
vistas, salida = set(), []
for f in sorted(glob.glob('supabase/migrations/*.sql')) + sorted(glob.glob('*.sql')):
    # El corte por fecha vale SOLO para las migraciones: los archivos de la
    # raíz empiezan con letra, y en una comparación de texto cualquier letra
    # es «mayor» que un dígito. Así que este filtro los descartaba todos, y
    # la columna `pais` —que crea `pais-migration.sql`— nunca entraba.
    if f.startswith('supabase/migrations/') and os.path.basename(f) >= '20261009':
        continue
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

# LA RLS DE VERDAD DE `profiles`.
#
# La activa `fix-supabase.sql`, en la raíz, y esta prueba no lo cargaba. O sea
# que en la base de prueba `profiles` no tenía RLS: cualquier afirmación de
# «un cliente no lee la ficha de otro» salía verde porque faltaba la RLS, no
# porque la política funcionara. Se extraen de ese archivo, no se copian.
python3 - << 'PY' > "$DATA/rls.sql"
import re
t = open('fix-supabase.sql', encoding='utf-8').read()
# Solo lo que toca `profiles`: activar RLS y sus políticas.
salida = ['alter table profiles enable row level security;']
for m in re.finditer(r'(CREATE POLICY[\s\S]*?;)', t, re.I):
    if re.search(r'\bON\s+(public\.)?profiles\b', m.group(1), re.I):
        salida.append(m.group(1))
print('\n'.join(salida))
PY
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -f $DATA/rls.sql" > /dev/null 2>&1

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
-- En `auth.users` TAMBIÉN, no solo en `profiles`. En la base de Javo cada
-- ficha cuelga de una cuenta, y varias tablas apuntan ahí con una clave
-- foránea. Acá estaban solo en `profiles`, así que un insert correcto en una
-- tabla nueva fallaba por una cuenta que en producción sí existe.
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001','a@prueba'),
  ('aaaaaaaa-0000-0000-0000-000000000002','b@prueba'),
  ('bbbbbbbb-0000-0000-0000-000000000001','lupe@prueba')
  on conflict (id) do nothing;
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
echo "══ sus números son suyos ══"
#
# La tabla de la semana solo la podía leer el equipo, así que el cliente no
# veía los números de su propio negocio. Ahora cada uno carga los suyos, y
# nadie puede escribirle los números a otro.
comoSi 'aaaaaaaa-0000-0000-0000-000000000001' \
  "select guardar_semana_cliente('aaaaaaaa-0000-0000-0000-000000000002','2026-W42','{\"gasto\":1}'::jsonb);"
[ $? -ne 0 ]
marcar $? "un cliente NO puede cargarle los números a otro"

comoSi 'aaaaaaaa-0000-0000-0000-000000000001' \
  "select guardar_semana_cliente('aaaaaaaa-0000-0000-0000-000000000001','2026-W42','{\"gasto\":120}'::jsonb);"
marcar $? "pero sí los suyos"

echo ""
echo "══ las impresiones, que no se pedían ══"
#
# El costo de aparecer y la frecuencia se calculan con las impresiones, y la
# columna no existía. La frecuencia daba cero, y cero cae en la zona sana: la
# app mostraba en verde un número que nunca midió.
comoSi 'bbbbbbbb-0000-0000-0000-000000000001' \
  "select guardar_semana_cliente('11111111-1111-1111-1111-111111111111','2026-W42','{\"gasto\":300,\"impresiones\":48000,\"alcance\":12000,\"conversaciones\":60}'::jsonb);"
marcar $? "el equipo carga la semana de cualquiera, con las impresiones"
IMP=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select impresiones from sala_metricas_semana
 where semana_iso = '2026-W42'
   and cliente_id = '11111111-1111-1111-1111-111111111111';
SQL
)
[ "$IMP" = "48000" ]
marcar $? "y llegan a la tabla en vez de perderse en silencio (impresiones: $IMP)"

echo ""
echo "══ el escalón, marcado por una persona ══"
#
# El tope del Camino corre con el escalón MARCADO y no con el default. La
# columna es `not null default 'base'`, así que si el tope mirara el valor
# suelto, todos los clientes de hoy —que están en base porque nadie los
# marcó— perderían los días 13 al 90 de un día para el otro.
#
# Quien sella la fecha es `marcar_servicio`, que ya existía: pone el escalón,
# quién lo marcó y cuándo. Lo que hay que probar es que la sella SIEMPRE,
# incluso cuando el escalón elegido es el mismo que el default — que es
# justamente el caso del que paga la primera etapa.
ANTES=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select coalesce(servicio_marcado_el::text, 'SIN MARCAR') from profiles
 where id = 'aaaaaaaa-0000-0000-0000-000000000001';
SQL
)
[ "$ANTES" = "SIN MARCAR" ]
marcar $? "una ficha que nadie marcó queda sin marcar ($ANTES)"

comoSi 'bbbbbbbb-0000-0000-0000-000000000001' \
  "select marcar_servicio('aaaaaaaa-0000-0000-0000-000000000001','base',null);"
marcar $? "el equipo la marca en el escalón más bajo"

MARCA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select case when servicio_marcado_el is null then 'SIN MARCAR' else 'marcado' end
  from profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001';
SQL
)
[ "$MARCA" = "marcado" ]
marcar $? "y queda marcada aunque el escalón elegido sea el mismo que el default ($MARCA)"

QUIEN=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select coalesce(servicio_marcado_por::text, 'NADIE') from profiles
 where id = 'aaaaaaaa-0000-0000-0000-000000000001';
SQL
)
[ "$QUIEN" = "bbbbbbbb-0000-0000-0000-000000000001" ]
marcar $? "con el nombre de quién la marcó: es una decisión de plata ($QUIEN)"

comoSi 'aaaaaaaa-0000-0000-0000-000000000002' \
  "select marcar_servicio('aaaaaaaa-0000-0000-0000-000000000001','instalacion',null);"
[ $? -ne 0 ]
marcar $? "y un cliente NO puede marcarse a sí mismo la instalación de \$5.000"

echo ""
echo "══ el primer día de un cliente nuevo, paso por paso ══"
#
# No mira funciones sueltas: hace la secuencia completa que hace un cliente
# recién creado, con el ROL con el que entra la app y con todos los
# disparadores y políticas puestos. Es donde vivía el bug del 18 de octubre:
# dos migraciones correctas por separado que juntas se bloquean.
NUEVO='aaaaaaaa-0000-0000-0000-000000000009'
psqlq << SQL > /dev/null 2>&1
insert into auth.users (id, email) values ('$NUEVO','nuevo@prueba') on conflict do nothing;
insert into profiles (id, nombre, rol, fecha_inicio, onboarding_completed)
  values ('$NUEVO','Cliente Nuevo','cliente', current_date, false)
  on conflict (id) do update set onboarding_completed = false;
SQL
marcar $? "la ficha del cliente nuevo entra con el onboarding sin cerrar"

# 1 · El equipo le marca el escalón y su ventana. Es lo que hace el alta.
comoSi 'bbbbbbbb-0000-0000-0000-000000000001' \
  "select marcar_servicio('$NUEVO','ascenso',null);"
marcar $? "el equipo le marca su escalón desde el alta"

# 2 · CIERRA SU ONBOARDING. Esta es la escritura que decide si vuelve a ver el
#     wizard: App.tsx dibuja el wizard cuando `onboarding_completed` es false.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$NUEVO'::uuid \$\$;
set role authenticated;
update profiles set onboarding_completed = true, status = 'ACTIVE' where id = '$NUEVO';
SQL
CERRO=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select onboarding_completed from profiles where id = '$NUEVO';
SQL
)
[ "$CERRO" = "t" ]
marcar $? "el cliente cierra su propio onboarding: si no, vuelve a ver el wizard para siempre ($CERRO)"

# 3 · Su especialidad, que decide con qué palabra le habla la app.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$NUEVO'::uuid \$\$;
set role authenticated;
update profiles set especialidad = 'Coach', pais = 'EC' where id = '$NUEVO';
SQL
ESP=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select coalesce(especialidad,'SIN GUARDAR') from profiles where id = '$NUEVO';
SQL
)
[ "$ESP" = "Coach" ]
marcar $? "guarda su especialidad: de ahí sale si le hablamos de pacientes o de consultantes ($ESP)"

# 4 · Su antesala: el protocolo que diseña él, antes de la sesión 1.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$NUEVO'::uuid \$\$;
set role authenticated;
update profiles set antesala = '{"protocolo":[{"area":"sueno","loQueHago":"Apago la luz a las 23:30"}],"dias":["2026-10-15"]}'::jsonb
 where id = '$NUEVO';
SQL
ANT=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select coalesce(jsonb_array_length(antesala->'dias')::text,'SIN GUARDAR')
  from profiles where id = '$NUEVO';
SQL
)
[ "$ANT" = "1" ]
marcar $? "tilda su primer día de antesala, y queda guardado ($ANT)"

# 5 · Cierra su primera jornada del Camino.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$NUEVO'::uuid \$\$;
set role authenticated;
insert into hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada, fecha_completada)
  values ('$NUEVO', 1, 'P1.1', true, current_date)
  on conflict (usuario_id, pilar_numero, meta_codigo) do update set completada = true;
SQL
JOR=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from hoja_de_ruta where usuario_id = '$NUEVO' and completada;
SQL
)
[ "$JOR" = "1" ]
marcar $? "cierra su primera jornada y queda en su hoja de ruta ($JOR)"

# 6 · Le escribe al equipo por Soporte. Vale para los tres escalones.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$NUEVO'::uuid \$\$;
set role authenticated;
insert into mensajes (canal, emisor_id, contenido) values ('privado','$NUEVO','no me abre el día 2');
SQL
MSG=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from mensajes where emisor_id = '$NUEVO';
SQL
)
[ "$MSG" = "1" ]
marcar $? "le escribe al equipo por Soporte y el mensaje llega ($MSG)"

# 7 · Y el equipo lo ve en su bandeja: sin esto, nadie se enteraría.
ESPERA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from mensajes
 where canal = 'privado' and receptor_id is null and respondido_en is null
   and emisor_id = '$NUEVO';
SQL
)
[ "$ESPERA" = "1" ]
marcar $? "y aparece en la bandeja del equipo como alguien esperando respuesta ($ESPERA)"

# 8 · Su evidencia: la sube, la IA la juzga, y el veredicto queda.
comoSi "$NUEVO" \
  "select guardar_veredicto_ia('evidencias/$NUEVO/P1.6/1.jpg','$NUEVO','P1.6','aprobada','Se ve el fuego');"
marcar $? "sube su evidencia y el veredicto del testigo queda guardado"

# 9 · Un cliente NO lee la ficha de otro. Es la puerta de todo lo demás.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$NUEVO'::uuid \$\$;
SQL
AJENA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA -c \"set role authenticated\" -c \"select count(*) from profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001'\"" | tail -1)
[ "$AJENA" = "0" ]
marcar $? "un cliente no lee la ficha de otro cliente (filas: $AJENA)"

PROPIA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA -c \"set role authenticated\" -c \"select count(*) from profiles where id = '$NUEVO'\"" | tail -1)
[ "$PROPIA" = "1" ]
marcar $? "y sí lee la suya, que es de donde sale toda su pantalla ($PROPIA)"

# 10 · No se cambia a sí mismo lo que compró.
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select '$NUEVO'::uuid \$\$;
set role authenticated;
update profiles set servicio_contratado = 'instalacion' where id = '$NUEVO';
SQL
ESCALON=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select servicio_contratado from profiles where id = '$NUEVO';
SQL
)
[ "$ESCALON" = "ascenso" ]
marcar $? "y no se asciende solo a la instalación de 5.000 ($ESCALON)"

su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -c 'reset role'" > /dev/null 2>&1

echo ""
echo "══ a quién se le ofrece migrarse ══"
#
# `estado_de_migraciones` comprobaba que quien pregunta sea del equipo y
# devolvía TODAS las fichas, las del equipo incluidas. Así que la pantalla
# mostraba a Lupe con cero de cinco piezas y un botón para migrarla.
comoSi 'bbbbbbbb-0000-0000-0000-000000000001' "select 1;"
EQUIPO_EN_LISTA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from estado_de_migraciones()
 where cliente_id = 'bbbbbbbb-0000-0000-0000-000000000001';
SQL
)
[ "$EQUIPO_EN_LISTA" = "0" ]
marcar $? "el equipo no se lista: no se migra (filas de Lupe: $EQUIPO_EN_LISTA)"

CLIENTES_EN_LISTA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from estado_de_migraciones()
 where cliente_id = 'aaaaaaaa-0000-0000-0000-000000000001';
SQL
)
[ "$CLIENTES_EN_LISTA" = "1" ]
marcar $? "y los clientes sí (filas del cliente: $CLIENTES_EN_LISTA)"

# La llave: la abre el equipo, y el cliente la lee en su propia ficha.
comoSi 'bbbbbbbb-0000-0000-0000-000000000001' \
  "select habilitar_migracion(cliente => 'aaaaaaaa-0000-0000-0000-000000000001', habilitar => true);"
marcar $? "el equipo le abre la migración con los nombres que usa el alta"

ABIERTA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select migracion_habilitada from profiles
 where id = 'aaaaaaaa-0000-0000-0000-000000000001';
SQL
)
[ "$ABIERTA" = "t" ]
marcar $? "y queda abierta, que es lo que le hace aparecer la tarjeta en su HOY ($ABIERTA)"

# Un cliente no se abre la migración a sí mismo ni se la abre a otro.
comoSi 'aaaaaaaa-0000-0000-0000-000000000002' \
  "select habilitar_migracion(cliente => 'aaaaaaaa-0000-0000-0000-000000000002', habilitar => true);"
[ $? -ne 0 ]
marcar $? "un cliente NO se abre la migración a sí mismo"

# Y el cierre lo firma el propio cliente, desde su pantalla.
comoSi 'aaaaaaaa-0000-0000-0000-000000000001' "select cerrar_mi_migracion();"
marcar $? "el cliente cierra su propia migración al guardar"

MIGRADO=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select case when migrado_en is null then 'SIN MIGRAR' else 'migrado' end
  from profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001';
SQL
)
[ "$MIGRADO" = "migrado" ]
marcar $? "y queda fechado: es lo que hace que la tarjeta deje de aparecerle ($MIGRADO)"

# EL CANDADO NO SE AFLOJÓ. La excepción vale solo cuando la escritura viene
# de la función: un update a mano desde el navegador rebota igual que antes.
comoSi 'aaaaaaaa-0000-0000-0000-000000000002' \
  "select habilitar_migracion(cliente => 'aaaaaaaa-0000-0000-0000-000000000002', habilitar => true);"
comoSi 'bbbbbbbb-0000-0000-0000-000000000001' \
  "select habilitar_migracion(cliente => 'aaaaaaaa-0000-0000-0000-000000000002', habilitar => true);"
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -v ON_ERROR_STOP=1" << SQL > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as \$\$ select 'aaaaaaaa-0000-0000-0000-000000000002'::uuid \$\$;
set role authenticated;
update profiles set migrado_en = now() where id = 'aaaaaaaa-0000-0000-0000-000000000002';
SQL
A_MANO=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select case when migrado_en is null then 'rebotó' else 'PASÓ' end
  from profiles where id = 'aaaaaaaa-0000-0000-0000-000000000002';
SQL
)
[ "$A_MANO" = "rebotó" ]
marcar $? "y marcarse migrado a mano sigue rebotando: la excepción es solo para la función ($A_MANO)"

echo ""
echo "══ el veredicto de la evidencia ══"
#
# Las dos funciones que deciden son plpgsql, y plpgsql NO valida el cuerpo al
# crearlo: un error de tipo adentro aparece la primera vez que se ejecuta. Que
# en producción es cuando el cliente sube su foto.
#
# Así que se ejecutan las tres: la de la IA, la del equipo y la cola.
A1='aaaaaaaa-0000-0000-0000-000000000001'
LUPE='bbbbbbbb-0000-0000-0000-000000000001'
FOTO="evidencias/$A1/P1.6/1760000000_quema.jpg"

comoSi "$A1" \
  "select guardar_veredicto_ia('$FOTO','$A1','P1.6','rechazada','No se ve fuego');"
marcar $? "el cliente guarda el veredicto que dictó el testigo sobre su foto"

EST=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select estado || '/' || quien from evidencia_veredictos where archivo = '$FOTO';
SQL
)
[ "$EST" = "rechazada/ia" ]
marcar $? "y queda guardado con la firma de quién lo dictó ($EST)"

# El path lo arma el navegador: un veredicto apuntando a la carpeta de otro no
# entra, aunque el cliente mande su propio id.
comoSi "$A1" \
  "select guardar_veredicto_ia('evidencias/aaaaaaaa-0000-0000-0000-000000000002/P1.6/x.jpg','$A1','P1.6','aprobada',null);"
[ $? -ne 0 ]
marcar $? "un veredicto sobre un archivo de otra carpeta NO entra"

# Y el cliente no se aprueba a sí mismo escribiendo la tabla: la RLS le da
# lectura y nada más.
#
# Con `set role authenticated`, que es el rol con el que entra la app. Como
# postgres —dueño de la tabla— la RLS NO se aplica: el update pasaba y esta
# línea daba verde sin haber probado la política.
comoSi "$A1" "select 1;"
su postgres -c "psql -h $SOCK -p $PORT -U postgres -q" << SQL > /dev/null 2>&1
set role authenticated;
update evidencia_veredictos set estado = 'aprobada' where archivo = '$FOTO';
SQL
APR=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select estado from evidencia_veredictos where archivo = '$FOTO';
SQL
)
[ "$APR" = "rechazada" ]
marcar $? "y no se aprueba a sí mismo escribiendo la tabla ($APR)"

# La cola del equipo: lo rechazado y lo pendiente, con el nombre del cliente.
comoSi "$LUPE" "select 1;"
EN_COLA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from cola_de_evidencias() where archivo = '$FOTO';
SQL
)
[ "$EN_COLA" = "1" ]
marcar $? "le cae a la cola del equipo, con el motivo del testigo al lado ($EN_COLA)"

# Un cliente no ve la cola: la función la filtra por equipo.
comoSi "$A1" "select 1;"
SIN_COLA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from cola_de_evidencias();
SQL
)
[ "$SIN_COLA" = "0" ]
marcar $? "y un cliente no lee la cola de nadie (filas: $SIN_COLA)"

# El equipo decide, y el aviso al cliente sale en la misma operación.
comoSi "$LUPE" \
  "select decidir_evidencia('$FOTO','aprobada','Está, se ve el fuego','$A1','P1.6');"
marcar $? "el equipo la aprueba en un toque"

FIRMA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select estado || '/' || quien || '/' || coalesce(decidido_por::text,'nadie')
  from evidencia_veredictos where archivo = '$FOTO';
SQL
)
[ "$FIRMA" = "aprobada/equipo/$LUPE" ]
marcar $? "y la decisión queda con el nombre de quién la tomó ($FIRMA)"

AVISO=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from notificaciones
 where usuario_id = '$A1' and tipo = 'evidencia';
SQL
)
[ "$AVISO" = "1" ]
marcar $? "el cliente recibe su aviso desde la misma operación (avisos: $AVISO)"

# La IA no pisa lo que ya decidió una persona.
comoSi "$A1" \
  "select guardar_veredicto_ia('$FOTO','$A1','P1.6','rechazada','otra vez no');"
TRAS=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select estado || '/' || quien from evidencia_veredictos where archivo = '$FOTO';
SQL
)
[ "$TRAS" = "aprobada/equipo" ]
marcar $? "y la IA no pisa lo que ya decidió una persona ($TRAS)"

# Un cliente no decide por nadie, ni por sí mismo.
comoSi "$A1" \
  "select decidir_evidencia('$FOTO','aprobada',null,'$A1','P1.6');"
[ $? -ne 0 ]
marcar $? "un cliente NO decide sobre una evidencia, ni sobre la suya"

# Y 'pendiente' no es una decisión de persona: es el estado de lo no mirado.
comoSi "$LUPE" \
  "select decidir_evidencia('$FOTO','pendiente',null,'$A1','P1.6');"
[ $? -ne 0 ]
marcar $? "y nadie «decide pendiente»: ese es el estado de lo que falta mirar"

# La jornada cerrada se ve en la cola, que es lo que cambia la conversación.
comoSi "$LUPE" \
  "insert into hoja_de_ruta (usuario_id, pilar_numero, meta_codigo, completada)
     values ('$A1', 1, 'P1.6', true)
     on conflict (usuario_id, pilar_numero, meta_codigo) do update set completada = true;
   select decidir_evidencia('$FOTO','rechazada','Sube otra con la hoja entera','$A1','P1.6');"
comoSi "$LUPE" "select 1;"
CERRADA=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select jornada_cerrada from cola_de_evidencias() where archivo = '$FOTO';
SQL
)
[ "$CERRADA" = "t" ]
marcar $? "la cola avisa que esa jornada ya cerró, en vez de reabrirla sola ($CERRADA)"

echo ""
echo "══ los nombres con los que la app llama a los RPC ══"
#
# PostgREST resuelve los RPC POR NOMBRE DE ARGUMENTO. `tableroSync.ts` llamaba
# a guardar_semana_cliente con `p_cliente` y `p_semana` —la función los llama
# `p_cliente_id` y `p_semana_iso`— y el `return !error` daba la llamada por
# buena. Los números que cargaba el cliente no llegaban nunca a la base.
#
# Esto compara los nombres que usa el código con los que declara la base. Un
# nombre de menos acá es una función que no se llama nunca y nadie se entera.
#
# LA LISTA SALE DEL CÓDIGO, NO DE ACÁ.
#
# Estaban escritas a mano cuatro funciones. O sea que esta prueba en verde no
# decía nada de la quinta: las tres del veredicto de la evidencia pasaron sin
# que las mirara, y la próxima también iba a pasar.
#
# Ahora se leen todas las llamadas `.rpc('nombre', { p_x: … })` de src/ y se
# comparan contra lo que declara la base. Una llamada nueva entra sola.
python3 scripts/rpc-que-llama-la-app.py > "$DATA/rpc.txt"

FALTAN=""
SINFUNC=""
MIRADAS=0
while IFS= read -r PAR; do
  [ -z "$PAR" ] && continue
  FN="${PAR%%:*}"; ARGS="${PAR#*:}"
  MIRADAS=$((MIRADAS + 1))
  EXISTE=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = '$FN';
SQL
)
  # Una función que el código llama y ninguna migración del repo crea: o la
  # dejó una migración vieja que ya corrió en la base de Javo, o el nombre
  # está mal escrito. Se nombra abajo en vez de dar por buena la llamada.
  if [ "$EXISTE" = "0" ]; then SINFUNC="$SINFUNC $FN"; continue; fi
  REALES=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << SQL
select string_agg(a, ',' order by i) from (
  select unnest(p.proargnames) as a, generate_subscripts(p.proargnames,1) as i
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = '$FN' limit 40) t;
SQL
)
  for A in $(echo "$ARGS" | tr ',' ' '); do
    case ",$REALES," in
      *",$A,"*) ;;
      *) FALTAN="$FALTAN $FN.$A" ;;
    esac
  done
done < "$DATA/rpc.txt"
[ -z "$FALTAN" ]
marcar $? "los $MIRADAS RPC que llama la app: cada parámetro existe en la función ($([ -z "$FALTAN" ] && echo "todos" || echo "faltan:$FALTAN"))"

# Las que no existen en esta base de prueba, que levanta las migraciones
# desde 20261009 y `sala-de-mando.sql`: las crea una migración anterior. Sus
# nombres los verifica `scripts/prueba-rpc-nombres.py` contra el texto del
# SQL del repo, que cubre las 56.
echo "   fuera de esta base (las mira prueba-rpc-nombres.py):${SINFUNC:- ninguna}"

# Y la prueba de fondo: guardar con los nombres que usa la app de verdad.
comoSi 'aaaaaaaa-0000-0000-0000-000000000001' \
  "select guardar_semana_cliente(p_cliente_id => 'aaaaaaaa-0000-0000-0000-000000000001', p_semana_iso => '2026-W43', p_datos => '{\"gasto\":250,\"conversaciones\":40,\"agendas\":9}'::jsonb);"
marcar $? "el cliente guarda su semana con los nombres del código"
GAS=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA" << 'SQL'
select gasto::int from sala_metricas_semana
 where semana_iso = '2026-W43' and cliente_id = 'aaaaaaaa-0000-0000-0000-000000000001';
SQL
)
[ "$GAS" = "250" ]
marcar $? "y llega a la tabla, que es lo que el equipo y su tablero leen (gasto: $GAS)"

echo ""
if [ "$fallas" -eq 0 ]; then echo "✓ TODO EN VERDE"; else echo "✗ $fallas FALLAS"; fi
exit "$fallas"
