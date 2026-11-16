/**
 * EL JUEGO DEL SUR — que el juego de los libros cuente lo mismo en la app.
 *
 * ═══ QUÉ VIGILA ═══
 *
 * Las cinco mecánicas están escritas en tres lugares que no se hablan: la
 * guarda de los seis libros, El Camino en papel y esta app. Si el vaso de la
 * app se llena con otra cuenta que el del libro, el cliente tiene dos juegos
 * y ninguno es el suyo. Esta lente fija la cuenta.
 *
 * Y vigila lo que es fácil que se caiga sin romperse: que el paso afuera se
 * pueda marcar. La racha y las dos piedras del paso afuera se dibujan igual
 * con la lista vacía; sin el toque que la llena, las dos quedan en cero para
 * siempre y nadie ve un error.
 *
 * Correr con: npx tsx scripts/prueba-el-juego-del-sur.ts
 */
import { readFileSync } from 'node:fs';
import {
  rachaDe, piedras, piedrasEnElVaso, vasoLleno, VASO,
  colorDelDia, tramosDelMapa, cualDeLasDiez, encontrarPalabra,
} from '../src/lib/elJuegoDelSur';
import { SEED_ROADMAP_V3 } from '../src/lib/roadmapSeed';
import { PAISAJES, tramoDelPaisaje } from '../src/lib/losCincoPaisajes';
import { esPasoDelCliente } from '../src/lib/diaPrograma';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const fuente = readFileSync('src/lib/elJuegoDelSur.ts', 'utf-8');
const soloCodigo = fuente
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));

console.log('\n══ tu vaso: la cuenta del libro ══');

ok(/export const VASO = 100/.test(soloCodigo), 'el vaso son 100 piedras');
ok(/PIEDRA_POR_DIA = 1\b/.test(soloCodigo), 'cada día hecho vale una');
ok(/PIEDRA_POR_PASO_AFUERA = 2\b/.test(soloCodigo), 'cada paso afuera vale dos');
for (const [en, nombre] of [[33, 'La orilla'], [66, 'La travesía'], [100, 'La otra orilla']] as const) {
  ok(new RegExp(`en:\\s*${en},\\s*nombre:\\s*'${nombre}'`).test(soloCodigo),
    `la marca de ${en} es «${nombre}»`);
}

console.log('\n══ las diez palabras ══');

const palabras = [...soloCodigo.matchAll(/palabra:\s*'([^']+)'/g)].map((m) => m[1]);
ok(palabras.length === 10, `${palabras.length} palabras`);
const delSistema = ['HORA', 'PRECIO', 'PROTOCOLO', 'MODELO', 'CAJA', 'SISTEMA', 'LIBRES', 'IMPOSTOR', 'BOT', 'ESCÁNER'];
const sobran = palabras.filter((p) => !delSistema.includes(p));
ok(sobran.length === 0, `son las diez del sistema${sobran.length ? ` — sobra ${sobran.join(', ')}` : ''}`);
const porLibro = [...soloCodigo.matchAll(/libro:\s*'([^']+)'/g)].map((m) => m[1]);
const cuenta = porLibro.reduce<Record<string, number>>((a, l) => ({ ...a, [l]: (a[l] ?? 0) + 1 }), {});
ok(Object.keys(cuenta).length === 5, `repartidas en ${Object.keys(cuenta).length} libros`);
ok(Object.values(cuenta).every((n) => n === 2), 'dos por libro, como en la colección');

console.log('\n══ lo que abren, que lo definía la app ══');

ok(/CAJA ÷ HORA = /.test(soloCodigo), 'la ecuación del bosque está escrita');
ok(/LO_QUE_ABRE/.test(soloCodigo), 'y hay algo decidido para cuando estén las diez');
const pantalla = readFileSync('src/components/camino/ElJuegoDelSur.tsx', 'utf-8');
ok(/horaReal/.test(pantalla), 'lo que abre usa su hora real, que la app ya midió');

console.log('\n══ la racha tiene de dónde contar ══');

/* Lo que se puede caer sin romperse: el paso afuera no se podía marcar, así
   que la racha y las dos piedras quedaban dibujadas y en cero para siempre. */
const sesion = readFileSync('src/components/sesion/SesionViva.tsx', 'utf-8');
/* Se busca la LLAMADA con su día, no el nombre: importado y sin usar, el
   nombre está igual y la lente daba verde con el toque desconectado. Probado
   sacando la llamada y dejando el import. */
