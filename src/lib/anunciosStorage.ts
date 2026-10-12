import { db } from './supabase';
import { generateText } from './aiProvider';
import {
  PLANTILLAS, DESTINOS, OFERTAS, VOCES,
  reglasPara, perfilDeFicha, fichaVacia,
  type Ficha, type Veinte, type AnuncioEscrito, type Revision,
} from './anunciosQueAgendan';

/**
 * LAS FICHAS DE ANUNCIOS, GUARDADAS — y las tres llamadas a la IA.
 *
 * ═══ POR QUÉ NO VA EN EL NAVEGADOR ═══
 *
 * La herramienta venía guardando en `localStorage`. Eso significa que el
 * trabajo vive en el navegador donde se escribió: el cliente carga su ficha en
 * la computadora, abre la app en el teléfono y no hay nada. Y si limpia el
 * historial, tampoco. Son horas de trabajo atadas a un navegador.
 *
 * Acá viven en su cuenta: entra desde donde entre y están. Y el equipo las
 * puede abrir para ayudarlo, que es la mitad del servicio.
 *
 * ═══ POR QUÉ UNA COLUMNA JSONB Y NO VEINTE COLUMNAS ═══
 *
 * Porque la ficha va a cambiar: cada regla nueva puede traer un campo. Con
 * veinte columnas, cada cambio es una migración y una fila vieja que no la
 * tiene. En jsonb, una ficha guardada hace dos meses abre igual y los campos
 * que no existían llegan vacíos.
 *
 * Lo que SÍ va en columnas es lo que se consulta de afuera: de quién es y
 * cuándo se tocó. Nadie busca fichas por el texto de su gancho.
 */

const TABLA = 'anuncios_fichas';

interface FilaFicha {
  id: string;
  user_id: string;
  nombre: string | null;
  datos: Partial<Ficha> | null;
  actualizado_en: string | null;
}

/** Las fichas de un cliente, la más tocada primero. */
export async function misFichas(userId: string): Promise<Ficha[]> {
  if (!userId) return [];
  try {
    const { data, error } = await db()
      .from(TABLA)
      .select('id, user_id, nombre, datos, actualizado_en')
      .eq('user_id', userId)
      .order('actualizado_en', { ascending: false });
    if (error || !data) return [];
    return (data as unknown as FilaFicha[]).map((f) => ({
      // El vacío primero y los datos encima: una ficha guardada antes de que
      // existiera un campo abre con ese campo vacío en vez de romper.
      ...fichaVacia(f.id),
      ...(f.datos ?? {}),
      id: f.id,
      nombre: f.nombre ?? (f.datos?.nombre ?? ''),
    }));
  } catch { return []; }
}

/** Guarda la ficha. Nunca lanza: el trabajo del cliente no se pierde por esto. */
export async function guardarFicha(userId: string, f: Ficha): Promise<boolean> {
  if (!userId || !f.id) return false;
  try {
    const { error } = await db().from(TABLA).upsert({
      id: f.id,
      user_id: userId,
      nombre: f.nombre || null,
      datos: f,
      actualizado_en: new Date().toISOString(),
    });
    return !error;
  } catch { return false; }
}

export async function borrarFicha(id: string): Promise<boolean> {
  try {
    const { error } = await db().from(TABLA).delete().eq('id', id);
    return !error;
  } catch { return false; }
}

/* ══════════════════ LA FICHA QUE SE LLENA SOLA ══════════════════ */

/** Los campos del ADN que alimentan la ficha. */
export interface PerfilParaFicha {
  nombre?: string | null;
  metodo_nombre?: string | null;
  metodo_pasos?: string | null;
  adn_nicho?: string | null;
  adn_micronicho?: string | null;
  adn_usp?: string | null;
  adn_avatar?: unknown;
  adn_transformaciones?: string | null;
  adn_pacientes_reales?: string | null;
  adn_historia_cruda?: string | null;
  adn_linea_tiempo?: string | null;
}

