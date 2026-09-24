/**
 * TECHO DE GASTO DE IA POR CLIENTE
 *
 * Esto NO está para racionar. El criterio del negocio es el contrario:
 * cuando hay que elegir entre un minuto de persona y una llamada de modelo,
 * siempre la llamada. Un mes de alguien del equipo cuesta más que toda la IA
 * de todos los clientes juntos.
 *
 * Está para dos cosas concretas:
 *   1. SABER cuánto cuesta cada cliente. Con ese número se decide el precio,
 *      no al revés.
 *   2. Que un bucle, un script o una cuenta comprometida no puedan quemar la
 *      cuenta de la API sin que nadie se entere.
 *
 * Por eso los techos están holgados y el freno de verdad es el DIARIO: un
 * error de programación gasta en horas, una persona trabajando gasta en
 * semanas.
 */

import { getAdminClient } from './credits-server.js';

export type PlanComercial = 'blanco' | 'amarillo' | 'verde' | 'negro' | 'completo';

/**
 * Techo mensual en dólares, por plan.
 *
 * Referencia para leerlos: generar los 3 anuncios completos cuesta unos $0,05
 * y un turno de chat unos $0,004. Con $30 al mes un cliente puede generar
 * cientos de piezas y conversar miles de veces. Si alguien llega a estos
 * números trabajando de verdad, el techo se sube — no se le corta.
 */
export const TECHO_MES_USD: Record<PlanComercial, number> = {
  blanco: 3,      // 21 días de acceso sobre una venta de $27
  amarillo: 15,   // legacy
  verde: 20,      // Tu Sistema, $497
  negro: 40,      // El Programa Completo, $997
  completo: 80,   // instalación acompañada, $5.000 y $10.000
};

/**
 * El techo diario es la quinta parte del mensual.
 *
 * Es el freno que de verdad importa: un bucle gasta el mes entero en una
 * tarde. Una persona trabajando nunca toca este número.
 */
export const FACTOR_DIA = 0.2;

/** Cuando no se conoce el plan, se asume el más chico. Nunca el más grande. */
const PLAN_POR_DEFECTO: PlanComercial = 'blanco';

const PLANES_VALIDOS = new Set<string>([
  'blanco', 'amarillo', 'verde', 'negro', 'completo',
]);

/** Caché por invocación: la misma función serverless no consulta dos veces. */
const cachePlan = new Map<string, PlanComercial>();

/**
 * Qué plan tiene el cliente, según la base.
 *
 * El servidor NO puede confiar en lo que diga el navegador: el plan decide
 * cuánto puede gastar. Hasta ahora el tope del plan blanco se aplicaba solo
 * del lado del cliente y se esquivaba borrando el almacenamiento local.
 */
export async function planDelUsuario(userId: string): Promise<PlanComercial> {
  const enCache = cachePlan.get(userId);
  if (enCache) return enCache;

  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('plan_comercial')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      console.warn('[gasto] no se pudo leer el plan:', error?.message ?? 'sin fila');
      return PLAN_POR_DEFECTO;
    }
    const p = String(data.plan_comercial ?? '');
    const plan = PLANES_VALIDOS.has(p) ? (p as PlanComercial) : PLAN_POR_DEFECTO;
    cachePlan.set(userId, plan);
    return plan;
  } catch (err) {
    console.warn('[gasto] error leyendo el plan:', err instanceof Error ? err.message : err);
    return PLAN_POR_DEFECTO;
  }
}

export interface EstadoGasto {
  permitido: boolean;
  plan: PlanComercial;
  usdHoy: number;
  usdMes: number;
  techoDia: number;
  techoMes: number;
  motivo?: 'techo_dia' | 'techo_mes';
  /** true = no se pudo medir (falta la tabla) y se dejó pasar. */
  sinMedir?: boolean;
}

/**
 * Mira cuánto lleva gastado y dice si puede seguir.
 *
 * NUNCA lanza y NUNCA frena por un problema de infraestructura: si la tabla
 * todavía no existe, deja pasar y lo escribe en el log. Un medidor a medio
 * instalar no puede dejar sin herramientas a un cliente que pagó.
 */
export async function verificarTecho(userId: string): Promise<EstadoGasto> {
  const plan = await planDelUsuario(userId);
  const techoMes = TECHO_MES_USD[plan];
  const techoDia = Number((techoMes * FACTOR_DIA).toFixed(2));

  try {
    const admin = getAdminClient();
    const { data, error } = await admin.rpc('gasto_ia_acumulado', { p_user_id: userId });
    if (error) {
      console.warn('[gasto] gasto_ia_acumulado no disponible — se deja pasar:', error.message);
      return { permitido: true, plan, usdHoy: 0, usdMes: 0, techoDia, techoMes, sinMedir: true };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const usdHoy = Number(row?.usd_hoy ?? 0);
    const usdMes = Number(row?.usd_mes ?? 0);

    if (usdHoy >= techoDia) {
      return { permitido: false, plan, usdHoy, usdMes, techoDia, techoMes, motivo: 'techo_dia' };
    }
    if (usdMes >= techoMes) {
      return { permitido: false, plan, usdHoy, usdMes, techoDia, techoMes, motivo: 'techo_mes' };
    }
    return { permitido: true, plan, usdHoy, usdMes, techoDia, techoMes };
  } catch (err) {
    console.warn('[gasto] no se pudo medir — se deja pasar:', err instanceof Error ? err.message : err);
    return { permitido: true, plan, usdHoy: 0, usdMes: 0, techoDia, techoMes, sinMedir: true };
  }
}

/**
 * Anota una llamada de IA: la que salió bien Y la que falló.
 *
 * Las fallas se anotan con usd en cero y `ok: false`. Son las más útiles del
 * panel: un modelo que falla el 30% de las veces no se nota en la factura,
 * se nota en clientes que tocan el botón y no pasa nada.
 *
 * Se anota aunque el precio sea estimado: es preferible un número aproximado
 * y marcado como tal que no tener ninguno.
 */
export interface LlamadaAnotada {
  usd: number;
  modelo: string;
  tarea: string;
  feature?: string | null;
  verificado: boolean;
  /** Cuánto tardó, de punta a punta. */
  ms?: number;
  /** false = la llamada no entregó nada. */
  ok?: boolean;
  /** Qué pasó, cuando no salió bien. */
  error?: string | null;
}

export async function registrarGasto(
  userId: string,
  datos: LlamadaAnotada,
): Promise<void> {
  if (!userId) return;
  const usd = Number.isFinite(datos.usd) && datos.usd > 0 ? datos.usd : 0;
  const ok = datos.ok !== false;
  // Una llamada sin costo y exitosa no aporta nada al panel.
  if (usd === 0 && ok && !datos.ms) return;
  try {
    const admin = getAdminClient();
    const { error } = await admin.from('gasto_ia').insert({
      user_id: userId,
      usd,
      modelo: datos.modelo,
      tarea: datos.tarea,
      feature: datos.feature ?? null,
      precio_verificado: datos.verificado,
      ms: Number.isFinite(datos.ms) ? Math.round(datos.ms as number) : null,
      ok,
      error: datos.error ? String(datos.error).slice(0, 300) : null,
    });
    if (error) console.warn('[gasto] no se pudo anotar:', error.message);
  } catch (err) {
    console.warn('[gasto] error anotando:', err instanceof Error ? err.message : err);
  }
}
