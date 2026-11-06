/**
 * EL ENCARGO SALE CON LOS DATOS DEL CLIENTE, Y DICE LO QUE LE FALTA
 *
 * ═══ POR QUÉ ═══
 *
 * El Camino nombra a Claude tres veces en 91 jornadas y a GHL ninguna: el
 * cliente hace los noventa días sin la palanca que hoy mueve todo. El encargo
 * la trae, pero adentro de la jornada que la necesita — nunca como catálogo,
 * porque un catálogo con noventa días por delante invita a pasarlos
 * construyendo en vez de vendiendo.
 *
 * Lo que lo hace servir es que sale CON los datos del cliente. Un encargo
 * genérico devuelve una página genérica, y eso no ahorra nada: hay que
 * reescribirla entera, y de paso enseña que «la IA no sirve para esto».
 *
 * ═══ QUÉ MIRA ═══
 *
 * Que los datos entren, que lo que falta se nombre en vez de desaparecer, y
 * que los encargos cumplan las reglas de redacción de la casa.
 */
import { armarEncargo, ENCARGOS } from '../src/lib/elEncargo';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`✗ ${m}`); };

/* ── 1 · Los datos entran ── */
const completo = armarEncargo('Soy {especialidad} y mi promesa es {promesa}.', {
  especialidad: 'nutricionista', promesa: 'comer sin contar calorías',
});
if (!completo.texto.includes('nutricionista') || !completo.texto.includes('comer sin contar'))
  mal(`los datos no entraron: «${completo.texto}»`);
if (completo.faltan.length) mal(`dijo que falta algo y no falta nada: ${completo.faltan}`);

/* ── 2 · Lo que falta se NOMBRA, no desaparece ──
   Si el hueco se borrara en silencio, la salida vendría coja y el cliente no
   sabría por qué. */
const cojo = armarEncargo('Mi promesa es {promesa}. Trabajo con {avatar}.', {
  promesa: undefined, avatar: 'mujeres de 40',
});
if (!cojo.texto.includes('todavía sin sellar')) mal(`el hueco desapareció: «${cojo.texto}»`);
if (!cojo.faltan.includes('tu promesa')) mal(`no avisó que falta la promesa: ${cojo.faltan}`);
if (cojo.faltan.includes('a quién sirves')) mal('avisó de algo que sí estaba');

/* ── 3 · Los encargos cumplen las reglas de la casa ── */
const PROHIBIDAS = /\b(escalar|embudo|funnel|gurú|guru|\bgente\b|gratis)\b/i;
for (const [codigo, plantilla] of Object.entries(ENCARGOS)) {
  if (PROHIBIDAS.test(plantilla)) {
    mal(`${codigo}: usa una palabra prohibida de la casa — ${plantilla.match(PROHIBIDAS)?.[0]}`);
  }
  /* Un encargo que no dice qué revisar enseña a pegar sin leer. */
  if (!/revis/i.test(plantilla)) mal(`${codigo}: no dice qué revisar antes de usar la salida`);
  /* Y tiene que pedir algo de su ADN, o no es suyo. */
  if (!/\{\w+\}/.test(plantilla)) mal(`${codigo}: no usa ni un dato del cliente`);
  /* Castellano neutro: el voseo queda fuera. */
  const voseo = plantilla.match(/\b(podés|tenés|querés|pegá|revisá|escribí|hacé|mirá|andá)\b/i);
  if (voseo) mal(`${codigo}: voseo — «${voseo[0]}»`);
}

if (!fallas) {
  console.log(`✓ los ${Object.keys(ENCARGOS).length} encargos salen con los datos del cliente`);
  console.log('    y lo que falta se nombra en vez de desaparecer');
  for (const c of Object.keys(ENCARGOS)) console.log(`    ${c}`);
}
process.exit(fallas ? 1 : 0);
