#!/usr/bin/env python3
"""EL ARNÉS DE LAS LENTES DEL COBRO — turno 18.

═══ POR QUÉ EXISTE ═══

El 18 de noviembre, cinco lentes de `auditoria.py` se pusieron rojas de golpe
sin que se rompiera nada: lo que abre cada oferta se mudó de
`api/ghl-webhook.ts` a `api/_lib/loQueAbreElPago.ts`, para que
`/api/alta-numero` resolviera un cobro con la MISMA declaración en vez de una
copia. Las cinco miraban el archivo, no el mecanismo, así que tenían razón en
mirar y el lugar equivocado.

Arreglarlas es fácil; dejarlas arregladas Y despiertas es lo que hace este
archivo. Siete lentes del cobro se corren contra el código de verdad —tienen
que dar verde— y después contra siete defectos puestos a propósito, uno por
lente. Una lente que no ve el fallo que dice buscar no es una lente, es un
comentario.

Los defectos que se le ponen son los que de verdad pueden pasar:

  · el alta deja de importar la declaración y vuelve a tener su copia
  · el módulo pierde `LO_QUE_ABRE` (nadie sabría qué abre cada oferta)
  · se saca el guardia `if (ticket && …)` y un color de acceso escribiría el
    servicio contratado — el puente prohibido que hacía figurar a un cliente
    de $497 con la instalación completa
  · el alta vuelve a ignorar el `plan` que le llega (el agujero del turno 18)
  · el alta acepta un plan que no se vende y lo da de alta como la entrada
  · las tres ofertas dejan de estar nombradas
  · el pago deja de escribir `servicio_contratado`

Correr con: python3 scripts/probar-que-las-lentes-del-pago-ven-el-defecto.py
"""
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Se toman las piezas de `auditoria.py`, no se copian ───────────────────
#
# `solo_codigo` es la que saca los comentarios, y es el motivo por el que
# estas lentes no se cumplen con un comentario que las nombra. Copiada acá,
# este arnés podría dar verde con una versión vieja de ella. Así que se
# extrae la rebanada contigua que la declara y se ejecuta.
_FUENTE = open(os.path.join(RAIZ, 'auditoria.py'), encoding='utf-8').read()
_INI = min(_FUENTE.index('_MARCAS'),
           _FUENTE.index('def _sin_comentario_al_final'),
           _FUENTE.index('def _ext'))
_FIN = _FUENTE.index('# ── Ayudante: ¿una tab del Admin')
_NS: dict = {'re': re}
exec(compile(_FUENTE[_INI:_FIN], 'auditoria.py/piezas', 'exec'), _NS)
solo_codigo = _NS['solo_codigo']

_CACHE: dict = {}


def cod(s: str) -> str:
    if s not in _CACHE:
        _CACHE[s] = solo_codigo(s)
    return _CACHE[s]


def leer(rel: str) -> str:
    return open(os.path.join(RAIZ, rel), encoding='utf-8').read()


def las_lentes(wh: str, alta: str, lib: str) -> dict:
    """Las siete lentes del cobro, escritas como las escribe `auditoria.py`.

    La ruta se mira JUNTO con el módulo que importa: es la corrección del 18
    de noviembre, y lo que las vuelve inmunes a que la declaración se mude.
    """
    pago = wh + '\n' + lib
    tras = pago.split('cambios.servicio_contratado = ticket;')[0]
    guardia = tras.rstrip().endswith(') {') and 'if (ticket &&' in tras.split('\n')[-2]
    imp = "from './_lib/loQueAbreElPago.js'"
    return {
        'las dos rutas leen la misma declaración':
            imp in cod(wh) and imp in cod(alta),
        'el cobro acepta las ofertas que se venden':
            "'base', 'ascenso', 'instalacion'" in pago,
        'y el ticket pagado abre el tramo que le corresponde':
            'LO_QUE_ABRE' in cod(pago) and "base: 'amarillo'" in pago,
        'el servicio contratado lo escribe el pago':
            'cambios.servicio_contratado = ticket' in cod(pago),
        'y NO se escribe cuando sólo vino un color de acceso':
            bool(guardia),
        'el alta resuelve el plan que le llega':
            'cambiosDelPago(pagado' in cod(alta) and 'loQueSePago(planPedido)' in cod(alta),
        'y un plan que no se vende no se da de alta como la entrada':
            "res.status(400).json({ error: 'PLAN_INVALIDO' })" in cod(alta),
    }


