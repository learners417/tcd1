/**
 * prueba-la-piel-de-la-conversacion.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * LA LÍNEA DE 1PX, QUE ERA CASI NEGRA EN CASI TODA LA APP
 *
 * «Oro mate solo en líneas de 1px, versalitas y numerales.» La línea es el
 * centro del sistema. La app la escribía así:
 *
 *     border-[var(--line, rgba(142,104,36,0.18))]
 *
 * y eso NO es una clase. Dentro de los corchetes un espacio literal termina
 * el nombre, así que el navegador recibe dos clases sueltas y ninguna declara
 * color: el borde se queda en `currentColor`, que en el tema claro es la
 * tinta, #2B2724. Doscientos veinticuatro bordes estaban así — la línea bajo
 * el encabezado del Mentor, la de cada panel, la del campo donde se escribe.
 *
 * Se supo midiendo el color CALCULADO en el navegador: daba la tinta y no el
 * respaldo de oro, y eso es lo que delata que la propiedad nunca se declaró.
 * Las mismas clases sin el espacio —`border-[var(--line2,#DFD3BC)]`, 44
 * usos— sí funcionaban, y por eso convivían las dos cosas sin que se notara.
 *
 * ═══ Y LA PANTALLA DONDE EL CLIENTE CONVERSA ═══
 *
 * El Mentor es el botón que está en las 23 pantallas, y su pantalla era la
 * que más lejos estaba de la vara:
 *
 *   · las burbujas con sombra de negro puro al 30 y al 35% —siete veces la
 *     de la casa— porque `--shadow-card` es del tema oscuro y no se
 *     redefinía en el claro, así que todo lo que la usa por token se queda
 *     con el negro sobre el papel;
 *   · la burbuja del cliente en oro macizo, que es la superficie más grande
 *     de una conversación;
 *   · el botón de enviar, un círculo de oro con el oro escrito a mano como
 *     valor arbitrario, así que ninguna regla del tema lo alcanzaba;
 *   · los tres atajos comprimidos a cuatro renglones cada uno («Volví /
 *     después / de unos / días») porque el flex no desborda, comprime: a la
 *     tira le faltaba `shrink-0`;
 *   · el campo donde se escribe DEBAJO de las pestañas, porque el alto del
 *     chat era `100vh - 8rem`, un número redondo que no corresponde a nada;
 *   · un encabezado de cuatro renglones en mayúsculas, con dos retratos
 *     seguidos para una sola voz y una chispa verde flotando en el medio;
 *   · y «Tu coach está conectando ideas...», con la palabra que la casa
 *     tiene prohibida, en el aviso que se lee cada vez que el Mentor tarda.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const css = leer('src/index.css');
const coach = leer('src/pages/Coach.tsx');
const medidor = leer('scripts/medir-app.py');

console.log('\n── la línea tiene color ──');
ok(
  /\[class\*="border-\[var\(--line,"\]/.test(css),
  'las clases que el espacio de la coma partió en dos reciben su color igual',
);
ok(
  /border-color: var\(--line2, rgba\(142, 104, 46?, ?0?\.?3?0?\)\)|border-color: var\(--line2/.test(css),
  'y la línea segunda recibe el suyo, que es un tono más marcado',
);
ok(
  /r\.lineaTinta\.push/.test(medidor) && /cb === cs\.color/.test(medidor),
  'el medidor caza el síntoma: un borde pintado exacto del color de su propio texto',
);
/*
 * Por el síntoma y no por la clase: un borde de otro color puede ser a
 * propósito —el verde de «Autónoma», el rojo de un aviso—, pero del color
 * exacto del texto no lo elige nadie.
 */
ok(
  /nadie lo elige a propósito/.test(medidor),
  'y el lente dice por qué mide el síntoma y no la clase',
);

