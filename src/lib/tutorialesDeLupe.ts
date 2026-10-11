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
    dia: 2,
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
    dia: 9,
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
    dia: 9,
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
    dia: 25,
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
    dia: 44,
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
    dia: 44,
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
    dia: 67,
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
    dia: 67,
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
};

/** Los códigos que ya tienen su paso a paso escrito. */
export const CODIGOS_ESCRITOS = Object.keys(TUTORIALES_DE_LUPE);

/** El tutorial escrito de un código, si existe. */
export function tutorialEscrito(codigo: string): TutorialTecnico | null {
  return TUTORIALES_DE_LUPE[codigo] ?? null;
}
