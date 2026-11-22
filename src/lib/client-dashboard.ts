import type { ProfileV2 } from './supabase'; // Assuming ProfileV2 is defined here

export type CampaignStatus = 'installing' | 'launched';

export interface ClientDashboardData {
  id: string;
  email: string;
  nombre: string;
  campaignStatus: CampaignStatus;
  launchedAt: Date | null;
  agendasCount: number;
  processedAppointmentIds: string[];
  // Add other relevant profile fields here as needed for the dashboard
  planComercial: string | null;
  // ...
}

export interface PartialDiagnosis {
  statusMessage: string;
  nextSteps: string[];
  bottleneck: string | null;
  area: string | null; // e.g., 'setting', 'tecnico', 'venta'
  coach: string | null; // e.g., 'Sofi', 'Javo', 'dev'
}

/**
 * Consolidates client data for the unified dashboard.
 * Infers campaignStatus if not explicitly set based on launchedAt.
 */
export function getClientDashboardData(profile: ProfileV2): ClientDashboardData {
  const launchedAt = profile.launched_at ? new Date(profile.launched_at) : null;
  const campaignStatus: CampaignStatus = profile.campaign_status === 'launched' || (launchedAt && launchedAt.getTime() < Date.now())
    ? 'launched'
    : 'installing';

  return {
    id: profile.id,
    email: profile.email,
    nombre: profile.nombre || 'Cliente',
    campaignStatus,
    launchedAt,
    agendasCount: profile.agendas_count ?? 0,
    processedAppointmentIds: (profile.processed_appointment_ids as string[] | null) ?? [],
    planComercial: profile.plan_comercial ?? null,
    // Map other profile fields as needed
  };
}

/**
 * Generates a partial diagnosis based on the consolidated dashboard data.
 * This logic is based on the PLAN-SUPERVISOR.md and PLAN-CIRCUITO.md micro-steps.
 */
export function getPartialDiagnosis(data: ClientDashboardData): PartialDiagnosis {
  const diagnosis: PartialDiagnosis = {
    statusMessage: '',
    nextSteps: [],
    bottleneck: null,
    area: null,
    coach: null,
  };

  if (data.campaignStatus === 'installing') {
    diagnosis.statusMessage = `${data.nombre} está instalando su campaña.`;
    diagnosis.bottleneck = 'Instalación de Campaña';
    diagnosis.area = 'Activación';
    diagnosis.coach = 'Javo'; // Or specific activation coach
    diagnosis.nextSteps.push('Revisar checklist de activación y ver qué falta.');
    // More specific steps can be added based on activation checklist progress
  } else if (data.campaignStatus === 'launched') {
    diagnosis.statusMessage = `${data.nombre} está lanzada desde ${data.launchedAt?.toLocaleDateString() ?? 'fecha no especificada'}.`;

    // Micro-paso 3: Conversación -> Agendas (si falla, es "setting")
    if (data.agendasCount === 0) { // Simplistic check, real impl would compare against expected conversion rate
      diagnosis.bottleneck = 'Conversación a Agendas';
      diagnosis.area = 'Setting';
      diagnosis.coach = 'Sofi';
      diagnosis.nextSteps.push(
        'El anuncio trae gente, pero no se están agendando citas. Revisar la conversación en DM.',
        'Pedir tres conversaciones completas para analizar el setting.'
      );
    }
    // More micro-steps and their corresponding diagnosis logic would go here
    // based on PLAN-SUPERVISOR.md:
    // 0: Presupuesto (gasto vs objetivo) -> Ramiro
    // 1: Anuncio (alcance -> comentarios) -> Mateo / Caro
    // 2: Mensaje (comentarios -> conversaciones) -> técnico
    // 3: Conversación (conversaciones -> agendas) -> Sofi (Implemented above)
    // 4: Confirmación (agendas -> llamadas tomadas) -> Sofi
    // 5: Llamada (llamadas -> ofertas) -> Diego
    // 6: Cierre (ofertas -> ventas) -> Diego
    // 7: Cobro (ventas -> cobrado) -> Bruno

    // Default if no specific bottleneck found yet for launched clients
    if (!diagnosis.bottleneck) {
        diagnosis.statusMessage += " La app no tiene suficientes datos para un diagnóstico específico."
        diagnosis.nextSteps.push("Asegurarse de que todos los números están cargados (conversaciones, gasto, etc.).");
    }
  }

  if (diagnosis.nextSteps.length === 0) {
      diagnosis.nextSteps.push("No hay pasos inmediatos detectados, todo parece en orden o faltan más datos.");
  }


  return diagnosis;
}
