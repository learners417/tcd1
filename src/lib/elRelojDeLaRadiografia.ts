/**
 * EL RELOJ DE LA RADIOGRAFÍA — los quince minutos, a la vista, sin castigo.
 *
 * ═══ QUÉ DECIDIÓ JAVO, Y CUÁNDO ═══
 *
 * El 8 de noviembre eligió que la entrada sea «los 15 de una, cronometrados».
 * El 11 de noviembre se resolvió el choque: `src/components/sesion/SesionViva.tsx`
 * dice —y sigue diciendo, para la sesión diaria— que «un reloj corriendo apura
 * y no ayuda». Las dos cosas conviven porque son dos momentos distintos: la
 * sesión de cada día no se cronometra, y la radiografía de entrada sí.
 *
 * Con UNA condición, que viene del diseño del turno 5 y que este módulo hace
 * cumplir por construcción:
 *
 *     PASARSE NO CIERRA NADA.
 *
 * No hay en todo este archivo una función que devuelva «bloqueado», «cerrado»
 * ni «vencido». `sePaso()` existe para que la pantalla cambie de tono, no para
 * que algo deje de andar: la pregunta sigue ahí y se puede contestar a los
 * cuarenta minutos. Lo único que el turno 5 ponía en juego era el premio, y el
 * premio —medido el 12 de noviembre— no existe: ver el mapa.
 *
 * ═══ POR QUÉ EL INICIO SE GUARDA, Y UNA SOLA VEZ ═══
 *
 * Porque «de una» es la promesa del tramo. Si el reloj naciera con el
 * componente, recargar la página —volver de WhatsApp, pestaña descartada,
 * señal que cortó, que es el flanco que cuidó el turno 5— regalaría quince
 * minutos nuevos, y el reloj mediría la última visita en vez de la entrada.
 * `arrancar()` estampa el inicio la PRIMERA vez y después es inofensiva.
 *
 * Es hora de pared a propósito: el que cierra y vuelve mañana se pasó, y eso
 * es verdad. No cuesta nada —ver arriba—, así que decir la verdad es gratis.
 *
 * Lógica pura más una estampa en el teléfono: se puede probar sin navegador.
 */

/** El presupuesto que eligió Javo: quince minutos. */
export const PRESUPUESTO_SEGUNDOS = 15 * 60;

/** La llave de la estampa. Solo este módulo la escribe. */
export const CLAVE_RELOJ = 'tcd_radiografia_reloj_v1';

function leerEstampa(): number | null {
  try {
    const raw = localStorage.getItem(CLAVE_RELOJ);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch { return null; }
}

/**
 * Pone en marcha el reloj si no estaba en marcha. Devuelve el inicio, sea el
 * que ya había o el recién estampado. Llamarla diez veces da el mismo número.
 */
export function arrancar(ahora: number = Date.now()): number {
  const ya = leerEstampa();
  if (ya !== null) return ya;
  try { localStorage.setItem(CLAVE_RELOJ, String(ahora)); } catch { /* noop */ }
  return ahora;
}

/** El inicio estampado, o null si el reloj todavía no arrancó. */
export function inicio(): number | null {
  return leerEstampa();
}

/** Segundos desde que arrancó. 0 si todavía no arrancó. Nunca negativo. */
export function transcurrido(ahora: number = Date.now()): number {
  const ini = leerEstampa();
  if (ini === null) return 0;
  return Math.max(0, Math.floor((ahora - ini) / 1000));
}

/**
 * Segundos que quedan del presupuesto. NEGATIVO si se pasó, a propósito:
 * quien llama decide cómo lo dice, y nadie puede confundir «se pasó» con
 * «llegó justo» porque el cero es un solo instante.
 */
export function restante(ahora: number = Date.now()): number {
  return PRESUPUESTO_SEGUNDOS - transcurrido(ahora);
}

/**
 * Si el presupuesto se agotó. INFORMATIVO: no lo lee ningún candado.
 * Con el reloj sin arrancar devuelve false — nadie se pasó de un reloj que no
 * empezó.
 */
export function sePaso(ahora: number = Date.now()): boolean {
  if (leerEstampa() === null) return false;
  return restante(ahora) < 0;
}

/**
 * Los segundos como los lee una persona: «12:34». El signo va afuera, porque
 * «−1:-5» no se lee: `comoSeLee(restante())` de −65 da «1:05» y la pantalla
 * pone el «hace» o el «+» que corresponda.
 */
export function comoSeLee(segundos: number): string {
  const s = Math.abs(Math.floor(segundos));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Se olvida al cerrar la bienvenida, igual que el borrador. */
export function olvidar(): void {
  try { localStorage.removeItem(CLAVE_RELOJ); } catch { /* noop */ }
}
