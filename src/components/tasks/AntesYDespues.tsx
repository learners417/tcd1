/**
 * AntesYDespues — los seis números del primer día al lado de los de hoy.
 *
 * Se abre en la jornada del día 82, y desde ahí queda a mano. Javo la usa en
 * la sesión de cierre para grabar el testimonio: el cliente ve su propio
 * cambio en números antes de contarlo.
 *
 * Cuando falta la salida, la pantalla pide los seis. No muestra progreso
 * inventado ni compara contra un valor que no existe.
 */
import React, { useMemo, useState } from 'react';
import { CAMPOS, comparar, cuantosMejoraron, lecturaDelCierre, estaCompleta,
         guardar, leer, KEY_ENTRADA, KEY_SALIDA, type Medicion } from '../../lib/medicion';
import { VOC } from '../../lib/vocabulario';

interface Props {
  /** Para guardarlos también en su perfil. */
  onGuardar?: (salida: Medicion) => void;
}

export default function AntesYDespues({ onGuardar }: Props) {
  const entrada = useMemo(() => leer(KEY_ENTRADA), []);
  const [salida, setSalida] = useState<Medicion>(() => leer(KEY_SALIDA) ?? {});
  const [cerrada, setCerrada] = useState(() => estaCompleta(leer(KEY_SALIDA)));

  const pares = useMemo(() => comparar(entrada, cerrada ? salida : null), [entrada, salida, cerrada]);
  const mejoraron = cuantosMejoraron(pares);

  const confirmar = () => {
    guardar(KEY_SALIDA, salida);
    setCerrada(true);
    onGuardar?.(salida);
  };

  return (
    <section className="card-panel p-5" aria-label="Tu antes y después">
      <p className="text-[17px] font-bold uppercase tracking-[0.16em] text-goldhi">Tu antes y después</p>
      <h3 className="mt-2 text-[26px] leading-tight text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
        {cerrada ? `${mejoraron} de 6 se movieron a tu favor` : 'Los mismos seis, con lo que hay hoy'}
      </h3>

      {!cerrada && (
        <>
          <p className="mt-2 text-[17px] text-cream/70">
            Contesta con los números de este mes. Los del primer día ya están guardados.
          </p>
          {CAMPOS.map((c) => (
            <div key={c.id} className="mt-4">
              <label htmlFor={`sal-${c.id}`} className="block text-[17px] text-cream">{VOC(c.pregunta)}</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id={`sal-${c.id}`}
                  type="number"
                  inputMode="decimal"
                  value={salida[c.id] ?? ''}
                  onChange={(e) => setSalida((prev) => ({
                    ...prev,
                    [c.id]: e.target.value === '' ? NaN : Number(e.target.value),
                  }))}
                  className="w-36 min-h-[52px] rounded-xl border border-[var(--line2,#DFD3BC)] bg-transparent px-3 text-[19px] text-cream"
                />
                <span className="text-[17px] text-cream/60">{c.unidad}</span>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={!estaCompleta(salida)}
            onClick={confirmar}
            className="mt-5 w-full min-h-[52px] rounded-[20px] text-[18px] font-semibold disabled:opacity-40"
            style={{ background: 'var(--oro-d, #8E6824)', color: '#FFFDF7' }}
          >
            Ver mi antes y después
          </button>
        </>
      )}

      {cerrada && (
        <>
          <ul className="mt-4">
            {pares.map((p) => (
              <li key={p.campo.id} className="border-t border-[var(--line2,#DFD3BC)] py-4">
                <p className="text-[17px] text-cream">{VOC(p.campo.pregunta)}</p>
                <p className="mt-1 text-[24px] text-cream" style={{ fontFamily: 'var(--font-display)' }}>
                  {p.entrada} <span className="text-[19px] opacity-50">→</span>{' '}
                  <span style={{ color: p.mejoro ? 'var(--tilde, #4A7C59)' : undefined }}>{p.salida}</span>
                  <span className="ml-2 text-[17px] opacity-60">{p.campo.unidad}</span>
                </p>
                <p className="mt-1 text-[17px]" style={{ color: p.mejoro ? 'var(--tilde, #4A7C59)' : 'var(--mu, #6E6252)' }}>
                  {VOC(p.lectura)}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[19px] leading-relaxed text-cream" style={{ borderLeft: '2px solid var(--oro, #B0822E)', paddingLeft: 14 }}>
            {VOC(lecturaDelCierre(entrada, salida))}
          </p>

          <button
            type="button"
            onClick={() => setCerrada(false)}
            className="mt-4 min-h-[48px] text-[17px] font-semibold text-goldhi"
          >
            Corregir un número
          </button>
        </>
      )}
    </section>
  );
}
