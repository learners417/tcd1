/**
 * Pruebas del montaje: que cada candado tenga a mano lo que lo resuelve.
 *
 * Lo que verifica y no verifica el compilador: que ningún candado apunte a un
 * tutorial que no existe, y que el que muestra el tutorial del píxel no
 * termine mostrando además el del DM — un cliente que sigue el paso a paso
 * equivocado pierde una tarde.
 *
 * Correr con: npx tsx scripts/prueba-montaje.ts
 */
import { readFileSync } from 'node:fs';
import { TUTORIALES, getTutorial, getTutoriales } from '../src/lib/tutorialesTecnicos';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const fuente = readFileSync('src/components/campanas/MontajeCupos.tsx', 'utf-8');

// Se leen los candados del código, no de una copia que se desincroniza.
// El título puede venir entre comillas o entre acentos invertidos: el de
// presupuesto arma su texto con la constante de los días, para que el número
// no se desincronice de la regla que lo decide.
const candados = [...fuente.matchAll(/\{ id: '([a-z]+)', titulo: ['`]([^'`]+)['`]/g)]
  .map((m) => ({ id: m[1], titulo: m[2] }));
const tutorialesUsados = [...fuente.matchAll(/tutorial: '([^']+)'/g)].map((m) => m[1]);
const sesionesUsadas = [...fuente.matchAll(/sesion: '([^']+)'/g)].map((m) => m[1]);

console.log('══ los 8 candados ══');
linea(candados.length === 8, `son ${candados.length} candados`);
linea(new Set(candados.map((c) => c.id)).size === candados.length,
  'ninguno repite id');

console.log('\n══ cada tutorial que se referencia existe ══');
for (const clave of tutorialesUsados) {
  const t = getTutorial(clave);
  linea(!!t, `${clave} → ${t ? t.titulo : 'NO EXISTE'}`);
}
linea(tutorialesUsados.length >= 3,
  `${tutorialesUsados.length} candados llevan su paso a paso técnico`);

console.log('\n══ el píxel y el DM no se mezclan ══');
linea(getTutoriales('P4.5').length === 2,
  'buscar por código devuelve los dos (por eso hace falta la clave)');
linea(getTutorial('P4.5-pixel')?.titulo.toLowerCase().includes('pixel') ?? false,
  'la clave del píxel trae el del píxel');
linea(getTutorial('P4.5-dm')?.titulo.toLowerCase().includes('dm') ?? false,
  'la clave del DM trae el del DM');
linea(fuente.includes('clave={c.tutorial}') && !fuente.includes('codigo={c.tutorial}'),
  'el montaje usa la clave exacta, no el código');

console.log('\n══ los tutoriales sirven de verdad ══');
for (const [clave, t] of Object.entries(TUTORIALES)) {
  linea(t.pasos.length >= 3,
    `${clave}: ${t.pasos.length} pasos`);
}
linea(Object.values(TUTORIALES).every((t) => t.intro.length > 40),
  'todos explican para qué sirve antes de los pasos');

console.log('\n══ los candados que no tienen herramienta, la nombran ══');
linea(sesionesUsadas.length >= 4,
  `${sesionesUsadas.length} candados nombran la sesión del Camino donde se sellan`);
linea(sesionesUsadas.every((x) => x.length > 10),
  'y la nombran completa, no con un código suelto');

// Cada candado explica qué es, no solo cómo se llama: sin el detalle, «tu
// perfil ordenado» no le dice a nadie qué tiene que hacer.
const detalles = [...fuente.matchAll(/detalle: '([^']+)'/g)].map((m) => m[1]);
linea(detalles.length === candados.length,
  `los ${candados.length} tienen su detalle escrito`);
linea(detalles.every((d) => d.length > 40),
  'y ninguno se despacha con media línea');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
