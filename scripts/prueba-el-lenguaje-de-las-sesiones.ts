/**
 * prueba-el-lenguaje-de-las-sesiones.ts
 *
 * Corre `lente-lenguaje.ts` dentro de la batería. El lente vive aparte
 * porque otras pruebas le importan sus reglas —JERGA y CODIGO— y ejecutarlo
 * al importarlo imprimiría su informe entero cada vez; por eso tiene su
 * guarda de «ejecutado directo» y por eso esta prueba lo llama como proceso.
 *
 * Qué mide: los 1.004 textos que el cliente lee de las 91 jornadas del
 * Camino, de las sesiones guiadas y de las herramientas, contra cuatro
 * varas — jerga en inglés, códigos internos, símbolos matemáticos y frases
 * de más de veintidós palabras.
 *
 * Estuvo en 55 hallazgos con 34 falsos —el código de la sesión marcándose a
 * sí mismo, el Pixel de Meta que es el nombre del producto, y doce párrafos
 * legibles que el lente partía mal— y por eso nadie lo corría. Calibrado y
 * con los 21 reales arreglados, quedó en cero y ahora se sostiene.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const lente = join(import.meta.dirname, 'lente-lenguaje.ts');
const r = spawnSync('npx', ['tsx', lente], { encoding: 'utf8' });
const salida = (r.stdout ?? '').replace(/^\[Supabase\].*$/gm, '').trim();
console.log(salida);
process.exit(r.status ?? 1);
