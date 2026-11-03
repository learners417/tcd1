/**
 * prueba-el-nombre-y-las-cifras.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Dos cosas que se vieron MIRANDO las capturas, no midiendo, y que después se
 * volvieron lentes. Esta prueba cuida la parte que un lente no alcanza: la
 * regla de CSS y los restos de tema oscuro escritos en estilo en línea.
 *
 * LAS CIFRAS DEL SERIF
 *
 * Cormorant Garamond —el serif de la casa— trae cifras de ESTILO ANTIGUO por
 * defecto: el 1 y el 2 se dibujan a la altura de la x. «Tu semana 11» se leía
 * «Tu semana ɪɪ», como romanos, y los rangos del Camino —«Días 15 a 33»,
 * «Días 48 a 90»— perdían sus números. En una app que se lee por días, y
 * pensada para TDAH, un número que hay que descifrar no es un número.
 *
 * Se arregla en la raíz, no lugar por lugar: el display se aplica desde
 * decenas de sitios y varios con estilo en línea, donde ninguna clase llega.
 *
 * LA PANTALLA QUE DICE SU NOMBRE DOS VECES
 *
 * Cinco de catorce lo hacían, y es un defecto que creó esta misma casa: al
 * poner el nombre de la pantalla en la barra de arriba, las páginas ya tenían
 * el suyo y nadie sacó el de abajo. Lo primero que leía el cliente era la
 * misma palabra dos veces, justo donde hace más falta el aire.
 *
 * EL TEMA OSCURO QUE SE FILTRA
 *
 * Las clases de tema oscuro —`bg-black/20`, `text-white/55`— están remapeadas
 * en `index.css` para el papel. Un color escrito en un `style` en línea NO se
 * puede remapear, y ahí sobrevivieron dos: el anillo del entrenador bloqueado
 * en blanco al diez por ciento —invisible sobre crema, por eso los ocho se
 * veían como el círculo gris de cualquier app— y el día en cero del Diario en
 * blanco al seis, que hacía imposible distinguir «ese día estuve en cero» de
 * «ese día no existe».
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const crudo = (p: string) => readFileSync(join(raiz, p), 'utf8');

/*
 * Sin comentarios.
 *
 * Esta casa escribe en el código lo que encontró, con el valor viejo adentro:
 * «era `rgba(255,255,255,0.10)`, blanco al diez por ciento sobre crema». Una
 * prueba que lee el archivo entero encuentra ese texto y se da por rota.
 * Ya pasó antes acá. Se miden las líneas que ejecutan, no las que explican.
 */
const leer = (p: string) => crudo(p)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const css = leer('src/index.css');
const medidor = leer('scripts/medir-app.py');

console.log('\n── las cifras del serif, a su altura ──');
ok(
  /html \{ font-variant-numeric: lining-nums; \}/.test(css),
  'la regla vive en la raíz y se hereda, no lugar por lugar',
);
/*
 * Pedir solo `tabular-nums` REEMPLAZA el valor heredado y devuelve las cifras
 * al estilo antiguo. Las columnas de números las quieren alineadas Y altas.
 */
