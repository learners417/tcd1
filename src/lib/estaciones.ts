/**
 * LAS CINCO ESTACIONES — el candado de cada tramo del viaje.
 *
 * ═══ QUÉ ES ESTE ARCHIVO, Y QUÉ NO ═══
 *
 * El Lago, la Montaña, el Viento, el Río y el Bosque. Cinco paisajes, cinco
 * libros del sur, cinco sistemas del Camino. Eso NO vive acá: vive en
 * `losCincoPaisajes.ts`, que ya traía el nombre, el libro, lo que enseña, los
 * cinco tonos de color sacados del PDF de imprenta y el tramo de días parseado
 * del seed.
 *
 * Acá vive una sola cosa que ese archivo no tenía: **con qué se abre cada
 * estación y qué te deja al salir**. El candado. Eso es lo que convierte la
 * app en mentor y no en curso: no se pasa a la Montaña por llegar al día 8, se
 * pasa con el reset hecho. Y la pauta no se enciende sin la primera venta.
 *
 * ═══ POR QUÉ ESTE ARCHIVO SE ESCRIBIÓ DOS VECES (7 y 8 de noviembre) ═══
 *
 * La primera versión declaró su propia tabla de seis estaciones, con sus
 * propios colores y sus propios tramos de días. Las tres cosas ya existían en
 * `losCincoPaisajes.ts`, medidas y derivadas del seed, y las tres quedaron
 * distintas. Costo medido: **21 de los 90 días la app se contradecía sola** —
 * el día 75 Hoy mostraba el Río y El Camino decía «El Bosque».
 *
 * El archivo de los paisajes lo tenía advertido por escrito: «los rangos salen
 * del seed y se parsean para que haya un solo lugar donde viven: con los
 * números escritos acá y allá, el día que se mueva una jornada la app
 * mostraría el paisaje de otro sistema». Pasó exactamente eso.
 *
 * Así que esta versión no declara ni color ni días. Los pide. Y son cinco, no
 * seis: el «Cierre» que había inventado era el Bosque, que según el seed
 * arranca el día 85 y llega al 90 con el ecosistema, que es su contenido.
 *
 * ═══ POR QUÉ LA ESTACIÓN NO ES EL PILAR ═══
 *
 * La app agrupa las jornadas en pilares —P0 a P9B— y los muestra con títulos
 * que dicen «Días 48 a 90». Eso no es un nombre: es un rango.
 *
 * La tentación era renombrar los pilares a las estaciones. No va: los ids de
 * pilar están cableados en el esquema del ADN (`pilarRange`, `pilarOrigen`),
 * en los cinturones, en las compuertas de plan y en las respuestas rápidas del
 * Mentor. Partir `P9B` arrastraría seis archivos de plomería para cambiar algo
 * que el cliente nunca ve.
 *
 *   el pilar     es de la máquina — el ADN, los cinturones, los planes
 *   la estación  es del cliente   — dónde está del viaje, y con qué libro
 *
 * Un día pertenece a una sola estación y la cuenta es del día, no del código:
 * los códigos se reordenan, los días no.
 */
import { paisajeDelDia, tramoDelPaisaje, type IdPaisaje, type Paisaje } from './losCincoPaisajes';

/** El candado de una estación: con qué se abre y qué te deja. */
export interface Candado {
  /** La libertad que trabaja ese tramo. */
  libertad: string;
  /** Con qué se abre. El primer tramo se abre con el primer día. */
  seAbreCon: string;
  /** Con qué se sale. Es el candado de la siguiente. */
  teDeja: string;
}

/**
 * Lo que abre y lo que cierra cada estación.
 *
 * Acá solo está declarado. Quien lo hace cumplir es la cirugía del candado.
 *
 * ═══ DOS LUGARES DONDE EL CAMINO LE GANÓ AL MAPA DEL VIAJE (7 nov) ═══
 *
 * 1 · EL RÍO ARRANCA EL 36, no el 57. El cliente construye su app cuando ya
 *     tiene a quién meter adentro: su primera venta es el día 26 y su primer
 *     consultante entra el 40. Esperar al 57 son diecinueve días atendiendo a
 *     mano a personas que ya pagaron.
 *
 * 2 · EL ECOSISTEMA SE QUEDA DONDE ESTÁ, en el Bosque, días 85 y 86. El día
 *     85 trae su propio veredicto escrito: «sesenta días sin publicar fue a
 *     propósito; ahora tienes qué vender y cómo venderlo, recién ahora el
 *     contenido rinde». Publicar antes de tener oferta y precio es justamente
 *     el error que le cuesta los noventa días.
 */
