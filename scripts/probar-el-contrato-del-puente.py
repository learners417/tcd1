#!/usr/bin/env python3
"""¿La batería ve cuando las DOS PUNTAS DEL PUENTE dejan de llamarse igual?

El puente entre TCD y MiClínica tiene un lado en cada repo, y su contrato
—los nombres de los campos que viajan— estaba escrito a mano en TRES copias
que nadie ataba entre sí:

  · lo que MCD escribe   → `NextResponse.json({…})` en el repo de MCD
  · la lista de MCD      → `CONTRATO = [...]` en la auditoría de MCD
  · lo que TCD lee       → `data?.…` en `api/mcd-bridge.ts`, y el MCD FALSO
                            de `prueba-el-puente-de-las-dos-apps.ts`

MEDIDO EL 16 DE NOVIEMBRE DE 2026, poniendo el defecto de verdad:

  | el defecto puesto                                 | las dos baterías  |
  |---------------------------------------------------|-------------------|
  | TCD lee `data?.totalUsd` (renombra de su lado)    | **roja** (la 15)  |
  | MCD emite `fecha_primer_cobro` y arregla su lista | las dos EN VERDE  |

El segundo es el que pasa en la vida real: el que renombra el campo está
editando MCD, y arreglar la lista de su propia batería es el movimiento
natural. Después de eso MCD daba sus 74 en verde, TCD sus 15, y en producción
el puente contestaba `cobro_verificado: false` para TODO cliente que cobró —el
Cinturón Rojo no llega nunca, el candado del día 31 no se abre nunca, en
silencio— que es exactamente la ceguera que el encabezado de
`api/mcd-bridge.ts` dice que existe para evitar.

Esto es lo que obliga a la lente nueva a seguir viendo. No corre la batería
entera: le saca el trozo marcado a `auditoria.py` y lo evalúa con un `check`
de juguete y un lector que sirve el archivo PARCHEADO. Nada del disco se toca.

Corre: python3 scripts/probar-el-contrato-del-puente.py   (desde la raíz)
"""
import os
import re
import sys
import tempfile

_RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


def _rd_real(f):
    return open(f, encoding='utf-8', errors='replace').read()


# El limpiador de comentarios SALE DE LA BATERÍA, no se vuelve a escribir acá:
# una copia propia podría quedarse atrás justo en lo que el otro arregló.
_bat = _rd_real(os.path.join(_RAIZ, 'auditoria.py'))
_g = {'re': re}
exec(compile(_bat[_bat.index('def _sin_comentario_al_final'):
                  _bat.index('# ── Ayudante: ¿una tab del Admin')], 'limpiador', 'exec'), _g)
_solo_codigo = _g['solo_codigo']

# Y el trozo que se prueba, por sus marcas. Si las marcas no están, esto no
# mide nada y lo dice: una prueba que no encuentra su lente no está verde.
_INI, _FIN = '#.LENTE.CONTRATO.INI', '#.LENTE.CONTRATO.FIN'
if _INI not in _bat or _FIN not in _bat:
    print(f'  ✗ no encontré {_INI}/{_FIN} en auditoria.py: la lente del contrato '
          'se movió o se borró, y esta prueba no midió nada')
    sys.exit(1)
_trozo = _bat[_bat.index(_INI) + len(_INI):_bat.index(_FIN)]


def correr(parches, mcd_raiz):
    """Evalúa el trozo con los archivos parcheados. Devuelve los ✗ de la lente.

    `parches` es {sufijo-de-ruta: [(viejo, nuevo), …]}.
    """
    rojas = []

    def check(nombre, ok, detalle=''):
        if not ok:
            rojas.append(f'{nombre} — {detalle}'.strip(' —'))

    def rd(f):
        s = _rd_real(f)
        for sufijo, pares in parches.items():
            if f.endswith(sufijo):
                for viejo, nuevo in pares:
                    if s.count(viejo) != 1:
                        raise AssertionError(
                            f'el texto del defecto aparece {s.count(viejo)} veces en {f}, '
                            f'no una: no se pudo poner, así que no se midió nada')
                    s = s.replace(viejo, nuevo)
        return s

    entorno = dict(os.environ)
    if mcd_raiz is None:
        entorno.pop('MCD_REPO', None)
        entorno['MCD_REPO'] = os.path.join(tempfile.gettempdir(), 'mcd-que-no-existe')
    else:
        entorno['MCD_REPO'] = mcd_raiz
    ambito = {
        're': re,
        'os': type('os_', (), {'environ': entorno, 'path': os.path})(),
        'rd': rd,
        'cod': _solo_codigo,
        'check': check,
        'print': lambda *a, **k: None,
    }
    exec(compile(_trozo, 'lente-del-contrato', 'exec'), ambito)
    return rojas


