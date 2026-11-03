/**
 * LA BIBLIOTECA, EN LA BASE — los videos cargados y el permiso por cliente.
 *
 * El catálogo se arma en catalogoBiblioteca.ts, que no sabe nada de Supabase
 * para poder probarse solo. Este archivo es el puente.
 */
import { db } from './supabase';

/**
 * Los videos que el equipo cargó: código de jornada → enlace.
 *
 * Pisan a los del archivo, que es la regla que ya seguía el Camino. Si la
 * consulta falla se devuelve vacío y el catálogo se arma con lo del archivo:
 * una Biblioteca con casi todo es mucho mejor que una Biblioteca vacía.
 */
export async function videosCargadosEnLaBase(): Promise<Record<string, string>> {
  try {
    const { data, error } = await db()
      .from('programa_videos')
      .select('pilar_id, youtube_url');
    if (error || !data) return {};
    const out: Record<string, string> = {};
    for (const f of data as Array<{ pilar_id: string | number; youtube_url: string | null }>) {
      if (f.youtube_url) out[String(f.pilar_id)] = f.youtube_url;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Abre o cierra la Biblioteca completa de un cliente.
 *
 * Devuelve el error en palabras para que la pantalla pueda decirlo: antes un
 * permiso que no se guardaba se veía igual que uno que sí, y el equipo creía
 * habérselo dado.
 */
export async function marcarBiblioteca(
  clienteId: string,
  abierta: boolean,
  quien: string,
): Promise<{ ok: boolean; problema?: string }> {
  try {
    const { error } = await db().rpc('marcar_biblioteca', {
      p_cliente: clienteId,
      p_abierta: abierta,
      p_quien: quien,
    });
    if (error) return { ok: false, problema: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, problema: err instanceof Error ? err.message : String(err) };
  }
}
