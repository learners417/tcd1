/**
 * LA AUDITORÍA DE UN ANUNCIO TIENE QUE TENER SALIDA.
 *
 * ═══ EL BUG, DICHO COMO LO DIJO JAVO ═══
 *
 * «Cuando tilde los pasos para montar o activar campañas, realmente funcione.
 *  Porque ahora, como estaba en los anuncios o auditar, no me permite tildarlo:
 *  siempre me lleva a volver a hacerlo. No me queda claro cómo es la auditoría,
 *  cómo la pasan, cómo la aprueban.»
 *
 * Lo que había: una línea derivada de ocho expresiones regulares, sin ninguna
 * forma de que una persona aprobara nada, y el botón de copiar deshabilitado
 * mientras no pasara. Quien escribió su analogía con palabras que la regex no
 * conoce quedaba trabado para siempre con un anuncio que estaba bien.
 *
 * Lo que esta prueba protege de ahora en más:
 *   · que una pieza con avisos de calidad SE PUEDA aprobar a mano;
 *   · que una pieza que rompe una regla de Meta NO se pueda, ni aprobándola;
 *   · que la aprobación no sobreviva a reescribir el anuncio;
 *   · que en cada estado haya una línea que diga qué sigue.
 *
 * Correr con: npx tsx scripts/prueba-aprobar-anuncio.ts
 */
import { readFileSync } from 'node:fs';
import {
  estadoDePieza, huella, estaAprobada, aprobar, desaprobar,
  COMO_FUNCIONA_LA_AUDITORIA,
} from '../src/lib/aprobacionAnuncio';
import { auditarPieza, revisarPoliticas } from '../src/lib/formulasAnuncios';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

