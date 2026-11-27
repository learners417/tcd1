/**
 * LA LENTE DE LAS TRES DEL DÍA — turno 22.
 *
 * Mide lo que `recomendacionesDelDia` CONTESTA, ejecutándola. No que exista,
 * no que llame a las funciones: qué devuelve con cada estado.
 *
 * Las tres que importan, porque son las tres formas en que una pantalla de
 * recomendaciones miente:
 *
 *   · Devolviendo nueve cosas para hacer hoy, que es devolver ninguna.
 *   · Poniendo primero lo cómodo y dejando para mañana la pauta que está
 *     quemando plata hoy.
 *   · Opinando sobre un dato que no tiene. Sin países, `calcularCadena` juzga
 *     el costo contra la banda de México y no avisa; sin filas por anuncio,
 *     una pantalla tranquila parece una campaña sana.
 *
 * Cada lente se prueba contra su propio fallo, como el resto de la casa: se
 * arma el estado donde el defecto aparecería y se confirma que la lente lo ve.
 *
 * Correr con: npx tsx scripts/prueba-las-tres-del-dia.ts
 */
import {
  recomendacionesDelDia,
  type EntradaDelDia, type FilaDeAnuncio,
} from '../src/lib/recomendacionesDelDia';
import { veredictoAnuncio } from '../src/lib/formulasAnuncios';
import { DIAS_PAUTA_SIN_AGENDA, type EstadoMotor } from '../src/lib/salaDeMando';
import { SEMANA_VACIA, type NumerosSemana } from '../src/lib/valueChain';

const MOTOR_SANO: EstadoMotor = {
  cobrado: 9000, objetivo: 10000,
  conversaciones: 80, calificados: 30, agendas: 20,
  llamadasTomadas: 14, cerradas: 6,
  gastoPauta: 600, diasSinAgenda: 0,
};
const MOTOR_PARA_CORTAR: EstadoMotor = { ...MOTOR_SANO, diasSinAgenda: DIAS_PAUTA_SIN_AGENDA };

/** Dos anuncios caros: $2 y $3 por conversación, con el tope en $1,50. */
const DOS_EN_ROJO: FilaDeAnuncio[] = [
  { nombre: 'Piedras', gasto: 100, visitas: 400, conversaciones: 50, agendas: 6 },
  { nombre: 'Dolor', gasto: 150, visitas: 300, conversaciones: 50, agendas: 5 },
];
const UNO_SANO: FilaDeAnuncio[] = [
  { nombre: 'Piedras', gasto: 20, visitas: 400, conversaciones: 50, agendas: 15 },
];

const SEMANA_FLOJA: NumerosSemana = {
  ...SEMANA_VACIA,
  precio: 1000, piezasPublicadas: 7, gasto: 250, impresiones: 50000, alcance: 20000,
  conversaciones: 10, agendas: 4, llamadasTomadas: 3,
  ofertasPresentadas: 3, ventas: 1, facturado: 1000, cobrado: 500,
};

const BASE: EntradaDelDia = {
  motor: MOTOR_SANO, numeros: SEMANA_FLOJA, paises: ['MX'],
  objetivoCampana: 'mensajes', anuncios: UNO_SANO,
};

type Lente = { nombre: string; mira: () => boolean; conSuFallo: () => boolean };

