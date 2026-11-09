/**
 * LOS CINCO DÍAS DEL QUE COMPRA SOLO
 *
 * ═══ QUÉ CUIDA ═══
 *
 * Javo pidió el 9 de noviembre una sola cosa para hoy: que lo básico funcione.
 * Que el que compra en la página entre solo, que esos cinco días corran sin
 * trabas y sin pisarse, y que lo que la página promete sea lo que la app abre.
 *
 * La página dice, textual: «Los 8 libros y los cinco primeros días de mi app.»
 * Eso es una promesa medible, y esta lente la mide contra el Camino de verdad.
 *
 * ═══ QUÉ SE ENCONTRÓ AL MEDIRLO ═══
 *
 * La primera tarjeta del Camino es el día 0, «Entrega técnica y llamada de
 * bienvenida», y su evidencia dice **«Se marca solo: primer ingreso.»** No se
 * marcaba sola: nadie en toda la app escribía esa fila. Quien compraba por la
 * página —solo, sin llamada de nadie— veía arriba de su Camino una tarea de
 * una llamada que no existió y que no podía cerrar. No le trababa el avance
 * (`dondeVa` hace `Math.max(1, …)`), pero le quedaba abierta para siempre.
 * Lo cierra `elPrimerIngreso.ts`, y acá se cuida que siga pasando.
 *
 * Dos sustos que NO eran bugs, y quedan anotados para que nadie los vuelva a
 * «arreglar»: el día 5 activa el freno `F-PRECIO` y ninguna jornada lo
 * levanta —se abre por su condición, `oferta.precio >= numeros.precio_digno`,
 * que es como funciona ese tipo de freno—; y `planDe({plan:'blanco'})`
 * devuelve 'completo' porque 'blanco' va en `plan_comercial`, no en `plan`:
 * son dos columnas distintas a propósito.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pilarDelDia, codigoDelDia, roadmap } from '../src/lib/roadmapSeed';
import { PILAR_MAX, planDe } from '../src/lib/planes';
import { estacionDelDia } from '../src/lib/estaciones';
import { jornadaDelPrimerIngreso, DIA_DEL_PRIMER_INGRESO } from '../src/lib/elPrimerIngreso';

const raiz = join(import.meta.dirname, '..');
let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };
const bien = (m: string) => console.log(`  ✓ ${m}`);

/** Los cinco días que la página promete. */
const LOS_CINCO = [1, 2, 3, 4, 5];
/** Los días de calendario de la ventana, que dicen el alta y el webhook. */
const DIAS_DE_LA_VENTANA = 21;

console.log('\n── los cinco días del que compra solo ──');

/* ── 1 · La entrada abre exactamente los cinco días ──
 *
 * Ni cuatro ni seis. Uno menos y la página promete algo que no entrega; uno
 * más y el siguiente escalón ya no tiene nada que ofrecerle, que es el
 * agujero por el que el turno 8 encontró los noventa días regalados.
 */
const plan = planDe({ plan: 'ELNUMERO' } as never);
const abiertos: number[] = [];
for (let d = 1; d <= roadmap.dias; d += 1) {
  const p = pilarDelDia(d);
  if (p !== null && p <= PILAR_MAX[plan]) abiertos.push(d);
}
if (plan !== 'blanco') mal(`el que entra por la entrada queda en '${plan}' y no en 'blanco'`);
if (JSON.stringify(abiertos) !== JSON.stringify(LOS_CINCO)) {
  mal(`la entrada abre los días ${abiertos.join(', ')} y la página promete los cinco primeros`);
} else {
  bien('la entrada abre los días 1 al 5, que es lo que promete la página');
}

/* ── 2 · La ventana de calendario es una sola, y son 21 días ──
 *
 * El alta la escribe y el webhook la escribe: si los dos números se separan,
 * dos compradores de lo mismo tienen ventanas distintas según por qué ruta
 * entró su pago.
 */
for (const [arch, re] of [
  ['api/alta-numero.ts', /DIAS_DE_LA_VENTANA\s*=\s*(\d+)/],
  ['api/ghl-webhook.ts', /(\d+)\s*\*\s*86400000/],
] as const) {
  const t = readFileSync(join(raiz, arch), 'utf8');
  const n = Number(re.exec(t)?.[1] ?? 0);
  if (n !== DIAS_DE_LA_VENTANA) mal(`${arch} da una ventana de ${n} días y no de ${DIAS_DE_LA_VENTANA}`);
}
bien(`la ventana es de ${DIAS_DE_LA_VENTANA} días por las dos rutas de pago`);

