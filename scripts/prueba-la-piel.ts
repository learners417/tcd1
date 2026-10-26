/**
 * prueba-la-piel.ts — que la app se vea de la casa.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * El medidor da cero en 23 pantallas y es cierto, pero mide el reposo y no
 * tiene lente para nada de esto. Lo que encontró la auditoría visual:
 *
 *   · El botón del Mentor era relleno de oro macizo en las 23 pantallas, en
 *     un quinto tono escrito a mano que ninguna regla del tema alcanzaba. Y
 *     siendo lo único relleno de oro en reposo, el oro de la marca pasó a
 *     significar «chat». Encima, en el teléfono la palabra estaba oculta:
 *     quedaba una pastilla dorada con un ícono.
 *   · 288 bordes con el oro viejo escrito a mano, y las ocho reglas que los
 *     tapaban apuntaban a un color que aparecía CERO veces en el código.
 *   · Un emoji de 72 píxeles en el corazón del producto, mientras el Mentor
 *     los tiene prohibidos por escrito.
 *   · «Mi ADN» con un megáfono y «Entrenadores» con una hélice de ADN: las
 *     dos metáforas intercambiadas, por una línea que cambiaba la etiqueta y
 *     heredaba el ícono.
 *   · Nueve letras bajo el piso de 15 píxeles, escondidas dentro de bloques
 *     plegados — por eso el medidor no las veía: salta lo que está oculto.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/** Los archivos del cliente. El Admin lo ve el equipo y tiene su propia vara. */
