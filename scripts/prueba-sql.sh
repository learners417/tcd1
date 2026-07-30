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
create table sala_metricas_semana (
  id uuid primary key default gen_random_uuid(), cliente_id uuid not null,
  campana_id uuid, semana_iso text not null, anuncio text,
  objetivo text default 'mensajes', gasto numeric default 0, alcance int default 0,
  comentarios int default 0, conversaciones int default 0, agendas int default 0,
  llamadas int default 0, ventas int default 0, facturado numeric default 0,
  cargado_por text, created_at timestamptz default now(),
  unique (cliente_id, semana_iso, anuncio));
SQL

marcar() {
  if [ "$1" -eq 0 ]; then echo "✓ $2"; else echo "✗ $2"; fallas=$((fallas + 1)); fi
}

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

echo ""
if [ "$fallas" -eq 0 ]; then echo "✓ TODO EN VERDE"; else echo "✗ $fallas FALLAS"; fi
exit "$fallas"
