#!/usr/bin/env python3
"""Arma el PDF de todo lo que falta grabar.

Una pieza por página, agrupadas por set de rodaje: en un día de pizarra están
todas las de pizarra seguidas. Estética de la tapa del libro: papel crema,
Cormorant Garamond en los títulos, Lora en el cuerpo, oro mate solo en líneas
finas y versalitas.
"""
import base64
import os
import html
import json
import pathlib
import re
import subprocess

REPO = pathlib.Path(__file__).resolve().parent.parent
BASE = pathlib.Path(os.environ.get('SALIDA_PDF', REPO / 'dist-pdf'))
BASE.mkdir(parents=True, exist_ok=True)
FUENTES = REPO / 'node_modules/@fontsource-variable'

# Los datos los junta scripts/datos-grabacion.ts, que es quien sabe leer el
# Camino. Acá solo se arma el PDF.
subprocess.run(['npx', 'tsx', str(REPO / 'scripts/datos-grabacion.ts')],
               cwd=REPO, check=True, env={**os.environ, 'SALIDA_PDF': str(BASE)})
datos = json.loads((BASE / 'datos.json').read_text('utf8'))
JAVO, LUPE = datos['javo'], datos['lupe']


def fuente(ruta):
    return base64.b64encode((FUENTES / ruta).read_bytes()).decode()


CG = fuente('cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2')
CGI = fuente('cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2')
LO = fuente('lora/files/lora-latin-wght-normal.woff2')
LOI = fuente('lora/files/lora-latin-wght-italic.woff2')

# Los sets, en el orden en que conviene grabarlos: primero lo que depende del
# clima, después lo de adentro.
SETS = [
    ('montaña', 'En la montaña', 'Afuera. Tres piezas cortas, las tres de arranque o de cierre de etapa.'),
    ('lago', 'En el lago', 'Afuera. Una sola pieza, la última del Camino.'),
    ('pizarra', 'En la pizarra', 'Lo que se explica dibujando. Conviene un solo día para las ocho.'),
    ('oficina', 'En la oficina', 'A cámara, sentado. Lo más cercano a una conversación.'),
    ('pantalla', 'Compartiendo pantalla', 'Lo que se muestra haciéndolo. Diez piezas, el bloque más grande.'),
    ('voz', 'Solo tu voz', 'Sin cámara. Se graba el audio y se acompaña con imagen después.'),
]

TOTAL_MIN = sum(p['minutos'] for p in JAVO)
TOTAL_LUPE = sum(t['minutos'] for t in LUPE)


def esc(t):
    return html.escape(t or '')


def bloques_del_guion(g):
    """El guión partido en bloques: ('beat', texto) o ('linea', texto)."""
    out = []
    for bloque in (g or '').strip().split('\n'):
        b = bloque.strip()
        if not b:
            continue
        m = re.match(r'^\[([^\]]+)\]$', b)
        out.append(('beat', m.group(1)) if m else ('linea', b))
    return out


def guion_html(g):
    """El guión entero, con cada marca como versalita de oro.

    No se parte a mano. Un guión de diez minutos no entra en una página con
    letra grande, y achicar la letra no es una opción — así que las piezas
    largas siguen en la hoja de al lado. Para que nadie se pierda, cada hoja
    lleva al pie de qué video es, y un beat nunca queda solo al final de una
    página: se va entero con su texto.
    """
    out = []
    for tipo, t in bloques_del_guion(g):
        if tipo == 'beat':
            out.append(f'<p class="beat">{esc(t)}</p>')
        else:
            out.append(f'<p class="linea">{esc(t)}</p>')
    return '\n'.join(out)


def minutos(n):
    return f'{n:g} min'


# ───────────────────────── las páginas ─────────────────────────
paginas = []

# Portada
paginas.append(f'''
<section class="hoja portada">
  <p class="versal">Tu Clínica Digital</p>
  <h1>Lo que falta<br>grabar</h1>
  <div class="regla"></div>
  <p class="bajada">{len(JAVO)} videos tuyos · {minutos(TOTAL_MIN)} en total<br>
  {len(LUPE)} pasos a paso de pantalla · {minutos(TOTAL_LUPE)}</p>
  <p class="pie">Cada pieza con su guión completo. Agrupadas por dónde se graba.</p>
</section>''')

# El plan de rodaje
filas = []
for clave, nombre, _ in SETS:
    ps = [p for p in JAVO if p['set'] == clave]
    if not ps:
        continue
    filas.append(
        f'<tr><td class="n">{len(ps)}</td><td>{esc(nombre)}</td>'
        f'<td class="n">{minutos(sum(p["minutos"] for p in ps))}</td></tr>'
    )
