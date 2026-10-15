/**
 * LOS NOVENTA DÍAS, ALINEADOS.
 *
 * ═══ QUÉ SE PROTEGE ═══
 *
 * Seis cosas que hacían que el cliente no pudiera llegar solo del punto A al
 * punto B, y que ahora están cerradas:
 *
 *   1. El calendario mandaba sobre el avance, así que a quien se atrasaba la
 *      app le hablaba de un camino que no era el suyo.
 *   2. Encender las campañas no cambiaba nada en la app.
 *   3. Las entregas del equipo estaban escritas y nadie las disparaba.
 *   4. Del día 50 al 90 el Camino casi no tenía contenido.
 *   5. Campañas ocupaba un destino un tercio del programa sin servir.
 *   6. El cliente no podía leer sus propios números.
 *
 * Correr con: npx tsx scripts/prueba-noventa-dias.ts
 */
import { readFileSync } from 'node:fs';
import { dondeVa, yaLlegoAlDia, faltaParaLlegar } from '../src/lib/diaPrograma';
import { diaDeLaProximaJornada, SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { destinoQueCambia, DIA_EN_QUE_EMPIEZA_CAMPANAS } from '../src/lib/destinoDelMomento';
import { ENTREGAS, entregaPendiente, avisoAlCliente, tareaDelEquipo } from '../src/lib/entregasDelEquipo';
import { rubricaDe } from '../src/lib/rubricas';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/**
 * Una fecha de inicio que deja hoy en el día N, contada en LOCAL.
 *
 * Estaba con `toISOString()`, que da UTC: en UTC−3, de las 21:00 en adelante
 * la fecha saltaba al día siguiente y el cálculo daba uno menos. O sea que la
 * prueba pasaba de mañana y fallaba de noche, sin que nada hubiera cambiado.
 */
const fechaLocalISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const inicioParaDia = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return fechaLocalISO(d);
};

// ── 1 · El día lo marca el trabajo ─────────────────────────────────────────
console.log('══ el día que manda ══');
const alDia = dondeVa(inicioParaDia(31), 31);
ok(alDia.diaDeTrabajo === 31 && alDia.alDia,
  'quien va al día ve el mismo número en el calendario y en el trabajo');

const atrasado = dondeVa(inicioParaDia(31), 15);
ok(atrasado.diaDeCalendario === 31, 'el calendario sigue diciendo 31');
ok(atrasado.diaDeTrabajo === 15, 'pero el día que manda es el 15: el de su próxima sesión');
ok(!atrasado.alDia && atrasado.diferencia > 0, 'y sabe cuántos días hábiles lleva de diferencia');
ok(!yaLlegoAlDia(atrasado, 29),
  'así que NO se le abre el montaje: leía «enciende tus campañas» sin tener la página');
ok(yaLlegoAlDia(alDia, 29), 'y a quien sí llegó, se le abre');

const adelantado = dondeVa(inicioParaDia(20), 31);
ok(yaLlegoAlDia(adelantado, 29),
  'quien adelantó trabajo no espera al almanaque: se ganó lo que se ganó');

const terminado = dondeVa(inicioParaDia(90), null);
ok(terminado.diaDeTrabajo === 90 && terminado.alDia,
  'sin próxima jornada, terminó el Camino y manda el calendario');

console.log('\n══ lo que se le dice al que falta ══');
ok(/sesiones/.test(faltaParaLlegar(atrasado, 29)),
  'se cuenta por SESIONES: «faltan 3 días» no depende de él, «faltan 3 sesiones» se puede hacer hoy');
ok(/día 15/.test(faltaParaLlegar(atrasado, 29)),
  'y le dice cuál es su próxima');
ok(faltaParaLlegar(alDia, 29) === '', 'a quien ya llegó no se le dice nada');
ok(!/atras|retras|tarde/i.test(faltaParaLlegar(atrasado, 29)),
  'y en positivo: nunca «vas N días atrasado»');

// ── 2 · La próxima jornada sale de lo cerrado ──────────────────────────────
console.log('\n══ cuál es su próxima jornada ══');
ok(diaDeLaProximaJornada(new Set()) === 1, 'sin nada cerrado, la próxima es la del día 1');
const todas = new Set<string>();
for (const p of SEED_ROADMAP_V2) for (const m of p.metas) todas.add(`${p.numero}-${m.codigo}`);
ok(diaDeLaProximaJornada(todas) === null, 'con todo cerrado, no hay próxima');

// ── 3 · El destino que cambia ──────────────────────────────────────────────
console.log('\n══ el cuarto destino ══');
ok(destinoQueCambia(dondeVa(inicioParaDia(10), 10)).id === 'adn',
  'antes de montar, ese lugar lo ocupa Mi ADN: es lo que está construyendo');
ok(destinoQueCambia(dondeVa(inicioParaDia(31), 29)).id === 'campanas',
  'y el día que le toca montar, se convierte en Campañas');
ok(destinoQueCambia(null).id === 'campanas',
  'sin saber dónde va, manda Campañas: mejor de más que un lugar vacío mientras carga');
ok(DIA_EN_QUE_EMPIEZA_CAMPANAS === 29, 'el día está en una sola constante');

const nav = codigoDe('src/components/BottomTabBar.tsx');
const lat = codigoDe('src/components/Sidebar.tsx');
ok(/destinoQueCambia/.test(nav) && /destinoQueCambia/.test(lat),
  'las dos navegaciones preguntan lo mismo, así que dicen lo mismo');

