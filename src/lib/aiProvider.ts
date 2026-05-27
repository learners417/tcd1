/**
 * aiProvider.ts — Cliente unificado de generacion de texto.
 *
 * Habla solo con `/api/ai/generate` y `/api/ai/stream`. El backend decide
 * que proveedor usar (DeepSeek primario · Claude fallback). El cliente NO
 * elige proveedor · si fuera necesario forzarlo se hace via env var
 * server-side (FORCE_AI_PROVIDER en Vercel).
 *
 * Gemini sigue usandose en campanasImageGen.ts para GENERACION de imagenes ·
 * ese flujo es independiente y no usa este modulo.
 *
 * Reintentos del cliente: cuando el endpoint server devuelve un error
 * transitorio (5xx · timeout) hacemos hasta CLIENT_RETRIES intentos con
 * backoff. Errores no-transitorios (4xx) se propagan sin retry.
 */

const API_BASE = '/api/ai';

const CLIENT_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1500;

export interface AIGenerateOptions {
  /** Single prompt (used when messages is not provided) */
  prompt?: string;
  /** System instruction / persona */
  systemInstruction?: string;
  /** Multi-turn conversation messages */
  messages?: Array<{ role: string; content: string }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isTransientError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { status?: number; message?: string };
  if (e.status === 429 || e.status === 502 || e.status === 503 || e.status === 504 || e.status === 529) {
    return true;
  }
  const msg = (e.message ?? '').toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('etimedout') ||
    msg.includes('econnreset') ||
    msg.includes('network')
  );
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return '';
    try {
      const parsed = JSON.parse(text);
      return parsed?.details || parsed?.error || text.slice(0, 200);
    } catch {
      return text.slice(0, 200);
    }
  } catch {
    return '';
  }
}

function makeError(status: number, detail: string): Error & { status: number } {
  const err = new Error(
    `IA API error: ${status}${detail ? ` — ${detail}` : ''}`,
  ) as Error & { status: number };
  err.status = status;
  return err;
}

// ─── Non-streaming text generation ──────────────────────────────────────────

export async function generateText(options: AIGenerateOptions): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= CLIENT_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw makeError(res.status, await safeReadError(res));
      }

      const data = await res.json();
      if (typeof data?.text !== 'string') {
        throw new Error('IA API devolvio respuesta vacia');
      }
      return data.text;
    } catch (err) {
      lastError = err;
      if (!isTransientError(err) || attempt === CLIENT_RETRIES) break;
      await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('IA no pudo responder · proba de nuevo en unos segundos.');
}

// ─── Streaming text generation ──────────────────────────────────────────────

export async function* streamText(
  options: AIGenerateOptions,
): AsyncGenerator<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= CLIENT_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('text/event-stream')) {
        throw makeError(res.status, await safeReadError(res));
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') return;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.text) yield parsed.text;
              if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (err) {
      lastError = err;
      if (!isTransientError(err) || attempt === CLIENT_RETRIES) break;
      await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('IA no pudo responder · proba de nuevo en unos segundos.');
}
