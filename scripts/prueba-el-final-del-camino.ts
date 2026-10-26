/**
 * prueba-el-final-del-camino.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Las dos pantallas del final, que no se habían medido nunca:
 *
 *   graduacion  el modal del día 90, que corona los noventa días
 *   cierre      el cierre de cuentas de quien terminó o se quedó sin ventana,
 *               con los tres pases de renovación debajo
 *
 * La segunda es el momento comercial más importante del programa: es lo único
 * que tiene delante, al mismo tiempo, todo lo que construyó y la pregunta de
 * qué hace con eso. Y estaba ROTA en el teléfono. El contenedor era un `flex`
 * sin dirección —que pone en fila— y sus dos hijos son el cierre y los pases,
 * así que a 390 píxeles cada uno se quedaba con medio ancho: el texto salía en
 * columnas de tres palabras, los dos numerales se montaban uno sobre otro
 * («jornadasquedaro» / «completasdias») y los precios de los pases se cortaban
 * por la derecha. El medidor daba cero en 39 vistas porque esta no era una de
 * ellas.
 *
 * Lo demás que apareció al mirarlas:
 *   · «Se cerró el 2026-10-14» — la fecha cruda de la base, en la pantalla
 *     donde se le cuenta a alguien qué hizo con sus noventa días.
 *   · «Tu atraso más grande fue de 0 días» con cero jornadas hechas: no hay
 *     atraso que medir cuando no se empezó.
 *   · La garantía dicha dos veces seguidas con distintas palabras, que suena a
 *     que se está justificando algo.
 *   · La graduación con el telón negro al 90% y la tarjeta en degradé —dos
 *     cosas que la casa no usa— y «Cinturón negro» escrito dos veces, en dos
 *     tamaños y dos tonos de oro.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const cierre = leer('src/components/CierreDelCamino.tsx');
const pases = leer('src/components/PasesDeRenovacion.tsx');
const grad = leer('src/components/Graduacion.tsx');
/* Sin comentarios: los de arriba cuentan el bug y nombran lo que ya no está. */
const gradVivo = grad.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
const medidor = leer('scripts/medir-app.py');

console.log('\n── el cierre entra en un teléfono ──');
ok(
  /flex flex-col items-center/.test(cierre),
  'el cierre y los pases van uno debajo del otro, no en fila',
);
/*
 * Antes eran DOS numerales de 34 en dos columnas —uno contaba lo hecho, el
 * otro «quedaron sin entregar»—, y lo que esta comprobación protegía era que
 * no se montaran en el teléfono. El segundo se fue: en la pantalla donde se
 * le muestra a alguien su trabajo de noventa días, sus faltas no pueden tener
 * la misma jerarquía que sus logros. Queda la cifra con su total, como las
 * tarjetas de Métricas, y el detalle de lo que falta vive abajo en la lista.
 */
ok(
  /de \{c\.hechas \+ c\.sinEvidencia\.length\} jornadas/.test(cierre),
  'el numeral va con su total, en una sola caja: un dato, no dos juicios',
);
/* Sin comentarios: el de arriba nombra la frase que ya no está. */
const cierreVivo = cierre
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
ok(
  !/quedaron sin entregar/.test(cierreVivo),
  'y ya no hay un numeral del mismo tamaño contando lo que no se entregó',
);
ok(
  /max-w-\[620px\]/.test(pases),
  'los pases tienen el mismo ancho que el cierre, para que se lean como una pieza',
);

console.log('\n── y dice las cosas como se dicen ──');
ok(
  /fechaEnPalabras\(desde\)/.test(cierre),
  'la fecha va en palabras —«14 de octubre»— y no como viene de la base',
);
ok(
  /export function fechaEnPalabras/.test(leer('src/lib/fechas.ts')),
  'y hay un solo lugar donde se decide cómo se escribe una fecha',
);
/*
 * `new Date('2026-10-14')` es medianoche UTC, y en Argentina —tres horas
 * atrás— devuelve el 13. La fecha se parte a mano por eso.
 */
ok(
  /\.split\('-'\)\.map\(Number\)/.test(leer('src/lib/fechas.ts')),
  'partida a mano, porque `new Date` sobre una fecha sin hora devuelve el día anterior en Argentina',
);
ok(
  /c\.hechas > 0 && c\.atrasoMayor > 0/.test(cierre),
  'el atraso se nombra solo cuando existió',
);
ok(
  !/Con esto la garantía corre a nuestro cargo/.test(leer('src/lib/cierreDeCuentas.ts')),
  'la garantía se explica una vez: el dato arriba, lo que significa abajo',
);

console.log('\n── la graduación es de la casa ──');
/*
 * El negro queda en un solo lugar: la caja del video de graduación. Un
 * reproductor va sobre negro porque el video trae sus propias barras, y
 * cualquier otro fondo se ve como un error de encuadre.
 */
