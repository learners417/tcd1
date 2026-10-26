"""medir-guardado.py — Lo que el cliente escribe, ¿sobrevive a recargar?

═══ POR QUÉ EXISTE ═══

El medidor MIRA. Abre una pantalla, la fotografía y cuenta lo que ve. Nunca
toca nada. Así que un botón que no guarda es invisible para él: la pantalla se
ve perfecta, las veintiuna lentes dan cero, y el cliente pierde su trabajo.

No es una hipótesis. El Camino borraba setenta y una jornadas al abrirse y las
sesenta y un vistas del medidor daban cero mientras lo hacía. Lo que destapó
eso fue medir con datos; lo que lo habría destapado antes es esto: tocar.

Los bucles que un cliente que paga hace todas las semanas:

  1. Llegar a la jornada del día en El Camino, y tocarla
  2. Escribir su día en el Diario
  3. Cargar sus números en Mi Número
  4. Escribirle al Mentor cuando la IA no contesta

Los tres primeros se miden igual: se abre la pantalla, se toca, se RECARGA, y
se pregunta si sigue ahí. Recargar es la parte que importa — sin eso se mide el
estado de React, que siempre dice que sí.

El cuarto no mide si guarda, mide la RESPUESTA: la promesa central de la app es
que hay alguien del otro lado, y eso depende de una llave de API que puede
vencer o quedarse sin cupo. Un chat que se queda girando para siempre le da
cero a las veintidós lentes.

Se corre así:

    python3 scripts/medir-guardado.py            # los tres bucles
    python3 scripts/medir-guardado.py camino     # uno solo

Sale 0 si los tres guardan, 1 si alguno pierde.
"""
import importlib.util
import os
import signal
import socket
import re
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(line_buffering=True)

# ═══ UNA SOLA SEMILLA EN LA CASA ═══
#
# `preparar()` y `estado_lleno()` se importan del medidor, no se copian. La
# primera versión de este archivo tenía su propia copia de la semilla y
# difería en cosas que deciden qué se renderiza —el `id` del perfil, el
# `plan_comercial` que lee el candado comercial— así que las tres pantallas
# abrían sin contenido y los tres bucles «fallaban» sin haber tocado nada.
# Dos semillas que dicen montar la misma cuenta son dos cuentas distintas.
sys.path.insert(0, os.path.join(RAIZ, 'scripts'))
_spec = importlib.util.spec_from_file_location('medir_app', os.path.join(RAIZ, 'scripts', 'medir-app.py'))
medidor = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(medidor)
preparar = medidor.preparar
estado_lleno = medidor.estado_lleno


def abrir(ctx, base, pantalla, dias=20, lleno=False, hechas=None):
    """Una página en `pantalla`, ya cargada.

    ═══ POR QUÉ ACÁ LA CUENTA NO VA LLENA ═══

    La primera versión abría con la cuenta del día 72, la misma que usa el
    medidor. Y las tres pantallas aparecían sin un solo campo ni botón — no
    por una falla, sino porque es lo correcto: con el día de hoy ya escrito en
    el Diario y los números de la semana ya cargados, la app muestra lo
    guardado en vez del formulario. Y con setenta y una de noventa y una
    jornadas cerradas, las que quedan abiertas están en tramos que todavía no
    se abrieron.

    La cuenta llena es para MIRAR. Para TOCAR hace falta la cuenta de quien se
    sienta a trabajar hoy: el día veinte, con el camino abierto, el diario del
    día sin escribir y la semana sin cargar. Es el estado en el que el cliente
    de verdad escribe algo.
    """
    pag = ctx.new_page()
    pag.goto(base)
    preparar(pag, pantalla, dias=dias, lleno=lleno, hechas=hechas)
    pag.reload()
    pag.wait_for_timeout(3200)
    return pag


def recargar(pag):
    pag.reload()
    pag.wait_for_timeout(3200)


