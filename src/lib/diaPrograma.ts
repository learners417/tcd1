/**
 * EL DÍA DEL PROGRAMA — una sola fuente para toda la app.
 *
 * Antes había siete cálculos distintos (Roadmap ×2, Dashboard ×2, Sidebar,
 * Metrics, Admin) y además la columna `profiles.dia_programa`, que solo se
 * actualiza con un trigger cuando el cliente completa una meta. Si el cliente
 * deja de completar, esa columna queda CONGELADA: la misma pantalla mostraba
 * "Día 17" y "Día 71 de 90".
 *
 * Reglas:
 * - El día sale SIEMPRE de fecha_inicio y del calendario, nunca de la columna.
 * - fecha_inicio 'YYYY-MM-DD' se lee como fecha LOCAL. `new Date('2026-07-07')`
 *   es medianoche UTC, que en Argentina es las 21 h del día anterior: a la
 *   noche el día saltaba uno antes de tiempo.
 * - Mismo resultado que la función SQL calcular_dia_programa: entre 1 y 90.
 *
 * Lógica pura: no importa supabase, así se puede probar.
 */

const MS_DIA = 86_400_000;


/**
 * La fecha de HOY en hora local, como 'AAAA-MM-DD'.
 *
 * `new Date().toISOString().slice(0, 10)` devuelve UTC, y en Argentina —UTC−3—
 * de las 21:00 en adelante eso da el día siguiente. Estaba escrito así en
 * quince lugares, y tres de ellos guardan la fecha en la base: la jornada que
 * el cliente cerraba a la noche quedaba fechada mañana, y de esa fecha sale el
 * atraso con el que se decide si la garantía corre.
 *
 * Toda fecha de un día —no un instante— se arma con esto.
 */
export function hoyISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Fecha local a medianoche, desde 'YYYY-MM-DD' o un ISO completo. */
export function fechaLocal(valor: string | Date): Date | null {
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  }
  if (!valor) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Días de calendario desde el inicio (0 el primer día). Redondea por el cambio de horario. */
export function diasDesdeInicio(fechaInicio: string | null | undefined, hoy: Date = new Date()): number | null {
  const ini = fechaInicio ? fechaLocal(fechaInicio) : null;
  const h = fechaLocal(hoy);
  if (!ini || !h) return null;
  // Días de calendario, sin descuentos. La app no corta nunca: lo que se cierra
  // algunos días es el soporte, y eso no mueve el día de nadie. Acá había un
  // descuento por «pausa global» que congelaba el día del cliente durante un
  // mes y le corría el cierre: le quitaba el mes que compró sin pedírselo.
  return Math.round((h.getTime() - ini.getTime()) / MS_DIA);
}

/** Día del programa, 1 a 90. Sin fecha de inicio: null (quien llama decide qué mostrar). */
export function diaDelPrograma(fechaInicio: string | null | undefined, hoy: Date = new Date()): number | null {
  const diff = diasDesdeInicio(fechaInicio, hoy);
  if (diff === null) return null;
  return Math.max(1, Math.min(90, diff + 1));
}

/** Semana del programa, 1 a `tope`. */
export function semanaDelPrograma(fechaInicio: string | null | undefined, tope = 13, hoy: Date = new Date()): number {
  const diff = diasDesdeInicio(fechaInicio, hoy);
  if (diff === null) return 1;
  return Math.max(1, Math.min(tope, Math.floor(Math.max(0, diff) / 7) + 1));
}

/** Fecha de calendario que corresponde al día N del programa. */
export function fechaDelDia(fechaInicio: string, dia: number): Date | null {
  const ini = fechaLocal(fechaInicio);
  if (!ini) return null;
  return new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + (dia - 1));
}

/**
 * Días HÁBILES entre el día del paso pendiente y el día de hoy.
 * Cada día se mira por SU fecha real (sábado y domingo no cuentan).
 *
 * Antes se usaba esDiaDescanso(d), que ignora `d` y mira si HOY es fin de
 * semana: de lunes a viernes contaba los fines de semana como atraso, y el
 * sábado y el domingo daba cero a todo el mundo.
 */
