/**
 * LA BIENVENIDA NO SE PISA A SÍ MISMA
 *
 * ═══ QUÉ PASÓ, Y POR QUÉ NO LO VIO NADIE ═══
 *
 * `diagnostico` es una columna jsonb, y los dos pasos de la bienvenida la
 * escribían por separado, cada uno con su propia lista de campos:
 *
 *     guardarSituacion   → { freno … trabajo_espiritual, situacion }
 *     guardarDiagnostico → { freno … trabajo_espiritual, llegan, entrega, publica }
 *
 * El orden de los pasos es `situacion` y DESPUÉS `diagnostico`. Un UPDATE de
 * jsonb reemplaza el valor entero: no mezcla. Así que el segundo guardado
 * borraba `situacion` —la escalera del cliente, su oferta, lo que ya vende—
 * un minuto después de que lo escribiera, en la primera pantalla de alguien
 * que acaba de pagar.
 *
 * Las dos escrituras son correctas por separado. Lo que estaba mal es que
 * fueran dos. Ninguna lente lo veía, y la sonda que recarga y pregunta si el
 * trabajo sigue ahí (`medir-guardado.py`) mira El Camino, el Diario y Mi
 * Número — la bienvenida no está entre sus bucles.
 *
 * ═══ QUÉ MIRA ESTA LENTE ═══
 *
 * La regla, no la implementación: **todo lo que escribe la columna
 * `diagnostico` escribe el objeto completo.** Da igual cuántos pasos haya o
 * cómo se llamen; si uno escribe un objeto a mano con menos campos que otro,
 * acá se pone en rojo.
 *
 * Por eso se exige que pase por el compositor `payloadDiagnostico`. Un objeto
 * literal en una de las escrituras ES el defecto, aunque hoy tenga todos los
 * campos: el próximo campo que alguien agregue va a quedar en uno y no en el
 * otro, que es exactamente cómo nació este bug.
 */
import { readFileSync } from 'node:fs';

const archivo = 'src/components/WelcomeWizard.tsx';
const src = readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

/** El archivo sin comentarios: la explicación del bug nombra el bug. */
const codigo = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

console.log('\n── la bienvenida guarda una sola vez y completa ──');

/* ── 1 · Existe el compositor ── */
const TIENE_COMPOSITOR = /const payloadDiagnostico\s*=/.test(codigo);
if (!TIENE_COMPOSITOR) {
  mal('no hay un compositor `payloadDiagnostico`: cada paso vuelve a armar el JSON a mano');
}

/* ── 2 · Toda escritura de la columna pasa por él ──
 *
 * Se buscan las asignaciones `diagnostico:` dentro de un update. Las que no
 * llaman al compositor son objetos escritos a mano, y son el defecto.
 */
const escrituras = [...codigo.matchAll(/diagnostico:\s*([^,\n]*)/g)].map((m) => m[1].trim());
const aMano = escrituras.filter((e) => !e.startsWith('payloadDiagnostico'));
if (escrituras.length === 0) {
  mal('ninguna escritura de `diagnostico` encontrada: ¿cambió el nombre de la columna?');
} else if (aMano.length) {
  mal(`${aMano.length} de ${escrituras.length} escrituras de \`diagnostico\` arman el objeto a mano:`);
  for (const a of aMano.slice(0, 4)) console.log(`      ${a.slice(0, 80)}`);
} else {
  console.log(`  ✓ las ${escrituras.length} escrituras de \`diagnostico\` pasan por el compositor`);
}

/* ── 3 · El compositor no deja afuera ninguna de las diez respuestas ──
 *
 * Las diez preguntas del diagnóstico y la situación tienen que terminar todas
 * en la columna. Si alguien agrega una pregunta y se olvida de sumarla acá,
 * la respuesta se pierde al recargar y el cliente la vuelve a contestar.
 */
const CAMPOS_ESPERADOS = [
  'freno', 'nicho_hipotesis', 'dinero', 'tiempo',
  'estilo_mentor', 'trabajo_espiritual', 'llegan', 'entrega', 'publica', 'situacion',
];
const cuerpo = /const payloadDiagnostico[\s\S]*?\n  \}\);/.exec(codigo)?.[0] ?? '';
const faltantes = CAMPOS_ESPERADOS.filter((c) => !new RegExp(`\\b${c}\\s*:`).test(cuerpo));
if (TIENE_COMPOSITOR && faltantes.length) {
  mal(`el compositor no escribe: ${faltantes.join(', ')}`);
} else if (TIENE_COMPOSITOR) {
  console.log(`  ✓ el compositor escribe las ${CAMPOS_ESPERADOS.length} respuestas`);
}

/* ── 4 · Cada pregunta que se muestra tiene su campo ──
 *
 * Al revés que el chequeo anterior: se cuentan los `setDx…` del formulario y
 * se comprueba que cada uno llegue al compositor. Una pregunta nueva que el
 * cliente contesta y nadie guarda es peor que una pregunta que falta.
 */
const preguntados = [...new Set(
  [...codigo.matchAll(/setDx([A-Z]\w*)/g)].map((m) => m[1].toLowerCase()),
)];
/*
 * Lo que NO es una respuesta del cliente:
 *   avatar  → va en su propia columna (`avatar_tipo`), no en el JSON
 *   saving  → es el spinner del botón, no algo que el cliente contesta
 */
const FUERA_DEL_JSON = new Set(['avatar', 'saving']);
const sinGuardar = preguntados.filter((p) => {
  if (FUERA_DEL_JSON.has(p)) return false;
  /* El campo puede llamarse distinto que el estado: nicho → nicho_hipotesis. */
  return !new RegExp(`\\b${p}\\w*\\s*:`).test(cuerpo) && !new RegExp(`dx${p}`, 'i').test(cuerpo);
});
if (sinGuardar.length) {
  mal(`se le pregunta y no se guarda: ${sinGuardar.join(', ')}`);
} else {
  console.log(`  ✓ las ${preguntados.length} respuestas que se piden tienen dónde caer`);
}

console.log(fallas === 0
  ? '\n✓ la bienvenida no se pisa a sí misma\n'
  : `\n✗ ${fallas} fallo(s) — el cliente pierde lo que escribió en la bienvenida\n`);
process.exit(fallas === 0 ? 0 : 1);
