#!/usr/bin/env python3
"""¿La batería se pone ROJA cuando el mecanismo que una lente pide que EXISTA
se saca del código y el nombre queda en un comentario?

Es la otra mitad de `probar-la-lente-del-crudo.py`. Esa prueba la PRESENCIA
—«el mecanismo está»—; ésta prueba la AUSENCIA, que es la misma trampa vista
del revés: cuando una lente recolecta los archivos donde el mecanismo FALTA,
leer el archivo crudo la deja ciega, porque un `// mensajeDeFalla` comentado
hace parecer que está.

Medido el 14 de noviembre de 2026 a las 19:30: dos lentes de main estaban así,
y las dos daban verde con el defecto puesto. Acá se reintroduce el defecto de
verdad —sobre el archivo real, en memoria, sin tocar nada— y se evalúa la
lente de las dos maneras: la vieja —sobre crudo— tiene que dar VERDE (ciega),
la nueva —sobre `rdc(…)`— tiene que dar ROJA.

El tercer caso es del mismo turno y de otra forma: la lente del catch mudo
miraba SOLO la primera coincidencia del archivo (`break`) y la buscaba en el
archivo crudo, así que un comentario que nombra la llamada arriba se gastaba
el único intento y un catch mudo de verdad quedaba sin mirar.

Corre: python3 scripts/probar-la-ausencia-que-era-el-defecto.py   (desde la raíz)
"""
import os
import re
import sys


def rd(f):
    return open(f, encoding='utf-8', errors='replace').read()


_RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
_bat = rd(os.path.join(_RAIZ, 'auditoria.py'))
_g = {'re': re}
exec(compile(_bat[_bat.index('def _sin_comentario_al_final'):
                  _bat.index('# ── Ayudante: ¿una tab del Admin')], 'limpiador', 'exec'), _g)
cod = _g['solo_codigo']


def comentar(texto, trozo):
    """Comenta TODAS las líneas donde vive el trozo. Todas, porque dejar una
    viva no reintroduce el defecto y la prueba no prueba nada."""
    return '\n'.join('  // ' + l.strip() if trozo in l else l
                     for l in texto.split('\n'))


fallos = 0


def medir(titulo, lente, porque):
    """`lente` recibe un lector (crudo o código) y devuelve la lista de
    infracciones. Roja = la lista trae algo."""
    global fallos
    vieja = lente(lambda s: s)
    nueva = lente(cod)
    ok = not vieja and bool(nueva)
    print(('  ✓ ' if ok else '  ✗ ')
          + f'{titulo}: crudo={"verde (ciega)" if not vieja else "roja " + str(vieja)} '
            f'· código={"roja " + str(nueva) if nueva else "verde"}'
          + ('' if ok else f'  ← se esperaba crudo=verde, código=roja ({porque})'))
    if not ok:
        fallos += 1


# ── 1 · «las pantallas nuevas traducen sus fallas» ───────────────────────
PANTALLAS = ['TableroPlata', 'ListaDeHoy', 'Supervision', 'PanelMotorIA']
_t1 = {c: rd(os.path.join(_RAIZ, f'src/components/admin/{c}.tsx')) for c in PANTALLAS}
if 'mensajeDeFalla' not in _t1['TableroPlata']:
    print('  ✗ TableroPlata.tsx ya no traduce fallas — la prueba quedó desfasada')
    fallos += 1
else:
    _r1 = dict(_t1)
    _r1['TableroPlata'] = comentar(_t1['TableroPlata'], 'mensajeDeFalla')
    medir('sacando mensajeDeFalla de TableroPlata.tsx',
          lambda lector: [c for c in PANTALLAS if 'mensajeDeFalla' not in lector(_r1[c])],
          'esa pantalla deja de traducir la falla y el cliente ve el error técnico')

# ── 2 · «los 4 puntos de venta tiran de la misma fuente» ─────────────────
PUNTOS = ['src/pages/Roadmap.tsx', 'src/components/PuertaSiguienteNivel.tsx',
          'src/App.tsx', 'src/pages/Dashboard.tsx']