export function diasHabilesDeAtraso(
  fechaInicio: string | null | undefined,
  diaDelPaso: number | null,
  diaHoy: number,
): number {
  if (!fechaInicio || diaDelPaso === null || diaHoy <= diaDelPaso) return 0;
  const ini = fechaLocal(fechaInicio);
  if (!ini) return 0;
  let habiles = 0;
  for (let d = diaDelPaso + 1; d <= diaHoy; d++) {
    const g = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + (d - 1)).getDay();
    if (g !== 0 && g !== 6) habiles++;
  }
  return habiles;
}

/**
 * La Fase Autonomía se muestra por DÓNDE ESTÁ EN EL CAMINO, no por el
 * calendario. Mostrarla por fecha le decía "la máquina ya está construida"
 * a alguien con el 20% hecho y la Fase 0 abierta.
 */
export const DIA_FASE_AUTONOMIA = 50;
export function estaEnFaseAutonomia(diaDelPaso: number | null, caminoTerminado = false): boolean {
  if (caminoTerminado) return true;
  return diaDelPaso !== null && diaDelPaso >= DIA_FASE_AUTONOMIA;
}

export type TonoRitmo = 'al_dia' | 'cerca' | 'lejos';

/**
 * El mensaje de ritmo, siempre en positivo: dice qué paso toca y qué hacer.
 * Nunca "vas N días atrás".
 */
export function mensajeDeRitmo(diaHoy: number, diaDelPaso: number | null, atrasoHabil: number): { tono: TonoRitmo; texto: string } {
  if (diaDelPaso === null || atrasoHabil <= 0) {
    return { tono: 'al_dia', texto: `Día ${diaHoy} de 90 · vas al día` };
  }
  if (atrasoHabil <= 3) {
    return { tono: 'cerca', texto: `Día ${diaHoy} de 90 · hoy toca el paso del día ${diaDelPaso}. Con uno por día recuperas el ritmo.` };
  }
  return { tono: 'lejos', texto: `Día ${diaHoy} de 90 · tu próximo paso es el del día ${diaDelPaso}. Tu Mentor te arma hoy el plan para llegar al 90.` };
}

/**
 * Las jornadas que ejecuta el EQUIPO, no el cliente. Nunca son "tu paso de
 * hoy": regla de la casa, todo lo que la app le pide al cliente depende solo
 * de él. La entrega técnica del día 0 se le mostraba como su sesión.
 */
export const JORNADAS_DEL_EQUIPO = new Set(['entrega_tecnica']);

/**
 * Un paso del cliente es una jornada que él hace.
 *
 * Los días de campo y los fines de semana no se completan: son para atender y
 * descansar. Contarlos hacía que el Camino dijera "1 de 90 pasos" cuando las
 * jornadas con trabajo son cincuenta, y esos noventa no se alcanzaban nunca.
 */
export function esPasoDelCliente(
  meta: { tipo_jornada?: string | null; tiempo_estimado?: string | null; cinturon?: string | null },
): boolean {
  if (JORNADAS_DEL_EQUIPO.has(meta.tipo_jornada ?? '')) return false;
  const minutos = parseInt(meta.tiempo_estimado ?? '0', 10) || 0;
  return minutos > 0 || Boolean(meta.cinturon);
}

/**
 * ¿El cliente ya llegó a este pilar?
 *
 * Con el seed nuevo, `pilar.desbloqueo` dejó de ser una regla ('auto',
 * 'completar_anterior'…) y pasó a ser un texto ("Día 15"). El switch viejo no
 * reconocía ninguno y dejaba TODOS los pilares bloqueados: "Empezar" no abría
 * nada. La regla ahora sale del Camino: el paso avanza igual, lo que queda
 * pendiente es el grado, nunca el camino.
 *
 * Abierto si: el camino terminó · o el pilar ya tiene algo hecho · o su primer
 * paso del cliente es del día del paso actual o anterior.
 */
export function primerDiaDelPilar(metas: Array<{ dia_asignado?: number | null; tipo_jornada?: string | null }>): number | null {
  const dias = metas.filter(esPasoDelCliente).map((m) => m.dia_asignado ?? 0);
  return dias.length ? Math.min(...dias) : null;
}

