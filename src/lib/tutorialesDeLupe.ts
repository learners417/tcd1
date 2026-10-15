/**
 * LOS TUTORIALES DE LUPE, ESCRITOS — para que estén antes del video.
 *
 * ═══ EL HUECO, QUE ERA PEOR QUE UNA PANTALLA VACÍA ═══
 *
 * El Camino tiene 21 tutoriales de paso a paso en pantalla. Trece están
 * grabados. Y así estaba escrito el bloque que los muestra:
 *
 *     const t = roadmap.tutoriales.find(
 *       (x) => x.dia === dia && (videosPorPilar[x.codigo] || PDFS[x.codigo]));
 *     if (!t) return null;
 *
 * Sin video y sin PDF, el tutorial NO SE MUESTRA. No queda vacío: desaparece.
 *
 * O sea que el cliente llega al día 2, hace su jornada, y nunca se entera de
 * que había un paso a paso para cargar sus consultantes, su agenda y sus
 * cobros. No es que lo vea pendiente: no existe para él. Y lo mismo en el día
 * 9 con su link de pago, en el 25 con su página, en el 44 con su bandeja y en
 * el 67 con su contenido.
 *
 * Son ocho jornadas donde el cliente queda sin la mitad de lo que compró y sin
 * saberlo.
 *
 * ═══ LA DECISIÓN ═══
 *
 * El texto es el tutorial. El video, cuando llegue, se suma arriba.
 *
 * No al revés: no es un cartel que dice «el video viene pronto» con el paso a
 * paso escondido detrás. Alguien que está en el día 9 y necesita su link de
 * pago tiene que poder hacerlo hoy, leyendo. Si el video fuera la única forma,
 * su Camino se detendría a esperar una grabación.
 *
 * Y por eso cada uno lleva `siFalla`: leyendo sin alguien al lado, lo que
 * trabaja es lo que sale distinto de lo que dice el paso. Un paso a paso sin
 * la salida del error es un paso a paso que funciona solo cuando todo sale
 * bien — y entonces no hacía falta.
 */

import type { TutorialTecnico } from './tutorialesTecnicos';

/**
 * Los ocho que faltaban, por su código del Camino.
 *
 * Los trece grabados no están acá: ya tienen su video y su minutaje en
 * `videosCargados.ts`. Duplicarlos dejaría dos versiones del mismo paso a
 * paso, y el día que una cambie, el cliente lee la que no se actualizó.
 */
