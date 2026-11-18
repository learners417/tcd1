#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  LAS COLUMNAS QUE EL CÓDIGO PIDE, CONTRA LA BASE QUE LA BATERÍA LEVANTA ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# POR QUÉ EXISTE
#
# `scripts/prueba-sql.sh` levanta un PostgreSQL de verdad y es la prueba más
# fuerte que tiene este repo: valida tipos, defaults y políticas. Pero la base
# que levanta no es la base de Javo: es un ANDAMIAJE, y hasta el 17 de
# noviembre diez de sus tablas estaban escritas a mano ahí. OCHO de las diez
# las crea el propio repositorio, y tres estaban mal justo en las columnas que
# las pantallas piden:
#
#   · `cliente_preactivacion_check` decía `paso` donde la tabla real dice
#     `step_id`, y no tenía `completado_por`.
#   · `programa_videos` tenía un `url` que no existe en ninguna parte y le
#     faltaban `youtube_url`, `descripcion`, `duracion` y `created_at`.
#   · `credit_transactions` no tenía `paypal_order_id` ni `pack_id`, y —lo
#     que costó un crédito por cada imagen que falló— tampoco el CHECK de
#     `source`, así que `devolver_credito` pasaba la prueba escribiendo
#     `devolucion`, un valor que la base real rechaza.
#
# `hoja_de_ruta` ya había caído por lo mismo y se arregló a mano. Era la cuarta
# vez. Esta lente existe para que no haya una quinta: no vigila que las tablas
# a mano estén bien escritas, vigila que NO SE ESCRIBAN A MANO las que el repo
# crea, y que toda columna que el código nombra exista de verdad.
#
# CÓMO
#
# El esquema no se LEE con una expresión regular —el comentario `--` del final
# de una línea se pega al nombre de la columna siguiente, que es la razón por
# la que existe `solo_sql` en la batería—: se LEVANTA. Y el andamiaje no se
# copia: se reusa el de `prueba-sql.sh` cortándolo en su marcador, igual que
# hace `prueba-puesta-al-dia.sh`, así que si ese archivo crece, esto sigue
# midiendo lo mismo que él.
#
#     python3 scripts/prueba-el-esquema-de-la-bateria.py
#
# Si no hay PostgreSQL en esta máquina, sale en 0 diciendo que no puede.
import glob
import os
import re
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
fallas = 0


def ok(nombre, cond, detalle=''):
    global fallas
    if cond:
        print(f'  ✓ {nombre}')
    else:
        fallas += 1
        print(f'  ✗ {nombre}' + (f' — {detalle}' if detalle else ''))


# ── 1 · LAS TABLAS QUE EL REPO CREA, Y LAS QUE NO ──────────────────────────
CREA = re.compile(r'create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_0-9]+)', re.I)
CREA_VISTA = re.compile(
    r'create\s+(?:or\s+replace\s+)?(?:materialized\s+)?view\s+(?:if\s+not\s+exists\s+)?'
    r'(?:public\.)?"?([a-z_0-9]+)', re.I)


def sin_comentarios_sql(texto):
    return re.sub(r'--.*$', '', texto, flags=re.M)


SQL_DEL_REPO = (sorted(glob.glob('supabase/migrations/*.sql'))
                + sorted(glob.glob('*.sql'))
                + sorted(glob.glob('supabase/functions/**/*.sql', recursive=True)))
creadas = {}
for f in SQL_DEL_REPO:
    t = sin_comentarios_sql(open(f, encoding='utf-8', errors='replace').read())
    for rx in (CREA, CREA_VISTA):
        for m in rx.finditer(t):
            creadas.setdefault(m.group(1).lower(), f)

# ── 2 · LAS TABLAS QUE EL ANDAMIAJE ESCRIBE A MANO ─────────────────────────
#
# Solo las dos que ningún .sql del repo crea pueden estar escritas a mano:
# `profiles` y `mensajes` nacieron en el panel de Supabase. Cualquier otra que
# aparezca a mano acá es la trampa de siempre: `create table if not exists` la
# saltea después y la prueba mide una tabla que no es la de Javo.
A_MANO_PERMITIDAS = {'profiles', 'mensajes',
                     # las de sistema, que un PostgreSQL pelado no trae
                     'users', 'buckets', 'objects',
                     # la crea el archivo que esta misma prueba pone a prueba
                     'sala_metricas_semana',
                     # las excluidas a propósito y con su comentario en el .sh
                     'hoja_de_ruta'}

