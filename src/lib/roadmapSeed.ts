// datos/roadmapSeed.ts
// Tipos y export tipado del camino TCD.
// FUENTE ÚNICA: roadmap.seed.json — este archivo no duplica datos, los tipa.
// Para cambiar el camino: editar datos/generar_seed.py y correrlo. Nunca editar
// el JSON a mano.

import seed from './roadmap.seed.json'
import type { PilarId } from './supabase'

// ── primitivas ──────────────────────────────────────────────────────────────

export type SetGrabacion =
  | 'montaña' | 'lago' | 'pizarra' | 'oficina' | 'pantalla' | 'voz'

export type EstadoPieza = 'NUEVO' | 'REGRABAR' | 'CERO' | 'MANTIENE'

export type TipoJornada =
  | 'entrega_tecnica' | 'sesion' | 'protocolo'
  | 'rodaje' | 'campo' | 'ciclo' | 'cierre'

export type TipoEvidencia =
  | 'numero' | 'texto' | 'imagen' | 'url' | 'archivo' | 'evento'

export type EstadoJornada =
  | 'pendiente' | 'en_curso' | 'evidencia' | 'en_revision'
  | 'a_corregir' | 'completa' | 'frenada' | 'campo'

export type EstadoEvidencia =
  | 'pendiente' | 'en_revision' | 'aprobada' | 'a_corregir'

export type AgenteId =
  | 'espejo' | 'critico' | 'escriba' | 'camara'
  | 'sparring' | 'tablero' | 'arquitecto' | 'estratega'

export type CinturonId =
  | '10gup' | '9gup' | '8gup' | '7gup' | '6gup' | '5gup'
  | '4gup' | '3gup' | '2gup' | '1gup' | '1dan'

export type FrenoId =
  | 'F-ORDEN' | 'F-PAGINA' | 'F-RODAJE' | 'F-14DIAS' | 'F-TABLERO'
  | 'F-COMPRA' | 'F-PRECIO' | 'F-ADN' | 'F-ORGANICO'

export type RamaTrafico = 'frio' | 'tibio'

// ── entidades del seed ──────────────────────────────────────────────────────

export interface Sistema {
  n: 1 | 2 | 3 | 4 | 5
  nombre: string
  dias: string
}

export interface Pieza {
  codigo: string
  titulo: string
  dia: number
  sistema: number
  set: SetGrabacion
  minutos: number
  estado: EstadoPieza
}

export interface Tutorial {
  codigo: string
  titulo: string
  dia: number
  minutos: number
  donde: 'TCD' | 'MCD' | 'Sistema' | 'Meta' | 'Celular'
}

export interface Cinturon {
  id: CinturonId
  nombre: string
  color: string
  punta: string | null
  dia: number
  significado: string
  forma: string
  /** true = depende de que alguien pague. Se otorga cuando ocurre, no por fecha */
  en_ventana: boolean
  /** Derivados al cargar — no viven en el JSON, salen de su posición y su color. */
  orden: number
  metafora: string
  emoji: string
  /** El nombre viejo, derivado: 'Amarillo punta verde' -> 'amarillo_punta_verde'. */
  slug: string
}

export interface Agente {
  id: AgenteId
  nombre: string
  dia: number
  se_abre_con: string
}

export interface Freno {
  id: FrenoId
  regla: string
  apertura: string
  mensaje: string | null
}

export interface Evidencia {
  tipo: TipoEvidencia
  nombre: string
  valida: string
}

export interface Jornada {
  dia: number
  tipo: TipoJornada
  titulo: string
  sistema: number | null
  minutos: number
  piezas: string[]
  tutoriales: string[]
  agente: AgenteId | null
  manual: string | null
  acceso: string | null
  pasos: string[]
  evidencias: Evidencia[]
  adn_escribe: string[]
  freno_activa: FrenoId[]
  freno_levanta: FrenoId[]
  cinturon: CinturonId | null
  jornada_larga: boolean
  acciones_campo: string[]
  nota: string | null
  /** Modo 15 minutos: qué paso produce la evidencia. Base 1. */
  paso_esencial: number | null
}

export interface Roadmap {
  version: string
  idioma: string
  dias: number
  promesa: { consultantes: number; jornada_horas: number; dias_semana: number }
  sistemas: Sistema[]
  piezas: Pieza[]
  tutoriales: Tutorial[]
  cinturones: Cinturon[]
  agentes: Agente[]
  frenos: Freno[]
  jornadas: Jornada[]
}

