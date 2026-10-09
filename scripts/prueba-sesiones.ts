/**
 * LAS SESIONES CON PERSONAS — lo que sostiene la promesa.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * Lo que se vende es acompañamiento: la sesión de arranque y las mentorías
 * grupales tres veces por semana durante 90 días. Era **lo único de la oferta
 * que no dejaba rastro en la app**: no había tabla, ni pantalla, ni registro de
 * una sola sesión.
 *
 * Lo más parecido que existía, «Cargar sesión», guarda las DECISIONES de una
 * sesión. Si una sesión no produjo una decisión, no quedaba nada — y el hecho
 * de que ocurrió es lo que sostiene la garantía y lo único que el cliente puede
 * ver de lo que compró.
 *
 * Correr con: npx tsx scripts/prueba-sesiones.ts
 */
import { readFileSync } from 'node:fs';
import {
  leToca, diasSinSesion, seEstaCayendo, cuantasDe, comoViene, loQueSeLeDebe,
  queIncluye, ordenadas, ultima, enPalabras, COMO_SE_LLAMA,
  loQuePrometimos, cumplimosNuestraParte, SEMANAS_DEL_CAMINO, type Sesion,
} from '../src/lib/sesionesHumanas';
import { cierreDeCuentas, veredictoDeGarantia, loQueLeDimos } from '../src/lib/cierreDeCuentas';
import { filaDe } from '../src/lib/semaforo';
import { fijarVentanas } from '../src/lib/ventanaSinSoporte';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

fijarVentanas([]);

const sesion = (fecha: string, tipo: Sesion['tipo'] = 'grupal'): Sesion =>
  ({ fecha, tipo, quien_la_dio: 'Lupe' });

// ── 1 · Lo que le toca según lo que contrató ───────────────────────────────
console.log('══ lo que incluye cada escalón ══');
ok(leToca('ascenso').grupalesPorSemana === 3,
  'El Ascenso son tres mentorías grupales por semana');
ok(leToca('ascenso').arranque, 'y la sesión de arranque');
ok(leToca('base').grupalesPorSemana === 0 && leToca('base').unoAUnoEnTotal === 3,
  'La Base son tres uno a uno, una por mes, sin grupales');
ok(!leToca('base').arranque, 'y no incluye la de arranque');
ok(leToca('instalacion').unoAUnoEnTotal === 1,
  'La Instalación, una sola: lo demás lo monta el equipo por él');
ok(leToca(null).grupalesPorSemana === 0,
  'sin marcar se cuenta como La Base, que es el escalón más bajo');
ok(/tres mentorías grupales por semana/.test(queIncluye('ascenso')),
  `y se dice como se vendió: "${queIncluye('ascenso')}"`);

// ── 2 · Hace cuánto que no tiene una ───────────────────────────────────────
console.log('\n══ hace cuánto que no tiene una ══');
ok(diasSinSesion([], '2026-10-09') === null,
  'quien no tuvo ninguna no está atrasado: todavía no empezó');
ok(diasSinSesion([sesion('2026-10-09')], '2026-10-09') === 0, 'una de hoy son cero días');
ok(diasSinSesion([sesion('2026-10-02')], '2026-10-09') === 7, 'y una de hace una semana, siete');
ok(diasSinSesion([sesion('2026-09-01'), sesion('2026-10-05')], '2026-10-09') === 4,
  'cuenta desde la más reciente, no desde la primera');

console.log('\n══ cuándo se está cayendo el acompañamiento ══');
ok(!seEstaCayendo([], 'ascenso', '2026-10-09'),
  'sin ninguna sesión no se marca: es otra cosa, no un atraso');
ok(!seEstaCayendo([sesion('2026-10-02')], 'ascenso', '2026-10-09'),
  'una semana sin grupal no es una alarma: se salta por mil razones legítimas');
ok(seEstaCayendo([sesion('2026-09-20')], 'ascenso', '2026-10-09'),
  'tres semanas sin ninguna, sí');
ok(!seEstaCayendo([sesion('2026-09-20')], 'base', '2026-10-09'),
  'y a La Base, que es una por mes, los mismos días no la marcan');

// ── 3 · La línea que lee el equipo ─────────────────────────────────────────
console.log('\n══ la línea de la ficha ══');
ok(/arranque/.test(comoViene([], 'ascenso', '2026-10-09')),
  `sin ninguna, dice qué le falta primero: "${comoViene([], 'ascenso', '2026-10-09')}"`);
ok(/La última, hoy/.test(comoViene([sesion('2026-10-09')], 'ascenso', '2026-10-09')),
  'con una de hoy lo dice en esas palabras');
ok(/La última, ayer/.test(comoViene([sesion('2026-10-08')], 'ascenso', '2026-10-09')),
  'y con una de ayer, también');
const cae = comoViene([sesion('2026-09-10')], 'ascenso', '2026-10-09');
ok(/dejando de recibir lo que compró/.test(cae),
  `cuando se cae lo dice sin vueltas: "${cae}"`);
