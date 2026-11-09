/**
 * EL RECORRIDO DEL QUE PAGA LA ENTRADA Y SUBE A LA BASE — turno 8
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * La única cadena automática que convierte a un desconocido en cliente, y
 * después en cliente de $1.000, sin que nadie del equipo toque nada:
 *
 *   GHL cobra la entrada  →  /api/alta-numero   →  entra y hace sus 5 días
 *   GHL cobra La Base     →  /api/ghl-webhook   →  se le abre hasta el día 12
 *
 * Si un eslabón escribe mal una columna, no hay error en ninguna pantalla: el
 * cliente entra, ve algo, y lo que ve está mal de un lado o del otro. O se le
 * regala el programa entero, o pagó y sigue trabado.
 *
 * ═══ POR QUÉ ESTA PRUEBA EXISTE ═══
 *
 * Porque NADIE ejecutaba estas dos rutas. Lo que las miraba era grep sobre su
 * propio texto —la lente 6.54 y la 7.3 de `auditoria.py` buscan la cadena
 * `"from('profiles').select('id').eq('email'"` dentro del archivo— y
 * `prueba-sube-de-escalon.ts`, que **replica a mano** lo que el webhook
 * supuestamente escribe:
 *
 *     const yaPago = { plan_comercial: 'amarillo', servicio_contratado: 'base' };
 *
 * Esa línea es una copia, no una medición: si el webhook escribiera otra cosa,
 * esa prueba seguiría verde para siempre. Es el mismo agujero que el turno 7
 * encontró en el puente —se medía que el cable estuviera enchufado, nunca que
 * pasara corriente— y acá costaba más, porque esta cadena es la venta.
 *
 * Así que los dos handlers DE VERDAD se ejecutan contra un Supabase falso que
 * decide como el real: su PostgREST con `eq` sensible a mayúsculas, su GoTrue,
 * el trigger `on_auth_user_created` de `fix-supabase.sql` estampando su
 * `plan = 'DWY'` en cada perfil nuevo, y `servicio_contratado not null default
 * 'base'` como lo dejó la migración del 4 de noviembre. Y lo que queda escrito
 * en la fila se lee con las MISMAS funciones que lee la app.
 *
 * ═══ LO QUE ENCONTRÓ AL EJECUTARSE ═══
 *
 *   1. El que pagaba la entrada se llevaba los 90 días GRATIS. El trigger
 *      escribe `plan = 'DWY'` en el instante en que se crea el usuario, y el
 *      alta se abstenía de pisarlo —«un cliente DWY que compra la entrada
 *      sigue siendo DWY»—. Ese resguardo era para el cliente viejo y le caía
 *      a TODOS los nuevos: `planDe('DWY')` devuelve 'completo', que son 99
 *      pilares. No quedaba nada que venderle a $1.000.
 *   2. El pago escribía el QUÉ y no el CUÁNDO. `servicio_contratado` sin
 *      `servicio_marcado_el` deja el tope del escalón apagado —así está
 *      escrito en `topeDelEscalon`, a propósito— así que el de La Base abría
 *      los 90 días, la puerta de su primera etapa no aparecía nunca y las
 *      entregas del equipo no se disparaban para el de La Instalación.
 *   3. Un pago podía BAJARLE el acceso a quien ya había pagado más arriba.
 *      `plan_comercial` y `acceso_hasta` se pisaban sin mirar qué había: un
 *      webhook viejo con `plan: "blanco"` dejaba al de $3.000 con los 5 días
 *      y un vencimiento a 21.
 *   4. El perfil que crea el alta no guardaba su email, que es justo la
 *      columna por la que el webhook del pago busca al cliente después.
 *   5. El entorno se leía al cargar el módulo: la clave quedaba fijada en el
 *      primer arranque y la ruta era imposible de ejecutar en una prueba.
 *      Es, otra vez, por qué nadie la había corrido.
 *
 * ═══ LA REGLA DE LA CASA ═══
 *
 * Cada lente se prueba contra su propio fallo: se reintroduce el defecto a
 * propósito —acá, corriendo la lógica VIEJA del handler contra la misma base
 * falsa— y se confirma que la lente se pone roja. Una lente que nunca vio el
 * fallo que busca no es una lente, es un comentario.
 *
 * Correr con: npx tsx scripts/prueba-el-recorrido-del-que-paga.ts
 */
