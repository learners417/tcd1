/**
 * LAS CINCO ESTACIONES, CUBRIENDO LOS NOVENTA DÍAS
 *
 * ═══ QUÉ MIRA ═══
 *
 * Que todo día del Camino caiga en UNA estación, que las dos pantallas donde
 * el cliente la ve digan lo mismo, y que las jornadas que el mapa compromete
 * por nombre estén en su tramo.
 *
 * ═══ POR QUÉ ESTA LENTE SE REESCRIBIÓ (8 de noviembre) ═══
 *
 * La primera versión miraba la tabla de estaciones contra sí misma: que los
 * tramos se tocaran, que no hubiera huecos, que cada una declarara su color.
 * Daba verde. Y mientras daba verde, la app se contradecía sola **21 de los
 * 90 días**: el día 75 Hoy dibujaba el Río y El Camino decía «El Bosque».
 *
 * Porque la tabla ERA coherente. Lo que no era coherente es la tabla con el
 * resto de la app: `losCincoPaisajes.ts` ya traía los mismos cinco paisajes,
 * con sus tramos parseados del seed y sus colores medidos sobre el PDF de
 * imprenta, y la tabla nueva los volvió a escribir a mano, distintos.
 *
 * Esa es la lección, y es la misma que apareció tres veces esta semana: una
 * lente que mira la implementación pasa en verde el día que alguien escribe
 * la segunda copia. Lo que hay que mirar es la RESPUESTA — para cada día de
 * los noventa, ¿las dos pantallas dicen el mismo paisaje?
 */
import { estacionDelDia, dentroDeLaEstacion, JORNADAS_COMPROMETIDAS, CANDADOS } from '../src/lib/estaciones';
import { paisajeDelDia, tramoDelPaisaje, PAISAJES } from '../src/lib/losCincoPaisajes';
import { SEED_ROADMAP_V3, diaDelCodigo, roadmap } from '../src/lib/roadmapSeed';
import { readFileSync } from 'node:fs';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`✗ ${m}`); };
const DIAS = roadmap.dias;

/* ── 1 · LO QUE DE VERDAD IMPORTA · las dos pantallas dicen lo mismo ──
 *
 * Hoy abre con la cabecera del día, que dibuja el paisaje. El Camino nombra
 * el tramo del pilar. El paisaje es el libro que el cliente está leyendo esa
 * semana: si las dos pantallas no coinciden, su app lo manda a otro libro.
 */
const choques: string[] = [];
for (let d = 1; d <= DIAS; d += 1) {
  const hoy = paisajeDelDia(d)?.id ?? null;
  const camino = estacionDelDia(d)?.id ?? null;
  if (hoy !== camino) choques.push(`día ${d}: Hoy «${hoy}» · El Camino «${camino}»`);
}
if (choques.length) {
  mal(`${choques.length} día(s) en los que las dos pantallas se contradicen:`);
  for (const c of choques.slice(0, 6)) console.log(`    ${c}`);
}

/* ── 2 · Los noventa días, cubiertos, una vez cada uno ── */
for (let d = 1; d <= DIAS; d += 1) {
  if (!estacionDelDia(d)) mal(`el día ${d} no cae en ninguna estación`);
}

/* ── 3 · Los tramos se tocan sin pisarse ── */
let anterior = 0;
for (const p of PAISAJES) {
  const t = tramoDelPaisaje(p.id);
  if (t.desde !== anterior + 1) {
    mal(`${p.nombre} arranca el día ${t.desde} y el anterior cerró el ${anterior}`);
  }
  if (t.desde > t.hasta) mal(`${p.nombre} va del ${t.desde} al ${t.hasta}`);
  anterior = t.hasta;
}
if (anterior !== DIAS) mal(`el último paisaje cierra el día ${anterior} y el Camino tiene ${DIAS}`);

/* ── 4 · Cada estación dice con qué se abre y qué deja ──
 *
 * El candado es lo que convierte la app en mentor: no se pasa a la Montaña
 * por llegar al día 8, se pasa con el reset hecho. Una estación sin eso
 * escrito es una estación que no puede frenar a nadie.
 */
for (const p of PAISAJES) {
  const c = CANDADOS[p.id];
  if (!c) { mal(`${p.nombre} no declara su candado`); continue; }
  if (!c.seAbreCon.trim()) mal(`${p.nombre} no dice con qué se abre`);
  if (!c.teDeja.trim()) mal(`${p.nombre} no dice qué deja`);
  if (!c.libertad.trim()) mal(`${p.nombre} no dice qué libertad trabaja`);
  if (!p.libro.trim()) mal(`${p.nombre} no tiene libro`);
}

/* ── 5 · El color sale del libro, y nadie lo escribe a mano ──
 *
 * Los cinco tonos de cada paisaje están medidos sobre el PDF de imprenta: el
 * ocre del viento daba 2,2 a 1 sobre blanco y por eso tiene un «lecho» aparte
 * para el texto. Un hex escrito a mano en otro archivo es una sexta copia
 * esperando a quedar distinta — que es exactamente lo que pasó.
 */
const fuente = readFileSync(new URL('../src/lib/estaciones.ts', import.meta.url), 'utf8');
const aMano = fuente.replace(/\/\*[\s\S]*?\*\//g, '').match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
if (aMano.length) mal(`estaciones.ts escribe color a mano: ${aMano.join(' ')}`);

/* ── 6 · Lo que el mapa compromete, está donde lo compromete ── */
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
    const t = tramoDelPaisaje(idEsperado);
    const esperada = PAISAJES.find((p) => p.id === idEsperado)!;
    mal(`«${codigo}» tiene que estar en ${esperada.nombre} (días ${t.desde}-${t.hasta}) y está el día ${dia}, en ${est.nombre}`);
  }
}

/* ── 7 · La cuenta dentro de la estación ── */
const c1 = dentroDeLaEstacion(1);
if (!c1 || c1.va !== 1) mal('el día 1 no es el primer día de su estación');
const cf = dentroDeLaEstacion(DIAS);
if (!cf || cf.va !== cf.de) mal(`el día ${DIAS} no es el último día de su estación`);

if (!fallas) {
  console.log(`✓ las cinco estaciones cubren los ${DIAS} días, y las dos pantallas coinciden`);
  for (const p of PAISAJES) {
    const t = tramoDelPaisaje(p.id);
    const n = t.hasta - t.desde + 1;
    console.log(`    ${p.nombre.padEnd(12)} días ${String(t.desde).padStart(2)}-${String(t.hasta).padStart(2)}  ${String(n).padStart(2)} días · ${p.libro}`);
  }
}
process.exit(fallas ? 1 : 0);
