import TutorialTecnicoBox from '../TutorialTecnicoBox';
import { useState } from 'react';
import { getGuion } from '../../lib/guionesVideos';
import { Play, CheckCircle2 } from 'lucide-react';
import type { RoadmapMeta } from '../../lib/roadmapSeed';
import { VOC } from '../../lib/vocabulario';

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
          <span className="text-sm uppercase font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25 tracking-wider">
            VIDEO
          </span>
          {watched && (
            <span className="text-sm uppercase font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/25 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Visto
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {VOC(meta.titulo)}
        </h3>
        <p className="text-sm text-cream/75 mt-1">{VOC(meta.descripcion)}</p>
        <TutorialTecnicoBox codigo={meta.codigo} />
      </div>

      {/*
        El recuadro del video. Cuando hay video es un marco oscuro, que es lo
        que corresponde: el reproductor viene negro de fábrica.
        Cuando lo que va adentro es la lección escrita, no: ahí es una página
        de la app y lleva el papel de la app.
      */}
      <div
        className="relative w-full aspect-video rounded-xl overflow-hidden border"
        style={{
          borderColor: 'var(--line, rgba(142,104,36,0.18))',
          background: videoId ? '#000' : 'var(--card, #F6F2E9)',
        }}
      >
        {videoId ? (
          <iframe
            src={getYoutubeEmbedUrl(videoId)}
            title={VOC(meta.titulo)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          (() => {
            const guion = getGuion(meta.codigo);
            if (guion?.esencia) {
              return (
                <div className="absolute inset-0 overflow-y-auto p-6 sm:p-8">
                  <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi mb-3">La lección de hoy</p>
                  {/*
                    La esencia lleva los tokens del vocabulario —{{consultante}}—
                    igual que el resto del Camino: un entrenador no tiene
                    pacientes. Sin VOC el cliente leería las llaves.
                  */}
                  <p className="text-[17px] sm:text-[19px] leading-relaxed text-cream" style={{ fontFamily: 'var(--font-display)' }}>
                    {VOC(guion.esencia)}
                  </p>
                  <p className="text-[15px] text-cream/55 mt-4">Tu lección, escrita. El video se suma arriba cuando esté.</p>
                </div>
              );
            }
            return (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <Play className="w-12 h-12 mb-3" style={{ color: 'var(--gold, #8E6824)', opacity: 0.45 }} />
                <p className="text-[17px] text-cream">Tu sesión, escrita</p>
                <p className="text-[15px] text-cream/60 mt-2 leading-relaxed max-w-sm">
                  Tienes la instrucción completa aquí abajo.
                </p>
              </div>
            );
          })()
        )}
      </div>

      {/* Mark as watched */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-cream/55">
          {meta.tiempo_estimado || '10–15 min'}
        </p>

        {watched ? (
          <div className="flex items-center gap-2 text-success text-sm font-medium">
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
