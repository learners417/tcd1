#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║  EL INFORME DE LA PUESTA AL DÍA — que lo lea alguien, y que sus dos     ║
# ║  listas no se escriban a gusto                                          ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# POR QUÉ EXISTE
#
# `poner-al-dia-la-base.sql` es el archivo que Javo pega en Supabase para que
# su base tenga lo que la app usa. Termina con un informe propio, «QUÉ QUEDÓ»,
# que imprime una línea por cada cosa que falta:
#
#     FALTA FUNCIÓN · get_user_diary
#     FALTA TABLA   · session_logs
#
# Medido el 18 de noviembre de 2026, y son dos defectos distintos:
#
#   1 · NADIE LEÍA EL INFORME. `scripts/prueba-puesta-al-dia.sh` corre el
#       archivo, mira que no haya un `ERROR` y después comprueba su PROPIA
#       lista de 25 nombres. El informe del archivo iba a `p1.txt` y ahí
#       moría: en esa misma corrida verde imprimía **35 líneas de FALTA** que
#       nadie veía. Un informe que no falla es decorado.
#
#   2 · LAS DOS LISTAS DEL INFORME ESTABAN CORTAS. La de tablas tenía 44
#       nombres y el repositorio crea 60: veinte tablas no se verificaban
#       nunca —`sesiones` y `anuncios_fichas` entre ellas, que las crea ESE
#       MISMO ARCHIVO, más las diez `sala_*`, `carga_semanal`,
#       `transcripciones_recibidas`, `invitaciones`—. Y de las 29 funciones
#       que el archivo crea, siete no estaban en su propia lista.
#
# LA FORMA DEL DEFECTO ES LA DE SIEMPRE EN ESTE REPOSITORIO: una lista
# escrita a mano que nadie compara con la realidad, como la de nueve nombres
# del 14 de noviembre, las tres copias del contrato del puente del 16 y el
# PERDÓN de cinco líneas del 17. Por eso las dos mitades de esta lente no se
# pueden separar: el TEXTO, que ata las listas a lo que el repo crea de
# verdad, y LA CORRIDA, que levanta la base y le exige al informe que cada
# FALTA que imprime tenga explicación.
#
# LA EXPLICACIÓN, Y POR QUÉ NO ALCANZA CON «QUE NO IMPRIMA NINGUNA». El
# andamiaje de la batería no aplica las migraciones viejas: corre
# `sala-de-mando.sql`, las migraciones desde 20261009 y la puesta al día. Una
# tabla que nace en una migración de abril falta en ESTA base y está en la de
# Javo. Así que cada línea de FALTA tiene que caer en una de dos: la crea un
# .sql que este andamiaje no aplica, o es uno de los cuatro huecos del panel.
# Cualquier otra es el archivo prometiendo algo que no entrega.
#
#     python3 scripts/prueba-el-informe-de-la-puesta-al-dia.py
#
# Si no hay PostgreSQL en esta máquina, la mitad del texto se mide igual y la
# corrida lo dice y sale en 0, como las otras lentes de base.
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


def rd(f):
    return open(f, encoding='utf-8', errors='replace').read()


# El limpiador de la batería, sin ejecutar la batería: se corta el trozo y se
# compila, igual que hace `prueba-la-rls-esta-encendida.py`. Copiarlo sería
# otra copia de la misma regla.
_bat = rd(os.path.join(RAIZ, 'auditoria.py'))
_g = {'re': re}
exec(compile(_bat[_bat.index('def _sin_comentario_al_final'):
                  _bat.index('# ── Ayudante: ¿una tab del Admin')],
             'limpiador', 'exec'), _g)
solo_codigo = _g['solo_codigo']

PUESTA = 'poner-al-dia-la-base.sql'
CREA = re.compile(r'create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_0-9]+)', re.I)
CREA_FN = re.compile(r'create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z_0-9]+)"?', re.I)

# Los cuatro huecos: tablas que la app usa, que están en la base de Javo y que
# NINGÚN .sql del repositorio sabe crear —nacieron a mano en el panel de
# Supabase—. Van en la lista del informe a propósito: ahí es donde tiene que
# verse si alguna falta. Y están atadas: el día que el repo empiece a crear
# una, la línea sobra y la lente lo dice.
HUECOS_DEL_PANEL = {
    'profiles': 'la ficha del cliente, el centro de la app',
    'mensajes': 'el soporte',
    'diario_entradas': 'el Diario del fundador',
    'session_logs': 'el progreso del cliente en El Camino',
}

