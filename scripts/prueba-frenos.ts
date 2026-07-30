/**
 * Pruebas de los frenos y de La Casa completa.
 *
 * Lo que se juega: si los frenos aparecen siempre, dejan de frenar a nadie —
 * y ahí son peores que no tenerlos, porque dan una sensación de control que
 * no existe.
 *
 * Correr con: npx tsx scripts/prueba-frenos.ts
 */
import {
  frenoDe, puedeSeguir, constanciaDe, TOPE_POR_NIVEL,
  type AccionConFreno,
} from '../src/lib/frenos';
import { HISTORIA, SISTEMA_POR_DENTRO, VALORES, INDUCCION } from '../src/lib/casa';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const TODAS: AccionConFreno[] = [
  'encender_campana', 'subir_presupuesto', 'dar_de_baja', 'borrar_adn',
  'cambiar_precio', 'tocar_metodo', 'mandar_como_el',
  'avanzar_etapa', 'apagar_anuncio',
];

console.log('══ los tres niveles ══');
const niveles = TODAS.map((a) => frenoDe(a).nivel);
linea(niveles.filter((n) => n === 'escribir').length <= TOPE_POR_NIVEL.escribir,
  `los de escribir no pasan de ${TOPE_POR_NIVEL.escribir}: cada freno nuevo le quita fuerza a los que ya están`);
linea(new Set(niveles).size === 3, 'están los tres niveles en uso');

linea(frenoDe('encender_campana').nivel === 'escribir',
  'encender una campaña pide escribir: el gasto empieza en ese momento');
linea(frenoDe('cambiar_precio').nivel === 'testigo',
  'cambiar el precio de un cliente deja constancia: le pasa a un tercero');
linea(frenoDe('apagar_anuncio').nivel === 'confirmar',
  'apagar un anuncio solo confirma: se deshace');

console.log('\n══ el título dice qué va a pasar ══');
linea(TODAS.every((a) => !frenoDe(a).titulo.toLowerCase().includes('estás seguro')),
  'NINGUNO pregunta «¿estás seguro?» — preguntar eso no informa nada');
linea(TODAS.every((a) => frenoDe(a).titulo.startsWith('Vas a') || frenoDe(a).titulo.startsWith('De esta')),
  'todos dicen QUÉ va a pasar, en presente');
linea(TODAS.every((a) => frenoDe(a).detalle.length > 60),
  'y todos explican la consecuencia, no solo la acción');

console.log('\n══ los que cuestan dinero ══');
const encender = frenoDe('encender_campana', { nombreCliente: 'Rosana', monto: 140 });
linea(encender.titulo.includes('Rosana') && encender.titulo.includes('$140'),
  `dice el cliente y el monto: "${encender.titulo}"`);
linea(encender.detalle.includes('cobro de prueba'),
  'y recuerda la condición: la cadena probada con un cobro real');
linea(frenoDe('subir_presupuesto').detalle.includes('reinicia el aprendizaje'),
  'subir el presupuesto avisa que reinicia el aprendizaje del algoritmo');
linea(frenoDe('dar_de_baja').detalle.includes('falla de seguimiento'),
  'dar de baja nombra lo incómodo: si había un cuello sin atender, es falla nuestra');

console.log('\n══ escribir para confirmar ══');
const f = frenoDe('encender_campana');
linea(!puedeSeguir(f, ''), 'vacío no alcanza');
linea(!puedeSeguir(f, 'si'), 'cualquier cosa tampoco');
linea(puedeSeguir(f, 'ENCENDER'), 'la palabra exacta sí');
linea(puedeSeguir(f, ' encender '), 'sin distinguir mayúsculas ni espacios: el freno es para que lea, no para que teclee bien');
linea(puedeSeguir(frenoDe('apagar_anuncio'), ''),
  'y los de confirmar no piden escribir nada');

console.log('\n══ la constancia ══');
const c = constanciaDe('cambiar_precio', { quien: 'lupe', clienteId: 'a', detalle: 'x' });
linea(!!c.cuando && c.quien === 'lupe', 'queda con quién y cuándo');
linea(!!frenoDe('cambiar_precio').queda?.includes('lo va a ver'),
  'y el cliente lo ve: el registro no es control, es que el que decide sepa que decide');

console.log('\n══ La Casa completa ══');
linea(INDUCCION.every((s) => s.datos && s.datos.length >= 3),
  'cada sesión trae números concretos, no «esto importa»');
linea(INDUCCION.filter((s) => s.diagrama).length >= 4,
  'y la mayoría tiene su diagrama');
linea(INDUCCION[0].datos!.some((d) => d.includes('$1.000') && d.includes('Cero')),
  'el gradiente está dicho con números');

console.log('\n══ la historia ══');
linea(HISTORIA.length >= 5, `${HISTORIA.length} capítulos`);
linea(HISTORIA.filter((h) => h.pendiente).length === 3,
  'tres están marcados como pendientes: son los que solo puede escribir Javo');
linea(HISTORIA.filter((h) => !h.pendiente).length >= 2,
  'y los que se saben ya están escritos');

console.log('\n══ el sistema por dentro ══');
linea(SISTEMA_POR_DENTRO.length >= 7, `${SISTEMA_POR_DENTRO.length} preguntas contestadas`);
linea(SISTEMA_POR_DENTRO.every((p) => p.respuesta.length > 100),
  'cada una se contesta de verdad, no con una frase');
linea(SISTEMA_POR_DENTRO.some((p) => p.respuesta.includes('nos pasó')),
  'y admite el error propio del costo por conversación');
linea(SISTEMA_POR_DENTRO.some((p) => p.respuesta.includes('La IA escribe; no juzga')),
  'está dicha la regla del diagnóstico');

console.log('\n══ los valores con su costo ══');
linea(VALORES.every((v) => v.cuestaEsto.length > 30 && v.loAceptamosPorque.length > 50),
  'cada valor dice QUÉ CUESTA y por qué se acepta — un valor sin costo es una frase');
linea(VALORES.some((v) => v.valor.includes('descuento')),
  'está el de no retener con descuento');
linea(VALORES.some((v) => v.cuestaEsto.includes('se pierde una agenda')),
  'y el de preferir perder un dato antes que contarlo dos veces');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
