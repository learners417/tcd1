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
 *   Body   { "email": "{{contact.email}}", "plan": "base" }
 *          plan = base | ascenso | instalacion   ← las ofertas de hoy
 *                 blanco | amarillo | verde | negro   ← los planes de acceso
 *
 * Env en Vercel:
 *   SUPABASE_URL (o VITE_SUPABASE_URL) · SUPABASE_SERVICE_ROLE_KEY · GHL_WEBHOOK_SECRET
 *
 * Reusa getAdminClient del sistema de créditos (mismo cliente service-role).
 * Idempotente por naturaleza: re-setear el mismo plan no hace daño.
 *
 * ═══ POR QUÉ ACEPTA LOS DOS VOCABULARIOS ═══
 *
 * Esta ruta aceptaba SOLO los cuatro colores. Las ofertas que se venden son
 * La Base, El Ascenso y La Instalación, así que el producto de GHL que mandaba
 * `plan: "base"` recibía PLAN_INVALIDO: **el cliente pagaba y no se le abría
 * nada.** La venta automática se cortaba en el servidor.
 *
 * Los colores se siguen aceptando porque son los que gobiernan el acceso y hay
 * productos viejos en GHL que los mandan.
 */
import { getAdminClient } from './_lib/credits-server.js';

const PLANES_VALIDOS = ['blanco', 'amarillo', 'verde', 'negro'] as const;
type PlanComercial = (typeof PLANES_VALIDOS)[number];

const TICKETS_VALIDOS = ['base', 'ascenso', 'instalacion'] as const;
type Ticket = (typeof TICKETS_VALIDOS)[number];

/**
 * QUÉ ABRE CADA OFERTA, Y QUÉ LE DEBE EL EQUIPO.
 *
 * ═══ ESTO NO ES EL PUENTE PROHIBIDO ═══
 *
 * `cuadroTickets` quitó —y documentó— una tabla que **adivinaba** el servicio
 * contratado a partir del plan de acceso: `verde → $5.000`. Con eso, alguien
 * que había pagado $497 de acceso figuraba con la instalación completa
 * contratada, y el equipo que trabajara contra esa ficha instalaba gratis.
 *
 * Acá el sentido es el contrario y es el único lugar con autoridad para
 * decirlo: el webhook **sabe qué producto se pagó**, y de ese dato salen las
 * dos respuestas a la vez —qué pantallas ve y qué le debe el equipo— sin
 * deducir una de la otra. Si esto no lo escribiera el pago, lo tendría que
 * marcar una persona a mano en el Admin, y entonces la venta no es automática.
 *
 * El tope de acceso de cada oferta coincide con `topeDelEscalon`: La Base
 * llega al día 12, que es el pilar 2 ('amarillo'); El Ascenso y La Instalación
 * abren los 90 días ('negro') y se diferencian en quién monta, no en qué ve.
 */
const LO_QUE_ABRE: Record<Ticket, PlanComercial> = {
  base: 'amarillo',
  ascenso: 'negro',
  instalacion: 'negro',
};

/** La Semana Blanca vence a los 21 días; los planes pagos no vencen. */
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
  const pedido = String(req.body?.plan ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'EMAIL_REQUIRED' });

  // El ticket pagado decide las dos columnas; un color, solo el acceso.
  const ticket = (TICKETS_VALIDOS as readonly string[]).includes(pedido) ? (pedido as Ticket) : null;
  const plan = (ticket ? LO_QUE_ABRE[ticket] : pedido) as PlanComercial;
  if (!PLANES_VALIDOS.includes(plan)) return res.status(400).json({ error: 'PLAN_INVALIDO' });

  try {
    const admin = getAdminClient();

    // 1) Buscar el user por email.
    //
    // Se busca en `profiles` y NO con listUsers(): esa función devuelve solo
    // la primera página —cincuenta usuarios— y a partir del cliente 51 no
    // encontraba a quien ya existía. El resultado era que intentaba crearlo
    // de nuevo: o fallaba, o le mandaba una segunda invitación a alguien que
    // ya tenía cuenta. Un error que no se ve hasta que el negocio crece, que
    // es exactamente cuando peor duele.
    const { data: perfilExistente } = await admin
      .from('profiles').select('id').eq('email', email).maybeSingle();
    let userId = (perfilExistente as { id: string } | null)?.id;

    // Respaldo: si el perfil todavía no existe pero el usuario sí (una cuenta
    // vieja sin perfil), se busca paginando de verdad.
    if (!userId) {
      for (let pagina = 1; pagina <= 20 && !userId; pagina++) {
        const { data: list } = await admin.auth.admin.listUsers({ page: pagina, perPage: 200 });
        const encontrados = (list?.users ?? []) as Array<{ id: string; email?: string }>;
        userId = encontrados.find((u) => (u.email ?? '').toLowerCase() === email)?.id;
        if (encontrados.length < 200) break;
      }
    }

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
    //
    // `servicio_contratado` se escribe SOLO si vino un ticket. Con un color
    // no se toca: adivinarlo es el puente que hacía figurar a un cliente de
    // $497 con la instalación completa contratada.
    const cambios: Record<string, unknown> = {
      plan_comercial: plan,
      acceso_hasta: accesoHastaDe(plan),
    };
    if (ticket) cambios.servicio_contratado = ticket;

    const { error: upErr } = await admin.from('profiles').update(cambios).eq('id', userId);
    if (upErr) return res.status(200).json({ ok: false, motivo: upErr.message });

    return res.status(200).json({ ok: true, plan, servicio: ticket ?? null });
  } catch (e: any) {
    // Siempre 200 para que GHL no reintente en loop; el motivo queda en la respuesta.
    return res.status(200).json({ ok: false, motivo: e?.message ?? 'error' });
  }
}
