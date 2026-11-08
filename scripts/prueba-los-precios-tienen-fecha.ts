/**
 * LOS PRECIOS TIENEN FECHA, Y SON LOS QUE JAVO VENDE
 *
 * ═══ LA FALLA QUE PROTEGE ═══
 *
 * La Instalación figuraba en la app a 5.000 cuando Javo la vende a 6.000. Mil
 * dólares menos, en la pantalla, a la cara del cliente. Nadie lo vio porque
 * el número estaba escrito suelto y no había con qué compararlo.
 *
 * Y el 1 de enero de 2027 la mentoría pasa a 3.500 y la instalación a 7.000.
 * Con números sueltos, eso obliga a tocar el código ese día: si nadie lo
 * toca, la app vende barato y nadie se entera hasta que alguien compara.
 *
 * ═══ QUÉ MIRA ═══
 *
 * Que cada ticket tenga su lista con fecha, que el precio de HOY sea el que
 * él vende hoy, y que el de enero sea el que él anunció. No mira el código:
 * mira los números que saldrían en pantalla en esas dos fechas.
 *
 * Si Javo cambia un precio, esta lente se pone roja hasta que el de acá
 * coincida — y ese es el punto: el precio de la app y el precio que vende
 * tienen que ser el mismo número, siempre.
 */
import { TICKETS, CIMA, precioVigente } from '../src/lib/cuadroTickets';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

/**
 * Lo que Javo vende, dicho por él el 8 de noviembre de 2026.
 *
 * ÉSTE es el único lugar donde se declara. Se exporta porque
 * `prueba-la-oferta-que-sigue.ts` lo necesita: esa lente clavaba `'$5.000'` a
 * mano y quedó defendiendo el precio viejo cuando Javo pasó La Instalación a
 * 6.000. Con dos lugares declarando lo que vale, el que se olvida gana.
 */
export const LO_QUE_VENDE = {
  base: { hoy: 1000, enero: 1000 },
  ascenso: { hoy: 3000, enero: 3500 },
  instalacion: { hoy: 6000, enero: 7000 },
} as const;

/*
 * Las fechas se construyen EN LOCAL, con (año, mes, día).
 *
 * `new Date('2027-01-01')` se parsea como medianoche UTC, que en Buenos Aires
 * es el 31 de diciembre a las 21:00. La primera versión de esta prueba lo
 * hacía así y daba en rojo — con razón: en ese instante el precio viejo TODAVÍA
 * rige, que es exactamente lo que la regla de fechas locales protege. El error
 * estaba en la prueba, no en el precio.
 */
const HOY = new Date(2026, 10, 8);
const ENERO = new Date(2027, 0, 1);

console.log('\n── los precios de la app son los que vende ──');

for (const [id, esperado] of Object.entries(LO_QUE_VENDE)) {
  const t = TICKETS[id as keyof typeof TICKETS];
  if (!t) { mal(`no existe el ticket ${id}`); continue; }
  const hoy = precioVigente(t.precios, HOY);
  const enero = precioVigente(t.precios, ENERO);
  if (hoy !== esperado.hoy) mal(`${t.nombre} hoy: la app dice ${hoy} y se vende a ${esperado.hoy}`);
  if (enero !== esperado.enero) mal(`${t.nombre} en enero: la app dice ${enero} y pasa a ${esperado.enero}`);
  /* Y que `precio` —el que lee la app— sea el de hoy, no el primero de la lista. */
  if (t.precio !== precioVigente(t.precios)) {
    mal(`${t.nombre}: lo que lee la app no es el precio vigente`);
  }
}

/* La Cima se suma a cualquiera y no cambió. */
if (CIMA.precio !== 5000) mal(`La Cima: la app dice ${CIMA.precio} y son 5.000`);

/* El tramo sin fecha va primero: si alguien lo pone último, hoy se rompe. */
for (const t of Object.values(TICKETS)) {
  if (t.precios[0].desde) mal(`${t.nombre}: el primer tramo de precio no puede llevar fecha`);
  const fechas = t.precios.slice(1).map((p) => p.desde ?? '');
  if (fechas.some((f, i) => i > 0 && f <= fechas[i - 1])) {
    mal(`${t.nombre}: los tramos de precio no están en orden de fecha`);
  }
}

if (!fallas) {
  console.log('  ✓ hoy y en enero, la app cobra lo que Javo vende');
  for (const t of Object.values(TICKETS)) {
    console.log(`      ${t.nombre.padEnd(16)} $${precioVigente(t.precios, HOY).toLocaleString('es-AR').padEnd(6)} → $${precioVigente(t.precios, ENERO).toLocaleString('es-AR')}`);
  }
  console.log('');
}
process.exit(fallas ? 1 : 0);
