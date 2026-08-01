import { useState } from 'react';
import { MoreHorizontal, Send, Copy, Check } from 'lucide-react';

/**
 * LA TARJETA DE CLIENTE.
 *
 * ═══ LO QUE VINE A ARREGLAR ═══
 *
 * Medí el Admin y encontré **207 párrafos de texto contra 12 números
 * grandes**. Había construido un informe, no un tablero.
 *
 * > Un tablero no es un informe. Es una cabina.
 *
 * La regla de esta tarjeta, entonces: **un número grande, una frase, un
 * botón.** Todo lo demás —el detalle, las otras acciones, el historial—
 * detrás de los tres puntos.
 *
 * ═══ POR QUÉ UN SOLO BOTÓN VISIBLE ═══
 *
 * No es minimalismo. Es que **con seis botones a la vista, elegir cuesta más
 * que hacer**, y quien atiende veinte cuentas por día paga ese costo veinte
 * veces. El botón que se ve es el que la app recomienda; los otros siguen
 * ahí para quien sabe que quiere otra cosa.
 */

export type Semaforo = 'bien' | 'atencion' | 'frenado';

export interface AccionExtra {
  id: string;
  label: string;
  onClick: () => void;
}

export default function TarjetaCliente({
  nombre,
  estado,
  semaforo,
  numero,
  numeroDe,
  etiqueta,
  frase,
  accionPrincipal,
  mensajeListo,
  extras = [],
}: {
  nombre: string;
  /** «lanzada hace 12 días» · «instalando». Va arriba, chico. */
  estado: string;
  semaforo: Semaforo;
  /** EL número. Lo que se lee de un vistazo, desde lejos. */
  numero: string;
  /** El segundo número, si la historia es de dos. «18 → 2». */
  numeroDe?: string;
  /** Qué son esos números, en dos palabras. */
  etiqueta: string;
  /** Qué está pasando, en una frase de negocio. Nunca dos. */
  frase: string;
  /** El único botón visible. */
  accionPrincipal?: { label: string; onClick: () => void };
  /** Si hay mensaje escrito, se puede copiar sin abrir nada. */
  mensajeListo?: string;
  /** El resto, detrás de los tres puntos. */
  extras?: AccionExtra[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const color = semaforo === 'frenado' ? 'danger'
    : semaforo === 'atencion' ? 'gold' : 'success';

  return (
    <div className={`relative rounded-2xl border p-5 ${
      semaforo === 'frenado' ? 'border-danger/35 bg-danger/[0.04]'
      : semaforo === 'atencion' ? 'border-gold/30 bg-gold/[0.03]'
      : 'border-cream/12'}`}>

      {/* ── El nombre y el estado ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg text-cream leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}>
            {nombre}
          </p>
          <p className="text-sm text-cream/45 mt-0.5">{estado}</p>
        </div>

        {extras.length > 0 && (
          <button
            onClick={() => setAbierto((v) => !v)}
            aria-label="Más acciones"
            className="shrink-0 rounded-lg p-1.5 text-cream/40 hover:text-cream/80 hover:bg-cream/[0.06]">
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      {/* ── EL NÚMERO. Lo que se lee desde lejos. ── */}
      <div className="mt-4 mb-3">
        <p className={`text-4xl leading-none text-${color}`}
          style={{ fontFamily: 'var(--font-display)' }}>
          {numero}
          {numeroDe && (
            <>
              <span className="text-cream/25 mx-2 text-3xl">→</span>
              <span>{numeroDe}</span>
            </>
          )}
        </p>
        <p className="text-sm text-cream/45 mt-1.5">{etiqueta}</p>
      </div>

      {/* ── Una frase. Nunca dos. ── */}
      <p className="text-base text-cream/85 leading-snug">{frase}</p>

      {/* ── Un botón. ── */}
      {(accionPrincipal || mensajeListo) && (
        <div className="flex items-center gap-2 mt-4">
          {accionPrincipal && (
            <button onClick={accionPrincipal.onClick}
              className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
              <Send size={13} className="inline mb-0.5 mr-1.5" />
              {accionPrincipal.label}
            </button>
          )}
          {mensajeListo && (
            <button
              onClick={() => {
                void navigator.clipboard?.writeText(mensajeListo);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1800);
              }}
              className="rounded-xl border border-cream/15 px-3 py-2.5 text-sm text-cream/70">
              {copiado ? <Check size={13} /> : <Copy size={13} />}
            </button>
          )}
        </div>
      )}

      {/* ── Lo demás, cuando alguien lo pide ── */}
      {abierto && (
        <div className="absolute right-4 top-14 z-20 w-60 rounded-xl border
          border-cream/15 bg-[#0d0d0d] py-1.5 shadow-xl">
          {extras.map((e) => (
            <button key={e.id}
              onClick={() => { setAbierto(false); e.onClick(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-cream/80
                hover:bg-cream/[0.06]">
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
