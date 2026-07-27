import type { FilaComparativa } from './mesaPlataStorage';

/**
 * LA COLA DE EXCEPCIONES — el trabajo del día, ya decidido.
 *
 * La regla que la gobierna: **quien la trabaja EJECUTA, no diagnostica.**
 *
 * Lupe empezó hace dos meses y no sabe de pauta. Si la app le entrega un
 * tablero con doce números y espera que deduzca qué hacer, la respuesta va a
 * ser preguntarle a alguien — y ese alguien es justamente el cuello de
 * botella que estamos sacando. Así que acá no hay diagnósticos: hay frases
 * que se pueden ejecutar sin entender por qué.
 *
 * Y el orden no es alfabético ni por lo mal que está cada uno: es por DINERO
 * EN RIESGO. Una cuenta que factura $3.000 y está en amarillo pesa más que
 * una de $200 en rojo.
 */

export type QuienAtiende = 'la app' | 'operador' | 'dueño del criterio';

export interface ItemCola {
  clienteId: string;
  nombre: string;
  /** El id del cuello de botella. Se lleva explícito para que nadie tenga
   *  que deducirlo leyendo el texto de la situación. */
  cuello: string;
  /** Qué pasa, en una línea que se entiende sin saber de pauta. */
  situacion: string;
  /** LO QUE HAY QUE HACER. Ejecutable tal cual, sin interpretar. */
  accion: string;
  /** El canal: qué se le escribe o dónde se toca. */
  como: string;
  quien: QuienAtiende;
  /** Cuánto se pierde si esto no se resuelve. Ordena la cola. */
  enRiesgo: number;
  /** Semanas seguidas con el mismo problema. */
  semanasIgual: number;
  /** true = ya se le avisó solo y no alcanzó. */
  yaSeIntento: boolean;
}

export interface EntradaCola extends FilaComparativa {
  nombre: string;
  /** El plan del cliente decide quién lo atiende. */
  plan: 'blanco' | 'amarillo' | 'verde' | 'negro' | 'completo';
  /** Cuántas semanas seguidas viene con el mismo cuello de botella. */
  semanasIgual: number;
}

/**
 * Cuántas semanas seguidas con el mismo problema antes de que suba a un humano.
 *
 * Antes de eso, la app avisa sola. Si un cliente de $1.000 costara un minuto
 * de persona por mes, cien clientes serían cien horas y el modelo se cae.
 */
export const SEMANAS_ANTES_DE_ESCALAR = 2;

/** Lo que se le escribe al cliente según qué le está fallando. */
const ACCIONES: Record<string, { accion: string; como: string }> = {
  no_cargo: {
    accion: 'Pedirle los cinco números de la semana.',
    como: 'Mensaje directo: «¿Me pasas gasto, conversaciones, agendas y ventas de esta semana? Son dos minutos, y sin eso no puedo ver cómo vienes.»',
  },
  costo_conversacion: {
    accion: 'Que genere tres piezas nuevas con otro gancho.',
    como: 'Mensaje: «Los anuncios están trayendo poca gente para lo que gastas. Entra al Constructor y genera tres nuevas — la app ya te dice cuáles.»',
  },
  comentario_a_conversacion: {
    accion: 'Revisar la palabra clave y la automatización del DM.',
    como: 'Esto NO es del cliente: es técnico. Pasarlo al instalador con el nombre de la cuenta.',
  },
  conv_a_agenda: {
    accion: 'Revisar con él el DM, mensaje por mensaje.',
    como: 'En el 1-1: pedirle que te muestre tres conversaciones reales completas. El problema está ahí, no en el anuncio.',
  },
  show_rate: {
    accion: 'Que confirme cada agenda el mismo día.',
    como: 'Mensaje: «De cada diez que agendan, se te presentan menos de siete. Escríbeles el mismo día que agendan y ofrece horarios de esta semana, no de la que viene.»',
  },
  offer_rate: {
    accion: 'Escuchar una llamada entera con él.',
    como: 'En el 1-1: la llamada completa, con silencios. No el resumen.',
  },
  close_rate: {
    accion: 'Roleplay de llamada.',
    como: 'Agendarlo en la sesión grupal del miércoles. Antes de tocar el guion, verificar que las agendas sean del cliente correcto.',
  },
  costo_agenda: {
    accion: 'Revisar a quién le está hablando el anuncio.',
    como: 'En el 1-1: si cada agenda cuesta más del 5% de su precio, el anuncio trae a la persona equivocada. Se toca el avatar del gancho, no el presupuesto.',
  },
  mensajes: {
    accion: 'Que prospecte a mano esta semana.',
    como: 'Mensaje: «Además de la pauta, escríbele a diez personas que ya te siguen. En orgánico no se proyecta gasto: se proyecta actividad.»',
  },
  retencion: {
    accion: 'Que hable con los que están por terminar.',
    como: 'Mensaje: «Se te terminan clientes este mes y ninguno renovó. Habla con ellos ANTES de que termine, no después.»',
  },
  cac: {
    accion: 'Revisar el precio con él.',
    como: 'En el 1-1: si conseguir un cliente cuesta más del 30% de lo que cobra, o sube el precio o cambia la oferta.',
  },
  pct_cobrado: {
    accion: 'Revisar cómo ofrece el pago.',
    como: 'Mensaje: «Estás vendiendo pero cobrando poco por adelantado. Ofrece el pago completo primero, y las cuotas solo si dice que no.»',
  },
  roi_cash: {
    accion: 'Frenar la pauta hasta que entre plata.',
    como: 'Mensaje: «Vamos a bajar la inversión unos días. Lo que entra todavía no alcanza para sostener lo que sale.»',
  },
  gasto_ratio: {
    accion: 'Subirle la inversión.',
    como: 'Mensaje: «Todo lo demás está sano. Lo único que falta es volumen: sube el presupuesto diario.»',
  },
  piezas: {
    accion: 'Agendarle una sesión de grabación.',
    como: 'Mensaje: «Se te está terminando el banco de piezas. ¿Qué día de esta semana grabas?» Con guion cerrado, nunca improvisando.',
  },
  cobro_cuotas: {
    accion: 'Que reclame las cuotas que rebotaron.',
    como: 'Mensaje: «Tienes cuotas sin cobrar. Eso es dinero ya vendido que se está perdiendo.»',
  },
  casos_exito: {
    accion: 'Que pida el testimonio a los que ya terminaron.',
    como: 'Mensaje: «Pídele un video corto a los que terminaron. Es lo que va a vender al próximo.»',
  },
  referidos: {
    accion: 'Que pida referidos en la próxima llamada.',
    como: 'Mensaje: «Pídelo en vivo, al final de la llamada. Por escrito casi nunca sale.»',
  },
};

