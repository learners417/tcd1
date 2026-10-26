/**
 * prueba-el-vocabulario-de-la-casa.ts — las palabras que no se dicen acá.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Javo tiene una lista de palabras prohibidas en su comunicación, y la app la
 * rompía en 44 textos que el cliente lee. El lente de lenguaje
 * (`lente-lenguaje.ts`) no las buscaba: su lista de jerga es de tecnicismos
 * en inglés —lead, KPI, CTR, retargeting—, no del vocabulario de la casa. Y
 * además solo recorre los DATOS del Camino, las sesiones y las herramientas;
 * el texto escrito dentro de las pantallas no lo miraba nadie.
 *
 * Lo que había, y ya no:
 *   «Contacta a tu coach por WhatsApp»       en la pantalla de entrada
 *   «Validado con el Coach»                  en cada cinturón
 *   «dónde se corta tu embudo»               en el montaje de la campaña
 *   «Auditoría completa de mi embudo»        en un botón de Ramiro
 *   «producto los martes, marketing los…»    en la vía de contacto
 *   «Día 30: escalas al ganador»             en la activación
 *   «más plata por minuto»                   en la misma jornada
 *   «El embudo de siete pasos»               en La Casa
 *
 * Y el reemplazo no es un sinónimo elegido al azar: sale de sus propios
 * libros. Captación es el libro 3 de la colección del sur, el Mentor es como
 * se llama el acompañante en todas las pantallas, y crecer es lo que el
 * programa promete.
 *
 * ═══ POR QUÉ HAY EXCEPCIONES, Y POR QUÉ ESTÁN ESCRITAS UNA POR UNA ═══
 *
 * Tres de estas palabras tienen un segundo sentido que es legítimo y que no
 * tiene nada que ver con el vocabulario de venta:
 *
 *   escalar   un caso se escala a una persona cuando la app no alcanza. Es
 *             el lenguaje del soporte, no del negocio.
 *   escala    una escala de medición —«un número, una escala o una señal»—
 *             es exactamente lo que la app pide medir.
 *   la palabra dentro de una PROHIBICIÓN: los prompts de los entrenadores
 *             dicen «Prohibido usar: coach, escalar, embudo, funnel,
 *             marketing, gurú». Borrarla de ahí sería borrar la regla.
 *
 * Por eso las excepciones se escriben a mano, con su razón al lado, y no se
 * resuelven con un patrón: un patrón que las adivine termina dejando pasar
 * las de verdad. Cuando alguien agregue un «embudo» nuevo, esto lo caza.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');

/*
 * Las prohibidas. «gente» ya tiene su propia prueba y su propio reemplazo
 * (personas, consultantes), así que acá va con las demás.
 */
const PROHIBIDAS = new RegExp(
  /*
   * «escalamos» pasó entero: el detector conjugaba escalar, escalable,
   * escalas y escala, y nada más. Estaba en la tarjeta de un entrenador
   * —«Medimos, ajustamos, escalamos»— que el cliente lee al abrir la
   * pantalla. Van las formas del verbo, con el límite de palabra al final
   * para que «escalón de entrada» y «escalera» sigan siendo nuestras.
   */
  /*
   * ─── POR QUÉ NO SE USA \b ───────────────────────────────────────────────
   *
   * Porque en JavaScript `\w` es solo [A-Za-z0-9_]: la `ú` NO es carácter de
   * palabra, así que entre «gurú» y el espacio que sigue no hay límite de
   * palabra y el `\b` del final hacía fallar la coincidencia entera. Medido:
   * «gurú» —la palabra más prohibida de esta casa— nunca coincidió, desde que
   * la lista existe. Cualquier prohibida que termine en tilde tenía el mismo
   * agujero.
   *
   * Lo que va a cada lado es «ni carácter de palabra ni letra con tilde»:
   * \\w cubre el ASCII —y con él los identificadores, que no son texto que
   * alguien lee: `coach_instruccion` y `coachHistorySummary` daban dos faltas
   * falsas con solo las letras— y las tildes cubren el castellano.
   */
  '(?<![\\wáéíóúüñ])(coach|coaches|coaching|coachear|escalable|escalables|' +
  'escal(?:a|as|amos|an|ar|aron|aba|aban|ado|ada|ando|aremos|ar[aá]n)(?![\\wáéíóúüñ])|' +
  'gur[úu]s?|gur[úu]es|plata|marketing|marketero|marketera|embudos?|funnels?|gente|' +
  /*
   * Y la jerga técnica que el lente de lenguaje sí lista, pero que solo
   * buscaba en los datos del Camino: los ocho entrenadores quedaban fuera de
   * su recorrido, y ahí vivían «Sube una foto de tu setup», «¿Qué setup
   * uso?» y «con setup de producción», que es lo primero que se lee al abrir
   * un chat. Van las que aparecían de verdad, no la lista entera: una regla
   * que marca lo que no existe no se puede distinguir de una que no corre.
   */
  'setups?|screenshots?|' +
  /*
   * «Nunca gratis ni recurso gratuito: lo cobra». Se puede decir que se
   * prueba la primera semana a un costo mínimo, o que el primer capítulo se
   * ve sin costo — pero la palabra no va. Había 36 apariciones, la mayoría en
   * los prompts de los entrenadores, que son los que después se lo dicen al
   * cliente con esas mismas palabras.
   */
  'gratis|gratuitos?|gratuitas?)(?![\\wáéíóúüñ])',
  'i',
);

