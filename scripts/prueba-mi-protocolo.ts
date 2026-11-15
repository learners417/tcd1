/**
 * MI PROTOCOLO — que cada lección deje su pieza, y que la pieza tenga dónde.
 *
 * ═══ QUÉ VIGILA ═══
 *
 * La pieza N es la de la lección N. Esa correspondencia no está escrita en
 * ningún lado —se deduce del número—, así que es exactamente el tipo de cosa
 * que se rompe sin que nada falle: alcanza con que LIBROS agregue una lección
 * 34 para que ese día el cliente lea algo que no deja nada escrito.
 *
 * Y vigila que los datos de la pista y del burnout no se queden sin fuente.
 * «66 días» sin decir de dónde sale es una cifra inventada en pantalla, y la
 * regla de la casa es que el dato va con su fuente y su tipo.
 *
 * Correr con: npx tsx scripts/prueba-mi-protocolo.ts
 */
import { readFileSync } from 'node:fs';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const fuente = readFileSync('src/lib/miProtocolo.ts', 'utf-8');
/* Sin comentarios: si no, un número nombrado en una explicación cuenta como
   si estuviera en el código, y la lente aprueba lo que no existe. */
const soloCodigo = fuente
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));

console.log('\n══ las 33 piezas ══');

/* Solo dentro del arreglo de piezas: las tres señales del burnout tienen la
   misma forma —numero y nombre— y contaban como piezas, así que la lente daba
   36 y se ponía roja por su propia cuenta. */
const bloquePiezas = soloCodigo.slice(
  soloCodigo.indexOf('export const PIEZAS'),
  soloCodigo.indexOf('export const PIEZA_POR_NUMERO'),
);
const numeros = [...bloquePiezas.matchAll(/\{\s*numero:\s*(\d+),\s*\n?\s*nombre:/g)].map((m) => Number(m[1]));
ok(numeros.length === 33, `${numeros.length} piezas declaradas`);
ok(new Set(numeros).size === numeros.length, 'ninguna repetida');
const faltantes = Array.from({ length: 33 }, (_, i) => i + 1).filter((n) => !numeros.includes(n));
ok(faltantes.length === 0, `numeradas del 1 al 33 sin huecos${
  faltantes.length ? ` — faltan ${faltantes.join(', ')}` : ''}`);

const sinPie = [...bloquePiezas.matchAll(/numero:\s*(\d+),\s*\n?\s*nombre:\s*'([^']*)',\s*\n?\s*pie:\s*'([^']*)'/g)]
  .filter((m) => !m[2].trim() || !m[3].trim());
ok(sinPie.length === 0, 'todas con nombre y con su línea de qué se escribe');

console.log('\n══ cada lección del lago deja su pieza ══');

interface Jornada { dia: number; leccion?: { libro: string; numero: number }[] }
const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as { jornadas: Jornada[] };
const deLasLecciones = [...new Set(
  seed.jornadas.flatMap((j) => (j.leccion ?? []).map((l) => l.numero)),
)].sort((a, b) => a - b);

ok(deLasLecciones.length > 0, `${deLasLecciones.length} lecciones cargadas hoy en el camino`);
const sinPieza = deLasLecciones.filter((n) => !numeros.includes(n));
ok(sinPieza.length === 0, `ninguna lección se lee sin dejar su pieza${
  sinPieza.length ? ` — lecciones ${sinPieza.join(', ')}` : ''}`);

console.log('\n══ la pista de 66, con su fuente ══');

ok(/export const PISTA = 66/.test(soloCodigo), 'la pista mide 66');
for (const d of [21, 44, 66]) {
  ok(new RegExp(`dia:\\s*${d},`).test(soloCodigo), `el hito ${d} está`);
}
/* Se lee el VALOR de la constante, no el archivo entero: «Lally» aparece
   también en el comentario de arriba y en el texto del hito, así que buscarlo
   en todo el archivo daba verde con la fuente ya borrada. Probado. */
const valorFuente = (soloCodigo.match(/FUENTE_DE_LA_PISTA\s*=\s*'([^']*)'/) ?? [])[1] ?? '';
ok(/\d{4}/.test(valorFuente), `la fuente del 66 nombra su año — «${valorFuente}»`);
ok(valorFuente.split(/[·,]/).length >= 3,
  'y nombra quién, dónde y qué tipo de fuente es, como pide la casa');

console.log('\n══ el tablero contra el burnout ══');

const senales = [...soloCodigo.matchAll(/\{\s*numero:\s*\d+,\s*nombre:\s*'([^']+)'\s*\}/g)].map((m) => m[1]);
ok(senales.length === 3, `${senales.length} señales (la OMS describe tres)`);
ok(/CIE-11/.test(soloCodigo), 'y dicen de dónde salen: CIE-11');
/* Que no se convierta en un diagnóstico: la app no puntúa ni etiqueta. */
ok(!/\bdiagn[óo]stic/i.test(soloCodigo), 'no diagnostica nada');

console.log('\n══ la pantalla ══');

const pantalla = readFileSync('src/components/camino/MiProtocolo.tsx', 'utf-8');
ok(/leccionesDeHoy/.test(pantalla), 'la pantalla recibe las lecciones del día');
ok(/Tu pieza de hoy|Tus piezas de hoy/.test(pantalla), 'y abre primero la pieza de hoy');
const camino = readFileSync('src/pages/Roadmap.tsx', 'utf-8');
ok(/<MiProtocolo\s/.test(camino), 'y está puesta dentro de El Camino');
ok(/leccionesDeHoy = \(m\.leccion/.test(camino),
  'las lecciones del día salen del mismo recorrido que el paso de hoy');

console.log(fallas === 0 ? '\n✓ el protocolo, en su lugar' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
