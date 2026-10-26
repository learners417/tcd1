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
  cifrasBajas un número escrito en el serif de display sin pedirle numerales
            altos. Cormorant Garamond trae cifras de ESTILO ANTIGUO por
            defecto: el 1 y el 2 se dibujan a la altura de la x, así que «Tu
            semana 11» se lee «Tu semana ɪɪ» —romanos— y «3 de 7» pierde su
            número. En una app pensada para TDAH un número que hay que
            descifrar no es un número. Se arregla con
            `font-variant-numeric: lining-nums`.
  nombreDoble la pantalla dice su nombre dos veces: la barra de arriba lo
            lleva y el contenido abre repitiéndolo. Lo primero que se lee es
            la misma palabra dos veces, que es ruido donde hace más falta el
            aire. Apareció al poner el nombre de la pantalla en la barra: las
            páginas ya tenían el suyo y nadie sacó el de abajo.
  serifChico el serif de display por debajo de 20 px: su altura de x es tan
            baja que a 17 lee como un sans de 14, y ahí la jerarquía se da
            vuelta (el nombre lee más chico que su descripción). Las
            versalitas quedan fuera: en caja alta no hay altura de x, y la
            versalita del libro a 15 es una pieza de la casa.
  oroRelleno botones con el fondo de oro: el oro va en la línea, no en el
            relleno (§2). Se mide el color calculado, no la clase.
  iconoFlotante un ícono chico centrado contra un texto de dos o más
            renglones: queda en el hueco entre el primero y el segundo, sin
            alinear a nada. El ícono grande no cuenta: ahí centrar es correcto
  notaAlPie itálica en el sans con la opacidad por debajo del 62%: «esto
            importa menos» dicho dos veces, y la cursiva de un sans ni
            siquiera está dibujada. La cursiva de la casa es de la Garamond
  lineaTinta bordes de 1px pintados del color del texto: la clase se partió
            en dos por el espacio de la coma y el borde quedó en
            `currentColor`, que en el tema claro es casi negro
  aplastado texto que el layout dejó en CERO píxeles de ancho. Era el punto
            ciego del medidor: `vis()` pide ancho > 0, así que lo aplastado
            no se medía en ningún lente. Así estuvo el nombre de la pantalla
            en la barra del teléfono, en los 14 destinos al mismo tiempo.
  tildes    palabras sin su tilde, por regla de terminación (-cion, -logia…)
            (se mide también 'cierre': el cierre de cuentas con sus tres pases,
             que es la pantalla del que terminó o se quedó sin ventana)
            y por lista para las que no siguen regla
  errores   errores de JavaScript al abrir

Y un lente que mira la pantalla entera en vez de elemento por elemento:

  letras      cuántos tamaños de letra distintos pinta (techo 7)
  superficies cuántos fondos de panel distintos (techo 5)
  esquinas    cuántos radios de esquina distintos (techo 4)

Esos tres informan siempre y solo fallan pasado su techo: no son una regla
con un número redondo, son la señal de que una pantalla se armó por
acumulación. Es lo que no veían los otros trece, que miden de a un elemento.

Lo plegado se ABRE antes de medir (ABRIR_PLEGADOS): el lente salta lo que
está display:none, así que un <details> cerrado escondía sus faltas.

Uso:
  python3 scripts/medir-app.py              → tabla + capturas en /tmp/app-<pantalla>.png
  python3 scripts/medir-app.py --estricto   → sale con error si alguna pantalla
                                              de la lista ESTRICTAS tiene algo
