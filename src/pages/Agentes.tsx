/**
 * Agentes.tsx — Los 7 entrenadores TCD alineados al brief 13/05/2026.
 *
 * REGLAS CRÍTICAS:
 * - Los entrenadores NUNCA escriben al ADN. Solo entrenan.
 * - Cada entrenador entrena UNA habilidad hasta que el sanador alcanza
 *   Nivel 4 (Autónomo) · cuando ya no lo necesita.
 * - Desbloqueo por HITO (pilar 100% completo + chequeos extras) · no por día.
 *
 * Diferencia con Herramientas:
 * - Herramientas: generan un output específico en 1 paso (escriben al ADN).
 * - Entrenadores: conversaciones interactivas con score · niveles · feedback.
 *   La conversación se persiste en `agent_conversations` por (user_id, agent_id).
 *   El score se parsea de las respuestas y actualiza `agent_skill_progress`.
 */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Loader2,
  Send,
  RotateCcw,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Phone,
  CalendarDays,
  Clapperboard,
  Search,
  MessageCircle,
  PenLine,
  Layers,
  Bot,
  BadgeDollarSign,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import Markdown from 'react-markdown';
import type { ProfileV2, AgentSkillProgressRow } from '../lib/supabase';
import {
  agentConversationsRepo,
  agentSkillProgressRepo,
  supabase,
  isSupabaseReady,
} from '../lib/supabase';
import { toast } from 'sonner';
import { getUserKnowledgeBase } from '../lib/userKnowledgeBase';
import { generateText } from '../lib/aiProvider';
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
  AGENTES,
  type AgenteCategoria,
  type AgenteSkillSnapshot,
  type ConfigAgente,
  type MensajeAgente,
  type QuickReplyEstructurado,
  getCompletadas,
  checkAgentUnlock,
  parseScoreFromMessage,
  calcularNivel,
  buildSkillSnapshot,
  NIVEL_NOMBRE,
  SKILL_SNAPSHOT_EMPTY,
} from '../lib/agents';

/**
 * CONTEXTO DEL REDISEÑO (jul 2026) — se antepone al system prompt de TODOS
 * los entrenadores para alinearlos al modelo nuevo. Las configs individuales
 * pueden mencionar la estructura vieja; ESTE bloque manda.
 */
const CONTEXTO_REDISENO = `=== CONTEXTO VIGENTE DEL PROGRAMA (manda sobre cualquier referencia anterior) ===
El programa es el Método CLINICA: 90 días, 4 FASES, 8 pilares, 34 tareas.
· Fase 1 — Sanar el Dinero (P1, días 2-7): protocolo de 7 días; termina con SU precio definido.
· Fase 2 — Tu Protocolo (P2 método con nombre · P3 oferta de $1.000, días 8-14).
· Fase 3 — Captación y Ventas (P4 sistema: Meta Business Agent en WhatsApp + campaña validada con 3 anuncios de $2/día · P5 llamadas con la estructura W, días 15-45).
· Fase 4 — Servicio y Escala (P6 primer pago · P7 de 1 a 10 pacientes, días 43-90).
El progreso se mide en CINTURONES (taekwondo/planta): Blanco → punta amarilla → Amarillo → punta verde → Verde → punta azul → Azul → Rojo → Negro (Sanador Libre: 10 pacientes · $10K).
EL ADN DEL NEGOCIO (lo que SÍ existe — referite a cada cosa por su paso de El Camino): Historia/Propósito/Legado (P0.2) · el paciente ideal y LA MATRIZ ABC compartida — infierno/obstáculos/cielo (P2.3) · el método con nombre (P2.4) · la oferta principal y la escalera (P3.2) · la PUV (P4.2) · el perfil IG optimizado (P4.2b) · los anuncios CTWA (P4.3-P4.4) · el anuncio follow-me (P4.6) · el script de ventas (P5.2) · el protocolo de entrega (P6.2). Todo se construye desde El Camino y queda consolidado en su ADN.
TRATO: espejá el voseo o tuteo del usuario.
=== FIN DEL CONTEXTO VIGENTE ===`;