SQL_DEL_REPO = (sorted(glob.glob('supabase/migrations/*.sql'))
                + sorted(glob.glob('*.sql'))
                + sorted(glob.glob('supabase/functions/**/*.sql', recursive=True)))
crea_tabla, crea_fn = {}, {}
for _f in SQL_DEL_REPO:
    _t = solo_codigo(rd(_f), _f)
    for _m in CREA.finditer(_t):
        crea_tabla.setdefault(_m.group(1).lower(), set()).add(_f)
    for _m in CREA_FN.finditer(_t):
        crea_fn.setdefault(_m.group(1).lower(), set()).add(_f)

_puesta_txt = solo_codigo(rd(PUESTA), PUESTA)
crea_aqui_tabla = {m.group(1).lower() for m in CREA.finditer(_puesta_txt)}
crea_aqui_fn = {m.group(1).lower() for m in CREA_FN.finditer(_puesta_txt)}

# ── 1 · LAS DOS LISTAS DEL INFORME ─────────────────────────────────────────
_LISTA = re.compile(r"(fn|tb) as \(select unnest\(string_to_array\('([^']+)'")
listas = {k: [n.strip() for n in v.split(',') if n.strip()]
          for k, v in _LISTA.findall(rd(PUESTA))}
ok('el informe de la puesta al día tiene sus dos listas',
   set(listas) == {'fn', 'tb'} and len(listas.get('tb', [])) > 40
   and len(listas.get('fn', [])) > 40,
   f'{ {k: len(v) for k, v in listas.items()} } — sin las dos listas no hay '
   'nada que medir acá')
if set(listas) != {'fn', 'tb'}:
    sys.exit(1)
lista_tb, lista_fn = set(listas['tb']), set(listas['fn'])

ok('ningún nombre repetido en las listas del informe',
   len(lista_tb) == len(listas['tb']) and len(lista_fn) == len(listas['fn']),
   f'{len(listas["tb"]) - len(lista_tb)} tablas y '
   f'{len(listas["fn"]) - len(lista_fn)} funciones repetidas')

# ── 2 · TODA TABLA QUE EL REPO CREA ESTÁ EN LA LISTA ───────────────────────
#
# Ninguna tabla se borra en este repositorio —los únicos `drop table` viven en
# comentarios de rollback—, así que una tabla que el repo crea tiene que estar
# en la base de Javo. Si falta, falta de verdad, y el informe es el único
# lugar donde eso se ve.
_sin_vigilar = sorted(t for t in crea_tabla if t not in lista_tb)
ok('toda tabla que el repo crea está en la lista del informe',
   not _sin_vigilar,
   ', '.join(f'{t} (la crea {sorted(crea_tabla[t])[0]})' for t in _sin_vigilar[:6])
   + (f' y {len(_sin_vigilar) - 6} más' if len(_sin_vigilar) > 6 else '')
   + ' — el informe no las verifica nunca')

# ── 3 · Y NINGÚN NOMBRE DE LA LISTA ES INVENTADO ───────────────────────────
_fantasmas = sorted(t for t in lista_tb
                    if t not in crea_tabla and t not in HUECOS_DEL_PANEL)
ok('todo nombre de la lista de tablas lo crea el repo o es un hueco declarado',
   not _fantasmas,
   ', '.join(_fantasmas) + ' — ningún .sql del repo las crea: o es un nombre '
   'viejo que quedó, o es un hueco del panel y va declarado con su motivo en '
   'HUECOS_DEL_PANEL')

# ── 4 · LOS HUECOS, ATADOS ─────────────────────────────────────────────────
_sobran = sorted(t for t in HUECOS_DEL_PANEL if t in crea_tabla)
ok('ningún hueco del panel sigue declarado cuando el repo ya lo crea',
   not _sobran,
   ', '.join(f'{t} (la crea {sorted(crea_tabla[t])[0]})' for t in _sobran)
   + ' — sacarlo de HUECOS_DEL_PANEL: ya no es un hueco')
_fuera_de_lista = sorted(t for t in HUECOS_DEL_PANEL if t not in lista_tb)
ok('los cuatro huecos del panel están en la lista del informe',
   not _fuera_de_lista,
   ', '.join(_fuera_de_lista) + ' — son justo las que hay que ver si faltan')

