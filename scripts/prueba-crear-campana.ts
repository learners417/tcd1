/**
 * CREAR UNA CAMPAÑA DESDE LA APP — la sexta prueba mía en verde que protegía
 * una decisión que el producto ya había cambiado.
 *
 * ═══ QUÉ MEDÍA, Y POR QUÉ YA NO CORRESPONDE ═══
 *
 * Esta prueba verificaba que el asistente de seis fases guardara la campaña al
 * terminar: que `saveCampana` se llamara, que `onComplete` avisara, que no se
 * perdiera lo que produjo la conversación. Y era un arreglo correcto en su
 * momento: antes se recorrían las seis fases y al cerrar la pantalla no quedaba
 * nada.
 *
 * Pero el asistente entero se fue, y por una razón que esta prueba no podía
 * ver: cuatro de sus seis fases rehacían —peor— trabajo que ya estaba hecho en
 * otra pantalla. «Copies» y «creativos» los escribe el Constructor, que además
 * los audita contra las reglas de Meta; «cliente» y «estrategia» se sellaron en
 * el Camino. Y la fase de audiencias le ofrecía intereses y públicos similares,
 * que con 30 USD al día es lo que hace que la campaña no arranque nunca.
 *
 * Así que ya no hay una campaña que guardar: la estrategia no se elige, está
 * decidida, y el montaje se verifica contra los candados en la Activación.
 *
 * Lo que esta prueba cuida de ahora en más es que eso no se deshaga: que no
 * vuelva a aparecer una segunda pantalla que escriba copies sin auditarlos ni
 * que le pregunte al cliente qué estrategia quiere.
 *
 * Correr con: npx tsx scripts/prueba-crear-campana.ts
 */
import { readFileSync, existsSync } from 'node:fs';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const asesor = codigoDe('src/components/campanas/AsesorDeMontaje.tsx');
const pagina = codigoDe('src/pages/Campanas.tsx');
const constructor = codigoDe('src/components/campanas/ConstructorAnuncios.tsx');

// ── 1 · El asistente de seis fases no volvió ───────────────────────────────
console.log('══ una sola pantalla por trabajo ══');
ok(!existsSync('src/components/campanas/NuevaCampanaChat.tsx'),
  'el asistente de seis fases no está');
ok(!/saveCampana/.test(pagina),
  'y no quedó el guardado que llamaba: la campaña ya no se arma eligiendo una estrategia');
ok(!/handleCampanaCreated/.test(pagina), 'ni su manejador huérfano');

console.log('\n══ los copies se escriben en UN solo lugar ══');
ok(/auditarPieza/.test(constructor) && /revisarPoliticas/.test(constructor),
  'en el Constructor, que los audita contra los ingredientes y contra Meta');
ok(!/genera 3 variantes de copy|Genera 3 variantes/i.test(asesor),
  'el asesor de montaje no escribe copies: los que salían de ahí no pasaban por ninguna auditoría');
ok(!/direccion creativa|Tipo de creativos/i.test(asesor),
  'ni define creativos');

console.log('\n══ y la estrategia no se le pregunta ══');
ok(!/ticket/i.test(asesor),
  'no le pregunta su ticket para recomendarle una estrategia: eso abría una campaña distinta cada vez');
ok(!/lookalike/i.test(asesor) && !/custom audience/i.test(asesor),
  'y no ofrece públicos similares ni personalizados');
ok(/LA_RECETA/.test(asesor),
  'usa la receta ya decidida');
ok(/promptDelAsesor/.test(asesor),
  'y su prompt restrictivo, que trae la receta escrita adentro');

// ── 2 · Lo que el asesor sí hace ───────────────────────────────────────────
console.log('\n══ lo que sí hace ══');
ok(/tildar\(p\.n\)/.test(asesor),
  'los pasos se tildan a mano: no depende de que la app detecte nada en lo que escribió');
ok(/localStorage\.setItem\(CLAVE/.test(asesor),
  'y el avance se guarda, que es lo único que de verdad había que persistir acá');
ok(/revisarPaises/.test(asesor),
  'revisa los países antes de gastar: mezclarlos se come el presupuesto en el más barato');

// ── 3 · Los tipos que quedaron ─────────────────────────────────────────────
console.log('\n══ los tipos ══');
const tipos = readFileSync('src/lib/campanasTypes.ts', 'utf-8');
ok(/'clientes_potenciales'/.test(tipos),
  'el objetivo de la campaña al video sigue existiendo: lo usan los candados');
ok(!/ManyChat/i.test(tipos), 'y no volvió ManyChat');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
