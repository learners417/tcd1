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

/** Los datos del cliente que un encargo puede pedir. */
export interface DatosDelEncargo {
  [clave: string]: string | undefined;
}

/**
 * Lee del almacén lo que el cliente ya selló.
 *
 * Son los campos que el Camino escribe a medida que avanza. Si una jornada
 * pide algo que todavía no está, el encargo lo dice en voz alta.
 */
export function datosDelCliente(): DatosDelEncargo {
  const perfil = leerJSON<Record<string, unknown>>('tcd_profile', {});
  const texto = (v: unknown): string | undefined => {
    const s = typeof v === 'string' ? v.trim() : '';
    return s.length > 0 ? s : undefined;
  };
  /*
   * ═══ SOLO LOS CAMPOS QUE DE VERDAD LLEGAN ═══
   *
   * La primera versión de esto leía `adn_nicho`, `pais`, `oferta`, `precio` y
   * `posicionamiento`. Ninguno existe: `auth.ts` escribe `tcd_profile` con
   * catorce claves y esas no están. O sea que el encargo habría salido
   * siempre con «[tu nicho: todavía sin sellar]», en una pantalla que existe
   * justamente para que salga lleno.
   *
   * Lo agarró la lente del espejo de `tcd_profile`, que compara lo que se
   * ESCRIBE contra lo que se LEE. Yo estaba adivinando nombres de campos;
   * ella tiene la lista.
   *
   * Lo que todavía no viaja —la promesa, el precio, el país— sigue nombrado
   * en los encargos como hueco explícito, que es la verdad: esas piezas se
   * sellan en el ADN y aún no llegan al perfil. El día que viajen, se agregan
   * acá y los encargos se completan solos.
   */
  return {
    nombre: texto(perfil.nombre),
    especialidad: texto(perfil.especialidad),
    avatar: texto(perfil.adn_avatar),
    metodo: texto(perfil.metodo_nombre),
    oferta: texto(perfil.oferta_mid),
  };
}

/** Cómo se llama cada dato cuando hay que pedirlo por su nombre. */
const COMO_SE_LLAMA: Record<string, string> = {
  nombre: 'tu nombre',
  especialidad: 'tu especialidad',
  pais: 'tu país',
  nicho: 'tu nicho',
  avatar: 'a quién sirves',
  promesa: 'tu promesa',
  metodo: 'tu método',
  oferta: 'tu oferta',
  precio: 'tu precio',
  posicionamiento: 'tu posicionamiento',
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

  /* Día 19 · La oferta que se vende sola. */
  'P3.1': `Soy {especialidad} en {pais} y trabajo con {avatar}.

Mi promesa es: {promesa}
Mi método es: {metodo}

Ayúdame a escribir mi oferta en una sola página, con esta estructura:

1. A quién es y a quién no es.
2. Qué se lleva al terminar — resultados concretos, no sensaciones.
3. Cómo lo hacemos, en los pasos de mi método.
4. Cuánto dura y cuánto cuesta: {precio}.
5. Qué pasa si no funciona.

Escríbela hablada, como se lo diría a una persona en voz alta. Sin tono de
venta, sin promesas de más, y sin esas palabras grandes que usa todo el mundo
y no dicen nada. En castellano neutro.

Cuando la tengas, revisa esto antes de usarla: que el punto 2 se pueda medir,
que el punto 5 sea algo que puedas cumplir, y que no haya ni una frase que no
dirías en una llamada.`,

  /* Día 25 · Crear tu página con Claude. */
  'P4.2d': `Soy {especialidad} en {pais}. Mi nicho es {nicho} y trabajo con {avatar}.

Mi promesa: {promesa}
Mi oferta: {oferta}

Necesito el código de una página de venta de una sola columna, en HTML con
los estilos adentro del mismo archivo, sin librerías externas. Tiene que
abrirse bien en teléfono.

El orden de la página:

1. El titular con mi promesa, y debajo una línea de qué se lleva.
2. Para quién es — tres o cuatro renglones.
3. Qué incluye, en lista corta.
4. Quién soy, en un párrafo.
5. El botón para agendar. Déjame el enlace vacío así le pego el de mi
   calendario.

Letra grande, mucho aire, nada de degradados ni sombras de colores. Fondo
claro. En castellano neutro.

Cuando lo tengas: pega el código en una página en blanco de El Consultorio y
cambia el enlace del botón por el de tu calendario.

Revisa tres cosas antes de mandársela a nadie: que el titular diga tu promesa
con tus palabras, que el botón abra tu calendario de verdad, y que se lea bien
en tu teléfono.`,

  /* Día 31 · ENCIENDE, tu campaña única. */
  'P4.4': `Soy {especialidad} y trabajo con {avatar} en {pais}.

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
anunciados, sin «te cuento algo que», sin prometer cifras. En castellano
neutro, entre 150 y 200 palabras cada uno.

Antes de grabarlos, revisa que el punto 1 sea algo que de verdad le pasó a
tus consultantes, y que los tres momentos sean distintos entre sí.`,
};

/** El encargo de una jornada, ya armado. `null` si esa jornada no tiene. */
export function encargoDe(codigo: string): EncargoArmado | null {
  const plantilla = ENCARGOS[codigo];
  return plantilla ? armarEncargo(plantilla) : null;
}
