/**
 * LOS CINCO PAISAJES — la filosofía de los libros, dentro de la app.
 *
 * ═══ DE DÓNDE SALE ═══
 *
 * De la colección «Lo que el sur te enseña»: cinco libros, cada uno con un
 * paisaje de la Patagonia, y cada paisaje desarrollando uno de los cinco
 * sistemas. Y resulta que los cinco sistemas del libro SON los cinco sistemas
 * del Camino, con los mismos nombres:
 *
 *     Tu reset                  →  el lago      mirarte antes de moverte
 *     Tu programa               →  la montaña   subir por etapas hasta la cumbre
 *     Tu captación              →  el viento    que tu voz llegue lejos
 *     Tu propia app             →  el río       que todo corra solo
 *     Tu ecosistema             →  el bosque    raíces, red y tiempo
 *
 * O sea que la app ya tenía la estructura y le faltaba el relato. Un cliente
 * que entra al día 1 ve «Tu reset · Días 1-5»: correcto, y no dice nada. El
 * lago sí dice algo, y además es la misma imagen que va a encontrar en el
 * libro, en la landing y en los cuatro días en Bariloche.
 *
 * Esto no es decoración: es que la misma idea aparezca igual en todos lados.
 *
 * ═══ POR QUÉ CADA LECCIÓN TIENE ESTA FORMA ═══
 *
 * La del libro, que ya está probada: un dato real del paisaje, que baja al
 * trabajo del cliente, y cierra con una acción concreta para esta semana.
 *
 * El dato primero y la bajada después, no al revés. Una enseñanza que arranca
 * en consejo se lee como consejo; la misma enseñanza que arranca en un alerce
 * de mil quinientos años se lee como algo que ya era verdad antes de que
 * alguien la escribiera.
 */

/* ══════════════════ LA PALETA DEL LIBRO ══════════════════ */

/**
 * Los cuatro colores de la colección. Salen del PDF de imprenta, no de una
 * aproximación: son los mismos que se imprimen en la tapa.
 *
 * El oro va SOLO en líneas de 1px, versalitas y numerales. Nunca de relleno,
 * nunca en degradé, nunca con brillo: el dorado brillante se ve barato porque
 * ya todos lo copiaron cuando buscaron qué significaba high ticket.
 */
export const TINTA_LIBRO = {
  oro: '#A8875A',
  tinta: '#2B2723',
  suave: '#6F665C',
  papel: '#F6F1E8',
} as const;

/* ══════════════════ LOS CINCO ══════════════════ */

export type IdPaisaje = 'lago' | 'montana' | 'viento' | 'rio' | 'bosque';

export interface Paisaje {
  id: IdPaisaje;
  /** El número del sistema en el Camino y en el lomo del libro. */
  n: 1 | 2 | 3 | 4 | 5;
  /** Cómo se llama el sistema en la app. No se toca: ya está en el seed. */
  sistema: string;
  /** El paisaje. */
  nombre: string;
  /** El título del libro. */
  libro: string;
  /** Lo que enseña, en seis palabras. Es lo que va bajo el título. */
  ensena: string;
  /**
   * El dato real del paisaje. Verificable, no poético.
   *
   * Cada uno sale de la Patagonia y es comprobable. Es lo que hace que la
   * frase de abajo no se lea como una metáfora que alguien eligió, sino como
   * algo que el paisaje ya hacía.
   */
  dato: string;
  /** Qué significa eso para su trabajo. La bajada. */
  bajada: string;
  /** Los días del Camino que cubre. */
  dias: string;
  /**
   * La paleta de su tapa.
   *
   * `fondo` es el color impreso, el de la ilustración. `lecho` es el mismo
   * color más oscuro, y es donde va el texto: los colores de tapa están
   * calculados para tinta sobre papel, y en pantalla el texto blanco sobre el
   * ocre del viento daba 2,2 a 1 — ilegible. Medidos los cinco, el lecho da
   * 10 a 1 en blanco y 4,5 en el oro de la colección.
   *
   * La ilustración conserva el color de la tapa. Lo que cambia es la cama del
   * texto, que en el libro es el papel y acá no existía.
   */
  color: { fondo: string; lecho: string; claro: string; medio: string; hondo: string };
  /**
   * El centro vertical del dibujo, de 0 a 1.
   *
   * Los cinco están dibujados en vertical (200 × 260), como la tapa de un
   * libro. En una franja apaisada —que es como se ve en el teléfono— hay que
   * recortar, y recortar por el medio pierde lo que importa: el lago se queda
   * sin agua, la montaña sin cumbre.
   *
   * Cada uno dice dónde está su línea: la del lago es donde el agua toca la
   * cordillera; la de la montaña, la cumbre.
   */
  foco: number;
}

