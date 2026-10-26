/**
 * prueba-castellano-neutro.ts — que la app no vosee.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Los clientes son de Ecuador, Panamá, Chile y Venezuela. Todo lo que la app
 * les dice va en castellano neutro —tú, tienes, mira, cuéntame—, y eso no
 * depende del país de nadie: es una sola voz.
 *
 * Se coló igual, y donde más caro sale: ocho veces dentro de los pasos
 * técnicos, que son los que el cliente lee despacio y siguiendo con el dedo.
 * «Copialo», «Pegalo», «Identificá», «Pausá», «subile», «frená», «bajá». Un
 * paso a paso que suena de otro país es el peor lugar para que suene raro,
 * porque es el momento en que la persona está dudando de si lo está haciendo
 * bien.
 *
 * ═══ LO QUE NO ES VOSEO ═══
 *
 * `vozLocalizada.ts` define qué países vosean para el contenido que el
 * sanador PUBLICA a sus propios clientes. Ahí el voseo es un dato, no una
 * voz, y por eso ese archivo queda fuera. Lo mismo las listas de formas
 * verbales que los entrenadores usan para saber qué NO escribir.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

/*
 * Archivos donde el voseo es dato y no voz: el mapa de dialectos y las
 * instrucciones que le dicen a cada entrenador qué formas evitar.
 */
const FUERA = /vozLocalizada\.ts$|agents\/adn-context\.ts$|agents\/voz-javo\.ts$|scripts\//;

/*
 * ═══ POR QUÉ ESTO ES UN PATRÓN Y NO UNA LISTA ═══
 *
 * La primera versión enumeraba verbos uno por uno, daba verde, y mientras
 * tanto en la app seguían «respirá», «andá», «escuchá», «trabajá»,
 * «optimizá», «destrabá», «ampliá», «retomá» y una docena más. Una lista
 * encuentra solo lo que alguien ya se acordó de poner.
 *
 * El imperativo voseante de los verbos en -ar es la raíz con la tilde al
 * final: mirá, comprá, dejá. Eso sí es un patrón, y cubre la mayor parte del
 * voseo que aparece escrito.
 *
 * Lo que también termina en -á y es castellano perfecto es poco y conocido:
 * el futuro de tercera persona (enviará, será) y un puñado de palabras
 * comunes (acá, está, quizá). Van en la lista de abajo. Cuando aparezca un
 * futuro que no esté, esta prueba lo marca una vez y se agrega — que es el
 * error barato: molestar una vez, en vez de callar siempre.
 *
 * Para los verbos en -er y en -ir no hay patrón: su imperativo voseante es
 * idéntico al pretérito de primera persona («la escribí yo», «sostené»
 * frente a «sostuve»). Ahí sigue haciendo falta la lista, y quedan fuera los
 * ambiguos: escribí, seguí, elegí, creé, dale.
 */

/** Terminan en -á y son castellano neutro. */
const TERMINA_EN_A_Y_ESTA_BIEN = new Set([
  'acá', 'allá', 'está', 'quizá', 'ojalá', 'mamá', 'papá', 'sofá', 'acullá',
  'panamá', 'canadá', 'bogotá', 'maná', 'ahí',
  // Futuro de tercera persona: el infinitivo entero más la tilde.
  'enviará', 'publicará', 'eliminará', 'llenará', 'extraerá', 'actualizará',
  'creará', 'necesitará', 'subirá', 'recordará', 'obtendrá', 'será', 'usará',
  'quedará', 'revocará', 'habrá', 'tendrá', 'podrá', 'hará', 'dirá', 'irá',
  'vendrá', 'pondrá', 'saldrá', 'valdrá', 'querrá', 'sabrá', 'dejará',
  'tomará', 'dará', 'estará', 'llegará', 'pasará', 'bajará', 'costará',
  'durará', 'mostrará', 'cambiará', 'guardará', 'cargará', 'servirá',
  'permitirá', 'ayudará', 'pedirá', 'dependerá', 'buscará', 'abrirá',
]);

