#!/usr/bin/env python3
"""
¿LA LENTE DEL VALOR VE EL DEFECTO? — el otro lado de sus cuatro miradas.

Una lente verde no dice nada: dice que hoy no se cayó. Esto le pone cada
defecto que dice cuidar y exige que se ponga ROJA, y dos canarios al revés que
tienen que dejarla VERDE. El repo de verdad no se toca: se copia a una carpeta
temporal y el defecto se pone sobre la copia.

LOS OCHO DEFECTOS:

  1 · el de hoy, puesto de nuevo: la lista de `creativos.tipo` sin
      `yt_thumbnail`, que es como estuvo desde el 10 de abril. Es el único de
      los siete que NO tiene ninguna comilla al lado de un insert: el valor
      viaja en `config.tipo` y lo admite el TIPO. Una lente de literales da
      verde acá.
  2 · un valor literal escrito en un insert, fuera de la lista. La forma que
      ya costó un crédito por imagen (`devolucion` en
      `credit_transactions.source`, el 17 de noviembre).
  3 · lo mismo sobre una tabla cuyo nombre NO es un literal, sino la
      constante `TABLA` del propio archivo. Anclando sólo en la comilla,
      `api/fathom-webhook.ts` —las transcripciones que entran solas— no se
      miraba nunca.
  4 · un filtro `.eq` con un valor que la columna no puede contener. No da
      error: devuelve cero filas, siempre, y la pantalla sale vacía.
  5 · lo mismo con `.in([...])`, donde el valor de más se esconde entre dos
      buenos.
  6 · un valor de más en una unión con nombre (`EstadoCreativo`), que es como
      están escritos los tipos de este repo.
  7 · un valor de más en una unión escrita dentro de la interfaz
      (`Campana.genero`), sin alias en el medio: es el otro camino, y la
      primera versión de la lente sólo resolvía uno de los dos.
  8 · un valor de más en `TipoDeMensaje`, que es el estado de los botones del
      chat de soporte y entra en `mensajes.tipo` como clave ABREVIADA
      —`.update({ contenido, tipo })`—: ni literal ni objeto entero. Es la
      tercera puerta, y la lente la aprendió midiendo este archivo.

Y LOS DOS CANARIOS, que tienen que quedar VERDES:

  A · un tipo del todo local —una fila de pantalla con un campo `estado` que
      no es de ninguna tabla— con un valor inventado. Si esto pone roja a la
      lente, la lente empareja por nombre de campo y no por la tabla donde se
      escribe: el repo tiene `estado: 'hecha' | 'hoy' | 'porVenir'` en una
      pantalla y `estado` cerrado en cuatro tablas distintas.
  B · el valor de más en una columna que el `Omit<>` del insert saca y que
      el `update` no toca. Si la columna no se escribe, no hay defecto: una
      lente que lo marcara igual mandaría a arreglar lo que no está roto.

Corre: python3 scripts/probar-que-la-lente-del-valor-ve-el-defecto.py
(Necesita PostgreSQL: la lente le pregunta las listas al catálogo.)
"""
import glob
import os
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LENTE = 'scripts/prueba-el-valor-que-la-base-rechaza.py'

