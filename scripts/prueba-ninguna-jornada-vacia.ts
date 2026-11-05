/**
 * ¿ALGUNA JORNADA DEJA AL CLIENTE MIRANDO UN CARTEL Y NADA MÁS?
 *
 * ═══ DE DÓNDE SALE ESTA PRUEBA ═══
 *
 * De caminar el día 1 de un cliente nuevo, clic por clic, en el navegador. La
 * sesión abre en «paso 1 de 5» y el recuadro de arriba muestra —en este
 * orden— el video de la jornada, o la lección escrita, o, si no hay ninguno,
 * un cartel:
 *
 *     Tu sesión, escrita
 *     Tienes la instrucción completa aquí abajo.
 *
 * Ese cartel es honesto solo si abajo HAY instrucción. Una jornada sin video,
 * sin lección y sin pasos deja al cliente abriendo su día para encontrar una
 * promesa vacía — y es el día en que decide si vuelve mañana.
 *
 * Es justo la semana en que las tres fuentes pueden fallar juntas: los videos
 * del Camino todavía se están grabando.
 *
 * ═══ QUÉ MIRA ═══
 *
 * Las tres fuentes reales, en el mismo orden en que las busca la pantalla:
 * `VIDEOS_POR_JORNADA` (por día o por código), `getGuion(codigo).esencia`, y
 * `meta.pasos`, que es lo que `pasosDeHoy` le pasa a la sesión.
 */
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';
import { VIDEOS_POR_JORNADA } from '../src/lib/videosCargados';
import { getGuion } from '../src/lib/guionesVideos';

let fallas = 0;
const vacias: string[] = [];
const soloPasos: string[] = [];
let total = 0;

for (const pilar of SEED_ROADMAP_V2) {
  for (const meta of pilar.metas) {
    total += 1;
    const dia = meta.dia_asignado ?? null;
    const hayVideo = Boolean(
      (dia !== null && VIDEOS_POR_JORNADA[dia]) || VIDEOS_POR_JORNADA[meta.codigo],
    );
    const hayLeccion = Boolean(getGuion(meta.codigo)?.esencia);
    const hayPasos = (meta.pasos ?? []).length > 0;

    /*
     * El fin de semana y la entrega técnica del equipo NO son jornadas del
     * cliente: el sábado descansa y el día 0 lo hace el equipo. Que no tengan
     * video ni pasos es correcto — la app ni siquiera se los ofrece como «tu
     * paso de hoy» (`JORNADAS_DEL_EQUIPO`, en diaPrograma). Contarlas como
     * vacías ahogaba a las de verdad: veintiséis descansos tapando las dos
     * que sí dejan al cliente sin nada.
     */
    const esDescanso = /fin de semana/i.test(meta.titulo ?? '')
      /*
       * Los días de campo tampoco: el cliente atiende a sus consultantes y la
       * app no le enseña nada ese día. Se reconocen por el dato y no por el
       * título —`tipo_jornada: 'campo'`—, porque por título se escaparía
       * cualquiera que mañana se llame distinto. Lo mismo la entrega técnica
       * del día 0, que la hace el equipo.
       */
      || meta.tipo_jornada === 'campo';
    const esDelEquipo = meta.tipo_jornada === 'entrega_tecnica';
    if (esDescanso || esDelEquipo) continue;

    if (!hayVideo && !hayLeccion && !hayPasos) {
      vacias.push(`día ${dia ?? '?'} · ${meta.codigo} · ${meta.titulo}`);
    } else if (!hayVideo && !hayLeccion) {
      soloPasos.push(`día ${dia ?? '?'} · ${meta.codigo}`);
    }
  }
}

if (vacias.length) {
  fallas += 1;
  console.log(`✗ ${vacias.length} de ${total} jornadas sin video, sin lección y sin pasos:`);
  for (const v of vacias.slice(0, 15)) console.log(`    ${v}`);
  if (vacias.length > 15) console.log(`    …y ${vacias.length - 15} más`);
  /*
   * Este rojo es CONTENIDO que falta escribir, no código roto: la app anda,
   * y quien empieza hoy llega a su día 45 en mes y medio. Se dice acá para
   * que quien corra la batería no lea «no empaquetar» y piense que hay un
   * bug — y para que no se olvide, que es justo lo que pasa con las cosas
   * que faltan a cuarenta y cinco días de distancia.
   */
  console.log('    ── es contenido por escribir, no un bug: la app anda. Quien');
  console.log('       empieza hoy llega a esa jornada en mes y medio.');
} else {
  console.log(`✓ las ${total} jornadas tienen video, lección o pasos — ninguna deja al cliente sin nada`);
}

/*
 * Las que van solo con los pasos escritos NO son una falla: el cartel dice
 * exactamente eso y los pasos están ahí. Se informa el número para que se vea
 * de cuántas jornadas depende hoy la grabación pendiente.
 */
console.log(`  (${soloPasos.length} van hoy con los pasos escritos, esperando su video)`);

process.exit(fallas ? 1 : 0);
