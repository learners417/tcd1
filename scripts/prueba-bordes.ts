/**
 * Bordes del modelo de la cadena de valor.
 *
 * Lo que verifica esto y no verifica el compilador: que ningún número raro
 * llegue a la pantalla como NaN, Infinity o undefined, y que una carga
 * imposible se frene antes de producir un diagnóstico con cara de certeza.
 *
 * Correr con: npx tsx scripts/prueba-bordes.ts
 */
import {
  calcularCadena, encontrarDomino, proyectar, formatear, validarNumeros,
  SEMANA_VACIA, type NumerosSemana,
} from '../src/lib/valueChain';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

// ── 1 · Bordes numéricos ───────────────────────────────────────────────────
console.log('══ bordes numéricos ══');

const bordes: Array<[string, NumerosSemana]> = [
  ['todo en cero', { ...SEMANA_VACIA }],
  ['precio en cero pero con datos',
    { ...SEMANA_VACIA, gasto: 100, conversaciones: 50, agendas: 10, ventas: 1 }],
  ['gasto sin ningún resultado', { ...SEMANA_VACIA, precio: 1000, gasto: 500 }],
  ['resultados sin gasto (orgánico puro)',
    { ...SEMANA_VACIA, precio: 1000, conversaciones: 40, agendas: 15, llamadasTomadas: 10,
      ofertasPresentadas: 9, ventas: 3, facturado: 3000, cobrado: 3000 }],
  ['números gigantes',
    { ...SEMANA_VACIA, precio: 1e9, gasto: 1e9, conversaciones: 1e6, agendas: 1e5,
      llamadasTomadas: 1e4, ofertasPresentadas: 9e3, ventas: 1e3, facturado: 1e12, cobrado: 1e11 }],
  ['decimales',
    { ...SEMANA_VACIA, precio: 999.99, gasto: 33.33, conversaciones: 7, agendas: 3,
      llamadasTomadas: 2, ofertasPresentadas: 2, ventas: 1, facturado: 999.99, cobrado: 333.33 }],
];

for (const [nombre, n] of bordes) {
  const cadena = calcularCadena(n);
  const malos: string[] = [];
  for (const i of cadena) {
    if (i.valor !== null && !Number.isFinite(i.valor)) malos.push(`${i.id}=${i.valor}`);
    if (!Number.isFinite(i.brecha)) malos.push(`brecha ${i.id}`);
    if (/NaN|Infinity|undefined/.test(formatear(i.valor, i.formato))) malos.push(`texto ${i.id}`);
  }
  const d = encontrarDomino(cadena);
  if (!d.titulo) malos.push('dominó sin título');
  const p = proyectar(5, n);
  for (const [k, v] of Object.entries(p)) {
    if (typeof v === 'number' && !Number.isFinite(v)) malos.push(`proyección ${k}`);
  }
  linea(malos.length === 0,
    `${nombre}${malos.length ? ` — ${malos.slice(0, 3).join(' · ')}` : ` → ${d.titulo}`}`);
}

// ── 2 · Coherencia de la carga ─────────────────────────────────────────────
console.log('\n══ coherencia de lo cargado ══');

const cargas: Array<[string, NumerosSemana, number]> = [
  ['carga sana',
    { ...SEMANA_VACIA, precio: 1000, conversaciones: 100, agendas: 35, llamadasTomadas: 25,
      ofertasPresentadas: 21, ventas: 7, facturado: 7000, cobrado: 3500 }, 0],
  ['más agendas que conversaciones',
    { ...SEMANA_VACIA, precio: 1000, conversaciones: 5, agendas: 50 }, 1],
  ['más ventas que ofertas',
    { ...SEMANA_VACIA, precio: 1000, conversaciones: 100, agendas: 30, llamadasTomadas: 20,
      ofertasPresentadas: 5, ventas: 12 }, 1],
  ['cobró más de lo que facturó',
    { ...SEMANA_VACIA, precio: 1000, facturado: 1000, cobrado: 5000 }, 1],
  ['sin precio pero con gasto', { ...SEMANA_VACIA, gasto: 200, conversaciones: 40 }, 1],
  ['tres errores juntos',
    { ...SEMANA_VACIA, precio: 1000, conversaciones: 5, agendas: 50, llamadasTomadas: 90,
      facturado: 100, cobrado: 900 }, 3],
  ['los ceros no son error', { ...SEMANA_VACIA, precio: 1000 }, 0],
];

for (const [nombre, n, esperado] of cargas) {
  const r = validarNumeros(n);
  const ok = r.length === esperado;
  linea(ok, `${nombre} → ${r.length} aviso(s)${ok ? '' : ` (esperaba ${esperado})`}`);
  r.forEach((e) => console.log(`      ${e.texto}`));
}

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
