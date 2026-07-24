/**
 * origen.ts — S6 · La siembra del ikigai.
 * Tres preguntas que contienen todo: la historia, la herida sanada y el
 * paciente inolvidable. De ahí nacen los dones, el avatar (casi siempre su
 * yo del pasado) y el propósito. La oferta es la última consecuencia.
 */

export interface Origen { porque?: string; herida?: string; paciente?: string; }
const KEY = 'tcd_origen_v1';

export function getOrigen(): Origen {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Origen; } catch { return {}; }
}
export function setOrigen(o: Origen): void {
  try { localStorage.setItem(KEY, JSON.stringify({ ...getOrigen(), ...o })); } catch { /* noop */ }
}

/** El origen le habla al Mentor: el porqué detrás de todo lo que hace el fundador. */
export function resumenOrigenParaMentor(): string {
  const o = getOrigen();
  if (!o.porque && !o.herida && !o.paciente) return '';
  const p: string[] = ['\n=== SU ORIGEN (el ikigai del fundador — su avatar suele ser su yo del pasado; sus dones nacieron de su herida) ==='];
  if (o.porque) p.push(`Por qué eligió esta profesión: "${o.porque}"`);
  if (o.herida) p.push(`La herida propia que sanó: "${o.herida}"`);
  if (o.paciente) p.push(`El paciente que no olvida: "${o.paciente}"`);
  return p.join('\n');
}
