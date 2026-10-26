/**
 * libros.ts — los libros, que son de donde sale todo lo que la app hace.
 *
 * ═══ POR QUÉ ESTÁN ACÁ ═══
 *
 * La Biblioteca junta los videos del Camino, las clases del método y los
 * pasos escritos. No tenía concepto de libro, y los libros son la fuente:
 * Sanadores Libres es la explicación de esta app, y las siete libertades son
 * la cosmovisión detrás de todo. El cliente que quiere entender por qué el
 * Camino está en este orden, lo encuentra ahí y en ningún otro lado.
 *
 * ═══ LO QUE ESTE ARCHIVO NO HACE ═══
 *
 * No vende. No dice precios, no regala y no promete accesos. El estante dice
 * qué libro es, qué explica, y lleva a donde vive. Lo que cuesta y cómo se
 * entrega se decide fuera de la app, y cambia más seguido que esto.
 *
 * ═══ LA COLECCIÓN DEL SUR ═══
 *
 * Son cinco libros, uno por sistema, cada uno con un paisaje de la Patagonia.
 * El número del lomo sigue el orden del método, que es el mismo orden del
 * Camino: lago 1, montaña 2, viento 3, río 4, bosque 5.
 *
 * Por eso esta colección sí tiene orden, y los otros libros no: el lago y la
 * montaña son el reset y el programa, y nadie levanta el programa antes del
 * reset. Lo mismo que en el Camino.
 */

export type EstadoDeLibro = 'publicado' | 'escribiendo';

export interface Libro {
  id: string;
  titulo: string;
  /** Qué explica, en una línea. Es lo que decide si el cliente lo abre. */
  queExplica: string;
  /** Su lugar en la obra completa. */
  rol: 'raiz' | 'esta-app' | 'coleccion' | 'companero';
  estado: EstadoDeLibro;
  /** El orden dentro de la colección del sur, que sí tiene orden. */
  orden?: number;
  /** Donde vive. Se carga cuando existe: sin enlace, el libro igual se anuncia. */
  enlace?: string;
}

export const LIBROS: Libro[] = [
  {
    id: 'siete-libertades',
    titulo: 'Las siete libertades fundamentales',
    queExplica:
      'La cosmovisión completa: las siete libertades que sostienen una vida, y lo que hay detrás de todos los proyectos.',
    rol: 'raiz',
    estado: 'escribiendo',
  },
  {
    id: 'sanadores-libres',
    titulo: 'Sanadores Libres',
    queExplica:
      'De autoempleado a director de tu clínica digital. Por qué quien cura suele ser el peor cuidando de sí mismo, y los cinco sistemas que son este Camino.',
    rol: 'esta-app',
    estado: 'publicado',
  },

  /*
   * La colección del sur: un libro por sistema, en el orden del método. Ese
   * orden es el mismo que el del Camino, y por eso acá sí manda — el número
   * del lomo lo sigue.
   */
  {
    id: 'lago',
    titulo: 'Lo que el lago te enseña',
    queExplica: 'Tu reset. Lo que cambia adentro antes de que cambie el precio.',
    rol: 'coleccion',
    orden: 1,
    estado: 'escribiendo',
  },
  {
    id: 'montana',
    titulo: 'Lo que la montaña te enseña',
    queExplica: 'Tu programa. Cómo tu forma de trabajar se vuelve un método con nombre.',
    rol: 'coleccion',
    orden: 2,
    estado: 'escribiendo',
  },
  {
    id: 'viento',
    titulo: 'Lo que el viento te enseña',
    queExplica: 'Tu captación. Cómo llega a ti quien te estaba buscando.',
    rol: 'coleccion',
    orden: 3,
    estado: 'escribiendo',
  },
  {
    id: 'rio',
    titulo: 'Lo que el río te enseña',
    queExplica: 'Tu propia app. Lo que entregas cuando dejas de vender horas.',
    rol: 'coleccion',
    orden: 4,
    estado: 'escribiendo',
  },
  {
    id: 'bosque',
    titulo: 'Lo que el bosque te enseña',
    queExplica:
      'Tu ecosistema. Treinta y tres lecciones del bosque patagónico sobre cómo se construye una marca y una vida.',
    rol: 'coleccion',
    orden: 5,
    estado: 'escribiendo',
  },
  {
    id: 'heroe-descapado',
    titulo: 'Héroe descapado',
    queExplica:
      'Lo que el éxito te está cobrando, y cómo se sostiene a quien sostiene a todos los demás.',
    rol: 'companero',
    estado: 'escribiendo',
  },
];

/** Cómo se presenta cada rol en el estante. */
export const COMO_SE_LLAMA_EL_ROL: Record<Libro['rol'], string> = {
  raiz: 'La raíz de todo',
  'esta-app': 'El libro de esta app',
  coleccion: 'Lo que el sur te enseña',
  companero: 'Para leer al lado',
};

/**
 * El orden del estante: primero la raíz, después el de esta app, después la
 * colección por su orden —que sí lo tiene, porque son los cinco sistemas— y
 * al final los compañeros, que se leen cuando se quiera.
 */
const PESO: Record<Libro['rol'], number> = { raiz: 0, 'esta-app': 1, coleccion: 2, companero: 3 };

export function estante(): Libro[] {
  return [...LIBROS].sort(
    (a, b) => PESO[a.rol] - PESO[b.rol] || (a.orden ?? 99) - (b.orden ?? 99) || a.titulo.localeCompare(b.titulo),
  );
}

/** Cuántos de la colección del sur faltan cargar: son cinco en total. */
export const LIBROS_DEL_SUR_ESPERADOS = 5;
export function faltanDelSur(): number {
  return LIBROS_DEL_SUR_ESPERADOS - LIBROS.filter((l) => l.rol === 'coleccion').length;
}
