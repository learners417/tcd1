/**
 * LA COLA DEL DÍA — doscientas cincuenta líneas que nunca se dibujaron.
 *
 * ═══ EL HUECO QUE CIERRA ═══
 *
 * `armarCola` estaba escrita y probada: ordena el trabajo del día por DINERO
 * EN RIESGO y decide qué resuelve la app sola y qué necesita una persona.
 * Nadie la llamaba. La pantalla de Hoy recibía `items={[]}` fijo.
 *
 * Consecuencias que se veían y parecían otra cosa:
 *   · La cabecera de la jornada decía siempre que no había nada que atender.
 *   · La barra de carga del rol medía cero, porque las excepciones salen de
 *     esa cola.
 *   · Y `semanasIgual` iba en cero fijo, así que un cliente que viene
 *     fallando cinco semanas no escalaba nunca a un humano: seguía esperando
 *     un aviso automático que ya se le mandó cuatro veces.
 *
 * Correr con: npx tsx scripts/prueba-cola-del-dia.ts
 */
import { readFileSync } from 'node:fs';
import {
  armarCola, resumirCola, SEMANAS_ANTES_DE_ESCALAR, type EntradaCola,
} from '../src/lib/colaExcepciones';
import { calcularCarga } from '../src/lib/roles';

let fallas = 0;
const ok = (cond: boolean, que: string) => {
  console.log(cond ? `✓ ${que}` : `✗ ${que}`);
  if (!cond) fallas++;
};

/** Una cuenta con un cuello de botella real. */
const rota = (x: {
  id: string; nombre: string; facturado: number;
  plan?: EntradaCola['plan']; semanasIgual?: number; urgencia?: number;
}): EntradaCola => ({
  clienteId: x.id, semana: '2026-W41',
  nombre: x.nombre,
  plan: x.plan ?? 'verde',
  semanasIgual: x.semanasIgual ?? 0,
  domino: {
    indicador: { id: 'no_agenda', brecha: x.urgencia ?? 2 } as never,
    tramo: null,
    titulo: 'Nadie agenda',
    porque: 'Llegan visitas y no dejan el teléfono.',
  },
  facturado: x.facturado, cobrado: x.facturado, ventas: 1, gasto: 100,
  urgencia: x.urgencia ?? 2, sinCargar: false,
});

const sana = (id: string, nombre: string): EntradaCola => ({
  clienteId: id, semana: '2026-W41', nombre, plan: 'verde', semanasIgual: 0,
  domino: { indicador: null, tramo: null, titulo: 'Todo en orden', porque: '' },
  facturado: 2000, cobrado: 2000, ventas: 3, gasto: 200,
  urgencia: 0, sinCargar: false,
});

const sinCargar = (id: string, nombre: string, semanasIgual = 0): EntradaCola => ({
  clienteId: id, semana: '2026-W41', nombre, plan: 'verde', semanasIgual,
  domino: { indicador: null, tramo: null, titulo: 'No cargó los números', porque: 'Sin datos no hay diagnóstico.' },
  facturado: 0, cobrado: 0, ventas: 0, gasto: 0,
  urgencia: Infinity, sinCargar: true,
});

// ── 1 · Solo lo que necesita atención ──────────────────────────────────────
console.log('══ la cola trae solo lo que hay que atender ══');
const cola = armarCola([
  sana('s1', 'Sana'),
  rota({ id: 'a', nombre: 'Ana', facturado: 200 }),
  rota({ id: 'b', nombre: 'Beto', facturado: 3000 }),
]);
ok(cola.length === 2, 'una cuenta sana no aparece: si aparecieran todas volvería a ser un tablero');
ok(cola.every((i) => i.nombre !== 'Sana'), 'y la sana no está');

console.log('\n══ el orden es por dinero en riesgo, no alfabético ══');
ok(cola[0].nombre === 'Beto',
  'la cuenta de $3.000 va antes que la de $200 aunque estén igual de rotas');
ok(cola[0].enRiesgo > cola[1].enRiesgo, 'con el monto en riesgo adentro');

console.log('\n══ quien la trabaja ejecuta, no diagnostica ══');
ok(cola[0].accion.length > 0 && cola[0].como.length > 0,
  `cada item trae la acción y el canal: "${cola[0].accion}"`);
ok(cola[0].cuello === 'no_agenda',
  'y el cuello explícito, para que nadie tenga que deducirlo leyendo el texto');

// ── 2 · La racha, que iba en cero fijo ─────────────────────────────────────
console.log('\n══ la racha decide si escala a una persona ══');
const primeraVez = armarCola([rota({ id: 'a', nombre: 'Ana', facturado: 1000, plan: 'verde', semanasIgual: 0 })]);
ok(primeraVez[0].quien === 'la app',
  'la primera semana la app avisa sola: cien clientes a un minuto cada uno rompen el modelo');

