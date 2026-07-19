/**
 * SesionPasos — T3 · el motor del conversor (Plan Maestro).
 * Un paso por pantalla · un solo botón primario · la IA propone desde el ADN
 * y el fundador FIRMA · validación dura por paso (imposible guardar basura) ·
 * micrófono en las preguntas abiertas (idea #5) · Modo 15 min respeta el
 * paso esencial (idea #7) · el Mensaje al Futuro se sella el D1 (idea #10).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Mic, MicOff, Check, Sparkles, Pencil, Upload, Loader2 } from 'lucide-react';
import type { SesionGuiada, PasoGuiado } from '../../lib/sesionesGuiadas';
import { radarPara } from '../../lib/radarPrecios';
import { generateText } from '../../lib/aiProvider';
import { subirEvidencia } from '../../lib/evidencia';
import { notificarAdminsEvidencia } from '../../lib/notifications';
import { getSesionEnCurso } from '../../lib/sessionLog';
import type { Profile } from '../../lib/supabase';

interface Props {
  sesion: SesionGuiada;
  perfil?: Partial<Profile> | null;
  userId?: string | null;
  onFirmar: (tituloArtefacto: string, texto: string) => void; // guarda al ADN (pipeline existente)
  onComplete: () => void;
  isCompleted: boolean;
}

type Respuestas = Record<string, string | string[]>;

/* ── Micrófono (#5): Web Speech API, es-419, sin dependencias ── */
function useMicrofono(onTexto: (t: string) => void) {
  const [grabando, setGrabando] = useState(false);
  const [soportado] = useState(() => typeof window !== 'undefined' && !!((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition));
  const recRef = useRef<{ stop: () => void } | null>(null);
  const toggle = () => {
    if (grabando) { recRef.current?.stop(); setGrabando(false); return; }
    try {
      const W = window as unknown as Record<string, unknown>;
      const SR = (W.SpeechRecognition || W.webkitSpeechRecognition) as new () => {
        lang: string; continuous: boolean; interimResults: boolean;
        onresult: (e: { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal: boolean }> }) => void;
        onend: () => void; onerror: () => void; start: () => void; stop: () => void;
      };
      const rec = new SR();
      rec.lang = 'es-419'; rec.continuous = true; rec.interimResults = false;
      rec.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) onTexto(e.results[i][0].transcript.trim() + ' ');
        }
      };
      rec.onend = () => setGrabando(false);
      rec.onerror = () => setGrabando(false);
      rec.start(); recRef.current = rec; setGrabando(true);
    } catch { setGrabando(false); }
  };
  return { grabando, soportado, toggle };
}

function BotonPrimario({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gold text-black text-sm font-bold hover:bg-goldhi transition-all disabled:opacity-35 disabled:cursor-not-allowed">
      {children}
    </button>
  );
}

