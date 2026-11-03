/**
 * Pruebas de los avisos.
 *
 * Lo que se juega: si la app avisa de más, el cliente deja de leer y los
 * avisos dejan de servir. Si avisa de menos, la persona vuelve a ser el
 * único que empuja — y eso es lo que estamos sacando.
 *
 * Correr con: npx tsx scripts/prueba-avisos.ts
 */
import { readFileSync } from 'node:fs';
import {
  planificarAvisos, anotarEnviado, olvidarAviso, mandarAviso,
  mandarMensajeDelEquipo, HISTORIAL_VACIO, AVISOS_ANTES_DE_ESCALAR,
  type HistorialAvisos,
} from '../src/lib/avisosCliente';
import type { ItemCola } from '../src/lib/colaExcepciones';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const item = (x: Partial<ItemCola> = {}): ItemCola => ({
  clienteId: 'c1', nombre: 'Rosana', cuello: 'conv_a_agenda',
  situacion: 'El DM pierde a las personas.', accion: 'Revisar el DM.',
  como: 'Mensaje al cliente.', quien: 'la app',
  enRiesgo: 1000, semanasIgual: 0, yaSeIntento: false, ...x,
});

const SEM = '2026-W31';

// ── 1 · Qué se avisa y qué no ──────────────────────────────────────────────
console.log('══ qué se avisa ══');
const p1 = planificarAvisos([item()], HISTORIAL_VACIO, SEM);
linea(p1.aMandar.length === 1, 'un problema nuevo genera su aviso');
linea(p1.aMandar[0].titulo.length > 15, `con título escrito: "${p1.aMandar[0].titulo}"`);
linea(p1.aMandar[0].destino.startsWith('/'),
  'y con la pantalla donde se resuelve');

const paraPersona = planificarAvisos([item({ quien: 'operador' })], HISTORIAL_VACIO, SEM);
linea(paraPersona.aMandar.length === 0,
  'lo que ya atiende una persona NO se le avisa al cliente');

const sinPlantilla = planificarAvisos([item({ cuello: 'inventado' })], HISTORIAL_VACIO, SEM);
linea(sinPlantilla.aMandar.length === 0,
  'un cuello sin aviso escrito no se inventa: se saltea y queda en la cola');

// ── 2 · No repetir ─────────────────────────────────────────────────────────
console.log('\n══ no repetir ══');
let h: HistorialAvisos = HISTORIAL_VACIO;
h = anotarEnviado(h, p1.aMandar[0], SEM);
const p2 = planificarAvisos([item()], h, SEM);
linea(p2.aMandar.length === 0 && p2.repetidos === 1,
  'el mismo aviso NO sale dos veces en la misma semana');

const otraSemana = planificarAvisos([item()], h, '2026-W32');
linea(otraSemana.aMandar.length === 1,
  'a la semana siguiente sí vuelve a salir');
linea(otraSemana.aMandar[0].vecesEnviado === 1,
  'y sabe que ya se le había mandado una vez');

// ── 3 · Cuándo el aviso deja de alcanzar ───────────────────────────────────
console.log('\n══ cuándo escala ══');
let h2: HistorialAvisos = HISTORIAL_VACIO;
for (let i = 0; i < AVISOS_ANTES_DE_ESCALAR; i++) {
  const plan = planificarAvisos([item()], h2, `2026-W${30 + i}`);
  if (plan.aMandar[0]) h2 = anotarEnviado(h2, plan.aMandar[0], `2026-W${30 + i}`);
}
const trasInsistir = planificarAvisos([item()], h2, '2026-W40');
linea(trasInsistir.aMandar.length === 0 && trasInsistir.aEscalar.length === 1,
  `tras ${AVISOS_ANTES_DE_ESCALAR} avisos sin resultado, deja de avisarse y escala`);
linea(trasInsistir.aEscalar[0].vecesEnviado === AVISOS_ANTES_DE_ESCALAR,
  'y queda registrado cuántas veces se intentó');