ok(
  /\.num-tab \{ font-variant-numeric: lining-nums tabular-nums;/.test(css),
  'y las columnas de números piden las dos cosas, no solo la tabular',
);
ok(
  /cifrasBajas/.test(medidor) && /lining-nums/.test(medidor),
  'el medidor tiene su lente: un número en el serif sin numerales altos',
);

console.log('\n── la pantalla no dice su nombre dos veces ──');
ok(
  /nombreDoble/.test(medidor) && /header h1, header h2/.test(medidor),
  'el medidor compara la barra de arriba con el primer encabezado del contenido',
);
/*
 * Las cinco que lo hacían. Se mide que el encabezado repetido no esté, no que
 * la pantalla quedó muda: cada una abre ahora con lo que hace.
 */
const sinRepetir: Array<[string, string, RegExp]> = [
  ['Entrenadores', 'src/pages/Agentes.tsx', /<h1[^>]*>\s*(<[^>]+\/>)?\s*Entrenadores\s*<\/h1>/],
  ['Tu Mentor', 'src/pages/Coach.tsx', /<h2[^>]*>\s*Tu Mentor\s*<\/h2>/],
  ['Mi Clínica', 'src/pages/MiClinica.tsx', /<h1[^>]*>\s*Mi Clínica\s*<\/h1>/],
  ['Creador de Contenido', 'src/pages/CreadorContenido.tsx', /<h1[^>]*>\s*Creador de Contenido\s*<\/h1>/],
  ['Mi número, hoy', 'src/components/numero/NumeroPanel.tsx', /<h2[^>]*>Mi número, hoy<\/h2>/],
  /*
   * El sexto apareció en la corrida completa y no en la primera sonda: con la
   * cuenta llena el Diario abre con «Entrada del día completada», así que la
   * repetición solo se ve con el día sin escribir. Una sonda que mira un solo
   * estado mide un solo estado.
   */
  ['Diario del Fundador', 'src/pages/DiarioDirector.tsx', /<h1[^>]*>[\s\S]{0,80}Diario del Fundador\s*<\/h1>/],
];
for (const [nombre, ruta, patron] of sinRepetir) {
  ok(!patron.test(leer(ruta)), `«${nombre}» ya no se repite debajo de la barra`);
}
/*
 * Y el robot se fue con el encabezado de Entrenadores. Es el signo más gastado
 * que existe para decir «IA», y esa pantalla presenta a ocho entrenadores con
 * nombre, voz y oficio: un robot arriba de todo los convierte en software.
 */
const agentes = leer('src/pages/Agentes.tsx');
ok(
  !/<Bot[\s/>]/.test(agentes) && !/^\s+Bot,$/m.test(agentes),
  'y el robot del encabezado se fue, con su import',
);

console.log('\n── y pedir tabular no devuelve las cifras al estilo antiguo ──');
/*
 * `font-variant-numeric: tabular-nums` a secas REEMPLAZA el valor heredado.
 * Así salía el precio de la renovación —«97 dólares al mes»— con el 9 y el 7 a
 * la altura de la x. Pasaba en cinco estilos en línea y en la utilidad de
 * Tailwind, que emite la propiedad sola.
 */
ok(
  /^\.tabular-nums \{ font-variant-numeric: lining-nums tabular-nums; \}$/m.test(css),
  'la utilidad de Tailwind pide las dos, y va sin capa para vencerlas',
);
const conTabular = ['src/components/PasesDeRenovacion.tsx', 'src/components/CierreDelCamino.tsx',
  'src/components/EspejoIdentidadModal.tsx', 'src/components/SieteLibertades.tsx'];
for (const ruta of conTabular) {
  const s = leer(ruta);
  ok(
    !/fontVariantNumeric: 'tabular-nums'/.test(s),
    `${ruta.split('/').pop()} no pide tabular a secas`,
  );
}

console.log('\n── los primeros diez minutos, medidos ──');
/*
 * El wizard de bienvenida abre con `onboarding_completed === false`, y la
 * semilla del medidor nunca escribía ese campo: quedaba `undefined`, la
 * condición daba falso y el wizard no se mostraba. La primera pantalla que ve
 * quien acaba de pagar no se midió nunca, en sesenta y siete vistas.
 *
 * Y tenía el candado en un cuadrado de ORO MACIZO: lo más saturado de la
 * pantalla, en lo primero que se ve, contra la regla que dice «nunca relleno».
 * El lente del oro solo miraba CONTROLES, y eso es un div.
 *
 * Después se vio que el medidor abría SOLO el primer paso —el de la
 * contraseña— y que los otros nueve seguían sin medirse. Uno de ellos,
 * `situacion`, ni siquiera se podía abrir. Ahora el medidor recorre el wizard
 * entero como el cliente, así que la vara sube de «la bienvenida se mide» a
 * «se miden sus diez pasos».
 */
ok(
  /bienvenida=True/.test(medidor) && /def avanzar_wizard/.test(medidor)
    && /'bienvenida' if i == 1 else f'bienvenida>\{i\}'/.test(medidor),
  'los diez pasos de la bienvenida son vistas del medidor',
);
ok(
  /if \(bienvenida\) perfil\.onboarding_completed = false;/.test(medidor),
  'y la semilla escribe lo que abre el wizard',
);
const wizard = leer('src/components/WelcomeWizard.tsx');
ok(
  !/rounded-2xl bg-gold flex/.test(wizard),
  'el candado ya no va en un cuadrado de oro macizo',
);
ok(
  !/blur-\[150px\]/.test(wizard),
  'y los dos globos de oro difuminados se fueron',
);
/*
 * Y el lente ahora mira el oro macizo fuera de los botones. Se lo vio cazar:
 * con el `bg-gold` devuelto, reporta «DIV (no es botón · rgb(142, 104, 36))».
 */
ok(
  /if \(!esBoton && b\.width >= 24 && b\.height >= 24\)/.test(medidor),
  'el lente del oro mira también lo que no es un botón',
);
/*
 * El copy abría una duda que no existía: «la contraseña temporal que te
 * enviamos ya no va a funcionar después de esto». En positivo dice lo mismo
 * sin sembrar nada.
 */
ok(
  !/ya no va a funcionar/.test(wizard) && /Desde ahora entras con la tuya/.test(wizard),
  'y el copy de la contraseña va en positivo',
);

console.log('\n── el tema oscuro no se filtra por el estilo en línea ──');
/*
 * Las clases están remapeadas en index.css; un color escrito en un `style` no.
 * Se vigilan los dos que se encontraron, que son los que se veían.
 */
ok(
  /\[data-theme="light"\] \.bg-black\\\/20/.test(css) && /\[data-theme="light"\] \.text-white\s/.test(css),
  'las clases de tema oscuro siguen remapeadas para el papel',
);
ok(
  !/rgba\(255,\s*255,\s*255,\s*0\.10\)/.test(agentes),
  'el anillo del entrenador que todavía no se abrió es la línea de la casa, no blanco al 10%',
);
ok(
  /borderColor: unlocked \? ident\.anillo : 'var\(--line2/.test(agentes),
  'y cada entrenador muestra el anillo de color que tiene declarado',
);
const diario = leer('src/pages/DiarioDirector.tsx');
ok(
  !/rgba\(255,255,255,0\.06\)/.test(diario),
  'el día en cero del Diario se ve: es una ranura vacía, no nada',
);
ok(
  !/#22C55E/.test(diario) && /var\(--tilde/.test(diario),
  'y el día bueno usa el verde del tilde, no el verde brillante de la librería',
);

console.log('\n── y las cinco etiquetas entran en el teléfono más chico ──');
/*
 * «Entrenadores» son doce letras y mide 98 px a 15, el piso de la casa. A 320
 * —el piso de los Android chicos— las cinco pedían 334 de los 316 que quedan,
 * así que la última se iba de la pantalla: Contacto, la única forma de llegar
 * al equipo. Y el título de arriba pedía 103 en 90 y salía con puntos
 * suspensivos.
 *
 * Lo que cede es la palabra, no el cuerpo: bajar la letra rompía el piso de 15
 * en la barra y el de 20 del serif en el título. El nombre completo queda
 * declarado y el menú lateral, que tiene 256 px, lo muestra entero.
 */
const barra = leer('src/components/BottomTabBar.tsx');
ok(
  /label: 'Entrenar', nombreCompleto: 'Entrenadores'/.test(barra),
  'la barra de abajo dice «Entrenar» con el nombre completo declarado',
);
const topbar = leer('src/components/Topbar.tsx');
ok(
  /entrenadores: 'Entrenar',/.test(topbar),
  'y la de arriba lo declara entre sus formas cortas, como «Contacto»',
);
ok(
  /text-xl leading-tight text-cream una-linea/.test(topbar),
  'el título sigue a 20 px: el serif de display no baja de ahí',
);
const lateral = leer('src/components/Sidebar.tsx');
ok(
  /label: 'Entrenadores'/.test(lateral),
  'y el menú lateral, donde hay ancho, dice el nombre completo',
);
ok(
  /ANCHO_ANGOSTO = 320/.test(medidor),
  'y el medidor garantiza los 320, no los 360',
);

console.log('\n── y el candado dejó de pedir permiso ──');
/*
 * Estaba pegado al nombre: «Caro 🔒». Un «no» a dos centímetros de la línea
 * que ya explica, en positivo, qué lo abre. Esta casa ya había decidido lo
 * mismo para la barra de abajo: sin huecos, sin candados.
 */
ok(
  !/\{!unlocked && <Lock className="w-4 h-4 text-white\/55 shrink-0" \/>\}/.test(agentes),
  'el nombre del entrenador ya no lleva un candado al lado',
);
ok(
  /Se abre cuando|Se abre con/.test(agentes) || /reason/.test(agentes),
  'lo que lo abre se dice en positivo, que es lo que la tarjeta ya hacía',
);

console.log(fallas === 0
  ? '\n✓ el nombre se dice una vez y los números se leen\n'
  : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
