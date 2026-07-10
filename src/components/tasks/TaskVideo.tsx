import React, { useState } from 'react';
import { getGuion } from '../../lib/guionesVideos';
import { Play, CheckCircle2, ExternalLink } from 'lucide-react';
import type { RoadmapMeta } from '../../lib/roadmapSeed';

interface TaskVideoProps {
  meta: RoadmapMeta;
  onComplete: () => void;
  isCompleted: boolean;
}

function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export default function TaskVideo({ meta, onComplete, isCompleted }: TaskVideoProps) {
  const [watched, setWatched] = useState(isCompleted);

  const handleMarkWatched = () => {
    setWatched(true);
    onComplete();
  };

  const hasRealVideo = meta.video_youtube_id && !meta.video_youtube_id.startsWith('PLACEHOLDER');
  const videoId = hasRealVideo ? meta.video_youtube_id : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Video Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E8962E]/15 text-[#E8962E] border border-[#E8962E]/25 tracking-wider">
            VIDEO
          </span>
          {watched && (
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Visto
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-[#F2EFE9]" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {meta.titulo}
        </h3>
        <p className="text-sm text-[#F2EFE9]/60 mt-1">{meta.descripcion}</p>
      </div>

      {/* YouTube Embed */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[rgba(232,150,46,0.12)] bg-black">
        {videoId ? (
          <iframe
            src={getYoutubeEmbedUrl(videoId)}
            title={meta.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          (() => {
            const guion = getGuion(meta.codigo);
            if (guion?.esencia) {
              return (
                <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-[#141311] to-[#0B0A09] p-6 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E8962E] mb-4">La lección de hoy</p>
                  <p className="text-base sm:text-lg leading-relaxed text-[#F2EFE9]/90" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    {guion.esencia}
                  </p>
                  <p className="text-[10px] text-[#F2EFE9]/35 mt-4">La versión en video llega pronto — la lección es la misma. Tu Mentor la conoce completa: pregúntale lo que quieras.</p>
                </div>
              );
            }
            return (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111110] px-6 text-center">
                <Play className="w-12 h-12 text-[#E8962E]/50 mb-3" />
                <p className="text-sm text-[#F2EFE9]/80">🎬 El video de esta sesión está en producción</p>
                <p className="text-xs text-[#F2EFE9]/45 mt-2 leading-relaxed max-w-sm">
                  No te frena nada: la instrucción completa está aquí abajo, y tu Mentor conoce esta lección entera — pregúntale lo que necesites.
                </p>
              </div>
            );
          })()
        )}
      </div>

      {/* Mark as watched */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#F2EFE9]/40">
          {meta.tiempo_estimado || '10–15 min'}
        </p>

        {watched ? (
          <div className="flex items-center gap-2 text-[#22C55E] text-sm font-medium">
            <CheckCircle2 className="w-5 h-5" />
            Video completado
          </div>
        ) : (
          <button
            onClick={handleMarkWatched}
            className="btn-primary flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar como visto
          </button>
        )}
      </div>
    </div>
  );
}
