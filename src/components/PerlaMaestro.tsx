/**
 * PerlaMaestro — T10 · Plan Maestro.
 * Una Perla del Maestro: audio sorpresa de Javo en un momento-quiebre.
 * El slot está listo aunque no haya MP3 todavía (muestra "en camino").
 */
import React, { useState } from 'react';
import { Sparkles, Play, Pause, Lock } from 'lucide-react';
import type { Perla } from '../lib/perlasMaestro';

export default function PerlaMaestro({ perla }: { perla: Perla }) {
  const [audio] = useState<HTMLAudioElement | null>(() =>
    typeof Audio !== 'undefined' && perla.audioUrl ? new Audio(perla.audioUrl) : null,
  );
  const [sonando, setSonando] = useState(false);
  const disponible = !!perla.audioUrl && !!audio;

  const toggle = () => {
    if (!audio) return;
    if (sonando) {
      audio.pause();
      setSonando(false);
    } else {
      audio.onended = () => setSonando(false);
      void audio.play().then(() => setSonando(true)).catch(() => setSonando(false));
    }
  };

  return (
    <div className="card-panel p-5 border border-[#E8962E]/20 bg-gradient-to-br from-[#E8962E]/[0.06] to-transparent">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#E8962E]" />
        <span className="text-[10px] font-bold text-[#E8962E] uppercase tracking-widest">
          Perla del Maestro
        </span>
      </div>
      <p className="text-sm text-[#F2EFE9] font-medium mb-1">{perla.titulo}</p>
      <p className="text-xs text-[#F2EFE9]/55 leading-relaxed mb-3">{perla.texto}</p>
      {disponible ? (
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8962E]/15 border border-[#E8962E]/30 text-[#E8962E] text-xs font-bold uppercase tracking-wider hover:bg-[#E8962E]/25 transition-colors"
        >
          {sonando ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {sonando ? 'Pausar' : 'Escuchar a Javo'}
        </button>
      ) : (
        <div className="flex items-center gap-2 text-[10px] text-[#F2EFE9]/35 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" /> Perla en camino — Javo la graba pronto
        </div>
      )}
    </div>
  );
}
