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
/*
 * Los códigos internos. Se sumó `L-01`: el catálogo de la Biblioteca lo
 * usaba de respaldo cuando un video todavía no tenía título, y el cliente
 * leía «Paso a paso L-01» en la pantalla donde elige qué mirar.
 */
export const CODIGO = /\b(P\d{1,2}[A-Z]?(\.[\dA-Za-z]+)+|\dgup|\ddan|L-\d{2,})\b/;

type Hallazgo = { donde: string; tipo: string; texto: string };
const hallazgos: Hallazgo[] = [];
let revisados = 0;

function revisar(donde: string, texto: unknown) {
  if (typeof texto !== 'string' || texto.trim().length < 3) return;
  revisados++;
  const t = texto.trim();
  if (SIMBOLO.test(t)) hallazgos.push({ donde, tipo: 'símbolo', texto: t });
  if (CODIGO.test(t)) hallazgos.push({ donde, tipo: 'código', texto: t });
  /*
   * El «Pixel» de Meta es el nombre propio del producto: el cliente tiene
   * que buscarlo con esa palabra dentro de Meta, y llamarlo de otra forma lo
   * dejaría sin saber qué está instalando. Es la única excepción, y va con
   * su razón al lado en vez de salir de la lista de jerga, para que quede
   * dicho por qué es la única palabra en inglés que se queda.
   */
  const j = t.match(JERGA);
  const esNombreDeProducto = j && /^(pixel|píxel)$/i.test(j[0]);
  if (j && !esNombreDeProducto) hallazgos.push({ donde, tipo: `jerga:${j[0].toLowerCase()}`, texto: t });
  /*
   * «Una idea por frase, máximo veintidós palabras». Pero la frase no termina
   * solo en punto: un guion largo, un punto medio o dos puntos cortan igual
   * de fuerte, y esta app los usa a propósito —«Tres reglas y ninguna se
   * negocia: UNA campaña (la fuerza no se divide) · el presupuesto de tu
   * Plan · público amplio»— y se lee de corrido. Partiendo solo por punto,
   * doce párrafos perfectamente legibles entraban como faltas.
   */
  for (const frase of t.split(/(?<=[.!?])\s+|\s+[—·→]\s+|:\s+/)) {
    if (frase.split(/\s+/).length > 22) { hallazgos.push({ donde, tipo: 'larga', texto: frase }); break; }
  }
}

/*
 * El cuerpo corre solo cuando se ejecuta este archivo, no cuando otra prueba
 * le pide las reglas. `prueba-lecciones-escritas.ts` importa JERGA y CODIGO
 * para medir las lecciones con esta misma vara: sin esta guarda, cada vez que
 * esa prueba corre imprime también el informe entero del lente.
 */
const ejecutadoDirecto = process.argv[1]?.includes('lente-lenguaje');
if (ejecutadoDirecto) {

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
  /*
   * Veintisiete de los cincuenta y cinco hallazgos eran el CÓDIGO de la
   * sesión marcándose a sí mismo —«[código] Sesión P0.3: P0.3»—, porque el
   * recorrido tomaba todo string del objeto, incluido el campo que guarda la
   * clave. El cliente nunca ve «P0.3»: lo ve la app para saber de qué
   * sesión habla. Un lente con la mitad de ruido es un lente que se ignora.
   */
  if (/prompt|ia|sistema|system|id$|campo|key|tipo|icono|emoji/i.test(clave)) return;
  if (/^(codigo|code|slug|clave|ref|meta_?codigo|pilar|orden)$/i.test(clave)) return;
  // `requiere_datos_de` y `adn_field` son referencias entre herramientas.
  if (/^(requiere_datos_de|adn_field|depende_de|origen)$/i.test(clave)) return;
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

/*
 * Desde que el lente está calibrado y en cero, sale con error cuando
 * encuentra algo: antes solo informaba, así que nadie lo corría en la
 * batería y su cuenta no la sostenía nada. Con 34 de 55 hallazgos falsos no
 * se podía pedir esto; ahora sí.
 */
if (hallazgos.length > 0) {
  console.log(`\n✗ ${hallazgos.length} · con --detalle se ven uno por uno\n`);
  process.exit(1);
}
console.log(`\n✓ los ${revisados} textos del Camino, las sesiones y las herramientas hablan claro\n`);

}
