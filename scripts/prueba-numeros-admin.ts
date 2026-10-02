/**
 * prueba-numeros-admin.ts — los números del cliente, a la vista del equipo.
 */
import { readFileSync } from 'node:fs';
import {
  cruces, elEmbudo, queEstaPasando, ordenadas, ultimaCargada, tieneDatos,
  semanasSinCargar, avisoDeCarga, comparado, usd, pct,
  type SemanaDeNumeros,
} from '../src/lib/numerosDelCliente';
import { filaDe, DIA_EN_QUE_YA_MIDE, SEMANAS_SIN_NUMEROS } from '../src/lib/semaforo';
import { fijarPausas } from '../src/lib/pausaGlobal';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';

let fallas = 0;
function ok(cond: boolean, que: string) {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
}

fijarPausas([]);

// Una semana que anda: pone 300, agendan 10, aparecen 8, compran 2, cobra 2.000.
const buena: SemanaDeNumeros = {
  semana: 'S4', met_fecha_inicio: '2026-09-21', met_fecha_fin: '2026-09-27',
  gasto_ads: 300, mensajes_recibidos: 40, formularios_completados: 18,
  agendados: 10, shows: 8, llamadas_tomadas: 8, ventas_cerradas: 2,
  ingresos_cobrados: 2000, horas_trabajadas_semana: 20,
};

console.log('── los cruces que importan ──');
const c = cruces(buena);
ok(c.costoPorAgenda === 30, `una agenda le cuesta ${c.costoPorAgenda}`);
ok(c.costoPorVenta === 150, `una venta le cuesta ${c.costoPorVenta}`);
ok(c.tasaDeShow === 0.8, `aparece el ${pct(c.tasaDeShow!)} de los que agendan`);
ok(c.tasaDeCierre === 0.25, `cierra el ${pct(c.tasaDeCierre!)} de las llamadas`);
ok(c.ticket === 1000, `cada venta deja ${c.ticket}`);
ok(c.retorno !== null && Math.abs(c.retorno - 6.67) < 0.01, `por cada peso vuelven ${c.retorno?.toFixed(2)}`);

console.log('\n── sin denominador no se inventa un número ──');
const vacia: SemanaDeNumeros = { semana: 'S1', gasto_ads: 200, agendados: 0, ventas_cerradas: 0 };
const cv = cruces(vacia);
ok(cv.costoPorAgenda === null, 'sin agendas no hay costo por agenda');
ok(cv.costoPorVenta === null, 'sin ventas no hay costo por venta');
ok(cv.retorno === 0, 'puso plata y no volvió nada: el retorno es cero, no un hueco');
ok(cruces({ semana: 'S0', ingresos_cobrados: 500 }).retorno === null, 'sin gasto no hay retorno que calcular');
ok(cruces({ semana: 'S0' }).ticket === null, 'una semana vacía no produce ningún cruce');

console.log('\n── la frase con la que se abre el mensaje ──');
ok(/vuelven 6\.7/.test(queEstaPasando(buena)), `anda bien: "${queEstaPasando(buena)}"`);
ok(/todavía no agendó/.test(queEstaPasando({ semana: 'S1', gasto_ads: 250, agendados: 0 })),
   'gasta y no agenda: señala el anuncio y la página');
ok(/entre agendar y la llamada/.test(queEstaPasando(
     { semana: 'S2', gasto_ads: 200, agendados: 10, shows: 3, llamadas_tomadas: 3 })),
   'agenda y no aparecen: señala el tramo correcto');
ok(/en la llamada, no en los anuncios/.test(queEstaPasando(
     { semana: 'S3', gasto_ads: 200, agendados: 8, shows: 6, llamadas_tomadas: 6, ventas_cerradas: 0 })),
   'toma llamadas y no cierra: señala la llamada');
ok(/pierde en cada una/.test(queEstaPasando(
     { semana: 'S5', gasto_ads: 3000, agendados: 10, shows: 8, llamadas_tomadas: 8, ventas_cerradas: 2, ingresos_cobrados: 1000 })),
   'la venta cuesta más de lo que deja: lo dice sin vueltas');

console.log('\n── el embudo, dicho como se dice ──');
const e = elEmbudo(buena);
ok(/puso 300 USD/.test(e) && /10 agendaron/.test(e) && /2 compraron/.test(e), `"${e}"`);
ok(!/\bgente\b/.test(e + queEstaPasando(buena)), 'nunca dice "gente"');
ok(!/undefined|NaN|null/.test(e), 'sin agujeros en el texto');

console.log('\n── qué semana es la última ──');
const historial: SemanaDeNumeros[] = [
  { semana: 'S1', met_fecha_inicio: '2026-08-31', met_fecha_fin: '2026-09-06', gasto_ads: 200, agendados: 4 },
  buena,
  { semana: 'S3', met_fecha_inicio: '2026-09-14', met_fecha_fin: '2026-09-20', gasto_ads: 300, agendados: 6 },
  { semana: 'S9', met_fecha_inicio: '2026-10-05' },
];
ok(ordenadas(historial).length === 3, 'las semanas vacías no cuentan como cargadas');
ok(ultimaCargada(historial)?.semana === 'S4', 'la última cargada es la más nueva con datos');
ok(!tieneDatos({ semana: 'S9', met_fecha_inicio: '2026-10-05' }), 'una semana sin un solo número está vacía');

