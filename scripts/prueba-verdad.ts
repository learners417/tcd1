/**
 * LOS CINCO ERRORES QUE LE MENTÍAN AL CLIENTE.
 *
 * Ninguno rompía nada: la batería los daba verdes y por eso nadie los veía.
 * Se encontraron corriendo el viaje real de un sanador contra su objetivo —
 * diez ventas de $1.000 en 90 días — semana por semana.
 *
 * Estas pruebas existen para que no vuelvan.
 *
 * Correr con: npx tsx scripts/prueba-verdad.ts
 */
import {
  proyectar, calcularCadena, encontrarDomino, SEMANA_VACIA,
  type NumerosSemana,
} from '../src/lib/valueChain';
import { decidirCampana } from '../src/lib/decidirCampana';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const PRECIO = 1000;
const semana = (x: Partial<NumerosSemana> = {}): NumerosSemana =>
  ({ ...SEMANA_VACIA, precio: PRECIO, ...x });

// ── 1 · El presupuesto ─────────────────────────────────────────────────────
console.log('══ 1 · el presupuesto no puede ser de juguete ══');

const p = proyectar(10 / 13, semana());
linea(p.conversacionesNecesarias >= 10 && p.conversacionesNecesarias <= 20,
  `para 10 ventas en 90 días pide ${p.conversacionesNecesarias} conversaciones por semana`);
linea(p.inversionNecesaria >= 100,
  `la inversión semanal es $${p.inversionNecesaria}, no una cifra de juguete`);

// El CAC resultante tiene que caer en la banda sana, 10-30% del precio.
const cacProyectado = (p.inversionNecesaria * 13) / 10;
linea(cacProyectado >= PRECIO * 0.10 && cacProyectado <= PRECIO * 0.35,
  `el costo de adquirir un cliente queda en $${cacProyectado.toFixed(0)} (${((cacProyectado / PRECIO) * 100).toFixed(0)}% del precio)`);

linea((p.inversionTope ?? 0) > p.inversionNecesaria,
  `y le dice hasta dónde puede llegar: $${p.inversionTope}`);

// El colchón va a la ACTIVIDAD, no al presupuesto: no se cuenta dos veces.
linea(p.inversionNecesaria < p.conversacionesNecesarias * (PRECIO * 0.30) / 10,
  'el colchón del 30% no se aplica también al presupuesto');

// A precio más alto, presupuesto más alto: la derivación es del precio.
const caro = proyectar(10 / 13, semana({ precio: 5000 }));
linea(caro.inversionNecesaria > p.inversionNecesaria * 3,
  'un programa de $5.000 pide bastante más presupuesto que uno de $1.000');

// ── 2 · El dominó no señala lo inaccionable ────────────────────────────────
console.log('\n══ 2 · el dominó tiene que apuntar a algo que se pueda tocar ══');

const VIAJE: Array<[string, Partial<NumerosSemana>, string[]]> = [
  ['semana 1 · recién encendió',
   { gasto: 154, piezasPublicadas: 7, comentarios: 12, conversaciones: 9, agendas: 3, llamadasTomadas: 2 },
   ['close_rate', 'offer_rate', 'referidos', 'retencion', 'casos_exito']],
  ['semana 3 · primera venta',
   { gasto: 154, piezasPublicadas: 7, comentarios: 18, conversaciones: 13, agendas: 5,
     llamadasTomadas: 4, ofertasPresentadas: 4, ventas: 1, facturado: 1000, cobrado: 1000, clientesActivos: 1 },
   ['referidos', 'retencion', 'casos_exito']],
  ['semana 8 · en ritmo, nadie terminó',
   { gasto: 154, piezasPublicadas: 7, comentarios: 22, conversaciones: 15, agendas: 5,
     llamadasTomadas: 4, ofertasPresentadas: 4, ventas: 1, facturado: 1000, cobrado: 700,
     clientesActivos: 6, clientesQueTerminan: 0 },
   ['referidos', 'retencion', 'casos_exito']],
];