sh = open('scripts/prueba-sql.sh', encoding='utf-8', errors='replace').read()
MARCADOR = '══ el SQL contra PostgreSQL real ══'
ok('el andamiaje de prueba-sql.sh tiene su marcador', MARCADOR in sh,
   f'no encontré «{MARCADOR}»')
if MARCADOR not in sh:
    sys.exit(1)
# El corte va por LÍNEA y no por posición de carácter: el marcador vive dentro
# de un `echo "..."`, así que cortar en medio de esa línea deja la comilla
# abierta y el andamiaje entero no arranca. Es el mismo corte por línea que
# hace prueba-puesta-al-dia.sh.
_lineas = sh.split('\n')
_corte = next(i for i, l in enumerate(_lineas) if MARCADOR in l)
ANDAMIAJE = '\n'.join(_lineas[:_corte]) + '\n'
andamiaje_txt = sin_comentarios_sql(ANDAMIAJE)
a_mano = {m.group(1).lower() for m in CREA.finditer(andamiaje_txt)}
inventadas = sorted(t for t in a_mano
                    if t in creadas and t not in A_MANO_PERMITIDAS)
ok('el andamiaje no escribe a mano ninguna tabla que el repo crea',
   not inventadas,
   '; '.join(f'{t} (la crea {creadas[t]})' for t in inventadas))

# ── 3 · LEVANTAR LA BASE, REUSANDO EL ANDAMIAJE DEL .sh ────────────────────
PGBIN = None
for d in sorted(glob.glob('/usr/lib/postgresql/*/bin'), reverse=True):
    if os.path.isfile(os.path.join(d, 'initdb')):
        PGBIN = d
        break
if not PGBIN:
    print('  ⧗ sin PostgreSQL local: no se puede levantar la base acá')
    sys.exit(1 if fallas else 0)

TMP = tempfile.mkdtemp()
os.chmod(TMP, 0o755)  # `su postgres` tiene que poder entrar a leer los .sql
VOLCADO = os.path.join(TMP, 'esquema.txt')
corrida = os.path.join(TMP, 'corrida.sh')
with open(corrida, 'w', encoding='utf-8') as h:
    h.write(ANDAMIAJE)
    # El mismo orden que usa prueba-sql.sh: PRIMERO sala-de-mando.sql y
    # DESPUÉS las migraciones desde 20261009. Al revés, `jornadas` —que nace
    # en sala-de-mando.sql— todavía no existe cuando corre 20261014, y su
    # columna `funciones` sale como faltante sin serlo.
    h.write("""
psqlq -f sala-de-mando.sql > /dev/null 2>&1
for f in $(ls supabase/migrations/*.sql | sort | awk -F/ '$NF >= "20261009"'); do
  psqlq -f "$f" > /dev/null 2>&1
done
cat > "$DATA/volcar.sql" << 'VOLCAR'
select 'C ' || table_name || '.' || column_name from information_schema.columns
 where table_schema = 'public'
union all
select 'T ' || table_name from information_schema.tables where table_schema = 'public'
union all
select 'V ' || table_name from information_schema.views where table_schema = 'public';
VOLCAR
chmod 644 "$DATA/volcar.sql"
su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA -f $DATA/volcar.sql" > VOLCADO
""".replace('VOLCADO', VOLCADO))

r = subprocess.run(['bash', corrida], capture_output=True, text=True)
volcado = open(VOLCADO, encoding='utf-8').read().split('\n') if os.path.exists(VOLCADO) else []
reales = {l[2:].strip() for l in volcado if l.startswith('C ')}
tablas = {l[2:].strip() for l in volcado if l.startswith('T ')}
vistas = {l[2:].strip() for l in volcado if l.startswith('V ')}
ok('la base levanta y contesta qué columnas quedaron',
   len(reales) > 100 and len(tablas) > 10,
   f'{len(reales)} columnas en {len(tablas)} tablas — '
   + (r.stderr or r.stdout).strip().split('\n')[-1][:160])
