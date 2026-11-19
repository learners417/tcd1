#!/usr/bin/env python3
"""EL ARNÉS DE LAS LENTES DE LA ENTREGA UNIDA — turno 19.

═══ POR QUÉ EXISTE ═══

`scripts/prueba-la-entrega-unida.ts` vigila diez cosas que se caen sin
romperse: los cinco datos de cada aviso, los cinco eventos nuevos, las llaves
que evitan que un evento tape a otro, las tres filas de Hoy, el reenganche y
que el cron alcance los paisajes sin reventar en frío. Ninguna de las diez
tiene forma de fallar «a la vista»: si una se duerme, la batería sigue verde y
el cliente deja de recibir.

Así que acá se le pone a cada una SU defecto, uno por vez, y se exige que se
ponga roja con el suyo. Una lente que no ve el fallo que dice buscar no es una
lente, es un comentario.

Los defectos son los que de verdad pueden pasar:

  · un dato se cae del cuerpo del pedido al tocar el aviso
  · un dato se vuelve opcional «para no romper al que llama»
  · el paisaje se escribe a mano en vez de salir de `paisajeDelDia`
  · un evento nuevo queda escrito y sin disparar (la historia del repo)
  · el cambio de paisaje pierde su sufijo y el primero tapa a los otros cuatro
  · alguien manda un aviso con `fetch` por su cuenta, saltándose el interruptor
  · Hoy deja de dibujar la comunidad en un refactor de la pantalla
  · el umbral del reenganche se separa del de la alarma del equipo
  · el calendario acordado pierde su fecha de corte y cita a reuniones muertas
  · y `losCincoPaisajes` vuelve a importar sin `.js`, que es lo que tuvo
    callada la alarma de inactividad en producción

Correr con:
  python3 scripts/probar-que-las-lentes-de-la-entrega-unida-ven-el-defecto.py
"""
import atexit
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LENTE = 'scripts/prueba-la-entrega-unida.ts'
# Tres lentes de OTROS archivos que este turno tuvo que arreglar: miraban la
# línea letra por letra y el objeto de opciones de `avisarUnaVez` las puso
# rojas sin que se rompiera nada. Arregladas para mirar el mecanismo, hace
# falta probar que no quedaron tan laxas que ya no vean nada.
LENTE_AVISOS = 'scripts/prueba-avisos-a-ghl.ts'
LENTE_ESCALON = 'scripts/prueba-antesala-y-escalon.ts'

ARCHIVOS = [
    'api/_lib/avisar-a-ghl.ts',
    'api/cron/alarmas-inactividad.ts',
    'src/pages/Dashboard.tsx',
    'src/components/LaComunidadEnHoy.tsx',
    'src/components/SiTeCaiste.tsx',
    'src/lib/elProximoEncuentro.ts',
    'src/lib/losCincoPaisajes.ts',
]

# ── EL ORIGINAL SE GUARDA ANTES DE TOCAR NADA, Y SE DEVUELVE SIEMPRE ──────
#
# Este arnés edita el repo de verdad: es la única forma de medir una lente que
# lee archivos por su ruta. Si se corta a la mitad —Ctrl-C, un fallo, un
# `npx` que no arranca— el repo tiene que quedar como estaba, así que el
# original vive en memoria y se devuelve en `finally` y además al salir.
ORIGINAL = {f: open(os.path.join(RAIZ, f), encoding='utf-8').read() for f in ARCHIVOS}


def devolver_todo():
    for f, texto in ORIGINAL.items():
        p = os.path.join(RAIZ, f)
        if open(p, encoding='utf-8').read() != texto:
            open(p, 'w', encoding='utf-8').write(texto)


atexit.register(devolver_todo)


