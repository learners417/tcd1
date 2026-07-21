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
El camino tiene siete etapas — se llaman CLINICA. No son pasos de un método de ventas: son cambios en cómo te ves a ti mismo. Vas a ganar cinturones, como en el dojo, pero no por leer: por hacer cosas reales en el mundo. Cada cinturón es una identidad nueva.

[LA PRIMERA PARADA · 3-4min]
Y hay una primera parada que casi nadie se anima a dar: sanar tu relación con el dinero. Antes de vender nada, antes de un solo anuncio. Porque de nada sirve el mejor sistema si algo adentro tuyo te frena a cobrar lo que vales. Ahí empezamos.

[CIERRE · 4-4:30]
Te dejo de regalo el libro, Sanadores Libres — la filosofía completa detrás de todo esto. Léelo cuando quieras. Pero no lo necesitas para empezar. Lo único que necesitas hoy es dar el primer paso. Nos vemos adentro.`,
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
La regla es simple: una sesión por día, de lunes a viernes. Sábado y domingo descansás — el dojo respira. No adelantes de más; el camino tiene un orden por una razón.

[EL PACTO · 2-3min]
Y ahora, lo único que te pido antes de empezar. No es un formulario. Es un pacto.
A los tuyos: a los que te formaron, y a los que dependen de ti. A tus pacientes: a los que ya ayudaste, y a los diez que todavía no te encontraron. Y a ti mismo: al profesional que decidió dejar de sobrevivir.
Vas a escribirlo con tus palabras, con fecha, y lo vas a firmar. En el dojo, la palabra empeñada es el primer cinturón. Hacelo ahora.`,
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
En tu casa, ¿cómo se hablaba del dinero? ¿Era escaso, sucio, motivo de pelea? ¿Te enseñaron que la gente buena no piensa en dinero, que cobrar mucho es de aprovechadores? Si te dedicas a ayudar, probablemente sí. Y esa creencia hoy te cuesta dinero real, todos los meses.

[LOS TRES SABOTAJES · 2:30-3:30]
Se manifiesta de tres formas. El que baja el precio antes de que el paciente lo pida — a veces antes de terminar de decirlo. El que justifica su precio con títulos y años, como si tuviera que ganarse el permiso de cobrar. Y el que trabaja de más, regala horas, para compensar la culpa de cobrar. ¿Te reconoces en alguno?

[CIERRE · 3:30-4min]
Por eso empezamos acá. No porque sea lindo. Porque es lo que ninguna táctica puede arreglar por encima. Sanás esto, y todo lo demás — el precio, la oferta, la venta — deja de costar. Los próximos días son de esto. Sostené.`,
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
La gente no paga caro por sesiones sueltas. Paga caro por un proceso con nombre, con inicio y con final, que promete un resultado. "Diez sesiones de terapia" vale poco. "El Programa de Reconstrucción Emocional de 90 días" vale diez veces más — con el mismo conocimiento tuyo adentro. La diferencia no es lo que sabes. Es cómo lo empaquetás.

[EL AVATAR B · 2:30-3:15]
Y si eres de los que ya tienen años de práctica, esto es todavía más para ti. No vas a inventar nada. Vas a ORDENAR y ponerle nombre a lo que ya haces hace quince años sin darte cuenta. Es tu activo más valioso, enterrado.

[CIERRE · 3:15-4min]
En las próximas sesiones vamos a sacar tu método de tu cabeza, ordenarlo en pasos, y ponerle un nombre que sea tuyo. Cuando lo veas en la pantalla, con nombre, algo va a cambiar en cómo te ves. Vas a dejar de ser alguien que da sesiones. Vas a ser el dueño de un método.`,
    esencia: 'Ya tienes un método — hace años que lo usas, solo que nunca lo sacaste de tu cabeza. Lo que no tiene nombre no tiene precio: la gente paga caro por un proceso con nombre, no por sesiones sueltas. Vamos a ordenarlo y nombrarlo. Ahí dejas de dar sesiones y pasás a ser dueño de un método.',
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
El error es vender lo que HACÉS: "sesiones de nutrición", "consultas de kinesiología". A nadie le emociona comprar tu tiempo. Lo que la gente compra es el RESULTADO: verse bien en la playa en tres meses, volver a jugar con sus hijos sin dolor, dejar de despertarse con angustia. Vendé el destino, no el vehículo.

[LOS CUATRO INGREDIENTES · 1:15-2:45]
Una oferta irresistible tiene cuatro partes. Primero, el resultado concreto — específico, medible, con tiempo. Segundo, el proceso — tu método con nombre, que le muestra CÓMO va a llegar. Tercero, la garantía — que le saca el miedo de encima; tú te la bancás porque confiás en tu trabajo. Y cuarto, los bonos — cosas que aumentan el valor sin aumentar tu costo. Cuando los cuatro están, el precio deja de ser el tema.

