import type { MetaCodigo, PilarId, TipoTarea } from './supabase';

// ═════════════════════════════════════════════════════════════════════════════
// SEED ROADMAP v3 — 4 FASES · Método CLINICA · Cinturones-planta · Plan 0-90
// 34 tareas · checklists de autonomía · día asignado por tarea · Meta Business
// Agent como filtro · validación pagada · Mentor Javo en umbrales · modo Coach
// para videos. Incorpora las 22 decisiones confirmadas (jul 2026).
// ═════════════════════════════════════════════════════════════════════════════

// ─── Tipos base (contrato intacto — NO cambiar firmas existentes) ────────────

export type TipoDesbloqueo =
  | 'auto'
  | 'completar_anterior'
  | 'venta_real'
  | 'qa_verde';

export interface RoadmapMeta {
  codigo: MetaCodigo;
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  es_estrella: boolean;
  tiempo_estimado: string;
  orden: number;
  herramienta_id?: string;
  usa_ia: boolean;
  adn_field?: string;
  requiere_datos_de?: MetaCodigo[];
  es_recurrente?: boolean;
  video_youtube_id?: string;
  coach_instruccion?: string;
  /** Sub-pasos internos (checklist de autonomía). */
  checklist?: string[];
  /** Entrenador recomendado (sofi, mateo, caro, bruno, lucas, vera, diego) */
  entrenador?: string;
  /** Día nominal del programa (1-90) en que corresponde esta tarea. */
  dia_asignado?: number;
  /** Evidencia obligatoria para completar (el gate vive en la UI). */
  evidencia_requerida?: { tipo: 'foto' | 'audio' | 'video' | 'screenshot' | 'comprobante'; descripcion: string };
}

export interface RoadmapPilar {
  id: PilarId;
  numero_orden: number;
  titulo: string;
  subtitulo: string;
  color: string;
  desbloqueo: TipoDesbloqueo;
  pilar_prerequisito?: PilarId;
  metas: RoadmapMeta[];
  fase: number;
  dias_inicio: number;
  dias_fin: number;
  metodo_letra?: string;
  hito_mensaje?: string;
  hito_tipo?: 'milestone' | 'urgent' | 'checkpoint';
  icon: string;
  numero: number;
  emoji?: string;
  estrellas_requeridas?: number;
  es_hito?: boolean;
  /** Cinturón que otorga completar este pilar (sistema planta/taekwondo) */
  cinturon_otorga?: string;
  /** La pregunta mayéutica del Mentor Javo al cruzar este umbral. */
  mentor_pregunta?: string;
}

// ─── Los 8 Pilares — 4 Fases · Método CLINICA ───────────────────────────────

