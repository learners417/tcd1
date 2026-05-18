/**
 * Parsea una fecha que puede venir como:
 *   - `YYYY-MM-DD` (Postgres DATE) → la interpreta como **fecha local** a las 00:00.
 *   - ISO timestamp completo (`YYYY-MM-DDTHH:mm:ss...`) → delega en `new Date(...)`.
 *
 * Importante: `new Date("2026-05-18")` lo trata como UTC. En zonas con offset
 * negativo (Argentina UTC-3), eso "retrocede" un día al pasar a hora local, lo
 * cual hacía que tareas con vencimiento hoy se mostraran como "Vencida ayer".
 */
export function parseDateLocal(date: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (m) {
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d));
  }
  return new Date(date);
}

/** Devuelve la misma fecha al inicio del día (00:00 local). */
export function startOfDayLocal(date: Date): Date {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  return out;
}
