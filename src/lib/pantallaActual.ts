/**
 * DÓNDE ESTÁ PARADO EL CLIENTE — una clave, un solo lugar.
 *
 * `App.tsx` guarda en `localStorage` la pantalla abierta para poder volver a
 * ella al recargar, y lo hacía con una constante privada suya. Cuando
 * `avisarFalla` necesitó saber en qué pantalla se rompió algo, escribió la
 * misma cadena a mano — y ahí la app pasó a tener el nombre de esa clave
 * escrito en dos archivos distintos.
 *
 * La lente de datos de `auditoria.py` lo marcó en rojo: encontró una clave
 * que alguien lee y nadie escribe, porque del lado de la escritura ve una
 * constante y del lado de la lectura un literal. Tenía razón por una razón
 * más grande que el rojo: el día que esa clave cambie de nombre, se cambia en
 * un archivo y el otro se queda leyendo una que ya no existe, sin romperse —
 * simplemente deja de saber dónde estaba el cliente, en silencio.
 */
export const CLAVE_PANTALLA = 'tcd_current_page';

/**
 * En qué pantalla está el cliente. Devuelve cadena vacía si no se sabe, que
 * es un dato legítimo: una pantalla se puede romper antes de que la app
 * guarde nada —en el alta, al volver de un pago— y ese es justo el momento
 * del que más importa enterarse.
 */
export function pantallaAbierta(): string {
  try {
    return localStorage.getItem(CLAVE_PANTALLA) ?? location.hash.replace(/^#/, '');
  } catch {
    return '';
  }
}
