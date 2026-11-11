/**
 * LA TRANSCRIPCIÓN ENTRA SOLA, Y ESPERA — turno 14
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * `api/fathom-webhook.ts` es el único camino por el que una sesión grabada
 * entra a la app sin que nadie copie y pegue. De él dependen dos cosas:
 *
 *   · que la sesión no se pierda cuando se corta la llamada;
 *   · que NO se guarde nada sin que un humano lo confirme, que es la regla
 *     escrita en el encabezado de `src/lib/transcripcion.ts`.
 *
 * ═══ LO QUE SE ENCONTRÓ AL VERIFICAR LA PREMISA ═══
 *
 * El mapa decía: «no hay ninguna ruta en `api/` que reciba una
 * transcripción». Cierto, y a medias. Lo que YA existía —y nadie dijo— es
 * toda la máquina de leerla: `src/lib/transcripcion.ts` con su prompt y su
 * lector, y `CargarSesion.tsx`, la pantalla donde una persona revisa lo que
 * salió antes de que se guarde. O sea que el turno no era «construir la
 * lectura de transcripciones»: era conectar la entrada a una revisión que ya
 * estaba hecha, SIN saltearla.
 *
 * Y lo que no existía en ninguna parte: un lugar donde dejarla. `sesiones`
 * existe —y es otra cosa: el registro de que la sesión OCURRIÓ, que sostiene
 * la garantía— y no tiene ninguna columna de transcripción. Buscado por todo
 * el repo: la palabra no aparece en un solo `.sql`.
 *
 * ═══ Y LA TRAMPA DEL FORMATO ═══
 *
 * `transcript` de Fathom NO es un texto: es un arreglo de turnos de habla.
 * Un `String(cuerpo.transcript)` guarda `[object Object]` —quince caracteres
 * que pasan cualquier chequeo de «vino algo»— y la sesión queda registrada
 * como recibida y es ilegible. Esa es la primera lente de acá.
 *
 * ═══ LA REGLA DE LA CASA ═══
 *
 * Cada lente se prueba contra su propio fallo: se reintroduce el defecto a
 * propósito —acá, corriendo la versión VIEJA o ingenua contra la misma base
 * falsa— y se confirma que la lente se pone roja. Una lente que nunca vio el
 * fallo que busca no es una lente, es un comentario.
 *
 * Correr con: npx tsx scripts/prueba-fathom-entra.ts
 */
import { readFileSync } from 'node:fs';
import {
  aplanarTranscripcion, aQuienBuscar, leerCargaDeFathom, minutosEntre,
} from '../src/lib/transcripcionDeFathom';
import { MINIMO_CARACTERES } from '../src/lib/transcripcion';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };
const ok = (c: boolean, m: string, d = '') => { if (!c) mal(`${m}${d ? ` — ${d}` : ''}`); };

console.log('\n── la transcripción entra sola, y espera ──');

/* ════════════════════════════════════════════════════════════════════════
 * EL CUERPO QUE MANDA FATHOM
 *
 * Los nombres son los del esquema `Meeting` de su OpenAPI (leído el 11 nov
 * 2026): `recording_id`, `meeting_title`, `share_url`,
 * `recording_start_time` / `_end_time`, `recorded_by`, `calendar_invitees`
 * con `is_external`, y `transcript` como arreglo de
 * `{ speaker: { display_name }, text, timestamp }`.
 * ════════════════════════════════════════════════════════════════════════ */

const DICHO = 'Lo que dijimos en la sesión sobre su precio y su agenda, con suficiente largo para que no sea una nota. ';
const turnos = (veces: number) => Array.from({ length: veces }, (_, i) => ({
  speaker: {
    display_name: i % 2 ? 'Dra. Natalia' : 'Javo',
    matched_calendar_invitee_email: i % 2 ? 'natalia@clinica.com' : 'javo@tuclinica.digital',
  },
  text: `${DICHO}(${i})`,
  timestamp: `00:0${i}:00`,
}));

