/**
 * COPIAR AL PORTAPAPELES — una sola forma, y que avise cuando no pudo.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * Había dieciocho botones de copiar y cada uno lo hacía a su manera. Dos
 * formas, las dos con el mismo problema:
 *
 *   navigator.clipboard.writeText(texto)        → sin catch
 *   void navigator.clipboard?.writeText(texto)  → sin catch y sin aviso
 *
 * `navigator.clipboard` no existe en contexto no seguro, y aun existiendo la
 * promesa RECHAZA cuando el documento no tiene foco o el permiso se denegó —
 * cosa que pasa seguido en el navegador del teléfono. Con `?.` el botón no
 * hace absolutamente nada; con el `void`, el rechazo se tira a la basura.
 *
 * En los dos casos el cliente toca «Copiar», no pasa nada, y se queda con la
 * duda de si copió. Después pega en Meta y pega lo que tenía antes.
 *
 * Acá hay un solo camino, con respaldo y con respuesta: quien llama sabe si
 * funcionó y puede decirlo.
 */

/**
 * Copia un texto. Devuelve true solo si de verdad quedó en el portapapeles.
 *
 * Intenta primero la API moderna. Si no está o rechaza, cae al textarea
 * temporal con `execCommand`, que es viejo pero funciona donde la otra no —
 * incluido Safari en contextos donde la API queda bloqueada.
 */
export async function copiar(texto: string): Promise<boolean> {
  if (!texto) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* sigue al respaldo */
  }

  return conTextarea(texto);
}

/**
 * El respaldo: un textarea fuera de pantalla y el comando viejo.
 *
 * `execCommand` está marcado como obsoleto y sigue siendo la única forma que
 * funciona cuando la API moderna no está disponible. Mientras eso sea cierto,
 * quitarlo sería dejar sin copiar a quien más lo necesita.
 */
function conTextarea(texto: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = texto;
    // Fuera de la vista, pero enfocable: con display:none no se puede
    // seleccionar y el comando no copia nada.
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Lo que se le dice cuando no se pudo. Dice qué hacer, no solo que falló. */
export const NO_SE_PUDO_COPIAR =
  'Tu navegador no dejó copiar. Marca el texto con el dedo y copia a mano.';
