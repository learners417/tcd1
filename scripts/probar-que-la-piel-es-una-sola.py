#!/usr/bin/env python3
"""¿Las cuatro lentes de la piel se ponen ROJAS con su propio defecto?

El 15 de noviembre la app dejó de tener dos pieles: la oscura de fábrica en
los tokens y, encima, 206 reglas con `[data-theme="light"]` que la tapaban
una por una. Lo que queda es una sola, y estas cuatro lentes son las que
impiden que vuelva la segunda:

  · «la app tiene una sola piel, no dos peleando» — ninguna compuerta de
    tema: ni en el `.css`, ni en el `.html`, ni un módulo que la escriba.
  · «el papel de la casa es claro y la tinta es oscura» — los tokens de
    `@theme`, medidos por luminancia y no leídos por su nombre.
  · «el oro mate reemplazó al brillante en todo el repo» — el naranja
    prohibido en sus DOS alfabetos (`#E8962E` y `rgba(232, 150, 46, X)`) y
    en todos los archivos que la batería lee, el `.css` incluido. Antes
    miraba solo los `.ts`/`.tsx` y solo el hexadecimal: los diez usos que
    vivían en la hoja de estilos no los veía nadie.
  · «ninguna pantalla escribe su color a mano» — ninguna clase con el color
    adentro (`hover:bg-[#161512]` pintaba de casi negro la ficha de Campañas
    al pasar el dedo, y el medidor no lo ve porque mide la pantalla quieta).

El veredicto NO se copia: se saca de `auditoria.py` entre sus marcas
`#.PIEL.*`, se le da de comer el archivo de verdad con el defecto puesto EN
MEMORIA, y se mira si dice lo que tiene que decir. Si alguien ablanda una
lente allá, esta prueba se entera acá.

Corre: python3 scripts/probar-que-la-piel-es-una-sola.py   (desde la raíz)
"""
import os
import re
import sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
BAT = open(os.path.join(RAIZ, 'auditoria.py'), encoding='utf-8').read()

fallas = 0


def ok(cond, msg):
    global fallas
    if not cond:
        fallas += 1
    print(('  ✓ ' if cond else '  ✗ ') + msg)


def tramo(nombre):
    """El código de la lente, tal como vive hoy en la batería."""
    a = BAT.index(f'#.PIEL.{nombre}.INICIO') + len(f'#.PIEL.{nombre}.INICIO')
    b = BAT.index(f'#.PIEL.{nombre}.FIN')
    return BAT[a:b]


def correr(nombre, entorno):
    """Ejecuta la lente con el entorno dado y devuelve {nombre: veredicto}."""
    veredictos = {}

    def check(titulo, cond, detalle=''):
        veredictos[titulo] = bool(cond)

    g = dict(entorno)
    g.update({'re': re, '_re': re, 'os': os, 'check': check})
    exec(compile(tramo(nombre), f'lente-{nombre}', 'exec'), g)
    return veredictos


_LIMPIA = {'re': re}
exec(compile(BAT[BAT.index('def _sin_comentario_al_final'):
                 BAT.index('# ── Ayudante: ¿una tab del Admin')], 'limpiador', 'exec'), _LIMPIA)


def cod(t, archivo='x.tsx'):
    """El limpiador de la batería, sacado de la batería."""
    return _LIMPIA['solo_codigo'](t, archivo)


def rdc_de(mapa):
    """`rdc` de la batería: lee y saca los comentarios del lenguaje del
    archivo. Si acá devolviera el crudo, el comentario que EXPLICA el oro
    viejo contaría como infractor y la prueba mediría otra cosa."""
    def _rdc(f):
        return cod(mapa.get(f, ''), f)
    return _rdc


CSS = open(os.path.join(RAIZ, 'src/index.css'), encoding='utf-8').read()
HTML = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()

print('\n══ 1 · la compuerta de tema, puesta a propósito ══')
base = {'rdc': rdc_de({'src/index.css': CSS}), '_html_cod': HTML}
v = correr('UNA', base)
ok(v['la app tiene una sola piel, no dos peleando'],
   'con el repo de hoy, la lente da verde')

