/**
 * MentorPanel — T4 · Plan Maestro.
 * La burbuja "¿Trabado?" del Episodio → panel lateral SIN salir de la pestaña.
 * Mentor en las metas de fondo · Asistente Técnico en las técnicas.
 * Historial efímero por meta (localStorage), corto por diseño.
 */
import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Wrench, Sparkles } from 'lucide-react';
import { generateText } from '../../lib/aiProvider';
import { buildPanelPrompt, esMetaTecnica } from '../../lib/mentorPanelPrompt';

interface Props {
  metaCodigo: string;
  metaTitulo: string;
  metaDescripcion?: string;
}

interface Msg { role: 'user' | 'assistant'; content: string }

const MAX_TURNOS = 10;

export default function MentorPanel({ metaCodigo, metaTitulo, metaDescripcion }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const tecnica = esMetaTecnica(metaCodigo, metaTitulo);
  const storageKey = `tcd_mentor_panel_${metaCodigo}`;

  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) setMsgs(JSON.parse(raw)); } catch { /* noop */ }
  }, [storageKey]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(msgs.slice(-2 * MAX_TURNOS))); } catch { /* noop */ }
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, storageKey]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;
    setInput('');
    const nuevos: Msg[] = [...msgs, { role: 'user', content: texto }];
    setMsgs(nuevos);
    setCargando(true);
    try {
      let perfil: Record<string, unknown> = {};
      try { perfil = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); } catch { /* noop */ }
      let freno: string | undefined;
      try { const d = JSON.parse(localStorage.getItem('tcd_diagnostico') ?? 'null'); freno = d?.freno ?? d?.freno_principal ?? undefined; } catch { /* noop */ }
      const system = buildPanelPrompt({
        tecnica,
        metaTitulo,
        metaDescripcion,
        nombre: perfil?.nombre as string | undefined,
        especialidad: perfil?.especialidad as string | undefined,
        frenoD1: freno,
      });
      const out = await generateText({
        systemInstruction: system,
        messages: nuevos.slice(-2 * MAX_TURNOS).map((m) => ({ role: m.role, content: m.content })),
      });
      setMsgs((prev) => [...prev, { role: 'assistant', content: out.trim() || '¿Me lo dices con otras palabras? Quiero entenderte bien.' }]);
    } catch {
      setMsgs((prev) => [...prev, { role: 'assistant', content: 'Se cortó la conexión un segundo. Envíalo de nuevo — acá estoy.' }]);
    }
    setCargando(false);
  };

  return (
    <>
      {/* La burbuja — siempre visible durante la sesión */}
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="fixed bottom-24 right-4 z-[80] flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full bg-[#1A1917] border border-[#E8962E]/40 text-[#F2EFE9] text-xs font-bold shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-[#E8962E]/80 hover:shadow-[0_0_24px_rgba(232,150,46,0.15)] transition-all"
        >
          {tecnica ? <Wrench className="w-4 h-4 text-[#E8962E]" /> : <MessageCircle className="w-4 h-4 text-[#E8962E]" />}
          ¿Trabado?
        </button>
      )}

      {/* El panel lateral */}
      {abierto && (
        <div className="fixed inset-y-0 right-0 z-[85] w-full sm:w-[400px] bg-[#12110F] border-l border-white/[0.08] shadow-[-8px_0_40px_rgba(0,0,0,0.55)] flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              {tecnica ? (
                <div className="w-8 h-8 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center"><Wrench className="w-4 h-4 text-[#3B82F6]" /></div>
              ) : (
                <img src="/javo.jpg" alt="" className="w-8 h-8 rounded-full object-cover border border-[#E8962E]/40" onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<div class="w-8 h-8 rounded-full bg-[#E8962E]/15 border border-[#E8962E]/30 flex items-center justify-center">🥋</div>'; }} />
              )}
              <div>
                <p className="text-xs font-bold text-[#F2EFE9] uppercase tracking-wider">{tecnica ? 'Asistente Técnico' : 'Tu Mentor'}</p>
                <p className="text-[10px] text-white/35 truncate max-w-[230px]">{tecnica ? 'Paso a paso, sin drama' : 'Te destraba — no te lo hace'}</p>
              </div>
            </div>
            <button type="button" onClick={() => setAbierto(false)} className="text-white/40 hover:text-white/80 transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {msgs.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-6 h-6 text-[#E8962E]/50 mx-auto mb-3" />
                <p className="text-sm text-white/55 leading-relaxed px-2">
                  {tecnica
                    ? 'Cuéntame dónde te trabaste — y dime qué ves en tu pantalla ahora. Vamos paso a paso.'
                    : 'Estoy acá. ¿Qué te está frenando en esta sesión — la tarea… o lo que la tarea te hace sentir?'}
                </p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'ml-auto bg-[#E8962E]/15 border border-[#E8962E]/25 text-[#F2EFE9]' : 'bg-white/[0.05] border border-white/[0.08] text-white/85'}`}>
                {m.content}
              </div>
            ))}
            {cargando && <div className="flex items-center gap-2 text-white/40 text-xs px-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> escribiendo…</div>}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-white/[0.06] shrink-0">
            {msgs.filter((m) => m.role === 'user').length >= MAX_TURNOS ? (
              <p className="text-[11px] text-white/40 text-center py-1.5">Para seguir en profundidad, tu Mentor completo te espera en su sala — este panel es para destrabar y volver a la sesión. 🥋</p>
            ) : (
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void enviar(); } }}
                  placeholder={tecnica ? '¿Qué ves en tu pantalla?' : '¿Qué te frena?'}
                  className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E8962E]/50"
                />
                <button type="button" onClick={() => void enviar()} disabled={!input.trim() || cargando}
                  className="px-3.5 rounded-xl bg-[#E8962E] text-black disabled:opacity-30 hover:bg-[#F4B65C] transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