/*
 * Cada excepción lleva el texto que la identifica y la razón por la que vive.
 * Si una se vuelve innecesaria, se borra la línea y la prueba avisa.
 */
const JUSTIFICADAS: Array<{ trozo: string; razon: string }> = [
  /*
   * ── LA VOZ DEL OTRO ──
   *
   * Las simulaciones de entrenamiento traen la objeción tal como la dice el
   * paciente, que es justamente lo que el entrenador practica responder. Si
   * la objeción se escribiera con las palabras de la casa, el entrenamiento
   * sería contra algo que nadie dice.
   */
  { trozo: 'no me sirvió · quiero plata', razon: 'la objeción del paciente, en la voz del paciente' },
  { trozo: 'otra coach más', razon: 'lo que piensa la paciente escéptica de la simulación' },
  { trozo: 'coach de salud. Estudió muchos años', razon: 'de dónde viene el cliente: su formación, no la app hablando' },

  /*
   * ── EL DETECTOR ──
   *
   * Un patrón que busca la palabra en lo que el CLIENTE escribe tiene que
   * contenerla: el cliente puede decir «escalar», y el detector la reconoce
   * para llevarlo a la pregunta que corresponde.
   */
  { trozo: '/apagar|escalar|optimizar|cpm|cpl|costo por/', razon: 'detecta lo que el cliente escribe, no lo que la app dice' },
  { trozo: "'Coach ontológico': 'acompanamiento'", razon: 'el diccionario de reemplazo: la clave es lo que se cambia' },

  /*
   * ── LA DERIVACIÓN ENTRE ENTRENADORES ──
   */
  { trozo: 'Pide AUDITAR EMBUDO', razon: 'la regla de a quién derivar, en la instrucción del entrenador' },

  // ── la palabra aparece para prohibírsela al modelo ──
  { trozo: 'PALABRAS PROHIBIDAS (coach genérico)', razon: 'el encabezado de la lista de prohibidas' },
  { trozo: 'expansión · escalar · escalabilidad', razon: 'la lista de prohibidas, escrita' },
  { trozo: 'manifestar · funnel · leads', razon: 'la lista de prohibidas, escrita' },
  { trozo: '"Crecer sin poner más horas" · no "escalar"', razon: 'la regla de reemplazo: dice con qué se cambia' },
  { trozo: 'Prohibido usar: coach, escalar, embudo', razon: 'es la regla que se le da al entrenador' },
  { trozo: 'NO un marketero', razon: 'la prohibición en la voz de Javo' },
  { trozo: 'Nunca la palabra "gente"', razon: 'la regla del vocabulario, escrita' },
  { trozo: 'Está prohibido crear material de', razon: 'el límite del Mentor, que nombra lo que no hace' },
  { trozo: 'prohibido hacerle coaching al cliente', razon: 'la regla de la llamada de venta' },
    { trozo: 'especialista en marketing de profesionales', razon: 'instrucción al modelo, no texto de pantalla' },
  { trozo: 'Estás haciendo todo mal con tu marketing', razon: 'ejemplo de lo que NO se dice, en la herramienta de anuncios' },
  { trozo: '¿Quieres que mi equipo analice tu marketing?', razon: 'ejemplo de lo que NO se dice' },
  { trozo: 'primero marketing, después venta', razon: 'ejemplo de lo que NO se dice' },
  { trozo: 'Sin poesía, sin pausas dramáticas', razon: 'las reglas de redacción, que nombran la jerga' },
  { trozo: 'demostración (30s), quién soy', razon: 'instrucción al modelo para armar el guion' },

  // ── escalar / escala en su otro sentido: el soporte y la medición ──
  { trozo: 'Si algo no está en la cola, escala', razon: 'escalar un caso a una persona' },
  { trozo: 'Escalar lo que no está en la cola', razon: 'escalar un caso a una persona' },
  { trozo: 'Si no está en la cola, se escala', razon: 'escalar un caso a una persona' },
  { trozo: 'Es la forma más silenciosa de que', razon: 'escalar un caso a una persona' },
  { trozo: 'si algo escala de la app a una persona', razon: 'escalar un caso a una persona' },
  { trozo: 'Un número, una escala o una señal', razon: 'escala de medición' },

  // ── variables y claves de código, no texto ──
  { trozo: '${plata}.', razon: 'es el nombre de una variable interpolada, en tres lecturas del costo' },
  { trozo: "coach: 'Tu Mentor'", razon: 'coach es el identificador de la pantalla; lo que se LEE es «Tu Mentor»' },
  { trozo: 'sin plata|sin dinero', razon: 'parte de una expresión regular que detecta señales de pobreza en el copy' },

  // ── lo que describe al cliente, no lo que se le dice ──
  { trozo: 'promesas vacías de "gurúes"', razon: 'describe de qué viene harto el cliente' },
  { trozo: 'el coaching genérico', razon: 'describe lo que el cliente ya rechazó' },
  { trozo: 'palabrería de coach', razon: 'le prohíbe ese tono al entrenador' },
  { trozo: 'especializado en marketing para profesionales', razon: 'rol del modelo en el prompt de campañas' },
  { trozo: 'Sin tono de marketing', razon: 'la prohibición, escrita' },
  { trozo: 'sin clichés de coaching', razon: 'la prohibición, escrita' },
  { trozo: 'no uses frases genéricas de coaching', razon: 'la prohibición, escrita' },
  { trozo: 'lo gratis atrae curiosos', razon: 'la regla de por qué no se usa esa entrada' },
  { trozo: 'Lo gratis atrae curiosos', razon: 'la misma regla, en el prompt de estrategia' },
  { trozo: 'quiere aprender gratis', razon: 'la razón de por qué ese anuncio no sirve' },
  { trozo: 'Agenda tu llamada gratis de estrategia', razon: 'ejemplo de lo que NO se dice' },
  { trozo: 'trabajar al equipo gratis', razon: 'el riesgo que describe la vía de contacto' },
  { trozo: 'embudos de venta o configuración de agentes', razon: 'la lista de lo que el Mentor no construye todavía' },
];