# ═══ BUCLE 1 · LLEGAR A LA JORNADA DEL DÍA Y TOCARLA ═══════════════════════
def bucle_camino(ctx, base):
    """Del Camino al taller de la jornada: tramo, jornada, y que abra.

    ═══ QUÉ CUBRE Y QUÉ NO ═══

    Cubre el camino del cliente hasta su trabajo del día: abrir el tramo que
    le toca y abrir la jornada. Si eso se rompe, la app no sirve para nada
    más, y ninguna de las sesenta y cinco vistas del medidor lo vería: todas
    fotografían la pantalla de entrada.

    NO cubre cerrarla. Cerrar una jornada pasa por el reproductor de la sesión
    guiada y exige la evidencia subida —`TaskCoach` llama a `onComplete` solo
    si `evidenciaLista`— así que es un flujo de varios pasos con una subida de
    archivo en el medio, no un clic. Queda por cubrir, y es lo próximo.

    Lo que SÍ está protegido del cierre es que no se pierda:
    `prueba-el-progreso-no-se-borra.ts` mide las tres escrituras y
    `unirProgreso` con sus ocho casos.

    ═══ CÓMO SE NAVEGA DE VERDAD ═══

    El Camino muestra TRAMOS, y las jornadas viven adentro. El tramo del día
    se reconoce por su ícono: tilde el cerrado, candado el que no se abrió, un
    rayo en oro el que toca hoy.

    Y la jornada NO es un botón: es un `div` con `onClick`, con su `id`
    `meta-<codigo>`. Una sonda que busca `button` no encuentra ninguna y
    parece que la app está vacía. (De paso: un `div` que se toca sin
    `role="button"` ni foco de teclado no lo alcanza nadie que no use el
    dedo — queda anotado, es un patrón de toda la app y no una línea.)

    A medio camino, que es cuando se toca: con cero jornadas la app muestra
    «¿Qué ya tienes andando?» y con las noventa y una cerradas las que quedan
    abiertas están en tramos que todavía no se abrieron.
    """
    fallas = []
    hechas = estado_lleno()['hechas'][:30]
    pag = abrir(ctx, base, 'roadmap', dias=40, hechas=hechas)

    print(f'  arranca con {len(hechas)} jornadas cerradas')

    # La entrada a la lista: las tarjetas con barra son el MAPA del camino
    # —tocarlas contrae, no despliega— y la lista de jornadas vive detrás de
    # «Tu Hoja de Ruta». Confundir el mapa con la lista fue lo que hizo que
    # esta sonda diera tres veces «no hay jornadas» con la app entera andando.
    puerta = pag.evaluate("""() => {
      const b = [...document.querySelectorAll('#root button')]
        .filter((x) => !x.closest('aside'))
        .find((x) => /Hoja de Ruta/i.test(x.textContent || ''));
      if (!b) return null;
      b.dataset.puerta = '1';
      return (b.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 44);
    }""")
    if not puerta:
        pag.close()
        return ['el Camino no ofrece la entrada a la hoja de ruta']
    print(f'  entra por «{puerta}»')
    pag.click('[data-puerta="1"]')
    pag.wait_for_timeout(1600)

    # EL TRAMO DEL DÍA YA VIENE ABIERTO.
    #
    # Al cargar, si no hay ninguno elegido, el Camino abre solo el primer tramo
    # sin terminar. Y la tarjeta del tramo ALTERNA: tocarla cuando ya está
    # abierta la cierra. Esta sonda la tocaba «para abrirla» y la cerraba, y
    # después no encontraba jornadas — con la app funcionando perfecto. Se mira
    # primero, y solo se toca si de verdad está cerrado.
    hay = pag.evaluate("() => document.querySelectorAll('[id^=\"meta-\"]').length")
    if hay == 0:
        tramo = pag.evaluate("""() => {
          const bs = [...document.querySelectorAll('#root button')].filter((b) => !b.closest('aside'));
          const conRayo = bs.find((b) => b.querySelector('svg.lucide-zap'));
          if (!conRayo) return null;
          conRayo.dataset.tramo = '1';
          return (conRayo.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 44);
        }""")
        if tramo:
            print(f'  venía cerrado: abre el tramo «{tramo}»')
            pag.click('[data-tramo="1"]')
            pag.wait_for_timeout(1400)
    else:
        print(f'  el tramo del día ya viene abierto, con {hay} jornadas')

    jornada = pag.evaluate("""() => {
      // La jornada es un div con id `meta-<codigo>`; adentro, la fila que se toca.
      const filas = [...document.querySelectorAll('[id^="meta-"]')]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 40 && r.height > 10; });
      if (!filas.length) return null;
      /*
       * ─── CÓMO SE RECONOCE UNA JORNADA ABIERTA ───────────────────────────
       *
       * Por su ícono, y los nombres son los de lucide, no los que uno
       * supondría: la cerrada lleva `lucide-circle-check`, la abierta un
       * `lucide-circle` a secas y la bloqueada `lucide-lock`. Esta sonda
       * buscaba `lucide-check-circle-2`, que no existe, así que daba por
       * abiertas a las tres cerradas del tramo y tocaba la primera.
       *
       * Y CON TRABAJO: «Día 27 · Fin de semana · 0 min» es un día de descanso
       * y no tiene taller. Tocarlo y esperar un taller es pedirle a la app
       * algo que con razón no hace.
       */
      const conTrabajo = (el) => /[1-9]\\d* ?min/.test(el.textContent || '');
      const abierta = filas.find((el) => el.querySelector('svg.lucide-circle')
        && !el.querySelector('svg.lucide-lock') && conTrabajo(el));
      if (!abierta) return { cuantas: filas.length, cual: null };
      abierta.dataset.tocar = '1';
      return { cuantas: filas.length, cual: (abierta.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 50) };
    }""")
    if not jornada:
        pag.close()
        return [f'el tramo «{tramo}» se abrió y no muestra ninguna jornada adentro']

    if not jornada['cual']:
        pag.close()
        return [f'las {jornada["cuantas"]} jornadas del tramo están cerradas o bloqueadas: '
                'no hay ninguna abierta con trabajo']
    print(f'  el tramo tiene {jornada["cuantas"]} jornadas · toca «{jornada["cual"]}»')

    # ¿RESPONDE AL TOQUE? Se mide por su estilo, no por un texto.
    #
    # Buscar una frase del taller es adivinar: «TU PRÓXIMO PASO» ya está en la
    # pantalla antes de tocar nada, así que no sirve de marcador. Y el panel de
    # la jornada no se despliega dentro de su contenedor —se pinta aparte, por
    # eso el Camino guarda un `taskRef` para desplazarse hasta él— así que el
    # alto del contenedor tampoco lo dice.
    #
    # Lo que sí es exacto: la fila elegida toma su estilo activo —oro en el
    # fondo y en el borde— y ese cambio es la app contestando que registró el
    # toque. Si la fila no cambia, no pasó nada, y es lo único que ninguna de
    # las sesenta y cinco vistas del medidor vería: todas fotografían la
    # pantalla quieta.
    antes_clase = pag.evaluate(MEDIR_CLASE)
    # Y se toca la FILA, no su contenedor. El `onClick` vive en el div de
    # adentro; el de afuera solo lleva el `id`. Tocar el contenedor cae en su
    # centro, que puede no ser la fila, y no pasa nada.
    pag.evaluate("""() => {
      const c = document.querySelector('[data-tocar="1"]');
      const fila = c && c.firstElementChild;
      if (fila) fila.dataset.fila = '1';
    }""")

    pag.click('[data-fila="1"]')
    pag.wait_for_timeout(1600)
    despues_clase = pag.evaluate(MEDIR_CLASE)

    activa = 'gold' in despues_clase and 'gold' not in antes_clase
    print(f'  la fila {"toma su estilo activo" if activa else "NO cambió"} al tocarla')
    if not activa:
        fallas.append('tocar la jornada no la activó: la fila no cambió de estilo')

    pag.close()
    return fallas


