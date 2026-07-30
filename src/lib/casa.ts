/**
 * LA CASA — el objetivo, los principios y la inducción.
 *
 * ═══ POR QUÉ ESTO VIVE EN LA APP Y NO EN UN ARCHIVO ═══
 *
 * Había nueve documentos de plan en la raíz del repo, cada uno reemplazando
 * parcialmente al anterior. **Nadie lee nueve planes**, y si los lee sale
 * peor: no sabe cuál rige.
 *
 * Sam Carpenter propone tres capas: el objetivo estratégico en una página,
 * los principios para decidir cuando no hay procedimiento, y los
 * procedimientos probados en la realidad.
 *
 * Las dos primeras están acá, **dentro de la app**, porque un archivo en la
 * raíz de un repositorio no lo abre nadie que no sea programador. La tercera
 * ya vive donde tiene que vivir: en la cola y en el criterio escrito.
 */

// ── CAPA 1 · El objetivo estratégico ───────────────────────────────────────

export const OBJETIVO = {
  quePrometemos:
    'Un sanador pasa de cero a $10.000 en 90 días con diez pacientes de $1.000.',

  aQuien:
    'Psicólogos, médicos, nutricionistas y terapeutas de Latinoamérica, España '
    + 'y el mercado hispano de Estados Unidos, que ya saben sanar y no saben vender.',

  comoLoHacemos:
    'La app le arma el método, la oferta, los anuncios y el tablero. Una '
    + 'persona entra solo cuando la app no pudo.',

  /** El único número que dice si el negocio funciona. */
  elNumero:
    'Los minutos de humano por cliente. Tienen que bajar mes a mes con la '
    + 'misma cantidad de clientes o más.',

  porQueEseNumero:
    'Porque el gradiente de tickets ES el modelo: el de $1.000 usa la app sola '
    + 'y tiene que costar cero. Si no baja, el ticket bajo no es rentable y el '
    + 'alto no escala.',
} as const;

// ── CAPA 2 · Los principios ────────────────────────────────────────────────

export interface Principio {
  id: string;
  dice: string;
  /** Para qué sirve: qué decisión resuelve cuando no hay procedimiento. */
  resuelve: string;
}

/**
 * Los principios de operación.
 *
 * No son valores de pared. Cada uno **resuelve una discusión concreta** que
 * se repite, y por eso está escrito: para no volver a tenerla.
 */
export const PRINCIPIOS: Principio[] = [
  {
    id: 'api_antes_que_minuto',
    dice: 'Entre un minuto de una persona y una llamada de modelo, siempre la llamada.',
    resuelve: 'Cualquier discusión sobre el costo de la IA. Un mes de alguien del equipo cuesta más que toda la inteligencia artificial de todos los clientes juntos.',
  },
  {
    id: 'la_regla_decide',
    dice: 'El diagnóstico lo hace una regla, no un modelo. La IA redacta, no juzga.',
    resuelve: 'La tentación de pedirle a un modelo que opine sobre números. Daría otra respuesta el jueves, y el criterio se vuelve inconfiable justo donde más importa.',
  },
  {
    id: 'no_callarse',
    dice: 'Si no hay datos para opinar, se dice hasta dónde se llega y qué falta. Nunca se calla ni se inventa.',
    resuelve: 'Qué mostrar cuando falta un dato. Un tablero que dice «todo bien» sin datos es peor que uno vacío.',
  },
  {
    id: 'una_cosa_por_vez',
    dice: 'Un solo cuello de botella por vez. Un solo botón principal por pantalla.',
    resuelve: 'La tentación de arreglar dos cosas juntas, que no deja saber cuál funcionó.',
  },
  {
    id: 'tres_veces',
    dice: 'A la tercera vez, deja de ser un caso y es un patrón. Y un patrón se escribe una vez.',
    resuelve: 'Cuándo escribir un procedimiento nuevo y cuándo no. Si es infrecuente, no hace falta: si no, se termina con documentación que nadie lee.',
  },
  {
    id: 'ejecutar_no_diagnosticar',
    dice: 'Quien atiende ejecuta. La app ya escribió qué hacer y el mensaje que va.',
    resuelve: 'Qué hacer cuando alguien no sabe qué responder. Si no está en la cola, se escala: inventar criterio en el momento rompe la coherencia entre clientes.',
  },
  {
    id: 'el_limite_sube_no_baja',
    dice: 'Si alguien llega a un tope trabajando bien, el tope sube. Nunca se le corta el trabajo.',
    resuelve: 'Qué hacer cuando un cliente o alguien del equipo se pasa de un límite. Los topes existen para saber, no para racionar.',
  },
];

