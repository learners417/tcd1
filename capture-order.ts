/**
 * /api/mcd-bridge — EL PUENTE ENTRE LAS DOS APPS HERMANAS (lado TCD)
 *
 * El navegador no puede llamar a MCD directo (CORS entre dominios).
 * Esta ruta corre en el servidor de TCD y le pregunta a MCD por el estado
 * del cliente (¿tiene un cobro verificado? → el Cinturón Rojo llega solo).
 *
 * GET /api/mcd-bridge?email=cliente@mail.com
 * → { cobro_verificado: boolean, cobros_verificados: number, total_usd: number }
 *
 * Requiere en el entorno (Vercel de TCD):
 *   TCD_INTEGRATION_KEY  → la MISMA clave que en el entorno de MCD (auth del puente)
 *   MCD_BASE_URL         → opcional; por defecto https://mcd-eight.vercel.app
 */
// Tipos mínimos (el proyecto no incluye @vercel/node — mismo estilo que las otras rutas)
type VercelRequest = { method?: string; query: Record<string, string | string[]> };
type VercelResponse = { status: (n: number) => { json: (b: unknown) => unknown } };

const MCD_BASE = process.env.MCD_BASE_URL ?? 'https://mcd-eight.vercel.app';
const INTEGRATION_KEY = process.env.TCD_INTEGRATION_KEY ?? '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const email = String(req.query.email ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'EMAIL_REQUIRED' });

  // Sin la clave, MCD responde 401 — avisamos claro en vez de fallar en silencio.
  if (!INTEGRATION_KEY) {
    return res.status(200).json({ cobro_verificado: false, mcd_status: 'sin_integration_key' });
  }

  try {
    const r = await fetch(`${MCD_BASE}/api/integrations/tcd?email=${encodeURIComponent(email)}`, {
      headers: {
        Accept: 'application/json',
        'x-integration-key': INTEGRATION_KEY, // ← lo que faltaba: sin esto, MCD devuelve 401
      },
    });
    if (!r.ok) return res.status(200).json({ cobro_verificado: false, mcd_status: r.status });

    // MCD devuelve { cobros_verificados, primer_cobro, total_usd, ... }.
    // El Dashboard espera { cobro_verificado }. Traducimos el contrato:
    const data = (await r.json()) as {
      cobros_verificados?: number;
      primer_cobro?: string | null;
      total_usd?: number;
    };
    return res.status(200).json({
      cobro_verificado: !!data?.primer_cobro, // ← primer cobro existe = el Rojo se dispara
      cobros_verificados: data?.cobros_verificados ?? 0,
      total_usd: data?.total_usd ?? 0,
      primer_cobro: data?.primer_cobro ?? null,
    });
  } catch {
    // MCD caído no debe romper TCD — el Dashboard sigue sin el Rojo automático.
    return res.status(200).json({ cobro_verificado: false, mcd_status: 'unreachable' });
  }
}