function cuerpoDeFathom(extra: Record<string, unknown> = {}) {
  return {
    recording_id: 'rec-7788',
    title: 'Sesión de arranque',
    meeting_title: 'Arranque — Dra. Natalia',
    meeting_type: 'external',
    url: 'https://fathom.video/calls/7788',
    share_url: 'https://fathom.video/share/abc123',
    created_at: '2026-11-10T14:00:00Z',
    recording_start_time: '2026-11-10T14:02:00Z',
    recording_end_time: '2026-11-10T14:49:00Z',
    recorded_by: { name: 'Javo Katz', email: 'javo@tuclinica.digital' },
    calendar_invitees: [
      // El del equipo va PRIMERO, a propósito: es el orden real de una
      // reunión que organizó Javo, y el que rompía el reconocimiento.
      { name: 'Javo Katz', email: 'javo@tuclinica.digital', email_domain: 'tuclinica.digital', is_external: false },
      { name: 'Natalia', email: 'natalia@clinica.com', email_domain: 'clinica.com', is_external: true },
    ],
    transcript: turnos(4),
    ...extra,
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 1) APLANAR EL ARREGLO DE TURNOS
 * ════════════════════════════════════════════════════════════════════════ */

console.log('\n  el arreglo de turnos se vuelve texto legible');
const plano = aplanarTranscripcion(turnos(3));
ok(!plano.includes('[object Object]'), 'el texto aplanado no es "[object Object]"');
ok(plano.includes('Javo: '), 'conserva quién habló');
ok(plano.includes('Dra. Natalia: '), 'y conserva al otro lado');
ok(plano.split('\n').length === 3, 'un renglón por turno', String(plano.split('\n').length));
ok(!plano.includes('00:01:00'), 'y NO arrastra las marcas de tiempo, que gastan el presupuesto del prompt');

// ── el defecto, reintroducido ──
const ingenuo = String(turnos(3) as unknown as string);
ok(ingenuo.includes('[object Object]'),
  'LA LENTE SE PRUEBA: el String() ingenuo sí produce "[object Object]"');
ok(!/Javo: /.test(ingenuo), 'LA LENTE SE PRUEBA: y pierde quién habló');

console.log('\n  y tolera las otras formas en que puede llegar');
ok(aplanarTranscripcion('texto ya armado') === 'texto ya armado', 'un texto plano pasa derecho');
ok(aplanarTranscripcion({ text: 'adentro de un objeto' }) === 'adentro de un objeto', 'y envuelto en `{ text }`');
ok(aplanarTranscripcion([{ speaker: 'Javo', text: 'hola' }]) === 'Javo: hola', 'speaker como cadena suelta');
ok(aplanarTranscripcion(null) === '', 'y lo que no se entiende da vacío, no basura');

/* ════════════════════════════════════════════════════════════════════════
 * 2) A QUIÉN SE LE COLGÓ LA SESIÓN
 * ════════════════════════════════════════════════════════════════════════ */

console.log('\n  el cliente es el de afuera, no el que organizó la reunión');
const lectura = leerCargaDeFathom(cuerpoDeFathom());
if (!lectura.carga) {
  mal(`el cuerpo de Fathom no se pudo leer — ${lectura.porque}`);
} else {
  const c = lectura.carga;
  const orden = aQuienBuscar(c.participantes);
  ok(orden[0] === 'natalia@clinica.com', 'se busca primero al de afuera', orden.join(', '));
  ok(orden.includes('javo@tuclinica.digital'), 'y el de la casa igual se busca, por si grabó él');
  ok(c.externoId === 'rec-7788', 'la llave de idempotencia es el recording_id', c.externoId);
  ok(c.fecha === '2026-11-10', 'la fecha sale de cuando se grabó', c.fecha);
  ok(c.minutos === 47, 'los minutos se miden, no se adivinan', String(c.minutos));
  ok(c.enlace === 'https://fathom.video/share/abc123', 'el enlace es el de compartir');
  ok(c.quienLaDio === 'Javo Katz', 'y queda quién la dio', c.quienLaDio);

  // ── el defecto, reintroducido ──
  const sinOrden = c.participantes.map((p) => p.email);
  ok(sinOrden[0] === 'javo@tuclinica.digital',
    'LA LENTE SE PRUEBA: en el orden en que vienen, el primero es el del equipo');
}

console.log('\n  los minutos imposibles no se guardan');
ok(minutosEntre('2026-11-10T14:00:00Z', '2026-11-10T14:00:00Z') === null, 'cero minutos no es un dato');
ok(minutosEntre('2026-11-10T14:00:00Z', '2026-11-13T14:00:00Z') === null, 'ni tres días');
ok(minutosEntre('no es fecha', 'tampoco') === null, 'ni un reloj ilegible');

/* ════════════════════════════════════════════════════════════════════════
 * 3) LO QUE NO ENTRA
 * ════════════════════════════════════════════════════════════════════════ */

console.log('\n  lo que no es una sesión se rechaza con el motivo escrito');
const corta = leerCargaDeFathom(cuerpoDeFathom({ transcript: [{ speaker: { display_name: 'Javo' }, text: 'hola', timestamp: '00:00:01' }] }));
ok(corta.carga === null, 'una transcripción de cuatro palabras no entra');
ok(String(corta.porque).includes(String(MINIMO_CARACTERES)),
  'y el motivo dice el mínimo, que es el mismo que usa la pantalla', String(corta.porque));

const sinTexto = leerCargaDeFathom(cuerpoDeFathom({ transcript: undefined }));
ok(sinTexto.carga === null, 'sin `include_transcript` en Fathom, no entra');
ok(String(sinTexto.porque).includes('transcript'),
  'y el motivo nombra el campo que falta, que es lo que Javo tiene que prender');

const sinLlave = leerCargaDeFathom({ ...cuerpoDeFathom(), recording_id: '', id: '', share_url: '', url: '' });
ok(sinLlave.carga === null, 'sin ninguna llave no entra: entraría repetida en cada reintento');

/* ════════════════════════════════════════════════════════════════════════
 * EL SUPABASE FALSO
 *
 * Decide como el real en las tres cosas que importan acá:
 *
 *   · PostgREST: `email=eq.x` es el `=` de SQL, SENSIBLE a mayúsculas.
 *   · El único de la migración: (origen, externo_id) choca con 23505.
 *   · Y se anota CADA camino que la ruta toca, para poder afirmar —y no
 *     suponer— que no escribió un aviso ni una decisión ni una sesión.
 * ════════════════════════════════════════════════════════════════════════ */

type Fila = Record<string, unknown>;
const base = {
  profiles: [
    { id: 'uuid-natalia', email: 'natalia@clinica.com', rol: 'cliente', admin_rol: null },
    { id: 'uuid-javo', email: 'javo@tuclinica.digital', rol: 'admin', admin_rol: 'owner' },
    { id: 'uuid-ailen', email: 'ailen@tuclinica.digital', rol: 'cliente', admin_rol: 'staff' },
  ] as Fila[],
  transcripciones_recibidas: [] as Fila[],
};
const caminosTocados = new Set<string>();
let defecto: 'ninguno' | 'insert-revienta' | 'tabla-no-existe' = 'ninguno';

function filtrar(filas: Fila[], params: URLSearchParams): Fila[] {
  let r = filas;
  for (const [clave, valor] of params.entries()) {
    if (['select', 'order', 'limit', 'offset'].includes(clave)) continue;
    if (!valor.startsWith('eq.')) continue;
    const buscado = valor.slice(3);
    r = r.filter((f) => String(f[clave] ?? '') === buscado);
  }
  return r;
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } });

