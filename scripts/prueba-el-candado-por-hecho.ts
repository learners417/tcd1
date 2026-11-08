/**
 * EL CANDADO POR HECHO
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Que la app FRENE, y no sólo ordene. El Camino ya avanza por logro —quien no
 * completa, no avanza— pero eso es orden, no freno. El freno que Javo pidió
 * primero es otro: la pauta no se enciende antes de la primera venta.
 *
 * Esa regla no la puede sostener un manual ni una llamada. Sólo la app puede
 * NO DEJARLO, y es la diferencia entre un curso y un sistema.
 *
 * ═══ Y QUE EL CANDADO SE PUEDA ABRIR ═══
 *
 * Un candado que lee un dato que nadie escribe es una pared sin puerta. Por
 * eso acá se exige que cada candado diga con qué se abre y cómo, y que el
 * hecho que lo abre exista de verdad en la app.
 */
import { CANDADOS_DEL_CAMINO, candadoDelDia, abiertoPorSusHechos, SIN_HECHOS } from '../src/lib/elCandado';
import { readFileSync } from 'node:fs';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

console.log('\n── el candado por hecho ──');

/* ── 1 · El candado de la pauta existe y frena ── */
const pauta = candadoDelDia(31);
if (!pauta) mal('el día 31 —encender las campañas— no tiene candado');
else if (abiertoPorSusHechos(31, SIN_HECHOS)) {
  mal('el día 31 se abre sin ninguna venta: la pauta no está frenada');
} else {
  console.log('  ✓ sin ventas, la pauta del día 31 queda cerrada');
}

/* ── 2 · Se abre por los dos lados que Javo eligió ── */
const porMano = abiertoPorSusHechos(31, { ...SIN_HECHOS, ventasRegistradas: 1 });
const porMCD = abiertoPorSusHechos(31, { ...SIN_HECHOS, cobroVerificadoEnMiClinica: true });
if (!porMano) mal('la venta registrada a mano no abre el candado');
if (!porMCD) mal('el cobro verificado por MiClínica no abre el candado');
if (porMano && porMCD) console.log('  ✓ la abre la venta a mano y la abre MiClínica');

/* ── 3 · Un día sin candado nunca queda trabado por esto ── */
for (const d of [1, 5, 26, 30, 45, 90]) {
  if (!abiertoPorSusHechos(d, SIN_HECHOS)) mal(`el día ${d} quedó trabado y no tiene candado`);
}

/* ── 4 · Cada candado dice con qué se abre, por qué y cómo ── */
for (const c of CANDADOS_DEL_CAMINO) {
  if (!c.abreCon.trim()) mal(`el candado del día ${c.dia} no dice con qué se abre`);
  if (!c.porQue.trim()) mal(`el candado del día ${c.dia} no dice por qué existe`);
  if (!c.comoLoAbres.trim()) mal(`el candado del día ${c.dia} no dice cómo abrirlo`);
}

/* ── 5 · El Camino lo usa de verdad ──
 *
 * El módulo puede estar perfecto y la pantalla no llamarlo. Lo que se mira es
 * que el candado entre en el cálculo de si la jornada se abre, y que el
 * mensaje que lee el cliente sea el del candado y no «completa la anterior».
 */
const rm = readFileSync(new URL('../src/pages/Roadmap.tsx', import.meta.url), 'utf8');
if (!/abiertoPorSusHechos\(/.test(rm)) mal('el Camino no consulta el candado por hecho');
if (!/const unlocked = isTaskUnlocked\([^)]*\) && abiertoPorHechos/.test(rm)) {
  mal('el candado por hecho no entra en si la jornada se abre');
}
if (!/candado\.abreCon/.test(rm)) mal('el cliente no lee con qué se abre el candado');

/* ── 6 · El hecho llega desde los dos lados ── */
if (!/ventasRegistradas: ventas\.length/.test(rm)) mal('el Camino no cuenta las ventas registradas');
if (!/mcd-bridge/.test(rm)) mal('el Camino no consulta el cobro de MiClínica');

if (!fallas) console.log('  ✓ la pauta no se enciende antes de la primera venta\n');
else console.log('');
process.exit(fallas ? 1 : 0);