ok(!/undefined|NaN|null/.test(cae + comoViene([], 'base', '2026-10-09')),
  'sin agujeros en el texto');

console.log('\n══ lo que el equipo todavía le debe ══');
ok(loQueSeLeDebe([], 'ascenso').some((x) => /arranque/.test(x)),
  'a quien no tuvo su arranque, se lo debemos');
ok(loQueSeLeDebe([sesion('2026-10-01', 'arranque'), sesion('2026-10-02', 'uno_a_uno')], 'ascenso').length === 0,
  'con el arranque y su uno a uno, no se le debe nada de eso');
ok(loQueSeLeDebe([], 'base').some((x) => /3 sesiones/.test(x)),
  'a La Base se le deben las tres uno a uno');
ok(cuantasDe([sesion('2026-10-01', 'grupal'), sesion('2026-10-03', 'grupal')], 'grupal') === 2,
  'y se cuentan por tipo');

// ── 4 · El orden ───────────────────────────────────────────────────────────
console.log('\n══ el orden ══');
const varias = [sesion('2026-09-01'), sesion('2026-10-05'), sesion('2026-09-20')];
ok(ordenadas(varias)[0].fecha === '2026-10-05', 'la más nueva primero');
ok(ultima(varias)?.fecha === '2026-10-05', 'y esa es la última');
ok(ultima([]) === null, 'sin sesiones no hay última');
ok(enPalabras('2026-10-09') === '9 de octubre', 'la fecha como la diría una persona');
ok(COMO_SE_LLAMA.grupal === 'Mentoría grupal', 'cada tipo tiene su nombre');

// ── 5 · El semáforo lo marca ───────────────────────────────────────────────
console.log('\n══ el semáforo avisa antes de perderlo ══');
const todasCerradas = new Set<string>(
  SEED_ROADMAP_V2.flatMap((p) => p.metas.map((m) => `${p.numero}-${m.codigo}`)),
);
const alDia = {
  id: 'x', nombre: 'Ana', fecha_inicio: '2026-07-06',
  completadas: todasCerradas, ultimoIngreso: '2026-10-09',
  numeros: [], servicio: 'ascenso',
};

const abandonado = filaDe({ ...alDia, sesiones: [sesion('2026-09-10')] }, '2026-10-09');
ok(abandonado.color === 'amarillo', 'quien dejó de recibir sus sesiones se enciende en amarillo');
ok(/no tiene una sesión/.test(abandonado.porque),
  `y dice por qué: "${abandonado.porque}"`);
ok(abandonado.diasSinSesion === 29, 'con el número de días adentro');

const acompanado = filaDe({ ...alDia, sesiones: [sesion('2026-10-07')] }, '2026-10-09');
ok(!/sesión/.test(acompanado.porque), 'a quien sí las recibe no se lo molesta por esto');

const reciente = filaDe({ ...alDia, sesiones: [] }, '2026-10-09');
ok(reciente.diasSinSesion === null,
  'y a quien todavía no tuvo ninguna no se lo marca: es otra conversación');

// ── 6 · Dónde vive ─────────────────────────────────────────────────────────
console.log('\n══ dónde vive ══');
const lib = readFileSync('src/lib/sesionesHumanas.ts', 'utf-8');
const datos = readFileSync('src/lib/sesionesDatos.ts', 'utf-8');
const admin = readFileSync('src/pages/Admin.tsx', 'utf-8');
const cargar = readFileSync('src/components/admin/CargarSesionHumana.tsx', 'utf-8');
const ficha = readFileSync('src/components/admin/AcompanamientoDelCliente.tsx', 'utf-8');
const delCliente = readFileSync('src/components/MisSesiones.tsx', 'utf-8');
const tablero = readFileSync('src/pages/Dashboard.tsx', 'utf-8');
const mig = readFileSync('supabase/migrations/20261013_sesiones_humanas.sql', 'utf-8');

ok(!/from '\.\/supabase'/.test(lib), 'la regla se prueba sola: no toca la base');
ok(/from '\.\/supabase'/.test(datos), 'y el que habla con la base está aparte');
ok(/\.in\('cliente_id', clienteIds\)/.test(datos),
  'trae a todos en una sola consulta, no una por cliente');

ok(/<CargarSesionHumana/.test(admin), 'el equipo las carga');
ok(/<AcompanamientoDelCliente/.test(admin), 'y las ve en la ficha de cada cliente');
ok(/<MisSesiones/.test(tablero), 'y el cliente ve las suyas en su tablero');
ok(/sesiones: sesionesPorCliente\[c\.id\]/.test(admin),
  'el semáforo las recibe: sin eso la señal no se enciende nunca');

