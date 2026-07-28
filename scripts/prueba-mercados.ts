/**
 * Pruebas de los mercados.
 *
 * Lo que se juega: juzgar a todos con la misma vara se equivoca en las DOS
 * direcciones — le dice «caro» a quien está bien para su mercado, y «barato»
 * a quien trae gente que no puede pagarle.
 *
 * Correr con: npx tsx scripts/prueba-mercados.ts
 */
import {
  MERCADOS, bandaDe, explicarBanda, aprenderDeSemana, recomendarMercados,
  SEMANAS_PARA_CONFIAR, type DatoPropio,
} from '../src/lib/mercados';
import { calcularCadena, SEMANA_VACIA } from '../src/lib/valueChain';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

console.log('══ las bandas por mercado ══');
linea(Object.keys(MERCADOS).length >= 12, `${Object.keys(MERCADOS).length} mercados`);
linea(MERCADOS.AR.cpmMax < MERCADOS.ES.cpmMin,
  'el techo argentino está por debajo del piso español: no se pueden medir igual');
linea(MERCADOS.VE.poderDeCompra < MERCADOS.US.poderDeCompra,
  'y el poder de compra los ordena distinto que el costo');

const soloMx = bandaDe(['MX']);
linea(soloMx.cpmMin === 4 && soloMx.cpmMax === 8, `México: $${soloMx.cpmMin}-${soloMx.cpmMax}`);
const mxEs = bandaDe(['MX', 'ES']);
linea(mxEs.cpmMin === 4 && mxEs.cpmMax === 15,
  `México + España abarca los dos: $${mxEs.cpmMin}-${mxEs.cpmMax}`);
linea(mxEs.poderDeCompra === MERCADOS.MX.poderDeCompra,
  'y el poder de compra se toma del MÁS BAJO: si la mitad no puede pagar, eso ya explica una conversión floja');

linea(bandaDe([]).nombres.length === 1, 'sin mercados usa uno por defecto y no revienta');
linea(bandaDe(['ZZ', 'XX']).nombres.length === 1, 'con códigos inventados también');
linea(bandaDe(['MX', 'ZZ']).nombres.length === 1, 'y descarta el inválido quedándose con el bueno');

console.log('\n══ lo que dice ══');
linea(explicarBanda(bandaDe(['MX'])).includes('es una referencia'),
  'sin datos propios lo aclara: es una referencia, no una verdad');
linea(explicarBanda(bandaDe(['MX', 'ES'])).includes('y España'),
  'y nombra los mercados en castellano');

console.log('\n══ la tabla propia ══');
let propias = new Map<string, DatoPropio>();
for (let i = 0; i < SEMANAS_PARA_CONFIAR; i++) {
  propias = aprenderDeSemana(propias, {
    mercados: ['MX'], precio: 1000, gasto: 140,
    impresiones: 20000, conversaciones: 14, ventas: 1,
  });
}
const mx = propias.get('MX')!;
linea(mx.semanas === SEMANAS_PARA_CONFIAR, `acumula ${mx.semanas} semanas`);
linea(Math.round(mx.cpmMin) === 7, `y calcula el CPM real: $${mx.cpmMin.toFixed(1)}`);
linea(Math.round(mx.costoConversacion) === 10, `el costo por conversación: $${mx.costoConversacion.toFixed(0)}`);
linea(Math.round(mx.pctCompra) === 7, `y qué porcentaje compra: ${mx.pctCompra.toFixed(0)}%`);

const conPropia = bandaDe(['MX'], propias);
linea(conPropia.propia, 'con 4 semanas, la banda pasa a ser propia');
linea(explicarBanda(conPropia).includes('datos tuyos'), 'y lo dice');

const pocas = aprenderDeSemana(new Map(), {
  mercados: ['CO'], precio: 1000, gasto: 100, impresiones: 10000,
  conversaciones: 10, ventas: 1,
});
linea(!bandaDe(['CO'], pocas).propia,
  `con una sola semana NO reemplaza la referencia: hacen falta ${SEMANAS_PARA_CONFIAR}`);

