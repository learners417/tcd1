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

  try {
    const { base64, mimeType } = await fileToBase64(file);
    const r = await fetch('/api/ai/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64, mimeType, descripcion: descripcionEsperada, feature: 'sesion',
        userId: (() => {
          try { return JSON.parse(localStorage.getItem('tcd_profile') ?? '{}').id ?? null; }
          catch { return null; }
        })(),
      }),
    });
    if (!r.ok) return null;
    const data = await r.json() as { veredicto?: VeredictoVision | null };
    return data.veredicto ?? null;
  } catch {
    // Cualquier fallo → sin veredicto. NUNCA bloquea.
    return null;
  }
}
