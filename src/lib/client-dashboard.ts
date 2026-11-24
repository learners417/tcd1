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
  budget: number | null; // Micro-paso 0: Presupuesto (gasto)
  objectiveBudget: number | null; // Micro-paso 0: Presupuesto (objetivo)
  reach: number | null; // Micro-paso 1: Anuncio (alcance)
  comments: number | null; // Micro-paso 1: Anuncio (comentarios)
  conversations: number | null; // Micro-paso 2: Mensaje (conversaciones)
  callsTaken: number | null; // Micro-paso 4: Confirmación (llamadas tomadas)
  offers: number | null; // Micro-paso 5: Llamada (ofertas)
  sales: number | null; // Micro-paso 6: Cierre (ventas)
  collectedAmount: number | null; // Micro-paso 7: Cobro (cobrado)
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
    budget: profile.budget ?? null,
    objectiveBudget: profile.objective_budget ?? null,
    reach: profile.reach ?? null,
    comments: profile.comments ?? null,
    conversations: profile.conversations ?? null,
    callsTaken: profile.calls_taken ?? null,
    offers: profile.offers ?? null,
    sales: profile.sales ?? null,
    collectedAmount: profile.collected_amount ?? null,
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

    // Micro-paso 0: Presupuesto (gasto vs objetivo) -> Ramiro
    if (!diagnosis.bottleneck) {
      if (data.budget === null || data.objectiveBudget === null) {
        diagnosis.bottleneck = 'Falta de Datos: Presupuesto';
        diagnosis.area = 'Finanzas';
        diagnosis.coach = 'Ramiro';
        diagnosis.nextSteps.push('Asegurarse de que el presupuesto y el objetivo de gasto estén cargados.');
      } else if (data.budget > (data.objectiveBudget * 1.2)) { // Ejemplo: si gasta más del 20% del objetivo
        diagnosis.bottleneck = 'Presupuesto Excedido';
        diagnosis.area = 'Finanzas';
        diagnosis.coach = 'Ramiro';
        diagnosis.nextSteps.push(`El presupuesto (${data.budget}) excede el objetivo (${data.objectiveBudget}). Revisar la pauta publicitaria.`);
      }
    }

    // Micro-paso 1: Anuncio (alcance -> comentarios) -> Mateo / Caro
    if (!diagnosis.bottleneck) {
      if (data.reach === null || data.comments === null) {
        diagnosis.bottleneck = 'Falta de Datos: Anuncio';
        diagnosis.area = 'Marketing';
        diagnosis.coach = 'Mateo / Caro';
        diagnosis.nextSteps.push('Asegurarse de que el alcance y los comentarios del anuncio estén cargados.');
      } else if (data.reach > 1000 && data.comments === 0) { // Ejemplo: alto alcance sin comentarios
        diagnosis.bottleneck = 'Anuncio Poco Atractivo';
        diagnosis.area = 'Creatividad';
        diagnosis.coach = 'Mateo / Caro';
        diagnosis.nextSteps.push('El anuncio tiene buen alcance pero no genera comentarios. Revisar creativos y copy.');
      }
    }

    // Micro-paso 2: Mensaje (comentarios -> conversaciones) -> técnico
    if (!diagnosis.bottleneck) {
      if (data.comments === null || data.conversations === null) {
        diagnosis.bottleneck = 'Falta de Datos: Mensaje';
        diagnosis.area = 'Operaciones';
        diagnosis.coach = 'Dev'; // Asumiendo que 'técnico' es 'Dev'
        diagnosis.nextSteps.push('Asegurarse de que los comentarios y las conversaciones estén cargadas.');
      } else if (data.comments > 0 && data.conversations === 0) { // Ejemplo: comentarios pero sin conversaciones
        diagnosis.bottleneck = 'Fuga en Mensaje a Conversación';
        diagnosis.area = 'Automatización';
        diagnosis.coach = 'Dev';
        diagnosis.nextSteps.push('Hay comentarios pero no se inician conversaciones. Revisar automatizaciones de mensajes.');
      }
    }

    // Micro-paso 3: Conversación (conversaciones -> agendas) -> Sofi (ya implementado)
    if (!diagnosis.bottleneck) {
      if ((data.conversations ?? 0) > 0 && data.agendasCount === 0) {
        diagnosis.bottleneck = 'Conversación a Agendas';
        diagnosis.area = 'Setting';
        diagnosis.coach = 'Sofi';
        diagnosis.nextSteps.push(
          'El anuncio trae gente, pero no se están agendando citas. Revisar la conversación en DM.',
          'Pedir tres conversaciones completas para analizar el setting.'
        );
      }
    }

    // Micro-paso 4: Confirmación (agendas -> llamadas tomadas) -> Sofi
    if (!diagnosis.bottleneck) {
      if (data.agendasCount === null || data.callsTaken === null) {
        diagnosis.bottleneck = 'Falta de Datos: Confirmación';
        diagnosis.area = 'Setting';
        diagnosis.coach = 'Sofi';
        diagnosis.nextSteps.push('Asegurarse de que las agendas y llamadas tomadas estén cargadas.');
      } else if (data.agendasCount > 0 && data.callsTaken === 0) { // Ejemplo: agendas pero sin llamadas tomadas
        diagnosis.bottleneck = 'Fuga en Agendas a Llamadas';
        diagnosis.area = 'Setting';
        diagnosis.coach = 'Sofi';
        diagnosis.nextSteps.push('Hay citas agendadas pero no se toman las llamadas. Revisar proceso de confirmación y recordatorios.');
      }
    }

    // Micro-paso 5: Llamada (llamadas -> ofertas) -> Diego
    if (!diagnosis.bottleneck) {
      if (data.callsTaken === null || data.offers === null) {
        diagnosis.bottleneck = 'Falta de Datos: Ofertas';
        diagnosis.area = 'Venta';
        diagnosis.coach = 'Diego';
        diagnosis.nextSteps.push('Asegurarse de que las llamadas tomadas y las ofertas realizadas estén cargadas.');
      } else if (data.callsTaken > 0 && data.offers === 0) { // Ejemplo: llamadas pero sin ofertas
        diagnosis.bottleneck = 'Fuga en Llamada a Oferta';
        diagnosis.area = 'Venta';
        diagnosis.coach = 'Diego';
        diagnosis.nextSteps.push('Se toman llamadas pero no se hacen ofertas. Revisar guion de venta y calificación de prospectos.');
      }
    }

    // Micro-paso 6: Cierre (ofertas -> ventas) -> Diego
    if (!diagnosis.bottleneck) {
      if (data.offers === null || data.sales === null) {
        diagnosis.bottleneck = 'Falta de Datos: Ventas';
        diagnosis.area = 'Venta';
        diagnosis.coach = 'Diego';
        diagnosis.nextSteps.push('Asegurarse de que las ofertas y las ventas estén cargadas.');
      } else if (data.offers > 0 && data.sales === 0) { // Ejemplo: ofertas pero sin ventas
        diagnosis.bottleneck = 'Fuga en Ofertas a Cierre';
        diagnosis.area = 'Venta';
        diagnosis.coach = 'Diego';
        diagnosis.nextSteps.push('Se hacen ofertas pero no se cierran ventas. Revisar objeciones y proceso de cierre.');
      }
    }

    // Micro-paso 7: Cobro (ventas -> cobrado) -> Bruno
    if (!diagnosis.bottleneck) {
      if (data.sales === null || data.collectedAmount === null) {
        diagnosis.bottleneck = 'Falta de Datos: Cobro';
        diagnosis.area = 'Finanzas';
        diagnosis.coach = 'Bruno';
        diagnosis.nextSteps.push('Asegurarse de que las ventas y el monto cobrado estén cargados.');
      } else if (data.sales > 0 && data.collectedAmount === 0) { // Ejemplo: ventas pero sin cobros
        diagnosis.bottleneck = 'Fuga en Ventas a Cobro';
        diagnosis.area = 'Finanzas';
        diagnosis.coach = 'Bruno';
        diagnosis.nextSteps.push('Se cierran ventas pero no se cobra el dinero. Revisar proceso de cobro y seguimiento.');
      }
    }

    // Default if no specific bottleneck found yet for launched clients
    if (!diagnosis.bottleneck) {
      diagnosis.statusMessage += " La app no tiene suficientes datos para un diagnóstico específico.";
      diagnosis.nextSteps.push("Asegurarse de que todos los números están cargados (conversaciones, gasto, etc.).");
    }
  }

  if (diagnosis.nextSteps.length === 0) {
    diagnosis.nextSteps.push("No hay pasos inmediatos detectados, todo parece en orden o faltan más datos.");
  }


  return diagnosis;
}
