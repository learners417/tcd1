/**
 * prueba-el-adn-completo-se-llega.ts
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * `src/App.tsx` tiene un alias que manda la ruta vieja a su lugar nuevo:
 *
 *     const ALIAS = { agentes: 'entrenadores', manualNegocio: 'adn' };
 *
 * Con eso, `setCurrentPage('manualNegocio')` nunca llega: la condición
 * `currentPage === 'manualNegocio'` del render no se cumple jamás, y
 * `ManualNegocio.tsx` —568 líneas— quedó sin ninguna puerta.
 *
 * El alias fue una decisión de producto: el Manual del Negocio se fusiona con
 * Tu ADN. El problema es que la fusión nunca se hizo. Son dos pantallas
 * distintas, no una versión ampliada de la otra:
 *
 *   · ManualNegocio muestra 28 campos del perfil con su contenido; Tu ADN
 *     tiene 14 piezas, y de esos 28 campos solo tres se ven con su texto.
 *     Diecinueve no tienen ninguna vista: el cliente los genera en el Camino
 *     —el texto de su página, sus anuncios, su matriz, sus ofertas alta y
 *     baja, su protocolo de entrega— y después no tiene dónde leerlos juntos.
 *   · El selector del PAÍS del profesional vivía ahí, y es de donde sale el
 *     tono de todo lo que la app le escribe para publicar. El único otro
 *     lugar que lo pregunta es el asistente del primer día, que corre una
 *     sola vez: sin esa pantalla, el cliente no puede corregir su país nunca
 *     más.
 *   · Y los enlaces al paso exacto del Camino que completa cada campo, que
 *     son los únicos que leen `tcd_auto_open_adn_field` en Roadmap.tsx.
 *
 * Así que Tu ADN sigue siendo la pantalla del menú —eso no cambia— y el ADN
 * completo vive un toque más adentro, con lo que ya estaba construido.
 *
 * Esta prueba exige que esa puerta exista y que las props lleguen. La pantalla
 * de Tu ADN recibía `perfil`, `userId` y `onProfileFieldUpdate` desde App.tsx
 * y los ignoraba: solo desestructuraba `setCurrentPage`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const adn = leer('src/pages/ADN.tsx');
const manual = leer('src/pages/ManualNegocio.tsx');
const app = leer('src/App.tsx');

console.log('\n── se llega al ADN completo ──');
ok(
  /import ManualNegocio from '\.\/ManualNegocio'/.test(adn),
  'Tu ADN monta el ADN completo, así no depende del alias de App.tsx',
);
ok(
  /setVerCompleto\(true\)/.test(adn),
  'y tiene un botón que lo abre',
);
ok(
  /onVolver=\{\(\) => setVerCompleto\(false\)\}/.test(adn),
  'con su camino de vuelta a las piezas',
);

console.log('\n── y llega con sus datos ──');
/*
 * Sin `perfil` la pantalla muestra los 28 campos vacíos, que es peor que no
 * mostrarlos: parece que el cliente no construyó nada.
 */
ok(
  /export default function ADN\(\{[^}]*\bperfil\b/.test(adn),
  'Tu ADN usa el perfil que App.tsx le pasa, en vez de ignorarlo',
);
ok(
  /export default function ADN\(\{[^}]*\buserId\b/.test(adn),
  'y el userId, que es lo que deja guardar',
);
ok(
  /export default function ADN\(\{[^}]*\bonProfileFieldUpdate\b/.test(adn),
  'y el aviso de cambio, sin el cual lo guardado no se refleja hasta recargar',
);
ok(
  /perfil=\{perfil \?\? \{\}\}/.test(adn) && /userId=\{userId\}/.test(adn),
  'y se los entrega al ADN completo',
);

console.log('\n── lo que esa pantalla es la única en tener ──');
ok(
  /País del profesional/.test(manual) && /guardarPais/.test(manual),
  'el selector del país, de donde sale el tono de todo lo que se publica',
);
const wizard = leer('src/components/WelcomeWizard.tsx');
ok(
  /pais/.test(wizard),
  'el asistente del primer día también lo pregunta — pero corre una sola vez, así que no alcanza',
);
ok(
  /tcd_auto_open_adn_field/.test(manual),
  'los enlaces al paso exacto del Camino que completa cada campo',
);
ok(
  /tcd_auto_open_adn_field/.test(leer('src/pages/Roadmap.tsx')),
  'y el Camino sigue del otro lado de esos enlaces, esperándolos',
);

console.log('\n── el alias sigue haciendo su trabajo ──');
/*
 * El alias no se saca: los avisos y enlaces viejos que apuntan a
 * `manualNegocio` tienen que seguir llegando a algún lado, y ese lado es Tu
 * ADN, que ahora sí contiene el ADN completo.
 */
ok(
  /manualNegocio: 'adn'/.test(app),
  'las rutas viejas siguen llegando a Tu ADN, que ahora sí lo contiene',
);

console.log(fallas === 0 ? '\n✓ el ADN completo tiene puerta\n' : `\n✗ ${fallas} fallas\n`);
process.exit(fallas === 0 ? 0 : 1);