export const SEED_ROADMAP_V8: RoadmapPilar[] = [

  // ═══ FASE 0 · ONBOARDING ═══
  {
    id: 'P0',
    numero_orden: 0,
    titulo: 'Onboarding',
    subtitulo: 'Tu punto de partida real',
    color: '#9CA3AF',
    numero: 0,
    icon: 'Compass',
    emoji: '🧭',
    desbloqueo: 'auto',
    fase: 0,
    dias_inicio: 1,
    dias_fin: 1,
    cinturon_otorga: 'blanco',
    hito_mensaje: '🥋 Cinturón BLANCO — la semilla está plantada. Tu camino de 90 días empezó.',
    hito_tipo: 'milestone',
    mentor_pregunta: '¿Qué versión de ti se termina hoy?',
    metas: [
      {
        codigo: 'P0.0',
        titulo: 'Bienvenida: de profesional a director',
        descripcion: 'Mira el video de Javo (5 min): qué vas a lograr en 90 días, cómo funciona tu app, las 4 fases y los cinturones. De regalo de bienvenida recibís el libro "Sanadores Libres" (PDF) — la filosofía completa detrás de tu camino. Si el video todavía no está disponible, tu Mentor te lo cuenta en 5 minutos.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '5 min',
        orden: 1,
        dia_asignado: 1,
        usa_ia: false,
        video_youtube_id: 'v154pbAd3Hw',
        coach_instruccion: 'MODO VIDEO-FALLBACK: si el video no está disponible, contale en 5 min: (1) la promesa — 10 pacientes de tu precio digno en 90 días y el SISTEMA para repetirlo; (2) las 4 fases — Sanar el Dinero, Tu Protocolo, Captación y Ventas, Servicio y Escala; (3) los cinturones — se ganan por hitos REALES verificados, como una planta que crece de semilla a árbol; (4) la regla — una tarea por día, 45-60 min; (5) el requisito — presupuesto de publicidad de ~$400-700 en los 90 días, que se autofinancia desde tu primera venta. Entregale el libro Sanadores Libres.',
      },
      {
        codigo: 'P0.2',
        titulo: 'Tu Foto de Partida',
        descripcion: 'Antes de empezar necesitamos una imagen clara de tu punto de partida: cuánto facturas hoy, cuántas horas trabajas y cuál es tu precio por hora real. En el día 45 la comparamos con tu nueva realidad. Y tres preguntas para conocerte: ¿podrías contar tu historia en 30 segundos? ¿Conoces tu propósito? Si hoy dejaras este mundo, ¿sabrías cuál es tu legado?',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '1 h (sesión completa del Día 1)',
        orden: 2,
        dia_asignado: 1,
        herramienta_id: 'H-P0.2',
        usa_ia: true,
        adn_field: 'adn_autoevaluacion_dia1',
      },
      {
        codigo: 'P0.3',
        titulo: 'El Búnker de Luz',
        descripcion: 'Antes de abrir cualquier cuarto oscuro, se construye el antídoto. Hoy armas tu Búnker de Luz: una caja chiquita, física, con muy pocos objetos de carga pura — una foto que te devuelve a quién eres, una carta, una piedrita que significa mucho, un video corto que te grabas ahora mismo. No es decoración: es tu tanque de oxígeno. Esta semana vas a subir una montaña, y habrá una tarde o una madrugada en la que todo se ponga oscuro. Ese día abres la caja, lloras lo que haya que llorar, te sacudes el polvo y sigues. La guardas donde nadie la encuentre. Es tuya, íntima como nada.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '25 min',
        orden: 3,
        dia_asignado: 1,
        usa_ia: true,
        evidencia_requerida: { tipo: 'foto', descripcion: 'La foto de tu Búnker de Luz ya construido (la caja, no el contenido — el contenido es solo tuyo).' },
        coach_instruccion: 'EL BÚNKER DE LUZ — el antídoto antes de la montaña. Guía: (1) explicale el porqué con la metáfora del tanque de oxígeno: esta semana se abre el cuarto del dinero y va a doler; el búnker es lo que lo devuelve a su esencia cuando todo se oscurezca. (2) Ayudalo a elegir 3-5 objetos de CARGA PURA: momentos de luz real de su historia (una foto, una carta, un objeto chiquito con mucha historia, un video que se grabe ahora diciéndose por qué empezó esto). NO objetos genéricos: cada uno tiene que devolverle un recuerdo exacto. (3) Que la arme FÍSICAMENTE hoy — caja chiquita, escondida, ultra personal, ni la pareja la conoce. (4) Cerrá: "cuando llegue la noche oscura — y va a llegar — primero el búnker, después seguimos". Evidencia: foto de la caja cerrada.',
      },
      {
        codigo: 'P0.4',
        titulo: 'Cómo usar tu app + el pacto',
        descripcion: 'La sesión más corta y la más importante. Hoy recibes DOS llaves: EL CAMINO (esta app — donde te construyes, 90 días) y MI CLÍNICA (tu app de operación — donde tus pacientes de HOY se ordenan desde ya). Tu app en 5 minutos — y después, EL PACTO. No es un formulario: es una promesa. A los tuyos: a los que te formaron y a los que dependen de ti. A tus pacientes: a los que ya ayudaste y a los diez que todavía no te encontraron. Y a ti: al profesional que decidió dejar de sobrevivir. Vas a escribirlo con tus palabras, con fecha, y vas a firmarlo. En el dojo, la palabra empeñada es el primer cinturón.',
        tipo: 'VIDEO',
        es_estrella: true,
        tiempo_estimado: '5 min',
        orden: 4,
        dia_asignado: 1,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P0_4',
        coach_instruccion: 'MODO VIDEO-FALLBACK: explicá la app en 5 min — El Camino muestra UNA tarea por día; los Entrenadores se desbloquean con cada cinturón; los hitos grandes piden comprobante real (screenshot/pago). Las reglas del reloj: 90 días reales, 1 pausa de hasta 14 días con motivo, extensión de $200/30 días después del día 90. Cerrá con el pacto: 1 hora por día. Pedile que lo escriba con sus palabras.',
      },
    ],
  },

  // ═══ FASE 1 · SANAR EL DINERO ═══
  {
    id: 'P1',
    numero_orden: 1,
    titulo: 'Sanar el Dinero',
    subtitulo: 'El protocolo de 7 días que destraba tu precio',
    color: '#E8962E',
    numero: 1,
    icon: 'HeartHandshake',
    emoji: '💛',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P0',
    fase: 1,
    dias_inicio: 2,
    dias_fin: 9,
    metodo_letra: 'C·L',
    cinturon_otorga: 'amarillo',
    hito_mensaje: '🥋 Cinturón AMARILLO — la raíz está en la tierra. Sanaste tu relación con el dinero y tienes TU número.',
    hito_tipo: 'milestone',
    mentor_pregunta: 'Si tu hijo hiciera tu trabajo, ¿le dejarías cobrar lo que tú cobrabas?',
    metas: [
      {
        codigo: 'P1.1',
        titulo: 'Por qué el dinero se sana primero',
        descripcion: 'Mira el video de Javo (6 min): ningún sistema de ventas funciona sobre una relación rota con el dinero. La historia del mártir que cobra poco "por vocación" — y por qué ese ya no vas a ser tú. Si el video no está aún, tu Mentor te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '6 min',
        orden: 1,
        dia_asignado: 2,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P1_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: contá la tesis en 5 min — el mártir del libro Sanadores Libres: el profesional brillante que cobra poco "por vocación" y termina fundido, sin tiempo y resentido. La ciencia: los money scripts (Klontz) se heredan y operan solos; el cuerpo los guarda (van der Kolk). Por eso esta semana trabajamos el dinero ANTES que el marketing: un sistema perfecto sobre una creencia rota produce autosabotaje. Los próximos días: radiografía, lealtad, LA QUEMA (la ceremonia completa), EL NÚMERO con Óptica y Código — y para el que sigue: el cuerpo y la creencia nueva.',
      },
      {
        codigo: 'P1.2',
        titulo: 'Tu radiografía emocional',
        descripcion: 'Abre el chat con tu Mentor y haz el primer trabajo: di tu precio actual en voz alta, registra qué sentís, y rastrea de dónde viene esa incomodidad. Vas a salir con TU creencia raíz identificada en una frase — y una imagen generada por IA de esa "voz heredada", para verla afuera tuyo por primera vez.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '1 h',
        orden: 2,
        dia_asignado: 2,
        usa_ia: false,
        checklist: [
          'Abre el chat con el Mentor y dile: "vengo a hacer la radiografía del dinero"',
          'Di tu precio actual en voz alta y cuéntale qué sentiste',
          'Completa las 4 frases: "El dinero es…", "La gente rica es…", "Cobrar caro a un paciente es…", "Si gano mucho, mi familia…"',
          'Cierra con tu creencia raíz escrita en UNA frase',
        ],
        coach_instruccion: 'Guiá la radiografía del dinero con los money scripts de Klontz (nombrá la ciencia: esto es psicología financiera, no autoayuda). Pedile que diga su precio actual en voz alta y describa qué siente en el cuerpo. Aplicá el test de las 4 frases (el dinero es… / la gente rica es… / cobrar caro es… / si gano mucho, mi familia…). Sus respuestas SON sus scripts: devuelveselos nombrados. Cerrá identificando LA creencia raíz en una frase textual. Ofrecé generar la imagen de esa "voz heredada" con la herramienta de imágenes.',
      },
      {
        codigo: 'P1.2b',
        titulo: 'La lealtad invisible y tu linaje',
        descripcion: 'Con tu Mentor: si prosperás de verdad, ¿a quién sentís que traicionás? El ejercicio del linaje — 3 generaciones y su relación con el dinero. La lealtad invisible a la familia, al gremio, al "sanador pobre pero noble". Verla es el 80% de soltarla. Salís con tu frase ancla: "Honro tu historia Y elijo distinto."',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '1 h',
        orden: 3,
        dia_asignado: 3,
        usa_ia: false,
        checklist: [
          'Escribe los nombres de 3 generaciones de tu familia',
          'Al lado de cada uno: su relación con el dinero en una frase',
          'Encuentra el patrón con el Mentor: ¿a quién le eres fiel siendo pobre?',
          'Escribe tu frase ancla: "Honro tu historia Y elijo distinto"',
        ],
        coach_instruccion: 'Explorá la lealtad invisible con el ejercicio del linaje (presentalo como marco simbólico de las lealtades familiares — no como ciencia; su poder es de sentido, y eso se dice honesto). 3 generaciones, la relación de cada una con el dinero. El patrón salta solo. Preguntá: ¿esa fidelidad es amor, o miedo disfrazado de amor? ¿Esa persona querría que vivas ajustado? Cerrá con la frase ancla escrita: "Honro tu historia Y elijo distinto" — se guarda y vuelve en los momentos de resistencia.',
      },
      {
        codigo: 'P1.3',
        titulo: 'LA QUEMA',
        descripcion: 'La sesión más profunda de tu semana — la ceremonia completa, en tres actos. ACTO 1 — LAS DOS CARTAS: primero escribes el inventario de tu valor (todo lo que estudiaste, viviste y aprendiste — los errores también capitalizan), y después la carta al dinero: pones un billete físico enfrente — si es de 100, mejor — y le escribes como a una persona: cómo lo trataste, qué esperas de él, qué te dijeron de él tu papá, tu mamá, tus abuelos. ACTO 2 — LA QUEMA: juntas lo viejo — las creencias heredadas, las frases que no son tuyas, cartas viejas si las hay — y lo quemas de verdad, en una fuente, mirando el fuego hasta que se va. Lo que se quema se explica: a tu mente, a tu historia, esto se termina hoy. ACTO 3 — EL CIERRE: lo que se abre, se cierra. Escribes 10 gratitudes — por lo que descubriste, por los que te dieron incluso las creencias que hoy soltaste. Si la fe es parte de tu camino, este acto es oración. Tu Búnker de Luz queda a mano por si lo necesitas.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '2 h',
        orden: 4,
        dia_asignado: 4,
        evidencia_requerida: { tipo: 'foto', descripcion: 'La foto de las cenizas o del papel quemándose. Es tu testigo: sin ella, la quema no cuenta.' },
        usa_ia: false,
        checklist: [
          'Escribe tu creencia raíz en un papel, a mano',
          'Léela en voz alta una última vez',
          'Quémala (con cuidado y en lugar seguro)',
          'Saca foto de las cenizas y súbela — queda en tu historia',
          'Cuéntale al Mentor qué sentiste al verla arder',
        ],
        // CAPA 3: completar esta tarea otorga 'blanco_punta_amarilla' vía hitos_cinturon
        coach_instruccion: 'LA CEREMONIA COMPLETA en 3 actos — guiá uno por uno, sin apurar. ACTO 1 · LAS DOS CARTAS: (a) inventario del valor — que liste TODO lo adquirido: formaciones, años, casos, errores (los errores capitalizan: lo que aprendió de lo que salió mal ES su capital hoy). Que lo vea junto: eso es lo que vende, no su tiempo. (b) Carta al dinero — billete físico enfrente (de 100 si tiene): que narre la relación completa (cómo lo trató, qué le dijeron papá/mamá/abuelos, qué espera ahora). Acá aparece la creencia madre: nombrala con sus palabras. ACTO 2 · LA QUEMA física: papel + fuego real en una fuente, mirando cómo se va. Que le explique a su mente qué se está yendo (la versión vieja, el mandato heredado). Foto de las cenizas = la evidencia. ACTO 3 · EL CIERRE de gratitud: lo que se abre se cierra — 10 gratitudes escritas, incluidas las difíciles (gracias papá por enseñarme esto, que hoy me permitió darme cuenta). Si su idioma espiritual está activado: este acto es oración y plegaria, nombralo así. Si está en modo neutro: gratitud como práctica de cierre. AVISO: es sesión de 2 horas — puede partirla en dos bloques (cartas hoy, quema y cierre mañana temprano); la app guarda todo. Si aparece llanto: vaso de agua, pausa, y se sigue — se llora, se libera, y se sigue.',
      },
      {
        codigo: 'P1.4',
        titulo: 'El dinero en el cuerpo',
        descripcion: 'Trabajo somático breve con tu Mentor: escaneo corporal guiado, encuentra dónde se aloja la tensión cuando piensas en cobrar, y soltala con respiración 4-7-8. Registrás tu nivel de tensión antes y después (1-10). Para que el precio nuevo no sea solo mental.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '45 min',
        orden: 5,
        dia_asignado: 8,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P1_4_AUDIO',
        coach_instruccion: 'MODO AUDIO-FALLBACK: si el audio no está disponible, guiá el trabajo somático (nombrá la ciencia: van der Kolk, el cuerpo lleva la cuenta). Escaneo corporal guiado paso a paso: ojos cerrados, imagina cobrando su precio nuevo a un paciente real, registra dónde aparece tensión (1-10). Respiración 4-7-8 (práctica yóguica, declarada como práctica) tres veces sobre esa zona. Repetir la escena. Registrar el después (1-10). Preguntá: ¿qué cambió?',
      },
      {
        codigo: 'P1.5',
        titulo: 'EL NÚMERO — tu precio digno',
        descripcion: 'El momento central de la fase. La calculadora inversa te muestra: $10.000 ÷ 10 pacientes = $1.000 — el número no sale de tu miedo, sale de tu meta. Con tu Mentor lo haces TUYO: un número concreto, dicho en voz alta 3 veces sin disculparte (la tercera, grabandote un audio a ti mismo). El Mentor no aprueba precios-disculpa. Y al final, el cambio de idioma: ÓPTICA Y CÓDIGO. Todo es número — tu sesión, tu resultado, el dolor de tu paciente y lo que pierde cada día que no te encuentra. Vas a cuantificar el costo de la inacción (qué hubiera pasado si no hacías este trabajo — en número) y te llevas la tarea del fin de semana: el ejercicio del Mall.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '1.5 h',
        orden: 6,
        dia_asignado: 5,
        evidencia_requerida: { tipo: 'audio', descripcion: 'Un audio de 30 segundos diciendo tu precio nuevo, con voz firme. Escúchate: esa es tu voz de director.' },
        usa_ia: false,
        checklist: [
          'Trae tu PHR de la Foto de Partida',
          'Haz la calculadora inversa con el Mentor: de la meta al número',
          'Propón TU número (concreto, no un rango)',
          'Dilo en voz alta 3 veces — la tercera, grábate un audio de WhatsApp a ti mismo',
        ],
        coach_instruccion: 'EL NÚMERO + ÓPTICA Y CÓDIGO. Parte 1 — el precio digno: guialo a su número (el que se dice en voz alta, grabado — la evidencia de hoy). Parte 2 — el cambio de idioma: mostrale que vive en un mundo de palabras y el juego se juega en números. \'¿Por qué te compran?\' se responde con números, no con poesía: cuánto le duele HOY a su paciente, cuánto pierde por día, cuánto vale el antes-y-después que él produce. Que cuantifique el COSTO DE LA INACCIÓN: si no hacía este trabajo de la semana, ¿cuánto perdía en 90 días? Número concreto, anotado — entra en la consolidación de la sesión. Parte 3 — LA TAREA DEL FINDE (el ejercicio del Mall): este fin de semana va a un shopping o centro comercial y pregunta el precio de 5 cosas que valgan cerca de su nuevo precio (un teléfono, una cartera, un curso) SIN comprar nada. Solo preguntar, escuchar el número, y observarse. El lunes lo conversa contigo: qué sintió, qué descubrió. Es exposición pura al idioma del número — su clienta compra el iPhone de 1.500 sin culpa; que él escuche esos números con sus propios oídos.',
      },
      {
        codigo: 'P1.6',
        titulo: 'Tu creencia nueva y el Estandarte',
        descripcion: 'Cerrás el protocolo instalando la creencia elegida por ti: tu nueva frase sobre el dinero, en presente y con tus palabras. La IA te genera tu ESTANDARTE — una imagen-símbolo con tu frase, que se vuelve la pantalla de tu cinturón. Al completarla: Cinturón AMARILLO — la raíz está en la tierra. Y aparece por primera vez el Mentor. Y junto al Estandarte, construyes EL EXPEDIENTE: un documento con tu nombre y 10 resultados reales que ya produjiste — pacientes que mejoraron, procesos que funcionaron, agradecimientos recibidos. No es para mostrar: es tu prueba interna. El día que la voz del impostor pregunte \'¿quién eres tú para cobrar esto?\', el Expediente responde con hechos.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '1 h',
        orden: 7,
        dia_asignado: 9,
        usa_ia: false,
        coach_instruccion: 'Cierre del protocolo: que formule su creencia nueva en una frase propia, en presente y primera persona. Que la escriba. Generale el ESTANDARTE con la herramienta de imágenes: una imagen-símbolo con su frase (estética: fondo oscuro, dorado, sobrio). Recordale: cada vez que dude del precio, vuelve a esta frase y esta imagen. Celebrá el Cinturón Amarillo: la raíz está en la tierra. Anunciá que el Mentor lo espera con una pregunta. EL EXPEDIENTE anti-impostor: después del Estandarte, guialo a compilar 10 RESULTADOS REALES de su historia profesional (nombre del caso o iniciales, qué llegó, qué se llevó — concreto). Los casos chicos también cuentan: una persona que durmió mejor ES un resultado. Que lo escriba como documento con su nombre arriba: \'Expediente de [nombre] — la evidencia\'. Regla de uso: cada vez que aparezca el \'quién soy yo para cobrar esto\', se abre el Expediente ANTES de negociar con esa voz. El impostor discute con opiniones; el Expediente responde con hechos.',
      },
    ],
  },

  // ═══ FASE 2 · TU PROTOCOLO ═══
  {
    id: 'P2',
    numero_orden: 2,
    titulo: 'Tu Método con Nombre',
    subtitulo: 'De servicios sueltos a un protocolo propio',
    color: '#84CC16',
    numero: 2,
    icon: 'Cog',
    emoji: '⚙️',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P1',
    fase: 2,
    dias_inicio: 10,
    dias_fin: 12,
    metodo_letra: 'I',
    cinturon_otorga: 'amarillo_punta_verde',
    hito_mensaje: '🥋 Amarillo punta VERDE — el primer brote asoma. Tu método ya tiene nombre y estructura.',
    hito_tipo: 'checkpoint',
    mentor_pregunta: '¿Tu método existía antes de que lo nombraras — o recién ahora que tiene nombre te animás a verlo?',
    metas: [
      {
        codigo: 'P2.1',
        titulo: 'Tu método propio: el activo que te diferencia',
        descripcion: 'Mira el video (6 min): por qué un método con nombre vale más que mil servicios sueltos, y cómo se poda: UNA transformación, UN protocolo, UN precio. Aplica igual si atiendes pacientes o formas estudiantes. Si el video no está, tu Mentor te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '6 min',
        orden: 1,
        dia_asignado: 10,
        usa_ia: false,
        video_youtube_id: '3QVjYzWNM7M',
        coach_instruccion: 'MODO VIDEO-FALLBACK: contá en 5 min — el profesional promedio vende horas sueltas (commodity, se compara por precio); el director vende UN método con nombre propio (activo, se compara por resultado). La poda: una transformación, un protocolo de 3-7 pasos, un precio. Su método YA existe en lo que hace — esta semana lo documentamos, lo nombramos y lo empaquetamos.',
      },
      {
        codigo: 'P2.2',
        titulo: 'Documenta tu proceso + arranca tu cuenta Meta',
        descripcion: 'Dos cosas hoy. (1) Completa la herramienta con lo que YA haces con cada paciente (o estudiante), paso a paso. (2) EN PARALELO, 15 min con Sofi: crea tu página de Facebook y tu Business Manager HOY — Meta tarda semanas en confiar en cuentas nuevas, y tu campaña del día 22 necesita una cuenta con historial. Empezar hoy es lo que separa un plan serio de uno de humo.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '1.5 h',
        orden: 2,
        dia_asignado: 10,
        herramienta_id: 'H-P7.2',
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_TUTORIAL_BM',
        adn_field: 'adn_proceso_actual',
        entrenador: 'sofi',
        checklist: [
          'Completa la herramienta: tu proceso paso a paso (primer contacto → sesiones → cierre → resultado)',
          'Con Sofi: crea tu página de Facebook profesional (10 min, si no tienes)',
          'Con Sofi: crea tu Business Manager en business.facebook.com y vincula la página',
          'Opcional pero recomendado: impulsa una publicación tuya a $1/día — tu cuenta empieza a ganar historial HOY',
        ],
      },
      {
        codigo: 'P2.3',
        titulo: 'Tu paciente ideal: los 3 mejores que tuviste',
        descripcion: 'Elige los 3 mejores pacientes (o estudiantes) que pasaron por ti y completa la herramienta. Extrae el patrón: quién es tu persona ideal, qué le duele, qué compró de verdad. ¿No tienes 3 pacientes todavía? Usa 3 personas cercanas que tengan el problema que resolvés — o tu propia historia: tú fuiste tu primer caso.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '1.5 h',
        orden: 3,
        dia_asignado: 11,
        herramienta_id: 'H-P4.2',
        usa_ia: true,
        adn_field: 'adn_avatar',
      },
      {
        codigo: 'P2.4',
        titulo: 'Genera tu método: nombre + pasos',
        descripcion: 'La herramienta usa tu proceso documentado + tu paciente ideal y genera: 5 opciones de nombre propio (eliges una), tu protocolo estructurado en 3 a 7 pasos claros, y tu línea de posicionamiento (una frase que dice a quién servís y qué transformás). Acá nace tu activo.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '1.5 h',
        orden: 4,
        dia_asignado: 12,
        herramienta_id: 'H-P7.3',
        usa_ia: true,
        adn_field: 'metodo_nombre',
        requiere_datos_de: ['P2.2', 'P2.3'],
        entrenador: 'diego',
      },
      {
        codigo: 'P2.5',
        titulo: 'Valida el nombre con tu Mentor',
        descripcion: 'Cuéntale a tu Mentor el nombre elegido. La prueba de fuego: ¿evoca el RESULTADO que logra tu paciente, o describe tu proceso técnico? El nombre tiene que prometer el destino. Al aprobar: Amarillo punta verde — el primer brote asoma.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '10 min',
        orden: 5,
        dia_asignado: 12,
        usa_ia: false,
        coach_instruccion: 'Validá el nombre del método: ¿evoca el resultado del paciente o describe el proceso técnico? Si describe proceso, ayudale a girarlo hacia el resultado. Cuando el nombre prometa el destino, aprobá y celebrá: Amarillo punta verde, el primer brote asoma.',
      },
    ],
  },

  {
    id: 'P3',
    numero_orden: 3,
    titulo: 'Tu Oferta de $1.000',
    subtitulo: 'Precio digno, garantía real, lista para vender',
    color: '#22C55E',
    numero: 3,
    icon: 'Gem',
    emoji: '💎',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P2',
    fase: 2,
    dias_inicio: 15,
    dias_fin: 18,
    metodo_letra: 'N',
    cinturon_otorga: 'verde',
    hito_mensaje: '🥋 Cinturón VERDE — la planta crece. Tu oferta está completa y tu precio en pie.',
    hito_tipo: 'milestone',
    mentor_pregunta: '¿Qué cuesta más: sostener este precio, o sostener otra década del precio viejo?',
    metas: [
      {
        codigo: 'P3.1',
        titulo: 'La oferta que se vende sola',
        descripcion: 'Mira el video (7 min): la ecuación de valor — resultado soñado × probabilidad, dividido demora × esfuerzo. Por qué tu oferta debe prometer transformación, no sesiones. Y la garantía como permiso para confiar. Si el video no está, tu Mentor te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '7 min',
        orden: 1,
        dia_asignado: 15,
        usa_ia: false,
        video_youtube_id: '_UjQtE4lNtk',
        coach_instruccion: 'MODO VIDEO-FALLBACK: la ecuación de valor de Hormozi en 5 min — valor = (resultado soñado × probabilidad percibida) ÷ (demora × esfuerzo). Su oferta debe subir los dos de arriba (transformación concreta + prueba) y bajar los dos de abajo (resultados visibles rápido + método que acompaña). Nadie compra sesiones: compran el después. Y la garantía no es riesgo — es el permiso que el paciente necesita para confiar.',
      },
      {
        codigo: 'P3.2',
        titulo: 'Diseña tu oferta principal',
        descripcion: 'La herramienta arma tu oferta completa sobre tu método: qué transformación promete, qué incluye, cuánto dura, tu precio (el número del Día 6), y tres piezas que la vuelven irresistible — un stack de bonos (cada uno derriba una objeción concreta), tu garantía (eliges el tipo: incondicional, condicional, o anti-garantía), y la opción de cuotas (por ejemplo 3× para bajar la barrera de entrada sin tocar el precio). Todo en una página lista para presentar. Vera, tu entrenadora de precio, te ayuda si dudas.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '2 h',
        orden: 2,
        dia_asignado: 15,
        herramienta_id: 'H-P8.3',
        usa_ia: true,
        adn_field: 'adn_oferta_mid',
        requiere_datos_de: ['P2.4'],
        entrenador: 'vera',
      },
      {
        codigo: 'P3.3',
        titulo: 'Defiende tu precio (roleplay)',
        descripcion: 'Practica con tu Mentor: te va a decir "es caro", "lo tengo que pensar", "¿hay descuento?" — como un prospecto real. Repite hasta defender tu precio 3 veces seguidas sin disculparte. Vera es tu entrenadora especialista si quieres más práctica.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '45 min',
        orden: 3,
        dia_asignado: 16,
        usa_ia: false,
        entrenador: 'vera',
        checklist: [
          'Abre el chat y pedí el roleplay de defensa de precio',
          'Supera la objeción "es caro" sin bajar el precio',
          'Supera "lo tengo que pensar" con una pregunta, no con presión',
          'Supera "¿hay descuento?" sin ceder — 3 seguidas y pasas',
        ],
        coach_instruccion: 'Roleplay de defensa de precio: hacé de prospecto que objeta "es caro" / "lo tengo que pensar" / "¿hay descuento?". Evaluá si defiende con seguridad o se disculpa. Si aparece el precio-disculpa, recordale su creencia nueva del Día 7 y su estandarte. Repetir hasta que defienda con calma 3 objeciones seguidas.',
      },
      {
        codigo: 'P3.4',
        titulo: 'Aprobación final de tu oferta',
        descripcion: 'Preséntale a tu Mentor la oferta entera: transformación + qué incluye + precio + garantía. Si los 4 elementos están sólidos, ganas el Cinturón VERDE — la planta crece. Y se abre la Fase 3: salir a captar.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '1 h',
        orden: 4,
        dia_asignado: 17,
        evidencia_requerida: { tipo: 'audio', descripcion: 'Tu pitch de 60 segundos grabado. Es la primera vez que tu oferta suena en el mundo.' },
        usa_ia: false,
        coach_instruccion: 'Auditá la oferta final contra 4 criterios: (1) promete una transformación concreta, no sesiones; (2) el contenido es claro; (3) el precio es el número digno del Día 6, sin rebajas de miedo; (4) la garantía es real y específica. Solo si los 4 pasan, aprobá y otorgá el Cinturón Verde.',
      },
      {
        codigo: 'P3.5',
        titulo: 'Puesta al día — el dojo respira',
        descripcion: 'Sesión colchón, a propósito. Si algo quedó pendiente de las primeras 3 semanas, hoy se cierra: revisa tu ADN (método, paciente ideal, oferta) y completa lo que falte. Si vas al día: lee tu oferta en voz alta una vez más y descansa — la semana que viene se construye el sistema. Un cinturón no se apura: se gana.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '1 h',
        orden: 5,
        dia_asignado: 18,
        usa_ia: false,
        coach_instruccion: 'Sesión de puesta al día. Revisá con el sanador su ADN hasta acá: ¿método con nombre? ¿avatar claro? ¿oferta aprobada con precio digno? Lo que falte, se completa HOY con la herramienta correspondiente. Si está al día: reconocelo con sobriedad (sin inflar) y prepará la expectativa de la semana que viene: se monta el sistema técnico. Es la semana más operativa del programa.',
        checklist: [
          'Abre tu ADN y revisa: ¿tu método tiene nombre? ¿tu avatar es una persona real? ¿tu oferta tiene precio digno?',
          'Lo que esté incompleto: vuelve a esa herramienta y termínalo hoy',
          'Lee tu oferta completa en voz alta, de pie',
          'Si todo está: descansa. Te lo ganaste.',
        ],
      },
    ],
  },

  // ═══ FASE 3 · CAPTACIÓN Y VENTAS ═══
  {
    id: 'P4',
    numero_orden: 4,
    titulo: 'Tu Sistema de Captación',
    subtitulo: 'El sistema que atrae, filtra y agenda solo',
    color: '#38BDF8',
    numero: 4,
    icon: 'Magnet',
    emoji: '🧲',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P3',
    fase: 3,
    dias_inicio: 19,
    dias_fin: 29,
    metodo_letra: 'I',
    cinturon_otorga: 'verde_punta_azul',
    hito_mensaje: '🥋 Verde punta AZUL — la planta se estira al cielo. Tu campaña está ENCENDIDA y tu agente responde solo: empiezan a entrar interesados.',
    hito_tipo: 'urgent',
    mentor_pregunta: 'La campaña ya corre sin tú. ¿Qué vas a hacer con el tiempo que antes usabas para perseguir pacientes?',
    metas: [
      {
        codigo: 'P4.1',
        titulo: 'El sistema completo, sin humo',
        descripcion: 'Mira el video (8 min): el circuito real — anuncio → WhatsApp → tu agente de IA filtra → calendario → llamada → venta. Qué hace cada pieza y por qué el filtro automático es lo que te salva: el 55% de los interesados escribe fuera de horario, y el 78% le compra al primero que responde. Si el video no está, tu Mentor te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '8 min',
        orden: 1,
        dia_asignado: 19,
        usa_ia: false,
        video_youtube_id: 'ck2IVA9ZTzU',
        coach_instruccion: 'MODO VIDEO-FALLBACK: el circuito en 5 min — anuncio en Meta → clic abre WhatsApp → tu agente de IA (Meta Business Agent, nativo y gratis) responde al instante 24/7, hace las preguntas de filtro y agenda SOLO a los calificados → llamada → venta. Los datos: 55% de los leads llegan fuera de horario; 78% compra al primero que responde; responder en <5 min multiplica x21. Por eso el agente no es un lujo: ES el sistema. Los que hoy no califican van a tu Sala de Espera (canal) — nadie se pierde.',
      },
      {
        codigo: 'P4.5',
        titulo: 'Monta tu sistema: agente IA + agenda + cobro',
        descripcion: 'El día grande de infraestructura. Activás tu Meta Business Agent (el empleado digital de tu WhatsApp — gratis, nativo), lo entrenás con el documento que tu Mentor te genera con TU oferta y TUS preguntas de filtro, montás tu agenda, tu medio de cobro probado, y tu Sala de Espera. Sofi te acompaña pieza por pieza.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '2 h',
        orden: 2,
        dia_asignado: 19,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Captura de tu agente respondiendo + tu agenda con horarios visibles. El sistema existe cuando se ve.' },
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_TUTORIAL_AGENTE',
        entrenador: 'sofi',
        checklist: [
          'Instala el Pixel de Meta en tu página (el tutorial te muestra dónde pegarlo) y verifícalo con el Helper de Meta — sin pixel, tus anuncios vuelan a ciegas',
          'Instala WhatsApp Business (o convertí tu número actual — los chats se conservan; si prefieres separar trabajo de vida personal, usa un número nuevo)',
          'Activa tu agente: Herramientas → Meta Business Agent (5 min de configuración)',
          'Pídele a tu Mentor el DOCUMENTO DE ENTRENAMIENTO de tu agente (lo genera con tu oferta, tu avatar y tus 3 preguntas de filtro) — cópialo, guárdalo como PDF (Imprimir → Guardar como PDF) y súbeselo al agente',
          'Configura el agente: responde SOLO a clientes que llegan de anuncios · tono cálido y profesional · las conversaciones clínicas te las deriva a ti SIEMPRE',
          'Pruébalo: escribile desde el teléfono de alguien cercano como si fueras paciente',
          'Crea tu link de agenda (Calendly gratis o similar) con 3+ horarios esta semana',
          'Elige tu medio de cobro según tu país (México/Argentina: MercadoPago · Colombia: Nequi/Bancolombia · Ecuador: Payphone · otros: PayPal) y PRUÉBALO cobrándote $1 hoy',
          'Crea tu canal de WhatsApp "Sala de Espera" — ahí van los que hoy no califican: 1 mensaje semanal de valor, nadie se pierde',
          'PLAN B si el agente todavía no te aparece (Meta lo libera de a poco): mensaje de bienvenida con tus 3 preguntas + revisás 2 veces por día + pedí acceso desde la app de WhatsApp',
        ],
        coach_instruccion: 'Si te pide el DOCUMENTO DE ENTRENAMIENTO de su agente: generáselo COMPLETO y listo para copiar, con este formato: (1) QUIÉN SOY — nombre, profesión y su línea de posicionamiento; (2) MI OFERTA — la transformación, qué incluye, duración, precio y garantía (de su adn_oferta_mid); (3) A QUIÉN SIRVO — su avatar (dolores y señales de su persona ideal); (4) LAS 3 PREGUNTAS DE CALIFICACIÓN con redacción exacta — dolor ("¿qué te está pasando?"), urgencia ("¿hace cuánto lo venís cargando?"), capacidad ("el programa es una inversión de $[precio] — si vemos que es para ti, ¿estás en condiciones de tomarla?"); (5) QUÉ HACER — a los calificados: ofrecerles el link de agenda; a los no calificados: invitarlos con calidez al canal Sala de Espera; (6) REGLAS — tono cálido y profesional, jamás dar consejos clínicos ni discutir tratamientos: toda conversación clínica se deriva al humano. Después verificá el sistema pieza por pieza: (1) Meta Business Agent activo Y entrenado con el documento (pregúntale qué respondió el agente en la prueba); (2) regla de privacidad configurada — el agente filtra y agenda, las conversaciones clínicas las deriva al humano SIEMPRE (son profesionales de salud: esto no es negociable); (3) agenda con 3+ horarios; (4) prueba de cobro de $1 acreditada; (5) canal Sala de Espera creado. Si el agente no le aparece aún (rollout gradual), activá el Plan B sin drama: bienvenida con las 3 preguntas + 2 revisiones diarias. No apruebes hasta que las piezas estén operativas.',
      },
      {
        codigo: 'P4.2',
        titulo: 'El mensaje que atrae a TU paciente ideal',
        descripcion: 'Genera con la herramienta el copy de tu página y tus anuncios: el mensaje que hace que tu persona ideal se detenga, se reconozca en el dolor y quiera hablar contigo. Usa tu paciente ideal y tu oferta ya definidos. Es sesión-hito (2 h): podés partirla en dos bloques — la app guarda todo donde lo dejes.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '2 h',
        orden: 3,
        dia_asignado: 22,
        herramienta_id: 'H-P9A.2',
        usa_ia: true,
        adn_field: 'adn_landing_copy',
        requiere_datos_de: ['P3.2'],
        entrenador: 'mateo',
      },
      {
        codigo: 'P4.2b',
        titulo: 'Tu perfil que convierte',
        descripcion: 'Antes de que un solo anuncio corra, tu perfil de IG tiene que estar listo para recibir: foto profesional clara, bio con tu PUV en la primera línea (a quién ayudas y qué transformas), 3 destacadas mínimas (quién eres · cómo trabajas · resultados) y el link correcto. El que ve tu anuncio te googlea — que encuentre a un profesional. Sube captura de tu perfil terminado. Y antes de la gran grabación, EL EXPERIMENTO DE 48HS: publicas hoy una pieza pequeña e imperfecta (una historia, un texto corto con tu opinión profesional) y anotas tu predicción exacta: qué crees que va a pasar, quién se va a burlar, qué crítica va a llegar. En 48 horas comparas predicción contra realidad.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '45 min',
        orden: 3.5,
        dia_asignado: 23,
        usa_ia: true,
        coach_instruccion: 'EL EXPERIMENTO DE 48HS (preparación para el Día de Grabación): (1) que publique HOY algo pequeño e imperfecto — una historia de IG, un texto con su opinión profesional, sin producción; (2) ANTES de publicar, que escriba su predicción exacta: \'va a pasar X, me va a criticar Y, se va a burlar Z\' — con nombres si los hay; (3) pasadas 48hs, comparan juntos predicción vs realidad. El resultado es casi siempre el mismo: el mundo no se detuvo, nadie se burló, y la catástrofe existía solo en su cabeza. Ese dato — SU dato, no tu teoría — es lo que desarma el miedo antes de grabar. Si algo negativo SÍ pasó: mejor todavía — sobrevivió, y ya sabe que sobrevive.',
        adn_field: 'adn_perfil_ig',
        entrenador: 'mateo',
      },
      {
        codigo: 'P4.3',
        titulo: 'Graba 3 piezas y valídalas con datos REALES',
        descripcion: 'Regla de Javo: "No corro publicidad sin validar. Perdí $150.000 por esto." Pero con una cuenta chica, el orgánico solo no alcanza como señal — así que validamos con datos pagados y baratos: publicas las 3 piezas orgánico (gratis, construye tu perfil) Y las corrés como 3 anuncios de $2/día durante 5 días. El algoritmo de Meta te dice cuál GANA con números reales, no con corazonadas. Mateo te arma los guiones; Caro te enseña a grabar.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '5 días (en paralelo)',
        orden: 4,
        dia_asignado: 23,
        evidencia_requerida: { tipo: 'video', descripcion: 'Al menos 1 de tus 3 piezas subida (o captura de las 3 publicadas). Lo grabado se muestra.' },
        herramienta_id: 'H-P9A.4',
        usa_ia: true,
        adn_field: 'adn_validacion_organica',
        entrenador: 'mateo',
        checklist: [
          'Pídele a Mateo 3 guiones cortos basados en tu copy (dolor · autoridad · resultado)',
          'Antes de grabar, 10 min con Caro: encuadre, luz y presencia (si te da vergüenza: primero audio, después cámara sin publicar, después publicas — 3 escalones)',
          'Graba las 3 piezas (cortas: 30-60 segundos cada una)',
          'Publícalas orgánico en tu red principal (gratis, suma siempre)',
          'Con Sofi: sube las 3 como anuncios — $2/día cada uno, 5 días (~$30 total)',
          'Al día 5: la de menor costo por conversación GANA — esa es tu campeona',
        ],
      },
      {
        codigo: 'P4.3b',
        titulo: '⭐ DÍA DE GRABACIÓN — tu voz al mundo',
        descripcion: 'La sesión especial del programa: 4 horas, celular, buena luz, tus 3 guiones impresos. Hoy grabas las 3 piezas que van a trabajar por ti las próximas semanas. No busques perfección: busca verdad. Tu avatar no necesita un actor — necesita ver a la persona real que lo va a ayudar. Caro te acompaña en la preparación.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '4 h (día especial)',
        orden: 4,
        dia_asignado: 24,
        usa_ia: false,
        entrenador: 'caro',
        evidencia_requerida: { tipo: 'video', descripcion: 'Al menos una de tus 3 piezas grabada. La cámara ya no te frena.' },
        coach_instruccion: 'El Día de Grabación. Antes de grabar: 2 minutos con Caro para soltar el cuerpo (hombros, mandíbula, respiración). Reglas: máximo 3 tomas por pieza — la tercera va, aunque no sea perfecta; hablarle a UNA persona (su avatar, con nombre); guion como guía, no como jaula. Si aparece "no me gusta cómo me veo": eso es la identidad vieja defendiéndose — nombralo con respeto y seguí. Al final: que suba al menos una pieza como evidencia.',
        checklist: [
          'Prepara el espacio: luz de frente, fondo simple, celular a la altura de los ojos',
          '2 minutos de respiración con Caro antes de la primera toma',
          'Graba la pieza 1 (máximo 3 tomas — la tercera queda)',
          'Graba las piezas 2 y 3 con la misma regla',
          'Sube al menos una como evidencia — mírala una sola vez, con respeto',
        ],
      },
      {
        codigo: 'P4.3c',
        titulo: 'Edición simple y subida',
        descripcion: 'Hoy tus 3 piezas quedan listas: corte simple (inicio y final limpios), subtítulos automáticos, y subidas a tus plataformas. Nada de efectos: la claridad vende más que el brillo. En 2 horas están publicables. Es sesión-hito (2 h): podés partirla en dos bloques — la app guarda todo donde lo dejes. Regla de esta sesión: LA VERSIÓN VERGONZOSA. La primera versión se publica ANTES de que te guste del todo — a propósito. El perfeccionismo no es exigencia: es miedo disfrazado de estándar.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '2 h',
        orden: 5,
        dia_asignado: 25,
        usa_ia: false,
        coach_instruccion: 'Edición mínima viable: CapCut o similar — cortar inicio/final, subtítulos automáticos, exportar vertical. Nada más. Si se traba con la herramienta técnica, resolvelo paso a paso. El objetivo del día: 3 piezas EXPORTADAS y listas. No se pule: se publica. LA VERSIÓN VERGONZOSA como regla de la sesión: la pieza se publica cuando está CLARA, no cuando está perfecta. Si dice \'quiero regrabar\', \'no me gusta cómo quedó\', \'una toma más\': eso es la identidad vieja defendiéndose — nombralo con respeto y publicá igual. La fórmula de Javo: \'primero lanzo, después arreglo\'. Los datos del test (mañana) valen mil veces más que la opinión que él tiene de su propio video hoy. Recordale el Experimento de 48hs: su predicción catastrófica ya falló una vez.',
        checklist: [
          'BONUS: entra al menú Campañas (desbloqueado con tu Verde) y genera 2-3 anuncios ESTÁTICOS con la fábrica de imágenes — estáticos + videos = mejor test',
          'Corta el inicio y el final de cada pieza (que arranque en la primera palabra)',
          'Activa subtítulos automáticos y corrige errores gruesos',
          'Exporta las 3 en vertical (9:16)',
          'Déjalas listas en tu celular para mañana',
        ],
      },
      {
        codigo: 'P4.3d',
        titulo: 'Validación ON — publica y observa',
        descripcion: 'Hoy tus piezas salen al mundo: se publican orgánicamente y se les pone un impulso mínimo ($2/día por pieza, 3 días). No es tu campaña todavía: es el TEST. Los datos de estos días deciden cuál pieza merece tu inversión real. Publicar es un acto de servicio: alguien allá afuera necesita ver esto.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '1 h',
        orden: 6,
        dia_asignado: 26,
        usa_ia: false,
        adn_field: 'adn_validacion_organica',
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Captura de tus 3 piezas publicadas. Ya estás en el campo.' },
        coach_instruccion: 'Día de publicar. Guiá: subir las 3 piezas orgánicas + boost de $2/día a cada una por 3 días (total ~$18). Explicá QUÉ mirar durante el test: retención (¿la ven completa?), comentarios/DMs (¿alguien pregunta?), y CTR si hay link. NO se toca nada por 3 días: los datos necesitan cocinarse. Los próximos 2 días son de campo: responder cada mensaje en menos de 5 minutos. Registrá la evidencia.',
        checklist: [
          'Publica las 3 piezas en tu cuenta profesional',
          'Ponle a cada una un impulso de $2/día por 3 días',
          'Anota dónde vas a mirar los datos (alcance, retención, mensajes)',
          'Regla de los 3 días: no tocar, solo responder mensajes en <5 min',
          'Sube la captura de las 3 publicadas',
        ],
      },
      {
        codigo: 'P4.5b',
        titulo: 'Tu dirección digital — el dominio',
        descripcion: 'Tu clínica necesita una dirección propia: hoy conectas tu dominio (o activas el que te damos) para que tu agenda, tu página y tus links lleven TU nombre — no el de una plataforma. Es técnico pero guiado: 45 minutos y tu dirección queda viva para siempre.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '45 min',
        orden: 7,
        dia_asignado: 26,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_TUTORIAL_DOMINIO',
        coach_instruccion: 'Sesión técnica del dominio. Guiá paso a paso: (1) si tiene dominio propio: conectarlo en la configuración de su sistema (los 2 registros DNS — explicá qué son en una línea, sin jerga); (2) si no tiene: comprar uno simple (su nombre o su método, .com, ~$12/año) o usar el subdominio provisto; (3) verificar que su link de agenda abra con su dirección. Si el DNS demora en propagar (hasta 24h), tranquilizá: es normal, se sigue mañana. El hito: su link con SU nombre, compartible.',
        checklist: [
          'Decide: ¿dominio propio (tu-nombre.com) o el subdominio que te damos?',
          'Si es propio: agrega los 2 registros DNS que te muestra el tutorial',
          'Conecta el dominio a tu sistema y verifica que tu agenda abra con tu dirección',
          'Comparte tu link nuevo con una persona de confianza: tu dirección ya existe',
        ],
      },
      {
        codigo: 'P4.6',
        titulo: 'El anuncio follow-me',
        descripcion: 'Además de la campaña CTWA que trae interesados a tu WhatsApp, corre en paralelo un anuncio pequeño ($1-2/día) cuyo único objetivo es que la gente correcta SIGA tu perfil. Usa tu mejor pieza ya validada. Cada seguidor correcto es un futuro paciente calentándose solo. Sube captura del anuncio configurado.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '30 min',
        orden: 7.5,
        dia_asignado: 28,
        usa_ia: true,
        adn_field: 'adn_anuncio_followme',
        entrenador: 'ramiro',
      },
      {
        codigo: 'P4.4',
        titulo: '◆ ESCALA LA GANADORA — tu campaña CTWA real',
        descripcion: 'El momento que cambia todo. Apagás las 2 perdedoras y tu pieza CAMPEONA sube a $5-8/día como campaña a WhatsApp — donde tu agente ya espera para filtrar y agendar. Sube el screenshot de la campaña activa — un Entrenador lo verifica y ganas Verde punta azul: la planta se estira al cielo. Desde hoy, cada persona interesada cae directo en MI CLÍNICA: ahí las ves conversando, agendadas, y convertidas en pacientes. Tu Motor Dinero quedó encendido. Desde hoy, tus interesados caen en Mi Clínica (sección Personas) — tu Motor Dinero acaba de encenderse.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '30 min',
        orden: 5,
        dia_asignado: 29,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Captura de tu campaña ACTIVA en Meta (estado: En circulación). El sistema está vivo.' },
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_TUTORIAL_CAMPANA',
        entrenador: 'sofi',
        checklist: [
          'Apaga los 2 anuncios perdedores (sin culpa: pagaste $20 por saber la verdad)',
          'Duplica la ganadora como campaña "Interacción → WhatsApp" a $5-8/día',
          'Verifica el circuito completo: clic → tu WhatsApp → el agente responde y filtra → agenda',
          'Regla de oro: NO toques la campaña por 72 hs (fase de aprendizaje de Meta — cambiarla la resetea)',
          'Saca screenshot donde se vea el estado ACTIVO y el presupuesto — súbelo acá',
        ],
        coach_instruccion: 'Checklist antes de aprobar: ¿escaló la pieza ganadora de la validación (no otra)? ¿el circuito completo funciona (clic → WhatsApp → agente filtra → agenda con horarios)? ¿entiende que NO debe tocar la campaña por 72 hs (aprendizaje de Meta)? Pedí el screenshot de la campaña ACTIVA: estado activo + presupuesto diario visibles. Si es válido, otorgá Verde punta azul y prepará la expectativa: en 24-72 hs llegan los primeros mensajes — la próxima fase le enseña a convertirlos.',
      },
    ],
  },

  {
    id: 'P5',
    numero_orden: 5,
    titulo: 'Vender sin Venderte',
    subtitulo: 'Del primer mensaje a la llamada que convierte',
    color: '#3B82F6',
    numero: 5,
    icon: 'PhoneCall',
    emoji: '📞',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P4',
    fase: 3,
    dias_inicio: 30,
    dias_fin: 37,
    metodo_letra: 'C',
    cinturon_otorga: 'azul',
    hito_mensaje: '🥋 Cinturón AZUL — alcanzaste el cielo. Hiciste tu primera llamada de venta real. Lo que sigue es repetir.',
    hito_tipo: 'milestone',
    mentor_pregunta: '¿Qué escuchaste en esa llamada que ningún curso te podía enseñar?',
    metas: [
      {
        codigo: 'P5.1',
        titulo: 'Anatomía de la llamada que cierra',
        descripcion: 'Mira el video (8 min): la estructura de la llamada — Apertura, Dolor, Cielo, Obstáculos, Cierre (la W). Por qué el que pregunta dirige. Cómo presentar el precio sin que tiemble la voz. Y la regla del decisor: si la decisión la comparte con alguien, ese alguien tiene que estar en la llamada. Si el video no está, tu Mentor te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '8 min',
        orden: 1,
        dia_asignado: 30,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P9B_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: la W en 5 min — (1) Apertura: preguntas, el que pregunta dirige; (2) Dolor: profundizar hasta lo que le cuesta de verdad; (3) Cielo: que él mismo describa su después; (4) Obstáculos: sacarlos ANTES del precio — y el más letal es el decisor ausente ("lo hablo con mi pareja" = llamada perdida; el decisor se invita ANTES); (5) Cierre: el precio con calma, silencio, y la pregunta de decisión. Vender es ayudar a decidir, no convencer.',
      },
      {
        codigo: 'P5.2',
        titulo: 'Tu script de ventas propio',
        descripcion: 'Genera tu guion personalizado con la estructura de la W: las preguntas de apertura, cómo profundizar el dolor, cómo pintar el después, el manejo del decisor, y tu cierre natural — con tu oferta y tu precio ya integrados. Y un plus: Bruno, tu entrenador de mensajes, te enseña a manejar los WhatsApp que ya están llegando (subile un screenshot de una conversación real).',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '1.5 h',
        orden: 2,
        dia_asignado: 30,
        herramienta_id: 'H-P9B.2',
        usa_ia: true,
        adn_field: 'adn_script_ventas',
        requiere_datos_de: ['P3.2'],
        entrenador: 'bruno',
      },
      {
        codigo: 'P5.3',
        titulo: 'Roleplay: practica antes de la real',
        descripcion: 'Tu Mentor hace de prospecto difícil: objeta, duda, compara, y te tira las reales — "es caro", "lo hablo con mi pareja", "lo tengo que pensar". Practica el guion completo hasta que fluya. Nadie entra al ring sin sparring. Lucas, tu entrenador de ventas, está para las rondas extra.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '1.5 h',
        orden: 3,
        dia_asignado: 31,
        usa_ia: false,
        entrenador: 'lucas',
        checklist: [
          'Pedí el roleplay completo con tu script en mano',
          'Completa la llamada entera: apertura → dolor → cielo → obstáculos → precio → cierre',
          'Supera las 3 objeciones reales: "es caro" · "lo hablo con mi pareja" · "lo tengo que pensar"',
          'Recibí las 2 mejoras del Mentor, anotalas, y repite una segunda simulación',
        ],
        coach_instruccion: 'Roleplay completo con SU script y la estructura W (Apertura-Dolor-Cielo-Obstáculos-Cierre). Hacé de prospecto realista con el banco de objeciones REALES: "es caro" (defensa sin disculpa), "lo hablo con mi pareja" (el decisor — enseñale a invitarlo a una próxima llamada con ambos, no a perseguir), "lo tengo que pensar" (pregunta que destapa la objeción real detrás). Evaluá apertura, manejo del dolor, presentación de precio con silencio posterior, y cierre. Dale 2 mejoras concretas. Repetir hasta una simulación sólida.',
      },
      {
        codigo: 'P5.5',
        titulo: 'Semana de leads — la operación diaria',
        descripcion: 'Tu campaña está viva y los mensajes llegan. Esta semana tu sesión diaria es de campo: 30-45 minutos para responder lo que el agente filtró, confirmar agendas y registrar cada conversación. Regla de oro: cada mensaje respondido en menos de 5 minutos duplica la chance de agenda. El sistema atrae; tú conviertes.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '45 min/día (esta semana)',
        orden: 4,
        dia_asignado: 32,
        usa_ia: false,
        coach_instruccion: 'Semana de operación de leads. El checklist es DIARIO y se repite cada día de esta semana (la tarea se completa al final de la semana, cuando el ritual está instalado). Sostené el ritmo: si un día no respondió a tiempo, sin culpa — se ajusta la ventana horaria. Si no llegan mensajes en 48 h: revisar con Ramiro el gasto y la segmentación de la campaña. Si llegan pero no agendan: revisar la calificación del agente. El sanador reporta cada día cuántos mensajes, cuántas agendas.',
        checklist: [
          'Define tu ventana fija de leads (ej: 13:00-13:45) y respétala como una consulta',
          'Cada día: responde TODO lo pendiente en <5 min por mensaje',
          'Confirma cada agenda con un mensaje personal (no solo el bot)',
          'Registra: cuántos mensajes hoy, cuántas agendas',
          'Al final de la semana: completa esta sesión — el ritual ya es tuyo',
        ],
      },
      {
        codigo: 'P5.4',
        titulo: '◆ TU PRIMERA LLAMADA REAL',
        descripcion: 'Los días previos son de campo: responde cada mensaje en <5 min, confirma agendas — la app no te asigna tarea nueva porque el juego está en tu WhatsApp. Y entonces llega: atiende a tu primer prospecto real del sistema. No importa si no cierra — importa que la hiciste. Sube el screenshot del Meet/Zoom (puedes tapar el nombre) y haz el debrief con tu Mentor. Ganás el Cinturón AZUL: alcanzaste el cielo.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '60 min',
        orden: 4,
        dia_asignado: 37,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Captura de la llamada agendada o realizada (calendario o registro). Tu primera vez cuenta.' },
        usa_ia: false,
        entrenador: 'lucas',
        checklist: [
          'Confírmale la cita al prospecto el mismo día (sube la asistencia del 50% al 70%)',
          'Si mencionó pareja/socio en el filtro: invita al decisor a la llamada',
          'Ten tu script a mano (impreso o segunda pantalla)',
          'Haz la llamada — presencia, preguntas, calma en el precio',
          'Saca screenshot de la videollamada (tapa el nombre si quieres)',
          'Sube el screenshot y haz el debrief con tu Mentor',
        ],
        coach_instruccion: 'Debrief de la primera llamada real: pedile el screenshot del Meet/Zoom (debe verse la videollamada — puede tapar el nombre por privacidad). Verificá que sea real. El debrief: ¿qué funcionó? ¿dónde se trabó? ¿qué objeción no supo manejar? ¿estaba el decisor si correspondía? Cerrá con 1 ajuste para la próxima. Otorgá el Cinturón Azul: alcanzó el cielo. Anticipале la resistencia que viene: los primeros NO duelen — y son parte de la matemática (cierre 20% = 4 de 5 dicen no Y el sistema funciona).',
      },
    ],
  },

  // ═══ FASE 4 · SERVICIO Y ESCALA ═══
  {
    id: 'P6',
    numero_orden: 6,
    titulo: 'Cobrar y Entregar',
    subtitulo: 'Tu primer pago y un servicio que no te consume',
    color: '#EF4444',
    numero: 6,
    icon: 'BadgeDollarSign',
    emoji: '🍎',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P5',
    fase: 4,
    dias_inicio: 38,
    dias_fin: 44,
    metodo_letra: 'C',
    cinturon_otorga: 'rojo',
    hito_mensaje: '🥋 Cinturón ROJO — el fruto maduró. Cobraste tu primer paciente por el sistema. El mártir quedó atrás.',
    hito_tipo: 'milestone',
    mentor_pregunta: '¿Quién eres ahora que ya no puedes decir que no se puede?',
    metas: [
      {
        codigo: 'P6.1',
        titulo: 'Entregar sin quemarte',
        descripcion: 'Mira el video (7 min): el protocolo de entrega — qué recibe tu paciente en las primeras 24 hs, cómo se organiza el seguimiento, qué se automatiza y qué se mantiene humano. Acá nace tu MiClínica Digital. Si el video no está, tu Mentor te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '7 min',
        orden: 1,
        dia_asignado: 38,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P9C_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: en 5 min — el error clásico es vender bien y entregar caótico (el paciente paga $1.000 y recibe silencio 3 días). El protocolo: (1) primeras 24 hs — bienvenida + primer paso concreto; (2) la primera sesión agendada YA en el momento del pago; (3) recordatorios y seguimiento con estructura (qué es automático, qué es humano); (4) el cierre del protocolo con medición del resultado. Todo esto después vive en MiClínica Digital — tu app operativa. Hoy lo documenta para tenerlo listo.',
      },
      {
        codigo: 'P6.4',
        titulo: 'El ritmo de ventas — tu semana tipo',
        descripcion: 'Desde hoy, tu semana tiene forma fija: mañanas de entrega a tus pacientes, ventana de leads al mediodía, llamadas por la tarde, y el viernes tu Revisión del Director. Este es el ritmo que sostiene los 10. No es intensidad: es constancia con forma. El taekwondo no se gana en un día de furia — se gana en mil días de presencia.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '30-60 min/día (permanente)',
        orden: 2,
        dia_asignado: 39,
        usa_ia: false,
        coach_instruccion: 'Instalación del ritmo permanente. Ayudá al sanador a armar SU semana tipo real (con sus horarios de consultorio): ventana de leads diaria + bloques de llamadas (2-3 tardes) + viernes de revisión. Que la escriba y la ponga donde la vea. A partir de acá tu rol semanal: cada viernes, la Revisión del Director (números → 1 decisión → plan). Entre semana: sostener, destrabar, celebrar cada venta registrada.',
        checklist: [
          'Arma tu semana tipo: ventana de leads + 2-3 bloques de llamadas + viernes de revisión',
          'Escríbela y ponla visible (fondo de pantalla, papel en el escritorio)',
          'Cada venta: regístrala en El Camino ese mismo día (el contador es tu mapa)',
          'Pide testimonio a cada paciente que termina — tu prueba social vende por ti',
        ],
      },
      {
        codigo: 'P6.2',
        titulo: 'Tu protocolo de entrega',
        descripcion: 'Documenta cómo entregas tu método: bienvenida, primera sesión, recordatorios, seguimiento entre sesiones, cierre. Queda estructurado y listo para cargarse en tu sistema operativo (MCD) cuando lo instales.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '2 h',
        orden: 2,
        dia_asignado: 43,
        herramienta_id: 'H-P9C.2',
        usa_ia: true,
        adn_field: 'adn_protocolo_entrega',
        requiere_datos_de: ['P2.4'],
      },
      {
        codigo: 'P6.3',
        titulo: '◆ TU PRIMER PAGO',
        descripcion: 'Alguien dijo que sí y pagó tu precio digno. Sube el comprobante (captura de transferencia, recibo de pasarela, o foto del efectivo — puedes tapar datos sensibles). Tu Entrenador lo verifica y ganas el Cinturón ROJO: el fruto maduró. Este es el final del mártir.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '15 min',
        orden: 3,
        dia_asignado: 44,
        evidencia_requerida: { tipo: 'comprobante', descripcion: 'El comprobante del pago (recibo, transferencia o captura). El momento que cambia todo.' },
        usa_ia: false,
        checklist: [
          'Cerraste la venta: envía el link/datos de cobro EN la llamada o apenas termina',
          'Confirma que el dinero se acreditó (no "me dijo que paga")',
          'Saca captura del comprobante (tapa datos sensibles si quieres)',
          'Súbelo y celebra con tu Mentor — este momento es LA transformación',
        ],
        coach_instruccion: 'Verificación del primer pago: pedile el comprobante (captura de transferencia, recibo, o foto del efectivo — puede tapar datos sensibles). Verificá 3 cosas: monto visible, fecha reciente, coherencia con su precio declarado en el ADN. Si dudás, marcalo para revisión del equipo. Si es válido, otorgá el Cinturón Rojo y celebrá en serio: este momento separa al que lo intentó del que lo hizo. Preguntá cómo se siente cobrar su precio digno — y recordale reinvertir: la pauta ahora puede subir a $8-12/día, se paga sola.',
      },
    ],
  },

  {
    id: 'P7',
    numero_orden: 7,
    titulo: 'De 1 a 10 · Sanador Libre',
    subtitulo: 'Repetir, medir, y que el sistema trabaje por ti',
    color: '#111827',
    numero: 7,
    icon: 'Trophy',
    emoji: '🌳',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P6',
    fase: 4,
    dias_inicio: 50,
    dias_fin: 90,
    metodo_letra: 'A',
    cinturon_otorga: 'negro',
    hito_mensaje: '🥋 Cinturón NEGRO — el árbol da semillas. 10 pacientes, $10K, sistema andando. Eres un Sanador Libre. Y esto recién empieza.',
    hito_tipo: 'milestone',
    mentor_pregunta: 'El árbol ya da semillas. ¿A quién vas a enseñarle lo que aprendiste?',
    metas: [
      {
        codigo: 'P7.1',
        titulo: 'La máquina de 10 por mes',
        descripcion: 'Mira el video (7 min): de la primera venta al sistema recurrente. Qué medir cada semana (interesados, llamadas, cierres), cuándo ajustar el anuncio, cuándo subir el presupuesto, y qué delegar primero. Si el video no está, tu Mentor te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '7 min',
        orden: 1,
        dia_asignado: 50,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P11_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: en 5 min — el sistema ya probó que funciona (hubo un pago). Ahora es un ciclo semanal: medir 4 números (interesados → agendados → llamadas → cierres), encontrar el cuello de botella, hacer UN ajuste. La pauta escala con la caja: $8-12/día tras la venta 1, $15-20 tras la 3. Cuidado con la meseta ("ya vendí 3, me relajo") y el autosabotaje cerca de la meta — son las dos resistencias clásicas de este tramo, y las vamos a nombrar cuando aparezcan.',
      },
      {
        codigo: 'P7.2',
        titulo: 'El primer Plan de Caza',
        descripcion: 'Arranca el Rodaje: 5 semanas de caza hasta tus 10 pacientes. Cada semana tiene 3 ritos fijos — lunes: el Plan (tus números y tu ángulo) · miércoles: la Review (tus conversaciones reales, corregidas) · viernes: el Cierre (tu scorecard y tus pagos). Hoy armas tu primer plan: cuántas conversaciones vas a abrir esta semana, con qué ángulo, y cuál es tu número objetivo. En el Rodaje no se improvisa: se caza con método.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '30 min',
        orden: 2,
        dia_asignado: 51,
        usa_ia: false,
        es_recurrente: true,
        entrenador: 'lucas',
        checklist: [
          'Anota tus números de la semana: interesados · llamadas agendadas · llamadas hechas · cierres',
          'Identifica con el Mentor el cuello de botella (dónde se cae la mayoría)',
          'Define UN solo ajuste para esta semana (no tres)',
          'Registra cada venta nueva — el contador X/10 avanza contigo',
          'Pide testimonio a cada paciente que termina (video de 60 seg o audio) — tu prueba social vende por ti',
        ],
        coach_instruccion: 'Revisión semanal de embudo: pedile sus números (leads, agendadas, hechas, cierres). Diagnosticá el cuello: pocos leads = el anuncio; no agendan = el filtro/agente; no cierran = la llamada (derivá a Lucas para roleplay). UN solo ajuste concreto por semana. Registrá el avance hacia los 10 y celebrá cada venta. Anticipá resistencias por tramo: semana 7-8 la meseta ("¿viniste por 3 o por la libertad?"); semana 10-11 el autosabotaje cerca de la meta — nombrarlo ANTES lo desarma.',
      },
            {
        codigo: 'P7.C1',
        titulo: 'Semana de Caza 1 de 5',
        descripcion: 'Tu semana del Rodaje, con los 3 ritos: LUNES abres el Plan (números de la semana pasada, objetivo de esta, ángulo elegido). MIÉRCOLES la Review: llevas tus conversaciones reales de WhatsApp a Sofi (filtrado y setting) o tus llamadas a Lucas (cierre) — una conducta corregida, un mensaje exacto para enviar hoy. VIERNES el Cierre: registras tu scorecard (conversaciones abiertas · llamadas · cierres · pagos) y decides el ajuste de la próxima. Si esta semana entró un pago: se registra con su comprobante — los cinturones se ganan con evidencia. La caza es un ritmo, no un sprint.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '3 ritos × 30 min (esta semana)',
        orden: 30,
        dia_asignado: 52,
        usa_ia: true,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Tu scorecard de la semana: conversaciones abiertas, llamadas, cierres y pagos. El número real, no el deseado — en el dojo se mide todo.' },
        coach_instruccion: 'SEMANA DE CAZA 1/5 — sos el director técnico del ritmo semanal. RITO 1 (lunes, 30 min): revisá con él los números de la semana pasada SIN juicio y CON matemática (cuántas conversaciones → cuántas llamadas → cuántos cierres; la conversión dice dónde está la fuga). Fijen el número de esta semana (conversaciones a abrir) y UN ángulo de contenido/anuncio — uno solo, el que mejor midió. RITO 2 (miércoles): mandalo con material REAL — que le pegue a Sofi 1-2 conversaciones de WhatsApp textuales (o a Lucas una llamada) y vuelva con la conducta corregida y el mensaje exacto. Si no tiene conversaciones que revisar, ESO es el hallazgo: el problema es volumen, no técnica — más pauta o más contenido, hoy. RITO 3 (viernes, 20 min): el scorecard con números reales (la evidencia de la semana). Si hubo pago: celebración específica + comprobante registrado. Si no hubo: matemática, no drama — ¿dónde se cayó el embudo esta semana? Un ajuste concreto para el lunes. Frase de la etapa: no encontrar el ángulo es escasez absoluta — se testea hasta encontrarlo.',
      },
      {
        codigo: 'P7.C2',
        titulo: 'Semana de Caza 2 de 5',
        descripcion: 'Tu semana del Rodaje, con los 3 ritos: LUNES abres el Plan (números de la semana pasada, objetivo de esta, ángulo elegido). MIÉRCOLES la Review: llevas tus conversaciones reales de WhatsApp a Sofi (filtrado y setting) o tus llamadas a Lucas (cierre) — una conducta corregida, un mensaje exacto para enviar hoy. VIERNES el Cierre: registras tu scorecard (conversaciones abiertas · llamadas · cierres · pagos) y decides el ajuste de la próxima. Si esta semana entró un pago: se registra con su comprobante — los cinturones se ganan con evidencia. La caza es un ritmo, no un sprint.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '3 ritos × 30 min (esta semana)',
        orden: 31,
        dia_asignado: 59,
        usa_ia: true,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Tu scorecard de la semana: conversaciones abiertas, llamadas, cierres y pagos. El número real, no el deseado — en el dojo se mide todo.' },
        coach_instruccion: 'SEMANA DE CAZA 2/5 — sos el director técnico del ritmo semanal. RITO 1 (lunes, 30 min): revisá con él los números de la semana pasada SIN juicio y CON matemática (cuántas conversaciones → cuántas llamadas → cuántos cierres; la conversión dice dónde está la fuga). Fijen el número de esta semana (conversaciones a abrir) y UN ángulo de contenido/anuncio — uno solo, el que mejor midió. RITO 2 (miércoles): mandalo con material REAL — que le pegue a Sofi 1-2 conversaciones de WhatsApp textuales (o a Lucas una llamada) y vuelva con la conducta corregida y el mensaje exacto. Si no tiene conversaciones que revisar, ESO es el hallazgo: el problema es volumen, no técnica — más pauta o más contenido, hoy. RITO 3 (viernes, 20 min): el scorecard con números reales (la evidencia de la semana). Si hubo pago: celebración específica + comprobante registrado. Si no hubo: matemática, no drama — ¿dónde se cayó el embudo esta semana? Un ajuste concreto para el lunes. Frase de la etapa: no encontrar el ángulo es escasez absoluta — se testea hasta encontrarlo.',
      },
      {
        codigo: 'P7.C3',
        titulo: 'Semana de Caza 3 de 5',
        descripcion: 'Tu semana del Rodaje, con los 3 ritos: LUNES abres el Plan (números de la semana pasada, objetivo de esta, ángulo elegido). MIÉRCOLES la Review: llevas tus conversaciones reales de WhatsApp a Sofi (filtrado y setting) o tus llamadas a Lucas (cierre) — una conducta corregida, un mensaje exacto para enviar hoy. VIERNES el Cierre: registras tu scorecard (conversaciones abiertas · llamadas · cierres · pagos) y decides el ajuste de la próxima. Si esta semana entró un pago: se registra con su comprobante — los cinturones se ganan con evidencia. La caza es un ritmo, no un sprint.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '3 ritos × 30 min (esta semana)',
        orden: 32,
        dia_asignado: 66,
        usa_ia: true,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Tu scorecard de la semana: conversaciones abiertas, llamadas, cierres y pagos. El número real, no el deseado — en el dojo se mide todo.' },
        coach_instruccion: 'SEMANA DE CAZA 3/5 — sos el director técnico del ritmo semanal. RITO 1 (lunes, 30 min): revisá con él los números de la semana pasada SIN juicio y CON matemática (cuántas conversaciones → cuántas llamadas → cuántos cierres; la conversión dice dónde está la fuga). Fijen el número de esta semana (conversaciones a abrir) y UN ángulo de contenido/anuncio — uno solo, el que mejor midió. RITO 2 (miércoles): mandalo con material REAL — que le pegue a Sofi 1-2 conversaciones de WhatsApp textuales (o a Lucas una llamada) y vuelva con la conducta corregida y el mensaje exacto. Si no tiene conversaciones que revisar, ESO es el hallazgo: el problema es volumen, no técnica — más pauta o más contenido, hoy. RITO 3 (viernes, 20 min): el scorecard con números reales (la evidencia de la semana). Si hubo pago: celebración específica + comprobante registrado. Si no hubo: matemática, no drama — ¿dónde se cayó el embudo esta semana? Un ajuste concreto para el lunes. Frase de la etapa: no encontrar el ángulo es escasez absoluta — se testea hasta encontrarlo.',
      },
      {
        codigo: 'P7.C4',
        titulo: 'Semana de Caza 4 de 5',
        descripcion: 'Tu semana del Rodaje, con los 3 ritos: LUNES abres el Plan (números de la semana pasada, objetivo de esta, ángulo elegido). MIÉRCOLES la Review: llevas tus conversaciones reales de WhatsApp a Sofi (filtrado y setting) o tus llamadas a Lucas (cierre) — una conducta corregida, un mensaje exacto para enviar hoy. VIERNES el Cierre: registras tu scorecard (conversaciones abiertas · llamadas · cierres · pagos) y decides el ajuste de la próxima. Si esta semana entró un pago: se registra con su comprobante — los cinturones se ganan con evidencia. La caza es un ritmo, no un sprint.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '3 ritos × 30 min (esta semana)',
        orden: 33,
        dia_asignado: 73,
        usa_ia: true,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Tu scorecard de la semana: conversaciones abiertas, llamadas, cierres y pagos. El número real, no el deseado — en el dojo se mide todo.' },
        coach_instruccion: 'SEMANA DE CAZA 4/5 — sos el director técnico del ritmo semanal. RITO 1 (lunes, 30 min): revisá con él los números de la semana pasada SIN juicio y CON matemática (cuántas conversaciones → cuántas llamadas → cuántos cierres; la conversión dice dónde está la fuga). Fijen el número de esta semana (conversaciones a abrir) y UN ángulo de contenido/anuncio — uno solo, el que mejor midió. RITO 2 (miércoles): mandalo con material REAL — que le pegue a Sofi 1-2 conversaciones de WhatsApp textuales (o a Lucas una llamada) y vuelva con la conducta corregida y el mensaje exacto. Si no tiene conversaciones que revisar, ESO es el hallazgo: el problema es volumen, no técnica — más pauta o más contenido, hoy. RITO 3 (viernes, 20 min): el scorecard con números reales (la evidencia de la semana). Si hubo pago: celebración específica + comprobante registrado. Si no hubo: matemática, no drama — ¿dónde se cayó el embudo esta semana? Un ajuste concreto para el lunes. Frase de la etapa: no encontrar el ángulo es escasez absoluta — se testea hasta encontrarlo.',
      },
      {
        codigo: 'P7.C5',
        titulo: 'Semana de Caza 5 de 5',
        descripcion: 'Tu semana del Rodaje, con los 3 ritos: LUNES abres el Plan (números de la semana pasada, objetivo de esta, ángulo elegido). MIÉRCOLES la Review: llevas tus conversaciones reales de WhatsApp a Sofi (filtrado y setting) o tus llamadas a Lucas (cierre) — una conducta corregida, un mensaje exacto para enviar hoy. VIERNES el Cierre: registras tu scorecard (conversaciones abiertas · llamadas · cierres · pagos) y decides el ajuste de la próxima. Si esta semana entró un pago: se registra con su comprobante — los cinturones se ganan con evidencia. La caza es un ritmo, no un sprint.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '3 ritos × 30 min (esta semana)',
        orden: 34,
        dia_asignado: 80,
        usa_ia: true,
        evidencia_requerida: { tipo: 'screenshot', descripcion: 'Tu scorecard de la semana: conversaciones abiertas, llamadas, cierres y pagos. El número real, no el deseado — en el dojo se mide todo.' },
        coach_instruccion: 'SEMANA DE CAZA 5/5 — sos el director técnico del ritmo semanal. RITO 1 (lunes, 30 min): revisá con él los números de la semana pasada SIN juicio y CON matemática (cuántas conversaciones → cuántas llamadas → cuántos cierres; la conversión dice dónde está la fuga). Fijen el número de esta semana (conversaciones a abrir) y UN ángulo de contenido/anuncio — uno solo, el que mejor midió. RITO 2 (miércoles): mandalo con material REAL — que le pegue a Sofi 1-2 conversaciones de WhatsApp textuales (o a Lucas una llamada) y vuelva con la conducta corregida y el mensaje exacto. Si no tiene conversaciones que revisar, ESO es el hallazgo: el problema es volumen, no técnica — más pauta o más contenido, hoy. RITO 3 (viernes, 20 min): el scorecard con números reales (la evidencia de la semana). Si hubo pago: celebración específica + comprobante registrado. Si no hubo: matemática, no drama — ¿dónde se cayó el embudo esta semana? Un ajuste concreto para el lunes. Frase de la etapa: no encontrar el ángulo es escasez absoluta — se testea hasta encontrarlo.',
      },
{
        codigo: 'P7.3',
        titulo: '◆ 10 PACIENTES · SANADOR LIBRE',
        descripcion: 'La meta: 10 pacientes de tu precio digno, cobrados por tu sistema. Sube los comprobantes (o tu registro de ventas de la app) y tu Entrenador certifica tu Cinturón NEGRO. No con más horas — con mejor arquitectura. El árbol ya da semillas.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '20 min',
        orden: 3,
        dia_asignado: 85,
        usa_ia: false,
        evidencia_requerida: { tipo: 'comprobante', descripcion: 'El registro de tus 10 pacientes: capturas de los pagos o tu planilla de cobros. El Cinturón Negro se gana con hechos — como todos los anteriores.' },
        coach_instruccion: 'Certificación del Cinturón Negro: pedile evidencia de los 10 pacientes cobrados (comprobantes o el registro de ventas). Verificá que la suma alcance ~$10K. Si es válido, certificá: Sanador Libre. La retrospectiva: ¿qué cambió en 90 días — en su negocio Y en él? El después: el sistema ahora produce 10/mes, su clínica opera en MiClínica Digital, y el cinturón negro es 1er dan — el Nivel 2 ($25K/mes) existe cuando esté listo.',
      },
    ],
  },
];

