/**
 * LAS CINCO ESTACIONES, CUBRIENDO LOS NOVENTA DÍAS
 *
 * ═══ QUÉ MIRA ═══
 *
 * Que todo día del Camino caiga en UNA estación, y en una sola. Un día sin
 * estación es un día que la pantalla no sabe nombrar; un día en dos es un
 * título que depende de en qué orden se recorrió la lista.
 *
 * Y que las jornadas que el mapa compromete por nombre estén en su tramo —el
 * Lago con los cinco días del precio, la Montaña con el método y la oferta,
 * el Viento con los anuncios encendidos.
 *
 * ═══ POR QUÉ HACE FALTA ═══
 *
 * El cliente veía «Días 48 a 90» como nombre de grupo: un rango de 43 días
 * haciendo el trabajo de tres estaciones. Las estaciones lo reemplazan, y en
 * cuanto una pantalla depende de ellas, un hueco en los rangos deja esa
 * pantalla sin título. Esto lo caza antes.
 */
import { ESTACIONES, estacionDelDia, dentroDeLaEstacion, JORNADAS_COMPROMETIDAS } from '../src/lib/estaciones';
import { SEED_ROADMAP_V3, diaDelCodigo } from '../src/lib/roadmapSeed';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`✗ ${m}`); };

/* ── 1 · Los noventa días, cubiertos, una vez cada uno ── */
for (let d = 1; d <= 90; d += 1) {
  const cuantas = ESTACIONES.filter((e) => d >= e.desde && d <= e.hasta);
  if (cuantas.length === 0) mal(`el día ${d} no cae en ninguna estación`);
  if (cuantas.length > 1) mal(`el día ${d} cae en ${cuantas.length}: ${cuantas.map((e) => e.nombre).join(' y ')}`);
}

/* ── 2 · Los tramos se tocan sin pisarse ── */
const orden = [...ESTACIONES].sort((a, b) => a.desde - b.desde);
if (orden[0].desde !== 1) mal(`la primera estación arranca el día ${orden[0].desde} y no el 1`);
if (orden[orden.length - 1].hasta !== 90) mal(`la última termina el día ${orden[orden.length - 1].hasta} y no el 90`);
for (let i = 1; i < orden.length; i += 1) {
  if (orden[i].desde !== orden[i - 1].hasta + 1) {
    mal(`entre ${orden[i - 1].nombre} (hasta ${orden[i - 1].hasta}) y ${orden[i].nombre} (desde ${orden[i].desde}) hay un salto`);
  }
  if (orden[i].desde > orden[i].hasta) mal(`${orden[i].nombre} va del ${orden[i].desde} al ${orden[i].hasta}`);
}

/* ── 3 · Cada estación dice con qué se abre y qué deja ──
 *
 * El candado es lo que convierte la app en mentor: no se pasa a la Montaña
 * por llegar al día 8, se pasa con el reset hecho. Una estación sin eso
 * escrito es una estación que no puede frenar a nadie.
 */
for (const e of ESTACIONES) {
  if (!e.seAbreCon.trim()) mal(`${e.nombre} no dice con qué se abre`);
  if (!e.teDeja.trim()) mal(`${e.nombre} no dice qué deja`);
  if (!e.libro.trim()) mal(`${e.nombre} no tiene libro`);
  /* Hex para los cinco paisajes del sur; la variable del oro para el Cierre. */
  if (!/^#[0-9A-Fa-f]{6}$/.test(e.color) && !e.color.startsWith('var(--')) {
    mal(`${e.nombre} tiene un color raro: ${e.color}`);
  }
}

/* ── 4 · Lo que el mapa compromete, está donde lo compromete ── */
const codigos = new Set<string>();
for (const p of SEED_ROADMAP_V3 as { metas: { codigo: string }[] }[]) {
  for (const m of p.metas) codigos.add(m.codigo);
}
for (const [codigo, idEsperado] of Object.entries(JORNADAS_COMPROMETIDAS)) {
  if (!codigos.has(codigo)) { mal(`«${codigo}» está comprometida con una estación y no existe en el Camino`); continue; }
  const dia = diaDelCodigo(codigo);
  const est = estacionDelDia(dia);
  if (!est) { mal(`«${codigo}» (día ${dia}) no cae en ninguna estación`); continue; }
  if (est.id !== idEsperado) {
    const esperada = ESTACIONES.find((e) => e.id === idEsperado)!;
    mal(`«${codigo}» tiene que estar en ${esperada.nombre} (días ${esperada.desde}-${esperada.hasta}) y está el día ${dia}, en ${est.nombre}`);
  }
}

/* ── 5 · La cuenta dentro de la estación ── */
const c = dentroDeLaEstacion(1);
if (!c || c.va !== 1) mal('el día 1 no es el primer día de su estación');
const u = dentroDeLaEstacion(90);
if (!u || u.va !== u.de) mal('el día 90 no es el último día de su estación');

if (!fallas) {
  console.log('✓ las cinco estaciones cubren los 90 días, una vez cada uno');
  for (const e of orden) {
    const n = e.hasta - e.desde + 1;
    console.log(`    ${e.nombre.padEnd(12)} días ${String(e.desde).padStart(2)}-${String(e.hasta).padStart(2)}  ${String(n).padStart(2)} días · ${e.libro}`);
  }
}
process.exit(fallas ? 1 : 0);
