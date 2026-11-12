/**
 * LOS TRES NÚMEROS LLEGAN A LA BASE, Y EL CUELLO LLEGA AL DÍA SIGUIENTE
 *
 * ═══ QUÉ PASÓ ═══
 *
 * La matemática de los 10 estaba completa y medida: la cadena, las tres
 * tasas, el pedido del viernes, los tres cuellos y la acción de cada uno.
 * Todo escrito, todo correcto, y **todo muerto en el navegador**.
 *
 * `src/lib/tablero.ts` lo importaba UN solo archivo —la tarjeta— y no había
 * ninguna lente sobre él. Lo que se cargaba el viernes se guardaba en
 * `localStorage` y en ningún otro lado:
 *
 *   · dos tarjetas más arriba, en la MISMA pantalla, `TableroDeLaSemana` lee
 *     la base y le seguía diciendo «todavía no cargaste tus números»;
 *   · la cola del equipo lo marcaba sin datos todas las semanas;
 *   · el cron le mandaba el aviso de que faltaban;
 *   · su «X de 10 {{consultantes}}» arrancaba de cero en otro dispositivo;
 *   · y el espejo usaba OTRA llave de semana —el lunes en fecha corta— que la
 *     fila de la base, así que ni reconocerse podían.
 *
 * Y no era falta de cañería: la migración `20261021_sus_numeros_son_suyos`
 * abrió la tabla y el RPC exactamente para esto —«ahora cada uno lee y carga
 * los suyos»— y esta pantalla, que es la que se lo pide, nunca se cableó.
 *
 * ═══ LO SEGUNDO, QUE BORRABA DATOS AJENOS ═══
 *
 * `guardar_semana_cliente` es un UPSERT que pisa las veintiuna columnas y
 * pone en cero lo que no venga. `subirNumerosDelCliente` le mandaba cuatro.
 * Cargar los números del Constructor borraba de esa semana lo facturado y lo
 * cobrado que había anotado el equipo, las llamadas y las ventas. Con éxito
 * en la respuesta.
 *
 * ═══ LO TERCERO: EL DIAGNÓSTICO NO CAMBIABA NINGÚN DÍA ═══
 *
 * `diagnosticar` no la llamaba nadie más que la tarjeta. El cliente leía «tu
 * cuello es el cierre» el viernes y el sábado la app abría igual que el día 3.
 *
 * ═══ QUÉ MIRA ESTA LENTE ═══
 *
 * Que la pantalla que pide los tres números escriba en la base. Que NADIE
 * escriba campos sueltos contra ese RPC. Que la fusión no pierda ninguna de
 * las veintiuna columnas. Que haya una sola llave de semana. Que el cuello
 * llegue a la lista del día y que su destino sea una página que el router
 * dibuja de verdad.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  META_PACIENTES, TASA_AGENDA, TASA_ASISTENCIA, TASA_CIERRE,
  cadenaPara, metaSemanal, diagnosticar, lunesDeEstaSemana,
  trabajoDeHoy, TRABAJO_POR_CUELLO, type Diagnostico, type SemanaTablero,
} from '../src/lib/tablero';
import { LOS_TRES, fusionar } from '../src/lib/losDiezEnLaBase';
import { SEMANA_VACIA, type NumerosSemana } from '../src/lib/valueChain';
import { semanaISO } from '../src/lib/bitacoraCampana';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/* ════════════════ 1 · la pantalla que los pide, los sube ════════════════ */

console.log('\n── la tarjeta del viernes escribe en la base ──');

const TARJETA = 'src/components/TableroNumeros.tsx';
const tarjeta = leer(TARJETA);

ok(/from '\.\.\/lib\/losDiezEnLaBase'/.test(tarjeta),
  'la tarjeta importa el camino a la base');
