"""LOS CINCO DÍAS QUE SE VENDEN, EJECUTADOS EN PANTALLA — turno 11.

    python3 scripts/caminar-los-cinco-dias.py          # los cinco días
    python3 scripts/caminar-los-cinco-dias.py 4        # uno solo
    python3 scripts/caminar-los-cinco-dias.py --probarme   # la lente contra su propio fallo

Sale 0 si los cinco días se abren, se trabajan, se guardan y avanzan. 1 si no.

═══ POR QUÉ EXISTE ═══

Es lo único que se le cobra a quien entra solo por la página: «Los 8 libros y
los cinco primeros días de mi app». Hasta hoy, de esos cinco días la batería
medía dos cosas y ninguna era ésta:

  · `prueba-los-cinco-dias.ts` mide el SEED —que los cinco existan, que el
    plan los abra, que ninguno se pise—. Es aritmética sobre un archivo: no
    abre el navegador ni toca un botón.
  · `medir-guardado.py` llega hasta la jornada y la toca, y su propio
    comentario dice qué deja afuera: «NO cubre cerrarla… Queda por cubrir, y
    es lo próximo». Esto es lo próximo.

O sea: nadie había hecho nunca, en pantalla, lo que hace el cliente que paga
—entrar a la sesión, trabajarla, cerrarla y que se le abra la de mañana—. Y lo
que mide una pantalla quieta no ve un recorrido: el día 1 de `caminar-el-dia-1`
dio en verde cinco veces mientras el día 4 estaba tapiado.

═══ QUÉ SE ENCONTRÓ AL CAMINARLO (9 de noviembre) ═══

Está escrito en el MAPA-DE-CIRUGIAS, en el bloque del turno 11.

═══ CÓMO SE RECORRE, Y POR QUÉ ASÍ ═══

La sesión de una jornada COACH son DOS pantallas superpuestas, no una:

  1. `SesionViva` — el overlay z-[60]: llevas → (mira) → haz → sube → listo.
     El trabajo del cliente vive en el paso «haz».
  2. `SesionGuiadaPlayer` — el overlay z-[70], que se abre SOLO encima del
     anterior cuando esa jornada tiene guion vivo (4 de los 5 días lo tienen).
     Empieza por una antesala de tres cosas que hay que tocar —el botón de
     seguir está deshabilitado hasta las tres—, después un paso por pantalla, y
     termina en sellar → «Terminar y volver al Camino».

Por eso una sonda que busca botones en todo el documento no sirve: encuentra
los de la Hoja de Ruta que quedaron ABAJO del overlay, los ve «visibles»
—están pintados, solo tapados— y se cuelga esperando tocar uno que nadie puede
tocar. Acá se trabaja siempre contra el contenedor de más arriba.
"""
import importlib.util
import json
import os
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(line_buffering=True)
sys.path.insert(0, os.path.join(RAIZ, 'scripts'))


def _cargar(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(RAIZ, 'scripts', archivo))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MA = _cargar('medir_app', 'medir-app.py')
MG = _cargar('medir_guardado', 'medir-guardado.py')

# ═══ LOS CINCO DÍAS SALEN DEL SEED, NO DE ACÁ ═══════════════════════════════
#
# Una lista escrita a mano envejece sin avisar: si mañana el día 3 cambia de
# código o de pilar, esta lente tiene que seguirlo, no contradecirlo. El seed
# es la fuente, y quien lo lee es `scripts/los-cinco-dias-del-seed.ts`.


# Los tipos de evidencia que de verdad son un archivo para adjuntar. Es la
# misma lista que TaskCoach.tsx llama ADJUNTABLES; se lee de ahí y no se copia,
# porque el día que esa lista cambie esta lente tiene que cambiar con ella.
def adjuntables() -> set:
    txt = open(os.path.join(RAIZ, 'src/components/tasks/TaskCoach.tsx'), encoding='utf-8').read()
    import re
    m = re.search(r"const ADJUNTABLES = new Set\(\[(.*?)\]\)", txt, re.S)
    if not m:
        return set()
    return set(re.findall(r"'([^']+)'", m.group(1)))


def dias_del_seed():
    r = subprocess.run(['npx', 'tsx', 'scripts/los-cinco-dias-del-seed.ts'],
                       cwd=RAIZ, capture_output=True, text=True)
    for linea in r.stdout.split('\n'):
        if linea.startswith('@@'):
            return {d['dia']: d for d in json.loads(linea[2:])}
    raise SystemExit(f'no se pudo leer el seed: {(r.stdout + r.stderr)[-300:]}')


