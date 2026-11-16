/**
 * racha.ts — La racha de sesiones (Lote A · jul 2026)
 * Cuenta días HÁBILES (lunes a viernes) consecutivos con al menos 1 sesión.
 * Sábado y domingo son libres: NO suman ni rompen la racha (el Camino respira).
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
  return calcularRachaDesdeFechas(leer().fechas);
}

/**
 * La lógica PURA de la racha — compartida por el cliente (localStorage/DB) y
 * el Admin (fecha_completada de hoja_de_ruta). UNA definición en toda la app:
 * días hábiles reales, finde libre, gracia de 1 día hábil.
 *
 * El `hoy` entra por argumento, con el día de verdad por defecto, y es por lo
 * que esta regla se puede medir. Medido el 16 de noviembre de 2026: con `new
 * Date()` adentro, las tres reglas de acá —el día en curso no castiga, la
 * gracia de un día hábil, el finde no rompe— no tenían ninguna lente que las
 * ejecutara, y los tres defectos puestos a propósito dejaban las 143 en verde.
 * Es el mismo argumento que `estadoDeAcceso` ya recibe por la misma razón.
 * Ningún llamador lo pasa: los tres —el Diario del cliente, el Admin y la
 * pista de 66 de Mi protocolo— siguen preguntando por hoy.
 */
export function calcularRachaDesdeFechas(fechas: string[], hoy: Date = new Date()): number {
  if (fechas.length === 0) return 0;
  const set = new Set(fechas.map((f) => f.slice(0, 10)));
  let racha = 0;
  let graciaUsada = false;
  const cursor = new Date(hoy);

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