/* El Admin lo ve el equipo y tiene su propia vara. */
function archivosDelCliente(dir = 'src'): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.name === 'admin' || e.name === 'Admin.tsx') continue;
    if (e.isDirectory()) out.push(...archivosDelCliente(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

/*
 * Qué cuenta como texto que alguien lee. Un literal suelto puede ser una
 * clase de Tailwind, un identificador o una ruta; lo que lo delata como frase
 * es tener al menos dos palabras de estructura del castellano.
 */
const ESTRUCTURA = /\b(el|la|los|las|tu|tus|un|una|que|de|con|para|por|se|lo|y|más|ya|su|sus)\b/gi;
const EN_JSX = />\s*([^<>{}\n]{12,}?)\s*</g;
const LITERAL = /['"`]([^'"`\n]{15,}?)['"`]/g;

/*
 * Los prompts de los entrenadores son templates de backtick de treinta
 * líneas, y un literal «sin saltos» no entra ahí: la primera versión de esta
 * prueba dejaba cinco excepciones sin usar justamente porque no veía ninguno.
 * Así que además de los literales de una línea, se revisa el archivo RENGLÓN
 * por renglón, que es lo que alcanza tanto a los templates largos como a los
 * textos partidos en varias líneas con `+`.
 */
function frases(contenido: string): string[] {
  const limpio = contenido
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    // los comentarios de línea, estén al principio o colgados de una línea de código
    .replace(/\/\/[^\n]*/g, ' ')
    /*
     * `coach` es el identificador de la pantalla del Mentor: vive en las
     * rutas, en los id de los destinos y en cada setCurrentPage('coach'). Lo
     * que el cliente LEE en todos esos lugares dice «Tu Mentor». Un
     * identificador entre comillas no es texto, así que sale antes de buscar.
     */
    .replace(/'(coach|marketing|plata|embudo)'/g, "'_'")
    .replace(/\/(coach|marketing)\b/g, '/_');
  const salida: string[] = [];
  for (const re of [EN_JSX, LITERAL]) {
    for (const m of limpio.matchAll(re)) salida.push(m[1]);
  }
  for (const renglon of limpio.split('\n')) {
    const s = renglon.trim();
    if (s.length >= 15) salida.push(s);
  }
  /*
   * Dos palabras de estructura era el umbral, y por ahí se escapó «Tu coach
   * está conectando ideas...», el aviso que el cliente lee cada vez que el
   * Mentor tarda en contestar: tiene UNA sola —«Tu»—, porque «está»,
   * «conectando» e «ideas» no son estructura.
   *
   * Así que vale también la otra señal: tres palabras o más y alguna letra
   * acentuada. Una clase de Tailwind no lleva tildes ni espacios, así que la
   * puerta no se abre para ellas. Medido: no agrega ninguna falta falsa.
   */
  const esCastellano = (s: string) =>
    (s.match(ESTRUCTURA) ?? []).length >= 2
    || (s.trim().split(/\s+/).length >= 3 && /[áéíóúñ¿¡]/i.test(s));
  return salida.filter((s) =>
    esCastellano(s) &&
    !/className|px-|text-|rounded-|flex |grid |^import |^export (type|interface)/.test(s));
}

console.log('\n── el vocabulario de la casa ──');

const faltas: Array<{ archivo: string; palabra: string; texto: string }> = [];
const usadas = new Set<string>();
let revisados = 0;

for (const archivo of archivosDelCliente()) {
  for (const texto of frases(readFileSync(join(raiz, archivo), 'utf8'))) {
    revisados++;
    const m = texto.match(PROHIBIDAS);
    if (!m) continue;
    const excusa = JUSTIFICADAS.find((j) => texto.includes(j.trozo));
    if (excusa) { usadas.add(excusa.trozo); continue; }
    faltas.push({ archivo, palabra: m[0].toLowerCase(), texto: texto.slice(0, 88) });
  }
}

/*
 * ═══ AGUJERO 1: LAS ETIQUETAS ═══════════════════════════════════════════
 *
 * `frases()` solo deja pasar TEXTO QUE ALGUIEN LEE, y para eso pide quince
 * caracteres y dos palabras de estructura. Una prohibida parada sola como
 * etiqueta de botón mide cinco: `'Coach'`, en la lista de profesiones del
 * wizard, nunca coincidió. Y la etiqueta es justo donde más se lee el
 * vocabulario de la casa: botones, chips, opciones, nombres de semana.
 *
 * El corte es la FORMA del literal. En este código:
 *   · `'coach'` todo en minúscula es la ruta de la pantalla del Mentor;
 *   · `'COACH'` todo en mayúscula es un código de meta o de pilar;
 *   · `'Coach'` en Title Case no es ninguna de las dos: es una etiqueta.
 * Medido sobre todo src: con Title Case encienden tres, y los tres eran
 * texto que el cliente lee. Con «capitalizada» a secas encendían doce, de
 * los cuales once eran códigos en mayúscula.
 */
const TITLE_CASE = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/;
for (const archivo of archivosDelCliente()) {
  const limpio = readFileSync(join(raiz, archivo), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, ' ');
  limpio.split('\n').forEach((renglon, i) => {
    for (const m of renglon.matchAll(/['"`]([^'"`\n]{2,24})['"`]/g)) {
      const etiqueta = m[1].trim();
      revisados++;
      if (!TITLE_CASE.test(etiqueta) || !PROHIBIDAS.test(etiqueta)) continue;
      /* El mapa de especialidades tiene que NOMBRAR la palabra para poder
         mapear los perfiles que ya la eligieron; es la tabla, no la pantalla. */
      if (archivo === 'src/lib/vocabulario.ts') continue;
      faltas.push({ archivo: `${archivo}:${i + 1}`, palabra: etiqueta.toLowerCase(),
                    texto: `etiqueta suelta: '${etiqueta}'` });
    }
  });
}