# ── 5 · LO QUE EL ARCHIVO CREA, EL ARCHIVO LO VERIFICA ─────────────────────
_fn_propias = sorted(f for f in crea_aqui_fn if f not in lista_fn)
ok('toda función que la puesta al día crea está en su propia lista',
   not _fn_propias,
   ', '.join(_fn_propias) + ' — el archivo las crea y no las verifica')
_tb_propias = sorted(t for t in crea_aqui_tabla if t not in lista_tb)
ok('toda tabla que la puesta al día crea está en su propia lista',
   not _tb_propias, ', '.join(_tb_propias))
_fn_fantasma = sorted(f for f in lista_fn if f not in crea_fn)
ok('toda función de la lista la crea algún .sql del repo',
   not _fn_fantasma,
   ', '.join(_fn_fantasma) + ' — el informe avisaría de una falta que nadie '
   'puede resolver')

# ── 6 · LA CORRIDA: QUE EL INFORME SE LEA ──────────────────────────────────
#
# El andamiaje no se copia: se corta el de `prueba-sql.sh` por su marcador, y
# el preámbulo de la puesta al día —que crea `metricas_v2`, corre
# `sala-de-mando.sql` y corre el archivo dos veces— se corta del propio
# `prueba-puesta-al-dia.sh`. Si cualquiera de los dos marcadores se mueve,
# esta lente lo dice en vez de ponerse verde por no haber podido preguntar.
MARCADOR_SH = '══ el SQL contra PostgreSQL real ══'
MARCADOR_PU = "cat >> \"$TMP/corrida.sh\" << 'RESTO'"
MARCADOR_FIN = '══ lo que faltaba'
_sh = rd('scripts/prueba-sql.sh')
_pu = rd('scripts/prueba-puesta-al-dia.sh')
ok('los marcadores del andamiaje y del preámbulo siguen en su lugar',
   MARCADOR_SH in _sh and MARCADOR_PU in _pu and MARCADOR_FIN in _pu,
   'se movió un marcador: esta lente no puede levantar la base de la puesta '
   'al día')
if not (MARCADOR_SH in _sh and MARCADOR_PU in _pu and MARCADOR_FIN in _pu):
    sys.exit(1)

PGBIN = None
for _d in sorted(glob.glob('/usr/lib/postgresql/*/bin'), reverse=True):
    if os.path.isfile(os.path.join(_d, 'initdb')):
        PGBIN = _d
        break
if not PGBIN:
    print('  ⧗ sin PostgreSQL local: el informe no se puede correr acá')
    print(f'\n  {len(lista_tb)} tablas y {len(lista_fn)} funciones en el informe; '
          f'{len(crea_tabla)} tablas creadas por el repo')
    sys.exit(1 if fallas else 0)

_lineas = _sh.split('\n')
_corte = next(i for i, l in enumerate(_lineas) if MARCADOR_SH in l)
ANDAMIAJE = '\n'.join(_lineas[:_corte]) + '\n'
# El corte va por LÍNEA y no por posición de carácter: los dos marcadores
# viven dentro de una línea con comillas —uno es un `cat << 'RESTO'` y el otro
# un `echo "══ lo que faltaba … ══"`—, así que cortar en medio deja la comilla
# abierta y el guion entero no arranca. Es la misma lección que ya está
# escrita en `prueba-el-esquema-de-la-bateria.py`, y acá se pagó otra vez.
_lpu = _pu.split('\n')
_desde = next(i for i, l in enumerate(_lpu) if MARCADOR_PU in l) + 1
_hasta = next(i for i, l in enumerate(_lpu) if MARCADOR_FIN in l)
PREAMBULO = '\n'.join(_lpu[_desde:_hasta]) + '\n'

TMP = tempfile.mkdtemp()
os.chmod(TMP, 0o755)
INFORME = os.path.join(TMP, 'informe.txt')
corrida = os.path.join(TMP, 'corrida.sh')
with open(corrida, 'w', encoding='utf-8') as h:
    h.write(ANDAMIAJE)
    h.write(PREAMBULO)
    h.write(f'\ncp "$DATA/p1.txt" {INFORME}\n')

