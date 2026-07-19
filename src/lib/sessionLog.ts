/**
 * SESIÓN VIVA — la unidad atómica de la mentoría hecha app (Cirugía T1).
 *
 * Cada meta del Camino se vive como una sesión real con la liturgia de Javo:
 * check-in (emoción + objetivo) → trabajo con cronómetro → check-out
 * (emoción + compromisos) → consolidación al ADN → registro permanente.
 *
 * Este módulo es la fundación: tipos, persistencia (Supabase + fallback
 * localStorage), el estado "en curso" para pausar/retomar, y el parser
 * del tiempo estimado para el cronómetro.
 */
import { supabase } from './supabase';

// ── Tipos ────────────────────────────────────────────────────────────────

export type EmocionSesion =
  | 'enfocado' | 'con_dudas' | 'cansado' | 'con_miedo' | 'encendido' | 'en_paz' | 'orgulloso';

export const EMOCIONES_ENTRADA: Array<{ id: EmocionSesion; emoji: string; label: string }> = [
  { id: 'enfocado', emoji: '🎯', label: 'Enfocado/a' },
  { id: 'encendido', emoji: '🔥', label: 'Encendido/a' },
  { id: 'con_dudas', emoji: '🤔', label: 'Con dudas' },
  { id: 'cansado', emoji: '😮‍💨', label: 'Cansado/a' },
  { id: 'con_miedo', emoji: '😰', label: 'Con miedo' },
  { id: 'en_paz', emoji: '🌿', label: 'En paz' },
];

export const EMOCIONES_SALIDA: Array<{ id: EmocionSesion; emoji: string; label: string }> = [
  { id: 'orgulloso', emoji: '🏆', label: 'Orgulloso/a' },
  { id: 'encendido', emoji: '🔥', label: 'Encendido/a' },
  { id: 'en_paz', emoji: '🌿', label: 'En paz' },
  { id: 'enfocado', emoji: '🎯', label: 'Enfocado/a' },
  { id: 'cansado', emoji: '😮‍💨', label: 'Cansado/a' },
  { id: 'con_dudas', emoji: '🤔', label: 'Con dudas' },
];

export interface SessionLog {
  id?: string;
  user_id: string;
  meta_codigo: string;
  meta_titulo: string;
  checkin_emocion: EmocionSesion | null;
  checkin_objetivo: string;
  checkout_emocion: EmocionSesion | null;
  compromisos: string[];
  duracion_seg: number;
  pausas: number;
  resumen_consolidado: string | null;
  artefacto_url: string | null;
  completada: boolean;
  created_at?: string;
  closed_at?: string | null;
}

/** Estado de una sesión EN CURSO (para pausar/retomar aunque se cierre la app). */
export interface SesionEnCurso {
  metaKey: string; // `${pilarNumero}-${metaCodigo}` — misma clave que hoja de ruta
  metaCodigo: string;
  metaTitulo: string;
  checkinEmocion: EmocionSesion;
  checkinObjetivo: string;
  /** Segundos acumulados de trabajo (se congela al pausar). */
  segundosAcumulados: number;
  /** Epoch ms del último arranque del cronómetro; null = pausada. */
  corriendoDesde: number | null;
  pausas: number;
  iniciadaEn: string; // ISO
  /** id del session_log en Supabase si ya se creó el borrador. */
  logId?: string;
  /** true si la sesión se abrió en modo corto (15 min). */
  modoCorto?: boolean;
}

// ── Parser del tiempo estimado ("1 h" · "45 min" · "1.5 h" · "5 días…") ──

/**
 * Devuelve los segundos objetivo del cronómetro, o null si la meta es una
 * misión sin cronómetro (paralelas, permanentes, "min/día", "por semana").
 */
export function parseTiempoEstimado(tiempo?: string | null): number | null {
  if (!tiempo) return null;
  const t = tiempo.toLowerCase();
  // La duración concreta AL INICIO manda ("4 h (día especial)" ES una sesión de 4h);
  // las misiones se detectan solo cuando NO hay duración inicial en h/min.
  const m = t.match(/^\s*([\d.,]+)\s*(h\b|hora|min)/);
  if (!m) {
    return null; // "5 días (en paralelo)", "45 min/día", "20 min/semana", "permanente"…
  }
  if (/\/(día|dia|semana)/.test(t)) return null; // "45 min/día" es rutina, no sesión
  const n = parseFloat(m[1].replace(',', '.'));
  if (Number.isNaN(n) || n <= 0) return null;
  return m[2].startsWith('h') ? Math.round(n * 3600) : Math.round(n * 60);
}

