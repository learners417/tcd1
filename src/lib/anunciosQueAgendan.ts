/**
 * ANUNCIOS QUE AGENDAN — el método, dentro de la app.
 *
 * ═══ QUÉ ES ═══
 *
 * Las veinte reglas que separan un anuncio que trae agendas de uno que trae
 * curiosos, las siete estructuras para escribirlos, y el caso real de una
 * mentoría con sus diez anuncios pasados por el semáforo.
 *
 * Venía como una página suelta, fuera de la app. Acá adentro gana tres cosas
 * que allá no podía tener: la ficha se completa sola con el ADN que el cliente
 * ya cargó, lo que escribe queda guardado en su cuenta y no en el navegador
 * que tenía abierto, y el revisor usa el mismo motor de IA que el resto —así
 * cada generación se cuenta donde se cuentan todas.
 *
 * ═══ POR QUÉ EL CONTENIDO VIVE ACÁ Y NO EN LA PANTALLA ═══
 *
 * Porque las reglas son la mitad del producto y van a cambiar: cuando Javo
 * encuentre una regla nueva la agrega en este archivo y aparece en la pantalla,
 * en el prompt del escritor y en el del revisor a la vez. Con el texto repartido
 * en el JSX, cambiar una regla sería cambiarla en tres lugares y acordarse de
 * los tres.
 */

/* ══════════════════ LAS VEINTE REGLAS ══════════════════ */

export interface ReglaDeAnuncio {
  /** De quién sale: Julio, Yan, Serratos, o la casa. */
  fuente: string;
  titulo: string;
  /** Lo que trae curiosos: [frase, de dónde sale]. */
  mal: Array<[string, string]>;
  /** Lo que agenda. */
  bien: Array<[string, string]>;
  /** Por qué, en una frase. */
  porque: string;
}

