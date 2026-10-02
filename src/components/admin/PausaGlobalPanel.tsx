/**
 * EL INTERRUPTOR DE LA PAUSA — parar el Camino de todos desde el Admin.
 *
 * Dos fechas y un botón. Antes de confirmar dice en castellano qué va a pasar:
 * a cuántos alcanza, con qué fecha vuelven y cuánto se les corre el cierre.
 *
 * Mientras está puesta se ve el cartel y el botón para levantarla antes de
 * tiempo, por si el equipo decide volver un lunes más temprano.
 */
import React, { useMemo, useState } from 'react';
import {
  loQueVaAPasar, resumenParaElEquipo, enPalabras, retomaEl, hoyISO,
  type PausaGlobal,
} from '../../lib/pausaGlobal';
import { ponerPausa, levantarPausa } from '../../lib/pausasDatos';

interface Props {
  /** Todas las pausas cargadas. */
  pausas: PausaGlobal[];
  /** La que está corriendo ahora, si hay. */
  vigente: PausaGlobal | null;
  /** A cuántos clientes alcanza. */
  cuantos: number;
  /** Quién la pone: queda anotado. */
  quien: string;
  /** Para refrescar la pantalla con la lista nueva. */
  onCambio: (pausas: PausaGlobal[]) => void;
}

export default function PausaGlobalPanel({ pausas, vigente, cuantos, quien, onCambio }: Props) {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [confirmarLevantar, setConfirmarLevantar] = useState(false);

  const fechasListas = Boolean(desde && hasta && hasta >= desde);
  const aviso = useMemo(
    () => (fechasListas ? loQueVaAPasar(desde, hasta, cuantos) : null),
    [fechasListas, desde, hasta, cuantos],
  );

  const proximas = pausas
    .filter((p) => p.desde > hoyISO())
    .sort((a, b) => a.desde.localeCompare(b.desde));

  async function poner() {
    if (!fechasListas || guardando) return;
    setGuardando(true);
    try {
      onCambio(await ponerPausa(desde, hasta, quien, motivo.trim() || undefined));
      setDesde(''); setHasta(''); setMotivo('');
    } finally {
      setGuardando(false);
    }
  }

  async function levantar(p: PausaGlobal) {
    if (guardando) return;
    setGuardando(true);
    try {
      onCambio(await levantarPausa(p));
      setConfirmarLevantar(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <h3 className="text-[19px] font-bold text-cream">Pausa del Camino</h3>
      <p className="mt-1 text-[17px] leading-relaxed text-cream/70">
        Para el Camino de todos a la vez. Durante la pausa nadie acumula atraso ni aparece
        en el semáforo, y al terminar las fechas de todos se corren lo que duró.
      </p>

      {vigente ? (
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4">
          <p className="text-[18px] font-bold leading-snug text-goldhi">{resumenParaElEquipo(vigente)}</p>
          {vigente.motivo ? (
            <p className="mt-2 text-[17px] text-cream/70">Motivo: {vigente.motivo}</p>
          ) : null}
          {confirmarLevantar ? (
            <div className="mt-4">
              <p className="text-[17px] leading-relaxed text-cream/85">
                El Camino vuelve a correr hoy. Los días que ya estuvieron parados quedan
                corridos igual: nadie pierde nada.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => void levantar(vigente)}
                  className="min-h-[52px] rounded-xl bg-gold px-5 text-[17px] font-bold text-espresso disabled:opacity-50"
                >
                  Sí, que vuelva a correr
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarLevantar(false)}
                  className="min-h-[52px] rounded-xl border border-cream/25 px-5 text-[17px] font-bold text-cream/80"
                >
                  Dejarlo en pausa
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmarLevantar(true)}
              className="mt-4 min-h-[52px] rounded-xl border border-cream/25 px-5 text-[17px] font-bold text-cream/85"
            >
              Levantar la pausa ahora
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[17px] font-medium text-cream/80">Se para el</span>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="mt-1 min-h-[52px] w-full rounded-xl border border-cream/20 bg-espresso/60 px-4 text-[17px] text-cream"
              />
            </label>
            <label className="block">
              <span className="text-[17px] font-medium text-cream/80">Hasta el</span>
              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
                className="mt-1 min-h-[52px] w-full rounded-xl border border-cream/20 bg-espresso/60 px-4 text-[17px] text-cream"
              />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="text-[17px] font-medium text-cream/80">Motivo (si quieres dejarlo anotado)</span>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Fiestas de fin de año"
              className="mt-1 min-h-[52px] w-full rounded-xl border border-cream/20 bg-espresso/60 px-4 text-[17px] text-cream placeholder:text-cream/35"
            />
          </label>

          {aviso ? (
            <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 text-[17px] leading-relaxed text-cream/85">
              {aviso}
            </p>
          ) : null}

          <button
            type="button"
            disabled={!fechasListas || guardando}
            onClick={() => void poner()}
            className="mt-4 min-h-[56px] w-full rounded-xl bg-gold px-5 text-[18px] font-bold text-espresso disabled:opacity-40 sm:w-auto"
          >
            {guardando ? 'Poniendo la pausa…' : 'Parar el Camino de todos'}
          </button>
        </div>
      )}

      {proximas.length > 0 ? (
        <div className="mt-5 border-t border-cream/10 pt-4">
          <p className="text-[17px] font-bold text-cream/70">Ya programadas</p>
          <ul className="mt-2 space-y-2">
            {proximas.map((p) => (
              <li key={p.id ?? p.desde} className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[17px] text-cream/85">
                  Del {enPalabras(p.desde)} — retoma el {enPalabras(retomaEl(p))}
                </span>
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => void levantar(p)}
                  className="min-h-[44px] rounded-lg border border-cream/20 px-4 text-[17px] font-medium text-cream/70 disabled:opacity-50"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
