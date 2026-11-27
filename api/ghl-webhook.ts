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
/*
 * QUÉ ABRE CADA OFERTA, QUÉ LE DEBE EL EQUIPO Y POR QUÉ UN COBRO NUNCA BAJA
 * NADA: todo eso vivía acá, y el 18 de noviembre se mudó a
 * `loQueAbreElPago` entero, sin cambiarle una línea de sentido.
 *
 * El motivo: los tres flujos de GHL que cobran La Base, La Mentoría y La
 * Instalación no llaman a esta ruta, llaman a `/api/alta-numero`. Para que esa
 * ruta resuelva un cobro como lo resuelve esta, hay dos caminos: copiar esto
 * allá, o declararlo una vez y que las dos lo lean. Dos copias de «qué abre
 * cada oferta» se separan la primera vez que cambia un precio.
 */
import {
  loQueSePago, cambiosDelPago, noEsUnaBaja, ALTURA_DEL_ACCESO,
  type FichaDelPago,
} from './_lib/loQueAbreElPago.js';

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

  /*
   * ─── LA CUENTA DE AGENDAS, ANTES DEL COBRO ──────────────────────────────
   *
   * Vino de la rama `mejoras` (Javo, 24 nov) y entra tal cual: es un evento
   * distinto del pago y sale por su propio return, así que el camino del
   * cobro de abajo queda intacto.
   *
   * Cuenta sin contar dos veces: guarda el id de cada cita en
   * `processed_appointment_ids` y solo suma cuando el id es nuevo. Así un
   * reenvío del mismo webhook —que GHL hace— no infla el número.
   *
   * Si el correo no tiene ficha, no cuenta nada y contesta ok: quien agenda
   * sin ser cliente todavía no tiene dónde sumarse. Es a propósito.
   */
  const event = String(req.body?.event ?? '').trim();
  const appointment_id = String(req.body?.appointment_id ?? '').trim();

  if (event === 'cita_agendada') {
    if (!email || !email.includes('@')) return res.status(400).json({ ok: false, motivo: 'EMAIL_REQUIRED' });
    if (!appointment_id) return res.status(400).json({ ok: false, motivo: 'APPOINTMENT_ID_REQUIRED' });

    try {
      const admin = getAdminClient();
      const { data: perfilExistente, error: fetchError } = await admin
        .from('profiles')
        .select('id, agendas_count, processed_appointment_ids')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) {
        return res.status(200).json({ ok: false, motivo: fetchError.message });
      }

      if (perfilExistente) {
        const processedAppointments: string[] = perfilExistente.processed_appointment_ids || [];
        if (!processedAppointments.includes(appointment_id)) {
          const newAgendasCount = (perfilExistente.agendas_count || 0) + 1;
          processedAppointments.push(appointment_id);

          const { error: updateError } = await admin
            .from('profiles')
            .update({
              agendas_count: newAgendasCount,
              processed_appointment_ids: processedAppointments,
            })
            .eq('id', perfilExistente.id);

          if (updateError) {
            return res.status(200).json({ ok: false, motivo: updateError.message });
          }
        }
      }
      return res.status(200).json({ ok: true, event: 'cita_agendada', appointment_id });
    } catch (e: any) {
      return res.status(200).json({ ok: false, motivo: e?.message ?? 'error' });
    }
  }

  // ─── Desde acá, el camino del cobro, igual que antes ─────────────────────
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'EMAIL_REQUIRED' });

  // El ticket pagado decide las dos columnas; un color, solo el acceso.
  const pagado = loQueSePago(pedido);
  if (!pagado) return res.status(400).json({ error: 'PLAN_INVALIDO' });
  const { plan, ticket } = pagado;

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
    type Ficha = FichaDelPago & { id: string };
    const COLUMNAS = 'id, plan_comercial, servicio_contratado, servicio_marcado_el';
    const { data: perfilExistente } = await admin
      .from('profiles').select(COLUMNAS).eq('email', email).maybeSingle();
    let ficha = perfilExistente as Ficha | null;
    let userId = ficha?.id;

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

    // La ficha puede no haber aparecido por email (un perfil viejo sin esa
    // columna, o uno escrito con mayúsculas): con el id ya resuelto, se lee.
    if (!ficha) {
      const { data } = await admin.from('profiles').select(COLUMNAS).eq('id', userId).maybeSingle();
      ficha = data as Ficha | null;
    }

    // 3) Setear el plan y el acceso → los pilares se desbloquean solos.
    /*
     * Las columnas que este cobro escribe sobre esta ficha las decide
     * `cambiosDelPago`, que es la misma declaración que lee `/api/alta-numero`.
     * Ahí están escritos los tres motivos: que un cobro nunca baje el acceso,
     * que `servicio_contratado` no se adivine de un color, y que la fecha del
     * escalón se selle una sola vez y sólo cuando el cobro de verdad le abrió
     * algo.
     */
    const cambios = cambiosDelPago(pagado, ficha);

    if (Object.keys(cambios).length > 0) {
      const { error: upErr } = await admin.from('profiles').update(cambios).eq('id', userId);
      if (upErr) return res.status(200).json({ ok: false, motivo: upErr.message });
    }

    /*
     * Y SE VERIFICA QUE LA ESCRITURA HAYA CAÍDO EN ALGÚN LADO.
     *
     * Un `update ... where id = ...` sobre una fila que no existe no es un
     * error: afecta cero filas y contesta bien. Esta ruta devolvía `ok: true`
     * y en GHL quedaba registrado un cobro provisionado que no abrió nada.
     * Con la relectura, el motivo queda escrito donde se lo puede ver.
     */
    const { data: despues } = await admin.from('profiles').select(COLUMNAS).eq('id', userId).maybeSingle();
    const quedo = (despues as Ficha | null)?.plan_comercial;
    if (!noEsUnaBaja(ALTURA_DEL_ACCESO, String(quedo ?? ''), plan)) {
      return res.status(200).json({ ok: false, motivo: 'el cobro no quedó escrito en la ficha del cliente' });
    }

    return res.status(200).json({ ok: true, plan, servicio: ticket ?? null, acceso: quedo });
  } catch (e: any) {
    // Siempre 200 para que GHL no reintente en loop; el motivo queda en la respuesta.
    return res.status(200).json({ ok: false, motivo: e?.message ?? 'error' });
  }
}
