/**
 * LA SALA DE MANDO — el modelo.
 *
 * No es un tablero: es una máquina que se instala sola, con un equipo
 * atendiendo excepciones. Todo lo que hay acá existe para contestar una sola
 * pregunta cada mañana: **qué está frenado y quién lo destraba**.
 *
 * Lee de lo que ya existe (profiles, admin_tareas, campanas, la Mesa de
 * plata) y solo guarda lo que ninguna otra tabla guarda: en qué etapa está
 * cada cliente, qué se decidió y cuándo, y cómo va el motor de Javo.
 */

// ── Las nueve etapas del recorrido ─────────────────────────────────────────

export interface Etapa {
  numero: number;
  nombre: string;
  /** Cuántos días dura, para calcular si un cliente está atrasado. */
  diasMin: number;
  diasMax: number;
  dueno: string;
  /** Qué tiene que estar cumplido para salir. Nadie avanza sin esto. */
  criterioSalida: string;
}

export const ETAPAS: Etapa[] = [
  { numero: 0, nombre: 'Bienvenida', diasMin: 1, diasMax: 3, dueno: 'Lupe',
    criterioSalida: 'Número nuevo de WhatsApp · número de respaldo comprado · acceso a la app · entró al Camino' },
  { numero: 1, nombre: 'Método y oferta', diasMin: 4, diasMax: 14, dueno: 'Javo + cliente',
    criterioSalida: 'Método con nombre cerrado · las tres armas con precio' },
  { numero: 2, nombre: 'Activos', diasMin: 10, diasMax: 21, dueno: 'Agencia',
    criterioSalida: 'Perfil optimizado · landing con dominio y píxel · links de pago · carrusel de bienvenida' },
  { numero: 3, nombre: 'Conexiones', diasMin: 18, diasMax: 25, dueno: 'Marcos',
    criterioSalida: 'WhatsApp Business vinculado a Meta · portafolio y fan page · calendario conectado' },
  { numero: 4, nombre: 'Prueba de cadena', diasMin: 2, diasMax: 2, dueno: 'Marcos + Javo',
    criterioSalida: 'Comentario → mensaje → link → checkout → COBRO DE PRUEBA, completo y verificado' },
  { numero: 5, nombre: 'Activación', diasMin: 0, diasMax: 0, dueno: 'Javo',
    criterioSalida: 'Campañas prendidas · tres historias diarias · guiones de setting y de llamada' },
  { numero: 6, nombre: 'Primeras ventas', diasMin: 1, diasMax: 30, dueno: 'Cliente, con Lupe encima',
    criterioSalida: 'Primera llamada tomada · primer pago cobrado' },
  // diasMax en 0 = SIN TOPE, a propósito. "Ritmo propio" es el destino del
  // recorrido, no una etapa que haya que atravesar: un cliente que lleva
  // doscientos días publicando y cerrando solo no está atrasado, está donde
  // queremos que esté. Marcarlo en rojo lo pondría arriba de la cola y taparía
  // a los que sí están frenados.
  { numero: 7, nombre: 'Ritmo propio', diasMin: 30, diasMax: 0, dueno: 'Cliente',
    criterioSalida: 'Publica, agenda y cierra solo durante tres semanas seguidas' },
  { numero: 8, nombre: 'Cliente satisfecho', diasMin: 0, diasMax: 0, dueno: 'Lupe',
    criterioSalida: 'Testimonio grabado · caso de éxito documentado · salida ordenada' },
];

/**
 * De la etapa 4 no se sale sin el cobro de prueba.
 *
 * Es la única regla dura del recorrido, y existe porque encender una campaña
 * con la cadena sin probar es tirar el presupuesto: la gente comenta, no le
 * llega el mensaje, y el cliente descubre el problema con la pauta corriendo.
 */
export const ETAPA_CON_CANDADO = 4;

/** Todo cliente nuevo tiene que llegar a la activación en 21 días desde la venta. */
export const DIAS_HASTA_ACTIVACION = 21;

export interface ClienteEnRecorrido {
  id: string;
  nombre: string;
  etapa: number;
  /** Desde cuándo está en esta etapa. */
  etapaDesde: string | null;
  fechaVenta: string | null;
  /** Días en la etapa actual. */
  diasEnEtapa: number;
  /** Días desde la venta. */
  diasDesdeVenta: number | null;
  /** true = lleva más de lo que la etapa debería durar. */
  atrasado: boolean;
  /** true = pasó los 21 días y todavía no activó. */
  fueraDeVentana: boolean;
  /** Lo que falta para poder avanzar. */
  criterioSalida: string;
  dueno: string;
}

const dias = (desde: string | null): number => {
  if (!desde) return 0;
  const d = new Date(desde).getTime();
  if (!Number.isFinite(d)) return 0;
  return Math.max(0, Math.floor((Date.now() - d) / 86400000));
};