const texto = (v: unknown): string => {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object') {
    // El avatar viene como jsonb. Se arma en prosa: el prompt lee prosa, no
    // un objeto, y el cliente tiene que poder corregirlo a mano.
    const partes = Object.values(v as Record<string, unknown>)
      .filter((x) => typeof x === 'string' && x.trim())
      .map((x) => String(x).trim());
    return partes.join(' ');
  }
  return '';
};

const primero = (...vs: unknown[]): string => {
  for (const v of vs) { const t = texto(v); if (t) return t; }
  return '';
};

/**
 * Una ficha nueva con lo que el cliente ya cargó en su ADN.
 *
 * Abrir en blanco es pedirle que escriba por segunda vez lo que ya escribió
 * en el Camino: su nicho, su método, sus transformaciones, las frases de sus
 * consultantes. Lo que no está en el ADN queda vacío y lo completa él.
 *
 * Lo precargado se puede corregir. El ADN manda sobre quién es; el anuncio
 * manda sobre cómo se dice.
 */
export function fichaDesdeElADN(id: string, p: PerfilParaFicha | null | undefined): Ficha {
  const f = fichaVacia(id);
  if (!p) return f;

  f.nombre = texto(p.nombre);
  f.rubro = primero(p.adn_micronicho, p.adn_nicho, p.adn_usp);
  f.avatar = texto(p.adn_avatar);
  f.metodo = [texto(p.metodo_nombre), texto(p.metodo_pasos)].filter(Boolean).join(' · ');
  f.propio = primero(p.adn_historia_cruda, p.adn_linea_tiempo);
  f.prueba = texto(p.adn_transformaciones);
  f.frases = texto(p.adn_pacientes_reales);
  return f;
}

/** Qué campos llegaron del ADN, para poder decirlo en pantalla. */
export function vinoDelADN(f: Ficha): string[] {
  const n: string[] = [];
  if (f.rubro) n.push('a qué se dedica');
  if (f.avatar) n.push('cliente ideal');
  if (f.metodo) n.push('método');
  if (f.propio) n.push('material propio');
  if (f.prueba) n.push('prueba real');
  if (f.frases) n.push('frases de clientes');
  return n;
}

/* ══════════════════ LAS TRES LLAMADAS ══════════════════ */

/** Saca el JSON aunque el modelo lo envuelva en texto o en un bloque. */
function leerJson<T>(bruto: string): T | null {
  const limpio = bruto.replace(/```json|```/g, '').trim();
  const a = limpio.indexOf('[');
  const o = limpio.indexOf('{');
  const desde = a > -1 && (o < 0 || a < o) ? a : o;
  if (desde === -1) return null;
  const cierra = limpio[desde] === '[' ? ']' : '}';
  const hasta = limpio.lastIndexOf(cierra);
  if (hasta <= desde) return null;
  try { return JSON.parse(limpio.slice(desde, hasta + 1)) as T; } catch { return null; }
}

const S = (v: unknown): string => (v == null ? '' : String(v));
const idCorto = () => Math.random().toString(36).slice(2, 9);

export class SinDatos extends Error {}
export class RespuestaIncompleta extends Error {}

function exigirBase(f: Ficha): void {
  if (!f.rubro.trim() || !f.avatar.trim()) {
    throw new SinDatos('Completa al menos «a qué se dedica» y «cliente ideal» en la ficha.');
  }
}

/**
 * Seis candidatas a EL 20.
 *
 * Primero la idea y después el gancho, que es el orden de Julio. Al revés sale
 * un gancho bonito sin nada atrás: frena el dedo y no deja nada.
 */
