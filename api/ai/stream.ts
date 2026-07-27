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
import { rutaDe, costoDe, normalizarUso, type PasoRuta } from '../_lib/router.js';
import { guardarLlamada, deshacerCobro, anotarCosto } from '../_lib/guardian.js';
import { withSentry } from '../_lib/sentry.js';

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

async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, messages, userId, feature, tarea } = req.body ?? {};
  const aiMessages = messages
    ? (messages as Array<{ role: string; content: string }>)
    : [{ role: 'user', content: prompt }];

  // ─── El guardián ───────────────────────────────────────────────────────
  // Este endpoint NO cobraba nada: el chat de campañas entraba por acá y era
  // un canal de IA gratis e ilimitado. Ahora frena igual que /generate.
  const veredicto = await guardarLlamada(userId, feature);
  if (!veredicto.permitido && veredicto.error) {
    return res.status(veredicto.error.status).json({
      error: veredicto.error.codigo,
      message: veredicto.error.mensaje,
    });
  }

  // ─── Enrutado por tarea ────────────────────────────────────────────────
  // Mismo enrutador que /generate: un solo lugar decide qué modelo hace qué.
  // El chat cae en 'chat' (DeepSeek con respaldo Claude) por volumen.
  const { tarea: tareaResuelta, ruta } = rutaDe(tarea);

  const envForce = String(process.env.FORCE_AI_PROVIDER ?? '').toLowerCase();
  const cadena: PasoRuta[] =
    envForce === 'claude' ? [{ proveedor: 'claude', modelo: null }]
    : envForce === 'deepseek' ? [{ proveedor: 'deepseek', modelo: null }]
    : ruta.cadena;

  const fallos: Array<{ proveedor: string; msg: string; status?: number }> = [];

  for (const paso of cadena) {
    const configurado =
      paso.proveedor === 'claude' ? isClaudeConfigured() : isDeepSeekConfigured();
    if (!configurado) {
      fallos.push({ proveedor: paso.proveedor, msg: 'sin API key configurada' });
      continue;
    }
    try {
      const comun = {
        system: systemInstruction,
        messages: aiMessages,
        maxTokens: ruta.maxTokens,
        ...(paso.modelo ? { model: paso.modelo } : {}),
        ...(typeof ruta.temperature === 'number' ? { temperature: ruta.temperature } : {}),
      };
      const t0 = Date.now();
      const { text, usage } =
        paso.proveedor === 'claude' ? await callClaude(comun) : await callDeepSeek(comun);
      const ms = Date.now() - t0;

      // Una respuesta vacía es una falla, no un éxito. Devolverla con 200
      // dejaba el crédito cobrado y al cliente mirando una pantalla en blanco.
      if (!text || !String(text).trim()) {
        throw new Error('respuesta vacía del proveedor');
      }

      const modeloUsado = paso.modelo ?? (paso.proveedor === 'claude'
        ? (process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6')
        : (process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-pro'));
      const costo = costoDe(modeloUsado, usage);
      const uso = normalizarUso(usage);

      console.log('[ia]', JSON.stringify({
        tarea: tareaResuelta, proveedor: paso.proveedor, modelo: modeloUsado,
        entrada: uso.entrada, salida: uso.salida,
        usd: costo?.usd ?? null, precioVerificado: costo?.verificado ?? null,
        userId: userId ?? null, feature: feature ?? null,
        respaldo: paso !== cadena[0], endpoint: 'stream',
      }));

      // Lo que costó de verdad, para el techo y para el panel de costos.
      await anotarCosto(userId, {
        usd: costo?.usd ?? null, modelo: modeloUsado, tarea: tareaResuelta,
        feature, verificado: costo?.verificado ?? false, ms, ok: true,
      });

      startSseStream(res);
      writeSseEvent(res, {
        text, provider: paso.proveedor, modelo: modeloUsado,
        tarea: tareaResuelta, usage, costo,
        ...(paso !== cadena[0] ? { respaldo: true } : {}),
      });
      return endSseStream(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { status?: number })?.status;
      fallos.push({ proveedor: paso.proveedor, msg, status });
      // Una falla también se anota. Un modelo que falla el 30% de las veces
      // no se nota en la factura: se nota en clientes que tocan un botón y
      // no pasa nada.
      await anotarCosto(userId, {
        usd: 0,
        modelo: paso.modelo ?? paso.proveedor,
        tarea: tareaResuelta, feature, verificado: false,
        ok: false, error: msg,
      });
      console.error(`[api/ai/stream] ${paso.proveedor} falló en tarea ${tareaResuelta}:`, { status, msg });
    }
  }

  // Nadie entregó nada: si se cobró un crédito, se devuelve. Cobrar por aire
  // es la peor forma de perder la confianza de un cliente.
  console.error('[api/ai/stream] toda la cadena falló:', { tarea: tareaResuelta, fallos });
  await deshacerCobro(userId, veredicto, `fallo de la cadena en ${tareaResuelta}`);
  return res.status(502).json({
    error: 'La IA no pudo responder en este momento.',
    message: 'No se te descontó nada. Prueba otra vez en unos segundos.',
    tarea: tareaResuelta,
    fallos,
  });
}
