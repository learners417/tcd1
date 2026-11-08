/**
 * LAS CINCO ESTACIONES — la columna del viaje.
 *
 * ═══ QUÉ SON ═══
 *
 * El Lago, la Montaña, el Viento, el Río y el Bosque. Cada una tiene su libro,
 * su tramo de días, su color, lo que el cliente hace en la app, el logro que
 * la cierra y el logro que la abre.
 *
 * Son la misma estructura del Mapa del viaje completo y de los cinco libros
 * del sur. Un cliente que lee el libro del Lago y entra a la app tiene que
 * encontrar la misma palabra en los dos lados.
 *
 * ═══ POR QUÉ NO SON LOS PILARES ═══
 *
 * La app ya agrupa las jornadas en pilares —P0 a P9B— y los muestra con
 * títulos que dicen «Días 48 a 90». Eso no es un nombre: es un rango.
 *
 * La tentación era renombrar los pilares a las estaciones. No va, y por un
 * motivo concreto: los ids de pilar están cableados en el esquema del ADN
 * (`pilarRange`, `pilarOrigen`), en los cinturones, en las compuertas de plan
 * y en las respuestas rápidas del Mentor. Partir `P9B` —que hoy abarca del
 * día 48 al 90, el trabajo de tres estaciones— arrastraría seis archivos de
 * plomería para cambiar algo que el cliente nunca ve.
 *
 * Así que la estación es una dimensión APARTE, derivada del día:
 *
 *   el pilar     es de la máquina — el ADN, los cinturones, los planes
 *   la estación  es del cliente   — dónde está del viaje, y con qué libro
 *
 * Un día pertenece a una sola estación y la cuenta es del día, no del código:
 * los códigos se reordenan, los días no.
 *
 * ═══ EL CANDADO ═══
 *
 * Cada estación declara con qué se ABRE. Eso es lo que convierte la app en
 * mentor y no en curso: no se pasa a la Montaña por llegar al día 8, se pasa
 * con el reset hecho. Y la pauta no se enciende sin la primera venta.
 *
 * Acá solo está declarado. Quien lo hace cumplir es la cirugía del candado.
 */

export interface Estacion {
  /** El id corto, estable. */
  id: 'lago' | 'montana' | 'viento' | 'rio' | 'bosque' | 'cierre';
  /** Como se nombra al cliente. */
  nombre: string;
  /** El libro del sur que se vive en este tramo. */
  libro: string;
  /** La libertad que trabaja. */
  libertad: string;
  /** Primer y último día del tramo, inclusive. */
  desde: number;
  hasta: number;
  /**
   * El color del paisaje, como valor de CSS.
   *
   * Los cinco del sur son los hex del mapa del viaje. El Cierre no es un
   * paisaje: lleva el oro de la casa, y el oro va SIEMPRE por su variable —
   * escrito a mano se desincroniza el día que el tono cambie, y la lente de
   * la piel lo caza.
   */
  color: string;
  /** Con qué se abre. El primer tramo se abre con el primer día. */
  seAbreCon: string;
  /** Con qué se sale. Es el candado de la siguiente. */
  teDeja: string;
}

/**
 * Los tramos salen del Mapa del viaje completo.
 *
 * El cierre no es una estación del sur: son los últimos días, donde se mide
 * la llegada contra la partida y se arma el trimestre que viene. Se declara
 * acá para que todo día del Camino tenga dónde caer — un día sin estación es
 * un día que la pantalla no sabe nombrar.
 */
