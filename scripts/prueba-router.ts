/**
 * Pruebas del enrutador de modelo por tarea.
 *
 * Lo que verifica y no verifica el compilador: que cada trabajo caiga en el
 * modelo que le corresponde, que el costo se calcule bien con los precios
 * publicados, y que una tarea desconocida no rompa nada.
 *
 * Correr con: npx tsx scripts/prueba-router.ts
 */
import {
  RUTAS, rutaDe, costoDe, normalizarUso, PRECIOS, type Tarea,
} from '../api/_lib/router';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

// ── 1 · Cada tarea cae donde debe ──────────────────────────────────────────
console.log('══ el modelo correcto para cada trabajo ══');

const esperado: Array<[Tarea, string, string]> = [
  ['guion', 'claude', 'claude-sonnet-4-6'],
  ['chat', 'deepseek', ''],
  ['estructura', 'claude', 'claude-haiku-4-5'],
  ['auditoria', 'claude', 'claude-sonnet-4-6'],
  ['general', 'deepseek', ''],
];

for (const [tarea, proveedor, modelo] of esperado) {
  const { ruta } = rutaDe(tarea);
  const primero = ruta.cadena[0];
  const ok = primero.proveedor === proveedor && (modelo === '' || primero.modelo === modelo);
  linea(ok, `${tarea.padEnd(11)} → ${primero.proveedor}${primero.modelo ? ` · ${primero.modelo}` : ' (default)'}`);
}

// ── 2 · Reglas que no se pueden romper ─────────────────────────────────────
console.log('\n══ reglas del enrutador ══');

linea(rutaDe(undefined).tarea === 'general',
  'una llamada sin tarea cae en general (no cambia el comportamiento viejo)');
linea(rutaDe('inventada').tarea === 'general',
  'una tarea desconocida cae en general y no rompe');
linea(rutaDe('general').ruta.cadena[0].proveedor === 'deepseek'
  && rutaDe('general').ruta.cadena[1].proveedor === 'claude',
  'general conserva la cadena histórica: DeepSeek → Claude');

linea(RUTAS.estructura.temperature === 0,
  'estructurar va con temperatura 0 (obedece el esquema, no inventa)');
linea((RUTAS.auditoria.temperature ?? 1) <= 0.3,
  'auditar va con temperatura baja (el criterio no se mueve entre piezas)');
linea((RUTAS.guion.temperature ?? 0) >= 0.7,
  'escribir va con temperatura alta (tiene que tener voz)');

linea(Object.values(RUTAS).every((r) => r.cadena.length >= 2 || r.cadena.length === 1),
  'toda tarea tiene al menos un paso');
linea(Object.entries(RUTAS).every(([k, r]) => k === 'general' || r.cadena.length >= 2),
  'toda tarea real tiene respaldo si su modelo preferido falla');
linea(Object.values(RUTAS).every((r) => r.porQue.length > 40),
  'toda ruta explica POR QUÉ ese modelo, para que no se cambie sin motivo');

// ── 3 · El costo se calcula bien ───────────────────────────────────────────
console.log('\n══ cálculo de costo ══');

// Sonnet: 3 USD por millón de entrada, 15 por millón de salida.
const c1 = costoDe('claude-sonnet-4-6', { input_tokens: 1_000_000, output_tokens: 0 });
linea(c1?.usd === 3, `1M tokens de entrada en Sonnet = $${c1?.usd} (esperado $3)`);

const c2 = costoDe('claude-sonnet-4-6', { input_tokens: 0, output_tokens: 1_000_000 });
linea(c2?.usd === 15, `1M tokens de salida en Sonnet = $${c2?.usd} (esperado $15)`);

// Haiku es 5 veces más barato en salida.
const c3 = costoDe('claude-haiku-4-5', { input_tokens: 0, output_tokens: 1_000_000 });
linea(c3?.usd === 5, `1M tokens de salida en Haiku = $${c3?.usd} (esperado $5)`);

// DeepSeek reporta con otros nombres: tiene que normalizarse igual.
const u = normalizarUso({ prompt_tokens: 500, completion_tokens: 200 });
linea(u.entrada === 500 && u.salida === 200,
  'el uso de DeepSeek (prompt/completion) se normaliza igual que el de Claude');

linea(costoDe('modelo-que-no-existe', { input_tokens: 100 }) === null,
  'un modelo sin precio devuelve null, no un número inventado');

linea(PRECIOS['deepseek-v4-pro'].verificado === false,
  'el precio de DeepSeek queda marcado como ESTIMADO, no como cierto');
linea(PRECIOS['claude-sonnet-4-6'].verificado === true,
  'los precios de Claude quedan marcados como verificados');

// ── 4 · Una llamada real, con números de una herramienta ───────────────────
console.log('\n══ lo que cuesta de verdad una herramienta ══');

const generarTresAnuncios = costoDe('claude-sonnet-4-6', {
  input_tokens: 4_000,   // el brief + las 18 fórmulas + las reglas
  output_tokens: 2_500,  // los 3 guiones con sus captions
});
const mismaEnHaiku = costoDe('claude-haiku-4-5', {
  input_tokens: 4_000, output_tokens: 2_500,
});
console.log(`  "Tus 3 anuncios" en Sonnet: $${generarTresAnuncios?.usd}`);
console.log(`  la misma llamada en Haiku:  $${mismaEnHaiku?.usd}`);
linea((generarTresAnuncios?.usd ?? 0) < 0.1,
  'generar los 3 anuncios cuesta centavos — la calidad no es el costo del negocio');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
