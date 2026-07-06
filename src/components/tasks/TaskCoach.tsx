import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, ExternalLink } from 'lucide-react';
import type { RoadmapMeta } from '../../lib/roadmapSeed';
import TaskChecklist from './TaskChecklist';

interface TaskCoachProps {
  meta: RoadmapMeta;
  onComplete: () => void;
  isCompleted: boolean;
  onNavigateToCoach: () => void;
}

export default function TaskCoach({ meta, onComplete, isCompleted, onNavigateToCoach }: TaskCoachProps) {
  const [checked, setChecked] = useState(isCompleted);

  const handleCheck = () => {
    setChecked(true);
    onComplete();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF]/10 text-[#FFFFFF]/70 border border-[#FFFFFF]/15 tracking-wider">
            COACH
          </span>
          {checked && (
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completado
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-[#FFFFFF]" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {meta.titulo}
        </h3>
        <p className="text-sm text-[#FFFFFF]/60 mt-1">{meta.descripcion}</p>
        {meta.video_youtube_id && !meta.video_youtube_id.startsWith('PLACEHOLDER') && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[rgba(245,166,35,0.2)] bg-black mt-4">
            <iframe
              src={`https://www.youtube.com/embed/${meta.video_youtube_id}`}
              title={`Tutorial: ${meta.titulo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}
        {meta.checklist && meta.checklist.length > 0 && (
          <TaskChecklist codigo={meta.codigo} items={meta.checklist} />
        )}
      </div>

      {/* Coach instruction — interna: NO se muestra; el Mentor la recibe en su prompt */}
      {meta.coach_instruccion && (
        <div className="card-panel p-4 border border-[#F5A623]/15 bg-[#F5A623]/[0.03]">
          <p className="text-sm text-[#FFFFFF]/75 leading-relaxed">
            💬 Tu Mentor ya sabe exactamente qué van a trabajar hoy. Abre el chat y dile:{' '}
            <span className="text-[#F5A623] font-medium">"vengo por {meta.titulo}"</span> — él te guía el resto.
          </p>
        </div>
      )}

      {/* Open Coach button */}
      <button
        onClick={onNavigateToCoach}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] font-medium hover:bg-[#F5A623]/15 transition-colors"
      >
        <MessageSquare className="w-5 h-5" />
        Abrir Coach IA
        <ExternalLink className="w-4 h-4 opacity-50" />
      </button>

      {/* Confirmation — prominent completion button */}
      <div className="border-t border-[rgba(245,166,35,0.15)] pt-5">
        {checked ? (
          <div className="flex items-center justify-center gap-2 py-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-base font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Sesión con el Mentor completada
          </div>
        ) : (
          <>
            <p className="text-xs text-[#FFFFFF]/55 text-center mb-3 leading-relaxed">
              Cuando termines de hablar con el Mentor, haz clic acá para marcar este paso como completado y desbloquear el siguiente.
            </p>
            <button
              onClick={handleCheck}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[#22C55E]/15 border-2 border-[#22C55E]/40 text-[#22C55E] text-base font-semibold hover:bg-[#22C55E]/25 hover:border-[#22C55E]/70 hover:shadow-[0_0_24px_rgba(34,197,94,0.25)] transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              Marcar como completado
            </button>
          </>
        )}
      </div>
    </div>
  );
}