/* ── 3 · La primera tarjeta se cierra sola, como dice su evidencia ── */
const j0 = jornadaDelPrimerIngreso();
if (!j0) {
  mal(`no se encuentra la jornada del día ${DIA_DEL_PRIMER_INGRESO}`);
} else {
  const app = readFileSync(join(raiz, 'src/App.tsx'), 'utf8');
  if (!/marcarPrimerIngreso\(/.test(app)) {
    mal('nadie llama a marcarPrimerIngreso: la primera tarjeta queda abierta para siempre');
  } else {
    bien(`la entrega técnica (${j0.clave}) se cierra en el primer ingreso`);
  }
}

/* ── 4 · Cada uno de los cinco días tiene con qué trabajarse ──
 *
 * Un día abierto y vacío es peor que un día cerrado: el cliente lo abre, no
 * encuentra qué hacer, y lo que aprende es que la app no está terminada.
 */
const porDia = new Map(roadmap.jornadas.map((j) => [j.dia, j]));
const entrenadores = new Set(roadmap.agentes.map((a) => a.id));
for (const d of LOS_CINCO) {
  const j = porDia.get(d);
  if (!j) { mal(`el día ${d} no existe en el Camino`); continue; }
  if (!j.titulo?.trim()) mal(`el día ${d} no tiene título`);
  if ((j.pasos ?? []).length === 0) mal(`el día ${d} no tiene pasos: se abre vacío`);
  if ((j.evidencias ?? []).length === 0) mal(`el día ${d} no pide ninguna evidencia`);
  for (const e of j.evidencias ?? []) {
    if (!e.pide?.trim()) mal(`el día ${d} pide una evidencia sin decir qué subir`);
  }
  if ((j.adn_escribe ?? []).length === 0) mal(`el día ${d} no escribe nada en el ADN`);
  if (j.agente && !entrenadores.has(j.agente)) {
    mal(`el día ${d} usa el entrenador «${j.agente}», que no existe en el seed`);
  }
  if (!codigoDelDia(d)) mal(`el día ${d} no tiene código: su video no se puede atar`);
  const est = estacionDelDia(d);
  if (est?.id !== 'lago') mal(`el día ${d} cae en ${est?.nombre ?? 'ninguna estación'} y los cinco son El lago`);
}
bien('los cinco días tienen título, pasos, evidencia con lo que pide, ADN y entrenador');
bien('los cinco caen en El lago, que es el libro que se lee con ellos');

/* ── 5 · El día 5 sella el precio y deja con qué cobrar ──
 *
 * Es el día que la página vende («el lunes cobras tu precio nuevo») y el que
 * sella el ADN. Si deja de escribir el precio digno, el freno F-PRECIO del
 * día 10 se queda sin contra qué comparar y la oferta puede salir más barata
 * que la hora del cliente.
 */
const d5 = porDia.get(5);
for (const campo of ['numeros.precio_digno', 'sistema.link_pago']) {
  if (!(d5?.adn_escribe ?? []).includes(campo)) {
    mal(`el día 5 ya no escribe ${campo}`);
  }
}
bien('el día 5 sella el precio digno y deja su enlace de pago');

/* ── 6 · Los frenos que se activan dentro de los cinco días se pueden abrir ──
 *
 * Un freno se abre de dos formas: porque una jornada lo levanta, o por su
 * propia condición. Lo que no puede pasar es que no tenga ninguna de las dos
 * —ahí queda puesto para siempre y el Camino se corta sin que nadie entienda
 * por qué—.
 */
const frenos = new Map(roadmap.frenos.map((f) => [f.id, f]));
const levantanDespues = new Set(roadmap.jornadas.flatMap((j) => j.freno_levanta ?? []));
for (const d of LOS_CINCO) {
  for (const f of porDia.get(d)?.freno_activa ?? []) {
    const freno = frenos.get(f);
    if (!freno) { mal(`el día ${d} activa el freno «${f}», que no existe`); continue; }
    if (!freno.apertura?.trim() && !levantanDespues.has(f)) {
      mal(`el freno «${f}» se activa el día ${d} y nada lo abre: ni condición ni jornada`);
    }
  }
}
bien('todo freno que se activa en los cinco días tiene con qué abrirse');

console.log(fallas === 0
  ? '\n✓ los cinco días corren sin trabas\n'
  : `\n✗ ${fallas} fallo(s)\n`);
process.exit(fallas === 0 ? 0 : 1);
