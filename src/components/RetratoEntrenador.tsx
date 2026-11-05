/**
 * LOS RETRATOS — la cara de cada entrenador y la del Mentor.
 *
 * ═══ DOS INTENTOS ANTERIORES, Y POR QUÉ NO SERVÍAN ═══
 *
 * 1. DE FRENTE, EN SILUETA. Cabeza ovalada, hombros, pelo encima, todo en
 *    color plano. Los nueve eran la misma mancha: de frente, sin rasgos, un
 *    óvalo oscuro es un óvalo oscuro.
 *
 * 2. DE PERFIL, EN SILUETA. La idea era que el perfil fuera el rasgo —la
 *    frente, la nariz, el mentón—. Pero la línea del perfil es un dos por
 *    ciento del dibujo y el otro noventa y ocho es masa oscura: a 48 píxeles
 *    se lee la masa, no la línea. Seguían siendo nueve manchas.
 *
 * La conclusión de las dos: LO QUE HACE QUE ALGO SEA UNA CARA SON LOS
 * RASGOS. Sin ojos no hay persona, por bien dibujado que esté el contorno.
 *
 * ═══ CÓMO ESTÁN HECHOS AHORA ═══
 *
 * Retrato de frente, con la cara en un tono de piel y los rasgos en línea de
 * tinta: cejas, ojos, nariz y boca. El pelo es masa; la cara es línea. Ese
 * contraste —relleno contra trazo— es lo que separa un retrato editorial de
 * un ícono, y es la misma lógica de las tapas: capas planas, nada de
 * degradés, nada de brillos.
 *
 * Lo que mantiene la seriedad y lo aleja del dibujo animado:
 *
 *   · Los ojos son almendras chicas con el párpado marcado, nunca círculos
 *     grandes con brillo. El ojo redondo y enorme es la marca del dibujo
 *     infantil.
 *   · La boca es una línea con una curva mínima. Ninguno sonríe de oreja a
 *     oreja.
 *   · Las proporciones son adultas: la cabeza ocupa poco más de un tercio de
 *     la altura del busto, no la mitad.
 *   · Un solo grosor de línea en todo el dibujo.
 *   · Las asimetrías son a propósito. Una cara perfectamente simétrica se ve
 *     hecha por una máquina.
 *
 * ═══ LOS COLORES ═══
 *
 * El fondo de cada uno sale de los cinco paisajes, que es lo que los ata al
 * mundo del Camino y de los libros. La ropa toma el tono oscuro del mismo
 * paisaje. La piel y el pelo son los únicos colores nuevos, y son los que
 * hacen falta para que una cara parezca una cara.
 *
 * El aro es una línea de 1px en oro, igual en los nueve.
 */
import React from 'react';
import { TINTA_LIBRO } from '../lib/losCincoPaisajes';

const ORO = TINTA_LIBRO.oro;
/** El trazo de los rasgos. Uno solo, en todo el dibujo. */
const TRAZO = 2;

/** Los fondos y las ropas, de los cinco paisajes. */
const PAISAJE = {
  lago:    { fondo: '#9FC5D8', ropa: '#123A52' },
  montana: { fondo: '#D9B59D', ropa: '#5C3523' },
  viento:  { fondo: '#D2CB95', ropa: '#4A4522' },
  rio:     { fondo: '#A6CFC8', ropa: '#11423E' },
  bosque:  { fondo: '#B8CBAA', ropa: '#223A27' },
};

/** Las pieles. Tres tonos, y el de la tinta para los rasgos. */
const PIEL = {
  clara:  '#E8C6A8',
  media:  '#C98F67',
  oscura: '#8D5A3C',
};
const TINTA = '#2B2723';

interface Cara {
  paisaje: keyof typeof PAISAJE;
  piel: string;
  pelo: string;
  /** El pelo que va DETRÁS de la cabeza: melenas, recogidos, rulos. */
  atras?: React.ReactNode;
  /** El pelo que va ADELANTE: flequillos, entradas, coronilla. */
  adelante: React.ReactNode;
  /** Barba, bigote, lo que va sobre el mentón. */
  barba?: React.ReactNode;
  /** Las cejas. Cambian el gesto más que ninguna otra línea. */
  cejas: React.ReactNode;
  /** El óvalo de la cara: ancho y alto. Nadie tiene la misma cabeza. */
  rx?: number;
  ry?: number;
  /*
   * ═══ Y NADIE TIENE LOS MISMOS RASGOS ═══
   *
   * Con el pelo arreglado los nueve seguían compartiendo una sola máscara:
   * los mismos ojos a la misma distancia, la misma nariz, la misma boca. El
   * peinado alcanzaba para distinguirlos de a dos, no de a nueve.
   *
   * Estos cuatro números son los que de verdad cambian una cara: cuán
   * separados están los ojos, cuán larga es la nariz, cuán ancha la boca y
   * cuánto se curva. Son los mismos cuatro que mira un retratista antes de
   * dibujar nada.
   */
  /** Separación de los ojos desde el centro. Lo normal ronda 9. */
  ojos?: number;
  /** Dónde cae la punta de la nariz. */
  nariz?: number;
  /** Medio ancho de la boca. */
  boca?: number;
  /** Cuánto baja el centro del labio. Cero es una línea recta. */
  curva?: number;
}

