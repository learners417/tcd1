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

/*
 * ═══ UN SOLO ROL, Y UNA SOLA FUNCIÓN QUE LO DECIDE ═══
 *
 * Este archivo tenía su propio `Rol` de TRES valores y su propio `rolDe`, al
 * lado de los de `permisos.ts`, que tiene CUATRO. Y contestaban distinto: para
 * `produccion`, `dev` y `editor`, permisos decía «producción» o «desarrollo» y
 * esto decía «acompañamiento».
 *
 * O sea que un compañero de producción veía su rol escrito de dos formas según
 * la pestaña del Admin que abriera. Y era peor que confuso: `Jornada.tsx`
 * llamaba a `calcularCarga` con el rol de permisos y un `as never` para que el
 * tipo no se quejara, así que al abrir la pestaña Hoy el panel se rompía con
 * «Cannot read properties of undefined (reading 'techoHoras')».
 *
 * Manda `permisos.ts`, que es la que se declara autoridad. Acá se re-exporta
 * para no romper a quien ya la pedía desde este archivo.
 */
export { rolDe } from './permisos';
export type { Rol } from './permisos';
import { ROLES as PERMISOS, type Rol } from './permisos';

export interface DefinicionRol {
  id: Rol;
  nombre: string;
  /** Una línea: para qué existe este rol. */
  proposito: string;
  /** Qué le toca. Las tabs que ve primero. */
  leToca: string[];
  /** Qué NO le toca, y por qué. Sin esto, dos personas hacen lo mismo. */
  noLeToca: Array<{ que: string; porque: string }>;
  /**
   * Horas semanales que puede sostener. NO se escribe acá: sale de
   * `permisos.ts`, que ya lo define para los cuatro roles. Estaba en los dos
   * archivos con los mismos números, que es el estado justo antes de que se
   * desfasen.
   */
  readonly techoHoras?: never;
  /** El único número que dice si está haciendo bien su trabajo. */
  indicador: string;
}

export const ROLES: Record<Rol, DefinicionRol> = {
  direccion: {
    id: 'direccion',
    nombre: 'Dirección',
    proposito: 'Poner el criterio y atender los tickets altos. Nada más.',
    leToca: ['sala', 'motor', 'sesiones'],
    noLeToca: [
      { que: 'La cola del día',
        porque: 'Si entra por ahí, el rol de acompañamiento deja de ser necesario y todo vuelve a pasar por una sola persona.' },
      { que: 'Los errores de la app',
        porque: 'Son de desarrollo. Reportarlos sí; arreglarlos no.' },
    ],
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
    indicador: 'El porcentaje de cuentas en rojo. Si sube del 10% al 30%, no hace falta más personal: hace falta arreglar lo que las pone en rojo.',
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
    indicador: 'Los minutos de humano por cliente. Tienen que bajar mes a mes con la misma cantidad de clientes — es lo único que distingue una app que reemplaza trabajo de una que solo suma pantallas.',
  },
  // El cuarto rol venía de `permisos.ts` y acá no existía, así que indexar
  // ROLES['produccion'] daba undefined y rompía la pestaña Hoy del Admin.
  // Su propósito, su nombre y su indicador son los que permisos.ts ya define:
  // no se inventan de nuevo acá.
  produccion: {
    id: 'produccion',
    nombre: 'Producción',
    proposito: 'Editar, escribir y diseñar el material de los clientes asignados.',
    leToca: ['clientes', 'creativos'],
    noLeToca: [
      { que: 'Los clientes que no le asignaron',
        porque: 'No le aportan y son información de otros.' },
      { que: 'Lo que paga cada cliente',
        porque: 'No cambia cómo se edita su video.' },
      { que: 'Los números del cliente',
        porque: 'Su trabajo es el material. Los números pueden condicionar mal una pieza.' },
    ],
    indicador: 'Piezas entregadas a tiempo y con la marca correcta.',
  },
};

/**
 * Traduce el rol viejo al nuevo.
 *
 * `owner` es dirección. `manager` y `staff` eran el mismo permiso con dos
 * nombres: los dos pasan a acompañamiento, que es lo que de hecho hacían.
 * Desarrollo se asigna a mano — nadie lo tenía antes porque el rol no existía.
 */
/** Las tabs que este rol ve primero, en orden. */
export function tabsDe(rol: Rol): string[] {
  return ROLES[rol].leToca;
}

/**
 * ¿Este rol entra a esta TAB? Dirección entra a todo.
 *
 * Se llamaba `puedeVer`, igual que la de `permisos.ts`, y son dos preguntas
 * distintas: ésta es por pantalla y la otra por categoría de información
 * («el dinero de TCD», «los números del cliente»). Con el mismo nombre en dos
 * archivos, cualquiera importa la que no era y la respuesta parece correcta.
 */
export function entraALaTab(rol: Rol, tab: string): boolean {
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
  const techo = PERMISOS[rol].techoHoras;
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
  produccion: [
    { que: 'Dejar cada pieza en la carpeta del cliente, con su nombre y su fecha',
      porque: 'Una pieza guardada en la computadora de quien la hizo es una pieza que el equipo no tiene.' },
    { que: 'Anotar qué quedó a medio editar y en qué archivo',
      porque: 'Quien sigue abre el proyecto y continúa, en vez de empezarlo de nuevo.' },
    { que: 'Pasar el manual de marca de cada cliente asignado',
      porque: 'Sin eso, la pieza siguiente sale con otra tipografía y hay que rehacerla.' },
  ],
};
