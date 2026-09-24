/**
 * prueba-acceso.ts — la ventana de acceso y el cierre de cuentas.
 */
import { readFileSync } from 'node:fs';
import { estadoDeAcceso, cierreDeLaVentana, reabrirConPago, sumarDias, accesoDelPerfil } from '../src/lib/ventanaDeAcceso';
import { cierreDeCuentas, veredictoDeGarantia, jornadasCerradas, DIAS_DE_TOLERANCIA } from '../src/lib/cierreDeCuentas';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const inicio = '2026-10-05';

console.log('\n── la ventana ──');
const treinta = { tipo: 'treinta' as const, inicio };
ok(cierreDeLaVentana(treinta) === '2026-11-03', 'treinta días cierran el día 30', cierreDeLaVentana(treinta));
const e1 = estadoDeAcceso(treinta, '2026-10-20');
ok(e1.abierto && e1.diasRestantes === 15, 'en el medio dice cuántos días le quedan');
const e2 = estadoDeAcceso(treinta, '2026-11-10');
ok(!e2.abierto && e2.motivo === 'venció su ventana', 'pasado el día 30, se cierra');

const noventa = { tipo: 'noventa' as const, inicio };
ok(estadoDeAcceso(noventa, '2026-11-10').abierto, 'con noventa días sigue abierto en noviembre');
ok(!estadoDeAcceso(noventa, '2027-01-20').abierto, 'y se cierra al terminar los noventa');

console.log('\n── las cuotas ──');
const cuotas = { tipo: 'cuotas' as const, inicio, cuotas: [
  { vence: '2026-10-05', pagada: true },
  { vence: '2026-11-05', pagada: false },
] };
ok(estadoDeAcceso(cuotas, '2026-11-01').abierto, 'antes del vencimiento sigue abierto');
const cerrado = estadoDeAcceso(cuotas, '2026-11-12');
ok(!cerrado.abierto && cerrado.motivo === 'esperando el pago de tu cuota', 'vencida sin pagar, se cierra');
const reabierto = reabrirConPago(cuotas, '2026-11-05', '2026-11-12');
ok(estadoDeAcceso(reabierto, '2026-11-12').abierto, 'entra el pago y vuelve a abrir');
ok(reabierto.diasDevueltos === 7, 'le devuelve los días que estuvo cerrado', String(reabierto.diasDevueltos));
ok(cierreDeLaVentana(reabierto) > cierreDeLaVentana(cuotas), 'y le corre la fecha de cierre');

console.log('\n── el cierre de cuentas ──');
const todas = jornadasCerradas(new Set(), inicio);
ok(todas.length === 50, `mide las ${todas.length} jornadas con trabajo`);
ok(todas.every((j) => j.dia >= 1), 'ninguna es un día de campo');

const completo = new Set(todas.filter((j) => j.pedia).map((j) => j.clave));
const cPerfecto = cierreDeCuentas(completo, inicio);
ok(cPerfecto.sinEvidencia.length === 0, 'quien entregó todo no tiene pendientes');
ok(cPerfecto.cumplioSuParte, 'y cumplió su parte');
ok(/seguimos sin costo/.test(veredictoDeGarantia(cPerfecto)), 'el veredicto dice que la garantía corre');

const cMedias = cierreDeCuentas(new Set([...completo].slice(0, 10)), inicio);
ok(cMedias.sinEvidencia.length > 0 && !cMedias.cumplioSuParte, 'a quien le faltan jornadas, la garantía no corre');
ok(/sin entregar/.test(veredictoDeGarantia(cMedias)), 'y el veredicto dice cuántas faltan');

const unaJornada = todas.find((j) => j.pedia)!;
const tarde = cierreDeCuentas(completo, inicio, { [unaJornada.clave]: '2026-12-25' });
ok(tarde.atrasoMayor > DIAS_DE_TOLERANCIA && !tarde.cumplioSuParte, `con más de ${DIAS_DE_TOLERANCIA} días de atraso, tampoco`);

console.log('\n── vive adentro de la app ──');
const app = readFileSync('src/App.tsx', 'utf8');
ok(/CierreDelCamino/.test(app) && /estadoDeAcceso/.test(app), 'la app muestra el cierre cuando la ventana se cierra');
const pantalla = readFileSync('src/components/CierreDelCamino.tsx', 'utf8');
ok(/Todo tu trabajo queda acá/.test(pantalla), 'y le dice que nada se borra');
ok(Boolean(accesoDelPerfil({ fecha_inicio: inicio })), 'el acceso sale del perfil');
ok(sumarDias(inicio, 6) === '2026-10-11', 'las fechas se calculan bien');

console.log(fallas === 0 ? '\n✓ TODO EN VERDE\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