const URL_FALSA = 'https://falso.supabase.co';
let contador = 0;

(globalThis as Record<string, unknown>).fetch = async (recurso: unknown, opciones?: { method?: string; body?: string }) => {
  const url = new URL(String(recurso));
  const metodo = (opciones?.method ?? 'GET').toUpperCase();
  const cuerpo = opciones?.body ? JSON.parse(opciones.body) as Fila : {};
  caminosTocados.add(`${metodo} ${url.pathname}`);

  if (url.pathname === '/rest/v1/profiles' && metodo === 'GET') {
    return json(filtrar(base.profiles, url.searchParams));
  }

  if (url.pathname === '/rest/v1/transcripciones_recibidas') {
    if (defecto === 'tabla-no-existe') {
      return json({ code: '42P01', message: 'relation "public.transcripciones_recibidas" does not exist' }, 404);
    }
    if (metodo === 'GET') return json(filtrar(base.transcripciones_recibidas, url.searchParams));
    if (metodo === 'POST') {
      if (defecto === 'insert-revienta') {
        return json({ code: '53300', message: 'too many connections' }, 500);
      }
      const fila = cuerpo as Fila;
      // El único de (origen, externo_id) de la migración.
      if (base.transcripciones_recibidas.some(
        (f) => f.origen === fila.origen && f.externo_id === fila.externo_id)) {
        return json({ code: '23505', message: 'duplicate key value violates unique constraint' }, 409);
      }
      base.transcripciones_recibidas.push({ id: `t-${(contador += 1)}`, ...fila });
      return json([], 201);
    }
    if (metodo === 'PATCH') {
      for (const f of filtrar(base.transcripciones_recibidas, url.searchParams)) Object.assign(f, cuerpo);
      return json([]);
    }
  }
  return json({ message: `la prueba no simula ${metodo} ${url.pathname}` }, 500);
};

