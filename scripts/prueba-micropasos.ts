/**
 * Pruebas del mapa único.
 *
 * Lo que se juega: si un cuello no mapea a nadie, el diagnóstico llega y no
 * hay a quién mandarlo. Y si un entrenador contesta de todo, deja de ser un
 * especialista y se vuelve un buscador con opinión.
 *
 * Correr con: npx tsx scripts/prueba-micropasos.ts
 */
import {
  MICRO_PASOS, NOMBRE_AREA, DE_QUE_SE_OCUPA, microPasoDe,
  briefingPara, bloqueDeDerivacion, agruparPorArea,
  type Entrenador,
} from '../src/lib/microPasos';
import { calcularCadena, SEMANA_VACIA } from '../src/lib/valueChain';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

console.log('══ el mapa cubre la cadena entera ══');
const cuellosReales = new Set(
  calcularCadena({ ...SEMANA_VACIA, precio: 1000 }).map((i) => i.id));
const mapeados = new Set(MICRO_PASOS.map((m) => m.cuello));
const sinMapear = [...cuellosReales].filter((c) => !mapeados.has(c));
linea(sinMapear.length === 0,
  sinMapear.length === 0
    ? `los ${cuellosReales.size} indicadores de la cadena tienen su micro-paso`
    : `SIN MAPEAR: ${sinMapear.join(', ')}`);
const inventados = [...mapeados].filter((c) => !cuellosReales.has(c));
linea(inventados.length === 0,
  inventados.length === 0
    ? 'y ninguno del mapa apunta a un indicador que no existe'
    : `INVENTADOS: ${inventados.join(', ')}`);

console.log('\n══ cada paso dice qué significa ══');
linea(MICRO_PASOS.every((m) => m.significa.length > 25),
  'cada uno explica en una línea de negocio, no de tablero');
linea(MICRO_PASOS.every((m) => m.paso.length > 3), 'y tiene nombre de paso del embudo');
linea(MICRO_PASOS.every((m) => m.entrenador !== null || m.a !== undefined),
  'lo que no es de un entrenador dice a quién va');

const tecnico = microPasoDe('comentario_a_conversacion')!;
linea(tecnico.entrenador === null && tecnico.a === 'dev',
  'la automatización rota va al dev, no a un entrenador — no tiene sentido entrenarlo en eso');
const retencion = microPasoDe('retencion')!;
linea(retencion.entrenador === 'bruno',
  'la renovación va a Bruno, que es el de post-venta — sostener al paciente hasta el resultado ES lo que hace que renueve');

// El mapa tiene que coincidir con lo que cada entrenador DICE QUE HACE en su
// configuración. Sacarlo del texto de las tarjetas ya me hizo equivocar en tres.
const ROLES_REALES: Record<string, string> = {
  sofi: 'Filtrado de Pacientes', lucas: 'Consulta de Venta',
  vera: 'Pricing y Oferta', diego: 'Constructor de Producto',
  mateo: 'Contenido Viral', caro: 'Cámara y Presencia',
  ramiro: 'Lectura de Números', bruno: 'Servicio Post-Venta',
};
linea(microPasoDe('close_rate')!.entrenador === 'lucas',
  'el cierre va a Lucas (Consulta de Venta), no a Diego (Constructor de Producto)');
linea(microPasoDe('pct_cobrado')!.entrenador === 'vera',
  'y el precio a Vera (Pricing y Oferta)');
linea(Object.keys(ROLES_REALES).every((e) => DE_QUE_SE_OCUPA[e as Entrenador]),
  'los ocho entrenadores reales están en el mapa');

console.log('\n══ el orden es el del embudo ══');
const orden = MICRO_PASOS.map((m) => m.cuello);
linea(orden.indexOf('gasto_ratio') < orden.indexOf('conv_a_agenda'),
  'el presupuesto va antes que la conversación');
linea(orden.indexOf('conv_a_agenda') < orden.indexOf('close_rate'),
  'la conversación antes que el cierre');
