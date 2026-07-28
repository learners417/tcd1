/**
 * EL CIERRE DEL DÍA.
 *
 * Dos preguntas, treinta segundos, al terminar:
 *
 *   · ¿Qué cerraste hoy?
 *   · ¿Qué te trabó?
 *
 * ═══ POR QUÉ ESTO Y NO UN PARTE DE HORAS ═══
 *
 * Un parte de horas dice cuánto trabajó alguien. No sirve para nada: nadie
 * decide distinto sabiendo que Lupe trabajó siete horas.
 *
 * **Lo que sirve es la traba.** Porque una traba que aparece tres veces deja
 * de ser un problema de esfuerzo y pasa a ser un problema de sistema — y eso
 * es trabajo de desarrollo, no de insistir. Sin este registro, esa traba se
 * cuenta en una conversación, se olvida, y vuelve el mes que viene.
 *
 * ═══ Y POR QUÉ NO SE DISCUTE EN EL MOMENTO ═══
 *
 * Las trabas se anotan y se resuelven **el viernes**, todas juntas. Discutir
 * cada una cuando aparece rompe el día de dos personas para resolver algo
 * que casi siempre puede esperar cuatro días.
 */

export interface CierreDelDia {
  /** Quién y cuándo. */
  personaId: string;
  fecha: string;
  /** Los clientes que atendió hoy. */
  atendidos: string[];
  /** Lo que trabó, si algo trabó. Una línea. */
  traba?: string;
  /** Con qué cliente, si la traba fue de un cliente puntual. */
  trabaCliente?: string;
  /** Minutos, calculados de lo atendido. No se le pregunta a nadie. */
  minutos: number;
}

/** Minutos que cuesta cada cosa. Los mismos que usa el techo de carga. */
export const MINUTOS = { excepcion: 20, sesion: 45, instalacion: 30 };

export function minutosDelDia(x: {
  excepciones: number; sesiones: number; instalaciones: number;
}): number {
  return x.excepciones * MINUTOS.excepcion
    + x.sesiones * MINUTOS.sesion
    + x.instalaciones * MINUTOS.instalacion;
}

// ── Las trabas ─────────────────────────────────────────────────────────────

export interface Traba {
  texto: string;
  /** Cuántas veces apareció algo parecido. */
  veces: number;
  /** De qué clientes. */
  clientes: string[];
  /** La más reciente. */
  ultima: string;
  /** true = ya no es esfuerzo, es sistema. */
  esDelSistema: boolean;
}

/** A partir de acá, la traba no se resuelve insistiendo. */
export const VECES_PARA_SER_SISTEMA = 3;

/**
 * Normaliza para poder contar repeticiones.
 *
 * No es un análisis: es bajar a minúsculas, sacar acentos y quedarse con las
 * palabras que significan algo. Dos trabas escritas distinto —«no le llega el
 * DM» y «no llegan los DM»— tienen que contar como la misma, porque lo son.
 */
const VACIAS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'que', 'no', 'se',
  'me', 'te', 'le', 'y', 'a', 'en', 'con', 'por', 'para', 'su', 'sus', 'es',
  'esta', 'este', 'lo', 'al', 'mas', 'muy', 'pero', 'como', 'cuando',
  'hay', 'ser', 'esta', 'ese', 'esa',
]);

/**
 * Reduce una palabra a su raíz aproximada, cortándola.
 *
 * Sin esto, «llega» y «llegan» cuentan como trabas distintas, y «automático»
 * y «automáticos» también. Y una traba que no se agrupa nunca llega a las
 * tres veces, así que nunca se detecta como problema de sistema — que es
 * justo para lo que existe todo esto.
 *
 * Es TOSCO A PROPÓSITO: se queda con las primeras cinco letras y nada más.
 * Intenté antes recortar las terminaciones del castellano una por una y salió
 * peor: quitaba la del plural pero no la del singular, así que «llegan» daba
 * «lleg» y «llega» seguía siendo «llega» — creaba más diferencia de la que
 * borraba. Cortar por largo es predecible y no tiene ese problema.
 *
 * Se pierde precisión: «campaña» y «campamento» caerían juntas. No importa —
 * lo que se agrupa acá son frases enteras, no palabras sueltas, y hace falta
 * que coincida el 60% de ellas.
 */
const LARGO_RAIZ = 5;
function raiz(p: string): string {
  return p.length <= LARGO_RAIZ ? p : p.slice(0, LARGO_RAIZ);
}

