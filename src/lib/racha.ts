/**
 * racha.ts — La racha de sesiones (Lote A · jul 2026)
 * Cuenta días HÁBILES (lunes a viernes) consecutivos con al menos 1 sesión.
 * Sábado y domingo son libres: NO suman ni rompen la racha (el dojo respira).
 * Gracia de 1 día hábil: un día hábil sin sesión no rompe; el segundo sí.
 * Todo por CALENDARIO REAL (getDay()), no por día contado del programa.
 */

const KEY = 'tcd_racha_sesiones';

interface RachaData {
  fechas: string[]; // ISO (YYYY-MM-DD) con sesión completada
}

function hoyISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function isoDe(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** ¿Es fin de semana? (sábado=6, domingo=0) — por calendario real. */
export function esFinDeSemana(d: Date): boolean {
  const g = d.getDay();
  return g === 0 || g === 6;
}

/** Compat: ¿hoy es día de descanso? (por calendario real, ignora el arg viejo). */
export function esDiaDescanso(_diaPrograma?: number): boolean {
  return esFinDeSemana(new Date());
}

function leer(): RachaData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RachaData) : { fechas: [] };
  } catch {
    return { fechas: [] };
  }
}

/** Registra que HOY se completó una sesión. */
export function registrarSesionCompletada(): void {
  const d = leer();
  const hoy = hoyISO();
  if (!d.fechas.includes(hoy)) {
    d.fechas.push(hoy);
    d.fechas = d.fechas.slice(-120);
    localStorage.setItem(KEY, JSON.stringify(d));
  }
}

/**
 * Calcula la racha: días hábiles consecutivos con sesión, hacia atrás.
 * - Fin de semana: se saltea (no suma ni rompe).
 * - Gracia: 1 día hábil sin sesión se tolera; 2 días hábiles seguidos sin sesión rompen.
 * El arg fechaInicio se acepta por compatibilidad; ya no se usa (todo es calendario real).
 */
export function calcularRacha(_fechaInicio?: string | null): number {
  const d = leer();
  if (d.fechas.length === 0) return 0;
  const set = new Set(d.fechas);
  let racha = 0;
  let graciaUsada = false;
  const cursor = new Date();

  // El día en curso no castiga: si hoy aún no hay sesión, empezamos a mirar desde ayer.
  if (!set.has(isoDe(cursor))) cursor.setDate(cursor.getDate() - 1);

  for (let i = 0; i < 180; i++) {
    if (esFinDeSemana(cursor)) {
      cursor.setDate(cursor.getDate() - 1);
      continue; // el finde no cuenta ni rompe
    }
    // día hábil
    if (set.has(isoDe(cursor))) {
      racha++;
    } else if (!graciaUsada) {
      graciaUsada = true; // primer hábil sin sesión: gracia
    } else {
      break; // segundo hábil sin sesión: se corta
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

/** ¿Hoy ya tiene sesión registrada? (para el estado visual del Dashboard). */
export function hoyTieneSesion(): boolean {
  return leer().fechas.includes(hoyISO());
}
