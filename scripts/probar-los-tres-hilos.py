#!/usr/bin/env python3
"""¿Las cinco lentes de los tres hilos se ponen ROJAS con su propio defecto?

El 15 de noviembre el día dejó de mostrar solo el hilo del sistema —título,
lo que se lleva, los minutos y los pasos— y pasó a mostrar también los dos
que faltaban: adentro (la lección del libro y la pausa de 5) y afuera (el
paso afuera, diez minutos, opcional). Estas cinco lentes son las que impiden
que vuelva a quedarse a mitad de camino:

  · «los tres hilos están en las 91 jornadas del seed»
  · «las 33 lecciones del lago están, numeradas del 1 al 33 y sin repetirse»
  · «ninguna pausa del día está fuera del repertorio»
  · «el paso afuera va solo los días en que la app no pide nada visible»
  · «la pantalla del día muestra los tres hilos, en los dos montajes»

La última es la que importa de verdad, porque es la forma en que esto se
rompe en esta app: el dato existe y nadie lo dibuja. Pasó antes con la
lección escrita de los 37 guiones —vive en `guionesVideos.ts` desde julio y
la pantalla del día no la mostró nunca, porque su rama solo corre cuando NO
hay video y el montaje solo ocurre cuando SÍ hay—. Así que acá se prueba
también el caso del rótulo escondido dentro de un comentario.

El veredicto NO se copia: se saca de `auditoria.py` entre sus marcas
`#.HILOS.*`, se le da de comer el archivo de verdad con el defecto puesto EN
MEMORIA, y se mira si dice lo que tiene que decir. Si alguien ablanda una
lente allá, esta prueba se entera acá.

Corre: python3 scripts/probar-los-tres-hilos.py   (desde la raíz)
"""
import json
import os
import re
import sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
BAT = open(os.path.join(RAIZ, 'auditoria.py'), encoding='utf-8').read()
SEED = 'src/lib/roadmap.seed.json'
PAGINA = 'src/pages/Roadmap.tsx'
PANTALLA = 'src/components/sesion/SesionViva.tsx'

fallas = 0


def ok(cond, msg):
    global fallas
    if not cond:
        fallas += 1
    print(('  ✓ ' if cond else '  ✗ ') + msg)


def _rd(f):
    return open(os.path.join(RAIZ, f), encoding='utf-8', errors='replace').read()


# El limpiador de comentarios de la batería, tal como vive hoy allá: la lente
# de la pantalla mide sobre el código sin comentarios y esta prueba tiene que
# usar el mismo, no una copia.
_LIMPIA = {'re': re}
exec(compile(BAT[BAT.index('def _sin_comentario_al_final'):
                 BAT.index('# ── Ayudante: ¿una tab del Admin')], 'limpiador', 'exec'), _LIMPIA)


def tramo(nombre):
    a = BAT.index(f'#.HILOS.{nombre}.INICIO') + len(f'#.HILOS.{nombre}.INICIO')
    b = BAT.index(f'#.HILOS.{nombre}.FIN')
    return BAT[a:b]


def correr(nombre, falsos=None):
    """Ejecuta la lente con los archivos dados (ruta → contenido) pisados."""
    falsos = falsos or {}

    def rd(f):
        return falsos[f] if f in falsos else _rd(f)

    def rdc(f):
        return _LIMPIA['solo_codigo'](rd(f), f)

    veredictos = {}

    def check(titulo, cond, detalle=''):
        veredictos[titulo] = bool(cond)

    g = {'rd': rd, 'rdc': rdc, 'check': check, '_jh': json, 're': re,
         'json': json, 'os': os}
    exec(compile(tramo(nombre), f'lente-{nombre}', 'exec'), g)
    return veredictos


def seed_con(cambio):
    """El seed de verdad con un cambio aplicado, en memoria."""
    d = json.loads(_rd(SEED))
    cambio(d)
    return json.dumps(d, ensure_ascii=False, indent=2)


