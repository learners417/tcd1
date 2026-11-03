/**
 * LA MIGRACIÓN QUE HACE EL CLIENTE — no se regala avance, se reconoce el que tiene.
 *
 * ═══ POR QUÉ LA HACE ÉL Y NO EL EQUIPO ═══
 *
 * El asistente de migración existe y funciona, pero vive en el Admin: alguien
 * del equipo abre la ficha de cada cliente, pega su material, revisa los
 * campos y confirma. Con diez clientes viejos a mudar de Discord, son diez
 * sesiones de una persona copiando el trabajo de otra — y nadie conoce el
 * material del cliente mejor que el cliente.
 *
 * Acá lo hace él, con su acceso habilitado. El equipo solo habilita.
 *
 * ═══ EL ERROR QUE ESTO NO REPITE ═══
 *
 * `buildHojaDeRutaFromExtracted` marcaba `completada: true` para TODAS las
 * metas hasta el pilar elegido, incluso cuando el campo de ADN quedaba vacío:
 *
 *     output_generado: texto ? { texto, migrated: true } : null,
 *     completada: true,     ← igual, con texto o sin texto
 *
 * O sea que un cliente con material flojo quedaba con el Camino «completo» y
 * el ADN lleno de agujeros. Y eso no se queda quieto: el Constructor de
 * anuncios autocompleta el brief desde esos campos, así que sus tres anuncios
 * salen de un avatar vacío, una oferta vacía y un método sin nombre.
 *
 * Ya borré un módulo por esto mismo —`puntoDePartida.ts` daba ochenta jornadas
 * por hechas— y tenía su prueba en verde.
 *
 * ACÁ LA REGLA ES: se marca hecho lo que quedó con contenido de verdad. Lo que
 * quedó vacío queda pendiente, se le dice cuánto y se le dice cuál. Reconocer
 * el trabajo que ya hizo es justo; darle por hecho el que no hizo le arruina
 * la campaña tres semanas después, cuando ya no se puede saber por qué.
 */

import type { ExtractedProfile } from './migrationTypes';

/* ══════════════════ QUÉ CUENTA COMO CONTENIDO ══════════════════ */

/**
 * Un campo está lleno cuando tiene algo con lo que se puede trabajar.
 *
 * El largo mínimo no es capricho: «sí», «ok», «mi método» o un guion pasan
 * cualquier chequeo de «no está vacío» y no sirven para escribir un anuncio.
 * Veinte caracteres es lo más corto que puede ser una respuesta real.
 */
export const LARGO_MINIMO = 20;

export function tieneContenido(v: unknown): boolean {
  if (typeof v === 'string') return v.trim().length >= LARGO_MINIMO;
  if (Array.isArray(v)) {
    // Una lista cuenta si al menos una entrada dice algo.
    return v.some((x) => typeof x === 'string' && x.trim().length >= 8);
  }
  if (v && typeof v === 'object') {
    return Object.values(v as Record<string, unknown>).some(tieneContenido);
  }
  return false;
}

/* ══════════════════ EL RESULTADO DE LA MIGRACIÓN ══════════════════ */

export interface ResultadoMigracion {
  /** Las metas que de verdad quedaron cerradas, con su texto. */
  cerradas: string[];
  /** Las que quedan pendientes porque su campo quedó vacío. */
  pendientes: Array<{ codigo: string; queFalta: string }>;
  /** Cuántos campos de ADN quedaron con contenido. */
  camposLlenos: number;
  camposTotales: number;
  /** Si puede pasar a Campañas. */
  listoParaCampanas: boolean;
  /** Lo que se le dice, en una línea. */
  resumen: string;
}

/**
 * Los campos sin los que una campaña no se puede armar.
 *
 * No son todos los del ADN: son los que el Constructor de anuncios lee para
 * autocompletar el brief. Sin estos cinco, sus tres anuncios salen vacíos y
 * no hay forma de que la auditoría lo detecte —porque el texto va a existir,
 * solo que no va a decir nada de él.
 */
export const CAMPOS_PARA_CAMPANAS: Array<{ campo: keyof ExtractedProfile; porQue: string }> = [
  { campo: 'nicho', porQue: 'sin esto tus anuncios le hablan a cualquiera' },
  { campo: 'posicionamiento', porQue: 'es lo que te separa del resto en la primera línea' },
  { campo: 'matriz_a', porQue: 'son los dolores con los que arranca cada anuncio' },
  { campo: 'metodo_nombre', porQue: 'con nombre suena a sistema; sin nombre suena a consejo' },
  { campo: 'historia_150', porQue: 'es la prueba de que tú pasaste por ahí' },
];