/** El imperativo voseante de los verbos en -ar: raíz con tilde al final. */
/*
 * OJO CON EL LÍMITE DE PALABRA: en JavaScript `\b` no reconoce las vocales
 * acentuadas como letra, así que `\b…á\b` encuentra «atrá» dentro de
 * «atrás» y «automá» dentro de «automático». La primera versión de esta
 * regla marcó veintiocho faltas de ese tipo. El límite se escribe a mano,
 * con la clase de letras completa a los dos lados.
 */
const LETRA = 'a-záéíóúñü';
const VOSEO_AR = new RegExp(`(?<![${LETRA}])([${LETRA}]{3,}á)(?![${LETRA}])`, 'gi');

/*
 * El tercer hueco: el imperativo del voseo con el pronombre pegado. No lleva
 * tilde al final, así que ni VOSEO_AR ni la lista de arriba lo veían, y la
 * app tenía cuatro — «ayudame», «traeme», «pensala» — en los botones de los
 * entrenadores, que es lo primero que el cliente lee al abrir un chat.
 * En castellano neutro todos llevan tilde en la raíz: ayúdame, tráeme.
 * La lista es cerrada a propósito: el patrón general chocaría con palabras
 * legítimas —«dale» por escrito, «tomate», «abrí» en primera persona— y un
 * lente con falsos positivos es un lente que se ignora.
 */
const ENCLITICO = new RegExp(
  '\\b(' +
  'contame|contanos|decime|decinos|mirame|miranos|ayudame|ayudanos|dejame|dejanos|' +
  'mandame|mandanos|pasame|pasanos|escuchame|llamame|mostrame|traeme|avisame|' +
  'preguntame|explicame|enseñame|enviame|respondeme|escribime|' +
  'quedate|sentate|fijate|acordate|tomatelo|invitalo|invitala|grabate|sumate|'  +
  'incorporalo|incorporala|aplicalo|aplicala|sumalo|sumala|cerralo|abrilo|' +
  'pensalo|pensala|hacelo|hacela|probalo|probala|mandalo|anotalo|anotala|' +
  'guardalo|guardala|elegilo|elegila|usalo|usala|buscalo|buscala|revisalo|revisala' +
  ')\\b',
  'gi',
);

/*
 * El cuarto hueco: el voseo en MAYÚSCULAS. Los prompts de los entrenadores
 * escriben sus reglas en versalitas —«ALERTÁS», «la FABRICÁS», «QUE GENERÁS»,
 * «LO DECLARÁS»— y ni VOSEO_AR ni la lista de abajo las veían, porque ambos
 * buscan minúsculas. La lista de palabras que SÍ terminan así en mayúsculas
 * es corta y conocida: QUÉ, PAÍS, INGLÉS, DESPUÉS y los pretéritos de yo.
 */
const MAYUSCULA_BIEN = new Set([
  'QUÉ', 'PORQUÉ', 'PAÍS', 'PAÍSES', 'INGLÉS', 'DESPUÉS', 'MÁS', 'ASÍ', 'AQUÍ',
  'ESTÁ', 'ESTÁS', 'ADEMÁS', 'DEMÁS', 'JAMÁS', 'QUIZÁS', 'ATRÁS', 'DETRÁS',
  'SÓLO', 'ACÁ', 'ALLÁ', 'ESTÉ', 'ESTÉN', 'SÉ', 'DÉ', 'VÉ', 'TAMBIÉN', 'QUIÉN',
  'CUÁL', 'CUÁLES', 'CÓMO', 'DÓNDE', 'CUÁNDO', 'CUÁNTO', 'CUÁNTOS',
  // pretéritos de primera persona: legítimos en el relato de Javo
  'PERDÍ', 'EXPLIQUÉ', 'APRENDÍ', 'VIVÍ', 'SALÍ', 'COMÍ', 'ESCRIBÍ', 'LEÍ',
  'ELEGÍ', 'SEGUÍ', 'CONSEGUÍ', 'DECIDÍ', 'EMPECÉ', 'CERRÉ', 'ABRÍ', 'LOGRÉ',
]);
/*
 * Y acá vuelve a morder lo mismo que arriba: `\b` no cuenta las vocales
 * acentuadas como letra, así que `\b…Á\b` encontraba «PAÍ» dentro de
 * «PAÍSES» y «PRUÉ» dentro de «PRUÉBALO» — 84 faltas falsas de una. El
 * límite se escribe a mano, con las dos cajas de letras a los dos lados.
 */
