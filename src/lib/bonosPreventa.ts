import { LS_KEY as LS_KEY_NUMERO } from './elNumero';
/**
 * LOS BONOS DE LA PREVENTA — la jornada del día 24.
 *
 * Los tres primeros compran al mismo precio que el resto. Lo que cambia es lo
 * que solo ellos tienen. El descuento queda afuera a propósito: lo que se
 * descuenta se ancla, y el que entró con descuento no renueva al precio entero.
 *
 * Los cinco bonos tienen la misma forma: le cuestan tiempo o decisión, nunca
 * dinero nuevo. Y ninguno pide que sea otra cosa que lo que ya es: un
 * terapeuta, un coach, un médico atendiendo bien.
 */

export interface BonoPreventa {
  id: string;
  /** Cómo se llama adentro de la app. */
  nombre: string;
  /** Cómo se lo dice al consultante, en su mensaje. */
  comoSeLoDice: string;
  /** Qué le cuesta a él. Si no cuesta nada, no vale nada. */
  leCuesta: string;
  /** Por qué mueve la decisión de comprar hoy. */
  porQueFunciona: string;
}

export const BONOS: BonoPreventa[] = [
  {
    id: 'sesiones',
    nombre: 'Dos sesiones más',
    comoSeLoDice: 'Dos sesiones extra conmigo, además de las del programa',
    leCuesta: 'Dos horas de tu agenda por cada uno de los tres',
    porQueFunciona: 'Es más de lo que ya quiere: tiempo contigo.',
  },
  {
    id: 'whatsapp',
    nombre: 'Acompañamiento entre sesiones',
    comoSeLoDice: 'Me escribes por WhatsApp entre sesiones durante el primer mes, y te contesto en el día',
    leCuesta: 'Contestar mensajes en una franja fija, un mes',
    porQueFunciona: 'Lo que más asusta de empezar es quedarse solo en el medio.',
  },
  {
    id: 'horario',
    nombre: 'Eligen su horario',
    comoSeLoDice: 'Eliges tu día y tu hora fija de la semana, antes que el resto',
    leCuesta: 'Bloquear tres horarios de tu semana',
    porQueFunciona: 'Quien tiene la agenda apretada compra por el horario.',
  },
  {
    id: 'precio',
    nombre: 'Precio congelado',
    comoSeLoDice: 'Si al terminar quieres seguir, sigues al precio de hoy',
    leCuesta: 'Sostener ese precio cuando subas el de lista',
    porQueFunciona: 'Le pone valor a quedarse, sin bajar lo que cobras hoy.',
  },
  {
    id: 'invitado',
    nombre: 'Una sesión para quien elija',
    comoSeLoDice: 'Una sesión para la persona que tú elijas: tu pareja, un hermano, quien lo necesite',
    leCuesta: 'Una hora más, una sola vez',
    porQueFunciona: 'El que llega por otro suele decidir más rápido que por sí mismo.',
  },
];

export const KEY_BONOS = 'tcd_bonos_preventa_v1';

/** Los dos que eligió, leídos de donde quedaron. */
export function bonosElegidos(): string[] {
  try {
    const raw = localStorage.getItem(KEY_BONOS);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string').slice(0, 2) : [];
  } catch {
    return [];
  }
}

/** El precio nuevo que selló el día 5, si ya está. */
export function precioSellado(): string | undefined {
  try {
    const raw = localStorage.getItem(LS_KEY_NUMERO);
    const n = raw ? (JSON.parse(raw) as { precio_nuevo?: number }).precio_nuevo : null;
    return n ? String(n) : undefined;
  } catch {
    return undefined;
  }
}

export interface DatosDePreventa {
  /** El resultado que promete su programa. */
  promesa?: string;
  /** Doce semanas, noventa días: lo que dure. */
  plazo?: string;
  /** El precio completo, el mismo que el resto. */
  precio?: string;
}

/**
 * El mensaje de preventa, con sus dos bonos adentro.
 *
 * Sale escrito para mandar por WhatsApp: hablado, sin vueltas y con un solo
 * paso siguiente.
 */
export function mensajeDePreventa(ids: string[], datos: DatosDePreventa = {}): string {
  const elegidos = BONOS.filter((b) => ids.includes(b.id)).slice(0, 2);
  const promesa = datos.promesa?.trim() || '[el resultado que promete tu programa]';
  const plazo = datos.plazo?.trim() || '[el plazo]';
  const precio = datos.precio?.trim() || '[tu precio]';
  const bonos = elegidos.length
    ? elegidos.map((b) => `· ${b.comoSeLoDice}`).join('\n')
    : '· [elige dos bonos]';

  return [
    'Hola [nombre], te escribo por algo puntual.',
    '',
    `Estoy abriendo mi programa: ${promesa}, en ${plazo}.`,
    '',
    'Abro tres lugares antes que al resto. Quienes entren en esos tres se llevan dos cosas que después no voy a volver a dar:',
    bonos,
    '',
    `El precio es el mismo que va a pagar el resto: ${precio}.`,
    '',
    '¿Quieres que hablemos esta semana y ves si es para ti?',
  ].join('\n');
}
