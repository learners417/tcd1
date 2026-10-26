/**
 * prueba-un-destino-un-nombre.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * El nombre de cada destino se escribe en TRES lugares: la barra de arriba
 * (`PAGE_TITLES` en Topbar.tsx), el buscador (`destinos.ts`) y la barra de
 * abajo (`BottomTabBar.tsx`). Nada obligaba a que coincidieran, y no
 * coincidían:
 *
 *   mensajes   arriba «Soporte» · buscador «Acompañamiento» · abajo «Contacto»
 *   campanas   «Campañas» en dos lados y «Campañas y piezas» en el buscador
 *   creador    «Contenido» con mayúscula en un lado y minúscula en el otro
 *
 * El cliente toca «Contacto» abajo, la barra de arriba le dice «Soporte» y
 * el título de la pantalla «Acompañamiento»: tres palabras para el mismo
 * lugar, en la misma pantalla, al mismo tiempo. No es un detalle de
 * redacción — es la clase de cosa que hace que alguien no encuentre lo que ya
 * encontró ayer.
 *
 * Las formas CORTAS sí son legítimas: la barra del teléfono mide 56 píxeles y
 * comparte renglón con el botón del Mentor, así que «Creador de Contenido» no
 * entra y se escribe «Creador». Por eso tienen que estar declaradas en
 * `TITULOS_CORTOS`: declaradas son un sistema, sueltas son un desacuerdo.
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

/** Los archivos que pintan pantallas del cliente. El Admin tiene su vocabulario. */
function delCliente(dir = 'src'): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.name === 'admin' || e.name === 'Admin.tsx') continue;
    if (e.isDirectory()) out.push(...delCliente(p));
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}

const topbar = leer('src/components/Topbar.tsx');
const destinos = leer('src/lib/destinos.ts');
const tabs = leer('src/components/BottomTabBar.tsx');

/** Lo que hay entre `const NOMBRE` y el `};` que lo cierra. */
function bloque(texto: string, nombre: string): string {
  const i = texto.indexOf(`const ${nombre}`);
  if (i < 0) return '';
  return texto.slice(i, texto.indexOf('};', i));
}

const pares = (t: string, re: RegExp) => {
  const m = new Map<string, string>();
  for (const x of t.matchAll(re)) m.set(x[1], x[2]);
  return m;
};

const arriba = pares(bloque(topbar, 'PAGE_TITLES'), /(\w+): '([^']+)'/g);
const cortos = pares(bloque(topbar, 'TITULOS_CORTOS'), /(\w+): '([^']+)'/g);
const buscador = pares(destinos, /id: '([a-z-]+)', label: '([^']+)'/g);
const abajo = pares(tabs, /id: '([a-z-]+)', label: '([^']+)'/g);
/*
 * La barra de abajo escribe algunos nombres más cortos, porque con cinco
 * pestañas en 390 píxeles no entra «Acompañamiento» ni «El Camino». Esa
 * diferencia es legítima SI está declarada en el dato, con `nombreCompleto`.
 */
