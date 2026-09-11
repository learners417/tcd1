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

export const roadmap = seed as unknown as Roadmap

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

/** Total de trabajo del cliente, en minutos. Verificado: 4265 ≈ 71 horas. */
export const cargaTotal = (): number =>
  roadmap.jornadas.reduce((s, j) => s + j.minutos, 0)