// ── CAPA 3 · La inducción de 72 horas ──────────────────────────────────────

export interface SesionDeInduccion {
  numero: number;
  titulo: string;
  /** El id de YouTube. Vacío = el espacio existe y todavía no hay video. */
  video?: string;
  /** Qué diagrama acompaña. La pantalla sabe dibujarlo. */
  diagrama?: 'embudo' | 'cadena' | 'quien_resuelve' | 'gradiente' | 'dia';
  /** Los números concretos. No «el presupuesto importa». */
  datos?: string[];
  /** Qué queda claro al terminar. */
  queQuedaClaro: string;
  /** Minutos de contenido. */
  minutos: number;
  dia: 1 | 2 | 3;
  /** La acción real que la cierra. No un quiz. */
  accion: string;
  /** Por qué esto no se puede aprender trabajando. */
  porQueAntes: string;
}

/**
 * Seis sesiones, dos horas de contenido, tres días.
 *
 * ═══ POR QUÉ SOLO SEIS ═══
 *
 * La app diagnostica. Nadie tiene que aprender a leer un embudo: la app dice
 * qué está roto, qué hacer y el mensaje que va.
 *
 * Entonces la inducción solo cubre **lo que no se puede aprender haciendo**,
 * porque eso se descubre equivocándose — y algunos de esos errores los paga
 * un cliente.
 *
 * El resto se aprende en el lugar, con el glosario junto a cada palabra.
 */