const negros = [...gradVivo.matchAll(/bg-black[^\s"'`]*/g)].map((m) => m[0]);
const negroDeVideo = /aspect-video bg-black/.test(gradVivo);
ok(
  negros.length === 0 || (negros.length === 1 && negroDeVideo),
  negros.length === 0 || (negros.length === 1 && negroDeVideo)
    ? 'el telón oscurece con la tinta del tema; el único negro es la caja del video'
    : `${negros.length} negros: ${negros.join(', ')}`,
);
ok(
  !/bg-gradient/.test(gradVivo),
  'y la tarjeta es el panel, plano, con su línea de oro',
);
/*
 * El nombre del grado se dice una vez como encabezado. La otra aparición es
 * el botón del certificado —«Ver mi certificado de Cinturón Negro»—, que es
 * otra cosa: ahí nombra el documento que se descarga.
 */
const vecesQueSeNombra = (gradVivo.match(/Cinturón [Nn]egro/g) ?? []).length;
ok(
  vecesQueSeNombra <= 2 && !/Cinturón negro<\/p>\s*<p[^>]*>\s*Cinturón Negro/i.test(gradVivo),
  vecesQueSeNombra <= 2
    ? 'dice «Cinturón negro» de encabezado una vez, y la otra vez es el botón del certificado'
    : `lo dice ${vecesQueSeNombra} veces`,
);

console.log('\n── y las dos están medidas ──');
ok(
  /resultados\['cierre'\]/.test(medidor) && /preparar\(pag, 'roadmap', dias=100\)/.test(medidor),
  'el medidor abre el cierre con la ventana vencida',
);
ok(
  /resultados\['graduacion'\]/.test(medidor) && /dias=90/.test(medidor),
  'y la graduación al día 90',
);
/*
 * Se mira el bloque de ESTRICTAS entero y no la línea con su paréntesis:
 * atada al formato, esta comprobación falló el día que se agregó otra línea
 * detrás, sin que nada del hecho que protege hubiera cambiado.
 */
const estrictas = medidor.slice(medidor.indexOf('ESTRICTAS = ('),
                                medidor.indexOf('ADMIN_ESTRICTO'));
ok(
  /'cierre'/.test(estrictas) && /'graduacion'/.test(estrictas),
  'y las dos son estrictas: si se rompen, la corrida falla',
);
/*
 * Y las dos se miden también CON DATOS. El estado vacío es real —alguien paga,
 * se traba y llega igual al día noventa— pero no es a quien se le ofrece la
 * renovación: a esa pantalla llega sobre todo quien hizo el trabajo, y medirla
 * vacía es medir la de otro.
 */
ok(
  /'cierre>lleno'/.test(estrictas) && /'graduacion>lleno'/.test(estrictas)
  && /resultados\['cierre>lleno'\]/.test(medidor),
  'y las dos se miden también con la cuenta de quien terminó',
);

/* ═══ Y NO ACUSA A LA CASA DE LO QUE NO PUDO CONSULTAR ═════════════════════
 *
 * `cierreDeCuentas` tiene la distinción escrita en su firma: «`null` significa
 * "no las traje", no "no tuvo ninguna"». Y con `[]` la pantalla afirma: «Te
 * dimos 0 de las 3 sesiones que te prometimos. La garantía corre.»
 *
 * `sesionesDe` devolvía ese vacío en los TRES casos en los que no puede saber:
 * sin base, sin id, o con la consulta fallando. En el modo sin base —el modo
 * en el que la app anda cuando la red no está— la app le decía a todos los
 * clientes que la casa no cumplió. Y al revés: un incumplimiento real quedaba
 * indistinguible de una consulta caída.
 *
 * Es la pantalla donde se ofrece la renovación. Lo que diga ahí sobre si cada
 * uno cumplió su parte tiene que ser un hecho, no la ausencia de un dato.
 */
/* ═══ Y «TODO TU TRABAJO QUEDA ACÁ» SE CUMPLE ══════════════════════════════
 *
 * El subtítulo lo promete y la pantalla mostraba un número: las jornadas
 * hechas. Lo que el cliente construyó en noventa días —su método, su oferta,
 * su precio, su promesa— vive en su ADN y no aparecía acá, que es donde decide
 * si sigue.
 *
 * De los dos lados que esta pantalla pone sobre la mesa, el de lo que falta
 * tenía una cita con línea de oro y una lista de ocho días; el de lo que hizo,
 * una cifra sola.
 */
console.log('\n── lo que selló está a la vista, con sus palabras ──');
ok(
  /Lo que sellaste/.test(cierre) && /resumenADN\(\)/.test(cierre),
  'el cierre muestra cuántas piezas de su ADN quedaron selladas',
);
ok(
  /contenidoDePieza\(p\)/.test(cierre),
  'y lo que dicen, con sus palabras y no con las nuestras',
);
/*
 * Cuatro y no catorce: las comerciales, que son las que sostienen la
 * conversación de la renovación. Una lista de catorce en un teléfono es un
 * muro.
 */
ok(
  /COMERCIALES = \['metodo', 'oferta', 'precio', 'puv'\]/.test(cierre),
  'son las cuatro comerciales, no las catorce',
);
ok(
  /if \(resumen\.selladas === 0\) return null;/.test(cierre),
  'y si no selló ninguna el bloque no aparece: no se promete lo que no hay',
);

console.log('\n── no saber no es no haber ──');
const datos = leer('src/lib/sesionesDatos.ts');
ok(
  /Promise<Sesion\[\] \| null>/.test(datos),
  'sesionesDe puede decir «no pude consultar»',
);
ok(
  /if \(!s \|\| !clienteId\) return null;/.test(datos)
  && /if \(error \|\| !data\) return null;/.test(datos),
  'y lo dice sin base, sin id y con la consulta caída',
);
ok(
  !/setSesiones\(\[\]\)/.test(cierre),
  'el cierre no da por cero lo que no consultó',
);
const panelEquipo = leer('src/components/admin/AcompanamientoDelCliente.tsx');
ok(
  !/catch\(\(\) => \{ if \(vivo\) setSesiones\(\[\]\); \}\)/.test(panelEquipo),
  'y la vista del equipo tampoco, que es donde se decide si la garantía corre',
);

console.log(fallas === 0 ? '\n✓ el final del camino se lee en un teléfono\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
