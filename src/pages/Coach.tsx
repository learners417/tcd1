import { resumenOrigenParaMentor } from '../lib/origen';
import { resumenRuedaParaMentor } from '../lib/rueda';
import { planDelCliente, TOPE_MENTOR_BLANCO, TOPE_MENTOR_SEMANAL, usosSemana, consumirUso } from '../lib/planes';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { safeGet } from '../lib/safeStorage';
/* `Bot` estaba importado y no se dibujaba en ningún lado. Fuera: un import
   que nadie usa es una pista falsa para el que lea esto mañana. */
import { Send, RefreshCw, Sparkles } from 'lucide-react';
import { streamText } from '../lib/aiProvider';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import {
  AttachButton,
  AttachmentsPreviewStrip,
} from '../components/ChatAttachmentsBar';
import {
  attachmentsToContext,
  buildAttachmentsFromDataTransfer,
  type ChatAttachment,
} from '../lib/chatAttachments';
import {
  buildCoachSystemPrompt,
  detectarContextoConversacion,
  loadCoachExtraContext,
} from '../lib/coachPrompt';
import {
  getUserKnowledgeBase,
  getUserKnowledgeBaseSync,
} from '../lib/userKnowledgeBase';
import {
  supabase,
  isSupabaseReady,
  agentSkillProgressRepo,
  type PilarId,
  type HojaDeRutaItem,
} from '../lib/supabase';
import { mensajeDeFalla } from '../lib/conexion';
import {
  loadCoachState,
  saveCoachMessages,
  rotateSummaryIfNeeded,
  resetCoach,
  type CoachConversationMessage,
} from '../lib/coachConversation';
import {
  getCoachQuickReplies,
  type CoachQuickReplyContext,
} from '../lib/coachQuickReplies';
import { AGENTES, NIVEL_NOMBRE } from '../lib/agents';
import { semanaDelPrograma } from '../lib/diaPrograma';

type Message = CoachConversationMessage;

function buildInitialMessage(): Message {
  const profile = safeGet<{ fecha_inicio?: string; nombre?: string; [k: string]: unknown }>('tcd_profile', {});
  const semanaActual = semanaDelPrograma(profile.fecha_inicio, 13);
  // Sin nombre, el Mentor abría con «Hola Fundadora» — en femenino, y a un
  // médico varón el día 1. Sin nombre, saluda sin nombre.
  const nombre = profile.nombre?.trim() || '';

  const diary = safeGet<{ respuestas?: { cuello?: string; foco?: string } }[]>('tcd_diary_weekly', []);
  const last = diary.length > 0 ? diary[0].respuestas : null;

  // El wow del día 1: si es su primera semana y hay diagnóstico, el espejo va primero
  const dxRaw = safeGet<Record<string, string>>('tcd_diagnostico', {});
  const freno = dxRaw.freno || '';
  if (semanaActual === 1 && freno) {
    return {
      role: 'assistant',
      content: `${nombre ? `${nombre}, antes` : 'Antes'} de tu primera sesión quiero decirte algo.\n\nEn tu diagnóstico escribiste que lo que más te frena es: _"${freno}"_.\n\nQuiero que sepas dos cosas. La primera: eso que escribiste no es tu problema — es el síntoma. El problema real lo vamos a encontrar esta semana, y probablemente no es lo que piensas.\n\nLa segunda: el día 4 de esta semana vas a hacer algo físico con eso. No te adelanto más.\n\nTu primera sesión te espera en El Camino. Es corta. Empieza hoy — el impulso del día 1 vale oro.`,
    } as Message;
  }
  // Sin nombre, «Hola ${nombre}.» quedaba «Hola .»
  let msg = `${nombre ? `Hola ${nombre}.` : 'Hola.'} Empezamos la **Semana ${semanaActual}**.\n\n`;
  if (last && last.cuello) {
    // «frenada» en femenino para cualquiera: se neutraliza.
    msg += `Noté en tu último check-in que tu foco es _"${last.foco}"_, y que lo que te frena es: _"${last.cuello}"_.\n\n`;
    msg += `¿Qué acción atómica vamos a tomar ahora mismo para destrabar eso y avanzar?`;
  } else {
    // Antes el cierre decía «destrabar ESTO» en los dos casos, y sin el
    // párrafo de arriba «esto» no refería a nada. Es el primer mensaje que
    // lee un cliente que saltó el diagnóstico, el día 1.
    msg += `Cuéntame en qué estás trabajando ahora y qué es lo que más te está costando. Con eso armamos el próximo paso.`;
  }
  return { role: 'assistant', content: msg };
}