export const PAISAJES: Paisaje[] = [
  {
    id: 'lago', n: 1,
    sistema: 'Tu reset',
    nombre: 'El lago',
    libro: 'Lo que el lago te enseña',
    ensena: 'Mirarte antes de moverte',
    dato:
      'El Nahuel Huapi tiene más de cuatrocientos metros de profundidad, y los '
      + 'días sin viento la superficie devuelve la cordillera entera, sin una '
      + 'sola arruga.',
    bajada:
      'Un lago agitado no refleja nada. Los primeros días no se construye: se '
      + 'mira. Qué cobras, a quién atiendes, cuánto vale tu hora. Lo que se '
      + 'construye sobre una imagen movida sale torcido, y se nota recién al '
      + 'final.',
    dias: 'Días 1 a 5',
    color: { lecho: '#19445E', fondo: '#1B4A66', claro: '#9FC5D8', medio: '#4E86A4', hondo: '#10354B' },
    // La línea del agua con la cordillera reflejada. Va en 0.62 y no en el
    // medio: con el centro más arriba, la franja del teléfono cortaba el sol
    // justo por la mitad y la costura del panorama se veía.
    foco: 0.62,
  },
  {
    id: 'montana', n: 2,
    sistema: 'Tu programa de alto impacto',
    nombre: 'La montaña',
    libro: 'Lo que la montaña te enseña',
    ensena: 'Subir por etapas hasta la cumbre',
    dato:
      'Nadie sube el Tronador de una vez. Se duerme en el refugio, se sale de '
      + 'madrugada, y la cumbre llega el segundo día. Los que intentan hacerlo '
      + 'en una jornada vuelven a mitad de camino.',
    bajada:
      'Tu programa es eso: etapas con nombre, no una promesa de llegar. Quien '
      + 'compra una cumbre entera de una vez se baja en el primer tramo duro. '
      + 'Quien compra la primera etapa, sube.',
    dias: 'Días 8 a 12',
    color: { lecho: '#6A301D', fondo: '#A64B2E', claro: '#E8A68C', medio: '#C9674A', hondo: '#6B2A18' },
    // la cumbre y los campamentos de la huella
    foco: 0.42,
  },
  {
    id: 'viento', n: 3,
    sistema: 'Tu captación automática',
    nombre: 'El viento',
    libro: 'Lo que el viento te enseña',
    ensena: 'Que tu voz llegue lejos',
    dato:
      'El viento de la estepa sopla siempre en la misma dirección, y por eso los '
      + 'árboles crecen inclinados: la bandera patagónica. No es que sople más '
      + 'fuerte que en otros lados. Es que no para.',
    bajada:
      'Tu captación funciona igual. No es el día que publicas algo que explota: '
      + 'es la misma dirección, sostenida, hasta que lo que dices crece '
      + 'inclinado hacia donde querías.',
    dias: 'Días 15 a 33',
    color: { lecho: '#533C12', fondo: '#C08A2A', claro: '#F0D9A0', medio: '#D9A94B', hondo: '#7A5312' },
    // las rachas con el árbol inclinado
    foco: 0.55,
  },
  {
    id: 'rio', n: 4,
    sistema: 'Tu propia app',
    nombre: 'El río',
    libro: 'Lo que el río te enseña',
    ensena: 'Que todo corra solo',
    dato:
      'El Limay sale del Nahuel Huapi y corre quinientos kilómetros hasta el '
      + 'Atlántico sin que nadie lo empuje. El cauce lo hizo el agua, pasando '
      + 'siempre por el mismo lugar.',
    bajada:
      'Tu sistema es el cauce. Lo que repetiste tres veces esta semana, se '
      + 'graba: ahí deja de necesitarte. Lo que queda en vivo es lo único que '
      + 'solo haces tú.',
    dias: 'Días 36 a 44',
    color: { lecho: '#144646', fondo: '#1F6E6E', claro: '#A8DCDC', medio: '#3E9B9B', hondo: '#0E4747' },
    // la curva del río donde se ve el cauce
    foco: 0.58,
  },
  {
    id: 'bosque', n: 5,
    sistema: 'Tu ecosistema circular',
    nombre: 'El bosque',
    libro: 'Lo que el bosque te enseña',
    ensena: 'Raíces, red y tiempo',
    dato:
      'Los alerces de la Patagonia viven más de mil quinientos años, y no están '
      + 'solos: sus raíces se tocan bajo tierra y se pasan agua y azúcares entre '
      + 'ellos. El bosque es una sola cosa.',
    bajada:
      'Tu marca es lo que queda cuando dejas de empujar. Se construye con lo que '
      + 'ya eres —tu historia, tus años de consulta— y crece por abajo, donde no '
      + 'se ve, mucho antes de que se note arriba.',
    dias: 'Días 85 a 86',
    color: { lecho: '#17301F', fondo: '#1E3A2B', claro: '#8FB89A', medio: '#3E6B4E', hondo: '#0E2017' },
    // la línea de tierra con las raíces que se tocan
    foco: 0.70,
  },
];

