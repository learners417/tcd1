/**
 * Agentes.tsx — Los 6 Agentes IA de TCD alineados a la voz Javo v4.
 *
 * REGLA CRÍTICA: Los agentes NUNCA escriben al ADN. Solo entrenan.
 *
 * Diferencia con Herramientas:
 * - Herramientas: generan un output específico en 1 paso (escriben al ADN).
 * - Agentes: entrenan al sanador en conversaciones interactivas. La
 *   conversación se persiste en `agent_conversations` por (user_id, agent_id).
 */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Loader2, Send, RotateCcw, Copy, CheckCircle2, ArrowLeft, Lock,
  Phone, CalendarDays, Clapperboard, Search, MessageCircle, PenLine, Bot,
} from 'lucide-react';
import Markdown from 'react-markdown';
import type { ProfileV2 } from '../lib/supabase';
import { agentConversationsRepo } from '../lib/supabase';
import { toast } from 'sonner';
import { getUserKnowledgeBase } from '../lib/userKnowledgeBase';
import { generateText } from '../lib/aiProvider';
import {
  AGENTES,
  type ConfigAgente,
  type MensajeAgente,
  getCompletadas,
  isPilarActive,
} from '../lib/agents';

const AGENTE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  CalendarDays,
  Clapperboard,
  Search,
  MessageCircle,
  PenLine,
};

interface AgentesProps {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  geminiKey?: string;
}

