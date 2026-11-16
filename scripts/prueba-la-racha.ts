/**
 * LA RACHA — la constancia que el cliente ve, ejecutada.
 *
 * ═══ POR QUÉ EXISTE, MEDIDO EL 16 DE NOVIEMBRE DE 2026 ═══
 *
 * `calcularRachaDesdeFechas` es la única definición de constancia de la app, y
 * la leen tres pantallas: el Diario del cliente (`Dashboard`), el Admin cuando
 * mira una cuenta, y la pista de 66 de Mi protocolo (`diasSostenidos`). Sus
 * tres reglas están escritas arriba del código desde julio:
 *
 *   · el día en curso no castiga: si hoy todavía no hay sesión, se mira desde ayer;
 *   · gracia de un día hábil: el primero sin sesión se tolera, el segundo corta;
 *   · el fin de semana no suma ni rompe.
 *
 * **Ninguna lente las ejecutaba.** Tres de las 143 nombran la racha y las tres
 * miran la cola del Admin, no esta cuenta. Medido poniendo cada defecto a
 * propósito en `racha.ts` y corriendo la batería entera:
 *
 *   | el defecto puesto                              | la batería |
 *   |------------------------------------------------|------------|
 *   | el día en curso castiga (se va el paso a ayer) | 143 en verde |
 *   | se va la gracia: el primer hábil corta         | 143 en verde |
 *   | el finde rompe: el lunes arranca en cero       | 143 en verde |
 *
 * Lo que el cliente veía con cualquiera de los tres: su constancia más baja de
 * lo que es —cero un lunes, con el defecto del finde— y la pista de 66 de Mi
 * protocolo apagada con el trabajo hecho.
 *
 * ═══ CÓMO SE MIDE ═══
 *
 * Dos caminos, los dos ejecutando:
 *
 *   1) escenarios con su cuenta a mano, sobre un `hoy` fijo —noviembre de 2026,
 *      que empieza el 16 en lunes—, así que la lente dice lo mismo cualquier
 *      día que se corra;
 *   2) la misma regla escrita de otra forma —una lista de días hábiles hacia
 *      atrás, sin cursor ni aritmética de fechas adentro del lazo— contra 350
 *      escenarios generados con una semilla fija, con el `hoy` paseando por los
 *      siete días de la semana. Dos caminos que llegan al mismo número.
 *
 * Correr con: npx tsx scripts/prueba-la-racha.ts
 */
import { calcularRachaDesdeFechas } from '../src/lib/racha';