function getPilarActivo(perfil: Record<string, unknown> | null): PilarId | null {
  if (!perfil) return null;
  const num = perfil.pilar_actual;
  if (typeof num !== 'number') return null;
  // Mapeo aproximado: 1→P1, 2→P2,... 9→P9A (asumimos current goes 0-11)
  if (num <= 0) return 'P0';
  if (num >= 1 && num <= 8) return `P${num}` as PilarId;
  if (num === 9) return 'P9A';
  if (num === 10) return 'P9B';
  if (num === 11) return 'P9C';
  if (num === 12) return 'P10';
  if (num === 13) return 'P11';
  return null;
}

function daysSince(iso: string | null | undefined): number {
  if (!iso) return 999;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 999;
  return Math.floor((Date.now() - t) / 86400000);
}

export default function Coach({ userId, perfil }: { userId?: string; perfil?: Partial<import('../lib/supabase').Profile> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cargandoEstado, setCargandoEstado] = useState(true);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const knowledgeBaseRef = useRef<string>(getUserKnowledgeBaseSync());
  const supabaseProfileRef = useRef<Record<string, unknown> | null>(null);

  // Estado del Coach IA · sumario + last_summary_at_msg_count viven en DB
  const summaryRef = useRef<string | null>(null);
  const lastSummaryAtRef = useRef<number>(0);
  const nivelesEntrenadoresRef = useRef<Record<string, number>>({});
  const alcanzoNivel4Ref = useRef<boolean>(false);
  // Estado real de El Camino · alimenta el system prompt para que el
  // Coach sepa qué metas ★ están hechas y no las sugiera de nuevo.
  const tareasHojaDeRutaRef = useRef<HojaDeRutaItem[]>([]);

  // ─── Carga inicial: state · perfil · niveles entrenadores ──────────────────
  useEffect(() => {
    let cancelado = false;
    async function init() {
      setCargandoEstado(true);
      try {
        if (userId) {
          const state = await loadCoachState(userId);
          if (cancelado) return;
          summaryRef.current = state.summary;
          lastSummaryAtRef.current = state.lastSummaryAtMsgCount;
          setMessages(state.messages.length > 0 ? state.messages : [buildInitialMessage()]);

          const skillRows = await agentSkillProgressRepo.loadAll(userId);
          if (cancelado) return;
          const nivByAgentId: Record<string, number> = {};
          let nivel4Alcanzado = false;
          for (const r of skillRows) {
            nivByAgentId[r.agent_id] = r.current_level;
            const last = r.last_practice_at ? new Date(r.last_practice_at).getTime() : 0;
            const sieteDias = Date.now() - 7 * 86400000;
            if (r.current_level === 4 && last > sieteDias) {
              nivel4Alcanzado = true;
            }
          }
          nivelesEntrenadoresRef.current = nivByAgentId;
          alcanzoNivel4Ref.current = nivel4Alcanzado;
        } else {
          // Sin userId · fallback localStorage (modo demo · offline).
          const raw = localStorage.getItem('tcd_coach_messages_v2');
          const arr = raw ? (JSON.parse(raw) as Message[]) : [];
          setMessages(arr.length > 0 ? arr : [buildInitialMessage()]);
        }
      } catch {
        setMessages([buildInitialMessage()]);
      } finally {
        if (!cancelado) setCargandoEstado(false);
      }
    }
    init();
    return () => {
      cancelado = true;
    };
  }, [userId]);

  // ─── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── Knowledge base ────────────────────────────────────────────────────────
  useEffect(() => {
    getUserKnowledgeBase(userId).then((kb) => {
      knowledgeBaseRef.current = kb;
    });
  }, [userId]);

  // ─── Perfil fresco desde Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!userId || !isSupabaseReady() || !supabase) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) supabaseProfileRef.current = data as Record<string, unknown>;
      });
  }, [userId]);

  // ─── Hoja de Ruta fresca desde Supabase (estado real de las metas) ────────
  useEffect(() => {
    if (!userId || !isSupabaseReady() || !supabase) return;
    supabase
      .from('hoja_de_ruta')
      .select('*')
      .eq('usuario_id', userId)
      .then(({ data }) => {
        if (data) tareasHojaDeRutaRef.current = data as HojaDeRutaItem[];
      });
  }, [userId]);

  // ─── Quick replies dinámicos (recalcular cuando cambia el perfil o niveles)
  const quickReplies = useMemo(() => {
    const perfil = supabaseProfileRef.current ?? {};
    const lastDiaryRaw = localStorage.getItem('tcd_diary_weekly');
    let diasSinEntrar = 0;
    try {
      const arr = lastDiaryRaw ? JSON.parse(lastDiaryRaw) : [];
      diasSinEntrar = arr[0]?.fecha ? daysSince(arr[0].fecha) : 999;
    } catch {
      /* noop */
    }
    const lastMetricsAt =
      (perfil as { ultima_metrica_at?: string }).ultima_metrica_at ?? null;
    const ctx: CoachQuickReplyContext = {
      pilarActivo: getPilarActivo(perfil),
      diasAtraso:
        typeof (perfil as { dias_atraso?: number }).dias_atraso === 'number'
          ? ((perfil as { dias_atraso?: number }).dias_atraso ?? 0)
          : 0,
      diasSinEntrar,
      alcanzoNivel4EstaSemana: alcanzoNivel4Ref.current,
      diasSinMetricas: daysSince(lastMetricsAt),
    };
    return getCoachQuickReplies(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, cargandoEstado]);

  const resetConversation = useCallback(async () => {
    const fresh = [buildInitialMessage()];
    setMessages(fresh);
    summaryRef.current = null;
    lastSummaryAtRef.current = 0;
    if (userId) {
      try {
        await resetCoach(userId);
        await saveCoachMessages(userId, fresh);
      } catch {
        /* silencioso */
      }
    } else {
      localStorage.setItem('tcd_coach_messages_v2', JSON.stringify(fresh));
    }
  }, [userId]);

  const [guardadoOk, setGuardadoOk] = useState(false);
  const persist = useCallback(
    async (msgs: Message[]) => {
      if (userId) {
        try {
          await saveCoachMessages(userId, msgs);
          setGuardadoOk(true);
          setTimeout(() => setGuardadoOk(false), 2500);
        } catch {
          /* silencioso */
        }
      } else {
        localStorage.setItem('tcd_coach_messages_v2', JSON.stringify(msgs));
        setGuardadoOk(true);
        setTimeout(() => setGuardadoOk(false), 2500);
      }
    },
    [userId],
  );

  const intentarRotarSummary = useCallback(
    async (msgsAhora: Message[]) => {
      if (!userId) return;
      const result = await rotateSummaryIfNeeded(userId, {
        messages: msgsAhora,
        summary: summaryRef.current,
        lastSummaryAtMsgCount: lastSummaryAtRef.current,
      });
      if (result) {
        summaryRef.current = result.summary;
        lastSummaryAtRef.current = result.msgCount;
      }
    },
    [userId],
  );

  const handleSend = useCallback(
    async (text: string) => {
      const hasAttachments = attachments.length > 0;
      if ((!text.trim() && !hasAttachments) || isTyping) return;

      // ═══ El tope de los 5 días: 30 mensajes, cierre elegante ═══
      // ─── La escasez que enseña: 10 preguntas de maestro por semana (planes del camino) ───
      if (planDelCliente(perfil) !== 'blanco') {
        if (usosSemana('mentor') >= TOPE_MENTOR_SEMANAL) {
          setMessages((prev) => [...prev, { role: 'user', content: text }, {
            role: 'assistant',
            content: 'Usaste tus ' + TOPE_MENTOR_SEMANAL + ' preguntas de maestro de esta semana — bien usadas valen oro. El lunes se renuevan. Mientras tanto, tu sesión de hoy te espera en El Camino, y ahí adentro estoy contigo en cada paso.',
          }]);
          setInput('');
          return;
        }
        consumirUso('mentor');
      }
      if (planDelCliente(perfil) === 'blanco') {
        let usados = 0;
        try { usados = parseInt(localStorage.getItem('tcd_mentor_blanco_msgs') ?? '0', 10) || 0; } catch { /* noop */ }
        if (usados >= TOPE_MENTOR_BLANCO) {
          setMessages((prev) => [...prev, {
            role: 'assistant' as const,
            content: 'Llegamos al límite de conversaciones de tus 5 días. Del otro lado seguimos juntos cada semana, con todo tu historial y con las sesiones que todavía no abriste. En HOY tienes el botón para seguir tu camino — un toque y retomamos exactamente donde quedamos.',
          }]);
          return;
        }
        try { localStorage.setItem('tcd_mentor_blanco_msgs', String(usados + 1)); } catch { /* noop */ }
      }

      const sentAttachments = attachments;
      setAttachments([]);
      setInput('');

      // Texto visible para el usuario · etiquetas inline con los archivos adjuntos
      const visibleText = hasAttachments
        ? `${text.trim() || '(adjuntos para analizar)'}\n\n${sentAttachments
            .map((a) =>
              a.kind === 'image' ? `Adjunto: ${a.fileName} (imagen)` : `Adjunto: ${a.fileName}`,
            )
            .join('\n')}`
        : text;

      const conUsuario: Message[] = [
        ...messages,
        { role: 'user', content: visibleText },
      ];
      setMessages(conUsuario);
      setIsTyping(true);

      try {
        // Contexto enriquecido con descripciones de imagenes + texto de archivos
        const attachmentsCtx = hasAttachments
          ? await attachmentsToContext(sentAttachments)
          : '';
        const promptText = `${attachmentsCtx}${text.trim() || 'Por favor, analiza los archivos/imagenes adjuntas.'}`;

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        // Para el provider mandamos el promptText enriquecido en el ultimo turno
        const aiMessages = [
          ...messages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          { role: 'user', content: promptText },
        ];

        const extraCtx = detectarContextoConversacion(text);
        const coachExtra = loadCoachExtraContext();
        const localPerfil = safeGet<{ fecha_inicio?: string; nombre?: string; [k: string]: unknown }>('tcd_profile', {});
        const perfil = { ...localPerfil, ...(supabaseProfileRef.current ?? {}) };

        // Texto resumido de niveles por entrenador · para el system prompt
        const nivelesTexto = AGENTES.map((a) => {
          const lvl = nivelesEntrenadoresRef.current[a.id] ?? 1;
          return `${a.titulo.split(' ·')[0]}: Nivel ${lvl} (${NIVEL_NOMBRE[lvl as 1 | 2 | 3 | 4]})`;
        }).join(' · ');

        const systemPrompt = buildCoachSystemPrompt({
          perfil,
          ...extraCtx,
          ...coachExtra,
          baseDeConocimiento: knowledgeBaseRef.current || undefined,
          coachHistorySummary: summaryRef.current ?? undefined,
          nivelesEntrenadoresTexto: nivelesTexto,
          tareasHojaDeRuta: tareasHojaDeRutaRef.current,
        }) + resumenRuedaParaMentor() + resumenOrigenParaMentor();

        let fullResponse = '';
        for await (const chunk of streamText({ feature: 'mentor', tarea: 'chat',
          systemInstruction: systemPrompt,
          messages: aiMessages,
        })) {
          fullResponse += chunk;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], content: fullResponse };
            return next;
          });
        }

        const finales: Message[] = [
          ...conUsuario,
          { role: 'assistant', content: fullResponse },
        ];
        await persist(finales);
        await intentarRotarSummary(finales);
      } catch (err) {
        // ANTES DECÍA «hubo un error de red» PARA CUALQUIER FALLA.
        //
        // Y eso le impide al cliente hacer lo único que ayudaría: si se quedó
        // sin créditos, reintentar no sirve; si tardó de más, sí. Decirle mal
        // la causa lo deja probando lo que no funciona.
        const causa = mensajeDeFalla(err, 'responderte');
        toast.error(causa);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: causa,
          };
          return next;
        });
      } finally {
        setIsTyping(false);
      }
    },
    [attachments, isTyping, messages, persist, intentarRotarSummary, perfil],
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      // Solo interceptamos si hay archivos · si es texto puro dejamos paste por defecto
      let hasFile = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          hasFile = true;
          break;
        }
      }
      if (!hasFile) return;
      e.preventDefault();
      setUploadingAttachment(true);
      try {
        const nuevos = await buildAttachmentsFromDataTransfer(
          e.clipboardData,
          (msg) => toast.error(msg),
        );
        if (nuevos.length > 0) {
          setAttachments((prev) => [...prev, ...nuevos]);
          toast.success(
            nuevos.length === 1
              ? 'Captura adjuntada'
              : `${nuevos.length} adjuntos agregados`,
          );
        }
      } finally {
        setUploadingAttachment(false);
      }
    },
    [],
  );

  const avatarUrl = localStorage.getItem('tcd_avatar') || '';
  const profile = (() => {
    try {
      return safeGet<{ fecha_inicio?: string; nombre?: string; [k: string]: unknown }>('tcd_profile', {});
    } catch {
      return {};
    }
  })();
  const userInitial = (profile.nombre || 'U').charAt(0).toUpperCase();

  /*
   * EL ALTO DEL CHAT SALE DE LAS BARRAS DE VERDAD.
   *
   * Era `100vh - 8rem`, un número redondo que no corresponde a nada: las
   * barras suman más. Medido a 390×844, el campo donde se escribe terminaba
   * en el píxel 779 y la barra de abajo arranca en el 760 — el input quedaba
   * DEBAJO de las pestañas, y para verlo entero había que desplazar la
   * página con la barra fija encima.
   *
   * Ahora cada término está declarado en otro lado y acá solo se suma:
   *   3.5rem   la barra de arriba (`h-14` en Topbar)
   *   1.5rem   el padding de arriba del contenedor (`p-6` en App)
   *   5.25rem  la barra de abajo, que ese mismo contenedor ya reserva
   * Y `dvh` en vez de `vh` porque en el teléfono la barra del navegador
   * aparece y desaparece: con `vh` el chat mide siempre como si no estuviera.
   */
  const altoDelChat =
    'calc(100dvh - 3.5rem - 1.5rem - 5.25rem - env(safe-area-inset-bottom, 0px))';

  return (
    <div
      className="flex flex-col card-panel rounded-2xl overflow-hidden animate-in fade-in duration-500 border border-gold/10"
      style={{ height: altoDelChat }}
    >
      {/*
        EL ENCABEZADO ERA CUATRO RENGLONES DE MAYÚSCULAS.

        Tenía dos retratos seguidos para una sola voz —un robot en un cuadrado
        de oro y la foto de Javo—, el nombre «Mentor IA» en versalitas
        espaciadas, y debajo «TU GUÍA DEL CAMINO · CONOCE TU ADN COMPLETO»
        también en caja alta, a 17 px: a 390 píxeles eso envuelve en tres
        renglones y se lee letra por letra, porque las mayúsculas son para
        rótulos cortos. La chispa verde iba dentro de ese párrafo con
        `items-center`, así que al envolver quedaba flotando en el medio del
        bloque, sin alinear a nada.

        Y era un quinto nombre para el mismo lugar: la barra de arriba, el
        buscador y las pestañas dicen «Tu Mentor».

        Queda un retrato —la foto, que es la voz de verdad—, el nombre en la
        letra de cuerpo y una línea en minúsculas que dice lo único que hace
        falta saber: que este no es un chat cualquiera porque conoce su
        camino. La chispa sale: no significaba nada.
      */}
      <div className="p-5 border-b border-[var(--line, rgba(142,104,36,0.18))] bg-gold/[0.03] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/javo.jpg"
            alt=""
            className="w-11 h-11 rounded-full object-cover border border-gold/40 shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="min-w-0">
            {/*
              Decía «Tu Mentor» con la barra de arriba diciendo «Tu Mentor» a
              cuarenta píxeles. Con la cara al lado y el nombre arriba, la
              línea que queda puede decir lo que el Mentor SABE, que es lo que
              el cliente necesita saber antes de escribirle.
            */}
            <h2 className="font-sans not-italic text-lg font-semibold text-cream">
              Conoce tu Camino y tu ADN
            </h2>
            {guardadoOk && (
              <p className="text-xs text-success font-semibold">Guardado ✓</p>
            )}
          </div>
        </div>
        <button
          onClick={resetConversation}
          title="Reiniciar conversación"
          className="w-11 h-11 rounded-full hover:bg-gold/10 flex items-center justify-center text-white/55 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${
                msg.role === 'assistant'
                  ? 'bg-gold/15 text-gold border-gold/40 ring-2 ring-gold/10'
                  : 'bg-white/5 text-white/75 border-white/10'
              }`}
            >
              {msg.role === 'assistant' ? (
                <span className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>M</span>
              ) : avatarUrl ? (
                <img loading="lazy" src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{userInitial}</span>
              )}
            </div>

            {msg.role === 'assistant' && !msg.content.includes('```') ? (
              /* El Mentor humano: burbujas separadas por párrafo — conversación, no documento */
              <div className="max-w-[85%] flex flex-col gap-2">
                {msg.content.split(/\n\n+/).filter(Boolean).map((parte, pi) => (
                  <div key={pi} className="bg-surface text-white/90 rounded-[20px] rounded-tl-md border border-[var(--line, rgba(142,104,36,0.18))] px-5 py-3.5 fade-rise" style={{ boxShadow: 'var(--shadow-card)', animationDelay: `${Math.min(pi * 120, 600)}ms` }}>
                    <div className="prose prose-invert prose-sm max-w-none text-[17px] leading-relaxed prose-p:my-0 prose-strong:text-goldhi prose-li:my-0.5">
                      <Markdown>{parte}</Markdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div
              className={`max-w-[85%] rounded-2xl p-5 ${
                msg.role === 'user'
                  ? 'burbuja-mia rounded-tr-sm'
                  : 'card-panel bg-surface text-white/90 rounded-tl-sm border border-[var(--line, rgba(142,104,36,0.18))]'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-[17px] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              ) : (
                <div className="text-[17px] leading-relaxed prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-li:my-1 prose-a:text-gold">
                  {msg.content ? (
                    <Markdown>{msg.content}</Markdown>
                  ) : (
                    <span className="flex gap-1.5 items-center py-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </span>
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--line, rgba(142,104,36,0.18))] bg-black/20">
        {quickReplies.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {quickReplies.map((qr) => (
              <button
                key={qr.id}
                onClick={() => handleSend(qr.label)}
                disabled={isTyping}
                /*
                  `shrink-0` y `whitespace-nowrap`: la tira ya tenía
                  `overflow-x-auto`, pero sin esto el flex no desborda —
                  comprime. Los tres entraban a la fuerza en 358 píxeles, a
                  unos 100 cada uno, y el texto se partía en CUATRO renglones:
                  «Volví / después / de unos / días». Ahora cada uno mide lo
                  que mide su frase y la tira se desplaza de costado, que es
                  lo que el `overflow-x-auto` esperaba desde el principio.
                */
                className="shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl border border-[var(--line2, rgba(142,104,36,0.30))] bg-gold/10 hover:bg-gold/20 hover:border-gold/40 text-xs text-cream/85 font-medium transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-[0.98]"
              >
                {qr.icon && <span className="text-sm">{qr.icon}</span>}
                {qr.label}
              </button>
            ))}
          </div>
        )}

        <AttachmentsPreviewStrip
          attachments={attachments}
          onChange={setAttachments}
          uploading={uploadingAttachment}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="relative flex items-center gap-2"
        >
          <AttachButton
            attachments={attachments}
            onChange={setAttachments}
            onUploadingChange={setUploadingAttachment}
            onError={(msg) => toast.error(msg)}
            disabled={isTyping || cargandoEstado}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            disabled={isTyping || cargandoEstado}
            /*
              El de antes decía «Cuéntale dónde estás — tu Mentor conoce tu
              camino...» y el campo mide 289 píxeles con el botón de enviar
              encima: se cortaba en «Cuéntale dónde estás —», con el guión
              suelto al final. Un marcador de campo que no entra deja de ser
              una invitación y pasa a ser un texto roto. Lo que el Mentor sabe
              ya lo dice el encabezado.
            */
            placeholder={isTyping ? 'Armando la respuesta...' : 'Cuéntale dónde estás'}
            className="flex-1 bg-white/5 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl py-3.5 pl-4 pr-14 text-[17px] text-white placeholder-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={
              (!input.trim() && attachments.length === 0) ||
              isTyping ||
              cargandoEstado ||
              uploadingAttachment
            }
            /*
              Era un círculo de oro macizo, con el oro escrito a mano como
              valor arbitrario —`bg-[var(--oro-d)]`—, así que ninguna regla del
              tema lo alcanzaba: el mismo caso del botón del Mentor en la
              barra. Ahora es el bloque de tinta de la casa y el oro queda
              donde vive, en la línea del campo de al lado.
            */
            aria-label="Enviar" className="absolute right-1 w-11 h-11 rounded-full disabled:opacity-50 flex items-center justify-center transition-colors"
            style={{ background: 'var(--tinta-boton, #2A2118)', color: 'var(--papel-boton, #FBF8F1)' }}
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
