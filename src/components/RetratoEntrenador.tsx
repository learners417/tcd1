/**
 * LOS RETRATOS — la cara de cada entrenador y la del Mentor.
 *
 * ═══ QUÉ REEMPLAZA ═══
 *
 * Una letra dentro de un círculo fino: «C» para Caro, «M» para Mateo, «M»
 * otra vez para el Mentor. Nueve guías de los que se espera que acompañen
 * durante noventa días, representados por su inicial.
 *
 * ═══ EL PRIMER INTENTO NO SIRVIÓ, Y POR QUÉ ═══
 *
 * Primero se dibujaron de frente: cabeza ovalada, hombros, y el pelo encima.
 * Mirados en el visor, los nueve eran la misma mancha. De frente, lo único
 * que distingue a una persona son los rasgos —ojos, boca, nariz— y los
 * rasgos dibujados caen en caricatura casi siempre. Sin rasgos, de frente,
 * no queda nada: nueve óvalos iguales.
 *
 * ═══ POR QUÉ DE PERFIL ═══
 *
 * El perfil ES el rasgo. La frente, la nariz, el labio y el mentón dibujan
 * una línea que se reconoce como una persona concreta sin dibujar un solo
 * ojo, y que sigue leyéndose a 36 píxeles. Es la convención del camafeo y de
 * los frontispicios de los libros viejos, que es de donde viene la estética
 * de esta app.
 *
 * Y resuelve el contraste: el busto va en tinta oscura sobre un fondo claro
 * del mismo color. La silueta se separa sola, sin depender de que el pelo
 * tenga otro tono.
 *
 * ═══ CÓMO ESTÁN HECHOS ═══
 *
 * Con el lenguaje de las tapas: color plano, por capas, con una línea de oro
 * —el aro— y nada más de oro. En SVG puro: pesa nada y se ve igual en un
 * teléfono viejo que en una pantalla grande.
 *
 * Cada perfil está dibujado a mano con coordenadas. Las narices son
 * distintas, los mentones son distintos y las frentes son distintas: eso es
 * lo que hace que sean nueve personas y no un ícono repetido.
 */
import React from 'react';
import { TINTA_LIBRO } from '../lib/losCincoPaisajes';

const ORO = TINTA_LIBRO.oro;

/** El fondo claro y la tinta del busto. Dos tonos, mucho contraste. */
interface Tinta { fondo: string; tinta: string }

/**
 * La paleta sale de los cinco paisajes, no de colores nuevos: el lago, la
 * montaña, el viento, el río y el bosque. Así los entrenadores pertenecen al
 * mismo mundo que el Camino en el que aparecen.
 *
 * ACÁ HABÍA UN AZUL FRÍO —rgba(96,165,250)— en tres de los ocho anillos, y
 * un ámbar brillante en otros dos. Ninguno está en la paleta de la casa, y
 * el azul sobre papel crema era lo único de toda la app que no pertenecía a
 * ningún libro.
 */
const TINTAS: Record<string, Tinta> = {
  lago:    { fondo: '#9FC5D8', tinta: '#123A52' },
  montana: { fondo: '#D8B49C', tinta: '#5C3523' },
  viento:  { fondo: '#CFC892', tinta: '#4A4522' },
  rio:     { fondo: '#A6CFC8', tinta: '#11423E' },
  bosque:  { fondo: '#B6C9A8', tinta: '#223A27' },
};

/**
 * EL BUSTO, DE PERFIL, MIRANDO A LA IZQUIERDA.
 *
 * Una sola silueta cerrada. El borde izquierdo es la cara: se entra por la
 * frente, baja por el puente, sale la nariz, entra el labio, sale el mentón,
 * y de ahí al cuello y al hombro.
 *
 * `perfil` es lo único que cambia de persona a persona —el tramo de la
 * frente al mentón— y el resto se comparte, que es lo que las vuelve una
 * familia.
 */
function Busto({ c, perfil, nuca = 'C70 58, 66 56, 63 52' }: { c: Tinta; perfil: string; nuca?: string }) {
  return (
    <path
      d={`M74 96 L74 70 ${nuca} ${perfil} C38 64, 44 66, 46 72 C32 76, 22 84, 22 96 Z`}
      fill={c.tinta}
    />
  );
}

type Dibujo = (c: Tinta) => React.ReactNode;

/**
 * Nueve perfiles. El tramo que va de la coronilla al mentón, escrito como
 * una curva por persona.
 */
