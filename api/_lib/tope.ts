/**
 * EL TOPE DE TIEMPO DE LAS LLAMADAS A LA IA.
 *
 * ═══ EL INCIDENTE QUE LO ORIGINA ═══
 *
 * Una clienta recibió `FUNCTION_INVOCATION_FAILED` y después «ya no me deja
 * hacer nada». La cadena era esta:
 *
 *   1. El modelo tardó más de lo que Vercel aguanta.
 *   2. Vercel **mató la función** — no hubo respuesta ni error controlado.
 *   3. Y como el proceso murió, **`deshacerCobro` nunca se ejecutó**: el
 *      crédito quedó cobrado por una llamada que nunca respondió.
 *   4. Reintentó, y volvió a pasar. Hasta quedarse sin créditos.
 *
 * O sea que el problema no era solo la lentitud: **era que fallar costaba
 * dinero.**
 *
 * ═══ LA SOLUCIÓN ═══
 *
 * Cada llamada tiene su propio tope, **más corto que el de la plataforma**.
 * Así la función siempre llega a responder, a devolver el crédito y a decir
 * qué pasó. Es preferible cortar a los 45 segundos y devolver el crédito que
 * esperar 60 y perderlo.
 */

/** Más corto que el límite de la plataforma, a propósito. */
export const TOPE_MS = 45_000;

/**
 * Corta una llamada que tarda de más.
 *
 * Devuelve un error normal —no una función muerta— para que quien la llamó
 * pueda devolver el crédito y avisar.
 */
export function conTope(ms = TOPE_MS): { signal: AbortSignal; limpiar: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, limpiar: () => clearTimeout(t) };
}

/** ¿Este error es porque se pasó del tope? */
export function esPorTiempo(err: unknown): boolean {
  const m = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return m.includes('abort') || m.includes('timeout') || m.includes('tard');
}
