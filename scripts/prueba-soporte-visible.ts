/**
 * EL SOPORTE QUE NO SE ENCONTRABA, Y MI CLÍNICA SIN EXPLICAR.
 *
 * ═══ LOS DOS HUECOS QUE CIERRA ═══
 *
 * 1 · «NO FUNCIONA EL CHAT, NO LO TIENE EL CLIENTE».
 *
 *     El chat funcionaba. Lo que no existía era la forma de llegar. En el
 *     celular —donde están los clientes— la barra de abajo tenía cinco
 *     destinos y Soporte no era ninguno; el menú lateral, los mismos cinco.
 *     El único acceso era un icono de salvavidas arriba a la derecha, sin
 *     etiqueta, entre otros iconos.
 *
 *     Y había una segunda mitad, peor: 'mensajes' no estaba en VALID_PAGES.
 *     El cliente entraba a Soporte, cerraba la app —en una PWA eso pasa a
 *     cada rato— y al volver aparecía en Hoy, porque su página guardada no
 *     pasaba la validación y caía al default. La conversación seguía ahí; él
 *     creía que no.
 *
 * 2 · «CLÍNICA» ERA UN BOTÓN QUE TE SACABA DE LA APP.
 *
 *     Un window.open a otra app, sin una palabra de qué es. Y bloqueado hasta
 *     el pilar 6, así que durante los primeros 35 días era un destino muerto
 *     ocupando uno de los cinco lugares.
 *
 * Correr con: npx tsx scripts/prueba-soporte-visible.ts
 */
import { readFileSync } from 'node:fs';
import {
  URL_MI_CLINICA, LAS_DOS_LLAVES, QUE_HACE_ALLA,
  loQueSeLleva, cuantasListas, comoLoEncuentra, ANTES_DE_ABRIR,
} from '../src/lib/miClinica';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const abajo = readFileSync('src/components/BottomTabBar.tsx', 'utf-8');
const lateral = readFileSync('src/components/Sidebar.tsx', 'utf-8');
const app = readFileSync('src/App.tsx', 'utf-8');
const topbar = readFileSync('src/components/Topbar.tsx', 'utf-8');

const idsDe = (txt: string, re: RegExp) =>
  [...txt.matchAll(re)].map((m) => m[1]);

// ── 1 · Soporte está donde se ve ───────────────────────────────────────────
console.log('══ soporte está en las dos navegaciones ══');
const enAbajo = idsDe(abajo, /id: '([a-z]+)'/g);
const enLateral = idsDe(lateral, /id: '([a-z]+)', icon/g);

ok(enAbajo.includes('mensajes'),
  'en la barra de abajo, que es la que usan los clientes en el celular');
ok(enLateral.includes('mensajes'), 'y en el menú lateral');
ok(enAbajo.length === 5 && enLateral.length === 5,
  'siguen siendo cinco destinos: un sexto hace dudar cuál navegación mirar');
ok(JSON.stringify(enAbajo) === JSON.stringify(enLateral),
  `y los mismos en el mismo orden: ${enAbajo.join(' · ')}`);

console.log('\n══ y Clínica salió de la barra ══');
ok(!enAbajo.includes('miclinica') && !enLateral.includes('miclinica'),
  'no era un destino de esta app: era un window.open a otra');
ok(!/window\.open\('https:\/\/mcd/.test(abajo) && !/window\.open\('https:\/\/mcd/.test(lateral),
  'ninguna de las dos navegaciones te saca de TCD al tocar un destino');
ok(/minPilar: 6/.test(lateral) === false,
  'y con ella se fue el destino que estaba bloqueado los primeros 35 días');

// ── 2 · La página sobrevive a cerrar la app ────────────────────────────────
console.log('\n══ la página sobrevive a cerrar la app ══');
const validas = app.slice(app.indexOf('const VALID_PAGES'), app.indexOf('] as const', app.indexOf('const VALID_PAGES')));
ok(/'mensajes'/.test(validas),
  'ESTA era la otra mitad del bug: sin «mensajes» acá, volver a abrir la app lo sacaba de Soporte a Hoy');
ok(/'miclinica'/.test(validas), 'y Mi Clínica también queda donde la dejó');
ok(/PWA eso pasa a cada rato/.test(app),
  'con el por qué escrito al lado, para que nadie lo saque de la lista');

console.log('\n══ el contador vive sobre el destino, no en un ícono suelto ══');
//
// El contador de respuestas sin abrir estaba en un salvavidas arriba a la
// derecha, entre otros tres botones. Dos problemas: el aviso quedaba lejos de
// la pantalla que lo resuelve, y esos cuatro botones se llevaban 249 de los
// 390 px de la barra — el título de la pantalla salía cortado en doce vistas.
const tabs = readFileSync('src/components/BottomTabBar.tsx', 'utf-8');
ok(/tab\.id === 'mensajes' && sinLeer > 0/.test(tabs),
  'el número de respuestas sin abrir va encima de la pestaña Contacto, que es donde se busca y donde se toca');
ok(/sinLeerDelCliente\(userId\)/.test(tabs) && /event: 'INSERT'/.test(tabs),
  'y se entera en vivo, sin recargar');
ok(/currentPage === 'mensajes'\) setSinLeer\(0\)/.test(tabs),
  'al entrar a Soporte vuelve a cero: ya las vio');
