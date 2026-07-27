/**
 * Pruebas del recomendador de fórmulas.
 *
 * Lo que verifica y no verifica el compilador: que la regla del Manual se
 * cumpla siempre (una de cada familia), que a un sanador sin prueba propia
 * nunca se le proponga una fórmula que exige prueba, y que cada elección
 * venga con un motivo escrito.
 *
 * Correr con: npx tsx scripts/prueba-formulas.ts
 */
import {
  recomendarFormulas, formulasBloqueadas, FORMULAS_ANUNCIOS,
  estadoDeLasPiezas, auditarPieza,
  type SenalesSanador,
} from '../src/lib/formulasAnuncios';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const familiaDe = (id: number) => FORMULAS_ANUNCIOS.find((f) => f.id === id)?.familia;

// Los perfiles reales que llegan a la app.
const PERFILES: Array<[string, SenalesSanador]> = [
  ['recién empieza (no tiene nada todavía)',
    { tienePrueba: false, marcaPersonal: false, tieneFrases: false, metodoConNombre: false, tienePiedras: false }],
  ['marca personal con historia y un caso real',
    { tienePrueba: true, marcaPersonal: true, tieneFrases: true, metodoConNombre: true, tienePiedras: true }],
  ['tiene método y frases, pero ningún caso propio',
    { tienePrueba: false, marcaPersonal: true, tieneFrases: true, metodoConNombre: true, tienePiedras: true }],
  ['avatar corporativo, sin dar la cara',
    { tienePrueba: true, marcaPersonal: false, tieneFrases: false, metodoConNombre: true, tienePiedras: false }],
  ['tiene las piedras cargadas y nada más',
    { tienePrueba: false, marcaPersonal: false, tieneFrases: false, metodoConNombre: false, tienePiedras: true }],
];

console.log('══ qué le propone la app a cada uno ══');
for (const [nombre, s] of PERFILES) {
  const r = recomendarFormulas(s);
  const ids = [r.piedras.id, r.dolor_historia.id, r.resultado_metodo.id];

  console.log(`\n  ${nombre}`);
  console.log(`    ${ids.join(' · ')} → ${r.piedras.nombre} / ${r.dolor_historia.nombre} / ${r.resultado_metodo.nombre}`);

  // La regla del Manual: una de cada familia, y tres distintas.
  const familias = ids.map(familiaDe);
  linea(familias[0] === 'piedras' && familias[1] === 'dolor_historia'
     && familias[2] === 'resultado_metodo',
    '    una de cada familia, como manda el Manual');
  linea(new Set(ids).size === 3, '    las tres son distintas');

  // Cada elección tiene que explicarse.
  linea([r.piedras, r.dolor_historia, r.resultado_metodo].every((x) => x.porQue.length > 50),
    '    cada fórmula viene con su motivo escrito');

  // Nunca proponerle una fórmula que exige algo que no tiene.
  if (!s.tienePrueba) {
    linea(!ids.includes(4) && !ids.includes(9),
      '    sin prueba propia NO se le propone la 4 ni la 9 (exigen un caso real)');
  }
  if (!s.marcaPersonal) {
    linea(!ids.includes(7) && !ids.includes(14),
      '    sin marca personal NO se le propone la 7 ni la 14 (piden dar la cara)');
  }
}

// ── Lo que se le dice que todavía no puede usar ────────────────────────────
console.log('\n══ lo que se le explica que le falta ══');
const nuevo = PERFILES[0][1];
const bloq = formulasBloqueadas(nuevo);
linea(bloq.length >= 3, `al que recién empieza se le explican ${bloq.length} fórmulas que aún no le sirven`);
linea(bloq.every((b) => b.porQue.length > 40),
  'cada una dice QUÉ le falta, no solo que no puede');
bloq.forEach((b) => console.log(`    ${b.id} ${b.nombre}: ${b.porQue.slice(0, 62)}…`));

const completo = PERFILES[1][1];
linea(formulasBloqueadas(completo).length === 0,
  'al que tiene todo no se le bloquea ninguna');

// ── Determinismo: el mismo ADN da siempre lo mismo ─────────────────────────
console.log('\n══ el mismo ADN da siempre lo mismo ══');
const a = recomendarFormulas(PERFILES[2][1]);
const b = recomendarFormulas(PERFILES[2][1]);
linea(a.piedras.id === b.piedras.id && a.dolor_historia.id === b.dolor_historia.id
   && a.resultado_metodo.id === b.resultado_metodo.id,
  'la recomendación es determinista: no cambia entre una visita y la siguiente');

// ── El candado que se verifica solo ────────────────────────────────────────
console.log('\n══ el candado de los anuncios ══');

