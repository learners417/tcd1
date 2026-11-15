/**
 * MI PROTOCOLO — las 33 piezas que el Lago deja escritas.
 *
 * ═══ QUÉ ES ═══
 *
 * El Lago no es un libro de leer: es un reset que termina en algo escrito.
 * Cada lección deja UNA pieza concreta —una hora, un lugar, unos minutos,
 * una frase— y las 33 juntas son el protocolo del cliente, firmado por él.
 *
 * ═══ CÓMO SE ATA A SU DÍA ═══
 *
 * La pieza N es la de la lección N. Esa correspondencia no se escribe acá:
 * ya está en el seed, que dice qué día cae cada lección. Escribirla dos
 * veces sería tener dos calendarios peleándose, que es exactamente el
 * problema que los tres hilos vinieron a resolver.
 *
 * De ahí sale sola: 33 piezas repartidas en los 27 días del Lago, y la 33
 * —tu protocolo firmado, y lo que vas a dar— el día 90.
 *
 * ═══ DE DÓNDE SALE CADA COSA ═══
 *
 * Los NOMBRES de las 33: claude/ARQUITECTURA-COLECCION.md §14, aprobados
 * por Javo el 15 de noviembre de 2026. No se tocan: el libro impreso las
 * nombra por su número.
 *
 * Los PIES —la línea que dice qué se escribe en cada una— los escribió la
 * app, no LIBROS. Cuando LIBROS cierre el Lago y pase los suyos, se
 * reemplazan acá y nada más cambia.
 */

import { esPasoDelCliente } from './diaPrograma';

export interface PiezaDelProtocolo {
  /** No cambia nunca: el libro la nombra por su número. */
  numero: number;
  nombre: string;
  /** Qué se escribe en ella, en una línea. */
  pie: string;
}

export const PIEZAS: PiezaDelProtocolo[] = [
  { numero: 1, nombre: 'Tu orilla', pie: 'Dónde te detienes cuando el día te pasa por encima.' },
  { numero: 2, nombre: 'Tu hora real', pie: 'Lo que cobraste el último mes, dividido por las horas que trabajaste.' },
  { numero: 3, nombre: 'Tu búnker', pie: 'El lugar y la hora en que construyes, todos los días.' },
  { numero: 4, nombre: 'Tu red de ayuda', pie: 'A quién llamas, y por qué cosa llamas a cada uno.' },
  { numero: 5, nombre: 'Lo que sanaste', pie: 'Lo que te pasó y ya resolviste. Es de donde sale tu método.' },
  { numero: 6, nombre: 'Tu límite para derivar', pie: 'Qué no atiendes, y a quién se lo pasas.' },
  { numero: 7, nombre: 'Tu para qué', pie: 'En una frase, para qué haces esto.' },
  { numero: 8, nombre: 'Tus cuatro números', pie: 'Conversaciones, agendas, llamadas y ventas de tu semana.' },
  { numero: 9, nombre: 'Tu frase del dinero', pie: 'La que escuchaste en tu casa, textual.' },
  { numero: 10, nombre: 'El origen de lo que crees', pie: 'De quién lo aprendiste, y cuándo.' },
  { numero: 11, nombre: 'Tus capas', pie: 'Lo que se ve, lo que no se ve, y lo que hay debajo.' },
  { numero: 12, nombre: 'Tu filtro de lo que entra', pie: 'Qué dejas pasar y qué no, antes de que te tiña.' },
  { numero: 13, nombre: 'Tu cuenca', pie: 'De dónde te llega lo que te sostiene.' },
  { numero: 14, nombre: 'El tamaño de tu vaso', pie: 'Cuánto crees que te cabe. Y cuánto te cabe de verdad.' },
  { numero: 15, nombre: 'Tu permiso nuevo', pie: 'Gano más y sigo siendo de mi familia. Con tu letra.' },
  { numero: 16, nombre: 'Tu rueda sin juicio', pie: 'Cómo estás hoy en cada área, con el número que sea.' },
  { numero: 17, nombre: 'Tus señales del cuerpo', pie: 'Dónde lo sientes: pecho, estómago, garganta o mandíbula.' },
  { numero: 18, nombre: 'Tus disparadores', pie: 'Las tres situaciones que te sacan de eje.' },
  { numero: 19, nombre: 'Tu dieta de entrada', pie: 'Qué pantallas, qué comida y qué personas te entran.' },
  { numero: 20, nombre: 'Tu regla para decidir en calma', pie: 'Qué haces antes de contestar cuando estás alterado.' },
  { numero: 21, nombre: 'Tu ritual de entrada', pie: 'El gesto con el que empiezas a trabajar.' },
  { numero: 22, nombre: 'Tu cuerpo en la agenda', pie: 'Qué día y a qué hora te mueves. En la agenda, no en la cabeza.' },
  { numero: 23, nombre: 'Tu hora de corte', pie: 'A qué hora cierras, y qué pasa después de esa hora.' },
  { numero: 24, nombre: 'Tu bahía de descanso', pie: 'Dónde paras, y cada cuánto.' },
  { numero: 25, nombre: 'Lo que te das primero', pie: 'Lo que pides, hazlo tú primero.' },
  { numero: 26, nombre: 'Tu precio nuevo', pie: 'El número, con su moneda, y desde cuándo rige.' },
  { numero: 27, nombre: 'Tu voz expuesta', pie: 'Cómo suenas cuando dices tu número en voz alta.' },
  { numero: 28, nombre: 'Lo que sueltas', pie: 'Quién sigue, quién sube y a quién sueltas.' },
  { numero: 29, nombre: 'Tu empresa de uno', pie: 'En una página: qué haces, para quién y con qué.' },
  { numero: 30, nombre: 'Tu Guardián', pie: 'Qué hace tu cabeza cuando algo te asusta, y cómo lo reconoces.' },
  { numero: 31, nombre: 'Tu ensayo', pie: 'Lo que repites antes de la llamada.' },
  { numero: 32, nombre: 'Tu celebración', pie: 'Qué haces cuando te sale bien. Y cuándo.' },
  {
    numero: 33,
    nombre: 'Tu protocolo firmado, y lo que vas a dar',
    pie: 'Tu protocolo entero, con tu firma. Y lo que vas a dar, que es lo que más necesitas.',
  },
];

