/**
 * EL SEGUIMIENTO DE CADA CLIENTE — los puntos ciegos del Admin.
 *
 * Cinco cosas que se veían bien y no eran ciertas:
 *
 *   · Lo que el equipo cargaba en la matriz —el estado de cada celda, la nota,
 *     el link del anuncio— se escribía contra columnas que no existían, fallaba
 *     en silencio y quedaba en el navegador de quien lo cargó.
 *   · Y aunque existieran, se guardaba con un UPDATE sobre una fila que solo
 *     existe si el paso está tildado: poner una nota en un paso pendiente no
 *     tocaba nada.
 *   · La pestaña de Métricas del cliente pedía una tabla con una letra de más.
 *   · Encender la campaña con el identificador vacío fallaba sin avisar.
 *   · La ventana de acceso no se podía cargar desde ninguna pantalla.
 *
 * Correr con: npx tsx scripts/prueba-seguimiento.ts
 */
import { readFileSync } from 'node:fs';
import { cierreDeLaVentana, sumarDias } from '../src/lib/ventanaDeAcceso';
import { fijarPausas } from '../src/lib/pausaGlobal';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const leer = (p: string) => readFileSync(p, 'utf-8');
const soloCodigo = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

fijarPausas([]);

const admin = leer('src/pages/Admin.tsx');
const extras = leer('src/lib/matrizExtras.ts');
const checks = leer('src/lib/preactivacionCheck.ts');
const montaje = leer('src/components/campanas/MontajeCupos.tsx');
const panel = leer('src/components/admin/ServicioDelCliente.tsx');
const migMatriz = leer('supabase/migrations/20261011_matriz_compartida.sql');
const migServicio = leer('supabase/migrations/20261009_servicio_contratado.sql');

// ── 1 · La tabla con una letra de más ──────────────────────────────────────
console.log('══ la pestaña de Métricas del cliente ══');
ok(!/from\('herramienta_outputs'\)/.test(admin),
  'ya no pide «herramienta_outputs», que no existe');
ok(/from\('herramientas_outputs'\)/.test(admin),
  'pide la tabla real, en plural: por esa letra la pantalla decía que el cliente no produjo nada');

// ── 2 · Lo que carga el equipo, compartido ─────────────────────────────────
console.log('\n══ la matriz se comparte de verdad ══');
ok(/add column if not exists estado/.test(migMatriz)
  && /add column if not exists nota/.test(migMatriz)
  && /add column if not exists link/.test(migMatriz),
  'las tres columnas existen: antes el código escribía contra columnas inventadas');
ok(/alter column completado_at drop not null/.test(migMatriz),
  'una fila puede existir sin estar tildada, para guardar una nota en un paso pendiente');
ok(/create or replace function public\.guardar_extra_celda/.test(migMatriz),
  'y se guarda con una función que crea la fila si hace falta');
ok(/rpc\('guardar_extra_celda'/.test(extras),
  'la pantalla la usa');
ok(!/\.update\(\{ estado:/.test(extras),
  'y ya no usa un UPDATE, que no tocaba nada cuando la fila no existía');
ok(/throw new Error/.test(extras),
  'si falla, se dice: antes el error se descartaba y todo quedaba en un solo navegador');

console.log('\n══ el tilde y la nota no se pisan ══');
ok(/\.not\('completado_at', 'is', null\)/.test(checks),
  'solo cuenta como hecho lo que tiene fecha: una nota no infla el avance');
ok(/completado_at: new Date\(\)\.toISOString\(\)/.test(checks),
  'tildar escribe la fecha explícita, porque la columna dejó de tener valor por defecto');
ok(/\.update\(\{ completado_at: null \}\)/.test(checks),
  'destildar quita la fecha en vez de borrar la fila');
ok(!/\.delete\(\)\s*\n\s*\.match\(\{ cliente_id/.test(checks),
  'así no se lleva puestos la nota y el link que alguien cargó ahí');

// ── 3 · El equipo puede leer el Camino ─────────────────────────────────────
console.log('\n══ los tildes automáticos del Camino ══');
ok(/hoja_de_ruta_equipo_lee/.test(migMatriz),
  'el equipo puede leer el Camino de sus clientes: sin esa política, 19 de los 62 pasos nunca mostraban su tilde');
ok(/for select using/.test(migMatriz) && !/for (insert|update|delete) on public\.hoja_de_ruta/.test(migMatriz),
  'solo lectura: el Camino lo cierra el cliente, o su avance deja de querer decir algo');

// ── 4 · Encender no falla en silencio ──────────────────────────────────────
console.log('\n══ encender la campaña ══');
const codigoMontaje = soloCodigo(montaje);
ok(!/marcarEncendida\(clienteId \?\? ''\)/.test(codigoMontaje),
  'ya no se guarda contra un identificador vacío');
ok(/if \(!clienteId\) \{ setSinAvisar\(true\); return; \}/.test(codigoMontaje),
  'sin identificador no se intenta y se avisa');
ok(/\.catch\(\(\) => setSinAvisar\(true\)\)/.test(codigoMontaje),
  'y si la base falla, tampoco se descarta el error');
ok(/no pudimos avisarle al equipo/.test(montaje),
  'el cliente ve que su campaña quedó sin registrar, en vez de creer que el equipo ya lo sabe');

// ── 5 · La ventana de acceso ───────────────────────────────────────────────
console.log('\n══ hasta cuándo tiene la app ══');
ok(/acceso: 'noventa' as TipoDeAcceso/.test(admin),
  'el alta pregunta la ventana de acceso');
ok(/acceso_tipo: nuevoForm\.acceso/.test(admin) && /acceso_hasta: cierra/.test(admin),
  'y la guarda al crear la cuenta');
ok(/servicio_contratado: nuevoForm\.servicio/.test(admin),
  'y también qué contrató, en vez de dejarlo en el más bajo sin que nadie lo decidiera');
ok(/marcar_acceso/.test(panel) && /marcar_acceso/.test(migServicio),
  'y se puede cambiar después, desde la ficha');
ok(/Solo el equipo puede cambiar la ventana de acceso/.test(migServicio),
  'solo el equipo');

console.log('\n══ el cierre se calcula bien ══');
ok(cierreDeLaVentana({ tipo: 'noventa', inicio: '2026-10-13' }) === sumarDias('2026-10-13', 89),
  'noventa días son noventa, contando el primero');
ok(cierreDeLaVentana({ tipo: 'treinta', inicio: '2026-10-13' }) === sumarDias('2026-10-13', 29),
  'y treinta son treinta');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