/** Arma el recorrido a partir de los clientes. */
export function armarRecorrido(
  clientes: Array<{
    id: string; nombre: string;
    etapa_actual?: number | null;
    etapa_desde?: string | null;
    fecha_venta?: string | null;
  }>,
): ClienteEnRecorrido[] {
  return clientes.map((c) => {
    const numero = typeof c.etapa_actual === 'number' ? c.etapa_actual : 0;
    const etapa = ETAPAS[numero] ?? ETAPAS[0];
    const diasEnEtapa = dias(c.etapa_desde ?? null);
    const diasDesdeVenta = c.fecha_venta ? dias(c.fecha_venta) : null;

    return {
      id: c.id,
      nombre: c.nombre,
      etapa: numero,
      etapaDesde: c.etapa_desde ?? null,
      fechaVenta: c.fecha_venta ?? null,
      diasEnEtapa,
      diasDesdeVenta,
      // La etapa 5 dura un día y las 6-8 no tienen tope: no se marcan atrasadas.
      atrasado: etapa.diasMax > 0 && diasEnEtapa > etapa.diasMax,
      fueraDeVentana:
        numero < 5 && diasDesdeVenta !== null && diasDesdeVenta > DIAS_HASTA_ACTIVACION,
      criterioSalida: etapa.criterioSalida,
      dueno: etapa.dueno,
    };
  });
}

// ── Las decisiones ─────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  titulo: string;
  criterio: string | null;
  contexto: string | null;
  decidida_en: string;
  vigente: boolean;
  cliente_id: string | null;
}

// ── El motor de Javo ───────────────────────────────────────────────────────

export interface EstadoMotor {
  /** Lo cobrado, contra el objetivo. */
  cobrado: number;
  objetivo: number;
  /** El pipeline de sus propias ventas. */
  conversaciones: number;
  calificados: number;
  agendas: number;
  llamadasTomadas: number;
  cerradas: number;
  /** Su pauta. */
  gastoPauta: number;
  /** Días de pauta sin una sola agenda. */
  diasSinAgenda: number;
}

/** Si a los siete días de pauta no hay agendas, se corta. */
export const DIAS_PAUTA_SIN_AGENDA = 7;

/** Cuánto vuelve a pauta de cada venta, y su tope. */
export const REINVERSION_POR_VENTA = 1000;
export const TOPE_REINVERSION = 3000;

export interface VeredictoMotor {
  /** La única frase de arriba. */
  titular: string;
  /** Qué hacer, si hay algo. */
  accion?: string;
  /** true = hay que cortar la pauta. */
  cortar: boolean;
  faltaParaObjetivo: number;
  /** Cuánto puede reinvertir con lo cerrado. */
  reinversionDisponible: number;
}

/**
 * El veredicto del motor propio.
 *
 * La regla del freno es la que importa: siete días de pauta sin una sola
 * agenda no es mala suerte, es que el anuncio no funciona. Seguir gastando
 * ahí es la forma más cara de averiguar lo mismo.
 */
export function veredictoMotor(e: EstadoMotor): VeredictoMotor {
  const falta = Math.max(0, e.objetivo - e.cobrado);
  const reinversion = Math.min(e.cerradas * REINVERSION_POR_VENTA, TOPE_REINVERSION);

  if (e.diasSinAgenda >= DIAS_PAUTA_SIN_AGENDA) {
    return {
      titular: `${e.diasSinAgenda} días de pauta sin una sola agenda.`,
      accion: 'Corta la pauta hoy. El problema es el anuncio, y seguir gastando es la forma más cara de averiguar lo mismo.',
      cortar: true, faltaParaObjetivo: falta, reinversionDisponible: reinversion,
    };
  }

  if (falta === 0) {
    return {
      titular: 'Objetivo cumplido.',
      cortar: false, faltaParaObjetivo: 0, reinversionDisponible: reinversion,
    };
  }

  // El cuello se busca en el mismo orden que la cadena: de arriba hacia abajo.
  if (e.conversaciones === 0) {
    return {
      titular: `Faltan $${falta.toLocaleString()} y todavía no hay conversaciones.`,
      accion: 'Nada más importa hasta que entren conversaciones. Publica y prospecta.',
      cortar: false, faltaParaObjetivo: falta, reinversionDisponible: reinversion,
    };
  }
  if (e.agendas === 0) {
    return {
      titular: `${e.conversaciones} conversaciones y ninguna agenda.`,
      accion: 'El problema está en el mensaje, no en el anuncio. Revisa tres conversaciones completas.',
      cortar: false, faltaParaObjetivo: falta, reinversionDisponible: reinversion,
    };
  }
  if (e.llamadasTomadas > 0 && e.cerradas === 0) {
    return {
      titular: `${e.llamadasTomadas} llamadas tomadas y ninguna cerrada.`,
      accion: 'El cuello está en la llamada. Escucha una entera, con silencios.',
      cortar: false, faltaParaObjetivo: falta, reinversionDisponible: reinversion,
    };
  }
  if (e.agendas > 0 && e.llamadasTomadas === 0) {
    return {
      titular: `${e.agendas} agendas y ninguna se presentó.`,
      accion: 'Confirma cada agenda el mismo día y ofrece horarios de esta semana.',
      cortar: false, faltaParaObjetivo: falta, reinversionDisponible: reinversion,
    };
  }

  return {
    titular: `Faltan $${falta.toLocaleString()} para el objetivo.`,
    accion: e.cerradas > 0
      ? `Puedes reinvertir hasta $${reinversion.toLocaleString()} en pauta.`
      : 'Sigue el ritmo: la cadena está entera.',
    cortar: false, faltaParaObjetivo: falta, reinversionDisponible: reinversion,
  };
}

// ── El marcador ────────────────────────────────────────────────────────────

export interface Marcador {
  /** Lo cobrado por Javo, contra su objetivo. */
  cobradoPropio: number;
  objetivoPropio: number;
  /** Lo que facturaron los clientes esta semana. */
  ventasClientes: number;
  facturadoClientes: number;
  /** Cuántos clientes están activos y cuántos frenados. */
  activos: number;
  frenados: number;
}
