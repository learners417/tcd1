/**
 * diarioCalcs.ts — Cálculos del Diario del Fundador
 *
 * Toda la lógica de KPIs vive acá como funciones puras para poder testearla y
 * reusarla en la UI (preview) y en la vista de Lupe. El `score` autoritativo se
 * recalcula server-side al guardar (ver migración SQL), pero estas fórmulas son
 * el espejo exacto de ese cálculo para mostrarlo en el front.
 *
 * Fórmulas (spec "Diario del Fundador"):
 *   Score del día      = Energía×0.25 + Promedio3dim×0.25 + FocoNegocio×0.25 + Checkeos×0.25 → 0–100
 *   Índice bienestar   = promedio(cuerpo, mente, emociones, checkeos positivos normalizados a 0–10)
 *   Foco en negocio    = % de tags seleccionados que son de negocio (excluye descanso y admin)
 *   Consistencia 7d    = días completados en los últimos 7 / 7 × 100
 *   Equilibrio integral= promedio simple de cuerpo + mente + emociones
 *   Promedio energía 7d= suma energía últimos 7 días / días completados
 *   Racha activa       = días consecutivos con diario completado sin saltear
 */

// ─── Catálogos (fuente de verdad para UI y validaciones) ───────────────────────

export interface TareaTag {
  id: string;
  label: string;
  /** true si cuenta para "Foco en negocio". `descanso` y `admin` son false. */
  esNegocio: boolean;
}

/** Tags de "¿En qué estuviste hoy?" — multi-select, mínimo 1. */
export const TAREAS_TAGS: readonly TareaTag[] = [
  { id: 'contenido_organico', label: 'Contenido orgánico', esNegocio: true },
  { id: 'llamadas_venta', label: 'Llamadas de venta', esNegocio: true },
  { id: 'publicidad_ads', label: 'Publicidad / ads', esNegocio: true },
  { id: 'tareas_programa', label: 'Tareas del programa', esNegocio: true },
  { id: 'admin_gestion', label: 'Admin / gestión', esNegocio: false },
  { id: 'formacion_estudio', label: 'Formación / estudio', esNegocio: true },
  { id: 'prospeccion', label: 'Prospección', esNegocio: true },
  { id: 'seguimiento_leads', label: 'Seguimiento leads', esNegocio: true },
  { id: 'diseno_edicion', label: 'Diseño / edición', esNegocio: true },
  { id: 'descanso_intencional', label: 'Descanso intencional', esNegocio: false },
] as const;

export interface CheckeoChip {
  id: string;
  label: string;
  /** Emoji para la UI. */
  emoji: string;
  /** true = aporta bienestar (suma); false = resta (ansiedad, soledad). */
  positivo: boolean;
}

/** Checkeos rápidos — chips opcionales que alimentan el Índice de bienestar. */
export const CHECKEOS_CHIPS: readonly CheckeoChip[] = [
  { id: 'durmio_bien', label: 'Dormí bien', emoji: '🌙', positivo: true },
  { id: 'comio_bien', label: 'Comí bien', emoji: '🥗', positivo: true },
  { id: 'entreno', label: 'Entrené', emoji: '💪', positivo: true },
  { id: 'tiempo_libre', label: 'Tiempo libre', emoji: '⏱', positivo: true },
  { id: 'conecto_alguien', label: 'Conecté con alguien', emoji: '👥', positivo: true },
  { id: 'inspirado', label: 'Me sentí inspirado', emoji: '💡', positivo: true },
  { id: 'ansioso', label: 'Estuve ansioso', emoji: '😟', positivo: false },
  { id: 'solo', label: 'Me sentí solo', emoji: '🫥', positivo: false },
] as const;

export const CHECKEOS_POSITIVOS_TOTAL = CHECKEOS_CHIPS.filter((c) => c.positivo).length;

export const LOGRO_MAX_CHARS = 400;
export const BLOQUEO_MAX_CHARS = 500;

// ─── Tipos ─────────────────────────────────────────────────────────────────────

/** Datos crudos de una entrada del diario (lo que el usuario carga + se persiste). */
export interface EntradaDiarioInput {
  fecha: string; // YYYY-MM-DD
  energia: number; // 1–10
  cuerpo: number; // 1–10
  mente: number; // 1–10
  emociones: number; // 1–10
  logro: string;
  /** ids de TAREAS_TAGS seleccionados. */
  tareas: string[];
  /** ids de CHECKEOS_CHIPS seleccionados. */
  checkeos: string[];
  bloqueo: string;
}

export interface DiarioKPIs {
  score: number; // 0–100
  indiceBienestar: number; // 0–10
  focoNegocio: number; // 0–100 (%)
  equilibrioIntegral: number; // 0–10
  consistencia7d: number; // 0–100 (%)
  energiaPromedio7d: number | null; // 0–10
  racha: number; // días
}