paginas.append(f'''
<section class="hoja">
  <p class="versal">El plan</p>
  <h2>Seis días de rodaje</h2>
  <p class="intro">Un día por lugar. Empieza por lo de afuera, que depende del clima,
  y deja la pantalla para el final: es el bloque más largo y el único que se puede
  partir en dos.</p>
  <table class="plan">{''.join(filas)}</table>
  <p class="nota">Los {len(LUPE)} pasos a paso de pantalla los graba Lupe, y están al final.</p>
</section>''')

# Una página por video, agrupadas por set
for clave, nombre, bajada in SETS:
    ps = [p for p in JAVO if p['set'] == clave]
    if not ps:
        continue
    paginas.append(f'''
<section class="hoja set">
  <p class="versal">{len(ps)} {"pieza" if len(ps) == 1 else "piezas"} · {minutos(sum(p["minutos"] for p in ps))}</p>
  <h2 class="grande">{esc(nombre)}</h2>
  <div class="regla"></div>
  <p class="bajada">{esc(bajada)}</p>
  <ul class="indice">
    {''.join(f'<li><span class="dia">Día {p["dia"]}</span> {esc(p["titulo"])} <span class="min">{minutos(p["minutos"])}</span></li>' for p in ps)}
  </ul>
</section>''')
    for p in ps:
        paginas.append(f'''
<section class="hoja pieza">
  <p class="versal">Día {p['dia']} · {minutos(p['minutos'])} · {esc(nombre)}</p>
  <h3>{esc(p['titulo'])}</h3>
  <p class="proposito">{esc(p['proposito'])}</p>
  <div class="regla fina"></div>
  <div class="guion">{guion_html(p['guion'])}</div>
</section>''')

# Los de Lupe
paginas.append(f'''
<section class="hoja set">
  <p class="versal">{len(LUPE)} piezas · {minutos(TOTAL_LUPE)}</p>
  <h2 class="grande">Paso a paso<br>en pantalla</h2>
  <div class="regla"></div>
  <p class="bajada">Los graba Lupe, compartiendo pantalla. Cada uno ya tiene su texto
  escrito dentro de la app, así que el cliente puede hacerlos hoy mismo leyendo.</p>
  <ul class="indice">
    {''.join(f'<li><span class="dia">Día {t["dia"]}</span> {esc(t["titulo"])} <span class="min">{minutos(t["minutos"])}</span></li>' for t in LUPE)}
  </ul>
</section>''')
for t in LUPE:
    pasos = ''.join(f'<li>{esc(p)}</li>' for p in t['pasos'])
    falla = f'<p class="falla"><span class="etiqueta">Si algo falla</span> {esc(t["siFalla"])}</p>' if t['siFalla'] else ''
    paginas.append(f'''
<section class="hoja pieza">
  <p class="versal">Día {t['dia']} · {minutos(t['minutos'])} · Lupe{(' · ' + esc(t['donde'])) if t['donde'] else ''}</p>
  <h3>{esc(t['titulo'])}</h3>
  <p class="proposito">{esc(t['intro'])}</p>
  <div class="regla fina"></div>
  <ol class="pasos">{pasos}</ol>
  {falla}
</section>''')