r = subprocess.run(['bash', corrida], capture_output=True, text=True)
informe = rd(INFORME) if os.path.exists(INFORME) else ''

# EL CANARIO. La tercera mitad del informe lista las políticas de `profiles`,
# y esa consulta devuelve filas siempre que la base esté viva. Sin ella, la
# corrida no midió nada y las comprobaciones de abajo serían verdes por
# silencio — el mismo verde por no haber podido preguntar que este repo
# encontró el 17 de noviembre en el arnés de la RLS.
ok('la base levantó y el informe de la puesta al día contestó',
   'POLÍTICA EN profiles ·' in informe,
   (r.stderr or r.stdout).strip().split('\n')[-1][:160]
   or 'el informe salió vacío')
if 'POLÍTICA EN profiles ·' not in informe:
    sys.exit(1)

ok('la puesta al día corrió sin un solo ERROR',
   not re.search(r'^(ERROR|psql.*ERROR)', informe, re.M),
   '; '.join(re.findall(r'^.*ERROR.*$', informe, re.M)[:3])[:200])

# QUÉ .sql APLICA ESTE PREÁMBULO, LEÍDO DEL PREÁMBULO Y NO SUPUESTO.
#
# El primer intento dio por aplicadas las migraciones desde 20261009 —que es
# lo que aplica OTRA lente, la del esquema— y acá no se aplica ninguna: este
# preámbulo corre el andamiaje, `sala-de-mando.sql` y la puesta al día, y
# nada más. Con la suposición escrita a mano, dos tablas que faltan por eso
# —`fallas_vistas` y `transcripciones_recibidas`— salían como promesa
# incumplida. La diferencia entre suponer y preguntar, otra vez.
_APLICA = re.compile(r'psqlq\s+-f\s+"?([^\s"]+)"?')
_BUCLE = re.compile(r'ls\s+supabase/migrations/\*\.sql.*?\$NF\s*>=\s*"(\d+)"', re.S)
aplicados = set()
for _m in _APLICA.finditer(PREAMBULO):
    _ruta = _m.group(1)
    if 'puesta.sql' in _ruta:          # la copia de la puesta al día en $DATA
        aplicados.add(PUESTA)
    elif _ruta.endswith('.sql') and not _ruta.startswith('$'):
        aplicados.add(_ruta)
_m = _BUCLE.search(PREAMBULO)
CORTE_MIGRACIONES = _m.group(1) if _m else None

ok('el preámbulo aplica la puesta al día, que es lo que esta lente mide',
   PUESTA in aplicados,
   f'aplica {sorted(aplicados) or "nada"}: sin la puesta al día no hay '
   'informe que leer')


def aplicado(f):
    if f in aplicados:
        return True
    return (CORTE_MIGRACIONES is not None
            and f.startswith('supabase/migrations/')
            and os.path.basename(f) >= CORTE_MIGRACIONES)


def explicada(nombre, crea):
    """Una falta explicada: o la crea un .sql que acá no se aplica, o es uno
    de los cuatro huecos del panel."""
    if nombre in HUECOS_DEL_PANEL:
        return True
    quienes = crea.get(nombre, set())
    return bool(quienes) and not any(aplicado(f) for f in quienes)


_faltas_tb = re.findall(r'FALTA TABLA · ([a-z_0-9]+)', informe)
_faltas_fn = re.findall(r'FALTA FUNCIÓN · ([a-z_0-9]+)', informe)
_sin_explicar = ([('tabla', t) for t in _faltas_tb if not explicada(t, crea_tabla)]
                 + [('función', f) for f in _faltas_fn if not explicada(f, crea_fn)])
ok('cada FALTA que imprime el informe tiene explicación',
   not _sin_explicar,
   '; '.join(f'{c} {n}' for c, n in _sin_explicar[:6])
   + ' — la crea un .sql que ESTE andamiaje sí aplica, así que la puesta al '
     'día la promete y no la entrega')

print()
print(f'  {len(lista_tb)} tablas y {len(lista_fn)} funciones en el informe; '
      f'{len(crea_tabla)} tablas y {len(crea_fn)} funciones creadas por el repo; '
      f'{len(_faltas_tb) + len(_faltas_fn)} faltas impresas, todas explicadas'
      if not _sin_explicar else
      f'  {len(_sin_explicar)} faltas sin explicación')
sys.exit(1 if fallas else 0)
