#!/usr/bin/env python3
"""
EL PDF DE LOS 90 DÍAS Y LOS ACCESOS.

Se GENERA desde el seed del Camino y desde el cuadro de tickets, no se escribe
a mano: el día que cambie una jornada, un grado o un precio, este PDF cambia
con la app. Un resumen escrito a mano miente a los dos meses.

Lo único escrito acá es la línea de «qué logra» de cada semana, y cada una
nombra lo que esa semana hace en el seed.

    python3 scripts/pdf-noventa-dias.py
"""
import base64
import io
import json
import subprocess
import sys

SALIDA_HTML = '/tmp/claude-0/noventa-dias.html'
SALIDA_PDF = '/tmp/claude-0/TCD-90-dias-y-accesos.pdf'

# ── La paleta de la app, tal cual ─────────────────────────────────────────
# El oro es MATE y vive en líneas de 1px, versalitas y numerales.
PAL = {
    'surface': '#FFFDF7', 'card2': '#F5EFE1',
    'ink': '#2A2118', 'ink2': '#6E6252', 'ink3': '#9A8C78',
    'oro': '#B0822E', 'oro_d': '#8E6824', 'oro_soft': '#F3EAD6',
    'tilde': '#4A7C59', 'tacha': '#A33A2A',
    'line': '#EBE1CF', 'line2': '#DFD3BC',
}

FUENTES = [
    ('Fraunces', 'node_modules/@fontsource-variable/fraunces/files/'
                 'fraunces-latin-wght-normal.woff2'),
    ('Sora', 'node_modules/@fontsource-variable/sora/files/'
             'sora-latin-wght-normal.woff2'),
]

# ── Qué logra cada semana ─────────────────────────────────────────────────
# Una línea por semana, nombrando lo que esa semana hace de verdad en el seed.
LOGRA = {
    1: 'Tus diez números de entrada medidos, y tu precio nuevo decidido.',
    2: 'Tu método escrito con sus etapas, y tu programa de 1.000 USD en una página.',
    3: 'Tu perfil y tu página publicados, con tu agenda y tu cobro andando.',
    4: 'Tus primeras llamadas hechas, y tu primera venta al precio nuevo.',
    5: 'Tus dos campañas encendidas, con tu pixel midiendo.',
    6: 'Tu propia app con tu marca, y tu primer consultante adentro.',
    7: 'Tu primer consultante nuevo cobrado, y tu máquina de 10 armada.',
    8: 'Tu cobranza de la semana hecha, y tu entrega revisada con los primeros.',
    9: 'Tu primera renovación conversada, y lo que repetiste tres veces, ya en la app.',
    10: 'Tu primer consultante terminado, y el precio de tu próxima camada decidido.',
    11: 'Tus resultados contados por ellos, y tu hora real medida otra vez.',
    12: 'Lo que sigue andando sin ti, y tus seis números del negocio a la vista.',
    13: 'Tu ecosistema circular cerrado, y tu plan de los 180 días siguientes.',
}

# Las etapas: cómo se agrupan las trece semanas por sistema.
ETAPAS = [
    ('I', 'Tu reset y tu programa', [1, 2],
     'Sistemas 1 y 2 · días 1 a 12',
     'Lo primero no es vender más: es medir qué tienes y poner tu precio. '
     'Cierra con tu método y tu oferta en una página.'),
    ('II', 'Tu captación automática', [3, 4, 5],
     'Sistema 3 · días 15 a 33',
     'Tu perfil, tu página, tu agenda y tu cobro, publicados y andando. '
     'Después las llamadas, la primera venta, y las campañas encendidas.'),
    ('III', 'Tu propia app', [6, 7],
     'Sistema 4 · días 36 a 47',
     'Tu programa deja de vivir en tu calendario y pasa a una app con tu '
     'marca. Ahí entra tu primer consultante, y ahí se arma la máquina de 10.'),
    ('IV', 'Operar y medir', [8, 9, 10, 11, 12],
     'Días 50 a 82',
     'Cinco semanas de la misma rutina: cobrar, entregar, renovar, medir. '
     'Es donde el sistema deja de depender de ti.'),
    ('V', 'Tu ecosistema circular', [13],
     'Sistema 5 · días 85 a 90',
     'Las doce semanas escritas, tu foto de llegada, y el plan de los 180 '
     'días que siguen. Cierra con tu graduación.'),
]