export const REGLAS: ReglaDeAnuncio[] = [
  {
    fuente: 'Julio', titulo: 'El gancho va al resultado, nunca al producto',
    mal: [['¿Quieres que mi equipo analice tu marketing?', 'Julio: así nadie engancha'],
          ['Te ayudo a crear tu programa de alto valor.', 'Mentor genérico']],
    bien: [['¿Por qué subo contenido a mis redes y no vendo?', 'Julio, rayos X'],
           ['Atendió a 10.000 personas en diez años. Tiene 0 testimonios.', 'Caso real, mentoría']],
    porque: 'Nadie entra a redes a comprar. Se detiene por algo que le pasa a él, no por lo que tú ofreces.',
  },
  {
    fuente: 'Julio', titulo: 'El espejo: que se reconozca solo',
    mal: [['Estás haciendo todo mal con tu marketing.', 'Le dice tonto en la cara'],
          ['Los terapeutas no saben vender.', 'Ataca a todo el gremio']],
    bien: [['La mayoría contrata una agencia que le cobra 15 posts y cuatro carruseles.', 'Julio'],
           ['Atiendes con tu mejor energía y vendes con lo que sobra.', 'Caso real, mentoría']],
    porque: 'Si le dices que se equivoca, se defiende. Si le muestras la escena, concluye solo: «ese soy yo».',
  },
  {
    fuente: 'Yan', titulo: 'Conducta real, nunca deseo',
    mal: [['¿Te gustaría ganar 100 dólares a la semana haciendo quesos?', 'Yan: lo que dice todo el mundo'],
          ['¿Te gustaría viajar sin preocuparte por nada?', 'Experiencias, versión deseo']],
    bien: [['¿Qué tendrán estos quesos que facturan 100 dólares por semana?', 'Yan'],
           ['Probaste tres dietas este año y las tres terminaron un lunes.', 'Nutrición, conducta']],
    porque: '«¿Te gustaría?» pide una opinión. Lo que hizo en los últimos tres meses lo nombra.',
  },
  {
    fuente: 'Yan', titulo: 'El mecanismo lleva nombre propio',
    mal: [['Agenda tu llamada gratis de estrategia.', 'La dice todo el mundo'],
          ['Tengo una metodología de metabolismo activado.', 'Yan: suena a folleto']],
    bien: [['Sesión dominó: lo que hacemos acá hace caer todo lo demás en fila.', 'Yan'],
           ['El apagado metabólico.', 'Yan: abre una pregunta']],
    porque: 'Un nombre propio abre una pregunta en la cabeza («¿qué es eso?»). Ahí empieza la venta.',
  },
  {
    fuente: 'Yan', titulo: 'Una analogía de algo que ya conoce',
    mal: [['El avión es seguro, escucha a los expertos.', 'Intenta convencer'],
          ['Mi método tiene acompañamiento personalizado.', 'Abstracto']],
    bien: [['El avión choca con olas invisibles, como la lancha. Por eso existe el cinturón.', 'Yan'],
           ['Yo te doy el auto. Manejas tú.', 'Caso real, mentoría']],
    porque: 'Con algo que ya vivió entiende en un segundo y cree solo. No hace falta convencer.',
  },
  {
    fuente: 'Julio + Yan', titulo: 'El 20: una sola idea que no había visto',
    mal: [['Aprende a maquillarte.', 'Lo que dice toda la industria'],
          ['Organiza tu negocio para crecer.', 'Cinco pelotas a la vez']],
    bien: [['Apréndete una sola cara: la tuya.', 'Yan, idea contraintuitiva'],
           ['Tu primera venta va antes que tu primer anuncio.', 'Caso real, mentoría']],
    porque: 'Le tiras una sola pelota y la atrapa. Si es nueva y sale de tu historia, nadie te confunde con otro.',
  },
  {
    fuente: 'Julio', titulo: 'La respuesta va al final',
    mal: [['Puedes empezar a hacer flipping con 2.500 dólares.', 'La respuesta de entrada mata el video'],
          ['Mi método tiene 5 sistemas y 3 fases.', 'Explica primero']],
    bien: [['¿Cuánto cuesta tener novia en México?', 'Julio: abre la intriga'],
           ['Su primera venta al precio nuevo la cerró encerrada en un baño.', 'Caso real, mentoría']],
    porque: 'Como el sobre con tu nombre en el parabrisas: lo abres para saber qué hay. Si ya lo sabe, se va.',
  },
  {
    fuente: 'Yan', titulo: 'Nivel insomnio: que no lo deje dormir',
    mal: [['Aprende a pintar con acuarelas en 30 días.', 'Nivel «tal vez»'],
          ['Te ponemos los brackets sin dolor.', 'Nivel fastidio: quita un problemita']],
    bien: [['¿Vas a esperar a que tus dientes no se puedan mover para ponerte brackets?', 'Yan, mismo producto'],
           ['¿Cuánto ganas de verdad por cada hora? Cuenta también el WhatsApp de las once de la noche.', 'Caso real, mentoría']],
    porque: 'Instala una pregunta que sigue sonando a la noche. La «última vía» en salud queda afuera.',
  },
  {
    fuente: 'Julio', titulo: 'Prueba de X a Y que no parece testimonio',
    mal: [['Recomiendo a este profesional porque es muy bueno.', 'Opinión, no transformación'],
          ['¡Gracias por todo! Excelente atención.', 'Testimonio en frío']],
    bien: [['Pasó de siete precios a uno.', 'Caso real, mentoría'],
           ['Alguien parecido a tu cliente, tres segundos en el video.', 'Julio: su papá vendía más que la modelo']],
    porque: 'Muestra el antes y el después de alguien que se le parece. Sin nombre propio del cliente.',
  },
  {
    fuente: 'Julio', titulo: 'El llamado dice qué pasa al tocar',
    mal: [['Más info en el link.', 'No sabe qué le espera'],
          ['Escríbeme si te interesa.', 'Le deja todo a él']],
    bien: [['Toca abajo y mi equipo te hace cinco preguntas para encontrar tu problema esta semana.', 'Julio'],
           ['Toca abajo, mira el video y responde 4 preguntas.', 'Video y agenda']],
    porque: 'Cuando sabe exactamente el próximo paso, lo da. El anuncio vende solo ese paso.',
  },
  {
    fuente: 'Julio', titulo: 'El costo de no hacerlo, con datos reales',
    mal: [['¡Últimos lugares! ¡Corre!', 'Urgencia inventada'],
          ['Aprovecha esta oportunidad única.', 'Frase de folleto']],
    bien: [['Este anuncio no lo vas a volver a ver y ni viste cómo me llamo.', 'Julio'],
           ['Salimos el 14 de marzo y quedan 4 lugares en el refugio.', 'Experiencias, dato real']],
    porque: 'Qué pierde si lo deja para mañana. Con cupos y fechas que existen; si no, se nota.',
  },
  {
    fuente: 'Serratos', titulo: 'La historia es de él, no tuya',
    mal: [['Yo comía en la barra porque no me sentía merecedor.', 'Termina en ti'],
          ['Te cuento mi historia de superación.', 'Habla de ti']],
    bien: [['¿Cuántas veces no supiste recibir porque no te sentías merecedor?', 'Serratos: la pasa al público'],
           ['Tú tuviste una abuela, aunque no fuera tu abuela.', 'Caso real, mentoría']],
    porque: 'La historia emociona cuando el que la escucha se ve adentro. Cuéntatela primero: si no te mueve a ti, no mueve a nadie.',
  },
  {
    fuente: 'Regla TCD', titulo: 'El avance es un logro que pasó',
    mal: [['Ya tienes tu método.', 'Describe un estado'],
          ['Tus consultantes te recomiendan.', 'Describe un estado']],
    bien: [['Corriste publicidad y no te funcionó.', 'Un hecho'],
           ['Te ascendieron y no sabes si vas a estar a la altura.', 'Un hecho con su obstáculo']],
    porque: 'Un logro con su obstáculo atrae al que ya está avanzando: el que decide, invierte y se compromete.',
  },
  {
    fuente: 'Regla TCD', titulo: 'Le cuesta ganarlo, nunca le falta',
    mal: [['Agenda llena y cuenta vacía.', 'Señal de pobreza'],
          ['¿No te alcanza a fin de mes?', 'Atrae a quien no puede pagar']],
    bien: [['Tengo turnos hasta mayo y sigo haciendo guardias.', 'Avatar de alto valor'],
           ['No me quejo de lo que gano, me quejo de lo que me cuesta ganarlo.', 'Avatar de alto valor']],
    porque: 'El cliente de alto valor factura bien y está agotado. Quien no llega a fin de mes no paga una mentoría.',
  },
  {
    fuente: 'Regla TCD', titulo: 'Gancho directo, sin anunciarlo',
    mal: [['Te cuento algo que nadie te dice…', 'Gancho anunciado'],
          ['Quédate hasta el final porque…', 'Pide permiso']],
    bien: [['Un estudio demostró que…', 'Arranca con el dato'],
           ['¿Sabías que el profesional más formado suele ser el más invisible?', 'Yan, curiosidad']],
    porque: 'El dato en la primera frase frena el dedo. Anunciar que vas a decir algo ya aburre.',
  },
  {
    fuente: 'Regla TCD', titulo: 'Siempre en positivo',
    mal: [['Mi garantía no es un número.', 'Define por lo que no es'],
          ['Esto no es otro curso más.', 'Instala la duda']],
    bien: [['Sales con todo andando.', 'Dice lo que sí es'],
           ['Instalo contigo, un día por semana, durante 90 días.', 'Caso real, mentoría']],
    porque: 'Cada «no es» planta la idea que querías evitar. Lo que sí es se recuerda.',
  },
  {
    fuente: 'Julio + TCD', titulo: 'El precio depende del paso siguiente',
    mal: [['Programa de 90 días por 3.000 USD.', 'Alto valor con precio en frío'],
          ['Inscríbete hoy con 20 % de descuento.', 'Baja el valor']],
    bien: [['Toca abajo y mira el video.', 'Alto valor: el precio vive en la página'],
           ['Taller de 47 USD, este jueves a las 19 h.', 'Entrada: el precio filtra curiosos']],
    porque: 'Si el siguiente paso es una llamada, el filtro de inversión va en el video y el formulario. Si es una compra directa, el precio en el anuncio filtra.',
  },
  {
    fuente: 'Meta', titulo: 'Hechos del lector, nunca su condición',
    mal: [['¿Estás agotada?', 'Le afirma un estado personal'],
          ['¿Tu ansiedad no te deja trabajar?', 'Salud mental: Meta lo frena']],
    bien: [['Facturas más que hace tres años y trabajas más horas que nunca.', 'Hechos, en tú'],
           ['Llevas años intentando llenar la agenda.', 'Conducta']],
    porque: 'Le hablas de tú, con hechos y conductas. Sin promesas de ingresos, sin resultados de salud, sin antes y después.',
  },
  {
    // La regla 15 del prompt no estaba entre las que el cliente leía: la IA la
    // cumplía y él no sabía que existía, así que cuando escribía a mano
    // escribía como se escribe en un folleto. Una regla que el generador
    // respeta y el cliente desconoce es una regla que solo sirve con IA.
    fuente: 'Regla TCD', titulo: 'Hablado, como lo dirías en voz alta',
    mal: [['En el marco de nuestro acompañamiento integral…', 'Nadie habla así'],
          ['Descubre el poder transformador de tu propósito.', 'Tono de folleto']],
    bien: [['Instalo contigo, un día por semana, durante 90 días.', 'Como lo diría una persona'],
           ['No me quejo de lo que gano, me quejo de lo que me cuesta ganarlo.', 'Suena a alguien']],
    porque: 'Léelo en voz alta antes de publicar. Si no lo dirías así en una mesa, no va. Lo escrito «bonito» se escucha falso en un video.',
  },
  {
    fuente: 'Yan', titulo: 'El filtro EPIC antes de publicar',
    mal: [['Banquito ergonómico para el baño, 30 % de descuento.', 'Correcto y olvidable'],
          ['Nuestras hamburguesas no usan conservantes.', 'Lo afirma, no lo muestra']],
    bien: [['Un unicornio que hace helado de arcoíris.', 'Entretenido, personal, irrefutable, claro'],
           ['La hamburguesa que se pudre en 28 días.', 'Burger King: lo demuestra']],
    porque: 'Entretenido (una historia ya entretiene), Personalizado (su problema exacto), Irrefutable (nadie lo discute), Claro (lo entiende un niño de 7 años).',
  },
];

