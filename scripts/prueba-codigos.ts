/**
 * prueba-codigos.ts — ningún código apuntando al vacío.
 *
 * El error que la motivó: el ADN se chequeaba contra códigos del Camino viejo
 * (1-P1.5, H-P7.3) y nunca se sellaba. Esta prueba busca en TODO el código
 * cualquier referencia a una jornada, un pilar, una sesión guiada, una
 * un entrenador, un grado o una clave del ADN, y verifica que
 * exista de verdad.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_ROADMAP_V2, roadmap } from '../src/lib/roadmapSeed';
import { CINTURONES } from '../src/lib/cinturones';
import { SESIONES_GUIADAS } from '../src/lib/sesionesGuiadas';

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : '\n    ' + d}`); if (!c) fallas++; };

const metas = SEED_ROADMAP_V2.flatMap((p) => p.metas.map((m) => ({ ...m, pilar: p.numero })));
const codigos = new Set(metas.map((m) => m.codigo));
const progresos = new Set(metas.map((m) => `${m.pilar}-${m.codigo}`));
const pilares = new Set(SEED_ROADMAP_V2.map((p) => String(p.numero)));
const clavesAdn = new Set(metas.flatMap((m) => m.adn_fields ?? []));
const sesiones = new Set(Object.keys(SESIONES_GUIADAS));
const agentes = new Set(roadmap.agentes.map((a) => a.id));
const grados = new Set(CINTURONES.map((c) => c.id));

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const ruta = join(dir, f);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.tsx?$/.test(f) ? [ruta] : [];
  });
}
const fuentes = archivos('src').map((f) => ({ f, t: readFileSync(f, 'utf8') }));

/** Busca literales de un patrón y devuelve los que no existen en el conjunto. */
function huerfanos(patron: RegExp, valido: Set<string>, limpiar = (x: string) => x) {
  const out: string[] = [];
  for (const { f, t } of fuentes) {
    if (f.includes('roadmap.seed.json')) continue;
    for (const m of t.matchAll(patron)) {
      const bruto = m[1] ?? m[0];
      const v = limpiar(bruto);
      if (!valido.has(v)) out.push(`${f.replace('src/', '')}: ${bruto}`);
    }
  }
  return [...new Set(out)];
}

console.log('\n── referencias al Camino ──');
const progHuerfanos = huerfanos(/'(\d-P\d[A-Z]?\.[\w.]+)'/g, progresos);
ok(progHuerfanos.length === 0, 'ninguna clave de progreso apunta a una jornada que no existe', progHuerfanos.join('\n    '));

// Los códigos sueltos pueden ser de jornada, de pieza o de tutorial: todos
// son del Camino, y lo que importa es que existan en alguno de los tres.
const delCamino = new Set([
  ...codigos,
  ...roadmap.piezas.map((x) => x.codigo),
  ...roadmap.tutoriales.map((x) => x.codigo),
  ...sesiones,          // las sesiones guiadas se referencian igual que las piezas
]);
const codHuerfanos = huerfanos(/'(P\d[A-Z]?\.[\w.]+)'/g, delCamino)
  .filter((x) => !x.startsWith('lib/adnSchema.ts')
                && !x.startsWith('lib/consultorio.ts')   // indexado por pieza, se resuelve por jornada
                && !x.startsWith('components/campanas/')
                && !x.startsWith('lib/guionesVideos.ts')       // guiones de piezas que ya no se piden
                && !x.startsWith('lib/supabase.ts')            // el tipo lista todo código histórico
                && !x.startsWith('lib/rubricas.ts')            // indexada por pieza, se resuelve por jornada
                && !x.startsWith('lib/preactivacionSteps.ts')  // tablero de la agencia, no del cliente
                && !x.startsWith('lib/paqueteCampana.ts')
                && !x.startsWith('lib/muroHitos.ts')
                && !x.startsWith('lib/perlasMaestro.ts')
                // En estos el código es etiqueta, no candado: la biblioteca
                // abre por pilar alcanzado, no por código de jornada.
                && !x.startsWith('pages/Biblioteca.tsx')
                && !x.startsWith('lib/teasers.ts')
                && !x.startsWith('lib/tutorialesTecnicos.ts'));
ok(codHuerfanos.length === 0, 'ningún código apunta a algo que el Camino no tiene', codHuerfanos.join('\n    '));

console.log('\n── el resto de los catálogos ──');
const adnPiezasTxt = fuentes.find((x) => x.f.endsWith('adnPiezas.ts'))?.t ?? '';
const adnHuerfanas = [...adnPiezasTxt.matchAll(/clave: '([\w.]+)'/g)]
  .map((m) => m[1]).filter((k) => !clavesAdn.has(k));
