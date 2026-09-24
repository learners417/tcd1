/**
 * ENRUTADOR DE MODELO POR TAREA
 *
 * Antes de esto, TODO el texto de la app iba por la misma cadena: DeepSeek
 * primero, Claude de respaldo, sin importar el trabajo. Escribir un guion de
 * venta con voz propia y mapear columnas a JSON no son la misma tarea y no
 * quieren el mismo modelo.
 *
 * REGLA DE FONDO DEL NEGOCIO: cuando hay que elegir entre un minuto de persona
 * y una llamada de modelo, siempre la llamada. La IA no es el costo del
 * negocio — el costo es el tiempo humano. Por eso acá no se optimiza para
 * gastar poco: se optimiza para que cada tarea salga BIEN, y se mide lo que
 * cuesta para poder decidir con el número a la vista.
 *
 * Lo que NO enruta acá: el diagnóstico de números. Es determinista y vive en
 * código (src/lib/valueChain.ts). Un modelo que opina sobre números da
 * respuestas distintas el martes y el jueves.
 */

export type Proveedor = 'claude' | 'deepseek';

/** Los trabajos que la app le pide a un modelo. */
export type Tarea =
  | 'guion'       // guiones de anuncio, carruseles, copy de venta
  | 'chat'        // Mentor y chat de campañas (streaming, volumen alto)
  | 'estructura'  // JSON, clasificar, mapear, extraer
  | 'auditoria'   // juzgar una pieza contra los 8 ingredientes
  | 'general';    // sin declarar: la cadena histórica, para no romper nada

export interface PasoRuta {
  proveedor: Proveedor;
  /** null = el default del proveedor (su env var). */
  modelo: string | null;
}

export interface RutaTarea {
  label: string;
  /** En orden de preferencia. Si el primero falla, se prueba el siguiente. */
  cadena: PasoRuta[];
  maxTokens: number;
  temperature?: number;
  /** Por qué ESE modelo. Queda en el código para que no se cambie sin motivo. */
  porQue: string;
}

const SONNET = 'claude-sonnet-4-6';
const HAIKU = 'claude-haiku-4-5';

export const RUTAS: Record<Tarea, RutaTarea> = {
  guion: {
    label: 'Guiones, carruseles y copy de venta',
    cadena: [
      { proveedor: 'claude', modelo: SONNET },
      { proveedor: 'deepseek', modelo: null },
    ],
    maxTokens: 8192,
    temperature: 0.8,
    porQue:
      'Tiene que sostener reglas de estilo largas (los 8 ingredientes, el registro ' +
      'neutro, la prohibición de jerga) sin aplanarse. Es lo que el cliente publica ' +
      'con su nombre: acá la calidad vale más que el ahorro.',
  },

  chat: {
    label: 'Mentor y chat de campañas',
    cadena: [
      { proveedor: 'deepseek', modelo: null },
      { proveedor: 'claude', modelo: SONNET },
    ],
    maxTokens: 4096,
    temperature: 0.7,
    porQue:
      'Es donde se van más tokens: conversación abierta, muchos turnos, todos los ' +
      'días. Conviene el más barato con respaldo bueno.',
  },

  estructura: {
    label: 'Estructurar, clasificar y extraer',
    cadena: [
      { proveedor: 'claude', modelo: HAIKU },
      { proveedor: 'deepseek', modelo: null },
    ],
    maxTokens: 4096,
    temperature: 0,
    porQue:
      'No necesita voz: necesita obedecer un esquema y no inventar. Haiku es cinco ' +
      'veces más barato que Sonnet y le sobra para esto. Temperatura en cero.',
  },

  auditoria: {
    label: 'Auditar una pieza antes de publicar',
    cadena: [
      { proveedor: 'claude', modelo: SONNET },
      { proveedor: 'deepseek', modelo: null },
    ],
    maxTokens: 2048,
    temperature: 0.2,
    porQue:
      'El que juzga NO puede ser el que escribió: un modelo aprueba su propio texto ' +
      'casi siempre. Por eso la auditoría es una llamada aparte, con temperatura ' +
      'baja para que el criterio no se mueva entre una pieza y la siguiente.',
  },

  general: {
    label: 'Sin tarea declarada',
    cadena: [
      { proveedor: 'deepseek', modelo: null },
      { proveedor: 'claude', modelo: null },
    ],
    maxTokens: 16384,
    porQue:
      'La cadena histórica. Existe para que ninguna llamada vieja cambie de ' +
      'comportamiento al instalar el enrutador.',
  },
};

