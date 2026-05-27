/**
 * Vercel Serverless Function — Non-streaming text generation.
 *
 * Cadena de proveedores (server-side, transparente para el frontend):
 *   1) DeepSeek (primary) · ~10x mas barato por request que Claude Sonnet
 *   2) Claude (fallback) · solo si DeepSeek falla con un error donde el
 *      fallback tiene sentido (credito agotado, rate limit, timeout, etc).
 *      Ver shouldFallback() en api/_lib/deepseek.ts.
 *
 * Claude sigue siendo el unico proveedor con vision (api/ai/describe-image)
 * porque DeepSeek V3/V4 no acepta imagenes. Cuando se atachan imagenes,
 * el flujo es: describe-image (Claude Vision) → texto → /generate (DeepSeek).
 *
 * Override de testing: env var FORCE_AI_PROVIDER=deepseek|claude permite
 * forzar un proveedor para TODA la app. Usar solo para testing, recordar
 * borrarla del Vercel dashboard cuando se termina.
 *
 * El response JSON incluye `provider` para debugging desde el frontend.
 */
import { callDeepSeek, isDeepSeekConfigured, shouldFallback } from '../_lib/deepseek.js';
import { callClaude, isClaudeConfigured } from '../_lib/claude.js';

const MAX_TOKENS = 16384;

// Vercel function config · sin esto el default es 10s (hobby) o 60s (pro).
// Los entrenadores tienen system prompts grandes; mejor margen de 120s.
export const config = { maxDuration: 120 };

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
    console.log(`[api/ai/generate] FORCE_AI_PROVIDER="${envForce}" activa · skip cadena default`);
  }

  // ─── Path: forzar Claude (skip DeepSeek) ──────────────────────────────
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
      return res.status(200).json({ text, provider: 'claude', forced: true, usage });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { status?: number })?.status;
      console.error('[api/ai/generate] Claude (forced) failed:', { status, msg });
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
      return res.status(200).json({ text, provider: 'deepseek', ...(forceDeepSeek ? { forced: true } : {}), usage });
    } catch (err) {
      dsError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { status?: number })?.status;
      console.error('[api/ai/generate] DeepSeek failed:', { status, msg });
    }
  } else if (forceDeepSeek) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured', forced: 'deepseek' });
  } else {
    console.warn('[api/ai/generate] DEEPSEEK_API_KEY no configurada · saltando a Claude');
  }

  // Si forzaron DeepSeek, no caemos a Claude.
  if (forceDeepSeek) {
    const msg = dsError instanceof Error ? dsError.message : 'DeepSeek failed';
    return res.status(502).json({ error: 'DeepSeek API error', details: msg, forced: 'deepseek' });
  }

  // ─── 2) Claude (fallback) ──────────────────────────────────────────────
  // Solo fallback si el error de DeepSeek lo amerita (credito/rate/timeout).
  // Si DeepSeek nunca se intento (no configurada) tambien caemos a Claude.
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
    console.warn('[api/ai/generate] Falling back to Claude tras error de DeepSeek');
  }

  try {
    const { text, usage } = await callClaude({
      system: systemInstruction,
      messages: aiMessages,
      maxTokens: MAX_TOKENS,
    });
    const dsMsg = dsError instanceof Error ? dsError.message : undefined;
    return res.status(200).json({
      text,
      provider: 'claude',
      ...(dsAttempted ? { fallback_reason: dsMsg } : {}),
      usage,
    });
  } catch (claudeErr) {
    const claudeMsg = claudeErr instanceof Error ? claudeErr.message : String(claudeErr);
    const dsMsg = dsError instanceof Error ? dsError.message : 'not attempted';
    console.error('[api/ai/generate] Both providers failed:', { deepseek: dsMsg, claude: claudeMsg });
    return res.status(502).json({
      error: 'Both providers failed',
      deepseek_error: dsMsg,
      claude_error: claudeMsg,
    });
  }
}
