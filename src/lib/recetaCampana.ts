/**
 * LA RECETA DE LA CAMPAÑA — UNA, CERRADA, Y SIN MENÚ DE OPCIONES.
 *
 * ═══ POR QUÉ ESTO REEMPLAZA AL ASESOR QUE HABÍA ═══
 *
 * El chat de «Nueva campaña» era un experto genérico de Meta Ads. En sus seis
 * fases le preguntaba al cliente su ticket para recomendarle una estrategia, y
 * le ofrecía «audiencias frías por intereses, custom audiences, lookalikes».
 *
 * Tres problemas, y los tres caros:
 *
 *   1 · La estrategia YA ESTÁ DECIDIDA. Preguntarle al cliente qué quiere
 *       hacer, cuando contrató justamente para que se lo digan, es devolverle
 *       el trabajo. Y cada respuesta suya abría una campaña distinta.
 *
 *   2 · Lo que recomendaba es lo CONTRARIO de lo que hay que hacer. Intereses
 *       y lookalikes con 30 USD al día no tienen con qué aprender: la campaña
 *       gasta el presupuesto entero probando un público que le achicamos a
 *       mano. Broad es lo que corresponde a este presupuesto, y no es una
 *       preferencia: es que el algoritmo necesita espacio para encontrar.
 *
 *   3 · Contestaba cualquier cosa. El cliente le preguntaba por su oferta, por
 *       sus precios, por su método, y el chat opinaba — pisando lo que ya había
 *       sellado en su Camino y lo que le dice su mentor.
 *
 * Acá la receta es una sola y está escrita. El asesor no la elige: la explica,
 * lo ordena y lo lleva paso a paso. Y cuando le preguntan otra cosa, no
 * contesta: dice a dónde ir.
 *
 * ═══ DE DÓNDE SALE CADA NÚMERO ═══
 *
 * Lo marco porque no todo pesa igual:
 *   · MECÁNICA DOCUMENTADA DE META — cómo funciona la subasta y el reparto del
 *     presupuesto. No es opinión: es cómo está hecho el sistema.
 *   · DECISIÓN DE JAVO — el método de TCD. Es la que manda.
 *   · CONVENCIÓN DE INDUSTRIA — lo que se usa, sin dato duro detrás.
 * Nada de acá sale de material de alguien que venda el producto del que habla.
 */

/* ══════════════════ LO QUE SE MONTA, EXACTAMENTE ══════════════════ */

export interface PasoDeLaReceta {
  n: number;
  /** Dónde se hace, con el nombre que tiene en Meta. */
  donde: string;
  titulo: string;
  /** Qué poner. Una sola cosa por paso. */
  queHacer: string;
  /** Por qué, en una línea que se entienda sin saber de pauta. */
  porQue: string;
  /** Lo que NO hay que tocar en este paso. */
  queNoTocar?: string;
  fuente: 'meta' | 'javo' | 'industria';
}

