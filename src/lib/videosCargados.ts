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

/**
 * LOS QUE HAY QUE REGRABAR — el video está cargado y su guion cambió.
 *
 * No alcanza con corregir el guion: el video que el cliente mira sigue
 * diciendo lo de antes. Un guion corregido sin esta marca es la forma más
 * silenciosa de que las dos cosas se separen para siempre, porque el tablero
 * muestra la jornada con su tilde verde y nadie vuelve a mirarla.
 *
 * La llave es el DÍA, igual que los enlaces: es lo único que no cambia cuando
 * el Camino se reordena. Se saca la línea cuando el video nuevo está arriba.
 */
export const POR_REGRABAR: Record<number | string, string> = {
  1: 'El guion decía «siete etapas, se llaman CLINICA». Ahora dice cinco estaciones, del lago al bosque (9 nov 2026).',
};

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
  'L-08': 'https://youtu.be/B0RmylnND9M',        // día 17 · Cómo calendarizar tu semana
  'L-10': 'https://youtu.be/v8V29ZOBBqI',        // día 17 · Optimizar tu calendario
  'L-15': 'https://youtu.be/HDiuvy7BHlE',        // día 31 · Responder solo a quien comenta o escribe
  'L-17': 'https://youtu.be/fiSk_TQpESk',        // día 23 · Grabar y transcribir tus llamadas con Fathom
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

/**
 * Los ENLACES del archivo, con la clave con la que el Camino los busca.
 *
 * Igual que `mapaDeVideos`, pero devuelve la URL y no el id: el Tablero
 * muestra «Ver el video», que necesita el enlace entero.
 */
export function enlacesPorClave(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [clave, url] of Object.entries(VIDEOS_POR_JORNADA)) {
    const codigo = /^\d+$/.test(clave) ? codigoDelDia(Number(clave)) : clave;
    if (codigo) out[codigo] = url;
  }
  return out;
}

/**
 * ═══ EL MAPA QUE LEE EL CAMINO, CON LA BASE ADENTRO ═══
 *
 * Lo que el Tablero de Grabación guarda en `programa_videos` pisa a lo que
 * viene por archivo. Esta función es la ÚNICA que sabe cómo se arma ese mapa.
 *
 * Estaba escrita dentro de `Roadmap.tsx`, en un `useEffect`, y por eso ni el
 * Tablero ni ninguna lente podían preguntarle «¿el Camino va a encontrar este
 * enlace?». El Tablero contestaba esa pregunta con una segunda copia de la
 * regla —la clave de la pieza— y la copia estaba mal: 34 de las 43 piezas
 * guardaban un código que el Camino nunca busca.
 *
 * `legados` traduce las claves viejas: una fila guardada con el código de la
 * pieza (`P8.1`) sigue valiendo y cae donde el Camino la busca.
 */
export function mapaConLaBase(
  filas: Array<{ pilar_id: string | null; youtube_url: string | null }>,
  legados: Record<string, string> = {},
): Record<string, string> {
  const out = mapaDeVideos();
  for (const f of filas) {
    if (!f.pilar_id || !f.youtube_url) continue;
    const id = idDeYoutube(f.youtube_url);
    if (!id) continue;
    out[legados[f.pilar_id] ?? f.pilar_id] = id;
  }
  return out;
}

/**
 * EL VIDEO DE CADA JORNADA — la regla con la que el Camino reparte los enlaces.
 *
 * Primero por el código de la jornada (`P2.d8`), y después, sólo para una
 * jornada de tipo VIDEO que no tenga el suyo, el del pilar. Vivía dentro de un
 * `useMemo` de `Roadmap.tsx`: acá la pueden mirar el Tablero y las lentes.
 */
export function videoDeCadaJornada<
  M extends { codigo: string; tipo: string; video_youtube_id: string | null },
  P extends { id: string; metas: M[] },
>(pilares: P[], mapa: Record<string, string>): P[] {
  if (Object.keys(mapa).length === 0) return pilares;
  return pilares.map((pilar) => ({
    ...pilar,
    metas: pilar.metas.map((meta) => {
      const id = mapa[meta.codigo] ?? (meta.tipo === 'VIDEO' ? mapa[pilar.id] : undefined);
      return id ? { ...meta, video_youtube_id: id } : meta;
    }),
  }));
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
  'L-08': 'https://drive.google.com/file/d/19EuHUslFZBKVrow8LrMPEQ7tOEQebtdk/view',
  'L-10': 'https://drive.google.com/file/d/1OY0Lg6OXJC7VFTQ5Dt9RH9SoboiW8QiT/view',
  'L-15': 'https://drive.google.com/file/d/1lYLkSvU0iCP5DZs5Oi32CQ-hHbI9hwGs/view',
  'L-17': 'https://drive.google.com/file/d/1qwpHQ5hE0QwwD0wDQ_NfYm1Qn9yzwjc2/view',
};
