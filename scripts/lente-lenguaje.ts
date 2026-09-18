/**
 * lente-lenguaje.ts — ¿le habla la app a un profesional de la salud o a un técnico?
 *
 * Recorre TODO el texto que lee el cliente (las 91 jornadas del Camino, sus
 * pasos y evidencias, las sesiones guiadas y las herramientas) y marca:
 *   símbolo   <, >, ±, ≥, =, "x" como variable, % sueltos
 *   código    P1.0, P2.3b, 9gup… (identificadores internos)
 *   jerga     lead, KPI, CTR, CPM, funnel, copy, hook, DM, setup, brief…
 *   larga     frases de más de 22 palabras (regla de una idea por frase)
 *
 * Uso: npx tsx scripts/lente-lenguaje.ts [--detalle]
 */
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { SESIONES_GUIADAS, sesionGuiadaDe } from '../src/lib/sesionesGuiadas';
import { HERRAMIENTAS_V3, getHerramienta } from '../src/lib/herramientas';
import { setFamiliaActual } from '../src/lib/vocabulario';

setFamiliaActual('Psicóloga');

export const JERGA = /\b(leads?|kpis?|ctr|cpm|cpl|cpa|roas|funnel|embudo|copys?|copies|hooks?|dm|dms|setup|brief|checkout|landing|pixel|píxel|retargeting|lookalike|engagement|reach|insights?|call to action|cta|onboarding|feedback|dashboard|pipeline|workflow|template|ads|adset|conversion rate|b2b|b2c|high ticket|low ticket|upsell|downsell|match|scroll|swipe|reel|reels|stories|utm|api|crm|ghl|webhook|backend|input|output|prompt|tag|tags)\b/i;
export const SIMBOLO = /(\s[<>≥≤±=]\s|[<>≥≤±]\s?\d|\bx\b\s?[<>=]|\d\s?[<>]\s?x\b)/;
export const CODIGO = /\b(P\d{1,2}[A-Z]?(\.[\dA-Za-z]+)+|\dgup|\ddan)\b/;

type Hallazgo = { donde: string; tipo: string; texto: string };
const hallazgos: Hallazgo[] = [];
let revisados = 0;

function revisar(donde: string, texto: unknown) {
  if (typeof texto !== 'string' || texto.trim().length < 3) return;
  revisados++;
  const t = texto.trim();
  if (SIMBOLO.test(t)) hallazgos.push({ donde, tipo: 'símbolo', texto: t });
  if (CODIGO.test(t)) hallazgos.push({ donde, tipo: 'código', texto: t });
  const j = t.match(JERGA); if (j) hallazgos.push({ donde, tipo: `jerga:${j[0].toLowerCase()}`, texto: t });
  for (const frase of t.split(/(?<=[.!?])\s+/)) {
    if (frase.split(/\s+/).length > 22) { hallazgos.push({ donde, tipo: 'larga', texto: frase }); break; }
  }
}

// 1. El Camino: lo que el cliente lee de cada jornada
for (const p of SEED_ROADMAP_V2) for (const m of p.metas) {
  const d = `Camino día ${m.dia_asignado} (${m.codigo})`;
  revisar(d, m.titulo);
  revisar(d, m.descripcion);
  for (const s of (m as { pasos?: unknown[] }).pasos ?? []) revisar(d, typeof s === 'string' ? s : (s as { texto?: string })?.texto);
  const ev = m.evidencia_requerida as { nombre?: string; descripcion?: string } | undefined;
  revisar(`${d} · evidencia`, ev?.nombre);
  revisar(`${d} · evidencia`, ev?.descripcion);
}
// 2. Sesiones guiadas y herramientas: todo string que contienen, menos los prompts
function recorrer(donde: string, v: unknown, clave = '') {
  if (/prompt|ia|sistema|system|id$|campo|key|tipo|icono|emoji/i.test(clave)) return;
  if (typeof v === 'string') return revisar(donde, v);
  if (Array.isArray(v)) return v.forEach((x) => recorrer(donde, x, clave));
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) recorrer(donde, x, k);
}
for (const c of Object.keys(SESIONES_GUIADAS)) recorrer(`Sesión ${c}`, sesionGuiadaDe(c));
for (const h of HERRAMIENTAS_V3) recorrer(`Herramienta ${h.id}`, getHerramienta(h.id));

const porTipo = new Map<string, number>();
for (const h of hallazgos) { const k = h.tipo.split(':')[0]; porTipo.set(k, (porTipo.get(k) ?? 0) + 1); }
const jergas = new Map<string, number>();
for (const h of hallazgos) if (h.tipo.startsWith('jerga:')) jergas.set(h.tipo.slice(6), (jergas.get(h.tipo.slice(6)) ?? 0) + 1);
console.log(`textos revisados: ${revisados} · hallazgos: ${hallazgos.length}`);
console.log([...porTipo].map(([k, v]) => `${k} ${v}`).join(' · '));
console.log('jerga más usada:', [...jergas].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${k} ${v}`).join(', '));
const zonas = new Map<string, number>();
for (const h of hallazgos) { const z = h.donde.split(' ')[0]; zonas.set(z, (zonas.get(z) ?? 0) + 1); }
console.log('por zona:', [...zonas].map(([k, v]) => `${k} ${v}`).join(' · '));
if (process.argv.includes('--detalle')) for (const h of hallazgos) console.log(`[${h.tipo}] ${h.donde}: ${h.texto.slice(0, 140)}`);