ok(/rpc\('cargar_sesion'/.test(datos),
  'se carga en una sola operación');
ok(/Una sesión sin asistentes no dice nada/.test(datos) && /Una sesión sin asistentes/.test(mig),
  'y una sesión sin asistentes se rechaza en los dos lados: un registro que dice que algo pasó sin decir a quién es peor que no tenerlo');
ok(/tipo !== 'grupal'/.test(cargar),
  'en una sesión individual elegir otra persona reemplaza, no suma');

console.log('\n══ la base ══');
ok(/create table if not exists public\.sesiones/.test(mig), 'la tabla existe');
ok(/sesiones_asistentes/.test(mig), 'y la de asistentes, porque una grupal tiene varios');
ok(/asistio boolean not null default true/.test(mig),
  'se guarda también quien faltó: faltar tres veces seguidas dice algo');
ok(/sesiones_cliente_lee_las_suyas/.test(mig), 'el cliente ve las suyas');
ok(/asistentes_cliente_ve_su_fila/.test(mig) && /cliente_id = auth\.uid\(\)/.test(mig),
  'y solo su fila: en una grupal no tiene por qué saber quiénes fueron los demás');
ok(/Solo el equipo puede cargar una sesión/.test(mig), 'las carga el equipo');
ok(!/guardarSesion|cargarSesion/.test(ficha) && !/cargar_sesion/.test(delCliente),
  'ni la ficha ni la pantalla del cliente las escriben: solo leen');

// ── 7 · La mitad de la garantía que era NUESTRA ───────────────────────────
//
// El cierre de cuentas verificaba con datos lo que el CLIENTE entregó
// —jornadas y atrasos— y daba por hecho lo que le dimos nosotros. Si él
// cumplió y el equipo no dio las sesiones, la garantía corre a nuestro cargo,
// y nadie se iba a enterar: el único número a la vista era el suyo.
console.log('\n══ la mitad de la garantía que era nuestra ══');
ok(loQuePrometimos('ascenso') === 1 + 3 * SEMANAS_DEL_CAMINO + 1,
  `El Ascenso son ${loQuePrometimos('ascenso')} sesiones en los 90 días: el arranque, tres grupales por semana y su uno a uno`);
ok(loQuePrometimos('base') === 3, 'La Base, tres');
ok(loQuePrometimos('instalacion') === 2, 'La Instalación, el arranque y una uno a uno');

const muchas = Array.from({ length: 31 }, (_, i) => sesion(`2026-10-${String((i % 28) + 1).padStart(2, '0')}`));
ok(cumplimosNuestraParte(muchas, 'ascenso'),
  `con ${muchas.length} de ${loQuePrometimos('ascenso')} se cumple: una grupal que se cae por un feriado no rompe la promesa`);
ok(!cumplimosNuestraParte(muchas.slice(0, 20), 'ascenso'),
  'con 20 no: ahí el cliente recibió visiblemente menos de lo que compró');
ok(cumplimosNuestraParte([], 'base') === false, 'y a quien no le dimos ninguna, no le cumplimos');

const cierre = cierreDeCuentas(new Set(), '2026-07-06', {}, [], 'ascenso');
ok(cierre.cumplimosNuestraParte === false, 'el cierre de cuentas lo mide');
ok(/Te dimos 0 de las 38 sesiones/.test(veredictoDeGarantia(cierre)),
  `y el veredicto lo dice ANTES de pedirle cuentas al cliente: "${veredictoDeGarantia(cierre)}"`);
ok(/La garantía corre/.test(veredictoDeGarantia(cierre)),
  'porque en ese caso corre igual y no hay nada que reclamarle');

const sinConsultar = cierreDeCuentas(new Set(), '2026-07-06', {});
ok(sinConsultar.cumplimosNuestraParte === null,
  'NO SABER no es no haber cumplido: sin las sesiones a la vista no se mide');
ok(!/Te dimos/.test(veredictoDeGarantia(sinConsultar)),
  'y el veredicto no le anuncia a nadie que la garantía corre por una consulta que no se hizo');
ok(/todavía no se consultaron/.test(loQueLeDimos(sinConsultar)),
  `la ficha lo dice así: "${loQueLeDimos(sinConsultar)}"`);

const cumplido = cierreDeCuentas(new Set(), '2026-07-06', {}, muchas, 'ascenso');
ok(/Cumplimos/.test(loQueLeDimos(cumplido)), 'y cuando cumplimos, también se dice');

const fichaGarantia = readFileSync('src/components/admin/AcompanamientoDelCliente.tsx', 'utf-8');
ok(/cumplimosNuestraParte\(sesiones, servicio\)/.test(fichaGarantia),
  'el equipo lo ve en la ficha de cada cliente, no al final de los 90 días');
const cierrePantalla = readFileSync('src/components/CierreDelCamino.tsx', 'utf-8');
ok(/loQueLeDimos\(c\)/.test(cierrePantalla), 'y el cliente lo ve en su cierre');
ok(/useState<Sesion\[\] \| null>\(null\)/.test(cierrePantalla),
  'arrancando en null: con [] el cierre leería «te dimos 0 de 38» en el primer render de todo el mundo');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