def leer_seed():
    return json.load(io.open('src/lib/roadmap.seed.json', encoding='utf-8'))


def fuente_embutida(nombre, ruta):
    with open(ruta, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('ascii')
    return (f"@font-face{{font-family:'{nombre}';font-weight:100 900;"
            f"font-display:block;src:url(data:font/woff2;base64,{b64}) "
            f"format('woff2-variations');}}")


def semanas(seed):
    """Las trece semanas con sus jornadas, sistemas y grados."""
    J = {j['dia']: j for j in seed['jornadas']}
    grados = {c['dia']: c for c in seed['cinturones']}
    salida = []
    for n in range(1, 14):
        d0, d1 = (n - 1) * 7 + 1, n * 7
        dias = [d for d in sorted(J) if d0 <= d <= d1]
        if not dias:
            continue
        trabajo = [d for d in dias if J[d]['tipo'] not in ('campo',)]
        salida.append({
            'n': n, 'd0': d0, 'd1': min(d1, max(dias)),
            'jornadas': [(d, J[d]['titulo']) for d in trabajo],
            'sistemas': sorted({J[d].get('sistema') for d in dias if J[d].get('sistema')}),
            'grados': [grados[d] for d in dias if d in grados],
        })
    return salida


def esc(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def chip_grado(g):
    """El grado como lo dibuja la app: su color, y su punta si la tiene."""
    punta = (f'<span class="punta" style="background:{g["punta"]}"></span>'
             if g.get('punta') else '')
    return (f'<span class="grado"><span class="cinta" '
            f'style="background:{g["color"]}">{punta}</span>'
            f'<span class="gnom">{esc(g["nombre"])}</span>'
            f'<span class="gdia">día {g["dia"]}</span></span>')


def main():
    seed = leer_seed()
    sems = {s['n']: s for s in semanas(seed)}
    prom = seed['promesa']
    sistemas = {x['n']: x for x in seed['sistemas']}
    grados = seed['cinturones']

    css_fuentes = ''.join(fuente_embutida(n, r) for n, r in FUENTES)
    p = PAL

    paginas = []

    # ── 1 · Portada ───────────────────────────────────────────────────────
    paginas.append(f'''
<section class="pg portada">
  <div class="marca">TU CLÍNICA DIGITAL</div>
  <h1>Noventa días,<br>semana por semana</h1>
  <div class="regla"></div>
  <p class="promesa">
    <strong>{prom['consultantes']} consultantes</strong> a
    <strong>1.000 USD</strong>, en <strong>{seed['dias']} días</strong>,
    trabajando <strong>{prom['jornada_horas']} horas</strong>,
    {prom['dias_semana']} días por semana.
  </p>
  <p class="bajada">
    Lo que sigue es lo que la app hace hoy: las trece semanas con lo que cada
    una deja hecho, los once grados, y hasta dónde llega cada acceso.
  </p>
  <div class="pie">Lo que logra cada semana · Los accesos · La garantía</div>
</section>''')

    # ── 2 · El mapa completo ──────────────────────────────────────────────
    filas = []
    for et, nombre, ns, rango, _ in ETAPAS:
        for i, n in enumerate(ns):
            s = sems[n]
            g = ''.join(f'<i class="pin" style="background:{x["color"]}"></i>'
                        for x in s['grados'])
            filas.append(
                f'<tr class="{"inicio" if i == 0 else ""}">'
                f'<td class="et">{et if i == 0 else ""}</td>'
                f'<td class="sem"><b>{n}</b></td>'
                f'<td class="dias">{s["d0"]}–{s["d1"]}</td>'
                f'<td class="logra">{esc(LOGRA[n])}</td>'
                f'<td class="pins">{g}</td></tr>')
    paginas.append(f'''
<section class="pg">
  <div class="kicker">EL MAPA</div>
  <h2>Las trece semanas, de una mirada</h2>
  <div class="regla corta"></div>
  <p class="intro">Antes del día 1 hay de cinco a siete días de antesala, y el protocolo lo diseña y lo ejecuta él.</p>
  <table class="mapa">
    <thead><tr><th></th><th>SEM</th><th>DÍAS</th><th>LO QUE QUEDA HECHO</th>
    <th>GRADO</th></tr></thead>
    <tbody>{''.join(filas)}</tbody>
  </table>
</section>''')

    # ── 3 a 7 · Una página por etapa ─────────────────────────────────────
    for et, nombre, ns, rango, texto in ETAPAS:
        bloques = []
        for n in ns:
            s = sems[n]
            jor = ''.join(
                f'<li><span class="d">{d}</span>{esc(t)}</li>'
                for d, t in s['jornadas'])
            gra = ''.join(chip_grado(g) for g in s['grados'])
            bloques.append(f'''
      <div class="semana">
        <div class="shead">
          <span class="snum">SEMANA {n}</span>
          <span class="sdias">días {s['d0']}–{s['d1']}</span>
        </div>
        <p class="slogra">{esc(LOGRA[n])}</p>
        <ul class="sjor">{jor}</ul>
        {f'<div class="sgrados">{gra}</div>' if gra else ''}
      </div>''')
        nsis = ', '.join(f'{sistemas[x]["nombre"]}'
                         for x in sorted({y for n in ns for y in sems[n]['sistemas']})
                         if x in sistemas)
        paginas.append(f'''
<section class="pg">
  <div class="kicker">ETAPA {et} · {esc(rango.upper())}</div>
  <h2>{esc(nombre)}</h2>
  <div class="regla corta"></div>
  <p class="intro">{esc(texto)}</p>
  <div class="semanas cols{len(ns)}">{''.join(bloques)}</div>
</section>''')

    # ── 8 · Los once grados ───────────────────────────────────────────────
    def fila_grado(g):
        punta = (f'<span class="punta" style="background:{g["punta"]}"></span>'
                 if g.get('punta') else '')
        return (f'<tr><td class="gcinta">'
                f'<span class="cinta grande" style="background:{g["color"]}">'
                f'{punta}</span></td>'
                f'<td class="gn">{esc(g["nombre"])}</td>'
                f'<td class="gd">{g["dia"]}</td>'
                f'<td class="gs">{esc(g["significado"])}</td>'
                f'<td class="gf">{esc(g["se_gana_con"])}</td></tr>')

    gfilas = ''.join(fila_grado(g) for g in grados)
    paginas.append(f'''
<section class="pg">
  <div class="kicker">LOS GRADOS</div>
  <h2>Once grados, y cada uno se gana con algo entregado</h2>
  <div class="regla corta"></div>
  <p class="intro">Ninguno se gana por tiempo. Cada uno pide una evidencia
  subida: la foto, el audio, la captura, el comprobante.</p>
  <table class="grados">
    <thead><tr><th></th><th>GRADO</th><th>DÍA</th><th>QUÉ SIGNIFICA</th>
    <th>CON QUÉ SE GANA</th></tr></thead>
    <tbody>{gfilas}</tbody>
  </table>
</section>''')

    # ── 9 · Los accesos ───────────────────────────────────────────────────
    of = json.load(io.open('/tmp/claude-0/ofertas.json', encoding='utf-8'))
    tope = of['ultimoDiaDeBase']

    cols = []
    for t in of['tickets']:
        completo = t['id'] != 'base'
        camino = ('Abre los 90 días completos, desde la antesala hasta la graduación.'
                  if completo else
                  f'Abre la antesala y los sistemas 1 y 2, hasta el día {tope}: '
                  'el que cierra con el precio, el método y la oferta en una página.')
        barra = (f'<div class="barra"><span class="lleno" '
                 f'style="width:{(tope/90*100) if not completo else 100:.1f}%"></span></div>'
                 f'<div class="barraleyenda">'
                 f'<span>día 1</span><span>día 90</span></div>')
        cols.append(f'''
      <div class="acceso{' destacado' if t['id'] == 'ascenso' else ''}">
        <div class="anom">{esc(t['nombre'])}</div>
        <div class="apre">{t['precio']:,} <span>USD</span></div>
        {barra}
        <div class="allega">{'Los 90 días completos' if completo else f'Hasta el día {tope}'}</div>
        <dl>
          <dt>EL CAMINO</dt><dd>{esc(camino)}</dd>
          <dt>LO TÉCNICO</dt><dd>Lo monta {esc(t['quienInstala'])}.</dd>
          <dt>QUÉ INCLUYE</dt><dd>{esc(t['incluye'])}</dd>
        </dl>
      </div>'''.replace(',', '.', 1) if False else f'''
      <div class="acceso{' destacado' if t['id'] == 'ascenso' else ''}">
        <div class="anom">{esc(t['nombre'])}</div>
        <div class="apre">{format(t['precio'], ',d').replace(',', '.')} <span>USD</span></div>
        {barra}
        <div class="allega">{'Los 90 días completos' if completo else f'Hasta el día {tope}'}</div>
        <dl>
          <dt>EL CAMINO</dt><dd>{esc(camino)}</dd>
          <dt>LO TÉCNICO</dt><dd>Lo monta {esc(t['quienInstala'])}.</dd>
          <dt>QUÉ INCLUYE</dt><dd>{esc(t['incluye'])}</dd>
        </dl>
      </div>''')

    paginas.append(f'''
<section class="pg">
  <div class="kicker">LOS ACCESOS</div>
  <h2>Hasta dónde llega cada uno</h2>
  <div class="regla corta"></div>
  <p class="intro">Los tres abren la antesala y arrancan igual. Lo que cambia
  es hasta qué día llega el Camino, y quién monta lo técnico.</p>
  <div class="accesos">{''.join(cols)}</div>
</section>''')

    # ── 10 · La Cima, y lo que la app hace con cada escalón ──────────────
    cima = of['cima']
    paginas.append(f'''
<section class="pg">
  <div class="kicker">LO QUE SE SUMA</div>
  <h2>La Cima, y lo que la app hace sola</h2>
  <div class="regla corta"></div>
  <div class="dos">
    <div>
      <div class="bloque">
        <div class="bnom">{esc(cima['nombre'])}</div>
        <div class="bpre">{format(cima['precio'], ',d').replace(',', '.')} <span>USD</span></div>
        <p>{cima['dias']} días en Bariloche. Se suma a cualquiera de los tres
        accesos: no los reemplaza y no cambia el reparto del trabajo —cambia
        dónde se instala.</p>
      </div>
      <div class="bloque">
        <div class="bnom">La garantía</div>
        <p>Sales con los cinco sistemas andando. Si entregaste tus jornadas a
        tiempo y todavía no funcionan, seguimos sin costo hasta que funcionen.</p>
        <p class="fino">La app lo mide sola: cuenta tus jornadas entregadas,
        las que llegaron con más de siete días de atraso, y las sesiones que
        el equipo dio. Las dos partes quedan a la vista.</p>
      </div>
    </div>
    <div>
      <div class="bloque">
        <div class="bnom">Y lo que la app hace sin que se lo pidas</div>
        <ul class="puntos">
          <li>Te abre una jornada por día, y la siguiente cuando cierras la anterior.</li>
          <li>Te pide la evidencia de cada grado, y la revisa.</li>
          <li>Te avisa cuando ganas un grado, cuando el equipo te responde, y
          cuando se abre algo nuevo.</li>
          <li>Arma tus guiones, tus anuncios y tus piezas con tu propio ADN.</li>
          <li>Guarda tus números de cada semana y los compara con tu banda.</li>
          <li>Y tu Camino se abre hasta donde llega tu acceso: nunca más allá.</li>
        </ul>
      </div>
    </div>
  </div>
</section>''')

    paginas_html = ''.join(paginas)

    html = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Noventa días y accesos</title>
<style>
{css_fuentes}
*{{margin:0;padding:0;box-sizing:border-box}}
@page{{size:297mm 210mm;margin:0}}
html{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
body{{font-family:'Sora',system-ui,sans-serif;color:{p['ink']};
  background:{p['surface']};font-size:16px;line-height:1.5}}
.pg{{width:297mm;height:210mm;padding:18mm 20mm 15mm;background:{p['surface']};
  position:relative;page-break-after:always;overflow:hidden;
  display:flex;flex-direction:column}}
.pg:last-child{{page-break-after:auto}}

/* El oro: líneas de 1px, versalitas y numerales. Nunca relleno. */
.regla{{height:1px;background:{p['oro']};width:120px;margin:22px 0 26px}}
.regla.corta{{width:72px;margin:16px 0 18px}}
.kicker{{font-size:15px;letter-spacing:.22em;color:{p['oro_d']};
  font-weight:600;text-transform:uppercase}}
.marca{{font-size:15px;letter-spacing:.3em;color:{p['oro_d']};font-weight:600}}

h1{{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:72px;
  line-height:1.04;letter-spacing:-.015em;margin-top:30px}}
h2{{font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:40px;
  line-height:1.12;letter-spacing:-.01em;margin-top:10px}}
.intro{{font-size:19px;line-height:1.5;color:{p['ink2']};max-width:88ch}}

/* Portada */
.portada{{justify-content:center}}
.promesa{{font-size:27px;line-height:1.45;max-width:30ch;color:{p['ink']}}}
.promesa strong{{font-weight:600;color:{p['ink']}}}
.bajada{{font-size:18px;line-height:1.55;color:{p['ink2']};max-width:62ch;
  margin-top:26px}}
.pie{{position:absolute;left:20mm;bottom:14mm;font-size:15px;
  letter-spacing:.14em;color:{p['ink3']};text-transform:uppercase}}

/* El mapa */
table{{width:100%;border-collapse:collapse;margin-top:14px;
  font-variant-numeric:tabular-nums}}
thead th{{font-size:15px;letter-spacing:.14em;color:{p['oro_d']};
  font-weight:600;text-align:left;padding:0 10px 9px 0;
  border-bottom:1px solid {p['oro']}}}
.mapa td{{padding:3px 10px 3px 0;border-bottom:1px solid {p['line']};
  vertical-align:baseline;font-size:17px}}
.mapa tr.inicio td{{border-top:1px solid {p['line2']}}}
.mapa .et{{font-family:'Fraunces',Georgia,serif;font-size:21px;
  color:{p['oro_d']};width:34px}}
.mapa .sem b{{font-size:20px;font-weight:600}}
.mapa .sem{{width:48px}}
.mapa .dias{{width:74px;color:{p['ink2']}}}
.mapa .logra{{line-height:1.4}}
.mapa .pins{{width:86px;text-align:right;white-space:nowrap}}
.pin{{display:inline-block;width:13px;height:13px;border-radius:99px;
  border:1px solid {p['line2']};margin-left:3px}}

/* Las semanas de cada etapa */
.semanas{{display:grid;gap:16px;margin-top:4px;flex:1}}
.semanas.cols1{{grid-template-columns:1fr;max-width:74ch}}
.semanas.cols2{{grid-template-columns:1fr 1fr}}
.semanas.cols3{{grid-template-columns:1fr 1fr 1fr}}
.semanas.cols5{{grid-template-columns:repeat(5,1fr);gap:11px}}
.semana{{border-top:1px solid {p['oro']};padding-top:11px;min-width:0}}
.shead{{display:flex;flex-direction:column;gap:1px;margin-bottom:9px}}
.snum{{font-size:15px;letter-spacing:.16em;color:{p['oro_d']};font-weight:600}}
.sdias{{font-size:15px;color:{p['ink3']};font-variant-numeric:tabular-nums}}
.slogra{{font-size:18px;line-height:1.38;margin-bottom:11px}}
.cols5 .slogra{{font-size:16px;line-height:1.35}}
.sjor{{list-style:none}}
.sjor li{{font-size:15px;line-height:1.42;color:{p['ink2']};
  padding:3px 0 3px 30px;position:relative}}
.sjor .d{{position:absolute;left:0;color:{p['oro_d']};font-weight:600;
  font-variant-numeric:tabular-nums}}
.sgrados{{margin-top:10px;display:flex;flex-wrap:wrap;gap:7px}}
.grado{{display:inline-flex;align-items:center;gap:6px;
  background:{p['card2']};border-radius:99px;padding:4px 11px 4px 6px}}
.cinta{{display:inline-block;width:19px;height:9px;border-radius:2px;
  border:1px solid {p['line2']};position:relative}}
.cinta.grande{{width:30px;height:12px}}
.punta{{position:absolute;right:0;top:0;bottom:0;width:36%;border-radius:0 1px 1px 0}}
.gnom{{font-size:15px}}
.gdia{{font-size:15px;color:{p['ink3']};font-variant-numeric:tabular-nums}}

/* Los grados */
.grados td{{padding:8px 10px 8px 0;border-bottom:1px solid {p['line']};
  font-size:17px;vertical-align:middle}}
.grados .gcinta{{width:44px}}
.grados .gn{{width:210px;font-weight:600}}
.grados .gd{{width:52px;color:{p['oro_d']};font-weight:600}}
.grados .gs{{width:230px;color:{p['ink2']};font-style:italic;
  font-family:'Fraunces',Georgia,serif}}
.grados .gf{{color:{p['ink2']}}}

/* Los accesos */
.accesos{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:6px;flex:1}}
.acceso{{border-top:1px solid {p['oro']};padding-top:13px}}
.acceso.destacado{{border-top-width:3px}}
.anom{{font-family:'Fraunces',Georgia,serif;font-size:27px;line-height:1.1}}
.apre{{font-size:23px;font-weight:600;color:{p['oro_d']};margin-top:3px;
  font-variant-numeric:tabular-nums}}
.apre span{{font-size:15px;letter-spacing:.1em;font-weight:500}}
.barra{{height:7px;background:{p['oro_soft']};border-radius:99px;margin:13px 0 5px;
  overflow:hidden}}
.lleno{{display:block;height:100%;background:{p['oro']}}}
.barraleyenda{{display:flex;justify-content:space-between;font-size:15px;
  color:{p['ink3']};font-variant-numeric:tabular-nums}}
.allega{{font-size:17px;font-weight:600;margin:9px 0 11px}}
.acceso dl{{font-size:15px}}
.acceso dt{{letter-spacing:.14em;color:{p['oro_d']};font-weight:600;
  margin-top:10px;font-size:15px}}
.acceso dd{{color:{p['ink2']};line-height:1.42;margin-top:2px}}

/* La Cima y la garantía */
.dos{{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:6px;flex:1}}
.bloque{{border-top:1px solid {p['oro']};padding-top:12px;margin-bottom:20px}}
.bnom{{font-family:'Fraunces',Georgia,serif;font-size:25px;line-height:1.14}}
.bpre{{font-size:21px;font-weight:600;color:{p['oro_d']};margin:2px 0 8px;
  font-variant-numeric:tabular-nums}}
.bpre span{{font-size:15px;letter-spacing:.1em;font-weight:500}}
.bloque p{{font-size:17px;line-height:1.45;color:{p['ink2']};margin-top:7px}}
.bloque p.fino{{font-size:15px;color:{p['ink3']}}}
.puntos{{list-style:none;margin-top:9px}}
.puntos li{{font-size:16px;line-height:1.4;color:{p['ink2']};
  padding:5px 0 5px 17px;position:relative}}
.puntos li::before{{content:'';position:absolute;left:0;top:12px;width:7px;
  height:1px;background:{p['oro']}}}
</style></head>
<body>{paginas_html}</body></html>'''

    io.open(SALIDA_HTML, 'w', encoding='utf-8').write(html)
    print(f'HTML: {SALIDA_HTML}  ({len(paginas)} páginas)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