ok(/marcarPasoAfuera\(\s*diaDelPaso/.test(sesion),
  'el paso afuera se puede marcar en la sesión, y se llama con su día');
ok(/diaDelPaso/.test(sesion), 'y se guarda con su día, que es lo que la racha cuenta');
const camino = readFileSync('src/pages/Roadmap.tsx', 'utf-8');
ok(/diaDelPaso=\{meta\.dia_asignado\}/.test(camino), 'El Camino le pasa ese día');
ok(/<ElJuegoDelSur\s/.test(camino), 'y el tablero está puesto en El Camino');

console.log('\n══ el tablero se entera al instante ══');

/*
 * Quien marca el paso afuera es la sesión; quien lo cuenta es el tablero, y
 * los dos están en El Camino. `localStorage` no avisa dentro de la misma
 * ventana: el cliente tocaba «Lo hice» y el vaso y la racha no se movían
 * hasta recargar. Probado en el navegador antes de arreglarlo.
 */
ok(/export function alMarcarPasoAfuera/.test(soloCodigo),
  'marcar un paso afuera avisa a quien esté mirando');
ok(/alMarcarPasoAfuera\(setMarcados\)/.test(pantalla),
  'y el tablero está suscrito');

console.log('\n══ ningún mapa de más ══');

/* El sello por tramo YA existe en la app: son los grados. Una insignia nueva
   al lado sería el sexto mapa para el mismo viaje. */
ok(!/insignia|sello/i.test(soloCodigo),
  'el sello por tramo no se duplica: en la app son los grados que ya existen');

/* Y el color de cada día sale de donde la app lo contesta, no de una tabla
   copiada acá. Esta lente ya estaba, y era la que daba verde mientras el
   tablero pintaba mal: medía la AUSENCIA de rangos copiados, no el color. */
ok(!/\b(1 a 7|8 a 14|15 a 35|36 a 84|85 a 90)\b/.test(soloCodigo),
  'los días de cada paisaje no están copiados: salen del seed');
ok(!/sistemaPorDia|coloresDeSistema/.test(pantalla),
  'el mapa no se pinta con el sistema de la jornada, que es el trabajo y no el lugar');

console.log('\n══ el mapa, pintado de verdad y comparado con la app ══');

/*
 * ACÁ ESTABA EL DEFECTO, Y NINGUNA LENTE LO VEÍA.
 *
 * El mapa pintaba cada día con el color del `sistema` de la jornada de ese
 * día. El sistema dice de qué sistema es el TRABAJO; el paisaje dice dónde
 * está el cliente. Medido el 16 de noviembre sobre main: 55 de los 90 días
 * pintaban un color distinto del que la app muestra ese mismo día, y 31 días
 * no podían pintarse nunca —el 90 entre ellos— porque su jornada no trae
 * sistema.
 *
 * Estas cuatro lentes EJECUTAN el color y lo comparan contra una cuenta
 * independiente: los tramos que `tramoDelPaisaje` calcula. Probadas con el
 * defecto puesto: las cuatro se ponen rojas.
 */
const colores = Array.from({ length: 90 }, (_, i) => colorDelDia(i + 1));
ok(colores.every((c) => Boolean(c)), `los 90 días tienen color (sin color: ${colores.filter((c) => !c).length})`);

const distintos = new Set(colores);
ok(distintos.size === 5, `el mapa usa cinco colores, uno por paisaje (usa ${distintos.size})`);

/* Cinco tramos seguidos, en el orden de la colección: si el color vuelve a
   salir del sistema de la jornada, el mapa queda salpicado y esto se rompe. */
const corridas: (string | undefined)[] = [];
for (const c of colores) if (c !== corridas[corridas.length - 1]) corridas.push(c);
ok(corridas.length === 5, `los cinco paisajes van seguidos, no salpicados (${corridas.length} tramos)`);
ok(corridas.join('|') === PAISAJES.map((p) => p.color.fondo).join('|'),
  'y en el orden de la colección: lago, montaña, viento, río, bosque');

/* La cuenta independiente: cada día del tramo de un paisaje se pinta con el
   color de ESE paisaje. `tramoDelPaisaje` llega al mismo número por otro
   camino que `paisajeDelDia`. */
let fueraDeTramo = 0;
for (const p of PAISAJES) {
  const { desde, hasta } = tramoDelPaisaje(p.id);
  for (let d = desde; d <= hasta; d++) if (colorDelDia(d) !== p.color.fondo) fueraDeTramo++;
}
ok(fueraDeTramo === 0, `ningún día se pinta con el color de otro paisaje (${fueraDeTramo} días)`);

/* Y la leyenda sale de los mismos tramos que pintan, así que no puede mentir. */
const tramos = tramosDelMapa();
ok(tramos.length === 5 && tramos[0].desde === 1 && tramos[4].hasta === 90,
  `la leyenda cubre los 90 días (${tramos[0].desde} al ${tramos[4].hasta})`);
ok(tramos.every((t, i) => i === 0 || t.desde === tramos[i - 1].hasta + 1),
  'y no deja un día sin paisaje entre dos tramos');

console.log('\n══ el sello por tramo: que los grados lo cubran de verdad ══');

/*
 * El módulo decide no dibujar un sello nuevo porque «los grados ya son el
 * sello». Eso es una afirmación sobre los datos, así que se ejecuta: se
 * cuentan los grados que caen dentro de cada tramo. Si un tramo quedara sin
 * ninguno, el quinto mecanismo del juego no existiría para ese tramo y la
 * decisión de no dibujarlo estaría apoyada en nada.
 */
const grados = SEED_ROADMAP_V3
  .flatMap((p) => p.metas ?? [])
  .filter((m) => m.cinturon && m.dia_asignado)
  .map((m) => ({ dia: m.dia_asignado as number, id: m.cinturon as string }));
ok(grados.length === 11, `el Camino reparte ${grados.length} grados`);
for (const p of PAISAJES) {
  const { desde, hasta } = tramoDelPaisaje(p.id);
  const suyos = grados.filter((g) => g.dia >= desde && g.dia <= hasta);
  ok(suyos.length > 0,
    `${p.nombre} (${desde}–${hasta}) cierra con grado: ${suyos.map((g) => `${g.id}@${g.dia}`).join(', ') || 'NINGUNO'}`);
}

console.log('\n══ las diez palabras, escritas en un teléfono ══');

/*
 * «ESCÁNER» lleva tilde y se escribe sin ella nueve de diez veces. La
 * comparación exacta la rechazaba y la pantalla no decía nada: el campo se
 * vaciaba y el cliente no sabía si la había sumado. Probado con el defecto
 * puesto (comparación exacta): las tres primeras se ponen rojas.
 */
ok(cualDeLasDiez('escaner') === 'ESCÁNER', 'sin tilde cuenta igual');
ok(cualDeLasDiez(' Escáner ') === 'ESCÁNER', 'con espacios y en minúscula, también');
ok(cualDeLasDiez('ESCANER') === 'ESCÁNER', 'y en mayúsculas sin tilde');
ok(cualDeLasDiez('hora') === 'HORA', 'las otras nueve siguen entrando');
ok(cualDeLasDiez('embudo') === null, 'y una que no es de las diez no entra');
ok(cualDeLasDiez('   ') === null, 'el campo vacío no suma nada');
/* Y la pantalla tiene qué contestar en los dos casos. */
ok(/cualDeLasDiez\(escribiendo\)/.test(pantalla), 'la pantalla pregunta antes de sumar');
ok(/Esa no es una de las diez/.test(pantalla), 'y dice que no cuando no es');
ok(encontrarPalabra('escaner').includes('ESCÁNER'), 'la que se suma queda escrita como en el libro');

console.log('\n══ y las cuentas, corridas de verdad ══');

/*
 * ACÁ FALTABA LO QUE IMPORTA. Esta lente buscaba con expresiones que las
 * constantes coincidieran con el libro, y nunca llamaba a una función. Así
 * pasaron dos cosas que solo se ven ejecutando:
 *
 *   · la racha no recibía «hoy», así que el que hizo cinco días y desapareció
 *     un mes seguía leyendo «5 días seguidos», y el mensaje de reenganche no
 *     se podía dibujar nunca;
 *   · el Camino da 120 piedras y el vaso tiene 100, así que la línea decía
 *     «120 piedras» debajo de una grilla de 100.
 */
/*
 * LOS DÍAS QUE TIENEN PASO AFUERA SALEN DEL SEED.
 *
 * Estaban escritos a mano acá —los 28, uno por uno— y coincidían con el seed
 * el día que se escribieron. Eso es un segundo calendario: el día que el seed
 * mueva un paso afuera, esta lente sigue verde contra la lista vieja. Es la
 * misma cuenta que hace la pantalla, y se hace en el mismo lugar.
 */
const posibles = [...new Set(
  SEED_ROADMAP_V3
    .flatMap((p) => p.metas ?? [])
    .filter((m) => m.paso_afuera && m.dia_asignado)
    .map((m) => m.dia_asignado as number),
)].sort((a, b) => a - b);
ok(posibles.length === 28, `${posibles.length} días del Camino tienen paso afuera, y salen del seed`);

ok(rachaDe([1, 2, 3], posibles, 3).actual === 3, 'tres días seguidos hasta hoy son racha de tres');
ok(rachaDe([1, 2, 3], posibles, 4).actual === 0, 'y si hoy es un día posible sin marcar, se cortó');
ok(rachaDe([1, 2, 3, 4], posibles, 40).actual === 0,
  'el que marcó hasta el día 4 y hoy va por el 40 no tiene racha corriendo');
ok(rachaDe([1, 2, 3, 4], posibles, 40).mejor === 4, 'pero su mejor no se pierde');
/* Y con eso el mensaje de reenganche se puede dibujar: era código muerto. */
const corte = rachaDe([1, 2, 3, 4], posibles, 40);
ok(corte.mejor > 0 && corte.actual === 0,
  'hay un estado real en que sale «si te caíste, no empiezas de nuevo»');

const jornadasDelCliente = SEED_ROADMAP_V3
  .flatMap((p) => (p.metas ?? []).filter((m) => esPasoDelCliente(m) && (m.dia_asignado ?? 0) > 0));
const maximo = piedras(jornadasDelCliente.length, posibles.length);
ok(maximo > VASO, `el Camino da ${maximo} piedras y el vaso tiene ${VASO}: se llena antes del final`);
ok(piedrasEnElVaso(maximo) === VASO, 'lo que se muestra nunca pasa del vaso');
ok(vasoLleno(maximo), 'y llegando al final el vaso está lleno');
ok(piedrasEnElVaso(piedras(10, 2)) === 14, 'a mitad de camino la cuenta es la del libro (1 por día, 2 por paso)');

console.log(fallas === 0 ? '\n✓ el juego del sur, con la cuenta del libro' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
