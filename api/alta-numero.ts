/**
 * /api/alta-numero — EL ALTA AUTOMÁTICA DEL COMPRADOR DEL ESCALÓN DE ENTRADA
 *
 * GHL (workflow "Order Submitted" del producto EL NÚMERO) llama acá con el
 * email del comprador. Este endpoint, del lado servidor:
 *   1. Crea el usuario en Supabase y le envía el email de invitación
 *      ("crea tu contraseña y entra") — el link solo para él.
 *   2. Deja su perfil con plan 'ELNUMERO' → la app le abre su tramo
 *      (Semilla + Sanar el Dinero + EL NÚMERO) y el resto del Camino
 *      queda a la vista, bloqueado (la venta interna del camino completo).
 *   3. Si el usuario YA EXISTÍA de antes, no le pisa su plan: un cliente DWY
 *      que compra la entrada sigue siendo DWY.
 *
 * ═══ POR QUÉ EL PUNTO 3 MIRA SI EL USUARIO ES NUEVO, Y NO SU PLAN ═══
 *
 * Porque `on_auth_user_created` —el trigger de `fix-supabase.sql`— inserta el
 * perfil con `plan = 'DWY'` en el mismo instante en que se crea el usuario.
 * Así que cuando esta ruta iba a mirar el perfil, el perfil YA ESTABA, y ya
 * traía un plan.
 *
 * Esta ruta preguntaba «¿ya tiene plan?» y se abstenía. El resguardo era para
 * el cliente viejo y le caía a TODOS los compradores nuevos: quedaban en
 * 'DWY', que en `planDe` es 'completo' —noventa y nueve pilares—. **El que
 * pagaba el escalón de entrada se llevaba los noventa días gratis**, sin
 * ventana de vencimiento, y no quedaba nada que ofrecerle a $1.000: el
 * siguiente escalón de la escalera no existía para él.
 *
 * La pregunta correcta no es qué dice la columna, es QUIÉN la escribió. Si el
 * usuario lo acabamos de crear nosotros, lo que haya en `plan` es el default
 * del trigger y no lo compró nadie. Si el usuario ya existía, su plan es de
 * él y no se toca.
 *
 * Seguridad: requiere la clave en el header `x-alta-key` o en `?key=`.
 * Vale ALTA_NUMERO_KEY o, si no está, TCD_INTEGRATION_KEY (la del puente).
 *
 * El entorno se lee DENTRO del handler, no al cargar el módulo: arriba, la
 * clave quedaba fijada en el primer arranque —rotarla exigía un redeploy— y
 * la ruta era imposible de ejecutar en una prueba. Eso es, literalmente, por
 * qué nadie la había corrido nunca. Lo prueba
 * `scripts/prueba-el-recorrido-del-que-paga.ts`.
 *
 * Env necesarias en el Vercel de TCD:
 *   SUPABASE_SERVICE_ROLE_KEY  → Settings→API de Supabase (la secreta)
 *   VITE_SUPABASE_URL          → ya está (la usa la app)
 *   ALTA_REDIRECT_URL          → opcional; default https://app.tuclinica.digital
 */
import { createClient } from '@supabase/supabase-js';

