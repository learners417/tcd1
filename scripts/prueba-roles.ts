/**
 * Pruebas de los roles.
 *
 * Lo que se juega: si el rol no dice qué NO le toca, dos personas hacen lo
 * mismo y una tercera cosa no la hace nadie. Y si el techo de carga avisa
 * "trabajá más" en vez de "arreglá lo que rompe las cuentas", el modelo se
 * cae en silencio.
 *
 * Correr con: npx tsx scripts/prueba-roles.ts
 */
import {
  ROLES, rolDe, tabsDe, puedeVer, calcularCarga, TRASPASO, MINUTOS,
  type Rol,
} from '../src/lib/roles';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const TODOS: Rol[] = ['direccion', 'acompanamiento', 'desarrollo'];

console.log('══ los tres roles ══');
linea(TODOS.every((r) => ROLES[r].proposito.length > 25),
  'cada uno dice para qué existe, en una línea');
linea(TODOS.every((r) => ROLES[r].leToca.length > 0),
  'cada uno sabe qué le toca');
linea(TODOS.every((r) => ROLES[r].noLeToca.length > 0),
  'y cada uno sabe qué NO le toca');
linea(TODOS.every((r) => ROLES[r].noLeToca.every((n) => n.porque.length > 30)),
  'con el motivo escrito, para que no se haga de memoria');
linea(TODOS.every((r) => ROLES[r].indicador.length > 40),
  'cada rol tiene UN número que dice si está haciendo bien su trabajo');

console.log('\n══ lo que no se pisa ══');
linea(ROLES.desarrollo.noLeToca.some((n) => n.que.includes('Atender clientes')),
  'desarrollo NO atiende clientes');
linea(ROLES.desarrollo.noLeToca.find((n) => n.que.includes('Atender'))!.porque
  .includes('deja de construir'),
  'y el motivo es el que importa: cada vez que lo hace, deja de construir lo que evitaría atenderlos');
linea(ROLES.acompanamiento.noLeToca.some((n) => n.que.includes('Decidir criterio')),
  'acompañamiento NO decide criterio nuevo');
linea(ROLES.direccion.noLeToca.some((n) => n.que.includes('cola')),
  'dirección NO entra por la cola: si lo hace, todo vuelve a pasar por una persona');

console.log('\n══ quién ve qué ══');
linea(puedeVer('direccion', 'cualquier-cosa'), 'dirección entra a todo');
linea(puedeVer('acompanamiento', 'hoy') && puedeVer('acompanamiento', 'supervision'),
  'acompañamiento ve la cola y la supervisión');
linea(!puedeVer('acompanamiento', 'plata'),
  'pero no la Mesa de plata: no es su decisión');
linea(puedeVer('desarrollo', 'motor'), 'desarrollo ve el panel del motor');
linea(!puedeVer('desarrollo', 'hoy'),
  'y NO ve la cola del día: si la ve, la termina atendiendo');
linea(tabsDe('acompanamiento')[0] === 'hoy',
  'lo primero que ve acompañamiento es la cola');

console.log('\n══ los roles viejos siguen funcionando ══');
linea(rolDe('owner') === 'direccion', 'owner → dirección');
linea(rolDe('manager') === 'acompanamiento' && rolDe('staff') === 'acompanamiento',
  'manager y staff eran el mismo permiso con dos nombres: los dos a acompañamiento');
linea(rolDe(null) === 'acompanamiento' && rolDe(undefined) === 'acompanamiento',
  'sin rol cargado se asume el más acotado, nunca dirección');

console.log('\n══ la carga ══');
const vacia = calcularCarga('acompanamiento', { excepciones: 0, sesiones: 0, enInstalacion: 0 });
linea(vacia.horas === 0 && !vacia.pasado, 'una semana sin nada da cero');

// La cuenta que sostiene el modelo: 20 clientes, ~10% en rojo, en 12 horas.
const real = calcularCarga('acompanamiento', { excepciones: 2, sesiones: 4, enInstalacion: 8 });
linea(real.horas <= ROLES.acompanamiento.techoHoras,
  `20 clientes con 2 excepciones, 4 sesiones y 8 en instalación: ${real.horas} h de ${real.techo} — entra`);
linea(!real.pasado, 'y no se pasa del techo');

const excedida = calcularCarga('acompanamiento', { excepciones: 12, sesiones: 8, enInstalacion: 15 });
linea(excedida.pasado, `con 12 excepciones y 15 instalaciones se pasa (${excedida.horas} h)`);
linea(excedida.lectura.includes('no se arregla con más horas'),
  'y el aviso NO es «trabajá más»');
linea(excedida.lectura.includes('rojo'),
  'sino que hay que mirar qué está poniendo tantas cuentas en rojo');

linea(MINUTOS.sesion > MINUTOS.excepcion,
  'una sesión cuesta más que atender una excepción, como en la vida real');

console.log('\n══ el traspaso ══');
linea(TODOS.every((r) => TRASPASO[r].length >= 2),
  'cada rol tiene su lista de traspaso');
linea(TODOS.every((r) => TRASPASO[r].every((p) => p.porque.length > 30)),
  'cada paso dice por qué importa, para que no se haga de memoria');
linea(TRASPASO.acompanamiento.some((p) => p.que.includes('Cargar la sesión')),
  'acompañamiento hereda la regla de cargar la sesión apenas termina');
linea(TRASPASO.desarrollo.some((p) => p.que.includes('COMO-FUNCIONA')),
  'desarrollo hereda leer el mapa antes de tocar nada');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
