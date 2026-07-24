/**
 * safeStorage.ts — Lectura segura de localStorage (optimización · jul 2026)
 * Elimina una clase entera de crashes: si el localStorage se corrompe o el
 * usuario tiene datos viejos, la app NO se rompe — devuelve el fallback.
 */

/** Parsea un valor de localStorage con fallback garantizado. Nunca tira. */
export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Guarda en localStorage sin tirar si el storage está lleno o bloqueado. */
export function safeSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Lee el perfil del usuario (el objeto más leído de la app) de forma segura. */
export function getProfile(): Record<string, unknown> {
  return safeGet<Record<string, unknown>>('tcd_profile', {});
}
