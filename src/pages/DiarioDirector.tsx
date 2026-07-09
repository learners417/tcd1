import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Loader2,
  Calendar,
  Flame,
  History,
  Check,
  Send,
  Zap,
  Activity,
  Brain,
  Heart,
  Award,
  Target,
  Scale,
  TrendingUp,
  HeartPulse,
  Moon,
  Salad,
  Dumbbell,
  Clock,
  Users,
  Lightbulb,
  CloudRain,
  UserX,
} from 'lucide-react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { reportError } from '../lib/errors';
import { toast } from 'sonner';
import { generateText } from '../lib/aiProvider';
import { usePersistedState } from '../lib/usePersistedState';
import {
  TAREAS_TAGS,
  CHECKEOS_CHIPS,
  LOGRO_MAX_CHARS,
  BLOQUEO_MAX_CHARS,
  calcularScore,
  indiceBienestar,
  focoNegocio,
  equilibrioIntegral,
  consistencia7d,
  energiaPromedio7d,
  rachaActiva,
  etiquetaEnergia,
  colorDimension,
  toFechaStr,
  type EntradaHistorica,
} from '../lib/diarioCalcs';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EntradaDiario {
  id: string;
  fecha: string;
  energia: number; // 1-10
  cuerpo: number; // 1-10
  mente: number; // 1-10
  emociones: number; // 1-10
  logro: string;
  tareas: string[];
  checkeos: string[];
  bloqueo: string;
  score: number; // 0-100, server-side
}

interface ResumenSemana {
  id: string;
  semana_inicio: string;
  resumen_texto: string;
  created_at: string;
}

// Icono lucide por cada checkeo (sin emojis, según el sistema de diseño de la app)
const CHECKEO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  durmio_bien: Moon,
  comio_bien: Salad,
  entreno: Dumbbell,
  tiempo_libre: Clock,
  conecto_alguien: Users,
  inspirado: Lightbulb,
  ansioso: CloudRain,
  solo: UserX,
};

