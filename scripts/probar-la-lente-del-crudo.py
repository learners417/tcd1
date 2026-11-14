#!/usr/bin/env python3
"""¿La batería se pone ROJA si el mecanismo se saca del código y el nombre
queda en un comentario?

El 14 de noviembre a las 03:30, a las 07:26 y a las 11:30 se midió tres veces
lo mismo, en los dos repos: una lente que lee el archivo CRUDO da verde con el
defecto puesto, porque le alcanza el comentario que nombra el mecanismo. A las
15:25 se cerraron las seis formas que quedaban (el `;`, `.count`, `re.search`,
el fragmento con paréntesis, el diccionario de archivos y el `COL.get()`).

Esto lo prueba sin tocar nada: lee el archivo de verdad, le saca el mecanismo
en memoria dejando el nombre en un comentario, y evalúa la lente de las dos
maneras. La vieja —sobre crudo— tiene que dar VERDE (ciega). La nueva —sobre
`cod(…)`— tiene que dar ROJA.

Corre: python3 scripts/probar-la-lente-del-crudo.py   (desde la raíz)
"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def rd(f): return open(f, encoding='utf-8', errors='replace').read()

# el mismo limpiador de la batería, importado de ella para que no se bifurque
_bat = rd(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'auditoria.py'))
_ini = _bat.index('def _sin_comentario_al_final')
_fin = _bat.index('# ── Ayudante: ¿una tab del Admin')
_g = {'re': re}
exec(compile(_bat[_ini:_fin], 'limpiador', 'exec'), _g)
solo_codigo = _g['solo_codigo']
cod = solo_codigo


def comentar(texto, trozo):
    """Comenta TODAS las líneas donde vive el trozo, dejando el nombre en un
    comentario al final de la línea: la forma exacta en la que pasaron los
    tres defectos del 07:26. Todas, porque comentar una sola de dos deja el
    mecanismo vivo y la prueba no prueba nada."""
    return '\n'.join('  // ' + l.strip() if trozo in l else l
                     for l in texto.split('\n'))


CASOS = [
    # (qué se saca, de dónde, la lente de HOY, por qué importa)
    ('cargarVentanas', 'src/App.tsx',
     lambda t: 'cargarVentanas' in t,
     'sin esto el cliente no ve sus ventanas de reclamo'),
    ('setFamiliaActual', 'src/App.tsx',
     lambda t: 'setFamiliaActual' in t,
     'la familia profesional deja de fijarse con el perfil'),
    ('inputMode=', 'src/components/admin/NumerosDeLaSemana.tsx',
     lambda t: t.count('inputMode=') >= 1,
     'el teclado numérico del Admin en el teléfono'),
    ('SEMANAS: Record<number, string>', 'src/lib/hojaDeRuta.ts',
     lambda t: re.search(r'SEMANAS: Record<number, string> = \{(.*?)\n\};', t, re.S) is not None,
     'las trece semanas de la hoja de ruta'),
    ('deshacerCobro', 'api/ai/generate.ts',
     lambda t: 'deshacerCobro' in t,
     'la devolución del crédito cuando la cadena falla'),
]

fallos = 0
for trozo, archivo, lente, porque in CASOS:
    crudo = rd(archivo)
    if trozo not in crudo:
        print(f'  ✗ {archivo}: ya no existe «{trozo}» — la prueba quedó desfasada')
        fallos += 1; continue
    roto = comentar(crudo, trozo)
    vieja = lente(roto)              # la lente que mira el archivo crudo
    nueva = lente(cod(roto))         # la lente que mira el código
    ok = vieja and not nueva
    print(('  ✓ ' if ok else '  ✗ ')
          + f'{archivo} · sacando «{trozo}»: crudo={"verde" if vieja else "roja"} '
            f'código={"verde" if nueva else "roja"}'
          + ('' if ok else f'  ← se esperaba crudo=verde, código=roja ({porque})'))
    if not ok: fallos += 1

print()
if fallos:
    print(f'════ {fallos} de {len(CASOS)} no probaron nada — LA LENTE NO SIRVE ════'); sys.exit(1)
print(f'════ las {len(CASOS)} formas: ciegas en crudo, rojas en el código ════')
