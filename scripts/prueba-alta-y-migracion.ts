/**
 * EL ALTA Y LA MIGRACIÓN, EN UN SOLO MOVIMIENTO.
 *
 * ═══ LAS DOS COSAS QUE MIDE ═══
 *
 * 1 · QUE NINGÚN TEXTO PROMETA EL CAMINO. Cuatro pantallas le decían al
 *     cliente que al traer su trabajo «tu Camino queda al día». Ese flujo
 *     escribe su ADN y no toca el Camino: el cliente abría sus sesiones
 *     esperando encontrarlas cerradas y las encontraba abiertas. Y la que más
 *     mentía era la última, la de «listo», que mandaba a buscar las piezas
 *     que faltan «como sesiones pendientes en tu Camino», donde no están.
 *
 * 2 · QUE EL ALTA ABRA LA LLAVE. La migración se encendía solo desde Hoy, en
 *     una lista aparte. Dar de alta a alguien que ya trae su trabajo hecho
 *     eran dos pantallas y un viaje de vuelta por cada persona, y el segundo
 *     paso es el que se olvida.
 *
 * Correr con: npx tsx scripts/prueba-alta-y-migracion.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { evaluarMigracion, QUE_TRAER } from '../src/lib/migracionDelCliente';

let fallas = 0;
const ok = (c: boolean, q: string) => { console.log(c ? `✓ ${q}` : `✗ ${q}`); if (!c) fallas++; };
const leer = (r: string) => (existsSync(r) ? readFileSync(r, 'utf-8') : '');

const dash = leer('src/pages/Dashboard.tsx');
const mig = leer('src/pages/MiMigracion.tsx');
const libMig = leer('src/lib/migracionDelCliente.ts');
const admin = leer('src/pages/Admin.tsx');

// ── 1 · Ningún texto promete lo que no hace ───────────────────────────────
console.log('══ la promesa que no cumplía ══');
const DE_CARA_AL_CLIENTE = [
  ['el HOY del cliente', dash],
  ['la pantalla de traer', mig],
  ['el resumen del final', libMig],
] as const;
for (const [donde, texto] of DE_CARA_AL_CLIENTE) {
  // Se busca en el texto de cara al cliente, no en los comentarios: el
  // comentario que explica el arreglo nombra la frase vieja a propósito.
  const sinComentarios = texto
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  ok(!/Camino queda al d/.test(sinComentarios)
    && !/Camino qued[oó] cerrado/.test(sinComentarios)
    && !/sesion(es)? pendiente[s]? en tu Camino/.test(sinComentarios),
    `${donde} ya no promete que el Camino se actualiza`);
}
ok(/cargados en\s+tu ADN|cargados en tu ADN/.test(dash),
  'y dice lo que sí hace: queda cargado su ADN');
ok(/de donde salen\s*\n?\s*tus anuncios|de donde salen tus anuncios/.test(mig),
  'con el para qué sirve, que es lo que lo hace valer el rato que le lleva');
ok(/Tu ADN qued[oó] completo/.test(libMig),
  'el resumen del final habla del ADN, que es lo que se escribió');

// ── 2 · Lo que falta, donde de verdad se completa ─────────────────────────
console.log('\n══ lo que falta ══');
ok(/Compl[eé]talas abajo/.test(mig) && !/Completalas/.test(mig),
  'las piezas que faltan se escriben en esa misma pantalla, y sin voseo');
ok(/escr[íi]benos por Soporte/.test(mig),
  'y si guarda sin completarlas, el camino real es hablar con el equipo');
ok(!/queda como sesi[oó]n pendiente/.test(mig),
  'ya no las manda a buscar a un lugar donde no están');
const resumenFlojo = evaluarMigracion({ nicho: 'x'.repeat(40) }, []).resumen;
ok(/faltan 4 de 5/.test(resumenFlojo),
  `y el conteo sigue siendo exacto: "${resumenFlojo.slice(0, 44)}…"`);
ok(/activar/.test(evaluarMigracion({
  nicho: 'Acompaño a psicólogas que atienden hace años y cobran poco',
  posicionamiento: 'El único que trabaja el precio antes que la técnica de venta',
  matriz_a: 'No duermen pensando en la agenda y cobran menos de lo que vale',
  metodo_nombre: 'El Método de los Cuatro Umbrales',
  historia_150: 'Mi mamá atendió pacientes treinta años y nunca cobró lo que valía',
}, []).resumen), 'con las cinco, le dice que le toca activar');

// ── 3 · El alta abre la llave ─────────────────────────────────────────────
console.log('\n══ crear la cuenta y abrirle la migración, de una ══');
ok(/traeSuTrabajo: false,/.test(admin),
  'el alta tiene la decisión, apagada por defecto: no todo el que entra trae trabajo hecho');
ok(/habilitarMigracion\(signUpData\.user\.id, true\)/.test(admin),
  'y al crear la cuenta se abre la llave');
ok(/import \{ habilitarMigracion \} from '\.\.\/lib\/migracionDatos'/.test(admin),
  'por la función de la biblioteca: los nombres de los parámetros del RPC viven en un solo lugar');
ok((admin.match(/traeSuTrabajo: false/g) ?? []).length >= 2,
  'y el formulario se limpia con la decisión apagada: la siguiente alta arranca de cero');
ok(/Ya tiene su plan y su método hechos: que los traiga él/.test(admin),
  'el control dice de quién se trata, no «habilitar migración»');
ok(/Trae tu trabajo/.test(admin),
  'y el aviso de que salió bien dice qué va a ver el cliente al entrar');

// ── 4 · La lista de migraciones son clientes ──────────────────────────────
console.log('\n══ a quién se le ofrece migrarse ══');
const sql = leer('supabase/migrations/20261026_la_lista_de_migraciones_son_clientes.sql');
ok(/and not public\.es_del_equipo\(p\.id\)/.test(sql),
  'la lista deja fuera al equipo: mostraba a Lupe con un botón para migrarla');
ok(/create or replace function public\.estado_de_migraciones/.test(sql),
  'y se reemplaza la función, no se crea otra con otro nombre');

// ── 5 · El circuito, de punta a punta ─────────────────────────────────────
console.log('\n══ el camino completo ══');
ok(/signUp\(/.test(admin) && /password: nuevoForm\.password\.trim\(\)/.test(admin),
  'el alta crea una cuenta de verdad: el cliente entra con su email y su contraseña');
ok(/marcar_servicio/.test(admin),
  'con su escalón marcado, que es lo que hace correr el tope del Camino');
ok(/miEstadoDeMigracion/.test(dash) && /e\.habilitada && !e\.migradoEn/.test(dash),
  'con la llave abierta le aparece la tarjeta, y deja de aparecer cuando ya migró');
ok(/setCurrentPage\('migracion'\)/.test(dash),
  'y la tarjeta lleva a la pantalla, que está en las páginas válidas');
ok(/'migracion',/.test(leer('src/App.tsx')),
  'si no estuviera, al recargar caería en Hoy');
ok(QUE_TRAER.length === 4,
  'y se le piden las cuatro cosas por su nombre, no «pega tu información»');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
