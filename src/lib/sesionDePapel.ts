/**
 * sesionDePapel.ts — T11 · La Sesión de Papel (Plan Maestro, idea #6).
 * El PDF de 1 página por episodio, para el cuaderno: título del episodio,
 * datos, y cuatro consignas con renglones para escribir a mano. jsPDF se
 * importa dinámicamente (sólo carga al descargar) — no engorda el bundle.
 */
export interface SesionDePapelOpts {
  titulo: string;
  nombre?: string;
  dia?: number;
}

const GOLD: [number, number, number] = [232, 150, 46];
const CREMA: [number, number, number] = [242, 239, 233];
const NEGRO: [number, number, number] = [8, 8, 8];

const CONSIGNAS = [
  'Lo que trabajé hoy',
  'La decisión que tomé',
  'Lo que me costó — y por qué',
  'Mi próximo paso',
];

export async function descargarSesionDePapel(opts: SesionDePapelOpts): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;

  // Encabezado negro
  doc.setFillColor(NEGRO[0], NEGRO[1], NEGRO[2]);
  doc.rect(0, 0, W, 96, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text('TU CLÍNICA DIGITAL  ·  SESIÓN DE PAPEL', M, 40);
  doc.setFontSize(17);
  doc.setTextColor(CREMA[0], CREMA[1], CREMA[2]);
  doc.text(doc.splitTextToSize(opts.titulo, W - M * 2), M, 68);

  // Línea de datos
  const meta = [
    opts.nombre || null,
    opts.dia ? `Día ${opts.dia} de 90` : null,
    new Date().toLocaleDateString(),
  ]
    .filter(Boolean)
    .join('    ·    ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(meta, M, 124);

  // Consignas con renglones
  let y = 162;
  for (const consigna of CONSIGNAS) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(consigna, M, y);
    y += 16;
    doc.setDrawColor(214, 214, 214);
    doc.setLineWidth(0.6);
    for (let i = 0; i < 3; i++) {
      doc.line(M, y, W - M, y);
      y += 26;
    }
    y += 16;
  }

  // Pie
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Sanadores Libres  ·  tuclinicadigital.com', M, H - 40);

  const slug = opts.titulo
    .slice(0, 28)
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  doc.save(`sesion-de-papel-${slug || 'episodio'}.pdf`);
}