ok(adnHuerfanas.length === 0, 'ninguna pieza del ADN apunta a una clave que el Camino no escribe', adnHuerfanas.join('\n    '));

const agenteHuerfanos = SEED_ROADMAP_V2.flatMap((p) => p.metas)
  .map((m) => (m as { agente?: string | null }).agente)
  .filter((a): a is string => Boolean(a) && !agentes.has(a as never));
ok(agenteHuerfanos.length === 0, 'ningún entrenador nombrado que no exista', agenteHuerfanos.join('\n    '));

const gradoHuerfanos = huerfanos(/'(\d{1,2}(?:gup|dan))'/g, grados);
ok(gradoHuerfanos.length === 0, 'ningún grado que no exista', gradoHuerfanos.join('\n    '));

console.log('\n── el Camino consigo mismo ──');
const refPiezas = [...new Set(roadmap.jornadas.flatMap((j) => j.piezas ?? []))];
const refHuerfanas = refPiezas.filter((c) => !new Set(roadmap.piezas.map((x) => x.codigo)).has(c) && !sesiones.has(c));
ok(refHuerfanas.length === 0, 'toda pieza que pide una jornada existe', refHuerfanas.join(', '));
// Las sesiones guiadas se enganchan por PIEZA, no por código de jornada.
const piezasDelCamino = new Set(roadmap.jornadas.flatMap((j) => j.piezas ?? []));
const sesionesSinPieza = [...sesiones].filter((c) => !piezasDelCamino.has(c));
ok(sesionesSinPieza.length === 0, 'toda sesión guiada cuelga de una pieza del Camino', sesionesSinPieza.join(', '));

/*
 * El catálogo de herramientas salió del código el 1 de nov. Antes la vara era
 * «que ninguna jornada abra una que no existe»; ahora no existe ninguna, así
 * que la vara es que NINGUNA jornada apunte a una herramienta. Si alguien
 * vuelve a poner un `herramienta_id`, el cliente tocaría un botón que no
 * lleva a ningún lado, y esto lo caza antes.
 *
 * Se mira el JSON crudo y no el tipo: el campo salió de `RoadmapMeta`, así
 * que TypeScript ya frena a quien lo escriba en el código. La puerta que
 * queda abierta es el seed, que lo genera un script de Python.
 */
const seedCrudo = readFileSync('src/lib/roadmap.seed.json', 'utf8');
const conHerramienta = [...seedCrudo.matchAll(/"herramienta_id"\s*:\s*("[^"]*")/g)].map((m) => m[1]);
ok(conHerramienta.length === 0, 'ninguna jornada apunta a una herramienta: el catálogo ya no existe',
   conHerramienta.join(', '));
const pilaresDeAdn = new Set(SEED_ROADMAP_V2.map((p) => String(p.numero)));
ok(pilares.size === pilaresDeAdn.size, 'los pilares son los mismos en todos lados');

// El consultorio tiene que responder en las jornadas donde se pregunta.
import { preguntasDe } from '../src/lib/consultorio';
const conPreguntas = SEED_ROADMAP_V2.flatMap((p) => p.metas).filter((m) => preguntasDe(m.codigo).length > 0);
import { rubricaDe } from '../src/lib/rubricas';
const conRubrica = SEED_ROADMAP_V2.flatMap((p) => p.metas).filter((m) => rubricaDe(m.codigo));
ok(conRubrica.length >= 24, `el crítico tiene criterio en ${conRubrica.length} jornadas`);

// Toda jornada que pide algo ESCRITO tiene con qué juzgarlo. (El día 16 no:
// ahí el veredicto lo da Diego, no el Crítico.)
const escritas = SEED_ROADMAP_V2.flatMap((p) => p.metas)
  .filter((m) => m.evidencia_requerida?.tipo === 'texto' && m.evidencia_requerida?.pide)
  .filter((m) => m.codigo !== 'P3.d16');
const sinCriterio = escritas.filter((m) => !rubricaDe(m.codigo));
ok(sinCriterio.length === 0, 'toda evidencia escrita tiene su criterio',
   sinCriterio.map((m) => `día ${m.dia_asignado}`).join(', '));

ok(conPreguntas.length >= 32, `el Mentor entra con preguntas cargadas en ${conPreguntas.length} jornadas`);

console.log(fallas === 0 ? '\n✓ NINGÚN CÓDIGO APUNTA AL VACÍO\n' : `\n✗ ${fallas} GRUPOS DE CÓDIGOS ROTOS\n`);
process.exit(fallas === 0 ? 0 : 1);
