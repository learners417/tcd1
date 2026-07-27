/**
 * Pruebas del libro y del puente con los pacientes.
 *
 * Correr con: npx tsx scripts/prueba-libro.ts
 */
import {
  CAPITULOS, capitulosPara, resumenLibro,
  estadoDePacientes, resumirPacientes, SEMANAS_ANTES_DEL_FINAL,
  type PacienteDelSanador,
} from '../src/lib/libroYPacientes';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

console.log('══ el libro ══');
linea(CAPITULOS.length >= 10, `${CAPITULOS.length} capítulos`);
linea(CAPITULOS.every((c) => c.sobre.length > 30),
  'cada uno dice de qué trata, para saber si sirve ahora');
linea(CAPITULOS.every((c) => c.minutos > 0), 'y cuánto tarda en leerse');
linea(CAPITULOS.every((c, i) => i === 0 || c.pilar >= CAPITULOS[i - 1].pilar),
  'los pilares no retroceden: el orden del libro sigue al del Camino');

const enCero = capitulosPara(0);
linea(enCero.filter((c) => c.abierto).length >= 1,
  'quien recién empieza ya tiene algo para leer');
linea(enCero.filter((c) => !c.abierto).every((c) => (c.motivo ?? '').includes('pilar')),
  'los cerrados dicen en qué pilar se abren');
linea((enCero.find((c) => !c.abierto)?.motivo ?? '').includes('teoría'),
  'y por qué conviene esperar: leerlo antes es teoría, leerlo ahí es la explicación de lo que le pasa');

const enTres = capitulosPara(3);
linea(enTres.filter((c) => c.abierto).length > enCero.filter((c) => c.abierto).length,
  'a medida que avanza se le abren más');
linea(capitulosPara(9).every((c) => c.abierto),
  'al final del Camino tiene el libro completo');

linea(resumenLibro(0).includes('de'), `en el pilar 0: "${resumenLibro(0)}"`);
linea(resumenLibro(9).includes('completo'), 'y al final dice que está completo');

console.log('\n══ los pacientes del sanador ══');
const hace = (semanas: number) =>
  new Date(Date.now() - semanas * 7 * 86400000).toISOString().slice(0, 10);

const pacientes: PacienteDelSanador[] = [
  { id: 'a', nombre: 'Recién empieza', desde: hace(0), semanasTotal: 12 },
  { id: 'b', nombre: 'En curso', desde: hace(5), semanasTotal: 12 },
  { id: 'c', nombre: 'Por terminar', desde: hace(10), semanasTotal: 12 },
  { id: 'd', nombre: 'Terminado', desde: hace(15), semanasTotal: 12 },
];
const est = estadoDePacientes(pacientes);
const por = (id: string) => est.find((e) => e.id === id)!;

linea(por('a').momento === 'empezando', 'el de la semana 1 está empezando');
linea(por('a').queHacer.includes('dos primeras semanas'),
  'y le dice lo que importa: las dos primeras semanas deciden si termina');
linea(por('b').momento === 'en curso', 'el de la semana 6 va en curso');
linea(por('c').momento === 'por terminar',
  `al que le quedan ${SEMANAS_ANTES_DEL_FINAL} semanas o menos está por terminar`);
linea(por('c').queHacer.includes('después ya decidió'),
  'y la regla que importa: hablar de la renovación ANTES, porque después ya decidió');
linea(por('d').momento === 'terminado', 'el que pasó las 12 semanas terminó');
linea(por('d').queHacer.includes('testimonio'),
  'y lo que toca es pedirle el testimonio mientras el resultado está fresco');

linea(est[0].momento === 'por terminar',
  'el que está por terminar va PRIMERO: es lo único con fecha de vencimiento');

console.log('\n══ el titular ══');
linea(resumirPacientes([]).titular.includes('objetivo'),
  `sin pacientes: "${resumirPacientes([]).titular}"`);
linea(resumirPacientes(est).titular.includes('renovación'),
  'con uno por terminar, eso manda sobre todo lo demás');

const sinUrgencia = estadoDePacientes([
  { id: 'x', nombre: 'x', desde: hace(3), semanasTotal: 12 },
]);
linea(resumirPacientes(sinUrgencia).titular.includes('Te faltan'),
  `sin urgencias, cuenta cuánto falta: "${resumirPacientes(sinUrgencia).titular}"`);

const diez = estadoDePacientes(
  Array.from({ length: 10 }, (_, i) => ({
    id: String(i), nombre: `p${i}`, desde: hace(3), semanasTotal: 12,
  })));
linea(resumirPacientes(diez).titular.includes('Llegaste'),
  'y con los diez activos lo dice: llegaste');

console.log('\n══ bordes ══');
linea(estadoDePacientes([]).length === 0, 'sin pacientes no se rompe');
linea(estadoDePacientes([{ id: 'z', nombre: 'z', desde: 'fecha rota', semanasTotal: 12 }])[0]
  .semanaActual === 1,
  'una fecha rota no da una semana negativa');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
