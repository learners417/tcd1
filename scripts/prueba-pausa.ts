/**
 * prueba-pausa.ts — parar el Camino de todos sin que nadie pierda nada.
 */
import { readFileSync } from 'node:fs';
import {
  diasPedidos, diasQueDura, ultimoDiaParado, retomaEl, pausaVigente, pausaQueViene,
  diasDeCorrimiento, hoyDelCamino, cierreCorrido, fijarPausas, corrimientoActual,
  pausaActiva, enPalabras, cartelDeLaPausa, resumenParaElEquipo, loQueVaAPasar,
  type PausaGlobal,
} from '../src/lib/pausaGlobal';
import { diaDelPrograma, diasHabilesDeAtraso } from '../src/lib/diaPrograma';
import { filaDe } from '../src/lib/semaforo';
import { estadoDeAcceso } from '../src/lib/ventanaDeAcceso';

let fallas = 0;
function ok(cond: boolean, que: string) {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
}

// La pausa de fin de año, tal como la va a cargar el equipo.
const finDeAnio: PausaGlobal = { desde: '2026-12-15', hasta: '2027-01-15' };

console.log('── cuánto dura de verdad ──');
ok(diasPedidos(finDeAnio) === 32, `se piden ${diasPedidos(finDeAnio)} días`);
ok(diasQueDura(finDeAnio) === 35, `se paran ${diasQueDura(finDeAnio)}: semanas enteras`);
ok(diasQueDura(finDeAnio) % 7 === 0, 'siempre un número redondo de semanas');
ok(diasQueDura(finDeAnio) >= diasPedidos(finDeAnio), 'se redondea hacia arriba: nadie pierde días');
ok(ultimoDiaParado(finDeAnio) === '2027-01-18', `el último día parado es ${ultimoDiaParado(finDeAnio)}`);
ok(retomaEl(finDeAnio) === '2027-01-19', `retoma el ${retomaEl(finDeAnio)}`);

// Lo que protege el redondeo: que cada jornada caiga siempre en su mismo día.
const diaSemana = (iso: string) => new Date(`${iso}T12:00:00`).getDay();
ok(diaSemana(finDeAnio.desde) === diaSemana(retomaEl(finDeAnio)),
   'el Camino retoma el mismo día de la semana en que se paró');

console.log('\n── el hoy del Camino ──');
ok(diasDeCorrimiento([finDeAnio], '2026-12-14') === 0, 'la víspera todavía no corre nada');
ok(diasDeCorrimiento([finDeAnio], '2026-12-15') === 1, 'el primer día parado corre uno');
ok(diasDeCorrimiento([finDeAnio], '2026-12-25') === 11, 'a mitad de pausa corre lo que lleva');
ok(diasDeCorrimiento([finDeAnio], '2027-01-19') === 35, 'al retomar corre los 35 completos');
ok(diasDeCorrimiento([finDeAnio], '2027-03-01') === 35, 'después no sigue creciendo');

const congelado = ['2026-12-15', '2026-12-25', '2027-01-05', '2027-01-18']
  .map((d) => hoyDelCamino([finDeAnio], new Date(`${d}T12:00:00`)).toDateString());
ok(new Set(congelado).size === 1, 'durante toda la pausa el Camino se queda quieto en el mismo día');
ok(hoyDelCamino([finDeAnio], new Date('2027-01-19T12:00:00')).toDateString()
   === new Date('2026-12-15T12:00:00').toDateString(),
   'al retomar sigue justo donde quedó, sin saltar ni retroceder');

console.log('\n── el día del programa se corre solo ──');
const inicio = '2026-10-05';
// Con un arranque de diciembre el día queda lejos del tope de 90, así se ve
// el corrimiento limpio: 35 días menos, ni uno más.
const arranqueTarde = '2026-12-07';
fijarPausas([]);
const sinPausa = diaDelPrograma(arranqueTarde, new Date('2027-01-20T12:00:00'));
fijarPausas([finDeAnio]);
const conPausa = diaDelPrograma(arranqueTarde, new Date('2027-01-20T12:00:00'));
ok(sinPausa !== null && conPausa !== null && sinPausa - conPausa === 35,
   `sin pausa iría por el día ${sinPausa}; con pausa va por el ${conPausa}`);
ok(corrimientoActual('2027-01-20') === 35, 'el registro global sabe cuánto lleva corrido');
ok(pausaActiva('2026-12-20') !== null && pausaActiva('2027-02-01') === null,
   'sabe cuándo el Camino está parado y cuándo no');

// Durante la pausa nadie acumula atraso.
const diaEnPausa = diaDelPrograma(inicio, new Date('2026-12-28T12:00:00')) ?? 0;
const diaVispera = diaDelPrograma(inicio, new Date('2026-12-14T12:00:00')) ?? 0;
ok(diaEnPausa === diaVispera, 'a dos semanas de pausa sigue en el mismo día del programa');
ok(diasHabilesDeAtraso(inicio, diaVispera, diaEnPausa) === 0, 'y no acumula un solo día de atraso');

console.log('\n── el semáforo calla ──');
const cliente = {
  id: 'ana', nombre: 'Ana', fecha_inicio: inicio,
  completadas: new Set<string>(), ultimoIngreso: '2026-12-10',
};
fijarPausas([]);
const antes = filaDe(cliente, '2026-12-14');
fijarPausas([finDeAnio]);
const durante = filaDe(cliente, '2026-12-28');
ok(antes.color !== 'verde', `la víspera está en ${antes.color}: el atraso se ve`);
ok(durante.color === 'verde', 'con el Camino parado nadie aparece en rojo ni en amarillo');
ok(durante.jornadaAtrasada === null, 'ninguna jornada figura como atrasada');
ok(/pausa/i.test(durante.porque) && /19 de enero/.test(durante.porque),
   `y la fila dice por qué: "${durante.porque}"`);

