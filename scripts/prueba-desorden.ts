/**
 * EL CLIENTE EN DESORDEN. Nadie recorre el Camino en línea recta: entra a
 * Campañas antes de sellar el ADN, carga números antes de encender, abre el
 * tablero el día uno. Ninguna de esas puede dejarlo mirando algo roto.
 */
import { calcularCadena, encontrarDomino, proyectar, SEMANA_VACIA } from '../src/lib/valueChain';
import { decidirCampana } from '../src/lib/decidirCampana';
import { armarPaquete } from '../src/lib/paqueteCampana';
import { estadoDeLasPiezas, recomendarFormulas, armarCarrusel } from '../src/lib/formulasAnuncios';
import { armarCola, resumirCola } from '../src/lib/colaExcepciones';
import { estadoDePacientes, resumirPacientes } from '../src/lib/libroYPacientes';
import { avanceDe, cuadroDe } from '../src/lib/cuadroTickets';
import { veredictoMotor } from '../src/lib/salaDeMando';
import { leerBitacora, resumirBitacora } from '../src/lib/bitacoraCampana';

let f = 0;
const ok = (c: boolean, t: string) => { if (!c) f++; console.log(`${c ? '✓' : '✗'} ${t}`); };
const vivo = (n: string, fn: () => unknown): unknown => {
  try { return fn(); } catch (e) { f++; console.log(`✗ ${n} REVIENTA: ${(e as Error).message.slice(0,70)}`); return null; }
};

console.log('══ el cliente que entra a todo el día 1, sin nada cargado ══');
const cero = { ...SEMANA_VACIA };
ok(!!vivo('la cadena', () => calcularCadena(cero)), 'la cadena se calcula con todo en cero');
ok(!!vivo('el dominó', () => encontrarDomino(calcularCadena(cero))), 'el dominó no revienta');
ok(!!vivo('la proyección', () => proyectar(0, cero)), 'la proyección con objetivo cero');
ok(!!vivo('la campaña', () => decidirCampana({ objetivo: 'mensajes', precio: 0, diasEncendida: 0, anuncios: [], semanasDelGanador: 0 } as never)), 'decidir una campaña sin anuncios');
ok(!!vivo('el paquete', () => armarPaquete({ piezas: {}, elegidas: [], stories: '', brief: {}, notas: {} })), 'el paquete sin nada');
ok(!!vivo('las piezas', () => estadoDeLasPiezas({}, [])), 'el estado de piezas vacío');
ok(!!vivo('el carrusel', () => armarCarrusel('', '')), 'el carrusel de un guion vacío');
ok(!!vivo('la cola', () => armarCola([])), 'la cola sin cuentas');
ok(!!vivo('los pacientes', () => estadoDePacientes([])), 'los pacientes vacíos');
ok(!!vivo('la bitácora', () => resumirBitacora([])), 'la bitácora vacía');
ok(!!vivo('el motor', () => veredictoMotor({ cobrado: 0, objetivo: 0, conversaciones: 0, calificados: 0, agendas: 0, llamadasTomadas: 0, cerradas: 0, gastoPauta: 0, diasSinAgenda: 0 })), 'el motor con objetivo cero');
ok(!!vivo('el cuadro', () => avanceDe('mil', new Set())), 'el cuadro sin nada hecho');
ok(!!vivo('las fórmulas', () => recomendarFormulas({ tienePrueba: false, marcaPersonal: false, tieneFrases: false, metodoConNombre: false, tienePiedras: false })), 'las fórmulas sin ADN');

console.log('\n══ números imposibles que igual se pueden escribir ══');
const raro = { ...SEMANA_VACIA, precio: -1000, gasto: -50, conversaciones: -5, ventas: 999999, facturado: -1 };
const c = vivo('cadena rara', () => calcularCadena(raro)) as ReturnType<typeof calcularCadena> | null;
ok(!!c, 'la cadena con números negativos no revienta');
ok(!!c && c.every(i => i.valor === null || Number.isFinite(i.valor)), 'y ninguno da infinito ni NaN');
const d = vivo('dominó raro', () => encontrarDomino(c ?? [])) as { titulo?: string } | null;
ok(!!d?.titulo, 'el dominó sigue diciendo algo');

console.log('\n══ el orden al revés ══');
// Vendió antes de tener conversaciones (vino por recomendación)
const recomendado = { ...SEMANA_VACIA, precio: 1000, ventas: 2, facturado: 2000, cobrado: 2000, conversaciones: 0, gasto: 0 };
const cr = calcularCadena(recomendado);
ok(cr.every(i => i.valor === null || Number.isFinite(i.valor)), 'vender sin pauta ni conversaciones no rompe la cadena');
ok(!!encontrarDomino(cr).titulo, 'y el dominó dice algo sensato');

// Cargó la semana 5 sin haber cargado la 1
const salteado = leerBitacora([
  { semana: '2026-W35', indice: 0, formula: 'x', queSeProbo: '', gasto: 100, conversaciones: 10, agendas: 3, ventas: 1, estado: 'ganador', anotadaEn: '' },
]);
ok(salteado.length === 1 && salteado[0].tendencia === null, 'una semana suelta no inventa tendencia');

console.log('\n══ el paciente con datos raros ══');
const pac = vivo('pacientes raros', () => estadoDePacientes([
  { id: 'a', nombre: 'x', desde: '2020-01-01', semanasTotal: 12 },
  { id: 'b', nombre: 'y', desde: '2099-01-01', semanasTotal: 12 },
  { id: 'c', nombre: 'z', desde: '', semanasTotal: 0 },
])) as Array<{ semanaActual: number; faltan: number }> | null;
ok(!!pac && pac.every(p => p.semanaActual >= 1 && p.faltan >= 0), 'fechas viejas, futuras o vacías dan números sanos');

console.log(`\n${f === 0 ? '✓ TODO EN VERDE' : `✗ ${f} FALLAS`}`);
process.exit(f === 0 ? 0 : 1);
