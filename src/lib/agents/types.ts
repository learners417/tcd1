import type { PilarId, ProfileV2 } from '../supabase';

export interface MensajeAgente {
  rol: 'usuario' | 'agente';
  contenido: string;
}

export type AdnFieldKey =
  | 'IDhistoria_corta_50'
  | 'IDhistoria_larga_300'
  | 'IDproposito_frase'
  | 'IDlegado_declaracion'
  | 'METAprofesion'
  | 'IRRavatar_demografia'
  | 'IRRavatar_psicografia'
  | 'IRRavatar_objeciones'
  | 'IRRavatar_lenguaje'
  | 'IRRavatar_voz'
  | 'IRRavatar_cementerio'
  | 'IRRmatriz_a_infierno'
  | 'IRRmatriz_b_obstaculos'
  | 'IRRmatriz_c_cielo'
  | 'IRRpuv'
  | 'IRRtransformaciones_lista'
  | 'IRRmetodo_nombre'
  | 'IRRmetodo_pasos'
  | 'IRRmetodo_diferencial'
  | 'IRRmetodo_resultado'
  | 'NEGlead_magnet'
  | 'NEGoferta_mid'
  | 'NEGoferta_low'
  | 'NEGoferta_high'
  | 'NEGgarantia'
  | 'NEGescenarios_roas'
  | 'CAPscript_venta_W'
  | 'CAPlanding_copy'
  | 'CAPtriage_audios_5'
  | 'CAPseguimiento_secuencia';

export type AgenteCategoria =
  | 'producir-comunicar'
  | 'vender-medir'
  | 'operar-clientes';

/**
 * Quick reply estructurado · 6 fijos por entrenador.
 * Aparecen al abrir el chat por primera vez (mensajes.length <= 1).
 */
export interface QuickReplyEstructurado {
  id: string;
  icon: string;          // emoji unicode
  label: string;         // título corto del botón
  subtitle: string;      // descripción breve
  action: string;        // 'start_mode_guiado' | 'request_upload' | etc · informativo
  first_message: string; // mensaje que envía el entrenador al click
}

/**
 * Reglas de promoción de nivel.
 * Nivel 1 (Principiante) · default
 * Nivel 2 (Practicante)  · X prácticas con score promedio >= Y
 * Nivel 3 (Competente)   · más prácticas + score más alto
 * Nivel 4 (Autónomo)     · meta · el entrenador deja de hacer falta
 */
export interface LevelThresholds {
  level2: { practices: number; avgScore: number };
  level3: { practices: number; avgScore: number };
  level4: { practices: number; avgScore: number };
}

/**
 * Snapshot del progreso del sanador con un entrenador específico.
 * Se carga desde `agent_skill_progress` y se pasa al system prompt para
 * que el entrenador adapte su tono (e.g. "ya tenés esto" al nivel 4).
 */
export interface AgenteSkillSnapshot {
  practice_count: number;
  current_level: 1 | 2 | 3 | 4;
  avg_score: number;
}

/**
 * Verifica si un entrenador queda desbloqueado más allá de los pilares
 * (e.g. Ramiro requiere métricas cargadas, Lucas requiere script_venta).
 */
export type UnlockExtraCheck = (
  perfil: Partial<ProfileV2>,
  ctx: { metricasCount: number },
) => boolean;

export interface ConfigAgente {
  id: string;
  titulo: string;
  subtitulo: string;
  icon: string;
  accentOpacity: string;
  descripcion: string;
  categoria: AgenteCategoria;
  /** Todos estos pilares deben estar 100% completos para desbloquear. */
  unlockPilares: PilarId[];
  /** Chequeo adicional · si retorna false el entrenador queda bloqueado. */
  unlockExtraCheck?: UnlockExtraCheck;
  /** Texto que se muestra en el modal cuando el entrenador está bloqueado. */
  unlockReason: string;
  adnFieldsNeeded: AdnFieldKey[];
  sistemPrompt: (
    perfil: Partial<ProfileV2>,
    skill?: AgenteSkillSnapshot,
  ) => string;
  mensajeInicial: (
    perfil: Partial<ProfileV2>,
    skill?: AgenteSkillSnapshot,
  ) => string;
  initialQuickReplies: QuickReplyEstructurado[];
  levelThresholds: LevelThresholds;
  /** Mensaje que reemplaza al inicial cuando el sanador llegó a Nivel 4. */
  taglineNivel4: string;
}
