/**
 * prueba-numeros.ts — su meta, sus cobros y sus horas, sin Excel.
 */
import { readFileSync } from 'node:fs';
import { balance, anotarHoras, lunesDe, lecturaDeLaHora, numerosVacios, guardarNumeros, leerNumeros } from '../src/lib/tusNumeros';

const mem: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem[k] ?? null,
  setItem: (k: string, v: string) => { mem[k] = v; },
  removeItem: (k: string) => { delete mem[k]; },
  clear: () => { for (const k of Object.keys(mem)) delete mem[k]; },
  key: () => null, length: 0,
} as Storage;

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const cobros = [
  { fecha: '2026-09-10', monto: 500 },
  { fecha: '2026-09-20', monto: 500 },
];

console.log('\n── el caso real que lo pidió ──');
// Cobró 500 y le quedaron 462,50: el estado se llevó 7,5.
const conIva = { ...numerosVacios(), meta: 3000, plazo: 'este trimestre', retencion: 7.5 };
const b1 = balance([{ fecha: '2026-09-10', monto: 500 }], conIva);
ok(b1.bruto === 500, 'muestra lo que entró');
ok(b1.neto === 462.5, 'y lo que le quedó, sin que ella haga la cuenta', String(b1.neto));
ok(b1.falta === 2537.5, 'cuánto le falta para su meta', String(b1.falta));
ok(b1.avance > 0 && b1.avance < 1, 'y en qué parte del camino está');

console.log('\n── la meta la pone él ──');
const sinMeta = balance(cobros, numerosVacios());
ok(sinMeta.falta === 0 && sinMeta.avance === 0, 'sin meta escrita, no inventa un número');
ok(sinMeta.neto === 1000, 'y suma igual lo cobrado');
const enPersonas = balance(cobros, { ...numerosVacios(), meta: 10000 });
ok(enPersonas.falta === 9000, 'la meta se mide en dinero, no en cantidad de personas');

console.log('\n── las horas ──');
let n = numerosVacios();
n = anotarHoras(n, lunesDe(new Date('2026-09-14T12:00:00')), 20);
n = anotarHoras(n, lunesDe(new Date('2026-09-21T12:00:00')), 15);
ok(n.horas.length === 2, 'una fila por semana');
n = anotarHoras(n, lunesDe(new Date('2026-09-21T12:00:00')), 18);
ok(n.horas.length === 2 && n.horas[1].horas === 18, 'corregir la semana no duplica la fila');
const b2 = balance(cobros, n);
ok(b2.horas === 38, 'suma las horas de todas las semanas');
ok(b2.horaReal === Math.round((1000 / 38) * 100) / 100, 'y calcula lo que gana por hora', String(b2.horaReal));
ok(/por hora/.test(lecturaDeLaHora(b2)), 'la lectura habla de su hora');
ok(/Anota las horas/.test(lecturaDeLaHora(balance(cobros, numerosVacios()))), 'sin horas cargadas, le dice qué hacer');

console.log('\n── se guarda solo ──');
guardarNumeros({ ...numerosVacios(), meta: 7000, retencion: 7.5 });
ok(leerNumeros().meta === 7000 && leerNumeros().retencion === 7.5, 'su meta queda guardada');
ok(lunesDe(new Date('2026-09-26T12:00:00')) === '2026-09-21', 'las horas se agrupan por lunes');

console.log('\n── vive adentro del Camino ──');
const roadmap = readFileSync('src/pages/Roadmap.tsx', 'utf8');
ok(/TusNumeros/.test(roadmap), 'se abre desde el Camino');
ok(/tu meta y tus cobros ›/.test(roadmap), 'con su botón propio');
ok(/onRegistrarCobro=\{\(\) => setVentaModal\(true\)\}/.test(roadmap), 'y desde ahí puede anotar un cobro');
const pantalla = readFileSync('src/components/TusNumeros.tsx', 'utf8');
ok(!/text-\[1[0-4]px\]|text-xs|text-sm/.test(pantalla), 'sin letra chica');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
