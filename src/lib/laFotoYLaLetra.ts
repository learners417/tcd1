/**
 * LA FOTO Y LA LETRA — dos cosas que vivían en la misma llave.
 *
 * ═══ EL BUG (8 de noviembre) ═══
 *
 * `tcd_avatar` guardaba DOS cosas incompatibles, y cada una pisaba a la otra:
 *
 *   la letra  — 'A' o 'B', si el sanador tiene método propio o no.
 *               La escribe la bienvenida, y App.tsx la vuelve a escribir
 *               desde la base en CADA carga del perfil.
 *   la foto   — el `data:` URL de su foto de perfil, que vive solo acá
 *               (no hay columna en la base).
 *
 * El resultado, en este orden, que es el orden normal de uso:
 *
 *   1. El cliente sube su foto      → tcd_avatar = 'data:image/jpeg;base64,…'
 *   2. Recarga, o se refresca el perfil → App.tsx escribe 'B' encima
 *   3. El Topbar pinta <img src="B">  → el ícono de imagen rota, en TODAS
 *      las pantallas, donde estaba su cara
 *
 * Y al revés: `coachPrompt` leía esta llave cuando la columna de la base no
 * venía, así que podía tomar un `data:` URL como tipo de avatar. Ninguna de
 * las dos ramas coincide con un base64, así que caía en la de principiante —
 * un sanador con años de práctica recibiendo el tono de quien recién empieza.
 *
 * ═══ POR QUÉ UN MÓDULO Y NO UNA LLAVE NUEVA EN CADA ARCHIVO ═══
 *
 * Porque el bug nació de tener cuatro lugares escribiendo la misma llave con
 * criterios distintos. Cambiar el nombre en los cuatro deja el mismo problema
 * esperando al quinto. Acá hay un solo dueño de cada cosa, y la lente
 * `prueba-la-foto-y-la-letra.ts` marca en rojo a quien toque las llaves por su
 * nombre desde afuera.
 */

/** La foto del cliente. Vive solo en el teléfono: no hay columna en la base. */
const LLAVE_FOTO = 'tcd_foto';
/** La letra del avatar: 'A' en construcción, 'B' establecido. */
const LLAVE_LETRA = 'tcd_avatar';

export type LetraDeAvatar = 'A' | 'B';

/**
 * Pasa la foto vieja a su llave nueva, una sola vez.
 *
 * Los clientes que ya subieron su foto la tienen en `tcd_avatar`. Como no hay
 * columna en la base, si no se migra acá se pierde — y perder la foto de
 * alguien por un arreglo nuestro es peor que el bug.
 *
 * Se reconoce por su forma: una foto es un `data:` URL, la letra es un solo
 * carácter. No hay ambigüedad posible entre las dos.
 */
function migrar(): void {
  try {
    const viejo = localStorage.getItem(LLAVE_LETRA);
    if (viejo && viejo.startsWith('data:') && !localStorage.getItem(LLAVE_FOTO)) {
      localStorage.setItem(LLAVE_FOTO, viejo);
      localStorage.removeItem(LLAVE_LETRA);
    }
  } catch { /* sin localStorage no hay nada que migrar */ }
}

/** La foto del cliente, o cadena vacía si no subió ninguna. */
export function leerFoto(): string {
  try {
    migrar();
    const f = localStorage.getItem(LLAVE_FOTO) ?? '';
    /* Una letra NO es una foto. Si algo dejó 'A' acá, no se pinta: un
       `<img src="A">` es el ícono de imagen rota donde va su cara. */
    return f.startsWith('data:') || f.startsWith('http') ? f : '';
  } catch { return ''; }
}

export function guardarFoto(dataUrl: string): void {
  try { localStorage.setItem(LLAVE_FOTO, dataUrl); } catch { /* noop */ }
}

/**
 * La letra del avatar guardada en el teléfono, o `null` si no hay ninguna.
 *
 * Devuelve `null` —y no 'A'— cuando no sabe. Quien pregunta tiene que decidir
 * qué hacer sin el dato; dar 'A' por defecto es lo que hacía que un sanador
 * establecido recibiera el tono de principiante cuando la base no respondía.
 */
export function leerLetra(): LetraDeAvatar | null {
  try {
    migrar();
    const l = localStorage.getItem(LLAVE_LETRA);
    return l === 'A' || l === 'B' ? l : null;
  } catch { return null; }
}

export function guardarLetra(letra: string | null | undefined): void {
  if (letra !== 'A' && letra !== 'B') return;
  try { localStorage.setItem(LLAVE_LETRA, letra); } catch { /* noop */ }
}
