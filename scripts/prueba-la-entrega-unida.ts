/**
 * LA ENTREGA UNIDA — que la app y la comunidad sean un solo sistema.
 *
 * ═══ QUÉ VIGILA ═══
 *
 * Tres cosas que se caen sin romperse, y las tres tienen el mismo síntoma:
 * todo verde y el cliente sin recibir nada.
 *
 *  1 · LOS CINCO DATOS EN CADA AVISO. Sin ellos, cada flujo del Sistema le
 *      habla al cliente del día de nadie: un correo que dice «empieza el
 *      Viento» al que está en el Lago es peor que no mandar correo.
 *  2 · LOS CINCO EVENTOS NUEVOS. Están escritos y hay que DISPARARLOS: la
 *      historia de este repo es módulos completos que nadie llamaba
 *      (`avisosCliente`, `pasoEsencialDe`, `SI_SE_CORTA`).
 *  3 · QUE HOY LOS MUESTRE. El encuentro, su canal y dónde contarlo viven
 *      en la comunidad; si Hoy no los nombra, el cliente tiene que ir a
 *      buscarlos y no va.
 *
 * Correr con: npx tsx scripts/prueba-la-entrega-unida.ts
 */
import { readFileSync } from 'node:fs';
import {
  proximoEncuentroAcordado, cuandoSeDice, ENCUENTROS_ACORDADOS,
} from '../src/lib/elProximoEncuentro';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

const leer = (p: string) => readFileSync(p, 'utf-8');
/** Sin comentarios: un mecanismo no se cumple con un comentario que lo nombra. */
const soloCodigo = (t: string) => t
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));

const mod = soloCodigo(leer('api/_lib/avisar-a-ghl.ts'));
const cron = soloCodigo(leer('api/cron/alarmas-inactividad.ts'));
const hoy = soloCodigo(leer('src/pages/Dashboard.tsx'));
const comunidadEnHoy = soloCodigo(leer('src/components/LaComunidadEnHoy.tsx'));
const siTeCaiste = soloCodigo(leer('src/components/SiTeCaiste.tsx'));
const encuentro = soloCodigo(leer('src/lib/elProximoEncuentro.ts'));
const paisajes = soloCodigo(leer('src/lib/losCincoPaisajes.ts'));

console.log('\n══ 1) los cinco datos viajan en CADA aviso ══');

/*
 * Se miran en el TIPO y en el cuerpo del pedido, no en el cron: declarados
 * como obligatorios, el compilador obliga a quien avise a traerlos. Era eso o
 * campos opcionales que nadie llena y que llegan en null para siempre.
 */
for (const campo of ['dia', 'paisaje', 'cinturon', 'ultimo_avance', 'ventas_registradas']) {
  ok(new RegExp(`${campo}\\s*:`).test(mod.split('export async function')[0]),
    `«${campo}» está declarado en el contacto del aviso`);
  ok(new RegExp(`${campo}[,:]`).test(mod.split('JSON.stringify')[1] ?? ''),
    `y viaja en el cuerpo del pedido`);
}
ok(!/\?\s*:/.test((/export interface ElDiaDelCliente[\s\S]*?\n\}/.exec(mod) ?? [''])[0]),
  'ninguno es opcional: el compilador no deja avisar sin ellos');

console.log('\n══ 2) y cada uno sale de una fuente real, no de un valor fijo ══');

/*
 * Se mira DENTRO del ayudante que arma los cinco datos, no en el archivo
 * entero: el arnés puso el defecto y esta lente seguía verde porque la línea
 * del import también dice `paisajeDelDia`. Una lente que se conforma con ver
 * el nombre en cualquier parte del archivo no mide nada.
 */
