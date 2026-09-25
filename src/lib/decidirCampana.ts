import {
  UMBRALES, METRICAS_REGLAS, diasDeMedicion, veredictoAnuncio,
  type ObjetivoCampana,
} from './formulasAnuncios';

/**
 * EL MOTOR DE DECISIÓN — lo que la app decide en lugar del sanador.
 *
 * Las reglas ya estaban escritas, pero como TEXTO: "el ganador queda
 * corriendo, los otros dos se apagan" era una frase en un objeto que nadie
 * leía, y `semanasRefresh` era un dato que nadie usaba. Decidir seguía siendo
 * trabajo de una persona con criterio — y el cliente de $1.000 no tiene esa
 * persona al lado.
 *
 * Todo acá es determinista: mismas cifras, misma decisión, siempre. Un modelo
 * que opina sobre números responde distinto el martes y el jueves, y lo que
 * el sanador está comprando es justamente un criterio que no se mueve.
 */

/** Días de gasto sin UNA sola conversación antes de darlo por muerto. */
export const DIAS_PARA_MUERTO = 3;

export interface DatosAnuncio {
  nombre: string;
  gasto: number;
  visitas: number;
  conversaciones: number;
  agendas: number;
  ventas: number;
}

export interface EstadoCampana {
  objetivo: ObjetivoCampana;
  /** El precio del programa. Manda sobre los topes de costo. */
  precio: number;
  /** Días desde que se encendió. */
  diasEncendida: number;
  /** Los 3 anuncios con sus números de la semana. */
  anuncios: DatosAnuncio[];
  /** Semanas que lleva corriendo el mismo creativo ganador. */
  semanasDelGanador?: number;
}

export type EstadoAnuncio = 'sin_datos' | 'midiendo' | 'muerto' | 'ganador' | 'sigue';

export interface DecisionAnuncio {
  i: number;
  nombre: string;
  estado: EstadoAnuncio;
  /** El número que llevó a esta decisión. */
  porQue: string;
  /** Qué hacer con este anuncio. */
  queHacer: string;
  costoPorVenta: number | null;
  costoPorAgenda: number | null;
}

export type FaseCampana = 'midiendo' | 'decidiendo' | 'corriendo';

export interface DecisionCampana {
  fase: FaseCampana;
  /** Días que faltan para poder decidir. 0 si ya se puede. */
  diasParaDecidir: number;
  decisiones: DecisionAnuncio[];
  /** Índice del ganador, o null si todavía no hay. */
  ganador: number | null;
  /** LA única cosa que hay que hacer hoy. */
  accionPrincipal: string;
  /** true = el creativo ganador ya se gastó y toca refrescarlo. */
  tocaRefrescar: boolean;
}

const div = (a: number, b: number): number | null => (b > 0 ? a / b : null);

/**
 * Decide qué hacer con la campaña, hoy.
 *
 * El orden de las reglas importa:
 *  1. Un anuncio muerto se apaga AUNQUE esté en período de medición. Tres
 *     días de gasto sin una sola conversación no es ruido: es una pieza que
 *     no funciona, y esperar catorce días es tirar once de presupuesto.
 *  2. Antes del período de medición, no se opina del resto. La variación
 *     diaria con presupuestos chicos es enorme y apagar el día malo es el
 *     error más común.
 *  3. Pasado el período, gana el de menor costo por venta QUE ADEMÁS vendió.
 *     Un anuncio barato que no vende no es barato: es gratis y no sirve.
 *  4. Si TODAVÍA no vendió ninguno —que es lo normal en la semana 3—, gana
 *     el de menor costo por agenda: es lo más cerca de una venta que hay, y
 *     no decidir nada durante un mes es peor que decidir con el mejor dato
 *     disponible.
 */
