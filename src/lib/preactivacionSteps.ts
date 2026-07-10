// ═══════════════════════════════════════════════════════════════════════════
// Pre-Activación Checklist — versión operativa (validada por Ivan + Lupe).
// 6 secciones · 32 pasos tácticos con herramienta asociada.
// ═══════════════════════════════════════════════════════════════════════════

export interface PreactivacionStepDef {
  id: string;
  /** La sesión equivalente en El Camino (para el tildado automático de clientes-app). */
  meta?: string;
  /** Label corto multilínea para columna. Usar \n para forzar salto de línea. */
  lbl: string;
  title: string;
  /** Detail rendered as HTML — puede contener <strong>. */
  detail: string;
}

export interface PreactivacionSection {
  id: string;
  title: string;
  /** Etiqueta corta para el header de grupo en la matriz. */
  short: string;
  items: PreactivacionStepDef[];
}

export interface PreactivacionStep extends PreactivacionStepDef {
  sectionId: string;
}

export const SECTIONS: PreactivacionSection[] = [
  {
    id: 'base',
    title: 'Base — Fases 1-2 del Camino',
    short: 'BASE',
    items: [
      { id: 'pacto', lbl: 'Pacto\nfirmado', title: 'El Pacto firmado', detail: 'Su promesa escrita y firmada en el onboarding. <strong>Sin pacto no hay camino.</strong>', meta: 'P0.4' },
      { id: 'foto_partida', lbl: 'Foto de\nPartida', title: 'Foto de Partida', detail: 'Su autoevaluación inicial completa — el ANTES contra el que se mide todo.', meta: 'P0.2' },
      { id: 'quema', lbl: 'LA\nQUEMA', title: 'LA QUEMA 🔥 (D4 · foto) (con evidencia)', detail: 'La creencia raíz quemada, <strong>con foto de las cenizas subida</strong>.', meta: 'P1.3' },
      { id: 'numero', lbl: 'EL\nNÚMERO', title: 'El Número (su precio)', detail: 'Su precio digno calculado y <strong>dicho en voz alta (audio subido)</strong>.', meta: 'P1.5' },
      { id: 'metodo', lbl: 'Método\ncon nombre', title: 'El Método con su nombre', detail: 'Su proceso destilado en 3-5 pasos con nombre propio.', meta: 'P2.4' },
      { id: 'avatar', lbl: 'Avatar\ndefinido', title: 'El avatar', detail: 'La persona exacta: quién es, qué le duele, qué dice después de sesión.', meta: 'P2.3' },
      { id: 'oferta', lbl: 'Oferta\n$1.000', title: 'La Oferta Irresistible', detail: 'Promesa, entregables, garantía y precio — la oferta de $1.000 completa.', meta: 'P3.2' },
      { id: 'pitch', lbl: 'Pitch\ngrabado', title: 'El pitch de 60 segundos', detail: 'Su oferta sonando en el mundo — <strong>audio subido</strong>.', meta: 'P3.4' },
    ],
  },
  {
    id: 'tecnico',
    title: 'Técnico — la infraestructura',
    short: 'TÉCNICO',
    items: [
      { id: 'bm', lbl: 'Business\nManager', title: 'Business Manager creado', detail: 'Su BM de Meta activo y verificado.', meta: 'P2.2' },
      { id: 'pixel', lbl: 'Pixel\ninstalado', title: 'El Pixel de Meta', detail: 'Instalado en su página y <strong>verificado con el Helper de Meta</strong>. Sin pixel, los anuncios vuelan a ciegas.', meta: 'P4.5' },
      { id: 'wa_business', lbl: 'WhatsApp\nBusiness', title: 'WhatsApp Business activo', detail: 'Su número de negocio conectado.' },
      { id: 'subcuenta', lbl: 'Subcuenta\nGHL', title: 'Su subcuenta GHL viva', detail: 'Creada desde el snapshot maestro — el motor invisible.' },
      { id: 'agente', lbl: 'Agente\nrespondiendo', title: 'El agente de WhatsApp', detail: 'Configurado y respondiendo — la Sala de Espera abierta.', meta: 'P4.5' },
      { id: 'agenda', lbl: 'Agenda\ncon horarios', title: 'La agenda', detail: 'Calendario con sus horarios reales, link funcionando.', meta: 'P4.5' },
      { id: 'cobro', lbl: 'Cobro\nconfigurado', title: 'El cobro', detail: 'Su forma de cobrar lista (link, transferencia, pasarela).', meta: 'P4.5' },
      { id: 'landing', lbl: 'Landing\npublicada', title: 'La landing', detail: 'Su página con la oferta, publicada y abriendo.', meta: 'P4.2' },
  { id: 'perfil_ig', label: 'Perfil IG optimizado (D22)', meta: 'P4.2b', fase: 'sistema' } as never,
  { id: 'followme', label: 'Anuncio follow-me corriendo (D28)', meta: 'P4.6', fase: 'sistema' } as never,
      { id: 'dominio', lbl: 'DOMINIO\nconectado', title: 'El dominio (DNS ok)', detail: 'Su dirección digital propia, conectada y propagada.', meta: 'P4.5b' },
    ],
  },
  {
    id: 'contenido',
    title: 'Contenido — las piezas',
    short: 'CONTENIDO',
    items: [
      { id: 'guiones', lbl: 'Guiones\naprobados', title: 'Los guiones', detail: 'Sus 3 guiones de anuncio escritos con Mateo.', meta: 'P4.3' },
      { id: 'videos', lbl: '3 videos\ngrabados', title: 'El Día de Grabación', detail: 'Las 3 piezas grabadas — <strong>evidencia subida</strong>.', meta: 'P4.3b' },
      { id: 'edicion', lbl: 'Editados\ny subidos', title: 'Edición y subida', detail: 'Cortados, subtitulados, exportados en vertical.', meta: 'P4.3c' },
      { id: 'estaticos', lbl: 'Creativos\nestáticos', title: 'Los estáticos (fábrica IA)', detail: '2-3 anuncios de imagen generados con la fábrica.', meta: 'P4.3c' },
    ],
  },
  {
    id: 'campana',
    title: 'Campaña — el encendido',
    short: 'CAMPAÑA',
    items: [
      { id: 'validacion', lbl: 'Validación\norgánica', title: 'La validación', detail: 'Publicado orgánico + boost de test corrido.', meta: 'P4.3d' },
      { id: 'ctwa', lbl: 'CTWA\nENCENDIDA', title: 'La campaña activa', detail: '<strong>En circulación, con captura subida.</strong> El sistema vive.', meta: 'P4.4' },
      { id: 'presupuesto', lbl: 'Presupuesto\ndiario', title: 'El presupuesto', detail: 'Gasto diario confirmado y sostenible.' },
    ],
  },
  {
    id: 'venta',
    title: 'Venta — los cierres',
    short: 'VENTA',
    items: [
      { id: 'script', lbl: 'Script\nLa W', title: 'El script de ventas', detail: 'Su W personal escrita con Lucas.', meta: 'P5.2' },
      { id: 'roleplay', lbl: 'Roleplay\naprobado', title: 'El roleplay', detail: 'Tres rondas contra el prospecto difícil.', meta: 'P5.3' },
      { id: 'llamada', lbl: '1ª llamada\nreal', title: 'La primera llamada', detail: 'Realizada y registrada — <strong>el Azul</strong>.', meta: 'P5.4' },
      { id: 'pago', lbl: 'PRIMER\nPAGO', title: 'El primer pago 💰', detail: '<strong>Comprobante subido — el Rojo.</strong> El momento que cambia todo.', meta: 'P6.3' },
    ],
  },
  {
    id: 'entrega',
    title: 'Entrega — la clínica',
    short: 'ENTREGA',
    items: [
      { id: 'protocolo', lbl: 'Protocolo\ndocumentado', title: 'El protocolo de entrega', detail: 'Su forma de entregar, documentada (lista para MCD).', meta: 'P6.2' },
      { id: 'testimonio', lbl: 'Testimonio\npedido', title: 'El testimonio', detail: 'Pedido a cada paciente que termina — su prueba social.' },
    ],
  },
];

export const STEPS: PreactivacionStep[] = SECTIONS.flatMap((section) =>
  section.items.map<PreactivacionStep>((item) => ({ ...item, sectionId: section.id }))
);

export const TOTAL_STEPS = STEPS.length;

export function getSectionById(id: string): PreactivacionSection | undefined {
  return SECTIONS.find((s) => s.id === id);
}