// ── export ──────────────────────────────────────────────────────────────────

type CinturonCrudo = Omit<Cinturon, 'orden' | 'metafora' | 'emoji' | 'slug'>
type RoadmapCrudo = Omit<Roadmap, 'cinturones'> & { cinturones: CinturonCrudo[] }

const crudo = seed as unknown as RoadmapCrudo

/** El emoji sale del color base del cinturón — no hay tabla que mantener. */
const EMOJI_POR_COLOR: Record<string, string> = {
  '#FFFFFF': '\u{1F90D}',
  '#E8C24A': '\u{1F49B}',
  '#4E8C57': '\u{1F49A}',
  '#3A6EA5': '\u{1F499}',
  '#A6392E': '\u{2764}\u{FE0F}',
  '#1A1815': '\u{1F5A4}',
}

export const roadmap: Roadmap = {
  ...crudo,
  cinturones: crudo.cinturones.map((c, i) => ({
    ...c,
    orden: i,
    metafora: c.significado,
    emoji: EMOJI_POR_COLOR[c.color.toUpperCase()] ?? '\u{1F94B}',
    slug: c.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_'),
  })),
}

// ── índices, para no recorrer el array en cada render ────────────────────────

export const jornadaPorDia = new Map<number, Jornada>(
  roadmap.jornadas.map(j => [j.dia, j]),
)

export const piezaPorCodigo = new Map<string, Pieza>(
  roadmap.piezas.map(p => [p.codigo, p]),
)

export const tutorialPorCodigo = new Map<string, Tutorial>(
  roadmap.tutoriales.map(t => [t.codigo, t]),
)

export const cinturonPorId = new Map<CinturonId, Cinturon>(
  roadmap.cinturones.map(c => [c.id, c]),
)

export const agentePorId = new Map<AgenteId, Agente>(
  roadmap.agentes.map(a => [a.id, a]),
)

export const frenoPorId = new Map<FrenoId, Freno>(
  roadmap.frenos.map(f => [f.id, f]),
)

// ── helpers ─────────────────────────────────────────────────────────────────

/** La jornada de hoy. Siempre existe entre 0 y 90. */
export const jornadaDe = (dia: number): Jornada | undefined =>
  jornadaPorDia.get(dia)

/** El día siguiente con contenido, para la línea "Mañana" de la pantalla Hoy. */
export const jornadaSiguiente = (dia: number): Jornada | undefined => {
  for (let d = dia + 1; d <= roadmap.dias; d++) {
    const j = jornadaPorDia.get(d)
    if (j) return j
  }
  return undefined
}

/** El grado que corresponde a un día, si ese día otorga uno. */
export const cinturonDeDia = (dia: number): Cinturon | undefined => {
  const id = jornadaPorDia.get(dia)?.cinturon
  return id ? cinturonPorId.get(id) : undefined
}

/** Agentes abiertos a un día dado. El desbloqueo real lo valida la evidencia. */
export const agentesHasta = (dia: number): Agente[] =>
  roadmap.agentes.filter(a => a.dia <= dia)

/** Frenos activos a un día dado, según lo que activa y levanta cada jornada. */
export const frenosActivos = (dia: number): FrenoId[] => {
  const activos = new Set<FrenoId>()
  for (let d = 0; d <= dia; d++) {
    const j = jornadaPorDia.get(d)
    if (!j) continue
    j.freno_activa.forEach(f => activos.add(f))
    j.freno_levanta.forEach(f => activos.delete(f))
  }
  return [...activos]
}

/** Minutos de la jornada. Para el chip de duración de la tarjeta de hoy. */
export const minutosDe = (dia: number): number =>
  jornadaPorDia.get(dia)?.minutos ?? 0

/** Las cuatro jornadas largas, para avisarlas con fecha desde la bienvenida. */
export const jornadasLargas = (): Jornada[] =>
  roadmap.jornadas.filter(j => j.jornada_larga)

/** El paso esencial de una jornada, para el modo 15 minutos. */
export const pasoEsencialDe = (dia: number): string | undefined => {
  const j = jornadaPorDia.get(dia)
  if (!j || !j.paso_esencial) return undefined
  return j.pasos[j.paso_esencial - 1]
}

