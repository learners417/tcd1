/**
 * Coach IA · capa de persistencia y resumen rotativo.
 *
 * Antes: el chat con Javo vivía solo en localStorage (`tcd_coach_messages_v2`).
 * Ahora: persiste en Supabase (`coach_conversations`) por usuario · con un
 * resumen rotativo que se genera cada 20 mensajes nuevos.
 *
 * El resumen mantiene el contexto largo de la relación sanador-coach sin
 * inflar el system prompt con la historia completa.
 */
import {
  coachConversationsRepo,
  type CoachConversationMessage,
  type CoachConversationRow,
} from './supabase';
import { generateText } from './aiProvider';

const LOCALSTORAGE_KEY = 'tcd_coach_messages_v2';
const ROTATION_THRESHOLD = 20;

export interface CoachState {
  messages: CoachConversationMessage[];
  summary: string | null;
  lastSummaryAtMsgCount: number;
}

/** Lee mensajes legacy del localStorage (si existen). */
function readLocalLegacy(): CoachConversationMessage[] {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is CoachConversationMessage =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    );
  } catch {
    return [];
  }
}

/**
 * Carga el estado del Coach IA · con migración desde localStorage al primer load.
 * Si el usuario tenía mensajes en localStorage y no en DB · los migra · y borra el localStorage.
 */
export async function loadCoachState(userId: string): Promise<CoachState> {
  const row = await coachConversationsRepo.load(userId);

  if (row) {
    // Hay row en DB · es el source-of-truth. Limpiamos localStorage por si quedó stale.
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
    return {
      messages: row.messages ?? [],
      summary: row.summary,
      lastSummaryAtMsgCount: row.last_summary_at_msg_count ?? 0,
    };
  }

  // Sin row en DB · revisamos localStorage para migrar
  const legacy = readLocalLegacy();
  if (legacy.length > 0) {
    await coachConversationsRepo.saveMessages(userId, legacy);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
    return {
      messages: legacy,
      summary: null,
      lastSummaryAtMsgCount: 0,
    };
  }

  return {
    messages: [],
    summary: null,
    lastSummaryAtMsgCount: 0,
  };
}

/** Persiste el array de mensajes en Supabase. */
export async function saveCoachMessages(
  userId: string,
  messages: CoachConversationMessage[],
): Promise<void> {
  await coachConversationsRepo.saveMessages(userId, messages);
}

/**
 * Genera un resumen rotativo si pasaron 20+ mensajes desde el último.
 *
 * Estrategia:
 * - Tomamos los últimos N mensajes (ventana = ROTATION_THRESHOLD)
 * - Pedimos al provider un resumen breve (5-7 bullets) en la voz Javo
 * - Si ya había summary anterior · lo INCORPORAMOS para mantener continuidad
 *
 * Retorna null si no se generó (todavía no llegó al threshold).
 */
export async function rotateSummaryIfNeeded(
  userId: string,
  state: CoachState,
): Promise<{ summary: string; msgCount: number } | null> {
  const delta = state.messages.length - state.lastSummaryAtMsgCount;
  if (delta < ROTATION_THRESHOLD) return null;

  const ventana = state.messages.slice(-ROTATION_THRESHOLD);
  const ventanaTexto = ventana
    .map((m) => `${m.role === 'user' ? 'Sanador' : 'Javo'}: ${m.content}`)
    .join('\n\n');

  const prompt = `Resumí estos ${ROTATION_THRESHOLD} mensajes de una conversación entre Javo (coach) y un sanador en formación TCD. Tu salida son 5-7 bullets cortos · sin emojis · sin palabrería. Cubrí: qué se charló · qué quedó pendiente · contexto emocional · decisiones tomadas.

${state.summary ? `RESUMEN PREVIO (incorporalo si sigue vigente):\n${state.summary}\n\n` : ''}MENSAJES NUEVOS:
${ventanaTexto}

RESUMEN ACTUALIZADO:`;

  let summary: string;
  try {
    summary = (await generateText({
      prompt,
      systemInstruction:
        'Sos un asistente que resume conversaciones largas en bullets cortos · sin perder contexto emocional ni decisiones.',
    })) ?? '';
  } catch {
    return null;
  }

  summary = summary.trim();
  if (!summary) return null;

  const msgCount = state.messages.length;
  await coachConversationsRepo.updateSummary(userId, summary, msgCount);

  return { summary, msgCount };
}

/** Reinicia el chat del Coach (borra mensajes y summary). */
export async function resetCoach(userId: string): Promise<void> {
  await coachConversationsRepo.reset(userId);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  }
}

export type { CoachConversationMessage, CoachConversationRow };
