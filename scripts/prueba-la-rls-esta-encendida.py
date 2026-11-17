#!/usr/bin/env python3
"""
LA RLS ENCENDIDA — la política que nadie enciende, y la tabla que el
navegador toca sin ninguna.

POR QUÉ EXISTE. Medido el 17 de noviembre de 2026: de las 921 miradas de TCD,
NINGUNA preguntaba por la RLS. La única excepción es `profiles`, cuyo
aislamiento `scripts/prueba-puesta-al-dia.sh` sí ejecuta de verdad. Las otras
41 tablas que el navegador toca tienen su política escrita y nunca ejecutada,
y 67 tablas del repo tienen su RLS encendida sin que nada lo vigile.

Y la RLS tiene una trampa que no tiene ninguna otra parte del SQL:

    UNA POLÍTICA SOBRE UNA TABLA CON LA RLS APAGADA NO HACE NADA.

PostgreSQL la acepta, la guarda en el catálogo, `pg_policies` la muestra, y no
filtra ni una fila. No hay error, no hay aviso, y al leer el `.sql` la tabla
parece cuidada: tiene su `create policy` con su `using` bien escrito. Lo único
que la enciende es un `alter table … enable row level security` en OTRA
sentencia, muchas veces en OTRO archivo. Es la misma forma de todo lo que este
repo encontró entre el 13 y el 17 de noviembre: la lente verde porque no pudo
preguntar.

LAS TRES TRAMPAS DE MEDIR ESTO CON TEXTO, y las tres me las comí midiendo:

  1 · LA CAJA DE LAS LETRAS. Este repo escribe el SQL de las dos maneras:
      de los 72 `enable row level security`, **35 están en MAYÚSCULAS y 37 en
      minúsculas**, y de las 210 políticas, 111 en mayúsculas. El primer
      intento de medir esto buscó en minúsculas y dio por ABIERTAS a
      `hoja_de_ruta`, `mensajes` y `notificaciones` —tres tablas cerradas—,
      que es la peor forma de equivocarse: manda a arreglar lo que está sano.
      Por eso todo va con `re.I`.
  2 · `sala-de-mando.sql` no las enciende escribiendo el nombre: corre un
      `do $$` con `format('alter table %I enable row level security', t)`
      sobre un ARRAY de once nombres escrito a mano. Ninguna de las once
      aparece en un `alter table` literal.
  3 · Y el comentario: medir sobre el crudo es contar una tabla que alguien
      dejó comentada. Por eso el texto pasa por `solo_codigo(…, archivo)`,
      el limpiador de la batería, que sabe que el `.sql` comenta con `--`.

Corre: python3 scripts/prueba-la-rls-esta-encendida.py   (desde la raíz)
"""
import glob
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rd(f):
    return open(f, encoding='utf-8', errors='replace').read()


# El limpiador de la batería, sin ejecutar la batería: se corta el trozo y se
# compila. Copiarlo a mano sería una cuarta copia de la misma regla, que es
# justo el defecto que este repo cerró el 16 de noviembre en el puente.
_bat = rd(os.path.join(RAIZ, 'auditoria.py'))
_g = {'re': re}
exec(compile(_bat[_bat.index('def _sin_comentario_al_final'):
                  _bat.index('# ── Ayudante: ¿una tab del Admin')],
             'limpiador', 'exec'), _g)
solo_codigo = _g['solo_codigo']


def rdc(f):
    """El archivo sin comentarios, en el idioma de SU extensión."""
    return solo_codigo(rd(f), f)


fallas = 0


def ok(nombre, cond, detalle=''):
    global fallas
    if cond:
        print(f'  ✓ {nombre}')
    else:
        fallas += 1
        print(f'  ✗ {nombre}' + (f' — {detalle}' if detalle else ''))


# ── LAS EXCEPCIONES, DECLARADAS Y CON SU MOTIVO ────────────────────────────
#
# Una excepción escondida es una tabla abierta que nadie va a volver a mirar.
# Escritas acá, con el motivo, y atadas por la lente de abajo: si el repo
# empieza a proteger una de éstas, la línea sobra y la lente lo dice. Así la
# lista no se podre.
#
# `objects` es `storage.objects`, de Supabase: nace con la RLS encendida y
# ningún proyecto la enciende con un `.sql`. Las políticas del repo sobre ella
# —los adjuntos de las tareas, los creativos, los archivos de los mensajes—
# sí son del repo, y por eso aparece con política y sin `alter table`.
DE_SUPABASE = {
    'objects': 'storage.objects: Supabase la entrega con la RLS ya encendida',
}

