import { codigoDelDia, diaDelCodigo } from './roadmapSeed';
/**
 * VIDEOS CARGADOS — los enlaces que ya existen, atados a su jornada.
 *
 * Esta es la base: el tablero de grabación del Admin puede pisar cualquiera
 * de estos (lo que se carga en la base manda). Sirve para que la app arranque
 * con todo lo grabado sin que nadie pegue nada.
 *
 * Regla: UN video por jornada. Lo que complementa vive en la Biblioteca y es
 * opcional — el Camino no se llena de material para mirar.
 */

/** id de YouTube a partir de cualquier forma de enlace. */
export function idDeYoutube(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** código de jornada o de tutorial → enlace. */
export const VIDEOS_POR_JORNADA: Record<string | number, string> = {
  // ── Javo ──
  1: 'https://youtu.be/v154pbAd3Hw',                       // día 1 · Bienvenida
  5: 'https://youtu.be/_YSWo_1PNcE',                      // día 5 · El precio nuevo (desbloquearte para subir precios)
  8: 'https://www.youtube.com/watch?v=qqWnptyFIsQ',       // día 8 · Tu plan de caza (embudo orgánico)
  9: 'https://youtu.be/3QVjYzWNM7M',                       // día 9 · Tu método propio
  10: 'https://youtu.be/_UjQtE4lNtk',                     // día 10 · Tu oferta
  46: 'https://youtu.be/ck2IVA9ZTzU',                    // día 46 · Tu escalera (infraestructura N1-N2-N3)
  32: 'https://youtu.be/xzrQXG7iaJc',                     // día 32 · Cobrar libera al otro (ventas, intro)
  19: 'https://www.youtube.com/watch?v=rMC2bW-avsU',      // día 19 · El ancla del precio (ventas conscientes)
  11: 'https://youtu.be/Olpfve1sj-Q',                     // día 11 · El circuito (embudo VSL)
  30: 'https://youtu.be/6C_Qyk-_GCw',                     // día 30 · Los tres anuncios listos (matriz A-B-C)
  22: 'https://www.youtube.com/watch?v=2LbHYaP6HSw',        // día 22 · Antes de la llamada (curva de la W)
  36: 'https://youtu.be/CQXN4Vt_nng',                     // día 36 · La cinta (servicio)

  // ── Ron, el filmaker: los días de rodaje ──
  15: 'https://youtu.be/N3l1Vh-kJnw',                     // día 15 · Jornada de rodaje A (en exterior)
  44: 'https://youtu.be/2V0ArlT4dZc',                       // día 44 · Jornada de rodaje B (anuncios y reels)

  // ── Lupe, paso a paso en pantalla ──
  'L-01': 'https://youtu.be/5R5JDKEDaY0',        // día 1 · Tu primer ingreso a la plataforma
  'L-06': 'https://youtu.be/rK87Gb40ykU',        // día 16 · Tu subdominio (dominio y DNS)
  'L-07': 'https://youtu.be/LzU5fRc4IgE',        // día 17 · Subir tu video a la página
  'L-11': 'https://youtu.be/OFlWSTL8f-w',        // día 29 · Tu página y perfil profesional
  'L-12': 'https://youtu.be/Ei5x-_sXKhc',        // día 29 · Business y cuenta publicitaria
  'L-13': 'https://youtu.be/M8R3ysymXrE',        // día 29 · Tarjeta o PayPal
  'L-14': 'https://youtu.be/cIaUuk2X_p4',        // día 29 · Tu pixel
  'L-16': 'https://youtu.be/6AZpNd0eh0s',        // día 31 · Tu público de retargeting
  'L-09': 'https://youtu.be/N95WnnX7Z2k',        // día 17 · Tu calendario en dos pasos (calendario y correo)
};

export interface VideoComplemento {
  titulo: string;
  url: string;
  /** Con qué pieza del ADN se mira. */
  tema: string;
}

/**
 * La Biblioteca: lo que suma, sin meterse en el Camino. Se mira cuando el
 * cliente quiere, no cuando la app lo empuja.
 */
export const COMPLEMENTOS: VideoComplemento[] = [
  { titulo: 'El valor real de tu hora', url: 'https://youtu.be/8Is3XXuk3e8', tema: 'Del Camino' },
  { titulo: 'Los tres grupos', url: 'https://youtu.be/Jm_IlRlPGWA', tema: 'Del Camino' },
  { titulo: 'La llamada dibujada', url: 'https://youtu.be/FqGR_oRyI70', tema: 'Del Camino' },
  { titulo: 'Preproducción', url: 'https://youtu.be/eai08tzbVPU', tema: 'Del Camino' },
  { titulo: 'Tu historia', url: 'https://youtu.be/ZClgkkUs2QI', tema: 'Quién eres' },
  { titulo: 'Tu propósito', url: 'https://youtu.be/A9bWp0nVTQI', tema: 'Quién eres' },
  { titulo: 'Tu legado', url: 'https://youtu.be/BiZLzUGs2Wo', tema: 'Quién eres' },
  { titulo: 'A quién sirves', url: 'https://youtu.be/XdjruYVXeOA', tema: 'Tu programa' },
  { titulo: 'Tu frase que te separa', url: 'https://youtu.be/nTWKGyvBbvY', tema: 'Tu programa' },
];

/**
 * El mapa listo para la app: código de jornada → id de YouTube.
 *
 * Adentro los videos se guardan por DÍA, que es lo único que no cambia cuando
 * el Camino se reordena. Acá se traducen al código de hoy.
 */
export function mapaDeVideos(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [clave, url] of Object.entries(VIDEOS_POR_JORNADA)) {
    const id = idDeYoutube(url);
    if (!id) continue;
    const codigo = /^\d+$/.test(clave) ? codigoDelDia(Number(clave)) : clave;
    if (codigo) out[codigo] = id;
  }
  return out;
}

/** El video de una jornada, por su código. */
export function videoDeJornada(codigo: string): string | undefined {
  const d = diaDelCodigo(codigo);
  return (d !== null && VIDEOS_POR_JORNADA[d]) || VIDEOS_POR_JORNADA[codigo];
}

/**
 * Los mismos tutoriales, en PDF. Lupe los armó para quien prefiere leer o
 * seguirlo con la pantalla partida. Se ofrece al lado del video, nunca solo.
 */
export const PDFS_POR_TUTORIAL: Record<string, string> = {
  'L-01': 'https://drive.google.com/file/d/1QGBrjDYV2QtQZCddZ1EkXxmyihaLyX9k/view',
  'L-11': 'https://drive.google.com/file/d/16CcpqOm7UXEdJrf4gX4YRzur0K-0_-7F/view',
  'L-12': 'https://drive.google.com/file/d/1jlg-yVM8mMMO32ZAxzltO1LgGK4XojO3/view',
  'L-13': 'https://drive.google.com/file/d/1v84ndRdCqQ7L6PehVIMzhzisT7GsOiPt/view',
  'L-14': 'https://drive.google.com/file/d/1vLQFCUaSrU-ryX9tnutWZTwrl6TejShr/view',
  'L-06': 'https://drive.google.com/file/d/1vhg4voXTWUGCwNSOZvTplAQ_cFp-tXoP/view',
  'L-07': 'https://drive.google.com/file/d/19ShSjX2PWngiDkdMP_yojSyFVw5tKmBl/view',
  'L-16': 'https://drive.google.com/file/d/1NGbr0D4U5q9M1TViteAJWzlUdEOH5rTM/view',
  'L-09': 'https://drive.google.com/file/d/1_ebK50NSQVNd9wbqnxSaVQzAlNhVHB_I/view',
};
