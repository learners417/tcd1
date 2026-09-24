// diseno/tokens.ts — los mismos valores que tokens.css, para JS.
// Si cambia uno, cambia en los dos. tokens.css manda.

export const color = {
  bg: '#FAF5EA', card: '#FFFDF7', card2: '#F5EFE1',
  line: '#EBE1CF', line2: '#DFD3BC',
  ink: '#2A2118', ink2: '#6E6252', ink3: '#9A8C78',
  oro: '#B0822E', oroD: '#8E6824', oroSoft: '#F3EAD6',
  tilde: '#4A7C59', tacha: '#A33A2A', ventana: '#7A6FA3',
} as const

export const cinturonColor = {
  blanco: '#FFFFFF', amarillo: '#E8C24A', verde: '#4E8C57',
  azul: '#3A6EA5', rojo: '#A6392E', negro: '#1A1815',
} as const

export const fuente = {
  display: "'Fraunces', Georgia, serif",
  cuerpo: "'Sora', system-ui, -apple-system, sans-serif",
} as const

/** Piso de 15px. La única excepción es la etiqueta del tab. */
export const texto = {
  titulo: 33, seccion: 26, cuerpo: 17.5,
  boton: 18, chip: 15, kicker: 14, tab: 14,
} as const

export const radio = { r: 20, r2: 26, r3: 99 } as const

export const movimiento = {
  paso: 120, tarjeta: 180, cinturon: 400, llegada: 1200,
} as const

/** Objetivo táctil mínimo. */
export const TACTIL_MIN = 44
