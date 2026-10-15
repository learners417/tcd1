/**
 * LA ACTIVACIÓN — cuatro estados, y usable en el teléfono.
 *
 * ═══ LOS DOS HUECOS QUE CIERRA ═══
 *
 * 1 · HABÍA UN SOLO ESTADO INTERMEDIO y no servía para lo único que se
 *     necesita mirando esta pantalla: de quién es la pelota ahora.
 *
 *     «En proceso» podía ser que el cliente esté grabando su VSL o que el
 *     equipo esté editándolo. Son dos situaciones opuestas: en una se le
 *     reclama a él, en la otra la demora es nuestra. Con un solo color, el
 *     lunes había que preguntar por cada celda amarilla de quién se estaba
 *     esperando — que es el trabajo que esta pantalla existe para ahorrar.
 *
 * 2 · LA MATRIZ ERA INSERVIBLE EN UN TELÉFONO. No por la letra ni por el
 *     scroll: 62 columnas en 390 px son 62 columnas de 6 px. Y el movimiento
 *     se hacía con `cursor-grab` y onMouseDown, así que el mismo gesto servía
 *     para desplazarse y para tocar una celda: en la computadora se cambiaba
 *     un estado sin querer, y en el teléfono el arrastre con mouse no corre.
 *
 * Correr con: npx tsx scripts/prueba-activacion.ts
 */
import { readFileSync } from 'node:fs';
import {
  siguienteEstado, ESTADO_LABEL, ESTADO_COLOR, ESTADO_MARCA,
  deQuienEsLaPelota, laPelota, alEstadoNuevo, } from '../src/lib/matrizExtras';
import { SECTIONS, TOTAL_STEPS } from '../src/lib/preactivacionSteps';
import { noIncluye } from '../src/lib/avanceDelCuadro';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

// ── 1 · Los cuatro estados y sus colores ───────────────────────────────────
console.log('══ los cuatro estados ══');
ok(ESTADO_LABEL.pendiente === 'Sin empezar', 'rojo: nadie lo empezó');
ok(ESTADO_LABEL.cliente === 'La tiene el cliente', 'naranja: la pelota la tiene el cliente');
ok(ESTADO_LABEL.nosotros === 'La tenemos nosotros', 'amarillo: la pelota la tenemos nosotros');
ok(ESTADO_LABEL.listo === 'Listo', 'verde: hecho');
ok(ESTADO_LABEL.na === 'No aplica', 'y «no aplica», que no es un estado de avance');

ok(ESTADO_COLOR.pendiente.borde.includes('danger'), 'el rojo sale del token de peligro');
ok(ESTADO_COLOR.cliente.borde.includes('E8862E'), 'el naranja es propio: no hay token para él');
ok(ESTADO_COLOR.nosotros.borde.includes('gold'), 'el amarillo es el oro de la marca');
ok(ESTADO_COLOR.listo.borde.includes('success'), 'y el verde, el de éxito');
ok(new Set(Object.values(ESTADO_COLOR).map((c) => c.borde)).size === 5,
  'cinco bordes distintos: dos estados con el mismo color son un estado');

console.log('\n══ el color no es el único aviso ══');
ok(ESTADO_MARCA.cliente === 'C' && ESTADO_MARCA.nosotros === 'N',
  'naranja y amarillo llevan letra: son dos colores parecidos y quien no los distingue bien necesita otra cosa');
ok(ESTADO_MARCA.listo === '✓' && ESTADO_MARCA.na === '–', 'y los otros su marca');

// ── 2 · El ciclo del clic depende de quién hace el ítem ────────────────────
console.log('\n══ el ciclo del clic ══');
ok(siguienteEstado('pendiente', 'cliente') === 'cliente',
  'en un ítem del cliente, el primer toque lo pone en sus manos');
ok(siguienteEstado('pendiente', 'agencia') === 'nosotros',
  'y en uno de la agencia, en las nuestras');
ok(siguienteEstado('cliente', 'cliente') === 'listo',
  'tres toques llegan a listo en un ítem del cliente');
ok(siguienteEstado('nosotros', 'agencia') === 'listo', 'y tres en uno nuestro');
ok(siguienteEstado('pendiente', 'ambos') === 'cliente'
  && siguienteEstado('cliente', 'ambos') === 'nosotros',
  'los de ambos pasan por los dos, que es lo que de verdad ocurre');
ok(siguienteEstado('listo', 'agencia') === 'na' && siguienteEstado('na', 'agencia') === 'pendiente',
  'y el ciclo cierra: de listo a no aplica, y vuelve a empezar');

ok(siguienteEstado(undefined, 'agencia') === 'nosotros',
  'una celda nunca tocada se comporta como pendiente');
ok(siguienteEstado('cliente', 'agencia') === 'listo',
  'nadie queda encerrado: un ítem de la agencia que está en manos del cliente también avanza');

// ── 3 · Lo que ya estaba guardado no se pierde ─────────────────────────────
console.log('\n══ lo que estaba guardado antes ══');
ok(alEstadoNuevo('proceso') === 'nosotros',
  'las filas viejas con «proceso» pasan a «lo tenemos nosotros»: 42 de los 62 ítems son de la agencia');
ok(alEstadoNuevo('listo') === 'listo' && alEstadoNuevo('na') === 'na',
  'los demás quedan igual');
