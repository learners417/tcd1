/**
 * HechoAfueraPanel — cerrar de a una las jornadas que el cliente ya traía hechas.
 *
 * Aparece en el detalle del cliente, con sus jornadas abiertas de la más vieja
 * a la más nueva. Un toque y esa jornada deja de contar como atrasada.
 *
 * Es para el caso real: el que viene construyendo por fuera de la app y a
 * quien el semáforo marcaría en rojo estando al día.
 */
import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { marcarHechoAfuera, desmarcarHechoAfuera, AVISO_HECHO_AFUERA } from '../../lib/hechoAfuera';
import { SEED_ROADMAP_V2 } from '../../lib/roadmapSeed';

interface Props {
  usuarioId: string;
  /** Las jornadas que le faltan cerrar, calculadas por el semáforo. */
  abiertas: Array<{ dia: number; titulo: string; diasDeAtraso: number }>;
  /** Las que ya se cerraron desde acá. */
  yaMarcadas: Set<string>;
  /** Quién está marcando, para que quede anotado. */
  quien: string;
  onCambio: (clave: string, marcada: boolean) => void;
}

/** El pilar y el código de la jornada de ese día. */
function ubicarDia(dia: number): { pilar: number; codigo: string } | null {
  for (const p of SEED_ROADMAP_V2) {
    const m = p.metas.find((x) => x.dia_asignado === dia);
    if (m) return { pilar: p.numero, codigo: m.codigo };
  }
  return null;
}

export default function HechoAfueraPanel({ usuarioId, abiertas, yaMarcadas, quien, onCambio }: Props) {
  const [guardando, setGuardando] = useState<number | null>(null);

  if (abiertas.length === 0 && yaMarcadas.size === 0) return null;

  const alternar = async (dia: number, marcada: boolean) => {
    const u = ubicarDia(dia);
    if (!u) return;
    setGuardando(dia);
    try {
      const clave = marcada
        ? await desmarcarHechoAfuera(usuarioId, u.pilar, u.codigo)
        : await marcarHechoAfuera(usuarioId, u.pilar, u.codigo, quien);
      onCambio(clave, !marcada);
    } finally {
      setGuardando(null);
    }
  };

  return (
    <section className="bg-panel border border-gold/15 rounded-2xl p-4" aria-label="Lo que hizo afuera">
      <p className="text-[17px] font-bold uppercase tracking-[0.18em] text-gold">Lo que hizo afuera</p>
      <p className="mt-2 text-[17px] text-cream/75">{AVISO_HECHO_AFUERA}</p>

      <ul className="mt-3 space-y-2">
        {abiertas.slice(0, 8).map((j) => {
          const u = ubicarDia(j.dia);
          const clave = u ? `${u.pilar}-${u.codigo}` : '';
          const marcada = yaMarcadas.has(clave);
          return (
            <li key={j.dia}>
              <button
                type="button"
                disabled={guardando === j.dia}
                onClick={() => void alternar(j.dia, marcada)}
                className="w-full min-h-[60px] rounded-xl border border-[rgba(232,150,46,0.18)] px-4 py-3 text-left flex items-center gap-3"
              >
                <span
                  className="w-7 h-7 shrink-0 rounded-full grid place-items-center border"
                  style={marcada
                    ? { background: 'var(--tilde, #4A7C59)', borderColor: 'var(--tilde, #4A7C59)' }
                    : { borderColor: 'rgba(232,150,46,0.25)' }}
                >
                  {marcada ? <Check className="w-4 h-4" style={{ color: '#FFFDF7' }} />
                           : <RotateCcw className="w-4 h-4 opacity-40" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] text-cream">
                    <span className="font-semibold">Día {j.dia}</span> · {j.titulo}
                  </span>
                  <span className="block text-[17px] text-cream/60">
                    {marcada ? 'cerrada como hecha afuera' : `abierta hace ${j.diasDeAtraso} días hábiles`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {abiertas.length > 8 && (
        <p className="mt-2 text-[17px] text-cream/60">y {abiertas.length - 8} más abiertas</p>
      )}
    </section>
  );
}