console.log('\n── las sombras son de la casa ──');
ok(
  /--shadow-card: var\(--sombra\);/.test(css),
  '`--shadow-card` apunta a la sombra de la casa en vez de al negro del tema oscuro',
);
ok(
  /--shadow-float: 0 2px 6px rgba\(42, 33, 24/.test(css),
  'y el flotante tiene más cuerpo, pero en la misma tierra',
);
/*
 * La regla que pasa `shadow-md/lg/xl/2xl` a `--sombra` ya estaba: esto cierra
 * la otra puerta, la del token, que es por donde entraban las burbujas.
 */
ok(
  /\[data-theme="light"\] #root :is\(\[class~="shadow-md"\]/.test(css),
  'la puerta de las clases sigue cerrada: las dos vías llevan a la misma sombra',
);

console.log('\n── y hay un solo gesto para «esto lo dije yo» ──');
ok(
  /\.burbuja-mia \{/.test(css),
  '`.burbuja-mia` declara una vez la línea de oro y el fondo apenas teñido',
);
/*
 * Cuatro conversaciones —el Mentor, cada entrenadora, el Asesor de Montaje y
 * Contacto— y cada una lo decía a su manera: dos en oro macizo (una de ellas
 * con texto blanco encima, que es lo que peor se leía) y dos con el mismo
 * gesto separado por cinco puntos de opacidad.
 */
const conChat = ['src/pages/Coach.tsx', 'src/pages/Agentes.tsx',
                 'src/components/campanas/AsesorDeMontaje.tsx', 'src/pages/Mensajes.tsx'];
const usanElGesto = conChat.filter((a) => /burbuja-mia/.test(leer(a)));
ok(
  usanElGesto.length === 4,
  usanElGesto.length === 4
    ? 'y las cuatro conversaciones de la app lo usan'
    : `solo ${usanElGesto.length} de 4: falta ${conChat.filter((a) => !usanElGesto.includes(a)).join(', ')}`,
);
const conOroMacizo = conChat.filter((a) => /bg-gold text-(ink|white)/.test(leer(a)));
ok(
  conOroMacizo.length === 0,
  conOroMacizo.length === 0
    ? 'ninguna rellena de oro la burbuja, que es la superficie más grande del chat'
    : `todavía en oro macizo: ${conOroMacizo.join(', ')}`,
);

console.log('\n── y el chat entra en el teléfono ──');
ok(
  /100dvh - 3\.5rem - 1\.5rem - 5\.25rem/.test(coach),
  'el alto del chat suma las barras que ya están declaradas, no un número redondo',
);
ok(
  /env\(safe-area-inset-bottom, 0px\)\)/.test(coach) && /100dvh/.test(coach),
  'y usa `dvh`, porque en el teléfono la barra del navegador aparece y desaparece',
);
ok(
  !/h-\[calc\(100vh-8rem\)\]/.test(coach),
  'ya no mide `100vh - 8rem`, que dejaba el campo de escribir debajo de las pestañas',
);
ok(
  /shrink-0 whitespace-nowrap px-3\.5/.test(coach),
  'los atajos miden lo que mide su frase y la tira se desplaza de costado',
);
ok(
  /var\(--tinta-boton, #2A2118\)/.test(coach),
  'el botón de enviar es el bloque de tinta de la casa',
);
ok(
  !/bg-\[var\(--oro-d,#8E6824\)\]/.test(coach),
  'y ya no un círculo de oro con el oro escrito a mano, que ninguna regla alcanzaba',
);

console.log('\n── y el encabezado dice una cosa, en una línea ──');
const enPantalla = coach
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
  .replace(/\/\/[^\n]*/g, ' ');
ok(
  !/Mentor IA/.test(enPantalla),
  'la pantalla se llama «Tu Mentor», igual que la barra, el buscador y las pestañas',
);
ok(
  !/Tu guía del camino · conoce tu ADN completo/.test(enPantalla),
  'y la bajada en mayúsculas de tres renglones salió',
);
ok(
  !/Sparkles className="w-3 h-3 text-success"/.test(enPantalla),
  'y la chispa verde, que flotaba en el medio del bloque sin alinear a nada',
);
ok(
  !/Tu coach está conectando/.test(enPantalla),
  'y el aviso de que está pensando no usa una palabra prohibida',
);

console.log('\n── los campos de escribir no muestran la agarradera del sistema ──');
/*
 * El triangulito gris de la esquina es un adorno del navegador, y se veía en
 * la mitad de los campos: 38 fuera del Admin y solo 19 con `resize-none`
 * escrito a mano. En una pantalla cuidada es lo único que delata que es un
 * formulario. El default pasa a ser el cuidado; estirar a mano se pide.
 */
ok(
  /textarea \{ resize: none; \}/.test(css),
  'ningún campo de escribir muestra la agarradera, sin tener que escribirlo 38 veces',
);
ok(
  /textarea\[class~="resize-y"\] \{ resize: vertical; \}/.test(css),
  'y el que necesita estirarse lo pide: la excepción se escribe',
);

console.log('\n── las entrenadoras no nombran códigos ──');
/*
 * El contexto que gobierna a las ocho entrenadoras decía «referite a cada
 * cosa por su paso de El Camino» y les daba la lista: P0.2, P2.3, P4.2b. Dos
 * cosas mal en un renglón: les enseñaba a decirle al cliente un código que no
 * significa nada, y estaba escrito en voseo dos líneas arriba de «TRATO:
 * háblale de tú, siempre».
 */
const agentes2 = leer('src/pages/Agentes.tsx');
ok(
  /NO se lo digas nunca/.test(agentes2),
  'el código del paso es referencia interna: la instrucción dice que no se nombra',
);
const vose = [...agentes2.matchAll(/\b(referite|fijate|tenés|podés|querés|sabés|mandá|anotá|preguntá|armá|poné|elegí|sos)\b/g)];
ok(
  vose.length === 0,
  vose.length === 0
    ? 'y está escrita en el castellano de la casa, igual que lo que ordena'
    : `escrita en voseo: ${vose.map((m) => m[1]).join(', ')}`,
);

console.log('\n── y la prueba del vocabulario ve las frases cortas ──');
const vocab = leer('scripts/prueba-el-vocabulario-de-la-casa.ts');
ok(
  /s\.trim\(\)\.split\(\/\\s\+\/\)\.length >= 3 && \/\[áéíóúñ¿¡\]\/i\.test\(s\)/.test(vocab),
  'tres palabras con una tilde también cuentan como frase: con dos de estructura se escapaba «Tu coach está…»',
);

console.log(fallas === 0 ? '\n✓ la conversación tiene la piel de la casa\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
