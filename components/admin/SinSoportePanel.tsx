/**
 * CERRAR EL SOPORTE UNOS DÍAS — desde el Admin.
 *
 * Antes este panel paraba el Camino de todos y les corría el cierre treinta y
 * cinco días. Ahora hace lo único que de verdad pasa: marca los días en que el
 * equipo no responde. El Camino de todos sigue corriendo.
 *
 * Dos fechas y un botón. Antes de confirmar dice en castellano qué va a pasar,
 * incluido lo que NO va a pasar, que es lo que el equipo necesita saber para
 * animarse a usarlo.
 */
import React, { useMemo, useState } from 'react';
import {
  loQueVaAPasar, resumenParaElEquipo, enPalabras, vuelveElSoporte, hoyISO,
  type VentanaSinSoporte,
} from '../../lib/ventanaSinSoporte';
import { cerrarSoporte, reabrirSoporte } from '../../lib/ventanasDatos';

interface Props {
  /** Todas las ventanas cargadas. */
  pausas: VentanaSinSoporte[];
  /** La que está corriendo ahora, si hay. */
  vigente: VentanaSinSoporte | null;
  /** A cuántos clientes alcanza. */
  cuantos: number;
  /** Quién la pone: queda anotado. */
  quien: string;
  /** Para refrescar la pantalla con la lista nueva. */
  onCambio: (ventanas: VentanaSinSoporte[]) => void;
}

export default function SinSoportePanel({ pausas, vigente, cuantos, quien, onCambio }: Props) {
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
      onCambio(await cerrarSoporte(desde, hasta, quien, motivo.trim() || undefined));
      setDesde(''); setHasta(''); setMotivo('');
    } finally {
      setGuardando(false);
    }
  }

  async function levantar(p: VentanaSinSoporte) {
    if (guardando) return;
    setGuardando(true);
    try {
      onCambio(await reabrirSoporte(p));
      setConfirmarLevantar(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gold/25 bg-espresso/40 p-5">
      <h3 className="text-[19px] font-bold text-cream">Días sin soporte</h3>
      <p className="mt-1 text-[17px] leading-relaxed text-cream/70">
        Marca los días en que el equipo no responde. El Camino de todos sigue corriendo
        igual y nadie se marca en el semáforo por estos días.
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
                El soporte vuelve a estar abierto hoy. Los días que ya pasaron siguen
                avisados: de esos días nadie queda marcado.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => void levantar(vigente)}
                  className="min-h-[52px] rounded-xl bg-gold px-5 text-[17px] font-bold text-espresso disabled:opacity-50"
                >
                  Sí, respondemos desde hoy
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarLevantar(false)}
                  className="min-h-[52px] rounded-xl border border-cream/25 px-5 text-[17px] font-bold text-cream/80"
                >
                  Dejarlo cerrado
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmarLevantar(true)}
              className="mt-4 min-h-[52px] rounded-xl border border-cream/25 px-5 text-[17px] font-bold text-cream/85"
            >
              Abrir el soporte ahora
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[17px] font-medium text-cream/80">Sin soporte desde el</span>
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
            {guardando ? 'Cerrando el soporte…' : 'Cerrar el soporte estos días'}
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
                  Del {enPalabras(p.desde)} — se responde desde el {enPalabras(vuelveElSoporte(p))}
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
