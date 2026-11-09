/**
 * prueba-la-radiografia-se-retoma.ts — volver es seguir, no empezar de nuevo.
 *
 * ═══ QUÉ PROTEGE ═══
 *
 * Javo eligió que la entrada sea UN tramo largo y aceptó su riesgo con nombre:
 * «el que abandona a los 9 minutos se queda sin dictamen, sin calendario y sin
 * nada, y ya pagó». El mapa pedía por eso guardar cada tramo apenas se
 * contesta.
 *
 * ═══ LO QUE SE MIDIÓ EL 9 DE NOVIEMBRE, ANTES DE TOCAR ═══
 *
 * La bienvenida ya guardaba cada tramo al apretar el botón y ya recordaba en
 * qué paso quedó. Lo que faltaba era la vuelta, y faltaba en dos sitios:
 *
 *   1. De veinte campos, UNO volvía a leerse al abrir (los seis números). Los
 *      otros diecinueve arrancaban vacíos: el que recargaba caía en el paso
 *      correcto con el formulario en blanco.
 *   2. Cuatro de esos campos no se guardaban en ninguna parte — energía,
 *      frustración, lo que facturó el mes y las horas de su semana. Se
 *      preguntaban y se tiraban.
 *
 * ═══ CÓMO SE PRUEBA ═══
 *
 * Primero el módulo, ejercitado de verdad con un localStorage real: se anota,
 * se lee, y se comprueba que vuelve. Después la pantalla, estructuralmente:
 * que ningún campo de respuesta nazca vacío y que las cuatro del perfil viajen
 * en el único escritor del jsonb.
 *
 * Se corre así:
 *   npx tsx --import ./scripts/entorno-navegador.mjs scripts/prueba-la-radiografia-se-retoma.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * UN TELÉFONO DE MENTIRA, PROPIO.
 *
 * La batería de la casa corre cada lente con `npx tsx` pelado —ocho en
 * paralelo, sin el entorno de navegador— porque todas las demás son funciones
 * puras. Esta no puede serlo: lo que prueba es justamente que algo SOBREVIVA
 * en el teléfono del cliente. Así que trae su propio `localStorage`, y si
 * alguien la corre con el entorno de navegador usa el de verdad.
 */
if (typeof globalThis.localStorage === 'undefined') {
  const caja = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => (caja.has(k) ? caja.get(k)! : null),
      setItem: (k: string, v: string) => { caja.set(k, String(v)); },
      removeItem: (k: string) => { caja.delete(k); },
      clear: () => { caja.clear(); },
      key: (i: number) => [...caja.keys()][i] ?? null,
      get length() { return caja.size; },
    },
  });
}

const {
  anotar, leerBorrador, leerRespuestas, olvidarBorrador,
  tramosConRespuesta, tramosEnBlanco, TRAMOS, CLAVE_BORRADOR,
  ENERGIA_POR_DEFECTO, RESPUESTAS_VACIAS,
} = await import('../src/lib/laRadiografia');

const raiz = join(import.meta.dirname, '..');
const leerArchivo = (p: string) => readFileSync(join(raiz, p), 'utf8');

let fallas = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { console.log(`  ✗ ${msg}`); fallas++; }
};

const limpiar = () => { localStorage.clear(); };

/* ═══ 1 · EL BORRADOR, EJERCITADO ═══════════════════════════════════════════ */
console.log('\n── lo que tipeó vuelve ──');
limpiar();

anotar({ freno: 'No sé cobrar' });
ok(leerRespuestas().freno === 'No sé cobrar', 'una respuesta anotada vuelve tal cual');

anotar({ nicho: 'mujeres de 40-55' });
ok(
  leerRespuestas().freno === 'No sé cobrar' && leerRespuestas().nicho === 'mujeres de 40-55',
  'y anotar la segunda no borra la primera — se mezcla, no se reemplaza',
);

/*
 * EL CASO QUE ROMPÍA EN LA VIDA REAL: nueve minutos adentro, la pestaña se
 * descarta, vuelve. Eso es exactamente releer el módulo desde cero con el
 * mismo localStorage.
 */
console.log('\n── nueve minutos adentro, la pestaña se descarta, vuelve ──');
limpiar();
anotar({
  especialidad: 'Nutricionista', pais: 'MX',
  energia: 3, frustracion: 'Agenda llena, cuenta vacía',
  ingresos_mensuales: '1800', horas_semana: '46',
});
const vuelta = leerRespuestas();
ok(vuelta.especialidad === 'Nutricionista', 'su especialidad sigue elegida');
ok(vuelta.pais === 'MX', 'su país sigue elegido');
ok(vuelta.energia === 3, 'su energía sigue en 3 y no vuelve al 5 del medio');
ok(vuelta.frustracion === 'Agenda llena, cuenta vacía', 'su frustración sigue escrita');
ok(vuelta.ingresos_mensuales === '1800', 'lo que facturó el mes sigue ahí');
ok(vuelta.horas_semana === '46', 'y las horas de su semana también');

