/**
 * Claude API client (server-side) — wrapper liviano sobre @anthropic-ai/sdk.
 *
 * Desde mayo 2026, Claude pasa a ser fallback de texto (DeepSeek es primario
 * por costo). Pero seguimos usando Claude para vision (describe-image) y
 * cuando DeepSeek falla por rate limit / sin credito / timeout.
 *
 * Mismo shape de API que callDeepSeek() para que generate.ts y stream.ts
 * puedan tratarlos simetricamente.
 */
import Anthropic from '@anthropic-ai/sdk';
import { TOPE_MS } from './tope.js';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 16384;
const MAX_RETRIES = 2;

export interface ClaudeCallOptions {
  /** System prompt · se pasa como `system` top-level (formato Anthropic). */
  system?: string;
  /** Conversacion (sin el system). Roles: user / assistant. */
  messages: Array<{ role: string; content: string }>;
  /** Default: CLAUDE_MAX_TOKENS env var o 16384. */
  maxTokens?: number;
  /** Modelo explícito. Lo manda el enrutador por tarea; si falta, el default. */
  model?: string;
  /** 0 = determinista. Para clasificar y auditar conviene bajo. */
  temperature?: number;
}

export interface ClaudeResult {
  text: string;
  /** Uso reportado por Anthropic (input_tokens / output_tokens). */
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

/**
 * Devuelve true si ANTHROPIC_API_KEY esta configurada en el entorno.
 */
export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function normalizeRole(role: string): 'user' | 'assistant' {
  if (role === 'assistant' || role === 'model') return 'assistant';
  return 'user';
}

/**
 * Llama a Claude con reintentos automaticos sobre errores transitorios
 * (429, 500, 503, 529). Tira Error con .status si todo falla.
 */
export async function callClaude(options: ClaudeCallOptions): Promise<ClaudeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const model = options.model || process.env.CLAUDE_MODEL || DEFAULT_MODEL;
  const maxTokens = options.maxTokens
    ?? (process.env.CLAUDE_MAX_TOKENS ? Number(process.env.CLAUDE_MAX_TOKENS) : DEFAULT_MAX_TOKENS);

  // El SDK sin tope propio deja que la plataforma mate la función a mitad de
  // camino, y ahí `deshacerCobro` no llega a correr: el cliente pierde el
  // crédito por una llamada que nunca respondió. Le pasó a una clienta con la
  // generación de texto y le estaba pasando a otra con el Mentor.
  //
  // El tope va POR INTENTO y hay hasta tres, así que se divide: sumados nunca
  // pasan del tope total, y la función siempre llega a responder.
  const client = new Anthropic({
    apiKey,
    timeout: Math.floor(TOPE_MS / (MAX_RETRIES + 1)),
    maxRetries: 0,  // los reintentos los maneja el bucle de abajo, con su espera
  });

  const claudeMessages: Anthropic.MessageParam[] = options.messages.map((m) => ({
    role: normalizeRole(m.role),
    content: m.content,
  }));

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        ...(options.system ? { system: options.system } : {}),
        ...(typeof options.temperature === 'number' ? { temperature: options.temperature } : {}),
        messages: claudeMessages,
      });

      const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
      if (!text) {
        throw new Error('Claude devolvio respuesta vacia');
      }
      return { text, usage: response.usage };
    } catch (err: any) {
      lastError = err;
      const isRetryable =
        err?.status === 429 ||
        err?.status === 500 ||
        err?.status === 503 ||
        err?.status === 529;
      if (!isRetryable || attempt === MAX_RETRIES) break;
      await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
    }
  }

  throw lastError;
}
