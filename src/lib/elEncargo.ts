/**
 * EL ENCARGO — lo que el cliente le pasa a Claude, ya con sus datos adentro.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * Medido: el Camino nombra a Claude tres veces en noventa y una jornadas, y a
 * GHL ninguna. El cliente hace los noventa días sin enterarse de la palanca
 * que hoy mueve todo — páginas, guiones, automatizaciones, libros enteros.
 *
 * Pero llenar ese hueco mal es lo más peligroso que se le puede dar a alguien
 * con noventa días y sin clínica todavía. «Mira todo lo que se puede hacer» lo
 * convierte en alguien que pasa noventa días CONSTRUYENDO, que es lo contrario
 * de diez consultantes.
 *
 * ═══ LA REGLA ═══
 *
 * No se enseña la herramienta: se enseña la jornada. El encargo vive adentro
 * del paso que lo necesita y en ningún otro lado — no hay pestaña de
 * herramientas, no hay catálogo, no hay «mira qué más se puede hacer». Un
 * encargo, una salida, un lugar donde va.
 *
 * El cliente nunca abre una conversación en blanco. Ahí es donde se pierde.
 *
 * ═══ POR QUÉ VA PRE-LLENADO ═══
 *
 * Un encargo genérico devuelve una página genérica, y una página genérica no
 * se puede usar: hay que reescribirla entera, o sea que no ahorró nada y
 * encima enseñó que «la IA no sirve para esto».
 *
 * La app YA tiene su ADN — su promesa, su método, su avatar, su nicho, su
 * país, catorce piezas selladas a lo largo del Camino. Ese es el único motivo
 * por el que esto funciona acá y no en una conversación cualquiera: lo que
 * sale es SUYO porque entró lo suyo.
 *
 * Lo que todavía no selló se reemplaza por un hueco explícito —«[tu promesa:
 * todavía sin sellar]»— en vez de desaparecer. Un encargo al que le falta un
 * dato tiene que DECIRLO: si se borra en silencio, la salida sale coja y el
 * cliente no sabe por qué.
 */
import { leerJSON } from './adnPiezas';
import { VOC } from './vocabulario';
import { getPaisInfo, tratoParaContenido } from './vozLocalizada';

/** Los datos del cliente que un encargo puede pedir. */
export interface DatosDelEncargo {
  [clave: string]: string | undefined;
}

/**
 * ═══ LOS DATOS QUE UN ENCARGO PUEDE PEDIR, Y NINGÚN OTRO ═══
 *
 * Esta lista es la que manda. Un encargo que escriba `{garantia}` no saca una
 * garantía de ningún lado: saca un hueco permanente, porque nada la llena
 * nunca. La lente exige que todo `{dato}` escrito en un encargo esté acá, y
 * que todo lo de acá tenga de dónde salir.
 *
 * Es la regla que faltaba. Los tres primeros encargos pedían país, promesa,
 * precio y avatar, y los cuatro salían vacíos siempre — no porque el cliente
 * no los hubiera sellado, sino porque nadie los traía hasta acá.
 */
export const DATOS_QUE_LLEGAN = [
  'nombre', 'especialidad', 'pais', 'dialecto', 'nicho',
  'avatar', 'promesa', 'metodo', 'oferta', 'precio',
] as const;

/**
 * Lee del almacén lo que el cliente ya selló.
 *
 * Son los campos que el Camino escribe a medida que avanza. Si una jornada
 * pide algo que todavía no está, el encargo lo dice en voz alta.
 */
