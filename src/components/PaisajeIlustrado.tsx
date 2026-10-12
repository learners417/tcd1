/**
 * LAS CINCO ILUSTRACIONES — el mismo dibujo que la tapa de cada libro.
 *
 * ═══ CÓMO ESTÁN HECHAS ═══
 *
 * Siluetas de color plano, por capas, con la línea de oro arriba. Es el
 * lenguaje de las tapas de la colección, y se eligió así por tres razones:
 *
 *   · Sin degradés ni brillos. El dorado brillante se ve barato porque ya todos
 *     lo copiaron cuando buscaron qué significaba high ticket.
 *   · En SVG puro, sin imágenes. Pesa nada, escala a cualquier tamaño y se ve
 *     igual en un teléfono viejo que en una pantalla grande.
 *   · Las capas de atrás más claras y las de adelante más oscuras: es lo que da
 *     profundidad sin usar sombras.
 *
 * Cada una está dibujada a mano con coordenadas, no generada: las irregulares
 * son irregulares a propósito. Una montaña perfectamente simétrica se ve hecha
 * por una máquina, y eso es exactamente lo que no queremos que parezca.
 */
import React from 'react';
import { type Paisaje, TINTA_LIBRO } from '../lib/losCincoPaisajes';

/** El trazo de oro. Una sola línea de 1px, nunca relleno. */
const ORO = TINTA_LIBRO.oro;

function Lago({ c }: { c: Paisaje['color'] }) {
  return (
    <>
      {/* El sol, en línea de oro: el único círculo de las cinco. */}
      <circle cx="58" cy="62" r="21" fill="none" stroke={ORO} strokeWidth="1" opacity="0.75" />
      {/* Cordillera del fondo */}
      <path d="M0 118 L34 84 L52 97 L74 72 L96 94 L118 76 L142 98 L170 80 L200 104 L200 150 L0 150 Z"
        fill={c.medio} opacity="0.5" />
      {/* La grande, con nieve */}
      <path d="M86 150 L128 68 L148 92 L166 74 L200 118 L200 150 Z" fill={c.medio} />
      <path d="M118 84 L128 68 L138 84 L132 88 L126 82 L122 88 Z" fill={c.claro} />
      <path d="M158 86 L166 74 L176 90 L170 92 L165 86 Z" fill={c.claro} />
      {/* El agua, con su línea de horizonte en oro */}
      <path d="M0 150 H200 V260 H0 Z" fill={c.hondo} />
      <path d="M0 150 H200" stroke={ORO} strokeWidth="1" opacity="0.5" />
      {/* El reflejo: la misma cordillera, quieta */}
      <path d="M86 150 L128 232 L148 208 L166 226 L200 182 L200 150 Z" fill={c.medio} opacity="0.22" />
      {[168, 184, 200, 216, 232].map((y, i) => (
        <path key={y} d={`M${18 + i * 6} ${y} H${182 - i * 6}`}
          stroke={c.claro} strokeWidth="0.9" opacity={0.3 - i * 0.04} />
      ))}
    </>
  );
}

function Montana({ c }: { c: Paisaje['color'] }) {
  return (
    <>
      <path d="M0 196 L44 120 L72 150 L104 96 L138 148 L168 118 L200 164 L200 260 L0 260 Z"
        fill={c.medio} opacity="0.45" />
      {/* La cumbre, asimétrica a propósito */}
      <path d="M22 260 L104 62 L134 118 L156 92 L200 182 L200 260 Z" fill={c.medio} />
      <path d="M88 104 L104 62 L120 104 L112 98 L104 110 L96 96 Z" fill={c.claro} />
      {/* La huella: la línea de oro que sube por etapas, no derecho */}
      <path d="M58 250 L74 212 L68 188 L86 158 L80 132 L98 92 L104 66"
        fill="none" stroke={ORO} strokeWidth="1" strokeDasharray="3 4" opacity="0.8" />
      {/* Los tres campamentos */}
      {[[74, 212], [86, 158], [98, 92]].map(([x, y]) => (
        <path key={`${x}`} d={`M${x - 4} ${y + 3} L${x} ${y - 4} L${x + 4} ${y + 3} Z`}
          fill="none" stroke={ORO} strokeWidth="1" />
      ))}
      <path d="M0 260 L40 206 L92 260 Z" fill={c.hondo} />
      <path d="M142 260 L186 198 L200 220 L200 260 Z" fill={c.hondo} />
    </>
  );
}

