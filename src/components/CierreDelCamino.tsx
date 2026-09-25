/**
 * CierreDelCamino — lo que ve cuando su ventana se cierra.
 *
 * Nada se borra: su trabajo queda a la vista. Y arriba, el cierre de cuentas:
 * qué hizo, qué le faltó y cuánto se atrasó. Desde ese número sale la
 * conversación de la garantía, la renovación o el paso siguiente.
 */
import React, { useMemo } from 'react';
import { cierreDeCuentas, veredictoDeGarantia } from '../lib/cierreDeCuentas';
import { VOC } from '../lib/vocabulario';

interface Props {
  nombre?: string;
  /** Por qué se cerró, en su idioma. */
  motivo: string;
  desde: string;
  completadas: Set<string>;
  fechaInicio?: string | null;
  entregas?: Record<string, string>;
  /** Para escribirle: el número de WhatsApp de la casa. */
  waLink?: string;
}

export default function CierreDelCamino({ nombre, motivo, desde, completadas, fechaInicio, entregas, waLink }: Props) {
  const c = useMemo(
    () => cierreDeCuentas(completadas, fechaInicio, entregas ?? {}),
    [completadas, fechaInicio, entregas],
  );

  return (
    <div className="min-h-screen bg-ink text-cream flex items-start justify-center p-6">
      <section className="w-full max-w-[620px] card-panel p-6" aria-label="Tu cierre">
        <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Tu Camino, cerrado</p>
        <h1 className="mt-2 text-[30px] leading-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
          {nombre ? `${nombre}, esto es lo que hiciste` : 'Esto es lo que hiciste'}
        </h1>
        <p className="mt-2 text-[17px] text-cream/70">
          Se cerró el {desde}: {motivo}. Todo tu trabajo queda acá.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--line2,#DFD3BC)] p-4">
            <p className="text-[34px] leading-none" style={{ fontFamily: 'var(--font-display)' }}>{c.hechas}</p>
            <p className="mt-1 text-[17px] text-cream/70">jornadas completadas</p>
          </div>
          <div className="rounded-2xl border border-[var(--line2,#DFD3BC)] p-4">
            <p className="text-[34px] leading-none" style={{ fontFamily: 'var(--font-display)' }}>{c.sinEvidencia.length}</p>
            <p className="mt-1 text-[17px] text-cream/70">quedaron sin entregar</p>
          </div>
        </div>

        <p className="mt-4 text-[17px] text-cream">
          Tu atraso más grande fue de {c.atrasoMayor} {c.atrasoMayor === 1 ? 'día' : 'días'}.
        </p>

        <p className="mt-4 text-[18px] leading-relaxed text-cream" style={{ borderLeft: '2px solid var(--oro, #B0822E)', paddingLeft: 14 }}>
          {VOC(veredictoDeGarantia(c))}
        </p>

        {c.sinEvidencia.length > 0 && (
          <>
            <p className="mt-5 text-[17px] font-semibold text-cream">Lo que quedó pendiente</p>
            <ul className="mt-2 space-y-2">
              {c.sinEvidencia.slice(0, 8).map((j) => (
                <li key={j.clave} className="text-[17px] text-cream/75">
                  Día {j.dia} · {VOC(j.titulo)}
                </li>
              ))}
            </ul>
            {c.sinEvidencia.length > 8 && (
              <p className="mt-2 text-[15px] text-cream/60">y {c.sinEvidencia.length - 8} más</p>
            )}
          </>
        )}

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener"
            className="mt-6 w-full min-h-[52px] rounded-[20px] text-[18px] font-semibold flex items-center justify-center"
            style={{ background: 'var(--oro-d, #8E6824)', color: '#FFFDF7' }}
          >
            Hablar de lo que sigue
          </a>
        )}
      </section>
    </div>
  );
}
