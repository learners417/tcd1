/**
 * Pruebas del guardián de llamadas de IA.
 *
 * Lo que verifica y no verifica el compilador: que cada herramienta caiga en
 * el freno correcto, que las de acompañamiento NO cuesten crédito, y que un
 * olvido del front nunca cobre de más.
 *
 * Correr con: npx tsx scripts/prueba-guardian.ts
 */
import {
  frenoDe, claveTopeDe, FEATURES_CON_CREDITO, FEATURES_CON_TOPE,
  TOPES_SEMANA, TOPE_DIA_TOTAL, TOPE_TOTAL_BLANCO,
} from '../api/_lib/uso-server';
import { TECHO_MES_USD, FACTOR_DIA, type PlanComercial } from '../api/_lib/gasto-server';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

// ── 1 · Qué freno le toca a cada herramienta ───────────────────────────────
console.log('══ el freno correcto para cada herramienta ══');

const esperado: Array<[string, 'credito' | 'tope' | null]> = [
  // producción: fabrica lo que el cliente publica
  ['constructor', 'credito'],
  ['copy', 'credito'],
  ['creativo', 'credito'],
  ['stories', 'credito'],
  ['imagen', 'credito'],
  // acompañamiento: no cobra, pero tiene tope
  ['mentor', 'tope'],
  ['coach', 'tope'],
  ['agentes', 'tope'],
  ['sesion', 'tope'],
  ['campana_chat', 'tope'],
  // sin declarar: libre, no se cobra por las dudas
  ['', null],
  ['inventada', null],
];

for (const [feature, freno] of esperado) {
  const r = frenoDe(feature);
  linea(r === freno, `${(feature || '(sin declarar)').padEnd(14)} → ${r ?? 'libre'}`);
}

// ── 2 · Reglas que no se pueden romper ─────────────────────────────────────
console.log('\n══ reglas del guardián ══');

linea(frenoDe(undefined) === null && frenoDe(null) === null,
  'sin herramienta declarada no se cobra: un olvido del front nunca cobra de más');

linea(!FEATURES_CON_CREDITO.has('mentor') && !FEATURES_CON_CREDITO.has('sesion'),
  'el Mentor y los pasos del Camino NUNCA cuestan crédito');

linea(FEATURES_CON_TOPE.get('mentor') === 'mentor' && FEATURES_CON_TOPE.get('coach') === 'mentor',
  'mentor y coach cuentan contra el mismo tope (son la misma cosa con dos nombres)');

linea([...FEATURES_CON_CREDITO].every((f) => !FEATURES_CON_TOPE.has(f)),
  'ninguna herramienta cae en los dos frenos a la vez');

linea(frenoDe('MENTOR') === 'tope' && frenoDe('Constructor') === 'credito',
  'las mayúsculas no cambian el freno');

// ── 3 · Los topes son de abuso, no de racionamiento ────────────────────────
console.log('\n══ los números ══');

linea(TOPES_SEMANA.mentor >= 100,
  `el Mentor admite ${TOPES_SEMANA.mentor} consultas por semana (antes eran 10 y en el navegador)`);
linea(TOPE_DIA_TOTAL >= 200 && TOPE_DIA_TOTAL <= 1000,
  `el techo diario es ${TOPE_DIA_TOTAL}: frena bucles y scripts, no a una persona trabajando`);

// Lo que costaría un cliente que usa el Mentor a fondo toda la semana.
const COSTO_TURNO_CHAT = 0.004;   // DeepSeek, conversación corta
const semanaCompleta = TOPES_SEMANA.mentor * COSTO_TURNO_CHAT;
console.log(`  un cliente que agota el tope semanal del Mentor: $${semanaCompleta.toFixed(2)}`);
linea(semanaCompleta < 5,
  'agotar el tope entero cuesta menos que una hora de soporte humano');

linea(frenoDe('toString') === null && frenoDe('constructor') === 'credito'
   && claveTopeDe('toString') === null && claveTopeDe('valueOf') === null,
  'los nombres heredados del prototipo (toString, valueOf) no se confunden con un tope');

linea(claveTopeDe('campana_chat') === 'mentor',
  'el chat de campañas cuenta contra el tope del Mentor, no tiene bolsa aparte');

// ── 4 · El techo de gasto ──────────────────────────────────────────────────
console.log('\n══ el techo de gasto ══');

const PLANES: PlanComercial[] = ['blanco', 'amarillo', 'verde', 'negro', 'completo'];

linea(PLANES.every((p) => typeof TECHO_MES_USD[p] === 'number' && TECHO_MES_USD[p] > 0),
  'todos los planes tienen techo mensual definido');

linea(TECHO_MES_USD.blanco < TECHO_MES_USD.verde
   && TECHO_MES_USD.verde < TECHO_MES_USD.negro
   && TECHO_MES_USD.negro < TECHO_MES_USD.completo,
  'el techo crece con el plan: quien paga más puede usar más');

linea(FACTOR_DIA > 0 && FACTOR_DIA < 1,
  `el techo diario es el ${Math.round(FACTOR_DIA * 100)}% del mensual — un bucle gasta en horas, una persona en semanas`);

// Lo que el techo permite de verdad, en unidades que se entienden.
const COSTO_ANUNCIOS = 0.0495;   // "Tus 3 anuncios" completo en Sonnet
const COSTO_CHAT = 0.004;
for (const p of ['blanco', 'negro', 'completo'] as PlanComercial[]) {
  const piezas = Math.floor(TECHO_MES_USD[p] / COSTO_ANUNCIOS);
  const charlas = Math.floor(TECHO_MES_USD[p] / COSTO_CHAT);
  console.log(`  ${p.padEnd(9)} $${String(TECHO_MES_USD[p]).padStart(3)}/mes → ${piezas} tandas de anuncios o ${charlas} turnos de chat`);
}
linea(Math.floor(TECHO_MES_USD.blanco / COSTO_ANUNCIOS) > 30,
  'hasta el plan más chico permite decenas de generaciones: el techo frena bucles, no personas');

linea(TECHO_MES_USD.blanco * FACTOR_DIA >= 0.5,
  'el techo diario del plan más chico deja trabajar un día entero');

// ── 5 · El tope del plan blanco ────────────────────────────────────────────
console.log('\n══ el tope del plan blanco ══');

linea(TOPE_TOTAL_BLANCO === 30,
  'son 30 consultas en total: es lo que promete la landing del $27, no una decisión de costo');
linea(TOPE_TOTAL_BLANCO < TOPES_SEMANA.mentor,
  'el tope del plan es más estricto que el de abuso, así que manda el del plan');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
