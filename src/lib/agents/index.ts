/**
 * Los 8 entrenadores TCD · alineados al brief 13/05/2026 + voz Javo v4
 * + specs Diego v2 / Mateo v2 (junio 2026).
 *
 * Cada entrenador entrena UNA habilidad y se vuelve innecesario cuando el
 * sanador alcanza Nivel 4 (Autónomo). Filosofía rectora: "El mejor
 * entrenador es el que se vuelve innecesario".
 *
 * Categorías y orden visual:
 *   Producir y comunicar
 *     1. Caro    · Cámara y presencia        · hito P1+P2+P3
 *     2. Mateo   · Contenido viral (8 campos) · hito P9A
 *     3. Diego   · Constructor de producto    · hito P8 + las 4 ofertas listas
 *   Vender y medir
 *     4. Vera    · Pricing y oferta           · hito P8
 *     5. Sofi    · Filtrado de pacientes      · hito P8
 *     6. Ramiro  · Lectura de números         · hito P9A + 1 semana de métricas
 *     7. Lucas   · Consulta de venta (W)      · hito script_venta poblado
 *   Operar clientes
 *     8. Bruno   · Servicio post-venta        · hito P9B + P9C
 */
import type { ConfigAgente } from './types';
import { caro } from './caro';
import { mateo } from './mateo';
import { diego } from './diego';
import { vera } from './vera';
import { sofi } from './sofi';
import { ramiro } from './ramiro';
import { lucas } from './lucas';
import { bruno } from './bruno';

export const AGENTES: ConfigAgente[] = [
  caro,
  mateo,
  diego,
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
