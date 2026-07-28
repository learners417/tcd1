/**
 * Pruebas de los permisos.
 *
 * ES LO MÁS DELICADO DE TODA LA APP. Si esto falla, un empleado ve las
 * ventas del dueño o el rendimiento de un compañero. No hay forma de
 * deshacer eso: una vez que alguien lo vio, lo vio.
 *
 * Correr con: npx tsx scripts/prueba-permisos.ts
 */
import {
  ROLES, puedeVer, porQueNoVe, rolDe, momentosDe, momentoInicial,
  MOMENTOS, type Rol, type Categoria,
} from '../src/lib/permisos';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const TODOS: Rol[] = ['direccion', 'acompanamiento', 'desarrollo', 'produccion'];
const EMPLEADOS: Rol[] = ['acompanamiento', 'desarrollo', 'produccion'];
const TODAS: Categoria[] = [
  'dinero_tcd', 'motor_propio', 'costo_ia', 'rendimiento_equipo',
  'todos_los_clientes', 'ticket_del_cliente', 'numeros_del_cliente',
  'conversaciones', 'decisiones',
];

// ── 1 · LO QUE NO PUEDE PASAR NUNCA ────────────────────────────────────────
console.log('══ lo que ningún empleado puede ver ══');

for (const r of EMPLEADOS) {
  linea(!puedeVer(r, 'dinero_tcd'),
    `${ROLES[r].nombre} NO ve lo que factura TCD`);
  linea(!puedeVer(r, 'motor_propio'),
    `${ROLES[r].nombre} NO ve las ventas del dueño`);
  linea(!puedeVer(r, 'rendimiento_equipo'),
    `${ROLES[r].nombre} NO ve el rendimiento de sus compañeros`);
}

linea(TODAS.every((c) => puedeVer('direccion', c)),
  'dirección ve todo — es el único');

// ── 2 · Y LO QUE SÍ NECESITAN ──────────────────────────────────────────────
console.log('\n══ lo que sí necesitan para trabajar ══');

linea(puedeVer('acompanamiento', 'todos_los_clientes')
   && puedeVer('acompanamiento', 'numeros_del_cliente')
   && puedeVer('acompanamiento', 'conversaciones'),
  'soporte ve todos los clientes, sus números y sus conversaciones');
linea(puedeVer('acompanamiento', 'ticket_del_cliente'),
  'y el ticket, porque decide quién recibe persona y quién aviso automático');

linea(puedeVer('desarrollo', 'costo_ia'),
  'desarrollo SÍ ve el costo de la IA: optimizarlo es literalmente su trabajo');
linea(!puedeVer('desarrollo', 'dinero_tcd'),
  'pero no el ingreso: optimizar el costo de la app y el ingreso del negocio son dos cosas distintas');
linea(!puedeVer('desarrollo', 'conversaciones'),
  'y no las conversaciones: si atiende clientes, deja de construir');

linea(!puedeVer('produccion', 'todos_los_clientes'),
  'producción ve SOLO los clientes que le asignaron');
linea(!puedeVer('produccion', 'numeros_del_cliente'),
  'y ningún número: los números pueden condicionar mal una pieza');
linea(ROLES.produccion.ve.length === 1,
  `producción ve una sola categoría, la mínima para trabajar`);

// ── 3 · CADA NEGATIVA ESTÁ EXPLICADA ───────────────────────────────────────
console.log('\n══ cada negativa tiene su porqué escrito ══');
for (const r of EMPLEADOS) {
  const negadas = TODAS.filter((c) => !puedeVer(r, c));
  const sinExplicar = negadas.filter((c) => !porQueNoVe(r, c));
  linea(sinExplicar.length === 0,
    `${ROLES[r].nombre}: sus ${negadas.length} negativas están explicadas${sinExplicar.length ? ` — faltan ${sinExplicar.join(', ')}` : ''}`);
}
linea(EMPLEADOS.every((r) =>
  TODAS.filter((c) => !puedeVer(r, c)).every((c) => (porQueNoVe(r, c) ?? '').length > 30)),
  'y ninguna se despacha con una frase corta: cada una argumenta');

// ── 4 · LOS MOMENTOS ───────────────────────────────────────────────────────
console.log('\n══ los cuatro momentos ══');
linea(MOMENTOS.length === 4, 'son cuatro, no dieciséis');
linea(MOMENTOS.every((m) => m.cuando.length > 15),
  'cada uno dice CUÁNDO se abre — es lo que ordena el modo Admin');

linea(momentosDe('direccion').length === 4, 'dirección abre los cuatro');
for (const r of EMPLEADOS) {
  const m = momentosDe(r);
  linea(!m.some((x) => x.id === 'negocio'),
    `${ROLES[r].nombre} NO ve El Negocio`);
  linea(m.length === 3, `y ve los otros tres (${m.map((x) => x.id).join(', ')})`);
}

console.log('\n══ el costo de la IA no vive en El Negocio ══');
linea(puedeVer('desarrollo', 'costo_ia') && !momentosDe('desarrollo').some((m) => m.id === 'negocio'),
  'desarrollo ve el costo de la IA SIN entrar a la pantalla donde están las ventas del dueño');
{
}

linea(momentoInicial('acompanamiento') === 'hoy',
  'soporte entra por Hoy: su cola es su día entero');
linea(momentoInicial('direccion') === 'semana',
  'dirección entra por La Semana: si está todo verde, cierra y sigue vendiendo');
linea(momentoInicial('produccion') === 'clientes',
  'producción entra por Clientes: su trabajo es el material');

// ── 5 · LOS ROLES VIEJOS Y LO DESCONOCIDO ──────────────────────────────────
console.log('\n══ lo que llega de la base ══');
linea(rolDe('owner') === 'direccion', 'owner → dirección');
linea(rolDe('manager') === 'acompanamiento' && rolDe('staff') === 'acompanamiento',
  'manager y staff → soporte');
linea(rolDe('dev') === 'desarrollo' && rolDe('editor') === 'produccion',
  'dev → desarrollo · editor → producción');
linea(rolDe(null) !== 'direccion' && rolDe(undefined) !== 'direccion'
   && rolDe('cualquier_cosa') !== 'direccion',
  'NADA desconocido cae en dirección — es la regla que no se rompe');
linea(rolDe('') === 'acompanamiento',
  'lo desconocido cae en el rol más acotado que igual pueda trabajar');

// ── 6 · NADIE GANA PERMISOS SIN QUE SE VEA ─────────────────────────────────
console.log('\n══ la regla estructural ══');
const total = (r: Rol) => ROLES[r].ve.length;
linea(total('direccion') > total('acompanamiento')
   && total('acompanamiento') > total('desarrollo')
   && total('desarrollo') > total('produccion'),
  `los permisos van de más a menos: ${TODOS.map((r) => `${r.slice(0, 4)}=${total(r)}`).join(' > ')}`);
linea(TODOS.every((r) => ROLES[r].indicador.length > 40),
  'cada rol tiene UN número que lo mide');
linea(TODOS.every((r) => ROLES[r].techoHoras > 0),
  'y un techo de horas');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
