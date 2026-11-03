/**
 * prueba-el-candado-no-depende-de-la-base.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * El Camino cierra los tramos que el cliente no compró y, en vez de un
 * candado mudo, pone la puerta que vende el escalón siguiente: «Se abre con
 * Tu Base · 497 USD — toca para verlo». Eso está bien hecho: el código
 * distingue el pilar cerrado POR FECHA —«Se abre el día 8», que llega solo—
 * del cerrado POR PLAN, que llega comprando.
 *
 * Lo que no estaba bien es de dónde sacaba el plan. Tres pantallas lo
 * decidían con `planDe(perfil)`, y ese perfil viene de Supabase: en App.tsx
 * es `null` mientras la base no contesta, y queda en `null` si no contesta
 * nunca. Con el perfil vacío, `planDe` cae en su respaldo de 'completo' y
 * **el candado comercial se abre solo**: sin internet, con un error de red, o
 * en el modo sin base. Y el contenido de las 91 jornadas viaja en el paquete
 * de la app, así que ahí quedaba todo a la vista.
 *
 * Ahora las tres usan `planDelCliente`, que mantiene el mismo orden de
 * siempre —lo que pagó manda— y agrega el respaldo que faltaba: si el perfil
 * no llegó, vale el espejo que `auth.ts` escribe en localStorage al entrar.
 * Si no hay ninguno de los dos se abre, porque a nadie se le cierra el Camino
 * por un fallo técnico: ese bug ya pasó una vez, con el que pagaba La Base y
 * seguía viendo el día 5 con candado justo después de pagar.
 *
 * Cómo se encontró: midiendo por primera vez lo que ve quien compró el
 * escalón de entrada. Las primeras dos mediciones dieron idénticas a las del
 * programa completo, y las dos veces el error era de la prueba —el plan
 * escrito en el campo que la app no mira— hasta que la tercera mostró que el
 * hueco era de verdad.
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

console.log('\n── el plan se lee de las dos fuentes ──');
const planes = leer('src/lib/planes.ts');
ok(
  /export function planDelCliente/.test(planes),
  'existe `planDelCliente`, que mira el perfil y, si no llegó, el espejo de localStorage',
);
ok(
  /if \(perfil\?\.plan_comercial \|\| perfil\?\.plan\) return planDe\(perfil\)/.test(planes),
  'con el perfil a mano, lo que pagó manda — el orden de siempre',
);
ok(
  /return planActual\(\);/.test(planes.slice(planes.indexOf('export function planDelCliente'))),
  'y sin perfil cae en el espejo, no en «completo»',
);

console.log('\n── y las pantallas del cliente la usan ──');
/*
 * `planDe` a secas se queda para quien SÍ tiene el perfil cargado de la base
 * —el Admin, que trabaja sobre la ficha de cada cliente— y para el propio
 * `planDelCliente`. Lo que no puede quedar es una pantalla del cliente
 * decidiendo su acceso con un perfil que puede no haber llegado.
 */
function delCliente(dir = 'src'): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.name === 'admin' || e.name === 'Admin.tsx') continue;
    if (e.isDirectory()) out.push(...delCliente(p));
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}
const conPlanDe = delCliente().filter((a) => /\bplanDe\s*\(/.test(leer(a)));
ok(
  conPlanDe.length === 0,
  conPlanDe.length === 0
    ? 'ninguna pantalla del cliente decide su acceso con el perfil solo'
    : `todavía usan planDe: ${conPlanDe.join(', ')}`,
);

const conElNuevo = delCliente().filter((a) => /planDelCliente\s*\(/.test(leer(a)));
ok(conElNuevo.length >= 3, `${conElNuevo.length} lo deciden con las dos fuentes`);

console.log('\n── la puerta dice qué la abre ──');
const roadmap = leer('src/pages/Roadmap.tsx');
ok(
  /Se abre con <strong>\{oferta\.nombre\}<\/strong>/.test(roadmap),
  'el tramo cerrado por plan dice con qué se abre y cuánto cuesta',
);
ok(
  /Se abre el día \$\{primerDiaDelPilar/.test(roadmap),
  'y el cerrado por fecha dice qué día, que es lo que sí llega solo',
);
ok(
  roadmap.indexOf("estado = 'plan_bloqueado'") > 0
  && /planPermitePilar\(planDelCliente\(perfil\), pilar\.numero\)/.test(roadmap),
  'y el candado comercial manda sobre el de fecha, no al revés',
);

console.log('\n── y lo primero que lee solo nombra lo suyo ──');
/*
 * «¿Qué ya tienes andando?» es la primera pantalla del Camino y tiene once
 * cosas repartidas por los noventa días. A quien compró el escalón de entrada
 * se le mostraban las once, así que lo primero que leía al abrir la app era
 * una lista de diez cosas que su plan no incluye: «tengo campañas corriendo»,
 * «tengo Meta conectado». Marcar cualquiera no le cambiaba nada, porque esas
 * jornadas no son suyas todavía. Las puertas del Camino ya le dicen con qué
 * se abre cada tramo; esta pantalla pregunta por lo que SÍ va a hacer.
 *
 * Medido: blanco ve 1, Tu Base 5, Tu Sistema 9 y el completo las 11.
 */
const partida = leer('src/components/PuntoDePartida.tsx');
ok(
  /const suyas = YA_TIENES\.filter/.test(partida),
  'el punto de partida solo nombra las jornadas que el plan alcanza',
);
ok(
  /planActualPermite\(pilar\)/.test(partida) && /pilarDelDia\(c\.dia\)/.test(partida),
  'y lo decide por el pilar de cada jornada, no por una lista a mano',
);
ok(
  /\{suyas\.map\(/.test(partida) && !/\{YA_TIENES\.map\(/.test(partida),
  'y pinta esa lista, no la entera',
);
ok(
  /export function pilarDelDia/.test(leer('src/lib/roadmapSeed.ts')),
  '`pilarDelDia` vive en el seed, que es donde está la correspondencia',
);

console.log('\n── el medidor mira ese estado ──');
const medidor = leer('scripts/medir-app.py');
ok(
  /PRIMERAS = \[/.test(medidor) && /'entrada', 1, 'blanco'/.test(medidor),
  'el medidor mide las pantallas con el escalón de entrada comprado',
);
ok(
  /plan_comercial: plan === 'implementacion' \? undefined : plan/.test(medidor),
  'y escribe el plan en el campo que la app realmente mira, que es donde falló dos veces',
);

console.log(fallas === 0 ? '\n✓ el candado aguanta sin base\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