const VOSEO_MAYUSCULA =
  /(?<![A-ZÁÉÍÓÚÑa-záéíóúñ])[A-ZÁÉÍÓÚÑ]{2,}(?:ÁS|ÉS|ÍS|Á|É|Í)(?![A-ZÁÉÍÓÚÑa-záéíóúñ])/g;

const VOSEO = new RegExp(
  '\\b(' +
  // presentes de vos
  'vos|sos|tenés|querés|podés|sabés|hacés|decís|venís|ponés|mirás|vendés|cobrás|elegís|escribís|' +
  // imperativos de verbos en -ar
  'and[áa]te|and[á]|mir[á]|fijate|acordate|quedate|peg[á]|pegalo|entr[á]|revis[á]|carg[á]|' +
  'anot[á]|prob[á]|avis[á]|identific[á]|paus[á]|fren[á]|baj[á]|subile|copialo|' +
  'mand[á]|dej[á]|tom[á]|busc[á]|cont[á]|empez[á]|' +
  // Imperativos de verbos en -er. Estos son inequívocos: el pretérito de los
  // verbos en -er termina en -í («sostuve», «respondí»), nunca en -é, así que
  // una palabra así solo puede ser voseo. Se coló «Sostené» en un guión.
  'sostené|tené|poné|hacé|corré|volvé|leé|meté|comé|bebé|aprendé|respondé|atendé|' +
  'vendé|prendé|perdé|movete|movelo|ponete|ponelo|hacete|hacelo|tenelo|dejalo|mirate' +
  ')(?![a-záéíóúñü])',
  'i',
);

function archivos(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.(tsx?|json)$/.test(e.name)) out.push(p);
  }
  return out;
}

let fallas = 0;
let revisados = 0;

/**
 * Quita los comentarios, y deja el resto tal cual, con sus saltos de línea.
 *
 * Se mira TODO lo que no es comentario, no solo lo que está entre comillas en
 * una misma línea: los guiones de los videos son textos de muchas líneas
 * dentro de un template, y con el lente anterior ninguno se revisaba. Así se
 * coló un «Sostené» al final de una lección.
 *
 * Los comentarios quedan fuera porque ahí el voseo se nombra a propósito,
 * para explicar qué no se escribe.
 */
function sinComentarios(t: string): string {
  return t
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)));
}

console.log('\n── la app le habla al sanador en castellano neutro ──');
for (const p of archivos('src')) {
  if (FUERA.test(p)) continue;
  revisados++;
  const lineas = sinComentarios(leer(p)).split('\n');
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    const marcar = (palabra: string) => {
      console.log(`  ✗ ${p}:${i + 1} dice «${palabra}» → ${l.trim().slice(0, 70)}`);
      fallas++;
    };
    const m = l.match(VOSEO);
    if (m) marcar(m[0]);
    // El imperativo con el pronombre pegado, que no lleva tilde al final.
    const e = l.match(ENCLITICO);
    if (e) marcar(e[0]);
    // Y el mismo voseo escrito en versalitas, que ningún otro patrón ve.
    for (const v of l.match(VOSEO_MAYUSCULA) ?? []) {
      if (!MAYUSCULA_BIEN.has(v)) { marcar(v); break; }
    }
    // Y el patrón de los verbos en -ar, que es donde vive casi todo el voseo.
    for (const v of l.match(VOSEO_AR) ?? []) {
      if (!TERMINA_EN_A_Y_ESTA_BIEN.has(v.toLowerCase())) { marcar(v); break; }
    }
  }
}
if (fallas === 0) console.log(`  ✓ los ${revisados} archivos revisados hablan de tú`);

console.log(fallas === 0 ? '\n✓ la app no vosea\n' : `\n✗ ${fallas} voseos\n`);
process.exit(fallas === 0 ? 0 : 1);
