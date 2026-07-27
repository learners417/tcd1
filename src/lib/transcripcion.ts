/**
 * LAS TRANSCRIPCIONES — que cada sesión la herede el equipo.
 *
 * El problema que resuelve: después de cada sesión, lo que se dijo **vive en
 * la cabeza de quien la dio**. El que sigue no sabe qué se acordó, el cliente
 * vuelve a explicar lo mismo, y quien dio la sesión se vuelve necesario para
 * siempre. Es lo que hace que una persona no pueda salir de la operación.
 *
 * SE EXTRAEN TRES COSAS Y SOLO TRES:
 *
 *   1. **Qué se decidió** — va al registro de decisiones.
 *   2. **Qué queda pendiente y de quién** — se convierte en tarea con dueño.
 *   3. **Qué cambió en su situación** — actualiza su ficha.
 *
 * Tres y no diez a propósito. Un resumen largo no se lee, y lo que no se lee
 * no se hereda. Si algo no entra en esas tres, era conversación.
 *
 * NADA SE GUARDA SIN QUE UN HUMANO LO CONFIRME. La app propone, quien cargó
 * la sesión corrige. Una transcripción mal leída que se guarda sola es peor
 * que no tenerla: se vuelve un dato falso con apariencia de registro.
 */

export interface Pendiente {
  que: string;
  /** De quién: el cliente, el equipo, o quien dio la sesión. */
  dueno: 'cliente' | 'equipo' | 'sin_asignar';
  /** Para cuándo, si se dijo. */
  cuando?: string;
}

export interface Extraccion {
  decisiones: string[];
  pendientes: Pendiente[];
  cambios: string[];
  /** Lo que ve el cliente: dos o tres líneas de lo acordado. */
  resumenParaElCliente: string;
  /** true = el modelo no pudo leer la transcripción. */
  vacia: boolean;
}

export const EXTRACCION_VACIA: Extraccion = {
  decisiones: [], pendientes: [], cambios: [],
  resumenParaElCliente: '', vacia: true,
};

/** Menos que esto no es una sesión: es una nota. */
export const MINIMO_CARACTERES = 200;

/**
 * El prompt.
 *
 * Va a la tarea `estructura` del enrutador —Haiku, temperatura cero— porque
 * no necesita voz: necesita obedecer un esquema y NO INVENTAR. Lo que se
 * inventa acá termina en el registro de decisiones del negocio.
 */
export function promptDeExtraccion(transcripcion: string, nombreCliente: string): string {
  return `Esta es la transcripción de una sesión de acompañamiento con ${nombreCliente}.

TU TRABAJO: extraer TRES cosas y solo tres. Nada más.

1. DECISIONES — lo que se resolvió y queda firme. No lo que se conversó:
   lo que se DECIDIÓ. Si no se decidió nada, la lista va vacía.
2. PENDIENTES — lo que queda por hacer, con quién lo hace ("cliente" si lo
   hace él, "equipo" si lo hace el acompañamiento, "sin_asignar" si no quedó
   claro) y para cuándo si se dijo.
3. CAMBIOS — qué cambió en su situación: su método, su precio, su oferta, su
   momento. Solo si cambió algo. Si no cambió nada, lista vacía.

REGLAS QUE NO SE ROMPEN:
- NO inventes. Si algo no está en la transcripción, no está.
- NO interpretes intenciones. "Dijo que le gustaría" NO es una decisión.
- Cada punto, UNA línea corta. Lo que no entra en una línea era conversación.
- Castellano neutro, de tú. Sin adornos.
- Si la transcripción no tiene nada extraíble, devuelve las tres listas vacías.

Y además: un RESUMEN PARA EL CLIENTE de dos o tres líneas, escrito para él
—no para el equipo—, con lo que acordaron. Empieza por lo que él tiene que
hacer.

Responde SOLO este JSON, sin markdown ni explicaciones:
{"decisiones":["..."],"pendientes":[{"que":"...","dueno":"cliente|equipo|sin_asignar","cuando":"..."}],"cambios":["..."],"resumenParaElCliente":"..."}

TRANSCRIPCIÓN:
${transcripcion.slice(0, 24000)}`;
}

const DUENOS = new Set(['cliente', 'equipo', 'sin_asignar']);

/**
 * Lee la respuesta del modelo.
 *
 * Tolera que venga envuelta en texto o en un bloque de código: los modelos
 * lo hacen, y perder una extracción entera por unas comillas de más sería
 * tirar el trabajo de la sesión.
 */
export function leerExtraccion(bruto: string): Extraccion {
  const texto = String(bruto ?? '').trim();
  if (!texto) return EXTRACCION_VACIA;

  // El primer { hasta el último }: se ignora lo que el modelo diga alrededor.
  const i = texto.indexOf('{');
  const j = texto.lastIndexOf('}');
  if (i < 0 || j <= i) return EXTRACCION_VACIA;

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(texto.slice(i, j + 1)) as Record<string, unknown>;
  } catch {
    return EXTRACCION_VACIA;
  }

  const lista = (v: unknown): string[] =>
    Array.isArray(v)
      ? v.map((x) => String(x ?? '').trim()).filter((x) => x.length > 3).slice(0, 12)
      : [];

  const pendientes: Pendiente[] = Array.isArray(obj.pendientes)
    ? obj.pendientes
        .map((p) => {
          const o = (p ?? {}) as Record<string, unknown>;
          const que = String(o.que ?? '').trim();
          const d = String(o.dueno ?? '').trim();
          return {
            que,
            dueno: (DUENOS.has(d) ? d : 'sin_asignar') as Pendiente['dueno'],
            cuando: o.cuando ? String(o.cuando).trim().slice(0, 40) : undefined,
          };
        })
        .filter((p) => p.que.length > 3)
        .slice(0, 12)
    : [];

  const decisiones = lista(obj.decisiones);
  const cambios = lista(obj.cambios);
  const resumen = String(obj.resumenParaElCliente ?? '').trim();

  return {
    decisiones, pendientes, cambios,
    resumenParaElCliente: resumen,
    vacia: decisiones.length === 0 && pendientes.length === 0 && cambios.length === 0,
  };
}

/** ¿Vale la pena mandar esto a extraer? */
export function puedeExtraerse(transcripcion: string): { puede: boolean; porque?: string } {
  const t = (transcripcion ?? '').trim();
  if (t.length === 0) return { puede: false, porque: 'Pega la transcripción de la sesión.' };
  if (t.length < MINIMO_CARACTERES) {
    return {
      puede: false,
      porque: `Son ${t.length} caracteres. Menos de ${MINIMO_CARACTERES} no es una sesión: es una nota. Escríbela directo en la ficha.`,
    };
  }
  return { puede: true };
}

/**
 * Cuánto de la sesión quedó registrado.
 *
 * Sirve para una cosa sola: que quien cargó vea si vale la pena revisar el
 * resultado o si el modelo no entendió nada y conviene escribirlo a mano.
 */
export function resumirExtraccion(e: Extraccion): string {
  if (e.vacia) return 'No se pudo sacar nada en limpio. Escríbelo a mano.';
  const partes = [
    e.decisiones.length && `${e.decisiones.length} ${e.decisiones.length === 1 ? 'decisión' : 'decisiones'}`,
    e.pendientes.length && `${e.pendientes.length} ${e.pendientes.length === 1 ? 'pendiente' : 'pendientes'}`,
    e.cambios.length && `${e.cambios.length} ${e.cambios.length === 1 ? 'cambio' : 'cambios'}`,
  ].filter(Boolean);
  return `${partes.join(' · ')}. Revísalo antes de guardar.`;
}
