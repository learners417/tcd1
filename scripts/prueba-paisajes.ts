/**
 * LOS CINCO PAISAJES — la filosofía de los libros dentro de la app.
 *
 * ═══ QUÉ SE PROTEGE ═══
 *
 * Que la app y la colección digan lo mismo. Los cinco sistemas del Camino son
 * los cinco libros de «Lo que el sur te enseña», y el cliente tiene que
 * encontrar la misma imagen en la app, en el libro, en la landing y en
 * Bariloche. Si acá los sistemas se renombran y allá no, el relato se parte.
 *
 * Y lo que ya rompió en pantalla: el texto sobre el fondo de la tapa. Los
 * colores de la colección están calculados para tinta sobre papel; en pantalla,
 * blanco sobre el ocre del viento daba 2,2 a 1. Ilegible. Por eso cada paisaje
 * tiene un `lecho` medido, y esta prueba lo verifica contra la norma.
 *
 * Correr con: npx tsx scripts/prueba-paisajes.ts
 */
import { readFileSync } from 'node:fs';
import {
  PAISAJES, paisajeDeSistema, paisajeDelDia, paisajePorId,
  COLECCION, LIBRO_MADRE, TINTA_LIBRO,
} from '../src/lib/losCincoPaisajes';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ── El contraste, calculado igual que lo hace el navegador ── */
const hex = (x: string): [number, number, number] =>
  [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)) as [number, number, number];
