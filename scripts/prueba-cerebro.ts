/**
 * Pruebas del cerebro.
 *
 * Lo que se juega: si la lista no es una sola, nadie puede entender su día. Y
 * si el orden no es confiable, se atiende lo que suena urgente en vez de lo
 * que cuesta dinero.
 *
 * Correr con: npx tsx scripts/prueba-cerebro.ts
 */
import {
  desdeLaCadena, desdeElSoporte, desdeElRecorrido, desdeUnaSesion,
  ordenar, porArea, titularDelDia, POR_QUE, ETIQUETA_DESTINO,
  type Origen, type Destino,
} from '../src/lib/cerebro';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const hace = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

console.log('══ las cinco fuentes, una lista ══');
const ORIGENES: Origen[] = ['cadena', 'soporte', 'recorrido', 'sesion', 'persona'];
linea(ORIGENES.every((o) => POR_QUE[o].length > 20),
  'cada origen se explica solo: eso contesta «¿por qué esta tarea?»');
const DESTINOS: Destino[] = ['mensaje', 'contenido', 'campana', 'conversacion', 'numeros', 'escalar', 'ninguno'];
linea(DESTINOS.every((d) => ETIQUETA_DESTINO[d].length > 5),
  'y cada destino dice qué hace el botón');

console.log('\n══ desde la cadena ══');
const cadena = desdeLaCadena({
  clienteId: 'a', nombre: 'Rosana', cuello: 'conv_a_agenda',
  accion: 'Revisar el DM con ella', mensaje: 'Pasame tres conversaciones',
  enRiesgo: 1000, semanasIgual: 0,
});
linea(cadena.origen === 'cadena' && cadena.ref === 'conv_a_agenda',
  'guarda de dónde vino y qué la causó');
linea(cadena.destino === 'mensaje' && cadena.textoListo === 'Pasame tres conversaciones',
  'un cuello de ejecución se resuelve con un mensaje YA ESCRITO');
linea(cadena.descripcion.includes('el mensaje la pierde'),
  'y la descripción dice qué significa el cuello, no su nombre técnico');
linea(cadena.area === 'setting', 'con su área, para poder agrupar');

const tecnico = desdeLaCadena({
  clienteId: 'a', nombre: 'Ana', cuello: 'comentario_a_conversacion',
  accion: 'x', mensaje: 'y', enRiesgo: 1000, semanasIgual: 0,
});
linea(tecnico.destino === 'escalar' && !tecnico.textoListo,
  'lo técnico NO se resuelve con un mensaje al cliente: se escala');

const insistente = desdeLaCadena({
  clienteId: 'a', nombre: 'x', cuello: 'conv_a_agenda', accion: 'y', mensaje: 'z',
  enRiesgo: 1000, semanasIgual: 4,
});
linea(insistente.peso > cadena.peso * 2,
  'cuatro semanas con lo mismo pesa el triple: no se arregla repitiendo el mensaje');

console.log('\n══ desde el soporte ══');
const esperando = desdeElSoporte({
  clienteId: 'b', nombre: 'Marina', mensajeId: 'm1',
  texto: 'no me llega el DM', horas: 5, vencido: false, esRoto: false,
});
linea(esperando.peso > insistente.peso,
  'alguien esperando respuesta pesa MÁS que el peor cuello: una cuenta rota se destraba mañana, una persona esperando se va hoy');
const roto = desdeElSoporte({
  clienteId: 'b', nombre: 'x', mensajeId: 'm2', texto: 'y',
  horas: 2, vencido: false, esRoto: true,
});
linea(roto.destino === 'escalar' && roto.venceEn === 0,
  'un error reportado va al dev y vence hoy');
linea(roto.peso > esperando.peso, 'y pesa más que una duda');

console.log('\n══ desde el recorrido ══');
const trabado = desdeElRecorrido({
  clienteId: 'c', nombre: 'Diego', etapa: 'Método y oferta',
  semanas: 4, situacion: 'trabado_en_su_metodo',
});
linea(trabado.destino === 'escalar',
  'un trabado NO se destraba con un mensaje: se destraba con una sesión');
linea(trabado.descripcion.includes('miedo'),
  'y trae el criterio escrito: le da miedo comprometerse');
linea(trabado.peso < esperando.peso,
  'pero pesa menos que alguien esperando respuesta');

console.log('\n══ desde una sesión ══');
const pendiente = desdeUnaSesion({
  clienteId: 'd', texto: 'Mandarle el guion revisado', sesionId: 's1', paraElCliente: true,
});
linea(pendiente.origen === 'sesion' && pendiente.destino === 'mensaje',
  'un pendiente de sesión para el cliente se manda');

console.log('\n══ el orden ══');
const lista = ordenar([
  { ...cadena, creadaEn: hace(0) },
  { ...esperando, creadaEn: hace(0) },
  { ...trabado, creadaEn: hace(10) },
]);
linea(lista[0].vencida, 'lo VENCIDO va primero, siempre');
linea(lista[0].porQueAca.includes('se prometió antes'),
  'y dice por qué: una tarea vencida ya falló una vez');
linea(lista[1].origen === 'soporte', 'después el soporte');
linea(lista[1].porQueAca.includes('esperando respuesta'), 'con su explicación');
linea(ordenar([]).length === 0, 'sin tareas no rompe');
linea(ordenar([{ ...cadena }]).length === 1 && !ordenar([{ ...cadena }])[0].vencida,
  'una tarea sin fecha de creación no se marca vencida por las dudas');

console.log('\n══ por área ══');
const grupos = porArea(ordenar([
  { ...cadena, creadaEn: hace(0) },
  { ...desdeLaCadena({ clienteId: 'z', nombre: 'Otra', cuello: 'conv_a_agenda',
      accion: 'x', mensaje: 'y', enRiesgo: 500, semanasIgual: 0 }), creadaEn: hace(0) },
  { ...roto, creadaEn: hace(0) },
]));
linea(grupos.find((g) => g.area === 'setting')?.tareas.length === 2,
  'los dos de setting quedan juntos');
linea(grupos[0].tareas.some((t) => t.origen === 'soporte') || grupos[0].tareas[0].peso > 10_000,
  'y el grupo que va arriba es el que tiene lo más urgente adentro');

console.log('\n══ el titular ══');
linea(titularDelDia([]).includes('nada que necesite'), 'sin tareas lo dice');
linea(titularDelDia(ordenar([{ ...trabado, creadaEn: hace(10) }])).includes('vencida'),
  'con algo vencido, eso manda');
linea(titularDelDia(ordenar([{ ...esperando, creadaEn: hace(0) }])).includes('esperando respuesta'),
  'sin vencidos, manda el soporte');
linea(titularDelDia(ordenar([{ ...cadena, creadaEn: hace(0) }])).includes('necesitan que entres')
   || titularDelDia(ordenar([{ ...cadena, creadaEn: hace(0) }])).includes('necesita que entres'),
  'y si no, la cuenta de siempre');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
