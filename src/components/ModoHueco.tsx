/**
 * MODO HUECO (T12) — el avatar vive en huecos de 10-15 min entre pacientes.
 * Esta tarjeta convierte el hueco en avance: mira su estado real y le da
 * UNA acción completable ahora — sin abrumar, sin lista, una sola.
 * Prioridad: (1) sesión pausada → retomarla · (2) compromiso pendiente →
 * cumplirlo · (3) contarle al Mentor dónde está.
 */
import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { getSesionEnCurso } from '../lib/sessionLog';
import { getUltimaSesion } from './sesion/SesionViva';

interface Props {
  onNavigate: (page: string) => void;
}

export default function ModoHueco({ onNavigate }: Props) {
  const enCurso = getSesionEnCurso();
  const ultima = getUltimaSesion();

  let titulo: string;
  let detalle: string;
  let cta: string;
  let destino: string;

  if (enCurso) {
    titulo = 'Retoma donde quedaste';
    detalle = `"${enCurso.metaTitulo}" está pausada, esperándote. Todo quedó guardado — 10 minutos de avance valen más que cero.`;
    cta = 'Retomar la sesión';
    destino = 'roadmap';
  } else if (ultima?.compromisos?.length) {
    titulo = 'Cumplí un compromiso';
    detalle = `Prometiste: "${ultima.compromisos[0]}". Un hueco alcanza para honrarlo — lo prometido se cumple, aunque sea en parte.`;
    cta = 'Ir a El Camino';
    destino = 'roadmap';
  } else {
    titulo = 'Cuéntale al Mentor dónde estás';
    detalle = 'Dos líneas alcanzan: qué hiciste hoy, qué te frenó. El Mentor con contexto te destraba mejor que el Mentor adivinando.';
    cta = 'Abrir el Mentor';
    destino = 'coach';
  }

  return (
    <div className="rounded-2xl border border-gold/20 bg-gold/[0.04] p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gold flex items-center gap-1.5 mb-1.5">
        <Zap className="w-3.5 h-3.5" /> ¿Tienes solo 10-15 minutos?
      </p>
      <p className="text-sm font-semibold text-cream">{titulo}</p>
      <p className="text-xs text-cream/55 mt-1 leading-relaxed">{detalle}</p>
      <button
        type="button"
        onClick={() => onNavigate(destino)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-goldhi transition-colors"
      >
        {cta} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
