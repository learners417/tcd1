import React, { useEffect, useState } from 'react';
import { listarEvidencias, subirEvidencia } from '../../lib/evidencia';
import { notificarAdminsEvidencia } from '../../lib/notifications';
import { supabase } from '../../lib/supabase';
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
  // ── Evidencia obligatoria (Cirugía Final F2) ──
  const [evidencias, setEvidencias] = useState<number>(-1);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    if (!meta.evidencia_requerida) return;
    (async () => {
      const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
      const userId = data.user?.id ?? null;
      setUid(userId);
      if (userId) setEvidencias((await listarEvidencias(userId, meta.codigo)).length);
      else setEvidencias(0);
    })();
  }, [meta.codigo, meta.evidencia_requerida]);
  const requiereEvidencia = Boolean(meta.evidencia_requerida) && !isCompleted;
  const evidenciaLista = !requiereEvidencia || evidencias > 0;
  const handleSubir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid || subiendo) return;
    setSubiendo(true);
    setErrorSubida(null);
    const res = await subirEvidencia(uid, meta.codigo, file);
    if (res.ok) {
      setEvidencias((n) => Math.max(0, n) + 1);
      try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); void notificarAdminsEvidencia(p?.nombre ?? 'Un cliente', meta.codigo); } catch { /* noop */ }
    } else {
      setErrorSubida((res as { ok: false; motivo: string }).motivo);
    }
    setSubiendo(false);
  };
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
          <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-full bg-cream/10 text-cream/70 border border-cream/15 tracking-wider">
            MENTOR
          </span>
          {checked && (
            <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/25 tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completado
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {meta.titulo}
        </h3>
        <p className="text-sm text-cream/75 mt-1">{meta.descripcion}</p>
        {meta.video_youtube_id && !meta.video_youtube_id.startsWith('PLACEHOLDER') && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[rgba(232,150,46,0.12)] bg-black mt-4">
            <iframe
              src={`https://www.youtube.com/embed/${meta.video_youtube_id}`}
              title={`Tutorial: ${meta.titulo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}
        {meta.evidencia_requerida && (
          <div className={`card-panel p-4 border ${evidenciaLista ? 'border-success/30 bg-success/[0.04]' : 'border-gold/30 bg-gold/[0.04]'}`}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-gold">
              {evidenciaLista && evidencias > 0 ? '✓ Evidencia recibida' : '📎 Evidencia requerida'}
            </p>
            <p className="text-sm text-cream/75 leading-relaxed mb-3">{meta.evidencia_requerida.descripcion}</p>
            {!isCompleted && (
              <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${evidencias > 0 ? 'bg-success/15 text-success hover:bg-success/25' : 'bg-gold text-black hover:bg-goldhi'}`}>
                {subiendo ? 'Subiendo…' : evidencias > 0 ? `✓ ${evidencias} subida${evidencias > 1 ? 's' : ''} · agregar otra` : 'Subir mi evidencia'}
                <input type="file" accept="image/*,audio/*,video/*,.pdf" className="hidden" onChange={handleSubir} disabled={subiendo} />
              </label>
            )}
            {errorSubida && <p className="text-xs text-danger mt-2">⚠️ {errorSubida}</p>}
          </div>
        )}
        {meta.checklist && meta.checklist.length > 0 && (
          <TaskChecklist codigo={meta.codigo} items={meta.checklist} />
        )}
      </div>

      {/* Coach instruction — interna: NO se muestra; el Mentor la recibe en su prompt */}
      {meta.coach_instruccion && (
        <div className="card-panel p-4 border border-gold/15 bg-gold/[0.03]">
          <p className="text-sm text-cream/75 leading-relaxed">
            💬 Tu Mentor ya sabe exactamente qué van a trabajar hoy. Abre el chat y dile:{' '}
            <span className="text-gold font-medium">"vengo por {meta.titulo}"</span> — él te guía el resto.
          </p>
        </div>
      )}

      {/* Open Coach button */}
      <button
        onClick={onNavigateToCoach}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gold/10 border border-gold/20 text-gold font-medium hover:bg-gold/15 transition-colors"
      >
        <MessageSquare className="w-5 h-5" />
        Abrir el Mentor
        <ExternalLink className="w-4 h-4 opacity-50" />
      </button>

      {/* Confirmation — prominent completion button */}
      <div className="border-t border-[rgba(232,150,46,0.10)] pt-5">
        {checked ? (
          <div className="flex items-center justify-center gap-2 py-4 rounded-xl bg-success/10 border border-success/30 text-success text-base font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Sesión con el Mentor completada
          </div>
        ) : (
          <>
            <p className="text-xs text-cream/55 text-center mb-3 leading-relaxed">
              {evidenciaLista
                ? 'Cuando termines de hablar con el Mentor, haz clic acá para marcar este paso como completado y desbloquear el siguiente.'
                : '📎 Este paso requiere tu evidencia. Súbela arriba — sin ella, el cinturón no se gana.'}
            </p>
            <button
              onClick={() => { if (evidenciaLista) handleCheck(); }}
              disabled={!evidenciaLista}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-semibold transition-all ${evidenciaLista ? 'bg-success/15 border-2 border-success/40 text-success hover:bg-success/25 hover:border-success/70 hover:shadow-[0_0_24px_rgba(34,197,94,0.25)]' : 'bg-cream/5 border-2 border-cream/10 text-cream/45 cursor-not-allowed'}`}
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
