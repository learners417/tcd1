/**
 * prueba-el-progreso-no-se-borra.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * EL PROGRESO DEL CLIENTE SE BORRABA SOLO, EN TRES PANTALLAS
 *
 * Medido, no deducido: setenta y una jornadas guardadas pasaban a CERO en
 * menos de trescientos milisegundos al abrir El Camino, y no volvían. Y el
 * cliente ni siquiera podía entender qué pasó — con cero jornadas vuelve a
 * aparecer «¿Qué ya tienes andando?», la pregunta del día cero, así que lo que
 * ve es la app recién estrenada con su trabajo de setenta días adentro.
 *
 * Dos cosas al mismo tiempo, en el mismo arranque:
 *
 *   1. El efecto de persistencia corría en el PRIMER render, cuando
 *      `completadas` todavía es el `new Set()` vacío con el que arranca, y
 *      escribía ese vacío encima de lo guardado.
 *
 *   2. La carga desde la base hacía lo que su comentario decía —«la DB es la
 *      fuente de verdad»— y escribía su resultado tal cual encima del espejo
 *      local. Con la base devolviendo menos filas que el espejo (una cuenta
 *      nueva allá con progreso acá, un dispositivo que trabajó sin conexión,
 *      una escritura que no llegó) eso borra el trabajo del cliente, y en el
 *      modo sin base es su ÚNICA copia.
 *
 * Y un flag solo no alcanzaba: se marca al terminar la carga, pero
 * `setCompletadas` no se refleja hasta el render siguiente, así que entre
 * medio el efecto corre con el conjunto todavía vacío. Con el flag puesto, las
 * setenta y una se perdían igual. Hacen falta las tres cosas.
 *
 * Lo mismo estaba en DOS pantallas más, encontradas auditando quién escribe
 * esa clave: HOY —la pantalla de inicio, que corre en cada apertura— y el
 * CREADOR. Las tres comparten ahora un solo criterio, `unirProgreso`.
 *
 * Y unir a ciegas tampoco servía: desmarcar una jornada es un acto del
 * cliente, y la base lo guarda como una fila con `completada: false`. Si la
 * unión ignora esas filas, el desmarcado no llega nunca al otro dispositivo y
 * el tilde vuelve solo.
 *
 * Cómo se encontró: midiendo por primera vez la app CON DATOS. Con la cuenta
 * vacía no hay progreso que perder, así que cuarenta y ocho vistas en cero no
 * decían nada sobre esto.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { unirProgreso, claveDeJornada, CLAVE_PROGRESO } from '../src/lib/progresoDelCliente';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/* ═══ 1 · EL CRITERIO, EJERCITADO ═══════════════════════════════════════════
 *
 * Esto no mira el código: corre la función con los casos que de verdad pasan.
 */
console.log('\n── la base manda donde habla ──');

const setenta = Array.from({ length: 71 }, (_, i) => claveDeJornada(1 + (i % 9), `P${i}`));
const local = new Set(setenta);

ok(
  unirProgreso([], local).size === 71,
  'la base sin filas no toca las setenta y una del espejo',
);
ok(
  unirProgreso(null, local).size === 71 && unirProgreso(undefined, local).size === 71,
  'y una consulta sin datos tampoco',
);
ok(
  unirProgreso([{ pilar_numero: 4, meta_codigo: 'P4.9', completada: true }], local).size === 72,
  'una jornada cerrada allá que acá no estaba, se suma',
);
ok(
  !unirProgreso([{ pilar_numero: 1, meta_codigo: 'P0', completada: false }], local).has('1-P0')
  && unirProgreso([{ pilar_numero: 1, meta_codigo: 'P0', completada: false }], local).size === 70,
  'una jornada desmarcada allá se abre acá — el desmarcado viaja',
);
ok(
  unirProgreso([{ pilar_numero: 1, meta_codigo: 'P0', completada: null }], local).size === 70,
  'y una fila sin valor cuenta como abierta, que es lo que dice la base',
);
ok(
  unirProgreso([{ pilar_numero: null, meta_codigo: 'P3' }, { pilar_numero: 2, meta_codigo: null }], local).size === 71,
  'una fila a medias no nombra ninguna jornada y se saltea',
);
ok(
  unirProgreso(setenta.map((_, i) => ({ pilar_numero: 1 + (i % 9), meta_codigo: `P${i}`, completada: false })), local).size === 0,
  'y si la base desmarca las setenta y una, queda en cero — porque lo dijo',
);
/*
 * El caso que rompía: la base responde BIEN con cero filas. Eso no es «nada
 * está cerrado», es «no sé nada de esto».
 */
ok(
  unirProgreso([], new Set(['1-P1'])).has('1-P1'),
  'la base que responde bien con cero filas no borra nada',
);

