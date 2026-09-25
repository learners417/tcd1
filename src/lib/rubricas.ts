import { roadmap, diaDelCodigo } from './roadmapSeed';
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
  codigo: string | number;
  pieza: string;
  criterios: Criterio[];
  /** Lo que tumba la pieza aunque los criterios pasen. */
  descalificador: string;
  /** Si no sale, a dónde se manda al cliente. */
  donde_se_arregla: string;
  /** Si true, no puede avanzar sin "sale" o "reparos". */
  bloquea: boolean;
}

export const RUBRICAS: Record<string | number, Rubrica> = {

  // ─── Las jornadas nuevas de la Hoja de Ruta ────────────────────────
  2: {
    codigo: 'P1.3', pieza: 'tu permiso escrito',
    criterios: [
      { pregunta: '¿Nombra a alguien concreto de su familia?', busca: 'Un nombre, no "mi familia".' },
      { pregunta: '¿Está escrito en primera persona y en presente?', busca: 'Yo gano, yo me permito. En tercera persona no se hace cargo.' },
      { pregunta: '¿Dice qué mantiene, además de qué cambia?', busca: 'Gano más y sigo siendo de los míos.' },
    ],
    descalificador: 'Escribió una queja sobre su familia en vez de un permiso.',
    donde_se_arregla: 'Vuelve al paso 4: primero el nombre, después la frase.',
    bloquea: false,
  },
  3: {
    codigo: 'P1.4', pieza: 'tus tres disparadores',
    criterios: [
      { pregunta: '¿Las tres situaciones son concretas y repetidas?', busca: 'Cuándo pasa y con quién. "Cuando me cancelan a último momento" sirve.' },
      { pregunta: '¿Escribió qué hace hoy en cada una?', busca: 'La reacción de verdad, sin maquillar.' },
      { pregunta: '¿Marcó dónde lo siente en el cuerpo?', busca: 'Pecho, garganta, estómago.' },
    ],
    descalificador: 'Escribió lo que le gustaría hacer en vez de lo que hace.',
    donde_se_arregla: 'Mira tu semana pasada: la primera situación que te movió el ánimo es la número uno.',
    bloquea: false,
  },
  12: {
    codigo: 'P2.4b', pieza: 'tu método aprobado y tu lista de rodaje',
    criterios: [
      { pregunta: '¿El método volvió aprobado?', busca: 'El visto de Diego, con sus etapas en orden.' },
      { pregunta: '¿La lista de rodaje dice qué se graba el lunes?', busca: 'Cada video con su guion al lado.' },
      { pregunta: '¿Tiene lugar, hora y con qué graba?', busca: 'Decidido hoy, no el domingo a la noche.' },
    ],
    descalificador: 'Llega al lunes con el guion sin escribir.',
    donde_se_arregla: 'Vuelve al día 11: los guiones salen de ahí.',
    bloquea: true,
  },
  24: {
    codigo: 24, pieza: 'tu preventa',
    criterios: [
      { pregunta: '¿Eligió dos bonos del menú y los nombra?', busca: 'Los dos escritos adentro del mensaje.' },
      { pregunta: '¿El precio es el mismo que el resto?', busca: 'El número completo, sin descuento.' },
      { pregunta: '¿Se lo mandó a personas concretas?', busca: 'Nombres, y qué contestó cada uno.' },
    ],
    descalificador: 'Bajó el precio para cerrar a los tres primeros.',
    donde_se_arregla: 'Vuelve al paso 2: lo que cambia son los bonos, nunca el precio.',
    bloquea: false,
  },
  52: {
    codigo: 52, pieza: 'la mejora de tu entrega',
    criterios: [
      { pregunta: '¿Preguntó a cada uno de los que pagaron?', busca: 'Tres respuestas, no una impresión suya.' },
      { pregunta: '¿El cambio sale de algo que se repitió?', busca: 'El pedido que apareció en dos o tres.' },
      { pregunta: '¿El cambio ya está hecho?', busca: 'Aplicado esta semana, no agendado.' },
    ],
    descalificador: 'Cambió lo que a él le gustaba cambiar.',
    donde_se_arregla: 'Vuelve al paso 1 y pregúntales con sus palabras: qué te sirvió y qué te faltó.',
    bloquea: false,
  },
  73: {
    codigo: 73, pieza: 'sus resultados contados por ellos',
    criterios: [
      { pregunta: '¿Son tres personas distintas?', busca: 'Tres nombres.' },
      { pregunta: '¿Cada frase dice un resultado?', busca: 'Qué cambió, no qué lindo fue el proceso.' },
      { pregunta: '¿Tiene el permiso por escrito?', busca: 'El sí de cada uno, guardado.' },
    ],
    descalificador: 'Escribió él los testimonios y se los mandó para que los aprueben.',
    donde_se_arregla: 'Vuelve al paso 1: pídeles la frase a ellos, tal como la digan.',
    bloquea: false,
  },

  // ─── Rúbricas del Camino de 90 días ────────────────────────────────
  // Solo las jornadas cuya evidencia es texto: el Crítico lee, no adivina.
  8: {
    codigo: 8, pieza: 'tu lista de veinte',
    criterios: [
      { pregunta: '¿Hay al menos veinte nombres?', busca: 'Nombres propios, no categorías.' },
      { pregunta: '¿Cada uno tiene su canal?', busca: 'WhatsApp, Instagram, correo. Sin canal no hay mensaje.' },
      { pregunta: '¿Son personas que ya lo conocen?', busca: 'Consultantes, ex consultantes, colegas, referidos. Los desconocidos son de otra semana.' },
    ],
    descalificador: 'La lista es de tipos de persona y no de personas.',
    donde_se_arregla: 'Abre tu WhatsApp y baja veinte nombres de los últimos seis meses.',
    bloquea: true,
  },
  9: {
    codigo: 'P2.1', pieza: 'tu método',
    criterios: [
      { pregunta: '¿El método tiene nombre propio?', busca: 'Un nombre que se pueda decir en voz alta y repetir.' },
      { pregunta: '¿Las etapas están en orden y son cuatro o más?', busca: 'Etapa 1, 2, 3, 4. Si el orden da igual, no es un método: es una lista.' },
      { pregunta: '¿Cada etapa dice qué cambia en la persona?', busca: 'El estado de entrada y el de salida, no la actividad que se hace.' },
      { pregunta: '¿Dice cómo se mide?', busca: 'Un número, una escala o una señal observable por etapa.' },
    ],
    descalificador: 'Las etapas son las sesiones numeradas: sesión 1, sesión 2, sesión 3.',
    donde_se_arregla: 'Vuelve al paso 3 y toma tus últimos tres consultantes: el camino que hicieron los tres es tu método.',
    bloquea: true,
  },
  10: {
    codigo: 10, pieza: 'tu oferta en una página',
    criterios: [
      { pregunta: '¿La promesa nombra un resultado?', busca: 'Qué se lleva la persona. Acompañamiento, espacio y proceso son actividades, no resultados.' },
      { pregunta: '¿Hay un plazo escrito?', busca: 'Doce semanas, noventa días. Sin plazo es una suscripción abierta.' },
      { pregunta: '¿Está el precio?', busca: 'El número, con su forma de pago.' },
      { pregunta: '¿Dice para quién es y para quién no?', busca: 'El filtro escrito. Una oferta para todos no la compra nadie.' },
    ],
    descalificador: 'La promesa es sentirse mejor, estar bien o tener más claridad.',
    donde_se_arregla: 'Vuelve al paso 2 y escribe primero el resultado del consultante que mejor te salió.',
    bloquea: true,
  },
  43: {
    codigo: 43, pieza: 'tus cinco niveles',
    criterios: [
      { pregunta: '¿Están los cinco escritos con su precio?', busca: 'Del más liviano al más caro, con número en cada uno.' },
      { pregunta: '¿Marcó el tercero como el que vende?', busca: 'Uno solo marcado. Si vende tres, no vende ninguno.' },
      { pregunta: '¿Cada nivel se distingue por lo que entrega?', busca: 'Distinto alcance, no distinta cantidad de sesiones del mismo servicio.' },
    ],
    descalificador: 'Los cinco niveles son el mismo servicio con más horas.',
    donde_se_arregla: 'Vuelve al paso 2 y define primero el tercero: los otros cuatro salen de ahí.',
    bloquea: false,
  },
  32: {
    codigo: 32, pieza: 'tus dos columnas',
    criterios: [
      { pregunta: '¿Las dos columnas están completas?', busca: 'Lo que pasa cuando cobra poco y lo que pasa cuando cobra lo que vale.' },
      { pregunta: '¿Habla del consultante y no solo de él?', busca: 'Qué le pasa al otro cuando la sesión sale barata.' },
    ],
    descalificador: 'Las dos columnas hablan solo de su bolsillo.',
    donde_se_arregla: 'Vuelve al paso 2: piensa en el consultante que abandonó a mitad de camino.',
    bloquea: false,
  },
  11: {
    codigo: 11, pieza: 'tu guion y tus tres anuncios',
    criterios: [
      { pregunta: '¿Los tres anuncios abren distinto?', busca: 'Tres primeras líneas diferentes. Si abren igual, es un anuncio repetido.' },
      { pregunta: '¿Cada uno termina en la misma acción?', busca: 'El mismo paso siguiente en los tres.' },
      { pregunta: '¿El guion dice lo que se lleva quien mira?', busca: 'El resultado, en los primeros diez segundos.' },
    ],
    descalificador: 'Los anuncios hablan del método y no de la persona que lo necesita.',
    donde_se_arregla: 'Vuelve al paso 3 y toma las palabras de tu último consultante, tal como las dijo.',
    bloquea: true,
  },
  19: {
    codigo: 19, pieza: 'tu W de la llamada',
    criterios: [
      { pregunta: '¿Están los cinco tramos de la W?', busca: 'Situación, dolor, consecuencia, deseo y decisión.' },
      { pregunta: '¿Cada tramo tiene preguntas escritas?', busca: 'Preguntas, no afirmaciones. La llamada la lleva quien pregunta.' },
      { pregunta: '¿Las preguntas son abiertas?', busca: 'Que no se contesten con sí o no.' },
    ],
    descalificador: 'La W es un discurso de venta con preguntas de adorno.',
    donde_se_arregla: 'Vuelve al paso 2: escribe primero las cinco preguntas que más te cuesta hacer.',
    bloquea: true,
  },
  22: {
    codigo: 'P5.4', pieza: 'tu primera objeción real',
    criterios: [
      { pregunta: '¿Es una objeción que le dijeron, no una que imagina?', busca: 'Las palabras del otro, entre comillas.' },
      { pregunta: '¿Escribió qué contestó en el momento?', busca: 'Lo que dijo de verdad, aunque no le haya gustado.' },
    ],
    descalificador: 'Escribió una objeción de manual.',
    donde_se_arregla: 'Si todavía no tuviste la llamada, la jornada espera: primero la llamada.',
    bloquea: false,
  },
  46: {
    codigo: 46, pieza: 'tu decisión de escalar o apagar',
    criterios: [
      { pregunta: '¿La decisión es una sola y está escrita?', busca: 'Escalo o apago. Las dos juntas no son una decisión.' },
      { pregunta: '¿Está apoyada en sus cuatro números?', busca: 'Los números de las últimas dos semanas, escritos.' },
    ],
    descalificador: 'Decidió por sensación, sin mirar un número.',
    donde_se_arregla: 'Vuelve a tu tablero del día 33 y trae los cuatro números.',
    bloquea: true,
  },
  36: {
    codigo: 36, pieza: 'tu cinta',
    criterios: [
      { pregunta: '¿Están las estaciones en orden?', busca: 'Qué pasa desde que alguien entra hasta que termina.' },
      { pregunta: '¿Cada estación dice quién la hace?', busca: 'Él, su equipo o la app.' },
      { pregunta: '¿Escribió la línea base?', busca: 'Cuánto tarda hoy cada estación.' },
    ],
    descalificador: 'La cinta la hace él solo en todas las estaciones y no lo marca como problema.',
    donde_se_arregla: 'Vuelve al paso 3 y cronometra dos estaciones esta semana.',
    bloquea: false,
  },
  37: {
    codigo: 37, pieza: 'tu alta',
    criterios: [
      { pregunta: '¿La bienvenida dice qué pasa en los primeros siete días?', busca: 'Paso por paso, con días.' },
      { pregunta: '¿Los tres límites están escritos?', busca: 'Horarios, canal y tiempo de respuesta.' },
      { pregunta: '¿Los siete pasos los puede seguir otra persona?', busca: 'Escritos para que los ejecute alguien que no es él.' },
    ],
    descalificador: 'Los límites quedan en "cuando pueda".',
    donde_se_arregla: 'Vuelve al paso 2: tus límites son los que ya rompiste tres veces este mes.',
    bloquea: true,
  },
  47: {
    codigo: 47, pieza: 'tu cadena de diez',
    criterios: [
      { pregunta: '¿La cadena va de audiencia a cobro con un número en cada paso?', busca: 'Cinco o seis eslabones, todos con número.' },
      { pregunta: '¿Los números son suyos y no promedios prestados?', busca: 'Salen de su tablero de estas semanas.' },
      { pregunta: '¿Cierra en diez consultantes?', busca: 'La cuenta llega a diez o dice qué falta para llegar.' },
    ],
    descalificador: 'Usó números de ejemplo del programa.',
    donde_se_arregla: 'Vuelve a tu tablero: costo por agenda, agendas, llamadas y cierres.',
    bloquea: true,
  },
  85: {
    codigo: 85, pieza: 'tus tres enfoques',
    criterios: [
      { pregunta: '¿Los tres son distintos entre sí?', busca: 'Tres ángulos, no tres formas de decir lo mismo.' },
      { pregunta: '¿Cada uno nombra a quién le habla?', busca: 'La persona concreta que se engancha con ese enfoque.' },
    ],
    descalificador: 'Los tres enfoques hablan de él y de su trayectoria.',
    donde_se_arregla: 'Vuelve al paso 2 y sal de tus tres últimas conversaciones reales.',
    bloquea: false,
  },
  66: {
    codigo: 66, pieza: 'tus doce semanas escritas',
    criterios: [
      { pregunta: '¿Están las doce con tema y gancho?', busca: 'Doce filas completas. Nueve no son doce.' },
      { pregunta: '¿Los ganchos son frases dichas, no títulos?', busca: 'Como lo diría en voz alta.' },
      { pregunta: '¿Hay orden de publicación?', busca: 'Semana por semana, con fecha de arranque.' },
    ],
    descalificador: 'Las doce semanas son doce temas sin gancho.',
    donde_se_arregla: 'Vuelve al paso 3 y usa las preguntas que más te repiten tus consultantes.',
    bloquea: false,
  },
  86: {
    codigo: 86, pieza: 'tu día siguiente',
    criterios: [
      { pregunta: '¿Dice qué hace el lunes después del día 90?', busca: 'Actividades con hora, no intenciones.' },
      { pregunta: '¿Mantiene lo que ya está andando?', busca: 'Campañas, llamadas y entrega siguen con dueño.' },
    ],
    descalificador: 'El día siguiente es empezar algo nuevo y dejar lo que funciona.',
    donde_se_arregla: 'Vuelve al paso 2: primero lo que sostiene tus diez, después lo nuevo.',
    bloquea: false,
  },
  88: {
    codigo: 88, pieza: 'tu plan de 180 días',
    criterios: [
      { pregunta: '¿Tiene meta con número y fecha?', busca: 'Cuántos consultantes y cuánto facturado, al día 180.' },
      { pregunta: '¿Está dividido en tramos con dueño?', busca: 'Mes a mes, con quién hace cada cosa.' },
      { pregunta: '¿Sale de lo que ya le funcionó en estos 90 días?', busca: 'Lo que midió, no lo que imagina.' },
    ],
    descalificador: 'El plan cambia de estrategia sin haber agotado la que ya le dio consultantes.',
    donde_se_arregla: 'Vuelve a tu cadena del día 47 y multiplica por seis meses.',
    bloquea: true,
  },
  89: {
    codigo: 89, pieza: 'lo que se puede cerrar',
    criterios: [
      { pregunta: '¿Nombra conversaciones concretas?', busca: 'Nombres y en qué quedó cada una.' },
      { pregunta: '¿Cada una tiene un paso con fecha?', busca: 'Qué hace y qué día.' },
    ],
    descalificador: 'La lista es de personas que nunca contestaron.',
    donde_se_arregla: 'Vuelve a tus llamadas de las últimas tres semanas.',
    bloquea: false,
  },
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

  5: {
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
  // Las rúbricas se guardan por DÍA: es lo único que no cambia cuando el
  // Camino se reordena. Si no hay, se busca por las piezas de esa jornada.
  const directa = RUBRICAS[codigo];
  if (directa) return directa;
  const d = diaDelCodigo(codigo);
  if (d !== null && RUBRICAS[d]) return RUBRICAS[d];
  const jornada = roadmap.jornadas.find((j) => j.dia === d);
  for (const pieza of jornada?.piezas ?? []) {
    if (RUBRICAS[pieza]) return RUBRICAS[pieza];
  }
  return null;
}
