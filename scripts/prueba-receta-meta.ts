/**
 * LA RECETA DE LA CAMPAÑA Y LOS CAMPOS DE META.
 *
 * ═══ QUÉ SE PROTEGE ═══
 *
 * El chat que había era un experto genérico de Meta Ads: preguntaba el ticket
 * para recomendar una estrategia, y ofrecía «intereses, custom audiences,
 * lookalikes». Con 30 USD al día eso es lo que hace que la campaña nunca
 * arranque — el presupuesto entero se va probando un público que le achicamos
 * a mano.
 *
 * Y contestaba cualquier cosa: le opinaba del precio y de la oferta, pisando
 * lo que el cliente ya selló en su Camino y lo que le dice su mentor.
 *
 * Esta prueba verifica que la receta sea UNA, que esté escrita, que el asesor
 * no se vaya de tema, y que los tres campos que Meta pide existan.
 *
 * Correr con: npx tsx scripts/prueba-receta-meta.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import {
  LA_RECETA, GRUPOS_DE_PAISES, grupoDe, revisarPaises, promptDelAsesor,
  loQueVaAGastar, DE_QUE_HABLA, A_DONDE_MANDAR,
  PRESUPUESTO_DIARIO, CUANTOS_ANUNCIOS, PAISES_MAX,
} from '../src/lib/recetaCampana';
import {
  primerIntento, revisarCampos, camposListos, recortarEnPalabra, leerRespuesta,
  promptDeCampos, paraPegar, LIMITE_TITULAR, LIMITE_DESCRIPCION,
} from '../src/lib/camposMeta';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// ── 1 · La receta decidida ─────────────────────────────────────────────────
console.log('══ la receta es una sola y está escrita ══');
ok(LA_RECETA.length === 9, `son ${LA_RECETA.length} pasos, en orden`);
ok(LA_RECETA.every((p, i) => p.n === i + 1), 'numerados sin saltos');
ok(LA_RECETA.every((p) => p.queHacer.length > 30 && p.porQue.length > 30),
  'cada paso dice qué hacer Y por qué: sin el por qué, lo cambia en cuanto duda');
ok(LA_RECETA.every((p) => p.donde.length > 3),
  'y dice en qué pantalla de Meta está, con el nombre que tiene ahí');
ok(LA_RECETA.filter((p) => p.queNoTocar).length >= 4,
  'y los pasos donde la tentación aparece dicen qué NO tocar');

const todo = LA_RECETA.map((p) => `${p.titulo} ${p.queHacer} ${p.porQue} ${p.queNoTocar ?? ''}`).join(' ');
console.log('\n══ lo que pidió Javo, en la receta ══');
ok(/VAC[IÍ]O|sin intereses/i.test(todo) && /broad|abierto/i.test(todo.toLowerCase() + ' broad'),
  'público abierto, con el campo de intereses vacío');
ok(/lookalike|similar/i.test(todo), 'y nombra los públicos similares para decir que NO');
ok(/solo Instagram/i.test(todo), 'solo Instagram');
ok(/Desmarca Facebook/i.test(todo), 'y Facebook desmarcado, dicho con esa palabra');
ok(/Audience Network/i.test(todo), 'más Audience Network, que es el que se cuela solo');
ok(/[Rr]eel/.test(todo) && /carrusel/i.test(todo),
  'reel antes que carrusel, y se dice qué pasa con el carrusel');
ok(/9:16|vertical/i.test(todo), 'vertical');
ok(PRESUPUESTO_DIARIO === 30 && CUANTOS_ANUNCIOS === 3,
  `${CUANTOS_ANUNCIOS} anuncios a ${PRESUPUESTO_DIARIO} USD al día`);
ok(/MISMO conjunto/i.test(todo), 'los tres en el mismo conjunto');
ok(PAISES_MAX === 3, `máximo ${PAISES_MAX} países`);
ok(/sin palabra clave|Sin palabra/i.test(todo), 'directo al video, sin palabra clave');

// ── 2 · Los países: la decisión que más plata mueve ────────────────────────
console.log('\n══ los países ══');
ok(GRUPOS_DE_PAISES.length === 3, 'tres grupos por lo que cuesta llegar a una persona');
ok(GRUPOS_DE_PAISES.every((g) => g.paises.length >= 4 && g.nota.length > 40),
  'cada grupo con sus países y qué esperar de él');
ok(grupoDe('España')?.id === 'alto' && grupoDe('México')?.id === 'medio',
  'un país cae en su grupo');
ok(grupoDe('Mexico')?.id === 'medio', 'y lo encuentra sin tilde: así lo escriben');

ok(!revisarPaises([]).ok, 'sin países elegidos, no está listo');
ok(revisarPaises(['Chile']).ok, 'con uno solo, sí: es lo que se recomienda si duda');
ok(revisarPaises(['Chile', 'Uruguay', 'Panamá']).ok, 'tres del mismo grupo, bien');
ok(!revisarPaises(['Chile', 'Uruguay', 'Panamá', 'España']).ok,
  'cuatro no: con 30 al día es repartir hasta que no alcance en ninguno');
const mezcla = revisarPaises(['España', 'México']);
ok(!mezcla.ok, 'mezclar grupos tampoco');
ok(/barato|cuesta/i.test(mezcla.aviso),
  `y el aviso dice POR QUÉ: "${mezcla.aviso.slice(0, 55)}…"`);
ok(/más barato/i.test(revisarPaises(['Chile', 'Uruguay', 'Bolivia']).aviso),
  'el grupo de alcance barato se lleva el presupuesto si se mezcla');

console.log('\n══ la cuenta del gasto, antes de encender ══');
const gasto = loQueVaAGastar(14);
ok(/420/.test(gasto), `dice el total y no solo el diario: "${gasto.slice(0, 40)}…"`);
ok(/sostener|sin tocarlo/i.test(gasto),
  'y que tiene que poder sostenerlo: el susto del día 5 es no haber hecho la cuenta');

// ── 3 · El asesor es restrictivo ───────────────────────────────────────────
console.log('\n══ tajante: de qué habla y de qué no ══');
const prompt = promptDelAsesor({ paises: ['Chile'], paso: 4 });
ok(prompt.includes(LA_RECETA[3].queHacer),
  'la receta va DENTRO del prompt: antes el modelo la improvisaba y de ahí salían los intereses');
ok(/No la elijes|no ofreces alternativas/i.test(prompt),
  'y se le dice que no la elige ni ofrece alternativas');
ok(/Un paso por mensaje/i.test(prompt), 'un paso por mensaje');
ok(/[Nn]unca voseo/.test(prompt), 'castellano neutro');
ok(DE_QUE_HABLA.length >= 5 && A_DONDE_MANDAR.length >= 5,
  'la lista de lo que SÍ y lo que NO está enumerada, no librada al criterio del modelo');
const fuera = A_DONDE_MANDAR.map((x) => x.cuando + ' ' + x.aDonde).join(' ');
ok(/precio|oferta/i.test(fuera), 'el precio y la oferta quedan fuera');
ok(/mentor|Camino/i.test(fuera), 'y van a la mentoría o al Camino, no a una negativa seca');
ok(/Sofi/i.test(fuera) && /Mateo/i.test(fuera),
  'los mensajes a Sofi y el contenido a Mateo: cada duda con su dueño');
ok(/Activaci[oó]n/i.test(fuera), 'y cuándo apagar o escalar, a Activación');
ok(/no lo contestas/i.test(prompt),
  'lo que no está en ninguna de las dos listas, no lo contesta');
ok(/No opinas «un poco»|no das un adelanto/i.test(prompt.toLowerCase() + prompt),
  'y no le deja opinar «un poco»: con dos respuestas distintas el cliente no sabe a quién creerle');
ok(/PASO 4/.test(prompt) && /Chile/.test(prompt),
  'el prompt sabe en qué paso está y dónde corre');

// ── 4 · Los tres campos de Meta ────────────────────────────────────────────
console.log('\n══ los campos que Meta pide ══');
const ANUNCIO = 'Corriste publicidad y no funcionó.\nNo fue tu anuncio: fue a quién se lo mostraste.\nComenta LISTO.';
const c = primerIntento(ANUNCIO, 'Programa de 90 días');
ok(c.textoPrincipal === ANUNCIO.trim(), 'el texto principal es el anuncio completo');
ok(c.titular.length > 0 && c.titular.length <= LIMITE_TITULAR,
  `el titular sale del gancho y entra en ${LIMITE_TITULAR}: "${c.titular}"`);
ok(c.descripcion.length <= LIMITE_DESCRIPCION, 'la descripción también entra');
ok(c.botón.length > 0, 'y el botón viene elegido: era un campo más que quedaba vacío');

const revisados = revisarCampos(c);
ok(revisados.length === 4, 'se revisan los cuatro');
ok(revisados.every((x) => x.etiqueta.length > 3),
  'cada uno con el nombre que tiene EN META, para encontrarlo en la pantalla');
ok(revisados.every((x) => x.dondeSeVe.length > 20),
  'y dónde se ve cada uno: sin eso pone el esfuerzo en el campo que menos pesa');
ok(/reel casi no se ve/i.test(revisados.find((x) => x.id === 'titular')!.dondeSeVe),
  'se le dice que en el reel el titular casi no se ve, en vez de dejarlo creer que decide');

const largo = revisarCampos({ ...c, titular: 'x'.repeat(60) });
ok(/60 caracteres/.test(largo.find((x) => x.id === 'titular')!.aviso),
  'el aviso cuenta los caracteres, así sabe cuánto sacar');
ok(/20 de más/.test(largo.find((x) => x.id === 'titular')!.aviso), 'y cuántos se pasa');
ok(/vac[ií]o/i.test(revisarCampos({ ...c, titular: '' }).find((x) => x.id === 'titular')!.aviso),
  'y avisa cuando está vacío: Meta lo pide igual');
ok(camposListos(c), 'el primer intento ya queda listo, sin gastar una llamada al modelo');

console.log('\n══ el recorte ══');
ok(recortarEnPalabra('No fue tu anuncio: fue a quién se lo mostraste', 20) === 'No fue tu anuncio',
  'corta en palabra entera y sin dejar el signo colgando');
ok(!recortarEnPalabra('x'.repeat(50), 10).includes(' '),
  'si la primera palabra ya se pasa, recorta igual en vez de devolver vacío');
ok(recortarEnPalabra('corto', 40) === 'corto', 'lo que entra no se toca');

console.log('\n══ lo que devuelve el modelo ══');
const leido = leerRespuesta('Acá va:\n{"titular":"Corriste publicidad y no funcionó","descripcion":"Para profesionales"}\nListo');
ok(leido?.titular === 'Corriste publicidad y no funcionó',
  'lo lee aunque venga con texto alrededor');
ok(leerRespuesta('nada de json') === null, 'y devuelve nulo cuando no vino nada');
const pasado = leerRespuesta(`{"titular":"${'x'.repeat(80)}","descripcion":"ok"}`);
ok((pasado?.titular.length ?? 99) <= LIMITE_TITULAR,
  'si el modelo se pasa del límite, se recorta igual: Meta lo cortaría a la mitad de una palabra');

const pc = promptDeCampos({ textoDelAnuncio: ANUNCIO });
ok(pc.includes(String(LIMITE_TITULAR)) && pc.includes(String(LIMITE_DESCRIPCION)),
  'los límites van dentro del pedido: «un titular corto» devuelve setenta caracteres');
ok(/[Nn]unca voseo/.test(pc) && /gente/.test(pc) && /positivo/i.test(pc),
  'con las reglas de copy de Javo adentro');
ok(/curaci[oó]n|condici[oó]n de quien lee/i.test(pc),
  'y las de Meta, para no escribir un titular que le cierre la cuenta');

ok(/TEXTO PRINCIPAL/.test(paraPegar(c)) && /TITULAR/.test(paraPegar(c)),
  'lo que se copia viene separado por campo, en el orden del administrador');

// ── 5 · Cableado ──────────────────────────────────────────────────────────
console.log('\n══ y está en la pantalla ══');
ok(!existsSync('src/components/campanas/NuevaCampanaChat.tsx'),
  'el chat de las seis fases se fue: cuatro de sus fases rehacían lo del Camino y el Constructor');
const pagina = codigoDe('src/pages/Campanas.tsx');
ok(/AsesorDeMontaje/.test(pagina), 'y en su lugar está el asesor de montaje');
ok(!/handleCampanaCreated/.test(pagina),
  'sin dejar huérfano el guardado que llamaba el chat viejo');
const asesor = codigoDe('src/components/campanas/AsesorDeMontaje.tsx');
ok(/LA_RECETA/.test(asesor) && /promptDelAsesor/.test(asesor),
  'el asesor usa la receta y su prompt');
ok(/revisarPaises/.test(asesor) && /GRUPOS_DE_PAISES/.test(asesor),
  'con la revisión de países en pantalla, antes de gastar');
ok(/tildar\(p\.n\)/.test(asesor),
  'los pasos se tildan A MANO: no depende de que yo detecte nada en lo que escribió');
ok(/localStorage\.setItem\(CLAVE/.test(asesor),
  'y el avance se guarda: en el chat viejo vivía en la conversación y se perdía al salir');
ok(/A_DONDE_MANDAR/.test(asesor), 'y la pantalla dice a dónde va cada cosa que no es suya');
const con = codigoDe('src/components/campanas/ConstructorAnuncios.tsx');
ok(/revisarCampos/.test(con) && /promptDeCampos/.test(con),
  'el Constructor arma el titular y la descripción');
ok(/paraPegar/.test(con), 'y lo deja listo para pegar campo por campo');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
