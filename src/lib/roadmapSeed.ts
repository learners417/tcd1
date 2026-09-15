// datos/roadmapSeed.ts
// Tipos y export tipado del camino TCD.
// FUENTE ÚNICA: roadmap.seed.json — este archivo no duplica datos, los tipa.
// Para cambiar el camino: editar datos/generar_seed.py y correrlo. Nunca editar
// el JSON a mano.

import seed from './roadmap.seed.json'

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
  /** Derivados al cargar. No están en el JSON y no lo ensucian. */
  orden: number
  metafora: string
  emoji: string
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

/** Emoji por grado. Es presentación, no dato: sale del orden de la planta. */
const EMOJI_GRADO = [
  '\u{1F311}', '\u{1F330}', '\u{1F331}', '\u{1F33F}', '\u{1F33E}', '\u{1F33B}',
  '\u{1F333}', '\u{1F334}', '\u{1F344}', '\u{1F340}', '\u{1F332}',
]

const crudo = seed as unknown as Omit<Roadmap, 'cinturones'> & {
  cinturones: Omit<Cinturon, 'orden' | 'metafora' | 'emoji'>[]
}

export const roadmap: Roadmap = {
  ...crudo,
  cinturones: crudo.cinturones.map((c, i) => ({
    ...c,
    orden: i + 1,
    metafora: c.significado,
    emoji: EMOJI_GRADO[i] ?? EMOJI_GRADO[EMOJI_GRADO.length - 1],
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

// ── vista por pilares ───────────────────────────────────────────────────────
// Los componentes leen el camino agrupado por pilar. Esa estructura no está
// en el JSON: vive en supabase.ts (PILAR_ORDER / NIVEL_UMBRALES_V3), que es la
// que usa la base. Acá se cruzan las dos fuentes sin duplicar ninguna: el
// agrupamiento sale de los códigos de pieza (P4.3 → pilar P4) y todo lo demás
// se deriva de las jornadas. No hay datos nuevos.

import { PILAR_ORDER, NIVEL_UMBRALES_V3, type PilarId } from './supabase'

export interface RoadmapMeta {
  codigo: string
  titulo: string
  descripcion: string
  orden: number
  dia_asignado: number
  tiempo_estimado: string
  /** Vocabulario de pantalla: decide qué componente Task se renderiza. */
  tipo: 'VIDEO' | 'HERRAMIENTA' | 'COACH' | 'TAREA'
  /** El tipo real de la jornada en el seed. */
  tipo_jornada: TipoJornada
  sistema: number | null
  pasos: string[]
  checklist: string[]
  agente: AgenteId | null
  herramienta_id: string | undefined
  usa_ia: boolean
  cinturon: CinturonId | null
  es_estrella: boolean
  adn_field: string | null
  adn_fields: string[]
  evidencia_requerida: Evidencia & { descripcion: string }
  evidencias: Evidencia[]
  coach_instruccion: string
  /** Sin origen en el seed: el video se identifica por su pieza. */
  video_youtube_id: string | null
  /** Sin origen en el seed. Queda vacío hasta que el generador lo produzca. */
  requiere_datos_de: string[]
}

export interface RoadmapPilar {
  numero: number
  numero_orden: number
  id: PilarId
  nombre: string
  titulo: string
  subtitulo: string
  icon: string
  fase: number | null
  metas: RoadmapMeta[]
  es_hito: boolean
  hito_tipo: 'urgent' | 'checkpoint' | null
  hito_mensaje: string
  mentor_pregunta: string
  desbloqueo: string
  estrellas_requeridas: number
}

/** El pilar de una jornada, leído del prefijo de su primera pieza. */
const pilarDeJornada = (j: Jornada): PilarId | null => {
  for (const cod of j.piezas) {
    const m = /^(P\d+[A-C]?)\./.exec(cod)
    if (m && (PILAR_ORDER as string[]).includes(m[1])) return m[1] as PilarId
  }
  return null
}

/**
 * Jornadas agrupadas por tramo de grado. Los once grados tienen día de entrega,
 * y cada jornada cae en el tramo que cierra con el grado siguiente. Es el único
 * agrupamiento que el seed nuevo tiene de verdad: el arrastre por pieza dejaba
 * un pilar con un tercio del camino y cuatro vacíos.
 */
const agruparPorPilar = (): Map<PilarId, Jornada[]> => {
  const mapa = new Map<PilarId, Jornada[]>()
  PILAR_ORDER.forEach(p => mapa.set(p, []))
  const cortes = roadmap.cinturones.map(c => c.dia)
  for (const j of [...roadmap.jornadas].sort((a, b) => a.dia - b.dia)) {
    let tramo = cortes.findIndex(d => j.dia <= d)
    if (tramo === -1) tramo = cortes.length - 1
    mapa.get(PILAR_ORDER[tramo] ?? PILAR_ORDER[PILAR_ORDER.length - 1])!.push(j)
  }
  return mapa
}

const comoMeta = (
  j: Jornada, pilar: PilarId, i: number, usados: Set<string>,
): RoadmapMeta => ({
  // El día es único en todo el camino: garantiza que dos jornadas del mismo
  // pilar nunca compartan clave de progreso.
  codigo: (() => {
    const c = j.piezas.find(x => x.startsWith(pilar + '.'))
    if (c && !usados.has(c)) { usados.add(c); return c }
    return `${pilar}.d${j.dia}`
  })(),
  titulo: j.titulo,
  descripcion: j.nota ?? '',
  orden: i + 1,
  dia_asignado: j.dia,
  tiempo_estimado: `${j.minutos} min`,
  tipo:
    j.agente !== null ? 'HERRAMIENTA'
    : j.piezas.length > 0 ? 'VIDEO'
    : j.tipo === 'sesion' ? 'COACH'
    : 'TAREA',
  tipo_jornada: j.tipo,
  sistema: j.sistema,
  pasos: j.pasos,
  checklist: j.pasos,
  agente: j.agente,
  herramienta_id: j.agente ?? undefined,
  usa_ia: j.agente !== null,
  cinturon: j.cinturon,
  es_estrella: j.cinturon !== null || j.jornada_larga,
  adn_field: j.adn_escribe[0] ?? null,
  adn_fields: j.adn_escribe,
  evidencia_requerida: {
    ...(j.evidencias[0] ?? { tipo: 'texto' as TipoEvidencia, nombre: '', valida: '' }),
    descripcion: j.evidencias[0]?.valida ?? '',
  },
  evidencias: j.evidencias,
  coach_instruccion: j.manual ?? '',
  video_youtube_id: null,
  requiere_datos_de: [],
})

/** El camino agrupado por pilar. Fuente única: el mismo JSON. */
export const SEED_ROADMAP_V3: RoadmapPilar[] = (() => {
  const grupos = agruparPorPilar()
  return PILAR_ORDER.map((id, n) => {
    const js = grupos.get(id)!
    const usados = new Set<string>()
    const metas = js.map((j, i) => comoMeta(j, id, i, usados))
    const conGrado = metas.find(m => m.cinturon !== null)
    const grado = conGrado ? cinturonPorId.get(conGrado.cinturon!) : undefined
    const nombre = js[0]?.titulo ?? id
    return {
      numero: n,
      numero_orden: n,
      id,
      nombre,
      titulo: nombre,
      subtitulo: js.length ? `Días ${js[0].dia}-${js[js.length - 1].dia}` : '',
      icon: '',
      fase: metas.find(m => m.sistema !== null)?.sistema ?? null,
      metas,
      es_hito: conGrado !== undefined,
      hito_tipo: grado ? (grado.en_ventana ? 'urgent' : 'checkpoint') : null,
      hito_mensaje: grado?.forma ?? '',
      mentor_pregunta: '',
      desbloqueo: js.length ? `Día ${js[0].dia}` : '',
      estrellas_requeridas: metas.filter(m => m.es_estrella).length,
    }
  })
})()

/** Alias histórico. Misma estructura, no una copia. */
export const SEED_ROADMAP_V2 = SEED_ROADMAP_V3

export const TOTAL_METAS: number = SEED_ROADMAP_V3.reduce(
  (s, p) => s + p.metas.length, 0,
)

/** Las fases son los cinco sistemas del camino. */
export const FASES_ROADMAP = roadmap.sistemas.map(s => ({
  numero: s.n,
  fase: s.n,
  nombre: s.nombre,
  titulo: s.nombre,
  subtitulo: `Días ${s.dias}`,
  metodo_letra: s.nombre.charAt(0).toUpperCase(),
  dias: s.dias,
  pilares: SEED_ROADMAP_V3
    .filter(p => p.metas.some(m => m.sistema === s.n))
    .map(p => p.id),
}))

/** Los grados, ya con orden, metáfora y emoji. */
export const CINTURONES: Cinturon[] = roadmap.cinturones

export type CinturonConOrden = Cinturon

/** El nivel (1-5) que corresponde a un pilar. Sale de los umbrales de la base. */
export const calcularNivel = (pilar: number | PilarId): 1 | 2 | 3 | 4 | 5 => {
  const id: PilarId = typeof pilar === 'number' ? PILAR_ORDER[pilar] ?? 'P0' : pilar
  for (const n of [5, 4, 3, 2, 1] as const) {
    if (NIVEL_UMBRALES_V3[n].includes(id)) return n
  }
  return 1
}

/** El grado que corresponde a haber cerrado un pilar. */
export const calcularCinturon = (pilar: number | PilarId): CinturonConOrden => {
  const i = typeof pilar === 'number' ? pilar : PILAR_ORDER.indexOf(pilar)
  const idx = Math.max(0, Math.min(CINTURONES.length - 1, i))
  return CINTURONES[idx]
}
