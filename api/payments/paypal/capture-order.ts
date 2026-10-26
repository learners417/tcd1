/**
 * POST /api/payments/paypal/capture-order
 *
 * Captura el pago de una orden ya aprobada por el usuario.
 * Llamada despues de que PayPal popup dispara onApprove en el cliente.
 *
 * Body: { orderId: string }
 * Auth: Authorization: Bearer <supabase_jwt>
 *
 * Response 200: { credits: number, balance: { ... } }
 * Response 401: { error: 'UNAUTHORIZED' }
 * Response 400: { error: 'ORDER_NOT_FOUND' | 'ORDER_NOT_YOURS' | 'AMOUNT_MISMATCH' }
 *
 * Flujo seguro:
 *   1. Verificar JWT
 *   2. Buscar paypal_orders por id · verificar que pertenece al user
 *   3. Capturar en PayPal API
 *   4. Verificar amount/currency contra el snapshot guardado (anti-fraude)
 *   5. RPC grant_credits (idempotente sobre paypal_order_id)
 *   6. Actualizar paypal_orders status='captured'
 *
 * NOTA: El webhook tambien procesa CHECKOUT.ORDER.APPROVED y PAYMENT.CAPTURE.COMPLETED
 * como red de seguridad · grant_credits es idempotente, asi que doble proceso no duplica.
 */

import {
  extractJwt,
  getUserIdFromJwt,
  getAdminClient,
  grantCreditsFromPayPal,
} from '../../_lib/credits-server.js';
import { captureOrder } from '../../_lib/paypal.js';
import { escrituraDePago } from '../../_lib/escritura-de-pago.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const jwt = extractJwt(req);
  if (!jwt) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const userId = await getUserIdFromJwt(jwt);
  if (!userId) return res.status(401).json({ error: 'UNAUTHORIZED' });

  // ─── Validar body ───────────────────────────────────────────────────────────
  const body = (req.body ?? {}) as { orderId?: unknown };
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  if (!orderId) {
    return res.status(400).json({ error: 'INVALID_ORDER_ID' });
  }

  try {
    const admin = getAdminClient();

    // ─── Verificar que la orden existe y es del user ─────────────────────────
    const { data: order, error: orderError } = await admin
      .from('paypal_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      return res.status(500).json({ error: 'DB error', message: orderError.message });
    }
    if (!order) {
      return res.status(400).json({ error: 'ORDER_NOT_FOUND' });
    }
    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'ORDER_NOT_YOURS' });
    }

    // Idempotencia: si ya esta capturada, devolver balance actual
    if (order.status === 'captured') {
      const { data: credits } = await admin
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return res.status(200).json({
        credits: order.credits,
        balance: credits,
        alreadyCaptured: true,
      });
    }

    // ─── Capturar en PayPal ──────────────────────────────────────────────────
    const captureResult = await captureOrder(orderId);

    if (captureResult.status !== 'COMPLETED') {
      await escrituraDePago(
        'marcar la orden como fallida (la captura no completó)',
        { orderId, userId, estadoPayPal: captureResult.status },
        () => admin
          .from('paypal_orders')
          .update({
            status: 'failed',
            raw_capture_response: captureResult as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId),
      );
      return res.status(400).json({
        error: 'CAPTURE_NOT_COMPLETED',
        message: `Status: ${captureResult.status}`,
      });
    }

    // ─── Verificar amount + currency (anti-fraude) ───────────────────────────
    const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) {
      return res.status(400).json({ error: 'CAPTURE_MISSING' });
    }
    const paidValue = parseFloat(capture.amount.value);
    const expectedValue = Number(order.amount_usd);
    if (capture.amount.currency_code !== 'USD' || Math.abs(paidValue - expectedValue) > 0.01) {
      await escrituraDePago(
        'marcar la orden como fallida (el monto no coincide)',
        { orderId, userId, pagado: capture.amount.value, esperado: expectedValue },
        () => admin
          .from('paypal_orders')
          .update({
            status: 'failed',
            raw_capture_response: captureResult as unknown as Record<string, unknown>,
          })
          .eq('id', orderId),
      );
      return res.status(400).json({
        error: 'AMOUNT_MISMATCH',
        message: `Paid ${capture.amount.value} ${capture.amount.currency_code}, expected ${expectedValue} USD`,
      });
    }

    // ─── Acreditar (idempotente) ──────────────────────────────────────────────
    await grantCreditsFromPayPal({
      userId,
      credits: order.credits,
      packId: order.pack_id,
      paypalOrderId: orderId,
    });

    /*
     * ─── Marcar la orden como capturada ──────────────────────────────────
     *
     * Esta corre DESPUÉS de acreditar, y es la que no se puede perder: si
     * falla, el cliente tiene sus créditos y PayPal cobró, pero la orden
     * queda en «pending». El registro diría que no pagó, y un segundo
     * intento del cliente no entraría por la guarda de idempotencia —que
     * mira justamente este campo— así que volvería a capturar en PayPal y
     * vería un error con el pago hecho.
     */
    const registro = await escrituraDePago(
      'marcar la orden como capturada',
      {
        orderId,
        userId,
        creditos: order.credits,
        packId: order.pack_id,
        capturaPayPal: capture.id,
        acreditado: true,
      },
      () => admin
        .from('paypal_orders')
        .update({
          status: 'captured',
          paypal_capture_id: capture.id,
          paypal_payer_email: captureResult.payer?.email_address ?? null,
          raw_capture_response: captureResult as unknown as Record<string, unknown>,
          captured_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId),
    );

    // ─── Devolver nuevo balance ──────────────────────────────────────────────
    const { data: credits } = await admin
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    /*
     * Los créditos están acreditados, así que para el cliente el pago salió
     * bien y la respuesta es 200. `registroPendiente` es para el equipo:
     * dice que la fila de la orden quedó sin actualizar y que el detalle
     * completo está en el registro del servidor, bajo [PAGO-SIN-REGISTRAR].
     */
    return res.status(200).json({
      credits: order.credits,
      balance: credits,
      ...(registro.ok ? {} : { registroPendiente: true }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[paypal/capture-order] failed', msg);
    return res.status(500).json({ error: 'CAPTURE_FAILED', message: msg });
  }
}
