/**
 * EL PUENTE ENTRE LAS DOS APPS, PROBADO DE LOS DOS LADOS — turno 7
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * El puente es el único camino por el que un hecho de MiClínica —el cliente
 * cobró— entra a TCD. De él dependen dos cosas que el cliente ve:
 *
 *   · el Cinturón Rojo, que llega solo con el primer cobro;
 *   · el candado del día 31, que no deja encender pauta antes de vender.
 *
 * ═══ POR QUÉ ESTA PRUEBA EXISTE ═══
 *
 * Porque NADIE ejecutaba esta ruta. La batería de MCD mira su lado —que los
 * cinco campos del contrato no cambien de nombre—; la de TCD miraba sólo que
 * el Camino mencionara la palabra `mcd-bridge` en algún lado. El handler en sí
 * no lo había corrido ninguna prueba, ni una vez: se medía que el cable
 * estuviera enchufado, nunca que pasara corriente.
 *
 * Así que acá el handler DE VERDAD se ejecuta contra un MCD falso que decide
 * igual que el real —clave por header, 404 si el cliente no está, y los cinco
 * campos del contrato—, en las nueve formas en que la ida y vuelta puede
 * terminar.
 *
 * ═══ LA REGLA DE LA CASA ═══
 *
 * Cada lente se prueba contra su propio fallo: se reintroduce el defecto a
 * propósito y se confirma que la lente se pone roja. Una lente que nunca vio
 * el fallo que busca no es una lente, es un comentario.
 */
import { readFileSync } from 'node:fs';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

console.log('\n── el puente entre las dos apps ──');

/* ═══ EL MCD FALSO ═══
 *
 * Decide igual que `src/app/api/integrations/tcd/route.ts` del repo de MCD:
 * clave por el header `x-integration-key`, 404 si el email no está, y si está,
 * los cinco campos del contrato. `defecto` es la perilla con la que después se
 * rompe a propósito.
 */
const CLAVE = 'clave-compartida-de-prueba';
type Cobro = { paid_at: string | null; amount_usd: number };
let cobrosDelCliente: Cobro[] | null = [];     // null = el cliente no está en MCD
let defecto: 'ninguno' | 'clave-mala' | 'mcd-caido' | 'no-es-json' | 'reventar' = 'ninguno';
let ultimaLlamada: { url: string; headers: Record<string, string> } | null = null;

(globalThis as Record<string, unknown>).fetch = async (url: string, opciones: { headers: Record<string, string> }) => {
  ultimaLlamada = { url: String(url), headers: opciones?.headers ?? {} };
  if (defecto === 'mcd-caido') throw new Error('ECONNREFUSED');
  if (defecto === 'no-es-json') return { ok: true, json: async () => { throw new Error('vino HTML'); } };
  if (defecto === 'reventar') return { ok: false, status: 500, json: async () => ({}) };
  if (opciones?.headers?.['x-integration-key'] !== CLAVE || defecto === 'clave-mala') {
    return { ok: false, status: 401, json: async () => ({ error: 'No autorizado' }) };
  }
  if (!new URL(String(url)).searchParams.get('email')) {
    return { ok: false, status: 400, json: async () => ({ error: 'Falta ?email=' }) };
  }
  if (cobrosDelCliente === null) {
    return { ok: false, status: 404, json: async () => ({ error: 'Cliente no encontrado en MCD' }) };
  }
  const lista = cobrosDelCliente;
  return {
    ok: true,
    json: async () => ({
      email: 'cliente@mail.com',
      nombre: 'Dra. Prueba',
      cobros_verificados: lista.length,
      total_usd: lista.reduce((s, c) => s + c.amount_usd, 0),
      primer_cobro: lista[0]?.paid_at ?? null,
      cobros: lista,
    }),
  };
};

process.env.TCD_INTEGRATION_KEY = CLAVE;
process.env.MCD_BASE_URL = 'https://mcd-de-prueba.vercel.app';
const handler = (await import('../api/mcd-bridge')).default;

type Respuesta = { code: number; body: Record<string, unknown> };
async function pedir(query: Record<string, string>, method = 'GET'): Promise<Respuesta> {
  const r = { code: 0, body: {} as Record<string, unknown> };
  await handler(
    { method, query } as never,
    { status: (n: number) => ({ json: (b: unknown) => { r.code = n; r.body = b as Record<string, unknown>; return b; } }) } as never,
  );
  return r;
}

const UN_COBRO: Cobro[] = [{ paid_at: '2026-11-01T12:00:00Z', amount_usd: 150 }];

