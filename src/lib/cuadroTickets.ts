import { SECTIONS, STEPS, type PreactivacionStep } from './preactivacionSteps';

/**
 * EL CUADRO DE VALIDACIÓN, PARA TODOS.
 *
 * Los 62 ítems ya existían, pero pensados para un solo caso: la instalación
 * acompañada, donde la agencia hace casi todo. Con cuatro tickets distintos
 * eso deja de servir — al de $1.000 le mostraría cuarenta y dos tareas que
 * nadie va a hacer por él, y al cliente viejo lo haría arrancar de cero
 * cuando ya tiene medio camino andado.
 *
 * Dos preguntas, entonces:
 *
 *   1. **Qué ítems le aplican a este ticket**, y quién los hace.
 *   2. **Con qué ya llega**, si viene de antes de la app.
 */

export type Ticket = 'mil' | 'dos_mil' | 'cinco_mil' | 'diez_mil';

export interface DefinicionTicket {
  id: Ticket;
  nombre: string;
  precio: number;
  /** Quién hace lo que en la instalación acompañada haría la agencia. */
  quienInstala: 'el cliente, con los tutoriales' | 'el cliente, con revisión' | 'la agencia';
  /** true = tiene sesiones con dirección. */
  conDireccion: boolean;
  /** La frase que ordena el trabajo con este cliente. */
  criterio: string;
}

export const TICKETS: Record<Ticket, DefinicionTicket> = {
  mil: {
    id: 'mil', nombre: 'La app sola', precio: 1000,
    quienInstala: 'el cliente, con los tutoriales',
    conDireccion: false,
    criterio: 'Todo lo técnico lo hace él con el paso a paso adentro de la app. Si algo necesita que una persona se lo explique, es una pantalla mal hecha.',
  },
  dos_mil: {
    id: 'dos_mil', nombre: 'La app con revisión', precio: 2000,
    quienInstala: 'el cliente, con revisión',
    conDireccion: false,
    criterio: 'Lo hace él, y el equipo revisa los cuatro puntos donde más se rompe: el píxel, el DM, el dominio y el cobro.',
  },
  cinco_mil: {
    id: 'cinco_mil', nombre: 'Instalación acompañada', precio: 5000,
    quienInstala: 'la agencia',
    conDireccion: false,
    criterio: 'Los 62 repartidos como siempre. El cliente pone su método y su voz; el resto lo instala la agencia.',
  },
  diez_mil: {
    id: 'diez_mil', nombre: 'Instalación con dirección', precio: 10000,
    quienInstala: 'la agencia',
    conDireccion: true,
    criterio: 'Lo mismo que el anterior, con prioridad en la cola y con las sesiones de dirección.',
  },
};

/**
 * Los ítems que el cliente puede hacer solo si tiene el paso a paso.
 *
 * No es una lista de "lo fácil": es lo que NO necesita acceso a cuentas
 * ajenas ni conocimiento que no se pueda escribir. Instalar un píxel se
 * explica; auditar la estructura de un portafolio de Meta, no.
 */
const HACE_SOLO_CON_TUTORIAL = new Set<string>([
  // Perfil: lo escribe y lo sube él, con la app dictándole qué poner.
  'perfil_foto', 'perfil_nombre', 'perfil_bio', 'perfil_destacadas',
  'perfil_fijado', 'perfil_carrusel',
  // Método: es SUYO. Nadie más puede definirlo.
  'metodo_nombre', 'metodo_construccion', 'metodo_herramientas',
  'metodo_hogar', 'metodo_entrega',
  // Meta: las cuentas propias las abre él; el portafolio no.
  'm_wa_cuenta', 'm_pago',
  // Guiones y piezas: los genera con el Constructor y el Creador.
  'g_vsl', 'g_preparacion', 'g_reels', 'g_anuncios', 'g_carrusel',
  'g_destacadas', 'g_historias', 'pitch', 'g_setting', 'g_llamada',
  'p_vsl', 'p_preparacion', 'p_reels', 'p_anuncios', 'p_carrusel',
  'p_destacadas', 'p_estaticos',
  // Anuncios y lanzamiento.
  'ads_chequeados', 'ads_links', 'ads_on', 'testeo',
  'historias_3', 'metricas',
  // Venta y cierre.
  'fathom', 'roleplay', 'llamada_1', 'pago_1', 'caso', 'testimonio',
]);

