/**
 * MANUAL DE ANUNCIOS · SISTEMA DE CUPOS (v3) — la lib madre.
 *
 * Todo el sistema de anuncios de la casa, en código: el circuito completo,
 * las 7 reglas, los 8 ingredientes, las 18 fórmulas con espacios para
 * completar, el banco de hooks negativos, el caption que vende solo, el DM
 * y las reglas de decisión. El Constructor (Campañas) consume esta lib y
 * autocompleta los [CORCHETES] con el ADN sellado del sanador.
 *
 * Registro: castellano neutro (tú/tienes). Cero jerga de oficio en textos
 * que ve el cliente final.
 */

/* ══════════════════ EL CIRCUITO (el mapa completo) ══════════════════ */

export const CIRCUITO_CUPOS: { paso: string; detalle: string }[] = [
  { paso: 'El anuncio', detalle: 'Carrusel, reel o stories con marco comercial: una inscripción con lugares limitados. CTA: «Comenta [PALABRA]». Sin precio.' },
  { paso: 'La palabra', detalle: 'Comentario o DM con la palabra clave. El que escribe ya levantó la mano — el comentario ES la primera calificación.' },
  { paso: 'El DM automático', detalle: 'Entrega el link de la página y hace UNA pregunta sobre su situación. Si contesta, hay conversación; si no, el camino sigue solo.' },
  { paso: 'La página', detalle: 'La venta completa: video + oferta + inversión. El precio se conoce acá, en privado, antes de hablar con nadie.' },
  { paso: 'El cierre', detalle: 'Agenda con preguntas obligatorias (programas de alto valor) o compra directa (productos de entrada).' },
  { paso: 'El seguimiento', detalle: 'A las 24-48 h, un solo mensaje a quien pidió el link y no avanzó. El que no contesta dos veces queda para más adelante, no para la insistencia.' },
];

export const POR_QUE_FUNCIONA =
  'La campaña solo tiene que lograr lo barato (comentarios y mensajes), nunca lo caro (compras o reservas). ' +
  'Con 20-25 USD por día se consiguen decenas de conversaciones por semana. Todo lo caro pasa fuera del anuncio: en la página y en la conversación.';

/* ══════════════════ LAS 7 REGLAS DE TODO ANUNCIO ══════════════════ */

export const LAS_7_REGLAS: { titulo: string; texto: string }[] = [
  { titulo: 'El hook filtra, no atrae', texto: 'La primera línea describe una CONDUCTA de tu cliente ideal (lo que hace todos los días, cómo cobra, con quién trabaja). La persona correcta se reconoce sola. Nunca listes profesiones: el rubro sale por el contexto.' },
  { titulo: 'Sin precio en el anuncio', texto: 'El precio vive en la página, en privado y con toda la oferta delante. El anuncio vende la entrada a algo con lugares limitados. Marco comercial siempre — nunca un regalo: lo gratis atrae curiosos, lo limitado atrae compradores.' },
  { titulo: 'El CTA es siempre el mismo', texto: '«Comenta [PALABRA] y te envío los detalles.» Una sola palabra, corta, en mayúsculas, ligada a tu oferta (nunca genérica tipo INFO). La misma en toda la campaña.' },
  { titulo: 'Un golpe por línea', texto: 'Frases cortas. Cada pantalla dice UNA cosa. Si una línea se puede borrar sin perder nada, se borra. Tipografía grande: se lee en un teléfono, en 2 segundos.' },
  { titulo: 'El QUÉ, nunca el CÓMO', texto: 'Cuentas los pasos con nombre y curiosidad («los 3 puntos que hacen que digan sí») sin dar el tutorial. Revelar el método completo mata el deseo. La curiosidad es la palanca más fuerte.' },
  { titulo: 'Prueba propia o ninguna', texto: 'Solo resultados y testimonios reales de tu trabajo, con permiso. Jamás cifras ajenas ni números inventados. Un pantallazo o una frase textual de cliente vale más que diez promesas.' },
  { titulo: 'Una aclaración honesta', texto: 'Baja la promesa en una línea («esto no es magia», «si empiezas de cero tarda más»). Genera confianza, filtra al buscador de fórmulas mágicas y te separa del vendedor de humo.' },
];

/* ══════════════════ LOS 8 INGREDIENTES (receta, no fórmula fija) ══════════════════ */

export interface Ingrediente { id: string; nombre: string; descripcion: string }

export const INGREDIENTES: Ingrediente[] = [
  { id: 'hook', nombre: 'HOOK', descripcion: 'Por resultado deseado, por dolor + pista de solución, o por «piedra ingeniosa» (lo que todos intentan y no es el camino). Define el 80% del resultado.' },
  { id: 'piedras', nombre: 'PIEDRAS', descripcion: 'Lista concreta de lo que NO se necesita: las tácticas que tu cliente ya probó. Variante amable: «no es tu culpa, nadie te lo enseñó».' },
  { id: 'analogia', nombre: 'ANALOGÍA', descripcion: 'Explicación «de primer grado» para lo técnico o abstracto. Nunca lenguaje técnico. Menciona siempre lo SIMPLE que es.' },
  { id: 'nombre', nombre: 'NOMBRE PROPIO', descripcion: 'Todo lo que ofreces tiene nombre nuevo. Con nombre suena a sistema; sin nombre suena a consejo.' },
  { id: 'prueba', nombre: 'PRUEBA', descripcion: 'Un testimonio o resultado real en alguna pantalla. Calla al escéptico sin decir una palabra.' },
  { id: 'dolor', nombre: 'DOLOR > PLACER', descripcion: 'La gente compra para SALIR del dolor. Habla el lenguaje interno de tu cliente, con sus palabras exactas — las que dice cuando nadie lo escucha.' },
  { id: 'aclaracion', nombre: 'ACLARACIÓN', descripcion: 'Una línea honesta que baja la promesa. Confianza y filtro en un solo movimiento.' },
  { id: 'cta', nombre: 'CTA', descripcion: '«Comenta [PALABRA]». A veces se pide la palabra ya en las primeras líneas del caption, antes de contar nada.' },
];

/* ══════════════════ REGLAS DE APROBACIÓN (Meta) ══════════════════ */

export const REGLAS_META: string[] = [
  'Nunca afirmes ni insinúes atributos personales del lector: nada de «tú tienes [condición]» ni «¿estás quemado/endeudado?». Describe la SITUACIÓN en tercera persona («la mayoría pasa el mes…»), no a la persona.',
  'Sin promesas de resultados garantizados ni cifras de ingresos como expectativa típica. Tus resultados se muestran como experiencia, con aclaración honesta.',
  'Testimonios reales, con permiso, y en temas de salud o dinero con el descargo «los resultados dependen de cada persona».',
  'Sin antes/después corporales ni lenguaje médico («cura», «trata», «diagnostica») en anuncios de bienestar.',
  'La página de destino cumple lo mismo: se revisa el anuncio Y la página. Descargo al pie: resultados no garantizados + «este sitio no forma parte de Facebook/Meta ni está avalado por ellos».',
];

/* ══════════════════ LAS 18 FÓRMULAS ══════════════════ */

export type FamiliaFormula = 'piedras' | 'dolor_historia' | 'resultado_metodo' | 'acompana';

export const NOMBRE_FAMILIA: Record<FamiliaFormula, string> = {
  piedras: 'Piedras — desacredita el camino viejo',
  dolor_historia: 'Dolor o historia — conecta con lo que vive',
  resultado_metodo: 'Resultado o método — muestra tu camino con nombre',
  acompana: 'Acompañamiento — va siempre, no cuenta entre las 3',
};

export interface FormulaAnuncio {
  id: number;
  nombre: string;
  familia: FamiliaFormula;
  cuando: string;
  porque: string;
  estructura: string[];
  caption: string;
  ejemplo: string;
  errorComun: string;
}

