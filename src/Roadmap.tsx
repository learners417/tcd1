/**
 * SOPORTE — dos puertas, cero laberinto (ajuste fino jul 2026).
 *   🤖 SOPORTE IA: pregunta y te responde al instante (con límite semanal — la escasez que enseña).
 *   👤 SOPORTE HUMANO: le escribes al equipo; llega SÍ O SÍ al Admin (canal Consultas Generales).
 * Reemplaza a la vieja página de Mensajes multicanal.
 */
import { notificarAdminsMensaje } from '../lib/notifications';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Users, Send, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { generateText } from '../lib/aiProvider';
import { usosSemana, consumirUso } from '../lib/planes';

const TOPE_SOPORTE_SEMANAL = 10;
const CANAL_HUMANO = 'Consultas Generales'; // el canal que el Admin ya lee — llegada garantizada

const PROMPT_SOPORTE = `Eres el Soporte de Tu Clínica Digital (así se llama la app — jamás la llames de otra forma). Ayudas al fundador a usar la app: dónde está cada cosa, cómo se hace cada acción, qué hacer si algo no carga.

EL MAPA REAL DEL MENÚ (usa estos nombres exactos): Hoy · El Camino · Mi Clínica · El Método · Diario del Fundador · Mentor IA · Entrenadores IA · Creador de Contenido · Campañas & Creativos · Ajustes · Soporte.

REGLAS DE HIERRO:
1. NUNCA ofreces "links" ni "enlaces" (no puedes generarlos). Das el camino de clics exacto: "Menú → El Camino → toca la sesión".
2. NUNCA prometes acciones fuera de este chat (avisar a alguien, desbloquear, reembolsar).
3. Si el problema es de cuenta, pagos, o algo que no puedes resolver por chat: dile con calidez que le escriba al equipo en la pestaña "Soporte Humano", aquí mismo al lado — un toque.
4. Respuestas CORTAS (2-6 líneas), castellano neutro (tú/tienes), pasos numerados si es técnico. Calma siempre: "no rompiste nada".
5. No inventes funciones que no conoces. Si no sabes, dilo y deriva al equipo.`;

interface MensajesProps { userId?: string; onUnreadChange?: (n: number) => void; }
interface MsgIA { role: 'user' | 'assistant'; content: string }
interface MsgHumano { id: string; emisor_id: string | null; contenido: string; created_at: string }

export default function Mensajes({ userId, onUnreadChange }: MensajesProps) {
  const [tab, setTab] = useState<'ia' | 'humano'>('ia');
  useEffect(() => { onUnreadChange?.(0); }, [onUnreadChange]);

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-in fade-in duration-300">
      <p className="text-2xl font-light text-cream mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Soporte</p>
      <p className="text-sm text-cream/55 mb-5">Dos puertas: la respuesta al instante, o el equipo humano.</p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button onClick={() => setTab('ia')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-colors ${tab === 'ia' ? 'border-gold/50 bg-gold/10 text-gold' : 'border-cream/10 bg-surface/30 text-cream/60 hover:border-cream/25'}`}>
          <Bot className="w-4 h-4" /> Soporte IA
        </button>
        <button onClick={() => setTab('humano')}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-colors ${tab === 'humano' ? 'border-gold/50 bg-gold/10 text-gold' : 'border-cream/10 bg-surface/30 text-cream/60 hover:border-cream/25'}`}>
          <Users className="w-4 h-4" /> Soporte Humano
        </button>
      </div>

      {tab === 'ia' ? <SoporteIA /> : <SoporteHumano userId={userId} />}
    </div>
  );
}