# ═══ BUCLE 2 · ESCRIBIR EL DÍA ═════════════════════════════════════════════
def bucle_diario(ctx, base):
    """Escribe un logro, guarda, recarga, y pregunta si el texto sigue ahí."""
    fallas = []
    pag = abrir(ctx, base, 'diario')
    MARCA = 'Cerré la oferta y le puse precio sin pedir permiso'

    campos = pag.evaluate("""() => {
      const cs = [...document.querySelectorAll('#root textarea, #root input[type="text"]')]
        .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 40 && b.height > 10; });
      cs.forEach((el, i) => { el.dataset.campo = String(i); });
      return cs.map((el) => (el.getAttribute('placeholder') || el.getAttribute('aria-label') || el.name || 'sin nombre').slice(0, 40));
    }""")
    if not campos:
        print('  no hay campos a la vista en el Diario — no se puede tocar')
        pag.close()
        return ['el Diario no ofrece ningún campo para escribir']

    print(f'  campos a la vista: {len(campos)} · escribe en «{campos[0]}»')
    pag.fill('[data-campo="0"]', MARCA)
    pag.wait_for_timeout(300)

    # El botón de guardar, buscado por lo que dice.
    guardo = pag.evaluate("""() => {
      const b = [...document.querySelectorAll('#root button')]
        .find((x) => /guardar|cerrar el día|listo|registrar/i.test(x.textContent || ''));
      if (!b) return null;
      b.dataset.guardar = '1';
      return (b.textContent || '').trim().slice(0, 40);
    }""")
    if guardo:
        print(f'  toca «{guardo}»')
        pag.click('[data-guardar="1"]')
        pag.wait_for_timeout(1200)
    else:
        print('  no hay botón de guardar: se asume guardado al escribir')
        pag.wait_for_timeout(1500)

    recargar(pag)
    sigue = pag.evaluate("""(marca) => {
      const crudo = localStorage.getItem('tcd_diario_v3') || '[]';
      return crudo.includes(marca);
    }""", MARCA)
    print(f'  después de recargar, el texto {"sigue ahí" if sigue else "NO está"}')
    if not sigue:
        fallas.append('lo escrito en el Diario no sobrevivió a recargar')

    pag.close()
    return fallas