import { readFileSync } from 'node:fs';
import { planDe, planPermitePilar, enElTramoDelNumero, diasRestantes, accesoVencido, PILAR_MAX } from '../src/lib/planes';
import { servicioDe } from '../src/lib/cuadroTickets';
import { laOfertaTrasElAcceso } from '../src/lib/laOfertaQueSigue';
import { entraEnElEscalon, puertaDelEscalon, leTocanLasEntregas, ULTIMO_DIA_DE_BASE } from '../src/lib/topeDelEscalon';
import type { Profile } from '../src/lib/supabase';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

console.log('\n── el recorrido del que paga la entrada y sube a La Base ──');

/* ════════════════════════════════════════════════════════════════════════
 * EL SUPABASE FALSO
 *
 * Decide como el real, en las tres cosas que importan acá:
 *
 *   · PostgREST: `email=eq.x` es un `=` de SQL, o sea SENSIBLE a mayúsculas.
 *   · GoTrue: crear un usuario dispara `on_auth_user_created`, que inserta el
 *     perfil con `plan = 'DWY'` y `ON CONFLICT (id) DO NOTHING`
 *     (`fix-supabase.sql`, líneas 75-98).
 *   · La tabla: `servicio_contratado` es `not null default 'base'`
 *     (`20261104_las_columnas_que_el_candado_lee.sql`).
 *
 * No se simula más que eso. Lo que no está no hace falta para esta cadena.
 * ════════════════════════════════════════════════════════════════════════ */

type Fila = Record<string, unknown>;
const HOY = new Date().toISOString().slice(0, 10);

const base = {
  usuarios: [] as Array<{ id: string; email: string }>,
  profiles: [] as Fila[],
};

let contador = 0;
const nuevoId = () => `uuid-${(contador += 1)}`;

/** El trigger de `fix-supabase.sql`: el perfil nace con plan 'DWY'. */
function triggerDelPerfilNuevo(id: string, email: string) {
  if (base.profiles.some((p) => p.id === id)) return;   // ON CONFLICT DO NOTHING
  base.profiles.push({
    id, email, nombre: 'Usuario', fecha_inicio: HOY,
    plan: 'DWY', rol: 'cliente',
    // Los defaults `not null` de la migración del 4 de noviembre.
    servicio_contratado: 'base', cima_incluida: false, biblioteca_abierta: false,
    acceso_tipo: 'noventa',
  });
}

function crearUsuario(email: string): { id: string; email: string } | null {
  if (base.usuarios.some((u) => u.email === email)) return null;   // ya registrado
  const u = { id: nuevoId(), email };
  base.usuarios.push(u);
  triggerDelPerfilNuevo(u.id, u.email);
  return u;
}

/** Los filtros que estas dos rutas usan: `columna=eq.valor`, nada más. */
function filtrar(filas: Fila[], params: URLSearchParams): Fila[] {
  let r = filas;
  for (const [clave, valor] of params.entries()) {
    if (clave === 'select' || clave === 'order' || clave === 'limit') continue;
    if (!valor.startsWith('eq.')) continue;
    const buscado = valor.slice(3);
    r = r.filter((f) => String(f[clave] ?? '') === buscado);   // `=` de SQL
  }
  return r;
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } });

const URL_FALSA = 'https://falso.supabase.co';

(globalThis as Record<string, unknown>).fetch = async (recurso: unknown, opciones?: { method?: string; body?: string }) => {
  const url = new URL(String(recurso));
  const metodo = (opciones?.method ?? 'GET').toUpperCase();
  const cuerpo = opciones?.body ? JSON.parse(opciones.body) as Fila : {};

  // ── GoTrue ──
  if (url.pathname === '/auth/v1/invite') {
    const u = crearUsuario(String(cuerpo.email ?? '').toLowerCase());
    if (!u) return json({ msg: 'A user with this email address has already been registered' }, 422);
    return json(u);
  }
  if (url.pathname === '/auth/v1/admin/users' && metodo === 'POST') {
    const u = crearUsuario(String(cuerpo.email ?? '').toLowerCase());
    if (!u) return json({ msg: 'already registered' }, 422);
    return json(u);
  }
  if (url.pathname === '/auth/v1/admin/users' && metodo === 'GET') {
    const porPagina = Number(url.searchParams.get('per_page') ?? 50);
    const pagina = Number(url.searchParams.get('page') ?? 1);
    return json({ users: base.usuarios.slice((pagina - 1) * porPagina, pagina * porPagina) });
  }

  // ── PostgREST ──
  if (url.pathname === '/rest/v1/profiles') {
    if (metodo === 'GET') return json(filtrar(base.profiles, url.searchParams));
    if (metodo === 'POST') {
      const fila = cuerpo as Fila;
      if (base.profiles.some((p) => p.id === fila.id)) {
        return json({ code: '23505', message: 'duplicate key value violates unique constraint' }, 409);
      }
      // Los `not null default` los pone la tabla, no quien inserta.
      base.profiles.push({ servicio_contratado: 'base', rol: 'cliente', ...fila });
      return json([], 201);
    }
    if (metodo === 'PATCH') {
      for (const f of filtrar(base.profiles, url.searchParams)) Object.assign(f, cuerpo);
      return json([]);
    }
  }
  return json({ message: `la prueba no simula ${metodo} ${url.pathname}` }, 500);
};

