/**
 * LOS FRENOS DE ATENCIÓN.
 *
 * ═══ LA REGLA QUE LOS HACE FUNCIONAR ═══
 *
 * **Si aparecen siempre, dejan de frenar a nadie.** Un diálogo que sale en
 * cada clic se contesta sin leerlo en tres días, y a partir de ahí es peor que
 * no tenerlo: da una sensación de control que no existe.
 *
 * Por eso son **tres niveles y nada más**, y cada acción tiene que ganarse el
 * suyo. La pregunta para asignarlo no es «¿esto es importante?» —todo parece
 * importante— sino:
 *
 *   **¿Qué pasa si se hace por error?**
 *
 *   · Se deshace en un toque          → confirmar
 *   · Cuesta dinero o no se deshace   → escribir para confirmar
 *   · Le pasa a un tercero            → con testigo
 */

export type Nivel = 'confirmar' | 'escribir' | 'testigo';

export interface Freno {
  nivel: Nivel;
  /** El título del diálogo. Dice QUÉ va a pasar, no pregunta si está seguro. */
  titulo: string;
  /** Lo que hay que entender antes de seguir. */
  detalle: string;
  /** La palabra exacta, para el nivel «escribir». */
  palabra?: string;
  /** Para el nivel «testigo»: qué queda registrado y quién lo ve. */
  queda?: string;
}

/**
 * Las acciones que tienen freno. Si no está acá, no frena.
 *
 * La lista es corta a propósito: **cada freno nuevo le quita fuerza a los que
 * ya están.**
 */
export type AccionConFreno =
  | 'encender_campana'
  | 'subir_presupuesto'
  | 'dar_de_baja'
  | 'borrar_adn'
  | 'cambiar_precio'
  | 'tocar_metodo'
  | 'mandar_como_el'
  | 'avanzar_etapa'
  | 'apagar_anuncio';

export function frenoDe(
  accion: AccionConFreno,
  ctx: {
    nombreCliente?: string;
    monto?: number;
    quienDecide?: string;
  } = {},
): Freno {
  const quien = ctx.nombreCliente ?? 'este cliente';
  const monto = ctx.monto ?? 0;

  switch (accion) {
    // ── 🔴 ESCRIBIR: cuesta dinero o no se deshace ──────────────────────────
    case 'encender_campana':
      return {
        nivel: 'escribir',
        palabra: 'ENCENDER',
        titulo: `Vas a encender la campaña de ${quien} con $${monto} por semana.`,
        detalle:
          'El gasto empieza en este momento y no se recupera. Antes de seguir: '
          + '¿la cadena está probada de punta a punta, con un cobro de prueba real?',
      };

    case 'subir_presupuesto':
      return {
        nivel: 'escribir',
        palabra: 'SUBIR',
        titulo: `Vas a llevar el presupuesto de ${quien} a $${monto} por semana.`,
        detalle:
          'Subir el presupuesto reinicia el aprendizaje del algoritmo: los primeros '
          + 'días después de tocarlo rinden peor. Solo vale la pena si lo que está '
          + 'corriendo ya funciona.',
      };

    case 'dar_de_baja':
      return {
        nivel: 'escribir',
        palabra: 'BAJA',
        titulo: `Vas a dar de baja a ${quien}.`,
        detalle:
          'Pierde el acceso a todo lo que construyó. Antes: ¿se miró su cadena? '
          + 'Si se va porque no le funciona y había un cuello sin atender, eso no '
          + 'es una baja: es una falla de seguimiento.',
      };

    case 'borrar_adn':
      return {
        nivel: 'escribir',
        palabra: 'BORRAR',
        titulo: `Vas a borrar el ADN de ${quien}.`,
        detalle:
          'Es el trabajo de varias sesiones y no hay forma de recuperarlo. '
          + 'Todo lo que la app genera para él sale de ahí.',
      };

    // ── ⚫ TESTIGO: le pasa a un tercero ─────────────────────────────────────
    case 'cambiar_precio':
      return {
        nivel: 'testigo',
        titulo: `Vas a cambiar lo que ${quien} le cobra a sus pacientes.`,
        detalle:
          'El precio es una decisión de su negocio, no del nuestro. Si tienes un '
          + 'motivo, díselo antes de tocarlo.',
        queda: `Queda registrado con tu nombre, y ${quien} lo va a ver en su historial.`,
      };

    case 'tocar_metodo':
      return {
        nivel: 'testigo',
        titulo: `Vas a modificar el método de ${quien}.`,
        detalle:
          'El método es lo que vende. Cambiarlo sin él cambia lo que le promete a '
          + 'sus pacientes.',
        queda: `Queda registrado con tu nombre, y ${quien} lo va a ver.`,
      };

    case 'mandar_como_el':
      return {
        nivel: 'testigo',
        titulo: `Vas a publicar algo a nombre de ${quien}.`,
        detalle:
          'Lo van a leer sus pacientes como si lo hubiera escrito él. Si no estás '
          + 'seguro de que lo diría así, mejor mándaselo para que lo apruebe.',
        queda: `Queda registrado con tu nombre y con la fecha.`,
      };

    // ── 🟡 CONFIRMAR: se deshace ────────────────────────────────────────────
    case 'avanzar_etapa':
      return {
        nivel: 'confirmar',
        titulo: `De esta etapa no se sale sin cumplir su condición.`,
        detalle:
          '¿Confirmas que se cumplió de verdad, no que está por cumplirse?',
      };

    case 'apagar_anuncio':
      return {
        nivel: 'confirmar',
        titulo: 'Vas a apagar este anuncio.',
        detalle:
          'Si lleva menos de catorce días, todavía no hay datos suficientes para '
          + 'saber si funciona. ¿Seguro?',
      };
  }
}

/** ¿Lo que escribió alcanza para seguir? */
export function puedeSeguir(f: Freno, escrito: string): boolean {
  if (f.nivel !== 'escribir') return true;
  // Sin distinguir mayúsculas ni espacios de más: el freno es para que lea,
  // no para que teclee bien.
  return escrito.trim().toUpperCase() === (f.palabra ?? '').toUpperCase();
}

/**
 * Lo que queda registrado cuando el freno es de testigo.
 *
 * **El registro no es control: es que el que decide sepa que decide.** Y que
 * el cliente pueda ver quién tocó qué en su negocio.
 */
export interface Constancia {
  accion: AccionConFreno;
  quien: string;
  clienteId: string;
  cuando: string;
  detalle: string;
}

export function constanciaDe(
  accion: AccionConFreno,
  x: { quien: string; clienteId: string; detalle: string },
): Constancia {
  return { accion, ...x, cuando: new Date().toISOString() };
}

/** Cuántos frenos hay de cada nivel, para poder vigilar que no crezcan. */
export const TOPE_POR_NIVEL = { escribir: 5, testigo: 4, confirmar: 6 };
