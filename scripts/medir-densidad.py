#!/usr/bin/env python3
"""
medir-densidad.py — cuánto hay que leer y cuánto hay que decidir en cada pantalla.

El medidor de siempre (`medir-app.py`) contesta si la pantalla cumple las
reglas. Esta contesta algo que el otro no mira y que es lo que hace que una app
se sienta fácil o pesada:

  palabras    cuántas palabras tiene que leer alguien que abre esa pantalla
  toques      cuántas cosas tocables le ofrece (botones, enlaces, tarjetas)
  tarjetas    en cuántos bloques está partida
  superficies cuántos colores de fondo distintos pinta — uno solo es «plano»
  imagen      si hay alguna ilustración o solo texto en cajas

Se reusa el andamiaje de `medir-app.py`: su lista de pantallas y su `preparar`,
para no tener dos definiciones de «la pantalla Hoy» que se separen con el
tiempo.

    python3 scripts/medir-densidad.py           las ocho pantallas del cliente
    python3 scripts/medir-densidad.py --ancho   además, a 1440 px (escritorio)
"""
import importlib.util
import os
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

_spec = importlib.util.spec_from_file_location('medir_app', 'scripts/medir-app.py')
MA = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(MA)

# Las que ve un cliente, en el orden en que las encuentra.
DESTINOS = ['dashboard', 'roadmap', 'entrenadores', 'coach',
            'adn', 'biblioteca', 'diario', 'mensajes']

CONTAR = r"""() => {
  const raiz = document.querySelector('#root') || document.body;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const c = getComputedStyle(el);
    return c.visibility !== 'hidden' && c.display !== 'none' && parseFloat(c.opacity) > 0.05;
  };
  // Palabras: el texto de los nodos de texto visibles, sin repetir el de los
  // padres. Se cuenta lo que una persona lee, no el DOM.
  let palabras = 0;
  const paseo = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let n = paseo.nextNode(); n; n = paseo.nextNode()) {
    const t = (n.textContent || '').trim();
    if (!t) continue;
    const p = n.parentElement;
    if (!p || !vis(p)) continue;
    palabras += t.split(/\s+/).filter(Boolean).length;
  }
  const tocables = [...raiz.querySelectorAll('button, a, [role="button"], input, select, textarea')]
    .filter(vis).length;
  const fondos = new Set();
  let tarjetas = 0;
  for (const el of raiz.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const c = getComputedStyle(el);
    const bg = c.backgroundColor;
    if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) {
      fondos.add(bg);
      const r = el.getBoundingClientRect();
      if (parseFloat(c.borderRadius) >= 12 && r.width > 120 && r.height > 48) tarjetas++;
    }
  }
  const imagen = raiz.querySelectorAll('svg:not([width="16"]):not([width="20"]), img, canvas').length;
  return { palabras, tocables, tarjetas, superficies: fondos.size, imagen };
}"""


def main():
    anchos = [390] + ([1440] if '--ancho' in sys.argv else [])
    puerto = MA.puerto_libre()
    srv = subprocess.Popen(['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           env={**os.environ, 'DISABLE_HMR': 'true'}, start_new_session=True)
    base = f'http://127.0.0.1:{puerto}/'
    try:
        for _ in range(80):
            try:
                urllib.request.urlopen(base, timeout=1); break
            except Exception:
                time.sleep(0.5)
        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            for ancho in anchos:
                ctx = nav.new_context(viewport={'width': ancho, 'height': 900}, device_scale_factor=1)
                MA.fijar_reloj(ctx, MA.RELOJ)
                print(f"\n══ a {ancho} px ══")
                print(f"{'pantalla':16} {'palabras':>9} {'toques':>7} {'tarjetas':>9} {'superf':>7} {'imagen':>7}")
                for d in DESTINOS:
                    pag = ctx.new_page()
                    pag.goto(base)
                    MA.preparar(pag, d)
                    pag.reload()
                    pag.wait_for_timeout(2500)
                    m = pag.evaluate(CONTAR)
                    print(f"{d:16} {m['palabras']:>9} {m['tocables']:>7} "
                          f"{m['tarjetas']:>9} {m['superficies']:>7} {m['imagen']:>7}")
                    if ancho != 390:
                        pag.screenshot(path=f'/tmp/ancho-{d}.png')
                    pag.close()
                ctx.close()
            nav.close()
    finally:
        try:
            os.killpg(os.getpgid(srv.pid), 15)
        except Exception:
            srv.kill()


if __name__ == '__main__':
    main()