export default function Agentes({ userId, perfil }: AgentesProps) {
  const [agenteActivo, setAgenteActivo] = useState<ConfigAgente | null>(null);
  const [mensajes, setMensajes] = useState<MensajeAgente[]>([]);
  const [inputUsuario, setInputUsuario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [cargandoConversacion, setCargandoConversacion] = useState(false);
  const knowledgeBaseRef = useRef<string>('');

  const completadas = useMemo(() => getCompletadas(), []);

  useEffect(() => {
    getUserKnowledgeBase(userId).then((kb) => { knowledgeBaseRef.current = kb; });
  }, [userId]);

  const iniciarAgente = useCallback(
    async (agente: ConfigAgente) => {
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

      setMensajes([
        { rol: 'agente', contenido: agente.mensajeInicial(perfil ?? {}) },
      ]);
    },
    [perfil, userId],
  );

  const persistir = useCallback(
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

  const enviarMensaje = useCallback(
    async (texto: string) => {
      if (!texto.trim() || !agenteActivo || cargando) return;

      const conUsuario: MensajeAgente[] = [
        ...mensajes,
        { rol: 'usuario', contenido: texto },
      ];
      setMensajes(conUsuario);
      setInputUsuario('');
      setCargando(true);

      try {
        const historial = conUsuario
          .map((m) => `${m.rol === 'usuario' ? 'Usuario' : 'Agente'}: ${m.contenido}`)
          .join('\n\n');

        const baseConocimiento = knowledgeBaseRef.current
          ? `\n\n=== BASE DE CONOCIMIENTO DEL SANADOR ===\n${knowledgeBaseRef.current}`
          : '';

        const respuesta = await generateText({
          prompt: `${baseConocimiento}\n\n---HISTORIAL---\n${historial}\n\nAgente:`,
          systemInstruction: agenteActivo.sistemPrompt(perfil ?? {}),
        });

        const finales: MensajeAgente[] = [
          ...conUsuario,
          { rol: 'agente', contenido: respuesta || 'Sin respuesta del agente.' },
        ];
        setMensajes(finales);
        await persistir(agenteActivo, finales);
      } catch {
        toast.error('Error al conectar con el agente. Intentá de nuevo.');
        setMensajes(conUsuario);
      } finally {
        setCargando(false);
      }
    },
    [agenteActivo, mensajes, cargando, perfil, persistir],
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
    setMensajes([
      { rol: 'agente', contenido: agenteActivo.mensajeInicial(perfil ?? {}) },
    ]);
    setInputUsuario('');
    toast.success('Conversación reiniciada');
  }, [agenteActivo, perfil, userId]);

  const copiarConversacion = useCallback(() => {
    const texto = mensajes
      .map((m) => `${m.rol === 'agente' ? '🤖 AGENTE' : '👤 VOS'}: ${m.contenido}`)
      .join('\n\n');
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [mensajes]);

  const volverAlGrid = useCallback(() => {
    setAgenteActivo(null);
    setMensajes([]);
  }, []);

  // ─── Vista principal: grid de agentes ──────────────────────────────────────
  if (!agenteActivo) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-light text-[#FFFFFF] flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#F5A623]" /> Agentes IA
          </h1>
          <p className="text-sm text-[#FFFFFF]/60 mt-1">
            6 agentes alineados con la voz de Javo · se desbloquean a medida que avanzás en la hoja de ruta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTES.map((agente) => {
            const unlocked =
              perfil?.full_agent_access === true ||
              isPilarActive(agente.unlockPilar, completadas);
            const IconComp = AGENTE_ICON_MAP[agente.icon];
            return (
              <button
                key={agente.id}
                onClick={() => unlocked && iniciarAgente(agente)}
                disabled={!unlocked}
                className={`text-left p-5 rounded-2xl border transition-all group ${
                  unlocked
                    ? 'bg-[#F5A623]/10 border-[#F5A623]/20 hover:bg-[#F5A623]/15 cursor-pointer'
                    : 'bg-[#F5A623]/5 border-[#F5A623]/10 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {unlocked && IconComp && <IconComp className="w-6 h-6 text-[#F5A623]" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-medium ${unlocked ? 'text-[#F5A623]' : 'text-[#FFFFFF]/30'}`}>
                        {agente.titulo}
                      </h3>
                      {!unlocked && <Lock className="w-3.5 h-3.5 text-[#FFFFFF]/30" />}
                    </div>
                    <p className="text-xs text-[#FFFFFF]/40">{agente.subtitulo}</p>
                  </div>
                </div>
                <p className="text-xs text-[#FFFFFF]/60 leading-relaxed">{agente.descripcion}</p>
                <div className={`mt-3 text-[10px] font-medium uppercase tracking-wider ${
                  unlocked ? 'text-[#F5A623] group-hover:underline' : 'text-[#FFFFFF]/30'
                }`}>
                  {unlocked ? 'Iniciar conversación →' : `Desbloquear con pilar ${agente.unlockPilar}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Vista de conversación con agente activo ────────────────────────────────
  const IconActivo = AGENTE_ICON_MAP[agenteActivo.icon];
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="card-panel p-4 rounded-2xl mb-4 border border-[#F5A623]/20 bg-[#F5A623]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={volverAlGrid}
              className="flex items-center gap-1.5 text-xs text-[#FFFFFF]/60 hover:text-[#FFFFFF] bg-[#F5A623]/5 px-3 py-1.5 rounded-xl transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver
            </button>
            {IconActivo && <IconActivo className="w-6 h-6 text-[#F5A623]" />}
            <div>
              <h2 className="text-sm font-medium text-[#F5A623]">{agenteActivo.titulo}</h2>
              <p className="text-xs text-[#FFFFFF]/40">{agenteActivo.subtitulo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copiarConversacion}
              className="flex items-center gap-1.5 text-xs text-[#FFFFFF]/60 hover:text-[#FFFFFF] bg-[#F5A623]/5 px-3 py-1.5 rounded-xl transition-colors"
            >
              {copiado ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
            <button
              onClick={reiniciarConversacion}
              className="flex items-center gap-1.5 text-xs text-[#FFFFFF]/60 hover:text-[#FFFFFF] bg-[#F5A623]/5 px-3 py-1.5 rounded-xl transition-colors"
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
            <div className="card-panel rounded-2xl px-4 py-3 flex items-center gap-2 text-[#FFFFFF]/60 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando conversación previa...
            </div>
          </div>
        )}
        {mensajes.map((msg, i) => (
          <div key={i} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.rol === 'usuario'
                  ? 'bg-[#F5A623] text-[#FFFFFF] whitespace-pre-wrap'
                  : 'card-panel text-[#FFFFFF]/90'
              }`}
            >
              {msg.rol === 'agente' ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:text-[#FFFFFF] prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5 prose-li:my-0.5 prose-li:text-[#FFFFFF]/80 prose-strong:text-[#FFFFFF] prose-strong:font-semibold prose-code:text-[#F5A623] prose-code:bg-[#F5A623]/10 prose-code:px-1 prose-code:rounded prose-hr:border-[rgba(245,166,35,0.2)]">
                  <Markdown>{msg.contenido}</Markdown>
                </div>
              ) : (
                msg.contenido
              )}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="card-panel rounded-2xl px-4 py-3 flex items-center gap-2 text-[#FFFFFF]/60 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Pensando...
            </div>
          </div>
        )}
      </div>

      {/* Sugerencias rápidas */}
      {mensajes.length <= 2 && !cargandoConversacion && (
        <div className="flex gap-2 flex-wrap mb-3">
          {agenteActivo.sugerencias.map((s) => (
            <button
              key={s}
              onClick={() => enviarMensaje(s)}
              className="text-xs bg-[#F5A623]/5 border border-[rgba(245,166,35,0.2)] text-[#FFFFFF]/60 px-3 py-1.5 rounded-xl hover:bg-[#F5A623]/10 hover:text-[#FFFFFF] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea
          value={inputUsuario}
          onChange={(e) => setInputUsuario(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviarMensaje(inputUsuario);
            }
          }}
          placeholder="Escribí tu respuesta..."
          rows={2}
          className="flex-1 bg-[#F5A623]/5 border border-[rgba(245,166,35,0.2)] rounded-xl px-4 py-3 text-[#FFFFFF] text-sm resize-none focus:border-[#F5A623]/50 focus:ring-1 focus:ring-[#F5A623]/50 transition-all"
        />
        <button
          onClick={() => enviarMensaje(inputUsuario)}
          disabled={cargando || !inputUsuario.trim()}
          className="shrink-0 w-10 h-10 rounded-xl bg-[#F5A623] hover:bg-[#FFB94D] disabled:opacity-40 flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4 text-[#FFFFFF]" />
        </button>
      </div>
    </div>
  );
}