const GENERICA = {
  accion: 'Revisar la cuenta en el 1-1.',
  como: 'Abrir su Mesa de plata juntos y mirar el cuello de botella que marca.',
};

/**
 * Quién atiende, según el plan y cuánto lleva igual.
 *
 * El de $1.000 recibe el aviso automático primero. Solo si el problema sigue
 * después de dos semanas sube a una persona. El de $5.000 tiene persona desde
 * el principio: es lo que compró.
 */
function quienAtiende(
  plan: EntradaCola['plan'],
  semanasIgual: number,
  esTecnico: boolean,
): QuienAtiende {
  if (esTecnico) return 'operador';
  const conPersona = plan === 'completo' || plan === 'negro';
  if (conPersona) return 'operador';
  return semanasIgual >= SEMANAS_ANTES_DE_ESCALAR ? 'operador' : 'la app';
}

/**
 * Arma la cola del día.
 *
 * Devuelve SOLO lo que necesita atención. Una cuenta sana no aparece: si
 * aparecieran todas, volvería a ser un tablero y habría que leerlo entero.
 */
export function armarCola(entradas: EntradaCola[]): ItemCola[] {
  const items: ItemCola[] = [];

  for (const e of entradas) {
    const id = e.sinCargar ? 'no_cargo' : e.domino.indicador?.id ?? null;
    // Una cuenta sin problema no entra en la cola.
    if (!id) continue;

    const plantilla = ACCIONES[id] ?? GENERICA;
    const esTecnico = id === 'comentario_a_conversacion' || id === 'no_cargo';
    const quien = quienAtiende(e.plan, e.semanasIgual, esTecnico);

    items.push({
      clienteId: e.clienteId,
      nombre: e.nombre,
      cuello: id,
      situacion: e.sinCargar
        ? 'No cargó los números de esta semana.'
        : `${e.domino.titulo}. ${e.domino.porque}`,
      accion: plantilla.accion,
      como: plantilla.como,
      quien,
      // Lo que factura por lo roto que está. Una cuenta sin cargar pesa como
      // si estuviera rota del todo: no saber es peor que saber que va mal.
      enRiesgo: Math.round(
        (e.facturado || 0) * Math.min(e.sinCargar ? 3 : e.urgencia, 5),
      ),
      semanasIgual: e.semanasIgual,
      yaSeIntento: e.semanasIgual >= 1 && quien === 'operador' && !esTecnico,
    });
  }

  return items.sort((a, b) => {
    // Primero lo que necesita una persona; la app se ocupa del resto sola.
    const pesoA = a.quien === 'la app' ? 0 : 1;
    const pesoB = b.quien === 'la app' ? 0 : 1;
    if (pesoA !== pesoB) return pesoB - pesoA;
    if (b.enRiesgo !== a.enRiesgo) return b.enRiesgo - a.enRiesgo;
    return b.semanasIgual - a.semanasIgual;
  });
}

