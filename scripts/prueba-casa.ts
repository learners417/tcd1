/**
 * Pruebas del objetivo, los principios y la inducción.
 *
 * Lo que se juega: había nueve documentos de plan que se contradecían. Nadie
 * lee nueve planes. Estas tres capas los reemplazan, y las dos primeras viven
 * DENTRO de la app porque un archivo en la raíz de un repo no lo abre nadie
 * que no sea programador.
 *
 * Correr con: npx tsx scripts/prueba-casa.ts
 */
import {
  OBJETIVO, PRINCIPIOS, INDUCCION, jornadasDeInduccion,
  MINUTOS_DE_CONTENIDO, SE_APRENDE_EN_EL_LUGAR,
} from '../src/lib/casa';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

console.log('══ el objetivo estratégico, en una página ══');
linea(OBJETIVO.quePrometemos.includes('$10.000') && OBJETIVO.quePrometemos.includes('90 días'),
  'la promesa está escrita con el número y el plazo');
linea(OBJETIVO.aQuien.length > 60, 'y a quién, sin ambigüedad');
linea(OBJETIVO.comoLoHacemos.includes('cuando la app no pudo'),
  'cómo lo hacemos deja claro el orden: la persona entra cuando la app no pudo');
linea(OBJETIVO.elNumero.includes('minutos de humano por cliente'),
  'y hay UN número que dice si el negocio funciona');
linea(OBJETIVO.porQueEseNumero.includes('gradiente') && OBJETIVO.porQueEseNumero.includes('$1.000'),
  'con el porqué: el gradiente de tickets ES el modelo');

console.log('\n══ los principios: cada uno resuelve una discusión ══');
linea(PRINCIPIOS.length >= 7, `son ${PRINCIPIOS.length}`);
linea(PRINCIPIOS.every((p) => p.resuelve.length > 50),
  'cada uno dice QUÉ DISCUSIÓN RESUELVE — no son valores de pared');
linea(PRINCIPIOS.every((p) => p.dice.length > 30 && p.dice.length < 130),
  'y cada uno se dice en una frase, no en un párrafo');

const api = PRINCIPIOS.find((p) => p.id === 'api_antes_que_minuto')!;
linea(api.resuelve.includes('cuesta más que toda la inteligencia artificial'),
  'el de la IA trae la comparación que cierra la discusión');
const regla = PRINCIPIOS.find((p) => p.id === 'la_regla_decide')!;
linea(regla.resuelve.includes('otra respuesta el jueves'),
  'el del diagnóstico dice por qué un modelo no puede juzgar números');
const tope = PRINCIPIOS.find((p) => p.id === 'el_limite_sube_no_baja')!;
linea(tope.dice.includes('el tope sube'),
  'y hay uno que protege a quien trabaja bien: si llega a un tope, el tope sube');
linea(PRINCIPIOS.some((p) => p.id === 'tres_veces'),
  'está el de las tres veces, que es el que evita documentar todo');

console.log('\n══ la inducción: 72 horas, no un mes ══');
linea(INDUCCION.length === 6, `son ${INDUCCION.length} sesiones`);
linea(MINUTOS_DE_CONTENIDO === 120,
  `${MINUTOS_DE_CONTENIDO} minutos de contenido en total — dos horas, no un mes`);
linea(INDUCCION.every((s) => s.minutos === 20),
  'todas de 20 minutos: nada de maratones de un día entero');
linea(INDUCCION.every((s) => s.accion.length > 30),
  'cada una termina en una ACCIÓN REAL dentro de la app, no en un quiz');
linea(INDUCCION.every((s) => s.porQueAntes.length > 50),
  'y cada una justifica por qué NO se puede aprender trabajando');

const tres = INDUCCION.find((s) => s.numero === 3)!;
linea(tres.titulo.includes('función y su destino'),
  'la tercera es la de la función y su destino');
linea(tres.porQueAntes.includes('reporta lo que se repite en vez de acostumbrarse'),
  'y su porqué es el que más importa: quien sabe que su función debe reducirse, reporta');

const cuatro = INDUCCION.find((s) => s.numero === 4)!;
linea(cuatro.porQueAntes.includes('lo que suena más urgente'),
  'la de la cola previene el error de atender por gravedad y no por dinero en riesgo');

console.log('\n══ las tres jornadas ══');
const j = jornadasDeInduccion();
linea(j.length === 3, 'son tres días');
linea(j.every((d) => d.minutos === 40), 'cuarenta minutos de contenido por día');
linea(j.every((d) => d.sesiones.length === 2), 'dos sesiones cada uno');
linea(j[0].despues.includes('Sin tocar nada'),
  'el día 1 es mirar, sin tocar');
linea(j[1].despues.includes('con alguien mirando'),
  'el día 2 es hacer acompañado');
linea(j[2].despues.includes('solo'),
  'y el día 3 es hacer solo, con revisión');
linea(j.map((d) => d.dia).join() === '1,2,3', 'y están en orden');

console.log('\n══ lo que NO entra, y dónde se aprende ══');
linea(SE_APRENDE_EN_EL_LUGAR.length >= 5,
  `${SE_APRENDE_EN_EL_LUGAR.length} cosas quedan fuera a propósito`);
linea(SE_APRENDE_EN_EL_LUGAR.every((x) => x.donde.length > 15),
  'y cada una dice DÓNDE se aprende');
linea(SE_APRENDE_EN_EL_LUGAR.some((x) => x.que.includes('mercados')),
  'los mercados se aprenden en el tablero, cuando aparece un CPM');
linea(SE_APRENDE_EN_EL_LUGAR.some((x) => x.donde.includes('primer viernes')),
  'y la reunión, el primer viernes');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
