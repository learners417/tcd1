import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { usePersistedState } from '../lib/usePersistedState';
import { TrendingUp, Save, Megaphone, Sprout } from 'lucide-react';
import { supabase, isSupabaseReady, type MetricaSemanaV2 } from '../lib/supabase';
import { reportError } from '../lib/errors';
import { toast } from 'sonner';
import { SEED_ROADMAP_V2 as SEED_ROADMAP, TOTAL_METAS } from '../lib/roadmapSeed';
import {
  calcularEmbudoV3KPIs,
  formatPct,
  formatCurrency,
  nivelColor,
  POSTS_PLATAFORMAS,
  ADS_PLATAFORMAS,
  postsTotales,
  roasTone,
  cierreTone,
  showTone,
  cpvTone,
  EMPTY_METRICAS,
  type DiagnosticoNivel,
} from '../lib/funnelCalcs';

// ─── Helpers de fecha / período ────────────────────────────────────────────────

function toFechaStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isoWeekString(d: Date): string {
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/** Lunes–domingo de la semana que contiene a `d`. */
function weekRange(d: Date): { inicio: Date; fin: Date } {
  const dia = d.getDay(); // 0=domingo
  const offsetLunes = dia === 0 ? -6 : 1 - dia;
  const inicio = new Date(d);
  inicio.setDate(d.getDate() + offsetLunes);
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  return { inicio, fin };
}

function fmtRango(inicio: Date, fin: Date): string {
  const f = (x: Date) => x.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  return `${f(inicio)} – ${f(fin)}`;
}

function loadMetricsLocal(): MetricaSemanaV2[] {
  try {
    const saved = localStorage.getItem('tcd_metrics_v3');
    if (!saved) return [];
    return JSON.parse(saved);
  } catch { return []; }
}

function saveMetricsLocal(data: MetricaSemanaV2[]) {
  localStorage.setItem('tcd_metrics_v3', JSON.stringify(data));
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`card-panel p-4 rounded-2xl ${highlight ? 'border-[#E8962E]/30' : 'border-[rgba(232,150,46,0.1)]'}`}>
      <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-widest mb-1.5 font-semibold">{label}</p>
      <p className={`text-2xl font-light tracking-tight ${highlight ? 'text-[#E8962E]' : 'text-[#F2EFE9]'}`}>{value}</p>
      {sub && <p className="text-xs text-[#F2EFE9]/40 mt-1">{sub}</p>}
    </div>
  );
}

