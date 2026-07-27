/**
 * Pruebas de la cola de excepciones.
 *
 * Lo que se juega: si la cola manda a una persona a atender cuentas sanas, o
 * deja pasar la que se está cayendo, el modelo de dos personas para veinte
 * clientes no funciona. Y si la acción no es ejecutable tal cual, quien la
 * lee tiene que preguntar — y esa pregunta es el cuello de botella que
 * estamos sacando.
 *
 * Correr con: npx tsx scripts/prueba-cola.ts
 */
import {
  armarCola, resumirCola, contarRacha, pesoDeLaCuenta, ordenarPorRiesgo,
  PESO_SIN_DATOS, TOPE_URGENCIA, SEMANAS_ANTES_DE_ESCALAR,
  type EntradaCola,
} from '../src/lib/colaExcepciones';
import { calcularCadena, encontrarDomino, SEMANA_VACIA, type NumerosSemana } from '../src/lib/valueChain';


let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

/** Arma una entrada a partir de números reales, como hace la app. */
const entrada = (
  nombre: string,
  numeros: Partial<NumerosSemana>,
  x: Partial<EntradaCola> = {},
): EntradaCola => {
  const n: NumerosSemana = { ...SEMANA_VACIA, precio: 1000, ...numeros };
  const domino = encontrarDomino(calcularCadena(n));
  return {
    clienteId: nombre.toLowerCase(), nombre, semana: '2026-W31',
    domino, facturado: n.facturado, cobrado: n.cobrado,
    ventas: n.ventas, gasto: n.gasto,
    urgencia: domino.indicador?.brecha ?? 0,
    sinCargar: false, plan: 'completo', semanasIgual: 0, ...x,
  };
};

const SANA: Partial<NumerosSemana> = {
  gasto: 250, piezasPublicadas: 7, conversaciones: 100, agendas: 35,
  llamadasTomadas: 25, ofertasPresentadas: 21, ventas: 7,
  facturado: 7000, cobrado: 3500,
};

// ── 1 · Solo entra lo que necesita atención ────────────────────────────────
console.log('══ una cuenta sana no aparece ══');
const sana = entrada('Sana', SANA);
linea(armarCola([sana]).length === 0,
  'una cuenta sin cuello de botella NO entra en la cola');
linea(armarCola([]).length === 0, 'sin cuentas no se rompe');

// ── 2 · La acción es ejecutable, no un diagnóstico ─────────────────────────
console.log('\n══ la acción viene escrita ══');
const dmRoto = entrada('DM roto', { ...SANA, conversaciones: 100, agendas: 5, llamadasTomadas: 4, ventas: 1, facturado: 1000 });
const cola = armarCola([dmRoto]);
linea(cola.length === 1, 'la cuenta con el DM roto entra');
linea(cola[0].accion.length > 15 && !cola[0].accion.includes('revisar los números'),
  `la acción es concreta: "${cola[0].accion}"`);
linea(cola[0].como.length > 40, 'y trae el mensaje listo para mandar');
linea(cola[0].situacion.length > 20, 'con la situación en una línea');

// Ninguna acción puede ser un diagnóstico disfrazado.
const variados = [
  entrada('A', { ...SANA, conversaciones: 100, agendas: 5, ventas: 1, facturado: 1000 }),
  entrada('B', { ...SANA, llamadasTomadas: 9, ventas: 1, facturado: 1000 }),
  entrada('C', { ...SANA, ventas: 0, facturado: 0, cobrado: 0 }),
  entrada('D', { ...SANA, cobrado: 300 }),
  entrada('E', { ...SANA, gasto: 20 }),
];
const todas = armarCola(variados);
linea(todas.every((i) => i.como.length > 30),
  `las ${todas.length} traen su cómo`);
linea(todas.every((i) => !/^(el |la |hay )/i.test(i.accion)),
  'ninguna acción empieza describiendo el problema en vez de mandar a hacer algo');

// ── 3 · Quién atiende, según el plan ───────────────────────────────────────
console.log('\n══ quién atiende ══');
const base = { ...SANA, conversaciones: 100, agendas: 5, ventas: 1, facturado: 1000 };

const blancoNuevo = armarCola([entrada('Blanco', base, { plan: 'blanco', semanasIgual: 0 })]);
linea(blancoNuevo[0].quien === 'la app',
  'un cliente de plan chico con un problema nuevo lo resuelve la app sola');

const blancoInsiste = armarCola([
  entrada('Blanco', base, { plan: 'blanco', semanasIgual: SEMANAS_ANTES_DE_ESCALAR }),
]);
linea(blancoInsiste[0].quien === 'operador',
  `pero a las ${SEMANAS_ANTES_DE_ESCALAR} semanas con lo mismo sube a una persona`);

const completo = armarCola([entrada('Completo', base, { plan: 'completo', semanasIgual: 0 })]);
linea(completo[0].quien === 'operador',
  'el que compró acompañamiento tiene persona desde el primer día');

// ── 4 · El orden: dinero en riesgo ─────────────────────────────────────────
console.log('\n══ el orden ══');
const mezcla = armarCola([
  entrada('Chica rota', { ...base, facturado: 200 }, { plan: 'completo' }),
  entrada('Grande floja', { ...SANA, facturado: 8000, agendas: 22 }, { plan: 'completo' }),
  entrada('Mediana', { ...base, facturado: 1500 }, { plan: 'completo' }),
]);
linea(mezcla.length >= 2, `entraron ${mezcla.length} cuentas`);
linea(mezcla[0].enRiesgo >= mezcla[mezcla.length - 1].enRiesgo,
  'la de más dinero en riesgo va primero, no la que peor está');