/** Total de trabajo del cliente, en minutos. Verificado: 4265 ≈ 71 horas. */
export const cargaTotal = (): number =>
  roadmap.jornadas.reduce((s, j) => s + j.minutos, 0)

/* ══════════════════════════════════════════════════════════════════════════
   CAPA DE COMPATIBILIDAD — el vocabulario viejo, derivado del JSON nuevo.

   No duplica un solo dato: todo sale de `roadmap`. Los pilares se derivan del
   prefijo del código de cada pieza (P4.2 → pilar P4), las metas son las piezas
   enriquecidas con lo que declara su jornada, y las fases son los sistemas.
   Por eso aguanta que se reordene el camino: deriva de la FORMA, no del
   contenido. Cuando los componentes hablen el idioma nuevo, este bloque se
   borra entero y no queda nada colgando.
   ══════════════════════════════════════════════════════════════════════════ */

export interface RoadmapMeta {
  codigo: string
  titulo: string
  descripcion: string
  tipo: 'VIDEO' | 'HERRAMIENTA' | 'COACH'
  orden: number
  dia_asignado: number
  tiempo_estimado: string
  es_estrella: boolean
  usa_ia: boolean
  adn_field?: string
  video_youtube_id?: string
  herramienta_id?: string
  evidencia_requerida?: { descripcion: string; tipo: TipoEvidencia; valida: string }
  checklist: string[]
  coach_instruccion?: string
  requiere_datos_de?: string[]
  icon: string
  set: SetGrabacion
  estado: EstadoPieza
  sistema: number
}

export interface RoadmapPilar {
  id: PilarId
  numero: number
  numero_orden: number
  titulo: string
  subtitulo: string
  fase: number
  icon: string
  metas: RoadmapMeta[]
  desbloqueo?: string
  es_hito: boolean
  hito_tipo?: string
  hito_mensaje?: string
  mentor_pregunta?: string
  estrellas_requeridas: number
}

export interface FaseRoadmap {
  fase: number
  titulo: string
  subtitulo: string
  dias: string
  metodo_letra: string | null
}

/** La jornada donde vive cada pieza — una sola pasada, no una búsqueda por meta. */
const jornadaDePieza = new Map<string, Jornada>()
for (const j of roadmap.jornadas) {
  for (const cod of j.piezas) if (!jornadaDePieza.has(cod)) jornadaDePieza.set(cod, j)
}

/** Los sistemas reales del JSON. Lo que cae afuera va a la fase de cierre. */
const SISTEMAS_VALIDOS = new Set(roadmap.sistemas.map((s) => s.n as number))
const FASE_CIERRE = Math.max(...roadmap.sistemas.map((s) => s.n)) + 1
const HAY_PIEZAS_SUELTAS = roadmap.piezas.some((p) => !SISTEMAS_VALIDOS.has(p.sistema))

function faseDePieza(p: Pieza): number {
  return SISTEMAS_VALIDOS.has(p.sistema) ? p.sistema : FASE_CIERRE
}

function tipoDeMeta(j: Jornada | undefined): 'VIDEO' | 'HERRAMIENTA' | 'COACH' {
  if (!j) return 'VIDEO'
  if (j.acceso || j.manual) return 'HERRAMIENTA'
  if (j.agente) return 'COACH'
  return 'VIDEO'
}

function metaDePieza(p: Pieza, orden: number): RoadmapMeta {
  const j = jornadaDePieza.get(p.codigo)
  return {
    codigo: p.codigo,
    titulo: p.titulo,
    descripcion: j?.titulo ?? p.titulo,
    tipo: tipoDeMeta(j),
    orden,
    dia_asignado: p.dia,
    tiempo_estimado: `${p.minutos} min`,
    es_estrella: Boolean(j?.cinturon),
    usa_ia: Boolean(j?.agente),
    adn_field: j?.adn_escribe[0],
    video_youtube_id: undefined,
    herramienta_id: j?.acceso ?? undefined,
    evidencia_requerida: j?.evidencias[0]
      ? { descripcion: j.evidencias[0].valida, tipo: j.evidencias[0].tipo, valida: j.evidencias[0].valida }
      : undefined,
    checklist: j?.pasos ?? [],
    coach_instruccion: j?.nota ?? undefined,
    icon: 'Circle',
    set: p.set,
    estado: p.estado,
    sistema: p.sistema,
  }
}

