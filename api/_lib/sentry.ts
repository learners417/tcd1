/**
 * Sentry — inicialización del SDK para los serverless functions (Node).
 *
 * Vercel ejecuta cada handler en un proceso aislado y de corta vida.
 * Llamamos a initSentry() al tope del módulo (carga única por cold start)
 * y envolvemos cada handler con withSentry() para capturar excepciones
 * y forzar el flush antes de que la función termine.
 *
 * Variables de entorno necesarias (poner en Vercel):
 *   SENTRY_DSN          → DSN del proyecto Node (obligatoria para activar)
 *   SENTRY_ENVIRONMENT  → 'production' | 'preview' | 'development' (opcional)
 *   VERCEL_GIT_COMMIT_SHA → seteado automáticamente por Vercel, lo usamos como release
 */
import * as Sentry from '@sentry/node';

let initialized = false;

function initSentry(): void {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // Sin DSN: Sentry desactivado, no rompemos nada.

  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ??
      process.env.VERCEL_ENV ??
      (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    // Tracing al 20% en prod para no consumir cuota.
    tracesSampleRate: process.env.VERCEL_ENV === 'production' ? 0.2 : 1.0,

    // No reportamos errores que sean parte del flujo normal (HTTP 4xx).
    beforeSend(event, hint) {
      const err = hint.originalException as { statusCode?: number } | undefined;
      if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
        return null;
      }
      return event;
    },
  });
}

initSentry();

type VercelHandler = (req: any, res: any) => Promise<unknown> | unknown;

/**
 * Envuelve un handler de Vercel serverless para capturar excepciones
 * y enviarlas a Sentry. Si no hay DSN configurado, es un no-op transparente.
 *
 * Uso:
 *   export default withSentry(async function handler(req, res) { ... });
 */
export function withSentry(handler: VercelHandler): VercelHandler {
  return async function wrappedHandler(req: any, res: any) {
    try {
      // Etiquetas útiles para filtrar en el dashboard de Sentry.
      Sentry.setTag('http.method', req?.method);
      Sentry.setTag('http.route', req?.url);

      return await handler(req, res);
    } catch (error: unknown) {
      Sentry.captureException(error);

      // Asegurar que el evento se envíe antes de que la lambda termine.
      // 2 segundos de timeout — si Sentry está caído, no bloqueamos al usuario.
      await Sentry.flush(2000);

      // Re-lanzamos para que Vercel devuelva 500 y el cliente se entere.
      throw error;
    }
  };
}

export { Sentry };
