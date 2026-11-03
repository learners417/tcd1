/**
 * rueda.ts — La Rueda de la Vida, medida en las siete libertades.
 *
 * ═══ POR QUÉ CAMBIÓ ═══
 *
 * La rueda medía ocho dimensiones que no son de nadie: cuerpo, mente,
 * espíritu, profesión, dinero, familia, amigos, naturaleza. Es la rueda que
 * usa cualquiera, y por eso no decía nada sobre esta casa.
 *
 * Las siete libertades sí: son la cosmovisión de Javo, la que está detrás de
 * sus libros y de sus proyectos. Y como la app tiene que coincidir con lo que
 * los libros dicen, la rueda se mide con ellas.
 *
 * Siguen siendo ocho rayos. Las siete libertades, y el terreno donde se
 * apoyan: el lugar, las personas alrededor, el mundo que te toca.
 *
 * Los cinturones miden tu oficio —lo que avanzas en el Camino—. Esto mide tu
 * vida. Son dos ejes, no dos relatos: por eso conviven.
 *
 * ═══ LO QUE SE MIDIÓ ANTES ═══
 *
 * Lo guardado con las dimensiones viejas vive en `tcd_rueda_v1` y no se
 * borra, pero tampoco se lee: «familia» no es «emocional», y mostrar una
 * medición vieja bajo un nombre nuevo sería decirle al cliente que midió algo
 * que no midió. Quien ya se había medido vuelve a medirse, una vez.
 */

export const DIMENSIONES_RUEDA = [
  { id: 'fisica',      label: 'Libertad física',      pregunta: 'Tu cuerpo, tu salud, tu descanso',          color: 'var(--libertad-fisica, #53634D)' },
  { id: 'energetica',  label: 'Libertad energética',  pregunta: 'Tus ganas: con cuánta energía te levantas', color: 'var(--libertad-energetica, #D1A762)' },
  { id: 'mental',      label: 'Libertad mental',      pregunta: 'Tu cabeza: cuánto la ocupa el trabajo',     color: 'var(--libertad-mental, #3A3A33)' },
  { id: 'emocional',   label: 'Libertad emocional',   pregunta: 'Tus vínculos: tu pareja, tu familia, los tuyos', color: 'var(--libertad-emocional, #6A9591)' },
  { id: 'financiera',  label: 'Libertad financiera',  pregunta: 'Tu dinero: cuánto te alcanza y cuánto te sobra', color: 'var(--libertad-financiera, #9A6149)' },
  { id: 'tiempo',      label: 'Libertad de tiempo',   pregunta: 'Tus horas: cuántas son tuyas de verdad',    color: 'var(--libertad-tiempo, #425668)' },
  { id: 'espiritual',  label: 'Libertad espiritual',  pregunta: 'Tu sentido: para qué haces lo que haces',   color: 'var(--libertad-espiritual, #804A43)' },
  { id: 'terreno',     label: 'Tu terreno',           pregunta: 'Dónde estás parado: tu lugar y los tuyos',  color: 'var(--terreno, #7A6A52)' },
] as const;

export type DimensionId = (typeof DIMENSIONES_RUEDA)[number]['id'];
export type ValoresRueda = Partial<Record<DimensionId, number>>;

interface RuedaStore {
  historial: { fecha: string; valores: ValoresRueda }[];
  paraQue?: string;
}

/*
 * v2 porque los rayos cambiaron de nombre. El `paraQue` se trae del v1 una
 * sola vez: eso no cambió de significado y no hay razón para que lo escriba
 * otra vez quien ya lo escribió.
 */
const KEY = 'tcd_rueda_v2';
const KEY_VIEJA = 'tcd_rueda_v1';

function leer(): RuedaStore {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    const historial = Array.isArray(r?.historial) ? r.historial : [];
    // El Para Qué sobrevive al cambio de rayos: significa lo mismo que antes.
    let paraQue = r?.paraQue;
    if (!paraQue) {
      try { paraQue = JSON.parse(localStorage.getItem(KEY_VIEJA) ?? '{}')?.paraQue; } catch { /* noop */ }
    }
    return { historial, paraQue };
  } catch { return { historial: [] }; }
}
function escribir(s: RuedaStore) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export function ultimaMedicion(): { fecha: string; valores: ValoresRueda } | null {
  const h = leer().historial;
  return h.length ? h[h.length - 1] : null;
}

/** La primera, que es la foto de partida: es contra esta que se compara. */
export function primeraMedicion(): { fecha: string; valores: ValoresRueda } | null {
  const h = leer().historial;
  return h.length ? h[0] : null;
}

/** Cuántas veces se midió. Con una sola no hay comparación que mostrar. */
export function cuantasMediciones(): number {
  return leer().historial.length;
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
  const partes: string[] = ['\n=== LAS SIETE LIBERTADES DEL FUNDADOR (léelas con cariño; si una está baja hace tiempo, nómbrala sin invadir) ==='];
  if (m) {
    const vals = DIMENSIONES_RUEDA
      .filter((d) => typeof m.valores[d.id] === 'number')
      .map((d) => `${d.label}: ${m.valores[d.id]}/10`);
    if (vals.length) partes.push(`Última medición (${m.fecha}): ${vals.join(' · ')}`);
    const bajas = DIMENSIONES_RUEDA.filter((d) => (m.valores[d.id] ?? 10) <= 4).map((d) => d.label);
    if (bajas.length) partes.push(`Las que piden atención: ${bajas.join(', ')}`);
  }
  if (pq) partes.push(`Su PARA QUÉ (lo que va a crear con el tiempo, dinero y energía que recupere): "${pq}"`);
  return partes.join('\n');
}
