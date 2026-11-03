/**
 * prueba-un-dato-un-total.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * QUE «JORNADAS» SIGNIFIQUE LO MISMO EN TODAS LAS PANTALLAS
 *
 * El cliente leía, en la misma sesión: «71 de 91 jornadas» en Métricas y «21
 * de 64 jornadas» en El Camino. El mismo dato, dos totales.
 *
 * Y el 91 no se alcanza: cuenta las noventa y una metas del seed, las del
 * equipo y los días de campo incluidos. Las jornadas que el cliente HACE son
 * sesenta y cuatro, así que terminar el programa le daba un setenta y ocho por
 * ciento. `esPasoDelCliente` ya tenía esto resuelto y su comentario lo dice:
 * «contarlos hacía que el Camino dijera "1 de 90 pasos" cuando las jornadas
 * con trabajo son cincuenta, y esos noventa no se alcanzaban nunca».
 *
 * Ese arreglo llegó al Camino y no a Métricas. Y tampoco a los dos lugares que
 * el cliente no ve pero lo afectan:
 *
 *   · `progreso_porcentaje`, que se escribe en su perfil y es lo que el equipo
 *     mira para decidir a quién llamar. Un cliente que cerró TODO lo suyo
 *     aparecía al setenta por ciento.
 *   · la fase de autonomía por avance, que exigía las noventa y una: quien
 *     cerraba sus sesenta y cuatro no llegaba nunca, solo por calendario.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_ROADMAP_V3, TOTAL_METAS, TOTAL_JORNADAS_DEL_CLIENTE } from '../src/lib/roadmapSeed';
import { esPasoDelCliente } from '../src/lib/diaPrograma';

const raiz = join(import.meta.dirname, '..');
/* Sin comentarios: los de arriba cuentan el bug y nombran el total viejo. */
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

console.log('\n── el total del cliente sale de un solo lugar ──');
const contadas = SEED_ROADMAP_V3.reduce(
  (n, p) => n + (p.metas ?? []).filter(esPasoDelCliente).length, 0);
ok(
  TOTAL_JORNADAS_DEL_CLIENTE === contadas,
  `la constante dice ${TOTAL_JORNADAS_DEL_CLIENTE} y contándolas dan ${contadas}`,
);
/*
 * Y es MENOR que el total de metas. Si algún día fueran iguales, la distinción
 * dejó de existir y esta prueba estaría cuidando nada.
 */
ok(
  TOTAL_JORNADAS_DEL_CLIENTE < TOTAL_METAS,
  `y es menor que las ${TOTAL_METAS} metas del seed: hay jornadas que no son suyas`,
);

console.log('\n── y lo usan las tres pantallas que muestran el avance ──');
const metrics = leer('src/pages/Metrics.tsx');
ok(
  /TOTAL_JORNADAS_DEL_CLIENTE/.test(metrics) && !/TOTAL_METAS/.test(metrics),
  'Métricas cuenta las jornadas del cliente, no todas las metas',
);
ok(
  /\(pil\.metas \?\? \[\]\)\.filter\(esPasoDelCliente\)/.test(metrics),
  'y el numerador se filtra igual que el denominador',
);
const roadmap = leer('src/pages/Roadmap.tsx');
ok(
  !/TOTAL_METAS/.test(roadmap),
  'el Camino ya no usa el total de metas en ningún lado',
);
ok(
  /const suyasHechas = useMemo/.test(roadmap),
  'y calcula «las suyas, hechas» una sola vez',
);

console.log('\n── el número que ve el equipo es el mismo que ve el cliente ──');
ok(
  /progreso_porcentaje: pct/.test(roadmap)
  && /suyasHechas \/ TOTAL_JORNADAS_DEL_CLIENTE/.test(roadmap),
  'el porcentaje del perfil usa la vara del cliente',
);
ok(
  /suyasHechas >= TOTAL_JORNADAS_DEL_CLIENTE/.test(roadmap),
  'y «terminó el Camino» es cerrar las suyas, no las del equipo también',
);
/*
 * El porcentaje que nadie leía. Era el mismo cálculo con el mismo denominador
 * inalcanzable, declarado y sin un solo uso.
 */
ok(
  !/progresoPct/.test(roadmap),
  'y el porcentaje que nadie leía se fue',
);

console.log(fallas === 0
  ? '\n✓ «jornadas» quiere decir lo mismo en toda la app\n'
  : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
