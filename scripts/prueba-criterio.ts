/**
 * Pruebas del criterio escrito y el glosario.
 *
 * Lo que se juega: las tres situaciones son las que hoy terminan en una
 * pregunta hacia dirección. Escribirlas es lo que hace que dejen de llegar —
 * y el objetivo de la función criterio es que sus minutos bajen porque el
 * criterio está escrito, no porque nadie pregunte.
 *
 * Correr con: npx tsx scripts/prueba-criterio.ts
 */
import {
  CRITERIOS, TODAS, criterioQueAplica, patronesDeExcepciones,
  VECES_PARA_SER_PRODUCTO, type ExcepcionRegistrada,
} from '../src/lib/criterio';
import {
  GLOSARIO, TERMINOS, MAXIMO_TERMINOS, buscarTermino,
} from '../src/lib/glosario';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

console.log('══ las tres situaciones de criterio ══');
linea(TODAS.length === 3, 'son las tres que hoy llegan a dirección');
linea(TODAS.every((s) => CRITERIOS[s].loQuePasa.length > 60),
  'cada una dice LO QUE PASA DE VERDAD, no solo qué hacer');
linea(TODAS.every((s) => CRITERIOS[s].comoSeDice.length > 80),
  'y trae el mensaje listo para mandar');
linea(TODAS.every((s) => CRITERIOS[s].hastaCuando.length > 40),
  'cada una tiene un LÍMITE: hasta dónde se sostiene la salida por defecto');
linea(TODAS.every((s) => CRITERIOS[s].loQueNo.length >= 2),
  'y dice qué NO se hace');
linea(TODAS.every((s) => CRITERIOS[s].loQueNo.every((n) => n.porque.length > 40)),
  'con el motivo de cada negativa, para que nadie la afloje sin pensar');
linea(TODAS.every((s) => CRITERIOS[s].cuandoEsSenal.length > 60),
  'y cuándo deja de ser una excepción y pasa a ser problema de producto');

console.log('\n══ el criterio del método ══');
const m = CRITERIOS.trabado_en_su_metodo;
linea(m.loQuePasa.includes('miedo a comprometerse') || m.loQuePasa.includes('miedo'),
  'no le falta información: le da miedo comprometerse');
linea(m.queSeHace.includes('MÁS CHICO QUE SE PUEDA PROBAR'),
  'y la salida es elegir por él lo más chico que se pueda probar');
linea(m.comoSeDice.includes('ya lo estás haciendo'),
  'el mensaje le dice que su método ya existe');
linea(m.comoSeDice.toLowerCase().includes('nada de esto es para siempre'),
  'y le quita el peso de la decisión');
linea(m.hastaCuando.includes('resentimiento'),
  'el límite tiene su motivo: pagar por algo que no se usa se vuelve resentimiento');
linea(m.loQueNo.some((n) => n.que.includes('más contenido')),
  'y prohíbe lo que sale natural: mandarle más material');

console.log('\n══ el criterio del pedido fuera de plan ══');
const p = CRITERIOS.pide_fuera_de_plan;
linea(p.loQuePasa.includes('quiere resolver algo'),
  'casi nunca quiere lo que pidió: quiere resolver algo');
linea(p.queSeHace.includes('qué SÍ tiene'),
  'primero se busca qué sí tiene para eso');
linea(p.loQueNo.some((n) => n.que.includes('excepción')),
  'y prohíbe la excepción de una vez');
linea(p.loQueNo.find((n) => n.que.includes('excepción'))!.porque.includes('ticket alto'),
  'con el motivo: el que paga el ticket alto se enteró de que no hacía falta');
linea(p.cuandoEsSenal.includes('señal de producto'),
  'tres pedidos iguales no son excepción: son señal de producto');

console.log('\n══ el criterio de la baja ══');
const b = CRITERIOS.quiere_pausar;
linea(b.loQuePasa.includes('DOS motivos'),
  'hay dos motivos y se atienden distinto');
linea(b.queSeHace.includes('ANTES de hablar de la baja'),
  'si es «no funciona», se mira su cadena ANTES');
linea(b.queSeHace.includes('FECHA DE VUELTA'),
  'y si es circunstancia, se pausa con fecha de vuelta');
linea(b.hastaCuando.includes('baja que nadie quiso decir'),
  'una pausa sin fecha es una baja que nadie quiso decir');
linea(b.loQueNo.some((n) => n.que.includes('descuento')),
  'y prohíbe retener con descuento');
linea(b.loQueNo.find((n) => n.que.includes('descuento'))!.porque.includes('se va igual'),
  'con el motivo: el que se va por un descuento se va igual el mes que viene');
