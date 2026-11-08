/**
 * prueba-hoja-de-ruta.ts — sus noventa días, a la vista desde el día 1.
 */
import { readFileSync } from 'node:fs';
import { diasDeLaRuta, fechaCorta, fechaDelDia, SEMANAS, HITOS } from '../src/lib/hojaDeRuta';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const dias = diasDeLaRuta();

console.log('\n── los noventa días ──');
ok(dias.length === 90, `${dias.length} días, del 1 al 90`);
ok(dias.every((d, i) => d.dia === i + 1), 'no falta ninguno y están en orden');
ok(Object.keys(SEMANAS).length === 13, 'las trece semanas tienen nombre');
ok(dias.every((d) => SEMANAS[d.semana]), 'cada día cae en una semana con nombre');
ok(dias.every((d) => d.titulo), 'cada día trae su título del Camino');

console.log('\n── los hitos ──');
const hitos = dias.filter((d) => d.hito);
ok(hitos.length === Object.keys(HITOS).length, `${hitos.length} hitos marcados`);
ok(hitos.every((h) => dias.find((d) => d.dia === h.dia)?.minutos !== undefined), 'cada hito cae en una jornada real');
ok(Boolean(HITOS[15]?.includes('rodaje')) && Boolean(HITOS[31]?.includes('campañas')), 'el rodaje y las campañas están señalados');

console.log('\n── las fechas ──');
const lunes = '2026-10-05';
ok(fechaDelDia(lunes, 1)?.getDay() === 1, 'el día 1 es el lunes de arranque');
ok(fechaDelDia(lunes, 15)?.getDay() === 1, 'el día del rodaje cae lunes');
ok(dias.filter((d) => d.finDeSemana).every((d) => d.minutos === 0), 'ningún fin de semana pide trabajo');
ok(fechaCorta(lunes, 15).includes('lunes'), 'la fecha se lee en palabras', fechaCorta(lunes, 15));
ok(fechaCorta(null, 15) === '', 'sin fecha de inicio no inventa fechas');

console.log('\n── vive adentro del Camino ──');
const roadmap = readFileSync('src/pages/Roadmap.tsx', 'utf8');
ok(/HojaDeRuta/.test(roadmap), 'se abre desde el Camino');
/*
 * LA REGLA ES QUE TENGA PUERTA, NO CUAL. Esta linea decia «tiene su tarjeta
 * en la grilla» y guardaba la implementacion, no la regla: el dia que la
 * grilla volvio a tres casillas —decision del 7 de noviembre— esto se puso
 * rojo sin que nada se hubiera roto.
 *
 * Su puerta ahora cuelga del anillo de jornadas, que es lo que contesta
 * «cuanto llevo»: la Hoja de Ruta es esa misma pregunta con el detalle de las
 * doce semanas. Lo que se cuida es que el boton exista y que alguien lo abra.
 */
ok(/onAbrirRuta=\{\(\) => setRutaAbierta\(true\)\}/.test(roadmap), 'el Camino le pasa su puerta al encabezado');
const encabezado = readFileSync('src/components/camino/EncabezadoCamino.tsx', 'utf8');
ok(/Ver mis 90 d\u00edas/.test(encabezado), 'y el anillo la abre');
const vista = readFileSync('src/components/camino/HojaDeRuta.tsx', 'utf8');
ok(/d\.minutos > 0 && completadas\.has/.test(vista), 'cuenta las jornadas con trabajo, no los días de campo');
ok(/arrancaLunes/.test(vista), 'solo promete el fin de semana libre a quien arranca en lunes');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
