/**
 * LAS FUNCIONES — y si cada una se está reduciendo.
 *
 * ═══ EL OBJETIVO QUE ESTO MIDE ═══
 *
 * El gradiente de tickets ES el modelo de negocio: el de $1.000 usa la app
 * sola y **tiene que costar cero minutos de humano**; el de $5.000 los usa
 * porque los compró. De ahí sale el único objetivo que importa:
 *
 *   **Que los minutos de humano por cliente bajen mes a mes, con más clientes.**
 *
 * ═══ POR QUÉ NO ALCANZA EL TOTAL ═══
 *
 * La app ya medía los minutos por cliente en total. Y en total no sirve para
 * decidir nada: si bajaron de 44 a 38, **¿fue porque una instalación terminó
 * o porque un aviso automático destrabó tres cuentas?** La primera es
 * aritmética. La segunda es que el negocio escaló.
 *
 * Por eso se mide POR FUNCIÓN, y cada función tiene un DESTINO declarado:
 * una que debe reducirse y no se reduce en seis meses es una que nadie está
 * atacando.
 */

export type Funcion =
  | 'criterio' | 'instalacion' | 'destrabar'
  | 'absorber' | 'producir' | 'cobrar';

/** Qué le tiene que pasar a los minutos de esta función con el tiempo. */
export type Destino = 'permanente' | 'debe_morir' | 'debe_encogerse' | 'crece';

export interface DefinicionFuncion {
  id: Funcion;
  nombre: string;
  /** Qué pasa si nadie la hace. Es lo que la define como función. */
  siNadie: string;
  destino: Destino;
  /** Por qué ese destino. Se escribe para que nadie lo afloje sin pensar. */
  porQue: string;
}

export const FUNCIONES: Record<Funcion, DefinicionFuncion> = {
  criterio: {
    id: 'criterio', nombre: 'Criterio',
    siNadie: 'Cada decisión se vuelve a discutir y todo pasa por una sola persona.',
    destino: 'permanente',
    porQue: 'Ninguna app decide qué vendemos, a qué precio y a quién. Si lo decidiera, dejaría de ser tu negocio.',
  },
  instalacion: {
    id: 'instalacion', nombre: 'Instalación',
    siNadie: 'Nadie enciende nunca.',
    destino: 'debe_morir',
    porQue: 'Cada ítem que se explica bien en un tutorial es un ítem que el cliente hace solo. Y la instalación TERMINA: cuando enciende, ese trabajo se acabó.',
  },
  destrabar: {
    id: 'destrabar', nombre: 'Destrabar cuentas',
    siNadie: 'Las cuentas se frenan sin que nadie lo note.',
    destino: 'debe_encogerse',
    porQue: 'Cada situación con criterio escrito pasa a ser un aviso automático. Nunca llega a cero —siempre hay excepciones— pero cada mes tiene que ser menos.',
  },
  absorber: {
    id: 'absorber', nombre: 'Absorber',
    siNadie: 'Los minutos no bajan nunca y el modelo deja de escalar.',
    destino: 'crece',
    porQue: 'Su único producto es que las otras bajen. Si sus minutos suben y los de las demás también, está construyendo lo que no hace falta.',
  },
  producir: {
    id: 'producir', nombre: 'Producir material',
    siNadie: 'Los tickets altos no reciben lo que pagaron.',
    destino: 'debe_encogerse',
    porQue: 'La app ya genera el copy y las imágenes. Lo que queda humano es editar video, y eso se encoge por ticket, no a cero.',
  },
  cobrar: {
    id: 'cobrar', nombre: 'Cobrar y dar acceso',
    siNadie: 'Se vende y no se cobra.',
    destino: 'debe_morir',
    porQue: 'El webhook de pago ya provisiona el plan solo. Lo que queda es la excepción.',
  },
};

/** Los minutos que cuesta cada cosa. Los mismos que usa el techo de carga. */
export const MINUTOS_POR: Record<string, { minutos: number; funcion: Funcion }> = {
  excepcion:    { minutos: 20, funcion: 'destrabar' },
  sesion:       { minutos: 45, funcion: 'criterio' },
  instalacion:  { minutos: 30, funcion: 'instalacion' },
  produccion:   { minutos: 60, funcion: 'producir' },
  desarrollo:   { minutos: 60, funcion: 'absorber' },
  cobro:        { minutos: 10, funcion: 'cobrar' },
};

// ── Los hitos de absorción ─────────────────────────────────────────────────