[EL PRECIO · 2:45-3:30]
Y sí, va a costar mil dólares o más. No porque seas caro, sino porque un resultado real vale eso. El que compara tu programa con una sesión suelta no entendió que no son lo mismo. Uno cambia tu tiempo por dinero. El otro cambia la vida del paciente. Tu trabajo es que se entienda la diferencia.

[CIERRE · 3:30-4min]
En la próxima sesión vas a construir la tuya, con la herramienta, usando todo lo que ya cargaste: tu avatar, tu método, tus transformaciones. Va a salir una oferta que tú mismo comprarías. Y esa es la prueba de que está bien hecha.`,
    esencia: 'Una oferta irresistible se vende sola porque decir que no se vuelve irracional. La clave: vendé el RESULTADO, no tu tiempo. Cuatro ingredientes: resultado concreto + tu método con nombre + garantía + bonos. Cuando están los cuatro, el precio ($1.000+) deja de ser el tema, porque un resultado real vale eso.',
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
Hoy tus pacientes llegan por boca a boca. Está buenísimo — pero tiene un techo: depende de que otros te recomienden, y no lo controlás tú. Si quieres crecer sin depender de la suerte, necesitás un sistema que puedas prender y apagar. Eso es todo lo que vamos a construir.

[LAS CUATRO PIEZAS · 1-2:30]
Son cuatro piezas, y ya tienes casi todas. Uno: un mensaje que atrae a tu paciente ideal — no a cualquiera, al tuyo. Dos: un lugar donde ese mensaje vive, tu página. Tres: un asistente que responde a los interesados a cualquier hora, aunque estés durmiendo o atendiendo. Y cuatro: una agenda donde el interesado reserva una llamada contigo. Contenido que atrae, página que explica, asistente que responde, agenda que reserva. Eso es el sistema. Nada más.

[SIN MIEDO A LA TÉCNICA · 2:30-3:15]
Sé lo que estás pensando: "yo no sé de esto". No hace falta. Cada pieza tiene su tutorial paso a paso, y si te trabás, tienes al equipo y al Mentor. Miles de profesionales que le tenían pánico a la tecnología montaron esto. No eres la excepción.

[CIERRE · 3:15-4min]
Las próximas sesiones son las más técnicas del camino. Vas a instalar cada pieza, una por vez, sin apuro. Al final vas a tener algo que casi ningún colega tuyo tiene: una máquina de conseguir pacientes que funciona sin tú encima. Respirá hondo. Empezamos a instalar.`,
    esencia: 'El sistema de captación son 4 piezas simples: un mensaje que atrae a tu paciente ideal, una página donde vive, un asistente que responde a cualquier hora, y una agenda donde reservan. Contenido que atrae, página que explica, asistente que responde, agenda que reserva. Cada pieza tiene tutorial — no necesitás saber de tecnología.',
  },

  'P4.5b': {
    codigo: 'P4.5b',
    titulo: 'Tu dirección digital — el dominio',
    duracion: '3 min',
    proposito: 'Que entienda por qué su dominio propio importa y que el paso técnico es guiado.',
    guion: `[GANCHO · 0-15s]
Tu clínica necesita una dirección propia en internet. Igual que tu consultorio tiene una dirección en la calle. Hoy la conseguimos — y sí, es técnico, pero te llevo de la mano.

[POR QUÉ IMPORTA · 15s-1min]
Cuando alguien ve tu link, tiene que llevar TU nombre — no el de una plataforma genérica. "juanperez.com" transmite un profesional serio. Un link largo y raro de una app gratis transmite lo contrario. Tu dirección digital es parte de cómo te ven antes de conocerte.

[QUÉ VAS A HACER · 1-2:15]
Dos caminos. Si ya tienes un dominio, hoy lo conectás — vas a copiar dos datos que se llaman registros DNS, pegarlos donde te muestro, y listo. Si no tienes, comprás uno simple: tu nombre, terminado en punto com, cuesta unos doce dólares al año. El tutorial te muestra cada clic.
Una cosa importante: después de conectarlo, a veces tarda unas horas en activarse. Es normal, no rompiste nada. Se sigue al día siguiente.

[CIERRE · 2:15-3min]
Cuando termine, vas a tener un link con tu nombre que puedes compartir con orgullo. Tu dirección en el mundo digital, tuya para siempre. Es un paso chico que cambia cómo te percibe la gente. Vamos.`,
    esencia: 'Tu clínica necesita una dirección digital propia (tu-nombre.com) — transmite seriedad, a diferencia de un link genérico. Si ya tienes dominio, lo conectás con 2 registros DNS (guiado paso a paso); si no, comprás uno simple (~$12/año). Si tarda horas en activarse, es normal.',
  },

  // ═══════════════ FASE 5 · COBRO · LA VENTA ═══════════════
  'P5.1': {
    codigo: 'P5.1',
    titulo: 'Anatomía de la llamada que cierra',
    duracion: '3-4 min',
    proposito: 'Que entienda que vender bien es diagnosticar, no convencer — la venta sin presión.',
    guion: `[GANCHO · 0-15s]
La llamada de venta que funciona no se parece en nada a lo que imaginás. No hay que convencer a nadie. Al contrario: cuanto menos empujás, más venden. Te explico por qué.

[EL CAMBIO DE MARCO · 15s-1:15]
Tú ya sabes hacer esto — porque es exactamente lo que haces con un paciente. No lo convencés de que está enfermo: le haces preguntas hasta que ÉL entiende su problema y te pide ayuda. La venta es igual. No es un pitch. Es un diagnóstico. El que pregunta bien, cierra.

[LAS CINCO ETAPAS · 1:15-2:45]
La llamada tiene cinco momentos. Apertura: bajás la guardia, esto es una conversación, no un interrogatorio. Dolor: preguntás hasta que la persona pone en palabras lo que le duele — con SUS palabras, no las tuyas. Cielo: le haces imaginar cómo sería su vida resuelto el problema. Obstáculos: qué lo frenó hasta ahora. Y recién ahí, cierre: presentás tu programa como el puente entre su dolor y su cielo. Si hiciste bien las primeras cuatro, el cierre casi se dice solo.

[EL PRECIO SIN TEMBLAR · 2:45-3:30]
Y cuando llega el precio, lo di s y te callás. No lo justifiques. No agregues "pero puedo hacerte un descuento". El precio se presenta, no se pide perdón por él. El silencio después del número es incómodo — bancátelo. El que habla primero, pierde.

[CIERRE · 3:30-4min]
En las próximas sesiones vas a armar tu guión con estas cinco etapas, adaptado a tu método, y lo vas a practicar hasta que salga natural. Cuando llegue tu primera llamada real, no vas a estar improvisando. Vas a estar diagnosticando. Como siempre supiste hacer.`,
    esencia: 'Vender bien no es convencer — es diagnosticar, igual que con un paciente: preguntás hasta que ÉL entiende su problema y te pide ayuda. Cinco etapas: Apertura, Dolor, Cielo, Obstáculos, Cierre. El precio se presenta y te callás — no lo justifiques. El que habla primero después del número, pierde.',
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
En la próxima sesión vas a documentar tu protocolo, paso a paso. Es lo mismo que después va a vivir en Mi Clínica, tu app de operación, para que cada paciente lo siga solo. Entregás transformación, no disponibilidad. Esa es la diferencia entre un negocio y una condena.`,
    esencia: 'El peligro después de cobrar bien: compensar dando el triple y volver al agotamiento. El precio alto NO se paga con más horas tuyas, se paga con mejor resultado. La solución es un protocolo de entrega claro y repetible: el paciente recibe más valor con menos desgaste tuyo. Entregás transformación, no disponibilidad.',
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
Los primeros pacientes los conseguiste haciendo todo tú. Eso está bien para arrancar — pero no escala. La diferencia entre un profesional ocupado y un director de clínica es esta: el ocupado hace el trabajo; el director hace que el trabajo se haga. Tu campaña corre sola, tu asistente responde solo, tu agenda se llena sola. Tú revisás los números y ajustas. Dejaste de ser el sistema. Ahora lo dirigís.

[EL RITMO NUEVO · 1:30-2:30]
Tu semana ya no es cuarenta y cinco minutos de tarea. Es una revisión: qué números dieron, qué anuncio funcionó mejor, cuántas llamadas, cuántos cierres. Media hora por semana mirando el tablero y tomando una o dos decisiones. Eso es dirigir. El resto del tiempo — el que antes se comía tu negocio — ahora es tuyo. Para atender mejor, para tu familia, para ti.

[EL LEGADO · 2:30-3:30]
Y hay algo más grande. Tú empezaste como un profesional quemado, mártir de tu vocación. Y estás terminando como alguien que resolvió eso. Esa transformación es, ahora, tu mejor activo. Porque hay miles de colegas tuyos exactamente donde ti estabas hace noventa días. Eres libre. Ahora te toca liberar a otros.

[CIERRE · 3:30-4min]
Lo que sigue no es un final. Es tu clínica funcionando, y tú a cargo de verdad. La revisión semanal te va a acompañar de acá en adelante. Bienvenido al otro lado. Bienvenido, sanador libre.`,
    esencia: 'Ya tienes método, oferta, sistema y ventas. Ahora la diferencia es de ejecutar a dirigir: el ocupado hace el trabajo, el director hace que el trabajo se haga. Tu semana pasa a ser una revisión de 30 min de los números. El tiempo que antes se comía tu negocio ahora es tuyo. Eres libre — ahora te toca liberar a otros.',
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
