/**
 * prueba-la-barra-tiene-nombre.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * EL NOMBRE DE LA PANTALLA, QUE NO SE VEÍA EN NINGUNA
 *
 * La barra de arriba tiene un `justify-between` con dos grupos: el título a
 * la izquierda y los botones a la derecha. El de la derecha lleva `shrink-0`;
 * el del título llevaba solo `min-w-0`, que lo deja achicarse pero no le
 * reserva nada. Así que la derecha se quedaba con TODO y el título con cero.
 *
 * Medido en la barra de verdad, a 390 píxeles: el grupo de la derecha ocupaba
 * 355 de los 358 útiles y el h1 tenía `clientWidth` 0. El nombre de la
 * pantalla no se veía en ninguno de los catorce destinos.
 *
 * Lo que llenaba la barra era el contador de créditos —130 píxeles— que
 * decía «0 créditos» y estaba, según el comentario del código, «oculto via
 * flag mientras el sistema esta apagado». El flag apagaba solo si alguien
 * escribía `VITE_CREDITS_ENABLED=false`, y esa variable no está declarada en
 * ningún lado: en todo entorno estaba ENCENDIDO. Tres cosas al mismo tiempo,
 * y las tres del lado de quien paga: un contador en cero donde más jerarquía
 * hay, un sistema sin terminar a la vista, y ninguna pantalla con nombre.
 *
 * Y había 53 píxeles más en la inicial del cliente dentro de un círculo, que
 * no es un botón: no tiene acción, y al tocarla no pasa nada.
 *
 * ═══ Y EL SERIF, QUE NO OBEDECÍA SUS PROPIAS CLASES ═══
 *
 * `h1, h2, h3 { font-family: display; font-style: italic }` estaba FUERA de
 * capas, y una regla sin capa vence a cualquier capa —utilities incluida—,
 * así que en un encabezado las clases `font-sans` y `not-italic` no hacían
 * nada. Dos lugares lo pedían y ninguno lo conseguía: el título de la barra
 * salía en itálica pidiendo `not-italic`, y el nombre de cada entrenadora
 * salía en la Garamond de display a 18 px pidiendo `font-sans`.
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

const topbar = leer('src/components/Topbar.tsx');
const css = leer('src/index.css');
const flags = leer('src/lib/featureFlags.ts');
const medidor = leer('scripts/medir-app.py');

console.log('\n── el título reclama su lugar ──');
ok(
  /md:hidden flex flex-1 items-center/.test(topbar),
  'el grupo del título lleva `flex-1`: toma el hueco en vez de esperar que sobre',
);
/*
 * `min-w-0` sin `flex-1` es justamente la combinación que lo dejaba en cero:
 * se puede achicar hasta nada y nada le está reservado.
 */
ok(
  !/md:hidden flex items-center gap-1\.5 min-w-0/.test(topbar),
  'y ya no es `flex` a secas, que es lo que lo dejaba en cero',
);

console.log('\n── y hay lugar para que entre ──');
ok(
  /VITE_CREDITS_ENABLED === 'true'/.test(flags),
  'lo que no está en uso se enciende a mano: el contador de créditos pide un «true» explícito',
);
ok(
  !/VITE_CREDITS_ENABLED !== 'false'/.test(flags),
  'y ya no se enciende por omisión, que es lo que lo ponía en las 23 pantallas',
);
/*
 * El avatar del teléfono: 53 píxeles para una inicial que no se toca. Queda
 * en pantalla grande, donde el lugar sobra y acompaña a «Tu cuenta».
 */
const avatar = topbar.slice(topbar.indexOf("localStorage.getItem('tcd_avatar')") - 600,
                            topbar.indexOf("localStorage.getItem('tcd_avatar')"));
ok(
  /hidden md:flex items-center gap-2 pl-4/.test(avatar),
  'la inicial del cliente —que no es un botón— queda en pantalla grande',
);

console.log('\n── el título entra en el teléfono más chico ──');
/*
 * Medido a 360 px de ancho, que es el teléfono más chico que la app aguanta:
 * al título le quedan 130 px. Los catorce nombres efectivos piden como
 * máximo 103 («Entrenadores»). Los tres que no entran tienen su forma corta
 * declarada en `TITULOS_CORTOS`, y esa es la razón por la que existen.
 */
