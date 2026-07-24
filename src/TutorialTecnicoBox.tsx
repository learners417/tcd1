import NumeroPanel from '../numero/NumeroPanel';
import ConstructorAnuncios from '../campanas/ConstructorAnuncios';
import SesionGuiadaPlayer from '../SesionGuiadaPlayer';
import { sesionGuiadaDe } from '../../lib/sesionesGuiadas';
import TutorialTecnicoBox from '../TutorialTecnicoBox';
import React, { useEffect, useState } from 'react';
import { listarEvidencias, subirEvidencia } from '../../lib/evidencia';
import { verificarEvidenciaVision, type VeredictoVision } from '../../lib/visionEvidencia';
import { notificarAdminsEvidencia } from '../../lib/notifications';
import { supabase } from '../../lib/supabase';
import { MessageSquare, CheckCircle2, ExternalLink } from 'lucide-react';
import type { RoadmapMeta } from '../../lib/roadmapSeed';
import TaskChecklist from './TaskChecklist';
import BotonAudio from '../sesion/BotonAudio';

interface TaskCoachProps {
  meta: RoadmapMeta;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function TaskCoach({ meta, onComplete, isCompleted }: TaskCoachProps) {
  // ── Evidencia obligatoria (Cirugía Final F2) ──
  const [evidencias, setEvidencias] = useState<number>(-1);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [veredicto, setVeredicto] = useState<VeredictoVision | null>(null);
  const [verificando, setVerificando] = useState(false);
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

  // ── El cuaderno de la sesión: acá se vuelca el trabajo (escrito o hablado) ──
  const KEY_NOTAS = 'tcd_notas_sesion_v1';
  const [nota, setNota] = React.useState('');
  const [notaGuardada, setNotaGuardada] = React.useState(false);
  React.useEffect(() => {
    try { setNota((JSON.parse(localStorage.getItem(KEY_NOTAS) ?? '{}'))[meta.codigo] ?? ''); } catch { /* noop */ }
  }, [meta.codigo]);
  const [playerAbierto, setPlayerAbierto] = React.useState(false);
  const guionVivo = React.useMemo(() => sesionGuiadaDe(meta.codigo), [meta.codigo]);
  React.useEffect(() => { if (guionVivo && !isCompleted) setPlayerAbierto(true); }, [guionVivo, isCompleted]);
  const guardarNota = () => {
    try {
      const all = JSON.parse(localStorage.getItem(KEY_NOTAS) ?? '{}');
      all[meta.codigo] = nota;
      localStorage.setItem(KEY_NOTAS, JSON.stringify(all));
      setNotaGuardada(true);
      window.setTimeout(() => setNotaGuardada(false), 2500);
    } catch { /* noop */ }
  };
  const handleSubir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid || subiendo) return;
    setSubiendo(true);
    setErrorSubida(null);
    const res = await subirEvidencia(uid, meta.codigo, file);
    if (res.ok) {
      setEvidencias((n) => Math.max(0, n) + 1);
      try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); void notificarAdminsEvidencia(p?.nombre ?? 'Un cliente', meta.codigo); } catch { /* noop */ }
      // CP9 · Visión IA (asistente, nunca bloquea): verifica la imagen en segundo plano.
      if (meta.evidencia_requerida?.descripcion) {
        setVeredicto(null);
        setVerificando(true);
        const v = await verificarEvidenciaVision(file, meta.evidencia_requerida.descripcion);
        setVerificando(false);
        setVeredicto(v);
        if (v && v.ok === false) {
          // El testigo no la confirmó: esa evidencia NO cuenta.
          setEvidencias((n) => Math.max(0, n - 1));
          setErrorSubida(`Tu testigo no pudo confirmarla${v.motivo ? ': ' + v.motivo : ''}. Sube otra foto — la de verdad.`);
        }
      }
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
        <TutorialTecnicoBox codigo={meta.codigo} />

        {/* EL NÚMERO vive acá: es un ejercicio del Camino, no una sección aparte. */}
        {/* EL CONSTRUCTOR vive acá: sus 3 anuncios se crean dentro de la sesión. */}
        {meta.codigo === 'P4.3' && (
          <div className="rounded-2xl border border-gold/25 bg-gold/[0.03] p-4">
            <ConstructorAnuncios />
          </div>
        )}

        {meta.codigo === 'P1.5' && (
          <div className="rounded-2xl border border-gold/25 bg-gold/[0.03] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-3">Tu calculadora — acá sale tu número</p>
            <NumeroPanel />
          </div>
        )}

        {/* ── CIRUGÍA 1: la micro-sesión inmersiva (si esta sesión tiene guion) ── */}
        {guionVivo && !isCompleted && (
          <button onClick={() => setPlayerAbierto(true)}
            className="w-full text-left rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/[0.12] to-gold/[0.03] p-5 hover:border-gold/60 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold mb-1.5">🥋 Micro-sesión guiada</p>
            <p className="text-sm text-cream/85">{guionVivo.pasos.length} pasos · un paso por pantalla · el Mentor te guía y todo queda en tu ADN</p>
            <p className="text-sm font-bold text-gold mt-3">Entrar a mi sesión →</p>
          </button>
        )}
        {playerAbierto && guionVivo && (
          <SesionGuiadaPlayer
            codigo={meta.codigo}
            titulo={meta.titulo}
            onClose={() => setPlayerAbierto(false)}
            onFinish={(texto) => {
              setNota(texto);
              try {
                const all = JSON.parse(localStorage.getItem('tcd_notas_sesion_v1') ?? '{}');
                all[meta.codigo] = texto;
                localStorage.setItem('tcd_notas_sesion_v1', JSON.stringify(all));
              } catch { /* noop */ }
              setNotaGuardada(true);
              setPlayerAbierto(false);
              // Terminar la micro-sesión CIERRA la sesión: se marca hecha y vuelve al Camino.
              // Si le falta la evidencia, no la damos por cerrada — se lo decimos claro.
              if (!isCompleted) {
                if (evidenciaLista) onComplete();
                else setErrorSubida('Solo te falta tu evidencia para cerrar esta sesión. Súbela acá abajo.');
              }
            }}
          />
        )}

        {/* ── Tu espacio de trabajo: escribe o habla, y queda guardado ── */}
        {!isCompleted && (
          <div className="card-panel p-4 border border-[rgba(232,150,46,0.15)] mt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gold mb-2">✍️ Tu trabajo de hoy</p>
            <p className="text-xs text-cream/55 mb-3">Lo que salga de esta sesión, déjalo acá. Puedes escribirlo o decirlo en voz alta.</p>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={5}
              placeholder="Lo que trabajaste, lo que descubriste, lo que decidiste…"
              className="w-full bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 resize-y"
            />
            <div className="flex items-center justify-between mt-2">
              <BotonAudio onTexto={(t) => setNota((p) => (p ? p + '\n' + t : t))} />
              {notaGuardada ? (
                <span className="text-xs text-success font-bold">Grabado en tu ADN ✓</span>
              ) : (
                <button type="button" onClick={guardarNota} disabled={!nota.trim()}
                  className="text-xs font-bold text-gold hover:text-goldhi disabled:opacity-40">
                  Grabar en mi ADN →
                </button>
              )}
            </div>
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
            {veredicto?.ok && (
              <p className="text-xs text-success mt-2">✓ Tu testigo la vio{veredicto.motivo ? `: ${veredicto.motivo}` : ''}. Confirmada.</p>
            )}
            {errorSubida && <p className="text-xs text-danger mt-2">⚠️ {errorSubida}</p>}
            {verificando && <p className="text-xs text-cream/55 mt-2">Revisando la imagen…</p>}
            {veredicto && !verificando && (veredicto.ok
              ? <p className="text-xs text-success mt-2">✓ Se ve bien — coincide con lo pedido.</p>
              : <p className="text-xs text-gold mt-2">⚠️ {veredicto.motivo || 'Revisa que la foto muestre lo pedido'} — si estás seguro, puedes seguir igual.</p>
            )}
          </div>
        )}
        {meta.checklist && meta.checklist.length > 0 && (
          <TaskChecklist codigo={meta.codigo} items={meta.checklist} />
        )}
      </div>

      {/* Confirmation — prominent completion button */}
      <div className="border-t border-[rgba(232,150,46,0.10)] pt-5">
        {checked ? (
          <div className="flex items-center justify-center gap-2 py-4 rounded-xl bg-success/10 border border-success/30 text-success text-base font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Sesión completada
          </div>
        ) : (
          <>
            <p className="text-xs text-cream/55 text-center mb-3 leading-relaxed">
              {evidenciaLista
                ? 'Cuando termines tu trabajo de hoy, marca este paso como completado y se abre el siguiente.'
                : 'Este paso requiere tu evidencia. Súbela arriba — sin ella, el cinturón no se gana.'}
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
