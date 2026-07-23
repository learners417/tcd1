/**
 * /api/ghl-webhook — AC1 · EL LOOP AUTOMÁTICO
 *
 * Recibe el webhook de "pago recibido" de GoHighLevel y provisiona el plan del
 * comprador en la app, sin intervención humana. GHL hace el checkout (order
 * form + PayPal, con sus bumps/upsells); esta ruta desbloquea el acceso.
 *
 * Configurar en GHL (Workflow → trigger "pago recibido" → acción Webhook):
 *   POST   https://<tu-app>/api/ghl-webhook
 *   Header x-ghl-secret: <GHL_WEBHOOK_SECRET>
 *   Body   { "email": "{{contact.email}}", "plan": "verde" }
 *          plan = blanco | amarillo | verde | negro  (según el producto)
 *
 * Env en Vercel:
 *   SUPABASE_URL (o VITE_SUPABASE_URL) · SUPABASE_SERVICE_ROLE_KEY · GHL_WEBHOOK_SECRET
 *
 * Reusa getAdminClient del sistema de créditos (mismo cliente service-role).
 * Idempotente por naturaleza: re-setear el mismo plan no hace daño.
 */
import { getAdminClient } from './_lib/credits-server.js';

const PLANES_VALIDOS = ['blanco', 'amarillo', 'verde', 'negro'] as const;
type PlanComercial = (typeof PLANES_VALIDOS)[number];

/** La Semana Blanca vence a los 7 días; los planes pagos no vencen. */
function accesoHastaDe(plan: PlanComercial): string | null {
  // 21 días: sus 5 días + su viernes en vivo (aunque el corte lo mande al siguiente)
  // + la garantía de repetir la semana. Después entra el modo lectura digno.
  if (plan === 'blanco') return new Date(Date.now() + 21 * 86400000).toISOString();
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const secret = req.headers['x-ghl-secret'] || req.body?.secret;
  if (!process.env.GHL_WEBHOOK_SECRET || secret !== process.env.GHL_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  const email = String(req.body?.email ?? '')
    .trim()
    .toLowerCase();
  const plan = String(req.body?.plan ?? '').trim() as PlanComercial;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'EMAIL_REQUIRED' });
  if (!PLANES_VALIDOS.includes(plan)) return res.status(400).json({ error: 'PLAN_INVALIDO' });

  try {
    const admin = getAdminClient();

    // 1) Buscar el user por email.
    const { data: list } = await admin.auth.admin.listUsers();
    let userId = (list?.users as Array<{ id: string; email?: string }> | undefined)?.find(
      (u) => (u.email ?? '').toLowerCase() === email,
    )?.id;

    // 2) Si no existe (entrada del $27), crearlo. El trigger arma el perfil y
    //    Supabase le manda el mail de acceso.
    if (!userId) {
      const { data: invitado, error: invErr } = await admin.auth.admin.inviteUserByEmail(email);
      if (invErr || !invitado?.user) {
        const { data: creado, error: cErr } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          password: `TCD-${Math.random().toString(36).slice(2, 12)}!`,
        });
        if (cErr || !creado?.user) {
          return res.status(200).json({ ok: false, motivo: 'no se pudo crear el usuario' });
        }
        userId = creado.user.id;
      } else {
        userId = invitado.user.id;
      }
    }

    // 3) Setear el plan y el acceso → los pilares se desbloquean solos.
    const { error: upErr } = await admin
      .from('profiles')
      .update({ plan_comercial: plan, acceso_hasta: accesoHastaDe(plan) })
      .eq('id', userId);
    if (upErr) return res.status(200).json({ ok: false, motivo: upErr.message });

    return res.status(200).json({ ok: true, plan });
  } catch (e: any) {
    // Siempre 200 para que GHL no reintente en loop; el motivo queda en la respuesta.
    return res.status(200).json({ ok: false, motivo: e?.message ?? 'error' });
  }
}
