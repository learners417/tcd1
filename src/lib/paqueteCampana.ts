import { armarCarrusel, auditarPieza, revisarPoliticas, formulaPorId } from './formulasAnuncios';

/**
 * EL PAQUETE — todo lo que hace falta para encender, en un solo lugar.
 *
 * El problema que resuelve: las piezas de una campaña viven repartidas por
 * toda la app. Los anuncios en el Constructor, la palabra clave en el brief,
 * el DM y la página en sesiones distintas del Camino. Para encender, el
 * sanador tenía que recorrer cinco pantallas, copiar de a pedazos y armar
 * el rompecabezas a mano — justo el día que más nervioso está.
 *
 * Esto NO genera nada nuevo: junta lo que ya existe, dice qué falta y dónde
 * se consigue, y lo entrega listo para copiar.
 */

export type EstadoPieza = 'listo' | 'falta' | 'revisar';

export interface PiezaPaquete {
  id: string;
  titulo: string;
  /** Vacío si todavía no existe. */
  contenido: string;
  /** Dónde se consigue lo que falta. */
  donde: string;
  /** Sin esto no se puede encender. */
  obligatoria: boolean;
  estado: EstadoPieza;
  /** Qué hay que mirar, cuando el estado es 'revisar'. */
  aviso?: string;
}

export interface Paquete {
  piezas: PiezaPaquete[];
  /** true = están todas las obligatorias. */
  completo: boolean;
  /** Los títulos de las obligatorias que faltan. */
  faltan: string[];
  /** Todo junto, para copiar de una. */
  textoCompleto: string;
}

export interface FuentesPaquete {
  /** Las piezas escritas por el Constructor. */
  piezas: Record<number, { formulaId: number; texto: string }>;
  /** Los ids elegidos, en orden. */
  elegidas: number[];
  /** La secuencia de 3 stories. */
  stories: string;
  /** El brief del Constructor. */
  brief: { palabra?: string; oferta?: string; metodo?: string };
  /** Las notas de las sesiones del Camino, por código. */
  notas: Record<string, string>;
}

/** Las notas de sesión vienen como markdown: al paquete va la respuesta. */
function limpiarNota(v: unknown): string {
  return String(v ?? '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('##'))
    .join('\n')
    .trim();
}

/** De qué sesión sale cada pieza que no escribe el Constructor. */
const ORIGEN_SESION: Record<string, { codigo: string; sesion: string }> = {
  dm: { codigo: 'P4.5', sesion: 'Tu DM automático — el link y UNA pregunta' },
  pagina: { codigo: 'P4.2d', sesion: 'Tu página de venta — el precio en privado' },
  dominio: { codigo: 'P4.5b', sesion: 'Tu dirección digital — el dominio' },
};

export function armarPaquete(f: FuentesPaquete): Paquete {
  const piezas: PiezaPaquete[] = [];
  const palabra = (f.brief.palabra ?? '').trim();

  // ── Los 3 anuncios ──
  f.elegidas.forEach((id, i) => {
    const p = f.piezas[id];
    const formula = formulaPorId(id);
    const nombre = formula?.nombre ?? `Anuncio ${i + 1}`;
    const titulo = `Anuncio ${i + 1} · ${nombre}`;

    if (!p?.texto?.trim()) {
      piezas.push({
        id: `anuncio-${id}`, titulo, contenido: '',
        donde: 'Se escribe arriba, en el Constructor.',
        obligatoria: true, estado: 'falta',
      });
      return;
    }

    const car = armarCarrusel(p.texto, palabra);
    const audit = auditarPieza(p.texto);
    const bloqueantes = revisarPoliticas(p.texto).filter((x) => x.gravedad === 'bloquea');

    const cuerpo = car.problema
      ? p.texto
      : [
          ...car.laminas.map((l) =>
            `${l.tipo === 'portada' ? 'PORTADA' : l.tipo === 'cierre' ? 'CIERRE' : `LÁMINA ${l.n}`}: ${l.texto}`),
          car.caption ? `\nTEXTO DEL POST: ${car.caption}` : '',
        ].filter(Boolean).join('\n');

    const problemas = [
      ...(audit.aprobada ? [] : [`le faltan ingredientes: ${audit.faltantes.join(', ')}`]),
      ...bloqueantes.map((b) => `no se puede publicar: «${b.que}»`),
      ...(palabra && !car.palabraPresente ? [`falta tu palabra «${palabra}» en el cierre`] : []),
    ];

    piezas.push({
      id: `anuncio-${id}`, titulo, contenido: cuerpo,
      donde: 'Se corrige arriba, en el Constructor.',
      obligatoria: true,
      estado: problemas.length ? 'revisar' : 'listo',
      aviso: problemas.length ? problemas.join(' · ') : undefined,
    });
  });

  // ── La secuencia de stories ──
  piezas.push({
    id: 'stories',
    titulo: 'Tus 3 stories de acompañamiento',
    contenido: f.stories.trim(),
    donde: 'Salen junto con los anuncios, en el Constructor.',
    obligatoria: false,
    estado: f.stories.trim() ? 'listo' : 'falta',
  });

  // ── La palabra clave ──
  piezas.push({
    id: 'palabra',
    titulo: 'Tu palabra clave',
    contenido: palabra,
    donde: 'Se define en la sesión «Tu PALABRA — la llave de tu campaña».',
    obligatoria: true,
    estado: palabra ? 'listo' : 'falta',
    aviso: palabra ? undefined : 'Es lo que dispara el mensaje automático cuando alguien comenta.',
  });

  // ── Lo que se sella en el Camino ──
  for (const [id, titulo] of [
    ['dm', 'Tu DM automático'],
    ['pagina', 'Tu página de venta'],
    ['dominio', 'Tu dirección digital'],
  ] as const) {
    const o = ORIGEN_SESION[id];
    const contenido = limpiarNota(f.notas[o.codigo]);
    piezas.push({
      id, titulo, contenido,
      donde: `Se sella en la sesión «${o.sesion}».`,
      obligatoria: id !== 'dominio',
      estado: contenido ? 'listo' : 'falta',
    });
  }

  const faltan = piezas
    .filter((p) => p.obligatoria && p.estado !== 'listo')
    .map((p) => p.titulo);

  const textoCompleto = piezas
    .filter((p) => p.contenido)
    .map((p) => `═══ ${p.titulo.toUpperCase()} ═══\n\n${p.contenido}`)
    .join('\n\n\n');

  return { piezas, completo: faltan.length === 0, faltan, textoCompleto };
}
