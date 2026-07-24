/**
 * EL NÚMERO — el registro base de la Semana Blanca.
 * Todas las herramientas leen/escriben de acá.
 * Persiste en Supabase (tabla `el_numero`) con respaldo en localStorage
 * para que funcione al instante y sea resiliente si falla la red.
 */
import { supabase, guardarFila } from './supabase';

export interface ElNumero {
  precio_sesion: number;
  pacientes_semana: number;
  horas_semana: number;
  phr: number;
  precio_nuevo: number | null;
  fecha_cambio: string | null;
}

const LS_KEY = 'tcd_el_numero';

export function calcPHR(precioSesion: number, pacientesSemana: number, horasSemana: number): number {
  if (!horasSemana) return 0;
  return Math.round((precioSesion * pacientesSemana) / horasSemana);
}

/** El agujero anual: lo que se pierde por cobrar por debajo del PHR (como en la landing). */
export function agujeroAnual(precioSesion: number, phr: number, horasSemana: number): number {
  return Math.max(0, Math.round((precioSesion - phr) * horasSemana * 48));
}

/** Ganancia extra al año con el precio nuevo (estimación, no promesa). */
export function gananciaAnual(precioNuevo: number, precioSesion: number, pacientesSemana: number): number {
  return Math.max(0, Math.round((precioNuevo - precioSesion) * pacientesSemana * 48));
}

/** Ganancia extra al mes con el precio nuevo (estimación). */
export function gananciaMensual(precioNuevo: number, precioSesion: number, pacientesSemana: number): number {
  return Math.max(0, Math.round((precioNuevo - precioSesion) * pacientesSemana * 4));
}

export function emptyNumero(): ElNumero {
  return { precio_sesion: 0, pacientes_semana: 0, horas_semana: 0, phr: 0, precio_nuevo: null, fecha_cambio: null };
}

export async function getElNumero(userId?: string): Promise<ElNumero | null> {
  // Supabase primero
  try {
    if (supabase && userId) {
      const { data } = await supabase.from('el_numero').select('*').eq('usuario_id', userId).maybeSingle();
      if (data) return data as unknown as ElNumero;
    }
  } catch { /* cae al respaldo */ }
  // Respaldo local
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as ElNumero;
  } catch { /* noop */ }
  return null;
}

export async function saveElNumero(userId: string | undefined, n: ElNumero): Promise<void> {
  // Local siempre (instantáneo)
  try { localStorage.setItem(LS_KEY, JSON.stringify(n)); } catch { /* noop */ }
  // Supabase si se puede
  try {
    if (supabase && userId) {
      await guardarFila('el_numero', { usuario_id: userId, ...n }, ['usuario_id']);
    }
  } catch { /* el local ya guardó */ }
}

/** Cuántas personas de la cohorte subieron su precio esta semana (efecto "el grupo, vivo"). */
export async function contarSubieronPrecioSemana(): Promise<number> {
  try {
    if (!supabase) return 0;
    const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('el_numero')
      .select('usuario_id', { count: 'exact', head: true })
      .gte('fecha_cambio', desde);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * EL NÚMERO es la puerta 1 del Camino: al definir su precio nuevo, el
 * comprador del taller gana su primera punta de cinturón (blanco punta
 * amarilla) y ve el resto del Camino. Marca P1.5 en la hoja de ruta
 * (DB + local) y registra el hito. Idempotente y tolerante a fallos.
 */
export async function marcarNumeroEnElCamino(userId?: string | null): Promise<void> {
  // Local primero: el cinturón visual se deriva de acá al instante.
  try {
    const raw = localStorage.getItem('tcd_hoja_ruta_v2');
    const arr: string[] = raw ? JSON.parse(raw) : [];
    if (!arr.includes('1-P1.5')) {
      arr.push('1-P1.5');
      localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(arr));
    }
  } catch { /* noop */ }

  if (!supabase || !userId) return;
  try {
    await guardarFila('hoja_de_ruta', {
        usuario_id: userId,
        pilar_numero: 1,
        meta_codigo: 'P1.5',
        completada: true,
        es_estrella: false,
        fecha_completada: new Date().toISOString().split('T')[0],
      }, ['usuario_id', 'pilar_numero', 'meta_codigo']);
    await supabase.from('hitos_cinturon').insert([{
        usuario_id: userId,
        cinturon: 'blanco_punta_amarilla',
        fase: 1,
        tipo_verificacion: 'automatico',
        estado: 'aprobado',
        agente: 'coach',
        feedback_agente: 'EL NÚMERO completado: precio digno definido.',
        aprobado_at: new Date().toISOString(),
      }]); // duplicados: se ignoran
    const { data: prof } = await supabase.from('profiles').select('cinturon').eq('id', userId).single();
    if (!prof?.cinturon || prof.cinturon === 'blanco') {
      await supabase.from('profiles').update({ cinturon: 'blanco_punta_amarilla' }).eq('id', userId);
    }
  } catch { /* red o RLS: no bloquea la herramienta */ }
}