console.log('\n── hace cuánto que no carga ──');
ok(semanasSinCargar(historial, '2026-09-28') === 0, 'recién cargada: cero semanas');
ok(semanasSinCargar(historial, '2026-10-18') === 3, 'tres semanas después lo dice');
ok(semanasSinCargar([], '2026-10-18') === null, 'quien nunca cargó no está "atrasado": es otra cosa');
ok(avisoDeCarga(null, true) === 'Todavía no cargó sus números ni una vez.', 'y eso se dice con todas las letras');
ok(avisoDeCarga(1, false) === null, 'una semana sin cargar no molesta a nadie');
ok(/Hace 3 semanas/.test(avisoDeCarga(3, false) ?? ''), 'tres sí');

console.log('\n── si va para arriba o para abajo ──');
ok(/bajó de 50 USD a 30 USD/.test(comparado(historial) ?? ''), `"${comparado(historial)}"`);
ok(comparado([buena]) === null, 'con una sola semana no hay con qué comparar');

console.log('\n── el semáforo mira quien corre anuncios sin mirarse ──');
const base = { id: 'x', nombre: 'Ana', fecha_inicio: '2026-07-06', completadas: new Set<string>(), ultimoIngreso: '2026-10-17' };
// Al día con TODO el Camino: así lo único que puede encender la fila son los números.
const todasCerradas = new Set<string>(
  SEED_ROADMAP_V2.flatMap((p) => p.metas.map((m) => `${p.numero}-${m.codigo}`)),
);
const alDia = { ...base, completadas: todasCerradas };
// Un cliente temprano todavía no tiene por qué haber cargado nada.
const temprano = filaDe({ ...base, fecha_inicio: '2026-10-12', numeros: [] }, '2026-10-18');
ok(temprano.semanasSinNumeros === null, `antes del día ${DIA_EN_QUE_YA_MIDE} no se le reclama nada`);

// Uno que ya pasó ese día y hace tres semanas que no carga.
const flojo = filaDe({ ...alDia, numeros: historial }, '2026-10-18');
ok(flojo.semanasSinNumeros === 3, 'cuenta las semanas sin cargar');
ok(/no carga sus números/.test(flojo.porque), `y lo dice en la fila: "${flojo.porque}"`);

// Uno que carga al día: el semáforo no lo molesta por esto.
const puntual = filaDe({ ...alDia, numeros: [{ ...buena, met_fecha_fin: '2026-10-17' }] }, '2026-10-18');
ok(!/números/.test(puntual.porque), 'quien carga no aparece por este motivo');
ok(SEMANAS_SIN_NUMEROS === 3, 'la vara está en un solo lugar y se puede mover');

console.log('\n── dónde vive ──');
const lib = readFileSync('src/lib/numerosDelCliente.ts', 'utf8');
const datos = readFileSync('src/lib/numerosDatos.ts', 'utf8');
const panel = readFileSync('src/components/admin/NumerosDelCliente.tsx', 'utf8');
const admin = readFileSync('src/pages/Admin.tsx', 'utf8');
const diag = readFileSync('src/components/campanas/DiagnosticoView.tsx', 'utf8');
const mig = readFileSync('supabase/migrations/20261002_numeros_del_cliente.sql', 'utf8');

ok(!/from '\.\/supabase'/.test(lib), 'la regla se prueba sola: no toca la base');
ok(/from '\.\/supabase'/.test(datos), 'y el que lee la base está aparte');
ok(/\.in\('user_id', userIds\)/.test(datos), 'trae a todos en una sola consulta, no una por cliente');
ok(/NumerosDelCliente/.test(admin) && /numerosDeVarios/.test(admin), 'el Admin los trae y los muestra');
ok(/numeros: numerosPorCliente\[c\.id\]/.test(admin), 'y el semáforo los recibe');
ok(/guardarDiagnostico/.test(diag), 'la lectura de campaña queda guardada');
ok(/rol = 'admin'/.test(mig) && /for select/.test(mig), 'la base deja que el equipo las lea');
ok(!/for (insert|update|delete)/.test(mig.split("metricas_v2_equipo_lee")[1] ?? ''),
   'solo lectura: la carga sigue siendo del cliente');
ok(!/text-xs|text-sm|text-\[1[0-5]px\]/.test(panel), 'sin letra chica en el panel');
ok(!/\bgente\b/.test(panel + lib), 'nunca dice "gente"');
ok(/todavía no cargó ninguna semana/.test(panel), 'y dice qué hacer cuando no hay nada cargado');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE' : `\n✗ ${fallas} FALLAS`);
process.exit(fallas === 0 ? 0 : 1);
