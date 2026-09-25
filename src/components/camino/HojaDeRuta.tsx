/**
 * HojaDeRuta — sus noventa días, semana por semana.
 *
 * Entra desde el Camino, el primer día. Cada semana trae su nombre, sus
 * jornadas con fecha real y lo que ya está hecho. Los hitos quedan marcados
 * para que sepa hacia dónde va antes de llegar.
 */
import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { diasDeLaRuta, fechaCorta, fechaDelDia, SEMANAS } from '../../lib/hojaDeRuta';
import { VOC } from '../../lib/vocabulario';

interface Props {
  fechaInicio?: string | null;
  /** Las claves `pilar-codigo` que ya completó. */
  completadas: Set<string>;
  /** El día en el que va hoy. */
  diaDeHoy?: number | null;
  onCerrar: () => void;
}

export default function HojaDeRuta({ fechaInicio, completadas, diaDeHoy, onCerrar }: Props) {
  const dias = useMemo(() => diasDeLaRuta(), []);
  const semanas = useMemo(() => {
    const out = new Map<number, typeof dias>();
    for (const d of dias) out.set(d.semana, [...(out.get(d.semana) ?? []), d]);
    return [...out.entries()].sort((a, b) => a[0] - b[0]);
  }, [dias]);
  // El Camino arranca en lunes. A quien viene migrado con otra fecha no se le
  // promete el fin de semana libre.
  const arrancaLunes = useMemo(() => fechaDelDia(fechaInicio, 1)?.getDay() === 1, [fechaInicio]);
  const [abierta, setAbierta] = useState<number>(
    diaDeHoy ? Math.floor((diaDeHoy - 1) / 7) + 1 : 1,
  );

  // Se cuentan las jornadas con trabajo: los días de campo no se completan.
  const hechas = dias.filter((d) => d.minutos > 0 && completadas.has(`${d.pilar}-${d.codigo}`)).length;
  const conTrabajo = dias.filter((d) => d.minutos > 0).length;

  return (
    <section className="card-panel p-5" aria-label="Tu Hoja de Ruta">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tu Hoja de Ruta</p>
          <h2 className="mt-2 text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
            Tus noventa días, completos
          </h2>
        </div>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="min-h-[48px] min-w-[48px] grid place-items-center">
          <X className="w-6 h-6 text-cream/70" />
        </button>
      </div>

      <p className="mt-2 text-[17px] text-cream/70">
        {hechas} de {conTrabajo} jornadas hechas.{arrancaLunes ? ' Sábados y domingos son tuyos.' : ''}
      </p>

      <ul className="mt-4 space-y-2">
        {semanas.map(([n, jornadas]) => {
          const activa = abierta === n;
          const hechasSemana = jornadas.filter((d) => d.minutos > 0 && completadas.has(`${d.pilar}-${d.codigo}`)).length;
          const conTrabajoSemana = jornadas.filter((d) => d.minutos > 0).length;
          return (
            <li key={n} className="rounded-2xl border border-[var(--line2,#DFD3BC)] overflow-hidden">
              <button
                type="button"
                aria-expanded={activa}
                onClick={() => setAbierta(activa ? -1 : n)}
                className="w-full min-h-[64px] px-4 py-3 flex items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="block text-[17px] font-semibold text-cream">Semana {n} · {VOC(SEMANAS[n] ?? '')}</span>
                  <span className="block text-[15px] text-cream/60">
                    {fechaCorta(fechaInicio, jornadas[0].dia) || `días ${jornadas[0].dia} a ${jornadas[jornadas.length - 1].dia}`}
                  </span>
                </span>
                <span className="text-[15px] text-cream/70 shrink-0">
                  {conTrabajoSemana ? `${hechasSemana}/${conTrabajoSemana}` : ''}
                </span>
              </button>

              {activa && (
                <ul className="px-4 pb-3">
                  {jornadas.map((d) => {
                    const hecha = completadas.has(`${d.pilar}-${d.codigo}`);
                    const hoy = diaDeHoy === d.dia;
                    return (
                      <li
                        key={d.dia}
                        className="py-3 border-t border-[var(--line2,#DFD3BC)] flex items-start gap-3"
                        style={hoy ? { boxShadow: 'inset 3px 0 0 0 var(--oro, #B0822E)', paddingLeft: 10 } : undefined}
                      >
                        <span
                          className="mt-1 w-6 h-6 shrink-0 rounded-full grid place-items-center border"
                          style={hecha
                            ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                            : { borderColor: 'var(--line2, #DFD3BC)' }}
                        >
                          {hecha && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[17px] text-cream">
                            <span className="font-semibold">Día {d.dia}</span> · {VOC(d.titulo)}
                          </span>
                          <span className="block text-[15px] text-cream/60">
                            {[fechaCorta(fechaInicio, d.dia), d.minutos ? `${d.minutos} min` : 'sin sesión']
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                          {d.hito && (
                            <span className="mt-1 inline-block text-[15px] font-semibold text-goldhi">
                              {VOC(d.hito)}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