export const TUTORIALES_DE_LUPE: Record<string, TutorialTecnico> = {

  'L-02': {
    dia: 17,
    codigo: 'L-02',
    titulo: 'Cargar tus consultantes, tu agenda y tus cobros',
    intro:
      'Es la primera vez que vas a ver todo tu trabajo en un solo lado: quién es '
      + 'cada uno, cuándo lo ves y qué te debe. Se carga una vez y después se '
      + 'actualiza solo.',
    pasos: [
      'Entra a Mi Clínica con las mismas dos llaves que usas acá. Es la otra mitad: '
      + 'acá armas tu negocio, allá lo atiendes.',
      'Carga tus consultantes activos: nombre, cómo te contactó y desde cuándo lo '
      + 'atiendes. Solo los activos. Los que ya cerraron no se cargan ahora.',
      'Para cada uno, carga lo que te paga y cada cuánto. Si varios pagan distinto, '
      + 'cárgalo como está hoy, no como te gustaría que fuera.',
      'Pon tus turnos de esta semana y la que viene. Dos semanas alcanzan: la tercera '
      + 'la vas cargando a medida que agendas.',
      'Mira el total de lo que entra por mes. Ese número es tu punto de partida, y es '
      + 'el que vas a ver moverse.',
    ],
    siFalla:
      'Si no te deja entrar con tus llaves, es que todavía no está habilitado tu '
      + 'acceso. Mándanos un mensaje y lo habilitamos el mismo día.',
  },

  'L-03': {
    dia: 5,
    codigo: 'L-03',
    titulo: 'Tu link de pago',
    intro:
      'Un link que mandas y la persona paga. Desde hoy cobrar deja de ser una '
      + 'conversación sobre números y pasa a ser un link.',
    pasos: [
      'En tu pasarela de cobro, crea un producto con el nombre de tu programa. No lo '
      + 'llames «sesión»: lo que vendes es el proceso completo.',
      'Pon el precio que acabas de definir en tu jornada del precio. El de hoy, no el '
      + 'de antes.',
      'Activa las cuotas si tu pasarela las tiene, y mira cuánto se queda de comisión '
      + 'en cada plan. Esa diferencia la pagas tú.',
      'Copia el link y pégalo en tu página de agenda, en el correo de confirmación, y '
      + 'guárdalo donde lo tengas a mano para mandarlo por mensaje.',
      'Pruébalo tú: paga el monto más chico que te deje, mira que te llegue el aviso, '
      + 'y después devuélvete el dinero desde el panel.',
    ],
    siFalla:
      'Si el link abre pero no cobra, es que el producto quedó en borrador: en tu '
      + 'pasarela hay un botón para publicarlo y recién ahí el link funciona.',
  },

  'L-04': {
    dia: 17,
    codigo: 'L-04',
    titulo: 'Facturar y llevar la cuenta',
    intro:
      'Lo que cobras tiene que quedar anotado el mismo día. No por el contador: '
      + 'porque es el único número que te dice si tu precio nuevo está funcionando.',
    pasos: [
      'Decide una sola vez cómo facturas y quién la emite. Si ya tienes contador, '
      + 'pregúntale hoy y anótalo.',
      'Cada cobro que entra se anota el mismo día en Mi Clínica: cuánto, de quién, y '
      + 'por qué concepto.',
      'Separa lo que es tuyo de lo que es del negocio. Lo más simple que funciona: dos '
      + 'cuentas, y un día fijo al mes en que te pagas a ti.',
      'Anota también lo que sale: la pauta, las herramientas, lo que le pagas a quien '
      + 'te ayuda. Sin eso el número de arriba miente.',
      'Elige tu día de cierre — el mismo cada mes — y pon un recordatorio. Quince '
      + 'minutos ese día te ahorran el desorden del trimestre.',
    ],
    siFalla:
      'Si no sabes bajo qué figura facturar en tu país, no frenes acá: anota los '
      + 'cobros igual y resuelve la figura con tu contador esta semana. Lo que no se '
      + 'anota no se recupera.',
  },

  'L-05': {
    dia: 16,
    codigo: 'L-05',
    titulo: 'Subir tu página y publicarla',
    intro:
      'Tu página deja de ser un borrador y pasa a tener una dirección propia. Desde '
      + 'ahí en adelante ya le puedes mandar a alguien.',
    pasos: [
      'En tu constructor de páginas, abre la que armaste y revisa que esté arriba de '
      + 'todo la misma frase de tu perfil. Palabra por palabra.',
      'Mírala en el teléfono antes de publicar. Lo que importa es que la primera '
      + 'pantalla, sin deslizar, diga a quién ayudas y con qué resultado.',
      'Toca publicar. Copia la dirección que te queda.',
      'Ábrela en el teléfono desde los datos, no desde tu wifi: así la ves como la ve '
      + 'cualquiera. Toca el botón de agendar y llega hasta el final.',
      'Pega esa dirección en el enlace de tu perfil de Instagram.',
    ],
    siFalla:
      'Si la página abre en blanco desde el teléfono y bien desde tu computadora, es '
      + 'que quedó publicada solo como borrador compartido. Vuelve a publicar y '
      + 'espera dos minutos antes de probar otra vez.',
  },

  'L-18': {
    dia: 25,
    codigo: 'L-18',
    titulo: 'Tu bandeja y tu embudo',
    intro:
      'Cuando empiezan a escribirte varios por semana, la memoria no alcanza. El '
      + 'embudo es la lista de en qué momento está cada uno, y es lo que te evita '
      + 'perder a alguien que estaba por decir sí.',
    pasos: [
      'Conecta tus mensajes de Instagram a tu bandeja, para contestar todo desde un '
      + 'solo lugar y no desde cuatro aplicaciones.',
      'Arma las cuatro etapas de tu embudo, en este orden: escribió · agendó · tuvo '
      + 'la llamada · decidió.',
      'Mueve a mano a los que tengas abiertos ahora mismo. Es la única vez que lo '
      + 'haces completo.',
      'Pon una tarea automática en «agendó»: recordarle el día anterior. Es la etapa '
      + 'donde más se cae.',
      'Mira la lista de «escribió» y cuenta cuántos están ahí hace más de tres días. '
      + 'A esos, escríbeles hoy.',
    ],
    siFalla:
      'Si los mensajes de Instagram no aparecen, es que la cuenta conectada es la '
      + 'personal y no la profesional. Se cambia en los ajustes de Instagram y '
      + 'después se vuelve a conectar.',
  },

  'L-19': {
    dia: 25,
    codigo: 'L-19',
    titulo: 'Tus respuestas automáticas',
    intro:
      'Dos mensajes escritos una vez, que trabajan todos los días: el que contesta '
      + 'cuando te escriben y el que recuerda la llamada. Son los que te sacan del '
      + 'teléfono.',
    pasos: [
      'Escribe la respuesta de bienvenida: una línea que reconoce lo que escribió y '
      + 'UNA sola pregunta. Nunca dos.',
      'Ponla para que salga en menos de un minuto. Lo que hace la diferencia no es lo '
      + 'que dice: es que llegue mientras la persona todavía está mirando el teléfono.',
      'Escribe el recordatorio de la llamada para el día anterior, con el link de la '
      + 'reunión adentro.',
      'Pruébalos con tu propio número: escríbete desde otra cuenta y agenda una '
      + 'llamada de prueba. Tienen que llegar los dos.',
      'Lee lo que escribiste en voz alta. Si no suena a algo que dirías, cámbialo: la '
      + 'persona del otro lado nota la diferencia y se enfría.',
    ],
    siFalla:
      'Si la respuesta automática sale dos veces, hay dos reglas activas haciendo lo '
      + 'mismo. Apaga la que venía por defecto y deja solo la tuya.',
  },

  'L-20': {
    dia: 86,
    codigo: 'L-20',
    titulo: 'Grabar y editar con el celular',
    intro:
      'No hace falta cámara ni estudio. Lo que decide si alguien se queda mirando es '
      + 'el sonido y los primeros tres segundos, y las dos cosas se resuelven con lo '
      + 'que ya tienes.',
    pasos: [
      'Grábate con la cámara de atrás, en vertical, apoyando el teléfono a la altura '
      + 'de tus ojos. La cámara de adelante se ve peor.',
      'Ponte de frente a una ventana, con la ventana delante de ti y nunca detrás. Esa '
      + 'es toda la iluminación que necesitas.',
      'Grábate en una habitación con cosas blandas — una cama, un sillón, cortinas. En '
      + 'un lugar vacío el sonido rebota y se escucha a hueco.',
      'Di tu primera frase antes de empezar a hablar de verdad: los tres primeros '
      + 'segundos deciden si se quedan, así que arranca por lo más fuerte.',
      'Edita cortando solo los silencios y lo que repetiste. Pon los subtítulos '
      + 'automáticos y léelos: corrige los nombres y los términos que escribió mal.',
    ],
    siFalla:
      'Si el video se ve bien y se escucha lejos, el teléfono estaba a más de un metro. '
      + 'Acércalo, o grábate el audio aparte con los auriculares puestos.',
  },

  'L-21': {
    dia: 86,
    codigo: 'L-21',
    titulo: 'Programar tu contenido del mes',
    intro:
      'Grabar un día y publicar todo el mes. Es la diferencia entre publicar cuando '
      + 'te acuerdas y tener presencia.',
    pasos: [
      'Elige un día fijo a la semana para grabar todo junto. El mismo día siempre: lo '
      + 'que cambia de día no se hace.',
      'Grábate cuatro piezas de una sentada, con la misma ropa y el mismo lugar. Nadie '
      + 'se da cuenta y te ahorra tres sesiones.',
      'Súbelas a tu programador y pon las fechas de todo el mes de una vez.',
      'Escribe el texto de cada una en el momento de programarla, no después. Después '
      + 'se publica sin texto o no se publica.',
      'Deja un espacio libre por semana a propósito. Es para lo que surja: una pregunta '
      + 'que te hicieron, algo que pasó. Eso es lo que más funciona y no se puede '
      + 'planificar.',
    ],
    siFalla:
      'Si el programador no publica a la hora, revisa la zona horaria de la cuenta: '
      + 'casi siempre quedó en la que trae por defecto y no en la tuya.',
  },
  // ── Los trece que faltaban ──
  //
  // El bloque que los muestra pide video, PDF o texto. Sin ninguno de los
  // tres el tutorial no aparece: desaparece. Trece estaban así, y entre ellos
  // los cuatro del día 29 y los dos del 31 — Meta, el pixel y encender las
  // campañas—, que son las jornadas más técnicas del Camino.
  //
  // Para La Instalación casi no se nota, porque lo monta el equipo. Para La
  // Base y El Ascenso es el producto: montan todo ellos, con esto.

  'L-01': {
    dia: 1,
    codigo: 'L-01',
    titulo: 'Tu primer ingreso a la plataforma',
    intro:
      'Son dos aplicaciones y hacen cosas distintas. En TCD está tu Camino: la '
      + 'sesión de cada día, tu ADN y tus entrenadores. En MiClínica está tu '
      + 'operación: tus consultantes, tu agenda y tus cobros. Entras a las dos con '
      + 'el mismo correo.',
    pasos: [
      'Entra a TCD con el correo con el que compraste y la contraseña que te '
      + 'llegó. Cámbiala en tu perfil ahora, antes de seguir.',
      'Mira el menú de abajo: Hoy, El Camino, Mi ADN y Contacto. Hoy es lo único '
      + 'que necesitas mirar cada mañana.',
      'Abre Contacto y escribe «listo». Así sabemos que entraste y tienes el hilo '
      + 'abierto por si algo no se ve bien.',
      'Instala la app en tu teléfono: desde el navegador, «Agregar a la pantalla '
      + 'de inicio». Se abre como una aplicación y no tienes que buscar el enlace.',
      'Vuelve a Hoy. Lo que esté ahí es tu jornada: no hace falta elegir nada.',
    ],
    siFalla:
      'Si la contraseña no entra, pide una nueva desde «Olvidé mi contraseña» con '
      + 'el mismo correo de la compra. Si el correo no le suena a la app, escríbenos '
      + 'por WhatsApp: es que la cuenta quedó con otro y lo cambiamos nosotros.',
  },

  'L-06': {
    dia: 16,
    codigo: 'L-06',
    titulo: 'Tu subdominio',
    intro:
      'Tu página necesita una dirección tuya. Hasta que la tenga, vive en una '
      + 'dirección del sistema que se ve prestada, y eso le resta a cualquiera que '
      + 'llegue desde un anuncio.',
    pasos: [
      'Decide la dirección antes de tocar nada: tu nombre o el de tu método, corto, '
      + 'sin guiones y sin números.',
      'Si ya tienes un dominio, en tu proveedor crea un registro CNAME que apunte al '
      + 'destino que te muestra la subcuenta. Si no tienes dominio, usa el '
      + 'subdominio que te ofrece la plataforma y sigue: esto no te detiene.',
      'Vuelve a la subcuenta y asigna ese dominio a tu página.',
      'Espera y vuelve a probar: un cambio de dominio puede tardar hasta una hora '
      + 'en verse en todas las redes.',
      'Ábrela desde el teléfono con los datos móviles, no desde tu wifi. Es la '
      + 'única prueba que vale.',
    ],
    siFalla:
      'Si abre con un aviso de «no es segura», falta el certificado: se emite solo '
      + 'y puede tardar un rato más que el dominio. Si después de dos horas sigue '
      + 'igual, quita el dominio y vuelve a asignarlo.',
  },

  'L-07': {
    dia: 17,
    codigo: 'L-07',
    titulo: 'Subir tu video a la página',
    intro:
      'El video es lo que hace el trabajo de la página. Quien llega desde un '
      + 'anuncio no lee: mira. Y tiene que arrancar sin que nadie toque nada.',
    pasos: [
      'Sube tu video a la biblioteca de tu subcuenta, o a YouTube como «no listado» '
      + 'si pesa mucho. Las dos sirven.',
      'En el editor de tu página, pon el bloque de video arriba, antes de cualquier '
      + 'texto largo.',
      'Déjalo que arranque solo y en silencio, con los controles a la vista: así se '
      + 've en movimiento y cada uno decide cuándo subir el volumen.',
      'Debajo del video, un solo botón, con las mismas palabras que tu llamado.',
      'Ábrela desde el teléfono y cuenta los segundos hasta que el video se ve. Si '
      + 'pasan más de tres, súbelo más liviano.',
    ],
    siFalla:
      'Si el video no arranca solo en el teléfono, es porque el sistema lo permite '
      + 'únicamente en silencio: déjalo en silencio y con los controles visibles. Si '
      + 'tarda en cargar, bájalo a 1080p y vuelve a subirlo.',
  },

  'L-08': {
    dia: 17,
    codigo: 'L-08',
    titulo: 'Tu formulario de filtro',
    intro:
      'El formulario no está para juntar datos. Está para que a tu llamada entre '
      + 'quien puede avanzar, y para que el que no, se dé cuenta solo y no te ocupe '
      + 'la hora.',
    pasos: [
      'Arma el formulario con las cinco preguntas que ya escribiste, y nada más. '
      + 'Cada pregunta extra te cuesta personas que sí servían.',
      'Pide nombre, WhatsApp con código de país, y correo. Marca los tres como '
      + 'obligatorios.',
      'Pon una pregunta de decisión con opciones, no abierta: en qué momento está, '
      + 'qué ya probó. Las opciones se pueden ordenar después; el texto libre, no.',
      'Al terminar, que lleve a tu página de preparación, no a un cartel de '
      + 'gracias. El que llena y queda en la nada se enfría ahí mismo.',
      'Llénalo tú de punta a punta desde el teléfono, como si fueras un desconocido, '
      + 'y confirma que tu respuesta llegó a tu lista de contactos.',
    ],
    siFalla:
      'Si tu prueba no aparece en la lista, es que el formulario no quedó conectado '
      + 'a la lista: en la configuración del formulario elige a dónde entra cada '
      + 'respuesta y vuelve a probar.',
  },

  'L-09': {
    dia: 17,
    codigo: 'L-09',
    titulo: 'Tu calendario en dos pasos',
    intro:
      'Dos pasos significa esto: elige día y hora, y confirma. Cada paso que le '
      + 'sumes te cuesta agendas, y las que más se caen son las que tardan.',
    pasos: [
      'Crea el calendario con la duración real de tu llamada, más quince minutos '
      + 'entre una y otra. Sin ese aire, terminas una tarde y arrancas otra sin '
      + 'respirar.',
      'Abre solo tus dos bloques de la semana. Un calendario con todo abierto te '
      + 'come la semana entera.',
      'Conéctalo a tu calendario personal en los dos sentidos, para que no te '
      + 'agenden sobre algo que ya tenías.',
      'Pon el recordatorio automático: uno el día antes y uno dos horas antes.',
      'Agéndate a ti mismo desde el teléfono y confirma que te llegó el aviso y que '
      + 'quedó en tu calendario.',
    ],
    siFalla:
      'Si te agendan en horarios que tenías ocupados, la conexión quedó en un solo '
      + 'sentido: tiene que leer tu calendario, no solo escribir en él. Y si el aviso '
      + 'no llega, revisa que el número esté con código de país.',
  },

  'L-10': {
    dia: 17,
    codigo: 'L-10',
    titulo: 'Tu página de preparación',
    intro:
      'Es la página que ve después de agendar, y es la que decide cuántos se '
      + 'presentan. El que agenda y no vuelve a saber nada de ti hasta el día de la '
      + 'llamada, la mitad de las veces no aparece.',
    pasos: [
      'Arriba, la fecha y la hora de su llamada, con su zona horaria. Es lo primero '
      + 'que busca.',
      'Debajo, en tres líneas, qué va a pasar en la llamada y cuánto dura. Sin '
      + 'misterio.',
      'Una cosa concreta para que traiga: un número, su precio de hoy, lo que ya '
      + 'probó. El que prepara algo, viene.',
      'Tu video más corto, el de un minuto, para que te vea la cara antes.',
      'Y el botón para agregarlo a su calendario. Ábrela desde el teléfono y '
      + 'pruébalo.',
    ],
    siFalla:
      'Si la hora que muestra no es la de la persona, falta que la página tome su '
      + 'zona horaria del navegador: ponla como dato dinámico y no escrita a mano.',
  },

  'L-11': {
    dia: 29,
    codigo: 'L-11',
    titulo: 'Tu página y perfil profesional',
    intro:
      'Para pautar necesitas una página de Facebook y tu Instagram en modo '
      + 'profesional, y las dos conectadas entre sí. Sin eso, Meta no te deja '
      + 'anunciar, y es el freno más común del día de encender.',
    pasos: [
      'Crea tu página de Facebook con tu nombre profesional, tu foto y tu enlace. '
      + 'No hace falta que tenga contenido.',
      'En Instagram, entra a los ajustes de la cuenta y pásala a cuenta '
      + 'profesional. Elige la categoría que más se acerque a lo que haces.',
      'Conecta tu Instagram profesional con esa página de Facebook, desde los '
      + 'ajustes de Instagram.',
      'Confirma que eres administrador de la página, no editor. Con permisos de '
      + 'editor no vas a poder crear la cuenta publicitaria.',
      'Entra a tu página desde la computadora y revisa que aparezca tu Instagram '
      + 'vinculado. Si ahí no se ve, el administrador de anuncios tampoco lo va a '
      + 'ver.',
    ],
    siFalla:
      'Si Instagram no encuentra tu página al conectarla, hazlo al revés: desde la '
      + 'configuración de la página, en la sección de cuentas vinculadas. Y si la '
      + 'cuenta es de un negocio que ya existía, revisa que no esté vinculada a otra '
      + 'página vieja: una cuenta solo se conecta a una.',
  },

  'L-12': {
    dia: 29,
    codigo: 'L-12',
    titulo: 'Business y cuenta publicitaria',
    intro:
      'El Business es la carpeta donde viven tu página, tu cuenta publicitaria y '
      + 'tu pixel. Armarlo bien hoy te evita el problema más caro: que tu '
      + 'publicidad quede atada a un perfil personal y no puedas moverla.',
    pasos: [
      'Crea tu Business con tu nombre o el de tu negocio, tu correo de trabajo y tu '
      + 'país. Uno solo: dos cuentas de negocio es el enredo más difícil de '
      + 'desarmar.',
      'Adentro, agrega tu página de Facebook y tu Instagram profesional como '
      + 'activos tuyos. Si te ofrece «solicitar acceso» en vez de «agregar», es que '
      + 'la página está en otro Business.',
      'Crea la cuenta publicitaria: nombre, tu zona horaria y tu moneda. La moneda y '
      + 'la zona horaria NO se pueden cambiar después.',
      'Asígnate a ti mismo acceso total a esa cuenta publicitaria.',
      'Confirma que en tu Business ves los tres: tu página, tu Instagram y tu cuenta '
      + 'publicitaria. Los tres o no estás listo.',
    ],
    siFalla:
      'Si te pide verificar el negocio, puedes seguir igual: la verificación hace '
      + 'falta para otras cosas, no para empezar a pautar. Y si la cuenta '
      + 'publicitaria aparece restringida de entrada, abre un reclamo desde la '
      + 'calidad de la cuenta: se resuelve en horas y no se arregla creando otra.',
  },

  'L-13': {
    dia: 29,
    codigo: 'L-13',
    titulo: 'Tarjeta o PayPal',
    intro:
      'Sin forma de pago cargada, tus anuncios se aprueban y no salen. Es el día '
      + 'donde más se pierde tiempo esperando algo que ya estaba andando.',
    pasos: [
      'En la configuración de pagos de tu cuenta publicitaria, agrega tu tarjeta de '
      + 'crédito o tu PayPal.',
      'Si tu tarjeta es de otro país que tu cuenta, usa PayPal: la mayoría de los '
      + 'rechazos son por eso.',
      'Avisa a tu banco que vas a tener un cargo de Meta. El primer cargo se cae '
      + 'por seguridad más seguido de lo que parece.',
      'Mira tu límite de gasto de la cuenta. Si está en un número bajo, súbelo o '
      + 'quítalo: con el límite puesto, la campaña se apaga sola al llegar.',
      'Confirma que la forma de pago figura como principal y activa, no como '
      + 'pendiente.',
    ],
    siFalla:
      'Si la tarjeta queda rechazada sin razón, no la cargues de nuevo tres veces: '
      + 'cada intento la marca más. Carga otra, o PayPal, y vuelve a la primera en '
      + 'unos días.',
  },

  'L-14': {
    dia: 29,
    codigo: 'L-14',
    titulo: 'Tu pixel',
    intro:
      'El pixel es lo que le dice a Meta quién de los que llegaron sirvió. Sin eso '
      + 'la plataforma te trae a cualquiera, porque no tiene con qué aprender.',
    pasos: [
      'En tu Business, crea el pixel con el nombre de tu negocio. Uno solo.',
      'Copia su código y pégalo en tu página, en la sección de código del encabezado '
      + 'de todo el sitio, no de una sola página.',
      'Instala la extensión de ayuda del pixel en tu navegador: es la única forma '
      + 'de ver si está disparando de verdad.',
      'Abre tu página desde el teléfono y recárgala. Después mira en el '
      + 'administrador de eventos que el pixel haya recibido actividad.',
      'Confirma que registra la visita a tu página de preparación: ese es el evento '
      + 'que mañana se convierte en tu agenda calificada.',
    ],
    siFalla:
      'Si no registra nada, casi siempre es que el código quedó en una página sola. '
      + 'Y si tu página está hecha con la plantilla de la subcuenta, no pegues el '
      + 'código a mano: carga el número del pixel en la configuración del sitio y lo '
      + 'pone en todas.',
  },

  'L-15': {
    dia: 31,
    codigo: 'L-15',
    titulo: 'Tu evento de agenda calificada',
    intro:
      'Que te lleguen conversaciones no alcanza. Lo que vale es la agenda que se '
      + 'presenta, y hasta que no se lo digas a Meta con un evento propio, la '
      + 'plataforma te va a optimizar hacia el clic más barato.',
    pasos: [
      'Decide cuál es el momento exacto que cuenta como agenda calificada: llenó el '
      + 'formulario y eligió hora.',
      'En el administrador de eventos, crea una conversión personalizada apuntada a '
      + 'la dirección de tu página de preparación, que es la única que se ve después '
      + 'de agendar.',
      'Ponle como categoría «programar», y asígnale el valor de tu programa. Sin '
      + 'valor, los informes no te van a dejar comparar nada.',
      'Agenda una prueba tú mismo y confirma que el evento se registró una vez, no '
      + 'tres.',
      'Recién entonces elige ese evento como objetivo de tu campaña.',
    ],
    siFalla:
      'Si el evento cuenta de más, es que la dirección que elegiste coincide con '
      + 'otras páginas: usa la coincidencia exacta y no «contiene». Y si no cuenta '
      + 'nada, revisa que tu página de preparación tenga el pixel: es la que más se '
      + 'olvida porque no se arma en el mismo rato que el resto.',
  },

  'L-16': {
    dia: 31,
    codigo: 'L-16',
    titulo: 'Tu público de retargeting',
    intro:
      'El que ya te vio y no agendó es el más barato de convencer. Pero solo '
      + 'existe si lo guardas desde el primer día: un público se llena con el '
      + 'tiempo y no se puede armar hacia atrás.',
    pasos: [
      'Crea un público personalizado con quienes visitaron tu página en los últimos '
      + '30 días.',
      'Crea otro con quienes vieron tu video más de quince segundos. Ese es el que '
      + 'mejor rinde.',
      'Crea el de exclusión: quienes llegaron a tu página de preparación. A los que '
      + 'ya agendaron no les gastas más.',
      'En tu campaña, excluye ese último público de todos los conjuntos. Si no, le '
      + 'pagas por volver a traer a quien ya tienes.',
      'Déjalos juntándose. Hoy están vacíos y en dos semanas son tu público más '
      + 'rentable.',
    ],
    siFalla:
      'Si el público queda «demasiado pequeño» para usarse, es normal al principio: '
      + 'necesita unas cuantas visitas para habilitarse. Déjalo creado y sigue con '
      + 'el público frío.',
  },

  'L-17': {
    dia: 23,
    codigo: 'L-17',
    titulo: 'Grabar tus llamadas',
    intro:
      'Tus llamadas grabadas son el único material con el que puedes mejorar tu '
      + 'cierre de verdad. Lo que recuerdas de una llamada es lo que te dejó '
      + 'tranquilo, no lo que pasó.',
    pasos: [
      'Prende la grabación automática en tu sala de videollamada, para no depender '
      + 'de acordarte en el momento.',
      'Al empezar cada llamada, avisa en una línea que la grabas para revisarla. '
      + 'Nadie dice no, y sin avisar no se puede usar.',
      'Guarda las grabaciones en una sola carpeta, con el nombre de la persona y la '
      + 'fecha.',
      'Elige dos de esta semana: una que cerró y una que no. Son las dos que '
      + 'enseñan.',
      'Mira solo los primeros cinco minutos de cada una y escribe qué dijiste '
      + 'distinto. Ahí se decide casi todo.',
    ],
    siFalla:
      'Si la grabación no aparece, revisa que se esté guardando en la nube y no en '
      + 'la computadora: en local se pierde cuando cierras sin esperar que procese.',
  },

};

/** Los códigos que ya tienen su paso a paso escrito. */
export const CODIGOS_ESCRITOS = Object.keys(TUTORIALES_DE_LUPE);

/** El tutorial escrito de un código, si existe. */
export function tutorialEscrito(codigo: string): TutorialTecnico | null {
  return TUTORIALES_DE_LUPE[codigo] ?? null;
}
