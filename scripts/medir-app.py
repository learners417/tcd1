#!/usr/bin/env python3
"""
medir-app.py — mide TODAS las pantallas del cliente contra docs/tcd-spec/10-DISENO.md.

Abre la app real (modo sin base de datos) en Chromium a 390 px y, pantalla por
pantalla, cuenta lo que la especificación prohíbe y se puede medir:

  lateral   la página se desplaza de costado
  fuera     textos que terminan fuera de la pantalla
  chica     textos de contenido por debajo de 15 px (regla 11)
  tactil    botones y enlaces de menos de 44 px de alto (piso de calidad)
  degrade   fondos con degradé (§2: "nunca degradé")
  brillo    sombras o resplandores dorados (§2: "nunca sombra dorada")
  versal    mayúsculas espaciadas por encima de .2em (§3: kicker .2em)
  insignia  insignias rojas con número (regla 6)
  tokens    {{marcadores}} sin traducir
  contraste textos por debajo de AA (4,5:1; 3:1 desde 24 px) contra su fondo real (§9)
  cortado   textos recortados: puntos suspensivos o que no entran en su caja (§3)
  desborde  textos que se salen de su caja y pisan lo de al lado
  tildes    palabras frecuentes escritas sin tilde (metodo, pais, linea…)
  errores   errores de JavaScript al abrir

Uso:
  python3 scripts/medir-app.py              → tabla + capturas en /tmp/app-<pantalla>.png
  python3 scripts/medir-app.py --estricto   → sale con error si alguna pantalla
                                              de la lista ESTRICTAS tiene algo
"""
import json, os, socket, subprocess, sys, time, urllib.request

os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PANTALLAS = ['dashboard', 'roadmap', 'adn', 'coach', 'miclinica', 'metrics',
             'biblioteca', 'diario', 'agentes', 'creador', 'numero', 'manualNegocio', 'campanas']
# Las pantallas ya llevadas al nivel de la especificación. Crece turno a turno.
# Las pestañas internas del cliente: (nombre, pantalla, texto del botón a tocar).
INTERNAS = [
    ('metrics>sistema', 'metrics', 'Mi Sistema'),
    ('diario>historial', 'diario', 'Historial'),
    ('biblioteca>conciencia', 'biblioteca', 'Conciencia'),
    ('campanas>nueva', 'campanas', 'Nueva campaña'),
    ('campanas>diagnosticar', 'campanas', 'Diagnosticar'),
    ('campanas>copies', 'campanas', 'Copies'),
    ('campanas>ganadores', 'campanas', 'Ganadores'),
]
# Las pestañas del Admin (VALID_MAIN_TABS de Admin.tsx), vistas con rol de dirección.
ADMIN = ['clientes', 'pipeline', 'mensajes', 'metricas', 'videos', 'equipo', 'campanas', 'creativos',
         'tareas', 'plata', 'motor', 'hoy', 'supervision', 'sala', 'mirol', 'sesiones', 'semana', 'casa']
# Desde el 16 sep, TODAS las pantallas del cliente.
ESTRICTAS = list(PANTALLAS) + [n for n, _, _ in INTERNAS]
ADMIN_ESTRICTO = True  # el Admin llegó a cero el 16 sep
COLUMNAS = ['lateral', 'fuera', 'chica', 'tactil', 'degrade', 'brillo', 'versal', 'insignia', 'tokens', 'contraste', 'cortado', 'desborde', 'tildes', 'errores']

