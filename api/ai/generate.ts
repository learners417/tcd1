/**
 * Vercel Serverless Function — Non-streaming text generation.
 *
 * Cadena de proveedores (server-side, transparente para el frontend):
 *   1) Claude (Anthropic) · modelo en const MODEL.
 *   2) DeepSeek · solo si Claude falla con un error donde el fallback tiene
 *      sentido (credito agotado, rate limit, server error, timeout).
 *      Ver claudeErrorShouldFallback() en api/_lib/deepseek.ts.
 *
 * El frontend siempre llama a este mismo endpoint · no se entera de cual
 * proveedor respondio. El response JSON incluye `provider` para debugging.
 */
import Anthropic from '@anthropic-ai/sdk';
import { callDeepSeek, claudeErrorShouldFallback, isDeepSeekConfigured } from '../_lib/deepseek.js';

interface AIMessage {
  role: string;
  content: string;
}

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 16384;
const MAX_RETRIES = 2;

// Vercel function config · sin esto el default es 10s (hobby) o 60s (pro).
// Los entrenadores tienen system prompts grandes (voz-javo + ADN + dialecto +
// prompt especifico del agente) · Claude puede tardar mas de 10s y Vercel
// devolveria 502 Bad Gateway. Alineado con stream.ts.
export const config = { maxDuration: 120 };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { prompt, systemInstruction, messages } = req.body ?? {};

  const aiMessages: AIMessage[] = messages
    ? (messages as AIMessage[])
    : [{ role: 'user', content: prompt }];

  // Override admin-only. Aceptamos ambas variantes (con y sin prefijo X-) por
  // si algun CDN/proxy filtra headers no-estandar X-*.
  const rawHeaderXprefix = req.headers?.['x-ai-provider'];
  const rawHeaderNoPrefix = req.headers?.['ai-provider'];
  const providerOverride = String(rawHeaderXprefix ?? rawHeaderNoPrefix ?? '').toLowerCase();
  const forceDeepSeek = providerOverride === 'deepseek';
  const forceClaude = providerOverride === 'claude';
  // Log SIEMPRE · para confirmar que el header llega (o no) en cada request.
  console.log(`[api/ai/generate] headers IA · x-ai-provider="${rawHeaderXprefix ?? ''}" · ai-provider="${rawHeaderNoPrefix ?? ''}" · resolved="${providerOverride}" · forceDeepSeek=${forceDeepSeek} · forceClaude=${forceClaude} · deepseekConfigured=${isDeepSeekConfigured()}`);

  // ─── 0) Atajo: forzar DeepSeek (testing admin) ─────────────────────────
  if (forceDeepSeek) {
    if (!isDeepSeekConfigured()) {
      return res.status(500).json({
        error: 'DEEPSEEK_API_KEY not configured',
        forced: 'deepseek',
      });
    }
    try {
      const { text, usage } = await callDeepSeek({
        system: systemInstruction,
        messages: aiMessages,
        maxTokens: MAX_TOKENS,
      });
      return res.status(200).json({ text, provider: 'deepseek', forced: true, usage });
    } catch (dsErr) {
      const dsMsg = dsErr instanceof Error ? dsErr.message : String(dsErr);
      console.error('[api/ai/generate] DeepSeek (forced) failed:', dsMsg);
      return res.status(502).json({ error: 'DeepSeek API error', details: dsMsg, forced: 'deepseek' });
    }
  }

  // ─── 1) Claude (primario) ──────────────────────────────────────────────
  try {
    const client = new Anthropic({ apiKey });

    const claudeMessages: Anthropic.MessageParam[] = aiMessages.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : m.role) as 'user' | 'assistant',
      content: m.content,
    }));

    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          ...(systemInstruction ? { system: systemInstruction } : {}),
          messages: claudeMessages,
        });

        const text =
          response.content[0].type === 'text' ? response.content[0].text : '';
        return res.status(200).json({ text, provider: 'claude' });
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

    // Claude fallo tras los reintentos · ver si vale fallback a DeepSeek
    const errAny = lastError as { status?: number; message?: string } | undefined;
    const errorMsg = errAny?.message ?? 'Unknown error';
    console.error('[api/ai/generate] Claude error after retries:', {
      status: errAny?.status,
      message: errorMsg,
      model: MODEL,
    });

    if (!forceClaude && isDeepSeekConfigured() && claudeErrorShouldFallback(lastError)) {
      console.warn('[api/ai/generate] Falling back to DeepSeek due to Claude error');
      try {
        const { text, usage } = await callDeepSeek({
          system: systemInstruction,
          messages: aiMessages,
          maxTokens: MAX_TOKENS,
        });
        return res.status(200).json({
          text,
          provider: 'deepseek',
          fallback_reason: errorMsg,
          usage,
        });
      } catch (dsErr) {
        const dsMsg = dsErr instanceof Error ? dsErr.message : String(dsErr);
        console.error('[api/ai/generate] DeepSeek fallback also failed:', dsMsg);
        return res.status(502).json({
          error: 'Both providers failed',
          claude_error: errorMsg,
          claude_status: errAny?.status ?? null,
          deepseek_error: dsMsg,
        });
      }
    }

    // Sin fallback (DeepSeek no configurado, forzado Claude, o error no apto)
    return res.status(502).json({
      error: 'Claude API error',
      details: errorMsg,
      claudeStatus: errAny?.status ?? null,
      fallback_attempted: false,
      fallback_reason: forceClaude
        ? 'Provider forced to Claude (X-AI-Provider header)'
        : !isDeepSeekConfigured()
          ? 'DEEPSEEK_API_KEY not configured'
          : 'Error type does not warrant fallback',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/ai/generate] Server error:', errorMsg);
    return res.status(500).json({ error: 'Server error', details: errorMsg });
  }
}
