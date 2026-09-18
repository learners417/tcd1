/**
 * PuntoDePartida — la primera pregunta para el cliente que ya viene andando.
 *
 * Aparece una sola vez, cuando el Camino está en cero: "¿ya vienes con cosas
 * hechas?". Elige lo último que ya logró y el Camino lo deja en ese día.
 * Si empieza de cero, se cierra y no vuelve a aparecer.
 */
import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { RoadmapPilar } from '../lib/roadmapSeed';
import { opcionesDePartida, resumenDePartida, jornadasHasta, diaDeLaOpcion, fechaInicioParaDia } from '../lib/puntoDePartida';

export const KEY_PARTIDA = 'tcd_punto_de_partida_v1';

interface Props {
  pilares: RoadmapPilar[];
  /** Marca las jornadas elegidas (guarda progreso local y en la base). */
  onMarcar: (jornadas: Array<{ pilarNumero: number; codigo: string; esEstrella: boolean }>, fechaInicio: string) => void;
  onCerrar: () => void;
}

export default function PuntoDePartida({ pilares, onMarcar, onCerrar }: Props) {
  const opciones = useMemo(() => opcionesDePartida(), []);
  const [elegida, setElegida] = useState<string | null>(null);
  const resumen = elegida ? resumenDePartida(pilares, elegida) : null;

  const confirmar = () => {
    if (!elegida) return;
    const dia = diaDeLaOpcion(elegida);
    if (dia !== null) onMarcar(jornadasHasta(pilares, dia), fechaInicioParaDia(dia));
    try { localStorage.setItem(KEY_PARTIDA, elegida); } catch { /* noop */ }
    onCerrar();
  };

  const empezarDeCero = () => {
    try { localStorage.setItem(KEY_PARTIDA, 'cero'); } catch { /* noop */ }
    onCerrar();
  };

  return (
    <section className="card-panel p-5 sm:p-6" aria-label="Tu punto de partida">
      <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Antes de empezar</p>
      <h2 className="mt-2 text-[28px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
        ¿Ya vienes con cosas hechas?
      </h2>
      <p className="mt-2 text-[17px] text-cream/70">
        Elige lo último que ya tienes listo. El Camino te deja en ese día, con tu cinturón ganado.
      </p>

      <ul className="mt-4 space-y-2">
        {opciones.map((o) => {
          const activa = elegida === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => setElegida(activa ? null : o.id)}
                className={`w-full min-h-[56px] flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  activa ? 'border-gold bg-[var(--card,#FFFDF7)]' : 'border-[var(--line2,#DFD3BC)]'
                }`}
              >
                <span
                  className="w-7 h-7 shrink-0 rounded-full grid place-items-center border"
                  style={activa
                    ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                    : { borderColor: 'var(--line2, #DFD3BC)' }}
                >
                  {activa && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                </span>
                <span className="text-[17px] leading-snug text-cream">{o.loQueYaTienes}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {resumen && (
        <p className="mt-4 text-[17px] text-cream">
          Entras en el <span className="font-semibold">día {resumen.dia}</span>, con el cinturón{' '}
          <span className="font-semibold">{resumen.nombreGrado}</span> y {resumen.jornadas} jornadas dadas por hechas.
        </p>
      )}

      {/* Apagado por color, no por opacidad: un botón al 40% no se lee. */}
      <button
        type="button"
        onClick={confirmar}
        disabled={!elegida}
        className="mt-4 w-full min-h-[52px] rounded-[20px] text-[18px] font-semibold"
        style={elegida
          ? { background: 'var(--oro-d, #8E6824)', color: '#FFFDF7' }
          : { background: 'var(--card2, #F5EFE1)', color: 'var(--ink2, #5E5244)' }}
      >
        Entrar en ese día
      </button>
      <button type="button" onClick={empezarDeCero} className="mt-3 w-full min-h-[52px] text-[17px] font-semibold text-goldhi">
        Empiezo desde el día 1
      </button>
    </section>
  );
}
