import { microPasoDe, NOMBRE_AREA, type Area } from './microPasos';
import { CRITERIOS, type SituacionDeCriterio } from './criterio';

/**
 * EL CEREBRO — todo el trabajo en una sola lista.
 *
 * ═══ EL PROBLEMA QUE RESUELVE ═══
 *
 * La cola detectaba qué estaba roto, escribía la acción, y **ahí se
 * terminaba**: no creaba una tarea, no quedaba asignada, no se podía
 * modificar, y desaparecía al recargar. Mientras tanto la tabla de tareas ya
 * tenía todo lo que hacía falta.
 *
 * Eran dos listas que nunca se veían juntas — y por eso nadie podía entender
 * su día completo, ni contestar «¿por qué esta tarea?».
 *
 * ═══ LA REGLA ═══
 *
 * **La cola no muestra trabajo: lo CREA.** Y lo que una persona escribe en
 * Tareas aparece en su Hoy. Es la misma lista mirada desde dos lados; nunca
 * dos listas.
 */

/** De dónde salió la tarea. Es lo que contesta «¿por qué esta tarea?». */
export type Origen = 'cadena' | 'soporte' | 'recorrido' | 'sesion' | 'persona';

/**
 * A dónde lleva.
 *
 * Es lo que la vuelve útil en vez de una lista de recordatorios: **nunca
 * «andá a buscarlo»**, siempre un botón que abre lo que hace falta.
 */
export type Destino =
  | 'mensaje' | 'contenido' | 'campana' | 'conversacion'
  | 'numeros' | 'escalar' | 'ninguno';

export interface TareaDelCerebro {
  /** Vacío mientras no se guardó. */
  id?: string;
  titulo: string;
  descripcion: string;
  clienteId: string | null;
  origen: Origen;
  /** Qué la causó. Con el cliente forma la huella que evita duplicar. */
  ref: string | null;
  destino: Destino;
  /** Lo que hay que decir, ya escrito, cuando el destino es un mensaje. */
  textoListo?: string;
  peso: number;
  /** El área de trabajo, para poder agrupar. */
  area?: Area;
  /** Días para vencer. null = sin fecha. */
  venceEn: number | null;
}

/** Cómo se explica cada origen, para que la tarea se justifique sola. */
export const POR_QUE: Record<Origen, string> = {
  cadena: 'Lo detectaron sus números esta semana.',
  soporte: 'Escribió y todavía no le respondimos.',
  recorrido: 'Lleva demasiado tiempo en la misma etapa.',
  sesion: 'Quedó pendiente de una sesión.',
  persona: 'La escribió alguien del equipo.',
};

/** Qué dice el botón según a dónde lleva. */
export const ETIQUETA_DESTINO: Record<Destino, string> = {
  mensaje: 'Mandárselo',
  contenido: 'Abrir el Creador',
  campana: 'Abrir su campaña',
  conversacion: 'Abrir la conversación',
  numeros: 'Ver sus números',
  escalar: 'Pasarlo a quien corresponde',
  ninguno: 'Marcar hecha',
};

// ── Las cinco fuentes ──────────────────────────────────────────────────────

/**
 * Una tarea desde un cuello de la cadena.
 *
 * El peso sale del dinero en riesgo, que ya calcula la cola. Y el destino sale
 * del micro-paso: si es técnico va al dev, si es de criterio va a dirección,
 * y si es de ejecución se resuelve con un mensaje.
 */
export function desdeLaCadena(x: {
  clienteId: string;
  nombre: string;
  cuello: string;
  accion: string;
  mensaje: string;
  enRiesgo: number;
  semanasIgual: number;
}): TareaDelCerebro {
  const m = microPasoDe(x.cuello);
  const esTecnico = m?.a === 'dev';
  const esCriterio = m?.a === 'direccion';

  return {
    titulo: `${x.nombre} — ${x.accion}`,
    descripcion: m
      ? `${m.significa} ${POR_QUE.cadena}`
      : POR_QUE.cadena,
    clienteId: x.clienteId,
    origen: 'cadena',
    ref: x.cuello,
    destino: esTecnico || esCriterio ? 'escalar' : 'mensaje',
    textoListo: esTecnico || esCriterio ? undefined : x.mensaje,
    // Dinero en riesgo, y la insistencia lo multiplica: tres semanas con lo
    // mismo ya no se arregla repitiendo el mismo mensaje.
    peso: Math.round(x.enRiesgo * (1 + Math.max(0, x.semanasIgual) * 0.5)),
    area: m?.area,
    // Una cuenta que pierde dinero no espera una semana.
    venceEn: 2,
  };
}