export function datosDelCliente(): DatosDelEncargo {
  const perfil = leerJSON<Record<string, unknown>>('tcd_profile', {});
  const numero = leerJSON<{ precio_nuevo?: number | null }>('tcd_el_numero', {});
  const texto = (v: unknown): string | undefined => {
    const s = typeof v === 'string' ? v.trim() : '';
    return s.length > 0 ? s : undefined;
  };
  /*
   * ═══ DE DÓNDE SALE CADA UNO ═══
   *
   * La versión anterior leía cinco claves crudas de `tcd_profile` y daba por
   * perdido el resto: «lo que todavía no viaja —la promesa, el precio, el
   * país— sigue nombrado como hueco explícito». Medido: viajaban dos.
   * `nombre` y `especialidad`. Las otras tres no existían como clave, y
   * `adn_avatar` sí existe pero es un OBJETO —nombre ficticio, edad, dolores,
   * sueños—, así que `typeof v === 'string'` lo descartaba en silencio: a
   * quién sirve el cliente salía hueco aunque lo tuviera sellado.
   *
   * Ahora cada dato tiene su camino y su respaldo:
   *
   * · `pais` y `nicho` y `posicionamiento` y `avatar_cliente` se espejan en
   *   `auth.ts`, que es donde la base baja al navegador.
   * · `promesa` es su PUV —«la frase que te separa de todos los demás»—, que
   *   es exactamente lo que un encargo necesita como promesa. No hay otra:
   *   buscada por todo el repo, la palabra «promesa» no es columna de nada.
   * · `precio` sale de `tcd_el_numero`, su precio NUEVO, el del día 5. El
   *   viejo no sirve: el encargo arma lo que va a vender de ahora en
   *   adelante.
   * · `avatar` prefiere el campo de texto; si solo está el objeto del ADN, lo
   *   aplana a algo legible en vez de tirarlo.
   * · `dialecto` no es un dato suyo: se DERIVA del país. Es el que decide si
   *   su página trata a sus consultantes con el trato de su país, que no
   *   siempre es el neutro de la app. `vozLocalizada.ts` lo resuelve y es el
   *   único archivo donde esas formas se pueden escribir.
   */
  const pais = texto(perfil.pais);
  const avatarObjeto = perfil.adn_avatar;
  const avatarAplanado = (): string | undefined => {
    if (!avatarObjeto || typeof avatarObjeto !== 'object') return undefined;
    const a = avatarObjeto as Record<string, unknown>;
    const partes = [a.nombre_ficticio, a.profesion, a.situacion]
      .map((x) => (typeof x === 'string' ? x.trim() : ''))
      .filter(Boolean);
    return partes.length ? partes.join(', ') : undefined;
  };
  const precio = typeof numero.precio_nuevo === 'number' && numero.precio_nuevo > 0
    ? String(numero.precio_nuevo)
    : undefined;

  return {
    nombre: texto(perfil.nombre),
    especialidad: texto(perfil.especialidad),
    pais: pais ? (getPaisInfo(pais)?.nombre ?? pais) : undefined,
    dialecto: pais ? tratoParaContenido(pais) : undefined,
    nicho: texto(perfil.nicho),
    avatar: texto(perfil.avatar_cliente) ?? avatarAplanado(),
    promesa: texto(perfil.posicionamiento),
    metodo: texto(perfil.metodo_nombre),
    oferta: texto(perfil.oferta_mid),
    precio,
  };
}

/** Cómo se llama cada dato cuando hay que pedirlo por su nombre. */
const COMO_SE_LLAMA: Record<string, string> = {
  nombre: 'tu nombre',
  especialidad: 'tu especialidad',
  pais: 'tu país',
  dialecto: 'tu país',
  nicho: 'tu nicho',
  avatar: 'a quién sirves',
  promesa: 'tu promesa',
  metodo: 'tu método',
  oferta: 'tu oferta',
  precio: 'tu precio',
};

export interface EncargoArmado {
  /** El texto listo para pegar. */
  texto: string;
  /** Qué piezas del ADN le faltan para salir completo. */
  faltan: string[];
}