export async function proponerVeintes(f: Ficha): Promise<Veinte[]> {
  exigirBase(f);
  const ya = f.veintes.map((v) => `- ${v.texto}`).join('\n');
  const prompt = [
    'Eres estratega de mensajes para anuncios en frío. Julio llama "el 20" a la única idea central de una pieza: la pelota que el lector atrapa. Es nueva, poco común, contraintuitiva, y sale del material propio del cliente para que nadie lo confunda con otro profesional del rubro.',
    reglasPara(f),
    `DATOS DEL CLIENTE\n${perfilDeFicha(f)}`,
    'TAREA: propón 6 candidatas a EL 20, distintas entre sí. Cada una: una frase corta, hablada, en positivo, que un niño de 7 años entienda. Ata cada una a una herramienta, historia o frase real de los datos. Prohibido lo que diría cualquier mentor ("cree en ti", "invierte en ti", "el éxito es constancia").',
    ya ? `YA EXISTEN (no las repitas):\n${ya}` : '',
    `Escribe en ${f.voz}. Responde solo con un arreglo JSON de 6 objetos: {"idea","de" (de qué material propio sale),"por" (qué creencia da vuelta, en una frase)}.`,
  ].filter(Boolean).join('\n\n');

  const bruto = await generateText({ prompt, feature: 'constructor', tarea: 'guion' });
  const d = leerJson<Array<{ idea?: unknown; de?: unknown; por?: unknown }>>(bruto);
  if (!Array.isArray(d)) throw new RespuestaIncompleta('La respuesta llegó incompleta. Toca de nuevo.');
  return d.map((v) => ({ id: idCorto(), texto: S(v.idea), de: S(v.de), porque: S(v.por) }));
}

/**
 * Los anuncios, uno por plantilla elegida.
 *
 * Cada uno habla desde un momento distinto del mismo cliente ideal. Tres
 * variantes del mismo ángulo no prueban nada: el resultado solo dice cuál
 * diseño gustó más, y el ángulo es lo que decide si agenda.
 */
export async function escribirAnuncios(f: Ficha): Promise<AnuncioEscrito[]> {
  exigirBase(f);
  const ps = PLANTILLAS.filter((p) => f.plantillas.includes(p.id));
  if (!ps.length) throw new SinDatos('Elige al menos una plantilla.');

  const vs = f.veintes.filter((v) => f.sel20.includes(v.id));
  const ya = f.anuncios.map((a) => `- ${a.lineas[0] ?? ''}`).join('\n');
  const pedido = ps.map((pl, i) => {
    const v = vs.length ? vs[i % vs.length].texto : '';
    return `#${i} Plantilla "${pl.nombre}". Pasos: ${pl.pasos.map((b) => b[0]).join(' → ')}`
      + (v ? `\nEl 20 de este anuncio: ${v}` : '\nEl 20: propón uno que salga del material propio.');
  }).join('\n\n');

  const prompt = [
    'Eres copywriter de respuesta directa. Escribes anuncios de Meta en frío que terminan en el paso siguiente que indica el cliente.',
    reglasPara(f),
    `DATOS DEL CLIENTE\n${perfilDeFicha(f)}`,
    `ANUNCIOS A ESCRIBIR (uno por línea, en este orden; cada uno desde un momento y un ángulo DISTINTO del mismo cliente ideal):\n${pedido}`,
    ya ? `GANCHOS QUE YA EXISTEN (no los repitas):\n${ya}` : '',
    `Evalúa con honestidad el filtro EPIC de cada anuncio. Escribe en ${f.voz}. Responde solo con un arreglo JSON, un objeto por anuncio y en el mismo orden: {"titular" (40 caracteres como máximo), "lineas" (3 textos para Meta: 1 = gancho, entra en 125 caracteres; 2 = el 20; 3 = el llamado), "veinte", "beats" (arreglo de pares [paso, texto hablado], uno por paso de la plantilla), "visual" (cómo grabarlo para que no parezca anuncio), "epic" ({"E","P","I","C"} cada uno "ok", "parcial" o "falla"), "nota" (lo que más falta, una frase), "pendiente" (datos reales que faltan, o vacío)}.`,
  ].filter(Boolean).join('\n\n');

  const bruto = await generateText({ prompt, feature: 'constructor', tarea: 'guion' });
  const d = leerJson<Array<Record<string, unknown>>>(bruto);
  if (!Array.isArray(d)) throw new RespuestaIncompleta('La respuesta llegó incompleta. Toca de nuevo.');

  return d.map((a, i) => {
    const pl = ps[i] ?? ps[0];
    const beats = Array.isArray(a.beats) ? a.beats : [];
    return {
      id: idCorto(),
      plantilla: pl.id,
      titular: S(a.titular),
      lineas: (Array.isArray(a.lineas) ? a.lineas : []).map(S),
      veinte: S(a.veinte),
      pasos: beats.map((b) => (Array.isArray(b)
        ? [S(b[0]), S(b[1])] as [string, string]
        : [S((b as Record<string, unknown>)?.paso), S((b as Record<string, unknown>)?.texto)] as [string, string])),
      visual: S(a.visual),
      epic: (a.epic && typeof a.epic === 'object' ? a.epic : {}) as AnuncioEscrito['epic'],
      nota: S(a.nota),
      pendiente: S(a.pendiente),
    };
  });
}