let fallas = 0;
const ok = (cond: boolean, que: string, detalle = '') => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}${detalle ? ` — ${detalle}` : ''}`);
  if (!cond) fallas++;
};

/** El camino propio: sábado y domingo, sin preguntarle a `racha.ts`. */
const esFinde = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dia = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// ── 1 · Los escenarios, con su cuenta a mano ───────────────────────────────
//
// El calendario de referencia, para poder seguir las cuentas de abajo:
//   lun 16 · mar 17 · mié 18 · jue 19 · vie 20 · SÁB 21 · DOM 22
//   ...y hacia atrás: vie 13 · jue 12 · mié 11 · mar 10 · lun 9 · SÁB-DOM 7 y 8
console.log('══ los escenarios, contados a mano ══');

const CASOS: Array<{ hoy: string; fechas: string[]; espera: number; que: string }> = [
  {
    hoy: '2026-11-18', fechas: [], espera: 0,
    que: 'sin una sola sesión, la racha es cero',
  },
  {
    hoy: '2026-11-18', fechas: ['2026-11-18', '2026-11-17', '2026-11-16', '2026-11-13', '2026-11-12'],
    espera: 5,
    que: 'cinco hábiles seguidos con el finde en medio: cinco (el sábado y el domingo no cuentan ni rompen)',
  },
  {
    hoy: '2026-11-18', fechas: ['2026-11-17', '2026-11-16', '2026-11-12', '2026-11-11', '2026-11-10'],
    espera: 5,
    que: 'hoy sin hacer y un hábil salteado atrás: cinco, no dos — el día en curso no se come la gracia',
  },
  {
    hoy: '2026-11-18', fechas: ['2026-11-18', '2026-11-17', '2026-11-13', '2026-11-12', '2026-11-11'],
    espera: 5,
    que: 'un hábil sin sesión en el medio: la gracia lo tolera y la racha sigue contando',
  },
  {
    hoy: '2026-11-18', fechas: ['2026-11-18', '2026-11-17', '2026-11-12', '2026-11-11'],
    espera: 2,
    que: 'dos hábiles seguidos sin sesión: ahí se corta',
  },
  {
    hoy: '2026-11-16', fechas: ['2026-11-13', '2026-11-12', '2026-11-11'],
    espera: 3,
    que: 'el lunes, con jueves y viernes hechos: tres — el finde no rompe nada',
  },
  {
    hoy: '2026-11-21', fechas: ['2026-11-20', '2026-11-19', '2026-11-18', '2026-11-17', '2026-11-16'],
    espera: 5,
    que: 'un sábado, con la semana entera hecha: cinco',
  },
  {
    hoy: '2026-11-18', fechas: ['2026-11-18T09:30:00.000Z', '2026-11-17'],
    espera: 2,
    que: 'una fecha con hora adentro cuenta igual: se mira el día',
  },
];

for (const c of CASOS) {
  const real = calcularRachaDesdeFechas(c.fechas, dia(c.hoy));
  ok(real === c.espera, c.que, `dio ${real} y la cuenta es ${c.espera}`);
}

// ── 2 · La misma regla por otro camino ─────────────────────────────────────
//
// Sin cursor y sin restar días adentro del lazo: primero la lista de hábiles
// hacia atrás, y después la regla sobre esa lista. Si las dos no dan el mismo
// número, una de las dos está mal y hay que mirar cuál.
console.log('\n══ el otro camino: 350 escenarios ══');

function habilesHaciaAtras(hoy: Date, cuantos: number): string[] {
  const out: string[] = [];
  const d = new Date(hoy);
  while (out.length < cuantos) {
    if (!esFinde(d)) out.push(iso(d));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

function rachaDeReferencia(fechas: string[], hoy: Date): number {
  if (fechas.length === 0) return 0;
  const set = new Set(fechas.map((f) => f.slice(0, 10)));
  const habiles = habilesHaciaAtras(hoy, 180);
  // El día en curso no castiga: si hoy es hábil y no tiene sesión, no se mira.
  if (!esFinde(hoy) && !set.has(iso(hoy))) habiles.shift();
  let racha = 0;
  let gracia = true;
  for (const h of habiles) {
    if (set.has(h)) racha++;
    else if (gracia) gracia = false;
    else break;
  }
  return racha;
}

/** Semilla fija: dos corridas miran exactamente los mismos escenarios. */
let semilla = 20261116;
const azar = () => {
  semilla = (semilla * 1103515245 + 12345) % 2147483648;
  return semilla / 2147483648;
};

let distintos = 0;
let primerDistinto = '';
let conSesiones = 0;
for (let n = 0; n < 350; n++) {
  // El `hoy` pasea por los siete días de la semana.
  const hoy = dia('2026-11-16');
  hoy.setDate(hoy.getDate() - (n % 28));
  const fechas: string[] = [];
  const candidato = new Date(hoy);
  for (let i = 0; i < 45; i++) {
    if (azar() < 0.62) fechas.push(iso(candidato));
    candidato.setDate(candidato.getDate() - 1);
  }
  if (fechas.length > 0) conSesiones++;
  const real = calcularRachaDesdeFechas(fechas, hoy);
  const ref = rachaDeReferencia(fechas, hoy);
  if (real !== ref) {
    distintos++;
    if (!primerDistinto) {
      primerDistinto = `hoy ${iso(hoy)}: la app dice ${real}, la referencia ${ref} (${fechas.slice(0, 8).join(' ')}…)`;
    }
  }
}

ok(distintos === 0, `los 350 escenarios dan el mismo número por los dos caminos`, primerDistinto);
ok(conSesiones > 300, 'y los escenarios traen sesiones de verdad, no listas vacías', String(conSesiones));

// Que la referencia no sea una copia que diga sí a todo: con la regla del día
// en curso sacada, los dos caminos TIENEN que empezar a diferir.
let difierenSinLaRegla = 0;
for (let n = 0; n < 60; n++) {
  const hoy = dia('2026-11-18');
  hoy.setDate(hoy.getDate() - (n % 28));
  if (esFinde(hoy)) continue;
  // Hoy sin sesión, y un hábil salteado tres días atrás: la forma en que el
  // defecto del día en curso se come la gracia.
  const habiles = habilesHaciaAtras(hoy, 8).slice(1);
  const fechas = habiles.filter((_, i) => i !== 2);
  const conLaRegla = rachaDeReferencia(fechas, hoy);
  const sinLaRegla = (() => {
    const set = new Set(fechas);
    let r = 0;
    let gracia = true;
    for (const h of habilesHaciaAtras(hoy, 180)) {
      if (set.has(h)) r++;
      else if (gracia) gracia = false;
      else break;
    }
    return r;
  })();
  if (conLaRegla !== sinLaRegla) difierenSinLaRegla++;
}
ok(difierenSinLaRegla > 15,
  'y la referencia no es ciega: sin la regla del día en curso, da otro número',
  String(difierenSinLaRegla));

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
