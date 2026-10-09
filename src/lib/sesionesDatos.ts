/**
 * LAS SESIONES, CONTRA LA BASE.
 *
 * Las carga el equipo; el cliente ve las suyas. La política de la base se
 * encarga de que en una grupal nadie vea quiénes fueron los demás.
 */
import { supabase, isSupabaseReady } from './supabase';
import type { Sesion, TipoDeSesion } from './sesionesHumanas';

const COLUMNAS = 'id, fecha, tipo, quien_la_dio, notas, pendiente, minutos';

function db() {
  return isSupabaseReady() ? supabase : null;
}

/** Las sesiones de un cliente, de la más nueva a la más vieja. */
export async function sesionesDe(clienteId: string): Promise<Sesion[]> {
  const s = db();
  if (!s || !clienteId) return [];
  const { data, error } = await s
    .from('sesiones_asistentes')
    .select(`asistio, sesion:sesiones(${COLUMNAS})`)
    .eq('cliente_id', clienteId)
    .eq('asistio', true);
  if (error || !data) return [];
  return (data as unknown as Array<{ sesion: Sesion | null }>)
    .map((f) => f.sesion)
    .filter((x): x is Sesion => Boolean(x))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Las de varios clientes, en una sola consulta.
 *
 * El Admin arma la lista con todos a la vez: de a uno serían tantas consultas
 * como clientes, cada vez que se abre la pantalla.
 */
export async function sesionesDeVarios(clienteIds: string[]): Promise<Record<string, Sesion[]>> {
  const s = db();
  if (!s || !clienteIds.length) return {};
  const { data, error } = await s
    .from('sesiones_asistentes')
    .select(`cliente_id, asistio, sesion:sesiones(${COLUMNAS})`)
    .in('cliente_id', clienteIds)
    .eq('asistio', true);
  if (error || !data) return {};

  const out: Record<string, Sesion[]> = {};
  for (const fila of (data as unknown as Array<{ cliente_id: string; sesion: Sesion | null }>)) {
    if (!fila.sesion) continue;
    (out[fila.cliente_id] ??= []).push(fila.sesion);
  }
  for (const k of Object.keys(out)) {
    out[k].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  return out;
}

export interface SesionNueva {
  tipo: TipoDeSesion;
  fecha: string;
  quienLaDio: string;
  clientes: string[];
  notas?: string;
  pendiente?: string;
  minutos?: number;
}

/**
 * Carga una sesión con sus asistentes, de una sola vez.
 *
 * La base lo hace en una sola operación: si se hiciera en dos pasos y el
 * segundo fallara, quedaría una sesión sin nadie adentro — un registro que
 * dice que algo pasó sin decir a quién, que es peor que no tenerlo.
 */
export async function cargarSesion(x: SesionNueva): Promise<string> {
  const s = db();
  if (!s) throw new Error('sin conexión');
  if (!x.clientes.length) {
    throw new Error('Una sesión sin asistentes no dice nada: elige al menos uno.');
  }

  const { data, error } = await s.rpc('cargar_sesion', {
    p_tipo: x.tipo,
    p_fecha: x.fecha,
    p_quien: x.quienLaDio,
    p_clientes: x.clientes,
    p_notas: x.notas ?? null,
    p_pendiente: x.pendiente ?? null,
    p_minutos: x.minutos ?? null,
  });

  if (error) {
    throw new Error(
      /cargar_sesion|does not exist/.test(error.message)
        ? 'Falta correr la migración de las sesiones.'
        : error.message,
    );
  }
  return String(data);
}
