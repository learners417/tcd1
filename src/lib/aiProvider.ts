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

/**
 * CORTE DURO. Sin esto, un modelo colgado deja la pantalla girando para
 * siempre: no había ningún timeout real en toda la cadena, solo la palabra
 * en los comentarios.
 *
 * Está por debajo del techo de la función en el servidor (ver vercel.json)
 * para que el corte lo haga el cliente y pueda mostrar una frase, en vez de
 * recibir un 504 pelado de la plataforma.
 */
const TIMEOUT_MS = 75_000;

/** fetch que se corta solo. Deja un error legible, no un cuelgue. */
async function fetchConCorte(url: string, init: RequestInit): Promise<Response> {
  const ac = new AbortController();
  const reloj = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') {
      const e = new Error(
        'La IA tardó demasiado en responder. No se te descontó nada — prueba otra vez.',
      ) as Error & { status: number; corte: boolean };
      e.status = 504;
      e.corte = true;
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(reloj);
  }
}

export interface AIGenerateOptions {
  /** Single prompt (used when messages is not provided) */
  prompt?: string;
  /** System instruction / persona */
  systemInstruction?: string;
  /** Multi-turn conversation messages */
  messages?: Array<{ role: string; content: string }>;
  /** Herramienta que dispara la llamada. Solo las de PRODUCCION cobran
   *  credito (constructor, copy, creativo, stories). El Mentor y el Camino
   *  no mandan feature y por lo tanto son gratis. */
  feature?: string;
  /** Qué trabajo es. Decide el modelo en el servidor (api/_lib/router.ts).
   *  Sin declarar cae en 'general' = la cadena histórica. */
  tarea?: 'guion' | 'chat' | 'estructura' | 'auditoria' | 'general';
}

/** El userId sale del perfil espejado; asi ninguna herramienta se lo tiene
 *  que acordar y no hay forma de cobrarle al usuario equivocado. */
function userIdActual(): string | undefined {
  try {
    const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}');
    return typeof p?.id === 'string' && p.id ? p.id : undefined;
  } catch { return undefined; }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isTransientError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { status?: number; message?: string };
  // 402 y 429 son decisiones, no fallas: reintentar es insistir contra una
  // puerta cerrada y gastar tokens de más.
  if (e.status === 402 || e.status === 429) return false;
  // 502 = el servidor YA recorrió toda la cadena de proveedores con sus
  // propios reintentos. Volver a pedir multiplica las llamadas al modelo
  // (3 intentos del cliente × 2 proveedores × 3 intentos internos = 18 por
  // un solo clic) y no cambia el resultado.
  if (e.status === 502) return false;
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

/**
 * Cuando el servidor frena (sin créditos o pasado de tope), el cliente tiene
 * que ver una frase que se entienda, no "IA API error: 402". El servidor ya
 * manda el texto en `message`: es lo primero que se busca.
 */
async function safeReadError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return '';
    try {
      const parsed = JSON.parse(text);
      return parsed?.message || parsed?.details || parsed?.error || text.slice(0, 200);
    } catch {
      return text.slice(0, 200);
    }
  } catch {
    return '';
  }
}

/** Los frenos hablan en castellano; el resto sí lleva el código técnico. */
const FRENOS: Record<number, string> = {
  402: 'Te quedaste sin créditos este mes.',
  429: 'Llegaste al máximo de consultas por ahora.',
};

function makeError(status: number, detail: string): Error & { status: number; frenado?: boolean } {
  const frenado = status === 402 || status === 429;
  const err = new Error(
    frenado
      ? (detail || FRENOS[status])
      : `IA API error: ${status}${detail ? ` — ${detail}` : ''}`,
  ) as Error & { status: number; frenado?: boolean };
  err.status = status;
  if (frenado) err.frenado = true;
  return err;
}

// ─── Non-streaming text generation ──────────────────────────────────────────

export async function generateText(options: AIGenerateOptions): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= CLIENT_RETRIES; attempt++) {
    try {
      const res = await fetchConCorte(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...options, userId: userIdActual() }),
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
    : new Error('IA no pudo responder · prueba de nuevo en unos segundos.');
}

// ─── Streaming text generation ──────────────────────────────────────────────

export async function* streamText(
  options: AIGenerateOptions,
): AsyncGenerator<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= CLIENT_RETRIES; attempt++) {
    try {
      const res = await fetchConCorte(`${API_BASE}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...options, userId: userIdActual() }),
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
    : new Error('IA no pudo responder · prueba de nuevo en unos segundos.');
}
