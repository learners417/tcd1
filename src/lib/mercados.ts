/**
 * LOS MERCADOS — dónde corre la pauta, que no es donde vive el sanador.
 *
 * ═══ POR QUÉ ESTO EXISTE ═══
 *
 * `profiles.pais` dice DÓNDE VIVE el sanador, y sirve para elegir el dialecto
 * de su contenido. No sirve para juzgar sus números: **alguien puede vivir en
 * Chile y correr anuncios en Perú, Colombia y México.**
 *
 * Y el mercado cambia todo por dos motivos que se suman:
 *
 *   · **El costo.** Un CPM mexicano no se parece a uno español.
 *   · **El poder de compra.** En algunos mercados $1.000 es inalcanzable, y
 *     ahí la campaña «funciona» —conversaciones baratas— y no vende nunca.
 *
 * Juzgar a todos con la misma vara se equivoca en las dos direcciones: le
 * dice «caro» a quien está bien para su mercado, y «barato» a quien está
 * trayendo gente que no puede pagarle.
 *
 * ═══ DE DÓNDE SALEN LAS BANDAS ═══
 *
 * Las de acá abajo son un PUNTO DE PARTIDA de mercado, y están marcadas como
 * tales. La app acumula las suyas desde el primer día (ver `aprenderDeSemana`)
 * y en cuanto tiene suficientes, **usa las propias y lo dice**.
 *
 * Eso importa porque un benchmark ajeno ya nos hizo equivocar una vez: el
 * costo por conversación de comercio electrónico aplicado a un programa de
 * miles apagaba campañas rentables.
 */

export interface Mercado {
  codigo: string;
  nombre: string;
  /** CPM de referencia, en dólares. Punto de partida, no verdad. */
  cpmMin: number;
  cpmMax: number;
  /**
   * Cuánto puede pagar ese mercado, como múltiplo de referencia.
   * 1 = un programa de $1.000 es vendible sin fricción extra.
   */
  poderDeCompra: number;
}

/**
 * Los mercados donde estos clientes venden.
 *
 * No es una lista del mundo: son los países hispanohablantes donde tiene
 * sentido correr esta pauta. Agregar uno es agregar una línea.
 */
export const MERCADOS: Record<string, Mercado> = {
  AR: { codigo: 'AR', nombre: 'Argentina',   cpmMin: 2,  cpmMax: 4,  poderDeCompra: 0.5 },
  VE: { codigo: 'VE', nombre: 'Venezuela',   cpmMin: 1,  cpmMax: 3,  poderDeCompra: 0.3 },
  BO: { codigo: 'BO', nombre: 'Bolivia',     cpmMin: 2,  cpmMax: 4,  poderDeCompra: 0.4 },
  PY: { codigo: 'PY', nombre: 'Paraguay',    cpmMin: 2,  cpmMax: 5,  poderDeCompra: 0.5 },
  PE: { codigo: 'PE', nombre: 'Perú',        cpmMin: 3,  cpmMax: 7,  poderDeCompra: 0.6 },
  CO: { codigo: 'CO', nombre: 'Colombia',    cpmMin: 4,  cpmMax: 8,  poderDeCompra: 0.7 },
  EC: { codigo: 'EC', nombre: 'Ecuador',     cpmMin: 3,  cpmMax: 7,  poderDeCompra: 0.6 },
  MX: { codigo: 'MX', nombre: 'México',      cpmMin: 4,  cpmMax: 8,  poderDeCompra: 0.8 },
  CR: { codigo: 'CR', nombre: 'Costa Rica',  cpmMin: 5,  cpmMax: 10, poderDeCompra: 0.9 },
  CL: { codigo: 'CL', nombre: 'Chile',       cpmMin: 6,  cpmMax: 12, poderDeCompra: 1.0 },
  UY: { codigo: 'UY', nombre: 'Uruguay',     cpmMin: 6,  cpmMax: 12, poderDeCompra: 1.0 },
  ES: { codigo: 'ES', nombre: 'España',      cpmMin: 8,  cpmMax: 15, poderDeCompra: 1.3 },
  US: { codigo: 'US', nombre: 'EE.UU. hispano', cpmMin: 12, cpmMax: 25, poderDeCompra: 1.8 },
};