export const PIEZA_POR_NUMERO: Record<number, PiezaDelProtocolo> = Object.fromEntries(
  PIEZAS.map((p) => [p.numero, p]),
);

/* ═══════════════ LA PISTA DE 66 ═══════════════
 *
 * Lo que sostiene el protocolo después de escribirlo. Los tres hitos los
 * decidió Javo el 15 de noviembre (ARQUITECTURA §14).
 *
 * El 66 no es un número redondo elegido a ojo: es la MEDIANA del estudio de
 * Lally (University College London, 2010, 96 personas durante 12 semanas),
 * donde a la mitad de las personas el hábito ya les salía solo a esa altura.
 * El rango real va de 18 a 254 días, así que el 66 es un punto de
 * referencia, no una promesa —y así se dice en pantalla.
 */
export interface HitoDeLaPista {
  dia: number;
  nombre: string;
  /** Qué significa llegar ahí. Null cuando no hace falta explicarlo. */
  dice: string | null;
}

export const PISTA = 66;

export const HITOS: HitoDeLaPista[] = [
  /* En positivo, que es la regla de la casa: dice lo que pasa a los 21, no
     lo que no pasa antes. */
  { dia: 21, nombre: 'Tu piso', dice: 'Los primeros 21 son los que lo vuelven tuyo.' },
  { dia: 44, nombre: 'El ideal', dice: null },
  {
    dia: 66,
    nombre: 'Aprendiz ejemplar',
    dice: 'A esa altura, a la mitad de las personas el hábito ya le sale solo.',
  },
];

/*
 * LA FUENTE ES DEL 66, Y DE NADA MÁS.
 *
 * El 21 y el 44 los decidió Javo. El 66 sale de un estudio — y el 21 es justo
 * la cifra popular que ESE estudio contradice. Una sola línea de fuente
 * debajo de los tres se los atribuía a Lally, incluido el que lo desmiente.
 *
 * Y el rango va en pantalla, no solo acá: 66 es la mediana de un rango que va
 * de 18 a 254 días. Sin eso, un número redondo parece una promesa.
 */
export const EL_66 = {
  dice: '66 es la mediana: en ese estudio las personas tardaron entre 18 y 254 días.',
  fuente: 'Lally y otros, University College London, 2010 · estudio revisado por pares',
} as const;
export const FUENTE_DE_LA_PISTA = EL_66.fuente;
export const DE_JAVO = 'El piso de 21 y el ideal de 44 los eligió Javo.';

/* ═══════════════ EL TABLERO CONTRA EL BURNOUT ═══════════════
 *
 * Las tres señales con que la OMS describe el burnout en la CIE-11. Van como
 * un chequeo semanal de tres preguntas, y cada una guarda dos cosas: cómo se
 * le nota a esta persona y qué hace ese día.
 *
 * No diagnostica nada ni pone un puntaje: es el protocolo de la persona,
 * escrito por ella, para el día en que aparezca la señal.
 */
