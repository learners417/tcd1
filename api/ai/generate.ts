/**
 * Vercel Serverless Function — Non-streaming Claude text generation
 * Claude is the primary AI provider; frontend falls back to Gemini if this fails.
 */
import Anthropic from '@anthropic-ai/sdk';

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

  try {
    const { prompt, systemInstruction, messages } = req.body;

    const client = new Anthropic({ apiKey });

    const claudeMessages: Anthropic.MessageParam[] = messages
      ? messages.map((m: AIMessage) => ({
          role: (m.role === 'model' ? 'assistant' : m.role) as 'user' | 'assistant',
          content: m.content,
        }))
      : [{ role: 'user' as const, content: prompt }];

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
        return res.status(200).json({ text });
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

    const errAny = lastError as { status?: number; message?: string } | undefined;
    const errorMsg = errAny?.message ?? 'Unknown error';
    console.error('[api/ai/generate] Claude error after retries:', {
      status: errAny?.status,
      message: errorMsg,
      model: MODEL,
    });
    return res.status(502).json({
      error: 'Claude API error',
      details: errorMsg,
      claudeStatus: errAny?.status ?? null,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/ai/generate] Server error:', errorMsg);
    return res.status(500).json({ error: 'Server error', details: errorMsg });
  }
}
