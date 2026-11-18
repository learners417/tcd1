#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  LOS ARCHIVOS SON DE SU DUEÑO — la RLS de `storage.objects`, ejercida      ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# POR QUÉ EXISTE. El 17 de noviembre a las 19:30 se midió la RLS de las tablas
# de `public` (las 60, encendidas y acotadas) y a las 23:25 la puerta que la
# rodea (quién puede EJECUTAR las funciones). Queda un cuerpo que ninguna de
# las dos tocó y que ninguna de las 9xx miradas de esta batería nombraba:
# **`storage.objects`**, donde viven los archivos. La única mirada que decía
# «bucket» pregunta que no se abra un SEGUNDO bucket, no quién lee el primero.
#
# Y storage tiene exactamente la misma trampa que la RLS de `public`, más una
# propia:
#
#   · UNA POLÍTICA SIN `to <rol>` VALE PARA TODOS LOS ROLES, `anon` incluido.
#     PostgreSQL la escribe `{public}` en `pg_policies` y no avisa nada. En
#     Supabase, `anon` es la llave publicable que viaja en el bundle del
#     navegador: cualquiera la tiene.
#   · UN BUCKET `public = true` entrega el ARCHIVO a quien tenga la URL. Lo
#     que decide si se pueden AVERIGUAR las URLs —listar— es la política de
#     SELECT sobre `storage.objects`. Un bucket público con SELECT abierta no
#     es «público»: es un índice de todo lo que subió cada cliente.
#
# QUÉ MIDE. Las tres carpetas que usa el código, con las rutas que el código
# escribe de verdad (`src/lib/soporteDatos.ts`, `campanasStorage.ts`,
# `evidencia.ts`), sentándose en cuatro sillas: sin sesión (`anon`), dos
# clientes distintos y el equipo. No lee el `.sql`: lo CORRE y después
# intenta leer, escribir y borrar.
#
# EL ANDAMIAJE no se copia: se reusa el de `prueba-sql.sh` cortando en su
# marcador, igual que `prueba-puesta-al-dia.sh`. Y se le arreglan dos cosas
# que ahí están clavadas y acá son el punto entero:
#
#   1 · `auth.uid()` está fija en `select null::uuid` — sin eso ninguna
#       política de dueño puede dar verdadero y todo saldría «no puede» por el
#       motivo equivocado.
#   2 · `auth.role()` está clavada en `'authenticated'` — o sea que una
#       política que pregunta `auth.role() = 'authenticated'` daba VERDADERO
#       sentado en la silla de `anon`, y hay una que pregunta justo eso
#       (`creativos_assets_insert`). Acá lee el rol puesto, como PostgREST.
#   3 · `storage.objects` nace SIN RLS en ese andamiaje, y en Supabase nace
#       CON ella. Sin encenderla, las 14 políticas no filtran nada y todo da
#       verde sin haber probado ninguna.
#
# Corre:  bash scripts/prueba-los-archivos-son-de-su-dueno.sh

set -u
cd "$(dirname "$0")/.." || exit 1

# ── PARTE 0 · LAS COPIAS QUE NADIE ATABA ───────────────────────────────────
#
# Esta no necesita PostgreSQL y por eso va antes: es texto.
#
# Tres de las catorce políticas están escritas DOS VECES —en
# `20261102_lo_que_el_cliente_guarda_el_dia_1.sql` y otra vez dentro de
# `poner-al-dia-la-base.sql`, que es el archivo que Javo pega— y las dos
# copias nacen con guarda: `if not exists (select 1 from pg_policies …)`. Con
# esa guarda **gana la primera que corra**, así que si las dos copias dejan de
# decir lo mismo, cuál de las dos manda depende del orden en que se pegaron
# los archivos, y nada lo avisa. Lo cazó el arnés de esta lente al primer
# intento: un defecto puesto en la copia de `poner-al-dia-la-base.sql` dejaba
# la lente VERDE, porque en la corrida la que había ganado era la otra.
#
# (Las que se escriben con `drop policy if exists` antes no entran acá: ahí
# gana la ÚLTIMA, que es el orden que la parte 1 ejercita de verdad.)
echo "══ las políticas escritas dos veces dicen lo mismo ══"
python3 - << 'COPIAS'
import glob, re, sys
_bat = open('auditoria.py', encoding='utf-8').read()
_g = {'re': re}
exec(compile(_bat[_bat.index('def _sin_comentario_al_final'):
                  _bat.index('# ── Ayudante: ¿una tab del Admin')], 'limpiador', 'exec'), _g)
