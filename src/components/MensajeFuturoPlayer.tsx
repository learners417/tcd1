/**
 * MensajeFuturoPlayer — T11 · Plan Maestro.
 * La reproducción del Mensaje al Futuro: el audio que el fundador selló el
 * Día 1, que se abre en la graduación. Si todavía no lo grabó (la captura del
 * Día 1 llega con T3), muestra el sobre cerrado — nunca rompe.
 */
import React, { useEffect, useState } from 'react';
import { Mail, Play, Pause, Lock } from 'lucide-react';
import { fetchMensajeFuturo } from '../lib/graduacion';

export default function MensajeFuturoPlayer({ userId }: { userId?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [sonando, setSonando] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (!userId) return;
      const u = await fetchMensajeFuturo(userId);
      if (vivo) {
        setUrl(u);
        if (u && typeof Audio !== 'undefined') setAudio(new Audio(u));
      }
    })();
    return () => {
      vivo = false;
    };
  }, [userId]);

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
    <div className="rounded-xl border border-gold/20 bg-gold/[0.05] p-4 text-left">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-gold" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold">
          Tu Mensaje al Futuro
        </p>
      </div>
      {url && audio ? (
        <>
          <p className="text-xs text-cream/70 leading-relaxed mb-3">
            Lo grabaste el Día 1, sin saber quién ibas a ser hoy. Es el momento de escucharlo.
          </p>
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-goldhi transition-colors"
          >
            {sonando ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {sonando ? 'Pausar' : 'Abrir el sobre'}
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 text-[11px] text-cream/45">
          <Lock className="w-3.5 h-3.5" /> Tu mensaje del Día 1 se reproduce acá cuando lo grabes en el
          Camino.
        </div>
      )}
    </div>
  );
}