WH = leer('api/ghl-webhook.ts')
ALTA = leer('api/alta-numero.ts')
LIB = leer('api/_lib/loQueAbreElPago.ts')

fallas = 0
print('\n── las siete lentes del cobro, sobre el código de verdad ──')
real = las_lentes(WH, ALTA, LIB)
for nombre, ok in real.items():
    print(('  ✓ ' if ok else '  ✗ ') + nombre)
    if not ok:
        fallas += 1

# (defecto puesto, lente que tiene que ponerse roja)
DEFECTOS = [
    ('el alta deja de importar la declaración y vuelve a tener su copia',
     WH, ALTA.replace("from './_lib/loQueAbreElPago.js'", "from './_lib/una-copia.js'"), LIB,
     'las dos rutas leen la misma declaración'),
    ('el módulo pierde LO_QUE_ABRE',
     WH, ALTA, LIB.replace('LO_QUE_ABRE', 'LO_QUE_ABRIA_ANTES'),
     'y el ticket pagado abre el tramo que le corresponde'),
    ('se saca el guardia del ticket: un color escribiría el servicio',
     WH, ALTA, LIB.replace('if (ticket && leMueveElAcceso && sube) {', 'if (leMueveElAcceso) {'),
     'y NO se escribe cuando sólo vino un color de acceso'),
    ('el alta vuelve a ignorar el plan que le llega',
     WH, ALTA.replace('cambiosDelPago(pagado', 'nadaDelPago(pagado'), LIB,
     'el alta resuelve el plan que le llega'),
    ('el alta acepta un plan que no se vende',
     WH,
     ALTA.replace("if (planPedido && !pagado) return res.status(400).json({ error: 'PLAN_INVALIDO' });", ''),
     LIB,
     'y un plan que no se vende no se da de alta como la entrada'),
    ('las tres ofertas dejan de estar nombradas',
     WH, ALTA, LIB.replace("'base', 'ascenso', 'instalacion'", "'uno', 'dos', 'tres'"),
     'el cobro acepta las ofertas que se venden'),
    ('el pago deja de escribir el servicio contratado',
     WH, ALTA, LIB.replace('cambios.servicio_contratado = ticket;', ''),
     'el servicio contratado lo escribe el pago'),
]

print('\n── y cada una contra su propio fallo ──')
for nombre, w, a, l, lente in DEFECTOS:
    r = las_lentes(w, a, l)
    if r[lente]:
        fallas += 1
        print(f'  ✗ CIEGA: con «{nombre}», la lente «{lente}» sigue verde')
    else:
        print(f'  ✓ «{lente}» se pone roja')

# Y que el defecto puesto sea de verdad un cambio: un `replace` que no
# encuentra su texto deja el archivo igual y la lente se pondría roja por
# nada. Es el agujero que tuvo el primer arnés del trabajo subido.
for nombre, w, a, l, _ in DEFECTOS:
    if (w, a, l) == (WH, ALTA, LIB):
        fallas += 1
        print(f'  ✗ el defecto «{nombre}» no cambió ningún archivo: su replace no encontró su texto')

print()
if fallas:
    print(f'✗ {fallas} fallo(s)\n')
else:
    print(f'✓ {len(real)} lentes del cobro, cada una probada contra su propio fallo\n')
sys.exit(1 if fallas else 0)