/**
 * Los que necesitan a alguien con acceso o con oficio, sí o sí.
 *
 * Estos NO se le muestran al cliente de $1.000 como suyos: o los resuelve un
 * tutorial más largo, o no aplican a su ticket. Mostrarle una tarea que no
 * puede hacer y que nadie va a hacer por él es la forma más rápida de que
 * abandone el cuadro entero.
 */
const NECESITA_INSTALADOR = new Set<string>([
  // Go High Level: es una cuenta de la agencia, no del cliente.
  'calendarios', 'formulario',
  // La estructura de Meta: portafolio, fan page y vinculaciones cruzadas.
  'm_portafolio', 'm_fanpage', 'm_ig', 'm_wa_meta', 'm_campanas', 'm_config',
  // La landing propia con dominio y píxel verificado.
  'landing_lista', 'dominio', 'pixel',
  // Las automatizaciones y el cobro, que tocan cuentas y claves.
  'palabras', 'automatizacion', 'wa_agente', 'pagos',
  // La reunión de chequeo previa a encender.
  'chequeo', 'reunion', 'guiones_ok',
]);

export interface ItemDelTicket extends PreactivacionStep {
  /** Quién lo hace, ya resuelto para ESTE ticket. */
  loHace: 'el cliente' | 'el equipo' | 'los dos';
  /** true = el cliente lo hace y hay un paso a paso para eso. */
  conTutorial: boolean;
  /** true = no aplica a este ticket y no se muestra. */
  noAplica: boolean;
}

/**
 * El cuadro de este cliente: qué le toca y a quién.
 *
 * El de $1.000 no ve los ítems de instalador: no es que se los escondamos,
 * es que **su producto no los incluye** — su landing va dentro de la app y su
 * campaña corre sin portafolio propio.
 */
export function cuadroDe(ticket: Ticket): ItemDelTicket[] {
  const def = TICKETS[ticket];
  const autoservicio = ticket === 'mil' || ticket === 'dos_mil';

  return STEPS.map((s) => {
    const necesitaInstalador = NECESITA_INSTALADOR.has(s.id);
    const puedeSolo = HACE_SOLO_CON_TUTORIAL.has(s.id);

    if (autoservicio && necesitaInstalador) {
      return { ...s, loHace: 'el equipo', conTutorial: false, noAplica: true };
    }

    let loHace: ItemDelTicket['loHace'];
    if (autoservicio) {
      // En autoservicio todo lo que queda lo hace él; el de $2.000 tiene
      // revisión en los cuatro puntos donde más se rompe.
      // Los cuatro puntos donde más se rompe una instalación hecha solo:
      // la palabra, el cobro, el píxel y el WhatsApp vinculado.
      loHace = ticket === 'dos_mil'
        && ['m_wa_cuenta', 'm_pago', 'metricas', 'ads_on'].includes(s.id)
        ? 'los dos' : 'el cliente';
    } else {
      loHace = s.quien === 'cliente' ? 'el cliente'
        : s.quien === 'agencia' ? 'el equipo' : 'los dos';
    }

    return {
      ...s,
      loHace,
      conTutorial: autoservicio && puedeSolo,
      noAplica: false,
      ...(def.conDireccion ? {} : {}),
    };
  });
}

export interface ResumenCuadro {
  total: number;
  delCliente: number;
  delEquipo: number;
  compartidos: number;
  noAplican: number;
  /** La frase que ordena el trabajo con este cliente. */
  criterio: string;
}

export function resumirCuadro(ticket: Ticket): ResumenCuadro {
  const items = cuadroDe(ticket);
  const aplican = items.filter((i) => !i.noAplica);
  return {
    total: aplican.length,
    delCliente: aplican.filter((i) => i.loHace === 'el cliente').length,
    delEquipo: aplican.filter((i) => i.loHace === 'el equipo').length,
    compartidos: aplican.filter((i) => i.loHace === 'los dos').length,
    noAplican: items.length - aplican.length,
    criterio: TICKETS[ticket].criterio,
  };
}