ok(/guardarFusionado\s*\(/.test(tarjeta),
  'y lo llama: lo que carga el cliente sale del navegador');
ok(/leerLosTres\s*\(/.test(tarjeta),
  'y lee de la base al abrir, así el dato no es del dispositivo');
ok(/ventasAcumuladas\s*\(/.test(tarjeta),
  'la cuenta de «X de 10» sale de todas sus semanas, no del navegador');
ok(/clienteId/.test(tarjeta),
  'recibe a quién pertenecen los números');

// Que la pantalla reciba el cliente desde Hoy: sin eso, todo lo de arriba
// existe y no se dispara nunca — el defecto del turno 15, otra vez.
const HOY = 'src/pages/Dashboard.tsx';
const hoy = leer(HOY);
ok(/<TableroNumeros[^>]*clienteId=\{/.test(hoy),
  'y Hoy se lo pasa al montarla');

/* ════════ 2 · nadie escribe campos sueltos contra el RPC ════════ */

console.log('\n── todo lo que escribe la semana escribe la fila entera ──');

/*
 * El RPC pisa las veintiuna columnas. Un llamador que le mande un objeto
 * armado a mano borra lo que no nombró, y devuelve éxito.
 *
 * Los dos caminos legítimos son: `guardarFusionado` —que trae la semana y le
 * encima lo nuevo— y `mesaPlataStorage.guardarSemana`, que recibe el
 * `NumerosSemana` completo de la Mesa de plata. Cualquier otro archivo que
 * nombre el RPC es un escritor nuevo sin fusionar.
 */
const PERMITIDOS = new Set(['src/lib/losDiezEnLaBase.ts', 'src/lib/mesaPlataStorage.ts']);
const { execSync } = await import('node:child_process');
// La LLAMADA, no la mención: los comentarios que cuentan este defecto nombran
// el RPC, y buscar el nombre suelto marcaba en rojo al archivo que lo explica.
const nombran = execSync(
  "grep -rlE \"rpc\\(\\s*['\\\"]guardar_semana_cliente\" src/ api/ 2>/dev/null || true",
  { cwd: raiz, encoding: 'utf8' },
).split('\n').filter(Boolean);

ok(nombran.length > 0, `el RPC se llama desde ${nombran.length} archivo(s) del código`);
for (const f of nombran) {
  ok(PERMITIDOS.has(f),
    PERMITIDOS.has(f)
      ? `${f} escribe la fila entera`
      : `${f} llama al RPC sin fusionar: lo que no nombre se va a cero`);
}

// Y el que antes escribía cuatro campos ahora pasa por la fusión.
const sync = leer('src/lib/tableroSync.ts');
ok(/guardarFusionado\s*\(/.test(sync),
  'el tablero de cupos fusiona en vez de pisar la semana');
ok(!/rpc\('guardar_semana_cliente'/.test(sync),
  'y ya no llama al RPC por su cuenta');

/* ════════════════ 3 · la fusión no pierde ninguna columna ════════════════ */

console.log('\n── la fusión preserva lo que no toca ──');

const semanaDelEquipo: NumerosSemana = {
  ...SEMANA_VACIA,
  precio: 1000, gasto: 250, impresiones: 40_000, alcance: 12_000,
  piezasPublicadas: 7, mensajesEnviados: 30, comentarios: 44,
  conversaciones: 80, agendas: 15, llamadasTomadas: 10,
  ofertasPresentadas: 9, ventas: 2, facturado: 2000, cobrado: 1000,
  cuotasPorCobrar: 1000, cuotasCobradas: 0,
  clientesActivos: 4, clientesQueTerminan: 1, renovaciones: 1,
  referidos: 2, casosDeExito: 1,
};

const tras = fusionar(semanaDelEquipo, { conversaciones: 300, llamadasTomadas: 40, ventas: 10 });

ok(tras.conversaciones === 300 && tras.llamadasTomadas === 40 && tras.ventas === 10,
  'los tres que carga el cliente se mueven');

const intactos = (Object.keys(SEMANA_VACIA) as Array<keyof NumerosSemana>)
  .filter((k) => !(LOS_TRES as readonly string[]).includes(k));
const perdidos = intactos.filter((k) => tras[k] !== semanaDelEquipo[k]);
ok(perdidos.length === 0,
  perdidos.length === 0
    ? `las otras ${intactos.length} columnas quedan como estaban`
    : `se perdieron: ${perdidos.join(', ')}`);

// Lo que habría cazado el defecto original: escribir solo los tres campos.
const aMano = { conversaciones: 300, llamadasTomadas: 40, ventas: 10 } as unknown as NumerosSemana;
// Solo cuentan las que tenían algo que perder: `cuotasCobradas` ya estaba en
// cero esa semana, y una columna en cero que queda en cero no es un borrado.
const conDato = intactos.filter((k) => semanaDelEquipo[k] !== 0);
const borradas = conDato.filter((k) => (aMano[k] ?? 0) !== semanaDelEquipo[k]);
ok(borradas.length === conDato.length && conDato.length > 0,
  `y escribir los tres sueltos habría borrado las ${borradas.length} que tenían dato — por eso la fusión`);

console.log('\n── y la primera carga de la semana sale completa ──');
const primera = fusionar(null, { ventas: 1 });
const huecos = (Object.keys(SEMANA_VACIA) as Array<keyof NumerosSemana>)
  .filter((k) => typeof primera[k] !== 'number');
ok(huecos.length === 0,
  huecos.length === 0
    ? `las ${Object.keys(SEMANA_VACIA).length} columnas llegan como número`
    : `llegarían sin valor: ${huecos.join(', ')}`);
ok(primera.ventas === 1 && primera.gasto === 0, 'con lo cargado encima de la fila vacía');

console.log('\n── y un número imposible no entra ──');
const sucio = fusionar(null, { ventas: -4, conversaciones: Number.NaN, llamadasTomadas: 2.6 });
ok(sucio.ventas === 0 && sucio.conversaciones === 0 && sucio.llamadasTomadas === 3,
  'negativo y NaN caen en cero; el decimal se redondea');

/* ════════════════ 4 · una sola llave de semana ════════════════ */

console.log('\n── el espejo y la base nombran igual a la misma semana ──');
ok(lunesDeEstaSemana() === semanaISO(),
  `el espejo dice «${lunesDeEstaSemana()}» y la base «${semanaISO()}»`);
ok(/^\d{4}-W\d{2}$/.test(lunesDeEstaSemana()),
  'y es la semana ISO, que es la que indexa la tabla');

/* ════════ 5 · los tres nombres son los de la cadena ════════ */

console.log('\n── los tres que pide son columnas de la cadena ──');
for (const k of LOS_TRES) {
  ok(k in SEMANA_VACIA, `${k} existe en la cadena`);
}

/* ════════════════ 6 · el diagnóstico sigue nombrando los tres cuellos ════ */

console.log('\n── los tres cuellos se reconocen ──');
const metaDePrueba = metaSemanal(30, 0);
const caso = (s: Omit<SemanaTablero, 'fecha'>): Diagnostico['cuello'] =>
  diagnosticar({ ...s, fecha: '' }, metaDePrueba).cuello;

ok(caso({ conversaciones: 3, llamadas: 0, ventas: 0 }) === 'volumen',
  'poca gente escribiendo → volumen');
ok(caso({ conversaciones: metaDePrueba.conversaciones, llamadas: 0, ventas: 0 }) === 'filtro',
  'escriben y no agendan → filtro');
ok(caso({ conversaciones: metaDePrueba.conversaciones, llamadas: metaDePrueba.llamadas, ventas: 0 }) === 'cierre',
  'llamadas que ocurren y no cierran → cierre');
ok(caso({
  conversaciones: metaDePrueba.conversaciones,
  llamadas: metaDePrueba.llamadas,
  ventas: Math.ceil(metaDePrueba.ventas),
}) === 'ninguno', 'los tres en su lugar → ninguno');

/* ════════ 7 · hay trabajo escrito para cada cuello, y llega a Hoy ════════ */

console.log('\n── cada cuello tiene su trabajo del día siguiente ──');

/*
 * Los cuellos no se escriben a mano acá: se leen del tipo `Diagnostico` en
 * `tablero.ts`, así el día que entre un cuarto cuello esta lente lo pide sola
 * en vez de ignorarlo.
 */
const fuenteTablero = leer('src/lib/tablero.ts');
const bloque = fuenteTablero.match(/cuello:\s*((?:'[a-z]+'\s*\|\s*)*'[a-z]+')/);
const cuellos = (bloque?.[1].match(/'([a-z]+)'/g) ?? []).map((c) => c.replace(/'/g, ''));
ok(cuellos.length >= 4, `el tipo declara ${cuellos.length} cuellos: ${cuellos.join(', ')}`);

for (const c of cuellos) {
  if (c === 'ninguno') {
    ok(!(c in TRABAJO_POR_CUELLO),
      'a quien va en ritmo no se le inventa trabajo: «no cambies nada» no es un movimiento');
    continue;
  }
  ok(c in TRABAJO_POR_CUELLO, `${c} tiene trabajo escrito`);
}

console.log('\n── y el destino de cada uno es una página que el router dibuja ──');

/*
 * Lo que habría cazado el error que cometí al escribir esto: mandé el cuello
 * del filtro y el del cierre a 'agentes', que era la ruta vieja de
 * Entrenadores. Salió del router al unificar las dos rutas, así que
 * `setCurrentPage('agentes')` deja la pantalla en blanco — sin romper nada.
 */
const app = leer('src/App.tsx');
const listado = app.match(/const VALID_PAGES = \[([\s\S]*?)\] as const;/);
/*
 * Sin quitar los comentarios, esta lente NO veía mi propio error.
 *
 * El listado del router tiene arriba un comentario que explica que 'agentes'
 * salió —entre comillas, porque nombra la ruta—. Cosechando el bloque crudo,
 * 'agentes' entraba a la lista de páginas válidas desde el renglón que dice
 * que ya no existe, y el destino roto pasaba en verde. Es el mismo defecto
 * que mira esta lente, una capa más arriba: una comprobación que se agarra de
 * lo que tiene a mano en vez de lo que el router dibuja.
 */
const sinComentarios = (listado?.[1] ?? '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
const paginas = new Set((sinComentarios.match(/'([a-zA-Z]+)'/g) ?? []).map((p) => p.replace(/'/g, '')));
ok(paginas.size > 10, `el router declara ${paginas.size} páginas`);
ok(!paginas.has('agentes'),
  'y «agentes», que salió del router, no entra por el comentario que lo cuenta');
for (const [c, t] of Object.entries(TRABAJO_POR_CUELLO)) {
  ok(paginas.has(t.destino), `${c} → «${t.destino}»${paginas.has(t.destino) ? '' : ' no es una página del router'}`);
}

console.log('\n── y el movimiento llega a la lista del día ──');
ok(/trabajoDeHoy/.test(hoy), 'Hoy lee el cuello de la semana');
ok(/titulo:\s*cuello\.titulo/.test(hoy), 'y lo pone como un movimiento del día');
ok(/setCurrentPage\(cuello\.destino\)/.test(hoy), 'con el botón que abre dónde se trabaja');

console.log('\n── sin números cargados no se le inventa un cuello ──');
// En node no hay navegador: `historialTablero` devuelve vacío, que es lo mismo
// que le pasa al cliente que todavía no cargó la semana.
ok(trabajoDeHoy(30) === null, 'semana sin cargar → ningún movimiento');

/* ════════════════ 8 · la cuenta de los 10 sigue siendo la del mapa ════ */

console.log('\n── la cadena no se movió sola ──');
const diez = cadenaPara(META_PACIENTES);
ok(META_PACIENTES === 10, 'la meta son 10');
ok(TASA_AGENDA === 0.19 && TASA_ASISTENCIA === 0.70 && TASA_CIERRE === 0.25,
  'las tasas son 19 % · 70 % · 25 %');

// La cadena tiene que salir de las tasas y no de un número escrito a mano en
// ningún lado: así el día que una tasa se mida distinto, la cadena se mueve
// sola y esta lente no hay que tocarla.
ok(diez.llamadas === Math.ceil(META_PACIENTES / TASA_CIERRE)
  && diez.agendas === Math.ceil(diez.llamadas / TASA_ASISTENCIA)
  && diez.conversaciones === Math.ceil(diez.agendas / TASA_AGENDA),
  `${diez.conversaciones} → ${diez.agendas} → ${diez.llamadas} → ${diez.ventas}, cada eslabón desde su tasa`);

/*
 * Y que el encabezado del archivo diga ESA cuenta.
 *
 * Decía «300 → 57 → 40 → 10» y la app muestra 306 → 58: las agendas dan 57,14
 * y se redondean para arriba, porque media agenda no agenda a nadie. Los
 * números lindos salen de redondearlas para abajo. Un encabezado con otra
 * cuenta que la que corre es por dónde empiezan los mapas equivocados.
 */
const cabecera = fuenteTablero.slice(0, fuenteTablero.indexOf('export const META_PACIENTES'));
const escrita = `${diez.conversaciones} conversaciones → ${diez.agendas} agendas → ${diez.llamadas} llamadas`;
ok(cabecera.includes(escrita),
  `el encabezado dice la cuenta que corre: «${escrita}»`);

/* ════════════════ cierre ════════════════ */

console.log(fallas === 0
  ? '\n✅ LOS TRES NÚMEROS LLEGAN Y EL CUELLO EMPUJA\n'
  : `\n❌ ${fallas} falla(s)\n`);
process.exit(fallas === 0 ? 0 : 1);
