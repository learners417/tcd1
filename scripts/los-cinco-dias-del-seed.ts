/**
 * Los días 0 al 6 del Camino, tal como los declara el seed.
 *
 * Existe para que `caminar-los-cinco-dias.py` no tenga una lista escrita a
 * mano: si mañana el día 3 cambia de código, de pilar o de evidencia, la
 * lente del navegador lo sigue en vez de contradecirlo. Imprime una sola
 * línea, marcada con `@@`, para que el que la lee no tenga que adivinar cuál
 * de las líneas de la salida es el dato.
 */
import { SEED_ROADMAP_V3 } from '../src/lib/roadmapSeed';

const out: Array<Record<string, unknown>> = [];
for (const p of SEED_ROADMAP_V3 as Array<Record<string, any>>) {
  for (const m of p.metas) {
    const d = m.dia_asignado ?? 0;
    if (d > 6) continue;
    out.push({
      dia: d,
      codigo: m.codigo,
      clave: `${p.numero}-${m.codigo}`,
      titulo: m.titulo,
      tipo: m.tipo,
      evidencia: m.evidencia_requerida?.tipo ?? null,
      avanza_sin_evidencia: Boolean(m.avanza_sin_evidencia),
    });
  }
}
out.sort((a, b) => Number(a.dia) - Number(b.dia));
console.log('@@' + JSON.stringify(out));
