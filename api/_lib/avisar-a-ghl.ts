/**
 * AVISAR A GHL — los momentos en que el cliente tiene que recibir algo fuera
 * de la app, con el día real de cada uno adentro del aviso.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * La campanita de la app solo suena adentro de la app. Los avisos que
 * importan son justo para el que NO está adentro:
 *
 *   · lleva tres días hábiles sin avanzar
 *   · cerró el día 5, que es su primer resultado: precio nuevo y link de pago
 *   · entró en un paisaje nuevo del Camino
 *   · registró una venta
 *   · llegó al día 30 y al día 90, que es cuando su caso se documenta
 *   · cerró la semana sin cargar sus números
 *   · terminó los noventa días
 *
 * Los avisos salen por el Sistema, que es donde están el WhatsApp y el
 * correo. Esta función hace una sola cosa: golpear el webhook de entrada con
 * el evento, el contacto y su día. Lo que pasa después —a quién le escribe,
 * con qué texto, por qué canal— lo arma Javo en el flujo, no el código.
 *
 * ═══ POR QUÉ CADA AVISO LLEVA LOS CINCO DATOS ═══
 *
 * Porque el Sistema no sabe en qué día está nadie. Mandando solo el evento,
 * cada correo tiene que hablarle igual a todos: y el que está en el Lago no
 * puede recibir «empieza el Viento», ni el que vendió tres veces el mismo
 * pedido de testimonio que el que vendió hoy.
 *
 * Los cinco —día, paisaje, cinturón, último avance y ventas— son los que
 * acordamos con el Sistema el 18 de noviembre, y van DECLARADOS COMO
 * OBLIGATORIOS a propósito: opcionales, se llenan el primer día y después
 * nadie se acuerda, y llegan en null para siempre sin que nada se ponga rojo.
 * Obligatorios, el compilador no deja avisar sin ellos.
 *
 * ═══ POR QUÉ NO SE CAE NUNCA ═══
 *
 * Un aviso que falla no puede romper el cron que lo manda: el cron también
 * levanta las alarmas del equipo y arma la cola de excepciones, y perder eso
 * por un webhook caído es cambiar un problema chico por uno grande. Por eso
 * esta función no lanza: devuelve qué pasó y el cron sigue.
 *
 * ═══ Y POR QUÉ NO HACE NADA HASTA QUE JAVO LO PRENDA ═══
 *
 * Sin `GHL_AVISOS_WEBHOOK` en el entorno no sale ningún pedido. Así el código
 * puede estar arriba desde hoy sin mandarle nada a nadie, y el día que Javo
 * pegue la dirección del flujo empieza a andar sin tocar nada más.
 *
 * Configurar en GHL (Automatización → Workflow → disparador «Webhook de
 * entrada») y pegar esa dirección en Vercel como GHL_AVISOS_WEBHOOK. El
 * cuerpo que llega es:
 *
 *   { evento, email, nombre, dia, paisaje, cinturon, ultimo_avance,
 *     ventas_registradas, fecha }
 */

export type EventoDeAviso =
  | 'sin_entrar_3_dias'
  | 'dia_5_hecho'
  | 'camino_completo'
  | 'cambio_de_paisaje'
  | 'venta_registrada'
  | 'caso_dia_30'
  | 'caso_dia_90'
  | 'numeros_sin_cargar';

/** Qué es cada evento, para que el flujo de GHL se arme sin adivinar. */
export const EVENTOS: Record<EventoDeAviso, string> = {
  sin_entrar_3_dias: 'Lleva tres días hábiles sin avanzar en su Camino.',
  dia_5_hecho: 'Cerró el día 5: precio nuevo sellado y link de pago creado.',
  camino_completo: 'Terminó los noventa días.',
  cambio_de_paisaje: 'Entró en un paisaje nuevo del Camino (el dato «paisaje» dice cuál).',
  venta_registrada: 'Registró una venta («ventas_registradas» dice cuántas lleva).',
  caso_dia_30: 'Llegó al día 30: su caso se documenta, con antes y después.',
  caso_dia_90: 'Llegó al día 90: su caso se cierra y puede volverse testimonio.',
  numeros_sin_cargar: 'Cerró la semana sin cargar sus números.',
};

/**
 * EL DÍA REAL DEL CLIENTE — los cinco datos que viajan en cada aviso.
 *
 * Ninguno es opcional. Ver arriba: es lo único que evita que se queden en
 * null sin que nada se ponga rojo.
 */
export interface ElDiaDelCliente {
  /** El día de programa en que está, por calendario. */
  dia: number;
  /** El paisaje del paso que le toca: Lago, Montaña, Viento, Río o Bosque. */
  paisaje: string | null;
  /** Su cinturón, como lo guarda la app. */
  cinturon: string | null;
  /** El día en que avanzó por última vez (ISO), o null si todavía no avanzó. */
  ultimo_avance: string | null;
  /** Cuántas ventas lleva registradas. */
  ventas_registradas: number;
}

export interface ContactoDelAviso extends ElDiaDelCliente {
  email: string;
  nombre: string;
}

export type ResultadoDelAviso = 'enviado' | 'sin-webhook' | 'sin-email' | 'falló';

export async function avisarAGHL(
  evento: EventoDeAviso,
  contacto: ContactoDelAviso,
): Promise<ResultadoDelAviso> {
  const url = process.env.GHL_AVISOS_WEBHOOK;
  if (!url) return 'sin-webhook';
  if (!contacto.email) return 'sin-email';
  /*
   * CON RELOJ. Los pedidos salen uno detrás de otro, cliente por cliente,
   * dentro de un cron que tiene su propio límite de tiempo. Un Sistema lento
   * —no caído: lento— se come ese límite y mata de paso los avisos del equipo
   * y las entregas, que corren después. Ocho segundos y se sigue.
   */
  const reloj = AbortSignal.timeout(8000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      signal: reloj,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        evento,
        email: contacto.email,
        nombre: contacto.nombre,
        dia: contacto.dia,
        paisaje: contacto.paisaje,
        cinturon: contacto.cinturon,
        ultimo_avance: contacto.ultimo_avance,
        ventas_registradas: contacto.ventas_registradas,
        fecha: new Date().toISOString(),
      }),
    });
    return r.ok ? 'enviado' : 'falló';
  } catch {
    return 'falló';
  }
}
