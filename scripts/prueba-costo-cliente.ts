/**
 * LO QUE CUESTA CADA CLIENTE — el número que dice si el negocio cierra.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * La base anota cada llamada a la IA con su costo, y `gasto_ia_por_cliente`
 * existe desde que corrió sala-de-mando.sql. **Nadie la llamaba nunca.** El
 * panel mostraba el gasto total del motor, que dice si la cuenta del proveedor
 * duele, pero no a quién le duele.
 *
 * Un cliente que pagó mil dólares una vez y consume doscientos en IA durante
 * sus noventa días es una suscripción al revés. Sin este cruce eso se descubre
 * con el resumen de la tarjeta, tres meses tarde.
 *
 * Correr con: npx tsx scripts/prueba-costo-cliente.ts
 */
import { readFileSync } from 'node:fs';
import {
  costoPorCliente, comoVaElCosto, cuantosEn, enPorciento, MIRAR, ACTUAR,
  type GastoDeUno,
} from '../src/lib/costoDelCliente';
import { funcionQueNoExiste } from '../src/lib/conexion';
import { cuantasDioEstaSemana, type Sesion } from '../src/lib/sesionesHumanas';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const gasto = (id: string, usd: number, llamadas = 10): GastoDeUno =>
  ({ user_id: id, usd_total: usd, llamadas, usd_estimado: 0, ultima: '2026-10-09T10:00:00Z' });

const CLIENTES = [
  { id: 'a', nombre: 'Ana', servicio: 'base' },        // pagó 1.000
  { id: 'b', nombre: 'Beto', servicio: 'ascenso' },    // pagó 3.000
  { id: 'c', nombre: 'Cora', servicio: 'instalacion' }, // pagó 5.000
];

// ── 1 · El cruce con lo que pagó ───────────────────────────────────────────
console.log('══ el cruce con lo que pagó ══');
const filas = costoPorCliente([gasto('a', 4.2), gasto('b', 9)], CLIENTES);
ok(filas.length === 2, 'solo entran los que usaron la IA: una fila en cero por cliente llena la tabla de nada');
ok(filas[0].nombre === 'Beto' && filas[0].usd === 9, 'ordenado por plata, de mayor a menor');
ok(filas[0].ticket === 3000, 'con el ticket de su escalón adentro');

const ana = filas.find((f) => f.nombre === 'Ana')!;
ok(Math.abs(ana.porcion - 0.0042) < 1e-9, 'y la porción del ticket que se llevó la IA');
ok(ana.senal === 'bien', '4,20 dólares sobre mil no es nada: queda en bien');

// ── 2 · Las dos señales ────────────────────────────────────────────────────
console.log('\n══ las dos señales ══');
const alBorde = costoPorCliente([gasto('a', 1000 * MIRAR)], CLIENTES)[0];
ok(alBorde.senal === 'mirar', `justo en el ${Math.round(MIRAR * 100)} % del ticket ya se mira`);
const grave = costoPorCliente([gasto('a', 1000 * ACTUAR)], CLIENTES)[0];
ok(grave.senal === 'actuar', `y en el ${Math.round(ACTUAR * 100)} % hay que actuar`);
ok(costoPorCliente([gasto('a', 1000 * MIRAR - 0.01)], CLIENTES)[0].senal === 'bien',
  'un centavo por debajo todavía no enciende nada: el umbral no se cruza por redondeo');
ok(ACTUAR > MIRAR, 'y actuar siempre está más arriba que mirar');

console.log('\n══ el mismo gasto pesa distinto según lo que pagó ══');
const mismoGasto = costoPorCliente([gasto('a', 200), gasto('c', 200)], CLIENTES);
const enBase = mismoGasto.find((f) => f.nombre === 'Ana')!;
const enInstalacion = mismoGasto.find((f) => f.nombre === 'Cora')!;
ok(enBase.senal === 'actuar' && enInstalacion.senal === 'bien',
  'doscientos dólares de IA son un problema en un ticket de 1.000 y ruido en uno de 5.000');
ok(enBase.usd === enInstalacion.usd, 'aunque el gasto en dólares sea idéntico');

// ── 3 · El que ya no está en la lista ──────────────────────────────────────
console.log('\n══ la plata que no tiene dueño ══');
const huerfano = costoPorCliente([gasto('zzzzzzzz-1111', 50)], CLIENTES)[0];
ok(huerfano != null, 'un gasto de alguien que ya no está en la lista se muestra igual: es plata que se fue');
ok(/zzzzzzzz/.test(huerfano.nombre), `y lleva el id a la vista para rastrearlo: "${huerfano.nombre}"`);
ok(huerfano.ticket === 1000, 'sin servicio marcado se cuenta como La Base, el escalón más bajo');

