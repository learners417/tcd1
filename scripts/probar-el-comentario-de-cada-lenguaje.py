#!/usr/bin/env python3
"""¿La batería se pone ROJA si el mecanismo se comenta en el idioma del
archivo donde vive?

Todo lo que se cerró entre el 13 y el 14 de noviembre cuidaba UN comentario:
el `//` de TypeScript. Y la batería no lee solo TypeScript: lee las
migraciones (.sql), el medidor y el generador del seed (.py) y el andamiaje
de la prueba SQL (.sh). Medido el 15 de noviembre, con el defecto puesto en
el archivo de verdad y la batería entera corrida: con la guarda de la carpeta
del dueño comentada con `--`, «y la función comprueba que el archivo esté en
la carpeta de su dueño» dio VERDE y NINGUNA otra lente la vio. Con `#`, el
tuteo del generador y la RLS del andamiaje también dieron verde.

Esto lo prueba sin tocar nada: lee el archivo de verdad, comenta el
mecanismo en memoria con la marca de SU lenguaje, y evalúa la lente de las
dos maneras. La vieja —que solo sabía `//`— tiene que dar VERDE (ciega). La
nueva —`solo_codigo(texto, archivo)`— tiene que dar ROJA.

Corre: python3 scripts/probar-el-comentario-de-cada-lenguaje.py   (desde la raíz)
"""
import re, sys, os

def rd(f): return open(f, encoding='utf-8', errors='replace').read()

_raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
_bat = rd(os.path.join(_raiz, 'auditoria.py'))
_ini = _bat.index('def _sin_comentario_al_final')
_fin = _bat.index('# ── Ayudante: ¿una tab del Admin')
_g = {'re': re}
exec(compile(_bat[_ini:_fin], 'limpiador', 'exec'), _g)
solo_codigo = _g['solo_codigo']


def comentar(texto, trozo, marca, entera=True):
    """Comenta TODAS las líneas donde vive el trozo. `entera` es la forma más
    honesta —la línea empieza con la marca, como cuando alguien desactiva
    algo y lo deja ahí—; con `entera=False` el nombre queda al final de una
    línea que sigue siendo código."""
    out = []
    for l in texto.split('\n'):
        if trozo in l:
            out.append(f'{marca} {l.strip()}' if entera
                       else f'{l[:len(l) - len(l.lstrip())]}x = 1  {marca} {l.strip()}')
        else:
            out.append(l)
    return '\n'.join(out)


def comentar_bloque(texto, trozo, ap, ci, entera=True):
    """Lo mismo, con el comentario DE BLOQUE: el `/* */` del .css y el
    `<!-- -->` del .html. Ahí no hay marca de línea, así que el mecanismo se
    envuelve: la forma en que alguien desactiva una regla y la deja escrita."""
    out = []
    for l in texto.split('\n'):
        if trozo in l:
            _sangria = l[:len(l) - len(l.lstrip())]
            out.append(f'{_sangria}{ap} {l.strip()} {ci}' if entera
                       else f'{_sangria}z-index: 0;  {ap} {l.strip()} {ci}')
        else:
            out.append(l)
    return '\n'.join(out)


# Y los que entraban por la OTRA puerta: `index.html` y `src/index.css` se
# leían con `open(...).read()`, así que `solo_codigo` no se llamaba nunca y
# `_MARCAS` no se aplicaba. Acá la «vieja» no es el limpiador de ayer: es el
# archivo CRUDO, que es lo que la lente tenía en la mano.
CASOS_PUERTA = [
    # (archivo, el mecanismo, apertura, cierre, por qué importa)
    # Era `data-theme="light"`. El 15 de noviembre de 2026 la app pasó a una
    # sola piel y ese atributo se fue del `.html` con la compuerta de tema:
    # la prueba avisó de su propia desactualización, que es lo que tiene que
    # hacer. En su lugar va otro mecanismo del mismo archivo, el que reserva
    # la franja del reloj, con su propia lente en prueba-la-franja-del-reloj.
    ('index.html', 'viewport-fit=cover', '<!--', '-->',
     'sin eso la app no llega a los bordes del teléfono y el encabezado '
     'queda bajo el reloj'),
    # El valor del token se mueve cuando se mueve la piel: el 15 de noviembre
    # de 2026 el crema pasó de #EAE4D9 al #F1EBE0 de la home y esta prueba
    # avisó, como tiene que avisar, que su muestra había quedado vieja. Se usa
    # el NOMBRE del token y no su valor: el nombre es lo que no cambia.
    ('src/index.css', '--color-ink:', '/*', '*/',
     'sin el token, cada clase text-ink del tema claro vuelve al valor '
     'oscuro: texto casi blanco sobre crema'),
    ('src/index.css', '--surface: var(--bg-card)', '/*', '*/',
     'sin eso, card-ios cae en su respaldo negro con el tema claro puesto'),
]