/* ════════════════════════════════════════════════════════════════════════
 * LAS DOS RUTAS DE VERDAD
 * ════════════════════════════════════════════════════════════════════════ */

const CLAVE_ALTA = 'clave-del-alta-de-prueba';
const CLAVE_GHL = 'clave-del-webhook-de-prueba';

process.env.SUPABASE_URL = URL_FALSA;
process.env.VITE_SUPABASE_URL = URL_FALSA;
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-de-prueba';
process.env.ALTA_NUMERO_KEY = CLAVE_ALTA;
process.env.GHL_WEBHOOK_SECRET = CLAVE_GHL;

const alta = (await import('../api/alta-numero')).default;
const webhook = (await import('../api/ghl-webhook')).default;

type Respuesta = { code: number; body: Fila };
const respuesta = (r: Respuesta) => ({
  status: (n: number) => ({ json: (b: unknown) => { r.code = n; r.body = (b ?? {}) as Fila; return b; } }),
});

/** Lo que GHL manda cuando alguien compra la entrada. */
async function cobraLaEntrada(email: string, nombre = 'Dra. Prueba'): Promise<Respuesta> {
  const r: Respuesta = { code: 0, body: {} };
  await alta(
    { method: 'POST', query: {}, headers: { 'x-alta-key': CLAVE_ALTA }, body: { email, nombre } } as never,
    respuesta(r) as never,
  );
  return r;
}

/** Lo que GHL manda cuando alguien compra uno de los tres escalones. */
async function cobra(email: string, plan: string): Promise<Respuesta> {
  const r: Respuesta = { code: 0, body: {} };
  await webhook(
    { method: 'POST', headers: { 'x-ghl-secret': CLAVE_GHL }, body: { email, plan } } as never,
    respuesta(r) as never,
  );
  return r;
}

const fichaDe = (email: string): Partial<Profile> =>
  (base.profiles.find((p) => String(p.email ?? '').toLowerCase() === email.toLowerCase()) ?? {}) as Partial<Profile>;

/** Deja la base vacía: cada lente arranca de cero. */
function desdeCero() { base.usuarios = []; base.profiles = []; }

/* ════════════════════════════════════════════════════════════════════════
 * LA LÓGICA VIEJA, PARA PROBAR CADA LENTE CONTRA SU PROPIO FALLO
 *
 * No es una paráfrasis: es lo que hacían los dos handlers antes de este
 * turno, corriendo contra la misma base falsa. Si con esto puesto una lente
 * sigue en verde, esa lente no mira lo que dice mirar.
 * ════════════════════════════════════════════════════════════════════════ */

/** El alta como estaba: si el perfil ya trae un plan, no lo toca. */
function altaComoEstaba(email: string) {
  const u = crearUsuario(email.toLowerCase()) ?? base.usuarios.find((x) => x.email === email.toLowerCase())!;
  const perfil = base.profiles.find((p) => p.id === u.id);
  if (!perfil) {
    base.profiles.push({
      id: u.id, nombre: email.split('@')[0], plan: 'ELNUMERO', fecha_inicio: HOY,
      acceso_hasta: new Date(Date.now() + 21 * 86400000).toISOString(), servicio_contratado: 'base',
    });
  } else if (!perfil.plan) {
    perfil.plan = 'ELNUMERO';
    perfil.acceso_hasta = new Date(Date.now() + 21 * 86400000).toISOString();
  } // si ya tiene DWY/DFY/IMPLEMENTACION, no se toca
}

