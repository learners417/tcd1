/**
 * SESIÓN GUIADA PLAYER — LA INMERSIÓN (Cirugía 1).
 *
 * Overlay a pantalla completa: entrar se NOTA, salir se NOTA. Igual que una
 * sesión con Javo: primero la preparación (mate, cuaderno, silencio), después
 * un paso por pantalla — el Mentor dice una cosa corta, pide UNA respuesta —
 * y al final todo lo creado se sella en el ADN. Autoguardado por paso: si el
 * teléfono muere, retoma exacto donde quedó.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sesionGuiadaDe } from '../lib/sesionesGuiadas';
import { generateText } from '../lib/aiProvider';
import BotonAudio from './sesion/BotonAudio';

type Resp = Record<string, string>;
interface Estado { idx: number; resp: Resp; esencial: boolean; prep: number }

const KEY = 'tcd_sesion_pasos_v1';
function leerEstado(codigo: string): Estado {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    const e = all[codigo];
    if (e && typeof e.idx === 'number') return { idx: e.idx, resp: e.resp ?? {}, esencial: !!e.esencial, prep: e.prep ?? 0 };
  } catch { /* noop */ }
  return { idx: -1, resp: {}, esencial: false, prep: 0 };
}
function guardarEstado(codigo: string, e: Estado): void {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    all[codigo] = e;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* noop */ }
}
function limpiarEstado(codigo: string): void {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    delete all[codigo];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* noop */ }
}

const PREPARACION = [
  { e: '☕', t: 'Tu mate o tu café, servido', s: 'Esta sesión se toma con algo caliente al lado.' },
  { e: '📓', t: 'Tu cuaderno físico, a mano', s: 'Lo que se escribe a mano, el cuerpo lo recuerda distinto.' },
  { e: '🤫', t: 'Nadie te interrumpe', s: 'Avisa en tu casa: los próximos minutos son tuyos.' },
];