"""
import json, os, signal, socket, subprocess, sys, time, urllib.request

os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PANTALLAS = ['dashboard', 'roadmap', 'entrenadores', 'adn', 'coach', 'miclinica', 'metrics',
             # 'agentes' salió: era la segunda ruta a la misma pantalla que
             # 'entrenadores' y no estaba en ningún menú. Medirla era medir la
             # misma pantalla dos veces, y desde que la ruta no existe, medir
             # una pantalla en blanco.
             'biblioteca', 'diario', 'creador', 'numero', 'manualNegocio', 'campanas',
             # 'mensajes' entró el 9 de oct: es uno de los cinco destinos del
             # cliente y no se estaba midiendo ninguna de sus pantallas.
             'mensajes']
# Las pantallas ya llevadas al nivel de la especificación. Crece turno a turno.
# Las pestañas internas del cliente: (nombre, pantalla, texto del botón a tocar).
INTERNAS = [
    ('metrics>sistema', 'metrics', 'Mi Sistema'),
    ('diario>historial', 'diario', 'Historial'),
    ('biblioteca>conciencia', 'biblioteca', 'Conciencia'),
    ('campanas>escribir', 'campanas', 'Escribir'),
    ('campanas>nueva', 'campanas', 'Montar en Meta'),
    ('campanas>diagnosticar', 'campanas', 'Diagnosticar'),
    ('campanas>copies', 'campanas', 'Textos'),
    ('campanas>ganadores', 'campanas', 'Ganadores'),
    # ↓ Sin medir hasta hoy. Ahí vivía «Edicion» sin tilde y «Preview».
    ('campanas>anuncios', 'campanas', 'Tus 3 anuncios'),
    ('campanas>montaje', 'campanas', 'Montaje'),
    ('campanas>historial', 'campanas', 'Historial'),
    ('campanas>activacion', 'campanas', 'Activación'),
]
# Las pestañas del Admin (VALID_MAIN_TABS de Admin.tsx), vistas con rol de dirección.
# 'plata' se cayó de acá el 9 oct: la Mesa de plata se borró en la cirugía 5 y
# esta lista seguía pidiéndola. Una pestaña que no existe no deja la pantalla en
# blanco: el Admin se queda en la anterior y el medidor la mide dos veces,
# contando un verde que no corresponde a ninguna pantalla. La lente
# «el medidor mide las pestañas que existen» de auditoria.py vigila que no
# vuelva a pasar.
ADMIN = ['clientes', 'pipeline', 'mensajes', 'metricas', 'videos', 'equipo', 'campanas', 'creativos',
         'tareas', 'motor', 'hoy', 'supervision', 'sala', 'mirol', 'sesiones', 'semana', 'casa']
# Desde el 16 sep, TODAS las pantallas del cliente.
# Las que el cliente pisa el primer día. Las de campañas quedan fuera: el día
# 1 están cerradas por plan y lo que se ve es la puerta, que ya se mide en
# 'entrada'.
PRIMERAS = ['dashboard', 'roadmap', 'adn', 'diario', 'metrics', 'biblioteca', 'mensajes', 'entrenadores']

# Las que cambian de verdad cuando hay datos: las que muestran numerales, listas
# largas o los textos que el cliente escribió. En El Método y Entrenadores el
# contenido es el mismo con cuenta llena o vacía, así que no suman una vista.
CON_DATOS = ['dashboard', 'roadmap', 'adn', 'metrics', 'numero', 'manualNegocio']

# ── EL TELÉFONO ANGOSTO ──
#
# Todo se mide a 390 píxeles de ancho, que es un iPhone de los últimos. Pero el
# cliente de esta casa está en Latinoamérica y una parte entra desde un Android,
# donde 360 es el ancho más común. Treinta píxeles menos es donde una fila de
# dos cosas deja de entrar y la pantalla empieza a arrastrarse de costado.
#
# Se garantiza a 320, que es el piso histórico de la web y lo sigue siendo en
# los Android chicos. Medido, bajando de 390 se encontraron tres cosas que ese
# ancho no mostraba: el Camino arrastrándose de costado, dos etiquetas de la
# barra de abajo cortadas y el nombre de la pantalla con puntos suspensivos.
#
# A 320 quedaba un residuo que no era de código: «Entrenadores» son doce letras
# y las cinco etiquetas pedían 334 px de los 316 que quedan. Se cerró
# acortando esa etiqueta a «Entrenar» —el mismo mecanismo de «Acompañamiento →
# Contacto»— y ahora las cinco entran con el nombre completo declarado.
#
# Van los cinco destinos de la barra de abajo, más las dos de numerales y
# textos largos. Y van CON DATOS, porque es con datos que hay algo que
# desbordar: medir Entrenadores con la cuenta llena fue lo que destapó un
# `{{consultantes}}` sin reemplazar a la vista del cliente.
ANGOSTAS = ['dashboard', 'roadmap', 'entrenadores', 'campanas', 'mensajes', 'adn', 'metrics']
ANCHO_ANGOSTO = 320

# ── EL CLIENTE QUE ESCRIBE MUCHO ──
#
# La cuenta con datos tiene textos realistas pero CORTOS: el campo se llama
# `historia_300` —trescientas palabras— y el estado de prueba le ponía
# cincuenta y cinco. El que llena el campo como la app se lo pide no es un caso
# raro: es el que usa bien la app.
#
# Acá va el mismo día 72 con cada campo en la extensión que su nombre pide, un
# nombre compuesto con dos apellidos y numerales de SIETE cifras. Las cuatro
# pantallas que muestran lo que el cliente escribió.
LARGAS = ['adn', 'manualNegocio', 'roadmap', 'creador']

ESTRICTAS = (list(PANTALLAS) + [n for n, _, _ in INTERNAS]
             + [f'{p}>dia1' for p in PRIMERAS] + [f'{p}>entrada' for p in PRIMERAS]
             + ['cierre', 'graduacion', 'cierre>lleno', 'graduacion>lleno']
             + [f'{p}>fondo' for p in ['roadmap', 'biblioteca', 'coach']]
             + [f'{p}>lleno' for p in CON_DATOS]
             + [f'{p}>angosto' for p in ANGOSTAS]
             + [f'{p}>largo' for p in LARGAS])
ADMIN_ESTRICTO = True  # el Admin llegó a cero el 16 sep
COLUMNAS = ['lateral', 'fuera', 'chica', 'tactil', 'degrade', 'brillo', 'versal', 'insignia', 'tokens', 'contraste', 'cortado', 'desborde', 'tildes', 'oroRelleno', 'serifChico', 'aplastado', 'lineaTinta', 'notaAlPie', 'iconoFlotante', 'nombreDoble', 'cifrasBajas', 'errores']
# El lente de composición informa siempre y solo falla pasado su techo.
#
#   escala       cuántos TAMAÑOS de letra distintos (la escala de la pantalla)
#   pesos        cuántos pesos sobre un MISMO tamaño. El techo es 3 —cuerpo,
#                énfasis y versalita—, que es lo que la app usa hoy y cada uno
#                hace un trabajo distinto. Con cuatro ya no hay quién lo
#                justifique: 500 y 600 son el mismo gesto. Bajarlo a 2 es una
#                decisión de sistema de diseño sobre mil usos, no un barrido,
#                y merece su propio turno con las 23 capturas al lado.
#   superficies  cuántos fondos de panel distintos
#   esquinas     cuántos radios distintos (una píldora cuenta como uno)
COMPOSICION = {'escala': 5, 'pesos': 3, 'superficies': 5, 'esquinas': 4}

# Lo plegado se abre ANTES de medir. El lente salta lo que está display:none,
# así que todo lo que vive dentro de un <details> cerrado o de un acordeón
# plegado no se medía: ahí estaban las nueve letras por debajo del piso que la
# auditoría visual encontró a mano. Se abre, se mide, y se deja como estaba.
ABRIR_PLEGADOS = r"""
() => {
  const cerrados = [];
  for (const d of document.querySelectorAll('details:not([open])')) { d.open = true; cerrados.push(d); }
  // Acordeones hechos a mano: un botón que dice que su panel está cerrado.
  for (const b of document.querySelectorAll('[aria-expanded="false"]')) {
    try { b.click(); } catch { /* algunos no son botones de verdad */ }
  }
  return cerrados.length;
}
"""

MEDIR = r"""
() => {
  const vw = window.innerWidth;
  const r = {lateral: 0, fuera: [], chica: [], tactil: [], degrade: [], brillo: [], versal: [], insignia: [], tokens: 0, contraste: [], cortado: [], desborde: [], tildes: [], oroRelleno: [], serifChico: [], aplastado: [], lineaTinta: [], notaAlPie: [], iconoFlotante: [], nombreDoble: [], cifrasBajas: [], letras: 0, superficies: 0, esquinas: 0};
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
  /*
   * Las tildes eran una lista de veinte palabras, así que medía veinte y
   * dejaba pasar el resto del castellano. Ahora son reglas de terminación:
   * en español NINGUNA palabra termina en -cion, -sion, -logia, -grafia,
   * -ismo acentuado… sin su tilde. Más los casos sueltos que no siguen regla.
   * Y la clase \b no cuenta las vocales acentuadas como letra, así que el
   * límite va escrito a mano a los dos lados.
   */
  const L = 'a-záéíóúñü';
  const SIN_TILDE = new RegExp(
    `(?<![${L}])(` +
    /*
     * Terminaciones que SIEMPRE llevan tilde en SINGULAR. En plural NO:
     * sesión → sesiones, lección → lecciones, conversación →
     * conversaciones — al sumar la sílaba pasan a llanas terminadas en -s y
     * pierden la tilde. La primera versión de esta regla incluía los
     * plurales y dio catorce faltas falsas de una.
     */
    `[${L}]{2,}(cion|sion|logia|grafia|nomia|metria)` +
    // esdrújulas y llanas frecuentes que sin tilde no existen
    `|metodo|metodos|pais|paises|linea|lineas|numero|numeros|telefono|telefonos` +
    `|analisis|practica|practicas|metrica|metricas|clinica|clinicas|medico|medicos` +
    `|rapido|rapida|facil|dificil|ultimo|ultima|proximo|proxima|unico|unica|publico|publica` +
    `|tambien|despues|ademas|aqui|alli|asi|mas|quizas|jamas|atras|detras|segun|aun` +
    `|dia|dias|mia|mio|tia|tio|via|guia|guias|energia|energias|economia|categoria` +
    `|sintoma|sintomas|higado|musculo|musculos|organico|organica` +
    // («estrategia» e «higiene» salieron: son llanas y no llevan tilde)
    `|automatico|automatica|tactica|tacticas` +
    `|arboles|carcel|facilmente|rapidamente|unicamente|practicamente` +
    `|disena|disenas|diseno|disenos|anos|senal|senales|pequeno|pequena|manana` +
    `|proposito|propositos|diagnostico|diagnosticos|articulo|articulos|pagina|paginas` +
    `)(?![${L}])`, 'i');
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
    /*
     * ─── LO APLASTADO A CERO ─────────────────────────────────────────
     *
     * `vis()` exige ancho > 0, y eso abría el peor punto ciego del medidor:
     * un texto que el layout aplastó a CERO píxeles de ancho quedaba fuera
     * de la medición entera. No se contaba como cortado, ni como chico, ni
     * como nada: el caso más grave era justo el que no se medía.
     *
     * Así estuvo el nombre de la pantalla en la barra del teléfono, en los
     * 14 destinos a la vez. El grupo de la derecha llevaba `shrink-0` y el
     * del título solo `min-w-0`, así que la derecha se quedaba con 355 de
     * los 358 píxeles útiles y el título con clientWidth 0. Las 39 vistas
     * daban cero y la barra no tenía nombre en ninguna.
     *
     * La diferencia que importa: un elemento que NO ESTÁ —display:none, un
     * acordeón plegado, un panel sin abrir— se salta y está bien. Uno que
     * tiene texto adentro y alto en pantalla pero ancho cero no está
     * ausente: está roto.
     */
    if (!escondido(el)) {
      const bb = el.getBoundingClientRect();
      const csAp = getComputedStyle(el);
      const conTexto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (conTexto && bb.height > 0 && bb.width < 1
          && csAp.visibility !== 'hidden' && csAp.display !== 'none'
          && Number(csAp.opacity) > 0.05) {
        r.aplastado.push(nombre(el));
      }
    }
    if (!vis(el) || escondido(el)) continue;
    const cs = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    const propio = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (propio) {
      if ((b.right > vw + 1 || b.left < -1) && !enScrollH(el)) r.fuera.push(nombre(el));
      const fs = parseFloat(cs.fontSize);
      const enTab = !!el.closest('nav');
      if (fs < (enTab ? 14 : 15) - 0.1) r.chica.push(`${nombre(el)} ${fs}px`);
      /*
       * ─── EL SERIF NO BAJA DE 20 ─────────────────────────────────────
       *
       * Cormorant Garamond es una Garamond de DISPLAY: su altura de x es muy
       * baja, así que a 15 píxeles lee como un sans de 12 y a 17 como uno de
       * 14. El piso de la casa es 15 y el lente lo medía por `font-size`, así
       * que daba verde con treinta y dos textos que en pantalla se leen por
       * debajo del piso.
       *
       * Peor que chico: la jerarquía quedaba al revés. En Entrenadores el
       * NOMBRE del entrenador iba en serif a 17 y su descripción en sans a
       * 15, y el nombre leía más chico que la descripción.
       *
       * Veinte es donde esta tipografía empieza a comportarse. Debajo de eso
       * el texto va en el sans, que a 15 sí se lee.
       */
      /*
       * ─── LA NOTA AL PIE QUE LA CASA NO USA ──────────────────────────
       *
       * Itálica en el SANS más opacidad baja: «esto importa menos», dicho
       * dos veces. Y la itálica de un sans geométrico ni siquiera está
       * dibujada — el navegador inclina la recta.
       *
       * Donde más dolía era en las instrucciones: «Desliza para ver las
       * láminas» al 35%, el cierre del primer día al 45%, los estados
       * vacíos al 45%. Lo único que dice cómo se usa algo, escrito con la
       * letra de lo que no hace falta leer.
       *
       * La cursiva de la casa es de la Garamond —una cita, la metáfora de
       * un cinturón, lo que el cliente se prometió— y esas van al contraste
       * pleno. Por eso el lente pide las dos cosas juntas: el sans y la
       * opacidad baja.
       */
      if (cs.fontStyle === 'italic' && !/cormorant|garamond|fraunces/i.test(cs.fontFamily)) {
        const tinta = rgba(cs.color)[3] * opacidad(el);
        if (tinta < 0.62) r.notaAlPie.push(`${nombre(el)} ${Math.round(tinta * 100)}%`);
      }
      if (/cormorant/i.test(cs.fontFamily) && fs < 19.5) {
        /*
         * MENOS LAS VERSALITAS. En caja alta no hay minúsculas, así que la
         * altura de x no interviene: lo que se lee es la altura de
         * mayúscula, y en esta Garamond a 15 px equivale a un sans a 15. La
         * versalita del libro —`.rotulo-libro`, display serif en oro a 15—
         * es una pieza de la casa, medida y con su contraste verificado en
         * los cinco paisajes. Forzarla a 20 rompe la portada para arreglar
         * algo que no está roto.
         *
         * Medido: de los 12 que el lente marcaba, 9 eran versalitas de
         * portada —los nombres de los cinco paisajes, en el Camino y en la
         * graduación— y 3 eran texto de lectura de verdad.
         */
        const enCajaAlta = cs.textTransform === 'uppercase'
          || !/[a-záéíóúñ]/.test([...el.childNodes]
              .filter(n => n.nodeType === 3).map(n => n.textContent).join(''));
        if (!enCajaAlta) r.serifChico.push(`${nombre(el)} ${Math.round(fs)}px`);
      }
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
        /*
         * Un ACRÓNIMO no lleva tilde: CLINICA es el nombre del método y se
         * escribe así a propósito. Se busca sobre el texto original y se
         * descarta lo que venga todo en mayúsculas.
         */
        const m = n.textContent.match(SIN_TILDE);
        if (m && !/[áéíóúÁÉÍÓÚ]/.test(m[0]) && m[0] !== m[0].toUpperCase()) {
          r.tildes.push(`${m[0]} · ${nombre(el)}`);
        }
      }
    }
    if ((el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button') && b.height < 43.5 && b.width > 0)
      r.tactil.push(`${nombre(el)} ${Math.round(b.height)}px`);
    /*
     * ─── EL ORO NO SE RELLENA, TAMPOCO EN UN BOTÓN ──────────────────────
     *
     * «Oro mate solo en líneas de 1px, versalitas y numerales: nunca
     * relleno.» El botón principal la rompía en cada pantalla: era el
     * rectángulo más grande y más saturado de la app. Ahora es un bloque de
     * tinta y el oro quedó en la línea.
     *
     * Se mide el color CALCULADO y no la clase, porque así fue como volvió:
     * la regla del bloque de tinta estaba escrita, y treinta y nueve líneas
     * más abajo había otras dos que lo devolvían al oro. Desde el navegador
     * eso no se puede esconder.
     */
    /*
     * ─── EL ÍCONO QUE FLOTA EN EL MEDIO ─────────────────────────────────
     *
     * Una fila con `align-items: center`, un ícono chico y un texto que
     * ocupa dos o más renglones: el ícono queda centrado respecto del
     * BLOQUE, o sea en el hueco entre el primer renglón y el segundo,
     * flotando sin alinear a nada. Alineado arriba, con el medio punto que
     * lo pone en la línea del primer renglón, la columna queda derecha.
     *
     * Apareció cinco veces en una sola pasada de capturas: las tres
     * tarjetas de la graduación, la chispa del encabezado del Mentor, los
     * círculos del punto de partida, el tilde de la tarjeta de hoy.
     *
     * Solo cuenta el ícono CHICO. Un avatar de 44 píxeles es más alto que
     * dos renglones, y ahí centrarlo es lo correcto: lo que se alinea es la
     * figura, no el texto.
     */
    if (cs.display.includes('flex') && cs.alignItems === 'center'
        && cs.flexDirection.startsWith('row')) {
      const hijos = [...el.children];
      const chico = hijos.find((h) => {
        const hb = h.getBoundingClientRect();
        return (h.tagName === 'svg' || h.tagName === 'IMG')
          && hb.height > 4 && hb.height < 28 && hb.width < 28;
      });
      const largo = hijos.find((h) => {
        const hb = h.getBoundingClientRect();
        const lh = parseFloat(getComputedStyle(h).lineHeight) || 20;
        const propio = [...h.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 12);
        return propio && hb.height > lh * 1.6;
      });
      if (chico && largo) r.iconoFlotante.push(nombre(el));
    }
    /*
     * ─── LA LÍNEA QUE SE QUEDÓ SIN COLOR ────────────────────────────────
     *
     * «Oro mate solo en líneas de 1px»: la línea es el centro del sistema.
     * La app la escribía así —`border-[var(--line, rgba(142,104,36,0.18))]`—
     * y eso NO es una clase: dentro de los corchetes un espacio literal
     * termina el nombre, así que llegaban dos clases sueltas y ninguna
     * declaraba color. El borde se quedaba en `currentColor`, que en el tema
     * claro es la tinta: casi negro. Doscientos veinticuatro bordes así.
     *
     * Se mide por el síntoma y no por la clase: un borde pintado EXACTO del
     * color del texto de su propio elemento es siempre un accidente, porque
     * nadie lo elige a propósito. Eso lo distingue de los bordes de otro
     * color que sí son a propósito —el verde de «Autónoma», el rojo de un
     * aviso—, que el lente deja pasar.
     */
    for (const lado of ['Top', 'Right', 'Bottom', 'Left']) {
      const gr = parseFloat(cs['border' + lado + 'Width']);
      if (gr > 0 && gr < 2.5) {
        const cb = cs['border' + lado + 'Color'];
        if (cb === cs.color && rgba(cb)[3] > 0.5) {
          r.lineaTinta.push(nombre(el));
          break;
        }
      }
    }
    const esBoton = el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button';
    /*
     * El piso era `width > 120`, pensado para el botón principal, el
     * rectángulo grande de la pantalla. Con eso se escapaban todos los
     * botones redondos: el de enviar del Mentor es un círculo de 44 píxeles
     * de oro macizo, con la flecha encima, y el lente lo daba por bueno en
     * las cuatro vistas del chat. El tamaño no agrega nada que el rol no
     * diga ya: la vara es «nunca relleno», y vale igual para un círculo de
     * 44 que para una barra de 300. Queda un piso mínimo para no contar
     * adornos diminutos.
     */
    /*
     * ─── Y EL ORO MACIZO FUERA DE LOS BOTONES ───────────────────────────
     *
     * Esto solo miraba CONTROLES, y «nunca relleno» no dice «nunca relleno en
     * un botón». El wizard de bienvenida —la primera pantalla que ve quien
     * acaba de pagar— tenía el candado en un cuadrado de `bg-gold` macizo, en
     * un div, y pasaba entero.
     *
     * Acá va cualquier caja con el oro casi lleno: el umbral es alto (70%)
     * porque abajo de eso es un lavado, y los lavados de estado ya se
     * discutieron y se dejaron pasar a propósito.
     */
    /*
     * El piso era 24×24 en los dos lados, y por ahí se escapó la barra de
     * progreso del wizard: diez pastillas, la activa `h-1.5 bg-gold` —oro
     * macizo de 32×6— en la primera pantalla que ve quien acaba de pagar. La
     * regla de la casa no tiene excepción de tamaño.
     *
     * ─── SE PROBÓ BAJARLO Y SE VOLVIÓ ATRÁS. QUÉ MOSTRÓ ─────────────────
     *
     * Con el lado corto en 2px encendieron ONCE vistas. Mirados, los dos
     * elementos que las encendían son:
     *   · el marcador «acá estás» del menú, `w-[3px] h-6 bg-gold`, en todas
     *     las pantallas;
     *   · la barra del banner del día 45, `h-1.5 bg-gold` sobre pista de oro
     *     al 10%, que muestra cuánto del ADN va completo.
     *
     * Los dos son oro usado como DATO, no como superficie. Y la prueba de que
     * esta casa lo aprueba está en su pantalla principal: el progreso de El
     * Camino es un anillo de arcos dorados gruesos, mucho más oro que
     * cualquiera de estos dos, y es la pieza central.
     *
     * O sea que lo que la regla ataca es el oro como superficie para parecer
     * caro —el botón principal, el cuadrado detrás de un ícono, un glow—, no
     * el oro como tinta de una medición. El piso vuelve a 24×24, que es donde
     * separa esas dos cosas. Once hallazgos que al mirarlos están bien son una
     * vara mal puesta, no once defectos.
     */
    if (!esBoton && b.width >= 24 && b.height >= 24) {
      const fo = rgba(cs.backgroundColor);
      if (fo[3] > 0.7) {
        const [rr, gg, bb] = fo;
        if (rr > 110 && rr < 235 && gg > 70 && gg < 185 && bb < 95 && rr - bb > 60) {
          /* El tamaño y la clase van en el mensaje: «DIV» a secas no alcanza
             para encontrarlo, y buscarlo a mano cuesta una corrida entera. */
          r.oroRelleno.push(`${nombre(el)} ${Math.round(b.width)}x${Math.round(b.height)} (no es botón · ${cs.backgroundColor} · ${el.className.toString().slice(0, 70)})`);
        }
      }
    }
    if (esBoton && b.width >= 24 && b.height >= 24) {
      const f = rgba(cs.backgroundColor);
      /*
       * ─── DÓNDE ESTÁ LA VARA, Y POR QUÉ NO MÁS ABAJO ─────────────────────
       *
       * Se probó en 6%, con el argumento de que «nunca relleno» no tiene
       * excepción por transparencia. Encendió CUARENTA Y CINCO controles: las
       * pestañas activas de Campañas, Métricas, el Diario, la Biblioteca y
       * Acompañamiento, y los chips de sugerencia del Mentor. Todos con oro al
       * diez o quince por ciento.
       *
       * Mirados, no son el bloque de oro que la regla rechaza: son una marca
       * de ESTADO —«acá estás»— en un lavado cálido que sobre papel crema se
       * lee como papel, no como oro macizo. Lo que la regla ataca es el oro
       * usado como superficie para parecer caro, que fue el botón principal.
       *
       * Así que la vara no baja hasta ahí: cuarenta y cinco hallazgos que al
       * mirarlos están bien son una vara mal puesta, no cuarenta y cinco
       * defectos. Queda en 35%, que sigue cazando cualquier relleno que se
       * acerque al oro macizo y deja pasar el lavado de estado. Entre 15% y
       * 50% hoy no hay nada, así que esto no afloja nada de lo que ya estaba.
       *
       * LO QUE SÍ QUEDA ABIERTO, y es decisión de la casa: la barra de abajo
       * tiene escrito «el activo cambia el trazo del ícono a oro y el peso de
       * la etiqueta a 700. Nada más: sin fondo, sin píldora», y todas las
       * pestañas de adentro hacen lo contrario. Una de las dos está de más.
       */
      if (f[3] > 0.35) {
        const [rr, gg, bb] = f;
        // Un oro: rojo alto, verde medio, azul bajo, y bien saturado.
        const esOro = rr > 110 && rr < 235 && gg > 70 && gg < 185 && bb < 95 && rr - bb > 60;
        if (esOro) r.oroRelleno.push(`${nombre(el)} (${cs.backgroundColor})`);
      }
    }
    if (cs.backgroundImage.includes('gradient')) {
      // Un degradé "aplanado" (todos sus colores iguales) no es un degradé.
      const tonos = (cs.backgroundImage.match(/(rgba?\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|#[0-9a-f]{3,8}|transparent)/gi) || [])
        .map(t => rgba(t).map(v => Math.round(v * 100)).join(','));
      if (new Set(tonos).size > 1) r.degrade.push(nombre(el));
    }
    const sh = cs.boxShadow + ' ' + cs.textShadow + ' ' + cs.filter;
    /*
     * ─── LO QUE SE PROBÓ PARA CAZAR EL GLOW, Y NO ENTRÓ ─────────────────
     *
     * El rango de abajo caza el oro BRILLANTE en la sombra (rojo 170 a 239).
     * Se intentaron dos ramas más y NINGUNA se pudo hacer sonar, así que no
     * van: un lente que no se puede hacer fallar da confianza falsa.
     *
     *   · El oro MATE en una sombra sin desplazamiento. No llega nunca: el
     *     tema claro impone la sombra de la casa con `!important` sobre las
     *     clases de tarjeta, así que una sombra propia no se aplica. El glow
     *     del wizard —`shadow-[0_0_20px_var(--line2, rgba(...))]`— además
     *     tenía un ESPACIO adentro de los corchetes, que en Tailwind termina
     *     la clase: llegaba al DOM cortado en `shadow-[0_0_20px_var(-` y no
     *     se pintó nunca. Quinta vez que aparece ese patrón acá.
     *
     *   · Un desenfoque grande sobre una caja con fondo de oro, por los dos
     *     globos de quinientos píxeles del wizard. Devueltos a propósito para
     *     probarlo, la rama tampoco sonó, y no se encontró por qué.
     *
     * Lo que SÍ quedó comprobado es el oro macizo fuera de los botones, que
     * era el hallazgo real de esa pantalla: se lo vio cazar el `bg-gold` del
     * cuadrado del candado.
     */
    if (/rgba?\((17[0-9]|2[0-3][0-9]), ?(1[2-5][0-9]), ?(3[0-9]|4[0-9]|5[0-9])/.test(sh) && !/none none none/.test(sh)) r.brillo.push(nombre(el));
    const txt = el.textContent.trim();
    /*
     * La insignia con número: cazaba solo el rojo, así que una pastilla ámbar
     * o verde con un contador pasaba sin que nadie la viera, aunque grita
     * igual. Ahora se mide la SATURACIÓN del fondo: cualquier color fuerte
     * detrás de un número chico es una insignia, sea del color que sea.
     */
    if (/^\d{1,3}\+?$/.test(txt) && b.width < 30 && b.height < 30) {
      const bg = rgba(cs.backgroundColor);
      if (bg[3] > 0.5) {
        const mx = Math.max(bg[0], bg[1], bg[2]), mn = Math.min(bg[0], bg[1], bg[2]);
        if (mx > 140 && mx - mn > 70) r.insignia.push(`${txt} (${cs.backgroundColor})`);
      }
    }
  }
  /*
   * ─── COMPOSICIÓN ───────────────────────────────────────────────────────
   *
   * El lente que faltaba. Los otros trece miden cosas una por una: esta letra
   * es chica, este borde es de este color. Ninguno mira la pantalla ENTERA, y
   * por eso pasaban los hallazgos que solo se ven de lejos: una sola tarjeta
   * para todos los niveles, cinco formas distintas de decir «seleccionado»,
   * veintidós de veinticuatro bloques en el mismo tamaño de letra.
   *
   * Se cuentan los lenguajes que la pantalla habla a la vez. Más de unos
   * pocos no es riqueza: es que nadie decidió.
   *
   *   letras      cuántos tamaños de letra distintos pinta
   *   esquinas    cuántos radios de esquina distintos
   *   superficies cuántos fondos de panel distintos
   *
   * Los números van al informe siempre, y solo pasan a falta cuando se
   * disparan: no es una regla con un número redondo, es una señal de que la
   * pantalla se armó por acumulación.
   */
  const comp = { letras: new Map(), esquinas: new Set(), superficies: new Map() };
  r.escala = 0; r.pesos = 0;
  for (const el of document.querySelectorAll('#root *')) {
    if (!vis(el) || escondido(el)) continue;
    const cs = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    const propio = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (propio) {
      const k = `${Math.round(parseFloat(cs.fontSize))}/${cs.fontWeight}`;
      comp.letras.set(k, (comp.letras.get(k) || 0) + 1);
    }
    // Una superficie es una caja con fondo propio y tamaño de panel.
    if (b.width > 120 && b.height > 48) {
      const f = rgba(cs.backgroundColor);
      if (f[3] > 0.02) {
        const k = f.map(v => Math.round(v * 100) / 100).join(',');
        comp.superficies.set(k, (comp.superficies.get(k) || 0) + 1);
      }
      /*
       * El radio: una píldora se escribe con un número enorme —9999px— que
       * el navegador devuelve resuelto, y daba «33554400» como si fuera un
       * radio más. Cualquier radio mayor a media caja es la misma figura: una
       * píldora. Se cuenta como una sola, que es lo que el ojo ve.
       */
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      if (rad > 0) comp.esquinas.add(rad >= Math.min(b.width, b.height) / 2 ? 'píldora' : Math.round(rad));
    }
  }
  // Un tamaño que aparece una sola vez es una excepción, no un lenguaje.
  const vivos = (m) => [...m.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]);
  /*
   * La escala y los pesos se cuentan aparte, porque son dos problemas
   * distintos. Muchos TAMAÑOS es una escala rota: el ojo no sabe qué leer
   * primero. Muchos PESOS sobre el mismo tamaño es indecisión: 500 y 600 son
   * el mismo gesto, y tener los dos no agrega jerarquía, agrega ruido. La
   * Biblioteca tenía cuatro tamaños —22, 18, 17, 15— que son una escala
   * correcta, y seis combinaciones con sus pesos, que no lo eran.
   */
  const tamanos = new Set(vivos(comp.letras).map(([k]) => k.split('/')[0]));
  const pesosPorTamano = new Map();
  for (const [k] of vivos(comp.letras)) {
    const [tam, peso] = k.split('/');
    if (!pesosPorTamano.has(tam)) pesosPorTamano.set(tam, new Set());
    pesosPorTamano.get(tam).add(peso);
  }
  r.escala = tamanos.size;
  r.pesos = Math.max(0, ...[...pesosPorTamano.values()].map((s) => s.size));
  r.letras = vivos(comp.letras).length;
  r.superficies = vivos(comp.superficies).length;
  r.esquinas = comp.esquinas.size;
  // El detalle, para poder arreglarlo: un número sin su detalle no se toca.
  r.detalleComposicion = {
    letras: vivos(comp.letras).map(([k, n]) => `${k} ×${n}`),
    superficies: vivos(comp.superficies).map(([k, n]) => `${k} ×${n}`),
    esquinas: [...comp.esquinas].sort((a, b) => String(a).localeCompare(String(b), 'es', { numeric: true })),
  };

  /*
   * ─── LA PANTALLA NO DICE SU NOMBRE DOS VECES ───────────────────────────
   *
   * Se compara el encabezado de la barra de arriba con el primer encabezado
   * del contenido. Se normaliza sacando los artículos —«El Camino» y «Camino»
   * son el mismo nombre— y se marca cuando son iguales o cuando el de abajo
   * empieza con el de arriba («Creador» y «Creador de Contenido»).
   *
   * Lo que NO marca: un contenido que abre con otra cosa. «Manual» arriba y
   * «ADN del Negocio» abajo es un nombre y un contenido, no una repetición.
   */
  /*
   * ─── LAS CIFRAS DEL SERIF, A SU ALTURA ─────────────────────────────────
   *
   * Se busca el elemento que escribe un número CON SU PROPIO TEXTO en el
   * serif de display y no pide numerales altos. No se mide el dibujo: se mira
   * la declaración, que es exacta y no depende de la fuente que alcanzó a
   * cargar.
   */
  for (const el of document.querySelectorAll('#root *')) {
    if (!vis(el) || escondido(el)) continue;
    const propio = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
    if (!/\d/.test(propio)) continue;
    const cs = getComputedStyle(el);
    if (!/cormorant|garamond|fraunces/i.test(cs.fontFamily)) continue;
    const fvn = cs.fontVariantNumeric || '';
    const ffs = cs.fontFeatureSettings || '';
    if (/lining-nums/.test(fvn) || /lnum/.test(ffs)) continue;
    r.cifrasBajas.push(`${nombre(el)} «${propio.trim().slice(0, 28)}»`);
  }
  (() => {
    const barra = document.querySelector('header h1, header h2');
    const arriba = barra ? (barra.textContent || '').trim() : '';
    if (!arriba) return;
    /*
     * Y los títulos QUE NO USAN ETIQUETA DE TÍTULO. «Mi ADN» iba como `<p>`
     * con el serif a 24 píxeles: se veía título, no lo era, y el lente lo
     * dejaba pasar — la pantalla repetía su nombre y encima no tenía ningún
     * encabezado. Cuenta como título lo que el ojo lee como título: serif de
     * display, 22 píxeles o más, con texto propio.
     */
    const pareceTitulo = (el) => {
      if (/^H[1-3]$/.test(el.tagName)) return true;
      const cs = getComputedStyle(el);
      if (!/cormorant|garamond|fraunces/i.test(cs.fontFamily)) return false;
      if (parseFloat(cs.fontSize) < 22) return false;
      return [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    };
    const encs = [...document.querySelectorAll('#root h1, #root h2, #root h3, #root p, #root span, #root div')]
      .filter(el => !el.closest('header') && !el.closest('aside') && !el.closest('nav[aria-label]'))
      .filter(pareceTitulo)
      .filter(el => { const b = el.getBoundingClientRect(); return b.width > 20 && b.height > 6 && !escondido(el); });
    if (!encs.length) return;
    const abajo = (encs[0].textContent || '').trim();
    if (!abajo) return;
    const norm = (s) => s.toLowerCase().replace(/^(el|la|mi|tu|los|las)\s+/, '').trim();
    const A = norm(arriba), B = norm(abajo);
    if (A === B || (A.length > 3 && B.startsWith(A))) r.nombreDoble.push(`«${arriba}» · «${abajo}»`);
  })();
  for (const k of ['fuera','chica','tactil','degrade','brillo','versal','insignia','contraste','cortado','desborde','tildes','oroRelleno','serifChico','aplastado','lineaTinta','notaAlPie','iconoFlotante','nombreDoble','cifrasBajas']) r[k] = [...new Set(r[k])];
  return r;
}
"""


def medir_pantalla(pag):
    """Abre lo que esté plegado, mide, y devuelve el resultado.

    El lente salta lo que está `display:none`, así que un bloque cerrado no se
    medía: ahí vivían las nueve letras por debajo del piso que la auditoría
    visual encontró a mano. Se abre primero y se mide después.
    """
    try:
        pag.evaluate(ABRIR_PLEGADOS)
        pag.wait_for_timeout(250)
    except Exception:
        pass  # si algún clic rompe, se mide igual lo que esté a la vista
    return pag.evaluate(MEDIR)


def puerto_libre():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


_LLENO = {}


def estado_lleno(largo=False):
    """La cuenta CON DATOS, derivada del seed por `scripts/estado-lleno.mts`.

    Se calcula una vez por corrida y por modo. Las claves de jornada son
    `${pilar.numero}-${meta.codigo}` y esa correspondencia vive en el seed:
    escritas a mano acá envejecen con el primer reordenamiento del camino.

    `largo=True` devuelve la misma cuenta con cada campo en la extensión que
    su propio nombre pide, el nombre compuesto y los numerales de siete
    cifras.
    """
    if largo not in _LLENO:
        cmd = ['npx', 'tsx', 'scripts/estado-lleno.mts'] + (['--largo'] if largo else [])
        salida = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        _LLENO[largo] = json.loads(salida.stdout.strip().splitlines()[-1])
    return _LLENO[largo]


def preparar(pag, pantalla, dias=20, hechas=None, antesala=None, plan='implementacion', lleno=False,
             bienvenida=False):
    """Deja la cuenta de Julia lista en la pantalla que se va a medir.

    `dias` es cuántos lleva en el programa. Con 20 la app ya tiene algo que
    mostrar; con 1 está como queda apenas paga, que es lo que ve el día que
    entra por primera vez y lo que decide si vuelve.

    `plan` es lo que compró. Con 'blanco' —los cinco días de Sanar el Dinero,
    el escalón de entrada— la mayoría del Camino está cerrada, y lo que el
    cliente ve son las puertas: esa es la pantalla que le vende el paso
    siguiente, así que tiene que verse igual de bien que la abierta.

    `hechas` son las jornadas que ya cerró. ERA UN PARÁMETRO MUERTO: se
    declaraba en 12, se pasaba a la función del navegador, se destructuraba
    allá… y nadie lo leía. Todo lo medido hasta hoy fue la app del día uno, con
    cada contador en cero — y lo que rompe una caja es el numeral de cinco
    cifras, no el 0.

    `lleno` es el atajo a esa cuenta: setenta y un días cerrados, los campos
    del ADN escritos con los párrafos que escribe alguien de verdad, y los
    números de un mes bueno. Es el estado en que el cliente pasa la mayor
    parte del programa, y el único que muestra los textos que él mismo cargó.

    `antesala` decide en qué lado de la puerta del día 1 queda:

      None  → su antesala está cerrada y su día 1 hecho, así que la pantalla de
              Hoy dibuja el Camino. Es el estado de casi toda la app.
      {}    → recién entró y todavía no diseñó su protocolo, así que ve la
              antesala. Sin este caso la pantalla nueva no se medía nunca, y
              con él de default no se medía el Camino: hacen falta los dos.
    """
    pag.evaluate("""([pantalla, dias, hechas, antesala, plan, lleno, bienvenida]) => {
      localStorage.clear();
      const d = new Date(); d.setDate(d.getDate() - (dias - 1));
      const f = d.toISOString().slice(0, 10);
      /*
       * El plan va en el PERFIL, no solo en `tcd_plan`. Roadmap decide el
       * candado comercial con `planDe(perfil)` —el perfil que recibe como
       * prop, que en producción viene de la base con su plan real— así que
       * dejar 'DWY' fijo acá hacía que el Camino se midiera siempre abierto,
       * por más que `tcd_plan` dijera otra cosa. La primera medición del
       * escalón de entrada salió idéntica a la del programa completo por eso.
       *
       * Y va en `plan_comercial`, que es el campo que escribe el checkout:
       * `planDe` solo mira ese —«lo que pagó manda»— y de `plan` únicamente
       * entiende 'ELNUMERO'. Poniéndolo en `plan` el Camino TAMBIÉN se medía
       * abierto, porque `planDe` caía en su respaldo de 'completo'.
       */
      const perfil = {nombre: 'Julia', email: 'julia@test', especialidad: 'Psicóloga', fecha_inicio: f,
                      plan, plan_comercial: plan === 'implementacion' ? undefined : plan};
      /*
       * ─── LOS PRIMEROS DIEZ MINUTOS ───────────────────────────────────
       *
       * El wizard de bienvenida abre con `onboarding_completed === false`, y
       * esta semilla nunca escribía ese campo: quedaba `undefined`, la
       * condición daba falso y el wizard no se mostraba. O sea que la primera
       * pantalla que ve quien acaba de pagar —antes de la antesala, antes de
       * todo— no se midió nunca en sesenta y siete vistas.
       */
      if (bienvenida) perfil.onboarding_completed = false;
      if (antesala) {
        perfil.antesala = antesala;
      } else {
        perfil.antesala = { protocolo: [
          { area: 'sueno', loQueHago: 'Apago la luz a las 23:30' },
          { area: 'pantallas', loQueHago: 'El celular a la cocina a las 22:00' },
          { area: 'movimiento', loQueHago: 'Camino 25 minutos al mediodía' },
        ], cerrada: f };
      }
      localStorage.setItem('tcd_profile', JSON.stringify(perfil));
      localStorage.setItem('tcd_current_page', pantalla);
      localStorage.setItem('tcd_plan', plan);
      /*
       * ─── LA CUENTA CON DATOS ─────────────────────────────────────────
       *
       * Las jornadas cerradas viven en `tcd_hoja_ruta_v2` como un array de
       * `${pilar}-${codigo}`; el ADN, en el propio perfil; los números, en
       * `tcd_metrics_v3`. Los tres se escriben acá para que la app arranque
       * como la de alguien que lleva setenta días adentro.
       */
      if (lleno) {
        localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(lleno.hechas));
        Object.assign(perfil, lleno.adn);
        perfil.pais = lleno.pais;
        /* El nombre viene del estado: en el modo largo es un nombre compuesto
           con dos apellidos, que es como se llama buena parte de sus
           clientes, y la barra de arriba lo lleva al lado del saludo. */
        if (lleno.nombre) perfil.nombre = lleno.nombre;
        localStorage.setItem('tcd_profile', JSON.stringify(perfil));
        const semana = { semana: f, ...lleno.numeros };
        localStorage.setItem('tcd_metrics_v3', JSON.stringify([semana]));
        localStorage.setItem('tcd_diario_v3', JSON.stringify(lleno.diario));
      } else if (hechas && hechas.length) {
        /*
         * ─── LA CUENTA A MEDIO CAMINO ────────────────────────────────────
         *
         * Acá va una LISTA de claves, no un número. Antes el parámetro era
         * `hechas=12` y esta rama escribía `[]`: el comentario decía «solo
         * las primeras doce claves» y no escribía ninguna. Es el mismo
         * parámetro muerto de la cirugía 15, que quedó medio vivo — `lleno`
         * tapó el caso de la cuenta completa y este siguió sin hacer nada.
         *
         * Quien lo llama pasa las claves ya cortadas del estado del seed, que
         * es donde vive la correspondencia `${pilar}-${codigo}`.
         */
        localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(hechas));
      }
    }""", [pantalla, dias, hechas, antesala, plan, lleno, bienvenida])


# ── Conducir el wizard de bienvenida ─────────────────────────────────────────
#
# Los diez pasos no se pueden abrir de a uno: `step` es estado de React y no
# hay forma de saltar a uno sin meterle código de prueba a la app. Así que se
# recorre como el cliente —llenar, elegir, continuar—, igual que
# medir-guardado.py recorre El Camino.
#
# Lo que costó acertar, escrito para no repetirlo:
#  · El estado SIN elegir de varias preguntas trae `hover:border-gold/40`, así
#    que buscar «border-gold» para saber si un grupo ya está contestado saltaba
#    justo los grupos que había que contestar.
#  · En `situacion` el «Saltar» y el «Seguir» viven en el mismo contenedor: un
#    grupo de dos botones los confundía con opciones y la sonda tocaba Saltar,
#    saltándose el paso que vino a medir.
#  · El botón que avanza se reconoce por `btn-primary`, la convención de la
#    casa, no por su texto: `origen` lo llama «Grabar en mi ADN y seguir →».
WIZ_FIRMA = """() => {
  const h = document.querySelector('#root h1, #root h2');
  const campos = [...document.querySelectorAll('#root input, #root textarea')]
    .map((e) => e.getAttribute('placeholder') || e.type).join('|');
  return `${h ? (h.textContent || '').trim().slice(0, 44) : '(sin título)'} ~ ${campos.slice(0, 60)}`;
}"""

WIZ_LLENAR = """() => {
  const puesto = [];
  for (const el of document.querySelectorAll('#root input, #root textarea')) {
    const b = el.getBoundingClientRect();
    if (b.width < 20 || b.height < 8 || el.value) continue;
    const ph = (el.getAttribute('placeholder') || '').toLowerCase();
    let v = 'Lo que vengo construyendo hace años, con mis propias palabras y sin apuro.';
    if (el.type === 'password') v = 'clave-larga-2026';
    else if (el.type === 'number' || /^\\s*ej:\\s*\\d|cu[aá]nt|precio|hora|pacient|^\\d+$/.test(ph)) v = '12';
    else if (/email|correo/.test(ph)) v = 'julia@test';
    else if (/nombre/.test(ph)) v = 'Julia';
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    puesto.push(ph || el.type);
  }
  for (const el of document.querySelectorAll('#root select')) {
    if (el.value || el.options.length < 2) continue;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, el.options[1].value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
    puesto.push('select');
  }
  return puesto;
}"""

WIZ_SIGUE = r'continuar|siguiente|empezar|listo|entendido|vamos|comenzar|guardar|firmar|acepto|entrar'

WIZ_ELEGIR = """(reSigue) => {
  const re = new RegExp(reSigue, 'i');
  const visible = (b) => { const r = b.getBoundingClientRect(); return r.width > 30 && r.height > 18; };
  const grupos = new Map();
  for (const b of document.querySelectorAll('#root button')) {
    const cls = b.className.toString();
    if (!visible(b) || re.test(b.textContent || '')) continue;
    if (/(^| )btn-primary( |$)/.test(cls)) continue;
    if (/saltar|omitir|ahora no|m[aá]s tarde|seguir/i.test(b.textContent || '')) continue;
    const p = b.parentElement; if (!p) continue;
    if (!grupos.has(p)) grupos.set(p, []);
    grupos.get(p).push(b);
  }
  let tocados = 0;
  for (const [, bs] of grupos) {
    if (bs.length < 2) continue;
    const marca = (b) => b.className.toString().split(/\\s+/).filter((c) => !c.startsWith('hover:')).join(' ');
    if (bs.some((b) => /(^| )elegido( |$)|bg-gold\\/20|bg-amber/.test(marca(b)))) continue;
    bs[0].click(); tocados++;
  }
  return tocados;
}"""

WIZ_SEGUIR = """(reSigue) => {
  const re = new RegExp(reSigue, 'i');
  const vivos = [...document.querySelectorAll('#root button')].filter((b) => {
    const r = b.getBoundingClientRect();
    return r.width >= 40 && r.height >= 20 && !b.disabled;
  });
  const marcar = (b) => { b.dataset.ir = '1'; return (b.textContent || '').trim().slice(0, 30); };
  const casa = vivos.filter((b) => /(^| )btn-primary( |$)/.test(b.className.toString()));
  if (casa.length) return marcar(casa[casa.length - 1]);
  const porPalabra = vivos.find((b) => re.test(b.textContent || ''));
  return porPalabra ? marcar(porPalabra) : null;
}"""


def avanzar_wizard(pag):
    """Llena y toca continuar. Devuelve el texto del botón, o None si no hay."""
    pag.evaluate(WIZ_LLENAR)
    pag.evaluate(WIZ_ELEGIR, WIZ_SIGUE)
    pag.wait_for_timeout(500)
    pag.evaluate(WIZ_LLENAR)       # algunos campos aparecen recién al elegir
    pag.wait_for_timeout(300)
    boton = pag.evaluate(WIZ_SEGUIR, WIZ_SIGUE)
    if not boton:
        return None
    try:
        pag.click('[data-ir="1"]', timeout=4000)
    except Exception:
        return None
    pag.wait_for_timeout(1900)
    return boton


def main():
    # Sin esto, Python guarda la salida en memoria hasta el final cuando va a un
    # archivo, y una corrida de cuarenta y cuatro vistas tarda varios minutos en
    # mostrar la primera línea: no se puede ver si avanza o si se colgó.
    try:
        sys.stdout.reconfigure(line_buffering=True)
    except Exception:
        pass
    estricto = '--estricto' in sys.argv
    solo = [a for a in sys.argv[1:] if not a.startswith('--')]
    pantallas = [x for x in solo if x in PANTALLAS or x.startswith('admin:')] if solo else list(PANTALLAS)
    puerto = puerto_libre()
    srv = subprocess.Popen(['npx', 'vite', '--port', str(puerto), '--strictPort', '--host', '127.0.0.1'],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           env={**os.environ, 'DISABLE_HMR': 'true'},
                           start_new_session=True)  # su propio grupo: así se mata entero
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
                m = medir_pantalla(pag); m['errores'] = errores
                pag.screenshot(path=f"/tmp/app-{nombre.replace('>', '-')}.png")
                resultados[nombre] = m; pag.close()
            for tab in ([x[6:] for x in solo_admin] if solo else (ADMIN if '--admin' in sys.argv else [])):
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(f'{base}scripts/visor/admin.html?tab={tab}'); pag.wait_for_timeout(3000)
                m = medir_pantalla(pag); m['errores'] = errores
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
                m = medir_pantalla(pag)
                m['errores'] = errores
                pag.screenshot(path=f'/tmp/app-{p}.png')
                resultados[p] = m
                pag.close()
            # ── El día 1, y el escalón de entrada ──
            #
            # Todo lo de arriba se mide con veinte días de programa: la app ya
            # tiene qué mostrar. Lo que nunca se midió es lo PRIMERO que ve el
            # que acaba de pagar —el día 1, sin una sola tarea hecha, sin
            # diario, sin números— que es justo la pantalla que decide si
            # vuelve mañana. Y lo que ve quien compró el escalón de entrada,
            # que tiene casi todo el Camino cerrado: lo que esa persona mira
            # son las puertas, así que tienen que verse igual de bien.
            for nombre, dias, plan in [('dia1', 1, 'implementacion'), ('entrada', 1, 'blanco')]:
                for p in (PRIMERAS if not solo else [x for x in PRIMERAS if f'{x}>{nombre}' in solo or x in solo]):
                    pag = ctx.new_page(); errores = []
                    pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                    pag.goto(base); preparar(pag, p, dias=dias, plan=plan); pag.reload()
                    pag.wait_for_timeout(2500)
                    m = medir_pantalla(pag); m['errores'] = errores
                    pag.screenshot(path=f'/tmp/app-{p}-{nombre}.png')
                    resultados[f'{p}>{nombre}'] = m; pag.close()

            # ── LA CUENTA CON DATOS ──
            #
            # Todo lo de arriba se mide con la cuenta VACÍA: cero jornadas
            # hechas, cero piezas del ADN, cero en cada contador. El propio
            # `preparar()` declaraba `hechas=12` y nadie lo leía, así que
            # cuarenta y ocho vistas midieron siempre la app del día uno.
            #
            # Lo que solo aparece con datos: los numerales de cinco y seis
            # cifras —$1.320.000 de ingresos, 1.840 visitas— que es donde se ve
            # si la caja aguanta; los textos que el cliente escribió, que son
            # párrafos y no dos palabras; las listas de setenta jornadas
            # cerradas; las barras llenas. Esta tanda abre la cuenta en el día
            # 72, con setenta y un jornadas hechas y el ADN escrito.
            for p in (CON_DATOS if not solo
                      else [x for x in CON_DATOS if f'{x}>lleno' in solo or x in solo]):
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, p, dias=estado_lleno()['dias'],
                                         lleno=estado_lleno()); pag.reload()
                pag.wait_for_timeout(2800)
                m = medir_pantalla(pag); m['errores'] = errores
                pag.screenshot(path=f'/tmp/app-{p}-lleno.png')
                resultados[f'{p}>lleno'] = m; pag.close()

            # ── El teléfono angosto ──
            #
            # La misma cuenta con datos, en 320 de ancho. Lo que se busca acá
            # es el arrastre de costado y el texto partido: a 390 una fila de
            # tres entra justo, y setenta píxeles menos es donde deja de
            # entrar. El lente `lateral` ya existía; lo que no existía era
            # correrlo a este ancho.
            if not solo or 'angosto' in solo:
                for p in (ANGOSTAS if not solo
                          else [x for x in ANGOSTAS if f'{x}>angosto' in solo or x in solo or 'angosto' in solo]):
                    pag = ctx.new_page(); errores = []
                    pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                    pag.set_viewport_size({'width': ANCHO_ANGOSTO, 'height': 568})
                    pag.goto(base); preparar(pag, p, dias=estado_lleno()['dias'],
                                             lleno=estado_lleno()); pag.reload()
                    pag.wait_for_timeout(2800)
                    m = medir_pantalla(pag); m['errores'] = errores
                    pag.screenshot(path=f'/tmp/app-{p}-angosto.png')
                    resultados[f'{p}>angosto'] = m; pag.close()

            # ── El cliente que escribe mucho ──
            #
            # Lo que se busca es la caja que no aguanta: el párrafo que se
            # corta, el panel que se estira sobre nada, el numeral de siete
            # cifras que se parte. El ancho normal, porque el problema es el
            # contenido y no la pantalla.
            if not solo or 'largo' in solo:
                for p in (LARGAS if not solo
                          else [x for x in LARGAS if f'{x}>largo' in solo or x in solo or 'largo' in solo]):
                    pag = ctx.new_page(); errores = []
                    pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                    pag.goto(base); preparar(pag, p, dias=estado_lleno(True)['dias'],
                                             lleno=estado_lleno(True)); pag.reload()
                    pag.wait_for_timeout(2800)
                    m = medir_pantalla(pag); m['errores'] = errores
                    pag.screenshot(path=f'/tmp/app-{p}-largo.png')
                    resultados[f'{p}>largo'] = m; pag.close()

            # ── El cierre del Camino ──
            #
            # La pantalla que ve quien terminó sus noventa días o se quedó sin
            # ventana: su cierre de cuentas y, debajo, los tres pases de
            # renovación. Es el momento comercial más importante del programa
            # —lo único que tiene delante, al mismo tiempo, todo lo que
            # construyó y la pregunta de qué hace con eso— y no se había
            # medido nunca. Estaba rota en el teléfono: el contenedor ponía el
            # cierre y los pases en FILA, así que a 390 píxeles cada uno tenía
            # medio ancho, el texto salía en columnas de tres palabras y los
            # precios se cortaban por la derecha.
            if not solo or 'cierre' in solo:
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, 'roadmap', dias=100); pag.reload()
                pag.wait_for_timeout(2800)
                m = medir_pantalla(pag); m['errores'] = errores
                pag.screenshot(path='/tmp/app-cierre.png')
                resultados['cierre'] = m; pag.close()

            # ── Y el cierre de quien SÍ terminó ──
            #
            # El de arriba se mide con la cuenta vacía, y ese estado es real:
            # alguien paga, se traba y llega igual al día noventa. La app lo
            # dice de frente —«te dimos 0 de las 3 sesiones que te prometimos,
            # la garantía corre»— y eso está bien.
            #
            # Pero no es a quien se le ofrece la renovación. A esa pantalla,
            # que es la más importante del programa en lo comercial, llega
            # sobre todo quien hizo el trabajo: sus sesenta y tres jornadas,
            # su ADN completo, sus números de un mes bueno. Ahí el titular
            # «esto es lo que hiciste» tiene algo debajo.
            if not solo or 'cierre' in solo:
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, 'roadmap', dias=100, lleno=estado_lleno()); pag.reload()
                pag.wait_for_timeout(2800)
                m = medir_pantalla(pag); m['errores'] = errores
                pag.screenshot(path='/tmp/app-cierre-lleno.png')
                resultados['cierre>lleno'] = m; pag.close()

            # ── El fondo del scroll ──
            #
            # Una captura es del viewport, así que su último elemento siempre
            # se ve cortado: eso es scroll, no un corte. Lo que importa es que
            # al LLEGAR al fondo el último elemento quede completo sobre la
            # barra. Se mide una vez, en las pantallas más largas, porque es
            # un padding compartido: si falla, falla en todas.
            if not solo or 'fondo' in solo:
                for p in ['roadmap', 'biblioteca', 'coach']:
                    pag = ctx.new_page(); errores = []
                    pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                    pag.goto(base); preparar(pag, p); pag.reload(); pag.wait_for_timeout(2500)
                    pag.evaluate("() => { const m = document.querySelector('main'); if (m) m.scrollTop = m.scrollHeight; }")
                    pag.wait_for_timeout(500)
                    m = medir_pantalla(pag); m['errores'] = errores
                    pag.screenshot(path=f'/tmp/app-{p}-fondo.png')
                    resultados[f'{p}>fondo'] = m; pag.close()

            # ── La graduación ──
            #
            # El modal del día 90, que corona los noventa días. Tampoco se
            # medía: su telón era negro al 90% y su tarjeta un degradé de
            # panel a tinta —dos cosas que la casa no usa— y decía «Cinturón
            # negro» dos veces seguidas, en dos tamaños y dos tonos de oro.
            if not solo or 'graduacion' in solo:
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, 'roadmap', dias=90); pag.reload()
                pag.wait_for_timeout(3200)
                m = medir_pantalla(pag); m['errores'] = errores
                pag.screenshot(path='/tmp/app-graduacion.png')
                resultados['graduacion'] = m; pag.close()

            # ── Y la graduación de quien cerró sus cinco días ──
            #
            # Misma razón: la graduación de la semana blanca es el momento en
            # que el comprador del escalón de entrada decide si sigue. Medirla
            # vacía es medir la de quien no la vivió.
            if not solo or 'graduacion' in solo:
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, 'roadmap', dias=90, lleno=estado_lleno()); pag.reload()
                pag.wait_for_timeout(3200)
                m = medir_pantalla(pag); m['errores'] = errores
                pag.screenshot(path='/tmp/app-graduacion-lleno.png')
                resultados['graduacion>lleno'] = m; pag.close()

            # ── La bienvenida: los primeros diez minutos, los DIEZ pasos ──
            #
            # Lo primero que ve quien acaba de pagar, antes de la antesala.
            # Mucho tiempo se midió solo el primer paso —el de la contraseña—
            # porque el wizard abre ahí y los otros nueve no se pueden abrir de
            # a uno. Ahora se recorre entero, como el cliente.
            #
            # Lo que apareció recién al mirarlos: un cuadrado de oro al 10% con
            # `text-ink` que en el papel quedaba invisible, y «Coach» en la
            # lista de profesiones —prohibida en esta casa— que el detector de
            # vocabulario no veía porque solo mira frases.
            if not solo or 'bienvenida' in solo:
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, 'dashboard', dias=1, bienvenida=True); pag.reload()
                pag.wait_for_timeout(2800)
                vistos = []
                for i in range(1, 15):
                    firma = pag.evaluate(WIZ_FIRMA)
                    if firma in vistos:
                        errores.append(f'el wizard no avanzó del paso {i}: «{firma[:40]}»')
                        break
                    vistos.append(firma)
                    nombre = 'bienvenida' if i == 1 else f'bienvenida>{i}'
                    m = medir_pantalla(pag)
                    m['errores'] = errores if i == 1 else []
                    m['titulo'] = firma.split(' ~ ')[0]
                    pag.screenshot(path=f'/tmp/app-bienvenida-{i:02d}.png')
                    resultados[nombre] = m
                    if not avanzar_wizard(pag):
                        # El último paso (la guía) no tiene continuar: ahí
                        # termina el wizard. Diez pasos recorridos es correcto.
                        if i < 10:
                            errores.append(f'el wizard se cortó en el paso {i} de 10')
                        break
                pag.close()

            # ── La antesala ──
            # Es la primera pantalla que ve el cliente, antes de su día 1, y es
            # la única que se mide con la cuenta recién abierta. Va aparte
            # porque el resto de la app se mide con su antesala ya cerrada.
            if not solo or 'antesala' in solo:
                pag = ctx.new_page(); errores = []
                pag.on('pageerror', lambda e, errores=errores: errores.append(str(e)[:120]))
                pag.goto(base); preparar(pag, 'dashboard', antesala={}); pag.reload()
                pag.wait_for_timeout(2500)
                m = medir_pantalla(pag); m['errores'] = errores
                pag.screenshot(path='/tmp/app-antesala.png')
                resultados['antesala'] = m; pag.close()
            nav.close()
    finally:
        # `terminate()` le manda SIGTERM al proceso de `npx`, que es un
        # envoltorio: el vite de adentro sobrevive. Con una corrida
        # interrumpida eso deja un servidor huérfano cada vez, y al cabo de
        # unas cuantas la máquina se arrastra tanto que la siguiente corrida
        # falla por tiempo de espera — un fallo del medidor que se lee como un
        # fallo de la app. Se mata el grupo entero.
        try:
            os.killpg(os.getpgid(srv.pid), signal.SIGTERM)
        except Exception:
            srv.terminate()
        try:
            srv.wait(timeout=10)
        except Exception:
            try:
                os.killpg(os.getpgid(srv.pid), signal.SIGKILL)
            except Exception:
                srv.kill()

    ancho = max(len(p) for p in resultados)
    print('pantalla'.ljust(ancho), ' '.join(c[:7].rjust(7) for c in COLUMNAS))
    total = 0
    for p, m in resultados.items():
        vals = [m['lateral'] if c == 'lateral' else m['tokens'] if c == 'tokens' else len(m[c]) for c in COLUMNAS]
        total += sum(vals)
        print(p.ljust(ancho), ' '.join(str(v).rjust(7) for v in vals))
    # Las dos cuentas que lee auditoria.py. El total de vistas sale de acá y no
    # escrito a mano en la auditoría: estuvo a mano y se desfasó sin avisar.
    # ─── Composición: informa siempre, falla solo pasado su techo ───────────
    #
    # No es una regla con un número redondo: es una señal de que la pantalla se
    # armó por acumulación. Por eso se imprime aparte y con su techo al lado.
    print('\n── composición · cuántos lenguajes habla cada pantalla a la vez ──')
    print('pantalla'.ljust(ancho), '  escala   pesos  superf  esquin   (techo: '
          + ' '.join(f'{k} {v}' for k, v in COMPOSICION.items()) + ')')
    excedidas = []
    for p, m in resultados.items():
        vals = [m.get(k, 0) for k in COMPOSICION]
        pasa = [k for k, v in zip(COMPOSICION, vals) if v > COMPOSICION[k]]
        if pasa: excedidas.append((p, pasa))
        marca = ' ←' if pasa else ''
        print(p.ljust(ancho), ' '.join(str(v).rjust(7) for v in vals) + marca)

    print(f'\nVISTAS MEDIDAS: {len(resultados)}')
    print(f'TOTAL de faltas: {total}')
    if excedidas:
        print(f'composición excedida en {len(excedidas)}: '
              + ' · '.join(f'{p} ({", ".join(k)})' for p, k in excedidas[:6]))
    with open('/tmp/medir-app.json', 'w') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=1)
    print('detalle en /tmp/medir-app.json · capturas en /tmp/app-<pantalla>.png')

    if estricto:
        estrictas = ESTRICTAS + ([f'admin:{t}' for t in ADMIN] if ADMIN_ESTRICTO else [])
        malas = [p for p in estrictas if p in resultados and (any(
            (resultados[p][c] if c in ('lateral', 'tokens') else len(resultados[p][c])) for c in COLUMNAS)
            or any(resultados[p].get(k, 0) > v for k, v in COMPOSICION.items()))]
        if malas:
            print('✗ pantallas estrictas con faltas:', ', '.join(malas)); sys.exit(1)
        print('✓ las pantallas estrictas cumplen la especificación')


if __name__ == '__main__':
    main()
