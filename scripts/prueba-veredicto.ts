/**
 * EL VEREDICTO QUEDA — la prueba.
 *
 * ═══ QUÉ MIDE ═══
 *
 * El agujero era de recarga: la IA rechazaba la foto, el archivo quedaba en
 * Storage, el veredicto vivía en un `useState`, y al recargar la jornada se
 * destrababa con la foto rechazada. Así que lo primero que se mide es la
 * regla de la puerta: qué cuenta y qué no.
 *
 * Correr con: npx tsx scripts/prueba-veredicto.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import {
  cuenta, lecturaDelVeredicto, loQueDiceElVeredicto,
  type Veredicto, type EstadoEvidencia,
} from '../src/lib/veredictoEvidencia';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const leer = (r: string) => (existsSync(r) ? readFileSync(r, 'utf-8') : '');

const v = (estado: EstadoEvidencia, quien: 'ia' | 'equipo' = 'ia', motivo = ''): Veredicto => ({
  archivo: `evidencias/cli/P1.6/${estado}.jpg`,
  clienteId: 'cli', metaCodigo: 'P1.6', estado, quien, motivo,
  decididoEn: '2026-10-14T10:00:00Z',
});

// ── 1 · La regla de la puerta ─────────────────────────────────────────────
console.log('══ qué evidencia cuenta ══');
ok(cuenta('aprobada'), 'la aprobada cuenta');
ok(cuenta('pendiente'),
  'la que espera a una persona cuenta también: nadie queda trabado hasta que alguien abra el Admin');
ok(!cuenta('rechazada'), 'la rechazada NO cuenta: es la única que frena');
ok(cuenta(null) && cuenta(undefined),
  'y la que nadie juzgó cuenta: son las que ya estaban subidas antes de esta tabla');

// ── 2 · El conteo sale de la base, no de la carpeta ───────────────────────
console.log('\n══ el agujero de la recarga ══');
const coach = leer('src/components/tasks/TaskCoach.tsx');
ok(/evidenciasQueCuentan\(/.test(coach),
  'el conteo pasa por el veredicto, no por la cantidad de archivos de la carpeta');
ok(!/setEvidencias\(\(await listarEvidencias\(/.test(coach),
  'y ya no cuenta archivos: el rechazado seguía en Storage y destrababa la jornada con un F5');
ok(/await recontar\(uid\)/.test(coach),
  'después de subir se recuenta contra la base, que es donde está la verdad');
ok(/guardarVeredictoIA\(/.test(coach),
  'el veredicto de la IA se guarda');
ok(/const esImagen = file\.type\.startsWith\('image\/'\)/.test(coach)
  && /!esImagen[\s\S]{0,180}'pendiente'/.test(coach),
  'el audio, el video y los PDF van derecho a la cola: la IA solo mira imágenes');

// ── 3 · El motivo sobrevive a la recarga ──────────────────────────────────
console.log('\n══ por qué está trabada ══');
ok(loQueDiceElVeredicto(v('rechazada', 'ia', 'No se ve fuego')).includes('No se ve fuego'),
  'el motivo de la IA se le muestra al cliente');
ok(loQueDiceElVeredicto(v('rechazada', 'equipo', 'Falta el comprobante')).includes('La revisamos'),
  'y cuando lo decidió una persona, lo dice: no es lo mismo para quien lo lee');
ok(loQueDiceElVeredicto(v('aprobada')) === '' && loQueDiceElVeredicto(null) === '',
  'y no dice nada cuando no hay nada que decir');
ok(/frena &&/.test(coach) && /loQueDiceElVeredicto\(frena\)/.test(coach),
  'la pantalla del cliente muestra ese motivo al volver, que antes se perdía con el estado de React');

// ── 4 · Lo que lee el equipo ──────────────────────────────────────────────
console.log('\n══ la pantalla del equipo ══');
ok(lecturaDelVeredicto(null).tono === 'nadie',
  'un archivo sin veredicto se lee como lo que es: nadie lo juzgó');
ok(lecturaDelVeredicto(v('aprobada', 'ia')).texto.includes('testigo')
  && lecturaDelVeredicto(v('aprobada', 'equipo')).texto.includes('equipo'),
  'y la firma se lee: quién aprobó cambia qué hacer con eso');
ok(lecturaDelVeredicto(v('pendiente')).tono === 'espera',
  'lo que espera decisión se distingue de lo aprobado y de lo rechazado');

const cola = leer('src/components/admin/ColaDeEvidencias.tsx');
ok(/colaDeEvidencias\(\)/.test(cola),
  'la cola trae lo que espera decisión de TODOS los clientes en una consulta');
ok(/return null/.test(cola) && /cola\.length === 0/.test(cola),
  'y se calla cuando no hay nada: un panel que dice 0 todos los días se deja de leer');
ok(/onEscribirRechazo\(\{ archivo: fila\.archivo, motivo: fila\.motivo \}\)/.test(cola),
  'confirmar el rechazo es un toque: el motivo del testigo viene escrito');
ok(/export function FilaDeLaCola/.test(cola)
  && /FilaDeLaCola/.test(leer('scripts/prueba-pantallas.tsx')),
  'y la fila se monta de verdad en la prueba de humo: el render estático no corre los efectos');
ok(/fila\.jornadaCerrada &&/.test(cola),
  'y si esa jornada ya cerró, la fila lo dice: cambia la conversación');

const admin = leer('src/pages/Admin.tsx');
ok(/<ColaDeEvidencias/.test(admin) && admin.indexOf('<ColaDeEvidencias') > admin.indexOf('<BandejaSoporte'),
  'la cola vive en Hoy, abajo de quien espera respuesta: una persona esperando manda sobre un cliente trabado');
ok(/lecturaDelVeredicto\(v\)/.test(admin) && /decidirDesdeLaFicha\(/.test(admin),
  'y la ficha del cliente muestra el veredicto de cada archivo, con su decisión');
ok(!/g\.archivos\.map\(\(f\) => \(\s*<button key=\{f\.path\} onClick=\{\(\) => abrirEvidencia/.test(admin),
  'la pestaña ya no es una fila de botones sin estado, que era todo lo que el equipo veía');

// ── 5 · El circuito completo, del lado de la base ─────────────────────────
console.log('\n══ el SQL ══');
const mig = leer('supabase/migrations/20261025_el_veredicto_queda.sql');
ok(/create table if not exists public\.evidencia_veredictos/.test(mig),
  'la tabla existe, con el archivo como llave: un veredicto por archivo');
ok(/check \(estado in \('aprobada', 'pendiente', 'rechazada'\)\)/.test(mig),
  'y los tres estados son los únicos que entran');
ok(/for select to authenticated/.test(mig) && /cliente_id = auth\.uid\(\)/.test(mig),
  'el cliente LEE los suyos: necesita el motivo para saber qué subir');
ok(!/for all to authenticated\s*\n\s*using \(cliente_id = auth\.uid\(\)\)/.test(mig),
  'y no los escribe: escribir convertiría «la IA me rechazó» en «yo me aprobé»');
ok(/not like \('evidencias\/' \|\| p_cliente_id::text \|\| '\/%'\)/.test(mig),
  'el path lo arma el navegador, así que la función comprueba que esté en su carpeta');
ok(/where evidencia_veredictos\.quien = 'ia'/.test(mig),
  'y la IA no pisa lo que ya decidió una persona');
ok(/perform public\.crear_notificacion\(/.test(mig),
  'el aviso al cliente sale adentro del RPC: no existe el caso de la decisión guardada y el aviso que no salió');
ok(/'evidencia',/.test(mig) && /evidencia: ClipboardCheck/.test(leer('src/lib/avisoVisual.ts')),
  'y ese aviso llega con su icono, no con la campana genérica');
ok(/p_cliente_id  uuid default null/.test(mig),
  'el equipo puede decidir sobre una evidencia que la IA no miró: de esas no hay fila todavía');

// ── 6 · El icono del aviso vive en un solo lugar ──────────────────────────
console.log('\n══ lo que estaba dos veces ══');
ok(!/ICON_MAP/.test(leer('src/components/Topbar.tsx'))
  && !/ICON_MAP/.test(leer('src/components/NotificationBell.tsx')),
  'los mapas de icono y color estaban idénticos en dos pantallas: ahora están una vez');
ok(/comoSeVeElAviso/.test(leer('src/components/Topbar.tsx'))
  && /comoSeVeElAviso/.test(leer('src/components/NotificationBell.tsx')),
  'y las dos leen del mismo lugar, que es lo que hizo visible al tipo nuevo');

// ── 7 · Las pruebas que no miraban nada ───────────────────────────────────
console.log('\n══ los verificadores ══');
const sql = leer('scripts/prueba-sql.sh');
ok(/usuario_id uuid, pilar_numero int, meta_codigo text/.test(sql),
  'el andamiaje declara hoja_de_ruta con las columnas de verdad: tenía (user_id, codigo, estado), que no existen');
ok(/rpc-que-llama-la-app\.py/.test(sql) && !/for PAR in "guardar_semana_cliente/.test(sql),
  'los nombres de los RPC salen del código: la lista escrita a mano tenía cuatro de cincuenta y seis');
ok(existsSync('scripts/prueba-rpc-nombres.py'),
  'y hay una prueba que los cubre todos sin levantar Postgres');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
