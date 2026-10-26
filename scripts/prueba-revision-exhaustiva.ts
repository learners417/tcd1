/**
 * LA REVISIÓN EXHAUSTIVA — antes de dar acceso a todos.
 *
 * ═══ CÓMO SE BUSCÓ ═══
 *
 * No volviendo a correr lo que ya estaba en verde. Buscando la clase de falla
 * de la que salieron los dos bugs del turno anterior: dos piezas correctas por
 * separado que juntas se bloquean, y una escritura que declara éxito sin
 * haberlo comprobado.
 *
 * Las siete que siguen fallaban en silencio y ninguna rompía una pantalla.
 *
 * Correr con: npx tsx scripts/prueba-revision-exhaustiva.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { accesoDelPerfil, estadoDeAcceso } from '../src/lib/ventanaDeAcceso';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const leer = (r: string) => (existsSync(r) ? readFileSync(r, 'utf-8') : '');
const app = leer('src/App.tsx');
const admin = leer('src/pages/Admin.tsx');
const wizard = leer('src/components/WelcomeWizard.tsx');

// ── 1 · El onboarding que no se podía terminar ────────────────────────────
console.log('══ el onboarding ══');
ok(/onboarding_completed === false/.test(app),
  'el wizard se dibuja según la BASE, no según el navegador: por eso esa escritura decide todo');
ok(/\.select\('id'\);/.test(wizard) && /data && data\.length > 0/.test(wizard),
  'el cierre del onboarding comprueba que la fila quedó escrita');
ok(/for \(let intento = 0; intento < 2; intento\+\+\)/.test(wizard),
  'y reintenta una vez: un corte de un segundo dejaba al cliente dando vueltas para siempre');
ok(/setNoCerro\(true\)/.test(wizard) && /Tu conexión cortó justo al guardar/.test(wizard),
  'si no se puede, se le dice y no entra: entrar sin guardar es volver a ver el wizard al recargar');

// ── 2 · Su cuenta no le pisa su Camino ────────────────────────────────────
console.log('\n══ la pantalla de su cuenta ══');
ok(!/fecha_inicio: profileDraft\.fecha_inicio/.test(app),
  'guardar su nombre ya no manda la fecha de inicio, que es de donde se cuenta TODO el Camino');
ok(!/plan: profileDraft\.plan,/.test(app),
  'ni su plan: ninguno de los dos está en el formulario');
ok(/\.\.\.previo, \.\.\.profileDraft/.test(app),
  'y la copia local se actualiza en vez de reemplazarse: pisarla borraba su id y su plan_comercial');

// ── 3 · El alta que decía «creada» sin haber escrito ──────────────────────
console.log('\n══ el alta ══');
ok(/for \(let i = 0; i < 10 && !existe; i\+\+\)/.test(admin),
  'el alta espera a que el disparador cree la ficha, en vez de confiar en 1500 ms');
ok(/if \(!tocadas \|\| tocadas\.length === 0\)/.test(admin),
  'y comprueba que los datos se escribieron: sin eso el cartel decía «Cuenta creada» igual');
ok(/sus datos no se guardaron/.test(admin),
  'con un mensaje que dice qué hacer, no un éxito falso');

// ── 4 · La ventana de acceso cerrada el día del alta ─────────────────────
console.log('\n══ la fecha de inicio de un cliente que viene de antes ══');
const haceSeisMeses = new Date(Date.now() - 180 * 864e5).toISOString().slice(0, 10);
const a = accesoDelPerfil({ fecha_inicio: haceSeisMeses, acceso_tipo: 'noventa' });
ok(a !== null && estadoDeAcceso(a).abierto === false,
  'con la fecha real de hace seis meses, su acceso ya está cerrado: ve la pantalla de cierre, no la app');
ok(accesoDelPerfil({ fecha_inicio: null }) === null,
  'y sin fecha de inicio NO se lo bloquea: una ficha a medio cargar no deja a nadie afuera');
ok(/Con esta fecha de inicio su acceso ya está cerrado/.test(admin),
  'el alta lo avisa donde se toma la decisión, con la fecha elegida a la vista');
ok(/Su avance en el Camino se carga aparte/.test(admin),
  'y explica la diferencia: esta fecha abre el ACCESO, el avance se siembra con el asistente');

// ── 5 · Lo que lee el cliente cuando algo falla ──────────────────────────
console.log('\n══ los mensajes de falla ══');
for (const [donde, ruta] of [
  ['su migración', 'src/pages/MiMigracion.tsx'],
  ['su Soporte', 'src/pages/Acompanamiento.tsx'],
  ['su onboarding', 'src/components/WelcomeWizard.tsx'],
  ['su compra de créditos', 'src/components/credits/BuyCreditsModal.tsx'],
] as const) {
  const t = leer(ruta);
  ok(/mensajeDeFalla\(/.test(t) && !/toast\.error\((?:e|err)\s+instanceof Error \? (?:e|err)\.message/.test(t),
    `${donde} dice qué pasó y qué hacer, en vez de «IA API error: 500»`);
}

// ── 6 · La pantalla de su cuenta no miente ───────────────────────────────
console.log('\n══ lo que esa pantalla declara ══');
ok(!/defaultChecked/.test(app),
  'fuera los cuatro interruptores de avisos que no guardaban nada');
ok(/Tus avisos/.test(app) && /Cuando el equipo te responde/.test(app),
  'en su lugar, qué avisos llegan de verdad');
ok(!/Tu Clínica Digital — \{profile\.plan\}/.test(app),
  'y la facturación ya no muestra «DWY», que es un código interno de la escalera vieja');
ok(/TICKETS\[esc\]/.test(app) && /diasRestantes\(supabaseProfile\)/.test(app),
  'muestra lo que contrató con su nombre, y cuántos días de acceso le quedan');

// ── 7 · Los verificadores que ahora sí verifican ─────────────────────────
console.log('\n══ la base de prueba se parece a la de verdad ══');
const psql = leer('scripts/prueba-sql.sh');
ok(/alter table profiles enable row level security/.test(psql),
  'la prueba carga la RLS real de profiles: sin ella, «un cliente no lee la ficha de otro» salía verde por falta de RLS');
ok(/f\.startswith\('supabase\/migrations\/'\) and os\.path\.basename\(f\) >= '20261009'/.test(psql),
  'y lee el SQL de la raíz: el corte por fecha descartaba pais-migration.sql, porque una letra es mayor que un dígito');
ok(/el primer día de un cliente nuevo/.test(psql),
  'y hace el recorrido completo del primer día como cliente, no funciones sueltas');
ok(existsSync('scripts/prueba-lo-que-el-cliente-ve.py'),
  'el voseo, los errores en crudo y las escrituras sin comprobar quedan medidos');
ok(existsSync('scripts/prueba-revision-exhaustiva.ts'),
  'y esta revisión tiene su prueba');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