con_gate = CSS.replace(':root .text-cream ', '[data-theme="light"] .text-cream ', 1)
v = correr('UNA', {'rdc': rdc_de({'src/index.css': con_gate}), '_html_cod': HTML})
ok(not v['la app tiene una sola piel, no dos peleando'],
   'con UNA regla con compuerta de tema en el .css, se pone roja')

v = correr('UNA', {'rdc': rdc_de({'src/index.css': CSS}),
                   '_html_cod': HTML.replace('<html lang="es"', '<html lang="es" data-theme="light"', 1)})
ok(not v['la app tiene una sola piel, no dos peleando'],
   'y con el atributo de vuelta en el .html, también')

print('\n══ 2 · la paleta de fábrica, devuelta a @theme ══')
v = correr('TOKENS', {'_luz5': CSS})
ok(v['el papel de la casa es claro y la tinta es oscura']
   and v['card-ios no cae en su respaldo negro'],
   'con el repo de hoy, las dos dan verde')

oscuro = (CSS.replace('--color-ink: #F1EBE0', '--color-ink: #080808', 1)
             .replace('--color-cream: #23201D', '--color-cream: #F2EFE9', 1))
v = correr('TOKENS', {'_luz5': oscuro})
ok(not v['el papel de la casa es claro y la tinta es oscura'],
   'con el papel y la tinta de la piel vieja, se pone roja')

v = correr('TOKENS', {'_luz5': CSS.replace('--bg-card: #FAF8F4', '--bg-card: #17150F', 1)})
ok(not v['card-ios no cae en su respaldo negro'],
   'y con la tarjeta de vuelta en su respaldo negro, también')

print('\n══ 3 · el oro prohibido, en sus dos alfabetos ══')
TITULO_ORO = 'el oro mate reemplazo al brillante en todo el repo'
limpio = {'todo': {'src/a.tsx': 'const x = 1;'}, 'cod': cod,
          'rdc': rdc_de({'src/index.css': CSS, 'index.html': HTML})}
v = correr('ORO', limpio)
ok(v[TITULO_ORO], 'con el repo de hoy, la lente da verde')

v = correr('ORO', dict(limpio, todo={'src/a.tsx': "const c = '#E8962E';"}))
ok(not v[TITULO_ORO], 'con el hexadecimal en un .tsx, se pone roja')

en_css = CSS.replace('--sombra: 0 1px 2px',
                     'box-shadow: 0 0 12px rgba(232, 150, 46, 0.15);\n  --sombra: 0 1px 2px', 1)
v = correr('ORO', dict(limpio, rdc=rdc_de({'src/index.css': en_css, 'index.html': HTML})))
ok(not v[TITULO_ORO],
   'y con el MISMO color escrito en rgba() dentro del .css, que es como estaba de verdad, también')

v = correr('ORO', dict(limpio, todo={'src/a.tsx': '// el oro viejo era #E8962E y se fue\nconst x = 1;'}))
ok(v[TITULO_ORO], 'y el comentario que lo explica no cuenta como infractor')

print('\n══ 4 · el color escrito a mano en una clase ══')
TITULO_MANO = 'ninguna pantalla escribe su color a mano'
v = correr('AMANO', {'todo': {'src/a.tsx': "className='bg-panel text-cream'"}, 'cod': cod})
ok(v[TITULO_MANO], 'con una pantalla que usa tokens, da verde')

for clase in ("hover:bg-[#161512]", "bg-[#0F0F0F]", "text-[#F0B429]", "border-[#B0822E]/50"):
    v = correr('AMANO', {'todo': {'src/a.tsx': f"className='{clase} p-4'"}, 'cod': cod})
    ok(not v[TITULO_MANO], f'con `{clase}` en una pantalla, se pone roja')

v = correr('AMANO', {'todo': {'src/a.tsx': "// antes decía bg-[#0F0F0F]\nconst x = 1;"}, 'cod': cod})
ok(v[TITULO_MANO], 'y el comentario que lo recuerda no cuenta')

print('\n' + ('✓ las cuatro lentes de la piel saben ponerse rojas\n'
              if fallas == 0 else f'✗ {fallas} fallas\n'))
sys.exit(0 if fallas == 0 else 1)
