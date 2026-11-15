/**
 * EL CAMINO, PALABRA POR PALABRA — la app dice lo que dice el papel.
 *
 * ═══ QUÉ CONGELA ═══
 *
 * El 15 de noviembre de 2026 Javo cerró los libros: «ya no habrá cambios en
 * los 90 días, en los logros, las metas, cada libro cuántos días». El frente
 * LIBROS pasó la lista exacta de lo que el papel dice y la app no decía: 32
 * textos del camino y 5 micro-tareas.
 *
 * Esta lente los fija. No comprueba que estén bien escritos —eso lo decidió
 * el papel—: comprueba que la app no vuelva a decir lo viejo. Cada par es
 * «lo que decía» y «lo que dice», y la app tiene que tener lo segundo y
 * ninguno de lo primero.
 *
 * ═══ POR QUÉ UNA LENTE Y NO UN COMENTARIO ═══
 *
 * Porque el seed se genera. Un día alguien toca `hoja_de_ruta.py` o vuelve a
 * correr el generador con una copia vieja y el texto se va sin que nada
 * falle: el cliente lee «del día 47» y busca unas columnas que arma el 36.
 * Es el mismo tipo de error que la app arrastró durante semanas.
 *
 * Correr con: npx tsx scripts/prueba-el-camino-palabra-por-palabra.ts
 */
import { readFileSync } from 'node:fs';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

/** [lo que decía antes, lo que dice el papel desde el 15 nov 2026]. */
const CAMBIOS: [string, string][] = [
  ['Sube la captura de tu pacto publicado, donde se lea tu nombre y la fecha.',
   'Sube la foto de tu pacto firmado, donde se lean tu nombre y la fecha.'],
  ['Escribe en una palabra dónde lo sentiste.',
   'Escribe en una palabra dónde sentiste en el cuerpo tu hora real neta.'],
  ['Lee cómo se ve tu tipo cuando estás entero y cuando estás cansado',
   'Lee cómo se ve tu tipo cuando estás en tu mejor momento y cuando te gana el cansancio'],
  ['Sube la foto de tu captación, con las dos ramas.',
   'Pega tu presentación de treinta segundos.'],
  ['Escribe cuál de los tres recursos eliges.',
   'Escribe la lista de lo que grabas el lunes.'],
  ['Sube la captura de tu panel con tus consultantes cargados.',
   'Sube la captura de tu página de preparación.'],
  ['Si todavía sube el tono, devuelve \'repite mañana\' y no aprueba.',
   'Si todavía sube el tono, devuelve «repite mañana» y no aprueba.'],
  ['Escribe el número: los cuatro números.',
   'Escribe tus cuatro números.'],
  ['A cada \'no ahora\' ponle fecha de vuelta',
   'A cada «no ahora» ponle fecha de vuelta'],
  ['Escribe al lado quién viene después, con nombre y fecha. Eso evita que lo bajes',
   'Escribe al lado quién viene después, con nombre y fecha. Eso evita que bajes el ritmo'],
  ['Crea tu cuenta publicitaria dentro de tu business',
   'Crea tu cuenta publicitaria dentro de tu cuenta comercial de Meta'],
  ['Escribe qué se libera él al pagar. Ejemplo: deja de deberse a sí mismo empezar',
   'Escribe de qué se libera tu consultante al pagar. Ejemplo: deja de postergar su propio comienzo'],
  ['Escribe el número: horas por consultante al mes.',
   'Escribe tus horas por consultante, por semana.'],
  ['Elige de tu columna \'va grabado\' del día 47',
   'Elige de tu columna «va grabado» del día 36'],
  ['Sube el archivo: cuatro videos.',
   'Sube tus cuatro videos.'],
  ['Si no llega, el camino no se frena. El grado queda en ventana.',
   'Si no llega, el camino no se frena: lo registras el día que entre.'],
  ['Se marca solo cuando bloquees la fecha del rodaje.',
   'Escribe qué nivel ofreces primero después de tu programa.'],
  ['Escribe en una línea a quién NO atiendes',
   'Escribe en una línea a quién no atiendes'],
  ['Graba tres variantes del MISMO 20, con otro gancho',
   'Graba tres variantes del mismo anuncio, con otro gancho'],
  ['Escríbele a cada uno para hablar ANTES de que termine',
   'Escríbele a cada uno para hablar antes de que termine'],
  ['Compáralos con la referencia de TU país, no con la semana pasada',
   'Compáralos con la referencia de tu país, no con la semana pasada'],
  ['Elige UN número para mover, y anota qué vas a cambiar',
   'Elige un solo número para mover, y anota qué vas a cambiar'],
  ['Elige UNO de los que se apagan y déjalo andando antes del día 90',
   'Elige uno solo de los que se apagan y déjalo andando antes del día 90'],
  ['Si todavía no, elige qué corriges: anuncios, VSL, oferta, triage o perfil',
   'Si todavía no, elige qué corriges: anuncios, video, oferta, triage o perfil'],
  ['Contesta las mismas preguntas del día 3',
   'Contesta las mismas preguntas del día 1'],
  ['Recién ahí la app destapa el número del día 3',
   'Recién ahí la app destapa el número del día 1'],
  ['Escribe el número: hora real neta final.',
   'Escribe tu hora real neta de llegada.'],
  ['Te lo llevas lo tomes o no lo tomes',
   'Te lo llevas, sigas o no conmigo'],
  ['Escribe plan de 180 aprobado.',
   'Marca tu plan de 180 días como aprobado.'],
  ['Tu escalera de cinco niveles, con el tercero marcado, y tu rodaje agendado.',
   'Tu escalera de cinco niveles, con el tercero marcado.'],
  ['Tu plan de 180 días, tuyo, lo uses con nosotros o solo.',
   'Tu plan de 180 días, tuyo, sigas o no conmigo.'],
  ['Tus dos números lado a lado: el del día 3 y el de hoy.',
   'Tus dos números lado a lado: el del día 1 y el de hoy.'],
  ['Subraya lo que reconoces de ti entero',
   'Subraya lo que reconoces de ti en tu mejor momento'],
  ['Subraya lo que reconoces de ti cansado',
   'Subraya lo que reconoces de ti cuando te gana el cansancio'],
  ['Entra a tu business de Meta',
   'Entra a tu cuenta comercial de Meta'],
  ['Desde lo que siente él, no desde lo que haces tú',
   'Desde lo que siente tu consultante, no desde lo que haces tú'],
  ['Horas por consultante al mes',
   'Horas por consultante, por semana']
];