ok(alEstadoNuevo('cliente') === 'cliente', 'y los nuevos también');
ok(alEstadoNuevo(null) === undefined && alEstadoNuevo('') === undefined,
  'una celda sin estado sigue sin estado');
ok(alEstadoNuevo('inventado') === undefined,
  'y un valor que no existe no se cuela como estado');

// ── 4 · De quién es la pelota ──────────────────────────────────────────────
console.log('\n══ la línea del lunes ══');
const cuenta = deQuienEsLaPelota([
  'listo', 'listo', 'cliente', 'nosotros', 'nosotros', 'pendiente', 'na', undefined,
]);
ok(cuenta.listas === 2 && cuenta.delCliente === 1 && cuenta.nuestras === 2,
  'cuenta cada estado por separado');
ok(cuenta.sinEmpezar === 2, 'y «no aplica» no se suma a las sin empezar: no es trabajo pendiente');

const linea = laPelota(cuenta);
ok(/2 las tenemos nosotros/.test(linea) && /1 la tiene él/.test(linea),
  `dice de quién se está esperando: "${linea}"`);
ok(/Todo listo/.test(laPelota(deQuienEsLaPelota(['listo', 'listo']))),
  'con todo hecho lo dice en dos palabras');
ok(/Nada en curso/.test(laPelota(deQuienEsLaPelota(['pendiente', 'pendiente']))),
  'y sin nada empezado también');
ok(!/undefined|NaN|null/.test(linea), 'sin agujeros en el texto');

// ── 5 · Las dos vistas ─────────────────────────────────────────────────────
console.log('\n══ una vista por pregunta ══');
const padre = readFileSync('src/components/admin/PreactivacionMatriz.tsx', 'utf-8');
const lista = readFileSync('src/components/admin/preactivacion/UnClienteALaVez.tsx', 'utf-8');
const grid = readFileSync('src/components/admin/preactivacion/MatrizGrid.tsx', 'utf-8');

ok(/hidden lg:block/.test(padre) && /lg:hidden/.test(padre),
  'la matriz en pantalla ancha, la lista en el teléfono');
ok(/<UnClienteALaVez/.test(padre), 'la lista está montada');
ok(/62 columnas/.test(lista) && /6 px/.test(lista),
  'y está escrito por qué no es la misma matriz más chica');

ok(/noIncluye\(servicioDe\(servicio\)\)/.test(padre),
  'las dos dejan fuera los mismos ítems: si una lo replica, el día que cambie el reparto una va a pedir algo que la otra ya no pide');
ok(/estado === 'listo'\) handleToggle/.test(padre),
  'y marcar listo en la lista actualiza el tilde de la base, así el porcentaje cuenta lo mismo');

console.log('\n══ el deslizamiento ══');
/** El código sin comentarios: los comentarios cuentan la historia a propósito. */
const codigoDe = (txt: string) => txt
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((l) => !/^\s*(\*|\/\/)/.test(l)).join('\n');
const gridCodigo = codigoDe(grid);

ok(!/cursor-grab/.test(gridCodigo),
  'se fue el arrastre con mouse: el mismo gesto movía la tabla y cambiaba una celda');
ok(!/onMouseDown/.test(gridCodigo), 'y su manejador');
ok(/overscroll-contain/.test(grid),
  'al llegar al borde no arrastra la página entera');
ok(/WebkitOverflowScrolling: 'touch'/.test(grid), 'con inercia en el teléfono');
ok(/Math\.abs\(e\.deltaX\) > Math\.abs\(e\.deltaY\)/.test(grid),
  'y el trackpad en diagonal mueve al costado, sin pedir Shift');
ok(/100dvh/.test(grid),
  'la altura usa dvh: con vh, la barra del navegador del teléfono corta la última fila');

console.log('\n══ sin letra chica ══');
const chicas = [...gridCodigo.matchAll(/fontSize: (\d+)/g)].map((m) => Number(m[1])).filter((n) => n < 15);
ok(chicas.length === 0, `ninguna letra bajo 15px en la matriz${chicas.length ? ` — quedan ${chicas.join(', ')}` : ''}`);
ok(!/text-xs|text-\[1[0-4]px\]/.test(lista), 'ni en la lista del teléfono');
ok(/min-h-\[60px\]/.test(lista) && /w-11 h-11/.test(lista),
  'y los controles se tocan con el dedo: 44 px es el mínimo real');

console.log('\n══ la referencia, en vez del manual ══');
ok(!/Arrastra la tabla con el mouse/.test(grid),
  'se fue el párrafo que explicaba cómo deslizar: si hay que explicarlo, la interacción está mal');
ok(/La tiene él/.test(grid) && /La tenemos/.test(grid),
  'y en su lugar está lo único que no se puede adivinar: qué significa cada color');

console.log('\n══ la lista es la del checklist ══');
ok(SECTIONS.length === 14, `${SECTIONS.length} bloques: los 12 del checklist más Lanzamiento y Post-lanzamiento`);
ok(TOTAL_STEPS === 62, `${TOTAL_STEPS} ítems`);
ok(SECTIONS.every((s) => s.items.every((i) => i.quien)),
  'cada ítem dice quién lo hace: sin eso el ciclo del clic no sabe por dónde empezar');
ok(noIncluye('base').size > 0 && noIncluye('instalacion').size === 0,
  'y a La Instalación no se le descuenta nada: el equipo lo monta todo');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
