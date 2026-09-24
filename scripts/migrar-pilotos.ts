/**
 * migrar-pilotos.ts — deja a Pedro y a Sharyll listos para entrar al Camino nuevo.
 *
 * Imprime lo que hay que cargar en cada perfil y lo verifica antes: que la
 * fecha de arranque sea lunes, que lo que ya traen exista en el catálogo y que
 * su ventana de acceso sea la que compraron.
 *
 * Se corre con: npx tsx scripts/migrar-pilotos.ts
 */
import { YA_TIENES, diasEnRevision, proximoLunes } from '../src/lib/yaTienes';
import { estadoDeAcceso, cierreDeLaVentana, type TipoDeAcceso } from '../src/lib/ventanaDeAcceso';
import { SEED_ROADMAP_V2 } from '../src/lib/roadmapSeed';

interface Piloto {
  nombre: string;
  acceso: TipoDeAcceso;
  /** Lo que ya trae hecho, por su id del catálogo. */
  yaTiene: string[];
  /** Por qué se carga así. */
  porque: string;
}

const ARRANQUE = proximoLunes(new Date('2026-09-24T12:00:00'));

const PILOTOS: Piloto[] = [
  {
    nombre: 'Pedro',
    acceso: 'noventa',
    yaTiene: [],
    porque: 'Contrató los noventa días completos y todavía está buscando su avatar: entra de cero.',
  },
  {
    nombre: 'Sharyll',
    acceso: 'treinta',
    yaTiene: ['avatar', 'videos', 'pagina', 'agenda'],
    porque: 'Compró un mes. Ya eligió su nicho, grabó su video de venta y tiene landing y calendario andando: esas cuatro jornadas le quedan en revisión.',
  },
];

let fallas = 0;
const ok = (c: boolean, m: string, d = '') => { console.log(`${c ? '✓' : '✗'} ${m}${c || !d ? '' : ' — ' + d}`); if (!c) fallas++; };

const metas = SEED_ROADMAP_V2.flatMap((p) => p.metas);
const conTrabajo = metas.filter((m) => m.dia_asignado && (parseInt(m.tiempo_estimado ?? '0', 10) || 0) > 0).length;

console.log('\n── el arranque ──');
ok(new Date(`${ARRANQUE}T12:00:00`).getDay() === 1, `todos arrancan el lunes ${ARRANQUE}`);

for (const p of PILOTOS) {
  console.log(`\n── ${p.nombre} ──`);
  const inventados = p.yaTiene.filter((id) => !YA_TIENES.some((y) => y.id === id));
  ok(inventados.length === 0, 'lo que ya trae existe en el catálogo', inventados.join(', '));

  const revision = diasEnRevision(p.yaTiene);
  ok(revision.size === p.yaTiene.length, `${revision.size} jornadas le quedan en revisión`);

  const acceso = { tipo: p.acceso, inicio: ARRANQUE };
  const estado = estadoDeAcceso(acceso, ARRANQUE);
  ok(estado.abierto, `su Camino abre el día 1 y cierra el ${cierreDeLaVentana(acceso)}`);

  console.log(`  ${p.porque}`);
  console.log('  Para cargar en su perfil:');
  console.log(`    fecha_inicio: '${ARRANQUE}'`);
  console.log(`    acceso_tipo: '${p.acceso}'`);
  console.log(`    ya_tiene: ${JSON.stringify(p.yaTiene)}`);
  console.log(`  Hace ${conTrabajo - revision.size} jornadas completas y ${revision.size} de revisión.`);
  if (revision.size) {
    const dias = [...revision].sort((a, b) => a - b);
    console.log(`  Días en revisión: ${dias.join(', ')}`);
  }
}

console.log(fallas === 0 ? '\n✓ LOS DOS PILOTOS ESTÁN LISTOS PARA CARGAR\n' : `\n✗ ${fallas} FALLAS\n`);
process.exit(fallas === 0 ? 0 : 1);
