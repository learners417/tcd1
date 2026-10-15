/**
 * LA REVISIÓN FINAL — lo que encontró, convertido en lentes.
 *
 * ═══ POR QUÉ ESTAS Y NO OTRAS ═══
 *
 * Todas estas fallaban en silencio. Ninguna rompía una pantalla, ninguna
 * aparecía en la consola, y la batería entera estaba en verde con las once
 * adentro. Es el patrón: un error que se ve es un error que se arregla.
 *
 * Correr con: npx tsx scripts/prueba-revision-final.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { jornadasCerradas, cierreDeCuentas, veredictoDeGarantia } from '../src/lib/cierreDeCuentas';
import { fechaDelDia } from '../src/lib/diaPrograma';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { tutorialEscrito } from '../src/lib/tutorialesDeLupe';
import { calcularCarga, ROLES, rolDe, TRASPASO } from '../src/lib/roles';
import { ROLES as PERMISOS, rolDe as rolPermisos } from '../src/lib/permisos';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const leer = (r: string) => (existsSync(r) ? readFileSync(r, 'utf-8') : '');

// ── 1 · El cliente puede salir de su cuenta ───────────────────────────────
console.log('══ cerrar sesión ══');
const app = leer('src/App.tsx');
const side = leer('src/components/Sidebar.tsx');
const top = leer('src/components/Topbar.tsx');
ok(/onOpenSettings=\{openSettings\}/.test(app) && (app.match(/onOpenSettings=\{openSettings\}/g) ?? []).length >= 2,
  'la función que abre su cuenta llega a las dos barras, no a una sola');
ok(/onClick=\{onOpenSettings\}/.test(side),
  'el Sidebar la USA: antes la recibía y no la usaba, así que nada abría el modal');
ok(/onClick=\{onOpenSettings\}/.test(top),
  'y el teléfono también tiene su botón: ahí no hay Sidebar');
ok(/Cerrar sesión/.test(app), 'y adentro está el cerrar sesión');

// ── 2 · Los 21 tutoriales ─────────────────────────────────────────────────
console.log('\n══ los tutoriales ══');
const seed = JSON.parse(leer('src/lib/roadmap.seed.json')) as {
  tutoriales: Array<{ codigo: string; dia: number }>;
  jornadas: Array<{ dia: number; tutoriales: string[] }>;
};
const sinTexto = seed.tutoriales.filter((t) => {
  const e = tutorialEscrito(t.codigo);
  return !e || !e.intro || e.pasos.length < 3 || !e.siFalla;
});
ok(sinTexto.length === 0,
  `los ${seed.tutoriales.length} tienen su paso a paso escrito (sin texto: ${sinTexto.map((t) => t.codigo).join(', ') || 'ninguno'})`);
const road = leer('src/pages/Roadmap.tsx');
ok(/roadmap\.tutoriales\.filter\(\(x\) => x\.dia === dia/.test(road),
  'y la jornada muestra TODOS los de su día: el 17 tiene seis y mostraba uno');
ok(/minutosTotales/.test(road), 'con el tiempo total, que es lo que necesita para elegir cuándo');

// ── 3 · Un solo sistema de roles ──────────────────────────────────────────
console.log('\n══ los roles del equipo ══');
const legados = ['owner', 'manager', 'staff', 'dev', 'desarrollo', 'produccion', 'editor', null];
ok(legados.every((l) => rolDe(l) === rolPermisos(l)),
  'las dos funciones que traducen el rol contestan lo mismo');
ok(Object.keys(PERMISOS).every((r) => Boolean(ROLES[r as keyof typeof ROLES])),
  'los cuatro roles existen en las dos tablas');
let crash: string | null = null;
for (const r of Object.keys(PERMISOS) as Array<keyof typeof PERMISOS>) {
  try { calcularCarga(r, { excepciones: 2, sesiones: 3, enInstalacion: 4 }); }
  catch (e) { crash = `${r}: ${(e as Error).message}`; }
}
ok(crash === null,
  `calcular la carga funciona con los cuatro: antes la pestaña Hoy se rompía (${crash ?? 'sin crash'})`);
ok(Object.keys(PERMISOS).every((r) => (TRASPASO[r as keyof typeof TRASPASO] ?? []).length >= 2),
  'y los cuatro tienen su traspaso escrito');
ok(!/as never/.test(leer('src/components/admin/Jornada.tsx')),
  'sin `as never`: era lo que tapaba el error de tipo que avisaba del crash');

// ── 4 · Los números del cliente llegan a la base ──────────────────────────
console.log('\n══ los números de su semana ══');
const sync = leer('src/lib/tableroSync.ts');
ok(/p_cliente_id: clienteId/.test(sync) && /p_semana_iso: semanaISO\(\)/.test(sync),
  'el RPC se llama con los nombres que declara la función: PostgREST resuelve por nombre de argumento');
ok(!/p_cliente: clienteId,\s*\n\s*p_semana:/.test(sync),
  'y ya no con los que parecían');
ok(/console\.error\('\[tableroSync\]/.test(sync),
  'y si falla se ve: el `return !error` daba la llamada por buena y los números no llegaban nunca');

// ── 5 · Los mensajes en vivo ──────────────────────────────────────────────
console.log('\n══ los mensajes ══');
const mig = leer('supabase/migrations/20261024_los_mensajes_en_vivo.sql');
ok(/supabase_realtime/.test(mig) && /mensajes/.test(mig),
  'la tabla de mensajes está en la publicación: seis suscripciones escuchaban una tabla que no publicaba');
ok(/replica identity full/.test(mig),
  'y con la fila vieja en el payload, que es lo que necesita el contador');
const cerebro = leer('src/lib/cerebroStorage.ts');
ok(/rpc\('crear_notificacion'/.test(cerebro) && !/from\('notificaciones'\)\.insert/.test(cerebro),
  'el aviso del equipo sale por el RPC: el insert directo lo rechaza la RLS en silencio');

console.log('\n══ el contador de respuestas sin abrir ══');
const acomp = leer('src/pages/Acompanamiento.tsx');
ok(/sinLeerDelCliente/.test(acomp) && /setPestana\('contacto'\)/.test(acomp),
  'con una respuesta sin abrir, la pantalla abre en Contacto y no en la comunidad');
ok(!/if \(currentPage === 'mensajes'\) setSoporteSinLeer\(0\)/.test(top),
  'y el globo no se apaga por entrar: se apagaba antes de que leyera la respuesta');
ok(!/if \(currentPage === 'mensajes'\) setSinLeer\(0\)/.test(leer('src/components/BottomTabBar.tsx')),
  'lo mismo en el teléfono');

// ── 6 · El veredicto de la garantía ───────────────────────────────────────
console.log('\n══ la garantía ══');
ok(/entregas=\{entregasReales\}/.test(app) && /fecha_completada/.test(app),
  'el atraso sale de la fecha que ya se guarda, no de una columna que nadie escribía');
const todas = new Set<string>();
for (const p of SEED_ROADMAP_V2) for (const m of p.metas) todas.add(`${p.numero}-${m.codigo}`);
const inicio = '2026-07-01';
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const conDias = (n: number) => {
  const o: Record<string, string> = {};
  for (const j of jornadasCerradas(todas, inicio, {})) {
    const f = fechaDelDia(inicio, j.dia);
    if (!f) continue;
    const d = new Date(f); d.setDate(d.getDate() + n);
    o[j.clave] = iso(d);
  }
  return o;
};
const atrasoDe = (n: number) => {
  const js = jornadasCerradas(todas, inicio, conDias(n));
  return js.reduce((t, j) => t + j.atraso, 0) / js.length;
};
ok(atrasoDe(0) === 0,
  'entregar en la fecha exacta es cero días de atraso: contaba uno, por comparar mediodía contra medianoche');
ok(atrasoDe(3) === 3 && atrasoDe(9) === 9, 'y tres días son tres, y nueve son nueve');
ok(/más de 7 días de atraso/.test(veredictoDeGarantia(cierreDeCuentas(todas, inicio, conDias(9)))),
  'con nueve días de atraso el veredicto lo dice');
ok(/a tiempo/.test(veredictoDeGarantia(cierreDeCuentas(todas, inicio, conDias(0)))),
  'y puntual, también');

// ── 7 · Los avisos tienen a dónde ir ──────────────────────────────────────
console.log('\n══ los avisos ══');
const mapa = new Map([...top.matchAll(/'(\/[a-z-]+)':\s*'([a-zA-Z]+)'/g)].map((m) => [m[1], m[2]]));
const validas = new Set([...(app.match(/const VALID_PAGES = \[[\s\S]*?\] as const/)?.[0] ?? '')
  .matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1]));
const destinos = new Set([...leer('src/lib/avisosCliente.ts').matchAll(/destino: '(\/[^']+)'/g)].map((m) => m[1]));
const perdidos = [...destinos].filter((d) => {
  const p = mapa.get(d);
  return !p || !validas.has(p);
});
ok(perdidos.length === 0,
  `los ${destinos.size} destinos de los avisos llegan a una página válida (perdidos: ${perdidos.join(', ') || 'ninguno'})`);
ok(mapa.get('/agentes') === 'entrenadores',
  'y el destino viejo de Entrenadores sigue andando: cuatro avisos lo usan');
ok(validas.has('creador') && validas.has('numero'),
  'las páginas que el router dibuja están en la lista de válidas: si no, al volver a la app cae en Hoy');

// ── 8 · Nada sin cablear, nada repetido ───────────────────────────────────
console.log('\n══ lo que sobra ══');
ok(existsSync('scripts/alcance.py'),
  'el alcance se mide caminando el grafo de imports, no con una lista a mano de arreglos viejos');
ok(!existsSync('src/lib/red.ts') && !existsSync('src/lib/tokens.ts')
  && !existsSync('src/components/ReporteDirector.tsx'),
  'y los módulos que ninguna pantalla podía alcanzar están fuera');
ok(existsSync('scripts/prueba-repetido.py'),
  'y lo repetido se mide en el navegador: buscarlo en el código daba falsos positivos');
ok(!/<Complementos \/>/.test(leer('src/pages/Biblioteca.tsx')),
  'los nueve videos del método están una vez, no dos');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
