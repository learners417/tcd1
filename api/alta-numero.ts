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
 * ═══ Y DESDE EL 18 DE NOVIEMBRE, EL COBRO QUE NO ES LA ENTRADA ═══
 *
 * El cuerpo acepta un `plan` opcional:
 *
 *   { "email": "...", "nombre": "...", "plan": "ascenso" }
 *     plan = base | ascenso | instalacion   ← las ofertas de hoy
 *            blanco | amarillo | verde | negro   ← los planes de acceso
 *
 * Sin `plan`, esta ruta hace exactamente lo de antes: la entrada.
 *
 * Por qué hizo falta. Medido el 18 de noviembre por la API de GHL: los tres
 * flujos que cobran La Base ($1.000), La Mentoría ($3.000) y La Instalación
 * ($6.000) llaman a **esta ruta**, con `{email, nombre}`, y ninguno llama a
 * `/api/ghl-webhook`. Así que el que pagaba 1.000, 3.000 o 6.000 quedaba con
 * `plan = 'ELNUMERO'` y sin `plan_comercial`: `planDe` le devolvía 'blanco'
 * —los cinco días de la entrada— y una ventana de 21 días. El día 22 la app
 * se le apagaba, sin un error en ninguna pantalla. No le pasó a nadie todavía
 * porque los clientes de El Ascenso se dieron de alta a mano.
 *
 * Lo que el `plan` abre NO está escrito acá: lo resuelve `loQueAbreElPago`,
 * la misma declaración que lee `/api/ghl-webhook`. Dos copias de «qué abre
 * cada oferta» se separan la primera vez que cambia un precio.
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
import { DIAS_DE_ACCESO } from '../src/lib/laVentanaDeAcceso.js';
import { loQueSePago, cambiosDelPago, type FichaDelPago } from './_lib/loQueAbreElPago.js';

type VercelRequest = {
  method?: string;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type VercelResponse = { status: (n: number) => { json: (b: unknown) => unknown } };

/**
 * Los días de calendario que tiene para hacer sus 5 sesiones.
 *
 * Sale de `laVentanaDeAcceso`, que es la misma declaración que lee el webhook
 * de los escalones y el botón del Admin. Escrito a mano acá, el número era
 * 21 en esta ruta, 21 en el webhook y 7 en el Admin — y como el acceso hoy se
 * abre siempre desde el Admin, el que llegaba al cliente era el 7.
 */
const DIAS_DE_LA_VENTANA = DIAS_DE_ACCESO.blanco ?? 21;

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

  /*
   * EL COBRO QUE NO ES LA ENTRADA.
   *
   * `plan` es opcional: sin él, esta ruta es la de siempre. Con él, lo que se
   * escribe lo decide `loQueAbreElPago`, la misma declaración del webhook.
   *
   * Un plan que no se vende se rechaza con 400 en vez de darse de alta como
   * la entrada: si GHL manda un nombre de producto que acá no existe —un
   * typo en el cuerpo del flujo, una oferta nueva sin agregar— el silencio
   * sería que el que pagó 6.000 recibe los cinco días. Eso es justo lo que
   * este turno vino a cerrar, y no se puede cerrar dejando la puerta de al
   * lado abierta.
   */
  const planPedido = String(body?.plan ?? '').trim().toLowerCase();
  const pagado = planPedido ? loQueSePago(planPedido) : null;
  if (planPedido && !pagado) return res.status(400).json({ error: 'PLAN_INVALIDO' });

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
    /*
     * Las tres columnas del pago se leen también. Antes esta ruta leía cinco
     * columnas y ninguna era del cobro, así que no tenía con qué comparar: es
     * literalmente por qué no podía resolver un plan sin pisarle el acceso a
     * quien ya había pagado más arriba.
     */
    const COLUMNAS = 'id, plan, nombre, fecha_inicio, email, plan_comercial, servicio_contratado, servicio_marcado_el';
    const { data: perfil } = await admin
      .from('profiles').select(COLUMNAS).eq('id', userId).maybeSingle();
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

    if (pagado) {
      /*
       * ═══ EL CAMINO DEL COBRO: LO QUE SE PAGÓ, NO LA ENTRADA ═══
       *
       * Las columnas las decide `cambiosDelPago` —la misma declaración del
       * webhook—, que ya trae la regla de que un cobro nunca baja lo que
       * alguien pagó, la de no adivinar el servicio desde un color, y la del
       * sello del escalón una sola vez.
       *
       * ═══ Y ACÁ NO SE ESCRIBE `plan = 'ELNUMERO'` ═══
       *
       * `plan` dice POR DÓNDE ENTRÓ, y `enElTramoDelNumero` lo lee crudo: con
       * 'ELNUMERO' puesto, el que pagó El Ascenso recibía la bienvenida de los
       * cinco días y el Tablero del tramo corto —`WelcomeWizard` y
       * `Dashboard` preguntan por esa función, no por `plan_comercial`—. El
       * acceso le habría quedado bien y las dos pantallas mal, que es el tipo
       * de fallo que no tiene mensaje de error.
       *
       * Así que en este camino `plan` se deja como está. Lo que manda es
       * `plan_comercial`, que es lo que `planDe` mira primero: lo que pagó le
       * gana a por dónde entró.
       */
      const cambios: Record<string, unknown> = { ...cambiosDelPago(pagado, perfil as FichaDelPago | null) };
      if (!perfil) {
        /*
         * `plan` va con 'DWY' —el valor del trigger—, no vacío y no
         * 'ELNUMERO'.
         *
         * Vacío, porque `profiles.plan` no está declarada en ninguna
         * migración del repo: la columna es anterior a `supabase/migrations`
         * y se creó en el panel, así que desde acá NO se puede afirmar que
         * acepte null. Insertar sin ella sería apostar a un default que no
         * podemos leer, y el caso en que se ejecuta —un usuario viejo en auth
         * sin fila en profiles— es justo el que nadie prueba a mano.
         *
         * Y no 'ELNUMERO' por lo de la lente 23: esa columna dice por dónde
         * entró y `enElTramoDelNumero` la lee cruda. 'DWY' es exactamente lo
         * que tendría la fila si el trigger la hubiera creado, que es el caso
         * normal; lo que pagó lo dice `plan_comercial`, que es lo que `planDe`
         * mira primero.
         */
        await admin.from('profiles').insert({
          id: userId, email, nombre: nombre || email.split('@')[0],
          plan: 'DWY', fecha_inicio: hoy, ...cambios,
        });
      } else {
        // Igual que en la entrada: una fecha de inicio anterior no se pisa.
        if (!perfil.fecha_inicio) cambios.fecha_inicio = hoy;
        if (!perfil.email) cambios.email = email;
        if (Object.keys(cambios).length > 0) {
          await admin.from('profiles').update(cambios).eq('id', userId);
        }
      }
      /*
       * Y se relee: un `update ... where id = ...` sobre una fila que no está
       * afecta cero filas y contesta bien. Sin esto, GHL registraba un cobro
       * provisionado que no abrió nada. Es la misma relectura del webhook.
       */
      const { data: despues } = await admin.from('profiles').select(COLUMNAS).eq('id', userId).maybeSingle();
      const quedo = (despues as { plan_comercial?: string | null } | null)?.plan_comercial ?? null;
      return res.status(200).json({
        ok: true, estado, plan: pagado.plan, servicio: pagado.ticket ?? null, acceso: quedo,
      });
    }

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
