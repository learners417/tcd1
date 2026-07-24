/**
 * Sentry — inicialización del SDK para el frontend (React + Vite).
 *
 * Se ejecuta una sola vez al arrancar la app, desde src/main.tsx.
 * Si VITE_SENTRY_DSN no está seteada (ej. en dev local), Sentry queda
 * desactivado silenciosamente — la app sigue funcionando normal.
 *
 * Variables de entorno necesarias (poner en .env.local y en Vercel):
 *   VITE_SENTRY_DSN          → DSN del proyecto React (obligatoria para activar)
 *   VITE_SENTRY_ENVIRONMENT  → 'production' | 'preview' | 'development' (opcional)
 *   VITE_APP_VERSION         → release tag, ej. commit SHA (opcional)
 */
import * as Sentry from '@sentry/react';

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const ENVIRONMENT =
  (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) ??
  (import.meta.env.MODE === 'production' ? 'production' : 'development');
const RELEASE = import.meta.env.VITE_APP_VERSION as string | undefined;

export function initSentry(): void {
  if (!DSN) {
    // Sin DSN no inicializamos — útil en dev local sin querer reportar nada.
    if (import.meta.env.DEV) {
      console.info('[sentry] VITE_SENTRY_DSN no configurado, Sentry desactivado.');
    }
    return;
  }

  Sentry.init({
    dsn: DSN,
    environment: ENVIRONMENT,
    release: RELEASE,

    // ─── Performance Monitoring (tracing) ──────────────────────────────
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Por privacidad: enmascarar texto e inputs del usuario por defecto.
        // Si querés ver el contenido real en los replays, poné estos en false.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Muestreo de traces: 100% en dev, 20% en prod para no consumir cuota.
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,

    // ─── Session Replay ────────────────────────────────────────────────
    // Replays de sesiones normales: 10% (muestra representativa).
    replaysSessionSampleRate: 0.1,
    // Replays cuando hay un error: 100% (queremos ver TODOS los errores).
    replaysOnErrorSampleRate: 1.0,

    // ─── Filtros de ruido ──────────────────────────────────────────────
    ignoreErrors: [
      // Errores típicos de extensiones del browser / ad blockers.
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      // Errores de red transitorios que no son bugs de la app.
      'NetworkError when attempting to fetch resource',
      'Load failed',
    ],
  });

  if (import.meta.env.DEV) {
    console.info('[sentry] inicializado en entorno:', ENVIRONMENT);
  }
}

/**
 * Asocia un usuario logueado con los eventos de Sentry.
 * Llamar después de login exitoso. Llamar con `null` al hacer logout.
 */
export function setSentryUser(user: { id: string; email?: string } | null): void {
  if (!DSN) return;
  if (user === null) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: user.id, email: user.email });
}

// Re-exportamos lo que vamos a usar desde otros archivos.
export { Sentry };
