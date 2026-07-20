/**
 * tutorialesTecnicos.ts — Los pasos técnicos donde el sanador más se traba (Lote G · jul 2026)
 *
 * Cada tutorial es un paso a paso claro, SIN jerga, pensado para alguien que le teme
 * a la tecnología. El Mentor y los agentes los usan para guiar; también se muestran
 * en la sesión del Camino que corresponde.
 */

export interface TutorialTecnico {
  codigo: string;
  titulo: string;
  intro: string;
  pasos: string[];
  siFalla: string;
}

export const TUTORIALES: Record<string, TutorialTecnico> = {
  'P2.2': {
    codigo: 'P2.2',
    titulo: 'Crear tu cuenta de Meta (Business Manager)',
    intro: 'Es la cuenta central desde donde vas a manejar tus anuncios. Suena técnico, pero son 10 minutos y lo haces una sola vez.',
    pasos: [
      'Entrá a business.facebook.com y tocá "Crear cuenta".',
      'Pon el nombre de tu negocio, tu nombre y tu email de trabajo.',
      'Revisá tu email y confirmá (Meta te manda un enlace).',
      'Dentro, ve a "Configuración del negocio" → "Cuentas" → "Cuentas publicitarias" → "Agregar" → "Crear una nueva".',
      'Elige tu país, tu moneda y la zona horaria correctas — esto no se puede cambiar después.',
      'Listo: ya tienes tu central de anuncios. La vas a usar cuando montes la campaña.',
    ],
    siFalla: 'Si te pide verificar tu negocio con documentos, puedes saltarlo por ahora — no lo necesitás para empezar. Si algo no carga, probá desde una computadora (no el celular) — Meta funciona mejor así.',
  },
  'P4.5-pixel': {
    codigo: 'P4.5',
    titulo: 'Instalar el Pixel de Meta (el sensor de tu página)',
    intro: 'El Pixel es un código invisible que le avisa a Meta quién visita tu página. Sin él, tus anuncios vuelan a ciegas. Es copiar y pegar.',
    pasos: [
      'En tu Business Manager, ve a "Administrador de eventos" → "Conectar orígenes de datos" → "Web" → "Pixel de Meta".',
      'Ponele un nombre (tu negocio) y tocá "Crear".',
      'Meta te da un código. Copialo entero.',
      'Pegalo en la configuración de tu página (el tutorial de tu plataforma te muestra dónde — suele ser "Código de encabezado" o "Header").',
      'Vuelve a Meta y tocá "Verificar" — o instalá la extensión "Meta Pixel Helper" en Chrome, entrá a tu página, y si el ícono se pone azul, funciona.',
    ],
    siFalla: 'Si el Pixel no verifica al toque, esperá unas horas — a veces tarda. Si tu plataforma no tiene dónde pegar el código, avisá por Mensajes: hay una forma alternativa con "Google Tag Manager" que te guiamos.',
  },
  'P4.5-agente': {
    codigo: 'P4.5',
    titulo: 'Tu agente de WhatsApp (el que responde por vos)',
    intro: 'Es un asistente que contesta a los interesados a cualquier hora, hace las preguntas clave y agenda — aunque estés durmiendo o atendiendo.',
    pasos: [
      'En tu sistema (Mi Clínica / GHL), ve a la sección de conversaciones o automatizaciones.',
      'Activá la plantilla del agente que ya viene cargada para tu tipo de práctica.',
      'Personalizá el saludo con tu nombre y el de tu método.',
      'Definí las 3 preguntas clave que quieres que haga (profesión del interesado, su problema principal, su urgencia).',
      'Conectá el botón "Agendar" a tu calendario.',
      'Probalo vos: escribile como si fueras un paciente y mira que responda bien.',
    ],
    siFalla: 'Si el agente responde raro, revisá el saludo y las preguntas — suelen ser el 90% del problema. Bruno (tu entrenador de WhatsApp) te ayuda a afinarlo.',
  },
  'P4.5b': {
    codigo: 'P4.5b',
    titulo: 'Conectar tu dominio (tu dirección digital)',
    intro: 'Tu dominio es tu dirección propia en internet, como "tunombre.com". Le da seriedad a todo. Es técnico pero te llevo de la mano.',
    pasos: [
      '¿Ya tienes un dominio? Si no, comprá uno simple en Namecheap o Google Domains: tu nombre + ".com", cuesta ~$12 al año.',
      'En tu sistema, ve a "Configuración" → "Dominios" → "Agregar dominio".',
      'El sistema te muestra dos datos llamados "registros DNS" (son como coordenadas). Copialos.',
      'Entrá a donde compraste el dominio → "Administrar DNS" → pega eeres dos registros.',
      'Guardá y vuelve a tu sistema. Tocá "Verificar".',
      'Si dice "pendiente", es normal: la conexión puede tardar hasta 24 horas. No rompiste nada — se sigue mañana.',
    ],
    siFalla: 'Lo más común es que tarde en activarse — eso es esperar, no arreglar. Si a las 24 horas sigue sin conectar, revisá que copiaste los registros SIN espacios de más. Sofi te ayuda con esto.',
  },
  'P4.4': {
    codigo: 'P4.4',
    titulo: 'Escalar tu campaña ganadora (sin quemar plata)',
    intro: 'Ya sabes cuál de tus anuncios funciona. Escalar es ponerle más presupuesto al ganador, con cabeza — no de golpe.',
    pasos: [
      'Identificá tu anuncio ganador: el que trae mensajes más baratos (Ramiro te ayuda a leer el número).',
      'Pausá los que no funcionan — no tiene sentido gastar en ellos.',
      'Al ganador, subile el presupuesto de a poco: 20% cada 2-3 días, no el doble de golpe (eso confunde al algoritmo).',
      'Mira que el costo por mensaje se mantenga estable mientras subís. Si se dispara, frená y esperá.',
      'Cuando encuentres tu techo (donde el costo empieza a subir), quedate ahí. Ese es tu ritmo sostenible.',
    ],
    siFalla: 'Si al subir el presupuesto los resultados empeoran, bajá al nivel anterior y esperá 3 días. Escalar es paciencia, no apuro. Ramiro te lee los números si tienes dudas.',
  },
};

/** Devuelve el tutorial de un paso, o null. */
export function getTutorial(codigo: string): TutorialTecnico | null {
  return TUTORIALES[codigo] ?? null;
}

/** Devuelve TODOS los tutoriales de un paso (P4.5 tiene pixel Y agente). */
export function getTutoriales(codigo: string): TutorialTecnico[] {
  return Object.values(TUTORIALES).filter((t) => t.codigo === codigo);
}
