import { COMPLEMENTOS } from '../lib/metodoComplementos';
import { useState, useRef, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { usePersistedState } from '../lib/usePersistedState';
import {
  ArrowLeft,
  Sparkles,
  Lock,
  ChevronLeft,
  ChevronRight,
  Play,
  Youtube,
  X,
  Clock,
  Loader2,
  Sprout, Mail, BookOpen, RefreshCw, DollarSign, Microscope, Target,
  Lightbulb, Ruler, Smartphone, Clapperboard, CalendarDays, Camera,
  Bot, Globe, Phone, Megaphone, Triangle, Cog, Building2, Handshake,
  Palette, BarChart3, Sunrise, UserCircle,
} from 'lucide-react';
import { SEED_ROADMAP_V3 } from '../lib/roadmapSeed';
import type { PilarId } from '../lib/supabase';
import { getHerramienta, HERRAMIENTAS_V3, EMOJI_TO_ICON } from '../lib/herramientas';
import type { HerramientaV3 } from '../lib/herramientas';

const BIB_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout, Mail, BookOpen, RefreshCw, DollarSign, Microscope, Target,
  Lightbulb, Ruler, Smartphone, Clapperboard, CalendarDays, Camera,
  Bot, Globe, Phone, Megaphone, Triangle, Cog, Building2, Handshake,
  Palette, BarChart3, Sunrise, UserCircle,
};
import {
  getYoutubeEmbedUrl,
  getYoutubeVideoId,
  type VideoModulo,
} from '../lib/videos';
import HerramientaDetalle from './HerramientaDetalle';

// ─── CLINICA Tab definitions ────────────────────────────────────────────────

type ClinicaTabId = 'O' | 'C1' | 'L' | 'I1' | 'N' | 'I2' | 'C2' | 'A';

interface ClinicaTab {
  id: ClinicaTabId;
  letter: string;
  label: string;
  pilarIds: PilarId[];
  color: string;
}

