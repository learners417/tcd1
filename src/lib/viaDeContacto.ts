/**
 * CÓMO SE DISTINGUE EL DE $1.000 DEL DE $3.000 — Y CÓMO SE EVITA EL CONFLICTO.
 *
 * ═══ EL AGUJERO, PRIMERO ═══
 *
 * Hoy la pantalla de Mensajes no mira lo que contrató nadie. O sea: el que pagó
 * $1.000 tiene exactamente el mismo chat que el que pagó $3.000.
 *
 * El plan de $3.000 vale el triple por dos cosas que el otro no tiene: las
 * mentorías grupales y el soporte semanal. Una de las dos ya está regalada.
 *
 * Y basta con que Lupe le contteste UNA vez por el chat a alguien de La Base
 * para que el plan no valga nada nunca más: ese cliente le va a escribir todas
 * las semanas, con razón, porque le contestaron.
 *
 * ═══ LA DECISIÓN ═══
 *
 * La vía de contacto NO la decide una persona. Se deriva de lo que contrató, y
 * la app hace IMPOSIBLE escribir por la vía que no le toca — no se lo pide.
 *
 * Pedirle que no escriba al chat es dejar la regla en manos del cliente y, sobre
 * todo, en manos de quien recibe el mensaje: si el mensaje llega, alguien lo va
 * a contestar. Siempre. Por eso el que tiene Reporte no tiene un chat con un
 * cartel: no tiene chat.
 *
 *   LA BASE ($1.000) · EL REPORTE
 *     Escribe cuando quiere. Una respuesta escrita por reporte, en 48 horas
 *     hábiles. Por turnos, como un correo. Sin ida y vuelta en el momento.
 *     Ve el muro de victorias de la comunidad, en lectura.
 *
 *   EL ASCENSO ($3.000) y LA INSTALACIÓN ($5.000) · EL CHAT
 *     Chat con el equipo de lunes a viernes. Las tres mentorías grupales en su
 *     calendario con el link directo. Los canales de la comunidad, donde
 *     escribe y lee a los demás.
 *
 * ═══ POR QUÉ ESTO NO GENERA CONFLICTO ═══
 *
 * 1 · La diferencia se entiende sin explicación. «Chat con el equipo» contra
 *     «respuesta escrita en 48 horas» es una diferencia que cualquiera ve, y es
 *     la que justifica el precio. «Más acceso» no se puede discutir porque no
 *     se puede medir; esto sí.
 *
 * 2 · El de La Base NO queda sin soporte. Queda con soporte por turnos. Es la
 *     diferencia entre «no tengo a quién preguntarle» —que termina en reclamo—
 *     y «le pregunto y me contesta en dos días», que es un servicio.
 *
 * 3 · Lo que no tiene, no lo ve con candado. Un candado es una promesa
 *     incumplida en la cara: lo primero que hace es preguntar por qué. En su
 *     lugar ve una invitación, que es otra conversación: una que termina en
 *     venta y no en reclamo.
 *
 * 4 · Nadie decide a mano. El equipo no elige a quién le contesta por chat,
 *     porque al de La Base no le aparece el chat. Y Lupe tiene 6 horas por día
 *     para todos: lo que la sostiene no es su criterio, es que los mensajes que
 *     exigen respuesta en el momento sean solo los que se pagaron.
 */

import type { Ticket as ServicioContratado } from './cuadroTickets';

/* ══════════════════ LAS DOS VÍAS ══════════════════ */

export type Via = 'reporte' | 'chat';

export interface LaVia {
  via: Via;
  /** Cómo se llama en su pantalla. */
  nombre: string;
  /** Qué es, en una línea, dicho en positivo. */
  queEs: string;
  /** Cuándo le contestan. Concreto, no «a la brevedad». */
  cuandoLeContestan: string;
  /** Si puede escribir en los canales de la comunidad. */
  escribeEnComunidad: boolean;
  /** Si lee lo que escriben los demás. */
  leeComunidad: boolean;
  /** Si tiene las mentorías grupales. */
  tieneMentorias: boolean;
}

