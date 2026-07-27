/**
 * LOS ROLES — no las personas.
 *
 * Hoy existen tres nombres (`owner`, `manager`, `staff`) usados quince veces
 * en todo el código, y casi siempre para lo mismo: **esconder una tab**. Eso
 * es un permiso, no un rol.
 *
 * Un rol de verdad contesta tres preguntas que hoy nadie contesta:
 *
 *   1. **Qué me toca a mí hoy**, de todo lo que hay para hacer.
 *   2. **Qué NO me toca**, para no pisarme con otro.
 *   3. **Cuánto puedo sostener** antes de que se me caiga.
 *
 * La tercera es la que decide si el negocio escala: doce horas semanales de
 * soporte para veinte clientes es la cuenta que sostiene el modelo. Si se
 * pasa, el aviso NO es «trabaja más» — es que subió el porcentaje de cuentas
 * en rojo y hay que arreglar lo que las rompe.
 */

export type Rol = 'direccion' | 'acompanamiento' | 'desarrollo';

/** Los nombres viejos siguen en la base; se traducen a rol. */
export type RolLegado = 'owner' | 'manager' | 'staff';

export interface DefinicionRol {
  id: Rol;
  nombre: string;
  /** Una línea: para qué existe este rol. */
  proposito: string;
  /** Qué le toca. Las tabs que ve primero. */
  leToca: string[];
  /** Qué NO le toca, y por qué. Sin esto, dos personas hacen lo mismo. */
  noLeToca: Array<{ que: string; porque: string }>;
  /** Horas semanales que puede sostener antes de que se le caiga. */
  techoHoras: number;
  /** El único número que dice si está haciendo bien su trabajo. */
  indicador: string;
}

export const ROLES: Record<Rol, DefinicionRol> = {
  direccion: {
    id: 'direccion',
    nombre: 'Dirección',
    proposito: 'Poner el criterio y atender los tickets altos. Nada más.',
    leToca: ['sala', 'plata', 'motor', 'sesiones'],
    noLeToca: [
      { que: 'La cola del día',
        porque: 'Si entra por ahí, el rol de acompañamiento deja de ser necesario y todo vuelve a pasar por una sola persona.' },
      { que: 'Los errores de la app',
        porque: 'Son de desarrollo. Reportarlos sí; arreglarlos no.' },
    ],
    techoHoras: 6,
    indicador: 'Cuántas decisiones nuevas hicieron falta esta semana. Menos es mejor: significa que el criterio ya está escrito.',
  },

  acompanamiento: {
    id: 'acompanamiento',
    nombre: 'Acompañamiento',
    proposito: 'Que ninguna cuenta se quede frenada sin que alguien lo note.',
    leToca: ['hoy', 'supervision', 'sesiones', 'clientes', 'tareas', 'mensajes'],
    noLeToca: [
      { que: 'Decidir criterio nuevo',
        porque: 'Si algo no está en la cola, escala. Inventar criterio en el momento es como se rompe la coherencia entre clientes.' },
      { que: 'Diagnosticar',
        porque: 'La app ya escribió qué hacer y el mensaje que va. El trabajo es ejecutarlo, no volver a pensarlo.' },
      { que: 'Tocar la app',
        porque: 'Reportar el error sí. Arreglarlo es de desarrollo.' },
    ],
    techoHoras: 12,
    indicador: 'El porcentaje de cuentas en rojo. Si sube del 10% al 30%, no hace falta más gente: hace falta arreglar lo que las pone en rojo.',
  },

  desarrollo: {
    id: 'desarrollo',
    nombre: 'Desarrollo',
    proposito: 'Que la app haga cada vez más de lo que hoy hace una persona.',
    leToca: ['motor', 'tareas', 'supervision'],
    noLeToca: [
      { que: 'Atender clientes',
        porque: 'Cada vez que lo hace, deja de construir lo que evitaría atenderlos. Es la forma más silenciosa de que el equipo deje de escalar.' },
      { que: 'La cola del día',
        porque: 'Los errores que la cola reporta sí; las cuentas frenadas no.' },
    ],
    techoHoras: 30,
    indicador: 'Los minutos de humano por cliente. Tienen que bajar mes a mes con la misma cantidad de clientes — es lo único que distingue una app que reemplaza trabajo de una que solo suma pantallas.',
  },
};

/**
 * Traduce el rol viejo al nuevo.
 *
 * `owner` es dirección. `manager` y `staff` eran el mismo permiso con dos
 * nombres: los dos pasan a acompañamiento, que es lo que de hecho hacían.
 * Desarrollo se asigna a mano — nadie lo tenía antes porque el rol no existía.
 */
