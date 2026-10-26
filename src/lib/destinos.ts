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
 */
export function mapaDelMenu(): string {
  return DESTINOS.map((d) => d.label).join(' · ');
}

/**
 * Los que viven arriba del menú y en la barra de abajo.
 *
 * Son cinco en pantalla, pero acá hay seis: el cuarto lugar lo ocupa Mi ADN
 * hasta que le toca montar, y Campañas desde entonces. Los dos cuentan como
 * principales para que ninguno aparezca dos veces en el menú.
 */
export const PRINCIPALES = ['dashboard', 'roadmap', 'entrenadores', 'adn', 'campanas', 'mensajes'];

/** Todo lo que no entra en los cinco de arriba. */
export const otrosDestinos = (): Destino[] =>
  DESTINOS.filter((d) => !PRINCIPALES.includes(d.id));

/** Un destino por su identificador, para quien necesite su etiqueta. */
export const destinoPorId = (id: string): Destino | undefined =>
  DESTINOS.find((d) => d.id === id);
