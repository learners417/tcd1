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

/**
 * LOS TRES ESCALONES DE SERVICIO.
 *
 * ═══ POR QUÉ CAMBIARON ═══
 *
 * Hasta hoy acá vivían cuatro montos ($1.000 / $2.000 / $5.000 / $10.000) que
 * venían de la escalera de julio y **ya no correspondían a nada que se venda**.
 * Peor: un puente automático traducía el plan de acceso a uno de esos montos
 * (`verde → $5.000`, `negro → $10.000`), así que alguien que había pagado $497
 * de acceso a la app aparecía en su ficha como si tuviera contratada la
 * instalación completa. Quien trabajara contra ese cuadro instalaba gratis.
 *
 * Estos tres son los que se venden, y se marcan A MANO en la ficha de cada
 * cliente. No se derivan del plan de acceso: son dos cosas distintas —una
 * gobierna qué pantallas ve, la otra qué le debe el equipo.
 */
export type Ticket = 'base' | 'ascenso' | 'instalacion';

export interface DefinicionTicket {
  id: Ticket;
  nombre: string;
  precio: number;
  /** Quién hace el trabajo técnico. */
  quienInstala: 'el cliente, con los tutoriales' | 'el cliente, con acompañamiento' | 'el equipo';
  /** Qué incluye, dicho como se le dijo al cliente. */
  incluye: string;
  /** La frase que ordena el trabajo con este cliente. */
  criterio: string;
}

export const TICKETS: Record<Ticket, DefinicionTicket> = {
  base: {
    id: 'base', nombre: 'La Base', precio: 1000,
    quienInstala: 'el cliente, con los tutoriales',
    incluye: 'Los cuatro manuales, su plan de 90 días escrito, tres sesiones uno a uno (una por mes) y la app.',
    criterio: 'Todo lo técnico lo hace él con el paso a paso adentro de la app. Si algo necesita que una persona se lo explique, es una pantalla mal hecha.',
  },
  ascenso: {
    id: 'ascenso', nombre: 'El Ascenso', precio: 3000,
    quienInstala: 'el cliente, con acompañamiento',
    // «Los cinco sistemas» sin decir quién los monta es donde choca con la
    // promesa de la landing: en este escalón los monta ÉL, acompañado. Si eso
    // no se dice acá, el cliente llega esperando que se lo entreguen hecho.
    incluye: 'Los 90 días completos: monta sus cinco sistemas acompañado, con la sesión uno a uno de arranque, las mentorías grupales tres veces por semana, la app y la garantía.',
    criterio: 'Lo construyen juntos: él ejecuta y aprende, el equipo lo acompaña en vivo. Si el equipo termina haciéndolo por él, dejó de ser una mentoría.',
  },
  instalacion: {
    id: 'instalacion', nombre: 'La Instalación', precio: 5000,
    quienInstala: 'el equipo',
    incluye: 'El equipo monta todo —landing, app, automatizaciones, campañas—, una sesión uno a uno, y la app.',
    criterio: 'El cliente pone su método y su voz, y aprueba. El resto lo monta el equipo.',
  },
};

/**
 * La Cima no es un escalón: se suma a cualquiera de los tres.
 *
 * Son los cinco días en Bariloche. No cambia el reparto de los 62 ítems —
 * cambia dónde se instalan— así que vive como un sí o no aparte, no como un
 * cuarto ticket.
 */
export const CIMA = { nombre: 'La Cima', precio: 5000, dias: 5 } as const;

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
  return STEPS.map((s) => {
    const necesitaInstalador = NECESITA_INSTALADOR.has(s.id);
    const puedeSolo = HACE_SOLO_CON_TUTORIAL.has(s.id);

    // La Base es autoservicio: lo que necesita una cuenta de la agencia o
    // oficio que no se puede escribir, su producto no lo incluye.
    if (ticket === 'base') {
      if (necesitaInstalador) {
        return { ...s, loHace: 'el equipo', conTutorial: false, noAplica: true };
      }
      return { ...s, loHace: 'el cliente', conTutorial: puedeSolo, noAplica: false };
    }

    // El Ascenso es mentoría: le aplican los 62, y lo que requiere manos del
    // equipo se hace JUNTOS en la grupal, que es lo que se vendió. Marcarlo
    // como «el equipo» convertiría la mentoría en una instalación.
    if (ticket === 'ascenso') {
      return {
        ...s,
        loHace: necesitaInstalador ? 'los dos'
          : s.quien === 'agencia' ? 'los dos'
          : s.quien === 'cliente' ? 'el cliente' : 'los dos',
        conTutorial: puedeSolo,
        noAplica: false,
      };
    }

    // La Instalación: el reparto de siempre, el que trae cada ítem escrito.
    return {
      ...s,
      loHace: s.quien === 'cliente' ? 'el cliente'
        : s.quien === 'agencia' ? 'el equipo' : 'los dos',
      conTutorial: false,
      noAplica: false,
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


// ── El servicio contratado, que NO se deriva del plan ──────────────────────

/**
 * El escalón de servicio de un cliente.
 *
 * ═══ POR QUÉ NO HAY PUENTE ═══
 *
 * Acá vivía una tabla que traducía el plan de acceso a un escalón de servicio:
 * `verde → $5.000`, `negro → $10.000`. Parecía resolver un problema real —la
 * app tenía dos vocabularios que no se hablaban— pero pegaba dos escaleras
 * distintas como si fueran una. **Resultado: un cliente de $497 figuraba con
 * $5.000 de instalación contratada.** El equipo que trabaje contra ese cuadro
 * instala gratis.
 *
 * Son dos preguntas independientes y así quedan:
 *
 *   · `plan_comercial` → qué pantallas ve. La decide el checkout.
 *   · `servicio_contratado` → qué le debe el equipo. **La marca una persona.**
 *
 * Sin marcar cae en `base`, el más bajo. Mostrarle de menos a alguien que pagó
 * se arregla con un mensaje; mostrarle de más hace trabajar al equipo de
 * regalo, y nadie se entera hasta que es tarde.
 */
export function servicioDe(servicio: string | null | undefined): Ticket {
  return servicio === 'ascenso' || servicio === 'instalacion' ? servicio : 'base';
}