export const INDUCCION: SesionDeInduccion[] = [
  {
    numero: 1, dia: 1, minutos: 20,
    titulo: 'La promesa y el gradiente',
    diagrama: 'gradiente',
    datos: [
      '$1.000 → la app sola. Cero minutos de humano en el caso sano.',
      '$2.000 → revisado en cuatro puntos. 30 minutos por mes.',
      '$5.000 → la agencia instala 51 de los 62 ítems. 4 horas por mes.',
      '$10.000 → lo anterior más sesiones de dirección.',
    ],
    queQuedaClaro: 'Qué prometemos, y por qué un cliente de $1.000 tiene que costar cero minutos de humano.',
    accion: 'Abrir la lista de clientes y decir en voz alta el ticket de cada uno.',
    porQueAntes: 'Sin esto, atender a un cliente de $1.000 durante media hora parece generosidad. Es una pérdida.',
  },
  {
    numero: 2, dia: 1, minutos: 20,
    titulo: 'El embudo de siete pasos',
    diagrama: 'embudo',
    datos: [
      'Presupuesto → anuncio → mensaje → conversación → confirmación → llamada → cierre → cobro.',
      'El diagnóstico se detiene en el PRIMERO que falla.',
      'Si el anuncio no trae gente, no tiene sentido mirar el cierre: no hay a quién cerrarle.',
    ],
    queQuedaClaro: 'Los siete micro-pasos en orden, y por qué el diagnóstico se detiene en el primero que falla.',
    accion: 'Mirar tres cuentas reales y nombrar en qué paso está trabada cada una.',
    porQueAntes: 'Sin el orden, se atiende el cierre de alguien que todavía no tiene conversaciones.',
  },
  {
    numero: 3, dia: 2, minutos: 20,
    titulo: 'Tu función y su destino',
    diagrama: 'quien_resuelve',
    datos: [
      'Criterio → queda humana para siempre.',
      'Instalación y cobro → deben MORIR.',
      'Destrabar y producir → deben encogerse.',
      'Absorber → es la única que crece, y su producto es que las otras bajen.',
    ],
    queQuedaClaro: 'Qué te toca, qué NO, y si tu función tiene que crecer o reducirse.',
    accion: 'Abrir «Mi rol» y leer en voz alta los tres «no me toca» con su motivo.',
    porQueAntes: 'Es la sesión que cambia cómo alguien trabaja: si sabe que su función debe reducirse, reporta lo que se repite en vez de acostumbrarse.',
  },
  {
    numero: 4, dia: 2, minutos: 20,
    titulo: 'Leer la cola',
    diagrama: 'dia',
    datos: [
      'Lo vencido va primero: ya falló una vez.',
      'Alguien esperando respuesta pesa más que el peor cuello: una cuenta rota se destraba mañana, una persona esperando se va hoy.',
      'El orden es por dinero en riesgo, no por gravedad.',
    ],
    queQuedaClaro: 'Por qué está en ese orden y qué significa cada tarjeta.',
    accion: 'Atender dos cuentas de verdad, mandando el mensaje que la app escribió.',
    porQueAntes: 'El orden es por dinero en riesgo, no por gravedad. Quien no lo sabe atiende lo que suena más urgente.',
  },
  {
    numero: 5, dia: 3, minutos: 20,
    titulo: 'Los ocho entrenadores',
    datos: [
      'Sofi → el DM, la conversación, la confirmación.',
      'Lucas → la llamada de venta y el cierre.',
      'Vera → el precio y la oferta.',
      'Mateo → guiones y contenido · Caro → cámara y testimonios.',
      'Ramiro → los números · Bruno → el post-venta · Diego → armar el producto.',
    ],
    queQuedaClaro: 'De qué se ocupa cada uno y qué le derivas.',
    accion: 'Tomar una cuenta trabada y mandarla al entrenador que corresponde.',
    porQueAntes: 'Derivar al equivocado hace perder una sesión entera del cliente y le enseña que los entrenadores no sirven.',
  },
  {
    numero: 6, dia: 3, minutos: 20,
    titulo: 'Abrir y cerrar el día',
    datos: [
      'A la TERCERA vez, una traba deja de ser esfuerzo y pasa a ser trabajo de desarrollo.',
      'Los minutos se calculan solos: a nadie se le pide cargar horas.',
      'Una jornada abierta más de 14 horas se topea: es alguien que se olvidó de cerrar.',
    ],
    queQuedaClaro: 'Por qué se anota la traba y por qué no se discute cuando aparece.',
    accion: 'Cerrar tu día de verdad, con una traba escrita.',
    porQueAntes: 'Sin esto, la traba se cuenta en una conversación, se olvida, y vuelve el mes que viene.',
  },
];

/** Las tres jornadas, para poder mostrarlas. */
export function jornadasDeInduccion(): Array<{
  dia: 1 | 2 | 3;
  titulo: string;
  minutos: number;
  sesiones: SesionDeInduccion[];
  despues: string;
}> {
  const de = (d: 1 | 2 | 3) => INDUCCION.filter((s) => s.dia === d);
  return [
    { dia: 1, titulo: 'Entender qué vendemos', minutos: 40, sesiones: de(1),
      despues: 'Mirar. Tres cuentas reales con alguien al lado que las explica. Sin tocar nada.' },
    { dia: 2, titulo: 'Entender tu función', minutos: 40, sesiones: de(2),
      despues: 'Hacer, acompañado. Dos cuentas de verdad con alguien mirando.' },
    { dia: 3, titulo: 'Entender cuándo no es tuyo', minutos: 40, sesiones: de(3),
      despues: 'Hacer, solo. La cola completa, con revisión al final del día.' },
  ];
}

/** El total, para poder decirlo. */
export const MINUTOS_DE_CONTENIDO = INDUCCION.reduce((t, s) => t + s.minutos, 0);

/**
 * Lo que NO entra en la inducción, y dónde se aprende.
 *
 * Se declara a propósito: si alguien siente que le falta algo, tiene que poder
 * ver que no es un olvido — es una decisión, y ahí está dónde lo va a
 * encontrar.
 */
