/**
 * Pruebas de la bitácora.
 *
 * Correr con: npx tsx scripts/prueba-bitacora.ts
 */
import {
  semanaISO, anotarSemana, leerBitacora, resumirBitacora,
  type EntradaBitacora,
} from '../src/lib/bitacoraCampana';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const ent = (x: Partial<EntradaBitacora>): EntradaBitacora => ({
  semana: '2026-W31', indice: 0, formula: 'Las 3 piedras', queSeProbo: '',
  gasto: 0, conversaciones: 0, agendas: 0, ventas: 0,
  estado: 'sigue', anotadaEn: new Date().toISOString(), ...x,
});

// ── 1 · La semana ISO ──────────────────────────────────────────────────────
console.log('══ la semana ISO ══');
linea(/^\d{4}-W\d{2}$/.test(semanaISO()), `hoy es ${semanaISO()}`);
linea(semanaISO(new Date('2026-01-01')) === '2026-W01',
  `el 1 de enero de 2026 cae en ${semanaISO(new Date('2026-01-01'))}`);
linea(semanaISO(new Date('2026-08-04')) === semanaISO(new Date('2026-08-07')),
  'martes y viernes de la misma semana dan la misma clave');
linea(semanaISO(new Date('2026-08-07')) !== semanaISO(new Date('2026-08-11')),
  'viernes y el martes siguiente dan claves distintas');

// ── 2 · Anotar no duplica ──────────────────────────────────────────────────
console.log('\n══ anotar la semana ══');
let b: EntradaBitacora[] = [];
b = anotarSemana(b, [ent({ indice: 0, gasto: 50 }), ent({ indice: 1, gasto: 40 })]);
linea(b.length === 2, 'se anotan las dos filas de la semana');

// El viernes se carga, se corrige y se vuelve a cargar.
b = anotarSemana(b, [ent({ indice: 0, gasto: 55 })]);
linea(b.length === 2, 'volver a cargar el mismo anuncio NO duplica la fila');
linea(b.find((x) => x.indice === 0)!.gasto === 55, 'y queda el último valor');
linea(b.find((x) => x.indice === 1)!.gasto === 40, 'sin tocar el otro anuncio');

b = anotarSemana(b, [ent({ semana: '2026-W32', indice: 0, gasto: 60 })]);
linea(b.length === 3, 'una semana nueva se suma, no reemplaza');
linea(b.filter((x) => x.semana === '2026-W31').length === 2,
  'y la semana anterior sigue entera');

// ── 3 · La tendencia contra la semana anterior ─────────────────────────────
console.log('\n══ cómo se movió el número ══');
const conHistoria: EntradaBitacora[] = [
  ent({ semana: '2026-W30', indice: 0, gasto: 100, conversaciones: 20 }),  // $5.00
  ent({ semana: '2026-W31', indice: 0, gasto: 100, conversaciones: 40 }),  // $2.50 → mejora
  ent({ semana: '2026-W32', indice: 0, gasto: 100, conversaciones: 20 }),  // $5.00 → empeora
  ent({ semana: '2026-W33', indice: 0, gasto: 100, conversaciones: 21 }),  // $4.76 → igual
];
const filas = leerBitacora(conHistoria);
linea(filas[0].semana === '2026-W33', 'se lee de la más reciente a la más vieja');
const por = (s: string) => filas.find((f) => f.semana === s)!;
linea(por('2026-W30').tendencia === null, 'la primera semana no tiene con qué compararse');
linea(por('2026-W31').tendencia === 'mejora', 'de $5,00 a $2,50 es mejora');
linea(por('2026-W32').tendencia === 'empeora', 'de $2,50 a $5,00 es empeora');
linea(por('2026-W33').tendencia === 'igual', 'una diferencia menor al 10% es igual, no ruido');

// Cada anuncio se compara contra SÍ MISMO, no contra los otros.
const dosAnuncios: EntradaBitacora[] = [
  ent({ semana: '2026-W30', indice: 0, gasto: 100, conversaciones: 10 }),  // $10
  ent({ semana: '2026-W30', indice: 1, gasto: 100, conversaciones: 100 }), // $1
  ent({ semana: '2026-W31', indice: 0, gasto: 100, conversaciones: 20 }),  // $5 → mejora
  ent({ semana: '2026-W31', indice: 1, gasto: 100, conversaciones: 50 }),  // $2 → empeora
];
const f2 = leerBitacora(dosAnuncios);
linea(f2.find((x) => x.semana === '2026-W31' && x.indice === 0)!.tendencia === 'mejora',
  'el anuncio 0 mejoró contra su propia semana anterior');
linea(f2.find((x) => x.semana === '2026-W31' && x.indice === 1)!.tendencia === 'empeora',
  'y el 1 empeoró, aunque siga siendo más barato que el 0');

// ── 4 · Lo que la bitácora enseña ──────────────────────────────────────────
console.log('\n══ lo que enseña ══');
const largo: EntradaBitacora[] = [
  ent({ semana: '2026-W30', indice: 0, formula: 'Las 3 piedras', gasto: 100, ventas: 1, estado: 'ganador' }),
  ent({ semana: '2026-W30', indice: 1, formula: 'El espejo', gasto: 100, ventas: 0, estado: 'muerto' }),
  ent({ semana: '2026-W31', indice: 0, formula: 'Las 3 piedras', gasto: 100, ventas: 2, estado: 'ganador' }),
  ent({ semana: '2026-W31', indice: 1, formula: 'El espejo', gasto: 100, ventas: 0, estado: 'muerto' }),
];
const r = resumirBitacora(largo);
linea(r.semanas === 2, 'cuenta 2 semanas');
linea(r.gastoTotal === 400, `suma el gasto: $${r.gastoTotal}`);
linea(r.ventasTotal === 3, 'suma las ventas');
linea(r.costoVentaAcumulado !== null && Math.round(r.costoVentaAcumulado) === 133,
  `el costo por venta del período: $${r.costoVentaAcumulado?.toFixed(0)}`);
linea(r.mejorFormula?.formula === 'Las 3 piedras' && r.mejorFormula.veces === 2,
  'sabe qué fórmula gana en ESTA cuenta');
linea(r.formulasQueFallaron.includes('El espejo'),
  'y cuál falló dos veces sin ganar nunca — para no repetirla');
linea(!r.formulasQueFallaron.includes('Las 3 piedras'),
  'una que ganó no figura como fallida aunque haya perdido alguna vez');

// Una que falló UNA sola vez todavía merece otra oportunidad.
const unaSola = resumirBitacora([
  ent({ formula: 'El espejo', estado: 'muerto' }),
]);
linea(unaSola.formulasQueFallaron.length === 0,
  'fallar una vez no la descarta: hacen falta dos');

// ── 5 · Bordes ─────────────────────────────────────────────────────────────
console.log('\n══ bordes ══');
const vacia = resumirBitacora([]);
linea(vacia.semanas === 0 && vacia.costoVentaAcumulado === null,
  'una bitácora vacía no se rompe ni divide por cero');
linea(leerBitacora([]).length === 0, 'y leerla no inventa filas');
linea(resumirBitacora([ent({ gasto: 100, ventas: 0 })]).costoVentaAcumulado === null,
  'gastar sin vender no da un costo por venta infinito: da null');
linea(leerBitacora([ent({ gasto: 0, conversaciones: 0 })])[0].costoConversacion === null,
  'sin gasto ni conversaciones el costo es null, no NaN');
linea(anotarSemana([], []).length === 0, 'anotar nada no rompe');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
