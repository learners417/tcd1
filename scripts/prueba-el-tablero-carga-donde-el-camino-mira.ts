/**
 * EL TABLERO CARGA DONDE EL CAMINO MIRA
 *
 * ═══ QUÉ MIRA ═══
 *
 * La única pregunta que importa, y para las 64 filas: **si Javo pega un enlace
 * en esta fila, ¿el cliente lo ve, y en el día que dice la fila?**
 *
 * No mira cómo se arma la clave: mira la respuesta. Por eso simula las dos
 * mitades con las funciones de verdad —la que guarda el Tablero y la que lee
 * el Camino— y no con una copia de ninguna de las dos.
 *
 * ═══ QUÉ ENCONTRÓ (turno 12, 9 de noviembre) ═══
 *
 * El Tablero guardaba el enlace con el código de la PIEZA (`P8.1`) y el Camino
 * lo busca por el código de la JORNADA (`P2.d8`), que lleva el día adentro.
 * Medido con las funciones reales, antes de tocar nada:
 *
 *   · **34 de las 43 piezas** guardaban un código que el Camino nunca busca.
 *     Enlace guardado, tilde verde, y el cliente sin video para siempre.
 *   · **Las 9 que sí caían en un código buscado eran las peores.** Ocho de
 *     ellas coinciden por casualidad con la jornada de otro día: el Tablero
 *     decía «P8.2 · día 39» con la pieza del día 51, y el video aparecía el
 *     día 39.
 *   · **El contador decía «13 de 64» con 27 videos cargados**, porque los 14
 *     de Javo vienen por archivo atados a su día y el Tablero los buscaba por
 *     el código de la pieza.
 *
 * ═══ CONTRA SU PROPIO FALLO ═══
 *
 * Se pone roja si `claveEnElCamino` vuelve a devolver el código de la pieza,
 * si una fila muestra un día que no es el de su pieza, si el contador deja de
 * ver lo ya cargado, si una clave vieja deja de traducirse, o si aparece un
 * día con dos piezas que no lo declara.
 */
import { filasDeGrabacion, claveEnElCamino, clavesLegadas, codigosQueLeeElCamino } from '../src/lib/elTableroDeGrabacion';
import { mapaConLaBase, enlacesPorClave, VIDEOS_POR_JORNADA } from '../src/lib/videosCargados';
import { roadmap, SEED_ROADMAP_V2, diaDelCodigo } from '../src/lib/roadmapSeed';
import { videoDeCadaJornada } from '../src/lib/videosCargados';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`✗ ${m}`); };

const PRUEBA = 'ZZZZZZZZZZZ';
const URL = `https://youtu.be/${PRUEBA}`;

/** Lo que el cliente ve en el día `dia` después de pegar un enlace. */
function loQueVeElCliente(base: Array<{ pilar_id: string | null; youtube_url: string | null }>) {
  const mapa = mapaConLaBase(base, clavesLegadas());
  const pilares = videoDeCadaJornada(SEED_ROADMAP_V2, mapa);
  const porDia = new Map<number, string | null>();
  for (const p of pilares) for (const m of p.metas) porDia.set(m.dia_asignado, m.video_youtube_id);
  return { porDia, mapa };
}

const filas = filasDeGrabacion();

/* ── 1 · LO QUE DE VERDAD IMPORTA · pegar un enlace llega al cliente ──
 *
 * Fila por fila: se pega el enlace donde el Tablero lo guardaría y se mira la
 * jornada de ese día con la función del Camino. Si no aparece, ese video no
 * existe para nadie.
 */
const ciegas: string[] = [];
const enElDiaEquivocado: string[] = [];
for (const f of filas) {
  if (!f.clave) { mal(`la fila ${f.codigo} (día ${f.dia}) no tiene clave en el Camino`); continue; }
  const { porDia, mapa } = loQueVeElCliente([{ pilar_id: f.clave, youtube_url: URL }]);
  if (f.quien === 'Lupe') {
    // El Camino pide el paso a paso por su propio código.
    if (mapa[f.codigo] !== PRUEBA) ciegas.push(`${f.codigo} (día ${f.dia}, Lupe)`);
    continue;
  }
  if (porDia.get(f.dia) !== PRUEBA) { ciegas.push(`${f.codigo} (día ${f.dia})`); continue; }
  // Y en NINGÚN otro día: una clave que coincide con la jornada de otro día
  // mete el video en la sesión equivocada.
  const otros = [...porDia.entries()].filter(([d, v]) => v === PRUEBA && d !== f.dia).map(([d]) => d);
  if (otros.length) enElDiaEquivocado.push(`${f.codigo} (día ${f.dia}) aparece además el día ${otros.join(', ')}`);
}
if (ciegas.length) {
  mal(`${ciegas.length} de ${filas.length} filas guardan el enlace donde el Camino no lo busca:`);
  for (const c of ciegas.slice(0, 8)) console.log(`    ${c}`);
}
if (enElDiaEquivocado.length) {
  mal(`${enElDiaEquivocado.length} fila(s) llevan el video a un día que no es el suyo:`);
  for (const c of enElDiaEquivocado.slice(0, 8)) console.log(`    ${c}`);
}

