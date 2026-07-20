/**
 * teasers.ts — El cliffhanger del episodio (T2 · Plan Maestro).
 * Cada día termina vendiendo el siguiente. Los hitos tienen teaser propio
 * (escrito en la voz de Javo); el resto usa el genérico con el título real.
 * `teaser_video_id` queda como slot para los micro-videos (fogón, cocina…).
 */
import { SEED_ROADMAP_V2, type RoadmapMeta } from './roadmapSeed';

export interface Teaser {
  titulo: string; // lo que se anuncia
  frase: string; // la línea que engancha
  videoId?: string; // slot micro-video (Javo lo llena cuando grabe)
  esHito: boolean;
}

/** Teasers escritos para las sesiones-hito (voz Javo, cortos, con filo). */
const TEASERS_HITO: Record<string, { frase: string; videoId?: string }> = {
  'P1.3': { frase: 'Mañana: LA QUEMA. Vas a necesitar fuego. En serio. Papel, birome… y todo lo que ya no te sirve.' },
  'P1.5': { frase: 'Mañana pronuncias tu precio en voz alta por primera vez. Tu voz. Tu número. Sin pedir perdón.' },
  'P0.2': { frase: 'Lo primero: tu Foto de Partida. Números reales, sin maquillaje. En 90 días no te vas a reconocer.' },
  'P4.3b': { frase: 'Mañana es TU día de grabación. Tu voz al mundo. Llegas con guion y con práctica — nadie graba a ciegas acá.' },
  'P4.4': { frase: 'Mañana aprietas el botón. Tu clínica se enciende al mundo. Este día lo vas a recordar para siempre.' },
  'P5.4': { frase: 'Se acerca tu primera llamada real. Todo lo que construiste fue para este momento. Llegas entrenado.' },
  'P6.3': { frase: 'Lo que viene: tu primer pago de $1.000. El fruto maduro. Prepara el comprobante — y el marco.' },
  'P7.3': { frase: 'La última recta. Los diez te esperan. Director… casi cinturón negro.' },
};

/** Encuentra la próxima meta incompleta DESPUÉS de la meta dada. */
export function proximaMeta(
  completadas: Set<string>,
  metaActualKey: string
): { pilar: number; meta: RoadmapMeta } | null {
  let pasada = false;
  for (const pil of SEED_ROADMAP_V2) {
    for (const m of pil.metas ?? []) {
      const key = `${pil.numero}-${m.codigo}`;
      if (key === metaActualKey) { pasada = true; continue; }
      if (pasada && !completadas.has(key)) return { pilar: pil.numero, meta: m };
    }
  }
  return null;
}

/** El teaser para cerrar el episodio actual: anuncia lo que viene. */
export function teaserPara(completadas: Set<string>, metaActualKey: string): Teaser | null {
  const prox = proximaMeta(completadas, metaActualKey);
  if (!prox) return null;
  const hito = TEASERS_HITO[prox.meta.codigo];
  const tituloLimpio = prox.meta.titulo.replace('⭐', '').trim();
  if (hito) {
    return { titulo: tituloLimpio, frase: hito.frase, videoId: hito.videoId, esHito: true };
  }
  const dia = prox.meta.dia_asignado;
  return {
    titulo: tituloLimpio,
    frase: `Próximo episodio${dia ? ` · día ${dia}` : ''}: ${tituloLimpio}. ${prox.meta.tiempo_estimado ?? '30-45 min'}. El camino sigue.`,
    esHito: false,
  };
}
