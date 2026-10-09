/**
 * EL CHECKLIST QUE SABE DEL PLAN, Y UNA SOLA CUENTA PARA TODOS.
 *
 * ═══ LOS DOS PROBLEMAS ═══
 *
 * 1 · La matriz le pedía los 62 ítems a todo el mundo. A quien contrató La Base
 *     eso son veinte tareas que nadie va a hacer por él y que él tampoco puede
 *     hacer —son cuentas de la agencia— así que su avance se veía siempre bajo
 *     y la columna no significaba nada. El reparto estaba programado y probado
 *     en `cuadroDe`: lo único que faltaba era usarlo.
 *
 * 2 · El cartel de arriba decía «3 clientes listos» y la grilla, para los
 *     mismos clientes, mostraba otros porcentajes. No era un error de cálculo:
 *     eran dos cuentas distintas. Dos números para el mismo cliente, en la
 *     misma pantalla, enseñan a no creerle a ninguno.
 *
 * Correr con: npx tsx scripts/prueba-cuadro-por-plan.ts
 */
import { readFileSync } from 'node:fs';
import { avanceDelCuadro, estaListo } from '../src/lib/avanceDelCuadro';
import { STEPS } from '../src/lib/preactivacionSteps';
import { cuadroDe } from '../src/lib/cuadroTickets';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const TODOS = new Set(STEPS.map((s) => s.id));

// ── 1 · A cada uno se le pide lo suyo ──────────────────────────────────────
console.log('══ a cada uno se le pide lo que contrató ══');
const base = avanceDelCuadro({ servicio: 'base' });
const inst = avanceDelCuadro({ servicio: 'instalacion' });
ok(base.total < inst.total,
  `La Base tiene ${base.total} ítems y La Instalación ${inst.total}`);
ok(base.noAplican > 15,
  `a La Base no se le piden ${base.noAplican}: son cuentas de la agencia, no suyas`);
ok(inst.noAplican === 0, 'a La Instalación le aplican los 62');
ok(avanceDelCuadro({ servicio: 'ascenso' }).noAplican === 0,
  'y a El Ascenso también: en 90 días se instala todo');
ok(avanceDelCuadro({ servicio: null }).total === base.total,
  'sin marcar se cuenta como La Base, que es el escalón más bajo');

// ── 2 · Las tres formas de estar hecho valen igual ─────────────────────────
console.log('\n══ un paso hecho es un paso hecho ══');
const unPaso = STEPS.find((s) => s.meta)!;
// Una sesión del Camino puede sellar MÁS DE UN paso: hay metas compartidas.
const hermanos = STEPS.filter((s) => s.meta === unPaso.meta).length;

ok(avanceDelCuadro({ servicio: 'instalacion', tildados: new Set([unPaso.id]) }).hechos === 1,
  'tildado en la base cuenta');
ok(avanceDelCuadro({ servicio: 'instalacion', delCamino: new Set([unPaso.meta!]) }).hechos === hermanos,
  `cerrar la sesión «${unPaso.meta}» cierra sus ${hermanos} pasos: antes el cartel los ignoraba`);
ok(avanceDelCuadro({
  servicio: 'instalacion',
  estados: new Map([[unPaso.id, { estado: 'listo' }]]),
}).hechos === 1, 'puesto en «listo» a mano, también');
ok(avanceDelCuadro({
  servicio: 'instalacion',
  tildados: new Set([unPaso.id]),
  delCamino: new Set([unPaso.meta!]),
}).hechos === hermanos, 'y las tres formas juntas no cuentan el mismo paso dos veces');

console.log('\n══ lo que no aplica no cuenta ══');
const conNa = avanceDelCuadro({
  servicio: 'instalacion',
  estados: new Map([[STEPS[0].id, { estado: 'na' }]]),
});
ok(conNa.total === STEPS.length - 1, 'un «no aplica» a mano baja el total');
ok(conNa.noAplican === 1, 'y se cuenta como tal');

// ── 3 · Listo para activar ─────────────────────────────────────────────────
console.log('\n══ quién está listo ══');
ok(!estaListo({ servicio: 'base' }), 'sin nada hecho, nadie está listo');
const aplicanBase = new Set(cuadroDe('base').filter((i) => !i.noAplica).map((i) => i.id));
ok(estaListo({ servicio: 'base', tildados: aplicanBase }),
  'quien tiene todo lo que SU servicio incluye está listo, aunque le falten 20 de los 62');
ok(!estaListo({ servicio: 'instalacion', tildados: aplicanBase }),
  'y los mismos tildes no alcanzan para quien contrató la instalación completa');
ok(estaListo({ servicio: 'instalacion', tildados: TODOS }), 'con los 62, sí');

console.log('\n══ el porcentaje ══');
ok(avanceDelCuadro({ servicio: 'base' }).pct === 0, 'sin nada, cero');
ok(avanceDelCuadro({ servicio: 'base', tildados: aplicanBase }).pct === 100,
  'con todo lo suyo, cien — sin pasarse ni quedarse corto');

// ── 4 · Una sola cuenta, en un solo lugar ──────────────────────────────────
console.log('\n══ una sola cuenta ══');
const grilla = readFileSync('src/components/admin/preactivacion/MatrizGrid.tsx', 'utf-8');
const matriz = readFileSync('src/components/admin/PreactivacionMatriz.tsx', 'utf-8');
const admin = readFileSync('src/pages/Admin.tsx', 'utf-8');

ok(/avanceDelCuadro/.test(grilla) && /avanceDelCuadro/.test(matriz),
  'la grilla y el cartel usan la misma función');
ok(!/progressPct/.test(matriz),
  'el cartel ya no cuenta solo las filas de la base, que era la cuenta que no coincidía');
ok((grilla.match(/for \(const p of STEPS\)/g) ?? []).length === 0,
  'y la grilla no se arma su propia cuenta aparte');
ok(/extras: ExtrasByCliente/.test(grilla) && /onExtra/.test(grilla),
  'los estados de las celdas bajan del padre: con una copia en cada uno, editar una celda dejaba los dos números distintos hasta recargar');
ok(/servicio: c\.servicio_contratado/.test(matriz),
  'y lo que contrató cada cliente llega hasta la grilla');
ok(/p\.servicio_contratado = extra\.servicio_contratado/.test(admin),
  'el Admin lo copia al armar la lista: sin eso la matriz no sabría nada');

console.log('\n══ el texto que había quedado viejo ══');
ok(!/32 columnas/.test(grilla), 'ya no dice «32 columnas»');
ok(/\$\{TOTAL_STEPS\} columnas/.test(grilla),
  'el número sale del código, así no se vuelve a desincronizar');

// ── 5 · Lo que se sacó ─────────────────────────────────────────────────────
console.log('\n══ los cascarones que se sacaron ══');
ok(!/function GlobalChat/.test(admin),
  'GlobalChat: 173 líneas que ninguna pantalla dibujaba desde que se recortaron los canales');
ok(/subirArchivo/.test(admin),
  'pero su subida de archivos se rescató: el equipo ahora adjunta desde el chat real');
ok(!/function ManagerChecklist/.test(admin),
  'el checklist del manager: su guarda pedía filas de una tabla que nadie llenaba');
ok(!/AdminChecklistItem/.test(admin), 'y no quedó su tipo huérfano');
ok(!/'plata'/.test(admin),
  'la Mesa de plata: se llegaba solo por accidente y no había cómo volver');
ok(/seccion === 'numeros' \? 'supervision'/.test(admin),
  'la tarea que la abría ahora va a «De un vistazo», que muestra lo mismo y tiene salida');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
