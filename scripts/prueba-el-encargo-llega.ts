/**
 * EL ENCARGO LLEGA A UNA JORNADA DE VERDAD, Y SALE LLENO
 *
 * ═══ QUÉ PASÓ ═══
 *
 * El Encargo existía, estaba bien escrito, tenía su pantalla, su botón de
 * copiar y su lente en verde. Y no lo vio nunca nadie.
 *
 * Hay dos juegos de códigos en el Camino. Las PIEZAS son los cuarenta y tres
 * videos a grabar: `P3.1`, `P4.2d`, `P4.4`. Las METAS son las noventa y un
 * jornadas que el cliente abre: `P2.d10`, `P3.d16`, `P9B.d61`. Se parecen,
 * se tocan en nueve códigos, y son cosas distintas.
 *
 * Los tres encargos estaban escritos con el código del VIDEO. `SesionViva` le
 * pasa a `ElEncargo` el código de la JORNADA. O sea que `encargoDe()`
 * devolvía `null` en los noventa y un días del Camino, y el componente se iba
 * sin pintar nada.
 *
 * La lente vieja no podía verlo: probaba `armarEncargo()` con datos puestos a
 * mano. Es correcta y sigue estando. Pero una plantilla que anda y no llega a
 * la pantalla es exactamente lo mismo que no tenerla.
 *
 * ═══ Y LO SEGUNDO: SALÍAN HUECOS ═══
 *
 * `datosDelCliente()` leía cinco claves crudas del navegador. Dos llegaban.
 * `pais`, `promesa` y `precio` no existen como clave en ninguna parte, y
 * `adn_avatar` sí existe pero es un objeto, así que el filtro de texto lo
 * tiraba en silencio. El encargo que existe para salir lleno salía con cuatro
 * huecos de seis, siempre, para todos.
 *
 * ═══ QUÉ MIRA ESTA LENTE ═══
 *
 * Que cada encargo caiga en una jornada que existe. Que no caiga en un fin de
 * semana. Que todo dato que pide tenga de dónde salir, y que el espejo que lo
 * trae siga puesto. Y que no se cuele un token de vocabulario, que el armador
 * rompería.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { ENCARGOS, DATOS_QUE_LLEGAN, datosDelCliente, encargoDe } from '../src/lib/elEncargo';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

/* ── El Camino, por su código de jornada ── */
const JORNADAS = new Map<string, { dia: number; titulo: string; tipo: string }>();
for (const pilar of SEED_ROADMAP_V2) {
  for (const m of pilar.metas) {
    JORNADAS.set(m.codigo, { dia: m.dia_asignado ?? -1, titulo: m.titulo ?? '', tipo: String(m.tipo ?? '') });
  }
}

console.log('\n── cada encargo cae en una jornada que existe ──');
for (const codigo of Object.keys(ENCARGOS)) {
  const j = JORNADAS.get(codigo);
  ok(Boolean(j), j
    ? `${codigo} · día ${j.dia} · ${j.titulo}`
    : `${codigo} no es ninguna de las ${JORNADAS.size} jornadas del Camino — ¿es el código de un video?`);
}

console.log('\n── y la pantalla lo encuentra por ese código ──');
/*
 * Lo que de verdad corre en la jornada: `SesionViva` llama a `encargoDe()` con
 * el código de la meta. Se recorre el Camino entero y se cuenta cuántos días
 * muestran encargo. Con los códigos de video eran cero.
 */
const conEncargo = [...JORNADAS.keys()].filter((c) => encargoDe(c) !== null);
ok(conEncargo.length === Object.keys(ENCARGOS).length,
  `${conEncargo.length} de las ${JORNADAS.size} jornadas muestran su encargo` +
  (conEncargo.length === Object.keys(ENCARGOS).length ? '' : ` — se escribieron ${Object.keys(ENCARGOS).length}`));
ok(conEncargo.length >= 12, `son ${conEncargo.length}, y el mapa pide doce`);

console.log('\n── ninguno cae en un día que no abre la pantalla ──');
/*
 * `Roadmap.tsx` monta `SesionViva` —la única pantalla que muestra el
 * encargo— en dos sitios, y los dos están detrás de la misma condición:
 * `meta.tipo === 'VIDEO'` y `meta.tipo === 'COACH'`. Una jornada de tipo
 * TAREA no abre esa pantalla nunca, así que un encargo escrito ahí no se ve,
 * exactamente igual que si estuviera escrito con el código de un video. Los
 * fines de semana son todos TAREA, así que esto también los cubre.
 */