const PIEZA_COMPLETA = [
  '¿Cansada de probar dietas que no te devuelven la energía?',
  'No necesitas otra dieta. No necesitas contar calorías. Deja de perseguir el peso.',
  'Funciona como recablear un interruptor: el Método NORTE trabaja las 4 dimensiones.',
  'Mi paciente pasó de arrastrarse a las 4 de la tarde a entrenar de noche.',
  'A las 3 AM te despiertas con culpa y agotada de fingir que estás bien.',
  'No es magia y no pasó de la noche a la mañana: tarda unas semanas.',
  'Comenta "ENERGIA" y te mando el camino.',
].join('\n');

const PIEZA_FLOJA = 'Hola, te cuento algo interesante sobre nutrición.';

linea(auditarPieza(PIEZA_COMPLETA).aprobada,
  'una pieza con los ingredientes pasa la auditoría');
linea(!auditarPieza(PIEZA_FLOJA).aprobada,
  'una pieza floja NO pasa');

const tres = { 1: { formulaId: 1, texto: PIEZA_COMPLETA },
               15: { formulaId: 15, texto: PIEZA_COMPLETA },
               10: { formulaId: 10, texto: PIEZA_COMPLETA } };
const e1 = estadoDeLasPiezas(tres, [1, 15, 10]);
linea(e1.listas && e1.escritas === 3 && e1.aprobadas === 3,
  'con las 3 escritas y auditadas, el candado se marca solo');

const dosBuenas = { ...tres, 10: { formulaId: 10, texto: PIEZA_FLOJA } };
const e2 = estadoDeLasPiezas(dosBuenas, [1, 15, 10]);
linea(!e2.listas && e2.escritas === 3 && e2.aprobadas === 2,
  'con una floja el candado NO se marca, aunque estén las tres escritas');
linea(e2.pendientes.length === 1 && e2.pendientes[0].falta.length > 0,
  'y dice exactamente qué le falta a cuál');

const faltaUna = { 1: tres[1], 15: tres[15] };
const e3 = estadoDeLasPiezas(faltaUna, [1, 15, 10]);
linea(!e3.listas && e3.escritas === 2
   && e3.pendientes.some((x) => x.falta.includes('todavía no está escrita')),
  'una pieza que ni se escribió se distingue de una que no pasó');

linea(!estadoDeLasPiezas({}, []).listas,
  'sin piezas ni selección, el candado nunca se marca solo');

// El candado también mira las políticas, no solo los ingredientes.
const PIEZA_COMPLETA_PERO_PROHIBIDA = PIEZA_COMPLETA.replace(
  '¿Cansada de probar dietas que no te devuelven la energía?',
  'Si tú tienes ansiedad, esto es para ti.');
const conProhibida = { ...tres, 10: { formulaId: 10, texto: PIEZA_COMPLETA_PERO_PROHIBIDA } };
const e4 = estadoDeLasPiezas(conProhibida, [1, 15, 10]);
linea(!e4.listas,
  'una pieza con los 8 ingredientes pero que rompe políticas NO deja marcar el candado');
linea(e4.pendientes.some((x) => x.falta.some((f) => f.includes('no se puede publicar'))),
  'y el motivo dice que es de publicación, no de ingredientes');

// Sin la palabra clave, la campaña queda muda aunque la pieza sea perfecta.
const CON_PANTALLAS = [
  'PANTALLA 1: ¿Cansada de probar dietas que no te devuelven la energía?',
  'PANTALLA 2: No necesitas otra dieta. Deja de contar calorías.',
  'PANTALLA 3: Funciona como recablear un interruptor: el Método NORTE.',
  'PANTALLA 4: Mi paciente pasó de arrastrarse a entrenar de noche.',
  'PANTALLA 5: A las 3 AM te despiertas con culpa. No es magia, tarda.',
  'PANTALLA 6: Comenta "ENERGIA" y te mando el camino.',
].join('\n');
const conPalabra = { 1: { formulaId: 1, texto: CON_PANTALLAS },
                     15: { formulaId: 15, texto: CON_PANTALLAS },
                     10: { formulaId: 10, texto: CON_PANTALLAS } };
linea(estadoDeLasPiezas(conPalabra, [1, 15, 10], 'ENERGIA').listas,
  'con la palabra clave en el cierre, el candado se marca');
const e5 = estadoDeLasPiezas(conPalabra, [1, 15, 10], 'DESPERTAR');
linea(!e5.listas && e5.pendientes[0].falta.some((f) => f.includes('DESPERTAR')),
  'con otra palabra configurada, el candado avisa que falta en el cierre');
linea(estadoDeLasPiezas(conPalabra, [1, 15, 10]).listas,
  'sin palabra configurada no se exige (todavía no llegó a esa sesión)');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
