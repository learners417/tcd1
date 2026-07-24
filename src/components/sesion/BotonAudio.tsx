/**
 * BOTÓN DE VOZ — responde hablando. Graba → transcribe → el texto cae en tu
 * respuesta. Si no hay micrófono o clave, no se muestra (cero fricción).
 */
import React, { useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { audioDisponible, crearGrabadora, transcribirAudio } from '../../lib/audioVoz';

export default function BotonAudio({ onTexto }: { onTexto: (texto: string) => void }) {
  const [estado, setEstado] = useState<'idle' | 'grabando' | 'transcribiendo'>('idle');
  const grabadora = useRef<ReturnType<typeof crearGrabadora> | null>(null);

  if (!audioDisponible()) return null;

  async function toggle() {
    if (estado === 'idle') {
      grabadora.current = crearGrabadora();
      const ok = await grabadora.current.start();
      if (ok) setEstado('grabando');
    } else if (estado === 'grabando') {
      setEstado('transcribiendo');
      const audio = await grabadora.current?.stop();
      if (audio) {
        const texto = await transcribirAudio(audio.base64, audio.mimeType);
        if (texto) onTexto(texto);
      }
      setEstado('idle');
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={estado === 'transcribiendo'}
      title={estado === 'grabando' ? 'Toca para terminar' : 'Responde hablando'}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-colors min-h-[40px] ${
        estado === 'grabando'
          ? 'border-danger/60 bg-danger/15 text-danger animate-pulse'
          : estado === 'transcribiendo'
            ? 'border-gold/30 bg-gold/10 text-gold/70'
            : 'border-gold/25 bg-gold/5 text-gold hover:bg-gold/15'
      }`}
    >
      {estado === 'grabando' ? <Square className="w-3.5 h-3.5" /> : estado === 'transcribiendo' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
      {estado === 'grabando' ? 'Terminar' : estado === 'transcribiendo' ? 'Escribiendo…' : 'Hablar'}
    </button>
  );
}
