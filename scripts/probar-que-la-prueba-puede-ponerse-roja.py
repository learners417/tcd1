#!/usr/bin/env python3
"""¿La batería se pone ROJA cuando una prueba de escenario no puede ponerse roja?

Medido el 15 de noviembre de 2026: de las 133 `prueba-*.ts`, `prueba-cadena.ts`
era la única sin `process.exit`. Imprimía `✗` por cada escenario mal
diagnosticado y terminaba en 0, y el bloque 10 la juzgaba SOLO por el código de
salida. Con `encontrarDomino` ignorando el primer eslabón roto, cinco de sus
seis escenarios decían «La cadena está sana» a un cliente que no cobra, y la
batería daba las 133 en verde y «el ZIP puede salir».

Se cerró por los dos lados, y acá se prueban los dos contra su propio fallo:

  1. el bloque 10, que ahora lee los renglones `✗` además del código: una
     prueba que imprime su rojo y termina en 0 tiene que quedar en la lista de
     rojas;
  2. la lente nueva, que exige que cada `prueba-*.ts` tenga un
     `process.exit(` con argumento distinto del cero literal: la prueba sin
     salida roja, y la que sale con 0 fijo, tienen que ponerla ROJA, y la que
     delega en otro proceso (`process.exit(r.status ?? 1)`) tiene que dejarla
     verde.

Los defectos se ponen EN MEMORIA, sobre el contenido de los archivos de verdad.
No se toca nada en el disco.

Corre: python3 scripts/probar-que-la-prueba-puede-ponerse-roja.py   (desde la raíz)
"""
import glob
import os
import re
import sys


def rd(f):
    return open(f, encoding='utf-8', errors='replace').read()


_RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
_bat = rd(os.path.join(_RAIZ, 'auditoria.py'))


def _trozo(desde, hasta):
    _i = _bat.index(desde)
    _t = _bat[_i:_bat.index(hasta, _i)]
    # Si el corte se come la línea que corre ESTA prueba desde la batería, la
    # lente se llamaría a sí misma y el rojo saldría por un NameError que no
    # dice nada. Se avisa acá, con nombre.
    if 'probar-que-la-prueba-puede-ponerse-roja' in _t:
        print(f'  ✗ el trozo que empieza en «{desde[:40]}» llega hasta la línea '
              'que corre esta prueba: mover el corte')
        sys.exit(1)
    return _t


# El limpiador de comentarios de la batería, tal como está escrito hoy.
_gl = {'re': re}
exec(compile(_trozo('def _sin_comentario_al_final', '# ── Ayudante: ¿una tab del Admin'),
             'limpiador', 'exec'), _gl)
solo_codigo = _gl['solo_codigo']

FALLAS = []


def espera(nombre, ok, detalle=''):
    print(('  ✓ ' if ok else '  ✗ ') + nombre + (f' — {detalle}' if detalle and not ok else ''))
    if not ok:
        FALLAS.append(nombre)


class _Globs:
    """El `glob` que la lente usa, con la lista de archivos que le damos."""

    def __init__(self, archivos):
        self._archivos = archivos

    def glob(self, _patron, recursive=False):
        return list(self._archivos)


def correr_la_lente(contenidos):
    """La lente nueva, sacada de la batería, sobre los contenidos dados."""
    _ns = {
        '_re16': re,
        '_g16': _Globs(sorted(contenidos)),
        'rdc': lambda f: solo_codigo(contenidos[f], f),
        'check': lambda n, ok, d='': _ns.setdefault('_r', []).append((n, ok, d)),
    }
    # El corte va ANTES de la línea que corre ESTA prueba desde la batería:
    # si entra en el trozo, la lente se llama a sí misma.
    exec(compile(_trozo('def _arg_del_exit16',
                        '# Y la prueba de que las dos guardas sirven'),
                 'lente', 'exec'), _ns)
    _n, _ok, _d = _ns['_r'][-1]
    return _ok, _d


def correr_el_bloque10(salidas):
    """El veredicto del bloque 10, sacado de la batería, sobre las salidas dadas."""
    _ns = {'_salidas': salidas, 'PENDIENTES_DE_CONTENIDO': set()}
    exec(compile(_trozo('_rojas, _pendientes = [], []', "check(f'las {len(_pruebas)}"),
                 'bloque10', 'exec'), _ns)
    return _ns['_rojas']


print('\n══ 1) el bloque 10: una prueba que imprime su rojo y termina en 0 ══')
_verde = [('scripts/prueba-x.ts', 0, '✓ todo bien\n\n✓ TODO EN VERDE\n')]
_mentirosa = [('scripts/prueba-x.ts', 0, '✗ el dominó se equivoca\n\n3 FALLAS\n')]
espera('la prueba en verde de verdad no entra en la lista de rojas',
       correr_el_bloque10(_verde) == [])
espera('la que imprime `✗` y termina en 0 SÍ entra (antes del 15 no entraba)',
       correr_el_bloque10(_mentirosa) == ['prueba-x.ts'],
       f'devolvió {correr_el_bloque10(_mentirosa)}')
espera('y la que termina en rojo sin imprimir nada también',
       correr_el_bloque10([('scripts/prueba-y.ts', 1, '')]) == ['prueba-y.ts'])

print('\n══ 2) la lente: cada prueba tiene que poder ponerse roja ══')
_reales = {f: rd(os.path.join(_RAIZ, f))
           for f in sorted(glob.glob('scripts/prueba-*.ts', root_dir=_RAIZ))}
_ok, _d = correr_la_lente(_reales)
espera(f'main, con sus {len(_reales)} pruebas, está en verde', _ok, _d)

_cadena = 'scripts/prueba-cadena.ts'
_sin_salida = dict(_reales)
_sin_salida[_cadena] = '\n'.join(
    l for l in _reales[_cadena].split('\n') if 'process.exit' not in l)
_ok, _d = correr_la_lente(_sin_salida)
espera('con la salida roja sacada de `prueba-cadena.ts`, la lente se pone ROJA',
       not _ok and 'prueba-cadena.ts' in _d, _d or 'dio verde')

_cero = dict(_reales)
_cero[_cadena] = _reales[_cadena].replace(
    'process.exit(ok === casos.length ? 0 : 1);', 'process.exit(0);')
espera('y con un `process.exit(0)` fijo, también',
       not correr_la_lente(_cero)[0], 'dio verde con el cero fijo')

_comentada = dict(_reales)
_comentada[_cadena] = _reales[_cadena].replace(
    'process.exit(ok === casos.length ? 0 : 1);',
    '// process.exit(ok === casos.length ? 0 : 1);')
espera('y con la salida roja COMENTADA, también (se mide el código, no el texto)',
       not correr_la_lente(_comentada)[0], 'dio verde con la salida comentada')

_delega = dict(_reales)
_delega[_cadena] = _reales[_cadena].replace(
    'process.exit(ok === casos.length ? 0 : 1);', 'process.exit(r.status ?? 1);')
espera('la que delega su rojo en otro proceso queda VERDE (no es un falso rojo)',
       correr_la_lente(_delega)[0], 'la puso roja sin motivo')

print()
if FALLAS:
    print(f'════ {len(FALLAS)} FALLOS ════')
    sys.exit(1)
print('════ LAS DOS GUARDAS SE PONEN ROJAS CON SU PROPIO DEFECTO ════')
