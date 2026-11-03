/**
 * prueba-los-avisos-llevan-a-algun-lado.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Un aviso con destino dibuja un botón «Ver». Si el destino no resuelve a
 * ninguna pantalla, el botón no se dibuja: el aviso llega, suena, se ve, y el
 * clic no hace nada. No hay error en pantalla ni en la consola — es la clase
 * de falla que solo se descubre probándola a mano, aviso por aviso.
 *
 * Ya pasó dos veces:
 *
 *   · Cuatro avisos mandaban a `/agentes`, la ruta vieja de la pantalla de
 *     Entrenadores. Al unificar las rutas se quedó sin destino, y eran justo
 *     los cuatro que lo mandan a hablar con un entrenador.
 *   · Los avisos de tarea del equipo arman `/admin?tab=tareas&tareaId=…`, y
 *     la búsqueda era por clave exacta: con parámetros nunca encontraba nada.
 *     El panel del Admin lo resolvía con `includes`; la barra de arriba, no.
 *
 * Esta prueba lee los destinos que la app ESCRIBE —en `notifications.ts`, en
 * `avisosCliente.ts`, en `cerebroStorage.ts` y en el Admin— y exige que cada
 * uno exista en el mapa de la barra, con o sin parámetros. Cierra la clase
 * entera: cualquier destino nuevo que no resuelva aparece acá.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/* ── 1 · el mapa de la barra ─────────────────────────────────────────────── */
const topbar = leer('src/components/Topbar.tsx');
const bloque = topbar.slice(
  topbar.indexOf('const URL_TO_PAGE'),
  topbar.indexOf('};', topbar.indexOf('const URL_TO_PAGE')),
);
const CONOCIDAS = new Set(
  [...bloque.matchAll(/'(\/[^']*)':/g)].map((m) => m[1]),
);

console.log('\n── el mapa de destinos ──');
ok(CONOCIDAS.size >= 10, `la barra conoce ${CONOCIDAS.size} destinos`);
ok(
  /const sinParametros = accionUrl\.split\('\?'\)\[0\]/.test(topbar),
  'y los resuelve también cuando traen parámetros, como hace cualquier navegador',
);

/* ── 2 · los destinos que la app escribe ─────────────────────────────────── */
function archivos(dir = 'src'): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

/*
 * Se buscan las direcciones escritas a mano. Las que se arman con una
 * variable —`destino`, `plantilla.destino`— se revisan por su definición, que
 * también es una dirección escrita a mano en alguno de estos archivos.
 */
const DIRECCION = /['"`](\/[a-z][a-z0-9/-]*(?:\?[^'"`]*)?)['"`]/gi;
const escritos = new Map<string, string[]>();
for (const a of archivos()) {
  if (a.endsWith('Topbar.tsx')) continue; // es el mapa, no un emisor
  const t = leer(a).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  // solo las líneas que hablan de un destino de aviso
  for (const linea of t.split('\n')) {
    if (!/accion_url|destino/.test(linea)) continue;
    for (const m of linea.matchAll(DIRECCION)) {
      const d = m[1];
      if (!escritos.has(d)) escritos.set(d, []);
      escritos.get(d)!.push(a);
    }
  }
}

console.log('\n── cada aviso llega a una pantalla ──');
const perdidos: string[] = [];
for (const [destino, donde] of escritos) {
  const base = destino.split('?')[0];
  if (!CONOCIDAS.has(destino) && !CONOCIDAS.has(base)) {
    perdidos.push(`${destino} (${[...new Set(donde)].join(', ')})`);
  }
}
ok(
  perdidos.length === 0,
  perdidos.length === 0
    ? `los ${escritos.size} destinos que la app escribe resuelven a una pantalla`
    : `sin destino: ${perdidos.join(' · ')}`,
);

/* ── 3 · y el revés: un destino del mapa que ya no existe como pantalla ──── */
const destinos = leer('src/lib/destinos.ts');
const PANTALLAS = new Set([...destinos.matchAll(/id: '([a-z-]+)'/g)].map((m) => m[1]));
// Las del equipo no viven en destinos.ts: el Admin tiene sus propias pestañas.
const DEL_EQUIPO = /^admin-/;
const paginas = [...bloque.matchAll(/:\s*'([a-z-]+)'/g)].map((m) => m[1]);
const huerfanas = [...new Set(paginas)].filter(
  (p) => !PANTALLAS.has(p) && !DEL_EQUIPO.test(p),
);
ok(
  huerfanas.length === 0,
  huerfanas.length === 0
    ? 'ninguna entrada del mapa apunta a una pantalla que ya no existe'
    : `apuntan a pantallas inexistentes: ${huerfanas.join(', ')}`,
);

/* ── 4 · los avisos que nadie dispara ─────────────────────────────────────── */
/*
 * Un aviso escrito y sin llamar no está roto: está esperando. Pero si nadie
 * los cuenta, el montón crece y un día no se distingue el que falta conectar
 * del que ya no va. Ocho están documentados en notifications.ts con su razón;
 * esta cuenta avisa cuando aparece uno más.
 */
console.log('\n── los avisos construidos y todavía sin disparar ──');
const notif = leer('src/lib/notifications.ts');
const declarados = [...notif.matchAll(/export async function (notificar\w+)/g)].map((m) => m[1]);
const otros = archivos().filter((a) => !a.endsWith('lib/notifications.ts')).map(leer).join('\n');
const sinLlamar = declarados.filter((n) => !new RegExp(`\\b${n}\\b`).test(otros));
const ESPERADOS = 8;
ok(
  sinLlamar.length <= ESPERADOS,
  sinLlamar.length <= ESPERADOS
    ? `${sinLlamar.length} de ${declarados.length} esperan quién los toque, y están explicados`
    : `${sinLlamar.length} sin disparar, ${sinLlamar.length - ESPERADOS} más de los documentados: ${sinLlamar.join(', ')}`,
);

console.log(fallas === 0 ? '\n✓ los avisos llevan a algún lado\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
