import type { ItemCola } from './colaExcepciones';

/**
 * LOS AVISOS — la app empuja, la persona solo atiende lo que la app no pudo.
 *
 * El sistema de notificaciones ya existía completo (crearNotificacion y una
 * docena de helpers), pero NADIE LO DISPARABA desde el estado real de la
 * cuenta. Un cliente podía pasar tres semanas sin publicar y la app no le
 * decía nada: el aviso salía cuando una persona se acordaba de mirar.
 *
 * Acá se decide, sin preguntarle a nadie, qué aviso le corresponde a cada
 * cliente y cuándo deja de alcanzar con avisar.
 *
 * La regla de fondo: si el mismo aviso ya salió dos veces y el problema
 * sigue, el aviso no está funcionando. Insistir una tercera vez es ruido —
 * ahí entra una persona.
 */

export interface Aviso {
  clienteId: string;
  /** Para no mandar el mismo dos veces en la misma semana. */
  clave: string;
  titulo: string;
  descripcion: string;
  /** A dónde lo lleva el aviso dentro de la app. */
  destino: string;
  /** Cuántas veces ya se le mandó este mismo aviso. */
  vecesEnviado: number;
}

/** Después de tantos avisos iguales sin resultado, el aviso ya no alcanza. */
export const AVISOS_ANTES_DE_ESCALAR = 2;

/**
 * Qué aviso corresponde a cada cuello de botella.
 *
 * Escritos para el cliente, no para el equipo: la misma situación que en la
 * cola le dice a Lupe «revisar el DM con él» acá le dice a él «tus mensajes
 * se están enfriando». Es el mismo hecho contado desde su lado.
 */
const AVISOS: Record<string, { titulo: string; descripcion: string; destino: string }> = {
  no_cargo: {
    titulo: 'Faltan tus números de esta semana',
    descripcion: 'Son cinco datos y dos minutos. Sin ellos tu tablero no puede decirte nada.',
    destino: '/campanas',
  },
  costo_conversacion: {
    titulo: 'Tus anuncios están trayendo poca gente',
    descripcion: 'Entra al Constructor: la app ya tiene elegidas las tres fórmulas que te convienen ahora.',
    destino: '/campanas',
  },
  comentario_a_conversacion: {
    titulo: 'Comentan y no les llega tu mensaje',
    descripcion: 'La automatización se cortó. Ya avisamos al equipo técnico; no toques el anuncio.',
    destino: '/campanas',
  },
  conv_a_agenda: {
    titulo: 'Conversas mucho y agendas poco',
    descripcion: 'El anuncio trae gente y el mensaje la pierde. Habla con Sofi, tu entrenadora de DM.',
    destino: '/agentes',
  },
  show_rate: {
    titulo: 'Agendan y no se presentan',
    descripcion: 'Escríbeles el mismo día que agendan y ofrece horarios de esta semana, no de la que viene.',
    destino: '/campanas',
  },
  offer_rate: {
    titulo: 'Llegas a la llamada y no dices el precio',
    descripcion: 'Practica con Lucas, tu entrenador de llamada, antes de la próxima.',
    destino: '/agentes',
  },
  close_rate: {
    titulo: 'Tomas llamadas y todavía no cierras',
    descripcion: 'Lucas puede escuchar una contigo y decirte dónde se cae.',
    destino: '/agentes',
  },
  cpm: {
    titulo: 'Te está costando caro que te vean',
    descripcion: 'Para tu mercado, el costo de aparecer está alto. No es el presupuesto: es el primer segundo del anuncio. Genera tres piezas con otro gancho.',
    destino: '/campanas',
  },
  frecuencia: {
    titulo: 'Tu público ya vio el anuncio demasiadas veces',
    descripcion: 'Lo vieron más de tres veces esta semana: se agotó. No es que el creativo dejó de servir — el público es muy chico. Amplía la edad o suma otro país.',
    destino: '/campanas',
  },
  costo_agenda: {
    titulo: 'Cada agenda te está saliendo cara',
    descripcion: 'El anuncio trae gente, pero no la que reserva. Revisa a quién le hablas en el gancho, no el presupuesto.',
    destino: '/campanas',
  },
  mensajes: {
    titulo: 'Esta semana no prospectaste a mano',
    descripcion: 'La pauta no es lo único: escríbele a diez personas que ya te siguen. En orgánico se proyecta actividad, no gasto.',
    destino: '/campanas',
  },
  retencion: {
    titulo: 'Se te terminan clientes y ninguno renovó',
    descripcion: 'Habla con ellos antes de que termine el programa, no después. Después ya decidieron.',
    destino: '/miclinica',
  },
  cac: {
    titulo: 'Conseguir un cliente te está costando demasiado',
    descripcion: 'Con esos números, o sube el precio o cambia la oferta. Vera te ayuda con eso.',
    destino: '/agentes',
  },
  pct_cobrado: {
    titulo: 'Vendes pero cobras poco por adelantado',
    descripcion: 'Ofrece el pago completo primero. Las cuotas, solo si te dice que no.',
    destino: '/campanas',
  },
  roi_cash: {
    titulo: 'Estás invirtiendo más de lo que entra',
    descripcion: 'Baja el presupuesto unos días hasta que la cuenta se acomode.',
    destino: '/campanas',
  },
  gasto_ratio: {
    titulo: 'Todo está sano. Lo único que falta es volumen',
    descripcion: 'Tus números dan bien: es momento de subir el presupuesto diario.',
    destino: '/campanas',
  },
  piezas: {
    titulo: 'Se te está terminando el banco de piezas',
    descripcion: 'Elige un día de esta semana para grabar. Con guion cerrado, nunca improvisando.',
    destino: '/creador',
  },
  cobro_cuotas: {
    titulo: 'Tienes cuotas sin cobrar',
    descripcion: 'Es dinero que ya vendiste y se está perdiendo. Escríbeles hoy.',
    destino: '/metricas',
  },
  casos_exito: {
    titulo: 'Pide el testimonio a los que ya terminaron',
    descripcion: 'Un video corto de ellos es lo que va a vender al próximo.',
    destino: '/campanas',
  },
  referidos: {
    titulo: 'Todavía no te llegó ningún referido',
    descripcion: 'Pídelo en vivo, al final de la llamada. Por escrito casi nunca sale.',
    destino: '/campanas',
  },
};

