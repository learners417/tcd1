/**
 * /api/mcd-bridge — EL PUENTE ENTRE LAS DOS APPS HERMANAS (lado TCD)
 *
 * El navegador no puede llamar a MCD directo (CORS entre dominios).
 * Esta ruta corre en el servidor de TCD y le pregunta a MCD por el estado
 * del cliente (¿tiene un cobro verificado? → el Cinturón Rojo llega solo).
 *
 * GET /api/mcd-bridge?email=cliente@mail.com
 * → { cobro_verificado: boolean, ... } (el JSON de MCD, tal cual)
 */
// Tipos mínimos (el proyecto no incluye @vercel/node — mismo estilo que las otras rutas)
type VercelRequest = { method?: string; query: Record<string, string | string[]> };
type VercelResponse = { status: (n: number) => { json: (b: unknown) => unknown } };

const MCD_BASE = process.env.MCD_BASE_URL ?? 'https://mcd-eight.vercel.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const email = String(req.query.email ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'EMAIL_REQUIRED' });

  try {
    const r = await fetch(`${MCD_BASE}/api/integrations/tcd?email=${encodeURIComponent(email)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) return res.status(200).json({ cobro_verificado: false, mcd_status: r.status });
    const data = await r.json();
    return res.status(200).json(data);
  } catch {
    // MCD caído no debe romper TCD — el Dashboard sigue sin el Rojo automático.
    return res.status(200).json({ cobro_verificado: false, mcd_status: 'unreachable' });
  }
}
