/**
 * planes.ts — La escalera comercial de cinturones (la Semana Blanca y los 3 planes)
 * Regla del dojo: en la UI jamás se dice "trial" ni "prueba" — es "Tu Semana Blanca".
 */
import type { Profile } from './supabase';

export type PlanComercial = 'blanco' | 'amarillo' | 'verde' | 'negro' | 'completo';

/** Hasta qué pilar del Camino llega cada plan (inclusive). */
export const PILAR_MAX: Record<PlanComercial, number> = {
  blanco: 1,      // la Semana Blanca: Sanar el Dinero (P0 + P1)
  amarillo: 2,    // Tu Base: + método bautizado (P2)
  verde: 4,       // Tu Sistema: + oferta, perfil, sistema, campaña (P3-P4)
  negro: 99,      // El Programa Completo
  completo: 99,   // los clientes actuales
};

export const NOMBRE_PLAN: Record<PlanComercial, string> = {
  blanco: 'Semana Blanca',
  amarillo: 'Tu Base',
  verde: 'Tu Sistema',
  negro: 'El Programa Completo',
  completo: 'El Programa Completo',
};

export const PRECIO_FUNDADOR: Record<string, string> = {
  amarillo: '$147', verde: '$497', negro: '$997',
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
export function planParaPilar(pilarNum: number): 'amarillo' | 'verde' | 'negro' {
  if (pilarNum <= PILAR_MAX.amarillo) return 'amarillo';
  if (pilarNum <= PILAR_MAX.verde) return 'verde';
  return 'negro';
}

/** La URL de checkout de un plan (vacía si todavía no la configuraste). */
export function checkoutUrl(plan: 'amarillo' | 'verde' | 'negro'): string {
  return CHECKOUT_URL[plan] || '';
}

/** Tope de mensajes del Mentor durante la Semana Blanca. */
export const TOPE_MENTOR_BLANCO = 30;

export const WHATSAPP_TCD = '5492944411854';
export const waLink = (texto: string) => `https://wa.me/${WHATSAPP_TCD}?text=${encodeURIComponent(texto)}`;

export function planDe(perfil?: Partial<Profile> | null): PlanComercial {
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
