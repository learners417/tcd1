/**
 * LOS TUTORIALES ESCRITOS Y LA MIGRACIÓN QUE HACE EL CLIENTE.
 *
 * ═══ LOS DOS HUECOS QUE ESTO CIERRA ═══
 *
 * 1 · EL TUTORIAL QUE DESAPARECÍA. El bloque que muestra el paso a paso exigía
 *     video o PDF, y sin ninguno de los dos devolvía null. Trece de los
 *     veintiún tutoriales están grabados, así que en OCHO jornadas el cliente
 *     hacía su sesión sin enterarse nunca de que había un paso a paso para su
 *     link de pago, su página publicada, su bandeja o su contenido del mes.
 *     No quedaba vacío: no existía.
 *
 * 2 · LA MIGRACIÓN QUE REGALABA AVANCE. `buildHojaDeRutaFromExtracted` marcaba
 *     `completada: true` para todas las metas, incluso con el campo de ADN
 *     vacío. Un cliente con material flojo quedaba con el Camino «completo» y
 *     el ADN con agujeros — y el Constructor de anuncios autocompleta el brief
 *     desde esos campos, así que sus tres anuncios salían de un avatar que no
 *     existe. Es el mismo error por el que ya borré `puntoDePartida.ts`, que
 *     daba ochenta jornadas por hechas y tenía su prueba en verde.
 *
 * Correr con: npx tsx scripts/prueba-migracion-y-tutoriales.ts
 */
import { readFileSync } from 'node:fs';
import { TUTORIALES_DE_LUPE, tutorialEscrito, CODIGOS_ESCRITOS } from '../src/lib/tutorialesDeLupe';
import {
  tieneContenido, evaluarMigracion, loQueFaltaParaCampanas,
  CAMPOS_PARA_CAMPANAS, QUE_TRAER, ANTES_DE_EMPEZAR, LARGO_MINIMO,
} from '../src/lib/migracionDelCliente';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// ── 1 · Los ocho tutoriales que faltaban ───────────────────────────────────
console.log('══ los ocho sin grabar, escritos ══');
const seed = JSON.parse(readFileSync('src/lib/roadmap.seed.json', 'utf-8')) as {
  tutoriales: Array<{ codigo: string; dia: number; titulo: string }>;
};
const grabados = new Set(
  [...readFileSync('src/lib/videosCargados.ts', 'utf-8').matchAll(/'(L-\d{2})':/g)]
    .map((m) => m[1]));
const sinGrabar = seed.tutoriales.map((t) => t.codigo).filter((c) => !grabados.has(c));

ok(seed.tutoriales.length === 21, `el Camino tiene ${seed.tutoriales.length} tutoriales`);
ok(grabados.size === 13, `${grabados.size} están grabados`);
ok(sinGrabar.length === 8, `y faltan ${sinGrabar.length} por grabar`);

// ═══ LA REGLA CAMBIÓ, Y A PROPÓSITO ═══
//
// Antes esta prueba pedía lo contrario: que SOLO los que faltaban grabar
// tuvieran texto, para no tener dos versiones del mismo paso a paso.
//
// Dejó de servir cuando La Base y El Ascenso pasaron a montar todo ellos
// mismos. Con esa regla, trece tutoriales tenían el video como única forma, y
// el que abre la app sin datos para ver video se queda sin su paso a paso. Y
// la cuenta real era peor: trece de los veintiuno no tenían ni texto ni PDF,
// así que cuatro jornadas —entre ellas el día 29, Meta y el pixel, y el 31,
// encender las campañas— abrían sin ningún paso a paso.
//
// Ahora los VEINTIUNO tienen su texto. El video, cuando está, se suma arriba.
for (const t of seed.tutoriales) {
  ok(tutorialEscrito(t.codigo) !== null, `${t.codigo} tiene su paso a paso escrito`);
}
// Y lo que sí hay que vigilar de tener las dos formas: que el texto no se
// quede apuntando a otro día que el seed. Es lo único que la app lee para
// mostrarlo, y desfasado el cliente no lo ve nunca.
ok(seed.tutoriales.every((t) => {
  const e = tutorialEscrito(t.codigo);
  return e !== null && e.dia === t.dia && e.codigo === t.codigo;
}), 'y cada texto declara el mismo día y el mismo código que el seed');
ok(CODIGOS_ESCRITOS.length === seed.tutoriales.length,
  `los ${CODIGOS_ESCRITOS.length} escritos son exactamente los ${seed.tutoriales.length} del Camino`);