solo_codigo = _g['solo_codigo']

copias = {}
for f in sorted(glob.glob('*.sql')) + sorted(glob.glob('supabase/migrations/*.sql')):
    t = solo_codigo(open(f, encoding='utf-8', errors='replace').read(), f)
    for m in re.finditer(r'create\s+policy\s+"([a-z_]+)"\s+on\s+storage\.objects([\s\S]*?);', t, re.I):
        nombre, cuerpo = m.group(1), m.group(2)
        antes = t[:m.start()]
        # ¿nace con guarda y sin `drop` propio? Entonces gana la primera.
        guardada = (f"policyname='{nombre}'" in antes.replace('"', "'")
                    and not re.search(r'drop\s+policy\s+if\s+exists\s+"' + nombre + '"',
                                      antes[-400:], re.I))
        if guardada:
            copias.setdefault(nombre, []).append((f, ' '.join(cuerpo.lower().split())))

fallas = 0
for nombre, lista in sorted(copias.items()):
    cuerpos = {c for _, c in lista}
    if len(lista) < 2:
        continue
    if len(cuerpos) == 1:
        print(f'✓ «{nombre}» dice lo mismo en sus {len(lista)} copias con guarda')
    else:
        print(f'✗ «{nombre}» NO dice lo mismo en sus copias con guarda: ' +
              ', '.join(f for f, _ in lista))
        fallas += 1
if not copias:
    print('✗ ninguna política con guarda encontrada: la lente de las copias no midió nada')
    fallas += 1
sys.exit(1 if fallas else 0)
COPIAS
RC0=$?
echo ""

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -1)
if [ -z "$PGBIN" ]; then
  echo "sin PostgreSQL local: solo se midieron las copias"
  exit $RC0
fi

MARCADOR='el SQL contra PostgreSQL real'
CORTE=$(grep -n "$MARCADOR" scripts/prueba-sql.sh | head -1 | cut -d: -f1)
if [ -z "$CORTE" ]; then
  echo "✗ no encuentro el marcador «$MARCADOR» en scripts/prueba-sql.sh"
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
sed -n "1,$((CORTE - 1))p" scripts/prueba-sql.sh > "$TMP/corrida.sh"

# ── Las sentencias de storage, EXTRAÍDAS del repo y no transcritas ──────────
#
# Una copia a mano de estas 27 sentencias coincidiría hoy y se desfasaría
# mañana: es textualmente el defecto que este repo cerró el 16 de noviembre en
# el contrato del puente y el 18 en la lista de la puesta al día. Se leen de
# los `.sql` del repo, con el limpiador de la batería puesto para no aplicar
# una política que alguien dejó comentada.
cat >> "$TMP/corrida.sh" << 'RESTO'

python3 - << 'EXTRAE' > "$DATA/storage.sql"
import glob, os, re
_bat = open('auditoria.py', encoding='utf-8').read()
_g = {'re': re}
exec(compile(_bat[_bat.index('def _sin_comentario_al_final'):
                  _bat.index('# ── Ayudante: ¿una tab del Admin')], 'limpiador', 'exec'), _g)
solo_codigo = _g['solo_codigo']

# El orden de la base real: primero los `.sql` de la raíz (los viejos, que ya
# corrieron), después las migraciones, y la puesta al día al final.
archivos = sorted(f for f in glob.glob('*.sql') if f != 'poner-al-dia-la-base.sql')
archivos += sorted(glob.glob('supabase/migrations/*.sql'))
archivos += ['poner-al-dia-la-base.sql']

