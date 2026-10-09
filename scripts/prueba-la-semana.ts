/**
 * LA SEMANA — la tabla que mentía todos los días.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * La tabla de funciones es el tablero que dice si el negocio escaló o si
 * simplemente hubo menos trabajo. Mide seis funciones y recibía datos de una:
 * la pantalla mapeaba TODO el día del equipo a «destrabar» y pasaba
 * `semanasAnteriores={[]}` fijo.
 *
 * Dos consecuencias, las dos permanentes desde que la pantalla existe:
 *
 *   · «Absorber» en cero. Es la única función con destino `crece`, y el
 *     código trata el cero en esa función como «la peor noticia de todas».
 *     La tabla acusaba de no absorber nada a un equipo que no tenía dónde
 *     registrarlo.
 *   · Sin semanas anteriores el promedio es null, el cambio es null y la
 *     columna de tendencia —lo único que esta tabla existe para mostrar— no
 *     podía decir nada nunca.
 *
 * La causa de fondo: la jornada guardaba los minutos de reloj y a quién
 * atendió, pero NO en qué trabajó. El dato no existía.
 *
 * Correr con: npx tsx scripts/prueba-la-semana.ts
 */
import { readFileSync } from 'node:fs';
import {
  repartirMinutos, porSemanas, lunesDe, tablaDeFunciones, FUNCIONES,
  type Funcion, type JornadaParaFunciones, type HitoDeAbsorcion,
} from '../src/lib/funciones';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const dia = (
  fecha: string, minutos: number, funciones: Funcion[], cerrada = true,
): JornadaParaFunciones => ({
  dia: fecha,
  fin: cerrada ? `${fecha}T18:00:00Z` : undefined,
  funciones,
  minutos,
});

// ── 1 · El reparto de los minutos ──────────────────────────────────────────
console.log('══ los minutos se reparten entre lo que se marcó ══');
const unDia = repartirMinutos([dia('2026-10-05', 300, ['destrabar', 'absorber'])]);
ok(unDia.length === 2, 'un día con dos funciones marcadas deja dos observaciones');
ok(unDia.every((o) => o.minutos === 150), '300 minutos entre dos son 150 y 150');
ok(repartirMinutos([dia('2026-10-05', 300, ['absorber'])])[0].minutos === 300,
  'con una sola, los 300 van ahí');

console.log('\n══ lo que NO se reparte ══');
ok(repartirMinutos([dia('2026-10-05', 300, [])]).length === 0,
  'un día sin funciones marcadas se deja afuera: repartir a ciegas inventa datos');
ok(repartirMinutos([dia('2026-10-05', 300, ['absorber'], false)]).length === 0,
  'una jornada todavía abierta no cuenta: el día no terminó');
ok(repartirMinutos([dia('2026-10-05', 0, ['absorber'])]).length === 0,
  'y un día de cero minutos tampoco');
ok(repartirMinutos([dia('2026-10-05', 300, ['inventada' as Funcion])]).length === 0,
  'una función que no existe se descarta en vez de aparecer en la tabla');

// ── 2 · El agrupado por semana ─────────────────────────────────────────────
console.log('\n══ el agrupado por semana ══');
ok(lunesDe('2026-10-09') === '2026-10-05', 'el viernes 9 pertenece al lunes 5');
ok(lunesDe('2026-10-05') === '2026-10-05', 'y el lunes es su propio lunes');
ok(lunesDe('2026-10-11') === '2026-10-05', 'el domingo 11 cierra esa misma semana, no abre la siguiente');

const cuatroSemanas = porSemanas([
  dia('2026-10-07', 240, ['absorber']),          // esta semana
  dia('2026-10-05', 120, ['destrabar']),         // esta semana
  dia('2026-09-30', 300, ['destrabar']),         // una antes
  dia('2026-09-23', 300, ['destrabar']),         // dos antes
  dia('2026-09-16', 300, ['destrabar']),         // tres antes
], '2026-10-09');

ok(cuatroSemanas.estaSemana.length === 2, 'esta semana trae sus dos días');
ok(cuatroSemanas.semanasAnteriores.length === 3,
  'y las tres anteriores vienen separadas, no apiladas en una');
ok(cuatroSemanas.semanasAnteriores[0][0].minutos === 300,
  'la más reciente primero');
ok(porSemanas([], '2026-10-09').semanasAnteriores.length === 0,
  'sin jornadas no se inventan semanas');

// ── 3 · La tendencia que no podía existir ──────────────────────────────────
console.log('\n══ la columna de tendencia ══');
const sinAnteriores = tablaDeFunciones({
  estaSemana: repartirMinutos([dia('2026-10-07', 300, ['destrabar'])]),
  semanasAnteriores: [],
  clientesActivos: 10, hitos: [],
});
ok(sinAnteriores.every((f) => f.cambio === null),
  'ESTE era el estado permanente: sin semanas anteriores, el cambio es null en las seis filas');

const conAnteriores = tablaDeFunciones({ ...cuatroSemanas, clientesActivos: 10, hitos: [] });
const destrabar = conAnteriores.find((f) => f.funcion === 'destrabar')!;
ok(destrabar.cambio !== null, 'con las anteriores cargadas, ahora sí hay un cambio que mostrar');
ok(destrabar.cambio! < 0, `y destrabar bajó (${Math.round(destrabar.cambio! * 100)}%) contra el promedio`);
ok(!destrabar.alerta,
  'bajar es lo que destrabar tiene que hacer: su destino es encogerse, así que no es alerta');