# Las dos tablas que el navegador toca y NINGÚN .sql del repo crea ni
# enciende: nacieron a mano en el panel de Supabase, igual que `profiles` y
# `mensajes` —con la diferencia de que a esas dos sí las enciende un `.sql`
# del repo (`fix-supabase.sql` y `20260505_rls_advisor_fixes.sql`)—.
#
# Lo que esto significa, y es el motivo de que estén escritas acá y no
# ignoradas en silencio: su protección vive SOLO en el panel, donde ningún
# archivo la puede leer y ninguna lente la puede medir. Si Javo rearma el
# proyecto desde el repo —que es exactamente para lo que existe
# `poner-al-dia-la-base.sql`—, las 40 restantes llegan cerradas y estas dos
# llegan desnudas. Y `diario_entradas` es lo más íntimo que guarda la app.
#
# Que hoy estén cerradas en producción es lo más probable: `get_user_diary`
# es `security definer` justo para que el equipo pueda leer el diario de un
# cliente, y una función así no haría falta con la tabla abierta. Pero
# «lo más probable» no es una medición, y por eso son una DEUDA anotada y no
# un verde: el día que alguien las ponga en un `.sql`, estas dos líneas
# sobran y la lente de abajo lo marca.
SOLO_EN_EL_PANEL = {
    'diario_entradas': 'nació en el panel; su RLS no está en ningún .sql del '
                       'repo. El equipo la lee con get_user_diary (security '
                       'definer), que es la señal de que en producción está '
                       'cerrada — pero el repo no la cierra',
    'session_logs': 'nació en el panel; su RLS no está en ningún .sql del '
                    'repo. Es el progreso del cliente en El Camino',
}


# ── 1 · QUÉ TABLAS ENCIENDE EL REPO, Y SOBRE CUÁLES ESCRIBE POLÍTICAS ──────
_ENCIENDE = re.compile(
    r'alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?"?([a-z_0-9]+)"?'
    r'\s+enable\s+row\s+level\s+security', re.I | re.S)
_POLITICA = re.compile(
    r'create\s+policy\s+(?:"[^"]*"|[a-z_0-9]+)\s+on\s+'
    r'(?:public\.|storage\.)?"?([a-z_0-9]+)"?', re.I | re.S)
# La forma 2: el `format()` del `do $$`, que enciende por un array de nombres.
_ENCIENDE_POR_ARRAY = re.compile(
    r"format\(\s*'alter\s+table\s+%I\s+enable\s+row\s+level\s+security'", re.I)
_NOMBRE_EN_ARRAY = re.compile(r"'([a-z_0-9]+)'")


def sqls():
    return (sorted(glob.glob(os.path.join(RAIZ, 'supabase/migrations/*.sql')))
            + sorted(glob.glob(os.path.join(RAIZ, '*.sql'))))


encendidas, con_politica, por_array = set(), {}, {}
for _f in sqls():
    _rel = os.path.relpath(_f, RAIZ)
    _t = rdc(_f)
    encendidas |= {_m.group(1).lower() for _m in _ENCIENDE.finditer(_t)}
    for _m in _POLITICA.finditer(_t):
        con_politica.setdefault(_m.group(1).lower(), set()).add(_rel)
    if _ENCIENDE_POR_ARRAY.search(_t):
        for _a in re.finditer(r'array\s*\[(.*?)\]', _t, re.S | re.I):
            _nombres = {_n.lower() for _n in _NOMBRE_EN_ARRAY.findall(_a.group(1))}
            encendidas |= _nombres
            por_array.setdefault(_rel, set()).update(_nombres)

# El canario: una lente que no leyó nada se pone VERDE por no haber podido
# preguntar, que es peor que no tenerla. Misma regla que la base del bloque 10.
ok('se leyeron los .sql del repo y hay RLS encendida que medir',
   len(sqls()) > 20 and len(encendidas) > 20,
   f'{len(sqls())} archivos .sql y {len(encendidas)} tablas encendidas: '
   'la lente no midió nada')

# ── 2 · LA POLÍTICA INERTE ─────────────────────────────────────────────────
_inertes = sorted(t for t in con_politica
                  if t not in encendidas and t not in DE_SUPABASE)
