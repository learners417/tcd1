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
    mentor_pregunta: '¿Qué versión de vos se termina hoy?',
    metas: [
      {
        codigo: 'P0.0',
        titulo: 'Bienvenida: de profesional a director',
        descripcion: 'Mirá el video de Javo (5 min): qué vas a lograr en 90 días, cómo funciona tu app, las 4 fases y los cinturones. De regalo de bienvenida recibís el libro "Sanadores Libres" (PDF) — la filosofía completa detrás de tu camino. Si el video todavía no está disponible, tu Coach te lo cuenta en 5 minutos.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '5 min',
        orden: 1,
        dia_asignado: 1,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P0_0',
        coach_instruccion: 'MODO VIDEO-FALLBACK: si el video no está disponible, contale en 5 min: (1) la promesa — 10 pacientes de tu precio digno en 90 días y el SISTEMA para repetirlo; (2) las 4 fases — Sanar el Dinero, Tu Protocolo, Captación y Ventas, Servicio y Escala; (3) los cinturones — se ganan por hitos REALES verificados, como una planta que crece de semilla a árbol; (4) la regla — una tarea por día, 45-60 min; (5) el requisito — presupuesto de publicidad de ~$400-700 en los 90 días, que se autofinancia desde tu primera venta. Entregale el libro Sanadores Libres.',
      },
      {
        codigo: 'P0.2',
        titulo: 'Tu Foto de Partida',
        descripcion: 'Completá tu radiografía honesta: cuánto facturás hoy, cuántas horas trabajás, y tu precio por hora real (PHR). Esta foto queda guardada — al día 45 la app te la muestra al lado de tu nueva realidad.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '15 min',
        orden: 2,
        dia_asignado: 1,
        herramienta_id: 'H-P0.2',
        usa_ia: true,
        adn_field: 'adn_autoevaluacion_dia1',
      },
      {
        codigo: 'P0.4',
        titulo: 'Cómo usar tu app + el pacto',
        descripcion: 'Mirá el video operativo (5 min): la Hoja de Ruta, tus Entrenadores IA, el Diario, y cómo se ganan los cinturones. Cierra con el pacto: 1 hora por día, 90 días — con reglas claras: 1 pausa de hasta 14 días si la vida lo exige; pasado el día 90, extensión de $200 por 30 días más. El reloj es parte del método. Al terminar: Cinturón Blanco y se abre la Fase 1.',
        tipo: 'VIDEO',
        es_estrella: true,
        tiempo_estimado: '5 min',
        orden: 3,
        dia_asignado: 1,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P0_4',
        coach_instruccion: 'MODO VIDEO-FALLBACK: explicá la app en 5 min — la Hoja de Ruta muestra UNA tarea por día; los Entrenadores se desbloquean con cada cinturón; los hitos grandes piden comprobante real (screenshot/pago). Las reglas del reloj: 90 días reales, 1 pausa de hasta 14 días con motivo, extensión de $200/30 días después del día 90. Cerrá con el pacto: 1 hora por día. Pedile que lo escriba con sus palabras.',
      },
    ],
  },

  // ═══ FASE 1 · SANAR EL DINERO ═══
  {
    id: 'P1',
    numero_orden: 1,
    titulo: 'Sanar el Dinero',
    subtitulo: 'El protocolo de 7 días que destraba tu precio',
    color: '#F5A623',
    numero: 1,
    icon: 'HeartHandshake',
    emoji: '💛',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P0',
    fase: 1,
    dias_inicio: 2,
    dias_fin: 7,
    metodo_letra: 'C·L',
    cinturon_otorga: 'amarillo',
    hito_mensaje: '🥋 Cinturón AMARILLO — la raíz está en la tierra. Sanaste tu relación con el dinero y tenés TU número.',
    hito_tipo: 'milestone',
    mentor_pregunta: 'Si tu hijo hiciera tu trabajo, ¿le dejarías cobrar lo que vos cobrabas?',
    metas: [
      {
        codigo: 'P1.1',
        titulo: 'Por qué el dinero se sana primero',
        descripcion: 'Mirá el video de Javo (6 min): ningún sistema de ventas funciona sobre una relación rota con el dinero. La historia del mártir que cobra poco "por vocación" — y por qué ese ya no vas a ser vos. Si el video no está aún, tu Coach te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '6 min',
        orden: 1,
        dia_asignado: 2,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P1_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: contá la tesis en 5 min — el mártir del libro Sanadores Libres: el profesional brillante que cobra poco "por vocación" y termina fundido, sin tiempo y resentido. La ciencia: los money scripts (Klontz) se heredan y operan solos; el cuerpo los guarda (van der Kolk). Por eso esta semana trabajamos el dinero ANTES que el marketing: un sistema perfecto sobre una creencia rota produce autosabotaje. Los próximos 6 días: radiografía, lealtad, quema, cuerpo, EL NÚMERO, creencia nueva.',
      },
      {
        codigo: 'P1.2',
        titulo: 'Día 1-2 · Tu radiografía emocional',
        descripcion: 'Abrí el chat con tu Coach y hacé el primer trabajo: decí tu precio actual en voz alta, registrá qué sentís, y rastreá de dónde viene esa incomodidad. Vas a salir con TU creencia raíz identificada en una frase — y una imagen generada por IA de esa "voz heredada", para verla afuera tuyo por primera vez.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '25 min',
        orden: 2,
        dia_asignado: 2,
        usa_ia: false,
        checklist: [
          'Abrí el chat con el Coach y decile: "vengo a hacer la radiografía del dinero"',
          'Decí tu precio actual en voz alta y contale qué sentiste',
          'Completá las 4 frases: "El dinero es…", "La gente rica es…", "Cobrar caro a un paciente es…", "Si gano mucho, mi familia…"',
          'Cerrá con tu creencia raíz escrita en UNA frase',
        ],
        coach_instruccion: 'Guiá la radiografía del dinero con los money scripts de Klontz (nombrá la ciencia: esto es psicología financiera, no autoayuda). Pedile que diga su precio actual en voz alta y describa qué siente en el cuerpo. Aplicá el test de las 4 frases (el dinero es… / la gente rica es… / cobrar caro es… / si gano mucho, mi familia…). Sus respuestas SON sus scripts: devolvéselos nombrados. Cerrá identificando LA creencia raíz en una frase textual. Ofrecé generar la imagen de esa "voz heredada" con la herramienta de imágenes.',
      },
      {
        codigo: 'P1.2b',
        titulo: 'Día 3 · La lealtad invisible',
        descripcion: 'Con tu Coach: si prosperás de verdad, ¿a quién sentís que traicionás? El ejercicio del linaje — 3 generaciones y su relación con el dinero. La lealtad invisible a la familia, al gremio, al "sanador pobre pero noble". Verla es el 80% de soltarla. Salís con tu frase ancla: "Honro tu historia Y elijo distinto."',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '20 min',
        orden: 3,
        dia_asignado: 3,
        usa_ia: false,
        checklist: [
          'Escribí los nombres de 3 generaciones de tu familia',
          'Al lado de cada uno: su relación con el dinero en una frase',
          'Encontrá el patrón con el Coach: ¿a quién le sos fiel siendo pobre?',
          'Escribí tu frase ancla: "Honro tu historia Y elijo distinto"',
        ],
        coach_instruccion: 'Explorá la lealtad invisible con el ejercicio del linaje (presentalo como marco simbólico de las lealtades familiares — no como ciencia; su poder es de sentido, y eso se dice honesto). 3 generaciones, la relación de cada una con el dinero. El patrón salta solo. Preguntá: ¿esa fidelidad es amor, o miedo disfrazado de amor? ¿Esa persona querría que vivas ajustado? Cerrá con la frase ancla escrita: "Honro tu historia Y elijo distinto" — se guarda y vuelve en los momentos de resistencia.',
      },
      {
        codigo: 'P1.3',
        titulo: 'Día 4 · La quema',
        descripcion: 'El ritual que marca el quiebre. Escribí en papel la creencia heredada que ya no querés cargar, leela una última vez, y quemala físicamente. Subí la foto de las cenizas — queda en tu línea de tiempo. Al completarla ganás la punta amarilla: la semilla se abre.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '20 min',
        orden: 4,
        dia_asignado: 4,
        usa_ia: false,
        checklist: [
          'Escribí tu creencia raíz en un papel, a mano',
          'Leela en voz alta una última vez',
          'Quemala (con cuidado y en lugar seguro)',
          'Sacá foto de las cenizas y subila — queda en tu historia',
          'Contale al Coach qué sentiste al verla arder',
        ],
        // CAPA 3: completar esta tarea otorga 'blanco_punta_amarilla' vía hitos_cinturon
        coach_instruccion: 'Guiá el ritual de la quema. Presentalo honesto: es un RITUAL — y los rituales funcionan; la neurociencia lo respalda (acto motor + emoción + testigo consolida la reconsolidación de memoria mejor que el pensamiento solo). Que escriba la creencia a mano, la lea en voz alta una última vez, y la queme. Pedile la foto de las cenizas. Validá la emoción sin apurarla. Cerrá: esa creencia era prestada, nunca fue tuya. Celebrá la punta amarilla: la semilla se abre.',
      },
      {
        codigo: 'P1.4',
        titulo: 'Día 5 · El dinero en el cuerpo',
        descripcion: 'Trabajo somático breve con tu Coach: escaneo corporal guiado, encontrá dónde se aloja la tensión cuando pensás en cobrar, y soltala con respiración 4-7-8. Registrás tu nivel de tensión antes y después (1-10). Para que el precio nuevo no sea solo mental.',
        tipo: 'COACH',
        es_estrella: false,
        tiempo_estimado: '15 min',
        orden: 5,
        dia_asignado: 5,
        usa_ia: false,
        coach_instruccion: 'Trabajo somático (nombrá la ciencia: van der Kolk, el cuerpo lleva la cuenta). Escaneo corporal guiado paso a paso: ojos cerrados, imagina cobrando su precio nuevo a un paciente real, registra dónde aparece tensión (1-10). Respiración 4-7-8 (práctica yóguica, declarada como práctica) tres veces sobre esa zona. Repetir la escena. Registrar el después (1-10). Preguntá: ¿qué cambió?',
      },
      {
        codigo: 'P1.5',
        titulo: 'Día 6 · EL NÚMERO — tu precio justo',
        descripcion: 'El momento central de la fase. La calculadora inversa te muestra: $10.000 ÷ 10 pacientes = $1.000 — el número no sale de tu miedo, sale de tu meta. Con tu Coach lo hacés TUYO: un número concreto, dicho en voz alta 3 veces sin disculparte (la tercera, grabándote un audio a vos mismo). El Coach no aprueba precios-disculpa.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '30 min',
        orden: 6,
        dia_asignado: 6,
        usa_ia: false,
        checklist: [
          'Traé tu PHR de la Foto de Partida',
          'Hacé la calculadora inversa con el Coach: de la meta al número',
          'Proponé TU número (concreto, no un rango)',
          'Decilo en voz alta 3 veces — la tercera, grabate un audio de WhatsApp a vos mismo',
        ],
        coach_instruccion: 'Ayudale a definir SU NÚMERO. La calculadora inversa primero: $10.000 ÷ 10 = $1.000 — el ancla viene de la meta, no del miedo (Kahneman: anclaje). Partí de su PHR y el valor de la transformación. Exigí un número concreto. Si propone un precio-disculpa, devolvelo: ¿ese precio refleja el valor o el miedo? Recordale su frase ancla del Día 3. El ejercicio de las 3 veces en voz alta (la tercera grabada en audio). Cierre filosófico (declarado como filosofía): el dinero es neutro — el significado se lo pusiste vos, y hoy elegís el significado. No apruebes hasta que lo diga sin disculparse.',
      },
      {
        codigo: 'P1.6',
        titulo: 'Día 7 · Tu creencia nueva',
        descripcion: 'Cerrás el protocolo instalando la creencia elegida por vos: tu nueva frase sobre el dinero, en presente y con tus palabras. La IA te genera tu ESTANDARTE — una imagen-símbolo con tu frase, que se vuelve la pantalla de tu cinturón. Al completarla: Cinturón AMARILLO — la raíz está en la tierra. Y aparece por primera vez el Mentor.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '15 min',
        orden: 7,
        dia_asignado: 7,
        usa_ia: false,
        coach_instruccion: 'Cierre del protocolo: que formule su creencia nueva en una frase propia, en presente y primera persona. Que la escriba. Generale el ESTANDARTE con la herramienta de imágenes: una imagen-símbolo con su frase (estética: fondo oscuro, dorado, sobrio). Recordale: cada vez que dude del precio, vuelve a esta frase y esta imagen. Celebrá el Cinturón Amarillo: la raíz está en la tierra. Anunciá que el Mentor lo espera con una pregunta.',
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
    dias_inicio: 8,
    dias_fin: 11,
    metodo_letra: 'I',
    cinturon_otorga: 'amarillo_punta_verde',
    hito_mensaje: '🥋 Amarillo punta VERDE — el primer brote asoma. Tu método ya tiene nombre y estructura.',
    hito_tipo: 'checkpoint',
    mentor_pregunta: '¿Tu método existía antes de que lo nombraras — o recién ahora que tiene nombre te animás a verlo?',
    metas: [
      {
        codigo: 'P2.1',
        titulo: 'Tu método propio: el activo que te diferencia',
        descripcion: 'Mirá el video (6 min): por qué un método con nombre vale más que mil servicios sueltos, y cómo se poda: UNA transformación, UN protocolo, UN precio. Aplica igual si atendés pacientes o formás estudiantes. Si el video no está, tu Coach te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '6 min',
        orden: 1,
        dia_asignado: 8,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P2_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: contá en 5 min — el profesional promedio vende horas sueltas (commodity, se compara por precio); el director vende UN método con nombre propio (activo, se compara por resultado). La poda: una transformación, un protocolo de 3-7 pasos, un precio. Su método YA existe en lo que hace — esta semana lo documentamos, lo nombramos y lo empaquetamos.',
      },
      {
        codigo: 'P2.2',
        titulo: 'Documentá tu proceso + arrancá tu cuenta Meta',
        descripcion: 'Dos cosas hoy. (1) Completá la herramienta con lo que YA hacés con cada paciente (o estudiante), paso a paso. (2) EN PARALELO, 15 min con Sofi: creá tu página de Facebook y tu Business Manager HOY — Meta tarda semanas en confiar en cuentas nuevas, y tu campaña del día 22 necesita una cuenta con historial. Empezar hoy es lo que separa un plan serio de uno de humo.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '30 + 15 min',
        orden: 2,
        dia_asignado: 8,
        herramienta_id: 'H-P7.2',
        usa_ia: false,
        adn_field: 'adn_proceso_actual',
        entrenador: 'sofi',
        checklist: [
          'Completá la herramienta: tu proceso paso a paso (primer contacto → sesiones → cierre → resultado)',
          'Con Sofi: creá tu página de Facebook profesional (10 min, si no tenés)',
          'Con Sofi: creá tu Business Manager en business.facebook.com y vinculá la página',
          'Opcional pero recomendado: boosteá una publicación tuya a $1/día — tu cuenta empieza a ganar historial HOY',
        ],
      },
      {
        codigo: 'P2.3',
        titulo: 'Tu avatar: los 3 mejores que tuviste',
        descripcion: 'Elegí los 3 mejores pacientes (o estudiantes) que pasaron por vos y completá la herramienta. Extrae el patrón: quién es tu persona ideal, qué le duele, qué compró de verdad. ¿No tenés 3 pacientes todavía? Usá 3 personas cercanas que tengan el problema que resolvés — o tu propia historia: vos fuiste tu primer caso.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '25 min',
        orden: 3,
        dia_asignado: 9,
        herramienta_id: 'H-P4.2',
        usa_ia: true,
        adn_field: 'adn_avatar',
      },
      {
        codigo: 'P2.4',
        titulo: 'Generá tu método: nombre + pasos',
        descripcion: 'La herramienta usa tu proceso documentado + tu avatar y genera: 5 opciones de nombre propio (elegís una), tu protocolo estructurado en 3 a 7 pasos claros, y tu línea de posicionamiento (una frase que dice a quién servís y qué transformás). Acá nace tu activo.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '25 min',
        orden: 4,
        dia_asignado: 10,
        herramienta_id: 'H-P7.3',
        usa_ia: true,
        adn_field: 'metodo_nombre',
        requiere_datos_de: ['P2.2', 'P2.3'],
        entrenador: 'diego',
      },
      {
        codigo: 'P2.5',
        titulo: 'Validá el nombre con tu Coach',
        descripcion: 'Contale a tu Coach el nombre elegido. La prueba de fuego: ¿evoca el RESULTADO que logra tu paciente, o describe tu proceso técnico? El nombre tiene que prometer el destino. Al aprobar: Amarillo punta verde — el primer brote asoma.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '10 min',
        orden: 5,
        dia_asignado: 11,
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
    dias_inicio: 12,
    dias_fin: 14,
    metodo_letra: 'N',
    cinturon_otorga: 'verde',
    hito_mensaje: '🥋 Cinturón VERDE — la planta crece. Tu oferta está completa y tu precio en pie.',
    hito_tipo: 'milestone',
    mentor_pregunta: '¿Qué cuesta más: sostener este precio, o sostener otra década del precio viejo?',
    metas: [
      {
        codigo: 'P3.1',
        titulo: 'La oferta que se vende sola',
        descripcion: 'Mirá el video (7 min): la ecuación de valor — resultado soñado × probabilidad, dividido demora × esfuerzo. Por qué tu oferta debe prometer transformación, no sesiones. Y la garantía como permiso para confiar. Si el video no está, tu Coach te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '7 min',
        orden: 1,
        dia_asignado: 12,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P3_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: la ecuación de valor de Hormozi en 5 min — valor = (resultado soñado × probabilidad percibida) ÷ (demora × esfuerzo). Su oferta debe subir los dos de arriba (transformación concreta + prueba) y bajar los dos de abajo (resultados visibles rápido + método que acompaña). Nadie compra sesiones: compran el después. Y la garantía no es riesgo — es el permiso que el paciente necesita para confiar.',
      },
      {
        codigo: 'P3.2',
        titulo: 'Diseñá tu oferta principal',
        descripcion: 'La herramienta arma tu oferta completa sobre tu método: qué transformación promete, qué incluye, cuánto dura, tu precio (el número del Día 6) y tu garantía. Todo en una página lista para presentar. Vera, tu entrenadora de precio, te ayuda si dudás.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '35 min',
        orden: 2,
        dia_asignado: 12,
        herramienta_id: 'H-P8.3',
        usa_ia: true,
        adn_field: 'adn_oferta_mid',
        requiere_datos_de: ['P2.4'],
        entrenador: 'vera',
      },
      {
        codigo: 'P3.3',
        titulo: 'Defendé tu precio (roleplay)',
        descripcion: 'Practicá con tu Coach: te va a decir "es caro", "lo tengo que pensar", "¿hay descuento?" — como un prospecto real. Repetí hasta defender tu precio 3 veces seguidas sin disculparte. Vera es tu entrenadora especialista si querés más práctica.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '20 min',
        orden: 3,
        dia_asignado: 13,
        usa_ia: false,
        entrenador: 'vera',
        checklist: [
          'Abrí el chat y pedí el roleplay de defensa de precio',
          'Superá la objeción "es caro" sin bajar el precio',
          'Superá "lo tengo que pensar" con una pregunta, no con presión',
          'Superá "¿hay descuento?" sin ceder — 3 seguidas y pasás',
        ],
        coach_instruccion: 'Roleplay de defensa de precio: hacé de prospecto que objeta "es caro" / "lo tengo que pensar" / "¿hay descuento?". Evaluá si defiende con seguridad o se disculpa. Si aparece el precio-disculpa, recordale su creencia nueva del Día 7 y su estandarte. Repetir hasta que defienda con calma 3 objeciones seguidas.',
      },
      {
        codigo: 'P3.4',
        titulo: 'Aprobación final de tu oferta',
        descripcion: 'Presentale a tu Coach la oferta entera: transformación + qué incluye + precio + garantía. Si los 4 elementos están sólidos, ganás el Cinturón VERDE — la planta crece. Y se abre la Fase 3: salir a captar.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '15 min',
        orden: 4,
        dia_asignado: 14,
        usa_ia: false,
        coach_instruccion: 'Auditá la oferta final contra 4 criterios: (1) promete una transformación concreta, no sesiones; (2) el contenido es claro; (3) el precio es el número digno del Día 6, sin rebajas de miedo; (4) la garantía es real y específica. Solo si los 4 pasan, aprobá y otorgá el Cinturón Verde.',
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
    dias_inicio: 15,
    dias_fin: 22,
    metodo_letra: 'I',
    cinturon_otorga: 'verde_punta_azul',
    hito_mensaje: '🥋 Verde punta AZUL — la planta se estira al cielo. Tu campaña está ENCENDIDA y tu agente responde solo: empiezan a entrar interesados.',
    hito_tipo: 'urgent',
    mentor_pregunta: 'La campaña ya corre sin vos. ¿Qué vas a hacer con el tiempo que antes usabas para perseguir pacientes?',
    metas: [
      {
        codigo: 'P4.1',
        titulo: 'El embudo completo, sin humo',
        descripcion: 'Mirá el video (8 min): el circuito real — anuncio → WhatsApp → tu agente de IA filtra → calendario → llamada → venta. Qué hace cada pieza y por qué el filtro automático es lo que te salva: el 55% de los interesados escribe fuera de horario, y el 78% le compra al primero que responde. Si el video no está, tu Coach te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '8 min',
        orden: 1,
        dia_asignado: 15,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P9A_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: el circuito en 5 min — anuncio en Meta → clic abre WhatsApp → tu agente de IA (Meta Business Agent, nativo y gratis) responde al instante 24/7, hace las preguntas de filtro y agenda SOLO a los calificados → llamada → venta. Los datos: 55% de los leads llegan fuera de horario; 78% compra al primero que responde; responder en <5 min multiplica x21. Por eso el agente no es un lujo: ES el sistema. Los que hoy no califican van a tu Sala de Espera (canal) — nadie se pierde.',
      },
      {
        codigo: 'P4.5',
        titulo: 'Montá tu sistema: agente IA + agenda + cobro',
        descripcion: 'El día grande de infraestructura. Activás tu Meta Business Agent (el empleado digital de tu WhatsApp — gratis, nativo), lo entrenás con el documento que tu Coach te genera con TU oferta y TUS preguntas de filtro, montás tu agenda, tu medio de cobro probado, y tu Sala de Espera. Sofi te acompaña pieza por pieza.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '75 min',
        orden: 2,
        dia_asignado: 15,
        usa_ia: false,
        entrenador: 'sofi',
        checklist: [
          'Instalá WhatsApp Business (o convertí tu número actual — los chats se conservan; si preferís separar trabajo de vida personal, usá un número nuevo)',
          'Activá tu agente: Herramientas → Meta Business Agent (5 min de configuración)',
          'Pedile a tu Coach el DOCUMENTO DE ENTRENAMIENTO de tu agente (lo genera con tu oferta, tu avatar y tus 3 preguntas de filtro) — copialo, guardalo como PDF (Imprimir → Guardar como PDF) y subíselo al agente',
          'Configurá el agente: responde SOLO a clientes que llegan de anuncios · tono cálido y profesional · las conversaciones clínicas te las deriva a vos SIEMPRE',
          'Probalo: escribile desde el teléfono de alguien cercano como si fueras paciente',
          'Creá tu link de agenda (Calendly gratis o similar) con 3+ horarios esta semana',
          'Elegí tu medio de cobro según tu país (México/Argentina: MercadoPago · Colombia: Nequi/Bancolombia · Ecuador: Payphone · otros: PayPal) y PROBALO cobrándote $1 hoy',
          'Creá tu canal de WhatsApp "Sala de Espera" — ahí van los que hoy no califican: 1 mensaje semanal de valor, nadie se pierde',
          'PLAN B si el agente todavía no te aparece (Meta lo libera de a poco): mensaje de bienvenida con tus 3 preguntas + revisás 2 veces por día + pedí acceso desde la app de WhatsApp',
        ],
        coach_instruccion: 'Si te pide el DOCUMENTO DE ENTRENAMIENTO de su agente: generáselo COMPLETO y listo para copiar, con este formato: (1) QUIÉN SOY — nombre, profesión y su línea de posicionamiento; (2) MI OFERTA — la transformación, qué incluye, duración, precio y garantía (de su adn_oferta_mid); (3) A QUIÉN SIRVO — su avatar (dolores y señales de su persona ideal); (4) LAS 3 PREGUNTAS DE CALIFICACIÓN con redacción exacta — dolor ("¿qué te está pasando?"), urgencia ("¿hace cuánto lo venís cargando?"), capacidad ("el programa es una inversión de $[precio] — si vemos que es para vos, ¿estás en condiciones de tomarla?"); (5) QUÉ HACER — a los calificados: ofrecerles el link de agenda; a los no calificados: invitarlos con calidez al canal Sala de Espera; (6) REGLAS — tono cálido y profesional, jamás dar consejos clínicos ni discutir tratamientos: toda conversación clínica se deriva al humano. Después verificá el sistema pieza por pieza: (1) Meta Business Agent activo Y entrenado con el documento (preguntale qué respondió el agente en la prueba); (2) regla de privacidad configurada — el agente filtra y agenda, las conversaciones clínicas las deriva al humano SIEMPRE (son profesionales de salud: esto no es negociable); (3) agenda con 3+ horarios; (4) prueba de cobro de $1 acreditada; (5) canal Sala de Espera creado. Si el agente no le aparece aún (rollout gradual), activá el Plan B sin drama: bienvenida con las 3 preguntas + 2 revisiones diarias. No apruebes hasta que las piezas estén operativas.',
      },
      {
        codigo: 'P4.2',
        titulo: 'El mensaje que atrae a TU avatar',
        descripcion: 'Generá con la herramienta el copy de tu página y tus anuncios: el mensaje que hace que tu persona ideal se detenga, se reconozca en el dolor y quiera hablar con vos. Usa tu avatar y tu oferta ya definidos.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '30 min',
        orden: 3,
        dia_asignado: 16,
        herramienta_id: 'H-P9A.2',
        usa_ia: true,
        adn_field: 'adn_landing_copy',
        requiere_datos_de: ['P3.2'],
        entrenador: 'mateo',
      },
      {
        codigo: 'P4.3',
        titulo: 'Grabá 3 piezas y validalas con datos REALES',
        descripcion: 'Regla de Javo: "No corro publicidad sin validar. Perdí $150.000 por esto." Pero con una cuenta chica, el orgánico solo no alcanza como señal — así que validamos con datos pagados y baratos: publicás las 3 piezas orgánico (gratis, construye tu perfil) Y las corrés como 3 anuncios de $2/día durante 5 días. El algoritmo de Meta te dice cuál GANA con números reales, no con corazonadas. Mateo te arma los guiones; Caro te enseña a grabar.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '5 días (en paralelo)',
        orden: 4,
        dia_asignado: 17,
        herramienta_id: 'H-P9A.4',
        usa_ia: true,
        adn_field: 'adn_validacion_organica',
        entrenador: 'mateo',
        checklist: [
          'Pedile a Mateo 3 guiones cortos basados en tu copy (dolor · autoridad · resultado)',
          'Antes de grabar, 10 min con Caro: encuadre, luz y presencia (si te da vergüenza: primero audio, después cámara sin publicar, después publicás — 3 escalones)',
          'Grabá las 3 piezas (cortas: 30-60 segundos cada una)',
          'Publicalas orgánico en tu red principal (gratis, suma siempre)',
          'Con Sofi: subí las 3 como anuncios — $2/día cada uno, 5 días (~$30 total)',
          'Al día 5: la de menor costo por conversación GANA — esa es tu campeona',
        ],
      },
      {
        codigo: 'P4.4',
        titulo: '◆ ESCALÁ LA GANADORA — tu campaña real',
        descripcion: 'El momento que cambia todo. Apagás las 2 perdedoras y tu pieza CAMPEONA sube a $5-8/día como campaña a WhatsApp — donde tu agente ya espera para filtrar y agendar. Subí el screenshot de la campaña activa — un Entrenador lo verifica y ganás Verde punta azul: la planta se estira al cielo.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '30 min',
        orden: 5,
        dia_asignado: 22,
        usa_ia: false,
        entrenador: 'sofi',
        checklist: [
          'Apagá los 2 anuncios perdedores (sin culpa: pagaste $20 por saber la verdad)',
          'Duplicá la ganadora como campaña "Interacción → WhatsApp" a $5-8/día',
          'Verificá el circuito completo: clic → tu WhatsApp → el agente responde y filtra → agenda',
          'Regla de oro: NO toques la campaña por 72 hs (fase de aprendizaje de Meta — cambiarla la resetea)',
          'Sacá screenshot donde se vea el estado ACTIVO y el presupuesto — subilo acá',
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
    dias_inicio: 23,
    dias_fin: 45,
    metodo_letra: 'C',
    cinturon_otorga: 'azul',
    hito_mensaje: '🥋 Cinturón AZUL — alcanzaste el cielo. Hiciste tu primera llamada de venta real. Lo que sigue es repetir.',
    hito_tipo: 'milestone',
    mentor_pregunta: '¿Qué escuchaste en esa llamada que ningún curso te podía enseñar?',
    metas: [
      {
        codigo: 'P5.1',
        titulo: 'Anatomía de la llamada que cierra',
        descripcion: 'Mirá el video (8 min): la estructura de la llamada — Apertura, Dolor, Cielo, Obstáculos, Cierre (la W). Por qué el que pregunta dirige. Cómo presentar el precio sin que tiemble la voz. Y la regla del decisor: si la decisión la comparte con alguien, ese alguien tiene que estar en la llamada. Si el video no está, tu Coach te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '8 min',
        orden: 1,
        dia_asignado: 23,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P9B_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: la W en 5 min — (1) Apertura: preguntas, el que pregunta dirige; (2) Dolor: profundizar hasta lo que le cuesta de verdad; (3) Cielo: que él mismo describa su después; (4) Obstáculos: sacarlos ANTES del precio — y el más letal es el decisor ausente ("lo hablo con mi pareja" = llamada perdida; el decisor se invita ANTES); (5) Cierre: el precio con calma, silencio, y la pregunta de decisión. Vender es ayudar a decidir, no convencer.',
      },
      {
        codigo: 'P5.2',
        titulo: 'Tu script de ventas propio',
        descripcion: 'Generá tu guion personalizado con la estructura de la W: las preguntas de apertura, cómo profundizar el dolor, cómo pintar el después, el manejo del decisor, y tu cierre natural — con tu oferta y tu precio ya integrados. Y un plus: Bruno, tu entrenador de mensajes, te enseña a manejar los WhatsApp que ya están llegando (subile un screenshot de una conversación real).',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '25 min',
        orden: 2,
        dia_asignado: 23,
        herramienta_id: 'H-P9B.2',
        usa_ia: true,
        adn_field: 'adn_script_ventas',
        requiere_datos_de: ['P3.2'],
        entrenador: 'bruno',
      },
      {
        codigo: 'P5.3',
        titulo: 'Roleplay: practicá antes de la real',
        descripcion: 'Tu Coach hace de prospecto difícil: objeta, duda, compara, y te tira las reales — "es caro", "lo hablo con mi pareja", "lo tengo que pensar". Practicá el guion completo hasta que fluya. Nadie entra al ring sin sparring. Lucas, tu entrenador de ventas, está para las rondas extra.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '30 min',
        orden: 3,
        dia_asignado: 25,
        usa_ia: false,
        entrenador: 'lucas',
        checklist: [
          'Pedí el roleplay completo con tu script en mano',
          'Completá la llamada entera: apertura → dolor → cielo → obstáculos → precio → cierre',
          'Superá las 3 objeciones reales: "es caro" · "lo hablo con mi pareja" · "lo tengo que pensar"',
          'Recibí las 2 mejoras del Coach, anotalas, y repetí una segunda simulación',
        ],
        coach_instruccion: 'Roleplay completo con SU script y la estructura W (Apertura-Dolor-Cielo-Obstáculos-Cierre). Hacé de prospecto realista con el banco de objeciones REALES: "es caro" (defensa sin disculpa), "lo hablo con mi pareja" (el decisor — enseñale a invitarlo a una próxima llamada con ambos, no a perseguir), "lo tengo que pensar" (pregunta que destapa la objeción real detrás). Evaluá apertura, manejo del dolor, presentación de precio con silencio posterior, y cierre. Dale 2 mejoras concretas. Repetir hasta una simulación sólida.',
      },
      {
        codigo: 'P5.4',
        titulo: '◆ TU PRIMERA LLAMADA REAL',
        descripcion: 'Atendé a tu primer prospecto real del sistema. No importa si no cierra — importa que la hiciste. Subí el screenshot del Meet/Zoom (podés tapar el nombre) y hacé el debrief con tu Coach. Ganás el Cinturón AZUL: alcanzaste el cielo.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '60 min',
        orden: 4,
        dia_asignado: 28,
        usa_ia: false,
        entrenador: 'lucas',
        checklist: [
          'Confirmale la cita al prospecto el mismo día (sube la asistencia del 50% al 70%)',
          'Si mencionó pareja/socio en el filtro: invitá al decisor a la llamada',
          'Tené tu script a mano (impreso o segunda pantalla)',
          'Hacé la llamada — presencia, preguntas, calma en el precio',
          'Sacá screenshot de la videollamada (tapá el nombre si querés)',
          'Subí el screenshot y hacé el debrief con tu Coach',
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
    dias_inicio: 29,
    dias_fin: 55,
    metodo_letra: 'C',
    cinturon_otorga: 'rojo',
    hito_mensaje: '🥋 Cinturón ROJO — el fruto maduró. Cobraste tu primer paciente por el sistema. El mártir quedó atrás.',
    hito_tipo: 'milestone',
    mentor_pregunta: '¿Quién sos ahora que ya no podés decir que no se puede?',
    metas: [
      {
        codigo: 'P6.1',
        titulo: 'Entregar sin quemarte',
        descripcion: 'Mirá el video (7 min): el protocolo de entrega — qué recibe tu paciente en las primeras 24 hs, cómo se organiza el seguimiento, qué se automatiza y qué se mantiene humano. Acá nace tu MiClínica Digital. Si el video no está, tu Coach te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '7 min',
        orden: 1,
        dia_asignado: 30,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P9C_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: en 5 min — el error clásico es vender bien y entregar caótico (el paciente paga $1.000 y recibe silencio 3 días). El protocolo: (1) primeras 24 hs — bienvenida + primer paso concreto; (2) la primera sesión agendada YA en el momento del pago; (3) recordatorios y seguimiento con estructura (qué es automático, qué es humano); (4) el cierre del protocolo con medición del resultado. Todo esto después vive en MiClínica Digital — tu app operativa. Hoy lo documenta para tenerlo listo.',
      },
      {
        codigo: 'P6.2',
        titulo: 'Tu protocolo de entrega',
        descripcion: 'Documentá cómo entregás tu método: bienvenida, primera sesión, recordatorios, seguimiento entre sesiones, cierre. Queda estructurado y listo para cargarse en tu sistema operativo (MCD) cuando lo instales.',
        tipo: 'HERRAMIENTA',
        es_estrella: true,
        tiempo_estimado: '30 min',
        orden: 2,
        dia_asignado: 31,
        herramienta_id: 'H-P9C.2',
        usa_ia: true,
        adn_field: 'adn_protocolo_entrega',
        requiere_datos_de: ['P2.4'],
      },
      {
        codigo: 'P6.3',
        titulo: '◆ TU PRIMER PAGO',
        descripcion: 'Alguien dijo que sí y pagó tu precio digno. Subí el comprobante (captura de transferencia, recibo de pasarela, o foto del efectivo — podés tapar datos sensibles). Tu Entrenador lo verifica y ganás el Cinturón ROJO: el fruto maduró. Este es el final del mártir.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '15 min',
        orden: 3,
        dia_asignado: 38,
        usa_ia: false,
        checklist: [
          'Cerraste la venta: enviá el link/datos de cobro EN la llamada o apenas termina',
          'Confirmá que el dinero se acreditó (no "me dijo que paga")',
          'Sacá captura del comprobante (tapá datos sensibles si querés)',
          'Subilo y celebrá con tu Coach — este momento es LA transformación',
        ],
        coach_instruccion: 'Verificación del primer pago: pedile el comprobante (captura de transferencia, recibo, o foto del efectivo — puede tapar datos sensibles). Verificá 3 cosas: monto visible, fecha reciente, coherencia con su precio declarado en el ADN. Si dudás, marcalo para revisión del equipo. Si es válido, otorgá el Cinturón Rojo y celebrá en serio: este momento separa al que lo intentó del que lo hizo. Preguntá cómo se siente cobrar su precio digno — y recordale reinvertir: la pauta ahora puede subir a $8-12/día, se paga sola.',
      },
    ],
  },

  {
    id: 'P7',
    numero_orden: 7,
    titulo: 'De 1 a 10 · Sanador Libre',
    subtitulo: 'Repetir, medir, y que el sistema trabaje por vos',
    color: '#111827',
    numero: 7,
    icon: 'Trophy',
    emoji: '🌳',
    desbloqueo: 'completar_anterior',
    pilar_prerequisito: 'P6',
    fase: 4,
    dias_inicio: 43,
    dias_fin: 90,
    metodo_letra: 'A',
    cinturon_otorga: 'negro',
    hito_mensaje: '🥋 Cinturón NEGRO — el árbol da semillas. 10 pacientes, $10K, sistema andando. Sos un Sanador Libre. Y esto recién empieza.',
    hito_tipo: 'milestone',
    mentor_pregunta: 'El árbol ya da semillas. ¿A quién vas a enseñarle lo que aprendiste?',
    metas: [
      {
        codigo: 'P7.1',
        titulo: 'La máquina de 10 por mes',
        descripcion: 'Mirá el video (7 min): de la primera venta al sistema recurrente. Qué medir cada semana (interesados, llamadas, cierres), cuándo ajustar el anuncio, cuándo subir el presupuesto, y qué delegar primero. Si el video no está, tu Coach te lo cuenta.',
        tipo: 'VIDEO',
        es_estrella: false,
        tiempo_estimado: '7 min',
        orden: 1,
        dia_asignado: 43,
        usa_ia: false,
        video_youtube_id: 'PLACEHOLDER_P11_1',
        coach_instruccion: 'MODO VIDEO-FALLBACK: en 5 min — el sistema ya probó que funciona (hubo un pago). Ahora es un ciclo semanal: medir 4 números (interesados → agendados → llamadas → cierres), encontrar el cuello de botella, hacer UN ajuste. La pauta escala con la caja: $8-12/día tras la venta 1, $15-20 tras la 3. Cuidado con la meseta ("ya vendí 3, me relajo") y el autosabotaje cerca de la meta — son las dos resistencias clásicas de este tramo, y las vamos a nombrar cuando aparezcan.',
      },
      {
        codigo: 'P7.2',
        titulo: 'Tu revisión semanal (recurrente)',
        descripcion: 'Cada semana, 20 minutos con tu Coach: revisás tus números del embudo, detectás dónde se cae (¿pocos interesados? ¿no agendan? ¿no cierran?) y hacés UN ajuste. Repetís del paciente #2 al #10. Tu progreso se ve en el contador: X/10 pacientes.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '20 min/semana',
        orden: 2,
        dia_asignado: 45,
        usa_ia: false,
        es_recurrente: true,
        entrenador: 'lucas',
        checklist: [
          'Anotá tus números de la semana: interesados · llamadas agendadas · llamadas hechas · cierres',
          'Identificá con el Coach el cuello de botella (dónde se cae la mayoría)',
          'Definí UN solo ajuste para esta semana (no tres)',
          'Registrá cada venta nueva — el contador X/10 avanza con vos',
        ],
        coach_instruccion: 'Revisión semanal de embudo: pedile sus números (leads, agendadas, hechas, cierres). Diagnosticá el cuello: pocos leads = el anuncio; no agendan = el filtro/agente; no cierran = la llamada (derivá a Lucas para roleplay). UN solo ajuste concreto por semana. Registrá el avance hacia los 10 y celebrá cada venta. Anticipá resistencias por tramo: semana 7-8 la meseta ("¿viniste por 3 o por la libertad?"); semana 10-11 el autosabotaje cerca de la meta — nombrarlo ANTES lo desarma.',
      },
      {
        codigo: 'P7.3',
        titulo: '◆ 10 PACIENTES · SANADOR LIBRE',
        descripcion: 'La meta: 10 pacientes de tu precio digno, cobrados por tu sistema. Subí los comprobantes (o tu registro de ventas de la app) y tu Entrenador certifica tu Cinturón NEGRO. No con más horas — con mejor arquitectura. El árbol ya da semillas.',
        tipo: 'COACH',
        es_estrella: true,
        tiempo_estimado: '20 min',
        orden: 3,
        dia_asignado: 83,
        usa_ia: false,
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
  { id: 'blanco_punta_amarilla', orden: 2, nombre: 'Blanco punta amarilla', emoji: '⬜🟡', color: '#F4F4F5', color_punta: '#F5A623', metafora: 'La semilla se abre' },
  { id: 'amarillo',              orden: 3, nombre: 'Amarillo',              emoji: '🟡',   color: '#F5A623',                          metafora: 'La raíz en la tierra' },
  { id: 'amarillo_punta_verde',  orden: 4, nombre: 'Amarillo punta verde',  emoji: '🟡🟢', color: '#F5A623', color_punta: '#22C55E', metafora: 'El primer brote asoma' },
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
      return 'border-l-[3px] border-l-[#22C55E] bg-[#141414] border border-[rgba(245,166,35,0.2)]';
    case 'en_progreso':
      return 'border-l-[3px] border-l-[#F5A623] bg-[#141414] border border-[rgba(245,166,35,0.2)]';
    case 'bloqueado':
      return 'opacity-40 cursor-not-allowed bg-[#141414] border border-[rgba(245,166,35,0.1)]';
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
