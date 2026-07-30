/**
 * Pruebas de la medición por función.
 *
 * Lo que se juega: el objetivo de la empresa es que los minutos de humano por
 * cliente bajen. Si la app mide eso mal —o lo mide en total, sin distinguir
 * qué lo bajó— no se puede saber si el negocio escaló o si simplemente hubo
 * menos trabajo esa semana.
 *
 * Correr con: npx tsx scripts/prueba-funciones.ts
 */
import {
  FUNCIONES, MINUTOS_POR, tablaDeFunciones, tituloDeLaSemana,
  deudaPorCliente, MINUTOS_QUE_PERMITE, CAMBIO_SIGNIFICATIVO,
  type Funcion, type HitoDeAbsorcion, type ObservacionFuncion,
} from '../src/lib/funciones';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const TODAS: Funcion[] = ['criterio', 'instalacion', 'destrabar', 'absorber', 'producir', 'cobrar'];
const obs = (f: Funcion, m: number): ObservacionFuncion => ({ funcion: f, minutos: m });
const hito = (f: Funcion, min: number): HitoDeAbsorcion => ({
  id: 'h', que: 'los tutoriales del píxel', funcion: f,
  minutosEstimados: min, desde: '2026-07-01', porQuien: 'dev',
});
const tabla = (x: Partial<Parameters<typeof tablaDeFunciones>[0]>) => tablaDeFunciones({
  estaSemana: [], semanasAnteriores: [], clientesActivos: 11, hitos: [], ...x,
});
const de = (t: ReturnType<typeof tabla>, f: Funcion) => t.find((x) => x.funcion === f)!;

console.log('══ las seis funciones ══');
linea(TODAS.every((f) => FUNCIONES[f].siNadie.length > 20),
  'cada una se define por lo que pasa si NADIE la hace');
linea(TODAS.every((f) => FUNCIONES[f].porQue.length > 40),
  'y su destino tiene el porqué escrito, para que nadie lo afloje sin pensar');
linea(FUNCIONES.criterio.destino === 'permanente',
  'el criterio queda humano para siempre');
linea(FUNCIONES.instalacion.destino === 'debe_morir'
   && FUNCIONES.cobrar.destino === 'debe_morir',
  'instalación y cobro deben MORIR');
linea(FUNCIONES.absorber.destino === 'crece',
  'y absorber es la única que crece: es la que se come a las otras');

console.log('\n══ el total no alcanza: por qué bajó importa ══');
const conHito = tabla({
  estaSemana: [obs('instalacion', 200)],
  semanasAnteriores: [[obs('instalacion', 320)], [obs('instalacion', 310)]],
  hitos: [hito('instalacion', 100)],
});
linea(de(conHito, 'instalacion').lectura.includes('haber construido algo'),
  'si bajó Y hay un hito declarado: es el negocio escalando');

const sinHito = tabla({
  estaSemana: [obs('instalacion', 200)],
  semanasAnteriores: [[obs('instalacion', 320)], [obs('instalacion', 310)]],
});
linea(sinHito.find((x) => x.funcion === 'instalacion')!.lectura.includes('aritmética'),
  'si bajó y nadie declaró nada: puede ser que una instalación terminó, y eso no escala');

console.log('\n══ la verificación que hace valer la declaración ══');
const declaradoSinEfecto = tabla({
  estaSemana: [obs('instalacion', 300)],
  semanasAnteriores: [[obs('instalacion', 300)], [obs('instalacion', 305)]],
  hitos: [hito('instalacion', 100)],
});
const v = de(declaradoSinEfecto, 'instalacion');
linea(v.alerta && v.lectura.includes('La estimación estaba mal'),
  'se declararon 100 minutos ahorrados y los minutos NO bajaron: la app lo dice');
linea(v.lectura.includes('no era lo que consumía tiempo'),
  'y ofrece la otra explicación posible');

console.log('\n══ el destino decide la lectura, no el número ══');
const absorberBajo = tabla({
  estaSemana: [obs('absorber', 60)],
  semanasAnteriores: [[obs('absorber', 300)], [obs('absorber', 280)]],
});
linea(de(absorberBajo, 'absorber').alerta,
  'que ABSORBER baje es una mala noticia disfrazada de buena');
linea(de(absorberBajo, 'absorber').lectura.includes('nada baja el mes que viene'),
  'y dice la consecuencia');

