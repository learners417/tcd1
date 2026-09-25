/**
 * LA VENTANA DE ACCESO — hasta cuándo tiene abierto su Camino.
 *
 * Se carga por cliente: treinta días, noventa, o en cuotas. El Camino se
 * cierra el día que vence y el día 90 siempre. Al cerrarse, su trabajo queda a
 * la vista en modo lectura: nada se borra.
 *
 * Con la cuota impaga, el Camino se cierra el día del vencimiento y se reabre
 * apenas entra el pago, con las fechas corridas los días que estuvo cerrado.
 * Nadie pierde jornadas por un atraso de pago.
 *
 * Esto es lo que marca los límites de la garantía: al cerrar se ve qué hizo,
 * qué le faltó y cuánto se atrasó.
 */

export type TipoDeAcceso = 'treinta' | 'noventa' | 'cuotas';

export interface Cuota {
  /** Cuándo vence, en aaaa-mm-dd. */
  vence: string;
  pagada: boolean;
}

export interface Acceso {
  tipo: TipoDeAcceso;
  /** El lunes de arranque. */
  inicio: string;
  /** Solo para cuotas. */
  cuotas?: Cuota[];
  /** Días que estuvo cerrado esperando un pago: se le devuelven. */
  diasDevueltos?: number;
}

export type EstadoDeAcceso =
  | { abierto: true; cierraEl: string; diasRestantes: number }
  | { abierto: false; motivo: 'venció su ventana' | 'esperando el pago de tu cuota' | 'terminaron los noventa días'; desde: string };

const DIA = 24 * 60 * 60 * 1000;

function aFecha(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function aISO(f: Date): string {
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

export function sumarDias(iso: string, dias: number): string {
  const f = aFecha(iso);
  f.setDate(f.getDate() + dias);
  return aISO(f);
}

/** Cuántos días dura, según lo que se le cargó. */
export function diasDeLaVentana(a: Acceso): number {
  const base = a.tipo === 'treinta' ? 30 : 90;
  return base + (a.diasDevueltos ?? 0);
}

/** El día en que cierra por su ventana (sin contar cuotas). */
export function cierreDeLaVentana(a: Acceso): string {
  return sumarDias(a.inicio, diasDeLaVentana(a) - 1);
}

/** La primera cuota vencida sin pagar, si hay. */
export function cuotaVencida(a: Acceso, hoy: string): Cuota | null {
  if (a.tipo !== 'cuotas') return null;
  const impagas = (a.cuotas ?? []).filter((c) => !c.pagada && c.vence <= hoy);
  return impagas.sort((x, y) => x.vence.localeCompare(y.vence))[0] ?? null;
}

/** Cómo está hoy: abierto con sus días, o cerrado y por qué. */
export function estadoDeAcceso(a: Acceso, hoy: string = aISO(new Date())): EstadoDeAcceso {
  const impaga = cuotaVencida(a, hoy);
  if (impaga) return { abierto: false, motivo: 'esperando el pago de tu cuota', desde: impaga.vence };

  const cierra = cierreDeLaVentana(a);
  if (hoy > cierra) {
    const motivo = a.tipo === 'treinta' ? 'venció su ventana' : 'terminaron los noventa días';
    return { abierto: false, motivo, desde: cierra };
  }
  const restantes = Math.round((aFecha(cierra).getTime() - aFecha(hoy).getTime()) / DIA) + 1;
  return { abierto: true, cierraEl: cierra, diasRestantes: Math.max(0, restantes) };
}

/**
 * Entró el pago: se reabre y se le devuelven los días que estuvo cerrado.
 * Sus jornadas quedan donde estaban; lo que se corre son las fechas.
 */
export function reabrirConPago(a: Acceso, vence: string, hoy: string = aISO(new Date())): Acceso {
  const cerrado = Math.max(0, Math.round((aFecha(hoy).getTime() - aFecha(vence).getTime()) / DIA));
  return {
    ...a,
    cuotas: (a.cuotas ?? []).map((c) => (c.vence === vence ? { ...c, pagada: true } : c)),
    diasDevueltos: (a.diasDevueltos ?? 0) + cerrado,
  };
}

/** El acceso tal como está cargado en su perfil. */
export function accesoDelPerfil(perfil?: {
  acceso_tipo?: string;
  acceso_cuotas?: Cuota[];
  acceso_dias_devueltos?: number;
  fecha_inicio?: string;
} | null): Acceso | null {
  if (!perfil?.fecha_inicio) return null;
  // Sin `??`: un campo vacío tiene que caer en noventa, igual que uno ausente.
  const cargado = perfil.acceso_tipo;
  const tipo: TipoDeAcceso = cargado === 'treinta' || cargado === 'cuotas' ? cargado : 'noventa';
  return {
    tipo,
    inicio: perfil.fecha_inicio,
    cuotas: perfil.acceso_cuotas,
    diasDevueltos: perfil.acceso_dias_devueltos,
  };
}