_t2 = {f: rd(os.path.join(_RAIZ, f)) for f in PUNTOS}
if 'laOferta' not in _t2['src/pages/Dashboard.tsx']:
    print('  ✗ Dashboard.tsx ya no tira del módulo — la prueba quedó desfasada')
    fallos += 1
else:
    _r2 = dict(_t2)
    _r2['src/pages/Dashboard.tsx'] = comentar(
        comentar(_t2['src/pages/Dashboard.tsx'], 'laOfertaQueSigue'), 'laOferta')
    medir('desconectando Dashboard.tsx del módulo de la oferta',
          lambda lector: [os.path.basename(f) for f in PUNTOS
                          if 'laOfertaQueSigue' not in lector(_r2[f])
                          and 'laOferta' not in lector(_r2[f])],
          'ese punto de venta queda con la escalera escrita a mano')

# ── 3 · el catch mudo que el `break` sobre crudo dejaba sin mirar ────────
_ARCH3 = 'src/lib/aiProvider.ts'
_s3 = rd(os.path.join(_RAIZ, _ARCH3))
_m3 = re.search(r'(generateText|streamText)\(', _s3)
_CATCH3 = re.compile(r'\}\s*catch\s*(?:\([^)]*\))?\s*\{([^{}]*)\}')


def _lente_vieja3(fuentes):
    """La de ayer: el archivo crudo y SOLO la primera coincidencia."""
    mudos = []
    for f, src in fuentes.items():
        if 'generateText(' not in src and 'streamText(' not in src:
            continue
        for m in re.finditer(r'(generateText|streamText)\(', src):
            v = src[m.start(): m.start() + 2500]
            c = re.search(r'\}\s*catch\s*(\([^)]*\))?\s*\{\s*/\*\s*noop\s*\*/\s*\}', v)
            if c and 'localStorage' not in v[max(0, c.start() - 200):c.start()]:
                mudos.append(os.path.basename(f))
            break
    return mudos


def _lente_hoy3(fuentes):
    """La de hoy: el cuerpo del catch medido en CÓDIGO y todas las llamadas."""
    mudos = []
    for f, src in fuentes.items():
        if 'generateText(' not in cod(src) and 'streamText(' not in cod(src):
            continue
        for m in re.finditer(r'(generateText|streamText)\(', src):
            v = src[m.start(): m.start() + 2500]
            c = _CATCH3.search(v)
            if not c or cod(c.group(1)).strip():
                continue
            if 'localStorage' in v[max(0, c.start() - 200):c.start()]:
                continue
            if 'silencio a propósito:' in c.group(1):
                continue
            mudos.append(os.path.basename(f))
    return mudos


if not _m3:
    print(f'  ✗ {_ARCH3} ya no llama al proveedor — la prueba quedó desfasada')
    fallos += 1
else:
    # el defecto: un catch mudo de verdad alrededor de la llamada, y arriba un
    # comentario que nombra la llamada para gastarle el `break` a la vieja.
    _con_mudo = (_s3[:_m3.end()] + '); } catch {\n    // sin internet, se ignora\n  }\n  '
                 + _s3[_m3.end():])
    _roto3 = {_ARCH3: '// ojo: generateText( se usa más abajo\n' + _con_mudo}
    _v3, _h3 = _lente_vieja3(dict(_roto3)), _lente_hoy3(dict(_roto3))
    _ok3 = not _v3 and bool(_h3)
    print(('  ✓ ' if _ok3 else '  ✗ ')
          + f'un catch mudo en {_ARCH3}, con la llamada nombrada en un comentario arriba: '
            f'vieja={"verde (ciega)" if not _v3 else "roja"} · hoy={"roja" if _h3 else "verde"}'
          + ('' if _ok3 else '  ← la llamada de IA falla en silencio y nadie se entera'))
    if not _ok3:
        fallos += 1

print()
if fallos:
    print(f'════ {fallos} no probaron nada — LA LENTE NO SIRVE ════')
    sys.exit(1)
print('════ la ausencia-como-defecto: ciega en crudo, roja en el código ════')