/**
 * Arma el encargo de una jornada con los datos del cliente.
 *
 * La plantilla usa `{nicho}`, `{promesa}` y demás. Lo que falta queda como un
 * hueco visible y se informa en `faltan`, para que la pantalla pueda decir
 * «esto sale mejor cuando selles tu promesa» en vez de entregar algo cojo sin
 * explicación.
 *
 * El texto pasa por `VOC` al final: si el cliente es nutricionista, el encargo
 * dice «consultante» donde corresponde, igual que el resto de la app. Un
 * encargo que dice «paciente» a un coach ya empieza mal.
 */
export function armarEncargo(plantilla: string, datos = datosDelCliente()): EncargoArmado {
  const faltan: string[] = [];
  const texto = plantilla.replace(/\{(\w+)\}/g, (_, clave: string) => {
    const valor = datos[clave];
    if (valor) return valor;
    const comoSeLlama = COMO_SE_LLAMA[clave] ?? clave;
    if (!faltan.includes(comoSeLlama)) faltan.push(comoSeLlama);
    return `[${comoSeLlama}: todavía sin sellar]`;
  });
  return { texto: VOC(texto), faltan };
}

/**
 * ═══ LOS ENCARGOS, POR JORNADA ═══
 *
 * Cada uno pertenece a UNA jornada y se escribe para el entregable de ESA
 * jornada — no son prompts de uso general. Por eso viven acá por código de
 * jornada y no en un catálogo: un catálogo es una pestaña de herramientas con
 * otro nombre, y eso es lo que no queremos.
 *
 * ═══ LA CLAVE ES EL CÓDIGO DE LA JORNADA, NO EL DEL VIDEO ═══
 *
 * Hay dos juegos de códigos en el Camino y se parecen: el de las PIEZAS —los
 * cuarenta y tres videos a grabar, `P3.1`, `P4.2d`, `P4.4`— y el de las METAS
 * —las noventa y un jornadas, `P2.d10`, `P3.d16`, `P9B.d61`—. Se tocan en
 * nueve códigos y en ninguno más.
 *
 * Los tres primeros encargos estaban escritos con el código del VIDEO. La
 * pantalla le pasa a `ElEncargo` el código de la JORNADA, así que
 * `encargoDe()` devolvía `null` en las noventa y una: el encargo no se mostró
 * nunca, en ningún día, desde que se escribió. Y la lente pasaba en verde
 * porque probaba la plantilla con datos de la mano, sin preguntar nunca si
 * alguien los iba a ver.
 *
 * Por eso ahora hay una lente —`prueba-el-encargo-llega.ts`— que exige que
 * cada clave de acá sea una jornada que existe.
 *
 * Reglas de redacción, que valen para los que se agreguen después:
 *
 * · Piden UNA cosa, la de esa jornada. Nada de «y de paso hacéme…».
 * · Dicen en qué formato tiene que salir, porque lo que sale va a un lugar
 *   concreto —GHL, la app, un documento— y tiene que entrar ahí sin arreglos.
 * · Terminan diciendo qué revisar antes de usarlo. La salida de una IA se
 *   revisa; un encargo que no lo dice enseña a pegar sin leer.
 * · Hablan en la voz del cliente, no en la de la app: el cliente los pega tal
 *   cual en su conversación.
 */
