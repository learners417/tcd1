/**
 * LA VENTANA SIN SOPORTE — y el sistema que hacía lo contrario.
 *
 * ═══ QUÉ SE DIO VUELTA ═══
 *
 * Existía una «pausa global» que PARABA EL CAMINO DE TODOS: congelaba el día
 * de cada cliente, le corría la fecha de cierre treinta y cinco días, movía
 * las fechas de la hoja de ruta, apagaba el semáforo un mes entero y le
 * mostraba al cliente un cartel que decía «El Camino retoma el 19 de enero».
 *
 * La app no corta nunca. Lo único que corta esos días es el soporte.
 *
 * Esta prueba verifica las dos mitades: que lo nuevo hace lo que dice, y que
 * **nada del corrimiento viejo quedó en el repo**. La segunda mitad es la que
 * importa: el bug no era un cálculo mal hecho, era un concepto equivocado
 * cableado en seis archivos, y alcanzaba con que quedara uno.
 *
 * Correr con: npx tsx scripts/prueba-sin-soporte.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import {
  cuantosDias, vuelveElSoporte, sinSoporteHoy, laQueViene, diasAvisadosEntre,
  fijarVentanas, soporteCerrado, avisadosEntre, enPalabras,
  avisoDelCliente, avisoDeLaQueViene, resumenParaElEquipo, loQueVaAPasar,
  type VentanaSinSoporte,
} from '../src/lib/ventanaSinSoporte';
import { diaDelPrograma, diasDesdeInicio } from '../src/lib/diaPrograma';
import { fechaDelDia } from '../src/lib/hojaDeRuta';
import { cierreDeLaVentana } from '../src/lib/ventanaDeAcceso';
import { filaDe } from '../src/lib/semaforo';
import { diasReclamables, seEstaCayendo, type Sesion } from '../src/lib/sesionesHumanas';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

/** La de fin de año: 15 de diciembre al 18 de enero. */
const finDeAnio: VentanaSinSoporte = { desde: '2026-12-15', hasta: '2027-01-18' };

// ── 1 · La ventana son los días que se pidieron ────────────────────────────
console.log('══ la ventana son los días que se pidieron ══');
ok(cuantosDias(finDeAnio) === 35, 'del 15 de diciembre al 18 de enero son 35 días, contando los dos extremos');
ok(cuantosDias({ desde: '2026-12-15', hasta: '2026-12-15' }) === 1, 'y un solo día es un día');
ok(vuelveElSoporte(finDeAnio) === '2027-01-19', 'se responde desde el día siguiente al último');
ok(cuantosDias({ desde: '2026-12-15', hasta: '2026-12-20' }) === 6,
  'NO se estira a semanas enteras: eso existía para que las jornadas siguieran cayendo en su día cuando todo se corría, y ya nada se corre');

console.log('\n══ cuándo está cerrado ══');
ok(sinSoporteHoy([finDeAnio], '2026-12-20') !== null, 'dentro de la ventana, cerrado');
ok(sinSoporteHoy([finDeAnio], '2027-01-18') !== null, 'el último día todavía está cerrado');
ok(sinSoporteHoy([finDeAnio], '2027-01-19') === null, 'y el día que vuelve, abierto');
ok(sinSoporteHoy([finDeAnio], '2026-12-14') === null, 'la víspera también está abierto');
ok(laQueViene([finDeAnio], '2026-11-01')?.desde === '2026-12-15', 'la que viene se puede anunciar antes');
ok(laQueViene([finDeAnio], '2027-02-01') === null, 'y una que ya pasó no viene');

// ── 2 · EL CAMINO NO SE MUEVE ──────────────────────────────────────────────
console.log('\n══ EL CAMINO NO SE MUEVE ══');
fijarVentanas([finDeAnio]);

const inicio = '2026-10-05';
const enPlenaVentana = new Date(2027, 0, 5); // 5 de enero, con el soporte cerrado
const diaEnEnero = diaDelPrograma(inicio, enPlenaVentana);
ok(diaEnEnero === 93 || diaEnEnero === 90,
  `el 5 de enero el cliente está en su día real (${diaEnEnero}), no congelado en diciembre`);
ok(diasDesdeInicio(inicio, enPlenaVentana) === 92,
  'los días desde el inicio son días de calendario, sin descuentos');

const sinVentanas = (() => {
  fijarVentanas([]);
  const d = diasDesdeInicio(inicio, enPlenaVentana);
  fijarVentanas([finDeAnio]);
  return d;
})();
ok(sinVentanas === 92,
  'y da lo mismo con la ventana puesta que sin ella: ESA es la prueba de que el Camino ya no se corre');

