/**
 * Vercel Serverless Function — Text generation devuelta como SSE.
 *
 * Internamente NO streamea: pide la respuesta completa al proveedor y la
 * emite como un unico evento SSE. Esto evita problemas de streaming en
 * Node.js + Vercel y deja al frontend manejarlo uniformemente.
 *
 * Cadena de proveedores (idem generate.ts):
 *   1) DeepSeek (primary)
 *   2) Claude (fallback) · solo si DeepSeek falla y el error lo amerita
 *
 * Override de testing via env var FORCE_AI_PROVIDER=deepseek|claude.
 */
import { callDeepSeek, isDeepSeekConfigured, shouldFallback } from '../_lib/deepseek.js';
import { callClaude, isClaudeConfigured } from '../_lib/claude.js';

const MAX_TOKENS = 16384;

export const config = { maxDuration: 120 };

function startSseStream(res: any): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
}

function writeSseEvent(res: any, payload: object): void {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function endSseStream(res: any): void {
  res.write('data: [DONE]\n\n');
  res.end();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, messages } = req.body ?? {};
  const aiMessages = messages
    ? (messages as Array<{ role: string; content: string }>)
    : [{ role: 'user', content: prompt }];

  // ─── Override de proveedor (testing) ──────────────────────────────────
  const envForce = String(process.env.FORCE_AI_PROVIDER ?? '').toLowerCase();
  const forceDeepSeek = envForce === 'deepseek';
  const forceClaude = envForce === 'claude';
  if (envForce) {
    console.log(`[api/ai/stream] FORCE_AI_PROVIDER="${envForce}" activa · skip cadena default`);
  }

  // ─── Path: forzar Claude ──────────────────────────────────────────────
  if (forceClaude) {
    if (!isClaudeConfigured()) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured', forced: 'claude' });
    }
    try {
      const { text, usage } = await callClaude({
        system: systemInstruction,
        messages: aiMessages,
        maxTokens: MAX_TOKENS,
      });
      startSseStream(res);
      writeSseEvent(res, { text, provider: 'claude', forced: true, usage });
      return endSseStream(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { status?: number })?.status;
      console.error('[api/ai/stream] Claude (forced) failed:', { status, msg });
      return res.status(502).json({ error: 'Claude API error', details: msg, claudeStatus: status ?? null, forced: 'claude' });
    }
  }

  // ─── 1) DeepSeek (primary) ─────────────────────────────────────────────
  let dsError: unknown = null;
  if (isDeepSeekConfigured()) {
    try {
      const { text, usage } = await callDeepSeek({
        system: systemInstruction,
        messages: aiMessages,
        maxTokens: MAX_TOKENS,
      });
      startSseStream(res);
      writeSseEvent(res, { text, provider: 'deepseek', ...(forceDeepSeek ? { forced: true } : {}), usage });
      return endSseStream(res);
    } catch (err) {
      dsError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { status?: number })?.status;
      console.error('[api/ai/stream] DeepSeek failed:', { status, msg });
    }
  } else if (forceDeepSeek) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured', forced: 'deepseek' });
  } else {
    console.warn('[api/ai/stream] DEEPSEEK_API_KEY no configurada · saltando a Claude');
  }

  if (forceDeepSeek) {
    const msg = dsError instanceof Error ? dsError.message : 'DeepSeek failed';
    return res.status(502).json({ error: 'DeepSeek API error', details: msg, forced: 'deepseek' });
  }

  // ─── 2) Claude (fallback) ──────────────────────────────────────────────
  const dsAttempted = dsError !== null;
  if (dsAttempted && !shouldFallback(dsError)) {
    const msg = dsError instanceof Error ? dsError.message : 'DeepSeek error';
    return res.status(502).json({
      error: 'DeepSeek API error',
      details: msg,
      fallback_attempted: false,
      fallback_reason: 'Error type does not warrant fallback (config issue)',
    });
  }

  if (!isClaudeConfigured()) {
    const dsMsg = dsError instanceof Error ? dsError.message : 'DeepSeek failed';
    return res.status(502).json({
      error: dsAttempted ? 'DeepSeek failed and Claude not configured' : 'No AI providers configured',
      deepseek_error: dsAttempted ? dsMsg : null,
    });
  }

  if (dsAttempted) {
    console.warn('[api/ai/stream] Falling back to Claude tras error de DeepSeek');
  }

  try {
    const { text, usage } = await callClaude({
      system: systemInstruction,
      messages: aiMessages,
      maxTokens: MAX_TOKENS,
    });
    const dsMsg = dsError instanceof Error ? dsError.message : undefined;
    startSseStream(res);
    writeSseEvent(res, {
      text,
      provider: 'claude',
      ...(dsAttempted ? { fallback_reason: dsMsg } : {}),
      usage,
    });
    return endSseStream(res);
  } catch (claudeErr) {
    const claudeMsg = claudeErr instanceof Error ? claudeErr.message : String(claudeErr);
    const dsMsg = dsError instanceof Error ? dsError.message : 'not attempted';
    console.error('[api/ai/stream] Both providers failed:', { deepseek: dsMsg, claude: claudeMsg });
    return res.status(502).json({
      error: 'Both providers failed',
      deepseek_error: dsMsg,
      claude_error: claudeMsg,
    });
  }
}
