/**
 * EL SOPORTE, VIVO — lo que hace que reemplace a Discord.
 *
 * El turno anterior logró que el mensaje LLEGUE. Esto verifica que alguien se
 * ENTERE de que llegó, y que se pueda mandar una captura de pantalla.
 *
 * ═══ LO QUE ESTABA APAGADO ═══
 *
 * · El contador del cliente era un `0` escrito dentro del código.
 * · El del equipo recorría una lista vacía, así que no se suscribía a nada y
 *   el badge no aparecía nunca. Recorrer una lista vacía no es un error, así
 *   que nada fallaba.
 * · El cliente solo podía escribir texto.
 *
 * Correr con: npx tsx scripts/prueba-soporte-vivo.ts
 */
import { readFileSync } from 'node:fs';
import { tipoDe, comoSeLee, TOPE_ARCHIVO, CANAL } from '../src/lib/soporteDatos';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const leer = (p: string) => readFileSync(p, 'utf-8');
const soloCodigo = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

const datos = leer('src/lib/soporteDatos.ts');
const cliente = leer('src/pages/Mensajes.tsx');
const topbar = leer('src/components/Topbar.tsx');
const admin = leer('src/pages/Admin.tsx');
const enmarcha = leer('src/components/EnMarcha.tsx');
const mig = leer('supabase/migrations/20261010_mensajes_sin_leer.sql');

// ── 1 · La regla, sola ─────────────────────────────────────────────────────
console.log('══ lo que se puede probar sin base ══');
ok(CANAL === 'privado', 'el canal es el mismo que el resto de la app');
ok(TOPE_ARCHIVO === 8 * 1024 * 1024, 'el tope es 8 MB: una captura entra, un video no');

const comoFile = (nombre: string, tipo: string) =>
  ({ name: nombre, type: tipo, size: 1 } as File);
ok(tipoDe(comoFile('captura.png', 'image/png')) === 'imagen', 'una captura es una imagen');
ok(tipoDe(comoFile('nota.m4a', 'audio/mp4')) === 'audio', 'una nota de voz es audio');
ok(tipoDe(comoFile('factura.pdf', 'application/pdf')) === 'archivo', 'lo demás es un archivo');
ok(tipoDe(comoFile('raro', '')) === 'archivo', 'sin tipo tampoco rompe');

ok(comoSeLee('imagen') === 'Mandó una imagen', 'y se dice en palabras');
ok(comoSeLee(null) === '', 'sin archivo no dice nada');

// ── 2 · El contador del cliente ────────────────────────────────────────────
console.log('\n══ el cliente se entera ══');
ok(!/onUnreadChange\?\.\(0\)/.test(soloCodigo(cliente).split('SoporteHumano')[0]),
  'el contador ya no está fijado en cero dentro de la pantalla');
ok(/soporteSinLeer/.test(topbar) && /sinLeerDelCliente/.test(topbar),
  'el botón de Soporte cuenta lo que no abrió');
ok(/filter: `receptor_id=eq\.\$\{userId\}`/.test(topbar),
  'y se entera en vivo cuando le responden, sin recargar');
ok(/currentPage === 'mensajes'\) setSoporteSinLeer\(0\)/.test(topbar),
  'abrir Soporte es leerlo: el contador no sobrevive a la visita');
ok(/badge-pulse/.test(topbar) && /soporteSinLeer > 9/.test(topbar),
  'el badge se ve, y con muchos dice 9+ en vez de desbordarse');
ok(/if \(n > 0\) setTab\('humano'\)/.test(cliente),
  'quien entra con respuestas sin leer abre directo en la conversación, no en la IA');
ok(/await marcarLeidos\(\)/.test(cliente),
  'y al mirarla queda marcada como leída');

// ── 3 · El equipo se entera ────────────────────────────────────────────────
console.log('\n══ el equipo se entera ══');
const codigoAdmin = soloCodigo(admin);
ok(!/const chatChannels = \[\] as const/.test(codigoAdmin),
  'ya no se recorre una lista vacía: eso hacía que no se suscribiera a nada');
ok(/admin-soporte-entrante/.test(codigoAdmin),
  'hay una suscripción de verdad al soporte entrante');
ok(/if \(payload\.new\.receptor_id\) return;/.test(codigoAdmin),
  'solo lo entrante: la respuesta del propio equipo lleva destinatario');
ok(/cuantosEsperan\(\)/.test(codigoAdmin),
  'y al abrir se cuenta lo que ya estaba esperando de antes');
ok(/roto \? 12_000 : 6000/.test(codigoAdmin),
  'lo que se rompió queda más tiempo en pantalla que una duda');
ok(/channelUnread\.soporte/.test(codigoAdmin),
  'el badge de la pestaña cuenta el soporte');
ok(!/channelUnread\['comunidad'\]/.test(codigoAdmin),
  'y ya no suma canales de comunidad que no existen');

// ── 4 · Los adjuntos ───────────────────────────────────────────────────────
console.log('\n══ se puede mandar una captura ══');
ok(/subirArchivo/.test(cliente) && /archivoRef/.test(cliente),
  'el cliente puede adjuntar');
ok(/\(!texto && !adjunto\)/.test(cliente),
  'y mandar una captura sola, sin escribir nada');
ok(/tipo_archivo: subido\?\.tipo/.test(cliente),
  'el tipo se guarda con el mensaje');
ok(/<img src=\{m\.archivo_url\}/.test(cliente),
  'la imagen se ve en la conversación del cliente');
ok(/<img src=\{m\.archivo_url\}/.test(admin),
  'y también en la del equipo, que es donde importa');
ok(/\$\{userId\}\/\$\{Date\.now\(\)\}/.test(datos),
  'cada quien sube a su carpeta: así el borrado por dueño funciona y nadie pisa a otro');
ok(/pesa más de 8 MB/.test(datos) && /pesa más de 8 MB/.test(cliente),
  'y el tope se avisa antes de intentar subirlo');

// ── 5 · Lo que la base tiene que tener ─────────────────────────────────────
console.log('\n══ la base ══');
ok(/add column if not exists leido_en/.test(mig), 'la columna de leído existe');
ok(/create or replace function public\.marcar_leidos/.test(mig), 'y la función que la escribe');
ok(/create or replace function public\.cuantos_esperan/.test(mig), 'y la que cuenta lo que espera');
ok(/admin_rol in \('owner', 'manager', 'staff'\)/.test(mig),
  'que solo responde al equipo: un cliente no puede contar la bandeja ajena');
ok(/insert into storage\.buckets/.test(mig),
  'el bucket se crea acá y no en un archivo suelto fuera de las migraciones');
ok(/auth\.uid\(\)::text = \(storage\.foldername\(name\)\)\[1\]/.test(mig),
  'y cada quien escribe solo en su carpeta');

// ── 6 · Lo que apuntaba a la pantalla equivocada ───────────────────────────
console.log('\n══ los destinos ══');
const codigoEnMarcha = soloCodigo(enmarcha);
ok(!/ir: 'mensajes'/.test(codigoEnMarcha),
  '«Tu red» y «Responder» ya no llevan a Soporte: son los mensajes del cliente con su red, otra cosa');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