def main():
    mcd = os.environ.get('MCD_REPO') or os.path.join(os.path.dirname(_RAIZ), 'mcd')
    hay_mcd = os.path.exists(mcd + '/src/app/api/integrations/tcd/route.ts')
    _RUTA = 'src/app/api/integrations/tcd/route.ts'
    fallas = []

    # (nombre, parches, ¿necesita el repo de MCD al lado?, qué le pasa al cliente)
    ESCENARIOS = [
        ('mcd-renombra-el-campo-del-rojo',
         {_RUTA: [('primer_cobro: lista[0]?.paid_at', 'fecha_primer_cobro: lista[0]?.paid_at')]},
         True,
         'MCD renombra el campo que dispara el Cinturón Rojo: el puente lee '
         'undefined y contesta «todavía no cobró» para el que SÍ cobró'),
        ('mcd-deja-de-mandar-el-total',
         {_RUTA: [('total_usd: lista.reduce', 'totalUsd: lista.reduce')]},
         True,
         'el X/10 y el total en dólares se calculan sobre undefined'),
        ('el-falso-finge-un-campo-que-ya-no-existe',
         {'scripts/prueba-el-puente-de-las-dos-apps.ts':
          [('      primer_cobro: lista[0]?.paid_at ?? null,',
            '      primer_cobro: lista[0]?.paid_at ?? null,\n      cobro_viejo: 1,')]},
         True,
         'el MCD falso se queda con un campo que el MCD real ya no manda: las '
         '15 lentes del puente pasan contra un MCD que no existe'),
        ('el-puente-lee-un-campo-que-el-falso-no-manda',
         {'api/mcd-bridge.ts': [('data?.total_usd ?? 0', 'data?.total_en_dolares ?? 0')]},
         False,
         'el puente lee un nombre que nadie llena, y la prueba pasa igual'),
    ]

    # 1 · Sin defecto, la lente tiene que estar VERDE de los dos modos.
    for etiqueta, raiz in (('con MCD al lado', mcd if hay_mcd else None),
                           ('sin MCD al lado', None)):
        if raiz is None and etiqueta == 'con MCD al lado':
            print('  · MCD no está clonado al lado — los escenarios que lo '
                  'necesitan no se pueden medir desde acá')
            continue
        rojas = correr({}, raiz)
        if rojas:
            fallas.append(f'la lente ya está ROJA sin defecto ({etiqueta}): {rojas}')
            print(f'  ✗ la lente ya está roja sin ningún defecto puesto ({etiqueta})')
        else:
            print(f'  ✓ la lente está verde sin defecto ({etiqueta})')

    # 2 · Con el defecto puesto, tiene que ponerse ROJA.
    for nombre, parches, necesita_mcd, que in ESCENARIOS:
        if necesita_mcd and not hay_mcd:
            print(f'  · {nombre}: necesita el repo de MCD al lado — no medido')
            continue
        try:
            rojas = correr(parches, mcd if hay_mcd else None)
        except AssertionError as e:
            fallas.append(f'{nombre}: {e}')
            print(f'  ✗ {nombre}: no se pudo poner el defecto')
            continue
        if rojas:
            print(f'  ✓ {nombre} — {que}: la lente se pone roja')
        else:
            fallas.append(f'{nombre} ({que}): la lente sigue VERDE con el defecto puesto')
            print(f'  ✗ {nombre} — {que}: la lente NO lo ve')

    if fallas:
        print(f'\n✗ {len(fallas)} cosa(s) que la lente del contrato no ve:')
        for f in fallas:
            print(f'   · {f}')
        return 1
    print('\n✓ la deriva del contrato pone roja a la lente, de los dos lados')
    return 0


if __name__ == '__main__':
    sys.exit(main())