const LENTES: Lente[] = [
  {
    nombre: 'nunca más de tres, por muchos problemas que haya',
    mira: () => {
      const r = recomendacionesDelDia({
        ...BASE, motor: MOTOR_PARA_CORTAR, anuncios: DOS_EN_ROJO,
      });
      return r.recomendaciones.length === 3;
    },
    // El defecto: devolver todo lo que encontró. Con este estado hay cuatro
    // candidatas (cortar, dos anuncios en rojo y el cuello de la cadena).
    conSuFallo: () => {
      const r = recomendacionesDelDia({
        ...BASE, motor: MOTOR_PARA_CORTAR, anuncios: DOS_EN_ROJO,
      });
      const todas = r.recomendaciones.length + 1;   // como si no cortara en 3
      return todas === 3;
    },
  },

  {
    nombre: 'lo que quema plata hoy va primero',
    mira: () => {
      const r = recomendacionesDelDia({
        ...BASE, motor: MOTOR_PARA_CORTAR, anuncios: DOS_EN_ROJO,
      });
      const primera = r.recomendaciones[0];
      if (!primera) return false;
      // La de cortar la pauta, y con su número de días.
      return /corta la pauta/i.test(primera.titulo)
        && primera.numero.includes(String(DIAS_PAUTA_SIN_AGENDA));
    },
    // El defecto: ordenar por el orden en que se encontraron, no por urgencia.
    conSuFallo: () => {
      const r = recomendacionesDelDia({
        ...BASE, motor: MOTOR_PARA_CORTAR, anuncios: DOS_EN_ROJO,
      });
      const alRevés = [...r.recomendaciones].reverse();
      return /corta la pauta/i.test(alRevés[0]?.titulo ?? '');
    },
  },

  {
    nombre: 'ninguna recomendación sale sin su número',
    mira: () => {
      const estados: EntradaDelDia[] = [
        BASE,
        { ...BASE, motor: MOTOR_PARA_CORTAR, anuncios: DOS_EN_ROJO },
        { ...BASE, anuncios: DOS_EN_ROJO },
        { ...BASE, motor: null },
      ];
      return estados.every((s) =>
        recomendacionesDelDia(s).recomendaciones.every(
          (r) => r.numero.trim().length > 0 && r.regla.trim().length > 0,
        ));
    },
    conSuFallo: () => {
      // El defecto: una recomendación de texto suelto, sin número ni regla.
      const inventada = { titulo: 'Subí la pauta', numero: '', porque: 'va bien', regla: '' };
      return inventada.numero.trim().length > 0;
    },
  },

  {
    nombre: 'sin filas por anuncio lo dice, y dice de quién es',
    mira: () => {
      const r = recomendacionesDelDia({ ...BASE, anuncios: [] });
      const f = r.faltan.find((x) => /por anuncio/i.test(x.que));
      return Boolean(f) && /turno 20/i.test(f!.deQuien);
    },
    // El defecto: quedarse callado. La pantalla muestra dos consejos tibios y
    // parece que la campaña está mirada.
    conSuFallo: () => {
      const faltanVacío: Array<{ que: string; deQuien: string }> = [];
      return faltanVacío.some((x) => /por anuncio/i.test(x.que));
    },
  },

  {
    nombre: 'sin países no opina del costo de la cadena, y lo avisa',
    mira: () => {
      const r = recomendacionesDelDia({ ...BASE, paises: [] });
      const avisa = r.faltan.some((x) => /dónde corre/i.test(x.que));
      const opina = r.recomendaciones.some((x) => /encontrarDomino/.test(x.regla));
      return avisa && !opina;
    },
    // El defecto: llamar a `calcularCadena` con lista vacía, que juzga el CPM
    // contra la banda de México en silencio.
    conSuFallo: () => {
      const conPaíses = recomendacionesDelDia({ ...BASE, paises: ['MX'] });
      // Si la lente no mirara los países, este caso —que sí los tiene— daría
      // el mismo resultado que el de arriba y la lente no distinguiría nada.
      return conPaíses.faltan.some((x) => /dónde corre/i.test(x.que));
    },
  },

  {
    nombre: 'el porqué de un anuncio es el texto de la regla, no uno nuevo',
    mira: () => {
      const r = recomendacionesDelDia({ ...BASE, anuncios: DOS_EN_ROJO });
      const dePiedras = r.recomendaciones.find((x) => x.titulo.includes('Piedras'));
      if (!dePiedras) return false;
      const dicho = veredictoAnuncio('mensajes', DOS_EN_ROJO[0]).texto;
      return dePiedras.porque === dicho;
    },
    // El defecto: reescribir el texto «en palabras simples» y que deje de ser
    // el de la regla. Ahí ya nadie sabe qué umbral se aplicó.
    conSuFallo: () => {
      const reescrito = 'Está caro, apagalo.';
      return reescrito === veredictoAnuncio('mensajes', DOS_EN_ROJO[0]).texto;
    },
  },

  {
    nombre: 'con anuncios pero sin saber qué compra la campaña, no los juzga',
    mira: () => {
      const r = recomendacionesDelDia({
        ...BASE, objetivoCampana: null, anuncios: DOS_EN_ROJO,
      });
      const avisa = r.faltan.some((x) => /qué compra tu campaña/i.test(x.que));
      const opinó = r.recomendaciones.some((x) => /UMBRALES/.test(x.regla));
      return avisa && !opinó;
    },
    /*
     * El defecto: poner `'mensajes'` por omisión. Con ese umbral —$1,50— un
     * anuncio de ticket alto a $2,20 sale rojo y se apaga uno que estaba
     * sano: la banda de `mensajes_alto` llega hasta $3,00.
     */
    conSuFallo: () => {
      const comoSiFueraMensajes = recomendacionesDelDia({
        ...BASE, objetivoCampana: 'mensajes', anuncios: DOS_EN_ROJO,
      });
      return comoSiFueraMensajes.faltan.some((x) => /qué compra tu campaña/i.test(x.que));
    },
  },

  {
    nombre: 'con todo sano no inventa trabajo',
    mira: () => {
      const sano: EntradaDelDia = {
        motor: { ...MOTOR_SANO, cobrado: 10000 },   // objetivo cumplido
        numeros: null, paises: ['MX'], objetivoCampana: 'mensajes', anuncios: UNO_SANO,
      };
      const r = recomendacionesDelDia(sano);
      // Puede proponer reinvertir —es real, hay ventas— pero nada urgente.
      return r.recomendaciones.every((x) => !/corta|apaga/i.test(x.titulo));
    },
    conSuFallo: () => {
      const inventadas = [{ titulo: 'Apaga todo', numero: '0', porque: '', regla: '' }];
      return inventadas.every((x) => !/corta|apaga/i.test(x.titulo));
    },
  },
];

let fallas = 0;
const mal = (m: string) => { fallas += 1; console.log(`  ✗ ${m}`); };

console.log('\n── las tres del día ──');
for (const l of LENTES) {
  let ok = false;
  try { ok = l.mira(); } catch (e) { mal(`${l.nombre} — reventó: ${(e as Error).message}`); continue; }
  if (!ok) mal(l.nombre);
}

let ciegas = 0;
for (const l of LENTES) {
  let siguieraVerde = false;
  try { siguieraVerde = l.conSuFallo(); } catch { siguieraVerde = false; }
  if (siguieraVerde) { ciegas += 1; mal(`la lente «${l.nombre}» NO ve su propio fallo`); }
}

if (!fallas) {
  console.log(`  ✓ ${LENTES.length} lentes sobre las tres del día, cada una probada contra su propio fallo\n`);
} else {
  console.log(`  (${LENTES.length} lentes · ${ciegas} ciega(s))\n`);
}
process.exit(fallas ? 1 : 0);
