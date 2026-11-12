/**
 * prueba-la-radiografia-en-un-tramo.ts — el tramo único, el reloj y las cinco
 * preguntas nuevas (turno 17).
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Javo eligió el 8 de noviembre que la entrada sea UN tramo largo con los
 * quince minutos a la vista, y el 11 resolvió la condición: **pasarse no
 * cierra nada**. Esta lente cuida las cuatro cosas que pueden deshacer eso sin
 * que nada reviente:
 *
 *   1. que el reloj vuelva a arrancar de cero al recargar —y entonces mida la
 *      última visita en vez de la entrada, y regale quince minutos nuevos—;
 *   2. que alguien cuelgue un candado de `sePaso()` y el reloj empiece a
 *      cerrar cosas, que es exactamente lo que Javo excluyó;
 *   3. que el tramo se vuelva a partir en pasos, o que el cliente que hoy
 *      está a mitad de la bienvenida caiga en un paso que ya no existe;
 *   4. que una pregunta nueva deje de viajar, o vuelva a nacer vacía.
 *
 * ═══ LO QUE SE MIDIÓ ANTES DE CONSTRUIR (12 de noviembre) ═══
 *
 * La premisa del turno estaba mal en tres de sus cuatro partes:
 *
 *   · «los diez pasos»: de los diez, SEIS preguntaban. Los otros cuatro son la
 *     contraseña, el dictamen, la firma y la guía, y no se funden con nada.
 *   · «su audio»: ya existía Y ya estaba en la bienvenida —`BotonAudio`, en el
 *     origen y en el Para Qué—. Lo que faltaba era ponerlo en los demás
 *     campos abiertos, que no es una pregunta nueva.
 *   · el premio «su día 1 se abre ahí mismo, en vez de mañana»: ya pasaba.
 *     `fecha_inicio` se estampa HOY al alta, `diaDelPrograma` lo acota a 1 y la
 *     guía del final manda al día 1. Un premio que el que se pasa también
 *     recibe no es un premio: por eso acá no hay NADA que mire `sePaso()`.
 *
 * Se corre así —trae su propio teléfono, como la otra lente de la radiografía—:
 *   npx tsx scripts/prueba-la-radiografia-en-un-tramo.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

if (typeof globalThis.localStorage === 'undefined') {
  const caja = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => (caja.has(k) ? caja.get(k)! : null),
      setItem: (k: string, v: string) => { caja.set(k, String(v)); },
      removeItem: (k: string) => { caja.delete(k); },
      clear: () => { caja.clear(); },
      key: (i: number) => [...caja.keys()][i] ?? null,
      get length() { return caja.size; },
    },
  });
}

const reloj = await import('../src/lib/elRelojDeLaRadiografia');
const radiografia = await import('../src/lib/laRadiografia');
const archivos = await import('../src/lib/losArchivosDeLaRadiografia');

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};
const leer = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const WIZARD = leer('src/components/WelcomeWizard.tsx');
const RELOJ = leer('src/lib/elRelojDeLaRadiografia.ts');
const RADIO = leer('src/lib/laRadiografia.ts');
const ARCHIVOS = leer('src/lib/losArchivosDeLaRadiografia.ts');
const PANTALLAS = leer('scripts/prueba-pantallas.tsx');

/* Los comentarios se quitan antes de medir el código. Es la falta del turno
   16: una comprobación que se agarraba del renglón que CUENTA que algo ya no
   existe mide el comentario, no el programa. */
const sinComentarios = (t: string) => t
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const WIZARD_VIVO = sinComentarios(WIZARD);
const RELOJ_VIVO = sinComentarios(RELOJ);

console.log('══ 1) EL RELOJ: arranca una vez y no reinicia ══');

const T0 = 1_000_000_000_000;
localStorage.clear();
linea(reloj.inicio() === null, 'sin arrancar, el reloj no tiene inicio');
linea(reloj.transcurrido(T0) === 0, 'sin arrancar, no hay tiempo transcurrido');
linea(reloj.sePaso(T0) === false, 'y nadie se pasó de un reloj que no empezó');

const arranque = reloj.arrancar(T0);
linea(arranque === T0, 'arrancar estampa el momento en que el cliente entró');
/* LA MIRADA DEL MEDIO: recargar NO reinicia. Si esto se cae, el que recarga a
   los catorce minutos se lleva quince nuevos. */