sent = []
for f in archivos:
    t = solo_codigo(open(f, encoding='utf-8', errors='replace').read(), f)
    for m in re.finditer(r'do\s*\$\$[\s\S]*?end\s*\$\$\s*;', t, re.I):
        if 'storage.objects' in m.group(0).lower() or 'storage.buckets' in m.group(0).lower():
            sent.append(m.group(0))
    sin_do = re.sub(r'do\s*\$\$[\s\S]*?end\s*\$\$\s*;', '', t, flags=re.I)
    for m in re.finditer(r'(insert\s+into\s+storage\.buckets[\s\S]*?;)', sin_do, re.I):
        sent.append(m.group(1))
    for m in re.finditer(r'((?:create|drop)\s+policy[\s\S]*?;)', sin_do, re.I):
        if re.search(r'on\s+storage\.objects', m.group(1), re.I):
            sent.append(m.group(1))
print('\n'.join(sent))
print(f'-- {len(sent)} sentencias de storage, leídas del repo')
EXTRAE

# Las dos funciones de identidad, como las pone PostgREST y no como las clava
# el andamiaje (ver la cabecera). Y la RLS de storage, que en Supabase viene
# encendida de fábrica.
psqlq << 'SQL' > /dev/null 2>&1
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function auth.role() returns text language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''),
                     current_setting('role', true)) $$;
alter table profiles add column if not exists admin_rol text;
alter table storage.objects enable row level security;
grant usage on schema auth, storage to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;
grant select, insert, update, delete on storage.objects to anon, authenticated;
grant select on storage.buckets to anon, authenticated;
grant select on profiles to anon, authenticated;
create table if not exists auth.users (id uuid primary key, email text);
insert into auth.users (id) values
  ('aaaaaaaa-0000-0000-0000-00000000000a'),
  ('bbbbbbbb-0000-0000-0000-00000000000b'),
  ('cccccccc-0000-0000-0000-00000000000c') on conflict do nothing;
insert into profiles (id, nombre, rol, admin_rol) values
  ('aaaaaaaa-0000-0000-0000-00000000000a','Cliente A','cliente',null),
  ('bbbbbbbb-0000-0000-0000-00000000000b','Cliente B','cliente',null),
  ('cccccccc-0000-0000-0000-00000000000c','Javo','admin','owner')
  on conflict (id) do update set rol = excluded.rol, admin_rol = excluded.admin_rol;
SQL

echo "══ las políticas de storage del repo ══"

# `sala-de-mando.sql` trae `el_que_llama_es_del_equipo`, que es la única copia
# de «quién es del equipo» y la que usan las políticas nuevas. Va antes.
psqlq -f sala-de-mando.sql > "$DATA/sdm.txt" 2>&1
marcar $? "la base de partida se arma (sala-de-mando.sql)"

psqlq -f "$DATA/storage.sql" > "$DATA/st.txt" 2>&1
_errores=$(grep -ciE "^ERROR|^psql.*ERROR" "$DATA/st.txt")
[ "$_errores" = "0" ]; marcar $? "las sentencias de storage del repo corren sin un error ($_errores)"
grep -E "^ERROR|^psql.*ERROR" "$DATA/st.txt" | head -3

_pol=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -t -c \"select count(*) from pg_policies where schemaname='storage'\"" 2>&1 | tr -d '[:space:]')
[ "${_pol:-0}" -ge 10 ] 2>/dev/null
marcar $? "quedaron las políticas de storage instaladas ($_pol)"

# ─── LAS CUATRO SILLAS ────────────────────────────────────────────────────
#
# `set role` y no `set local role`: cada llamada a psql es una sesión suelta,
# sin BEGIN, y `set local` ahí avisa y no hace nada — la prueba correría como
# superusuario, a quien la RLS no se le aplica, y daría verde sin haber
# probado ni una política.
A=aaaaaaaa-0000-0000-0000-00000000000a
B=bbbbbbbb-0000-0000-0000-00000000000b
C=cccccccc-0000-0000-0000-00000000000c

sentado() {  # sentado <uid|-> <sql>  → corre con esa persona puesta
  local SET
  if [ "$1" = "-" ]; then
    SET="set role anon;"
  else
    SET="select set_config('request.jwt.claim.sub','$1',false); set role authenticated;"
  fi
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -t" << SQL > /dev/null 2>&1
$SET
$2
SQL
}

cuantosVe() {  # cuantosVe <uid|-> <bucket> → cuántas filas ve esa persona
  local SET
  if [ "$1" = "-" ]; then
    SET="set role anon;"
  else
    SET="select set_config('request.jwt.claim.sub','$1',false); set role authenticated;"
  fi
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -t" << SQL 2>&1 | grep -E '^[[:space:]]*[0-9]+[[:space:]]*$' | head -1 | tr -d '[:space:]'
$SET
select count(*) from storage.objects where bucket_id = '$2';
SQL
}

