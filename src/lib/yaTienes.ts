/**
 * LO QUE YA TIENES — la personalización del punto de partida.
 *
 * Nadie se salta el Camino. El que llega con la agenda llena y el que empieza
 * de cero hacen el mismo recorrido: es el recorrido el que los convierte en
 * directores de su clínica.
 *
 * Lo que cambia es el trabajo de esa jornada. Si ya tiene su página publicada,
 * ese día no la construye: la revisa contra la vara, con el Crítico al lado, y
 * sale con lo que le faltaba corregido. Veinte minutos en vez de noventa.
 *
 * Antes esta pantalla marcaba jornadas como completas y lo dejaba en el día 38
 * sin haber pasado por nada. El que compró los noventa días se quedaba sin
 * ochenta.
 */
import { codigoDelDia } from './roadmapSeed';

export const KEY_YA_TIENES = 'tcd_ya_tiene_v1';

export interface CosaQueYaTiene {
  id: string;
  /** Lo que el cliente reconoce, en sus palabras. */
  loQueTiene: string;
  /** La jornada que pasa a revisión. */
  dia: number;
  /** Qué mira el cliente cuando la revisa. */
  revisa: string;
  /**
   * Los puntos que se comprueban a ojo, para lo que el Crítico no puede leer:
   * una página, una agenda, un pixel o una campaña no son texto.
   */
  comprueba?: string[];
}

export const YA_TIENES: CosaQueYaTiene[] = [
  { id: 'precio', loQueTiene: 'Ya sé cuánto cobro y lo digo completo', dia: 5,
    revisa: 'tu precio y a quién sigues atendiendo' },
  { id: 'avatar', loQueTiene: 'Sé exactamente a quién le hablo', dia: 8,
    revisa: 'tu avatar y tu lista de veinte' },
  { id: 'metodo', loQueTiene: 'Tengo mi método escrito, con sus etapas', dia: 9,
    revisa: 'tu método contra la vara' },
  { id: 'oferta', loQueTiene: 'Tengo mi programa armado, con precio y plazo', dia: 10,
    revisa: 'tu oferta y tu garantía' },
  { id: 'guiones', loQueTiene: 'Tengo mis guiones escritos', dia: 11,
    revisa: 'tus guiones contra la vara' },
  { id: 'videos', loQueTiene: 'Ya grabé mi video de venta y mis anuncios', dia: 15,
    revisa: 'lo que ya grabaste',
    comprueba: [
      'Tu video de venta se entiende sin sonido en los primeros diez segundos',
      'Tus tres anuncios abren distinto y terminan en la misma acción',
      'Se te escucha limpio y se te ve la cara con luz',
    ] },
  { id: 'pagina', loQueTiene: 'Mi página y mi perfil están publicados', dia: 16,
    revisa: 'tu página y tu perfil',
    comprueba: [
      'Tu página dice qué haces, para quién y cuál es el paso siguiente',
      'El botón lleva a tu agenda y funciona desde el teléfono',
      'Tu perfil dice lo mismo que tu página',
    ] },
  { id: 'agenda', loQueTiene: 'Cualquiera puede agendarse y pagarme solo', dia: 17,
    revisa: 'tu agenda y tu cobro, de punta a punta',
    comprueba: [
      'Alguien de afuera puede agendar sin escribirte',
      'Llega el correo de confirmación y el recordatorio',
      'El link de pago cobra de verdad: pruébalo con un peso',
    ] },
  { id: 'llamada', loQueTiene: 'Tengo mi llamada de venta armada', dia: 19,
    revisa: 'tu llamada dibujada' },
  { id: 'pixel', loQueTiene: 'Tengo Meta conectado y mi pixel midiendo', dia: 29,
    revisa: 'tu pixel y tu cuenta',
    comprueba: [
      'El pixel dispara cuando alguien entra a tu página',
      'La cuenta publicitaria tiene tarjeta cargada y sin avisos',
      'Tu público de retargeting ya está creado',
    ] },
  { id: 'campanas', loQueTiene: 'Tengo campañas corriendo', dia: 31,
    revisa: 'tus campañas y sus números',
    comprueba: [
      'Las dos campañas están activas y con presupuesto',
      'Cada anuncio manda al mismo paso siguiente',
      'Ya tienes costo por agenda de los últimos siete días',
    ] },
];

/** Lo que eligió, leído de donde quedó guardado. */
export function loQueYaTiene(): string[] {
  try {
    const raw = localStorage.getItem(KEY_YA_TIENES);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Los días que hoy van en modo revisión. */
export function diasEnRevision(ids: string[] = loQueYaTiene()): Set<number> {
  const dias = new Set<number>();
  for (const id of ids) {
    const c = YA_TIENES.find((x) => x.id === id);
    if (c) dias.add(c.dia);
  }
  return dias;
}

/** Los códigos de jornada que van en modo revisión. */
export function codigosEnRevision(ids: string[] = loQueYaTiene()): Set<string> {
  const out = new Set<string>();
  for (const d of diasEnRevision(ids)) {
    const c = codigoDelDia(d);
    if (c) out.add(c);
  }
  return out;
}

/** La jornada de ese día, si va en revisión. */
export function revisionDelDia(dia: number, ids: string[] = loQueYaTiene()): CosaQueYaTiene | null {
  if (!diasEnRevision(ids).has(dia)) return null;
  return YA_TIENES.find((x) => x.dia === dia) ?? null;
}

/** Los tres pasos de una revisión: mirar, medir y corregir. */
export function pasosDeRevision(cosa: CosaQueYaTiene): string[] {
  if (cosa.comprueba?.length) {
    return [
      `Abre ${cosa.revisa} y ponlo delante`,
      ...cosa.comprueba.map((c) => `Comprueba: ${c}`),
      'Corrige lo que falte y súbelo como evidencia',
    ].slice(0, 5);
  }
  return [
    `Abre ${cosa.revisa} y ponlo delante`,
    'Léelo contra los criterios que te muestra el Crítico',
    'Corrige lo que falte y súbelo como evidencia',
  ];
}

/** El lunes siguiente: el Camino siempre arranca un lunes. */
export function proximoLunes(desde: Date = new Date()): string {
  const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const faltan = (8 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + faltan);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