console.log('\n══ cada uno sirve para hacer el paso solo ══');
for (const [codigo, t] of Object.entries(TUTORIALES_DE_LUPE)) {
  ok(t.pasos.length >= 4 && t.pasos.length <= 6,
    `${codigo} tiene ${t.pasos.length} pasos`);
  ok(t.pasos.every((p) => p.length > 40),
    `${codigo}: cada paso dice qué hacer, no un título`);
  ok(t.siFalla.length > 40,
    `${codigo} dice qué hacer si algo sale distinto`);
}
const todoElTexto = Object.values(TUTORIALES_DE_LUPE)
  .map((t) => `${t.titulo} ${t.intro} ${t.pasos.join(' ')} ${t.siFalla}`).join(' ');
ok(!/ManyChat/i.test(todoElTexto), 'sin ManyChat');
ok(!/\bgente\b/i.test(todoElTexto), 'sin la palabra «gente»');
ok(!/\b(tenés|podés|hacés|grabás|acordás|querés)\b/i.test(todoElTexto),
  'y sin voseo: los clientes son de Ecuador, Panamá, Chile y Venezuela');
ok(seed.tutoriales.every((t) => {
  const e = tutorialEscrito(t.codigo);
  return !e || e.dia === t.dia;
}), 'el día de cada tutorial escrito coincide con el del Camino');

console.log('\n══ y se muestra sin esperar el video ══');
const roadmap = codigoDe('src/pages/Roadmap.tsx');
ok(/tutorialEscrito\(x\.codigo\)/.test(roadmap),
  'el bloque ya no exige video ni PDF para mostrarse');
ok(/escrito\.pasos\.map/.test(roadmap), 'dibuja los pasos');
ok(/escrito\.siFalla/.test(roadmap), 'y la salida del error');
ok(!/x\.dia === dia && \(videosPorPilar\[x\.codigo\] \|\| PDFS_POR_TUTORIAL\[x\.codigo\]\)\)/.test(roadmap),
  'y no quedó la condición vieja, que hacía desaparecer el tutorial entero');

// ── 2 · La migración no regala avance ──────────────────────────────────────
console.log('\n══ qué cuenta como contenido ══');
ok(!tieneContenido(''), 'vacío no cuenta');
ok(!tieneContenido('   '), 'ni espacios');
ok(!tieneContenido('sí'), 'ni «sí»');
ok(!tieneContenido('-'), 'ni un guion: pasan cualquier chequeo de «no está vacío» y no sirven para escribir un anuncio');
ok(!tieneContenido('mi método'), `ni algo de menos de ${LARGO_MINIMO} caracteres`);
ok(tieneContenido('Acompaño a psicólogas que atienden hace años y cobran poco'),
  'una respuesta real sí');
ok(tieneContenido(['no duermo pensando en la agenda', 'cobro menos de lo que vale']),
  'una lista con entradas reales también');
ok(!tieneContenido(['', ' ']), 'y una lista de vacíos no');

console.log('\n══ lo vacío queda pendiente, no por hecho ══');
const METAS = [
  { codigo: 'M1', adn_field: 'nicho', titulo: 'A quién ayudas' },
  { codigo: 'M2', adn_field: 'metodo_nombre', titulo: 'Tu método' },
  { codigo: 'M3', adn_field: null, titulo: 'Una sesión de hacer' },
];
const flojo = evaluarMigracion({ nicho: 'Acompaño a psicólogas que cobran poco hace años' }, METAS);
ok(flojo.cerradas.includes('M1'), 'la meta con contenido se cierra');
ok(flojo.pendientes.some((p) => p.codigo === 'M2'),
  'la del campo vacío queda PENDIENTE: es el bug que dejaba el Camino «completo» con el ADN con agujeros');
ok(flojo.pendientes[0]?.queFalta === 'Tu método',
  'y se le dice cuál, con el nombre que reconoce');
ok(flojo.cerradas.includes('M3'),
  'una sesión sin campo de ADN se cierra: es de hacer, no de escribir, y el que migra ya la vivió');

console.log('\n══ las cinco piezas que una campaña necesita ══');
ok(CAMPOS_PARA_CAMPANAS.length === 5, 'son cinco');
ok(CAMPOS_PARA_CAMPANAS.every((c) => c.porQue.length > 25),
  'cada una con el por qué: sin eso es una lista de campos que se llenan de cualquier cosa');
const COMPLETO = {
  nicho: 'Acompaño a psicólogas que atienden hace años y cobran poco',
  posicionamiento: 'El único que trabaja el precio antes que la técnica de venta',
  matriz_a: 'No duermen pensando en la agenda y cobran menos de lo que vale',
  metodo_nombre: 'El Método de los Cuatro Umbrales',
  historia_150: 'Mi mamá atendió pacientes treinta años y nunca cobró lo que valía',
};
ok(evaluarMigracion(COMPLETO, []).listoParaCampanas, 'con las cinco, puede activar');
ok(!evaluarMigracion({ nicho: COMPLETO.nicho }, []).listoParaCampanas,
  'con una sola, no: sus tres anuncios saldrían de un avatar que no existe');
