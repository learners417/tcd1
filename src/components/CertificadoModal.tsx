/**
 * CertificadoModal — T11 · El Certificado que trabaja (Plan Maestro, idea #18).
 * El certificado de Cinturón Negro: se ve en pantalla, se descarga en PDF
 * (jsPDF dinámico) y lleva el sello + link a TCD — así trabaja cuando el
 * fundador lo comparte. El método propio aparece si está definido en el ADN.
 */
import React, { useState } from 'react';
import { X, Award, Download, ExternalLink } from 'lucide-react';

/** Slot: ajustá al dominio público real de TCD si cambia. */
const TCD_URL = 'https://tuclinicadigital.com';

export default function CertificadoModal({
  open,
  onClose,
  nombre,
  metodoNombre,
  ventas,
}: {
  open: boolean;
  onClose: () => void;
  nombre?: string;
  metodoNombre?: string;
  ventas?: number;
}) {
  const [generando, setGenerando] = useState(false);
  if (!open) return null;

  const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  const quien = nombre || 'Sanador Libre';
  const pacientes = ventas ?? 10;

  const descargar = async () => {
    setGenerando(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      doc.setFillColor(8, 8, 8);
      doc.rect(0, 0, W, H, 'F');
      doc.setDrawColor(232, 150, 46);
      doc.setLineWidth(2);
      doc.rect(28, 28, W - 56, H - 56);
      doc.setLineWidth(0.6);
      doc.rect(38, 38, W - 76, H - 76);

      doc.setTextColor(232, 150, 46);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TU CLÍNICA DIGITAL  ·  SANADORES LIBRES', W / 2, 96, { align: 'center' });
      doc.setTextColor(242, 239, 233);
      doc.setFontSize(15);
      doc.text('CERTIFICA QUE', W / 2, 152, { align: 'center' });
      doc.setFont('times', 'italic');
      doc.setFontSize(38);
      doc.setTextColor(232, 150, 46);
      doc.text(quien, W / 2, 212, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(242, 239, 233);
      const linea = metodoNombre
        ? `alcanzó el Cinturón Negro instalando ${metodoNombre}`
        : 'alcanzó el Cinturón Negro — Sanador Libre';
      doc.text(doc.splitTextToSize(linea, W - 220), W / 2, 262, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(180, 180, 180);
      doc.text(
        `Clínica digital instalada  ·  ${pacientes} pacientes con precio digno  ·  ${fecha}`,
        W / 2,
        302,
        { align: 'center' },
      );
      doc.setTextColor(232, 150, 46);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('tuclinicadigital.com', W / 2, H - 68, { align: 'center' });

      doc.save(`certificado-sanador-libre-${quien.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-[#F2EFE9]/50 hover:text-[#F2EFE9] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificado en pantalla */}
        <div
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#141210] to-[#080808] p-8 text-center"
          style={{ border: '2px solid rgba(232,150,46,0.5)' }}
        >
          <div className="absolute inset-3 border border-[#E8962E]/20 rounded-xl pointer-events-none" />
          <Award className="w-10 h-10 text-[#E8962E] mx-auto mb-3" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E8962E] mb-4">
            Tu Clínica Digital · Sanadores Libres
          </p>
          <p className="text-xs uppercase tracking-widest text-[#F2EFE9]/50 mb-2">Certifica que</p>
          <h2
            className="text-3xl text-[#E8962E] mb-3"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          >
            {quien}
          </h2>
          <p className="text-sm text-[#F2EFE9]/80 leading-relaxed mb-2">
            {metodoNombre ? (
              <>
                alcanzó el <span className="text-[#F2EFE9] font-medium">Cinturón Negro</span> instalando{' '}
                <span className="text-[#F2EFE9] font-medium">{metodoNombre}</span>
              </>
            ) : (
              <>
                alcanzó el <span className="text-[#F2EFE9] font-medium">Cinturón Negro</span> — Sanador
                Libre
              </>
            )}
          </p>
          <p className="text-[11px] text-[#F2EFE9]/45">
            Clínica digital instalada · {pacientes} pacientes con precio digno · {fecha}
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={descargar}
            disabled={generando}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E8962E] text-black text-sm font-bold uppercase tracking-wider hover:bg-[#F4B65C] transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {generando ? 'Generando…' : 'Descargar PDF'}
          </button>
          <a
            href={TCD_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#E8962E]/30 text-[#E8962E] text-sm font-bold uppercase tracking-wider hover:bg-[#E8962E]/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> TCD
          </a>
        </div>
      </div>
    </div>
  );
}