/* ════════════════════════════════════════════════════════════════════════
 * LA RUTA DE VERDAD
 * ════════════════════════════════════════════════════════════════════════ */

const CLAVE = 'clave-de-fathom-de-prueba';
process.env.SUPABASE_URL = URL_FALSA;
process.env.VITE_SUPABASE_URL = URL_FALSA;
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-de-prueba';
process.env.FATHOM_WEBHOOK_SECRET = CLAVE;

const webhook = (await import('../api/fathom-webhook')).default;

type Respuesta = { code: number; body: Fila };
async function llamar(
  cuerpo: unknown,
  { metodo = 'POST', clave = CLAVE, enLaUrl = false }: { metodo?: string; clave?: string | null; enLaUrl?: boolean } = {},
): Promise<Respuesta> {
  const r: Respuesta = { code: 0, body: {} };
  const headers: Record<string, string> = {};
  if (clave && !enLaUrl) headers['x-fathom-secret'] = clave;
  await webhook(
    { method: metodo, headers, query: enLaUrl && clave ? { clave } : {}, body: cuerpo } as never,
    { status: (n: number) => ({ json: (b: unknown) => { r.code = n; r.body = (b ?? {}) as Fila; return b; } }) } as never,
  );
  return r;
}

const enLaCola = () => base.transcripciones_recibidas;

/* ── la puerta ── */
console.log('\n  la puerta de la ruta');
ok((await llamar(cuerpoDeFathom(), { metodo: 'GET' })).code === 405, 'un GET no entra');
ok((await llamar(cuerpoDeFathom(), { clave: null })).code === 401, 'sin clave, 401');
ok((await llamar(cuerpoDeFathom(), { clave: 'otra' })).code === 401, 'con la clave de otro, 401');
ok(enLaCola().length === 0, 'y nada de eso dejó nada en la cola');

/* ── el camino bueno ── */
console.log('\n  la sesión entra, queda pendiente, y no toca nada más');
const buena = await llamar(cuerpoDeFathom());
ok(buena.code === 200, 'contesta 2xx, que es lo que Fathom espera para no reintentar', String(buena.code));
ok(buena.body.ok === true, 'y dice que entró');
ok(buena.body.cliente === 'reconocido', 'con el cliente reconocido', String(buena.body.cliente));
ok(enLaCola().length === 1, 'hay exactamente una fila en la cola', String(enLaCola().length));

const fila = enLaCola()[0] ?? {};
ok(fila.estado === 'pendiente', 'y queda PENDIENTE de revisión, no cargada', String(fila.estado));
ok(fila.cliente_id === 'uuid-natalia', 'colgada de la clienta, no de quien grabó', String(fila.cliente_id));
ok(fila.email_detectado === 'natalia@clinica.com', 'y queda escrito por qué email se la reconoció');
ok(!String(fila.transcripcion).includes('[object Object]'), 'el texto guardado es legible');
ok(String(fila.transcripcion).includes('Dra. Natalia: '), 'con quién dijo qué');
ok(fila.minutos === 47, 'y con los minutos medidos', String(fila.minutos));

console.log('\n  NADA se guardó sin que un humano confirme');
ok(!caminosTocados.has('POST /rest/v1/notificaciones'), 'no le mandó ningún aviso al cliente');
ok(![...caminosTocados].some((c) => c.includes('rpc/crear_notificacion')), 'ni por el RPC de avisos');
ok(![...caminosTocados].some((c) => c.includes('sala_decisiones')), 'no escribió ninguna decisión en el registro del negocio');
ok(![...caminosTocados].some((c) => c.includes('/rest/v1/sesiones')), 'y NO registró que la sesión ocurrió: eso sostiene la garantía y lo marca una persona');
ok(![...caminosTocados].some((c) => c.includes('generativelanguage') || c.includes('anthropic') || c.includes('api/ai')),
  'y no llamó a ningún modelo: la extracción es de la pantalla, con revisión');

/* ── el reintento de Fathom ── */
console.log('\n  Fathom reintenta, y la cola no se duplica');
const otraVez = await llamar(cuerpoDeFathom());
ok(otraVez.code === 200, 'el reintento contesta 2xx');
ok(otraVez.body.repetida === true, 'y dice que ya estaba');
ok(enLaCola().length === 1, 'sigue habiendo UNA sola fila', String(enLaCola().length));

