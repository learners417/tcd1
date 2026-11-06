/**
 * NINGUNA PANTALLA SIN PUERTA
 *
 * ═══ EL BUG QUE ESTA LENTE EXISTE PARA QUE NO VUELVA ═══
 *
 * En julio, al mover la casa del plan de entrada, Mi Número quedó
 * INALCANZABLE: la calculadora del precio —el entregable central de ese
 * plan, lo que la landing vende— no estaba en el menú y ningún botón la
 * apuntaba. La pantalla existía, el router llevaba a ella, y no había forma
 * de llegar. Se cazó con una auditoría, de casualidad.
 *
 * Hoy se repite el movimiento y con cinco pantallas a la vez: Mi Número, el
 * Diario, Campañas, el Creador y Mi Clínica salen del menú y de la grilla de
 * El Camino para vivir adentro del día que las usa. Si alguna se queda sin
 * día que la abra, se vuelve invisible igual que entonces — solo que esta
 * vez serían cinco y nadie lo notaría hasta que un cliente preguntara dónde
 * está lo que le vendieron.
 *
 * ═══ QUÉ MIRA ═══
 *
 * Que toda pantalla a la que el router sabe llevar tenga al menos UNA puerta
 * para el cliente, y que esa puerta sea de las tres que existen:
 *
 *   la barra      los cuatro destinos fijos de abajo
 *   la consulta   la grilla de tres adentro de El Camino
 *   su día        una jornada que la abre, en `laPuertaDelDia.ts`
 *
 * Y al revés: que ninguna puerta apunte a una pantalla que no existe.
 */
import { DESTINOS, PRINCIPALES, DENTRO_DEL_CAMINO, EN_SU_DIA, mapaDelMenu } from '../src/lib/destinos';
import { PUERTAS_POR_DIA, pantallasConPuerta, ABSORBIDAS } from '../src/lib/laPuertaDelDia';
import { SEED_ROADMAP_V3, diaDelCodigo } from '../src/lib/roadmapSeed';

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`✗ ${m}`); };

const ids = new Set(DESTINOS.map((d) => d.id));
const conPuerta = pantallasConPuerta();

/* ── 1 · Toda pantalla tiene por lo menos una puerta ──
 *
 * El Mentor (`coach`) vive en el encabezado, a una mano desde cualquier
 * pantalla: esa es su puerta y no está en ninguna de las tres listas.
 */
const EN_EL_ENCABEZADO = ['coach'];

for (const d of DESTINOS) {
  const puertas = [
    PRINCIPALES.includes(d.id) ? 'la barra' : null,
    DENTRO_DEL_CAMINO.includes(d.id) ? 'la grilla de consulta' : null,
    conPuerta.has(d.id) ? 'su día' : null,
    EN_EL_ENCABEZADO.includes(d.id) ? 'el encabezado' : null,
    /* El Diario se abre al cerrar CADA jornada, desde la pantalla de Hoy: no
       le toca un día, le tocan todos. */
    d.id === 'diario' ? 'el cierre del día' : null,
  ].filter(Boolean);
  if (puertas.length === 0) {
    mal(`«${d.label}» (${d.id}) no tiene ninguna puerta: el cliente no puede llegar`);
  }
}

/* ── 2 · Ninguna puerta apunta a una pantalla que no existe ── */
for (const [dia, p] of Object.entries(PUERTAS_POR_DIA)) {
  if (!ids.has(p.destino)) mal(`el día ${dia} abre «${p.destino}», que no es una pantalla`);
  /* El label dice lo que el cliente va a hacer. Si empieza por «Abrir», casi
     siempre es el nombre de la pantalla disfrazado de acción. */
  if (!p.label.trim()) mal(`el día ${dia} tiene una puerta sin texto`);
  if (!p.bajada.trim()) mal(`el día ${dia} tiene una puerta sin bajada`);
}

/* ── 3 · Las dos listas de absorbidas dicen lo mismo ──
 *
 * `EN_SU_DIA` vive en destinos.ts y `ABSORBIDAS` en laPuertaDelDia.ts. Dos
 * listas de lo mismo en dos archivos es exactamente como empiezan a
 * separarse: esto las ata.
 */
const a = [...EN_SU_DIA].sort().join(',');
const b = [...ABSORBIDAS].sort().join(',');
if (a !== b) mal(`EN_SU_DIA y ABSORBIDAS no coinciden:\n    destinos.ts      ${a}\n    laPuertaDelDia.ts ${b}`);

/* ── 4 · El mapa que lee el Soporte no nombra lo que no está en el menú ──
 *
 * El Soporte dice «usa estos nombres exactos» y manda al cliente a buscarlos.
 * Si nombra una pantalla que salió del menú, lo manda a un lugar vacío. Ya
 * pasó una vez con cuatro nombres que habían dejado de existir.
 */
const mapa = mapaDelMenu();
for (const id of EN_SU_DIA) {
  const d = DESTINOS.find((x) => x.id === id);
  if (d && mapa.includes(d.label)) {
    mal(`el mapa del Soporte nombra «${d.label}», que ya no está en el menú`);
  }
}

/* ── 5 · La grilla de consulta se mantiene chica ──
 *
 * Eran ocho y el motivo de achicarla fue que ocho nombres hay que leerlos
 * para encontrar uno. Si vuelve a crecer sin decisión, esto avisa.
 */
if (DENTRO_DEL_CAMINO.length > 3) {
  mal(`la grilla de consulta tiene ${DENTRO_DEL_CAMINO.length} casillas: se decidió que fueran tres`);
}

/* ── 6 · La puerta llega de verdad a la pantalla ──
 *
 * Lo de arriba mira las listas. Esto mira el camino completo, que es donde
 * las cosas se cortan en silencio: la jornada le pasa su CÓDIGO al botón
 * (`P1.5`), el botón lo traduce a día con `diaDelCodigo`, y recién ahí
 * busca la puerta. Si un día del mapa no existe en el seed —o existe con
 * otro código— `diaDelCodigo` devuelve null, la puerta no se dibuja, y la
 * pantalla queda inalcanzable aunque las tres listas digan que está todo
 * bien. Es exactamente el modo en que Mi Número se perdió en julio.
 */
const porDia = new Map<number, string>();
for (const p of SEED_ROADMAP_V3 as { metas: { codigo: string; dia_asignado?: number | null }[] }[]) {
  for (const m of p.metas) if (typeof m.dia_asignado === 'number') porDia.set(m.dia_asignado, m.codigo);
}
for (const dia of Object.keys(PUERTAS_POR_DIA).map(Number)) {
  const codigo = porDia.get(dia);
  if (!codigo) { mal(`el día ${dia} abre una pantalla, y no hay jornada ese día`); continue; }
  if (diaDelCodigo(codigo) !== dia) {
    mal(`${codigo} es el día ${dia} en el seed y ${diaDelCodigo(codigo)} según diaDelCodigo: la puerta no se dibuja`);
  }
}

if (!fallas) {
  const total = DESTINOS.length;
  console.log(`✓ las ${total} pantallas tienen puerta`);
  console.log(`    ${PRINCIPALES.length} en la barra · ${DENTRO_DEL_CAMINO.length} de consulta · ${EN_SU_DIA.length} en su día`);
  for (const id of EN_SU_DIA) {
    const dias = Object.entries(PUERTAS_POR_DIA).filter(([, p]) => p.destino === id).map(([d]) => d);
    console.log(`    ${id.padEnd(10)} ${dias.length ? `días ${dias.join(', ')}` : 'el cierre de cada jornada'}`);
  }
}
process.exit(fallas ? 1 : 0);