/** Una tarea desde un mensaje sin responder. */
export function desdeElSoporte(x: {
  clienteId: string;
  nombre: string;
  mensajeId: string;
  texto: string;
  horas: number;
  vencido: boolean;
  esRoto: boolean;
}): TareaDelCerebro {
  return {
    titulo: x.esRoto
      ? `${x.nombre} — reportó que algo no funciona`
      : `${x.nombre} — esperando respuesta`,
    descripcion: `«${x.texto.slice(0, 90)}${x.texto.length > 90 ? '…' : ''}» · hace ${x.horas} ${x.horas === 1 ? 'hora' : 'horas'}`,
    clienteId: x.clienteId,
    origen: 'soporte',
    ref: x.mensajeId,
    destino: x.esRoto ? 'escalar' : 'conversacion',
    // Lo vencido y lo roto pesan por encima de cualquier cuello: una cuenta
    // rota se destraba mañana; alguien esperando respuesta se va hoy.
    peso: (x.vencido ? 100_000 : 50_000) + (x.esRoto ? 20_000 : 0) + x.horas,
    venceEn: x.esRoto ? 0 : 1,
  };
}

/** Una tarea desde un cliente trabado en su etapa. */
export function desdeElRecorrido(x: {
  clienteId: string;
  nombre: string;
  etapa: string;
  semanas: number;
  situacion?: SituacionDeCriterio;
}): TareaDelCerebro {
  const c = x.situacion ? CRITERIOS[x.situacion] : null;
  return {
    titulo: `${x.nombre} — ${x.semanas} semanas en «${x.etapa}»`,
    descripcion: c
      ? c.loQuePasa
      : `${POR_QUE.recorrido} Cada semana trabado es una semana sin vender.`,
    clienteId: x.clienteId,
    origen: 'recorrido',
    ref: x.etapa,
    // Un trabado no se destraba con un mensaje: se destraba con una sesión.
    destino: 'escalar',
    // Sube con las semanas, pero por debajo del soporte: alguien esperando
    // respuesta está más cerca de irse que alguien que no avanza.
    peso: 1_000 * x.semanas,
    venceEn: 5,
  };
}

/** Una tarea que salió de una sesión cargada. */
export function desdeUnaSesion(x: {
  clienteId: string | null;
  texto: string;
  sesionId: string;
  paraElCliente: boolean;
}): TareaDelCerebro {
  return {
    titulo: x.texto,
    descripcion: POR_QUE.sesion,
    clienteId: x.clienteId,
    origen: 'sesion',
    ref: `${x.sesionId}:${x.texto.slice(0, 40)}`,
    destino: x.paraElCliente ? 'mensaje' : 'ninguno',
    peso: 500,
    venceEn: 7,
  };
}

// ── El orden ───────────────────────────────────────────────────────────────

export interface TareaOrdenada extends TareaDelCerebro {
  /** true = tiene fecha y ya pasó. */
  vencida: boolean;
  /** La explicación de por qué está donde está. */
  porQueAca: string;
}

/**
 * Ordena la lista completa.
 *
 * **Lo vencido primero, siempre.** Una tarea vencida ya falló una vez, y da
 * igual de dónde vino: la promesa incumplida pesa más que el diagnóstico más
 * urgente.
 *
 * Después, el peso. Y el peso ya lleva adentro el dinero en riesgo, la
 * insistencia y la urgencia del origen.
 */
export function ordenar(
  tareas: Array<TareaDelCerebro & { creadaEn?: string }>,
  hoy = new Date(),
): TareaOrdenada[] {
  return tareas
    .map((t) => {
      const vencida = t.venceEn !== null && t.creadaEn
        ? new Date(t.creadaEn).getTime() + t.venceEn * 86400000 < hoy.getTime()
        : false;

      let porQueAca: string;
      if (vencida) porQueAca = 'Está vencida: se prometió antes y no se cumplió.';
      else if (t.origen === 'soporte') porQueAca = 'Alguien está esperando respuesta.';
      else if (t.peso > 10_000) porQueAca = 'Es donde hay más dinero en riesgo.';
      else porQueAca = POR_QUE[t.origen];

      return { ...t, vencida, porQueAca };
    })
    .sort((a, b) => {
      if (a.vencida !== b.vencida) return a.vencida ? -1 : 1;
      return b.peso - a.peso;
    });
}

/** Agrupa por área, manteniendo el orden adentro de cada grupo. */
export function porArea(tareas: TareaOrdenada[]): Array<{
  area: Area | null; nombre: string; tareas: TareaOrdenada[];
}> {
  const mapa = new Map<Area | null, TareaOrdenada[]>();
  for (const t of tareas) {
    const k = t.area ?? null;
    mapa.set(k, [...(mapa.get(k) ?? []), t]);
  }
  // Los grupos se ordenan por su tarea más pesada: si lo más urgente del día
  // es de setting, setting va arriba.
  return [...mapa.entries()]
    .map(([area, ts]) => ({
      area,
      nombre: area ? NOMBRE_AREA[area] : 'Otras',
      tareas: ts,
    }))
    .sort((a, b) => {
      const pa = a.tareas.some((t) => t.vencida) ? Infinity : a.tareas[0]?.peso ?? 0;
      const pb = b.tareas.some((t) => t.vencida) ? Infinity : b.tareas[0]?.peso ?? 0;
      return pb - pa;
    });
}