const lum = (c: [number, number, number]) => {
  const f = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const contraste = (a: string, b: string) => {
  const [la, lb] = [lum(hex(a)), lum(hex(b))];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

// ── 1 · Los cinco, y que coincidan con el Camino ───────────────────────────
console.log('══ los cinco sistemas son los cinco libros ══');
ok(PAISAJES.length === 5, 'son cinco');
ok(PAISAJES.every((p, i) => p.n === i + 1), 'numerados del 1 al 5, como el lomo');

const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as {
  sistemas: Array<{ n: number; nombre: string; dias: string }>;
};
for (const s of seed.sistemas) {
  const p = paisajeDeSistema(s.n);
  ok(p !== null, `el sistema ${s.n} tiene su paisaje`);
  ok(p?.sistema === s.nombre,
    `y se llama igual que en el Camino: «${s.nombre}»`);
  /*
   * ── LOS DÍAS SON DOS NÚMEROS, NO UNO (15 nov 2026) ───────────────────
   *
   * Antes la etiqueta era exactamente el rango del seed: «Días 36 a 44».
   * Pero ese rango es el de ARMAR el sistema, no el de la estación, y los
   * libros y la home usan el de la estación, que es más largo: el río se
   * vive hasta el día 84. Con un solo número, el lector abría el libro del
   * río el día 50 y no encontraba su día.
   *
   * Así que la etiqueta dice los dos, y acá se comprueba que el de armar
   * siga saliendo del seed —que es lo que esta lente vino a cuidar— y que
   * el de la estación lo contenga.
   */
  const arma = `${s.dias}`.replace('-', ' al ');
  ok(p?.dias.includes(`se arma del ${arma}`) === true,
    `con sus días de armado, sacados del Camino: «${arma}» en «${p?.dias}»`);
  const estacion = /^Días (\d+) a (\d+)/.exec(p?.dias ?? '');
  const [desdeArma, hastaArma] = s.dias.split('-').map(Number);
  ok(estacion !== null
    && Number(estacion[1]) <= desdeArma
    && Number(estacion[2]) >= hastaArma,
    `y su estación contiene a su armado: ${p?.dias}`);
}

console.log('\n══ cada uno trae lo suyo ══');
for (const p of PAISAJES) {
  ok(p.dato.length > 100,
    `${p.nombre}: el dato del paisaje es un dato, no una frase`);
  ok(p.bajada.length > 100,
    `${p.nombre}: y baja a su trabajo`);
  ok(p.ensena.split(' ').length <= 7,
    `${p.nombre}: lo que enseña entra en una línea («${p.ensena}»)`);
  ok(p.libro.startsWith('Lo que'), `${p.nombre}: su libro se llama como la colección`);
}
const todo = PAISAJES.map((p) => `${p.dato} ${p.bajada} ${p.ensena}`).join(' ');
ok(!/\bgente\b/i.test(todo), 'sin la palabra «gente»');
ok(!/\b(tenés|podés|mirás|sos|querés|hacés)\b/i.test(todo), 'y sin voseo');

// ── 2 · El contraste, que es lo que ya rompió ──────────────────────────────
console.log('\n══ el texto se lee sobre el paisaje ══');
const BLANCO = '#FFFFFF';
const ORO_PANTALLA = '#C9A86F';
for (const p of PAISAJES) {
  const cb = contraste(BLANCO, p.color.lecho);
  const co = contraste(ORO_PANTALLA, p.color.lecho);
  ok(cb >= 4.5, `${p.nombre}: el blanco da ${cb.toFixed(2)}:1`);
  ok(co >= 4.5, `${p.nombre}: y el oro ${co.toFixed(2)}:1`);
}
ok(PAISAJES.every((p) => p.color.lecho !== p.color.fondo),
  'el lecho del texto NO es el color de la tapa: los de tapa son para papel, y en pantalla el ocre del viento daba 2,2 a 1');
ok(contraste(BLANCO, PAISAJES[2].color.fondo) < 4.5,
  'y queda probado: sobre el fondo del viento sin oscurecer, el blanco no se lee');

// ── 3 · Dónde cae cada día ─────────────────────────────────────────────────
console.log('\n══ el paisaje del día ══');
ok(paisajeDelDia(1)?.id === 'lago', 'el día 1 es el lago');
ok(paisajeDelDia(6)?.id === 'lago',
  'y el día 6 también: entre dos sistemas se queda en el último, en vez de dejar un hueco sin paisaje');
ok(paisajeDelDia(10)?.id === 'montana', 'el día 10 es la montaña');
ok(paisajeDelDia(20)?.id === 'viento', 'el 20, el viento');
ok(paisajeDelDia(40)?.id === 'rio', 'el 40, el río');
ok(paisajeDelDia(90)?.id === 'bosque', 'y el 90, el bosque');
ok(paisajeDelDia(null) === null, 'sin día, no inventa uno');
ok(paisajeDeSistema(99) === null && paisajePorId('mar') === null,
  'y no devuelve nada para lo que no existe');

console.log('\n══ el encuadre ══');
ok(PAISAJES.every((p) => p.foco > 0.3 && p.foco < 0.85),
  'cada uno dice dónde está lo que no se puede perder al recortar');
ok(paisajePorId('bosque')!.foco > paisajePorId('montana')!.foco,
  'el bosque enfoca más abajo que la montaña: ahí están las raíces, y allá la cumbre');

// ── 4 · La paleta del libro ────────────────────────────────────────────────
console.log('\n══ la paleta sale del PDF de imprenta ══');
ok(TINTA_LIBRO.oro === '#A8875A', 'el oro mate de la colección');
ok(TINTA_LIBRO.papel === '#F6F1E8', 'y el crema del papel');
ok(COLECCION === 'Lo que el sur te enseña', 'la colección se llama como se llama');
ok(LIBRO_MADRE.titulo === 'Sanadores Libres',
  'y el libro madre queda aparte: es el método, la colección es lo de dentro');

// ── 5 · Está en la pantalla ────────────────────────────────────────────────
console.log('\n══ y está en el Camino ══');
const rm = codigoDe('src/pages/Roadmap.tsx');
ok(/<PortadaDeSistema/.test(rm), 'el Camino muestra la portada del sistema');
ok(/paisajeDelDia\(diaActual\)\?\.n !== fase\.fase/.test(rm),
  'entera solo en la fase donde está parado: un momento repetido cinco veces deja de ser un momento');
const po = codigoDe('src/components/PortadaDeSistema.tsx');
ok(/rotulo-libro/.test(po) && /regla-libro/.test(po) && /prosa-libro/.test(po),
  'con las marcas del libro: versalitas, la regla de 1px y la letra de lectura');
ok(/con-capitular/.test(po), 'y la capitular en oro, como la primera letra de un capítulo');
ok(/sobre-paisaje/.test(po),
  'el texto con su clase propia: el tema claro le ganaba al color y el título salía casi negro sobre el azul');

/*
 * ─── LAS TRES LETRAS, CADA UNA EN SU PAPEL ──────────────────────────
 *
 * Esta prueba decía «y es Lora» y «la interfaz sigue en Sora». Eran los
 * nombres de noviembre, no la regla. El 15 nov 2026 Javo aprobó una piel
 * común para páginas, libros, app y video, y las letras cambiaron de
 * nombre sin cambiar de papel (claude/ARQUITECTURA-COLECCION.md §10).
 *
 * La regla, que es lo que se mide acá, no se movió: hay TRES familias,
 * cada una con UN papel, y las tres viajan empaquetadas con la app.
 * Escrito así, el día que vuelvan a cambiar de nombre esta lente avisa
 * si alguna pierde su papel, en vez de ponerse roja porque cambió una
 * palabra.
 */
const css = readFileSync('src/index.css', 'utf-8');
const main = readFileSync('src/main.tsx', 'utf-8');

/** La familia declarada para un papel, tal como queda en el CSS. */
const familiaDe = (papel: string) =>
  new RegExp(`--font-${papel}:\\s*'([^']+)'`).exec(css)?.[1] ?? '';

const lectura = familiaDe('lectura');
const interfaz = familiaDe('body');
const cita = familiaDe('cita');

ok(lectura !== '', 'existe la letra de lectura');
ok(/Literata/.test(lectura), `y es la serifa de los libros (hoy ${lectura || 'ninguna'})`);
ok(/Manrope/.test(interfaz),
  `mientras la interfaz es la sans de la home (hoy ${interfaz || 'ninguna'}): botones, datos y números se leen mejor en una sans`);
ok(/Cormorant/.test(cita), `y la de citar es la Garamond (hoy ${cita || 'ninguna'})`);
ok(lectura !== interfaz && interfaz !== cita && lectura !== cita,
  'y son tres familias distintas: si dos papeles comparten letra, el papel que se pierde es el de citar');

ok(/\.prosa-libro\.con-capitular::first-letter/.test(css), 'la capitular existe');
ok(/\.accion-libro/.test(css), 'y el bloque de acción con su borde de 1px');

/* Empaquetadas, no traídas de Google: la app se abre sin conexión. */
for (const papel of [lectura, interfaz, cita]) {
  const paquete = papel.replace(/ Variable$/, '').toLowerCase().replace(/\s+/g, '-');
  ok(new RegExp(`fontsource-variable/${paquete}`).test(main), `${papel} se carga`);
}

const il = codigoDe('src/components/PaisajeIlustrado.tsx');
ok(/apaisado/.test(il) && /scale\(-1,1\)/.test(il),
  'y en el teléfono el paisaje se refleja a los lados: un dibujo vertical en una franja ancha queda abstracto');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