const bloqueDeLosCinco = (/const datosDel = \([\s\S]*?\n {4}\}\);/.exec(cron) ?? [''])[0];
ok(bloqueDeLosCinco.length > 0, 'los cinco datos se arman en un solo ayudante');
ok(/paisajeDelDia\(/.test(bloqueDeLosCinco),
  'el paisaje sale de `paisajeDelDia`, el mismo que dibuja Hoy');
ok(/cinturon/.test(bloqueDeLosCinco) && /select\('id, nombre, email,[^']*cinturon/.test(cron),
  'el cinturón sale de la columna que ya guarda el estado visible');
ok(/ultimoAvancePor/.test(bloqueDeLosCinco) && /fecha_completada/.test(cron),
  'el último avance sale de `hoja_de_ruta.fecha_completada`');
ok(/ventasPor/.test(bloqueDeLosCinco) && /from\('ventas_registradas'\)/.test(cron),
  'las ventas salen de `ventas_registradas`');

console.log('\n══ 3) los cinco eventos nuevos están y el cron los dispara ══');

const NUEVOS = ['cambio_de_paisaje', 'venta_registrada', 'caso_dia_30', 'caso_dia_90', 'numeros_sin_cargar'];
for (const e of NUEVOS) {
  ok(mod.includes(e), `está «${e}»`);
  ok(new RegExp(`avisarUnaVez\\(\\s*'${e}'`).test(cron), `y el cron lo dispara`);
}
/* Los tres viejos siguen disparándose: un refactor que los pierde es el
   fallo más probable de este turno. */
for (const e of ['sin_entrar_3_dias', 'dia_5_hecho', 'camino_completo']) {
  ok(new RegExp(`avisarUnaVez\\(\\s*'${e}'`).test(cron), `y «${e}» sigue saliendo`);
}

console.log('\n══ 4) los que pueden repetirse tienen su propia llave ══');

/*
 * `cambio_de_paisaje` ocurre cinco veces y `venta_registrada` una por venta.
 * Con la llave `ghl_<evento>` a secas, la primera tapa a todas las demás: el
 * cliente recibe el Lago y nunca el Río, y la segunda venta no avisa.
 */
ok(/sufijo/.test(cron), 'la llave admite un sufijo');
ok(/'cambio_de_paisaje'[\s\S]{0,260}?sufijo/.test(cron),
  'el cambio de paisaje lleva el paisaje en su llave');
ok(/'venta_registrada'[\s\S]{0,260}?sufijo/.test(cron),
  'y la venta, cuántas van');

console.log('\n══ 5) ninguno se salta el interruptor ══');

/* Un evento nuevo que llame a `fetch` por su cuenta manda avisos con la
   dirección sin cargar y sin anotarse: el interruptor dejaría de ser uno. */
ok((cron.match(/avisarAGHL\(/g) ?? []).length === 1,
  'el cron llama al que avisa en un solo lugar, dentro de `avisarUnaVez`');
ok(!/fetch\(/.test(cron), 'y no hace ningún pedido de red por su cuenta');

console.log('\n══ 6) Hoy nombra el encuentro, su canal y dónde contarlo ══');

/* `<` adelante a propósito: sin él, la lente se cumplía con la línea del
   import y el arnés la encontró verde con la sección sacada de la pantalla. */
ok(/<LaComunidadEnHoy/.test(hoy), 'Hoy dibuja la sección de la comunidad');
ok(/Tu próximo encuentro/.test(comunidadEnHoy), '«Tu próximo encuentro» está');
ok(/Tu canal/.test(comunidadEnHoy), '«Tu canal» está');
ok(/Cuéntalo en Victorias/.test(comunidadEnHoy), '«Cuéntalo en Victorias» está');
ok(/canal_comunidad/.test(hoy), 'el canal sale del perfil, no de una dirección a mano');
ok(/if \(!muestraEncuentro && !muestraCanal && !muestraVictoria\) return null;/.test(comunidadEnHoy),
  'y sin nada que decir la sección no se dibuja');
ok(/hayLogro/.test(comunidadEnHoy) && /hayLogro=/.test(hoy),
  'Victorias solo aparece el día que hay un logro');
ok(!/https:\/\//.test(comunidadEnHoy.replace(/VICTORIAS/g, '')),
  'ninguna dirección de la comunidad escrita en la pantalla');

console.log('\n══ 7) el reenganche se dice adentro, con el texto decidido ══');

ok(/SI_SE_CORTA/.test(siTeCaiste), 'el componente lee el texto decidido, no una copia');
ok(/<SiTeCaiste/.test(hoy), 'y Hoy lo dibuja');
ok(/atrasoHabil < DIAS_PARA_EL_REENGANCHE/.test(siTeCaiste),
  'aparece desde el umbral, no siempre');
ok(/DIAS_PARA_EL_REENGANCHE = 3/.test(siTeCaiste),
  'y el umbral es el mismo que el de la alarma del equipo: tres días hábiles');
ok(/diasHabilesDeAtraso\(/.test(hoy),
  'el atraso lo calcula la misma función que el ritmo');

console.log('\n══ 8) el próximo encuentro: se ejecuta, no se lee ══');

/* Lunes 23 de noviembre de 2026, 10:00 de Argentina (13:00 UTC). */
const lunes = new Date('2026-11-23T13:00:00Z');
const e1 = proximoEncuentroAcordado(lunes);
ok(e1 !== null && e1.cuando.toISOString() === '2026-11-24T16:00:00.000Z',
  'un lunes, el próximo es el martes a las 13:00 de Argentina');

/* Miércoles, media hora DESPUÉS de empezar: sigue siendo el de ahora. */
const enPlena = new Date('2026-11-25T16:30:00Z');
const e2 = proximoEncuentroAcordado(enPlena);
ok(e2 !== null && e2.cuando.toISOString() === '2026-11-25T16:00:00.000Z',
  'el que arrancó hace media hora todavía es el de ahora');

/* Jueves a la noche: el próximo es el martes siguiente, no el viernes. */
const jueves = new Date('2026-11-26T23:00:00Z');
const e3 = proximoEncuentroAcordado(jueves);
ok(e3 !== null && e3.cuando.getUTCDay() === 2,
  'después del jueves, el próximo es martes');

/* Y pasada la fecha de corte, nada: no se cita a una reunión que no existe. */
ok(proximoEncuentroAcordado(new Date('2026-12-15T13:00:00Z')) === null,
  'pasada la fecha acordada, no hay encuentro que mostrar');
ok(/hasta:/.test(encuentro) && ENCUENTROS_ACORDADOS.hasta >= '2026-12-10',
  'el calendario acordado tiene fecha de corte escrita');
ok(/de Argentina/.test(cuandoSeDice(new Date('2026-11-25T16:00:00Z'))),
  'la hora se dice con su huso, para el que está en México');

console.log('\n══ 9) y la grupal cargada por el equipo le gana al calendario ══');

ok(/proximasGrupales\(1\)/.test(comunidadEnHoy),
  'primero se mira lo que el equipo cargó');
ok(/proximoEncuentroAcordado\(\)/.test(comunidadEnHoy),
  'y el calendario acordado es el respaldo');
ok(comunidadEnHoy.indexOf('proximasGrupales') < comunidadEnHoy.indexOf('proximoEncuentroAcordado'),
  'en ese orden: lo cargado es la verdad');

console.log('\n══ 10) el cron alcanza los paisajes sin romperse en frío ══');

/*
 * `api/` corre en Node ESM puro: un import relativo sin `.js` es
 * ERR_MODULE_NOT_FOUND en el primer arranque. El cron ahora alcanza
 * `losCincoPaisajes`, así que SUS imports también cuentan — es el mismo
 * defecto que tuvo callada la alarma de inactividad hasta el 19 de noviembre.
 */
const relativosSinJs = [...paisajes.matchAll(/from\s+'(\.\.?\/[^']*)'/g)]
  .map((m) => m[1])
  .filter((r) => !/\.(js|json|css)$/.test(r));
ok(relativosSinJs.length === 0,
  'los imports de `losCincoPaisajes` llevan `.js`: el cron los alcanza',
);
if (relativosSinJs.length) console.log('   →', relativosSinJs.join(', '));

console.log(fallas === 0 ? '\n✅ LA ENTREGA UNIDA EN VERDE' : `\n❌ ${fallas} FALLAS`);
process.exit(fallas === 0 ? 0 : 1);
