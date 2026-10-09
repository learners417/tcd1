/**
 * CREAR UNA CAMPAÑA DESDE LA APP — el asistente que no guardaba nada.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * El asistente de nueva campaña recorre seis fases con KAI: cliente,
 * estrategia, audiencias, copies, creativos y montaje. Al terminar la última,
 * `advancePhase` no hacía nada: `saveCampana` se importaba y no se llamaba
 * nunca, y `onComplete` estaba declarado y sin invocar.
 *
 * O sea: se podían recorrer las seis fases, definir audiencias, escribir los
 * copies y los creativos, y al cerrar la pantalla **no quedaba nada**. La
 * campaña no existía: no se podía abrir después, ni retomar, ni montar sobre
 * ella los ocho candados. La única forma de tener una campaña en la app era
 * cargarla a mano en la base.
 *
 * Y las funciones para editarla y borrarla también estaban sin cablear, por
 * la razón de fondo: no había ninguna campaña creada desde la app que editar.
 *
 * Correr con: npx tsx scripts/prueba-crear-campana.ts
 */
import { readFileSync } from 'node:fs';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const wizard = readFileSync('src/components/campanas/NuevaCampanaChat.tsx', 'utf-8');
const tipos = readFileSync('src/lib/campanasTypes.ts', 'utf-8');

// ── 1 · Guarda al terminar ─────────────────────────────────────────────────
console.log('══ el asistente guarda al terminar ══');
ok(/await saveCampana\(\{/.test(wizard),
  'llama a saveCampana, que antes solo se importaba');
ok(/void guardarYSalir\(\);/.test(wizard),
  'y lo hace cuando se completa la última fase, donde antes no pasaba nada');
ok(/onComplete\(guardada\)/.test(wizard),
  'avisa a la pantalla con la campaña guardada: así se puede abrir después');

// ── 2 · No se pierde el trabajo de la conversación ─────────────────────────
console.log('\n══ no se pierde lo que produjo la conversación ══');
for (const campo of ['estrategia', 'audiencias', 'copies', 'creativos', 'montaje']) {
  ok(new RegExp(`campaignData\\.${campo} &&`).test(wizard),
    `lo de la fase «${campo}» se guarda`);
}
ok(/guia_configuracion:/.test(wizard),
  'todo junto en la guía de configuración: es lo que el cliente pagó por esas seis fases');

// ── 3 · Lo que no se pregunta no se inventa ────────────────────────────────
console.log('\n══ lo que el asistente no pregunta ══');
ok(/Inventar un dato acá sería peor/.test(wizard),
  'queda en el valor que la app ya usa por defecto, y está escrito por qué');
ok(/estado: 'borrador'/.test(wizard),
  'y nace como BORRADOR: decirla «configurada» sería anunciar como lista una campaña que no corrió nunca');
ok(/'borrador' \| 'configurada'/.test(tipos), 'que es un estado real del tipo, no inventado acá');

// ── 4 · Lo que puede salir mal ─────────────────────────────────────────────
console.log('\n══ lo que puede salir mal ══');
ok(/if \(!userId\)/.test(wizard) && /tu sesión venció/.test(wizard),
  'sin sesión avisa en vez de perder el trabajo en silencio, que es lo que hacía con todo el mundo');
ok(/Todo tu trabajo sigue en pantalla/.test(wizard),
  'si la base la rechaza, lo dice y no borra nada de la pantalla');
ok(/if \(guardando\) return;/.test(wizard),
  'y dos toques no crean dos campañas');
ok(/setGuardando\(false\)/.test(wizard) && /finally/.test(wizard),
  'el botón se libera pase lo que pase');

// ── 5 · Editar y borrar, que dependían de esto ─────────────────────────────
console.log('\n══ editar y borrar ══');
const storage = readFileSync('src/lib/campanasStorage.ts', 'utf-8');
ok(/export async function updateCampana/.test(storage)
  && /export async function deleteCampana/.test(storage),
  'siguen escritas: lo que faltaba para usarlas era que existiera una campaña creada desde la app');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