linea(reloj.arrancar(T0 + 9 * 60_000) === T0,
  'volver a arrancarlo nueve minutos después devuelve el inicio original');
linea(reloj.transcurrido(T0 + 9 * 60_000) === 9 * 60,
  'y el transcurrido se cuenta desde la entrada, no desde la recarga');

linea(reloj.restante(T0 + 9 * 60_000) === 6 * 60, 'a los 9 minutos quedan 6');
linea(reloj.sePaso(T0 + 9 * 60_000) === false, 'a los 9 minutos no se pasó');
linea(reloj.restante(T0 + 20 * 60_000) === -5 * 60,
  'a los 20 el restante es NEGATIVO: nadie puede leer «se pasó» como «llegó justo»');
linea(reloj.sePaso(T0 + 20 * 60_000) === true, 'a los 20 se pasó');
linea(reloj.transcurrido(T0 - 5000) === 0, 'un reloj de la máquina que va atrás no da tiempo negativo');

linea(reloj.comoSeLee(6 * 60) === '6:00' && reloj.comoSeLee(65) === '1:05',
  'el tiempo se lee como lo lee una persona');
linea(reloj.comoSeLee(-65) === '1:05',
  'y el signo va afuera: el módulo no devuelve «−1:-5»');

reloj.olvidar();
linea(reloj.inicio() === null, 'al cerrar la bienvenida el reloj se olvida');
linea(WIZARD_VIVO.includes('olvidarBorrador();') && WIZARD_VIVO.includes('olvidarReloj();'),
  'y la bienvenida lo olvida junto con el borrador, en el mismo cierre');

console.log('\n══ 2) PASARSE NO CIERRA NADA ══');

/* La condición que eligió Javo, hecha cumplir por construcción. Si aparece un
   candado colgado del reloj, acá se pone roja. */
linea(!/\bdisabled=\{[^}]*sePaso/.test(WIZARD_VIVO),
  'ningún botón se apaga porque el cliente se pasó de tiempo');
linea(!/sePaso\([^)]*\)\s*(?:&&\s*)?return/.test(WIZARD_VIVO),
  'ninguna rama corta el tramo por el reloj');
linea(!/\breturn\b[^;]*\b(cerrado|bloqueado|vencido|expirado)\b/.test(RELOJ_VIVO),
  'el reloj no tiene una sola función que devuelva «cerrado», «bloqueado» ni «vencido»');
