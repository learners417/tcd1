/**
 * Pruebas de la carga compartida y el diagnóstico parcial.
 *
 * Lo que se juega: sin esto, cuando nadie carga, la cola muestra «todo bien»
 * en vez de «no sé nada». Y eso es peor que no mostrar nada.
 *
 * Correr con: npx tsx scripts/prueba-carga.ts
 */
import {
  hastaDondePuedoOpinar, completitud, firmaDe, aNumeros,
  SE_ESPERA_DE, NOMBRE_CAMPO,
  type CargaSemanal, type Campo, type ValorConFirma,
} from '../src/lib/cargaCompartida';
import { SEMANA_VACIA } from '../src/lib/valueChain';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const campo = (valor: number, quien = 'lupe', nombre = 'Lupe'): ValorConFirma => ({
  valor, porQuien: quien, nombre, cuando: new Date().toISOString(),
});

console.log('══ nunca se calla ══');
const vacia = hastaDondePuedoOpinar({});
linea(vacia.hasta === 0, 'sin nada cargado no puede opinar de nada');
linea(vacia.frase.length > 20 && vacia.frase.includes('faltan'),
  `pero LO DICE: "${vacia.frase.slice(0, 70)}…"`);
linea(vacia.faltan.length > 0, 'y nombra qué falta');
linea(vacia.aQuien !== 'nadie', 'y a quién pedírselo');

console.log('\n══ el diagnóstico parcial ══');
const soloPauta: CargaSemanal = {
  gasto: campo(140), impresiones: campo(20000),
  alcance: campo(9000), comentarios: campo(24),
};
const a = hastaDondePuedoOpinar(soloPauta);
linea(a.hasta === 1, 'con solo los datos de la pauta llega al primer tramo');
linea(a.puedoDecir[0].includes('para el scroll'),
  `y dice qué sabe: "${a.puedoDecir[0]}"`);
linea(a.faltan.includes('conversaciones'), 'lo que falta para seguir son las conversaciones');
linea(a.aQuien === 'cliente', 'y eso se le pide al cliente');
linea(a.frase.includes('Para seguir'), 'la frase junta las dos cosas');

const hastaAgendas: CargaSemanal = {
  ...soloPauta, conversaciones: campo(14), agendas: campo(5),
};
const b = hastaDondePuedoOpinar(hastaAgendas);
linea(b.hasta === 3, 'con conversaciones y agendas llega hasta el setting');
linea(b.faltan.includes('llamadasTomadas'), 'y ahora falta si se presentaron');

const todo: CargaSemanal = {
  ...hastaAgendas, llamadasTomadas: campo(4),
  ofertasPresentadas: campo(4), ventas: campo(1),
  facturado: campo(1000), cobrado: campo(1000),
};
const c = hastaDondePuedoOpinar(todo);
linea(c.faltan.length === 0 && c.aQuien === 'nadie', 'con todo cargado no falta nada');
linea(c.frase.includes('semana entera'), `y lo dice: "${c.frase}"`);

console.log('\n══ cero es un dato ══');
const conCeros: CargaSemanal = { ...soloPauta, conversaciones: campo(0), agendas: campo(0) };
const d = hastaDondePuedoOpinar(conCeros);
linea(d.hasta === 3,
  'cargar CERO conversaciones no es lo mismo que no cargarlas: se puede diagnosticar igual');
linea(!d.faltan.includes('conversaciones'), 'y no las vuelve a pedir');

console.log('\n══ quién carga qué ══');
linea(SE_ESPERA_DE.gasto === 'equipo' && SE_ESPERA_DE.impresiones === 'equipo',
  'los datos de la pauta se esperan del equipo: están en el administrador');
linea(SE_ESPERA_DE.conversaciones === 'cliente',
  'las conversaciones, del cliente: están en su DM y nadie más las ve');
linea(SE_ESPERA_DE.agendas === 'solo',
  'y las agendas entran solas por el webhook');
linea(Object.keys(NOMBRE_CAMPO).every((c) => NOMBRE_CAMPO[c as Campo].length > 5),
  'cada campo tiene un nombre para poder pedirlo en castellano');

console.log('\n══ la firma ══');
linea(firmaDe(undefined) === 'nadie lo cargó todavía',
  'un campo vacío lo dice, no queda en blanco');
linea(firmaDe(campo(100)).includes('Lupe') && firmaDe(campo(100)).includes('hoy'),
  `un campo cargado dice quién y cuándo: "${firmaDe(campo(100))}"`);
linea(firmaDe({ ...campo(3), porQuien: 'webhook' }) === 'entró solo',
  'y lo que entró por webhook lo aclara');
const ayer = { ...campo(50), cuando: new Date(Date.now() - 86400000).toISOString() };
linea(firmaDe(ayer).includes('ayer'), 'ayer se dice ayer');

console.log('\n══ hacia la cadena ══');
const n = aNumeros(todo, { ...SEMANA_VACIA, precio: 1000 });
linea(n.gasto === 140 && n.conversaciones === 14 && n.ventas === 1,
  'la carga con firmas se convierte en los números que la cadena entiende');
linea(aNumeros({}, { ...SEMANA_VACIA, precio: 1000 }).gasto === 0,
  'y una carga vacía da ceros, no undefined');

console.log('\n══ cuánto falta, de un vistazo ══');
const comp = completitud(soloPauta);
linea(comp.cargados === 4 && comp.total === 11, `${comp.cargados} de ${comp.total} cargados`);
linea(comp.faltanDelCliente.length > 0 && comp.faltanDelEquipo.length === 0,
  'y sabe que lo que falta es del cliente, no del equipo');
linea(completitud({}).pct === 0 && completitud(todo).pct === 100,
  'de 0% a 100% sin pasarse');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
