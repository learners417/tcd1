/**
 * CP9 · Verificación de evidencia con visión IA.
 *
 * FILOSOFÍA: es un ASISTENTE, no un portón. Nunca niega un hito.
 * - Solo analiza imágenes (audio/video/pdf → null, sin veredicto).
 * - Sin API key o cualquier error → null (la subida y el cinturón siguen igual).
 * - El prompt pide ser GENEROSO: solo marca falso si la imagen claramente
 *   no tiene relación. Así se evitan falsos rechazos de evidencia legítima.
 * El veredicto es solo una señal para el sanador (y, si duda, para el equipo).
 */
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from './imageUploadUtils';

export interface VeredictoVision {
  ok: boolean;
  motivo: string;
}

export async function verificarEvidenciaVision(
  file: File,
  descripcionEsperada: string,
): Promise<VeredictoVision | null> {
  // Solo imágenes — el resto (audio, video, pdf) no se analiza.
  if (!file.type.startsWith('image/')) return null;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) return null;

  try {
    const { base64, mimeType } = await fileToBase64(file);
    const ai = new GoogleGenAI({ apiKey });
    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `Una persona subió esta imagen como evidencia de: "${descripcionEsperada}".\n` +
                `¿La imagen es coherente con esa evidencia? Sé GENEROSO: si podría razonablemente serlo, responde ok:true. ` +
                `Solo responde ok:false si la imagen claramente NO tiene ninguna relación con lo pedido.\n` +
                `Responde SOLO JSON, sin markdown: {"ok": boolean, "motivo": "máximo 10 palabras, en español"}`,
            },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
    });

    const text = ((resp as { text?: string }).text ?? '').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text) as Partial<VeredictoVision>;
    if (typeof parsed.ok === 'boolean') {
      return { ok: parsed.ok, motivo: String(parsed.motivo ?? '') };
    }
    return null;
  } catch {
    // Cualquier fallo (red, parseo, modelo) → sin veredicto. NUNCA bloquea.
    return null;
  }
}