const f = fechaDelDia('2026-10-05', 90);
ok(f !== null && f.getMonth() === 0 && f.getDate() === 2,
  `el día 90 cae donde tiene que caer (${f?.getDate()}/${(f?.getMonth() ?? 0) + 1}), no un mes más adelante`);

const acceso = { tipo: 'noventa' as const, inicio: '2026-10-05' };
ok(cierreDeLaVentana(acceso) === '2027-01-02',
  'y el acceso cierra el día que compró, sin estirarse solo 35 días para todos');

// ── 3 · Lo único que SÍ cambia: el reclamo al equipo ───────────────────────
console.log('\n══ lo único que cambia: de qué días responde el equipo ══');
ok(diasAvisadosEntre([finDeAnio], '2026-12-10', '2027-01-25') === 35,
  'los 35 días de la ventana estaban avisados');
ok(diasAvisadosEntre([finDeAnio], '2026-12-20', '2026-12-25') === 6,
  'un tramo de adentro cuenta solo sus días');
ok(diasAvisadosEntre([finDeAnio], '2026-11-01', '2026-11-30') === 0,
  'un tramo de afuera no cuenta ninguno');
ok(diasAvisadosEntre([finDeAnio, { desde: '2026-12-20', hasta: '2026-12-22' }], '2026-12-01', '2027-02-01') === 35,
  'dos ventanas pisadas no suman el mismo día dos veces');
ok(diasAvisadosEntre([finDeAnio], '2027-01-25', '2026-12-10') === 0,
  'con las fechas al revés devuelve cero en vez de un número absurdo');
ok(avisadosEntre('2026-12-10', '2027-01-25') === 35, 'y el registro cargado contesta lo mismo');
ok(soporteCerrado('2026-12-20') !== null && soporteCerrado('2027-02-01') === null,
  'el registro también sabe si hoy está cerrado');

// ── 4 · El semáforo no acusa al equipo por días avisados ───────────────────
console.log('\n══ el semáforo no acusa al equipo por días avisados ══');
const s = (fecha: string): Sesion => ({ fecha, tipo: 'grupal', quien_la_dio: 'Lupe' });

ok(diasReclamables([s('2026-12-10')], '2027-01-25', 35) === 11,
  '46 días sin sesión, 35 avisados: se le reclaman 11');
ok(diasReclamables([s('2026-12-10')], '2027-01-25', 0) === 46,
  'sin ventana, los 46');
ok(diasReclamables([s('2027-01-20')], '2027-01-25', 35) === 0,
  'y nunca baja de cero, aunque lo avisado sea más que los días transcurridos');

ok(!seEstaCayendo([s('2026-12-10')], 'ascenso', '2027-01-25', 35),
  'con la ventana descontada el acompañamiento NO se está cayendo: 11 días reclamables');
ok(seEstaCayendo([s('2026-12-10')], 'ascenso', '2027-01-25', 0),
  'y sin descontar sí — que es la alarma falsa que habría encendido a toda la cartera cada enero');

const todasCerradas = new Set<string>(
  SEED_ROADMAP_V2.flatMap((p) => p.metas.map((m) => `${p.numero}-${m.codigo}`)),
);
const alDia = {
  id: 'x', nombre: 'Ana', fecha_inicio: '2026-10-05',
  completadas: todasCerradas, ultimoIngreso: '2026-12-20',
  numeros: [], servicio: 'ascenso',
};

// Durante la ventana: lo del cliente se sigue midiendo.
const sinEntrarHace30 = filaDe({ ...alDia, ultimoIngreso: '2026-12-16' }, '2027-01-15');
ok(sinEntrarHace30.color === 'rojo',
  'EL SEMÁFORO NO SE APAGA: quien dejó de entrar el 16 de diciembre aparece en rojo en enero, no en febrero cuando ya se fue');
ok(/no hay soporte/.test(sinEntrarHace30.porque),
  `y le avisa al equipo que hoy su mensaje espera: "${sinEntrarHace30.porque}"`);

// Recién empezado (día 6), entrando ayer: no hay nada que reclamarle.
const verdeEnVentana = filaDe(
  { ...alDia, fecha_inicio: '2027-01-10', ultimoIngreso: '2027-01-14' }, '2027-01-15');
ok(verdeEnVentana.color === 'verde', 'quien está al día sigue en verde con el soporte cerrado');
ok(!/no hay soporte/.test(verdeEnVentana.porque),
  'y no se le agrega la nota del soporte: no hay nada que escribirle');