/** Sin los comentarios, para que las regex no cacen lo que yo mismo escribí. */
const codigoDe = (ruta: string) =>
  readFileSync(ruta, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const SIN_FALTAS = { presentes: [], faltantes: [], aprobada: true, nota: '' };
const CON_FALTAS = {
  presentes: ['HOOK'], faltantes: ['ANALOGÍA', 'PRUEBA'], aprobada: false, nota: 'Le falta',
};

// ── 1 · El callejón sin salida ─────────────────────────────────────────────
console.log('══ una pieza con avisos de calidad tiene dos salidas ══');
const trabada = estadoDePieza({
  audit: CON_FALTAS, bloqueantes: 0, alertasMeta: 0, aprobadaAMano: false });
ok(trabada.veredicto === 'con_avisos', 'queda «con avisos», no «no está lista»');
ok(trabada.puedeAprobarAMano,
  'y se puede aprobar a mano: ESTO es lo que no existía y trababa al cliente');
ok(!trabada.sePuedePublicar, 'mientras no la apruebe, todavía no se publica');
ok(trabada.queSigue.length > 20, 'y hay una línea que dice qué sigue');
ok(/agr[ée]gale|apru[eé]bala/i.test(trabada.queSigue),
  `la línea nombra las DOS salidas: "${trabada.queSigue.slice(0, 60)}…"`);

const aprobadaAMano = estadoDePieza({
  audit: CON_FALTAS, bloqueantes: 0, alertasMeta: 0, aprobadaAMano: true });
ok(aprobadaAMano.sePuedePublicar, 'aprobada a mano, se puede copiar y llevar a Meta');
ok(aprobadaAMano.veredicto === 'aprobada_a_mano',
  'y se distingue de la que pasó sola: el cartel no miente sobre quién aprobó');

// ── 2 · Lo que NO se salta, ni aprobándolo ─────────────────────────────────
console.log('\n══ la política de Meta no se aprueba ══');
for (const quien of [{ bloqueantes: 1, alertasMeta: 0 }, { bloqueantes: 0, alertasMeta: 1 }]) {
  const bloq = estadoDePieza({ audit: SIN_FALTAS, ...quien, aprobadaAMano: true });
  ok(bloq.veredicto === 'bloqueada' && !bloq.sePuedePublicar,
    `con ${quien.bloqueantes ? 'un bloqueo de política' : 'una alerta de Meta'}, no se publica NI aprobada a mano`);
  ok(!bloq.puedeAprobarAMano, 'y no se le ofrece el botón de aprobar');
}
ok(/cuenta|Meta/i.test(
  estadoDePieza({ audit: SIN_FALTAS, bloqueantes: 1, alertasMeta: 0, aprobadaAMano: false }).queSigue),
  'y se le dice por qué: lo que está en juego es su cuenta publicitaria');

console.log('\n══ la que pasa sola ══');
const limpia = estadoDePieza({
  audit: SIN_FALTAS, bloqueantes: 0, alertasMeta: 0, aprobadaAMano: false });
ok(limpia.veredicto === 'aprobada_sola' && limpia.sePuedePublicar, 'se publica sin pedir nada');
ok(!limpia.puedeAprobarAMano, 'y no se le ofrece aprobar lo que ya está aprobado');

// ── 3 · La aprobación muere con la reescritura ─────────────────────────────
console.log('\n══ aprobar una versión no aprueba las que vengan ══');
const A = 'Deja de perseguir pacientes.\nMi método de 4 pasos.';
const B = 'Deja de perseguir pacientes.\nMi método de 4 pasos, y una prueba real.';
let mapa = aprobar({}, 7, A);
ok(estaAprobada(mapa, 7, A), 'la versión aprobada queda aprobada');
ok(!estaAprobada(mapa, 7, B),
  'si edita el anuncio, la aprobación se cae sola: sin esto aprobaba una versión y publicaba otra');
ok(!estaAprobada(mapa, 8, A), 'y la aprobación de una pieza no vale para otra');
mapa = desaprobar(mapa, 7);
ok(!estaAprobada(mapa, 7, A), 'y puede deshacerla');
ok(huella(A) !== huella(B) && huella(A) === huella(` ${A} `),
  'la huella cambia con el texto y no con los espacios de los bordes');

// ── 4 · Cómo se explica ────────────────────────────────────────────────────
console.log('\n══ «no me queda claro cómo la aprueban» ══');
ok(COMO_FUNCIONA_LA_AUDITORIA.length === 3, 'son tres líneas, no un manual aparte');
const explic = COMO_FUNCIONA_LA_AUDITORIA.map((x) => `${x.titulo} ${x.texto}`).join(' ');
ok(/solo|autom/i.test(explic), 'dice qué revisa la app sola');
ok(/no se puede publicar|no lo aprueba nadie/i.test(explic), 'qué no se puede publicar');
ok(/decides tú|apru[eé]bala/i.test(explic), 'y qué decide él');
ok(/Nadie del equipo/i.test(explic),
  'y que no espera a nadie: era lo que suponía al leer «todavía no está lista»');

// ── 5 · Cableado a la pantalla ─────────────────────────────────────────────
// El patrón que ya rompió nueve veces en este repo: construido, probado, y
// nunca puesto en una pantalla.
console.log('\n══ y está en la pantalla ══');
const c = codigoDe('src/components/campanas/ConstructorAnuncios.tsx');
ok(/estadoDePieza/.test(c), 'el Constructor usa el veredicto del módulo');
ok(/aprobar\(/.test(c) && /desaprobar\(/.test(c), 'con el botón de aprobar y el de deshacer');
ok(/COMO_FUNCIONA_LA_AUDITORIA/.test(c), 'y la explicación de cómo se aprueba');
ok(!/audit\.aprobada && bloqueantes\.length === 0/.test(c),
  'y ya no queda la línea derivada que no tenía salida');
ok(/estado\.queSigue/.test(c), 'el «qué sigue» se muestra, no solo se calcula');
ok(/estado\.sePuedePublicar|listaParaPublicar = estado/.test(c),
  'y el botón de copiar mira el veredicto único');

// ── 6 · Que la auditoría real no se haya aflojado ──────────────────────────
console.log('\n══ la auditoría sigue auditando ══');
const malo = 'Curamos tu depresión en 7 días. ¿Estás deprimido?';
ok(revisarPoliticas(malo).some((x) => x.gravedad === 'bloquea'),
  'una pieza que afirma la condición del lector sigue bloqueada');
ok(!auditarPieza('Hola').aprobada, 'y una línea vacía de contenido no pasa sola');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