linea(b.loQueNo.some((n) => n.porque.includes('falla de seguimiento')),
  'y nombra lo incómodo: aceptar la baja sin mirar la cadena es una falla nuestra');

console.log('\n══ lo que la app puede detectar sola ══');
linea(criterioQueAplica({ semanasEnMetodo: 4, etapa: 1 }) === 'trabado_en_su_metodo',
  'cuatro semanas en el método se detecta de los datos');
linea(criterioQueAplica({ semanasEnMetodo: 1, etapa: 1 }) === null,
  'una semana todavía no');
linea(criterioQueAplica({ semanasEnMetodo: 4, etapa: 5 }) === null,
  'y quien ya lanzó no está trabado en su método');
linea(criterioQueAplica({}) === null, 'sin datos no inventa nada');

console.log('\n══ cuándo una excepción deja de serlo ══');
const ex = (s: ExcepcionRegistrada['situacion'], c: string, d = 'x'): ExcepcionRegistrada =>
  ({ situacion: s, detalle: d, clienteId: c, cuando: '2026-07-27' });

linea(patronesDeExcepciones([ex('quiere_pausar', 'a'), ex('quiere_pausar', 'b')]).length === 0,
  `dos veces todavía no es patrón (hacen falta ${VECES_PARA_SER_PRODUCTO})`);
const patron = patronesDeExcepciones([
  ex('quiere_pausar', 'a'), ex('quiere_pausar', 'b'), ex('quiere_pausar', 'c'),
]);
linea(patron.length === 1 && patron[0].veces === 3, 'tres veces sí');
linea(patron[0].clientes.length === 3, 'con los tres clientes');
linea(patron[0].lectura.includes('no es la retención'),
  'y la lectura del criterio: si dos se van con el mismo cuello sin atender, el problema no es la retención');

const nuevas = patronesDeExcepciones([
  ex('otra', 'a', 'quiere que le hagamos las historias'),
  ex('otra', 'b', 'pide que le hagamos las historias'),
  ex('otra', 'c', 'pregunta si le hagamos las historias'),
]);
linea(nuevas.length === 1,
  'tres pedidos con redacción parecida se agrupan en uno');
linea(nuevas[0].lectura.includes('Escribirlo es lo que hace que deje de llegar'),
  'y una situación sin criterio dice exactamente qué hacer con ella');

// El límite del agrupador, probado a propósito: agrupa por palabras
// parecidas, NO por significado. No lo aflojo para que pase una prueba —
// bajar el umbral rompería el agrupador de trabas, que usa lo mismo.
const distinto = patronesDeExcepciones([
  ex('otra', 'a', 'quiere que le hagamos las historias'),
  ex('otra', 'b', 'quiere que le hagamos las historias'),
  ex('otra', 'd', 'quiere que le hagamos las historias'),
  ex('otra', 'c', 'nos pide hacer contenido para redes'),
]);
linea(distinto.length === 1 && distinto[0].veces === 3,
  'las tres iguales son un patrón y la cuarta queda aparte: agrupa texto, no significado');
linea(patronesDeExcepciones([]).length === 0, 'sin registro no rompe');

console.log('\n══ el glosario ══');
linea(TERMINOS.length === MAXIMO_TERMINOS,
  `son ${TERMINOS.length} términos, el tope es ${MAXIMO_TERMINOS}`);
linea(Object.values(GLOSARIO).every((t) => t.que.length > 25),
  'cada uno se explica en una o dos frases, sin jerga');
linea(Object.values(GLOSARIO).filter((t) => t.porQue).length >= 9,
  'y la mayoría dice POR QUÉ está definido así');
linea(!!GLOSARIO.cuello_de_botella.porQue?.includes('no deja saber cuál funcionó'),
  'el cuello de botella explica por qué hay uno solo');
linea(!!GLOSARIO.frecuencia.porQue?.includes('NO es que el creativo dejó de servir'),
  'y la frecuencia previene el error más caro: tirar una pieza que estaba bien');
linea(!!GLOSARIO.instalando.porQue?.includes('lo distrae'),
  'instalando explica por qué no se le miran números');

console.log('\n══ buscar un término ══');
linea(buscarTermino('cuello de botella')?.palabra === 'cuello de botella',
  'se encuentra por su nombre');
linea(buscarTermino('CPM')?.palabra === 'CPM', 'en mayúsculas también');
linea(buscarTermino('dominó')?.palabra === 'dominó', 'y con acento');
linea(buscarTermino('inventado') === null,
  'una palabra que no está devuelve null, no algo parecido');
linea(buscarTermino('') === null, 'y una cadena vacía tampoco rompe');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
