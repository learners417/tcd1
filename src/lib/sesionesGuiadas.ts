/**
 * sesionesGuiadas.ts — T3 · Plan Maestro.
 * El catálogo data-driven de las sesiones convertidas: pasos interactivos
 * donde LA IA PROPONE Y EL FUNDADOR FIRMA. Chips, tarjetas, una sola pregunta
 * abierta por episodio, validación dura por paso.
 *
 * T3 cubre la SEMANA BLANCA (P0.3 · P1.2 · P1.2b · P1.3 · P1.5).
 * T4 agrega el resto del camino a este mismo catálogo — el motor no cambia.
 */

export type PasoGuiado =
  | { tipo: 'intro'; titulo: string; texto: string; nota?: string }
  | { tipo: 'opciones'; id: string; pregunta: string; opciones: string[]; multiple?: boolean; permiteOtra?: boolean }
  | { tipo: 'abierta'; id: string; pregunta: string; ayuda?: string; minChars: number; placeholder?: string }
  | { tipo: 'ia_propone'; id: string; pregunta: string; promptIA: string; nOpciones: number }
  | { tipo: 'radar'; id: string }
  | { tipo: 'ritual'; titulo: string; instrucciones: string[]; nota?: string }
  | { tipo: 'evidencia'; id: string; titulo: string; texto: string; accept: string }
  | { tipo: 'audio_futuro'; id: string }
  | { tipo: 'artefacto'; id: string; tituloArtefacto: string; promptIA: string; campoAdn: string };

export interface SesionGuiada {
  codigo: string;
  pasoEsencialIdx: number; // Modo 15 min: hasta qué paso llega el día corto
  pasos: PasoGuiado[];
}

/* ═══════════════════ LA SEMANA BLANCA ═══════════════════ */

