#!/usr/bin/env python3
"""
¿LA BATERÍA VE EL DEFECTO? — el otro lado de «143 en verde».

Que una lente esté en verde no dice nada: dice que hoy no se cayó. La pregunta
que importa es la de atrás, y nadie la había hecho nunca sobre el producto:
**si pongo el defecto, ¿se pone roja alguna?**

Medido el 16 de noviembre de 2026, poniendo dieciséis defectos a propósito y
corriendo las 143 lentes con cada uno. Nueve eran defectos de NÚMERO —el
escalón de arriba de vuelta en 997, la instalación en 5.000, la meta de los 10
en 8, la ventana de La Base en 80 días, un eslabón de la cadena roto— y la
batería vio los nueve: los números están clavados en literales y hay lentes que
los comparan. Los otros siete eran defectos de MECANISMO —no cambian ningún
número, cambian lo que pasa— y de esos **cuatro no los vio nadie**:

  | el defecto puesto                                  | la batería   |
  |----------------------------------------------------|--------------|
  | la racha: el día en curso castiga                  | 143 en verde |
  | la racha: se va la gracia de un día hábil          | 143 en verde |
  | la racha: el finde rompe (el lunes arranca en cero)| 143 en verde |
  | la ventana cierra un día antes (se cae el día 90)  | 143 en verde |

Los tres primeros son la constancia que el cliente ve en su Diario y la pista de
66 de Mi protocolo; el cuarto es el último día del que pagó La Base. Las lentes
que faltaban se escribieron ese día (`prueba-la-racha.ts`, y el borde en
`prueba-acceso.ts`), y esto es lo que las obliga a seguir viendo: cada defecto
de la tabla de abajo NOMBRA la lente que tiene que ponerse roja. Si alguien
ablanda esa lente, acá se entera.

Cómo: el repo se copia a una carpeta temporal —el `node_modules` va por enlace—,
el defecto se pone sobre la copia y se corre SOLO la lente declarada. El repo de
verdad no se toca nunca.

Correr con: python3 scripts/probar-que-la-bateria-ve-el-defecto.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (nombre, archivo, lo que dice, lo que va a decir, la lente que DEBE verlo, qué es)
DEFECTOS = [
    # ── los cuatro que nadie veía, el 16 de noviembre de 2026 ──────────────
    ('dia-en-curso', 'src/lib/racha.ts',
     'if (!set.has(isoDe(cursor))) cursor.setDate(cursor.getDate() - 1);',
     'if (false) cursor.setDate(cursor.getDate() - 1);',
     'prueba-la-racha.ts',
     'el dia en curso castiga: sin sesion hoy, la racha baja'),
    ('sin-gracia', 'src/lib/racha.ts',
     '} else if (!graciaUsada) {', '} else if (false) {',
     'prueba-la-racha.ts',
     'se va la gracia: el primer habil sin sesion corta la racha'),
    ('finde-rompe', 'src/lib/racha.ts',
     'if (esFinDeSemana(cursor)) {', 'if (false) {',
     'prueba-la-racha.ts',
     'el finde rompe la racha: el lunes arranca en cero'),
    ('ultimo-dia', 'src/lib/ventanaDeAcceso.ts',
     'if (hoy > cierra) {', 'if (hoy >= cierra) {',
     'prueba-acceso.ts',
     'la ventana cierra un dia antes: se cae el dia 90 del que pago La Base'),
    # ── y los que SÍ se veían, para que sigan viéndose ─────────────────────
    ('precio-de-arriba', 'src/lib/planes.ts',
     "negro: '$1.000'", "negro: '$997'",
     'prueba-la-escalera.ts',
     'el escalon de arriba vuelve al 997'),
    ('instalacion', 'src/lib/cuadroTickets.ts',
     '{ precio: 6000 }', '{ precio: 5000 }',
     'prueba-los-precios-tienen-fecha.ts',
     'la instalacion vuelve a 5.000'),
    ('eslabon', 'src/lib/estaciones.ts',
     "seAbreCon: 'Tres ventas pagas'", "seAbreCon: 'Diez ventas pagas'",
     'prueba-las-cinco-estaciones.ts',
     'un eslabon de la cadena de estaciones, roto'),
    ('meta-de-los-diez', 'src/lib/tablero.ts',
     'META_PACIENTES = 10', 'META_PACIENTES = 8',
     'prueba-los-diez-llegan.ts',
     'la meta de los 10 pasa a 8'),
    ('color-del-dia', 'src/lib/elJuegoDelSur.ts',
     'return paisajeDelDia(dia)?.color.fondo;', 'return PAISAJES[0].color.fondo;',
     'prueba-el-juego-del-sur.ts',
     'los 90 dias pintados con el color del lago'),
    ('tope-semanal-de-avisos', 'src/lib/avisosCliente.ts',
     'if (historial.ultimaSemana[id] === semana) { repetidos++; continue; }',
     'if (false) { repetidos++; continue; }',
     'prueba-avisos.ts',
     'se va el tope semanal: el mismo aviso sale en cada corrida del cron'),
]

fallas = []


def correr(lente, cwd):
    """Verde o roja, con la misma regla del bloque 10: el código Y los renglones ✗."""
    r = subprocess.run(['npx', 'tsx', f'scripts/{lente}'],
                       capture_output=True, text=True, cwd=cwd)
    roja = r.returncode != 0 or any(
        l.startswith('✗') for l in (r.stdout + r.stderr).splitlines())
    return roja, (r.stdout + r.stderr)


def main():
    copia = tempfile.mkdtemp(prefix='ve-el-defecto-')
    try:
        subprocess.run(
            f'tar -cf - --exclude=node_modules --exclude=.git -C {RAIZ} . | tar -xf - -C {copia}',
            shell=True, check=True)
        os.symlink(os.path.join(RAIZ, 'node_modules'), os.path.join(copia, 'node_modules'))

        # 1 · Sin defecto, las lentes declaradas tienen que estar VERDES.
        for lente in sorted({d[4] for d in DEFECTOS}):
            roja, salida = correr(lente, copia)
            if roja:
                fallas.append(f'{lente} ya esta ROJA sin defecto: {salida.strip().splitlines()[-1][:120]}')
                print(f'  ✗ {lente} ya esta roja sin ningun defecto puesto')
            else:
                print(f'  ✓ {lente} esta verde sin defecto')

        # 2 · Con el defecto puesto, la lente declarada tiene que ponerse ROJA.
        for nombre, rel, viejo, nuevo, lente, que in DEFECTOS:
            p = os.path.join(copia, rel)
            original = open(p, encoding='utf-8').read()
            if original.count(viejo) != 1:
                fallas.append(
                    f'{nombre}: el texto del defecto aparece {original.count(viejo)} veces en {rel}, '
                    f'no una. El defecto no se pudo poner, asi que no se midio nada.')
                print(f'  ✗ {nombre}: no se pudo poner el defecto en {rel}')
                continue
            open(p, 'w', encoding='utf-8').write(original.replace(viejo, nuevo))
            try:
                roja, _ = correr(lente, copia)
            finally:
                open(p, 'w', encoding='utf-8').write(original)
            if roja:
                print(f'  ✓ {nombre} — {que}: {lente} se pone roja')
            else:
                fallas.append(f'{nombre} ({que}): {lente} sigue VERDE con el defecto puesto')
                print(f'  ✗ {nombre} — {que}: {lente} NO lo ve')
    finally:
        shutil.rmtree(copia, ignore_errors=True)

    if fallas:
        print(f'\n✗ {len(fallas)} defectos que la bateria no ve:')
        for f in fallas:
            print(f'   · {f}')
        return 1
    print(f'\n✓ los {len(DEFECTOS)} defectos ponen roja a su lente')
    return 0


if __name__ == '__main__':
    sys.exit(main())
