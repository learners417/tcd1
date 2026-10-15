#!/usr/bin/env python3
"""
EL CAMINO, DÍA POR DÍA — generado desde el seed.

═══ POR QUÉ SE GENERA Y NO SE ESCRIBE ═══

Un documento del plan escrito a mano es una segunda verdad: el día que una
jornada cambia en `hoja_de_ruta.py`, el documento sigue diciendo lo de antes y
alguien lo lee. Este sale de `src/lib/roadmap.seed.json`, que es exactamente lo
que la app le sirve al cliente. Si difieren, es que no se regeneró.

Correr con: python3 scripts/generar-plan-90-dias.py
Escribe: EL-CAMINO-DIA-POR-DIA.md

Con un argumento escribe ahí en vez de en la raíz, y así la auditoría puede
regenerarlo aparte y comparar sin tocar el archivo del repositorio.
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SEED = json.loads((RAIZ / 'src/lib/roadmap.seed.json').read_text(encoding='utf-8'))

# Las tres entregas del equipo. Mismos días que src/lib/entregasDelEquipo.ts: si
# se mueven allá, se mueven acá, y la prueba de los 90 días lo caza.
ENTREGAS = {
    0: ('ENTREGA 1 · El alta',
        'Subcuenta en MCD, número nuevo de WhatsApp, acceso a TCD y permisos de '
        'pagos y calendario. Sin esto no puede entrar.'),
    11: ('ENTREGA 2 · Sitios, formularios y contactos',
         'Se montan su página, su formulario de aplicación y su lista de '
         'contactos. Desbloquea publicar la página y recibir aplicaciones.'),
    29: ('ENTREGA 3 · Conversaciones, automatizaciones, reportes y WhatsApp',
         'Se conecta el WhatsApp, se arman las respuestas automáticas y los '
         'reportes. Desbloquea encender las campañas.'),
}

NOMBRE_TIPO = {
    'entrega_tecnica': 'Entrega del equipo',
    'sesion': 'Sesión',
    'protocolo': 'Protocolo',
    'rodaje': 'Rodaje',
    'campo': 'Día de campo',
    'espera': 'Espera activa',
    'ciclo': 'Cierre de semana',
    'cierre': 'Cierre',
}

FRENOS = {f['id']: f for f in SEED['frenos']}
PIEZAS = {p['codigo']: p['titulo'] for p in SEED['piezas']}
TUTORIALES = {t['codigo']: t['titulo'] for t in SEED.get('tutoriales', [])}
CINTURONES = {c['id']: c for c in SEED.get('cinturones', [])}

out = []
w = out.append

pro = SEED['promesa']
w('# El Camino, día por día')
w('')
w(f"Las {SEED['dias']} jornadas que la app le sirve al cliente, en el orden en que "
  'se abren. Generado desde `src/lib/roadmap.seed.json`: es exactamente lo que '
  've adentro, no una versión paralela.')
w('')
w(f"**La promesa:** {pro['consultantes']} consultantes, jornada de "
  f"{pro['jornada_horas']} horas, {pro['dias_semana']} días a la semana.")
w('')

# ── Cómo leerlo ───────────────────────────────────────────────────────
w('## Cómo leer esto')
w('')
w('- **El día que manda es el del trabajo, no el del almanaque.** Quien cierra '
  'la sesión 15 está en el día 15, aunque su cuenta tenga 31 días de vida. '
  'Todo lo que se abre, se abre por ese número.')
w('- **Una jornada no abre sin cerrar la anterior.** Es el freno `F-ORDEN`, y es '
  'el método: sin el protocolo escrito no hay programa que vender.')
w('- **Los días de campo no son huecos.** Son los días de atender a los '
  'consultantes que ya tiene. La promesa es cuatro horas, y ocuparle los cinco '
  'días rompe lo que el programa vino a arreglar.')
w('')

# ── Los cinco sistemas ────────────────────────────────────────────────
w('## Antes del día 1: la antesala')
w('')
w('El Camino abre con una sesión de 75 minutos que pide cabeza: diez números '
  'de medición, el pacto, la hora real neta. Antes de eso hay **cinco a siete '
  'días que no construyen nada**.')
w('')
w('El cliente elige de tres a cinco movidas entre seis áreas —sueño, '
  'pantallas, alimentación, movimiento, silencio, agua—, escribe qué va a '
  'hacer en cada una con una hora o un número, y las tilda un día por día. '
  'Al quinto se abre su sesión 1; al séptimo se cierra sola.')
w('')
w('**Lo diseña él.** Si le decimos a qué hora dormir y qué comer, le sumamos '
  'una obligación más a alguien que ya tiene de sobra, y la cumple dos días. '
  'Es la misma regla que el día 4 usa con sus disparadores.')
w('')
w('La fecha en que cierra la antesala es la que arranca los 90 días: así '
  'nadie sale de su semana de descanso con una semana de diferencia encima.')
w('')

w('## Hasta dónde llega cada escalón')
w('')
w('| Oferta | Qué abre del Camino | Quién monta lo técnico |')
w('| --- | --- | --- |')
w('| **La Base** · $1.000 | La antesala y los sistemas 1 y 2: días 1 al 10 y el '
  '12. Cierra con su precio, su método y su oferta en una página | Él, con los '
  'tutoriales |')
w('| **El Ascenso** · $3.000 | Los 90 días completos | Él, y lo revisa en la '
  'mentoría tres veces por semana |')
w('| **La Instalación** · $5.000 | Los 90 días completos | El equipo, con las '
  'tres entregas |')
w('')
w('Las tres entregas técnicas son del escalón que las compró. Antes el Camino '
  'no miraba el escalón, así que quien pagó la primera etapa tenía los 90 días '
  'abiertos y a las dos semanas el equipo recibía la tarea de montarle la '
  'instalación entera.')
w('')
w('**El tope corre con el escalón marcado.** La columna viene en `base` por '
  'defecto, así que mientras nadie marque la ficha el Camino se abre completo '
  'y las entregas no se disparan solas. Se marca una vez, en el alta.')
w('')
w('En La Base y en El Ascenso, lo técnico lo monta el cliente con los '
  'tutoriales de la app, y su Camino se lo muestra en el día de cada pieza: su '
  'página el día 16, su formulario y su calendario el 17, su bandeja el 25, '
  'Meta y su pixel el 29.')
w('')

w('## Los cinco sistemas')
w('')
for s in SEED['sistemas']:
    w(f"**{s['n']} · {s['nombre']}** — días {s['dias']}")
w('')

# ── Los tres hitos ────────────────────────────────────────────────────
w('## Los tres momentos en que cambia de etapa')
w('')
w('| Día | Qué pasa | Qué cambia en la app |')
w('| --- | --- | --- |')
w('| 11 | El equipo le monta sitios y formularios | Puede publicar su página y '
  'recibir aplicaciones |')
w('| 29 | Conecta Meta y su pixel empieza a medir | El cuarto destino del menú '
  'deja de ser Mi ADN y se convierte en **Campañas**, con el montaje adentro |')
w('| 31 | **Enciende sus dos campañas** | Aparece la ceremonia que marca el '
  'cambio de etapa, y desde ese día la pantalla de Hoy abre con sus seis '
  'números y la frase que dice dónde se corta |')
w('| 90 | Graduación | Cinturón negro primer dan |')
w('')

# ── Las entregas ──────────────────────────────────────────────────────
w('## Las tres entregas del equipo')
w('')
w('Las dispara el cron por el **día del trabajo** del cliente: montarle los '
  'formularios a quien todavía no escribió su oferta es trabajo que se hace dos '
  'veces. El cliente recibe el aviso de qué llega y qué va a poder hacer; al '
  'equipo le entra la tarea con el nombre adelante.')
w('')
for dia, (titulo, que) in sorted(ENTREGAS.items()):
    w(f'**Día {dia} — {titulo}**')
    w('')
    w(f'{que}')
    w('')

# ── Día por día ───────────────────────────────────────────────────────
w('## Día por día')
w('')

# Los sistemas no se usan como títulos de sección: una jornada del día 70 puede
# pertenecer al sistema 3, así que agruparlos partiría el orden de los días, que
# es el orden en que el cliente los vive. Cada día dice a cuál pertenece.
NOMBRE_SISTEMA = {s['n']: s['nombre'] for s in SEED['sistemas']}

for jor in SEED['jornadas']:
    dia = jor['dia']
    etiqueta = NOMBRE_TIPO.get(jor['tipo'], jor['tipo'])
    minutos = jor.get('minutos') or 0
    w(f"### Día {dia} · {jor['titulo']}")
    w('')
    reng = [etiqueta]
    if minutos:
        reng.append(f'{minutos} min')
    if jor.get('sistema'):
        reng.append(f"sistema {jor['sistema']}: {NOMBRE_SISTEMA[jor['sistema']]}")
    if jor.get('agente'):
        reng.append(f"entrenador: {jor['agente']}")
    w('*' + ' · '.join(reng) + '*')
    w('')

    if dia in ENTREGAS:
        w(f'> **{ENTREGAS[dia][0]}.** {ENTREGAS[dia][1]}')
        w('')

    if jor['pasos']:
        for p in jor['pasos']:
            w(f'- {p}')
        w('')

    if jor.get('acciones_campo'):
        w('**Lo que hace este día:**')
        w('')
        for a in jor['acciones_campo']:
            w(f'- {a}')
        w('')

    evid = [e for e in jor.get('evidencias') or []]
    if evid:
        w('**Lo que queda hecho:** ' + ' · '.join(e['nombre'] for e in evid))
        w('')

    if jor.get('acceso'):
        w(f"**Se le habilita:** {jor['acceso']}")
        w('')

    # Los frenos NO se imprimen por día. El seed guarda en qué jornada se activa
    # y en cuál se levanta cada uno, y esos dos campos tienen ruido: F-PAGINA
    # figura levantándose el día 11 y activándose el 16, y F-RODAJE activándose
    # el día 46, que es «Tus cinco niveles» y no tiene nada que ver con grabar.
    # Imprimirlos por día convertía ese ruido en una frase afirmada. Van juntos
    # en su propia sección, que es lo que el seed sí sostiene: la regla.

    if jor.get('cinturon'):
        c = CINTURONES.get(jor['cinturon'], {})
        w(f"**Cinturón:** {c.get('nombre', jor['cinturon'])}")
        w('')

    if jor.get('veredicto'):
        w(f"**Veredicto:** {jor['veredicto']}")
        w('')

    if jor.get('nota'):
        w(f"*{jor['nota']}*")
        w('')

# ── Los frenos ────────────────────────────────────────────────────────
w('## Los diez frenos')
w('')
w('Las reglas que el programa no negocia. El primero, `F-ORDEN`, es el que '
  'sostiene todo lo demás: una jornada no abre sin cerrar la anterior.')
w('')
for f in SEED['frenos']:
    w(f"**{f['id']}** — {f['regla']}")
    if f.get('mensaje'):
        w('')
        w(f"> {f['mensaje']}")
    w('')

# ── El resumen que importa ────────────────────────────────────────────
tramos = [(1, 29, 'construir'), (30, 60, 'encender y corregir'), (61, 90, 'sostener')]
w('## El reparto del trabajo')
w('')
w('| Tramo | Qué está haciendo | Sesiones | Minutos | Días de campo |')
w('| --- | --- | --- | --- | --- |')
for a, b, que in tramos:
    t = [x for x in SEED['jornadas'] if a <= x['dia'] <= b]
    ses = sum(1 for x in t if x['tipo'] not in ('campo', 'entrega_tecnica'))
    minu = sum(x.get('minutos') or 0 for x in t)
    cam = sum(1 for x in t if x['tipo'] == 'campo')
    w(f'| {a}-{b} | {que} | {ses} | {minu} | {cam} |')
w('')

destino = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / 'EL-CAMINO-DIA-POR-DIA.md'
destino.write_text('\n'.join(out) + '\n', encoding='utf-8')
print(f'escrito: {destino.name} · {len(out)} renglones · '
      f"{len(SEED['jornadas'])} jornadas")