export function pilarAlcanzado(
  metas: Array<{ dia_asignado?: number | null; tipo_jornada?: string | null }>,
  hechasEnElPilar: number,
  diaDelPaso: number | null,
): boolean {
  if (hechasEnElPilar > 0) return true;
  if (diaDelPaso === null) return true; // camino terminado
  const primero = primerDiaDelPilar(metas);
  if (primero === null) return false;   // pilar solo del equipo
  return primero <= diaDelPaso;
}

/* ══════════════════ DÓNDE VA DE VERDAD ══════════════════ */

export interface DondeVa {
  /** Hoy menos el alta, de 1 a 90. Es el ritmo que el programa esperaba. */
  diaDeCalendario: number;
  /**
   * El día que está viviendo: el de su próxima jornada abierta.
   *
   * Es el que manda sobre TODO lo que se abre o se cierra. Quien va al día ve
   * el mismo número en los dos; quien se atrasó ve acá su día real.
   */
  diaDeTrabajo: number;
  /** Días hábiles de diferencia entre los dos. 0 cuando va al día. */
  diferencia: number;
  alDia: boolean;
}

/**
 * EL DÍA QUE MANDA.
 *
 * ═══ QUÉ ESTABA ROTO ═══
 *
 * El día del programa eran días corridos desde el alta, y con ese número se
 * decidía qué abrir. Un cliente que se atrasaba dos semanas leía «día 31:
 * enciende tus campañas» sin tener la página hecha ni los anuncios escritos.
 * Los frenos impedían que rompiera algo, pero la app le hablaba de un camino
 * que no era el suyo: cada pantalla le decía una instrucción que no le tocaba.
 *
 * Y al revés también fallaba: quien adelantaba trabajo igual tenía que esperar
 * al calendario para que se le abriera lo que ya se había ganado.
 *
 * ═══ LA REGLA ═══
 *
 * El calendario queda para una sola cosa: decir cuántos días de diferencia
 * lleva, que es información de ritmo y la necesita. Lo que se abre y lo que se
 * cierra sale del trabajo cerrado.
 *
 * `diaDelPasoPendiente` es el día de la primera jornada que todavía no cerró.
 * `null` significa que terminó el Camino, y entonces manda el calendario
 * porque ya no hay paso que esperar.
 */
export function dondeVa(
  fechaInicio: string | null | undefined,
  diaDelPasoPendiente: number | null,
  hoy: Date = new Date(),
): DondeVa {
  const cal = diaDelPrograma(fechaInicio, hoy) ?? 1;
  const trabajo = diaDelPasoPendiente === null ? cal : Math.max(1, diaDelPasoPendiente);
  const dif = diasHabilesDeAtraso(fechaInicio, diaDelPasoPendiente, cal);
  return {
    diaDeCalendario: cal,
    diaDeTrabajo: trabajo,
    diferencia: dif,
    alDia: dif <= 0,
  };
}

/**
 * Si ya puede abrir lo que corresponde a cierto día del Camino.
 *
 * Una sola función para todas las puertas —Campañas, el quinto destino, lo que
 * venga— para que ninguna vuelva a preguntarle al calendario por su cuenta.
 */
export function yaLlegoAlDia(d: DondeVa, dia: number): boolean {
  return d.diaDeTrabajo >= dia;
}

/**
 * Lo que se le dice a quien todavía no llegó.
 *
 * En positivo y con el próximo paso adentro: «te faltan tres sesiones» se
 * puede hacer hoy; «vas doce días atrasado» no se puede hacer nunca.
 */
export function faltaParaLlegar(d: DondeVa, dia: number): string {
  const faltan = Math.max(0, dia - d.diaDeTrabajo);
  if (faltan === 0) return '';
  const sesiones = faltan === 1 ? 'una sesión' : `${faltan} sesiones`;
  return d.alDia
    ? `Te faltan ${sesiones} para llegar.`
    : `Te faltan ${sesiones}. Tu próxima es la del día ${d.diaDeTrabajo}.`;
}
