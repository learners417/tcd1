/**
 * MensajeFuturoPlayer — T11 · Plan Maestro.
 * La reproducción del Mensaje al Futuro: el audio que el fundador selló el
 * Día 1, que se abre en la graduación. Si todavía no lo grabó (la captura del
 * Día 1 llega con T3), muestra el sobre cerrado — nunca rompe.
 */
import { useEffect, useState } from 'react';
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
      <div className="flex items-start gap-2.5 mb-2">
        <Mail className="w-4 h-4 mt-0.5 text-gold shrink-0" />
        <p className="text-sm font-bold uppercase tracking-widest text-gold">
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
        /* Tres renglones con el candado centrado: quedaba flotando en el
           medio. Y al 45%, en la pantalla del día 90. */
        <div className="flex items-start gap-2.5 text-sm text-cream/75">
          <Lock className="w-4 h-4 mt-1 shrink-0" /> Tu mensaje del Día 1 se reproduce acá cuando lo grabes en el
          Camino.
        </div>
      )}
    </div>
  );
}
