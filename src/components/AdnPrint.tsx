import { Printer } from 'lucide-react';

interface Campo { label: string; valor: string }
interface Seccion { titulo: string; subtitulo?: string; campos: Campo[] }

interface Props {
  nombreCliente: string;
  especialidad?: string;
  secciones: Seccion[];   // solo campos con contenido
  version?: string;       // ej: "v7"
}

export default function AdnPrint({ nombreCliente, especialidad, secciones, version = 'v7' }: Props) {
  function imprimir() {
    const win = window.open('', '_blank');
    if (!win) return;
    const hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>ADN — ${nombreCliente}</title>
<style>
  @page { margin: 2.2cm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color:#1a1a1a; line-height:1.6; }
  .portada { text-align:center; padding:120px 0 60px; page-break-after: always; }
  .marca { font-size:11px; letter-spacing:4px; text-transform:uppercase; color:#B8862E; margin-bottom:40px; }
  h1 { font-size:34px; font-weight:normal; margin-bottom:8px; }
  .sub { font-size:14px; color:#666; font-style:italic; }
  .meta { margin-top:60px; font-size:11px; color:#999; letter-spacing:1px; }
  .sec { page-break-inside: avoid; margin-bottom:34px; }
  .sec-t { font-size:18px; border-bottom:2px solid #B8862E; padding-bottom:6px; margin-bottom:4px; }
  .sec-s { font-size:11px; color:#888; font-style:italic; margin-bottom:16px; }
  .campo { margin-bottom:18px; page-break-inside: avoid; }
  .campo-l { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#B8862E; font-weight:bold; margin-bottom:4px; }
  .campo-v { font-size:13px; white-space:pre-wrap; }
  .pie { margin-top:60px; padding-top:20px; border-top:1px solid #ddd; text-align:center; font-size:10px; color:#999; letter-spacing:1px; }
</style></head><body>
<div class="portada">
  <div class="marca">Tu Clínica Digital</div>
  <h1>El ADN de ${nombreCliente}</h1>
  <div class="sub">${especialidad ? especialidad + ' · ' : ''}El documento fundacional de tu clínica</div>
  <div class="meta">ADN ${version} · ${hoy} · Documento personal e intransferible</div>
</div>
${secciones.map(s => `
<div class="sec">
  <div class="sec-t">${s.titulo}</div>
  ${s.subtitulo ? `<div class="sec-s">${s.subtitulo}</div>` : ''}
  ${s.campos.map(c => `
  <div class="campo">
    <div class="campo-l">${c.label}</div>
    <div class="campo-v">${(c.valor || '').replace(/</g,'&lt;')}</div>
  </div>`).join('')}
</div>`).join('')}
<div class="pie">Tu Clínica Digital · Javo Katz · Bariloche, Patagonia — Este documento es el corazón de tu práctica. Cuidalo.</div>
<script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body></html>`);
    win.document.close();
  }

  return (
    <button onClick={imprimir}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(232,150,46,0.3)] text-sm font-semibold text-gold hover:bg-gold/10 transition-all">
      <Printer className="w-4 h-4" />
      Descargar mi ADN como PDF
    </button>
  );
}
