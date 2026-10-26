import { useMemo, useState } from 'react';
import { Check, Loader2, Plus, Minus } from 'lucide-react';
import {
  AREAS, DIAS_MAXIMOS, DIAS_MINIMOS, MOVIDAS_MAXIMAS,
  abreLaSesionUno, diasHechos, faltaEnLaAntesala, movidasValidas,
  protocoloListo, sePuedeTildar, tildar, type Antesala, type Movida,
} from '../lib/antesala';

/**
 * LA ANTESALA — la pantalla de los cinco a siete días de antes.
 *
 * ═══ POR QUÉ ESTA PANTALLA Y NO UNA JORNADA MÁS ═══
 *
 * Porque una jornada en el Camino se lee como una tarea, y acá la tarea es
 * justamente la que no hay. Tiene su propia pantalla, sin cronómetro, sin
 * evidencias que subir y sin rúbrica: elige, escribe, y después tilda.
 *
 * ═══ LAS DOS PANTALLAS ═══
 *
 *   1. Mientras lo diseña: las seis áreas, y elige de tres a cinco.
 *   2. Mientras lo hace: el contador de días y el botón de hoy.
 *
 * El contador no muestra un porcentaje. Muestra «3 de 5», porque lo que
 * importa es cuántas noches faltan, no qué parte del total representan.
 */

interface Props {
  antesala: Antesala;
  /** Guarda y resuelve cuando quedó escrito. La pantalla no asume que salió. */
  onGuardar: (a: Antesala) => Promise<void>;
  /** Se llama cuando los cinco días están hechos y el Camino puede abrir. */
  onAbrirCamino?: () => void;
  nombre?: string;
}

