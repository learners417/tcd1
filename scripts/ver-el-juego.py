#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VER MI PROTOCOLO — la foto de las 33 piezas, dentro de El Camino.

Mi protocolo vive en El Camino, debajo del trabajo del día.
`medir-app.py` mide las pantallas tal como abren, y la sesión abre en «Te
llevas», un par de toques más afuera.

Este script entra hasta ahí y saca la foto, que es lo que se aprueba. Reusa
el arranque de `medir-app.py` —el servidor, el reloj fijo y la cuenta de
Julia— para no tener una segunda forma de preparar la app.

    python3 scripts/ver-mi-protocolo.py        # el día 1
    python3 scripts/ver-mi-protocolo.py 8 18

Deja las capturas en /tmp/juego-dia<N>.png
"""
import importlib.util as _iu
import os
import subprocess
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

_DIR = os.path.dirname(os.path.abspath(__file__))
_spec = _iu.spec_from_file_location('medir_app', os.path.join(_DIR, 'medir-app.py'))
_m = _iu.module_from_spec(_spec)
_spec.loader.exec_module(_m)

from playwright.sync_api import sync_playwright  # noqa: E402

# Con `lleno` se mira el tablero como lo ve el que lleva setenta días: es el
# estado en que el cliente pasa casi todo el programa, y el único que muestra
# los colores de los cinco paisajes pintados.
LLENO = '--lleno' in sys.argv
DIAS = [int(x) for x in sys.argv[1:] if not x.startswith('--')] or [1]


def main():
    puerto = _m.puerto_libre()
    srv = subprocess.Popen(
        ['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        env={**os.environ, 'DISABLE_HMR': 'true', **_m.CREDENCIALES_DE_PRUEBA},
        start_new_session=True)
    base = f'http://127.0.0.1:{puerto}/'
    try:
        for _ in range(80):
            try:
                urllib.request.urlopen(base, timeout=1)
                break
            except Exception:
                time.sleep(0.5)

        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            ctx = nav.new_context(viewport={'width': 390, 'height': 844},
                                  device_scale_factor=2)
            _sp = _iu.spec_from_file_location(
                'datos_admin', os.path.join(_DIR, 'datos-de-prueba-admin.py'))
            _datos_admin = _iu.module_from_spec(_sp)
            _sp.loader.exec_module(_datos_admin)
            _datos_admin.instalar(ctx)
            _m.fijar_reloj(ctx, _m.RELOJ)

            for dia in DIAS:
                pag = ctx.new_page()
                pag.goto(base)
                _m.preparar(pag, 'roadmap', dias=dia, lleno=LLENO)
                pag.reload()
                pag.wait_for_timeout(2500)
                if LLENO:
                    # MEDIDO EL 15 DE NOVIEMBRE: `preparar(lleno=True)` escribe
                    # las 71 jornadas hechas y, en la primera carga, la pantalla
                    # las deja en cero —`tcd_hoja_ruta_v2` queda en `[]`—. O sea
                    # que la cuenta «llena» del medidor nunca tuvo el Camino
                    # lleno. Acá se vuelven a escribir después de esa carga, que
                    # es cuando quedan. Queda anotado para arreglarlo en
                    # `preparar`, que es de donde lo leen las 110 vistas.
                    _est = _m.estado_lleno()
                    pag.evaluate("h => localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(h))",
                                 _est['hechas'])
                    pag.reload()
                    pag.wait_for_timeout(2500)

                # El Camino abre con su pregunta de una sola vez; hay que
                # pasarla antes de ver nada.
                for texto in ('Empiezo de cero', 'ir a mi día'):
                    try:
                        pag.get_by_text(texto, exact=False).first.click(timeout=2500)
                        pag.wait_for_timeout(1500)
                        break
                    except Exception:
                        continue
                # Y se baja hasta el bloque, que vive debajo del trabajo del día.
                pag.evaluate("""() => {
                  const n = [...document.querySelectorAll('p')]
                    .find(x => x.textContent.trim() === 'El juego del sur');
                  if (n) n.scrollIntoView({ block: 'start' });
                }""")
                pag.wait_for_timeout(700)
                destino = f'/tmp/juego-dia{dia}{"-lleno" if LLENO else ""}.png'
                pag.screenshot(path=destino)
                hay = pag.get_by_text('El juego del sur', exact=False).count()
                pieza = pag.get_by_text('pieza', exact=False).count()
                print(f'día {dia:2} → {destino}  El juego: {"sí" if hay else "NO"} · '
                      f'pieza del día: {"sí" if pieza else "no"}')
                pag.close()
            nav.close()
    finally:
        try:
            os.killpg(os.getpgid(srv.pid), 15)
        except Exception:
            srv.kill()


if __name__ == '__main__':
    main()