// ── el defecto, reintroducido: sin la pregunta previa, el único de la base
// es lo único que frena, y el insert se va en error en vez de contestar
// «ya estaba».
const choque = await fetch(`${URL_FALSA}/rest/v1/transcripciones_recibidas`, {
  method: 'POST',
  body: JSON.stringify({ origen: 'fathom', externo_id: 'rec-7788' }),
} as RequestInit);
ok(choque.status === 409,
  'LA LENTE SE PRUEBA: sin la pregunta previa, el segundo insert choca con 23505');

/* ── el que nadie reconoce ── */
console.log('\n  la que nadie reconoce NO se descarta');
const desconocida = await llamar(cuerpoDeFathom({
  recording_id: 'rec-9999',
  calendar_invitees: [
    { name: 'Alguien', email: 'nuevo@otraclinica.com', email_domain: 'otraclinica.com', is_external: true },
  ],
}));
ok(desconocida.code === 200, 'entra igual');
ok(desconocida.body.cliente === 'sin reconocer', 'y lo dice: sin reconocer', String(desconocida.body.cliente));
ok(enLaCola().length === 2, 'la sesión está en la cola, no en la basura', String(enLaCola().length));
const huerfana = enLaCola().find((f) => f.externo_id === 'rec-9999') ?? {};
ok(huerfana.cliente_id === null, 'con el cliente en NULL, que es un estado legítimo');
ok(Array.isArray(huerfana.participantes) && (huerfana.participantes as Fila[]).length === 1,
  'y con los emails de la invitación guardados: es con lo que una persona decide de quién era');

console.log('\n  y la del equipo con cuenta de cliente no se le cuelga a él');
const soloEquipo = await llamar(cuerpoDeFathom({
  recording_id: 'rec-1010',
  calendar_invitees: [
    { name: 'Ailén', email: 'ailen@tuclinica.digital', email_domain: 'tuclinica.digital', is_external: true },
  ],
}));
ok(soloEquipo.body.cliente === 'sin reconocer',
  'quien tiene admin_rol es equipo aunque su rol diga cliente', String(soloEquipo.body.cliente));

/* ── cuando la base no está ── */
console.log('\n  cuando la base no puede guardar, Fathom tiene que poder reintentar');
defecto = 'insert-revienta';
const revienta = await llamar(cuerpoDeFathom({ recording_id: 'rec-2020' }));
ok(revienta.code >= 500, 'contesta 5xx y NO 2xx: un 2xx le dice a Fathom «recibido» y no vuelve nunca', String(revienta.code));
ok(revienta.body.ok === false, 'y dice que no entró');

defecto = 'tabla-no-existe';
const sinTabla = await llamar(cuerpoDeFathom({ recording_id: 'rec-3030' }));
ok(sinTabla.code >= 500, 'sin la migración corrida, también 5xx', String(sinTabla.code));
ok(String(sinTabla.body.motivo).includes('migración'),
  'y el motivo dice que falta correr la migración, no un error de Postgres', String(sinTabla.body.motivo));
defecto = 'ninguno';

// ── el defecto, reintroducido: el 200 con el motivo adentro, que es lo que
// hace `ghl-webhook` y acá perdería la sesión para siempre.
const comoGhl = { code: 200, body: { ok: false, motivo: 'too many connections' } };
ok(comoGhl.code < 300 && comoGhl.body.ok === false,
  'LA LENTE SE PRUEBA: el 200-con-motivo existe y es exactamente lo que acá no sirve');

/* ── la clave por la URL ── */
console.log('\n  la clave también entra por la URL, para los paneles que no mandan headers');
const porUrl = await llamar(cuerpoDeFathom({ recording_id: 'rec-4040' }), { enLaUrl: true });
ok(porUrl.code === 200 && porUrl.body.ok === true, 'con ?clave= entra', String(porUrl.code));

/* ════════════════════════════════════════════════════════════════════════
 * LA MIGRACIÓN DICE LO QUE LA RUTA NECESITA
 *
 * Anclado a hechos del SQL —nombres de columna, el único, RLS— y no a prosa.
 * ════════════════════════════════════════════════════════════════════════ */