/**
 * Lo que dejó de necesitar una persona.
 *
 * ═══ LA DECISIÓN DE DISEÑO QUE IMPORTA ═══
 *
 * La app puede medir los minutos sola, pero **no puede saber por qué bajaron**.
 * Así que quien absorbe algo lo DECLARA: «esto dejó de necesitar humano, y
 * estimo que ahorra tantos minutos por semana».
 *
 * Y acá está lo valioso: **la declaración se verifica contra la realidad.** Si
 * desarrollo declara 40 minutos ahorrados por semana y los minutos de esa
 * función no bajaron, la declaración estaba mal — y saberlo vale más que el
 * número.
 *
 * Sin esta verificación, «lo automatizamos» es una frase. Con ella, es un dato.
 */
export interface HitoDeAbsorcion {
  id: string;
  /** Qué dejó de necesitar humano. */
  que: string;
  /** De qué función salieron esos minutos. */
  funcion: Funcion;
  /** Cuántos minutos por semana estima quien lo hizo. */
  minutosEstimados: number;
  /** Cuándo entró en producción. */
  desde: string;
  /** Quién lo declaró. */
  porQuien: string;
}

export interface MinutosDeFuncion {
  funcion: Funcion;
  nombre: string;
  destino: Destino;
  /** Minutos de esta semana. */
  minutos: number;
  /** Por cliente activo. */
  porCliente: number;
  /** Contra el promedio de las cuatro semanas anteriores. */
  cambio: number | null;
  /** La lectura: si el cambio va en la dirección del destino. */
  lectura: string;
  /** true = va en contra de su destino y hay que mirarlo. */
  alerta: boolean;
  /** Lo que se declaró que la bajó. */
  hitos: HitoDeAbsorcion[];
}

/** Menos de esto es ruido, no tendencia. */
export const CAMBIO_SIGNIFICATIVO = 0.1;

export interface ObservacionFuncion {
  funcion: Funcion;
  minutos: number;
}

/**
 * La tabla de la semana: cada función con su cambio y su lectura.
 *
 * La lectura no es el número: es **si ese número va en la dirección del
 * destino de la función.** Que instalación baje es la noticia esperada. Que
 * baje «absorber» es una mala noticia disfrazada de buena.
 */
export function tablaDeFunciones(x: {
  estaSemana: ObservacionFuncion[];
  semanasAnteriores: ObservacionFuncion[][];
  clientesActivos: number;
  hitos: HitoDeAbsorcion[];
}): MinutosDeFuncion[] {
  const suma = (obs: ObservacionFuncion[], f: Funcion) =>
    obs.filter((o) => o.funcion === f).reduce((t, o) => t + o.minutos, 0);

  return (Object.keys(FUNCIONES) as Funcion[]).map((f) => {
    const def = FUNCIONES[f];
    const minutos = suma(x.estaSemana, f);

    // El promedio de las anteriores, para que una semana rara no dispare nada.
    const previas = x.semanasAnteriores.map((s) => suma(s, f));
    const promedio = previas.length > 0
      ? previas.reduce((a, b) => a + b, 0) / previas.length
      : null;

    const cambio = promedio !== null && promedio > 0
      ? (minutos - promedio) / promedio
      : null;

    const porCliente = x.clientesActivos > 0
      ? Math.round(minutos / x.clientesActivos)
      : 0;

    const hitos = x.hitos.filter((h) => h.funcion === f);
    const { lectura, alerta } = leer(def, minutos, cambio, hitos);

    return {
      funcion: f, nombre: def.nombre, destino: def.destino,
      minutos, porCliente, cambio, lectura, alerta, hitos,
    };
  });
}