export const MERCADO_POR_DEFECTO = 'MX';

export interface BandaDeMercado {
  cpmMin: number;
  cpmMax: number;
  poderDeCompra: number;
  /** Los nombres, para poder decirlos. */
  nombres: string[];
  /** true = sale de los datos propios, no de la referencia de mercado. */
  propia: boolean;
  /** Cuántas semanas de datos propios la respaldan. */
  semanas: number;
}

/**
 * La banda de una campaña que corre en varios países a la vez.
 *
 * Se toma el rango que abarca a todos: si corre en México y España, el CPM
 * aceptable va del piso mexicano al techo español. Cualquier cosa adentro es
 * normal, porque no se puede saber de cuál de los dos vino cada impresión.
 *
 * Y el poder de compra se toma del MÁS BAJO, a propósito: si la mitad de la
 * audiencia no puede pagar el programa, eso ya explica una conversión floja
 * aunque el otro mercado sea rico.
 */
export function bandaDe(
  codigos: string[],
  propias?: Map<string, DatoPropio>,
): BandaDeMercado {
  const validos = codigos.filter((c) => MERCADOS[c]);
  const usar = validos.length > 0 ? validos : [MERCADO_POR_DEFECTO];

  let min = Infinity, max = 0, poder = Infinity, semanas = 0, propia = false;
  const nombres: string[] = [];

  for (const c of usar) {
    const m = MERCADOS[c];
    nombres.push(m.nombre);
    const p = propias?.get(c);
    // Los datos propios ganan sobre la referencia, siempre.
    if (p && p.semanas >= SEMANAS_PARA_CONFIAR) {
      min = Math.min(min, p.cpmMin);
      max = Math.max(max, p.cpmMax);
      semanas = Math.max(semanas, p.semanas);
      propia = true;
    } else {
      min = Math.min(min, m.cpmMin);
      max = Math.max(max, m.cpmMax);
    }
    poder = Math.min(poder, m.poderDeCompra);
  }

  return {
    cpmMin: Number.isFinite(min) ? min : 4,
    cpmMax: max || 8,
    poderDeCompra: Number.isFinite(poder) ? poder : 0.8,
    nombres, propia, semanas,
  };
}

/** Cómo se dice la banda, para poder mostrarla. */
export function explicarBanda(b: BandaDeMercado): string {
  const donde = b.nombres.length === 1
    ? b.nombres[0]
    : `${b.nombres.slice(0, -1).join(', ')} y ${b.nombres[b.nombres.length - 1]}`;
  if (b.propia) {
    return `Para ${donde}, con ${b.semanas} ${b.semanas === 1 ? 'semana' : 'semanas'} de datos tuyos, un CPM sano va de $${b.cpmMin} a $${b.cpmMax}.`;
  }
  return `Para ${donde}, un CPM sano va de $${b.cpmMin} a $${b.cpmMax}. Todavía no tengo datos propios de este mercado: es una referencia.`;
}

// ── La tabla propia ────────────────────────────────────────────────────────

/**
 * Lo que la app aprende de sus propios clientes.
 *
 * En cuatro semanas, once clientes en cinco o seis mercados producen algo que
 * ningún benchmark del mundo tiene: **cuánto cuesta una conversación y cuántas
 * compran, para programas de sanación de este precio, por país.**
 *
 * Por eso se acumula desde el primer día, aunque tarde en servir.
 */
export interface DatoPropio {
  mercado: string;
  /** Cuántas semanas de datos hay. */
  semanas: number;
  cpmMin: number;
  cpmMax: number;
  /** Costo medio por conversación. */
  costoConversacion: number;
  /** Qué porcentaje de conversaciones terminó en venta. */
  pctCompra: number;
  /** El rango de precio de los programas medidos. */
  precioMin: number;
  precioMax: number;
}

/** Menos que esto no alcanza para reemplazar la referencia. */
export const SEMANAS_PARA_CONFIAR = 4;