export interface SenalDeBurnout {
  numero: number;
  nombre: string;
}

export const SENALES: SenalDeBurnout[] = [
  { numero: 1, nombre: 'Agotamiento' },
  { numero: 2, nombre: 'Distancia o cinismo con tu trabajo' },
  { numero: 3, nombre: 'Sentir que ya no rindes' },
];

export const CAMPOS_DE_LA_SENAL = ['Mi señal', 'Ese día hago'] as const;
export const FUENTE_DEL_BURNOUT = 'OMS · CIE-11';

/* ═══════════════ LO QUE ESCRIBE EL CLIENTE ═══════════════
 *
 * Igual que la medición de entrada (`medicion.ts`), que es la otra cosa que
 * el cliente escribe y tiene que seguir ahí noventa días después: en el
 * teléfono, con try/catch, y la app dibuja bien aunque vuelva vacío.
 */
const CLAVE_PIEZAS = 'tcd_mi_protocolo_v1';
const CLAVE_SENALES = 'tcd_mi_protocolo_senales_v1';

export type ProtocoloEscrito = Record<number, string>;
/** Por señal: ['mi señal', 'ese día hago']. */
export type SenalesEscritas = Record<number, [string, string]>;

export function leerProtocolo(): ProtocoloEscrito {
  try {
    const raw = localStorage.getItem(CLAVE_PIEZAS);
    return raw ? (JSON.parse(raw) as ProtocoloEscrito) : {};
  } catch {
    return {};
  }
}

export function guardarPieza(numero: number, texto: string): ProtocoloEscrito {
  const todo = leerProtocolo();
  const limpio = texto.trim();
  if (limpio) todo[numero] = limpio;
  else delete todo[numero];
  try { localStorage.setItem(CLAVE_PIEZAS, JSON.stringify(todo)); } catch { /* noop */ }
  return todo;
}

export function leerSenales(): SenalesEscritas {
  try {
    const raw = localStorage.getItem(CLAVE_SENALES);
    return raw ? (JSON.parse(raw) as SenalesEscritas) : {};
  } catch {
    return {};
  }
}

export function guardarSenal(numero: number, campo: 0 | 1, texto: string): SenalesEscritas {
  const todo = leerSenales();
  const par = todo[numero] ?? ['', ''];
  par[campo] = texto.trim();
  if (par[0] || par[1]) todo[numero] = par;
  else delete todo[numero];
  try { localStorage.setItem(CLAVE_SENALES, JSON.stringify(todo)); } catch { /* noop */ }
  return todo;
}

/** Cuántas de las 33 están escritas. */
export function cuantasEscritas(escrito: ProtocoloEscrito): number {
  return PIEZAS.filter((p) => (escrito[p.numero] ?? '').length > 0).length;
}

/* ═══════════════ QUÉ PIEZA SE PIDE HOY ═══════════════
 *
 * Medido el 15 de noviembre de 2026: la correspondencia «pieza N = lección N»
 * era cierta y no alcanzaba. El Camino se detiene en los pasos del cliente, y
 * las lecciones **7, 15 y 27 caen en fin de semana** —los días 6 y 13, que son
 * de campo y no se completan—, así que su pieza no llegaba nunca. Tres de las
 * 33 eran imposibles de escribir, y la pantalla decía «cada una llega con su
 * lección» sin que esas tres pudieran llegar.
 *
 * El arrastre lo cierra: la pieza de una lección que cae en un día que no se
 * camina se pide en el primer paso siguiente. La lección se lee el sábado; lo
 * que se escribe, se escribe el lunes. Ninguna queda sin día, y el máximo
 * sigue siendo dos piezas en un día (medido sobre los 64 pasos).
 */
export function leccionesDelDia(
  metas: Array<{ leccion?: { numero: number }[]; tipo_jornada?: string | null; tiempo_estimado?: string | null; cinturon?: string | null }>,
  indiceDeHoy: number,
): number[] {
  if (indiceDeHoy < 0 || indiceDeHoy >= metas.length) return [];
  const numeros = (m: { leccion?: { numero: number }[] }) => (m.leccion ?? []).map((l) => l.numero);
  const arrastre: number[] = [];
  for (let i = indiceDeHoy - 1; i >= 0 && !esPasoDelCliente(metas[i]); i--) {
    arrastre.unshift(...numeros(metas[i]));
  }
  return [...arrastre, ...numeros(metas[indiceDeHoy])];
}