L_CAMPOS = 'los tres hilos están en las 91 jornadas del seed'
L_LAGO = 'las 33 lecciones del lago están, numeradas del 1 al 33 y sin repetirse'
L_PAUSA = 'ninguna pausa del día está fuera del repertorio'
L_AFUERA = 'el paso afuera va solo los días en que la app no pide nada visible'
L_PANT = 'la pantalla del día muestra los tres hilos, en los dos montajes'

print('══ en verde, con los archivos de verdad ══')
v = correr('DATO')
v.update(correr('PANTALLA'))
for nombre in (L_CAMPOS, L_LAGO, L_PAUSA, L_AFUERA, L_PANT):
    ok(v.get(nombre) is True, f'«{nombre}» da verde hoy')

print('══ y en rojo, con el defecto puesto ══')


def _sin_campos(d):
    for j in d['jornadas']:
        if j['dia'] == 40:
            del j['leccion']
            del j['pausa']
            del j['paso_afuera']


ok(correr('DATO', {SEED: seed_con(_sin_campos)})[L_CAMPOS] is False,
   'si una jornada vuelve a quedarse sin los tres campos, la lente del dato se pone roja')


def _una_leccion_menos(d):
    for j in d['jornadas']:
        if j['dia'] == 74:          # la lección 3, la del reencuentro
            j['leccion'] = []


ok(correr('DATO', {SEED: seed_con(_una_leccion_menos)})[L_LAGO] is False,
   'si se cae una de las 33 del lago, la lente de las lecciones se pone roja')


def _leccion_repetida(d):
    for j in d['jornadas']:
        if j['dia'] == 74:
            j['leccion'][0]['numero'] = 1    # ya existe, en el día 1


ok(correr('DATO', {SEED: seed_con(_leccion_repetida)})[L_LAGO] is False,
   'y si dos lecciones comparten número, también: el número lo nombran 19 videos')


def _titulo_vacio(d):
    for j in d['jornadas']:
        if j['dia'] == 90:
            j['leccion'][0]['titulo'] = ''


ok(correr('DATO', {SEED: seed_con(_titulo_vacio)})[L_LAGO] is False,
   'y si una lección se queda sin título, también')


def _pausa_inventada(d):
    for j in d['jornadas']:
        if j['dia'] == 19:
            j['leccion'][0]['pausa'] = 'respiracion-cuadrada'
            j['pausa']['id'] = 'respiracion-cuadrada'


ok(correr('DATO', {SEED: seed_con(_pausa_inventada)})[L_PAUSA] is False,
   'si un día estrena una pausa que no está en el repertorio, la lente de la pausa se pone roja')


def _repertorio_vacio(d):
    d['pausas'] = []


ok(correr('DATO', {SEED: seed_con(_repertorio_vacio)})[L_PAUSA] is False,
   'y si el repertorio se vacía, no da verde por no tener con qué comparar')


def _afuera_en_dia_de_campo(d):
    for j in d['jornadas']:
        if j['acciones_campo'] and not j['paso_afuera']:
            j['paso_afuera'] = 'Graba una historia con tu cara y publícala.'
            return


ok(correr('DATO', {SEED: seed_con(_afuera_en_dia_de_campo)})[L_AFUERA] is False,
   'si el paso afuera cae en un día que ya pide salir al mundo, su lente se pone roja')


def _afuera_de_menos(d):
    for j in d['jornadas']:
        if j['dia'] == 43:
            j['paso_afuera'] = None


ok(correr('DATO', {SEED: seed_con(_afuera_de_menos)})[L_AFUERA] is False,
   'y si uno de los 28 días se queda sin el suyo, también')

# ── la pantalla ────────────────────────────────────────────────────────────
_pag = _rd(PAGINA)
_pan = _rd(PANTALLA)

ok(correr('PANTALLA', {PAGINA: _pag.replace('hilos={hilosDeHoy(meta)}', '', 1)})[L_PANT] is False,
   'si UNO de los dos montajes deja de pasar los hilos, la lente de la pantalla se pone roja')

