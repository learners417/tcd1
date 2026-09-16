#!/usr/bin/env python3
"""
prueba-movil.py — mide El Camino en un navegador REAL a ancho de teléfono.

jsdom no calcula tamaños: una pantalla puede montar perfecta y tener la mitad
del texto fuera de la pantalla. Así llegaron las capturas del 15 sep 2026:
"Día 71 de 90 · vas 59 días atrás" cortado a la derecha, "COMPLETADOS"
saliéndose de su tarjeta y el día dicho de dos formas distintas.

Qué mide, en 360 y 390 px, con un cliente en el día 71 y 15 metas hechas:
  1. la página no se desplaza de costado
  2. ningún texto termina fuera de la pantalla
  3. ningún texto se sale de su tarjeta
  4. no aparece ningún {{token}} sin traducir
  5. el día se dice una sola vez de una sola forma (71, nunca 17)
  6. la Fase Autonomía NO aparece con el 20% hecho
  7. el mensaje de ritmo está en positivo
  8. ningún texto visible mide menos de 13 px

Corre:  python3 scripts/prueba-movil.py   (necesita node_modules y Chromium de Playwright)
Deja capturas en /tmp/visor-*.png
"""
import os, re, socket, subprocess, sys, time, urllib.request

os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print('✗ falta playwright: pip install playwright --break-system-packages'); sys.exit(1)

F = 0
def check(nombre, ok, detalle=''):
    global F
    print(('  ✓ ' if ok else '  ✗ ') + nombre + (f' — {detalle}' if detalle and not ok else ''))
    if not ok: F += 1

def puerto_libre():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

PUERTO = puerto_libre()
srv = subprocess.Popen(['npx', 'vite', '--port', str(PUERTO), '--strictPort', '--host', '127.0.0.1'],
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env={**os.environ, 'DISABLE_HMR': 'true'})
BASE = f'http://127.0.0.1:{PUERTO}/scripts/visor/camino.html'