export function decidirCampana(e: EstadoCampana): DecisionCampana {
  const gastoTotal = e.anuncios.reduce((t, a) => t + a.gasto, 0);
  const gastoDiario = e.diasEncendida > 0 ? gastoTotal / e.diasEncendida : 0;
  const diasNecesarios = diasDeMedicion(gastoDiario);
  const diasParaDecidir = Math.max(0, diasNecesarios - e.diasEncendida + 1);
  const enMedicion = e.diasEncendida < diasNecesarios;
  const u = UMBRALES[e.objetivo];

  const decisiones: DecisionAnuncio[] = e.anuncios.map((a, i) => {
    const costoPorVenta = div(a.gasto, a.ventas);
    const costoPorAgenda = div(a.gasto, a.agendas);
    const base = { i, nombre: a.nombre, costoPorVenta, costoPorAgenda };

    // ── 1 · Muerto: gastó y no abrió NI UNA conversación ──
    if (e.diasEncendida >= DIAS_PARA_MUERTO && a.gasto > 0 && a.conversaciones === 0) {
      return {
        ...base, estado: 'muerto',
        porQue: `${e.diasEncendida} días gastando y ninguna conversación.`,
        queHacer: 'Apágalo y reemplázalo. Tres días sin una sola conversación no es mala suerte: la pieza no engancha.',
      };
    }

    if (a.gasto === 0 && a.conversaciones === 0) {
      return {
        ...base, estado: 'sin_datos',
        porQue: 'Todavía no gastó ni trajo nada.',
        queHacer: 'Revisa que esté activo en el administrador de anuncios.',
      };
    }

    // ── 2 · En medición: no se opina ──
    if (enMedicion) {
      const v = veredictoAnuncio(e.objetivo, a);
      return {
        ...base, estado: 'midiendo',
        porQue: v.texto,
        queHacer: `Faltan ${diasParaDecidir} días para decidir. Hoy solo se carga y se atiende.`,
      };
    }

    // ── 3 · Pasada la medición ──
    const caro = costoPorVenta !== null && costoPorVenta > e.precio * 0.3;
    if (caro) {
      return {
        ...base, estado: 'muerto',
        porQue: `Cada venta te cuesta $${costoPorVenta!.toFixed(0)}, más del 30% de tu precio.`,
        queHacer: 'Apágalo. A ese costo no hay margen para escalar.',
      };
    }
    // Una conversación cara SOLA no mata a un anuncio.
    //
    // El tope de UMBRALES es una referencia de mercado (comercio electrónico,
    // públicos amplios). Un programa de miles vendido a un público chico
    // sostiene conversaciones mucho más caras: si una agenda puede costar
    // hasta el 5% del precio y una de cada tres conversaciones agenda,
    // entonces una conversación de $10 sigue cerrando en un programa de
    // $1.000. Matar por el umbral de mercado apagaba anuncios con un costo de
    // adquisición del 15%, o sea perfectamente rentables.
    //
    // Lo que sí mata: traer conversaciones caras Y no agendar a nadie. Eso no
    // es un anuncio caro, es un anuncio que trae a la gente equivocada.
    const costoConversacion = a.conversaciones > 0 ? a.gasto / a.conversaciones : null;
    const cara = costoConversacion !== null && costoConversacion > u.alarma;
    if (cara && a.agendas === 0 && a.conversaciones >= 10) {
      return {
        ...base, estado: 'muerto',
        porQue: `$${costoConversacion!.toFixed(2)} por conversación y ninguna agenda de ${a.conversaciones}.`,
        queHacer: 'Apágalo. No es que sea caro: está trayendo a la gente equivocada.',
      };
    }
    return {
      ...base, estado: 'sigue',
      porQue: costoPorVenta !== null
        ? `$${costoPorVenta.toFixed(0)} por venta.`
        : `${a.agendas} agendas, todavía sin venta.`,
      queHacer: cara
        ? `Sigue corriendo, pero la conversación te sale $${costoConversacion!.toFixed(2)}: con un creativo más fuerte, lo mismo te costaría menos.`
        : 'Sigue corriendo.',
    };
  });

  // ── El ganador ──
  // Gana el de menor costo por venta entre los que VENDIERON. Si nadie vendió,
  // el de menor costo por agenda: es lo más cerca de una venta que hay.
  const vivos = decisiones.filter((d) => d.estado === 'sigue' || d.estado === 'midiendo');
  const conVenta = vivos.filter((d) => d.costoPorVenta !== null);
  const candidatos = conVenta.length > 0
    ? conVenta
    : vivos.filter((d) => d.costoPorAgenda !== null);

  let ganador: number | null = null;
  if (!enMedicion && candidatos.length > 0) {
    const valor = (d: typeof candidatos[number]) =>
      d.costoPorVenta ?? d.costoPorAgenda ?? Infinity;
    const mejor = candidatos.reduce((a, b) => (valor(b) < valor(a) ? b : a));

    /**
     * NO HAY GANADOR SI HAY EMPATE.
     *
     * Con tres anuncios de números iguales, la app coronaba al primero por
     * desempate y le decía al sanador que apagara los otros dos. Eso no es
     * un ganador: es un empate, y decirle que uno ganó le da confianza falsa
     * y le hace apagar dos que estaban igual.
     *
     * Se considera empate cuando el segundo mejor está dentro del 15%: por
     * debajo de esa diferencia, con los volúmenes de una campaña chica, la
     * ventaja es ruido.
     */
    const ordenados = [...candidatos].sort((a, b) => valor(a) - valor(b));
    const segundo = ordenados[1];
    const hayEmpate = !!segundo
      && Number.isFinite(valor(mejor))
      && valor(mejor) > 0
      && (valor(segundo) - valor(mejor)) / valor(mejor) < 0.15;

    if (hayEmpate) {
      for (const c of ordenados.slice(0, 2)) {
        const d = decisiones[c.i];
        if (d.estado === 'sigue' || d.estado === 'midiendo') {
          d.queHacer = 'Sigue corriendo: todavía no se despega de los otros.';
        }
      }
    } else {
    ganador = mejor.i;
    const d = decisiones[mejor.i];
    if (d.estado === 'sigue') {
      d.estado = 'ganador';
      d.queHacer = 'Este queda corriendo. Genera dos piezas parecidas con la misma fórmula.';
    }
    }
  }

  // ── El refresco ──
  const [minSem, maxSem] = METRICAS_REGLAS.semanasRefresh;
  const semanas = e.semanasDelGanador ?? 0;
  const tocaRefrescar = ganador !== null && semanas >= minSem;

  // ── La única cosa que hay que hacer hoy ──
  const muertos = decisiones.filter((d) => d.estado === 'muerto');
  let accionPrincipal: string;
  if (muertos.length === decisiones.length && decisiones.length > 0) {
    accionPrincipal = 'Los tres están apagados. Antes de volver a gastar, revisa tu oferta y a quién le hablas: el problema no está en los anuncios.';
  } else if (muertos.length > 0) {
    accionPrincipal = muertos.length === 1
      ? `Apaga ${muertos[0].nombre} y reemplázalo.`
      : `Apaga ${muertos.length} anuncios y reemplázalos.`;
  } else if (enMedicion) {
    accionPrincipal = `No se opina, se mide. Faltan ${diasParaDecidir} días. Hoy: carga tu número y atiende las conversaciones.`;
  } else if (tocaRefrescar) {
    accionPrincipal = `Tu ganador lleva ${semanas} semanas. Refresca el creativo con otro gancho, misma fórmula — antes de que se gaste.`;
  } else if (ganador !== null) {
    accionPrincipal = `Tienes ganador: ${decisiones[ganador].nombre}. Genera dos piezas parecidas y apaga el resto.`;
  } else {
    accionPrincipal = 'Todavía no hay suficientes números para declarar un ganador. Sigue cargando.';
  }

  const fase: FaseCampana = enMedicion ? 'midiendo' : ganador !== null ? 'corriendo' : 'decidiendo';

  return { fase, diasParaDecidir, decisiones, ganador, accionPrincipal, tocaRefrescar };
}

/** Semanas que faltan antes de que el ganador se gaste. */
export function semanasHastaRefresco(semanasDelGanador: number): number {
  const [, max] = METRICAS_REGLAS.semanasRefresh;
  return Math.max(0, max - semanasDelGanador);
}
