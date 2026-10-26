/**
 * planes.ts — La escalera comercial de cinturones (los 5 días y los 3 planes)
 * Regla de la casa: en la UI jamás se dice "trial" ni "prueba" — es "Tus 5 días".
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
 * VITE_CHECKOUT_VERDE, VITE_CHECKOUT_NEGRO → pegas el link del order form y
 * redeploy. Con la URL vacía, el candado cae al WhatsApp de siempre
 * (degradación elegante) hasta que la configures.
 */
// Fuera del navegador (pruebas, scripts) estas variables no existen: se leen
// con cuidado para que importar este archivo nunca rompa nada.
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
export const CHECKOUT_URL: Record<'amarillo' | 'verde' | 'negro', string> = {
  amarillo: env.VITE_CHECKOUT_AMARILLO || '', // Tu Base $147
  verde: env.VITE_CHECKOUT_VERDE || '',       // Tu Sistema $497
  negro: env.VITE_CHECKOUT_NEGRO || '',       // El Completo $997
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

/**
 * El plan de acceso que de verdad compró, si compró uno.
 *
 * `plan` y `plan_comercial` son dos columnas distintas: la primera dice por
 * dónde entró ('ELNUMERO', 'DWY', …) y **nadie la limpia nunca**; la segunda
 * dice qué acceso tiene hoy y la escribe el checkout o el equipo.
 */
function planPagado(perfil?: Partial<Profile> | null): PlanComercial | null {
  const p = perfil?.plan_comercial;
  return (p === 'blanco' || p === 'amarillo' || p === 'verde' || p === 'negro') ? p : null;
}

export function planDe(perfil?: Partial<Profile> | null): PlanComercial {
  /*
   * LO QUE PAGÓ MANDA.
   *
   * Acá se preguntaba primero por `plan === 'ELNUMERO'` y se devolvía
   * 'blanco' sin mirar nada más. Y `plan` no se limpia cuando alguien sube de
   * escalón: así que el que entraba por los $27 y después pagaba La Base
   * **seguía viendo el Camino cortado en el día 5**, con el candado del día 6
   * puesto, justo después de pagar. Pasaba igual si el equipo le abría el
   * acceso a mano desde el Admin.
   *
   * Un `plan_comercial` pago solo lo escribe el checkout o una persona del
   * equipo: si está, es la verdad más nueva y le gana a por dónde entró.
   */
  const pago = planPagado(perfil);
  if (pago) return pago;
  // EL NÚMERO ($27, alta automática) = los 5 días: mismo tramo, mismo tope
  if ((perfil as { plan?: string } | undefined)?.plan === 'ELNUMERO') return 'blanco';
  return 'completo';
}

/**
 * El plan de este cliente, mire o no la base.
 *
 * `planDe` solo sabe lo que diga el perfil que le pasan, y ese perfil viene
 * de Supabase: en App.tsx es `null` mientras la base no contesta y queda en
 * `null` si no contesta nunca. Entonces `planDe(undefined)` caía en su
 * respaldo de 'completo' y el candado comercial del Camino se abría solo —
 * sin internet, con un error de red, o en el modo sin base. El contenido de
 * las sesiones viaja en el paquete de la app, así que ahí quedaba todo a la
 * vista.
 *
 * El orden es el mismo de siempre, lo que pagó manda: si el perfil llegó, su
 * plan es la verdad más nueva; si no llegó, vale el espejo que `auth.ts`
 * escribe en localStorage al entrar. Y si no hay ninguno de los dos, se abre:
 * a nadie se le cierra el Camino por un fallo técnico — ese bug ya pasó una
 * vez, con el que pagaba La Base y seguía viendo el día 5 con candado.
 */
export function planDelCliente(perfil?: Partial<Profile> | null): PlanComercial {
  if (perfil?.plan_comercial || perfil?.plan) return planDe(perfil);
  return planActual();
}

/**
 * ¿Está en el tramo de los $27 y todavía no subió?
 *
 * La pregunta que importa no es «entró por EL NÚMERO» —eso queda escrito para
 * siempre— sino «su acceso es el de los 5 días y nada más». Vivía repetida en
 * cuatro lugares, cada uno leyendo `plan` a su manera, y ninguno miraba si
 * había pagado algo arriba.
 */
export function enElTramoDelNumero(perfil?: Partial<Profile> | null): boolean {
  if (planPagado(perfil)) return false;
  return String((perfil as { plan?: string } | undefined)?.plan ?? '') === 'ELNUMERO';
}

/** La misma pregunta, leyendo el perfil guardado (sin perfil a mano). */
export function enElTramoDelNumeroLocal(): boolean {
  try {
    const perfil = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}') as Partial<Profile>;
    const crudo = localStorage.getItem('tcd_plan') || '';
    return enElTramoDelNumero({ ...perfil, ...(crudo ? { plan: crudo } as Partial<Profile> : {}) });
  } catch { return false; }
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
/**
 * Estos números se fijaron cuando la IA se veía como el costo del negocio.
 * Con el criterio actual —el costo es el tiempo humano, no los modelos— el
 * tope no está para racionar: está para frenar el abuso. Un cliente que
 * conversa mucho con su Mentor gasta unos pocos dólares y probablemente le
 * esté sacando más provecho a la app que uno que entra dos veces.
 *
 * LA AUTORIDAD ES EL SERVIDOR: estos valores son solo un aviso rápido en
 * pantalla. El freno real vive en api/_lib/uso-server.ts (TOPES_SEMANA) y
 * tiene que dar los mismos números — lo verifica la lente 6.6 de auditoria.py.
 */
export const TOPE_MENTOR_SEMANAL = 200;
export const TOPE_AGENTE_SEMANAL = 150;

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
    // Mismo orden que planDe: lo que pagó le gana a por dónde entró.
    return planDe({ ...perfil, plan: (crudo || perfil.plan) } as Partial<Profile>);
  } catch { return 'completo'; }
}

/** ¿Este plan llega a ese pilar? (versión sin perfil a mano) */
export function planActualPermite(pilarNum: number): boolean {
  return planPermitePilar(planActual(), pilarNum);
}
