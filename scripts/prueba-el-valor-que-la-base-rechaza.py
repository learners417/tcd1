#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║   LOS VALORES QUE EL CÓDIGO ESCRIBE, CONTRA LAS LISTAS CERRADAS DE LA   ║
# ║   BASE QUE LA BATERÍA LEVANTA                                          ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# POR QUÉ EXISTE
#
# `prueba-el-esquema-de-la-bateria.py` mide que cada COLUMNA que el código
# nombra exista, y `prueba-rpc-nombres.py` que cada PARÁMETRO de RPC exista.
# Las dos miran NOMBRES. Ninguna mira el VALOR, y una columna con
# `CHECK (col IN (...))` es una lista cerrada: el nombre está bien, la columna
# existe, y la base rechaza la fila con un 23514 igual.
#
# Ya costó plata dos veces:
#
#   · `devolver_credito` anotaba `devolucion` en `credit_transactions.source`,
#     que no está en la lista. La red de seguridad del crédito no anotaba
#     nada, y Supabase DEVUELVE el error en vez de lanzarlo, así que el log
#     decía «devolución anotada». Arreglado el 17 de noviembre.
#   · `creativos.tipo` admite `imagen_single` y `carrusel` desde el 10 de
#     abril, y nunca se amplió. La pestaña «Portada YouTube» escribe
#     `yt_thumbnail`: el cliente gastaba su crédito, la imagen se generaba, y
#     el insert moría en la base. Medido hoy, 18 de noviembre.
#
# Y el segundo NO lo encuentra una lente de literales: en el código no hay
# ninguna comilla con `yt_thumbnail` al lado de un `insert`. El valor viaja
# en una variable (`config.tipo`), y lo que lo admite es el TIPO:
# `TipoCreativo` declara tres valores y la base acepta dos. Por eso esta
# lente mide las dos puertas —el literal y el tipo— y no sólo la primera.
#
# CÓMO
#
# Las listas NO se leen con una expresión regular: se PREGUNTAN al catálogo.
# Un `--` al final de una línea pega su comentario al nombre siguiente, y un
# paréntesis dentro de un comentario —`-- ajuste manual (regalo, compensación)`—
# corta la lista a mitad: leyendo el .sql con regex, `credit_transactions.source`
# daba cinco valores de los siete que tiene, y `refund` aparecía como fuga
# siendo legítimo. Se levanta un PostgreSQL, se corre TODO el SQL del repo y
# se le pregunta a `pg_constraint`.
#
# El andamiaje se reusa del de `prueba-sql.sh`, cortándolo en su marcador,
# igual que hacen `prueba-puesta-al-dia.sh` y la lente del esquema. Pero acá
# se corren TODAS las migraciones y no sólo las de 20261009 en adelante: las
# listas de `creativos` y `campanas` nacen el 10 de abril, y con el corte por
# fecha esas dos tablas no existen en la base de la batería — que es,
# exactamente, por qué este defecto vivió siete meses.
#
#     python3 scripts/prueba-el-valor-que-la-base-rechaza.py
#
# Si no hay PostgreSQL en esta máquina, lo dice y sale en 0.
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


# ── 1 · LAS LISTAS CERRADAS, PREGUNTADAS AL CATÁLOGO ───────────────────────
sh = open('scripts/prueba-sql.sh', encoding='utf-8', errors='replace').read()
MARCADOR = '══ el SQL contra PostgreSQL real ══'
ok('el andamiaje de prueba-sql.sh tiene su marcador', MARCADOR in sh,
   f'no encontré «{MARCADOR}»')
if MARCADOR not in sh:
    sys.exit(1)
