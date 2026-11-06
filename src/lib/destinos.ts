/**
 * LOS DESTINOS DE LA APP — una sola lista, para todas las puertas.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * La app tiene quince pantallas y cinco destinos en la navegación. Esos cinco
 * están elegidos a propósito: el menú y la barra de abajo dicen lo mismo, y el
 * cuarto cambia con el avance para no gastar un lugar en algo que todavía dice
 * «todavía no».
 *
 * El problema no era ese. Era que las otras diez vivían en una lista privada
 * del encabezado, que solo alimenta al buscador — y el buscador se esconde en
 * pantalla chica. En el teléfono, que es desde donde entra el cliente, El
 * Método, el Diario, Métricas, Mi Clínica, el Creador y Mi Número no tenían
 * ninguna puerta. La biblioteca, donde vive el libro que la página de venta
 * promete, tenía cero entradas.
 *
 * Ahora la lista vive acá y la usan las dos puertas: el buscador en pantalla
 * grande, y el cajón del menú en el teléfono. Una sola lista, un solo lugar
 * donde agregar lo próximo.
 *
 * ═══ LO QUE CADA UNO PIDE ═══
 *
 * `minPilar` y `minCinturon` son los mismos requisitos que aplica el cambio de
 * pantalla: están acá para que el menú no ofrezca una puerta que al tocarla
 * lleve a otro lado.
 */
import {
  LayoutDashboard, Map, Sparkles, MessageSquare, LifeBuoy, TrendingUp,
  BookOpen, Library, Megaphone, Hexagon, Dna, PenLine, Target,
  type LucideIcon,
} from 'lucide-react';

export interface Destino {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Para qué sirve, en una línea que el cliente entienda. */
  desc: string;
  /** El pilar que hay que tener abierto. Cero es desde el día uno. */
  minPilar: number;
  /** El cinturón que hay que tener. Se gana terminando Sanar el Dinero. */
  minCinturon?: number;
}

export const DESTINOS: Destino[] = [
  { id: 'dashboard', label: 'Hoy', icon: LayoutDashboard, desc: 'Tu día, en orden', minPilar: 0 },
  { id: 'roadmap', label: 'El Camino', icon: Map, desc: 'Tus sesiones, una por día', minPilar: 0 },
  { id: 'entrenadores', label: 'Entrenadores', icon: Dna, desc: 'Practica con quien te corrige', minPilar: 0 },
  { id: 'adn', label: 'Mi ADN', icon: Sparkles, desc: 'Las piezas que ya sellaste', minPilar: 0 },
  { id: 'coach', label: 'Tu Mentor', icon: MessageSquare, desc: 'Tu guía del proceso', minPilar: 0 },
  { id: 'mensajes', label: 'Acompañamiento', icon: LifeBuoy, desc: 'Escríbele al equipo, o pregunta a la IA', minPilar: 0 },
  { id: 'numero', label: 'Mi Número', icon: Target, desc: 'Tu precio nuevo y lo que lo sostiene', minPilar: 0 },
  { id: 'diario', label: 'Diario del Fundador', icon: BookOpen, desc: 'Tu cierre de cada día', minPilar: 0, minCinturon: 2 },
  { id: 'biblioteca', label: 'El Método', icon: Library, desc: 'Tus libros y las clases del método', minPilar: 2, minCinturon: 2 },
  { id: 'metrics', label: 'Métricas', icon: TrendingUp, desc: 'Tus números: visitas, llamadas, consultantes', minPilar: 4 },
  { id: 'campanas', label: 'Campañas', icon: Megaphone, desc: 'Tus anuncios, carruseles y portadas', minPilar: 4 },
  { id: 'creador', label: 'Creador de Contenido', icon: PenLine, desc: 'Tus guiones y publicaciones', minPilar: 4 },
  // Mi Clínica salió de la barra de navegación —era un salto a otra app sin
  // aviso— y ahora es una pantalla que explica qué es.
  { id: 'miclinica', label: 'Mi Clínica', icon: Hexagon, desc: 'Dónde operas: tus consultantes y sus protocolos', minPilar: 5 },
];