CSS = f'''
@font-face {{ font-family: 'CG'; src: url(data:font/woff2;base64,{CG}) format('woff2'); font-weight: 300 700; }}
@font-face {{ font-family: 'CG'; src: url(data:font/woff2;base64,{CGI}) format('woff2'); font-weight: 300 700; font-style: italic; }}
@font-face {{ font-family: 'Lora'; src: url(data:font/woff2;base64,{LO}) format('woff2'); font-weight: 400 700; }}
@font-face {{ font-family: 'Lora'; src: url(data:font/woff2;base64,{LOI}) format('woff2'); font-weight: 400 700; font-style: italic; }}

/*
  El margen vive en la página y no en la caja, así una pieza que sigue en la
  hoja de al lado hereda el mismo aire. Con el padding en la caja, lo que
  desbordaba empezaba pegado al borde y sobre papel cortado.
*/
@page {{ size: 148mm 210mm; margin: 16mm 14mm; background: #EAE4D9; }}

/* Las hojas de las piezas van sobre el papel claro, de borde a borde. */
@page papel {{
  background: #F6F2E9;
  /* De qué video es esta hoja. Resuelve el «¿esto de dónde venía?» de la
     segunda página de un guión largo, sin repetir el título entero arriba. */
  @bottom-center {{
    content: string(pieza);
    font-family: 'Lora', Georgia, serif; font-size: 8.5pt; color: #8E6824;
    margin-top: 5mm;
  }}
}}

* {{ box-sizing: border-box; }}
body {{ margin: 0; font-family: 'Lora', Georgia, serif; color: #2B2724; }}

.hoja {{ page-break-after: always; }}
.hoja:last-child {{ page-break-after: auto; }}
/* Las que se componen a página completa necesitan el alto útil. */
.portada, .set {{ height: 178mm; display: flex; flex-direction: column; }}

.versal {{
  font-size: 8.5pt; letter-spacing: .16em; text-transform: uppercase;
  font-weight: 700; color: #8E6824; margin: 0 0 6mm;
}}
h1 {{ font-family: 'CG'; font-weight: 400; font-size: 44pt; line-height: 1.02; margin: 0; }}
h2 {{ font-family: 'CG'; font-weight: 400; font-size: 30pt; line-height: 1.06; margin: 0; }}
h2.grande {{ font-size: 36pt; }}
h3 {{ font-family: 'CG'; font-weight: 400; font-size: 24pt; line-height: 1.1; margin: 0 0 3mm; }}

.regla {{ height: 1px; background: #8E6824; opacity: .45; margin: 7mm 0; }}
.regla.fina {{ margin: 5mm 0; opacity: .3; }}

.bajada {{ font-size: 12pt; line-height: 1.55; margin: 0; }}
.intro {{ font-size: 11.5pt; line-height: 1.6; margin: 5mm 0 7mm; }}
.pie {{ margin-top: auto; font-size: 10pt; line-height: 1.5; color: #6B6257; }}
.nota {{ margin-top: auto; font-size: 10pt; color: #6B6257; }}

.portada {{ justify-content: center; }}
.portada h1 {{ margin-bottom: 0; }}

table.plan {{ width: 100%; border-collapse: collapse; font-size: 12.5pt; }}
table.plan td {{ padding: 3.6mm 0; border-bottom: 1px solid rgba(43,39,36,.1); vertical-align: baseline; }}
table.plan td.n {{ width: 17mm; color: #8E6824; font-variant-numeric: tabular-nums; }}
table.plan td:last-child {{ text-align: right; color: #6B6257; }}

ul.indice {{ list-style: none; padding: 0; margin: 7mm 0 0; font-size: 11.5pt; }}
ul.indice li {{ padding: 2.6mm 0; border-bottom: 1px solid rgba(43,39,36,.08); line-height: 1.4; }}
.dia {{ color: #8E6824; font-size: 9.5pt; letter-spacing: .05em; margin-right: 2mm; }}
.min {{ color: #6B6257; font-size: 9.5pt; }}

.pieza {{ page: papel; }}
h3 {{ string-set: pieza content(); }}
.proposito {{ font-family: 'CG'; font-style: italic; font-size: 14.5pt; line-height: 1.38; margin: 0; }}

.guion .beat {{
  font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase;
  font-weight: 700; color: #8E6824; margin: 5mm 0 2mm;
}}
.guion .beat:first-child {{ margin-top: 0; }}
/* Un beat arrastra consigo lo que anuncia: solo al pie de una hoja no sirve. */
.guion .beat {{ page-break-after: avoid; break-after: avoid; }}
.guion .linea {{ orphans: 2; widows: 2; }}
.guion .linea {{ font-size: 11pt; line-height: 1.52; margin: 0 0 1.6mm; }}

ol.pasos {{ padding-left: 6mm; margin: 0; font-size: 11pt; line-height: 1.5; }}
ol.pasos li {{ margin-bottom: 3.4mm; padding-left: 1.5mm; }}
ol.pasos li::marker {{ color: #8E6824; font-weight: 700; }}
.falla {{ margin: 5mm 0 0; font-size: 10.5pt; line-height: 1.5; color: #4A433B; }}
.etiqueta {{
  display: block; font-size: 8.5pt; letter-spacing: .14em; text-transform: uppercase;
  font-weight: 700; color: #8E6824; margin-bottom: 1.5mm;
}}
'''

doc = f'<!doctype html><html lang="es"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(paginas)}</body></html>'
(BASE / 'grabacion.html').write_text(doc, 'utf8')

from weasyprint import HTML  # noqa: E402
salida = BASE / 'Lo-que-falta-grabar.pdf'
HTML(string=doc, base_url=str(BASE)).write_pdf(str(salida))
print(f'{salida} · {len(paginas)} páginas de contenido')
