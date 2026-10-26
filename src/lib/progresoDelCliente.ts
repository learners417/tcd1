/**
 * EL PROGRESO DEL CLIENTE — una sola forma de unir la base con el espejo local.
 *
 * Tres pantallas traían la hoja de ruta de la base y escribían su resultado
 * TAL CUAL encima del espejo local: El Camino, Hoy y el Creador. Con la base
 * devolviendo menos filas que el espejo —una cuenta nueva allá con progreso
 * acá, un dispositivo que trabajó sin conexión, una escritura que no llegó—
 * eso borra el trabajo del cliente. Medido: setenta y una jornadas a cero en
 * menos de trescientos milisegundos. Y en el modo sin base el espejo local es
 * su ÚNICA copia.
 *
 * Unir a ciegas tampoco alcanza. La base guarda el desmarcado como una fila
 * con `completada: false`, y hay un camino vivo que la escribe:
 * `desmarcarHechoAfuera`, que usa el equipo desde el panel del Admin cuando
 * deshace una jornada que había dado por hecha afuera de la app. Si la unión
 * ignora esas filas, ese «deshacer» no llega nunca al teléfono del cliente y
 * la jornada le queda cerrada para siempre.
 *
 * Así que la base manda donde HABLA y calla donde no tiene fila:
 *
 *   · fila con `completada` true   → la jornada queda cerrada
 *   · fila con `completada` false  → la jornada queda abierta
 *   · sin fila                     → lo que diga el espejo local
 *
 * Nunca se pierde una jornada que la base no conoce, y el desmarcado viaja.
 */

/** Donde vive el espejo local del progreso. */
export const CLAVE_PROGRESO = 'tcd_hoja_ruta_v2';

/**
 * Lo que la tabla `hoja_de_ruta` dice de una jornada. Los tres campos vienen
 * opcionales porque así los declara la fila de la base: una fila a la que le
 * falta el pilar o el código no nombra ninguna jornada, y se saltea.
 */
export type FilaDeRuta = {
  pilar_numero?: number | null;
  meta_codigo?: string | null;
  completada?: boolean | null;
};

/** La clave de una jornada: así se arma en toda la casa. */
export const claveDeJornada = (pilar: number, meta: string): string => `${pilar}-${meta}`;

/** El espejo local, tolerante a que no exista o esté roto. */
export function leerProgresoLocal(): Set<string> {
  try {
    const crudo = localStorage.getItem(CLAVE_PROGRESO);
    return new Set<string>(crudo ? (JSON.parse(crudo) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

/** Guarda el espejo local. Nunca lanza: el progreso en pantalla no depende de esto. */
export function guardarProgresoLocal(progreso: ReadonlySet<string>): void {
  try {
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify([...progreso]));
  } catch {
    /* almacenamiento lleno o bloqueado — la pantalla sigue andando */
  }
}

/**
 * Une lo que trajo la base con el espejo local, sin perder nada que la base no
 * conozca. `local` se puede pasar para probarlo sin navegador.
 */
export function unirProgreso(
  filas: readonly FilaDeRuta[] | null | undefined,
  local: ReadonlySet<string> = leerProgresoLocal(),
): Set<string> {
  const unido = new Set<string>(local);
  for (const fila of filas ?? []) {
    if (fila?.pilar_numero == null || !fila.meta_codigo) continue;
    const clave = claveDeJornada(fila.pilar_numero, fila.meta_codigo);
    if (fila.completada) unido.add(clave);
    else unido.delete(clave);
  }
  return unido;
}