MEDIR = r"""
() => {
  const vw = window.innerWidth;
  const r = {lateral: 0, fuera: [], chica: [], tactil: [], degrade: [], brillo: [], versal: [], insignia: [], tokens: 0, contraste: [], cortado: [], desborde: [], tildes: []};
  // Contraste: color del texto (con su opacidad y la de sus contenedores) sobre el
  // primer fondo opaco de sus ancestros.
  // El navegador puede devolver oklab(), color-mix()… Un lienzo de 1 px lo
  // convierte a RGBA real. (Leer los números a mano tomaba oklab como negro.)
  const lienzo = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const cacheColor = new Map();
  const rgba = (c) => {
    if (cacheColor.has(c)) return cacheColor.get(c);
    lienzo.clearRect(0, 0, 1, 1); lienzo.fillStyle = '#000'; lienzo.fillStyle = c; lienzo.fillRect(0, 0, 1, 1);
    const d = lienzo.getImageData(0, 0, 1, 1).data;
    const v = [d[0], d[1], d[2], d[3] / 255];
    cacheColor.set(c, v); return v;
  };
  const lum = ([r2, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r2) + 0.7152 * f(g) + 0.0722 * f(b); };
  const mezcla = (fg, bg, a) => [0,1,2].map(i => fg[i] * a + bg[i] * (1 - a));
  const fondoDe = (el) => {
    const capas = [];
    for (let p = el; p; p = p.parentElement) {
      const c = rgba(getComputedStyle(p).backgroundColor);
      if (c[3] > 0) { capas.push(c); if (c[3] >= 0.99) break; }
    }
    let base = [250, 245, 234];
    for (const c of capas.reverse()) base = mezcla(c, base, c[3]);
    return base;
  };
  const opacidad = (el) => { let o = 1; for (let p = el; p; p = p.parentElement) o *= Number(getComputedStyle(p).opacity); return o; };
  const SIN_TILDE = /\b(metodo|pais|linea|disena|sesion|informacion|articulo|pagina|numero|telefono|dias|tambien|aqui|asi|mas|anos|diseno|analisis|clinica digital|proposito|diagnostico)\b/;
  const main = document.querySelector('main') || document.body;
  // ¿Se puede desplazar de costado? Se intenta, no se deduce del ancho.
  for (const e of [document.scrollingElement, document.querySelector('main')].filter(Boolean)) {
    e.scrollLeft = 200; if (e.scrollLeft > 1) r.lateral = 1; e.scrollLeft = 0;
  }
  // Un panel fijo que está entero fuera de la pantalla está escondido (menú cerrado).
  const escondido = (el) => { for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.position === 'fixed' || cs.position === 'absolute') { const q = p.getBoundingClientRect(); if (q.right <= 1 || q.left >= vw - 1) return true; }
      if (p.getAttribute && (p.getAttribute('aria-hidden') === 'true' || p.hasAttribute('inert'))) return true;
    } return false; };
  const vis = (el) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; };
  const nombre = (el) => (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().replace(/\s+/g,' ').slice(0, 40);
  const enScrollH = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  for (const el of document.querySelectorAll('#root *')) {
    if (!vis(el) || escondido(el)) continue;
    const cs = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    const propio = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (propio) {
      if ((b.right > vw + 1 || b.left < -1) && !enScrollH(el)) r.fuera.push(nombre(el));
      const fs = parseFloat(cs.fontSize);
      const enTab = !!el.closest('nav');
      if (fs < (enTab ? 14 : 15) - 0.1) r.chica.push(`${nombre(el)} ${fs}px`);
      const ls = parseFloat(cs.letterSpacing) || 0;
      if (cs.textTransform === 'uppercase' && ls / fs > 0.21) r.versal.push(nombre(el));
      if (/\{\{\s*\w+\s*\}\}/.test(el.textContent)) r.tokens++;
      const fg = rgba(cs.color); const a = fg[3] * opacidad(el);
      const bg = fondoDe(el);
      const L1 = lum(mezcla(fg, bg, a)), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const grande = fs >= 24 || (fs >= 18.5 && Number(cs.fontWeight) >= 700);
      const esBotonDeshabilitado = !!el.closest('button[disabled]') && !el.closest('[aria-label]');
      if (ratio < (grande ? 3 : 4.5) && !esBotonDeshabilitado) r.contraste.push(`${nombre(el)} ${ratio.toFixed(1)}:1`);
      const recorta = (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1)
        || (el.scrollWidth > el.clientWidth + 2 && ['hidden', 'clip'].includes(cs.overflowX) && cs.whiteSpace === 'nowrap');
      if (recorta) r.cortado.push(nombre(el));
      // Texto apilado letra por letra: la caja es más angosta que dos letras.
      const txtPropio = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (txtPropio.length >= 4 && b.width < fs * 2.2 && b.height > fs * 3.5) r.desborde.push(`${nombre(el)} (apilado)`);
      // Texto que se sale de su caja visible y pisa lo de al lado.
      if (!recorta && cs.overflowX === 'visible' && cs.display !== 'inline' && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) r.desborde.push(nombre(el));
      for (const n of el.childNodes) {
        if (n.nodeType !== 3) continue;
        const m = n.textContent.toLowerCase().match(SIN_TILDE);
        if (m && !/[áéíóú]/.test(m[0])) r.tildes.push(`${m[0]} · ${nombre(el)}`);
      }
    }
    if ((el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button') && b.height < 43.5 && b.width > 0)
      r.tactil.push(`${nombre(el)} ${Math.round(b.height)}px`);
    if (cs.backgroundImage.includes('gradient')) {
      // Un degradé "aplanado" (todos sus colores iguales) no es un degradé.
      const tonos = (cs.backgroundImage.match(/(rgba?\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|#[0-9a-f]{3,8}|transparent)/gi) || [])
        .map(t => rgba(t).map(v => Math.round(v * 100)).join(','));
      if (new Set(tonos).size > 1) r.degrade.push(nombre(el));
    }
    const sh = cs.boxShadow + ' ' + cs.textShadow + ' ' + cs.filter;
    if (/rgba?\((17[0-9]|2[0-3][0-9]), ?(1[2-5][0-9]), ?(3[0-9]|4[0-9]|5[0-9])/.test(sh) && !/none none none/.test(sh)) r.brillo.push(nombre(el));
    const txt = el.textContent.trim();
    if (/^\d{1,3}\+?$/.test(txt) && b.width < 30 && b.height < 30) {
      const bg = cs.backgroundColor.match(/\d+/g);
      if (bg && +bg[0] > 180 && +bg[1] < 110 && +bg[2] < 110) r.insignia.push(txt);
    }
  }
  for (const k of ['fuera','chica','tactil','degrade','brillo','versal','insignia','contraste','cortado','desborde','tildes']) r[k] = [...new Set(r[k])];
  return r;
}
"""