# (nombre, [(archivo, lo que dice, lo que va a decir)], qué es)
DEFECTOS = [
    ('lista-vieja-sin-la-portada',
     [('supabase/migrations/20261118_la_portada_de_youtube_no_entraba.sql',
       "check (tipo in ('imagen_single', 'carrusel', 'yt_thumbnail'));",
       "check (tipo in ('imagen_single', 'carrusel'));")],
     'el defecto de hoy: la base sin `yt_thumbnail` y el tipo con los tres'),
    ('literal-fuera-de-la-lista',
     [('api/payments/paypal/create-order.ts',
       "status: 'created',", "status: 'creada',")],
     'un literal escrito que la base rechaza con un 23514 — y es la fila de '
     'la compra por PayPal'),
    ('literal-en-tabla-nombrada-por-constante',
     [('api/fathom-webhook.ts', "estado: 'pendiente',", "estado: 'pendientes',")],
     'lo mismo donde la tabla es `const TABLA`, no una comilla'),
    ('filtro-que-no-empareja-nunca',
     [('src/lib/transcripcionesRecibidas.ts',
       ".eq('estado', 'pendiente')", ".eq('estado', 'pendientes')")],
     'un `.eq` con un valor imposible: cero filas y la pantalla vacía'),
    ('filtro-in-con-un-valor-de-mas',
     [('src/lib/transcripcionesRecibidas.ts',
       ".eq('estado', 'pendiente')", ".in('estado', ['pendiente', 'cargadas'])")],
     'el valor de más escondido entre dos buenos en un `.in`'),
    ('union-con-nombre-de-mas',
     [('src/lib/campanasTypes.ts',
       "export type EstadoCreativo = 'generado' | 'aprobado' | 'descartado';",
       "export type EstadoCreativo = 'generado' | 'aprobado' | 'descartado' | 'archivado';")],
     'un valor de más en una unión con nombre, que compila y la base rechaza'),
    ('union-dentro-de-la-interfaz',
     [('src/lib/campanasTypes.ts',
       "  genero: 'todos' | 'mujeres' | 'hombres';\n  intereses?: string[];",
       "  genero: 'todos' | 'mujeres' | 'hombres' | 'otros';\n  intereses?: string[];")],
     'lo mismo escrito dentro de la interfaz, sin alias en el medio'),
    ('clave-abreviada-desde-el-estado-de-la-pantalla',
     [('src/lib/soporte.ts',
       "export type TipoDeMensaje = 'duda' | 'roto';",
       "export type TipoDeMensaje = 'duda' | 'roto' | 'idea';")],
     'un botón más en el chat de soporte: el valor entra por `{ contenido, '
     'tipo }`, sin comilla y sin ser el objeto entero'),
]

# Los canarios: el mismo formato, pero la lente tiene que quedar VERDE.
CANARIOS = [
    ('tipo-local-que-no-es-de-ninguna-tabla',
     [('src/lib/campanasTypes.ts',
       '// ─── Creativos ─────',
       "export type EstadoDeFilaEnPantalla = 'hecha' | 'hoy' | 'inventada';\n"
       'export interface FilaEnPantalla { estado: EstadoDeFilaEnPantalla; }\n\n'
       '// ─── Creativos ─────')],
     'un tipo de pantalla con un campo `estado` que no escribe en ninguna tabla'),
    ('columna-que-el-insert-no-escribe',
     [('src/lib/campanasTypes.ts',
       "export type TipoCreativo = 'imagen_single' | 'carrusel' | 'yt_thumbnail';",
       "export type TipoCreativo = 'imagen_single' | 'carrusel' | 'yt_thumbnail' | 'reel';"),
      ('src/lib/campanasStorage.ts',
       "  creativo: Omit<Creativo, 'id' | 'created_at' | 'assets'>,",
       "  creativo: Omit<Creativo, 'id' | 'created_at' | 'assets' | 'tipo'>,"),
      ('src/lib/campanasStorage.ts',
       '  fields: Partial<Creativo>,',
       "  fields: Partial<Omit<Creativo, 'tipo'>>,")],
     'el valor de más en una columna que ni el insert ni el update escriben'),
]

fallas = []


def correr(cwd):
    """Roja si sale con código distinto de cero o imprime algún ✗."""
    r = subprocess.run([sys.executable, '-I', LENTE],
                       capture_output=True, text=True, cwd=cwd)
    salida = r.stdout + r.stderr
    roja = r.returncode != 0 or any('✗' in l for l in salida.splitlines())
    return roja, salida