# ═══ EL CONTENEDOR DE MÁS ARRIBA ════════════════════════════════════════════
#
# `SesionViva` va en z-[60] y el player guiado en z-[70]. Lo que el cliente
# puede tocar es lo del overlay de más arriba, y nada más. Esta sonda lo elige
# por su `z-[NN]` y numera sus botones para poder tocarlos sin adivinar textos.
ARRIBA = r"""() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const capas = [...document.querySelectorAll('div')]
    .map((d) => ({ d, z: (String(d.className).match(/z-\[(\d+)\]/) || [])[1] }))
    .filter((x) => x.z && /fixed/.test(String(x.d.className)) && vis(x.d));
  let cap = document.querySelector('main') || document.body;
  let z = 0;
  for (const x of capas) if (Number(x.z) >= z) { z = Number(x.z); cap = x.d; }
  document.querySelectorAll('[data-cap]').forEach((e) => e.removeAttribute('data-cap'));
  cap.dataset.cap = '1';
  const bot = [...cap.querySelectorAll('button')].filter(vis).map((b, i) => {
    b.dataset.b = String(i);
    return { i, t: (b.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 56), off: b.disabled };
  });
  const campos = [...cap.querySelectorAll('textarea, input')].filter(vis).map((e, i) => {
    e.dataset.c = String(i);
    return { i, tipo: e.tagName === 'TEXTAREA' ? 'texto' : (e.type || 'texto'), valor: String(e.value || '') };
  });
  const rot = [...cap.querySelectorAll('p')].map((p) => p.innerText || '')
    .find((t) => /paso \d+ de \d+/.test(t)) || '';
  return { z, rotulo: rot.trim(), botones: bot, campos,
           texto: (cap.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240) };
}"""

# Lo que escribe el cliente. Un «ok» no mide nada: lo que esta lente quiere
# saber es si el párrafo vuelve entero después de recargar.
LO_QUE_ESCRIBE = ('Mi abuela cosía de noche para que entrara la plata y nunca se '
                  'lo dijo a nadie. Me doy permiso de cobrar lo que vale mi hora.')
UN_NUMERO = '45000'


def tocar(pag, i, nombre):
    el = pag.query_selector(f'[data-cap="1"] [data-b="{i}"]')
    if not el:
        return f'el botón «{nombre}» desapareció entre que se vio y se tocó'
    try:
        el.scroll_into_view_if_needed(timeout=3000)
        el.click(timeout=5000)
    except Exception as e:
        return f'«{nombre}» no se puede tocar: {str(e)[:90]}'
    return None


def llenar(pag, campos):
    """Contesta lo que la pantalla pida, y devuelve si escribió algo."""
    escribio = False
    for c in campos:
        if c['valor'].strip() or c['tipo'] in ('checkbox', 'radio', 'file'):
            continue
        el = pag.query_selector(f'[data-cap="1"] [data-c="{c["i"]}"]')
        if not el:
            continue
        try:
            el.scroll_into_view_if_needed(timeout=2000)
            el.fill(UN_NUMERO if c['tipo'] == 'number' else LO_QUE_ESCRIBE)
            escribio = True
        except Exception:
            pass
    return escribio


# EL ORDEN DE ESTA LISTA ES LA LENTE.
#
# Se busca primero lo que CIERRA y al final lo que avanza, y no al revés. Con
# «Siguiente» arriba de «Marcar como completado», el día 1 se recorría entero
# —llevas, mira, haz, sube, listo— sin cerrar nunca la jornada: la sonda
# pasaba de largo por el único botón que la cierra, llegaba al final y daba
# «no queda cerrada» por culpa suya, no de la app. Un recorrido que elige mal
# el botón mide la sonda.
AVANZAN = [
    'Marcar como completado', 'Terminar y volver al Camino', 'GRABAR EN MI ADN',
    'Terminar y revisar', 'Lo quemé',
    'Comenzar mi sesión', 'Ver el video', 'Empezar', 'Ya lo vi, vamos a hacerlo',
    'Siguiente', 'Continuar al siguiente pilar',
]

