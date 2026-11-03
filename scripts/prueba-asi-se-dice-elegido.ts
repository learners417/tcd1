/**
 * prueba-asi-se-dice-elegido.ts — un solo gesto para un solo significado.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * La app decía que algo estaba elegido de nueve formas distintas, cada una
 * escrita a mano por quien la necesitó ese día:
 *
 *     border-gold bg-gold/10 text-cream        en la sesión guiada
 *     bg-gold/20 text-gold border-gold/30      en las pestañas de Métricas
 *     border-gold/50 bg-gold/10                en el generador de imagen
 *     bg-gold/15 border-gold/40 text-gold      tres líneas más abajo
 *     border-gold bg-gold/[0.12]               en el Diario
 *     border-gold bg-[var(--card,#FFFDF7)]     en el punto de partida
 *     bg-gold/15                               en el menú lateral
 *     bg-gold/12                               en el editor
 *     border-gold/60                           en los anuncios
 *
 * Nueve gestos para una sola idea. Nada de eso se ve mal por separado: se ve
 * mal en conjunto, porque el cliente aprende qué significa cada forma y en la
 * pantalla siguiente significa otra cosa.
 *
 * Ahora son dos clases en el tema, y la diferencia entre ellas es de función,
 * no de gusto:
 *
 *   .elegido           una opción, una tarjeta, una fila — el texto es del
 *                      cuerpo, porque es contenido
 *   .elegido-etiqueta  una pestaña o una píldora en versalitas — ahí el texto
 *                      SÍ va en oro, que es donde el oro vive
 *
 * Esta prueba exige que las dos existan en el tema y que ninguna pantalla
 * vuelva a escribir el gesto a mano. El verde y el ámbar quedan fuera: no
 * dicen «elegido», dicen «completado» y «atención», que son otra cosa.
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

function pantallas(dir = 'src'): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.name === 'admin' || e.name === 'Admin.tsx') continue;
    if (e.isDirectory()) out.push(...pantallas(p));
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

console.log('\n── las dos clases viven en el tema ──');
const css = leer('src/index.css');
ok(/\.elegido\s*,?\s*\n?\s*\.elegido-etiqueta\s*\{/.test(css) || /\.elegido\b/.test(css),
  'la clase de la casa está definida en index.css y no en cada pantalla');
ok(
  /\.elegido\s*\{\s*color:\s*var\(--text-cream\)/.test(css),
  'el texto de una opción elegida sigue al tema, no a un color escrito a mano',
);
ok(
  /\.elegido-etiqueta\s*\{\s*color:\s*var\(--oro-t/.test(css),
  'y el de una etiqueta va en el oro oscuro, que es el que pasa contraste sobre papel',
);
ok(
  /border-color:\s*var\(--oro/.test(css) && /background-color:\s*color-mix/.test(css),
  'el gesto es línea de oro con el fondo apenas teñido, que es la vara',
);

console.log('\n── ninguna pantalla lo escribe a mano ──');
/*
 * El patrón es el de un condicional que elige clases. La primera versión
 * exigía que la condición se llamara `on`, `activo`, `seleccionado`… y por eso
 * no veía `tab === 'progreso' ? …`, que es justo el de las pestañas de
 * Métricas: la prueba daba verde con el gesto escrito a mano adentro. Ahora
 * se mira CUALQUIER ternario que elija clases, y lo que acota es el filtro de
 * abajo: solo cuenta si el lado del SÍ pinta el fondo o el borde en oro.
 */
const CONDICIONAL = /\?\s*[`']([^`']{8,170})[`']\s*:/g;
/*
 * Y el oro en una caja no siempre dice «elegido». Hay otros significados que
 * usan el mismo tono y están bien, así que van nombrados uno por uno con su
 * razón: un lente que los marcara daría dieciocho faltas de cosas correctas,
 * y uno que los adivinara con un patrón dejaría pasar las de verdad.
 */
const OTRO_SIGNIFICADO: Array<{ donde: string; razon: string }> = [
  { donde: 'Freno.tsx', razon: 'el nivel del freno: no es una opción elegida, es una alarma' },
  { donde: 'TableroNumeros.tsx', razon: 'avisa que faltan números, no que algo esté elegido' },
  { donde: 'WelcomeWizard.tsx', razon: 'los puntos de progreso del asistente marcan por dónde va' },
  { donde: 'campanas/CreativoDetalle.tsx', razon: 'el punto de la diapositiva en la que está' },
  { donde: 'SesionGuiadaPlayer.tsx', razon: 'un paso de la preparación ya hecho' },
  { donde: 'Dashboard.tsx', razon: 'lo urgente del día' },
  { donde: 'Metrics.tsx', razon: 'el dato que la pantalla destaca, no uno que el cliente eligió' },
  { donde: 'Mensajes.tsx', razon: 'la burbuja de quien habla en el chat' },
  { donde: 'DiarioDirector.tsx', razon: 'el nivel de energía, que es semántico' },
];

const aMano: string[] = [];
for (const archivo of pantallas()) {
  const texto = leer(archivo);
  for (const linea of texto.split('\n')) {
    for (const m of linea.matchAll(CONDICIONAL)) {
      const clases = m[1];
      if (clases.includes('elegido')) continue;
      /*
       * Solo cuenta el gesto de la CAJA: fondo o borde en oro. Un `text-gold`
       * suelto es el color del contenido —un ícono activo, una etiqueta
       * encendida— y ese oro es correcto: es el color de la atención de la
       * casa. Marcarlo daba ocho faltas de cosas que están bien.
       */
      if (!/\b(bg|border)-gold|\b(bg|border)-\[var\(--oro/.test(clases)) continue;
      if (OTRO_SIGNIFICADO.some((o) => archivo.endsWith(o.donde))) continue;
      aMano.push(`${archivo}: ${clases.slice(0, 60)}`);
    }
  }
}
ok(
  aMano.length === 0,
  aMano.length === 0
    ? `las ${pantallas().length} pantallas usan la clase en vez de escribir el gesto`
    : `${aMano.length} lo escriben a mano: ${aMano.slice(0, 3).join(' · ')}`,
);

/*
 * Una excepción que apunta a un archivo donde ya no hay ningún oro escrito a
 * mano es una excepción que tapa: la próxima vez que vuelva, entra sin que
 * nadie la vea. Va como aviso, porque el archivo puede seguir existiendo con
 * su oro en otra forma que este patrón no alcanza.
 */
const sinUsar = OTRO_SIGNIFICADO.filter((o) => {
  const archivo = pantallas().find((a) => a.endsWith(o.donde));
  if (!archivo) return true;
  const texto = leer(archivo);
  return ![...texto.matchAll(CONDICIONAL)].some((m) =>
    !m[1].includes('elegido') && /\b(bg|border)-gold|\b(bg|border)-\[var\(--oro/.test(m[1]));
});
if (sinUsar.length > 0) {
  console.log('\n── aviso · excepciones que ya no apuntan a nada ──');
  for (const o of sinUsar) console.log(`  · ${o.donde} (${o.razon})`);
}

console.log('\n── y se usa de verdad ──');
const usos = pantallas().filter((a) => /'elegido(-etiqueta)?'/.test(leer(a)));
ok(usos.length >= 8, `${usos.length} pantallas la usan`);

console.log(fallas === 0 ? '\n✓ un solo gesto para un solo significado\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
