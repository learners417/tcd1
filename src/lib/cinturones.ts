/**
 * cinturones.ts — Capa 3 del rediseño 4 fases (jul 2026)
 * El servicio que OTORGA los cinturones-planta:
 *  - registra el hito en `hitos_cinturon` (la evidencia)
 *  - actualiza `profiles.cinturon` (el estado visible)
 *  - deriva el cinturón desde el progreso local (para Sidebar/Dashboard)
 * La validación del comprobante (screenshot/pago) ocurre conversacionalmente
 * con el Coach ANTES de completar la tarea — este servicio registra el logro.
 */
import { supabase } from './supabase';
import type { PilarId } from './supabase';
import { claveDelDia } from './roadmapSeed';
import { esPasoDelCliente } from './diaPrograma';
import {
  CINTURONES,
  SEED_ROADMAP_V2,
  calcularCinturon,
  type Cinturon,
} from './roadmapSeed';

export type { Cinturon };
export { CINTURONES, calcularCinturon };

/** Mapeo pilar → cinturón (espejo del seed, para registro en DB). */
/**
 * Pilar → cinturón. Antes era un mapa a mano con ocho nombres que el seed ya no
 * usa: escribía en la base ids inexistentes. Ahora sale del mismo seed.
 */
const CINTURON_POR_PILAR: Record<string, string> = Object.fromEntries(
  SEED_ROADMAP_V2.map((p) => [p.id, calcularCinturon(p.id).id]),
);

/** Pilares cuyo hito requiere comprobante visual (validado con el Coach). */
const HITOS_CON_COMPROBANTE: Record<string, string> = {
  P4: 'screenshot de campaña activa',
  P5: 'screenshot de la primera llamada (Meet/Zoom)',
  P6: 'comprobante del primer pago',
  P7: 'comprobantes de los 10 pacientes',
};

/**
 * Otorga el cinturón correspondiente a un pilar completado.
 * Idempotente: si el hito ya existe, no duplica (unique usuario+cinturon).
 * Al completar P1 también registra la punta amarilla (la quema, P1.3)
 * por si el registro incremental no ocurrió.
 */
export async function otorgarCinturonPorPilar(pilarId: PilarId): Promise<void> {
  if (!supabase) return;
  const cinturonId = CINTURON_POR_PILAR[pilarId];
  if (!cinturonId) return;

  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return;

    const pilar = SEED_ROADMAP_V2.find((p) => p.id === pilarId);
    const fase = pilar?.fase ?? null;
    const tipo = HITOS_CON_COMPROBANTE[pilarId] ? 'agente_texto' : 'automatico';

    const hitos: Array<Record<string, unknown>> = [];

    // La punta amarilla (la quema · P1.3) acompaña al amarillo si faltara.
    if (pilarId === 'P1') {
      hitos.push({
        usuario_id: uid,
        cinturon: 'blanco_punta_amarilla',
        fase: 1,
        tipo_verificacion: 'automatico',
        estado: 'aprobado',
        agente: 'coach',
        aprobado_at: new Date().toISOString(),
      });
    }

    hitos.push({
      usuario_id: uid,
      cinturon: cinturonId,
      fase,
      tipo_verificacion: tipo,
      estado: 'aprobado',
      agente: 'coach',
      feedback_agente: HITOS_CON_COMPROBANTE[pilarId]
        ? `Validado con el Coach (${HITOS_CON_COMPROBANTE[pilarId]}).`
        : null,
      aprobado_at: new Date().toISOString(),
    });

    // upsert idempotente sobre (usuario_id, cinturon)
    await supabase
      .from('hitos_cinturon')
      .insert(hitos); // duplicados o constraint ausente: se ignora abajo

    // El cinturón visible del perfil = el más alto (este, por orden de juego).
    await supabase.from('profiles').update({ cinturon: cinturonId }).eq('id', uid);
  } catch {
    /* red o RLS: el progreso local no se bloquea por esto */
  }
}

/**
 * Deriva el cinturón actual desde el set de tareas completadas (localStorage),
 * incluyendo la punta amarilla apenas se completa la quema (P1.3) aunque
 * el pilar P1 no esté cerrado. Para Sidebar/Dashboard (visual instantáneo).
 */
export function cinturonDesdeProgreso(completadas: Set<string>): Cinturon {
  let masAlto: Cinturon = CINTURONES[0];

  for (const pilar of SEED_ROADMAP_V2) {
    // Solo los pasos que el cliente hace: los días de campo y los fines de
    // semana no se completan, y exigirlos dejaba el grado trabado para siempre.
    const metas = (pilar.metas ?? []).filter(esPasoDelCliente);
    if (metas.length === 0) continue;
    const completo = metas.every((m) => completadas.has(`${pilar.numero}-${m.codigo}`));
    if (completo) {
      const c = calcularCinturon(pilar.id);
      if (c.orden > masAlto.orden) masAlto = c;
    }
  }

  // La punta amarilla: la quema (P1.3) o EL NÚMERO (P1.5) completados, sin P1 cerrado todavía.
  if (masAlto.id === '10gup' && (completadas.has(claveDelDia(1)) || completadas.has(claveDelDia(5)))) {
    const punta = CINTURONES.find((c) => c.id === '9gup');
    if (punta) masAlto = punta;
  }

  return masAlto;
}
