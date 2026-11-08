/**
 * LA FOTO Y LA LETRA NO COMPARTEN LLAVE
 *
 * ═══ QUÉ PASÓ ═══
 *
 * `tcd_avatar` guardaba dos cosas incompatibles: la letra del avatar —'A' o
 * 'B', si el sanador tiene método propio— y el `data:` URL de su foto de
 * perfil. Cuatro archivos escribían esa llave con criterios distintos.
 *
 * El orden normal de uso las pisaba:
 *
 *   1. el cliente sube su foto          → tcd_avatar = 'data:image/…'
 *   2. recarga y se refresca el perfil  → App.tsx escribe 'B' encima
 *   3. el Topbar pinta <img src="B">    → el ícono de imagen rota, en TODAS
 *      las pantallas, donde estaba su cara
 *
 * Y al revés: `coachPrompt` leía la llave cruda cuando la columna de la base
 * no venía, así que un base64 podía entrar como tipo de avatar. No coincide
 * con 'B', cae en la rama de principiante, y un sanador con años de práctica
 * recibe el tono de quien recién empieza.
 *
 * ═══ QUÉ MIRA ═══
 *
 * La regla: **nadie toca esas llaves por su nombre desde afuera.** Todo pasa
 * por `laFotoYLaLetra.ts`, que tiene un dueño por cosa.
 *
 * Cambiar el nombre de la llave en los cuatro archivos no habría servido: el
 * bug nació de tener cuatro escritores con criterios distintos, y eso sigue
 * igual con cualquier nombre. Lo que lo cierra es que haya un solo dueño, y lo
 * que lo mantiene cerrado es esta lente.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

function archivos(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

/** El archivo sin comentarios: la explicación del bug nombra las llaves. */
const soloCodigo = (t: string) => t
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

console.log('\n── la foto y la letra tienen cada una su llave ──');

const DUENO = 'src/lib/laFotoYLaLetra.ts';
const LLAVES = /'tcd_avatar'|"tcd_avatar"|'tcd_foto'|"tcd_foto"/;

/* ── 1 · Un solo dueño de las llaves ── */
const intrusos: string[] = [];
for (const f of archivos('src')) {
  if (f === DUENO) continue;
  const codigo = soloCodigo(readFileSync(join(raiz, f), 'utf8'));
  codigo.split('\n').forEach((l, i) => {
    if (LLAVES.test(l)) intrusos.push(`${f}:${i + 1}  ${l.trim().slice(0, 76)}`);
  });
}
if (intrusos.length) {
  mal(`${intrusos.length} lugar(es) tocan las llaves por su nombre en vez de pasar por ${DUENO}:`);
  for (const i of intrusos.slice(0, 6)) console.log(`      ${i}`);
} else {
  console.log(`  ✓ solo ${DUENO} nombra las llaves`);
}

/* ── 2 · El dueño existe y separa las dos cosas ── */
const dueno = readFileSync(join(raiz, DUENO), 'utf8');
for (const [que, re] of [
  ['leerFoto', /export function leerFoto/],
  ['guardarFoto', /export function guardarFoto/],
  ['leerLetra', /export function leerLetra/],
  ['guardarLetra', /export function guardarLetra/],
] as const) {
  if (!re.test(dueno)) mal(`${DUENO} no exporta ${que}`);
}

/* ── 3 · La letra que se guarda es una letra ──
 *
 * `guardarLetra` tiene que rechazar cualquier cosa que no sea 'A' o 'B'. Sin
 * ese filtro, el bug vuelve por donde vino: alguien le pasa el valor crudo de
 * la base y un `null` o un string raro queda guardado como si fuera la letra.
 */
if (!/letra !== 'A' && letra !== 'B'/.test(dueno)) {
  mal('guardarLetra no rechaza lo que no es A ni B');
}

/* ── 4 · La foto que se lee es una foto ──
 *
 * Y al revés: si algo dejó una letra en la llave de la foto, `leerFoto` no la
 * devuelve. Un `<img src="A">` es el ícono de imagen rota donde va su cara.
 */
if (!/startsWith\('data:'\)/.test(dueno)) {
  mal('leerFoto no comprueba que lo que devuelve sea una foto');
}

/* ── 5 · La foto vieja no se pierde ──
 *
 * Los clientes que ya subieron su foto la tienen en la llave vieja, y no hay
 * columna en la base: si no se migra, el arreglo les borra la cara. Perder la
 * foto de alguien por un arreglo nuestro es peor que el bug.
 */
if (!/function migrar/.test(dueno) || !/removeItem/.test(dueno)) {
  mal('no hay migración de la foto que vivía en la llave vieja');
}

/* ── 6 · Nadie vuelve a dar 'A' por defecto al no saber ──
 *
 * `coachPrompt` daba 'A' cuando no tenía el dato, y 'A' es «principiante».
 * Un sanador establecido al que no le llegó la columna recibía el tono de
 * quien recién empieza. No saber y suponer principiante no es lo mismo.
 */
const prompt = soloCodigo(readFileSync(join(raiz, 'src/lib/coachPrompt.ts'), 'utf8'));
if (/localStorage\.getItem\([^)]*avatar[^)]*\)\s*\?\?\s*'A'/.test(prompt)) {
  mal("coachPrompt vuelve a suponer 'A' cuando no sabe la letra");
}

console.log(fallas === 0
  ? '\n✓ la foto y la letra no se pisan\n'
  : `\n✗ ${fallas} fallo(s)\n`);
process.exit(fallas === 0 ? 0 : 1);