def correr_la_lente(lente: str = LENTE):
    """Devuelve (código de salida, salida completa)."""
    r = subprocess.run(['npx', 'tsx', lente], cwd=RAIZ,
                       capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def con_defecto(archivo: str, viejo: str, nuevo: str, lente: str = LENTE):
    p = os.path.join(RAIZ, archivo)
    texto = ORIGINAL[archivo]
    if viejo not in texto:
        return None  # el defecto no se pudo poner: lo dice quien llama
    open(p, 'w', encoding='utf-8').write(texto.replace(viejo, nuevo, 1))
    try:
        return correr_la_lente(lente)
    finally:
        open(p, 'w', encoding='utf-8').write(texto)


# (nombre, archivo, viejo, nuevo, trozo de la lente que tiene que ponerse roja,
#  y la lente que lo mide — por defecto, la de la entrega unida)
DEFECTOS = [
    ('un dato se cae del cuerpo del pedido',
     'api/_lib/avisar-a-ghl.ts', '        paisaje: contacto.paisaje,', '',
     'viaja en el cuerpo del pedido'),

    ('un dato se vuelve opcional',
     'api/_lib/avisar-a-ghl.ts', '  cinturon: string | null;', '  cinturon?: string | null;',
     'ninguno es opcional'),

    ('el paisaje se escribe a mano',
     'api/cron/alarmas-inactividad.ts',
     'paisaje: paisajeDelDia(diaDeTrabajo)?.nombre ?? null,', "paisaje: 'El lago',",
     'el paisaje sale de `paisajeDelDia`'),

    ('el reenganche se saca de la pantalla',
     'src/pages/Dashboard.tsx', '<SiTeCaiste', '<ReengancheBorrado',
     'y Hoy lo dibuja'),

    ('las ventas se cuentan con un número fijo',
     'api/cron/alarmas-inactividad.ts', 'ventas_registradas: ventasPor.get(cli.id) ?? 0,',
     'ventas_registradas: 0,', 'las ventas salen de `ventas_registradas`'),

    ('un evento nuevo queda sin disparar',
     'api/cron/alarmas-inactividad.ts', "avisarUnaVez('venta_registrada'", "noAvisar('venta_registrada'",
     'y el cron lo dispara'),

    ('el cambio de paisaje pierde su sufijo',
     'api/cron/alarmas-inactividad.ts', "sufijo: `_${paisajeAhora.id}`", 'ventana: 95',
     'el cambio de paisaje lleva el paisaje en su llave'),

    ('alguien avisa con `fetch` por su cuenta',
     'api/cron/alarmas-inactividad.ts', 'let alarmas = 0;',
     'await fetch("https://ejemplo.invalido");\n    let alarmas = 0;',
     'no hace ningún pedido de red por su cuenta'),

    ('Hoy deja de dibujar la comunidad',
     'src/pages/Dashboard.tsx', '<LaComunidadEnHoy', '<SeccionBorrada',
     'Hoy dibuja la sección de la comunidad'),

    ('el umbral del reenganche se separa del de la alarma',
     'src/components/SiTeCaiste.tsx', 'DIAS_PARA_EL_REENGANCHE = 3', 'DIAS_PARA_EL_REENGANCHE = 1',
     'el umbral es el mismo'),

    ('el calendario acordado pierde su fecha de corte',
     'src/lib/elProximoEncuentro.ts', 'if (cuando.getTime() > corte) return null;', '',
     'pasada la fecha acordada'),

    ('`losCincoPaisajes` vuelve a importar sin `.js`',
     'src/lib/losCincoPaisajes.ts', "from './roadmapSeed.js'", "from './roadmapSeed'",
     'llevan `.js`'),

    # ── Las tres arregladas, contra su propio defecto ──
    ('se cae la ventana y un aviso viejo sale de golpe',
     'api/cron/alarmas-inactividad.ts',
     'if (datos.dia > (opciones.ventana ?? VENTANA[evento])) return;', '',
     'fuera de su ventana no sale', LENTE_AVISOS),

    ('el aviso de atraso deja de ser semanal y sale todos los días',
     'api/cron/alarmas-inactividad.ts',
     'if (cuando && (!opciones.cadaSemana || cuando > haceUnaSemana)) return;',
     'if (cuando && false) return;',
     'no vuelve a salir', LENTE_AVISOS),

    ('el select pierde el escalón y las entregas van para todos',
     'api/cron/alarmas-inactividad.ts', ', servicio_contratado, servicio_marcado_el', '',
     'la trae en el select', LENTE_ESCALON),
]


def main() -> int:
    fallas = 0

    print('══ primero, el código de verdad ══')
    codigo, salida = correr_la_lente()
    if codigo == 0:
        print('  ✓ las lentes dan verde sobre el repo como está')
    else:
        fallas += 1
        print('  ✗ las lentes NO dan verde sobre el repo como está')
        for l in salida.splitlines():
            if '✗' in l:
                print('     ', l.strip())

    print('\n══ y ahora, un defecto por lente ══')
    for defecto in DEFECTOS:
        nombre, archivo, viejo, nuevo, espera = defecto[:5]
        lente = defecto[5] if len(defecto) > 5 else LENTE
        r = con_defecto(archivo, viejo, nuevo, lente)
        if r is None:
            fallas += 1
            print(f'  ✗ {nombre}: EL DEFECTO NO SE PUDO PONER '
                  f'(no encontré el texto en {archivo}) — la medición no ocurrió')
            continue
        codigo, salida = r
        rojas = [l.strip() for l in salida.splitlines() if l.strip().startswith('✗')]
        la_suya = [l for l in rojas if espera in l]
        if codigo != 0 and la_suya:
            print(f'  ✓ {nombre} → {la_suya[0]}')
        elif codigo != 0:
            fallas += 1
            print(f'  ✗ {nombre}: se puso roja OTRA lente, no la suya '
                  f'(esperaba «{espera}»; se pusieron: {rojas[:2]})')
        else:
            fallas += 1
            print(f'  ✗ {nombre}: la lente siguió VERDE con el defecto puesto')

    print()
    devolver_todo()
    for f, texto in ORIGINAL.items():
        if open(os.path.join(RAIZ, f), encoding='utf-8').read() != texto:
            fallas += 1
            print(f'  ✗ {f} quedó tocado al terminar')

    if fallas:
        print(f'❌ {fallas} fallas en el arnés')
        return 1
    print(f'✅ las {len(DEFECTOS)} lentes ven cada una su propio defecto')
    return 0


if __name__ == '__main__':
    sys.exit(main())
