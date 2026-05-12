/**
 * Los 6 agentes IA de TCD · alineados a la voz Javo v4.
 *
 * Orden visual en el grid (sigue el orden cronológico del roadmap):
 *   1. Caro    · P3 · Cámara
 *   2. Elena   · P4 · Stories
 *   3. Mateo   · P6 · Contenido
 *   4. Sofi    · P9A · Setter
 *   5. Ramiro  · P9A · Embudo
 *   6. Lucas   · P9B · Consulta
 */
import type { ConfigAgente } from './types';
import { caro } from './caro';
import { elena } from './elena';
import { mateo } from './mateo';
import { sofi } from './sofi';
import { ramiro } from './ramiro';
import { lucas } from './lucas';

export const AGENTES: ConfigAgente[] = [caro, elena, mateo, sofi, ramiro, lucas];

export type { ConfigAgente, MensajeAgente, AdnFieldKey } from './types';
export { getCompletadas, isPilarActive } from './unlock';