/* ═══ 2 · Y UN SOLO LUGAR LO SABE ═══════════════════════════════════════════ */
console.log('\n── y las tres pantallas comparten el criterio ──');

const pantallas = {
  'El Camino': 'src/pages/Roadmap.tsx',
  Hoy: 'src/pages/Dashboard.tsx',
  'el Creador': 'src/pages/CreadorContenido.tsx',
};
for (const [nombre, ruta] of Object.entries(pantallas)) {
  const txt = leer(ruta);
  ok(
    /import \{[^}]*unirProgreso[^}]*\} from '\.\.\/lib\/progresoDelCliente';/.test(txt)
    && /unirProgreso\(/.test(txt),
    `${nombre} une con \`unirProgreso\``,
  );
  /*
   * Y ninguna escribe la clave a mano. Dos lugares escribiendo la misma clave
   * en el mismo arranque es exactamente cómo se perdía el progreso; que la
   * escritura pase por un solo módulo es lo que lo hace comprobable.
   */
  const aMano = [...txt.matchAll(new RegExp(`localStorage\\.setItem\\('${CLAVE_PROGRESO}'`, 'g'))].length;
  ok(aMano === 0, aMano === 0 ? `y no la escribe a mano` : `${nombre} la escribe a mano en ${aMano} lugar(es)`);
}
/*
 * Y ninguna de las tres filtra por `completada` en la consulta: si filtra, las
 * filas desmarcadas no llegan y el desmarcado deja de viajar.
 */
for (const [nombre, ruta] of Object.entries(pantallas)) {
  ok(
    !/\.eq\('completada', true\)/.test(leer(ruta)),
    `${nombre} trae también las filas desmarcadas`,
  );
}

/* ═══ 3 · NO SE ESCRIBE ANTES DE HABER LEÍDO ════════════════════════════════ */
const roadmap = leer('src/pages/Roadmap.tsx');

console.log('\n── y El Camino no escribe antes de haber leído ──');
ok(
  /const yaCargo = useRef\(false\);/.test(roadmap),
  'hay un `yaCargo` que marca cuándo terminó la carga',
);
ok(
  /if \(!yaCargo\.current\) return;/.test(roadmap),
  'y la persistencia no toca nada hasta entonces',
);
ok(
  /yaCargo\.current = true;[\s\S]{0,80}setLoading\(false\);\s*\n\s*return;/.test(roadmap),
  'se marca en la rama sin base, que es la del cliente que trabaja offline',
);
ok(
  /if \(completadas\.size === 0 && guardadas > 0\) return;/.test(roadmap),
  'y un conjunto vacío no se escribe cuando hay jornadas guardadas',
);
ok(
  /Un conjunto vacío se guarda solo si lo guardado también lo está/.test(roadmap),
  'con el porqué escrito, y el caso que deja afuera',
);
const escrituras = [...roadmap.matchAll(/guardarProgresoLocal\(/g)].length;
ok(
  escrituras === 1,
  escrituras === 1
    ? 'y queda UN solo lugar en El Camino que guarda el progreso'
    : `${escrituras} lugares lo guardan`,
);

/* ═══ 4 · Y LOS QUE YA LO HACÍAN BIEN SIGUEN ════════════════════════════════ */
console.log('\n── y lo que ya estaba bien sigue estando ──');
/*
 * La hoja de ruta que App.tsx trae de la base siempre se unió con lo local.
 * Era el único de los escritores que no borraba.
 */
const app = leer('src/App.tsx');
ok(
  /const locales = new Set<string>\(JSON\.parse\(localStorage\.getItem\('tcd_hoja_ruta_v2'\) \?\? '\[\]'\)\);/.test(app)
  && /\.forEach\(\(r\) => locales\.add\(/.test(app),
  'App.tsx suma las filas de la base a lo que ya había',
);
/*
 * Y los dos escritores que SÍ deben cambiar el set: El Número, que suma una
 * jornada sin tocar el resto, y la graduación, que reabre los cinco días a
 * pedido explícito del cliente. Ninguno de los dos reemplaza.
 */
ok(
  /if \(!arr\.includes\(claveDelDia\(1\)\)\) \{/.test(leer('src/lib/elNumero.ts')),
  'El Número suma su jornada sin tocar las demás',
);
const grad = leer('src/components/GraduacionSemanaBlanca.tsx');
ok(
  /window\.confirm\(/.test(grad) && /\.filter\(\(c\) => !CODS\.includes\(c\)\)/.test(grad),
  'y la graduación reabre solo los cinco días, y solo si el cliente lo confirma',
);

console.log(fallas === 0 ? '\n✓ el progreso del cliente no se borra solo\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
