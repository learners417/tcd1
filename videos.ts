/**
 * planes.ts — La escalera comercial de cinturones (los 5 días y los 3 planes)
 * Regla del dojo: en la UI jamás se dice "trial" ni "prueba" — es "Tus 5 días".
 */
import type { Profile } from './supabase';

export type PlanComercial = 'blanco' | 'amarillo' | 'verde' | 'negro' | 'completo';

/** Hasta qué pilar del Camino llega cada plan (inclusive). */
export const PILAR_MAX: Record<PlanComercial, number> = {
  blanco: 1,      // los 5 días: Sanar el Dinero (P0 + P1)
  amarillo: 2,    // Tu Base: + método bautizado (P2)
  verde: 4,       // Tu Sistema: + oferta, perfil, sistema, campaña (P3-P4)
  negro: 99,      // El Programa Completo
  completo: 99,   // los clientes actuales
};

export const NOMBRE_PLAN: Record<PlanComercial, string> = {
  blanco: 'Los 5 días',
  amarillo: 'Tu Base',
  verde: 'Tu Sistema',
  negro: 'El Programa Completo',
  completo: 'El Programa Completo',
};

export const PRECIO_FUNDADOR: Record<string, string> = {
  verde: '$497', negro: '$997',
};

/**
 * URLs de checkout self-serve (order forms de GHL, con PayPal). AC1.
 * Se configuran en Vercel (sin tocar código): VITE_CHECKOUT_AMARILLO,
 * VITE_CHECKOUT_VERDE, VITE_CHECKOUT_NEGRO → pegás el link del order form y
 * redeploy. Con la URL vacía, el candado cae al WhatsApp de siempre
 * (degradación elegante) hasta que la configures.
 */
export const CHECKOUT_URL: Record<'amarillo' | 'verde' | 'negro', string> = {
  amarillo: import.meta.env.VITE_CHECKOUT_AMARILLO || '', // Tu Base $147
  verde: import.meta.env.VITE_CHECKOUT_VERDE || '',       // Tu Sistema $497
  negro: import.meta.env.VITE_CHECKOUT_NEGRO || '',       // El Completo $997
};

/** El plan mínimo (comprable) que desbloquea ese pilar. */
export function planParaPilar(pilarNum: number): 'verde' | 'negro' {
  // La escalera que se vende dentro de la app: $497 (Tu Sistema, hasta P4) y
  // $997 (El Programa Completo). 'amarillo' queda solo para clientes antiguos.
  if (pilarNum <= PILAR_MAX.verde) return 'verde';
  return 'negro';
}

/** La URL de checkout de un plan (vacía si todavía no la configuraste). */
export function checkoutUrl(plan: 'amarillo' | 'verde' | 'negro'): string {
  return CHECKOUT_URL[plan] || '';
}

/** Tope de mensajes del Mentor durante los 5 días. */
export const TOPE_MENTOR_BLANCO = 30;

export const WHATSAPP_TCD = '5492944411854';
export const waLink = (texto: string) => `https://wa.me/${WHATSAPP_TCD}?text=${encodeURIComponent(texto)}`;

export function planDe(perfil?: Partial<Profile> | null): PlanComercial {
  // EL NÚMERO ($27, alta automática) = los 5 días: mismo tramo, mismo tope
  if ((perfil as { plan?: string } | undefined)?.plan === 'ELNUMERO') return 'blanco';
  const p = perfil?.plan_comercial;
  return (p === 'blanco' || p === 'amarillo' || p === 'verde' || p === 'negro') ? p : 'completo';
}

export function planPermitePilar(plan: PlanComercial, pilarNum: number): boolean {
  return pilarNum <= PILAR_MAX[plan];
}

/** Días restantes de acceso (null = sin límite). */
export function diasRestantes(perfil?: Partial<Profile> | null): number | null {
  const h = perfil?.acceso_hasta;
  if (!h) return null;
  const diff = new Date(h).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function accesoVencido(perfil?: Partial<Profile> | null): boolean {
  const d = diasRestantes(perfil);
  return d !== null && d <= 0 && planDe(perfil) === 'blanco';
}

/* ══════════ LA ESCASEZ QUE ENSEÑA — límites semanales de IA ══════════
 * El Mentor y los entrenadores no son asistentes infinitos: son maestros.
 * Presupuesto semanal visible, reset los lunes. (La Semana Blanca conserva
 * su tope total de 30 — su sistema propio.) */
export const TOPE_MENTOR_SEMANAL = 10;
export const TOPE_AGENTE_SEMANAL = 5;

function claveSemana(): string {
  const d = new Date();
  const jueves = new Date(d); jueves.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const inicio = new Date(jueves.getFullYear(), 0, 1);
  const sem = Math.ceil(((+jueves - +inicio) / 86400000 + 1) / 7);
  return `${jueves.getFullYear()}-W${sem}`;
}

function leerUsos(): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem('tcd_usos_ia_v1') ?? '{}');
    if (raw?.semana === claveSemana()) return raw.usos ?? {};
  } catch { /* noop */ }
  return {};
}

/** Cuántos usos lleva esta semana la clave dada ('mentor' o 'agente_<id>'). */
export function usosSemana(clave: string): number {
  return leerUsos()[clave] ?? 0;
}

/** Registra un uso. Devuelve el total tras registrar. */
export function consumirUso(clave: string): number {
  const usos = leerUsos();
  usos[clave] = (usos[clave] ?? 0) + 1;
  try { localStorage.setItem('tcd_usos_ia_v1', JSON.stringify({ semana: claveSemana(), usos })); } catch { /* noop */ }
  return usos[clave];
}


/** El plan de quien está usando la app ahora (lee el perfil guardado). */
export function planActual(): PlanComercial {
  try {
    const crudo = localStorage.getItem('tcd_plan') || '';
    const perfil = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}') as { plan?: string; plan_comercial?: string };
    const plan = crudo || perfil.plan || '';
    if (plan === 'ELNUMERO') return 'blanco';
    const pc = perfil.plan_comercial;
    return (pc === 'blanco' || pc === 'amarillo' || pc === 'verde' || pc === 'negro') ? pc : 'completo';
  } catch { return 'completo'; }
}

/** ¿Este plan llega a ese pilar? (versión sin perfil a mano) */
export function planActualPermite(pilarNum: number): boolean {
  return planPermitePilar(planActual(), pilarNum);
}
