import { roadmap, diaDelCodigo } from './roadmapSeed';
/**
 * consultorio.ts — Lo que siempre preguntan.
 *
 * No es un FAQ suelto: cada pregunta cuelga de la sesión donde aparece, y el
 * Mentor la tiene cargada ANTES de que la hagan. Cuando el cliente llega a esa
 * sesión, el Mentor ya sabe qué duda le va a venir y con qué responde.
 *
 * La respuesta está en la voz de Javo: corta, de frente, sin vueltas.
 */

export interface Pregunta {
  /** Sesión donde aparece. */
  codigo: string | number;
  /** Como la hacen ellos, no como la haría un manual. */
  p: string;
  /** Dos a cinco líneas. */
  r: string;
}

export const CONSULTORIO: Pregunta[] = [

  // ─── Las jornadas nuevas de la Hoja de Ruta ────────────────────────
  { codigo: 2, p: 'Mi familia nunca habló de dinero.',
    r: 'Ese silencio también es una frase. Escribe cómo se notaba: quién pagaba, qué cara ponían cuando faltaba, qué se compraba sin pensar y qué no.' },
  { codigo: 2, p: '¿Y si me da bronca hacer esto?',
    r: 'Es la señal de que estás en el lugar correcto. La bronca es con lo que te tocó, no con ellos. Escríbela y sigue.' },
  { codigo: 3, p: 'Me salieron dos tipos parecidos en el test.',
    r: 'Contesta las tres preguntas de desempate que te muestra la app. Y si sigue empatado, elige el que te incomoda más: casi siempre es ese.' },
  { codigo: 12, p: 'Diego me devolvió el método con correcciones.',
    r: 'Bien: eso es que lo leyó de verdad. Corrige y vuelve a mandarlo hoy. El lunes grabas, y grabas el método aprobado.' },
  { codigo: 24, p: '¿Por qué no hago descuento a los tres primeros?',
    r: 'Lo que descuentas se ancla: el que entró con descuento no renueva al precio entero, y se lo cuenta al siguiente. Por eso das más, no cobras menos.' },
  { codigo: 24, p: 'No tengo a quién mandarle la preventa.',
    r: 'Sí tienes: tu lista de veinte del día 8 y los que ya conversaron contigo esta semana. Empieza por los que te dijeron "avísame cuando abras".' },
  { codigo: 52, p: 'Mis consultantes me dicen que está todo bien.',
    r: 'Pregunta distinto: qué parte volverías a hacer y cuál te costó. Ahí sale lo que hay que cambiar.' },
  { codigo: 73, p: 'Me da vergüenza pedirles un testimonio.',
    r: 'No pidas un testimonio: pide su resultado en una frase. Es más fácil de dar y más fuerte de leer.' },
  { codigo: 66, p: 'Ya estoy lleno y no me entran más consultantes.',
    r: 'Esa es la jornada de hoy. El vaso se agranda de tres formas: subes el precio, acortas la entrega o pasas parte a tu app. Elige una esta semana.' },
  { codigo: 80, p: 'No llegué a los 7.000.',
    r: 'Entonces el ecosistema espera, y esta semana corriges lo que te frena: anuncios, VSL, oferta, triage o perfil. Tu cadena del día 47 te dice en qué eslabón se corta.' },

  // ─── Preguntas del Camino de 90 días ───────────────────────────────
  { codigo: 1, p: 'No tengo los números exactos que me pide el día 1.',
    r: 'Pon el número aproximado y sigue. La medición de entrada no se aprueba: se repite el día 87. Lo importante es que hoy quede algo escrito para comparar.' },
  { codigo: 'P1.2', p: '¿Tengo que cargar a todos mis consultantes?',
    r: 'Carga los que estás atendiendo ahora. Los de hace dos años no cambian ninguna decisión de estas semanas.' },
  { codigo: 4, p: '¿Y si mi protocolo no me sale natural?',
    r: 'No tiene que salirte natural: tiene que estar pegado donde trabajas. La primera semana se lee, la tercera ya no hace falta.' },
  { codigo: 18, p: 'Me da miedo que se vayan cuando les diga el precio nuevo.',
    r: 'Algunos se van. Ese es el punto: el cálculo del día 3 te mostró que con menos personas al precio correcto ganas más y trabajas menos. Y a los que se van los derivas bien, no los abandonas.' },
  { codigo: 26, p: 'Todavía no cobré a nadie al precio nuevo.',
    r: 'La jornada espera. No la marques hasta tener el comprobante: es la primera prueba de que el número funciona afuera y no solo en tu cabeza.' },
  { codigo: 18, p: '¿Qué les escribo a los veinte?',
    r: 'Nada de venta. Preguntas cómo están y qué pasó con lo que trabajaron juntos. La conversación se abre sola cuando hay algo real para decir.' },
  { codigo: 9, p: 'Mi trabajo es distinto con cada persona, no tengo un método.',
    r: 'Sí lo tienes. Toma tus últimos tres consultantes y mira el camino que hicieron los tres: eso que se repite es tu método. Lo que cambia es el ritmo, no las etapas.' },
  { codigo: 10, p: '¿Está bien poner el precio en la página de la oferta?',
    r: 'Sí. El precio filtra antes de la llamada y te deja hablar con quien ya sabe cuánto cuesta.' },
  { codigo: 10, p: '¿Devuelvo el dinero si alguien no avanza?',
    r: 'Tu garantía cubre tu trabajo, no el esfuerzo del otro. Por eso van los tres compromisos: si él los cumple y no pasa lo que prometiste, respondes.' },
  { codigo: 19, p: 'Me tiembla la voz cuando digo el número.',
    r: 'Por eso son veinte repeticiones grabadas. No es teatro: es que la primera vez que lo digas frente a alguien no sea la primera vez que lo dices.' },
  { codigo: 8, p: 'Tengo poca audiencia, ¿sirve igual?',
    r: 'Sirve. Con audiencia chica se cierra por conversación, no por alcance. El número lo escribes para saber de dónde partes, no para compararte.' },
  { codigo: 16, p: 'Mi página no quedó linda.',
    r: 'No tiene que quedar linda: tiene que estar publicada y decir qué haces, para quién y cuál es el paso siguiente. Se mejora cuando ya esté trayendo personas.' },
  { codigo: 15, p: 'Me da vergüenza grabarme.',
    r: 'Es normal y se pasa grabando. Por eso el día de rodaje es uno solo y con todo listo del día anterior: no hay lugar para pensarlo demasiado.' },
  { codigo: 30, p: '¿Los tres anuncios tienen que ser muy distintos?',
    r: 'Distintos en la apertura, iguales en el paso siguiente. Así sabes qué gancho funciona sin cambiar dos cosas a la vez.' },
  { codigo: 33, p: 'Llevo días con las campañas y no llega nadie.',
    r: 'Son catorce días de espera y hay una sola pantalla para eso. Antes de tocar nada, mira el costo por agenda: si todavía no hay datos suficientes, cambiar el anuncio solo borra lo aprendido.' },
  { codigo: 'P5.4-i', p: '¿Tengo que avisar que grabo la llamada?',
    r: 'Sí, siempre, al principio y con una frase simple. La grabación es para que puedas revisar tu llamada después, no para otra cosa.' },
  { codigo: 'P5.4-i', p: 'Me fue mal en las primeras llamadas.',
    r: 'Para eso está la autopsia. No se revisa cómo te sentiste: se revisan los cuatro números y en qué tramo de la W se cortó la conversación.' },
  { codigo: 'P8.1', p: '¿Por qué clono la app en vez de construirla yo?',
    r: 'Primero la tienes andando con tu marca, con consultantes adentro. Después, el día 40, la modificas tú. Construirla de cero antes de tener a alguien usándola te deja tres meses sin producto.' },
  { codigo: 40, p: 'No sé programar, ¿cómo la modifico?',
    r: 'Le pides los cambios en castellano y los revisas. Lo que necesitas saber no es programar: es qué quieres que vea tu consultante cuando entra.' },
  { codigo: 50, p: '¿Cargo los cuatro números aunque la semana haya sido mala?',
    r: 'Sobre todo si fue mala. La semana que no se mide es la que se repite.' },
  { codigo: 87, p: 'Mi número del día 87 es parecido al del día 1.',
    r: 'Entonces ya sabes dónde mirar: la cadena del día 47 te dice en qué eslabón se te corta. Un número que no se movió es información, no un fracaso.' },
  // ─── Sistema 1 · el recipiente ───────────────────────────────────────────
  { codigo: 'P1.2b', p: '¿Y si mis consultantes actuales se van cuando suba el precio?',
    r: 'Algunos se van. Eso es parte del plan, no un accidente. El día 18 vas a repartirlos en tres grupos y vas a tener el mensaje de cada uno. Nadie queda a la deriva: los que no siguen contigo terminan su proceso o los derivas bien.' },
  { codigo: 5, p: '¿Mil dólares no es mucho para mi país?',
    r: 'El precio no lo pone tu país: lo pone el problema que resuelves. Hay quien paga eso en Quito, en Lima y en Caracas, y quien no lo paga en Madrid. Tu trabajo no es bajar el precio: es encontrar a quien ese resultado le vale más que ese número.' },
  { codigo: 5, p: '¿Y si nadie paga eso?',
    r: 'Hoy no lo sabes, lo supones. Lo vas a saber el día 38, cuando tengas tu primera llamada real. Hasta entonces es una hipótesis, y las hipótesis no se discuten: se prueban.' },
  { codigo: 5, p: 'Me da vergüenza cobrarle más a alguien que ya atiendo.',
    r: 'No le estás cobrando más por lo mismo. Le estás ofreciendo otra cosa: un programa con etapas, medición y garantía. Si le ofreces exactamente lo mismo a más precio, la vergüenza tiene razón. Por eso primero armas el programa.' },
  { codigo: 'P1.5b', p: '¿Puedo hacer excepciones con alguien que lo necesita mucho?',
    r: 'Para eso está tu Puerta Chica, que armas el día 46. Un tramo corto de tu método, con precio de entrada, que se acredita si toma el programa completo. Eso es una puerta, no un descuento.' },
  { codigo: 2, p: 'No me sale esto de quemar cartas, me parece raro.',
    r: 'Entonces no lo hagas así. Escribe lo que tengas que escribir y ciérralo como te salga: tirarlo, guardarlo, leerlo en voz alta una vez. Lo que importa es nombrarlo y soltarlo, no la ceremonia.' },
  { codigo: 'P1.1', p: '¿Por qué no empezamos directamente con el marketing?',
    r: 'Porque el mejor anuncio del mundo te trae una llamada donde vas a decir tu precio. Si en esa llamada no lo sostienes, todo lo anterior no sirvió. Es una semana, y es la que hace que las otras once rindan.' },
  { codigo: 'P0.2', p: 'No tengo todos los números que me pide la Foto de Partida.',
    r: 'Pon lo que sepas y estima el resto con sinceridad. No es una auditoría: es tu punto cero. El día 87 la vas a comparar con la de llegada, y ahí lo único que importa es que hoy hayas sido honesto.' },

  // ─── Sistema 2 · el programa ─────────────────────────────────────────────
  { codigo: 'P2.4', p: '¿Cuántas semanas tiene que durar mi programa?',
    r: 'Las que necesite tu resultado, ni una más. Doce es lo más común porque entra en un trimestre y se puede medir. Si tu proceso real son ocho, son ocho: estirar para justificar el precio se nota.' },
  { codigo: 'P2.4', p: 'Mi terapia es profunda, no cabe en doce semanas.',
    r: 'Lo que vendes no es el final del camino: es un tramo con un resultado claro. Después puede venir otro. Un programa de doce semanas con un logro concreto vende mejor que un acompañamiento sin final, y además le da a la persona una razón para quedarse.' },
  { codigo: 'P2.4', p: '¿Y si mi método no es tan original?',
    r: 'Ninguno lo es. Lo que lo vuelve tuyo es el orden en que haces las cosas y para quién. Dos nutricionistas con la misma formación tienen métodos distintos porque atienden a personas distintas.' },
  { codigo: 12, p: '¿Cómo mido algo que es emocional?',
    r: 'Con lo que la persona hace, no con lo que siente. No midas "está mejor": mide cuántas noches durmió de corrido, cuántas veces comió sin culpa, cuántos días fue al gimnasio. Lo observable se mide.' },
  { codigo: 'P2.3b', p: '¿Y si no tengo tres buenos casos para la matriz?',
    r: 'Con uno alcanza para empezar. Y si no tienes ninguno, usa el caso que más te gustaría atender: tu avatar puede salir del deseo, pero después se corrige con la realidad.' },
  { codigo: 'P3.2', p: '¿Qué pongo de garantía si el resultado depende de la persona?',
    r: 'Nunca garantices el resultado: garantiza el acompañamiento. "Si cumpliste tus compromisos y no llegaste, seguimos trabajando sin costo." Y los compromisos van escritos al lado. Eso te protege a ti y tranquiliza al otro.' },
  { codigo: 'P3.2', p: '¿Devuelvo el dinero si alguien no queda conforme?',
    r: 'No. Extensión, nunca devolución. La devolución te castiga por el trabajo que sí hiciste y premia al que no cumplió su parte. La extensión te cuesta tiempo y sostiene tu palabra.' },
  { codigo: 'P3.3b', p: '¿Puedo tener dos programas a la venta?',
    r: 'Diseña cinco niveles y vende uno. El tercero. Tener dos ofertas abiertas hace que la persona compare en vez de decidir, y el que compara no compra: pospone.' },
  { codigo: 'P3.6', p: 'Me da cosa escribirle a conocidos para venderles.',
    r: 'No les estás vendiendo: les estás avisando que cambiaste. Son diez personas que ya confiaron en ti. Si el mensaje suena a catálogo, está mal escrito. Si suena a "quiero contarte lo que estoy haciendo", está bien.' },
  { codigo: 'P3.7', p: '¿Cómo le digo a alguien que ya no lo voy a atender?',
    r: 'Dándole un final, no un portazo. "Vamos a cerrar tu proceso en cuatro sesiones más, y te dejo con todo ordenado." Un proceso que termina bien es mejor servicio que uno que se estira para siempre.' },

  // ─── Sistema 3 · el sistema de venta ─────────────────────────────────────
  { codigo: 'P4.4', p: '¿Cuánto tengo que poner de pauta?',
    r: 'Lo suficiente para que la campaña junte datos, no para que venda rápido. Con muy poco no aprende nada y te vas a frustrar por una conclusión que no era conclusión. Empieza con lo que puedas sostener catorce días sin mirar el teléfono.' },
  { codigo: 'P4.4', p: 'Llevo tres días y no llegó nadie. ¿Apago?',
    r: 'No. Tres días no es un dato, es un susto. La campaña está aprendiendo quién eres y a quién buscarle. Vuelve a este video el día catorce: ahí sí hay algo que leer.' },
  { codigo: 'P4.4', p: '¿Cambio el anuncio si no funciona?',
    r: 'Cada cambio devuelve la campaña al día cero. El que toca cada tres días tiene una campaña que nunca pasa del día tres. Catorce días, y recién ahí decides con números.' },
  { codigo: 'P4.4', p: '¿Puedo subir el presupuesto si está funcionando?',
    r: 'Sí, pero de a poco y no antes de los catorce días. Duplicar de golpe reinicia el aprendizaje. Sube un poco, espera que estabilice, sube otro poco.' },
  { codigo: 'P4.7', p: 'Me llegan personas que no pueden pagar. ¿Está mal el anuncio?',
    r: 'Casi siempre está mal el filtro, no el anuncio. Revisa tu formulario: si todas las respuestas llevan al calendario, no estás filtrando. Y revisa que tu página diga el precio o el rango antes de la agenda.' },
  { codigo: 'P4.2d', p: '¿Pongo el precio en la página o no?',
    r: 'Ponlo. El precio no espanta al que puede pagarlo: espanta al que no, y eso es exactamente lo que quieres que pase ahí y no en tu llamada de cuarenta y cinco minutos.' },
  { codigo: 'P4.3e', p: 'Me da vergüenza grabarme en video.',
    r: 'A todos. Y la primera toma siempre sale mal, así que graba tres y quédate con la tercera. Lo que la persona busca en tu video no es producción: es ver si entiendes lo que le pasa.' },
  { codigo: 'P4.3e', p: 'Si cuento todo mi método en el video, ¿para qué me van a contratar?',
    r: 'Porque el que entiende el mapa completo es el que más quiere que alguien lo camine con él. El que se guarda la información genera desconfianza, no deseo.' },
  { codigo: 'P4.2e', p: 'Desde que puse el formulario bajaron las agendas.',
    r: 'Eso es el formulario funcionando. Lo que hay que mirar no son las agendas totales: es cuántas de las que llegan cierran. Cinco buenas valen más que veinte que terminan en "lo voy a pensar".' },
  { codigo: 'P4.2e', p: '¿No es mucho pedir tantos datos antes de agendar?',
    r: 'El que de verdad quiere resolverlo los completa. El que abandona en la pregunta cuatro no iba a comprar: te ahorró cuarenta y cinco minutos.' },
  { codigo: 'P4.1', p: '¿Necesito tener seguidores para que esto funcione?',
    r: 'No. Tu campaña le muestra tu anuncio a gente que no te conoce, y tu página hace el resto. Los seguidores ayudan después, cuando ya tienes qué vender. Por eso el contenido va en el mes 3.' },
  { codigo: 'P4.2b', p: '¿Tengo que publicar todos los días?',
    r: 'No, y menos ahora. Tu perfil hoy solo tiene que confirmar que eres una persona real que trabaja en serio. Publicar todas las semanas es otro programa y empieza después de estos noventa días.' },
  { codigo: 'P4.4', p: '¿Y si me rechazan la cuenta publicitaria?',
    r: 'Pasa, y casi siempre es por la página: falta el aviso legal al pie o promete un resultado médico. Revisa eso primero, pide la revisión, y mientras tanto sigue con lo demás.' },

  // ─── Ventas ──────────────────────────────────────────────────────────────
  { codigo: 'P5.2', p: 'Me dijo que está caro. ¿Qué contesto?',
    r: 'Primero pregunta comparado con qué. "Caro" casi nunca es el precio: es que todavía no ve qué gana. Si bajas el número ahí, le confirmas que valía menos.' },
  { codigo: 'P5.2', p: 'Quedó en pensarlo. ¿Le insisto?',
    r: '"Lo voy a pensar" casi siempre es una duda que no dijo. Pregunta cuál es, ahí, antes de cortar. Si cortas sin saberla, no vas a poder responderla nunca.' },
  { codigo: 'P5.2', p: 'Tiene que hablarlo con su pareja.',
    r: 'Eso se resuelve antes, no después: tu formulario pregunta quién decide, y si decide con alguien, esa persona tiene que estar en la llamada. Si ya pasó, ofrece una segunda llamada con los dos.' },
  { codigo: 'P5.2', p: '¿Hago descuento para cerrar la primera?',
    r: 'No. El primero siempre da miedo, y el descuento calma ese miedo a cambio de que el segundo también lo tengas que hacer. Si alguien no puede, tienes tu Puerta Chica.' },
  { codigo: 22, p: 'Me fue muy mal en mi primera llamada.',
    r: 'A todos. Por eso el día 39 la revisamos con números y no con recuerdos. Saca una sola cosa para cambiar en la próxima, no diez.' },
  { codigo: 22, p: '¿Puedo mandar la propuesta por escrito después?',
    r: 'La decisión se toma en la llamada. Una propuesta por escrito es una venta que se enfría con buenos modales. Si necesitas tiempo, es que faltó preguntar algo antes.' },
  { codigo: 'P6.2', p: 'Cerré la venta, ¿ahora cómo le cobro?',
    r: 'El link de pago tiene que estar hecho antes de tu primera llamada, no después. Se manda mientras siguen hablando: el sí de las cuatro de la tarde es un "déjame pensarlo" a las nueve de la noche.' },

  // ─── Sistema 4 · la app ──────────────────────────────────────────────────
  { codigo: 'P6.5', p: '¿Por qué recién ahora armamos la app?',
    r: 'Porque una app sin nadie adentro es una carpeta vacía, y armar carpetas vacías es la forma más elegante de no vender. Ahora ya cobraste: tienes a alguien real para meter ahí.' },
  { codigo: 'P6.7', p: '¿Cuántos videos necesito grabar?',
    r: 'Uno por etapa, cortos. Y graba primero lo que ya repites cuarenta veces por semana, no lo que te parece más lindo. Eso es lo que te devuelve horas.' },
  { codigo: 'P6.6', p: '¿Cargo las doce semanas de una vez?',
    r: 'No. Carga cuatro. Lo que aprendas con la primera persona te va a cambiar las otras ocho, y si ya las hiciste, las vas a rehacer.' },
  { codigo: 'P6.9', p: '¿Y si mi consultante no entra a la app?',
    r: 'Casi siempre es porque no sabe para qué. Cuando lo invites, dile qué va a encontrar y que la próxima sesión arrancan desde ahí. Eso solo cambia todo.' },

  // ─── Sistema 5 · la marca ────────────────────────────────────────────────
  { codigo: 'P7.4', p: '¿No debería haber empezado por el contenido?',
    r: 'No hay relación directa entre publicar y facturar. Hay profesionales con miles de seguidores que no llegan a fin de mes. Publicar sin tener qué vender es trabajar gratis con más pasos.' },
  { codigo: 'P7.7', p: '¿Y si no se me ocurre qué publicar?',
    r: 'No lo inventes: sácalo de tu Matriz ABC, que hiciste con las palabras literales de quienes atiendes. Ahí están los tres temas que te van a durar un trimestre.' },
  { codigo: 'P7.8', p: '¿Tengo que grabar con buena cámara?',
    r: 'Con el celular alcanza. Lo que sí importa es el sonido: imagen regular con buen audio se ve profesional, al revés no. Y hecho es mejor que perfecto.' },

  // ─── Ritmo y cierre ──────────────────────────────────────────────────────
  { codigo: 'P6.4', p: 'No llego con los tiempos, me atrasé varios días.',
    r: 'El camino no es un tren que se va. Retoma donde quedaste y sigue. Lo único que no conviene es saltear sesiones hacia adelante: cada una usa lo que selló la anterior.' },
  { codigo: 'P7.10', p: '¿Qué pasa si al día 90 no llegué a los diez?',
    r: 'El tablero de los cinco sistemas dice cuál quedó en amarillo y por qué. Si cumpliste tus compromisos, seguimos trabajando sin costo hasta que esté andando. Eso es lo que firmamos el día 1.' },
];

/** Las preguntas de una sesión, para precargar al Mentor. */
export function preguntasDe(codigo: string): Pregunta[] {
  // Indexadas por DÍA, que no cambia cuando el Camino se reordena. Si no hay,
  // se buscan por las piezas de esa jornada.
  const directas = CONSULTORIO.filter((q) => q.codigo === codigo);
  if (directas.length) return directas;
  const d = diaDelCodigo(codigo);
  const porDia = CONSULTORIO.filter((q) => q.codigo === d);
  if (porDia.length) return porDia;
  const jornada = roadmap.jornadas.find((j) => j.dia === d);
  const piezas = new Set(jornada?.piezas ?? []);
  return CONSULTORIO.filter((q) => typeof q.codigo === 'string' && piezas.has(q.codigo));
}

/** Bloque que se inyecta en el prompt del Mentor. */
export function bloqueConsultorio(codigo: string): string {
  const qs = preguntasDe(codigo);
  if (!qs.length) return '';
  return `\nLO QUE SIEMPRE PREGUNTAN EN ESTA SESIÓN (ya sabes la respuesta, no improvises otra):\n${qs
    .map((q) => `P: ${q.p}\nR: ${q.r}`)
    .join('\n\n')}`;
}