export interface HistorialAvisos {
  /** Cuántas veces se mandó cada aviso a cada cliente: 'clienteId|clave' → n. */
  enviados: Record<string, number>;
  /** La última semana en que se mandó: 'clienteId|clave' → '2026-W31'. */
  ultimaSemana: Record<string, string>;
}

export const HISTORIAL_VACIO: HistorialAvisos = { enviados: {}, ultimaSemana: {} };

export interface PlanDeAvisos {
  /** Los que la app manda ahora. */
  aMandar: Aviso[];
  /** Los que ya no alcanzan: el aviso salió y el problema sigue. */
  aEscalar: Aviso[];
  /** Los que se saltean porque ya salieron esta semana. */
  repetidos: number;
}

/**
 * Decide qué avisos salen hoy.
 *
 * Tres reglas, en orden:
 *  1. Si el mismo aviso ya salió ESTA semana, no se repite. Un aviso diario
 *     por el mismo motivo deja de leerse al segundo día.
 *  2. Si ya salió AVISOS_ANTES_DE_ESCALAR veces y el problema sigue, el
 *     aviso no está funcionando: pasa a una persona en vez de insistir.
 *  3. Lo que la cola ya marcó para una persona no se avisa: sería decirle al
 *     cliente que se ocupe de algo de lo que ya se está ocupando alguien.
 */
