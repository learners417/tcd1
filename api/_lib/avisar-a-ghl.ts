/**
 * AVISAR A GHL — los tres momentos en que el cliente tiene que recibir algo
 * fuera de la app.
 *
 * ═══ QUÉ RESUELVE ═══
 *
 * La campanita de la app solo suena adentro de la app. Los tres avisos que
 * importan son justo para el que NO está adentro:
 *
 *   · lleva tres días hábiles sin avanzar
 *   · cerró el día 5, que es su primer resultado: precio nuevo y link de pago
 *   · terminó los noventa días
 *
 * Los tres salen por el Sistema, que es donde están el WhatsApp y el correo.
 * Esta función hace una sola cosa: golpear el webhook de entrada con el
 * evento y el contacto. Lo que pasa después —a quién le escribe, con qué
 * texto, por qué canal— lo arma Javo en el flujo, no el código.
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
 *   { evento, email, nombre, dia, fecha }
 *   evento = sin_entrar_3_dias | dia_5_hecho | camino_completo
 */

export type EventoDeAviso = 'sin_entrar_3_dias' | 'dia_5_hecho' | 'camino_completo';

/** Qué es cada evento, para que el flujo de GHL se arme sin adivinar. */
export const EVENTOS: Record<EventoDeAviso, string> = {
  sin_entrar_3_dias: 'Lleva tres días hábiles sin avanzar en su Camino.',
  dia_5_hecho: 'Cerró el día 5: precio nuevo sellado y link de pago creado.',
  camino_completo: 'Terminó los noventa días.',
};

export interface ContactoDelAviso {
  email: string;
  nombre: string;
  /** El día de programa en que está. */
  dia: number;
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
        fecha: new Date().toISOString(),
      }),
    });
    return r.ok ? 'enviado' : 'falló';
  } catch {
    return 'falló';
  }
}