/**
 * La lectura a fondo de un anuncio ya escrito.
 *
 * Dice si agenda o trae curiosos, marca regla por regla, y lo reescribe
 * cambiando lo MÍNIMO. Reescribirlo entero es fácil y no sirve: el cliente
 * pierde su forma y su voz, y la próxima vez vuelve a escribir igual.
 */
export async function revisarAnuncio(f: Ficha): Promise<Revision> {
  const t = f.rev.texto.trim();
  if (!t) throw new SinDatos('Pega primero el texto del anuncio.');

  const perfil = perfilDeFicha(f);
  const prompt = [
    'Eres el revisor de anuncios de Meta en frío. Criterio honesto, sin halagos.',
    reglasPara(f),
    perfil ? `DATOS DEL CLIENTE\n${perfil}` : '',
    `ANUNCIO\nTexto:\n${t}\nTitular: ${f.rev.titular}`,
    'TAREA: di si agenda o trae curiosos. Marca lo que cumple y lo que rompe: cada punto con la regla, por qué en una frase y el arreglo en una frase. Después reescríbelo cambiando lo mínimo para que conserve su forma, sin inventar datos.',
    'Responde solo con un objeto JSON: {"veredicto" ("agenda","mixto" o "curiosos"), "resumen" (una frase), "veinte" (su idea central, o vacío si no tiene), "epic" ({"E","P","I","C"} "ok","parcial" o "falla"), "puntos" (arreglo de {"ok": true|false, "regla", "por", "arreglo"}), "reescritura" ({"lineas":[3 textos],"titular"})}.',
  ].filter(Boolean).join('\n\n');

  const bruto = await generateText({ prompt, feature: 'constructor', tarea: 'auditoria' });
  const d = leerJson<Record<string, unknown>>(bruto);
  if (!d || typeof d !== 'object') throw new RespuestaIncompleta('La respuesta llegó incompleta. Toca de nuevo.');

  const re = (d.reescritura ?? {}) as Record<string, unknown>;
  const v = S(d.veredicto);
  return {
    veredicto: v === 'agenda' || v === 'mixto' || v === 'curiosos' ? v : '',
    resumen: S(d.resumen),
    veinte: S(d.veinte),
    epic: (d.epic && typeof d.epic === 'object' ? d.epic : {}) as Revision['epic'],
    puntos: (Array.isArray(d.puntos) ? d.puntos : []).map((x) => {
      const p = x as Record<string, unknown>;
      return { ok: !!p.ok, regla: S(p.regla), porque: S(p.por ?? p.porque), arreglo: S(p.arreglo) };
    }),
    reescritura: {
      lineas: (Array.isArray(re.lineas) ? re.lineas : []).map(S),
      titular: S(re.titular),
    },
  };
}

/* Re-exportados para que la pantalla importe de un solo lugar. */
export { OFERTAS, DESTINOS, VOCES };
