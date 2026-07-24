/**
 * /api/alta-numero — EL ALTA AUTOMÁTICA DEL COMPRADOR DE $27
 *
 * GHL (workflow "Order Submitted" del producto EL NÚMERO) llama acá con el
 * email del comprador. Este endpoint, del lado servidor:
 *   1. Crea el usuario en Supabase y le envía el email de invitación
 *      ("crea tu contraseña y entra") — el link solo para él.
 *   2. Deja su perfil con plan 'ELNUMERO' → la app le abre su tramo
 *      (Semilla + Sanar el Dinero + EL NÚMERO) y el resto del Camino
 *      queda a la vista, bloqueado (la venta interna del camino completo).
 *   3. Si el usuario ya existía, NO pisa un plan superior (un cliente DWY
 *      que compra el $27 sigue siendo DWY).
 *
 * Seguridad: requiere la clave en el header `x-alta-key` o en `?key=`.
 * Vale ALTA_NUMERO_KEY o, si no está, TCD_INTEGRATION_KEY (la del puente).
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

const SUPA_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ALTA_KEY = process.env.ALTA_NUMERO_KEY ?? process.env.TCD_INTEGRATION_KEY ?? '';
const REDIRECT = process.env.ALTA_REDIRECT_URL ?? 'https://app.tuclinica.digital';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const keyRecibida = String(req.headers['x-alta-key'] ?? req.query.key ?? '');
  if (!ALTA_KEY || keyRecibida !== ALTA_KEY) {
    return res.status(401).json({ error: 'NO_AUTORIZADO' });
  }
  if (!SUPA_URL || !SERVICE_KEY) {
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

  const admin = createClient(SUPA_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    // 1) Invitar (crea el usuario + manda el email con el link para crear contraseña)
    let userId: string | null = null;
    let estado = 'invitado';
    const { data: inv, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: REDIRECT,
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

    // 2) Perfil con plan ELNUMERO — sin pisar un plan superior
    const { data: perfil } = await admin.from('profiles').select('id, plan, nombre').eq('id', userId).maybeSingle();
    if (!perfil) {
      await admin.from('profiles').insert({ id: userId, nombre: nombre || email.split('@')[0], plan: 'ELNUMERO', acceso_hasta: new Date(Date.now() + 21 * 86400000).toISOString() });
    } else if (!perfil.plan) {
      await admin.from('profiles').update({ plan: 'ELNUMERO', acceso_hasta: new Date(Date.now() + 21 * 86400000).toISOString() }).eq('id', userId);
    } // si ya tiene DWY/DFY/IMPLEMENTACION, no se toca

    return res.status(200).json({ ok: true, estado, plan_resultante: perfil?.plan ?? 'ELNUMERO' });
  } catch (e) {
    return res.status(500).json({ error: 'ALTA_FALLO', detalle: e instanceof Error ? e.message : 'desconocido' });
  }
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
