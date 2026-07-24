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
 * REDISEÑO 4 FASES (jul 2026) — remapeo centralizado de desbloqueos.
 * Los unlockPilares de cada config apuntan a pilares del modelo viejo
 * (P8, P9A/B/C) que ya no existen en el seed nuevo. Este mapa los
 * reemplaza según el plan validado 0-90:
 *   Diego+Sofi → Amarillo (P1) · Vera → punta verde (P2) ·
 *   Mateo+Caro → Verde (P3) · Bruno+Lucas → punta azul (P4) ·
 *   Ramiro → Azul (P5). El Coach no pasa por acá (siempre activo).
 */
const NUEVO_UNLOCK: Array<{ match: string; pilares: PilarId[] }> = [
  { match: 'diego',  pilares: ['P1'] },
  { match: 'sofi',   pilares: ['P1'] },
  { match: 'vera',   pilares: ['P2'] },
  { match: 'mateo',  pilares: ['P3'] },
  { match: 'caro',   pilares: ['P3'] },
  { match: 'bruno',  pilares: ['P4'] },
  { match: 'lucas',  pilares: ['P4'] },
  { match: 'ramiro', pilares: ['P5'] },
];

/** Pilares de desbloqueo efectivos: el remapeo nuevo si existe, si no la config. */
function pilaresDesbloqueo(agente: ConfigAgente): PilarId[] {
  const regla = NUEVO_UNLOCK.find((r) => agente.id.includes(r.match));
  return regla ? regla.pilares : agente.unlockPilares;
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

  // Activación granular por el admin (chips en la ficha del cliente)
  const activos = perfil.agentes_activos ?? [];
  if (activos.includes('todos')) return { unlocked: true };
  if (activos.some((a) => a.length >= 3 && agente.id.includes(a))) return { unlocked: true };

  const todosCompletos = pilaresDesbloqueo(agente).every((p) =>
    isPilarCompletado(p, completadas),
  );
  if (!todosCompletos) return { unlocked: false, reason: agente.unlockReason };

  if (agente.unlockExtraCheck && !agente.unlockExtraCheck(perfil, ctx)) {
    return { unlocked: false, reason: agente.unlockReason };
  }

  return { unlocked: true };
}