export const LA_RECETA: PasoDeLaReceta[] = [
  {
    n: 1,
    donde: 'Campaña · Objetivo',
    titulo: 'Clientes potenciales',
    queHacer:
      'Elige el objetivo «Clientes potenciales» y, cuando te pregunte dónde se convierte, '
      + 'marca «Sitio web». Nunca «Formularios instantáneos».',
    porQue:
      'Es el objetivo que le dice a Meta que busque personas que completan algo en tu página, '
      + 'no personas que miran. Con «Interacción» traes comentarios; con este traes consultas.',
    queNoTocar:
      'La campaña de ventaja (Advantage+). Esa decide todo sola y no te deja ver qué funcionó.',
    fuente: 'javo',
  },
  {
    n: 2,
    donde: 'Campaña · Presupuesto',
    titulo: 'El presupuesto va en el conjunto, no en la campaña',
    queHacer:
      'Deja apagado el presupuesto de campaña (CBO) y pon 30 USD al día en el conjunto de anuncios.',
    porQue:
      'Con el presupuesto en la campaña, Meta lo reparte entre conjuntos. Vas a tener un solo '
      + 'conjunto, así que no hay nada que repartir, y en el conjunto lo controlas directo.',
    fuente: 'meta',
  },
  {
    n: 3,
    donde: 'Conjunto de anuncios · Ubicación',
    titulo: 'Un idioma, y un solo nivel de poder de compra',
    queHacer:
      'Máximo 3 países, todos del mismo grupo de poder de compra. Empieza por el tuyo y suma '
      + 'uno o dos del mismo grupo. Si dudas, corre solo en el tuyo.',
    porQue:
      'Meta gasta donde la impresión sale más barata, no donde vendes mejor. Si pones España '
      + 'y México juntos, casi todo el presupuesto se va a México porque ahí el alcance cuesta '
      + 'menos — y te quedas sin saber si España funcionaba.',
    queNoTocar:
      'No pongas «Todo Latinoamérica» ni 8 países. Se te va el presupuesto al más barato.',
    fuente: 'meta',
  },
  {
    n: 4,
    donde: 'Conjunto de anuncios · Público',
    titulo: 'Broad: sin intereses, sin lookalikes',
    queHacer:
      'Edad 25 a 55, todos los géneros, y el campo de intereses VACÍO. Nada de públicos '
      + 'similares ni personalizados.',
    porQue:
      'Con 30 USD al día no hay volumen para probar un público elegido a mano. El algoritmo '
      + 'encuentra a quien convierte mirando quién completa tu página — y para eso necesita '
      + 'espacio donde buscar. Cada interés que agregas le saca espacio.',
    queNoTocar:
      'Los intereses. Agregar «psicología» o «bienestar» se siente más preciso y es lo que '
      + 'hace que la campaña no arranque nunca.',
    fuente: 'meta',
  },
  {
    n: 5,
    donde: 'Conjunto de anuncios · Ubicaciones',
    titulo: 'Solo Instagram',
    queHacer:
      'Pasa a «Ubicaciones manuales» y deja marcado solo Instagram: Reels, Feed, '
      + 'Historias y Explorar. Desmarca Facebook completo, Messenger y Audience Network.',
    porQue:
      'Tu anuncio está hecho para Instagram y tu perfil es el que mira quien duda. En '
      + 'Facebook el mismo anuncio se ve fuera de lugar y en Audience Network aparece dentro '
      + 'de juegos: alcance baratísimo que no lee nada.',
    queNoTocar:
      'Las ubicaciones automáticas. Son más baratas por impresión y es exactamente por eso.',
    fuente: 'javo',
  },
  {
    n: 6,
    donde: 'Conjunto de anuncios · Evento',
    titulo: 'El evento que cuenta es el de tu página',
    queHacer:
      'Elige tu píxel y el evento «Cliente potencial» (Lead). Si tu página marca otro, '
      + 'elige ese: tiene que ser el que se dispara cuando alguien completa, no cuando entra.',
    porQue:
      'Es el único dato con el que la campaña aprende. Si optimizas por visitas, va a traerte '
      + 'personas que entran y se van, porque es lo que le pediste.',
    fuente: 'meta',
  },
  {
    n: 7,
    donde: 'Anuncios',
    titulo: 'Tres anuncios, un solo conjunto',
    queHacer:
      'Los tres anuncios van en el MISMO conjunto. No armes un conjunto por anuncio.',
    porQue:
      'En un conjunto, los tres compiten por el mismo presupuesto y en dos semanas uno gana '
      + 'solo. En tres conjuntos, cada uno arranca su aprendizaje por separado con 10 USD, y '
      + 'ninguno junta datos suficientes para decirte nada.',
    queNoTocar:
      'No subas un cuarto anuncio «por si acaso». Tres es lo que este presupuesto puede medir.',
    fuente: 'javo',
  },
  {
    n: 8,
    donde: 'Anuncios · Formato',
    titulo: 'Reel antes que carrusel',
    queHacer:
      'Sube los tres como video vertical 9:16. El carrusel queda para cuando ya tengas un '
      + 'ganador y quieras otra versión del mismo mensaje.',
    porQue:
      'El reel es donde Instagram está poniendo el alcance hoy, y es el formato donde tu cara '
      + 'y tu voz hacen el trabajo. El carrusel se lee; el reel se escucha, y vendiendo algo '
      + 'de 3.000 lo que convence es que te escuchen.',
    fuente: 'javo',
  },
  {
    n: 9,
    donde: 'Anuncios · Destino',
    titulo: 'Directo a tu video',
    queHacer:
      'El link va a tu página con el VSL. Sin palabra clave, sin mensaje automático, sin '
      + 'pedirle que comente.',
    porQue:
      'El anuncio tiene un solo trabajo: llevar a la mayor cantidad de personas correctas a '
      + 'tu video. El video cuenta el programa y vende; el anuncio no.',
    fuente: 'javo',
  },
];

/* ══════════════════ LOS GRUPOS DE PAÍSES ══════════════════ */

/**
 * Agrupados por lo que cuesta llegar a una persona, no por geografía.
 *
 * Esto es convención de industria: no hay un número público del fabricante que
 * ponga a cada país en un grupo. Lo que sí es mecánica documentada de Meta es
 * que el presupuesto se va al alcance más barato dentro del conjunto — y eso es
 * lo que hace que mezclar grupos arruine la medición.
 */