/* ── 2 · La fila dice el día de SU pieza, no el de un código parecido ── */
const diaDePieza = new Map<string, number>(roadmap.piezas.map((p) => [p.codigo, p.dia]));
const diaDeTuto = new Map<string, number>(roadmap.tutoriales.map((t) => [t.codigo, t.dia]));
for (const f of filas) {
  // Las filas que no son una pieza ni un tutorial son las jornadas que ya
  // tienen video y ninguna pieza nombra: su día sale del código mismo.
  const real = f.quien === 'Javo'
    ? (diaDePieza.get(f.codigo) ?? (f.codigo === f.clave ? diaDelCodigo(f.codigo) ?? undefined : undefined))
    : diaDeTuto.get(f.codigo);
  if (real === undefined) { mal(`la fila ${f.codigo} no existe en el seed`); continue; }
  if (real !== f.dia) mal(`la fila ${f.codigo} dice día ${f.dia} y su pieza es del día ${real}`);
  if (!(f.dia > 0)) mal(`la fila ${f.codigo} sale sin día`);
}

/* ── 3 · El contador ve lo que YA está cargado ──
 *
 * 27 videos cargados por archivo. El Tablero decía 13 porque buscaba los 14 de
 * Javo por el código de la pieza y el archivo los tiene por día.
 */
const delArchivo = enlacesPorClave();
const conEnlace = filas.filter((f) => delArchivo[f.clave]);
const cargadosEnElArchivo = Object.keys(VIDEOS_POR_JORNADA).length;
const clavesVistas = new Set(filas.map((f) => f.clave));
const huerfanos = Object.keys(delArchivo).filter((c) => !clavesVistas.has(c));
if (huerfanos.length) mal(`${huerfanos.length} enlace(s) del archivo no caen en ninguna fila: ${huerfanos.join(' ')}`);
// Dos piezas del mismo día comparten clave, así que las filas con tilde pueden
// ser más que los videos; lo que no puede pasar es que sean menos.
if (conEnlace.length < cargadosEnElArchivo) {
  mal(`el Tablero muestra ${conEnlace.length} filas con enlace y el archivo tiene ${cargadosEnElArchivo} videos cargados`);
}

/* ── 4 · Una clave vieja sigue valiendo ──
 *
 * Lo que alguien pegó antes de este turno está guardado con el código de la
 * pieza. Se traduce al leer: no hace falta migrar la base, y nada se pierde.
 */
const legados = clavesLegadas();
const delCamino = codigosQueLeeElCamino();
if (Object.keys(legados).length === 0) mal('no hay ninguna clave vieja traducida: un enlace ya pegado se perdería');
const traducibles = filas.filter((x) => x.quien === 'Javo' && diaDePieza.has(x.codigo) && !delCamino.has(x.codigo));
if (traducibles.length < 30) mal(`sólo ${traducibles.length} claves viejas se pueden traducir, y eran 34`);
for (const f of traducibles) {
  const { porDia } = loQueVeElCliente([{ pilar_id: f.codigo, youtube_url: URL }]);
  if (porDia.get(f.dia) !== PRUEBA) mal(`un enlace guardado con la clave vieja «${f.codigo}» ya no llega al día ${f.dia}`);
}
/*
 * Y los nueve códigos de pieza que además son el código de la jornada de otro
 * día NO se traducen: la clave vieja y la nueva son la misma cosa escrita
 * igual, y desviar el video es peor que dejarlo donde cayó.
 */
for (const f of filas.filter((x) => x.quien === 'Javo' && delCamino.has(x.codigo))) {
  if (legados[f.codigo]) mal(`«${f.codigo}» es el código de una jornada y se está traduciendo: desvía el video de ese día`);
}

/* ── 5 · Los días con dos piezas lo declaran ──
 *
 * El Camino muestra un video por jornada. Si dos piezas caen el mismo día, la
 * segunda pisa a la primera: el Tablero tiene que decirlo.
 */
const piezasPorDia = new Map<number, string[]>();
for (const p of roadmap.piezas) piezasPorDia.set(p.dia, [...(piezasPorDia.get(p.dia) ?? []), p.codigo]);
for (const f of filas.filter((x) => x.quien === 'Javo')) {
  const esperado = (piezasPorDia.get(f.dia) ?? []).filter((c) => c !== f.codigo).sort().join(' ');
  const dice = [...f.comparteCon].sort().join(' ');
  if (esperado !== dice) mal(`la fila ${f.codigo} (día ${f.dia}) comparte con «${esperado}» y declara «${dice}»`);
}

/* ── 6 · Ningún código repetido entre filas ──
 *
 * El Tablero usa `codigo` como identidad de la fila en pantalla —qué fila está
 * abierta, cuál se está editando—. Dos filas con el mismo código abren las dos
 * a la vez y guardan una sobre la otra.
 */
const vistos = new Set<string>();
for (const f of filas) {
  if (vistos.has(f.codigo)) mal(`el código «${f.codigo}» aparece en dos filas del Tablero`);
  vistos.add(f.codigo);
}

/* ── 7 · La clave de un paso a paso es su propio código ── */
for (const t of roadmap.tutoriales) {
  const c = claveEnElCamino({ codigo: t.codigo, dia: t.dia, quien: 'Lupe' });
  if (c !== t.codigo) mal(`el paso a paso ${t.codigo} se guardaría con «${c}» y el Camino lo pide por «${t.codigo}»`);
}

if (!fallas) {
  const compartidos = [...piezasPorDia.entries()].filter(([, v]) => v.length > 1);
  console.log(`✓ las ${filas.length} filas del Tablero guardan donde el Camino mira`);
  console.log(`    ${roadmap.piezas.length} piezas de Javo + ${roadmap.tutoriales.length} pasos a paso de Lupe`);
  console.log(`    ${conEnlace.length} filas con enlace · ${cargadosEnElArchivo} videos cargados en el archivo`);
  console.log(`    ${Object.keys(legados).length} claves viejas traducidas al leer`);
  console.log(`    ${compartidos.length} día(s) con dos piezas, declarados: ${compartidos.map(([d]) => d).join(' ')}`);
}
process.exit(fallas ? 1 : 0);
