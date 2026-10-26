/**
 * LA HOJA DE RUTA — sus noventa días a la vista, desde el día 1.
 *
 * Javo lo pidió así: "me da paz, seguridad, criterio; sé para dónde voy,
 * cuándo y cómo". El cliente entra el primer día y ve las trece semanas con
 * nombre, sus hitos y la fecha real de cada uno.
 *
 * Las semanas y los hitos se escriben acá; los días, los títulos y el estado
 * salen del Camino. Si mañana se reordena, esto lo acompaña.
 */
import { SEED_ROADMAP_V2 } from './roadmapSeed';

export const SEMANAS: Record<number, string> = {
  1: 'En ti',
  2: 'Tu programa y tus guiones',
  3: 'Grabas y empiezas a vender',
  4: 'Tus primeras ventas',
  5: 'La pauta',
  6: 'Tu app, co-creada con los tres',
  /*
   * De la 7 a la 12 estaban sin nombre propio: la 7 decía «Escalar» —palabra
   * que esta casa no usa— y de la 8 a la 12 las cinco decían lo mismo, «Tu
   * ciclo y tu producto». El comentario de arriba promete «las trece semanas
   * con nombre»: cinco con el mismo nombre no son cinco semanas, son una
   * repetida cinco veces, y es lo primero que el cliente ve el día 1.
   *
   * Los cinco sistemas del seed cubren los días 1-5, 8-12, 15-33, 36-44 y
   * 85-86: los días 45 a 84 no pertenecen a ninguno, y por eso acá no había de
   * dónde sacar el nombre. Así que cada una se nombra por lo que de verdad
   * contienen sus días en `roadmap.seed.json`, no por una frase inventada.
   */
  7: 'Crecer o apagar',               // su propia jornada bisagra, día 43
  8: 'Tu cobranza y tu entrega',      // cobranza, entrega revisada, derivación
  9: 'Tu renovación',                 // la conversación de renovación
  10: 'Tu próxima camada',            // precio y números de la que viene
  11: 'Lo que cuentan los tuyos',     // sus resultados, contados por ellos
  12: 'Lo que sigue sin ti',          // su propia jornada, día 79
  13: 'Tu ecosistema y el cierre',
};

export const HITOS: Record<number, string> = {
  1: 'Tu punto de partida',
  5: 'Tu precio nuevo',
  9: 'Tu método',
  10: 'Tu programa de 1.000 USD',
  15: 'Tu día de rodaje',
  18: 'Empiezas a vender',
  24: 'Tu preventa',
  26: 'Tu primera venta',
  31: 'Tus campañas encendidas',
  38: 'Tu app con tu marca',
  45: 'Tu primer consultante del sistema',
  47: 'Tu máquina de 10',
  80: 'Tu control de 7.000 USD',
  85: 'Tu ecosistema',
  90: 'Tu graduación',
};

export interface DiaDeLaRuta {
  dia: number;
  semana: number;
  titulo: string;
  sistema: number | null;
  minutos: number;
  hito: string | null;
  finDeSemana: boolean;
  codigo: string;
  pilar: number;
}

/** Los noventa días, en orden, con lo que hay que saber de cada uno. */
export function diasDeLaRuta(): DiaDeLaRuta[] {
  const out: DiaDeLaRuta[] = [];
  for (const p of SEED_ROADMAP_V2) {
    for (const m of p.metas) {
      const d = m.dia_asignado;
      if (d === null || d < 1) continue;
      out.push({
        dia: d,
        semana: Math.floor((d - 1) / 7) + 1,
        titulo: m.titulo,
        sistema: m.sistema ?? null,
        minutos: parseInt(m.tiempo_estimado ?? '0', 10) || 0,
        hito: HITOS[d] ?? null,
        finDeSemana: (d - 1) % 7 >= 5,
        codigo: m.codigo,
        pilar: p.numero,
      });
    }
  }
  return out.sort((a, b) => a.dia - b.dia);
}

/**
 * La fecha real de un día, contando desde el lunes de arranque.
 *
 * Sin corrimientos: el Camino no se para. Antes esta función sumaba los días
 * de la «pausa global», así que en enero toda la hoja de ruta se dibujaba un
 * mes más adelante de lo que el cliente tenía agendado.
 */
export function fechaDelDia(fechaInicio: string | null | undefined, dia: number): Date | null {
  if (!fechaInicio) return null;
  const [y, m, d] = fechaInicio.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d + (dia - 1));
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "martes 6 oct", para mostrar al lado de cada jornada. */
export function fechaCorta(fechaInicio: string | null | undefined, dia: number): string {
  const f = fechaDelDia(fechaInicio, dia);
  if (!f) return '';
  return `${DIAS[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]}`;
}
