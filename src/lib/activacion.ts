/**
 * LA ACTIVACIÓN — del Camino terminado a la campaña corriendo.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * Al terminar el Camino el cliente tiene el ADN completo: su método, su
 * oferta, su página, sus anuncios. Y ahí quedaba solo. «Andá a Campañas» no
 * es una instrucción: Campañas tiene seis pantallas y ninguna dice qué va
 * primero ni, sobre todo, **qué NO hay que tocar todavía.**
 *
 * ═══ POR QUÉ SON PUERTAS Y NO PASOS ═══
 *
 * Los primeros cuatro son montaje: van uno tras otro y se hacen en un día.
 *
 * Los que vienen después no. Son una sola ventana de aprendizaje con puertas
 * que se abren POR FECHA, y cada una habilita una cosa distinta. Esa
 * diferencia es el método entero: con presupuestos chicos la variación diaria
 * es enorme, y apagar el día malo es el error más caro que existe. El freno
 * F-14DIAS del Camino cierra la sesión de escalar y apagar del día 31 al 45
 * justamente por eso.
 *
 * Así que a las 48 horas la app no ofrece «optimizar»: dice que la campaña
 * está aprendiendo y no deja tocar nada. Un cliente solo no se puede
 * equivocar si la app no le deja hacer lo que todavía no corresponde.
 *
 * Lógica pura: se prueba sola.
 */
import type { ObjetivoCampana } from './campanasTypes';
import type { IdCandado, Montaje } from './montajeCampana';
import { candadoCerrado, candadosQueAplican, DIAS_SIN_TOCAR } from './montajeCampana';

// ── Qué candados aplican a cada motor ──────────────────────────────────────
//
// `candadosQueAplican` vivía acá y pasó a `montajeCampana.ts`, donde está
// `IdCandado`: desde que el Montaje y el Admin también la necesitan, tenerla
// acá hacía que los dos módulos se importaran en círculo. Se re-exporta para
// que todo lo que ya la pedía a la Activación siga funcionando.
export { candadosQueAplican } from './montajeCampana';

export function cuantosFaltanParaEncender(
  m: Montaje,
  objetivo: ObjetivoCampana,
  anunciosListos: boolean,
): number {
  return candadosQueAplican(objetivo).filter((id) =>
    id === 'anuncios' ? !anunciosListos : !candadoCerrado(m, id)).length;
}

export function puedeEncenderAsi(
  m: Montaje,
  objetivo: ObjetivoCampana,
  anunciosListos: boolean,
): boolean {
  return cuantosFaltanParaEncender(m, objetivo, anunciosListos) === 0;
}

// ── Las puertas ────────────────────────────────────────────────────────────

export type TipoDePuerta = 'montaje' | 'ventana';

export interface Puerta {
  n: number;
  titulo: string;
  tipo: TipoDePuerta;
  /** Desde qué día encendida se abre. null = es de montaje, no espera fecha. */
  diaQueAbre: number | null;
  /** Lo que se hace acá. */
  queHacer: string;
  /** Lo que NO se puede tocar todavía, y por qué. Es la mitad que faltaba. */
  queNoTocar?: string;
}

export const PUERTAS: Puerta[] = [
  {
    n: 0, tipo: 'montaje', diaQueAbre: null,
    titulo: 'Tu perfil, listo para recibir',
    queHacer: 'Tu foto, tu biografía con el link, tus destacadas y tu carrusel fijado. Quien llegue del anuncio aterriza acá antes de decidir.',
  },
  {
    n: 1, tipo: 'montaje', diaQueAbre: null,
    titulo: 'Tus tres anuncios',
    queHacer: 'Los guiones y las piezas: tres ángulos del mismo consultante. Tres, no uno: con uno solo no hay con qué comparar y no se puede elegir ganador.',
  },
  {
    n: 2, tipo: 'montaje', diaQueAbre: null,
    titulo: 'Montada en Meta, directo a tu video',
    queHacer: 'Objetivo clientes potenciales, al VSL. Sin palabra clave: el anuncio lleva a tu video y ahí explicas todo.',
  },
  {
    n: 3, tipo: 'montaje', diaQueAbre: null,
    titulo: 'La verificación final, y encender',
    queHacer: 'Tu página abre, tu píxel mide, y tu presupuesto aguanta catorce días sin que lo toques. Con eso, enciendes.',
    queNoTocar: `Si tu presupuesto no sostiene ${DIAS_SIN_TOCAR} días, no enciendas: apagar a mitad de camino tira lo gastado y no deja ningún dato.`,
  },
  {
    n: 4, tipo: 'ventana', diaQueAbre: 1,
    titulo: 'Los primeros dos días: solo mirar',
    queHacer: 'Entra, mira los números y anótalos. Nada más. Tu campaña está aprendiendo a quién mostrarse.',
    queNoTocar: 'No cambies el presupuesto, ni el público, ni apagues ningún anuncio. Con presupuestos chicos un día malo no significa nada, y tocar ahora reinicia el aprendizaje de cero.',
  },
  {
    n: 5, tipo: 'ventana', diaQueAbre: 3,
    titulo: 'Día 3: se apaga lo que no enganchó',
    queHacer: 'Si un anuncio gastó tres días y no abrió ni una conversación, apágalo y reemplázalo. Eso no es mala suerte: la pieza no engancha.',
    queNoTocar: 'El resto sigue como está. Un anuncio con pocas conversaciones todavía puede ser el ganador: solo se apaga el que tiene cero.',
  },
  {
    n: 6, tipo: 'ventana', diaQueAbre: 15,
    titulo: 'Día 15: eliges tu ganador',
    queHacer: 'Gana el de menor costo por venta, entre los que vendieron. Si todavía ninguno vendió —lo normal en la semana 3— gana el de menor costo por agenda. Los otros se apagan.',
  },
  {
    n: 7, tipo: 'ventana', diaQueAbre: 30,
    titulo: 'Día 30: escalas al ganador',
    queHacer: 'Subes el presupuesto del que ganó, de a poco y sin tocar nada más. Un creativo que ya rindió un mes se gasta: ese es el momento de grabar el siguiente.',
    queNoTocar: 'Se escala solo el ganador. Subirle el presupuesto a todos es volver al día 1 con más plata por minuto.',
  },
  {
    n: 8, tipo: 'ventana', diaQueAbre: 30,
    titulo: 'Si al día 30 no vendiste nada',
    queHacer: 'El problema no es la campaña: es la oferta o el precio. Vuelves a tu sesión de la oferta en el Camino y la corriges antes de seguir gastando.',
    queNoTocar: 'No subas el presupuesto para ver si mejora. Treinta días de datos sin una venta ya dijeron lo que había que saber.',
  },
];