/* ═══ LAS LENTES ═══
 *
 * Cada una trae su `defecto`: la forma de romperla a propósito. Si con el
 * defecto puesto la lente sigue en verde, la lente no sirve y esto lo dice.
 */
type Lente = {
  nombre: string;
  mira: () => Promise<boolean>;
  /** La misma mirada, con el defecto que debería ponerla roja. */
  conSuFallo: () => Promise<boolean>;
};

const codigoDelPuente = readFileSync(new URL('../api/mcd-bridge.ts', import.meta.url), 'utf8');
const sinComentarios = codigoDelPuente
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

/** Prepara el estado y pide. Deja todo como estaba después. */
async function con(
  estado: { cobros?: Cobro[] | null; defecto?: typeof defecto; clave?: string },
  query: Record<string, string> = { email: 'cliente@mail.com' },
  method = 'GET',
) {
  const antesCobros = cobrosDelCliente, antesDefecto = defecto, antesClave = process.env.TCD_INTEGRATION_KEY;
  if ('cobros' in estado) cobrosDelCliente = estado.cobros!;
  if (estado.defecto) defecto = estado.defecto;
  if (estado.clave !== undefined) process.env.TCD_INTEGRATION_KEY = estado.clave;
  try { return await pedir(query, method); }
  finally { cobrosDelCliente = antesCobros; defecto = antesDefecto; process.env.TCD_INTEGRATION_KEY = antesClave; }
}

/** ¿La URL que salió lleva el email ya normalizado y escapado? */
function normalizado(url: string): boolean {
  if (url.includes(' ')) return false;        // el espacio del formulario, sin recortar
  if (!url.includes('%40')) return false;     // el @ crudo, no escapado
  return new URL(url).searchParams.get('email') === 'dra.perez+mcd@mail.com';
}