function leer(
  def: DefinicionFuncion,
  minutos: number,
  cambio: number | null,
  hitos: HitoDeAbsorcion[],
): { lectura: string; alerta: boolean } {
  if (minutos === 0) {
    return def.destino === 'crece'
      // Una función que debe crecer y está en cero es la peor noticia de todas.
      ? { lectura: 'Nadie trabajó en absorber esta semana. Nada va a bajar el mes que viene.', alerta: true }
      : { lectura: 'Sin minutos esta semana.', alerta: false };
  }

  if (cambio === null) {
    return { lectura: 'Primera semana medida. La que viene se puede comparar.', alerta: false };
  }

  const pct = Math.round(Math.abs(cambio) * 100);
  const bajo = cambio < -CAMBIO_SIGNIFICATIVO;
  const subio = cambio > CAMBIO_SIGNIFICATIVO;

  // Lo declarado, para poder verificarlo contra la realidad.
  const declarado = hitos.reduce((t, h) => t + h.minutosEstimados, 0);

  switch (def.destino) {
    case 'permanente':
      if (subio) return {
        lectura: `Subió ${pct}%. Aparecieron situaciones sin criterio escrito — eso es información, no un problema. Si sube tres meses seguidos, el criterio no se está escribiendo.`,
        alerta: false,
      };
      return { lectura: bajo ? `Bajó ${pct}%: más criterio ya está escrito.` : 'Estable.', alerta: false };

    case 'crece':
      if (bajo) return {
        lectura: `Bajó ${pct}%. Es la única función que debería subir: si nadie construye, nada baja el mes que viene.`,
        alerta: true,
      };
      return { lectura: subio ? `Subió ${pct}%. Bien: es la que se come a las otras.` : 'Estable.', alerta: false };

    default: {
      // debe_morir y debe_encogerse
      if (bajo) {
        if (declarado > 0) {
          return {
            lectura: `Bajó ${pct}%, y hay ${hitos.length} ${hitos.length === 1 ? 'hito declarado' : 'hitos declarados'} que lo explican. Esto no es haber trabajado menos: es haber construido algo.`,
            alerta: false,
          };
        }
        return {
          lectura: `Bajó ${pct}%, pero nadie declaró qué lo bajó. Puede ser que una instalación terminó — eso es aritmética, no escala.`,
          alerta: false,
        };
      }
      if (subio) {
        return {
          lectura: `Subió ${pct}% y esta función tiene que reducirse. Mirá qué se repite: eso es lo que hay que absorber.`,
          alerta: true,
        };
      }
      if (declarado > 0) {
        // La verificación que hace que la declaración valga.
        return {
          lectura: `Se declararon ${declarado} minutos ahorrados por semana y los minutos NO bajaron. La estimación estaba mal, o lo absorbido no era lo que consumía tiempo.`,
          alerta: true,
        };
      }
      return { lectura: 'Estable. Nada la está bajando.', alerta: true };
    }
  }
}

/** La frase de arriba de la reunión. Una sola pregunta. */
export function tituloDeLaSemana(tabla: MinutosDeFuncion[]): string {
  const bajaron = tabla.filter(
    (t) => (t.destino === 'debe_morir' || t.destino === 'debe_encogerse')
      && (t.cambio ?? 0) < -CAMBIO_SIGNIFICATIVO);
  const conHito = bajaron.filter((t) => t.hitos.length > 0);
  const alertas = tabla.filter((t) => t.alerta);

  if (conHito.length > 0) {
    return `${conHito.map((t) => t.nombre).join(' y ')} bajó porque se construyó algo. Eso es el negocio escalando.`;
  }
  if (bajaron.length > 0) {
    return `${bajaron.map((t) => t.nombre).join(' y ')} bajó, pero nadie declaró por qué. Averígualo antes de festejarlo.`;
  }
  if (alertas.length > 0) {
    return `Ninguna función bajó sus minutos este mes. ${alertas.length === 1 ? 'Hay una que hay que mirar' : `Hay ${alertas.length} para mirar`}.`;
  }
  return 'Todo estable. Nada empeoró y nada mejoró.';
}

// ── El gradiente por cliente ───────────────────────────────────────────────

/** Cuántos minutos de humano permite cada ticket, por mes. */
export const MINUTOS_QUE_PERMITE: Record<string, number> = {
  mil: 0,
  dos_mil: 30,
  cinco_mil: 240,
  diez_mil: 480,
};

export interface DeudaDeCliente {
  clienteId: string;
  nombre: string;
  ticket: string;
  minutos: number;
  permitidos: number;
  /** Los minutos de más. Es deuda de la función que absorbe. */
  exceso: number;
  /** La frase que convierte el exceso en tarea. */
  lectura: string;
}

/**
 * Cuánto cuesta cada cliente contra lo que su ticket permite.
 *
 * Esto es lo que convierte un exceso en **una tarea concreta para la función
 * que absorbe**, en vez de en una queja sobre el cliente. Un cliente de $1.000
 * que consume dieciocho minutos no es un cliente pesado: es una deuda técnica
 * con nombre.
 */
export function deudaPorCliente(
  clientes: Array<{ id: string; nombre: string; ticket: string; minutos: number }>,
): DeudaDeCliente[] {
  return clientes
    .map((c) => {
      const permitidos = MINUTOS_QUE_PERMITE[c.ticket] ?? 240;
      const exceso = Math.max(0, c.minutos - permitidos);
      let lectura: string;
      if (exceso === 0) {
        lectura = permitidos === 0
          ? 'Cuesta cero, como tiene que ser.'
          : `Dentro de lo que su ticket permite.`;
      } else if (permitidos === 0) {
        lectura = `Un cliente de este ticket debería costar cero. Estos ${exceso} minutos son deuda que absorber tiene que pagar.`;
      } else {
        lectura = `${exceso} minutos más de lo que su ticket permite. Mirá qué se repite con él.`;
      }
      return { clienteId: c.id, nombre: c.nombre, ticket: c.ticket, minutos: c.minutos, permitidos, exceso, lectura };
    })
    // Primero la deuda más grande: es donde absorber rinde más.
    .sort((a, b) => b.exceso - a.exceso);
}
