/**
 * errors.ts
 * Utilidades para manejar y reportar errores de forma consistente.
 *
 * Los errores de Supabase/PostgREST NO son instancias de Error: son objetos
 * planos { code, message, details, hint }. Si se pasan tal cual a
 * Sentry.captureException, Sentry los agrupa como "Object captured as exception
 * with keys: ...", perdiendo el mensaje real. Estas funciones normalizan eso.
 */
import { Sentry } from './sentry';

/**
 * Extrae un mensaje legible de un error desconocido, incluyendo los errores de
 * Supabase/PostgREST (objetos planos con message/details/hint/code).
 */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [e.message, e.details, e.hint, e.code]
      .filter((p): p is string => typeof p === 'string' && p.length > 0);
    if (parts.length > 0) return parts.join(' · ');
  }
  return 'Error desconocido';
}

interface ReportContext {
  /** Área funcional, ej. 'metricas-embudo'. */
  feature: string;
  /** Acción concreta, ej. 'guardar-metricas'. */
  action: string;
  /** Contexto extra para depurar (ids, fechas, etc.). */
  extra?: Record<string, unknown>;
}

/**
 * Reporta un error a Sentry con contexto y devuelve un mensaje legible para
 * mostrar al usuario. Envuelve errores planos en un Error real para que Sentry
 * los agrupe por mensaje en vez de "Object captured as exception".
 */
export function reportError(err: unknown, ctx: ReportContext): string {
  const message = errorMessage(err);
  const wrapped = err instanceof Error ? err : new Error(message);
  Sentry.captureException(wrapped, {
    tags: { feature: ctx.feature, action: ctx.action },
    extra: { ...ctx.extra, originalError: err },
  });
  return message;
}