const CLINICA_TABS: readonly ClinicaTab[] = [
  {
    id: 'O',
    letter: 'O',
    label: 'Onboarding',
    pilarIds: ['P0'],
    color: '#F4B65C',
  },
  {
    id: 'C1',
    letter: 'C',
    label: 'Conciencia',
    pilarIds: ['P1'],
    color: '#E8962E',
  },
  {
    id: 'L',
    letter: 'L',
    label: 'Liberación',
    pilarIds: ['P1'],
    color: '#F4B65C',
  },
  {
    id: 'I1',
    letter: 'Í',
    label: 'Identidad',
    pilarIds: ['P2'],
    color: '#E8962E',
  },
  {
    id: 'N',
    letter: 'N',
    label: 'Narrativa',
    pilarIds: ['P3'],
    color: '#F4B65C',
  },
  {
    id: 'I2',
    letter: 'I',
    label: 'Instalación',
    pilarIds: ['P4'],
    color: '#E8962E',
  },
  {
    id: 'C2',
    letter: 'C',
    label: 'Cobro',
    pilarIds: ['P5', 'P6'],
    color: '#F4B65C',
  },
  {
    id: 'A',
    letter: 'A',
    label: 'Autonomía',
    pilarIds: ['P7'],
    color: '#E8962E',
  },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCompletadas(): Set<string> {
  try {
    const saved = localStorage.getItem('tcd_hoja_ruta_v2');
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Una tab queda desbloqueada si:
 *  - es la primera (C1), o
 *  - el cliente ya completó alguna meta de sus pilares, o
 *  - hay al menos un video extra (subido desde admin) para alguno de sus pilares.
 * Caso 3: aunque el cliente no tenga progreso, ve los videos que Javo le cargó.
 */
function isTabUnlocked(
  tab: ClinicaTab,
  completadas: Set<string>,
  extraVideos: VideoModulo[],
): boolean {
  // Tabs sin pilares asignados (placeholder del método CLINICA) quedan bloqueadas.
  if (tab.pilarIds.length === 0) return false;

  // Onboarding y la primera del método siempre abiertas.
  if (tab.id === 'O' || tab.id === 'C1') return true;

  for (const pilarId of tab.pilarIds) {
    const pilar = SEED_ROADMAP_V3.find((p) => p.id === pilarId);
    if (!pilar) continue;
    for (const meta of pilar.metas) {
      if (completadas.has(meta.codigo)) return true;
    }
  }

  const tabPilars = new Set<string>(tab.pilarIds);
  return extraVideos.some(
    (v) => v.pilar_id !== undefined && tabPilars.has(v.pilar_id),
  );
}

/** Get herramientas V3 for a set of pilarIds */
function getHerramientasForPilars(pilarIds: readonly PilarId[]): HerramientaV3[] {
  const prefixes = pilarIds.map((pid) => `H-${pid}.`);
  return HERRAMIENTAS_V3.filter((h) =>
    prefixes.some((prefix) => h.id.startsWith(prefix))
  );
}

/**
 * Build video entries from roadmap metas. Solo incluye metas con un YouTube ID
 * real (descarta PLACEHOLDER_*) — los reales se suben desde el panel admin a
 * la tabla programa_videos y se mergean por separado.
 */
function getVideosFromPilars(pilarIds: readonly PilarId[]): VideoModulo[] {
  const videos: VideoModulo[] = [];
  for (const pilarId of pilarIds) {
    const pilar = SEED_ROADMAP_V3.find((p) => p.id === pilarId);
    if (!pilar) continue;
    for (const meta of pilar.metas) {
      if (
        meta.tipo === 'VIDEO' &&
        meta.video_youtube_id &&
        !meta.video_youtube_id.startsWith('PLACEHOLDER')
      ) {
        videos.push({
          id: meta.codigo,
          grupo: 'A', // placeholder — not used for display
          pilar_id: pilarId,
          titulo: meta.titulo,
          descripcion: meta.descripcion,
          youtubeUrl: `https://youtu.be/${meta.video_youtube_id}`,
          duracion: meta.tiempo_estimado,
        });
      }
    }
  }
  return videos;
}


// ═══ LOS RECURSOS ADN — los videos reales del método, por letra (ZIP humano) ═══
interface RecursoADN {
  id: string;
  titulo: string;
  youtubeId?: string;
  tab: ClinicaTabId;
  pasoDesbloqueo: { pilar: number; codigo: string; nombre: string } | null;
}
const RECURSOS_ADN: RecursoADN[] = [
  { id: 'r-bienvenido', titulo: 'Bienvenido al método', youtubeId: '6PG6nsJhnxA', tab: 'O', pasoDesbloqueo: null },
  { id: 'r-impostor', titulo: 'Cómo superar el síndrome del impostor', youtubeId: '3JPGgF4cjDw', tab: 'O', pasoDesbloqueo: null },
  { id: 'r-historia', titulo: 'Tu historia', youtubeId: 'ZClgkkUs2QI', tab: 'I1', pasoDesbloqueo: { pilar: 0, codigo: 'P0.2', nombre: 'Tu Foto de Partida' } },
  { id: 'r-proposito', titulo: 'Tu propósito', youtubeId: 'A9bWp0nVTQI', tab: 'I1', pasoDesbloqueo: { pilar: 0, codigo: 'P0.2', nombre: 'Tu Foto de Partida' } },
  { id: 'r-legado', titulo: 'Tu legado', youtubeId: 'BiZLzUGs2Wo', tab: 'I1', pasoDesbloqueo: { pilar: 0, codigo: 'P0.2', nombre: 'Tu Foto de Partida' } },
  { id: 'r-avatar', titulo: 'Tu paciente ideal (avatar)', youtubeId: 'XdjruYVXeOA', tab: 'I1', pasoDesbloqueo: { pilar: 2, codigo: 'P2.3', nombre: 'Tu paciente ideal' } },
  { id: 'r-matriz', titulo: 'Tu Matriz ABC', youtubeId: '6C_Qyk-_GCw', tab: 'I1', pasoDesbloqueo: { pilar: 2, codigo: 'P2.3', nombre: 'Tu paciente ideal' } },
  { id: 'r-metodo', titulo: 'Tu método', youtubeId: 'UwiDGcMFfJQ', tab: 'I1', pasoDesbloqueo: { pilar: 2, codigo: 'P2.4', nombre: 'Genera tu método' } },
  { id: 'r-ofertas', titulo: 'Tus ofertas', youtubeId: '_UjQtE4lNtk', tab: 'N', pasoDesbloqueo: { pilar: 3, codigo: 'P3.2', nombre: 'Diseña tu oferta' } },
  { id: 'r-puv', titulo: 'Tu PUV', youtubeId: 'nTWKGyvBbvY', tab: 'N', pasoDesbloqueo: { pilar: 4, codigo: 'P4.2', nombre: 'El mensaje que atrae' } },
  { id: 'r-infra', titulo: 'Tu infraestructura (sistema de captación)', youtubeId: 'FKrmQYR4CKA', tab: 'I2', pasoDesbloqueo: { pilar: 4, codigo: 'P4.5', nombre: 'Monta tu sistema' } },
  { id: 'r-dinero', titulo: 'Por qué el dinero se sana primero', youtubeId: 'AAk1P3ZrZOY', tab: 'C1', pasoDesbloqueo: { pilar: 1, codigo: 'P1.1', nombre: 'Sanar el Dinero' } },
  { id: 'r-cuerpo', titulo: 'El dinero en el cuerpo', tab: 'L', pasoDesbloqueo: { pilar: 1, codigo: 'P1.4', nombre: 'El dinero en el cuerpo' } },
  { id: 'r-dominio', titulo: 'Tu dirección digital — el dominio', tab: 'I2', pasoDesbloqueo: { pilar: 4, codigo: 'P4.5b', nombre: 'Tu dominio' } },
  { id: 'r-llamada', titulo: 'Anatomía de la llamada que cierra', youtubeId: 'xzrQXG7iaJc', tab: 'C2', pasoDesbloqueo: { pilar: 5, codigo: 'P5.1', nombre: 'La llamada' } },
  { id: 'r-entrega', titulo: 'Entregar sin quemarte', youtubeId: 'CQXN4Vt_nng', tab: 'C2', pasoDesbloqueo: { pilar: 6, codigo: 'P6.1', nombre: 'La entrega' } },
  { id: 'r-maquina', titulo: 'La máquina de 10 por mes', tab: 'A', pasoDesbloqueo: { pilar: 7, codigo: 'P7.1', nombre: 'Autonomía' } },
];
function pasoAlcanzado(pilarNum: number, completadas: Set<string>): boolean {
  if (pilarNum === 0) return true;
  for (const p of SEED_ROADMAP_V3) {
    if (p.numero >= pilarNum) break;
    if (!p.metas.every((m) => completadas.has(`${p.numero}-${m.codigo}`))) return false;
  }
  return true;
}
function RecursoCard({ r, completadas }: { r: RecursoADN; completadas: Set<string> }) {
  const desbloqueado = !r.pasoDesbloqueo || pasoAlcanzado(r.pasoDesbloqueo.pilar, completadas);
  if (!r.youtubeId) {
    return (
      <div className="rounded-2xl border border-[rgba(242,239,233,0.07)] bg-black/20 p-4 opacity-70">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/35 mb-1">🎬 Próximamente</p>
        <p className="text-sm text-cream/75">{r.titulo}</p>
                  {COMPLEMENTOS[r.id] && (
                    <details className="mt-3 rounded-xl border border-gold/15 bg-gold/[0.03] px-4 py-3 open:bg-gold/[0.05]">
                      <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-gold list-none select-none">📖 Resumen y mapa — la teoría en 2 min</summary>
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-cream/80 leading-relaxed">{COMPLEMENTOS[r.id].resumen}</p>
                        <ul className="space-y-1.5">
                          {COMPLEMENTOS[r.id].mapa.map((b, bi) => (
                            <li key={bi} className="text-[13px] text-cream/70 pl-4 relative"><span className="absolute left-0 text-gold">·</span>{b}</li>
                          ))}
                        </ul>
                        {COMPLEMENTOS[r.id].referente && (
                          <p className="text-[12px] text-cream/55 italic border-l-2 border-gold/30 pl-3">{COMPLEMENTOS[r.id].referente}</p>
                        )}
                        {COMPLEMENTOS[r.id].dato && (
                          <p className="text-[12px] text-goldhi/90">📊 {COMPLEMENTOS[r.id].dato}</p>
                        )}
                      </div>
                    </details>
                  )}
      </div>
    );
  }
  if (!desbloqueado) {
    return (
      <div className="rounded-2xl border border-[rgba(232,150,46,0.10)] bg-black/25 p-4 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-[1px] bg-black/20 pointer-events-none" />
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold/60 mb-1">🔒 Guardado para ti</p>
        <p className="text-sm text-cream/70">{r.titulo}</p>
        <p className="text-[11px] text-cream/45 mt-1.5">Se desbloquea con <span className="text-goldhi">{r.pasoDesbloqueo!.nombre}</span> · El Camino →</p>
      </div>
    );
  }
  return <RecursoVideoInApp r={r} />;
}


/** El video del método, SIEMPRE dentro de la app (nunca te saca a YouTube). */
function RecursoVideoInApp({ r }: { r: RecursoADN }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className={`rounded-2xl border border-[rgba(232,150,46,0.22)] bg-gradient-to-br from-gold/8 to-transparent overflow-hidden transition-all fade-rise ${abierto ? 'sm:col-span-2' : ''}`}>
      <button onClick={() => setAbierto((v) => !v)} className="w-full text-left p-4 hover:bg-gold/5 transition-colors">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-1">▶ Video del método</p>
        <p className="text-sm text-cream/90 font-medium">{r.titulo}</p>
        <p className="text-[11px] text-cream/55 mt-1">{abierto ? 'Cerrar' : 'Toca para ver aquí mismo'}</p>
      </button>
      {abierto && (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${r.youtubeId}?rel=0&modestbranding=1`}
            title={r.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

interface BibliotecaProps {
  userId?: string;
}

export default function Biblioteca({ userId }: BibliotecaProps) {
  const VALID_TABS: ClinicaTabId[] = ['O', 'C1', 'L', 'I1', 'N', 'I2', 'C2', 'A'];
  const [activeTabId, setActiveTabId] = usePersistedState<ClinicaTabId>(
    'tcd_biblioteca_tab',
    'O',
    { validate: (v) => VALID_TABS.includes(v) },
  );
  const [herramientaActivaId, setHerramientaActivaId] = useState<string | null>(null);
  const [videoActivo, setVideoActivo] = useState<VideoModulo | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [extraVideos, setExtraVideos] = useState<VideoModulo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const completadas = useMemo(() => getCompletadas(), []);

  const activeTab = CLINICA_TABS.find((t) => t.id === activeTabId) ?? CLINICA_TABS[0];

  // Derive content for active tab
  const herramientas = useMemo(
    () => getHerramientasForPilars(activeTab.pilarIds),
    [activeTab.pilarIds]
  );
  const completadasSet = useMemo(() => {
    try { const saved = localStorage.getItem('tcd_hoja_ruta_v2'); return new Set<string>(saved ? JSON.parse(saved) : []); } catch { return new Set<string>(); }
  }, [activeTabId]);
  const recursosTab = useMemo(() => RECURSOS_ADN.filter((r) => r.tab === activeTabId), [activeTabId]);

  const seedVideos = useMemo(
    () => getVideosFromPilars(activeTab.pilarIds),
    [activeTab.pilarIds]
  );

  // Merge seed + extra videos for the active tab's pilars, agrupados por pilar
  // siguiendo el orden de activeTab.pilarIds (sino quedan desordenados visualmente).
  const tabVideos = useMemo(() => {
    const activePilarIds = activeTab.pilarIds as readonly string[];
    const pilarOrder = new Map<string, number>(activePilarIds.map((p, i) => [p, i]));
    const filteredExtra = extraVideos.filter(
      (v) => v.pilar_id !== undefined && activePilarIds.includes(v.pilar_id)
    );
    return [...seedVideos, ...filteredExtra].sort((a, b) => {
      const ai = pilarOrder.get(a.pilar_id ?? '') ?? 999;
      const bi = pilarOrder.get(b.pilar_id ?? '') ?? 999;
      return ai - bi;
    });
  }, [seedVideos, extraVideos, activeTab.pilarIds]);

  useEffect(() => {
    cargarVideosExtra();
  }, []);

  async function cargarVideosExtra() {
    if (!supabase) return;
    setVideosLoading(true);
    try {
      const { data, error } = await supabase
        .from('programa_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setExtraVideos(
          data.map((v: Record<string, unknown>) => ({
            id: v.id as string,
            grupo: (v.grupo as string) as VideoModulo['grupo'],
            pilar_id: (v.pilar_id as string | null) ?? undefined,
            titulo: v.titulo as string,
            descripcion: v.descripcion as string,
            youtubeUrl: v.youtube_url as string,
            duracion: v.duracion as string | undefined,
          }))
        );
      }
    } catch (err) {
      console.error('Error cargando videos de la biblioteca:', err);
    } finally {
      setVideosLoading(false);
    }
  }

  // ─── Tab scroll ───────────────────────────────────────────────────────────

  function updateScrollState() {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = tabsRef.current;
    if (el) el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el?.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const scrollTabs = (dir: 'left' | 'right') => {
    tabsRef.current?.scrollBy({
      left: dir === 'right' ? 160 : -160,
      behavior: 'smooth',
    });
  };

  // ─── Herramienta detail view ──────────────────────────────────────────────

  if (herramientaActivaId) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300 pb-12">
        <button
          onClick={() => setHerramientaActivaId(null)}
          className="flex items-center gap-2 text-sm text-cream/75 hover:text-cream transition-colors uppercase tracking-wider font-bold mb-4 bg-gold/5 hover:bg-gold/10 px-4 py-2 rounded-xl w-max"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a El Método
        </button>
        <HerramientaDetalle
          herramientaId={herramientaActivaId}
          userId={userId}
          geminiKey={geminiKey}
          onVolver={() => setHerramientaActivaId(null)}
        />
      </div>
    );
  }

  // ─── Main view ────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight text-cream mb-2">
          El Método
        </h1>
        <p className="text-cream/75 text-sm">
          Videos y herramientas IA del Método C·L·I·N·I·C·A.
        </p>
      </div>

      {/* CLINICA tabs */}
      <div className="relative flex items-center gap-1">
        {canScrollLeft && (
          <button
            onClick={() => scrollTabs('left')}
            className="shrink-0 w-8 h-8 rounded-lg bg-gold/5 hover:bg-gold/10 border border-[rgba(232,150,46,0.12)] flex items-center justify-center text-cream/75 hover:text-cream transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1"
        >
          {CLINICA_TABS.map((tab) => {
            const isActive = activeTabId === tab.id;
            const unlocked = isTabUnlocked(tab, completadas, extraVideos);
            return (
              <button
                key={tab.id}
                onClick={() => unlocked && setActiveTabId(tab.id)}
                disabled={!unlocked}
                className={`flex flex-col items-center px-5 py-3 rounded-xl transition-all border min-w-[80px] ${
                  !unlocked
                    ? 'bg-surface/40 border-[rgba(232,150,46,0.05)] text-cream/20 cursor-not-allowed'
                    : isActive
                    ? 'bg-gold/15 border-gold/50 text-gold'
                    : 'bg-surface/30 border-[rgba(232,150,46,0.1)] text-cream/75 hover:text-cream hover:bg-surface/50'
                }`}
              >
                {!unlocked ? (
                  <Lock className="w-5 h-5 mb-1 text-cream/15" />
                ) : (
                  <span
                    className="text-xl font-bold leading-none mb-1"
                    style={{ color: isActive ? tab.color : undefined }}
                  >
                    {tab.letter}
                  </span>
                )}
                <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {canScrollRight && (
          <button
            onClick={() => scrollTabs('right')}
            className="shrink-0 w-8 h-8 rounded-lg bg-gold/5 hover:bg-gold/10 border border-[rgba(232,150,46,0.12)] flex items-center justify-center text-cream/75 hover:text-cream transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab description */}
      <div className="bg-gold/5 border border-gold/20 rounded-2xl px-5 py-4">
        <p className="text-sm text-cream/80">
          <span
            className="font-bold text-lg mr-2"
            style={{ color: activeTab.color }}
          >
            {activeTab.letter}
          </span>
          <span className="font-semibold text-cream">
            {activeTab.label}
          </span>
          {' — '}
          {activeTab.pilarIds
            .map((pid) => {
              const p = SEED_ROADMAP_V3.find((s) => s.id === pid);
              return p ? p.titulo : pid;
            })
            .join(', ')}
        </p>
      </div>

      {/* Los recursos del método — SIEMPRE visibles, independientes de los videos del seed */}
      {recursosTab.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {recursosTab.map((r) => <RecursoCard key={r.id} r={r} completadas={completadasSet} />)}
        </div>
      )}

      {/* Videos section */}
      {tabVideos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-cream/55 flex items-center gap-2">
            <Youtube className="w-4 h-4 text-danger" /> Videos
          </h2>
          {videosLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
              <p className="text-cream/75 text-sm">Cargando videos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tabVideos.map((v) => {
                const videoId = getYoutubeVideoId(v.youtubeUrl);
                const isPlaceholder =
                  !videoId || v.youtubeUrl.includes('PLACEHOLDER');
                const thumbUrl =
                  videoId && !isPlaceholder
                    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                    : null;
                return (
                  <div
                    key={v.id}
                    className="card-panel rounded-2xl border border-[rgba(232,150,46,0.1)] hover:border-[rgba(232,150,46,0.12)] transition-all overflow-hidden group flex flex-col"
                  >
                    <div
                      className={`relative aspect-video overflow-hidden bg-black/40 ${
                        isPlaceholder ? '' : 'cursor-pointer'
                      }`}
                      onClick={() => !isPlaceholder && setVideoActivo(v)}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={v.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface/30">
                          <Youtube className="w-10 h-10 text-gold/30" />
                        </div>
                      )}
                      {!isPlaceholder && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-2xl">
                            <Play className="w-6 h-6 text-cream fill-white ml-0.5" />
                          </div>
                        </div>
                      )}
                      {v.duracion && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-cream text-[11px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {v.duracion}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/20">
                          {v.pilar_id ?? v.id}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-cream mb-1">
                        {v.titulo}
                      </h3>
                      <p className="text-xs text-cream/75 leading-relaxed flex-1">
                        {v.descripcion}
                      </p>
                      {!isPlaceholder && (
                        <button
                          onClick={() => setVideoActivo(v)}
                          className="mt-3 w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-gold/80 hover:bg-gold text-cream transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Ver Video
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* L2 · recorte: El Método es SOLO la escuela — las herramientas viven en las sesiones del Camino */}
      {false && herramientas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-cream/55 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" /> Herramientas IA
          </h2>

          {!geminiKey && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4">
              <Lock className="w-4 h-4 text-gold shrink-0" />
              <p className="text-sm text-amber-300">
                Configura la variable{' '}
                <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 font-mono text-xs">
                  VITE_GEMINI_API_KEY
                </code>{' '}
                para activar las herramientas IA.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {herramientas.map((h) => (
              <div
                key={h.id}
                className="card-panel rounded-2xl p-5 border border-[rgba(232,150,46,0.1)] hover:border-[rgba(232,150,46,0.12)] hover:bg-surface/50 transition-all group flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  {(() => { const iconName = EMOJI_TO_ICON[h.emoji]; const IC = iconName ? BIB_ICON_MAP[iconName] : null; return IC ? <IC className="w-6 h-6 text-gold shrink-0" /> : <Sparkles className="w-6 h-6 text-gold shrink-0" />; })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/20">
                        {h.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-cream leading-snug">
                      {h.titulo}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-cream/75 leading-relaxed mb-4 flex-1">
                  {h.descripcion}
                </p>

                <button
                  onClick={() => setHerramientaActivaId(h.id)}
                  disabled={!geminiKey}
                  className={`w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    geminiKey
                      ? 'bg-gold hover:bg-goldhi text-cream shadow-lg shadow-gold/20'
                      : 'bg-gold/5 text-cream/45 cursor-not-allowed border border-[rgba(232,150,46,0.1)]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {geminiKey ? 'Abrir Herramienta' : 'Sin API Key'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when both lists are empty */}
      {herramientas.length === 0 && tabVideos.length === 0 && recursosTab.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-surface/30 border border-[rgba(232,150,46,0.1)] border-dashed rounded-2xl">
          <Sparkles className="w-12 h-12 text-gold/30 mb-4" />
          <p className="text-cream/75 text-sm font-medium mb-2">
            Este modulo esta en desarrollo
          </p>
          <p className="text-cream/45 text-xs max-w-sm leading-relaxed">
            Pronto se habilitaran videos y herramientas para{' '}
            <strong className="text-cream/75">{activeTab.label}</strong>.
          </p>
        </div>
      )}

      {/* Video lightbox modal */}
      {videoActivo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setVideoActivo(null)}
        >
          <div
            className="w-full max-w-4xl mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-cream font-medium text-sm truncate flex-1">
                {videoActivo.titulo}
              </h3>
              <button
                onClick={() => setVideoActivo(null)}
                className="w-8 h-8 rounded-full bg-gold/10 hover:bg-gold/20 flex items-center justify-center text-cream/75 hover:text-cream transition-colors shrink-0 ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-[rgba(232,150,46,0.12)]">
              <iframe
                src={getYoutubeEmbedUrl(videoActivo.youtubeUrl)}
                title={videoActivo.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
