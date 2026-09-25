/**
 * QUIÉN VE QUÉ.
 *
 * ═══ LA DECISIÓN DE FONDO ═══
 *
 * El permiso NO va sobre la pantalla: va sobre **el tipo de dato**.
 *
 * Si se esconden tabs, alcanza con que alguien agregue un número a una
 * pantalla compartida para que se filtre, y nadie se entera hasta que ya
 * pasó. Si el permiso está sobre el DATO, ese número no se dibuja aunque
 * esté en una pantalla que todos ven.
 *
 * Cada pantalla pregunta «¿puedo mostrar esto?» antes de dibujar. La lente
 * 6.38 de auditoria.py verifica que ningún componente que toque una
 * categoría reservada se dibuje sin preguntar.
 *
 * ═══ EL CRITERIO ═══
 *
 * La pregunta no es «¿es información sensible?» sino **«¿la necesita para
 * hacer su trabajo?»**. Esconder algo que alguien necesita lo obliga a
 * preguntar, y esa pregunta es el cuello de botella que la app existe para
 * sacar. Mostrar algo que no necesita es un riesgo sin contrapartida.
 */

export type Rol = 'direccion' | 'acompanamiento' | 'desarrollo' | 'produccion';

/**
 * Las categorías de dato. Cada una es una decisión, no una etiqueta.
 */
export type Categoria =
  /** Lo que TCD factura y cobra. El margen. La salud del negocio. */
  | 'dinero_tcd'
  /** Las ventas propias de Javo y su pauta. */
  | 'motor_propio'
  /** Cuánto cuesta la IA. Es costo operativo, no ingreso. */
  | 'costo_ia'
  /** La carga y el cumplimiento de OTRAS personas del equipo. */
  | 'rendimiento_equipo'
  /** Todas las cuentas, no solo las asignadas. */
  | 'todos_los_clientes'
  /** Cuánto paga cada cliente y por qué ticket entró. */
  | 'ticket_del_cliente'
  /** Los números de campaña y la cadena de valor de un cliente. */
  | 'numeros_del_cliente'
  /** Las conversaciones con clientes. */
  | 'conversaciones'
  /** El criterio del negocio: decisiones vigentes y trabas. */
  | 'decisiones';

export interface DefinicionRol {
  id: Rol;
  nombre: string;
  /** Para qué existe, en una línea. */
  proposito: string;
  /** Qué categorías puede ver. */
  ve: Categoria[];
  /** Por qué NO ve el resto. Se escribe para que nadie lo afloje sin pensar. */
  porQueNoVe: Partial<Record<Categoria, string>>;
  /** Horas semanales que puede sostener. */
  techoHoras: number;
  /** El único número que dice si hace bien su trabajo. */
  indicador: string;
  /** Qué momento abre primero. */
  entraPor: 'hoy' | 'semana' | 'clientes';
}

const NADIE = 'No lo necesita para su trabajo, y mostrarlo es un riesgo sin contrapartida.';

export const ROLES: Record<Rol, DefinicionRol> = {

  direccion: {
    id: 'direccion',
    nombre: 'Dirección',
    proposito: 'Poner el criterio y atender los tickets altos.',
    ve: [
      'dinero_tcd', 'motor_propio', 'costo_ia', 'rendimiento_equipo',
      'todos_los_clientes', 'ticket_del_cliente', 'numeros_del_cliente',
      'conversaciones', 'decisiones',
    ],
    porQueNoVe: {},
    techoHoras: 6,
    indicador: 'Cuántas decisiones nuevas hicieron falta esta semana. Menos es mejor: significa que el criterio ya está escrito.',
    entraPor: 'semana',
  },

  acompanamiento: {
    id: 'acompanamiento',
    nombre: 'Soporte de clientes',
    proposito: 'Que ninguna cuenta se quede frenada sin que alguien lo note.',
    ve: [
      // Necesita TODO lo del cliente para poder atenderlo sin preguntar.
      'todos_los_clientes', 'numeros_del_cliente', 'conversaciones', 'decisiones',
      // Y el ticket, porque decide quién recibe persona y quién aviso automático.
      'ticket_del_cliente',
    ],
    porQueNoVe: {
      dinero_tcd: 'Lo que factura TCD no cambia ninguna decisión suya. Su trabajo se mide por cuentas destrabadas, no por facturación.',
      motor_propio: 'Las ventas de Javo son de Javo.',
      costo_ia: 'No decide sobre el gasto de la app: eso es de desarrollo.',
      rendimiento_equipo: 'Ve SU carga, no la de los demás. Comparar personas entre sí no destraba ninguna cuenta y sí genera ruido.',
    },
    techoHoras: 12,
    indicador: 'El porcentaje de cuentas en rojo. Si sube del 10% al 30%, no hace falta más gente: hace falta arreglar lo que las pone en rojo.',
    entraPor: 'hoy',
  },

  desarrollo: {
    id: 'desarrollo',
    nombre: 'Desarrollo',
    proposito: 'Que la app haga cada vez más de lo que hoy hace una persona.',
    ve: [
      // El costo de la IA SÍ, porque optimizarlo es literalmente su trabajo.
      'costo_ia',
      // Los clientes y sus números, para saber dónde se traba el sistema.
      'todos_los_clientes', 'numeros_del_cliente', 'decisiones',
    ],
    porQueNoVe: {
      dinero_tcd: 'Optimiza el costo de la app, no el ingreso del negocio. Son dos cosas distintas.',
      motor_propio: 'Las ventas de Javo son de Javo.',
      rendimiento_equipo: 'Ve SU carga, no la de los demás.',
      conversaciones: 'No atiende clientes. Cada vez que lo hace, deja de construir lo que evitaría atenderlos.',
      ticket_del_cliente: 'Lo que paga cada uno no cambia qué hay que arreglar en la app.',
    },
    techoHoras: 30,
    indicador: 'Los minutos de humano por cliente. Tienen que bajar mes a mes con la misma cantidad de clientes.',
    entraPor: 'hoy',
  },

  produccion: {
    id: 'produccion',
    nombre: 'Producción',
    proposito: 'Editar, escribir y diseñar el material de los clientes asignados.',
    ve: [
      // Y nada más. Ni siquiera todos los clientes: solo los suyos.
      'decisiones',
    ],
    porQueNoVe: {
      dinero_tcd: NADIE,
      motor_propio: NADIE,
      costo_ia: NADIE,
      rendimiento_equipo: NADIE,
      todos_los_clientes: 'Ve solo los clientes que le asignaron. Los demás no le aportan y son información de otros.',
      ticket_del_cliente: 'Lo que paga un cliente no cambia cómo se edita su video.',
      numeros_del_cliente: 'Su trabajo es el material, no el rendimiento. Los números pueden condicionar mal una pieza.',
      conversaciones: NADIE,
    },
    techoHoras: 30,
    indicador: 'Piezas entregadas a tiempo y con la marca correcta.',
    entraPor: 'clientes',
  },
};

