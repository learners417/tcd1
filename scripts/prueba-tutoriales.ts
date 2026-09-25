/**
 * prueba-tutoriales.ts — donde más se traba, hay paso a paso.
 *
 * Perfil y página, agenda y cobro, pixel, campañas y su app: cinco jornadas
 * técnicas que hasta hoy dependían de que Lupe grabara el video. El paso a
 * paso escrito va adentro de la sesión, y de ahí sale el guion para grabar.
 */
import { TUTORIALES, getTutoriales } from '../src/lib/tutorialesTecnicos';
import { SEED_ROADMAP_V2, codigoDelDia } from '../src/lib/roadmapSeed';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const TECNICAS = [16, 17, 29, 31, 38];
const metas = SEED_ROADMAP_V2.flatMap((p) => p.metas);

console.log('\n── las cinco jornadas técnicas ──');
for (const d of TECNICAS) {
  const t = getTutoriales(codigoDelDia(d));
  ok(t.length > 0, `el día ${d} tiene paso a paso`, t.map((x) => x.titulo).join(' · '));
}
const sinCaja = TECNICAS.filter((d) => {
  const m = metas.find((x) => x.dia_asignado === d);
  return !m || (m.tipo !== 'COACH' && m.tipo !== 'VIDEO');
});
ok(sinCaja.length === 0, 'todas son jornadas que muestran el paso a paso en la sesión', sinCaja.join(', '));

console.log('\n── cómo están escritos ──');
const todos = Object.values(TUTORIALES);
ok(todos.every((t) => t.dia > 0), 'cada tutorial sabe a qué día pertenece');
ok(todos.every((t) => t.pasos.length >= 3 && t.pasos.length <= 6), 'entre tres y seis pasos cada uno');
ok(todos.every((t) => t.siFalla), 'todos dicen qué hacer si algo falla');
ok(todos.every((t) => t.intro && t.intro.length > 30), 'todos dicen para qué sirve antes de los pasos');
const nuevos = todos.filter((t) => TECNICAS.includes(t.dia) && /^(perfil|agenda|pixel|encender|app)/.test(t.codigo));
ok(nuevos.length === 5, `los cinco que faltaban están escritos`, String(nuevos.length));
// El último paso siempre comprueba: sin eso, el cliente cree que quedó hecho.
ok(nuevos.every((t) => /prueb|abre|mira|revisa|entra|recorre/i.test(t.pasos[t.pasos.length - 1])),
   'cada uno termina comprobando que funciona de verdad',
   nuevos.filter((t) => !/prueb|abre|mira|revisa|entra|recorre/i.test(t.pasos[t.pasos.length - 1])).map((t) => t.dia).join(', '));

console.log('\n── el día manda, no el código ──');
ok(getTutoriales(codigoDelDia(29)).length >= 2, 'una jornada puede tener más de un paso a paso');
ok(getTutoriales('codigo-que-no-existe').length === 0, 'un código inventado no devuelve nada');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
