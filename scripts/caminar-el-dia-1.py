"""EL DÍA 1 DE UN CLIENTE, CAMINADO — `python3 scripts/caminar-el-dia-1.py`

Se queda en el repo porque encontró dos cosas que ninguna otra lente ve. Las
demás MIDEN pantallas sueltas —palabras, contraste, tamaños— y todas estaban
en verde. Esta las RECORRE en orden, tocando los botones como una persona, y
por eso vio que «Empezar» no llevaba a la sesión y que la salida de la
pregunta del día cero estaba debajo de seis casillas.

Lo que mide una pantalla no ve un recorrido. Las capturas quedan en
/tmp/dia1-NN.png: hay que MIRARLAS — el lector de texto agarra el `main`, y
cuando la sesión se abre encima, lee la pantalla de atrás.


El wizard de bienvenida ya se recorre y se mide. Lo que nadie recorrió nunca
es lo de DESPUÉS: tocar «Empezar» en la jornada de hoy, hacer la sesión y
guardarla. Es el momento que decide si el cliente vuelve mañana.

No mide densidad: busca FRENOS. En cada paso anota qué se ve, qué botón hay y
si algo se rompió, y para cuando ya no hay por dónde seguir.
"""
import os, subprocess, time, urllib.request, importlib.util, json
from playwright.sync_api import sync_playwright
spec = importlib.util.spec_from_file_location('ma', '/home/claude/tcd1/scripts/medir-app.py')
MA = importlib.util.module_from_spec(spec); spec.loader.exec_module(MA)

VISIBLE = """() => {
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const botones = [...document.querySelectorAll('button, a[href], [role="button"]')]
    .filter(vis).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\\s+/g,' '))
    .filter(t => t && t.length < 60);
  const main = document.querySelector('main') || document.body;
  return { texto: (main.innerText || '').trim().slice(0, 260).replace(/\\n+/g, ' · '),
           botones: [...new Set(botones)].slice(0, 14),
           alto: main.scrollHeight };
}"""

puerto = MA.puerto_libre()
srv = subprocess.Popen(['npx','vite','--port',str(puerto),'--strictPort','--host','127.0.0.1'],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env={**os.environ,'DISABLE_HMR':'true'}, start_new_session=True)
base = f'http://127.0.0.1:{puerto}/'
fallas = []
try:
    for _ in range(80):
        try: urllib.request.urlopen(base, timeout=1); break
        except Exception: time.sleep(0.5)
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        ctx = nav.new_context(viewport={'width':390,'height':844}, device_scale_factor=1)
        MA.fijar_reloj(ctx, MA.RELOJ)
        pag = ctx.new_page()
        pag.on('pageerror', lambda e: fallas.append(f'PAGEERROR {str(e)[:140]}'))
        pag.on('console', lambda m: fallas.append(f'CONSOLA {m.text[:120]}') if m.type == 'error' else None)
        pag.goto(base)
        # Día 1, sin ninguna jornada hecha: como queda apenas paga.
        MA.preparar(pag, 'dashboard', dias=1)
        pag.reload(); pag.wait_for_timeout(3000)

        paso = 0
        def mirar(nombre):
            global paso
            paso += 1
            v = pag.evaluate(VISIBLE)
            pag.screenshot(path=f'/tmp/dia1-{paso:02d}.png')
            print(f'\n[{paso}] {nombre}  ·  alto {v["alto"]}px')
            print(f'    texto: {v["texto"][:200]}')
            print(f'    botones: {v["botones"]}')
            return v

        v = mirar('Hoy, día 1')

        # Tocar «Empezar», que es el único botón importante de la pantalla.
        if any('Empezar' in b for b in v['botones']):
            pag.get_by_role('button', name='Empezar', exact=True).first.click()
            pag.wait_for_timeout(2500)
            v = mirar('después de «Empezar»')
        else:
            print('\n  ✗ NO HAY BOTÓN «Empezar» EN EL DÍA 1')

        # Y seguir mientras haya un paso siguiente.
        for intento in range(10):
            siguiente = None
            for etiqueta in ['Empiezo de cero','Empezar el día 1','Empezar','Siguiente','Continuar','Listo','Guardar','Terminar','Marcar como hecha']:
                if any(etiqueta == b or b.startswith(etiqueta) for b in v['botones']):
                    siguiente = etiqueta; break
            if not siguiente:
                print(f'\n  ── sin botón para seguir. Botones a la vista: {v["botones"]}')
                break
            try:
                pag.get_by_role('button', name=siguiente).first.click(timeout=4000)
            except Exception as e:
                print(f'\n  ✗ «{siguiente}» no se pudo tocar: {str(e)[:100]}')
                break
            pag.wait_for_timeout(2200)
            v = mirar(f'después de «{siguiente}»')

        print('\n════ lo que se rompió por el camino ════')
        for f in dict.fromkeys(fallas):
            print('  ·', f)
        if not fallas:
            print('  (nada)')
        pag.close(); ctx.close(); nav.close()
finally:
    try: os.killpg(os.getpgid(srv.pid), 15)
    except Exception: srv.kill()