# ═══ BUCLE 3 · PONERLE PRECIO ══════════════════════════════════════════════
def bucle_numeros(ctx, base):
    """Carga los tres números de Mi Número, cierra el precio, y recarga.

    ═══ LO QUE ESTA SONDA SE EQUIVOCÓ DOS VECES ═══

    Primero apuntó a Métricas, que MUESTRA los números: dos pestañas y ningún
    campo. Donde el cliente los escribe es Mi Número.

    Después llenó UN campo de los tres y buscó en `tcd_metrics_v3`. Mi Número
    guarda en `tcd_el_numero` mientras se escribe, y su botón —«Este es mi
    precio nuevo»— aparece recién con los tres llenos. Un campo de tres es una
    pantalla a medio llenar, y buscar en la clave equivocada es no buscar.
    """
    fallas = []
    pag = abrir(ctx, base, 'numero')

    campos = pag.evaluate("""() => {
      const ins = [...document.querySelectorAll('#root input[type=number]')]
        .filter((el) => !el.closest('aside'));
      ins.forEach((el, i) => { el.dataset.n = String(i); });
      return ins.length;
    }""")
    if campos < 3:
        pag.close()
        return [f'Mi Número muestra {campos} campos y hacen falta 3']

    VALORES = ['12', '4500', '35']
    print(f'  carga {" · ".join(VALORES)} en los tres campos')
    for i, v in enumerate(VALORES):
        pag.fill(f'[data-n="{i}"]', v)
        pag.wait_for_timeout(250)

    guardo = pag.evaluate("""() => {
      const b = [...document.querySelectorAll('#root button')]
        .find((x) => /precio nuevo|guardar|confirmar/i.test(x.textContent || ''));
      if (!b) return null;
      b.dataset.guardar = '1';
      return (b.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 44);
    }""")
    if not guardo:
        fallas.append('con los tres números cargados no aparece el botón de cerrar el precio')
    else:
        print(f'  toca «{guardo}»')
        pag.click('[data-guardar="1"]')
        pag.wait_for_timeout(1500)

    recargar(pag)
    tras = pag.evaluate("""() => {
      const n = localStorage.getItem('tcd_el_numero') || '';
      const ruta = localStorage.getItem('tcd_hoja_ruta_v2') || '[]';
      return { numeros: n.slice(0, 120), jornadas: JSON.parse(ruta).length };
    }""")
    print(f'  después de recargar: {tras["numeros"][:80]}')
    print(f'  y la hoja de ruta tiene {tras["jornadas"]} jornada(s)')
    if '4500' not in tras['numeros']:
        fallas.append('los números cargados no sobrevivieron a recargar')
    # Ponerle precio ABRE el Camino: `marcarNumeroEnElCamino` marca la
    # primera jornada y con eso llega la primera punta del cinturón. Si el
    # precio se guarda pero la jornada no se marca, el cliente cierra la
    # puerta 1 y la app no se entera.
    if guardo and tras['jornadas'] == 0:
        fallas.append('el precio quedó guardado pero el Camino no se marcó')
    pag.close()
    return fallas


