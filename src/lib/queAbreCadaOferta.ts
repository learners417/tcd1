/**
 * QUÉ ABRE CADA OFERTA — una sola frase por escalón, para el alta y la ficha.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * El alta ya pedía «Qué contrató» con los tres nombres y sus precios. Elegir
 * uno de tres nombres sin saber qué le abre a la persona es de las decisiones
 * más caras que se toman en esa pantalla: de esto depende cuánto del Camino ve
 * el cliente y cuánto trabajo le debe el equipo.
 *
 * Así que debajo del selector se lee, en una frase, qué queda abierto. Cambia
 * con lo que se elige, antes de crear la cuenta.
 *
 * ═══ UNA SOLA FUENTE ═══
 *
 * Las tres ofertas ya estaban definidas en `cuadroTickets` —nombre, precio,
 * quién instala, qué incluye, el criterio— y el tope del Camino en
 * `topeDelEscalon`. Esto no define nada nuevo: compone las dos, para que el
 * día que el tope cambie, el alta no siga diciendo lo de antes.
 */
import { TICKETS, type Ticket } from './cuadroTickets';
import { ULTIMO_DIA_DE_BASE, leTocanLasEntregas } from './topeDelEscalon';
import { quienMonta } from './construyeSolo';

export interface LoQueAbre {
  /** Hasta dónde llega su Camino. */
  camino: string;
  /** Quién monta lo técnico. */
  monta: string;
  /** Si el equipo le dispara las tres entregas. */
  entregas: string;
}

export function loQueAbre(t: Ticket): LoQueAbre {
  const marcado = 'marcado';
  return {
    camino: t === 'base'
      ? `Su Camino abre la antesala y los sistemas 1 y 2: hasta el día ${ULTIMO_DIA_DE_BASE}, que cierra con su precio, su método y su oferta en una página.`
      : 'Su Camino abre los 90 días completos, desde la antesala hasta su graduación.',
    monta: `Lo técnico —su página, sus formularios, su WhatsApp, sus automatizaciones— lo monta ${quienMonta(t)}.`,
    entregas: leTocanLasEntregas(t, marcado)
      ? 'El equipo recibe las tres entregas como tarea, en los días 0, 11 y 29 de su trabajo.'
      : 'El equipo no recibe tareas de instalación: él las hace con los tutoriales, en su día.',
  };
}

/** La frase corta de una línea, para debajo del selector del alta. */
export function enUnaLinea(t: Ticket): string {
  const q = loQueAbre(t);
  return `${TICKETS[t].nombre} · ${TICKETS[t].precio.toLocaleString('es')} USD — ${q.camino} ${q.monta}`;
}
