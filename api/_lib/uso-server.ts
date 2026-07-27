/**
 * GUARDIÁN DE USO — el freno de lo que NO cobra crédito.
 *
 * La app tiene dos frenos distintos y conviene no mezclarlos:
 *
 *   CRÉDITOS  → las herramientas de PRODUCCIÓN (constructor, copy, creativo,
 *               imagen). Son las que fabrican lo que el cliente publica.
 *               Se cobran, se compran y se reponen. Viven en credits-server.
 *
 *   TOPES     → el Mentor, los Entrenadores y los pasos del Camino. NO se
 *               cobran: racionar el acompañamiento sería cobrarle por hacer
 *               el programa que ya pagó. Pero sin ningún freno son un canal
 *               de IA abierto, y eso hay que evitarlo. Viven acá.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO: los topes estaban en `localStorage`
 * (tcd_usos_ia_v1). Un contador en el navegador del cliente no es un tope:
 * se borra desde las herramientas del navegador, o se esquiva abriendo otro.
 * El freno tiene que estar donde el cliente no llega.
 *
 * DEGRADACIÓN A PROPÓSITO: si la tabla de uso todavía no existe en la base,
 * esto DEJA PASAR y avisa por consola. Un freno a medio instalar nunca puede
 * dejar sin Mentor a un cliente que pagó.
 */

import { getAdminClient } from './credits-server.js';
import { planDelUsuario } from './gasto-server.js';

/**
 * Topes por ventana de 7 días.
 *
 * Están altos a propósito. Los números viejos (10 consultas por semana) se
 * fijaron cuando la IA se veía como el costo del negocio. Con el criterio
 * actual —el costo es el tiempo humano, no los modelos— el tope no está para
 * racionar: está para frenar el abuso. Un cliente que conversa 200 veces por
 * semana con su Mentor gasta unos pocos dólares y probablemente esté sacándole
 * más provecho a la app que uno que entra dos veces.
 */
export const TOPES_SEMANA: Record<string, number> = {
  mentor: 200,
  agentes: 150,
  sesion: 200,
};

/** Techo duro por día, contra bucles y scripts. */
export const TOPE_DIA_TOTAL = 400;

export interface ResultadoTope {
  permitido: boolean;
  /** Cuántos usos quedan en la ventana. null = no se pudo medir. */
  restantes: number | null;
  motivo?: 'tope_semana' | 'tope_dia';
  /** true = la base no tiene la tabla todavía y se dejó pasar. */
  sinMedir?: boolean;
}

/**
 * Registra un uso y dice si se puede seguir.
 *
 * Nunca lanza: un problema de infraestructura no puede dejar a un cliente
 * sin su Mentor. Ante la duda, deja pasar y lo deja escrito en el log.
 */
export async function registrarUso(
  userId: string,
  clave: string,
): Promise<ResultadoTope> {
  const topeSemana = TOPES_SEMANA[clave] ?? null;

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.rpc('registrar_uso_ia', {
      p_user_id: userId,
      p_clave: clave,
      p_tope_semana: topeSemana,
      p_tope_dia: TOPE_DIA_TOTAL,
    });

    if (error) {
      // La RPC todavía no existe (SQL sin correr) o falló: se deja pasar.
      console.warn('[uso] registrar_uso_ia no disponible — se deja pasar:', error.message);
      return { permitido: true, restantes: null, sinMedir: true };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { permitido: true, restantes: null, sinMedir: true };

    return {
      permitido: Boolean(row.permitido),
      restantes: typeof row.restantes_semana === 'number' ? row.restantes_semana : null,
      motivo: row.motivo ?? undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[uso] no se pudo registrar — se deja pasar:', msg);
    return { permitido: true, restantes: null, sinMedir: true };
  }
}

/**
 * Qué freno le corresponde a cada herramienta.
 *
 * CRÉDITO: fabrica algo que el cliente publica y que le cuesta plata promocionar.
 * TOPE: acompaña, explica o conversa.
 */
export const FEATURES_CON_CREDITO = new Set([
  'constructor', 'copy', 'creativo', 'stories', 'imagen',
]);

/**
 * Map y no objeto plano A PROPÓSITO. Un objeto literal hereda del prototipo:
 * `obj['toString']` y `obj['constructor']` devuelven funciones, no undefined.
 * Con un objeto, frenoDe('toString') respondía 'tope' y claveTopeDe('constructor')
 * devolvía una función que después viajaba a la base como si fuera una clave.
 * Un Map solo tiene lo que se le puso.
 */
export const FEATURES_CON_TOPE = new Map<string, string>([
  ['mentor', 'mentor'],
  ['coach', 'mentor'],
  ['agente', 'agentes'],
  ['agentes', 'agentes'],
  ['sesion', 'sesion'],
  ['camino', 'sesion'],
  ['campana_chat', 'mentor'],
]);

/** Devuelve qué freno aplica: 'credito', 'tope' o null (libre). */
export function frenoDe(feature: unknown): 'credito' | 'tope' | null {
  const f = String(feature ?? '').toLowerCase();
  if (!f) return null;
  if (FEATURES_CON_CREDITO.has(f)) return 'credito';
  if (FEATURES_CON_TOPE.has(f)) return 'tope';
  return null;
}

export function claveTopeDe(feature: unknown): string | null {
  const f = String(feature ?? '').toLowerCase();
  return FEATURES_CON_TOPE.get(f) ?? null;
}


/**
 * El tope del plan blanco: 30 consultas al Mentor EN TOTAL, no por semana.
 *
 * No es una decisión de costo: es lo que promete la landing del $27. Por eso
 * el número no se toca. Lo que cambia es DÓNDE se aplica: hasta ahora vivía
 * en el navegador del cliente y se esquivaba borrando el almacenamiento
 * local. Ahora el servidor conoce el plan y cuenta de verdad.
 */
export const TOPE_TOTAL_BLANCO = 30;

export async function verificarTopeBlanco(
  userId: string,
  clave: string,
): Promise<{ permitido: boolean; usados: number | null }> {
  if (clave !== 'mentor') return { permitido: true, usados: null };

  const plan = await planDelUsuario(userId);
  if (plan !== 'blanco') return { permitido: true, usados: null };

  try {
    const admin = getAdminClient();
    const { count, error } = await admin
      .from('uso_ia')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('clave', 'mentor');

    if (error) {
      console.warn('[uso] no se pudo contar el total del plan blanco:', error.message);
      return { permitido: true, usados: null };
    }
    const usados = count ?? 0;
    return { permitido: usados < TOPE_TOTAL_BLANCO, usados };
  } catch (err) {
    console.warn('[uso] error contando el plan blanco:', err instanceof Error ? err.message : err);
    return { permitido: true, usados: null };
  }
}
