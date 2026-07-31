import { withSentry } from '../_lib/sentry.js';
import { guardarLlamada, anotarCosto, deshacerCobro } from '../_lib/guardian.js';
import { conTope } from '../_lib/tope.js';

/**
 * VERIFICAR EVIDENCIA CON VISIÓN — del lado del servidor.
 *
 * POR QUÉ EXISTE: esto llamaba a Google desde el navegador con
 * `VITE_GEMINI_API_KEY`, que se empaqueta dentro del bundle y cualquiera
 * puede leer y gastar. La clave ahora vive solo acá.
 *
 * LA FILOSOFÍA NO CAMBIA: es un ASISTENTE, no un portón. Nunca niega un
 * hito. Ante cualquier problema devuelve sin veredicto y la subida sigue
 * igual — el veredicto es una señal para el sanador, no una puerta.
 */

const MODELO = 'gemini-2.5-flash';
const MAX_BYTES = 6 * 1024 * 1024;

// Sin tipos de @vercel/node: no está en las dependencias y el resto de
// los endpoints tampoco los importa.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, mimeType, descripcion, userId, feature } = req.body ?? {};
  if (typeof base64 !== 'string' || !base64 || typeof descripcion !== 'string') {
    // Sin datos suficientes: sin veredicto, nunca un error en la cara.
    return res.status(200).json({ veredicto: null });
  }
  if (base64.length * 0.75 > MAX_BYTES) {
    return res.status(200).json({ veredicto: null });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ veredicto: null });

  const veredictoGuardian = await guardarLlamada(userId, feature ?? 'sesion');
  // Si el guardián frena, tampoco se bloquea la subida: solo no hay veredicto.
  if (!veredictoGuardian.permitido) {
    return res.status(200).json({ veredicto: null });
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
            role: 'user',
            parts: [
              {
                text:
                  `Una persona subió esta imagen como evidencia de: "${descripcion}".\n` +
                  '¿La imagen es coherente con esa evidencia? SÉ GENEROSO: si podría ' +
                  'razonablemente serlo, responde ok:true. Solo responde ok:false si la ' +
                  'imagen claramente NO tiene ninguna relación con lo pedido.\n' +
                  'Responde SOLO JSON, sin markdown: ' +
                  '{"ok": boolean, "motivo": "máximo 10 palabras, en castellano neutro"}',
              },
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64 } },
            ],
          }],
        }),
      },
    );

    if (!r.ok) throw new Error(`Gemini ${r.status}`);

    const data = await r.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const texto = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '')
      .replace(/```json|```/g, '').trim();

    await anotarCosto(userId, {
      usd: null, modelo: MODELO, tarea: 'estructura',
      feature, verificado: false, ms: Date.now() - t0, ok: true,
    });

    const parsed = JSON.parse(texto) as { ok?: unknown; motivo?: unknown };
    if (typeof parsed.ok !== 'boolean') return res.status(200).json({ veredicto: null });

    return res.status(200).json({
      veredicto: { ok: parsed.ok, motivo: String(parsed.motivo ?? '') },
    });
  } catch (err) {
    // SE DEVUELVE EL CRÉDITO. Cobraba y nunca devolvía: si el proveedor
    // fallaba, el cliente perdía el crédito por algo que no recibió.
    await deshacerCobro(userId, veredictoGuardian, 'falló el proveedor');
    // Cualquier fallo → sin veredicto. NUNCA bloquea una evidencia legítima.
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[api/ai/vision] sin veredicto:', msg);
    await anotarCosto(userId, {
      usd: 0, modelo: MODELO, tarea: 'estructura',
      feature, verificado: false, ms: Date.now() - t0, ok: false, error: msg,
    });
    return res.status(200).json({ veredicto: null });
  }
}

export default withSentry(handler);
