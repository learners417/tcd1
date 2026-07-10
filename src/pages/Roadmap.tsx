import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { listarEvidencias, subirEvidencia } from '../lib/evidencia';
import {
  CheckCircle2,
  Circle,
  Lock,
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
import { supabase, isSupabaseReady } from '../lib/supabase';
import type { HojaDeRutaItem, VentaRegistrada, ProfileV2 } from '../lib/supabase';
import {
  SEED_ROADMAP_V2,
  FASES_ROADMAP,
  calcularNivel,
  TOTAL_METAS,
  type RoadmapPilar,
  type RoadmapMeta,
} from '../lib/roadmapSeed';
import { getYoutubeVideoId } from '../lib/videos';
import { NIVEL_NOMBRES, NIVEL_METADATA } from '../lib/supabase';
import TaskVideo from '../components/tasks/TaskVideo';
import TaskHerramientaIA from '../components/tasks/TaskHerramientaIA';
import TaskCoach from '../components/tasks/TaskCoach';
import TaskFotoPartida from '../components/tasks/TaskFotoPartida';
import TaskMapaMamuska from '../components/tasks/TaskMapaMamuska';
import EspejoIdentidadModal from '../components/EspejoIdentidadModal';
import ComparacionDia45 from '../components/ComparacionDia45';
import PilarUnlockedModal from '../components/PilarUnlockedModal';
import Graduacion from '../components/Graduacion';
import { registrarSesionCompletada, esDiaDescanso } from '../lib/racha';
import CintaCinturon from '../components/CintaCinturon';

// Lote D: adapta el encuadre de ciertas sesiones según el avatar del sanador
function encuadrarPorAvatar(codigo: string, texto: string): string {
  let avatar = 'A';
  try { avatar = localStorage.getItem('tcd_avatar') ?? 'A'; } catch { /* noop */ }
  if (avatar !== 'B') return texto;
  // Avatar B (Establecido): las sesiones de método hablan de ORDENAR lo que ya tiene, no crear
  const ajustes: Record<string, string> = {
    'P2.1': 'Ya tienes un método — lo usas hace años, aunque nunca lo sacaste de tu cabeza. En esta fase le ponemos nombre, orden y estructura a lo que YA haces. Es tu activo más valioso, enterrado.',
    'P2.2': 'Documenta el proceso que ya sigues con tus pacientes — ese orden que tienes intuitivo. Solo hay que ordenarlo y ponerlo por escrito.',
    'P2.4': 'Vamos a ponerle nombre al método que ya tienes. No inventamos nada: ordenamos y bautizamos tu forma de trabajar de años.',
  };
  return ajustes[codigo] ?? texto;
}
import { notificarPilarCompletado, notificarCinturon } from '../lib/notifications';
import { otorgarCinturonPorPilar, calcularCinturon, cinturonDesdeProgreso } from '../lib/cinturones';
import Dia45Banner from '../components/Dia45Banner';
import { validarADNDia45, compararFotoPartida } from '../lib/diaValidator';
import { usePersistedState } from '../lib/usePersistedState';

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

type EstadoPilar = 'completado' | 'en_progreso' | 'bloqueado';

interface PilarConEstado extends RoadmapPilar {
  estado: EstadoPilar;
  metasCompletadas: number;
  totalMetas: number;
  estrellas_completadas: number;
}

interface Props {
  userId?: string;
  perfil?: Partial<ProfileV2>;
  geminiKey?: string;
  onNavigate?: (page: string) => void;
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTypeBadge(tipo: string) {
  switch (tipo) {
    case 'VIDEO':
      return { icon: Play, label: 'VIDEO', color: 'text-[#E8962E]', bg: 'bg-[#E8962E]/10 border-[#E8962E]/20' };
    case 'HERRAMIENTA':
      return { icon: Wrench, label: 'HERRAMIENTA', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10 border-[#22C55E]/20' };
    case 'COACH':
      return { icon: MessageSquare, label: 'MENTOR', color: 'text-[#F2EFE9]/70', bg: 'bg-[#F2EFE9]/5 border-[#F2EFE9]/15' };
    default:
      return { icon: FileText, label: tipo, color: 'text-[#F2EFE9]/50', bg: 'bg-[#F2EFE9]/5 border-[#F2EFE9]/10' };
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

  // v8 Regla #7 · No se corre publicidad a contenido no validado orgánicamente.
  // P9A.5 (Config Meta Ads) requiere P9A.4 con ≥3 piezas validadas.
  if (meta.codigo === 'P9A.5' && contarPiezasValidacionOrganica(perfil) < 3) {
    return false;
  }

  return true;
}

/** Mensaje de bloqueo específico cuando una tarea NO está desbloqueada. */
function motivoBloqueo(
  meta: RoadmapMeta,
  perfil?: { adn_validacion_organica?: unknown },
): string | null {
  if (meta.codigo === 'P9A.5') {
    const count = contarPiezasValidacionOrganica(perfil);
    if (count < 3) {
      return `Regla Video 9: no se corre publicidad a contenido no validado. Completa P9A.4 con ≥3 piezas (tienes ${count}).`;
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
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F2EFE9]/40">📎 Documenta tu trabajo</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="text-[11px] px-3 py-1.5 rounded-lg border border-[rgba(232,150,46,0.2)] text-[#E8962E] hover:bg-[#E8962E]/10 transition-colors disabled:opacity-50"
        >
          {subiendo ? 'Subiendo…' : '+ Subir foto · captura · doc'}
        </button>
      </div>
      {items.length > 0 && <p className="text-[11px] text-[#22C55E] mt-1.5">✓ {items.length} {items.length === 1 ? 'evidencia guardada' : 'evidencias guardadas'} — tu equipo las ve</p>}
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

export default function Roadmap({ userId, perfil, geminiKey, onNavigate, onProfileFieldUpdate }: Props) {
  const [completadas, setCompletadas] = useState<Set<string>>(new Set());
  const [ventas, setVentas] = useState<VentaRegistrada[]>([]);
  // T2/T3 · registrar venta + graduación (rediseño 4 fases)
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
  const [videosPorPilar, setVideosPorPilar] = useState<Record<string, string>>({});
  const prevCompletadasRef = useRef<Set<string>>(new Set());
  const detalleRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);

  // ─── Seed enriquecido con videos reales de programa_videos ─────────────
  const seedConVideos: RoadmapPilar[] = useMemo(() => {
    if (Object.keys(videosPorPilar).length === 0) return SEED_ROADMAP_V2;
    return SEED_ROADMAP_V2.map(pilar => {
      const ytId = videosPorPilar[pilar.id];
      if (!ytId) return pilar;
      return {
        ...pilar,
        metas: pilar.metas.map(meta =>
          meta.tipo === 'VIDEO'
            ? { ...meta, video_youtube_id: ytId }
            : meta,
        ),
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
        const map: Record<string, string> = {};
        for (const v of vids as { pilar_id: string | null; youtube_url: string }[]) {
          if (!v.pilar_id || !v.youtube_url) continue;
          if (!map[v.pilar_id]) {
            const ytId = getYoutubeVideoId(v.youtube_url);
            if (ytId) map[v.pilar_id] = ytId;
          }
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
    (pilar: RoadmapPilar, pilares: RoadmapPilar[]): EstadoPilar => {
      const completadasPilar = pilar.metas.filter((m) =>
        completadas.has(`${pilar.numero}-${m.codigo}`),
      ).length;
      const totalMetas = pilar.metas.length;

      // Verificar si está desbloqueado
      let desbloqueado = false;
      switch (pilar.desbloqueo) {
        case 'auto':
          desbloqueado = true;
          break;
        case 'completar_anterior': {
          const anterior = pilares.find((p) => p.numero === pilar.numero - 1);
          if (!anterior) { desbloqueado = true; break; }
          const totalEstrellasPrevias = anterior.metas.filter((m) => m.es_estrella).length;
          const estrellasPreviasCompletadas = anterior.metas.filter(
            (m) => m.es_estrella && completadas.has(`${anterior.numero}-${m.codigo}`),
          ).length;
          // Requiere todas las ★ del pilar anterior (o el mínimo configurado, el que sea menor)
          const requeridas = Math.min(pilar.estrellas_requeridas ?? totalEstrellasPrevias, totalEstrellasPrevias);
          desbloqueado = estrellasPreviasCompletadas >= requeridas;
          break;
        }
        case 'venta_real':
          desbloqueado = ventas.length > 0;
          break;
        case 'qa_verde':
          desbloqueado = qaVerde;
          break;
      }

      if (!desbloqueado) return 'bloqueado';
      if (completadasPilar >= totalMetas) return 'completado';
      return 'en_progreso';
    },
    [completadas, ventas, qaVerde],
  );

  // ─── Validación Día 45 (Regla #6 v8) ────────────────────────────────────
  const diaActual = perfil?.dia_programa ?? 1;
  const validacionDia45 = validarADNDia45(perfil ?? {}, diaActual);
  const comparacionDia45 = compararFotoPartida(perfil ?? {});

  // ─── Enriquecer pilares con estado ─────────────────────────────────────
  const pilaresConEstado: PilarConEstado[] = seedConVideos.map((pilar) => {
    let estado = calcularEstadoPilar(pilar, seedConVideos);
    // Día 45 con ADN incompleto → forzar bloqueo de Fase 4 (Regla #5 v7)
    if (validacionDia45.debeBloquearFase4 && pilar.fase === 4 && estado !== 'completado') {
      estado = 'bloqueado';
    }
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
          desbloqueado: nextPilar && nextPilar.estado !== 'bloqueado' ? nextPilar.titulo : undefined,
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
  const diaPrograma = perfil?.fecha_inicio
    ? Math.max(1, Math.min(90, Math.floor((Date.now() - new Date(perfil.fecha_inicio).getTime()) / 86400000) + 1))
    : 1;
  let diaEsperado: number | null = null;
  outer: for (const pil of pilaresConEstado) {
    for (const m of pil.metas ?? []) {
      if (!completadas.has(`${pil.numero}-${m.codigo}`)) {
        diaEsperado = m.dia_asignado ?? null;
        break outer;
      }
    }
  }
  const diasAtraso = (() => {
    if (diaEsperado === null) return 0;
    let habiles = 0;
    for (let d = diaEsperado + 1; d <= diaPrograma; d++) if (!esDiaDescanso(d)) habiles++;
    return habiles;
  })();

  // ─── Toggle completar meta ─────────────────────────────────────────────
  const toggleMeta = useCallback(
    async (pilarNum: number, meta: RoadmapMeta, pilarEstado: EstadoPilar) => {
      if (pilarEstado === 'bloqueado') return;

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
        setCelebracion(`✓ Micro-sesión completada: ${meta.titulo} — ¿te quedó energía? La siguiente ya está desbloqueada. Puedes adelantar.`);
        setTimeout(() => setCelebracion(null), 5000);
      }

      // Sincronizar con Supabase
      if (isSupabaseReady() && supabase && userId) {
        await supabase.from('hoja_de_ruta').upsert(
          {
            usuario_id: userId,
            pilar_numero: pilarNum,
            meta_codigo: meta.codigo,
            completada: ahoraCompletada,
            es_estrella: meta.es_estrella,
            fecha_completada: ahoraCompletada ? new Date().toISOString().split('T')[0] : null,
          },
          { onConflict: 'usuario_id,pilar_numero,meta_codigo' },
        );
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
    setCelebracion(`Documento guardado: ${meta.titulo}`);
    setTimeout(() => setCelebracion(null), 5000);
    // Sync to Supabase
    if (isSupabaseReady() && supabase && userId) {
      supabase.from('hoja_de_ruta').upsert(
        {
          usuario_id: userId,
          pilar_numero: pilarNum,
          meta_codigo: meta.codigo,
          completada: true,
          es_estrella: meta.es_estrella,
          fecha_completada: new Date().toISOString().split('T')[0],
          output_generado: { texto: outputTexto },
        },
        { onConflict: 'usuario_id,pilar_numero,meta_codigo' },
      ).then(() => {});

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
  const handleCompleteTask = useCallback((pilarNum: number, meta: RoadmapMeta) => {
    registrarSesionCompletada(); // racha de sesiones (F2)
    const key = `${pilarNum}-${meta.codigo}`;
    setCompletadas(prev => { const next = new Set(prev); next.add(key); return next; });
    if (meta.es_estrella) {
      setCelebracion(`✓ Micro-sesión completada: ${meta.titulo} — ¿te quedó energía? La siguiente ya está desbloqueada. Puedes adelantar.`);
      setTimeout(() => setCelebracion(null), 5000);
    }
    // Sync to Supabase
    if (isSupabaseReady() && supabase && userId) {
      supabase.from('hoja_de_ruta').upsert(
        {
          usuario_id: userId,
          pilar_numero: pilarNum,
          meta_codigo: meta.codigo,
          completada: true,
          es_estrella: meta.es_estrella,
          fecha_completada: new Date().toISOString().split('T')[0],
        },
        { onConflict: 'usuario_id,pilar_numero,meta_codigo' },
      ).then(() => {});
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#F2EFE9]/40 text-sm">
        Cargando El Camino...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

      {/* ── Notificación de celebración ── */}
      {celebracion && (
        <div className="fade-rise fixed top-6 right-6 z-50 bg-[#E8962E]/90 backdrop-blur text-[#080808] text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300">
          {celebracion}
        </div>
      )}

      {/* ── Header ── */}
      <div className="card-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl text-[#F2EFE9] flex items-center gap-3" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              <MapIcon className="w-7 h-7 text-[#E8962E]" /> El Camino
            </h1>
        {(() => { try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); const c = cinturonDesdeProgreso(new Set(saved ? JSON.parse(saved) : [])); return <div className="mt-3 max-w-sm"><CintaCinturon cinturon={c} variante="linea" /></div>; } catch { return null; } })()}
            <p className="text-base text-[#F2EFE9]/60 mt-1">
              Método CLINICA · 7 etapas · 90 días · Objetivo: $10.000 USD
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-[#F2EFE9]/40 uppercase tracking-wider">Nivel actual</p>
            <p className="text-sm font-medium text-[#E8962E] mt-0.5">{cinturonActual.emoji} Cinturón {cinturonActual.nombre} · <span className="italic text-[#E8962E]/70">{cinturonActual.metafora}</span></p>
            <p className="text-xs mt-1.5">
              {diasAtraso <= 0 ? (
                <span className="text-[#22C55E]">Día {diaPrograma} de 90 · vas al día ✓</span>
              ) : diasAtraso <= 3 ? (
                <span className="text-[#E8962E]">Día {diaPrograma} de 90 · tu próxima tarea era del día {diaEsperado} — estás a {diasAtraso} día{diasAtraso > 1 ? 's' : ''} de tu ritmo. Hoy se recupera.</span>
              ) : (
                <span className="text-[#EF4444]">Día {diaPrograma} de 90 · vas {diasAtraso} días atrás de tu plan — habla con tu Mentor hoy: juntos lo reacomodan.</span>
              )}
            </p>
            <p className="text-xs text-[#F2EFE9]/40">Nivel {nivel} de 5</p>
          </div>
        </div>

        {/* ─── LA FASE AUTONOMÍA (D50+): la semana tipo, nunca vacía ─── */}
        {(() => {
          try {
            const p = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}');
            if (!p?.fecha_inicio) return null;
            const dia = Math.floor((Date.now() - new Date(p.fecha_inicio).getTime()) / 86400000) + 1;
            if (dia < 50) return null;
            return (
              <div className="card-ios p-5 mb-6" style={{ borderColor: 'rgba(90,145,112,0.35)', background: 'linear-gradient(135deg, rgba(61,107,79,0.12), transparent)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A9170] mb-2">Fase Autonomía · tu semana tipo</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#F2EFE9]/70">
                  <div className="rounded-lg bg-black/20 px-3 py-2">📞 Llamadas con interesados</div>
                  <div className="rounded-lg bg-black/20 px-3 py-2">🩺 Entrega con tu protocolo</div>
                  <div className="rounded-lg bg-black/20 px-3 py-2">📊 Métricas y ajuste de campaña</div>
                  <div className="rounded-lg bg-black/20 px-3 py-2">🗓 Tu revisión semanal (20 min)</div>
                </div>
                <p className="text-[10px] text-[#F2EFE9]/40 mt-2 italic">La máquina ya está construida — ahora se opera. Cada paciente nuevo se enciende en tu tablero.</p>
              </div>
            );
          } catch { return null; }
        })()}

        {/* ─── TU SESIÓN DE HOY · la tarjeta que grita ─── */}
        {(() => {
          try {
            const saved = localStorage.getItem('tcd_hoja_ruta_v2');
            const done = new Set<string>(saved ? JSON.parse(saved) : []);
            let hoy: { pilar: number; codigo: string; titulo: string; tiempo?: string } | null = null;
            outer: for (const pil of SEED_ROADMAP_V2) {
              for (const m of pil.metas) {
                if (!done.has(`${pil.numero}-${m.codigo}`)) { hoy = { pilar: pil.numero, codigo: m.codigo, titulo: m.titulo, tiempo: (m as { tiempo_estimado?: string }).tiempo_estimado }; break outer; }
              }
            }
            if (!hoy) return null;
            const esFinde = [0, 6].includes(new Date().getDay());
            return (
              <div className="card-ios p-5 sm:p-6 mb-6" style={{ borderColor: 'rgba(232,150,46,0.35)', background: 'linear-gradient(135deg, rgba(232,150,46,0.10), rgba(232,150,46,0.02))' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E8962E] mb-2">{esFinde ? 'El dojo respira 🌿 · tu próxima micro-sesión' : 'Tu micro-sesión de hoy'}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xl sm:text-2xl font-light text-[#F2EFE9] leading-snug" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{hoy.titulo}</p>
                    <p className="text-xs text-[#F2EFE9]/45 mt-1">{hoy.codigo} · <span className="text-[#F4B65C]">{hoy.tiempo ?? '~20 min'}</span> · máximo poder en tiempo reducido</p>
                  </div>
                  <button
                    onClick={() => { setPilarAbierto(hoy!.pilar); setActiveMeta(hoy!.codigo); setTimeout(() => document.getElementById(`meta-${hoy!.codigo}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); }}
                    className="btn-ios-primary px-7 py-3.5 text-sm shrink-0 w-full sm:w-auto"
                  >
                    COMENZAR →
                  </button>
                </div>
              </div>
            );
          } catch { return null; }
        })()}

        {/* Barra de progreso global */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#F2EFE9]/60">
            <span>Progreso global</span>
            <span>{progresoPct}% — {totalCompletadas} de {TOTAL_METAS} metas</span>
          </div>
          <div className="h-2 bg-[#E8962E]/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E8962E] to-[#F4B65C] rounded-full transition-all duration-1000"
              style={{ width: `${progresoPct}%` }}
            />
          </div>
        </div>

        {/* Indicadores rápidos */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1A1917]/50 rounded-xl p-3 text-center">
            <p className="text-lg font-light text-[#F2EFE9]">{perfil?.dia_programa ?? 1}</p>
            <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider">Día de prog.</p>
          </div>
          <div className="bg-[#1A1917]/50 rounded-xl p-3 text-center relative">
            <p className="text-lg font-light text-[#F2EFE9]">
              {ventas.length}<span className="text-[#F2EFE9]/35 text-sm">/10</span>
            </p>
            <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider">Pacientes</p>
            <button
              onClick={() => setVentaModal(true)}
              className="mt-1.5 text-[10px] font-semibold text-[#E8962E] hover:text-[#F4B65C] transition-colors"
            >
              🎉 Registrar venta
            </button>
          </div>
          <div className="bg-[#1A1917]/50 rounded-xl p-3 text-center">
            <p className="text-lg font-light text-[#F2EFE9]">
              {pilaresConEstado.filter((p) => p.estado === 'completado').length}
            </p>
            <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider">Pilares completados</p>
          </div>
        </div>
      </div>

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
          const pilaresEnFase = pilaresConEstado.filter((p) => p.fase === fase.fase);
          if (pilaresEnFase.length === 0) return null;

          return (
            <div key={fase.fase} className="space-y-2">
              {/* Encabezado de fase */}
              <div className="flex items-center gap-3 px-1 mb-1">
                <div className="flex-1">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-[#F2EFE9]/90" style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.08em' }}>
                    {fase.titulo}
                    {fase.metodo_letra && (
                      <span className="ml-2 text-[#E8962E] text-base">· Método {fase.metodo_letra}</span>
                    )}
                  </h2>
                  <p className="text-sm text-[#F2EFE9]/40 mt-0.5">{fase.subtitulo} · {fase.dias}</p>
                </div>
              </div>

              {/* Banner de hito Día 45 (antes de Fase 4) */}
              {fase.fase === 4 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E8962E]/10 border border-[#E8962E]/25">
                  <Trophy className="w-4 h-4 text-[#E8962E] shrink-0" />
                  <p className="text-xs text-[#E8962E] font-medium">
                    Punto de no retorno — Día 45 max. Sin el ADN base completo, los $10,000 USD/mes no son un objetivo realista.
                  </p>
                </div>
              )}

              {/* Grid de pilares de la fase */}
              <div className={`grid gap-3 ${pilaresEnFase.length === 1 ? 'grid-cols-1' : pilaresEnFase.length === 2 ? 'grid-cols-2' : pilaresEnFase.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {pilaresEnFase.map((pilar) => {
                  const isSelected = pilarAbierto === pilar.numero;
                  return (
                    <button
                      key={pilar.numero}
                      onClick={() => {
                        const siguiente = pilarAbierto === pilar.numero ? null : pilar.numero;
                        setPilarAbierto(siguiente);
                        if (siguiente !== null) {
                          setTimeout(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
                        }
                      }}
                      disabled={pilar.estado === 'bloqueado'}
                      className={`relative text-left p-5 rounded-2xl border transition-all duration-300 ${
                        pilar.estado === 'bloqueado'
                          ? 'bg-[#1A1917]/50 border-[rgba(232,150,46,0.08)] cursor-not-allowed opacity-40'
                          : isSelected
                          ? 'bg-[#E8962E]/15 border-[#E8962E]/50 shadow-lg shadow-[#E8962E]/15 scale-[1.02]'
                          : pilar.estado === 'completado'
                          ? 'bg-[#22C55E]/8 border-[#22C55E]/25 hover:bg-[#22C55E]/12'
                          : 'bg-[#E8962E]/5 border-[rgba(232,150,46,0.12)] hover:bg-[#E8962E]/10 hover:border-[#E8962E]/35'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        {(() => { const IconComp = ICON_MAP[pilar.icon]; return IconComp ? <IconComp className="w-6 h-6 text-[#E8962E]" /> : null; })()}
                        <div className="flex items-center gap-1">
                          {pilar.es_hito && (
                            <Trophy className="w-3 h-3 text-[#E8962E]" />
                          )}
                          {pilar.estado === 'bloqueado' ? (
                            <Lock className="w-3.5 h-3.5 text-[#F2EFE9]/30" />
                          ) : pilar.estado === 'completado' ? (
                            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-[#F2EFE9]/40 font-medium uppercase tracking-wider">
                        Pilar {pilar.id.substring(1)}
                      </p>
                      <p className={`text-sm font-semibold mt-0.5 ${pilar.estado === 'bloqueado' ? 'text-[#F2EFE9]/30' : 'text-[#F2EFE9]'}`}>
                        {pilar.titulo}
                      </p>

                      {/* Mini barra de progreso */}
                      {pilar.estado !== 'bloqueado' && (
                        <div className="mt-3 h-1.5 bg-[#E8962E]/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${pilar.estado === 'completado' ? 'bg-[#22C55E]' : 'bg-[#E8962E]'}`}
                            style={{ width: `${pilar.totalMetas === 0 ? 0 : Math.round((pilar.metasCompletadas / pilar.totalMetas) * 100)}%` }}
                          />
                        </div>
                      )}

                      {/* Condición de desbloqueo especial */}
                      {pilar.estado === 'bloqueado' && (
                        <p className="text-[9px] text-[#F2EFE9]/30 mt-1.5 leading-tight">
                          {pilar.desbloqueo === 'venta_real' && 'Requiere 1 venta real'}
                          {pilar.desbloqueo === 'qa_verde' && 'Requiere QA 24/24 ✓'}
                        </p>
                      )}
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
        if (!pilar || pilar.estado === 'bloqueado') return null;

        return (
          <div ref={detalleRef} className="card-panel rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 scroll-mt-4">
            {/* Cabecera del pilar */}
            <div className="p-6 border-b border-[rgba(232,150,46,0.1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => { const IconComp = ICON_MAP[pilar.icon]; return IconComp ? <IconComp className="w-8 h-8 text-[#E8962E]" /> : null; })()}
                  <div>
                    <p className="text-sm text-[#E8962E] uppercase tracking-wider font-bold">
                      Pilar {pilar.id.substring(1)}
                    </p>
                    <h2 className="text-xl text-[#F2EFE9]" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{pilar.titulo}</h2>
                    <p className="text-sm text-[#F2EFE9]/60">{pilar.subtitulo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPilarAbierto(null)}
                  className="text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors p-1"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              {/* Progreso del pilar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-[#F2EFE9]/40">
                  <span>{pilar.metasCompletadas} de {pilar.totalMetas} metas</span>
                  <span className="flex items-center gap-1">{pilar.estrellas_completadas} <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 inline" /> completadas</span>
                </div>
                <div className="h-1.5 bg-[#E8962E]/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pilar.estado === 'completado' ? 'bg-[#22C55E]' : 'bg-[#E8962E]'}`}
                    style={{ width: `${pilar.totalMetas === 0 ? 0 : Math.round((pilar.metasCompletadas / pilar.totalMetas) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Aviso de desbloqueo especial */}
              {(pilar.desbloqueo === 'venta_real' || pilar.desbloqueo === 'qa_verde') && (
                <div className="mt-3 flex items-start gap-2 bg-[#E8962E]/10 border border-[#E8962E]/20 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-[#E8962E] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#E8962E]">
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
                    ? 'bg-[#EF4444]/10 border border-[#EF4444]/25'
                    : pilar.hito_tipo === 'checkpoint'
                    ? 'bg-[#22C55E]/10 border border-[#22C55E]/25'
                    : 'bg-[#E8962E]/10 border border-[#E8962E]/25'
                }`}>
                  <Trophy className={`w-4 h-4 shrink-0 mt-0.5 ${
                    pilar.hito_tipo === 'urgent' ? 'text-[#EF4444]' : pilar.hito_tipo === 'checkpoint' ? 'text-[#22C55E]' : 'text-[#E8962E]'
                  }`} />
                  <p className={`text-xs font-medium ${
                    pilar.hito_tipo === 'urgent' ? 'text-[#EF4444]' : pilar.hito_tipo === 'checkpoint' ? 'text-[#22C55E]' : 'text-[#E8962E]'
                  }`}>
                    {pilar.hito_mensaje}
                  </p>
                </div>
              )}
            </div>

            {/* Lista de metas */}
            <div className="p-4 space-y-3">
              {pilar.metas.map((meta) => {
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
                          ? 'opacity-40 cursor-not-allowed bg-[#1A1917]/20 border-[rgba(232,150,46,0.05)]'
                          : estaCompletada
                          ? 'bg-[#22C55E]/5 border-[#22C55E]/15 cursor-pointer'
                          : isActive
                          ? 'bg-[#E8962E]/10 border-[#E8962E]/30 cursor-pointer'
                          : 'bg-[#1A1917]/30 border-[rgba(232,150,46,0.1)] hover:bg-[#1A1917]/60 hover:border-[rgba(232,150,46,0.12)] cursor-pointer'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {!unlocked ? (
                          <Lock className="w-5 h-5 text-[#F2EFE9]/20" />
                        ) : estaCompletada ? (
                          <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#F2EFE9]/30 group-hover:text-[#F2EFE9]/60 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono text-[#F2EFE9]/40 bg-[#E8962E]/5 px-2 py-0.5 rounded">
                            {meta.codigo}
                          </span>
                          {/* Type badge */}
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${badge.bg} ${badge.color} flex items-center gap-1`}>
                            <BadgeIcon className="w-3 h-3" /> {badge.label}
                          </span>
                          {meta.es_estrella && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          )}
                          {tieneOutput && (
                            <FileText className="w-3 h-3 text-[#22C55E]" />
                          )}
                        </div>
                        <p className={`text-base font-medium ${estaCompletada ? 'text-[#F2EFE9]/40 line-through' : 'text-[#F2EFE9]'}`}>
                          {meta.titulo}
                        </p>
                        {!isActive && (
                          <p className="text-sm text-[#F2EFE9]/40 mt-1 leading-relaxed line-clamp-2">
                            {encuadrarPorAvatar(meta.codigo, meta.descripcion)}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#F2EFE9]/30 font-medium">
                            {meta.tiempo_estimado}
                          </span>
                          {meta.es_estrella && (
                            <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-500" /> Desbloquea siguiente pilar
                            </span>
                          )}
                          {!unlocked && (
                            <span className="text-xs text-[#F2EFE9]/30 font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" />{' '}
                              {bloqueoMsg ?? 'Completa la tarea anterior primero'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Inline task panel ── */}
                    {isActive && unlocked && (
                      <div ref={taskRef} className="mt-3 card-panel p-6 rounded-2xl border border-[rgba(232,150,46,0.12)] animate-in fade-in slide-in-from-top-2 duration-300">
                        {meta.tipo === 'VIDEO' && (
                          <TaskVideo
                            meta={meta}
                            onComplete={() => handleCompleteTask(pilar.numero, meta)}
                            isCompleted={estaCompletada}
                          />
                        )}
                        {meta.tipo === 'HERRAMIENTA' && meta.codigo === 'P0.2' && (
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
                        {meta.tipo === 'HERRAMIENTA' && meta.codigo === 'P8.8' && (
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
                        {meta.tipo === 'HERRAMIENTA' && meta.codigo !== 'P0.2' && meta.codigo !== 'P8.8' && (
                          <TaskHerramientaIA
                            meta={meta}
                            perfil={perfil}
                            geminiKey={geminiKey}
                            outputExistente={taskOutputs.get(key)}
                            onSaveADN={(output) => handleSaveADN(pilar.numero, meta, output)}
                            isCompleted={estaCompletada}
                          />
                        )}
                        {meta.tipo === 'COACH' && (
                          <TaskCoach
                            meta={meta}
                            onComplete={() => handleCompleteTask(pilar.numero, meta)}
                            isCompleted={estaCompletada}
                            onNavigateToCoach={() => onNavigate?.('coach')}
                          />
                        )}
                      
                        <EvidenciaUniversal userId={userId} metaCodigo={meta.codigo} />
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
                      ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]'
                      : 'bg-[#1A1917]/50 border-[rgba(232,150,46,0.08)] text-[#F2EFE9]/40'
                  }`}>
                    {todasCompletas
                      ? <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] inline shrink-0" /> Pilar {siguienteLabel} desbloqueado — todas las metas completadas</span>
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
          <div className="max-w-sm w-full rounded-2xl border border-[#E8962E]/30 bg-[#111110] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-[#F2EFE9] mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              🎉 Registrar una venta
            </h3>
            <p className="text-xs text-[#F2EFE9]/50 mb-4">Un paciente más cobrado con tu precio digno. El contador avanza contigo.</p>
            <label className="text-[10px] uppercase tracking-widest text-[#E8962E] font-bold">Monto (USD)</label>
            <input
              type="number"
              value={ventaMonto}
              onChange={(e) => setVentaMonto(e.target.value)}
              placeholder="1000"
              autoFocus
              className="w-full mt-1.5 mb-4 px-4 py-3 rounded-xl bg-[#080808] border border-[#F2EFE9]/15 text-[#F2EFE9] text-sm focus:border-[#E8962E]/50 focus:outline-none"
            />
            <button
              onClick={registrarVenta}
              disabled={ventaGuardando || !ventaMonto}
              className="w-full py-3 rounded-xl bg-[#E8962E] text-black text-sm font-semibold hover:bg-[#F4B65C] transition-colors disabled:opacity-40"
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
            if (nextPilar && nextPilar.estado !== 'bloqueado') {
              setPilarAbierto(nextPilar.numero);
              setTimeout(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            }
          }}
          onRating={async (rating, comentario) => {
            if (!isSupabaseReady() || !supabase || !userId) return;
            await supabase.from('pilar_satisfaction_ratings').upsert(
              {
                usuario_id: userId,
                pilar_numero: pilarUnlocked.numero,
                pilar_titulo: pilarUnlocked.completado,
                rating,
                comentario: comentario || null,
              },
              { onConflict: 'usuario_id,pilar_numero' },
            );
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
