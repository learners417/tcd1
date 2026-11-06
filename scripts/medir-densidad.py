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
import pathlib
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
# Las TRECE puertas que el menú y el buscador le ofrecen hoy al cliente, no las
# ocho que esta lista traía. Las cinco que faltaban —numero, campanas, creador,
# miclinica, metrics— son justamente las que se absorben en el día que las usa,
# y medirlas antes de moverlas es la única forma de saber qué se gana. La
# lección es la de siempre: cuando la vara no apunta a la pantalla, la vara
# dice verde y la pantalla igual está mal.
DESTINOS = ['dashboard', 'roadmap', 'entrenadores', 'coach',
            'adn', 'biblioteca', 'diario', 'mensajes',
            'numero', 'campanas', 'creador', 'miclinica', 'metrics']

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


def arrancar_vite(con_base_falsa: bool):
    """Un Vite propio, con o sin la base de prueba.

    ═══ POR QUÉ DOS Y NO UNO ═══

    `VITE_SUPABASE_URL` se resuelve al ARRANCAR el proceso de Vite y queda
    cocinada en el paquete: no se puede cambiar por pantalla. Y las dos mitades
    de la app la quieren al revés.

    · El ADMIN la necesita puesta. Sin ella `cargarClientes` sale por
      `if (!supabase) return` y las diecisiete pestañas se miden vacías.
    · El CLIENTE la necesita ausente. Con una base que no responde, sus
      pantallas se quedan esperando: `metrics`, `diario`, `biblioteca`,
      `campanas` y las demás no llegan a dibujar nada.

    Este archivo arrancaba UN solo Vite, con la base puesta, y medía las dos
    mitades ahí. Resultado: las trece pantallas del cliente daban las MISMAS
    29 palabras, 5 toques y 900 px de alto — que es el tamaño exacto de la
    ventana, o sea una pantalla en blanco. Cada número de densidad del cliente
    tomado así midió el vacío.

    `medir-app.py` ya había aprendido esto y por eso corre dos veces. Acá
    faltaba.
    """
    env = {**os.environ, 'DISABLE_HMR': 'true'}
    if con_base_falsa:
        env['VITE_SUPABASE_URL'] = 'http://base-de-prueba.invalid'
        env['VITE_SUPABASE_ANON_KEY'] = 'clave-de-prueba'
    puerto = MA.puerto_libre()
    srv = subprocess.Popen(['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           env=env, start_new_session=True)
    base = f'http://127.0.0.1:{puerto}/'
    for _ in range(80):
        try:
            urllib.request.urlopen(base, timeout=1); break
        except Exception:
            time.sleep(0.5)
    return srv, base


def apagar(srv):
    try:
        os.killpg(os.getpgid(srv.pid), 15)
    except Exception:
        srv.kill()


def main():
    anchos = [390] + ([1440] if '--ancho' in sys.argv else [])
    # El cliente va sin base falsa. El Admin, si se pide, trae su propio Vite.
    srv, base = arrancar_vite(con_base_falsa=False)
    try:
        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            for ancho in anchos:
                ctx_cliente = nav.new_context(viewport={'width': ancho, 'height': 900}, device_scale_factor=1)
                MA.fijar_reloj(ctx_cliente, MA.RELOJ)
                print(f"\n══ a {ancho} px ══")
                print(f"{'pantalla':16} {'palabras':>9} {'toques':>7} {'tarjetas':>9} "
                      f"{'superf':>7} {'imagen':>7} {'alto':>7}")

                def medir(nombre, abrir, captura, ctx=None):
                    # `ctx` explícito porque el Admin mide en SU contexto, el
                    # del Vite con base falsa, y no en el del cliente.
                    ctx = ctx or ctx_cliente
                    pag = ctx.new_page()
                    abrir(pag)
                    pag.wait_for_timeout(2500)
                    m = pag.evaluate(CONTAR)
                    # El alto real: la app scrollea un `main` interno, así que
                    # el alto del cuerpo miente. Donde no hay `main` —el visor
                    # del Admin— vale el del documento.
                    alto = pag.evaluate(
                        "() => { const m = document.querySelector('main');"
                        "  return m ? m.scrollHeight : document.documentElement.scrollHeight; }")
                    print(f"{nombre:16} {m['palabras']:>9} {m['tocables']:>7} "
                          f"{m['tarjetas']:>9} {m['superficies']:>7} {m['imagen']:>7} {alto:>6}px")
                    if captura:
                        pag.screenshot(path=captura)
                    pag.close()
                    return m, alto

                for d in DESTINOS:
                    def abrir(pag, d=d):
                        pag.goto(base); MA.preparar(pag, d); pag.reload()
                    medir(d, abrir, f'/tmp/ancho-{d}.png' if ancho != 390 else None)

                ctx_cliente.close()

                # ─── Y EL ADMIN, en su propio Vite ───────────────────────
                #
                # `medir-app.py --admin` lo recorre y sus 22 lentes dan cero
                # — pero esas lentes miran contraste, tamaños y desbordes, no
                # CUÁNTO hay en la pantalla. Del lado del cliente también
                # daban cero mientras El Camino abría con 545 palabras.
                #
                # Va con base falsa y con los seis clientes de prueba
                # contestando desde Playwright, al revés que el cliente.
                if '--admin' in sys.argv:
                    srv_a, base_a = arrancar_vite(con_base_falsa=True)
                    try:
                        ctx_a = nav.new_context(viewport={'width': ancho, 'height': 900},
                                                device_scale_factor=1)
                        _sp = importlib.util.spec_from_file_location(
                            'datos_admin',
                            str(pathlib.Path(__file__).parent / 'datos-de-prueba-admin.py'))
                        _da = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_da)
                        _da.instalar(ctx_a)
                        MA.fijar_reloj(ctx_a, MA.RELOJ)
                        print(f"\n── el Admin, a {ancho} px ──")
                        for t in MA.ADMIN:
                            def abrir(pag, t=t):
                                pag.goto(f'{base_a}scripts/visor/admin.html?tab={t}')
                            medir(f'admin:{t}', abrir, f'/tmp/dens-admin-{t}-{ancho}.png',
                                  ctx=ctx_a)
                        ctx_a.close()
                    finally:
                        apagar(srv_a)
            nav.close()
    finally:
        apagar(srv)


if __name__ == '__main__':
    main()
