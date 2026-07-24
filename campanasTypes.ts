/**
 * ligaCalcs.ts — La Liga de Constancia (T10 · idea #4 del Plan Maestro).
 * El ranking semanal se mide por ESFUERZO (días activos + sesiones), JAMÁS
 * por ventas. La tabla de la cohorte llega anonimizada por RPC SECURITY
 * DEFINER (`get_liga_semanal`); si el RPC todavía no existe en Supabase, las
 * funciones devuelven null/0 y la vista muestra solo tu propio esfuerzo —
 * sin romper nunca (mismo patrón que activity.ts / evidencia.ts).
 */
import { supabase, isSupabaseReady } from './supabase';
import { getActiveDaysThisWeek } from './activity';

export interface LigaEntry {
  alias: string;
  dias_activos: number;
  sesiones: number;
  puntos: number;
  cinturon?: string | null;
  es_tu: boolean;
}

/** Puntos de esfuerzo (nunca ventas): días activos ×10 + sesiones ×5. */
export function calcularPuntos(diasActivos: number, sesiones: number): number {
  return diasActivos * 10 + sesiones * 5;
}

/** Lunes 00:00 local de la semana actual, en ISO (para filtrar por fecha). */
function inicioSemanaISO(): string {
  const d = new Date();
  const diasDesdeLunes = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diasDesdeLunes);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * La Liga de la semana (toda la cohorte, anonimizada). Devuelve null si
 * Supabase está apagado o el RPC aún no fue creado — en ese caso la vista
 * cae a "tu propio esfuerzo" sin romperse.
 */
export async function fetchLigaSemanal(): Promise<LigaEntry[] | null> {
  if (!isSupabaseReady() || !supabase) return null;
  try {
    const { data, error } = await supabase.rpc('get_liga_semanal');
    if (error || !data) return null;
    const rows = data as Array<{
      alias?: string; dias_activos?: number; sesiones?: number;
      puntos?: number; cinturon?: string | null; es_tu?: boolean;
    }>;
    return rows
      .map((r) => ({
        alias: r.alias ?? 'Fundador',
        dias_activos: r.dias_activos ?? 0,
        sesiones: r.sesiones ?? 0,
        puntos: r.puntos ?? calcularPuntos(r.dias_activos ?? 0, r.sesiones ?? 0),
        cinturon: r.cinturon ?? null,
        es_tu: r.es_tu ?? false,
      }))
      .sort((a, b) => b.puntos - a.puntos);
  } catch {
    return null;
  }
}

/** Tu propio esfuerzo de la semana — funciona SIEMPRE (sin RPC ni cohorte). */
export async function fetchMiEsfuerzo(
  userId: string,
): Promise<{ dias_activos: number; sesiones: number; puntos: number }> {
  const diasActivos = userId ? await getActiveDaysThisWeek(userId) : 0;
  let sesiones = 0;
  if (isSupabaseReady() && supabase && userId) {
    try {
      const { data } = await supabase
        .from('session_logs')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', inicioSemanaISO());
      sesiones = (data ?? []).length;
    } catch {
      /* tabla distinta o sin datos: el esfuerzo cae a los días activos */
    }
  }
  return { dias_activos: diasActivos, sesiones, puntos: calcularPuntos(diasActivos, sesiones) };
}