function delCliente(dir = 'src'): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.name === 'admin' || e.name === 'Admin.tsx') continue;
    if (e.isDirectory()) out.push(...delCliente(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}
const ARCHIVOS = delCliente();

console.log('\n── el oro no se rellena ──');
/*
 * Oro mate en líneas de 1px, versalitas y numerales. Nunca relleno. La
 * excepción es el botón principal, que lleva su color de token y ya está
 * medido por contraste.
 */
const ORO_VIEJO = /rgba\(232,\s?150,\s?46/;
const conOroViejo = ARCHIVOS.filter((p) => ORO_VIEJO.test(leer(p)));
ok(
  conOroViejo.length === 0,
  conOroViejo.length === 0
    ? 'ningún borde usa el oro viejo escrito a mano'
    : `${conOroViejo.length} archivos lo usan: ${conOroViejo.slice(0, 3).join(', ')}`,
);

const topbar = leer('src/components/Topbar.tsx');
ok(
  !/background: '#6E5019'/.test(topbar),
  'el botón del Mentor no es un relleno de oro',
);
ok(
  !/hidden sm:inline">Mentor</.test(topbar),
  'y su palabra se lee también en el teléfono',
);

console.log('\n── el tema manda sobre los colores ──');
/*
 * Un oro escrito a mano es un oro que ninguna regla alcanza. Se buscan los
 * tonos de oro que NO son los cuatro del tema.
 */
const ORO_DEL_TEMA = new Set(['#b0822e', '#8e6824', '#74551c', '#a8875a', '#f3ead6']);
/*
 * Los paisajes de la tapa tienen sus propios colores —terracota, granate,
 * dorado del sol— y son del tema, no oros inventados. Su archivo queda fuera.
 */
const PALETAS_PROPIAS = /losCincoPaisajes\.ts$|teamColors\.ts$/;
/*
 * `var(--line, rgba(...))` es el patrón de toda la app: el token manda y el
 * literal es su respaldo para cuando el tema todavía no cargó. Un hex ahí
 * adentro no es un color escrito a mano — es el token diciendo su propio valor.
 */
const RESPALDO_DE_TOKEN = /var\(\s*--[a-z0-9-]+\s*,\s*#[0-9a-f]{6}/gi;
const inventados = new Map<string, string>();
for (const p of ARCHIVOS) {
  if (PALETAS_PROPIAS.test(p)) continue;
  const texto = leer(p).replace(RESPALDO_DE_TOKEN, 'var(--token');
  for (const m of texto.matchAll(/#([0-9a-f]{6})\b/gi)) {
    const hex = `#${m[1].toLowerCase()}`;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(m[1].slice(i - 1, i + 1), 16));
    // Un tono de oro: rojo alto, verde medio, azul bajo.
    const esOro = r > 100 && r < 230 && g > 70 && g < 180 && b < 90 && r - b > 60;
    if (esOro && !ORO_DEL_TEMA.has(hex)) inventados.set(hex, p);
  }
}
ok(
  inventados.size === 0,
  inventados.size === 0
    ? 'no hay oros fuera de los del tema'
    : `${[...inventados].map(([h, p]) => `${h} en ${p}`).slice(0, 4).join(' · ')}`,
);

console.log('\n── sin emojis en las pantallas del cliente ──');
/*
 * El lente que faltaba. Un emoji se dibuja con la tipografía del teléfono:
 * cambia de forma y de color en cada aparato y nunca es de la casa. La app
 * tenía uno de 72 píxeles en la sesión diaria mientras le prohibía al Mentor
 * usarlos.
 *
 * Quedan fuera los símbolos que sí son tipografía —✓ ✗ · — → ‹ ›— y el
 * archivo que define qué emoji corresponde a qué ícono.
 */
/*
 * Solo los pictogramas. El rango 2700-27BF trae ✓ ✔ ✗ ✕ ✂ ✈, que son
 * tipografía y no emoji: marcarlos daba cinco faltas falsas de una.
 */
/*
 * Y los que caen fuera de esos dos rangos. El cronómetro del Diario tenía un
 * ⏱ —U+23F1, del bloque de símbolos técnicos, donde también vive el ⌘ de
 * «⌘K» que sí es tipografía— así que del bloque entran solo los relojes. Del
 * 2700 entran los cuatro de colores, no los ✓ ✗ ✂ de al lado.
 */
const EMOJI = new RegExp(
  '[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{FE0F}' +
  '\u{231A}\u{231B}\u{23E9}-\u{23FA}' +   // relojes y controles de reproducción
  '\u{2705}\u{274C}\u{274E}\u{2757}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}' +
  ']', 'u',
);
/*
 * Lo que va al modelo no se pinta. En voz-javo.ts y coachPrompt.ts el emoji
 * aparece para prohibírselo al Mentor: borrarlo de ahí sería borrar la regla.
 */
const SIN_EMOJI_OK = /herramientas\.ts$|vocabulario\.ts$|voz-javo\.ts$|coachPrompt\.ts$/;
/*
 * Y los escritos como escape: los once grados del Camino estaban en
 * roadmapSeed.ts como `'\u{1F311}'`, que es 🌑 — el lente buscaba el carácter
 * y pasaban enteros. Se cuentan igual, porque el teléfono los dibuja igual.
 */
const EMOJI_ESCAPADO = /\\u\{1F[0-9A-F]{3}\}/i;
/*
 * Dos archivos los nombran para QUITARLOS, no para pintarlos: `camposMeta.ts`
 * los borra del titular de un anuncio, y `roadmapSeed.ts` guarda los once
 * grados del Camino, que hoy solo pinta el Admin — el cliente ve el nombre y
 * la metáfora, desde que el modal del pilar dejó de mostrar el emoji a 36px.
 */
const EMOJI_ESCAPADO_OK = /camposMeta\.ts$|roadmapSeed\.ts$/;
const conEmoji: string[] = [];
for (const p of ARCHIVOS) {
  if (SIN_EMOJI_OK.test(p)) continue;
  const t = leer(p).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  const m = t.match(EMOJI) ?? (EMOJI_ESCAPADO_OK.test(p) ? null : t.match(EMOJI_ESCAPADO));
  if (m) conEmoji.push(`${p} (${m[0]})`);
}
ok(
  conEmoji.length === 0,
  conEmoji.length === 0
    ? `las ${ARCHIVOS.length} pantallas del cliente no pintan emojis`
    : `${conEmoji.length}: ${conEmoji.slice(0, 5).join(' · ')}`,
);

console.log('\n── el oro no se degrada ni brilla ──');
/*
 * «Oro mate en líneas de 1px, versalitas y numerales: nunca relleno, nunca
 * degradé, nunca glow» — es la vara, escrita. El medidor tiene lente de
 * degradé y de brillo, pero mide el COLOR calculado en reposo y un
 * `bg-gradient-to-b from-gold/[0.07]` sobre el panel le da un color plano:
 * pasaba sin que nadie lo viera.
 */
const DEGRADE_DE_ORO = /(?:bg-gradient|linear-gradient|radial-gradient)[^"'`;]*(?:gold|oro|B0822E|8E6824|74551C)/i;
const RESPLANDOR_DE_ORO = /(?:drop-)?shadow-\[[^\]]*(?:gold|B0822E|8E6824)/i;
const conDegrade: string[] = [];
for (const p of ARCHIVOS) {
  const t = leer(p);
  if (DEGRADE_DE_ORO.test(t)) conDegrade.push(`${p} (degradé)`);
  if (RESPLANDOR_DE_ORO.test(t)) conDegrade.push(`${p} (resplandor)`);
}
ok(
  conDegrade.length === 0,
  conDegrade.length === 0
    ? 'ninguna pantalla degrada el oro ni le pone resplandor'
    : conDegrade.slice(0, 4).join(' · '),
);

console.log('\n── la letra no baja del piso ──');
const chicas: string[] = [];
for (const p of ARCHIVOS) {
  for (const m of leer(p).matchAll(/text-\[(\d{1,2})px\]/g)) {
    if (Number(m[1]) < 15) chicas.push(`${p}:${m[1]}px`);
  }
}
ok(
  chicas.length === 0,
  chicas.length === 0
    ? 'ninguna letra escrita a mano baja de 15 píxeles'
    : `${chicas.slice(0, 5).join(' · ')}`,
);

console.log('\n── cada ícono dice lo suyo ──');
const barra = leer('src/components/BottomTabBar.tsx');
ok(
  /icon: cuarto\.icono/.test(barra),
  'el cuarto destino cambia de ícono junto con su nombre',
);
ok(
  /'entrenadores'[^\n]*icon: Dumbbell/.test(barra),
  'Entrenadores no lleva la hélice de ADN, que es de Mi ADN',
);

console.log('\n── y nada de fondo negro ──');
const negros: string[] = [];
for (const p of ARCHIVOS) {
  const t = leer(p);
  for (const m of t.matchAll(/bg-\[#(0[0-9a-f]{5})\]|background: '#(0[0-9a-f]{5})'/gi)) {
    negros.push(`${p} (#${(m[1] ?? m[2]).toLowerCase()})`);
  }
}
ok(
  negros.length === 0,
  negros.length === 0 ? 'ninguna pantalla del cliente pinta un fondo casi negro' : negros.slice(0, 4).join(' · '),
);

/*
 * ═══ NUNCA GLOW ═════════════════════════════════════════════════════════
 *
 * El bloque de arriba revisa esto mismo pero SOLO PARA EL ORO:
 * `DEGRADE_DE_ORO` exige que el degradé nombre al oro y `RESPLANDOR_DE_ORO`
 * que la sombra lo nombre. Por eso pasaron sin que nadie los viera un glow
 * VERDE de 30px y un degradé NARANJA saturado, los dos en el wizard. La regla
 * dice «nunca glow», no «nunca glow dorado».
 *
 * La regla de la casa no tiene excepción: oro mate solo en líneas de 1px,
 * versalitas y numerales — nunca relleno, nunca degradé, nunca glow. Y un glow
 * se escribe casi siempre igual: una sombra con los dos offsets en cero, o sea
 * `shadow-[0_0_Npx_…]` / `boxShadow: '0 0 Npx …'`. El medidor no lo ve: mide
 * color y tamaño, no de dónde sale la luz. Por eso va acá, leyendo el archivo.
 *
 * Lo que había cuando esta regla se escribió —los diez, uno por uno—:
 *
 *   · un cuadrado VERDE macizo de 64×64 con glow de 30px, en la pantalla de
 *     bienvenida del wizard;
 *   · un cuadrado con DEGRADÉ naranja saturado, glow de 20px y un cohete
 *     adentro, en la última pantalla del wizard;
 *   · un glow rojo de 8px en el punto de aviso del menú;
 *   · un glow verde al pasar el dedo en el botón de evidencia;
 *   · y CUATRO que no pintaban nada: `shadow-[0_0_18px_var(--line2,
 *     rgba(142,104,36,0.30))]` lleva un espacio adentro de los corchetes, y un
 *     espacio adentro de `[...]` TERMINA la clase de Tailwind. Llegaban al DOM
 *     como `shadow-[0_0_18px_var(-`. Sexta vez en este arco que ese espacio
 *     rompe algo en silencio. Salieron igual: código que no pinta nada es una
 *     pista falsa para el que lo lea mañana.
 *
 * El `shadow-2xl` de las tarjetas no entra acá: es una sombra con offset, que
 * es profundidad y no luz.
 */
const conGlow: string[] = [];
const conDegradeSaturado: string[] = [];
for (const archivo of delCliente()) {
  const limpio = leer(archivo)
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
  if (/shadow-\[0_0_|boxShadow:\s*'0 0 /.test(limpio)) conGlow.push(archivo);
  /*
   * ─── Y NUNCA DEGRADÉ, PERO CON LA VARA EN SU SITIO ──────────────────────
   *
   * Prohibir `bg-gradient` entero encendía CUATRO que al mirarlos están bien:
   * el velo negro sobre la miniatura de un adjunto —que es legibilidad, no
   * adorno—, el fondo del certificado y de la foto del día 90 —`from-[#141210]
   * to-ink`, casi el mismo tono— y un lavado al cinco por ciento en el
   * Dashboard. Todos llevan transparencia o un token de la casa.
   *
   * El que abarata es el otro: degradé entre DOS colores saturados de la
   * paleta, como el `from-amber-500 to-orange-500` que estaba en la última
   * pantalla del wizard. Esa es la vara.
   */
  if (/from-[a-z]+-\d{2,3}[^"' ]* to-[a-z]+-\d{2,3}/.test(limpio)) conDegradeSaturado.push(archivo);
}
ok(
  conGlow.length === 0,
  conGlow.length === 0
    ? 'y ninguna pantalla del cliente pinta un glow'
    : `pintan un glow: ${conGlow.slice(0, 5).join(' · ')}`,
);
ok(
  conDegradeSaturado.length === 0,
  conDegradeSaturado.length === 0
    ? 'ni un degradé entre dos colores saturados de la paleta'
    : `pintan un degradé saturado: ${conDegradeSaturado.slice(0, 5).join(' · ')}`,
);

console.log(fallas === 0 ? '\n✓ la piel es la de la casa\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
