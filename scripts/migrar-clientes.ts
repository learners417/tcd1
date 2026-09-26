/**
 * migrar-clientes.ts — deja a cada cliente listo para el Camino nuevo.
 *
 * Genera el SQL de cada uno: su lunes de arranque, su ventana de acceso y lo
 * que ya trae hecho. Y limpia el progreso del Camino viejo.
 *
 * Por qué se limpia: los códigos llevan el día adentro, y el orden cambió. Del
 * progreso guardado, una parte apunta a jornadas que ya no existen y otra
 * coincide por casualidad con una jornada distinta. Si se deja, el cliente
 * abre su Camino y encuentra días tildados que nunca hizo.
 *
 * Se corre con: npx tsx scripts/migrar-clientes.ts
 */
import { YA_TIENES, diasEnRevision, proximoLunes } from '../src/lib/yaTienes';
import { estadoDeAcceso, cierreDeLaVentana, type TipoDeAcceso } from '../src/lib/ventanaDeAcceso';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';

interface Cliente {
  nombre: string;
  /** El correo con el que entra a la app. */
  correo: string;
  acceso: TipoDeAcceso;
  yaTiene: string[];
  porque: string;
}

const ARRANQUE = proximoLunes();

/** Se completa acá y se vuelve a correr: el SQL sale con esos datos. */
const CLIENTES: Cliente[] = [
  { nombre: 'Pedro', correo: 'pedro@ejemplo.com', acceso: 'noventa', yaTiene: [],
    porque: 'Contrató los noventa días y está buscando su avatar: entra de cero.' },
  { nombre: 'Sharyll', correo: 'sharyll@ejemplo.com', acceso: 'treinta',
    yaTiene: ['avatar', 'videos', 'pagina', 'agenda'],
    porque: 'Compró un mes. Ya tiene su nicho, su video de venta, su landing y su calendario.' },
  { nombre: 'Ani', correo: 'ani@ejemplo.com', acceso: 'noventa',
    yaTiene: ['avatar', 'metodo', 'oferta', 'precio'],
    porque: 'Tiene su método TAMIM, su programa armado y su precio decidido.' },
];

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };
const conTrabajo = SEED_ROADMAP_V2.flatMap((p) => p.metas)
  .filter((m) => m.dia_asignado && (parseInt(m.tiempo_estimado ?? '0', 10) || 0) > 0).length;

console.log(`\n── todos arrancan el lunes ${ARRANQUE} ──`);
ok(new Date(`${ARRANQUE}T12:00:00`).getDay() === 1, 'la fecha de arranque es lunes');

const sql: string[] = [];
for (const c of CLIENTES) {
  console.log(`\n── ${c.nombre} ──`);
  const inventados = c.yaTiene.filter((id) => !YA_TIENES.some((y) => y.id === id));
  ok(inventados.length === 0, 'lo que ya trae existe en el catálogo', inventados.join(', '));
  const revision = diasEnRevision(c.yaTiene);
  const acceso = { tipo: c.acceso, inicio: ARRANQUE };
  ok(estadoDeAcceso(acceso, ARRANQUE).abierto, `su Camino cierra el ${cierreDeLaVentana(acceso)}`);
  console.log(`  ${c.porque}`);
  console.log(`  ${conTrabajo - revision.size} jornadas completas y ${revision.size} de revisión` +
              (revision.size ? ` (días ${[...revision].sort((a, b) => a - b).join(', ')})` : ''));

  sql.push(`-- ${c.nombre}: ${c.porque}
update public.profiles set
    fecha_inicio = '${ARRANQUE}',
    acceso_tipo  = '${c.acceso}',
    ya_tiene     = '${JSON.stringify(c.yaTiene)}'::jsonb
  where email = '${c.correo}';

delete from public.hoja_de_ruta
  where usuario_id = (select id from public.profiles where email = '${c.correo}');`);
}

console.log('\n══ EL SQL, PARA PEGAR EN SUPABASE ══\n');
console.log(`-- Antes de esto, corre la migración 20260926_hoja_de_ruta.sql.
-- El borrado es a propósito: el progreso del Camino viejo apunta a jornadas
-- que cambiaron de día, y dejarlo marca días que el cliente nunca hizo.\n`);
console.log(sql.join('\n\n'));

console.log(fallas === 0 ? '\n✓ LOS CLIENTES ESTÁN LISTOS PARA CARGAR\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
