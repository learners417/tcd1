/**
 * escritura-de-pago.ts — que ningún registro de pago se pierda en silencio.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * Supabase DEVUELVE el error, no lo lanza. Una escritura así:
 *
 *     await admin.from('paypal_orders').update({ status: 'captured' }).eq(…)
 *
 * se ve igual cuando funciona y cuando falla: no hay excepción, no hay nada
 * en la consola, y el `await` termina contento. Seis escrituras del cobro
 * estaban escritas de esa forma.
 *
 * La peor es la que marca la orden como capturada, porque corre DESPUÉS de
 * acreditar. Si falla:
 *
 *   · el cliente ya tiene sus créditos (acreditar es idempotente)
 *   · PayPal ya cobró
 *   · la orden queda en «pending», así que el registro dice que no pagó
 *   · y si el cliente vuelve a apretar, la guarda de idempotencia no entra
 *     —mira `status === 'captured'`, que no se escribió— así que se intenta
 *     capturar de nuevo en PayPal, que responde error porque ya está
 *     capturada. El cliente ve un error con el pago hecho.
 *
 * Lo que hace esto: mira el error, reintenta una vez —casi siempre es un
 * corte de red de un segundo— y si vuelve a fallar deja en el registro del
 * servidor TODO lo necesario para reconstruir la fila a mano, con una marca
 * que se puede buscar. Devuelve si quedó escrito, para que quien llama
 * decida qué contarle al cliente.
 */

/** La marca para buscar en el registro del servidor. */
export const MARCA = '[PAGO-SIN-REGISTRAR]';

type Resultado = { ok: true } | { ok: false; motivo: string };

/**
 * Corre una escritura del cobro mirando el error que Supabase devuelve.
 *
 * @param queEs   qué se estaba escribiendo, en palabras — va al registro
 * @param datos   lo necesario para reconstruir la fila a mano si todo falla
 * @param escribir la escritura, que se puede llamar dos veces
 */
export async function escrituraDePago(
  queEs: string,
  datos: Record<string, unknown>,
  /*
   * `PromiseLike` y no `Promise`: el constructor de consultas de Supabase se
   * puede esperar con await pero no es una promesa completa —no trae `catch`
   * ni `finally`—, así que pedirle un `Promise` lo rechaza en los seis
   * lugares donde se usa.
   */
  escribir: () => PromiseLike<{ error: { message: string } | null }>,
): Promise<Resultado> {
  for (const intento of [1, 2]) {
    let error: { message: string } | null = null;
    try {
      ({ error } = await escribir());
    } catch (err) {
      // Un corte de red sí llega como excepción; se trata igual que el error.
      error = { message: err instanceof Error ? err.message : String(err) };
    }

    if (!error) return { ok: true };

    if (intento === 1) {
      console.warn(`[pago] ${queEs} falló, reintentando una vez`, error.message);
      // Un respiro corto: la mayoría de estos errores son de un segundo.
      await new Promise((r) => setTimeout(r, 400));
      continue;
    }

    /*
     * Segundo fallo. Esto es lo único que queda entre el pago y el olvido,
     * así que va completo y con la marca, en una sola línea buscable.
     */
    console.error(MARCA, JSON.stringify({ queEs, error: error.message, ...datos }));
    return { ok: false, motivo: error.message };
  }
  return { ok: false, motivo: 'inalcanzable' };
}
