/**
 * ReporteDirector.tsx — El Reporte del Director (Cirugía Total G3 · jul 2026)
 * La vista imprimible de los números del cliente: su mes, su camino, su clínica.
 * Sin librerías de PDF: window.print() con estilos de impresión — el navegador hace el resto.
 */
import React from 'react';
import { X, Printer } from 'lucide-react';
import { CINTURONES, cinturonDesdeProgreso } from '../lib/cinturones';
import { SEED_ROADMAP_V2 } from '../lib/roadmapSeed';

interface ReporteDirectorProps {
  nombre: string;
  diaPrograma: number;
  completadas: Set<string>;
  ventas: { suma: number; count: number };
  racha: number;
  onClose: () => void;
}

export default function ReporteDirector({ nombre, diaPrograma, completadas, ventas, racha, onClose }: ReporteDirectorProps) {
  const totalSesiones = SEED_ROADMAP_V2.reduce((a, p) => a + p.metas.length, 0);
  const hechas = completadas.size;
  const cint = cinturonDesdeProgreso(completadas);
  const prox = CINTURONES.find((c) => c.orden === cint.orden + 1);
  const fecha = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 print:p-0 print:bg-white" onClick={onClose}>
      <div
        className="bg-[#0C0C0C] print:bg-white border border-[#F5A623]/30 print:border-0 rounded-2xl print:rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de acciones (no se imprime) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FFFFFF]/10 print:hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">El Reporte del Director</p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5A623] text-black text-xs font-bold hover:bg-[#FFB94D] transition-colors">
              <Printer className="w-3.5 h-3.5" /> Imprimir / Guardar PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#FFFFFF]/10 text-[#FFFFFF]/60"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* El reporte */}
        <div className="p-8 print:p-10 text-[#EDEDED] print:text-[#1a1a1a]">
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#F5A623] font-bold">Tu Clínica Digital · Método CLINICA</p>
            <h1 className="text-3xl font-light mt-2" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Reporte del Director</h1>
            <p className="text-sm opacity-60 mt-1">{nombre} · {fecha}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-[#F5A623]/25 print:border-gray-300 rounded-xl p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-50">Día del programa</p>
              <p className="text-3xl font-light mt-1">{Math.min(diaPrograma, 90)} <span className="text-sm opacity-40">/ 90</span></p>
            </div>
            <div className="border border-[#F5A623]/25 print:border-gray-300 rounded-xl p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-50">Tu cinturón</p>
              <p className="text-2xl font-light mt-1">{cint.emoji} {cint.nombre}</p>
              <p className="text-[10px] opacity-40">{cint.metafora}</p>
            </div>
            <div className="border border-[#F5A623]/25 print:border-gray-300 rounded-xl p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-50">Sesiones del Camino</p>
              <p className="text-3xl font-light mt-1">{hechas} <span className="text-sm opacity-40">/ {totalSesiones}</span></p>
            </div>
            <div className="border border-[#F5A623]/25 print:border-gray-300 rounded-xl p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest opacity-50">Racha de sesiones</p>
              <p className="text-3xl font-light mt-1">{racha} 🔥</p>
            </div>
          </div>

          <div className="border-2 border-[#22C55E]/40 print:border-green-600 rounded-xl p-6 text-center mb-8">
            <p className="text-[10px] uppercase tracking-widest opacity-60">Tu clínica, en números</p>
            <p className="text-4xl font-light mt-2 text-[#22C55E] print:text-green-700">${ventas.suma.toLocaleString()}</p>
            <p className="text-sm opacity-60 mt-1">{ventas.count} paciente{ventas.count !== 1 ? 's' : ''} · {ventas.suma >= 2000 ? `inversión recuperada ${(ventas.suma / 2000).toFixed(1)}×` : `${Math.round((ventas.suma / 2000) * 100)}% de tu inversión recuperada`}</p>
          </div>

          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-2">Lo que sigue</p>
            <p className="text-sm opacity-80 leading-relaxed">
              {prox
                ? `Tu próximo cinturón es ${prox.emoji} ${prox.nombre} — ${prox.metafora}. Una sesión por día. El sistema sostiene; tú caminas.`
                : 'Cinturón Negro. Sanador Libre. Tu clínica ya funciona sola — y sigue con MiClínica Digital.'}
            </p>
          </div>

          <p className="text-[10px] opacity-30 text-center italic">El taekwondo no se gana en un día de furia — se gana en mil días de presencia. · Tu Clínica Digital</p>
        </div>
      </div>
    </div>
  );
}