/* Las piezas que comparten los nueve, para que sean una familia. */
const Ojo = ({ x, y = 46 }: { x: number; y?: number }) => (
  <>
    {/* La almendra: dos curvas que se cierran. Nunca un círculo. */}
    <path d={`M${x - 4.5} ${y} Q${x} ${y - 3.4} ${x + 4.5} ${y} Q${x} ${y + 2.6} ${x - 4.5} ${y}`}
      fill="none" stroke={TINTA} strokeWidth={TRAZO * 0.8} strokeLinecap="round" />
    {/* El iris, apoyado en el párpado de arriba. Chico. */}
    <circle cx={x} cy={y - 0.4} r="1.7" fill={TINTA} />
  </>
);

const Nariz = ({ y = 55 }: { y?: number }) => (
  <path d={`M46 ${y - 5} L44.5 ${y + 1.5} Q47 ${y + 3} 49.5 ${y + 1}`}
    fill="none" stroke={TINTA} strokeWidth={TRAZO * 0.8} strokeLinecap="round" strokeLinejoin="round" />
);

const Boca = ({ y = 63, ancho = 7, curva = 1.6 }: { y?: number; ancho?: number; curva?: number }) => (
  <path d={`M${48 - ancho} ${y} Q48 ${y + curva} ${48 + ancho} ${y}`}
    fill="none" stroke={TINTA} strokeWidth={TRAZO * 0.85} strokeLinecap="round" />
);

const Ceja = ({ x, y, giro = 0, largo = 9 }: { x: number; y: number; giro?: number; largo?: number }) => (
  <path d={`M${x - largo / 2} ${y + giro} Q${x} ${y - 2.4} ${x + largo / 2} ${y - giro}`}
    fill="none" stroke={TINTA} strokeWidth={TRAZO * 0.9} strokeLinecap="round" />
);

/*
 * ═══ EL PELO TIENE QUE TENER VOLUMEN Y NACER DONDE NACE ═══
 *
 * En la primera versión con rasgos, el casco de pelo era una cinta de dos
 * píxeles apoyada en la coronilla: la línea de nacimiento quedaba en el alto
 * del cráneo y abajo sobraba una frente enorme. Por eso la mitad parecían
 * pelados y los nueve se parecían entre sí — lo único que se veía de cada
 * peinado era un hilo.
 *
 * Ahora la cúpula sube por encima del cráneo y baja por los costados hasta la
 * altura de la oreja. Eso le da masa, y la masa es lo que hace que un peinado
 * se distinga de otro.
 *
 * ═══ Y LA FRENTE TIENE QUE EXISTIR ═══
 *
 * La línea de nacimiento estaba en y=32 con las cejas en y=37: cinco unidades
 * de frente en una cara de cuarenta y ocho. Ampliados a cuatro aumentos, cinco
 * de los siete entrenadores tenían una banda oscura cruzándoles la frente al
 * ras de la ceja — se leía como una vincha o el borde de una peluca, no como
 * pelo. Los dos que sí funcionaban —Mateo con su afro y Sofi con la raya al
 * medio— eran justo los dos que mostraban frente.
 *
 * La línea subió a y=27. Diez unidades entre el nacimiento y la ceja, que es
 * más o menos el tercio de cara que tiene una frente de verdad, y la cúpula
 * no se movió: el volumen de arriba sigue entero.
 */