/** Qué puerta corresponde hoy. */
export interface DondeEsta {
  puerta: Puerta;
  /** Las que ya pasaron. */
  cerradas: number[];
  /** Si todavía está montando, cuántos candados le faltan. */
  faltanCandados: number;
  /** Días para que abra la próxima puerta de la ventana. 0 si ya abrió. */
  diasParaLaProxima: number;
  proxima: Puerta | null;
}

/**
 * En qué puerta está hoy este cliente.
 *
 * Mientras monta, la puerta es la del primer candado que le falta: así la app
 * le dice UNA cosa por vez en vez de una lista de ocho. Encendida, la puerta
 * es la última que abrió por fecha.
 *
 * `sinVentasAlMes` manda a la puerta 8, que es la única que saca al cliente
 * de Campañas y lo devuelve al Camino.
 */
export function dondeEsta(x: {
  montaje: Montaje | null;
  objetivo: ObjetivoCampana;
  anunciosListos: boolean;
  /** Días desde que encendió. null = todavía no encendió. */
  diasEncendida: number | null;
  /**
   * Las ventas que lleva. `null` o ausente = no se consultaron.
   *
   * No saber NO es no haber vendido: con cero por defecto, cualquier cliente
   * al día 30 caía en la puerta de pivotear y se le decía que su oferta está
   * mal por una consulta que no se hizo.
   */
  ventas?: number | null;
}): DondeEsta {
  const faltan = x.montaje
    ? cuantosFaltanParaEncender(x.montaje, x.objetivo, x.anunciosListos)
    : candadosQueAplican(x.objetivo).length;

  // ── Todavía montando ──
  if (x.diasEncendida === null || faltan > 0) {
    const puerta = puertaDeMontaje(x.montaje, x.objetivo, x.anunciosListos);
    return {
      puerta,
      cerradas: PUERTAS.filter((p) => p.tipo === 'montaje' && p.n < puerta.n).map((p) => p.n),
      faltanCandados: faltan,
      diasParaLaProxima: 0,
      proxima: PUERTAS.find((p) => p.n === puerta.n + 1) ?? null,
    };
  }

  // ── Encendida: treinta días sin una venta mandan a la puerta 8 ──
  const dias = x.diasEncendida;
  if (dias >= 30 && x.ventas === 0) {
    return {
      puerta: PUERTAS[8],
      cerradas: [0, 1, 2, 3, 4, 5, 6],
      faltanCandados: 0,
      diasParaLaProxima: 0,
      proxima: null,
    };
  }

  const dePuerta = PUERTAS.filter((p) => p.tipo === 'ventana' && p.n !== 8);
  const abiertas = dePuerta.filter((p) => dias >= (p.diaQueAbre ?? 0));
  const puerta = abiertas[abiertas.length - 1] ?? dePuerta[0];
  const proxima = dePuerta.find((p) => (p.diaQueAbre ?? 0) > dias) ?? null;

  return {
    puerta,
    cerradas: PUERTAS.filter((p) => p.n < puerta.n).map((p) => p.n),
    faltanCandados: 0,
    diasParaLaProxima: proxima ? Math.max(0, (proxima.diaQueAbre ?? 0) - dias) : 0,
    proxima,
  };
}

/** La puerta de montaje que corresponde al primer candado que falta. */
function puertaDeMontaje(
  m: Montaje | null,
  objetivo: ObjetivoCampana,
  anunciosListos: boolean,
): Puerta {
  if (!m) return PUERTAS[0];
  const aplican = candadosQueAplican(objetivo);
  const falta = (id: IdCandado) =>
    aplican.includes(id) && (id === 'anuncios' ? !anunciosListos : !candadoCerrado(m, id));

  if (falta('perfil')) return PUERTAS[0];
  if (falta('anuncios')) return PUERTAS[1];
  if (falta('pagina') || falta('pixel') || falta('palabra') || falta('dm')) return PUERTAS[2];
  return PUERTAS[3];
}

/**
 * Lo que puede hacer hoy, en una línea.
 *
 * Y cuando la puerta tiene un «no toques», va junto: el aviso sirve en el
 * momento en que la tentación aparece, no en un manual que se leyó en el día
 * 1 y nadie recuerda al día 3.
 */
export function queSePuedeHoy(d: DondeEsta): string {
  if (d.diasParaLaProxima > 0 && d.puerta.tipo === 'ventana') {
    const dias = d.diasParaLaProxima;
    return `${d.puerta.queHacer} ${dias === 1 ? 'Falta 1 día' : `Faltan ${dias} días`} para ${(d.proxima?.titulo ?? '').toLowerCase()}.`;
  }
  return d.puerta.queHacer;
}

/** Cuántas puertas de las nueve están cerradas, para una barra de avance. */
export const TOTAL_PUERTAS = PUERTAS.length;
