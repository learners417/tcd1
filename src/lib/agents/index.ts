/**
 * Los 7 entrenadores TCD · alineados al brief 13/05/2026 + voz Javo v4.
 *
 * Cada entrenador entrena UNA habilidad y se vuelve innecesario cuando el
 * sanador alcanza Nivel 4 (Autónomo). Filosofía rectora: "El mejor
 * entrenador es el que se vuelve innecesario".
 *
 * Categorías y orden visual:
 *   Producir y comunicar
 *     1. Caro    · Cámara y presencia       · hito P1+P2+P3
 *     2. Mateo   · Guiones auténticos        · hito P4
 *   Vender y medir
 *     3. Vera    · Pricing y oferta          · hito P8
 *     4. Sofi    · Filtrado de pacientes     · hito P8
 *     5. Ramiro  · Lectura de números        · hito P9A + 1 semana de métricas
 *     6. Lucas   · Consulta de venta (W)     · hito script_venta poblado
 *   Operar clientes
 *     7. Bruno   · Servicio post-venta       · hito P9B + P9C
 */
import type { ConfigAgente } from './types';
import { caro } from './caro';
import { mateo } from './mateo';
import { vera } from './vera';
import { sofi } from './sofi';
import { ramiro } from './ramiro';
import { lucas } from './lucas';
import { bruno } from './bruno';

export const AGENTES: ConfigAgente[] = [
  caro,
  mateo,
  vera,
  sofi,
  ramiro,
  lucas,
  bruno,
];

export type {
  ConfigAgente,
  MensajeAgente,
  AdnFieldKey,
  AgenteCategoria,
  QuickReplyEstructurado,
  LevelThresholds,
  AgenteSkillSnapshot,
} from './types';
export {
  getCompletadas,
  isPilarActive,
  isPilarCompletado,
  checkAgentUnlock,
} from './unlock';
export {
  parseScoreFromMessage,
  calcularNivel,
  calcularPromedio,
  buildSkillSnapshot,
  NIVEL_NOMBRE,
  SKILL_SNAPSHOT_EMPTY,
} from './skillProgress';
