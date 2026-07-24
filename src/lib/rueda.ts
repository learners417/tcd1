/**
 * rueda.ts — S5 · La Rueda de la Vida.
 * El registro de la transformación completa: de profesional independiente a
 * director de clínica — en las 8 dimensiones de una vida entera. El x3 de
 * ingresos es el medio; esto mide el fin.
 */

export const DIMENSIONES_RUEDA = [
  { id: 'cuerpo', emoji: '💪', label: 'Cuerpo' },
  { id: 'mente', emoji: '🧠', label: 'Mente' },
  { id: 'espiritu', emoji: '🕊️', label: 'Espíritu' },
  { id: 'profesion', emoji: '🩺', label: 'Profesión' },
  { id: 'dinero', emoji: '🌱', label: 'Dinero' },
  { id: 'familia', emoji: '❤️', label: 'Familia y pareja' },
  { id: 'amigos', emoji: '🤝', label: 'Amigos y tribu' },
  { id: 'naturaleza', emoji: '🌎', label: 'Naturaleza y sociedad' },
] as const;

export type DimensionId = (typeof DIMENSIONES_RUEDA)[number]['id'];
export type ValoresRueda = Partial<Record<DimensionId, number>>;

interface RuedaStore {
  historial: { fecha: string; valores: ValoresRueda }[];
  paraQue?: string;
}

const KEY = 'tcd_rueda_v1';

function leer(): RuedaStore {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return { historial: Array.isArray(r?.historial) ? r.historial : [], paraQue: r?.paraQue };
  } catch { return { historial: [] }; }
}
function escribir(s: RuedaStore) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export function ultimaMedicion(): { fecha: string; valores: ValoresRueda } | null {
  const h = leer().historial;
  return h.length ? h[h.length - 1] : null;
}

export function guardarMedicion(valores: ValoresRueda): void {
  const s = leer();
  const hoy = new Date().toISOString().split('T')[0];
  s.historial = s.historial.filter((m) => m.fecha !== hoy);
  s.historial.push({ fecha: hoy, valores });
  if (s.historial.length > 60) s.historial = s.historial.slice(-60);
  escribir(s);
}

export function getParaQue(): string { return leer().paraQue ?? ''; }
export function setParaQue(t: string): void { const s = leer(); s.paraQue = t; escribir(s); }

/** Los momentos del sábado (descanso activo) — los guarda HOY, los muestra la Rueda. */
export function momentosDescanso(): { fecha: string; texto: string }[] {
  try {
    const all = JSON.parse(localStorage.getItem('tcd_descanso_v1') ?? '{}') as Record<string, string>;
    return Object.entries(all).map(([fecha, texto]) => ({ fecha, texto })).sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch { return []; }
}

/** Resumen para el Mentor: la Rueda le habla con cariño, no con planillas. */
export function resumenRuedaParaMentor(): string {
  const m = ultimaMedicion();
  const pq = getParaQue();
  if (!m && !pq) return '';
  const partes: string[] = ['\n=== LA RUEDA DE LA VIDA DEL FUNDADOR (léela con cariño; si una dimensión está baja hace tiempo, nómbrala sin invadir) ==='];
  if (m) {
    const vals = DIMENSIONES_RUEDA
      .filter((d) => typeof m.valores[d.id] === 'number')
      .map((d) => `${d.label}: ${m.valores[d.id]}/10`);
    if (vals.length) partes.push(`Última medición (${m.fecha}): ${vals.join(' · ')}`);
    const bajas = DIMENSIONES_RUEDA.filter((d) => (m.valores[d.id] ?? 10) <= 4).map((d) => d.label);
    if (bajas.length) partes.push(`Dimensiones que piden atención: ${bajas.join(', ')}`);
  }
  if (pq) partes.push(`Su PARA QUÉ (lo que va a crear con el tiempo, dinero y energía que recupere): "${pq}"`);
  return partes.join('\n');
}