export default function LaAntesala({ antesala, onGuardar, onAbrirCamino, nombre }: Props) {
  const [borrador, setBorrador] = useState<Movida[]>(antesala.protocolo ?? []);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enMarcha = protocoloListo(antesala);
  const hechos = diasHechos(antesala);
  const abierto = abreLaSesionUno(antesala);
  const puedeHoy = sePuedeTildar(antesala);

  const elegidas = useMemo(
    () => new Set(borrador.map((m) => m.area)),
    [borrador],
  );

  const alternar = (area: string) => {
    setBorrador((prev) =>
      prev.some((m) => m.area === area)
        ? prev.filter((m) => m.area !== area)
        : prev.length >= MOVIDAS_MAXIMAS
          ? prev
          : [...prev, { area, loQueHago: '' }],
    );
  };

  const escribir = (area: string, texto: string) => {
    setBorrador((prev) => prev.map((m) => (m.area === area ? { ...m, loQueHago: texto } : m)));
  };

  const guardar = async (a: Antesala) => {
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(a);
    } catch {
      setError('No se pudo guardar. Prueba de nuevo en un momento.');
    }
    setGuardando(false);
  };

  const listoElBorrador = protocoloListo({ protocolo: borrador });

  // ── Mientras lo diseña ──────────────────────────────────────────────
  if (!enMarcha) {
    return (
      <section className="card-panel p-6 border border-gold/30">
        <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-gold">
          Antes de tu sesión 1
        </p>
        <h2 className="mt-2 text-[28px] leading-tight text-cream"
          style={{ fontFamily: 'var(--font-display)' }}>
          {nombre ? `${nombre}, tus ` : 'Tus '}cinco a siete días de descanso
        </h2>
        <p className="mt-3 text-[17px] leading-relaxed text-cream/70">
          Tu Camino empieza con una sesión que te va a pedir cabeza: tus números,
          tu hora real, tu pacto. Antes de eso hay cinco días que no construyen
          nada. Solo descansan.
        </p>
        <p className="mt-3 text-[17px] leading-relaxed text-cream/70">
          Lo diseñas tú. Elige de tres a cinco movidas y escribe qué vas a hacer
          en cada una, con una hora o un número. Nadie te va a decir qué comer ni
          a qué hora levantarte: si no es tuyo, lo dejas el miércoles.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {AREAS.map((a) => {
            const puesta = elegidas.has(a.id);
            const mia = borrador.find((m) => m.area === a.id);
            const tope = !puesta && borrador.length >= MOVIDAS_MAXIMAS;
            return (
              <div key={a.id}
                className={`rounded-2xl p-4 border transition-colors ${
                  puesta ? 'elegido' : 'border-cream/10'
                }`}>
                <button type="button" onClick={() => alternar(a.id)} disabled={tope}
                  className="w-full flex items-start justify-between gap-3 text-left disabled:opacity-40">
                  <span className="min-w-0">
                    <span className="block text-[20px] text-cream"
                      style={{ fontFamily: 'var(--font-display)' }}>{a.nombre}</span>
                    <span className="block mt-0.5 text-[15px] text-cream/60">{a.pregunta}</span>
                  </span>
                  <span className={`shrink-0 w-9 h-9 rounded-full grid place-items-center border ${
                    puesta ? 'elegido-etiqueta' : 'border-cream/20 text-cream/50'
                  }`} aria-hidden>
                    {puesta ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {puesta && (
                  <div className="mt-3">
                    <textarea
                      value={mia?.loQueHago ?? ''}
                      onChange={(e) => escribir(a.id, e.target.value)}
                      rows={2}
                      placeholder={a.ejemplo}
                      className="w-full rounded-xl bg-black/20 border border-cream/15 p-3
                        text-[17px] text-cream placeholder:text-cream/35
                        focus:border-gold/50 focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-[17px] text-cream/65">
          {listoElBorrador
            ? `Elegiste ${movidasValidas({ protocolo: borrador }).length}. Con eso arrancas.`
            : faltaEnLaAntesala({ protocolo: borrador })}
        </p>

        {error && <p className="mt-3 text-[17px] text-danger">{error}</p>}

        <button type="button"
          disabled={!listoElBorrador || guardando}
          onClick={() => guardar({ ...antesala, protocolo: borrador })}
          className="mt-4 w-full rounded-full px-6 py-4 text-[19px] font-semibold
            border border-gold/60 text-cream disabled:opacity-40
            hover:bg-gold/10 transition-colors inline-flex items-center justify-center gap-2">
          {guardando && <Loader2 className="w-5 h-5 animate-spin" />}
          Sellar mi protocolo y empezar
        </button>
      </section>
    );
  }

  // ── Mientras lo hace ────────────────────────────────────────────────
  const mias = movidasValidas(antesala);
  return (
    <section className="card-panel p-6 border border-gold/30">
      <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-gold">
        Tu protocolo · día {Math.min(hechos + (puedeHoy ? 1 : 0), DIAS_MAXIMOS)} de {DIAS_MINIMOS}
      </p>
      <h2 className="mt-2 text-[28px] leading-tight text-cream"
        style={{ fontFamily: 'var(--font-display)' }}>
        {abierto ? 'Tu sesión 1 está abierta' : 'Hoy descansas'}
      </h2>

      {/* Los días, como noches contadas y no como barra de progreso. */}
      <div className="mt-4 flex items-center gap-2" role="img"
        aria-label={`${hechos} de ${DIAS_MINIMOS} días hechos`}>
        {Array.from({ length: DIAS_MAXIMOS }, (_, i) => (
          <span key={i}
            className={`h-2.5 flex-1 rounded-full ${
              i < hechos ? 'bg-gold' : i < DIAS_MINIMOS ? 'bg-cream/15' : 'bg-cream/[0.06]'
            }`} />
        ))}
      </div>
      <p className="mt-2 text-[15px] text-cream/55">
        Los cinco primeros abren tu sesión 1. Los dos últimos son tuyos si los quieres.
      </p>

      <ul className="mt-5 flex flex-col gap-2.5">
        {mias.map((m) => (
          <li key={m.area} className="flex items-start gap-2.5 text-[17px] text-cream/80">
            <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" aria-hidden />
            <span className="min-w-0">{m.loQueHago}</span>
          </li>
        ))}
      </ul>

      {error && <p className="mt-4 text-[17px] text-danger">{error}</p>}

      {puedeHoy && (
        <button type="button" disabled={guardando}
          onClick={() => guardar(tildar(antesala))}
          className="mt-5 w-full rounded-full px-6 py-4 text-[19px] font-semibold
            border border-gold/60 text-cream disabled:opacity-40
            hover:bg-gold/10 transition-colors inline-flex items-center justify-center gap-2">
          {guardando && <Loader2 className="w-5 h-5 animate-spin" />}
          Lo hice hoy
        </button>
      )}

      {!puedeHoy && !abierto && (
        <p className="mt-5 text-[17px] text-cream/65">
          Hoy ya quedó marcado. {faltaEnLaAntesala(antesala)}
        </p>
      )}

      {abierto && (
        <button type="button" onClick={onAbrirCamino}
          className="mt-5 w-full rounded-full px-6 py-4 text-[19px] font-semibold
            border border-gold/60 text-cream hover:bg-gold/10 transition-colors">
          Ir a mi sesión 1
        </button>
      )}
    </section>
  );
}
