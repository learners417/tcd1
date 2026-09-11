/**
 * rubricas.ts — Con qué criterio se juzga cada pieza del Camino.
 *
 * Una rúbrica por sesión estrella. Cada una tiene cuatro partes:
 *   · criterios      — binarios. Si uno necesita interpretación, está mal escrito.
 *   · descalificador — si aparece, no sale, aunque los criterios estén bien.
 *   · veredicto      — sale · sale con reparos · no sale todavía.
 *   · donde_se_arregla — un bloqueo sin destino es un muro.
 */

export type Veredicto = 'sale' | 'reparos' | 'no_sale';

export interface Criterio {
  /** La pregunta, en binario. */
  pregunta: string;
  /** Qué mirar para contestarla. */
  busca: string;
}

export interface Rubrica {
  /** Sesión que juzga. */
  codigo: string;
  pieza: string;
  criterios: Criterio[];
  /** Lo que tumba la pieza aunque los criterios pasen. */
  descalificador: string;
  /** Si no sale, a dónde se manda al cliente. */
  donde_se_arregla: string;
  /** Si true, no puede avanzar sin "sale" o "reparos". */
  bloquea: boolean;
}

export const RUBRICAS: Record<string, Rubrica> = {
  'P3.2': {
    codigo: 'P3.2',
    pieza: 'tu oferta',
    criterios: [
      { pregunta: '¿La promesa nombra un resultado y no una actividad?', busca: 'Acompañamiento, sesiones, seguimiento y espacio son actividades. Dormir, volver a comer sin culpa, dejar de postergar son resultados.' },
      { pregunta: '¿Hay un plazo escrito?', busca: 'Doce semanas, noventa días. Sin plazo no hay programa: hay una suscripción encubierta.' },
      { pregunta: '¿Es una sola oferta?', busca: 'Dos precios, dos duraciones o dos públicos significa que todavía no está lista.' },
      { pregunta: '¿La garantía se puede incumplir?', busca: '"Satisfacción garantizada" no se puede incumplir, así que no es garantía. "Si al día noventa no tienes X, seguimos sin costo" sí.' },
      { pregunta: '¿Los entregables son cosas que la persona recibe?', busca: 'No "doce sesiones conmigo": su plan escrito, sus ejercicios grabados, acceso a su app.' },
      { pregunta: '¿El precio está con número?', busca: 'Un número, no un rango.' },
    ],
    descalificador: 'Que la promesa se cumpla por el solo hecho de asistir. Si alguien puede venir a todas las sesiones, no lograr nada, y aun así la promesa se cumplió, no está vendiendo un resultado: está vendiendo su presencia.',
    donde_se_arregla: 'Vuelve a tu Matriz ABC del día 12: la promesa sale de las palabras de tus consultantes, no de tu cabeza.',
    bloquea: true,
  },

  'P1.5': {
    codigo: 'P1.5',
    pieza: 'tu precio digno',
    criterios: [
      { pregunta: '¿Es un número, no un rango?', busca: '"Entre ochocientos y mil doscientos" significa que todavía no lo decidió.' },
      { pregunta: '¿Está sin descuento de lanzamiento?', busca: 'El descuento de lanzamiento es el miedo disfrazado de estrategia.' },
      { pregunta: '¿Diez personas a ese precio llegan a su meta declarada?', busca: 'Si su meta son diez mil y puso cuatrocientos, la cuenta no cierra y va a trabajar el doble igual.' },
      { pregunta: '¿Sostiene las diez objeciones sin bajarlo?', busca: 'Si alguna respuesta del Guardián incluye una rebaja, el precio no está sellado.' },
    ],
    descalificador: 'Que agregue algo después de decir el número. "Mil dólares, pero podemos ver." El otro no compra el número: lee lo que viene después. Si hay un después, todavía no es su precio.',
    donde_se_arregla: 'Si te cuesta decirlo, no es el guion: es la sesión del linaje del día 3. Vuelve ahí.',
    bloquea: true,
  },

  'P4.2': {
    codigo: 'P4.2',
    pieza: 'tu mensaje',
    criterios: [
      { pregunta: '¿Usa palabras que están en su Matriz ABC?', busca: 'La Matriz se hizo con las palabras literales de sus consultantes. Si el mensaje no las usa, lo escribió su cabeza y no su consultorio.' },
      { pregunta: '¿Nombra a quién no es?', busca: 'Sin exclusión no hay filtro, y sin filtro la agenda se llena de conversaciones que no cierran.' },
      { pregunta: '¿Se entiende sin saber de su profesión?', busca: 'Nada de psicodinámico, neuroplasticidad, holístico ni integral.' },
      { pregunta: '¿Dice el resultado antes que el método?', busca: 'El nombre del método importa después de que entendió qué gana.' },
      { pregunta: '¿Entra en una respiración?', busca: 'Si no lo puede decir de corrido, no lo va a decir nunca en una llamada.' },
    ],
    descalificador: 'Que sirva igual para cualquier colega de su rubro. Si otro profesional puede copiarlo tal cual y le queda bien, no es un mensaje: es una descripción de profesión.',
    donde_se_arregla: 'Vuelve a la Matriz ABC: ahí están las palabras que te faltan.',
    bloquea: false,
  },

  'P4.3e': {
    codigo: 'P4.3e',
    pieza: 'tu VSL',
    criterios: [
      { pregunta: '¿Los primeros treinta segundos demuestran, en vez de prometer?', busca: 'Le muestra que el sistema ya operó sobre él: viste un anuncio, entraste acá, abajo hay una agenda.' },
      { pregunta: '¿Regala el sistema completo antes de convocar?', busca: 'Si convoca antes de enseñar, todo lo anterior se lee como venta.' },
      { pregunta: '¿Hay un momento donde nombra lo que falta?', busca: 'El vacío. Sin eso, el que entendió todo no tiene razón para agendar.' },
      { pregunta: '¿El precio o el rango aparece antes del calendario?', busca: 'Filtra antes de ocupar su agenda, no después.' },
      { pregunta: '¿Pide una sola acción?', busca: 'Agendar. No seguir, no comentar, no descargar.' },
      { pregunta: '¿Dura menos de ocho minutos?', busca: 'Cuenta las palabras: 130 por minuto.' },
    ],
    descalificador: 'Que se pueda cortar por la mitad sin que se pierda nada. Si los primeros cuatro minutos son presentación, trayectoria y contexto, el video empieza en el minuto cuatro y ahí ya no queda nadie.',
    donde_se_arregla: 'El bloque que falta casi siempre es el vacío. Vuelve a la sesión del día 24 y escríbelo tú.',
    bloquea: true,
  },

  'P4.2e': {
    codigo: 'P4.2e',
    pieza: 'tu formulario de filtro',
    criterios: [
      { pregunta: '¿Los datos de contacto van primero?', busca: 'Si abandona en la mitad, al menos queda el contacto y se puede recuperar.' },
      { pregunta: '¿Pregunta hace cuánto atiende?', busca: 'Es el filtro de trayectoria, y es el que más cuida su hora.' },
      { pregunta: '¿Pregunta por la capacidad de inversión, con un mínimo declarado?', busca: 'Sin esto la llamada se entera del precio a los cuarenta minutos y se cae ahí.' },
      { pregunta: '¿Pregunta quién toma la decisión?', busca: 'Y si decide con otro, ¿le pide que esa persona esté en la llamada?' },
      { pregunta: '¿Tiene entre ocho y doce preguntas?', busca: 'Menos no filtra. Más abandona.' },
    ],
    descalificador: 'Que no exista ninguna respuesta que impida agendar. Un filtro que nunca filtra está roto, aunque tenga doce preguntas hermosas.',
    donde_se_arregla: 'La pregunta que casi siempre falta es la de quién decide. Agrégala y vuelve a probar.',
    bloquea: true,
  },

  'P5.2': {
    codigo: 'P5.2',
    pieza: 'tu script de ventas',
    criterios: [
      { pregunta: '¿El precio aparece antes del minuto treinta?', busca: 'El precio a los cuarenta y cuatro minutos no deja tiempo para la decisión.' },
      { pregunta: '¿Hay al menos ocho preguntas antes de hablar de su método?', busca: 'El que llega y presenta, pierde.' },
      { pregunta: '¿Pide la decisión de forma explícita?', busca: '"¿Arrancamos?" tiene que estar escrito. Si no está, no se dice.' },
      { pregunta: '¿Tiene respuesta escrita para "está caro" y para "lo voy a pensar"?', busca: 'Las dos que se llevan la mayoría de las ventas perdidas.' },
      { pregunta: '¿Termina en un sí o en un no?', busca: '"Te mando información" no es un final: es una venta perdida con buenos modales.' },
    ],
    descalificador: 'Que no haya un momento donde se hace silencio. Si el guion no tiene una pausa escrita después del precio, va a llenarla hablando, y el que habla después de decir el número está negociando contra sí mismo.',
    donde_se_arregla: 'Vuelve al manual La Llamada y mira la estructura completa antes de reescribirlo.',
    bloquea: false,
  },

  'P3.7': {
    codigo: 'P3.7',
    pieza: 'tu transición de cartera',
    criterios: [
      { pregunta: '¿Están todos los que atiende hoy, con nombre y monto?', busca: 'Una lista incompleta produce un plan incompleto.' },
      { pregunta: '¿Cada uno está en uno de los tres grupos?', busca: 'Sube de precio, termina su proceso, se deriva. Nadie queda sin grupo.' },
      { pregunta: '¿Hay un mensaje escrito para cada grupo?', busca: 'Escrito, no pensado. El que no está escrito no se dice.' },
      { pregunta: '¿Cada conversación tiene fecha?', busca: 'Sin fecha, la transición no ocurre nunca.' },
    ],
    descalificador: 'Que todos queden en el grupo de "sube de precio". Eso no es una transición: es una ilusión. Siempre hay alguien que termina y alguien que se deriva.',
    donde_se_arregla: 'Si te cuesta poner a alguien en "se deriva", eso es lealtad, no logística. Está en la sesión del día 3.',
    bloquea: false,
  },
};

export function rubricaDe(codigo: string): Rubrica | null {
  return RUBRICAS[codigo] ?? null;
}