/**
 * Las palabras que significan algo, en su raíz.
 *
 * Se quedan las de DOS letras o más: «DM» es de dos y es la palabra más
 * importante de la traba más común que existe.
 */
function palabras(texto: string): Set<string> {
  return new Set(
    texto
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((p) => p.length >= 2 && !VACIAS.has(p))
      .map(raiz),
  );
}

/**
 * Cuánto se parecen dos trabas: de 0 a 1.
 *
 * Se compara contra la MÁS CORTA de las dos, no contra la unión. «No llega el
 * DM» y «no le llega el DM automático al cliente desde ayer» son la misma
 * traba contada con más palabras, y así se reconocen.
 */
function parecido(a: Set<string>, b: Set<string>): number {
  const chico = a.size <= b.size ? a : b;
  const grande = a.size <= b.size ? b : a;
  if (chico.size === 0) return 0;
  let comunes = 0;
  for (const p of chico) if (grande.has(p)) comunes++;
  return comunes / chico.size;
}

/** A partir de acá, dos trabas son la misma. */
export const PARECIDO_MINIMO = 0.6;

/**
 * Agrupa las trabas de la semana, las repetidas primero.
 *
 * El orden importa: lo que se repite es lo que hay que arreglar de raíz, aunque
 * suene menos urgente que lo que pasó ayer.
 */
export function agruparTrabas(cierres: CierreDelDia[]): Traba[] {
  const grupos: Array<Traba & { huella: Set<string> }> = [];

  for (const c of cierres) {
    const t = (c.traba ?? '').trim();
    if (t.length < 5) continue;
    const h = palabras(t);
    if (h.size === 0) continue;

    const previo = grupos.find((g) => parecido(g.huella, h) >= PARECIDO_MINIMO);
    if (previo) {
      previo.veces++;
      // Se queda el texto más largo: describe mejor el problema.
      if (t.length > previo.texto.length) previo.texto = t;
      if (c.trabaCliente && !previo.clientes.includes(c.trabaCliente)) {
        previo.clientes.push(c.trabaCliente);
      }
      if (c.fecha > previo.ultima) previo.ultima = c.fecha;
      previo.esDelSistema = previo.veces >= VECES_PARA_SER_SISTEMA;
    } else {
      grupos.push({
        texto: t, veces: 1,
        clientes: c.trabaCliente ? [c.trabaCliente] : [],
        ultima: c.fecha, esDelSistema: false, huella: h,
      });
    }
  }

  return grupos
    .map(({ huella: _h, ...resto }) => resto)
    .sort((a, b) => b.veces !== a.veces ? b.veces - a.veces : (b.ultima > a.ultima ? 1 : -1));
}

export interface ResumenSemana {
  /** Horas de trabajo humano en la semana. */
  horas: number;
  /** Cuántas cuentas se tocaron. */
  cuentasTocadas: number;
  /** Minutos de humano por cliente: el número que dice si la app sirve. */
  minutosPorCliente: number;
  /** Las trabas que ya son del sistema. */
  delSistema: number;
  /** La frase de arriba. */
  titular: string;
}

export function resumirSemana(
  cierres: CierreDelDia[],
  clientesActivos: number,
): ResumenSemana {
  const minutos = cierres.reduce((t, c) => t + (c.minutos || 0), 0);
  const cuentas = new Set(cierres.flatMap((c) => c.atendidos)).size;
  const trabas = agruparTrabas(cierres);
  const delSistema = trabas.filter((t) => t.esDelSistema).length;
  const porCliente = clientesActivos > 0 ? Math.round(minutos / clientesActivos) : 0;

  let titular: string;
  if (cierres.length === 0) {
    titular = 'Todavía nadie cerró su día esta semana.';
  } else if (delSistema > 0) {
    titular = delSistema === 1
      ? 'Hay una traba que ya se repitió tres veces. Esa no se arregla insistiendo.'
      : `Hay ${delSistema} trabas que ya se repitieron. Esas no se arreglan insistiendo.`;
  } else if (trabas.length === 0) {
    titular = 'Semana sin trabas. Todo lo que se atendió se destrabó.';
  } else {
    titular = `${trabas.length} ${trabas.length === 1 ? 'traba' : 'trabas'} para mirar juntos.`;
  }

  return {
    horas: Math.round((minutos / 60) * 10) / 10,
    cuentasTocadas: cuentas,
    minutosPorCliente: porCliente,
    delSistema,
    titular,
  };
}
