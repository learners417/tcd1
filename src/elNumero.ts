/**
 * adnPiezas.ts — LA TAXONOMÍA ÚNICA DEL ADN (ZIP B).
 *
 * Una sola lista, consumida por la página ADN y por la Cadena de HOY.
 * Cada pieza dice EXACTO en qué sesión se completa — y esa sesión es la
 * única forma de cambiarla: lo sellado no se edita por fuera, se rehace.
 *
 * 9 piezas del ALMA (el ikigai, en orden causal) + 5 ACTIVOS de operación.
 */

export type GrupoPieza = 'alma' | 'activo';
export type PlanPieza = 'elnumero' | 'completo';

export interface PiezaADN {
  id: string;
  titulo: string;
  /** Qué es, en una línea — el resultado, no el concepto. */
  que: string;
  /** Dónde se sella. 'onboarding' = las siembras del primer día. */
  sesion: string;
  grupo: GrupoPieza;
  plan: PlanPieza;
  /** Cómo saber si ya está sellada. */
  chequeo: { origen?: 'porque' | 'herida' | 'paciente'; sello?: string; campo?: string; progreso?: string };
}

export const PIEZAS_ADN: PiezaADN[] = [
  // ─────────── EL ALMA (9) — el orden causal del ikigai ───────────
  { id: 'historia', titulo: 'Tu Historia', que: 'de dónde vienes y por qué esta profesión',
    sesion: 'Tu origen · el primer día', grupo: 'alma', plan: 'elnumero', chequeo: { origen: 'porque', sello: 'H-P1.3' } },
  { id: 'herida', titulo: 'Tu Herida Sanada', que: 'lo que atravesaste y hoy sabes curar',
    sesion: 'Tu origen · el primer día', grupo: 'alma', plan: 'elnumero', chequeo: { origen: 'herida' } },
  { id: 'dones', titulo: 'Tus Dones', que: 'lo que haces distinto sin darte cuenta',
    sesion: 'Tu origen · el primer día', grupo: 'alma', plan: 'elnumero', chequeo: { origen: 'paciente' } },
  { id: 'precio', titulo: 'Tu Precio Digno', que: 'el número que sale de tu meta, no de tu miedo',
    sesion: 'Día 5 · EL NÚMERO', grupo: 'alma', plan: 'elnumero', chequeo: { progreso: '1-P1.5' } },
  { id: 'proposito', titulo: 'Tu Propósito', que: 'lo que sostiene el precio cuando tiemblas',
    sesion: 'Tu creencia nueva y el Estandarte', grupo: 'alma', plan: 'completo', chequeo: { progreso: '1-P1.6', campo: 'proposito' } },
  { id: 'avatar', titulo: 'A Quién Sirves', que: 'el paciente exacto que paga sin dudar',
    sesion: 'Tu paciente ideal · los 3 mejores', grupo: 'alma', plan: 'completo', chequeo: { campo: 'avatar_cliente', progreso: '2-P2.3' } },
  { id: 'puv', titulo: 'Tu PUV', que: 'la frase que te separa de todos los demás',
    sesion: 'Tu PUV · la frase que te define', grupo: 'alma', plan: 'completo', chequeo: { campo: 'posicionamiento', sello: 'H-P5.2' } },
  { id: 'metodo', titulo: 'Tu Método', que: 'tu proceso con nombre — dejas de vender horas',
    sesion: 'Genera tu método · nombre + pasos', grupo: 'alma', plan: 'completo', chequeo: { campo: 'metodo_nombre', sello: 'H-P7.3' } },
  { id: 'oferta', titulo: 'Tu Oferta', que: 'el programa completo que se cobra en miles',
    sesion: 'Diseña tu oferta principal', grupo: 'alma', plan: 'completo', chequeo: { campo: 'oferta_mid', sello: 'H-P8.2' } },

  // ─────────── LOS ACTIVOS (5) — lo que opera todos los días ───────────
  { id: 'guardian', titulo: 'Tu Guardián del Precio', que: 'las 10 respuestas para cuando cuestionen tu número',
    sesion: 'Día 5 · El Guardián del Precio', grupo: 'activo', plan: 'elnumero', chequeo: { sello: 'H-P1.5b', progreso: '1-P1.5b' } },
  { id: 'matriz', titulo: 'Tu Matriz ABC', que: 'el dolor, lo que falló y la transformación — en sus palabras',
    sesion: 'Tu Matriz ABC', grupo: 'activo', plan: 'completo', chequeo: { sello: 'H-P6.3', progreso: '2-P2.3b' } },
  { id: 'mensaje', titulo: 'Tu Mensaje', que: 'el gancho que atrae a tu paciente ideal',
    sesion: 'El mensaje que atrae a TU paciente', grupo: 'activo', plan: 'completo', chequeo: { progreso: '4-P4.2' } },
  { id: 'script', titulo: 'Tu Script de Ventas', que: 'la conversación que cierra sin empujar',
    sesion: 'Tu script de ventas propio', grupo: 'activo', plan: 'completo', chequeo: { progreso: '5-P5.2' } },
  { id: 'protocolo', titulo: 'Tu Protocolo de Entrega', que: 'cómo entregas sin quemarte',
    sesion: 'Tu protocolo de entrega', grupo: 'activo', plan: 'completo', chequeo: { progreso: '6-P6.2' } },
];

/* ══════════ Lectura del estado (local-first, sin red) ══════════ */

function leerJSON<T>(clave: string, porDefecto: T): T {
  try { return JSON.parse(localStorage.getItem(clave) ?? '') as T; } catch { return porDefecto; }
}

export function planLimitado(): boolean {
  try {
    const p = localStorage.getItem('tcd_plan') || (leerJSON<{ plan?: string }>('tcd_profile', {}).plan ?? '');
    return p === 'ELNUMERO';
  } catch { return false; }
}

/** ¿Está sellada esta pieza? Con la fecha del sello si la hay. */
export function estadoPieza(p: PiezaADN): { sellada: boolean; fecha?: string; bloqueada: boolean } {
  const bloqueada = p.plan === 'completo' && planLimitado();
  const origen = leerJSON<Record<string, string>>('tcd_origen_v1', {});
  const sellos = leerJSON<Record<string, { fecha?: string }>>('tcd_adn_sellos_v1', {});
  const perfil = leerJSON<Record<string, unknown>>('tcd_profile', {});
  const hechas = leerJSON<string[]>('tcd_hoja_ruta_v2', []);

  let sellada = false;
  let fecha: string | undefined;
  if (p.chequeo.origen && String(origen[p.chequeo.origen] ?? '').trim()) sellada = true;
  if (p.chequeo.sello && sellos[p.chequeo.sello]) { sellada = true; fecha = sellos[p.chequeo.sello]?.fecha; }
  if (p.chequeo.campo && String(perfil[p.chequeo.campo] ?? '').trim()) sellada = true;
  if (p.chequeo.progreso && Array.isArray(hechas) && hechas.includes(p.chequeo.progreso)) sellada = true;

  return { sellada, fecha, bloqueada };
}

export function resumenADN(): { selladas: number; total: number; disponibles: number } {
  const estados = PIEZAS_ADN.map(estadoPieza);
  return {
    selladas: estados.filter((e) => e.sellada).length,
    total: PIEZAS_ADN.length,
    disponibles: estados.filter((e) => !e.bloqueada).length,
  };
}
