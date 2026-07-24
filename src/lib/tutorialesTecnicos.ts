/**
 * muroHitos.ts — El Muro de Hitos (T10 · idea #3 del Plan Maestro).
 * Los logros de la cohorte en tiempo (casi) real, ANÓNIMOS: se celebra el
 * hito, no el nombre. Los mismos momentos-quiebre del Camino (la quema, el
 * precio en voz alta, el primer $1.000…). La cohorte llega por RPC
 * `get_muro_hitos`; si no existe aún, se muestran tus propios hitos desde el
 * progreso local — sin romper.
 */
import { supabase, isSupabaseReady } from './supabase';
import { SEED_ROADMAP_V2 } from './roadmapSeed';

export interface HitoDef {
  codigo: string; // MetaCodigo del hito (ej. 'P1.3')
  label: string; // cómo se lee en el muro ("hizo LA QUEMA")
  emoji: string;
}

/** Los hitos que se celebran (espejo de los teasers-hito del Camino). */
export const HITOS_MURO: HitoDef[] = [
  { codigo: 'P0.2', label: 'plantó su Foto de Partida', emoji: '📸' },
  { codigo: 'P1.3', label: 'hizo LA QUEMA', emoji: '🔥' },
  { codigo: 'P1.5', label: 'dijo su precio en voz alta', emoji: '💬' },
  { codigo: 'P4.3b', label: 'grabó su primer video', emoji: '🎬' },
  { codigo: 'P4.4', label: 'encendió su clínica al mundo', emoji: '🚀' },
  { codigo: 'P5.4', label: 'tomó su primera llamada', emoji: '📞' },
  { codigo: 'P6.3', label: 'cobró su primer $1.000', emoji: '💰' },
  { codigo: 'P7.3', label: 'entró en la última recta', emoji: '🥋' },
];

const POR_CODIGO = new Map(HITOS_MURO.map((h) => [h.codigo, h] as const));
export function hitoDef(codigo: string): HitoDef | undefined {
  return POR_CODIGO.get(codigo);
}

export interface MuroEntry {
  alias: string;
  codigo: string;
  label: string;
  emoji: string;
  cuando: string; // ISO
  es_tu: boolean;
}

/** El Muro de la cohorte (anónimo). null si Supabase apagado o RPC ausente. */
export async function fetchMuroHitos(): Promise<MuroEntry[] | null> {
  if (!isSupabaseReady() || !supabase) return null;
  try {
    const { data, error } = await supabase.rpc('get_muro_hitos');
    if (error || !data) return null;
    const rows = data as Array<{
      alias?: string; meta_codigo?: string; fecha_completada?: string; es_tu?: boolean;
    }>;
    return rows
      .map((r): MuroEntry | null => {
        const def = hitoDef(r.meta_codigo ?? '');
        if (!def) return null;
        return {
          alias: r.alias ?? 'Un fundador',
          codigo: def.codigo,
          label: def.label,
          emoji: def.emoji,
          cuando: r.fecha_completada ?? '',
          es_tu: r.es_tu ?? false,
        };
      })
      .filter((x): x is MuroEntry => x !== null);
  } catch {
    return null;
  }
}

/** Tus propios hitos alcanzados (desde el progreso local) — siempre disponible. */
export function misHitos(): Array<{ codigo: string; label: string; emoji: string }> {
  let set = new Set<string>();
  try {
    set = new Set<string>(JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') || '[]'));
  } catch {
    /* noop */
  }
  const out: Array<{ codigo: string; label: string; emoji: string }> = [];
  for (const pil of SEED_ROADMAP_V2) {
    for (const m of pil.metas ?? []) {
      const def = hitoDef(m.codigo);
      if (def && set.has(`${pil.numero}-${m.codigo}`)) {
        out.push({ codigo: def.codigo, label: def.label, emoji: def.emoji });
      }
    }
  }
  return out;
}
