/**
 * LOS NÚMEROS, DESDE LA BASE — una consulta para todos los clientes.
 *
 * El semáforo se arma con todos a la vez, así que traerlos de a uno sería una
 * consulta por cliente cada mañana. Esto los trae en una sola y los reparte.
 *
 * Solo lectura: la carga sigue siendo del cliente, en su pestaña de métricas.
 */
import { supabase, isSupabaseReady } from './supabase';
import type { SemanaDeNumeros } from './numerosDelCliente';

/** Las semanas cargadas por cada uno de esos clientes. */
export async function numerosDeVarios(userIds: string[]): Promise<Record<string, SemanaDeNumeros[]>> {
  const vacío: Record<string, SemanaDeNumeros[]> = {};
  if (!userIds.length || !isSupabaseReady() || !supabase) return vacío;

  const { data, error } = await supabase
    .from('metricas_v2')
    .select('user_id, semana, met_fecha_inicio, met_fecha_fin, gasto_ads, mensajes_recibidos, ' +
            'formularios_completados, agendados, shows, llamadas_tomadas, ventas_cerradas, ' +
            'ingresos_cobrados, horas_trabajadas_semana, met_diagnostico')
    .in('user_id', userIds)
    .order('met_fecha_inicio', { ascending: false });

  if (error || !data) return vacío;

  const porCliente: Record<string, SemanaDeNumeros[]> = {};
  for (const fila of (data as unknown as Array<SemanaDeNumeros & { user_id: string }>)) {
    (porCliente[fila.user_id] ??= []).push(fila);
  }
  return porCliente;
}

/** Las semanas de un solo cliente, para su ficha. */
export async function numerosDe(userId: string): Promise<SemanaDeNumeros[]> {
  return (await numerosDeVarios([userId]))[userId] ?? [];
}

/**
 * Guarda la lectura de la campaña en la última semana que el cliente cargó.
 *
 * Sin ninguna semana cargada no hay dónde ponerla, y tampoco con qué
 * compararla: el cliente la lee igual en pantalla, pero no se guarda. Antes de
 * crear una fila vacía solo para alojar un texto, se deja pasar.
 */
export async function guardarDiagnostico(userId: string, texto: string): Promise<boolean> {
  if (!isSupabaseReady() || !supabase || !texto.trim()) return false;
  const { data } = await supabase
    .from('metricas_v2')
    .select('semana')
    .eq('user_id', userId)
    .order('met_fecha_inicio', { ascending: false })
    .limit(1);
  const ultima = (data as Array<{ semana: string }> | null)?.[0]?.semana;
  if (!ultima) return false;
  await supabase
    .from('metricas_v2')
    .update({ met_diagnostico: texto, met_diagnostico_el: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('semana', ultima);
  return true;
}