export function formatoCrono(seg: number): string {
  const s = Math.max(0, Math.floor(seg));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    : `${m}:${String(ss).padStart(2, '0')}`;
}

// ── Estado en curso: persistencia local (sobrevive a cerrar la app) ──────

const KEY_EN_CURSO = 'tcd_sesion_en_curso_v1';

export function getSesionEnCurso(): SesionEnCurso | null {
  try {
    const raw = localStorage.getItem(KEY_EN_CURSO);
    return raw ? (JSON.parse(raw) as SesionEnCurso) : null;
  } catch {
    return null;
  }
}

export function setSesionEnCurso(s: SesionEnCurso | null): void {
  try {
    if (s) localStorage.setItem(KEY_EN_CURSO, JSON.stringify(s));
    else localStorage.removeItem(KEY_EN_CURSO);
  } catch {
    /* noop */
  }
}

/** Segundos de trabajo reales ahora mismo (acumulado + tramo corriendo). */
export function segundosDeSesion(s: SesionEnCurso): number {
  const extra = s.corriendoDesde ? (Date.now() - s.corriendoDesde) / 1000 : 0;
  return Math.floor(s.segundosAcumulados + extra);
}

export function pausarSesion(s: SesionEnCurso): SesionEnCurso {
  if (!s.corriendoDesde) return s;
  const actualizada: SesionEnCurso = {
    ...s,
    segundosAcumulados: segundosDeSesion(s),
    corriendoDesde: null,
    pausas: s.pausas + 1,
  };
  setSesionEnCurso(actualizada);
  return actualizada;
}

export function reanudarSesion(s: SesionEnCurso): SesionEnCurso {
  if (s.corriendoDesde) return s;
  const actualizada: SesionEnCurso = { ...s, corriendoDesde: Date.now() };
  setSesionEnCurso(actualizada);
  return actualizada;
}

// ── Supabase: el registro permanente ─────────────────────────────────────

/** Crea el borrador del log al abrir la sesión (check-in). Silencioso si falla. */
export async function abrirSessionLog(
  userId: string,
  meta: { codigo: string; titulo: string },
  checkin: { emocion: EmocionSesion; objetivo: string },
): Promise<string | undefined> {
  if (!supabase || !userId) return undefined;
  try {
    const { data, error } = await supabase
      .from('session_logs')
      .insert({
        user_id: userId,
        meta_codigo: meta.codigo,
        meta_titulo: meta.titulo,
        checkin_emocion: checkin.emocion,
        checkin_objetivo: checkin.objetivo,
        compromisos: [],
        duracion_seg: 0,
        pausas: 0,
        completada: false,
      })
      .select('id')
      .single();
    if (error) return undefined;
    return data?.id as string | undefined;
  } catch {
    return undefined;
  }
}

/** Cierra el log en el check-out con todo el registro de la sesión. */
export async function cerrarSessionLog(
  logId: string | undefined,
  datos: {
    checkout_emocion: EmocionSesion;
    compromisos: string[];
    duracion_seg: number;
    pausas: number;
    resumen_consolidado?: string | null;
    artefacto_url?: string | null;
  },
): Promise<void> {
  if (!supabase || !logId) return;
  try {
    await supabase
      .from('session_logs')
      .update({ ...datos, completada: true, closed_at: new Date().toISOString() })
      .eq('id', logId);
  } catch {
    /* noop — el progreso local nunca se bloquea por red */
  }
}

/** Guarda el resumen consolidado a posteriori (cuando el agente lo genera). */
export async function guardarResumenSesion(logId: string | undefined, resumen: string): Promise<void> {
  if (!supabase || !logId) return;
  try {
    await supabase.from('session_logs').update({ resumen_consolidado: resumen }).eq('id', logId);
  } catch {
    /* noop */
  }
}

/** Lista los logs de un usuario (para el cockpit de Lupe y el historial propio). */
export async function listarSessionLogs(userId: string, limite = 60): Promise<SessionLog[]> {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('session_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limite);
    if (error) return [];
    return (data ?? []) as SessionLog[];
  } catch {
    return [];
  }
}