export interface ObservacionSemanal {
  mercados: string[];
  precio: number;
  gasto: number;
  impresiones: number;
  conversaciones: number;
  ventas: number;
}

/**
 * Suma una semana a lo aprendido.
 *
 * Si la campaña corrió en varios mercados, la observación se atribuye a todos
 * por igual. Es impreciso y es honesto: **Meta no dice de qué país vino cada
 * impresión**, y repartir por una regla inventada sería peor que atribuir a
 * todos y dejar que el volumen corrija con el tiempo.
 */
export function aprenderDeSemana(
  previo: Map<string, DatoPropio>,
  obs: ObservacionSemanal,
): Map<string, DatoPropio> {
  // Sin gasto o sin impresiones no hay nada que aprender.
  if (obs.gasto <= 0 || obs.impresiones <= 0) return previo;

  const cpm = (obs.gasto / obs.impresiones) * 1000;
  const costoConv = obs.conversaciones > 0 ? obs.gasto / obs.conversaciones : 0;
  const pctCompra = obs.conversaciones > 0 ? (obs.ventas / obs.conversaciones) * 100 : 0;

  const nuevo = new Map(previo);
  for (const m of obs.mercados.filter((c) => MERCADOS[c])) {
    const antes = nuevo.get(m);
    if (!antes) {
      nuevo.set(m, {
        mercado: m, semanas: 1,
        cpmMin: cpm, cpmMax: cpm,
        costoConversacion: costoConv,
        pctCompra,
        precioMin: obs.precio, precioMax: obs.precio,
      });
      continue;
    }
    const n = antes.semanas + 1;
    nuevo.set(m, {
      mercado: m,
      semanas: n,
      cpmMin: Math.min(antes.cpmMin, cpm),
      cpmMax: Math.max(antes.cpmMax, cpm),
      // Promedio móvil: cada semana pesa igual que las anteriores juntas
      // hasta que hay volumen. Simple y suficiente.
      costoConversacion: costoConv > 0
        ? (antes.costoConversacion * antes.semanas + costoConv) / n
        : antes.costoConversacion,
      pctCompra: obs.conversaciones > 0
        ? (antes.pctCompra * antes.semanas + pctCompra) / n
        : antes.pctCompra,
      precioMin: Math.min(antes.precioMin, obs.precio),
      precioMax: Math.max(antes.precioMax, obs.precio),
    });
  }
  return nuevo;
}

/**
 * Qué mercados recomendar para un precio dado.
 *
 * Solo recomienda con datos propios. **Sin ellos devuelve vacío y lo dice** —
 * una recomendación con datos inventados es peor que no recomendar nada, y
 * eso ya nos costó una vez.
 */
export function recomendarMercados(
  propias: Map<string, DatoPropio>,
  precio: number,
): { mercados: DatoPropio[]; porque: string } {
  const conDatos = [...propias.values()]
    .filter((d) => d.semanas >= SEMANAS_PARA_CONFIAR && d.pctCompra > 0)
    // Cerca del precio que se está por vender: un mercado medido con
    // programas de $300 no dice nada sobre uno de $3.000.
    .filter((d) => precio >= d.precioMin * 0.5 && precio <= d.precioMax * 2);

  if (conDatos.length === 0) {
    return {
      mercados: [],
      porque: `Todavía no tengo datos propios suficientes para recomendarte mercados a este precio. Hacen falta ${SEMANAS_PARA_CONFIAR} semanas midiendo.`,
    };
  }

  // El mejor es el que más compra por conversación, no el más barato.
  const ordenados = [...conDatos].sort(
    (a, b) => (b.pctCompra / Math.max(b.costoConversacion, 0.01))
            - (a.pctCompra / Math.max(a.costoConversacion, 0.01)));

  const mejor = ordenados[0];
  return {
    mercados: ordenados,
    porque: `${MERCADOS[mejor.mercado]?.nombre ?? mejor.mercado} es el que mejor te rinde: conversaciones a $${mejor.costoConversacion.toFixed(0)} y compra el ${mejor.pctCompra.toFixed(0)}%. Con ${mejor.semanas} semanas de datos tuyos.`,
  };
}
