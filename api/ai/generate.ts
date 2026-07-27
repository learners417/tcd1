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
import { withSentry } from '../_lib/sentry.js';
import { guardarLlamada, deshacerCobro, anotarCosto } from '../_lib/guardian.js';
import { rutaDe, costoDe, normalizarUso, type PasoRuta } from '../_lib/router.js';

const MAX_TOKENS = 16384;

// Vercel function config · sin esto el default es 10s (hobby) o 60s (pro).
// Los entrenadores tienen system prompts grandes; mejor margen de 120s.
export const config = { maxDuration: 120 };

async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction, messages, userId, feature, tarea } = req.body ?? {};

  // ─── El guardián ───────────────────────────────────────────────────────
  // Un solo lugar decide si la llamada puede salir: crédito para las
  // herramientas de producción, tope para el acompañamiento.
  const veredicto = await guardarLlamada(userId, feature);
  if (!veredicto.permitido && veredicto.error) {
    return res.status(veredicto.error.status).json({
      error: veredicto.error.codigo,
      message: veredicto.error.mensaje,
    });
  }
  res.setHeader('x-credits-remaining',
    veredicto.creditosRestantes == null ? 'n/a' : String(veredicto.creditosRestantes));
  res.setHeader('x-usos-restantes',
    veredicto.usosRestantes == null ? 'n/a' : String(veredicto.usosRestantes));
  if (veredicto.gasto) {
    res.setHeader('x-ia-gasto-mes', String(veredicto.gasto.usdMes));
    res.setHeader('x-ia-techo-mes', String(veredicto.gasto.techoMes));
  }
  const aiMessages = messages
    ? (messages as Array<{ role: string; content: string }>)
    : [{ role: 'user', content: prompt }];

  // ─── Enrutado por tarea ────────────────────────────────────────────────
  // Cada trabajo tiene su modelo (ver api/_lib/router.ts). Si el front no
  // declara `tarea`, cae en 'general', que es la cadena histórica: ninguna
  // llamada vieja cambia de comportamiento.
  const { tarea: tareaResuelta, ruta } = rutaDe(tarea);

  // Override de testing: FORCE_AI_PROVIDER pisa la ruta entera.
  const envForce = String(process.env.FORCE_AI_PROVIDER ?? '').toLowerCase();
  const cadena: PasoRuta[] =
    envForce === 'claude' ? [{ proveedor: 'claude', modelo: null }]
    : envForce === 'deepseek' ? [{ proveedor: 'deepseek', modelo: null }]
    : ruta.cadena;
  if (envForce) {
    console.log(`[api/ai/generate] FORCE_AI_PROVIDER="${envForce}" pisa la ruta de ${tareaResuelta}`);
  }

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

      // Una línea por llamada: es de acá que sale el panel de costos.
      console.log('[ia]', JSON.stringify({
        tarea: tareaResuelta, proveedor: paso.proveedor, modelo: modeloUsado,
        entrada: uso.entrada, salida: uso.salida,
        usd: costo?.usd ?? null, precioVerificado: costo?.verificado ?? null,
        userId: userId ?? null, feature: feature ?? null,
        respaldo: paso !== cadena[0],
      }));

      // Lo que costó de verdad, para el techo y para el panel de costos.
      await anotarCosto(userId, {
        usd: costo?.usd ?? null, modelo: modeloUsado, tarea: tareaResuelta,
        feature, verificado: costo?.verificado ?? false, ms, ok: true,
      });

      res.setHeader('x-ia-modelo', modeloUsado);
      res.setHeader('x-ia-costo-usd', costo ? String(costo.usd) : 'n/a');
      return res.status(200).json({
        text,
        provider: paso.proveedor,
        modelo: modeloUsado,
        tarea: tareaResuelta,
        usage,
        costo,
        ...(envForce ? { forced: true } : {}),
        ...(paso !== cadena[0] ? { respaldo: true } : {}),
      });
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
      console.error(`[api/ai/generate] ${paso.proveedor} falló en tarea ${tareaResuelta}:`, { status, msg });
    }
  }

  // Nadie entregó nada: si se cobró un crédito, se devuelve. Cobrar por aire
  // es la peor forma de perder la confianza de un cliente.
  console.error('[api/ai/generate] toda la cadena falló:', { tarea: tareaResuelta, fallos });
  await deshacerCobro(userId, veredicto, `fallo de la cadena en ${tareaResuelta}`);
  return res.status(502).json({
    error: 'La IA no pudo responder en este momento.',
    message: 'No se te descontó nada. Prueba otra vez en unos segundos.',
    tarea: tareaResuelta,
    fallos,
  });
}
