/**
 * LAS TRES RECOMENDACIONES DEL DÍA — turno 22.
 *
 * ═══ QUÉ ES ═══
 *
 * Lo que Javo tiene que hacer hoy con su campaña, en tres líneas como máximo,
 * cada una con el número que la sostiene y la regla que la dictó.
 *
 * ═══ LO QUE NO ES ═══
 *
 * **Acá no escribe la IA.** Es la regla del encargo y es la razón de que este
 * archivo exista: ya hay un diagnóstico de campaña con IA en la app
 * —`DiagnosticoView.tsx`, que le habla al modelo y devuelve markdown— y sirve
 * para pensar en voz alta, no para decidir. Una recomendación que cambia de
 * texto cada vez que se la pide no se puede discutir ni medir, y nadie puede
 * saber si el modelo leyó bien el número.
 *
 * Acá cada línea sale de una función que ya existe y que ya está medida:
 *
 *   · `veredictoMotor` (salaDeMando)     → el freno de los 7 días y el cuello
 *                                          del pipeline propio.
 *   · `veredictoAnuncio` + `UMBRALES`    → qué hacer con cada anuncio, contra
 *     (formulasAnuncios)                   el tope de SU objetivo de campaña.
 *   · `encontrarDomino(calcularCadena)`  → el cuello de botella de la semana,
 *     (valueChain)                         el mismo que ve el cliente.
 *
 * Este archivo NO define un umbral, NO inventa una regla y NO reescribe un
 * texto: los ordena por urgencia, se queda con tres y dice de dónde salió cada
 * uno. Si una regla de la campaña no está en `formulasAnuncios`, no se escribe
 * acá al lado: se propone sumarla allá. Dos listas de umbrales se separan la
 * primera vez que cambia un precio.
 *
 * ═══ POR QUÉ TRES, Y POR QUÉ CON NÚMERO ═══
 *
 * Tres es el pedido, y tiene sentido: una lista de nueve cosas para hacer hoy
 * es una lista de cero cosas hechas. Y ninguna va sin número porque una
 * recomendación sin número no se puede discutir — ni cumplir, ni reclamar.
 *
 * ═══ Y CUANDO EL DATO NO ESTÁ ═══
 *
 * No se rellena ni se silencia: se devuelve en `faltan`, con el nombre del
 * dato y de quién depende. Una pantalla que muestra tres consejos tranquilos
 * sobre una base vacía es peor que una vacía, porque la vacía se nota.
 */
import {
  veredictoMotor, DIAS_PAUTA_SIN_AGENDA,
  type EstadoMotor,
} from './salaDeMando';
import {
  veredictoAnuncio, UMBRALES,
  type ObjetivoCampana,
} from './formulasAnuncios';
import {
  calcularCadena, encontrarDomino,
  type NumerosSemana,
} from './valueChain';

/** Una fila por anuncio, con los cuatro números que la regla necesita. */
export interface FilaDeAnuncio {
  nombre: string;
  gasto: number;
  visitas: number;
  conversaciones: number;
  agendas: number;
}

export interface Recomendacion {
  /** Qué hacer hoy. Una línea. */
  titulo: string;
  /** El número que la sostiene. Nunca va vacío. */
  numero: string;
  /**
   * Por qué, en las palabras de la regla que la dictó.
   *
   * Opcional a propósito: cuando el título y el número ya lo dicen todo
   * —«Nada más importa hasta que entren conversaciones» + «Faltan $30.000 y
   * todavía no hay conversaciones»— agregar una tercera línea es repetir con
   * otras palabras, y repetir es lo que hace que no se lea ninguna.
   */
  porque?: string;
  /**
   * Qué regla la dictó, en palabras, con el nombre de la función entre
   * paréntesis. En ese orden y no al revés: la pantalla es de Javo, no del
   * que programa, y «VEREDICTOMOTOR · EL CUELLO DEL PIPELINE PROPIO» en
   * versalitas le grita un identificador. El nombre igual va, porque sin él
   * no se puede ir a discutir la regla donde vive.
   */
  regla: string;
}

/** Un dato que no está, con su dueño. Nunca un campo mudo. */
export interface DatoQueFalta {
  que: string;
  deQuien: string;
}

export interface EntradaDelDia {
  /** Su motor, como lo carga hoy en Mi Motor. */
  motor: EstadoMotor | null;
  /** Los números de su semana, si están. */
  numeros: NumerosSemana | null;
  /** Dónde corre la campaña. Decide contra qué banda se juzga el costo. */
  paises: string[];
  /**
   * Qué compra la campaña: decide el umbral que aplica, y los umbrales no se
   * parecen entre sí —$1,50 por conversación en `mensajes`, $3,00 en
   * `mensajes_alto`—. Por eso admite `null` y no trae valor por omisión: con
   * un `'mensajes'` puesto por defecto, un anuncio de ticket alto a $2,20 se
   * declararía rojo y se apagaría uno que estaba sano. Sin este dato no se
   * opina de los anuncios: se dice que falta.
   */
  objetivoCampana: ObjetivoCampana | null;
  /** Una fila por anuncio. Vacío mientras los números no lleguen solos. */
  anuncios: FilaDeAnuncio[];
}

export interface ParteDelDia {
  /** Tres como máximo, de la más urgente a la menos. */
  recomendaciones: Recomendacion[];
  /** Lo que no se pudo mirar, y de quién depende. */
  faltan: DatoQueFalta[];
}

