/**
 * Pruebas del cierre del día y la lista de trabas.
 *
 * Correr con: npx tsx scripts/prueba-cierre.ts
 */
import {
  agruparTrabas, resumirSemana, minutosDelDia, VECES_PARA_SER_SISTEMA,
  type CierreDelDia,
} from '../src/lib/cierreDelDia';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const c = (x: Partial<CierreDelDia>): CierreDelDia => ({
  personaId: 'lupe', fecha: '2026-07-27', atendidos: [], minutos: 60, ...x,
});

console.log('══ las trabas se agrupan aunque estén escritas distinto ══');
const parecidas = agruparTrabas([
  c({ traba: 'No le llega el DM automático al cliente', trabaCliente: 'a' }),
  c({ traba: 'no llegan los DM automaticos', trabaCliente: 'b' }),
  c({ traba: 'El DM automático no llega', trabaCliente: 'c' }),
]);
linea(parecidas.length === 1,
  `tres formas de escribir lo mismo cuentan como una (salieron ${parecidas.length})`);
linea(parecidas[0]?.veces === 3, 'y suma las tres veces');
linea(parecidas[0]?.clientes.length === 3, 'con los tres clientes donde pasó');
linea(parecidas[0]?.esDelSistema === true,
  `a las ${VECES_PARA_SER_SISTEMA} veces deja de ser esfuerzo y pasa a ser sistema`);

const distintas = agruparTrabas([
  c({ traba: 'No le llega el DM automático' }),
  c({ traba: 'La landing carga lenta en el teléfono' }),
]);
linea(distintas.length === 2, 'dos trabas distintas siguen siendo dos');
linea(distintas.every((t) => !t.esDelSistema), 'y una sola vez no es sistema');

console.log('\n══ el orden ══');
const mezcla = agruparTrabas([
  c({ traba: 'la landing carga lenta', fecha: '2026-07-27' }),
  c({ traba: 'el DM no llega' }), c({ traba: 'el DM no llega' }), c({ traba: 'el DM no llega' }),
]);
linea(mezcla[0].veces === 3,
  'lo que se repite va primero, aunque lo otro haya pasado hoy — es lo que hay que arreglar de raíz');

console.log('\n══ lo que no se anota ══');
linea(agruparTrabas([c({ traba: 'ok' })]).length === 0,
  'una traba de dos letras no se anota');
linea(agruparTrabas([c({ traba: '   ' })]).length === 0, 'ni una vacía');
linea(agruparTrabas([c({})]).length === 0, 'ni un cierre sin traba — un día sin trabas es un buen día');
linea(agruparTrabas([]).length === 0, 'sin cierres no rompe');

console.log('\n══ el resumen de la semana ══');
const sinNada = resumirSemana([], 11);
linea(sinNada.titular.includes('nadie cerró'), `sin cierres: "${sinNada.titular}"`);
linea(sinNada.horas === 0 && sinNada.minutosPorCliente === 0, 'y todo en cero, sin dividir por cero');

const buena = resumirSemana([
  c({ atendidos: ['a', 'b'], minutos: 120 }),
  c({ atendidos: ['b', 'c'], minutos: 90 }),
], 11);
linea(buena.horas === 3.5, `suma las horas: ${buena.horas}`);
linea(buena.cuentasTocadas === 3, 'y cuenta las cuentas sin repetir');
linea(buena.minutosPorCliente === 19,
  `da los minutos de humano por cliente: ${buena.minutosPorCliente} — el número que dice si la app sirve`);
linea(buena.titular.includes('sin trabas'), 'una semana limpia lo dice');

const conSistema = resumirSemana([
  c({ traba: 'el DM no llega' }), c({ traba: 'el DM no llega' }), c({ traba: 'el DM no llega' }),
], 11);
linea(conSistema.delSistema === 1, 'detecta la traba de sistema');
linea(conSistema.titular.includes('no se arregla insistiendo'),
  `y lo dice con todas las letras: "${conSistema.titular}"`);

linea(resumirSemana([c({ atendidos: ['a'], minutos: 60 })], 0).minutosPorCliente === 0,
  'sin clientes activos no divide por cero');

console.log('\n══ los minutos se calculan, no se preguntan ══');
linea(minutosDelDia({ excepciones: 2, sesiones: 1, instalaciones: 3 }) === 175,
  '2 excepciones + 1 sesión + 3 instalaciones = 175 minutos, sin que nadie los cargue');
linea(minutosDelDia({ excepciones: 0, sesiones: 0, instalaciones: 0 }) === 0,
  'un día sin nada da cero');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