/*
 * ═══ AGUJERO 2: EL JSON DEL CAMINO ══════════════════════════════════════
 *
 * `archivosDelCliente()` filtra `.tsx?`, así que esta prueba nunca miró
 * `roadmap.seed.json` — donde viven los noventa y un títulos de jornada, la
 * promesa, los tutoriales, los frenos y el veredicto del día 91. Es el cuerpo
 * de copy más grande que el cliente lee en toda la app.
 *
 * Lo que había ahí cuando se miró por primera vez: «Escalar o apagar» como
 * título del día 43, «Cuándo escalar y cuándo apagar», «Tu bandeja y tu
 * embudo», y la palabra «embudo» dentro del veredicto de la graduación —lo
 * último que el cliente lee en noventa días—. Seis en total, todas reales.
 *
 * En un JSON de contenido no hace falta la puerta de `esCastellano`: no hay
 * clases de Tailwind ni identificadores, cada cadena es texto que alguien lee.
 */
const SEED = 'src/lib/roadmap.seed.json';
const recorrer = (valor: unknown, ruta: string): void => {
  if (typeof valor === 'string') {
    revisados++;
    const m = valor.match(PROHIBIDAS);
    if (m) faltas.push({ archivo: `${SEED} · ${ruta}`, palabra: m[0].toLowerCase(), texto: valor.slice(0, 88) });
  } else if (Array.isArray(valor)) {
    valor.forEach((v, i) => recorrer(v, `${ruta}[${i}]`));
  } else if (valor && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) recorrer(v, `${ruta}.${k}`);
  }
};
recorrer(JSON.parse(readFileSync(join(raiz, SEED), 'utf8')), '');