/*
 * Las cuatro de arriba son las que antes no se guardaban en NINGUNA parte. Si
 * alguien las vuelve a sacar del borrador, estas cuatro líneas se ponen rojas.
 */

console.log('\n── el cero y el vacío no son lo mismo ──');
limpiar();
anotar({ energia: 1 });
ok(leerRespuestas().energia === 1, 'una energía de 1 vuelve como 1, no como el 5 por defecto');
limpiar();
ok(
  leerRespuestas().energia === ENERGIA_POR_DEFECTO,
  'y sin nada anotado arranca en el medio, que es lo que muestra la pantalla',
);
limpiar();
anotar({ numeros: { facturacion: 0 } });
ok(leerRespuestas().numeros.facturacion === 0, 'un número en cero es una respuesta, no un hueco');

console.log('\n── la situación es un objeto y se mezcla campo por campo ──');
limpiar();
anotar({ situacion: { ...RESPUESTAS_VACIAS.situacion, horas_libres: '4' } });
anotar({ situacion: { ...leerRespuestas().situacion, mercado: 'personas' } });
const sit = leerRespuestas().situacion;
ok(sit.horas_libres === '4' && sit.mercado === 'personas', 'sus dos respuestas conviven');
ok(sit.garantia === '', 'y lo que no contestó sigue vacío, no indefinido');

console.log('\n── lo ya guardado por los pasos también vuelve ──');
limpiar();
/* Esto es un teléfono de alguien que completó la bienvenida ANTES de que el
   borrador existiera: solo tiene las llaves de los pasos. */
localStorage.setItem('tcd_diagnostico', JSON.stringify({ freno: 'Me da culpa cobrar', nicho: 'post-parto' }));
localStorage.setItem('tcd_origen_v1', JSON.stringify({ porque: 'Mi mamá' }));
localStorage.setItem('tcd_estilo_mentor', 'guantes');
localStorage.setItem('tcd_pacto', JSON.stringify({ texto: 'Lo hago', firma: 'Ana' }));
const viejo = leerRespuestas();
ok(viejo.freno === 'Me da culpa cobrar', 'el freno guardado por el paso vuelve');
ok(viejo.nicho === 'post-parto', 'y el nicho también');
ok(viejo.porque === 'Mi mamá', 'y su origen');
ok(viejo.estilo === 'guantes', 'y el estilo del Mentor que eligió');
ok(viejo.pacto_texto === 'Lo hago' && viejo.pacto_firma === 'Ana', 'y su pacto, firmado');

/* La base guarda el nicho bajo otro nombre que el teléfono. Las dos existen. */
limpiar();
localStorage.setItem('tcd_diagnostico', JSON.stringify({ nicho_hipotesis: 'deportistas' }));
ok(leerRespuestas().nicho === 'deportistas', 'el nicho vuelve con el nombre de la base también');

console.log('\n── el borrador manda porque es lo más nuevo ──');
limpiar();
localStorage.setItem('tcd_diagnostico', JSON.stringify({ freno: 'lo viejo' }));
anotar({ freno: 'lo que acabo de tipear' });
ok(leerRespuestas().freno === 'lo que acabo de tipear', 'lo tipeado recién le gana a lo guardado antes');
ok(
  leerRespuestas().nicho === '',
  'y un borrador a medias no borra lo guardado: lo que no anotó se lee de abajo',
);

console.log('\n── y al cerrar la bienvenida el borrador se va ──');
limpiar();
anotar({ freno: 'algo' });
ok(leerBorrador().freno === 'algo', 'el borrador existe mientras contesta');
olvidarBorrador();
ok(Object.keys(leerBorrador()).length === 0, 'y al cerrar no queda nada colgado');
ok(localStorage.getItem(CLAVE_BORRADOR) === null, 'ni la llave');

console.log('\n── los tramos saben cuál ya tiene algo ──');
limpiar();
ok(tramosConRespuesta().length === 0, 'una bienvenida recién abierta no tiene ningún tramo contestado');
ok(tramosEnBlanco().length === TRAMOS.length, 'y le faltan todos');
anotar({ freno: 'x', porque: 'y' });
const con = tramosConRespuesta();
ok(con.includes('diagnostico') && con.includes('origen'), 'con dos respuestas, dos tramos empezados');
ok(!tramosEnBlanco().includes('diagnostico'), 'y el empezado deja de estar en blanco');
/* La energía por defecto no es una respuesta: el perfil sigue en blanco. */
ok(
  tramosEnBlanco().includes('perfil'),
  'y el perfil sigue en blanco aunque la energía traiga su valor del medio',
);

