import type {
  AgenteSkillSnapshot,
  LevelThresholds,
} from './types';

/**
 * Parser de score en mensajes del entrenador.
 * El entrenador emite al final de cada práctica:
 *
 *   PRÁCTICA TERMINADA · práctica N
 *   NIVEL ACTUAL: X
 *   SCORE: 7
 *
 * El parser detecta el SCORE y lo convierte en number 1-10.
 * Solo válido si está entre 1 y 10 inclusive.
 */
const SCORE_REGEX = /SCORE\s*:\s*(\d+(?:\.\d+)?)/i;

export function parseScoreFromMessage(content: string): number | null {
  const m = content.match(SCORE_REGEX);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > 10) return null;
  return n;
}

/** Defaults · aplican a Mateo · Sofi · Ramiro (Nivel 4 estándar = 20 prácticas score 8). */
export const DEFAULT_THRESHOLDS: LevelThresholds = {
  level2: { practices: 3, avgScore: 6 },
  level3: { practices: 10, avgScore: 7 },
  level4: { practices: 20, avgScore: 8 },
};

/** Caro · Vera · Bruno · Lucas tienen umbrales propios per brief. */
export const CARO_THRESHOLDS: LevelThresholds = {
  ...DEFAULT_THRESHOLDS,
  level4: { practices: 10, avgScore: 8 },
};

export const VERA_THRESHOLDS: LevelThresholds = {
  ...DEFAULT_THRESHOLDS,
  level4: { practices: 8, avgScore: 8 },
};

export const LUCAS_THRESHOLDS: LevelThresholds = {
  ...DEFAULT_THRESHOLDS,
  level4: { practices: 15, avgScore: 8 },
};

export const BRUNO_THRESHOLDS: LevelThresholds = {
  ...DEFAULT_THRESHOLDS,
  level4: { practices: 8, avgScore: 8 },
};

export function calcularNivel(
  scores: number[],
  thresholds: LevelThresholds,
): 1 | 2 | 3 | 4 {
  const count = scores.length;
  const avg = count ? scores.reduce((a, b) => a + b, 0) / count : 0;

  if (count >= thresholds.level4.practices && avg >= thresholds.level4.avgScore) return 4;
  if (count >= thresholds.level3.practices && avg >= thresholds.level3.avgScore) return 3;
  if (count >= thresholds.level2.practices && avg >= thresholds.level2.avgScore) return 2;
  return 1;
}

export function calcularPromedio(scores: number[]): number {
  if (!scores.length) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export const NIVEL_NOMBRE: Record<1 | 2 | 3 | 4, string> = {
  1: 'Principiante',
  2: 'Practicante',
  3: 'Competente',
  4: 'Autónomo',
};

export function buildSkillSnapshot(
  practice_count: number,
  scores: number[],
  thresholds: LevelThresholds,
): AgenteSkillSnapshot {
  return {
    practice_count,
    current_level: calcularNivel(scores, thresholds),
    avg_score: calcularPromedio(scores),
  };
}

/** Snapshot inicial cuando todavía no hay row en agent_skill_progress. */
export const SKILL_SNAPSHOT_EMPTY: AgenteSkillSnapshot = {
  practice_count: 0,
  current_level: 1,
  avg_score: 0,
};
