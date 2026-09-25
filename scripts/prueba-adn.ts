/**
 * prueba-adn.ts — el ADN se llena solo al hacer el Camino.
 *
 * El bug que cazó esta prueba: las piezas se chequeaban contra códigos del
 * Camino viejo (P1.5, P2.3, P7.3). El cliente podía terminar los noventa días
 * con el ADN casi vacío.
 */
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { PIEZAS_ADN } from '../src/lib/adnPiezas';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const claves = new Set(SEED_ROADMAP_V2.flatMap((p) => p.metas).flatMap((m) => m.adn_fields ?? []));
const conClave = PIEZAS_ADN.filter((p) => p.chequeo.clave);
ok(conClave.length >= 10, `${conClave.length} de ${PIEZAS_ADN.length} piezas del ADN se sellan con el Camino de hoy`);

const huerfanas = conClave.filter((p) => !claves.has(p.chequeo.clave!));
ok(huerfanas.length === 0, 'ninguna pieza apunta a una clave que el Camino no escribe',
   huerfanas.map((p) => `${p.id}→${p.chequeo.clave}`).join(', '));

const viejas = PIEZAS_ADN.filter((p) => !p.chequeo.clave && !p.chequeo.origen);
ok(viejas.length <= 3, 'quedan pocas piezas atadas solo a códigos antiguos',
   viejas.map((p) => p.id).join(', '));

console.log(fallas === 0 ? '\n✓ EL ADN SE LLENA CON EL CAMINO\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
