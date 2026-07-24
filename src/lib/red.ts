/**
 * red.ts — T12 · LA RED (Plan Maestro).
 * Dos capas: la Semana Blanca regalable (invitaciones con atribución, 2 llaves
 * por mes validadas server-side) y la Herencia de la cohorte (objeciones/hooks
 * reales, anónimos). Todo degrada con elegancia: sin las tablas/RPCs (que van
 * en la migración aparte), devuelve vacío y nunca rompe.
 */
import { supabase, isSupabaseReady } from './supabase';

// ── La Semana Blanca regalable ──────────────────────────────────────────────

export const LLAVES_POR_MES = 2;

/** Slot: el premio real por cada fundador que entra con tu llave. Ajusta el texto. */
export const PREMIO_TEXTO = 'un mes de MiClínica Digital sin cargo';

export type EstadoInvitacion = 'pendiente' | 'redimida';

export interface Invitacion {
  id: string;
  codigo: string;
  invitado_id: string | null;
  estado: EstadoInvitacion;
  created_at: string;
}

const INVITE_KEY = 'tcd_invite_code';

/** Genera una llave nueva (máx 2/mes, validado server-side). */
export async function generarInvitacion(): Promise<{ codigo?: string; error?: string }> {
  if (!isSupabaseReady() || !supabase) return { error: 'Sin conexión. Recargá e intenta de nuevo.' };
  try {
    const { data, error } = await supabase.rpc('generar_invitacion');
    if (error) {
      const lim = /limit|límite|cupo/i.test(error.message);
      return {
        error: lim
          ? `Ya usaste tus ${LLAVES_POR_MES} llaves este mes. Vuelven el mes que viene.`
          : 'No pudimos generar la llave. Intenta de nuevo.',
      };
    }
    const codigo = typeof data === 'string' ? data : (data as { codigo?: string })?.codigo;
    if (!codigo) return { error: 'No pudimos generar la llave. Intenta de nuevo.' };
    return { codigo };
  } catch {
    return { error: 'No pudimos generar la llave. Intenta de nuevo.' };
  }
}

/** Las invitaciones del fundador (propias). [] si no hay o sin conexión. */
export async function misInvitaciones(userId: string): Promise<Invitacion[]> {
  if (!isSupabaseReady() || !supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('invitaciones')
      .select('id, codigo, invitado_id, estado, created_at')
      .eq('invitador_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Invitacion[];
  } catch {
    return [];
  }
}

/** Cuántas llaves generó este mes (para mostrar el saldo restante). */
export function llavesEsteMes(invs: Invitacion[]): number {
  const ahora = new Date();
  return invs.filter((i) => {
    const d = new Date(i.created_at);
    return d.getFullYear() === ahora.getFullYear() && d.getMonth() === ahora.getMonth();
  }).length;
}

/** El link para compartir una llave. */
export function linkInvitacion(codigo: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?invite=${encodeURIComponent(codigo)}`;
}

/** Captura ?invite= de la URL y lo guarda (para atribuir al registrarse). */
export function capturarInviteDeURL(): void {
  if (typeof window === 'undefined') return;
  try {
    const code = new URLSearchParams(window.location.search).get('invite');
    if (code) localStorage.setItem(INVITE_KEY, code);
  } catch {
    /* noop */
  }
}

/** Si hay un código guardado y el usuario está logueado, lo redime (idempotente). */
export async function redimirInvitacionPendiente(): Promise<void> {
  if (!isSupabaseReady() || !supabase) return;
  let code: string | null = null;
  try {
    code = localStorage.getItem(INVITE_KEY);
  } catch {
    /* noop */
  }
  if (!code) return;
  try {
    await supabase.rpc('redimir_invitacion', { p_codigo: code });
    try {
      localStorage.removeItem(INVITE_KEY);
    } catch {
      /* noop */
    }
  } catch {
    /* red o RLS: se reintenta la próxima sesión */
  }
}

// ── La Herencia de la cohorte ───────────────────────────────────────────────

export type TipoHerencia = 'objecion' | 'hook';

export interface HerenciaEntry {
  id?: string;
  alias?: string;
  tipo: TipoHerencia;
  texto: string;
  respuesta?: string | null;
  created_at?: string;
  es_tu?: boolean;
}

/** Publica una objeción/hook en la Herencia. Devuelve true si guardó. */
export async function postHerencia(entry: {
  tipo: TipoHerencia;
  texto: string;
  respuesta?: string;
}): Promise<boolean> {
  if (!isSupabaseReady() || !supabase) return false;
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return false;
    const { error } = await supabase.from('herencia_cohorte').insert({
      autor_id: uid,
      tipo: entry.tipo,
      texto: entry.texto,
      respuesta: entry.respuesta ?? null,
    });
    return !error;
  } catch {
    return false;
  }
}

/** La Herencia de la cohorte (anonimizada). null si sin conexión o RPC ausente. */
export async function getHerencia(): Promise<HerenciaEntry[] | null> {
  if (!isSupabaseReady() || !supabase) return null;
  try {
    const { data, error } = await supabase.rpc('get_herencia');
    if (error || !data) return null;
    const rows = data as Array<{
      id?: string; alias?: string; tipo?: string; texto?: string;
      respuesta?: string | null; created_at?: string; es_tu?: boolean;
    }>;
    return rows.map((r) => ({
      id: r.id,
      alias: r.alias ?? 'Un fundador',
      tipo: (r.tipo === 'hook' ? 'hook' : 'objecion') as TipoHerencia,
      texto: r.texto ?? '',
      respuesta: r.respuesta ?? null,
      created_at: r.created_at,
      es_tu: r.es_tu ?? false,
    }));
  } catch {
    return null;
  }
}
