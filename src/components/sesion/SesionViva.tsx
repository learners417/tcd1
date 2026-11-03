/**
 * SESIÓN VIVA — cinco pantallas, una idea por pantalla (C2 del plan definitivo).
 *
 *   Te llevas · Mira · Haz · Sube · Listo
 *
 * Reemplaza la versión con check-in de emoción y cronómetro a la vista:
 *   - Nadie declara cómo llega para poder empezar. La emoción queda para los
 *     días de protocolo, que la piden por su cuenta.
 *   - Un reloj corriendo apura y no ayuda: el tiempo se dice una vez, al inicio.
 *   - Sin video, la pantalla "Mira" no existe: no se anuncia lo que falta.
 *
 * La sesión queda registrada igual y sobrevive a cerrar la app.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  type SesionEnCurso,
  getSesionEnCurso, setSesionEnCurso, segundosDeSesion,
  abrirSessionLog, cerrarSessionLog,
} from '../../lib/sessionLog';

const KEY_ULTIMA = 'tcd_ultima_sesion_v1';
export interface UltimaSesion {
  metaCodigo: string;
  metaTitulo: string;
  compromisos: string[];
  fecha: string;
}
export function getUltimaSesion(): UltimaSesion | null {
  try {
    const raw = localStorage.getItem(KEY_ULTIMA);
    return raw ? (JSON.parse(raw) as UltimaSesion) : null;
  } catch { return null; }
}

export type PantallaSesion = 'llevas' | 'mira' | 'haz' | 'sube' | 'listo';

interface Props {
  metaKey: string;
  metaCodigo: string;
  metaTitulo: string;
  teLlevas?: string;
  pasos?: string[];
  pide?: string;
  seAbre?: string;
  /** Lo que ya contestó en el onboarding para esta jornada. */
  base?: { etiqueta: string; valor: string } | null;
  tiempoEstimado?: string | null;
  isCompleted: boolean;
  userId?: string;
  children: React.ReactNode;
  video?: React.ReactNode;
  evidencia?: React.ReactNode;
}

const ROTULO: Record<PantallaSesion, string> = {
  llevas: 'Te llevas', mira: 'Mira', haz: 'Haz', sube: 'Sube', listo: 'Listo',
};