# Lo que el cliente escribe en «Tu trabajo de hoy» NO se guarda solo: tiene su
# propio botón. Una sonda que escribe y sigue de largo deja la sesión cerrada
# con el cuaderno en blanco, que es justo lo que esta lente vino a mirar.
#
# Y es ESE botón, por su nombre entero. Con «Guardar» a secas acá, el día 1
# tocaba «Guardar mi Foto de Partida» —la rueda de ocho dimensiones, que vive
# en la misma pantalla y que la sonda no había contestado— y se iba a la
# pantalla de cinturón ganado sin pasar nunca por el cuaderno.
GUARDA_LO_ESCRITO = ('Grabar en mi ADN',)


def un_dia(nav, base, dia, seed, adj, romper=None):
    """Abre el día `dia`, lo trabaja, lo cierra, y mira si abre el siguiente.

    `romper` es para `--probarme`: el nombre del sabotaje que se le hace a la
    app para comprobar que esta lente se pone roja. Una lente que nunca se vio
    en rojo no prueba nada.
    """
    info = seed[dia]
    hechas = [seed[k]['clave'] for k in range(0, dia)]
    ctx = nav.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    MA.fijar_reloj(ctx, MA.RELOJ)
    pag = ctx.new_page()
    rotos = []
    pag.on('pageerror', lambda e: rotos.append(f'la pantalla se rompió: {str(e)[:110]}'))
    fallas = []
    try:
        pag.goto(base)
        MA.preparar(pag, 'roadmap', dias=dia, plan='blanco', hechas=hechas)
        if romper == 'listo-miente':
            # Se le devuelve a la pantalla final la frase fija que tenía antes
            # del turno 11, para comprobar que la lente la ve.
            pag.add_init_script("""(() => {
              const poner = () => {
                for (const p of document.querySelectorAll('p')) {
                  if (/todavía no quedó registrada/i.test(p.textContent || '')) {
                    p.textContent = 'Queda registrado en tu Camino. Mañana sigue el paso que toca.';
                  }
                }
              };
              new MutationObserver(poner).observe(document, { childList: true, subtree: true });
            })();""")
        if romper == 'sin-jornada':
            # Como si el día de hoy ya estuviera cerrado: no hay nada que abrir.
            pag.evaluate("""(c) => { const v = JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2')||'[]');
                             v.push(c); localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(v)); }""",
                         info['clave'])
        pag.reload()
        pag.wait_for_timeout(2500)

        # ── 1) La jornada del día está abierta y es la que toca ──────────────
        paso = MG.abrir_jornada_del_dia(pag)
        if paso['falla']:
            return [f'día {dia} ({info["codigo"]}): {paso["falla"]}'] + rotos
        if info['codigo'] not in (paso['jornada'] or '') and info['titulo'][:20] not in (paso['jornada'] or ''):
            fallas.append(f'día {dia}: la jornada que el Camino ofrece abierta es '
                          f'«{paso["jornada"]}» y la del día es «{info["titulo"]}»')

        # ── 2) La sesión se recorre entera ───────────────────────────────────
        escribio = False
        visto = []
        for _ in range(26):
            pag.wait_for_timeout(900)
            v = pag.evaluate(ARRIBA)
            visto.append(f'z{v["z"]}·{v["rotulo"] or v["texto"][:34]}')
            if llenar(pag, v['campos']):
                escribio = True
                # Y se toca su botón de guardar si lo tiene: en «Tu trabajo de
                # hoy» escribir no alcanza, hay que grabarlo.
                v2 = pag.evaluate(ARRIBA)
                for b in v2['botones']:
                    if b['t'].startswith(GUARDA_LO_ESCRITO) and not b['off']:
                        tocar(pag, b['i'], b['t'])
                        break
                continue  # al escribir, el botón de seguir se habilita: mirar de nuevo
            # La antesala del player: tres tarjetas que hay que tocar.
            if any(b['t'].startswith('Prepara tus tres cosas') and b['off'] for b in v['botones']):
                for b in v['botones']:
                    if b['i'] > 0 and not b['t'].startswith('Prepara tus tres'):
                        tocar(pag, b['i'], b['t'])
                continue
            sig = None
            for etiqueta in AVANZAN:
                for b in v['botones']:
                    if b['t'].startswith(etiqueta) and not b['off']:
                        sig = b
                        break
                if sig:
                    break
            if not sig:
                # EL FUEGO NO ES EL FINAL.
                #
                # El paso «ritual» del guion deja 2,1 segundos de transición sin
                # un solo botón en pantalla. La sonda leía ese hueco como «ya no
                # hay por dónde seguir» y daba el día 2 por roto con la app
                # andando perfecto. Se mira dos veces más antes de rendirse.
                pag.wait_for_timeout(2600)
                v = pag.evaluate(ARRIBA)
                for etiqueta in AVANZAN:
                    for b in v['botones']:
                        if b['t'].startswith(etiqueta) and not b['off']:
                            sig = b
                            break
                    if sig:
                        break
                if not sig:
                    break
            err = tocar(pag, sig['i'], sig['t'])
            if err:
                fallas.append(f'día {dia}: {err}')
                break

        # ── 3) La última pantalla dice lo que de verdad pasó ─────────────────
        #
        # Es la lente del turno 11. A la pantalla «Listo» se llega con el botón
        # «Siguiente», que no pide nada, y decía «Queda registrado en tu
        # Camino» sin mirar si la jornada se había cerrado. El día 4 —el único
        # de los cinco cuya evidencia es un archivo— terminaba siempre así.
        pag.wait_for_timeout(1200)
        final = pag.evaluate(r"""() => {
          const cap = document.querySelector('[data-cap="1"]') || document.body;
          const t = (cap.innerText || '').replace(/\s+/g, ' ');
          return { enListo: /paso \d+ de \d+/.test(t) && /Listo ·|Listo$|Todavía no/.test(t),
                   dice_registrado: /Queda registrado en tu Camino/i.test(t),
                   dice_que_falta: /todavía no quedó registrada/i.test(t) };
        }""")
        cerrada_ahora = pag.evaluate("""(cod) => {
          let v = []; try { v = JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') || '[]'); } catch (e) { /* */ }
          return v.some((k) => String(k).endsWith(cod));
        }""", info['codigo'])
        if final['dice_registrado'] and not cerrada_ahora:
            fallas.append(f'día {dia} ({info["codigo"]}): la última pantalla de la sesión dice '
                          '«Queda registrado en tu Camino» y la jornada NO quedó registrada')
        if final['dice_que_falta'] and cerrada_ahora:
            fallas.append(f'día {dia}: la jornada quedó cerrada y la pantalla final le dice '
                          'al cliente que todavía no')

        # ── 4) ¿Quedó cerrada, y lo escrito sobrevive a recargar? ────────────
        pag.wait_for_timeout(1500)
        antes = pag.evaluate("""(cod) => {
          let v = []; try { v = JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') || '[]'); } catch (e) { /* */ }
          let n = {}; try { n = JSON.parse(localStorage.getItem('tcd_notas_sesion_v1') || '{}'); } catch (e) { /* */ }
          let s = {}; try { s = JSON.parse(localStorage.getItem('tcd_sesion_pasos_v1') || '{}'); } catch (e) { /* */ }
          const resp = Object.values((s[cod] || {}).resp || {}).join(' ');
          return { cerrada: v.some((k) => String(k).endsWith(cod)),
                   escrito: String(n[cod] || '') + ' ' + resp };
        }""", info['codigo'])
        pide_archivo = (info['evidencia'] in adj) and not info['avanza_sin_evidencia']
        if pide_archivo and not antes['cerrada']:
            print(f'    · día {dia}: su evidencia es un archivo ({info["evidencia"]}), así que '
                  'no se cierra sin subirlo — y sin conexión no hay dónde subirlo')
        if not antes['cerrada'] and not pide_archivo:
            fallas.append(f'día {dia} ({info["codigo"]}, «{info["titulo"]}»): la sesión se '
                          f'recorre entera y la jornada NO queda cerrada. '
                          f'Pantallas: {" → ".join(visto[-6:])}')
        if pide_archivo and antes['cerrada']:
            fallas.append(f'día {dia}: pide una evidencia para adjuntar y se cerró igual, '
                          'sin adjuntar nada')
        if escribio and LO_QUE_ESCRIBE[:28] not in antes['escrito']:
            fallas.append(f'día {dia}: lo que el cliente escribió en la sesión no quedó guardado')

        pag.reload()
        pag.wait_for_timeout(2500)
        despues = pag.evaluate("""(cod) => {
          let v = []; try { v = JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') || '[]'); } catch (e) { /* */ }
          return v.some((k) => String(k).endsWith(cod));
        }""", info['codigo'])
        if antes['cerrada'] and not despues:
            fallas.append(f'día {dia}: la jornada se cerró y al recargar volvió a estar abierta')

        # ── 5) Cerrado el día, el de mañana es el que toca ───────────────────
        if antes['cerrada'] and dia < 5:
            MA.preparar(pag, 'roadmap', dias=dia + 1, plan='blanco',
                        hechas=[seed[k]['clave'] for k in range(0, dia + 1)])
            pag.reload()
            pag.wait_for_timeout(2500)
            sig = MG.abrir_jornada_del_dia(pag)
            manana = seed[dia + 1]
            if sig['falla']:
                fallas.append(f'día {dia}: cerrado el día, el {dia + 1} no se puede abrir: {sig["falla"]}')
            elif manana['titulo'][:20] not in (sig['jornada'] or ''):
                fallas.append(f'día {dia}: cerrado el día, el Camino abre «{sig["jornada"]}» '
                              f'y mañana es «{manana["titulo"]}»')
        return fallas + rotos
    finally:
        try:
            pag.screenshot(path=f'/tmp/cinco-dias-{dia}.png', full_page=True)
        except Exception:
            pass
        pag.close()
        ctx.close()


