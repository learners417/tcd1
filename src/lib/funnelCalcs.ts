/**
 * funnelCalcs.ts — Cálculos automáticos del embudo de ventas
 *
 * 9 campos manuales (MetricaSemanaV2) → 8 KPIs calculados → 6 diagnósticos
 */
import type { MetricaSemanaV2 } from './supabase';

// ─── 8 KPIs calculados ─────────────────────────────────────────────────────

export interface FunnelKPIs {
  costo_por_mensaje: number | null;
  pct_dm_formulario: number | null;
  pct_formulario_agenda: number | null;
  pct_show: number | null;
  tasa_cierre: number | null;
  cpv: number | null;           // costo por venta
  phr: number | null;           // pesos por hora real
  proyeccion_mensual: number | null;
}

export function calcularFunnelKPIs(m: MetricaSemanaV2, ticketPromedio?: number): FunnelKPIs {
  const safe = (num: number, den: number) => den > 0 ? num / den : null;

  const costo_por_mensaje = safe(m.gasto_ads, m.mensajes_recibidos);
  const pct_dm_formulario = safe(m.formularios_completados, m.mensajes_recibidos);
  const pct_formulario_agenda = safe(m.agendados, m.formularios_completados);
  const pct_show = safe(m.shows, m.agendados);
  const tasa_cierre = safe(m.ventas_cerradas, m.llamadas_tomadas);
  const cpv = safe(m.gasto_ads, m.ventas_cerradas);
  const horasMensuales = m.horas_trabajadas_semana * 4.33;
  const phr = horasMensuales > 0 ? m.ingresos_cobrados / horasMensuales : null;
  const ticket = ticketPromedio ?? (m.ventas_cerradas > 0 ? m.ingresos_cobrados / m.ventas_cerradas : 0);
  const proyeccion_mensual = m.ventas_cerradas * 4.33 * ticket;

  return {
    costo_por_mensaje,
    pct_dm_formulario,
    pct_formulario_agenda,
    pct_show,
    tasa_cierre,
    cpv,
    phr,
    proyeccion_mensual,
  };
}

// ─── 6 Diagnósticos automáticos ─────────────────────────────────────────────

export type DiagnosticoNivel = 'ok' | 'alerta' | 'critico';

export interface Diagnostico {
  etapa: string;
  mensaje: string;
  nivel: DiagnosticoNivel;
  valor: number | null;
  umbral_ok: number;
  umbral_alerta: number;
}

