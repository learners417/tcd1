/**
 * Pruebas del soporte y del guardado de lo que el cliente escribe.
 *
 * Lo que se juega: en un producto de miles, tres días de silencio es la
 * diferencia entre un cliente y un reembolso. Y perder lo que escribió en sus
 * sesiones es perder lo único que justifica lo que pagó.
 *
 * Correr con: npx tsx scripts/prueba-soporte.ts
 */
import {
  COMPROMISO, mensajesQueEsperan, saludDelSoporte,
} from '../src/lib/soporte';
import { servicioDe, cuadroDe, avanceDe } from '../src/lib/cuadroTickets';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const haceHoras = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const msg = (x: Partial<Parameters<typeof mensajesQueEsperan>[0][0]>) => ({
  id: 'm', clienteId: 'a', nombre: 'Rosana', texto: 'hola',
  creadoEn: haceHoras(1), respondido: false, ...x,
});

console.log('══ el compromiso, dicho ══');
linea(COMPROMISO.duda.horas === 24 && COMPROMISO.roto.horas === 4,
  'una duda espera 24 horas, algo roto 4');
linea(COMPROMISO.duda.horas > COMPROMISO.roto.horas,
  'son distintos a propósito: algo roto le está costando dinero AHORA');
linea(COMPROMISO.roto.vaA === 'absorber' && COMPROMISO.duda.vaA === 'destrabar',
  'y van a funciones distintas: lo roto al dev, la duda a acompañamiento');
linea(COMPROMISO.duda.loQueSeDice.includes('24 horas'),
  'el cliente escucha el número, no una promesa vaga');

console.log('\n══ el mensaje sin responder aparece ══');
const uno = mensajesQueEsperan([msg({ creadoEn: haceHoras(2) })]);
linea(uno.length === 1 && !uno[0].vencido, 'dos horas: esperando, dentro de tiempo');
const vencido = mensajesQueEsperan([msg({ creadoEn: haceHoras(30) })]);
linea(vencido[0].vencido, 'treinta horas: vencido');
linea(vencido[0].lectura.includes('prometimos responder en 24'),
  'y la lectura recuerda el compromiso');
linea(vencido[0].lectura.includes('vale por tres'),
  'con lo que está en juego dicho');

linea(mensajesQueEsperan([msg({ respondido: true })]).length === 0,
  'lo respondido no aparece');
linea(mensajesQueEsperan([]).length === 0, 'sin mensajes no rompe');
linea(mensajesQueEsperan([msg({ creadoEn: 'fecha rota' })])[0].horas === 0,
  'una fecha rota no da horas negativas');

console.log('\n══ el orden ══');
const orden = mensajesQueEsperan([
  msg({ id: 'nuevo', creadoEn: haceHoras(1) }),
  msg({ id: 'viejo', creadoEn: haceHoras(40) }),
  msg({ id: 'roto', tipo: 'roto', creadoEn: haceHoras(6) }),
]);
linea(orden[0].id === 'viejo' || orden[0].id === 'roto',
  'lo vencido va primero, no lo que llegó primero');
linea(orden.findIndex((m) => m.id === 'roto') < orden.findIndex((m) => m.id === 'nuevo'),
  'y un error reportado pesa más que una duda reciente');
linea(orden[orden.length - 1].id === 'nuevo', 'lo que está dentro de tiempo va último');

console.log('\n══ lo roto se trata distinto ══');
const roto = mensajesQueEsperan([msg({ tipo: 'roto', creadoEn: haceHoras(1) })]);
linea(roto[0].lectura.includes('Va al dev, no a acompañamiento'),
  'un error dice a dónde va, aunque esté dentro de tiempo');
const rotoVencido = mensajesQueEsperan([msg({ tipo: 'roto', creadoEn: haceHoras(8) })]);
linea(rotoVencido[0].lectura.includes('le está costando dinero ahora'),
  'y vencido dice por qué no puede esperar');

console.log('\n══ la salud del soporte ══');
const sano = saludDelSoporte({ esperando: [], respondidosATiempo: 10, respondidosTarde: 0 });
linea(!sano.alerta && sano.pctATiempo === 100, `todo respondido: "${sano.titular}"`);

const conVencidos = saludDelSoporte({
  esperando: mensajesQueEsperan([msg({ creadoEn: haceHoras(40) })]),
  respondidosATiempo: 5, respondidosTarde: 1,
});
linea(conVencidos.alerta && conVencidos.titular.includes('más de lo que prometimos'),
  `con vencidos: "${conVencidos.titular}"`);
linea(conVencidos.masViejo >= 40, 'y dice cuánto lleva el más viejo');

const conRoto = saludDelSoporte({
  esperando: mensajesQueEsperan([msg({ tipo: 'roto', creadoEn: haceHoras(9) })]),
  respondidosATiempo: 5, respondidosTarde: 0,
});
linea(conRoto.titular.includes('error reportado'),
  'un error sin mirar manda sobre todo lo demás en el titular');

const alDia = saludDelSoporte({
  esperando: [], respondidosATiempo: 3, respondidosTarde: 7,
});
linea(alDia.alerta,
  'la bandeja vacía con 30% a tiempo IGUAL es alarma: se responde tarde y después se pone al día, y el cliente ya lo sintió');

const vacio = saludDelSoporte({ esperando: [], respondidosATiempo: 0, respondidosTarde: 0 });
linea(!vacio.alerta && vacio.titular.includes('Nadie escribió'),
  'una semana sin mensajes no es una alarma');

console.log('\n══ el servicio contratado, que no se adivina ══');
linea(servicioDe('ascenso') === 'ascenso' && servicioDe('instalacion') === 'instalacion',
  'lo que una persona marcó se respeta');
linea(servicioDe('verde') === 'base' && servicioDe('negro') === 'base',
  'un color del plan de ACCESO no compra servicio: antes «verde» figuraba con $5.000 de instalación contratada');
linea(servicioDe('inventado') === 'base',
  'un valor desconocido cae en el MÁS BAJO: mostrar de menos se arregla con un mensaje, mostrar de más hace trabajar al equipo gratis');
linea(servicioDe(null) === 'base' && servicioDe(undefined) === 'base',
  'y sin marcar tampoco se regala trabajo');

console.log('\n══ y el cuadro ahora se puede usar ══');
linea(cuadroDe('instalacion').filter((i) => !i.noAplica).length
    > cuadroDe('base').filter((i) => !i.noAplica).length,
  'el de La Instalación ve más ítems que el de La Base');
linea(avanceDe('instalacion', new Set()).total > 0,
  'y su avance se calcula sobre lo que le aplica');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
