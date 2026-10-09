/**
 * EL CANAL DEL SOPORTE — que no vuelva a desalinearse.
 *
 * ═══ QUÉ PASÓ ═══
 *
 * Había tres nombres de canal para la misma conversación: el cliente escribía
 * en 'Consultas Generales', el Admin leía 'privado' y la Bandeja de Soporte
 * leía 'humano'. **El mensaje del cliente quedaba guardado en la base y no
 * aparecía en ninguna pantalla del equipo.** Y la Bandeja no mostraba error:
 * mostraba «nadie esperando».
 *
 * Nada rompía, nada fallaba, ningún tipo lo atrapaba. Por eso esta prueba lee
 * el código fuente: lo que hay que verificar es que las cuatro puntas usen la
 * misma palabra, y eso no se puede probar llamando a una función.
 *
 * Correr con: npx tsx scripts/prueba-canal-soporte.ts
 */
import { readFileSync } from 'node:fs';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const leer = (p: string) => readFileSync(p, 'utf-8');

/**
 * El archivo sin sus comentarios.
 *
 * Los nombres viejos pueden quedar NOMBRADOS en un comentario —ahí explican
 * por qué se unificó el canal— pero no en una línea que se ejecute.
 */
const soloCodigo = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

const cliente = leer('src/pages/Mensajes.tsx');
const bandeja = leer('src/components/admin/BandejaSoporte.tsx');
const admin = leer('src/pages/Admin.tsx');
const cerebro = leer('src/lib/cerebroStorage.ts');
const avisos = leer('src/lib/notifications.ts');
const topbar = leer('src/components/Topbar.tsx');
const sidebar = leer('src/components/Sidebar.tsx');
const tipos = leer('src/lib/supabase.ts');
const mig = leer('supabase/migrations/20261009_canal_unico_soporte.sql');

// ── 1 · Los nombres viejos no están en ninguna parte ───────────────────────
console.log('══ los tres nombres son uno ══');
const TODAS = { cliente, bandeja, admin, cerebro, avisos };
for (const [donde, src] of Object.entries(TODAS)) {
  const codigo = soloCodigo(src);
  ok(!/Consultas Generales/.test(codigo), `${donde}: sin 'Consultas Generales'`);
  // Solo el CANAL: 'humano' también es el nombre de la pestaña del cliente.
  ok(!/canal:\s*'humano'|'canal',\s*'humano'/.test(codigo),
    `${donde}: sin el canal 'humano'`);
}

// ── 2 · Las cuatro puntas usan 'privado' ───────────────────────────────────
console.log('\n══ las cuatro puntas ══');
ok(/const CANAL_SOPORTE: CanalDeSoporte = 'privado'/.test(cliente),
  'el cliente escribe y lee en una constante tipada, no en un texto suelto');
ok(/canal:\s*CANAL_SOPORTE/.test(cliente), 'y la usa al enviar');
ok(/\.eq\('canal',\s*CANAL_SOPORTE\)/.test(cliente), 'y al cargar');
ok(/\.eq\('canal',\s*'privado'\)/.test(bandeja) && /\.is\('receptor_id',\s*null\)/.test(bandeja),
  'la bandeja busca el canal único, sin receptor = lo escribió el cliente');
ok(/canal:\s*'privado'/.test(cerebro),
  'el equipo responde por el mismo canal');
ok(/export type CanalDeSoporte = 'privado'/.test(tipos),
  'el tipo existe, así que el próximo cambio de un solo lado no compila');

// ── 3 · La fuga de privacidad ──────────────────────────────────────────────
console.log('\n══ cada uno ve lo suyo ══');
ok(/\.or\(`emisor_id\.eq\.\$\{userId\},receptor_id\.eq\.\$\{userId\}`\)/.test(cliente),
  'la consulta del cliente filtra por quién escribió: antes filtraba solo por canal y cada cliente leía el soporte de todos los demás');
ok(/m\.emisor_id === userId \|\| m\.receptor_id === userId/.test(cliente),
  'y lo que llega en vivo también se filtra');
ok(!/canal\.eq\."/.test(cliente),
  'sin canales entre comillas dobles: eso era lo que lo sacaba de «privado» y lo volvía legible por cualquiera');

// ── 4 · Se llega a la pantalla ─────────────────────────────────────────────
console.log('\n══ el cliente tiene por dónde escribir ══');
ok(/'\/mensajes': 'mensajes'/.test(topbar),
  'el aviso de «te respondieron» lleva a la conversación, no al tablero');
ok(!/oculto hasta que esté usable/.test(topbar),
  'ya no queda nada comentado con «oculto hasta que esté usable»');
ok(/id: 'mensajes', label: 'Soporte'/.test(topbar),
  'está en el buscador');
ok(/setCurrentPage\('mensajes'\)/.test(topbar) && /LifeBuoy/.test(topbar),
  'y hay un botón fijo en la barra de arriba, visible en todas las pantallas y también en el teléfono');
ok(!/id: 'mensajes', icon/.test(sidebar),
  'pero NO en el menú lateral: son cinco destinos y tienen que ser los mismos que la barra de abajo');
ok((soloCodigo(sidebar).match(/as MenuItem,/g) ?? []).length <= 5,
  'el menú sigue teniendo cinco destinos o menos');
ok(/accion_url: '\/mensajes'/.test(avisos),
  'el aviso del equipo apunta a Soporte');
ok(!/accion_url: '\/dashboard'/.test(cerebro),
  'y el de la cola también');

// ── 5 · El reloj de respuesta ──────────────────────────────────────────────
console.log('\n══ el compromiso se mide ══');
ok(/COMPROMISO\[tipo\]\.loQueSeDice/.test(cliente),
  'el cliente lee lo que le prometemos antes de escribir: estaba escrito en el código y solo lo veía el equipo');
ok(/setTipo\(t\)/.test(cliente) && /'duda', 'roto'/.test(cliente),
  'y elige si es una duda o algo roto, que es lo que arranca el reloj');
ok(/tipo,/.test(cliente), 'el tipo se guarda con el mensaje');
ok(/rpc\('marcar_respondido'/.test(admin),
  'al responder se cierra el reloj: sin esto la bandeja muestra a alguien ya atendido');
ok(/add column if not exists respondido_en/.test(mig),
  'y la columna existe aunque sala-de-mando.sql nunca haya corrido');

// ── 6 · Todo el equipo se entera ───────────────────────────────────────────
console.log('\n══ el aviso llega a todo el equipo ══');
ok(/admin_rol\.in\.\(owner,manager,staff\)/.test(avisos),
  'no solo a los dueños: quien tiene rol de staff o manager también recibe el aviso');
ok(!/\.eq\('rol', 'admin'\);/.test(avisos),
  'ya no se busca solo rol=admin, que dejaba a Lupe sin avisos');

// ── 7 · Lo que ya está guardado se muda ────────────────────────────────────
console.log('\n══ los mensajes que nadie vio ══');
ok(/update public\.mensajes/.test(mig) && /where canal = 'Consultas Generales'/.test(mig),
  'la migración mueve los mensajes que los clientes mandaron y nadie leyó');
ok(/receptor_id = null/.test(mig),
  'y los deja como entrantes, para que aparezcan en la bandeja');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
