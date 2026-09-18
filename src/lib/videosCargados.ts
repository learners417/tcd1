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
export const VIDEOS_POR_JORNADA: Record<string, string> = {
  // ── Javo ──
  'P0.0': 'https://youtu.be/v154pbAd3Hw',        // día 1 · Bienvenida
  'P1.0': 'https://youtu.be/8Is3XXuk3e8',        // día 3 · El valor real de tu hora
  'P2.d8': 'https://youtu.be/_YSWo_1PNcE',       // día 8 · El precio nuevo (desbloquearte para subir precios)
  'P2.d9': 'https://youtu.be/Jm_IlRlPGWA',       // día 9 · Los tres grupos (limpieza de agenda)
  'P3.d13': 'https://www.youtube.com/watch?v=qqWnptyFIsQ', // día 13 · Tu plan de caza (embudo orgánico)
  'P3.d15': 'https://youtu.be/3QVjYzWNM7M',      // día 15 · Tu método propio
  'P4.d17': 'https://youtu.be/_UjQtE4lNtk',      // día 17 · Tu oferta
  'P4.d19': 'https://youtu.be/ck2IVA9ZTzU',      // día 19 · Tu escalera (infraestructura N1-N2-N3)
  'P5.d20': 'https://youtu.be/xzrQXG7iaJc',      // día 20 · Cobrar libera al otro (ventas, intro)
  'P5.d21': 'https://www.youtube.com/watch?v=rMC2bW-avsU', // día 21 · El ancla del precio (ventas conscientes)
  'P5.d22': 'https://youtu.be/Olpfve1sj-Q',      // día 22 · El circuito (embudo VSL)
  'P7.d30': 'https://youtu.be/6C_Qyk-_GCw',      // día 30 · Los tres anuncios listos (matriz A-B-C)
  'P8.d36': 'https://youtu.be/FqGR_oRyI70',      // día 36 · La llamada dibujada (sistema W)
  'P8.d38': 'https://www.youtube.com/watch?v=2LbHYaP6HSw', // día 38 · Antes de la llamada (curva de la W)
  'P9A.d47': 'https://youtu.be/CQXN4Vt_nng',     // día 47 · La cinta (servicio)

  // ── Ron, el filmaker: los días de rodaje ──
  'P6.d26': 'https://youtu.be/eai08tzbVPU',      // día 26 · Preproducción (grabar tu video en interior)
  'P6.d27': 'https://youtu.be/N3l1Vh-kJnw',      // día 27 · Jornada de rodaje A (en exterior)
  'P9A.d52': 'https://youtu.be/2V0ArlT4dZc',     // día 52 · Jornada de rodaje B (anuncios y reels)

  // ── Lupe, paso a paso en pantalla ──
  'L-01': 'https://youtu.be/5R5JDKEDaY0',        // día 1 · Tu primer ingreso a la plataforma
  'L-06': 'https://youtu.be/rK87Gb40ykU',        // día 25 · Tu subdominio (dominio y DNS)
  'L-07': 'https://youtu.be/LzU5fRc4IgE',        // día 28 · Subir tu video a la página
  'L-11': 'https://youtu.be/OFlWSTL8f-w',        // día 29 · Tu página y perfil profesional
  'L-12': 'https://youtu.be/Ei5x-_sXKhc',        // día 29 · Business y cuenta publicitaria
  'L-13': 'https://youtu.be/M8R3ysymXrE',        // día 29 · Tarjeta o PayPal
  'L-14': 'https://youtu.be/cIaUuk2X_p4',        // día 29 · Tu pixel
  'L-16': 'https://youtu.be/6AZpNd0eh0s',        // día 31 · Tu público de retargeting
  'L-09': 'https://youtu.be/N95WnnX7Z2k',        // día 28 · Tu calendario en dos pasos (calendario y correo)
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
  { titulo: 'Tu historia', url: 'https://youtu.be/ZClgkkUs2QI', tema: 'Quién eres' },
  { titulo: 'Tu propósito', url: 'https://youtu.be/A9bWp0nVTQI', tema: 'Quién eres' },
  { titulo: 'Tu legado', url: 'https://youtu.be/BiZLzUGs2Wo', tema: 'Quién eres' },
  { titulo: 'A quién sirves', url: 'https://youtu.be/XdjruYVXeOA', tema: 'Tu programa' },
  { titulo: 'Tu frase que te separa', url: 'https://youtu.be/nTWKGyvBbvY', tema: 'Tu programa' },
];

/** El mapa listo para la app: código → id de YouTube. */
export function mapaDeVideos(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [codigo, url] of Object.entries(VIDEOS_POR_JORNADA)) {
    const id = idDeYoutube(url);
    if (id) out[codigo] = id;
  }
  return out;
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
};
