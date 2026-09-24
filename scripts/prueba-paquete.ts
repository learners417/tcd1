/**
 * Pruebas del paquete de campaña.
 *
 * Correr con: npx tsx scripts/prueba-paquete.ts
 */
import { armarPaquete, type FuentesPaquete } from '../src/lib/paqueteCampana';

let fallas = 0;
const linea = (ok: boolean, txt: string) => {
  if (!ok) fallas++;
  console.log(`${ok ? '✓' : '✗'} ${txt}`);
};

const ANUNCIO = [
  'PANTALLA 1: ¿Cansada de probar dietas que no te devuelven la energía?',
  'PANTALLA 2: No necesitas otra dieta. Deja de contar calorías.',
  'PANTALLA 3: Funciona como recablear un interruptor: el Método NORTE.',
  'PANTALLA 4: Mi paciente pasó de arrastrarse a entrenar de noche.',
  'PANTALLA 5: A las 3 AM te despiertas con culpa. No es magia, tarda.',
  'PANTALLA 6: Comenta "ENERGIA" y te mando el camino.',
  'CAPTION: Comenta ENERGIA. Resultados individuales.',
].join('\n');

const COMPLETO: FuentesPaquete = {
  piezas: {
    1: { formulaId: 1, texto: ANUNCIO },
    15: { formulaId: 15, texto: ANUNCIO },
    10: { formulaId: 10, texto: ANUNCIO },
  },
  elegidas: [1, 15, 10],
  stories: 'Story 1: ... Story 2: ... Story 3: ...',
  brief: { palabra: 'ENERGIA', oferta: 'Programa de 90 días', metodo: 'NORTE' },
  notas: {
    'P4.5': '## ¿Qué escribes?\nHola, gracias por comentar. ¿Hace cuánto que estás así?',
    'P4.2d': '## Tu página\nLa página con el precio y la agenda.',
    'P4.5b': '## Tu dominio\nnuplan.com.ar',
  },
};

console.log('══ el paquete completo ══');
const p = armarPaquete(COMPLETO);

linea(p.completo, 'con todo cargado, el paquete está completo');
linea(p.faltan.length === 0, 'y no falta nada');
linea(p.piezas.length === 8,
  `arma las 8 piezas: 3 anuncios + stories + palabra + DM + página + dominio (${p.piezas.length})`);
linea(p.piezas.filter((x) => x.estado === 'listo').length === 8, 'las 8 están listas');

const anuncio = p.piezas[0];
linea(anuncio.contenido.includes('PORTADA:'), 'el anuncio sale con la portada marcada');
linea(anuncio.contenido.includes('CIERRE:'), 'y con el cierre marcado');
linea(anuncio.contenido.includes('TEXTO DEL POST:'), 'y con el texto del post');
linea(!anuncio.contenido.includes('PANTALLA'), 'sin arrastrar las marcas del modelo');

const dm = p.piezas.find((x) => x.id === 'dm')!;
linea(!dm.contenido.includes('##'), 'el DM sale sin el markdown de la sesión');
linea(dm.contenido.includes('¿Hace cuánto'), 'pero con lo que el sanador escribió');

linea(p.textoCompleto.includes('═══'), 'el texto completo separa las piezas');
linea(p.textoCompleto.split('═══').length > 10, 'y las incluye a todas');

console.log('\n══ lo que falta se dice y se explica dónde conseguirlo ══');
const INCOMPLETO: FuentesPaquete = {
  ...COMPLETO,
  piezas: { 1: { formulaId: 1, texto: ANUNCIO } },
  elegidas: [1, 15, 10],
  stories: '',
  brief: { palabra: '' },
  notas: {},
};
const q = armarPaquete(INCOMPLETO);

linea(!q.completo, 'el paquete incompleto lo dice');
linea(q.faltan.length === 5,
  `faltan 5 obligatorias (2 anuncios + palabra + DM + página): ${q.faltan.length}`);
linea(q.piezas.every((x) => x.donde.length > 20),
  'cada pieza dice DÓNDE se consigue, no solo que falta');
linea(q.piezas.find((x) => x.id === 'palabra')!.aviso?.includes('dispara') ?? false,
  'la palabra clave explica para qué sirve');
linea(q.piezas.find((x) => x.id === 'dominio')!.obligatoria === false,
  'el dominio no es obligatorio para encender');
linea(q.piezas.find((x) => x.id === 'stories')!.obligatoria === false,
  'las stories tampoco');

console.log('\n══ una pieza que existe pero no puede publicarse ══');
const SUCIO: FuentesPaquete = {
  ...COMPLETO,
  piezas: {
    ...COMPLETO.piezas,
    10: { formulaId: 10, texto: ANUNCIO.replace('¿Cansada de probar dietas que no te devuelven la energía?', 'Si tú tienes ansiedad, esto es para ti.') },
  },
};
const r = armarPaquete(SUCIO);
const mala = r.piezas.find((x) => x.id === 'anuncio-10')!;
linea(mala.estado === 'revisar', 'una pieza con problema no figura como lista');
linea(mala.aviso?.includes('no se puede publicar') ?? false,
  'y el aviso dice exactamente cuál es el problema');
linea(!r.completo, 'y el paquete entero queda incompleto');
linea(mala.contenido.length > 0,
  'pero el contenido igual se muestra: se corrige, no se esconde');

console.log('\n══ bordes ══');
const vacio = armarPaquete({
  piezas: {}, elegidas: [], stories: '', brief: {}, notas: {},
});
linea(!vacio.completo && vacio.piezas.length === 5,
  'sin nada cargado no se rompe: arma las 5 piezas que no dependen de la selección');
linea(vacio.textoCompleto === '', 'y el texto para copiar queda vacío, no con basura');

console.log(`\n${fallas === 0 ? '✓ TODO EN VERDE' : `✗ ${fallas} FALLAS`}`);
process.exit(fallas === 0 ? 0 : 1);