const completoAbajo = pares(tabs, /id: '([a-z-]+)', label: '[^']+', nombreCompleto: '([^']+)'/g);

console.log('\n── los tres lugares donde se escribe cada nombre ──');
ok(arriba.size >= 8, `la barra de arriba nombra ${arriba.size} destinos`);
ok(buscador.size >= 8, `el buscador nombra ${buscador.size}`);
ok(abajo.size >= 4, `la barra de abajo nombra ${abajo.size}`);

console.log('\n── y dicen lo mismo ──');
const enDesacuerdo: string[] = [];
for (const id of new Set([...arriba.keys(), ...buscador.keys(), ...abajo.keys()])) {
  const dichos = [arriba.get(id), buscador.get(id), abajo.get(id)].filter(Boolean) as string[];
  if (dichos.length < 2) continue;
  const distintos = new Set(dichos);
  if (distintos.size === 1) continue;
  /*
   * Una forma corta declarada explica UNA de las diferencias: la de abajo o
   * la de la barra. Lo que no explica es que los otros dos no coincidan.
   */
  const corto = cortos.get(id);
  const declarado = completoAbajo.get(id);
  const esLaFormaCortaDeAbajo = declarado !== undefined
    && declarado !== abajo.get(id)
    && dichos.filter((d) => d !== abajo.get(id)).every((d) => d === declarado);
  if (esLaFormaCortaDeAbajo) continue;
  const sinElCorto = new Set(dichos.filter((d) => d !== corto));
  if (sinElCorto.size <= 1) continue;
  enDesacuerdo.push(`${id}: ${[...distintos].join(' / ')}`);
}
ok(
  enDesacuerdo.length === 0,
  enDesacuerdo.length === 0
    ? 'cada destino se llama igual en la barra, en el buscador y en las pestañas'
    : `${enDesacuerdo.length} con nombres distintos: ${enDesacuerdo.join(' · ')}`,
);

console.log('\n── y la barra nombra todos los destinos ──');
/*
 * La comparación de arriba solo mira los destinos que están en DOS de los tres
 * lugares: si uno falta del todo en la barra, no hay nada que comparar y pasa
 * sin que nadie lo vea. Así quedó «Mi Clínica» sin título: el cliente veía la
 * flecha de volver, el botón del Mentor, y nada en el medio.
 */
const sinNombreArriba = [...buscador.keys()].filter((id) => !arriba.has(id) && !cortos.has(id));
ok(
  sinNombreArriba.length === 0,
  sinNombreArriba.length === 0
    ? `los ${buscador.size} destinos del buscador tienen su nombre en la barra`
    : `sin título en la barra: ${sinNombreArriba.join(', ')}`,
);

console.log('\n── y las formas cortas están declaradas ──');
ok(
  /LAS FORMAS CORTAS, Y POR QUÉ EXISTEN/.test(topbar),
  'TITULOS_CORTOS dice por qué existe, así se ve que la diferencia es a propósito',
);
/*
 * Una forma corta que no acorta nada —que es idéntica al nombre largo— es una
 * línea que ya no hace falta, y la que nombra un destino que no existe apunta
 * al vacío.
 */
const inutiles = [...cortos.entries()].filter(([id, c]) => arriba.get(id) === c);
const huerfanas = [...cortos.keys()].filter((id) => !arriba.has(id) && !buscador.has(id));
ok(huerfanas.length === 0, huerfanas.length === 0
  ? 'ninguna forma corta nombra un destino que no existe'
  : `apuntan al vacío: ${huerfanas.join(', ')}`);
if (inutiles.length > 0) {
  console.log(`  · aviso · ${inutiles.map(([id]) => id).join(', ')}: la forma corta es igual al nombre largo`);
}

console.log('\n── y el encabezado de la pantalla, que es el cuarto lugar ──');
/*
 * La comparación de arriba mira la barra, el buscador y las pestañas. Hay un
 * CUARTO: el título en display que la pantalla pinta adentro, que es el que
 * el cliente tiene delante mientras lee. Ahí sobrevivió el bug original —
 * Contacto arriba, Acompañamiento en el buscador y «Soporte» en el
 * encabezado—, más «Campañas & Creativos» en vez de «Campañas» y «Tu ADN» a
 * cien píxeles de «Mi ADN».
 */
const PANTALLAS: Array<[string, string]> = [
  ['adn', 'src/pages/ADN.tsx'],
  ['mensajes', 'src/pages/Mensajes.tsx'],
  ['campanas', 'src/pages/Campanas.tsx'],
];
const desacuerdoAdentro: string[] = [];
for (const [id, archivo] of PANTALLAS) {
  const vivo = readFileSync(join(raiz, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
  /* El encabezado: el primer título en la letra de display de la pantalla. */
  const m = vivo.match(/font-display[^>]*>([^<{][^<]{1,38})</);
  if (!m) continue;
  const dicho = m[1].trim();
  const nombres = [arriba.get(id), cortos.get(id), buscador.get(id), abajo.get(id)]
    .filter(Boolean) as string[];
  if (!nombres.includes(dicho)) {
    desacuerdoAdentro.push(`${id}: adentro «${dicho}», afuera ${[...new Set(nombres)].join(' / ')}`);
  }
}
ok(
  desacuerdoAdentro.length === 0,
  desacuerdoAdentro.length === 0
    ? 'el encabezado de cada pantalla dice uno de los nombres con que se llega a ella'
    : desacuerdoAdentro.join(' · '),
);

console.log('\n── y el posesivo no cambia de un renglón a otro ──');
/*
 * Los destinos de la casa son «Mi ADN», «Mi Número», «Mi Clínica». Y dentro
 * de esas mismas pantallas había «Tu ADN» en el encabezado —a cien píxeles de
 * la barra que dice «Mi ADN»—, «Tu número, hoy», «Tu ADN completo» en el
 * botón que abre el manual y «Tu ADN» en el Camino. El mismo nombre con el
 * posesivo cambiado, a veces dos veces en una pantalla.
 *
 * «Tu Clínica Digital» queda fuera: es el nombre de la app, no el del
 * destino «Mi Clínica». Y «tu clínica» en minúscula dentro de una frase es
 * una clínica, no un lugar de la app.
 */
const conMi = [...buscador.values(), ...arriba.values()]
  .filter((n) => /^Mi /.test(n))
  .map((n) => n.replace(/^Mi /, ''));
const cruzados: string[] = [];
for (const archivo of delCliente()) {
  const vivo = readFileSync(join(raiz, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    /* El nombre del producto, que no es el destino. */
    .replace(/Tu Clínica Digital/g, ' ');
  for (const nombre of new Set(conMi)) {
    /*
     * El texto COMPLETO entre `>` y `<`, no un comienzo: «Tu ADN» solo es un
     * rótulo —el nombre del lugar— cuando no sigue nada más. «Tu número lo
     * sacas hoy, en minutos» es una frase sobre la cifra, no sobre la
     * pantalla, y ahí el posesivo es el correcto.
     */
    const re = new RegExp(`>\\s*Tu ${nombre}\\s*<|>\\s*Tu ${nombre.toLowerCase()}\\s*<`, 'g');
    if (re.test(vivo)) cruzados.push(`${archivo}: «Tu ${nombre}» donde el destino es «Mi ${nombre}»`);
  }
}
ok(
  cruzados.length === 0,
  cruzados.length === 0
    ? `los ${new Set(conMi).size} destinos con «Mi» lo dicen igual en toda la app`
    : cruzados.join(' · '),
);
/*
 * Y escrito sin su espacio. «MiClínica Digital» pegaba el destino «Mi Clínica»
 * con «Tu Clínica Digital», que es como se llama la app: un quinto nombre,
 * nacido de un espacio que faltaba. Estaba en la graduación —la pantalla del
 * día 90— y en uno de los tutoriales.
 */
const pegados: string[] = [];
for (const archivo of [...delCliente(), 'src/lib/tutorialesDeLupe.ts', 'src/lib/libroYPacientes.ts']) {
  const vivo = readFileSync(join(raiz, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
  for (const nombre of new Set(conMi)) {
    /* El nombre sin su espacio, y que no sea un identificador de código. */
    const re = new RegExp(`(?<![\\w/'"\`.])Mi${nombre.replace(/\s/g, '')}\\b`, 'g');
    if (re.test(vivo)) pegados.push(`${archivo}: «Mi${nombre.replace(/\s/g, '')}»`);
  }
}
ok(
  pegados.length === 0,
  pegados.length === 0
    ? 'y ninguno aparece pegado, sin el espacio que lo separa'
    : pegados.join(' · '),
);

console.log('\n── y el mapa que el Soporte le da al cliente sale del dato ──');
/*
 * El Soporte llevaba su propio mapa escrito a mano, con la orden «usa estos
 * nombres exactos», y cuatro ya no existían: «Mentor IA», «Entrenadores IA»,
 * «Campañas & Creativos» y «Soporte». Faltaban «Mi ADN» y «Mi Número». Lo
 * único que está para ayudar a encontrar las cosas mandaba a nombres que la
 * app no usa.
 */
const mensajes = leer('src/pages/Mensajes.tsx');
ok(
  /EL MAPA REAL DEL MENÚ \(usa estos nombres exactos\): \$\{mapaDelMenu\(\)\}/.test(mensajes),
  'el mapa se arma con los nombres de `DESTINOS`, no a mano',
);
ok(
  /export function mapaDelMenu/.test(destinos),
  'y `mapaDelMenu` vive junto a la lista, que es donde se agrega lo próximo',
);
const viejos = ['Mentor IA', 'Entrenadores IA', 'Campañas & Creativos'];
const sobreviven = viejos.filter((v) => mensajes.includes(v));
ok(
  sobreviven.length === 0,
  sobreviven.length === 0
    ? 'y ninguno de los nombres viejos sobrevive en el prompt'
    : `todavía están: ${sobreviven.join(', ')}`,
);

/*
 * ═══ UN DESTINO, UNA CARA ═══════════════════════════════════════════════
 *
 * Lo mismo que pasa con el nombre pasa con el ícono. El Mentor es
 * `MessageSquare` en `destinos.ts`, y en tres lugares más llevaba `Bot`: una
 * carita de robot. Dónde se veía:
 *
 *   · el último paso del wizard, en la tarjeta que presenta al Mentor;
 *   · el paso que enumera lo que incluye el camino;
 *   · el estado vacío de Soporte IA, a 32 píxeles, lo primero que ve quien
 *     abre esa pestaña.
 *
 * Una carita de robot se lee infantil, y esta app cobra como un producto
 * serio. Además `Coach.tsx` y `Roadmap.tsx` lo importaban sin dibujarlo.
 *
 * El catálogo de herramientas de IA es la excepción: ahí `Bot` es el ícono de
 * una herramienta de terceros en una lista de logos, no la cara de la casa.
 */
const SIN_ROBOT = ['src/components/WelcomeWizard.tsx', 'src/pages/Mensajes.tsx',
                   'src/pages/Coach.tsx', 'src/pages/Roadmap.tsx'];
const conRobot = SIN_ROBOT.filter((f) => /\bBot\b/.test(
  leer(f).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ').replace(/\/\/[^\n]*/g, ' '),
));
ok(
  conRobot.length === 0,
  conRobot.length === 0
    ? 'y la cara del Mentor no es un robot en ninguna de sus pantallas'
    : `todavía tienen el robot: ${conRobot.join(', ')}`,
);

/*
 * Dos destinos con la misma cara es el mismo problema que dos nombres para un
 * destino, al revés: el cliente ve dos tarjetas idénticas y no sabe cuál es
 * cuál. Pasó en el paso de bienvenida del wizard —el Mentor y Entrenadores
 * mostraban los dos un globo de diálogo— porque los íconos estaban copiados a
 * mano en vez de salir de esta lista.
 */
const bloqueDestinos = destinos.match(/export const DESTINOS: Destino\[\] = \[([\s\S]*?)\n\]/);
if (!bloqueDestinos) {
  ok(false, 'se encontró la lista DESTINOS para revisar sus íconos');
} else {
  const pares = [...bloqueDestinos[1].matchAll(/id: '([a-zA-Z]+)'[\s\S]*?icon: ([A-Za-z0-9]+)/g)]
    .map((m) => ({ id: m[1], icono: m[2] }));
  const repetidos = [...new Set(pares.map((p) => p.icono))]
    .filter((ic) => pares.filter((p) => p.icono === ic).length > 1);
  ok(
    repetidos.length === 0,
    repetidos.length === 0
      ? `y los ${pares.length} destinos tienen cada uno su propia cara`
      : `dos destinos comparten ícono: ${repetidos.map((ic) => `${ic} (${pares.filter((p) => p.icono === ic).map((p) => p.id).join(', ')})`).join(' · ')}`,
  );
}

/*
 * Y que el wizard no vuelva a copiarlos a mano: sus dos listas de tarjetas
 * —la de bienvenida y la de la guía final— sacan el ícono de `destinoPorId`.
 */
const wizard = leer('src/components/WelcomeWizard.tsx');
ok(
  (wizard.match(/destinoPorId\(/g) ?? []).length >= 2,
  'y las tarjetas del wizard sacan su ícono del destino, no escrito a mano',
);

/*
 * ═══ Y QUE EL COPY NO MANDE A UN LUGAR QUE NO EXISTE ════════════════════
 *
 * Esta prueba revisa las ETIQUETAS: la barra de arriba, el buscador, la barra
 * de abajo. Pero el copy también manda al cliente a lugares, y ahí se escapó
 * uno: la pantalla de bienvenida decía «puedes escribirnos en cualquier
 * momento desde el Chat», y en la app no hay ningún Chat — ese lugar se llama
 * «Acompañamiento» en el menú y «Contacto» en la barra. Cuarto nombre para el
 * mismo destino, en la pantalla que lo presenta.
 *
 * La vara es angosta a propósito. Prohibir la palabra «Chat» encendía cuatro
 * que al mirarlos están bien: dos comentarios, «Chat de WhatsApp» en una lista
 * de canales de contacto —que es el chat de WhatsApp, no el de la app— y «Chat
 * con el equipo» describiendo lo que incluye un nivel. Lo que confunde no es
 * la palabra: es la INSTRUCCIÓN de ir a un sitio con un nombre que la app no
 * usa.
 */
const MANDA_AL_CHAT = /\b(desde|en|al|por|entra a|anda a|ve a|escríbenos en)\s+(el\s+)?Chat\b/;
const mandanMal = delCliente().filter((f) => MANDA_AL_CHAT.test(
  leer(f).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ').replace(/\/\/[^\n]*/g, ' '),
));
ok(
  mandanMal.length === 0,
  mandanMal.length === 0
    ? 'y ningún texto manda al cliente a un «Chat» que la app no tiene'
    : `mandan a un Chat inexistente: ${mandanMal.join(', ')}`,
);

console.log(fallas === 0 ? '\n✓ un destino, un nombre\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
