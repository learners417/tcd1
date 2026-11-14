/**
 * EL TOKEN DE LA SESIÓN — lo único que el servidor acepta como identidad.
 *
 * Hasta el 14 de noviembre de 2026 las cinco rutas de IA recibían el usuario
 * en el cuerpo del pedido, leído de `localStorage`. Eso no es identidad: es un
 * dato que cualquiera escribe. Ahora `api/_lib/puerta.ts` lo saca del token y
 * corta con 401 si no viene, así que todo `fetch` a una ruta que gasta plata
 * tiene que mandarlo.
 *
 * La app vive detrás del login, así que el token está siempre. Si aun así no
 * estuviera, el pedido sale sin él y la ruta contesta 401: el llamador ya
 * sabe mostrar el error, que es mejor que gastar la llave de la casa.
 */
import { supabase } from './supabase';

/** Las cabeceras de un POST a nuestra API, con el token si hay sesión. */
export async function cabecerasConToken(
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  try {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) h.Authorization = `Bearer ${token}`;
    }
  } catch { /* sin sesión: la ruta contesta 401 y el llamador lo muestra */ }
  return h;
}
