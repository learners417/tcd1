import { diaDelCodigo } from './roadmapSeed';

/**
 * tutorialesTecnicos.ts — Los pasos técnicos donde el sanador más se traba (Lote G · jul 2026)
 *
 * Cada tutorial es un paso a paso claro, SIN jerga, pensado para alguien que le teme
 * a la tecnología. El Mentor y los agentes los usan para guiar; también se muestran
 * en la sesión del Camino que corresponde.
 */

export interface TutorialTecnico {
  /** El día del Camino donde se muestra. El día no cambia cuando el Camino se reordena. */
  dia: number;
  /** El código con el que nació, para no perder el rastro. */
  codigo: string;
  titulo: string;
  intro: string;
  pasos: string[];
  siFalla: string;
}

export const TUTORIALES: Record<string, TutorialTecnico> = {

  // ─── Los que faltaban del Camino nuevo (24 sep) ───────────────────
  'perfil-y-pagina': {
    dia: 16,
    codigo: 'perfil-y-pagina',
    titulo: 'Tu perfil y tu página, publicados hoy',
    intro: 'Son las dos direcciones donde alguien te busca y decide. No tienen que quedar lindas: tienen que estar arriba y decir lo mismo.',
    pasos: [
      'En tu perfil, cambia estas cuatro cosas: a quién ayudas, con qué resultado, la prueba de que lo hiciste, y el enlace a tu página.',
      'Pon tu foto mirando a cámara, con luz de día y fondo liso.',
      'En tu página, escribe arriba de todo la misma frase que pusiste en tu perfil. Palabra por palabra.',
      'Debajo: para quién es, tu método con sus etapas, y el botón para agendar.',
      'Abre tu página en el teléfono, desde los datos y no desde tu wifi, y toca el botón. Si agenda, está publicada.',
    ],
    siFalla: 'Si el botón no lleva a tu agenda, el enlace quedó mal copiado: vuelve a copiarlo desde tu calendario y pégalo de nuevo.',
  },
  'agenda-y-cobro': {
    dia: 17,
    codigo: 'agenda-y-cobro',
    titulo: 'Tu agenda y tu cobro, andando solos',
    intro: 'Desde hoy alguien puede agendar y pagarte sin escribirte. Eso es lo que te devuelve las horas del teléfono.',
    pasos: [
      'En tu calendario, bloquea primero tus horas personales. Lo que queda libre es lo que se puede agendar.',
      'Crea el tipo de cita con su duración, y deja quince minutos entre una y otra.',
      'Activa el correo de confirmación y el recordatorio del día anterior.',
      'Crea tu link de pago con tu precio nuevo y pégalo en la confirmación.',
      'Pruébalo tú: agenda desde otro correo, paga un peso y mira que lleguen los dos avisos. Después cancela y devuélvete el peso.',
    ],
    siFalla: 'Si no llega el correo, revisa la carpeta de correo no deseado y que la dirección que enviaste sea la de tu dominio, no una personal.',
  },
  'pixel-y-cuenta': {
    dia: 29,
    codigo: 'pixel-y-cuenta',
    titulo: 'Meta conectado y tu pixel midiendo',
    intro: 'El pixel es el sensor que te dice quién entró y qué hizo. Sin él, la pauta es a ciegas y cara.',
    pasos: [
      'Entra al administrador de eventos de Meta y crea tu conjunto de datos con el nombre de tu negocio.',
      'Copia el código y pégalo en tu página, en el lugar de scripts del encabezado.',
      'Marca dos eventos: cuando alguien entra a tu página y cuando agenda.',
      'Carga tu tarjeta en la cuenta publicitaria y revisa que no haya avisos rojos.',
      'Abre tu página y mira en la herramienta de eventos en vivo: si aparecen tus dos eventos, está midiendo.',
    ],
    siFalla: 'Si el evento de agenda no dispara, es porque la agenda vive en otra dirección: marca el evento en la página de gracias.',
  },
  'encender-campanas': {
    dia: 31,
    codigo: 'encender-campanas',
    titulo: 'Encender tus dos campañas',
    intro: 'Dos campañas, no diez. Una para quien no te conoce y otra para quien ya te vio.',
    pasos: [
      'Campaña uno: objetivo agendas, público amplio de tu ciudad y tu rango de edad, tus tres anuncios adentro.',
      'Campaña dos: el mismo objetivo, público de quienes vieron tu video o entraron a tu página, con tu anuncio de venta.',
      'Reparte tu presupuesto mitad y mitad, y ponlo por día, no por total.',
      'Programa que arranquen mañana a primera hora, no esta noche.',
      'Antes de darle publicar, mira la vista previa de cada anuncio en el teléfono.',
    ],
    siFalla: 'Si te rechazan un anuncio, casi siempre es por prometer un resultado de salud: cámbialo por lo que la persona va a hacer, no por lo que va a curar.',
  },
  'app-con-tu-marca': {
    dia: 38,
    codigo: 'app-con-tu-marca',
    titulo: 'Tu app, con tu marca',
    intro: 'Es tu app, con tu nombre y tus colores, y con tus tres primeros consultantes adentro. No se arma desde cero: se clona y se viste.',
    pasos: [
      'Pide tu copia desde el panel: llega a tu nombre, con tu cuenta.',
      'Carga tu logo, tus dos colores y el nombre que van a ver tus consultantes.',
      'Escribe la pantalla de bienvenida: qué van a encontrar adentro y qué hacen el primer día.',
      'Carga las etapas de tu método, las mismas que escribiste el día 9.',
      'Entra desde tu teléfono como si fueras tu consultante y recorre la primera semana completa.',
    ],
    siFalla: 'Si algo no se ve como quieres, anótalo y sigue: el día 40 lo cambias tú mismo, pidiéndolo en castellano.',
  },
  'P2.2': {
    dia: 29,
    codigo: 'P2.2',
    titulo: 'Crear tu cuenta de Meta (Business Manager)',
    intro: 'Es la cuenta central desde donde vas a manejar tus anuncios. Suena técnico, pero son 10 minutos y lo haces una sola vez.',
    pasos: [
      'Entra a business.facebook.com y toca "Crear cuenta".',
      'Pon el nombre de tu negocio, tu nombre y tu email de trabajo.',
      'Revisa tu email y confirma (Meta te manda un enlace).',
      'Dentro, ve a "Configuración del negocio" → "Cuentas" → "Cuentas publicitarias" → "Agregar" → "Crear una nueva".',
      'Elige tu país, tu moneda y la zona horaria correctas — esto no se puede cambiar después.',
      'Listo: ya tienes tu central de anuncios. La vas a usar cuando montes la campaña.',
    ],
    siFalla: 'Si te pide verificar tu negocio con documentos, puedes saltarlo por ahora — no lo necesitas para empezar. Si algo no carga, prueba desde una computadora (no el celular) — Meta funciona mejor así.',
  },
  'P4.5-pixel': {
    dia: 29,
    codigo: 'P4.5',
    titulo: 'Instalar el Pixel de Meta (el sensor de tu página)',
    intro: 'El Pixel es un código invisible que le avisa a Meta quién visita tu página. Sin él, tus anuncios vuelan a ciegas. Es copiar y pegar.',
    pasos: [
      'En tu Business Manager, ve a "Administrador de eventos" → "Conectar orígenes de datos" → "Web" → "Pixel de Meta".',
      'Ponle un nombre (tu negocio) y toca "Crear".',
      'Meta te da un código. Copialo entero.',
      'Pegalo en la configuración de tu página (el tutorial de tu plataforma te muestra dónde — suele ser "Código de encabezado" o "Header").',
      'Vuelve a Meta y toca "Verificar" — o instala la extensión "Meta Pixel Helper" en Chrome, entra a tu página, y si el ícono se pone azul, funciona.',
    ],
    siFalla: 'Si el Pixel no verifica al toque, espera unas horas — a veces tarda. Si tu plataforma no tiene dónde pegar el código, avisá por Mensajes: hay una forma alternativa con "Google Tag Manager" que te guiamos.',
  },
  'P4.5-dm': {
    dia: 31,
    codigo: 'P4.5',
    titulo: 'Tu DM automático (el que responde por ti)',
    intro: 'Cuando alguien comenta tu PALABRA, este flujo le manda el link de tu página y le hace una pregunta. Es la pieza que convierte comentarios en conversaciones — y trabaja mientras duermes.',
    pasos: [
      'Entra a tu subcuenta de GoHighLevel → Automatización → Workflows → + Crear workflow',
      'Disparador: «Instagram Comment» (comentario en Instagram). Elige tu cuenta y déjalo para TODOS tus anuncios',
      'Condición: que el comentario CONTENGA tu PALABRA exacta (la misma de tus anuncios, en mayúsculas)',
      'Acción 1: «Send Instagram DM» y pega tu mensaje: «¡Buenísimo! Acá tienes todo lo de [TU PROGRAMA] 👉 [LINK DE TU PÁGINA]. Míralo tranquilo y cuéntame: [TU PREGUNTA]»',
      'Acción 2: Espera de 24 horas → segundo DM solo si NO respondió: «¿Pudiste verlo? ¿Qué te quedó dando vueltas?»',
      'Publica el workflow y PRUÉBALO: comenta tu palabra desde otra cuenta y espera el DM. Si no llega, revisa que la cuenta de Instagram esté conectada en Settings → Integrations',
    ],
    siFalla: 'Si el DM no llega: revisa que tu Instagram sea cuenta profesional y esté conectada en Settings → Integrations, que el workflow esté PUBLICADO (no en borrador), y que la palabra del comentario coincida exacto. Prueba siempre desde otra cuenta, nunca desde la tuya.',
  },
  'P4.5b': {
    dia: 16,
    codigo: 'P4.5b',
    titulo: 'Conectar tu dominio (tu dirección digital)',
    intro: 'Tu dominio es tu dirección propia en internet, como "tunombre.com". Le da seriedad a todo. Es técnico pero te llevo de la mano.',
    pasos: [
      '¿Ya tienes un dominio? Si no, comprá uno simple en Namecheap o Google Domains: tu nombre + ".com", cuesta ~$12 al año.',
      'En tu sistema, ve a "Configuración" → "Dominios" → "Agregar dominio".',
      'El sistema te muestra dos datos llamados "registros DNS" (son como coordenadas). Cópialos.',
      'Entra a donde compraste el dominio → "Administrar DNS" → pega esos dos registros.',
      'Guarda y vuelve a tu sistema. Toca "Verificar".',
      'Si dice "pendiente", es normal: la conexión puede tardar hasta 24 horas. No rompiste nada — se sigue mañana.',
    ],
    siFalla: 'Lo más común es que tarde en activarse — eso es esperar, no arreglar. Si a las 24 horas sigue sin conectar, revisa que copiaste los registros SIN espacios de más. Sofi te ayuda con esto.',
  },
  'P4.4': {
    dia: 31,
    codigo: 'P4.4',
    titulo: 'Escalar tu campaña ganadora (sin quemar plata)',
    intro: 'Ya sabes cuál de tus anuncios funciona. Escalar es ponerle más presupuesto al ganador, con cabeza — no de golpe.',
    pasos: [
      'Identificá tu anuncio ganador: el que trae agendas calificadas más baratas (Ramiro te ayuda a leer el número).',
      'Pausá los que no funcionan — no tiene sentido gastar en ellos.',
      'Al ganador, subile el presupuesto de a poco: 20% cada 2-3 días, no el doble de golpe (eso confunde al algoritmo).',
      'Mira que el costo por agenda calificada se mantenga estable mientras subes. Si se dispara, frená y espera.',
      'Cuando encuentres tu techo (donde el costo empieza a subir), quédate ahí. Ese es tu ritmo sostenible.',
    ],
    siFalla: 'Si al subir el presupuesto los resultados empeoran, bajá al nivel anterior y espera 3 días. Escalar es paciencia, no apuro. Ramiro te lee los números si tienes dudas.',
  },
};

/**
 * Devuelve el tutorial por su CLAVE exacta, o null.
 *
 * Usar esta y no getTutoriales cuando se quiere uno solo: hay dos entradas
 * con el mismo `codigo` ('P4.5-pixel' y 'P4.5-dm'), así que buscar por código
 * devuelve las dos — y a un cliente que sigue el tutorial equivocado se le
 * va una tarde.
 */
export function getTutorial(codigo: string): TutorialTecnico | null {
  const directo = TUTORIALES[codigo];
  if (directo) return directo;
  const d = diaDelCodigo(codigo);
  return d === null ? null : (Object.values(TUTORIALES).find((t) => t.dia === d) ?? null);
}

/** Devuelve TODOS los tutoriales de un paso (P4.5 tiene pixel Y agente). */
export function getTutoriales(codigo: string): TutorialTecnico[] {
  const d = diaDelCodigo(codigo);
  return Object.values(TUTORIALES).filter((t) => t.codigo === codigo || (d !== null && t.dia === d));
}
