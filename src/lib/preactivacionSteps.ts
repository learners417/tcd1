// ═══════════════════════════════════════════════════════════════════════════
// PRE-LANZAMIENTO · el checklist real de la operación (planilla de Javo, jul 2026).
// 14 bloques · 62 ítems · cada uno con su responsable (cliente / agencia / ambos).
//
// Cada celda de la matriz admite 4 estados (pendiente · en proceso · listo · N/A),
// una nota y un link (Drive, doc, página, calendario).
// ═══════════════════════════════════════════════════════════════════════════

export type Responsable = 'cliente' | 'agencia' | 'ambos';

export const RESPONSABLE_LABEL: Record<Responsable, string> = {
  cliente: 'Cliente',
  agencia: 'Agencia',
  ambos: 'Ambos',
};

export const RESPONSABLE_SIGLA: Record<Responsable, string> = {
  cliente: 'C',
  agencia: 'A',
  ambos: 'C+A',
};

export interface PreactivacionStepDef {
  id: string;
  /** La sesión equivalente en El Camino (para el tildado automático de clientes-app). */
  meta?: string;
  /** Label corto multilínea para columna. Usar \n para forzar salto de línea. */
  lbl: string;
  title: string;
  /** Detail rendered as HTML — puede contener <strong>. */
  detail: string;
  /** Quién lo hace: define a quién reclamarle. */
  quien: Responsable;
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
    id: 'perfil',
    title: '1 · Perfil de Instagram',
    short: 'PERFIL',
    items: [
      { id: 'perfil_foto', quien: 'cliente', lbl: 'Foto de\nperfil', title: 'Foto de perfil', detail: 'Cara visible, luz decente, fondo limpio. Es la primera prueba de confianza.' },
      { id: 'perfil_nombre', quien: 'agencia', lbl: 'Nombre de\nperfil', title: 'Nombre de perfil OK', detail: 'Nombre + lo que hace, buscable. Que en 2 segundos se entienda a quién ayuda.', meta: 'P4.2b' },
      { id: 'perfil_bio', quien: 'agencia', lbl: 'Biografía\noptimizada', title: 'Biografía optimizada', detail: 'A quién sirve, qué logra y el <strong>link a su página de venta</strong>.', meta: 'P4.2b' },
      { id: 'perfil_destacadas', quien: 'agencia', lbl: 'Historias\ndestacadas', title: 'Historias destacadas', detail: 'Quién es, su método, resultados y cómo trabajar con él — con portadas parejas.' },
      { id: 'perfil_fijado', quien: 'agencia', lbl: 'Posts\nfijados', title: 'Posts fijados', detail: 'Lo que tiene que ver primero quien llega de un anuncio.' },
      { id: 'perfil_carrusel', quien: 'agencia', lbl: 'Carrusel\nMi historia', title: 'Carrusel «Mi historia» publicado', detail: 'Publicado y fijado, <strong>con el CTA de la palabra clave</strong> funcionando.' },
    ],
  },
  {
    id: 'metodo',
    title: '2 · Método',
    short: 'MÉTODO',
    items: [
      { id: 'metodo_nombre', quien: 'ambos', lbl: 'Nombre\n(acrónimo)', title: 'Nombre del método (acrónimo)', detail: 'Su método con nombre propio. Con nombre suena a sistema; sin nombre suena a consejo.', meta: 'P2.4' },
      { id: 'metodo_construccion', quien: 'ambos', lbl: 'Método\nconstruido', title: 'Construcción del método', detail: 'Está claro <strong>qué vende, a quién le vende y qué herramientas entrega</strong>. Los pasos en orden, con su porqué.' },
      { id: 'metodo_herramientas', quien: 'cliente', lbl: 'Herramientas\ncreadas', title: 'Herramientas creadas', detail: 'Los PDF, plantillas y videos de servicio que el paciente recibe — creados, no prometidos.' },
      { id: 'metodo_editadas', quien: 'agencia', lbl: 'Herramientas\neditadas', title: 'Herramientas editadas y listas', detail: 'Diseñadas y <strong>listas para entregar</strong>: con su marca, legibles, sin borradores.' },
      { id: 'metodo_hogar', quien: 'ambos', lbl: 'Dónde\nse aloja', title: 'Dónde se aloja', detail: 'Decidido y montado: <strong>Skool, GHL o su propia app</strong>. El paciente sabe adónde entra.' },
      { id: 'metodo_subido', quien: 'agencia', lbl: 'Método\nsubido', title: 'Método completo subido', detail: 'Cargado entero en su plataforma, con el orden de entrega armado.' },
      { id: 'metodo_entrega', quien: 'cliente', lbl: 'Sabe\nentregar', title: 'El cliente sabe cómo entregar su servicio', detail: 'Puede explicar sesión por sesión qué hace con el paciente. <strong>Sin esto, vender es una trampa.</strong>' },
    ],
  },
  {
    id: 'landing',
    title: '3 · Landing y dominio',
    short: 'LANDING',
    items: [
      { id: 'landing_lista', quien: 'agencia', lbl: 'Landing\nlista', title: 'Landing page lista', detail: 'Venta completa: video + oferta + <strong>inversión visible («desde $X»)</strong> + a quién es y a quién no. Con los descargos al pie.', meta: 'P4.2d' },
      { id: 'dominio', quien: 'agencia', lbl: 'Dominio\nconectado', title: 'Dominio conectado', detail: 'Su dirección propia con los DNS resueltos y el candado de seguridad andando.', meta: 'P4.5b' },
      { id: 'pixel', quien: 'agencia', lbl: 'Píxel\ninstalado', title: 'Píxel de Meta en la landing', detail: 'Instalado y <strong>verificado con el Helper</strong>. Sin píxel, los anuncios vuelan a ciegas.' },
    ],
  },
  {
    id: 'ghl',
    title: '4 · Go High Level',
    short: 'GHL',
    items: [
      { id: 'calendarios', quien: 'agencia', lbl: 'Calendarios\nconfigurados', title: 'Calendarios configurados', detail: 'Horarios reales, zona horaria correcta y <strong>embebido DESPUÉS del precio</strong>.' },
      { id: 'formulario', quien: 'agencia', lbl: 'Preguntas\ndel formulario', title: 'Preguntas del formulario', detail: 'Las <strong>3-4 preguntas obligatorias</strong> de la reserva. Son la calificación: él las lee antes de cada llamada.' },
    ],
  },
  {
    id: 'meta',
    title: '5 · Meta Business',
    short: 'META',
    items: [
      { id: 'm_portafolio', quien: 'agencia', lbl: 'Portafolio\ncomercial', title: 'Portafolio comercial creado', detail: 'Su Business Manager propio, a su nombre, con acceso de administrador.' },
      { id: 'm_fanpage', quien: 'agencia', lbl: 'Fan\npage', title: 'Fan page creada', detail: 'Con foto y descripción — es requisito para pautar.' },
      { id: 'm_ig', quien: 'agencia', lbl: 'IG\nasociado', title: 'Cuenta de IG asociada', detail: 'Cuenta profesional, vinculada al portafolio y a la página.' },
      { id: 'm_wa_cuenta', quien: 'cliente', lbl: 'WhatsApp\nBusiness', title: 'Cuenta de WhatsApp Business', detail: '<strong>Número nuevo</strong>, no el personal. Es la línea de su clínica.' },
      { id: 'm_wa_meta', quien: 'agencia', lbl: 'WhatsApp\nen Meta', title: 'WhatsApp conectado a Meta', detail: 'Vinculado a la cuenta comercial para que todo quede en un solo lugar.' },
      { id: 'm_pago', quien: 'cliente', lbl: 'Método\nde pago', title: 'Método de pago cargado', detail: 'Tarjeta activa y verificada. <strong>Sin esto la campaña no arranca.</strong>' },
      { id: 'm_campanas', quien: 'agencia', lbl: 'Campañas\ncreadas', title: 'Campañas publicitarias creadas', detail: 'Una sola campaña de tráfico al perfil, con sus 3 anuncios adentro y la misma palabra en todos.', meta: 'P4.4' },
      { id: 'm_config', quien: 'ambos', lbl: 'Países y\npresupuesto', title: 'Países y presupuesto definidos', detail: 'Dónde se muestra y cuánto se gasta: <strong>20-25 USD por día, 14 días sin tocar</strong>.' },
    ],
  },
  {
    id: 'automatizaciones',
    title: '6 · Automatizaciones',
    short: 'AUTOM.',
    items: [
      { id: 'palabras', quien: 'agencia', lbl: 'Palabras\nclave', title: 'Palabras clave definidas (comentario / DM)', detail: 'Una palabra corta en mayúsculas ligada a su oferta — nunca «INFO». La misma en toda la campaña.', meta: 'P4.2c' },
      { id: 'automatizacion', quien: 'agencia', lbl: 'Automatización\nandando', title: 'Automatización mensaje + landing funcionando', detail: 'Responde al comentario Y al mensaje directo: entrega el link y hace <strong>UNA pregunta sobre su situación</strong>. <strong>Probada con un comentario real.</strong>', meta: 'P4.5' },
      { id: 'wa_agente', quien: 'agencia', lbl: 'Agente\nWhatsApp', title: 'Agente de WhatsApp', detail: 'Configurado con el <strong>PDF de entrenamiento</strong> cargado en el KAI de su propio WhatsApp.' },
    ],
  },
  {
    id: 'cobro',
    title: '7 · Cobro',
    short: 'COBRO',
    items: [
      { id: 'pagos', quien: 'ambos', lbl: 'Links de\npago', title: 'Links de pago para cobrar su programa', detail: 'Link probado, en su moneda, con el plan de cuotas si lo ofrece.' },
    ],
  },
  {
    id: 'guiones',
    title: '8 · Guiones',
    short: 'GUIONES',
    items: [
      { id: 'g_vsl', quien: 'agencia', lbl: 'Guion\nVSL', title: 'Guion del VSL', detail: 'El video de venta de su página: problema, método, oferta, precio y qué hacer ahora.' },
      { id: 'g_preparacion', quien: 'agencia', lbl: 'Guion\npreparación', title: 'Guion de preparación', detail: 'El video que ve quien ya agendó — llega caliente y sabiendo qué esperar.' },
      { id: 'g_reels', quien: 'agencia', lbl: 'Guiones\nreels', title: 'Guiones de reels de valor', detail: 'Sus piezas de valor para el perfil: enseñan el QUÉ, nunca el CÓMO.' },
      { id: 'g_anuncios', quien: 'agencia', lbl: 'Guiones\nanuncios', title: 'Guiones de anuncios', detail: 'Uno de <strong>piedras</strong>, uno de <strong>dolor o historia</strong>, uno de <strong>resultado o método</strong> — con su auditoría de ingredientes en verde.', meta: 'P4.3' },
      { id: 'g_carrusel', quien: 'agencia', lbl: 'Guion\nMi historia', title: 'Guion del carrusel «Mi historia»', detail: 'Su historia real con el CTA de la palabra clave. Es lo que va fijado en el perfil.' },
      { id: 'g_destacadas', quien: 'agencia', lbl: 'Guiones\ndestacadas', title: 'Guiones de historias destacadas', detail: 'Qué dice cada destacada, en orden, para que cuenten una sola historia.' },
      { id: 'g_historias', quien: 'agencia', lbl: 'Guiones\nhistorias venta', title: 'Guiones de historias de venta (3 diarias)', detail: 'La secuencia: <strong>curiosidad → contexto → pedido</strong>, el mismo día. Repetible con distinto ángulo.' },
      { id: 'pitch', quien: 'agencia', lbl: 'Pitch', title: 'El pitch', detail: 'Qué hace, para quién y qué logra — en 60 segundos, sin leer y sin pedir perdón.' },
      { id: 'g_setting', quien: 'agencia', lbl: 'Guion de\nsetting', title: 'Guion de mensajes de setting', detail: 'Qué responde en el chat: cómo califica, cómo agenda y cómo se despide de quien no es.' },
      { id: 'g_llamada', quien: 'agencia', lbl: 'Guion de\nllamada', title: 'Guion de venta en la llamada', detail: 'Su estructura completa, con el momento del precio y las objeciones más comunes.' },
    ],
  },
  {
    id: 'edicion',
    title: '9 · Edición de piezas',
    short: 'EDICIÓN',
    items: [
      { id: 'p_vsl', quien: 'agencia', lbl: 'VSL\neditado', title: 'VSL editado', detail: 'Grabado, editado y <strong>subido a su página</strong>.', meta: 'P4.3b' },
      { id: 'p_preparacion', quien: 'agencia', lbl: 'Preparación\neditada', title: 'Preparación editada', detail: 'Editado y enganchado al calendario: lo ve quien agenda.' },
      { id: 'p_reels', quien: 'agencia', lbl: 'Reels\neditados', title: 'Reels de valor editados', detail: 'Con subtítulos y publicados en su perfil.', meta: 'P4.3c' },
      { id: 'p_anuncios', quien: 'agencia', lbl: 'Anuncios\neditados', title: 'Anuncios editados', detail: 'Las 3 piezas listas para subir a Meta. <strong>Deja acá el link a la carpeta.</strong>' },
      { id: 'p_carrusel', quien: 'agencia', lbl: 'Carrusel\neditado', title: 'Carrusel «Mi historia» editado', detail: 'Diseñado, con su portada y el CTA visible en la última placa.' },
      { id: 'p_destacadas', quien: 'agencia', lbl: 'Destacadas\neditadas', title: 'Historias destacadas editadas', detail: 'Subidas y ordenadas con sus portadas parejas.' },
      { id: 'p_estaticos', quien: 'agencia', lbl: 'Estáticos\ny placas', title: 'Carruseles estáticos y placas', detail: 'El banco de piezas de imagen para sostener el perfil entre videos.' },
    ],
  },
  {
    id: 'anuncios',
    title: '10 · Anuncios',
    short: 'ANUNCIOS',
    items: [
      { id: 'ads_chequeados', quien: 'agencia', lbl: 'Anuncios\nchequeados', title: 'Anuncios chequeados', detail: 'Revisados uno por uno contra las 7 reglas y las de aprobación de Meta antes de subirlos.' },
      { id: 'ads_links', quien: 'agencia', lbl: 'Links de\nanuncios', title: 'Links de cada anuncio elegido guardados', detail: 'El link de cada pieza que quedó corriendo. <strong>Se guardan acá, en esta celda.</strong>' },
    ],
  },
  {
    id: 'ventaherr',
    title: '11 · Herramientas de venta',
    short: 'HERR.',
    items: [
      { id: 'fathom', quien: 'cliente', lbl: 'Fathom\nconfigurado', title: 'Fathom configurado', detail: 'Grabando y transcribiendo sus llamadas — sin grabación no hay mejora posible.' },
    ],
  },
  {
    id: 'preactivacion',
    title: '12 · Pre-activación',
    short: 'PRE-ACT.',
    items: [
      { id: 'chequeo', quien: 'ambos', lbl: 'Chequeo\ngeneral', title: 'Chequeo general con el cliente', detail: 'Repaso de toda la estrategia <strong>probando en vivo</strong>: dominio, landing, automatizaciones, respuestas, calendario y pago.' },
      { id: 'reunion', quien: 'ambos', lbl: 'Reunión\npre-lanzam.', title: 'Reunión de pre-lanzamiento', detail: 'Cara a cara: qué va a pasar, qué tiene que hacer él y qué NO tiene que tocar.' },
      { id: 'roleplay', quien: 'cliente', lbl: 'Roleplay\nhecho', title: 'Roleplay con otro compañero', detail: 'Practicó la llamada completa con otro cliente del programa, incluidas las objeciones.' },
      { id: 'guiones_ok', quien: 'agencia', lbl: 'Guiones\nverificados', title: 'Guion de setting y de llamada verificados', detail: 'Leídos con él, ajustados a su voz y aprobados. No alcanza con enviárselos.' },
    ],
  },
  {
    id: 'lanzamiento',
    title: '13 · Lanzamiento',
    short: 'LANZAR',
    items: [
      { id: 'ads_on', quien: 'agencia', lbl: 'Anuncios\nactivados', title: 'Anuncios activados', detail: 'Corriendo en Meta, con la palabra funcionando de punta a punta.', meta: 'P4.4' },
      { id: 'testeo', quien: 'agencia', lbl: 'Campaña\nde testeo', title: 'Campaña de testeo corriendo', detail: 'Los 3 anuncios midiéndose entre sí, mismo presupuesto, 4-7 días. Gana el de menor costo por conversación que además agenda.' },
      { id: 'historias_3', quien: 'cliente', lbl: '3 historias\ndiarias', title: 'El cliente sube 3 historias diarias', detail: 'Sostiene la secuencia curiosidad → contexto → pedido todos los días. <strong>Es lo que calienta a los que ya lo siguen.</strong>' },
      { id: 'metricas', quien: 'cliente', lbl: 'Métricas\ncargadas', title: 'El cliente sube métricas', detail: 'Sus conversaciones cada día y el tablero del viernes. Si el costo por visita al perfil pasa <strong>$0,07</strong>, se apaga y se refresca el creativo.', meta: 'P4.7' },
    ],
  },
  {
    id: 'post',
    title: '14 · Post-lanzamiento',
    short: 'POST',
    items: [
      { id: 'llamada_1', quien: 'cliente', lbl: 'Primera\nllamada', title: 'Primera llamada', detail: 'Hizo su primera llamada de venta real. Ese día cambia todo.' },
      { id: 'pago_1', quien: 'cliente', lbl: 'Primer\npago 🏆', title: 'Primer pago', detail: 'Cobró su precio nuevo. <strong>El hito que valida el sistema entero.</strong>' },
      { id: 'caso', quien: 'ambos', lbl: 'Caso de\néxito', title: 'Caso de éxito', detail: 'Su historia con números: de dónde salió, qué hizo y adónde llegó.' },
      { id: 'testimonio', quien: 'ambos', lbl: 'Testimonios', title: 'Testimonios', detail: 'Pedidos y grabados — su prueba social y la nuestra.' },
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
