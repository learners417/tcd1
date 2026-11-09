/**
 * EL PRIMER INGRESO — la jornada que dice marcarse sola, y que nadie marcaba.
 *
 * ═══ QUÉ PASABA (9 de noviembre) ═══
 *
 * La primera tarjeta del Camino es el día 0: «Entrega técnica y llamada de
 * bienvenida». Su evidencia es de tipo `evento` y lo que el cliente lee es,
 * textual: **«Se marca solo: primer ingreso.»**
 *
 * No se marcaba sola. Buscado en toda la app por el nombre de su evidencia,
 * por su código y por su día: nadie la escribe. Así que la primera cosa que ve
 * en su Camino quien acaba de pagar es una tarjeta abierta, de una llamada
 * que —si compró por la página, solo— nunca existió, y que no tiene forma de
 * cerrar. No le traba el avance: `dondeVa` hace `Math.max(1, …)`, así que su
 * día de trabajo es el 1 igual. Pero le deja una tarea sin cerrar arriba de
 * todo, para siempre.
 *
 * ═══ POR QUÉ SE CIERRA EN EL PRIMER INGRESO Y NO SE ESCONDE ═══
 *
 * Porque eso es lo que su propia evidencia promete, y porque para el que
 * compra solo el primer ingreso ES la entrega técnica: su usuario quedó
 * creado, su acceso abierto y su app andando. Esconderla sería cambiarle el
 * Camino según cómo pagó; cerrarla es cumplir lo que dice.
 *
 * Para quien entra acompañado, la llamada de bienvenida se agenda y se sigue
 * desde el Admin, que es donde vive el trabajo del equipo. Una tarjeta que el
 * cliente no puede cerrar no es el lugar donde se recuerda una llamada.
 */
import { guardarFila, isSupabaseReady, supabase } from './supabase';
import { hoyISO } from './diaPrograma';
import { codigoDelDia, pilarDelDia } from './roadmapSeed';

/** El día de la entrega técnica. Es el único día 0 del Camino. */
export const DIA_DEL_PRIMER_INGRESO = 0;

/** Dónde vive esa jornada, con los números que usa `hoja_de_ruta`. */
export function jornadaDelPrimerIngreso(): { pilar: number; codigo: string; clave: string } | null {
  const pilar = pilarDelDia(DIA_DEL_PRIMER_INGRESO);
  const codigo = codigoDelDia(DIA_DEL_PRIMER_INGRESO);
  if (pilar === null || !codigo) return null;
  return { pilar, codigo, clave: `${pilar}-${codigo}` };
}

/**
 * Cierra la jornada de la entrega técnica, una sola vez.
 *
 * Devuelve su clave cuando acaba de cerrarla, para sumarla al progreso en
 * pantalla sin esperar a que la base conteste, y `null` cuando ya estaba
 * cerrada o no hay base. Recibe las que ya están cerradas para no escribir en
 * cada carga: es idempotente de todos modos —`guardarFila` hace upsert por
 * las tres columnas de siempre— pero una escritura por sesión no hace falta.
 */
export async function marcarPrimerIngreso(
  usuarioId: string,
  yaCerradas: Set<string>,
): Promise<string | null> {
  const j = jornadaDelPrimerIngreso();
  if (!j || yaCerradas.has(j.clave)) return null;
  if (!isSupabaseReady() || !supabase) return null;
  try {
    await guardarFila('hoja_de_ruta', {
      usuario_id: usuarioId,
      pilar_numero: j.pilar,
      meta_codigo: j.codigo,
      completada: true,
      fecha_completada: hoyISO(),
    }, ['usuario_id', 'pilar_numero', 'meta_codigo']);
    return j.clave;
  } catch {
    /* Si la base no acepta la fila, el cliente no pierde nada: su día de
       trabajo sigue siendo el 1. Se vuelve a intentar en el próximo ingreso. */
    return null;
  }
}
