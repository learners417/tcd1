/**
 * guionesVideos.ts — Los guiones completos de cada video de El Camino (Lote B · jul 2026)
 *
 * Escritos con la voz de Javo, el método CLINICA y el libro Sanadores Libres.
 * Sirven DOS propósitos:
 *  1. Son el guión que Javo graba (referencia de producción).
 *  2. Alimentan al Mentor IA: cuando un video falta, el Mentor NO improvisa —
 *     enseña el contenido REAL del paso desde acá. Fin del "no necesitas ver el video".
 *
 * Estructura de cada guión: gancho → desarrollo → cierre, en beats.
 * Tono: fuerte, sincero, profundo, realista (Laín bien entendido: cree en la persona
 * más de lo que ella cree en sí misma). Sin humo, sin new age. Neutro latino (tú).
 */

export interface GuionVideo {
  codigo: string;
  titulo: string;
  duracion: string;
  /** El propósito del video en una línea (qué movimiento de identidad produce). */
  proposito: string;
  /** El guión completo, en beats. El Mentor lo usa como fuente de verdad del paso. */
  guion: string;
  /** La versión ultra-corta que el Mentor dice si el video falta (2-3 frases). */
  esencia: string;
}

export const GUIONES: Record<string, GuionVideo> = {
  // ═══════════════ FASE 0 · CONCIENCIA + ONBOARDING ═══════════════
  'P0.0': {
    codigo: 'P0.0',
    titulo: 'Bienvenida: de profesional a director',
    duracion: '4-5 min',
    proposito: 'Que el que llega quemado se sienta VISTO antes que instruido, y entienda el mapa completo.',
    guion: `[GANCHO · 0-15s]
Si estás acá, es porque llegaste a un techo. Tu agenda está llena y tu cuenta no refleja lo que vales. Y no es por falta de pacientes. Es por otra cosa — la misma que a mí me llevó años entender.

[QUIÉN SOY · 15-45s]
Soy Javo. No soy médico ni terapeuta. Pero crecí rodeado de sanadores: mi abuela, mi mamá. Y vi de cerca algo que casi nadie dice en voz alta — que los que curan a otros suelen ser los peores cuidando de sí mismos. Entrenados para dar, nunca para cobrar. Los llamo los mártires de su vocación.

[LA PROMESA · 45s-2min]
Estos 90 días tienen un objetivo concreto: que consigas 10 pacientes a tu precio digno — mil dólares cada uno — y, más importante, que te quede el SISTEMA para repetirlo sin depender de tu tiempo. No es un curso. Es tu clínica digital, instalada.

[CÓMO FUNCIONA · 2-3min]
Tienes dos llaves. Esta app, El Camino, es donde te construyes: una sesión por día, cuarenta y cinco minutos. Y Mi Clínica, tu otra app, es donde tu práctica ya empieza a ordenarse desde hoy.
El camino tiene siete etapas — se llaman CLINICA. No son pasos de un método de ventas: son cambios en cómo te ves a ti mismo. Vas a ganar cinturones, pero no por leer: por hacer cosas reales en el mundo. Cada cinturón es una identidad nueva.

[LA PRIMERA PARADA · 3-4min]
Y hay una primera parada que casi nadie se anima a dar: sanar tu relación con el dinero. Antes de vender nada, antes de un solo anuncio. Porque de nada sirve el mejor sistema si algo adentro tuyo te frena a cobrar lo que vales. Ahí empezamos.

[CIERRE · 4-4:30]
Si en algún momento quieres la filosofía completa detrás de todo esto, está en el libro, Sanadores Libres. Léelo cuando quieras. Para empezar no te hace falta. Lo único que necesitas hoy es dar el primer paso. Nos vemos adentro.`,
    esencia: 'Estos 90 días buscan que consigas 10 pacientes a tu precio digno ($1.000) y te quede el SISTEMA para repetirlo. Dos apps: El Camino (te construyes) y Mi Clínica (operas). Siete etapas CLINICA, cinturones que se ganan haciendo. La primera parada, la que nadie hace: sanar tu relación con el dinero.',
  },

  'P0.4': {
    codigo: 'P0.4',
    titulo: 'Cómo usar tu app + el pacto',
    duracion: '3 min',
    proposito: 'Que sepa moverse en la app y que firme el Pacto — su primera palabra empeñada.',
    guion: `[GANCHO · 0-10s]
Antes de arrancar, tres minutos para que no te pierdas nunca acá adentro. Y algo más importante que cualquier tutorial.

[LA APP · 10s-1:30]
Tu pantalla principal es el Tablero. Ahí, todos los días, vas a ver una sola cosa grande: tu sesión de hoy. No pienses en los 90 días — piensa en el de hoy. El Tablero siempre te dice qué sigue.
El Camino es el mapa completo, por si quieres ver a dónde vas. El ADN es tu negocio documentándose solo, sesión a sesión — al final es el manual de tu clínica. Y el Mentor está siempre, para cuando te trabes.

[LA REGLA · 1:30-2min]
La regla es simple: una sesión por día, de lunes a viernes. Sábado y domingo descansas — el Camino respira. No adelantes de más; el camino tiene un orden por una razón.

[EL PACTO · 2-3min]
Y ahora, lo único que te pido antes de empezar. No es un formulario. Es un pacto.
A los tuyos: a los que te formaron, y a los que dependen de ti. A tus pacientes: a los que ya ayudaste, y a los diez que todavía no te encontraron. Y a ti mismo: al profesional que decidió dejar de sobrevivir.
Vas a escribirlo con tus palabras, con fecha, y lo vas a firmar. Tu palabra empeñada es el primer cinturón. Hazlo ahora.`,
    esencia: 'El Tablero muestra tu sesión de hoy — piensa en el día, no en los 90. Una sesión por día, lu-vi, finde libre. Y antes de empezar: el Pacto, tu palabra empeñada a los tuyos, a tus pacientes y a ti mismo.',
  },

  // ═══════════════ FASE 1 · LIBERACIÓN · SANAR EL DINERO ═══════════════
  'P1.1': {
    codigo: 'P1.1',
    titulo: 'Por qué el dinero se sana primero',
    duracion: '3-4 min',
    proposito: 'Instalar la idea central: la relación rota con el dinero es la raíz, no la técnica.',
    guion: `[GANCHO · 0-15s]
Te voy a decir por qué la mayoría de los asesores de negocios fracasan con profesionales como tú. Porque arrancan por la táctica — el sistema, los anuncios, el precio. Y se saltean la raíz.

[LA RAÍZ · 15s-1:30]
Tú ya sabes que vales más. Lo sabes hace años. Entonces, ¿por qué no lo cobras? No es porque te falte técnica. Es porque algo adentro tuyo se activa cada vez que tienes que decir un número. Una incomodidad. Una culpa. Las manos que sudan.
Eso no es un problema técnico. Es una relación rota con el dinero. Y la mayoría la arrastra desde mucho antes de tener un consultorio.

[DE DÓNDE VIENE · 1:30-2:30]
En tu casa, ¿cómo se hablaba del dinero? ¿Era escaso, sucio, motivo de pelea? ¿Te enseñaron que las personas buenas no piensan en dinero, que cobrar mucho es de aprovechadores? Si te dedicas a ayudar, probablemente sí. Y esa creencia hoy te cuesta dinero real, todos los meses.

[LOS TRES SABOTAJES · 2:30-3:30]
Se manifiesta de tres formas. El que baja el precio antes de que el paciente lo pida — a veces antes de terminar de decirlo. El que justifica su precio con títulos y años, como si tuviera que ganarse el permiso de cobrar. Y el que trabaja de más, regala horas, para compensar la culpa de cobrar. ¿Te reconoces en alguno?

[CIERRE · 3:30-4min]
Por eso empezamos acá. No porque sea lindo. Porque es lo que ninguna táctica puede arreglar por encima. Sanas esto, y todo lo demás — el precio, la oferta, la venta — deja de costar. Los próximos días son de esto. Sostenlo.`,
    esencia: 'La razón por la que no cobras lo que vales no es técnica: es una relación rota con el dinero, casi siempre heredada de tu casa. Se ve en 3 sabotajes: bajar el precio preventivo, justificarlo con títulos, o trabajar de más por culpa. Sanamos esto primero porque ninguna táctica lo arregla por encima.',
  },

  'P1.4': {
    codigo: 'P1.4',
    titulo: 'El dinero en el cuerpo',
    duracion: 'Conversación con el Mentor',
    proposito: 'Que sienta dónde vive la incomodidad del dinero — no pensarla, sentirla.',
    guion: `[Este es un paso de MENTOR, no video. El Mentor guía así:]

La idea del día: el dinero no vive solo en la cabeza — vive en el cuerpo. Cuando piensas en cobrar el doble, algo pasa físicamente. El pecho se cierra, el estómago se aprieta, la garganta se traba.
Esa reacción es información. Es la creencia vieja defendiéndose.
El Mentor te va a pedir que imagines decir tu precio nuevo en voz alta, frente a un paciente, y que notes QUÉ pasa en tu cuerpo. Sin juzgarlo. Solo notarlo. Porque lo que se nota, se puede soltar. Lo que se ignora, sigue mandando.`,
    esencia: 'El dinero no vive solo en la cabeza — vive en el cuerpo. Cuando piensas en cobrar más, algo se tensa físicamente. Esa reacción es la creencia vieja defendiéndose. Notarla, sin juzgarla, es el primer paso para soltarla.',
  },

  // ═══════════════ FASE 2 · IDENTIDAD · TU MÉTODO ═══════════════
  'P2.1': {
    codigo: 'P2.1',
    titulo: 'Tu método propio: el activo que te diferencia',
    duracion: '3-4 min',
    proposito: 'Que entienda que ya tiene un método — solo que nunca lo sacó de su cabeza.',
    guion: `[GANCHO · 0-15s]
Te voy a decir algo que probablemente no sabes de ti mismo: ya tienes un método. Hace años que lo usas. Solo que nunca lo sacaste de tu cabeza, y por eso no lo puedes vender ni cobrar como lo que vale.

[EL PROBLEMA DE LO IMPLÍCITO · 15s-1:30]
Cuando un paciente mejora contigo, tú sabes por qué. Hay un orden en lo que haces — una primera sesión que siempre es parecida, un momento en que pasa el click, una forma tuya de acompañar. Eso es un método. Pero si vive solo en tu intuición, pasan tres cosas: no lo puedes repetir igual, no lo puedes delegar, y no lo puedes cobrar caro. Lo que no tiene nombre, no tiene precio.

[POR QUÉ IMPORTA · 1:30-2:30]
Nadie paga caro por sesiones sueltas. Paga caro por un proceso con nombre, con inicio y con final, que promete un resultado. "Diez sesiones de terapia" vale poco. "El Programa de Reconstrucción Emocional de 90 días" vale diez veces más — con el mismo conocimiento tuyo adentro. La diferencia no es lo que sabes. Es cómo lo empaquetas.

[EL AVATAR B · 2:30-3:15]
Y si eres de los que ya tienen años de práctica, esto es todavía más para ti. No vas a inventar nada. Vas a ORDENAR y ponerle nombre a lo que ya haces hace quince años sin darte cuenta. Es tu activo más valioso, enterrado.

[CIERRE · 3:15-4min]
En las próximas sesiones vamos a sacar tu método de tu cabeza, ordenarlo en pasos, y ponerle un nombre que sea tuyo. Cuando lo veas en la pantalla, con nombre, algo va a cambiar en cómo te ves. Vas a dejar de ser alguien que da sesiones. Vas a ser el dueño de un método.`,
    esencia: 'Ya tienes un método — hace años que lo usas, solo que nunca lo sacaste de tu cabeza. Lo que no tiene nombre no tiene precio: se paga caro por un proceso con nombre, no por sesiones sueltas. Vamos a ordenarlo y nombrarlo. Ahí dejas de dar sesiones y pasas a ser dueño de un método.',
  },

  // ═══════════════ FASE 3 · NARRATIVA · LA OFERTA ═══════════════
  'P3.1': {
    codigo: 'P3.1',
    titulo: 'La oferta que se vende sola',
    duracion: '3-4 min',
    proposito: 'Que entienda la anatomía de una oferta irresistible (Hormozi aplicado a salud).',
    guion: `[GANCHO · 0-15s]
Una buena oferta no se vende con técnicas de venta. Se vende sola — porque decir que no se vuelve la decisión irracional. Hoy vas a entender cómo se construye una así.

[EL CAMBIO DE MARCO · 15s-1:15]
El error es vender lo que HACES: "sesiones de nutrición", "consultas de kinesiología". A nadie le emociona comprar tu tiempo. Lo que se compra es el RESULTADO: verse bien en la playa en tres meses, volver a jugar con sus hijos sin dolor, dejar de despertarse con angustia. Vende el destino, no el vehículo.

[LOS CUATRO INGREDIENTES · 1:15-2:45]
Una oferta irresistible tiene cuatro partes. Primero, el resultado concreto — específico, medible, con tiempo. Segundo, el proceso — tu método con nombre, que le muestra CÓMO va a llegar. Tercero, la garantía — que le saca el miedo de encima; tú te la aguantas porque confías en tu trabajo. Y cuarto, los bonos — cosas que aumentan el valor sin aumentar tu costo. Cuando los cuatro están, el precio deja de ser el tema.

[EL PRECIO · 2:45-3:30]
Y sí, va a costar mil dólares o más. No porque seas caro, sino porque un resultado real vale eso. El que compara tu programa con una sesión suelta no entendió que no son lo mismo. Uno cambia tu tiempo por dinero. El otro cambia la vida del paciente. Tu trabajo es que se entienda la diferencia.

[CIERRE · 3:30-4min]
En la próxima sesión vas a construir la tuya, con la herramienta, usando todo lo que ya cargaste: tu avatar, tu método, tus transformaciones. Va a salir una oferta que tú mismo comprarías. Y esa es la prueba de que está bien hecha.`,
    esencia: 'Una oferta irresistible se vende sola porque decir que no se vuelve irracional. La clave: vende el RESULTADO, no tu tiempo. Cuatro ingredientes: resultado concreto + tu método con nombre + garantía + bonos. Cuando están los cuatro, el precio ($1.000+) deja de ser el tema, porque un resultado real vale eso.',
  },

  // ═══════════════ FASE 4 · INSTALACIÓN · EL SISTEMA ═══════════════
  'P4.1': {
    codigo: 'P4.1',
    titulo: 'El sistema que trabaja por ti, sin humo',
    duracion: '3-4 min',
    proposito: 'Desmitificar el sistema de captación — sin jerga, como algo que cualquiera puede montar.',
    guion: `[GANCHO · 0-15s]
Ahora viene la parte que más asusta y menos debería: el sistema que te consigue pacientes sin que estés tú presente. Te lo voy a explicar sin una sola palabra rara.

[EL PROBLEMA DE HOY · 15s-1min]
Hoy tus pacientes llegan por boca a boca. Está buenísimo — pero tiene un techo: depende de que otros te recomienden, y no lo controlas tú. Si quieres crecer sin depender de la suerte, necesitas un sistema que puedas prender y apagar. Eso es todo lo que vamos a construir.

[LAS CUATRO PIEZAS · 1-2:30]
Son cuatro piezas, y ya tienes casi todas. Uno: un mensaje que atrae a tu paciente ideal — no a cualquiera, al tuyo. Dos: un lugar donde ese mensaje vive, tu página. Tres: un asistente que responde a los interesados a cualquier hora, aunque estés durmiendo o atendiendo. Y cuatro: una agenda donde el interesado reserva una llamada contigo. Contenido que atrae, página que explica, asistente que responde, agenda que reserva. Eso es el sistema. Nada más.

[SIN MIEDO A LA TÉCNICA · 2:30-3:15]
Sé lo que estás pensando: "yo no sé de esto". No hace falta. Cada pieza tiene su tutorial paso a paso, y si te trabas, tienes al equipo y al Mentor. Miles de profesionales que le tenían pánico a la tecnología montaron esto. No eres la excepción.

[CIERRE · 3:15-4min]
Las próximas sesiones son las más técnicas del camino. Vas a instalar cada pieza, una por vez, sin apuro. Al final vas a tener algo que casi ningún colega tuyo tiene: una máquina de conseguir pacientes que funciona sin ti encima. Respira hondo. Empezamos a instalar.`,
    esencia: 'El sistema de captación son 4 piezas simples: un mensaje que atrae a tu paciente ideal, una página donde vive, un asistente que responde a cualquier hora, y una agenda donde reservan. Contenido que atrae, página que explica, asistente que responde, agenda que reserva. Cada pieza tiene tutorial — no necesitas saber de tecnología.',
  },

  'P4.5b': {
    codigo: 'P4.5b',
    titulo: 'Tu dirección digital — el dominio',
    duracion: '3 min',
    proposito: 'Que entienda por qué su dominio propio importa y que el paso técnico es guiado.',
    guion: `[GANCHO · 0-15s]
Tu clínica necesita una dirección propia en internet. Igual que tu consultorio tiene una dirección en la calle. Hoy la conseguimos — y sí, es técnico, pero te llevo de la mano.

[POR QUÉ IMPORTA · 15s-1min]
Cuando alguien ve tu link, tiene que llevar TU nombre — no el de una plataforma genérica. "juanperez.com" transmite un profesional serio. Un link largo y raro de una app prestada transmite lo contrario. Tu dirección digital es parte de cómo te ven antes de conocerte.

[QUÉ VAS A HACER · 1-2:15]
Dos caminos. Si ya tienes un dominio, hoy lo conectas — vas a copiar dos datos que se llaman registros DNS, pegarlos donde te muestro, y listo. Si no tienes, compras uno simple: tu nombre, terminado en punto com, cuesta unos doce dólares al año. El tutorial te muestra cada clic.
Una cosa importante: después de conectarlo, a veces tarda unas horas en activarse. Es normal, no rompiste nada. Se sigue al día siguiente.

[CIERRE · 2:15-3min]
Cuando termine, vas a tener un link con tu nombre que puedes compartir con orgullo. Tu dirección en el mundo digital, tuya para siempre. Es un paso chico que cambia cómo te perciben los demás. Vamos.`,
    esencia: 'Tu clínica necesita una dirección digital propia (tu-nombre.com) — transmite seriedad, a diferencia de un link genérico. Si ya tienes dominio, lo conectas con 2 registros DNS (guiado paso a paso); si no, compras uno simple (~$12/año). Si tarda horas en activarse, es normal.',
  },

  // ═══════════════ FASE 5 · COBRO · LA VENTA ═══════════════
  'P5.1': {
    codigo: 'P5.1',
    titulo: 'Anatomía de la llamada que cierra',
    duracion: '3-4 min',
    proposito: 'Que entienda que vender bien es diagnosticar, no convencer — la venta sin presión.',
    guion: `[GANCHO · 0-15s]
La llamada de venta que funciona no se parece en nada a lo que imaginas. No hay que convencer a nadie. Al contrario: cuanto menos empujas, más venden. Te explico por qué.

[EL CAMBIO DE MARCO · 15s-1:15]
Tú ya sabes hacer esto — porque es exactamente lo que haces con un paciente. No lo convences de que está enfermo: le haces preguntas hasta que ÉL entiende su problema y te pide ayuda. La venta es igual. No es un pitch. Es un diagnóstico. El que pregunta bien, cierra.

[LAS CINCO ETAPAS · 1:15-2:45]
La llamada tiene cinco momentos. Apertura: bajas la guardia, esto es una conversación, no un interrogatorio. Dolor: preguntas hasta que la persona pone en palabras lo que le duele — con SUS palabras, no las tuyas. Cielo: le haces imaginar cómo sería su vida resuelto el problema. Obstáculos: qué lo frenó hasta ahora. Y recién ahí, cierre: presentas tu programa como el puente entre su dolor y su cielo. Si hiciste bien las primeras cuatro, el cierre casi se dice solo.

[EL PRECIO SIN TEMBLAR · 2:45-3:30]
Y cuando llega el precio, lo dices y te callas. No lo justifiques. No agregues "pero puedo hacerte un descuento". El precio se presenta, no se pide perdón por él. El silencio después del número es incómodo — bancátelo. El que habla primero, pierde.

[CIERRE · 3:30-4min]
En las próximas sesiones vas a armar tu guión con estas cinco etapas, adaptado a tu método, y lo vas a practicar hasta que salga natural. Cuando llegue tu primera llamada real, no vas a estar improvisando. Vas a estar diagnosticando. Como siempre supiste hacer.`,
    esencia: 'Vender bien no es convencer — es diagnosticar, igual que con un paciente: preguntas hasta que ÉL entiende su problema y te pide ayuda. Cinco etapas: Apertura, Dolor, Cielo, Obstáculos, Cierre. El precio se presenta y te callas — no lo justifiques. El que habla primero después del número, pierde.',
  },

  // ═══════════════ FASE 6 · COBRO · LA ENTREGA ═══════════════
  'P6.1': {
    codigo: 'P6.1',
    titulo: 'Entregar sin quemarte',
    duracion: '3 min',
    proposito: 'Que entienda cómo entregar un programa de alto valor sin volver al modelo de agotamiento.',
    guion: `[GANCHO · 0-15s]
Conseguiste el paciente, cobraste tu precio digno. Ahora el peligro más silencioso: entregar tanto que vuelvas al agotamiento del que saliste. Hoy, cómo entregar sin quemarte.

[LA TRAMPA DEL QUE DA DE MÁS · 15s-1:15]
El sanador tiene un reflejo peligroso: como cobró bien, siente que tiene que compensar dando el triple. Más sesiones, más mensajes a cualquier hora, más de todo. Y en dos meses estás igual de quemado que antes, pero ahora con pacientes que esperan que estés disponible siempre. El precio alto no se paga con más horas tuyas. Se paga con mejor resultado.

[EL PROTOCOLO · 1:15-2:15]
La solución es tener un protocolo de entrega: un camino claro y repetible que el paciente recorre. Qué pasa en cada etapa, qué recibe, cuándo. Cuando está definido, dejas de improvisar con cada uno y de estar disponible las 24 horas. El paciente recibe MÁS valor con MENOS desgaste tuyo, porque todo está pensado de antemano. Tu tiempo se vuelve tuyo de nuevo.

[CIERRE · 2:15-3min]
En la próxima sesión vas a documentar tu protocolo, paso a paso. Es lo mismo que después va a vivir en Mi Clínica, tu app de operación, para que cada paciente lo siga solo. Entregas transformación, no disponibilidad. Esa es la diferencia entre un negocio y una condena.`,
    esencia: 'El peligro después de cobrar bien: compensar dando el triple y volver al agotamiento. El precio alto NO se paga con más horas tuyas, se paga con mejor resultado. La solución es un protocolo de entrega claro y repetible: el paciente recibe más valor con menos desgaste tuyo. Entregas transformación, no disponibilidad.',
  },

  // ═══════════════ FASE 7 · AUTONOMÍA ═══════════════
  'P7.1': {
    codigo: 'P7.1',
    titulo: 'La máquina de 10 por mes',
    duracion: '3-4 min',
    proposito: 'Que vea el sistema completo funcionando y entienda que ahora dirige, no ejecuta.',
    guion: `[GANCHO · 0-15s]
Llegaste. Tienes tu método, tu oferta, tu sistema, tus primeras ventas. Ahora la pregunta cambia: ya no es "cómo consigo un paciente", es "cómo convierto esto en algo que funciona todos los meses sin mí encima".

[DE EJECUTAR A DIRIGIR · 15s-1:30]
Los primeros pacientes los conseguiste haciendo todo tú. Eso está bien para arrancar — pero no crece. La diferencia entre un profesional ocupado y un director de clínica es esta: el ocupado hace el trabajo; el director hace que el trabajo se haga. Tu campaña corre sola, tu asistente responde solo, tu agenda se llena sola. Tú revisas los números y ajustas. Dejaste de ser el sistema. Ahora lo diriges.

[EL RITMO NUEVO · 1:30-2:30]
Tu semana ya no es cuarenta y cinco minutos de tarea. Es una revisión: qué números dieron, qué anuncio funcionó mejor, cuántas llamadas, cuántos cierres. Media hora por semana mirando el tablero y tomando una o dos decisiones. Eso es dirigir. El resto del tiempo — el que antes se comía tu negocio — ahora es tuyo. Para atender mejor, para tu familia, para ti.

[EL LEGADO · 2:30-3:30]
Y hay algo más grande. Tú empezaste como un profesional quemado, mártir de tu vocación. Y estás terminando como alguien que resolvió eso. Esa transformación es, ahora, tu mejor activo. Porque hay miles de colegas tuyos exactamente donde ti estabas hace noventa días. Eres libre. Ahora te toca liberar a otros.

[CIERRE · 3:30-4min]
Lo que sigue no es un final. Es tu clínica funcionando, y tú a cargo de verdad. La revisión semanal te va a acompañar de acá en adelante. Bienvenido al otro lado. Bienvenido, sanador libre.`,
    esencia: 'Ya tienes método, oferta, sistema y ventas. Ahora la diferencia es de ejecutar a dirigir: el ocupado hace el trabajo, el director hace que el trabajo se haga. Tu semana pasa a ser una revisión de 30 min de los números. El tiempo que antes se comía tu negocio ahora es tuyo. Eres libre — ahora te toca liberar a otros.',
  },

  // ════════════════════════════════════════════════════════════════════
  // LAS VEINTICINCO QUE QUEDABAN SIN NADA (23 oct)
  //
  // Veinticinco jornadas tenían su instrucción pero no su enseñanza: el
  // cliente llegaba, leía qué hacer, y la razón por la que se hace no estaba
  // en ninguna parte. La pantalla no quedaba vacía, que es lo que la vuelve
  // difícil de ver: decía «Tu sesión, escrita» y abajo los pasos.
  //
  // El texto es la lección. El video se suma arriba cuando Javo lo grabe, y
  // esto queda como su guión de grabación.
  //
  // Escritas con la vara que la app se impone a sí misma y se mide con
  // `lente-lenguaje.ts`: sin jerga, sin símbolos, sin códigos internos, y
  // ninguna frase de más de veintidós palabras.
  // ════════════════════════════════════════════════════════════════════

  'P1.0': {
    codigo: 'P1.0',
    titulo: 'Tu hora real neta',
    duracion: '6 min',
    proposito: 'Que vea el número que explica por qué trabaja tanto y le queda poco.',
    guion: `[GANCHO · 0-20s]
Hay un número que casi ningún profesional de la salud conoce. Y es el que explica todo lo demás.

[QUÉ NO ES · 20s-1min]
No es lo que cobras la sesión. Ese número lo sabes de memoria.
Tu hora real neta es otra cosa. Es lo que te queda al final del mes, dividido por todas las horas que pusiste.
Todas. No solo las que facturas.

[LAS HORAS QUE NADIE CUENTA · 1-2:30]
Hagamos la lista completa.
La preparación antes de cada sesión. El resumen después.
El mensaje que contestaste el domingo a la noche.
El traslado. La espera. El que avisó que no venía media hora antes.
Los pagos que persigues. La contabilidad. Las horas de estudio.
Y la que menos se cuenta: el tiempo que tu trabajo te ocupa la cabeza mientras cenas con tu familia.

[EL NÚMERO · 2:30-4min]
Suma todo eso y divide lo que te quedó.
A la mayoría le aparece un número que duele. Más bajo de lo que paga cualquier trabajo sin años de formación encima.
Y ahí aparece la pregunta real. No es si trabajas mucho: eso ya lo sabes.
Es por qué trabajas tanto y te queda tan poco.

[LOS DOS CAMINOS · 4-5min]
Desde ese número hay exactamente dos salidas, y las dos se trabajan en estos noventa días.
Cobrar más por la misma hora.
Y poner menos horas para el mismo resultado.
La primera empieza con tu precio. La segunda, con tu método escrito, que es lo que te saca de improvisar cada vez.

[CIERRE · 5-6min]
Hoy calculas tu hora real neta y la anotas. Escribe el número aunque te incomode.
El día ochenta y siete lo vuelves a calcular.
Esa diferencia, en números, es exactamente lo que viniste a buscar.`,
    esencia: 'Tu hora real neta es lo que te queda al mes dividido por TODAS las horas que pusiste: la preparación, el resumen, el mensaje del domingo, el traslado, el que canceló, la contabilidad. A casi todos les aparece un número que duele. No es tu condena: es tu punto de partida. Desde ahí hay dos salidas y las dos se trabajan acá — cobrar más por la misma hora, y poner menos horas para el mismo resultado.',
  },

  'P2.4b': {
    codigo: 'P2.4b',
    titulo: 'La prueba de tu método',
    duracion: '6 min',
    proposito: 'Que pase su método por los tres exámenes de la arquitectura antes de venderlo.',
    guion: `[GANCHO · 0-20s]
Tu método ya está escrito. Ahora hay que ver si se sostiene.
Y para eso te traigo tres preguntas que no son mías: son de mi hermano, que es arquitecto.

[DE DÓNDE SALEN · 20s-1min]
Él construye edificios. Yo construyo negocios. Y hablando descubrimos que las preguntas son las mismas.
Un edificio que se cae no se cae por el color de la fachada. Se cae por el orden de lo que va primero.
Tu método es una construcción. Pasa los mismos tres exámenes.

[PRIMER EXAMEN · EL ORDEN · 1-2:30]
¿Cada etapa necesita la anterior?
Si puedes dar la etapa tres sin la dos, entonces no tienes un método: tienes una lista de temas.
Nadie pone el techo antes de las columnas. En tu método tiene que pasar lo mismo.
Revisa las tuyas de atrás para adelante. Pregúntate qué se rompe si saco esta.
Lo que puedas sacar sin que se rompa nada, sácalo. Es relleno.

[SEGUNDO EXAMEN · EL PESO · 2:30-4min]
¿Cada etapa carga su parte?
En un edificio hay muros que sostienen y muros que solo dividen. Se parecen y no son lo mismo.
Mira cada etapa y di en voz alta qué cambia en la persona cuando la termina.
Si no puedes decirlo en una frase, esa etapa divide pero no sostiene.

[TERCER EXAMEN · EL PLANO · 4-5min]
¿Se puede construir dos veces igual?
Un plano sirve si otro puede leerlo y levantar lo mismo.
Tu método tiene que funcionar también cuando lo aplicas al que llega más perdido.
Y tiene que poder enseñárselo a alguien que te ayude. Si solo funciona contigo adentro, todavía es tu talento.

[CIERRE · 5-6min]
Pasa tus etapas por los tres y corrige lo que aparezca.
Un método que pasa estas tres preguntas se puede vender sin descuento, enseñar y entregar sin ti en cada paso.
Eso es lo que estás construyendo.`,
    esencia: 'Tu método pasa los tres exámenes de la arquitectura: el ORDEN (¿cada etapa necesita la anterior? si no, es una lista de temas, no un método), el PESO (¿qué cambia en la persona al terminar cada etapa? si no lo dices en una frase, esa etapa divide pero no sostiene) y el PLANO (¿puede otro leerlo y levantar lo mismo? si solo funciona contigo adentro, todavía es tu talento y no tu método).',
  },

  'P3.9': {
    codigo: 'P3.9',
    titulo: 'Tu primer cobro al precio nuevo',
    duracion: '4 min',
    proposito: 'Que atraviese el momento donde el precio nuevo se vuelve real, sin bajarlo.',
    guion: `[GANCHO · 0-15s]
Hoy dices tu precio nuevo en voz alta, a una persona de verdad.
Es la jornada más corta del camino y la que más se posterga.

[LO QUE VA A PASAR · 15s-1min]
Vas a decir el número y después va a haber silencio.
Ese silencio te va a parecer larguísimo. Dura dos segundos.
Y en esos dos segundos vas a sentir unas ganas enormes de agregar algo. De explicar. De justificar. De ofrecer una facilidad que nadie te pidió.

[LA REGLA · 1-2min]
Di el número y espera.
No lo acompañes. No lo expliques. No pongas «pero».
Lo que pasa después es información, y es tuya.
Si la persona pregunta cómo se paga, está avanzando.
Si dice que lo va a pensar, está pensando.
Si dice que es mucho, eso es una frase y no un veredicto.

[POR QUÉ IMPORTA · 2-3min]
El precio no se sostiene con argumentos. Se sostiene con calma.
Cuando te apuras a justificarlo, le estás avisando a la otra persona que tú tampoco lo crees.
Y cuando lo dices tranquilo, la conversación cambia de tema sola: deja de ser cuánto cuesta y pasa a ser si esto es para mí.

[CIERRE · 3-4min]
Una sola vez hoy. A una persona.
Después anota qué sentiste y qué contestó.
A la segunda ya no se siente igual. A la quinta es tu precio.`,
    esencia: 'Hoy dices tu precio nuevo en voz alta a una persona real. Después del número viene un silencio de dos segundos que te va a parecer larguísimo, y unas ganas enormes de explicar o de ofrecer una facilidad que nadie pidió. La regla: di el número y espera. El precio no se sostiene con argumentos, se sostiene con calma — cuando te apuras a justificarlo le avisas al otro que tú tampoco lo crees.',
  },

  'P4.2e-i': {
    codigo: 'P4.2e-i',
    titulo: 'Intro · antes del formulario',
    duracion: '1,5 min',
    proposito: 'Que entienda que el formulario filtra, para que no lo escriba como un registro de datos.',
    guion: `[GANCHO · 0-15s]
Antes de armar tu formulario, una cosa que cambia cómo lo escribes.

[EL CAMBIO · 15-50s]
El formulario no está para juntar datos. Está para filtrar.
Si lo escribes pensando en datos, pides todo y pierdes a los que servían.
Si lo escribes pensando en filtrar, haces pocas preguntas y cada una decide algo.

[LA PRUEBA · 50s-1:20]
Mira cada pregunta y pregúntate qué harías distinto según la respuesta.
Si la respuesta no cambia nada de lo que vas a hacer, esa pregunta sobra.
La buena noticia es que el que no califica también se da cuenta solo. Y así no te ocupa la hora.

[CIERRE · 1:20-1:30]
Pocas preguntas, cada una con un propósito. Vamos a armarlo.`,
    esencia: 'El formulario no junta datos: filtra. La prueba de cada pregunta es qué harías distinto según la respuesta — si no cambia nada de lo que vas a hacer, esa pregunta sobra. Pocas preguntas y cada una decide algo. Así el que no califica se da cuenta solo y no te ocupa la hora.',
  },

  'P3.2b': {
    codigo: 'P3.2b',
    titulo: 'Tu garantía de extensión',
    duracion: '6 min',
    proposito: 'Que escriba una garantía que le saca el riesgo al otro sin ponerle el riesgo a él.',
    guion: `[GANCHO · 0-20s]
Hoy escribes tu garantía. Y no es la que estás pensando.

[EL PROBLEMA DE DEVOLVER EL DINERO · 20s-1:30]
La garantía de devolución parece generosa y hace dos cosas raras.
La primera: le avisa a la persona que el resultado depende de ti solo. Y no es cierto. Depende de las dos partes.
La segunda: te pone a trabajar con alguien que ya tiene una salida abierta. El que tiene la puerta abierta entra distinto.
Y en nuestro trabajo hay algo más. Lo que entregas no se devuelve. Las sesiones ya pasaron.

[LA GARANTÍA QUE SÍ · 1:30-3min]
Mi garantía es esta: no te devuelvo dinero, te devuelvo trabajo.
Si hiciste tu parte y el resultado no está, seguimos sin que pagues de nuevo.
Eso le saca el riesgo a la otra persona sin sacarle su responsabilidad. Y a ti no te deja la deuda de un reembolso.

[LA PARTE QUE CASI NADIE ESCRIBE · 3-4:30]
Una garantía sin la vara es una promesa que no se puede cumplir.
Escribe en una frase qué significa que la persona hizo su parte.
Lo que hace, con qué frecuencia, y en qué plazo entrega lo que le toca.
Concreto y comprobable. Nada de «poner ganas».
Esa frase es lo que te permite sostenerla sin pelear. Cuando la vara está escrita de antes, la conversación es corta.

[CIERRE · 4:30-6min]
Escribe las dos partes hoy: qué haces tú si falta el resultado, y qué cuenta como su parte.
Después léelas en voz alta. Si hay alguna que no querrías cumplir, cámbiala ahora.
Una garantía se escribe una vez y se usa durante años.`,
    esencia: 'Tu garantía no devuelve dinero: devuelve trabajo. Si la persona hizo su parte y el resultado no está, sigues sin que pague de nuevo. Eso le saca el riesgo sin sacarle la responsabilidad, y a ti no te deja la deuda de un reembolso. La parte que casi nadie escribe es la vara: qué significa, concreto y comprobable, que hizo su parte. Con la vara escrita de antes, la conversación es corta.',
    },

  'P4.1c': {
    codigo: 'P4.1c',
    titulo: 'Frío o tibio, tu camino',
    duracion: '5 min',
    proposito: 'Que elija por dónde empezar según lo que ya tiene, en vez de hacer las dos cosas mal.',
    guion: `[GANCHO · 0-20s]
Hay dos formas de que te llegue alguien nuevo. Hoy eliges una, no las dos.

[LOS DOS CAMINOS · 20s-1:30]
El tibio es quien ya te conoce. Te sigue, te leyó, te escuchó, o alguien se lo dijo.
El frío es quien nunca te vio.
Son dos trabajos distintos, con dos tiempos distintos. Y el error más caro es arrancar los dos a la vez.

[CUÁNDO EMPEZAR POR LO TIBIO · 1:30-2:30]
Si tienes personas alrededor, empieza ahí.
Los que ya atendiste. Los que preguntaron y quedó en nada. Los que te siguen y nunca te escribieron.
Es más rápido, no cuesta dinero, y tiene algo que lo frío no da: te enseña a vender tu oferta antes de pagar por mostrarla.

[CUÁNDO EMPEZAR POR LO FRÍO · 2:30-3:30]
Si alrededor hay poco, o si ya recorriste a los tuyos, vas a lo frío.
Ahí ganas volumen y no dependes de a quién conoces.
Pide tres cosas antes: tu oferta clara, tu página andando y tu precio firme.
Sin esas tres, lo frío les muestra a muchas personas lo que todavía no está listo.

[CÓMO ELEGIR HOY · 3:30-4:30]
Cuenta cuántas personas podrías nombrar ahora mismo que podrían decir que sí.
Si son más de diez, tienes trabajo tibio para dos semanas. Empieza ahí.
Si son menos, prepara lo frío mientras hablas con esas pocas.

[CIERRE · 4:30-5min]
Elige uno y escríbelo. El otro no desaparece: entra después.
Lo que no funciona es repartirte entre los dos desde el primer día.`,
    esencia: 'Dos formas de que te llegue alguien nuevo, y hoy eliges una. El TIBIO es quien ya te conoce: más rápido, sin costo, y te enseña a vender tu oferta antes de pagar por mostrarla. El FRÍO es quien nunca te vio: te da volumen, y pide tu oferta clara, tu página andando y tu precio firme. Cuenta a cuántas personas podrías nombrar hoy que podrían decir que sí: más de diez, empieza por lo tibio. El error más caro es arrancar los dos a la vez.',
  },

  'P5.4-i': {
    codigo: 'P5.4-i',
    titulo: 'Intro · antes de grabar llamadas',
    duracion: '1,5 min',
    proposito: 'Que grabe desde la primera llamada, no desde la que le salga mal.',
    guion: `[GANCHO · 0-15s]
Desde hoy grabas todas tus llamadas. Te explico en un minuto por qué.

[LA RAZÓN · 15-55s]
Lo que recuerdas de una llamada no es lo que pasó. Es lo que te dejó tranquilo.
La memoria guarda el final y borra el momento exacto en que la persona se enfrió.
Y ese momento es el único que te sirve para mejorar.

[EL AVISO · 55s-1:20]
Avisa en una línea al empezar, y lo dices tranquilo: la grabo para revisarla después.
Nadie dice no. Y sin avisar, no se puede usar.

[CIERRE · 1:20-1:30]
Prende la grabación automática hoy, y no vuelvas a depender de acordarte.`,
    esencia: 'Lo que recuerdas de una llamada es lo que te dejó tranquilo, no lo que pasó: la memoria guarda el final y borra el momento exacto en que la persona se enfrió — y ese es el único que sirve para mejorar. Prende la grabación automática hoy y avisa en una línea al empezar: nadie dice no, y sin avisar no se puede usar.',
  },

  'P4.2b': {
    codigo: 'P4.2b',
    titulo: 'Tu perfil en veinte minutos',
    duracion: '3 min',
    proposito: 'Que su perfil deje de ser una presentación y pase a decidir en tres segundos.',
    guion: `[GANCHO · 0-15s]
Tu perfil tiene tres segundos para que alguien decida si se queda. Hoy lo arreglas en veinte minutos.

[LO QUE DECIDE · 15s-1min]
Quien llega a tu perfil busca una sola cosa: si esto es para mí.
Y no lo busca leyendo. Lo busca en la primera línea y en la foto.
Tu formación, tus años y tus títulos importan después. En los primeros tres segundos no contestan esa pregunta.

[LAS CUATRO COSAS · 1-2min]
Arriba, una línea con a quién ayudas y con qué resultado. Las dos cosas en la misma frase.
Debajo, una prueba de que ya lo hiciste.
Tu foto mirando a cámara, con luz de día y fondo liso.
Y el enlace a tu página, no a tu mensaje directo. El enlace tiene que llevar a un lugar donde se pueda avanzar sin ti.

[EL ERROR MÁS COMÚN · 2-2:40]
Escribir lo que eres en lugar de lo que haces por alguien.
«Licenciada en nutrición» dice tu título. «Ayudo a mujeres con tiroides a comer sin miedo» dice si es para mí.
Las dos pueden estar. Primero la segunda.

[CIERRE · 2:40-3min]
Veinte minutos. Y cuando termines, ábrelo desde el teléfono de otra persona y pregúntale qué entendió.
Si no puede repetir a quién ayudas, vuelve a la primera línea.`,
    esencia: 'Tu perfil tiene tres segundos para que alguien decida si esto es para él, y no lo decide leyendo: lo decide en la primera línea y en la foto. Cuatro cosas: a quién ayudas y con qué resultado en la misma frase, una prueba de que ya lo hiciste, tu foto a cámara con luz de día, y el enlace a tu página (no a tus mensajes). El error más común es escribir lo que eres en vez de lo que haces por alguien.',
  },

  'P4.2d': {
    codigo: 'P4.2d',
    titulo: 'Crear tu página con Claude',
    duracion: '10 min',
    proposito: 'Que arme su página pidiéndola en castellano, con las piezas que ya escribió.',
    guion: `[GANCHO · 0-20s]
Hoy armas tu página. Y no vas a diseñar nada: la vas a pedir en castellano.

[LO QUE YA TIENES · 20s-1:30]
Todo lo que tu página necesita está escrito desde la semana pasada.
A quién ayudas. Tu método con sus etapas. Tu oferta. Tu precio. Tu garantía.
Eso es el contenido, y es la parte difícil. Ya la hiciste.
Lo que falta es el orden y el aspecto, y eso se pide.

[CÓMO SE PIDE · 1:30-4min]
Abre tu conversación y pega tus piezas tal como las escribiste.
Después pide la página en este orden, que es el que funciona.
Arriba, tu frase de a quién ayudas y con qué resultado, con el botón de agendar al lado.
Debajo, para quién es y para quién no. Ser claro con el no te ahorra llamadas.
Después tu método, con una línea por etapa.
Después tu prueba. Después tu oferta con el precio. Después tu garantía.
Y al final el mismo botón otra vez.

[LAS DOS REGLAS DEL PEDIDO · 4-6:30]
Primero: pide una sola cosa por vez y mírala antes de seguir.
Cuando pides diez cambios juntos, no sabes cuál rompió qué.
Segundo: pide en castellano lo que quieres que pase, no el detalle técnico.
«Que en el teléfono la primera pantalla se lea sin tocar nada» funciona mejor que un pedido de medidas.

[LO QUE TIENE QUE SOBREVIVIR · 6:30-8:30]
Antes de darla por hecha, tres pruebas.
Ábrela en el teléfono: la primera pantalla tiene que decir a quién ayudas, sin deslizar.
Toca el botón y llega hasta el final de la agenda.
Y léela en voz alta. Si hay una frase que no dirías, cámbiala.

[CIERRE · 8:30-10min]
Esta página te va a acompañar meses y la vas a poder cambiar tú mismo cuando quieras.
Eso es lo que estamos construyendo: que no dependas de nadie para mover una coma.`,
    esencia: 'Tu página no se diseña: se pide en castellano, y todo su contenido ya lo escribiste. El orden que funciona: tu frase de a quién ayudas con el botón al lado, para quién es y para quién no, tu método etapa por etapa, tu prueba, tu oferta con el precio, tu garantía, y el botón otra vez. Dos reglas al pedir: una cosa por vez, y pide lo que quieres que pase, no el detalle técnico. Tres pruebas: en el teléfono la primera pantalla se lee sin deslizar, el botón llega hasta el final, y la lees en voz alta.',
  },

  'P4.3e': {
    codigo: 'P4.3e',
    titulo: 'Cómo se arma tu video de venta',
    duracion: '8 min',
    proposito: 'Que entienda la estructura antes de grabar, para no grabar siete veces.',
    guion: `[GANCHO · 0-20s]
Hoy entiendes cómo se arma el video que vende por ti. Grabarlo es después.

[QUÉ TRABAJO HACE · 20s-1:30]
Este video reemplaza la conversación que hoy tienes veinte veces por semana.
La persona lo mira, entiende si es para ella, y llega a tu llamada sabiendo qué le ofreces.
Y ahí cambia tu día: dejas de explicar lo mismo y empiezas a hablar solo con los que ya entendieron.

[LA ESTRUCTURA · 1:30-5min]
Siete partes, en este orden.
Primero, el momento. Describe dónde está la persona hoy, con una escena que reconozca.
Segundo, por qué no salió antes. Nombra lo que ya probó y no funcionó. Sin culpar a nadie.
Tercero, el error que lo mantiene ahí. Esta es la parte que hace que se quede mirando.
Cuarto, lo que sí funciona. Acá recién aparece tu método, y aparece como la salida de ese error.
Quinto, quién eres y por qué puedes decir esto. Corto: lo que viviste y a cuántos acompañaste.
Sexto, tu prueba. Lo que les pasó a otros, en concreto.
Séptimo, qué hacer ahora. Una sola acción, dicha una sola vez.

[LAS DOS REGLAS DE LA GRABACIÓN · 5-7min]
La primera: habla como hablarías con una persona sentada enfrente.
Lo que suena a presentación se apaga. Lo que suena a conversación se queda.
La segunda: arranca por lo más fuerte. Los primeros diez segundos deciden si hay video o no.
Nada de agradecer, de presentarte o de explicar de qué vas a hablar. Entra directo en el momento.

[CIERRE · 7-8min]
Hoy escribes las siete partes, en puntos, no en párrafos.
El día de grabar las vas a tener delante y vas a hablar, no leer.
Lo que se lee se nota, y lo que se nota no vende.`,
    esencia: 'Tu video de venta reemplaza la conversación que hoy tienes veinte veces por semana. Siete partes, en orden: el momento donde está la persona hoy, por qué no salió antes, el error que la mantiene ahí, lo que sí funciona (acá aparece tu método), quién eres y por qué puedes decirlo, tu prueba, y una sola acción al final. Dos reglas: habla como con alguien sentado enfrente, y arranca por lo más fuerte — los primeros diez segundos deciden si hay video.',
  },

  'P4.4': {
    codigo: 'P4.4',
    titulo: 'Tu campaña única',
    duracion: '7 min',
    proposito: 'Que encienda una sola campaña y resista la tentación de encender diez.',
    guion: `[GANCHO · 0-20s]
Hoy enciendes. Una campaña, no diez. Y te voy a explicar por qué una es más que diez.

[POR QUÉ UNA · 20s-2min]
Cuando reparte su dinero entre diez pruebas, ninguna junta información suficiente.
Diez campañas con poco presupuesto cada una te dan diez resultados que no dicen nada.
Una campaña con todo el presupuesto adentro aprende rápido y te dice algo en tres días.
Y hay otra razón, más importante: con una sola puedes entender qué pasó. Con diez, no.

[QUÉ LLEVA ADENTRO · 2-4min]
Un objetivo: que te agenden. No visitas, no mensajes, no seguidores.
Un público amplio de tu zona y tu rango de edad. Amplio a propósito: el sistema encuentra mejor que tú.
Tus tres anuncios juntos adentro. Tres, no uno: hace falta comparar.
Y presupuesto por día, nunca por total. Por día se controla; por total se gasta antes de que mires.

[LO QUE VA A PASAR LOS PRIMEROS DÍAS · 4-5:30]
Los dos primeros días los números van a estar mal. Es así para todos.
El sistema está probando a quién mostrarte y todavía no sabe.
No toques nada en esas cuarenta y ocho horas. Cada cambio reinicia el aprendizaje y vuelves a empezar.
El tercer día ya hay con qué mirar.

[CUÁNDO SÍ SE TOCA · 5:30-6:30]
Un cambio por vez, y esperando tres días entre uno y otro.
Apagar el anuncio que claramente no funciona. Subir de a poco el presupuesto del que sí.
Eso es todo lo que hay que hacer la primera semana.

[CIERRE · 6:30-7min]
Programa que arranque mañana a primera hora, no esta noche.
Y antes de publicar, mira la vista previa de cada anuncio en el teléfono. Ahí se ven los errores que en la computadora no.`,
    esencia: 'Una campaña, no diez: diez con poco presupuesto cada una te dan diez resultados que no dicen nada, y con una sola puedes entender qué pasó. Adentro: un objetivo (que te agenden), un público amplio de tu zona, tus tres anuncios juntos para poder comparar, y presupuesto por día y nunca por total. Los dos primeros días los números van a estar mal y no se toca nada — cada cambio reinicia el aprendizaje. Después, un cambio por vez esperando tres días.',
  },

  'P4.4b': {
    codigo: 'P4.4b',
    titulo: 'Crear tu campaña, paso a paso',
    duracion: '7 min',
    proposito: 'Que la monte de punta a punta sin trabarse en las tres pantallas donde todos se traban.',
    guion: `[GANCHO · 0-15s]
Vamos a montarla juntos. Son tres pantallas y en cada una hay una sola decisión que importa.

[PANTALLA UNO · EL OBJETIVO · 15s-2min]
Elige el objetivo de conseguir contactos o agendas, según lo que te ofrezca tu cuenta.
Acá está el error que cuesta más caro: elegir el objetivo de visitas porque suena parecido.
Con visitas pagas por curiosos. Con agendas pagas por personas que dejaron sus datos.
Ponle a la campaña un nombre que entiendas en tres meses. El mes y lo que promociona alcanza.

[PANTALLA DOS · A QUIÉN · 2-4:30]
Tu zona y tu rango de edad. Nada más.
No agregues intereses. Suena a que apuntas mejor y lo que hace es dejar afuera a la mitad de los que servían.
Si vendes en línea y no en consultorio, abre el país entero.
Presupuesto por día. Empieza con lo que puedas sostener tres semanas sin que te duela, no con lo que puedas una.
Y marca tu evento de agenda como el resultado que quieres. Ese es el que le enseña al sistema a quién traerte.

[PANTALLA TRES · LOS ANUNCIOS · 4:30-6min]
Carga tus tres anuncios en el mismo lugar.
Cada uno con su video o su imagen, su texto y el enlace a tu página.
Mira la vista previa de los tres en el teléfono, uno por uno.
Revisa que el enlace abra tu página y no un error. Es el fallo más común y el más silencioso.

[CIERRE · 6-7min]
Programa el inicio para mañana temprano y publica.
Si te rechazan algún anuncio, casi siempre es por prometer un resultado de salud.
Se arregla cambiando la promesa: habla de lo que la persona va a hacer, no de lo que se le va a curar.`,
    esencia: 'Tres pantallas y en cada una una sola decisión que importa. Objetivo: agendas o contactos, nunca visitas — con visitas pagas por curiosos. A quién: tu zona y tu rango de edad y nada más, sin intereses (dejan afuera a la mitad de los que servían), presupuesto por día con lo que sostengas tres semanas. Anuncios: los tres juntos, vista previa en el teléfono uno por uno, y revisa que el enlace abra tu página — es el fallo más común y el más silencioso.',
  },

  'P4.7': {
    codigo: 'P4.7',
    titulo: 'Leer tu tablero',
    duracion: '8 min',
    proposito: 'Que mire tres números y tome una decisión, en vez de mirar veinte y no tomar ninguna.',
    guion: `[GANCHO · 0-20s]
Tu tablero te muestra treinta números. Vas a mirar tres.

[POR QUÉ TRES · 20s-1:30]
Los treinta describen. Tres deciden.
Cuando miras los treinta, miras mucho y no cambias nada. Y mirar sin decidir cuesta tiempo.
Estos tres, en cambio, cada uno te dice qué arreglar y dónde.

[EL PRIMERO · CUÁNTO TE CUESTA UNA AGENDA · 1:30-3min]
Lo que gastaste dividido por las agendas que entraron.
Es tu número principal, y es el único que compara campañas entre sí.
Si no hay agendas todavía, no hay número: hay que esperar o cambiar el anuncio.
Y mira este, no el precio del clic. El clic barato con cero agendas es dinero gastado en nada.

[EL SEGUNDO · CUÁNTOS SE PRESENTAN · 3-4:30]
De los que agendaron, cuántos aparecieron.
Si agendan y no aparecen, el problema no está en tu anuncio: está entre el agendar y el día de la llamada.
Se arregla con el recordatorio del día anterior y con tu página de preparación. No con más dinero.

[EL TERCERO · CUÁNTOS AVANZAN · 4:30-6min]
De los que se presentaron, con cuántos avanzaste.
Si se presentan y no avanzan, el trabajo está en tu llamada o en a quién estás atrayendo.
Acá es donde te sirven tus grabaciones.

[CÓMO SE LEE, EN LA PRÁCTICA · 6-7:30]
Una vez por semana, el mismo día, veinte minutos.
Mira los tres en orden y quédate en el primero que esté flojo. Ese es el trabajo de la semana.
No arregles los tres a la vez: el de abajo casi siempre mejora solo cuando arreglas el de arriba.

[CIERRE · 7:30-8min]
Elige tu día y ponlo en tu calendario ahora.
Dirigir es esto: tres números, una decisión, una vez por semana.`,
    esencia: 'Tu tablero muestra treinta números y vas a mirar tres: cuánto te cuesta una agenda (lo gastado dividido por las agendas, no el precio del clic), cuántos de los que agendaron se presentaron (si no aparecen, se arregla con el recordatorio y tu página de preparación, no con más dinero), y con cuántos de los que se presentaron avanzaste (ahí sirven tus grabaciones). Una vez por semana, veinte minutos: quédate en el primero que esté flojo, porque el de abajo mejora solo cuando arreglas el de arriba.',
  },

  'P5.2': {
    codigo: 'P5.2',
    titulo: 'La venta empieza en la agenda',
    duracion: '5 min',
    proposito: 'Que entienda que lo que decide la llamada pasa antes de la llamada.',
    guion: `[GANCHO · 0-20s]
La mitad de tu llamada se decide antes de que empiece. Hoy trabajamos esa mitad.

[LOS TRES DÍAS DE SILENCIO · 20s-1:30]
Alguien agenda hoy y tu llamada es el jueves. Entre hoy y el jueves hay tres días.
En esos tres días, si no pasa nada, la persona se enfría. Vuelve su semana, vuelven sus urgencias, y la conversación que tenía ganas de tener deja de ser importante.
El que no aparece casi nunca decidió no ir. Se le fue apagando.

[LO QUE SE PONE EN ESOS TRES DÍAS · 1:30-3:30]
Tres cosas, y se escriben una vez.
Lo primero, la confirmación inmediata, con el día, la hora y tu cara. Que vea con quién va a hablar.
Lo segundo, algo concreto para que traiga. Un número suyo, su precio de hoy, lo que ya probó.
El que prepara algo viene. Y además llega a la llamada ya pensando en su situación, no en quién eres tú.
Lo tercero, el recordatorio del día anterior con el enlace de la reunión adentro.

[LO QUE NO SE PONE · 3:30-4:30]
No mandes material para que estudie. No mandes tres mensajes.
Lo que llena de información antes de tiempo cansa, y lo que cansa no aparece.
Una confirmación, una tarea chica, un recordatorio. Eso es todo.

[CIERRE · 4:30-5min]
Escríbelos hoy y déjalos andando.
Cuando esto funciona, se presentan más, y los que se presentan llegan más tibios.
Y tu llamada deja de empezar de cero.`,
    esencia: 'La mitad de tu llamada se decide antes de que empiece: entre el día que agendan y el día de la llamada hay tres días, y el que no aparece casi nunca decidió no ir — se le fue apagando. Tres cosas que se escriben una vez: la confirmación inmediata con tu cara, algo concreto para que traiga (el que prepara algo viene y llega pensando en su situación), y el recordatorio del día anterior con el enlace adentro. Lo que no va: material para estudiar ni tres mensajes.',
  },

  'P8.2': {
    codigo: 'P8.2',
    titulo: 'Traer tu método y armar tus etapas',
    duracion: '7 min',
    proposito: 'Que cargue sus etapas sin volver a inventarlas, y que entienda qué cambia cuando viven adentro.',
    guion: `[GANCHO · 0-20s]
Hoy tu método entra a tu app. Y no lo vas a escribir de nuevo: lo vas a traer.

[LO QUE YA ESTÁ · 20s-1:30]
Tus etapas las escribiste en la segunda semana y pasaron los tres exámenes.
Lo que hacemos hoy es moverlas de tu documento a la app donde las va a recorrer {{tu_consultante}}.
Si al cargarlas te da ganas de cambiarlas, para. Primero cárgalas como están.
Las mejoras vienen después de que alguien las recorra, no antes.

[QUÉ LLEVA CADA ETAPA ADENTRO · 1:30-4min]
Cuatro cosas por etapa, y son las mismas siempre.
El nombre, en las palabras de {{tu_consultante}} y no en las tuyas.
Qué cambia en la persona cuando la termina. Una frase.
Qué hace mientras la recorre. Concreto, y pocas cosas.
Y cómo se sabe que la terminó. Esto es lo que casi nadie pone, y es lo que convierte tu método en algo que avanza solo.

[LO QUE CAMBIA CUANDO VIVEN ADENTRO · 4-6min]
Hasta hoy tu método estaba en tu cabeza y tu memoria lo sostenía.
Cada vez que atendías, lo reconstruías. Y por eso cada persona recibía una versión distinta, según el día que tuvieras.
Cuando las etapas viven en la app, {{tu_consultante}} ve dónde está y qué viene. Tú dejas de ser la agenda y pasas a ser quien acompaña.
Y hay una consecuencia que se siente a los diez días: te dejan de preguntar qué sigue.

[CIERRE · 6-7min]
Carga las cuatro etapas hoy, en orden.
Mañana invitas a tu primera persona y lo vas a ver funcionando.`,
    esencia: 'Tu método se trae, no se escribe de nuevo: cárgalo como está, porque las mejoras vienen después de que alguien lo recorra. Cuatro cosas por etapa: el nombre en las palabras de {{tu_consultante}}, qué cambia en la persona al terminarla, qué hace mientras la recorre, y cómo se sabe que la terminó — esto último es lo que casi nadie pone y lo que hace que tu método avance solo. Lo que cambia: dejas de reconstruirlo de memoria cada vez, y a los diez días te dejan de preguntar qué sigue.',
  },

  'P8.5': {
    codigo: 'P8.5',
    titulo: 'Invitar a tu primer consultante',
    duracion: '6 min',
    proposito: 'Que entre una persona de verdad hoy, y que él haga un cambio con sus propias manos.',
    guion: `[GANCHO · 0-20s]
Hoy entra la primera persona de verdad a tu app. Y vas a hacer un cambio tú mismo, sin pedírselo a nadie.

[A QUIÉN INVITAR PRIMERO · 20s-1:30]
Elige a alguien que ya atiendes y con quien tienes confianza.
No al más nuevo, no al más difícil. Al que te va a decir la verdad si algo no se entiende.
Avísale antes por mensaje, en dos líneas: le vas a mandar algo nuevo y quieres saber qué le parece.
Lo que estás pidiendo es que pruebe, y la mayoría dice que sí con ganas.

[QUÉ MIRAR CUANDO ENTRA · 1:30-3:30]
Mira la primera pantalla con los ojos de alguien que no sabe nada.
¿Entiende qué es esto en tres segundos? ¿Sabe qué tiene que hacer hoy?
Después recorre con él la primera etapa completa. No le expliques: déjalo intentar y anota dónde duda.
Cada lugar donde duda es un lugar donde van a dudar todos.

[EL CAMBIO QUE HACES TÚ · 3:30-5min]
Toma una de esas dudas y arréglala hoy, pidiéndolo en castellano.
Puede ser una palabra, un título, el orden de dos cosas.
Esto es la parte importante del día, y no es técnica: es que compruebes que tu app es tuya.
El día que puedas cambiar una palabra sin pedirle permiso a nadie, dejaste de alquilar tu negocio.

[CIERRE · 5-6min]
Una persona adentro y un cambio hecho por ti. Eso es hoy.
Las otras dos entran esta semana, y con cada una vas a encontrar menos cosas.`,
    esencia: 'Invita a alguien que ya atiendes y con quien tienes confianza: no al más nuevo ni al más difícil, al que te va a decir la verdad. Recorre con él la primera etapa sin explicarle, y anota dónde duda — cada duda suya es una duda de todos. Después toma una y arréglala hoy, pidiéndolo en castellano. Esa es la parte importante del día y no es técnica: el día que puedes cambiar una palabra sin pedirle permiso a nadie, dejaste de alquilar tu negocio.',
  },

  'P5.6': {
    codigo: 'P5.6',
    titulo: 'La autopsia de tu llamada',
    duracion: '5 min',
    proposito: 'Que revise sus grabaciones con un método, en vez de quedarse con la sensación.',
    guion: `[GANCHO · 0-20s]
Tienes tus llamadas grabadas. Hoy aprendes a mirarlas, que no es lo mismo que volver a escucharlas.

[POR QUÉ CON MÉTODO · 20s-1:30]
Si las escuchas sin método, te quedas con la sensación. Y la sensación siempre dice lo mismo: estuvo bien, o estuvo mal.
Lo que te hace mejorar es encontrar el minuto exacto en que la conversación cambió.
Ese minuto existe en todas las llamadas, y casi nunca está donde creías.

[LAS DOS QUE SE MIRAN · 1:30-2:30]
Una que avanzó y una que no. Las dos de esta semana.
Las dos juntas, porque la que avanzó te muestra qué hiciste bien y no sabías.
Mirar solo las que salieron mal te enseña a tener miedo, no a vender.

[LAS TRES PREGUNTAS · 2:30-4min]
Primera: en qué minuto dejó de preguntar. Cuando la persona deja de preguntar, se fue.
Segunda: cuánto hablaste tú. Si hablaste más de la mitad, estabas explicando y no escuchando.
Tercera: qué dijiste cuando apareció la objeción. Escribe tu frase exacta, y después escribe la que hubieras querido decir.
Esa segunda frase es tu trabajo de la semana. Una sola.

[CIERRE · 4-5min]
Quince minutos, una vez por semana, dos llamadas.
Esto es lo único que mejora tu cierre de verdad. Y no te cuesta nada más que hacerlo.`,
    esencia: 'Escuchar sin método te deja la sensación, y la sensación siempre dice estuvo bien o estuvo mal: lo que mejora tu cierre es encontrar el minuto exacto en que la conversación cambió. Dos llamadas por semana, una que avanzó y una que no — mirar solo las que salieron mal te enseña a tener miedo. Tres preguntas: en qué minuto dejó de preguntar (cuando deja de preguntar, se fue), cuánto hablaste tú (más de la mitad es explicar y no escuchar), y qué dijiste ante la objeción, más la frase que hubieras querido decir.',
  },

  'P6.3': {
    codigo: 'P6.3',
    titulo: 'Tu primer consultante nuevo',
    duracion: '5 min',
    proposito: 'Que la primera semana de quien paga el precio nuevo esté armada, no improvisada.',
    guion: `[GANCHO · 0-20s]
Entró alguien al precio nuevo. Y acá hay un momento que define todo lo que viene.

[LOS PRIMEROS SIETE DÍAS · 20s-1:30]
La persona que acaba de pagar más de lo que pagó nunca está esperando algo distinto.
No más sesiones: distinto.
Y lo que decide si se queda tranquila o si empieza a dudar pasa en los primeros siete días.
Esos siete días son los que vas a armar hoy, una vez, para todos los que vengan.

[LAS CUATRO COSAS DE LA PRIMERA SEMANA · 1:30-3:30]
La primera, el mismo día del pago: un mensaje tuyo con lo que va a pasar y cuándo. No automático: tuyo.
La segunda, su acceso y su primera etapa abierta. Que pueda empezar sin esperarte.
La tercera, la primera sesión agendada antes de que cuelgues. No «te escribo para coordinar».
Y la cuarta, una pregunta tuya al día tres. Corta: cómo vas con lo primero.
Esa pregunta del día tres es la que más sostiene, y es la que casi nadie hace.

[EL ERROR QUE SE PAGA CARO · 3:30-4:30]
Compensar el precio nuevo dando el triple.
Más horas, más disponibilidad, contestar los domingos.
Eso no tranquiliza a nadie y te devuelve exactamente a donde estabas en el día uno.
El precio alto se paga con mejor resultado, no con más de ti.

[CIERRE · 4:30-5min]
Arma la primera semana hoy y queda escrita para siempre.
Lo que entregas es transformación, no disponibilidad.`,
    esencia: 'Quien acaba de pagar más de lo que pagó nunca espera algo distinto, no más sesiones, y eso se decide en los primeros siete días. Cuatro cosas, armadas una vez: un mensaje tuyo el mismo día del pago, su acceso y primera etapa abiertos para que empiece sin esperarte, la primera sesión agendada antes de colgar, y una pregunta corta al día tres — esa es la que más sostiene y la que casi nadie hace. El error que se paga caro es compensar el precio nuevo dando el triple: el precio alto se paga con mejor resultado, no con más de ti.',
  },

  'P6.2': {
    codigo: 'P6.2',
    titulo: 'El alta, siete pasos y tres límites',
    duracion: '6 min',
    proposito: 'Que el final del proceso esté escrito, para dejar de sostener a todos para siempre.',
    guion: `[GANCHO · 0-20s]
Tu proceso tiene que tener un final escrito. Si no lo tiene, los sostienes a todos para siempre.

[POR QUÉ ESTO CUESTA · 20s-1:30]
A quien eligió este trabajo le cuesta cerrar. Es parte de lo mismo que lo hace bueno.
Y entonces pasa algo que se ve en casi todas las agendas: personas que terminaron hace meses y siguen ocupando un lugar.
Cada uno de esos lugares es un lugar que no tienes para alguien que empieza.
Un alta clara no es dejar a nadie: es terminar bien.

[LOS SIETE PASOS DEL ALTA · 1:30-4min]
Uno: avisa el final con dos sesiones de anticipación. Nunca en la última.
Dos: en la penúltima, revisen juntos de dónde salió y dónde está. Con lo que escribieron al principio delante.
Tres: nombra en voz alta lo que logró, en concreto.
Cuatro: dale por escrito lo que se lleva. Su protocolo, sus pasos, lo que funcionó con él.
Cinco: dile qué hacer si vuelve a aparecer. Esto es lo que lo deja tranquilo.
Seis: pídele su testimonio ahí, en la última sesión. Es el único momento en que está completo.
Siete: déjale la puerta abierta de una forma concreta. Una revisión a los tres meses, y con fecha.

[LOS TRES LÍMITES · 4-5:30]
El primero: el alta no se mueve porque apareció algo nuevo. Lo nuevo es otro proceso, con su acuerdo.
El segundo: después del alta no hay sesiones sueltas por mensaje. Hay una revisión, agendada.
El tercero: si vuelve, vuelve al precio de hoy. No al que pagó hace un año.
Los tres límites se dicen al empezar, no al final. Dichos al final suenan a excusa; dichos al principio son el acuerdo.

[CIERRE · 5:30-6min]
Escribe tus siete pasos y tus tres límites hoy.
Y mira tu agenda: si hay alguien que terminó hace tiempo, su alta es esta semana.`,
    esencia: 'Sin un final escrito, los sostienes a todos para siempre: cada lugar ocupado por alguien que terminó hace meses es un lugar que no tienes para quien empieza. Siete pasos: avisar con dos sesiones de anticipación, revisar juntos de dónde salió, nombrar lo logrado en concreto, darle por escrito lo que se lleva, decirle qué hacer si reaparece, pedirle el testimonio ahí mismo, y dejar una revisión con fecha. Tres límites, dichos al empezar y no al final: el alta no se mueve, después no hay sesiones sueltas por mensaje, y si vuelve es al precio de hoy.',
  },

  'P8.1': {
    codigo: 'P8.1',
    titulo: 'Tu app con tu marca',
    duracion: '5 min',
    proposito: 'Que entienda qué es tener su propia app y por qué se clona en vez de construirse.',
    guion: `[GANCHO · 0-20s]
Hoy tienes tu propia app. Con tu nombre, tus colores y tu método adentro.

[QUÉ ES Y QUÉ NO ES · 20s-1:30]
No es una página. No es un grupo de mensajes.
Es el lugar donde {{tu_consultante}} entra, ve dónde está en tu proceso y qué le toca hoy.
Y no se construye desde cero: se clona. La estructura ya está probada y lo que se cambia es la marca y el contenido.
Por eso lo que a una empresa le lleva meses, a ti te lleva una semana.

[POR QUÉ TU PROPIA Y NO UNA ALQUILADA · 1:30-3min]
Porque lo que es tuyo no te lo pueden subir de precio ni cerrar.
Tu método, tus personas y sus datos quedan de tu lado.
Y porque le cambia el lugar a tu trabajo: deja de ser un servicio que das por hora y pasa a ser algo que se entrega.
Eso es lo que te permite cobrar por el proceso completo en vez de por el rato.

[LO QUE SE CARGA HOY · 3-4:30]
Tu nombre y el que van a ver tus personas.
Tus dos colores y tu logo.
La pantalla de bienvenida: qué van a encontrar adentro y qué hacen el primer día.
Y nada más. Las etapas se cargan mañana y la primera persona entra pasado.
Una cosa por día, en orden, y en tres días está andando.

[CIERRE · 4:30-5min]
Cuando termines, ábrela en tu teléfono y mírala como la va a ver {{tu_consultante}}.
Eso que estás mirando es tuyo.`,
    esencia: 'Tu propia app no es una página ni un grupo de mensajes: es donde {{tu_consultante}} entra, ve dónde está en tu proceso y qué le toca hoy. No se construye desde cero, se clona: la estructura ya está probada y se cambia la marca y el contenido. Es tuya porque no te la pueden subir de precio ni cerrar, y porque le cambia el lugar a tu trabajo — deja de ser un servicio por hora y pasa a ser algo que se entrega, y eso es lo que te deja cobrar por el proceso completo.',
  },

  'P7.1a': {
    codigo: 'P7.1a',
    titulo: 'Apertura de la máquina de diez',
    duracion: '1 min',
    proposito: 'Que marque el cambio de etapa: ya no construye, ahora dirige.',
    guion: `[GANCHO · 0-10s]
Para un segundo y mira dónde estás.

[LO QUE YA ESTÁ · 10-40s]
Tu método escrito. Tu precio nuevo. Tu página andando. Tu campaña corriendo. Tus primeras ventas al precio digno.
Hace cincuenta y cinco días nada de eso existía.

[LO QUE CAMBIA DESDE HOY · 40-55s]
Las semanas que vienen no construyen nada nuevo. Hacen que lo que ya está se repita todos los meses.
Cambia el trabajo: hasta hoy ejecutabas. Desde hoy diriges.

[CIERRE · 55s-1min]
Vamos a ver cómo se sostiene esto sin ti encima. Empezamos.`,
    esencia: 'Hace cincuenta y cinco días no existía nada de esto: tu método escrito, tu precio nuevo, tu página andando, tu campaña corriendo y tus primeras ventas al precio digno. Las semanas que vienen no construyen nada nuevo: hacen que lo que ya está se repita todos los meses. Hasta hoy ejecutabas. Desde hoy diriges.',
  },

  'P9.1': {
    codigo: 'P9.1',
    titulo: 'Por qué la marca va última',
    duracion: '6 min',
    proposito: 'Que entienda que su marca se construye sobre resultados, y por eso llega recién ahora.',
    guion: `[GANCHO · 0-20s]
Recién ahora, en el día sesenta y uno, hablamos de tu marca. Y no es un descuido: es el orden.

[LO QUE HACE CASI TODO EL MUNDO · 20s-2min]
Empieza por acá. El logo, los colores, el nombre, la cuenta linda, el contenido todos los días.
Y después descubre lo mismo: que una cuenta linda sin oferta clara no vende.
Pasan meses publicando, juntando personas que mira y no compra, y con la sensación de estar trabajando mucho para nada.
No es que la marca no sirva. Es que sin nada abajo no tiene sobre qué apoyarse.

[QUÉ TIENES HOY QUE NO TENÍAS EN EL DÍA UNO · 2-3:30]
Un método probado con personas de verdad.
Un precio que ya cobraste y que se sostuvo.
Personas que terminaron tu proceso y pueden decir qué les pasó.
Y tus propios números: cuánto cambió tu hora real neta en dos meses.
Eso es contenido. Y no se puede inventar antes de tenerlo.

[QUÉ ES TU MARCA, ENTONCES · 3:30-5min]
Tu marca no es cómo te ves. Es lo que saben que pueden esperar de ti.
Y eso se construye contando lo que haces y lo que les pasa a los que acompañas.
Ahora tienes las dos cosas. Por eso empieza ahora.
A partir de acá, cada cosa que publicas tiene algo atrás que la sostiene.

[CIERRE · 5-6min]
Las próximas jornadas armamos tu contenido de las doce semanas.
No para publicar todos los días. Para publicar lo que corresponde, con algo verdadero adentro.`,
    esencia: 'Tu marca llega en el día sesenta y uno y no es un descuido: es el orden. Casi todos empiezan por el logo y la cuenta linda, y descubren que sin oferta clara no vende — no es que la marca no sirva, es que sin nada abajo no tiene sobre qué apoyarse. Hoy tienes lo que no tenías el día uno: un método probado, un precio que cobraste y se sostuvo, personas que terminaron tu proceso, y tus propios números. Tu marca no es cómo te ves: es lo que saben que pueden esperar de ti.',
  },

  'P9.4': {
    codigo: 'P9.4',
    titulo: 'Las doce semanas escritas',
    duracion: '5 min',
    proposito: 'Que salga con tres meses de contenido decidido, para no decidir cada mañana.',
    guion: `[GANCHO · 0-20s]
Hoy decides tres meses de contenido de una vez. Y después no vuelves a decidir cada mañana.

[POR QUÉ DE UNA VEZ · 20s-1:30]
Lo que se decide cada mañana no se hace.
Mirar la pantalla en blanco a las ocho de la mañana cuesta más energía que grabar.
Y la energía que gastas eligiendo es la misma que te falta después para hablar bien.
Cuando el tema ya está decidido, lo único que queda es hacerlo. Y eso sí se sostiene tres meses.

[LAS CUATRO COLUMNAS · 1:30-3:30]
Cada semana lleva cuatro cosas, y son las mismas siempre.
Una que enseña: algo concreto que la persona puede usar hoy.
Una que muestra: cómo trabajas, cómo es un día tuyo, qué pasa adentro de tu proceso.
Una que prueba: lo que le pasó a alguien que acompañaste.
Y una que invita: una sola vez por semana, y clara.
Tres que dan y una que invita. Ese reparto es el que deja invitar sin que moleste.

[CÓMO SE LLENA · 3:30-4:30]
Toma tus doce semanas y escribe solo el tema de cada casillero.
Cuarenta y ocho temas, en una sentada. Sin títulos definitivos, sin textos.
Los temas salen de lo que ya tienes: las etapas de tu método, las preguntas que te repiten, los errores que ves todos los días.

[CIERRE · 4:30-5min]
Y deja un lugar libre por semana, a propósito.
Es para lo que surja: una pregunta que te hicieron, algo que pasó.
Eso es lo que más funciona, y es lo único que no se puede planificar.`,
    esencia: 'Lo que se decide cada mañana no se hace: la energía que gastas eligiendo es la misma que te falta para hablar bien. Cuatro columnas por semana, siempre las mismas: una que enseña algo usable hoy, una que muestra cómo trabajas, una que prueba lo que le pasó a alguien, y una que invita (una sola vez por semana). Tres que dan y una que invita es el reparto que deja invitar sin molestar. Escribe solo el tema de los cuarenta y ocho casilleros, y deja uno libre por semana para lo que surja.',
  },

  'P10.2': {
    codigo: 'P10.2',
    titulo: 'Tu foto de llegada',
    duracion: '2 min',
    proposito: 'Que vea en números la distancia que recorrió, porque adentro no se siente.',
    guion: `[GANCHO · 0-15s]
Hoy vuelves a medir lo mismo que mediste el primer día. Y vas a ver algo que no se siente desde adentro.

[POR QUÉ NO SE SIENTE · 15-50s]
El cambio de a poco no se nota. Te acostumbras a cada paso el día que lo das.
Y entonces llegas al final con la sensación de que todo sigue más o menos igual.
La única forma de verlo es tener el número de antes. Y lo tienes, porque lo escribiste el primer día.

[QUÉ SE MIDE · 50s-1:30]
Tu hora real neta. Las horas que pusiste la semana pasada. Lo que cobras por tu proceso completo.
Cuántas personas entraron este mes y de dónde vinieron.
Los mismos cuatro números del día uno, medidos igual.

[CIERRE · 1:30-2min]
Escríbelos al lado de los de antes y quédate mirando la diferencia un rato.
Esa diferencia es lo que compraste. Y es tuya: te la llevas puesta.`,
    esencia: 'El cambio de a poco no se nota, porque te acostumbras a cada paso el día que lo das, y llegas al final con la sensación de que todo sigue igual. La única forma de verlo es tener el número de antes, y lo tienes porque lo escribiste el primer día. Los mismos cuatro: tu hora real neta, las horas de la semana pasada, lo que cobras por tu proceso completo, y cuántas personas entraron este mes y de dónde. Esa diferencia es lo que compraste, y te la llevas puesta.',
  },

  'P10.3': {
    codigo: 'P10.3',
    titulo: 'Qué sigue',
    duracion: '7 min',
    proposito: 'Que entienda que lo que viene es sostener y expandir lo que ya tiene, no empezar otra cosa.',
    guion: `[GANCHO · 0-20s]
Terminaste. Y lo que sigue no es otro programa: es esto, funcionando todos los meses.

[LO QUE TE LLEVAS · 20s-2min]
Tu método escrito y probado. Tu precio nuevo, cobrado. Tu página y tu agenda andando solas.
Tu propia app, con tu marca y tus personas adentro.
Tus doce semanas de contenido decididas. Y tu forma de mirar tres números una vez por semana.
Nada de eso se apaga el día noventa y uno. Es tuyo.

[LO QUE CAMBIA DE RITMO · 2-3:30]
Hasta hoy tenías una sesión por día. Eso termina, y está bien que termine.
Lo que viene es media hora por semana: mirar tus tres números y tomar una o dos decisiones.
Ese es el trabajo de dirigir, y es menos de lo que parece.
El resto del tiempo —el que antes se comía tu trabajo— ahora es tuyo. Para atender mejor, para tu familia, para ti.

[POR QUÉ SEGUIR USANDO LA APP · 3:30-5:30]
Porque lo que construiste se expande, y se expande desde acá.
Tus entrenadores siguen trabajando contigo: tus anuncios, tus textos, tus llamadas, tus números.
Tu contenido de los próximos meses sale de este mismo lugar.
Y tu propia app crece con tus personas adentro.
Lo que termina es el camino de noventa días. Lo que sigue es tu sistema, con sus herramientas.

[LO MÁS GRANDE · 5:30-6:30]
Empezaste quemado, con la agenda llena y sin nada que la justificara.
Estás terminando con eso resuelto.
Y hay colegas tuyos, muchos, exactamente donde estabas hace noventa días.
Eres libre. Ahora te toca liberar a otros.

[CIERRE · 6:30-7min]
Gracias por estos noventa días. Te lo digo de verdad.
Nos seguimos viendo acá.`,
    esencia: 'Lo que sigue no es otro programa: es esto funcionando todos los meses. Te llevas tu método probado, tu precio cobrado, tu página y tu agenda andando solas, tu propia app con tus personas adentro, y tu forma de mirar tres números por semana. Cambia el ritmo: de una sesión por día a media hora por semana para decidir. Y la app sigue siendo de donde sale lo que viene — tus entrenadores, tus anuncios, tus textos, tu contenido y tu propia app creciendo. Empezaste quemado y estás terminando con eso resuelto: ahora te toca liberar a otros.',
  },
};

/** Devuelve el guión de un paso, o null si aún no está escrito. */
export function getGuion(codigo: string): GuionVideo | null {
  return GUIONES[codigo] ?? null;
}

/** La esencia para el Mentor (fallback cuando el video no está). */
export function getEsenciaParaMentor(codigo: string): string | null {
  return GUIONES[codigo]?.esencia ?? null;
}