/* ═══ 2 · Y LA PANTALLA LO USA ═══════════════════════════════════════════════
 *
 * El módulo puede estar perfecto y la bienvenida seguir naciendo vacía: eso
 * era justo el bug. Así que acá se mira la pantalla.
 */
console.log('\n── ningún campo de la bienvenida nace vacío ──');
const wizard = leerArchivo('src/components/WelcomeWizard.tsx');

ok(
  /import \{[^}]*leerRespuestas[^}]*\} from '\.\.\/lib\/laRadiografia';/.test(wizard),
  'la bienvenida lee las respuestas del módulo',
);
ok(/useState<Respuestas>\(\(\) => leerRespuestas\(\)\)/.test(wizard), 'y las lee una vez al abrir');
ok(/olvidarBorrador\(\)/.test(wizard), 'y limpia el borrador al cerrar');

/*
 * LA LENTE CONTRA SU PROPIO FALLO.
 *
 * El defecto se reintroduce de una sola forma: devolviendo un campo de
 * respuesta a `useState` con un valor vacío. Así que se listan los campos de
 * respuesta por su nombre REAL en la pantalla y se exige que ninguno nazca de
 * `useState`. Volver cualquiera de estos a `useState('')` pone esto rojo.
 */
const CAMPOS_DE_RESPUESTA = [
  'medicionEntrada', 'dxAvatar', 'dxFreno', 'dxNicho', 'dxDinero', 'dxTiempo',
  'dxEstilo', 'dxFe', 'dxLlegan', 'dxEntrega', 'dxPublica',
  'ogPorque', 'ogHerida', 'ogPaciente', 'situacion', 'ruedaIni', 'pqIni',
  'pactoTexto', 'pactoFirma', 'especialidad', 'especialidadOtro', 'pais',
  'ingresosMensuales', 'horasSemana', 'frustracion', 'energia',
];
const naceVacio: string[] = [];
const sinAnotar: string[] = [];
for (const campo of CAMPOS_DE_RESPUESTA) {
  const decl = new RegExp(`const \\[${campo}, set\\w+\\] = (useState|useAnotado)`, 'g');
  const m = [...wizard.matchAll(decl)];
  if (m.length === 0) { sinAnotar.push(`${campo} (no se encontró)`); continue; }
  if (m.some((x) => x[1] === 'useState')) naceVacio.push(campo);
}
ok(
  naceVacio.length === 0,
  naceVacio.length === 0
    ? `los ${CAMPOS_DE_RESPUESTA.length} campos de respuesta nacen de lo que ya contestó`
    : `nacen vacíos y se pierden al recargar: ${naceVacio.join(', ')}`,
);
ok(sinAnotar.length === 0, sinAnotar.length === 0 ? 'y los veintiséis siguen estando' : `faltan: ${sinAnotar.join(', ')}`);

/*
 * Y el hook anota en la misma tecla. Si alguien lo cambia por un efecto que
 * guarda al final, el que cierra la pestaña a los nueve minutos pierde el
 * tramo otra vez.
 */
ok(
  /function useAnotado[\s\S]{0,900}anotar\(\{ \[campo\]: v \}/.test(wizard),
  'y cada tecla anota, no solo el botón',
);

console.log('\n── las cuatro del perfil tienen dónde caer ──');
/*
 * Tienen que viajar en `payloadDiagnostico`, que es el ÚNICO escritor del
 * jsonb. Agregarlas en otra escritura las borraría — ese fue el bug del 8 de
 * noviembre, un UPDATE de jsonb reemplaza el valor entero.
 */
const payload = wizard.match(/const payloadDiagnostico = \(conSituacion: boolean\) => \(\{[\s\S]*?\n  \}\);/);
ok(Boolean(payload), 'el compositor del jsonb sigue siendo uno solo');
if (payload) {
  for (const campo of ['energia', 'frustracion', 'ingresos_mensuales', 'horas_semana']) {
    ok(new RegExp(`\\b${campo}\\b`).test(payload[0]), `\`${campo}\` viaja en el compositor`);
  }
}
/* Y nadie más escribe el borrador: un segundo escritor es un segundo bug. */
const escritores = [...wizard.matchAll(new RegExp(`localStorage\\.setItem\\('${CLAVE_BORRADOR}'`, 'g'))].length;
ok(escritores === 0, 'y la bienvenida no escribe el borrador a mano');

console.log(
  fallas === 0
    ? '\n✅ volver es seguir: nada de lo que contestó se pierde\n'
    : `\n❌ ${fallas} falla(s)\n`,
);
process.exit(fallas === 0 ? 0 : 1);