linea(orden.indexOf('close_rate') < orden.indexOf('retencion'),
  'y el cierre antes que la renovación — si no vende, no hay a quién retener');

console.log('\n══ el entrenador abre sabiendo ══');
const b = briefingPara({
  cuello: 'conv_a_agenda', nombreCliente: 'Rosana',
  evidencia: '18 conversaciones y 2 agendas esta semana',
});
linea(b !== null, 'hay briefing para un cuello de entrenador');
linea(b!.includes('ROSANA') && b!.includes('18 conversaciones'),
  'con el nombre y los números adentro');
linea(b!.includes('no se lo preguntes'),
  'y la instrucción que importa: ya lo sabe, que no se lo pregunte');
linea(b!.includes('no repitas los números'),
  'ni que los repita como un informe');

const conInsistencia = briefingPara({
  cuello: 'conv_a_agenda', nombreCliente: 'Rosana',
  evidencia: '18 y 2', semanasIgual: 3,
});
linea(conInsistencia!.includes('3ª semana') && conInsistencia!.includes('no está alcanzando'),
  'y si se repite, el entrenador lo sabe: lo de siempre no alcanza');

linea(briefingPara({ cuello: 'comentario_a_conversacion', nombreCliente: 'X', evidencia: 'y' }) === null,
  'lo que va al dev NO genera briefing: no se manda a nadie a hablar con un entrenador');

console.log('\n══ la derivación, para los ocho ══');
const TODOS: Entrenador[] = ['sofi', 'diego', 'mateo', 'caro', 'vera', 'ramiro', 'bruno', 'lucas'];
for (const e of TODOS) {
  const bl = bloqueDeDerivacion(e);
  const nombra = TODOS.filter((o) => o !== e).every((o) =>
    bl.toLowerCase().includes(o));
  linea(nombra, `${e} conoce a los otros siete y sabe qué hace cada uno`);
}
const diego = bloqueDeDerivacion('diego');
linea(diego.includes('NO improvises'),
  'Diego —que antes no derivaba nada— ahora tiene la regla');
linea(diego.includes('buscador con opinión'),
  'con el motivo: contestar de todo lo convierte en lo que el sanador ya tiene');
linea(diego.includes('equipo técnico') && diego.includes('Javo'),
  'y sabe que hay cosas que no son de ningún entrenador');
linea(!diego.toLowerCase().includes('· diego'),
  'y no se deriva a sí mismo');

console.log('\n══ la cola por área ══');
const items = [
  { cuello: 'conv_a_agenda', nombre: 'Rosana' },
  { cuello: 'conv_a_agenda', nombre: 'Marina' },
  { cuello: 'comentario_a_conversacion', nombre: 'Ana' },
  { cuello: 'close_rate', nombre: 'Diego' },
  { cuello: 'cpm', nombre: 'Luz' },
];
const g = agruparPorArea(items);
linea(g.length === 4, `cinco casos se agrupan en ${g.length} áreas`);
const setting = g.find((x) => x.area === 'setting')!;
linea(setting.items.length === 2,
  'los dos de conversación quedan juntos: mismo tema, mismo criterio, misma cabeza');
linea(setting.entrenador === 'sofi', 'y el grupo sabe a qué entrenador lleva');
linea(g[0].area === 'anuncio',
  'el orden es el del embudo: primero el anuncio, no lo que llegó primero');
linea(g.find((x) => x.area === 'tecnico')?.entrenador === null,
  'el grupo técnico no lleva a ningún entrenador');
linea(agruparPorArea([]).length === 0, 'sin casos no rompe');
linea(agruparPorArea([{ cuello: 'inventado' }]).length === 1,
  'un cuello desconocido NO se pierde: va al final, visible');

console.log('\n══ los nombres ══');
linea(Object.values(NOMBRE_AREA).every((n) => n.length > 4),
  'cada área tiene nombre en castellano');
linea(Object.values(DE_QUE_SE_OCUPA).every((d) => d.length > 20),
  'y cada entrenador dice de qué se ocupa, con suficiente detalle para derivarle');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
