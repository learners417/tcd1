/**
 * Pruebas del chequeo de políticas de publicación.
 *
 * Se juega una cuenta publicitaria inhabilitada, así que vale más frenar de
 * más que de menos — PERO un falso positivo constante hace que el sanador
 * deje de creerle al criterio y publique igual. Por eso hay tantos casos
 * limpios como sucios acá.
 *
 * Correr con: npx tsx scripts/prueba-politicas.ts
 */
import { revisarPoliticas, puedePublicarse } from '../src/lib/formulasAnuncios';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

// ── 1 · Lo que TIENE que frenar ────────────────────────────────────────────
console.log('══ lo que no puede salir ══');

const SUCIOS: Array<[string, string, string]> = [
  ['atributo personal directo', 'Si tú tienes ansiedad, este programa es para ti.', 'atributo_personal'],
  ['atributo sin el pronombre', 'Sufres de insomnio hace años y ya probaste todo.', 'atributo_personal'],
  ['posesivo sobre la condición', 'Tu depresión no se va con fuerza de voluntad.', 'atributo_personal'],
  ['estado personal', 'Estás agotada y deprimida, lo sé.', 'estado_personal'],
  ['garantía de resultado', 'Resultados garantizados en 30 días.', 'garantia'],
  ['cien por ciento efectivo', 'Un método 100% efectivo, sin fallar.', 'garantia'],
  ['cifra de ingreso', 'Vas a facturar $5000 al mes con este sistema.', 'cifra_ingreso'],
  ['ingreso mensual', 'Mis alumnas llegan a $3.000 mensuales.', 'cifra_ingreso'],
  ['lenguaje médico', 'Curo la ansiedad con mi método de 4 pasos.', 'lenguaje_medico'],
  ['tratamiento clínico', 'Tratamiento para la obesidad en 12 semanas.', 'lenguaje_medico'],
  ['antes y después', 'Mira el antes y después de mis pacientes.', 'antes_despues'],
  ['kilos', 'Bajé 18 kilos sin dietas.', 'antes_despues'],
];

for (const [nombre, texto, esperado] of SUCIOS) {
  const a = revisarPoliticas(texto);
  const encontrada = a.find((x) => x.id === esperado);
  linea(!!encontrada, `${nombre} → ${encontrada ? encontrada.id : 'NO LO DETECTÓ'}`);
  if (encontrada) {
    linea(encontrada.comoSeArregla.length > 40,
      `   y dice cómo se escribe lo mismo sin romper la regla`);
  }
}

linea(SUCIOS.every(([, t]) => !puedePublicarse(t)),
  'ninguno de los doce se puede publicar');

// ── 2 · Lo que NO puede frenar (falsos positivos) ──────────────────────────
console.log('\n══ lo que sí puede salir ══');

const LIMPIOS: Array<[string, string]> = [
  ['dolor en tercera persona',
    'Hay días en que el cuerpo no afloja y el techo de las 3 de la mañana se vuelve conocido.'],
  ['pregunta abierta',
    '¿Cansada de terminar el día sin nada para ti? No necesitas otra dieta.'],
  ['la profesión se puede nombrar',
    'Soy nutricionista y acompaño a mujeres que viven aceleradas.'],
  ['acompañar en vez de curar',
    'Acompaño a recuperar la energía. No es magia y no pasa de un día para el otro.'],
  ['caso con descargo',
    'Mi paciente pasó de arrastrarse a entrenar de noche. Resultados individuales, dependen del compromiso de cada persona.'],
  ['garantía de proceso, no de resultado',
    'Si haces los pasos y en 30 días no ves cambios, te devuelvo la inversión.'],
  ['precio de la oferta, no promesa de ingreso',
    'La inversión es de $497 y arrancamos el lunes.'],
  ['hablar del cambio, no del cuerpo',
    'Volvió a jugar con sus hijos sin quedarse sin aire. Resultados individuales.'],
  ['palabras que contienen otras',
    'Con mucha curiosidad empezó a mirar su rutina y encontró la clave.'],
];

for (const [nombre, texto] of LIMPIOS) {
  const a = revisarPoliticas(texto);
  const bloqueantes = a.filter((x) => x.gravedad === 'bloquea');
  linea(bloqueantes.length === 0,
    `${nombre}${bloqueantes.length ? ` → FALSO POSITIVO: ${bloqueantes.map((x) => `${x.id} ("${x.que}")`).join(', ')}` : ''}`);
}

linea(LIMPIOS.every(([, t]) => puedePublicarse(t)),
  'los nueve limpios se pueden publicar');

// ── 3 · El descargo ────────────────────────────────────────────────────────
console.log('\n══ el descargo del testimonio ══');

const conCaso = 'Mi clienta logró volver a dormir de un tirón.';
linea(revisarPoliticas(conCaso).some((a) => a.id === 'testimonio_sin_descargo'),
  'un caso contado sin descargo se marca para revisar');
linea(puedePublicarse(conCaso),
  'pero NO bloquea: es una advertencia, no un impedimento');
linea(!revisarPoliticas(conCaso + ' Resultados individuales.')
  .some((a) => a.id === 'testimonio_sin_descargo'),
  'con el descargo puesto, deja de pedirlo');

// ── 4 · Bordes ─────────────────────────────────────────────────────────────
console.log('\n══ bordes ══');
linea(revisarPoliticas('').length === 0, 'un texto vacío no inventa alertas');
linea(puedePublicarse(''), 'un texto vacío no bloquea (de eso se ocupa la auditoría de ingredientes)');
linea(revisarPoliticas('TÚ TIENES ANSIEDAD').length > 0, 'las mayúsculas no lo esquivan');

const multiple = 'Tú tienes ansiedad. Resultados garantizados. Curo el insomnio.';
linea(revisarPoliticas(multiple).length >= 3, 'detecta varias reglas rotas a la vez');
linea(revisarPoliticas(multiple).every((a) => a.fragmento.includes('…')),
  'cada alerta muestra el fragmento para poder encontrarlo en el texto');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