# El corte va por LÍNEA: el marcador vive dentro de un `echo "..."`, y cortar
# en medio de esa línea deja la comilla abierta y el andamiaje no arranca.
_lineas = sh.split('\n')
_corte = next(i for i, l in enumerate(_lineas) if MARCADOR in l)
ANDAMIAJE = '\n'.join(_lineas[:_corte]) + '\n'

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
VOLCADO = os.path.join(TMP, 'catalogo.txt')
corrida = os.path.join(TMP, 'corrida.sh')
with open(corrida, 'w', encoding='utf-8') as h:
    h.write(ANDAMIAJE)
    h.write("""
psqlq -f sala-de-mando.sql > /dev/null 2>&1
for f in $(ls supabase/migrations/*.sql | sort) $(ls *.sql 2>/dev/null); do
  psqlq -f "$f" > /dev/null 2>&1
done
cat > "$DATA/volcar.sql" << 'VOLCAR'
select 'K|' || c.relname || '|' || pg_get_constraintdef(x.oid)
  from pg_constraint x
  join pg_class c on c.oid = x.conrelid
  join pg_namespace n on n.oid = c.relnamespace
 where x.contype = 'c' and n.nspname = 'public'
union all
select 'E|' || t.typname || '|' || string_agg(e.enumlabel, ',' order by e.enumsortorder)
  from pg_type t join pg_enum e on e.enumtypid = t.oid
  join pg_namespace n on n.oid = t.typnamespace
 where n.nspname = 'public' group by t.typname
union all
select 'T|' || table_name || '|' from information_schema.tables where table_schema = 'public'
union all
select 'V|' || table_name || '|' from information_schema.views where table_schema = 'public';
VOLCAR
chmod 644 "$DATA/volcar.sql"
su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA -f $DATA/volcar.sql" > VOLCADO
""".replace('VOLCADO', VOLCADO))

_r = subprocess.run(['bash', corrida], capture_output=True, text=True)
volcado = (open(VOLCADO, encoding='utf-8').read().split('\n')
           if os.path.exists(VOLCADO) else [])
EN_LA_BASE = {l.split('|')[1] for l in volcado if l[:2] in ('T|', 'V|') and '|' in l}

# CHECK ((tipo = ANY (ARRAY['imagen_single'::text, 'carrusel'::text])))
# y la forma con nulo: CHECK (((tipo IS NULL) OR (tipo = ANY (ARRAY[...]))))
_ANY = re.compile(r'\(?([a-z_0-9]+)\)?(?:::text)?\s*=\s*ANY\s*\(\s*\(?ARRAY\[(.*?)\]', re.S)
LISTAS = {}
for l in volcado:
    if not l.startswith('K|'):
        continue
    _, tabla, defn = l.split('|', 2)
    for m in _ANY.finditer(defn):
        col = m.group(1)
        vals = re.findall(r"'([^']*)'", m.group(2))
        if vals:
            LISTAS.setdefault(f'{tabla}.{col}', set()).update(vals)

ok('la base levanta y contesta sus listas cerradas',
   len(EN_LA_BASE) > 40 and len(LISTAS) >= 20,
   f'{len(LISTAS)} listas en {len(EN_LA_BASE)} tablas — '
   + (_r.stderr or _r.stdout).strip().split('\n')[-1][:160])
if not LISTAS:
    sys.exit(1)
print(f'  · {len(LISTAS)} columnas con lista cerrada, preguntadas al catálogo')


# ── 2 · EL CÓDIGO: DÓNDE SE ESCRIBE Y DÓNDE SE FILTRA ──────────────────────
SALTAR = ('node_modules/', '.git/', 'dist/', 'planes-archivados/', 'public/')
ARCHIVOS = []
for raiz in ('src', 'api'):
    for f in glob.glob(f'{raiz}/**/*.*', recursive=True):
        if f.endswith(('.ts', '.tsx', '.mjs', '.js')) and not any(s in f for s in SALTAR):
            ARCHIVOS.append(f)
ARCHIVOS.sort()


def sin_comentarios_ts(s):
    s = re.sub(r'/\*[\s\S]*?\*/', '', s)
    return re.sub(r'^\s*//.*$', '', s, flags=re.M)


def cierre(t, i, ab='(', ce=')'):
    """El que cierra al que abre en i, sin mirar los que viven en un texto."""
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
        elif c == ab:
            d += 1
        elif c == ce:
            d -= 1
            if d == 0:
                return j
        j += 1
    return -1


def partes(txt):
    """Corta por comas de primer nivel: un `Omit<X, 'a' | 'b'>` tiene comas
    adentro, y partir por todas rompía el tipo en dos."""
    out, d, act = [], 0, ''
    for c in txt:
        if c in '<([{':
            d += 1
        elif c in '>)]}':
            d -= 1
        if c == ',' and d == 0:
            out.append(act)
            act = ''
        else:
            act += c
    if act.strip():
        out.append(act)
    return out


TEXTO = {f: sin_comentarios_ts(open(f, encoding='utf-8', errors='replace').read())
         for f in ARCHIVOS}

fugas_lit, fugas_filtro, tablas_fuera = [], [], {}
sitios_tipo = []   # (archivo, tabla, identificador, posición)

