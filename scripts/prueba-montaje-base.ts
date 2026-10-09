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
  candadoCerrado, cuantosCerrados, puedeEncender, loQueFalta,
  comoVaElMontaje, linksDe, comoUrl, DIAS_SIN_TOCAR, type Montaje,
} from '../src/lib/montajeCampana';

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
console.log('\n══ qué hace falta para encender ══');
ok(cuantosCerrados(COMPLETO, true) === 8, 'los ocho cerrados son ocho');
ok(puedeEncender(COMPLETO, true), 'y con los ocho se puede encender');
ok(!puedeEncender(COMPLETO, false),
  'sin los tres anuncios auditados NO se enciende, aunque todo lo demás esté');
ok(!puedeEncender({ ...COMPLETO, pixel_id: null }, true),
  'ni sin el píxel: la campaña aprendería a ciegas');
ok(cuantosCerrados({}, false) === 0, 'sin nada cargado no hay ninguno cerrado');

console.log('\n══ qué le falta, dicho como se dice ══');
ok(loQueFalta({}, false).length === 8, 'sin nada, le faltan los ocho');
ok(loQueFalta(COMPLETO, true).length === 0, 'con todo, no le falta nada');
ok(/anuncios/.test(loQueFalta({}, false)[0]),
  'y lo primero que se nombra son los anuncios: sin ellos no hay campaña');
ok(/Puede encender/.test(comoVaElMontaje(COMPLETO, true)),
  `la línea del equipo lo dice derecho: "${comoVaElMontaje(COMPLETO, true)}"`);
ok(/Le falta uno/.test(comoVaElMontaje({ ...COMPLETO, trabajo_claro: false }, true)),
  'cuando falta uno solo, lo dice así');
ok(/Tiene 0 de 8/.test(comoVaElMontaje({}, false)),
  'y cuando no empezó, también');
ok(!/undefined|NaN|null/.test(comoVaElMontaje({}, false) + loQueFalta({}, false).join(' ')),
  'sin agujeros en el texto');

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
