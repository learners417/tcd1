/**
 * prueba-eneagrama.ts — el test da un tipo, y ese tipo sirve para algo.
 */
import { readFileSync } from 'node:fs';
import { TIPOS, ITEMS, RESPUESTAS, resultadoDe, desempate, tipo } from '../src/lib/eneagrama';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

console.log('\n── el test ──');
ok(TIPOS.length === 9, `${TIPOS.length} tipos`);
ok(ITEMS.length === 45, `${ITEMS.length} preguntas`);
const porTipo = TIPOS.map((t) => ITEMS.filter((i) => i.tipo === t.id).length);
ok(porTipo.every((n) => n === 5), 'cinco preguntas por tipo', porTipo.join(','));
ok(RESPUESTAS.length === 4 && !RESPUESTAS.some((r) => /medio|neutr/i.test(r.texto)), 'cuatro respuestas, sin punto medio');
const textos = ITEMS.map((i) => i.texto);
ok(new Set(textos).size === textos.length, 'ninguna pregunta repetida');
ok(textos.every((t) => t.length > 25), 'todas las preguntas dicen una situación, no una palabra');

console.log('\n── cada tipo sirve para el sistema 1 ──');
ok(TIPOS.every((t) => t.entero && t.cansado), 'cada tipo dice cómo se ve entero y cansado');
ok(TIPOS.every((t) => t.conElDinero), 'y cómo se le nota con el dinero');
ok(TIPOS.every((t) => !/perfeccionista|ayudador|investigador/i.test(t.nombre)), 'los nombres están en castellano de él, sin jerga');

console.log('\n── el resultado ──');
const soloUno: Record<number, number> = {};
ITEMS.forEach((item, i) => { soloUno[i] = item.tipo === 8 ? 3 : 0; });
ok(resultadoDe(soloUno).tipo === 8, 'quien contesta todo del ocho, sale ocho');
const empatado: Record<number, number> = {};
ITEMS.forEach((item, i) => { empatado[i] = item.tipo === 2 || item.tipo === 9 ? 3 : 0; });
const r = resultadoDe(empatado);
ok(r.empateCon !== null, 'cuando dos quedan cerca, pide desempate');
ok(desempate(r.tipo, r.empateCon!).length === 3, 'el desempate son tres elecciones');
ok(desempate(2, 9).every((p) => p.a !== p.b), 'cada elección contrasta dos frases distintas');
ok(Boolean(tipo(4)?.nombre), 'se puede pedir un tipo por su número');

console.log('\n── vive adentro de la jornada del día 3 ──');
const roadmap = readFileSync('src/pages/Roadmap.tsx', 'utf8');
ok(/TestEneagrama/.test(roadmap) && /codigoDelDia\(3\)/.test(roadmap), 'el test se abre en la jornada del día 3');
ok(/adn_eneagrama/.test(roadmap), 'y el tipo queda guardado en su ADN');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
