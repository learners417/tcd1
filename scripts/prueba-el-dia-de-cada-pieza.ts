/**
 * EL DÍA DE CADA PIEZA SALE DEL CAMINO
 *
 * ═══ QUÉ MIRA ═══
 *
 * La pregunta es la de la fila al revés. El turno 12 preguntó «si Javo pega un
 * enlace en esta fila, ¿el cliente lo ve, y en el día que dice la fila?», y la
 * dejó cerrada. Lo que nadie preguntó es si **el día que dice la fila es el día
 * en que el Camino pide esa pieza**, porque ese día salía de otra lista.
 *
 * Acá se recorre al revés: pieza por pieza de las que el Camino declara, se
 * pega el enlace donde el Tablero lo guardaría y se exige que aparezca **en el
 * día de la jornada que la pide**, con las funciones de verdad de los dos
 * lados.
 *
 * ═══ QUÉ ENCONTRÓ (16 de noviembre de 2026) ═══
 *
 * El día de cada pieza estaba escrito a mano en `PIEZAS`, dentro de
 * `generar_seed.py`, y el Camino se reordenó el 24 de septiembre sin tocar esa
 * lista. Medido con las funciones reales, antes de tocar nada:
 *
 *   · **35 de las 43 piezas** tenían en el catálogo un día que el Camino
 *     contradice. Javo grababa «Tu método propio» (P2.1), pegaba el enlace en
 *     su fila —que decía día 15— y el cliente lo veía el día 15, mientras el
 *     día 9, cuya lección es «Tu método, escrito con sus etapas», se quedaba
 *     sin video para siempre.
 *   · **Seis filas se veían cargadas con el video de otro día** y **cinco se
 *     veían vacías teniendo el suyo ya cargado**: el Tablero le mentía a Javo
 *     sobre lo que falta grabar, que es su cola de trabajo.
 *   · Los tutoriales, los grados y los entrenadores ya sacaban su día del
 *     Camino —el generador lo dice y lo hace—. Las piezas eran la única lista
 *     que seguía escribiéndolo a mano.
 *
 * ═══ CONTRA SU PROPIO FALLO ═══
 *
 * Se pone roja si una pieza del catálogo vuelve a tener un día que su jornada
 * contradice, si una pieza que el Camino declara se queda sin fila donde
 * grabarla fuera de las catorce declaradas, si aparece una pieza fichada que
 * ninguna jornada pide fuera de la declarada, o si el generador vuelve a
 * escribir el día a mano.
 */
import { readFileSync } from 'node:fs';
import { filasDeGrabacion, clavesLegadas } from '../src/lib/elTableroDeGrabacion';
import { mapaConLaBase, videoDeCadaJornada } from '../src/lib/videosCargados';
import { roadmap, SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`✗ ${m}`); };

/**
 * Las deudas conocidas, que son de Javo: los códigos que el Camino declara sin
 * ficha en el catálogo, y la pieza fichada que ninguna jornada pide. Se leen
 * DEL SEED, donde las escribe el generador después de compararlas con la
 * realidad. Una copia a mano acá sería una segunda verdad más.
 */
const DEUDAS = (JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as {
  deudas_del_catalogo: { sin_ficha: string[]; sin_jornada: string[] };
}).deudas_del_catalogo;
const SIN_FICHA = DEUDAS.sin_ficha;
const SIN_JORNADA = DEUDAS.sin_jornada;

/** El día en que el Camino pide cada pieza: la primera jornada que la declara. */
const diaEnElCamino = new Map<string, number>();
for (const j of [...roadmap.jornadas].sort((a, b) => a.dia - b.dia)) {
  for (const cod of j.piezas ?? []) if (!diaEnElCamino.has(cod)) diaEnElCamino.set(cod, j.dia);
}