// ── 4 · La línea que lee el dueño ──────────────────────────────────────────
console.log('\n══ la línea de arriba ══');
ok(/nadie usó la IA/.test(comoVaElCosto([])), 'sin gasto lo dice y no inventa un cero');

const sano = comoVaElCosto(costoPorCliente([gasto('a', 2), gasto('b', 3)], CLIENTES));
ok(/Ninguno pasa/.test(sano), `cuando está todo bien tranquiliza: "${sano}"`);

const conProblema = comoVaElCosto(costoPorCliente([gasto('a', 200)], CLIENTES));
ok(/Ana/.test(conProblema),
  `y cuando hay uno pasado lo NOMBRA, porque cien dólares de un solo cliente es un problema con nombre: "${conProblema}"`);

const soloMirar = comoVaElCosto(costoPorCliente([gasto('a', 60)], CLIENTES));
ok(/vale mirarlo/.test(soloMirar) && !/Ana/.test(soloMirar),
  'al que solo hay que mirar no se lo nombra: todavía no es una acción');

ok(!/undefined|NaN|null/.test(conProblema + sano + soloMirar), 'sin agujeros en el texto');
ok(cuantosEn(costoPorCliente([gasto('a', 200), gasto('b', 1)], CLIENTES), 'actuar') === 1,
  'y se pueden contar por señal');

console.log('\n══ el porcentaje dicho corto ══');
ok(enPorciento(0) === '0 %', 'cero es cero, no "0,0 %"');
ok(enPorciento(0.004) === '0.4 %', 'abajo del uno por ciento se ve el decimal, si no todo sería 0 %');
ok(enPorciento(0.153) === '15 %', 'y arriba del uno no hace falta');

// ── 5 · El cartel que mandaba a correr un SQL ya corrido ───────────────────
console.log('\n══ el cartel que mentía ══');
ok(funcionQueNoExiste({ code: 'PGRST202', message: 'Could not find the function' }),
  'una función ausente se reconoce por el código de PostgREST');
ok(funcionQueNoExiste({ code: '42883' }), 'y por el de Postgres');
ok(funcionQueNoExiste({ message: 'function panel_ia_total(integer) does not exist' }),
  'y por el texto, porque el código no siempre llega');
ok(!funcionQueNoExiste({ code: '42501', message: 'permission denied for table gasto_ia' }),
  'un problema de permiso NO es una función ausente: mandar a repetir una migración que ya corrió esconde la causa y hace perder la tarde');
ok(!funcionQueNoExiste(null) && !funcionQueNoExiste(undefined), 'y sin error no hay función ausente');

const panel = readFileSync('src/components/admin/PanelMotorIA.tsx', 'utf-8');
ok(/funcionQueNoExiste\(roto\)/.test(panel), 'el panel distingue los dos casos');
ok(/rpc\('gasto_ia_por_cliente'/.test(panel), 'y llama la función que estaba sin usar');
const admin = readFileSync('src/pages/Admin.tsx', 'utf-8');
ok(/<PanelMotorIA clientes=/.test(admin),
  'con los nombres de los clientes: la base devuelve ids, y un id no es una conversación');

// ── 6 · La carga de «Mi rol» ───────────────────────────────────────────────
console.log('\n══ la barra de carga que estaba siempre en cero ══');
const s = (fecha: string, quien: string): Sesion =>
  ({ fecha, tipo: 'grupal', quien_la_dio: quien });
const semana = [
  s('2026-10-09', 'Lupe'), s('2026-10-07', 'Lupe'), s('2026-10-04', 'Lupe'),
  s('2026-09-20', 'Lupe'), s('2026-10-08', 'Javo'),
];
ok(cuantasDioEstaSemana(semana, 'Lupe', '2026-10-09') === 3,
  'cuenta las de los últimos siete días de esa persona, no las de todos');
ok(cuantasDioEstaSemana(semana, 'Javo', '2026-10-09') === 1, 'y cada uno ve las suyas');
ok(cuantasDioEstaSemana(semana, 'lupe', '2026-10-09') === 3, 'sin importar las mayúsculas');
ok(cuantasDioEstaSemana(semana, null, '2026-10-09') === 0, 'sin nombre no cuenta nada');
ok(cuantasDioEstaSemana(semana, '  ', '2026-10-09') === 0, 'ni con un nombre en blanco');
ok(cuantasDioEstaSemana([s('2026-10-20', 'Lupe')], 'Lupe', '2026-10-09') === 0,
  'una sesión cargada con fecha futura no infla la semana');
ok(/excepciones={cola\.filter/.test(admin)
  && /sesiones={misSesionesDeLaSemana}/.test(admin),
  'y los dos datos llegan al panel: sin ellos medía la instalación y nada más');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
