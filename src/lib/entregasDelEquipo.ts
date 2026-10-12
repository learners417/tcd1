/**
 * LAS ENTREGAS DEL EQUIPO.
 *
 * ═══ QUÉ ESTABA ROTO ═══
 *
 * El plan del Camino tiene tres momentos en que el equipo entrega algo
 * técnico: el alta del día 0, los sitios y formularios del día 11, y las
 * automatizaciones del día 29. Están escritos en el seed, en el campo
 * `acceso`, y tipados en el código.
 *
 * Y ninguna pantalla los leía. O sea que el cliente llegaba al día 11 sin
 * saber que le tocaba una entrega, y Lupe sin saber que tenía que hacerla.
 * Las tres aparecían cuando alguien se acordaba, o cuando el cliente preguntaba
 * por WhatsApp — que es justamente lo que la app vino a terminar.
 *
 * ═══ POR QUÉ ACÁ Y NO EN EL SEED ═══
 *
 * En el seed está el rótulo. Acá está lo que hace falta para que ocurra: qué
 * entrega exactamente, qué tiene que poder hacer el cliente cuando termine, y
 * cuánto tarda. Un rótulo no se puede repartir como tarea.
 *
 * Lógica pura: se prueba sola, y la usan el cron y el Admin.
 */

export interface EntregaDelEquipo {
  /** El día del Camino en que corresponde. */
  dia: number;
  /** Cómo se llama en el plan. */
  nombre: string;
  /** Lo que el equipo instala, en la lista de Lupe. */
  queSeEntrega: string[];
  /** Qué va a poder hacer el cliente cuando esté. En su idioma, no en el técnico. */
  queDesbloquea: string;
  /** Minutos de trabajo del equipo. Para repartir la semana. */
  minutos: number;
}

export const ENTREGAS: EntregaDelEquipo[] = [
  {
    dia: 0,
    nombre: 'Entrega 1 — el alta',
    queSeEntrega: [
      'Alta en la app con su fecha de inicio',
      'Alta en MiClínica Digital',
      'Llamada de bienvenida agendada',
      'Escalón de servicio marcado en su ficha',
    ],
    queDesbloquea: 'Entrar a la app y empezar su primera sesión.',
    minutos: 20,
  },
  {
    dia: 11,
    nombre: 'Entrega 2 — sitios, formularios y contactos',
    queSeEntrega: [
      'Su página de venta publicada con su dominio',
      'El formulario de agenda, conectado al calendario',
      'La lista de contactos creada y etiquetada',
      'El enlace de pago, probado con una compra de prueba',
    ],
    queDesbloquea: 'Publicar su perfil y su página, y empezar a recibir agendas.',
    minutos: 90,
  },
  {
    dia: 29,
    nombre: 'Entrega 3 — conversaciones, automatizaciones y reportes',
    queSeEntrega: [
      'WhatsApp conectado con su número nuevo',
      'El mensaje automático, probado de punta a punta',
      'El píxel de Meta midiendo en su página',
      'El reporte semanal armado y enviándose',
    ],
    queDesbloquea: 'Montar su campaña en Meta y medir lo que trae.',
    minutos: 120,
  },
];

export function entregaDelDia(dia: number): EntregaDelEquipo | null {
  return ENTREGAS.find((e) => e.dia === dia) ?? null;
}

/**
 * La entrega que le toca a un cliente que va por el día `diaDeTrabajo`.
 *
 * Se mira el día del TRABAJO y no el del calendario: la entrega existe para
 * desbloquear la sesión que viene, así que llega cuando el cliente llega, no
 * cuando el almanaque dice que debería haber llegado. Entregarle los
 * formularios a alguien que todavía no escribió su oferta es trabajo que se
 * hace dos veces.
 */
export function entregaPendiente(
  diaDeTrabajo: number,
  yaEntregadas: number[],
): EntregaDelEquipo | null {
  for (const e of ENTREGAS) {
    if (diaDeTrabajo >= e.dia && !yaEntregadas.includes(e.dia)) return e;
  }
  return null;
}

/** Lo que se le dice al cliente. En su idioma: qué recibe y qué va a poder hacer. */
export function avisoAlCliente(e: EntregaDelEquipo): { titulo: string; descripcion: string } {
  return {
    titulo: `${e.nombre.split('—')[0].trim()}: el equipo te está montando esto`,
    descripcion: `${e.queSeEntrega.slice(0, 3).join(', ')}. Cuando esté, vas a poder ${e.queDesbloquea.toLowerCase()}`,
  };
}

/** Lo que ve el equipo en su lista. Ejecutable tal cual, sin interpretar. */
export function tareaDelEquipo(e: EntregaDelEquipo, nombre: string): {
  titulo: string; descripcion: string; minutos: number;
} {
  return {
    titulo: `${nombre} — ${e.nombre}`,
    descripcion: `${e.queSeEntrega.join(' · ')}. Con esto puede ${e.queDesbloquea.toLowerCase()}`,
    minutos: e.minutos,
  };
}