/** Pilares derivados del prefijo del código: P4.2 y P4.3 caen en el pilar P4. */
function derivarPilares(): RoadmapPilar[] {
  const porPilar = new Map<string, Pieza[]>()
  for (const p of roadmap.piezas) {
    const id = p.codigo.split('.')[0]
    const lista = porPilar.get(id)
    if (lista) lista.push(p)
    else porPilar.set(id, [p])
  }

  const pilares: RoadmapPilar[] = []
  for (const [id, piezas] of porPilar) {
    const ordenadas = [...piezas].sort((a, b) => a.dia - b.dia || a.codigo.localeCompare(b.codigo))
    const metas = ordenadas.map(metaDePieza)
    const primera = ordenadas[0]
    const sistema = roadmap.sistemas.find((s) => s.n === primera.sistema)
    const cinturonDelPilar = ordenadas
      .map((p) => jornadaDePieza.get(p.codigo)?.cinturon)
      .find((c): c is CinturonId => Boolean(c))

    pilares.push({
      id: id as PilarId,
      numero: Number(id.replace(/\D/g, '')) || 0,
      numero_orden: Number(id.replace(/\D/g, '')) || 0,
      titulo: jornadaDePieza.get(primera.codigo)?.titulo ?? primera.titulo,
      subtitulo: sistema?.nombre ?? '',
      fase: faseDePieza(primera),
      icon: 'Circle',
      metas,
      desbloqueo: undefined,
      es_hito: Boolean(cinturonDelPilar),
      hito_tipo: cinturonDelPilar ? 'cinturon' : undefined,
      hito_mensaje: cinturonDelPilar
        ? roadmap.cinturones.find((c) => c.id === cinturonDelPilar)?.forma
        : undefined,
      mentor_pregunta: undefined,
      estrellas_requeridas: metas.filter((m) => m.es_estrella).length,
    })
  }

  return pilares.sort((a, b) => a.numero - b.numero)
}

export const SEED_ROADMAP_V2: RoadmapPilar[] = derivarPilares()
export const SEED_ROADMAP_V3: RoadmapPilar[] = SEED_ROADMAP_V2
export const TOTAL_METAS: number = SEED_ROADMAP_V2.reduce((a, p) => a + p.metas.length, 0)

export const FASES_ROADMAP: FaseRoadmap[] = [
  ...roadmap.sistemas.map((s) => ({
    fase: s.n as number,
    titulo: s.nombre,
    subtitulo: `Sistema ${s.n}`,
    dias: `Días ${s.dias}`,
    metodo_letra: null,
  })),
  ...(HAY_PIEZAS_SUELTAS
    ? [{
        fase: FASE_CIERRE,
        titulo: 'El cierre',
        subtitulo: 'Lo que queda instalado',
        dias: (() => {
          const dias = roadmap.piezas.filter((p) => !SISTEMAS_VALIDOS.has(p.sistema)).map((p) => p.dia)
          return `Días ${Math.min(...dias)}-${Math.max(...dias)}`
        })(),
        metodo_letra: null,
      }]
    : []),
]

export const CINTURONES: Cinturon[] = roadmap.cinturones

/** El cinturón que corresponde a un pilar, por su id o por su número. */
export function calcularCinturon(pilar: string | number): Cinturon {
  const id = typeof pilar === 'number' ? `P${pilar}` : pilar
  const objetivo = SEED_ROADMAP_V2.find((p) => p.id === id)
  const cod = objetivo?.metas
    .map((m) => jornadaDePieza.get(m.codigo)?.cinturon)
    .find((c): c is CinturonId => Boolean(c))
  return (cod && roadmap.cinturones.find((c) => c.id === cod)) || roadmap.cinturones[0]
}

/** Nivel 1-5 según hasta qué pilar llegó. Se deriva del reparto de sistemas. */
export function calcularNivel(pilarMasAltoCompletado: number): 1 | 2 | 3 | 4 | 5 {
  const pilar = SEED_ROADMAP_V2.find((p) => p.numero === pilarMasAltoCompletado)
  const fase = pilar?.fase ?? 1
  return Math.min(5, Math.max(1, fase)) as 1 | 2 | 3 | 4 | 5
}