console.log('\n══ lo que no ensucia la tabla ══');
linea(aprenderDeSemana(new Map(), {
  mercados: ['MX'], precio: 1000, gasto: 0, impresiones: 0,
  conversaciones: 0, ventas: 0,
}).size === 0, 'una semana sin gasto no enseña nada y no se anota');
linea(aprenderDeSemana(new Map(), {
  mercados: [], precio: 1000, gasto: 100, impresiones: 5000,
  conversaciones: 5, ventas: 0,
}).size === 0, 'sin mercados declarados tampoco');
const varios = aprenderDeSemana(new Map(), {
  mercados: ['MX', 'CO'], precio: 1000, gasto: 100, impresiones: 10000,
  conversaciones: 10, ventas: 1,
});
linea(varios.size === 2,
  'una campaña en dos países se atribuye a los dos — Meta no dice de dónde vino cada impresión');

console.log('\n══ la recomendación ══');
const sinDatos = recomendarMercados(new Map(), 1000);
linea(sinDatos.mercados.length === 0, 'sin datos propios NO recomienda nada');
linea(sinDatos.porque.includes('Todavía no tengo datos'),
  'y lo dice — una recomendación inventada es peor que ninguna');

let dos = propias;
for (let i = 0; i < SEMANAS_PARA_CONFIAR; i++) {
  dos = aprenderDeSemana(dos, {
    mercados: ['ES'], precio: 1000, gasto: 300,
    impresiones: 25000, conversaciones: 15, ventas: 3,
  });
}
const rec = recomendarMercados(dos, 1000);
linea(rec.mercados.length === 2, 'con datos de dos mercados recomienda los dos');
linea(rec.mercados[0].mercado === 'ES',
  'y gana España aunque sea más cara: rinde el que MÁS COMPRA por conversación, no el más barato');
linea(rec.porque.includes('semanas de datos tuyos'), 'diciendo con cuántos datos lo dice');

linea(recomendarMercados(dos, 100000).mercados.length === 0,
  'un precio muy lejos del medido no se recomienda: $300 no dice nada sobre $100.000');

// ── El mismo número, juzgado según dónde corre ─────────────────────────────
console.log('\n══ el mismo número en tres mercados ══');
const base = {
  ...SEMANA_VACIA, precio: 1000,
  gasto: 140, impresiones: 12000, alcance: 9000,
  comentarios: 20, conversaciones: 14, agendas: 5, llamadasTomadas: 4,
};
const cpmDe = (mercados: string[]) =>
  calcularCadena({ ...base, mercados }).find((i) => i.id === 'cpm')!;

const esp = cpmDe(['ES']);
const arg = cpmDe(['AR']);
linea(Math.abs((esp.valor ?? 0) - (arg.valor ?? 0)) < 0.01,
  `el CPM es el mismo: $${esp.valor?.toFixed(2)}`);
linea(esp.brecha === 0 && arg.brecha > 1,
  'y sin embargo está SANO en España y casi al triple del techo en Argentina');
linea(esp.ref[1] > arg.ref[1] * 2,
  `las bandas ni se parecen: España hasta $${esp.ref[1]}, Argentina hasta $${arg.ref[1]}`);

console.log('\n══ la frecuencia ══');
const agotado = calcularCadena({ ...base, mercados: ['MX'], impresiones: 42000 })
  .find((i) => i.id === 'frecuencia')!;
linea((agotado.valor ?? 0) > 4 && agotado.brecha > 0.5,
  `42.000 impresiones sobre 9.000 personas dan ${agotado.valor?.toFixed(1)} y se marca`);
linea(agotado.dondeMirar.includes('No es el creativo'),
  'y lo dice: no es el creativo, es que el público se agotó');
linea(calcularCadena({ ...base, impresiones: 0, alcance: 0 })
  .find((i) => i.id === 'frecuencia')!.valor === null,
  'sin impresiones ni alcance no inventa una frecuencia');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
