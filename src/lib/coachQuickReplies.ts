/**
 * Quick replies dinámicos para el Coach IA · cambian según el pilar activo
 * del sanador y condiciones especiales (días de atraso · nivel 4 alcanzado · etc).
 *
 * Brief 13/05/2026: el Coach IA muestra hasta 6 quick replies abajo de la
 * conversación · combinando:
 *   - 3 condicionales (solo si aplican)
 *   - 0-3 dinámicos por pilar
 *   - 3 fijos (siempre presentes al final)
 *
 * Resultado · slice a 6.
 */
import type { PilarId } from './supabase';

export interface CoachQuickReply {
  id: string;
  icon?: string;
  label: string;
}

export interface CoachQuickReplyContext {
  pilarActivo: PilarId | null;
  diasAtraso: number;
  diasSinEntrar: number;
  alcanzoNivel4EstaSemana: boolean;
  diasSinMetricas: number; // 999 si nunca cargó
}

const FIJOS: CoachQuickReply[] = [
  { id: 'continuar', label: 'Seguimos donde quedamos' },
  { id: 'progreso', label: '¿Cómo vengo? Mi progreso real' },
  { id: 'duda', label: 'Tengo una duda' },
];

const PILAR_QUICK_REPLIES: Record<PilarId, CoachQuickReply[]> = {
  P0: [
    { id: 'p0_objetivo', label: 'Definamos mi objetivo' },
    { id: 'p0_punto_partida', label: 'Ver mi punto de partida real' },
    { id: 'p0_app', label: '¿Cómo se usa esta app?' },
  ],
  P1: [
    { id: 'p1_revisar_historia', label: 'Revisa mi historia — sin filtro' },
    { id: 'p1_trabada_historia', label: 'Estoy trabada con mi historia' },
    { id: 'p1_historia_contenido', label: '¿Cómo uso mi historia en contenido?' },
  ],
  P2: [
    { id: 'p2_revisar_proposito', label: 'Revisemos mi propósito' },
    { id: 'p2_proposito_filtra', label: '¿Mi propósito filtra bien?' },
    { id: 'p2_no_encuentro', label: 'No encuentro mi propósito' },
  ],
  P3: [
    { id: 'p3_revisar_legado', label: 'Revisemos mi legado a 10 años' },
    { id: 'p3_legado_honesto', label: '¿Es honesto mi legado?' },
    { id: 'p3_no_imagino', label: 'No imagino mi legado' },
  ],
  P4: [
    { id: 'p4_avatar_bien', label: '¿Mi avatar está bien definido?' },
    { id: 'p4_no_claro', label: 'No tengo claro mi avatar' },
    { id: 'p4_validar_casos', label: 'Validar avatar contra casos reales' },
  ],
  P5: [
    { id: 'p5_puv', label: '¿Mi PUV es clara?' },
    { id: 'p5_nicho', label: '¿Mi nicho es suficientemente específico?' },
    { id: 'p5_transformaciones', label: '¿Mis transformaciones son creíbles?' },
  ],
  P6: [
    { id: 'p6_duele', label: '¿Mi matriz duele lo suficiente?' },
    { id: 'p6_revisar_matriz', label: 'Revisemos infierno · obstáculos · cielo' },
    { id: 'p6_no_sale', label: 'No me sale armar la matriz' },
  ],
  P7: [
    { id: 'p7_nombre_metodo', label: '¿El nombre de mi método funciona?' },
    { id: 'p7_pasos', label: '¿Los pasos están bien?' },
    { id: 'p7_practicar_vera', label: 'Practicar pricing con Vera' },
  ],
  P8: [
    { id: 'p8_3_ofertas', label: '¿Mis 3 ofertas son coherentes?' },
    { id: 'p8_precio', label: '¿Mi precio sostiene?' },
    { id: 'p8_lead_magnet', label: '¿Mi regalo gratuito es buen entry?' },
  ],
  P9A: [
    { id: 'p9a_landing', label: 'Revisar mi landing antes de publicar' },
    { id: 'p9a_numeros_ramiro', label: 'Practicar con Ramiro mis números' },
    { id: 'p9a_pauta', label: '¿Estoy lista para activar pauta?' },
  ],
  P9B: [
    { id: 'p9b_practicar_w', label: 'Practicar la W con Lucas' },
    { id: 'p9b_practicar_sofi', label: 'Practicar filtrado con Sofi' },
    { id: 'p9b_objecion', label: '¿Cómo manejo la primera objeción?' },
  ],
  P9C: [
    { id: 'p9c_secuencia', label: 'Revisar mi secuencia de seguimiento' },
    { id: 'p9c_no_cerraron', label: 'Las consultas que no cerraron · revisemos' },
    { id: 'p9c_primer_mes', label: 'Mi primer mes de consultas · ¿qué viste?' },
  ],
  P10: [
    { id: 'p10_sistema_visual', label: 'Revisar mi sistema visual' },
    { id: 'p10_feed', label: '¿Mi muro es coherente?' },
    { id: 'p10_paleta', label: 'No sé qué paleta usar' },
  ],
  P11: [
    { id: 'p11_retro', label: 'Iniciar retrospectiva' },
    { id: 'p11_plan_proximo', label: 'Plan próximo mes' },
    { id: 'p11_replicar', label: '¿Qué replicar · cambiar · cortar?' },
  ],
};

function buildCondicionales(ctx: CoachQuickReplyContext): CoachQuickReply[] {
  const result: CoachQuickReply[] = [];

  if (ctx.diasAtraso > 7) {
    result.push({
      id: 'cond_atraso',
      label: 'Vengo atrasada — ayúdame a retomar',
    });
  }

  if (ctx.diasSinEntrar >= 5) {
    result.push({
      id: 'cond_volvi',
      label: 'Volví después de unos días',
    });
  }

  if (ctx.alcanzoNivel4EstaSemana) {
    result.push({
      id: 'cond_autonoma',
      label: 'Logré algo grande esta semana',
    });
  }

  if (ctx.diasSinMetricas > 7) {
    result.push({
      id: 'cond_metricas',
      label: '¿Cómo vengo en mi camino?',
    });
  }

  return result;
}

export function getCoachQuickReplies(ctx: CoachQuickReplyContext): CoachQuickReply[] {
  const sesion = sesionDeHoy();
  const propios: CoachQuickReply[] = [];
  if (sesion) propios.push({ id: 'profundizar', label: `Profundizar mi sesión: ${sesion}` });
  propios.push({ id: 'precio', label: 'Se me mueve algo con mi precio' });
  propios.push({ id: 'roleplay', label: 'Hazme de paciente: dime «está caro»' });
  // Si algo urgente aplica (atraso, vuelve después de días), entra primero.
  const condicionales = buildCondicionales(ctx);
  return [...condicionales, ...propios].slice(0, 3);
}

/** La última sesión que cerró en su Camino — para llamarla por su nombre. */
function sesionDeHoy(): string | null {
  try {
    const ult = JSON.parse(localStorage.getItem('tcd_ultima_sesion_v1') ?? 'null') as { titulo?: string } | null;
    const t = String(ult?.titulo ?? '').trim();
    return t ? (t.length > 34 ? t.slice(0, 32) + '…' : t) : null;
  } catch { return null; }
}

export { PILAR_QUICK_REPLIES, FIJOS };