def main():
    argv = [a for a in sys.argv[1:]]
    probarme = '--probarme' in argv
    pedidos = [int(a) for a in argv if a.isdigit()] or [1, 2, 3, 4, 5]
    seed = dias_del_seed()
    adj = adjuntables()
    faltan = [d for d in pedidos if d not in seed]
    if faltan:
        print(f'  ✗ el seed no tiene jornada para los días {faltan}')
        return 1
    print(f'  los cinco días, según el seed: '
          + ' · '.join(f'{d}→{seed[d]["codigo"]}' for d in sorted(pedidos)))
    print(f'  evidencia que es un archivo para adjuntar: {sorted(adj)}')

    puerto = MA.puerto_libre()
    srv = subprocess.Popen(['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
                           cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           env={**os.environ, 'DISABLE_HMR': 'true'}, start_new_session=True)
    base = f'http://127.0.0.1:{puerto}/'
    todas = []
    try:
        for _ in range(100):
            try:
                urllib.request.urlopen(base, timeout=1)
                break
            except Exception:
                time.sleep(0.5)
        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            for dia in sorted(pedidos):
                t = time.time()
                fallas = un_dia(nav, base, dia, seed, adj)
                for f in fallas:
                    print(f'  ✗ {f}')
                if not fallas:
                    # El día que pide un archivo no se cierra acá, y decir que
                    # «abre el siguiente» sería la misma mentira que esta lente
                    # vino a cazar.
                    traba = seed[dia]['evidencia'] in adj and not seed[dia]['avanza_sin_evidencia']
                    hizo = ('se abre, se trabaja, y la pantalla final dice que le falta su archivo'
                            if traba else 'se abre, se trabaja, se guarda y abre el siguiente')
                    print(f'  ✓ día {dia} · {seed[dia]["codigo"]} · «{seed[dia]["titulo"]}» '
                          f'— {hizo} ({time.time() - t:.0f}s)')
                todas += fallas
            if probarme:
                print('\n  ── la lente contra su propio fallo ──')
                rotas = un_dia(nav, base, 1, seed, adj, romper='sin-jornada')
                print(f'  {"✓" if rotas else "✗"} con el día de hoy ya cerrado, la lente '
                      f'{"se pone roja" if rotas else "SIGUE EN VERDE — no prueba nada"}')
                if not rotas:
                    todas.append('la lente no se pone roja con su propio fallo')
                fingido = dict(seed)
                fingido[1] = {**seed[1], 'evidencia': sorted(adj)[0] if adj else 'imagen'}
                rotas2 = un_dia(nav, base, 1, fingido, adj)
                print(f'  {"✓" if rotas2 else "✗"} con el día 1 declarado «pide archivo» y cerrándose '
                      f'igual, la lente {"se pone roja" if rotas2 else "SIGUE EN VERDE"}')
                if not rotas2:
                    todas.append('la lente no ve una jornada que se cierra sin su evidencia')
                rotas3 = un_dia(nav, base, 4, seed, adj, romper='listo-miente')
                dice = [f for f in rotas3 if 'Queda registrado' in f]
                print(f'  {"✓" if dice else "✗"} con la pantalla final diciendo «queda registrado» '
                      f'sin estarlo, la lente {"se pone roja" if dice else "SIGUE EN VERDE"}')
                if not dice:
                    todas.append('la lente no ve la pantalla final que miente')
            nav.close()
    finally:
        try:
            os.killpg(os.getpgid(srv.pid), 15)
        except Exception:
            srv.kill()
    print()
    print(f'  {"TODO EN VERDE" if not todas else f"{len(todas)} COSAS ROTAS"}')
    return 1 if todas else 0


if __name__ == '__main__':
    sys.exit(main())