// ─── Derivados (contrato intacto) ───────────────────────────────────────────

export const TOTAL_METAS = SEED_ROADMAP_V8.reduce(
  (acc, p) => acc + p.metas.length,
  0,
);

export const ESTRELLAS_POR_PILAR: Record<string, number> = SEED_ROADMAP_V8.reduce(
  (acc, p) => {
    acc[p.id] = p.metas.filter((m) => m.es_estrella).length;
    return acc;
  },
  {} as Record<string, number>,
);

// ─── CINTURONES — el sistema de progreso (planta/taekwondo) ────────────────

export interface Cinturon {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  color_punta?: string;
  metafora: string;
  orden: number;
}

export const CINTURONES: Cinturon[] = [
  { id: 'blanco',                orden: 1, nombre: 'Blanco',                emoji: '⬜',   color: '#F4F4F5',                          metafora: 'La semilla' },
  { id: 'blanco_punta_amarilla', orden: 2, nombre: 'Blanco punta amarilla', emoji: '⬜🟡', color: '#F4F4F5', color_punta: '#E8962E', metafora: 'La semilla se abre' },
  { id: 'amarillo',              orden: 3, nombre: 'Amarillo',              emoji: '🟡',   color: '#E8962E',                          metafora: 'La raíz en la tierra' },
  { id: 'amarillo_punta_verde',  orden: 4, nombre: 'Amarillo punta verde',  emoji: '🟡🟢', color: '#E8962E', color_punta: '#22C55E', metafora: 'El primer brote asoma' },
  { id: 'verde',                 orden: 5, nombre: 'Verde',                 emoji: '🟢',   color: '#22C55E',                          metafora: 'La planta crece' },
  { id: 'verde_punta_azul',      orden: 6, nombre: 'Verde punta azul',      emoji: '🟢🔵', color: '#22C55E', color_punta: '#3B82F6', metafora: 'Se estira hacia el cielo' },
  { id: 'azul',                  orden: 7, nombre: 'Azul',                  emoji: '🔵',   color: '#3B82F6',                          metafora: 'Alcanza el cielo' },
  { id: 'rojo',                  orden: 8, nombre: 'Rojo',                  emoji: '🔴',   color: '#EF4444',                          metafora: 'El fruto maduro' },
  { id: 'negro',                 orden: 9, nombre: 'Negro',                 emoji: '⬛',   color: '#111827',                          metafora: 'El árbol que da semillas' },
];