export interface GrupoDePaises {
  id: 'alto' | 'medio' | 'acompanado';
  nombre: string;
  paises: string[];
  nota: string;
}

export const GRUPOS_DE_PAISES: GrupoDePaises[] = [
  {
    id: 'alto',
    nombre: 'Alcance caro, consulta más cara',
    paises: ['España', 'Estados Unidos (en español)', 'Chile', 'Uruguay', 'Panamá', 'Costa Rica'],
    nota:
      'La impresión cuesta más y la consulta también. A cambio, quien llega puede pagar lo que '
      + 'vale tu programa sin pensarlo dos veces.',
  },
  {
    id: 'medio',
    nombre: 'Alcance medio, mucho volumen',
    paises: ['México', 'Argentina', 'Colombia', 'Perú', 'Ecuador', 'República Dominicana'],
    nota:
      'Más conversaciones por el mismo dinero. Hay que filtrar mejor en la página, porque '
      + 'también llega más quien todavía no puede.',
  },
  {
    id: 'acompanado',
    nombre: 'Alcance barato',
    paises: ['Bolivia', 'Paraguay', 'Venezuela', 'Guatemala', 'Honduras', 'Nicaragua'],
    nota:
      'El alcance es tan barato que si lo mezclas con cualquier país de los otros grupos, se '
      + 'lleva el presupuesto entero. Si vas acá, ve solo acá.',
  },
];

/** En qué grupo cae un país, para poder avisar cuando se están mezclando. */
export function grupoDe(pais: string): GrupoDePaises | undefined {
  const n = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return GRUPOS_DE_PAISES.find((g) => g.paises.some((p) => n(p).includes(n(pais).slice(0, 6))));
}

export interface RevisionDePaises {
  ok: boolean;
  /** El aviso, cuando hay algo que decir. Vacío cuando está bien. */
  aviso: string;
}

/** La revisión que faltaba: avisa antes de gastar, no después. */
export function revisarPaises(paises: string[]): RevisionDePaises {
  const limpios = paises.map((p) => p.trim()).filter(Boolean);
  if (limpios.length === 0) {
    return { ok: false, aviso: 'Todavía no elegiste dónde corre. Empieza por tu propio país.' };
  }
  if (limpios.length > 3) {
    return {
      ok: false,
      aviso: `Elegiste ${limpios.length} países. Con 30 USD al día, más de 3 es repartir el `
        + 'presupuesto hasta que no alcance en ninguno. Quédate con 3.',
    };
  }
  const grupos = new Set(limpios.map((p) => grupoDe(p)?.id).filter(Boolean));
  if (grupos.size > 1) {
    return {
      ok: false,
      aviso:
        'Estás mezclando países donde llegar a una persona cuesta muy distinto. Meta va a '
        + 'gastar casi todo en el más barato, y no vas a poder saber si el otro funcionaba. '
        + 'Elige los que estén en el mismo grupo.',
    };
  }
  return { ok: true, aviso: '' };
}

/* ══════════════════ EL PRESUPUESTO ══════════════════ */

/** Decisión de Javo: tres anuncios, 30 al día, en un conjunto. */
export const PRESUPUESTO_DIARIO = 30;
/** Los días que la campaña necesita sin que la toquen. Sale de DIAS_SIN_TOCAR
 *  del Montaje: con el número escrito a mano acá, el día que cambie uno, las
 *  dos pantallas le dirían al cliente dos plazos distintos. */
export { DIAS_SIN_TOCAR as DIAS_DE_APRENDIZAJE } from './montajeCampana';
export const CUANTOS_ANUNCIOS = 3;
export const PAISES_MAX = 3;

/**
 * Lo que 30 USD al día significa en plata, dicho antes de encender.
 *
 * Los 14 días son los que la campaña necesita sin que la toquen. Decirle el
 * total ahora evita la conversación del día 5, cuando ve el gasto acumulado y
 * se asusta: no es que gastó de más, es que no había hecho la cuenta.
 */
export function loQueVaAGastar(dias: number): string {
  const total = PRESUPUESTO_DIARIO * dias;
  return `${PRESUPUESTO_DIARIO} USD por día son ${total} USD en ${dias} días. `
    + 'Si no puedes sostener eso sin tocarlo, baja el programa de fecha antes de encender: '
    + 'una campaña apagada a mitad del aprendizaje no deja ni datos ni ventas.';
}

/* ══════════════════ EL ASESOR: HASTA DÓNDE HABLA ══════════════════ */

/**
 * De qué SÍ habla. Todo lo demás se deriva.
 *
 * La lista existe para poder ser tajante sin improvisar: un «solo hablo de
 * campañas» deja que el modelo decida qué cuenta como campaña, y ahí vuelve a
 * opinar sobre precios.
 */