const CARAS: Record<string, Cara> = {
  /* Sofi — melena larga y lacia, raya al medio, cara alargada. */
  sofi: {
    paisaje: 'lago', piel: PIEL.clara, pelo: '#3B2A1E', rx: 18, ry: 23,
    ojos: 9.5, nariz: 54, boca: 6.5, curva: 2,
    atras: <path d="M25 50 C24 18, 72 18, 71 50 C71 66, 73 80, 75 96 L62 96 C61 76, 60 60, 59 48 Z M37 48 C36 60, 35 76, 34 96 L21 96 C23 80, 25 66, 25 50 Z" />,
    adelante: <path d="M25 50 C24 18, 72 18, 71 50 C69 41, 66 31, 48 30 C30 31, 27 41, 25 50 Z" />,
    cejas: <><Ceja x={38} y={37} giro={0.5} /><Ceja x={58} y={37} giro={-0.5} /></>,
  },
  /* Caro — melena corta al mentón, flequillo que cruza, cara redonda. */
  caro: {
    paisaje: 'montana', piel: PIEL.media, pelo: '#4A2B1A', rx: 19, ry: 22,
    ojos: 9, nariz: 54, boca: 7.5, curva: 2.6,
    atras: <path d="M25 50 C24 18, 72 18, 71 50 C71 60, 72 66, 70 72 L60 72 C63 62, 62 54, 61 48 Z M35 48 C34 54, 33 62, 36 72 L26 72 C24 66, 25 60, 25 50 Z" />,
    adelante: <path d="M25 50 C24 18, 72 18, 71 50 C69 42, 68 32, 58 29 C50 34, 38 35, 31 32 C28 38, 26 43, 25 50 Z" />,
    cejas: <><Ceja x={38} y={37} giro={1.4} /><Ceja x={58} y={37} giro={-1.4} /></>,
  },
  /* Vera — recogido alto apoyado en la cúpula, frente despejada. */
  vera: {
    paisaje: 'viento', piel: PIEL.clara, pelo: '#2E2118', rx: 17, ry: 22,
    ojos: 8.5, nariz: 53, boca: 6, curva: 1.2,
    atras: <circle cx="48" cy="20" r="10" />,
    adelante: <path d="M27 48 C26 19, 70 19, 69 48 C67 40, 64 31, 48 30 C32 31, 29 40, 27 48 Z" />,
    cejas: <><Ceja x={38} y={37} giro={0.8} largo={8} /><Ceja x={58} y={37} giro={-0.8} largo={8} /></>,
  },
  /* Ramiro — pelo corto, barba recortada que sigue la mandíbula. */
  ramiro: {
    paisaje: 'rio', piel: PIEL.media, pelo: '#241A12', rx: 19, ry: 23,
    ojos: 10, nariz: 57, boca: 7, curva: 1,
    adelante: <path d="M26 50 C25 19, 71 19, 70 50 C68 41, 65 31, 48 30 C31 31, 28 41, 26 50 Z" />,
    barba: <path d="M31 54 C31 62, 35 70, 41 73 C45 75, 51 75, 55 73 C61 70, 65 62, 65 54 C63 63, 57 68, 48 68 C39 68, 33 63, 31 54 Z" />,
    cejas: <><Ceja x={38} y={36} giro={1} largo={11} /><Ceja x={58} y={36} giro={-1} largo={11} /></>,
  },
  /* Lucas — raya al costado marcada, mandíbula ancha. */
  lucas: {
    paisaje: 'bosque', piel: PIEL.clara, pelo: '#6B4A2A', rx: 20, ry: 22,
    ojos: 10.5, nariz: 55, boca: 8, curva: 1.8,
    adelante: <path d="M26 50 C25 18, 71 18, 70 50 C69 41, 67 31, 57 29 C50 33, 40 33, 33 30 C29 34, 27 43, 26 50 Z" />,
    cejas: <><Ceja x={38} y={37} giro={0.4} largo={10} /><Ceja x={58} y={37} giro={-0.4} largo={10} /></>,
  },
  /* Bruno — calvo con las entradas marcadas, barba llena. */
  bruno: {
    paisaje: 'montana', piel: PIEL.oscura, pelo: '#1C1410', rx: 20, ry: 23,
    ojos: 10, nariz: 56, boca: 8.5, curva: 2.2,
    adelante: <path d="M27 52 C27 44, 28 38, 31 35 C30 42, 30 48, 30 52 Z M69 52 C69 44, 68 38, 65 35 C66 42, 66 48, 66 52 Z" />,
    barba: <path d="M29 52 C29 63, 34 73, 41 76 C45 78, 51 78, 55 76 C62 73, 67 63, 67 52 C65 64, 58 70, 48 70 C38 70, 31 64, 29 52 Z" />,
    cejas: <><Ceja x={38} y={37} giro={1.2} largo={11} /><Ceja x={58} y={37} giro={-1.2} largo={11} /></>,
  },
  /* Diego — ondas medias que caen por detrás de la oreja, cara larga. */
  diego: {
    paisaje: 'bosque', piel: PIEL.media, pelo: '#33231A', rx: 18, ry: 24,
    ojos: 8.5, nariz: 56, boca: 6.5, curva: 0.8,
    atras: <path d="M25 50 C24 17, 72 17, 71 50 C71 60, 72 66, 70 70 L61 70 C64 60, 63 54, 62 48 Z M34 48 C33 54, 32 60, 35 70 L26 70 C24 66, 25 60, 25 50 Z" />,
    adelante: <path d="M25 50 C24 17, 72 17, 71 50 C70 42, 68 32, 61 30 C55 30, 43 31, 36 31 C30 33, 27 42, 25 50 Z" />,
    cejas: <><Ceja x={38} y={38} giro={1.8} /><Ceja x={58} y={37} giro={-1.2} /></>,
  },
  /* Mateo — rulos. Tres bultos sobre la cúpula, nunca a la misma altura. */
  mateo: {
    paisaje: 'viento', piel: PIEL.oscura, pelo: '#1F1710', rx: 19, ry: 22,
    ojos: 9.5, nariz: 54, boca: 7.5, curva: 2.8,
    atras: <><circle cx="30" cy="29" r="11" /><circle cx="48" cy="17" r="13" /><circle cx="66" cy="30" r="10" /></>,
    adelante: <path d="M26 50 C25 20, 71 20, 70 50 C68 42, 65 31, 48 30 C31 31, 28 42, 26 50 Z" />,
    cejas: <><Ceja x={38} y={37} giro={1} /><Ceja x={58} y={37} giro={-1} /></>,
  },
  /* El Mentor — pelo corto peinado hacia atrás, barba corta. */
  mentor: {
    paisaje: 'lago', piel: PIEL.media, pelo: '#2A1D14', rx: 19, ry: 23,
    ojos: 9.5, nariz: 56, boca: 7, curva: 1.4,
    adelante: <path d="M26 50 C25 18, 71 18, 70 50 C68 41, 66 30, 48 29 C30 30, 28 41, 26 50 Z" />,
    barba: <path d="M31 53 C31 62, 35 71, 41 74 C45 76, 51 76, 55 74 C61 71, 65 62, 65 53 C63 63, 57 69, 48 69 C39 69, 33 63, 31 53 Z" />,
    cejas: <><Ceja x={38} y={36} giro={0.8} largo={10} /><Ceja x={58} y={36} giro={-0.8} largo={10} /></>,
  },
};