/** El webhook como estaba: pisa el acceso y nunca sella la fecha del escalón. */
function webhookComoEstaba(email: string, plan: 'blanco' | 'amarillo' | 'verde' | 'negro', ticket?: string) {
  const perfil = base.profiles.find((p) => String(p.email ?? '').toLowerCase() === email.toLowerCase());
  if (!perfil) return;
  perfil.plan_comercial = plan;
  perfil.acceso_hasta = plan === 'blanco' ? new Date(Date.now() + 21 * 86400000).toISOString() : null;
  if (ticket) perfil.servicio_contratado = ticket;
}

/* ════════════════════════════════════════════════════════════════════════
 * LAS LENTES
 * ════════════════════════════════════════════════════════════════════════ */

const EMAIL = 'dra.perez@mail.com';
const codigoDelAlta = readFileSync(new URL('../api/alta-numero.ts', import.meta.url), 'utf8');
const sinComentarios = codigoDelAlta.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

type Lente = {
  nombre: string;
  mira: () => Promise<boolean>;
  /** La misma mirada, con el defecto que debería ponerla roja. */
  conSuFallo: () => Promise<boolean>;
};

/** El tramo corto, medido con las funciones de la app. */
function esElTramoDeLosCincoDias(ficha: Partial<Profile>): boolean {
  return planDe(ficha) === 'blanco'
    && enElTramoDelNumero(ficha)
    && planPermitePilar(planDe(ficha), 1)
    && !planPermitePilar(planDe(ficha), 2);
}