const seed = readFileSync('src/lib/roadmap.seed.json', 'utf-8');

console.log('\n══ lo viejo no vuelve ══');
const viejos = CAMBIOS.filter(([antes]) => seed.includes(antes)).map(([a]) => a);
ok(viejos.length === 0, `ninguno de los ${CAMBIOS.length} textos viejos sigue en el seed${
  viejos.length ? ` — «${viejos[0].slice(0, 60)}…»` : ''}`);

console.log('\n══ lo del papel está ══');
const faltan = CAMBIOS.filter(([, ahora]) => !seed.includes(ahora)).map(([, b]) => b);
ok(faltan.length === 0, `los ${CAMBIOS.length} textos del papel están en el seed${
  faltan.length ? ` — falta «${faltan[0].slice(0, 60)}…»` : ''}`);

console.log('\n══ y el seed sigue siendo el que genera el generador ══');
/* Esta lente mira el seed de la app. Si alguien edita ese JSON a mano para
   pasar la lente, la de siempre —«el seed es el que genera hoy
   generar_seed.py»— se pone roja. Las dos juntas obligan a que el cambio
   entre por donde tiene que entrar. */
const delGenerador = readFileSync('tcd-spec/datos/roadmap.seed.json', 'utf-8');
ok(delGenerador === seed, 'el seed de la app y el del generador son el mismo archivo');

console.log(fallas === 0 ? '\n✓ la app dice lo que dice el papel' : `\n✗ ${fallas} fallas`);
process.exit(fallas === 0 ? 0 : 1);
