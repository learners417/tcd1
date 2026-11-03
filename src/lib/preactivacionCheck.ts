// ═══════════════════════════════════════════════════════════════════════════
// API helpers para cliente_preactivacion_check
// Usado por PreactivacionMatriz / MatrizGrid en el panel admin.
// ═══════════════════════════════════════════════════════════════════════════

import { supabase, guardarFila } from './supabase';
import { STEPS, TOTAL_STEPS } from './preactivacionSteps';

export type ChecksByCliente = Map<string, Set<string>>;

const VALID_STEP_IDS = new Set(STEPS.map((s) => s.id));

function countValidChecks(checks: ChecksByCliente, clienteId: string): number {
  const set = checks.get(clienteId);
  if (!set) return 0;
  let n = 0;
  for (const id of set) {
    if (VALID_STEP_IDS.has(id)) n++;
  }
  return n;
}

interface CheckRow {
  cliente_id: string;
  step_id: string;
}

/**
 * Trae TODOS los rows tildados de todos los clientes.
 * Solo admins (RLS bloquea al resto). Vuelve un Map<cliente_id, Set<step_id>>.
 */
export async function loadAllChecks(): Promise<ChecksByCliente> {
  const map: ChecksByCliente = new Map();
  if (!supabase) return map;

  // Solo lo TILDADO. Una fila puede existir sin tilde cuando guarda una nota
  // o el link de un anuncio en un paso que sigue pendiente; contarla como
  // hecha inflaría el avance de cada cliente.
  const { data, error } = await supabase
    .from('cliente_preactivacion_check')
    .select('cliente_id, step_id')
    .not('completado_at', 'is', null);

  if (error) {
    throw new Error(`Error cargando checklist: ${error.message}`);
  }

  for (const row of (data ?? []) as CheckRow[]) {
    let set = map.get(row.cliente_id);
    if (!set) {
      set = new Set<string>();
      map.set(row.cliente_id, set);
    }
    set.add(row.step_id);
  }
  return map;
}

/**
 * Toggle de un paso para un cliente.
 * - on=true  → INSERT (idempotente, ignora duplicados)
 * - on=false → DELETE
 */
export async function setCheck(
  clienteId: string,
  stepId: string,
  on: boolean,
  completadoPor: string,
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado');
  }

  if (on) {
    // `completado_at` va explícito: dejó de tener valor por defecto cuando se
    // permitió que una fila exista sin tilde, para guardar la nota y el link
    // de un paso pendiente. Sin esto, tildar dejaría la fecha en nulo y el
    // paso seguiría contando como no hecho.
    const { error } = await guardarFila(
      'cliente_preactivacion_check',
      {
        cliente_id: clienteId,
        step_id: stepId,
        completado_por: completadoPor,
        completado_at: new Date().toISOString(),
      },
      ['cliente_id', 'step_id'],
    );
    if (error) {
      throw new Error(`Error tildando paso: ${(error as { message?: string }).message ?? ''}`);
    }
  } else {
    // Destildar NO borra la fila: se llevaría puestos la nota y el link que
    // alguien cargó ahí. Se quita la fecha, y la función de la base limpia la
    // fila solo si no quedó nada adentro.
    const { error } = await supabase
      .from('cliente_preactivacion_check')
      .update({ completado_at: null })
      .match({ cliente_id: clienteId, step_id: stepId });
    if (error) {
      throw new Error(`Error destildando paso: ${error.message}`);
    }
    await supabase.rpc('guardar_extra_celda', {
      p_cliente: clienteId, p_step: stepId,
      p_estado: null, p_nota: null, p_link: null,
    });
  }
}

/** Mutación inmutable del map (devuelve uno nuevo con el toggle aplicado). */
export function applyToggle(
  checks: ChecksByCliente,
  clienteId: string,
  stepId: string,
  on: boolean,
): ChecksByCliente {
  const next = new Map(checks);
  const prevSet = next.get(clienteId);
  const nextSet = new Set(prevSet ?? []);
  if (on) nextSet.add(stepId);
  else nextSet.delete(stepId);
  if (nextSet.size === 0) next.delete(clienteId);
  else next.set(clienteId, nextSet);
  return next;
}

export function isChecked(
  checks: ChecksByCliente,
  clienteId: string,
  stepId: string,
): boolean {
  return checks.get(clienteId)?.has(stepId) ?? false;
}

export function progressPct(checks: ChecksByCliente, clienteId: string): number {
  if (TOTAL_STEPS === 0) return 0;
  const done = Math.min(countValidChecks(checks, clienteId), TOTAL_STEPS);
  return Math.round((done / TOTAL_STEPS) * 100);
}

export function completedCount(checks: ChecksByCliente, clienteId: string): number {
  return countValidChecks(checks, clienteId);
}
