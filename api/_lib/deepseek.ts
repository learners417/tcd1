/**
 * DeepSeek API client (server-side) — usado como fallback de Claude cuando
 * la API de Anthropic devuelve errores transitorios o se queda sin credito.
 *
 * La API de DeepSeek es OpenAI-compatible · no requiere SDK propio · solo
 * fetch directo contra https://api.deepseek.com/v1/chat/completions.
 *
 * Modelo default: deepseek-chat (apunta a la version estable mas reciente
 * publicada por DeepSeek · al momento de escribir esto suele ser V3.x).
 * Si DeepSeek lanza un V4 con id distinto · override via env var
 * DEEPSEEK_MODEL sin necesidad de redeploy.
 *
 * Limites a tener en cuenta:
 *   - DeepSeek (V3 y V4) NO acepta imagenes en el prompt. Esto NO es un
 *     problema para nuestro pipeline porque las imagenes se convierten a
 *     texto via /api/ai/describe-image (Claude Vision) ANTES de llegar a
 *     generate/stream. DeepSeek solo recibe texto.
 *   - El parametro `system` se mapea a un message con role: "system" al
 *     inicio de la lista (formato OpenAI · no top-level como Anthropic).
 */

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_MAX_TOKENS = 8192;

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCallOptions {
  /** System prompt · se mapea a primer mensaje con role: "system". */
  system?: string;
  /** Conversacion (sin el system). Roles: user / assistant. */
  messages: Array<{ role: string; content: string }>;
  /** Default: DEEPSEEK_MAX_TOKENS env var o 8192. */
  maxTokens?: number;
  /** Default: 0.7 · valores bajos = mas determinista. */
  temperature?: number;
}

export interface DeepSeekResult {
  text: string;
  /** Uso de tokens reportado por DeepSeek · util para logging/billing. */
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * Devuelve true si DEEPSEEK_API_KEY esta configurada en el entorno.
 * Sin esto · el fallback no debe intentarse (devolveria error confuso).
 */
export function isDeepSeekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

/**
 * Normaliza el role para DeepSeek (rechaza "model" que viene del lado Gemini).
 */
function normalizeRole(role: string): 'user' | 'assistant' {
  if (role === 'assistant' || role === 'model') return 'assistant';
  return 'user';
}

/**
 * Llama a DeepSeek sin streaming. Tira Error con la causa real si falla.
 */
export async function callDeepSeek(options: DeepSeekCallOptions): Promise<DeepSeekResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const maxTokens = options.maxTokens
    ?? (process.env.DEEPSEEK_MAX_TOKENS ? Number(process.env.DEEPSEEK_MAX_TOKENS) : DEFAULT_MAX_TOKENS);

  const payloadMessages: DeepSeekMessage[] = [];
  if (options.system && options.system.trim()) {
    payloadMessages.push({ role: 'system', content: options.system });
  }
  for (const m of options.messages) {
    payloadMessages.push({ role: normalizeRole(m.role), content: m.content });
  }

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      max_tokens: maxTokens,
      temperature: options.temperature ?? 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    const err = new Error(
      `DeepSeek API error: ${response.status}${detail ? ` — ${detail}` : ''}`,
    ) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: DeepSeekResult['usage'];
  };

  const text = data.choices?.[0]?.message?.content ?? '';
  if (!text) {
    throw new Error('DeepSeek devolvio respuesta vacia');
  }

  return { text, usage: data.usage };
}

async function safeReadText(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text.slice(0, 500);
  } catch {
    return '';
  }
}

/**
 * Heuristica generica: vale la pena hacer fallback al otro proveedor tras
 * un error? Aplica tanto a errores de Claude como de DeepSeek porque ambos
 * exponen codigos HTTP estandar de la familia OpenAI-like.
 *
 * Fallback SI:
 *   - Credito agotado:
 *       · Anthropic devuelve 400 con "credit_balance"
 *       · DeepSeek devuelve 402 Payment Required ("insufficient_balance")
 *   - Rate limit / overload (429, 503, 529)
 *   - Server errors (500, 502, 504)
 *   - Timeouts / fallas de red
 *
 * Fallback NO:
 *   - 401 / 403 (API key invalida en ese proveedor · es config, no transient)
 *   - 404 (modelo no existe · config)
 *   - 422 (prompt malformado · el otro proveedor tambien lo rechazaria)
 *   - Otros 400 no relacionados a credito
 */
export function shouldFallback(err: unknown): boolean {
  const e = err as { status?: number; message?: string } | undefined;
  if (!e) return false;

  const status = e.status;
  const msg = (e.message ?? '').toLowerCase();

  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504 || status === 529) {
    return true;
  }
  // Anthropic: 400 + credit_balance message
  if (status === 400 && (msg.includes('credit_balance') || msg.includes('credit balance'))) {
    return true;
  }
  // DeepSeek: 402 Payment Required (insufficient balance)
  if (status === 402 || msg.includes('insufficient_balance') || msg.includes('insufficient balance')) {
    return true;
  }
  if (
    msg.includes('etimedout') ||
    msg.includes('econnreset') ||
    msg.includes('socket hang up') ||
    msg.includes('network') ||
    msg.includes('timeout')
  ) {
    return true;
  }
  return false;
}

/** @deprecated Use shouldFallback() · misma logica con mejor naming. */
export const claudeErrorShouldFallback = shouldFallback;