if not reales:
    sys.exit(1)

# ── 4 · LAS COLUMNAS QUE EL CÓDIGO PIDE ────────────────────────────────────
SALTAR = {'node_modules', '.git', 'dist', 'planes-archivados', 'scripts', 'public'}


def sin_comentarios_ts(s):
    s = re.sub(r'/\*[\s\S]*?\*/', '', s)
    return re.sub(r'^\s*//.*$', '', s, flags=re.M)


def cierre(t, i):
    """El paréntesis que cierra al que abre en i, sin mirar los que viven en
    un texto."""
    d, j, q = 0, i, None
    while j < len(t):
        c = t[j]
        if q:
            if c == '\\':
                j += 2
                continue
            if c == q:
                q = None
        elif c in '\'"`':
            q = c
        elif c == '(':
            d += 1
        elif c == ')':
            d -= 1
            if d == 0:
                return j
        j += 1
    return -1


def cadena(t, i):
    """Los eslabones de la cadena que arranca en `.from(...)`: pares
    (método, argumento). Se camina eslabón por eslabón y NO por una ventana de
    N caracteres, que se come la línea siguiente y pide como columna lo que es
    una clave de un json."""
    out = []
    while True:
        m = re.compile(r'\s*\.\s*([A-Za-z_][A-Za-z_0-9]*)\s*\(').match(t, i)
        if not m:
            return out
        c = cierre(t, m.end() - 1)
        if c < 0:
            return out
        out.append((m.group(1), t[m.end():c]))
        i = c + 1


def columnas_del_select(arg):
    """Los nombres de un `select('a, b, tabla(c, d)')`.

    Lo que va entre paréntesis es OTRA tabla —el embebido de PostgREST—, así
    que se saca antes de partir por comas. Y el embebido viene en cuatro
    formas: `tabla(...)`, `tabla!inner(...)`, `alias:tabla(...)` y
    `alias:tabla!clave_ajena(...)`. La última fue la que faltaba: con
    `emisor:profiles!emisor_id(nombre)` quedaba pedida una columna
    `mensajes.profiles`, que no puede existir.
    """
    a = arg.strip().strip('\'"`')
    if not a or '${' in a:
        return set()
    a = re.sub(r'[a-z_][a-z_0-9]*(?:!\s*[a-z_][a-z_0-9]*)?\s*\(', '(', a)
    plano, d = [], 0
    for ch in a:
        if ch == '(':
            d += 1
            continue
        if ch == ')':
            d -= 1
            continue
        if d == 0:
            plano.append(ch)
    out = set()
    for c in ''.join(plano).split(','):
        c = c.strip()
        if ':' in c:
            c = c.split(':', 1)[1].strip()
        c = c.lstrip('!').split('!')[0].strip()
        if not c or c == '*' or not re.fullmatch(r'[a-z_][a-z_0-9]*', c):
            continue
        out.add(c)
    return out


def claves_del_objeto(arg):
    """Las claves del PRIMER nivel de `{ a: 1, b: 2 }`. Lo de más adentro es
    json, no columnas."""
    a = arg.strip()
    if not a.startswith('{'):
        return set()
    q, nivel, llave = None, 0, ''
    for ch in a[1:]:
        if q:
            if ch == q:
                q = None
            continue
        if ch in '\'"`':
            q = ch
            continue
        if ch in '{[(':
            nivel += 1
            continue
        if ch in '}])':
            if nivel == 0:
                break
            nivel -= 1
            continue
        if nivel == 0:
            llave += ch
    return {m.group(1) for m in re.finditer(r'(?:^|,)\s*([a-z_][a-z_0-9]*)\s*:', llave)}


CONSTANTE = re.compile(
    r'^\s*(?:export\s+)?const\s+([A-Za-z_][A-Za-z_0-9]*)\s*(?::\s*[^=]+)?=\s*'
    r'\s*[\'"`]([^\'"`]*)[\'"`]\s*;?\s*$', re.M)


