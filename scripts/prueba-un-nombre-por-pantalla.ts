/**
 * CADA PANTALLA DEL ADMIN SE LLAMA DE UNA SOLA MANERA
 *
 * ═══ DE DÓNDE SALE ═══
 *
 * El Admin tenía DOS listas de nombres para las mismas diecisiete pantallas:
 * `headerTitles`, que dibujaba el encabezado, y las etiquetas de las pestañas
 * del momento. Discrepaban en casi todas, y las dos se veían a la vez, a tres
 * centímetros una de otra:
 *
 *     pastilla «De un vistazo»   ·   encabezado «Supervisión»
 *     pastilla «Mi día»          ·   encabezado «Hoy»
 *     pastilla «Todos»           ·   encabezado «Clientes»
 *
 * Se borró la segunda lista. Esta prueba existe para que no vuelva: dos
 * listas de nombres para lo mismo no se desincronizan el día que nacen, se
 * desincronizan tres meses después, cuando alguien renombra una sola.
 *
 * ═══ QUÉ MIRA ═══
 *
 * Que `Admin.tsx` no tenga un diccionario de títulos por pestaña, y que el
 * encabezado salga del mismo lugar que la barra de los cuatro momentos.
 */
import { readFileSync } from 'node:fs';

const admin = readFileSync('src/pages/Admin.tsx', 'utf8');
let fallas = 0;

/* El diccionario borrado no vuelve. Se busca la forma, no el nombre: con otro
   nombre sería el mismo problema. */
const DICCIONARIO = /const\s+\w*[Tt]itle?s?\w*\s*:\s*Record<MainTab,\s*string>/;
if (DICCIONARIO.test(admin)) {
  fallas += 1;
  console.log('✗ volvió un diccionario de títulos por pestaña en Admin.tsx');
  console.log('   El nombre de cada pantalla vive en su pestaña y en ningún otro lado.');
}

/* Y el encabezado toma su texto de donde lo toma la barra. */
if (!admin.includes("sidebarItems.find((i) => i.id === momentoActual)?.label")) {
  fallas += 1;
  console.log('✗ el encabezado ya no saca su título de los momentos');
  console.log('   Si sale de otro lado, vuelve a haber dos nombres para lo mismo.');
}

if (!fallas) {
  console.log('✓ cada pantalla del Admin se llama de una sola manera');
  console.log('    el encabezado dice el momento · la pastilla dice la pantalla');
}
process.exit(fallas ? 1 : 0);