try:
    for _ in range(60):
        try:
            urllib.request.urlopen(f'http://127.0.0.1:{PUERTO}/', timeout=1); break
        except Exception:
            time.sleep(0.5)
    else:
        print('✗ el servidor de vite no levantó'); sys.exit(1)

    MEDIR = r"""
    () => {
      const vw = window.innerWidth;
      const fuera = [], desborda = [], chica = [], partidas = [];
      const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0; };
      for (const el of document.querySelectorAll('#root *')) {
        if (!visible(el)) continue;
        const propio = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
        if (!propio) continue;
        const r = el.getBoundingClientRect();
        const txt = el.textContent.trim().slice(0, 50);
        if (r.right > vw + 1 || r.left < -1) fuera.push(`${txt} (${Math.round(r.left)}→${Math.round(r.right)})`);
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'visible') desborda.push(`${txt} (${el.scrollWidth}>${el.clientWidth})`);
        for (const n of el.childNodes) {
          if (n.nodeType !== 3) continue;
          // Palabras ENTERAS de 3 a 10 letras (una larga puede cortarse con guion).
          const re = /\p{L}+/gu; let w;
          while ((w = re.exec(n.textContent))) {
            if (w[0].length < 3 || w[0].length > 10) continue;
            const rg = document.createRange(); rg.setStart(n, w.index); rg.setEnd(n, w.index + w[0].length);
            const tops = new Set([...rg.getClientRects()].map(r => Math.round(r.top)));
            if (tops.size > 1) partidas.push(w[0]);
          }
        }
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 13) chica.push(`${txt} (${fs}px)`);
      }
      return {
        scrollW: document.documentElement.scrollWidth, vw,
        fuera: [...new Set(fuera)], partidas: [...new Set(partidas)], desborda: [...new Set(desborda)], chica: [...new Set(chica)],
        texto: document.body.innerText,
        ritmo: document.querySelector('[data-ritmo]')?.textContent ?? null,
      };
    }
    """

    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        errores = []
        for ancho in (360, 390):
            print(f'══ {ancho} px · día 71 · 15 metas hechas ══')
            pag = nav.new_page(viewport={'width': ancho, 'height': 800}, device_scale_factor=2)
            pag.on('pageerror', lambda e: errores.append(str(e)))
            pag.goto(f'{BASE}?dias=71&hechas=15&esp=Psic%C3%B3loga')
            pag.wait_for_selector('text=Registrar venta', timeout=30000)
            pag.wait_for_timeout(800)
            m = pag.evaluate(MEDIR)
            cab = pag.locator('.card-panel').first
            cab.screenshot(path=f'/tmp/visor-{ancho}.png')
            t = m['texto']
            check('la página no se desplaza de costado', m['scrollW'] <= m['vw'], f"{m['scrollW']} > {m['vw']}")
            check('ningún texto queda fuera de la pantalla', not m['fuera'], '; '.join(m['fuera'][:3]))
            check('ningún texto se sale de su tarjeta', not m['desborda'], '; '.join(m['desborda'][:3]))
            check('sin {{tokens}} sin traducir', not re.search(r'\{\{\s*\w+\s*\}\}', t), re.findall(r'.{20}\{\{.{20}', t)[:2])
            cab_txt = cab.inner_text()
            dias_dichos = set(re.findall(r'D[íi]a (\d+) de 90', t)) | set(re.findall(r'(\d+)\s*/\s*90', t))
            check('el día se dice de una sola forma: 71', dias_dichos == {'71'}, f'aparece: {sorted(dias_dichos)}')
            check('el encabezado dice el día real (Día 71 de 90)', 'Día 71 de 90' in cab_txt)
            check('no aparece el día congelado de la base (37)', not re.search(r'\b37\b', cab_txt), 'el encabezado muestra 37')
            check('sin Fase Autonomía con el 20% hecho', 'Fase Autonomía' not in t and 'FASE AUTONOMÍA' not in t)
            check('el mensaje de ritmo existe y está en positivo',
                  bool(m['ritmo']) and not re.search(r'atr[aá]s|atraso', m['ritmo'], re.I), m['ritmo'] or 'no encontrado')
            check('ninguna palabra corta se parte en dos líneas', not m['partidas'], ', '.join(m['partidas'][:5]))
            check('los títulos de fase no llevan una letra inventada', not re.search(r'M[ée]todo [A-Z]\b', t, re.I), re.findall(r'.{10}M[ée]todo [A-Z]\b', t, re.I)[:2])
            check('los días de cada fase no se repiten', not re.search(r'D[íi]as (\d+-\d+) · \1', t), re.findall(r'D[íi]as \d+-\d+ · \d+-\d+', t)[:2])
            check('el candado de la Fase 4 no aparece en el paso del día 15', 'se abre con tu ADN' not in t)
            check('ningún texto visible mide menos de 13 px', not m['chica'], '; '.join(m['chica'][:4]))
            pag.close()

        print('══ control: la Fase Autonomía SÍ aparece cuando el paso llega al día 50 ══')
        pag = nav.new_page(viewport={'width': 360, 'height': 800})
        pag.goto(f'{BASE}?dias=71&hechas=200')
        pag.wait_for_selector('text=Registrar venta', timeout=30000)
        pag.wait_for_timeout(500)
        t = pag.evaluate('() => document.body.innerText')
        check('con el camino avanzado se muestra la semana tipo', 'semana tipo' in t.lower())
        pag.close()

        print('══ control: el candado de la Fase 4 SÍ aparece cuando el paso llega al día 45 con el ADN vacío ══')
        pag = nav.new_page(viewport={'width': 360, 'height': 800})
        pag.goto(f'{BASE}?dias=71&hasta=45')
        pag.wait_for_selector('text=Registrar venta', timeout=30000)
        pag.wait_for_timeout(500)
        t = pag.evaluate('() => document.body.innerText')
        check('se muestra "La Fase 4 se abre con tu ADN completo"', 'se abre con tu ADN completo' in t)
        check('y en positivo: sin "quemar", "no retorno" ni "incompleto"', not re.search(r'quemar|no retorno|incompleto|plata', t, re.I),
              re.findall(r'.{15}(?:quemar|no retorno|incompleto|plata).{10}', t, re.I)[:2])
        pag.close()

        print('══ el primer día: "Hoy" es un paso del cliente, nunca la entrega técnica del equipo ══')
        pag = nav.new_page(viewport={'width': 360, 'height': 800})
        pag.goto(f'{BASE}?dias=1&hechas=0')
        pag.wait_for_selector('text=Registrar venta', timeout=30000)
        pag.wait_for_timeout(500)
        hoy_txt = pag.locator('section[aria-label="Tu paso de hoy"]').inner_text()
        check('la tarjeta de hoy existe', bool(hoy_txt.strip()))
        check('y no es la entrega técnica', 'Entrega técnica' not in hoy_txt, hoy_txt[:80])
        check('el primer día va al día', 'vas al día' in pag.evaluate('() => document.body.innerText'))
        pag.close()

        print('══ "Empezar" abre el paso de verdad ══')
        pag = nav.new_page(viewport={'width': 360, 'height': 800})
        pag.goto(f'{BASE}?dias=20&hechas=15')
        pag.wait_for_selector('text=Registrar venta', timeout=30000)
        pag.wait_for_timeout(500)
        t = pag.evaluate('() => document.body.innerText')
        m_total = re.search(r'de (\d+) pasos', t)
        check('el anillo cuenta los 90 pasos del cliente', bool(m_total) and m_total.group(1) == '90', m_total.group(0) if m_total else 'sin anillo')
        pag.get_by_role('button', name='Empezar').click()
        pag.wait_for_timeout(1200)
        abierto = pag.evaluate('() => !!document.querySelector("[id^=meta-]")')
        check('al tocar Empezar se abre el pilar con su paso', abierto)
        pag.close()

        check('sin errores de JavaScript al abrir', not errores, '; '.join(errores[:2]))
        nav.close()
finally:
    srv.terminate()

print()
print('✓ TODO EN VERDE' if F == 0 else f'✗ {F} FALLAS')
sys.exit(0 if F == 0 else 1)