ok(
  /text-xl leading-tight text-cream una-linea not-italic/.test(topbar),
  'el nombre de la pantalla va a 20 px, que es el piso de esta Garamond',
);
ok(
  /Al título le quedan 130 px/.test(topbar),
  'y el comentario dice el hueco medido, no el de una barra que ya no existe',
);

console.log('\n── una clase puede corregir al encabezado ──');
ok(
  /@layer base \{\s*\n\s*h1, h2, h3 \{/.test(css),
  'la regla de los encabezados vive en `base`, así que `font-sans` y `not-italic` la vencen',
);
/*
 * El nombre de la entrenadora era lo más débil de su propia tarjeta: 17 px de
 * display en oro, debajo de una descripción de 15 px en blanco. Más grande y
 * más clara la descripción que el nombre que la encabeza.
 */
const agentes = leer('src/pages/Agentes.tsx');
/*
 * Atado a la intención y no al tamaño: el nombre va en la letra de CUERPO y
 * al contraste pleno. Cuánto mide se decide al lado de la tarjeta —pasó de 18
 * a 20 cuando el nombre y el rol se separaron—, y una prueba que fija el
 * número falla por un cambio que no toca lo que protege.
 */
ok(
  /font-sans not-italic text-(lg|xl|2xl) font-semibold/.test(agentes)
  && /unlocked \|\| autonomo \? 'text-cream'/.test(agentes),
  'el nombre de la entrenadora va en la letra de cuerpo y al contraste pleno',
);
ok(
  !/text-sm font-medium \$\{\s*\n\s*autonomo/.test(agentes),
  'y ya no en display a 17 y en oro, que es donde leía más chico que su descripción',
);

console.log('\n── y el medidor mide las dos cosas ──');
ok(
  /r\.aplastado\.push/.test(medidor) && /'aplastado'/.test(medidor),
  'el lente `aplastado` caza el texto que el layout deja en cero de ancho',
);
/*
 * Era el peor punto ciego: `vis()` pide ancho > 0, así que lo aplastado no
 * entraba en NINGÚN lente. El caso más grave era el único que no se medía.
 */
ok(
  /bb\.height > 0 && bb\.width < 1/.test(medidor),
  'y lo distingue de lo ausente: tiene texto y alto en pantalla, y ancho cero',
);
ok(
  /const enCajaAlta = cs\.textTransform === 'uppercase'/.test(medidor),
  'el lente del serif chico deja fuera las versalitas: en caja alta no hay altura de x',
);

console.log('\n── y ninguna pantalla muestra códigos internos ──');
/*
 * «v8 · Herramienta nueva» —el número de versión del producto— y «Necesitas
 * completar P6 (Matriz A→B→C)»: un identificador de la base, y una jornada
 * que ya no existe en ningún tramo, así que la instrucción no se podía
 * seguir. Ahora el tramo se nombra desde el seed.
 */
const creador = leer('src/pages/CreadorContenido.tsx');
const enPantalla = creador
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
  .replace(/\/\/[^\n]*/g, ' ');
ok(
  !/Matriz A→B→C/.test(enPantalla),
  'el Creador ya no manda a cerrar una jornada que no existe',
);
ok(
  !/v8 · Herramienta nueva/.test(enPantalla),
  'ni muestra el número de versión del producto',
);
ok(
  /comoSeLlamaElTramo\(PILAR_LLAVE\)/.test(enPantalla),
  'nombra el tramo desde el seed, así sigue siendo verdad si el camino se reordena',
);
ok(
  /export function comoSeLlamaElTramo/.test(leer('src/lib/roadmapSeed.ts')),
  'y hay un solo lugar donde se decide cómo se le nombra un tramo al cliente',
);
ok(
  /Se abre al cerrar/.test(enPantalla),
  'y lo dice en positivo, con las palabras que el Camino usa en todas sus puertas',
);

console.log(fallas === 0 ? '\n✓ la barra tiene nombre y el serif obedece\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