function clave(quien: string): string | null {
  const q = (quien || '').toLowerCase();
  return Object.keys(CARAS).find((k) => q.includes(k)) ?? null;
}

/** Si hay un retrato dibujado para ese nombre. */
export function hayRetrato(quien: string): boolean {
  return Boolean(clave(quien));
}

export default function RetratoEntrenador({
  quien, tam = 56, className = '',
}: {
  /** El id o el nombre: 'sofi', 'agente-diego-producto', 'mentor'. */
  quien: string;
  tam?: number;
  className?: string;
}) {
  const k = clave(quien) ?? 'mentor';
  const c = CARAS[k];
  const p = PAISAJE[c.paisaje];
  const id = `ret-${k}`;
  const rx = c.rx ?? 19;
  const ry = c.ry ?? 23;
  return (
    <svg
      width={tam} height={tam} viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label={`Retrato de ${k === 'mentor' ? 'tu Mentor' : k[0].toUpperCase() + k.slice(1)}`}
    >
      <defs>
        <clipPath id={id}><circle cx="48" cy="48" r="47" /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <circle cx="48" cy="48" r="47" fill={p.fondo} />

        {/* El pelo de atrás, antes que nada. */}
        <g fill={c.pelo}>{c.atras}</g>

        {/* Los hombros y el cuello. El cuello en piel: sin él la cabeza
            flota, que es lo que más delata a un avatar mal armado. */}
        <path d="M41 66 H55 V80 H41 Z" fill={c.piel} />
        <path d="M2 96 C2 82, 20 75, 48 75 C76 75, 94 82, 94 96 Z" fill={p.ropa} />

        {/* La cara. */}
        <ellipse cx="48" cy="45" rx={rx + 1} ry={ry + 1} fill={c.piel} />

        {/* Las orejas, apenas. Dan ancho a la cabeza sin pedir atención. */}
        <ellipse cx={47 - rx} cy="48" rx="2.6" ry="4" fill={c.piel} />
        <ellipse cx={49 + rx} cy="48" rx="2.6" ry="4" fill={c.piel} />

        {/* La barba va sobre la cara y debajo del pelo de adelante. */}
        {c.barba && <g fill={c.pelo}>{c.barba}</g>}

        {/* Los rasgos. */}
        {c.cejas}
        <Ojo x={48 - (c.ojos ?? 9)} />
        <Ojo x={48 + (c.ojos ?? 9)} />
        <Nariz y={c.nariz ?? 55} />
        <Boca y={(c.nariz ?? 55) + 8} ancho={c.boca ?? 7} curva={c.curva ?? 1.6} />

        {/* El pelo de adelante, lo último: tapa el nacimiento. */}
        <g fill={c.pelo}>{c.adelante}</g>
      </g>
      {/* El aro: una línea de 1px en oro. Nunca relleno. */}
      <circle cx="48" cy="48" r="46.5" fill="none" stroke={ORO} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
