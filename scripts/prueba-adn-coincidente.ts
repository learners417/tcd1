/**
 * prueba-adn-coincidente.ts — su página, sus anuncios y su llamada dicen lo mismo.
 */
import { readFileSync } from 'node:fs';
import { FUENTES, DERIVADOS, sellarDia, desactualizados, avisoDe, selloDe } from '../src/lib/adnCoincidente';

// Memoria de mentira, para correr fuera del navegador.
const mem: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem[k] ?? null,
  setItem: (k: string, v: string) => { mem[k] = v; },
  removeItem: (k: string) => { delete mem[k]; },
  clear: () => { for (const k of Object.keys(mem)) delete mem[k]; },
  key: () => null,
  length: 0,
} as Storage;

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

console.log('\n── el mapa ──');
ok(FUENTES.length === 4, 'cuatro fuentes: precio, avatar, método y oferta');
ok(FUENTES.every((f) => f.derivados.length > 0), 'cada fuente sabe qué sale de ella');
ok(FUENTES.every((f) => f.derivados.every((d) => DERIVADOS[d])), 'cada derivado tiene nombre en su idioma');
ok(FUENTES.every((f) => f.derivados.every((d) => d > f.dia)), 'lo que sale de una fuente viene después que ella');

console.log('\n── nada viejo sin aviso ──');
sellarDia(8, 1000);   // hizo su avatar
sellarDia(11, 2000);  // después sus guiones
ok(desactualizados().length === 0, 'con todo en orden, no molesta');

sellarDia(8, 3000);   // cambió su avatar
const d1 = desactualizados();
ok(d1.length === 1 && d1[0].dia === 11, 'cambió su avatar: sus guiones quedan para revisar');
ok(avisoDe(d1[0]).includes('tu avatar') && avisoDe(d1[0]).includes('tus guiones'),
   'el aviso nombra las dos cosas', avisoDe(d1[0]));
ok(/digan lo mismo/.test(avisoDe(d1[0])), 'y dice para qué sirve revisarlo');

sellarDia(11, 4000);  // los rehizo
ok(desactualizados().length === 0, 'cuando los rehace, el aviso se va');

console.log('\n── lo que todavía no hizo no se avisa ──');
sellarDia(10, 5000);  // cambió su oferta
ok(!desactualizados().some((x) => x.dia === 24), 'su preventa, que no hizo, no aparece como vieja');
ok(selloDe(10) === 5000, 'cada jornada guarda la hora de su versión');

console.log('\n── vive adentro del Camino ──');
const roadmap = readFileSync('src/pages/Roadmap.tsx', 'utf8');
ok(/sellarDia\(meta\.dia_asignado\)/.test(roadmap), 'cada jornada que termina queda sellada');
ok(/Para que todo diga lo mismo/.test(roadmap), 'el aviso se ve en el Camino');
ok(/Está en el día \{d\.dia\}/.test(roadmap), 'y dice en qué día se arregla');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
