/**
 * PRUEBA DE HUMO — montar cada pantalla de verdad.
 *
 * LA LENTE QUE FALTABA. Todo lo demás verifica el código SIN EJECUTARLO: el
 * compilador mira los tipos, la batería mira el texto del archivo, las
 * pruebas de modelo corren funciones sueltas. **Ninguna montaba un
 * componente.**
 *
 * Y una pantalla puede compilar perfecto y reventar al abrirse: un hook
 * dentro de un condicional, una propiedad de algo que llega nulo, un `.map`
 * sobre undefined. Eso lo descubre el cliente, no el compilador.
 *
 * Acá se monta cada componente nuevo con datos realistas —y también con
 * datos vacíos, que es como llega la primera vez— y se verifica que
 * devuelva algo. Si revienta, revienta acá.
 *
 * Correr con: npx tsx scripts/prueba-pantallas.tsx
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

/** Monta un componente y dice si sobrevivió. */
function monta(nombre: string, el: React.ReactElement): string | null {
  try {
    const html = renderToStaticMarkup(el);
    return html;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`   ↳ ${msg.slice(0, 110)}`);
    fallas++;
    console.log(`✗ ${nombre} REVIENTA AL MONTARSE`);
    return null;
  }
}

/** Verifica que además de no reventar, dibuje algo. */
function dibuja(nombre: string, el: React.ReactElement, minimo = 50): void {
  const html = monta(nombre, el);
  if (html === null) return;
  const largo = html.replace(/<[^>]*>/g, '').trim().length;
  linea(largo >= minimo,
    `${nombre} monta y dibuja ${largo} caracteres de texto${largo < minimo ? ' — PANTALLA MUDA' : ''}`);
}