/** El titular del día. Una frase, la que más importa. */
export function titularDelDia(tareas: TareaOrdenada[]): string {
  if (tareas.length === 0) return 'No hay nada que necesite que entres hoy.';

  const vencidas = tareas.filter((t) => t.vencida).length;
  const soporte = tareas.filter((t) => t.origen === 'soporte').length;

  if (vencidas > 0) {
    return vencidas === 1
      ? 'Hay una tarea vencida. Esa primero: ya se prometió una vez.'
      : `Hay ${vencidas} tareas vencidas. Esas primero: ya se prometieron una vez.`;
  }
  if (soporte > 0) {
    return soporte === 1
      ? 'Hay alguien esperando respuesta. Empezá por ahí.'
      : `Hay ${soporte} personas esperando respuesta. Empezá por ahí.`;
  }
  return tareas.length === 1
    ? 'Hay una cuenta que necesita que entres hoy.'
    : `Hay ${tareas.length} cuentas que necesitan que entres hoy.`;
}

// ── A dónde lleva cada tarea ───────────────────────────────────────────────

/**
 * Lo que hay que abrir para resolver una tarea.
 *
 * ═══ POR QUÉ ESTO ES UN CONTRATO Y NO UNA URL ═══
 *
 * Una URL suelta obliga a quien la escribe a saber cómo está armada la app, y
 * el día que una pantalla cambia de nombre, los botones dejan de andar en
 * silencio. Con un contrato, la pantalla que navega decide CÓMO, y acá solo
 * se declara QUÉ hace falta abrir.
 *
 * La lente 6.36 verifica que todo destino tenga a dónde ir.
 */
export interface AperturaDeTarea {
  /** La página del admin que hay que abrir. */
  tab: 'clientes' | 'campanas' | 'creador' | 'mensajes' | 'hoy';
  /** El cliente cuyo contexto hay que cargar. */
  clienteId: string | null;
  /** Qué mostrar dentro de esa página. */
  seccion?: 'numeros' | 'conversacion' | 'activacion' | 'anuncios';
  /** El texto que ya está escrito y hay que poner en el campo. */
  textoPrecargado?: string;
  /** Lo que se le dice al que toca, antes de llevarlo. */
  aviso?: string;
}

/**
 * Traduce una tarea en lo que hay que abrir.
 *
 * Devuelve null cuando la tarea se resuelve sin ir a ningún lado —marcarla
 * hecha y listo— porque mandar a alguien a una pantalla que no necesita es
 * peor que no tener botón.
 */
export function comoSeResuelve(t: TareaDelCerebro): AperturaDeTarea | null {
  switch (t.destino) {
    case 'mensaje':
      // No navega: manda desde donde está. Sacarla de su lista para escribir
      // un mensaje que ya está escrito sería trabajo inventado.
      return null;

    case 'conversacion':
      return {
        tab: 'mensajes', clienteId: t.clienteId, seccion: 'conversacion',
        aviso: 'Está esperando respuesta. Lo primero es que sepa que lo leíste.',
      };

    case 'contenido':
      return {
        tab: 'creador', clienteId: t.clienteId,
        // El brief del cliente se carga solo: pedirle a alguien que lo copie
        // de una pantalla a otra es exactamente el trabajo que sobra.
        aviso: 'Se abre con su brief cargado.',
      };

    case 'campana':
      return {
        tab: 'campanas', clienteId: t.clienteId, seccion: 'anuncios',
      };

    case 'numeros':
      return {
        tab: 'clientes', clienteId: t.clienteId, seccion: 'numeros',
      };

    case 'escalar':
      // El escalado no abre nada: crea la tarea del otro y saca la tuya.
      return null;

    default:
      return null;
  }
}

/** A quién va cuando se escala, según de qué se trata. */
export function aQuienEscala(t: TareaDelCerebro): {
  rol: 'desarrollo' | 'direccion';
  porque: string;
} {
  const m = t.ref ? microPasoDe(t.ref) : null;

  if (m?.a === 'dev' || t.origen === 'soporte') {
    return {
      rol: 'desarrollo',
      porque: 'Algo está roto en la instalación o en la app. No se arregla hablando con el cliente.',
    };
  }
  return {
    rol: 'direccion',
    porque: 'Es una decisión de método, oferta o precio. La ejecución está bien.',
  };
}

/**
 * Lo que se le dice al cliente cuando su tarea se escala.
 *
 * Se avisa siempre. **El silencio mientras alguien espera es lo que rompe la
 * confianza**, y «lo estamos mirando» cuesta diez segundos.
 */
export function avisoDeEscalado(t: TareaDelCerebro): string {
  const { rol } = aQuienEscala(t);
  return rol === 'desarrollo'
    ? 'Vi lo que pasó y no es algo que tengas que resolver tú: lo pasé al equipo técnico. Te aviso apenas esté.'
    : 'Esto lo quiero mirar contigo en una llamada corta, no por mensaje. Te paso un par de horarios.';
}
