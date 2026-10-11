/**
 * LAS PUERTAS DE LA ACTIVACIÓN — para que puedan solos los 90 días.
 *
 * ═══ QUÉ CIERRA ═══
 *
 * Al terminar el Camino el cliente tiene el ADN completo y quedaba solo.
 * «Andá a Campañas» no es una instrucción: Campañas tiene seis pantallas y
 * ninguna decía qué va primero ni, sobre todo, QUÉ NO TOCAR TODAVÍA.
 *
 * Y había un choque entre la decisión comercial y el código: los ocho
 * candados eran obligatorios «sin excepciones», pero dos de ellos —la palabra
 * clave y el DM— son del motor de comentarios. Una campaña de clientes
 * potenciales va directo al VSL, sin palabra: con los ocho obligatorios, esa
 * campaña NUNCA podía encender. Le faltaban para siempre dos candados que
 * pedían configurar algo que no usa.
 *
 * Correr con: npx tsx scripts/prueba-puertas.ts
 */
import { readFileSync } from 'node:fs';
import {
  PUERTAS, TOTAL_PUERTAS, candadosQueAplican, cuantosFaltanParaEncender,
  puedeEncenderAsi, dondeEsta, queSePuedeHoy,
} from '../src/lib/activacion';
import { DIAS_SIN_TOCAR, type Montaje } from '../src/lib/montajeCampana';
import { DIAS_PARA_MUERTO } from '../src/lib/decidirCampana';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

/** Un montaje con todo cerrado. */
const completo: Montaje = {
  cliente_id: 'c1',
  palabra: 'QUIERO',
  url_pagina: 'https://ejemplo.com',
  pixel_id: '123456',
  url_perfil: 'https://instagram.com/x',
  dm_probado: true,
  trabajo_claro: true,
  presupuesto_diario: 10,
  dias_sostenidos: DIAS_SIN_TOCAR,
} as Montaje;

const vacio: Montaje = { cliente_id: 'c1' } as Montaje;

// ── 1 · El choque que impedía encender ─────────────────────────────────────
console.log('══ los candados dependen de a dónde manda la campaña ══');
const alVSL = candadosQueAplican('clientes_potenciales');
const porDM = candadosQueAplican('mensajes_retargeting');

ok(!alVSL.includes('palabra') && !alVSL.includes('dm'),
  'una campaña al VSL no pide palabra clave ni DM: no los usa');
ok(porDM.includes('palabra') && porDM.includes('dm'),
  'y la de mensajes sí, porque ahí vive su motor');
ok(alVSL.length === 6 && porDM.length === 8,
  `seis candados para el VSL y ocho para mensajes, no ocho «sin excepciones»`);
ok(alVSL.every((c) => porDM.includes(c)), 'los seis de base valen para las dos');

// ESTE era el bug: la campaña que Javo quiere correr nunca podía encender.
const sinPalabra: Montaje = { ...completo, palabra: undefined, dm_probado: false } as Montaje;
ok(puedeEncenderAsi(sinPalabra, 'clientes_potenciales', true),
  'una campaña al VSL con todo lo suyo listo PUEDE encender aunque no tenga palabra ni DM');
ok(!puedeEncenderAsi(sinPalabra, 'mensajes_retargeting', true),
  'y la de mensajes, en el mismo estado, no: ahí esos dos sí hacen falta');
ok(cuantosFaltanParaEncender(sinPalabra, 'mensajes_retargeting', true) === 2,
  'con el número exacto de lo que le falta');

console.log('\n══ lo que sigue siendo obligatorio para las dos ══');
ok(!puedeEncenderAsi({ ...completo, url_pagina: undefined } as Montaje, 'clientes_potenciales', true),
  'sin página no se enciende: el anuncio no tendría a dónde llevar');
ok(!puedeEncenderAsi({ ...completo, pixel_id: undefined } as Montaje, 'clientes_potenciales', true),
  'sin píxel tampoco: sería gastar sin medir');
ok(!puedeEncenderAsi(completo, 'clientes_potenciales', false),
  'y sin los tres anuncios no hay con qué comparar para elegir ganador');
ok(!puedeEncenderAsi({ ...completo, dias_sostenidos: 3 } as Montaje, 'clientes_potenciales', true),
  `ni con un presupuesto que no aguanta ${DIAS_SIN_TOCAR} días`);

