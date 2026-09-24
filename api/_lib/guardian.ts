/**
 * EL GUARDIÁN — un solo lugar decide si una llamada de IA puede salir.
 *
 * Existía la misma lógica de cobro escrita a mano en `generate.ts` y nada en
 * `stream.ts`, que es como se abrió el agujero: el chat de campañas usaba
 * streaming y no descontaba nada. Un canal de IA gratis e ilimitado.
 *
 * Ahora los dos endpoints llaman a esto. Si mañana aparece un tercero, la
 * lente 6.5 de auditoria.py lo obliga a pasar por acá también.
 */

import { consumeCreditServer, devolverCreditoServer } from './credits-server.js';
import { frenoDe, claveTopeDe, registrarUso, verificarTopeBlanco, TOPE_TOTAL_BLANCO } from './uso-server.js';
import { verificarTecho, registrarGasto, type PlanComercial } from './gasto-server.js';

export interface Veredicto {
  /** El plan del cliente, leído de la base (no de lo que dice el navegador). */
  plan?: PlanComercial;
  /** Cuánto lleva gastado en IA y cuánto puede. */
  gasto?: { usdHoy: number; usdMes: number; techoDia: number; techoMes: number };
  /** true = la llamada puede salir. */
  permitido: boolean;
  /** Qué freno se aplicó. */
  freno: 'credito' | 'tope' | null;
  /** Créditos que quedan, si el freno fue de crédito. */
  creditosRestantes?: number | null;
  /** Usos que quedan en la ventana, si el freno fue de tope. */
  usosRestantes?: number | null;
  /** Para devolverle al cliente cuando NO se permite. */
  error?: { codigo: string; mensaje: string; status: number };
}

/**
 * Aplica el freno que corresponda antes de gastar un token.
 *
 * Reglas que sostiene:
 *  - Sin userId no se cobra ni se cuenta. Es opt-in: un olvido del front
 *    nunca cobra de más; a lo sumo cobra de menos.
 *  - Quedarse sin crédito FRENA (el cliente compra más).
 *  - Pasarse del tope FRENA, pero con un mensaje que no suena a castigo.
 *  - Un fallo de infraestructura NUNCA frena: se loguea y se deja pasar.
 */
