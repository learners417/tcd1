import { teaserDeMeta } from '../lib/teasers';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { listarEvidencias, subirEvidencia } from '../lib/evidencia';
import {
  CheckCircle2,
  Circle,
  Lock,
  Check,
  ChevronUp,
  Star,
  Trophy,
  Zap,
  AlertCircle,
  FileText,
  Play,
  Wrench,
  MessageSquare,
  Bot,
  Map as MapIcon,
  Sprout,
  BookOpen,
  Target,
  Sunrise,
  UserCircle,
  Lightbulb,
  Triangle,
  Cog,
  Building2,
  Megaphone,
  Phone,
  Handshake,
  Palette,
  BarChart3,
} from 'lucide-react';

// ─── Icon map for pilar icons ─────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  BookOpen,
  Target,
  Sunrise,
  UserCircle,
  Lightbulb,
  Triangle,
  Cog,
  Building2,
  Megaphone,
  Phone,
  Handshake,
  Palette,
  BarChart3,
};
import { supabase, isSupabaseReady, guardarFila } from '../lib/supabase';
import type { HojaDeRutaItem, VentaRegistrada, ProfileV2 } from '../lib/supabase';
import {
  SEED_ROADMAP_V2,
  roadmap,
  FASES_ROADMAP,
  calcularNivel,
  TOTAL_METAS,
  type RoadmapPilar,
  type RoadmapMeta,
} from '../lib/roadmapSeed';
import { getYoutubeVideoId } from '../lib/videos';
import { NIVEL_NOMBRES, NIVEL_METADATA } from '../lib/supabase';
import TaskVideo from '../components/tasks/TaskVideo';
import TaskCoach from '../components/tasks/TaskCoach';
import SesionViva from '../components/sesion/SesionViva';
import TaskFotoPartida from '../components/tasks/TaskFotoPartida';
import TaskMapaMamuska from '../components/tasks/TaskMapaMamuska';
import EspejoIdentidadModal from '../components/EspejoIdentidadModal';
import ComparacionDia45 from '../components/ComparacionDia45';
import PilarUnlockedModal from '../components/PilarUnlockedModal';
import { planDe, planPermitePilar, NOMBRE_PLAN, waLink, planParaPilar, checkoutUrl, PRECIO_FUNDADOR } from '../lib/planes';
import Graduacion from '../components/Graduacion';
import { registrarSesionCompletada } from '../lib/racha';
import { diaDelPrograma, diasHabilesDeAtraso, estaEnFaseAutonomia, mensajeDeRitmo, esPasoDelCliente, pilarAlcanzado, primerDiaDelPilar } from '../lib/diaPrograma';
import EncabezadoCamino, { type SistemaAvance, type PasoDeHoy } from '../components/camino/EncabezadoCamino';
import CintaCinturon from '../components/CintaCinturon';

// Lote D: adapta el encuadre de ciertas sesiones según el avatar del sanador
import { notificarPilarCompletado, notificarCinturon } from '../lib/notifications';
import { otorgarCinturonPorPilar, calcularCinturon, cinturonDesdeProgreso } from '../lib/cinturones';
import Dia45Banner from '../components/Dia45Banner';
import { validarADNDia45, compararFotoPartida } from '../lib/diaValidator';
import { usePersistedState } from '../lib/usePersistedState';
import { VOC } from '../lib/vocabulario';
import PuntoDePartida, { KEY_PARTIDA } from '../components/PuntoDePartida';
import { mapaDeVideos, PDFS_POR_TUTORIAL } from '../lib/videosCargados';
import { baseDeOnboarding } from '../lib/onboardingBase';
import VeredictoCriticoPanel from '../components/VeredictoCriticoPanel';
import { codigoDelDia } from '../lib/roadmapSeed';
import { codigosEnRevision, revisionDelDia, pasosDeRevision, proximoLunes, YA_TIENES } from '../lib/yaTienes';
import TestEneagrama from '../components/tasks/TestEneagrama';
import { tipo as tipoEneagrama } from '../lib/eneagrama';
import PreventaPanel from '../components/tasks/PreventaPanel';
import { precioSellado } from '../lib/bonosPreventa';
import HojaDeRuta from '../components/camino/HojaDeRuta';
import { sellarDia, desactualizados, avisoDe } from '../lib/adnCoincidente';

// ─── Constantes v8 ────────────────────────────────────────────────────────────

/**
 * Campos del perfil que se persisten como JSONB (array/objeto), no como text.
 * El componente custom de cada tarea entrega el valor ya estructurado, pero el
 * `onSaveADN` recibe el outputTexto como JSON.stringify(value). Para que la DB
 * reciba el tipo correcto (y la re-hidratación al re-abrir la tarea funcione),
 * parseamos el JSON antes del UPDATE. Si el parse falla, caemos al string raw.
 */
const CAMPOS_JSONB_ARRAY = new Set<string>([
  'adn_autoevaluacion_dia1',         // P0.2 · Foto de Partida · number[]
  'adn_metodo_mapeo_obstaculos',     // P7.4 + P8.8 (Mamuska) · AdnMapeoObstaculos[]
  'adn_diagnostico_capa',            // P2.4 · AdnDiagnosticoCapa
  'adn_cinco_no',                    // P2.5 · AdnCincoNo
  'adn_oferta_ultralow',             // P8.3 · AdnOfertaUltralow
  'adn_validacion_organica',         // P9A.4 · AdnValidacionOrganica
]);

// ─── Tipos locales ────────────────────────────────────────────────────────────

type EstadoPilar = 'completado' | 'en_progreso' | 'bloqueado' | 'plan_bloqueado';

interface PilarConEstado extends RoadmapPilar {
  estado: EstadoPilar;
  metasCompletadas: number;
  totalMetas: number;
  estrellas_completadas: number;
}

interface Props {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  onNavigate?: (page: string) => void;
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTypeBadge(tipo: string) {
  switch (tipo) {
    case 'VIDEO':
      return { icon: Play, label: 'VIDEO', color: 'text-gold', bg: 'bg-gold/10 border-gold/20' };
    case 'HERRAMIENTA':
      return { icon: Wrench, label: 'HERRAMIENTA', color: 'text-success', bg: 'bg-success/10 border-success/20' };
    case 'COACH':
      return { icon: MessageSquare, label: 'MENTOR', color: 'text-cream/70', bg: 'bg-cream/5 border-cream/15' };
    default:
      return { icon: FileText, label: tipo, color: 'text-cream/65', bg: 'bg-cream/5 border-cream/10' };
  }
}

/**
 * Cuenta cuántas piezas válidas tiene el usuario en `adn_validacion_organica`.
 * v8 · P9A.4 guarda JSONB que viene de DB · puede ser undefined, null, string
 * malformado, número, array vacío, o el objeto esperado `{ piezas: [...] }`.
 * Esta función es defensiva contra todos eeres caeres y devuelve siempre un int ≥0.
 */
function contarPiezasValidacionOrganica(perfil?: { adn_validacion_organica?: unknown }): number {
  const val = perfil?.adn_validacion_organica;
  if (!val || typeof val !== 'object' || Array.isArray(val)) return 0;
  const piezas = (val as { piezas?: unknown }).piezas;
  if (!Array.isArray(piezas)) return 0;
  return piezas.length;
}

/** Check if a task is unlocked within its pilar (previous orden tasks must be completed) */
function isTaskUnlocked(
  meta: RoadmapMeta,
  pilar: RoadmapPilar,
  completadas: Set<string>,
  perfil?: { adn_validacion_organica?: unknown },
): boolean {
  if (meta.orden > 1) {
    // All tasks with lower orden must be completed
    for (const m of pilar.metas) {
      if (m.orden < meta.orden && !completadas.has(`${pilar.numero}-${m.codigo}`)) {
        return false;
      }
    }
  }

  // No se enciende publicidad sin las piezas grabadas: el día 31 depende del
  // rodaje del 27. (Antes esta regla apuntaba a P9A.5, del Camino viejo, así
  // que no frenaba nada.)
  if (meta.codigo === codigoDelDia(31) && contarPiezasValidacionOrganica(perfil) < 3) {
    return false;
  }

  return true;
}

/** Mensaje de bloqueo específico cuando una tarea NO está desbloqueada. */
function motivoBloqueo(
  meta: RoadmapMeta,
  perfil?: { adn_validacion_organica?: unknown },
): string | null {
  if (meta.codigo === codigoDelDia(31)) {
    const count = contarPiezasValidacionOrganica(perfil);
    if (count < 3) {
      return `Se enciende con tus tres anuncios grabados. Tienes ${count} de 3.`;
    }
  }
  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────


/** 📎 Documenta tu trabajo — la evidencia universal (Punto 7 · el archivo del viaje) */
function EvidenciaUniversal({ userId, metaCodigo }: { userId?: string; metaCodigo: string }) {
  const [items, setItems] = useState<{ id: string; url?: string; nombre?: string }[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!userId) return;
    listarEvidencias(userId, metaCodigo).then((evs) => setItems((evs ?? []).map((e: { id?: string; path?: string; nombre?: string }) => ({ id: String(e.id ?? e.path ?? Math.random()), nombre: e.nombre })))).catch(() => {});
  }, [userId, metaCodigo]);
  if (!userId) return null;
  return (
    <div className="mt-4 pt-4 border-t border-[rgba(232,150,46,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/55">📎 Documenta tu trabajo</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="text-sm px-3 py-1.5 rounded-lg border border-[rgba(232,150,46,0.2)] text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
        >
          {subiendo ? 'Subiendo…' : '+ Subir foto · captura · doc'}
        </button>
      </div>
      {items.length > 0 && <p className="text-sm text-success mt-1.5">✓ {items.length} {items.length === 1 ? 'evidencia guardada' : 'evidencias guardadas'} — tu equipo las ve</p>}
      <input ref={inputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f || !userId) return;
        setSubiendo(true);
        try {
          await subirEvidencia(userId, metaCodigo, f);
          setItems((prev) => [...prev, { id: String(Date.now()), nombre: f.name }]);
        } catch { /* el toast global lo maneja */ }
        setSubiendo(false);
        if (inputRef.current) inputRef.current.value = '';
      }} />
    </div>
  );
}

