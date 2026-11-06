/**
 * LA PUERTA DEL DÍA — qué pantalla abre cada jornada.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * La app tenía trece puertas en el menú y tres lugares distintos que
 * contestaban «qué hago hoy». Cinco de esas pantallas —Mi Número, el Diario,
 * Campañas, el Creador y Mi Clínica— no se usan «cualquier día»: se usan EL
 * día. Mi Número el día que sella su precio; Campañas el día que enciende; el
 * Creador el día que escribe. El resto del tiempo son trece nombres que hay
 * que leer para encontrar uno.
 *
 * Así que salen de la grilla y entran acá: cada jornada declara qué pantalla
 * abre, y el botón aparece adentro de esa jornada.
 *
 * ═══ EL PELIGRO QUE ESTO EVITA ═══
 *
 * En julio, al mover la casa del plan de entrada, Mi Número quedó
 * INALCANZABLE: la calculadora del precio —el entregable central de ese
 * plan— no estaba en el menú y ningún botón la apuntaba. Se cazó con una
 * lente, no mirando el código.
 *
 * Por eso esto es un MAPA y no un botón suelto en cada pantalla: así hay un
 * solo lugar donde mirar, y `prueba-ninguna-pantalla-huerfana.ts` puede
 * recorrerlo y gritar si alguna pantalla del router se queda sin ninguna
 * puerta.
 *
 * ═══ POR QUÉ POR DÍA Y NO POR CÓDIGO ═══
 *
 * Los códigos de jornada se reordenan —`P1.5` pasó de ser el día 6 a ser el
 * día 5— y el día no. Además el cliente piensa en días: «el día que puse mi
 * precio». `codigoDelDia` y `diaDelCodigo` ya traducen entre los dos.
 */

export interface PuertaDelDia {
  /** El id de pantalla que abre, el mismo que entiende `setCurrentPage`. */
  destino: string;
  /** Lo que dice el botón. En voz del cliente, no de la app. */
  label: string;
  /** Una línea de por qué se abre hoy. */
  bajada: string;
}

/**
 * Qué abre cada día. Un día puede no abrir nada: la mayoría no abre nada.
 *
 * Reglas para agregar:
 *
 * · Solo si ESE día la pantalla se usa de verdad. Una puerta que se abre «por
 *   las dudas» devuelve la app al catálogo del que salió.
 * · El label dice lo que el cliente va a hacer, no el nombre de la pantalla:
 *   «Calcular mi precio» antes que «Abrir Mi Número».
 * · Una pantalla puede estar en varios días. Lo que no puede es estar en
 *   ninguno: ahí se vuelve inalcanzable.
 */
export const PUERTAS_POR_DIA: Record<number, PuertaDelDia> = {
  /* Día 5 · «Tu precio nuevo y lo que sueltas» — el día que la pantalla existe para servir. */
  5: {
    destino: 'numero',
    label: 'Sacar mi precio por hora',
    bajada: 'Carga tus tres números y sale tu hora real. De ahí sale el precio que sellas hoy.',
  },
  /* Día 11 · «Tus guiones». */
  11: {
    destino: 'creador',
    label: 'Escribir mis guiones',
    bajada: 'Sale con tu ADN adentro: tu promesa, tu método y a quién le hablas.',
  },
  /* Día 30 · «Tus tres anuncios, listos para salir». */
  30: {
    destino: 'campanas',
    label: 'Escribir mis tres anuncios',
    bajada: 'Las tres fórmulas, con tus palabras y tu oferta ya cargadas.',
  },
  /* Día 31 · «Encender tus dos campañas». */
  31: {
    destino: 'campanas',
    label: 'Montar mis campañas',
    bajada: 'El paso a paso del montaje, con tus anuncios de ayer listos para subir.',
  },
  /* Día 38 · «Tu app, con tu marca». */
  38: {
    destino: 'miclinica',
    label: 'Abrir Mi Clínica',
    bajada: 'Donde vas a operar: tus consultantes, sus protocolos y tus cobros.',
  },
  /* Día 40 · «Invitar al primero y tocar algo tú». */
  40: {
    destino: 'miclinica',
    label: 'Invitar a mi primer consultante',
    bajada: 'Se carga desde Mi Clínica y le llega su acceso.',
  },
  /* Día 54 · «Tu segundo creativo». */
  54: {
    destino: 'creador',
    label: 'Escribir mi segundo creativo',
    bajada: 'Con lo que ya aprendiste de los números del primero.',
  },
  /* Día 74 · «Tu hora real, otra vez» — la misma cuenta del día 5, con lo de hoy. */
  74: {
    destino: 'numero',
    label: 'Volver a sacar mi hora real',
    bajada: 'Los mismos tres números, once semanas después. La diferencia es lo que construiste.',
  },
  /* Día 85 · «Tu ecosistema circular». */
  85: {
    destino: 'creador',
    label: 'Armar mi plan de contenido',
    bajada: 'Lo que vas a publicar cada semana para que la rueda siga girando sola.',
  },
};

/** La puerta de un día, si ese día abre alguna. */
export function puertaDelDia(dia: number | null | undefined): PuertaDelDia | null {
  if (typeof dia !== 'number') return null;
  return PUERTAS_POR_DIA[dia] ?? null;
}

/**
 * Las pantallas que salieron del menú y viven adentro de su día.
 *
 * El Diario está acá aunque no tenga fila en el mapa: su puerta es el cierre
 * de CADA jornada, no un día en particular, y vive en la pantalla de Hoy. Lo
 * declaramos igual para que la lente sepa que está contemplado y no lo cante
 * como huérfano.
 */
export const ABSORBIDAS = ['numero', 'diario', 'campanas', 'creador', 'miclinica'] as const;

/** Las pantallas que alguna jornada abre. */
export function pantallasConPuerta(): Set<string> {
  return new Set(Object.values(PUERTAS_POR_DIA).map((p) => p.destino));
}