/* ══════════════════ EL CASO REAL, EN EL SEMÁFORO ══════════════════ */

export type ColorSemaforo = 'si' | 'amb' | 'no';

export interface AnuncioDelCaso {
  color: ColorSemaforo;
  /** El número del anuncio, o «Control». */
  n: string;
  titulo: string;
  /** El gancho, textual. */
  gancho: string;
  porque: string;
  /** Qué le falta para salir. */
  arreglo: string;
}

export const CASO_REAL: AnuncioDelCaso[] = [
  { color: 'si', n: 'Control', titulo: 'No ofrezcas más sesiones uno a uno',
    gancho: 'No ofrezcas más sesiones uno a uno.',
    porque: 'Ya trajo agendas en la cuenta. Los datos ganan: queda como control y los nuevos tienen que superarlo.',
    arreglo: 'Correrlo al lado de los tres nuevos.' },
  { color: 'si', n: '3', titulo: 'Yo te doy el auto. Manejas tú.',
    gancho: 'El 24 de julio firmé a mano un pacto: dejar de hacerles el trabajo a mis clientes.',
    porque: 'Hecho con fecha, analogía que se entiende en un segundo y un 20 que solo él puede decir.',
    arreglo: 'Mostrar la hoja firmada en el primer segundo.' },
  { color: 'si', n: '8', titulo: 'Su primera venta fue en un baño',
    gancho: 'Su primera venta al precio nuevo la cerró encerrada en un baño.',
    porque: 'Intriga pura: la respuesta llega al final. El espejo («rellenas el silencio con un descuento») es conducta.',
    arreglo: 'Confirmar con la clienta las palabras exactas.' },
  { color: 'si', n: '10', titulo: '10.000 personas, 0 testimonios',
    gancho: 'Atendió a 10.000 personas en diez años. Tiene 0 testimonios.',
    porque: 'Contraste de números que nadie discute. Pasa el filtro EPIC entero.',
    arreglo: 'Falta la prueba real a los 90 días.' },
  { color: 'amb', n: '5', titulo: 'Tu hora real neta',
    gancho: '¿Cuánto ganas de verdad por cada hora de tu vida? Cuenta también el WhatsApp de las once de la noche.',
    porque: 'Gancho insomnio y herramienta con nombre propio, pero nombra a un cliente con su resultado.',
    arreglo: 'Cambiar el nombre por «un terapeuta» y queda verde.' },
  { color: 'amb', n: '4', titulo: 'Mi método tiene tres candados',
    gancho: 'Gasté 10.000 dólares en grabar contenido que nunca usé.',
    porque: 'Arranca hablando de él antes de que el cliente se sienta nombrado. Los candados son un gran 20.',
    arreglo: 'Abrir con el cliente: «Ya tienes tu programa y estás por pagar anuncios.»' },
  { color: 'amb', n: '6', titulo: 'La receta es tuya',
    gancho: 'Eres reemplazable en servicio. No eres reemplazable en marketing.',
    porque: 'La cuenta 50 × 20 = 1.000 suena a promesa de ingresos y a sesiones baratas.',
    arreglo: 'Sacar la cuenta del anuncio; que la cuente el video.' },
  { color: 'amb', n: '7', titulo: 'Un oficio se cobra',
    gancho: 'Las manos que me sanaron a los nueve nunca cobraron.',
    porque: 'Historia propia muy fuerte, pero en frío llega antes que el espejo.',
    arreglo: 'Usarla dentro del video como «yo estuve ahí».' },
  { color: 'no', n: '9', titulo: 'Adiós, Excel. Adiós, once de la noche',
    gancho: 'Prohibido responder a mano lo que ya respondiste cien veces.',
    porque: 'Nombra a una clienta con su resultado y el 20 lo dice cualquiera que venda IA.',
    arreglo: 'Sin nombre y con un 20 propio, o fuera del set.' },
  { color: 'no', n: '1', titulo: 'Tu techo de ingresos tiene apellido',
    gancho: '¿Cuánto ganó la persona que más dinero ganó en tu familia? Ese número es tu techo.',
    porque: 'Pregunta por el dinero de la familia del lector: Meta lo lee como atributo personal.',
    arreglo: 'Llevar la idea al video, no al anuncio frío.' },
  { color: 'no', n: '2', titulo: '¿Para qué te sirve la agenda llena?',
    gancho: '¿Para qué te sirve tener la agenda llena? No contestes rápido.',
    porque: 'Infancia, terapia y bloqueos: roza salud mental y Meta lo frena. El gancho es abstracto.',
    arreglo: 'Rinde en orgánico y en la llamada.' },
];

