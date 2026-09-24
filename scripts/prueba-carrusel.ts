/**
 * Pruebas del armado del carrusel.
 *
 * Correr con: npx tsx scripts/prueba-carrusel.ts
 */
import { armarCarrusel, LARGO_MAX_LAMINA } from '../src/lib/formulasAnuncios';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const GUION = `PANTALLA 1: ¿Cansada de terminar el día sin nada para ti?
PANTALLA 2: No necesitas otra dieta. No necesitas contar calorías.
PANTALLA 3: Lo que falta no es fuerza de voluntad: es un orden.
PANTALLA 4: El Método NORTE trabaja las 4 dimensiones a la vez.
PANTALLA 5: Comenta "ENERGIA" y te mando el camino.
CAPTION: Si esto te resonó, comenta ENERGIA. Resultados individuales.`;

console.log('══ el guion se parte en láminas ══');
const c = armarCarrusel(GUION, 'ENERGIA');

linea(c.laminas.length === 5, `salieron ${c.laminas.length} láminas (esperaba 5)`);
linea(c.laminas[0].tipo === 'portada', 'la primera es la portada');
linea(c.laminas[4].tipo === 'cierre', 'la última es el cierre');
linea(c.laminas[2].tipo === 'lamina', 'las del medio son láminas comunes');
linea(!c.laminas.some((l) => l.texto.includes('PANTALLA')),
  'ninguna lámina se queda con la marca "PANTALLA" adentro');
linea(c.caption.startsWith('Si esto te resonó'), 'el caption se separa del cuerpo');
linea(!c.caption.includes('CAPTION'), 'y no arrastra su propia etiqueta');
linea(c.palabraPresente, 'la palabra clave se detecta en el cierre');
linea(!c.problema, 'sin problemas que reportar');

console.log('\n══ la palabra clave ══');
const sinPalabra = armarCarrusel(
  GUION.replace('Comenta "ENERGIA" y te mando el camino.', 'Escríbeme por privado.')
       .replace('comenta ENERGIA.', 'escríbeme.'),
  'ENERGIA');
linea(!sinPalabra.palabraPresente,
  'si la palabra no está ni en el cierre ni en el caption, se marca');
linea(armarCarrusel(GUION, 'energia').palabraPresente,
  'las mayúsculas no cambian el resultado');
linea(!armarCarrusel(GUION, '').palabraPresente,
  'sin palabra configurada, nunca se da por presente');

console.log('\n══ láminas demasiado largas ══');
const largo = 'PANTALLA 1: ' + 'a'.repeat(LARGO_MAX_LAMINA + 40) + '\nPANTALLA 2: corto\nCAPTION: x';
const cl = armarCarrusel(largo, 'X');
linea(cl.laminas[0].larga, `una lámina de ${LARGO_MAX_LAMINA + 40} caracteres se marca como larga`);
linea(!cl.laminas[1].larga, 'una corta no');

console.log('\n══ bordes ══');
linea(armarCarrusel('', 'X').problema === 'Todavía no está escrito.',
  'un guion vacío lo dice, no se rompe');
linea(!!armarCarrusel('Un texto plano sin pantallas.', 'X').problema,
  'un texto sin marcas avisa que hay que regenerarlo');
linea(armarCarrusel('Un texto plano sin pantallas.', 'X').laminas.length === 0,
  'y no inventa láminas');

const sinCaption = armarCarrusel('PANTALLA 1: hola\nPANTALLA 2: chau', 'X');
linea(sinCaption.laminas.length === 2 && sinCaption.caption === '',
  'un guion sin caption igual se parte bien');

const numeracionRara = armarCarrusel(
  'PANTALLA: uno\nPANTALLA: dos\nPANTALLA: tres\nCAPTION: y', 'X');
linea(numeracionRara.laminas.length === 3,
  'funciona aunque el modelo no numere las pantallas');

const minusculas = armarCarrusel(
  'pantalla 1: uno\npantalla 2: dos\ncaption: tres', 'X');
linea(minusculas.laminas.length === 2 && minusculas.caption === 'tres',
  'funciona aunque el modelo escriba en minúsculas');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
