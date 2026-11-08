/**
 * EL DICTAMEN — lo que la app le dice al cliente cuando termina de contarse.
 *
 * ═══ QUÉ ES ═══
 *
 * La última pantalla de la bienvenida. No es un resumen de lo que contestó:
 * es un VEREDICTO. Le nombra la etapa en la que está, con sus palabras y sus
 * datos, y le muestra la puerta por donde entra.
 *
 * Javo eligió esta forma entre tres el 8 de noviembre. La estructura es fija y
 * lo único que cambia son tres renglones:
 *
 *     TU PUNTO DE PARTIDA
 *     {tienes}
 *     {teFalta}
 *
 *     TU ETAPA
 *     {etapa}
 *
 *     Tu ADN provisorio ya está escrito con lo que acabas de contarme.
 *     Se sella el día 5, cuando pongas tu precio nuevo.
 *
 *     De acá al día 90 pasas por cinco paisajes.
 *     Empiezas en {estación}, el lunes.
 *
 * ═══ POR QUÉ ES UN MÓDULO Y NO TEXTO ADENTRO DEL WIZARD ═══
 *
 * Porque el onboarding se va a rehacer entero —Javo lo pidió el 8 de
 * noviembre: una radiografía de 10 a 20 minutos, con FODA, subida de archivos
 * y audio— y el dictamen tiene que sobrevivir a eso. Lo que decide la etapa
 * son los HECHOS del cliente, no de qué pantalla vinieron: si mañana entran
 * por otro lado, este archivo no cambia.
 *
 * Por el mismo motivo todos los campos de entrada son opcionales. Un cliente
 * que dejó algo sin contestar igual tiene que recibir su dictamen; lo que no
 * se sabe, no se afirma.
 */
import { estacionDelDia } from './estaciones';

/** Lo que el cliente contó, sin importar en qué pantalla lo contó. */
export interface LoQueSabemos {
  /** 'B' si ya tiene método propio, 'A' si todavía no. */
  avatar?: string | null;
  /** Si ya vendió a su precio: 'si' | 'parecido_barato' | 'no'. */
  vendioAlPrecio?: string | null;
  /** Lo que escribió de su escalera de ofertas. */
  escalera?: string | null;
  /** Lo que escribió de dónde le llegan hoy los consultantes. */
  llegan?: string | null;
}

export interface Dictamen {
  /** El renglón de lo que SÍ tiene. Siempre en positivo. */
  tienes: string;
  /** El renglón del reencuadre: lo que falta no es lo que él cree. */
  teFalta: string;
  /** La etapa, en la forma «Tienes X. Te falta Y.» */
  etapa: string;
  /** El día en que su ADN deja de ser provisorio. */
  diaDeSellado: number;
  /**
   * El nombre de la estación donde empieza, listo para ir en mitad de frase.
   *
   * «Empiezas en El lago» tiene una mayúscula que no va: ahí el artículo es
   * parte de la oración, no del nombre. Las estaciones se llaman «El lago» y
   * «La montaña» porque así encabezan una pantalla; acá van en minúscula.
   */
  primeraEstacion: string;
}

/** El día en que el precio nuevo queda sellado y con él, el ADN. */
const DIA_DE_SELLADO = 5;

/**
 * Las etapas, de menos a más armado.
 *
 * La forma es siempre la misma —«Tienes X. Te falta Y.»— porque lo que hace
 * que esto no sea un horóscopo es que las dos mitades sean verdad para él. La
 * primera la reconoce; la segunda le duele un poco. Si la primera no la
 * reconoce, la segunda no la escucha.
 *
 * El orden importa: se devuelve la PRIMERA que aplica, de la más atrás a la
 * más adelante, así nadie recibe un dictamen que le queda grande.
 */
export function dictaminar(sabemos: LoQueSabemos): Dictamen {
  const estacion = estacionDelDia(1);
  const base = {
    diaDeSellado: DIA_DE_SELLADO,
    primeraEstacion: (estacion?.nombre ?? 'El lago').replace(/^(El|La) /, (m) => m.toLowerCase()),
  };

  const tieneMetodo = sabemos.avatar === 'B';
  const vendio = sabemos.vendioAlPrecio;
  const tieneEscalera = Boolean(sabemos.escalera?.trim());

  /* ── Todavía no tiene método propio ── */
  if (!tieneMetodo) {
    return {
      ...base,
      tienes: 'Tienes años atendiendo y resultados que nadie escribió.',
      teFalta: 'Lo que te falta no es experiencia: es ponerle forma.',
      etapa: 'Tienes práctica. Te falta método.',
    };
  }

  /* ── Tiene método y todavía no lo vendió ── */
  if (vendio === 'no' || !vendio) {
    return {
      ...base,
      tienes: 'Tienes método propio y años atendiendo.',
      teFalta: 'Lo que te falta no es aprender: es ponerle precio y salir.',
      etapa: 'Tienes método. Te falta venderlo.',
    };
  }

  /* ── Lo vendió, pero por debajo de lo que vale ── */
  if (vendio === 'parecido_barato') {
    return {
      ...base,
      tienes: 'Tienes método propio y ya vendiste con él.',
      teFalta: 'Lo que te falta no es vender: es cobrar lo que vale.',
      etapa: 'Tienes método y ventas. Te falta tu precio.',
    };
  }

  /* ── Vende a su precio y ya armó su escalera ── */
  if (tieneEscalera) {
    return {
      ...base,
      tienes: 'Tienes método, precio y una escalera armada.',
      teFalta: 'Lo que te falta no es construir: es que corra sin ti adelante.',
      etapa: 'Tienes el negocio. Te falta soltarlo.',
    };
  }

  /* ── Vende a su precio y todavía es todo a mano ── */
  return {
    ...base,
    tienes: 'Tienes método propio y años atendiendo.',
    teFalta: 'Lo que te falta no es aprender: es ordenar.',
    etapa: 'Tienes método y precio. Te falta sistema.',
  };
}