/* ══════════════════ LAS SIETE ESTRUCTURAS ══════════════════ */

export interface Plantilla {
  id: string;
  nombre: string;
  /** De dónde sale la estructura. */
  origen: string;
  /** Cuándo conviene usarla. */
  cuando: string;
  /** A qué momento del público le habla. */
  estado: 'No la vio' | 'Interesado' | 'Urgente';
  /** Los pasos: [nombre del paso, ejemplo hablado]. */
  pasos: Array<[string, string]>;
}

export const PLANTILLAS: Plantilla[] = [
  { id: 'julio', nombre: 'Anuncio de Julio', origen: 'Seis pasos',
    cuando: 'La oferta se entiende y hay una prueba real.', estado: 'Urgente',
    pasos: [
      ['Gancho al resultado', '¿Por qué subo contenido a mis redes y no vendo?'],
      ['Lo que otros hacen mal', 'La mayoría contrata una agencia que le cobra 15 posts por mes.'],
      ['Lo que sí funciona', 'Antes de contratar a nadie, le hice rayos X a mi negocio.'],
      ['Prueba de X a Y', 'Pasó de cero consultas a cinco agendas por semana. [DATO REAL]'],
      ['Llamado claro', 'Toca abajo y te hacemos cinco preguntas para encontrar tu problema.'],
      ['Costo de no hacerlo', 'Este anuncio no lo vas a volver a ver.'],
    ] },
  { id: 'reel20', nombre: 'Historia con el 20', origen: 'Estructura de reel de Julio',
    cuando: 'Hay una historia con intriga. El anuncio que no parece anuncio.', estado: 'Interesado',
    pasos: [
      ['Gancho abierto', 'Su primera venta al precio nuevo la cerró encerrada en un baño.'],
      ['Contexto', 'Quince minutos de llamada. Dijo el precio. Silencio.'],
      ['Segundo gancho', 'Llegó la transferencia. Y lloró ahí, entre las toallas.'],
      ['Valor', 'En la llamada hay una regla: prohibido hacerle coaching al cliente.'],
      ['El 20', 'En la venta no estás tú contra el cliente: estás tú contra ti.'],
      ['Llamado', 'Toca abajo y mira el video.'],
    ] },
  { id: 'diez', nombre: 'Fórmula de 10', origen: 'Avance, obstáculo, escasez',
    cuando: 'A cámara, directo, para quien ya está avanzando.', estado: 'Urgente',
    pasos: [
      ['Avance (un logro)', 'Te ascendieron.'],
      ['Obstáculo', 'Y por primera vez no sabes si vas a estar a la altura.'],
      ['Error de la mayoría', 'La mayoría trabaja más horas para demostrar que lo merece.'],
      ['Solución real', 'El cargo nuevo te pide ser otra persona, no hacer más.'],
      ['Autoridad', 'Soy [nombre]. Acompañé a [X] directivos.'],
      ['Método', '[Método con nombre], en 90 días.'],
      ['Llamado al video', 'En el video te muestro lo que cambia el primer mes.'],
      ['Escasez', 'Acompaño a pocos uno a uno: me quedan [X] lugares.'],
      ['Exclusividad', 'Solo para quien ya lidera un equipo.'],
      ['Llamado final', 'Toca abajo y mira el video.'],
    ] },
  { id: 'gatillo', nombre: 'Evento gatillo', origen: 'Del libro Sanadores Libres',
    cuando: 'Hay un momento con fecha, hora o frase textual.', estado: 'Urgente',
    pasos: [
      ['Evento', 'El 24 de julio firmé a mano un pacto: dejar de hacerles el trabajo a mis clientes.'],
      ['Lo que ya probó', 'Contrataste la agencia, el community, el curso con plantillas.'],
      ['Por qué no funciona', 'Te dejan el auto en la puerta. Nadie te enseñó a manejar.'],
      ['Solución diferente', 'Instalo contigo, un día por semana, durante 90 días.'],
      ['Invitación', 'Toca abajo y mira el video.'],
    ] },
  { id: 'dato', nombre: 'El dato', origen: '¿Sabías que…?',
    cuando: 'Hay un dato verificable que contradice lo que cree.', estado: 'No la vio',
    pasos: [
      ['El dato', 'Un estudio de la Universidad de X mostró que [DATO REAL].'],
      ['Qué significa para ti', 'O sea: lo que haces cada lunes juega en contra.'],
      ['La idea nueva (el 20)', 'No te falta disciplina: te sobra un paso.'],
      ['Llamado', 'En el video te muestro cuál es.'],
    ] },
  { id: 'yan', nombre: 'Curiosidad de Yan', origen: 'Gancho y dos recompensas',
    cuando: 'Probar ganchos distintos sobre la misma idea.', estado: 'Interesado',
    pasos: [
      ['Gancho (curiosidad, contraste o controversia)', '¿Por qué el gimnasio que más factura en el mundo sirve pizza los viernes?'],
      ['Recompensa 1', 'Porque le vende al que quiere ir al gimnasio, no al que va.'],
      ['Recompensa 2', 'Toca abajo y mira el video.'],
    ] },
  { id: 'analogia', nombre: 'Analogía', origen: 'Mecanismo de Yan',
    cuando: 'Lo que haces es abstracto y necesita una imagen.', estado: 'Interesado',
    pasos: [
      ['Algo que ya conoce', 'Una chef famosa no cocina todos los platos.'],
      ['Cómo se parece', 'La receta es suya; otros la ejecutan.'],
      ['El mecanismo con nombre', 'Tu energía tiene un orden: primero marketing, después venta, al final servicio.'],
      ['El 20', 'Tu mejor energía no es para atender. Es para que te encuentren.'],
      ['Llamado', 'Toca abajo y mira el video.'],
    ] },
];