export const ENCARGOS: Record<string, string> = {

  /* Día 1 · Tu punto de partida — las instrucciones de su proyecto en Claude. */
  'P0.0': `Quiero que seas mi asistente de trabajo para los próximos noventa días.

Soy {nombre}, {especialidad} en {pais}.

Guarda esto como las instrucciones de este proyecto y respétalo en todo lo que
escribamos acá:

1. Todo lo que escribas para mis consultantes va en castellano {dialecto}.
2. Nunca prometas resultados de salud ni cifras de dinero, y nunca afirmes la
   condición de quien lee.
3. Escribe como hablo: frases cortas, sin palabras grandes, sin tono de venta.
4. Cuando te falte un dato mío, pídemelo. No lo inventes ni lo rellenes con un
   ejemplo.
5. Una cosa por vez. Si te pido mi oferta, no me escribas también los anuncios.

Confirma que lo guardaste, en una línea, y no escribas nada más por ahora.

Revisa una sola cosa antes de seguir: que el punto 1 diga el trato con el que
de verdad le hablas a tus consultantes.`,

  /* Día 9 · Tu método, escrito con sus etapas. */
  'P2.1': `Soy {especialidad} en {pais} y trabajo con {avatar}.

Lo que hago con cada consultante, en desorden, es esto:
[pega acá, en bruto, todo lo que haces desde que entra hasta que termina]

Ayúdame a ordenarlo en un método con nombre, de tres a cinco etapas. Para cada
etapa:

1. Cómo se llama, en dos o tres palabras.
2. Qué logra el consultante al terminarla — algo que se pueda ver, no sentir.
3. Qué se hace adentro, en dos renglones.
4. Qué pasa si se la saltea.

Después dame cinco nombres posibles para el método entero y di cuál elegirías
y por qué, en una línea cada uno.

En castellano neutro, hablando de tú.

Revisa esto antes de quedarte con uno: que las etapas vayan en el orden en que
de verdad ocurren, que ninguna sea un paso administrativo, y que el nombre lo
puedas decir en voz alta en una llamada sin explicarlo.`,

  /* Día 10 · Tu programa de 1.000 USD, en una página. */
  'P2.d10': `Soy {especialidad} en {pais} y trabajo con {avatar}.

Mi promesa es: {promesa}
Mi método es: {metodo}

Ayúdame a escribir mi oferta en una sola página, con esta estructura:

1. A quién es y a quién no es.
2. Qué se lleva al terminar — resultados concretos, no sensaciones.
3. Cómo lo hacemos, en los pasos de mi método.
4. Cuánto dura y cuánto cuesta.
5. Qué pasa si no funciona.

Escríbela hablada, como se lo diría a una persona en voz alta. Sin tono de
venta, sin promesas de más, y sin esas palabras grandes que usa todo el mundo
y no dicen nada. En castellano {dialecto}.

Cuando la tengas, revisa esto antes de usarla: que el punto 2 se pueda medir,
que el punto 5 sea algo que puedas cumplir, y que no haya ni una frase que no
dirías en una llamada.`,

  /* Día 11 · Tus guiones. */
  'P2.d11': `Soy {especialidad} en {pais}. Trabajo con {avatar} y mi promesa es
{promesa}.

Escríbeme tres guiones cortos para grabar a cámara, de cuarenta a sesenta
segundos cada uno, sobre lo que mi consultante vive ANTES de buscarme.

Cada guion, en este orden:

1. La primera línea: algo que le pasó esta semana y reconoce al instante.
2. Por qué le pasa — la causa real, no la que él cree.
3. Qué hace casi todo el mundo en ese momento y por qué no alcanza.
4. Qué sí funciona, en una línea.
5. El cierre: que me escriba si quiere que se lo explique.

Hablado y natural, como si tuviera a alguien enfrente. Sin anunciar el gancho,
sin «te cuento algo», sin cifras. En castellano {dialecto}.

Antes de grabarlos revisa que el punto 1 sea algo que de verdad escuchaste
decir a un consultante tuyo, y que los tres hablen de momentos distintos.`,

  /* Día 16 · Tu perfil y tu página, publicados. */
  'P3.d16': `Soy {especialidad} en {pais}. Mi nicho es {nicho} y trabajo con {avatar}.

Mi promesa: {promesa}
Mi oferta: {oferta}

Necesito el código de una página de una sola columna, en HTML con los estilos
adentro del mismo archivo, sin librerías externas. Tiene que abrirse bien en
teléfono.

El orden de la página:

1. El titular con mi promesa, y debajo una línea de qué se lleva.
2. Para quién es — tres o cuatro renglones.
3. Qué incluye, en lista corta.
4. Quién soy, en un párrafo.
5. El botón para agendar. Déjame el enlace vacío así le pego el de mi
   calendario.

Letra grande, mucho aire, nada de degradados ni sombras de colores. Fondo
claro. Los textos de la página, en castellano {dialecto}.

Cuando lo tengas: pega el código en una página en blanco de El Consultorio y
cambia el enlace del botón por el de tu calendario.

Revisa tres cosas antes de mandársela a nadie: que el titular diga tu promesa
con tus palabras, que el botón abra tu calendario de verdad, y que se lea bien
en tu teléfono.`,

  /* Día 18 · Le avisas a tu entorno. */
  'P4.d18': `Soy {especialidad} y trabajo con {avatar}. Mi oferta nueva es: {oferta}

Escríbeme cuatro mensajes de WhatsApp para avisarle a mi entorno que empiezo
con esto. Uno para cada caso:

1. Un consultante que atendí y terminó bien.
2. Un consultante que dejó de venir hace meses.
3. Un colega que atiende a otra clase de persona y puede derivarme.
4. Un conocido que no es ni lo uno ni lo otro.

Cada mensaje: cuatro o cinco renglones, sin saludo de formulario, sin pedir
que lo reenvíen, y terminando en una pregunta fácil de contestar. Que no
parezca un anuncio pegado en un chat.

En castellano {dialecto}, hablándole de cerca.

Antes de mandarlos revisa que el 2 no haga sentir culpa por haber dejado de
venir, y que ninguno de los cuatro empiece con la misma frase.`,

  /* Día 25 · Tu recuperador. */
  'P5.d25': `Soy {especialidad} y trabajo con {avatar}. Mi oferta es: {oferta}

Escríbeme una secuencia de cinco mensajes para quien pidió información o
agendó y después no contestó más.

Para cada mensaje dime: a los cuántos días va, y el texto.

Las reglas:

1. Ninguno pregunta «¿lo pensaste?» ni «¿sigues interesado?».
2. Cada uno aporta algo por sí mismo: una idea, un caso, una pregunta útil.
3. El tercero nombra en voz alta el motivo más común por el que no siguen.
4. El quinto cierra la puerta con amabilidad y sin reproche, y deja dicho cómo
   volver a abrirla.

Cortos, de teléfono, cuatro renglones como mucho. En castellano {dialecto}.

Revisa antes de cargarlos: que puedas mandar el quinto sin incomodidad, y que
ninguno dependa de un descuento.`,

  /* Día 30 · Tus tres anuncios, listos para salir. */
  'P6.d30': `Soy {especialidad} y trabajo con {avatar} en {pais}.

Mi promesa: {promesa}
Mi oferta: {oferta}

Escríbeme tres anuncios para Meta, cortos, para grabar a cámara. Cada uno con
un momento distinto y real de la persona a la que le hablo.

Cada anuncio, en este orden:

1. Un logro que ya le pasó — algo que hizo, no cómo se siente.
2. El obstáculo que apareció justo después de ese logro.
3. El error que comete casi todo el mundo en ese momento.
4. Lo que sí funciona, en una línea.
5. Quién soy y por qué puedo decirlo.
6. El llamado: ver el video donde lo explico a detalle.

Hablado y natural, como se lo diría a alguien enfrente. Sin ganchos
anunciados, sin «te cuento algo que», sin prometer cifras ni resultados de
salud, y sin afirmarle a quien lee ninguna condición personal. En castellano
{dialecto}, entre 150 y 200 palabras cada uno.

Antes de grabarlos, revisa que el punto 1 sea algo que de verdad le pasó a
tus consultantes, y que los tres momentos sean distintos entre sí.`,

  /* Día 39 · Tus etapas, con lo que pidieron los tres. */
  'P8.2': `Soy {especialidad}. Mi método es {metodo} y mi oferta es {oferta}.

Esto es lo que mis primeros consultantes pidieron o preguntaron durante la
entrega:
[pega acá lo que anotaste de los tres]

Ayúdame a escribir mi protocolo de entrega, etapa por etapa. Para cada etapa:

1. Qué recibe el consultante y en qué momento.
2. Qué es mío y qué es de él.
3. Qué queda grabado de una vez y qué va en vivo cada vez.
4. El límite: qué NO entra en esta etapa, dicho en una línea.

Al final, dime cuál de las cosas que pidieron no entra en ninguna etapa y por
qué conviene dejarla afuera.

En castellano neutro, hablando de tú. Es un documento para mí, no para
publicar.

Revisa antes de usarlo: que el punto 3 te deje menos horas en vivo que ahora,
y que cada límite lo puedas sostener con un consultante enfrente.`,

  /* Día 61 · Lo que respondiste tres veces. */
  'P9B.d61': `Soy {especialidad} y trabajo con {avatar}. Mi oferta es: {oferta}

Estas son las preguntas que vengo contestando una y otra vez:
[pega acá las preguntas, en bruto, como te llegaron]

Conviértelas en respuestas guardadas para mandar por mensaje. Para cada una:

1. El nombre corto con el que la voy a buscar.
2. La respuesta, de cuatro a seis renglones, completa y sin que haya que
   agregarle nada a mano.
3. La pregunta con la que termina, para que la conversación siga.

Agrupa las que son la misma pregunta dicha de dos formas y dime cuáles
agrupaste.

En castellano {dialecto}, como le hablo a mis consultantes.

Revisa antes de guardarlas: que ninguna necesite que le completes un dato cada
vez que la mandas, y que la más larga se lea entera sin desplazar la pantalla.`,

  /* Día 66 · Agrandar el vaso — su escalera. */
  'P9B.d66': `Soy {especialidad} en {pais}. Trabajo con {avatar} y hoy vendo esto:
{oferta}

Ayúdame a armar mi escalera de servicios: qué viene antes y qué viene después
de lo que ya vendo. Tres escalones como mucho, y para cada uno:

1. Cómo se llama y qué resuelve.
2. Para quién es — en qué momento está esa persona.
3. Qué se lleva, concreto.
4. Cuánto trabajo mío cuesta entregarlo, en horas por consultante.
5. Qué lo conecta con el escalón de al lado: por qué el que terminó uno quiere
   el siguiente.

Dime también cuál NO conviene construir todavía y por qué.

En castellano neutro, hablando de tú. Es para mí.

Revisa antes de decidir: que el punto 4 del escalón más barato no te coma más
horas que el caro, y que ningún escalón le sirva a la misma persona en el
mismo momento que otro.`,

  /* Día 85 · Tu ecosistema circular. */
  'P9B.d85': `Soy {especialidad} en {pais}. Trabajo con {avatar}, mi promesa es
{promesa} y mi método es {metodo}.

Escríbeme seis carruseles para publicar, uno por semana, que lleven a lo que
vendo sin pedirlo en cada uno.

Cada carrusel: siete láminas.

1. Lámina 1: una frase que mi consultante diría él mismo.
2. Láminas 2 a 6: una idea por lámina, veinte palabras como mucho, en el orden
   en que las entendería alguien que recién llega.
3. Lámina 7: qué hacer con esto hoy.

Los seis sobre temas distintos, y que juntos cuenten las etapas de mi método
sin nombrarlo como método.

Para cada uno, agrégame el texto del pie de publicación, de tres renglones.

En castellano {dialecto}. Sin prometer resultados de salud ni cifras.

Revisa antes de publicarlos: que la lámina 1 de cada uno se entienda sola sin
las otras seis, y que ninguno se lea como un anuncio.`,
};

/** El encargo de una jornada, ya armado. `null` si esa jornada no tiene. */
export function encargoDe(codigo: string): EncargoArmado | null {
  const plantilla = ENCARGOS[codigo];
  return plantilla ? armarEncargo(plantilla) : null;
}
