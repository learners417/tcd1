/**
 * perlasMaestro.ts — Las Perlas del Maestro (T10 · Plan Maestro).
 * Audios sorpresa de Javo (VOZ MAESTRO) que aparecen en los momentos-quiebre.
 * Los SLOTS están listos; `audioUrl` queda vacío hasta que Javo grabe las
 * 15-20 perlas en una tarde y suba los MP3. Mismo patrón de slots que
 * teasers.ts (los micro-videos). Con audioUrl vacío, la perla se muestra
 * como "en camino" — nunca rompe.
 */
export interface Perla {
  titulo: string;
  texto: string; // el pie de texto (y guía de lo que dirá el audio)
  audioUrl?: string; // slot: pegá acá la URL del MP3 cuando lo tengas
}

/** Perla por código de meta-hito. Llená `audioUrl` cuando grabes cada una. */
export const PERLAS: Record<string, Perla> = {
  'P0.2': {
    titulo: 'Antes de empezar',
    texto: 'La Foto de Partida honesta —números sin maquillaje— es el acto más valiente del camino. Sin ella, no hay antes ni después.',
    audioUrl: '',
  },
  'P1.3': {
    titulo: 'Después de la quema',
    texto: 'Lo que se quema no vuelve, y ese es exactamente el punto. Hoy soltaste peso que cargabas hace años.',
    audioUrl: '',
  },
  'P1.5': {
    titulo: 'Tu precio en voz alta',
    texto: 'La primera vez que decís tu número sin pedir perdón, algo cambia para siempre. Ya no volvés atrás.',
    audioUrl: '',
  },
  'P4.4': {
    titulo: 'El día que encendés',
    texto: 'Hoy tu clínica existe para el mundo. Respirá. Empezó. Este día lo vas a recordar.',
    audioUrl: '',
  },
  'P5.4': {
    titulo: 'Tu primera llamada',
    texto: 'Llegás entrenado. No vendés: diagnosticás. Todo lo que construiste fue para este momento.',
    audioUrl: '',
  },
  'P6.3': {
    titulo: 'El primer $1.000',
    texto: 'Guardá este comprobante. Es la prueba física de que el sistema funciona. El fruto maduro.',
    audioUrl: '',
  },
  'P7.3': {
    titulo: 'La última recta',
    texto: 'Casi cinturón negro. Lo que empezó con miedo termina con oficio. Los diez te esperan.',
    audioUrl: '',
  },
};

export function perlaDe(codigo: string): Perla | undefined {
  return PERLAS[codigo];
}

/**
 * La perla más relevante para la etapa: la del último hito alcanzado que
 * tenga perla. Devuelve null si todavía no alcanzó ninguno con perla.
 */
export function perlaParaEtapa(
  hitosAlcanzados: string[],
): { codigo: string; perla: Perla } | null {
  for (let i = hitosAlcanzados.length - 1; i >= 0; i--) {
    const codigo = hitosAlcanzados[i];
    const perla = PERLAS[codigo];
    if (perla) return { codigo, perla };
  }
  return null;
}
