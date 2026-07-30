/**
 * EL SOPORTE — el compromiso, el reloj y lo que está roto.
 *
 * ═══ LOS TRES HUECOS QUE CIERRA ═══
 *
 * El circuito de soporte ya funcionaba de punta a punta: el cliente escribe,
 * el equipo ve, responde, y el cliente recibe el aviso en tiempo real. Lo que
 * faltaba era lo que lo vuelve **confiable**:
 *
 *   1. **Si nadie responde, nada lo señalaba.** Un mensaje podía quedar tres
 *      días sin respuesta sin aparecer en la cola, ni en la supervisión, ni en
 *      el marcador. En un producto de miles, tres días de silencio es la
 *      diferencia entre un cliente y un reembolso.
 *   2. **No había ningún compromiso de tiempo**, ni dicho al cliente ni medido
 *      internamente. Un número que se puede fallar es mejor que ninguno.
 *   3. **No había forma de decir «esto se rompió».** Una duda y un error son
 *      dos cosas distintas: una espera, la otra no.
 */

export type TipoDeMensaje = 'duda' | 'roto';

export interface CompromisoDeRespuesta {
  tipo: TipoDeMensaje;
  /** Horas para la primera respuesta. */
  horas: number;
  /** Lo que se le dice al cliente al escribir. */
  loQueSeDice: string;
  /** A qué función va. */
  vaA: 'destrabar' | 'absorber';
}

/**
 * Lo que prometemos, por tipo.
 *
 * Son distintos a propósito: **una duda puede esperar un día; algo roto le
 * está costando dinero ahora.** Prometer lo mismo para los dos significa o
 * bien prometer de más para las dudas, o de menos para los errores.
 */
export const COMPROMISO: Record<TipoDeMensaje, CompromisoDeRespuesta> = {
  duda: {
    tipo: 'duda', horas: 24, vaA: 'destrabar',
    loQueSeDice: 'Te respondemos en menos de 24 horas hábiles.',
  },
  roto: {
    tipo: 'roto', horas: 4, vaA: 'absorber',
    loQueSeDice: 'Si algo se rompió lo miramos hoy. Contanos qué estabas haciendo cuando pasó.',
  },
};

export interface MensajeSinResponder {
  id: string;
  clienteId: string;
  nombre: string;
  tipo: TipoDeMensaje;
  texto: string;
  desde: string;
  /** Horas que lleva esperando. */
  horas: number;
  /** true = ya se pasó del compromiso. */
  vencido: boolean;
  /** La frase para la cola. */
  lectura: string;
  /** Cuánto pesa en el orden: lo vencido va primero. */
  peso: number;
}

/**
 * Los mensajes que esperan respuesta, ordenados.
 *
 * **Lo vencido va primero, y dentro de lo vencido, lo que más esperó.** No se
 * ordena por ticket a propósito: alguien que pagó menos y lleva tres días
 * esperando está más cerca de irse que alguien que pagó más y escribió hoy.
 */
export function mensajesQueEsperan(
  mensajes: Array<{
    id: string; clienteId: string; nombre: string;
    tipo?: TipoDeMensaje; texto: string; creadoEn: string; respondido: boolean;
  }>,
  ahora = Date.now(),
): MensajeSinResponder[] {
  return mensajes
    .filter((m) => !m.respondido)
    .map((m) => {
      const tipo = m.tipo ?? 'duda';
      const c = COMPROMISO[tipo];
      const desde = new Date(m.creadoEn).getTime();
      const horas = Number.isFinite(desde)
        ? Math.max(0, Math.floor((ahora - desde) / 3600000))
        : 0;
      const vencido = horas >= c.horas;

      let lectura: string;
      if (tipo === 'roto') {
        lectura = vencido
          ? `Reportó que algo no funciona hace ${horas} horas y prometimos mirarlo en ${c.horas}. Esto no es una duda: le está costando dinero ahora.`
          : `Reportó que algo no funciona. Va al dev, no a acompañamiento.`;
      } else if (vencido) {
        lectura = `Escribió hace ${horas} horas y prometimos responder en ${c.horas}. Cada hora de más acá vale por tres en cualquier otra cosa.`;
      } else {
        lectura = `Escribió hace ${horas} ${horas === 1 ? 'hora' : 'horas'}.`;
      }

      return {
        id: m.id, clienteId: m.clienteId, nombre: m.nombre, tipo,
        texto: m.texto, desde: m.creadoEn, horas, vencido, lectura,
        // Lo vencido pesa muchísimo más, y lo roto más que la duda.
        peso: (vencido ? 10_000 : 0) + (tipo === 'roto' ? 5_000 : 0) + horas,
      };
    })
    .sort((a, b) => b.peso - a.peso);
}

export interface SaludDelSoporte {
  esperando: number;
  vencidos: number;
  /** Horas que lleva esperando el más viejo. */
  masViejo: number;
  /** El porcentaje respondido dentro del compromiso. */
  pctATiempo: number;
  titular: string;
  alerta: boolean;
}

/**
 * Cómo viene el soporte, para el marcador de la semana.
 *
 * El número que importa no es cuántos mensajes hubo: es **qué porcentaje se
 * respondió dentro de lo que prometimos.** Uno se puede fallar; una tendencia
 * no.
 */
export function saludDelSoporte(x: {
  esperando: MensajeSinResponder[];
  respondidosATiempo: number;
  respondidosTarde: number;
}): SaludDelSoporte {
  const vencidos = x.esperando.filter((m) => m.vencido);
  const masViejo = x.esperando.reduce((t, m) => Math.max(t, m.horas), 0);
  const total = x.respondidosATiempo + x.respondidosTarde;
  const pct = total > 0 ? Math.round((x.respondidosATiempo / total) * 100) : 100;

  let titular: string;
  let alerta = false;

  if (vencidos.length > 0) {
    const roto = vencidos.filter((m) => m.tipo === 'roto').length;
    titular = roto > 0
      ? `${roto === 1 ? 'Hay un error reportado' : `Hay ${roto} errores reportados`} sin mirar, fuera de lo que prometimos.`
      : `${vencidos.length} ${vencidos.length === 1 ? 'mensaje lleva' : 'mensajes llevan'} más de lo que prometimos. El más viejo, ${masViejo} horas.`;
    alerta = true;
  } else if (x.esperando.length > 0) {
    titular = `${x.esperando.length} ${x.esperando.length === 1 ? 'mensaje esperando' : 'mensajes esperando'}, todos dentro de tiempo.`;
  } else if (total === 0) {
    titular = 'Nadie escribió esta semana.';
  } else {
    titular = `Todo respondido. ${pct}% dentro de lo prometido.`;
  }

  // Un porcentaje bajo con la bandeja vacía igual es una alarma: significa que
  // se responde tarde y después se pone al día, que el cliente ya sintió.
  if (total >= 3 && pct < 80) alerta = true;

  return {
    esperando: x.esperando.length, vencidos: vencidos.length,
    masViejo, pctATiempo: pct, titular, alerta,
  };
}