export interface ResumenCola {
  /** Cuántas atiende una persona hoy. */
  paraPersona: number;
  /** Cuántas resuelve la app sola. */
  paraLaApp: number;
  /** Cuántas cuentas están sanas y no aparecen. */
  sanas: number;
  /** Dinero total en riesgo en la cola. */
  enRiesgo: number;
  /** La frase de arriba. */
  titular: string;
}

export function resumirCola(items: ItemCola[], totalCuentas: number): ResumenCola {
  const paraPersona = items.filter((i) => i.quien !== 'la app').length;
  const paraLaApp = items.length - paraPersona;
  const sanas = Math.max(0, totalCuentas - items.length);
  const enRiesgo = items.reduce((t, i) => t + i.enRiesgo, 0);

  let titular: string;
  if (totalCuentas === 0) titular = 'Todavía no hay cuentas cargadas.';
  else if (items.length === 0) titular = `Las ${totalCuentas} cuentas están sanas. Hoy no hay nada que atender.`;
  else if (paraPersona === 0) titular = paraLaApp === 1
    ? 'Un aviso sale solo. Ninguna cuenta necesita que entres hoy.'
    : `${paraLaApp} avisos salen solos. Ninguna cuenta necesita que entres hoy.`;
  else if (paraPersona === 1) titular = 'Hay una cuenta que necesita que entres hoy.';
  else titular = `Hay ${paraPersona} cuentas que necesitan que entres hoy.`;

  return { paraPersona, paraLaApp, sanas, enRiesgo, titular };
}


/**
 * Cuántas semanas SEGUIDAS lleva un cliente con el mismo cuello de botella.
 *
 * Es el número que decide si algo escala de la app a una persona. Vive acá y
 * no junto a las consultas a la base porque es lógica pura: así se puede
 * probar sin levantar medio sistema, y probarla importa — de este número
 * depende que Lupe atienda a quien lleva un mes trabado y no a quien tuvo
 * una mala semana.
 *
 * `cuellos` llega de la semana MÁS NUEVA a la más vieja.
 */
export function contarRacha(
  cuellos: Array<string | null>,
): { cuello: string | null; semanas: number } {
  const actual = cuellos[0];
  // Si esta semana está sana, no hay racha: da igual lo que pasó antes.
  if (!actual) return { cuello: null, semanas: 0 };
  let semanas = 0;
  for (const c of cuellos) {
    // El primer cambio corta: si el cuello se movió, el problema anterior se
    // resolvió (o se transformó en otro, que es información distinta).
    if (c !== actual) break;
    semanas++;
  }
  return { cuello: actual, semanas };
}


// ── El orden: quién se atiende primero ─────────────────────────────────────

/**
 * Cuánto pesa una cuenta en la lista.
 *
 * Vive acá y no junto a las consultas a la base porque ES LA DECISIÓN MÁS
 * IMPORTANTE DEL DÍA —a quién se atiende primero— y una decisión así no puede
 * estar sin probar. La regla que ya me mordió: la lógica que hay que probar
 * no vive en el archivo que habla con la base.
 *
 * Tres factores, en este orden de importancia:
 *
 *   1. **No cargó los números** → arriba de todo. Sin datos no se puede
 *      decidir NADA sobre esa cuenta, y eso es peor que saber que va mal.
 *   2. **Cuánto factura × qué tan rota está** → es dinero en riesgo, no
 *      gravedad. Una cuenta de $3.000 en amarillo pesa más que una de $200
 *      en rojo.
 *   3. **Cuántas semanas lleva igual** → tres semanas con el mismo problema
 *      pesa más que una: ya se le avisó y no alcanzó.
 */
export const PESO_SIN_DATOS = Number.MAX_SAFE_INTEGER;

/** La brecha se topea: una desviación de 20 veces no vale 20 veces más. */
export const TOPE_URGENCIA = 5;

export function pesoDeLaCuenta(x: {
  facturado: number;
  urgencia: number;
  semanasIgual: number;
  sinCargar: boolean;
}): number {
  if (x.sinCargar) return PESO_SIN_DATOS;
  // El `|| 1` evita que una cuenta que todavía no facturó quede en cero y
  // desaparezca de la lista: factura poco, pero existe.
  const base = (x.facturado || 1) * Math.min(Math.max(x.urgencia, 0), TOPE_URGENCIA);
  return Math.round(base * (1 + Math.max(0, x.semanasIgual) * 0.5));
}

/** Ordena de más urgente a menos. */
export function ordenarPorRiesgo<T extends {
  facturado: number; urgencia: number; semanasIgual: number; sinCargar: boolean;
}>(cuentas: T[]): T[] {
  return [...cuentas].sort((a, b) => pesoDeLaCuenta(b) - pesoDeLaCuenta(a));
}
