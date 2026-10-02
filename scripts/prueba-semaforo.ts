/**
 * prueba-semaforo.ts — el color sale de los hechos, no de una impresión.
 */
import { readFileSync } from 'node:fs';
import { semaforoDe, filaDe, conteo, jornadasAbiertas, diasSinEntrar,
         ATRASO_AMARILLO, ATRASO_ROJO, DIAS_SIN_ENTRAR_ROJO, type ClienteParaSemaforo } from '../src/lib/semaforo';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { esPasoDelCliente } from '../src/lib/diaPrograma';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const INICIO = '2026-10-05';   // lunes
const HOY = '2026-10-19';      // lunes, día 15 del Camino

/** Las claves de las jornadas del día 1 al día `hasta`. */
function hechasHasta(hasta: number): Set<string> {
  const out = new Set<string>();
  for (const p of SEED_ROADMAP_V2) {
    for (const m of p.metas) {
      const d = m.dia_asignado;
      if (d !== null && d >= 1 && d <= hasta && esPasoDelCliente(m)) out.add(`${p.numero}-${m.codigo}`);
    }
  }
  return out;
}

const base = (extra: Partial<ClienteParaSemaforo>): ClienteParaSemaforo => ({
  id: 'x', nombre: 'Cliente', fecha_inicio: INICIO, acceso_tipo: 'noventa',
  completadas: hechasHasta(15), ultimoIngreso: HOY, ...extra,
});

console.log('\n── verde ──');
const verde = filaDe(base({}), HOY);
ok(verde.color === 'verde', 'todo cerrado y entrando hoy: verde', verde.porque);
ok(verde.semana === 3 && verde.dia === 15, 'dice en qué semana y en qué día va', `semana ${verde.semana}, día ${verde.dia}`);
ok(verde.diasDeVentana !== null && verde.diasDeVentana > 0, 'y cuántos días le quedan de ventana');
ok(verde.jornadaAtrasada === null, 'sin jornada atrasada');

console.log('\n── amarillo ──');
// Cerró hasta el día 5: el 6 le quedó abierto hace seis días hábiles.
const amarillo = filaDe(base({ completadas: hechasHasta(5) }), HOY);
ok(amarillo.color === 'amarillo', `más de ${ATRASO_AMARILLO} días de atraso: amarillo`, amarillo.porque);
ok(amarillo.jornadaAtrasada?.dia === 8, 'nombra la jornada más atrasada', String(amarillo.jornadaAtrasada?.dia));
ok((amarillo.jornadaAtrasada?.diasDeAtraso ?? 0) > ATRASO_AMARILLO, 'y cuántos días lleva');

console.log('\n── rojo, por sus tres motivos ──');
const porAtraso = filaDe(base({ completadas: hechasHasta(2) }), HOY);
ok(porAtraso.color === 'rojo', `más de ${ATRASO_ROJO} días de atraso: rojo`, porAtraso.porque);

const porAusencia = filaDe(base({ ultimoIngreso: '2026-10-13' }), HOY);
ok(porAusencia.color === 'rojo', `${DIAS_SIN_ENTRAR_ROJO} días sin entrar: rojo`, porAusencia.porque);
ok(porAusencia.diasSinEntrar === 6, 'y cuenta los días sin entrar', String(porAusencia.diasSinEntrar));

const porCuota = filaDe(base({
  acceso_tipo: 'cuotas',
  acceso_cuotas: [{ vence: '2026-10-05', pagada: true }, { vence: '2026-10-12', pagada: false }],
}), HOY);
ok(porCuota.color === 'rojo', 'cuota vencida sin pagar: rojo', porCuota.porque);
ok(/pago/.test(porCuota.porque), 'y dice que está esperando el pago');
ok(porCuota.diasDeVentana === null, 'con el Camino cerrado no muestra días de ventana');

console.log('\n── el orden del tablero ──');
const filas = semaforoDe([
  base({ id: 'a', nombre: 'Ana' }),
  base({ id: 'b', nombre: 'Bruno', completadas: hechasHasta(5) }),
  base({ id: 'c', nombre: 'Carla', completadas: hechasHasta(2) }),
  base({ id: 'd', nombre: 'Diego', ultimoIngreso: '2026-10-12' }),
], HOY);
ok(filas[0].color === 'rojo' && filas[filas.length - 1].color === 'verde', 'rojos arriba, verdes al final');
ok((filas[0].jornadaAtrasada?.diasDeAtraso ?? 0) >= (filas[1].jornadaAtrasada?.diasDeAtraso ?? 0),
   'dentro del rojo, el más atrasado primero');