// ── 4 · Cuando el problema se resuelve ─────────────────────────────────────
console.log('\n══ cuando se resuelve ══');
const olvidado = olvidarAviso(h2, 'c1', 'conv_a_agenda');
const despues = planificarAvisos([item()], olvidado, '2026-W41');
linea(despues.aMandar.length === 1,
  'resuelto el problema, el contador vuelve a cero y el aviso puede salir otra vez');
linea(despues.aMandar[0].vecesEnviado === 0, 'desde cero, no desde donde había quedado');

// Olvidar uno no borra los demás.
let h3 = anotarEnviado(HISTORIAL_VACIO, {
  clienteId: 'c1', clave: 'piezas', titulo: 't', descripcion: 'd', destino: '/x', vecesEnviado: 0,
}, SEM);
h3 = anotarEnviado(h3, {
  clienteId: 'c1', clave: 'close_rate', titulo: 't', descripcion: 'd', destino: '/x', vecesEnviado: 0,
}, SEM);
const soloUno = olvidarAviso(h3, 'c1', 'piezas');
linea(soloUno.enviados['c1|close_rate'] === 1 && !soloUno.enviados['c1|piezas'],
  'olvidar un aviso no borra los otros del mismo cliente');

// ── 5 · El camino de vuelta ────────────────────────────────────────────────
console.log('\n══ el camino de vuelta ══');
const mandados: unknown[] = [];
const crearOk = async (x: unknown) => { mandados.push(x); };
const crearRoto = async () => { throw new Error('sin red'); };

const ok = await mandarAviso(p1.aMandar[0], crearOk as never);
linea(ok && mandados.length === 1, 'el aviso llega al cliente dentro de la app');
linea((mandados[0] as { accion_url: string }).accion_url.startsWith('/'),
  'con el destino puesto, para que aterrice donde se resuelve');

const falla = await mandarAviso(p1.aMandar[0], crearRoto as never);
linea(falla === false, 'si no sale, lo dice y NO lanza');

const nota = await mandarMensajeDelEquipo('c1', 'Lupe', 'Grabá el martes.', '/campanas', crearOk as never);
linea(nota, 'una persona puede escribirle por el mismo canal');
linea((mandados[1] as { titulo: string }).titulo.includes('Lupe'),
  'y el cliente ve quién le escribió');
linea((mandados[1] as { tipo: string }).tipo === 'admin',
  'marcado como mensaje de una persona, no como aviso del sistema');

const vacia = await mandarMensajeDelEquipo('c1', 'Lupe', '   ', '/x', crearOk as never);
linea(vacia === false && mandados.length === 2,
  'una nota vacía no se manda');