const AGENTE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  CalendarDays,
  Clapperboard,
  Search,
  MessageCircle,
  PenLine,
  Layers,
  BadgeDollarSign,
};

const CATEGORIA_LABEL: Record<AgenteCategoria, string> = {
  'producir-comunicar': 'Producir y comunicar',
  'vender-medir': 'Vender y medir',
  'operar-clientes': 'Operar clientes',
};

const CATEGORIA_SUBTITULO: Record<AgenteCategoria, string> = {
  'producir-comunicar': 'Te entrenan a crear contenido en tu voz',
  'vender-medir': 'Te entrenan a vender · leer números · y conducir consultas',
  'operar-clientes': 'Te entrenan a operar al cliente que ya pagó',
};

const CATEGORIA_ORDEN: AgenteCategoria[] = [
  'producir-comunicar',
  'vender-medir',
  'operar-clientes',
];

interface AgentesProps {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  geminiKey?: string;
  setCurrentPage?: (page: string) => void;
}

function progressRowToSnapshot(
  row: AgentSkillProgressRow | null,
  agente: ConfigAgente,
): AgenteSkillSnapshot {
  if (!row) return SKILL_SNAPSHOT_EMPTY;
  return buildSkillSnapshot(row.practice_count, row.scores, agente.levelThresholds);
}