export default function SesionPasos({ sesion, perfil, userId, onFirmar, onComplete, isCompleted }: Props) {
  const storageKey = `tcd_pasos_${sesion.codigo}`;
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState<Respuestas>({});
  const [otraTexto, setOtraTexto] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [opcionesIA, setOpcionesIA] = useState<Record<string, string[]>>({});
  const [artefacto, setArtefacto] = useState('');
  const [editandoArtefacto, setEditandoArtefacto] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [evidenciaOk, setEvidenciaOk] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const modoCorto = !!getSesionEnCurso()?.modoCorto;

  // Persistencia: retomar donde quedó
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) { const s = JSON.parse(raw); setIdx(s.idx ?? 0); setResp(s.resp ?? {}); setArtefacto(s.artefacto ?? ''); setOpcionesIA(s.opcionesIA ?? {}); setEvidenciaOk(s.evidenciaOk ?? {}); }
    } catch { /* noop */ }
  }, [storageKey]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ idx, resp, artefacto, opcionesIA, evidenciaOk })); } catch { /* noop */ }
  }, [idx, resp, artefacto, opcionesIA, evidenciaOk, storageKey]);

  const pasos = useMemo(() => {
    if (!modoCorto) return sesion.pasos;
    // Modo 15: hasta el paso esencial + siempre el artefacto final
    const esenciales = sesion.pasos.slice(0, sesion.pasoEsencialIdx + 1);
    const art = sesion.pasos.find((p) => p.tipo === 'artefacto');
    return art && !esenciales.includes(art) ? [...esenciales, art] : esenciales;
  }, [sesion, modoCorto]);

  const paso = pasos[Math.min(idx, pasos.length - 1)];
  const esUltimo = idx >= pasos.length - 1;

  const contexto = useMemo(() => {
    const p = perfil as Record<string, unknown> | null | undefined;
    const partes = [
      p?.nombre ? `Nombre: ${p.nombre}` : '',
      p?.especialidad ? `Especialidad: ${p.especialidad}` : '',
      p?.pais ? `País: ${p.pais}` : '',
      p?.diagnostico_freno ? `Su freno (del diagnóstico D1): ${p.diagnostico_freno}` : '',
    ].filter(Boolean).join('\n');
    const resps = Object.entries(resp).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' · ') : v}`).join('\n');
    return `PERFIL DEL FUNDADOR:\n${partes}\n\nRESPUESTAS DE ESTA SESIÓN:\n${resps}`;
  }, [perfil, resp]);

  const valido = (): boolean => {
    if (!paso) return false;
    switch (paso.tipo) {
      case 'intro': case 'ritual': case 'radar': return true;
      case 'opciones': { const v = resp[paso.id]; return Array.isArray(v) ? v.length > 0 : !!v; }
      case 'abierta': { const v = (resp[paso.id] as string) ?? ''; return v.trim().length >= paso.minChars; }
      case 'ia_propone': return !!resp[paso.id];
      case 'evidencia': return !!evidenciaOk[paso.id];
      case 'audio_futuro': return !!evidenciaOk[paso.id];
      case 'artefacto': return artefacto.trim().length > 30;
    }
  };

  const generarOpcionesIA = async (p: Extract<PasoGuiado, { tipo: 'ia_propone' }>) => {
    setCargandoIA(true); setErrorMsg(null);
    try {
      const out = await generateText({
        systemInstruction: 'Eres el motor de propuestas de Tu Clínica Digital. Respondes SOLO un JSON array de strings, sin markdown, sin texto extra. Castellano neutro (tú). Nunca uses: coach, embudo, funnel, marketing, gurú, plata, escalar.',
        prompt: `${contexto}\n\nTAREA: ${p.promptIA}\nDevuelve exactamente ${p.nOpciones} opciones como JSON array de strings.`,
      });
      const clean = out.replace(/```json|```/g, '').trim();
      const arr = JSON.parse(clean) as string[];
      if (Array.isArray(arr) && arr.length) setOpcionesIA((prev) => ({ ...prev, [p.id]: arr.slice(0, p.nOpciones) }));
      else throw new Error('vacío');
    } catch { setErrorMsg('La IA no respondió bien. Toca «Generar» de nuevo — o escribe la tuya abajo.'); }
    setCargandoIA(false);
  };

  const generarArtefacto = async (p: Extract<PasoGuiado, { tipo: 'artefacto' }>) => {
    setCargandoIA(true); setErrorMsg(null);
    try {
      const out = await generateText({
        systemInstruction: 'Eres la voz de Tu Clínica Digital: cálida, firme, sin humo. Castellano neutro (tú/tienes). Nunca uses: coach, embudo, funnel, marketing, gurú, plata, escalar, avatar. Respondes SOLO el texto del artefacto, sin títulos markdown, sin comillas.',
        prompt: `${contexto}\n\nTAREA: ${p.promptIA}`,
      });
      if (out.trim().length > 30) setArtefacto(out.trim());
      else throw new Error('corto');
    } catch { setErrorMsg('La IA no respondió. Intenta de nuevo — tu trabajo está guardado.'); }
    setCargandoIA(false);
  };

  const subirArchivo = async (id: string, file: File, tag?: string) => {
    if (!userId) { setErrorMsg('Sesión no detectada. Recarga la página.'); return; }
    setSubiendo(true); setErrorMsg(null);
    const r = await subirEvidencia(userId, tag ?? sesion.codigo, file);
    if (r.ok) {
      setEvidenciaOk((prev) => ({ ...prev, [id]: true }));
      try { const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); void notificarAdminsEvidencia(p?.nombre ?? 'Un cliente', tag ?? sesion.codigo); } catch { /* noop */ }
    } else setErrorMsg((r as { ok: false; motivo: string }).motivo);
    setSubiendo(false);
  };

  const avanzar = () => { setErrorMsg(null); if (!esUltimo) setIdx(idx + 1); };

  const firmar = () => {
    const p = paso as Extract<PasoGuiado, { tipo: 'artefacto' }>;
    onFirmar(p.tituloArtefacto, artefacto.trim());
    try { localStorage.removeItem(storageKey); } catch { /* noop */ }
    onComplete();
  };

  if (isCompleted) {
    return <p className="text-sm text-white/50 text-center py-6">Sesión completada ✓ — tu artefacto vive en tu ADN del Negocio.</p>;
  }
  if (!paso) return null;

  /* Barra de progreso de pasos */
  const progreso = (
    <div className="flex items-center gap-1.5 mb-6">
      {pasos.map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < idx ? 'bg-success' : i === idx ? 'bg-gold' : 'bg-white/10'}`} />
      ))}
      {modoCorto && <span className="text-[9px] text-gold font-bold uppercase ml-2 shrink-0">🕐 modo 15</span>}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-300" key={idx}>
      {progreso}
      {errorMsg && <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 mb-4">{errorMsg}</p>}

      {paso.tipo === 'intro' && (
        <div className="text-center py-4">
          <h3 className="text-2xl font-light text-cream mb-4" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{paso.titulo}</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-3 text-left">{paso.texto}</p>
          {paso.nota && <p className="text-xs text-gold/80 bg-gold/10 border border-gold/20 rounded-xl px-4 py-2.5 mb-6 text-left">💡 {paso.nota}</p>}
          <BotonPrimario onClick={avanzar}>Empezar <ArrowRight className="w-4 h-4" /></BotonPrimario>
        </div>
      )}

      {paso.tipo === 'opciones' && (
        <div>
          <p className="text-base text-cream font-medium mb-4 leading-snug">{paso.pregunta}</p>
          <div className="space-y-2 mb-4">
            {paso.opciones.map((op) => {
              const cur = resp[paso.id];
              const activa = paso.multiple ? Array.isArray(cur) && cur.includes(op) : cur === op;
              return (
                <button key={op} type="button"
                  onClick={() => {
                    setResp((prev) => {
                      if (paso.multiple) {
                        const arr = Array.isArray(prev[paso.id]) ? [...(prev[paso.id] as string[])] : [];
                        return { ...prev, [paso.id]: arr.includes(op) ? arr.filter((x) => x !== op) : [...arr, op] };
                      }
                      return { ...prev, [paso.id]: op };
                    });
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${activa ? 'border-gold bg-gold/12 text-cream' : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25'}`}>
                  <span className={`inline-block w-4 mr-2 ${activa ? 'text-gold' : 'text-white/20'}`}>{activa ? '✓' : '○'}</span>{op}
                </button>
              );
            })}
            {paso.permiteOtra && (
              <div className="flex gap-2">
                <input value={otraTexto} onChange={(e) => setOtraTexto(e.target.value)} placeholder="Otra cosa…"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:border-gold/50 focus:outline-none" />
                <button type="button" disabled={!otraTexto.trim()}
                  onClick={() => {
                    const v = otraTexto.trim(); setOtraTexto('');
                    setResp((prev) => paso.multiple
                      ? { ...prev, [paso.id]: [...(Array.isArray(prev[paso.id]) ? prev[paso.id] as string[] : []), v] }
                      : { ...prev, [paso.id]: v });
                  }}
                  className="px-4 rounded-xl bg-white/10 text-white/70 text-sm font-bold disabled:opacity-30">+</button>
              </div>
            )}
          </div>
          <BotonPrimario onClick={avanzar} disabled={!valido()}>Continuar <ArrowRight className="w-4 h-4" /></BotonPrimario>
        </div>
      )}

      {paso.tipo === 'abierta' && (
        <AbiertaConMic paso={paso} valor={(resp[paso.id] as string) ?? ''}
          onChange={(v) => setResp((prev) => ({ ...prev, [paso.id]: v }))}
          onContinuar={avanzar} valido={valido()} />
      )}

      {paso.tipo === 'ia_propone' && (
        <div>
          <p className="text-base text-cream font-medium mb-4 leading-snug">{paso.pregunta}</p>
          {!opcionesIA[paso.id] ? (
            <div className="text-center py-6">
              <p className="text-xs text-white/45 mb-5">Por lo que sé de ti, tengo propuestas. Tú decides — o escribes la tuya.</p>
              <BotonPrimario onClick={() => generarOpcionesIA(paso)} disabled={cargandoIA}>
                {cargandoIA ? <><Loader2 className="w-4 h-4 animate-spin" /> Pensando en ti…</> : <><Sparkles className="w-4 h-4" /> Ver mis propuestas</>}
              </BotonPrimario>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {opcionesIA[paso.id].map((op) => (
                  <button key={op} type="button" onClick={() => setResp((prev) => ({ ...prev, [paso.id]: op }))}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${resp[paso.id] === op ? 'border-gold bg-gold/12 text-cream' : 'border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25'}`}>
                    <Sparkles className="w-3.5 h-3.5 inline mr-2 text-gold/70" />{op}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input value={otraTexto} onChange={(e) => setOtraTexto(e.target.value)} placeholder="✏️ O escribe la tuya…"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:border-gold/50 focus:outline-none" />
                <button type="button" disabled={!otraTexto.trim()}
                  onClick={() => { setResp((prev) => ({ ...prev, [paso.id]: otraTexto.trim() })); setOtraTexto(''); }}
                  className="px-4 rounded-xl bg-white/10 text-white/70 text-sm font-bold disabled:opacity-30">Usar</button>
              </div>
              <BotonPrimario onClick={avanzar} disabled={!valido()}>Continuar <ArrowRight className="w-4 h-4" /></BotonPrimario>
            </>
          )}
        </div>
      )}

      {paso.tipo === 'radar' && (() => {
        const r = radarPara((perfil as Record<string, unknown> | null | undefined)?.especialidad as string | undefined);
        return (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold mb-3">📡 El radar de tu mercado</p>
            <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.07] to-transparent p-5 mb-4">
              <p className="text-sm text-white/60 mb-1">{r.familia} · mercado hispano</p>
              <p className="text-3xl font-light text-cream mb-3" style={{ fontFamily: 'var(--font-display)' }}>{r.rango}</p>
              <p className="text-xs text-white/45 leading-relaxed">{r.ejemplos}</p>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6">Esto ya se cobra en tu campo. La gente tiene dinero — mira cuántos teléfonos de $1.000 se venden por día en cualquier centro comercial. Tu $1.000 no es un invento personal: es una posición de mercado. Y de las moderadas.</p>
            <BotonPrimario onClick={avanzar}>Entendido — sigamos <ArrowRight className="w-4 h-4" /></BotonPrimario>
          </div>
        );
      })()}

      {paso.tipo === 'ritual' && (
        <div>
          <h3 className="text-lg font-medium text-cream mb-4">{paso.titulo}</h3>
          <ol className="space-y-3 mb-4">
            {paso.instrucciones.map((ins, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                <span className="shrink-0 w-6 h-6 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold flex items-center justify-center">{i + 1}</span>
                {ins}
              </li>
            ))}
          </ol>
          {paso.nota && <p className="text-xs text-gold/80 bg-gold/10 border border-gold/20 rounded-xl px-4 py-2.5 mb-6">📸 {paso.nota}</p>}
          <BotonPrimario onClick={avanzar}>Hecho — hice el ritual <ArrowRight className="w-4 h-4" /></BotonPrimario>
        </div>
      )}

      {(paso.tipo === 'evidencia' || paso.tipo === 'audio_futuro') && (
        <div className="text-center py-2">
          {paso.tipo === 'audio_futuro' ? (
            <>
              <p className="text-3xl mb-3">🕰️</p>
              <h3 className="text-lg font-medium text-cream mb-3">El Mensaje al Futuro</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-1 text-left">Graba un audio de 60 segundos con la app de notas de voz de tu teléfono — para la persona que vas a ser el día 90. Cómo estás hoy. Qué miedo tienes. Qué esperas de esta persona.</p>
              <p className="text-xs text-gold/80 mb-5 text-left">Se sella hasta tu graduación. Nadie lo escucha antes — ni tú.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-cream mb-3">{paso.titulo}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5 text-left">{paso.texto}</p>
            </>
          )}
          <label className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all ${evidenciaOk[paso.id] ? 'bg-success/15 border border-success/40 text-success' : 'bg-gold text-black hover:bg-goldhi'}`}>
            {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : evidenciaOk[paso.id] ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {evidenciaOk[paso.id] ? 'Recibido ✓' : subiendo ? 'Subiendo…' : paso.tipo === 'audio_futuro' ? 'Subir mi audio' : 'Subir'}
            <input type="file" accept={paso.tipo === 'audio_futuro' ? 'audio/*' : paso.accept} className="hidden" disabled={subiendo}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void subirArchivo(paso.id, f, paso.tipo === 'audio_futuro' ? 'MSG_FUTURO' : undefined); }} />
          </label>
          <div className="mt-6">
            <BotonPrimario onClick={avanzar} disabled={!valido()}>Continuar <ArrowRight className="w-4 h-4" /></BotonPrimario>
          </div>
        </div>
      )}

      {paso.tipo === 'artefacto' && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold mb-3">✦ {paso.tituloArtefacto}</p>
          {!artefacto ? (
            <div className="text-center py-6">
              <p className="text-xs text-white/45 mb-5">Con todo lo que trabajaste hoy, redacto tu artefacto. Tú lo revisas, lo ajustas… y lo firmas.</p>
              <BotonPrimario onClick={() => generarArtefacto(paso)} disabled={cargandoIA}>
                {cargandoIA ? <><Loader2 className="w-4 h-4 animate-spin" /> Redactando con tu voz…</> : <><Sparkles className="w-4 h-4" /> Redactar mi artefacto</>}
              </BotonPrimario>
            </div>
          ) : (
            <>
              {editandoArtefacto ? (
                <textarea value={artefacto} onChange={(e) => setArtefacto(e.target.value)} rows={9}
                  className="w-full bg-white/[0.04] border border-gold/30 rounded-2xl px-4 py-3.5 text-sm text-white/90 leading-relaxed focus:outline-none focus:border-gold/60 mb-3" />
              ) : (
                <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.06] to-transparent p-5 mb-3">
                  <p className="text-sm text-white/85 leading-relaxed whitespace-pre-line">{artefacto}</p>
                </div>
              )}
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setEditandoArtefacto(!editandoArtefacto)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white/70 text-xs font-bold hover:bg-white/10 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> {editandoArtefacto ? 'Ver' : 'Ajustar'}
                </button>
                <button type="button" onClick={() => generarArtefacto(paso)} disabled={cargandoIA}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white/70 text-xs font-bold hover:bg-white/10 transition-colors disabled:opacity-40">
                  <Sparkles className="w-3.5 h-3.5" /> Otra versión
                </button>
              </div>
              <BotonPrimario onClick={firmar} disabled={!valido()}>
                <Check className="w-4 h-4" /> FIRMAR — esto va a mi ADN
              </BotonPrimario>
            </>
          )}
        </div>
      )}

      {idx > 0 && paso.tipo !== 'artefacto' && (
        <button type="button" onClick={() => setIdx(idx - 1)} className="mt-4 mx-auto flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase font-bold tracking-wider">
          <ArrowLeft className="w-3 h-3" /> Paso anterior
        </button>
      )}
    </div>
  );
}

/* La pregunta abierta con micrófono — el único paso de escritura del episodio */
function AbiertaConMic({ paso, valor, onChange, onContinuar, valido }: {
  paso: Extract<PasoGuiado, { tipo: 'abierta' }>; valor: string;
  onChange: (v: string) => void; onContinuar: () => void; valido: boolean;
}) {
  const { grabando, soportado, toggle } = useMicrofono((t) => onChange((valor + ' ' + t).trim().slice(0, 4000)));
  const faltan = Math.max(0, paso.minChars - valor.trim().length);
  return (
    <div>
      <p className="text-base text-cream font-medium mb-2 leading-snug">{paso.pregunta}</p>
      {paso.ayuda && <p className="text-xs text-white/40 mb-4 leading-relaxed">{paso.ayuda}</p>}
      <div className="relative mb-2">
        <textarea value={valor} onChange={(e) => onChange(e.target.value)} rows={6} placeholder={paso.placeholder}
          className="w-full bg-white/[0.04] border border-white/12 rounded-2xl px-4 py-3.5 pr-14 text-sm text-white/90 leading-relaxed placeholder-white/25 focus:outline-none focus:border-gold/50 resize-none" />
        {soportado && (
          <button type="button" onClick={toggle} title={grabando ? 'Detener' : 'Responder hablando'}
            className={`absolute right-3 top-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${grabando ? 'bg-danger text-white animate-pulse' : 'bg-gold/15 border border-gold/35 text-gold hover:bg-gold/25'}`}>
            {grabando ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>
      <p className="text-[10px] text-white/30 mb-4">{grabando ? '🔴 Escuchando… habla tranquilo, se escribe solo.' : faltan > 0 ? `Un poco más de profundidad — faltan ~${faltan} caracteres.` : 'Listo ✓'}</p>
      <BotonPrimario onClick={onContinuar} disabled={!valido}>Continuar <ArrowRight className="w-4 h-4" /></BotonPrimario>
    </div>
  );
}