/* ══════════════════ LAS TRES ELECCIONES DE LA FICHA ══════════════════ */

export const OFERTAS = [
  'Alto valor con llamada',
  'Entrada con compra directa',
  'Evento o experiencia con fecha',
] as const;

export const DESTINOS = [
  'Video y agenda',
  'Mensaje con palabra clave',
  'Página de compra',
] as const;

export const VOCES = [
  'Español neutro, de tú',
  'De usted',
] as const;

/* ══════════════════ LA FICHA ══════════════════ */

export interface Veinte {
  id: string;
  texto: string;
  /** De qué material propio sale. */
  de: string;
  /** Qué creencia da vuelta. */
  porque: string;
}

export interface AnuncioEscrito {
  id: string;
  plantilla: string;
  titular: string;
  /** Los tres textos para Meta: gancho, el 20, llamado. */
  lineas: string[];
  veinte: string;
  /** El guion a cámara: [paso, texto hablado]. */
  pasos: Array<[string, string]>;
  /** Cómo grabarlo para que no parezca anuncio. */
  visual: string;
  /** El filtro EPIC, autoevaluado. */
  epic: Partial<Record<'E' | 'P' | 'I' | 'C', string>>;
  /** Lo que más falta, en una frase. */
  nota: string;
  /** Datos reales que faltan antes de publicar. */
  pendiente: string;
}