export default function Agentes({ userId, perfil, setCurrentPage }: AgentesProps) {
  const [agenteActivo, setAgenteActivo] = useState<ConfigAgente | null>(null);
  const [mensajes, setMensajes] = useState<MensajeAgente[]>([]);
  const [inputUsuario, setInputUsuario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [cargandoConversacion, setCargandoConversacion] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [skillByAgent, setSkillByAgent] = useState<Record<string, AgentSkillProgressRow | null>>({});
  const [metricasCount, setMetricasCount] = useState<number>(0);
  const [bloqueado, setBloqueado] = useState<{ agente: ConfigAgente } | null>(null);
  const knowledgeBaseRef = useRef<string>('');

  const completadas = useMemo(() => getCompletadas(), []);
  const finDeConversacionRef = useRef<HTMLDivElement | null>(null);

  // Cargar base de conocimiento + skill progress + metricas en mount
  useEffect(() => {
    getUserKnowledgeBase(userId).then((kb) => {
      knowledgeBaseRef.current = kb;
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    agentSkillProgressRepo.loadAll(userId).then((rows) => {
      const byId: Record<string, AgentSkillProgressRow | null> = {};
      for (const r of rows) byId[r.agent_id] = r;
      setSkillByAgent(byId);
    });
  }, [userId]);

  useEffect(() => {
    if (!userId || !isSupabaseReady() || !supabase) return;
    supabase
      .from('metricas_v2')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .then(({ count }) => {
        setMetricasCount(count ?? 0);
      });
  }, [userId]);

  useEffect(() => {
    finDeConversacionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes, cargando]);

  const obtenerSnapshot = useCallback(
    (agente: ConfigAgente): AgenteSkillSnapshot => {
      const row = skillByAgent[agente.id] ?? null;
      return progressRowToSnapshot(row, agente);
    },
    [skillByAgent],
  );

  const iniciarAgente = useCallback(
    async (agente: ConfigAgente) => {
      const snapshot = obtenerSnapshot(agente);
      setAgenteActivo(agente);
      setInputUsuario('');

      if (userId) {
        setCargandoConversacion(true);
        try {
          const previa = await agentConversationsRepo.load(userId, agente.id);
          if (previa && previa.length > 0) {
            setMensajes(previa);
            return;
          }
        } catch {
          // si falla la carga, seguimos con el mensaje inicial
        } finally {
          setCargandoConversacion(false);
        }
      }

      // Si está en Nivel 4 · usamos el taglineNivel4 como primer mensaje.
      const inicialBase = agente.mensajeInicial(perfil ?? {}, snapshot);
      const contenidoInicial =
        snapshot.current_level === 4
          ? `${getNombreSaludo(perfil)} · ${agente.taglineNivel4}`
          : inicialBase;

      setMensajes([{ rol: 'agente', contenido: contenidoInicial }]);
    },
    [obtenerSnapshot, perfil, userId],
  );

  const persistirMensajes = useCallback(
    async (agente: ConfigAgente, msgs: MensajeAgente[]) => {
      if (!userId) return;
      try {
        await agentConversationsRepo.save(userId, agente.id, msgs);
      } catch {
        // silencioso · el usuario no necesita ver fallos de persistencia
      }
    },
    [userId],
  );

  const aplicarScore = useCallback(
    async (agente: ConfigAgente, score: number) => {
      if (!userId) return;
      const prev = skillByAgent[agente.id];
      const prevScores = prev?.scores ?? [];
      const nextScores = [...prevScores, score];
      const nextCount = (prev?.practice_count ?? 0) + 1;
      const nextLevel = calcularNivel(nextScores, agente.levelThresholds);
      const prevLevel = prev?.current_level ?? 1;

      const upsertPayload = {
        practice_count: nextCount,
        scores: nextScores,
        current_level: nextLevel,
      };

      await agentSkillProgressRepo.upsert(userId, agente.id, upsertPayload);
      setSkillByAgent((prevMap) => ({
        ...prevMap,
        [agente.id]: {
          user_id: userId,
          agent_id: agente.id,
          practice_count: nextCount,
          scores: nextScores,
          current_level: nextLevel,
          last_practice_at: new Date().toISOString(),
        },
      }));

      if (nextLevel > prevLevel) {
        if (nextLevel === 4) {
          toast.success(`¡Llegaste a Autónoma con ${agente.titulo.split(' ·')[0]}!`);
        } else {
          toast.success(
            `Nivel ${nextLevel} con ${agente.titulo.split(' ·')[0]} · ${NIVEL_NOMBRE[nextLevel]}`,
          );
        }
      }
    },
    [skillByAgent, userId],
  );

  const enviarMensaje = useCallback(
    async (texto: string) => {
      const tieneAdjuntos = attachments.length > 0;
      if ((!texto.trim() && !tieneAdjuntos) || !agenteActivo || cargando) return;

      const enviados = attachments;
      setAttachments([]);

      // Mensaje visible para el usuario · etiquetas con adjuntos
      const textoVisible = tieneAdjuntos
        ? `${texto.trim() || '(adjuntos para analizar)'}\n\n${enviados
            .map((a) =>
              a.kind === 'image' ? `📎 ${a.fileName} (imagen)` : `📎 ${a.fileName}`,
            )
            .join('\n')}`
        : texto;

      const conUsuario: MensajeAgente[] = [
        ...mensajes,
        { rol: 'usuario', contenido: textoVisible },
      ];
      setMensajes(conUsuario);
      setInputUsuario('');
      setCargando(true);

      try {
        // Contexto de adjuntos · imagenes via Claude vision + archivos de texto
        const adjuntosCtx = tieneAdjuntos
          ? await attachmentsToContext(enviados)
          : '';

        // Reemplazamos el ultimo turno del usuario en el historial para incluir
        // el contexto de adjuntos · asi el entrenador "ve" los archivos sin que
        // sature la persistencia.
        const historial = [
          ...mensajes.map(
            (m) => `${m.rol === 'usuario' ? 'Usuario' : 'Agente'}: ${m.contenido}`,
          ),
          `Usuario: ${adjuntosCtx}${texto.trim() || 'Por favor, analiza los archivos/imagenes adjuntas.'}`,
        ].join('\n\n');

        const baseConocimiento = knowledgeBaseRef.current
          ? `\n\n=== BASE DE CONOCIMIENTO DEL SANADOR ===\n${knowledgeBaseRef.current}`
          : '';

        const snapshot = obtenerSnapshot(agenteActivo);
        const respuesta = await generateText({
          prompt: `${baseConocimiento}\n\n---HISTORIAL---\n${historial}\n\nAgente:`,
          systemInstruction: CONTEXTO_REDISENO + '\n\n' + agenteActivo.sistemPrompt(perfil ?? {}, snapshot),
        });

        const respuestaTexto = respuesta || 'Sin respuesta del agente.';
        const finales: MensajeAgente[] = [
          ...conUsuario,
          { rol: 'agente', contenido: respuestaTexto },
        ];
        setMensajes(finales);
        await persistirMensajes(agenteActivo, finales);

        // Parsear SCORE: X del mensaje del agente · actualizar skill_progress
        const score = parseScoreFromMessage(respuestaTexto);
        if (score !== null) {
          await aplicarScore(agenteActivo, score);
        }
      } catch {
        toast.error('Error al conectar con el entrenador. Intentá de nuevo.');
        setMensajes(conUsuario);
      } finally {
        setCargando(false);
      }
    },
    [
      agenteActivo,
      attachments,
      mensajes,
      cargando,
      perfil,
      persistirMensajes,
      obtenerSnapshot,
      aplicarScore,
    ],
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
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

  const onQuickReplyClick = useCallback(
    async (qr: QuickReplyEstructurado) => {
      if (!agenteActivo || cargando) return;

      // 1) Empujar mensaje del usuario (la label como su elección)
      const conUsuario: MensajeAgente[] = [
        ...mensajes,
        { rol: 'usuario', contenido: qr.label },
      ];
      // 2) Empujar respuesta del agente directamente (first_message es canónico)
      const conAgente: MensajeAgente[] = [
        ...conUsuario,
        { rol: 'agente', contenido: qr.first_message },
      ];
      setMensajes(conAgente);
      await persistirMensajes(agenteActivo, conAgente);
    },
    [agenteActivo, mensajes, cargando, persistirMensajes],
  );

  const reiniciarConversacion = useCallback(async () => {
    if (!agenteActivo) return;
    if (userId) {
      try {
        await agentConversationsRepo.reset(userId, agenteActivo.id);
      } catch {
        // silencioso
      }
    }
    const snapshot = obtenerSnapshot(agenteActivo);
    const inicial = agenteActivo.mensajeInicial(perfil ?? {}, snapshot);
    setMensajes([{ rol: 'agente', contenido: inicial }]);
    setInputUsuario('');
    toast.success('Conversación reiniciada');
  }, [agenteActivo, obtenerSnapshot, perfil, userId]);

  const copiarConversacion = useCallback(() => {
    const texto = mensajes
      .map((m) => `${m.rol === 'agente' ? 'ENTRENADOR' : 'VOS'}: ${m.contenido}`)
      .join('\n\n');
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [mensajes]);

  const volverAlGrid = useCallback(() => {
    setAgenteActivo(null);
    setMensajes([]);
  }, []);

  // ─── Vista principal: 3 categorías con cards ───────────────────────────────
  if (!agenteActivo) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-light text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-gold" /> Entrenadores IA
          </h1>
          <p className="text-sm text-white/75 mt-1">
            Cada uno entrena UNA habilidad hasta que la haces sola. Se desbloquean
            cuando avanzás en El Camino.
          </p>
        </div>

        {CATEGORIA_ORDEN.map((cat) => {
          const deCategoria = AGENTES.filter((a) => a.categoria === cat);
          if (deCategoria.length === 0) return null;
          return (
            <section key={cat}>
              <header className="mb-3">
                <h2 className="text-sm font-medium uppercase tracking-wider text-gold">
                  {CATEGORIA_LABEL[cat]}
                </h2>
                <p className="text-xs text-white/55 mt-0.5">
                  {CATEGORIA_SUBTITULO[cat]}
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deCategoria.map((agente) => {
                  const snapshot = obtenerSnapshot(agente);
                  const unlock = checkAgentUnlock(
                    agente,
                    perfil ?? {},
                    { metricasCount },
                    completadas,
                  );
                  const autonomo = unlock.unlocked && snapshot.current_level === 4;

                  return (
                    <AgenteCard
                      key={agente.id}
                      agente={agente}
                      snapshot={snapshot}
                      unlocked={unlock.unlocked}
                      reason={unlock.reason}
                      autonomo={autonomo}
                      onClick={() => {
                        if (unlock.unlocked) {
                          iniciarAgente(agente);
                        } else {
                          setBloqueado({ agente });
                        }
                      }}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {bloqueado && (
          <ModalBloqueado
            agente={bloqueado.agente}
            onCerrar={() => setBloqueado(null)}
            onIrAlRoadmap={() => {
              setBloqueado(null);
              setCurrentPage?.('roadmap');
            }}
          />
        )}
      </div>
    );
  }

  // ─── Vista de conversación con un entrenador activo ────────────────────────
  const IconActivo = AGENTE_ICON_MAP[agenteActivo.icon];
  const snapshotActivo = obtenerSnapshot(agenteActivo);
  const autonomoActivo = snapshotActivo.current_level === 4;

  return (
    <div className="w-full flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="card-panel p-4 rounded-2xl mb-4 border border-gold/20 bg-gold/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={volverAlGrid}
              className="flex items-center gap-1.5 text-xs text-white/75 hover:text-white bg-gold/5 px-3 py-1.5 rounded-xl transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </button>
            {(() => {
              const ident = identidadDe(agenteActivo.id);
              return ident ? (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 bg-black/30" style={{ borderColor: ident.anillo }}><span className="text-[18px] font-bold text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{ident.inicial}</span></div>
              ) : (IconActivo && <IconActivo className="w-6 h-6 text-gold" />);
            })()}
            <div>
              <h2 className="text-sm font-medium text-gold flex items-center gap-2">
                {agenteActivo.titulo}
                {autonomoActivo && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Autónoma
                  </span>
                )}
              </h2>
              {identidadDe(agenteActivo.id) && (
                <p className="text-[11px] text-cream/65 mt-0.5 italic">{identidadDe(agenteActivo.id)!.frase}</p>
              )}
              <p className="text-xs text-white/65">
                Nivel {snapshotActivo.current_level} · {NIVEL_NOMBRE[snapshotActivo.current_level]} ·{' '}
                {snapshotActivo.practice_count} prácticas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copiarConversacion}
              className="flex items-center gap-1.5 text-xs text-white/75 hover:text-white bg-gold/5 px-3 py-1.5 rounded-xl transition-colors"
            >
              {copiado ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
            <button
              onClick={reiniciarConversacion}
              className="flex items-center gap-1.5 text-xs text-white/75 hover:text-white bg-gold/5 px-3 py-1.5 rounded-xl transition-colors"
              title="Empezar de nuevo · borra esta conversación"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Empezar de nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Conversación */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {cargandoConversacion && (
          <div className="flex justify-start">
            <div className="card-panel rounded-2xl px-4 py-3 flex items-center gap-2 text-white/75 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando conversación previa...
            </div>
          </div>
        )}
        {mensajes.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.rol === 'agente' && !msg.contenido.includes('```') ? (
              /* Burbujas humanas: el entrenador escribe en bloques, como una persona */
              <div className="max-w-[85%] flex flex-col gap-2">
                {msg.contenido.split(/\n\n+/).filter(Boolean).map((parte, pi) => (
                  <div key={pi} className="bg-surface text-white/90 rounded-[20px] rounded-tl-md border border-[rgba(232,150,46,0.10)] px-5 py-3.5 text-sm leading-relaxed fade-rise" style={{ animationDelay: `${Math.min(pi * 120, 600)}ms` }}>
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-0 prose-li:my-0.5 prose-strong:text-goldhi prose-code:text-gold prose-code:bg-gold/10 prose-code:px-1 prose-code:rounded">
                      <Markdown>{parte}</Markdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.rol === 'usuario'
                  ? 'bg-gold text-white whitespace-pre-wrap'
                  : 'card-panel text-white/90'
              }`}
            >
              {msg.rol === 'agente' ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5 prose-li:my-0.5 prose-li:text-white/80 prose-strong:text-white prose-strong:font-semibold prose-code:text-gold prose-code:bg-gold/10 prose-code:px-1 prose-code:rounded prose-hr:border-[rgba(232,150,46,0.12)]">
                  <Markdown>{msg.contenido}</Markdown>
                </div>
              ) : (
                msg.contenido
              )}
            </div>
            )}
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="card-panel rounded-2xl px-4 py-3 flex items-center gap-2 text-white/75 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Pensando...
            </div>
          </div>
        )}
        <div ref={finDeConversacionRef} />
      </div>

      {/* Quick replies estructurados · solo en el primer turno */}
      {mensajes.length <= 1 && !cargandoConversacion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          {agenteActivo.initialQuickReplies.map((qr) => (
            <button
              key={qr.id}
              onClick={() => onQuickReplyClick(qr)}
              className="text-left bg-gold/5 border border-[rgba(232,150,46,0.12)] text-white/80 px-3 py-2.5 rounded-xl hover:bg-gold/15 hover:border-[rgba(232,150,46,0.24)] hover:text-white transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0 mt-0.5">{qr.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{qr.label}</div>
                  <div className="text-[11px] text-white/55 mt-0.5 leading-snug">
                    {qr.subtitle}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <AttachmentsPreviewStrip
        attachments={attachments}
        onChange={setAttachments}
        uploading={uploadingAttachment}
      />
      <div className="flex gap-3 items-end">
        <AttachButton
          attachments={attachments}
          onChange={setAttachments}
          onUploadingChange={setUploadingAttachment}
          onError={(msg) => toast.error(msg)}
          disabled={cargando}
        />
        <textarea
          value={inputUsuario}
          onChange={(e) => setInputUsuario(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviarMensaje(inputUsuario);
            }
          }}
          placeholder="Escribe tu respuesta o pega una captura (Ctrl+V)..."
          rows={2}
          className="flex-1 bg-gold/5 border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-3 text-white text-sm resize-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
        />
        <button
          onClick={() => enviarMensaje(inputUsuario)}
          disabled={
            cargando ||
            uploadingAttachment ||
            (!inputUsuario.trim() && attachments.length === 0)
          }
          className="shrink-0 w-10 h-10 rounded-xl bg-gold hover:bg-goldhi disabled:opacity-40 flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

interface AgenteCardProps {
  agente: ConfigAgente;
  snapshot: AgenteSkillSnapshot;
  unlocked: boolean;
  reason?: string;
  autonomo: boolean;
  onClick: () => void;
}


// ═══ LAS IDENTIDADES — cada entrenador con su mundo (ZIP humano) ═══
// Disciplina de diseño: la MISMA tarjeta; la identidad vive en el emoji + la frase.
// 3 familias de acento: cálidos (acompañan) · fríos (técnicos) · ámbar de la casa.
const IDENTIDADES: Record<string, { inicial: string; frase: string; anillo: string }> = {
  sofi:   { inicial: 'S', frase: 'Te entreno a conversar con pacientes sin rogar ni convencer — filtrar es cuidar.', anillo: 'rgba(232,150,46,0.45)' },
  caro:   { inicial: 'C', frase: 'El miedo a la cámara se entrena. Conmigo grabas con oficio, sin sufrir.', anillo: 'rgba(232,150,46,0.45)' },
  vera:   { inicial: 'V', frase: 'Tu esencia es tu marca. Te ayudo a que se vea lo que ya eres.', anillo: 'rgba(232,150,46,0.45)' },
  ramiro: { inicial: 'R', frase: 'Medimos, ajustamos, escalamos. Los números cuentan la verdad.', anillo: 'rgba(96,165,250,0.40)' },
  lucas:  { inicial: 'L', frase: 'Lo técnico sin sufrimiento. Paso a paso, hasta que funciona.', anillo: 'rgba(96,165,250,0.40)' },
  bruno:  { inicial: 'B', frase: 'El dinero sano de tu práctica: cobrar bien, guardar mejor, crecer tranquilo.', anillo: 'rgba(96,165,250,0.40)' },
  diego:  { inicial: 'D', frase: 'Vender sin presionar. Preguntas que abren, silencios que cierran.', anillo: 'rgba(244,182,92,0.50)' },
  mateo:  { inicial: 'M', frase: 'Guiones y contenido que suenan a ti — cero humo, cero plantillas.', anillo: 'rgba(244,182,92,0.50)' },
};
const identidadDe = (agenteId: string) => {
  const key = Object.keys(IDENTIDADES).find((k) => agenteId.includes(k));
  return key ? IDENTIDADES[key] : null;
};

function AgenteCard({
  agente,
  snapshot,
  unlocked,
  reason,
  autonomo,
  onClick,
}: AgenteCardProps) {
  const IconComp = AGENTE_ICON_MAP[agente.icon];

  // Tres estados visuales:
  //   - autónoma · borde verde · etiqueta
  //   - disponible · gold accent · nivel y dots
  //   - bloqueada · opacity baja · candado · razón
  let className =
    'text-left p-5 rounded-2xl border transition-all group cursor-pointer ';
  if (autonomo) {
    className +=
      'bg-gradient-to-br from-emerald-500/10 to-gold/5 border-emerald-500/40 hover:from-emerald-500/15';
  } else if (unlocked) {
    className +=
      'bg-gold/10 border-gold/20 hover:bg-gold/15';
  } else {
    className +=
      'bg-gold/5 border-dashed border-gold/15 opacity-60';
  }

  return (
    <button onClick={onClick} className={className}>
      <div className="flex items-start gap-3 mb-3">
        {(() => {
          const ident = identidadDe(agente.id);
          if (ident) {
            return (
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 bg-black/30 ${unlocked ? '' : 'opacity-40'}`}
                style={{ borderColor: unlocked ? ident.anillo : 'rgba(255,255,255,0.10)' }}
              >
                <span className={`text-[19px] font-bold ${unlocked ? 'text-cream' : 'text-white/55'}`} style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{ident.inicial}</span>
              </div>
            );
          }
          return IconComp ? (
            <IconComp className={`w-6 h-6 shrink-0 ${autonomo ? 'text-emerald-300' : unlocked ? 'text-gold' : 'text-white/45'}`} />
          ) : null;
        })()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-medium ${
                autonomo
                  ? 'text-emerald-300'
                  : unlocked
                    ? 'text-gold'
                    : 'text-white/55'
              }`}
            >
              {agente.titulo}
            </h3>
            {!unlocked && <Lock className="w-3.5 h-3.5 text-white/55" />}
            {autonomo && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Autónoma
              </span>
            )}
          </div>
          <p className="text-xs text-white/65 mt-0.5">{agente.subtitulo}</p>
        </div>
      </div>

      <p className="text-xs text-white/65 leading-relaxed">
        {unlocked ? (identidadDe(agente.id)?.frase ?? agente.descripcion) : reason}
      </p>

      <div
        className={`mt-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider ${
          autonomo
            ? 'text-emerald-300'
            : unlocked
              ? 'text-gold group-hover:underline'
              : 'text-white/55'
        }`}
      >
        <span>
          {unlocked
            ? `Nivel ${snapshot.current_level} · ${NIVEL_NOMBRE[snapshot.current_level]} · ${snapshot.practice_count} prácticas`
            : 'Bloqueado'}
        </span>
        <span className="flex items-center gap-1">
          {unlocked ? (autonomo ? 'Hablar' : 'Entrenar') : 'Ver requisitos'}
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Dots de progreso · solo si está desbloqueado y no es autónomo */}
      {unlocked && !autonomo && (
        <div className="mt-2 flex gap-1.5">
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              className={`h-1 flex-1 rounded-full ${
                lvl <= snapshot.current_level
                  ? 'bg-gold'
                  : 'bg-gold/15'
              }`}
            />
          ))}
        </div>
      )}
    </button>
  );
}

interface ModalBloqueadoProps {
  agente: ConfigAgente;
  onCerrar: () => void;
  onIrAlRoadmap: () => void;
}

function ModalBloqueado({ agente, onCerrar, onIrAlRoadmap }: ModalBloqueadoProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onCerrar}
    >
      <div
        className="card-panel max-w-md w-full mx-4 rounded-2xl border border-gold/30 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-gold" />
          <h3 className="text-base font-medium text-white">
            {agente.titulo} está bloqueada
          </h3>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          {agente.unlockReason}
        </p>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCerrar}
            className="flex-1 text-xs text-white/75 hover:text-white bg-gold/5 px-4 py-2.5 rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={onIrAlRoadmap}
            className="flex-1 text-xs font-medium text-white bg-gold hover:bg-goldhi px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Ir a El Camino
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getNombreSaludo(perfil?: Partial<ProfileV2>): string {
  return perfil?.nombre?.split(' ')[0] ?? 'sanador';
}