const insistiendo = armarCola([
  rota({ id: 'a', nombre: 'Ana', facturado: 1000, plan: 'verde', semanasIgual: SEMANAS_ANTES_DE_ESCALAR }),
]);
ok(insistiendo[0].quien === 'operador',
  `a las ${SEMANAS_ANTES_DE_ESCALAR} semanas iguales sube a una persona: el aviso automático ya no alcanzó`);
ok(insistiendo[0].yaSeIntento, 'y queda marcado que ya se intentó, para no repetir el mismo mensaje');

const cincoSemanas = armarCola([
  rota({ id: 'a', nombre: 'Ana', facturado: 1000, plan: 'verde', semanasIgual: 5 }),
]);
ok(cincoSemanas[0].quien === 'operador',
  'ESTE es el caso que la racha en cero escondía: cinco semanas fallando y nadie entraba nunca');

console.log('\n══ el plan alto no espera la racha ══');
ok(armarCola([rota({ id: 'a', nombre: 'Ana', facturado: 1000, plan: 'negro', semanasIgual: 0 })])[0].quien === 'operador',
  'quien paga el programa completo tiene persona desde la primera semana');

// ── 3 · No saber es peor que saber que va mal ──────────────────────────────
console.log('\n══ el que no cargó sus números ══');
const nadie = armarCola([sinCargar('a', 'Ana')]);
ok(nadie.length === 1 && nadie[0].cuello === 'no_cargo',
  'no haber cargado es un cuello de botella, no un hueco: sin datos no hay diagnóstico');
ok(/No cargó los números de esta semana/.test(nadie[0].situacion),
  'y se dice en una línea que se entiende sin saber de pauta');

// ── 4 · El titular de arriba ───────────────────────────────────────────────
console.log('\n══ el titular ══');
ok(/están sanas/.test(resumirCola([], 10).titular),
  'con todo en orden lo dice y no deja al equipo buscando');
const resumen = resumirCola(insistiendo, 10);
ok(/necesita que entres hoy/.test(resumen.titular),
  `y con trabajo pendiente dice cuánto: "${resumen.titular}"`);
ok(resumen.sanas === 9, 'contando las que no aparecen');
ok(resumirCola([], 0).titular === 'Todavía no hay cuentas cargadas.',
  'y sin clientes no dice que todo está sano, que sería mentira');

// ── 5 · La carga sale de la cola ───────────────────────────────────────────
console.log('\n══ la barra de carga ══');
const vacia = calcularCarga('acompanamiento', { excepciones: 0, sesiones: 0, enInstalacion: 0 });
ok(vacia.ocupacion === 0 && /Nada pendiente/.test(vacia.lectura),
  'con la cola en cero la barra dice que no hay nada — que es lo que decía SIEMPRE antes de conectarla');

const real = calcularCarga('acompanamiento', { excepciones: 4, sesiones: 9, enInstalacion: 3 });
ok(real.horas > vacia.horas, 'con el trabajo real la barra sube');
ok(!/trabaja más|trabajá más/.test(real.lectura),
  'y pasada de techo el aviso nunca es «trabaja más»: eso rompe el modelo en silencio');

// ── 6 · Dónde vive ─────────────────────────────────────────────────────────
console.log('\n══ dónde vive ══');
const admin = readFileSync('src/pages/Admin.tsx', 'utf-8');
const jornada = readFileSync('src/components/admin/Jornada.tsx', 'utf-8');

/** Las líneas de código, sin los comentarios: lo que se ejecuta de verdad. */
const codigoDe = (txt: string) => txt
  .split('\n')
  .filter((l) => !/^\s*(\*|\/\/)/.test(l))
  .join('\n');

ok(/items={cola}/.test(admin) && !/items={\[\]}/.test(codigoDe(admin)),
  'la pantalla de Hoy recibe la cola de verdad y ya no un arreglo vacío fijo');
ok(/armarCola\(comp\.map/.test(admin), 'armada con la comparativa de la semana');
ok(/rachasDeTodos\(ids\)/.test(admin),
  'y con las rachas reales: sin ellas la cola subestima el trabajo del equipo');
ok(/semanasIgual: rachas\.get\(f\.clienteId\)/.test(admin),
  'la racha entra en cada item, no en cero');
ok(!/semanasIgual: 0,/.test(admin), 'y no quedó ningún cero fijo');

ok(/mainTab !== 'mirol'/.test(admin),
  'la cola se carga también al abrir Mi rol, que la usa para medir la semana');
ok(/excepciones={cola\.filter/.test(admin),
  'y las excepciones de Mi rol salen de la misma cola: una sola definición');
ok(/sesiones,\n    enInstalacion,/.test(jornada),
  'la jornada ya no calcula su carga con sesiones e instalación en cero');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