# El estilo de la fila tocada: el oro en el fondo y el borde es la app
# contestando que registró el toque.
MEDIR_CLASE = ("() => { const el = document.querySelector('[data-fila=\"1\"]');"
               " return el ? String(el.className) : ''; }")

# ═══ BUCLE 4 · CUANDO LA IA NO CONTESTA ════════════════════════════════════
def bucle_sin_ia(ctx, base):
    """El Mentor con la IA caída: ¿qué LEE el cliente?

    ═══ POR QUÉ ESTE BUCLE ═══

    La promesa central de la app es que hay alguien del otro lado: el Mentor y
    los ocho entrenadores. Esa promesa depende de una llave de API que puede
    vencer, quedarse sin cupo o caerse un martes a la mañana. Lo que el cliente
    lee en ese momento decide si la app parece rota o parece cuidada.

    Acá no se mide si guarda: se mide la RESPUESTA. El medidor fotografía la
    pantalla quieta, así que un chat que se queda girando para siempre le da
    cero en las veintidós lentes.

    Este entorno no tiene ninguna llave, así que es exactamente el estado que
    se quiere medir: la cadena entera falla.

    Lo que tiene que pasar: un mensaje en castellano, con qué hacer, adentro de
    la conversación y en pocos segundos. Lo que NO: un código de estado, la
    palabra «error», un rastro técnico, o nada.
    """
    fallas = []
    pag = abrir(ctx, base, 'coach')

    campo = pag.evaluate("""() => {
      const cs = [...document.querySelectorAll('#root textarea, #root input[type=text]')]
        .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 40 && b.height > 10; });
      if (!cs.length) return null;
      cs[0].dataset.c = '1';
      return (cs[0].getAttribute('placeholder') || 'sin placeholder').slice(0, 40);
    }""")
    if not campo:
        pag.close()
        return ['el Mentor no ofrece dónde escribir']

    print(f'  escribe en «{campo}»')
    pag.fill('[data-c="1"]', 'Hola, ¿por dónde sigo?')
    pag.wait_for_timeout(300)
    boton = pag.evaluate("""() => {
      const b = [...document.querySelectorAll('#root button')].find((x) =>
        /enviar|mandar/i.test(x.textContent || '')
        || /enviar|mandar/i.test(x.getAttribute('aria-label') || ''));
      if (!b) return null;
      b.dataset.enviar = '1';
      return (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 24);
    }""")
    if boton:
        print(f'  toca «{boton}»')
        pag.click('[data-enviar="1"]')
    else:
        pag.keyboard.press('Enter')

    # Cinco segundos es de sobra: la cadena falla rápido cuando no hay llave.
    leido = None
    for _ in range(10):
        pag.wait_for_timeout(500)
        leido = pag.evaluate("""() => {
          const m = document.querySelector('main');
          const t = ((m && m.innerText) || '').replace(/\\s+/g, ' ');
          const i = t.search(/No pudimos|No pudo|no está disponible|sin internet|venció/i);
          return i >= 0 ? t.slice(i, i + 140) : null;
        }""")
        if leido:
            break

    if not leido:
        pag.close()
        return ['con la IA caída el cliente no lee nada: se queda esperando']

    print(f'  lee: «{leido[:90]}»')
    # Y que no se le muestre nada técnico. El cliente no puede hacer nada con
    # un 502 ni con un rastro, y leerlo solo le dice que algo está roto sin
    # decirle qué hacer.
    tecnico = pag.evaluate("""() => {
      const m = document.querySelector('main');
      const t = ((m && m.innerText) || '');
      const sospechas = t.match(/\\b(50\\d|40\\d)\\b|TypeError|undefined|null|fetch|stack|API|ANTHROPIC/g);
      return sospechas ? [...new Set(sospechas)].slice(0, 4) : null;
    }""")
    if tecnico:
        fallas.append(f'le muestra algo técnico: {tecnico}')
    # Y que el mensaje diga QUÉ HACER, no solo que falló.
    if not re.search(r'prueba|intenta|vuelve|escríbenos|en un minuto|en unos segundos', leido, re.I):
        fallas.append('el mensaje dice que falló y no dice qué hacer')
    pag.close()
    return fallas


