/**
 * LA PUERTA — la pantalla que este día necesita, adentro de este día.
 *
 * Mi Número, Campañas, el Creador y Mi Clínica salieron de la grilla de ocho
 * que vivía dentro de El Camino. No se perdieron: aparecen acá, en la jornada
 * que las usa, y en ningún otro lado del recorrido.
 *
 * Un botón, con lo que el cliente va a hacer escrito en él. No el nombre de
 * la pantalla: «Sacar mi precio por hora» antes que «Abrir Mi Número», porque
 * lo primero se entiende sin haber estado nunca ahí.
 */
import { ArrowRight } from 'lucide-react';
import { diaDelCodigo } from '../../lib/roadmapSeed';
import { puertaDelDia } from '../../lib/laPuertaDelDia';

export default function LaPuerta({
  codigo, onIr,
}: {
  codigo: string;
  onIr: (destino: string) => void;
}) {
  const puerta = puertaDelDia(diaDelCodigo(codigo));
  if (!puerta) return null;

  return (
    <button
      type="button"
      onClick={() => onIr(puerta.destino)}
      className="w-full card-panel p-5 text-left flex items-center gap-4
                 min-h-[72px] transition-colors hover:bg-gold/[0.05]"
    >
      <span className="flex-1 min-w-0">
        <span className="block text-[19px] font-semibold text-cream leading-snug">
          {puerta.label}
        </span>
        <span className="block mt-1 text-[17px] text-cream/70 leading-snug">
          {puerta.bajada}
        </span>
      </span>
      <ArrowRight className="w-5 h-5 shrink-0 text-gold" strokeWidth={1.8} />
    </button>
  );
}