export const LA_BASE: LaVia = {
  via: 'reporte',
  nombre: 'Tu reporte',
  queEs:
    'Escribes cuando quieras y te contesto por escrito. Cuéntame dónde estás, '
    + 'qué trabó y qué necesitas: lo leo completo y te respondo una por una.',
  cuandoLeContestan: 'Te contesto en 48 horas hábiles, de lunes a viernes.',
  escribeEnComunidad: false,
  leeComunidad: true,
  tieneMentorias: false,
};

export const CON_ACOMPANAMIENTO: LaVia = {
  via: 'chat',
  nombre: 'Tu chat',
  queEs:
    'Escribes y te contestamos el mismo día. Para lo que se resuelve en dos '
    + 'líneas y no da para esperar a la mentoría.',
  cuandoLeContestan: 'De lunes a viernes, de 9 a 15. Respondemos el mismo día.',
  escribeEnComunidad: true,
  leeComunidad: true,
  tieneMentorias: true,
};

/** La vía que le toca. Derivada, nunca marcada a mano. */
export function viaDe(servicio: ServicioContratado | null | undefined): LaVia {
  // Sin marcar se trata como La Base, igual que el reparto de los 62 ítems:
  // darle de menos a quien pagó se arregla con un mensaje; darle de más hace
  // trabajar al equipo gratis y nadie se entera hasta que es tarde.
  return servicio === 'ascenso' || servicio === 'instalacion'
    ? CON_ACOMPANAMIENTO
    : LA_BASE;
}

export function tieneChat(servicio: ServicioContratado | null | undefined): boolean {
  return viaDe(servicio).via === 'chat';
}

/* ══════════════════ LA INVITACIÓN, EN VEZ DEL CANDADO ══════════════════ */

/**
 * Lo que ve el de La Base donde el otro tiene las mentorías.
 *
 * No es un candado con el nombre de lo que no tiene. Es lo que es: algo que
 * puede sumar, contado por lo que pasa adentro. Un candado abre la
 * conversación de «por qué no lo tengo»; esto abre la de «cuánto es».
 */
export interface Invitacion {
  titulo: string;
  queGana: string[];
  /** El paso concreto. Sin esto es un cartel. */
  comoSeSuma: string;
}

export const INVITACION_AL_ACOMPANAMIENTO: Invitacion = {
  titulo: 'Súmate al acompañamiento',
  queGana: [
    'Tres encuentros por semana conmigo: producto los martes, captación los miércoles, ventas los jueves.',
    'Chat con el equipo de lunes a viernes, con respuesta el mismo día.',
    'Los canales de la comunidad, donde preguntas y ves lo que están resolviendo los demás.',
  ],
  comoSeSuma: 'Mándame un reporte diciendo que quieres sumarte y te paso los detalles.',
};

/* ══════════════════ LOS CANALES QUE REEMPLAZAN A DISCORD ══════════════════ */

/**
 * Los cinco canales, con los nombres que ya tienen en Discord.
 *
 * Se conservan los nombres a propósito: los clientes que vienen de Discord ya
 * saben dónde preguntar cada cosa. Cambiarles el nombre al mudarlos es hacerles
 * aprender de nuevo algo que ya sabían.
 *
 * Y se mudan los cinco grupales. Lo que NO se muda es el canal privado de cada
 * cliente: eso es el chat de Soporte, que ya existe y ya es uno por cliente.
 */
export type IdCanal = 'producto' | 'marketing' | 'ventas' | 'compromisos' | 'victorias';

