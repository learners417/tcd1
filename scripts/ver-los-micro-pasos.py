#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VER LOS MICRO PASOS — la foto de la pantalla «Haz», que es donde se trabaja.

Los micro pasos viven dentro de la sesión del día, en la tercera pantalla.
`medir-app.py` mide las pantallas tal como abren, y la sesión abre en «Te
llevas», un par de toques más afuera.

Este script entra hasta ahí y saca la foto, que es lo que se aprueba. Reusa
el arranque de `medir-app.py` —el servidor, el reloj fijo y la cuenta de
Julia— para no tener una segunda forma de preparar la app.

    python3 scripts/ver-los-micro-pasos.py        # el día 1
    python3 scripts/ver-los-micro-pasos.py 8 18

Deja las capturas en /tmp/micro-dia<N>.png
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

DIAS = [int(x) for x in sys.argv[1:]] or [1]


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
                _m.preparar(pag, 'dashboard', dias=dia)
                pag.reload()
                pag.wait_for_timeout(2500)

                # Se entra por la tarjeta de Hoy, que es por donde entra el
                # cliente: el botón de abajo de todo.
                for texto in ('Empezar', 'Seguir', 'Abrir el día'):
                    try:
                        pag.get_by_role('button', name=texto).first.click(timeout=2500)
                        pag.wait_for_timeout(1500)
                        break
                    except Exception:
                        continue

                # La sesión abre en «Te llevas». La pantalla del paso a paso
                # es la siguiente —o la de más allá, si ese día tiene video—,
                # así que se avanza hasta verla y no un número fijo de veces.
                # Se reconoce por el rótulo de la pantalla —«Haz · paso 3 de
                # 5»— y no por el texto «Paso a paso»: el tutorial de la
                # pantalla «Mira» también lo dice, y el detector se quedaba
                # ahí creyendo que ya había llegado.
                for _ in range(4):
                    if pag.get_by_text('Haz · paso', exact=False).count():
                        break
                    avanzo = False
                    for texto in ('Ver el video', 'Ya lo vi, vamos a hacerlo',
                                  'Empezar', 'Siguiente'):
                        try:
                            pag.get_by_role('button', name=texto).first.click(timeout=1500)
                            avanzo = True
                            break
                        except Exception:
                            continue
                    if not avanzo:
                        break
                    pag.wait_for_timeout(1200)

                pag.wait_for_timeout(600)
                pag.evaluate("""() => {
                  const n = [...document.querySelectorAll('p')]
                    .find(x => x.textContent.trim() === 'Paso a paso');
                  if (!n) return;
                  n.scrollIntoView({ block: 'start' });
                  // Y un empujón hacia arriba: la cabecera de la sesión es
                  // fija y, pegado al tope, se come el rótulo de la tarjeta.
                  const c = n.closest('main') || document.scrollingElement;
                  if (c) c.scrollTop -= 110;
                }""")
                pag.wait_for_timeout(500)

                destino = f'/tmp/micro-dia{dia}.png'
                pag.screenshot(path=destino)
                hay = pag.get_by_text('Haz · paso', exact=False).count()
                print(f'día {dia:2} → {destino}  pantalla Haz: {"sí" if hay else "NO"}')
                pag.close()
            nav.close()
    finally:
        try:
            os.killpg(os.getpgid(srv.pid), 15)
        except Exception:
            srv.kill()


if __name__ == '__main__':
    main()
