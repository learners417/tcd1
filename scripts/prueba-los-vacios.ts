/**
 * LOS VACÍOS — lo que está escrito, no se usa, y el día que se use miente.
 *
 * ═══ QUÉ VIGILA ═══
 *
 * No busca código muerto en general: hay mucho y no molesta. Busca las tres
 * cosas que están puestas para que alguien las conecte, y que conectadas
 * dirían algo falso. Son las que no fallan hoy y fallan el día que se usan.
 *
 *  1 · LOS ONCE CAPÍTULOS QUE NO EXISTEN. `libroYPacientes.ts` tiene once
 *      capítulos de Sanadores Libres que se escribieron cuando el libro no
 *      estaba cerrado. El impreso tiene otros. Hoy no llegan a ninguna
 *      pantalla del cliente; el día que alguien los conecte, el cliente abre
 *      el libro que tiene en la mano buscando un capítulo que no está.
 *
 *  2 · `paso_esencial` NO ES UN ÍNDICE. El generador lo llena con cuántos
 *      pasos tiene el día. Leerlo como «cuál es el paso esencial» da siempre
 *      el último, y el último del día 5 no es sellar el precio. El ayudante
 *      que lo leía así ya se sacó; esta lente es para que no vuelva.
 *
 *  3 · UN DÍA NO PIDE UN NÚMERO Y VALIDA OTRO. El día 8 pedía «tu lista de
 *      veinte» y su evidencia exigía sesenta filas: el cliente escribía
 *      veinte y la app le decía que faltaban cuarenta, el mismo día.
 *
 * Correr con: npx tsx scripts/prueba-los-vacios.ts
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const sinComentarios = (t: string) => t
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));

console.log('\n══ los once capítulos no llegan a ninguna pantalla ══');

/* Se recorren las pantallas del cliente de verdad, no una lista escrita a
   mano: una lista se queda vieja justo cuando aparece la pantalla nueva. */
const archivos: string[] = [];
const recorrer = (dir: string) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!/admin/i.test(e.name)) recorrer(p); }
    else if (/\.tsx?$/.test(e.name)) archivos.push(p);
  }
};
recorrer('src');
const importanLibro = archivos.filter((f) => {
  if (/libroYPacientes\.ts$/.test(f)) return false;
  if (/\/admin\/|Admin\.tsx$/.test(f)) return false;
  return /from '[^']*libroYPacientes'/.test(sinComentarios(readFileSync(f, 'utf-8')));
});
ok(importanLibro.length === 0,
  `ninguna pantalla del cliente importa los once capítulos${
    importanLibro.length ? ` — ${importanLibro.join(', ')}` : ''}`);

const libro = readFileSync('src/lib/libroYPacientes.ts', 'utf-8');
ok(/NO SON LOS DEL LIBRO/.test(libro),
  'y el archivo lo dice de entrada, para el que lo abra');

console.log('\n══ `paso_esencial` no se lee como un índice ══');

const seedTs = sinComentarios(readFileSync('src/lib/roadmapSeed.ts', 'utf-8'));
ok(!/pasos\[\s*\w+\.paso_esencial\s*-\s*1\s*\]/.test(seedTs),
  'nadie toma el paso con `pasos[paso_esencial - 1]`');
for (const f of archivos) {
  const t = sinComentarios(readFileSync(f, 'utf-8'));
  if (/paso_esencial\s*-\s*1/.test(t)) ok(false, `${f} lo vuelve a leer como índice`);
}
ok(true, 'ni en el resto de la app');

console.log('\n══ ningún día pide un número y valida otro ══');

interface Jornada { dia: number; pasos?: string[]; evidencias?: { nombre: string; valida: string }[] }
const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as { jornadas: Jornada[] };
const NUMEROS: [RegExp, string][] = [
  [/\bveinte\b/i, 'veinte'], [/\bsesenta\b/i, 'sesenta'],
  [/\bdiez\b/i, 'diez'], [/\btreinta\b/i, 'treinta'],
];
const choques: string[] = [];
for (const j of seed.jornadas) {
  const enPasos = new Set(NUMEROS.filter(([r]) => (j.pasos ?? []).some((p) => r.test(p))).map(([, n]) => n));
  if (enPasos.size === 0) continue;
  for (const e of j.evidencias ?? []) {
    const enEv = NUMEROS.filter(([r]) => r.test(e.valida) || r.test(e.nombre)).map(([, n]) => n);
    for (const n of enEv) {
      if (!enPasos.has(n)) choques.push(`día ${j.dia}: los pasos dicen ${[...enPasos].join('/')} y «${e.nombre}» pide ${n}`);
    }
  }
}
ok(choques.length === 0, `la evidencia pide lo mismo que el paso${
  choques.length ? ` — ${choques.join('; ')}` : ''}`);

console.log(fallas === 0 ? '\n✓ sin vacíos que mientan' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
