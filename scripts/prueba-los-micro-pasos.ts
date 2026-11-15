/**
 * LOS MICRO PASOS — que cada tarea diga por dónde se empieza.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * Cada jornada trae cuatro o cinco pasos, uno por renglón. Ese renglón dice
 * QUÉ hay que hacer y da por sabido CÓMO se arranca. Para el que se sienta a
 * trabajar con la cabeza llena, ese renglón es una pared.
 *
 * Desde el 15 de noviembre de 2026 cada paso lleva sus micro pasos: dos o
 * tres movimientos chicos, en el orden en que se hacen. Son los 530 del
 * papel que aprobó Javo (claude/checklist-90.json) y viven en
 * `tcd-spec/datos/los_micro_pasos.py`.
 *
 * ═══ QUÉ VIGILA ESTA LENTE ═══
 *
 * Los micro pasos se atan a su tarea POR POSICIÓN: micro[i] es de pasos[i].
 * Un desajuste no rompe nada y no se ve: el cliente lee el arranque de otra
 * tarea y cree que es el suyo. Esta lente es lo único que lo nota.
 *
 * Y vigila la forma, no el texto: dos o tres micro por tarea, cortos. Con
 * uno solo no es un desglose; con cinco es otra lista de tareas, que es
 * justo lo que el desglose venía a evitar.
 *
 * Correr con: npx tsx scripts/prueba-los-micro-pasos.ts
 */
import { readFileSync } from 'node:fs';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

interface Jornada {
  dia: number;
  pasos?: string[];
  micro?: string[][];
  checklist?: string[];
}
const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as {
  jornadas: Jornada[];
};

console.log('\n══ cada tarea tiene su arranque escrito ══');

const conTarea = seed.jornadas.filter((j) => (j.pasos ?? []).length > 0);
ok(conTarea.length > 0, `${conTarea.length} jornadas con tarea`);

const sinMicro = conTarea.filter((j) => !j.micro || j.micro.length === 0).map((j) => j.dia);
ok(sinMicro.length === 0, `ninguna jornada con tarea se quedó sin micro pasos${
  sinMicro.length ? ` — días ${sinMicro.join(', ')}` : ''}`);

const desalineadas = conTarea
  .filter((j) => (j.micro ?? []).length !== (j.pasos ?? []).length)
  .map((j) => `día ${j.dia}: ${(j.micro ?? []).length} micro contra ${(j.pasos ?? []).length} pasos`);
ok(desalineadas.length === 0, `micro y pasos van uno a uno${
  desalineadas.length ? ` — ${desalineadas.join('; ')}` : ''}`);

console.log('\n══ la forma: dos o tres movimientos chicos ══');

const todos = seed.jornadas.flatMap((j) => j.micro ?? []);
const sueltos = todos.filter((m) => m.length < 2 || m.length > 3).length;
ok(sueltos === 0, `las ${todos.length} tareas tienen dos o tres micro pasos${
  sueltos ? ` — ${sueltos} fuera de rango` : ''}`);

const planos = todos.flat();
/* El piso es un piso y no una igualdad: si LIBROS suma una tarea, el total
   sube y eso está bien. Lo que esta cuenta tiene que ver es una pérdida en
   masa —un archivo a medio cargar, una corrida que no ató nada—, no un
   cambio deliberado de una línea. */
ok(planos.length >= 500, `${planos.length} micro pasos cargados (el papel tiene 530)`);

const largos = planos.filter((m) => m.length > 80);
ok(largos.length === 0, `ningún micro paso pasa de 80 caracteres${
  largos.length ? ` — «${largos[0]}»` : ''}`);

const vacios = planos.filter((m) => !m.trim());
ok(vacios.length === 0, 'ningún micro paso vacío');

console.log('\n══ el campo muerto no vuelve ══');

/* `checklist` era una copia textual de `pasos` que viajaba en cada jornada y
   que no dibujaba ninguna pantalla. El tipo la declaraba, la app la llenaba
   desde `pasos` y nadie la leía: el que viniera a enganchar algo ahí iba a
   trabajar para nadie. */
const conChecklist = seed.jornadas.filter((j) => j.checklist !== undefined).length;
ok(conChecklist === 0, 'el seed ya no arrastra `checklist`, que era una copia de `pasos`');

const tipos = readFileSync('src/lib/roadmapSeed.ts', 'utf-8');
const soloCodigo = tipos.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));
ok(!/\bchecklist\b/.test(soloCodigo), 'ni el tipo de la app declara `checklist`');
ok(/micro:\s*string\[\]\[\]/.test(soloCodigo), 'el tipo declara `micro: string[][]`');

console.log(fallas === 0 ? '\n✓ los micro pasos, en su lugar' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
