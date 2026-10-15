import { useState } from 'react';
import { ChevronDown, Wrench, HardHat } from 'lucide-react';
import {
  LO_QUE_MONTA, deQuienEsElTrabajo, quienMonta, type LoQueMonta,
} from '../../lib/construyeSolo';
import { ESCALONES, escalonDe, estaMarcado } from '../../lib/topeDelEscalon';
import { TICKETS } from '../../lib/cuadroTickets';
import { tutorialPorCodigo } from '../../lib/roadmapSeed';

/**
 * QUIÉN MONTA LO TÉCNICO — un panel, una vez, arriba del Camino.
 *
 * ═══ QUÉ PROBLEMA RESUELVE ═══
 *
 * Las tres ofertas se diferencian en una sola cosa grande: quién monta la
 * página, los formularios, el WhatsApp y las automatizaciones. En La
 * Instalación lo monta el equipo. En El Ascenso y en La Base lo monta él.
 *
 * Eso estaba decidido en la ficha del cliente y en ninguna parte de su app. El
 * de El Ascenso llegaba al día 16 a publicar su página sin saber si le tocaba
 * esperar a alguien. Y esperar es lo que más caro sale: el día no se cierra, el
 * Camino no avanza, y la app le muestra una jornada pendiente que no depende
 * de él.
 *
 * Acá lo lee una vez, con los días y los tutoriales de cada pieza.
 *
 * ═══ POR QUÉ PLEGADO ═══
 *
 * Porque es una respuesta, no una tarea. Abierto de entrada competiría con la
 * jornada de hoy, que es la única acción importante de la pantalla.
 */

interface Props {
  servicio?: string | null;
  servicioMarcadoEl?: string | null;
  /** Para llevarlo al día de una pieza cuando la toca. */
  onIrAlDia?: (dia: number) => void;
}

function Grupo({ x, onIrAlDia }: { x: LoQueMonta; onIrAlDia?: (dia: number) => void }) {
  return (
    <div className="pt-4 first:pt-0">
      <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-gold">{x.titulo}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {x.piezas.map((p, i) => (
          <li key={i} className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onIrAlDia?.(p.dia)}
              className="shrink-0 mt-0.5 px-2 py-0.5 rounded-full border border-gold/40
                text-[15px] tabular-nums text-cream/80 hover:bg-gold/10 transition-colors"
              aria-label={`Ir al día ${p.dia}`}
            >
              día {p.dia}
            </button>
            <span className="min-w-0 text-[17px] leading-snug text-cream/85">
              {p.que}
              <span className="block mt-0.5 text-[15px] text-cream/55">
                {p.tutoriales
                  .map((c) => tutorialPorCodigo.get(c)?.titulo ?? c)
                  .join(' · ')}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[17px] text-cream/70">{x.queda}</p>
    </div>
  );
}

export default function QuienMonta({ servicio, servicioMarcadoEl, onIrAlDia }: Props) {
  const [abierto, setAbierto] = useState(false);

  // Sin escalón marcado no se afirma nada: decirle «lo montas tú» a quien
  // compró La Instalación es peor que no decir nada.
  if (!estaMarcado(servicioMarcadoEl)) return null;

  const escalon = escalonDe(servicio);
  const quien = quienMonta(servicio);
  // En La Base su Camino cierra en el día 12, así que de los tres grupos solo
  // le toca el primero: sus accesos, su número y su cobro.
  const grupos = escalon === 'base' ? LO_QUE_MONTA.slice(0, 1) : LO_QUE_MONTA;

  return (
    <section className="card-panel border border-gold/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="w-full p-5 flex items-center gap-3 text-left"
      >
        {quien === 'el equipo'
          ? <HardHat className="w-6 h-6 text-gold shrink-0" aria-hidden />
          : <Wrench className="w-6 h-6 text-gold shrink-0" aria-hidden />}
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold uppercase tracking-[0.18em] text-gold">
            {TICKETS[escalon].nombre} · {ESCALONES[escalon].hasta}
          </span>
          <span className="block mt-1 text-[21px] leading-tight text-cream"
            style={{ fontFamily: 'var(--font-display)' }}>
            Lo técnico lo monta {quien}
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-cream/55 shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {abierto && (
        <div className="px-5 pb-5">
          <p className="text-[17px] leading-relaxed text-cream/75">
            {deQuienEsElTrabajo(servicio)}
          </p>
          <div className="mt-4 flex flex-col divide-y divide-gold/20">
            {grupos.map((g) => <Grupo key={g.dia} x={g} onIrAlDia={onIrAlDia} />)}
          </div>
        </div>
      )}
    </section>
  );
}
