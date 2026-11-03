/**
 * ANUNCIOS QUE AGENDAN — las reglas, la ficha y el cableado.
 *
 * ═══ QUÉ SE PROTEGE ═══
 *
 * Que la herramienta esté ENCHUFADA. Vino de afuera como una página suelta, y
 * la forma más fácil de que un módulo así termine sin usarse es dejarlo
 * perfecto y que ninguna pantalla lo importe.
 *
 * Y que las reglas que el cliente LEE sean las mismas que la IA CUMPLE: están
 * escritas una sola vez, y esto verifica que el prompt las lleve. Con las
 * reglas copiadas a mano en el prompt, el día que Javo corrija una regla la
 * pantalla diría una cosa y el generador haría otra.
 *
 * Correr con: npx tsx scripts/prueba-anuncios-agendan.ts
 */
import { readFileSync } from 'node:fs';
import {
  REGLAS, CASO_REAL, PLANTILLAS, OFERTAS, DESTINOS, VOCES,
  fichaVacia, completitud, perfilDeFicha, reglasPara,
  marcasAlInstante, puntaje, cuentaDeAgenda, exportarFicha,
  type Ficha,
} from '../src/lib/anunciosQueAgendan';
import { fichaDesdeElADN, vinoDelADN } from '../src/lib/anunciosStorage';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const codigoDe = (r: string) =>
  readFileSync(r, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const base = (x: Partial<Ficha> = {}): Ficha => ({
  ...fichaVacia('f1'),
  nombre: 'Marca', rubro: 'Mentoría de 90 días', avatar: 'Lo ascendieron este año.',
  ...x,
});

// ── 1 · El contenido ───────────────────────────────────────────────────────
console.log('══ las reglas y las estructuras ══');
ok(REGLAS.length === 20, `son veinte reglas (${REGLAS.length})`);
ok(REGLAS.every((r) => r.mal.length > 0 && r.bien.length > 0),
  'cada una trae el ejemplo que trae curiosos y el que agenda: una regla sin ejemplo se lee y no se aplica');
ok(REGLAS.every((r) => r.porque.length > 40), 'y el por qué, que es lo que se recuerda');
ok(PLANTILLAS.length === 7, `siete estructuras (${PLANTILLAS.length})`);
ok(PLANTILLAS.every((p) => p.pasos.length >= 3 && p.pasos.every((b) => b[1].trim())),
  'cada paso con su ejemplo hablado');
ok(new Set(PLANTILLAS.map((p) => p.id)).size === PLANTILLAS.length, 'sin ids repetidos');
ok(CASO_REAL.length >= 10, `el caso real trae sus anuncios (${CASO_REAL.length})`);
ok(CASO_REAL.every((s) => s.arreglo.trim()),
  'y cada uno dice qué le falta: señalar sin decir el arreglo no sirve para nada');

const todo = [
  ...REGLAS.flatMap((r) => [r.titulo, r.porque, ...r.mal.flat(), ...r.bien.flat()]),
  ...CASO_REAL.flatMap((s) => [s.titulo, s.gancho, s.porque, s.arreglo]),
  ...PLANTILLAS.flatMap((p) => [p.nombre, p.cuando, ...p.pasos.flat()]),
].join(' ');
ok(!/\bgente\b/i.test(todo), 'sin la palabra «gente»');
ok(!/\b(tenés|podés|sabés|querés|hacés|mirás|escribí|anotá|probá)\b/i.test(todo), 'y sin voseo');

// ── 2 · Las reglas llegan al prompt ────────────────────────────────────────
console.log('\n══ lo que se lee es lo que la IA cumple ══');
const rAlto = reglasPara(base());
ok(/EL 20/.test(rAlto), 'el prompt lleva el 20');
ok(/Nunca la palabra "gente"/.test(rAlto), 'y la palabra prohibida');
ok(/SIN precio en el anuncio/.test(rAlto),
  'en alto valor el precio no va en el anuncio: vive en la página');
const rEntrada = reglasPara(base({ oferta: OFERTAS[1] }));
ok(/El precio puede ir en el anuncio/.test(rEntrada),
  'y en una entrada sí va: ahí el precio filtra curiosos');
ok(rAlto !== rEntrada, 'o sea que las reglas cambian con el tipo de oferta');

const rPalabra = reglasPara(base({ destino: DESTINOS[1], palabra: 'CLAVE' }));
ok(/palabra clave "CLAVE"/.test(rPalabra),
  'con la palabra clave real adentro del prompt, no un marcador');
ok(/No inventes cifras, cupos, fechas, testimonios/.test(rAlto),
  'y la regla que impide que invente datos, que es la que más caro sale');

// ── 3 · La ficha ───────────────────────────────────────────────────────────
console.log('\n══ la ficha ══');
const vacia = fichaVacia('x');
ok(completitud(vacia).hechos === 0, 'una ficha vacía está en cero');
ok(completitud(base({ prueba: '[DATO REAL: falta el caso]' })).faltan.includes('Prueba real'),
  'un [DATO REAL] cuenta como falta: es el recordatorio de lo que falta, no el dato');
ok(!perfilDeFicha(vacia).includes('Prueba real'),
  'los campos vacíos no viajan al prompt: un campo en blanco le enseña a inventar');
ok(perfilDeFicha(base({ destino: DESTINOS[0], palabra: 'HOLA' })).indexOf('HOLA') === -1,
  'y la palabra clave solo viaja si el destino la usa');

// ── 4 · La ficha se llena con el ADN ───────────────────────────────────────
console.log('\n══ no se escribe dos veces lo mismo ══');
const delADN = fichaDesdeElADN('y', {
  nombre: 'Ana', adn_micronicho: 'Psicólogas con consulta propia',
  adn_avatar: { edad: '35 a 50', dolores: 'agenda llena y sin tiempo' },
  metodo_nombre: 'Método RAÍZ', adn_transformaciones: 'De 7 precios a 1',
  adn_pacientes_reales: '«Tengo turnos hasta mayo»',
});
ok(delADN.rubro === 'Psicólogas con consulta propia', 'el rubro sale del ADN');
ok(delADN.avatar.includes('agenda llena'),
  'el avatar también, y aplanado: era un objeto y «[object Object]» le llegaba al cliente en la cara');
ok(delADN.metodo.includes('Método RAÍZ'), 'y el método');
ok(vinoDelADN(delADN).length >= 4, 'y la pantalla puede decir qué trajo');
ok(fichaDesdeElADN('z', null).rubro === '', 'sin ADN abre en blanco, sin romper');

// ── 5 · La revisión al instante ────────────────────────────────────────────
console.log('\n══ lo que se mide sin preguntarle a nadie ══');
const marcasDe = (t: string, tit = '') => marcasAlInstante(base(), t.split('\n'), tit);
const dice = (t: string, re: RegExp, tit = '') => marcasDe(t, tit).some((m) => re.test(m.texto));

ok(dice('x'.repeat(130), /125/), 'el gancho que pasa de 125 se marca: Meta lo corta ahí');
ok(dice('Hola', /entra entero/), 'y el que entra, también se dice');
ok(dice('Hola', /Máximo 40/, 'x'.repeat(41)), 'el titular de más de 40 se marca');
ok(dice('¿Te gustaría ganar más?', /deseo/), 'parte del deseo');
ok(dice('Te cuento algo que nadie te dice', /anunciado/), 'gancho anunciado');
ok(dice('La gente no sabe vender', /gente/), 'la palabra prohibida');
ok(dice('¿No te alcanza a fin de mes?', /pobreza/), 'la señal de pobreza');
ok(dice('Programa de 3.000 USD', /precio/), 'el precio en un anuncio de alto valor');
ok(!marcasAlInstante(base({ oferta: OFERTAS[1] }), ['Taller de 47 USD'], '').some((m) => /precio/.test(m.texto)),
  'y en una entrada el mismo precio NO se marca: ahí filtra');
ok(dice('Hoy 30% de descuento', /descuento/), 'el descuento');
ok(dice('¿Estás agotada?', /condición personal/), 'la condición personal que Meta frena');
ok(dice('Esto no es un curso más', /positivo/), 'lo definido por lo que no es');
ok(dice('Mira esto 🔥', /emojis/), 'los emojis');
ok(dice('Pasó de X a Y [DATO REAL: cuál]', /datos reales/), 'y los datos que faltan');

ok(puntaje([]) === 100, 'sin faltas, cien');
ok(puntaje([{ tipo: 'no', texto: '' }]) === 82, 'una falta pesa 18');
ok(puntaje([{ tipo: 'amb', texto: '' }]) === 94, 'un aviso pesa 6: no es lo mismo romper que dudar');
ok(puntaje(Array(10).fill({ tipo: 'no', texto: '' })) === 0, 'y el piso es cero, nunca negativo');

// ── 6 · La cuenta del presupuesto ──────────────────────────────────────────
console.log('\n══ cuánto se puede pagar por una agenda ══');
const c = cuentaDeAgenda({ ticket: '3000', parte: '20', cierre: '2', agendas: '5' });
ok(c.sirve, 'con precio y parte, la cuenta sale');
ok(c.porCliente === 600, `por cliente nuevo: 600 (${c.porCliente})`);
ok(c.porAgenda === 120, `máximo por agenda: 120 (${c.porAgenda})`);
ok(c.porSemana === 600, `por semana: 600 (${c.porSemana})`);
ok(!cuentaDeAgenda({ ticket: '', parte: '', cierre: '', agendas: '' }).sirve,
  'sin precio no se opina: un número inventado acá decide todo el presupuesto');
ok(cuentaDeAgenda({ ticket: '1.500', parte: '20', cierre: '2', agendas: '1' }).porCliente === 300,
  'y el punto de los miles se entiende: 1.500 son mil quinientos, no uno coma cinco');

// ── 7 · Que esté enchufada ─────────────────────────────────────────────────
console.log('\n══ enchufada ══');
const pag = codigoDe('src/pages/Campanas.tsx');
const nav = codigoDe('src/components/campanas/CampanasSubNav.tsx');
const pan = codigoDe('src/components/campanas/AnunciosQueAgendan.tsx');
const alm = codigoDe('src/lib/anunciosStorage.ts');

ok(/<AnunciosQueAgendan clienteId=\{userId\} perfil=\{perfil\}/.test(pag),
  'Campañas la monta, con el cliente y su ADN');
ok(/id: 'escribir'/.test(nav), 'y tiene su destino en la barra');
ok(pag.indexOf("view === 'escribir'") < pag.indexOf("view === 'anuncios'"),
  'va ANTES de «Tus 3 anuncios»: primero se escribe con criterio, después se aprueba y se monta');
ok(/ConstructorAnuncios/.test(pag),
  'y el Constructor sigue ahí: es el que aprueba y arma los campos de Meta');

ok(/misFichas|guardarFicha/.test(pan), 'la pantalla guarda en la cuenta');
ok(!/localStorage/.test(pan) && !/localStorage/.test(alm),
  'y NO en el navegador: el cliente carga su ficha en la computadora y la abre en el teléfono');
ok(/from '\.\/aiProvider'/.test(alm),
  'usa el motor de IA de la app, así cada generación se cuenta donde se cuentan todas');
ok(/feature: 'constructor'/.test(alm), 'y declara su herramienta, para que el crédito se cobre');
ok(/reglasPara\(f\)/.test(alm), 'las tres llamadas llevan las mismas reglas que el cliente lee');

const mig = readFileSync('supabase/migrations/20261020_anuncios_que_agendan.sql', 'utf-8');
ok(/create table if not exists public\.anuncios_fichas/.test(mig), 'la tabla existe');
ok(/user_id = auth\.uid\(\)/.test(mig), 'cada cliente ve lo suyo');
ok(/es_del_equipo\(auth\.uid\(\)\)/.test(mig),
  'y el equipo todas: acompañarlo con sus anuncios es la mitad del servicio');

// ── 8 · Lo que se descarga ─────────────────────────────────────────────────
console.log('\n══ lo que se lleva ══');
const conAnuncio = base({
  anuncios: [{ id: 'a', plantilla: 'julio', titular: 'T', lineas: ['uno', 'dos'],
    veinte: 'La idea', pasos: [['Gancho', 'Hola']], visual: 'A cámara', epic: {}, nota: '', pendiente: '' }],
});
const txt = exportarFicha(conAnuncio);
ok(txt.includes('EL 20: La idea') && txt.includes('Gancho: Hola'),
  'el archivo trae el 20 y el guion, no solo el texto para Meta');
ok(txt.includes('Mentoría de 90 días'), 'y la ficha, para que se entienda de dónde salió');

ok(VOCES.every((v) => !/\bvos\b/i.test(v)), 'las voces que se ofrecen no incluyen voseo');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
