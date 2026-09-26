/**
 * TUS NÚMEROS — su meta, sus cobros y sus horas, en un solo lugar.
 *
 * Nació de un pedido concreto: "¿tienes un formato donde pueda ir colocando mi
 * meta y mis ventas? Nunca llevé registro de pagos y me ha costado mucho el
 * orden". Sin Excel, sin fórmulas, desde el teléfono.
 *
 * Tres cosas y nada más: cuánto quiere llegar, cuánto lleva cobrado, y cuántas
 * horas le costó. De ahí sale el único número que muestra si está ganando más
 * o solo trabajando más: su hora real, comparada con la del día 1.
 *
 * Lo que se lleva el estado se configura una vez. Ella escribió "$462,50
 * quitando $37,50 del IVA": esa resta la hace la app, no ella, cada vez.
 */
import { calcPHR, LS_KEY as LS_NUMERO } from './elNumero';

export const KEY_NUMEROS = 'tcd_mis_numeros_v1';

export interface SemanaDeHoras {
  /** El lunes de esa semana, en aaaa-mm-dd. */
  lunes: string;
  horas: number;
}

export interface MisNumeros {
  /** Cuánto quiere cobrar, en su moneda. */
  meta: number | null;
  /** Para cuándo: 'los 90 días', 'este mes'. Lo escribe él. */
  plazo: string;
  /** Lo que se lleva el estado de cada cobro, en por ciento. */
  retencion: number;
  horas: SemanaDeHoras[];
}

export interface Cobro {
  fecha: string;
  monto: number;
}

export function numerosVacios(): MisNumeros {
  return { meta: null, plazo: '', retencion: 0, horas: [] };
}

export function leerNumeros(): MisNumeros {
  try {
    const raw = localStorage.getItem(KEY_NUMEROS);
    if (!raw) return numerosVacios();
    return { ...numerosVacios(), ...(JSON.parse(raw) as Partial<MisNumeros>) };
  } catch {
    return numerosVacios();
  }
}

export function guardarNumeros(n: MisNumeros): void {
  try { localStorage.setItem(KEY_NUMEROS, JSON.stringify(n)); } catch { /* noop */ }
}

export interface Balance {
  /** Lo que le entró, antes de impuestos. */
  bruto: number;
  /** Lo que le quedó. */
  neto: number;
  /** Cuánto falta para su meta, medido en neto. */
  falta: number;
  /** De 0 a 1, para la barra. */
  avance: number;
  cobros: number;
  horas: number;
  /** Lo que gana por hora hoy. */
  horaReal: number | null;
  /** Lo que ganaba por hora el día 1, si lo calculó. */
  horaRealInicial: number | null;
}

/** Su hora real del día 1, si ya hizo ese cálculo. */
export function horaRealInicial(): number | null {
  try {
    const raw = localStorage.getItem(LS_NUMERO);
    if (!raw) return null;
    const n = JSON.parse(raw) as { precio_sesion?: number; pacientes_semana?: number; horas_semana?: number };
    if (!n.precio_sesion || !n.pacientes_semana || !n.horas_semana) return null;
    return calcPHR(n.precio_sesion, n.pacientes_semana, n.horas_semana);
  } catch {
    return null;
  }
}

/** La cuenta completa: lo que entró, lo que queda y lo que costó. */
export function balance(cobros: Cobro[], n: MisNumeros = leerNumeros()): Balance {
  const bruto = cobros.reduce((t, c) => t + (c.monto || 0), 0);
  const neto = Math.round(bruto * (1 - (n.retencion || 0) / 100) * 100) / 100;
  const horas = n.horas.reduce((t, h) => t + (h.horas || 0), 0);
  const meta = n.meta ?? 0;
  return {
    bruto,
    neto,
    falta: meta > 0 ? Math.max(0, Math.round((meta - neto) * 100) / 100) : 0,
    avance: meta > 0 ? Math.min(1, neto / meta) : 0,
    cobros: cobros.length,
    horas,
    horaReal: horas > 0 ? Math.round((neto / horas) * 100) / 100 : null,
    horaRealInicial: horaRealInicial(),
  };
}

/** El lunes de la semana de una fecha, para agrupar las horas. */
export function lunesDe(fecha: Date = new Date()): string {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Carga o corrige las horas de una semana. */
export function anotarHoras(n: MisNumeros, lunes: string, horas: number): MisNumeros {
  const resto = n.horas.filter((h) => h.lunes !== lunes);
  const next = horas > 0 ? [...resto, { lunes, horas }] : resto;
  return { ...n, horas: next.sort((a, b) => a.lunes.localeCompare(b.lunes)) };
}

/** Lo que la app le dice al mirar su hora real. */
export function lecturaDeLaHora(b: Balance): string {
  if (b.horaReal === null) return 'Anota las horas de esta semana y vas a ver cuánto te queda por hora.';
  if (b.horaRealInicial === null) return `Hoy ganas ${b.horaReal} por hora trabajada.`;
  const dif = Math.round((b.horaReal - b.horaRealInicial) * 100) / 100;
  if (dif > 0) return `Tu hora pasó de ${b.horaRealInicial} a ${b.horaReal}. Ganas ${dif} más por cada hora.`;
  if (dif === 0) return `Tu hora sigue en ${b.horaReal}. Lo que cambió todavía no llegó al número.`;
  return `Tu hora está en ${b.horaReal}, y arrancaste en ${b.horaRealInicial}. Estás facturando con más horas adentro.`;
}
