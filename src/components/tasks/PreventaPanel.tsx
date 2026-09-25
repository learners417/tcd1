/**
 * PreventaPanel — la herramienta de la jornada del día 24.
 *
 * Elige dos bonos de cinco y la app le arma el mensaje con esos dos adentro,
 * listo para mandar. El precio queda completo: lo que cambia son los bonos.
 */
import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { BONOS, KEY_BONOS, bonosElegidos, mensajeDePreventa } from '../../lib/bonosPreventa';
import { VOC } from '../../lib/vocabulario';

interface Props {
  /** Lo que ya tiene sellado en su ADN. */
  promesa?: string;
  plazo?: string;
  precio?: string;
  onElegir?: (ids: string[]) => void;
}

export default function PreventaPanel({ promesa, plazo, precio, onElegir }: Props) {
  const [elegidos, setElegidos] = useState<string[]>(() => bonosElegidos());
  const [copiado, setCopiado] = useState(false);

  const alternar = (id: string) => {
    setElegidos((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 2 ? [prev[1], id] : [...prev, id];
      try { localStorage.setItem(KEY_BONOS, JSON.stringify(next)); } catch { /* noop */ }
      onElegir?.(next);
      return next;
    });
  };

  const mensaje = useMemo(
    () => mensajeDePreventa(elegidos, { promesa, plazo, precio }),
    [elegidos, promesa, plazo, precio],
  );

  const copiar = () => {
    void navigator.clipboard?.writeText(mensaje);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <section className="card-panel p-5" aria-label="Tu preventa">
      <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">Elige dos</p>
      <h3 className="mt-2 text-[24px] leading-snug text-cream" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
        Lo que solo tienen los tres primeros
      </h3>
      <p className="mt-2 text-[17px] text-cream/70">
        Al mismo precio que el resto. Lo que cambia es esto.
      </p>

      <ul className="mt-4 space-y-2">
        {BONOS.map((b) => {
          const activa = elegidos.includes(b.id);
          return (
            <li key={b.id}>
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => alternar(b.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  activa ? 'border-gold bg-[var(--card,#FFFDF7)]' : 'border-[var(--line2,#DFD3BC)]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 shrink-0 rounded-full grid place-items-center border"
                    style={activa
                      ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                      : { borderColor: 'var(--line2, #DFD3BC)' }}
                  >
                    {activa && <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />}
                  </span>
                  <span className="text-[17px] font-semibold text-cream">{VOC(b.nombre)}</span>
                </span>
                <span className="mt-2 block text-[17px] text-cream/75">{VOC(b.comoSeLoDice)}</span>
                <span className="mt-1 block text-[15px] text-cream/60">Te cuesta: {VOC(b.leCuesta)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[17px] text-cream">
        {elegidos.length < 2
          ? `Elige ${2 - elegidos.length} más y te armo el mensaje.`
          : 'Tu mensaje, listo para mandar:'}
      </p>

      {elegidos.length === 2 && (
        <>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-[var(--line2,#DFD3BC)] p-4 text-[17px] leading-relaxed text-cream" style={{ fontFamily: 'inherit' }}>
            {mensaje}
          </pre>
          <button
            type="button"
            onClick={copiar}
            className="mt-3 w-full min-h-[52px] rounded-[20px] text-[18px] font-semibold flex items-center justify-center gap-2"
            style={{ background: 'var(--oro-d, #8E6824)', color: '#FFFDF7' }}
          >
            <Copy className="w-5 h-5" />
            {copiado ? 'Copiado' : 'Copiar el mensaje'}
          </button>
        </>
      )}
    </section>
  );
}
