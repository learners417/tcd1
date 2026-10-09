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
    // Lo de la base pisa lo local: es la versión que ve todo el equipo.
    const { data, error } = await supabase.from('cliente_preactivacion_check')
      .select('cliente_id, step_id, estado, nota, link');
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

/**
 * Guarda el estado, la nota o el link de una celda.
 *
 * ═══ POR QUÉ NO ES UN UPDATE ═══
 *
 * Antes esto hacía `update` sobre `cliente_preactivacion_check`, y en esa
 * tabla **la fila existe solo si el paso está tildado**. Así que poner una
 * nota en un paso pendiente —que es justo cuando una nota sirve— no tocaba
 * ninguna fila. No fallaba: actualizaba cero filas y seguía de largo.
 *
 * La función de la base crea la fila si hace falta, sin tildar el paso, y
 * devuelve el error si algo sale mal en vez de tragárselo.
 *
 * El guardado local sigue, pero como respaldo y no como destino: si la base
 * no responde, al menos no se pierde lo que se acaba de escribir.
 */
export async function saveExtra(clienteId: string, stepId: string, cambio: ExtraCelda): Promise<void> {
  const all = leerLocal();
  const k = clave(clienteId, stepId);
  const nuevo = { ...(all[k] ?? {}), ...cambio };
  if (!nuevo.estado && !nuevo.nota && !nuevo.link) delete all[k]; else all[k] = nuevo;
  try { localStorage.setItem(LOCAL, JSON.stringify(all)); } catch { /* noop */ }

  if (!supabase) return;
  const { error } = await supabase.rpc('guardar_extra_celda', {
    p_cliente: clienteId,
    p_step: stepId,
    p_estado: nuevo.estado ?? null,
    p_nota: nuevo.nota ?? null,
    p_link: nuevo.link ?? null,
  });
  if (error) {
    throw new Error(
      /guardar_extra_celda/.test(error.message)
        ? 'Falta correr la migración de la matriz compartida: por ahora esto queda solo en este navegador.'
        : error.message,
    );
  }
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