const DIBUJOS: Record<string, { tinta: keyof typeof TINTAS; dibujo: Dibujo }> = {
  /* Sofi — frente alta, nariz corta y recta, pelo largo por la espalda. */
  sofi: {
    tinta: 'lago',
    dibujo: (c) => (
      <>
        <path d="M63 24 C78 30, 80 56, 78 96 L62 96 C68 70, 66 44, 60 30 Z" fill={c.tinta} opacity="0.8" />
        <Busto c={c} perfil="C60 40, 56 20, 42 20 C31 20, 26 30, 27 40 L24 47 L29 50 L26 55 L32 60" />
        <path d="M27 38 C26 22, 36 15, 46 16 C58 17, 66 26, 65 40 C60 28, 52 23, 44 23 C35 23, 29 29, 27 38 Z" fill={c.tinta} />
      </>
    ),
  },
  /* Caro — mentón corto, nariz respingada, melena a la altura del mentón. */
  caro: {
    tinta: 'montana',
    dibujo: (c) => (
      <>
        <Busto c={c} perfil="C61 40, 57 21, 43 21 C32 21, 27 31, 28 41 L25 47 L31 49 L28 54 L34 59" />
        <path d="M28 40 C26 23, 37 16, 47 17 C60 18, 67 27, 66 42 C66 50, 67 56, 65 61 L58 61 C61 52, 60 42, 59 36 C54 29, 46 25, 39 27 C33 29, 29 34, 28 40 Z" fill={c.tinta} />
      </>
    ),
  },
  /* Vera — recogido alto en la nuca, frente despejada, nariz fina. */
  vera: {
    tinta: 'viento',
    dibujo: (c) => (
      <>
        <circle cx="71" cy="29" r="9" fill={c.tinta} />
        <Busto c={c} perfil="C60 39, 56 19, 42 19 C31 19, 26 29, 27 39 L23 46 L29 49 L25 54 L32 59" />
        <path d="M27 37 C26 21, 37 14, 47 15 C59 16, 66 25, 65 38 C60 27, 52 22, 44 22 C35 22, 29 28, 27 37 Z" fill={c.tinta} />
      </>
    ),
  },
  /* Ramiro — nariz grande y recta, barba recortada que alarga el mentón. */
  ramiro: {
    tinta: 'rio',
    dibujo: (c) => (
      <>
        <Busto c={c} perfil="C61 41, 57 22, 43 22 C32 22, 27 32, 28 42 L22 50 L29 52 L26 57 L31 63 C38 66, 44 64, 48 60" />
        <path d="M28 41 C27 25, 38 18, 48 19 C60 20, 67 29, 66 42 C61 31, 53 26, 45 26 C36 26, 30 32, 28 41 Z" fill={c.tinta} />
      </>
    ),
  },
  /* Lucas — frente recta, mentón cuadrado, pelo corto con raya. */
  lucas: {
    tinta: 'bosque',
    dibujo: (c) => (
      <>
        <Busto c={c} perfil="C61 40, 58 22, 43 22 C33 22, 28 31, 28 41 L24 48 L30 50 L28 56 L30 61 L38 62" />
        <path d="M28 40 C27 24, 38 17, 48 18 C60 19, 67 27, 66 40 C62 32, 56 27, 48 26 C40 25, 32 31, 28 40 Z" fill={c.tinta} />
      </>
    ),
  },
  /* Bruno — calvo, barba llena. La cabeza se ve entera. */
  bruno: {
    tinta: 'montana',
    dibujo: (c) => (
      <>
        <Busto c={c} perfil="C62 40, 58 20, 43 20 C31 20, 26 31, 27 41 L22 49 L29 51 L25 57 L30 65 C39 69, 47 66, 51 60" />
      </>
    ),
  },
  /* Diego — ondas medias que se abren atrás, nariz con caballete. */
  diego: {
    tinta: 'bosque',
    dibujo: (c) => (
      <>
        <path d="M64 26 C76 32, 76 50, 72 64 L62 64 C66 50, 66 36, 60 30 Z" fill={c.tinta} opacity="0.8" />
        <Busto c={c} perfil="C61 40, 57 21, 43 21 C32 21, 27 31, 28 41 L23 48 L30 50 L27 55 L33 60" />
        <path d="M28 40 C26 22, 38 15, 48 16 C61 17, 68 27, 66 42 C64 33, 60 28, 56 29 C50 24, 40 24, 34 30 C31 31, 29 35, 28 40 Z" fill={c.tinta} />
      </>
    ),
  },
  /* Mateo — rulos. Tres bultos, nunca a la misma altura. */
  mateo: {
    tinta: 'viento',
    dibujo: (c) => (
      <>
        <circle cx="38" cy="18" r="9" fill={c.tinta} />
        <circle cx="52" cy="14" r="10" fill={c.tinta} />
        <circle cx="65" cy="21" r="9" fill={c.tinta} />
        <Busto c={c} perfil="C61 40, 57 23, 43 23 C32 23, 27 32, 28 42 L24 48 L30 50 L27 56 L33 61" />
        <path d="M28 41 C27 26, 38 20, 48 21 C60 22, 67 30, 66 43 C61 32, 53 27, 45 27 C36 27, 30 33, 28 41 Z" fill={c.tinta} />
      </>
    ),
  },
  /* El Mentor — frente amplia, nariz marcada, barba corta. El que más se
     mira de los nueve: es el único que acompaña el Camino entero. */
  mentor: {
    tinta: 'lago',
    dibujo: (c) => (
      <>
        <Busto c={c} perfil="C61 40, 57 21, 42 21 C31 21, 26 31, 27 41 L21 49 L28 51 L25 56 L30 63 C38 67, 45 64, 49 59" />
        <path d="M27 40 C26 23, 37 16, 47 17 C60 18, 67 27, 66 41 C61 30, 53 25, 45 25 C36 25, 29 31, 27 40 Z" fill={c.tinta} />
      </>
    ),
  },
};

function clave(quien: string): string | null {
  const q = (quien || '').toLowerCase();
  return Object.keys(DIBUJOS).find((k) => q.includes(k)) ?? null;
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
  const { tinta, dibujo } = DIBUJOS[k];
  const c = TINTAS[tinta];
  const id = `ret-${k}`;
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
        <circle cx="48" cy="48" r="47" fill={c.fondo} />
        {dibujo(c)}
      </g>
      {/* El aro: una línea de 1px en oro. Nunca relleno. */}
      <circle cx="48" cy="48" r="46.5" fill="none" stroke={ORO} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