export function planificarAvisos(
  items: ItemCola[],
  historial: HistorialAvisos,
  semana: string,
): PlanDeAvisos {
  const aMandar: Aviso[] = [];
  const aEscalar: Aviso[] = [];
  let repetidos = 0;

  for (const item of items) {
    // La cola ya decidió que esto lo atiende una persona.
    if (item.quien !== 'la app') continue;

    const clave = item.cuello;
    const plantilla = AVISOS[clave];
    // Un cuello sin aviso escrito no se inventa: se saltea y queda en la cola.
    if (!plantilla) continue;

    const id = `${item.clienteId}|${clave}`;
    const veces = historial.enviados[id] ?? 0;

    if (historial.ultimaSemana[id] === semana) { repetidos++; continue; }

    const aviso: Aviso = {
      clienteId: item.clienteId,
      clave,
      titulo: plantilla.titulo,
      descripcion: plantilla.descripcion,
      destino: plantilla.destino,
      vecesEnviado: veces,
    };

    if (veces >= AVISOS_ANTES_DE_ESCALAR) aEscalar.push(aviso);
    else aMandar.push(aviso);
  }

  return { aMandar, aEscalar, repetidos };
}

/** Anota que un aviso salió, para no repetirlo. */
export function anotarEnviado(
  historial: HistorialAvisos,
  aviso: Aviso,
  semana: string,
): HistorialAvisos {
  const id = `${aviso.clienteId}|${aviso.clave}`;
  return {
    enviados: { ...historial.enviados, [id]: (historial.enviados[id] ?? 0) + 1 },
    ultimaSemana: { ...historial.ultimaSemana, [id]: semana },
  };
}

/** Cuando el problema se resuelve, el contador vuelve a cero. */
export function olvidarAviso(
  historial: HistorialAvisos,
  clienteId: string,
  clave: string,
): HistorialAvisos {
  const id = `${clienteId}|${clave}`;
  const enviados = { ...historial.enviados };
  const ultimaSemana = { ...historial.ultimaSemana };
  delete enviados[id];
  delete ultimaSemana[id];
  return { enviados, ultimaSemana };
}

// ── El camino de vuelta ────────────────────────────────────────────────────

/**
 * Manda un aviso al cliente DENTRO de la app.
 *
 * Hasta ahora todo lo que decidía el equipo viajaba por WhatsApp: se mezclaba
 * con la conversación personal, se perdía entre mensajes, y a la semana
 * siguiente nadie podía decir si se le había avisado o no. Un aviso adentro
 * de la app queda, se puede ver si lo leyó, y aterriza en la pantalla donde
 * se resuelve.
 *
 * Nunca lanza: si el aviso no sale, el trabajo de la persona no se pierde —
 * lo peor que puede pasar es que además tenga que escribirle por otro lado.
 */
export async function mandarAviso(
  aviso: Aviso,
  crear: (input: {
    usuario_id: string; tipo: 'sistema' | 'admin' | 'mensaje';
    titulo: string; descripcion?: string; accion_url?: string;
  }) => Promise<void>,
): Promise<boolean> {
  try {
    await crear({
      usuario_id: aviso.clienteId,
      tipo: 'sistema',
      titulo: aviso.titulo,
      descripcion: aviso.descripcion,
      accion_url: aviso.destino,
    });
    return true;
  } catch (err) {
    console.warn('[avisos] no se pudo mandar:', err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Lo que una persona le escribe al cliente, dentro de la app.
 *
 * Es el mismo canal que los avisos automáticos a propósito: para el cliente,
 * que le escriba la app o que le escriba Lupe no debería sentirse como dos
 * sistemas distintos. Lo que cambia es quién lo firma.
 */
export async function mandarMensajeDelEquipo(
  clienteId: string,
  deQuien: string,
  texto: string,
  destino: string,
  crear: (input: {
    usuario_id: string; tipo: 'sistema' | 'admin' | 'mensaje';
    titulo: string; descripcion?: string; accion_url?: string;
  }) => Promise<void>,
): Promise<boolean> {
  const limpio = texto.trim();
  if (!limpio) return false;
  try {
    await crear({
      usuario_id: clienteId,
      tipo: 'admin',
      titulo: `${deQuien} te dejó una nota`,
      descripcion: limpio.slice(0, 300),
      accion_url: destino,
    });
    return true;
  } catch (err) {
    console.warn('[avisos] no se pudo mandar la nota:', err instanceof Error ? err.message : err);
    return false;
  }
}