// ─── Helpers de normalización ──────────────────────────────────────────────────

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Promedio simple de las 3 dimensiones (0–10). */
export function equilibrioIntegral(cuerpo: number, mente: number, emociones: number): number {
  return round1((cuerpo + mente + emociones) / 3);
}

/** % de tags seleccionados que son de negocio. 0 si no hay tags. */
export function focoNegocio(tareas: readonly string[]): number {
  if (tareas.length === 0) return 0;
  const negocioIds = new Set(TAREAS_TAGS.filter((t) => t.esNegocio).map((t) => t.id));
  const deNegocio = tareas.filter((id) => negocioIds.has(id)).length;
  return Math.round((deNegocio / tareas.length) * 100);
}

/** Checkeos positivos seleccionados, normalizados a 0–10. */
export function checkeosNormalizado(checkeos: readonly string[]): number {
  const positivosIds = new Set(CHECKEOS_CHIPS.filter((c) => c.positivo).map((c) => c.id));
  const negativosIds = new Set(CHECKEOS_CHIPS.filter((c) => !c.positivo).map((c) => c.id));
  const positivos = checkeos.filter((id) => positivosIds.has(id)).length;
  const negativos = checkeos.filter((id) => negativosIds.has(id)).length;
  // Cada negativo resta medio punto del aporte positivo.
  const neto = clamp(positivos - negativos * 0.5, 0, CHECKEOS_POSITIVOS_TOTAL);
  return round1((neto / CHECKEOS_POSITIVOS_TOTAL) * 10);
}

/** Índice de bienestar (0–10): promedio de cuerpo, mente, emociones y checkeos. */
export function indiceBienestar(input: Pick<EntradaDiarioInput, 'cuerpo' | 'mente' | 'emociones' | 'checkeos'>): number {
  const check10 = checkeosNormalizado(input.checkeos);
  return round1((input.cuerpo + input.mente + input.emociones + check10) / 4);
}

/** Score del día (0–100) — fórmula autoritativa, espejo del trigger SQL. */
export function calcularScore(input: EntradaDiarioInput): number {
  const energiaNorm = (clamp(input.energia, 0, 10) / 10) * 100;
  const prom3Norm = ((input.cuerpo + input.mente + input.emociones) / 3 / 10) * 100;
  const foco = focoNegocio(input.tareas);
  const checkeos = (checkeosNormalizado(input.checkeos) / 10) * 100;
  const score = energiaNorm * 0.25 + prom3Norm * 0.25 + foco * 0.25 + checkeos * 0.25;
  return Math.round(clamp(score, 0, 100));
}

// ─── KPIs que dependen del histórico ───────────────────────────────────────────

/** Entrada histórica mínima necesaria para los KPIs de ventana. */
export interface EntradaHistorica {
  fecha: string; // YYYY-MM-DD
  energia: number;
  cuerpo: number;
  mente: number;
  emociones: number;
  score?: number;
  bloqueo?: string;
  tareas?: string[];
}

function ultimosNDias(entradas: readonly EntradaHistorica[], n: number): EntradaHistorica[] {
  return [...entradas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, n);
}

/** Promedio de energía de los últimos 7 días cargados (0–10), o null si no hay datos. */
export function energiaPromedio7d(entradas: readonly EntradaHistorica[]): number | null {
  const last7 = ultimosNDias(entradas, 7);
  if (last7.length === 0) return null;
  const sum = last7.reduce((acc, e) => acc + e.energia, 0);
  return round1(sum / last7.length);
}

/** Días con diario en los últimos 7 días calendario / 7 × 100. */
export function consistencia7d(entradas: readonly EntradaHistorica[], hoy: Date): number {
  const fechasSet = new Set(entradas.map((e) => e.fecha));
  let completados = 0;
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    if (fechasSet.has(toFechaStr(fecha))) completados++;
  }
  return Math.round((completados / 7) * 100);
}

/** Días consecutivos con diario completado terminando hoy (o ayer si hoy falta). */
export function rachaActiva(entradas: readonly EntradaHistorica[], hoy: Date): number {
  const fechasSet = new Set(entradas.map((e) => e.fecha));
  let racha = 0;
  for (let i = 0; i < 365; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    if (fechasSet.has(toFechaStr(fecha))) {
      racha++;
    } else if (i > 0) {
      break; // hoy puede faltar (todavía no lo cargó); cualquier otro hueco corta.
    }
  }
  return racha;
}

// ─── Utilidades de formato/fecha ───────────────────────────────────────────────

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** YYYY-MM-DD en hora local (evita el corrimiento de toISOString en UTC-3). */
export function toFechaStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function etiquetaEnergia(valor: number): string {
  if (valor <= 3) return 'Sin energía';
  if (valor <= 6) return 'Regular';
  if (valor <= 9) return 'Bien';
  return 'Imparable';
}

/** Color del fill de un slider de dimensión: ≤4 naranja, 5–7 dorado, 8+ verde. */
export function colorDimension(valor: number): string {
  if (valor <= 4) return '#E09040';
  if (valor <= 7) return '#C8893A';
  return '#2DD4A0';
}
