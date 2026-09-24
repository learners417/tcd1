/**
 * Pruebas de la lista del cliente.
 *
 * Lo que se juega: el que abre la app sin saber qué hacer, cierra la app. Y
 * una lista de quince pendientes no informa: paraliza.
 *
 * Correr con: npx tsx scripts/prueba-cliente.ts
 */
import {
  loQueSigue, titularDelCliente, QUE_HACE, CUANTAS_A_LA_VEZ,
} from '../src/lib/cerebroCliente';
import { calcularCadena, encontrarDomino, SEMANA_VACIA } from '../src/lib/valueChain';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const base = {
  faltaInstalar: [], lanzado: true, diasLanzado: 12,
  numerosSinCargar: 0, piezasSinPublicar: 0,
};

console.log('══ la lista es corta a propósito ══');
const muchas = loQueSigue({
  ...base, numerosSinCargar: 3, piezasSinPublicar: 5,
  sesionPendiente: { codigo: 'P4.1', titulo: 'Tu primera campaña', minutos: 30 },
  faltaInstalar: [{ id: 'a', titulo: 'Foto de perfil' }],
});
linea(muchas.length <= CUANTAS_A_LA_VEZ,
  `nunca más de ${CUANTAS_A_LA_VEZ}: una lista de quince no informa, paraliza`);

console.log('\n══ cargar los números gana a todo ══');
linea(muchas[0].id === 'cargar_numeros',
  'porque sin números la app no puede decirle nada más: es lo único que desbloquea a las otras');
linea(muchas[0].porQue.includes('Es lo único que me falta para ayudarte'),
  'y se lo dice así, no como una obligación');
linea(muchas[0].minutos === 2, 'diciendo cuánto le lleva: 2 minutos');

console.log('\n══ el cuello, cuando hay datos ══');
const cadena = calcularCadena({
  ...SEMANA_VACIA, precio: 1000, mercados: ['MX'],
  gasto: 140, impresiones: 20000, alcance: 9000,
  comentarios: 30, conversaciones: 18, agendas: 2, llamadasTomadas: 2,
});
const conCuello = loQueSigue({ ...base, cuello: encontrarDomino(cadena).indicador });
linea(conCuello.some((t) => t.id.startsWith('cuello_')), 'aparece el cuello');
const c = conCuello.find((t) => t.id.startsWith('cuello_'))!;
linea(c.porQue.includes('mejora todo lo que viene después'),
  'y explica por qué ese y no otro');
linea(c.destino === 'entrenador' && !!c.entrenador,
  'y lleva al entrenador que sabe de eso');

console.log('\n══ publicar va ÚLTIMO, a propósito ══');
const conPiezas = loQueSigue({ ...base, piezasSinPublicar: 4, numerosSinCargar: 2 });
const iPub = conPiezas.findIndex((t) => t.id === 'publicar');
const iNum = conPiezas.findIndex((t) => t.id === 'cargar_numeros');
linea(iPub === -1 || iPub > iNum,
  'generar piezas nuevas es más fácil que publicar las que ya tiene: por eso publicar no compite con lo que desbloquea');
const soloPiezas = loQueSigue({ ...base, piezasSinPublicar: 4 });
linea(soloPiezas[0]?.porQue.includes('Generar otra no sirve si esta no salió'),
  'y se lo dice de frente');

console.log('\n══ el que no lanzó ══');
const instalando = loQueSigue({
  ...base, lanzado: false, diasLanzado: 0,
  faltaInstalar: [{ id: 'a', titulo: 'Poner tu foto de perfil' }, { id: 'b', titulo: 'x' }],
});
linea(instalando.some((t) => t.origen === 'instalacion'), 've qué le falta instalar');
linea(!instalando.some((t) => t.id === 'cargar_numeros'),
  'y NUNCA se le pide cargar números: no tiene campaña corriendo');
linea(instalando[0].porQue.includes('para encender'),
  'con el motivo en su idioma: es lo que le falta para encender');

console.log('\n══ los primeros días no se toca nada ══');
const recien = loQueSigue({ ...base, diasLanzado: 1, numerosSinCargar: 3 });
linea(!recien.some((t) => t.id === 'cargar_numeros'),
  'al día 1 no se le piden números: todavía no hay nada que medir');
linea(titularDelCliente(recien, { lanzado: true, diasLanzado: 1 }).includes('correr'),
  'y el titular se lo dice: dejarla correr');

console.log('\n══ el titular ══');
linea(titularDelCliente([], { lanzado: true, diasLanzado: 20 }).includes('nada trabado'),
  'sin nada pendiente lo celebra');
const t2 = titularDelCliente(loQueSigue({ ...base, numerosSinCargar: 1 }), { lanzado: true, diasLanzado: 12 });
linea(t2.includes('2 minutos'),
  `dice cuánto le va a llevar en total: "${t2}"`);

console.log('\n══ cada tarea lleva a algún lado ══');
linea(Object.values(QUE_HACE).every((q) => q.length > 8),
  'cada destino tiene su botón, en su idioma');
linea(QUE_HACE.entrenador === 'Hablar con quien sabe',
  'y el del entrenador no dice «agente» ni «IA»: dice quien sabe');
linea(loQueSigue({ ...base }).length === 0,
  'y si no hay nada, no se inventa trabajo');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