export const CANDADOS: Record<IdPaisaje, Candado> = {
  lago: {
    libertad: 'libertad mental',
    seAbreCon: 'El primer día',
    teDeja: 'Tu reset hecho: tu precio nuevo y tu Guardián sellados',
  },
  montana: {
    libertad: 'libertad financiera',
    seAbreCon: 'Tu reset hecho',
    teDeja: 'Tu programa listo para vender, con su enlace de pago',
  },
  viento: {
    libertad: 'libertad emocional',
    seAbreCon: 'Tu programa listo',
    teDeja: 'Tu captación andando y tres ventas pagas',
  },
  rio: {
    libertad: 'libertad energética',
    seAbreCon: 'Tres ventas pagas',
    teDeja: 'Tu app andando, horas recuperadas y siete mil dólares vendidos',
  },
  bosque: {
    libertad: 'libertad de tiempo',
    seAbreCon: 'Siete mil dólares vendidos',
    teDeja: 'Tu ecosistema, tu foto de llegada y tu plan de 180 días',
  },
};

/** El paisaje de un día, con su candado y su tramo. Una sola fuente. */
export interface Estacion extends Candado {
  id: IdPaisaje;
  nombre: string;
  libro: string;
  /** Primer y último día del tramo, inclusive. Salen del seed. */
  desde: number;
  hasta: number;
  /** El paisaje entero, para el color y la ilustración. */
  paisaje: Paisaje;
}

/** La estación de un día. `null` para el día 0, que es la entrega técnica. */
export function estacionDelDia(dia: number | null | undefined): Estacion | null {
  const p = paisajeDelDia(dia);
  if (!p) return null;
  const tramo = tramoDelPaisaje(p.id);
  return {
    id: p.id, nombre: p.nombre, libro: p.libro,
    desde: tramo.desde, hasta: tramo.hasta,
    paisaje: p, ...CANDADOS[p.id],
  };
}

/**
 * Cómo se nombra un tramo de días al cliente.
 *
 * ═══ LO QUE REEMPLAZA ═══
 *
 * Los pilares del Camino se mostraban con su título, y esos títulos son
 * rangos: «Días 2 a 5», «Días 48 a 90». Un rango no es un nombre — no dice
 * dónde está, ni con qué libro, ni qué va a lograr. Y el peor de todos era el
 * último: cuarenta y tres días bajo un solo cartel.
 *
 * Un tramo que cae entero en una estación se llama por ella. Uno que cruza
 * varias se nombra por el camino que recorre, que es lo que de verdad hace.
 */
export function nombreDelTramo(desde: number, hasta: number): string {
  const inicio = estacionDelDia(desde);
  const fin = estacionDelDia(hasta);
  if (!inicio || !fin) return `Días ${desde} a ${hasta}`;
  if (inicio.id === fin.id) return inicio.nombre;
  const corto = (n: string) => n.replace(/^(El|La) /, '');
  return `Del ${corto(inicio.nombre)} al ${corto(fin.nombre)}`;
}

/** Cuántos días lleva andados dentro de su estación, y cuántos tiene. */
export function dentroDeLaEstacion(dia: number): { va: number; de: number } | null {
  const e = estacionDelDia(dia);
  if (!e) return null;
  return { va: dia - e.desde + 1, de: e.hasta - e.desde + 1 };
}

/**
 * Las jornadas que el mapa del viaje compromete por nombre, con su estación.
 *
 * Es contra esta lista que la lente avisa si una jornada se corrió de su
 * tramo. Sin ella habría que adivinar por el título.
 */
export const JORNADAS_COMPROMETIDAS: Record<string, IdPaisaje> = {
  /* Lago — los cinco días de Tu Precio Nuevo. */
  'P1.3': 'lago',
  'P1.4': 'lago',
  'P1.6': 'lago',
  'P1.5': 'lago',
  /* Montaña — a quién sirves, tu método, tu oferta. */
  'P2.1': 'montana',
  'P2.4b': 'montana',
  /* Viento — tus anuncios y tus campañas encendidas. */
  'P6.d30': 'viento',
  'P6.d31': 'viento',
};
