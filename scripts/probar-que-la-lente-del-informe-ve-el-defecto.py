#!/usr/bin/env python3
"""
¿LA LENTE DEL INFORME VE EL DEFECTO? — el otro lado de sus catorce miradas.

Una lente verde no dice nada: dice que hoy no se cayó. Esto le pone cada
defecto que dice cuidar y exige que se ponga ROJA. El repo de verdad no se
toca: se copia a una carpeta temporal y el defecto se pone sobre la copia.

LOS OCHO DEFECTOS, y por qué cada uno:

  1 · una tabla que el repo crea, sacada de la lista del informe. Es el
      defecto con el que nació esta lente: la lista tenía 44 nombres y el
      repo crea 60, así que veinte tablas no se verificaban nunca.
  2 · un nombre inventado agregado a la lista. Lo que le SOBRA a una lista a
      mano es tan malo como lo que le falta: el informe avisaría de una
      falta que nadie puede resolver, y Javo iría a arreglar lo que no está
      roto.
  3 · una función que la puesta al día CREA, sacada de su propia lista. Siete
      estaban así el 18 de noviembre.
  4 · uno de los cuatro huecos del panel, sacado de la lista. Son justo los
      que hay que ver si faltan: sin ellos en la lista, el informe no dice
      nada del día que `profiles` no esté.
  5 · un hueco declarado que ya no es hueco: `jornadas` en HUECOS_DEL_PANEL,
      con el repo creándola. Es el defecto de la excepción que se podre —los
      nueve nombres del 14 de noviembre, las tres copias del puente del 16,
      el PERDÓN del 17—.
  6 · LA PROMESA INCUMPLIDA, que es la mitad ejecutada: la puesta al día
      corre, el informe imprime `FALTA TABLA · sala_riesgos` —una tabla que
      este preámbulo SÍ aplica— y la lente tiene que verlo. Es el defecto
      por el que existe la corrida: hasta el 18 de noviembre el informe
      imprimía 35 faltas con la batería en verde.
  7 · el marcador del andamiaje, movido. Sin él esta lente no puede levantar
      la base, y lo tiene que DECIR en vez de ponerse verde.
  8 · y el canario: con la puesta al día reventando, el informe nunca se
      imprime. Una lente que aprueba porque no pudo preguntar es peor que no
      tenerla — la misma lección del arnés de la RLS del 17 de noviembre.

Y la trampa de los arneses, heredada: cada defecto comprueba primero que
LANDEÓ. Un reemplazo que no encuentra su texto deja la lente verde y el arnés
cantando «aprobada» por un ejercicio que nunca ocurrió.

Corre: python3 scripts/probar-que-la-lente-del-informe-ve-el-defecto.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LENTE = 'scripts/prueba-el-informe-de-la-puesta-al-dia.py'
PUESTA = 'poner-al-dia-la-base.sql'

# (nombre, archivo, lo que dice, lo que va a decir, qué defecto es)
DEFECTOS = [
    ('tabla-del-repo-sin-vigilar', PUESTA,
     ',sesiones,', ',',
     'una tabla que el repo crea, fuera de la lista del informe'),
    ('nombre-inventado-en-la-lista', PUESTA,
     ',sesion_respuestas,', ',sesion_respuestas,tabla_que_nadie_crea,',
     'un nombre que ningún .sql crea, agregado a la lista'),
    ('funcion-propia-sin-vigilar', PUESTA,
     'ids_del_equipo,', '',
     'una función que la puesta al día crea, fuera de su propia lista'),
    ('hueco-fuera-de-la-lista', PUESTA,
     ',profiles,', ',',
     'un hueco del panel fuera de la lista: el informe no diría nada el día '
     'que no esté'),
    ('hueco-que-ya-no-es-hueco', LENTE,
     "HUECOS_DEL_PANEL = {\n", "HUECOS_DEL_PANEL = {\n    'jornadas': 'puesto por el arnes',\n",
     'una excepción que sobra: el repo ya crea esa tabla'),
    ('la-promesa-incumplida', PUESTA,
     '-- QUÉ QUEDÓ', 'drop table if exists sala_riesgos cascade;\n-- QUÉ QUEDÓ',
     'el informe imprime una falta de algo que este preámbulo sí aplica: la '
     'puesta al día lo promete y no lo entrega'),
    ('marcador-movido', 'scripts/prueba-sql.sh',
     '══ el SQL contra PostgreSQL real ══', '══ movido por el arnes ══',
     'el marcador del andamiaje, movido: la lente no puede levantar la base'),
    ('canario-sin-informe', PUESTA,
     '-- QUÉ QUEDÓ', 'esto no es sql y revienta a proposito;\n-- QUÉ QUEDÓ',
     'la puesta al día revienta y el informe nunca se imprime'),
]


def correr(cwd):
    """Roja si sale con código distinto de cero o imprime algún ✗."""
    r = subprocess.run([sys.executable, '-I', LENTE],
                       capture_output=True, text=True, cwd=cwd)
    salida = r.stdout + r.stderr
    roja = r.returncode != 0 or any('✗' in l for l in salida.splitlines())
    return roja, salida


def main():
    fallas = []
    copia = tempfile.mkdtemp(prefix='informe-ve-el-defecto-')
    os.chmod(copia, 0o755)  # `su postgres` tiene que poder entrar a leer los .sql
    try:
        subprocess.run(
            f'tar -cf - --exclude=node_modules --exclude=.git -C {RAIZ} . '
            f'| tar -xf - -C {copia}', shell=True, check=True)

        # 1 · Sin defecto, VERDE. Si acá está roja, lo de abajo no mide nada.
        roja, salida = correr(copia)
        if roja:
            fallas.append('la lente ya está ROJA sin ningún defecto puesto: '
                          + '; '.join(l.strip() for l in salida.splitlines()
                                      if '✗' in l)[:300])
            print('  ✗ la lente ya está roja sin defecto: no se puede medir nada')
        else:
            print('  ✓ la lente está verde sin defecto '
                  '(y con los cuatro huecos del panel imprimiendo su FALTA)')

        # 2 · Con cada defecto, ROJA.
        for nombre, rel, viejo, nuevo, que in DEFECTOS:
            p = os.path.join(copia, rel)
            original = open(p, encoding='utf-8').read()
            if original.count(viejo) != 1:
                fallas.append(
                    f'{nombre}: el texto del defecto aparece '
                    f'{original.count(viejo)} veces en {rel}, no una. El '
                    f'defecto no se pudo poner, así que no se midió nada.')
                print(f'  ✗ {nombre}: no se pudo poner el defecto en {rel}')
                continue
            open(p, 'w', encoding='utf-8').write(original.replace(viejo, nuevo, 1))
            try:
                roja, _ = correr(copia)
            finally:
                open(p, 'w', encoding='utf-8').write(original)
            if roja:
                print(f'  ✓ {nombre} — {que}')
            else:
                fallas.append(f'{nombre} ({que}): la lente sigue VERDE')
                print(f'  ✗ {nombre} — la lente NO lo ve: {que}')
    finally:
        shutil.rmtree(copia, ignore_errors=True)

    print()
    if fallas:
        print(f'✗ {len(fallas)} cosa(s) que la lente del informe no ve:')
        for f in fallas:
            print(f'   · {f}')
        return 1
    print(f'✓ los {len(DEFECTOS)} defectos ponen roja a la lente del informe')
    return 0


if __name__ == '__main__':
    sys.exit(main())