export async function guardarLlamada(
  userId: unknown,
  feature: unknown,
): Promise<Veredicto> {
  const uid = typeof userId === 'string' && userId ? userId : null;
  const freno = frenoDe(feature);

  if (!uid) {
    return { permitido: true, freno: null };
  }

  // ── El techo de gasto va PRIMERO y vale para todo ──
  // Antes que el crédito y antes que el tope: si la cuenta está quemando
  // dinero, da igual qué herramienta sea. Es el freno contra bucles y
  // scripts, no contra personas — los números están holgados a propósito.
  const techo = await verificarTecho(uid);
  if (!techo.permitido) {
    return {
      permitido: false,
      freno: null,
      plan: techo.plan,
      gasto: {
        usdHoy: techo.usdHoy, usdMes: techo.usdMes,
        techoDia: techo.techoDia, techoMes: techo.techoMes,
      },
      error: {
        codigo: techo.motivo === 'techo_dia' ? 'TECHO_DIARIO_IA' : 'TECHO_MENSUAL_IA',
        mensaje:
          techo.motivo === 'techo_dia'
            ? 'Llegaste al máximo de uso de inteligencia artificial por hoy. Se renueva mañana.'
            : 'Llegaste al máximo de uso de inteligencia artificial de este mes.',
        status: 429,
      },
    };
  }

  const datosGasto = {
    plan: techo.plan,
    gasto: {
      usdHoy: techo.usdHoy, usdMes: techo.usdMes,
      techoDia: techo.techoDia, techoMes: techo.techoMes,
    },
  };

  if (!freno) {
    return { permitido: true, freno: null, ...datosGasto };
  }

  // ── Herramientas de producción: cuestan crédito ──
  if (freno === 'credito') {
    try {
      const r = await consumeCreditServer(uid, { feature });
      return {
        permitido: true,
        freno: 'credito',
        creditosRestantes: r.monthlyRemaining + r.topup,
        ...datosGasto,
      };
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'INSUFFICIENT_CREDITS') {
        return {
          permitido: false,
          freno: 'credito',
          creditosRestantes: 0,
          error: {
            codigo: 'INSUFFICIENT_CREDITS',
            mensaje: 'Te quedaste sin créditos este mes. Se reponen el día 1.',
            status: 402,
          },
        };
      }
      // Un problema del cobro no puede tumbar la herramienta.
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[guardian] el cobro falló — se deja pasar:', msg, { uid, feature });
      return { permitido: true, freno: 'credito', creditosRestantes: null, ...datosGasto };
    }
  }

  // ── Acompañamiento: no cuesta crédito, pero tiene tope ──
  const clave = claveTopeDe(feature);
  if (!clave) return { permitido: true, freno: null, ...datosGasto };

  // El plan blanco tiene un total, no un semanal: son las 30 consultas que
  // promete la landing del $27. Se comprueba antes de contar el uso.
  const blanco = await verificarTopeBlanco(uid, clave);
  if (!blanco.permitido) {
    return {
      permitido: false, freno: 'tope', usosRestantes: 0, ...datosGasto,
      error: {
        codigo: 'TOPE_PLAN',
        mensaje: `Usaste tus ${TOPE_TOTAL_BLANCO} consultas con el Mentor. Para seguir, pasa al plan siguiente.`,
        status: 429,
      },
    };
  }

  const r = await registrarUso(uid, clave);
  if (!r.permitido) {
    return {
      permitido: false,
      freno: 'tope',
      usosRestantes: 0,
      error: {
        codigo: r.motivo === 'tope_dia' ? 'TOPE_DIARIO' : 'TOPE_SEMANAL',
        mensaje:
          r.motivo === 'tope_dia'
            ? 'Llegaste al máximo de consultas por hoy. Vuelve mañana.'
            : 'Llegaste al máximo de consultas de esta semana. Se renueva el lunes.',
        status: 429,
      },
    };
  }
  return { permitido: true, freno: 'tope', usosRestantes: r.restantes, ...datosGasto };
}


/**
 * Deshace el cobro cuando la llamada terminó sin entregar nada.
 *
 * Solo aplica al freno de crédito: los topes de uso NO se devuelven, porque
 * un intento fallido igual consumió atención del sistema y devolverlos
 * abriría la puerta a agotar la cuota provocando errores.
 */
export async function deshacerCobro(
  userId: unknown,
  veredicto: Veredicto,
  motivo: string,
): Promise<void> {
  if (veredicto.freno !== 'credito') return;
  if (veredicto.creditosRestantes == null) return; // no se llegó a cobrar
  const uid = typeof userId === 'string' && userId ? userId : null;
  if (!uid) return;
  await devolverCreditoServer(uid, motivo);
}


/**
 * Anota lo que costó una llamada que sí entregó.
 *
 * Va después del éxito, no antes: el techo se mide con lo que realmente se
 * gastó, no con lo que se pensaba gastar.
 */
export async function anotarCosto(
  userId: unknown,
  datos: {
    usd: number | null; modelo: string; tarea: string; feature?: unknown;
    verificado: boolean; ms?: number; ok?: boolean; error?: string | null;
  },
): Promise<void> {
  const uid = typeof userId === 'string' && userId ? userId : null;
  if (!uid) return;
  await registrarGasto(uid, {
    usd: datos.usd ?? 0,
    modelo: datos.modelo,
    tarea: datos.tarea,
    feature: typeof datos.feature === 'string' ? datos.feature : null,
    verificado: datos.verificado,
    ms: datos.ms,
    ok: datos.ok,
    error: datos.error ?? null,
  });
}
