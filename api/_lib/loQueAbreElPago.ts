/**
 * LO QUE ABRE EL PAGO — una sola declaración para las dos puertas de cobro.
 *
 * ═══ QUÉ PASABA (18 de noviembre) ═══
 *
 * Había dos rutas por las que entra un cobro, y sólo una sabía qué hacer con
 * él:
 *
 *   /api/ghl-webhook   recibe `plan` y resuelve todo: el acceso, el escalón
 *                      de servicio, la fecha en que se encendió el tope, y la
 *                      regla de que un cobro nunca baja lo que alguien pagó.
 *   /api/alta-numero   recibe `{email, nombre}` y escribe `plan = 'ELNUMERO'`
 *                      y nada más.
 *
 * Y los tres flujos de GHL que cobran La Base ($1.000), La Mentoría ($3.000)
 * y La Instalación ($6.000) llaman a **`/api/alta-numero`**, no al webhook.
 * Medido el 18 de noviembre por la API de GHL: ninguno de los tres llama a
 * `/api/ghl-webhook`. O sea que **quien pagaba 1.000, 3.000 o 6.000 recibía
 * los cinco días de la entrada y una ventana de 21 días**, y el día 22 la app
 * se le apagaba. No le pasó a nadie todavía porque los cinco clientes de El
 * Ascenso se dieron de alta a mano.
 *
 * La respuesta no es que el alta copie la lógica del webhook: dos copias de
 * «qué abre cada oferta» se separan la primera vez que cambia un precio. Lo
 * que resuelve un cobro se declara **acá**, una vez, y las dos rutas lo leen.
 *
 * ═══ POR QUÉ VIVE EN `api/_lib/` Y NO EN `src/lib/` ═══
 *
 * Porque sus dos lectores son rutas, y ninguna pantalla lo alcanza. Escrito
 * primero en `src/lib/`, la lente del bloque 12 —«ningún módulo de src/ queda
 * sin que una pantalla lo pueda alcanzar»— se puso roja, y tenía razón: un
 * módulo que sólo el servidor usa, puesto entre los de la app, es un módulo
 * que nadie sabe si todavía se usa. `laVentanaDeAcceso` sí se queda en
 * `src/lib/` porque la lee también el botón del Admin, que es una pantalla.
 *
 * Lo que este módulo NO decide: crear el usuario, mandarle el mail, ni mirar
 * la clave del header. Eso es de cada ruta, porque es distinto en cada una.
 * Acá sólo está la pregunta «con este cobro y esta ficha, qué columnas se
 * escriben» — que es justo la que tenía dos respuestas.
 */
import { accesoHasta, type EscalonDeAcceso } from '../../src/lib/laVentanaDeAcceso.js';

/** Los planes de acceso: lo que gobierna qué pantallas ve. */
export const PLANES_VALIDOS = ['blanco', 'amarillo', 'verde', 'negro'] as const;
export type PlanComercial = (typeof PLANES_VALIDOS)[number];

/** Las ofertas que se venden hoy. */
export const TICKETS_VALIDOS = ['base', 'ascenso', 'instalacion'] as const;
export type Ticket = (typeof TICKETS_VALIDOS)[number];

/**
 * QUÉ ABRE CADA OFERTA, Y QUÉ LE DEBE EL EQUIPO.
 *
 * ═══ ESTO NO ES EL PUENTE PROHIBIDO ═══
 *
 * `cuadroTickets` quitó —y documentó— una tabla que **adivinaba** el servicio
 * contratado a partir del plan de acceso: `verde → $5.000`. Con eso, alguien
 * que había pagado $497 de acceso figuraba con la instalación completa
 * contratada, y el equipo que trabajara contra esa ficha instalaba gratis.
 *
 * Acá el sentido es el contrario y es el único lugar con autoridad para
 * decirlo: el cobro **sabe qué producto se pagó**, y de ese dato salen las
 * dos respuestas a la vez —qué pantallas ve y qué le debe el equipo— sin
 * deducir una de la otra. Si esto no lo escribiera el pago, lo tendría que
 * marcar una persona a mano en el Admin, y entonces la venta no es automática.
 *
 * El tope de acceso de cada oferta coincide con `topeDelEscalon`: La Base
 * llega al día 12, que es el pilar 2 ('amarillo'); El Ascenso y La Instalación
 * abren los 90 días ('negro') y se diferencian en quién monta, no en qué ve.
 */
export const LO_QUE_ABRE: Record<Ticket, PlanComercial> = {
  base: 'amarillo',
  ascenso: 'negro',
  instalacion: 'negro',
};

/**
 * UN COBRO NUNCA BAJA LO QUE ALGUIEN YA PAGÓ.
 *
 * ═══ QUÉ PASABA ═══
 *
 * `plan_comercial` y `acceso_hasta` se escribían sin mirar qué había. Gana el
 * último webhook, no el escalón más alto. Entonces un producto viejo de GHL
 * que manda `plan: "blanco"`, un workflow que se dispara doble sobre un order
 * bump, o un reenvío de un cobro de hace meses, dejaba al cliente de $3.000
 * con los cinco días abiertos **y un vencimiento a 21 días**. Pagó el Ascenso
 * y la app le cerró el Camino: el fallo más caro que puede tener un cobro,
 * porque no hay ningún error en ninguna pantalla — simplemente ahí se le
 * termina lo que compró.
 *
 * ═══ LA REGLA ═══
 *
 * Un cobro sólo puede querer decir «pagó esto». Nunca «pagó menos»: para eso
 * no hay cobro que lo justifique. Así que se escribe el acceso cuando es
 * igual o más alto que el que la ficha ya tiene, y se abstiene cuando sería
 * más bajo. Bajarle el acceso a alguien es del Admin, donde lo hace una
 * persona que sabe por qué.
 *
 * `completo` son los clientes de siempre y está arriba de todo: un cobro no
 * los degrada tampoco.
 */