/* ═══════════ 🤖 SOPORTE IA — respuesta al instante, con límite ═══════════ */
function SoporteIA() {
  const [msgs, setMsgs] = useState<MsgIA[]>(() => {
    try { return JSON.parse(localStorage.getItem('tcd_soporte_ia_v1') ?? '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const usados = usosSemana('soporte');
  const restantes = Math.max(0, TOPE_SOPORTE_SEMANAL - usados);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999 }); }, [msgs, cargando]);
  useEffect(() => { try { localStorage.setItem('tcd_soporte_ia_v1', JSON.stringify(msgs.slice(-40))); } catch { /* noop */ } }, [msgs]);

  const enviar = useCallback(async () => {
    const texto = input.trim();
    if (!texto || cargando) return;
    if (usosSemana('soporte') >= TOPE_SOPORTE_SEMANAL) {
      setMsgs((p) => [...p, { role: 'user', content: texto }, { role: 'assistant', content: 'Usaste tus ' + TOPE_SOPORTE_SEMANAL + ' consultas de soporte de esta semana — el lunes se renuevan. Si es urgente, escríbele al equipo en la pestaña Soporte Humano: te leen sí o sí.' }]);
      setInput('');
      return;
    }
    consumirUso('soporte');
    setInput('');
    const nuevos: MsgIA[] = [...msgs, { role: 'user', content: texto }];
    setMsgs(nuevos);
    setCargando(true);
    try {
      const out = await generateText({
        systemInstruction: PROMPT_SOPORTE,
        messages: nuevos.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      });
      setMsgs((p) => [...p, { role: 'assistant', content: out || 'No pude responder ahora. Intenta de nuevo, o escríbele al equipo en Soporte Humano.' }]);
    } catch {
      setMsgs((p) => [...p, { role: 'assistant', content: 'No pude responder ahora. Intenta de nuevo, o escríbele al equipo en Soporte Humano.' }]);
    }
    setCargando(false);
  }, [input, cargando, msgs]);

  return (
    <div className="card-panel p-4 sm:p-5">
      <div ref={scrollRef} className="h-[46vh] overflow-y-auto space-y-3 mb-4 pr-1">
        {msgs.length === 0 && (
          <div className="text-center py-10">
            <Bot className="w-8 h-8 text-gold/50 mx-auto mb-3" />
            <p className="text-sm text-cream/70">Pregunta lo que necesites de la app.</p>
            <p className="text-xs text-cream/45 mt-1">"¿Dónde subo mi comprobante?" · "¿Cómo retomo mi sesión?" · "No me carga un video"</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'ml-auto bg-gold/15 text-cream border border-gold/20' : 'bg-surface/60 text-cream/90 border border-cream/10'}`}>
            {m.role === 'assistant' ? <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0"><Markdown>{m.content}</Markdown></div> : m.content}
          </div>
        ))}
        {cargando && <div className="flex items-center gap-2 text-cream/50 text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Respondiendo…</div>}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escribe tu pregunta…"
          className="flex-1 bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 min-h-[44px]" />
        <button onClick={enviar} disabled={!input.trim() || cargando} className="btn-primary px-4 rounded-xl disabled:opacity-40 min-h-[44px]"><Send className="w-4 h-4" /></button>
      </div>
      <p className="text-[11px] text-cream/40 mt-2 text-right">Te quedan {restantes} consultas esta semana · se renuevan el lunes</p>
    </div>
  );
}

/* ═══════════ 👤 SOPORTE HUMANO — llega sí o sí al equipo ═══════════ */
function SoporteHumano({ userId }: { userId?: string }) {
  const [msgs, setMsgs] = useState<MsgHumano[]>([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    if (!isSupabaseReady() || !supabase) return;
    const { data } = await supabase.from('mensajes').select('id, emisor_id, contenido, created_at')
      .or(`canal.eq."${CANAL_HUMANO}",and(canal.eq.privado,receptor_id.eq.${userId})`).order('created_at', { ascending: true }).limit(80);
    if (data) setMsgs(data as MsgHumano[]);
  }, [userId]);

  useEffect(() => {
    void cargar();
    if (!supabase) return;
    const ch = supabase.channel('soporte-humano')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' },
        (payload) => {
          const m = payload.new as MsgHumano & { canal?: string; receptor_id?: string };
          const mio = m.canal === CANAL_HUMANO || (m.canal === 'privado' && m.receptor_id === userId);
          if (mio) setMsgs((p) => (p.some((x) => x.id === m.id) ? p : [...p, m]));
        })
      .subscribe();
    return () => { void supabase?.removeChannel(ch); };
  }, [cargar, userId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999 }); }, [msgs]);

  const enviar = useCallback(async () => {
    const texto = input.trim();
    if (!texto || enviando || !userId || !supabase) return;
    setEnviando(true);
    const { error } = await supabase.from('mensajes').insert({ canal: CANAL_HUMANO, emisor_id: userId, receptor_id: null, contenido: texto });
    if (!error) {
      setInput('');
      setFallo(null);
      // Que el equipo se entere: sin esto el mensaje queda esperando a que alguien mire.
      try {
        const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}') as { nombre?: string };
        void notificarAdminsMensaje(p?.nombre ?? 'Un cliente');
      } catch { /* noop */ }
    } else {
      setFallo('No pudimos enviarlo. Reintenta — o escríbenos por WhatsApp y te respondemos igual.');
    }
    setEnviando(false);
  }, [input, enviando, userId]);

  return (
    <div className="card-panel p-4 sm:p-5">
      <p className="text-xs text-cream/55 mb-3">Le escribes al equipo de Tu Clínica Digital. <strong className="text-cream/75">Tu mensaje llega directo</strong> — te respondemos aquí mismo.</p>
      {fallo && <p className="text-xs text-danger mb-2">{fallo}</p>}
      <div ref={scrollRef} className="h-[42vh] overflow-y-auto space-y-3 mb-4 pr-1">
        {msgs.length === 0 && <p className="text-sm text-cream/45 text-center py-10">Todavía no hay mensajes. Escribe el primero.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.emisor_id === userId ? 'ml-auto bg-gold/15 text-cream border border-gold/20' : 'bg-surface/60 text-cream/90 border border-cream/10'}`}>
            {m.contenido}
            <p className="text-[10px] text-cream/35 mt-1">{new Date(m.created_at).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escribe al equipo…"
          className="flex-1 bg-surface/50 border border-[rgba(232,150,46,0.15)] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50 min-h-[44px]" />
        <button onClick={enviar} disabled={!input.trim() || enviando} className="btn-primary px-4 rounded-xl disabled:opacity-40 min-h-[44px]">
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