export default function SesionViva({
  metaKey, metaCodigo, metaTitulo, teLlevas, pasos, pide, seAbre, base,
  tiempoEstimado, isCompleted, userId, children, video, evidencia,
}: Props) {
  const orden = useMemo<PantallaSesion[]>(
    () => ['llevas', ...(video ? (['mira'] as PantallaSesion[]) : []), 'haz', 'sube', 'listo'],
    [video],
  );
  const [pantalla, setPantalla] = useState<PantallaSesion>(() => {
    const s = getSesionEnCurso();
    return s && s.metaKey === metaKey ? 'haz' : 'llevas';
  });
  const [sesion, setSesion] = useState<SesionEnCurso | null>(() => {
    const s = getSesionEnCurso();
    return s && s.metaKey === metaKey ? s : null;
  });
  const [hechos, setHechos] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isCompleted && pantalla !== 'listo') setPantalla('listo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const abrir = async () => {
    setPantalla(orden[1] ?? 'haz');
    if (sesion) return;
    const nueva: SesionEnCurso = {
      metaKey, metaCodigo, metaTitulo,
      checkinEmocion: null, checkinObjetivo: '',
      segundosAcumulados: 0, corriendoDesde: Date.now(), pausas: 0,
      iniciadaEn: new Date().toISOString(),
    };
    setSesionEnCurso(nueva); setSesion(nueva);
    if (userId) {
      const logId = await abrirSessionLog(userId, { codigo: metaCodigo, titulo: metaTitulo }, { emocion: null, objetivo: '' });
      if (logId) { const conLog = { ...nueva, logId }; setSesionEnCurso(conLog); setSesion(conLog); }
    }
  };

  useEffect(() => {
    if (pantalla !== 'listo' || !sesion) return;
    const s = sesion;
    void (async () => {
      await cerrarSessionLog(s.logId, {
        checkout_emocion: null, compromisos: [],
        duracion_seg: segundosDeSesion(s), pausas: s.pausas,
      });
      try {
        localStorage.setItem(KEY_ULTIMA, JSON.stringify({
          metaCodigo, metaTitulo, compromisos: [], fecha: new Date().toISOString(),
        } as UltimaSesion));
      } catch { /* noop */ }
      setSesionEnCurso(null); setSesion(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantalla]);

  const i = Math.max(0, orden.indexOf(pantalla));
  const ir = (delta: number) => {
    const n = orden[i + delta];
    if (n) { setPantalla(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  return (
    <div className="space-y-4">
      <div aria-label={`Paso ${i + 1} de ${orden.length}`}>
        <div className="flex items-center gap-2">
          {orden.map((p, n) => (
            <div key={p} className="flex-1 h-1.5 rounded-full"
              style={{ background: n <= i ? 'var(--oro-d, #8E6824)' : 'var(--line, #EBE1CF)' }} />
          ))}
        </div>
        <p className="mt-2 text-[15px] font-semibold text-cream">
          {ROTULO[pantalla]} · paso {i + 1} de {orden.length}
        </p>
      </div>

      {pantalla === 'llevas' && (
        <section className="card-panel p-5 sm:p-6">
          <h2 className="text-[28px] leading-[1.15] text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            {metaTitulo}
          </h2>
          {teLlevas && <p className="mt-3 text-[19px] leading-relaxed text-cream">Te llevas: {teLlevas}</p>}
          {base && (
            <p className="mt-3 text-[17px] leading-relaxed text-cream/75">
              {base.etiqueta}: <span className="text-cream font-semibold">{base.valor}</span>. Hoy lo trabajamos desde ahí.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {tiempoEstimado && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line2,#DFD3BC)] px-3 py-1.5 text-[15px] text-cream/80">
                <Clock className="w-4 h-4" /> {tiempoEstimado}
              </span>
            )}
          </div>
          <button type="button" onClick={abrir} className="btn-ios-primary mt-5 w-full">
            {video ? 'Ver el video' : 'Empezar'}
          </button>
        </section>
      )}

      {pantalla === 'mira' && video && (
        <section className="card-panel p-5 sm:p-6 space-y-4">
          {video}
          <button type="button" onClick={() => ir(1)} className="btn-ios-primary w-full">
            Ya lo vi, vamos a hacerlo
          </button>
        </section>
      )}

      {pantalla === 'haz' && (
        <section className="space-y-4">
          {pasos && pasos.length > 0 && (
            <div className="card-panel p-5 sm:p-6">
              <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Paso a paso</p>
              <ul className="mt-3 space-y-1">
                {pasos.map((paso, n) => {
                  const hecho = hechos.has(n);
                  return (
                    <li key={n}>
                      <button
                        type="button"
                        aria-pressed={hecho}
                        onClick={() => setHechos((prev) => {
                          const s = new Set(prev);
                          if (s.has(n)) s.delete(n); else s.add(n);
                          return s;
                        })}
                        className="w-full min-h-[52px] flex items-start gap-3 py-2 text-left"
                      >
                        <span
                          className="mt-0.5 w-7 h-7 shrink-0 rounded-full grid place-items-center border"
                          style={hecho
                            ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                            : { borderColor: 'var(--line2, #DFD3BC)' }}
                        >
                          {hecho && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                        </span>
                        <span className={`text-[17px] leading-snug ${hecho ? 'text-cream/60' : 'text-cream'}`}>{paso}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {children}
        </section>
      )}

      {pantalla === 'sube' && (
        <section className="card-panel p-5 sm:p-6 space-y-4">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Terminaste cuando</p>
          <p className="text-[19px] leading-relaxed text-cream">{pide ?? 'Subes lo que hiciste hoy.'}</p>
          {evidencia}
        </section>
      )}

      {pantalla === 'listo' && (
        <section className="card-panel p-5 sm:p-6">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--tilde, #4A7C59)' }}>Listo</p>
          <h2 className="mt-2 text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            {metaTitulo}
          </h2>
          {seAbre && <p className="mt-2 text-[19px] leading-relaxed text-cream">{seAbre}</p>}
          <p className="mt-2 text-[17px] text-cream/70">Queda registrado en tu Camino. Mañana sigue el paso que toca.</p>
        </section>
      )}

      {pantalla !== 'llevas' && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => ir(-1)} disabled={i === 0}
            className="min-h-[52px] rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream disabled:opacity-40">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Anterior
          </button>
          <button type="button" onClick={() => ir(1)} disabled={i >= orden.length - 1}
            className="min-h-[52px] rounded-[20px] border border-[var(--line2,#DFD3BC)] text-[17px] font-semibold text-cream disabled:opacity-40">
            Siguiente <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
