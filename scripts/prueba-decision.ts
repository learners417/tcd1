/**
 * Pruebas del motor de decisión.
 *
 * Es el turno donde la app decide EN LUGAR del sanador, así que cada regla
 * tiene que dar siempre lo mismo y por el motivo correcto. Un criterio que se
 * mueve es peor que ninguno: el sanador deja de creerle y decide él, que es
 * justo lo que no sabe hacer.
 *
 * Correr con: npx tsx scripts/prueba-decision.ts
 */
import { decidirCampana, DIAS_PARA_MUERTO, semanasHastaRefresco, type EstadoCampana } from '../src/lib/decidirCampana';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const anuncio = (n: string, x: Partial<{ gasto: number; visitas: number; conversaciones: number; agendas: number; ventas: number }> = {}) => ({
  nombre: n, gasto: 0, visitas: 0, conversaciones: 0, agendas: 0, ventas: 0, ...x,
});

const base = (x: Partial<EstadoCampana> = {}): EstadoCampana => ({
  objetivo: 'mensajes', precio: 1000, diasEncendida: 5,
  anuncios: [anuncio('A'), anuncio('B'), anuncio('C')],
  ...x,
});

// ── 1 · El creativo muerto ─────────────────────────────────────────────────
console.log('══ el creativo muerto ══');

const muerto = decidirCampana(base({
  diasEncendida: 3,
  anuncios: [
    anuncio('A', { gasto: 30, visitas: 900, conversaciones: 0 }),
    anuncio('B', { gasto: 30, visitas: 800, conversaciones: 12, agendas: 4 }),
    anuncio('C', { gasto: 30, visitas: 700, conversaciones: 9, agendas: 2 }),
  ],
}));
linea(muerto.decisiones[0].estado === 'muerto',
  `a los ${DIAS_PARA_MUERTO} días sin una conversación, el anuncio se declara muerto`);
linea(muerto.decisiones[1].estado === 'midiendo',
  'los otros siguen en medición, no se opina de ellos');
linea(muerto.accionPrincipal.includes('Apaga'),
  `la acción del día es apagarlo: "${muerto.accionPrincipal.slice(0, 48)}…"`);

const dosDias = decidirCampana(base({
  diasEncendida: 2,
  anuncios: [anuncio('A', { gasto: 20, conversaciones: 0 }), anuncio('B'), anuncio('C')],
}));
linea(dosDias.decisiones[0].estado !== 'muerto',
  'a los 2 días todavía NO se declara muerto: es ruido, no señal');

// ── 2 · No se opina, se mide ───────────────────────────────────────────────
console.log('\n══ el período de medición ══');

const midiendo = decidirCampana(base({
  diasEncendida: 6,
  anuncios: [
    anuncio('A', { gasto: 60, conversaciones: 20, agendas: 6, ventas: 1 }),
    anuncio('B', { gasto: 60, conversaciones: 8, agendas: 1 }),
    anuncio('C', { gasto: 60, conversaciones: 15, agendas: 4 }),
  ],
}));
linea(midiendo.fase === 'midiendo', 'con pocos días la campaña está en medición');
linea(midiendo.ganador === null, 'y NO se declara ganador todavía');
linea(midiendo.decisiones.every((d) => d.estado === 'midiendo'),
  'ninguno se apaga por ir peor: la variación diaria con presupuesto chico es enorme');
linea(midiendo.accionPrincipal.includes('No se opina'),
  'la acción del día lo dice con todas las letras');
linea(midiendo.diasParaDecidir > 0, `faltan ${midiendo.diasParaDecidir} días para decidir`);

// ── 3 · El ganador ─────────────────────────────────────────────────────────
console.log('\n══ el ganador ══');

const decidido = decidirCampana(base({
  diasEncendida: 15,
  anuncios: [
    anuncio('A', { gasto: 150, conversaciones: 60, agendas: 20, ventas: 1 }),
    anuncio('B', { gasto: 150, conversaciones: 55, agendas: 18, ventas: 3 }),
    anuncio('C', { gasto: 150, conversaciones: 70, agendas: 22, ventas: 2 }),
  ],
}));
linea(decidido.ganador === 1,
  `gana B, que vendió 3 a $50 cada una (ganador = ${decidido.ganador})`);
linea(decidido.decisiones[1].estado === 'ganador', 'y queda marcado como ganador');
linea(decidido.decisiones[1].queHacer.includes('parecidas'),
  'la acción es generar dos piezas parecidas, no festejar');
linea(decidido.fase === 'corriendo', 'la campaña pasa a fase de corriendo');

