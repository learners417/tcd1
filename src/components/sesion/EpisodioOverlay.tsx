/**
 * EpisodioOverlay — el modo inmersivo del Camino (T2 · Plan Maestro).
 *
 * Convierte la sesión en un EPISODIO a pantalla completa (lección RENACE):
 *   LLEGADA (el encuadre: qué es, qué produce, cuánto pide — un solo botón)
 *   → LA SESIÓN (SesionViva de siempre: check-in → trabajo → check-out)
 *   → CLIFFHANGER (el teaser del próximo episodio: cada día vende el siguiente).
 *
 * Reglas: un solo botón primario por pantalla · el fundador puede pausar y
 * salir sin perder nada (SesionViva ya persiste) · las metas completadas no
 * pasan por acá (se revisan inline, sin ritual).
 */
import React, { useEffect, useState } from 'react';
import { X, Play, ArrowRight, Star } from 'lucide-react';
import { teaserPara, type Teaser } from '../../lib/teasers';
import MentorPanel from './MentorPanel';

interface Props {
  metaKey: string;
  metaCodigo: string;
  metaTitulo: string;
  descripcion?: string;
  tiempoEstimado?: string | null;
  diaAsignado?: number;
  esHito?: boolean;
  isCompleted: boolean; // se vuelve true cuando el fundador completa la meta adentro
  completadas: Set<string>;
  onClose: () => void;
  children: React.ReactNode; // SesionViva con el panel de trabajo
}

type FaseOverlay = 'llegada' | 'sesion' | 'cliffhanger';

export default function EpisodioOverlay({
  metaKey, metaCodigo, metaTitulo, descripcion, tiempoEstimado, diaAsignado, esHito,
  isCompleted, completadas, onClose, children,
}: Props) {
  const [fase, setFase] = useState<FaseOverlay>(() => {
    // Si hay una sesión en curso de ESTA meta, entrar directo (retomar).
    try {
      const raw = localStorage.getItem('tcd_sesion_en_curso_v1');
      if (raw) {
        const s = JSON.parse(raw) as { metaKey?: string };
        if (s?.metaKey === metaKey) return 'sesion';
      }
    } catch { /* noop */ }
    return 'llegada';
  });
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const tituloLimpio = metaTitulo.replace('⭐', '').trim();

  // Bloquear el scroll del fondo mientras el episodio está abierto.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Al completarse la meta (check-out hecho): preparar el cliffhanger.
  useEffect(() => {
    if (isCompleted && fase === 'sesion') {
      setTeaser(teaserPara(completadas, metaKey));
    }
  }, [isCompleted, fase, completadas, metaKey]);

  return (
    <div className="fixed inset-0 z-[70] bg-[#0D0C0B] overflow-y-auto">
      {/* Header del episodio */}
      <div className="sticky top-0 z-30 bg-[#0D0C0B]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8962E] truncate">
            {fase === 'cliffhanger' ? 'Episodio completado' : `Episodio${diaAsignado ? ` · Día ${diaAsignado}` : ''}`}
            {esHito && fase !== 'cliffhanger' && <span className="ml-2 text-yellow-500">⭐ Sesión-hito</span>}
          </p>
          <button
            onClick={onClose}
            className="shrink-0 flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/80 transition-colors uppercase font-bold tracking-wider"
            title="Tu avance queda guardado — retomas donde dejaste"
          >
            {fase === 'sesion' && !isCompleted ? 'Pausar y salir' : 'Salir'} <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ══ LLEGADA ══ */}
        {fase === 'llegada' && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            {esHito ? (
              <Star className="w-10 h-10 text-yellow-500 fill-yellow-500/30 mb-6" />
            ) : (
              <img src="/javo.jpg" alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#E8962E]/40 mb-6" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <h1 className="text-3xl md:text-4xl font-light text-[#F2EFE9] mb-4 max-w-xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              {tituloLimpio}
            </h1>
            {descripcion && (
              <p className="text-sm text-white/55 max-w-lg leading-relaxed mb-3">{descripcion.split('.').slice(0, 2).join('.') + '.'}</p>
            )}
            <p className="text-xs text-white/35 mb-8">
              {tiempoEstimado ?? '30-45 min'}{esHito ? ' · esta sesión pide más — vale por diez' : ' · o modo 15 minutos si hoy no llegas'}
            </p>
            <button
              onClick={() => setFase('sesion')}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#E8962E] text-black text-base font-bold hover:bg-[#F4B65C] hover:shadow-[0_0_40px_rgba(232,150,46,0.25)] transition-all"
            >
              <Play className="w-5 h-5" /> COMENZAR
            </button>
          </div>
        )}

        {/* ══ LA SESIÓN (check-in → trabajo → check-out, de SesionViva) ══ */}
        {fase !== 'llegada' && (
          <div className={fase === 'cliffhanger' ? 'hidden' : ''}>{children}</div>
        )}
        {/* T4 · El Mentor vive adentro — burbuja + panel, sin salir de la pestaña */}
        {fase === 'sesion' && !isCompleted && (
          <MentorPanel metaCodigo={metaCodigo} metaTitulo={metaTitulo} metaDescripcion={descripcion} />
        )}

        {/* Puente al cliffhanger: aparece cuando el check-out terminó */}
        {fase === 'sesion' && isCompleted && teaser && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-[#0D0C0B] via-[#0D0C0B]/95 to-transparent pt-10 pb-5">
            <div className="max-w-3xl mx-auto px-4">
              <button
                onClick={() => setFase('cliffhanger')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#E8962E] text-black text-sm font-bold hover:bg-[#F4B65C] transition-colors"
              >
                Cerrar el día <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══ CLIFFHANGER — el próximo episodio ══ */}
        {fase === 'cliffhanger' && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <p className="text-4xl mb-5">🥋</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#22C55E] mb-6">Sesión de hoy: completada ✓</p>
            {teaser ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8962E] mb-3">
                  {teaser.esHito ? '⭐ Se viene algo grande' : 'Próximo episodio'}
                </p>
                <h2 className="text-2xl md:text-3xl font-light text-[#F2EFE9] mb-4 max-w-lg" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {teaser.titulo}
                </h2>
                <p className="text-sm text-white/60 max-w-md leading-relaxed mb-10">{teaser.frase}</p>
              </>
            ) : (
              <h2 className="text-2xl font-light text-[#F2EFE9] mb-10 max-w-lg" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                No queda camino por delante. Directora. Director. ⬛
              </h2>
            )}
            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl bg-white/[0.06] border border-white/15 text-white/80 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Hasta mañana 🌙
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
