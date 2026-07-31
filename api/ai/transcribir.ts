import { withSentry } from '../_lib/sentry.js';
import { guardarLlamada, anotarCosto, deshacerCobro } from '../_lib/guardian.js';
import { conTope } from '../_lib/tope.js';

/**
 * TRANSCRIBIR AUDIO — del lado del servidor.
 *
 * POR QUÉ EXISTE: esto se hacía desde el navegador con `VITE_GEMINI_API_KEY`.
 * Todo lo que lleva el prefijo VITE_ se empaqueta DENTRO del bundle, así que
 * esa clave la podía leer y gastar cualquiera que abriera la app. No es un
 * bug que rompa nada: es una cuenta de Google abierta al público.
 *
 * La clave ahora vive solo acá, sin prefijo, donde el navegador no llega.
 */

const MODELO = 'gemini-2.5-flash';
const MAX_BYTES = 8 * 1024 * 1024; // ~8 MB de audio: más que suficiente para una nota de voz

// Sin tipos de @vercel/node: no está en las dependencias y el resto de
// los endpoints tampoco los importa.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY no configurada',
      message: 'La transcripción no está disponible en este momento.',
    });
  }

  const { base64, mimeType, userId, feature } = req.body ?? {};
  if (typeof base64 !== 'string' || !base64) {
    return res.status(400).json({ error: 'Falta el audio' });
  }
  // El base64 pesa ~4/3 de los bytes reales.
  if (base64.length * 0.75 > MAX_BYTES) {
    return res.status(413).json({
      error: 'AUDIO_MUY_LARGO',
      message: 'La nota de voz es muy larga. Grábala de nuevo, más corta.',
    });
  }

  const veredicto = await guardarLlamada(userId, feature ?? 'sesion');
  if (!veredicto.permitido && veredicto.error) {
    return res.status(veredicto.error.status).json({
      error: veredicto.error.codigo,
      message: veredicto.error.mensaje,
    });
  }

  const t0 = Date.now();
  try {
    // Con tope, como todas: sin él la plataforma mata la función y el
    // `deshacerCobro` de abajo nunca llega a correr.
    const tope = conTope();
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${apiKey}`,
      {
        signal: tope.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Transcribe este audio en español, tal cual se dice. Solo el texto, sin comentarios.' },
              { inline_data: { mime_type: mimeType || 'audio/webm', data: base64 } },
            ],
          }],
        }),
      },
    );

    if (!r.ok) {
      const detalle = await r.text().catch(() => '');
      throw new Error(`Gemini ${r.status}: ${detalle.slice(0, 200)}`);
    }

    const data = await r.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    await anotarCosto(userId, {
      usd: null, modelo: MODELO, tarea: 'estructura',
      feature, verificado: false, ms: Date.now() - t0, ok: true,
    });

    return res.status(200).json({ texto });
  } catch (err) {
    // SE DEVUELVE EL CRÉDITO. Cobraba y nunca devolvía: si el proveedor
    // fallaba, el cliente perdía el crédito por algo que no recibió.
    await deshacerCobro(userId, veredicto, 'falló el proveedor');
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[api/ai/transcribir] falló:', msg);
    await anotarCosto(userId, {
      usd: 0, modelo: MODELO, tarea: 'estructura',
      feature, verificado: false, ms: Date.now() - t0, ok: false, error: msg,
    });
    return res.status(502).json({
      error: 'No se pudo transcribir',
      message: 'No pudimos pasar tu audio a texto. Escríbelo o prueba de nuevo.',
    });
  }
}

export default withSentry(handler);
