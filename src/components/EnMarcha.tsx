import { MessageSquare, Send, Megaphone, PenLine } from 'lucide-react';

/**
 * EN MARCHA — la segunda zona del Dashboard.
 *
 * El modelo de "una sola cosa" funciona hasta el día 21 y se cae en el 22:
 * desde ahí el cliente tiene la sesión del día, una publicación que sale,
 * mensajes sin responder y una campaña corriendo. Si la pantalla insiste en
 * mostrar una, las otras tres se vuelven invisibles y se caen.
 *
 * Esto NO son tareas: es estado. No se tildan, se sostienen. Por eso se miden
 * por racha y no por completado — "catorce de veinte, cuatro días seguidos" es
 * la forma que la cabeza entiende sin esfuerzo.
 *
 * Antes del día 11 no existe: un panel vacío durante diez días enseña a
 * ignorarlo.
 */

export interface EstadoEnMarcha {
  /** Mensajes nuevos enviados hoy a su red. Se sostiene desde el día 14. */
  mensajesHoy?: number;
  /** Racha de días seguidos cumpliendo los dos mensajes. */
  rachaMensajes?: number;
  /** Conversaciones esperando respuesta. */
  sinResponder?: number;
  /** true si ya publicó hoy. Se sostiene desde el día 11. */
  publicoHoy?: boolean;
  /** Ángulo que le toca hoy según el calendario. */
  anguloHoy?: string | null;
  /** true si tiene campaña corriendo. Desde el día 31. */
  campanaActiva?: boolean;
  /** Costo por agenda de los últimos días, si hay campaña. */
  costoPorAgenda?: number | null;
}

const META_MENSAJES = 2;

interface Fila {
  clave: string;
  icono: typeof Send;
  titulo: string;
  detalle: string;
  alDia: boolean;
  pie?: string;
  ir?: string;
}

export default function EnMarcha({
  dia,
  estado,
  onIr,
}: {
  dia: number;
  estado: EstadoEnMarcha;
  onIr?: (destino: string) => void;
}) {
  // Antes del día 11 no hay nada corriendo todavía.
  if (dia < 11) return null;

  const filas: Fila[] = [];

  // ── Publicar ── desde el día 11, una por día
  if (dia >= 11 && estado.publicoHoy !== undefined) {
    const ok = estado.publicoHoy === true;
    filas.push({
      clave: 'publicar',
      icono: PenLine,
      titulo: 'Publicar',
      detalle: ok
        ? 'Ya salió la de hoy'
        : estado.anguloHoy
          ? `Hoy toca: ${estado.anguloHoy}`
          : 'Falta la de hoy',
      alDia: ok,
      ir: 'creador',
    });
  }

  // ── Mensajes ── desde el día 14, dos por día
  if (dia >= 14 && estado.mensajesHoy !== undefined) {
    const enviados = estado.mensajesHoy;
    const ok = enviados >= META_MENSAJES;
    const racha = estado.rachaMensajes ?? 0;
    filas.push({
      clave: 'mensajes',
      icono: Send,
      titulo: 'Tu red',
      detalle: ok
        ? `${enviados} de ${META_MENSAJES} enviados`
        : `${enviados} de ${META_MENSAJES} — faltan ${META_MENSAJES - enviados}`,
      alDia: ok,
      pie: racha >= 2 ? `${racha} días seguidos` : undefined,
      ir: 'mensajes',
    });
  }

  // ── Responder ── siempre que haya algo esperando
  const sin = estado.sinResponder ?? 0;
  if (sin > 0) {
    filas.push({
      clave: 'responder',
      icono: MessageSquare,
      titulo: 'Responder',
      detalle: sin === 1 ? '1 conversación esperando' : `${sin} conversaciones esperando`,
      alDia: false,
      ir: 'mensajes',
    });
  }

  // ── Campaña ── desde el día 31, si está encendida
  if (dia >= 31 && estado.campanaActiva) {
    const c = estado.costoPorAgenda;
    filas.push({
      clave: 'campana',
      icono: Megaphone,
      titulo: 'Tu campaña',
      detalle:
        typeof c === 'number' && c > 0
          ? `Corriendo · $${Math.round(c)} por agenda`
          : 'Corriendo · todavía sin agendas',
      alDia: true,
      pie: 'Se mira dos minutos y no se toca',
      ir: 'metrics',
    });
  }

  if (filas.length === 0) return null;

  const pendientes = filas.filter((f) => !f.alDia).length;

  return (
    <section className="card-panel p-6 sm:p-7 border border-gold/15" aria-label="En marcha">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-gold">En marcha</h2>
        <p className="text-sm text-cream/60">
          {pendientes === 0 ? 'Todo al día' : `${pendientes} sin cerrar hoy`}
        </p>
      </div>

      <ul className="divide-y divide-gold/10">
        {filas.map((f) => {
          const Icono = f.icono;
          const clickable = Boolean(f.ir && onIr);
          return (
            <li key={f.clave}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => f.ir && onIr && onIr(f.ir)}
                className={`w-full flex items-center gap-4 py-4 text-left ${
                  clickable ? 'hover:opacity-80 transition-opacity' : 'cursor-default'
                }`}
              >
                <span
                  className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${
                    f.alDia
                      ? 'border-success/40 text-success'
                      : 'border-gold/30 text-gold'
                  }`}
                >
                  <Icono className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-cream">{f.titulo}</span>
                  <span className="block text-sm text-cream/70">{f.detalle}</span>
                  {f.pie && (
                    <span className="block text-xs text-gold/80 mt-0.5">{f.pie}</span>
                  )}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold uppercase tracking-[0.15em] ${
                    f.alDia ? 'text-success' : 'text-gold'
                  }`}
                >
                  {f.alDia ? 'Al día' : 'Hoy'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
