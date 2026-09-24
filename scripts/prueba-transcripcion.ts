/**
 * Pruebas de la extracción de transcripciones.
 *
 * Lo que se juega: lo que salga de acá va al registro de decisiones del
 * negocio y se convierte en tareas con dueño. Una lectura mal hecha que se
 * guarda sola es un dato falso con apariencia de registro.
 *
 * Correr con: npx tsx scripts/prueba-transcripcion.ts
 */
import {
  leerExtraccion, puedeExtraerse, resumirExtraccion, promptDeExtraccion,
  MINIMO_CARACTERES, EXTRACCION_VACIA,
} from '../src/lib/transcripcion';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const BUENA = JSON.stringify({
  decisiones: ['El precio del programa queda en $1.000, sin cuotas al principio.'],
  pendientes: [
    { que: 'Grabar las tres piezas de la semana', dueno: 'cliente', cuando: 'viernes' },
    { que: 'Revisar el DM automático', dueno: 'equipo' },
    { que: 'Definir si suma un bono', dueno: 'sin_asignar' },
  ],
  cambios: ['Cambió el avatar: ahora apunta a mujeres de 40 a 55, no a 30 a 45.'],
  resumenParaElCliente: 'Grabas las tres piezas el viernes. Dejamos el precio en $1.000 sin cuotas. Nosotros revisamos tu DM.',
});

console.log('══ la lectura ══');
const e = leerExtraccion(BUENA);
linea(!e.vacia, 'una extracción con contenido no figura vacía');
linea(e.decisiones.length === 1, 'lee la decisión');
linea(e.pendientes.length === 3, 'lee los tres pendientes');
linea(e.cambios.length === 1, 'lee el cambio');
linea(e.resumenParaElCliente.startsWith('Grabas'),
  'el resumen del cliente empieza por lo que ÉL tiene que hacer');
linea(e.pendientes[0].dueno === 'cliente' && e.pendientes[1].dueno === 'equipo',
  'cada pendiente sabe de quién es');
linea(e.pendientes[0].cuando === 'viernes', 'y para cuándo, si se dijo');
linea(e.pendientes[2].cuando === undefined, 'si no se dijo, no se inventa una fecha');

console.log('\n══ los modelos envuelven el JSON ══');
linea(leerExtraccion('```json\n' + BUENA + '\n```').decisiones.length === 1,
  'lo lee dentro de un bloque de código');
linea(leerExtraccion('Claro, acá va:\n' + BUENA + '\nEspero que sirva.').decisiones.length === 1,
  'y envuelto en texto — perder una extracción por unas comillas sería tirar la sesión');

console.log('\n══ lo que NO puede pasar ══');
linea(leerExtraccion('').vacia, 'una respuesta vacía no rompe');
linea(leerExtraccion('no entendí nada').vacia, 'una respuesta que no es JSON no rompe');
linea(leerExtraccion('{roto').vacia, 'un JSON roto no rompe');
linea(leerExtraccion(JSON.stringify({ decisiones: 'no es lista' })).vacia,
  'un campo del tipo equivocado no rompe');

const conBasura = leerExtraccion(JSON.stringify({
  decisiones: ['El precio queda en $1.000', '', '  ', 'x'],
  pendientes: [{ que: '' }, { que: 'vale', dueno: 'inventado' }],
  cambios: [],
}));
linea(conBasura.decisiones.length === 1,
  'las líneas vacías o de una letra se descartan');
linea(conBasura.pendientes.length === 1 && conBasura.pendientes[0].dueno === 'sin_asignar',
  'un dueño inventado cae en sin_asignar, no se acepta cualquier cosa');

const enorme = leerExtraccion(JSON.stringify({
  decisiones: Array(50).fill('una decisión larga de prueba'),
  pendientes: [], cambios: [],
}));
linea(enorme.decisiones.length <= 12,
  'una respuesta desbordada se corta: doce puntos ya no se leen');

console.log('\n══ antes de gastar una llamada ══');
linea(!puedeExtraerse('').puede, 'sin texto no se manda nada');
linea(!puedeExtraerse('x'.repeat(MINIMO_CARACTERES - 1)).puede,
  `menos de ${MINIMO_CARACTERES} caracteres no es una sesión`);
linea(puedeExtraerse('x'.repeat(MINIMO_CARACTERES + 1)).puede, 'con una sesión real sí');
linea((puedeExtraerse('hola').porque ?? '').toLowerCase().includes('escríbela'),
  'y cuando no se puede, dice qué hacer en vez de solo negarse');

console.log('\n══ el prompt ══');
const p = promptDeExtraccion('lo que se dijo', 'Rosana');
linea(p.includes('Rosana'), 'nombra al cliente');
linea(p.includes('NO inventes'), 'le prohíbe inventar');
linea(p.includes('NO es una decisión'),
  'y le marca la diferencia entre lo que se conversó y lo que se decidió');
linea(p.includes('de tú'), 'pide castellano neutro');
const largo = promptDeExtraccion('x'.repeat(40000), 'X');
linea(largo.length < 30000, 'una transcripción enorme se recorta antes de mandarla');

console.log('\n══ el resumen para quien cargó ══');
linea(resumirExtraccion(EXTRACCION_VACIA).includes('a mano'),
  'si no salió nada, le dice que lo escriba a mano');
linea(resumirExtraccion(e).includes('Revísalo'),
  'y si salió, le recuerda revisarlo antes de guardar');
linea(resumirExtraccion(e).includes('1 decisión'),
  'con los números en singular cuando corresponde');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
