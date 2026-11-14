/**
 * LA PUERTA DE LAS RUTAS DE IA — que pregunten quién llama, y que CORTEN.
 *
 * Por qué existe, medido el 14 de noviembre de 2026: cinco de las seis rutas
 * de `api/ai/` no preguntaban nada. El usuario llegaba en el cuerpo del pedido
 * (`req.body.userId`, leído del localStorage del navegador) y el guardián está
 * escrito como opt-in —«sin userId no se cobra ni se cuenta»—, así que un
 * pedido sin `userId` salía a DeepSeek, a Claude o a OpenAI con las llaves de
 * la casa, sin crédito, sin tope y sin techo: el techo de gasto se mide por
 * usuario, y al anónimo no se le aplica ninguno. Con el `userId` de otro, se
 * le gastaba el crédito a otro.
 *
 * Ninguna de las 859 lentes de `auditoria.py` miraba esto: la batería no
 * nombraba ni una vez un 401, una clave de puerta ni una sesión. Las 132
 * pruebas tampoco.
 *
 * Lo que esta prueba mira, y es lo que faltaba:
 *   1) sin cabecera `Authorization` → 401, y NINGUNA llamada a un proveedor.
 *   2) con un token que no vale → 401, y tampoco se llama a nadie.
 *   3) con un token bueno → la puerta NO es la que corta (lo que pase después
 *      es asunto del guardián, no de la puerta).
 *   4) el handler no vuelve a leer `req.body.userId`: la identidad sale del
 *      token. Esto se lee en el CÓDIGO, sin comentarios, porque mirar el
 *      archivo crudo da verde aunque la lectura vieja haya vuelto.
 *
 * Cada lente trae su `conSuFallo`: la misma mirada con el defecto puesto a
 * propósito. Si con el defecto sigue en verde, la lente no sirve.
 *
 * Correr con: npx tsx scripts/prueba-la-puerta-de-la-ia.ts
 */
import { readFileSync } from 'node:fs';

// ── El entorno falso, antes de importar los handlers ───────────────────────
process.env.SUPABASE_URL = 'https://supabase-de-prueba.co';
process.env.SUPABASE_ANON_KEY = 'anon-de-prueba';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-de-prueba';
process.env.ANTHROPIC_API_KEY = 'clave-de-prueba';
process.env.DEEPSEEK_API_KEY = 'clave-de-prueba';
process.env.OPENAI_API_KEY = 'clave-de-prueba';
process.env.GEMINI_API_KEY = 'clave-de-prueba';

const PROVEEDORES = [
  'api.deepseek.com', 'api.anthropic.com', 'api.openai.com',
  'generativelanguage.googleapis.com',
];

let tokenAceptado = true;
let llamadasAProveedor: string[] = [];

