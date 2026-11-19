/**
 * miComunidad.ts — dónde está el grupo, y por qué está afuera de la app.
 *
 * ═══ LA DECISIÓN ═══
 *
 * Hasta noviembre de 2026 el grupo de los clientes vivió en Discord, y antes
 * en Skool. Desde el martes 17 de noviembre vive en Comunidades de GHL, que
 * es el mismo sistema donde ya están sus pagos, sus correos y su calendario.
 *
 * La app NO construye un chat propio. Se intentó —cinco canales adentro— y
 * la conclusión fue que un grupo necesita personas, no pantallas: un canal
 * vacío adentro de la app es peor que ningún canal, porque el cliente entra,
 * no encuentra a nadie y deja de entrar. El grupo donde ya están todos gana
 * siempre.
 *
 * Lo que SÍ es de la app: tu reporte y tus victorias. Eso es entre el cliente
 * y Javo, uno a uno, y tiene que quedar guardado con su avance.
 *
 * ═══ POR QUÉ EL ENLACE VIVE ACÁ ═══
 *
 * En un solo lugar. Si el grupo se muda otra vez, se cambia esta línea y no
 * se busca por toda la app. `prueba-mi-comunidad.ts` comprueba que ninguna
 * pantalla escriba la dirección a mano.
 */

/** El grupo de los clientes de mentoría e instalación, en Comunidades de GHL. */
export const MI_COMUNIDAD =
  'https://simzamapyvtvv8uzvlgd.app.clientclub.net/communities/groups/mentoria-tcd/home';

/** Lo que dice la puerta. Corto: es un botón, no una explicación. */
export const PUERTA_DE_LA_COMUNIDAD = {
  titulo: 'Mi comunidad',
  queEs: 'El grupo donde están los demás: preguntas, ves lo que resuelven los otros y te enteras de los encuentros.',
  boton: 'Entrar al grupo',
} as const;

/**
 * DÓNDE SE CUENTAN LAS VICTORIAS.
 *
 * Victorias es un canal del grupo, y el link exacto de un canal lo da la
 * comunidad: no se deduce del nombre. Hasta que COMUNIDAD lo pase, esto
 * apunta a la puerta del grupo —que es cierta y está verificada— y el cliente
 * llega en un clic más. Cuando llegue el link, se cambia esta línea.
 */
export const VICTORIAS: string = MI_COMUNIDAD;