export const SE_APRENDE_EN_EL_LUGAR: Array<{ que: string; donde: string }> = [
  { que: 'Los mercados y sus bandas de costo', donde: 'en el tablero del cliente, cuando aparece un CPM' },
  { que: 'Cargar una sesión y qué se hereda', donde: 'la primera vez que cargas una sesión' },
  { que: 'Lanzado o instalando', donde: 'en la lista de clientes, con la palabra explicada' },
  { que: 'La reunión del viernes', donde: 'el primer viernes' },
  { que: 'El puntaje de cada cuenta', donde: 'en Supervisión, la primera vez que abres la lista' },
  { que: 'Las tres situaciones de criterio', donde: 'cuando aparece la primera' },
];

// ── CAPA 4 · Por qué Javo ──────────────────────────────────────────────────

/**
 * La historia.
 *
 * ═══ POR QUÉ ESTE BLOQUE EXISTE ═══
 *
 * Sin esto, el equipo vende **un sistema**. Con esto, vende **una convicción**.
 * Y la diferencia se nota en la primera objeción difícil: quien conoce el
 * porqué la sostiene; quien solo conoce el producto la esquiva.
 *
 * ═══ LO QUE FALTA ═══
 *
 * El esqueleto está armado con lo que se sabe. **Las frases entre corchetes
 * las tiene que escribir Javo**, porque son las únicas que no se pueden
 * inventar sin que suenen a folleto — y un folleto no convence a nadie que
 * vaya a trabajar acá.
 */
export interface CapituloDeLaHistoria {
  titulo: string;
  texto: string;
  /** true = falta que Javo lo escriba con sus palabras. */
  pendiente?: boolean;
}

export const HISTORIA: CapituloDeLaHistoria[] = [
  {
    titulo: 'Empecé liderando antes de saber qué era liderar',
    texto:
      'A los quince ya coordinaba gente en la secundaria. A los dieciocho abrí un '
      + 'centro cultural a tres cuadras del Obelisco. No sabía nada de gestión: '
      + 'aprendí porque no había otra opción.',
  },
  {
    titulo: 'Pasé por la política y me recibí de abogado',
    texto:
      'Varios años adentro. Vi cómo se toman las decisiones que afectan a mucha '
      + 'gente, y vi lo que pasa cuando nadie escribe el criterio: todo se vuelve '
      + 'a discutir, siempre, y siempre gana el que grita más fuerte.',
  },
  {
    titulo: '[Por qué me fui de todo eso]',
    texto:
      '[Acá va lo que te hartó. No la versión linda: la de verdad. Qué viste que '
      + 'ya no pudiste dejar de ver.]',
    pendiente: true,
  },
  {
    titulo: '[Por qué sanadores y no cualquier otro rubro]',
    texto:
      '[Qué te pasó con un sanador concreto. Uno que sabía sanar y no sabía '
      + 'vender, y qué te generó verlo.]',
    pendiente: true,
  },
  {
    titulo: '[Por qué una app y no una agencia]',
    texto:
      '[Por qué construir un sistema en vez de vender horas. Qué tiene que pasar '
      + 'para que esto valga la pena.]',
    pendiente: true,
  },
];

// ── CAPA 5 · El sistema por dentro ─────────────────────────────────────────

/**
 * Cómo funciona el mecanismo, en un solo lugar.
 *
 * **Es lo que permite defender una decisión de la app frente a un cliente que
 * la cuestiona.** Sin esto, cuando alguien pregunta «¿por qué me dice que
 * cambie el creativo?», la única respuesta posible es «porque lo dice la app»
 * — y esa respuesta no la acepta nadie que pagó.
 */
export interface PiezaDelSistema {
  pregunta: string;
  respuesta: string;
}