ok(loQueFaltaParaCampanas({ nicho: COMPLETO.nicho }).length === 4,
  'y se le dicen las cuatro que faltan');
ok(loQueFaltaParaCampanas(COMPLETO).length === 0, 'con todo, ninguna');
const resumen = evaluarMigracion({ nicho: COMPLETO.nicho }, []).resumen;
ok(/faltan 4 de 5/.test(resumen), `el resumen cuenta: "${resumen.slice(0, 50)}…"`);
ok(/activar/.test(evaluarMigracion(COMPLETO, []).resumen),
  'y con todo le dice que le toca activar');

console.log('\n══ qué se le pide traer ══');
ok(QUE_TRAER.length === 4, 'cuatro cosas, nombradas');
ok(QUE_TRAER.every((x) => x.detalle.length > 25),
  'cada una con qué es: «pega tu información» devuelve un párrafo');
ok(/plan de negocio/i.test(QUE_TRAER.map((x) => x.titulo).join(' ')),
  'nombra los documentos que ya tiene');
ok(ANTES_DE_EMPEZAR.length > 100 && /anuncios|campaña/i.test(ANTES_DE_EMPEZAR),
  'y el aviso va ANTES: quien pega dos líneas y no ve nada cree que la app falló');

// ── 3 · La llave y el cableado ─────────────────────────────────────────────
console.log('\n══ el equipo habilita, el cliente migra ══');
const sql = readFileSync('supabase/migrations/20261017_migracion_del_cliente.sql', 'utf-8');
ok(/migracion_habilitada boolean not null default false/.test(sql),
  'la llave arranca apagada: un cliente nuevo que se migrara se saltearía su propio Camino');
ok(/function public\.habilitar_migracion/.test(sql) && /es_del_equipo\(auth\.uid\(\)\)/.test(sql),
  'y la enciende solo el equipo: si la encendiera el cliente, no sería una llave');
ok(/function public\.cerrar_mi_migracion/.test(sql),
  'el cliente cierra la suya');
ok(/migracion_habilitada = true[\s\S]{0,300}raise exception/.test(sql),
  'con la guarda puesta: sin ella, uno sin habilitar podría marcarse migrado y saltear el Camino');
ok(/and migrado_en is null/.test(sql),
  'y una sola vez: volver a correrla pisaría la fecha con la que el equipo sabe quién pasó');
ok(/piezas_para_campanas/.test(sql),
  'el equipo ve con cuántas piezas quedó, no un «migrado: sí»');

console.log('\n══ y está en las pantallas ══');
const datos = codigoDe('src/lib/migracionDatos.ts');
ok(/if \(!tieneContenido\(valor\)\) continue;/.test(datos),
  'solo se guardan los campos con contenido: uno vacío pisaría lo que ya tenía cargado');
ok(datos.indexOf("from('profiles').update") < datos.indexOf("rpc('cerrar_mi_migracion')"),
  'y se cierra DESPUÉS de guardar: al revés, si el guardado falla queda migrado con el ADN vacío y sin forma de reintentar');
ok(/return \{ habilitada: false, migradoEn: null \}/.test(datos),
  'si no se pudo leer la llave, la llave está apagada');

const pantalla = codigoDe('src/pages/MiMigracion.tsx');
ok(/paso === 'revisar'/.test(pantalla),
  'el cliente REVISA antes de que se guarde: la extracción es un primer intento, no una verdad');
ok(/setExtraido\(\(x\) => \(\{ \.\.\.x, \[campo\]: e\.target\.value \}\)\)/.test(pantalla),
  'y puede corregir campo por campo');
ok(/loQueFaltaParaCampanas/.test(pantalla), 'con lo que le falta para activar');
const app = codigoDe('src/App.tsx');
ok(/<MiMigracion/.test(app), 'está cableada');
ok(/'migracion',/.test(app), 'y en las páginas válidas');
const bottom = codigoDe('src/components/BottomTabBar.tsx');
ok(!/'migracion'/.test(bottom),
  'sin sumar un sexto destino al menú: se hace una sola vez');
const dash = codigoDe('src/pages/Dashboard.tsx');
ok(/TraeTuTrabajo/.test(dash), 'se llega por la tarjeta del HOY');
ok(/e\.habilitada && !e\.migradoEn/.test(dash),
  'que aparece solo con la llave encendida y hasta que la termina');
const admin = codigoDe('src/pages/Admin.tsx');
ok(/<HabilitarMigraciones/.test(admin), 'y el equipo la enciende desde el Admin');
const panel = codigoDe('src/components/admin/HabilitarMigraciones.tsx');
ok(/!f\.migrado_en &&/.test(panel),
  'una vez migrado no se reabre desde ahí: sería invitarlo a pisar su propio trabajo');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
