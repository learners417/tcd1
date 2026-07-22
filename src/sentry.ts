import { supabase, isSupabaseReady } from './supabase';
import { formatDateLocal, startOfDayLocal } from './dateUtils';

// Guard local: recuerda el último día ya registrado para no pegarle a la red
// en cada refresh o cambio de pestaña. Formato del valor: `${userId}:${YYYY-MM-DD}`.
const TODAY_MARK_KEY = 'tcd_activity_marked';

/**
 * Registra que el usuario abrió la app HOY. Fire-and-forget e idempotente:
 *  - Hace a lo sumo UN intento de red por día (guardado en localStorage), así
 *    no consulta Supabase en cada refresh ni al volver de otra pestaña.
 *  - El upsert con `onConflict` garantiza una sola fila por (usuario, día)
 *    aunque el guard local no exista (ej. otro dispositivo o navegador).
 *  - Nunca lanza: una métrica no crítica jamás debe romper la carga de la app.
 */
export async function recordTodayActivity(userId: string): Promise<void> {
  if (!isSupabaseReady() || !supabase || !userId) return;

  const hoy = formatDateLocal(new Date());
  try {
    if (localStorage.getItem(TODAY_MARK_KEY) === `${userId}:${hoy}`) return;
  } catch { /* localStorage no disponible: seguimos e intentamos el upsert igual */ }

  try {
    const { error } = await supabase
      .from('user_activity')
      .upsert({ user_id: userId, fecha: hoy }, { onConflict: 'user_id,fecha' });
    if (error) {
      console.warn('recordTodayActivity: upsert falló (no crítico):', error.message);
      return;
    }
    try { localStorage.setItem(TODAY_MARK_KEY, `${userId}:${hoy}`); } catch { /* noop */ }
  } catch (err) {
    console.warn('recordTodayActivity: excepción (no crítico):', err);
  }
}

/**
 * Lunes 00:00 local de la semana que contiene `ref` (default: hoy).
 * La semana se considera lunes → domingo (convención local argentina).
 */
export function startOfWeekLocal(ref: Date = new Date()): Date {
  const d = startOfDayLocal(ref);
  const dow = d.getDay();        // 0=Dom, 1=Lun ... 6=Sáb
  const diasDesdeLunes = (dow + 6) % 7;
  d.setDate(d.getDate() - diasDesdeLunes);
  return d;
}

/**
 * Cuenta los días distintos en que el usuario se conectó durante la semana
 * actual (lunes → hoy, hora local). Devuelve 0 si no hay datos, no hay sesión
 * o Supabase está apagado. Es solo lectura: no escribe nada.
 */
export async function getActiveDaysThisWeek(userId: string): Promise<number> {
  if (!isSupabaseReady() || !supabase || !userId) return 0;

  const lunes = formatDateLocal(startOfWeekLocal());
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('fecha')
      .eq('user_id', userId)
      .gte('fecha', lunes);
    if (error || !data) return 0;
    return new Set(data.map((r: { fecha: string }) => r.fecha)).size;
  } catch {
    return 0;
  }
}
