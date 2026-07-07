/**
 * Graduacion.tsx — El FINAL del viaje (T3 · auditoría troncal, jul 2026)
 * Se muestra UNA vez, cuando el Sanador llega a las 10 ventas registradas.
 * El clímax emocional del programa + las dos puertas: MCD y el Nivel 2.
 */
import React, { useEffect, useState } from 'react';
import { Trophy, ArrowRight, MessageSquare } from 'lucide-react';

interface GraduacionProps {
  nombre?: string;
  ventas: number;
  onClose: () => void;
  onIrAlChat?: () => void;
}

export default function Graduacion({ nombre, ventas, onClose, onIrAlChat }: GraduacionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className={`max-w-lg w-full my-8 rounded-2xl border border-[#E8962E]/30 bg-gradient-to-b from-[#111110] to-[#080808] p-8 text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="text-6xl mb-4">⬛</div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E8962E] mb-2">
          Cinturón Negro
        </p>
        <h2
          className="text-3xl font-medium text-[#F2EFE9] mb-2"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          {nombre ? `${nombre}, eres` : 'Eres'} un Sanador Libre
        </h2>
        <p className="text-sm italic text-[#F2EFE9]/50 mb-6">
          El árbol que da semillas
        </p>

        <div className="rounded-xl border border-[#F2EFE9]/10 bg-[#0F0F0F] p-5 mb-6 text-left">
          <p className="text-sm text-[#F2EFE9]/80 leading-relaxed">
            <span className="text-[#E8962E] font-semibold">{ventas} pacientes</span> cobrados
            con tu precio digno, por un sistema que construiste tú. Hace 90 días eras el
            profesional que perseguía pacientes. Hoy eres el director de tu clínica digital.
            <span className="block mt-2 text-[#F2EFE9]/60">
              El mártir quedó atrás. Y esto recién empieza.
            </span>
          </p>
        </div>

        {/* Las dos puertas */}
        <div className="space-y-3 mb-6 text-left">
          <div className="rounded-xl border border-[#E8962E]/25 bg-[#E8962E]/[0.05] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8962E] mb-1">
              Puerta 1 · Tu clínica sigue operando
            </p>
            <p className="text-xs text-[#F2EFE9]/70 leading-relaxed">
              Tu sistema ahora vive en <span className="text-[#F2EFE9] font-medium">MiClínica Digital</span>:
              tus pacientes, tu agenda, tu protocolo y tus cobros — en piloto automático, todos los meses.
            </p>
          </div>
          <div className="rounded-xl border border-[#F2EFE9]/15 bg-[#0F0F0F] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/50 mb-1">
              Puerta 2 · El Nivel 2 existe
            </p>
            <p className="text-xs text-[#F2EFE9]/70 leading-relaxed">
              De $10K en 90 días a <span className="text-[#F2EFE9] font-medium">$25K por mes</span>.
              El cinturón negro tiene grados — y el 1er dan es la puerta, no el techo.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onIrAlChat?.();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#E8962E] text-black text-sm font-semibold hover:bg-[#F4B65C] transition-colors mb-3"
        >
          <MessageSquare className="w-4 h-4" />
          Hablar con el equipo sobre mi siguiente paso
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="text-xs text-[#F2EFE9]/40 hover:text-[#F2EFE9]/70 transition-colors"
        >
          Quedarme un rato más acá, mirando lo que logré
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-6 opacity-60">
          <Trophy className="w-3.5 h-3.5 text-[#E8962E]" />
          <span className="text-[10px] uppercase tracking-widest text-[#F2EFE9]/40">
            Tu Clínica Digital · Sanadores Libres
          </span>
        </div>
      </div>
    </div>
  );
}