export interface PuntoDeRevision {
  ok: boolean;
  regla: string;
  porque: string;
  arreglo: string;
}

export interface Revision {
  veredicto: 'agenda' | 'mixto' | 'curiosos' | '';
  resumen: string;
  veinte: string;
  epic: Partial<Record<'E' | 'P' | 'I' | 'C', string>>;
  puntos: PuntoDeRevision[];
  reescritura: { lineas: string[]; titular: string };
}

export interface Ficha {
  id: string;
  nombre: string;
  rubro: string;
  voz: string;
  oferta: string;
  destino: string;
  palabra: string;
  avatar: string;
  avance: string;
  obstaculo: string;
  error: string;
  metodo: string;
  propio: string;
  prueba: string;
  frases: string;
  cta: string;
  cupos: string;
  veintes: Veinte[];
  sel20: string[];
  plantillas: string[];
  anuncios: AnuncioEscrito[];
  rev: { texto: string; titular: string; res: Revision | null };
  plan: { ticket: string; cierre: string; parte: string; agendas: string };
}

/** Los campos que la ficha necesita para que la IA no invente. */
export const CAMPOS_DE_LA_FICHA: Array<[keyof Ficha, string]> = [
  ['rubro', 'A qué se dedica'],
  ['avatar', 'Cliente ideal'],
  ['avance', 'Avance'],
  ['obstaculo', 'Obstáculo'],
  ['error', 'Error de la mayoría'],
  ['metodo', 'Método con nombre'],
  ['propio', 'Material propio'],
  ['prueba', 'Prueba real'],
  ['frases', 'Frases de clientes'],
];

export function fichaVacia(id: string): Ficha {
  return {
    id, nombre: '', rubro: '', voz: VOCES[0], oferta: OFERTAS[0], destino: DESTINOS[0],
    palabra: '', avatar: '', avance: '', obstaculo: '', error: '', metodo: '',
    propio: '', prueba: '', frases: '', cta: '', cupos: '',
    veintes: [], sel20: [], plantillas: ['julio', 'reel20', 'gatillo'], anuncios: [],
    rev: { texto: '', titular: '', res: null },
    plan: { ticket: '', cierre: '', parte: '', agendas: '' },
  };
}