/** KPI con color según umbral (ok/alerta/critico). */
function KPICardTone({ label, value, tone, sub }: { label: string; value: string; tone: DiagnosticoNivel; sub?: string }) {
  return (
    <div className="card-panel p-4 rounded-2xl border-[rgba(232,150,46,0.1)]">
      <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-widest mb-1.5 font-semibold">{label}</p>
      <p className={`text-2xl font-light tracking-tight ${nivelColor(tone)}`}>{value}</p>
      {sub && <p className="text-xs text-[#F2EFE9]/40 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Inputs reutilizables ──────────────────────────────────────────────────────

function NumField({
  label, value, onChange, prefix,
}: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div>
      <label className="block text-xs text-[#F2EFE9]/60 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F2EFE9]/30 text-sm">{prefix}</span>}
        <input
          type="number" step="any" min="0" value={value}
          onChange={(e) => onChange(e.target.value)} placeholder="0"
          className={`w-full input-field ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </div>
  );
}

// ─── Tab: Mi Progreso (sin cambios) ────────────────────────────────────────────

function TabProgreso({ userId }: { userId?: string }) {
  const [progData, setProgData] = useState({ semanaActual: 1, totTareas: TOTAL_METAS, compTareas: 0, diasDiario: 0, hitos: 0 });

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('tcd_profile') || '{}');
    const dInicio = p.fecha_inicio ? new Date(p.fecha_inicio) : new Date();
    const diff = Math.floor((new Date().getTime() - dInicio.getTime()) / (1000 * 60 * 60 * 24));
    const semActual = Math.max(1, Math.min(13, Math.floor(diff / 7) + 1));

    let tot = 0, comp = 0, hitosComp = 0;
    try {
      const saved = localStorage.getItem('tcd_hoja_ruta_v2');
      const completadasSet = new Set<string>(saved ? JSON.parse(saved) : []);
      for (const pil of SEED_ROADMAP) {
        const metasPilar = pil.metas ?? [];
        const compPilar = metasPilar.filter((m) => completadasSet.has(`${pil.numero}-${m.codigo}`)).length;
        tot += metasPilar.length;
        comp += compPilar;
        if (compPilar >= metasPilar.length && metasPilar.length > 0) hitosComp++;
      }
    } catch { /* noop */ }

    const diaryRaw = localStorage.getItem('tcd_diario_v3') || localStorage.getItem('tcd_diario_v2') || '[]';
    let diasD = 0;
    try { const arr = JSON.parse(diaryRaw); diasD = Array.isArray(arr) ? arr.length : (Array.isArray(arr.entries) ? arr.entries.length : 0); } catch { /* noop */ }

    setProgData({ semanaActual: semActual, totTareas: tot, compTareas: comp, diasDiario: diasD, hitos: hitosComp });
  }, []);

  const chartData = Array.from({ length: 13 }).map((_, i) => ({
    semana: `S${i + 1}`,
    esperado: Math.round(((i + 1) / 13) * progData.totTareas),
    real: i + 1 <= progData.semanaActual ? Math.round(((i + 1) / progData.semanaActual) * progData.compTareas) : null,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="card-panel p-6 rounded-2xl bg-[#E8962E]/[0.03] border-[#E8962E]/10">
        <h2 className="text-xl font-medium text-[#F2EFE9] mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          Tu progreso en el Programa
        </h2>
        <p className="text-sm text-[#F2EFE9]/60">Semana {progData.semanaActual} de 13 · 90 días · ADN del Negocio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Tareas completadas" value={progData.compTareas.toString()} sub={`${progData.compTareas}/${progData.totTareas} del total`} />
        <KPICard label="Días con diario" value={progData.diasDiario.toString()} sub={`${progData.diasDiario}/90 totales`} />
        <KPICard label="Pilares completados" value={progData.hitos.toString()} sub={`${progData.hitos}/${SEED_ROADMAP.length} pilares`} />
        <KPICard label="Semana actual" value={progData.semanaActual.toString()} sub="de 13 semanas" highlight />
      </div>

      <div className="card-panel p-6 rounded-2xl">
        <h3 className="text-xs font-bold text-[#F2EFE9]/60 tracking-widest uppercase mb-6">Velocidad de Avance (Tareas)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,150,46,0.08)" vertical={false} />
              <XAxis dataKey="semana" stroke="rgba(232,150,46,0.12)" tick={{ fontSize: 11, fill: 'rgba(240,234,216,0.5)' }} />
              <YAxis stroke="rgba(232,150,46,0.12)" tick={{ fontSize: 11, fill: 'rgba(240,234,216,0.5)' }} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#1A1917', borderColor: 'rgba(232,150,46,0.12)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="esperado" stroke="#6B7280" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Ritmo Esperado" />
              <Line type="monotone" dataKey="real" stroke="#E8962E" strokeWidth={3} dot={{ r: 4, fill: '#E8962E', strokeWidth: 0 }} name="Progreso Real" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Mi Embudo (v3 · spec) ────────────────────────────────────────────────

function TabEmbudo({ userId }: { userId?: string }) {
  const [data, setData] = useState<MetricaSemanaV2[]>(loadMetricsLocal);
  const [saving, setSaving] = useState(false);

  // Período
  const [periodoTipo, setPeriodoTipo] = useState<'dia' | 'semana'>('semana');
  const [fechaRef, setFechaRef] = useState<string>(toFechaStr(new Date()));

  // Plataforma de ads (selector único)
  const [adsPlataforma, setAdsPlataforma] = useState<string>('Meta (IG/FB)');
  const sinAds = adsPlataforma === 'Sin ads';

  // Valores numéricos (bloque A + bloque B)
  const [vals, setVals] = useState<Record<string, string>>({});
  const setVal = (k: string, v: string) => setVals((prev) => ({ ...prev, [k]: v }));
  const num = (k: string) => parseFloat(vals[k] || '0') || 0;

  // Rango de fechas derivado del período
  const refDate = new Date(fechaRef + 'T00:00:00');
  const { inicio, fin } = periodoTipo === 'dia' ? { inicio: refDate, fin: refDate } : weekRange(refDate);
  const periodoLabel = periodoTipo === 'dia'
    ? refDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })
    : `Sem. ${fmtRango(inicio, fin)}`;

  // Clave única del período seleccionado (coincide con la columna `semana`).
  const semanaActual = periodoTipo === 'dia' ? toFechaStr(inicio) : isoWeekString(inicio);

  useEffect(() => {
    if (!isSupabaseReady() || !supabase || !userId) return;
    supabase.from('metricas_v2').select('*').eq('user_id', userId)
      .order('met_fecha_inicio', { ascending: true })
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          setData(rows as MetricaSemanaV2[]);
          saveMetricsLocal(rows as MetricaSemanaV2[]);
        }
      });
  }, [userId]);

  useEffect(() => { saveMetricsLocal(data); }, [data]);

  // Pre-cargar el formulario con lo ya guardado para el período seleccionado.
  // Sin esto, re-guardar un período pisaba con 0 los campos no reingresados.
  useEffect(() => {
    const s = (n: number | null | undefined) => (n ? String(n) : '');
    const existing = data.find((m) => m.semana === semanaActual);
    if (!existing) {
      setVals({}); // período sin datos: arrancar limpio
      return;
    }
    setVals({
      met_posts_reels_ig: s(existing.met_posts_reels_ig),
      met_posts_feed_ig: s(existing.met_posts_feed_ig),
      met_posts_tiktok: s(existing.met_posts_tiktok),
      met_posts_shorts: s(existing.met_posts_shorts),
      met_posts_facebook: s(existing.met_posts_facebook),
      met_posts_linkedin: s(existing.met_posts_linkedin),
      met_stories_ig: s(existing.met_stories_ig),
      met_dms_organicos: s(existing.met_dms_organicos),
      gasto_ads: s(existing.gasto_ads),
      mensajes_recibidos: s(existing.mensajes_recibidos),
      formularios_completados: s(existing.formularios_completados),
      agendados: s(existing.agendados),
      shows: s(existing.shows),
      llamadas_tomadas: s(existing.llamadas_tomadas),
      ventas_cerradas: s(existing.ventas_cerradas),
      ingresos_cobrados: s(existing.ingresos_cobrados),
      horas_trabajadas_semana: s(existing.horas_trabajadas_semana),
    });
    if (existing.met_ads_plataforma) setAdsPlataforma(existing.met_ads_plataforma);
  }, [semanaActual, data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const semana = semanaActual;

    const entry: MetricaSemanaV2 = {
      ...EMPTY_METRICAS,
      user_id: userId || '',
      semana,
      met_periodo_tipo: periodoTipo,
      met_fecha_inicio: toFechaStr(inicio),
      met_fecha_fin: toFechaStr(fin),
      met_ads_plataforma: adsPlataforma,
      // Bloque A — orgánico
      met_posts_reels_ig: num('met_posts_reels_ig'),
      met_posts_feed_ig: num('met_posts_feed_ig'),
      met_posts_tiktok: num('met_posts_tiktok'),
      met_posts_shorts: num('met_posts_shorts'),
      met_posts_facebook: num('met_posts_facebook'),
      met_posts_linkedin: num('met_posts_linkedin'),
      met_stories_ig: num('met_stories_ig'),
      met_dms_organicos: num('met_dms_organicos'),
      // Bloque B — ads (si "Sin ads", se anulan los específicos de ads)
      gasto_ads: sinAds ? 0 : num('gasto_ads'),
      mensajes_recibidos: sinAds ? 0 : num('mensajes_recibidos'),
      formularios_completados: sinAds ? 0 : num('formularios_completados'),
      agendados: sinAds ? 0 : num('agendados'),
      shows: sinAds ? 0 : num('shows'),
      llamadas_tomadas: num('llamadas_tomadas'),
      ventas_cerradas: num('ventas_cerradas'),
      ingresos_cobrados: num('ingresos_cobrados'),
      horas_trabajadas_semana: num('horas_trabajadas_semana'),
    };

    let saved: MetricaSemanaV2 = entry;
    if (isSupabaseReady() && supabase && userId) {
      const { data: row, error } = await supabase.from('metricas_v2')
        .upsert({ ...entry, user_id: userId }, { onConflict: 'user_id,semana' })
        .select().single();
      if (error) {
        // No tragarse el error: reportar, avisar y NO limpiar el form (no se perdió lo cargado).
        const msg = reportError(error, {
          feature: 'metricas-embudo',
          action: 'guardar-metricas',
          extra: { semana, userId },
        });
        toast.error(`No se pudieron guardar las métricas: ${msg}`);
        setSaving(false);
        return;
      }
      if (row) saved = row as MetricaSemanaV2;
    }

    setData((prev) => {
      const idx = prev.findIndex((m) => m.semana === semana);
      if (idx >= 0) return prev.map((m, i) => (i === idx ? saved : m));
      return [...prev, saved];
    });

    // No limpiamos el form: el efecto de pre-carga lo re-sincroniza con lo guardado,
    // así los KPIs y el form siguen mostrando el período recién guardado.
    setSaving(false);
    toast.success('Métricas guardadas');
  };

  // KPIs de la fila recién cargada (preview en vivo desde el form)
  const preview: MetricaSemanaV2 = {
    ...EMPTY_METRICAS,
    user_id: userId || '',
    semana: '',
    met_periodo_tipo: periodoTipo,
    met_fecha_inicio: toFechaStr(inicio),
    met_fecha_fin: toFechaStr(fin),
    met_posts_reels_ig: num('met_posts_reels_ig'),
    met_posts_feed_ig: num('met_posts_feed_ig'),
    met_posts_tiktok: num('met_posts_tiktok'),
    met_posts_shorts: num('met_posts_shorts'),
    met_posts_facebook: num('met_posts_facebook'),
    met_posts_linkedin: num('met_posts_linkedin'),
    gasto_ads: sinAds ? 0 : num('gasto_ads'),
    mensajes_recibidos: sinAds ? 0 : num('mensajes_recibidos'),
    formularios_completados: sinAds ? 0 : num('formularios_completados'),
    agendados: sinAds ? 0 : num('agendados'),
    shows: sinAds ? 0 : num('shows'),
    llamadas_tomadas: num('llamadas_tomadas'),
    ventas_cerradas: num('ventas_cerradas'),
    ingresos_cobrados: num('ingresos_cobrados'),
    horas_trabajadas_semana: num('horas_trabajadas_semana'),
  };
  const kpis = calcularEmbudoV3KPIs(preview);

  // Datos del gráfico de evolución (ingresos / ventas por período cargado)
  const chartData = data.map((m, i) => ({
    name: m.met_fecha_inicio ? m.met_fecha_inicio.slice(5) : `#${i + 1}`,
    ingresos: m.ingresos_cobrados,
    ventas: m.ventas_cerradas,
    posts: postsTotales(m),
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-medium text-[#F2EFE9] mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          Mi Embudo de Ventas
        </h2>
        <p className="text-sm text-[#F2EFE9]/60">Orgánico + Ads · 12 KPIs automáticos · carga diaria o semanal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Período */}
        <div className="card-panel p-5 rounded-2xl">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#E8962E] mb-3">¿Qué período cargás?</p>
          <div className="flex gap-2 mb-3">
            {(['dia', 'semana'] as const).map((t) => (
              <button
                key={t} type="button" onClick={() => setPeriodoTipo(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  periodoTipo === t
                    ? 'bg-[#E8962E] border-[#E8962E] text-[#0A0806] font-semibold'
                    : 'bg-black/20 border-[rgba(232,150,46,0.12)] text-[#F2EFE9]/50 hover:bg-[#E8962E]/10'
                }`}
              >
                {t === 'dia' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <input
              type="date" value={fechaRef} onChange={(e) => setFechaRef(e.target.value)}
              className="input-field max-w-[180px]"
            />
            <span className="text-sm text-[#E8962E]/80">{periodoLabel}</span>
          </div>
        </div>

        {/* Bloque A — Orgánico */}
        <div className="card-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-4 h-4 text-[#22C55E]" />
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[#22C55E]">A — Contenido orgánico</p>
          </div>
          <p className="text-xs text-[#F2EFE9]/40 mb-3">Posts publicados por plataforma</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {POSTS_PLATAFORMAS.map((p) => (
              <NumField key={p.key} label={p.label} value={vals[p.key] || ''} onChange={(v) => setVal(p.key as string, v)} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Stories IG" value={vals.met_stories_ig || ''} onChange={(v) => setVal('met_stories_ig', v)} />
            <NumField label="DMs orgánicos recibidos" value={vals.met_dms_organicos || ''} onChange={(v) => setVal('met_dms_organicos', v)} />
          </div>
        </div>

        {/* Bloque B — Ads */}
        <div className="card-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-[#E8962E]" />
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[#E8962E]">B — Publicidad (Ads)</p>
          </div>

          <p className="text-xs text-[#F2EFE9]/40 mb-2">Plataforma activa este período</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ADS_PLATAFORMAS.map((p) => (
              <button
                key={p} type="button" onClick={() => setAdsPlataforma(p)}
                className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                  adsPlataforma === p
                    ? 'bg-[#E8962E]/10 border-[#E8962E]/40 text-[#F2EFE9]'
                    : 'border-[rgba(232,150,46,0.18)] text-[#F2EFE9]/40 hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {!sinAds && (
              <>
                <NumField label="Gasto en ads ($)" prefix="$" value={vals.gasto_ads || ''} onChange={(v) => setVal('gasto_ads', v)} />
                <NumField label="Mensajes / leads" value={vals.mensajes_recibidos || ''} onChange={(v) => setVal('mensajes_recibidos', v)} />
                <NumField label="Formularios completados" value={vals.formularios_completados || ''} onChange={(v) => setVal('formularios_completados', v)} />
                <NumField label="Llamadas agendadas" value={vals.agendados || ''} onChange={(v) => setVal('agendados', v)} />
                <NumField label="Shows (se presentaron)" value={vals.shows || ''} onChange={(v) => setVal('shows', v)} />
              </>
            )}
            <NumField label="Llamadas tomadas" value={vals.llamadas_tomadas || ''} onChange={(v) => setVal('llamadas_tomadas', v)} />
            <NumField label="Ventas cerradas" value={vals.ventas_cerradas || ''} onChange={(v) => setVal('ventas_cerradas', v)} />
            <NumField label="Ingresos cobrados ($)" prefix="$" value={vals.ingresos_cobrados || ''} onChange={(v) => setVal('ingresos_cobrados', v)} />
            <NumField label="Horas trabajadas" value={vals.horas_trabajadas_semana || ''} onChange={(v) => setVal('horas_trabajadas_semana', v)} />
          </div>
        </div>

        {/* KPIs en vivo */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#22C55E] mb-3">KPIs calculados</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICardTone label="ROAS" value={kpis.roas !== null ? `${kpis.roas.toFixed(1)}×` : '—'} tone={roasTone(kpis.roas)} />
            <KPICardTone label="Tasa de cierre" value={formatPct(kpis.tasa_cierre)} tone={cierreTone(kpis.tasa_cierre)} />
            <KPICardTone label="% Show" value={formatPct(kpis.pct_show)} tone={showTone(kpis.pct_show)} />
            <KPICardTone label="Costo por venta" value={kpis.cpv !== null ? formatCurrency(kpis.cpv) : '—'} tone={cpvTone(kpis.cpv)} />
            <KPICard label="Costo por lead" value={kpis.costo_por_lead !== null ? formatCurrency(kpis.costo_por_lead) : '—'} />
            <KPICard label="Ticket promedio" value={kpis.ticket_promedio !== null ? formatCurrency(kpis.ticket_promedio) : '—'} />
            <KPICard label="PHR ($/hora)" value={kpis.phr !== null ? formatCurrency(kpis.phr) : '—'} highlight />
            <KPICard label="Proyección mes" value={kpis.proyeccion_mes !== null ? formatCurrency(kpis.proyeccion_mes) : '—'} highlight />
            <KPICard label="Posts totales" value={String(kpis.posts_totales)} />
            <KPICard label="Posts / día" value={kpis.posts_por_dia !== null ? kpis.posts_por_dia.toFixed(1) : '—'} />
            <KPICard label="% DM→Formulario" value={formatPct(kpis.pct_dm_formulario)} />
            <KPICard label="% Formulario→Agenda" value={formatPct(kpis.pct_formulario_agenda)} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : `Guardar métricas del ${periodoTipo === 'dia' ? 'día' : 'la semana'}`}
        </button>
      </form>

      {/* Contenido orgánico (posts publicados por período) */}
      {chartData.some((d) => d.posts > 0) && (
        <div className="card-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-[#F2EFE9]/60 tracking-widest uppercase">Contenido orgánico publicado</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-[#F2EFE9]/60">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Posts totales
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,150,46,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(232,150,46,0.12)" tick={{ fill: 'rgba(240,234,216,0.5)', fontSize: 11 }} />
                <YAxis stroke="rgba(232,150,46,0.12)" tick={{ fill: 'rgba(240,234,216,0.5)', fontSize: 11 }} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1917', borderColor: 'rgba(232,150,46,0.12)', borderRadius: '8px', color: '#F2EFE9' }} />
                <Bar dataKey="posts" fill="#22C55E" radius={[4, 4, 0, 0]} name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Evolución */}
      {chartData.length > 1 ? (
        <div className="card-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-[#F2EFE9]/60 tracking-widest uppercase">Evolución de ingresos</h3>
            <div className="flex gap-4 text-xs font-medium text-[#F2EFE9]/60">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#E8962E]" /> Ingresos</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Ventas</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E8962E" stopOpacity={0.3} /><stop offset="95%" stopColor="#E8962E" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,150,46,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(232,150,46,0.12)" tick={{ fill: 'rgba(240,234,216,0.5)', fontSize: 11 }} />
                <YAxis stroke="rgba(232,150,46,0.12)" tick={{ fill: 'rgba(240,234,216,0.5)', fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1A1917', borderColor: 'rgba(232,150,46,0.12)', borderRadius: '8px', color: '#F2EFE9' }} />
                <Area type="monotone" dataKey="ingresos" stroke="#E8962E" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="ventas" stroke="#22C55E" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card-panel p-8 rounded-2xl border border-dashed border-[rgba(232,150,46,0.12)] text-center">
          <TrendingUp className="w-10 h-10 text-[#E8962E]/30 mx-auto mb-3" />
          <p className="text-sm text-[#F2EFE9]/60">Carga al menos 2 períodos para ver la evolución de tus ingresos.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Metrics({ userId }: { userId?: string }) {
  const [tab, setTab] = usePersistedState<'progreso' | 'embudo'>(
    'tcd_metrics_tab',
    'progreso',
    { validate: (v) => v === 'progreso' || v === 'embudo' },
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-6 animate-in fade-in duration-500">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('progreso')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            tab === 'progreso'
              ? 'bg-[#E8962E]/20 text-[#E8962E] border border-[#E8962E]/30'
              : 'bg-[#E8962E]/5 text-[#F2EFE9]/40 border border-transparent hover:bg-[#E8962E]/10 hover:text-[#F2EFE9]/80'
          }`}
        >
          Mi Progreso
        </button>
        <button
          onClick={() => setTab('embudo')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            tab === 'embudo'
              ? 'bg-[#E8962E]/20 text-[#E8962E] border border-[#E8962E]/30'
              : 'bg-[#E8962E]/5 text-[#F2EFE9]/40 border border-transparent hover:bg-[#E8962E]/10 hover:text-[#F2EFE9]/80'
          }`}
        >
          Mi Embudo
        </button>
      </div>

      {tab === 'progreso' ? <TabProgreso userId={userId} /> : <TabEmbudo userId={userId} />}
    </div>
  );
}