export default function Roadmap({ userId, perfil, onNavigate, onProfileFieldUpdate }: Props) {
  const [completadas, setCompletadas] = useState<Set<string>>(new Set());
  const [ventas, setVentas] = useState<VentaRegistrada[]>([]);
  // T2/T3 · registrar venta + graduación (rediseño 4 fases)
  const [, setPartidaResuelta] = useState(false);
  const [ventaModal, setVentaModal] = useState(false);
  const [ventaMonto, setVentaMonto] = useState('');
  const [ventaGuardando, setVentaGuardando] = useState(false);
  const [graduacionVisible, setGraduacionVisible] = useState(false);

  const registrarVenta = async () => {
    if (!supabase || ventaGuardando) return;
    const monto = parseFloat(ventaMonto);
    if (!monto || monto <= 0) return;
    setVentaGuardando(true);
    try {
      const { data, error } = await supabase
        .from('ventas_registradas')
        .insert({
          usuario_id: userId,
          fecha: new Date().toISOString().slice(0, 10),
          monto,
          canal: 'llamada',
        })
        .select()
        .single();
      if (!error && data) {
        const nuevas = [...ventas, data as VentaRegistrada];
        setVentas(nuevas);
        setVentaModal(false);
        setVentaMonto('');
        // La GRADUACIÓN: al llegar a 10, una sola vez.
        if (nuevas.length >= 10 && !localStorage.getItem('tcd_graduacion_vista')) {
          localStorage.setItem('tcd_graduacion_vista', '1');
          setGraduacionVisible(true);
        }
      }
    } finally {
      setVentaGuardando(false);
    }
  };
  const [qaVerde, setQaVerde] = useState(false);
  const [pilarAbierto, setPilarAbierto] = usePersistedState<number | null>(
    'tcd_roadmap_pilar',
    null,
    { validate: (v) => v === null || (typeof v === 'number' && Number.isInteger(v)) },
  );
  const [celebracion, setCelebracion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMeta, setActiveMeta] = useState<string | null>(null); // codigo of active task
  const [taskOutputs, setTaskOutputs] = useState<Map<string, string>>(new Map());
  const [pilarUnlocked, setPilarUnlocked] = useState<{
    completado: string;
    desbloqueado?: string;
    numero: number;
    nivelAlcanzado?: { numero: 1 | 2 | 3 | 4 | 5; nombre: string; descripcion: string };
    cinturon?: { nombre: string; emoji: string; metafora: string };
    mentorPregunta?: string;
  } | null>(null);
  // v8 · Espejo de Identidad — modal de cierre de F1 al completar P3.
  // Se muestra UNA SOLA VEZ por usuario (persistencia en localStorage para
  // sobrevivir reloads · ref para evitar re-trigger en el mismo render loop).
  const [espejoVisible, setEspejoVisible] = useState(false);
  const espejoYaMostradoRef = useRef<boolean>(
    typeof window !== 'undefined'
      ? localStorage.getItem('tcd_espejo_identidad_mostrado') === '1'
      : false,
  );
  const [videosPorPilar, setVideosPorPilar] = useState<Record<string, string>>(() => mapaDeVideos());
  const prevCompletadasRef = useRef<Set<string>>(new Set());
  const detalleRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);

  // ─── Seed enriquecido con videos reales de programa_videos ─────────────
  // ── Gating por plan: EL NÚMERO ($27) abre P0-P1; el resto queda visible y bloqueado ──
  const planLimitado = useMemo(() => {
    try {
      const p = localStorage.getItem('tcd_plan') || JSON.parse(localStorage.getItem('tcd_profile') ?? '{}')?.plan;
      return p === 'ELNUMERO';
    } catch { return false; }
  }, []);

  const seedConVideos: RoadmapPilar[] = useMemo(() => {
    if (Object.keys(videosPorPilar).length === 0) return SEED_ROADMAP_V2;
    return SEED_ROADMAP_V2.map(pilar => {
      const delPilar = videosPorPilar[pilar.id];
      return {
        ...pilar,
        // El enlace se busca primero por la jornada (P1.0) y después por el
        // pilar: así cada video cae en el día que le toca.
        metas: pilar.metas.map(meta => {
          const ytId = videosPorPilar[meta.codigo] ?? (meta.tipo === 'VIDEO' ? delPilar : undefined);
          return ytId ? { ...meta, video_youtube_id: ytId } : meta;
        }),
      };
    });
  }, [videosPorPilar]);

  // ─── Cargar datos de Supabase ───────────────────────────────────────────
  useEffect(() => {
    async function cargar() {
      if (!isSupabaseReady() || !supabase || !userId) {
        // Modo offline: cargar desde localStorage
        try {
          const saved = localStorage.getItem('tcd_hoja_ruta_v2');
          if (saved) setCompletadas(new Set(JSON.parse(saved)));
        } catch { /* noop */ }
        setLoading(false);
        return;
      }

      const [{ data: hdr }, { data: vts }, { data: vids }] = await Promise.all([
        supabase.from('hoja_de_ruta').select('*').eq('usuario_id', userId),
        supabase.from('ventas_registradas').select('*').eq('usuario_id', userId),
        supabase.from('programa_videos').select('pilar_id, youtube_url').order('created_at', { ascending: true }),
      ]);

      if (hdr) {
        const keys = (hdr as HojaDeRutaItem[])
          .filter((r) => r.completada)
          .map((r) => `${r.pilar_numero}-${r.meta_codigo}`);
        setCompletadas(new Set(keys));
        // Capa 4 · D8: la DB es la fuente de verdad — sincroniza el caché local
        try { localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify(keys)); } catch { /* noop */ }

        // QA verde check — legacy, ya no se usa en V3
        // pero mantenemos para no romper el estado
        const qa = (hdr as HojaDeRutaItem[]).find(
          (r) => r.pilar_numero === 6 && (r.meta_codigo as string) === '6.B',
        );
        if (qa?.output_generado && qa.output_generado['qa_points_green'] === '24') {
          setQaVerde(true);
        }
      }

      if (vts) setVentas(vts as VentaRegistrada[]);

      if (vids) {
        // Lo cargado en el tablero pisa a lo que viene por archivo.
        const map: Record<string, string> = mapaDeVideos();
        for (const v of vids as { pilar_id: string | null; youtube_url: string }[]) {
          if (!v.pilar_id || !v.youtube_url) continue;
          const ytId = getYoutubeVideoId(v.youtube_url);
          if (ytId) map[v.pilar_id] = ytId;
        }
        setVideosPorPilar(map);
      }

      setLoading(false);
    }
    cargar();
  }, [userId]);

  // ─── Persistir en localStorage ──────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('tcd_hoja_ruta_v2', JSON.stringify([...completadas]));
  }, [completadas]);

  // ─── Sincronizar progreso en perfil de Supabase (para el Admin) ────────
  useEffect(() => {
    if (!isSupabaseReady() || !supabase || !userId) return;
    const pct = TOTAL_METAS === 0 ? 0 : Math.round((completadas.size / TOTAL_METAS) * 100);
    supabase.from('profiles').update({ progreso_porcentaje: pct }).eq('id', userId).then(() => {});
  }, [completadas, userId]);

  // ─── Cargar outputs de tareas guardados ────────────────────────────────
  useEffect(() => {
    const outputs = new Map<string, string>();
    // 1. localStorage: tcd_herramienta_* keys cross-referenced with seed
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith('tcd_herramienta_')) continue;
      const herramientaId = k.replace('tcd_herramienta_', '');
      for (const pilar of seedConVideos) {
        for (const meta of pilar.metas) {
          if (meta.herramienta_id === herramientaId) {
            const val = localStorage.getItem(k);
            if (val) outputs.set(`${pilar.numero}-${meta.codigo}`, val);
          }
        }
      }
    }
    // 2. Supabase: rows with output_generado
    if (isSupabaseReady() && supabase && userId) {
      supabase
        .from('hoja_de_ruta')
        .select('pilar_numero,meta_codigo,output_generado')
        .eq('usuario_id', userId)
        .not('output_generado', 'is', null)
        .then(({ data }) => {
          if (!data) { setTaskOutputs(outputs); return; }
          const updated = new Map(outputs);
          for (const row of data as Array<{ pilar_numero: number; meta_codigo: string; output_generado: Record<string, unknown> | null }>) {
            const key = `${row.pilar_numero}-${row.meta_codigo}`;
            if (row.output_generado?.texto && typeof row.output_generado.texto === 'string') {
              updated.set(key, row.output_generado.texto);
            }
          }
          setTaskOutputs(updated);
        });
    } else {
      setTaskOutputs(outputs);
    }
  }, [userId]);

  // ─── Auto-open task from ManualNegocio navigation ─────────────────────
  useEffect(() => {
    if (loading) return;
    const autoOpen = localStorage.getItem('tcd_auto_open_adn_field');
    if (!autoOpen) return;
    localStorage.removeItem('tcd_auto_open_adn_field');
    // Find the pilar and meta that has this adn_field
    for (const pilar of seedConVideos) {
      for (const meta of pilar.metas) {
        if (meta.adn_field === autoOpen) {
          setPilarAbierto(pilar.numero);
          setActiveMeta(meta.codigo);
          // Scroll after render
          setTimeout(() => taskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
          return;
        }
      }
    }
  }, [loading]);

  // ─── Lógica de desbloqueo ───────────────────────────────────────────────
  const calcularEstadoPilar = useCallback(
    (pilar: RoadmapPilar, _pilares: RoadmapPilar[], diaDelPaso: number | null): EstadoPilar => {
      const completadasPilar = pilar.metas.filter((m) =>
        completadas.has(`${pilar.numero}-${m.codigo}`),
      ).length;
      const totalMetas = pilar.metas.length;

      // Se abre cuando el cliente llega a su primer paso (ver pilarAlcanzado).
      let desbloqueado = pilarAlcanzado(pilar.metas, completadasPilar, diaDelPaso);
      // Plan EL NÚMERO: su tramo es P0-P1; lo demás se ve pero no se abre.
      // Esa vista bloqueada ES el mapa del camino completo (la venta interna).
      if (planLimitado && pilar.numero > 1) desbloqueado = false;


      if (!desbloqueado) return 'bloqueado';
      if (completadasPilar >= totalMetas) return 'completado';
      return 'en_progreso';
    },
    [completadas, planLimitado],
  );

  // ─── Validación Día 45 (Regla #6 v8) ────────────────────────────────────
  // El día sale del calendario, nunca de la columna dia_programa (se congela
  // cuando el cliente deja de completar metas).
  const diaActual = diaDelPrograma(perfil?.fecha_inicio) ?? perfil?.dia_programa ?? 1;
  // El paso en el que va: el primero sin completar, en el orden del Camino.
  let diaEsperado: number | null = null;
  let pasoDeHoy: (PasoDeHoy & { pilar: number; sistema: number | null }) | null = null;
  buscarPaso: for (const pil of seedConVideos) {
    for (const m of pil.metas ?? []) {
      if (!esPasoDelCliente(m)) continue;
      if (!completadas.has(`${pil.numero}-${m.codigo}`)) {
        diaEsperado = m.dia_asignado ?? null;
        pasoDeHoy = {
          pilar: pil.numero,
          sistema: m.sistema === 0 ? roadmap.sistemas.length + 2 : (m.sistema ?? roadmap.sistemas.length + 1),
          codigo: m.codigo,
          titulo: m.titulo,
          descripcion: m.descripcion,
          tiempo: m.tiempo_estimado,
          salesCon: m.evidencia_requerida?.nombre ?? null,
        };
        break buscarPaso;
      }
    }
  }
  // El anillo: cuántos pasos del cliente van hechos en cada sistema.
  // Las jornadas sin sistema (campo, ciclo, cierre) van en un último tramo,
  // "La operación", para que el anillo cuente los mismos pasos que el Camino.
  // Y las del final (sistema 0, días 87 a 90) en "El cierre".
  const TRAMO_OPERACION = roadmap.sistemas.length + 1;
  const TRAMO_CIERRE = roadmap.sistemas.length + 2;
  const tramoDe = (m: { sistema?: number | null }) =>
    m.sistema === 0 ? TRAMO_CIERRE : (m.sistema ?? TRAMO_OPERACION);
  const sistemasAvance: SistemaAvance[] = [
    ...roadmap.sistemas.map((sis) => ({ n: sis.n, nombre: sis.nombre, esSistema: true })),
    { n: TRAMO_OPERACION, nombre: 'La operación', esSistema: false },
    { n: TRAMO_CIERRE, nombre: 'El cierre', esSistema: false },
  ].map((t) => {
    let hechas = 0, total = 0;
    for (const pil of seedConVideos) for (const m of pil.metas ?? []) {
      if (tramoDe(m) !== t.n || !esPasoDelCliente(m)) continue;
      total++;
      if (completadas.has(`${pil.numero}-${m.codigo}`)) hechas++;
    }
    return { ...t, hechas, total };
  }).filter((t) => t.total > 0);
  const cinturonCamino = cinturonDesdeProgreso(completadas);
  // El candado de la Fase 4 mira el PASO, no el calendario: a quien va por el
  // día 15 no le corresponde todavía hablar de la Fase 4. Camino terminado
  // (sin paso pendiente) no tiene nada que bloquear.
  const validacionDia45 = validarADNDia45(perfil ?? {}, diaEsperado ?? undefined);
  const comparacionDia45 = compararFotoPartida(perfil ?? {});

  // ─── Enriquecer pilares con estado ─────────────────────────────────────
  const pilaresConEstado: PilarConEstado[] = seedConVideos.map((pilar) => {
    let estado = calcularEstadoPilar(pilar, seedConVideos, diaEsperado);
    // Día 45 con ADN incompleto → forzar bloqueo de Fase 4 (Regla #5 v7)
    if (validacionDia45.debeBloquearFase4 && pilar.fase === 4 && estado !== 'completado') {
      estado = 'bloqueado';
    }
    // ═══ El candado comercial (manda sobre todo): el pilar pertenece a un plan superior ═══
    if (!planPermitePilar(planDe(perfil), pilar.numero)) estado = 'plan_bloqueado';
    const metasCompletadas = pilar.metas.filter((m) =>
      completadas.has(`${pilar.numero}-${m.codigo}`),
    ).length;
    const estrellas_completadas = pilar.metas.filter(
      (m) => m.es_estrella && completadas.has(`${pilar.numero}-${m.codigo}`),
    ).length;
    return { ...pilar, estado, metasCompletadas, totalMetas: pilar.metas.length, estrellas_completadas };
  });

  // ─── Auto-expand first incomplete pilar on load ─────────────────────────
  useEffect(() => {
    // G2: deep-link desde el Dashboard (COMENZAR → el pilar de la sesión)
    try {
      const flag = localStorage.getItem('tcd_abrir_pilar');
      if (flag) {
        localStorage.removeItem('tcd_abrir_pilar');
        const n = parseInt(flag, 10);
        if (!Number.isNaN(n) && n > 0) { setPilarAbierto(n); return; }
      }
    } catch { /* noop */ }
    if (loading || pilarAbierto !== null) return;
    const firstIncomplete = pilaresConEstado.find(p => p.estado === 'en_progreso');
    if (firstIncomplete) {
      setPilarAbierto(firstIncomplete.numero);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Detect pilar completion → show unlock popup ──────────────────────
  useEffect(() => {
    if (loading) return;
    const prev = prevCompletadasRef.current;
    if (prev.size === 0 && completadas.size > 0) {
      // Initial load, just save ref
      prevCompletadasRef.current = new Set(completadas);
      return;
    }

    // Check if any pilar just became completed
    for (const pilar of pilaresConEstado) {
      const wasComplete = pilar.metas.every(m => prev.has(`${pilar.numero}-${m.codigo}`));
      const isNowComplete = pilar.estado === 'completado';
      if (!wasComplete && isNowComplete) {
        const nextPilar = pilaresConEstado.find(p => p.numero_orden === pilar.numero_orden + 1);

        // ¿Este pilar es trigger de un nuevo nivel? (v7 · Anexo A)
        const triggerNivelEntry = (Object.entries(NIVEL_METADATA) as [string, typeof NIVEL_METADATA[1]][])
          .find(([, meta]) => meta.triggerPilar === pilar.id);
        const nivelAlcanzado = triggerNivelEntry
          ? {
              numero: Number(triggerNivelEntry[0]) as 1 | 2 | 3 | 4 | 5,
              nombre: triggerNivelEntry[1].nombre,
              descripcion: triggerNivelEntry[1].descripcion,
            }
          : undefined;

        // Capa 3 · rediseño 4 fases: otorgar el cinturón (DB) y llevarlo al modal.
        void otorgarCinturonPorPilar(pilar.id);
        // G1 · Los despertares: la campanita celebra
        if (userId) {
          void notificarPilarCompletado(userId, pilar.titulo, pilar.numero);
          const cintG1 = calcularCinturon(pilar.numero);
          void notificarCinturon(userId, cintG1.emoji, cintG1.nombre, cintG1.metafora);
        }
        const cinturonGanado = calcularCinturon(pilar.id);

        setPilarUnlocked({
          completado: pilar.titulo,
          desbloqueado: nextPilar && nextPilar.estado !== 'bloqueado' && nextPilar.estado !== 'plan_bloqueado' ? nextPilar.titulo : undefined,
          numero: pilar.numero,
          nivelAlcanzado,
          cinturon: {
            nombre: cinturonGanado.nombre,
            emoji: cinturonGanado.emoji,
            metafora: cinturonGanado.metafora,
          },
          mentorPregunta: pilar.mentor_pregunta,
        });
        // v8 · Cierre F1 · al completar P3 mostramos el Espejo de Identidad
        // una sola vez por usuario (no re-disparar en reloads ni en re-renders).
        if (pilar.id === 'P1' && !espejoYaMostradoRef.current) {
          espejoYaMostradoRef.current = true;
          try {
            localStorage.setItem('tcd_espejo_identidad_mostrado', '1');
          } catch {
            // localStorage no disponible (e.g. modo privado) · sin fallback
          }
          setEspejoVisible(true);
        }
        break;
      }
    }

    prevCompletadasRef.current = new Set(completadas);
  }, [completadas, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Métricas globales ─────────────────────────────────────────────────
  const totalCompletadas = completadas.size;
  const progresoPct = TOTAL_METAS === 0 ? 0 : Math.round((totalCompletadas / TOTAL_METAS) * 100);
  const pilarMasAltoCompletado = pilaresConEstado
    .filter((p) => p.estado === 'completado')
    .reduce((max, p) => Math.max(max, p.numero), -1);
  const nivel = calcularNivel(pilarMasAltoCompletado);
  const nombreNivel = NIVEL_NOMBRES[nivel];
  const cinturonActual = calcularCinturon(pilarMasAltoCompletado);

  // Banner de ritmo: día real del programa vs el día asignado de la próxima tarea pendiente
  const diaPrograma = diaActual;
  const diasAtraso = diasHabilesDeAtraso(perfil?.fecha_inicio, diaEsperado, diaPrograma);
  const ritmo = mensajeDeRitmo(diaPrograma, diaEsperado, diasAtraso);
  // Fase Autonomía: por dónde está en el Camino (o si lo terminó), no por fecha.
  const faseAutonomia = estaEnFaseAutonomia(diaEsperado, totalCompletadas > 0 && totalCompletadas >= TOTAL_METAS);

  // ─── Toggle completar meta ─────────────────────────────────────────────
  const toggleMeta = useCallback(
    async (pilarNum: number, meta: RoadmapMeta, pilarEstado: EstadoPilar) => {
      if (pilarEstado === 'bloqueado' || pilarEstado === 'plan_bloqueado') return;

      const key = `${pilarNum}-${meta.codigo}`;
      const ahoraCompletada = !completadas.has(key);

      setCompletadas((prev) => {
        const next = new Set(prev);
        if (ahoraCompletada) next.add(key);
        else next.delete(key);
        return next;
      });

      // Celebración
      if (ahoraCompletada && meta.es_estrella) {
        try { localStorage.setItem('tcd_sesion_hoy_' + new Date().toISOString().slice(0, 10), meta.titulo); } catch { /* noop */ }
        setCelebracion(`✓ Micro-sesión completada: ${VOC(meta.titulo)} — ¿te quedó energía? La siguiente ya está desbloqueada. Puedes adelantar.`);
        setTimeout(() => setCelebracion(null), 5000);
      }

      // Sincronizar con Supabase
      if (isSupabaseReady() && supabase && userId) {
        await guardarFila('hoja_de_ruta', {
            usuario_id: userId,
            pilar_numero: pilarNum,
            meta_codigo: meta.codigo,
            completada: ahoraCompletada,
            es_estrella: meta.es_estrella,
            fecha_completada: ahoraCompletada ? new Date().toISOString().split('T')[0] : null,
          }, ['usuario_id', 'pilar_numero', 'meta_codigo']);
      }
    },
    [completadas, userId],
  );

  // ─── Parse historia output into 3 separate versions ────────────────────
  function parseHistoriaVersions(texto: string): { historia_300: string; historia_150: string; historia_50: string } | null {
    const match300 = texto.match(/---\s*HISTORIA\s+300\s+PALABRAS\s*---\s*([\s\S]*?)(?=---\s*HISTORIA\s+150|$)/i);
    const match150 = texto.match(/---\s*HISTORIA\s+150\s+PALABRAS\s*---\s*([\s\S]*?)(?=---\s*HISTORIA\s+50|$)/i);
    const match50 = texto.match(/---\s*HISTORIA\s+50\s+PALABRAS\s*---\s*([\s\S]*?)$/i);
    if (!match300 || !match150 || !match50) return null;
    return {
      historia_300: match300[1].trim(),
      historia_150: match150[1].trim(),
      historia_50: match50[1].trim(),
    };
  }

  // ─── Parse P5.2 "Definidor de Nicho y PUV" output ──────────────────────
  // La herramienta H-P5.2 genera la descripcion del nicho + 3 variantes de
  // PUV ("Ayudo a [avatar] a [resultado] sin [obstaculo]"). El campo
  // adn_field declarado es solo adn_nicho · pero el documento maestro v7
  // dice que la PUV vive en adn_usp. Antes de este fix · la PUV quedaba
  // sepultada dentro de adn_nicho y el Mentor pensaba que estaba vacia ·
  // mandando al sanador a rehacer una tarea ya hecha (caso Sol).
  function parseNichoYPuv(texto: string): { adn_nicho: string; adn_usp?: string } {
    // 1) PUV recomendada por la IA (formato "GANADORA RECOMENDADA: ...")
    const ganadora = texto.match(/GANADORA\s+RECOMENDADA\s*:?\s*([\s\S]*?)(?=\n\s*(?:C[OÓ]MO|VARIANTE|---|$))/i);
    // 2) Primera variante "Ayudo a [avatar] a [resultado] sin [obstaculo]"
    const ayudoA = texto.match(/Ayudo(?:mos)?\s+a\s+[^.\n]{15,250}/i);
    // 3) Linea "VARIANTE 1:" si esta presente
    const variante1 = texto.match(/VARIANTE\s*1\s*:?\s*([^\n]{15,250})/i);

    const puv = (ganadora?.[1] ?? variante1?.[1] ?? ayudoA?.[0] ?? '')
      .trim()
      .replace(/^["'\s]+|["'\s]+$/g, '');

    return {
      adn_nicho: texto,
      ...(puv.length > 0 ? { adn_usp: puv } : {}),
    };
  }

  // ─── Save ADN output from herramienta task ────────────────────────────
  const handleSaveADN = useCallback((pilarNum: number, meta: RoadmapMeta, outputTexto: string) => {
    const key = `${pilarNum}-${meta.codigo}`;
    setTaskOutputs(prev => new Map(prev).set(key, outputTexto));
    setCompletadas(prev => { const next = new Set(prev); next.add(key); return next; });
    // Save to localStorage for herramienta
    if (meta.herramienta_id) {
      localStorage.setItem(`tcd_herramienta_${meta.herramienta_id}`, outputTexto);
    }
    setCelebracion(`Documento guardado: ${VOC(meta.titulo)}`);
    setTimeout(() => setCelebracion(null), 5000);
    // Sync to Supabase
    if (isSupabaseReady() && supabase && userId) {
      guardarFila('hoja_de_ruta', {
          usuario_id: userId,
          pilar_numero: pilarNum,
          meta_codigo: meta.codigo,
          completada: true,
          es_estrella: meta.es_estrella,
          fecha_completada: new Date().toISOString().split('T')[0],
          output_generado: { texto: outputTexto },
        }, ['usuario_id', 'pilar_numero', 'meta_codigo']).then(() => {});

      // ─── Save to profiles table (ADN field) ─────────────────────────────
      if (meta.adn_field) {
        let profileUpdate: Record<string, unknown> = {};

        if (meta.adn_field === 'historia_300') {
          const parsed = parseHistoriaVersions(outputTexto);
          profileUpdate = parsed ?? { historia_300: outputTexto };
        } else if (meta.adn_field === 'adn_cinco_por_que') {
          const items = outputTexto
            .split(/\n/)
            .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
            .filter(l => l.length > 0);
          profileUpdate = { [meta.adn_field]: items };
        } else if (meta.adn_field === 'adn_nicho' && meta.codigo === 'P5.2') {
          // P5.2 genera nicho + 3 PUVs · guardamos ambos campos para que el
          // Coach IA no vuelva a mandar a definir la PUV (caso Sol).
          profileUpdate = parseNichoYPuv(outputTexto);
        } else if (CAMPOS_JSONB_ARRAY.has(meta.adn_field)) {
          // v8 · campos JSONB que reciben array/objeto desde el componente
          // custom. outputTexto viene como JSON.stringify(arr); parseamos para
          // que la DB reciba el tipo correcto y la re-hidratación funcione.
          try {
            profileUpdate = { [meta.adn_field]: JSON.parse(outputTexto) };
          } catch {
            profileUpdate = { [meta.adn_field]: outputTexto };
          }
        } else {
          profileUpdate = { [meta.adn_field]: outputTexto };
        }

        supabase.from('profiles').update(profileUpdate).eq('id', userId).then(() => {});
        // Update local profile state so ADN del Negocio reflects changes immediately
        onProfileFieldUpdate?.(profileUpdate);
      }
    }
  }, [userId, onProfileFieldUpdate]);

  // ─── Complete a task (VIDEO, COACH) ───────────────────────────────────
  /**
   * Punto de partida: guarda lo que el cliente ya trae hecho y fija el lunes
   * de arranque. No marca ninguna jornada: esas pasan a revisión, no a hechas.
   */
  const [desfasajes, setDesfasajes] = useState(() => desactualizados());
  const [rutaAbierta, setRutaAbierta] = useState(false);
  const [enRevision, setEnRevision] = useState<Set<string>>(() => codigosEnRevision());

  /**
   * Los pasos de hoy. Si el cliente ya traía eso hecho, la jornada es de
   * revisión: mira lo que tiene, lo mide contra los criterios y corrige.
   */
  /** El recuadro de contexto: lo que dijo al entrar, o que hoy revisa lo suyo. */
  const baseDeHoy = useCallback((meta: RoadmapMeta) => {
    const cosa = enRevision.has(meta.codigo) ? revisionDelDia(meta.dia_asignado ?? -1) : null;
    if (cosa) {
      return {
        etiqueta: 'Esto ya lo tienes',
        valor: VOC(`Hoy no lo construyes: revisas ${cosa.revisa} contra la vara y corriges lo que falte.`),
      };
    }
    return baseDeOnboarding(meta.dia_asignado);
  }, [enRevision]);

  const pasosDeHoy = useCallback((meta: RoadmapMeta) => {
    if (enRevision.has(meta.codigo)) {
      const cosa = revisionDelDia(meta.dia_asignado ?? -1);
      if (cosa) return pasosDeRevision(cosa).map((p) => VOC(p));
    }
    return (meta.pasos ?? []).map((p) => VOC(p));
  }, [enRevision]);

  const marcarPartida = useCallback((ids: string[]) => {
    const fechaInicio = proximoLunes();
    onProfileFieldUpdate?.({ fecha_inicio: fechaInicio, ya_tiene: ids });
    try {
      const perfilLocal = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}');
      localStorage.setItem('tcd_profile',
        JSON.stringify({ ...perfilLocal, fecha_inicio: fechaInicio, ya_tiene: ids }));
    } catch { /* noop */ }
    if (isSupabaseReady() && supabase && userId) {
      void supabase.from('profiles').update({ fecha_inicio: fechaInicio }).eq('id', userId);
    }
    setEnRevision(codigosEnRevision(ids));
  }, [userId, onProfileFieldUpdate]);

  /** El tutorial de Lupe del día, si ya tiene enlace cargado. */
  const tutorialDelDia = useCallback((dia: number | null | undefined) => {
    if (dia === null || dia === undefined) return null;
    const t = roadmap.tutoriales.find((x) => x.dia === dia && (videosPorPilar[x.codigo] || PDFS_POR_TUTORIAL[x.codigo]));
    if (!t) return null;
    const pdf = PDFS_POR_TUTORIAL[t.codigo];
    return (
      <div className="space-y-2">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Paso a paso en pantalla</p>
        <p className="text-[17px] text-cream">{VOC(t.titulo)} · {t.minutos} min</p>
        {videosPorPilar[t.codigo] && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[var(--line2,#DFD3BC)]">
          <iframe
            src={`https://www.youtube.com/embed/${videosPorPilar[t.codigo]}?rel=0&modestbranding=1`}
            title={VOC(t.titulo)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        )}
        {pdf && (
          <a href={pdf} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] text-[17px] font-semibold text-goldhi">
            El mismo paso a paso, en PDF
          </a>
        )}
      </div>
    );
  }, [videosPorPilar]);

  const handleCompleteTask = useCallback((pilarNum: number, meta: RoadmapMeta) => {
    registrarSesionCompletada(); // racha de sesiones (F2)
    // Queda la hora de esta versión: si después cambia su avatar, su método,
    // su oferta o su precio, la app sabe qué quedó viejo.
    if (meta.dia_asignado) { sellarDia(meta.dia_asignado); setDesfasajes(desactualizados()); }
    const key = `${pilarNum}-${meta.codigo}`;
    setCompletadas(prev => { const next = new Set(prev); next.add(key); return next; });
    if (meta.es_estrella) {
      try { localStorage.setItem('tcd_sesion_hoy_' + new Date().toISOString().slice(0, 10), meta.titulo); } catch { /* noop */ }
        setCelebracion(`✓ Micro-sesión completada: ${VOC(meta.titulo)} — ¿te quedó energía? La siguiente ya está desbloqueada. Puedes adelantar.`);
      setTimeout(() => setCelebracion(null), 5000);
    }
    // Sync to Supabase
    if (isSupabaseReady() && supabase && userId) {
      guardarFila('hoja_de_ruta', {
          usuario_id: userId,
          pilar_numero: pilarNum,
          meta_codigo: meta.codigo,
          completada: true,
          es_estrella: meta.es_estrella,
          fecha_completada: new Date().toISOString().split('T')[0],
        }, ['usuario_id', 'pilar_numero', 'meta_codigo']).then(() => {});
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-cream/55 text-sm">
        Cargando El Camino...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

      {/* ── Notificación de celebración ── */}
      {celebracion && (
        <div className="fade-rise fixed top-6 right-6 z-50 bg-gold/90 backdrop-blur text-ink text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300">
          {celebracion}
        </div>
      )}

      {/* ── Punto de partida: una sola vez, para el que ya venía andando ── */}
      {(() => {
        let yaEligio = true;
        try { yaEligio = Boolean(localStorage.getItem(KEY_PARTIDA)); } catch { yaEligio = true; }
        if (yaEligio || completadas.size > 0) return null;
        return (
          <PuntoDePartida
            onGuardar={marcarPartida}
            onCerrar={() => setPartidaResuelta(true)}
          />
        );
      })()}

      {/* Lo que quedó viejo cuando cambió una pieza de su ADN. */}
      {desfasajes.length > 0 && (
        <section className="card-panel p-5" aria-label="Para que todo diga lo mismo">
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Para que todo diga lo mismo</p>
          <ul className="mt-3 space-y-3">
            {desfasajes.map((d) => (
              <li key={d.dia} className="text-[17px] text-cream">
                {VOC(avisoDe(d))}
                <span className="block text-[15px] text-cream/60">Está en el día {d.dia}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Su Hoja de Ruta: los noventa días a la vista desde el primer día. */}
      {rutaAbierta ? (
        <HojaDeRuta
          fechaInicio={perfil?.fecha_inicio}
          completadas={completadas}
          diaDeHoy={diaActual}
          onCerrar={() => setRutaAbierta(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setRutaAbierta(true)}
          className="w-full min-h-[56px] rounded-2xl border border-[var(--line2,#DFD3BC)] px-4 flex items-center justify-between"
        >
          <span className="text-[17px] font-semibold text-cream">Tu Hoja de Ruta</span>
          <span className="text-[15px] text-cream/70">tus noventa días ›</span>
        </button>
      )}

      {/* El ADN vive acá: es lo que vas sellando en el Camino. */}
      <button
        type="button"
        onClick={() => onNavigate?.('adn')}
        className="w-full min-h-[56px] rounded-2xl border border-[var(--line2,#DFD3BC)] px-4 flex items-center justify-between text-left"
      >
        <span className="text-[17px] font-semibold text-cream">Tu ADN</span>
        <span className="text-[15px] text-cream/70">lo que ya sellaste ›</span>
      </button>

      {/* ── Encabezado: dónde estás y qué hacer hoy (10-DISENO) ── */}
      <EncabezadoCamino
        cinturon={cinturonCamino}
        sistemas={sistemasAvance}
        sistemaActual={pasoDeHoy?.sistema ?? null}
        ritmo={ritmo}
        hoy={pasoDeHoy}
        esFinde={[0, 6].includes(new Date().getDay())}
        faseAutonomia={faseAutonomia}
        ventas={ventas.length}
        onEmpezar={() => {
          if (!pasoDeHoy) return;
          setPilarAbierto(pasoDeHoy.pilar);
          setActiveMeta(pasoDeHoy.codigo);
          setTimeout(() => document.getElementById(`meta-${pasoDeHoy.codigo}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
        }}
        onRegistrarVenta={() => setVentaModal(true)}
      />

      {/* ── Banner Día 45 (Regla #6 v8) ── */}
      {validacionDia45.debeBloquearFase4 && (
        <Dia45Banner
          validacion={validacionDia45}
          diaActual={diaActual}
          onIrAPilar={(pilarId) => {
            const match = seedConVideos.find((p) => p.id === pilarId);
            if (match) {
              setPilarAbierto(match.numero);
              setTimeout(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            }
          }}
        />
      )}

      {/* ── Comparación Foto de Partida vs ADN real (v8 · día ≥45) ── */}
      {diaActual >= 45 && comparacionDia45.tieneFotoPartida && (
        <ComparacionDia45 comparacion={comparacionDia45} diaActual={diaActual} />
      )}

      {/* ── Mapa visual por fases ── */}
      <div className="space-y-6">
        {FASES_ROADMAP.map((fase) => {
          // Los grupos vacíos no se muestran, y el nombre del sistema aparece
          // una sola vez: cuando cambia. Antes se repetía cuatro veces seguidas.
          const pilaresEnFase = pilaresConEstado
            .filter((p) => p.fase === fase.fase)
            .filter((p) => p.metas.length > 0);
          if (pilaresEnFase.length === 0) return null;
          const ordenados = [...pilaresConEstado].filter((p) => p.metas.length > 0);
          const abreSistema = new Set(
            ordenados
              .filter((p, i) => i === 0 || ordenados[i - 1].subtitulo !== p.subtitulo)
              .map((p) => p.numero),
          );

          return (
            <div key={fase.fase} className="space-y-2">
              {/* Encabezado de fase */}
              <div className="flex items-center gap-3 px-1 mb-1">
                <div className="flex-1">
                  <h2 className="text-[22px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
                    {VOC(fase.titulo)}
                  </h2>
                  <p className="text-sm text-cream/55 mt-0.5">{VOC(fase.subtitulo)}</p>
                </div>
              </div>

              {/* Grid de pilares de la fase */}
              <div className={`grid gap-3 ${pilaresEnFase.length === 1 ? 'grid-cols-1' : pilaresEnFase.length === 3 || pilaresEnFase.length > 4 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                {pilaresEnFase.map((pilar) => {
                  const isSelected = pilarAbierto === pilar.numero;
                  return (
                    <button
                      key={pilar.numero}
                      onClick={() => {
                        if (pilar.estado === 'plan_bloqueado') {
                          const planNec = planParaPilar(pilar.numero);
                          const url = checkoutUrl(planNec);
                          window.open(url || waLink(`Hola · Quiero abrir «${VOC(pilar.titulo)}» (${NOMBRE_PLAN[planNec]} ${PRECIO_FUNDADOR[planNec]})`), '_blank');
                          return;
                        }
                        const siguiente = pilarAbierto === pilar.numero ? null : pilar.numero;
                        setPilarAbierto(siguiente);
                        if (siguiente !== null) {
                          setTimeout(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
                        }
                      }}
                      disabled={pilar.estado === 'bloqueado'}
                      className={`relative text-left p-4 sm:p-5 min-w-0 rounded-2xl border transition-all duration-300 ${
                        pilar.estado === 'bloqueado'
                          ? 'bg-transparent border-[var(--line,#EBE1CF)] cursor-not-allowed'
                          : pilar.estado === 'plan_bloqueado'
                          ? 'bg-transparent border-[var(--line,#EBE1CF)]'
                          : isSelected
                          ? 'bg-[var(--card,#FFFDF7)] border-gold'
                          : pilar.estado === 'completado'
                          ? 'bg-[var(--card,#FFFDF7)] border-[var(--tilde,#4A7C59)]/40'
                          : 'bg-[var(--card,#FFFDF7)] border-[var(--line2,#DFD3BC)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        {(() => { const IconComp = ICON_MAP[pilar.icon]; return IconComp ? <IconComp className="w-6 h-6 text-gold" /> : null; })()}
                        <div className="flex items-center gap-1">
                          {(pilar.estado === 'bloqueado' || pilar.estado === 'plan_bloqueado') ? (
                            <Lock className="w-4 h-4 text-cream/45" />
                          ) : pilar.estado === 'completado' ? (
                            <Check className="w-4 h-4" style={{ color: 'var(--tilde, #4A7C59)' }} />
                          ) : (
                            <Zap className="w-4 h-4 text-gold" />
                          )}
                        </div>
                      </div>
                      {/* El cliente no cuenta pilares: ve su sistema, y solo cuando cambia. */}
                      {abreSistema.has(pilar.numero) && (
                        <p className="text-[15px] text-cream/60">
                          {VOC(pilar.subtitulo)}
                        </p>
                      )}
                      <p lang="es" className={`text-[17px] leading-snug font-semibold mt-0.5 hyphens-auto [overflow-wrap:anywhere] ${(pilar.estado === 'bloqueado' || pilar.estado === 'plan_bloqueado') ? 'text-cream/55' : 'text-cream'}`}>
                        {VOC(pilar.titulo)}
                      </p>

                      {/* Mini barra de progreso */}
                      {pilar.estado !== 'bloqueado' && pilar.estado !== 'plan_bloqueado' && (
                        <div className="mt-3 h-1.5 bg-gold/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pilar.estado === 'completado' ? 'bg-success' : 'bg-gold'}`}
                            style={{ width: `${pilar.totalMetas === 0 ? 0 : Math.round((pilar.metasCompletadas / pilar.totalMetas) * 100)}%` }}
                          />
                        </div>
                      )}

                      {/* Condición de desbloqueo especial */}
                      {pilar.estado === 'bloqueado' && (
                        <p className="text-sm text-cream/45 mt-1.5 leading-tight">
                          {primerDiaDelPilar(pilar.metas) !== null ? `Se abre el día ${primerDiaDelPilar(pilar.metas)}` : ''}
                        </p>
                      )}
                      {pilar.estado === 'plan_bloqueado' && (() => {
                        const planNec = planParaPilar(pilar.numero);
                        return (
                          <span className="block text-sm text-gold/85 mt-1.5 leading-relaxed">
                            Se abre con <strong>{NOMBRE_PLAN[planNec]}</strong> · {PRECIO_FUNDADOR[planNec]} — toca para verlo
                          </span>
                        );
                      })()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detalle del pilar seleccionado ── */}
      {pilarAbierto !== null && (() => {
        const pilar = pilaresConEstado.find((p) => p.numero === pilarAbierto);
        if (!pilar || pilar.estado === 'bloqueado' || pilar.estado === 'plan_bloqueado') return null;

        return (
          <div ref={detalleRef} className="card-panel rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 scroll-mt-4">
            {/* Cabecera del pilar */}
            <div className="p-6 border-b border-[rgba(232,150,46,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => { const IconComp = ICON_MAP[pilar.icon]; return IconComp ? <IconComp className="w-8 h-8 text-gold" /> : null; })()}
                  <div>
                    <p className="text-[15px] text-gold uppercase tracking-wider font-bold">
                      {VOC(pilar.subtitulo)}
                    </p>
                    <h2 className="text-xl text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{VOC(pilar.titulo)}</h2>

                  </div>
                </div>
                <button
                  onClick={() => setPilarAbierto(null)}
                  aria-label="Cerrar el pilar"
                  className="w-11 h-11 -mr-2 flex items-center justify-center text-cream/55 hover:text-cream transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              {/* Progreso del pilar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-cream/55">
                  <span>{pilar.metasCompletadas} de {pilar.totalMetas} metas</span>
                  <span className="flex items-center gap-1">{pilar.estrellas_completadas} <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 inline" /> completadas</span>
                </div>
                <div className="h-1.5 bg-gold/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pilar.estado === 'completado' ? 'bg-success' : 'bg-gold'}`}
                    style={{ width: `${pilar.totalMetas === 0 ? 0 : Math.round((pilar.metasCompletadas / pilar.totalMetas) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Aviso de desbloqueo especial */}
              {(pilar.desbloqueo === 'venta_real' || pilar.desbloqueo === 'qa_verde') && (
                <div className="mt-3 flex items-start gap-2 bg-gold/10 border border-gold/20 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-gold">
                    {pilar.desbloqueo === 'venta_real'
                      ? 'Este pilar se desbloqueó porque registraste tu primera venta real.'
                      : 'Este pilar se desbloqueó porque completaste el QA del embudo con 24/24 puntos verdes.'}
                  </p>
                </div>
              )}

              {/* Milestone notification */}
              {pilar.hito_mensaje && pilar.estado === 'completado' && (
                <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 ${
                  pilar.hito_tipo === 'urgent'
                    ? 'bg-danger/10 border border-danger/25'
                    : pilar.hito_tipo === 'checkpoint'
                    ? 'bg-success/10 border border-success/25'
                    : 'bg-gold/10 border border-gold/25'
                }`}>
                  <Trophy className={`w-4 h-4 shrink-0 mt-0.5 ${
                    pilar.hito_tipo === 'urgent' ? 'text-danger' : pilar.hito_tipo === 'checkpoint' ? 'text-success' : 'text-gold'
                  }`} />
                  <p className={`text-xs font-medium ${
                    pilar.hito_tipo === 'urgent' ? 'text-danger' : pilar.hito_tipo === 'checkpoint' ? 'text-success' : 'text-gold'
                  }`}>
                    {pilar.hito_mensaje}
                  </p>
                </div>
              )}
            </div>

            {/* Lista de metas */}
            <div className="p-4 space-y-3">
              {[...pilar.metas].sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999)).map((meta) => {
                const key = `${pilar.numero}-${meta.codigo}`;
                const estaCompletada = completadas.has(key);
                const tieneOutput = taskOutputs.has(key);
                const unlocked = isTaskUnlocked(meta, pilar, completadas, perfil);
                const bloqueoMsg = !unlocked ? motivoBloqueo(meta, perfil) : null;
                const isActive = activeMeta === meta.codigo;
                const badge = getTypeBadge(meta.tipo);
                const BadgeIcon = badge.icon;

                return (
                  <div key={meta.codigo} id={`meta-${meta.codigo}`}>
                    <div
                      onClick={() => {
                        if (!unlocked) return;
                        setActiveMeta(isActive ? null : meta.codigo);
                        if (!isActive) {
                          setTimeout(() => taskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
                        }
                      }}
                      className={`group flex items-start gap-4 p-4 rounded-xl transition-all border ${
                        !unlocked
                          ? 'opacity-40 cursor-not-allowed bg-surface/20 border-[rgba(232,150,46,0.05)]'
                          : estaCompletada
                          ? 'bg-success/5 border-success/15 cursor-pointer'
                          : isActive
                          ? 'bg-gold/10 border-gold/30 cursor-pointer'
                          : 'bg-surface/30 border-[rgba(232,150,46,0.1)] hover:bg-surface/60 hover:border-[rgba(232,150,46,0.12)] cursor-pointer'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {!unlocked ? (
                          <Lock className="w-5 h-5 text-cream/20" />
                        ) : estaCompletada ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-cream/45 group-hover:text-cream/75 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {/* El código y el tipo son del equipo: el cliente ve el día. */}
                          <span className="text-[15px] text-cream/60">Día {meta.dia_asignado}</span>
                          {meta.es_estrella && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          )}
                          {tieneOutput && (
                            <FileText className="w-3 h-3 text-success" />
                          )}
                        </div>
                        {/* Con la sesión abierta el título ya está adentro: no se repite. */}
                        {!isActive && (
                          <p className={`text-base font-medium ${estaCompletada ? 'text-cream/55 line-through' : 'text-cream'}`}>
                            {VOC(meta.titulo)}
                          </p>
                        )}
                        {/* Lo que se lleva se dice una sola vez, dentro de la sesión. */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-cream/45 font-medium">
                            {meta.tiempo_estimado}
                          </span>
                          {meta.es_estrella && (
                            <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-500" /> Desbloquea siguiente pilar
                            </span>
                          )}
                          {!unlocked && (
                            teaserDeMeta(meta.codigo) ? (
                              <span className="text-xs text-gold/80 font-medium flex items-start gap-1.5 leading-relaxed">
                                <Lock className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{teaserDeMeta(meta.codigo)}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-cream/45 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" />{' '}
                                {bloqueoMsg ?? 'Completa la tarea anterior primero'}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Inline task panel ── */}
                    {isActive && unlocked && (
                      <div ref={taskRef} className="mt-3 card-panel p-6 rounded-2xl border border-[rgba(232,150,46,0.12)] animate-in fade-in slide-in-from-top-2 duration-300">
                        {meta.tipo === 'VIDEO' && (
                          <SesionViva
                            metaKey={key}
                            metaCodigo={meta.codigo}
                            metaTitulo={VOC(meta.titulo)}
                            teLlevas={VOC(meta.descripcion || meta.evidencia_requerida?.nombre || '')}
                            pasos={pasosDeHoy(meta)}
                            pide={VOC(meta.evidencia_requerida?.pide ?? '')}
                            seAbre={[meta.veredicto ? VOC(meta.veredicto) : '', meta.cinturon ? 'Ganaste un grado nuevo: míralo en tu Camino.' : ''].filter(Boolean).join(' ') || undefined}
                            base={baseDeHoy(meta)}
                            tiempoEstimado={enRevision.has(meta.codigo) ? '20 min' : meta.tiempo_estimado}
                            isCompleted={estaCompletada}
                            userId={userId}
                            video={(() => {
                              const tuto = tutorialDelDia(meta.dia_asignado);
                              const suyo = meta.video_youtube_id && !meta.video_youtube_id.startsWith('PLACEHOLDER') ? (
                                <TaskVideo
                                  meta={meta}
                                  onComplete={() => handleCompleteTask(pilar.numero, meta)}
                                  isCompleted={estaCompletada}
                                />
                              ) : null;
                              if (!suyo && !tuto) return undefined;
                              return <div className="space-y-5">{suyo}{tuto}</div>;
                            })()}
                            evidencia={(
                              <>
                                <EvidenciaUniversal userId={userId} metaCodigo={meta.codigo} />
                                {/* El Crítico mide lo escrito contra la rúbrica de esa jornada. */}
                                <VeredictoCriticoPanel codigo={meta.codigo} texto={taskOutputs.get(key) ?? ''} />
                              </>
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => { const yaEstaba = estaCompletada; handleCompleteTask(pilar.numero, meta); if (!yaEstaba) setActiveMeta(null); }}
                              className="btn-ios-primary w-full"
                            >
                              {estaCompletada ? 'Hecho' : 'Marcar como hecho'}
                            </button>
                          </SesionViva>
                        )}
                        {(meta.tipo === 'HERRAMIENTA' || meta.tipo === 'COACH') && (
                          <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0d0a06]">
                            <div className="sticky top-0 z-10 bg-[#0d0a06]/95 backdrop-blur border-b border-gold/15 px-4 py-3 flex items-center justify-between">
                              <button onClick={() => setActiveMeta(null)} className="text-xs font-bold text-cream/50 hover:text-cream">✕ Guardar y salir</button>
                              <p className="text-sm font-bold uppercase tracking-[0.25em] text-gold">Sesión en curso</p>
                              <span className="text-[15px] text-cream/55">{meta.tiempo_estimado}</span>
                            </div>
                            <div className="max-w-2xl mx-auto px-4 py-6">

                          <SesionViva
                            metaKey={key}
                            metaCodigo={meta.codigo}
                            metaTitulo={VOC(meta.titulo)}
                            teLlevas={VOC(meta.descripcion || meta.evidencia_requerida?.nombre || '')}
                            pasos={pasosDeHoy(meta)}
                            pide={VOC(meta.evidencia_requerida?.pide ?? '')}
                            seAbre={[meta.veredicto ? VOC(meta.veredicto) : '', meta.cinturon ? 'Ganaste un grado nuevo: míralo en tu Camino.' : ''].filter(Boolean).join(' ') || undefined}
                            base={baseDeHoy(meta)}
                            tiempoEstimado={enRevision.has(meta.codigo) ? '20 min' : meta.tiempo_estimado}
                            isCompleted={estaCompletada}
                            userId={userId}
                            video={tutorialDelDia(meta.dia_asignado) ?? undefined}
                            evidencia={(
                              <>
                                <EvidenciaUniversal userId={userId} metaCodigo={meta.codigo} />
                                {/* El Crítico mide lo escrito contra la rúbrica de esa jornada. */}
                                <VeredictoCriticoPanel codigo={meta.codigo} texto={taskOutputs.get(key) ?? ''} />
                              </>
                            )}
                          >
                        {/* La preventa a los tres primeros: la del día 24. */}
                        {meta.codigo === codigoDelDia(24) && (
                          <PreventaPanel
                            precio={precioSellado()}
                            onElegir={(ids) => onProfileFieldUpdate?.({ adn_bonos_preventa: ids })}
                          />
                        )}

                        {/* El test del eneagrama: la herramienta del día 3. */}
                        {meta.codigo === codigoDelDia(3) && (
                          <TestEneagrama
                            onResultado={(tipoId) => {
                              const t = tipoEneagrama(tipoId);
                              if (t) onProfileFieldUpdate?.({ adn_eneagrama: t.nombre });
                            }}
                          />
                        )}

                        {meta.codigo === codigoDelDia(1) && (
                          <TaskFotoPartida
                            meta={meta}
                            valorExistente={perfil?.adn_autoevaluacion_dia1}
                            onSaveADN={(output, scores) => {
                              handleSaveADN(pilar.numero, meta, output);
                              onProfileFieldUpdate?.({ adn_autoevaluacion_dia1: scores });
                            }}
                            isCompleted={estaCompletada}
                          />
                        )}
                        {meta.codigo === codigoDelDia(9) && (
                          <TaskMapaMamuska
                            meta={meta}
                            perfil={perfil}
                            valorExistente={perfil?.adn_metodo_mapeo_obstaculos}
                            onSaveADN={(output, filas) => {
                              handleSaveADN(pilar.numero, meta, output);
                              onProfileFieldUpdate?.({ adn_metodo_mapeo_obstaculos: filas });
                            }}
                            isCompleted={estaCompletada}
                          />
                        )}
                        {/* El catálogo viejo de herramientas ya no se abre desde el Camino. */}
                        {meta.tipo === 'COACH' && (
                          <TaskCoach
                            meta={meta}
                            onComplete={() => { const yaEstaba = estaCompletada; handleCompleteTask(pilar.numero, meta); if (!yaEstaba) setActiveMeta(null); }}
                            isCompleted={estaCompletada}
                          />
                        )}
                          </SesionViva>
                        
                            </div>
                          </div>
                        )}
                      
                        {meta.tipo !== 'HERRAMIENTA' && meta.tipo !== 'COACH' && (
                          <EvidenciaUniversal userId={userId} metaCodigo={meta.codigo} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Indicador de estrellas requeridas */}
            {pilar.estrellas_requeridas && pilar.numero_orden < 13 && (() => {
              const siguientePilar = pilaresConEstado.find(p => p.numero_orden === pilar.numero_orden + 1);
              const siguienteLabel = siguientePilar ? siguientePilar.id.substring(1) : '';
              const todasCompletas = pilar.estrellas_completadas >= pilar.metas.filter((m) => m.es_estrella).length;
              return (
                <div className="px-4 pb-4">
                  <div className={`text-xs rounded-xl px-4 py-3 border ${
                    todasCompletas
                      ? 'bg-success/10 border-success/20 text-success'
                      : 'bg-surface/50 border-[rgba(232,150,46,0.08)] text-cream/55'
                  }`}>
                    {todasCompletas
                      ? <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success inline shrink-0" /> Pilar {siguienteLabel} desbloqueado — todas las metas completadas</span>
                      : <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 inline shrink-0" /> Completa {pilar.metas.filter((m) => m.es_estrella).length - pilar.estrellas_completadas} metas más para desbloquear el Pilar {siguienteLabel}</span>}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* ── Pilar Completion Popup ── */}
      {ventaModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setVentaModal(false)}>
          <div className="max-w-sm w-full rounded-2xl border border-gold/30 bg-panel p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-cream mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              🎉 Registrar una venta
            </h3>
            <p className="text-xs text-cream/65 mb-4">{VOC('Un {{consultante}} más cobrado con tu precio digno. El contador avanza contigo.')}</p>
            <label className="text-sm uppercase tracking-widest text-gold font-bold">Monto (USD)</label>
            <input
              type="number" inputMode="decimal"
              value={ventaMonto}
              onChange={(e) => setVentaMonto(e.target.value)}
              placeholder="1000"
              autoFocus
              className="w-full mt-1.5 mb-4 px-4 py-3 rounded-xl bg-ink border border-cream/15 text-cream text-sm focus:border-gold/50 focus:outline-none"
            />
            <button
              onClick={registrarVenta}
              disabled={ventaGuardando || !ventaMonto}
              className="w-full py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-goldhi transition-colors disabled:opacity-40"
            >
              {ventaGuardando ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        </div>
      )}

      {graduacionVisible && (
        <Graduacion
          nombre={perfil?.nombre ?? undefined}
          ventas={ventas.length}
          onClose={() => setGraduacionVisible(false)}
          onIrAlChat={() => onNavigate?.('coach')}
        />
      )}

      {pilarUnlocked && (
        <PilarUnlockedModal
          pilarCompletado={pilarUnlocked.completado}
          pilarDesbloqueado={pilarUnlocked.desbloqueado}
          pilarNumero={pilarUnlocked.numero}
          nivelAlcanzado={pilarUnlocked.nivelAlcanzado}
          cinturon={pilarUnlocked.cinturon}
          mentorPregunta={pilarUnlocked.mentorPregunta}
          onClose={() => setPilarUnlocked(null)}
          onContinuar={() => {
            // Open the next pilar
            const nextPilar = pilaresConEstado.find(p => p.numero === pilarUnlocked.numero + 1);
            if (nextPilar && nextPilar.estado !== 'bloqueado' && nextPilar.estado !== 'plan_bloqueado') {
              setPilarAbierto(nextPilar.numero);
              setTimeout(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            }
          }}
          onRating={async (rating, comentario) => {
            if (!isSupabaseReady() || !supabase || !userId) return;
            await guardarFila('pilar_satisfaction_ratings', {
                usuario_id: userId,
                pilar_numero: pilarUnlocked.numero,
                pilar_titulo: pilarUnlocked.completado,
                rating,
                comentario: comentario || null,
              }, ['usuario_id', 'pilar_numero']);
          }}
        />
      )}

      {/* v8 · Espejo de Identidad · cierre F1 (al completar P3) */}
      {espejoVisible && (
        <EspejoIdentidadModal
          historiaCorta={perfil?.historia_50}
          propositoFrase={perfil?.proposito}
          legadoDeclaracion={perfil?.legado}
          cincoNo={perfil?.adn_cinco_no}
          onConfirmar={() => setEspejoVisible(false)}
          onEditar={() => {
            setEspejoVisible(false);
            onNavigate?.('adn');
          }}
        />
      )}
    </div>
  );
}