const MARCA = 'ZZZZZZZZZZZ';
/** Los días en que el cliente ve el video, pegado en esa clave. */
function diasQueLoVen(clave: string): number[] {
  const mapa = mapaConLaBase([{ pilar_id: clave, youtube_url: `https://youtu.be/${MARCA}` }], clavesLegadas());
  const dias: number[] = [];
  for (const p of videoDeCadaJornada(SEED_ROADMAP_V2, mapa)) {
    for (const m of p.metas) if (m.video_youtube_id === MARCA) dias.push(m.dia_asignado);
  }
  return dias;
}

const filas = filasDeGrabacion();
const filaDe = new Map(filas.map(f => [f.codigo, f]));

/* ── 1 · El catálogo no puede contradecir al Camino ──────────────────────── */
for (const p of roadmap.piezas) {
  const real = diaEnElCamino.get(p.codigo);
  if (real === undefined) {
    if (!SIN_JORNADA.includes(p.codigo)) {
      mal(`la pieza ${p.codigo} «${p.titulo}» está fichada en el día ${p.dia} y ninguna jornada la pide: el cliente no la ve nunca`);
    }
    continue;
  }
  if (p.dia !== real) {
    mal(`${p.codigo} «${p.titulo}»: el catálogo dice día ${p.dia} y el Camino la pide el ${real}`);
  }
}

/* ── 2 · Lo que de verdad importa: la pieza llega al día de su lección ───── */
let llegan = 0;
for (const [cod, dia] of diaEnElCamino) {
  const f = filaDe.get(cod);
  if (!f) {
    if (!SIN_FICHA.includes(cod)) {
      mal(`el Camino pide ${cod} el día ${dia} y no hay fila en el Tablero donde grabarlo`);
    }
    continue;
  }
  const dias = diasQueLoVen(f.clave);
  if (!dias.includes(dia)) {
    mal(`${cod}: el Camino lo pide el día ${dia}; cargado en su fila (día ${f.dia}) aparece en ${dias.join(',') || 'ningún día'}`);
  } else llegan += 1;
}

/* ── 3 · Las dos deudas no pueden crecer en silencio ─────────────────────── */
const fichadas = new Set(roadmap.piezas.map(p => p.codigo));
const sinFicha = [...diaEnElCamino.keys()].filter(c => !fichadas.has(c)).sort();
const sinJornada = [...fichadas].filter(c => !diaEnElCamino.has(c)).sort();
if (sinFicha.join() !== [...SIN_FICHA].sort().join()) {
  mal(`los códigos sin ficha cambiaron: ${sinFicha.join(' ')} contra los declarados ${[...SIN_FICHA].sort().join(' ')}`);
}
if (sinJornada.join() !== [...SIN_JORNADA].sort().join()) {
  mal(`las piezas que ninguna jornada pide cambiaron: ${sinJornada.join(' ')} contra ${[...SIN_JORNADA].sort().join(' ')}`);
}

/* ── 4 · Y el generador no puede volver a escribir el día a mano ─────────── */
const gen = readFileSync('tcd-spec/datos/generar_seed.py', 'utf-8');
if (!/"dia"\s*:\s*DIA_DE_LA_PIEZA\.get\(c\s*,\s*d\)/.test(gen)) {
  mal('generar_seed.py ya no saca el día de la pieza del Camino (DIA_DE_LA_PIEZA): volvió a escribirlo a mano');
}
if (!/DIA_DE_LA_PIEZA\.setdefault\(_p, _d\)/.test(gen)) {
  mal('generar_seed.py no construye DIA_DE_LA_PIEZA desde las jornadas');
}

if (!fallas) {
  console.log(`✓ las ${roadmap.piezas.length} piezas fichadas tienen el día de la jornada que las pide`);
  console.log(`    ${llegan} llegan al día de su lección, medido con las funciones de los dos lados`);
  console.log(`    ${SIN_FICHA.length} códigos sin ficha y ${SIN_JORNADA.length} pieza sin jornada, declarados y sin crecer`);
}
process.exit(fallas ? 1 : 0);
