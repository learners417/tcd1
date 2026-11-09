/**
 * UN SOLO RELATO — la app cuenta el mismo camino que la landing y los libros.
 *
 * ═══ QUÉ PASÓ (9 de noviembre) ═══
 *
 * Javo preguntó si el libro, la app y las landings hablaban de lo mismo. Las
 * once landings y los ocho libros dicen: **cinco estaciones, del lago al
 * bosque; en cada una instalas un sistema y ganas una libertad.** La app decía
 * eso en las pantallas —`CANDADOS` y los cinco paisajes— y al mismo tiempo
 * seguía diciendo otra cosa en los cuatro lugares donde HABLA:
 *
 *   coachPrompt.ts        «Método CLINICA, 7 etapas, 9 cinturones»
 *   agents/voz-javo.ts    «El canon: Método CLINICA · 7 etapas»
 *   metodoComplementos.ts «90 días, 4 fases visibles, 9 cinturones»
 *   guionesVideos.ts      «El camino tiene siete etapas — se llaman CLINICA»
 *
 * O sea: el Mentor, que es con quien el cliente habla todos los días, le
 * describía una arquitectura que la app ya no tiene y que la página por la que
 * pagó nunca nombró. Y los cinturones ya eran ONCE en el seed —de 10gup a
 * 1dan— mientras el texto seguía diciendo nueve.
 *
 * Nadie lo había visto porque las dos mitades viven lejos: el relato en
 * prosa, la arquitectura en datos. Mientras nadie las compare, cada una se
 * mueve sola.
 *
 * ═══ QUÉ MIRA ═══
 *
 * Que el relato en prosa no contradiga a los datos. No pide que la prosa diga
 * algo lindo: pide que los números y los nombres que afirma sean los que el
 * seed y los candados ya tienen.
 *
 * La cadena de promesas es la parte que más vale: lo que una estación DEJA es
 * lo que abre la siguiente. Así lo publica la landing («Se abre con tres
 * ventas pagas») y así lo lee el cliente en la app. Si alguien toca un lado,
 * las dos pantallas le cuentan historias distintas.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PAISAJES, type IdPaisaje } from '../src/lib/losCincoPaisajes';
import { CANDADOS } from '../src/lib/estaciones';

const raiz = join(import.meta.dirname, '..');
let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

/**
 * El archivo sin comentarios: esta lente explica el bug nombrándolo, y los
 * archivos de la casa explican en comentarios lo que corrigieron.
 *
 * Los saltos de línea se conservan —el comentario se vacía, no se borra—
 * porque si no, cada número de línea que imprime esta lente queda corrido y
 * apunta a otra parte del archivo. Pasó en su primera corrida: señaló tres
 * lugares y los tres estaban a cientos de líneas de donde decía.
 */
const soloCodigo = (t: string) => t
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/^(\s*)\/\/.*$/gm, '$1');

function archivos(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

console.log('\n── un solo relato: la app cuenta el mismo camino ──');

/* ── 1 · La arquitectura vieja no vuelve ──
 *
 * «Método CLINICA» y «siete etapas» fueron el camino hasta que pasó a cinco
 * estaciones. No es una preferencia de redacción: son dos mapas distintos del
 * mismo producto, y el cliente compró el de la landing.
 */
const VIEJO = /M[ée]todo CLINICA|siete etapas|7 etapas|cuatro fases visibles|4 fases visibles/;

/**
 * El único lugar que PUEDE nombrar la frase vieja: la nota de regrabar.
 *
 * `POR_REGRABAR` existe para decirle a Javo qué dice mal el video que ya
 * grabó. Si la nota no puede citar la frase, no sirve: tendría que grabar de
 * nuevo adivinando qué cambió. Así que se saltean las líneas de ESE objeto, y
 * nada más —ni el archivo entero, ni un `eslint-disable` que mañana tape otra
 * cosa—. La excepción se gana sola: cuando el video se regrabe, la línea se
 * borra y acá no queda nada que saltear.
 */
function lineasExentas(archivo: string, texto: string): Set<number> {
  if (archivo !== 'src/lib/videosCargados.ts') return new Set();
  const lineas = texto.split('\n');
  const desde = lineas.findIndex((l) => /export const POR_REGRABAR/.test(l));
  if (desde < 0) return new Set();
  const exentas = new Set<number>();
  for (let i = desde; i < lineas.length; i += 1) {
    exentas.add(i);
    if (/^\};/.test(lineas[i])) break;
  }
  return exentas;
}

const reincidentes: string[] = [];
for (const f of archivos('src')) {
  const texto = readFileSync(join(raiz, f), 'utf8');
  const codigo = soloCodigo(texto);
  const exentas = lineasExentas(f, codigo);
  codigo.split('\n').forEach((l, i) => {
    if (VIEJO.test(l) && !exentas.has(i)) reincidentes.push(`${f}:${i + 1}  ${l.trim().slice(0, 80)}`);
  });
}
if (reincidentes.length) {
  mal(`${reincidentes.length} lugar(es) todavía cuentan la arquitectura vieja:`);
  for (const r of reincidentes.slice(0, 8)) console.log(`      ${r}`);
} else {
  console.log('  ✓ nadie nombra «Método CLINICA» ni «siete etapas»');
}