export const ESTACIONES: Estacion[] = [
  {
    id: 'lago', nombre: 'El Lago', libro: 'Lo que el lago te enseña',
    libertad: 'libertad mental', desde: 1, hasta: 7, color: '#41606a',
    seAbreCon: 'El primer día',
    teDeja: 'Tu reset hecho: tu precio nuevo y tu Guardián sellados',
  },
  {
    id: 'montana', nombre: 'La Montaña', libro: 'Lo que la montaña te enseña',
    libertad: 'libertad financiera', desde: 8, hasta: 14, color: '#7a4130',
    seAbreCon: 'Tu reset hecho',
    teDeja: 'Tu programa listo para vender, con su enlace de pago',
  },
  {
    id: 'viento', nombre: 'El Viento', libro: 'Lo que el viento te enseña',
    libertad: 'libertad emocional', desde: 15, hasta: 36, color: '#6e5a38',
    seAbreCon: 'Tu programa listo',
    teDeja: 'Tu captación andando y tres ventas pagas',
  },
  {
    id: 'rio', nombre: 'El Río', libro: 'Lo que el río te enseña',
    libertad: 'libertad energética', desde: 37, hasta: 70, color: '#2d676c',
    seAbreCon: 'Tres ventas pagas',
    teDeja: 'Tu app andando, horas recuperadas y siete mil dólares vendidos',
  },
  {
    id: 'bosque', nombre: 'El Bosque', libro: 'Lo que el bosque te enseña',
    libertad: 'libertad de tiempo', desde: 71, hasta: 84, color: '#4b5f4f',
    seAbreCon: 'Siete mil dólares vendidos',
    teDeja: 'Doce semanas programadas y tus primeras invitaciones',
  },
  {
    id: 'cierre', nombre: 'El Cierre', libro: 'Sanadores Libres',
    libertad: 'tu trimestre que viene', desde: 85, hasta: 90, color: 'var(--oro, #B0822E)',
    seAbreCon: 'Tu ecosistema andando',
    teDeja: 'Tu foto de llegada, tu testimonio y tu plan de 180 días',
  },
];

/** La estación de un día. `null` para el día 0, que es la entrega técnica. */
export function estacionDelDia(dia: number | null | undefined): Estacion | null {
  if (typeof dia !== 'number' || dia < 1) return null;
  return ESTACIONES.find((e) => dia >= e.desde && dia <= e.hasta) ?? null;
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
  return `Del ${inicio.nombre.replace(/^(El|La) /, '')} al ${fin.nombre.replace(/^(El|La) /, '')}`;
}

/** Cuántos días lleva andados dentro de su estación, y cuántos tiene. */
export function dentroDeLaEstacion(dia: number): { va: number; de: number } | null {
  const e = estacionDelDia(dia);
  if (!e) return null;
  return { va: dia - e.desde + 1, de: e.hasta - e.desde + 1 };
}

/**
 * Las jornadas que el mapa compromete por nombre, con su estación.
 *
 * Es contra esta lista que la lente avisa si una jornada se corrió de su
 * tramo. Sin ella habría que adivinar por el título.
 *
 * ═══ DOS LUGARES DONDE EL CAMINO LE GANÓ AL MAPA (7 nov) ═══
 *
 * El mapa del viaje y el Camino no coincidían en dos tramos. En los dos ganó
 * el Camino, porque en los dos tenía un argumento y el mapa solo un rango.
 *
 * 1 · EL RÍO ARRANCA EL 37, no el 57. El cliente construye su app cuando ya
 *     tiene a quién meter adentro: su primera venta es el día 26 y su primer
 *     consultante entra el 40. Esperar al 57 son diecinueve días atendiendo
 *     a mano a personas que ya pagaron.
 *
 * 2 · EL ECOSISTEMA SE QUEDA EN EL CIERRE, días 85 y 86, y no sube al
 *     Bosque. El día 85 trae su propio veredicto escrito: «sesenta días sin
 *     publicar fue a propósito; ahora tienes qué vender y cómo venderlo,
 *     recién ahora el contenido rinde». Publicar antes de tener oferta y
 *     precio es justamente el error que le cuesta los noventa días.
 *
 * LO QUE ESO DEJA PENDIENTE, y está anotado para su cirugía: el Bosque
 * (71-84) se queda sin contenido propio. Hoy esos catorce días son
 * operación. Le faltan su perfil, sus cinco alianzas, sus tres invitaciones
 * —podcast, live y medio— y su libro, que el mapa ya pide y la app no tiene.
 */
export const JORNADAS_COMPROMETIDAS: Record<string, Estacion['id']> = {
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
