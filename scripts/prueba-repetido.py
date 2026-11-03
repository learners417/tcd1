#!/usr/bin/env python3
"""
LO QUE SE DICE DOS VECES — medido en el navegador, no leído en el código.

═══ POR QUÉ EN EL NAVEGADOR ═══

Buscar contenido repetido leyendo el código no funciona: la misma lista puede
entrar por dos catálogos distintos y con nombres distintos, y para verlo hay
que armar la página. Lo intenté con expresiones regulares y me dio «roadmapSeed»
como si fuera un id de YouTube.

Esto abre cada pantalla del cliente en Chromium, saca los títulos visibles, y
dice cuáles aparecen más de una vez. Un título repetido en una pantalla es
relleno: el cliente lo lee dos veces y no sabe si son dos cosas o la misma.

Correr con: python3 scripts/prueba-repetido.py
"""
import os
import re
import socket
import subprocess
import sys
import time
import urllib.request

PANTALLAS = ['dashboard', 'roadmap', 'biblioteca', 'adn', 'campanas',
             'manualNegocio', 'entrenadores', 'metrics', 'miclinica', 'diario',
             'mensajes', 'creador']

# Títulos que se repiten a propósito, con su razón.
PERMITIDOS = {
    'fin de semana': 'los sábados y domingos del Camino son varios',
    'día de atender': 'hay varios días de atender en el tramo final',
    'ver más': 'un desplegable por tarjeta',
    'copiar': 'un botón por bloque',
    'empezar': 'el botón de cada paso',
    'hecho': 'el tilde de cada paso',
}

SACAR_TITULOS = """() => {
  const sel = 'h1,h2,h3,h4,[data-titulo]';
  const vistos = [];
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const t = (el.innerText || '').trim().replace(/\\s+/g, ' ');
    if (t.length >= 4 && t.length <= 90) vistos.push(t);
  }
  return vistos;
}"""


def puerto_libre():
    s = socket.socket()
    s.bind(('127.0.0.1', 0))
    p = s.getsockname()[1]
    s.close()
    return p


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('⚠ SIN MEDIR: falta playwright')
        return 0

    puerto = puerto_libre()
    srv = subprocess.Popen(
        ['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        env={**os.environ, 'DISABLE_HMR': 'true'})
    base = f'http://127.0.0.1:{puerto}/'
    fallas = 0
    try:
        for _ in range(80):
            try:
                urllib.request.urlopen(base, timeout=1)
                break
            except Exception:
                time.sleep(0.5)
        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            ctx = nav.new_context(viewport={'width': 390, 'height': 844})
            for pant in PANTALLAS:
                pag = ctx.new_page()
                errores = []
                pag.on('pageerror', lambda e, a=errores: a.append(str(e)[:120]))
                pag.goto(base)
                pag.evaluate("""([p]) => {
                  localStorage.clear();
                  const d = new Date(); d.setDate(d.getDate() - 19);
                  const f = d.toISOString().slice(0, 10);
                  localStorage.setItem('tcd_profile', JSON.stringify({
                    nombre: 'Julia', email: 'julia@test', especialidad: 'Psicóloga',
                    fecha_inicio: f, plan: 'DWY',
                    antesala: { protocolo: [
                      { area: 'sueno', loQueHago: 'Apago la luz a las 23:30' },
                      { area: 'pantallas', loQueHago: 'El celular a la cocina' },
                      { area: 'movimiento', loQueHago: 'Camino 25 minutos' }], cerrada: f },
                  }));
                  localStorage.setItem('tcd_current_page', p);
                  localStorage.setItem('tcd_plan', 'implementacion');
                }""", [pant])
                pag.reload()
                pag.wait_for_timeout(2600)
                titulos = pag.evaluate(SACAR_TITULOS)
                cuenta = {}
                for t in titulos:
                    cuenta[t] = cuenta.get(t, 0) + 1
                repes = {t: n for t, n in cuenta.items()
                         if n > 1 and t.lower() not in PERMITIDOS}
                marca = '✓' if not repes and not errores else '✗'
                print(f'{marca} {pant}: {len(titulos)} títulos visibles')
                for t, n in sorted(repes.items(), key=lambda x: -x[1]):
                    print(f'    ✗ «{t}» aparece {n} veces')
                    fallas += 1
                for e in errores:
                    print(f'    ✗ error de JavaScript: {e}')
                    fallas += 1
                pag.close()
            nav.close()
    finally:
        srv.terminate()

    print()
    if fallas:
        print(f'✗ {fallas} repeticiones o errores')
        return 1
    print('✓ ninguna pantalla del cliente dice lo mismo dos veces')
    return 0


if __name__ == '__main__':
    sys.exit(main())