type VercelRequest = {
  method?: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type VercelResponse = { status: (n: number) => { json: (b: unknown) => unknown } };

/** Los 21 días de calendario que tiene para hacer sus 5 sesiones. */
const DIAS_DE_LA_VENTANA = 21;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const supaUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const altaKey = process.env.ALTA_NUMERO_KEY ?? process.env.TCD_INTEGRATION_KEY ?? '';
  const redirect = process.env.ALTA_REDIRECT_URL ?? 'https://app.tuclinica.digital';

  const keyRecibida = String(req.headers['x-alta-key'] ?? req.query.key ?? '');
  if (!altaKey || keyRecibida !== altaKey) {
    return res.status(401).json({ error: 'NO_AUTORIZADO' });
  }
  if (!supaUrl || !serviceKey) {
    return res.status(500).json({ error: 'FALTA_SUPABASE_SERVICE_ROLE_KEY' });
  }

  // GHL manda JSON; tomamos email + nombre de los campos habituales del contacto
  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<string, unknown> | null;
  const email = String(
    body?.email ?? body?.contact_email ?? (body?.contact as Record<string, unknown> | undefined)?.email ?? '',
  ).trim().toLowerCase();
  const nombre = String(
    body?.nombre ?? body?.first_name ?? body?.full_name ?? body?.name ?? '',
  ).trim();

  if (!email || !email.includes('@')) return res.status(400).json({ error: 'EMAIL_REQUERIDO' });

  const admin = createClient(supaUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    // 1) Invitar (crea el usuario + manda el email con el link para crear contraseña)
    let userId: string | null = null;
    let estado = 'invitado';
    const { data: inv, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirect,
      data: nombre ? { full_name: nombre } : undefined,
    });
    if (inv?.user?.id) {
      userId = inv.user.id;
    } else if (invErr) {
      // Ya registrado: lo buscamos y seguimos (idempotente)
      const { data: lista } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const usuarios = (lista?.users ?? []) as Array<{ id: string; email?: string | null }>;
      const existente = usuarios.find((u) => (u.email ?? '').toLowerCase() === email);
      if (!existente) return res.status(500).json({ error: 'INVITE_FALLO', detalle: invErr.message });
      userId = existente.id;
      estado = 'ya_existia';
    }
    if (!userId) return res.status(500).json({ error: 'SIN_USER_ID' });

    /*
     * El usuario es NUESTRO si lo acabamos de crear. En ese caso, lo que haya
     * en `plan` lo puso el trigger, no una compra: su plan de verdad es el de
     * la entrada. Si ya existía, el plan es suyo y no se toca.
     */
    const recienCreado = estado === 'invitado';

    // 2) Perfil con plan ELNUMERO — sin pisar el plan de un cliente de antes
    const { data: perfil } = await admin
      .from('profiles').select('id, plan, nombre, fecha_inicio, email').eq('id', userId).maybeSingle();
    /*
     * La fecha de inicio se sella acá, en el alta.
     *
     * En el Camino de noventa días la sella la antesala al cerrarse. El tramo
     * de cinco no pasa por la antesala, así que sin esto se quedaba sin día
     * uno: el ritmo caía al día 1 por defecto y la alarma de inactividad del
     * equipo lo salteaba, porque esa alarma se corta en los clientes que no
     * tienen fecha. Nadie se enteraba de que había dejado de entrar.
     */
    const hoy = new Date().toISOString().slice(0, 10);
    const accesoHasta = new Date(Date.now() + DIAS_DE_LA_VENTANA * 86400000).toISOString();
    let planResultante = (perfil?.plan as string | null) ?? 'ELNUMERO';

    if (!perfil) {
      /*
       * El email va en el insert. Es la columna por la que `/api/ghl-webhook`
       * busca al cliente cuando sube de escalón: un perfil sin email lo
       * obliga a caer en su respaldo —paginar `auth.users`— justo para los
       * clientes que la venta automática crea.
       */
      await admin.from('profiles').insert({
        id: userId, email, nombre: nombre || email.split('@')[0],
        plan: 'ELNUMERO', fecha_inicio: hoy, acceso_hasta: accesoHasta,
      });
      planResultante = 'ELNUMERO';
    } else if (recienCreado || !perfil.plan) {
      // Una fecha de inicio anterior no se pisa: si ya empezó un camino, ese es su día uno.
      const cambios: Record<string, unknown> = { plan: 'ELNUMERO', acceso_hasta: accesoHasta };
      if (!perfil.fecha_inicio) cambios.fecha_inicio = hoy;
      if (!perfil.email) cambios.email = email;
      await admin.from('profiles').update(cambios).eq('id', userId);
      planResultante = 'ELNUMERO';
    } // si ya existía con su plan (DWY/DFY/IMPLEMENTACION), no se toca

    return res.status(200).json({ ok: true, estado, plan_resultante: planResultante });
  } catch (e) {
    return res.status(500).json({ error: 'ALTA_FALLO', detalle: e instanceof Error ? e.message : 'desconocido' });
  }
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
