/**
 * manuales.ts — Dónde se amplía cada sesión.
 *
 * Los cuatro manuales ya están escritos y publicados, y hasta hoy ninguna
 * sesión los enlazaba. Esta es la capa más barata de todas: son enlaces, no
 * contenido nuevo. Y es la que hace que el cliente profundice solo en vez
 * de escribirte.
 */

export interface Manual {
  id: string;
  titulo: string;
  url: string;
  /** Qué cubre, en una línea. */
  cubre: string;
}

export const MANUALES: Record<string, Manual> = {
  liderazgo: {
    id: 'liderazgo',
    titulo: 'El Liderazgo',
    url: 'https://tuclinica.digital/manual-liderazgo-page',
    cubre: 'Tu relación con el dinero, tus ritos y cómo te lideras.',
  },
  clinica: {
    id: 'clinica',
    titulo: 'La Clínica',
    url: 'https://tuclinica.digital/manual-tuprograma',
    cubre: 'Tu método, tu oferta, tu garantía, tu escalera y tu app.',
  },
  camino: {
    id: 'camino',
    titulo: 'El Camino',
    url: 'https://tuclinica.digital/manual-ads-page',
    cubre: 'Tu página, tus anuncios, tu campaña y tus números.',
  },
  llamada: {
    id: 'llamada',
    titulo: 'La Llamada',
    url: 'https://tuclinica.digital/manual-ventas',
    cubre: 'Tu script, tus objeciones y cómo se pide la decisión.',
  },
};

/** Qué manual amplía cada pilar del Camino. */
const POR_PILAR: Record<string, string> = {
  P0: 'liderazgo',
  P1: 'liderazgo',
  P2: 'clinica',
  P3: 'clinica',
  P4: 'camino',
  P5: 'llamada',
  P6: 'clinica',
  P7: 'camino',
};

/** Excepciones: sesiones que se amplían en otro manual que el de su pilar. */
const POR_SESION: Record<string, string> = {
  'P6.4': 'liderazgo',   // el ritmo de la semana es liderazgo, no entrega
  'P4.2b': 'camino',
  'P3.7': 'clinica',
  'P5.6': 'llamada',
  'P7.10': 'liderazgo',  // el tablero de los cinco es revisión, no marketing
};

export function manualDe(codigoSesion: string): Manual | null {
  const exacto = POR_SESION[codigoSesion];
  if (exacto) return MANUALES[exacto] ?? null;
  const pilar = codigoSesion.split('.')[0];
  const id = POR_PILAR[pilar];
  return id ? MANUALES[id] ?? null : null;
}
