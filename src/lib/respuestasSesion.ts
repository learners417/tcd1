import { db } from './supabase';

/**
 * LO QUE EL CLIENTE ESCRIBE — que no se puede perder.
 *
 * ═══ EL PROBLEMA QUE RESUELVE ═══
 *
 * El cronómetro y la emoción de cada sesión ya vivían en `session_logs`. Pero
 * **lo que el cliente ESCRIBE** —su método, su oferta, su avatar, cada
 * artefacto que construye— vivía **solo en el navegador**.
 *
 * Si empezaba en el teléfono y seguía en la computadora, empezaba de cero. Si
 * limpiaba el navegador, perdía el trabajo. **Y las sesiones guiadas SON el
 * producto**: perder eso es perder lo único que justifica lo que pagó.
 *
 * Lo peor era que no se enteraba hasta que ya había pasado.
 *
 * ═══ LA REGLA ═══
 *
 * **La base manda; el navegador es la copia rápida.** Se escribe en los dos,
 * se lee de la base cuando está disponible, y si la red falla el trabajo sigue
 * andando localmente — pero se avisa, porque un guardado que no llegó y nadie
 * dijo nada es la peor forma de perder algo.
 */

const KEY = 'tcd_sesion_guiada_v1';

export type EstadoDeSesion = Record<string, unknown>;

/** Lo que hay en el navegador. Instantáneo, para que la pantalla no espere. */
export function leerLocal(codigo: string): EstadoDeSesion | null {
  try {
    const todo = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, EstadoDeSesion>;
    return todo[codigo] ?? null;
  } catch { return null; }
}

export function guardarLocal(codigo: string, estado: EstadoDeSesion): void {
  try {
    const todo = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, EstadoDeSesion>;
    todo[codigo] = estado;
    localStorage.setItem(KEY, JSON.stringify(todo));
  } catch { /* si el navegador no deja, la base sigue siendo la verdad */ }
}

/**
 * Guarda en la base.
 *
 * Devuelve si llegó. **Quien lo llama tiene que hacer algo con ese false**:
 * seguir en silencio es exactamente el error que esto viene a arreglar.
 */
export async function guardarEnLaBase(
  clienteId: string,
  codigo: string,
  estado: EstadoDeSesion,
): Promise<boolean> {
  if (!clienteId) return false;
  try {
    const { error } = await db().rpc('guardar_respuestas', {
      p_cliente: clienteId, p_meta: codigo, p_estado: estado,
    });
    return !error;
  } catch { return false; }
}

/**
 * Lo que escribió, de donde sea que esté.
 *
 * **La base gana sobre el navegador**: si abrió la sesión en el teléfono y
 * ahora entra desde la computadora, tiene que ver lo que escribió, no una
 * copia vieja.
 *
 * Si la base no responde, se sigue con lo local. Eso es preferible a una
 * pantalla en blanco, y el aviso de arriba se encarga de decirlo.
 */
export async function leerLoQueEscribio(
  clienteId: string,
  codigo: string,
): Promise<{ estado: EstadoDeSesion | null; deLaBase: boolean }> {
  const local = leerLocal(codigo);
  if (!clienteId) return { estado: local, deLaBase: false };

  try {
    const { data, error } = await db()
      .from('sesion_respuestas')
      .select('estado')
      .eq('cliente_id', clienteId)
      .eq('meta_codigo', codigo)
      .maybeSingle();

    if (error || !data) return { estado: local, deLaBase: false };

    const deLaBase = (data as { estado: EstadoDeSesion }).estado;
    // Se refresca la copia local para que la próxima abra instantánea.
    guardarLocal(codigo, deLaBase);
    return { estado: deLaBase, deLaBase: true };
  } catch {
    return { estado: local, deLaBase: false };
  }
}

/** Todo lo que escribió, para que el equipo pueda acompañar sin pedirle nada. */
export async function todoLoQueEscribio(
  clienteId: string,
): Promise<Array<{ codigo: string; estado: EstadoDeSesion; cuando: string }>> {
  try {
    const { data, error } = await db().rpc('respuestas_de', { p_cliente: clienteId });
    if (error || !data) return [];
    return (data as unknown as Array<{
      meta_codigo: string; estado: EstadoDeSesion; actualizado_en: string;
    }>).map((r) => ({
      codigo: r.meta_codigo, estado: r.estado, cuando: r.actualizado_en,
    }));
  } catch { return []; }
}