const absorberCero = tabla({ estaSemana: [obs('destrabar', 100)] });
linea(de(absorberCero, 'absorber').alerta
   && de(absorberCero, 'absorber').lectura.includes('Nadie trabajó en absorber'),
  'absorber en cero es la peor noticia de la tabla');

const instalacionSubio = tabla({
  estaSemana: [obs('instalacion', 400)],
  semanasAnteriores: [[obs('instalacion', 300)], [obs('instalacion', 290)]],
});
linea(de(instalacionSubio, 'instalacion').alerta
   && de(instalacionSubio, 'instalacion').lectura.includes('qué se repite'),
  'una función que debe reducirse y sube manda a mirar qué se repite');

const criterioSubio = tabla({
  estaSemana: [obs('criterio', 200)],
  semanasAnteriores: [[obs('criterio', 100)], [obs('criterio', 110)]],
});
linea(!de(criterioSubio, 'criterio').alerta,
  'que el CRITERIO suba NO es una alarma');
linea(de(criterioSubio, 'criterio').lectura.includes('no un problema')
   && de(criterioSubio, 'criterio').lectura.includes('tres meses seguidos'),
  'es información — pero con el límite dicho: tres meses seguidos sí importa');

console.log('\n══ lo que no es tendencia ══');
const ruido = tabla({
  estaSemana: [obs('instalacion', 305)],
  semanasAnteriores: [[obs('instalacion', 300)], [obs('instalacion', 300)]],
});
linea(Math.abs(de(ruido, 'instalacion').cambio ?? 1) < CAMBIO_SIGNIFICATIVO,
  `un cambio menor al ${CAMBIO_SIGNIFICATIVO * 100}% es ruido, no tendencia`);
const primera = tabla({ estaSemana: [obs('instalacion', 300)] });
linea(de(primera, 'instalacion').cambio === null
   && de(primera, 'instalacion').lectura.includes('Primera semana'),
  'la primera semana no inventa una comparación');
linea(tabla({ estaSemana: [], semanasAnteriores: [], clientesActivos: 0 })
  .every((t) => t.porCliente === 0),
  'sin clientes no divide por cero');

console.log('\n══ el titular de la reunión ══');
linea(tituloDeLaSemana(conHito).includes('el negocio escalando'),
  `bajó con hito: "${tituloDeLaSemana(conHito)}"`);
linea(tituloDeLaSemana(sinHito).includes('antes de festejarlo'),
  `bajó sin hito: "${tituloDeLaSemana(sinHito)}"`);
linea(tituloDeLaSemana(instalacionSubio).includes('Ninguna función bajó'),
  `nada bajó: "${tituloDeLaSemana(instalacionSubio)}"`);

console.log('\n══ el gradiente por cliente ══');
linea(MINUTOS_QUE_PERMITE.mil === 0,
  'un cliente de $1.000 permite CERO minutos de humano');
linea(MINUTOS_QUE_PERMITE.cinco_mil > MINUTOS_QUE_PERMITE.dos_mil,
  'y el gradiente sube con el ticket');

const deudas = deudaPorCliente([
  { id: 'a', nombre: 'Rosana', ticket: 'mil', minutos: 18 },
  { id: 'b', nombre: 'Ana', ticket: 'cinco_mil', minutos: 200 },
  { id: 'c', nombre: 'Luz', ticket: 'mil', minutos: 0 },
]);
linea(deudas[0].clienteId === 'a', 'la deuda más grande va primero: ahí absorber rinde más');
linea(deudas[0].lectura.includes('deuda que absorber tiene que pagar'),
  'y el exceso se convierte en tarea, no en queja sobre el cliente');
linea(deudas.find((d) => d.clienteId === 'b')!.exceso === 0,
  'un cliente de $5.000 con 200 minutos está dentro de lo que compró');
linea(deudas.find((d) => d.clienteId === 'c')!.lectura.includes('como tiene que ser'),
  'y el de $1.000 que cuesta cero se reconoce');
linea(deudaPorCliente([]).length === 0, 'sin clientes no rompe');

console.log('\n══ los minutos de cada cosa ══');
linea(Object.values(MINUTOS_POR).every((m) => m.minutos > 0 && FUNCIONES[m.funcion]),
  'cada tipo de trabajo tiene sus minutos y su función');
linea(MINUTOS_POR.sesion.funcion === 'criterio',
  'una sesión es criterio: es donde se decide, no donde se ejecuta');
linea(MINUTOS_POR.excepcion.funcion === 'destrabar',
  'y una excepción es destrabar');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