/** Mapeo pilar completado → cinturón otorgado.
 *  'blanco_punta_amarilla' NO está acá: se otorga al completar P1.3 (la quema),
 *  vía hitos_cinturon (Capa 3). */
const CINTURON_POR_PILAR: Record<string, string> = {
  P0: 'blanco',
  P1: 'amarillo',
  P2: 'amarillo_punta_verde',
  P3: 'verde',
  P4: 'verde_punta_azul',
  P5: 'azul',
  P6: 'rojo',
  P7: 'negro',
};

/** Calcula el cinturón según el pilar más alto completado. */
export function calcularCinturon(pilarCompletado: PilarId | number | null): Cinturon {
  const fallback = CINTURONES[0];
  if (pilarCompletado === null || pilarCompletado === undefined) return fallback;
  let id: string | undefined;
  if (typeof pilarCompletado === 'number') {
    const pilar = SEED_ROADMAP_V8.find((p) => p.numero_orden === pilarCompletado);
    id = pilar ? CINTURON_POR_PILAR[pilar.id] : undefined;
  } else {
    id = CINTURON_POR_PILAR[pilarCompletado];
  }
  return CINTURONES.find((c) => c.id === id) ?? fallback;
}

/**
 * Nivel 1-5 (compatibilidad con el sistema anterior de "niveles del Sanador").
 */