async function main() {
  console.log('══ las pantallas del cliente ══');

  const { default: TableroCupos } = await import('../src/components/campanas/TableroCupos');
  dibuja('TableroCupos · día 1', <TableroCupos diasCampana={1} />);
  dibuja('TableroCupos · día 20', <TableroCupos diasCampana={20} />);
  dibuja('TableroCupos · sin días', <TableroCupos diasCampana={0} />);

  const { default: MontajeCupos } = await import('../src/components/campanas/MontajeCupos');
  dibuja('MontajeCupos · sin nada cargado', <MontajeCupos />);

  console.log('\n══ las pantallas del equipo ══');

  const { default: MiRol } = await import('../src/components/admin/MiRol');
  for (const rol of ['direccion', 'acompanamiento', 'desarrollo'] as const) {
    dibuja(`MiRol · ${rol}`, <MiRol rol={rol} />);
  }
  dibuja('MiRol · semana cargada',
    <MiRol rol="acompanamiento" excepciones={12} sesiones={8} enInstalacion={15} />);

  const { default: ColaDelDia } = await import('../src/components/admin/ColaDelDia');
  dibuja('ColaDelDia · sin clientes', <ColaDelDia clientes={[]} />);
  dibuja('ColaDelDia · con clientes',
    <ColaDelDia clientes={[{ id: 'a', nombre: 'Rosana', plan_comercial: 'completo' }]} />);

  const { default: Supervision } = await import('../src/components/admin/Supervision');
  dibuja('Supervision · sin clientes', <Supervision clientes={[]} />);
  dibuja('Supervision · con clientes',
    <Supervision clientes={[{ id: 'a', nombre: 'Rosana' }]} />);

  const { default: SalaDeMando } = await import('../src/components/admin/SalaDeMando');
  dibuja('SalaDeMando · sin clientes', <SalaDeMando clientes={[]} />);
  dibuja('SalaDeMando · con clientes en etapas',
    <SalaDeMando clientes={[
      { id: 'a', nombre: 'Uno', etapa_actual: 0, etapa_desde: '2026-07-01', fecha_venta: '2026-07-01' },
      { id: 'b', nombre: 'Dos', etapa_actual: 4, etapa_desde: '2026-07-20', fecha_venta: '2026-06-01' },
      { id: 'c', nombre: 'Tres', etapa_actual: 7, etapa_desde: '2026-01-01', fecha_venta: '2025-12-01' },
    ]} />);

  const { default: PanelMotorIA } = await import('../src/components/admin/PanelMotorIA');
  dibuja('PanelMotorIA', <PanelMotorIA />);

  const { default: TableroPlata } = await import('../src/components/admin/TableroPlata');
  dibuja('TableroPlata · sin cliente', <TableroPlata />);
  dibuja('TableroPlata · con cliente',
    <TableroPlata clienteId="a" nombreCliente="Rosana" />);

  const { default: Jornada } = await import('../src/components/admin/Jornada');
  const cola = [{
    clienteId: 'a', nombre: 'Rosana', cuello: 'conv_a_agenda',
    situacion: 'El DM pierde a la gente.', accion: 'Revisar el DM.',
    como: 'Mensaje al cliente.', quien: 'operador' as const,
    enRiesgo: 1000, semanasIgual: 0, yaSeIntento: false,
  }];
  dibuja('Jornada · sin empezar', <Jornada personaId="p" rol="acompanamiento" items={cola} />);
  dibuja('Jornada · sin cuentas', <Jornada personaId="p" rol="acompanamiento" items={[]} />);

  const { default: LaSemana } = await import('../src/components/admin/LaSemana');
  for (const rol of ['direccion', 'acompanamiento', 'desarrollo'] as const) {
    dibuja(`LaSemana · ${rol}`,
      <LaSemana rol={rol} jornadas={[]} clientesActivos={11} clientesQueVendieron={7}
        cuentasFrenadas={[]} facturadoClientes={9000} />);
  }
  dibuja('LaSemana · con trabas y frenados',
    <LaSemana rol="direccion"
      jornadas={[{ personaId: 'l', dia: '2026-07-27', inicio: '2026-07-27T09:00:00Z',
        fin: '2026-07-27T17:00:00Z', planeados: [], cerradas: [], atendidos: ['a'],
        traba: 'no le llega el DM automatico' }]}
      clientesActivos={11} clientesQueVendieron={7}
      cuentasFrenadas={[{ clienteId: 'a', nombre: 'Rosana', cuello: 'El DM pierde gente', semanasIgual: 3, enRiesgo: 3000 }]}
      facturadoClientes={9000} />);

  const { default: CargarSesion } = await import('../src/components/admin/CargarSesion');
  dibuja('CargarSesion',
    <CargarSesion clienteId="a" nombreCliente="Rosana" quienLaDio="Lupe" />);

  // ── LA PRUEBA MÁS IMPORTANTE ──
  // No alcanza con que el permiso diga que no. Hay que verificar que el
  // número NO ESTÉ EN EL HTML que se le entrega al navegador del empleado.
  // Si está y solo se esconde con CSS, cualquiera lo lee.
  console.log('\n══ el dinero NO viaja al navegador del empleado ══');
  const conPlata = {
    jornadas: [{ personaId: 'l', dia: '2026-07-27', inicio: '2026-07-27T09:00:00Z',
      fin: '2026-07-27T17:00:00Z', planeados: [], cerradas: [], atendidos: ['a'] }],
    clientesActivos: 11, clientesQueVendieron: 7,
    cuentasFrenadas: [{ clienteId: 'a', nombre: 'Rosana', cuello: 'x', semanasIgual: 1, enRiesgo: 987654 }],
    facturadoClientes: 123456,
  };
  const { default: LS } = await import('../src/components/admin/LaSemana');
  const { renderToStaticMarkup: rr } = await import('react-dom/server');

  // Se comparan solo los dígitos: el separador de miles cambia según dónde
  // corra, y una prueba que depende del formato no prueba nada.
  const soloDigitos = (t: string) => t.replace(/[^0-9]/g, '');

  for (const rol of ['acompanamiento', 'desarrollo', 'produccion'] as const) {
    const digitos = soloDigitos(rr(<LS rol={rol} {...conPlata} />));
    const html = rr(<LS rol={rol} {...conPlata} />);
    linea(!digitos.includes('123456'), `${rol}: lo facturado NO está en el HTML`);
    linea(!digitos.includes('987654'), `${rol}: el dinero en riesgo NO está en el HTML`);
    linea(!html.includes('Humano por cliente'),
      `${rol}: el rendimiento del equipo NO está en el HTML`);
  }

  const htmlJefe = rr(<LS rol="direccion" {...conPlata} />);
  linea(soloDigitos(htmlJefe).includes('123456'),
    'dirección SÍ ve lo facturado — si no, el permiso estaría de más');
  linea(htmlJefe.includes('Humano por cliente'),
    'y sí ve el rendimiento del equipo');

  console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
  process.exit(fallas === 0 ? 0 : 1);
}

void main();
