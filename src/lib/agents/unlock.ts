import type { PilarId, ProfileV2 } from '../supabase';
import { SEED_ROADMAP_V2 } from '../roadmapSeed';
import type { ConfigAgente } from './types';

/** Returns the set of completed task keys from localStorage (e.g. "9-P9A.1"). */
export function getCompletadas(): Set<string> {
  try {
    const saved = localStorage.getItem('tcd_hoja_ruta_v2');
    return new Set<string>(saved ? JSON.parse(saved) : []);
  } catch {
    return new Set<string>();
  }
}

/**
 * Legacy: returns true if AT LEAST ONE task of the pilar is completed.
 * Sigue exportado por compatibilidad con consumers viejos · los nuevos
 * desbloqueos de entrenadores usan `isPilarCompletado` (100%).
 */
export function isPilarActive(pilarId: PilarId, completadas: Set<string>): boolean {
  const pilar = SEED_ROADMAP_V2.find((p) => p.id === pilarId);
  if (!pilar) return false;
  return (pilar.metas ?? []).some((m) => completadas.has(`${pilar.numero}-${m.codigo}`));
}

/**
 * Returns true only when ALL metas of the pilar are completed.
 * Este es el chequeo que usan los 7 entrenadores · alineado al brief
 * "desbloqueo por hito" (no por una sola tarea).
 */
export function isPilarCompletado(pilarId: PilarId, completadas: Set<string>): boolean {
  const pilar = SEED_ROADMAP_V2.find((p) => p.id === pilarId);
  if (!pilar) return false;
  const metas = pilar.metas ?? [];
  if (metas.length === 0) return false;
  return metas.every((m) => completadas.has(`${pilar.numero}-${m.codigo}`));
}

export interface UnlockResult {
  unlocked: boolean;
  reason?: string;
}

/**
 * Verifica si un entrenador está desbloqueado para el sanador.
 *
 * Reglas:
 * 1. `full_agent_access === true` en el perfil bypassea todo (admin/QA).
 * 2. TODOS los `unlockPilares` deben estar 100% completos.
 * 3. Si hay `unlockExtraCheck`, debe retornar `true`.
 */
export function checkAgentUnlock(
  agente: ConfigAgente,
  perfil: Partial<ProfileV2>,
  ctx: { metricasCount: number },
  completadas: Set<string>,
): UnlockResult {
  if (perfil.full_agent_access === true) return { unlocked: true };

  const todosCompletos = agente.unlockPilares.every((p) =>
    isPilarCompletado(p, completadas),
  );
  if (!todosCompletos) return { unlocked: false, reason: agente.unlockReason };

  if (agente.unlockExtraCheck && !agente.unlockExtraCheck(perfil, ctx)) {
    return { unlocked: false, reason: agente.unlockReason };
  }

  return { unlocked: true };
}