// ── 2 · Las nueve puertas ──────────────────────────────────────────────────
console.log('\n══ las nueve puertas ══');
ok(TOTAL_PUERTAS === 9, `${TOTAL_PUERTAS} puertas: cuatro de montaje y cinco de la ventana`);
ok(PUERTAS.filter((p) => p.tipo === 'montaje').length === 4, 'las de montaje van seguidas');
ok(PUERTAS.filter((p) => p.tipo === 'ventana').length === 5, 'las de la ventana abren por fecha');
ok(PUERTAS.every((p) => p.queHacer.trim().length > 0), 'cada una dice qué hacer');
ok(PUERTAS.filter((p) => p.queNoTocar).length >= 4,
  'y las que importan dicen qué NO tocar: esa es la mitad que faltaba');

const porFecha = PUERTAS.filter((p) => p.tipo === 'ventana' && p.n !== 8);
ok(porFecha.map((p) => p.diaQueAbre).join(',') === '1,3,15,30',
  'las fechas son 48 horas, día 3, día 15 y día 30');

// ── 3 · A las 48 horas NO se optimiza ──────────────────────────────────────
console.log('\n══ a las 48 horas no se toca nada ══');
const dia1 = dondeEsta({ montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: 1 });
ok(dia1.puerta.n === 4, 'el primer día cae en la puerta de solo mirar');
ok(/solo mirar/i.test(dia1.puerta.titulo), `y se llama por lo que es: "${dia1.puerta.titulo}"`);
ok(/No cambies el presupuesto/.test(dia1.puerta.queNoTocar ?? ''),
  'con la prohibición explícita, que es lo que un cliente solo necesita');
ok(/reinicia el aprendizaje/.test(dia1.puerta.queNoTocar ?? ''),
  'y el por qué: sin la razón, la regla se rompe el primer día malo');
ok(!/optimiz/i.test(dia1.puerta.queHacer),
  'la palabra «optimizar» NO aparece: ofrecerla a las 48 h es enseñarle a hacer lo que el manual le prohíbe');

const dia2 = dondeEsta({ montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: 2 });
ok(dia2.puerta.n === 4, 'el segundo día, igual');
ok(dia2.diasParaLaProxima === 1, 'y falta un día para la próxima puerta');
ok(/Falta 1 día/.test(queSePuedeHoy(dia2)),
  `que se le dice: "${queSePuedeHoy(dia2)}"`);

console.log('\n══ día 3: solo lo muerto ══');
const dia3 = dondeEsta({ montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: 3 });
ok(dia3.puerta.n === 5, 'el día 3 abre la puerta de apagar lo muerto');
ok(dia3.puerta.diaQueAbre === DIAS_PARA_MUERTO,
  'la fecha es la misma que ya usa el motor de decisión: una sola regla, no dos');
ok(/no abrió ni una conversación/.test(dia3.puerta.queHacer), 'y dice qué cuenta como muerto');
ok(/El resto sigue como está/.test(dia3.puerta.queNoTocar ?? ''),
  'con el límite: un anuncio con pocas conversaciones todavía puede ganar');

console.log('\n══ día 15: la primera decisión real ══');
const dia14 = dondeEsta({ montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: 14 });
ok(dia14.puerta.n === 5, 'el día 14 TODAVÍA no decide: la puerta de elegir ganador no abrió');
const dia15 = dondeEsta({ montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: 15 });
ok(dia15.puerta.n === 6, 'y el 15 sí');
ok(/menor costo por venta/.test(dia15.puerta.queHacer), 'con el criterio escrito');
ok(/costo por agenda/.test(dia15.puerta.queHacer),
  'y qué hacer si todavía ninguno vendió, que es lo normal en la semana 3');

console.log('\n══ día 30: escalar, o volver al Camino ══');
const conVentas = dondeEsta({ montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: 30, ventas: 2 });
ok(conVentas.puerta.n === 7, 'quien vendió, escala');
ok(/solo el ganador/i.test(conVentas.puerta.queNoTocar ?? ''),
  'y se le dice que se escala solo el ganador');