for (const [nombre, n, prohibidos] of VIAJE) {
  const cadena = calcularCadena(semana(n));
  const d = encontrarDomino(cadena);
  const id = d.indicador?.id ?? '';
  linea(!prohibidos.includes(id),
    `${nombre} → dominó: ${d.titulo}${prohibidos.includes(id) ? ' ← INACCIONABLE' : ''}`);
}

// Una semana que CUMPLE el objetivo no puede tener rojos.
const cumple = calcularCadena(semana({
  gasto: 154, piezasPublicadas: 7, mensajesEnviados: 20, comentarios: 20,
  conversaciones: 14, agendas: 5, llamadasTomadas: 4, ofertasPresentadas: 4,
  ventas: 1, facturado: 1000, cobrado: 1000,
  clientesActivos: 5, clientesQueTerminan: 1, casosDeExito: 1,
}));
const rojos = cumple.filter((i) => i.estado === 'roto');
linea(rojos.length === 0,
  `una semana que cumple el objetivo no tiene rojos${rojos.length ? `: ${rojos.map((r) => r.id).join(', ')}` : ''}`);

// Las tasas con poca base quedan sin datos, no en rojo.
const pocaBase = calcularCadena(semana({ conversaciones: 2, agendas: 1, llamadasTomadas: 1 }));
const cierre = pocaBase.find((i) => i.id === 'close_rate')!;
linea(cierre.estado === 'sin_datos',
  'una tasa de cierre sobre una llamada queda sin datos, no en rojo');
linea(cierre.muestra !== undefined && !cierre.muestra.suficiente,
  'y dice cuántos datos le faltan');

const retencion = pocaBase.find((i) => i.id === 'retencion')!;
linea(retencion.estado === 'sin_datos',
  'la retención no opina hasta que alguien haya terminado');

// ── 3 · El refresco cuenta las semanas del ganador ─────────────────────────
console.log('\n══ 3 · no se refresca un ganador el día que aparece ══');

const anuncio = (x: Record<string, number> = {}) => ({
  nombre: 'A', gasto: 50, visitas: 1500, conversaciones: 6, agendas: 2,
  llamadas: 0, ventas: 0, ...x,
});
const reciente = decidirCampana({
  objetivo: 'mensajes', precio: PRECIO, diasEncendida: 16,
  anuncios: [anuncio({ conversaciones: 12, agendas: 5, ventas: 1 }), anuncio(), anuncio()],
  semanasDelGanador: 0,
} as never);
linea(!reciente.accionPrincipal.toLowerCase().includes('refresca'),
  'con el ganador recién declarado, la acción NO es refrescarlo');

const viejo = decidirCampana({
  objetivo: 'mensajes', precio: PRECIO, diasEncendida: 30,
  anuncios: [anuncio({ conversaciones: 12, agendas: 5, ventas: 1 }), anuncio(), anuncio()],
  semanasDelGanador: 3,
} as never);
linea(viejo.accionPrincipal.toLowerCase().includes('refresca'),
  'con tres semanas ganando, sí toca refrescarlo');

// ── 4 · El empate no corona a nadie ────────────────────────────────────────
console.log('\n══ 4 · con tres iguales no hay ganador ══');

const empate = decidirCampana({
  objetivo: 'mensajes', precio: PRECIO, diasEncendida: 16,
  anuncios: [anuncio(), anuncio(), anuncio()], semanasDelGanador: 2,
} as never);
linea(empate.ganador === null, 'tres anuncios idénticos no producen un ganador');
linea(!empate.decisiones.some((d) => d.estado === 'ganador'),
  'y ninguno queda marcado como tal');
linea(empate.accionPrincipal.toLowerCase().includes('suficientes')
   || empate.accionPrincipal.toLowerCase().includes('todavía'),
  `lo dice en vez de inventar: "${empate.accionPrincipal.slice(0, 60)}"`);

const claro = decidirCampana({
  objetivo: 'mensajes', precio: PRECIO, diasEncendida: 16,
  anuncios: [
    anuncio({ conversaciones: 20, agendas: 9, ventas: 2 }),
    anuncio({ conversaciones: 3, agendas: 1 }),
    anuncio({ conversaciones: 2, agendas: 0 })],
  semanasDelGanador: 1,
} as never);
linea(claro.ganador !== null,
  'pero cuando uno se despega de verdad, sí lo declara');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
