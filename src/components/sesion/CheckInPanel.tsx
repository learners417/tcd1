/**
 * CHECK-IN — la apertura ritual de la Sesión Viva (liturgia de Javo):
 * "Emoción en la que llegás y objetivo principal de la sesión."
 */
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { EMOCIONES_ENTRADA, type EmocionSesion, parseTiempoEstimado, formatoCrono } from '../../lib/sessionLog';

interface Props {
  metaTitulo: string;
  objetivoSugerido: string;
  tiempoEstimado?: string | null;
  onAbrir: (checkin: { emocion: EmocionSesion; objetivo: string; modoCorto?: boolean }) => void;
}

export default function CheckInPanel({ metaTitulo, objetivoSugerido, tiempoEstimado, onAbrir }: Props) {
  const [emocion, setEmocion] = useState<EmocionSesion | null>(null);
  const [objetivo, setObjetivo] = useState(objetivoSugerido);
  const [modoCorto, setModoCorto] = useState(false);
  const segundosObjetivo = parseTiempoEstimado(tiempoEstimado);

  return (
    <div className="space-y-5">
      {/* CP6 · Cómo funciona una sesión — el ritual en 3 pasos */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-cream/55 rounded-xl border border-gold/10 bg-gold/[0.04] px-3 py-2">
        <span className="font-semibold text-gold/80">Así funciona:</span>
        <span>1 · entras con tu objetivo</span>
        <span className="text-cream/30">→</span>
        <span>2 · trabajas con el reloj</span>
        <span className="text-cream/30">→</span>
        <span>3 · cierras lo hecho</span>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold mb-1">Sesión de hoy</p>
        <h3 className="text-lg font-bold text-white leading-snug">{metaTitulo}</h3>
        {segundosObjetivo ? (
          <p className="text-xs text-white/55 mt-1">
            Tiempo de trabajo: {formatoCrono(segundosObjetivo)} · podés pausar cuando quieras, la app guarda todo.
          </p>
        ) : (
          <p className="text-xs text-white/55 mt-1">Misión sin cronómetro — se trabaja a tu ritmo.</p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-2">¿Con qué emoción llegás?</p>
        <div className="flex flex-wrap gap-2">
          {EMOCIONES_ENTRADA.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEmocion(e.id)}
              className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                emocion === e.id
                  ? 'border-gold bg-gold/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25'
              }`}
            >
              <span className="mr-1.5">{e.emoji}</span>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-2">Objetivo de esta sesión</p>
        <textarea
          value={objetivo}
          onChange={(ev) => setObjetivo(ev.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-gold/60 focus:outline-none resize-none"
          placeholder="¿Qué quieres lograr sí o sí hoy?"
        />
      </div>

      <button
        type="button"
        onClick={() => setModoCorto(!modoCorto)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs transition-all ${modoCorto ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20'}`}
      >
        <span>🕐 Hoy tengo poco tiempo — modo 15 minutos</span>
        <span className="font-bold">{modoCorto ? 'ON' : 'OFF'}</span>
      </button>
      <p className="text-[11px] text-white/45 -mt-2">{modoCorto ? 'Haces solo el paso esencial de hoy. Mantiene tu racha y tu avance — mejor un día corto que un día cero.' : ''}</p>

      <button
        type="button"
        disabled={!emocion || !objetivo.trim()}
        onClick={() => emocion && onAbrir({ emocion, objetivo: objetivo.trim(), modoCorto })}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gold text-black hover:bg-[#f0a94d]"
      >
        <Play className="w-4 h-4" /> {segundosObjetivo ? 'Empezar — arranca el reloj' : 'Empezar la sesión'}
      </button>
    </div>
  );
}