export function diagnosticarEmbudo(kpis: FunnelKPIs): Diagnostico[] {
  const diagnosticos: Diagnostico[] = [];

  // 1. Costo por mensaje
  if (kpis.costo_por_mensaje !== null) {
    const nivel: DiagnosticoNivel =
      kpis.costo_por_mensaje <= 1.5 ? 'ok' :
      kpis.costo_por_mensaje <= 3 ? 'alerta' : 'critico';
    diagnosticos.push({
      etapa: 'Costo por Mensaje',
      mensaje: nivel === 'ok' ? 'Buen costo de adquisición de mensajes'
        : nivel === 'alerta' ? 'El costo por mensaje está subiendo. Revisa tus creativos.'
        : 'Costo por mensaje muy alto. Pausa y revisa la segmentación.',
      nivel,
      valor: kpis.costo_por_mensaje,
      umbral_ok: 1.5,
      umbral_alerta: 3,
    });
  }

  // 2. DM → Formulario
  if (kpis.pct_dm_formulario !== null) {
    const pct = kpis.pct_dm_formulario * 100;
    const nivel: DiagnosticoNivel =
      pct >= 40 ? 'ok' : pct >= 20 ? 'alerta' : 'critico';
    diagnosticos.push({
      etapa: 'DM → Formulario',
      mensaje: nivel === 'ok' ? 'Buena conversión de mensajes a formularios'
        : nivel === 'alerta' ? 'Pocos completan el formulario. Revisa el copy del mensaje automático.'
        : 'Muy pocos pasan a formulario. El mensaje inicial no engancha.',
      nivel,
      valor: pct,
      umbral_ok: 40,
      umbral_alerta: 20,
    });
  }

  // 3. Formulario → Agenda
  if (kpis.pct_formulario_agenda !== null) {
    const pct = kpis.pct_formulario_agenda * 100;
    const nivel: DiagnosticoNivel =
      pct >= 50 ? 'ok' : pct >= 30 ? 'alerta' : 'critico';
    diagnosticos.push({
      etapa: 'Formulario → Agenda',
      mensaje: nivel === 'ok' ? 'Buen ratio de agendamiento'
        : nivel === 'alerta' ? 'Pocos agendan después del formulario. Revisa el proceso de seguimiento.'
        : 'Problema serio de agendamiento. ¿Estás llamando rápido?',
      nivel,
      valor: pct,
      umbral_ok: 50,
      umbral_alerta: 30,
    });
  }

  // 4. Show rate
  if (kpis.pct_show !== null) {
    const pct = kpis.pct_show * 100;
    const nivel: DiagnosticoNivel =
      pct >= 70 ? 'ok' : pct >= 50 ? 'alerta' : 'critico';
    diagnosticos.push({
      etapa: 'Tasa de Show',
      mensaje: nivel === 'ok' ? 'Buena asistencia a llamadas'
        : nivel === 'alerta' ? 'Muchos no se presentan. Manda recordatorios 24 h y 2 h antes.'
        : 'Tasa de show muy baja. El lead no siente urgencia. Revisa tu confirmación.',
      nivel,
      valor: pct,
      umbral_ok: 70,
      umbral_alerta: 50,
    });
  }

  // 5. Tasa de cierre
  if (kpis.tasa_cierre !== null) {
    const pct = kpis.tasa_cierre * 100;
    const nivel: DiagnosticoNivel =
      pct >= 25 ? 'ok' : pct >= 15 ? 'alerta' : 'critico';
    diagnosticos.push({
      etapa: 'Tasa de Cierre',
      mensaje: nivel === 'ok' ? 'Buen cierre de ventas'
        : nivel === 'alerta' ? 'Cerrás pocas llamadas. Practicá con el Simulador de Ventas.'
        : 'Tasa de cierre muy baja. Revisa tu script y el manejo de objeciones.',
      nivel,
      valor: pct,
      umbral_ok: 25,
      umbral_alerta: 15,
    });
  }

  // 6. CPV (costo por venta)
  if (kpis.cpv !== null) {
    const nivel: DiagnosticoNivel =
      kpis.cpv <= 100 ? 'ok' : kpis.cpv <= 250 ? 'alerta' : 'critico';
    diagnosticos.push({
      etapa: 'Costo por Venta',
      mensaje: nivel === 'ok' ? 'Buen retorno sobre inversión publicitaria'
        : nivel === 'alerta' ? 'CPV subiendo. Optimizá el embudo o aumentá el ticket.'
        : 'CPV insostenible. Necesitás revisar todo el embudo.',
      nivel,
      valor: kpis.cpv,
      umbral_ok: 100,
      umbral_alerta: 250,
    });
  }

  return diagnosticos;
}

// ─── Helpers de formato ─────────────────────────────────────────────────────

export function formatPct(val: number | null): string {
  if (val === null) return '—';
  return `${val.toFixed(1)}%`;
}

