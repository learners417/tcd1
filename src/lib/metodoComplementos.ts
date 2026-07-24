/**
 * metodoComplementos.ts — S7 · El Método completo (para los que quieren profundidad).
 * Por cada video largo: el resumen ejecutivo, el mapa en bullets, el referente
 * y el dato. La teoría entera, en dos minutos de lectura, debajo de cada video.
 */

export interface Complemento {
  resumen: string;
  mapa: string[];
  referente?: string;
  dato?: string;
}

export const COMPLEMENTOS: Record<string, Complemento> = {
  'r-bienvenido': {
    resumen: 'El mapa completo: 90 días, 4 fases visibles, 9 cinturones. No es un curso — es un camino con niveles, donde cada sesión de 20-30 minutos deja algo construido.',
    mapa: ['El Camino es el dojo: una sesión por día, de lunes a viernes', 'Cada cinturón se gana con un hito verificable, no con asistencia', 'El progreso visible sostiene la constancia cuando la motivación falla'],
    referente: 'Yu-kai Chou (Octalysis): el avance que se VE es el motor psicológico más fuerte de un juego bien diseñado.',
    dato: '44 sesiones de trabajo, a una por día hábil, son exactamente tus 90 días. La matemática cierra: alcanza con presentarte.',
  },
  'r-impostor': {
    resumen: 'El síndrome del impostor no se piensa: se contradice con evidencia. Tus pacientes ya transformados son la prueba de que tu trabajo funciona — el permiso no lo da un título más.',
    mapa: ['La credencial no es el permiso; el resultado de tu paciente sí', 'La creencia se reescribe con actos, no con afirmaciones', 'Cada historia real de un paciente tuyo vale más que otro diploma'],
    referente: 'Klontz: las creencias sobre el propio valor se heredan y se reescriben — con experiencias nuevas, no con fuerza de voluntad.',
  },
  'r-historia': {
    resumen: 'Tu historia es tu activo más caro y el que menos usas. El paciente no compra técnicas: compra la transformación encarnada en alguien que ya cruzó el río que él quiere cruzar.',
    mapa: ['Tu herida sanada es tu autoridad más honesta', 'Tu yo del pasado es la brújula de a quién sirves', 'La historia se cuenta con estructura: antes → el quiebre → el después'],
  },
  'r-proposito': {
    resumen: 'El para qué sostiene el cómo. Cuando el propósito está claro, el miedo cambia de precio: cada miedo que te gana es un paciente menos que ayudas.',
    mapa: ['La matemática del propósito: miedo vencido = paciente ayudado', 'El propósito no se inventa: se descubre en tu origen', 'Se escribe una vez y se relee cada vez que tiembla el pulso'],
  },
  'r-legado': {
    resumen: 'De profesional independiente a director de clínica: el legado no ocurre — se diseña. Qué vas a crear con el tiempo, el dinero y la energía que recuperes es LA pregunta del camino.',
    mapa: ['El x3 de ingresos es el medio; el legado es el fin', 'La Rueda de la Vida es tu tablero: 8 dimensiones, no una', 'El descanso también se registra: la vida es parte del camino'],
  },
  'r-avatar': {
    resumen: 'Primero a quién sirves; la oferta es la última consecuencia. Tu paciente ideal casi siempre es tu yo del pasado — y cuando le hablas a UNO con precisión, llegas a miles.',
    mapa: ['El orden causal: historia → herida → dones → a quién sirves', 'Un solo paciente ideal, descrito hasta el detalle', 'Sus palabras textuales valen más que tu vocabulario técnico'],
    referente: 'Klaric: la mente decide por dolor y emoción, no por datos — véndele a la persona, no al diagnóstico.',
  },
  'r-matriz': {
    resumen: 'La Matriz ABC ordena todo lo que vas a decir: A = sus dolores con sus palabras, B = lo que ya intentó y falló, C = la transformación que busca. De acá salen tu contenido, tus anuncios y tu llamada.',
    mapa: ['A: el dolor, dicho como él lo dice (no como lo diría tu profesión)', 'B: por qué lo viejo no le alcanzó — tu diferencia vive acá', 'C: la vida después — lo que de verdad está comprando'],
  },
  'r-metodo': {
    resumen: 'Bautizar tu método es dejar de vender horas. Un método con nombre convierte sesiones sueltas en un camino con principio y fin — y la certeza de un camino claro multiplica el valor percibido.',
    mapa: ['Nombre propio + 3-5 pasos = tu método existe', 'El método es el QUÉ público; el CÓMO completo vive en tu programa', 'Nadie compara precios de algo que solo existe contigo'],
    referente: 'Hormozi: la certeza percibida de lograr el resultado es uno de los 4 multiplicadores del valor.',
  },
  'r-ofertas': {
    resumen: 'Una sola oferta de 1.000, construida sobre la ecuación de valor: resultado soñado × certeza, dividido por tiempo y esfuerzo. El precio digno sale de tu PHR — no del miedo.',
    mapa: ['Sube el resultado y la certeza; baja el tiempo y el esfuerzo percibidos', 'Bonos que atacan objeciones, no relleno', 'Garantía que asume el riesgo que tu paciente no quiere cargar'],
    referente: 'Hormozi ($100M Offers): la oferta correcta hace que decir que sí sea más fácil que decir que no.',
  },
  'r-puv': {
    resumen: 'Tu PUV nace del paciente ideal — nunca al revés. Una frase: a quién ayudas + qué transformación logras + qué te hace distinto. Va primera en tu bio y en tu boca.',
    mapa: ['Si necesita explicación, todavía no es tu PUV', 'Se escribe con las palabras de la Matriz A y C', 'Una sola versión, usada en todos lados, siempre igual'],
  },
  'r-infra': {
    resumen: 'Tu sistema de captación: tres puertas (tu lista caliente, tu perfil con palabra clave, tus anuncios) y un solo cerebro — tu agente, que responde al minuto, filtra y agenda.',
    mapa: ['Tres puertas, una agenda: todo converge en la llamada', 'El agente responde en menos de 1 minuto — o el interesado se enfría', 'Tú no persigues: el sistema conversa y tú atiendes llamadas'],
    dato: 'Sin respuesta en el primer minuto se pierde hasta el 80% de los interesados. Por eso el agente no es un lujo: es la puerta.',
  },
  'r-dinero': {
    resumen: 'El dinero se sana primero porque todo lo demás se construye encima. Los guiones del dinero se heredan sin que nadie los firme — y cobrar por debajo de tu PHR es un agujero anual silencioso.',
    mapa: ['Las creencias del dinero son heredadas: se miran, se nombran, se reescriben', 'Tu PHR es tu piso de dignidad, no tu techo', 'El precio nuevo se anuncia con transparencia, no con culpa'],
    referente: 'Klontz: los money scripts se transmiten de generación en generación — hasta que alguien los pone sobre la mesa.',
  },
  'r-cuerpo': {
    resumen: 'El precio no se dice con la boca: se dice con el cuerpo. Si el cuerpo se contrae al decir tu número, el paciente lo siente antes que tus palabras.',
    mapa: ['El cuerpo guarda la historia del dinero de tu linaje', 'Práctica: tu precio en voz alta, hasta que salga sin temblor', 'La calma corporal es la evidencia de que el trabajo interno cerró'],
    referente: 'van der Kolk: el cuerpo lleva la cuenta — lo no procesado se expresa en el cuerpo antes que en la conciencia.',
  },
  'r-dominio': {
    resumen: 'Tu dirección digital propia es la diferencia entre parecer un perfil más y ser una clínica. El tráfico que no te conoce decide confianza en segundos — y el dominio propio la construye.',
    mapa: ['Dominio propio = señal de permanencia para el que llega frío', 'La técnica se hace UNA vez, con calma y tutorial: nada se rompe', 'Si algo tarda (DNS, revisiones), es normal: no lo toques dos veces'],
  },
  'r-llamada': {
    resumen: 'La llamada que cierra no convence: pregunta. El que pregunta, dirige. Con guion, decisor presente y silencio después del precio, el cierre deja de ser suerte.',
    mapa: ['El decisor presente o la llamada ya se perdió antes de empezar', 'Las objeciones se sacan ANTES del precio, no después', 'Dices tu precio… y silencio. El primero que habla, define'],
    referente: 'Jeremy Miner (NEPQ): las preguntas correctas hacen que la persona se venda a sí misma — tu trabajo es dirigir, no empujar.',
    dato: 'Con guion y decisor presente, 1 de cada 3-4 llamadas cierra. Para tus 10 pacientes: unas 40 llamadas en 90 días. Es volumen, no magia.',
  },
  'r-entrega': {
    resumen: 'Entregar sin quemarte es protocolo, no heroísmo: un camino claro para cada paciente, avances que se ven, y un portal con tu marca donde todo vive ordenado.',
    mapa: ['Protocolo con pasos > improvisación con buena voluntad', 'El avance medido es la razón por la que renuevan', 'Tu clínica digital ordena la entrega: tú pones la presencia'],
  },
  'r-maquina': {
    resumen: 'La máquina de 10 por mes es un ritmo, no un sprint: plan los lunes, revisión los miércoles, cierre del director los viernes. Y una regla de oro: la pauta escala con la caja.',
    mapa: ['El problema casi siempre es volumen, no técnica: más pauta o más contenido', 'Escala con la caja: sube el presupuesto tras cada venta, no antes', 'El scorecard del viernes diagnostica el cuello: conversaciones, agendas o cierres'],
    dato: 'En LATAM, una conversación de WhatsApp desde anuncios cuesta entre $0.20 y $0.60. Una sola venta de $1.000 paga meses enteros de sistema.',
  },
};