export const SISTEMA_POR_DENTRO: PiezaDelSistema[] = [
  {
    pregunta: '¿Cómo decide la app qué está roto?',
    respuesta:
      'Calcula diecinueve indicadores y compara cada uno con su referencia. El que '
      + 'está más lejos de la suya es el cuello de botella. No es el peor número: '
      + 'es el más ALEJADO de lo que debería ser, que no es lo mismo.',
  },
  {
    pregunta: '¿Por qué solo uno y no todos los que están mal?',
    respuesta:
      'Porque arreglar dos cosas a la vez no deja saber cuál funcionó. Y porque un '
      + 'número malo abajo casi siempre es consecuencia de uno malo arriba: si el '
      + 'anuncio no trae gente, el cierre va a estar mal aunque el cierre esté bien.',
  },
  {
    pregunta: '¿De dónde salen las referencias?',
    respuesta:
      'Casi todas se derivan del PRECIO del programa, no de un benchmark ajeno. Un '
      + 'costo por conversación de comercio electrónico aplicado a un programa de '
      + 'miles apagaba campañas rentables — nos pasó. Y las de costo publicitario '
      + 'salen del MERCADO donde corre la pauta: el techo argentino está por debajo '
      + 'del piso español.',
  },
  {
    pregunta: '¿Por qué una regla y no un modelo de IA?',
    respuesta:
      'Porque un modelo daría otra respuesta el jueves. El diagnóstico lo hace una '
      + 'regla, siempre igual, y la IA redacta el mensaje. La IA escribe; no juzga.',
  },
  {
    pregunta: '¿Qué pasa si faltan datos?',
    respuesta:
      'La app dice hasta dónde puede opinar y qué le falta para llegar más lejos. '
      + 'Nunca se calla ni inventa: un tablero que dice «todo bien» sin datos es '
      + 'peor que uno vacío.',
  },
  {
    pregunta: '¿Cuándo entra una persona?',
    respuesta:
      'Cuando el aviso automático no alcanzó. Las cuentas sanas no aparecen en la '
      + 'cola: si aparecieran todas, habría que leer la lista entera y no se '
      + 'atendería a nadie.',
  },
  {
    pregunta: '¿Cómo sabemos si esto está funcionando?',
    respuesta:
      'Por un solo número: los minutos de humano por cliente. Tienen que bajar mes '
      + 'a mes con la misma cantidad de clientes o más. Si suben, el modelo dejó de '
      + 'escalar aunque estemos vendiendo.',
  },
];

// ── CAPA 6 · Los valores, con su costo ─────────────────────────────────────

/**
 * Lo que se deja de ganar por sostener cada principio.
 *
 * **Un valor sin costo es una frase.** Los que están acá cuestan algo concreto,
 * y decir cuánto es lo que los vuelve creíbles para alguien que tiene que
 * sostenerlos frente a un cliente enojado.
 */
export interface ValorConCosto {
  valor: string;
  cuestaEsto: string;
  loAceptamosPorque: string;
}

export const VALORES: ValorConCosto[] = [
  {
    valor: 'No retenemos con descuento.',
    cuestaEsto: 'Algunos meses se va alguien que se podría haber quedado.',
    loAceptamosPorque:
      'El descuento arruina el precio para los otros diez, y el que se va por un '
      + 'descuento se va igual el mes que viene.',
  },
  {
    valor: 'No hacemos excepciones «por esta vez».',
    cuestaEsto: 'A veces hay que decir que no a alguien que pide poco.',
    loAceptamosPorque:
      'La excepción se vuelve la expectativa, y el que paga el ticket alto se '
      + 'entera de que no hacía falta pagarlo.',
  },
  {
    valor: 'Si no hay datos, se dice. No se inventa.',
    cuestaEsto: 'A veces la app queda diciendo «no sé» donde otra diría algo lindo.',
    loAceptamosPorque:
      'Un diagnóstico inventado se descubre en dos semanas, y ahí se pierde todo '
      + 'lo demás también.',
  },
  {
    valor: 'El criterio se escribe, no se recuerda.',
    cuestaEsto: 'Escribirlo lleva tiempo que parece que no produce nada.',
    loAceptamosPorque:
      'El criterio que no se escribe se vuelve a discutir, y cada vez que se '
      + 'discute hay que estar presente para decidirlo otra vez.',
  },
  {
    valor: 'Preferimos perder un dato antes que contarlo dos veces.',
    cuestaEsto: 'De vez en cuando se pierde una agenda que sí ocurrió.',
    loAceptamosPorque:
      'Un número inflado hace tomar la decisión equivocada con confianza, que es '
      + 'peor que no tener el número.',
  },
];
