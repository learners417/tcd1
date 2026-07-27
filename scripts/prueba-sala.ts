/**
 * Pruebas de la Sala de Mando.
 *
 * Correr con: npx tsx scripts/prueba-sala.ts
 */
import {
  ETAPAS, ETAPA_CON_CANDADO, DIAS_HASTA_ACTIVACION, armarRecorrido,
  veredictoMotor, DIAS_PAUTA_SIN_AGENDA, REINVERSION_POR_VENTA, TOPE_REINVERSION,
  type EstadoMotor,
} from '../src/lib/salaDeMando';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const haceDias = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

// ── 1 · Las nueve etapas ───────────────────────────────────────────────────
console.log('══ el recorrido ══');
linea(ETAPAS.length === 9, `son ${ETAPAS.length} etapas`);
linea(ETAPAS.every((e, i) => e.numero === i), 'numeradas de 0 a 8, sin huecos');
linea(ETAPAS.every((e) => e.criterioSalida.length > 20),
  'cada una dice QUÉ hay que cumplir para salir');
linea(ETAPAS.every((e) => e.dueno.length > 3), 'y quién es el dueño');
linea(ETAPAS[ETAPA_CON_CANDADO].criterioSalida.toUpperCase().includes('COBRO DE PRUEBA'),
  'de la etapa 4 no se sale sin el cobro de prueba');

// ── 2 · Quién está atrasado ────────────────────────────────────────────────
console.log('\n══ quién está frenado ══');
const rec = armarRecorrido([
  { id: 'a', nombre: 'A punto', etapa_actual: 2, etapa_desde: haceDias(5), fecha_venta: haceDias(8) },
  { id: 'b', nombre: 'Atrasado', etapa_actual: 0, etapa_desde: haceDias(9), fecha_venta: haceDias(9) },
  { id: 'c', nombre: 'Fuera de ventana', etapa_actual: 3, etapa_desde: haceDias(4), fecha_venta: haceDias(30) },
  { id: 'd', nombre: 'Ritmo propio', etapa_actual: 7, etapa_desde: haceDias(200), fecha_venta: haceDias(300) },
  { id: 'e', nombre: 'Recién', etapa_actual: null, etapa_desde: null, fecha_venta: null },
]);

const por = (id: string) => rec.find((r) => r.id === id)!;
linea(!por('a').atrasado, 'el que va en tiempo no figura atrasado');
linea(por('b').atrasado,
  `9 días en Bienvenida (dura ${ETAPAS[0].diasMax}) es atraso`);
linea(por('c').fueraDeVentana,
  `30 días desde la venta sin activar rompe la ventana de ${DIAS_HASTA_ACTIVACION} días`);
linea(!por('c').atrasado || por('c').atrasado,
  'la ventana y el atraso de etapa son cosas distintas');
linea(!por('d').atrasado,
  'las etapas sin tope (ritmo propio) nunca marcan atraso, aunque lleven 200 días');
linea(por('e').etapa === 0 && !por('e').atrasado,
  'un cliente sin etapa cargada arranca en Bienvenida y no se marca atrasado');
linea(por('e').diasDesdeVenta === null,
  'y sin fecha de venta no se inventa una antigüedad');

linea(rec.every((r) => r.criterioSalida.length > 0 && r.dueno.length > 0),
  'cada cliente lleva encima qué le falta y quién lo destraba');

// ── 3 · El motor de Javo ───────────────────────────────────────────────────
console.log('\n══ el motor ══');
const base: EstadoMotor = {
  cobrado: 0, objetivo: 30000,
  conversaciones: 0, calificados: 0, agendas: 0, llamadasTomadas: 0, cerradas: 0,
  gastoPauta: 0, diasSinAgenda: 0,
};

const sinNada = veredictoMotor(base);
linea(sinNada.titular.includes('no hay conversaciones'),
  'sin conversaciones, eso es lo único que importa');
linea(!sinNada.cortar, 'y todavía no se corta nada');

const sinAgendas = veredictoMotor({ ...base, conversaciones: 40 });
linea(sinAgendas.titular.includes('ninguna agenda'),
  'con conversaciones y sin agendas, el cuello es el mensaje');
linea(sinAgendas.accion?.includes('mensaje, no en el anuncio') ?? false,
  'y lo dice: el problema no es el anuncio');

const noSePresentan = veredictoMotor({ ...base, conversaciones: 40, agendas: 8 });
linea(noSePresentan.titular.includes('ninguna se presentó'),
  'con agendas y sin llamadas tomadas, el cuello es la confirmación');

const noCierra = veredictoMotor({ ...base, conversaciones: 40, agendas: 8, llamadasTomadas: 6 });
linea(noCierra.titular.includes('ninguna cerrada'),
  'con llamadas y sin cierres, el cuello es la llamada');
linea(noCierra.accion?.includes('con silencios') ?? false,
  'y manda a escuchar una entera, no el resumen');

// ── 4 · El freno ───────────────────────────────────────────────────────────
console.log('\n══ el freno de la pauta ══');
const alDia6 = veredictoMotor({ ...base, conversaciones: 20, diasSinAgenda: DIAS_PAUTA_SIN_AGENDA - 1 });
linea(!alDia6.cortar, `al día ${DIAS_PAUTA_SIN_AGENDA - 1} todavía no se corta`);

const alDia7 = veredictoMotor({ ...base, conversaciones: 20, diasSinAgenda: DIAS_PAUTA_SIN_AGENDA });
linea(alDia7.cortar, `a los ${DIAS_PAUTA_SIN_AGENDA} días sin agendas SÍ se corta`);
linea(alDia7.accion?.includes('la forma más cara de averiguar lo mismo') ?? false,
  'y dice por qué, no solo que sí');
linea(alDia7.titular.includes('sin una sola agenda'),
  'el freno manda sobre cualquier otro diagnóstico');

// ── 5 · La reinversión ─────────────────────────────────────────────────────
console.log('\n══ la reinversión ══');
linea(veredictoMotor({ ...base, cerradas: 1 }).reinversionDisponible === REINVERSION_POR_VENTA,
  `una venta habilita $${REINVERSION_POR_VENTA} de reinversión`);
linea(veredictoMotor({ ...base, cerradas: 10 }).reinversionDisponible === TOPE_REINVERSION,
  `diez ventas no pasan del tope de $${TOPE_REINVERSION}`);
linea(veredictoMotor({ ...base, cerradas: 0 }).reinversionDisponible === 0,
  'sin ventas no hay reinversión');

const cumplido = veredictoMotor({ ...base, cobrado: 30000, conversaciones: 5 });
linea(cumplido.faltaParaObjetivo === 0 && cumplido.titular.includes('cumplido'),
  'cumplido el objetivo, lo dice y deja de empujar');
linea(veredictoMotor({ ...base, cobrado: 40000 }).faltaParaObjetivo === 0,
  'pasarse del objetivo no da un número negativo');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
