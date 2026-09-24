import { calcularCadena, encontrarDomino, proyectar, SEMANA_VACIA, formatear } from '../src/lib/valueChain';

// Cliente que vende un programa de $1.000. Inversión sana: 25% del objetivo mensual.
const base = { ...SEMANA_VACIA, precio: 1000, piezasPublicadas: 7, gasto: 250 };

const casos: Array<[string, any, string]> = [
  ['Anuncio caro — conversación a $25',
   { ...base, conversaciones: 10, agendas: 4, llamadasTomadas: 3, ofertasPresentadas: 3,
     ventas: 1, facturado: 1000, cobrado: 500 }, 'costo por conversación'],

  ['El DM pierde a la gente — 5% agenda',
   { ...base, conversaciones: 100, agendas: 5, llamadasTomadas: 4, ofertasPresentadas: 4,
     ventas: 1, facturado: 1000, cobrado: 500 }, 'conversación → agenda'],

  ['No se presentan a la llamada — 25%',
   { ...base, conversaciones: 100, agendas: 35, llamadasTomadas: 9, ofertasPresentadas: 8,
     ventas: 3, facturado: 3000, cobrado: 1500 }, 'asistencia'],

  ['No cierra — 25 llamadas, 0 ventas',
   { ...base, conversaciones: 100, agendas: 35, llamadasTomadas: 25, ofertasPresentadas: 21,
     ventas: 0, facturado: 0, cobrado: 0 }, 'cierre'],

  ['Vende pero no cobra — 10% adelantado',
   { ...base, conversaciones: 100, agendas: 35, llamadasTomadas: 25, ofertasPresentadas: 21,
     ventas: 8, facturado: 8000, cobrado: 800 }, 'cobrado por adelantado'],

  ['Todo sano',
   { ...base, conversaciones: 100, agendas: 35, llamadasTomadas: 25, ofertasPresentadas: 21,
     ventas: 7, facturado: 7000, cobrado: 3500 }, 'sana'],
];

let ok = 0;
for (const [nombre, n, esperado] of casos) {
  const d = encontrarDomino(calcularCadena(n));
  const acierta = (d.titulo + ' ' + d.porque).toLowerCase().includes(esperado.toLowerCase());
  if (acierta) ok++;
  console.log(`${acierta ? '✓' : '✗'} ${nombre}`);
  console.log(`    dominó: ${d.titulo}${d.indicador ? ` = ${formatear(d.indicador.valor, d.indicador.formato)}` : ''}`);
  if (!acierta) console.log(`    ESPERABA: ${esperado}`);
}
console.log(`\n${ok}/${casos.length} escenarios diagnosticados bien`);

const p = proyectar(10, casos[5][1]);
console.log(`\nProyección para 10 ventas (tasas reales, colchón 30%):`);
console.log(`  ${p.conversacionesNecesarias} conversaciones → ${p.agendasNecesarias} agendas → ${p.llamadasNecesarias} llamadas`);
console.log(`  inversión $${p.inversionNecesaria} · gobierna la semana: ${p.gobierna}`);
