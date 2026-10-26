/**
 * prueba-sube-de-escalon.ts — el camino del ultra low, de punta a punta.
 *
 * ═══ LA FALLA QUE PROTEGE ═══
 *
 * `plan` y `plan_comercial` son dos columnas distintas. La primera dice por
 * dónde entró ('ELNUMERO') y **nadie la limpia nunca**; la segunda dice qué
 * acceso tiene hoy.
 *
 * Y cuatro lugares preguntaban por la primera: `planDe`, `planActual`, el
 * candado del ADN y el del Camino. Ninguno miraba si había pagado algo arriba.
 * Resultado: el que entraba por los $27 y después pagaba La Base **seguía
 * viendo el Camino cortado en el día 5, con el candado del día 6 puesto**,
 * justo después de pagar. Pasaba igual si el equipo le abría el acceso a mano
 * desde el Admin.
 *
 * Es la falla más cara posible: no se nota al venderlo, se nota cuando el
 * cliente ya pagó y escribe preguntando por qué no se le abrió nada.
 */
import { planDe, enElTramoDelNumero, planPermitePilar, PILAR_MAX } from '../src/lib/planes';
import { laOfertaTrasElAcceso } from '../src/lib/laOfertaQueSigue';
import { ULTIMO_DIA_DE_BASE } from '../src/lib/topeDelEscalon';
import { servicioDe } from '../src/lib/cuadroTickets';
import type { Profile } from '../src/lib/supabase';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

console.log('\n── paga los $27 y entra ──');
const recienLlegado: Partial<Profile> = { plan: 'ELNUMERO', plan_comercial: undefined };
ok(planDe(recienLlegado) === 'blanco', 'su acceso es el de los 5 días', planDe(recienLlegado));
ok(enElTramoDelNumero(recienLlegado), 'y está en el tramo del $27');
ok(planPermitePilar(planDe(recienLlegado), 1), 'el pilar 1 le abre');
ok(!planPermitePilar(planDe(recienLlegado), 2), 'y el 2 le queda cerrado, que es el corte');

console.log('\n── toca el candado del día 6 ──');
const oferta = laOfertaTrasElAcceso(PILAR_MAX.blanco);
ok(oferta.ticket === 'base', 'se le ofrece La Base');
ok(oferta.precio === '$1.000', 'a $1.000', oferta.precio);
ok(oferta.abre.includes(String(ULTIMO_DIA_DE_BASE)), `y le dice que abre hasta el día ${ULTIMO_DIA_DE_BASE}`);

console.log('\n── paga La Base: el webhook escribe las dos columnas ──');
/*
 * Lo que hace `api/ghl-webhook.ts` con `plan: "base"`. Se replica acá porque
 * esa ruta no se puede importar sin el cliente de Supabase, y lo que importa
 * es que los valores que escribe le abran de verdad lo que compró.
 */
const yaPago: Partial<Profile> = { plan: 'ELNUMERO', plan_comercial: 'amarillo', servicio_contratado: 'base' };

ok(planDe(yaPago) === 'amarillo', 'lo que pagó le gana a por dónde entró', planDe(yaPago));
ok(!enElTramoDelNumero(yaPago), 'ya NO está en el tramo del $27');
ok(planPermitePilar(planDe(yaPago), 2), 'el pilar 2 se le abre — lo que acaba de comprar');
ok(!planPermitePilar(planDe(yaPago), 3), 'y el 3 queda para El Ascenso');
ok(servicioDe(yaPago.servicio_contratado) === 'base',
  'el equipo ve que contrató La Base, no un escalón de más');

console.log('\n── y el candado que sigue ya ofrece otra cosa ──');
const siguiente = laOfertaTrasElAcceso(PILAR_MAX.amarillo);
ok(siguiente.ticket === 'ascenso', 'después de La Base sigue El Ascenso');
ok(siguiente.precio !== oferta.precio, 'con otro precio', `${oferta.precio} → ${siguiente.precio}`);

console.log('\n── el que paga El Ascenso de una ──');
const ascenso: Partial<Profile> = { plan: 'ELNUMERO', plan_comercial: 'negro', servicio_contratado: 'ascenso' };
ok(planDe(ascenso) === 'negro', 'tiene el acceso completo');
ok(planPermitePilar(planDe(ascenso), 10), 'hasta el último pilar');
ok(servicioDe(ascenso.servicio_contratado) === 'ascenso', 'y el equipo le debe el acompañamiento');

console.log('\n── el servicio NO se adivina del acceso ──');
/*
 * El puente que `cuadroTickets` quitó: alguien con acceso completo pero sin
 * servicio marcado cae en `base`, el más bajo. Mostrarle de menos a quien
 * pagó se arregla con un mensaje; mostrarle de más hace trabajar al equipo
 * de regalo y nadie se entera hasta que es tarde.
 */
ok(servicioDe(null) === 'base', 'sin marcar, cae en el escalón más bajo');
ok(servicioDe('negro') === 'base', 'un color de acceso no es un servicio contratado');
ok(servicioDe('verde') === 'base', 'ni «verde» tampoco');

console.log('\n── el cliente de siempre no se toca ──');
const otraPuerta: Partial<Profile> = { plan: 'DWY', plan_comercial: undefined };
ok(planDe(otraPuerta) === 'completo',
  'quien entró por otra puerta sigue con todo abierto');
ok(!enElTramoDelNumero(otraPuerta),
  'y nunca estuvo en el tramo del $27');
ok(planDe(null) === 'completo', 'sin perfil, no se le cierra nada');
ok(planDe({ plan: 'ELNUMERO', plan_comercial: 'blanco' } as Partial<Profile>) === 'blanco',
  'y el que el equipo dejó en blanco a mano sigue en blanco');

console.log(fallas === 0 ? '\n✓ sube de escalón y se le abre lo que pagó\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