const conApp = armarCola([
  entrada('Para la app', { ...base, facturado: 9000 }, { plan: 'blanco', semanasIgual: 0 }),
  entrada('Para persona', { ...base, facturado: 300 }, { plan: 'completo' }),
]);
linea(conApp[0].quien === 'operador',
  'lo que necesita una persona va antes que lo que resuelve la app, aunque valga menos');

// ── 5 · El que no cargó ────────────────────────────────────────────────────
console.log('\n══ el que no cargó los números ══');
const sinCargar = armarCola([
  entrada('Mudo', {}, {
    sinCargar: true, facturado: 4000, plan: 'completo',
    domino: { indicador: null, tramo: null, titulo: 'No cargó los números', porque: 'Sin datos no hay diagnóstico.' },
  }),
]);
linea(sinCargar.length === 1, 'entra en la cola');
linea(sinCargar[0].accion.includes('cinco números'),
  'y la acción es pedírselos, con el mensaje escrito');
linea(sinCargar[0].enRiesgo > 0, 'con dinero en riesgo, porque no saber es peor que saber que va mal');

// ── 6 · El resumen ─────────────────────────────────────────────────────────
console.log('\n══ el titular ══');
linea(resumirCola([], 11).titular.includes('sanas'),
  `con todo sano: "${resumirCola([], 11).titular}"`);
const r1 = resumirCola(armarCola([entrada('X', base, { plan: 'completo' })]), 11);
linea(r1.titular.includes('una cuenta'), `con una: "${r1.titular}"`);
linea(r1.sanas === 10, 'y cuenta las que no aparecen porque están bien');
const soloApp = resumirCola(
  armarCola([entrada('Y', base, { plan: 'blanco', semanasIgual: 0 })]), 11);
linea(soloApp.titular.includes('Ninguna cuenta necesita'),
  `cuando la app se ocupa de todo: "${soloApp.titular}"`);
linea(resumirCola([], 0).titular.includes('Todavía no hay'),
  'sin cuentas cargadas lo dice, no muestra un cero raro');

// ── 7 · El contador que hace que algo escale ───────────────────────────────
console.log('\n══ semanas seguidas con el mismo problema ══');
// El historial llega de la más NUEVA a la más vieja.
linea(contarRacha(['conv_a_agenda']).semanas === 1,
  'una sola semana cargada cuenta como 1');
linea(contarRacha(['conv_a_agenda', 'conv_a_agenda', 'conv_a_agenda']).semanas === 3,
  'tres semanas con el mismo cuello cuentan 3');
linea(contarRacha(['conv_a_agenda', 'close_rate', 'conv_a_agenda']).semanas === 1,
  'si el cuello cambió en el medio, la racha se corta: el problema anterior se resolvió');
linea(contarRacha(['close_rate', 'conv_a_agenda', 'conv_a_agenda']).semanas === 1,
  'lo que cuenta es el cuello DE HOY, no el que más se repitió');
linea(contarRacha([null, 'conv_a_agenda']).semanas === 0,
  'si esta semana está sana, no hay racha aunque antes estuviera rota');
linea(contarRacha([]).semanas === 0, 'sin historial no se rompe');
linea(contarRacha(['x', null, 'x']).semanas === 1,
  'una semana sana en el medio también corta la racha');

// ── 8 · Quién se atiende primero ───────────────────────────────────────────
// Es la decisión más importante del día y hasta ahora no tenía ninguna prueba,
// porque vivía junto a las consultas a la base.
console.log('\n══ el orden de la cola ══');

const cta = (x: Partial<Parameters<typeof pesoDeLaCuenta>[0]> = {}) => ({
  facturado: 1000, urgencia: 1, semanasIgual: 0, sinCargar: false, ...x,
});

linea(pesoDeLaCuenta(cta({ sinCargar: true })) === PESO_SIN_DATOS,
  'el que no cargó números va arriba de todo: sin datos no se decide nada');

linea(pesoDeLaCuenta(cta({ facturado: 3000, urgencia: 0.6 }))
    > pesoDeLaCuenta(cta({ facturado: 200, urgencia: 3 })),
  'una cuenta de $3.000 en amarillo pesa más que una de $200 en rojo: es dinero en riesgo, no gravedad');

linea(pesoDeLaCuenta(cta({ semanasIgual: 3 })) > pesoDeLaCuenta(cta({ semanasIgual: 0 })),
  'tres semanas con el mismo problema pesa más que una: ya se avisó y no alcanzó');

linea(pesoDeLaCuenta(cta({ urgencia: 20 })) === pesoDeLaCuenta(cta({ urgencia: TOPE_URGENCIA })),
  `la urgencia se topea en ${TOPE_URGENCIA}: una desviación de 20 veces no vale 20 veces más`);

linea(pesoDeLaCuenta(cta({ facturado: 0, urgencia: 2 })) > 0,
  'una cuenta que todavía no facturó NO desaparece de la lista');

linea(pesoDeLaCuenta(cta({ urgencia: -5 })) >= 0,
  'una urgencia negativa no da un peso negativo');

const orden = ordenarPorRiesgo([
  cta({ facturado: 500, urgencia: 1 }),
  cta({ sinCargar: true }),
  cta({ facturado: 5000, urgencia: 2 }),
]);
linea(orden[0].sinCargar, 'ordenando, el que no cargó queda primero');
linea(orden[1].facturado === 5000, 'después el de más dinero en riesgo');
linea(ordenarPorRiesgo([]).length === 0, 'ordenar una lista vacía no rompe');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
