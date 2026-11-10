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
import { accesoHasta, type EscalonDeAcceso } from '../src/lib/laVentanaDeAcceso.js';

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

/**
 * La Semana Blanca vence; los planes pagos no.
 *
 * El cuánto sale de `laVentanaDeAcceso`, que es la misma declaración que lee
 * el alta de la entrada y el botón del Admin. Escrito a mano en cada lado, el
 * número no coincidía en tres de los cinco escalones.
 */
function accesoHastaDe(plan: PlanComercial): string | null {
  return accesoHasta(plan as EscalonDeAcceso);
}

/**
 * UN COBRO NUNCA BAJA LO QUE ALGUIEN YA PAGÓ.
 *
 * ═══ QUÉ PASABA ═══
 *
 * `plan_comercial` y `acceso_hasta` se escribían sin mirar qué había. Gana el
 * último webhook, no el escalón más alto. Entonces un producto viejo de GHL
 * que manda `plan: "blanco"`, un workflow que se dispara doble sobre un order
 * bump, o un reenvío de un cobro de hace meses, dejaba al cliente de $3.000
 * con los cinco días abiertos **y un vencimiento a 21 días**. Pagó el Ascenso
 * y la app le cerró el Camino: el fallo más caro que puede tener esta ruta,
 * porque no hay ningún error en ninguna pantalla — simplemente ahí se le
 * termina lo que compró.
 *
 * ═══ LA REGLA ═══
 *
 * Un cobro sólo puede querer decir «pagó esto». Nunca «pagó menos»: para eso
 * no hay cobro que lo justifique. Así que esta ruta escribe el acceso cuando
 * es igual o más alto que el que la ficha ya tiene, y se abstiene cuando
 * sería más bajo. Bajarle el acceso a alguien es del Admin, donde lo hace una
 * persona que sabe por qué.
 *
 * `completo` son los clientes de siempre y está arriba de todo: un cobro no
 * los degrada tampoco.
 */
const ALTURA_DEL_ACCESO: Record<string, number> = {
  blanco: 1, amarillo: 2, verde: 3, negro: 4, completo: 4,
};

/** La misma regla para el escalón de servicio: el equipo no entrega de menos. */
const ALTURA_DEL_SERVICIO: Record<string, number> = { base: 1, ascenso: 2, instalacion: 3 };

/** ¿Lo que se pagó está igual o más arriba que lo que la ficha ya dice? */
function noEsUnaBaja(altura: Record<string, number>, pagado: string, enLaFicha?: string | null): boolean {
  return (altura[pagado] ?? 0) >= (altura[String(enLaFicha ?? '')] ?? 0);
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
    type Ficha = {
      id: string;
      plan_comercial?: string | null;
      servicio_contratado?: string | null;
      servicio_marcado_el?: string | null;
    };
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
    //
    // `servicio_contratado` se escribe SOLO si vino un ticket. Con un color
    // no se toca: adivinarlo es el puente que hacía figurar a un cliente de
    // $497 con la instalación completa contratada.
    const cambios: Record<string, unknown> = {};
    const leMueveElAcceso = noEsUnaBaja(ALTURA_DEL_ACCESO, plan, ficha?.plan_comercial);
    if (leMueveElAcceso) {
      cambios.plan_comercial = plan;
      cambios.acceso_hasta = accesoHastaDe(plan);
    }

    /*
     * EL PAGO SELLA LA FECHA, NO SÓLO EL ESCALÓN.
     *
     * `servicio_contratado` es `not null default 'base'`, así que la columna
     * sola no distingue «pagó La Base» de «nadie lo marcó nunca». Por eso
     * `topeDelEscalon` pregunta por la FECHA —`estaMarcado`— y con la fecha
     * vacía apaga el tope entero: sin ella, el de La Base abría los noventa
     * días, la puerta de su primera etapa no aparecía nunca, y las entregas
     * del equipo no se disparaban para el que pagó La Instalación.
     *
     * Esta ruta escribía el escalón y dejaba la fecha en null, o sea que la
     * venta automática producía exactamente la ficha que el tope ignora. El
     * pago ES el momento en que una persona lo habría marcado a mano.
     *
     * La fecha se escribe una sola vez: es cuándo se encendió el tope para
     * esta ficha, y un cobro repetido no la mueve.
     *
     * ═══ Y SÓLO SI ESTE COBRO ES SU ESCALÓN ═══
     *
     * Sellar la fecha ENCIENDE el tope, así que sellarla de más quita días.
     * El caso: un cliente de siempre —'completo'— al que le entra un cobro de
     * La Base por un order bump o un workflow mal apuntado. Su acceso no se
     * mueve (la regla de arriba lo protege), pero si acá se le sellara el
     * escalón 'base' el Camino se le cortaría en el día 12: perdería los días
     * 13 al 90 que ya tenía, y por una columna que nadie mira.
     *
     * De ahí la condición: el escalón se sella sólo cuando este cobro TAMBIÉN
     * le movió el acceso, o sea cuando de verdad es el escalón que compró. Un
     * cobro que no le abrió nada no puede cerrarle nada.
     */
    const yaMarcado = Boolean(ficha?.servicio_marcado_el);
    const sube = !yaMarcado || noEsUnaBaja(ALTURA_DEL_SERVICIO, ticket ?? '', ficha?.servicio_contratado);
    if (ticket && leMueveElAcceso && sube) {
      cambios.servicio_contratado = ticket;
      if (!yaMarcado) cambios.servicio_marcado_el = new Date().toISOString();
    }

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