// ── Los clientes de antes de la app ────────────────────────────────────────

export interface LoQueYaTiene {
  /** Los ids de los ítems que este cliente ya tiene resueltos. */
  hechos: string[];
  /** Qué bloques marcar enteros, para no tildar de a uno. */
  bloquesCompletos: string[];
}

/**
 * Lo que un cliente viejo ya trae, por bloque.
 *
 * Existe porque **el que viene de antes de la app no arranca de cero: arranca
 * de donde está.** Hacerlo tildar sesenta y dos casillas de las cuales cuarenta
 * ya estaban hechas es la forma más rápida de que no use el cuadro nunca.
 *
 * Se marcan BLOQUES enteros, no ítems sueltos: quien carga a un cliente viejo
 * sabe «ya tiene perfil y método», no se acuerda de los seis ítems del perfil.
 */
export function marcarBloques(bloques: string[]): LoQueYaTiene {
  const ids = new Set(bloques);
  const hechos = SECTIONS
    .filter((s) => ids.has(s.id))
    .flatMap((s) => s.items.map((i) => i.id));
  return { hechos, bloquesCompletos: bloques };
}

/** Los bloques disponibles, para elegir al cargar un cliente viejo. */
export function bloquesDisponibles(): Array<{ id: string; titulo: string; cuantos: number }> {
  return SECTIONS.map((s) => ({
    id: s.id,
    titulo: s.title.replace(/^\d+\s*[·.-]?\s*/, ''),
    cuantos: s.items.length,
  }));
}

/** Cuánto le falta de verdad, contando solo lo que le aplica. */
export function avanceDe(
  ticket: Ticket,
  hechos: Set<string>,
): { hechos: number; total: number; pct: number } {
  const aplican = cuadroDe(ticket).filter((i) => !i.noAplica);
  const listos = aplican.filter((i) => hechos.has(i.id)).length;
  return {
    hechos: listos,
    total: aplican.length,
    pct: aplican.length > 0 ? Math.round((listos / aplican.length) * 100) : 0,
  };
}


// ── El puente entre los dos vocabularios ───────────────────────────────────

/**
 * De qué plan a qué ticket.
 *
 * ═══ POR QUÉ HACÍA FALTA ═══
 *
 * La app tenía DOS vocabularios que no se hablaban: `planes.ts` gobierna el
 * acceso con colores (blanco, amarillo, verde, negro) y este archivo decide
 * qué instala cada uno con montos (mil, dos_mil, cinco_mil, diez_mil).
 *
 * **Nada traducía entre los dos.** Y la consecuencia era que este cuadro —que
 * está construido y probado— no se podía usar: la app no sabía que un cliente
 * «verde» es uno de $5.000. Por eso también quedó sin montar en ninguna
 * pantalla, y por eso el de $5.000 no recibía nada distinto dentro de la app.
 *
 * El puente vive acá y no en planes.ts a propósito: **planes.ts gobierna el
 * acceso y no tiene por qué saber de tickets.** Acá sí, porque el ticket es
 * el concepto de este archivo.
 */
export const TICKET_DE_PLAN: Record<string, Ticket> = {
  blanco: 'mil',
  amarillo: 'dos_mil',
  verde: 'cinco_mil',
  negro: 'diez_mil',
  // «completo» es el acceso total que se le da al equipo y a las pruebas:
  // se trata como el más alto para que nada quede oculto por accidente.
  completo: 'diez_mil',
};

/**
 * El ticket de un cliente, a partir de su plan.
 *
 * Si el plan no se reconoce cae en el MÁS BAJO, no en el más alto: mostrarle
 * de menos a alguien que pagó se arregla con un mensaje; mostrarle de más a
 * quien no pagó le enseña que no hacía falta pagar.
 */
export function ticketDe(plan: string | null | undefined): Ticket {
  return TICKET_DE_PLAN[plan ?? ''] ?? 'mil';
}