const fetchDeVerdad = globalThis.fetch;
globalThis.fetch = (async (url: unknown, opciones?: { body?: unknown }) => {
  const u = String(typeof url === 'object' && url && 'url' in url ? (url as Request).url : url);

  const proveedor = PROVEEDORES.find((p) => u.includes(p));
  if (proveedor) {
    llamadasAProveedor.push(proveedor);
    return new Response(JSON.stringify({ choices: [{ message: { content: 'texto' } }] }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  }

  // El endpoint de Supabase que verifica el token.
  if (u.includes('/auth/v1/user')) {
    if (!tokenAceptado) {
      return new Response(JSON.stringify({ message: 'invalid JWT' }), {
        status: 401, headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({
      id: 'uid-de-prueba', aud: 'authenticated', role: 'authenticated',
      email: 'cliente@mail.com', app_metadata: {}, user_metadata: {},
      created_at: '2026-01-01T00:00:00Z',
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  // Cualquier otra cosa (REST y RPC de Supabase): vacío y sin ruido.
  return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
}) as typeof globalThis.fetch;

// ── Las seis rutas ─────────────────────────────────────────────────────────
const RUTAS = [
  { nombre: 'generate', mod: '../api/ai/generate', cuerpo: { prompt: 'hola', feature: 'copy' } },
  { nombre: 'stream', mod: '../api/ai/stream', cuerpo: { prompt: 'hola', feature: 'copy' } },
  { nombre: 'describe-image', mod: '../api/ai/describe-image', cuerpo: { imageBase64: 'AAA', mimeType: 'image/png' } },
  { nombre: 'transcribir', mod: '../api/ai/transcribir', cuerpo: { base64: 'AAA', mimeType: 'audio/webm' } },
  { nombre: 'vision', mod: '../api/ai/vision', cuerpo: { base64: 'AAA', mimeType: 'image/png', descripcion: 'x' } },
  { nombre: 'image', mod: '../api/ai/image', cuerpo: { prompt: 'una silla' } },
] as const;

type Respuesta = { code: number; body: Record<string, unknown>; tiro: boolean };

async function pedir(
  mod: string, cabeceras: Record<string, string>, cuerpo: unknown,
): Promise<Respuesta> {
  const handler = (await import(mod)).default as (req: unknown, res: unknown) => Promise<unknown>;
  const r: Respuesta = { code: 0, body: {}, tiro: false };
  const res = {
    status: (n: number) => ({
      json: (b: unknown) => { r.code = n; r.body = (b ?? {}) as Record<string, unknown>; return b; },
      end: () => undefined,
    }),
    setHeader: () => undefined,
    write: () => undefined,
    end: () => undefined,
  };
  try {
    await handler({ method: 'POST', headers: cabeceras, body: cuerpo, query: {} }, res);
  } catch {
    // Un throw solo puede venir de MÁS ADENTRO que la puerta: la puerta
    // atrapa todo (getUserIdFromJwt devuelve null en vez de tirar).
    r.tiro = true;
  }
  return r;
}

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

// ═══ 1 y 2 · sin token y con token que no vale ═══
console.log('══ la puerta corta, y corta antes de gastar ══');

for (const ruta of RUTAS) {
  llamadasAProveedor = [];
  tokenAceptado = true;
  const sinNada = await pedir(ruta.mod, {}, ruta.cuerpo);
  linea(sinNada.code === 401 && sinNada.body.code === 'UNAUTHORIZED',
    `${ruta.nombre}: sin Authorization contesta 401 (dio ${sinNada.code})`);
  linea(llamadasAProveedor.length === 0,
    `${ruta.nombre}: sin Authorization no llama a ningún proveedor (llamó a ${llamadasAProveedor.join(', ') || 'nadie'})`);

  llamadasAProveedor = [];
  tokenAceptado = false;
  const conBasura = await pedir(ruta.mod, { authorization: 'Bearer basura' }, ruta.cuerpo);
  linea(conBasura.code === 401,
    `${ruta.nombre}: con un token que no vale contesta 401 (dio ${conBasura.code})`);
  linea(llamadasAProveedor.length === 0,
    `${ruta.nombre}: con un token que no vale tampoco llama a nadie`);
}

// ═══ 3 · con token bueno, la puerta no es la que corta ═══
console.log('══ con token bueno la puerta deja pasar ══');
for (const ruta of RUTAS) {
  tokenAceptado = true;
  llamadasAProveedor = [];
  const ok = await pedir(ruta.mod, { authorization: 'Bearer un-token-bueno' }, ruta.cuerpo);
  linea(ok.code !== 401 || ok.tiro,
    `${ruta.nombre}: con token bueno no contesta 401 (dio ${ok.code}${ok.tiro ? ', y siguió más adentro' : ''})`);
}

// ═══ 4 · la identidad no vuelve a salir del cuerpo ═══
console.log('══ la identidad sale del token, no del cuerpo ══');

const sinComentarios = (s: string) => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

type Lente = { nombre: string; mira: () => boolean; conSuFallo: () => boolean };

const lentes: Lente[] = RUTAS.map((ruta) => {
  const archivo = `../api/ai/${ruta.nombre}.ts`;
  const crudo = readFileSync(new URL(archivo, import.meta.url), 'utf8');
  const codigo = sinComentarios(crudo);
  // `userId` del cuerpo: la destructuración vieja o un acceso directo.
  const leeDelCuerpo = (s: string) =>
    /req\.body[\s\S]{0,40}\buserId\b/.test(s)
    || /const \{[^}]*\buserId\b[^}]*\} = req\.body/.test(s)
    || /\bbody\.userId\b/.test(s);
  return {
    nombre: `${ruta.nombre}: no lee el userId del cuerpo del pedido`,
    mira: () => !leeDelCuerpo(codigo)
      && /usuarioDeLaPuerta\(req\)/.test(codigo)
      && /status\(401\)/.test(codigo),
    // El defecto: la lectura vieja vuelve, con la puerta igual de presente.
    conSuFallo: () => {
      const roto = codigo.replace(
        /const userId = await usuarioDeLaPuerta\(req\);/,
        'const { userId } = req.body ?? {};',
      );
      return !leeDelCuerpo(roto) && /usuarioDeLaPuerta\(req\)/.test(roto);
    },
  };
});

for (const l of lentes) {
  linea(l.mira(), l.nombre);
  linea(!l.conSuFallo(), `   …y con el defecto puesto se pone roja`);
}

globalThis.fetch = fetchDeVerdad;
console.log(fallas === 0 ? '\n✅ la puerta de la IA está puesta' : `\n❌ ${fallas} FALLAS`);
process.exit(fallas === 0 ? 0 : 1);
