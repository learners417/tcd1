/**
 * EL MONTAJE, CON LOS DATOS ADENTRO.
 *
 * ═══ LOS DOS AGUJEROS QUE CIERRA ═══
 *
 * 1 · Los ocho candados vivían en `localStorage`. El cliente cambiaba de
 *     teléfono y los perdía, y el equipo no veía nunca si estaba listo para
 *     encender — aunque son el único gate real del botón.
 *
 * 2 · La pieza real de la campaña no se guardaba en ningún lado: ni el link
 *     del anuncio, ni el píxel, ni el dominio, ni el formulario, ni el
 *     calendario. Cuatro existían solo como un tilde de sí o no, sin el dato.
 *
 * La decisión que une las dos: **el candado es el dato**. Un tilde vacío no lo
 * puede verificar nadie; un dato se mira, se abre y le sirve al equipo.
 *
 * Correr con: npx tsx scripts/prueba-montaje-base.ts
 */
import { readFileSync } from 'node:fs';
import {
  candadoCerrado, cuantosCerrados, cuantosAplican, candadosQueAplican,
  puedeEncender, loQueFalta,
  comoVaElMontaje, linksDe, comoUrl, DIAS_SIN_TOCAR, type Montaje,
} from '../src/lib/montajeCampana';
import type { ObjetivoCampana } from '../src/lib/campanasTypes';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const leer = (p: string) => readFileSync(p, 'utf-8');
const soloCodigo = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

const COMPLETO: Montaje = {
  palabra: 'QUIERO',
  url_pagina: 'https://tuclinica.com/programa',
  pixel_id: '1234567890123456',
  url_perfil: 'https://instagram.com/tumarca',
  presupuesto_diario: 20,
  dias_sostenidos: 14,
  dm_probado: true,
  trabajo_claro: true,
};

// ── 1 · El candado es el dato ──────────────────────────────────────────────
console.log('══ un tilde vacío no cierra nada ══');
ok(!candadoCerrado({}, 'pixel'), 'sin el id del píxel, el candado del píxel queda abierto');
ok(candadoCerrado({ pixel_id: '123' }, 'pixel'), 'con el id, se cierra solo');
ok(!candadoCerrado({ pixel_id: '   ' }, 'pixel'), 'y los espacios no cuentan como dato');
ok(!candadoCerrado({ url_pagina: '' }, 'pagina'), 'una página vacía tampoco');
ok(candadoCerrado({ palabra: 'QUIERO' }, 'palabra'), 'la palabra cierra el suyo');

console.log('\n══ los dos que son una acción ══');
ok(candadoCerrado({ dm_probado: true }, 'dm'), 'probar el DM es un sí o no, porque es algo que hizo');
ok(!candadoCerrado({ dm_probado: false }, 'dm'), 'y sin hacerlo queda abierto');
ok(candadoCerrado({ trabajo_claro: true }, 'trabajo'), 'tener claro su trabajo, igual');

console.log('\n══ el presupuesto son dos números ══');
ok(!candadoCerrado({ presupuesto_diario: 20 }, 'presupuesto'),
  'poner un monto sin decir cuántos días lo sostiene no alcanza');
ok(!candadoCerrado({ presupuesto_diario: 20, dias_sostenidos: 7 }, 'presupuesto'),
  `con ${DIAS_SIN_TOCAR - 7} días menos de los que hacen falta, tampoco`);
ok(candadoCerrado({ presupuesto_diario: 20, dias_sostenidos: DIAS_SIN_TOCAR }, 'presupuesto'),
  `con ${DIAS_SIN_TOCAR} días sí: antes de eso los números no dicen nada`);
ok(!candadoCerrado({ presupuesto_diario: 0, dias_sostenidos: 30 }, 'presupuesto'),
  'y un presupuesto de cero no es un presupuesto');

// ── 2 · Encender ───────────────────────────────────────────────────────────
//
// Esta parte de la prueba certificaba «los ocho cerrados son ocho» y estaba en
// verde. Lo que medía ya no era cierto: dos de los ocho son del motor de
// comentarios, y la campaña que la app monta va directo al video sin palabra.
// Con los ocho obligatorios, LA CAMPAÑA QUE EL CLIENTE MONTA no podía encender
// nunca — y esta prueba lo protegía. Ahora mide lo que corresponde: que a cada
// motor se le pidan sus candados, y solo los suyos.
console.log('\n══ qué hace falta para encender ══');
const VSL: ObjetivoCampana = 'clientes_potenciales';   // directo al video
const COMENT: ObjetivoCampana = 'mensajes_retargeting'; // por palabra en comentarios

