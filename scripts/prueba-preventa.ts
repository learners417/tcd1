/**
 * prueba-preventa.ts — los tres primeros compran al mismo precio.
 */
import { readFileSync } from 'node:fs';
import { BONOS, mensajeDePreventa } from '../src/lib/bonosPreventa';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

console.log('\n── el menú ──');
ok(BONOS.length === 5, `${BONOS.length} bonos para elegir dos`);
ok(BONOS.every((b) => b.comoSeLoDice && b.leCuesta && b.porQueFunciona),
   'cada bono dice cómo se lo dice, qué le cuesta y por qué mueve la decisión');
ok(!BONOS.some((b) => /descuento|%|rebaja|off\b/i.test(`${b.nombre} ${b.comoSeLoDice}`)),
   'ninguno es un descuento');
ok(!BONOS.some((b) => /(^| )appb|aplicación|software/i.test(b.comoSeLoDice)),
   'ninguno le pide que construya una app: son terapeutas, coaches y médicos');
ok(BONOS.every((b) => b.leCuesta.length > 10), 'todos le cuestan algo suyo');

console.log('\n── el mensaje ──');
const msj = mensajeDePreventa(['sesiones', 'horario'], { promesa: 'dejar de trabajar los sábados', plazo: 'doce semanas', precio: '1.000 USD' });
ok(msj.includes('1.000 USD'), 'lleva el precio completo adentro');
ok(msj.includes('mismo que va a pagar el resto'), 'dice que el precio es el mismo que el del resto');
ok(msj.includes('Dos sesiones extra') && msj.includes('tu día y tu hora'), 'lleva los dos bonos elegidos');
ok((msj.match(/·/g) ?? []).length === 2, 'solo dos bonos, no cinco');
ok(msj.trim().endsWith('?'), 'termina en un solo paso siguiente');
ok(!/descuento|oferta especial|últim/i.test(msj), 'sin descuentos ni urgencia inventada');
const vacio = mensajeDePreventa([]);
ok(vacio.includes('[elige dos bonos]'), 'sin bonos elegidos, el mensaje dice qué falta');

console.log('\n── vive en la jornada del día 24 ──');
const roadmap = readFileSync('src/pages/Roadmap.tsx', 'utf8');
ok(/PreventaPanel/.test(roadmap) && /codigoDelDia\(24\)/.test(roadmap), 'la preventa se abre el día 24');
ok(/adn_bonos_preventa/.test(roadmap), 'los dos bonos quedan en su ADN');
ok(/precioSellado\(\)/.test(roadmap), 'el precio sale del que selló el día 5');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