if (faltas.length === 0) {
  console.log(`  ✓ ninguno de los ${revisados} textos del cliente usa una palabra prohibida`);
} else {
  for (const f of faltas) {
    console.log(`  ✗ ${f.archivo} dice «${f.palabra}»`);
    console.log(`      ${f.texto}`);
  }
}

/*
 * Una excepción que ya no corresponde a ningún texto es una excepción que
 * tapa: la próxima vez que esa frase vuelva, entra sin que nadie la vea.
 */
/*
 * Una excepción que no coincide con ningún texto es una excepción que tapa:
 * la próxima vez que esa frase vuelva, entra sin que nadie la vea. Va como
 * AVISO y no como falta, porque el extractor corta los literales en la
 * primera comilla interna —«Nunca la palabra "gente"» es uno de esos— y un
 * aviso informa sin frenar el trabajo por un detalle del extractor.
 */
const muertas = JUSTIFICADAS.filter((j) => !usadas.has(j.trozo));
if (muertas.length > 0) {
  console.log('\n── aviso · excepciones que no coincidieron con ningún texto ──');
  for (const m of muertas) console.log(`  · «${m.trozo}» (${m.razon})`);
}

/*
 * ─── Y EL DETECTOR, PROBADO CONTRA SÍ MISMO ──────────────────────────────
 *
 * «escalamos» pasó entero: el detector conjugaba cuatro formas y esa no
 * estaba. Vivía en la tarjeta de un entrenador —«Medimos, ajustamos,
 * escalamos»— que el cliente lee al abrir la pantalla. Una lista de palabras
 * incompleta da un verde que no significa nada, así que acá la lista se mide
 * a sí misma: las formas que tiene que cazar, y las que son nuestras y no
 * debe tocar.
 */
console.log('\n── el detector, probado contra sí mismo ──');
let detector = 0;
for (const forma of ['escalar', 'escalamos', 'escalaron', 'escalando', 'escalable',
                     'escalaba', 'escalaremos', 'escalarán', 'coach', 'gurú', 'gurús',
                     'gurúes', 'embudo', 'funnel', 'marketing', 'plata', 'gente']) {
  if (PROHIBIDAS.test(`texto con ${forma} adentro`)) continue;
  console.log(`  ✗ se le escapa «${forma}»`); detector++;
}
/* Y las que SON de la casa: el escalón de entrada es un producto nuestro. */
for (const nuestra of ['escalón de entrada', 'escalones', 'escalera', 'escalofrío',
                       'coach_instruccion', 'coachHistorySummary', 'escalable_flag']) {
  if (!PROHIBIDAS.test(`texto con ${nuestra} adentro`)) continue;
  console.log(`  ✗ marca «${nuestra}», que es nuestra`); detector++;
}
console.log(detector === 0
  ? '  ✓ caza las diecisiete formas prohibidas y deja pasar las siete nuestras'
  : `  ${detector} problemas en la lista`);

const total = faltas.length + detector;
console.log(total === 0
  ? `\n✓ la app habla con las palabras de la casa · ${JUSTIFICADAS.length} excepciones, cada una con su razón\n`
  : `\n✗ ${total} ${total === 1 ? 'falta' : 'faltas'}\n`);
process.exit(total === 0 ? 0 : 1);