def constantes_de_texto(src):
    """Las constantes de texto del archivo, para poder resolver un
    `.select(COLUMNAS)` que no trae el literal al lado.

    Sin esto la lente quedaba ciega justo donde importa: al sacar la lista de
    columnas a una constante —que es lo prolijo— el argumento deja de ser un
    texto y no se mide nada. Se probó poniendo el defecto a propósito y la
    lente seguía verde.
    """
    return {m.group(1): m.group(2) for m in CONSTANTE.finditer(src)}


FILTROS = {'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'order', 'contains'}
pedidas = {}
for base, subs, fs in os.walk(RAIZ):
    subs[:] = [s for s in subs if s not in SALTAR]
    for f in sorted(fs):
        if not f.endswith(('.ts', '.tsx', '.mts', '.mjs')):
            continue
        ruta = os.path.join(base, f)
        src = sin_comentarios_ts(open(ruta, encoding='utf-8', errors='replace').read())
        consts = constantes_de_texto(src)
        for m in re.finditer(r"\.from\(\s*['\"]([a-z_0-9]+)['\"]\s*\)", src):
            tabla = m.group(1)
            # Las vistas no: sus nombres no están en information_schema.columns
            # igual. Y una tabla que la base de prueba no tiene no se puede
            # medir acá: la vigila el punto 5.
            if tabla in vistas or tabla not in tablas:
                continue
            for met, arg in cadena(src, m.end()):
                cols = set()
                if met == 'select':
                    # Un `.select(COLUMNAS)` se resuelve por la constante.
                    suelto = arg.strip()
                    if suelto in consts:
                        arg = f"'{consts[suelto]}'"
                    cols = columnas_del_select(arg)
                elif met in FILTROS:
                    mm = re.match(r"\s*['\"]([a-z_][a-z_0-9]*)['\"]", arg)
                    if mm:
                        cols = {mm.group(1)}
                elif met in ('insert', 'update', 'upsert'):
                    cols = claves_del_objeto(arg)
                for c in cols:
                    pedidas.setdefault((tabla, c), set()).add(os.path.relpath(ruta, RAIZ))

ok('hay pares tabla.columna que medir', len(pedidas) > 100, f'solo {len(pedidas)}')
sin_respaldo = sorted((t, c, sorted(d)) for (t, c), d in pedidas.items()
                      if f'{t}.{c}' not in reales)
ok('toda columna que el código nombra existe en la base que la batería levanta',
   not sin_respaldo,
   '; '.join(f'{t}.{c} ← {d[0]}' for t, c, d in sin_respaldo[:4]))
for t, c, d in sin_respaldo:
    print(f'      · {t}.{c} — pedida en {", ".join(d)}')

# ── 5 · LAS TABLAS QUE NINGÚN .sql DEL REPO CREA ───────────────────────────
#
# De una instalación nueva no pueden salir: el repo no sabe crearlas. Son las
# que nacieron a mano en el panel de Supabase. Las cuatro están medidas y
# anotadas; lo que esta lente no deja es que aparezca una quinta sin que nadie
# se entere.
HUECO_CONOCIDO = {
    'profiles': 'la tabla del centro de la app, ~100 columnas sumadas por migraciones',
    'mensajes': 'el soporte',
    'session_logs': 'el registro de sesiones',
    'diario_entradas': 'el Diario del fundador',
    # El motivo que estaba escrito acá era FALSO, medido el 18 de noviembre:
    # decía «solo la nombra test-db.mjs» de las dos, y el propio repo les
    # enciende la RLS y les escribe cuatro políticas a cada una en
    # 20260505_rls_advisor_fixes.sql, y `get_user_tasks` lee `tareas_usuario`.
    # Ese lado —el de las tablas que solo el SQL del repo nombra— lo mide
    # `prueba-la-rls-esta-encendida.py` en su punto 4.5, que además encontró
    # tres huecos que acá no estaban: `metricas`, `biblioteca_videos` y
    # `biblioteca_recursos`. Este punto 5 sigue siendo el del NAVEGADOR.
    'tareas_template': 'el catálogo de tareas del equipo; la cuida el SQL del '
                       'repo y la nombra test-db.mjs',
    'tareas_usuario': 'las tareas del cliente; get_user_tasks la lee y la '
                      'cuida el SQL del repo',
}
nombradas = set()
for base, subs, fs in os.walk(RAIZ):
    subs[:] = [s for s in subs if s not in SALTAR]
    for f in sorted(fs):
        if not f.endswith(('.ts', '.tsx', '.mts', '.mjs')):
            continue
        src = sin_comentarios_ts(
            open(os.path.join(base, f), encoding='utf-8', errors='replace').read())
        for m in re.finditer(r"\.from\(\s*['\"]([a-z_0-9]+)['\"]\s*\)", src):
            nombradas.add(m.group(1))
huerfanas = sorted(t for t in nombradas if t not in creadas)
nuevas = [t for t in huerfanas if t not in HUECO_CONOCIDO]
ok('ninguna tabla nueva nace fuera del repo',
   not nuevas,
   'ningún .sql del repo crea: ' + ', '.join(nuevas))
cerradas = [t for t in HUECO_CONOCIDO if t not in huerfanas]
if cerradas:
    print(f'      ⧗ ya las crea el repo, sacalas de HUECO_CONOCIDO: {", ".join(sorted(cerradas))}')

# ── 6 · LAS TRES SENTENCIAS DE LA SALA, EJERCIDAS ──────────────────────────
#
# Que la columna exista es el punto 4. Esto es la otra mitad: las tres
# sentencias EXACTAS que hace la Sala de Mando, corridas contra la base con una
# fila de prueba. Si alguien vuelve a escribir `titulo` o `vigente`, acá se ve
# lo que Javo ve: el panel vacío y el guardar que tira error.
ejercicio = os.path.join(TMP, 'ejercer.sql')
with open(ejercicio, 'w', encoding='utf-8') as h:
    h.write("""
insert into auth.users (id, email) values
  ('44444444-4444-4444-4444-444444444444','sala@ejemplo.com') on conflict do nothing;
insert into profiles (id, nombre, rol) values
  ('44444444-4444-4444-4444-444444444444','Cliente de prueba','cliente')
  on conflict do nothing;
-- guardarDecision
insert into sala_decisiones (texto, motivo, contexto, cliente_id, estado)
  values ('No se baja el precio', 'Lo barato trae al que se va',
          'Sesión con el cliente de prueba.',
          '44444444-4444-4444-4444-444444444444', 'vigente');
-- listarDecisiones, con los alias tal como los manda PostgREST
select id, texto as titulo, motivo as criterio, contexto,
       created_at as decidida_en, cliente_id, estado
  from sala_decisiones where estado = 'vigente'
  order by created_at desc;
-- derogarDecision
update sala_decisiones set estado = 'revertida'
  where cliente_id = '44444444-4444-4444-4444-444444444444';
""")
corrida2 = os.path.join(TMP, 'ejercer.sh')
with open(corrida2, 'w', encoding='utf-8') as h:
    h.write(ANDAMIAJE)
    h.write("""
psqlq -f sala-de-mando.sql > /dev/null 2>&1
for f in $(ls supabase/migrations/*.sql | sort | awk -F/ '$NF >= "20261009"'); do
  psqlq -f "$f" > /dev/null 2>&1
done
chmod 644 EJERCICIO
psqlq -f EJERCICIO
echo "RC=$?"
""".replace('EJERCICIO', ejercicio))
r2 = subprocess.run(['bash', corrida2], capture_output=True, text=True)
salida2 = r2.stdout + r2.stderr
err2 = [l for l in salida2.split('\n') if 'ERROR' in l]
ok('las tres sentencias de la Sala de Mando corren contra la base',
   'RC=0' in salida2 and not err2,
   (err2[0] if err2 else salida2.strip().split('\n')[-1])[:200])

print()
print(f'  {len(pedidas)} pares tabla.columna contra {len(tablas)} tablas levantadas; '
      f'{len(sin_respaldo)} sin respaldo · {len(huerfanas)} tablas que el repo no crea')
sys.exit(1 if fallas else 0)
