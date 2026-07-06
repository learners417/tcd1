/**
 * racha.ts — La racha de sesiones con freeze de descanso (Cirugía Final F2)
 * Cuenta días consecutivos con al menos 1 sesión completada.
 * Los días 6 y 7 de cada semana del programa NO rompen la racha (el dojo respira).
 */

const KEY = 'tcd_racha_sesiones';

interface RachaData {
  fechas: string[]; // ISO dates (YYYY-MM-DD) con sesión completada
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function leer(): RachaData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RachaData) : { fechas: [] };
  } catch {
    return { fechas: [] };
  }
}

/** Registra que HOY se completó una sesión. Llamar desde el completar del Camino. */
export function registrarSesionCompletada(): void {
  const d = leer();
  const hoy = hoyISO();
  if (!d.fechas.includes(hoy)) {
    d.fechas.push(hoy);
    // conservar últimos 120 días
    d.fechas = d.fechas.slice(-120);
    localStorage.setItem(KEY, JSON.stringify(d));
  }
}

/** ¿Es día de descanso del programa? (día 6 o 7 de cada semana del programa) */
export function esDiaDescanso(diaPrograma: number): boolean {
  const mod = diaPrograma % 7;
  return mod === 6 || mod === 0;
}

/**
 * Calcula la racha actual: días consecutivos hacia atrás con sesión completada,
 * salteando sábados/domingos del programa (freeze estructural).
 * @param fechaInicio ISO del inicio del programa (para saber qué días son descanso)
 */
export function calcularRacha(fechaInicio?: string | null): number {
  const d = leer();
  if (d.fechas.length === 0) return 0;
  const set = new Set(d.fechas);
  const inicio = fechaInicio ? new Date(fechaInicio) : null;
  let racha = 0;
  const cursor = new Date();
  // si hoy no tiene sesión aún, la racha se cuenta desde ayer (no castiga el día en curso)
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 120; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const diaProg = inicio ? Math.floor((cursor.getTime() - inicio.getTime()) / 86400000) + 1 : 0;
    const descanso = inicio ? esDiaDescanso(diaProg) : cursor.getDay() === 0 || cursor.getDay() === 6;
    if (set.has(iso)) {
      racha++;
    } else if (descanso) {
      // freeze: el descanso no suma ni rompe
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}