const DIMENSIONES = [
  { key: 'cuerpo' as const, label: 'Cuerpo', icon: Activity },
  { key: 'mente' as const, label: 'Mente', icon: Brain },
  { key: 'emociones' as const, label: 'Emociones', icon: Heart },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentDay(): number {
  try {
    const profile = localStorage.getItem('tcd_profile');
    if (!profile) return 1;
    const parsed = JSON.parse(profile);
    const fechaInicio = parsed.fecha_inicio;
    if (!fechaInicio) return 1;
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const ahora = new Date();
    return Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } catch {
    return 1;
  }
}

function toHistorica(e: EntradaDiario): EntradaHistorica {
  return {
    fecha: e.fecha,
    energia: e.energia,
    cuerpo: e.cuerpo,
    mente: e.mente,
    emociones: e.emociones,
    score: e.score,
    bloqueo: e.bloqueo,
    tareas: e.tareas,
  };
}

// Mapea una fila cruda de Supabase (con fallbacks a campos legacy) → EntradaDiario
function mapRow(d: any): EntradaDiario {
  return {
    id: String(d.id),
    fecha: d.fecha,
    energia: d.energia_nivel ?? 5,
    cuerpo: d.diario_cuerpo ?? 0,
    mente: d.diario_mente ?? 0,
    emociones: d.diario_emociones ?? 0,
    logro: d.diario_logro ?? d.pensamiento_dominante ?? '',
    tareas: Array.isArray(d.diario_tareas) ? d.diario_tareas : [],
    checkeos: Array.isArray(d.diario_checkeos) ? d.diario_checkeos : [],
    bloqueo: d.diario_bloqueo ?? '',
    score: d.diario_score ?? 0,
  };
}

// ─── Escala 1–10 interactiva ───────────────────────────────────────────────────

function Escala10({
  valor,
  onChange,
  color,
}: {
  valor: number;
  onChange: (v: number) => void;
  color?: (v: number) => string;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const activo = n <= valor;
        const fill = color ? color(valor) : '#E8962E';
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`Nivel ${n}`}
            className="flex-1 h-7 rounded-md transition-all"
            style={{
              background: activo ? fill : 'rgba(232,150,46,0.08)',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── KPI card (post-guardado) ──────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  delta,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'green' | 'warn';
  delta?: string;
}) {
  const valColor =
    tone === 'green' ? 'text-[#22C55E]' : tone === 'warn' ? 'text-[#E09040]' : 'text-[#F2EFE9]';
  return (
    <div className="card-panel p-4 rounded-2xl border border-[rgba(232,150,46,0.12)]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 text-[#E8962E]/60" />
        <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-widest font-semibold">{label}</p>
      </div>
      <p className={`text-xl font-medium ${valColor}`}>{value}</p>
      {delta && <p className="text-[10px] text-[#F2EFE9]/40 mt-0.5">{delta}</p>}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function DiarioDirector({
  userId,
  geminiKey,
}: {
  userId?: string;
  geminiKey?: string;
}) {
  const [entries, setEntries] = useState<EntradaDiario[]>([]);
  const [resumen, setResumen] = useState<ResumenSemana | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [vista, setVista] = usePersistedState<'formulario' | 'historial'>(
    'tcd_diario_vista',
    'formulario',
    { validate: (v) => v === 'formulario' || v === 'historial' },
  );

  // Estado del formulario
  const [energia, setEnergia] = useState(5);
  const [cuerpo, setCuerpo] = useState(5);
  const [mente, setMente] = useState(5);
  const [emociones, setEmociones] = useState(5);
  const [logro, setLogro] = useState('');
  const [tareas, setTareas] = useState<string[]>([]);
  const [checkeos, setCheckeos] = useState<string[]>([]);
  const [bloqueo, setBloqueo] = useState('');

  const todayStr = toFechaStr(new Date());
  const hoy = new Date();
  const todayEntry = entries.find((e) => e.fecha === todayStr);
  const ayerStr = toFechaStr(new Date(hoy.getTime() - 86400000));
  const ayerEntry = entries.find((e) => e.fecha === ayerStr);

  const historicas = entries.map(toHistorica);
  const racha = rachaActiva(historicas, hoy);
  const esDomingo = hoy.getDay() === 0;
  const energiaPromedio = energiaPromedio7d(historicas);

  useEffect(() => {
    if (energiaPromedio !== null) {
      localStorage.setItem('tcd_energia_promedio_7d', String(energiaPromedio));
    }
  }, [energiaPromedio]);

  // ─── Cargar datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tcd_diario_v3');
      if (saved) setEntries(JSON.parse(saved));
    } catch { /* noop */ }

    if (!isSupabaseReady() || !supabase || !userId) return;

    setLoading(true);
    Promise.all([
      supabase
        .from('diario_entradas')
        .select('*')
        .eq('user_id', userId)
        .order('fecha', { ascending: false })
        .limit(60),
      supabase
        .from('diario_resumen')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]).then(([{ data: raw }, { data: res }]) => {
      if (raw) {
        const formatted = raw.map(mapRow);
        setEntries(formatted);
        localStorage.setItem('tcd_diario_v3', JSON.stringify(formatted));
      }
      if (res) setResumen(res as ResumenSemana);
    }).finally(() => setLoading(false));
  }, [userId]);

  // ─── Guardar entrada ──────────────────────────────────────────────────────
  const toggle = (list: string[], id: string): string[] =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const handleGuardar = async () => {
    if (!logro.trim()) {
      toast.error('Cuéntanos tu logro de hoy — queda en tu historial para siempre.');
      return;
    }
    if (tareas.length === 0) {
      toast.error('Marca al menos una cosa en la que estuviste hoy.');
      return;
    }

    setSaving(true);
    try {
      const input = { fecha: todayStr, energia, cuerpo, mente, emociones, logro, tareas, checkeos, bloqueo };
      const scoreLocal = calcularScore(input);

      const entradaLocal: EntradaDiario = {
        id: String(Date.now()),
        fecha: todayStr,
        energia, cuerpo, mente, emociones,
        logro: logro.trim(),
        tareas, checkeos,
        bloqueo: bloqueo.trim(),
        score: scoreLocal,
      };

      if (isSupabaseReady() && supabase && userId) {
        const { data: saved, error } = await supabase
          .from('diario_entradas')
          .upsert(
            {
              user_id: userId,
              fecha: todayStr,
              energia_nivel: energia,
              diario_cuerpo: cuerpo,
              diario_mente: mente,
              diario_emociones: emociones,
              diario_logro: logro.trim(),
              diario_tareas: tareas,
              diario_checkeos: checkeos,
              diario_bloqueo: bloqueo.trim() || null,
              // back-compat con esquema legacy: columnas previas al diario v3.
              // `respuestas` es NOT NULL en la tabla vieja (cuestionario q1..q5);
              // el diario v3 ya no la usa, pero hay que mandar un valor no-null.
              respuestas: {},
              pensamiento_dominante: logro.trim(),
            },
            { onConflict: 'user_id,fecha' },
          )
          .select()
          .single();
        if (error) throw error;
        if (saved) {
          entradaLocal.id = String(saved.id);
          entradaLocal.score = saved.diario_score ?? scoreLocal; // score autoritativo del server
        }
      }

      const actualizadas = [entradaLocal, ...entries.filter((e) => e.fecha !== todayStr)];
      setEntries(actualizadas);
      localStorage.setItem('tcd_diario_v3', JSON.stringify(actualizadas));
      toast.success(`Entrada guardada · Score del día: ${entradaLocal.score}/100`);

      if (esDomingo) await generarResumenSemana(actualizadas);
    } catch (err) {
      // Reportar a Sentry con contexto en vez de tragarse el error en silencio.
      const msg = reportError(err, {
        feature: 'diario-fundador',
        action: 'guardar-entrada',
        extra: { fecha: todayStr, userId },
      });
      toast.error(`Error al guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Resumen semanal (domingo) ────────────────────────────────────────────
  const generarResumenSemana = useCallback(
    async (todasEntradas: EntradaDiario[]) => {
      if (!import.meta.env.VITE_GEMINI_API_KEY) return;

      const ahora = new Date();
      const lunes = new Date(ahora);
      lunes.setDate(ahora.getDate() - ahora.getDay() + 1);
      const entradasSemana = todasEntradas.filter((e) => {
        const fecha = new Date(e.fecha + 'T12:00:00');
        return fecha >= lunes;
      });
      if (entradasSemana.length < 1) return;

      setGenerandoResumen(true);
      try {
        const prompt = `Eres el Coach de "Tu Clínica Digital". Analizá las entradas del Diario del Fundador de esta semana y devolvé un resumen de patrones en JSON.

ENTRADAS:
${entradasSemana.map((e, i) => `Día ${i + 1} (${e.fecha}): energía ${e.energia}/10 · cuerpo ${e.cuerpo} · mente ${e.mente} · emociones ${e.emociones} · score ${e.score} · logro: "${e.logro}" · bloqueo: "${e.bloqueo || '—'}"`).join('\n')}

Devolvé SOLO este JSON:
{
  "racha": <días consecutivos>,
  "energia_promedio": <decimal 1>,
  "tendencia_energia": "subiendo" | "bajando" | "estable",
  "bloqueo_recurrente": "<si un bloqueo se repite 2+ veces, nombrarlo; si no, null>",
  "emocion_dominante": "<patrón emocional de la semana>",
  "acciones_proxima_semana": ["<acción 1>", "<acción 2>", "<acción 3>"]
}`;

        const texto = await generateText({ prompt });
        const jsonMatch = texto.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON');
        const resumenTexto = JSON.stringify(JSON.parse(jsonMatch[0]));

        if (isSupabaseReady() && supabase && userId) {
          const semanaInicio = toFechaStr(lunes);
          await supabase.from('diario_resumen').upsert(
            { user_id: userId, semana_inicio: semanaInicio, resumen_texto: resumenTexto },
            { onConflict: 'user_id,semana_inicio' },
          );
          setResumen({ id: '', semana_inicio: semanaInicio, resumen_texto: resumenTexto, created_at: new Date().toISOString() });
        }
        toast.success('Resumen de la semana generado por tu Mentor.');
      } catch {
        /* nice-to-have, silencioso */
      } finally {
        setGenerandoResumen(false);
      }
    },
    [geminiKey, userId],
  );

  // ─── KPIs (se muestran DESPUÉS de guardar) ────────────────────────────────
  const kpis = todayEntry
    ? {
        indiceBienestar: indiceBienestar(todayEntry),
        focoNegocio: focoNegocio(todayEntry.tareas),
        equilibrio: equilibrioIntegral(todayEntry.cuerpo, todayEntry.mente, todayEntry.emociones),
        consistencia: consistencia7d(historicas, hoy),
        energia7d: energiaPromedio,
        score: todayEntry.score,
        deltaScore: ayerEntry ? todayEntry.score - ayerEntry.score : null,
      }
    : null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 anímate-in fade-in duration-500">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-[#F2EFE9] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#E8962E]" /> Diario del Fundador
          </h1>
          <p className="text-sm text-[#F2EFE9]/60 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            <span className="text-[#F2EFE9]/30">· Día {getCurrentDay()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {energiaPromedio !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              energiaPromedio >= 7 ? 'text-[#22C55E] bg-emerald-500/10 border-emerald-500/20' :
              energiaPromedio >= 4 ? 'text-[#E8962E] bg-[#E8962E]/10 border-[#E8962E]/20' :
              'text-[#EF4444] bg-red-500/10 border-red-500/20'
            }`}>
              <Zap className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">{energiaPromedio}</span>
              <span className="text-[10px] opacity-60">7d</span>
            </div>
          )}
          {racha > 0 && (
            <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">{racha} días</span>
            </div>
          )}
          <button
            onClick={() => setVista(vista === 'formulario' ? 'historial' : 'formulario')}
            className="flex items-center gap-1.5 text-[#F2EFE9]/60 bg-[#E8962E]/5 px-3 py-1.5 rounded-xl border border-[rgba(232,150,46,0.12)] hover:bg-[#E8962E]/10 transition-colors text-sm"
          >
            <History className="w-3.5 h-3.5" />
            Historial
          </button>
        </div>
      </div>

      {/* Resumen semanal */}
      {generandoResumen && (
        <div className="flex items-center gap-2 text-[#E8962E] bg-[#E8962E]/10 border border-[#E8962E]/20 rounded-2xl p-4">
          <Loader2 className="w-4 h-4 anímate-spin" />
          <span className="text-sm">El Coach está analizando tu semana...</span>
        </div>
      )}
      {esDomingo && resumen && (() => {
        try {
          const datos = JSON.parse(resumen.resumen_texto);
          return (
            <div className="card-panel p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-medium text-violet-300">Resumen del Mentor — Semana cerrada</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#1A1917]/50 rounded-xl p-3">
                  <p className="text-[#F2EFE9]/40 uppercase tracking-wider text-[10px]">Energía promedio</p>
                  <p className="text-[#F2EFE9] font-medium mt-0.5">{datos.energia_promedio}/10 — {datos.tendencia_energia}</p>
                </div>
                <div className="bg-[#1A1917]/50 rounded-xl p-3">
                  <p className="text-[#F2EFE9]/40 uppercase tracking-wider text-[10px]">Racha del Diario</p>
                  <p className="text-[#F2EFE9] font-medium mt-0.5">{datos.racha} días consecutivos</p>
                </div>
              </div>
              {datos.bloqueo_recurrente && (
                <div className="bg-[#E8962E]/10 border border-[#E8962E]/20 rounded-xl p-3">
                  <p className="text-[10px] text-[#E8962E] uppercase tracking-wider mb-1">Bloqueo recurrente detectado</p>
                  <p className="text-sm text-amber-200">{datos.bloqueo_recurrente}</p>
                </div>
              )}
              {Array.isArray(datos.acciones_proxima_semana) && (
                <div>
                  <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider mb-2">3 acciones para la próxima semana</p>
                  <ul className="space-y-1.5">
                    {datos.acciones_proxima_semana.map((accion: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#F2EFE9]/80">
                        <span className="text-[#E8962E] font-bold shrink-0">{i + 1}.</span>
                        {accion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        } catch { return null; }
      })()}

      {/* ── Vista: Formulario ── */}
      {vista === 'formulario' && (
        <>
          {todayEntry ? (
            <div className="space-y-6">
              {/* Confirmación + Score */}
              <div className="card-panel p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Check className="w-6 h-6 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-[#22C55E]">Entrada del día completada</h3>
                    <p className="text-sm text-[#22C55E]/70 mt-0.5">Tu cierre quedó guardado. Esto es lo que dicen tus números.</p>
                  </div>
                </div>

                {/* Score grande */}
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-light text-[#E8962E]" style={{ fontFamily: 'var(--font-display)' }}>
                    {todayEntry.score}
                  </span>
                  <div>
                    <p className="text-xs text-[#F2EFE9]/40">de 100 puntos</p>
                    {kpis?.deltaScore !== null && kpis?.deltaScore !== undefined && (
                      <p className={`text-xs font-medium ${kpis.deltaScore >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                        {kpis.deltaScore >= 0 ? '▲' : '▼'} {Math.abs(kpis.deltaScore)} vs ayer
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 6 KPIs */}
              {kpis && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <KpiCard label="Índice de bienestar" value={`${kpis.indiceBienestar}`} icon={HeartPulse} tone="green" />
                  <KpiCard label="Foco en negocio" value={`${kpis.focoNegocio}%`} icon={Target} tone={kpis.focoNegocio >= 60 ? 'green' : 'warn'} />
                  <KpiCard label="Consistencia 7d" value={`${kpis.consistencia}%`} icon={TrendingUp} tone="green" />
                  <KpiCard label="Equilibrio integral" value={`${kpis.equilibrio} / 10`} icon={Scale} />
                  <KpiCard label="Promedio energía 7d" value={kpis.energia7d !== null ? `${kpis.energia7d}` : '—'} icon={Zap} tone="green" />
                  <KpiCard label="Racha activa" value={`${racha} días`} icon={Flame} tone="green" />
                </div>
              )}
            </div>
          ) : (
            <div className="card-panel p-6 rounded-2xl space-y-7">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8962E]/20 flex items-center justify-center border border-[#E8962E]/30">
                  <BookOpen className="w-5 h-5 text-[#E8962E]" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-[#F2EFE9]">¿Cómo fue hoy?</h2>
                  <p className="text-xs text-[#F2EFE9]/60">Tu cierre diario · 5 minutos</p>
                </div>
              </div>

              {/* Energía general */}
              <div className="bg-[#1A1917]/30 rounded-xl p-4 border border-[rgba(232,150,46,0.1)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#F2EFE9]/80 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> Energía general del día
                  </span>
                  <span className="text-sm font-bold text-[#E8962E]">{energia} · {etiquetaEnergia(energia)}</span>
                </div>
                <Escala10 valor={energia} onChange={setEnergia} />
                {ayerEntry && (
                  <p className="text-[11px] text-[#F2EFE9]/30 mt-2 text-center">
                    Ayer tuviste <span className="text-[#22C55E]">{ayerEntry.energia}</span>
                    {energia !== ayerEntry.energia && ` — ${energia > ayerEntry.energia ? 'subiste' : 'bajaste'} ${Math.abs(energia - ayerEntry.energia)}`}
                  </p>
                )}
              </div>

              {/* 3 dimensiones */}
              <div>
                <label className="block text-xs font-medium text-[#F2EFE9]/80 mb-3 uppercase tracking-wider">
                  Tus 3 dimensiones — ¿cómo estuvieron cuerpo · mente · emociones?
                </label>
                <div className="space-y-4">
                  {DIMENSIONES.map((dim) => {
                    const val = dim.key === 'cuerpo' ? cuerpo : dim.key === 'mente' ? mente : emociones;
                    const set = dim.key === 'cuerpo' ? setCuerpo : dim.key === 'mente' ? setMente : setEmociones;
                    return (
                      <div key={dim.key} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-28 shrink-0">
                          <dim.icon className="w-4 h-4 text-[#E8962E]" />
                          <span className="text-xs text-[#F2EFE9]/70">{dim.label}</span>
                        </div>
                        <div className="flex-1"><Escala10 valor={val} onChange={set} color={colorDimension} /></div>
                        <span className="text-sm font-medium text-[#F2EFE9] w-5 text-right">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logro */}
              <div>
                <label className="block text-xs font-medium text-[#F2EFE9]/80 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#E8962E]" /> Tu logro de hoy — ¿qué avance te enorgullece?
                </label>
                <textarea
                  rows={2}
                  maxLength={LOGRO_MAX_CHARS}
                  placeholder="El avance del que estás orgulloso hoy..."
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl p-3 text-[#F2EFE9] text-sm focus:border-[#E8962E]/50 focus:ring-1 focus:ring-[#E8962E]/50 resize-none transition-all placeholder-[#F2EFE9]/30"
                  value={logro}
                  onChange={(e) => setLogro(e.target.value)}
                />
                <p className="text-[10px] text-[#F2EFE9]/30 mt-1 text-right">{logro.length}/{LOGRO_MAX_CHARS} · queda en tu historial para siempre</p>
              </div>

              {/* ¿En qué estuviste? */}
              <div>
                <label className="block text-xs font-medium text-[#F2EFE9]/80 mb-2 uppercase tracking-wider">
                  ¿En qué estuviste hoy? <span className="text-[#F2EFE9]/30 normal-case">(mínimo 1)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAREAS_TAGS.map((tag) => {
                    const on = tareas.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setTareas((prev) => toggle(prev, tag.id))}
                        className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                          on
                            ? 'border-[#E8962E]/40 text-[#F2EFE9] bg-[#E8962E]/10'
                            : 'border-white/8 text-[#F2EFE9]/40 hover:bg-white/5'
                        }`}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bloqueo */}
              <div>
                <label className="block text-xs font-medium text-[#F2EFE9]/80 mb-2 uppercase tracking-wider">
                  Bloqueos <span className="text-[#F2EFE9]/30 normal-case">(opcional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={BLOQUEO_MAX_CHARS}
                  placeholder="¿Algo te frenó hoy? Técnico, emocional, externo. No hay respuesta mala."
                  className="w-full bg-black/20 border border-dashed border-[rgba(232,150,46,0.12)] rounded-xl p-3 text-[#F2EFE9] text-sm focus:border-[#E8962E]/50 focus:ring-1 focus:ring-[#E8962E]/50 resize-none transition-all placeholder-[#F2EFE9]/30"
                  value={bloqueo}
                  onChange={(e) => setBloqueo(e.target.value)}
                />
              </div>

              {/* Checkeos rápidos */}
              <div className="bg-[#1A1917]/30 rounded-xl p-4 border border-[rgba(232,150,46,0.1)]">
                <div className="flex items-center gap-2 mb-3">
                  <HeartPulse className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-xs font-medium text-[#F2EFE9]/80 uppercase tracking-wider">Checkeos rápidos</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CHECKEOS_CHIPS.map((chip) => {
                    const on = checkeos.includes(chip.id);
                    const Icon = CHECKEO_ICONS[chip.id] ?? Check;
                    const onColor = chip.positivo
                      ? 'border-[#22C55E]/30 text-[#22C55E] bg-[#22C55E]/5'
                      : 'border-[#E09040]/30 text-[#E09040] bg-[#E09040]/5';
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setCheckeos((prev) => toggle(prev, chip.id))}
                        className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${
                          on ? onColor : 'border-white/8 text-[#F2EFE9]/35 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guardar */}
              <button
                onClick={handleGuardar}
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-[#E8962E] hover:bg-[#F4B65C] disabled:opacity-50 text-[#0A0806] font-semibold tracking-wide transition-all flex justify-center items-center gap-2"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 anímate-spin" /> Guardando...</>
                ) : (
                  <><Send className="w-4 h-4" /> Guardar entrada del día</>
                )}
              </button>
              <p className="text-[10px] text-[#F2EFE9]/30 text-center -mt-3">
                El score se calcula y se muestra después de guardar.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Vista: Historial ── */}
      {vista === 'historial' && (
        <div className="space-y-4">
          {loading && entries.length === 0 && (
            <div className="flex items-center gap-2 text-[#F2EFE9]/40 text-sm">
              <Loader2 className="w-4 h-4 anímate-spin" /> Cargando historial...
            </div>
          )}
          {entries.length === 0 && !loading && (
            <p className="text-center text-[#F2EFE9]/40 text-sm py-12">Aún no hay entradas en el Diario.</p>
          )}
          {entries.map((entrada) => (
            <div key={entrada.id} className="card-panel p-5 rounded-2xl border-l-4 border-l-[#E8962E]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#E8962E] font-medium">
                  {new Date(entrada.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#E8962E]/15 text-[#E8962E]">
                    {entrada.score}/100
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    entrada.energia >= 7 ? 'bg-emerald-500/15 text-[#22C55E]' :
                    entrada.energia >= 4 ? 'bg-[#E8962E]/15 text-[#E8962E]' :
                    'bg-red-500/15 text-[#EF4444]'
                  }`}>
                    <Zap className="w-3 h-3 inline" /> {entrada.energia}/10
                  </span>
                </div>
              </div>

              {entrada.logro && (
                <div>
                  <span className="text-[#F2EFE9]/30 uppercase tracking-wider text-[10px]">Logro</span>
                  <p className="text-[#F2EFE9]/80 mt-0.5 text-sm">{entrada.logro}</p>
                </div>
              )}

              <div className="flex gap-3 text-[11px] text-[#F2EFE9]/50">
                <span>Cuerpo {entrada.cuerpo}</span>
                <span>Mente {entrada.mente}</span>
                <span>Emociones {entrada.emociones}</span>
              </div>

              {entrada.bloqueo && (
                <div>
                  <span className="text-[#F2EFE9]/30 uppercase tracking-wider text-[10px]">Bloqueo</span>
                  <p className="text-[#F2EFE9]/70 mt-0.5 text-sm">{entrada.bloqueo}</p>
                </div>
              )}

              {entrada.tareas.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {entrada.tareas.map((id) => {
                    const tag = TAREAS_TAGS.find((t) => t.id === id);
                    return tag ? (
                      <span key={id} className="text-[10px] bg-[#E8962E]/5 px-2 py-1 rounded-full text-[#F2EFE9]/60">
                        {tag.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