ok(/hidden md:flex w-12 h-12/.test(topbar),
  'el salvavidas de arriba queda solo en pantalla grande, donde hay lugar de sobra');
ok(/soporteSinLeer > 0/.test(topbar),
  'y ahí sigue llevando el contador');
ok(/id: 'miclinica'/.test(topbar), 'Mi Clínica se llega desde el menú de arriba');

// ── 3 · Mi Clínica, explicada antes de mandarlo ────────────────────────────
console.log('\n══ las dos llaves ══');
ok(LAS_DOS_LLAVES.camino.que === 'Donde te construyes'
  && LAS_DOS_LLAVES.clinica.que === 'Donde operas',
  'la distinción es la del producto, en las palabras con las que se vendió');
ok(QUE_HACE_ALLA.length >= 4, `${QUE_HACE_ALLA.length} cosas concretas que hace allá`);
ok(QUE_HACE_ALLA.every((x) => x.que && x.porque),
  'cada una con su para qué: una lista de funciones no explica por qué ir');
ok(QUE_HACE_ALLA.every((x) => !/^no /i.test(x.que)),
  'y dichas en positivo, por lo que SÍ hace');

console.log('\n══ qué de su trabajo la está esperando ══');
const vacio = loQueSeLleva({});
ok(vacio.length === 4, 'cuatro cosas que su Clínica usa de su Camino');
ok(vacio.every((x) => !x.listo), 'quien no escribió nada todavía no tiene ninguna');
ok(vacio.every((x) => /día \d+/.test(x.dondeSeEscribe)),
  'y cada una dice en qué día del Camino se escribe, en vez de mostrarle cuatro tachados');

const conTodo = loQueSeLleva({
  metodo_nombre: 'Método TAMIM',
  adn_protocolo_servicio: 'Cuatro etapas',
  avatar_cliente: 'Mujeres de 40 con agenda llena',
  oferta_high: 'Programa de 1.000',
});
ok(cuantasListas(conTodo.length ? {
  metodo_nombre: 'Método TAMIM',
  adn_protocolo_servicio: 'Cuatro etapas',
  avatar_cliente: 'Mujeres de 40',
  oferta_high: 'Programa de 1.000',
} : {}) === 4, 'quien lo escribió todo tiene las cuatro');

console.log('\n══ lo que lee ══');
ok(/lista para abrir/.test(comoLoEncuentra({})),
  `a quien no tiene nada no se le dice «te faltan cuatro»: "${comoLoEncuentra({})}"`);
ok(/Todo lo que escribiste/.test(comoLoEncuentra({
  metodo_nombre: 'X', adn_protocolo_servicio: 'Y', avatar_cliente: 'Z', oferta_high: 'W',
})), 'y a quien lo tiene todo, se lo dice');
ok(/misma cuenta/.test(ANTES_DE_ABRIR),
  'antes de tocar el botón sabe que se abre aparte y con la misma cuenta: eso era lo único que faltaba para no pensar que se perdió');
ok(/El Camino te espera acá/.test(ANTES_DE_ABRIR), 'y que no pierde dónde estaba');

// ── 4 · La pantalla ────────────────────────────────────────────────────────
console.log('\n══ la pantalla ══');
const pantalla = readFileSync('src/pages/MiClinica.tsx', 'utf-8');
ok(/currentPage === 'miclinica' && <MiClinica/.test(app), 'está montada en la app');
ok(/Abrir Mi Clínica/.test(pantalla), 'tiene el botón para abrirla');
const iBoton = pantalla.indexOf('Abrir Mi Clínica');
const iLlaves = pantalla.indexOf('Tienes dos llaves');
ok(iLlaves >= 0 && iLlaves < iBoton,
  'y el botón va DESPUÉS de la explicación: primero entiende a dónde va');
ok(/noopener,noreferrer/.test(pantalla), 'la pestaña nueva se abre sin dejarle acceso a esta');
ok(new RegExp(URL_MI_CLINICA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(
  readFileSync('src/lib/miClinica.ts', 'utf-8')),
  'la dirección vive en una sola constante: estaba escrita en dos pantallas');
ok(!/mcd-eight/.test(abajo) && !/mcd-eight/.test(lateral),
  'y ya no está repetida en las navegaciones');
ok(!/text-xs|text-sm|text-\[1[0-5]px\]/.test(pantalla), 'sin letra chica');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