export interface Canal {
  id: IdCanal;
  nombre: string;
  /** Para qué es. Lo que decide si el mensaje va acá o en otro lado. */
  paraQue: string;
  /** El día que se trata en la mentoría, cuando lo tiene. */
  diaDeMentoria?: 'martes' | 'miércoles' | 'jueves';
  /** Si lo ve el de La Base (en lectura). */
  abiertoALaBase: boolean;
}

export const CANALES: Canal[] = [
  {
    id: 'producto', nombre: 'Producto',
    paraQue: 'Tu método, tu oferta, tu precio y tus cupos. Lo que vendes.',
    diaDeMentoria: 'martes', abiertoALaBase: false,
  },
  {
    id: 'marketing', nombre: 'Captación',
    paraQue: 'Tu perfil, tus anuncios, tu página y tu campaña. Cómo llegan a ti.',
    diaDeMentoria: 'miércoles', abiertoALaBase: false,
  },
  {
    id: 'ventas', nombre: 'Ventas',
    paraQue: 'Tus conversaciones y tus llamadas. Lo que pasa cuando ya te escribieron.',
    diaDeMentoria: 'jueves', abiertoALaBase: false,
  },
  {
    id: 'compromisos', nombre: 'Compromisos',
    paraQue: 'Lo que cada uno se compromete a tener listo esta semana, con fecha.',
    abiertoALaBase: false,
  },
  {
    id: 'victorias', nombre: 'Victorias',
    paraQue: 'Lo que fue funcionando. La primera venta, el primer agendado, el anuncio que arrancó.',
    // El único que ve el de La Base. Ver avanzar a otros que empezaron como él
    // es lo que hace que quiera sumarse — y es verdadero, no una vidriera
    // armada: son los mismos mensajes que ven los demás.
    abiertoALaBase: true,
  },
];

/** Los canales que le aparecen, según lo que contrató. */
export function canalesDe(servicio: ServicioContratado | null | undefined): Canal[] {
  return tieneChat(servicio) ? CANALES : CANALES.filter((c) => c.abiertoALaBase);
}

/** Si puede escribir en un canal, o solo leerlo. */
export function puedeEscribirEn(
  servicio: ServicioContratado | null | undefined,
  canal: IdCanal,
): boolean {
  if (tieneChat(servicio)) return true;
  // El de La Base lee Victorias y no escribe: si escribiera, habría que
  // moderarlo, y eso es trabajo del equipo que su plan no incluye.
  void canal;
  return false;
}

/* ══════════════════ A DÓNDE VA CADA PREGUNTA ══════════════════ */

/**
 * «Que ella los redirija a dónde corresponde.»
 *
 * Escrito una sola vez y en un solo lugar, para que la respuesta no dependa de
 * quién la contesta ni del día. Lo usan las dos puntas: el cliente lo ve antes
 * de escribir, y el equipo lo tiene a mano para responder en una línea.
 */
export interface Destino {
  /** Lo que el cliente trae. */
  loQueTrae: string;
  /** Dónde se resuelve. */
  donde: string;
  /** Quién. Vacío cuando lo resuelve la app sola. */
  quien?: string;
}

/**
 * Dónde se trata un canal, escrito con el dato de `CANALES`.
 *
 * Los tres primeros destinos repetían a mano el día y el nombre del canal, y
 * ya habían divergido: el canal se llama «Captación» desde su propia línea de
 * `CANALES`, y el destino de al lado decía «canal Marketing» —una palabra que
 * la casa no usa— a doce renglones de distancia. Derivado no puede volver a
 * pasar.
 */
export function elDiaYElTema(id: string): string {
  const c = CANALES.find((x) => x.id === id);
  if (!c) return id;
  const dia = c.diaDeMentoria
    ? c.diaDeMentoria.charAt(0).toUpperCase() + c.diaDeMentoria.slice(1)
    : '';
  return dia ? `${dia} · ${c.nombre}` : c.nombre;
}

