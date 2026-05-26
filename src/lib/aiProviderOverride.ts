/**
 * aiProviderOverride.ts — Switch admin-only para forzar el proveedor de IA.
 *
 * Por default la app usa Claude con fallback transparente a DeepSeek. Para
 * testear el camino de DeepSeek sin tener que romper la API key de Anthropic,
 * el owner puede forzar `'deepseek'` desde el panel admin (Topbar). Tambien
 * puede forzar `'claude'` para verificar que Claude esta operativo sin
 * confundirse con respuestas del fallback.
 *
 * SEGURIDAD: el header `X-AI-Provider` que se manda al backend es trust-the-
 * client. Un usuario con devtools podria forzarlo manualmente. Como las dos
 * opciones (Claude / DeepSeek) ya estan configuradas en el server con sus
 * propias API keys, el blast radius es nulo: solo se elige entre dos
 * proveedores ya autorizados. No expone secretos ni habilita acciones extra.
 * Si en el futuro se agregan modelos premium o gateways pagados, conviene
 * mover esto a un check server-side contra el rol del usuario.
 */

export type AIProviderOverride = 'auto' | 'claude' | 'deepseek';

const STORAGE_KEY = 'tcd_ai_provider_override';

/**
 * Lee la preferencia actual del localStorage. Devuelve 'auto' si no hay
 * override (comportamiento normal: Claude → DeepSeek).
 */
export function getAIProviderOverride(): AIProviderOverride {
  if (typeof window === 'undefined') return 'auto';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'claude' || v === 'deepseek') return v;
  } catch {
    /* localStorage bloqueado · usar default */
  }
  return 'auto';
}

/**
 * Persiste la preferencia. Pasar 'auto' borra el override.
 */
export function setAIProviderOverride(override: AIProviderOverride): void {
  if (typeof window === 'undefined') return;
  try {
    if (override === 'auto') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, override);
    }
  } catch {
    /* localStorage bloqueado · ignorar */
  }
}

/**
 * Devuelve headers de override listos para meter en fetch · o `{}` si no hay
 * override. Mandamos DOS variantes (con y sin prefijo X-) porque algunos
 * CDN/firewalls filtran headers no-estandar X-*. El server lee la primera
 * que encuentre.
 */
export function buildProviderHeader(): Record<string, string> {
  const override = getAIProviderOverride();
  if (override === 'auto') return {};
  return { 'X-AI-Provider': override, 'AI-Provider': override };
}