// ── 4 · La alerta falsa de «absorber» ──────────────────────────────────────
console.log('\n══ la alerta falsa que se veía todos los días ══');
const sinRegistro = tablaDeFunciones({
  estaSemana: [], semanasAnteriores: [], clientesActivos: 10, hitos: [],
});
const absorberSinDato = sinRegistro.find((f) => f.funcion === 'absorber')!;
ok(!absorberSinDato.alerta,
  'sin ningún día marcado, «absorber» ya NO dispara su alerta: el cero no significaba que nadie absorbió, significaba que nadie tenía dónde anotarlo');
ok(/nadie marcó en qué se fue el día/.test(absorberSinDato.lectura),
  `y lo dice así: "${absorberSinDato.lectura}"`);
ok(sinRegistro.every((f) => !f.alerta),
  'ninguna de las seis alarma cuando lo que falta es el registro');

const conDatoYSinAbsorber = tablaDeFunciones({
  estaSemana: repartirMinutos([dia('2026-10-07', 300, ['destrabar'])]),
  semanasAnteriores: [], clientesActivos: 10, hitos: [],
});
const absorberDeVerdad = conDatoYSinAbsorber.find((f) => f.funcion === 'absorber')!;
ok(absorberDeVerdad.alerta,
  'pero cuando SÍ hay días marcados y ninguno fue a absorber, la alerta se enciende: ahí es verdad');
ok(/Nada va a bajar el mes que viene/.test(absorberDeVerdad.lectura),
  'con la lectura que dice por qué importa');

// ── 5 · Las seis funciones reciben datos ───────────────────────────────────
console.log('\n══ las seis funciones, no una ══');
const todas = tablaDeFunciones({
  estaSemana: repartirMinutos([
    dia('2026-10-05', 360, ['criterio', 'instalacion', 'destrabar']),
    dia('2026-10-06', 360, ['absorber', 'producir', 'cobrar']),
  ]),
  semanasAnteriores: [], clientesActivos: 10, hitos: [],
});
ok(todas.length === 6, 'la tabla tiene las seis filas');
ok(todas.every((f) => f.minutos > 0),
  'y ahora las seis pueden traer minutos: antes cinco estaban en cero por construcción');
ok(todas.every((f) => f.porCliente > 0), 'con su costo por cliente activo');

const hito: HitoDeAbsorcion = {
  id: 'h1', funcion: 'destrabar', que: 'el aviso de métricas sale solo',
  minutosEstimados: 120, desde: '2026-10-01', porQuien: 'Javo',
};
const conHito = tablaDeFunciones({
  estaSemana: repartirMinutos([dia('2026-10-07', 100, ['destrabar'])]),
  semanasAnteriores: [repartirMinutos([dia('2026-09-30', 400, ['destrabar'])])],
  clientesActivos: 10, hitos: [hito],
});
const bajoPorHito = conHito.find((f) => f.funcion === 'destrabar')!;
ok(/hito declarado/.test(bajoPorHito.lectura),
  `y una bajada con hito declarado se lee distinto que una sin explicación: "${bajoPorHito.lectura}"`);

// ── 6 · Dónde vive ─────────────────────────────────────────────────────────
console.log('\n══ dónde vive ══');
const semana = readFileSync('src/components/admin/LaSemana.tsx', 'utf-8');
const jornadaUI = readFileSync('src/components/admin/Jornada.tsx', 'utf-8');
const storage = readFileSync('src/lib/jornadaStorage.ts', 'utf-8');
const admin = readFileSync('src/pages/Admin.tsx', 'utf-8');
const mig = readFileSync('supabase/migrations/20261014_funciones_de_la_jornada.sql', 'utf-8');

ok(/estaSemana={semanas\.estaSemana}/.test(semana)
  && /semanasAnteriores={semanas\.semanasAnteriores}/.test(semana),
  'la pantalla recibe las dos listas armadas de las jornadas reales');
ok(!/semanasAnteriores={\[\]}/.test(semana), 'y ya no pasa un arreglo vacío fijo');
ok(/porSemanas\(/.test(semana), 'agrupadas por semana');

ok(/¿En qué se te fue el día\?/.test(jornadaUI),
  'al cerrar el día se pregunta en qué se fue');
ok(/Object\.keys\(FUNCIONES\)/.test(jornadaUI),
  'con las seis funciones reales, no una lista escrita a mano que se desincronice');
ok(/funciones: \[\.\.\.enQue\]/.test(jornadaUI), 'y eso se guarda al cerrar');
ok(/p_funciones/.test(storage) && /p_funciones/.test(mig),
  'viaja a la base por la RPC');
ok(/jornadasRecientes\(28\)/.test(admin),
  'y se piden 28 días de jornadas, no 7: con una semana no hay con qué comparar');

console.log('\n══ la migración ══');
ok(/add column if not exists funciones text\[\]/.test(mig), 'la columna existe y es idempotente');
ok(/p_funciones text\[\] default null/.test(mig),
  'el parámetro va último y con default: una app vieja sigue cerrando el día sin funciones en vez de romperse');
ok(/coalesce\(p_funciones, funciones, '\{\}'\)/.test(mig),
  'y un cierre sin funciones no borra las que ya estaban');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