/* ── 2 · Los grados que la prosa afirma son los que existen ──
 *
 * El seed manda. Si mañana el camino gana o pierde un grado, la frase que
 * dice «once grados» queda mintiendo, y esta lente se pone roja antes de que
 * el Mentor se lo diga a nadie.
 */
const tipos = readFileSync(join(raiz, 'src/lib/roadmapSeed.ts'), 'utf8');
const bloque = /export type CinturonId =([\s\S]*?);/.exec(tipos)?.[1] ?? '';
const grados = new Set(bloque.match(/'(\d+(?:gup|dan))'/g) ?? []);
const NUMEROS: Record<string, number> = {
  cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
};
if (grados.size === 0) {
  mal('no se pudo leer CinturonId: sin eso no hay con qué comparar la prosa');
} else {
  console.log(`  ✓ el seed declara ${grados.size} grados`);
  const dichos: string[] = [];
  for (const f of archivos('src')) {
    const codigo = soloCodigo(readFileSync(join(raiz, f), 'utf8'));
    codigo.split('\n').forEach((l, i) => {
      const m = /\b(\d+|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\s+(cinturones|grados)\b/i.exec(l);
      if (!m) return;
      const n = NUMEROS[m[1].toLowerCase()] ?? Number(m[1]);
      if (n !== grados.size) dichos.push(`${f}:${i + 1}  dice «${m[0]}» y son ${grados.size}`);
    });
  }
  if (dichos.length) {
    mal(`${dichos.length} lugar(es) afirman una cantidad de grados que no existe:`);
    for (const d of dichos.slice(0, 8)) console.log(`      ${d}`);
  } else {
    console.log('  ✓ ninguna frase afirma otra cantidad de grados');
  }
}

/* ── 3 · El Mentor y la voz nombran las cinco estaciones ──
 *
 * Que no esté el relato viejo no alcanza: el Mentor tiene que saber en qué
 * camino está parado. Si el canon desaparece del prompt, el Mentor improvisa
 * —y lo que improvisa no es el producto.
 */
for (const f of ['src/lib/coachPrompt.ts', 'src/lib/agents/voz-javo.ts']) {
  const t = readFileSync(join(raiz, f), 'utf8');
  if (!/cinco estaciones/.test(t)) mal(`${f} no nombra las cinco estaciones`);
  if (!/90 d[ií]as|camino de 90/.test(t)) mal(`${f} no nombra los 90 días`);
}

/* ── 4 · La cadena de promesas cierra ──
 *
 * Lo que una estación deja es lo que abre la siguiente. Es la frase que la
 * landing publica textual y la que el cliente lee en la tarjeta de su
 * jornada. Si las dos mitades se despegan, la app le promete una cosa y le
 * pide otra para avanzar.
 */
const limpio = (s: string) => s
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const orden = PAISAJES.map((p) => p.id as IdPaisaje);
for (let i = 1; i < orden.length; i += 1) {
  const previa = CANDADOS[orden[i - 1]];
  const actual = CANDADOS[orden[i]];
  if (!limpio(previa.teDeja).includes(limpio(actual.seAbreCon))) {
    mal(`${orden[i]} se abre con «${actual.seAbreCon}» y ${orden[i - 1]} deja «${previa.teDeja}»`);
  }
}
if (!CANDADOS[orden[0]].seAbreCon.trim()) {
  mal('la primera estación no dice con qué se abre');
}
console.log(`  ✓ la cadena de las ${orden.length} estaciones cierra, de ${orden[0]} a ${orden[orden.length - 1]}`);

/* ── 5 · El video que quedó viejo está marcado, y la marca se ve ──
 *
 * Corregir un guion no cambia el video ya grabado: el cliente sigue
 * escuchando lo de antes. La marca existe para eso, y sólo sirve si el
 * tablero la muestra —una tilde verde sola diría que esa jornada está lista—.
 */
const regrabar = readFileSync(join(raiz, 'src/lib/videosCargados.ts'), 'utf8');
const tablero = readFileSync(join(raiz, 'src/components/admin/TableroGrabacion.tsx'), 'utf8');
if (!/export const POR_REGRABAR/.test(regrabar)) {
  mal('videosCargados.ts no declara POR_REGRABAR');
} else if (!/POR_REGRABAR\[f\.dia\]/.test(tablero)) {
  mal('el Tablero de Grabación no muestra los que hay que regrabar');
} else {
  const { POR_REGRABAR, VIDEOS_POR_JORNADA } = await import('../src/lib/videosCargados');
  const sinVideo = Object.keys(POR_REGRABAR).filter((k) => !VIDEOS_POR_JORNADA[k]);
  if (sinVideo.length) {
    mal(`marcado para regrabar sin video cargado: ${sinVideo.join(' ')} — no hay nada que regrabar`);
  } else {
    const n = Object.keys(POR_REGRABAR).length;
    console.log(n === 0
      ? '  ✓ ningún video quedó atrás de su guion'
      : `  ✓ ${n} video(s) marcado(s) para regrabar, y el Tablero los muestra`);
  }
}

console.log(fallas === 0
  ? '\n✓ la app cuenta un solo camino\n'
  : `\n✗ ${fallas} fallo(s)\n`);
process.exit(fallas === 0 ? 0 : 1);