/**
 * El mapa del menú, escrito con los nombres de verdad.
 *
 * El Soporte de la app llevaba su propio mapa escrito a mano, con la orden
 * «usa estos nombres exactos», y cuatro de esos nombres ya no existían:
 * «Mentor IA», «Entrenadores IA», «Campañas & Creativos» y «Soporte». Faltaban
 * «Mi ADN» y «Mi Número». Así que lo único que está para ayudar a encontrar
 * las cosas mandaba a pantallas con nombres que la app no usa.
 *
 * Derivado de `DESTINOS`, que es la lista que alimenta el buscador y el menú:
 * mientras los nombres salgan de acá, el mapa no puede envejecer.
 *
 * SIN LAS CINCO QUE VIVEN EN SU DÍA. El Soporte dice «usa estos nombres
 * exactos» y manda al cliente a tocar lo que nombra: si nombra Campañas, el
 * cliente la busca en el menú y no está. La regla es la misma que arregló
 * este mapa la vez anterior —los nombres tienen que ser los que el cliente
 * ve— solo que ahora cinco de ellos se ven adentro de su jornada.
 */
export function mapaDelMenu(): string {
  return DESTINOS.filter((d) => !EN_SU_DIA.includes(d.id)).map((d) => d.label).join(' · ');
}

/**
 * LOS CUATRO. Los mismos en el teléfono y en la computadora, siempre.
 *
 * ═══ POR QUÉ CUATRO Y POR QUÉ FIJOS ═══
 *
 * Eran cinco, y el cuarto CAMBIABA de nombre, de ícono y de destino según el
 * avance: decía «Mi ADN» hasta que te tocaba montar y después «Campañas». La
 * intención era buena —no gastar un lugar en algo que todavía dice «todavía
 * no»— y el efecto era el contrario: la navegación se movía debajo del
 * cliente. Lo que ayer estaba cuarto hoy es otra cosa, y lo que aprendiste a
 * encontrar dejó de estar.
 *
 * Una barra que no se mueve se aprende una vez. Y cuatro palabras entran
 * cómodas hasta en un Android de 320 px, que con cinco iba al límite.
 *
 * Lo que salió no se perdió: vive dentro de El Camino, que es de lo que son
 * parte. Mi ADN son las piezas que sellaste en el Camino; Campañas, Métricas y
 * el Creador son las herramientas de los días que te toquen; el Método son los
 * libros que lo explican. Ninguna de esas se usa «cualquier día»: se usa EL
 * día. Y ese es el criterio de esta barra desde siempre — si algo se usa en un
 * día concreto, no va acá, va en ese día.
 */
export const PRINCIPALES = ['dashboard', 'roadmap', 'entrenadores', 'mensajes'];

/**
 * LAS TRES VISTAS DE CONSULTA — lo que se mira cualquier día.
 *
 * ═══ ERAN OCHO ═══
 *
 * La grilla dentro de El Camino tenía ocho casillas: Mi Número, Mi ADN, El
 * Método, el Diario, Métricas, Campañas, el Creador y Mi Clínica. Ocho
 * nombres que hay que leer para encontrar uno, en la pantalla que ya era la
 * más pesada de la app.
 *
 * Y el criterio para achicarla ya estaba escrito en esta misma casa: si algo
 * se usa en UN día concreto, no va en una lista — va en ese día. Lo que pasa
 * es que no se había aplicado hasta el fondo.
 *
 * Quedan las tres que se consultan CUALQUIER día:
 *
 *   Mi ADN      lo que ya selló, junto
 *   El Método   sus libros y las clases
 *   Métricas    sus números
 *
 * Las otras cinco viven en su día, en `laPuertaDelDia.ts`. Siguen en
 * `DESTINOS` —el buscador las encuentra por nombre, que es como vuelve quien
 * ya estuvo— pero salen del menú y de esta grilla.
 *
 * El Mentor queda afuera a propósito: no es una parte del Camino, es con
 * quién lo caminas, y por eso está en el encabezado.
 */
export const DENTRO_DEL_CAMINO = ['adn', 'biblioteca', 'metrics'];

/**
 * Las que salieron del menú y viven en su día.
 *
 * Están acá para que se vea de un vistazo qué se movió, y para que la lente
 * que busca pantallas huérfanas tenga contra qué comparar. La lista de qué
 * día abre cada una vive en `laPuertaDelDia.ts`.
 */
export const EN_SU_DIA = ['numero', 'diario', 'campanas', 'creador', 'miclinica'];

/** Las partes de El Camino, en el orden en que se encuentran. */
export const destinosDelCamino = (): Destino[] =>
  DENTRO_DEL_CAMINO.map((id) => DESTINOS.find((d) => d.id === id)).filter((d): d is Destino => Boolean(d));

/** Todo lo que no entra en los cuatro de la barra. */
export const otrosDestinos = (): Destino[] =>
  DESTINOS.filter((d) => !PRINCIPALES.includes(d.id));

/** Un destino por su identificador, para quien necesite su etiqueta. */
export const destinoPorId = (id: string): Destino | undefined =>
  DESTINOS.find((d) => d.id === id);
