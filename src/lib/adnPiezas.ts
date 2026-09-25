/**
 * adnPiezas.ts — LA TAXONOMÍA ÚNICA DEL ADN (ZIP B).
 *
 * Una sola lista, consumida por la página ADN y por la Cadena de HOY.
 * Cada pieza dice EXACTO en qué sesión se completa — y esa sesión es la
 * única forma de cambiarla: lo sellado no se edita por fuera, se rehace.
 *
 * 9 piezas del ALMA (el ikigai, en orden causal) + 5 ACTIVOS de operación.
 */

import { planActualPermite } from './planes';
import { SEED_ROADMAP_V2 } from './roadmapSeed';

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
  /** Pilar del Camino donde se sella — el plan decide si está a su alcance. */
  pilar: number;
  /** Cómo saber si ya está sellada. */
  chequeo: {
    origen?: 'porque' | 'herida' | 'paciente';
    sello?: string;
    campo?: string;
    progreso?: string;
    /**
     * La clave que escribe el Camino (`adn_escribe`). Es el chequeo que manda:
     * los códigos viejos quedaron obsoletos cuando cambió el Camino y el ADN
     * dejaba de sellarse aunque el cliente hiciera todo.
     */
    clave?: string;
  };
}

export const PIEZAS_ADN: PiezaADN[] = [
  // ─────────── EL ALMA (9) — el orden causal del ikigai ───────────
  { id: 'historia', titulo: 'Tu Historia', que: 'de dónde vienes y por qué esta profesión',
    sesion: 'Tu origen · el primer día', grupo: 'alma', plan: 'elnumero', pilar: 0, chequeo: {origen: 'porque', clave: 'historia.por_que_empezo' } },
  { id: 'herida', titulo: 'Tu Herida Sanada', que: 'lo que atravesaste y hoy sabes curar',
    sesion: 'Tu origen · el primer día', grupo: 'alma', plan: 'elnumero', pilar: 0, chequeo: { origen: 'herida' } },
  { id: 'dones', titulo: 'Tus Dones', que: 'lo que haces distinto sin darte cuenta',
    sesion: 'Tu origen · el primer día', grupo: 'alma', plan: 'elnumero', pilar: 0, chequeo: { origen: 'paciente' } },
  { id: 'precio', titulo: 'Tu Precio Digno', que: 'el número que sale de tu meta, no de tu miedo',
    sesion: 'Día 5 · EL NÚMERO', grupo: 'alma', plan: 'elnumero', pilar: 1, chequeo: {clave: 'numeros.precio_digno' } },
  { id: 'proposito', titulo: 'Tu Propósito', que: 'lo que sostiene el precio cuando tiemblas',
    sesion: 'Tu creencia nueva y el Estandarte', grupo: 'alma', plan: 'completo', pilar: 1, chequeo: {campo: 'proposito', clave: 'identidad' } },
  { id: 'avatar', titulo: 'A Quién Sirves', que: 'el {{consultante}} exacto que paga sin dudar',
    sesion: 'Tu paciente ideal · los 3 mejores', grupo: 'alma', plan: 'completo', pilar: 2, chequeo: {campo: 'avatar_cliente', clave: 'avatar.matriz_abc' } },
  { id: 'puv', titulo: 'Tu PUV', que: 'la frase que te separa de todos los demás',
    sesion: 'Tu PUV · la frase que te define', grupo: 'alma', plan: 'completo', pilar: 2, chequeo: { campo: 'posicionamiento' } },
  { id: 'metodo', titulo: 'Tu Método', que: 'tu proceso con nombre — dejas de vender horas',
    sesion: 'Genera tu método · nombre + pasos', grupo: 'alma', plan: 'completo', pilar: 2, chequeo: {campo: 'metodo_nombre', clave: 'metodo.aprobado_por_critico' } },
  { id: 'oferta', titulo: 'Tu Oferta', que: 'el programa completo que se cobra en miles',
    sesion: 'Diseña tu oferta principal', grupo: 'alma', plan: 'completo', pilar: 3, chequeo: {campo: 'oferta_mid', clave: 'oferta' } },

  // ─────────── LOS ACTIVOS (5) — lo que opera todos los días ───────────
  { id: 'guardian', titulo: 'Tu Guardián del Precio', que: 'las 10 respuestas para cuando cuestionen tu número',
    sesion: 'Día 5 · El Guardián del Precio', grupo: 'activo', plan: 'elnumero', pilar: 1, chequeo: {clave: 'garantia' } },
  { id: 'matriz', titulo: 'Tu Matriz ABC', que: 'el dolor, lo que falló y la transformación — en sus palabras',
    sesion: 'Tu Matriz ABC', grupo: 'activo', plan: 'completo', pilar: 2, chequeo: {clave: 'avatar.matriz_abc' } },
  { id: 'mensaje', titulo: 'Tu Mensaje', que: 'el gancho que atrae a tu {{consultante}} ideal',
    sesion: 'El mensaje que atrae a TU paciente', grupo: 'activo', plan: 'completo', pilar: 4, chequeo: {clave: 'trafico.recurso' } },
  { id: 'script', titulo: 'Tu Script de Ventas', que: 'la conversación que cierra sin empujar',
    sesion: 'Tu script de ventas propio', grupo: 'activo', plan: 'completo', pilar: 5, chequeo: {clave: 'voz.objeciones_reales' } },
  { id: 'protocolo', titulo: 'Tu Protocolo de Entrega', que: 'cómo entregas sin quemarte',
    sesion: 'Tu protocolo de entrega', grupo: 'activo', plan: 'completo', pilar: 6, chequeo: {clave: 'entrega.estaciones' } },
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
/**
 * Las claves del ADN que ya quedaron escritas: salen de las jornadas completadas.
 * Una sola fuente, la del propio Camino, para que nunca más se desincronicen.
 */
export function clavesEscritas(): Set<string> {
  const hechas = new Set(leerJSON<string[]>('tcd_hoja_ruta_v2', []));
  const out = new Set<string>();
  for (const pilar of SEED_ROADMAP_V2) {
    for (const m of pilar.metas) {
      if (!hechas.has(`${pilar.numero}-${m.codigo}`)) continue;
      for (const k of m.adn_fields ?? []) out.add(k);
    }
  }
  return out;
}

export function estadoPieza(p: PiezaADN): { sellada: boolean; fecha?: string; bloqueada: boolean } {
  const bloqueada = !planActualPermite(p.pilar);
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
  if (p.chequeo.clave && clavesEscritas().has(p.chequeo.clave)) sellada = true;

  return { sellada, fecha, bloqueada };
}

export function resumenADN(): { selladas: number; total: number; disponibles: number } {
  const estados = PIEZAS_ADN.map(estadoPieza);
  return {
    selladas: estados.filter((e) => e.sellada).length,
    total: PIEZAS_ADN.length,
    disponibles: estados.filter((e) => !e.bloqueada).length };
}

/**
 * Lo que dice una pieza sellada, para poder leerlo en su tarjeta.
 *
 * Antes la tarjeta solo decía "Sellado": el cliente tenía que ir a buscar su
 * propio texto a la sesión donde lo escribió. Ver lo sellado no lo edita: para
 * cambiarlo se rehace su sesión, como siempre.
 */
export function contenidoDePieza(p: PiezaADN): string {
  const origen = leerJSON<Record<string, string>>('tcd_origen_v1', {});
  const perfil = leerJSON<Record<string, unknown>>('tcd_profile', {});
  const salidas = leerJSON<Record<string, { output?: string; texto?: string }>>('tcd_adn_sellos_v1', {});

  if (p.chequeo.origen) {
    const v = String(origen[p.chequeo.origen] ?? '').trim();
    if (v) return v;
  }
  if (p.chequeo.campo) {
    const v = perfil[p.chequeo.campo];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (v && typeof v === 'object') {
      const texto = Object.values(v as Record<string, unknown>)
        .filter((x) => typeof x === 'string' && String(x).trim())
        .join(' · ');
      if (texto) return texto;
    }
  }
  if (p.chequeo.sello) {
    const s = salidas[p.chequeo.sello];
    const v = (s?.output ?? s?.texto ?? '').trim();
    if (v) return v;
  }
  return '';
}

/**
 * Las piezas que el cliente puede escribir con sus palabras desde su tarjeta:
 * las del origen (historia, herida, dones). El resto sale de su sesión.
 */
export function esEscribibleAqui(p: PiezaADN): boolean {
  return Boolean(p.chequeo.origen);
}

/** Guarda una pieza del origen escrita desde su tarjeta. */
export function guardarOrigen(p: PiezaADN, texto: string): boolean {
  if (!esEscribibleAqui(p) || !p.chequeo.origen) return false;
  try {
    const origen = leerJSON<Record<string, string>>('tcd_origen_v1', {});
    origen[p.chequeo.origen] = texto.trim();
    localStorage.setItem('tcd_origen_v1', JSON.stringify(origen));
    return true;
  } catch { return false; }
}