# ── EL NOMBRE DE LA TABLA NO SIEMPRE ES UNA COMILLA ────────────────────────
#
# `api/fathom-webhook.ts` escribe `.from(TABLA)`, con `const TABLA =
# 'transcripciones_recibidas'` arriba. Anclando sólo en el literal, esa
# escritura —y la lista cerrada de su columna `estado`— no se miraba nunca, y
# es justo la tabla de las transcripciones que entran solas. Se resuelve la
# constante del mismo archivo; lo que no se resuelve se dice al final.
_CONST = re.compile(r"\bconst\s+([A-Z_][A-Z_0-9]*)\s*=\s*'([a-z_0-9]+)'")
_DESDE = re.compile(r"\.from\(\s*(?:['\"]([a-z_0-9]+)['\"]|([A-Za-z_$][\w$]*))\s*\)")
nombres_sin_resolver = {}

for f in ARCHIVOS:
    t = TEXTO[f]
    constantes = dict((m.group(1), m.group(2)) for m in _CONST.finditer(t))
    for m in _DESDE.finditer(t):
        tabla = m.group(1) or constantes.get(m.group(2), '')
        if not tabla:
            # `supabase.storage.from(BUCKET)` no es una tabla, y el ayudante
            # genérico de supabase.ts recibe el nombre por parámetro.
            # La ventana mira hacia atrás con holgura y sin importar los
            # saltos de línea: `supabase.storage\n  .from(BUCKET)` partía el
            # `.storage.from(` en dos y el bucket entraba como tabla.
            _antes = re.sub(r'\s+', '', t[max(0, m.start() - 80):m.end()])
            if '.storage.from(' not in _antes:
                nombres_sin_resolver.setdefault(m.group(2), set()).add(f)
            continue
        # El tramo del encadenado termina donde empieza otro `.from(`: una
        # consulta armada en varias líneas (`query = query.eq(...)`) sigue
        # siendo la misma, y cortar en el `;` la perdía.
        sig = re.search(r"\.from\(\s*['\"]", t[m.end():])
        tramo = t[m.end(): m.end() + sig.start() if sig else len(t)][:6000]
        if tabla not in EN_LA_BASE:
            tablas_fuera.setdefault(tabla, set()).add(f)
            continue
        # ── el literal, dentro del objeto que se escribe
        for mm in re.finditer(r'\.(insert|update|upsert)\(\s*\{', tramo):
            ab = tramo.index('{', mm.start())
            ce = cierre(tramo, ab, '{', '}')
            obj = tramo[ab: ce if ce > 0 else ab + 2000]
            for k, v in re.findall(r"([a-z_0-9]+)\s*:\s*'([^']*)'", obj):
                clave = f'{tabla}.{k}'
                if clave in LISTAS and v not in LISTAS[clave]:
                    fugas_lit.append(f'{f}: escribe {clave} = {v!r} '
                                     f'(la base acepta {sorted(LISTAS[clave])})')
        # ── el literal, dentro del filtro: fuera de la lista no empareja nunca
        for mm in re.finditer(r"\.(eq|neq)\(\s*'([a-z_0-9]+)'\s*,\s*'([^']*)'\s*\)", tramo):
            clave = f'{tabla}.{mm.group(2)}'
            if clave in LISTAS and mm.group(3) not in LISTAS[clave]:
                fugas_filtro.append(f'{f}: filtra {clave} = {mm.group(3)!r} '
                                    f'(la base acepta {sorted(LISTAS[clave])})')
        for mm in re.finditer(r"\.in\(\s*'([a-z_0-9]+)'\s*,\s*\[([^\]]*)\]", tramo):
            clave = f'{tabla}.{mm.group(1)}'
            if clave in LISTAS:
                for v in re.findall(r"'([^']*)'", mm.group(2)):
                    if v not in LISTAS[clave]:
                        fugas_filtro.append(f'{f}: filtra {clave} en {v!r} '
                                            f'(la base acepta {sorted(LISTAS[clave])})')
        # ── y el que no es literal: una variable, con su tipo declarado
        for mm in re.finditer(r'\.(insert|update|upsert)\(\s*([A-Za-z_$][\w$]*)\s*[,)]', tramo):
            sitios_tipo.append((f, tabla, mm.group(2), m.end() + mm.start(), None))
        # ── y la clave ABREVIADA: `.update({ estado, revisada_por })`.
        #
        # `sacarDeLaCola` escribe así, con `estado: 'cargada' | 'descartada'`
        # declarado en el parámetro. No hay comilla en el objeto y la variable
        # no es el objeto entero, así que ninguna de las dos miradas de arriba
        # la alcanzaba: es una tercera puerta para el mismo defecto.
        for mm in re.finditer(r'\.(insert|update|upsert)\(\s*\{', tramo):
            ab = tramo.index('{', mm.start())
            ce = cierre(tramo, ab, '{', '}')
            for pieza in partes(tramo[ab + 1: ce if ce > 0 else ab + 2000]):
                corta = pieza.strip().rstrip(',')
                if re.fullmatch(r'[a-z_0-9]+', corta) and f'{tabla}.{corta}' in LISTAS:
                    sitios_tipo.append((f, tabla, corta, m.end() + mm.start(), corta))