BUCLES = {'camino': bucle_camino, 'diario': bucle_diario, 'numeros': bucle_numeros,
          'sin_ia': bucle_sin_ia}

# Qué comprobó cada uno, en sus palabras. Un «sobrevive a recargar» para los
# tres sería prometer de más: el del Camino no recarga nada — comprueba que la
# app conteste el toque, que es distinto y hay que decirlo así.
VEREDICTO = {
    'camino': 'el cliente llega a la jornada del día y la app le contesta el toque',
    'diario': 'lo que escribió sigue ahí después de recargar',
    'numeros': 'su precio sigue ahí después de recargar, y abrió el Camino',
    'sin_ia': 'con la IA caída lee qué pasó y qué hacer, en castellano y sin nada técnico',
}


def main():
    pedidos = [a for a in sys.argv[1:] if a in BUCLES] or list(BUCLES)
    puerto = (lambda s: (s.bind(('127.0.0.1', 0)), s.getsockname()[1], s.close())[1])(socket.socket())
    srv = subprocess.Popen(
        ['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
        cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        env={**os.environ, 'DISABLE_HMR': 'true'}, start_new_session=True)
    base = f'http://127.0.0.1:{puerto}/'
    todas = {}
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
            for nombre in pedidos:
                print(f'\n── {nombre} ──')
                try:
                    todas[nombre] = BUCLES[nombre](ctx, base)
                except Exception as e:  # una excepción acá ES una falla del bucle
                    todas[nombre] = [f'la prueba se rompió: {str(e)[:120]}']
            nav.close()
    finally:
        try:
            os.killpg(os.getpgid(srv.pid), signal.SIGTERM)
        except Exception:
            srv.terminate()

    print('\n═══ LO QUE EL CLIENTE GUARDA ═══')
    malos = 0
    for nombre, fallas in todas.items():
        if fallas:
            malos += 1
            print(f'  ✗ {nombre}')
            for f in fallas:
                print(f'      {f}')
        else:
            print(f'  ✓ {nombre} — {VEREDICTO[nombre]}')
    n = len(todas)
    if malos:
        print(f'\n✗ {malos} de {n} {"bucle" if n == 1 else "bucles"} con problemas\n')
        sys.exit(1)
    print(f'\n✓ {"el bucle responde" if n == 1 else f"los {n} bucles responden"}\n')


if __name__ == '__main__':
    main()