export const ALTURA_DEL_ACCESO: Record<string, number> = {
  blanco: 1, amarillo: 2, verde: 3, negro: 4, completo: 4,
};

/** La misma regla para el escalón de servicio: el equipo no entrega de menos. */
export const ALTURA_DEL_SERVICIO: Record<string, number> = { base: 1, ascenso: 2, instalacion: 3 };

/** ¿Lo que se pagó está igual o más arriba que lo que la ficha ya dice? */
export function noEsUnaBaja(
  altura: Record<string, number>,
  pagado: string,
  enLaFicha?: string | null,
): boolean {
  return (altura[pagado] ?? 0) >= (altura[String(enLaFicha ?? '')] ?? 0);
}

/**
 * EL VOCABULARIO: se aceptan los dos, y se distinguen.
 *
 * Un cobro puede venir nombrado por la oferta (`base`, `ascenso`,
 * `instalacion`) o por el color del acceso (`blanco`…`negro`). Los colores
 * se siguen aceptando porque son los que gobiernan el acceso y hay productos
 * viejos en GHL que los mandan.
 *
 * La diferencia importa: un **ticket** autoriza a escribir también el escalón
 * de servicio, porque nombra el producto. Un **color** no, y adivinarlo es el
 * puente prohibido de arriba.
 *
 * Devuelve `null` cuando lo pedido no se vende: es un 400, no un cobro que
 * escribe cualquier cosa.
 */
export function loQueSePago(pedido: string): { plan: PlanComercial; ticket: Ticket | null } | null {
  const p = String(pedido ?? '').trim().toLowerCase();
  const ticket = (TICKETS_VALIDOS as readonly string[]).includes(p) ? (p as Ticket) : null;
  const plan = (ticket ? LO_QUE_ABRE[ticket] : p) as PlanComercial;
  if (!(PLANES_VALIDOS as readonly string[]).includes(plan)) return null;
  return { plan, ticket };
}

/** Las tres columnas que un cobro mira antes de escribir. */
export type FichaDelPago = {
  plan_comercial?: string | null;
  servicio_contratado?: string | null;
  servicio_marcado_el?: string | null;
};

/**
 * LAS COLUMNAS QUE ESTE COBRO ESCRIBE SOBRE ESTA FICHA.
 *
 * ═══ EL PAGO SELLA LA FECHA, NO SÓLO EL ESCALÓN ═══
 *
 * `servicio_contratado` es `not null default 'base'`, así que la columna sola
 * no distingue «pagó La Base» de «nadie lo marcó nunca». Por eso
 * `topeDelEscalon` pregunta por la FECHA —`estaMarcado`— y con la fecha vacía
 * apaga el tope entero: sin ella, el de La Base abría los noventa días, la
 * puerta de su primera etapa no aparecía nunca, y las entregas del equipo no
 * se disparaban para el que pagó La Instalación.
 *
 * La fecha se escribe una sola vez: es cuándo se encendió el tope para esta
 * ficha, y un cobro repetido no la mueve.
 *
 * ═══ Y SÓLO SI ESTE COBRO ES SU ESCALÓN ═══
 *
 * Sellar la fecha ENCIENDE el tope, así que sellarla de más quita días. El
 * caso: un cliente de siempre —'completo'— al que le entra un cobro de La
 * Base por un order bump o un workflow mal apuntado. Su acceso no se mueve
 * (la regla de arriba lo protege), pero si acá se le sellara el escalón
 * 'base' el Camino se le cortaría en el día 12: perdería los días 13 al 90
 * que ya tenía, y por una columna que nadie mira.
 *
 * De ahí la condición: el escalón se sella sólo cuando este cobro TAMBIÉN le
 * movió el acceso, o sea cuando de verdad es el escalón que compró. Un cobro
 * que no le abrió nada no puede cerrarle nada.
 */
export function cambiosDelPago(
  pagado: { plan: PlanComercial; ticket: Ticket | null },
  ficha?: FichaDelPago | null,
  ahora: Date = new Date(),
): Record<string, unknown> {
  const { plan, ticket } = pagado;
  const cambios: Record<string, unknown> = {};

  const leMueveElAcceso = noEsUnaBaja(ALTURA_DEL_ACCESO, plan, ficha?.plan_comercial);
  if (leMueveElAcceso) {
    cambios.plan_comercial = plan;
    cambios.acceso_hasta = accesoHasta(plan as EscalonDeAcceso, ahora);
  }

  const yaMarcado = Boolean(ficha?.servicio_marcado_el);
  const sube = !yaMarcado || noEsUnaBaja(ALTURA_DEL_SERVICIO, ticket ?? '', ficha?.servicio_contratado);
  if (ticket && leMueveElAcceso && sube) {
    cambios.servicio_contratado = ticket;
    if (!yaMarcado) cambios.servicio_marcado_el = ahora.toISOString();
  }

  return cambios;
}