// La luz del pago no se apaga: esa no depende de la pausa.
const conCuotaImpaga = {
  ...cliente,
  acceso_tipo: 'cuotas' as const,
  acceso_cuotas: [{ vence: '2026-12-01', pagada: false }],
};
ok(filaDe(conCuotaImpaga, '2026-12-28').color === 'rojo',
   'la cuota impaga sigue en rojo aunque el Camino esté parado');

console.log('\n── nadie pierde días de acceso ──');
fijarPausas([]);
const cierraSinPausa = estadoDeAcceso({ tipo: 'noventa', inicio }, '2026-12-14');
fijarPausas([finDeAnio]);
const cierraConPausa = estadoDeAcceso({ tipo: 'noventa', inicio }, '2026-12-16');
ok(cierraSinPausa.abierto && cierraConPausa.abierto
   && cierraConPausa.cierraEl > cierraSinPausa.cierraEl,
   `su Camino cerraba el ${cierraSinPausa.abierto ? cierraSinPausa.cierraEl : '?'} y ahora cierra el ${cierraConPausa.abierto ? cierraConPausa.cierraEl : '?'}`);
ok(cierreCorrido('2027-01-02', [finDeAnio], '2026-12-20') === '2027-02-06',
   'la fecha de cierre se corre los 35 días, completos, desde el primer día de la pausa');
fijarPausas([]);

console.log('\n── varias pausas se suman ──');
const invierno: PausaGlobal = { desde: '2027-07-12', hasta: '2027-07-18' };
ok(diasDeCorrimiento([finDeAnio, invierno], '2027-08-01') === 42,
   'dos pausas corren 35 + 7 = 42 días');
ok(pausaVigente([finDeAnio, invierno], '2027-07-14')?.desde === '2027-07-12',
   'sabe cuál de las dos está corriendo');
ok(pausaQueViene([finDeAnio, invierno], '2027-03-01')?.desde === '2027-07-12',
   'y cuál es la próxima');

console.log('\n── lo que se lee en pantalla ──');
ok(enPalabras('2027-01-19') === '19 de enero', `escribe la fecha como se dice: ${enPalabras('2027-01-19')}`);
const cartel = cartelDeLaPausa(finDeAnio, '2027-01-02');
ok(cartel.titulo === 'El Camino retoma el 19 de enero.', `título: "${cartel.titulo}"`);
ok(cartel.cierre === 'Tu Camino ahora cierra el 6 de febrero.', `cierre: "${cartel.cierre}"`);
ok(!/gente/.test(cartel.cuerpo + cartel.titulo), 'nunca dice "gente"');
ok(/queda donde lo dejaste/.test(cartel.cuerpo), 'le dice que no pierde nada');
ok(/nadie te va a marcar atrasado/.test(cartel.cuerpo), 'y que puede avanzar si tiene ganas');

const aviso = loQueVaAPasar('2026-12-15', '2027-01-15', 12);
ok(/12 clientes/.test(aviso), 'antes de confirmar dice a cuántos alcanza');
ok(/19 de enero/.test(aviso) && /35 días/.test(aviso), 'y con qué fecha vuelven');
ok(/de 32 a 35 días/.test(aviso), 'avisa el redondeo a semanas enteras y por qué');
ok(/parado desde el 15 de diciembre/.test(resumenParaElEquipo(finDeAnio)), 'el resumen del equipo es claro');

console.log('\n── dónde vive ──');
const lib = readFileSync('src/lib/pausaGlobal.ts', 'utf8');
const datos = readFileSync('src/lib/pausasDatos.ts', 'utf8');
const dia = readFileSync('src/lib/diaPrograma.ts', 'utf8');
const admin = readFileSync('src/pages/Admin.tsx', 'utf8');
const panel = readFileSync('src/components/admin/PausaGlobalPanel.tsx', 'utf8');
const cartelUI = readFileSync('src/components/CaminoEnPausa.tsx', 'utf8');
const app = readFileSync('src/App.tsx', 'utf8');

ok(!/from '\.\/supabase'/.test(lib), 'la regla no toca la base: se puede probar sola');
ok(/from '\.\/supabase'/.test(datos), 'y el que lee la base está aparte');
ok(/corrimientoActual/.test(dia), 'el día del programa descuenta las pausas');
ok(/cargarPausas/.test(app), 'la app carga las pausas al abrir');
ok(/PausaGlobalPanel/.test(admin), 'el interruptor está en el Admin');
ok(/ponerPausa/.test(panel) && /levantarPausa/.test(panel), 'desde ahí se pone y se levanta');
ok(/loQueVaAPasar/.test(panel), 'y muestra qué va a pasar antes de confirmar');
ok(!/text-xs|text-sm|text-\[1[0-5]px\]/.test(panel), 'sin letra chica en el interruptor');
ok(!/text-xs|text-sm|text-\[1[0-5]px\]/.test(cartelUI), 'sin letra chica en el cartel del cliente');
ok(!/\bgente\b/.test(panel + cartelUI + lib), 'nunca dice "gente" en ninguna pantalla');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE' : `\n✗ ${fallas} FALLAS`);
process.exit(fallas === 0 ? 0 : 1);