ok(correr('PANTALLA', {PAGINA: _pag.replace('hilos={hilosDeHoy(meta)}', '')})[L_PANT] is False,
   'y si los deja de pasar los dos, también')

ok(correr('PANTALLA', {PANTALLA: _pan.replace('Tu pausa de 5', 'Tu pausa')})[L_PANT] is False,
   'si el rótulo de la pausa cambia de nombre, la lente se pone roja')

# El caso que ya pasó cuatro veces en este repo: el rótulo sigue en el
# archivo pero dentro de un comentario, así que no dibuja nada.
_comentado = _pan.replace('                    Tu paso afuera · 10 min',
                          '                    {/* Tu paso afuera · 10 min */}')
ok('Tu paso afuera' in _comentado,
   'el defecto del comentario deja el rótulo en el archivo (si no, la prueba no probaría nada)')
ok(correr('PANTALLA', {PANTALLA: _comentado})[L_PANT] is False,
   'y con el rótulo escondido dentro de un comentario, la lente se pone roja igual')

ok(correr('PANTALLA', {PANTALLA: _pan.replace('hilos.pasoAfuera', '_sinUsar')})[L_PANT] is False,
   'si la pantalla deja de leer el hilo de afuera, la lente se pone roja')

# ── y las guardas del generador, que son la otra mitad ─────────────────────
# `colgar_los_hilos` se cae a propósito en vez de escribir un seed mudo. Si
# esas tres guardas se ablandan, el error aparece en el teléfono de un
# cliente y no en la corrida del generador.
print('══ las guardas del generador se caen con la tabla mal ══')
sys.path.insert(0, os.path.join(RAIZ, 'tcd-spec', 'datos'))
import tres_hilos as TH   # noqa: E402


def _camino_de_prueba():
    """Un camino mínimo con los días que las tablas de verdad usan."""
    return {d: {'dia': d, 'acciones_campo': []} for d in range(0, 91)}


def _se_cae(cambios, que):
    """¿`colgar_los_hilos` se cae con ese cambio puesto en la tabla?"""
    viejo = {k: getattr(TH, k) for k in cambios}
    for k, v in cambios.items():
        setattr(TH, k, v)
    try:
        TH.colgar_los_hilos(_camino_de_prueba())
        return False
    except SystemExit:
        return True
    finally:
        for k, v in viejo.items():
            setattr(TH, k, v)


ok(not _se_cae({}, None), 'con las tablas de verdad, el generador no se cae')
ok(_se_cae({'LECCIONES': [('lago', 1, 'x', 999, 'f', None, None, 'l')]}, None),
   'una lección en un día que no existe en el camino: se cae')
ok(_se_cae({'LECCIONES': [('lago', 1, 'x', 1, 'f', 'no-existe', None, 'l')]}, None),
   'una pausa que no está en el repertorio: se cae')
ok(_se_cae({'LECCIONES': [('lago', 1, 'x', 1, 'f', None, None, 'l'),
                          ('lago', 1, 'y', 2, 'f', None, None, 'l')]}, None),
   'dos lecciones con el mismo número: se cae')
ok(_se_cae({'DIAS_PASO_AFUERA': [999]}, None),
   'un paso afuera en un día que no existe: se cae')


def _con_campo():
    c = _camino_de_prueba()
    c[1]['acciones_campo'] = ['publicar algo']
    return c


try:
    TH.colgar_los_hilos(_con_campo())
    ok(False, 'un paso afuera en un día que ya pide salir al mundo: se cae')
except SystemExit:
    ok(True, 'un paso afuera en un día que ya pide salir al mundo: se cae')

print()
if fallas:
    print(f'✗ {fallas} FALLAS: alguna lente de los tres hilos no sabe ponerse roja')
    sys.exit(1)
print('✓ las cinco lentes de los tres hilos saben ponerse rojas')