/** «Martes producto · Miércoles captación · Jueves ventas», con el dato. */
export function losTresEncuentros(): string {
  return CANALES.filter((c) => c.diaDeMentoria)
    .map((c) => `${c.diaDeMentoria!.charAt(0).toUpperCase()}${c.diaDeMentoria!.slice(1)} ${c.nombre.toLowerCase()}`)
    .join(' · ');
}

export function enLaMentoria(id: IdCanal): string {
  const c = CANALES.find((x) => x.id === id);
  if (!c) return '';
  return c.diaDeMentoria
    ? `Mentoría del ${c.diaDeMentoria} · canal ${c.nombre}`
    : `Canal ${c.nombre}`;
}

export const A_DONDE_VA: Destino[] = [
  {
    loQueTrae: 'Mi método, mi oferta, mi precio, mis cupos',
    donde: enLaMentoria('producto'),
    quien: 'Javo',
  },
  {
    loQueTrae: 'Mi perfil, mi página, mis anuncios, mi campaña',
    donde: enLaMentoria('marketing'),
    quien: 'Javo',
  },
  {
    loQueTrae: 'Mis conversaciones, mis llamadas, cómo cierro',
    donde: enLaMentoria('ventas'),
    quien: 'Javo',
  },
  {
    loQueTrae: 'Cómo responder un mensaje concreto que me llegó',
    donde: 'Sofi, tu entrenadora de conversaciones',
  },
  {
    loQueTrae: 'Qué grabo esta semana, cómo armo un reel',
    donde: 'Mateo, tu entrenador de contenido',
  },
  {
    loQueTrae: 'Qué poner en cada campo de Meta, por qué la receta es así',
    donde: 'Montar en Meta, dentro de Campañas',
  },
  {
    loQueTrae: 'Cuándo apago un anuncio, cuándo escalo, qué hago con los números',
    donde: 'Activación: la puerta del día en que estás',
  },
  {
    loQueTrae: 'No encuentro algo en la app, algo no me funciona',
    // El destino se llamaba «Soporte». La pantalla pasó a llamarse
    // Acompañamiento cuando absorbió el chat, y un destino que nombra una
    // pantalla que ya no existe manda al cliente a buscar algo que no va a
    // encontrar en el menú.
    donde: 'Acompañamiento, tu chat con el equipo',
    quien: 'Lupe',
  },
  {
    loQueTrae: 'Cómo va mi proceso, qué me falta, qué sigue',
    donde: 'Tu tablero, y el repaso de la mentoría',
  },
];

/**
 * El destino de una pregunta, buscando por palabras.
 *
 * Es el atajo que le evita a Lupe escribir la misma redirección por décima vez.
 * Devuelve nulo cuando no está seguro, a propósito: adivinar mal y mandarlo al
 * lugar equivocado es peor que no sugerir nada.
 */
export function aDondeVa(pregunta: string): Destino | null {
  const t = pregunta.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const senales: Array<[RegExp, string]> = [
    [/precio|cobrar|cuanto cobro|oferta|cupo|metodo/, 'Mi método'],
    [/perfil|pagina|anuncio|campana|pauta|presupuesto|publicidad/, 'Mi perfil'],
    [/cerrar|llamada|objecion|no me contesta|precio en la llamada/, 'Mis conversaciones'],
    [/responder|dm|mensaje que me llego|me escribio/, 'Cómo responder'],
    [/reel|grabar|contenido|historia|story/, 'Qué grabo'],
    [/meta|administrador de anuncios|conjunto|pixel/, 'Qué poner en cada campo'],
    [/apagar|escalar|optimizar|cpm|cpl|costo por/, 'Cuándo apago'],
    [/no funciona|no encuentro|error|no carga|no me deja/, 'No encuentro algo'],
  ];
  for (const [re, prefijo] of senales) {
    if (re.test(t)) {
      const d = A_DONDE_VA.find((x) => x.loQueTrae.startsWith(prefijo));
      if (d) return d;
    }
  }
  return null;
}