const LENTES: Lente[] = [
  /* ── 1 · LA LENTE QUE JUSTIFICA EL TURNO ──
   *
   * El que paga la entrada tiene que quedar en el tramo de los cinco días. El
   * trigger le estampa `plan = 'DWY'` al crear el usuario, y 'DWY' en
   * `planDe` es 'completo': 99 pilares, los 90 días, gratis. Y sin nada que
   * venderle después, el escalón de $1.000 no existe.
   */
  {
    nombre: 'el que paga la entrada queda en los 5 días, no en el programa entero',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      return esElTramoDeLosCincoDias(fichaDe(EMAIL));
    },
    // El defecto: el alta como estaba, que respeta el 'DWY' del trigger.
    conSuFallo: async () => {
      desdeCero();
      altaComoEstaba(EMAIL);
      return esElTramoDeLosCincoDias(fichaDe(EMAIL));
    },
  },

  /* ── 2 · Y su ventana de acceso empieza a correr ──
   *
   * Sin `acceso_hasta` el acceso no vence nunca: la pantalla de acceso
   * vencido —el punto de venta más caro de la app, con su precio decidido y
   * su grado ganado— no le aparece jamás.
   */
  {
    nombre: 'su ventana de acceso queda sellada y vence',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      const d = diasRestantes(fichaDe(EMAIL));
      return d !== null && d > 0
        && accesoVencido({ ...fichaDe(EMAIL), acceso_hasta: new Date(Date.now() - 86400000).toISOString() });
    },
    conSuFallo: async () => {
      desdeCero();
      altaComoEstaba(EMAIL);
      const d = diasRestantes(fichaDe(EMAIL));
      return d !== null && d > 0;
    },
  },

  /* ── 3 · Su día uno queda sellado ──
   *
   * El tramo de cinco no pasa por la antesala, que es quien sella la fecha en
   * el Camino de noventa. Sin `fecha_inicio` el ritmo cae al día 1 por
   * defecto y la alarma de inactividad del equipo lo saltea.
   */
  {
    nombre: 'su día uno queda sellado, así la alarma de inactividad lo ve',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      return fichaDe(EMAIL).fecha_inicio === HOY;
    },
    conSuFallo: async () => {
      desdeCero();
      base.profiles.push({ id: 'x', email: EMAIL, plan: 'ELNUMERO' });
      return fichaDe(EMAIL).fecha_inicio === HOY;
    },
  },

  /* ── 4 · El perfil que crea el alta guarda su email ──
   *
   * Es la columna por la que el webhook del pago busca al cliente. Un perfil
   * sin email obliga a la ruta a caer en su respaldo —paginar hasta cuatro
   * mil usuarios de `auth.users`— justo para los clientes que la venta
   * automática crea, que son todos los que importan.
   */
  {
    nombre: 'el perfil nuevo guarda su email, que es por donde lo busca el pago',
    mira: async () => {
      desdeCero();
      // Sin usuario previo y sin trigger: el alta inserta el perfil ella misma.
      base.usuarios.push({ id: 'uuid-solo', email: EMAIL });
      await cobraLaEntrada(EMAIL);
      return String(fichaDe(EMAIL).email ?? '').toLowerCase() === EMAIL;
    },
    conSuFallo: async () => {
      desdeCero();
      base.profiles.push({ id: 'uuid-solo', plan: 'ELNUMERO' });   // el insert de antes, sin email
      return base.profiles.some((p) => String(p.email ?? '').toLowerCase() === EMAIL);
    },
  },

  /* ── 5 · El cliente de otra puerta NO se degrada ──
   *
   * Es el caso que el resguardo original quería proteger, y tiene que seguir
   * protegido: alguien que ya venía con su plan y compra la entrada no puede
   * perder lo que tenía.
   */
  {
    nombre: 'el cliente que ya venía con su plan no pierde nada al comprar la entrada',
    mira: async () => {
      desdeCero();
      base.usuarios.push({ id: 'uuid-viejo', email: EMAIL });
      base.profiles.push({ id: 'uuid-viejo', email: EMAIL, plan: 'DWY', fecha_inicio: '2026-01-15' });
      await cobraLaEntrada(EMAIL);
      const f = fichaDe(EMAIL);
      return f.plan === 'DWY' && planDe(f) === 'completo' && f.fecha_inicio === '2026-01-15';
    },
    // El defecto: pisarle el plan a cualquiera, que es el extremo opuesto.
    conSuFallo: async () => {
      desdeCero();
      base.profiles.push({ id: 'uuid-viejo', email: EMAIL, plan: 'ELNUMERO', fecha_inicio: '2026-01-15' });
      const f = fichaDe(EMAIL);
      return f.plan === 'DWY' && planDe(f) === 'completo';
    },
  },

  /* ── 6 · Paga La Base y se le abre hasta el día 12 ──
   *
   * El eslabón que `prueba-sube-de-escalon.ts` replicaba a mano. Acá lo
   * escribe el webhook de verdad y se lee con `planDe`.
   */
  {
    nombre: 'paga La Base y el pilar 2 se le abre',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'base');
      const f = fichaDe(EMAIL);
      return planDe(f) === 'amarillo' && !enElTramoDelNumero(f)
        && planPermitePilar(planDe(f), 2) && !planPermitePilar(planDe(f), 3)
        && servicioDe(f.servicio_contratado) === 'base'
        && diasRestantes(f) === null;
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      const f = fichaDe(EMAIL);   // sin pagar: no se le puede haber abierto nada
      return planDe(f) === 'amarillo' && planPermitePilar(planDe(f), 2);
    },
  },

  /* ── 7 · EL PAGO SELLA LA FECHA DEL ESCALÓN, NO SOLO EL ESCALÓN ──
   *
   * `topeDelEscalon` apaga el tope entero cuando no hay fecha —a propósito,
   * para no cerrarle los días 13 al 90 a los clientes de hoy, que están en
   * 'base' sólo porque nadie los marcó—. El webhook escribía
   * `servicio_contratado` y no `servicio_marcado_el`, así que el de La Base
   * abría los 90 días y la puerta de su primera etapa no aparecía nunca.
   */
  {
    nombre: 'el pago sella la fecha del escalón, que es lo que enciende el tope',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'base');
      const f = fichaDe(EMAIL);
      return Boolean(f.servicio_marcado_el)
        && entraEnElEscalon(ULTIMO_DIA_DE_BASE, 2, f.servicio_contratado, f.servicio_marcado_el)
        && !entraEnElEscalon(ULTIMO_DIA_DE_BASE + 1, 3, f.servicio_contratado, f.servicio_marcado_el)
        && puertaDelEscalon(f.servicio_contratado, f.servicio_marcado_el) !== null;
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      webhookComoEstaba(EMAIL, 'amarillo', 'base');
      const f = fichaDe(EMAIL);
      return Boolean(f.servicio_marcado_el)
        && !entraEnElEscalon(ULTIMO_DIA_DE_BASE + 1, 3, f.servicio_contratado, f.servicio_marcado_el);
    },
  },

  /* ── 8 · Y las entregas del equipo se disparan para el que las compró ──
   *
   * `leTocanLasEntregas` también exige la fecha. Sin ella, el que paga La
   * Instalación —el ticket más caro— no le genera al equipo ni una tarea.
   */
  {
    nombre: 'el de La Instalación le genera al equipo sus entregas',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'instalacion');
      const f = fichaDe(EMAIL);
      return leTocanLasEntregas(f.servicio_contratado, f.servicio_marcado_el)
        && planDe(f) === 'negro'
        && entraEnElEscalon(90, 5, f.servicio_contratado, f.servicio_marcado_el);
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      webhookComoEstaba(EMAIL, 'negro', 'instalacion');
      const f = fichaDe(EMAIL);
      return leTocanLasEntregas(f.servicio_contratado, f.servicio_marcado_el);
    },
  },

  /* ── 9 · UN PAGO NUNCA BAJA EL ACCESO ──
   *
   * `plan_comercial` y `acceso_hasta` se pisaban sin mirar qué había. Un
   * producto viejo de GHL que manda `plan: "blanco"`, o un webhook reenviado,
   * dejaba al de $3.000 con los cinco días y un vencimiento a 21. Un cobro
   * sólo puede querer decir «pagó esto»: nunca «pagó menos».
   */
  {
    nombre: 'un pago no puede bajarle el acceso a quien ya pagó más arriba',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'ascenso');
      await cobra(EMAIL, 'blanco');          // el producto viejo, o el reenvío
      const f = fichaDe(EMAIL);
      return planDe(f) === 'negro' && planPermitePilar(planDe(f), 10) && diasRestantes(f) === null;
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'ascenso');
      webhookComoEstaba(EMAIL, 'blanco');
      const f = fichaDe(EMAIL);
      return planDe(f) === 'negro' && diasRestantes(f) === null;
    },
  },

  /* ── 10 · Ni el servicio contratado ──
   *
   * Lo mismo del otro lado del mostrador: bajarle el escalón a quien pagó La
   * Instalación hace que el equipo le entregue de menos a alguien que pagó de
   * más, y nadie se entera hasta que el cliente pregunta.
   */
  {
    nombre: 'ni le baja el escalón de servicio a quien contrató uno más alto',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'instalacion');
      await cobra(EMAIL, 'base');
      const f = fichaDe(EMAIL);
      return servicioDe(f.servicio_contratado) === 'instalacion'
        && leTocanLasEntregas(f.servicio_contratado, f.servicio_marcado_el);
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'instalacion');
      webhookComoEstaba(EMAIL, 'amarillo', 'base');
      const f = fichaDe(EMAIL);
      return servicioDe(f.servicio_contratado) === 'instalacion';
    },
  },

  /* ── 11 · Y un cobro que no le abre nada tampoco le cierra nada ──
   *
   * Sellar `servicio_marcado_el` ENCIENDE el tope del escalón. Al cliente de
   * siempre —'completo'— le entra un cobro de La Base por un order bump mal
   * apuntado: su acceso no se mueve, pero si se le sellara el escalón 'base'
   * el Camino se le cortaría en el día 12 y perdería los días 13 al 90 que ya
   * tenía.
   */
  {
    nombre: 'un cobro que no le mueve el acceso no le enciende el tope',
    mira: async () => {
      desdeCero();
      base.usuarios.push({ id: 'uuid-de-siempre', email: EMAIL });
      base.profiles.push({
        id: 'uuid-de-siempre', email: EMAIL, plan: 'DWY', plan_comercial: 'completo',
        servicio_contratado: 'base', fecha_inicio: '2026-01-15',
      });
      await cobra(EMAIL, 'base');
      const f = fichaDe(EMAIL);
      return f.plan_comercial === 'completo'
        && !f.servicio_marcado_el
        && entraEnElEscalon(90, 5, f.servicio_contratado, f.servicio_marcado_el)
        && puertaDelEscalon(f.servicio_contratado, f.servicio_marcado_el) === null;
    },
    // El defecto: sellar la fecha por el solo hecho de que vino un ticket.
    conSuFallo: async () => {
      desdeCero();
      base.profiles.push({
        id: 'uuid-de-siempre', email: EMAIL, plan_comercial: 'completo',
        servicio_contratado: 'base', servicio_marcado_el: new Date().toISOString(),
      });
      const f = fichaDe(EMAIL);
      return f.plan_comercial === 'completo' && entraEnElEscalon(90, 5, f.servicio_contratado, f.servicio_marcado_el);
    },
  },

  /* ── 12 · Subir sí sube ──
   *
   * El resguardo de las dos lentes anteriores no puede trabar el camino para
   * el que va: entrada → La Base → El Ascenso, cada escalón abriendo el
   * siguiente.
   */
  {
    nombre: 'subir escalón por escalón sigue abriendo lo que se compra',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      if (!planPermitePilar(planDe(fichaDe(EMAIL)), 1)) return false;
      await cobra(EMAIL, 'base');
      if (!planPermitePilar(planDe(fichaDe(EMAIL)), 2)) return false;
      if (planPermitePilar(planDe(fichaDe(EMAIL)), 3)) return false;
      await cobra(EMAIL, 'ascenso');
      const f = fichaDe(EMAIL);
      return planPermitePilar(planDe(f), 10) && servicioDe(f.servicio_contratado) === 'ascenso';
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'base');
      const f = fichaDe(EMAIL);   // sin pagar El Ascenso, el pilar 10 no se abre
      return planPermitePilar(planDe(f), 10) && servicioDe(f.servicio_contratado) === 'ascenso';
    },
  },

  /* ── 13 · Lo que se le ofrece en el día 5 es lo que después le abre ──
   *
   * La pantalla del candado ofrece La Base. Si el webhook del producto «base»
   * abriera otro tramo, el cliente pagaría una cosa y recibiría otra. Las dos
   * mitades se miden juntas, que es lo que ninguna prueba hacía.
   */
  {
    nombre: 'lo que el día 5 le ofrece es exactamente lo que el pago le abre',
    mira: async () => {
      desdeCero();
      const oferta = laOfertaTrasElAcceso(PILAR_MAX.blanco);
      if (oferta.ticket !== 'base') return false;
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, oferta.ticket);
      const f = fichaDe(EMAIL);
      return servicioDe(f.servicio_contratado) === oferta.ticket
        && oferta.abre.includes(String(ULTIMO_DIA_DE_BASE))
        && !entraEnElEscalon(ULTIMO_DIA_DE_BASE + 1, 3, f.servicio_contratado, f.servicio_marcado_el);
    },
    conSuFallo: async () => {
      desdeCero();
      const oferta = laOfertaTrasElAcceso(PILAR_MAX.blanco);
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'ascenso');        // le abre otra cosa que la ofrecida
      const f = fichaDe(EMAIL);
      return servicioDe(f.servicio_contratado) === oferta.ticket;
    },
  },

  /* ── 14 · El mismo cobro dos veces no hace daño ──
   *
   * GHL reintenta. Y el alta puede llegar dos veces si el comprador compra
   * dos veces o el workflow se dispara doble.
   */
  {
    nombre: 'el mismo cobro repetido deja la ficha igual',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'base');
      const antes = JSON.stringify({ ...fichaDe(EMAIL), servicio_marcado_el: 'x' });
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'base');
      return JSON.stringify({ ...fichaDe(EMAIL), servicio_marcado_el: 'x' }) === antes
        && base.profiles.length === 1 && base.usuarios.length === 1;
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      const antes = JSON.stringify(fichaDe(EMAIL));
      await cobra(EMAIL, 'base');            // un cobro que SÍ cambia la ficha
      return JSON.stringify(fichaDe(EMAIL)) === antes;
    },
  },

  /* ── 15 · El email con mayúsculas del formulario encuentra al cliente ──
   *
   * `profiles.email=eq.X` es un `=` de SQL: sensible a mayúsculas. Es el 404
   * que el turno 7 encontró del lado de MiClínica, y acá el precio es que el
   * cliente paga y el webhook no sabe a quién abrirle.
   */
  {
    nombre: 'el email como lo escribió en el formulario igual encuentra su ficha',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      const r = await cobra('  Dra.Perez@Mail.com ', 'base');
      return r.body.ok === true && planDe(fichaDe(EMAIL)) === 'amarillo';
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      return planDe(fichaDe(EMAIL)) === 'amarillo';   // sin cobro, no se abrió
    },
  },

  /* ── 16 · Las dos puertas piden su clave ──
   *
   * Sin clave, cualquiera que sepa la URL se abre a sí mismo el programa
   * completo con un POST y un email.
   */
  {
    nombre: 'sin la clave, ninguna de las dos puertas escribe nada',
    mira: async () => {
      desdeCero();
      const r1: Respuesta = { code: 0, body: {} };
      await alta({ method: 'POST', query: {}, headers: {}, body: { email: EMAIL } } as never, respuesta(r1) as never);
      const r2: Respuesta = { code: 0, body: {} };
      await webhook({ method: 'POST', headers: {}, body: { email: EMAIL, plan: 'negro' } } as never, respuesta(r2) as never);
      return r1.code === 401 && r2.code === 401 && base.profiles.length === 0 && base.usuarios.length === 0;
    },
    conSuFallo: async () => {
      desdeCero();
      const r1 = await cobraLaEntrada(EMAIL);   // con la clave: 200 y escribe
      return r1.code === 401 && base.profiles.length === 0;
    },
  },

  /* ── 17 · El entorno se lee en cada pedido ──
   *
   * Estaba arriba del módulo: la clave quedaba fijada en el primer arranque
   * —rotarla exigía redeploy— y la ruta era imposible de ejecutar en una
   * prueba. Eso es, literalmente, por qué nadie la había corrido.
   */
  {
    nombre: 'la clave del alta se lee dentro del handler, no al cargar el módulo',
    mira: async () => {
      const arriba = sinComentarios.split('export default')[0];
      const adentro = sinComentarios.split('export default')[1] ?? '';
      return !/process\.env\.ALTA_NUMERO_KEY/.test(arriba) && /process\.env\.ALTA_NUMERO_KEY/.test(adentro);
    },
    conSuFallo: async () => {
      const comoEstaba = "const ALTA_KEY = process.env.ALTA_NUMERO_KEY ?? '';\nexport default async function h() { return ALTA_KEY; }";
      return !/process\.env\.ALTA_NUMERO_KEY/.test(comoEstaba.split('export default')[0]);
    },
  },

  /* ── 18 · Un color de acceso NO escribe servicio contratado ──
   *
   * Es el puente prohibido que `cuadroTickets` quitó y documentó: deducir el
   * servicio del plan de acceso hizo que un cliente de $497 figurara con la
   * instalación completa contratada, y el equipo que trabajara contra esa
   * ficha instalaba gratis. Los productos viejos de GHL mandan colores, así
   * que el caso llega de verdad.
   */
  {
    nombre: 'un color de acceso no escribe el servicio contratado ni lo sella',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'verde');
      const f = fichaDe(EMAIL);
      return planDe(f) === 'verde'
        && !f.servicio_marcado_el
        && entraEnElEscalon(90, 5, f.servicio_contratado, f.servicio_marcado_el);
    },
    // El defecto: un ticket, que SÍ tiene autoridad para escribirlo.
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      await cobra(EMAIL, 'base');
      const f = fichaDe(EMAIL);
      return !f.servicio_marcado_el && entraEnElEscalon(90, 5, f.servicio_contratado, f.servicio_marcado_el);
    },
  },

  /* ── 19 · Un plan que no se vende no abre nada ── */
  {
    nombre: 'un plan desconocido se rechaza en vez de escribir cualquier cosa',
    mira: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      const r = await cobra(EMAIL, 'el-plan-que-no-existe');
      return r.code === 400 && esElTramoDeLosCincoDias(fichaDe(EMAIL));
    },
    conSuFallo: async () => {
      desdeCero();
      await cobraLaEntrada(EMAIL);
      const r = await cobra(EMAIL, 'base');   // uno que SÍ se vende
      return r.code === 400;
    },
  },
];

/* ═══ CORRER LAS LENTES ═══ */
for (const l of LENTES) {
  let ok = false;
  try { ok = await l.mira(); } catch (e) { mal(`${l.nombre} — reventó: ${(e as Error).message}`); continue; }
  if (!ok) mal(l.nombre);
}

/* ═══ Y CADA LENTE CONTRA SU PROPIO FALLO ═══ */
let ciegas = 0;
for (const l of LENTES) {
  let siguieraVerde = false;
  try { siguieraVerde = await l.conSuFallo(); } catch { siguieraVerde = false; }
  if (siguieraVerde) { ciegas += 1; mal(`la lente «${l.nombre}» NO ve su propio fallo`); }
}

if (!fallas) {
  console.log(`  ✓ ${LENTES.length} lentes sobre la cadena del pago, cada una probada contra su propio fallo\n`);
} else {
  console.log(`  (${LENTES.length} lentes · ${ciegas} ciega(s))\n`);
}
process.exit(fallas ? 1 : 0);
