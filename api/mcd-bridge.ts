/**
 * /api/mcd-bridge — EL PUENTE ENTRE LAS DOS APPS HERMANAS (lado TCD)
 *
 * El navegador no puede llamar a MCD directo (CORS entre dominios).
 * Esta ruta corre en el servidor de TCD y le pregunta a MCD por el estado
 * del cliente (¿tiene un cobro verificado? → el Cinturón Rojo llega solo).
 *
 * GET /api/mcd-bridge?email=cliente@mail.com
 * → { cobro_verificado: boolean, cobros_verificados: number, total_usd: number,
 *     mcd_status: 'ok' | 'sin_integration_key' | 'clave_rechazada' |
 *                 'cliente_no_esta_en_mcd' | 'mcd_caido' | number }
 *
 * Requiere en el entorno (Vercel de TCD):
 *   TCD_INTEGRATION_KEY  → la MISMA clave que en el entorno de MCD (auth del puente)
 *   MCD_BASE_URL         → opcional; por defecto https://mcd-eight.vercel.app
 *
 * ═══ POR QUÉ ESTA RUTA CONTESTA SIEMPRE 200 ═══
 *
 * MCD caído no debe romper TCD: el Camino tiene que seguir abriéndose y el
 * Dashboard tiene que seguir dibujándose. Así que cada fallo del puente se
 * traduce a «todavía no hay cobro» y la app sigue andando.
 *
 * ═══ Y POR QUÉ ESO OBLIGA A DECIR EL MOTIVO ═══
 *
 * Ese 200 es también la forma más fácil de quedarse ciego. Con la clave mal
 * puesta en cualquiera de los dos entornos, MCD contesta 401 y acá se ve
 * exactamente igual que un cliente que no vendió: el Cinturón Rojo no llega
 * nunca y el candado del día 31 no se abre nunca, en silencio y para siempre.
 * Por eso `mcd_status` viaja SIEMPRE —también cuando todo salió bien, con
 * `'ok'`— y los tres estados tienen nombre distinto: un `curl` a esta ruta
 * alcanza para saber si el puente está vivo, y no hace falta inventar
 * ninguna pantalla para verlo.
 *
 * El entorno se lee DENTRO del handler, no al cargar el módulo: leerlo arriba
 * fijaba la clave de por vida en el primer arranque y dejaba la ruta
 * imposible de probar —nada la ejecutó nunca, y por eso el turno 7 existió—.
 */
// Tipos mínimos (el proyecto no incluye @vercel/node — mismo estilo que las otras rutas)
type VercelRequest = { method?: string; query: Record<string, string | string[]> };
type VercelResponse = { status: (n: number) => { json: (b: unknown) => unknown } };

/** Lo que MCD devuelve en `/api/integrations/tcd`. Los cinco nombres del contrato. */
export type RespuestaDeMCD = {
  email?: string;
  nombre?: string;
  cobros_verificados?: number;
  total_usd?: number;
  primer_cobro?: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const email = String(req.query.email ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'EMAIL_REQUIRED' });

  const base = process.env.MCD_BASE_URL ?? 'https://mcd-eight.vercel.app';
  const clave = process.env.TCD_INTEGRATION_KEY ?? '';

  // Sin la clave, MCD responde 401 — avisamos claro en vez de fallar en silencio.
  if (!clave) {
    return res.status(200).json({ cobro_verificado: false, mcd_status: 'sin_integration_key' });
  }

  try {
    const r = await fetch(`${base}/api/integrations/tcd?email=${encodeURIComponent(email)}`, {
      headers: {
        Accept: 'application/json',
        // La clave va SOLO en el header: en la querystring quedaría escrita en
        // los logs de las dos plataformas.
        'x-integration-key': clave,
      },
    });
    if (!r.ok) {
      // 401 y 404 son dos problemas distintos y se arreglan en lugares
      // distintos: uno es la clave del entorno, el otro es un cliente que
      // todavía no tiene cuenta en MiClínica.
      const motivo =
        r.status === 401 ? 'clave_rechazada'
        : r.status === 404 ? 'cliente_no_esta_en_mcd'
        : r.status;
      return res.status(200).json({ cobro_verificado: false, mcd_status: motivo });
    }

    const data = (await r.json()) as RespuestaDeMCD;
    const cobros = Number(data?.cobros_verificados ?? 0);

    // El Rojo se dispara con el primer cobro. Y también si MCD cuenta cobros
    // sin fecha: el X/10 diría «2» y el cinturón «nunca vendió», los dos
    // leyendo la misma fila. Hoy no puede pasar —`paid_at` es `not null`—
    // pero el día que pase, las dos mitades tienen que decir lo mismo.
    return res.status(200).json({
      cobro_verificado: !!data?.primer_cobro || cobros > 0,
      cobros_verificados: Number.isFinite(cobros) ? cobros : 0,
      total_usd: Number(data?.total_usd ?? 0),
      primer_cobro: data?.primer_cobro ?? null,
      mcd_status: 'ok',
    });
  } catch {
    // MCD caído (o contestando algo que no es JSON) no debe romper TCD.
    return res.status(200).json({ cobro_verificado: false, mcd_status: 'mcd_caido' });
  }
}