ok('ninguna política vive sobre una tabla con la RLS apagada',
   not _inertes,
   '; '.join(f'{t} (política en {", ".join(sorted(con_politica[t]))})'
             for t in _inertes)
   + ' — PostgreSQL la acepta y no filtra NADA: la tabla parece cuidada y '
     'está abierta')

# ── 3 · LA TABLA QUE EL NAVEGADOR TOCA ─────────────────────────────────────
_DESDE = re.compile(r"\.from\(\s*['\"]([a-z_0-9]+)['\"]\s*\)")
toca = {}
for _f in (glob.glob(os.path.join(RAIZ, 'src/**/*.ts'), recursive=True)
           + glob.glob(os.path.join(RAIZ, 'src/**/*.tsx'), recursive=True)):
    for _m in _DESDE.finditer(rdc(_f)):
        toca.setdefault(_m.group(1).lower(), set()).add(os.path.relpath(_f, RAIZ))

ok('el navegador toca tablas que medir', len(toca) > 20,
   f'solo {len(toca)}: la lente no midió nada')

_desnudas = sorted(t for t in toca
                   if t not in encendidas and t not in SOLO_EN_EL_PANEL
                   and t not in DE_SUPABASE)
ok('toda tabla que el navegador toca la enciende un .sql del repo',
   not _desnudas,
   '; '.join(f'{t} ({", ".join(sorted(toca[t])[:2])})' for t in _desnudas)
   + ' — la clave anónima viaja en el bundle, así que sin RLS esa tabla la '
     'lee cualquiera. Si su protección vive solo en el panel, se declara en '
     'SOLO_EN_EL_PANEL con el motivo')

# ── 4 · Y LAS DOS LISTAS DE EXCEPCIONES, ATADAS ────────────────────────────
#
# El defecto de la lista escrita a mano no es solo lo que le falta: es lo que
# le sobra. Una excepción que ya no hace falta deja una tabla fuera de la
# medición para siempre. Es lo que pasó con la lista de nueve nombres del 14
# de noviembre y con las tres copias del contrato del puente del 16.
_sobran_panel = sorted(t for t in SOLO_EN_EL_PANEL if t in encendidas)
ok('ninguna excepción del panel sigue escrita cuando el repo ya la enciende',
   not _sobran_panel,
   ', '.join(_sobran_panel) + ' — el repo ya las enciende: sacarlas de '
   'SOLO_EN_EL_PANEL para que vuelvan a medirse')
_sobran_supa = sorted(t for t in DE_SUPABASE if t in encendidas)
ok('ninguna excepción de Supabase sigue escrita cuando el repo ya la enciende',
   not _sobran_supa, ', '.join(_sobran_supa))

# ── 5 · EL ARRAY ESCRITO A MANO DE LA SALA, ATADO A SUS PROPIAS TABLAS ─────
#
# `sala-de-mando.sql` enciende once tablas por un array de nombres escrito a
# mano dentro de un `do $$`. Hoy están las once. Pero la tabla doce nace
# ABIERTA y en silencio: el `create table` no exige estar en el array, y
# ninguna de las lentes de arriba lo vería porque la tabla sería nueva y el
# navegador la tocaría recién después. Esto lo ata: cada tabla que ESE
# archivo crea tiene que estar en SU array.
_SALA = os.path.join(RAIZ, 'sala-de-mando.sql')
if os.path.exists(_SALA):
    _t = rdc(_SALA)
    _crea = {_m.group(1).lower() for _m in re.finditer(
        r'create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_0-9]+)"?',
        _t, re.I)}
    _en_array = por_array.get('sala-de-mando.sql', set())
    ok('el array de la sala tiene nombres', bool(_en_array),
       'no encontré el array del `format(alter table %I enable row level '
       'security)`: si cambió de forma, esta lente dejó de medir')
    _sin_encender = sorted(t for t in _crea if t not in encendidas)
    ok('toda tabla que crea sala-de-mando.sql queda con la RLS encendida',
       not _sin_encender,
       ', '.join(_sin_encender) + ' — la crea pero no la nombra en el array '
       'del do $$, así que nace abierta')
else:
    ok('existe sala-de-mando.sql', False, 'falta el archivo')

print()
print(f'  {len(encendidas)} tablas con la RLS encendida por un .sql; '
      f'{len(con_politica)} con política escrita; '
      f'{len(toca)} que el navegador toca; '
      f'{len(SOLO_EN_EL_PANEL)} protegidas solo en el panel (deuda anotada)')
sys.exit(1 if fallas else 0)
