/**
 * Pruebas de los avisos.
 *
 * Lo que se juega: si la app avisa de más, el cliente deja de leer y los
 * avisos dejan de servir. Si avisa de menos, la persona vuelve a ser el
 * único que empuja — y eso es lo que estamos sacando.
 *
 * Correr con: npx tsx scripts/prueba-avisos.ts
 */
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
  situacion: 'El DM pierde a la gente.', accion: 'Revisar el DM.',
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

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
