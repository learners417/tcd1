/**
 * DISTINGUIR EL DE $1.000 DEL DE $3.000, Y CERRAR DISCORD.
 *
 * ═══ EL AGUJERO QUE ESTO CIERRA ═══
 *
 * La pantalla de Mensajes no miraba lo que contrató nadie: el de $1.000 tenía
 * exactamente el mismo chat que el de $3.000. Y el de $3.000 vale el triple por
 * dos cosas —las mentorías grupales y el soporte semanal—, así que una de las
 * dos estaba regalada.
 *
 * Y el conflicto no se evita pidiéndole que no escriba: basta que alguien le
 * conteste UNA vez para que ese cliente escriba todas las semanas, con razón.
 * Por eso la regla está en la base y no en un cartel.
 *
 * Correr con: npx tsx scripts/prueba-acompanamiento.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import {
  viaDe, tieneChat, canalesDe, puedeEscribirEn, CANALES, A_DONDE_VA, aDondeVa,
  INVITACION_AL_ACOMPANAMIENTO, LA_BASE, CON_ACOMPANAMIENTO,
} from '../src/lib/viaDeContacto';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// ── 1 · Las dos vías ───────────────────────────────────────────────────────
console.log('══ cada plan con su vía ══');
ok(viaDe('base').via === 'reporte', 'La Base manda reportes');
ok(viaDe('ascenso').via === 'chat', 'El Ascenso tiene chat');
ok(viaDe('instalacion').via === 'chat', 'La Instalación también');
ok(viaDe(null).via === 'reporte',
  'sin marcar se trata como La Base: darle de más hace trabajar al equipo gratis');
ok(!tieneChat('base') && tieneChat('ascenso'), 'y el chat se deriva de ahí');

console.log('\n══ la diferencia se entiende sin explicación ══');
ok(/48 horas/.test(LA_BASE.cuandoLeContestan),
  `La Base: "${LA_BASE.cuandoLeContestan}"`);
ok(/mismo d[ií]a/.test(CON_ACOMPANAMIENTO.cuandoLeContestan),
  `con acompañamiento: "${CON_ACOMPANAMIENTO.cuandoLeContestan}"`);
ok(LA_BASE.cuandoLeContestan !== CON_ACOMPANAMIENTO.cuandoLeContestan,
  'son dos compromisos distintos y medibles: «más acceso» no se puede discutir porque no se puede medir');
ok(!/\bno\b|sin |falta/i.test(LA_BASE.queEs),
  'y lo de La Base se cuenta por lo que SÍ es, no por lo que le falta');

console.log('\n══ lo que NO tiene, no lo ve con candado ══');
ok(!LA_BASE.tieneMentorias && CON_ACOMPANAMIENTO.tieneMentorias,
  'las mentorías son del que las pagó');
ok(INVITACION_AL_ACOMPANAMIENTO.queGana.length >= 3,
  'y en su lugar hay una invitación con lo que gana');
ok(INVITACION_AL_ACOMPANAMIENTO.comoSeSuma.length > 20,
  'con el paso concreto: sin eso es un cartel');
ok(!/no incluido|no tienes|tu plan no/i.test(
  INVITACION_AL_ACOMPANAMIENTO.titulo + INVITACION_AL_ACOMPANAMIENTO.queGana.join(' ')),
  'y en ninguna parte dice «no incluido»: eso abre la conversación de por qué no lo tiene');

// ── 2 · Los canales que reemplazan Discord ─────────────────────────────────
console.log('\n══ los cinco canales de Discord ══');
for (const id of ['producto', 'marketing', 'ventas', 'compromisos', 'victorias'] as const) {
  ok(CANALES.some((c) => c.id === id), `está ${id}`);
}
ok(CANALES.filter((c) => c.diaDeMentoria).length === 3,
  'tres tienen su día de mentoría: la duda del martes se hace en el canal del martes');
ok(CANALES.every((c) => c.paraQue.length > 25),
  'y cada uno dice para qué es: sin eso todo termina en el mismo canal');

console.log('\n══ quién ve y quién escribe ══');
ok(canalesDe('ascenso').length === 5, 'con acompañamiento ve los cinco');
ok(canalesDe('base').length === 1, 'La Base ve uno');
ok(canalesDe('base')[0].id === 'victorias',
  'y es Victorias: ver avanzar a alguien que empezó igual es lo que hace querer sumarse');
ok(!puedeEscribirEn('base', 'victorias'),
  'lo lee pero no escribe: si escribiera habría que moderarlo, y eso es trabajo que su plan no incluye');
ok(puedeEscribirEn('ascenso', 'producto') && puedeEscribirEn('ascenso', 'victorias'),
  'con acompañamiento escribe en todos');
ok(!puedeEscribirEn('base', 'producto'), 'y La Base no escribe en Producto');

// ── 3 · La regla vive en la base, no en un cartel ──────────────────────────
console.log('\n══ no puede escribir, no es que se le pida que no escriba ══');
const sql = readFileSync('supabase/migrations/20261016_canales_y_reportes.sql', 'utf-8');
ok(/create or replace function public\.tiene_acompanamiento/.test(sql),
  'la condición se nombra una vez en la base');
ok(/create or replace function public\.es_del_equipo/.test(sql),
  'y el chequeo del equipo también, en vez de repetir rol = admin en cada política');
ok(/rol = 'admin'/.test(sql),
  'con el mismo criterio que ya usaban las políticas a mano: no se inventó uno nuevo');
ok(/for insert[\s\S]{0,400}tiene_acompanamiento\(auth\.uid\(\)\)/.test(sql),
  'escribir en los canales exige acompañamiento EN LA BASE: si el mensaje llega, alguien lo contesta');
ok(/canal = 'victorias'[\s\S]{0,200}or public\.tiene_acompanamiento/.test(sql),
  'y leer Victorias lo puede todo el mundo');
ok(/autor_id = auth\.uid\(\)/.test(sql), 'nadie firma con el id de otro');
ok(/del_equipo = false or public\.es_del_equipo/.test(sql),
  'y solo el equipo puede firmar como equipo');

console.log('\n══ los reportes son por turnos, no un chat ══');
ok(/create table if not exists public\.reportes/.test(sql), 'existe la tabla');
ok(/donde_estoy[\s\S]{0,300}que_trabo[\s\S]{0,300}que_necesito/.test(sql),
  'con las tres preguntas separadas: un campo libre devuelve «no me sale nada», que no se contesta de una sola vez');
ok(/for update to authenticated[\s\S]{0,200}es_del_equipo/.test(sql),
  'responder es solo del equipo: si no, el cliente escribía su propia respuesta y el reporte salía de la cola sin que nadie lo lea');
ok(/vence_en[\s\S]{0,120}interval '48 hours'/.test(sql),
  'y el plazo se guarda al insertar');
ok(/calculara al leer|se calcula al insertar/.test(sql),
  'escrito por qué: calculado al leer, un feriado movería la fecha de un reporte viejo');

console.log('\n══ las mentorías con su link ══');
ok(/create table if not exists public\.sesiones_grupales/.test(sql), 'existen');
ok(/url_reunion/.test(sql) && /url_grabacion/.test(sql),
  'con el link para entrar y la grabación para quien no pudo');
ok(/tema text not null check \(tema in \('producto', 'marketing', 'ventas'\)\)/.test(sql),
  'los tres temas, el mismo reparto que los canales');
ok(/create table if not exists public\.asistencia_grupales/.test(sql),
  'y se guarda quién entró: alguien que faltó a tres seguidas está por irse, y eso no se veía');
ok(/grupales_seguidas_sin_entrar/.test(sql),
  'la consulta del equipo lo trae contado');
ok(/estado_de_acompanamiento/.test(sql),
  'en UNA consulta: con diez clientes, cuatro por cliente son cuarenta viajes para una pantalla diaria');
ok(/grant execute on function public\.estado_de_acompanamiento/.test(sql),
  'y con su permiso: sin el grant, el síntoma es una pantalla vacía sin error visible');

// ── 4 · A dónde va cada pregunta ───────────────────────────────────────────
console.log('\n══ «que ella los redirija a dónde corresponde» ══');
ok(A_DONDE_VA.length >= 8, 'está escrito, una sola vez y en un solo lugar');
ok(A_DONDE_VA.every((d) => d.donde.length > 8),
  'cada cosa con su destino');
const destinos = A_DONDE_VA.map((d) => `${d.donde} ${d.quien ?? ''}`).join(' ');
ok(/Sofi/.test(destinos) && /Mateo/.test(destinos), 'los entrenadores');
ok(/Javo/.test(destinos) && /Lupe/.test(destinos), 'y las dos personas');
ok(/martes/.test(destinos) && /miércoles/.test(destinos) && /jueves/.test(destinos),
  'con el día de la mentoría que lo trata');

ok(aDondeVa('cuánto cobro por mi programa')?.donde.includes('martes') === true,
  'una pregunta de precio va al martes');
ok(aDondeVa('mi anuncio no trae nadie')?.donde.includes('miércoles') === true,
  'una de anuncios al miércoles');
ok(aDondeVa('la app no me deja entrar')?.quien === 'Lupe',
  'y algo roto de la app, a Lupe');
ok(aDondeVa('hola qué tal') === null,
  'cuando no está seguro no sugiere: adivinar mal y mandarlo al lugar equivocado es peor');

// ── 5 · Cableado ──────────────────────────────────────────────────────────
console.log('\n══ y está en las pantallas ══');
ok(existsSync('src/pages/Acompanamiento.tsx'), 'la pantalla del cliente existe');
const cli = codigoDe('src/pages/Acompanamiento.tsx');
ok(/viaDe\(servicio\)/.test(cli), 'y mira lo que contrató');
ok(/<Mensajes/.test(cli),
  'el chat no se dibuja de nuevo: se incrusta el que ya existe, con su historial');
ok(/ElReporte/.test(cli), 'y el reporte para La Base');
ok(/INVITACION_AL_ACOMPANAMIENTO/.test(cli), 'con la invitación en vez del candado');
ok(/marcarQueEntro/.test(cli),
  'la asistencia se marca al entrar: nadie tiene que acordarse de tomarla');

const app = codigoDe('src/App.tsx');
ok(/<Acompanamiento/.test(app), 'está cableada en la app');
ok(!/<Mensajes userId=\{supabaseProfile\?\.id\} \/>/.test(app),
  'y reemplazó la pantalla de Soporte sola, sin sumar un sexto destino al menú');
const bottom = codigoDe('src/components/BottomTabBar.tsx');
const lateral = codigoDe('src/components/Sidebar.tsx');
// Esta asercion pedia la MISMA etiqueta en las dos navegaciones, y el medidor
// en Chromium real demostro que no se puede: «Acompañamiento» con cinco
// pestañas en 390 px se sale de la pantalla, y lo marco en las quince vistas
// del cliente a la vez. Lo que de verdad tiene que coincidir es el DESTINO
// —que es lo que verifica la lente de la auditoria, comparando ids— no el
// ancho del texto.
ok(/id: 'mensajes'/.test(bottom) && /id: 'mensajes'/.test(lateral),
  'las dos navegaciones llevan al mismo destino');
ok(/Acompañamiento/.test(lateral),
  'en el menú lateral, donde hay ancho, va el nombre completo');
ok(/label: 'Contacto'/.test(bottom),
  'y abajo va corto: con el nombre largo se salía de la pantalla en el teléfono');

console.log('\n══ el admin ══');
const hoy = codigoDe('src/components/admin/ListaDeHoy.tsx');
ok(/nombreCliente=\{/.test(hoy),
  'el HOY recibe el nombre del cliente');
ok(/clientes\.find\(\(c\) => c\.id === t\.clienteId\)/.test(hoy),
  'buscado por su id, no partiendo el título por un guion: si el título no traía guion, el cliente no aparecía');
ok(/'escribirle'/.test(hoy),
  'y siempre se le puede escribir, no solo cuando la tarea ya trae el mensaje escrito');
ok(existsSync('src/components/admin/SeguimientoDeTodos.tsx'),
  'está la pantalla de «cómo va cada uno»');
const seg = codigoDe('src/components/admin/SeguimientoDeTodos.tsx');
ok(/function loQueCorre/.test(seg),
  'con la regla del orden escrita aparte, no entre los colores');
ok(/queHacer/.test(seg) && /Al día/.test(seg),
  'cada fila dice qué hacer, incluso cuando no hace falta nada: una fila muda se lee como un dato que no cargó');
ok(/onAbrir\(\{/.test(seg),
  'y los botones están en la fila: sin eso son cuatro pasos por empujón, diez veces al día');
const admin = codigoDe('src/pages/Admin.tsx');
ok(/<SeguimientoDeTodos/.test(admin) && /<ReportesYGrupales/.test(admin),
  'las dos cableadas en el Admin');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