export function esTarea(v: unknown): v is Tarea {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(RUTAS, v);
}

export function rutaDe(tarea: unknown): { tarea: Tarea; ruta: RutaTarea } {
  const t: Tarea = esTarea(tarea) ? tarea : 'general';
  return { tarea: t, ruta: RUTAS[t] };
}

// ── Precios ────────────────────────────────────────────────────────────────

export interface Precio {
  /** USD por millón de tokens de entrada. */
  entrada: number;
  /** USD por millón de tokens de salida. */
  salida: number;
  /** false = estimado, hay que confirmarlo con el proveedor. */
  verificado: boolean;
}

/**
 * USD por millón de tokens. Se puede pisar con la env var PRECIOS_IA
 * (JSON: {"modelo": {"entrada": n, "salida": n}}) sin tocar código, porque
 * los precios cambian y este archivo no puede quedar mintiendo.
 *
 * Claude: tarifas publicadas por Anthropic. Sonnet tiene precio introductorio
 * de 2/10 hasta el 31 de agosto de 2026; acá se deja el estándar de 3/15 para
 * no subestimar el costo.
 */
export const PRECIOS: Record<string, Precio> = {
  [SONNET]: { entrada: 3, salida: 15, verificado: true },
  [HAIKU]: { entrada: 1, salida: 5, verificado: true },
  // DeepSeek no publica tarifa estable y verificable desde acá: queda como
  // ESTIMADO. El panel de costos lo marca para que nadie lo tome por cierto.
  'deepseek-v4-pro': { entrada: 0.3, salida: 1.2, verificado: false },
  'deepseek-v4-flash': { entrada: 0.1, salida: 0.4, verificado: false },
};

function preciosEfectivos(): Record<string, Precio> {
  const crudo = process.env.PRECIOS_IA;
  if (!crudo) return PRECIOS;
  try {
    const extra = JSON.parse(crudo) as Record<string, Partial<Precio>>;
    const salida: Record<string, Precio> = { ...PRECIOS };
    for (const [modelo, p] of Object.entries(extra)) {
      salida[modelo] = {
        entrada: Number(p.entrada ?? salida[modelo]?.entrada ?? 0),
        salida: Number(p.salida ?? salida[modelo]?.salida ?? 0),
        verificado: true,
      };
    }
    return salida;
  } catch {
    console.warn('[router] PRECIOS_IA no es JSON válido — se ignora');
    return PRECIOS;
  }
}

/** Uso normalizado: Claude y DeepSeek reportan con nombres distintos. */
export interface UsoNormalizado {
  entrada: number;
  salida: number;
}

export function normalizarUso(usage: unknown): UsoNormalizado {
  const u = (usage ?? {}) as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  return {
    entrada: n(u.input_tokens) || n(u.prompt_tokens),
    salida: n(u.output_tokens) || n(u.completion_tokens),
  };
}

export interface Costo {
  usd: number;
  /** false = el precio del modelo es estimado, no confirmado. */
  verificado: boolean;
}

/** Cuánto costó una llamada. null si no se conoce el precio del modelo. */
export function costoDe(modelo: string, usage: unknown): Costo | null {
  const p = preciosEfectivos()[modelo];
  if (!p) return null;
  const u = normalizarUso(usage);
  const usd = (u.entrada * p.entrada + u.salida * p.salida) / 1_000_000;
  return { usd: Number(usd.toFixed(6)), verificado: p.verificado };
}
