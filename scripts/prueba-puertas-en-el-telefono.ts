/**
 * prueba-puertas-en-el-telefono.ts — que ninguna pantalla quede sin puerta.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * La app tiene quince pantallas y cinco destinos en la navegación. Esos cinco
 * están elegidos a propósito y no se discuten acá.
 *
 * Lo que faltaba era la puerta para las otras diez. Vivían en una lista
 * privada del encabezado que solo alimenta al buscador, y el buscador se
 * esconde en pantalla chica. En el teléfono —que es desde donde entra el
 * cliente— El Método, el Diario, Métricas, Mi Clínica, el Creador y Mi Número
 * no tenían ninguna forma de abrirse. La biblioteca, donde vive el libro que
 * la página de venta promete, tenía cero entradas.
 *
 * Esta prueba sostiene tres cosas:
 *
 *   1. Que toda pantalla que la app sabe mostrar tenga su puerta en la lista.
 *   2. Que lo que la lista pide para entrar sea lo mismo que pide el cambio de
 *      pantalla. Si no coinciden, el menú ofrece una puerta que al tocarla
 *      lleva a otro lado: el toque muerto que el cliente no entiende.
 *   3. Que los principales existan de verdad y no se dupliquen abajo.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DESTINOS, PRINCIPALES, otrosDestinos, destinoPorId } from '../src/lib/destinos';

const raiz = join(import.meta.dirname, '..');
const app = readFileSync(join(raiz, 'src/App.tsx'), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) { console.log(`  ✓ ${msg}`); }
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/** Las pantallas que la app sabe mostrar, leídas de App.tsx. */
const pantallas = [...app.matchAll(/currentPage === '([a-zA-Z]+)'/g)].map((m) => m[1]);
const unicas = [...new Set(pantallas)].sort();

/**
 * Las que no se ofrecen en un menú y tienen su razón:
 *   · `migracion` la abre un aviso puntual, no es un lugar al que se va.
 *   · `manualNegocio` es una ruta vieja que el cambio de pantalla redirige a
 *     Mi ADN; ofrecerla sería ofrecer el mismo destino dos veces.
 */
const SIN_PUERTA = new Set(['migracion', 'manualNegocio']);

console.log('\n── toda pantalla tiene su puerta ──');
const huerfanas = unicas.filter((p) => !SIN_PUERTA.has(p) && !destinoPorId(p));
ok(huerfanas.length === 0, `ninguna queda sin forma de abrirse (${huerfanas.join(', ') || 'ninguna'})`);
console.log(`     (${unicas.length} pantallas · ${DESTINOS.length} con puerta · ${SIN_PUERTA.size} con razón escrita)`);

console.log('\n── la puerta pide lo mismo que la pantalla ──');
/*
 * App.tsx lleva el mapa de qué pilar hace falta para cada pantalla. Si la
 * lista de destinos dijera otra cosa, el menú ofrecería una puerta que al
 * tocarla redirige al Camino sin explicación.
 */
const bloque = app.match(/const PAGINA_PILAR: Record<string, number> = \{([\s\S]*?)\};/)?.[1] ?? '';
const exigido = new Map<string, number>(
  [...bloque.matchAll(/(\w+):\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]),
);
ok(exigido.size > 0, `el mapa de la app se pudo leer (${exigido.size} pantallas con requisito)`);
for (const [pagina, pilar] of exigido) {
  const d = destinoPorId(pagina);
  if (!d) { ok(false, `${pagina} está en el mapa de la app y no en la lista de destinos`); continue; }
  ok(d.minPilar === pilar, `${d.label} pide pilar ${pilar} en los dos lados (la lista dice ${d.minPilar})`);
}

console.log('\n── y el cinturón también ──');
/*
 * El Diario y El Método se ganan terminando Sanar el Dinero, y eso vive en
 * otro punto de App.tsx, no en el mapa de pilares.
 */
const porCinturon = /\(page === '(\w+)' \|\| page === '(\w+)'\)[\s\S]{0,320}?orden < (\d)/.exec(app);
if (porCinturon) {
  const [, a, b, orden] = porCinturon;
  for (const id of [a, b]) {
    const d = destinoPorId(id);
    ok(d?.minCinturon === Number(orden),
       `${d?.label ?? id} pide cinturón ${orden} en los dos lados (la lista dice ${d?.minCinturon ?? 'ninguno'})`);
  }
} else {
  ok(false, 'el requisito de cinturón de la app se pudo leer');
}

console.log('\n── los principales no se repiten abajo ──');
for (const id of PRINCIPALES) {
  ok(Boolean(destinoPorId(id)), `«${id}» existe en la lista`);
}
const repetidos = otrosDestinos().filter((d) => PRINCIPALES.includes(d.id));
ok(repetidos.length === 0, `ninguno aparece dos veces (${repetidos.map((d) => d.id).join(', ') || 'ninguno'})`);
console.log(`     (${PRINCIPALES.length} arriba · ${otrosDestinos().length} en «todo lo demás»)`);

console.log(fallas === 0 ? '\n✓ desde el teléfono se llega a todo\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