const sinVentas = decidirCampana(base({
  diasEncendida: 15,
  anuncios: [
    anuncio('A', { gasto: 150, conversaciones: 40, agendas: 4 }),
    anuncio('B', { gasto: 150, conversaciones: 40, agendas: 15 }),
    anuncio('C', { gasto: 150, conversaciones: 40, agendas: 8 }),
  ],
}));
linea(sinVentas.ganador === 1,
  'si nadie vendió, gana el de menor costo por agenda: es lo más cerca de una venta que hay');

// ── 4 · Un anuncio barato que no vende no es barato ────────────────────────
console.log('\n══ barato pero inútil ══');

const baratoInutil = decidirCampana(base({
  diasEncendida: 15,
  precio: 1000,
  anuncios: [
    anuncio('A', { gasto: 100, conversaciones: 200, agendas: 0 }),
    anuncio('B', { gasto: 200, conversaciones: 40, agendas: 12, ventas: 2 }),
    anuncio('C', { gasto: 100, conversaciones: 30, agendas: 3 }),
  ],
}));
linea(baratoInutil.ganador === 1,
  'gana el que vende, no el que trae conversaciones baratas sin agendar');

// ── 5 · Cada venta demasiado cara ──────────────────────────────────────────
const caro = decidirCampana(base({
  diasEncendida: 15, precio: 1000,
  anuncios: [
    anuncio('A', { gasto: 400, conversaciones: 30, agendas: 5, ventas: 1 }),
    anuncio('B', { gasto: 150, conversaciones: 40, agendas: 12, ventas: 2 }),
    anuncio('C', { gasto: 100, conversaciones: 25, agendas: 6, ventas: 1 }),
  ],
}));
linea(caro.decisiones[0].estado === 'muerto',
  'una venta a $400 sobre un precio de $1000 (40%) se apaga: no hay margen para escalar');
linea(caro.decisiones[0].porQue.includes('30%'), 'y el motivo nombra el umbral');

// ── 6 · El refresco ────────────────────────────────────────────────────────
console.log('\n══ el refresco del ganador ══');

const fresco = decidirCampana(base({
  diasEncendida: 15, semanasDelGanador: 1,
  anuncios: [
    anuncio('A', { gasto: 150, conversaciones: 50, agendas: 15, ventas: 3 }),
    anuncio('B', { gasto: 150, conversaciones: 40, agendas: 10, ventas: 1 }),
    anuncio('C', { gasto: 150, conversaciones: 30, agendas: 6 }),
  ],
}));
linea(!fresco.tocaRefrescar, 'con 1 semana corriendo todavía no toca refrescar');

const gastado = decidirCampana(base({
  diasEncendida: 30, semanasDelGanador: 3,
  anuncios: [
    anuncio('A', { gasto: 300, conversaciones: 90, agendas: 30, ventas: 6 }),
    anuncio('B', { gasto: 300, conversaciones: 70, agendas: 20, ventas: 2 }),
    anuncio('C', { gasto: 300, conversaciones: 60, agendas: 15, ventas: 1 }),
  ],
}));
linea(gastado.tocaRefrescar, 'con 3 semanas sí toca');
linea(gastado.accionPrincipal.includes('Refresca'),
  'y es LA acción del día, por encima de todo lo demás');
linea(semanasHastaRefresco(1) === 3 && semanasHastaRefresco(5) === 0,
  'la cuenta regresiva del refresco funciona');

// ── 7 · Cuando todo falla ──────────────────────────────────────────────────
console.log('\n══ cuando fallan los tres ══');

const todosMuertos = decidirCampana(base({
  diasEncendida: 7,
  anuncios: [
    anuncio('A', { gasto: 70, conversaciones: 0 }),
    anuncio('B', { gasto: 70, conversaciones: 0 }),
    anuncio('C', { gasto: 70, conversaciones: 0 }),
  ],
}));
linea(todosMuertos.decisiones.every((d) => d.estado === 'muerto'), 'los tres muertos');
linea(todosMuertos.accionPrincipal.includes('oferta'),
  'la acción NO es hacer más anuncios: es revisar la oferta y a quién le habla');

// ── 8 · Determinismo y bordes ──────────────────────────────────────────────
console.log('\n══ determinismo y bordes ══');