const LENTES: Lente[] = [
  /* ── 1 · El cobro llega, y el Rojo se dispara ── */
  {
    nombre: 'un cobro en MiClínica enciende el Cinturón Rojo en TCD',
    mira: async () => (await con({ cobros: UN_COBRO })).body.cobro_verificado === true,
    // El defecto: MCD no tiene a ese cliente. Si la lente igual da verde,
    // está leyendo cualquier cosa menos el cobro.
    conSuFallo: async () => (await con({ cobros: null })).body.cobro_verificado === true,
  },
  /* ── 2 · Los números viajan, no sólo el booleano ── */
  {
    nombre: 'el X/10 y el total en dólares cruzan el puente con su valor',
    mira: async () => {
      const b = (await con({ cobros: [...UN_COBRO, { paid_at: '2026-11-03T00:00:00Z', amount_usd: 350 }] })).body;
      return b.cobros_verificados === 2 && b.total_usd === 500;
    },
    conSuFallo: async () => {
      const b = (await con({ cobros: [] })).body;
      return b.cobros_verificados === 2 && b.total_usd === 500;
    },
  },
  /* ── 3 · Las dos mitades de la misma fila dicen lo mismo ──
   *
   * `cobros_verificados` cuenta filas; el Rojo miraba sólo `primer_cobro`. Una
   * fila sin fecha hacía que el contador dijera «2» y el cinturón «nunca
   * vendió». Hoy `paid_at` es `not null` y no puede pasar; el día que alguien
   * la vuelva nullable, esto tiene que seguir coincidiendo.
   */
  {
    nombre: 'un cobro sin fecha igual cuenta como cobro (el contador y el cinturón no se contradicen)',
    mira: async () => {
      const b = (await con({ cobros: [{ paid_at: null, amount_usd: 200 }] })).body;
      return b.cobro_verificado === true && b.cobros_verificados === 1;
    },
    conSuFallo: async () => {
      const b = (await con({ cobros: [] })).body;
      return b.cobro_verificado === true && b.cobros_verificados === 1;
    },
  },
  /* ── 4 · Sin cobros, nada se otorga ── */
  {
    nombre: 'sin ningún cobro, el Rojo NO se otorga',
    mira: async () => (await con({ cobros: [] })).body.cobro_verificado === false,
    conSuFallo: async () => (await con({ cobros: UN_COBRO })).body.cobro_verificado === false,
  },
  /* ── 5 · La clave mal puesta tiene NOMBRE PROPIO ──
   *
   * La lente que justifica el turno. Con la clave distinta en los dos
   * entornos, MCD contesta 401 y el cliente que vendió queda sin su cinturón y
   * con el día 31 trabado, para siempre y sin que nadie se entere. El 200 es a
   * propósito —MCD caído no rompe TCD—, pero el motivo tiene que poder leerse.
   */
  {
    nombre: 'la clave rechazada se puede distinguir de «no vendió»',
    mira: async () => {
      const b = (await con({ defecto: 'clave-mala' })).body;
      return b.cobro_verificado === false && b.mcd_status === 'clave_rechazada';
    },
    // El defecto: que el motivo del 401 se confunda con el de un cliente sano.
    conSuFallo: async () => {
      const b = (await con({ cobros: UN_COBRO })).body;
      return b.cobro_verificado === false && b.mcd_status === 'clave_rechazada';
    },
  },
  /* ── 6 · Y el éxito también dice que fue éxito ──
   *
   * Si el motivo viajara sólo cuando algo falla, un puente muerto y un puente
   * vivo se verían igual desde afuera: en los dos casos `cobro_verificado`
   * false y nada más. Con `'ok'` en la respuesta buena, un `curl` alcanza.
   */
  {
    nombre: 'el puente vivo se nota: contesta `mcd_status: ok`',
    mira: async () => (await con({ cobros: [] })).body.mcd_status === 'ok',
    conSuFallo: async () => (await con({ defecto: 'mcd-caido' })).body.mcd_status === 'ok',
  },
  /* ── 7 · El cliente que no está en MiClínica no es un error de clave ── */
  {
    nombre: 'el cliente que no está en MiClínica se nombra aparte',
    mira: async () => (await con({ cobros: null })).body.mcd_status === 'cliente_no_esta_en_mcd',
    conSuFallo: async () => (await con({ defecto: 'clave-mala' })).body.mcd_status === 'cliente_no_esta_en_mcd',
  },
  /* ── 8 · Sin clave en el entorno, se dice; no se adivina ── */
  {
    nombre: 'sin TCD_INTEGRATION_KEY, lo dice en vez de llamar a MCD en vano',
    mira: async () => (await con({ clave: '' })).body.mcd_status === 'sin_integration_key',
    conSuFallo: async () => (await con({ cobros: [] })).body.mcd_status === 'sin_integration_key',
  },
  /* ── 9 · MCD caído NO rompe TCD ──
   *
   * Las cinco formas de que el otro lado falle tienen que terminar en 200.
   * Un 500 acá deja al Dashboard sin dibujar y al Camino sin abrirse: MCD se
   * llevaría puesto a TCD.
   */
  {
    nombre: 'ningún fallo de MiClínica devuelve 5xx a TCD',
    mira: async () => {
      for (const d of ['clave-mala', 'mcd-caido', 'no-es-json', 'reventar'] as const) {
        if ((await con({ defecto: d })).code !== 200) return false;
      }
      return (await con({ cobros: null })).code === 200;
    },
    conSuFallo: async () => {
      // El defecto: tomar por buena una ruta que SÍ devuelve 4xx. Si la lente
      // no distingue el 200 del 405, no está mirando el código.
      const b = await con({ cobros: [] }, { email: 'cliente@mail.com' }, 'POST');
      return b.code === 200;
    },
  },
  /* ── 10 · El email se normaliza antes de cruzar ──
   *
   * MCD busca por email en minúsculas. Si TCD manda `Dra.Perez@Mail.com` tal
   * como vino del formulario, el cliente no aparece y el 404 se lee como «no
   * vendió».
   */
  {
    nombre: 'el email cruza en minúsculas, sin espacios y escapado',
    mira: async () => {
      await con({ cobros: UN_COBRO }, { email: '  Dra.Perez+mcd@Mail.com ' });
      return normalizado(ultimaLlamada!.url);
    },
    // El defecto: la ruta manda el email tal como vino del formulario, con sus
    // mayúsculas y su espacio. MCD busca en minúsculas y no lo encuentra.
    conSuFallo: async () => normalizado(
      'https://mcd-de-prueba.vercel.app/api/integrations/tcd?email=  Dra.Perez+mcd@Mail.com ',
    ),
  },
  /* ── 11 · La clave no se escribe en ningún log ──
   *
   * En la querystring queda en los logs de las dos plataformas, y de un log no
   * vuelve: una clave vista una vez obliga a rotarla en los dos entornos.
   */
  {
    nombre: 'la clave viaja sólo en el header, nunca en la URL',
    mira: async () => {
      await con({ cobros: UN_COBRO });
      return ultimaLlamada!.headers['x-integration-key'] === CLAVE
        && !ultimaLlamada!.url.includes(CLAVE)
        && !/integration_key=|key=/.test(ultimaLlamada!.url);
    },
    conSuFallo: async () => {
      const urlConLaClave = `https://x/api/integrations/tcd?email=a%40b.com&key=${CLAVE}`;
      return !urlConLaClave.includes(CLAVE) && !/key=/.test(urlConLaClave);
    },
  },
  /* ── 12 · Y no viaja en claro ──
   *
   * La clave va en un header, así que el canal es lo único que la tapa. Con
   * `http://` queda legible para cualquiera en el camino.
   */
  {
    nombre: 'el puente sale por https, también sin MCD_BASE_URL en el entorno',
    mira: async () => {
      await con({ cobros: UN_COBRO });
      const porDefecto = /MCD_BASE_URL\s*\?\?\s*'https:\/\//.test(sinComentarios);
      return ultimaLlamada!.url.startsWith('https://') && porDefecto;
    },
    conSuFallo: async () => /MCD_BASE_URL\s*\?\?\s*'https:\/\//.test("process.env.MCD_BASE_URL ?? 'http://mcd.vercel.app'"),
  },
  /* ── 13 · El contrato: los cinco nombres, escritos de los dos lados ──
   *
   * La batería de MCD cuida que su lado siga devolviendo estos cinco. Esta
   * cuida que este lado siga leyéndolos. Renombrar un campo en cualquiera de
   * los dos repos pone roja una de las dos baterías.
   */
  {
    nombre: 'los cinco campos del contrato con MiClínica siguen leyéndose acá',
    mira: async () => ['cobros_verificados', 'total_usd', 'primer_cobro', 'nombre', 'email']
      .every((c) => codigoDelPuente.includes(c)),
    conSuFallo: async () => ['cobros_verificados', 'total_usd', 'primer_cobro', 'nombre', 'email']
      .every((c) => 'const data = r.json() as { cobros: number }'.includes(c)),
  },
  /* ── 14 · El entorno se lee en cada pedido ──
   *
   * Estaba arriba del módulo: la clave quedaba fijada en el primer arranque
   * —rotarla exigía redeploy— y la ruta era imposible de ejecutar en una
   * prueba. Eso es, literalmente, por qué nadie la había corrido nunca.
   */
  {
    nombre: 'la clave se lee dentro del handler, no al cargar el módulo',
    mira: async () => {
      const arriba = sinComentarios.split('export default')[0];
      return !/process\.env\.TCD_INTEGRATION_KEY/.test(arriba)
        && /process\.env\.TCD_INTEGRATION_KEY/.test(sinComentarios.split('export default')[1] ?? '');
    },
    conSuFallo: async () => {
      const comoEstaba = "const KEY = process.env.TCD_INTEGRATION_KEY ?? '';\nexport default async function h() { return KEY; }";
      const arriba = comoEstaba.split('export default')[0];
      return !/process\.env\.TCD_INTEGRATION_KEY/.test(arriba);
    },
  },
  /* ── 15 · Quien usa el puente, lo usa de verdad ── */
  {
    nombre: 'el Camino y el Dashboard consultan el puente',
    mira: async () => {
      const rm = readFileSync(new URL('../src/pages/Roadmap.tsx', import.meta.url), 'utf8');
      const db = readFileSync(new URL('../src/pages/Dashboard.tsx', import.meta.url), 'utf8');
      return /mcd-bridge/.test(rm) && /cobro_verificado/.test(rm)
        && /mcd-bridge/.test(db) && /cobro_verificado/.test(db);
    },
    conSuFallo: async () => /mcd-bridge/.test('const r = await fetch("/api/numeros");'),
  },
];

/* ═══ CORRER LAS LENTES ═══ */
for (const l of LENTES) {
  let ok = false;
  try { ok = await l.mira(); } catch (e) { mal(`${l.nombre} — reventó: ${(e as Error).message}`); continue; }
  if (!ok) mal(l.nombre);
}

/* ═══ Y CORRER CADA LENTE CONTRA SU PROPIO FALLO ═══
 *
 * Con el defecto puesto tiene que dar FALSO. Si da verde, la lente mira otra
 * cosa que la que dice mirar, y eso es peor que no tenerla: da tranquilidad
 * sin dar cobertura.
 */
let ciegas = 0;
for (const l of LENTES) {
  let siguieraVerde = false;
  try { siguieraVerde = await l.conSuFallo(); } catch { siguieraVerde = false; }
  if (siguieraVerde) { ciegas += 1; mal(`la lente «${l.nombre}» NO ve su propio fallo`); }
}

if (!fallas) {
  console.log(`  ✓ ${LENTES.length} lentes sobre la ida y vuelta, cada una probada contra su propio fallo\n`);
} else {
  console.log(`  (${LENTES.length} lentes · ${ciegas} ciega(s))\n`);
}
process.exit(fallas ? 1 : 0);