export const FORMULAS_ANUNCIOS: FormulaAnuncio[] = [
  {
    id: 1, nombre: 'Lo que NO necesitas', familia: 'piedras',
    cuando: 'Para abrir una campaña. Es la más segura del catálogo: desacredita lo que tu cliente ya intentó y posiciona tu camino sin prometer de más.',
    porque: 'Valida el fracaso previo del lector y lo exime de culpa: si lo que intentó no funcionó, no fue por él — fue el camino. El alivio abre la puerta; el contraste vende.',
    estructura: [
      '«Déjame decirte lo que NO necesitas para [RESULTADO DESEADO]…»',
      '✗ [TÁCTICA VIEJA 1] — una línea de por qué no alcanza.',
      '✗ [TÁCTICA VIEJA 2] — una línea.',
      '✗ [TÁCTICA VIEJA 3] — una línea.',
      '«Lo que SÍ necesitas 👉» — 3 puntos numerados, cada uno con una línea del porqué (el QUÉ, no el CÓMO).',
      'Prueba: [TESTIMONIO O RESULTADO REAL].',
      '«Abre [CUPOS] lugares para [PROGRAMA]. Comenta [PALABRA] y te envío los detalles.»',
    ],
    caption: '«Te estancas por hacer demasiado. Necesitas enfoque. Abre [CUPOS] lugares — comenta [PALABRA] y te envío todo.»',
    ejemplo: '«Déjame decirte lo que NO necesitas para volver a dormir de noche: otra app de meditación, otro libro de hábitos, otras vacaciones…»',
    errorComun: 'Piedras genéricas («no necesitas suerte»). Las piedras deben ser tácticas CONCRETAS que tu cliente realmente probó — si no se reconoce en la lista, el anuncio no le habla.',
  },
  {
    id: 2, nombre: 'La analogía de primer grado', familia: 'resultado_metodo',
    cuando: 'Cuando tu método es difícil de explicar o suena técnico. Traduce lo abstracto a una imagen que un niño entiende.',
    porque: 'Lo simple se siente lograble — y la gente solo compra lo que cree poder lograr. La imagen se recuerda y se repite: la analogía viaja de boca en boca; la explicación técnica muere en la pantalla.',
    estructura: [
      'Hook por resultado: «Cómo [RESULTADO CONCRETO] sin [SACRIFICIO QUE TEMEN]».',
      '«Funciona como [ANALOGÍA SIMPLE DE LA VIDA REAL]» — desarrollada en 2 o 3 pantallas.',
      '«Tu caso hoy es [LADO MALO DE LA ANALOGÍA]».',
      '«[PROGRAMA] hace [LADO BUENO DE LA ANALOGÍA]». Menciona lo SIMPLE que es.',
      'Prueba real.',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Es más simple de lo que crees. [ANALOGÍA en una frase]. Comenta [PALABRA] y te muestro cómo aplica a tu caso.»',
    ejemplo: '«Un taxi cobra el viaje… pero paga el combustible de todo el día. Así trabajas tú.»',
    errorComun: 'Analogía ingeniosa que necesita explicación. Si hay que explicarla, no sirve: se descarta y se busca una del mundo cotidiano de tu cliente.',
  },
  {
    id: 3, nombre: 'El dolor agravado', familia: 'dolor_historia',
    cuando: 'Para el cliente que ya sabe que tiene el problema. Cada pantalla aprieta la llaga; el cierre trae la esperanza.',
    porque: 'La gente compra para salir del dolor, y nombrar su diálogo interno con sus palabras exactas produce el efecto «me lee la mente» — la señal más fuerte de que entiendes su caso.',
    estructura: [
      'Pregunta de dolor: «¿Por qué [PROBLEMA QUE VIVE] y cómo arreglarlo?»',
      'Problema 1 + agravarlo con su lenguaje interno + media pista de solución.',
      'Problema 2 + agravar + pista.',
      'Problema 3 + agravar + pista.',
      'Giro de esperanza: «Nada de esto es falta de [LO QUE CREE QUE LE FALTA]. Es [CAUSA REAL].»',
      'CTA: «En [PROGRAMA] lo resolvemos con [MECANISMO, solo el QUÉ]. Comenta [PALABRA].»',
    ],
    caption: '«No es tu culpa. Nadie te enseñó [CAUSA REAL]. Comenta [PALABRA] y te envío los detalles.»',
    ejemplo: '«¿Por qué das todo por todos… y nadie te pregunta cómo estás tú?»',
    errorComun: 'Pasarse a la humillación. Se agrava la SITUACIÓN, jamás se culpa a la persona: «la cuenta no cierra» acompaña; «la cuenta no TE cierra» acusa. Y por políticas: describir la situación, nunca diagnosticar al lector.',
  },
  {
    id: 4, nombre: 'Resultado + los pasos (solo el QUÉ)', familia: 'resultado_metodo',
    cuando: 'Cuando tienes un resultado fuerte y comprobable, tuyo o de un cliente con permiso.',
    porque: 'Prueba + curiosidad, la combinación más vendedora que existe: el resultado demuestra que el camino es real y los pasos con nombre — sin el tutorial — obligan a preguntar «¿y cómo es el paso 2?».',
    estructura: [
      'Hook por resultado: «Cómo [CLIENTE/YO] logró [RESULTADO] en [TIEMPO]».',
      'Piedra rápida: «Sin [VIEJO CAMINO 1] y sin [VIEJO CAMINO 2]».',
      'Prueba (pantallazo, cifra propia o frase textual del cliente).',
      '«Esto fue lo que hicimos:» pasos 1-2-3 con nombre propio y curiosidad, sin tutorial.',
      'Aclaración honesta: «[BAJAR LA PROMESA en una línea]».',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«[RESULTADO] no fue suerte. Fueron 3 pasos. Comenta [PALABRA] y te cuento cuáles.»',
    ejemplo: '«Cómo una de mis clientas pasó de [ANTES] a [DESPUÉS] en [TIEMPO] — sin dejar su trabajo.»',
    errorComun: 'Dar el CÓMO. Si después de leer el anuncio la persona puede hacerlo sola, el anuncio enseñó en vez de vender. Los pasos se nombran, no se explican.',
  },
  {
    id: 5, nombre: 'La piedra ingeniosa', familia: 'piedras',
    cuando: 'Gancho = el tema de moda que TODOS persiguen y que no es el camino. Roba la atención de la conversación del momento.',
    porque: 'Usa la curiosidad ajena como anzuelo propio: el lector llega por el tema que le interesa y se encuentra con un giro que te separa de todos los que repiten lo mismo.',
    estructura: [
      'Hook con el tema que todos persiguen: «¿Cómo [LO QUE TODOS QUIEREN HACER]?»',
      'El giro: «Yo NO lo hice. Y aun así [RESULTADO].»',
      'Por qué ese camino no lleva a donde quieren (2 razones cortas).',
      'Qué hice en su lugar: [CAMINO NUEVO con nombre] — solo el QUÉ.',
      'Prueba.',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Todos te dicen que [LO DE MODA]. Yo hice lo contrario. Comenta [PALABRA] y te muestro qué.»',
    ejemplo: '«¿Cómo tener más consultas? Yo nunca busqué “más”. Busqué otra cosa — y cambió todo.»',
    errorComun: 'Elegir una piedra que tu cliente no persigue. La piedra funciona solo si es SU obsesión actual; si es la obsesión de otro rubro, el hook no frena a nadie.',
  },
  {
    id: 6, nombre: 'Las razones', familia: 'resultado_metodo',
    cuando: 'Formato lista con intriga: explicas por qué NO haces algo esperado, y la razón 3 presenta tu método con nombre propio.',
    porque: 'La lista genera avance automático (¿cuál es la 3?) y la honestidad humana de las primeras razones baja la guardia: cuando llega la razón que vende, el lector ya no está a la defensiva.',
    estructura: [
      'Hook en negativo sobre ti: «¿Por qué NO [COSA QUE SE ESPERARÍA QUE HAGAS]?»',
      'Razón 1 — honesta y humana.',
      'Razón 2 — honesta y humana.',
      'Razón 3 — «porque descubrí [CAMINO NUEVO con nombre]» + una línea de qué logra.',
      'Razón 4 — el resultado en vida real (tiempo, familia, tranquilidad — no solo dinero).',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«No es pereza. Es estrategia. Comenta [PALABRA] y te cuento la razón 3.»',
    ejemplo: '«¿Por qué NO atiendo más horas aunque me lo pidan?»',
    errorComun: 'Razones quejosas o inventadas. Las razones 1 y 2 tienen que ser verdades incómodas y humanas («me cuesta», «no me gusta la presión») — la vulnerabilidad real hace creíble la razón que vende.',
  },
  {
    id: 7, nombre: 'La historia encontrada', familia: 'dolor_historia',
    cuando: 'Conexión profunda. Ideal si tienes marca personal fuerte y una historia real de fondo de pozo.',
    porque: 'Una historia personal auténtica no se puede copiar — cualquiera roba un consejo, nadie roba tu nota del [AÑO]. El objeto físico (mensaje, nota, foto) la vuelve tangible y verificable.',
    estructura: [
      'Hook de intriga: «Encontré [OBJETO REAL: un mensaje viejo, una nota, una foto] que me volvió a [EMOCIÓN].»',
      'La escena: dónde estabas, qué decía, qué sentías en esa época (el fondo del pozo de tu cliente).',
      'El punto de giro: qué entendiste o qué decidiste.',
      'El puente al hoy: «Hoy [SITUACIÓN ACTUAL]. La diferencia fue [MECANISMO, solo el QUÉ].»',
      '«Si estás donde yo estaba…» + CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Esta historia es mía. Pero el camino se puede repetir. Comenta [PALABRA].»',
    ejemplo: '«Encontré una nota en mi agenda de [AÑO]. Decía: “no puedo más”. La escribí yo.»',
    errorComun: 'Inventarla o adornarla. Se nota, y una historia falsa descubierta destruye la marca completa. Si no hay historia real, usa otra fórmula — hay 17 más.',
  },
  {
    id: 8, nombre: 'Lo que NO hice', familia: 'piedras',
    cuando: 'Hook inverso al clásico «cómo lo hice». Descarta caminos y liga cada descarte con lo que hiciste en su lugar.',
    porque: 'Alivia (el camino tiene MENOS cosas, no más) y el par viejo→nuevo en la misma pantalla enseña el contraste sin sermón: cada descarte viene con su reemplazo puesto.',
    estructura: [
      'Hook: «Esto es lo que NO hice para [RESULTADO]».',
      '«No hice [VIEJO 1] → en su lugar, [NUEVO 1]» (ligados en la misma pantalla).',
      '«No hice [VIEJO 2] → en su lugar, [NUEVO 2]».',
      '«No hice [VIEJO 3] → en su lugar, [NUEVO 3]».',
      'Pintar el norte: «El objetivo nunca fue [MÉTRICA DE VANIDAD]. Era [LO QUE DE VERDAD QUIEREN].»',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Menos cosas. Mejor elegidas. Comenta [PALABRA] y te muestro el camino corto.»',
    ejemplo: '«Esto es lo que NO hice para recuperar mis noches: no medité 2 horas, no me fui a un retiro, no renuncié.»',
    errorComun: 'Listar los «no» sin el reemplazo. La lista de descartes sola deja al lector sin camino; el poder está en el par ligado viejo → nuevo.',
  },
  {
    id: 9, nombre: 'Antes vs. Ahora', familia: 'dolor_historia',
    cuando: 'Transformación con contraste. Ideal cuando hay cambios de vida concretos y verificables, con o sin números.',
    porque: 'La transformación es la historia más vieja que existe y la única que todo el mundo termina de leer. Los detalles concretos del antes la vuelven creíble; el resultado de vida (no solo dinero) la vuelve deseable.',
    estructura: [
      'Hook: «Hace [TIEMPO]: [SITUACIÓN ANTES]. Hoy: [SITUACIÓN AHORA]. ¿Qué cambió?»',
      'El antes con detalle emocional (sus palabras exactas).',
      'El ahora — incluye resultado NO monetario (tiempo, familia, salud, paz).',
      '«Lo único que cambió: [MECANISMO con nombre].» Demostración simple y gráfica si hay números.',
      'Aclaración honesta: «No fue de la noche a la mañana. Fueron [TIEMPO REAL].»',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Mismo trabajo. Otra vida. Comenta [PALABRA] y te cuento qué cambió.»',
    ejemplo: '«Hace un año: despierto a las 3 AM mirando el techo. Hoy: duermo 7 horas. ¿Qué cambió?»',
    errorComun: 'Contar solo el resultado en dinero. El lector no quiere dinero: quiere lo que el dinero le compraría. El «ahora» tiene que mostrar la vida, no la cuenta.',
  },
  {
    id: 10, nombre: 'El vehículo nuevo', familia: 'resultado_metodo',
    cuando: 'Presenta tu método como algo distinto a todo lo conocido, con nombre propio desde el hook.',
    porque: 'Lo nuevo no carga con los fracasos de lo viejo: si tu cliente ya fracasó con [LO CONOCIDO], solo un camino NUEVO le permite creer que esta vez será distinto. El nombre propio hace la mitad del trabajo.',
    estructura: [
      'Hook: «Hablemos de [MÉTODO con nombre propio]».',
      '«Sí, [NOMBRE]: de esos en los que ni siquiera tienes que [DOLOR 1], ni [DOLOR 2], ni [DOLOR 3].»',
      'Qué es, en una analogía simple.',
      'Los 3 pasos del QUÉ (1-2-3, con curiosidad).',
      'Prueba.',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«No es [LO CONOCIDO 1]. No es [LO CONOCIDO 2]. Es [NOMBRE]. Comenta [PALABRA].»',
    ejemplo: '«Hablemos de [MÉTODO]: de esos en los que no tienes que contarle tu vida a un desconocido ni esperar años para ver un cambio.»',
    errorComun: 'Nombre genérico («mi programa de acompañamiento»). Sin nombre propio no hay camino nuevo — hay un consejo más. El nombre se elige antes de escribir el anuncio.',
  },
  {
    id: 11, nombre: 'Te mintieron', familia: 'piedras',
    cuando: 'Contrarian directo: ataca una creencia instalada de tu cliente y la reemplaza por tu marco.',
    porque: 'Le da al lector un culpable externo (la creencia que le vendieron) y con eso lo libera de la culpa propia. Un lector liberado de culpa está dispuesto a intentar de nuevo — contigo.',
    estructura: [
      'Hook: «Te mintieron sobre [TEMA CENTRAL DE TU CLIENTE]».',
      'La mentira instalada: «Te dijeron que [CREENCIA COMÚN]».',
      'Por qué es mentira — con lógica simple o una cuenta que se entienda en 5 segundos.',
      'La verdad: «[TU MARCO]» + qué cambia cuando lo ves así.',
      '«No es tu culpa. Nadie te lo enseñó.»',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Lo creíste porque todos lo repiten. Comenta [PALABRA] y te muestro la cuenta real.»',
    ejemplo: '«Te mintieron: descansar el fin de semana no cura el cansancio que tienes.»',
    errorComun: 'Atacar a personas o gremios en vez de a la creencia. «Te mintieron» señala una idea suelta en el aire; nombrar culpables convierte el anuncio en pelea — y las peleas no venden.',
  },
  {
    id: 12, nombre: 'La secuencia de 3 stories', familia: 'acompana',
    cuando: 'Formato stories para acompañar TODA campaña: calienta a tu audiencia mientras los anuncios traen a la nueva. Minimalista: texto sobre fondo, sin cámara.',
    porque: 'Las stories hablan a los que ya te siguen — la audiencia más caliente que existe. Tres toques el mismo día crean efecto de evento: algo está por pasar y los lugares son limitados.',
    estructura: [
      'Story 1 — Curiosidad: «[AFIRMACIÓN INTRIGANTE sobre el resultado o el método]» + encuesta o caja de preguntas.',
      'Story 2 — Contexto: «Abre [CUPOS] lugares para [PROGRAMA]. Es para quien [CONDUCTA DE TU CLIENTE].»',
      'Story 3 — CTA: «Escríbeme [PALABRA] por DM y te envío los detalles antes que a nadie.»',
    ],
    caption: 'No lleva caption. Las 3 stories se publican con horas de diferencia el mismo día. Repetible 2-3 veces por semana con distinto ángulo.',
    ejemplo: 'Story 1: «Hay una cuenta que casi nadie hace… y explica por qué trabajas tanto y queda tan poco.» + encuesta «¿la hiciste alguna vez?»',
    errorComun: 'Vender en la story 1. La secuencia vive de la escalera curiosidad → contexto → pedido; si la primera ya pide, no hay escalera y no hay evento.',
  },
  {
    id: 13, nombre: 'El versus (con vs. sin)', familia: 'piedras',
    cuando: 'Comparación lado a lado de la vida CON tu método y SIN él. Puede ir sin CTA en el creativo si el caption vende.',
    porque: 'La comparación hace la elección obvia sin ordenar nada: el lector concluye solo, y una conclusión propia vale diez afirmaciones ajenas. El cierre de preferencia («yo prefiero…») invita en lugar de empujar.',
    estructura: [
      'Hook: «[LOGRAR RESULTADO] con [TU MÉTODO] vs. sin [TU MÉTODO]».',
      'SIN: «tienes que [ESFUERZO 1], [ESFUERZO 2], [ESFUERZO 3]…» (la rutina dolorosa actual, con detalle).',
      'CON: «en cambio, [ALIVIO 1], [ALIVIO 2], [ALIVIO 3]».',
      'Cierre de preferencia: «No sé tú, pero yo prefiero [LO NUEVO] antes que [LO VIEJO].»',
      'CTA en el caption: «Comenta [PALABRA]».',
    ],
    caption: '«Los dos caminos llevan trabajo. Solo uno lleva a [RESULTADO]. Comenta [PALABRA] y te muestro la diferencia.»',
    ejemplo: '«Recuperar tu energía con un protocolo diario vs. esperando a las vacaciones…»',
    errorComun: 'Caricaturizar el «sin». El lado malo tiene que ser EXACTAMENTE la vida actual de tu cliente, descrita con respeto — si se siente burlado, se va; si se siente retratado, comenta.',
  },
  {
    id: 14, nombre: 'Mi peor error', familia: 'resultado_metodo',
    cuando: 'Autoridad + humildad. El error confesado es EXACTAMENTE lo que tu cliente hace hoy.',
    porque: 'La confesión construye autoridad sin arrogancia: quien admite un error caro ya lo superó. Y como el error es la conducta actual del lector, se reconoce y corrige el rumbo contigo — sin sentirse atacado ni una vez.',
    estructura: [
      'Hook: «Me tomó [TIEMPO] lograr [RESULTADO GRANDE]. Y este fue el peor error que cometí desde el comienzo:»',
      'El error: «[LO QUE TU CLIENTE HACE HOY]» — dicho como confesión propia, no como acusación.',
      'Qué costaba ese error (tiempo, dinero, energía — con detalle).',
      'El cambio: «Cuando dejé de [ERROR] y empecé a [NUEVO CAMINO con nombre], todo cambió.»',
      'Prueba o resultado del cambio.',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«El error no fue trabajar poco. Fue trabajar en lo equivocado. Comenta [PALABRA].»',
    ejemplo: '«Me tomó 4 años tener mi agenda como la quería. Y este fue mi peor error: intentar convencer a gente que no estaba lista.»',
    errorComun: 'Confesar un error que tu cliente no comete. Solo funciona si el error confesado es el espejo exacto de su conducta actual — se elige mirando al cliente, no la biografía propia.',
  },
  {
    id: 15, nombre: 'El espejo', familia: 'dolor_historia',
    cuando: 'Describe la rutina dolorosa de tu cliente en tercera persona («la mayoría de…»). El lector se ve sin ser señalado.',
    porque: 'La tercera persona esquiva la defensa: nadie se siente acusado por la descripción de «la mayoría» — pero si el detalle es preciso, cada lector piensa «ese soy yo». Además es el formato más seguro ante las políticas.',
    estructura: [
      'Hook: «La mayoría de [DESCRIPCIÓN POR CONDUCTA, no profesión] pasa [PERÍODO] entero [CONDUCTA DOLOROSA 1]…»',
      '«…[CONDUCTA DOLOROSA 2], [CONDUCTA DOLOROSA 3]» — la película completa de su semana, con detalle real.',
      'El diagnóstico: «El problema no es [LO QUE CREEN]. Es [CAUSA REAL].»',
      'La salida: «[TU CAMINO con nombre]» — solo el QUÉ.',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Si te viste en alguna de estas líneas, esto es para ti. Comenta [PALABRA].»',
    ejemplo: '«La mayoría pasa el mes persiguiendo gente por mensajes, bajando el precio, tratando de convencer a personas que todavía no están listas…»',
    errorComun: 'Detalles vagos. El espejo vive de la precisión quirúrgica: «revisa el teléfono a las 6:50 antes de levantarse» retrata; «está muy ocupado» no retrata a nadie.',
  },
  {
    id: 16, nombre: 'La decisión', familia: 'piedras',
    cuando: 'Una decisión concreta, con fecha, que cambió todo: abandonar el viejo camino y abrazar el nuevo.',
    porque: 'Una decisión con fecha es memorable, verificable y — sobre todo — copiable: el lector no tiene que aprender un método entero, solo tiene que tomar LA MISMA decisión. Eso reduce la compra a un solo acto.',
    estructura: [
      'Hook: «Hace [TIEMPO] tomé una decisión que cambió por completo [MI TRABAJO / MI VIDA]:»',
      '«Abandoné por completo [VIEJO CAMINO] y me enfoqué en [NUEVO CAMINO con nombre].»',
      'Por qué fue difícil tomarla (lo que todos decían).',
      'Qué pasó después — resultado con prueba, incluyendo lo no monetario.',
      'Aclaración honesta.',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«Una decisión. Todo lo demás fue consecuencia. Comenta [PALABRA].»',
    ejemplo: '«Hace 5 años dejé de regalar mi hora para “darme a conocer”. Fue la mejor decisión de mi trabajo.»',
    errorComun: 'Decisión abstracta («decidí creer en mí»). La decisión tiene que ser operativa: dejar X concreto, empezar Y concreto. Lo abstracto inspira; lo concreto vende.',
  },
  {
    id: 17, nombre: '¿Te pasó?', familia: 'dolor_historia',
    cuando: 'Un momento específico de fracaso que tu cliente vivió en carne propia, contado hasta el instante exacto del quiebre.',
    porque: 'El momento exacto activa la memoria del lector: no lee una idea, revive SU escena. Y quien revive su fracaso necesita la explicación de por qué pasó — que es justo lo que la pantalla 4 le da.',
    estructura: [
      'Hook: «¿Alguna vez [SITUACIÓN ESPECÍFICA QUE INTENTÓ]?»',
      'La escena: «Todo iba bien mientras [PARTE QUE FLUYE]…»',
      'El momento exacto del quiebre: «…pero cuando llegó [EL MOMENTO CRÍTICO], todo se cayó.»',
      'Por qué pasa (la causa que nadie le explicó): «No fue [LO QUE CREE]. Fue [CAUSA REAL].»',
      'La alternativa con nombre — solo el QUÉ.',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«No falló tu esfuerzo. Falló el orden de los pasos. Comenta [PALABRA].»',
    ejemplo: '«¿Alguna vez bajaste tu precio para no perder a alguien… y igual se fue?»',
    errorComun: 'Escena genérica sin el instante del quiebre. «¿Te costó cobrar?» no revive nada; «cuando llegó el momento de decir el precio, se te cerró la garganta» revive todo.',
  },
  {
    id: 18, nombre: 'El secreto de las leyendas', familia: 'resultado_metodo',
    cuando: 'Autoridad prestada: el método viene de los grandes de tu campo; tú lo traduces a tu mundo. Útil cuando tu prueba propia todavía es corta.',
    porque: 'Toma la credibilidad ya construida por los referentes y la transfiere: el lector no tiene que creer en ti — tiene que creer que supiste traducir algo que ya funciona. Un estándar mucho más bajo de confianza.',
    estructura: [
      'Hook: «Hay un secreto que [LOS REFERENTES DE TU CAMPO] usaron para [RESULTADO GRANDE]…»',
      '«…y casi nadie lo aplica en [TU MUNDO].»',
      'El secreto, como principio (no el tutorial): «[EL PRINCIPIO en una frase]».',
      'Cómo se traduce a [TU CONTEXTO]: [TU MÉTODO con nombre].',
      'Prueba propia (aunque sea un caso).',
      'CTA: «Comenta [PALABRA]».',
    ],
    caption: '«No lo inventé yo. Lo adapté. Comenta [PALABRA] y te muestro cómo funciona en [TU CAMPO].»',
    ejemplo: '«Hay un principio que los grandes maestros de la salud usaron durante décadas… y casi nadie lo aplica al precio de su hora.»',
    errorComun: 'Colgarse de nombres famosos con sus cifras como promesa. Además de violar políticas, invierte la comparación en contra. Se toma el PRINCIPIO de las leyendas, jamás sus números.',
  },
];

/* ══════════════════ ELECCIÓN DE LAS 3 ══════════════════ */

export const FAMILIAS_TEST: Record<Exclude<FamiliaFormula, 'acompana'>, number[]> = {
  piedras: [1, 5, 8, 11, 13, 16],
  dolor_historia: [3, 7, 9, 15, 17],
  resultado_metodo: [2, 4, 6, 10, 14, 18],
};

export const GUIAS_ELECCION: string[] = [
  'No se eligen las 3 que más gustan: se eligen 3 que ataquen distinto — una de piedras, una de dolor o historia, una de resultado o método. Si las 3 son parecidas, el test no enseña nada.',
  'Sin prueba propia fuerte → evita la 4 y la 9; considera la 18.',
  'Marca personal con historia real → la 7, la 14 o la 16.',
  'Cliente corporativo → la 13, la 15 y la 18 rinden mejor que las de dolor íntimo.',
  'La fórmula 12 (stories) acompaña siempre y no cuenta entre las 3.',
];

/* ══════════════════ MUNICIÓN ══════════════════ */

export const BANCO_HOOKS_NEGATIVOS: string[] = [
  '«No hagas más [LO QUE TU CLIENTE HACE HOY].»',
  '«Deja de [CONDUCTA DOLOROSA] de una vez.»',
  '«Si quieres [RESULTADO], nunca hagas [TÁCTICA COMÚN].»',
  '«Deja de perseguir [LO QUE PERSIGUE]. Empieza a [LO NUEVO].»',
  '«[TÁCTICA DE MODA] no es tu problema. [CAUSA REAL] sí.»',
  '«No necesitas [LO QUE CREE NECESITAR]. Necesitas [LO QUE SÍ].»',
  '«Deja de regalar [LO QUE REGALA]. Te está costando [LO QUE PIERDE].»',
  '«Nunca más [CONDUCTA] esperando que [RESULTADO] llegue solo.»',
];

export const REGLAS_HOOK_NEGATIVO =
  'Dos reglas: (1) se prohíbe una TÁCTICA que tu cliente hace hoy, jamás se ataca lo que la persona es; ' +
  '(2) todo «deja de X» lleva cerca su «empieza a Y» — la prohibición sin reemplazo frustra en lugar de vender.';

export const CAPTION_VENDEDOR: string[] = [
  'Apertura de intriga: «Revelando mi manera favorita de [RESULTADO]…»',
  'Pregunta provocadora + triple sí: «¿[IDEA CONTRAINTUITIVA]? Sí. Sí. Sí. Es lo mejor que puedes hacer…»',
  '«Toma nota:» — la receta numerada del QUÉ (5 a 10 pasos cortos, con nombre y curiosidad, sin tutorial).',
  'Piedras en futuro: «Vas a dejar de [VIEJO 1]… Vas a dejar de [VIEJO 2]… Vas a dejar de [VIEJO 3]…»',
  'La transformación: «Y en vez de eso, vas a pasar de [ANTES] a [DESPUÉS] en [TIEMPO].»',
  'CTA: «Comenta [PALABRA] y te envío los detalles.»',
];

export const REGLA_URGENCIA =
  'Solo urgencia REAL (fecha de inicio, cupos verdaderos, precio que efectivamente sube). La urgencia inventada se detecta, mata la confianza y puede costar la cuenta publicitaria.';

/* ══════════════════ EL DM AUTOMÁTICO ══════════════════ */

export const DM_AUTOMATICO = {
  mensaje: '«¡Buenísimo! Acá tienes todo lo de [PROGRAMA] 👉 [LINK A LA PÁGINA].\nMíralo tranquilo y cuéntame: [PREGUNTA].»',
  reglaPregunta: 'La [PREGUNTA] es UNA sola, fácil de contestar, y sobre SU situación — nunca sobre el programa. Ejemplos: «¿hace cuánto vienes con esto?», «¿qué probaste hasta ahora?», «¿es para ti o para tu equipo?».',
  seguimiento: '«¿Pudiste verlo? ¿Qué te quedó dando vueltas?» — a las 24-48 h, solo a quien pidió el link y no avanzó. Un solo seguimiento.',
  reglasPalabra: [
    'Una palabra corta, en mayúsculas, ligada a la oferta o al mecanismo (nunca genérica tipo «INFO»).',
    'La misma palabra en todos los anuncios de la campaña — cambiarla rompe la medición.',
    'Configurada en la herramienta de automatización ANTES de encender, probada con un comentario real.',
  ],
};

/* ══════════════════ MÉTRICAS Y DECISIÓN ══════════════════ */

/**
 * El objetivo de la campana decide con QUE regla se la juzga.
 * Un clic a mensaje abre un chat, no un checkout: el evento que Meta optimiza
 * esta antes en el embudo, asi que el costo NO se compara con el de una
 * campana de trafico. Juzgar mensajes con el umbral de visitas apagaba
 * anuncios sanos.
 */
export type ObjetivoCampana = 'perfil' | 'mensajes' | 'mensajes_alto';

export interface UmbralObjetivo {
  etiqueta: string;
  /** Como se llama la unidad que se compra */
  unidad: string;
  /** Zona sana (USD) */
  sano: [number, number];
  /** Arriba de esto se apaga */
  alarma: number;
  nota: string;
}

export const UMBRALES: Record<ObjetivoCampana, UmbralObjetivo> = {
  perfil: {
    etiqueta: 'Trafico al perfil',
    unidad: 'visita',
    sano: [0.02, 0.07],
    alarma: 0.07,
    nota: 'Compra visitas al perfil. Es la mas barata y la mas lejos de la venta.',
  },
  mensajes: {
    etiqueta: 'Mensajes (LATAM)',
    unidad: 'conversacion',
    sano: [0.25, 0.70],
    alarma: 1.50,
    nota: 'LATAM es de los mercados mas baratos del mundo para mensajes. Arriba de $1,50 el problema es el creativo.',
  },
  mensajes_alto: {
    etiqueta: 'Mensajes · ticket alto',
    unidad: 'conversacion',
    sano: [1.20, 2.50],
    alarma: 3.00,
    nota: 'Publico chico y caro: la conversacion cuesta mas, pero una venta paga muchas.',
  },
};

export const METRICAS_REGLAS = {
  /** @deprecated Usar UMBRALES.perfil.alarma. Se conserva para no romper llamadas viejas. */
  maxCostoPorVisitaUSD: 0.07,
  /** Los primeros N dias no se opina: se mide. */
  diasSinOpinar: 14,
  /** De cada 4 conversaciones, al menos 1 tiene que agendar. Debajo de esto el
   *  problema NO es el anuncio: es el DM o la pagina. */
  minConversacionAAgenda: 0.25,
  /** Refrescar el creativo del ganador cada N semanas (mismo esqueleto, otro hook). */
  semanasRefresh: [2, 4] as [number, number],
  primaria: 'Costo por conversacion iniciada (comentario con la palabra o DM). Es lo unico que la campana controla.',
  negocio: 'Conversaciones → reservas calificadas o ventas. Se mira por semana, no por dia.',
  alarma: 'Muchas conversaciones y cero reservas = el problema NO es el anuncio — es la pagina o el DM. No se toca el anuncio hasta revisar los otros dos.',
  continuidad: 'El ganador queda corriendo; los otros dos se apagan. Gana el de menor costo por conversacion QUE ADEMAS genera reservas.',
};

/**
 * Los dias de medicion dependen del gasto, no del calendario. Con $10 al dia,
 * 4 dias no dan senal y apagar temprano es tirar plata; con $50 o mas la
 * senal llega antes y esperar 14 dias es quemar presupuesto.
 */
export function diasDeMedicion(gastoDiarioUSD: number): number {
  if (gastoDiarioUSD >= 50) return 7;
  if (gastoDiarioUSD >= 25) return 10;
  return METRICAS_REGLAS.diasSinOpinar;
}

/** El veredicto de una pieza, con la regla que corresponde a SU objetivo. */
export function veredictoAnuncio(
  objetivo: ObjetivoCampana,
  d: { gasto: number; visitas: number; conversaciones: number; agendas: number },
): { estado: 'rojo' | 'amarillo' | 'verde' | 'sin_datos'; texto: string } {
  const u = UMBRALES[objetivo];
  const { gasto, visitas, conversaciones, agendas } = d;
  if (!gasto && !visitas && !conversaciones) {
    return { estado: 'sin_datos', texto: 'Cargando datos… con mas numeros, el tablero decide.' };
  }
  const base = objetivo === 'perfil' ? visitas : conversaciones;
  const costo = base > 0 ? gasto / base : null;

  if (costo !== null && costo > u.alarma) {
    return {
      estado: 'rojo',
      texto: `$${costo.toFixed(2)} por ${u.unidad} — el tope de esta campana es $${u.alarma.toFixed(2)}. Apagalo y refresca el creativo con otro hook.`,
    };
  }
  if (conversaciones >= 5 && agendas === 0) {
    return {
      estado: 'amarillo',
      texto: 'Conversaciones si, agendas no — el problema NO es el anuncio: revisa tu pagina y tu DM antes de tocar nada.',
    };
  }
  if (conversaciones >= 8 && agendas / conversaciones < METRICAS_REGLAS.minConversacionAAgenda) {
    return {
      estado: 'amarillo',
      texto: `Solo ${Math.round((agendas / conversaciones) * 100)}% de tus conversaciones agenda (deberia ser 25% o mas). El anuncio trae gente; el DM la pierde.`,
    };
  }
  if (conversaciones > 0 && agendas > 0) {
    return {
      estado: 'verde',
      texto: `$${(gasto / conversaciones).toFixed(2)} por conversacion y agenda. Este queda.`,
    };
  }
  return { estado: 'sin_datos', texto: 'Cargando datos… con mas numeros, el tablero decide.' };
}

/* ══════════════════ AUDITORÍA DE INGREDIENTES ══════════════════ */

export interface ResultadoAuditoria {
  /** Los ids de lo que falta, para poder pedirle a la IA que lo escriba. */
  faltantesIds?: string[];
  presentes: string[];
  faltantes: string[];
  aprobada: boolean;
  nota: string;
}

/**
 * Detección orientativa de los 8 ingredientes en una pieza (guion + caption).
 * No reemplaza el ojo humano: señala lo que FALTA para revisarlo antes de publicar.
 * Regla del manual: si faltan más de dos ingredientes, la pieza no sale.
 */
export function auditarPieza(texto: string): ResultadoAuditoria {
  const t = ' ' + texto.toLowerCase() + ' ';
  const senales: Record<string, RegExp> = {
    // El hook NO puede darse por presente siempre: así estaba antes (/./)
    // y aprobaba cualquier primera línea, incluidas las genéricas. Se juzga
    // por lo que hace un hook: prometer un resultado, nombrar un dolor,
    // contradecir una creencia o abrir con una pregunta — en pocas palabras.
    hook: /^[^\n]{8,150}(\?|:|\.\.\.|—|!)|^(c[oó]mo|por qu[eé]|si |cuando |deja de|nunca|lo que|nadie|3 |4 |5 |el error|te mintieron|no necesitas)/i,
    piedras: /(no necesitas|no hagas|deja de|nunca hagas|sin (otro|otra|más)|no hice|abandon[eé])/,
    analogia: /(funciona como|es como|igual que|imagina|como un |como una )/,
    nombre: /(\[m[eé]todo\]|\[programa\]|\[nombre\]|\bm[eé]todo [a-záéíóúñ]{3,}|protocolo [a-záéíóúñ]{3,})/,
    prueba: /(testimonio|cliente|resultado real|pas[oó] de|pantallazo|logr[oó])/,
    dolor: /(dolor|cansad|agotad|persiguiendo|no puedo m[aá]s|se te cierra|madrugada|3 am|culpa|miedo)/,
    aclaracion: /(no es magia|no pas[oó] de la noche|tarda|no fue de un d[ií]a|resultados dependen|si empiezas de cero)/,
    cta: /comenta\s+[«"']?[a-záéíóúñ]{3,}/,
  };
  const primeraLinea = texto.trim().split('\n')[0]?.trim() ?? '';
  const presentes: string[] = [];
  const faltantes: string[] = [];
  const faltantesIds: string[] = [];
  for (const ing of INGREDIENTES) {
    // El hook vive en la primera línea; el resto puede estar en cualquier lado.
    const donde = ing.id === 'hook' ? primeraLinea : t;
    if (senales[ing.id]?.test(donde)) presentes.push(ing.nombre);
    else { faltantes.push(ing.nombre); faltantesIds.push(ing.id); }
  }
  const aprobada = faltantes.length <= 2;
  return {
    presentes,
    faltantes,
    faltantesIds,
    aprobada,
    nota: aprobada
      ? 'La pieza tiene sus ingredientes. Revísala una vez en voz alta y está lista.'
      : `Faltan ${faltantes.length} ingredientes — la regla dice: con más de dos faltando, la pieza no sale. Complétala antes de publicar.`,
  };
}

/* ══════════════════ ACCESOS RÁPIDOS ══════════════════ */

export function formulaPorId(id: number): FormulaAnuncio | null {
  return FORMULAS_ANUNCIOS.find((f) => f.id === id) ?? null;
}

export const FORMULA_STORIES = FORMULAS_ANUNCIOS.find((f) => f.id === 12)!;


/* ══════════════════ RECOMENDADOR DE FÓRMULAS ══════════════════ */

/**
 * Elige las 3 fórmulas por el sanador, en vez de darle un menú de 18.
 *
 * POR QUÉ: las opciones matan al principiante. Alguien que arranca no tiene
 * criterio para elegir entre "El espejo" y "¿Te pasó?", y elegir mal le
 * cuesta una semana de pauta. El default anterior era el mismo para todos
 * (1, 15 y 10) sin mirar nada de su ADN.
 *
 * La regla del Manual no se toca: una de piedras, una de dolor o historia y
 * una de resultado o método. Lo que decide acá es CUÁL de cada familia,
 * según lo que el sanador ya selló.
 */

export interface SenalesSanador {
  /** Tiene un resultado propio, con permiso para contarlo. */
  tienePrueba: boolean;
  /** Su marca es él: cuenta su historia, da la cara. */
  marcaPersonal: boolean;
  /** Tiene frases textuales de sus clientes. */
  tieneFrases: boolean;
  /** Su método tiene nombre propio. */
  metodoConNombre: boolean;
  /** Cargó las tácticas que su cliente ya probó y le fallaron. */
  tienePiedras: boolean;
}

export interface Recomendacion {
  id: number;
  nombre: string;
  /** Por qué esta y no otra. Se le muestra al sanador. */
  porQue: string;
}

export type RecomendacionTrio = Record<Familia3, Recomendacion>;

/** Familias del test (la 12, de stories, acompaña siempre y no cuenta). */
export type Familia3 = 'piedras' | 'dolor_historia' | 'resultado_metodo';

function ficha(id: number): FormulaAnuncio {
  const f = FORMULAS_ANUNCIOS.find((x) => x.id === id);
  if (!f) throw new Error(`fórmula ${id} inexistente`);
  return f;
}

/**
 * Las tres fórmulas para este sanador, con el motivo de cada una.
 *
 * Las guías vienen del Manual: sin prueba propia fuerte se evitan la 4 y la 9
 * y se considera la 18; con marca personal y una historia real van la 7, la
 * 14 o la 16; con avatar corporativo, la 13, la 15 y la 18.
 */
export function recomendarFormulas(s: SenalesSanador): RecomendacionTrio {
  // ── PIEDRAS: lo que su cliente ya probó y no le funcionó ──
  let piedras: Recomendacion;
  if (s.tienePiedras) {
    piedras = {
      ...ficha(1),
      porQue: 'Cargaste lo que tu paciente ya intentó. Esta fórmula usa exactamente eso, y es la más segura para abrir una campaña.',
    };
  } else if (s.marcaPersonal) {
    piedras = {
      ...ficha(16),
      porQue: 'Tu marca eres tú: una decisión concreta tuya, con fecha, filtra mejor que una lista de errores ajenos.',
    };
  } else {
    piedras = {
      ...ficha(13),
      porQue: 'Sin marca personal fuerte, la comparación lado a lado explica sola: se entiende sin que tengas que dar la cara.',
    };
  }

  // ── DOLOR o HISTORIA ──
  let dolor: Recomendacion;
  if (s.marcaPersonal && s.tienePrueba) {
    dolor = {
      ...ficha(7),
      porQue: 'Tienes marca personal y un resultado real: tu historia es tu activo más fuerte y esta fórmula la pone a trabajar.',
    };
  } else if (s.tieneFrases) {
    dolor = {
      ...ficha(15),
      porQue: 'Tienes las frases textuales de tus pacientes. Esta fórmula las devuelve como espejo, con sus palabras y no con las tuyas.',
    };
  } else {
    dolor = {
      ...ficha(17),
      porQue: 'Todavía no cargaste frases de tus pacientes, así que conviene un momento concreto de fracaso que cualquiera reconozca.',
    };
  }

  // ── RESULTADO o MÉTODO ──
  let resultado: Recomendacion;
  if (s.tienePrueba) {
    resultado = {
      ...ficha(4),
      porQue: 'Tienes un resultado comprobable y con permiso. Es la fórmula más fuerte del catálogo, y solo se puede usar cuando la prueba es real.',
    };
  } else if (s.metodoConNombre) {
    resultado = {
      ...ficha(10),
      porQue: 'Tu método ya tiene nombre propio. Sin prueba propia todavía, presentarlo como algo distinto es el camino honesto.',
    };
  } else {
    resultado = {
      ...ficha(18),
      porQue: 'Sin prueba propia ni método nombrado, la autoridad se toma prestada de los grandes de tu campo. Nunca se inventa.',
    };
  }

  return { piedras, dolor_historia: dolor, resultado_metodo: resultado };
}

/**
 * Fórmulas que este sanador NO debería usar todavía, con el motivo.
 *
 * Se le muestra para que entienda el criterio, no para esconderle opciones:
 * si igual quiere usarlas, puede — pero sabiendo qué le falta.
 */
export function formulasBloqueadas(s: SenalesSanador): Array<{ id: number; nombre: string; porQue: string }> {
  const fuera: Array<{ id: number; nombre: string; porQue: string }> = [];
  if (!s.tienePrueba) {
    fuera.push({
      ...ficha(4),
      porQue: 'Necesita un resultado tuyo, comprobable y con permiso. Sin eso se termina inventando, y eso se nota.',
    });
    fuera.push({
      ...ficha(9),
      porQue: 'Necesita un antes y un después reales. Sin caso propio no hay contraste que mostrar.',
    });
  }
  if (!s.marcaPersonal) {
    fuera.push({
      ...ficha(14),
      porQue: 'Confesar un error propio funciona cuando la marca eres tú. Con avatar corporativo suena raro.',
    });
  }
  return fuera;
}

/* ══════════════════ ESTADO REAL DE LAS 3 PIEZAS ══════════════════ */

export interface EstadoPiezas {
  /** Cuántas de las 3 están escritas. */
  escritas: number;
  /** Cuántas pasaron la auditoría de los 8 ingredientes. */
  aprobadas: number;
  /** true = las 3 escritas Y las 3 aprobadas. */
  listas: boolean;
  /** Qué le falta a cada una, para poder decirlo sin adivinar. */
  pendientes: Array<{ formulaId: number; nombre: string; falta: string[] }>;
}

/**
 * Lee las piezas guardadas y dice si de verdad están listas.
 *
 * Existe porque el primer candado del montaje decía "Tus 3 anuncios escritos
 * y auditados" y era una casilla que cualquiera podía tildar. Un candado que
 * no verifica nada no es un candado: es un adorno que da falsa seguridad
 * justo antes de encender una campaña con dinero real.
 */
export function estadoDeLasPiezas(
  guardadas: Record<number, { formulaId: number; texto: string }>,
  elegidas: number[],
  /** La palabra clave del sanador. Sin ella en la pieza, el comentario no
   *  dispara el mensaje automático y toda la campaña queda muda. */
  palabraClave = '',
): EstadoPiezas {
  const pendientes: EstadoPiezas['pendientes'] = [];
  let escritas = 0;
  let aprobadas = 0;

  for (const id of elegidas) {
    const p = guardadas[id];
    const f = FORMULAS_ANUNCIOS.find((x) => x.id === id);
    const nombre = f?.nombre ?? `Fórmula ${id}`;
    if (!p?.texto?.trim()) {
      pendientes.push({ formulaId: id, nombre, falta: ['todavía no está escrita'] });
      continue;
    }
    escritas++;
    const a = auditarPieza(p.texto);
    // Una pieza puede tener los 8 ingredientes y aun así no poder publicarse.
    // El candado tiene que mirar las dos cosas: si solo mirara ingredientes,
    // dejaría encender una campaña que la plataforma va a rechazar.
    const bloqueantes = revisarPoliticas(p.texto).filter((x) => x.gravedad === 'bloquea');
    const car = armarCarrusel(p.texto, palabraClave);
    const sinPalabra = !!palabraClave && !car.palabraPresente;

    if (a.aprobada && bloqueantes.length === 0 && !sinPalabra) aprobadas++;
    else {
      pendientes.push({
        formulaId: id, nombre,
        falta: [
          ...a.faltantes,
          ...bloqueantes.map((b) => `no se puede publicar «${b.que}»`),
          ...(sinPalabra ? [`falta tu palabra «${palabraClave}» en el cierre`] : []),
        ],
      });
    }
  }

  return {
    escritas,
    aprobadas,
    listas: elegidas.length > 0 && aprobadas === elegidas.length,
    pendientes,
  };
}

/* ══════════════════ POLÍTICAS DE PUBLICACIÓN ══════════════════ */

export type GravedadPolitica = 'bloquea' | 'revisa';

export interface AlertaPolitica {
  id: string;
  gravedad: GravedadPolitica;
  /** Qué se encontró, con las palabras del texto. */
  que: string;
  /** Por qué es un problema, en una línea. */
  porQue: string;
  /** Cómo se escribe lo mismo sin romper la regla. */
  comoSeArregla: string;
  /** El fragmento exacto, para que lo pueda buscar. */
  fragmento: string;
}

/**
 * Revisa una pieza contra las políticas de publicación, SIN llamar a un modelo.
 *
 * Por qué determinista: las reglas ya se le cuentan al modelo en el prompt y
 * el crítico también las mira, pero las dos cosas cuestan una llamada y
 * pueden fallar. Esto corre gratis, siempre, en cada tecla, y bloquea.
 *
 * Lo que se juega: una cuenta publicitaria inhabilitada. Recuperarla tarda
 * semanas y a veces no se recupera. Vale más frenar de más que de menos.
 */

/** Condiciones que NO se pueden atribuir al lector en segunda persona. */
const CONDICIONES = [
  'ansiedad', 'depresi[oó]n', 'estr[eé]s cr[oó]nico', 'insomnio', 'diabetes',
  'obesidad', 'sobrepeso', 'hipertensi[oó]n', 'colon irritable', 'menopausia',
  'burnout', 'p[aá]nico', 'trauma', 'adicci[oó]n', 'anorexia', 'bulimia',
  'infertilidad', 'c[aá]ncer', 'tiroides', 'candidiasis',
];

const REGLAS: Array<{
  id: string;
  gravedad: GravedadPolitica;
  patron: RegExp;
  porQue: string;
  comoSeArregla: string;
}> = [
  {
    id: 'atributo_personal',
    gravedad: 'bloquea',
    // "tú tienes ansiedad", "sufres de insomnio", "tu depresión", "estás obesa"
    patron: new RegExp(
      `\\b(t[uú] (tienes|sufres|padeces)|tienes|sufres de|padeces( de)?|tu |tus )\\s*(${CONDICIONES.join('|')})`,
      'i',
    ),
    porQue: 'Afirmar la condición del lector es lo que más cuentas inhabilita: la plataforma lo lee como dar por sentado algo privado de quien mira.',
    comoSeArregla: 'Dilo en tercera persona o como pregunta abierta sobre una situación, no sobre la persona: en vez de «tú tienes ansiedad», «hay días en que el cuerpo no afloja».',
  },
  {
    id: 'estado_personal',
    gravedad: 'bloquea',
    // El adjetivo puede no venir pegado al verbo: "estás agotada Y DEPRIMIDA".
    // Se permite un hueco corto, pero la lista de adjetivos se mantiene en
    // CONDICIONES y estados clínicos — "estás cansada" NO se bloquea, porque
    // el cansancio no es una condición y frenarlo sería un falso positivo
    // constante en este nicho, que es lo que hace que dejen de creerle al aviso.
    patron: /\b(est[aá]s|te sientes)\b[^.!?\n]{0,40}?\b(deprimid|ansios|obes|enferm[ao]|diab[eé]tic|bipolar|adict|an[oó]rexic|bul[ií]mic)/i,
    porQue: 'Es la misma regla de atributos personales: le estás diciendo al lector qué condición tiene.',
    comoSeArregla: 'Describe la escena, no a la persona: «a las 3 de la mañana el techo se vuelve conocido».',
  },
  {
    id: 'garantia',
    gravedad: 'bloquea',
    patron: /\b(garantiz\w+|resultados? asegurad\w+|100\s*%\s*(de\s*)?(efectiv|seguro|garantiz)|sin fallar)\b/i,
    porQue: 'Prometer un resultado garantizado no se puede sostener y la plataforma lo rechaza.',
    comoSeArregla: 'Cambia la garantía del RESULTADO por una del PROCESO: «si haces los pasos y no ves cambios en 30 días, te devuelvo la inversión».',
  },
  {
    id: 'cifra_ingreso',
    gravedad: 'bloquea',
    patron: /\b(gana|factura|ingresa|hac[eé]|consegu[ií])\w*\s*(hasta\s*)?[$€]\s?\d|[$€]\s?\d[\d.,]*\s*(al mes|por mes|mensuales|en 30 d[ií]as|en un mes)/i,
    porQue: 'Una cifra de ingreso como expectativa típica es rechazo directo, y además atrae al público equivocado.',
    comoSeArregla: 'Habla del cambio, no del número: «llenar la agenda sin perseguir a nadie».',
  },
  {
    id: 'lenguaje_medico',
    gravedad: 'bloquea',
    patron: /\b(cur[ao]|curar|curamos|curo|trat[ao] la|tratamiento (de|para) (la|el)|diagnostic[ao]|sana (la|el) \w+itis|elimina (la|el) (ansiedad|depresi))/i,
    porQue: 'Curar, tratar o diagnosticar son verbos clínicos: en un anuncio de bienestar activan revisión y suelen terminar en rechazo.',
    comoSeArregla: 'Habla de acompañar y de lo que la persona logra: «acompaño a recuperar la energía», no «curo el agotamiento».',
  },
  {
    id: 'antes_despues',
    gravedad: 'bloquea',
    patron: /\b(antes y despu[eé]s|baj[eé]\s*\d+\s*(kilos?|kg)|perd[ií]\s*\d+\s*(kilos?|kg)|\d+\s*kilos? menos)/i,
    porQue: 'Las comparaciones corporales están prohibidas de forma explícita, con foto o sin foto.',
    comoSeArregla: 'Cuenta lo que cambió en su vida, no en su cuerpo: «volvió a jugar con sus hijos sin quedarse sin aire».',
  },
  {
    id: 'testimonio_sin_descargo',
    gravedad: 'revisa',
    // Hay un caso real contado, pero en ningún lado se aclara que no es garantía.
    patron: /(mi (paciente|cliente|alumna?)|una (paciente|clienta)|logr[oó]|pas[oó] de)/i,
    porQue: 'Cuando cuentas un caso real hace falta aclarar que los resultados dependen de cada persona.',
    comoSeArregla: 'Agrega al pie: «resultados individuales, dependen del compromiso de cada persona».',
  },
];

/** Lo que ya cuenta como descargo, para no pedirlo dos veces. */
const TIENE_DESCARGO =
  /(resultados? (individuales|dependen|var[ií]an)|no es magia|depende de cada persona|no garantiza)/i;

export function revisarPoliticas(texto: string): AlertaPolitica[] {
  const t = texto ?? '';
  const alertas: AlertaPolitica[] = [];

  for (const r of REGLAS) {
    const m = r.patron.exec(t);
    if (!m) continue;
    // El testimonio solo alerta si NO hay descargo en ningún lado.
    if (r.id === 'testimonio_sin_descargo' && TIENE_DESCARGO.test(t)) continue;

    const i = Math.max(0, m.index - 25);
    alertas.push({
      id: r.id,
      gravedad: r.gravedad,
      que: m[0].trim(),
      porQue: r.porQue,
      comoSeArregla: r.comoSeArregla,
      fragmento: `…${t.slice(i, m.index + m[0].length + 25).trim()}…`,
    });
  }
  return alertas;
}

/** ¿Se puede publicar? Solo lo impiden las que bloquean. */
export function puedePublicarse(texto: string): boolean {
  return !revisarPoliticas(texto).some((a) => a.gravedad === 'bloquea');
}

/* ══════════════════ DEL GUION AL CARRUSEL ══════════════════ */

export interface Lamina {
  n: number;
  /** 'portada' la primera, 'cierre' la última, 'lamina' el resto. */
  tipo: 'portada' | 'lamina' | 'cierre';
  texto: string;
  /** Cuántos caracteres. Arriba de ~180 no entra cómodo en una lámina. */
  largo: number;
  /** true = se pasa de largo para leerse en el teléfono. */
  larga: boolean;
}

export interface Carrusel {
  laminas: Lamina[];
  caption: string;
  /** true = la palabra clave aparece en el cierre o en el caption. */
  palabraPresente: boolean;
  /** Lo que impide armarlo, si algo lo impide. */
  problema?: string;
}

/** Arriba de esto, la lámina no se lee cómoda en un teléfono. */
export const LARGO_MAX_LAMINA = 180;

/**
 * Parte el guion en láminas de carrusel.
 *
 * El modelo ya devuelve el texto marcado con "PANTALLA 1:", "PANTALLA 2:" y
 * un "CAPTION:" al final — el prompt se lo pide así desde siempre. Lo que
 * faltaba era LEERLO: la app mostraba el bloque entero como un solo texto y
 * el sanador tenía que adivinar dónde cortaba cada lámina, contarlas a mano
 * y copiarlas de a pedazos.
 *
 * Determinista y gratis: no hace falta una segunda llamada al modelo para
 * partir algo que ya viene partido.
 */
export function armarCarrusel(texto: string, palabraClave: string): Carrusel {
  const t = (texto ?? '').trim();
  if (!t) return { laminas: [], caption: '', palabraPresente: false, problema: 'Todavía no está escrito.' };

  // El caption va al final, después de la última pantalla.
  const corte = t.search(/^\s*CAPTION\s*:/im);
  const cuerpo = corte >= 0 ? t.slice(0, corte) : t;
  const caption = corte >= 0
    ? t.slice(corte).replace(/^\s*CAPTION\s*:/i, '').trim()
    : '';

  // Cada "PANTALLA N:" abre una lámina.
  const partes = cuerpo
    .split(/^\s*PANTALLA\s*\d*\s*:/gim)
    .map((x) => x.trim())
    .filter(Boolean);

  if (partes.length < 2) {
    return {
      laminas: [], caption, palabraPresente: false,
      problema: 'El texto no vino separado en pantallas. Vuelve a generarlo.',
    };
  }

  const laminas: Lamina[] = partes.map((texto, i) => {
    const largo = texto.length;
    return {
      n: i + 1,
      tipo: i === 0 ? 'portada' : i === partes.length - 1 ? 'cierre' : 'lamina',
      texto,
      largo,
      larga: largo > LARGO_MAX_LAMINA,
    };
  });

  // La palabra clave tiene que estar donde se pide comentar: en el cierre o
  // en el caption. Si no está en ninguno, la campaña no puede funcionar —
  // el comentario es lo que dispara el mensaje automático.
  const p = (palabraClave ?? '').trim();
  const cierre = laminas[laminas.length - 1]?.texto ?? '';
  const palabraPresente = !!p
    && (cierre.toUpperCase().includes(p.toUpperCase())
        || caption.toUpperCase().includes(p.toUpperCase()));

  return { laminas, caption, palabraPresente };
}