const e = base({ diasEncendida: 15, anuncios: [
  anuncio('A', { gasto: 150, conversaciones: 50, agendas: 15, ventas: 3 }),
  anuncio('B', { gasto: 150, conversaciones: 40, agendas: 10, ventas: 1 }),
  anuncio('C', { gasto: 150, conversaciones: 30, agendas: 6 }),
] });
linea(decidirCampana(e).ganador === decidirCampana(e).ganador
   && decidirCampana(e).accionPrincipal === decidirCampana(e).accionPrincipal,
  'las mismas cifras dan siempre la misma decisión');

const vacia = decidirCampana(base({ diasEncendida: 0, anuncios: [] }));
linea(vacia.decisiones.length === 0 && !!vacia.accionPrincipal,
  'una campaña sin anuncios no se rompe y sigue diciendo qué hacer');

const reciente = decidirCampana(base({ diasEncendida: 1 }));
linea(reciente.decisiones.every((d) => d.estado === 'sin_datos'),
  'el primer día, sin gasto ni datos, no se declara nada');
linea(reciente.decisiones[0].queHacer.includes('activo'),
  'y sugiere lo único útil: verificar que esté activo');


// ── Escenarios que faltaban ───────────────────────────────────────────────
console.log('\n══ el ganador tiene que VENDER, no solo conversar ══');

const conversaMuchoNoVende = decidirCampana(base({
  diasEncendida: 20,
  anuncios: [
    anuncio('A', { gasto: 250, visitas: 900, conversaciones: 40, agendas: 12, ventas: 0 }),
    anuncio('B'), anuncio('C'),
  ],
}));
linea(conversaMuchoNoVende.decisiones[0].estado === 'ganador',
  'sin ventas todavía, gana el de menor costo por agenda: es lo más cerca de una venta que hay');
linea(conversaMuchoNoVende.decisiones[0].costoPorVenta === null,
  'y se ve que gana SIN costo por venta, no porque haya vendido');
linea(conversaMuchoNoVende.decisiones[0].porQue.includes('agenda'),
  'el motivo lo dice: la decisión se tomó por agendas, no por ventas');

const caroPeroVende = decidirCampana(base({
  diasEncendida: 20,
  anuncios: [
    anuncio('A', { gasto: 250, visitas: 900, conversaciones: 12, agendas: 5, ventas: 1 }),
    anuncio('B'), anuncio('C'),
  ],
}));
linea(caroPeroVende.decisiones[0].estado === 'ganador',
  'con la conversación cara pero una venta dentro del tope, sí es ganador');
linea(caroPeroVende.decisiones[0].costoPorVenta !== null,
  'y el costo por venta queda a la vista');

console.log('\n══ un muerto no arrastra a los demás ══');
const unoMuerto = decidirCampana(base({
  diasEncendida: DIAS_PARA_MUERTO,
  anuncios: [
    anuncio('A', { gasto: 40, visitas: 2000, conversaciones: 0 }),
    anuncio('B', { gasto: 40, visitas: 1800, conversaciones: 15, agendas: 5 }),
    anuncio('C', { gasto: 40, visitas: 1700, conversaciones: 12, agendas: 4 }),
  ],
}));
linea(unoMuerto.decisiones[0].estado === 'muerto', 'el que no abrió conversaciones se apaga');
linea(unoMuerto.decisiones[1].estado === 'midiendo' && unoMuerto.decisiones[2].estado === 'midiendo',
  'los otros dos siguen midiendo: el muerto no los arrastra');

console.log('\n══ el período de medición se acorta con el gasto ══');
const gastoChico = decidirCampana(base({
  diasEncendida: 8,
  anuncios: [anuncio('A', { gasto: 30, visitas: 900, conversaciones: 10, agendas: 3, ventas: 1 }),
             anuncio('B'), anuncio('C')],
}));
const gastoGrande = decidirCampana(base({
  diasEncendida: 8,
  anuncios: [anuncio('A', { gasto: 500, visitas: 9000, conversaciones: 60, agendas: 20, ventas: 4 }),
             anuncio('B'), anuncio('C')],
}));
linea(gastoChico.fase === 'midiendo',
  'con $30 en 8 días todavía no hay señal: sigue midiendo');
linea(gastoGrande.fase !== 'midiendo',
  'con $500 en 8 días la señal ya llegó y se puede decidir');

console.log('\n══ bordes ══');
linea(!!decidirCampana(base({ precio: 0, diasEncendida: 20 })).accionPrincipal,
  'sin precio cargado no se rompe y da igual una acción');
linea(decidirCampana(base({ diasEncendida: 0 })).fase === 'midiendo',
  'el día 0 está en medición');
linea(decidirCampana(base({ diasEncendida: 20 })).decisiones.every((d) => d.estado === 'sin_datos'),
  'sin datos no inventa veredictos');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