ok(cuantosAplican(VSL) === 6, `a la campaña al video se le piden ${cuantosAplican(VSL)}`);
ok(cuantosAplican(COMENT) === 8, 'y a la de comentarios los ocho');
ok(!candadosQueAplican(VSL).includes('palabra'),
  'la palabra NO se le pide a la campaña al video: no la usa');
ok(!candadosQueAplican(VSL).includes('dm'),
  'ni el DM probado, por lo mismo');
ok(candadosQueAplican(COMENT).includes('palabra') && candadosQueAplican(COMENT).includes('dm'),
  'y a la de comentarios sí: sin esos dos, ese motor no existe');

ok(puedeEncender(COMPLETO, VSL, true), 'con todo cargado, enciende');
// EL BUG, ESCRITO COMO PRUEBA: un cliente que montó la campaña al video sin
// configurar palabra ni DM tenía seis de seis y el botón le decía «Faltan 2».
const SIN_PALABRA: Montaje = { ...COMPLETO, palabra: null, dm_probado: false };
ok(puedeEncender(SIN_PALABRA, VSL, true),
  'sin palabra ni DM, la campaña al video TAMBIÉN enciende: es el bug que trababa el botón');
ok(!puedeEncender(SIN_PALABRA, COMENT, true),
  'y la de comentarios no, que es lo que la regla de los ocho quería proteger');

ok(!puedeEncender(COMPLETO, VSL, false),
  'sin los tres anuncios auditados NO se enciende, aunque todo lo demás esté');
ok(!puedeEncender({ ...COMPLETO, pixel_id: null }, VSL, true),
  'ni sin el píxel: la campaña aprendería a ciegas');
ok(cuantosCerrados({}, VSL, false) === 0, 'sin nada cargado no hay ninguno cerrado');

console.log('\n══ qué le falta, dicho como se dice ══');
ok(loQueFalta({}, VSL, false).length === 6, 'sin nada, le faltan sus seis');
ok(!loQueFalta({}, VSL, false).some((x) => /palabra|DM/.test(x)),
  'y no se le reclama la palabra: el equipo se la pedía por mensaje para nada');
ok(loQueFalta({}, COMENT, false).length === 8, 'a la de comentarios, los ocho');
ok(loQueFalta(COMPLETO, VSL, true).length === 0, 'con todo, no le falta nada');
ok(/anuncios/.test(loQueFalta({}, VSL, false)[0]),
  'y lo primero que se nombra son los anuncios: sin ellos no hay campaña');
ok(/Puede encender/.test(comoVaElMontaje(COMPLETO, VSL, true)),
  `la línea del equipo lo dice derecho: "${comoVaElMontaje(COMPLETO, VSL, true)}"`);
ok(/Le falta uno/.test(comoVaElMontaje({ ...COMPLETO, trabajo_claro: false }, VSL, true)),
  'cuando falta uno solo, lo dice así');
ok(/Tiene 0 de 6/.test(comoVaElMontaje({}, VSL, false)),
  'y el total que le lee el equipo es el que le aplica, no «de 8» escrito a mano');
ok(!/undefined|NaN|null/.test(comoVaElMontaje({}, VSL, false) + loQueFalta({}, VSL, false).join(' ')),
  'sin agujeros en el texto');

// ── 2b · UNA SOLA CUENTA PARA LAS DOS PANTALLAS ────────────────────────────
// El cliente leía «6 de 6 · listo» y el equipo «6 de 8». Dos números para el
// mismo cliente enseñan a no creerle a ninguno, y la discusión la termina
// ganando el que está delante del cliente.
console.log('\n══ el cliente y el equipo cuentan igual ══');
const cliente = readFileSync('src/components/campanas/MontajeCupos.tsx', 'utf-8');
const equipo = readFileSync('src/components/admin/MontajeDelCliente.tsx', 'utf-8');
ok(/candadosQueAplican/.test(cliente),
  'la pantalla del cliente usa los candados por objetivo');
ok(/cuantosAplican/.test(equipo),
  'y la del equipo también, en vez del 8 escrito a mano');
ok(!/ de 8</.test(cliente) && !/ de 8</.test(equipo),
  'ninguna de las dos tiene «de 8» escrito en el texto');
