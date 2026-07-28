/**
 * Pruebas de la jornada y del marcador.
 *
 * Correr con: npx tsx scripts/prueba-jornada.ts
 */
import {
  iniciarJornada, cerrarJornada, minutosDe, estaAbierta,
  quienEstaEnQue, cuentasPisadas, armarMarcador, comoVaElCirculo,
  HORAS_PARA_CERRAR_SOLA, type Jornada,
} from '../src/lib/jornada';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const hace = (h: number) => new Date(Date.now() - h * 3600000);

console.log('══ entrada y salida ══');
const j = iniciarJornada('lupe', ['a', 'b'], hace(5));
linea(estaAbierta(j), 'recién empezada, está abierta');
linea(minutosDe(j) === 0, 'y todavía no suma minutos');
linea(j.dia.length === 10, 'guarda el día');

const cerrada = cerrarJornada(j, { cerradas: ['t1'], atendidos: ['a', 'b'] }, new Date());
linea(!estaAbierta(cerrada), 'cerrada ya no está abierta');
linea(minutosDe(cerrada) >= 295 && minutosDe(cerrada) <= 305,
  `cinco horas dan ${minutosDe(cerrada)} minutos`);

console.log('\n══ lo que no puede ensuciar el número ══');
const olvidada = cerrarJornada(iniciarJornada('x', [], hace(30)), { cerradas: [], atendidos: [] });
linea(minutosDe(olvidada) === HORAS_PARA_CERRAR_SOLA * 60,
  `una jornada de 30 horas se topea en ${HORAS_PARA_CERRAR_SOLA}: es alguien que se olvidó de cerrar, no que trabajó 30 horas`);
linea(!estaAbierta(iniciarJornada('x', [], hace(20))),
  'y una abierta hace 20 horas ya no cuenta como abierta');
const alReves = cerrarJornada({ ...iniciarJornada('x', []), inicio: new Date().toISOString() }, { cerradas: [], atendidos: [] }, hace(2));
linea(minutosDe(alReves) === 0, 'un cierre anterior al inicio da cero, no negativo');

console.log('\n══ que dos no atiendan lo mismo ══');
const dos: Jornada[] = [
  iniciarJornada('lupe', ['rosana', 'ana'], hace(2)),
  iniciarJornada('marcos', ['rosana'], hace(1)),
];
linea(quienEstaEnQue(dos).get('rosana')?.length === 2, 'la app sabe que dos están en Rosana');
linea(cuentasPisadas(dos).includes('rosana'), 'y la marca como pisada');
linea(!cuentasPisadas(dos).includes('ana'), 'la que atiende uno solo no se marca');
linea(cuentasPisadas([]).length === 0, 'sin jornadas no rompe');
linea(cuentasPisadas([cerrarJornada(dos[0], { cerradas: [], atendidos: [] }), dos[1]]).length === 0,
  'una jornada cerrada ya no pisa a nadie');

console.log('\n══ el marcador: que todos los clientes vendan ══');
const m = armarMarcador({
  clientesActivos: 11, clientesQueVendieron: 7, clientesEnRojo: 2,
  facturadoClientes: 9000, minutosTotales: 480, trabasDelSistema: 0,
});
linea(m.pctVendiendo === 64, `7 de 11 es ${m.pctVendiendo}%`);
linea(m.minutosPorCliente === 44, `y cuesta ${m.minutosPorCliente} minutos por cliente`);
linea(m.titular.includes('no vendieron'), `el titular señala lo que falta: "${m.titular}"`);

const conTraba = armarMarcador({
  clientesActivos: 11, clientesQueVendieron: 10, clientesEnRojo: 0,
  facturadoClientes: 12000, minutosTotales: 400, trabasDelSistema: 2,
});
linea(conTraba.titular.includes('trabas repetidas'),
  'una traba repetida manda sobre todo lo demás, aunque casi todos vendan');
linea(conTraba.titular.includes('todas las semanas'),
  'y dice por qué importa: va a seguir costando trabajo cada semana');

const todos = armarMarcador({
  clientesActivos: 11, clientesQueVendieron: 11, clientesEnRojo: 0,
  facturadoClientes: 15000, minutosTotales: 300, trabasDelSistema: 0,
});
linea(todos.titular.includes('repetir'), `con todos vendiendo: "${todos.titular}"`);

const vacio = armarMarcador({
  clientesActivos: 0, clientesQueVendieron: 0, clientesEnRojo: 0,
  facturadoClientes: 0, minutosTotales: 0, trabasDelSistema: 0,
});
linea(vacio.pctVendiendo === 0 && vacio.minutosPorCliente === 0,
  'sin clientes no divide por cero');

console.log('\n══ cómo va el círculo ══');
const antes = armarMarcador({
  clientesActivos: 11, clientesQueVendieron: 5, clientesEnRojo: 3,
  facturadoClientes: 5000, minutosTotales: 700, trabasDelSistema: 0,
});
const bien = comoVaElCirculo(armarMarcador({
  clientesActivos: 11, clientesQueVendieron: 8, clientesEnRojo: 1,
  facturadoClientes: 9000, minutosTotales: 500, trabasDelSistema: 0,
}), antes);
linea(bien.sano && bien.texto.includes('círculo funcionando'),
  'venden más y cuestan menos: el círculo funciona');

const comprado = comoVaElCirculo(armarMarcador({
  clientesActivos: 11, clientesQueVendieron: 8, clientesEnRojo: 1,
  facturadoClientes: 9000, minutosTotales: 1100, trabasDelSistema: 0,
}), antes);
linea(!comprado.sano && comprado.texto.includes('no escala'),
  'venden más pero cuesta más: se está comprando resultado con horas');

const aliviado = comoVaElCirculo(armarMarcador({
  clientesActivos: 11, clientesQueVendieron: 4, clientesEnRojo: 3,
  facturadoClientes: 4000, minutosTotales: 400, trabasDelSistema: 0,
}), antes);
linea(!aliviado.sano && aliviado.texto.includes('todavía no está resolviendo'),
  'cuesta menos pero no venden más: alivia, no resuelve');

linea(comoVaElCirculo(antes, null).texto.includes('Primera semana'),
  'la primera semana no inventa una comparación');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
