/**
 * EL CANDADO — lo que la app le frena al cliente, y por qué.
 *
 * ═══ QUÉ ES ═══
 *
 * El Camino ya avanza por logro: `diaDeTrabajo` es el día de su próxima
 * jornada sin terminar, así que quien no completa, no avanza. Eso alcanza
 * para el ORDEN, pero no para los frenos que importan.
 *
 * Un freno de verdad no es «todavía no llegaste al día 31». Es «todavía no
 * vendiste, y encender pauta antes de tu primera venta es la forma más rápida
 * de quemar tu presupuesto». Eso no lo puede decidir el calendario: lo decide
 * un HECHO del negocio del cliente.
 *
 * ═══ POR QUÉ ESTO VIVE EN LA APP Y EN NINGÚN OTRO LADO ═══
 *
 * Un manual puede explicarle que no encienda pauta antes de vender. Un mentor
 * se lo puede decir en una llamada. Pero sólo la app puede NO DEJARLO. Esa es
 * la diferencia entre un curso y un sistema, y es lo que el cliente está
 * pagando.
 *
 * ═══ QUÉ NO HACE ═══
 *
 * No esconde la jornada ni la salta. El cliente la ve, lee qué le falta para
 * abrirla y sabe exactamente qué hacer. Un candado sin motivo visible es una
 * pared; con el motivo a la vista es una instrucción.
 */

/** Los hechos del negocio del cliente que abren candados. */
export interface HechosDelNegocio {
  /** Ventas que el cliente registró él mismo en Mis Números. */
  ventasRegistradas: number;
  /**
   * Si MiClínica reportó un cobro verificado.
   *
   * Viene del puente `/api/mcd-bridge`, que consulta
   * `/api/integrations/tcd` de MiClínica y devuelve `primer_cobro`. Ese
   * puente ya existía y ya alimentaba el Cinturón Rojo.
   */
  cobroVerificadoEnMiClinica: boolean;
}

export const SIN_HECHOS: HechosDelNegocio = {
  ventasRegistradas: 0,
  cobroVerificadoEnMiClinica: false,
};

export interface Candado {
  /** El día que queda cerrado hasta que el hecho ocurra. */
  dia: number;
  /** Qué lo abre, en las palabras que el cliente lee en pantalla. */
  abreCon: string;
  /** Por qué existe el freno. Se lee en la tarjeta, debajo del candado. */
  porQue: string;
  /** Qué hacer ahora para abrirlo. */
  comoLoAbres: string;
  cumple: (h: HechosDelNegocio) => boolean;
}

/**
 * Los candados del Camino.
 *
 * Hoy hay UNO, y es el que Javo pidió primero: la pauta no se enciende antes
 * de la primera venta. Se agregan de a uno y sólo cuando el hecho que los
 * abre existe de verdad en los datos — un candado que lee un dato que nadie
 * escribe es una pared sin puerta.
 *
 * La primera venta entra por dos lados, y con cualquiera alcanza:
 *
 *   · MiClínica la reporta sola, si el cliente cobra ahí.
 *   · El cliente la registra a mano en Mis Números.
 *
 * Javo eligió esto el 8 de noviembre, sabiendo el costo: alguien puede
 * tildarla sin haber vendido. Entre eso y trabar a quien vendió por
 * transferencia, prefiere no trabar a nadie.
 */
export const CANDADOS_DEL_CAMINO: Candado[] = [
  {
    dia: 31,
    abreCon: 'Tu primera venta',
    porQue:
      'Encender pauta antes de vender una vez a mano es la forma más rápida '
      + 'de gastar tu presupuesto sin aprender nada. Primero sabes que alguien '
      + 'paga por esto; después pagas por que más personas lo vean.',
    comoLoAbres:
      'Cuando cobres tu primera venta, regístrala en Mis Números. '
      + 'Si cobras desde MiClínica, se tilda sola.',
    cumple: (h) => h.ventasRegistradas > 0 || h.cobroVerificadoEnMiClinica,
  },
];

/** El candado de un día, si tiene uno. */
export function candadoDelDia(dia: number | null | undefined): Candado | null {
  if (!dia) return null;
  return CANDADOS_DEL_CAMINO.find((c) => c.dia === dia) ?? null;
}

/**
 * Si el día está abierto por sus hechos.
 *
 * Un día sin candado está siempre abierto: este archivo no decide el avance
 * del Camino, sólo agrega frenos sobre días que el cliente ya alcanzó.
 */
export function abiertoPorSusHechos(
  dia: number | null | undefined,
  hechos: HechosDelNegocio,
): boolean {
  const c = candadoDelDia(dia);
  return c ? c.cumple(hechos) : true;
}