ok('ningún valor escrito está fuera de la lista que la base acepta',
   not fugas_lit, '; '.join(sorted(set(fugas_lit))[:4]))
ok('ningún filtro busca un valor que la base no puede contener',
   not fugas_filtro, '; '.join(sorted(set(fugas_filtro))[:4]))


# ── 3 · EL TIPO QUE ADMITE LO QUE LA BASE RECHAZA ──────────────────────────
#
# El valor que viaja en una variable no tiene comillas en el insert, pero sí
# tiene un TIPO, y ese tipo es una lista cerrada también. Si las dos listas no
# coinciden, el que compila no es el que la base acepta.
UNION = re.compile(r"^\s*'[^']*'(\s*\|\s*(?:'[^']*'|null|undefined))*\s*$")


def miembros(txt):
    """Los valores de una unión de literales, o None si no es una unión."""
    txt = txt.strip().rstrip(';').strip()
    if not UNION.match(txt):
        return None
    return [v for v in re.findall(r"'([^']*)'", txt)]


def alias(nombre, visto=None):
    """`type TipoCreativo = 'a' | 'b'` → ['a','b']. Sigue un alias de alias."""
    visto = visto or set()
    if nombre in visto or len(visto) > 4:
        return None
    for g in ARCHIVOS:
        for m in re.finditer(r'\btype\s+' + re.escape(nombre) + r'\s*=\s*([^;{]+);', TEXTO[g]):
            vals = miembros(m.group(1))
            if vals:
                return vals
            otro = m.group(1).strip()
            if re.fullmatch(r'[A-Za-z_$][\w$]*', otro):
                return alias(otro, visto | {nombre})
    return None


def cuerpo_del_tipo(nombre):
    """El `{ ... }` de `interface X` o de `type X = { ... }`."""
    for g in ARCHIVOS:
        t = TEXTO[g]
        for rx in (r'\binterface\s+' + re.escape(nombre) + r'\s*(?:extends\s+[\w<>, ]+)?\{',
                   r'\btype\s+' + re.escape(nombre) + r'\s*=\s*\{'):
            m = re.search(rx, t)
            if m:
                ab = t.index('{', m.start())
                ce = cierre(t, ab, '{', '}')
                if ce > 0:
                    return t[ab + 1:ce]
    return None


def campos_union(tipo):
    """{columna: [valores]} de un tipo de fila, siguiendo Omit/Partial/Pick."""
    tipo = tipo.strip()
    fuera, dentro = set(), None
    while True:
        m = re.fullmatch(r'(Omit|Partial|Pick|Required|Readonly)\s*<(.*)>', tipo, re.S)
        if not m:
            break
        args = partes(m.group(2))
        tipo = args[0].strip()
        claves = {v for a in args[1:] for v in re.findall(r"'([^']*)'", a)}
        if m.group(1) == 'Omit':
            fuera |= claves
        elif m.group(1) == 'Pick':
            dentro = claves if dentro is None else (dentro & claves)
    if not re.fullmatch(r'[A-Za-z_$][\w$]*', tipo):
        return None
    cuerpo = cuerpo_del_tipo(tipo)
    if cuerpo is None:
        return None
    campos = {}
    for linea in partes(re.sub(r'\n', ',', cuerpo)):
        m = re.match(r"\s*([a-z_0-9]+)\s*\??\s*:\s*(.+)$", linea, re.S)
        if not m:
            continue
        col, decl = m.group(1), m.group(2).strip()
        if col in fuera or (dentro is not None and col not in dentro):
            continue
        vals = miembros(decl)
        if vals is None and re.fullmatch(r'[A-Za-z_$][\w$]*', decl.rstrip(';')):
            vals = alias(decl.rstrip(';'))
        if vals:
            campos[col] = vals
    return campos