function Viento({ c }: { c: Paisaje['color'] }) {
  // Las rachas: siempre en la misma dirección, nunca a la misma altura.
  const rachas = [
    [18, 88, 96], [62, 74, 128], [8, 112, 150], [96, 96, 88], [34, 132, 120],
    [120, 118, 72], [24, 152, 142], [78, 164, 104], [142, 142, 56], [10, 176, 118],
  ];
  return (
    <>
      {rachas.map(([x, y, w], i) => (
        <path key={i} d={`M${x} ${y} h${w}`} stroke={c.claro} strokeWidth={i % 3 === 0 ? 1.6 : 1}
          opacity={0.75 - (i % 4) * 0.12} strokeLinecap="round" />
      ))}
      {/* El pájaro, en oro, yendo con el viento */}
      <path d="M118 100 q8 -7 16 0 q8 -7 16 0" fill="none" stroke={ORO} strokeWidth="1.2"
        strokeLinecap="round" />
      {/* La bandera patagónica: el árbol que creció inclinado */}
      <path d="M152 260 L150 176" stroke={c.hondo} strokeWidth="3.5" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M150 ${182 + i * 16} q-18 -9 -34 -4 q14 2 20 10 q-12 0 -20 6`}
          fill={c.hondo} opacity={0.9 - i * 0.12} />
      ))}
      {/* La estepa */}
      <path d="M0 232 L52 218 L96 228 L148 214 L200 226 L200 260 L0 260 Z" fill={c.hondo} opacity="0.55" />
      <path d="M0 246 L60 238 L120 246 L200 240 L200 260 L0 260 Z" fill={c.hondo} />
    </>
  );
}

function Rio({ c }: { c: Paisaje['color'] }) {
  return (
    <>
      <path d="M0 130 L48 118 L104 128 L156 116 L200 126 L200 260 L0 260 Z"
        fill={c.medio} opacity="0.35" />
      {/* El río: una sola curva que no se repite */}
      <path d="M100 118 C96 152 128 168 124 196 C120 224 84 234 88 260"
        fill="none" stroke={c.claro} strokeWidth="19" strokeLinecap="round" opacity="0.92" />
      <path d="M100 118 C96 152 128 168 124 196 C120 224 84 234 88 260"
        fill="none" stroke={TINTA_LIBRO.papel} strokeWidth="7" strokeLinecap="round" opacity="0.55" />
      {/* La línea de oro del cauce: lo que el agua hizo pasando siempre igual */}
      <path d="M100 118 C96 152 128 168 124 196 C120 224 84 234 88 260"
        fill="none" stroke={ORO} strokeWidth="0.9" strokeDasharray="2 6" opacity="0.7" />
      {/* El horizonte de donde sale */}
      <path d="M28 118 H172" stroke={c.claro} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      {/* Las piedras del cauce */}
      {[[146, 212, 7], [60, 236, 6], [158, 240, 5], [46, 198, 4]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c.hondo} opacity="0.7" />
      ))}
    </>
  );
}

function Bosque({ c }: { c: Paisaje['color'] }) {
  // Coihues de follaje en pisos, como en la tapa del libro.
  const arbol = (x: number, base: number, alto: number, ancho: number, k: string) => {
    const top = base - alto;
    const pisos = 4;
    return (
      <g key={k}>
        <path d={`M${x} ${base} V${top + 4}`} stroke={c.hondo} strokeWidth="2.4" strokeLinecap="round" />
        {Array.from({ length: pisos }, (_, i) => {
          const y = top + 6 + (i * alto * 0.6) / pisos;
          const w = (ancho * (0.42 + (0.58 * (i + 1)) / pisos)) / 2;
          const off = (i % 2 === 0 ? -1 : 1) * ancho * 0.07;
          return (
            <path key={i}
              d={`M${x - w + off} ${y + 3} Q${x + off} ${y - 5} ${x + w + off} ${y + 3} Z`}
              fill={c.hondo} />
          );
        })}
      </g>
    );
  };

  return (
    <>
      <path d="M0 150 L40 126 L88 142 L136 120 L200 140 L200 260 L0 260 Z" fill={c.medio} opacity="0.3" />
      {/* Los de atrás, más claros */}
      {[[24, 196, 62, 26], [66, 196, 48, 21], [112, 196, 70, 29], [160, 196, 54, 23], [192, 196, 44, 19]]
        .map(([x, b, a, w], i) => (
          <g key={`f${i}`} opacity="0.5">{arbol(x, b, a, w, `f${i}`)}</g>
        ))}
      {/* Los de adelante */}
      {[[8, 218, 78, 32], [48, 218, 62, 27], [96, 218, 88, 36], [146, 218, 68, 29], [186, 218, 58, 25]]
        .map(([x, b, a, w], i) => arbol(x, b, a, w, `d${i}`))}
      <path d="M0 218 H200 V260 H0 Z" fill={c.hondo} />
      {/* LAS RAÍCES QUE SE TOCAN. Es la idea del libro entero: el bosque es una
          sola cosa. Van en oro, debajo de la línea de tierra. */}
      <path d="M0 218 H200" stroke={ORO} strokeWidth="0.9" opacity="0.55" />
      <g fill="none" stroke={ORO} strokeWidth="0.9" opacity="0.75" strokeLinecap="round">
        <path d="M8 218 C14 232 30 230 48 218" />
        <path d="M48 218 C62 236 82 232 96 218" />
        <path d="M96 218 C112 240 132 234 146 218" />
        <path d="M146 218 C160 234 176 230 186 218" />
        <path d="M28 226 C44 244 70 240 88 250 M120 232 C140 246 160 242 172 234" />
        <path d="M60 230 V246 M104 236 V252 M150 228 V242" opacity="0.5" />
      </g>
    </>
  );
}

const DIBUJOS: Record<string, React.FC<{ c: Paisaje['color'] }>> = {
  lago: Lago, montana: Montana, viento: Viento, rio: Rio, bosque: Bosque,
};

/**
 * La ilustración de un paisaje.
 *
 * `alto` en píxeles; el ancho se adapta. El `viewBox` es 200×260 en los cinco,
 * así que todos recortan igual y se ven como una serie.
 */
export default function PaisajeIlustrado(
  { paisaje, alto = 160, ancho, apaisado = false, className = '' }:
  {
    paisaje: Paisaje; alto?: number; ancho?: number | string;
    /** Una franja ancha en vez de la tapa vertical. */
    apaisado?: boolean;
    className?: string;
  },
) {
  const Dibujo = DIBUJOS[paisaje.id];
  if (!Dibujo) return null;

  /**
   * EL ENCUADRE.
   *
   * Los cinco están dibujados en 200 × 260, vertical como la tapa de un libro.
   * En el teléfono el espacio es una franja ancha, y un dibujo vertical ahí
   * dentro se recorta: con el recorte por arriba se veía solo el cielo, y con
   * el recorte por abajo solo el agua.
   *
   * Así que en apaisado se mueve el viewBox: alto 130 en vez de 260, centrado
   * en el `foco` de cada paisaje — la línea del agua, la cumbre, las raíces.
   * El dibujo no se deforma ni se recorta en los bordes: se mira la parte que
   * cuenta.
   */
  /**
   * EL PANORAMA.
   *
   * Un dibujo de 200 × 260 metido en una franja de 430 × 150 se recorta tanto
   * que queda abstracto: se ve un pedazo de color y nada más.
   *
   * Así que en apaisado el paisaje se refleja a los lados. Es como se arma un
   * panorama de verdad —la cordillera sigue, el bosque sigue— y funciona
   * porque los cinco son paisajes: una montaña espejada es otra montaña, y el
   * ojo no busca la costura. Sale continuo y sin redibujar nada.
   */
  const ALTO_FRANJA = 150;
  const y = apaisado
    ? Math.max(0, Math.min(260 - ALTO_FRANJA, paisaje.foco * 260 - ALTO_FRANJA / 2))
    : 0;
  // Tres copias: el ancho es 600 y el alto 150, que es la proporción de la
  // franja del teléfono. Así llena sin deformarse y sin recortar casi nada.
  const vb = apaisado ? `-200 ${y} 600 ${ALTO_FRANJA}` : '0 0 200 260';

  return (
    <svg
      viewBox={vb}
      height={alto}
      width={ancho ?? (alto * 200) / 260}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      // Decorativa: el texto de al lado ya dice todo lo que esto muestra, y
      // leerlo dos veces con lector de pantalla es peor que no leerlo.
      aria-hidden="true"
      style={{ display: 'block', background: paisaje.color.fondo }}
    >
      {apaisado && (
        <>
          <g transform="translate(0,0) scale(-1,1)"><Dibujo c={paisaje.color} /></g>
          <g transform="translate(400,0) scale(-1,1)"><Dibujo c={paisaje.color} /></g>
        </>
      )}
      <Dibujo c={paisaje.color} />
    </svg>
  );
}
