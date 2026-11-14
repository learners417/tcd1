/**
 * LA PUERTA — quién llama, y de dónde se le cree.
 *
 * Medido el 14 de noviembre de 2026: cinco rutas de IA —`generate`, `stream`,
 * `describe-image`, `transcribir` y `vision`— no preguntaban NADA. El usuario
 * viajaba en el cuerpo del pedido (`req.body.userId`), y el guardián está
 * escrito como opt-in: «sin userId no se cobra ni se cuenta», o sea
 * `permitido: true`. Las dos consecuencias se siguen de ahí:
 *
 *   1) Sin `userId`, cualquiera con la URL dispara una llamada a DeepSeek,
 *      Claude u OpenAI con las llaves de la casa, sin crédito, sin tope y sin
 *      techo —el techo de gasto se mide por usuario, así que al anónimo no se
 *      le aplica ninguno—. La factura es de Javo.
 *   2) Con el `userId` de otro, se le gasta el crédito a otro.
 *
 * La app entera vive detrás del login (`App.tsx` dibuja `<Login/>` si no hay
 * sesión), así que el token SIEMPRE está del lado del cliente: pedirlo no le
 * cierra la puerta a nadie que deba entrar.
 *
 * El patrón ya existía en la casa —`api/ai/image.ts` y las dos rutas de PayPal
 * lo hacen así—; lo que faltaba era un solo lugar que lo diga, para que la
 * lente lo pueda medir handler por handler en vez de archivo por archivo.
 *
 * Se usa SIEMPRE en dos líneas, y la segunda es la que importa: preguntar sin
 * cortar no es una puerta.
 *
 *   const userId = await usuarioDeLaPuerta(req);
 *   if (!userId) return res.status(401).json(SIN_PERMISO);
 */
import { extractJwt, getUserIdFromJwt } from './credits-server.js';

/** El cuerpo del 401, igual en todas las rutas. */
export const SIN_PERMISO = { error: 'UNAUTHORIZED', code: 'UNAUTHORIZED' } as const;

/**
 * El id del usuario que firma el pedido, verificado contra Supabase.
 * `null` = no hay token, o el token no vale: la ruta tiene que cortar con 401.
 *
 * Nunca lee `req.body.userId`: lo que el navegador dice de sí mismo no es
 * identidad, es un dato más del cuerpo.
 */
export async function usuarioDeLaPuerta(
  req: { headers: Record<string, string | string[] | undefined> },
): Promise<string | null> {
  const jwt = extractJwt(req);
  if (!jwt) return null;
  return await getUserIdFromJwt(jwt);
}
