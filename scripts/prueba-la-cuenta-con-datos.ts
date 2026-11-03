/**
 * prueba-la-cuenta-con-datos.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * EL MEDIDOR ABRÍA LA APP VACÍA, SIEMPRE
 *
 * Su `preparar()` declaraba `hechas=12`, lo pasaba a la función del navegador,
 * lo destructuraba allá… y nadie lo leía. El parámetro estaba muerto desde que
 * se escribió, así que las cuarenta y ocho vistas midieron la app del día uno:
 * cero jornadas cerradas, cero piezas del ADN, cero en cada contador.
 *
 * Es el mismo patrón que esta casa ya encontró tres veces —código escrito,
 * probado y nunca conectado— pero una capa más abajo: en la herramienta que
 * mide, que es la que debería encontrarlo.
 *
 * Lo que solo existe con datos: los numerales de cinco y seis cifras que es
 * donde se ve si la caja aguanta, los textos que el cliente escribió —su
 * historia, su método, su avatar— que son párrafos y no dos palabras, las
 * listas de setenta jornadas, las barras llenas.
 *
 * LO QUE APARECIÓ A LA PRIMERA CORRIDA CON DATOS
 *
 * El ADN completo —los veintiocho campos del negocio, el corazón de lo que la
 * app construye— se mostraba a 14 píxeles. `prose-sm` del plugin de tipografía
 * fija el cuerpo en 0.875rem y lo hace con su propia clase, que vence a las
 * utilidades. Trece lugares lo usan. Con el ADN vacío no hay nada que
 * renderizar, así que el lente de letra chica no tenía qué medir.
 *
 * Y UN ERROR DEL PROPIO ESTADO DE PRUEBA
 *
 * La primera versión de `estado-lleno.mts` inventó diez claves de ADN
 * (`adn_historia`, `adn_metodo_nombre`…) que la app no lee. El Manual seguía
 * diciendo «1 de 28» con el ADN supuestamente lleno: un estado de prueba que
 * no coincide con el dato real mide la pantalla vacía creyendo que la mide
 * llena. Las veintiocho claves son las del Manual, con esos nombres exactos.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const medidor = leer('scripts/medir-app.py');
const estado = leer('scripts/estado-lleno.mts');
const manual = leer('src/pages/ManualNegocio.tsx');

console.log('\n── el medidor abre la cuenta con datos ──');
ok(
  /CON_DATOS = \[/.test(medidor) && /resultados\[f'\{p\}>lleno'\]/.test(medidor),
  'hay una tanda `>lleno` con las pantallas que cambian cuando hay datos',
);
ok(
  /def estado_lleno\(largo=False\)/.test(medidor) && /estado-lleno\.mts/.test(medidor),
  'y el estado se calcula desde el seed',
);
/*
 * Una caché por modo, no una sola. Con una sola, la segunda tanda recibe el
 * estado de la primera: las cuatro pantallas de texto largo medirían los
 * textos cortos y darían verde sin haber medido nada.
 */
ok(
  /if largo not in _LLENO:/.test(medidor) && /_LLENO\[largo\] = json\.loads/.test(medidor),
  'una vez por corrida Y POR MODO: el corto no se le sirve al largo',
);
ok(
  /LARGAS = \[/.test(medidor) && /resultados\[f'\{p\}>largo'\]/.test(medidor)
  && /estado_lleno\(True\)/.test(medidor),
  'y hay una tanda `>largo` con las pantallas que muestran lo que el cliente escribió',
);
/*
 * Derivado y no escrito a mano: las claves de jornada son
 * `${pilar.numero}-${meta.codigo}` y esa correspondencia vive en el seed.
 * Escritas a mano acá envejecen con el primer reordenamiento del camino.
 */
ok(
  /import \{ SEED_ROADMAP_V3, TOTAL_METAS \} from '\.\.\/src\/lib\/roadmapSeed'/.test(estado),
  'las claves de jornada salen del seed, no de una lista escrita a mano',
);
ok(
  /localStorage\.setItem\('tcd_hoja_ruta_v2', JSON\.stringify\(lleno\.hechas\)\)/.test(medidor),
  'las jornadas cerradas se escriben donde la app las lee',
);
ok(
  /localStorage\.setItem\('tcd_metrics_v3'/.test(medidor)
  && /localStorage\.setItem\('tcd_diario_v3'/.test(medidor),
  'y los números y el diario también: la cuenta queda coherente consigo misma',
);
ok(
  /ERA UN PARÁMETRO MUERTO/.test(medidor),
  'y queda escrito que `hechas` no hacía nada, para que no vuelva a pasar',
);

console.log('\n── y las veintiocho claves son las de verdad ──');
/*
 * Se comparan contra las que el Manual declara. Si mañana se agrega un campo
 * veintinueve, esta comprobación avisa que el estado de prueba se quedó corto.
 */
const delManual = [...manual.matchAll(/key: '([a-z_0-9]+)'/g)].map((m) => m[1]);
const delEstado = [...estado.matchAll(/^\s{4}([a-z_0-9]+):/gm)].map((m) => m[1]);
const faltantes = delManual.filter((k) => !delEstado.includes(k));
ok(
  delManual.length >= 28,
  `el Manual declara ${delManual.length} campos de ADN`,
);
ok(
  faltantes.length === 0,
  faltantes.length === 0
    ? 'y el estado de prueba los llena todos, con sus nombres exactos'
    : `le faltan ${faltantes.length}: ${faltantes.join(', ')}`,
);
ok(
  /pais: 'AR'/.test(estado) && /perfil\.pais = lleno\.pais/.test(medidor),
  'y el país, que es de donde sale el dialecto de sus landings',
);

console.log('\n── el piso tipográfico vale adentro del prose ──');
const css = leer('src/index.css');
ok(
  /\[data-theme="light"\] #root \.prose-sm,/.test(css),
  '`prose-sm` deja de fijar el cuerpo en 14 px: el piso de la casa también vale ahí',
);
ok(
  /font-size: var\(--text-sm\) !important;/.test(css.slice(css.indexOf('.prose-sm,'))),
  'y lo pone en 17, que es el mínimo de lo que se lee para hacer',
);

console.log('\n── y el contador del ADN se lee ──');
ok(
  /\{totalCompleted\} de \{totalFields\}/.test(manual),
  '«26 de 28» y no «26/28»: la barra hay que decodificarla',
);

console.log(fallas === 0 ? '\n✓ la app se mide también con la cuenta llena\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