export const DE_QUE_HABLA = [
  'cómo montar la campaña en Meta, paso por paso',
  'qué poner en cada campo del administrador de anuncios',
  'por qué la receta es así y qué pasa si se cambia',
  'qué países elegir y por qué no mezclarlos',
  'cómo leer lo que pasa después de encender, según el día en que esté',
  'qué NO tocar y en qué momento',
];

/** A dónde manda cada cosa que no es suya. El reemplazo de opinar. */
export const A_DONDE_MANDAR: Array<{ cuando: string; aDonde: string }> = [
  {
    cuando: 'el precio, la oferta, los cupos o a quién le habla',
    aDonde:
      'eso lo sellaste en tu Camino y lo trabajas en la mentoría grupal. Yo monto la campaña '
      + 'con lo que ya decidiste.',
  },
  {
    cuando: 'escribir o corregir los anuncios',
    aDonde: 'está en «Tus 3 anuncios»: ahí se escriben, se auditan y se aprueban.',
  },
  {
    cuando: 'su página de venta, el precio en la página o el formulario',
    aDonde: 'es la sesión de tu página de venta, en el Camino.',
  },
  {
    cuando: 'responder los mensajes o cerrar una venta',
    aDonde: 'eso es con Sofi, tu entrenadora de conversaciones.',
  },
  {
    cuando: 'cuándo apagar, cuándo hacer crecer o qué hacer con los números',
    aDonde: 'está en Activación: la puerta del día en que estás te dice qué toca.',
  },
  {
    cuando: 'contenido orgánico, reels del perfil o seguidores',
    aDonde: 'es con Mateo, tu entrenador de contenido.',
  },
];

/**
 * El prompt del asesor. Restrictivo y tajante, como se pidió.
 *
 * La parte importante no es el tono: es que la receta viene ESCRITA en el
 * prompt. Antes el modelo la improvisaba en cada conversación, y de ahí salían
 * los lookalikes y los intereses.
 */
export function promptDelAsesor(contexto: { paises?: string[]; paso?: number } = {}): string {
  const receta = LA_RECETA.map((p) =>
    `${p.n}. [${p.donde}] ${p.titulo}\n   QUÉ: ${p.queHacer}\n   POR QUÉ: ${p.porQue}`
    + (p.queNoTocar ? `\n   NO TOCAR: ${p.queNoTocar}` : '')).join('\n\n');

  const grupos = GRUPOS_DE_PAISES.map((g) =>
    `· ${g.nombre}: ${g.paises.join(', ')}. ${g.nota}`).join('\n');

  return `Guías el montaje de UNA campaña en Meta. Nada más.

LA RECETA ESTÁ DECIDIDA. No la elijes, no ofreces alternativas, no preguntas qué
prefiere. La explicas y lo llevas paso a paso. Son nueve pasos:

${receta}

LOS GRUPOS DE PAÍSES (máximo ${PAISES_MAX}, todos del mismo grupo):
${grupos}

PRESUPUESTO: ${PRESUPUESTO_DIARIO} USD al día, ${CUANTOS_ANUNCIOS} anuncios, un conjunto. No se negocia.

CÓMO HABLAS
- Un paso por mensaje. Le dices qué poner, por qué, y esperas que lo haga.
- Cuando confirma, pasas al siguiente. Cuando no entiende, lo explicas de nuevo
  más corto, sin pasar al siguiente.
- Corto. Sin listas largas. Sin markdown de títulos.
- Castellano neutro (tú). Nunca voseo.
- Si te pide hacer algo que la receta dice que no se hace, dices que no y por qué
  en una línea. No lo ayudas a hacerlo igual. No le ofreces un término medio.

DE QUÉ HABLAS
${DE_QUE_HABLA.map((x) => `· ${x}`).join('\n')}

DE QUÉ NO HABLAS — y a dónde lo mandas
${A_DONDE_MANDAR.map((x) => `· Si pregunta por ${x.cuando}: ${x.aDonde}`).join('\n')}

Cuando te pregunta algo de esa segunda lista, respondes UNA línea diciendo a
dónde va y vuelves al paso en el que estaba. No opinas «un poco». No das un
adelanto. No dices «pero si quieres te cuento». Es su mentor y su Camino los que
contestan eso, y si tú también contestas, le quedan dos respuestas distintas.

Lo que no está en ninguna de las dos listas: no lo contestas.
${contexto.paso ? `\nVA POR EL PASO ${contexto.paso}.` : ''}
${contexto.paises?.length ? `\nPAÍSES ELEGIDOS: ${contexto.paises.join(', ')}.` : ''}`;
}