const roadmapTsx = leer('src/pages/Roadmap.tsx');
/*
 * Los tipos NO se escriben a mano acá: se leen del Camino. Para cada sitio
 * donde se monta `SesionViva` se busca hacia atrás el `meta.tipo === '…'`
 * más cercano, que es su compuerta. Así, el día que alguien monte la sesión
 * en otro tipo —o deje de montarla en uno—, esta lista cambia sola y los
 * encargos que quedaron afuera se ven acá, en vez de descubrirse abriendo la
 * app un día de los noventa.
 */
const ABREN_LA_PANTALLA = new Set<string>();
for (const m of roadmapTsx.matchAll(/<SesionViva\b/g)) {
  const antes = roadmapTsx.slice(0, m.index);
  const compuertas = [...antes.matchAll(/meta\.tipo === '([A-Z_]+)'/g)];
  const ultima = compuertas.at(-1)?.[1];
  if (ultima) ABREN_LA_PANTALLA.add(ultima);
}
ok(ABREN_LA_PANTALLA.size > 0, `la sesión se monta tras ${[...ABREN_LA_PANTALLA].join(' y ') || 'ninguna compuerta de tipo'}`);
/*
 * Sin comentarios: un `{/* <ElEncargo /> *\/}` es código apagado, y es la
 * forma más fácil de apagar esto sin que se note. Para la lente tiene que
 * contar como ausente, porque para el cliente lo está.
 */
const sesionViva = leer('src/components/sesion/SesionViva.tsx')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '');
ok(/<ElEncargo\b/.test(sesionViva), 'y esa sesión sigue pintando el encargo adentro');
for (const codigo of Object.keys(ENCARGOS)) {
  const j = JORNADAS.get(codigo);
  if (!j) continue;
  ok(ABREN_LA_PANTALLA.has(j.tipo),
    `${codigo} es ${j.tipo || 'sin tipo'}` + (ABREN_LA_PANTALLA.has(j.tipo) ? '' : ', y ese tipo no abre la sesión'));
}

console.log('\n── todo dato que pide tiene de dónde salir ──');
const PERMITIDOS = new Set<string>(DATOS_QUE_LLEGAN);
for (const [codigo, plantilla] of Object.entries(ENCARGOS)) {
  const pedidos = [...plantilla.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  const huerfanos = [...new Set(pedidos)].filter((d) => !PERMITIDOS.has(d));
  ok(huerfanos.length === 0, huerfanos.length === 0
    ? `${codigo} pide ${[...new Set(pedidos)].join(', ')}`
    : `${codigo} pide ${huerfanos.join(', ')}, que no llena nada nunca`);
}

/*
 * Y al revés: lo declarado tiene que existir de verdad en la salida del
 * lector. Si alguien saca un dato de `datosDelCliente()` y se olvida de la
 * lista, los encargos que lo piden salen huecos sin que nadie se entere.
 */
const salida = Object.keys(datosDelCliente());
for (const d of DATOS_QUE_LLEGAN) {
  ok(salida.includes(d), `«${d}» lo devuelve el lector de datos`);
}
ok(salida.every((d) => PERMITIDOS.has(d)),
  'el lector no devuelve ningún dato que la lista no declare');

console.log('\n── el espejo que trae esos datos sigue puesto ──');
/*
 * Los cuatro viven en la base y bajan al navegador en `syncProfileToLocalStorage`.
 * Sin esa línea el dato existe, el cliente lo selló, y el encargo igual sale
 * hueco. Es el fallo que no se ve: nada se rompe, solo sale peor.
 */
const auth = leer('src/lib/auth.ts');
const espejo = auth.slice(auth.indexOf('syncProfileToLocalStorage'));
for (const campo of ['pais', 'nicho', 'posicionamiento', 'avatar_cliente', 'metodo_nombre', 'oferta_mid']) {
  ok(new RegExp(`^\\s*${campo}:`, 'm').test(espejo), `«${campo}» baja de la base al navegador`);
}
/* El precio no está en el perfil: vive en su propio registro, el del día 5. */
const fuente = leer('src/lib/elEncargo.ts');
ok(/tcd_el_numero/.test(fuente), 'el precio sale de su número, no de un campo inventado');

console.log('\n── ningún token de vocabulario adentro de un encargo ──');
/*
 * El armador reemplaza `{dato}` ANTES de pasar por VOC. Un `{{consultante}}`
 * escrito en una plantilla sale como `{[a quién sirves: todavía sin sellar]}`:
 * el hueco donde iba la palabra correcta.
 */
for (const [codigo, plantilla] of Object.entries(ENCARGOS)) {
  ok(!plantilla.includes('{{'), `${codigo} no lleva tokens de vocabulario`);
}

console.log(fallas ? `\n✗ ${fallas} fallas\n` : '\n✓ los encargos llegan a su jornada y salen con los datos del cliente\n');
process.exit(fallas ? 1 : 0);