const sinVentas = dondeEsta({ montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: 30, ventas: 0 });
ok(sinVentas.puerta.n === 8,
  'y quien NO vendió en 30 días va a otra puerta: el problema no es la campaña');
ok(/la oferta o el precio/.test(sinVentas.puerta.queHacer),
  'lo manda de vuelta al Camino en vez de a seguir gastando');
ok(/No subas el presupuesto/.test(sinVentas.puerta.queNoTocar ?? ''),
  'con la tentación nombrada: treinta días sin una venta ya dijeron lo que había que saber');

// ── 4 · Mientras monta: una cosa por vez ───────────────────────────────────
console.log('\n══ mientras monta, una cosa por vez ══');
const reciénEmpieza = dondeEsta({ montaje: null, objetivo: 'clientes_potenciales', anunciosListos: false, diasEncendida: null });
ok(reciénEmpieza.puerta.n === 0, 'sin nada cargado arranca por el perfil');
ok(reciénEmpieza.faltanCandados === 6, 'con los seis candados por delante');

const conPerfil = dondeEsta({
  montaje: { ...vacio, url_perfil: 'https://instagram.com/x' } as Montaje,
  objetivo: 'clientes_potenciales', anunciosListos: false, diasEncendida: null,
});
ok(conPerfil.puerta.n === 1, 'con el perfil hecho pasa a los anuncios');

const conAnuncios = dondeEsta({
  montaje: { ...vacio, url_perfil: 'https://instagram.com/x' } as Montaje,
  objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: null,
});
ok(conAnuncios.puerta.n === 2, 'y con los anuncios, al montaje en Meta');

const listoParaEncender = dondeEsta({
  montaje: completo, objetivo: 'clientes_potenciales', anunciosListos: true, diasEncendida: null,
});
ok(listoParaEncender.puerta.n === 3, 'con todo cerrado queda en la verificación final');
ok(listoParaEncender.faltanCandados === 0, 'sin nada pendiente');
ok(/no enciendas/.test(listoParaEncender.puerta.queNoTocar ?? ''),
  'y el aviso del presupuesto va justo acá, en el momento en que va a encender');

console.log('\n══ el montaje no espera fechas ══');
ok(PUERTAS.filter((p) => p.tipo === 'montaje').every((p) => p.diaQueAbre === null),
  'las cuatro primeras se hacen en un día: hacerlas esperar sería inventar una demora');

console.log('\n══ sin agujeros en los textos ══');
const todos = PUERTAS.map((p) => `${p.titulo} ${p.queHacer} ${p.queNoTocar ?? ''}`).join(' ');
ok(!/undefined|NaN|null/.test(todos), 'ninguna puerta con un hueco en su texto');
ok(!/\bgente\b/.test(todos), 'y ninguna dice «gente»');

// ── 5 · Dónde vive ────────────────────────────────────────────────────────
console.log('\n══ dónde vive ══');
const campanas = readFileSync('src/pages/Campanas.tsx', 'utf-8');
const pantalla = readFileSync('src/components/campanas/LaActivacion.tsx', 'utf-8');
const marcha = readFileSync('src/components/EnMarcha.tsx', 'utf-8');
const lib = readFileSync('src/lib/activacion.ts', 'utf-8');

ok(/useState<CampanasView>\('activacion'\)/.test(campanas),
  'se aterriza en la activación, no en el Constructor de anuncios: ese era el paso 1 de cuatro');
ok(/<LaActivacion/.test(campanas), 'la pantalla está montada');
ok(/queNoTocar/.test(pantalla),
  'y muestra el «no toques» junto a lo que sí se puede: el aviso sirve cuando la tentación aparece, no en un manual del día 1');
ok(/ir: 'campanas'/.test(marcha) && /Te toca activar/.test(marcha),
  'el tablero lo empuja a activar dos días antes del 31, cuando ya tiene todo escrito');

ok(!/from '\.\/supabase'/.test(lib), 'la lógica se prueba sola: no toca la base');
ok(/numerosDe\(userId\)/.test(campanas),
  'las ventas salen de los números que él mismo carga, no de si hay una campaña activa');
ok(/queda en null/.test(campanas),
  'y si esa consulta falla queda en null, así la puerta de pivotear no se dispara sin dato');
ok(!/text-xs|text-\[1[0-4]px\]/.test(pantalla), 'sin letra chica');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
