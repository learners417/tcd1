/**
 * audioVoz.ts — S3 · La Sesión Viva habla.
 * El fundador responde HABLANDO: graba con el micrófono, Gemini transcribe,
 * y el texto cae en su respuesta (el ADN se llena con la voz).
 * Mismo transporte que visionEvidencia: Gemini multimodal con la clave VITE.
 * Sin clave o sin micrófono → la función degrada en silencio (no bloquea nada).
 */

const MODELO = 'gemini-2.5-flash';

export function audioDisponible(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  return Boolean(apiKey) && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

/** Transcribe un audio (base64, sin prefijo dataURL). Devuelve el texto o null. */
export async function transcribirAudio(base64: string, mimeType: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) return null;
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Transcribe este audio en castellano, fielmente, en primera persona, sin comentarios tuyos ni encabezados. Solo el texto de lo que dice la persona, con puntuación natural.' },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          }],
          generationConfig: { temperature: 0.1 },
        }),
      },
    );
    if (!r.ok) return null;
    const j = await r.json();
    const texto = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim();
    return texto || null;
  } catch {
    return null;
  }
}

/** Grabadora simple: start() → stop() devuelve { base64, mimeType }. */
export function crearGrabadora() {
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let stream: MediaStream | null = null;

  return {
    async start(): Promise<boolean> {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
        chunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.start();
        return true;
      } catch { return false; }
    },
    stop(): Promise<{ base64: string; mimeType: string } | null> {
      return new Promise((resolve) => {
        if (!mediaRecorder) return resolve(null);
        const mime = mediaRecorder.mimeType || 'audio/webm';
        mediaRecorder.onstop = () => {
          stream?.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: mime });
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = String(reader.result ?? '');
            const base64 = dataUrl.split(',')[1] ?? '';
            resolve(base64 ? { base64, mimeType: mime } : null);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        };
        mediaRecorder.stop();
      });
    },
  };
}