export const SESIONES_GUIADAS: Record<string, SesionGuiada> = {
  /* ── D1 · EL BÚNKER DE LUZ ── */
  'P0.3': {
    codigo: 'P0.3',
    pasoEsencialIdx: 2,
    pasos: [
      { tipo: 'intro', titulo: 'El Búnker de Luz', texto: 'Este camino tiene noches oscuras — el día que un paciente no llega, el día que el miedo grita. Para esas noches se construye HOY tu búnker: una caja física con los objetos que te devuelven a quién eres. Tu tanque de oxígeno. Se arma antes de necesitarlo — nunca durante la tormenta.', nota: 'Busca una caja real. Cualquiera sirve: de zapatos, de madera, de lata.' },
      { tipo: 'opciones', id: 'objetos', pregunta: '¿Qué va a vivir en tu búnker? Elige lo que te carga de verdad:', opciones: ['Una foto de alguien que amo', 'Una carta o mensaje que me marcó', 'Un objeto de un logro mío', 'Algo que me regaló un paciente agradecido', 'Un símbolo de mi fe', 'Algo de alguien que ya no está'], multiple: true, permiteOtra: true },
      { tipo: 'abierta', id: 'carga', pregunta: 'De todo lo que elegiste: ¿cuál es EL objeto — el que más te carga — y qué te recuerda de ti?', ayuda: 'Puedes responder hablando: toca el micrófono y cuéntalo como se lo contarías a alguien de confianza.', minChars: 80, placeholder: 'El objeto que más me carga es…' },
      { tipo: 'evidencia', id: 'foto_bunker', titulo: 'La foto de tu búnker', texto: 'Arma la caja física AHORA — con los objetos reales adentro. Sácale una foto y súbela. Esa caja va a estar cerca tuyo los próximos 90 días.', accept: 'image/*' },
      { tipo: 'audio_futuro', id: 'msg_futuro' },
      { tipo: 'artefacto', id: 'inventario', tituloArtefacto: 'El inventario de tu Búnker', promptIA: 'Con los objetos elegidos y lo que contó sobre el que más lo carga, redacta en segunda persona (tú), cálido y breve (max 120 palabras), "El inventario de tu Búnker de Luz": qué contiene, qué le recuerda cada cosa, y una línea final sobre cuándo abrirlo. Sin inventar objetos que no mencionó.', campoAdn: 'bunker_luz' },
    ],
  },

  /* ── D2 · TU RADIOGRAFÍA EMOCIONAL ── */
  'P1.2': {
    codigo: 'P1.2',
    pasoEsencialIdx: 4,
    pasos: [
      { tipo: 'intro', titulo: 'Tu radiografía', texto: 'Hoy no hay que convencer a nadie. Hay que VER. Como una radiografía de verdad: no juzga — muestra. Una sola condición, la del pacto: la verdad verdad, no la verdad bonita. Una radiografía maquillada no le sirve a ningún médico… y hoy el paciente eres tú.' },
      { tipo: 'opciones', id: 'frases_casa', pregunta: '¿Qué frases sobre el dinero escuchaste en tu casa de niño? (elige todas las que reconozcas)', opciones: ['«El dinero no crece en los árboles»', '«De eso no se habla en la mesa»', '«Los ricos son ladrones / mala gente»', '«Hay que romperse el lomo para ganarlo»', '«La gente buena no piensa en dinero»', '«No alcanza, nunca alcanza»'], multiple: true, permiteOtra: true },
      { tipo: 'opciones', id: 'cuerpo', pregunta: 'Cuando un paciente te pregunta «¿cuánto cuesta?»… ¿qué pasa en tu cuerpo?', opciones: ['Se me cierra la garganta', 'Se me aprieta el pecho o el estómago', 'Empiezo a explicar de más', 'Bajo el precio antes de que objeten', 'Lo digo tranquilo — sin problema'], permiteOtra: true },
      { tipo: 'opciones', id: 'sabotajes', pregunta: 'Los sabotajes del profesional de servicio. ¿En cuáles te reconoces? (sin vergüenza: casi todos vivimos en los tres)', opciones: ['Bajar el precio ANTES de que me lo pidan', 'Justificar el precio con mis títulos', 'Trabajar de más por culpa (dar 90 min cobrando 50)', 'Regalar sesiones «porque está pasando un mal momento»', 'Responder mensajes a cualquier hora, cualquier día'], multiple: true, permiteOtra: true },
      { tipo: 'abierta', id: 'costo', pregunta: 'La pregunta del día: ¿qué te está costando HOY — en dinero, en energía, en vida — tu relación actual con el dinero?', ayuda: 'Habla con números si los tienes. Toca el micrófono y dilo en voz alta: lo que no se nombra, no se sana.', minChars: 100, placeholder: 'Me está costando…' },
      { tipo: 'artefacto', id: 'radiografia', tituloArtefacto: 'Tu Radiografía del Dinero', promptIA: 'Con las frases heredadas, la reacción corporal, los sabotajes reconocidos y el costo que describió, redacta "Tu Radiografía del Dinero" en segunda persona: (1) el patrón central que se ve (2) de dónde viene — sin psicoanálisis barato, solo conectar lo que él mismo dijo (3) el costo real que nombró (4) una línea final firme y amorosa sobre qué se trabaja esta semana. Máx 160 palabras. Tono: firmeza y amorosidad son hermanos.', campoAdn: 'radiografia_dinero' },
    ],
  },

  /* ── D3 · LA LEALTAD INVISIBLE Y TU LINAJE ── */
  'P1.2b': {
    codigo: 'P1.2b',
    pasoEsencialIdx: 3,
    pasos: [
      { tipo: 'intro', titulo: 'El linaje', texto: 'Las frases de ayer no nacieron contigo — las heredaste. Hoy miramos de quién. No para culpar a nadie: tu familia hizo lo que pudo con lo que sabía. Miramos para separar lo que es TUYO de lo que cargas por lealtad invisible. Honrar no es repetir.' },
      { tipo: 'opciones', id: 'quien', pregunta: '¿Quién manejaba el dinero en tu casa?', opciones: ['Mi padre', 'Mi madre', 'Los dos, juntos', 'Los dos, peleando', 'Un abuelo/a', 'Nadie — era un caos'], permiteOtra: true },
      { tipo: 'opciones', id: 'clima', pregunta: 'Cuando aparecía el tema del dinero en tu casa, el clima era…', opciones: ['Silencio — no se hablaba', 'Tensión o peleas', 'Preocupación constante', 'Vergüenza', 'Normalidad — se hablaba tranquilo'], permiteOtra: true },
      { tipo: 'opciones', id: 'lealtad', pregunta: 'La pregunta incómoda: si te fuera MUY bien con el dinero… ¿a quién sentirías que «traicionas»?', opciones: ['A mi padre', 'A mi madre', 'A mis abuelos', 'A mis colegas («los que cobramos poco»)', 'A nadie que yo sepa — pero algo me frena'], permiteOtra: true },
      { tipo: 'abierta', id: 'historia', pregunta: '¿Qué historia de dinero de tu familia cargas sin haberla elegido?', ayuda: 'La quiebra del abuelo, el sacrificio de mamá, el «nosotros no somos de esos»… Toca el micrófono y cuéntala.', minChars: 100, placeholder: 'En mi familia…' },
      { tipo: 'artefacto', id: 'linaje', tituloArtefacto: 'Tu Linaje del Dinero', promptIA: 'Con quién manejaba el dinero, el clima, la lealtad invisible y la historia que contó, redacta "Tu Linaje del Dinero" en segunda persona: (1) la herencia que se ve (2) la lealtad invisible nombrada sin dramatismo (3) el permiso: honrar la historia sin repetirla — una frase para decirle mentalmente a su linaje («te honro Y elijo distinto») (4) qué queda listo para soltar mañana en LA QUEMA. Máx 160 palabras.', campoAdn: 'linaje_dinero' },
    ],
  },

  /* ── D4 · LA QUEMA (sesión-hito) ── */
  'P1.3': {
    codigo: 'P1.3',
    pasoEsencialIdx: 3,
    pasos: [
      { tipo: 'intro', titulo: '🔥 LA QUEMA', texto: 'Hoy no es una sesión de pantalla. Es un ritual con fuego real. Vas a escribir lo que ya no te sirve — las frases, la culpa, el precio viejo — y lo vas a QUEMAR. Físicamente. Necesitas: papel, birome, un lugar seguro para el fuego (una olla, el fogón, la pileta de la cocina) y 20 minutos sin interrupciones.', nota: 'Si ahora no puedes hacer fuego, prepara todo por escrito y quema esta noche. El ritual se completa HOY.' },
      { tipo: 'opciones', id: 'que_quemar', pregunta: '¿Qué muere hoy en el fuego? (elige todo lo que vas a quemar)', opciones: ['Las frases heredadas de mi casa', 'La culpa de cobrar por ayudar', 'Mi precio viejo — el del miedo', 'El «quién soy yo para cobrar esto»', 'La vergüenza de mis deudas', 'El permiso que espero y nunca llega'], multiple: true, permiteOtra: true },
      { tipo: 'abierta', id: 'texto_quema', pregunta: 'Escribe TU texto de la quema — tal como lo vas a leer EN VOZ ALTA frente al fuego, antes de soltarlo:', ayuda: 'Empieza por «Hoy suelto…» o «Hoy muere…». Con nombre y apellido: no «mis miedos» sino CUÁLES. Puedes dictarlo con el micrófono. Después lo copias a mano al papel — la mano también tiene que soltarlo.', minChars: 150, placeholder: 'Hoy suelto…' },
      { tipo: 'ritual', titulo: 'El ritual — en este orden', instrucciones: ['Copia tu texto A MANO en el papel (la mano también suelta)', 'Léelo EN VOZ ALTA, de pie, de frente — no de costado, no en diagonal', 'Quémalo. Mira el fuego hasta el final', 'Cierra con gratitud, en voz alta: «Gracias por protegerme hasta acá. Ya no te necesito.» — lo que se abre, SE CIERRA', 'Un vaso de agua. Respira. Ya está.'], nota: 'Saca una foto del papel ardiendo o de las cenizas — es tu evidencia de hoy.' },
      { tipo: 'evidencia', id: 'foto_quema', titulo: 'La evidencia del fuego', texto: 'La foto del papel ardiendo o de las cenizas. Este es uno de los comprobantes más importantes de tus 90 días.', accept: 'image/*' },
      { tipo: 'artefacto', id: 'acta', tituloArtefacto: 'El Acta de tu Quema', promptIA: 'Con lo que eligió quemar y su texto de la quema, redacta "El Acta de la Quema" en segunda persona, solemne y breve (máx 120 palabras): qué murió hoy en el fuego (sus palabras, elevadas), qué espacio queda libre, y la línea final: mañana ese espacio se llena con TU NÚMERO. No consolar — consagrar.', campoAdn: 'acta_quema' },
    ],
  },

  /* ── D5 · EL NÚMERO (sesión-hito) ── */
  'P1.5': {
    codigo: 'P1.5',
    pasoEsencialIdx: 3,
    pasos: [
      { tipo: 'intro', titulo: 'EL NÚMERO — tu precio digno', texto: 'Ayer quemaste el precio del miedo. Hoy nace el otro: TU número. No un número «razonable», no el que «la gente puede pagar» — el número digno, el que sostiene tu vocación en vez de fundirla. Y hoy no solo lo eliges: lo PRONUNCIAS. Tu voz. Tu número. Sin pedir perdón.' },
      { tipo: 'radar', id: 'radar' },
      { tipo: 'ia_propone', id: 'transformacion', pregunta: 'Tu oferta de $1.000 empaqueta UNA transformación. ¿Cuál es la tuya?', promptIA: 'Basándote en su especialidad y su historia, propone 3 transformaciones concretas y vendibles que este profesional podría empaquetar en un programa de $1.000 USD. Cada una: máx 15 palabras, formato "De [estado A] a [estado B] en [plazo]". Específicas de su campo, no genéricas.', nOpciones: 3 },
      { tipo: 'abierta', id: 'pronuncia', pregunta: 'Ahora escríbelo como declaración — y luego DILO EN VOZ ALTA, tres veces, de pie: «Mi programa [nombre/transformación] cuesta mil dólares.»', ayuda: 'Dictado con el micrófono vale doble: si el micrófono te escuchó decirlo… ya lo dijiste. La primera vez tiembla. La tercera, no.', minChars: 60, placeholder: 'Mi programa… cuesta mil dólares.' },
      { tipo: 'artefacto', id: 'numero', tituloArtefacto: 'Tu Número — la declaración', promptIA: 'Con la transformación elegida y su declaración, redacta "Tu Número" en segunda persona (máx 130 palabras): (1) el número: $1.000 USD — dicho sin rodeos (2) qué transformación lo respalda (3) por qué es DIGNO y no caro — una línea con el radar del mercado (su especialidad cobra esto y más) (4) el compromiso: este número no se negocia a la baja en los próximos 90 días — se defiende con el sistema que empieza a construirse la próxima semana. Tono: solemne, sin humo.', campoAdn: 'mi_numero' },
    ],
  },

  /* ═══════════ SEMANAS 2-4 (T5) ═══════════ */

  /* D8 · El dinero en el cuerpo */
  'P1.4': { codigo: 'P1.4', pasoEsencialIdx: 2, pasos: [
    { tipo: 'intro', titulo: 'El dinero en el cuerpo', texto: 'El precio no se dice con la boca — se dice con el cuerpo entero. Hoy entrenas el registro: dónde aprieta cuando pronuncias tu número, y cómo soltarlo. Escucha el audio guiado con los ojos cerrados, en un lugar tranquilo.', nota: 'Busca el audio de esta sesión en tu biblioteca. Si aún no está, tu Mentor te guía el ejercicio.' },
    { tipo: 'opciones', id: 'registro', pregunta: 'Dijiste tu número mentalmente. ¿Dónde apretó?', opciones: ['La garganta', 'El pecho', 'El estómago', 'Los hombros / la mandíbula', 'En ningún lado — salió suelto'], permiteOtra: true },
    { tipo: 'abierta', id: 'soltar', pregunta: 'Repite tu número en voz alta 3 veces, soltando el aire donde apretó. ¿Qué cambió de la primera a la tercera?', ayuda: 'Puedes contarlo hablando — toca el micrófono.', minChars: 60, placeholder: 'La primera vez… la tercera…' },
    { tipo: 'artefacto', id: 'cuerpo', tituloArtefacto: 'Tu registro corporal del precio', promptIA: 'Con dónde apretó y qué cambió entre repeticiones, redacta en segunda persona (máx 90 palabras) su registro corporal del precio y la práctica de esta semana: cada mañana, 2 minutos — precio y aire. Tono sereno.', campoAdn: 'registro_corporal_precio' },
  ]},

  /* D9 · El Estandarte */
  'P1.6': { codigo: 'P1.6', pasoEsencialIdx: 2, pasos: [
    { tipo: 'intro', titulo: 'Tu creencia nueva y el Estandarte', texto: 'Quemaste lo viejo. El espacio libre no puede quedar vacío — lo vacío se rellena solo con lo de antes. Hoy izas tu Estandarte: la creencia nueva que gobierna tu relación con el dinero desde hoy.' },
    { tipo: 'ia_propone', id: 'creencia', pregunta: 'Tu creencia nueva — la que reemplaza a las quemadas:', promptIA: 'Con su radiografía, su linaje y su acta de quema (en las respuestas y perfil), propone 3 creencias-estandarte en primera persona, potentes y creíbles (máx 12 palabras cada una). Ej: "Cobrar digno es cuidar mi vocación". Nada cursi ni new age.', nOpciones: 3 },
    { tipo: 'abierta', id: 'porque', pregunta: '¿Por qué ESA? ¿Qué te permite que las viejas te negaban?', minChars: 60, placeholder: 'Esta creencia me permite…' },
    { tipo: 'ritual', titulo: 'Izar el Estandarte', instrucciones: ['Escríbela A MANO en una hoja, grande', 'Pégala donde la veas TODOS los días (escritorio, espejo, heladera)', 'Léela en voz alta cada mañana esta semana — de pie'], nota: 'Foto del estandarte pegado en su lugar = tu evidencia.' },
    { tipo: 'evidencia', id: 'foto_estandarte', titulo: 'Tu Estandarte, izado', texto: 'La foto de tu creencia nueva, pegada donde vive.', accept: 'image/*' },
    { tipo: 'artefacto', id: 'estandarte', tituloArtefacto: 'Tu Estandarte', promptIA: 'Con la creencia elegida y su porqué, redacta "Tu Estandarte" (máx 90 palabras): la creencia consagrada, qué habilita, y la práctica de leerla en voz alta. Solemne, sin humo.', campoAdn: 'estandarte' },
  ]},

  /* D11 · Paciente ideal — LA MATRIZ ABC (G5) */
  'P2.3': { codigo: 'P2.3', pasoEsencialIdx: 3, pasos: [
    { tipo: 'intro', titulo: 'Tu paciente ideal — la matriz ABC', texto: 'Un restaurante donde cada uno pide lo que se le antoja no es un negocio. Hoy eliges QUIÉN se sienta en tu mesa. La matriz es simple: pacientes A (los amas, pagan bien, avanzan), B (correctos), C (te drenan, regatean, no avanzan). Tu clínica nueva se construye para los A.' },
    { tipo: 'abierta', id: 'mejor_a', pregunta: 'Tu mejor paciente A — el que llegó roto y salió entero. ¿Quién era, qué le dolía, y por qué trabajar con esa persona te llenaba?', ayuda: 'Cuéntalo hablando: toca el micrófono. Si no tienes 3 pacientes aún, cuenta TU propia historia — tú fuiste tu primer caso.', minChars: 120, placeholder: 'Mi mejor paciente…' },
    { tipo: 'opciones', id: 'senales_a', pregunta: '¿Qué señales tenían tus A en común? (elige todas)', opciones: ['Llegaron en un momento de quiebre real', 'Pagaron sin regatear — valoraban', 'Hicieron la tarea entre sesiones', 'Referían a otros como ellos', 'Tenían urgencia verdadera, no curiosidad'], multiple: true, permiteOtra: true },
    { tipo: 'opciones', id: 'senales_c', pregunta: 'Y los C — los que ya no entran. ¿Cómo los reconoces en la puerta?', opciones: ['Preguntan el precio antes que nada', 'Piden descuento de entrada', '«Lo tengo que pensar» eterno', 'Faltan o llegan tarde siempre', 'Quieren el resultado sin el proceso'], multiple: true, permiteOtra: true },
    { tipo: 'artefacto', id: 'ideal', tituloArtefacto: 'Tu Paciente Ideal (la matriz ABC)', promptIA: 'Con su mejor caso A, las señales A y las señales C, redacta "Tu Paciente Ideal": (1) retrato del A — quién es, qué le duele, qué compra de verdad (2) las 3 señales de entrada de un A (3) las señales de un C y la regla: al C se lo deriva con amor — «los veganos, a la cuadra de enfrente» (4) la frase de posicionamiento: para quién ES tu clínica. Máx 170 palabras, segunda persona.', campoAdn: 'paciente_ideal' },
  ]},

  /* D12 · Validar el nombre del método */
  'P2.5': { codigo: 'P2.5', pasoEsencialIdx: 1, pasos: [
    { tipo: 'intro', titulo: 'El bautismo', texto: 'Tu método ya tiene candidatos de nombre. Hoy se bautiza — y un nombre se valida con UNA prueba: dicho en voz alta a un desconocido, ¿se entiende qué transforma?' },
    { tipo: 'abierta', id: 'nombre_final', pregunta: 'Escribe el nombre elegido + tu línea de una frase: «[Nombre]: el método para que [quién] logre [qué] sin [dolor]»', minChars: 40, placeholder: 'Método …: el método para que…' },
    { tipo: 'artefacto', id: 'bautismo', tituloArtefacto: 'El bautismo de tu método', promptIA: 'Con el nombre y la línea, redacta el acta de bautismo (máx 80 palabras): el nombre consagrado con ™, qué promete en una frase, y que desde hoy firma todo lo que construya. Solemne y breve.', campoAdn: 'metodo_bautismo' },
  ]},

  /* D16 · Defiende tu precio (roleplay) */
  'P3.3': { codigo: 'P3.3', pasoEsencialIdx: 2, pasos: [
    { tipo: 'intro', titulo: 'Defiende tu precio', texto: 'Tu oferta ya tiene precio. Hoy lo defiendes contra las 3 objeciones que VAS a escuchar: «es caro», «lo tengo que pensar», «¿hay descuento?». La regla de oro: el precio se dice una vez, tono de tu nombre… y silencio.' },
    { tipo: 'opciones', id: 'peor', pregunta: '¿Cuál de estas te da más miedo escuchar en una llamada real?', opciones: ['«Es muy caro»', '«Lo tengo que pensar»', '«¿No hay un descuento?»', '«Otro colega cobra la mitad»', 'Ninguna — el silencio después del precio'], permiteOtra: true },
    { tipo: 'abierta', id: 'respuesta', pregunta: 'Escribe (o dicta) tu respuesta a ESA — la que más miedo te da. Sin justificarte, sin bajar el precio, con una pregunta al final que devuelva el saque.', ayuda: 'El que se justifica, duda. El que pregunta, dirige.', minChars: 80, placeholder: 'Entiendo. Y déjame preguntarte…' },
    { tipo: 'artefacto', id: 'defensa', tituloArtefacto: 'Tu defensa del precio', promptIA: 'Con la objeción que más teme y su respuesta, redacta "Tu defensa del precio": puli su respuesta manteniendo SU voz (sin justificación, con pregunta final), y agrega las respuestas cortas a las otras 2 objeciones clásicas («caro» / «pensar» / «descuento»), cada una de máx 2 líneas + regla del silencio. Máx 170 palabras.', campoAdn: 'defensa_precio' },
  ]},

  /* D17 · Aprobación final de la oferta */
  'P3.4': { codigo: 'P3.4', pasoEsencialIdx: 1, pasos: [
    { tipo: 'intro', titulo: 'La aprobación final', texto: 'Tu oferta pasa hoy su control de calidad — la ecuación de valor, pieza por pieza. Si una pieza está floja, se ajusta HOY: mañana el dojo respira y el lunes empieza la obra del sistema.' },
    { tipo: 'opciones', id: 'checklist', pregunta: 'Control de calidad — marca solo lo que YA está sólido de verdad:', opciones: ['El resultado prometido es CONCRETO (se puede medir o ver)', 'El plazo está definido', 'La garantía está escrita y la puedo sostener', 'El precio es $1.000 — y lo puedo pronunciar sin temblar', 'Sé exactamente qué incluye (y qué NO incluye)'], multiple: true },
    { tipo: 'artefacto', id: 'aprobacion', tituloArtefacto: 'Tu Oferta — versión final aprobada', promptIA: 'Con el checklist marcado (y lo NO marcado como pendiente), redacta la versión final de su oferta en formato declaración: transformación + plazo + garantía + precio + qué incluye. Si marcó menos de 4, señala con firmeza amorosa QUÉ falta ajustar antes del lunes. Máx 160 palabras.', campoAdn: 'oferta_final' },
  ]},

  /* D18 · Puesta al día */
  'P3.5': { codigo: 'P3.5', pasoEsencialIdx: 1, pasos: [
    { tipo: 'intro', titulo: 'Puesta al día — el dojo respira', texto: 'Hoy no se construye nada nuevo. Hoy se ordena: lo pendiente se cierra, lo flojo se ajusta. El lunes arranca la semana más intensa del camino — se llega descansado y al día.' },
    { tipo: 'opciones', id: 'estado', pregunta: '¿Cómo llegas al cierre de esta etapa?', opciones: ['Al día — todo firmado y sólido', 'Con 1-2 pendientes chicos que cierro hoy', 'Con algo grande flojo (lo trabajo hoy con mi Mentor)', 'Atrasado — hoy me pongo al día'], },
    { tipo: 'abierta', id: 'reflexion', pregunta: 'Mira 18 días atrás: ¿qué persona empezó este camino… y quién lo está caminando hoy?', ayuda: 'Tu Foto de Partida está en tu perfil si quieres mirarla. Habla con el micrófono si te sale más fácil.', minChars: 80, placeholder: 'El que empezó…' },
    { tipo: 'artefacto', id: 'cierre_etapa', tituloArtefacto: 'El cierre de tu primera etapa', promptIA: 'Con su estado y su reflexión, redacta el cierre de etapa (máx 120 palabras): qué construyó en 18 días (dinero sanado, método, oferta), la diferencia que él mismo nombró, y la puerta de la semana que viene: la obra del sistema. Cierre: «Ponte el casco el lunes.»', campoAdn: 'cierre_etapa_1' },
  ]},

  /* D23 · El perfil que convierte (G3 — la doctrina real) */
  'P4.2b': { codigo: 'P4.2b', pasoEsencialIdx: 3, pasos: [
    { tipo: 'intro', titulo: 'Tu perfil que convierte', texto: 'Tu perfil es tu recepción. El paciente te googlea ANTES de escribirte — y decide en 5 segundos. Hoy lo dejamos profesional: foto, bio, destacadas. Reglas de oro: la foto es TU ROSTRO llenando el círculo (el ojo humano identifica rostros, no cuerpos lejanos — pruébala en chiquitito), y la bio dice la TRANSFORMACIÓN, no los títulos.' },
    { tipo: 'opciones', id: 'foto_check', pregunta: 'Tu foto de perfil, mírala en chiquitito AHORA. ¿Cuál es tu caso?', opciones: ['Es mi rostro de frente, llena el círculo, se me ve bien ✓', 'Estoy lejos / de cuerpo entero — se pierde', 'Es un logo o un paisaje', 'Está oscura o borrosa', 'No tengo foto profesional aún'], },
    { tipo: 'ia_propone', id: 'bio', pregunta: 'Tu bio nueva — transformación, no currículum:', promptIA: 'Con su especialidad, método con nombre y paciente ideal, propone 3 bios de Instagram (máx 150 caracteres c/u): línea 1 = a quién ayuda y a qué resultado · línea 2 = el método con nombre · línea 3 = llamado simple. Sin «digital creator», sin títulos académicos apilados, sin emojis excesivos.', nOpciones: 3 },
    { tipo: 'ritual', titulo: 'La cirugía del perfil — hazla AHORA', instrucciones: ['Cambia la foto si no pasó la prueba del chiquitito', 'Pega tu bio nueva', 'Quita la categoría «Digital creator» si aparece (Editar perfil → Categoría)', 'Crea 4 destacadas: Mi Método · Resultados · Quién Soy · Empezar (aunque arranquen con 1 historia cada una)'], nota: 'Captura de tu perfil terminado = tu evidencia.' },
    { tipo: 'evidencia', id: 'perfil_final', titulo: 'Tu perfil, operado', texto: 'La captura de tu perfil nuevo: foto de rostro, bio de transformación, destacadas creadas.', accept: 'image/*' },
    { tipo: 'artefacto', id: 'perfil', tituloArtefacto: 'Tu recepción digital', promptIA: 'Con su caso de foto y la bio elegida, redacta "Tu recepción digital" (máx 110 palabras): la bio consagrada, el estándar de su perfil desde hoy, y la regla del rostro en chiquitito. Cierre: su perfil ya no es una red social — es la puerta de su clínica.', campoAdn: 'perfil_digital' },
  ]},

  /* D23 · Las 3 piezas — el framework NO/SÍ (G2) + EL ESPEJO DEL MÉTODO (#20) */
  'P4.3': { codigo: 'P4.3', pasoEsencialIdx: 3, pasos: [
    { tipo: 'intro', titulo: '🪞 Antes de crear: mírate', texto: '¿Te diste cuenta? TÚ llegaste hasta acá por este mismo circuito: viste un mensaje que te frenó → escribiste por WhatsApp → un filtro te hizo preguntas → probaste una semana → decidiste con el precio claro. ESTÁS VIVIENDO el sistema que vas a instalar. Lo que sentiste al ver ese primer anuncio… es exactamente lo que va a sentir tu paciente al ver el tuyo. Funciona. Eres la prueba.' },
    { tipo: 'intro', titulo: 'El framework NO / SÍ', texto: 'Tus piezas siguen una doctrina simple. LOS CORTOS DICEN LO QUE NO: «no hagas más [error común de tu campo]» — la autoridad se construye mostrando lo que ya no va. EL LARGO DICE LO QUE SÍ: tu método, tu camino — y lleva a la puerta. Hoy escribes 3 guiones cortos de NO. El SÍ largo llega con tu página.' },
    { tipo: 'ia_propone', id: 'errores', pregunta: 'Los 3 errores de tu campo que tus piezas van a desarmar:', promptIA: 'Con su especialidad, método y paciente ideal, propone 5 errores comunes que su paciente ideal comete (o cree correctos) y que su método desarma. Formato: «No sigas [error]» — máx 12 palabras cada uno, específicos del campo, con filo (que frenen el scroll).', nOpciones: 5 },
    { tipo: 'abierta', id: 'gancho', pregunta: 'Elige tu favorito y escribe (o dicta) el guion de 30-45 segundos: gancho de NO → por qué es un error → qué hacer en cambio (sin regalar el método) → «sígueme para el camino completo».', minChars: 150, placeholder: 'No sigas… Te explico por qué…' },
    { tipo: 'artefacto', id: 'piezas', tituloArtefacto: 'Tus 3 guiones de NO', promptIA: 'Con los errores elegidos y su guion favorito, redacta los 3 GUIONES CORTOS completos (30-45 seg hablados cada uno) en SU voz: gancho NO con filo → el porqué → el giro al SÍ sin regalar el método → cierre. Incluye la nota: mañana los graba — crudos, con notas a la vista, la toma verdadera le gana a la perfecta. Máx 220 palabras.', campoAdn: 'guiones_piezas' },
  ]},

  /* ═══════════ LA ECONOMÍA Y LA CAZA (T6) ═══════════ */

  /* D28 · El Plan de Inversión (M1) */
  'P4.7': { codigo: 'P4.7', pasoEsencialIdx: 2, pasos: [
    { tipo: 'intro', titulo: 'El pacto del dinero', texto: 'La cuenta es simple y la firmas hoy: inviertes UN ticket ($1.000, hasta $2.000 reinvirtiendo) para ganar DIEZ ($10.000). Eso es un retorno de x5 — y x4 es el mínimo digno de tanto trabajo. Tu dinero no se apuesta: se invierte con plan, ritmo y números esperados.' },
    { tipo: 'opciones', id: 'diario', pregunta: 'Tu presupuesto diario de arranque — el que puedes sostener 30 días SIN sufrir:', opciones: ['$10/día (~$300/mes) — arranque prudente', '$15/día (~$450/mes) — el estándar', '$20/día (~$600/mes) — con espalda', 'Necesito hablarlo con mi Mentor antes de firmar'] },
    { tipo: 'opciones', id: 'reinversion', pregunta: 'El pacto de reinversión — cuando entre tu primera venta de $1.000:', opciones: ['Reinvierto $500 (medio ticket) y el presupuesto sube — RECOMENDADO', 'Reinvierto $300 y guardo el resto', 'Lo decido cuando llegue (tu Mentor te va a preguntar por qué)'] },
    { tipo: 'artefacto', id: 'plan', tituloArtefacto: 'Tu Plan de Inversión — firmado', promptIA: 'Con el presupuesto diario y el pacto de reinversión elegidos, redacta "Tu Plan de Inversión" como contrato breve en primera persona (máx 150 palabras): cuánto invierto por día y desde cuándo (mañana, día 29) · qué espero cada semana (semana 1: datos y conversaciones, no ventas · semanas 2-3: primeras llamadas · primera venta esperada ~día 42) · el pacto de reinversión elegido · la regla: los primeros 5 días NO se toca la campaña — está aprendiendo · y el cierre: el retorno digno es x4 mínimo, x5 el objetivo. Tono de contrato solemne.', campoAdn: 'plan_inversion' },
  ]},

  /* D28 · La Prueba de Fuego (M2/G1) */
  'P4.8': { codigo: 'P4.8', pasoEsencialIdx: 1, pasos: [
    { tipo: 'intro', titulo: '🔥 La Prueba de Fuego', texto: 'Hoy un lead de prueba recorre TODO tu circuito de punta a punta — tu pareja, un colega, o tú desde otro teléfono. No es simulacro a medias: es el ensayo general con público. Lo que falle hoy, se arregla hoy. Mañana se enciende de verdad.' },
    { tipo: 'opciones', id: 'checklist', pregunta: 'El recorrido en vivo — marca cada estación SOLO cuando tu lead de prueba la haya pasado DE VERDAD:', opciones: ['Tocó el link del anuncio y cayó a mi WhatsApp ✓', 'Mi agente lo recibió y le hizo las preguntas de filtro ✓', 'Calificó y el agente le abrió mi calendario ✓', 'Agendó y le llegó la confirmación ✓', 'Hizo un pago de prueba y lo vi entrar ✓'], multiple: true },
    { tipo: 'evidencia', id: 'evidencia_fuego', titulo: 'La evidencia del ensayo', texto: 'Captura de la conversación de prueba completa (del primer mensaje a la agenda o el pago).', accept: 'image/*' },
    { tipo: 'artefacto', id: 'acta_fuego', tituloArtefacto: 'El Acta de la Prueba de Fuego', promptIA: 'Con las estaciones marcadas, redacta el acta (máx 120 palabras): si marcó las 5 — el circuito está VIVO y verificado, mañana se enciende con respaldo, no con fe. Si marcó menos de 5: nombra exactamente cuáles faltan y la orden firme y amorosa: eso se arregla HOY antes de encender — encender con una estación rota es quemar dinero. Cierre: en esta clínica no se apuesta, se verifica.', campoAdn: 'prueba_fuego' },
  ]},

  /* D29 · Encender la campaña */
  'P4.4': { codigo: 'P4.4', pasoEsencialIdx: 2, pasos: [
    { tipo: 'intro', titulo: '🚀 Hoy se enciende', texto: 'Este día lo vas a recordar. Tres reglas y ninguna se negocia: UNA campaña (la fuerza no se divide) · el presupuesto de tu Plan firmado · público amplio — el anuncio filtra, no los ajustes finos. Y la regla de oro de la semana: los primeros 5 días NO SE TOCA — la campaña está aprendiendo; tocarla la reinicia. Paciencia de cazador.' },
    { tipo: 'opciones', id: 'pre_encendido', pregunta: 'Antes de apretar el botón — verifica:', opciones: ['La Prueba de Fuego de ayer pasó completa ✓', 'El presupuesto es el de mi Plan firmado ✓', 'Es UNA sola campaña — un solo objetivo ✓', 'Público amplio, sin micro-segmentar ✓'], multiple: true },
    { tipo: 'evidencia', id: 'campana_on', titulo: 'La campaña ENCENDIDA', texto: 'El screenshot de tu campaña ACTIVA — con el estado en verde. Este comprobante vale un cinturón.', accept: 'image/*' },
    { tipo: 'artefacto', id: 'encendido', tituloArtefacto: 'El día del encendido', promptIA: 'Con su verificación pre-encendido, redacta "El día del encendido" (máx 110 palabras): la fecha queda consagrada — hoy su clínica se abrió al mundo · qué esperar los primeros 5 días (datos, conversaciones — todavía no ventas, y está bien) · la regla: no tocarla hasta el día 5, después UN ajuste de ángulo con datos · cierre: bienvenido al juego real.', campoAdn: 'dia_encendido' },
  ]},

  /* D37 · La primera llamada real */
  'P5.4': { codigo: 'P5.4', pasoEsencialIdx: 1, pasos: [
    { tipo: 'intro', titulo: '⭐ Tu primera llamada real', texto: 'Todo lo que construiste fue para este momento. Recuerda la anatomía: la llamada es un diagnóstico — escuchas, preguntas, presentas el tratamiento. El que pregunta, dirige. El precio se dice UNA vez… y silencio. Llegas entrenado: confía en tu W.' },
    { tipo: 'evidencia', id: 'llamada', titulo: 'El comprobante de la llamada', texto: 'Captura del encuentro (la sala del Meet, el registro de la llamada). Pasó o no pasó — acá se verifica.', accept: 'image/*' },
    { tipo: 'abierta', id: 'debrief', pregunta: 'El debrief de cazador — recién colgada: ¿qué % del tiempo hablaste tú, dónde sentiste que la dirigiste… y dónde se te fue?', ayuda: 'Dictado al micrófono, en caliente, vale oro. Sin juzgarte: los números de la primera llamada son el punto A del entrenamiento.', minChars: 100, placeholder: 'Hablé como el …%. La dirigí cuando… Se me fue cuando…' },
    { tipo: 'artefacto', id: 'primera_llamada', tituloArtefacto: 'El acta de tu primera llamada', promptIA: 'Con su debrief, redacta el acta (máx 140 palabras): lo que hizo bien (concreto, de su relato) · el UN ajuste para la próxima (solo uno — el más importante) · el recordatorio: cerró o no cerró, hoy ya es alguien que HACE llamadas — la mayoría de sus colegas jamás llega acá · y la orden: el ajuste se practica en roleplay antes de la próxima real.', campoAdn: 'primera_llamada' },
  ]},

  /* D44 · El primer pago */
  'P6.3': { codigo: 'P6.3', pasoEsencialIdx: 0, pasos: [
    { tipo: 'intro', titulo: '💰 El fruto maduro', texto: 'Si estás acá, pasó — o está por pasar hoy. El primer paciente de $1.000. Sube el comprobante: este es EL cinturón rojo, el que nadie te regaló.' },
    { tipo: 'evidencia', id: 'comprobante', titulo: 'El comprobante del primer pago', texto: 'La captura del pago recibido. Nunca más el primero.', accept: 'image/*' },
    { tipo: 'abierta', id: 'momento', pregunta: '¿Dónde estabas cuando entró? ¿Qué sentiste — y a quién se lo contaste primero?', minChars: 60, placeholder: 'Estaba…' },
    { tipo: 'artefacto', id: 'primer_pago', tituloArtefacto: 'El acta del primer paciente', promptIA: 'Con su relato del momento, redacta "El acta del primer paciente" (máx 120 palabras), solemne y emocionada sin cursilería: la fecha queda grabada · lo que ese pago PRUEBA (el método funciona, el precio es digno, el sistema vende) · el pacto de reinversión de su Plan se activa ahora · y el cierre: el primero es el más difícil — los otros nueve ya saben el camino.', campoAdn: 'primer_pago' },
  ]},

  /* D51+ · El Plan de Caza semanal */
  'P7.2': { codigo: 'P7.2', pasoEsencialIdx: 2, pasos: [
    { tipo: 'intro', titulo: 'Tu Plan de Caza', texto: 'De acá al día 90 el ritmo es semanal y se mide con 3 números: interesados · llamadas · cierres. Cada número diagnostica: ¿pocos interesados? el anuncio pide un ángulo. ¿No agendan? el filtro o el perfil. ¿No cierran? la W vuelve al gimnasio. Sin números todo es ansiedad; con números, todo es diagnóstico. Y la regla de la cosecha: cuando tengas tu primera venta + audiencia caliente, el 20-25% del presupuesto pasa a perseguir a los que ya te vieron — el resto sigue cazando frío. El motor no se apaga nunca.' },
    { tipo: 'opciones', id: 'ritmo', pregunta: 'Tu semana tipo de cazador — elige tu estructura:', opciones: ['Llamadas concentradas: 2 bloques fijos (ej. mar/jue tarde)', 'Llamadas distribuidas: 1 por día en hueco fijo', 'Según agenda de pacientes — bloques móviles cada domingo'] },
    { tipo: 'abierta', id: 'numeros', pregunta: 'Tus números de ESTA semana — los reales: ¿cuántos interesados entraron, cuántas llamadas hubo, cuántos cierres?', ayuda: 'Tres números. Si alguno es cero, se escribe cero — el cero también diagnostica.', minChars: 20, placeholder: 'Interesados: … · Llamadas: … · Cierres: …' },
    { tipo: 'artefacto', id: 'plan_caza', tituloArtefacto: 'Tu Plan de Caza de la semana', promptIA: 'Con su estructura elegida y sus 3 números, redacta el Plan de Caza (máx 150 palabras): el diagnóstico de sus números contra el embudo esperado (muchas conversaciones y pocas agendas = filtro/perfil · agendas sin cierre = la W · pocos interesados = ángulo del anuncio) · UNA acción correctiva para esta semana · su semana tipo consagrada · y el viernes: los 3 números al espejo. Tono de director técnico: datos, no drama.', campoAdn: 'plan_caza' },
  ]},

  /* D85 · El cierre del camino */
  'P7.3': { codigo: 'P7.3', pasoEsencialIdx: 1, pasos: [
    { tipo: 'intro', titulo: 'La última recta', texto: 'Día 85. Cinco días para el cierre formal. Hoy se ordena la cosecha: cuántos de los 10 están, cuáles faltan, y qué se hace con los días que quedan. Y una verdad de director: el día 90 no es un final — es la mudanza definitiva a tu clínica permanente.' },
    { tipo: 'abierta', id: 'cosecha', pregunta: 'La cosecha real: ¿cuántos pacientes de $1.000 cerraste hasta hoy, y qué te falta para los 10?', minChars: 40, placeholder: 'Llevo … pacientes. Me faltan…' },
    { tipo: 'artefacto', id: 'cierre', tituloArtefacto: 'El acta de la última recta', promptIA: 'Con su cosecha, redacta el acta (máx 140 palabras): si llegó o superó los 10 — la consagración: director con máquina propia, la graduación lo espera. Si está cerca — el plan de los 5 días finales: llamadas agendadas, seguimientos calientes, sin inventar nada nuevo. Si está lejos — la verdad con amor: el día 90 se revisa el sistema con el equipo, la garantía existe por contrato, y lo construido no se pierde: la máquina sigue el día 91. Cierre: mires donde mires, ya no eres la Foto de Partida.', campoAdn: 'ultima_recta' },
  ]},
};

export function sesionGuiadaDe(codigo: string): SesionGuiada | null {
  return SESIONES_GUIADAS[codigo] ?? null;
}
