/**
 * CRONÓMETRO DE SESIÓN — visible durante el trabajo, con pausa de primera
 * clase: el avatar vive en huecos de 10-15 min entre pacientes; pausar y
 * retomar es una feature central, no un fallback. Al cumplirse el tiempo
 * no corta: invita a cerrar ("lo que se abre, se cierra").
 */
import React, { useEffect, useState } from 'react';
import { Pause, Play, Timer } from 'lucide-react';
import {
  type SesionEnCurso, segundosDeSesion, pausarSesion, reanudarSesion, formatoCrono,
} from '../../lib/sessionLog';

interface Props {
  sesion: SesionEnCurso;
  segundosObjetivo: number | null;
  onSesionChange: (s: SesionEnCurso) => void;
}

export default function CronometroSesion({ sesion, segundosObjetivo, onSesionChange }: Props) {
  const [ahora, setAhora] = useState(() => segundosDeSesion(sesion));

  useEffect(() => {
    const t = setInterval(() => setAhora(segundosDeSesion(sesion)), 1000);
    return () => clearInterval(t);
  }, [sesion]);

  const pausada = !sesion.corriendoDesde;
  const cumplido = segundosObjetivo !== null && ahora >= segundosObjetivo;
  const progreso = segundosObjetivo ? Math.min(100, (ahora / segundosObjetivo) * 100) : 0;

  return (
    <div className={`rounded-xl border px-3 py-2 ${cumplido ? 'border-success/40 bg-success/5' : 'border-white/10 bg-white/5'}`}>
      <div className="flex items-center gap-3">
        <Timer className={`w-4 h-4 ${cumplido ? 'text-success' : 'text-gold'}`} />
        <span className="font-mono text-sm text-white tabular-nums">{formatoCrono(ahora)}</span>
        {segundosObjetivo !== null && (
          <span className="text-[11px] text-white/40">/ {formatoCrono(segundosObjetivo)}</span>
        )}
        <div className="flex-1" />
        {pausada ? (
          <button
            type="button"
            onClick={() => onSesionChange(reanudarSesion(sesion))}
            className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-[#f0a94d]"
          >
            <Play className="w-3.5 h-3.5" /> Retomar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSesionChange(pausarSesion(sesion))}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white/90"
          >
            <Pause className="w-3.5 h-3.5" /> Pausar
          </button>
        )}
      </div>
      {segundosObjetivo !== null && (
        <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all ${cumplido ? 'bg-success' : 'bg-gold'}`}
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}
      {pausada && (
        <p className="mt-1.5 text-[11px] text-white/40">Sesión pausada — el dojo te espera. Todo quedó guardado.</p>
      )}
      {cumplido && !pausada && (
        <p className="mt-1.5 text-[11px] text-success">El tiempo de hoy se cumplió. Lo que abriste, cerralo: consolidá la sesión. 🥋</p>
      )}
    </div>
  );
}