const dinero = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;

/**
 * El parte del día.
 *
 * El orden es por lo que cuesta no hacerlo, no por lo que es más fácil:
 * primero lo que está quemando plata ahora mismo (la pauta que hay que
 * cortar, el anuncio en rojo), después el cuello que frena todo lo demás, y
 * al final la oportunidad —reinvertir— que puede esperar al día siguiente sin
 * que nadie pierda nada.
 */
export function recomendacionesDelDia(e: EntradaDelDia): ParteDelDia {
  const faltan: DatoQueFalta[] = [];
  const urgentes: Recomendacion[] = [];
  const medias: Recomendacion[] = [];
  const oportunidades: Recomendacion[] = [];

  // ── 1 · Su motor: el freno de los siete días manda sobre todo lo demás ──
  const v = e.motor ? veredictoMotor(e.motor) : null;

  if (e.motor && v) {
    if (v.cortar) {
      urgentes.push({
        titulo: 'Corta la pauta hoy.',
        numero: `${e.motor.diasSinAgenda} días de pauta sin una sola agenda (el tope es ${DIAS_PAUTA_SIN_AGENDA})`,
        porque: v.accion ?? v.titular,
        regla: 'la regla de los 7 días de pauta sin agenda (veredictoMotor)',
      });
    } else if (v.accion) {
      // El veredicto del motor ya busca el cuello de arriba hacia abajo: su
      // acción es una sola, la que corresponde a ese cuello.
      medias.push({
        titulo: v.accion,
        numero: v.titular,
        regla: 'el cuello de tu pipeline (veredictoMotor)',
      });
    }

    if (v.reinversionDisponible > 0 && !v.cortar) {
      oportunidades.push({
        titulo: 'Puedes subir la pauta.',
        numero: `${dinero(v.reinversionDisponible)} disponibles para reinvertir`,
        porque: 'De cada venta vuelven $1.000 a pauta, con tope de $3.000.',
        regla: 'lo que vuelve a pauta de cada venta (REINVERSION_POR_VENTA)',
      });
    }
  } else {
    faltan.push({
      que: 'Tu motor de la semana: cobrado, conversaciones, agendas, llamadas y cerradas',
      deQuien: 'Tuyo — se carga en Mi Motor',
    });
  }

  // ── 2 · Los anuncios, uno por uno, contra el tope de su objetivo ────────
  if (e.anuncios.length === 0) {
    faltan.push({
      que: 'Los números por anuncio: gasto, visitas, conversaciones y agendas de cada pieza',
      deQuien: 'Los trae el turno 20 (Meta y GHL). Hasta entonces se cargan a mano en el Tablero',
    });
  } else if (!e.objetivoCampana) {
    faltan.push({
      que: 'Qué compra tu campaña (perfil, mensajes o mensajes de ticket alto): sin eso no se sabe contra qué tope medir cada anuncio',
      deQuien: 'Tuyo — es el objetivo del montaje',
    });
  } else {
    const u = UMBRALES[e.objetivoCampana];
    for (const a of e.anuncios) {
      const ver = veredictoAnuncio(e.objetivoCampana, a);
      if (ver.estado === 'sin_datos') continue;

      const base = e.objetivoCampana === 'perfil' ? a.visitas : a.conversaciones;
      const costo = base > 0 ? a.gasto / base : null;
      const numero = costo !== null
        ? `$${costo.toFixed(2)} por ${u.unidad} (el tope es $${u.alarma.toFixed(2)})`
        : `${a.conversaciones} conversaciones y ${a.agendas} agendas`;

      if (ver.estado === 'rojo') {
        urgentes.push({
          titulo: `Apaga «${a.nombre}».`,
          numero,
          porque: ver.texto,
          regla: `el tope de «${u.etiqueta}» (UMBRALES.${e.objetivoCampana})`,
        });
      } else if (ver.estado === 'amarillo') {
        medias.push({
          titulo: `Mira «${a.nombre}» antes de tocarlo.`,
          numero,
          porque: ver.texto,
          regla: `el tope de «${u.etiqueta}» (UMBRALES.${e.objetivoCampana})`,
        });
      }
    }
  }

  // ── 3 · El cuello de la semana, el mismo que ve el cliente ──────────────
  if (e.numeros) {
    if (e.paises.length === 0) {
      // Sin países, `calcularCadena` juzga el costo contra la banda de México
      // en silencio. Antes que opinar mal, se dice.
      faltan.push({
        que: 'Dónde corre tu campaña, para juzgar el costo contra la banda que corresponde',
        deQuien: 'Tuyo — son los países del montaje',
      });
    } else {
      const d = encontrarDomino(calcularCadena(e.numeros, e.paises));
      if (d.indicador) {
        medias.push({
          titulo: d.titulo,
          numero: d.indicador.label,
          porque: d.porque,
          regla: 'el cuello de la cadena (encontrarDomino)',
        });
      }
    }
  } else {
    faltan.push({
      que: 'Tus números de la semana',
      deQuien: 'Tuyos — se cargan en la Mesa de números',
    });
  }

  /*
   * Y se corta en tres. Si sobran urgentes, las medias no entran: el día que
   * hay dos anuncios quemando plata, el cuello de la cadena puede esperar a
   * mañana. Si faltan, se completa con lo que puede esperar.
   */
  const recomendaciones = [...urgentes, ...medias, ...oportunidades].slice(0, 3);

  return { recomendaciones, faltan };
}
