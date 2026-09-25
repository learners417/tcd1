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
