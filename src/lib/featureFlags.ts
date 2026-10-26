/**
 * featureFlags.ts — Flags de feature globales del frontend.
 *
 * Source of truth: variables de entorno con prefijo VITE_ (Vite las inyecta
 * en build).
 *
 * LO QUE NO ESTÁ EN USO NO SE VE POR OMISIÓN
 *
 * El flag de créditos estaba al revés: apagaba solo si alguien escribía
 * `VITE_CREDITS_ENABLED=false`, y esa variable no está declarada en ningún
 * lado —ni en `.env.example`—, así que en todo entorno estaba ENCENDIDO. El
 * comentario de la barra decía «oculto via flag mientras el sistema esta
 * apagado» y era falso: el badge se veía en las 23 pantallas, decía
 * «0 créditos», y medía 130 de los 358 píxeles útiles de la barra del
 * teléfono — el hueco entero del título de la pantalla, que quedaba en CERO
 * de ancho en todos los destinos.
 *
 * Tres cosas al mismo tiempo, y las tres del lado del cliente que paga: un
 * contador en cero donde más jerarquía hay, un sistema sin terminar a la
 * vista, y ninguna pantalla con nombre.
 *
 * Ahora un sistema que no está en uso se enciende a mano y se apaga solo:
 *   - 'true' exacto → encendido
 *   - cualquier otro valor o ausencia → apagado
 *
 * Para encenderlo alcanza con `VITE_CREDITS_ENABLED=true`, que es un acto
 * explícito: el día que los créditos se usen de verdad, alguien lo escribe.
 */

export const CREDITS_ENABLED: boolean =
  import.meta.env.VITE_CREDITS_ENABLED === 'true';
