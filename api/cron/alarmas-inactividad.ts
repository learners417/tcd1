/**
 * GET /api/cron/alarmas-inactividad
 *
 * Cron diario que detecta clientes inactivos y avisa a Lupe (admins):
 *   - detectar_diario_inactivo()    → 3+ días sin llenar el diario
 *   - detectar_metricas_inactivas() → 10+ días sin cargar métricas
 *
 * Ambos RPC son SECURITY DEFINER e idempotentes por día (notificar_lupe no
 * repite la misma alarma el mismo día). Se programa en vercel.json.
 *
 * Auth: Vercel manda `Authorization: Bearer <CRON_SECRET>` a /api/cron/* si
 * CRON_SECRET está configurado en el dashboard.
 */

import { getAdminClient } from '../_lib/credits-server.js';
import { withSentry, Sentry } from '../_lib/sentry.js';

async function handler(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
  }

  try {
    const admin = getAdminClient();

    const [diario, metricas] = await Promise.all([
      admin.rpc('detectar_diario_inactivo'),
      admin.rpc('detectar_metricas_inactivas'),
    ]);

    if (diario.error) {
      console.error('[cron/alarmas-inactividad] diario failed', diario.error);
      Sentry.captureException(diario.error);
    }
    if (metricas.error) {
      console.error('[cron/alarmas-inactividad] metricas failed', metricas.error);
      Sentry.captureException(metricas.error);
    }
    if (diario.error && metricas.error) {
      return res.status(500).json({ error: diario.error.message });
    }

    const diarioCount = typeof diario.data === 'number' ? diario.data : 0;
    const metricasCount = typeof metricas.data === 'number' ? metricas.data : 0;
    console.log(`[cron/alarmas-inactividad] diario=${diarioCount} metricas=${metricasCount}`);
    return res.status(200).json({ ok: true, diarioInactivos: diarioCount, metricasInactivas: metricasCount });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    Sentry.captureException(err);
    return res.status(500).json({ error: msg });
  }
}

export default withSentry(handler);
