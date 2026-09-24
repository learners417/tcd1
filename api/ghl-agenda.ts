/**
 * /api/ghl-agenda — LA AGENDA QUE ENTRA SOLA
 *
 * ═══ POR QUÉ ESTE NÚMERO Y NO OTRO ═══
 *
 * La agenda es el dato **más difícil de cargar a mano**: pasa en cualquier
 * momento del día, y para cuando alguien lo anota ya pasaron tres.
 *
 * Y es el que más importa, porque es el que separa dos diagnósticos muy
 * distintos: **si el problema es el mensaje o si es la llamada.** Sin
 * agendas, el embudo se corta justo en el medio y todo lo de abajo queda a
 * ciegas.
 *
 * Usa el mismo mecanismo que `ghl-webhook.ts`, que ya funciona en producción
 * para el cobro. No hace falta API de Meta, ni tokens, ni acceso de socio:
 * es una URL pegada una vez en el workflow de cada cliente.
 *
 * ═══ CONFIGURAR EN GHL ═══
 *
 *   Workflow → trigger «Appointment Booked» → acción Webhook:
 *     POST   https://<tu-app>/api/ghl-agenda
 *     Header x-ghl-secret: <GHL_WEBHOOK_SECRET>
 *     Body   { "email": "{{contact.email}}" }
 *
 * El email es del CLIENTE de TCD (el dueño de la cuenta de GHL), no del
 * paciente que agendó: lo que se cuenta es una agenda PARA ese sanador.
 *
 * ═══ LO QUE NUNCA HACE ═══
 *
 * No falla ruidosamente. Si algo sale mal, responde 200 igual y lo registra:
 * **GHL reintenta los webhooks que fallan**, y un reintento que suma una
 * agenda dos veces ensucia el diagnóstico de toda la semana. Es preferible
 * perder una agenda que contar de más.
 */

import { createClient } from '@supabase/supabase-js';
import { withSentry } from './_lib/sentry.js';

/** La semana ISO, igual que en el resto de la app: '2026-W31'. */
function semanaISO(d = new Date()): string {
  const f = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = f.getUTCDay() || 7;
  f.setUTCDate(f.getUTCDate() + 4 - dia);
  const eneUno = new Date(Date.UTC(f.getUTCFullYear(), 0, 1));
  const n = Math.ceil(((f.getTime() - eneUno.getTime()) / 86400000 + 1) / 7);
  return `${f.getUTCFullYear()}-W${String(n).padStart(2, '0')}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secreto = process.env.GHL_WEBHOOK_SECRET;
  if (secreto && req.headers['x-ghl-secret'] !== secreto) {
    // Acá sí se rechaza: un webhook sin el secreto no es un reintento, es
    // alguien que no debería estar mandando nada.
    return res.status(401).json({ error: 'no autorizado' });
  }

  const email = String(req.body?.email ?? '').trim().toLowerCase();
  if (!email) {
    console.warn('[ghl-agenda] llegó sin email');
    return res.status(200).json({ ok: false, motivo: 'sin email' });
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) {
    console.error('[ghl-agenda] falta la configuración de Supabase');
    return res.status(200).json({ ok: false, motivo: 'sin configurar' });
  }

  try {
    const db = createClient(url, clave);

    const { data: perfil } = await db
      .from('profiles').select('id').eq('email', email).maybeSingle();

    if (!perfil?.id) {
      // No es un error: puede ser una cuenta de GHL que no es de un cliente.
      console.warn('[ghl-agenda] email sin cliente:', email);
      return res.status(200).json({ ok: false, motivo: 'cliente no encontrado' });
    }

    const { error } = await db.rpc('sumar_campo', {
      p_cliente: perfil.id,
      p_semana: semanaISO(),
      p_campo: 'agendas',
      p_cuanto: 1,
      p_quien: 'webhook',
    });
    if (error) throw new Error(error.message);

    return res.status(200).json({ ok: true });
  } catch (err) {
    // 200 a propósito: GHL reintenta lo que falla, y un reintento que suma
    // dos veces ensucia el diagnóstico de la semana entera. Es preferible
    // perder una agenda que contar de más.
    console.error('[ghl-agenda] falló:',
      err instanceof Error ? err.message : String(err));
    return res.status(200).json({ ok: false });
  }
}

export default withSentry(handler);
