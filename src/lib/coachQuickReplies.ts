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
  icon: string;
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
  { id: 'continuar', icon: '💬', label: 'Seguimos donde quedamos' },
  { id: 'progreso', icon: '📈', label: '¿Cómo vengo? Mi progreso real' },
  { id: 'duda', icon: '❓', label: 'Tengo una duda' },
];

const PILAR_QUICK_REPLIES: Record<PilarId, CoachQuickReply[]> = {
  P0: [
    { id: 'p0_objetivo', icon: '🎯', label: 'Definamos mi objetivo' },
    { id: 'p0_punto_partida', icon: '📍', label: 'Ver mi punto de partida real' },
    { id: 'p0_app', icon: '🗺', label: '¿Cómo se usa esta app?' },
  ],
  P1: [
    { id: 'p1_revisar_historia', icon: '✍️', label: 'Revisa mi historia — sin filtro' },
    { id: 'p1_trabada_historia', icon: '🤔', label: 'Estoy trabada con mi historia' },
    { id: 'p1_historia_contenido', icon: '🎬', label: '¿Cómo uso mi historia en contenido?' },
  ],
  P2: [
    { id: 'p2_revisar_proposito', icon: '🧭', label: 'Revisemos mi propósito' },
    { id: 'p2_proposito_filtra', icon: '🔍', label: '¿Mi propósito filtra bien?' },
    { id: 'p2_no_encuentro', icon: '😕', label: 'No encuentro mi propósito' },
  ],
  P3: [
    { id: 'p3_revisar_legado', icon: '🌳', label: 'Revisemos mi legado a 10 años' },
    { id: 'p3_legado_honesto', icon: '🪞', label: '¿Es honesto mi legado?' },
    { id: 'p3_no_imagino', icon: '😶', label: 'No imagino mi legado' },
  ],
  P4: [
    { id: 'p4_avatar_bien', icon: '🧑‍⚕️', label: '¿Mi avatar está bien definido?' },
    { id: 'p4_no_claro', icon: '🤷', label: 'No tengo claro mi avatar' },
    { id: 'p4_validar_casos', icon: '📋', label: 'Validar avatar contra casos reales' },
  ],
  P5: [
    { id: 'p5_puv', icon: '💡', label: '¿Mi PUV es clara?' },
    { id: 'p5_nicho', icon: '🎯', label: '¿Mi nicho es suficientemente específico?' },
    { id: 'p5_transformaciones', icon: '🔄', label: '¿Mis transformaciones son creíbles?' },
  ],
  P6: [
    { id: 'p6_duele', icon: '🩹', label: '¿Mi matriz duele lo suficiente?' },
    { id: 'p6_revisar_matriz', icon: '🔥', label: 'Revisemos infierno · obstáculos · cielo' },
    { id: 'p6_no_sale', icon: '😩', label: 'No me sale armar la matriz' },
  ],
  P7: [
    { id: 'p7_nombre_metodo', icon: '🏷', label: '¿El nombre de mi método funciona?' },
    { id: 'p7_pasos', icon: '🔢', label: '¿Los pasos están bien?' },
    { id: 'p7_practicar_vera', icon: '💰', label: 'Practicar pricing con Vera' },
  ],
  P8: [
    { id: 'p8_3_ofertas', icon: '🪜', label: '¿Mis 3 ofertas son coherentes?' },
    { id: 'p8_precio', icon: '💵', label: '¿Mi precio sostiene?' },
    { id: 'p8_lead_magnet', icon: '🎁', label: '¿Mi regalo gratuito es buen entry?' },
  ],
  P9A: [
    { id: 'p9a_landing', icon: '🌐', label: 'Revisar mi landing antes de publicar' },
    { id: 'p9a_numeros_ramiro', icon: '📊', label: 'Practicar con Ramiro mis números' },
    { id: 'p9a_pauta', icon: '🚀', label: '¿Estoy lista para activar pauta?' },
  ],
  P9B: [
    { id: 'p9b_practicar_w', icon: '📞', label: 'Practicar la W con Lucas' },
    { id: 'p9b_practicar_sofi', icon: '💬', label: 'Practicar filtrado con Sofi' },
    { id: 'p9b_objecion', icon: '🛡', label: '¿Cómo manejo la primera objeción?' },
  ],
  P9C: [
    { id: 'p9c_secuencia', icon: '📧', label: 'Revisar mi secuencia de seguimiento' },
    { id: 'p9c_no_cerraron', icon: '🪞', label: 'Las consultas que no cerraron · revisemos' },
    { id: 'p9c_primer_mes', icon: '🗓', label: 'Mi primer mes de consultas · ¿qué viste?' },
  ],
  P10: [
    { id: 'p10_sistema_visual', icon: '🎨', label: 'Revisar mi sistema visual' },
    { id: 'p10_feed', icon: '🖼', label: '¿Mi muro es coherente?' },
    { id: 'p10_paleta', icon: '🌈', label: 'No sé qué paleta usar' },
  ],
  P11: [
    { id: 'p11_retro', icon: '📅', label: 'Iniciar retrospectiva' },
    { id: 'p11_plan_proximo', icon: '➡️', label: 'Plan próximo mes' },
    { id: 'p11_replicar', icon: '🔁', label: '¿Qué replicar · cambiar · cortar?' },
  ],
};

function buildCondicionales(ctx: CoachQuickReplyContext): CoachQuickReply[] {
  const result: CoachQuickReply[] = [];

  if (ctx.diasAtraso > 7) {
    result.push({
      id: 'cond_atraso',
      icon: '⚠️',
      label: 'Profundizar mi sesión de hoy',
    });
  }

  if (ctx.diasSinEntrar >= 5) {
    result.push({
      id: 'cond_volvi',
      icon: '👋',
      label: 'Se me mueve algo con mi precio',
    });
  }

  if (ctx.alcanzoNivel4EstaSemana) {
    result.push({
      id: 'cond_autonoma',
      icon: '🎉',
      label: 'Hazme de paciente: dime \"está caro\"',
    });
  }

  if (ctx.diasSinMetricas > 7) {
    result.push({
      id: 'cond_metricas',
      icon: '📊',
      label: '¿Cómo vengo en mi camino?',
    });
  }

  return result;
}

export function getCoachQuickReplies(ctx: CoachQuickReplyContext): CoachQuickReply[] {
  const condicionales = buildCondicionales(ctx);
  const dinamicos = ctx.pilarActivo ? PILAR_QUICK_REPLIES[ctx.pilarActivo] ?? [] : [];
  // Orden de prioridad: condicionales primero · luego dinámicos · luego fijos.
  // Slice a 6 para no saturar la UI.
  return [...condicionales, ...dinamicos, ...FIJOS].slice(0, 6);
}

export { PILAR_QUICK_REPLIES, FIJOS };