/** Cuántos campos clave están cargados de verdad. */
export function completitud(f: Ficha): { hechos: number; total: number; faltan: string[] } {
  const lleno = (k: keyof Ficha) => {
    const v = String(f[k] ?? '').trim();
    // Un `[DATO REAL: …]` es un recordatorio de lo que falta, no el dato.
    return v.length > 0 && !/^\[DATO REAL/i.test(v);
  };
  const faltan = CAMPOS_DE_LA_FICHA.filter(([k]) => !lleno(k)).map(([, label]) => label);
  return { hechos: CAMPOS_DE_LA_FICHA.length - faltan.length, total: CAMPOS_DE_LA_FICHA.length, faltan };
}

/** La ficha en texto, para el prompt. Los campos vacíos no viajan. */
export function perfilDeFicha(f: Ficha): string {
  const L: Array<[string, string]> = [
    ['Marca', f.nombre],
    ['A qué se dedica', f.rubro],
    ['Tipo de oferta', f.oferta],
    ['Destino del anuncio', f.destino],
    ['Palabra clave', f.destino === DESTINOS[1] ? f.palabra : ''],
    ['Voz', f.voz],
    ['Cliente ideal (conducta)', f.avatar],
    ['Avances (logros que ya tuvo)', f.avance],
    ['Obstáculo que aparece justo ahí', f.obstaculo],
    ['Error de la mayoría', f.error],
    ['Método con nombre', f.metodo],
    ['Material propio: herramientas e historias', f.propio],
    ['Prueba real', f.prueba],
    ['Frases textuales de sus clientes', f.frases],
    ['Qué pasa al tocar', f.cta],
    ['Cupos y fechas reales', f.cupos],
  ];
  return L.filter(([, v]) => String(v ?? '').trim())
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join('\n');
}

/* ══════════════════ LAS REGLAS, PARA EL PROMPT ══════════════════ */

/**
 * Las diecisiete reglas que la IA tiene que cumplir, armadas para ESTA ficha.
 *
 * Salen de las mismas veinte que el cliente lee en «Aprende». Cambian con el
 * tipo de oferta y con el destino porque no son lo mismo: en alto valor el
 * precio vive en la página y nombrarlo en el anuncio baja el valor; en una
 * entrada de 47 el precio filtra curiosos y conviene decirlo.
 */
export function reglasPara(f: Ficha): string {
  const alto = f.oferta === OFERTAS[0];
  const destino = f.destino || DESTINOS[0];
  const cta = destino === DESTINOS[0]
    ? 'El único trabajo del anuncio es llevar al video. El llamado dice qué pasa al tocar (mirar el video y responder preguntas).'
    : destino === DESTINOS[1]
      ? `El llamado pide comentar o escribir la palabra clave "${f.palabra || '[PALABRA]'}" y dice qué llega por mensaje.`
      : 'El llamado dice qué pasa al tocar y qué compra en la página.';

  return [
    'REGLAS (cúmplelas todas):',
    '1. Gancho al resultado o a algo que le pasó al lector, nunca al producto. Que no parezca anuncio. Directo con el dato: prohibido "te cuento algo", "lo que nadie te dice", "quédate hasta el final".',
    '2. Espejo: lo que la mayoría hace mal, en conducta concreta, para que el lector concluya solo que es él. Nunca decirle que se equivoca.',
    '3. Conducta real, nunca deseo: prohibido "¿te gustaría…?". Usa lo que hizo en los últimos 3 meses.',
    '4. El mecanismo lleva nombre propio y se apoya en una analogía de algo que el lector ya conoce. Se dice el QUÉ, nunca el CÓMO.',
    '5. EL 20: una sola idea central, nueva, contraintuitiva, en una frase corta, que sale del material propio del cliente para que nadie lo confunda con otro. La respuesta va al final, después de la intriga.',
    '6. Nivel insomnio: instala una pregunta que no deja dormir. Nunca tragedia ni "última vía".',
    '7. Prueba de X a Y de alguien parecido al cliente ideal, SIN nombre propio. Si falta, escribe [DATO REAL: qué falta].',
    `8. ${cta} Costo de no hacerlo solo con cupos y fechas reales.`,
    '9. El avance es un LOGRO que pasó ("corriste publicidad"), nunca un estado ("ya tienes tu método").',
    alto
      ? '10. El cliente ideal factura bien y está agotado: le cuesta ganarlo. Prohibida cualquier señal de pobreza. SIN precio en el anuncio.'
      : '10. Prohibida cualquier señal de pobreza. El precio puede ir en el anuncio si es real: filtra curiosos.',
    '11. Siempre en positivo: di lo que sí es, nunca "no es un…". Nada de aclaraciones que abran una duda.',
    '12. Sin descuentos, sin emojis, sin listas. Nunca la palabra "gente": usa "personas" o "consultantes".',
    '13. Meta: háblale con hechos y conductas; nunca le afirmes una condición personal, de salud o de dinero. Sin promesas de ingresos, de resultados de salud ni antes y después.',
    '14. La historia es del lector: si cuentas una tuya, termina pasándosela a él.',
    '15. Hablado y natural, como lo diría una persona en voz alta. Sin poesía, sin pausas dramáticas, sin cierres inspiracionales, sin tono de marketing.',
    '16. Medidas: la primera línea entra en 125 caracteres; titular de 40 como máximo.',
    '17. No inventes cifras, cupos, fechas, testimonios, estudios ni años. Lo que falte va como [DATO REAL: …].',
  ].join('\n');
}

/* ══════════════════ LA REVISIÓN AL INSTANTE ══════════════════ */

export type MarcaDeRevision = { tipo: ColorSemaforo; texto: string };

/**
 * Lo que se puede medir sin preguntarle a nadie: largos, palabras prohibidas
 * y las reglas que son una condición exacta.
 *
 * Va separado de la revisión con IA a propósito. Esto contesta mientras
 * escribe, no después de esperar; y lo que es una regla dura —la palabra
 * prohibida, el
 * gancho de 125, el descuento— no necesita criterio, necesita una medida.
 */
export function marcasAlInstante(f: Ficha | null, lineas: string[], titular: string): MarcaDeRevision[] {
  const t = lineas.join('\n');
  const l1 = lineas[0] || '';
  const o: MarcaDeRevision[] = [];
  const alto = !f || f.oferta === OFERTAS[0];
  const add = (tipo: ColorSemaforo, texto: string) => o.push({ tipo, texto });

  if (!l1.trim()) { add('amb', 'Todavía no hay texto.'); return o; }

  if (l1.length > 125) add('no', `El gancho tiene ${l1.length} caracteres y Meta lo corta a los 125.`);
  else add('si', `El gancho entra entero en lo que se ve (${l1.length} de 125).`);

  if ((titular || '').length > 40) add('no', `El titular tiene ${titular.length} caracteres. Máximo 40.`);
  else if (titular) add('si', `Titular de ${titular.length} caracteres.`);

  if (/te gustar[ií]a|quieres (ganar|tener|lograr)/i.test(t))
    add('no', 'Parte del deseo («¿te gustaría…?»). Usa lo que ya hizo.');
  if (/te cuento|te voy a contar|nadie te dice|nadie te cuenta|qu[eé]date hasta|hasta el final/i.test(t))
    add('no', 'Gancho anunciado. Arranca directo con el dato.');
  if (/\bgente\b/i.test(t))
    add('no', 'Dice «gente». Usa «personas» o «consultantes».');
  if (/no me alcanza|no te alcanza|fin de mes|cuenta vac[ií]a|sin plata|sin dinero|falta de (plata|dinero)/i.test(t))
    add('no', 'Señal de pobreza: atrae a quien no puede pagar.');
  if (alto && /\$\s?\d|\d[\d.,]*\s?(usd|d[oó]lares|euros|pesos)\b/i.test(t))
    add('amb', 'Menciona precio. En alto valor, el precio vive en la página.');
  if (/descuento|% ?off|\d+ ?% de/i.test(t))
    add('no', 'Habla de descuento: baja el valor.');
  if (/¿est[aá]s (agotad|deprimid|cansad|estresad|ansios|quemad)|tu ansiedad|tu depresi/i.test(t))
    add('no', 'Le afirma una condición personal. Meta lo frena: usa hechos.');
  if (/garantiz|te curamos|100 ?% efectiv|antes y despu[eé]s/i.test(t))
    add('no', 'Promesa garantizada o antes y después. Meta lo rechaza.');
  if (/\bno es (un|una|otro|otra)\b/i.test(t))
    add('amb', 'Define por lo que no es. Dilo en positivo.');
  if (/\p{Extended_Pictographic}/u.test(t))
    add('amb', 'Tiene emojis.');
  if (/^\s*([-•*]|\d+[.)])\s/m.test(t))
    add('amb', 'Tiene una lista. Pásala a una sola idea.');
  if (t.length > 500)
    add('amb', `Son ${t.length} caracteres: los textos largos traen curiosos.`);
  if (/\[DATO REAL/i.test(t))
    add('amb', 'Faltan datos reales entre corchetes.');

  return o;
}

/** El puntaje de 0 a 100. Una falta pesa tres veces más que un aviso. */
export function puntaje(marcas: MarcaDeRevision[]): number {
  let s = 100;
  for (const m of marcas) {
    if (m.tipo === 'no') s -= 18;
    else if (m.tipo === 'amb') s -= 6;
  }
  return Math.max(0, s);
}

/* ══════════════════ LA CUENTA DEL PRESUPUESTO ══════════════════ */

export interface CuentaDeAgenda {
  porCliente: number;
  porAgenda: number;
  porSemana: number;
  porDia: number;
  /** false mientras falten el precio o la parte a invertir. */
  sirve: boolean;
}

/**
 * Cuánto se puede pagar por una agenda.
 *
 * Primero se decide cuánto vale traer un cliente; recién después se pauta. Al
 * revés —poner un presupuesto y ver qué sale— no hay número contra el cual
 * comparar, y entonces cualquier costo parece caro o barato según el ánimo.
 */
export function cuentaDeAgenda(plan: Ficha['plan']): CuentaDeAgenda {
  const n = (v: string) => {
    const x = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(x) ? x : 0;
  };
  const precio = n(plan.ticket);
  const parte = n(plan.parte) / 100;
  const cierre = n(plan.cierre) / 10;
  const agendas = n(plan.agendas);

  const porCliente = precio * parte;
  const porAgenda = porCliente * cierre;
  const porSemana = porAgenda * agendas;
  return {
    porCliente, porAgenda, porSemana, porDia: porSemana / 7,
    sirve: precio > 0 && parte > 0,
  };
}

/* ══════════════════ LO QUE SE DESCARGA ══════════════════ */

export function exportarFicha(f: Ficha): string {
  const o: string[] = [`CLIENTE: ${f.nombre}`, '', perfilDeFicha(f), ''];
  f.anuncios.forEach((a, i) => {
    const pl = PLANTILLAS.find((p) => p.id === a.plantilla);
    o.push(`=== ANUNCIO ${i + 1} · ${pl ? pl.nombre : ''} ===`, `EL 20: ${a.veinte}`, '',
      'TEXTO', a.lineas.join('\n'), '', `TITULAR: ${a.titular}`, '', 'GUION');
    a.pasos.forEach(([paso, texto]) => o.push(`${paso}: ${texto}`));
    if (a.visual) o.push('', `CÓMO GRABARLO: ${a.visual}`);
    o.push('');
  });
  return o.join('\n');
}