hay() {  # hay <bucket> <name> → 1 si el archivo existe (sin rol, sin RLS)
  su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -t" << SQL 2>&1 | grep -E '^[[:space:]]*[0-9]+[[:space:]]*$' | head -1 | tr -d '[:space:]'
select count(*) from storage.objects where bucket_id = '$1' and name = '$2';
SQL
}

sube() {  # sube <uid|-> <bucket> <name> → 1 si entró
  sentado "$1" "insert into storage.objects (bucket_id, name) values ('$2','$3');"
  hay "$2" "$3"
}

borra() {  # borra <uid> <bucket> <name> → 0 si lo borró
  sentado "$1" "delete from storage.objects where bucket_id='$2' and name='$3';"
  hay "$2" "$3"
}

# Los archivos de los dos clientes, con las rutas EXACTAS del código.
psqlq << SQL > /dev/null 2>&1
insert into storage.objects (bucket_id, name, owner) values
  ('mensajes-archivos','$A/1700000000.png','$A'),
  ('mensajes-archivos','$B/1700000001.pdf','$B'),
  ('creativos-assets','$A/cre-1/1.png','$A'),
  ('creativos-assets','$B/cre-2/1.png','$B'),
  ('task-attachments','evidencias/$A/D1-FOTO/quema.jpg','$A'),
  ('task-attachments','evidencias/$B/D1-FOTO/quema.jpg','$B'),
  ('task-attachments','tarea-9/adjunto-del-equipo.pdf','$C');
SQL

echo ""
echo "══ el bucket privado sigue privado ══"
_priv=$(su postgres -c "psql -h $SOCK -p $PORT -U postgres -q -t -c \"select public from storage.buckets where id='task-attachments'\"" 2>&1 | tr -d '[:space:]')
[ "$_priv" = "f" ]; marcar $? "task-attachments es privado (devolvió «$_priv»)"

echo ""
echo "══ LEER: sin sesión no se lista nada ══"
#
# Esto es lo que se midió abierto el 18 de noviembre: `mensajes_archivos_read`
# y `creativos_assets_select` sin `to authenticated`, o sea `{public}`, o sea
# que con la llave publicable del bundle se listaban los archivos de TODOS.
for b in mensajes-archivos creativos-assets task-attachments; do
  N=$(cuantosVe - "$b")
  [ "${N:-x}" = "0" ]; marcar $? "sin sesión no ve ni un archivo de $b (vio «$N»)"
done

echo ""
echo "══ LEER: cada cliente ve lo suyo y solo lo suyo ══"
N=$(cuantosVe "$A" mensajes-archivos)
[ "${N:-x}" = "1" ]; marcar $? "el cliente A ve su archivo de mensajes y no el de B (vio «$N», tiene que ser 1)"
N=$(cuantosVe "$A" creativos-assets)
[ "${N:-x}" = "1" ]; marcar $? "el cliente A ve su creativo y no el de B (vio «$N», tiene que ser 1)"
N=$(cuantosVe "$A" task-attachments)
[ "${N:-x}" = "1" ]; marcar $? "el cliente A ve su evidencia y nada más (vio «$N», tiene que ser 1)"
N=$(cuantosVe "$C" task-attachments)
[ "${N:-0}" -ge 3 ] 2>/dev/null; marcar $? "el equipo lee las tres carpetas de task-attachments (vio «$N»)"