CASOS = [
    # (archivo, el mecanismo, la marca de su lenguaje, por qué importa)
    ('supabase/migrations/20261025_el_veredicto_queda.sql',
     "not like ('evidencias/'", '--',
     'sin esa línea un cliente guarda el veredicto del archivo de otro'),
    ('supabase/migrations/20261002_numeros_del_cliente.sql',
     "rol = 'admin'", '--',
     'sin la política, el equipo deja de leer las métricas de todos'),
    ('supabase/migrations/20261027_el_cliente_puede_cerrar_su_migracion.sql',
     "current_setting('app.cerrando_migracion'", '--',
     'sin la bandera, el cierre de la migración queda sin su candado'),
    ('tcd-spec/datos/generar_seed.py', 'tutear_todo(out)', '#',
     'el seed sale sin tutear y la lente del tuteo seguía en verde'),
    ('scripts/prueba-sql.sh', 'enable row level security', '#',
     'sin la RLS, «un cliente no lee la ficha de otro» da verde por falta '
     'de política, no porque la política funcione'),
    ('scripts/prueba-sql.sh', 'set role authenticated;', '--',
     'el `--` de línea entera es el comentario del SQL que el script lleva '
     'adentro de un heredoc'),
    ('src/lib/salaDeMandoStorage.ts', 'marcarEncendida', '//',
     'TypeScript no se puede haber roto por el camino'),
]

fallos = 0
for archivo, trozo, marca, porque in CASOS:
    crudo = rd(os.path.join(_raiz, archivo))
    if trozo not in crudo:
        print(f'  ✗ {archivo}: ya no existe «{trozo}» — la prueba quedó desfasada')
        fallos += 1; continue
    for entera in (True, False):
        roto = comentar(crudo, trozo, marca, entera)
        vieja = trozo in solo_codigo(roto)                # solo sabe `//`
        nueva = trozo in solo_codigo(roto, archivo)       # sabe el lenguaje
        # En TypeScript la vieja YA servía: ahí las dos tienen que dar roja.
        ciega = vieja if marca != '//' else not vieja
        ok = ciega and not nueva
        donde = 'línea entera' if entera else 'final de línea'
        print(('  ✓ ' if ok else '  ✗ ')
              + f'{archivo} · «{trozo[:34]}» con {marca} ({donde}): '
                f'vieja={"verde" if vieja else "roja"} '
                f'nueva={"verde" if nueva else "roja"}'
              + ('' if ok else f'  ← se esperaba nueva=roja ({porque})'))
        if not ok: fallos += 1

for archivo, trozo, ap, ci, porque in CASOS_PUERTA:
    crudo = rd(os.path.join(_raiz, archivo))
    if trozo not in crudo:
        print(f'  ✗ {archivo}: ya no existe «{trozo}» — la prueba quedó desfasada')
        fallos += 1; continue
    for entera in (True, False):
        roto = comentar_bloque(crudo, trozo, ap, ci, entera)
        cruda = trozo in roto                              # lo que daba `open()`
        nueva = trozo in solo_codigo(roto, archivo)        # por `rdc()`
        ok = cruda and not nueva
        donde = 'línea entera' if entera else 'final de línea'
        print(('  ✓ ' if ok else '  ✗ ')
              + f'{archivo} · «{trozo[:34]}» con {ap} {ci} ({donde}): '
                f'crudo={"verde" if cruda else "roja"} '
                f'por rdc={"verde" if nueva else "roja"}'
              + ('' if ok else f'  ← se esperaba rdc=roja ({porque})'))
        if not ok: fallos += 1

print()
if fallos:
    print(f'════ {fallos} no probaron nada — EL LIMPIADOR NO SIRVE ════'); sys.exit(1)
print(f'════ los {len(CASOS) + len(CASOS_PUERTA)} mecanismos: ciegos con el '
      f'comentario de su lenguaje, rojos ahora ════')