export function rolDe(legado: string | null | undefined): Rol {
  switch (legado) {
    case 'owner': return 'direccion';
    case 'desarrollo': return 'desarrollo';
    default: return 'acompanamiento';
  }
}

/** Las tabs que este rol ve primero, en orden. */
export function tabsDe(rol: Rol): string[] {
  return ROLES[rol].leToca;
}

/** ¿Este rol puede entrar acá? Dirección entra a todo. */
export function puedeVer(rol: Rol, tab: string): boolean {
  if (rol === 'direccion') return true;
  return ROLES[rol].leToca.includes(tab);
}

// ── La carga ───────────────────────────────────────────────────────────────

export interface Carga {
  rol: Rol;
  /** Horas estimadas de esta semana. */
  horas: number;
  techo: number;
  /** Cuánto del techo lleva usado, de 0 a 1 (o más). */
  ocupacion: number;
  /** La frase que se muestra. */
  lectura: string;
  /** true = se pasó del techo. */
  pasado: boolean;
}

/**
 * Minutos que cuesta atender cada cosa. Salen de la cuenta que sostiene el
 * modelo: veinte clientes en doce horas semanales.
 */
export const MINUTOS = {
  /** Una cuenta en la cola que necesita persona. */
  excepcion: 20,
  /** Una sesión de acompañamiento, con su carga posterior. */
  sesion: 45,
  /** Un cliente en instalación, por semana. */
  instalacion: 30,
};

export function calcularCarga(
  rol: Rol,
  x: { excepciones: number; sesiones: number; enInstalacion: number },
): Carga {
  const minutos =
    x.excepciones * MINUTOS.excepcion +
    x.sesiones * MINUTOS.sesion +
    x.enInstalacion * MINUTOS.instalacion;
  const horas = Math.round((minutos / 60) * 10) / 10;
  const techo = ROLES[rol].techoHoras;
  const ocupacion = techo > 0 ? horas / techo : 0;

  let lectura: string;
  if (ocupacion === 0) lectura = 'Nada pendiente esta semana.';
  else if (ocupacion < 0.6) lectura = `${horas} h de ${techo}. Hay aire.`;
  else if (ocupacion < 1) lectura = `${horas} h de ${techo}. Semana llena, entra.`;
  else {
    // El aviso no puede ser "trabajá más": eso rompe el modelo en silencio.
    lectura =
      `${horas} h contra un techo de ${techo}. Esto no se arregla con más horas: ` +
      'mira qué está poniendo tantas cuentas en rojo.';
  }

  return { rol, horas, techo, ocupacion, lectura, pasado: ocupacion >= 1 };
}

// ── El traspaso ────────────────────────────────────────────────────────────

export interface PasoTraspaso {
  que: string;
  /** Por qué importa, para que no se haga de memoria. */
  porque: string;
}

/**
 * Lo que hereda quien entra al rol.
 *
 * Existe para que sea una lista y no una conversación: una conversación se
 * olvida, y el que la dio se vuelve necesario para siempre.
 */
export const TRASPASO: Record<Rol, PasoTraspaso[]> = {
  direccion: [
    { que: 'Leer el registro de decisiones vigentes',
      porque: 'Es el criterio que ya está resuelto. Volver a decidirlo cuesta coherencia.' },
    { que: 'Revisar el panel del motor una vez por semana',
      porque: 'Es lo único que dice si la app está costando más de lo que debería.' },
  ],
  acompanamiento: [
    { que: 'Abrir la cola del día todas las mañanas',
      porque: 'Está ordenada por dinero en riesgo. Lo de arriba es lo que más cuesta si no se atiende.' },
    { que: 'No inventar respuestas: usar el mensaje que la app escribió',
      porque: 'Si cada uno responde distinto, el cliente recibe criterios que se contradicen.' },
    { que: 'Cargar la sesión apenas termina',
      porque: 'Lo que no se carga vive en la cabeza de quien la dio, y el que sigue arranca de cero.' },
    { que: 'Escalar lo que no está en la cola',
      porque: 'Si no está, es criterio nuevo — y eso es de dirección.' },
  ],
  desarrollo: [
    { que: 'Leer COMO-FUNCIONA.md antes de tocar nada',
      porque: 'Tiene el mapa de los motores y qué NO se toca sin pensarlo dos veces.' },
    { que: 'Correr la batería antes y después de cada cambio',
      porque: 'Si algo estaba rojo antes, no lo causaste tú; si se pone rojo después, sí.' },
    { que: 'Mirar los minutos de humano por cliente cada mes',
      porque: 'Es el único número que dice si el trabajo está sirviendo.' },
  ],
};