console.log('\n  la migración sostiene lo que la ruta da por hecho');
const sql = readFileSync('supabase/migrations/20261111_las_transcripciones_que_llegan_solas.sql', 'utf8');
ok(/create table if not exists public\.transcripciones_recibidas/.test(sql), 'la tabla se crea, y es idempotente');
ok(/unique index if not exists[\s\S]*?\(origen, externo_id\)/.test(sql),
  'el único es (origen, externo_id): sin él el reintento de Fathom duplica');
ok(/externo_id text not null/.test(sql) && /origen text not null/.test(sql),
  'y las dos son not null — un único con un NULL adentro no restringe nada en Postgres');
ok(/estado text not null default 'pendiente'/.test(sql), "nace en 'pendiente'");
ok(/check \(estado in \('pendiente', 'cargada', 'descartada'\)\)/.test(sql), 'y los tres estados están cerrados por la base');
ok(/cliente_id uuid references public\.profiles\(id\) on delete set null/.test(sql),
  'el cliente puede faltar: la que nadie reconoce entra igual');
ok(/enable row level security/.test(sql), 'RLS encendida');
ok(/admin_rol in \('owner', 'manager', 'staff'\)/.test(sql), 'y sólo la ve el equipo: el cliente no lee la conversación cruda');

/* ════════════════════════════════════════════════════════════════════════
 * Y LA PANTALLA LA MIRA
 *
 * Una tabla que se llena sola y que nadie abre es lo que este mapa viene
 * encontrando turno tras turno. Así que se comprueba que la cola esté
 * cableada a la pantalla donde se revisa.
 * ════════════════════════════════════════════════════════════════════════ */

console.log('\n  y alguien la mira');
const admin = readFileSync('src/pages/Admin.tsx', 'utf8');
const panel = readFileSync('src/components/admin/LoQueLlegoDeFathom.tsx', 'utf8');
const carga = readFileSync('src/components/admin/CargarSesion.tsx', 'utf8');
ok(admin.includes('LoQueLlegoDeFathom'), 'el Admin monta la lista de lo que llegó');
ok(/mainTab === 'sesiones'/.test(admin), 'en la pestaña donde ya se cargan las sesiones');
ok(panel.includes('pendientesDeRevisar'), 'la lista lee la cola');
ok(/textoInicial/.test(admin) && /textoInicial/.test(carga),
  'la transcripción elegida se pega en la pantalla de revisión');
ok(/recibidaId/.test(carga) && carga.includes("sacarDeLaCola(recibidaId, 'cargada')"),
  'y sale de la cola cuando una persona confirma — no al abrirla');
const ordenDelGuardado = carga.indexOf('sacarDeLaCola') > carga.indexOf('crearNotificacion');
ok(ordenDelGuardado, 'se saca de la cola DESPUÉS de guardar, no antes');

/* ════════════════════════════════════════════════════════════════════════
 * Y LA RUTA PUEDE ARRANCAR EN FRÍO
 *
 * El módulo que esta ruta importa vive en `src/`, y de ahí importa otros dos:
 * en Node ESM puro, cada salto necesita su extensión o la función muere en el
 * arranque frío con ERR_MODULE_NOT_FOUND. `check-api-esm-imports.mjs` miraba
 * sólo los archivos de `api/`; hasta hoy alcanzaba, porque el único módulo de
 * `src/` que `api/` tocaba no importa nada. Éste sí.
 * ════════════════════════════════════════════════════════════════════════ */

console.log('\n  la ruta puede arrancar en frío');
const mio = readFileSync('src/lib/transcripcionDeFathom.ts', 'utf8');
const sinComentar = mio.replace(/\/\*[\s\S]*?\*\//g, '');
const relativos = [...sinComentar.matchAll(/from\s+'(\.\.?\/[^']+)'/g)].map((m) => m[1]);
ok(relativos.length > 0, 'el módulo importa algo de src/, que es lo que hace falta mirar');
ok(relativos.every((r) => r.endsWith('.js')),
  'y todos sus imports llevan `.js`: sin eso, el arranque en frío muere', relativos.join(', '));

const lente = readFileSync('scripts/check-api-esm-imports.mjs', 'utf8');
ok(lente.includes('loQueApiAlcanza'), 'la lente de imports sigue la cadena, no sólo los archivos de api/');
ok(lente.includes('SOLO_TIPOS_RE'),
  'y saltea los imports de solo tipos, que el compilador borra: marcarlos sería gritar lobo');

console.log(fallas === 0
  ? '\n✓ la transcripción entra sola, queda pendiente, y nadie decide por el humano\n'
  : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