def puerto_libre():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


def preparar(pag, pantalla, dias=20, hechas=12):
    pag.evaluate("""([pantalla, dias, hechas]) => {
      localStorage.clear();
      const d = new Date(); d.setDate(d.getDate() - (dias - 1));
      const f = d.toISOString().slice(0, 10);
      localStorage.setItem('tcd_profile', JSON.stringify({nombre: 'Julia', email: 'julia@test', especialidad: 'Psicóloga', fecha_inicio: f, plan: 'DWY'}));
      localStorage.setItem('tcd_current_page', pantalla);
      localStorage.setItem('tcd_plan', 'implementacion');
    }""", [pantalla, dias, hechas])


def main():
    estricto = '--estricto' in sys.argv
    solo = [a for a in sys.argv[1:] if not a.startswith('--')]
    pantallas = [x for x in solo if x in PANTALLAS or x.startswith('admin:')] if solo else list(PANTALLAS)
    puerto = puerto_libre()
    srv = subprocess.Popen(['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env={**os.environ, 'DISABLE_HMR': 'true'})
    base = f'http://127.0.0.1:{puerto}/'
    resultados = {}
    try:
        for _ in range(80):
            try:
                urllib.request.urlopen(base, timeout=1); break
            except Exception:
                time.sleep(0.5)
        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
            solo_admin = [x for x in pantallas if x.startswith('admin:')]
            pantallas = [x for x in pantallas if not x.startswith('admin:')]
            for nombre, pant, boton in (INTERNAS if not solo else [i for i in INTERNAS if i[0] in solo]):
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, pant); pag.reload(); pag.wait_for_timeout(2500)
                try:
                    pag.get_by_role('button', name=boton).first.click(timeout=4000)
                    pag.wait_for_timeout(1500)
                except Exception as e:
                    errores.append(f'no se pudo tocar «{boton}»')
                m = pag.evaluate(MEDIR); m['errores'] = errores
                pag.screenshot(path=f"/tmp/app-{nombre.replace('>', '-')}.png")
                resultados[nombre] = m; pag.close()
            for tab in ([x[6:] for x in solo_admin] if solo else (ADMIN if '--admin' in sys.argv else [])):
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(f'{base}scripts/visor/admin.html?tab={tab}'); pag.wait_for_timeout(3000)
                m = pag.evaluate(MEDIR); m['errores'] = errores
                pag.screenshot(path=f'/tmp/admin-{tab}.png')
                resultados[f'admin:{tab}'] = m; pag.close()
            for p in pantallas:
                pag = ctx.new_page()
                errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base)
                preparar(pag, p)
                pag.reload()
                pag.wait_for_timeout(2500)
                m = pag.evaluate(MEDIR)
                m['errores'] = errores
                pag.screenshot(path=f'/tmp/app-{p}.png')
                resultados[p] = m
                pag.close()
            nav.close()
    finally:
        srv.terminate()

    ancho = max(len(p) for p in resultados)
    print('pantalla'.ljust(ancho), ' '.join(c[:7].rjust(7) for c in COLUMNAS))
    total = 0
    for p, m in resultados.items():
        vals = [m['lateral'] if c == 'lateral' else m['tokens'] if c == 'tokens' else len(m[c]) for c in COLUMNAS]
        total += sum(vals)
        print(p.ljust(ancho), ' '.join(str(v).rjust(7) for v in vals))
    print(f'\nTOTAL de faltas: {total}')
    with open('/tmp/medir-app.json', 'w') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=1)
    print('detalle en /tmp/medir-app.json · capturas en /tmp/app-<pantalla>.png')

    if estricto:
        estrictas = ESTRICTAS + ([f'admin:{t}' for t in ADMIN] if ADMIN_ESTRICTO else [])
        malas = [p for p in estrictas if p in resultados and any(
            (resultados[p][c] if c in ('lateral', 'tokens') else len(resultados[p][c])) for c in COLUMNAS)]
        if malas:
            print('✗ pantallas estrictas con faltas:', ', '.join(malas)); sys.exit(1)
        print('✓ las pantallas estrictas cumplen la especificación')


if __name__ == '__main__':
    main()
