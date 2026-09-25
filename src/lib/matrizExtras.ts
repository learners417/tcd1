/**
 * EXTRAS DE LA MATRIZ — el estado real de cada celda.
 *
 * Cada cruce cliente×paso guarda: estado (pendiente · en proceso · listo · N/A),
 * una nota y un link (Drive, doc, página, calendario). Igual que en la planilla,
 * pero vivo y compartido. Guarda en la tabla si existen las columnas; si no,
 * queda en este navegador y no rompe nada.
 */
import { supabase } from './supabase';

export type EstadoCelda = 'pendiente' | 'proceso' | 'listo' | 'na';

export interface ExtraCelda { estado?: EstadoCelda; nota?: string; link?: string }
export type ExtrasByCliente = Map<string, Map<string, ExtraCelda>>;

const LOCAL = 'tcd_matriz_extras_v1';
const clave = (clienteId: string, stepId: string) => `${clienteId}::${stepId}`;

function leerLocal(): Record<string, ExtraCelda> {
  try { return JSON.parse(localStorage.getItem(LOCAL) ?? '{}') as Record<string, ExtraCelda>; } catch { return {}; }
}

export async function loadExtras(): Promise<ExtrasByCliente> {
  const out: ExtrasByCliente = new Map();
  const poner = (cli: string, step: string, e: ExtraCelda) => {
    if (!e || (!e.estado && !e.nota && !e.link)) return;
    if (!out.has(cli)) out.set(cli, new Map());
    out.get(cli)!.set(step, { ...out.get(cli)!.get(step), ...e });
  };
  for (const [k, v] of Object.entries(leerLocal())) {
    const [cli, step] = k.split('::');
    if (cli && step) poner(cli, step, v);
  }
  if (supabase) {
    const { data, error } = await supabase.from('cliente_preactivacion_check').select('cliente_id, step_id, estado, nota, link');
    if (!error && data) {
      for (const r of data as Array<{ cliente_id: string; step_id: string; estado?: string | null; nota?: string | null; link?: string | null }>) {
        poner(r.cliente_id, r.step_id, {
          estado: (r.estado as EstadoCelda) || undefined,
          nota: r.nota || undefined,
          link: r.link || undefined,
        });
      }
    }
  }
  return out;
}

export async function saveExtra(clienteId: string, stepId: string, cambio: ExtraCelda): Promise<void> {
  const all = leerLocal();
  const k = clave(clienteId, stepId);
  const nuevo = { ...(all[k] ?? {}), ...cambio };
  if (!nuevo.estado && !nuevo.nota && !nuevo.link) delete all[k]; else all[k] = nuevo;
  try { localStorage.setItem(LOCAL, JSON.stringify(all)); } catch { /* noop */ }
  if (!supabase) return;
  await supabase
    .from('cliente_preactivacion_check')
    .update({ estado: nuevo.estado ?? null, nota: nuevo.nota ?? null, link: nuevo.link ?? null })
    .eq('cliente_id', clienteId)
    .eq('step_id', stepId);
}

export function extraDe(extras: ExtrasByCliente, clienteId: string, stepId: string): ExtraCelda {
  return extras.get(clienteId)?.get(stepId) ?? {};
}

/** El ciclo del clic, igual que en la planilla. */
export const SIGUIENTE_ESTADO: Record<EstadoCelda, EstadoCelda> = {
  pendiente: 'proceso',
  proceso: 'listo',
  listo: 'na',
  na: 'pendiente',
};

export const ESTADO_LABEL: Record<EstadoCelda, string> = {
  pendiente: 'Pendiente',
  proceso: 'En proceso',
  listo: 'Listo',
  na: 'No aplica',
};