ok(!/\{listos\} de 8|=== 8|length === 8/.test(cliente),
  'ni la cuenta vieja escondida en una comparación');

// ── 3 · Los links que el equipo abre ───────────────────────────────────────
console.log('\n══ para mirar su campaña ══');
ok(linksDe({}).length === 0, 'sin links cargados no se inventa ninguno');
const conLinks = linksDe({ ...COMPLETO, url_anuncio_meta: 'https://facebook.com/ads/1' });
ok(conLinks[0].que === 'El anuncio corriendo',
  'el anuncio va primero: es lo que el equipo abre para revisar');
ok(conLinks.every((l) => l.url.startsWith('http')), 'y todos son links que se pueden abrir');

console.log('\n══ un link escrito a las apuradas ══');
ok(comoUrl('tuclinica.com') === 'https://tuclinica.com',
  'sin el https adelante, se le pone');
ok(comoUrl('https://ya.com') === 'https://ya.com', 'y si ya lo tiene, se respeta');
ok(comoUrl('  espacios.com  ') === 'https://espacios.com', 'los espacios se recortan');
ok(comoUrl('') === '', 'vacío sigue vacío');

// ── 4 · Dónde vive ─────────────────────────────────────────────────────────
console.log('\n══ dónde vive ══');
const lib = leer('src/lib/montajeCampana.ts');
const datos = leer('src/lib/montajeDatos.ts');
const pantalla = leer('src/components/campanas/MontajeCupos.tsx');
const fichaEquipo = leer('src/components/admin/MontajeDelCliente.tsx');
const admin = leer('src/pages/Admin.tsx');
const mig = leer('supabase/migrations/20261012_montaje_de_campana.sql');

ok(!/from '\.\/supabase'/.test(lib), 'la regla se prueba sola: no toca la base');
ok(/from '\.\/supabase'/.test(datos), 'y el que habla con la base está aparte');
ok(/\.in\('user_id', userIds\)/.test(datos),
  'trae a todos en una sola consulta, no una por cliente');

const codigoPantalla = soloCodigo(pantalla);
ok(!/const KEY = 'tcd_montaje_v1'/.test(codigoPantalla),
  'los candados ya no viven en el navegador: ahí se perdían al cambiar de teléfono');
ok(/guardarMontaje/.test(codigoPantalla) && /montajeDe/.test(codigoPantalla),
  'la pantalla del cliente guarda y lee de la base');
ok(/candadoCerrado\(montaje, id\)/.test(codigoPantalla),
  'y el tilde se deriva del dato, no de una casilla');
ok(/url_anuncio_meta/.test(codigoPantalla) && /dominio/.test(codigoPantalla)
  && /url_formulario/.test(codigoPantalla) && /url_calendario/.test(codigoPantalla),
  'los cuatro datos que el equipo necesita también se cargan');

ok(/<MontajeDelCliente/.test(admin), 'el equipo lo ve en la ficha del cliente');
ok(/montajeDe/.test(fichaEquipo) && !/guardarMontaje/.test(fichaEquipo),
  'y solo lee: si el equipo lo cargara por él, el tilde dejaría de querer decir que está hecho');

console.log('\n══ la base ══');
ok(/create table if not exists public\.montaje_campana/.test(mig), 'la tabla existe');
ok(/url_anuncio_meta/.test(mig) && /pixel_id/.test(mig) && /dominio/.test(mig),
  'con los datos que no tenían dónde vivir');
ok(/user_id = auth\.uid\(\)/.test(mig), 'cada cliente escribe lo suyo');
ok(/montaje_equipo_lee/.test(mig) && /for select/.test(mig),
  'el equipo lee todo');
// La política del equipo, sola: tiene que ser de lectura y nada más.
const delEquipo = mig.slice(mig.indexOf('create policy "montaje_equipo_lee"'));
ok(/for select/.test(delEquipo.slice(0, 400)) && !/for all/.test(delEquipo.slice(0, 400)),
  'pero no escribe: lo monta el cliente');

console.log('\n══ cerrar una campaña no borra su trabajo ══');
ok(/guardarCampo\('presupuesto_diario', null\)/.test(codigoPantalla)
  && !/guardarCampo\('pixel_id', null\)/.test(codigoPantalla),
  'al cerrar se reinicia el presupuesto, que es de esa campaña — su página y su píxel quedan');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
