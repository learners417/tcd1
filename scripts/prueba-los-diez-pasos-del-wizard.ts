/*
 * ═══ LOS DIEZ PASOS DEL WIZARD ══════════════════════════════════════════════
 *
 * Qué cazó esta prueba la primera vez que corrió, y por qué existe:
 *
 * El paso `situacion` estaba en `STEPS` —o sea, contaba para los puntos de
 * progreso de arriba— y tenía su bloque de render completo, con su componente
 * `PasoSituacion`, su validación `situacionCompleta` y su función de guardado.
 * Pero NADIE llamaba nunca a `setStep('situacion')`: el paso del perfil saltaba
 * derecho al diagnóstico.
 *
 * Dos consecuencias, las dos medidas:
 *
 *  1. Los puntos contaban diez pasos y solo nueve podían ocurrir. La barra del
 *     cliente no se llenaba nunca, en los primeros diez minutos de un producto
 *     que se cobra.
 *
 *  2. `tcd_situacion` no se escribía jamás, así que `carriles.ts` —el módulo
 *     que decide el canal, los límites del colegio, la agenda llena y por
 *     dónde arrancan los días 1 a 10— corría con la entrada vacía para TODOS
 *     los clientes. De sus seis carriles el camino consume uno, `conLimites`,
 *     que alimenta el ángulo del día: del día 76 al 91 era lo único que
 *     protegía a quien su colegio le prohíbe mostrar prueba social, y estaba
 *     apagado.
 *
 * Un paso que nadie abre no es un paso: es un punto que no se enciende y un
 * módulo que corre a ciegas. Esta prueba lo dice en un segundo, sin navegador.
 *
 * Lo que NO alcanza con mirar el código: si el botón de ese paso llega a verse
 * habilitado, si el continuar avanza de verdad, si la pantalla entra en el
 * teléfono. Eso lo mide `medir-app.py`, que desde ahora recorre el wizard
 * entero y mide sus diez pasos con los veintidós lentes.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const ARCHIVO = 'src/components/WelcomeWizard.tsx';

/* Los comentarios nombran los pasos para explicarlos —este arreglo quedó
   escrito ahí arriba—, así que se limpian antes de medir: si no, la prueba se
   lee a sí misma y da por bueno lo que nadie cablea. */
const fuente = readFileSync(join(raiz, ARCHIVO), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
  .replace(/\/\/[^\n]*/g, ' ');

console.log('\n── los diez pasos del wizard ──');

const faltas: string[] = [];

/* ── 1 · el tipo y la lista dicen lo mismo ───────────────────────────────── */
const tipo = fuente.match(/type Step =([^;]+);/);
const lista = fuente.match(/const STEPS: Step\[\] = \[([^\]]+)\]/);

if (!tipo || !lista) {
  faltas.push('no se encontró `type Step` o `const STEPS` en el wizard');
} else {
  const delTipo = [...tipo[1].matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1]);
  const deLaLista = [...lista[1].matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1]);

  for (const s of delTipo) {
    if (!deLaLista.includes(s)) {
      faltas.push(`«${s}» está en el tipo Step pero no en STEPS: no cuenta para los puntos`);
    }
  }
  for (const s of deLaLista) {
    if (!delTipo.includes(s)) faltas.push(`«${s}» está en STEPS pero no en el tipo Step`);
  }

  console.log(`  · ${deLaLista.length} pasos declarados: ${deLaLista.join(', ')}`);

  /* ── 2 · cada paso tiene quién lo dibuje ───────────────────────────────── */
  for (const s of deLaLista) {
    if (!fuente.includes(`step === '${s}'`)) {
      faltas.push(`«${s}» cuenta para los puntos y NADIE lo dibuja (falta \`step === '${s}'\`)`);
    }
  }

  /* ── 3 · cada paso tiene quién lo abra ─────────────────────────────────── */
  //
  // El primero no: el wizard abre ahí. Todos los demás necesitan que alguien
  // los nombre dentro de un `setStep(...)`, o son inalcanzables aunque estén
  // escritos enteros.
  //
  // Se mira el ARGUMENTO completo y no la forma `setStep('paso')`, porque dos
  // pasos se abren desde un ternario —`setStep(esCincoDias ? 'welcome' :
  // 'rueda')`— y buscar la forma exacta los daba por muertos. Falso positivo
  // de la primera versión de esta prueba, corregido con la sonda en la mano:
  // el recorrido del wizard llega a los dos.
  //
  // Y se cuentan los paréntesis en vez de cortar en el primero: uno de los dos
  // ternarios lleva una llamada adentro —`setStep(getOrigen().porque ?
  // 'welcome' : 'origen')`— y cortar en el primer `)` se queda con
  // «getOrigen(», sin ninguna comilla. Segundo falso positivo de esta misma
  // prueba, por mirar de menos.
  const argumentosDeSetStep = (txt: string): string[] => {
    const out: string[] = [];
    const marca = 'setStep(';
    for (let i = txt.indexOf(marca); i !== -1; i = txt.indexOf(marca, i + 1)) {
      let hondo = 1;
      let j = i + marca.length;
      while (j < txt.length && hondo > 0) {
        if (txt[j] === '(') hondo++;
        else if (txt[j] === ')') hondo--;
        j++;
      }
      out.push(txt.slice(i + marca.length, j - 1));
    }
    return out;
  };
  const abiertos = new Set(
    argumentosDeSetStep(fuente)
      .flatMap((arg) => [...arg.matchAll(/'([a-zA-Z]+)'/g)].map((q) => q[1])),
  );
  for (const s of deLaLista.slice(1)) {
    if (!abiertos.has(s)) {
      faltas.push(`«${s}» cuenta para los puntos y NADIE lo abre (ningún setStep lo nombra)`);
    }
  }

  /* ── 4 · el wizard mueve de paso en algún lado ─────────────────────────── */
  if (abiertos.size === 0) faltas.push('el wizard no llama a setStep en ningún lado');
}

/* ── 5 · lo que el paso de la situación alimenta sigue conectado ─────────── */
//
// `carriles.ts` lee `tcd_situacion` de localStorage. Si el wizard deja de
// escribirlo, el módulo vuelve a correr a ciegas y nadie se entera: no rompe,
// devuelve los valores por defecto.
const carriles = readFileSync(join(raiz, 'src/lib/carriles.ts'), 'utf8');
if (carriles.includes("getItem('tcd_situacion')") && !fuente.includes("setItem('tcd_situacion'")) {
  faltas.push('carriles.ts lee `tcd_situacion` y el wizard ya no lo escribe: corre a ciegas');
}

if (faltas.length === 0) {
  console.log('  ✓ los diez pasos cuentan, se dibujan y tienen quién los abra');
  console.log('  ✓ lo que el paso de la situación alimenta sigue conectado');
} else {
  for (const f of faltas) console.log(`  ✗ ${f}`);
}

console.log(faltas.length === 0 ? '\n✓ el wizard no tiene pasos muertos' : `\n✗ ${faltas.length} faltas`);
process.exit(faltas.length === 0 ? 0 : 1);