// ── El disparador, que era lo que faltaba ─────────────────────────────────
//
// Toda la máquina de arriba estaba escrita y probada, y el cron insertaba el
// aviso DIRECTO sin pasar por ella. Así que las tres reglas no se aplicaban:
// el cliente recibía el mismo aviso todos los días y nada escalaba nunca.
console.log('\n── el cron pasa por las tres reglas ──');
const cron = readFileSync('api/cron/alarmas-inactividad.ts', 'utf-8');
linea(/planificarAvisos\(pendientes, historial/.test(cron),
  'el cron planifica en vez de insertar directo');
linea(/for \(const aviso of plan\.aMandar\)/.test(cron),
  'manda los que corresponden');
linea(/for \(const aviso of plan\.aEscalar\)/.test(cron),
  'y los que ya no alcanzan pasan a una persona: dos avisos sin cambio no es un cliente que no leyó');
linea(/el aviso automático no alcanzó/.test(cron),
  'con un título que le dice al equipo exactamente eso');
linea(!/titulo: texto\.titulo/.test(cron),
  'ya no queda ninguna inserción que se saltee el plan');
linea(/repetidos_evitados/.test(cron),
  'y el log dice cuántos avisos repetidos se evitaron, para poder verlo sin entrar a la base');

// ── El historial, por clave y no por título ───────────────────────────────
//
// El historial se derivaba comparando el TÍTULO de cada notificación contra
// el texto de AVISOS. Funcionaba hasta el día que alguien mejora un texto:
// ahí el historial de ese aviso vuelve a cero para todos, y a la mañana
// siguiente le sale desde el principio a quien ya lo recibió dos veces.
console.log('\n── el historial aguanta que se reescriban los textos ──');
linea(/\.select\('usuario_id, clave, created_at'\)/.test(cron),
  'el historial se lee por la columna clave');
linea(/\.not\('clave', 'is', null\)/.test(cron),
  'y solo mira las filas que son un aviso automático');
linea(!/claveDeTitulo/.test(cron),
  'ya no se reconoce el aviso por su texto: cambiar una palabra reseteaba la cuenta de todos');
linea(/clave: aviso\.clave/.test(cron),
  'y al mandarlo guarda la clave, que es lo que hace que mañana se pueda contar');
linea(/sem > h\.ultimaSemana\[id\]/.test(cron),
  'se queda con la semana más reciente, porque la consulta no viene ordenada');

// ── Los veinte avisos, no cuatro ──────────────────────────────────────────
//
// El cron decidía el cuello con cuatro condiciones escritas a mano, así que
// solo podían salir cuatro de los veinte avisos. Los otros dieciséis estaban
// escritos y no tenían forma de dispararse — y son los tramos donde el
// cliente se cae DESPUÉS de empezar a vender.
console.log('\n── el diagnóstico es uno solo ──');
linea(/encontrarDomino\(calcularCadena\(numerosDeFila\(fila\)/.test(cron),
  'el cron diagnostica con la misma cadena de valor que la cola del Admin');
linea(/paisesDe\.get\(id\) \?\? \[\]/.test(cron),
  'y con los países del cliente: sin ellos se juzga a toda la cartera contra la banda de México');
linea(!/it\.agendas \/ it\.conversaciones < 0\.15/.test(cron),
  'ya no quedan condiciones escritas a mano que solo alcanzaban para cuatro cuellos');
linea(/COLUMNAS_DE_SEMANA/.test(cron),
  'pide las mismas columnas, para que no le falte un dato que el Admin sí tiene');

const cadena = readFileSync('src/lib/valueChain.ts', 'utf-8');
linea(/alcance: num\(f\.alcance\)/.test(cadena),
  'y «alcance» llega al diagnóstico: la consulta lo traía y el mapeo lo tiraba');

// ── El reparto: la cola deja de ser una lista para mirar ──────────────────
console.log('\n── la cola termina en tareas de alguien ──');
const reparto = readFileSync('src/lib/avisosStorage.ts', 'utf-8');
const admin = readFileSync('src/pages/Admin.tsx', 'utf-8');
linea(/desdeLaCadena\(\{/.test(reparto),
  'el armador de tareas desde un cuello tiene quién lo llame');
linea(/crearDesdeElSistema\(tarea, asignarA\)/.test(reparto),
  'y la tarea se guarda: existe aunque nadie abra la pantalla');
linea(/repartirLaCola\(colaDeHoy/.test(admin),
  'el Admin reparte la cola que ya calculaba y mostraba sin usar');
linea(!/mandarAviso/.test(reparto),
  'y NO manda avisos: con los dos lados mandando, el cliente recibía el mismo dos veces');
linea(/historial_avisos/.test(reparto),
  'el historial viene de la base, que es el mismo que mira el cron');

const mig = readFileSync('supabase/migrations/20261019_los_avisos_salen.sql', 'utf-8');
linea(/es_del_equipo\(auth\.uid\(\)\)/.test(mig) && /p_usuario_id = auth\.uid\(\)/.test(mig),
  'y escribir un aviso en nombre de otro ya no se puede: era SECURITY DEFINER sin mirar quién llamaba');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