/* ══════════════════ CÓMO SE ENCUENTRA ══════════════════ */

const PORSIS: Record<number, Paisaje> = Object.fromEntries(
  PAISAJES.map((p) => [p.n, p]),
) as Record<number, Paisaje>;

/** El paisaje de un sistema del Camino. */
export function paisajeDeSistema(n: number | null | undefined): Paisaje | null {
  return typeof n === 'number' ? PORSIS[n] ?? null : null;
}

export function paisajePorId(id: string): Paisaje | null {
  return PAISAJES.find((p) => p.id === id) ?? null;
}

/**
 * El paisaje del día en que está.
 *
 * Los rangos salen del seed y se parsean de `dias` para que haya un solo lugar
 * donde viven: con los números escritos acá y allá, el día que se mueva una
 * jornada la app mostraría el paisaje de otro sistema.
 */
export function paisajeDelDia(dia: number | null | undefined): Paisaje | null {
  if (typeof dia !== 'number') return null;
  // Se busca el ÚLTIMO cuyo primer día ya pasó: entre el 5 y el 8 el cliente
  // sigue en el lago, no en ninguno. Un hueco sin paisaje se ve como un error.
  let actual: Paisaje | null = null;
  for (const p of PAISAJES) {
    const desde = Number(/(\d+)/.exec(p.dias)?.[1] ?? 0);
    if (dia >= desde) actual = p;
  }
  return actual;
}

/* ══════════════════ LA COLECCIÓN, PARA NOMBRARLA ══════════════════ */

export const COLECCION = 'Lo que el sur te enseña';

/**
 * El libro madre, que queda aparte.
 *
 * Es el método: el qué y el cómo. La colección es la otra mitad, lo de dentro.
 * Son las dos partes de la misma filosofía, la de afuera y la de adentro.
 */
export const LIBRO_MADRE = {
  titulo: 'Sanadores Libres',
  queEs: 'El método completo, el libro del que sale todo esto.',
};

/** Lo que se dice cuando alguien pregunta por dónde empezar. */
export const COMO_SE_LEE =
  'Cada libro se lee solo, en cualquier orden. El número es el de la colección, '
  + 'no el de lectura.';
