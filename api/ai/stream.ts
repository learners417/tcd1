/**
 * Vercel Serverless Function — Text generation devuelta como SSE.
 *
 * Internamente NO streamea: pide la respuesta completa al proveedor y la
 * emite como un unico evento SSE. Esto evita problemas de streaming en
 * Node.js + Vercel y deja al frontend manejarlo uniformemente.
 *
 * Cadena de proveedores (igual que generate.ts):
 *   1) Claude (Anthropic)
 *   2) DeepSeek fallback · solo si Claude falla y el error lo amerita
 *      (credito agotado, rate limit, server error, timeout).
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

export const config = { maxDuration: 120 };

function writeSseEvent(res: any, payload: object): void {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function startSseStream(res: any): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
}

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

  // Override global desde env var · tiene PRIORIDAD sobre el header. Ver generate.ts.
  const envForce = String(process.env.FORCE_AI_PROVIDER ?? '').toLowerCase();
  // Override admin-only via header. Aceptamos ambas variantes (con y sin X-).
  const rawHeaderXprefix = req.headers?.['x-ai-provider'];
  const rawHeaderNoPrefix = req.headers?.['ai-provider'];
  const headerOverride = String(rawHeaderXprefix ?? rawHeaderNoPrefix ?? '').toLowerCase();
  const providerOverride = envForce || headerOverride;
  const forceDeepSeek = providerOverride === 'deepseek';
  const forceClaude = providerOverride === 'claude';
  console.log(`[api/ai/stream] FORCE_AI_PROVIDER env="${envForce}" · header x-ai-provider="${rawHeaderXprefix ?? ''}" ai-provider="${rawHeaderNoPrefix ?? ''}" · resolved="${providerOverride}" · forceDeepSeek=${forceDeepSeek} · forceClaude=${forceClaude} · deepseekConfigured=${isDeepSeekConfigured()}`);

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
      startSseStream(res);
      writeSseEvent(res, { text, provider: 'deepseek', forced: true, usage });
      res.write('data: [DONE]\n\n');
      return res.end();
    } catch (dsErr) {
      const dsMsg = dsErr instanceof Error ? dsErr.message : String(dsErr);
      console.error('[api/ai/stream] DeepSeek (forced) failed:', dsMsg);
      return res.status(502).json({ error: 'DeepSeek API error', details: dsMsg, forced: 'deepseek' });
    }
  }

  try {
    const client = new Anthropic({ apiKey });

    const claudeMessages: Anthropic.MessageParam[] = aiMessages.map((m) => ({
      role: (m.role === 'model' ? 'assistant' : m.role) as 'user' | 'assistant',
      content: m.content,
    }));

    // ─── 1) Claude (primario) ─────────────────────────────────────────────
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

        startSseStream(res);
        writeSseEvent(res, { text, provider: 'claude' });
        res.write('data: [DONE]\n\n');
        return res.end();
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

    // ─── 2) DeepSeek (fallback) ───────────────────────────────────────────
    const errAny = lastError as { status?: number; message?: string } | undefined;
    const errorMsg = errAny?.message ?? 'Unknown error';
    console.error('[api/ai/stream] Claude error after retries:', {
      status: errAny?.status,
      message: errorMsg,
      model: MODEL,
    });

    if (!forceClaude && isDeepSeekConfigured() && claudeErrorShouldFallback(lastError)) {
      console.warn('[api/ai/stream] Falling back to DeepSeek due to Claude error');
      try {
        const { text, usage } = await callDeepSeek({
          system: systemInstruction,
          messages: aiMessages,
          maxTokens: MAX_TOKENS,
        });
        startSseStream(res);
        writeSseEvent(res, {
          text,
          provider: 'deepseek',
          fallback_reason: errorMsg,
          usage,
        });
        res.write('data: [DONE]\n\n');
        return res.end();
      } catch (dsErr) {
        const dsMsg = dsErr instanceof Error ? dsErr.message : String(dsErr);
        console.error('[api/ai/stream] DeepSeek fallback also failed:', dsMsg);
        return res.status(502).json({
          error: 'Both providers failed',
          claude_error: errorMsg,
          claude_status: errAny?.status ?? null,
          deepseek_error: dsMsg,
        });
      }
    }

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
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[api/ai/stream] Server error:', errorMsg);
    return res.status(500).json({ error: 'Server error', details: errorMsg });
  }
}