const c = conteo(filas);
ok(c.rojo === 2 && c.amarillo === 1 && c.verde === 1, 'el conteo por color cuadra', JSON.stringify(c));

console.log('\n── los detalles ──');
ok(jornadasAbiertas(base({ completadas: hechasHasta(11) }), HOY).every((j) => j.dia > 11),
   'solo cuenta como abiertas las que ya le tocaban');
ok(!jornadasAbiertas(base({ completadas: new Set() }), HOY).some((j) => j.dia > 15),
   'nunca marca atrasado algo que todavía no llegó');
ok(diasSinEntrar(null) === null, 'sin dato de ingreso no inventa un número');
ok(filaDe(base({ fecha_inicio: null }), HOY).semana === 0, 'quien todavía no arrancó no tiene semana');

console.log('\n── los fines de semana no suman atraso ──');
const conFinde = filaDe(base({ completadas: hechasHasta(11) }), HOY);
const corridos = 15 - 12;
ok((conFinde.jornadaAtrasada?.diasDeAtraso ?? 0) <= corridos + 1, 'el atraso se cuenta en días hábiles',
   String(conFinde.jornadaAtrasada?.diasDeAtraso));

console.log('\n── las varas están en un solo lugar ──');
const lib = readFileSync('src/lib/semaforo.ts', 'utf8');
ok(/ATRASO_AMARILLO = 3/.test(lib) && /ATRASO_ROJO = 7/.test(lib) && /DIAS_SIN_ENTRAR_ROJO = 5/.test(lib),
   'tres, siete y cinco, escritos una sola vez');

// ── La pantalla, montada donde Lupe la abre ──
console.log('\n── la pantalla ──');
const admin = readFileSync('src/pages/Admin.tsx', 'utf8');
const vista = readFileSync('src/components/admin/SemaforoClientes.tsx', 'utf8');
const okPantalla = ok;
okPantalla(/SemaforoClientes/.test(admin) && /semaforoDe\(/.test(admin), 'se ve en la pestaña de clientes');
okPantalla(/filaDe\(\{/.test(admin), 'el color del Admin sale de la misma regla');
okPantalla(/ultimosIngresos/.test(admin), 'trae el último ingreso de todos en una sola consulta');
okPantalla(/onAbrir/.test(vista) && /ChevronRight/.test(vista), 'cada fila abre el detalle del cliente');
okPantalla(!/text-xs|text-sm|text-\[1[0-5]px\]/.test(vista), 'sin letra chica');
okPantalla(/min-h-\[76px\]/.test(vista), 'las filas se tocan bien con el dedo');
okPantalla(/semana \$\{f\.semana\}|semana \$\{/.test(vista), 'muestra la semana del Camino');
okPantalla(/días de acceso/.test(vista), 'y los días que le quedan de ventana');


// ── Lo que hizo afuera: para que el color diga la verdad ──
console.log('\n── lo que hizo afuera ──');
const panel = readFileSync('src/components/admin/HechoAfueraPanel.tsx', 'utf8');
const libAfuera = readFileSync('src/lib/hechoAfuera.ts', 'utf8');
const mig = readFileSync('supabase/migrations/20260929_hecho_afuera.sql', 'utf8');
ok(/hecho_afuera/.test(mig) && /marcado_por/.test(mig), 'la base guarda que vino de afuera y quién lo marcó');
ok(/marcarHechoAfuera/.test(libAfuera) && /desmarcarHechoAfuera/.test(libAfuera), 'se puede marcar y volver atrás');
ok(/completada: true/.test(libAfuera), 'cuenta como cerrada, así el color deja de marcarlo en rojo');
ok(/AVISO_HECHO_AFUERA/.test(panel), 'la pantalla dice qué pasa cuando se marca');
ok(/HechoAfueraPanel/.test(admin) && /jornadasAbiertas\(\{/.test(admin), 'vive en el detalle del cliente');
ok(/hechasAfuera\(/.test(admin), 'y muestra tildadas las que ya se cerraron así');
ok(!/text-xs|text-sm/.test(panel), 'sin letra chica');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);