def tipo_del_argumento(t, pos, ident):
    """El tipo con el que se declaró la variable que se escribe.

    Se busca la lista de parámetros de la función que encierra al `.from(`, y
    dentro de ella el parámetro que se llama igual. No se busca por nombre en
    todo el archivo: dos funciones pueden llamar `fila` a cosas distintas."""
    # La lista de parámetros CIERRA antes del cuerpo, así que no sirve pedir
    # que su paréntesis llegue hasta el insert —así no resolvía ninguna de las
    # 21—: lo que tiene que contener al insert es el CUERPO que viene después.
    mejor = None
    for m in re.finditer(r'(?:\bfunction\b[\w\s$]*|=\s*(?:async\s*)?)\(', t[:pos]):
        ab = m.end() - 1
        ce = cierre(t, ab)
        if ce < 0:
            continue
        llave = t.find('{', ce)        # salta el tipo de retorno: `): Promise<X> {`
        if llave < 0:
            continue
        fin = cierre(t, llave, '{', '}')
        if fin < 0:
            fin = len(t)
        if ce < pos < fin:             # el más interno gana: van en orden
            mejor = (ab, ce)
    if not mejor:
        return None
    for p in partes(t[mejor[0] + 1:mejor[1]]):
        m = re.match(r'\s*' + re.escape(ident) + r'\s*\??\s*:\s*(.+)$', p, re.S)
        if m:
            return m.group(1).strip()
    # No todo lo que se escribe entra por un parámetro. En una pantalla el
    # valor sale de un estado: `const [tipo, setTipo] = useState<TipoDeMensaje>`
    # en Mensajes.tsx es la lista de los dos botones del chat de soporte, y es
    # la que entra en `mensajes.tipo`. También vale el `const x: T =` y el
    # `as T` de siempre.
    for rx in (r'\bconst\s*\[\s*' + re.escape(ident) + r'\s*,[^\]]*\]\s*=\s*useState\s*<([^>]+)>',
               r'\b(?:const|let|var)\s+' + re.escape(ident) + r'\s*:\s*([^=;]+)=',
               r'\b(?:const|let|var)\s+' + re.escape(ident) + r'\s*=\s*[^;]*?\bas\s+([A-Za-z_$][\w$]*)'):
        hallados = list(re.finditer(rx, t[:pos]))
        if hallados:
            return hallados[-1].group(1).strip()
    return None


fugas_tipo, sin_resolver = [], []
for f, tabla, ident, pos, columna in sitios_tipo:
    declarado = tipo_del_argumento(TEXTO[f], pos, ident)
    if columna:
        # Clave abreviada: el tipo del parámetro ES el de la columna, no el de
        # una fila entera.
        vals = miembros(declarado) if declarado else None
        if vals is None and declarado and re.fullmatch(r'[A-Za-z_$][\w$]*', declarado.rstrip(';')):
            vals = alias(declarado.rstrip(';'))
        campos = {columna: vals} if vals else None
    else:
        campos = campos_union(declarado) if declarado else None
    if campos is None:
        sin_resolver.append(f'{f}: {tabla}.{ident}'
                            + (f' ({declarado})' if declarado else ' (sin tipo declarado)'))
        continue
    for col, vals in campos.items():
        clave = f'{tabla}.{col}'
        if clave not in LISTAS:
            continue
        sobran = [v for v in vals if v not in LISTAS[clave]]
        if sobran:
            fugas_tipo.append(
                f'{f}: el tipo de {ident} admite {clave} = '
                f'{sorted(sobran)} y la base acepta {sorted(LISTAS[clave])}')

ok('ningún tipo admite un valor que la base rechaza',
   not fugas_tipo, '; '.join(sorted(set(fugas_tipo))[:4]))

# Lo que no se pudo resolver se DICE. Una lente que saltea en silencio lo que
# no entiende da verde por no haber mirado, que es el defecto de forma que ya
# apareció cuatro veces en este repo.
if sin_resolver:
    print(f'  · {len(sin_resolver)} escrituras con variable sin tipo de fila resoluble: '
          + '; '.join(sorted(set(sin_resolver))[:6]))
if nombres_sin_resolver:
    print(f'  · {len(nombres_sin_resolver)} nombres de tabla que no son un literal '
          f'ni una constante del archivo: '
          + ', '.join(sorted(nombres_sin_resolver)[:8]))
if tablas_fuera:
    print(f'  · {len(tablas_fuera)} nombres que el código escribe y no están en esta base '
          f'(no se les puede preguntar la lista): '
          + ', '.join(sorted(tablas_fuera)[:10]))

print()
print('✗ ' + str(fallas) + ' FALLAS' if fallas else '✓ todo en verde')
sys.exit(1 if fallas else 0)
