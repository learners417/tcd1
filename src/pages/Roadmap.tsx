import { teaserDeMeta } from '../lib/teasers';
import { hoyISO } from '../lib/diaPrograma';
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
import { toast } from 'sonner';
import { mensajeDeFalla } from '../lib/conexion';
import { supabase, isSupabaseReady, guardarFila } from '../lib/supabase';
import type { HojaDeRutaItem, VentaRegistrada, ProfileV2 } from '../lib/supabase';
import {
  SEED_ROADMAP_V2,
  roadmap,
  FASES_ROADMAP,
  calcularNivel,
  TOTAL_JORNADAS_DEL_CLIENTE,
  SEED_ROADMAP_V3,
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
import { planDelCliente, planPermitePilar, waLink, enElTramoDelNumeroLocal } from '../lib/planes';
import { laOfertaQueSigue } from '../lib/laOfertaQueSigue';
import Graduacion from '../components/Graduacion';
import { registrarSesionCompletada } from '../lib/racha';
import { diaDelPrograma, diasHabilesDeAtraso, estaEnFaseAutonomia, mensajeDeRitmo, esPasoDelCliente, pilarAlcanzado, primerDiaDelPilar } from '../lib/diaPrograma';
import { faltaEnLaAntesala, leToca, type Antesala } from '../lib/antesala';
import { entraEnElEscalon, puertaDelEscalon } from '../lib/topeDelEscalon';
import EncabezadoCamino, { type SistemaAvance, type PasoDeHoy } from '../components/camino/EncabezadoCamino';
import QuienMonta from '../components/camino/QuienMonta';
import CintaCinturon from '../components/CintaCinturon';

// Lote D: adapta el encuadre de ciertas sesiones según el avatar del sanador
import { notificarPilarCompletado, notificarPilarDesbloqueado, notificarCinturon } from '../lib/notifications';
import { otorgarCinturonPorPilar, calcularCinturon, cinturonDesdeProgreso } from '../lib/cinturones';
import Dia45Banner from '../components/Dia45Banner';
import { validarADNDia45, compararFotoPartida } from '../lib/diaValidator';
import { usePersistedState } from '../lib/usePersistedState';
import { VOC } from '../lib/vocabulario';
import PuntoDePartida, { KEY_PARTIDA } from '../components/PuntoDePartida';
import { mapaDeVideos, PDFS_POR_TUTORIAL } from '../lib/videosCargados';
import { tutorialEscrito } from '../lib/tutorialesDeLupe';
import { paisajeDeSistema, paisajeDelDia } from '../lib/losCincoPaisajes';
import PortadaDeSistema from '../components/PortadaDeSistema';
import { baseDeOnboarding } from '../lib/onboardingBase';
import VeredictoCriticoPanel from '../components/VeredictoCriticoPanel';
import { claveDelDia, codigoDelDia, jornadaDe } from '../lib/roadmapSeed';
import { codigosEnRevision, revisionDelDia, pasosDeRevision, YA_TIENES } from '../lib/yaTienes';
import TestEneagrama from '../components/tasks/TestEneagrama';
import { tipo as tipoEneagrama } from '../lib/eneagrama';
import PreventaPanel from '../components/tasks/PreventaPanel';
import { precioSellado } from '../lib/bonosPreventa';
import HojaDeRuta from '../components/camino/HojaDeRuta';
import { sellarDia, desactualizados, avisoDe } from '../lib/adnCoincidente';
import TusNumeros from '../components/TusNumeros';
import AntesYDespues from '../components/tasks/AntesYDespues';
import { unirProgreso, leerProgresoLocal, guardarProgresoLocal } from '../lib/progresoDelCliente';

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
  perfil?: {
    adn_validacion_organica?: unknown;
    antesala?: Antesala;
    servicio_contratado?: string | null;
    servicio_marcado_el?: string | null;
  },
): boolean {
  // ── La antesala abre la primera jornada ──
  // El Camino arrancaba con 75 minutos de medición y pacto para alguien que
  // llega agotado. Ahora el día 1 espera a que haya hecho sus cinco días de
  // descanso. A quien ya lo cerró no se le agrega esta puerta atrás.
  if (
    meta.dia_asignado === 1
    && leToca(perfil?.antesala, completadas.has(claveDelDia(1)), enElTramoDelNumeroLocal())
  ) {
    return false;
  }

  // ── Lo que queda del otro lado de su escalón ──
  if (
    typeof meta.dia_asignado === 'number'
    && !entraEnElEscalon(meta.dia_asignado, jornadaDe(meta.dia_asignado)?.sistema ?? null,
      perfil?.servicio_contratado, perfil?.servicio_marcado_el)
  ) {
    return false;
  }

  if (meta.orden > 1) {
    // Las jornadas anteriores tienen que estar hechas, con tres excepciones:
    // la entrega técnica es del equipo, los días de campo no se completan, y
    // las jornadas fuera de su escalón no son suyas. Sin la tercera, el día 12
    // —que es del sistema 2 y cierra su primera etapa— quedaba trabado para
    // siempre esperando el día 11, que es del sistema 3 y no compró.
    for (const m of pilar.metas) {
      if (
        m.orden < meta.orden
        && esPasoDelCliente(m)
        && entraEnElEscalon(m.dia_asignado ?? 0, jornadaDe(m.dia_asignado ?? 0)?.sistema ?? null,
          perfil?.servicio_contratado, perfil?.servicio_marcado_el)
        && !completadas.has(`${pilar.numero}-${m.codigo}`)
      ) {
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
  perfil?: {
    adn_validacion_organica?: unknown;
    antesala?: Antesala;
    servicio_contratado?: string | null;
    servicio_marcado_el?: string | null;
  },
  completadas?: Set<string>,
): string | null {
  if (meta.dia_asignado === 1 && leToca(perfil?.antesala, completadas?.has(claveDelDia(1)) ?? false, enElTramoDelNumeroLocal())) {
    const falta = faltaEnLaAntesala(perfil?.antesala);
    return falta || 'Se abre cuando cierras tus cinco días de descanso.';
  }

  if (
    typeof meta.dia_asignado === 'number'
    && !entraEnElEscalon(meta.dia_asignado, jornadaDe(meta.dia_asignado)?.sistema ?? null,
      perfil?.servicio_contratado, perfil?.servicio_marcado_el)
  ) {
    return puertaDelEscalon(perfil?.servicio_contratado, perfil?.servicio_marcado_el);
  }

  if (meta.codigo === codigoDelDia(31)) {
    const count = contarPiezasValidacionOrganica(perfil);
    if (count < 3) {
      return `Se enciende con tus tres anuncios grabados. Tienes ${count} de 3.`;
    }
  }
  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────


/** Documenta tu trabajo — la evidencia universal (Punto 7 · el archivo del viaje) */
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
    <div className="mt-4 pt-4 border-t border-[var(--line, rgba(142,104,36,0.18))]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/55">Documenta tu trabajo</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="text-sm px-3 py-1.5 rounded-lg border border-[var(--line2, rgba(142,104,36,0.30))] text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
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
          fecha: hoyISO(),
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
        // La GRADUACIÓN: al llegar a 10, una sola vez. El día 90 también la
        // abre, aunque las diez no estén — ver el efecto más abajo.
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
  // La pregunta vive en planes.ts: acá leía `plan` a mano y, como esa columna
  // no se limpia al subir de escalón, al que pagaba La Base le dejaba el
  // Camino cortado en el día 5 con el candado del día 6 puesto.
  const planLimitado = useMemo(() => enElTramoDelNumeroLocal(), []);

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
        yaCargo.current = true;
        setLoading(false);
        return;
      }

      const [{ data: hdr }, { data: vts }, { data: vids }] = await Promise.all([
        supabase.from('hoja_de_ruta').select('*').eq('usuario_id', userId),
        supabase.from('ventas_registradas').select('*').eq('usuario_id', userId),
        supabase.from('programa_videos').select('pilar_id, youtube_url').order('created_at', { ascending: true }),
      ]);

      if (hdr) {
        /*
         * ─── LA BASE MANDA DONDE HABLA, Y CALLA DONDE NO TIENE FILA ──────
         *
         * Decía «la DB es la fuente de verdad» y escribía su resultado tal
         * cual encima del espejo local. Con la base devolviendo vacío —una
         * cuenta nueva allá con progreso acá, una consulta que falla, el modo
         * sin base— eso BORRA el trabajo del cliente, y es su única copia.
         *
         * Lo que el cliente cerró, cerrado está. Y el desmarcado también
         * viaja: la base lo guarda como una fila con `completada: false`, que
         * es lo que escribe `desmarcarHechoAfuera` cuando el equipo deshace
         * desde el Admin una jornada dada por hecha afuera. Esas filas SÍ
         * abren la jornada. Lo que la base no nombra queda como está.
         * `unirProgreso` es ese criterio, y lo comparten las tres pantallas
         * que traen la hoja de ruta.
         *
         * Y la escritura sale de acá: la hace el efecto de persistencia, que
         * espera a que la carga termine. Dos lugares escribiendo la misma
         * clave en el mismo arranque es cómo se perdía el progreso.
         */
        setCompletadas(unirProgreso(hdr as HojaDeRutaItem[]));

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

      yaCargo.current = true;
      setLoading(false);
    }
    cargar();
  }, [userId]);

  // ─── Persistir en localStorage ──────────────────────────────────────────
  /*
   * ─── NO SE ESCRIBE ANTES DE HABER LEÍDO ──────────────────────────────
   *
   * Este efecto corría en el PRIMER render, cuando `completadas` todavía es
   * el `new Set()` vacío con el que arranca, y pisaba `tcd_hoja_ruta_v2` con
   * un array vacío. Medido: setenta y una jornadas guardadas pasaban a cero
   * en menos de trescientos milisegundos, y no volvían.
   *
   * El cliente abría El Camino y perdía su progreso entero. Y ni siquiera
   * podía entender qué pasó: con cero jornadas vuelve a aparecer la pantalla
   * de «¿Qué ya tienes andando?», la pregunta del día cero, así que lo que ve
   * es la app recién estrenada.
   *
   * `yaCargo` lo cierra: hasta que la carga termina —de la base o del espejo
   * local— esto no toca nada. Lo escrito es la única copia que tiene quien
   * trabaja sin base, y la primera que se consulta cuando la red falla.
   */
  const yaCargo = useRef(false);
  useEffect(() => {
    if (!yaCargo.current) return;
    /*
     * Y UN VACÍO NO PISA LO QUE HAY.
     *
     * El flag solo no alcanzaba: se marca al terminar la carga, pero
     * `setCompletadas` no se refleja hasta el render siguiente, así que entre
     * medio este efecto corre con el conjunto todavía vacío y escribe cero.
     * Medido: con el flag puesto, las setenta y una jornadas igual se perdían.
     *
     * Un conjunto vacío se guarda solo si lo guardado también lo está. El
     * único caso que esto deja afuera es el del cliente que desmarca su
     * última jornada: se le queda esa una marcada en el espejo hasta la
     * próxima que cierre. Contra perder setenta, es un cambio que vale.
     */
    const guardadas = leerProgresoLocal().size;
    if (completadas.size === 0 && guardadas > 0) return;
    guardarProgresoLocal(completadas);
  }, [completadas]);

  /**
   * ═══ LAS JORNADAS SUYAS, HECHAS ═══
   *
   * Un solo cálculo para los dos lugares que preguntan «¿cuánto lleva?»: el
   * porcentaje que ve el equipo y el «terminó el Camino» de la fase de
   * autonomía. Los dos dividían o comparaban contra las noventa y una metas
   * del seed —las del equipo y los días de campo incluidos— y ese total el
   * cliente no lo alcanza: sus jornadas son sesenta y cuatro.
   */
  const suyasHechas = useMemo(() => {
    const suyas = new Set(
      SEED_ROADMAP_V3.flatMap((p) => (p.metas ?? [])
        .filter(esPasoDelCliente)
        .map((m) => `${p.numero}-${m.codigo}`)),
    );
    return [...completadas].filter((k) => suyas.has(k)).length;
  }, [completadas]);

  // ─── Sincronizar progreso en perfil de Supabase (para el Admin) ────────
  useEffect(() => {
    if (!isSupabaseReady() || !supabase || !userId) return;
    /*
     * ─── LA MISMA VARA QUE VE EL CLIENTE ──────────────────────────────────
     *
     * Dividía por `TOTAL_METAS` —las noventa y una metas del seed, las del
     * equipo y los días de campo incluidos— y ese total el cliente no lo
     * alcanza: sus jornadas son sesenta y cuatro. Un cliente que cerró TODO
     * lo suyo le aparecía al equipo al setenta por ciento, y desde ese número
     * se decide a quién llamar y a quién dejar tranquilo.
     *
     * Ahora el numerador y el denominador son los mismos que la tarjeta de
     * Métricas y la fracción del Camino: las jornadas del cliente.
     */
    const pct = TOTAL_JORNADAS_DEL_CLIENTE === 0
      ? 0
      : Math.round((suyasHechas / TOTAL_JORNADAS_DEL_CLIENTE) * 100);
    supabase.from('profiles').update({ progreso_porcentaje: pct }).eq('id', userId).then(() => {});
  }, [suyasHechas, userId]);

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

  /*
   * ═══ LA GRADUACIÓN LLEGA POR EL DÍA, NO POR LAS VENTAS ═══
   *
   * Abría solo al registrar la décima venta a mano. Quien llegaba al día 90
   * con nueve —o con diez cobradas y ninguna cargada en ese modal— no veía
   * nunca su certificado, su foto de llegada ni el mensaje que se grabó a sí
   * mismo el primer día. Y es un caso previsto: la app misma contesta «¿qué
   * pasa si al día 90 no llegué a los diez?».
   *
   * Ahora la abre el día 90, una sola vez, y el contador de ventas sigue
   * abriéndola antes si las diez llegan primero. La ceremonia cuenta lo que
   * de verdad pasó: la pantalla recibe el número real de ventas.
   */
  useEffect(() => {
    if (diaActual < 90) return;
    if (localStorage.getItem('tcd_graduacion_vista')) return;
    localStorage.setItem('tcd_graduacion_vista', '1');
    setGraduacionVisible(true);
  }, [diaActual]);
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
    if (!planPermitePilar(planDelCliente(perfil), pilar.numero)) estado = 'plan_bloqueado';
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
          /*
           * El aviso de que se abrió el siguiente estaba escrito y nadie lo
           * llamaba. Va acá, que es donde ya se sabe cuál es el que sigue y
           * si quedó abierto: es el mismo dato que alimenta el modal.
           */
          if (nextPilar && nextPilar.estado !== 'bloqueado' && nextPilar.estado !== 'plan_bloqueado') {
            void notificarPilarDesbloqueado(userId, nextPilar.titulo);
          }
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
  /* Acá vivía `progresoPct`: declarado y nunca leído, con el mismo
     denominador inalcanzable del de arriba. Séptima vez que esta casa
     encuentra el patrón — código escrito y nunca conectado. */
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
  /* «Terminó el Camino» es que cerró LAS SUYAS. Comparaba contra las noventa
     y una del seed, así que quien cerraba sus sesenta y cuatro no llegaba
     nunca a la fase de autonomía por avance — solo por calendario. */
  const faseAutonomia = estaEnFaseAutonomia(
    diaEsperado,
    suyasHechas > 0 && suyasHechas >= TOTAL_JORNADAS_DEL_CLIENTE,
  );

  // ─── Toggle completar meta ─────────────────────────────────────────────
  /*
   * Acá vivía `toggleMeta`: treinta y seis líneas con su escritura a la base y
   * su celebración, definidas y NUNCA llamadas. El camino vivo es
   * `handleCompleteTask`, que entra por `onComplete` en la jornada abierta.
   *
   * Es la quinta vez que esta casa encuentra el mismo patrón —código escrito,
   * probado y nunca conectado— y esta vez costó algo más que espacio: su
   * escritura de `completada: false` se usó como prueba de que la base guarda
   * el desmarcado. La conclusión resultó correcta, pero por otra función:
   * `desmarcarHechoAfuera`, que sí se llama, desde el panel del Admin.
   * Razonar sobre código muerto da respuestas que a veces aciertan, que es lo
   * peor que puede pasar.
   */

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
  const [numerosAbiertos, setNumerosAbiertos] = useState(false);
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

  /**
   * EL PUNTO DE PARTIDA: SE GUARDA LO QUE YA TIENE, NO SE MUEVE SU FECHA.
   *
   * Acá estaba `const fechaInicio = proximoLunes();`, y escribía esa fecha en
   * el perfil, en localStorage y en la base. `proximoLunes` devuelve siempre un
   * lunes ESTRICTAMENTE futuro —de 1 a 7 días adelante, porque `|| 7` convierte
   * el 0 en 7—, así que el primer botón que toca un cliente en su Camino le
   * reescribía la fecha de inicio hacia adelante. Tres cosas a la vez:
   *
   *   · `diaDelPrograma` de una fecha futura da negativo y cae en
   *     `Math.max(1, …)`: su día quedaba congelado en «Día 1 de 90 · vas al
   *     día» hasta ese lunes, en el Camino y en HOY.
   *   · Pisaba la fecha que el equipo cargó en el alta, sin avisar, así que la
   *     ficha del Admin y la pantalla del cliente mostraban días distintos.
   *   · Su ventana de acceso se calcula de `fecha_inicio` pero `acceso_hasta`
   *     quedaba de la fecha original: dos fechas de cierre para el mismo
   *     cliente.
   *
   * Y se disparaba aunque no marcara nada, porque el botón llama igual con una
   * lista vacía.
   *
   * Ahora: la fecha la pone el equipo en el alta y no se toca. Si por algo no
   * está, se pone HOY — alguien que está tocando «Empezar el día 1» empieza
   * hoy, no el lunes que viene, que es además lo que dice el botón.
   */
  /**
   * Guarda una pieza del ADN: la escribe en el estado, en el teléfono y en la
   * base, y MIRA el error.
   *
   * ═══ LOS CINCO QUE NO LLEGABAN ═══
   *
   * Cinco piezas se guardaban con `onProfileFieldUpdate`, que es solo estado
   * de React: eneagrama, bonos de preventa, medición de salida, mapa de
   * obstáculos y la foto de partida. El cliente no lo notaba, porque cada
   * componente guarda además su copia en el teléfono; lo que no existía era
   * el dato del lado del equipo ni del Mentor.
   *
   * La foto de partida era la más cara de las cinco: el día 1 promete
   * compararla, y el día 45, la graduación y la foto del día 90 la leen desde
   * el perfil. Las tres devolvían vacío, y como el estado vacío no dibuja
   * nada, la promesa se rompía en silencio.
   *
   * Lo mismo vale para las piezas escritas desde el Espejo.
   *
   * El Espejo mostraba cuatro piezas y mandaba a buscarlas a otra pantalla, y
   * a tres de las cuatro las mandaba a jornadas que ya no existen en el
   * Camino: el propósito, el legado y los cinco NO quedaron de una versión
   * anterior del método. Ahora se escriben ahí, en el momento en que el
   * cliente ve que faltan.
   *
   * Mira el error de la base: Supabase lo DEVUELVE en vez de lanzarlo, así
   * que un try/catch no alcanza. Si falla, el cliente se entera en el momento
   * y no cuando vuelve y su legado no está.
   */
  const guardarPiezaDelADN = useCallback(async (campos: Record<string, unknown>) => {
    onProfileFieldUpdate?.(campos);
    try {
      const local = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}');
      localStorage.setItem('tcd_profile', JSON.stringify({ ...local, ...campos }));
    } catch { /* noop */ }

    if (!isSupabaseReady() || !supabase || !userId) return;
    const { error } = await supabase.from('profiles').update(campos).eq('id', userId);
    if (error) toast.error(mensajeDeFalla(error, 'guardar'));
  }, [userId, onProfileFieldUpdate]);

  const marcarPartida = useCallback((ids: string[]) => {
    const campos: Record<string, unknown> = { ya_tiene: ids };

    let perfilLocal: Record<string, unknown> = {};
    try { perfilLocal = JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'); } catch { /* noop */ }
    const yaTieneFecha = Boolean(perfil?.fecha_inicio ?? perfilLocal.fecha_inicio);

    if (!yaTieneFecha) {
      const hoy = new Date();
      campos.fecha_inicio = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    }

    onProfileFieldUpdate?.(campos);
    try {
      localStorage.setItem('tcd_profile', JSON.stringify({ ...perfilLocal, ...campos }));
    } catch { /* noop */ }
    if (isSupabaseReady() && supabase && userId) {
      /*
       * Mira el error, como su vecina guardarPiezaDelADN. Acá va
       * `fecha_inicio`, el número del que vive toda la app: el día del
       * Camino, el acceso y la garantía se cuentan desde ahí. La pantalla
       * queda bien igual porque antes se escribió en el teléfono, así que si
       * esto falla en silencio el cliente ve un día y su ficha otro.
       */
      void supabase.from('profiles').update(campos).eq('id', userId)
        .then(({ error }) => { if (error) toast.error(mensajeDeFalla(error, 'guardar tu punto de partida')); });
    }
    setEnRevision(codigosEnRevision(ids));
  }, [userId, onProfileFieldUpdate, perfil?.fecha_inicio]);

  /** El tutorial de Lupe del día, si ya tiene enlace cargado. */
  const tutorialDelDia = useCallback((dia: number | null | undefined) => {
    if (dia === null || dia === undefined) return null;
    // Antes exigía video o PDF, y sin ninguno de los dos devolvía null: el
    // tutorial DESAPARECÍA. Trece de los veintiún están grabados, así que en
    // ocho jornadas el cliente hacía su sesión sin enterarse nunca de que
    // había un paso a paso — su link de pago, su página publicada, su
    // bandeja, su contenido del mes. Ahora el texto es el tutorial y el video
    // se suma arriba cuando llega.
    // Y mostraba SOLO EL PRIMERO del día. El día 17 tiene seis tutoriales —su
    // video, su formulario, su calendario, su página de preparación, cargar
    // consultantes y facturar— y el cliente veía uno. El día 29 tiene cuatro.
    // En los dos escalones que montan todo ellos mismos, eso es media jornada
    // sin paso a paso.
    const todos = roadmap.tutoriales.filter((x) => x.dia === dia
      && (videosPorPilar[x.codigo] || PDFS_POR_TUTORIAL[x.codigo] || tutorialEscrito(x.codigo)));
    if (todos.length === 0) return null;
    const minutosTotales = todos.reduce((n, x) => n + (x.minutos ?? 0), 0);
    return (
      <div className="space-y-4">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
          {/*
            Decía «Los 3 pasos a paso de hoy»: mal escrito —«pasos a paso» no
            se dice— y además contaba en «pasos», que en esta app son los
            cinco o seis que hay DENTRO de una jornada. El rótulo nombra lo
            que son, y el número va donde ya van los minutos.
          */}
          Paso a paso en pantalla
          {todos.length > 1 && ` · ${todos.length}`}
          {minutosTotales > 0 && ` · ${minutosTotales} min`}
        </p>
        {todos.map((t) => {
          const pdf = PDFS_POR_TUTORIAL[t.codigo];
          const escrito = tutorialEscrito(t.codigo);
          return (
      <div key={t.codigo} className="space-y-2">
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
        {/* EL PASO A PASO ESCRITO. Completo, no detrás de un «ver más»: quien
            abre este bloque viene a hacer el paso, no a decidir si lo lee. */}
        {escrito && (
          <div className="rounded-2xl border border-[var(--line2,#DFD3BC)] p-4 space-y-3">
            {/* Lo que el cliente LEE va en la letra de los libros, no en la de
                la interfaz. Es el mismo paso a paso de antes: lo que cambia es
                que ahora se lee como una página y no como un panel. */}
            <p className="prosa-libro text-cream/85">{VOC(escrito.intro)}</p>
            <ol className="space-y-2.5">
              {escrito.pasos.map((paso, i) => (
                <li key={i} className="flex gap-3">
                  {/* El numeral en versalita de oro, como en el libro. */}
                  <span className="rotulo-libro shrink-0" style={{ lineHeight: '1.62' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="prosa-libro text-cream/85">{VOC(paso)}</span>
                </li>
              ))}
            </ol>
            {/* Leyendo sin nadie al lado, lo que traba es lo que sale distinto
                de lo que dice el paso. */}
            <p className="prosa-libro accion-libro text-cream/70">
              <span className="rotulo-libro block mb-1">Si algo no sale</span>
              {VOC(escrito.siFalla)}
            </p>
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
        })}
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
      try { localStorage.setItem('tcd_sesion_hoy_' + hoyISO(), meta.titulo); } catch { /* noop */ }
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
        <div className="fade-rise fixed top-6 right-6 z-50 bg-gold/90 backdrop-blur text-ink text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300">
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

      {/* Sus números: su meta, lo que lleva cobrado y sus horas. */}
      {numerosAbiertos ? (
        <TusNumeros
          cobros={ventas.map((v) => ({ fecha: v.fecha, monto: v.monto ?? 0 }))}
          onRegistrarCobro={() => setVentaModal(true)}
          onCerrar={() => setNumerosAbiertos(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setNumerosAbiertos(true)}
          className="w-full min-h-[56px] rounded-2xl border border-[var(--line2,#DFD3BC)] px-4 flex items-center justify-between"
        >
          <span className="text-[17px] font-semibold text-cream">Tus números</span>
          <span className="text-[15px] text-cream/70">tu meta y tus cobros ›</span>
        </button>
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
        {/* El destino se llama «Mi ADN» en la barra, el buscador y las
            pestañas: el botón que lleva ahí dice el mismo nombre. */}
        <span className="text-[17px] font-semibold text-cream">Mi ADN</span>
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

      {/* ── Quién monta lo técnico en su escalón ──
             Las tres ofertas se diferencian sobre todo en esto, y estaba
             decidido en la ficha del cliente y en ninguna parte de su app. */}
      <QuienMonta
        servicio={perfil?.servicio_contratado}
        servicioMarcadoEl={perfil?.servicio_marcado_el}
        onIrAlDia={(dia) => {
          const cod = codigoDelDia(dia);
          if (!cod) return;
          const pil = seedConVideos.find((p) => p.metas.some((m) => m.codigo === cod));
          if (!pil) return;
          setPilarAbierto(pil.numero);
          setActiveMeta(cod);
          setTimeout(() => document.getElementById(`meta-${cod}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
        }}
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
            <div key={fase.fase} className="space-y-3">
              {/* LA PORTADA DEL SISTEMA.
                  Acá había un rótulo de carpeta: «Tu reset · Días 1-5».
                  Correcto, y no decía nada — el cliente leía un título de
                  sección en el lugar donde debería entender por qué esos cinco
                  días van juntos.
                  Ahora va el paisaje del libro que trata ese sistema, con su
                  dato real y lo que significa para su trabajo. Es la misma
                  imagen que va a encontrar en el libro, en la landing y en
                  Bariloche: la misma idea, igual en todos lados.
                  La portada entera solo en la fase donde está parado; en las
                  otras va la tira. Un momento repetido cinco veces deja de ser
                  un momento. */}
              {paisajeDeSistema(fase.fase) ? (
                <PortadaDeSistema
                  paisaje={paisajeDeSistema(fase.fase)!}
                  compacta={paisajeDelDia(diaActual)?.n !== fase.fase}
                />
              ) : (
                <div className="flex items-center gap-3 px-1 mb-1">
                  <div className="flex-1">
                    <h2 className="text-[22px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
                      {VOC(fase.titulo)}
                    </h2>
                    <p className="text-sm text-cream/55 mt-0.5">{VOC(fase.subtitulo)}</p>
                  </div>
                </div>
              )}

              {/* Grid de pilares de la fase */}
              <div className={`grid gap-3 ${pilaresEnFase.length === 1 ? 'grid-cols-1' : pilaresEnFase.length === 3 || pilaresEnFase.length > 4 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                {pilaresEnFase.map((pilar) => {
                  const isSelected = pilarAbierto === pilar.numero;
                  return (
                    <button
                      key={pilar.numero}
                      onClick={() => {
                        if (pilar.estado === 'plan_bloqueado') {
                          /*
                           * LA OFERTA DE HOY, NO LA DE ANTES.
                           *
                           * Acá ofrecía «Tu Sistema · $497» y, más arriba, «El
                           * Programa Completo · $997»: la escalera vieja. El que
                           * pagaba los $27 llegaba al día 6 enganchado, tocaba
                           * este botón, y veía un nombre y un precio que ya no
                           * se venden. La venta automática se cortaba ahí.
                           */
                          const oferta = laOfertaQueSigue(pilar.numero);
                          window.open(oferta.checkout || waLink(oferta.mensaje), '_blank');
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
                        const oferta = laOfertaQueSigue(pilar.numero);
                        return (
                          <span className="block text-sm text-gold/85 mt-1.5 leading-relaxed">
                            Se abre con <strong>{oferta.nombre}</strong> · {oferta.precio} — toca para verlo
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
            <div className="p-6 border-b border-[var(--line, rgba(142,104,36,0.18))]">
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
                  {/* El segundo contador decía «0 ★ completadas» sin decir
                      completadas de qué, y «completadas» donde el resto de la
                      app dice «hechas». Las estrellas son las jornadas que
                      cierran tramo: eso es lo que cuenta. */}
                  <span>{pilar.metasCompletadas} de {pilar.totalMetas} jornadas hechas</span>
                  <span className="flex items-center gap-1 shrink-0">{pilar.estrellas_completadas} <Star className="w-3.5 h-3.5 text-gold fill-gold inline" /> de cierre</span>
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
                      : 'Este pilar se desbloqueó porque tu camino de captación pasó sus 24 puntos de control.'}
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
                  <p className={`text-xs font-semibold ${
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
                const bloqueoMsg = !unlocked ? motivoBloqueo(meta, perfil, completadas) : null;
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
                          ? 'opacity-40 cursor-not-allowed bg-surface/20 border-[var(--line, rgba(142,104,36,0.18))]'
                          : estaCompletada
                          ? 'bg-success/5 border-success/15 cursor-pointer'
                          : isActive
                          ? 'bg-gold/10 border-gold/30 cursor-pointer'
                          : 'bg-surface/30 border-[var(--line, rgba(142,104,36,0.18))] hover:bg-surface/60 hover:border-[var(--line, rgba(142,104,36,0.18))] cursor-pointer'
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
                          <p className={`text-base font-semibold ${estaCompletada ? 'text-cream/55 line-through' : 'text-cream'}`}>
                            {VOC(meta.titulo)}
                          </p>
                        )}
                        {/* Lo que se lleva se dice una sola vez, dentro de la sesión. */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-cream/45 font-semibold">
                            {meta.tiempo_estimado}
                          </span>
                          {/* El oro de la casa, no el amarillo de catálogo:
                              ese daba 4,3:1 sobre el papel de la tapa, y el
                              piso de lectura es 4,5. */}
                          {meta.es_estrella && (
                            /* «Desbloquea siguiente pilar»: «pilar» es el
                               identificador de la base —al cliente el Camino le
                               muestra el tramo por sus días— y «desbloquea» es
                               la palabra que las puertas cambiaron por «se
                               abre». La estrella marca la jornada que cierra el
                               tramo: eso es lo que dice. */
                            <span className="text-xs text-gold font-semibold flex items-start gap-1">
                              <Star className="w-3 h-3 mt-0.5 shrink-0 fill-gold" /> Cierra este tramo
                            </span>
                          )}
                          {!unlocked && (
                            teaserDeMeta(meta.codigo) ? (
                              <span className="text-xs text-gold/80 font-semibold flex items-start gap-1.5 leading-relaxed">
                                <Lock className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{teaserDeMeta(meta.codigo)}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-cream/45 font-semibold flex items-center gap-1">
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
                      <div ref={taskRef} className="mt-3 card-panel p-6 rounded-2xl border border-[var(--line, rgba(142,104,36,0.18))] animate-in fade-in slide-in-from-top-2 duration-300">
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
                          <div className="fixed inset-0 z-[60] overflow-y-auto bg-[var(--bg-card,#17150F)]">
                            <div className="sticky top-0 z-10 bg-[var(--bg-card,#17150F)]/95 backdrop-blur border-b border-gold/15 px-4 py-3 flex items-center justify-between">
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
                            onElegir={(ids) => void guardarPiezaDelADN({ adn_bonos_preventa: ids })}
                          />
                        )}

                        {/* Tu antes y después: la medición de salida, el día 82. */}
                        {meta.codigo === codigoDelDia(82) && (
                          <AntesYDespues
                            onGuardar={(salida) => void guardarPiezaDelADN({ adn_medicion_salida: salida })}
                          />
                        )}

                        {/* El test del eneagrama: la herramienta del día 3. */}
                        {meta.codigo === codigoDelDia(3) && (
                          <TestEneagrama
                            onResultado={(tipoId) => {
                              const t = tipoEneagrama(tipoId);
                              if (t) void guardarPiezaDelADN({ adn_eneagrama: t.nombre });
                            }}
                          />
                        )}

                        {meta.codigo === codigoDelDia(1) && (
                          <TaskFotoPartida
                            meta={meta}
                            valorExistente={perfil?.adn_autoevaluacion_dia1}
                            onSaveADN={(output, scores) => {
                              handleSaveADN(pilar.numero, meta, output);
                              void guardarPiezaDelADN({ adn_autoevaluacion_dia1: scores });
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
                              void guardarPiezaDelADN({ adn_metodo_mapeo_obstaculos: filas });
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
                      : 'bg-surface/50 border-[var(--line, rgba(142,104,36,0.18))] text-cream/55'
                  }`}>
                    {todasCompletas
                      ? <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success inline shrink-0" /> Terminaste este tramo. El siguiente ya está abierto.</span>
                      : <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400 inline shrink-0" /> Te falta {pilar.metas.filter((m) => esPasoDelCliente(m) && !completadas.has(`${pilar.numero}-${m.codigo}`)).length === 1 ? 'una jornada' : `${pilar.metas.filter((m) => esPasoDelCliente(m) && !completadas.has(`${pilar.numero}-${m.codigo}`)).length} jornadas`} para cerrar este tramo.</span>}
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
            <h3 className="text-lg font-semibold text-cream mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Registrar una venta
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
          onGuardarPieza={guardarPiezaDelADN}
        />
      )}
    </div>
  );
}
