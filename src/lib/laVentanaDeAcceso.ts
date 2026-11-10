/**
 * LA VENTANA DE ACCESO — cuánto le dura la app a cada escalón.
 *
 * ═══ QUÉ PASABA (9 de noviembre) ═══
 *
 * Había dos respuestas distintas a la misma pregunta, y daban números
 * distintos en tres de los cinco escalones:
 *
 *                 las rutas de pago      el botón del Admin
 *   blanco        21 días                 7 días
 *   amarillo      sin vencimiento         45 días
 *   verde/negro   sin vencimiento         90 días
 *
 * Y hoy el botón del Admin es el ÚNICO camino que se usa: mientras el
 * workflow de GHL no exista, Javo abre a mano el acceso de cada comprador. O
 * sea que la entrada de 97 venía dando siete días en vez de veintiuno, y a un
 * cliente que paga se le ponía una fecha de corte que la ruta automática no
 * le pone.
 *
 * ═══ POR QUÉ ESTOS NÚMEROS ═══
 *
 * **La Semana Blanca: 21 días.** Lo explica el comentario de la ruta de pago
 * y es la razón de que sean 21 y no 7: sus cinco días, su viernes en vivo
 * —aunque el corte lo mande al siguiente— y la garantía de repetir la semana.
 * Con siete no entra ni el viernes si compró un sábado.
 *
 * **Los escalones pagos: sin fecha de corte.** Es lo que ya hacían las dos
 * rutas automáticas. El Camino termina solo el día 90, porque se le acaba el
 * contenido; eso no necesita una fecha de vencimiento encima. Y lo que la app
 * le promete de Mi Clínica es que sigue siendo suya el día 91. Una fecha de
 * corte a los 45 o 90 días le apaga la app a alguien que pagó, que es el peor
 * error posible de los dos lados.
 *
 * Si Javo decide que los pagos sí vencen, se cambia acá y los tres lugares se
 * enteran juntos. Ese es el punto de que haya una sola declaración.
 */

/** Los escalones que la app conoce. Mismo vocabulario que `planes.ts`. */
export type EscalonDeAcceso = 'blanco' | 'amarillo' | 'verde' | 'negro' | 'completo';

/**
 * Días de calendario que dura el acceso, o `null` cuando no vence.
 *
 * `null` no es «no sé»: es «no se corta». Quien lea esto tiene que poder
 * distinguir las dos cosas, así que no hay ningún escalón sin entrada.
 */
export const DIAS_DE_ACCESO: Record<EscalonDeAcceso, number | null> = {
  blanco: 21,
  amarillo: null,
  verde: null,
  negro: null,
  completo: null,
};

/** La fecha de corte de un escalón, en ISO, o `null` si no vence. */
export function accesoHasta(
  escalon: EscalonDeAcceso,
  desde: Date = new Date(),
): string | null {
  const dias = DIAS_DE_ACCESO[escalon];
  if (dias === null || dias === undefined) return null;
  return new Date(desde.getTime() + dias * 86400000).toISOString();
}

/** Cómo se le dice al cliente cuánto le dura, para los botones del Admin. */
export function cuantoDura(escalon: EscalonDeAcceso): string {
  const dias = DIAS_DE_ACCESO[escalon];
  return dias === null ? 'sin vencimiento' : `+${dias}d`;
}