const usosDeSePaso = (WIZARD_VIVO.match(/sePaso\(/g) ?? []).length;
linea(usosDeSePaso > 0 && usosDeSePaso <= 4,
  `sePaso se usa ${usosDeSePaso} veces, y solo para decir el tono de la frase`);
linea(WIZARD.includes('PASARSE NO CIERRA NADA') || RELOJ.includes('PASARSE NO CIERRA NADA'),
  'y la condición está escrita donde la lee el que venga a cambiarlo');

/* La decisión que NO se tocó: la sesión de cada día sigue sin reloj. */
const SESION = leer('src/components/sesion/SesionViva.tsx');
linea(!SESION.includes('elRelojDeLaRadiografia') && !/CronometroSesion/.test(SESION),
  'la sesión de cada día sigue sin reloj: eso se decidió al revés y sigue en pie');

console.log('\n══ 3) EL TRAMO ES UNO ══');

const pasos = /const STEPS: Step\[\] = \[(.*?)\];/s.exec(WIZARD)?.[1] ?? '';
linea(pasos.includes("'radiografia'"), 'la lista de pasos tiene el tramo');
const VIEJOS = ['profile', 'situacion', 'diagnostico', 'origen', 'numeros', 'rueda'];
linea(!VIEJOS.some((v) => pasos.includes(`'${v}'`)),
  'y ninguno de los seis pasos de preguntas volvió a la lista');
linea((pasos.match(/'/g) ?? []).length / 2 === 5,
  'son cinco pasos: contraseña, tramo, dictamen, pacto y guía');

/* LA MIGRACIÓN. El cliente que hoy está a mitad de la bienvenida tiene uno de
   los nombres viejos en el teléfono. Sin tabla, ninguna rama lo dibuja. */
const tabla = /const PASOS_VIEJOS: Record<string, Step> = \{(.*?)\};/s.exec(WIZARD)?.[1] ?? '';
for (const v of VIEJOS) {
  linea(new RegExp(`\\b${v}:\\s*'radiografia'`).test(tabla),
    `el que quedó en «${v}» tiene traducción al tramo`);
}
linea(WIZARD_VIVO.includes('PASOS_VIEJOS[guardado]'),
  'y la bienvenida la consulta de verdad al retomar');

/* Las seis secciones viven bajo el MISMO guarda. Si una vuelve a tener el
   suyo, el tramo se partió otra vez. */
linea(!/\{step === '(profile|situacion|diagnostico|origen|numeros|rueda)'/.test(WIZARD),
  'ninguna sección se dibuja por su propio paso');
const guardas = (WIZARD.match(/\{enTramo &&/g) ?? []).length;
linea(guardas >= 7, `las secciones del tramo comparten el guarda (${guardas} usos de enTramo)`);

/* Y la pantalla se MONTA en la batería. Hasta el turno 17 ninguna lente la
   ejecutaba: compilaba perfecto y podía reventar al abrirse. */
linea(PANTALLAS.includes('WelcomeWizard'),
  'la bienvenida se monta de verdad en la prueba de pantallas');

console.log('\n══ 4) UN SOLO ESCRITOR DEL JSONB ══');

const escrituras = (WIZARD_VIVO.match(/diagnostico:\s*payloadDiagnostico/g) ?? []).length;
linea(escrituras === 1,
  `el jsonb «diagnostico» se escribe en UN lugar (${escrituras})`);
linea(!/\.update\(\{[^}]*\bdiagnostico:\s*\{/s.test(WIZARD_VIVO),
  'y nadie le manda un objeto armado a mano por el costado');

console.log('\n══ 5) LAS CINCO PREGUNTAS NUEVAS ══');

const NUEVAS = ['fortaleza', 'amenaza', 'enlaces', 'archivos', 'dias_que_importan'] as const;
const vacias = radiografia.RESPUESTAS_VACIAS as unknown as Record<string, unknown>;
for (const campo of NUEVAS) {
  linea(campo in vacias, `«${campo}» está declarada en las respuestas`);
}
linea(Array.isArray(vacias.archivos) && Array.isArray(vacias.dias_que_importan),
  'las dos listas nacen como listas, no como undefined');

/* Que VIAJEN. Una pregunta que se contesta y no sale de la pantalla es el bug
   del turno 15 y del 16, dos veces seguidas. */
const compositor = /const payloadDiagnostico = \(conSituacion: boolean\) => \(\{(.*?)\n  \}\);/s.exec(WIZARD)?.[1] ?? '';
for (const campo of NUEVAS) {
  const nombre = campo === 'dias_que_importan' ? 'dias_que_importan: diasQueImportan' : campo;
  linea(compositor.includes(nombre), `«${campo}» viaja en el compositor`);
}

/* Que VUELVAN. El que recarga no puede encontrarlas en blanco. */
for (const campo of NUEVAS) {
  const estado = campo === 'dias_que_importan' ? 'respuestas.dias_que_importan' : `respuestas.${campo}`;
  linea(WIZARD_VIVO.includes(estado), `«${campo}» nace de lo que el cliente ya contestó`);
}
localStorage.clear();
radiografia.anotar({ fortaleza: 'Leo radiografías raras', dias_que_importan: ['rio', 'bosque'] });
const vuelta = radiografia.leerRespuestas();
linea(vuelta.fortaleza === 'Leo radiografías raras', 'lo anotado vuelve: el texto');
linea(vuelta.dias_que_importan.join(',') === 'rio,bosque', 'y la lista, en su orden');
radiografia.anotar({ amenaza: 'Que abra una franquicia enfrente' });
const vuelta2 = radiografia.leerRespuestas();
linea(vuelta2.fortaleza === 'Leo radiografías raras' && vuelta2.amenaza.startsWith('Que abra'),
  'anotar una no borra la otra: el borrador mezcla');
/*
 * ACÁ HABÍA UNA MIRADA QUE NO PODÍA FALLAR, y queda anotado porque es el error
 * que este turno vino a no repetir. Decía «la lista que entrega es una copia,
 * no el borrador por referencia» y empujaba un elemento al array devuelto. Sale
 * verde con la copia puesta Y quitada: `leerBorrador()` hace `JSON.parse`, así
 * que cada lectura ya nace de cero y no hay referencia que compartir.
 *
 * En su lugar va lo que SÍ se puede romper: que anotar una lista no pise la
 * otra, que es el bug del 8 de noviembre en su versión de borrador.
 */
radiografia.anotar({ archivos: ['evidencias/u/__radiografia__/1_x.pdf'] });
const vuelta3 = radiografia.leerRespuestas();
linea(vuelta3.dias_que_importan.join(',') === 'rio,bosque' && vuelta3.archivos.length === 1,
  'anotar una lista no pisa la otra: las dos vuelven juntas');

/* El tramo nuevo entra en los TRAMOS, que es lo que mira el que vuelve. */
const idsDeTramo = radiografia.TRAMOS.map((t) => t.id);
linea(idsDeTramo.includes('loTuyo'), 'el tramo de las preguntas nuevas está en TRAMOS');
localStorage.clear();
radiografia.anotar({ fortaleza: 'algo' });
linea(radiografia.tramosConRespuesta().includes('loTuyo'),
  'y contestar una lo marca como empezado');
linea(radiografia.tramosEnBlanco().includes('origen'),
  'mientras los que no tocó siguen en blanco');

console.log('\n══ 6) LOS ARCHIVOS NO SON UN SEGUNDO SUBIDOR ══');

linea(ARCHIVOS.includes("from './evidencia'"),
  'los archivos de la radiografía delegan en el subidor que ya existe');
linea(!/storage\.from\(/.test(sinComentarios(ARCHIVOS)),
  'y no abren el bucket por su cuenta: un solo tope y un solo mensaje de falla');
linea(archivos.CARPETA === '__radiografia__',
  'con su carpeta reservada');
/* Que la carpeta NO sea el código de ninguna jornada: si lo fuera, lo que el
   cliente sube acá aparecería como evidencia de esa jornada. */
/*
 * LOS CÓDIGOS DE VERDAD. La primera versión de esta mirada leía
 * `seed.jornadas[].codigo` y contaba CERO: las jornadas del seed no tienen
 * campo `codigo` —tienen `dia`, `titulo`, `sistema` y `piezas`— y el código se
 * DERIVA en `roadmapSeed.ts`, de la pieza del pilar o de `{pilar}.d{día}`. Una
 * comparación contra un conjunto vacío sale verde siempre: es la misma falta
 * que el turno 16 encontró en su propia lente, una capa más arriba.
 *
 * Así que se piden los códigos al módulo que los arma, y se comprueba que haya
 * muchos antes de compararlos: una lente que puede pasar con la lista vacía no
 * está mirando nada.
 */
const { codigoDelDia } = await import('../src/lib/roadmapSeed');
const codigos = new Set<string>();
for (let dia = 1; dia <= 91; dia++) {
  const c = codigoDelDia(dia);
  if (c) codigos.add(c);
}
linea(codigos.size >= 80,
  `los códigos de las jornadas se leen de verdad: ${codigos.size}`);
linea(!codigos.has(archivos.CARPETA),
  `y ninguno de los ${codigos.size} usa la carpeta de la radiografía`);
linea(!/^[A-Z]?\d*\.?d?\d+$/.test(archivos.CARPETA) && archivos.CARPETA.startsWith('__'),
  'ni puede chocar con uno nuevo: la carpeta no tiene la forma de un código');
linea(archivos.CARPETA === archivos.CARPETA.replace(/[^a-zA-Z0-9._-]/g, '_'),
  'la carpeta ya viene saneada: el camino que se lee es el camino que se usa');

console.log('\n══ 7) LO QUE EL TRAMO SIGUE EXIGIENDO ══');

const cierre = /async function cerrarElTramo\(\) \{(.*?)\n  \}/s.exec(WIZARD)?.[1] ?? '';
linea(cierre.includes('!dxAvatar'), 'el cierre sigue pidiendo el avatar');
linea(cierre.includes('estaCompleta(medicionEntrada)'),
  'y los seis números completos: sin ellos no hay con qué comparar al final');
linea(/setLoQuePide\(/.test(cierre),
  'y cuando falta algo lo NOMBRA, en vez de dejar el botón apagado sin decir por qué');
linea(cierre.indexOf('guardar(KEY_ENTRADA') < cierre.indexOf('supabase.from'),
  'el teléfono se escribe antes que la base: el que pierde señal acá no pierde nada');
linea(RADIO.includes('fortaleza') && RADIO.includes('nada se pregunta dos veces'),
  'y queda escrito por qué la D y la O del FODA no se preguntan otra vez');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
