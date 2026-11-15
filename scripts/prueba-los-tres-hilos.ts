/**
 * LOS TRES HILOS DE CADA DÍA, DESDE EL LADO DE LA APP.
 *
 * ═══ QUÉ SE PROTEGE ═══
 *
 * Cada día hábil tiene tres hilos: adentro (la lección del libro y la pausa
 * de 5), afuera (el paso afuera, diez minutos, opcional) y sistema (la tarea
 * de la app). El del sistema ya estaba —son los `pasos`—; los otros dos
 * entraron el 15 de noviembre.
 *
 * La batería ya mide el JSON y la pantalla (bloque 2, `#.HILOS.*`). Lo que
 * se mide ACÁ es el tramo del medio, que es donde esto se rompe: que los
 * hilos lleguen a `RoadmapMeta`, que es lo único que la pantalla del día
 * recibe. Un campo en el seed que `comoMeta` no copia es un campo que el
 * cliente no ve nunca, y no hay forma de notarlo mirando el JSON.
 *
 * Y una cosa más, medida el 15 de noviembre: la lección escrita YA existía
 * en el código —la `esencia` de los 37 guiones de `guionesVideos.ts`— y la
 * pantalla del día no la mostró nunca. Su rama solo corre cuando NO hay
 * video, y `TaskVideo` solo se monta cuando SÍ hay. Así que la lección del
 * libro no podía colgarse de ahí: va por el seed, como los días.
 *
 * Correr con: npx tsx scripts/prueba-los-tres-hilos.ts
 */
import { roadmap, jornadaPorDia, SEED_ROADMAP_V3, NOMBRE_DEL_LIBRO } from '../src/lib/roadmapSeed';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };

// ── 1 · el dato, como lo tipa la app ───────────────────────────────────────
console.log('══ el dato ══');
const jornadas = roadmap.jornadas;
ok(jornadas.length === 91, `las 91 jornadas siguen siendo 91 (son ${jornadas.length})`);
ok(jornadas.every((j) => Array.isArray(j.leccion)),
  'cada jornada trae su lista de lecciones, vacía o no: la app nunca pregunta por undefined');

const lecciones = jornadas.flatMap((j) => j.leccion);
ok(lecciones.length === 33, `las 33 lecciones del lago están (son ${lecciones.length})`);
ok(new Set(lecciones.map((l) => l.numero)).size === 33, 'ninguna repite número');
ok(lecciones.every((l) => l.titulo.length > 0 && l.freno.length > 0 && l.logro.length > 0),
  'cada lección trae título, freno y logro: sin logro no hay jugada');

const repertorio = new Set(roadmap.pausas.map((p) => p.id));
ok(repertorio.size === 14, `el repertorio de pausas tiene sus 14 (tiene ${repertorio.size})`);
ok(roadmap.pausas.every((p) => ['●', '◐', '○'].includes(p.marca) && p.base.length > 0),
  'cada pausa lleva su marca y su base: lo que no tiene marca no es un dato');
ok(lecciones.every((l) => l.pausa === null || repertorio.has(l.pausa)),
  'ninguna lección pide una pausa que no exista');

// La pausa del día sale de su primera lección que traiga una. El día 1 lee
// dos —la 1 con «seis por minuto» y la 2 sin ninguna— y se queda con la de
// la 1: si se quedara con la última, el día 1 no tendría pausa.
const d1 = jornadaPorDia.get(1)!;
ok(d1.leccion.length === 2 && d1.leccion[1].pausa === null,
  'el día 1 lee dos lecciones y la segunda no trae pausa');
ok(d1.pausa?.id === 'seis-por-minuto',
  'y el día se queda con la pausa de la primera, no con el hueco de la segunda');
ok(d1.pausa?.marca === '●', 'con su marca al lado, no el nombre solo');

// La pausa «dicha» es la de esa lección, que no siempre es el nombre pelado.
ok(jornadaPorDia.get(5)!.pausa?.dicha === 'Seis por minuto, antes de escribirlo',
  'y la dice como la dice su lección: «antes de escribirlo», el día del precio');

// ── 2 · el paso afuera ─────────────────────────────────────────────────────
console.log('══ el paso afuera ══');
const conAfuera = jornadas.filter((j) => j.paso_afuera);
ok(conAfuera.length === 28, `los 28 días sin nada visible traen su paso afuera (son ${conAfuera.length})`);
ok(conAfuera.every((j) => j.acciones_campo.length === 0),
  'y ninguno cae en un día que ya pide salir al mundo: exponerse se entrena donde no está pedido');
ok(jornadas.filter((j) => !j.paso_afuera).length === 63,
  'los otros 63 vienen sin nada: la app no anuncia lo que falta');

// ── 3 · el tramo del medio: que lleguen a la pantalla ──────────────────────
console.log('══ de la jornada a la pantalla ══');
const metas = SEED_ROADMAP_V3.flatMap((p) => p.metas);
ok(metas.length === 91, `las 91 jornadas siguen llegando como metas (son ${metas.length})`);
const porDia = new Map(metas.map((m) => [m.dia_asignado, m]));

for (const dia of [1, 5, 13, 40, 74, 90]) {
  const j = jornadaPorDia.get(dia)!;
  const m = porDia.get(dia)!;
  ok(m.leccion.length === j.leccion.length && m.leccion.every((l, i) => l.numero === j.leccion[i].numero),
    `el día ${dia} le pasa su lección a la pantalla`);
  ok((m.pausa?.id ?? null) === (j.pausa?.id ?? null), `y su pausa`);
  ok((m.paso_afuera ?? null) === (j.paso_afuera ?? null), `y su paso afuera`);
}

const metasConLeccion = metas.filter((m) => m.leccion.length > 0);
ok(metasConLeccion.length === 27,
  `los 27 días con lección llegan con ella (llegan ${metasConLeccion.length})`);
ok(metas.filter((m) => m.paso_afuera).length === 28,
  'y los 28 con paso afuera, también');

// ── 4 · el nombre del libro ────────────────────────────────────────────────
console.log('══ el nombre del libro ══');
ok(NOMBRE_DEL_LIBRO.lago === 'El lago',
  'el lago se nombra como en los libros y en la home, no por su id');
ok(new Set(lecciones.map((l) => l.libro)).size === 1 && lecciones[0].libro === 'lago',
  'hoy solo hay lecciones del lago: las otras cuatro tablas las pasa LIBROS al cerrar cada libro');
ok(Object.keys(NOMBRE_DEL_LIBRO).length === 5,
  'y los cinco nombres ya están puestos, para que la primera que llegue no se vea como un id');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