export function formatCurrency(val: number | null): string {
  if (val === null) return '—';
  return `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatNumber(val: number | null, decimals = 1): string {
  if (val === null) return '—';
  return val.toFixed(decimals);
}

export function nivelColor(nivel: DiagnosticoNivel): string {
  switch (nivel) {
    case 'ok': return 'text-success';
    case 'alerta': return 'text-gold';
    case 'critico': return 'text-danger';
  }
}

export function nivelBgColor(nivel: DiagnosticoNivel): string {
  switch (nivel) {
    case 'ok': return 'bg-success/10 border-success/20';
    case 'alerta': return 'bg-gold/10 border-gold/20';
    case 'critico': return 'bg-danger/10 border-danger/20';
  }
}

// ─── Empty metrics ──────────────────────────────────────────────────────────

export const EMPTY_METRICAS: MetricaSemanaV2 = {
  user_id: '',
  semana: '',
  gasto_ads: 0,
  mensajes_recibidos: 0,
  formularios_completados: 0,
  agendados: 0,
  shows: 0,
  llamadas_tomadas: 0,
  ventas_cerradas: 0,
  ingresos_cobrados: 0,
  horas_trabajadas_semana: 0,
};

// ════════════════════════════════════════════════════════════════════════════
//  v3 · Embudo del spec "Mi Embudo de Ventas · Métricas"
//  Bloque A (orgánico) + Bloque B (ads) → 8 KPIs. ROAS y proyección también se
//  calculan server-side al guardar (trigger); estas fórmulas son su espejo.
// ════════════════════════════════════════════════════════════════════════════

/** Plataformas de posts del bloque A (orgánico). Mapean 1:1 a columnas met_posts_*. */
export const POSTS_PLATAFORMAS: { key: keyof MetricaSemanaV2; label: string }[] = [
  { key: 'met_posts_reels_ig', label: 'Reels IG' },
  { key: 'met_posts_feed_ig', label: 'IG feed' },
  { key: 'met_posts_tiktok', label: 'TikTok' },
  { key: 'met_posts_shorts', label: 'YouTube Shorts' },
  { key: 'met_posts_facebook', label: 'Facebook' },
  { key: 'met_posts_linkedin', label: 'LinkedIn' },
];

/** Opciones del selector único de plataforma de ads (bloque B). */
export const ADS_PLATAFORMAS = ['Meta (IG/FB)', 'TikTok Ads', 'Google Ads', 'Sin ads'] as const;
export type AdsPlataforma = (typeof ADS_PLATAFORMAS)[number];

export interface EmbudoV3KPIs {
  roas: number | null;
  tasa_cierre: number | null; // %
  pct_show: number | null; // %
  costo_por_lead: number | null;
  phr: number | null; // ingresos / horas
  posts_totales: number;
  pct_dm_formulario: number | null; // %
  proyeccion_mes: number | null;
  // KPIs clave adicionales
  ticket_promedio: number | null;      // ingresos / ventas
  cpv: number | null;                  // costo por venta (gasto_ads / ventas)
  pct_formulario_agenda: number | null; // %
  posts_por_dia: number | null;        // ritmo de contenido orgánico
}

/** Suma de todos los posts del bloque A. */
export function postsTotales(m: MetricaSemanaV2): number {
  return POSTS_PLATAFORMAS.reduce((acc, p) => acc + (Number(m[p.key]) || 0), 0);
}

/** Días del período cargado (1 para "día", 7 para "semana", o el rango explícito). */
export function diasDelPeriodo(m: MetricaSemanaV2): number {
  if (m.met_fecha_inicio && m.met_fecha_fin) {
    const ini = new Date(m.met_fecha_inicio + 'T00:00:00').getTime();
    const fin = new Date(m.met_fecha_fin + 'T00:00:00').getTime();
    const dias = Math.round((fin - ini) / 86400000) + 1;
    if (dias > 0) return dias;
  }
  return m.met_periodo_tipo === 'dia' ? 1 : 7;
}

export function calcularEmbudoV3KPIs(m: MetricaSemanaV2): EmbudoV3KPIs {
  const safe = (num: number, den: number) => (den > 0 ? num / den : null);
  const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : null);

  const roas = safe(m.ingresos_cobrados, m.gasto_ads);
  const tasa_cierre = pct(m.ventas_cerradas, m.llamadas_tomadas);
  const pct_show = pct(m.shows, m.agendados);
  const costo_por_lead = safe(m.gasto_ads, m.mensajes_recibidos);
  const phr = safe(m.ingresos_cobrados, m.horas_trabajadas_semana);
  const pct_dm_formulario = pct(m.formularios_completados, m.mensajes_recibidos);

  const dias = diasDelPeriodo(m);
  const proyeccion_mes = dias > 0 ? m.ingresos_cobrados * (30 / dias) : null;

  const ticket_promedio = safe(m.ingresos_cobrados, m.ventas_cerradas);
  const cpv = safe(m.gasto_ads, m.ventas_cerradas);
  const pct_formulario_agenda = pct(m.agendados, m.formularios_completados);
  const totalPosts = postsTotales(m);
  const posts_por_dia = dias > 0 ? totalPosts / dias : null;

  return {
    roas,
    tasa_cierre,
    pct_show,
    costo_por_lead,
    phr,
    posts_totales: totalPosts,
    pct_dm_formulario,
    proyeccion_mes,
    ticket_promedio,
    cpv,
    pct_formulario_agenda,
    posts_por_dia,
  };
}

// Tonos de color por umbral (espejo del spec)
export function roasTone(v: number | null): DiagnosticoNivel {
  if (v === null) return 'alerta';
  if (v < 2) return 'critico';
  if (v <= 4) return 'alerta';
  return 'ok';
}
export function cierreTone(pct: number | null): DiagnosticoNivel {
  if (pct === null) return 'alerta';
  if (pct < 10) return 'critico';
  if (pct >= 20) return 'ok';
  return 'alerta';
}
export function showTone(pct: number | null): DiagnosticoNivel {
  if (pct === null) return 'alerta';
  return pct < 50 ? 'alerta' : 'ok';
}
export function cpvTone(v: number | null): DiagnosticoNivel {
  if (v === null) return 'alerta';
  if (v > 250) return 'critico';
  if (v > 100) return 'alerta';
  return 'ok';
}