echo ""
echo "══ ESCRIBIR: solo en la carpeta propia ══"
N=$(sube - mensajes-archivos "sin-sesion.png")
[ "$N" = "0" ]; marcar $? "sin sesión no sube a mensajes-archivos (devolvió «$N»)"
N=$(sube - creativos-assets "sin-sesion.png")
[ "$N" = "0" ]; marcar $? "sin sesión no sube a creativos-assets (devolvió «$N»)"
N=$(sube - task-attachments "evidencias/$A/D1-FOTO/sin-sesion.jpg")
[ "$N" = "0" ]; marcar $? "sin sesión no sube a task-attachments (devolvió «$N»)"
N=$(sube "$B" mensajes-archivos "$A/pisado.png")
[ "$N" = "0" ]; marcar $? "un cliente no sube a la carpeta de otro en mensajes-archivos (devolvió «$N»)"
N=$(sube "$B" creativos-assets "$A/cre-1/pisado.png")
[ "$N" = "0" ]; marcar $? "un cliente no sube a la carpeta de otro en creativos-assets (devolvió «$N»)"
N=$(sube "$B" creativos-assets "LOS-ANUNCIOS-DE-LA-CASA/1.png")
[ "$N" = "0" ]; marcar $? "un cliente no sube a una carpeta inventada de creativos-assets (devolvió «$N»)"
N=$(sube "$B" task-attachments "evidencias/$A/D1-FOTO/pisado.jpg")
[ "$N" = "0" ]; marcar $? "un cliente no sube a la evidencia de otro (devolvió «$N»)"
N=$(sube "$B" task-attachments "tarea-9/falso.pdf")
[ "$N" = "0" ]; marcar $? "un cliente no sube a las tareas del equipo (devolvió «$N»)"

echo ""
echo "══ ESCRIBIR: lo que la app hace de verdad SÍ entra ══"
N=$(sube "$B" mensajes-archivos "$B/1700000002.png")
[ "$N" = "1" ]; marcar $? "un cliente manda su archivo en el chat de soporte (devolvió «$N»)"
N=$(sube "$B" creativos-assets "$B/cre-2/2.png")
[ "$N" = "1" ]; marcar $? "un cliente guarda su creativo (devolvió «$N»)"
N=$(sube "$B" task-attachments "evidencias/$B/D2-PRECIO/audio.m4a")
[ "$N" = "1" ]; marcar $? "un cliente sube su evidencia (devolvió «$N»)"
N=$(sube "$C" creativos-assets "$A/cre-1/2.png")
[ "$N" = "1" ]; marcar $? "el equipo guarda un creativo EN la carpeta de un cliente (devolvió «$N»)"
N=$(sube "$C" task-attachments "tarea-10/adjunto.pdf")
[ "$N" = "1" ]; marcar $? "el equipo sube el adjunto de una tarea (devolvió «$N»)"

echo ""
echo "══ BORRAR: lo de otro no se toca ══"
N=$(borra "$B" mensajes-archivos "$A/1700000000.png")
[ "$N" = "1" ]; marcar $? "un cliente no borra el archivo de otro en mensajes (sobrevivió: «$N»)"
N=$(borra "$B" creativos-assets "$A/cre-1/1.png")
[ "$N" = "1" ]; marcar $? "un cliente no borra el creativo de otro (sobrevivió: «$N»)"
N=$(borra "$B" task-attachments "evidencias/$A/D1-FOTO/quema.jpg")
[ "$N" = "1" ]; marcar $? "un cliente no borra la evidencia de otro (sobrevivió: «$N»)"
N=$(borra "$B" task-attachments "tarea-9/adjunto-del-equipo.pdf")
[ "$N" = "1" ]; marcar $? "un cliente no borra el adjunto del equipo (sobrevivió: «$N»)"

echo ""
echo "══ BORRAR: lo propio sí ══"
N=$(borra "$B" mensajes-archivos "$B/1700000001.pdf")
[ "$N" = "0" ]; marcar $? "un cliente borra su archivo de mensajes (quedó: «$N»)"
N=$(borra "$B" task-attachments "evidencias/$B/D1-FOTO/quema.jpg")
[ "$N" = "0" ]; marcar $? "un cliente borra su evidencia (quedó: «$N»)"
N=$(borra "$C" creativos-assets "$A/cre-1/2.png")
[ "$N" = "0" ]; marcar $? "el equipo borra el creativo de un cliente (quedó: «$N»)"

echo ""
if [ "$fallas" -eq 0 ]; then
  echo "✓ los archivos son de su dueño: todas las reglas se cumplen"
else
  echo "✗ $fallas regla(s) de archivos sin cumplir"
fi
exit $([ "$fallas" -eq 0 ] && echo 0 || echo 1)
RESTO

bash "$TMP/corrida.sh"
RC1=$?
exit $([ "$RC0" = 0 ] && [ "$RC1" = 0 ] && echo 0 || echo 1)