export function calcularNivel(
  pilarCompletado: PilarId | number,
  cerroPrimer10K: boolean = false,
): 1 | 2 | 3 | 4 | 5 {
  let orden: number;
  if (typeof pilarCompletado === 'number') {
    orden = pilarCompletado;
  } else {
    const pilar = SEED_ROADMAP_V8.find((p) => p.id === pilarCompletado);
    if (!pilar) return 1;
    orden = pilar.numero_orden;
  }
  if (orden >= 7 && cerroPrimer10K) return 5;
  if (orden >= 6) return 4;
  if (orden >= 4) return 4;
  if (orden >= 3) return 3;
  if (orden >= 2) return 2;
  return 1;
}

/** Calcula el día del programa a partir de la fecha de inicio */
export function calcularDiaPrograma(fechaInicio: string): number {
  const inicio = new Date(fechaInicio);
  const hoy = new Date();
  const diff = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(90, Math.max(1, diff + 1));
}

/** Retorna clases de estilo para el estado del pilar */
export function colorEstadoPilar(
  estado: 'completado' | 'en_progreso' | 'bloqueado',
): string {
  switch (estado) {
    case 'completado':
      return 'border-l-[3px] border-l-success bg-panel border border-[rgba(232,150,46,0.12)]';
    case 'en_progreso':
      return 'border-l-[3px] border-l-gold bg-panel border border-[rgba(232,150,46,0.12)]';
    case 'bloqueado':
      return 'opacity-40 cursor-not-allowed bg-panel border border-[rgba(232,150,46,0.1)]';
  }
}