/** Los nombres viejos de la base se traducen. */
export function rolDe(legado: string | null | undefined): Rol {
  switch (legado) {
    case 'owner': return 'direccion';
    case 'desarrollo': case 'dev': return 'desarrollo';
    case 'produccion': case 'editor': return 'produccion';
    // manager y staff eran el mismo permiso con dos nombres.
    // Sin rol conocido se asume el MÁS ACOTADO que igual pueda trabajar.
    default: return 'acompanamiento';
  }
}

/**
 * LA FUNCIÓN QUE DECIDE TODO.
 *
 * Toda pantalla que muestre algo de una categoría reservada pregunta acá
 * antes de dibujar. Si devuelve false, ese pedazo no existe — no se dibuja
 * en gris ni con un candado: **no se dibuja.** Un candado le dice a alguien
 * que hay algo que no puede ver, y eso es información que tampoco necesita.
 */
export function puedeVer(rol: Rol, que: Categoria): boolean {
  return ROLES[rol].ve.includes(que);
}

/** Por qué no lo ve. Solo para el CEO, cuando revisa los permisos. */
export function porQueNoVe(rol: Rol, que: Categoria): string | null {
  return ROLES[rol].porQueNoVe[que] ?? null;
}

// ── Los cuatro momentos ────────────────────────────────────────────────────

export type Momento = 'hoy' | 'semana' | 'clientes' | 'negocio';

export interface DefinicionMomento {
  id: Momento;
  nombre: string;
  /** Cuándo se abre. Es lo que ordena todo el modo Admin. */
  cuando: string;
  /** Qué categorías necesita para tener sentido. Si el rol no ve NINGUNA
   *  de las obligatorias, el momento entero no se le muestra. */
  requiere: Categoria[];
}

export const MOMENTOS: DefinicionMomento[] = [
  { id: 'hoy', nombre: 'Hoy', cuando: 'Todos los días, al empezar y al cerrar.',
    requiere: [] },
  { id: 'semana', nombre: 'La Semana', cuando: 'Una vez por semana, mismo día y hora.',
    requiere: ['decisiones'] },
  { id: 'clientes', nombre: 'Clientes', cuando: 'Cuando entras a un cliente.',
    requiere: [] },
  // EL NEGOCIO es de Javo y de nadie más. El costo de la IA NO entra acá
  // aunque sea plata: es la herramienta de trabajo diaria de desarrollo, y
  // vive en su Hoy. Si estuviera acá, para que Marcos lo viera tendría que
  // entrar a la pantalla donde están las ventas del dueño — y ese es
  // exactamente el error que no se puede cometer.
  { id: 'negocio', nombre: 'El Negocio', cuando: 'Cuando quieres saber cómo va todo.',
    requiere: ['dinero_tcd', 'motor_propio', 'rendimiento_equipo'] },
];

/** Los momentos que este rol puede abrir, en su orden. */
export function momentosDe(rol: Rol): DefinicionMomento[] {
  const propios = MOMENTOS.filter(
    (m) => m.requiere.length === 0 || m.requiere.some((c) => puedeVer(rol, c)));
  // El que abre primero va primero.
  const entra = ROLES[rol].entraPor;
  return [...propios].sort((a, b) =>
    (a.id === entra ? -1 : 0) - (b.id === entra ? -1 : 0));
}

/** Con qué momento arranca este rol al entrar. */
export function momentoInicial(rol: Rol): Momento {
  const posibles = momentosDe(rol);
  return posibles[0]?.id ?? 'hoy';
}