// ── 4 · Las entregas del equipo ────────────────────────────────────────────
console.log('\n══ las entregas ══');
ok(ENTREGAS.length === 3, 'son tres: el alta, los sitios, y las automatizaciones');
ok(ENTREGAS.every((e) => e.queSeEntrega.length >= 3 && e.queDesbloquea.trim()),
  'cada una dice qué se instala y qué va a poder hacer el cliente cuando esté');
ok(entregaPendiente(5, []) !== null && entregaPendiente(5, [])!.dia === 0,
  'quien va por el día 5 tiene pendiente el alta');
ok(entregaPendiente(5, [0]) === null,
  'y con el alta hecha, nada más hasta el día 11');
ok(entregaPendiente(12, [0])!.dia === 11, 'en el día 12 toca la entrega 2');
ok(entregaPendiente(31, [0, 11])!.dia === 29, 'y en el 31, la 3');

const av = avisoAlCliente(ENTREGAS[1]);
ok(av.titulo.includes('Entrega 2') && /vas a poder/.test(av.descripcion),
  'al cliente se le dice qué recibe y qué va a poder hacer');
const tr = tareaDelEquipo(ENTREGAS[2], 'Rosana');
ok(tr.titulo.startsWith('Rosana') && tr.descripcion.includes('WhatsApp'),
  'y al equipo le llega ejecutable, con el nombre adelante');

const cron = codigoDe('api/cron/alarmas-inactividad.ts');
ok(/entregaPendiente\(diaDeTrabajo/.test(cron),
  'el cron las dispara por el día del TRABAJO: montarle los formularios a quien no escribió su oferta es trabajo que se hace dos veces');
ok(/clave: `entrega-\$\{e\.dia\}`/.test(cron),
  'y queda la clave, para que no salga dos veces');
ok(/crear_tarea_del_sistema/.test(cron),
  'la tarea entra en la lista de quien la tiene que hacer');

// ── 5 · La segunda mitad del Camino ────────────────────────────────────────
console.log('\n══ los días 50 al 90 ══');
const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as {
  jornadas: Array<{ dia: number; tipo: string; minutos: number; titulo: string; pasos: string[] }>;
};
const tramo = seed.jornadas.filter((j) => j.dia >= 50 && j.dia <= 90);
const campo = tramo.filter((j) => j.tipo === 'campo').length;
const minutos = tramo.reduce((t, j) => t + (j.minutos || 0), 0);
ok(campo <= 12, `quedan ${campo} días sin sesión (eran 24)`);
ok(minutos >= 1000, `${minutos} minutos de trabajo en el tramo (eran 735)`);
// Las doce que entraron en días que estaban vacíos. Las que ya existían no se
// miden con esta vara: la del día 86 son noventa minutos a propósito.
const DIAS_NUEVOS = [51, 53, 54, 58, 60, 61, 65, 67, 68, 72, 74, 79];
const nuevas = tramo.filter((j) => DIAS_NUEVOS.includes(j.dia));
ok(nuevas.length === 12, `entraron las doce (${nuevas.length})`);
ok(nuevas.every((j) => j.tipo === 'sesion' && j.pasos.length >= 3),
  'cada una trae sus pasos: una sesión sin pasos es un título');

// Los días de atender no se llenan del todo: la promesa es cuatro horas y diez
// consultantes, y ocuparle los cinco días rompe lo que el programa vino a
// arreglar.
ok(nuevas.every((j) => (j.minutos || 0) <= 30),
  'y ninguna pasa de media hora: son días de atender, no de construir');
ok(tramo.filter((j) => j.tipo === 'campo').length >= 10,
  'y quedan días enteros libres para atender');

console.log('\n══ y cada una se puede juzgar ══');
for (const cod of ['P9B.d53', 'P9B.d58', 'P9B.d61', 'P9B.d67', 'P9B.d79']) {
  const r = rubricaDe(cod);
  ok(!!r && r.criterios.length >= 3 && !!r.descalificador && !!r.donde_se_arregla,
    `${cod}: criterios, descalificador y a dónde se manda si no sale`);
}

// ── 6 · El cambio de etapa ─────────────────────────────────────────────────
console.log('\n══ el día que enciende ══');
const dash = codigoDe('src/pages/Dashboard.tsx');
const tab = codigoDe('src/components/TableroDeLaSemana.tsx');
const mont = codigoDe('src/components/campanas/MontajeCupos.tsx');
ok(/yaEncendio\(\)/.test(dash) && /<TableroDeLaSemana/.test(dash),
  'la pantalla de Hoy abre con sus números desde que enciende');
ok(/paises=\{paisesDelCliente\}/.test(dash),
  'y juzga el costo contra la banda de SUS países, no la de México');
ok(/encontrarDomino\(cadena\)/.test(tab),
  'con la frase que dice dónde se corta: seis números sin eso son seis números');
ok(/PanelDeCeremonia/.test(mont) && /Cambia tu etapa/.test(mont),
  'y el momento está marcado: hasta hoy construiste, desde hoy sostienes');

const mig = readFileSync('supabase/migrations/20261021_sus_numeros_son_suyos.sql', 'utf-8');
ok(/cliente_id = auth\.uid\(\)/.test(mig),
  'el cliente puede leer sus propios números: la tabla solo la leía el equipo');
ok(/Cada uno carga sus propios números/.test(mig),
  'y no puede escribirle los números a otro');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