/** Agrupa los pilares por fase para la vista del roadmap */
export interface GrupoFase {
  fase: number;
  titulo: string;
  subtitulo: string;
  metodo_letra?: string;
  dias: string;
  pilares: RoadmapPilar[];
}

export const FASES_ROADMAP: Omit<GrupoFase, 'pilares'>[] = [
  { fase: 0, titulo: 'Fase 0 — Onboarding',         subtitulo: 'Tu punto de partida real',                       dias: 'Día 1' },
  { fase: 1, titulo: 'Fase 1 — Sanar el Dinero',    subtitulo: 'El protocolo que destraba tu precio',            dias: 'Días 2–7',   metodo_letra: 'C·L' },
  { fase: 2, titulo: 'Fase 2 — Tu Protocolo',       subtitulo: 'Método con nombre + oferta lista',               dias: 'Días 8–14',  metodo_letra: 'I·N' },
  { fase: 3, titulo: 'Fase 3 — Captación y Ventas', subtitulo: 'El sistema que atrae, filtra, agenda y cierra',  dias: 'Días 15–45', metodo_letra: 'I·C' },
  { fase: 4, titulo: 'Fase 4 — Servicio y Escala',  subtitulo: 'Cobrar, entregar y llegar a 10 · puerta a MCD',  dias: 'Días 43–90', metodo_letra: 'A' },
];

// Aliases de compatibilidad (NO remover: los importan otras pantallas)
export const SEED_ROADMAP_V3 = SEED_ROADMAP_V8;
export const SEED_ROADMAP_V2 = SEED_ROADMAP_V8;
