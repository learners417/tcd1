/**
 * datos-grabacion.ts — qué falta grabar, en JSON.
 *
 * Lee el Camino y deja afuera lo que ya tiene video. Lo usa
 * `pdf-lo-que-falta-grabar.py`, que arma el cuadernillo de rodaje.
 *
 * El día manda sobre el código: una jornada puede cambiar de lugar, y el
 * video sigue atado a su día.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { roadmap, diaDelCodigo } from '../src/lib/roadmapSeed';
import { VIDEOS_POR_JORNADA } from '../src/lib/videosCargados';
import { GUIONES } from '../src/lib/guionesVideos';
import { TUTORIALES_DE_LUPE } from '../src/lib/tutorialesDeLupe';

const salida = process.env.SALIDA_PDF || join(import.meta.dirname, '..', 'dist-pdf');
mkdirSync(salida, { recursive: true });

const javo = roadmap.piezas
  .map((p) => ({ ...p, diaReal: diaDelCodigo(p.codigo) ?? p.dia ?? 0 }))
  .filter((p) => !(VIDEOS_POR_JORNADA[p.codigo] || VIDEOS_POR_JORNADA[p.diaReal]))
  .map((p) => {
    const g = GUIONES[p.codigo];
    return {
      codigo: p.codigo, dia: p.diaReal, titulo: g?.titulo ?? p.titulo,
      minutos: p.minutos, set: p.set ?? 'sin set',
      proposito: g?.proposito ?? '', guion: g?.guion ?? '', esencia: g?.esencia ?? '',
    };
  })
  .sort((a, b) => a.dia - b.dia);

const lupe = roadmap.tutoriales
  .filter((t) => !VIDEOS_POR_JORNADA[t.codigo])
  .map((t) => {
    const e = TUTORIALES_DE_LUPE[t.codigo];
    return {
      codigo: t.codigo, dia: t.dia, titulo: e?.titulo ?? t.titulo, minutos: t.minutos,
      donde: t.donde ?? '', intro: e?.intro ?? '', pasos: e?.pasos ?? [], siFalla: e?.siFalla ?? '',
    };
  })
  .sort((a, b) => a.dia - b.dia);

writeFileSync(join(salida, 'datos.json'), JSON.stringify({ javo, lupe }, null, 2));
console.log(`javo ${javo.length} · lupe ${lupe.length} · sin guión ${javo.filter((p) => !p.guion).length}`);
