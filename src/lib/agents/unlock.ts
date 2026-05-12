import type { PilarId } from '../supabase';
import { SEED_ROADMAP_V2 } from '../roadmapSeed';

/** Returns the set of completed task keys from localStorage (e.g. "9-P9A.1"). */
export function getCompletadas(): Set<string> {
  try {
    const saved = localStorage.getItem('tcd_hoja_ruta_v2');
    return new Set<string>(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set<string>();
  }
}

/** Check if a pilar is active (at least one task completed). */
export function isPilarActive(pilarId: PilarId, completadas: Set<string>): boolean {
  const pilar = SEED_ROADMAP_V2.find((p) => p.id === pilarId);
  if (!pilar) return false;
  return (pilar.metas ?? []).some((m) => completadas.has(`${pilar.numero}-${m.codigo}`));
}