export default function SesionGuiadaPlayer({
  codigo,
  titulo,
  onFinish,
  onClose,
  onMentor,
}: {
  codigo: string;
  titulo: string;
  onFinish: (texto: string) => void;
  onClose: () => void;
  onMentor?: () => void;
}) {
  const [selladoTexto, setSelladoTexto] = useState<string | null>(null);
  const ses = useMemo(() => sesionGuiadaDe(codigo), [codigo]);
  const [st, setSt] = useState<Estado>(() => leerEstado(codigo));
  const [fuego, setFuego] = useState(false);
  const [iaOut, setIaOut] = useState<Record<string, string>>({});
  const [iaCargando, setIaCargando] = useState(false);
  const [inicio] = useState(() => Date.now());
  const [reloj, setReloj] = useState('0:00');
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => {
      const s = Math.floor((Date.now() - inicio) / 1000);
      setReloj(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
    }, 1000);
    return () => window.clearInterval(t);
  }, [inicio]);

  useEffect(() => { guardarEstado(codigo, st); topRef.current?.scrollTo?.(0, 0); }, [codigo, st]);

  if (!ses) return null;
  const todos = ses.pasos as Array<Record<string, any>>;
  const pasos = st.esencial ? todos.slice(0, (ses.pasoEsencialIdx ?? todos.length - 1) + 1) : todos;
  const total = pasos.length;
  const paso = st.idx >= 0 && st.idx < total ? pasos[st.idx] : null;
  const pasoKey = (p: Record<string, any>, i: number) => String(p.id ?? i);
  const respActual = paso ? (st.resp[pasoKey(paso, st.idx)] ?? '') : '';
  const setResp = (v: string) => paso && setSt((p) => ({ ...p, resp: { ...p.resp, [pasoKey(paso, st.idx)]: v } }));

  const necesitaResp = paso ? ['abierta', 'artefacto'].includes(paso.tipo) || (paso.tipo === 'opciones') : false;
  const puedeSeguir = !paso || !necesitaResp || respActual.trim().length > 0;

  const avanzar = () => {
    if (paso?.tipo === 'ritual') { setFuego(true); window.setTimeout(() => { setFuego(false); setSt((p) => ({ ...p, idx: p.idx + 1 })); }, 2100); return; }
    setSt((p) => ({ ...p, idx: p.idx + 1 }));
  };

  const generarIA = async () => {
    if (!paso || iaCargando) return;
    setIaCargando(true);
    try {
      const contexto = Object.entries(st.resp).map(([k, v]) => `${k}: ${v}`).join('\n');
      const base = String(paso.prompt ?? paso.promptIA ?? paso.texto ?? paso.pregunta ?? '');
      const out = await generateText({ prompt: `${base}\n\nLo que la persona respondió hasta acá:\n${contexto}\n\nResponde en tuteo neutro, corto, hablado y natural.` });
      if (out) { setIaOut((p) => ({ ...p, [pasoKey(paso, st.idx)]: out })); setResp(out); }
    } catch { /* noop */ }
    setIaCargando(false);
  };

  const sellar = () => {
    const partes: string[] = [];
    pasos.forEach((p, i) => {
      const r = st.resp[pasoKey(p, i)];
      if (r?.trim()) partes.push(`## ${p.pregunta ?? p.titulo ?? 'Paso ' + (i + 1)}\n${r.trim()}`);
    });
    const texto = partes.join('\n\n') || '(Sesión completada)';
    try {
      const notas = JSON.parse(localStorage.getItem('tcd_notas_sesion_v1') ?? '{}');
      notas[codigo] = texto;
      localStorage.setItem('tcd_notas_sesion_v1', JSON.stringify(notas));
    } catch { /* noop */ }
    limpiarEstado(codigo);
    setSelladoTexto(texto);
  };

  const Btn = ({ children, onClick, disabled, sec }: any) => (
    <button onClick={onClick} disabled={disabled}
      className={`w-full py-3.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40 ${sec ? 'text-cream/55 hover:text-cream' : 'btn-primary'}`}>
      {children}
    </button>
  );

  return (
    <div ref={topRef} className="fixed inset-0 z-[70] overflow-y-auto bg-[#0d0a06]">
      <style>{`@keyframes tcdArder{0%{opacity:1;transform:scale(1)}60%{opacity:.85;transform:scale(1.15) rotate(-2deg)}100%{opacity:0;transform:scale(.6) translateY(-40px)}}`}</style>

      {/* barra superior: se nota que estás ADENTRO */}
      <div className="sticky top-0 z-10 bg-[#0d0a06]/95 backdrop-blur border-b border-gold/15 px-4 py-3 flex items-center justify-between">
        <button onClick={onClose} className="text-xs font-bold text-cream/50 hover:text-cream">✕ Guardar y salir</button>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Micro-sesión</p>
        <p className="text-xs text-cream/60 tabular-nums">⏱ {reloj}</p>
      </div>

      <div className="max-w-xl mx-auto px-5 py-8 pb-16">
        {/* ══ LA PUERTA + PREPARACIÓN ══ */}
        {st.idx === -1 && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Estás entrando a tu sesión</p>
              <p className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{titulo}</p>
              <p className="text-xs text-cream/50 mt-2">{total} pasos · un paso por pantalla · tu avance se guarda solo</p>
            </div>
            <div className="space-y-2.5">
              {PREPARACION.map((p, i) => (
                <button key={p.t} onClick={() => setSt((s) => ({ ...s, prep: Math.max(s.prep, i + 1) }))}
                  className={`w-full text-left rounded-2xl border p-4 flex items-start gap-3 transition-colors ${st.prep > i ? 'border-gold/40 bg-gold/[0.07]' : 'border-cream/10 bg-surface/30'}`}>
                  <span className="text-xl">{st.prep > i ? '✓' : p.e}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-cream">{p.t}</span>
                    <span className="block text-xs text-cream/50 mt-0.5">{p.s}</span>
                  </span>
                </button>
              ))}
            </div>
            {(ses.pasoEsencialIdx ?? 0) < todos.length - 1 && (
              <label className="flex items-center gap-2.5 text-xs text-cream/55 px-1">
                <input type="checkbox" checked={st.esencial} onChange={(e) => setSt((s) => ({ ...s, esencial: e.target.checked, idx: -1 }))} className="accent-[#E8962E]" />
                Hoy tengo poco tiempo — versión esencial (15 min)
              </label>
            )}
            <Btn disabled={st.prep < PREPARACION.length} onClick={() => setSt((s) => ({ ...s, idx: 0 }))}>
              {st.prep < PREPARACION.length ? 'Prepara tus tres cosas ↑' : 'Comenzar mi sesión →'}
            </Btn>
          </div>
        )}

        {/* ══ EL FUEGO (transición del ritual) ══ */}
        {fuego && (
          <div className="fixed inset-0 z-20 bg-[#0d0a06] flex flex-col items-center justify-center">
            <p className="text-7xl" style={{ animation: 'tcdArder 2s ease-in forwards' }}>🔥</p>
            <p className="text-cream/70 text-sm mt-6" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Que arda.</p>
          </div>
        )}

        {/* ══ UN PASO POR PANTALLA ══ */}
        {paso && !fuego && (
          <div className="space-y-5">
            <p className="text-[11px] font-bold text-cream/45">Paso {st.idx + 1} de {total}</p>
            <div className="flex gap-1">{pasos.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= st.idx ? 'bg-gold' : 'bg-cream/12'}`} />)}</div>

            {(paso.titulo || paso.texto) && (
              <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/[0.05] to-transparent p-5">
                {paso.titulo && <p className="text-lg font-semibold text-cream mb-2" style={{ fontFamily: 'var(--font-display)' }}>{paso.titulo}</p>}
                {paso.texto && <p className="text-[15px] text-cream/80 leading-relaxed whitespace-pre-wrap">{paso.texto}</p>}
                {paso.nota && <p className="text-xs text-gold/80 mt-3 border-l-2 border-gold/30 pl-3">{paso.nota}</p>}
              </div>
            )}

            {paso.pregunta && <p className="text-base text-cream font-medium">{paso.pregunta}</p>}

            {paso.tipo === 'opciones' && Array.isArray(paso.opciones) && (
              <div className="space-y-2">
                {paso.opciones.map((op: string) => {
                  const sel = respActual.split(' · ').includes(op);
                  return (
                    <button key={op} onClick={() => {
                      const set = new Set(respActual ? respActual.split(' · ') : []);
                      if (paso.multiple) { sel ? set.delete(op) : set.add(op); setResp([...set].join(' · ')); }
                      else setResp(op);
                    }}
                      className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${sel ? 'border-gold bg-gold/10 text-cream' : 'border-cream/12 bg-surface/30 text-cream/75'}`}>
                      {sel ? '✓ ' : ''}{op}
                    </button>
                  );
                })}
                {paso.permiteOtra && (
                  <input value={respActual.startsWith('Otra: ') ? respActual.slice(6) : ''} onChange={(e) => setResp('Otra: ' + e.target.value)} placeholder="Otra (escríbela)…"
                    className="w-full bg-surface/40 border border-cream/12 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50" />
                )}
              </div>
            )}

            {['abierta', 'artefacto', 'radar', 'audio_futuro', 'evidencia'].includes(paso.tipo) && (
              <div>
                <textarea value={iaOut[pasoKey(paso, st.idx)] && respActual === iaOut[pasoKey(paso, st.idx)] ? respActual : respActual}
                  onChange={(e) => setResp(e.target.value)} rows={5}
                  placeholder={paso.placeholder ?? 'Escríbelo con tus palabras — o dilo en voz alta…'}
                  className="w-full bg-surface/40 border border-cream/15 rounded-xl px-4 py-3 text-[15px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 resize-y" />
                <div className="mt-2"><BotonAudio onTexto={(t: string) => setResp(respActual ? respActual + '\n' + t : t)} /></div>
              </div>
            )}

            {paso.tipo === 'ia_propone' && (
              <div className="space-y-3">
                {respActual ? (
                  <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-4">
                    <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">{respActual}</p>
                  </div>
                ) : null}
                <button onClick={generarIA} disabled={iaCargando}
                  className="w-full py-3 rounded-xl border border-gold/30 text-gold text-sm font-bold hover:bg-gold/[0.06] disabled:opacity-50">
                  {iaCargando ? 'Creando contigo…' : respActual ? '🔄 Proponme otra versión' : '✨ Crear con mi Mentor'}
                </button>
              </div>
            )}

            <Btn disabled={!puedeSeguir} onClick={avanzar}>
              {paso.tipo === 'ritual' ? '🔥 Lo quemé — que arda' : st.idx === total - 1 ? 'Terminar y revisar →' : 'Siguiente →'}
            </Btn>
          </div>
        )}

        {/* ══ EL CIERRE: revisión + sello ══ */}
        {st.idx >= total && !fuego && !selladoTexto && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Estás saliendo de tu sesión</p>
              <p className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Esto es lo que creaste hoy</p>
            </div>
            <div className="rounded-2xl border border-gold/25 bg-gradient-to-b from-gold/[0.06] to-transparent p-5 space-y-4">
              {pasos.map((p, i) => {
                const r = st.resp[pasoKey(p, i)];
                if (!r?.trim()) return null;
                return (
                  <div key={i}>
                    <p className="text-xs font-semibold text-gold/80">{p.pregunta ?? p.titulo ?? `Paso ${i + 1}`}</p>
                    <p className="text-sm text-cream/80 whitespace-pre-wrap leading-relaxed mt-1">{r}</p>
                  </div>
                );
              })}
            </div>
            <Btn onClick={sellar}>🧬 GRABAR EN MI ADN</Btn>
            <Btn sec onClick={() => setSt((p) => ({ ...p, idx: Math.max(0, total - 1) }))}>← Volver a ajustar</Btn>
          </div>
        )}

        {selladoTexto && (
          <div className="space-y-5 text-center">
            <p className="text-5xl">🧬</p>
            <p className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Sellado en tu ADN</p>
            <p className="text-sm text-cream/60">Tu sesión de hoy está hecha. Saliste del espacio de trabajo.</p>
            <button onClick={() => onFinish(selladoTexto)} className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold">Terminar por hoy →</button>
            {onMentor && (
              <button onClick={() => { onFinish(selladoTexto); onMentor(); }}
                className="w-full py-3.5 rounded-xl border border-gold/30 text-gold text-sm font-bold hover:bg-gold/[0.06]">
                💬 Profundizar con tu Mentor
              </button>
            )}
            <p className="text-[11px] text-cream/40">Esta noche te espera tu Diario — 2 minutos antes de dormir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
