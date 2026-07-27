/**
 * audioVoz.ts — S3 · La Sesión Viva habla.
 * El fundador responde HABLANDO: graba con el micrófono, Gemini transcribe,
 * y el texto cae en su respuesta (el ADN se llena con la voz).
 * Mismo transporte que visionEvidencia: Gemini multimodal con la clave VITE.
 * Sin clave o sin micrófono → la función degrada en silencio (no bloquea nada).
 */


export function audioDisponible(): boolean {
  // Antes preguntaba si existía la clave en el navegador. Ahora la clave está
  // en el servidor, así que lo único que puede faltar es el micrófono.
  return typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia;
}

/** Transcribe un audio (base64, sin prefijo dataURL). Devuelve el texto o null. */
export async function transcribirAudio(base64: string, mimeType: string): Promise<string | null> {
  // La clave de Gemini vive en el SERVIDOR, sin prefijo VITE_. Todo lo que
  // lleva ese prefijo se empaqueta dentro del bundle y cualquiera que abra
  // la app puede leerlo y gastarlo.
  try {
    const r = await fetch('/api/ai/transcribir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64, mimeType, feature: 'sesion',
        userId: (() => {
          try { return JSON.parse(localStorage.getItem('tcd_profile') ?? '{}').id ?? null; }
          catch { return null; }
        })(),
      }),
    });
    if (!r.ok) return null;
    const data = await r.json() as { texto?: string };
    return data.texto?.trim() || null;
  } catch {
    // Sin transcripción, el sanador escribe. Nunca se rompe la sesión.
    return null;
  }
}

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