def poner(copia, cambios):
    """Pone los cambios y devuelve cómo deshacerlos, o None si alguno no se
    pudo poner: un defecto que no se puso no mide nada, y es la forma más
    común de que un arnés diga que todo anda."""
    originales = []
    for rel, viejo, nuevo in cambios:
        p = os.path.join(copia, rel)
        txt = open(p, encoding='utf-8').read()
        if txt.count(viejo) != 1:
            for q, t in originales:
                open(q, 'w', encoding='utf-8').write(t)
            return None, f'{rel}: el texto aparece {txt.count(viejo)} veces, no una'
        originales.append((p, txt))
        open(p, 'w', encoding='utf-8').write(txt.replace(viejo, nuevo))
    return originales, ''


def main():
    if not any(os.path.isfile(os.path.join(d, 'initdb'))
               for d in glob.glob('/usr/lib/postgresql/*/bin')):
        print('  ⧗ sin PostgreSQL local: la lente no puede preguntar nada, '
              'así que el arnés no mide nada')
        return 0

    copia = tempfile.mkdtemp(prefix='valor-ve-el-defecto-')
    try:
        subprocess.run(
            f'tar -cf - --exclude=node_modules --exclude=.git -C {RAIZ} . '
            f'| tar -xf - -C {copia}', shell=True, check=True)

        # 1 · Sin defecto, VERDE. Si acá está roja, lo de abajo no mide nada.
        roja, salida = correr(copia)
        if roja:
            fallas.append('la lente ya está ROJA sin ningún defecto puesto: '
                          + '; '.join(l.strip() for l in salida.splitlines()
                                      if '✗' in l)[:200])
            print('  ✗ la lente ya está roja sin defecto: no se puede medir nada')
        else:
            print('  ✓ la lente está verde sin defecto')

        # 2 · Con cada defecto, ROJA.
        for nombre, cambios, que in DEFECTOS:
            originales, porque = poner(copia, cambios)
            if originales is None:
                fallas.append(f'{nombre}: el defecto no se pudo poner ({porque}), '
                              f'así que no se midió nada')
                print(f'  ✗ {nombre}: no se pudo poner el defecto — {porque}')
                continue
            try:
                roja, _ = correr(copia)
            finally:
                for p, txt in originales:
                    open(p, 'w', encoding='utf-8').write(txt)
            if roja:
                print(f'  ✓ {nombre} — {que}')
            else:
                fallas.append(f'{nombre} ({que}): la lente sigue VERDE')
                print(f'  ✗ {nombre} — la lente NO lo ve: {que}')

        # 3 · Y los canarios, al revés: tienen que quedar VERDES.
        for nombre, cambios, que in CANARIOS:
            originales, porque = poner(copia, cambios)
            if originales is None:
                fallas.append(f'canario {nombre}: no se pudo poner ({porque})')
                print(f'  ✗ canario {nombre}: no se pudo poner — {porque}')
                continue
            try:
                roja, salida = correr(copia)
            finally:
                for p, txt in originales:
                    open(p, 'w', encoding='utf-8').write(txt)
            if not roja:
                print(f'  ✓ canario {nombre} — {que}: la lente queda verde')
            else:
                fallas.append(f'canario {nombre} ({que}): la lente se puso ROJA — '
                              + '; '.join(l.strip() for l in salida.splitlines()
                                          if '✗' in l)[:200])
                print(f'  ✗ canario {nombre} — la lente se puso roja sin defecto: {que}')
    finally:
        shutil.rmtree(copia, ignore_errors=True)

    print()
    if fallas:
        print(f'✗ {len(fallas)} cosa(s) que el arnés de la lente del valor encontró:')
        for f in fallas:
            print(f'   · {f}')
        return 1
    print(f'✓ los {len(DEFECTOS)} defectos la ponen roja y los '
          f'{len(CANARIOS)} canarios la dejan verde')
    return 0


if __name__ == '__main__':
    sys.exit(main())