/**
 * Qué quedó hecho y qué no, a partir de lo que se extrajo.
 *
 * Esta función no toca la base: decide. Así se puede probar sin credenciales y
 * la regla se lee de una sola vez, en vez de estar repartida entre el wizard y
 * el constructor de filas.
 */
export function evaluarMigracion(
  extraido: Partial<ExtractedProfile>,
  /** Las metas del Camino con su campo de ADN, hasta donde dice que llegó. */
  metas: Array<{ codigo: string; adn_field?: string | null; titulo?: string }>,
): ResultadoMigracion {
  const cerradas: string[] = [];
  const pendientes: Array<{ codigo: string; queFalta: string }> = [];

  for (const m of metas) {
    // Una meta sin campo de ADN no se puede verificar por contenido: es una
    // sesión de hacer, no de escribir. Se cierra, porque el cliente que viene
    // migrando ya la vivió — no hay nada que mirar para saberlo.
    if (!m.adn_field) { cerradas.push(m.codigo); continue; }

    if (tieneContenido(extraido[m.adn_field as keyof ExtractedProfile])) {
      cerradas.push(m.codigo);
    } else {
      pendientes.push({
        codigo: m.codigo,
        queFalta: m.titulo ?? m.adn_field,
      });
    }
  }

  const presentes = CAMPOS_PARA_CAMPANAS.filter((c) => tieneContenido(extraido[c.campo]));
  const camposLlenos = presentes.length;
  const camposTotales = CAMPOS_PARA_CAMPANAS.length;
  const listoParaCampanas = camposLlenos === camposTotales;

  return {
    cerradas, pendientes, camposLlenos, camposTotales, listoParaCampanas,
    resumen: listoParaCampanas
      ? pendientes.length === 0
        ? 'Tu ADN quedó completo. Te toca activar.'
        : `Tu ADN está completo y te toca activar. Te quedaron ${pendientes.length} `
          + `${pendientes.length === 1 ? 'sesión' : 'sesiones'} abiertas para cuando quieras.`
      : `Te faltan ${camposTotales - camposLlenos} de ${camposTotales} piezas para `
        + 'poder armar tus anuncios. Están abajo, y se completan en una sentada.',
  };
}

/** Lo que le falta para Campañas, con el por qué de cada una. */
export function loQueFaltaParaCampanas(
  extraido: Partial<ExtractedProfile>,
): Array<{ campo: string; porQue: string }> {
  return CAMPOS_PARA_CAMPANAS
    .filter((c) => !tieneContenido(extraido[c.campo]))
    .map((c) => ({ campo: ETIQUETA_CAMPO[c.campo] ?? String(c.campo), porQue: c.porQue }));
}

/** Los nombres que el cliente reconoce, no los de la base. */
export const ETIQUETA_CAMPO: Partial<Record<keyof ExtractedProfile, string>> = {
  nicho: 'A quién ayudas',
  posicionamiento: 'Lo que te separa',
  matriz_a: 'Los dolores de tus consultantes',
  metodo_nombre: 'El nombre de tu método',
  historia_150: 'Tu historia',
  proposito: 'Tu propósito',
  legado: 'Tu legado',
};

/* ══════════════════ LO QUE SE LE PIDE PEGAR ══════════════════ */

/**
 * Las cuatro cosas que tiene que traer, nombradas como él las tiene.
 *
 * No «pega tu información»: eso devuelve un párrafo. Nombrar los documentos
 * que ya existen en su Discord y en su carpeta es lo que hace que traiga lo
 * que sirve.
 */
export const QUE_TRAER = [
  {
    titulo: 'Tu plan de negocio',
    detalle: 'El documento que armamos juntos. Pégalo completo, sin recortar.',
  },
  {
    titulo: 'Tu método con sus pasos',
    detalle: 'Con su nombre y las etapas, como quedó.',
  },
  {
    titulo: 'Tu oferta y tu precio de hoy',
    detalle: 'Qué vendes, cuánto cobras, cuántos lugares. El de hoy, no el de antes.',
  },
  {
    titulo: 'Lo que dicen tus consultantes',
    detalle: 'Frases textuales de los que ya atendiste. Son las que mejor funcionan en los anuncios.',
  },
] as const;

/**
 * El aviso antes de empezar.
 *
 * Dicho antes y no después: alguien que pega dos líneas y ve que no pasó nada
 * cree que la app no funciona. Sabiendo de entrada que lo que trae decide lo
 * que sale, trae el documento entero.
 */
export const ANTES_DE_EMPEZAR =
  'Lo que pegues acá es de donde van a salir tus anuncios, tu página y tu campaña. '
  + 'Trae los documentos completos: lo que quede flojo lo vas a ver salir flojo tres '
  + 'semanas después, cuando ya no se puede saber de dónde vino.';