// ── 5 · Lo que lee el cliente ──────────────────────────────────────────────
console.log('\n══ lo que lee el cliente ══');
const aviso = avisoDelCliente(finDeAnio);
ok(/Respondemos desde el 19 de enero/.test(aviso.titulo),
  `dice cuándo se le responde: "${aviso.titulo}"`);
ok(/sigue abierto y corriendo/.test(aviso.cuerpo),
  'y que su Camino sigue andando, que es lo que el cartel viejo negaba');
ok(!/pausa|parado|retoma/i.test(aviso.titulo + aviso.cuerpo),
  'sin la palabra «pausa» en ninguna parte: quien leía que su Camino estaba parado dejaba de entrar, y el mes que compró se le iba igual');
ok(!/no |nada|tampoco/i.test(aviso.titulo),
  'y el título dice lo que SÍ pasa');
ok(/Tu Camino sigue andando/.test(avisoDeLaQueViene(finDeAnio)),
  'el anuncio anticipado dice lo mismo');
ok(enPalabras('2027-01-19') === '19 de enero', 'las fechas, como las diría una persona');

console.log('\n══ lo que lee el equipo ══');
const resumen = resumenParaElEquipo(finDeAnio);
ok(/vuelve el 19 de enero/.test(resumen) && /sigue corriendo/.test(resumen),
  `el resumen dice las dos cosas: "${resumen}"`);
const antes = loQueVaAPasar('2026-12-15', '2027-01-18', 12);
ok(/35 días/.test(antes) && /12 clientes/.test(antes), 'antes de confirmar dice cuánto y a cuántos');
ok(/nadie pierde días/.test(antes) && /no va a\s+marcar a nadie/.test(antes),
  'y sobre todo dice lo que NO va a pasar, que es lo que hace que el equipo se animé a usarlo');
ok(/posterior/.test(loQueVaAPasar('2027-01-18', '2026-12-15', 5)),
  'con las fechas al revés lo dice en vez de calcular un disparate');

// ── 6 · NADA DEL SISTEMA VIEJO QUEDÓ ───────────────────────────────────────
console.log('\n══ nada del sistema viejo quedó ══');
ok(!existsSync('src/lib/pausaGlobal.ts'), 'pausaGlobal.ts ya no existe');
ok(!existsSync('src/lib/pausasDatos.ts'), 'ni pausasDatos.ts');
ok(!existsSync('src/components/CaminoEnPausa.tsx'),
  'ni el cartel que le anunciaba al cliente un Camino parado');
ok(existsSync('src/components/admin/SinSoportePanel.tsx'),
  'y el panel del Admin se llama por lo que hace');

const dia = readFileSync('src/lib/diaPrograma.ts', 'utf-8');
const hoja = readFileSync('src/lib/hojaDeRuta.ts', 'utf-8');
const vent = readFileSync('src/lib/ventanaDeAcceso.ts', 'utf-8');
const sem = readFileSync('src/lib/semaforo.ts', 'utf-8');

for (const [nombre, txt] of [['diaPrograma', dia], ['hojaDeRuta', hoja], ['ventanaDeAcceso', vent]] as const) {
  ok(!/corrimientoActual|cierreCorrido|hoyDelCamino|diasDeCorrimiento/.test(txt),
    `${nombre} ya no corre el calendario de nadie`);
}
ok(!/pausaActiva|retomaEl/.test(sem), 'el semáforo ya no se apaga por una pausa');
ok(/avisadosEntre/.test(sem), 'descuenta los días avisados, que es lo único que le corresponde');

// El grep que de verdad cierra la puerta: en todo src/ y api/.
import { readdirSync, statSync } from 'node:fs';
const todos: string[] = [];
(function caminar(dir: string) {
  for (const n of readdirSync(dir)) {
    const p = `${dir}/${n}`;
    if (statSync(p).isDirectory()) caminar(p);
    else if (/\.(ts|tsx)$/.test(p)) todos.push(p);
  }
})('src');
const culpables = todos.filter((f) => {
  if (f.endsWith('ventanaSinSoporte.ts')) return false; // su comentario cuenta la historia
  return /corrimientoActual|cierreCorrido|hoyDelCamino|diasDeCorrimiento|pausaActiva|pausaVigente|cartelDeLaPausa/.test(
    readFileSync(f, 'utf-8'));
});
ok(culpables.length === 0,
  `ningún archivo de src/ corre ni consulta el corrimiento viejo${culpables.length ? `: ${culpables.join(', ')}` : ''}`);

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
