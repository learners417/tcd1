/**
 * prueba-lo-prometido.ts — que lo que la app anuncia exista.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Esta es la familia de errores que más caro sale y que nadie reporta:
 * compila, pasa las pruebas de tipos, y el cliente no avisa porque no sabe
 * que le falta algo. Cuatro aparecieron juntos en la auditoría:
 *
 *   · Diego y Lucas pedían, para abrirse, columnas de la versión anterior
 *     del método. Ninguna jornada las escribe, así que no se abrían nunca.
 *     El cliente tocaba, leía «se abre al cerrar tu jornada del día 9»,
 *     cerraba el día 9, y seguía bloqueado.
 *   · Cinco piezas del ADN se guardaban solo en el estado de React. La foto
 *     de partida era la peor: el día 1 promete compararla y el día 45, la
 *     graduación y la foto del día 90 la leen del perfil. Las tres devolvían
 *     vacío, y como el vacío no dibuja nada, la promesa se rompía en
 *     silencio.
 *   · La graduación abría solo con diez ventas cargadas a mano. Quien
 *     llegaba al día 90 con nueve no veía nunca su certificado.
 *   · La medición de entrada tenía tres cuentas distintas del mismo
 *     instrumento: seis en el asistente, «las diez preguntas» el día 1, y
 *     «tus seis números» el día 82.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AGENTES } from '../src/lib/agents';
import { claveDesbloqueoAgente, diaDelCodigo } from '../src/lib/roadmapSeed';
import { CAMPOS } from '../src/lib/medicion';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

console.log('\n── todos los entrenadores se pueden abrir ──');
/*
 * El desbloqueo correcto sale del seed: la jornada donde el entrenador
 * aparece por primera vez. Una condición extra encima puede volverlo
 * inalcanzable sin que nada lo diga, y eso ya pasó con dos de los ocho.
 */
for (const a of AGENTES) {
  if (a.id.includes('coach')) continue; // el Mentor está siempre abierto
  const clave = claveDesbloqueoAgente(a.id);
  const codigo = clave?.split('-').slice(1).join('-');
  const dia = codigo ? diaDelCodigo(codigo) : null;
  ok(Boolean(clave) && dia !== null, `${a.titulo.split(' ·')[0]} tiene su jornada en el seed (día ${dia ?? '—'})`);
}

/*
 * No toda condición extra es mala. La de Ramiro pide una semana de números
 * cargados: es algo que el cliente puede cumplir, y su mensaje lo dice con
 * claridad. Lo que no puede cumplir es una columna del perfil que ninguna
 * jornada escribe — y eso es exactamente lo que tenían Diego y Lucas.
 *
 * Así que lo que se mira es si la condición lee `perfil.`, y en ese caso, si
 * el Camino escribe ese campo en alguna parte.
 */
console.log('\n── y ninguna condición extra depende de un campo muerto ──');
const CAMPOS_VIVOS = /adn_|identidad|metodo|oferta|precio|avatar|puv|guardian|matriz|mensaje|protocolo/;
for (const a of AGENTES) {
  if (!a.unlockExtraCheck || a.id.includes('coach')) continue;
  const fuente = a.unlockExtraCheck.toString();
  const campos = [...fuente.matchAll(/perfil\??\.([a-z_0-9]+)/gi)].map((m) => m[1]);
  if (campos.length === 0) {
    console.log(`  ✓ ${a.titulo.split(' ·')[0]}: su condición mira el contexto, no el perfil`);
    continue;
  }
  for (const campo of campos) {
    ok(
      CAMPOS_VIVOS.test(campo) && new RegExp(campo).test(leer('src/lib/roadmap.seed.json')),
      `${a.titulo.split(' ·')[0]} pide «${campo}», y el Camino lo escribe`,
    );
  }
}

console.log('\n── lo que el cliente escribe llega a la base ──');
const roadmap = leer('src/pages/Roadmap.tsx');
/*
 * `onProfileFieldUpdate` es solo estado de React. Para un dato que otra
 * pantalla va a leer después, hace falta la función que además escribe en el
 * teléfono y en la base, y que mira el error.
 */
const soloEstado = [...roadmap.matchAll(/onProfileFieldUpdate\?\.\(\{\s*(adn_[a-z_]+)/g)].map((m) => m[1]);
ok(
  soloEstado.length === 0,
  soloEstado.length === 0
    ? 'ninguna pieza del ADN se guarda solo en la pantalla'
    : `${soloEstado.join(', ')} se guardan solo en la pantalla: el equipo y el Mentor no los ven`,
);
for (const campo of ['adn_autoevaluacion_dia1', 'adn_eneagrama', 'adn_bonos_preventa', 'adn_medicion_salida', 'adn_metodo_mapeo_obstaculos']) {
  ok(
    new RegExp(`guardarPiezaDelADN\\(\\{ ${campo}`).test(roadmap),
    `«${campo}» se guarda de verdad`,
  );
}

console.log('\n── la graduación llega aunque falten ventas ──');
ok(
  /diaActual < 90[\s\S]{0,320}setGraduacionVisible\(true\)/.test(roadmap),
  'el día 90 abre la graduación, haya o no diez ventas cargadas',
);

console.log('\n── la medición dice su número real ──');
const seed = leer('src/lib/roadmap.seed.json');
const letras: Record<number, string> = { 6: 'seis', 10: 'diez', 8: 'ocho', 5: 'cinco' };
const palabra = letras[CAMPOS.length] ?? String(CAMPOS.length);
ok(
  !/diez (números|preguntas) de (tu )?(entrada|medición)/.test(seed) || CAMPOS.length === 10,
  `el Camino la llama por su número real: ${CAMPOS.length} (${palabra})`,
);
ok(
  new RegExp(`${palabra} (números|preguntas)`, 'i').test(seed),
  `y el seed usa esa palabra al menos una vez`,
);

console.log('\n── y manda al día donde de verdad se vuelve a medir ──');
/*
 * La medición de salida vive en una jornada concreta. Si el texto manda a
 * otro día, el cliente llega y no hay nada.
 */
const diaDeSalida = roadmap.match(/meta\.codigo === codigoDelDia\((\d+)\) && \(\s*<TaskMedicionSalida/)?.[1]
  ?? (/codigoDelDia\(82\)/.test(roadmap) ? '82' : null);
ok(Boolean(diaDeSalida), `la medición de salida está montada en el día ${diaDeSalida ?? '—'}`);
if (diaDeSalida) {
  const otros = [...seed.matchAll(/día (\d{2}) lo vuelves a medir/g)].map((m) => m[1]);
  ok(
    otros.every((d) => d === diaDeSalida),
    otros.every((d) => d === diaDeSalida)
      ? `y todos los textos mandan a ese día`
      : `pero un texto manda al día ${otros.filter((d) => d !== diaDeSalida).join(', ')}`,
  );
}

console.log(fallas === 0 ? '\n✓ lo que la app promete, existe\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
