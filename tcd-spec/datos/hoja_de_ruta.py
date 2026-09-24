"""
LA HOJA DE RUTA — el orden de los 90 días, decidido el 23 de septiembre de 2026.

El criterio, en una línea por semana:
  1  en ti: medición, tu árbol y el dinero, cómo te frenas, tu protocolo, tu precio
  2  tu programa: avatar, método, oferta de 1.000 USD, guiones
  3  grabas el lunes y empiezas a vender sin pauta
  4  llamadas, preventa a los tres primeros y tu primera venta
  5  la pauta
  6  tu app, co-creada con los tres que ya compraron
  7  escalar
  8-12  ciclo semanal y producto
  13 tu ecosistema y el cierre

Reglas de calendario: el día 1 es el lunes siguiente al onboarding, y sábados y
domingos quedan libres. La única excepción es el rodaje, si el cliente elige
moverlo ahí.

REUBICADAS trae las jornadas que ya existían, con su día nuevo. Cuando una
jornada nace de dos, sus piezas, tutoriales y ADN se suman, y los pasos son los
que están escritos acá.
"""

# Los once grados, atados a los hitos de la Hoja de Ruta y en orden de día.
GRADOS = {1: "10gup", 5: "9gup", 12: "8gup", 16: "7gup", 19: "6gup", 26: "5gup",
          31: "4gup", 38: "3gup", 45: "2gup", 47: "1gup", 90: "1dan"}

REUBICADAS = [{'dia': 0, 'origen': [0], 'titulo': 'Entrega técnica y llamada de bienvenida', 'sistema': None, 'minutos': 20, 'pasos': [], 'lleva': '', 'veredicto': ''},
    {'dia': 1, 'origen': [1, 3], 'titulo': 'Tu punto de partida', 'sistema': 1, 'minutos': 75, 'pasos': ['Contesta las diez preguntas de tu medición de entrada', 'Elige dónde y a qué hora vas a construir esto cada día', 'Suma lo que cobraste el último mes y las horas que trabajaste de verdad', 'Divide: esa es tu hora real neta', 'Escríbela donde la veas'], 'lleva': 'Tu medición de entrada y tu hora real neta, escritas.', 'veredicto': 'Ya sabes de dónde partes. El día 87 lo vuelves a medir.', 'cinturon': '9gup'},
    {'dia': 4, 'origen': [7], 'titulo': 'Tu protocolo, escrito por ti', 'sistema': 1, 'minutos': 45, 'pasos': ['Para cada disparador de ayer, elige un reemplazo que ya te guste. Ejemplo: en vez del postre, salgo a caminar veinte minutos', 'Que el reemplazo se pueda hacer en menos de cinco minutos y no dependa de nadie', 'Elige un gesto físico chico que lo arranque. Ejemplo: apoyar las dos manos en la mesa y respirar hondo una vez', 'Escribe tu protocolo en tres líneas: si pasa X, hago Y, y empiezo con este gesto', 'Pégalo donde trabajas y pruébalo esta semana'], 'lleva': 'Tu protocolo: si pasa esto, hago esto otro. Con tu gesto para arrancarlo.', 'veredicto': 'Ese es tu reset y es tuyo: nadie te va a decir qué comer ni a qué hora levantarte. Lo pruebas esta semana y lo corriges el día 32.'},
    {'dia': 5, 'origen': [8, 9], 'titulo': 'Tu precio nuevo y lo que sueltas', 'sistema': 1, 'minutos': 75, 'pasos': ['Pon lado a lado tu hora real neta y tu precio de hoy', 'Escribe tu precio nuevo y dilo tres veces en voz alta', 'Sella el precio y crea tu link de pago', 'Ordena a quienes atiendes en tres grupos: siguen, suben, sueltas', 'Si recién empiezas: escribe a quién no vas a atender'], 'lleva': 'Tu precio sellado, tu link de pago y tu cartera en tres grupos.', 'veredicto': 'Primero el número, después la cartera. Ya está hecho en ese orden.'},
    {'dia': 8, 'origen': [23, 13], 'titulo': 'A quién le hablas', 'sistema': 2, 'minutos': 60, 'pasos': ['Elige al consultante que mejor te salió', 'Escribe su dolor con sus palabras, como te lo dijo', 'Escribe qué quería lograr y qué ya había probado', 'Arma tu lista de veinte: nombres, no categorías', 'Al lado de cada nombre, su canal'], 'lleva': 'Tu avatar con sus palabras y tu lista de veinte.', 'veredicto': 'Ya no le hablas a todos. Le hablas a una persona, y tienes veinte nombres.'},
    {'dia': 9, 'origen': [15], 'titulo': 'Tu método, escrito con sus etapas', 'sistema': 2, 'minutos': 60, 'pasos': ['Escribe las etapas de lo que ya haces, en orden. Ejemplo: entrevista, medición, devolución', 'Define con qué entra la persona y con qué sale', 'Define cómo se mide: qué número miras al empezar y al terminar', 'Arma las siglas con una letra por etapa y ponle nombre'], 'lleva': 'Tu forma de trabajar, con etapas en orden y un nombre.', 'veredicto': 'Eso que ya hacías ahora se puede explicar, vender y repetir sin ti adelante.'},
    {'dia': 10, 'origen': [17, 18], 'titulo': 'Tu programa de 1.000 USD', 'sistema': 2, 'minutos': 75, 'pasos': ['Promesa: un resultado, no una actividad. Ejemplo: duermes seis horas seguidas, no diez sesiones', 'Plazo, con fecha de cierre', 'Entregables: lo que la persona recibe, no lo que tú haces', 'Precio con número, nunca menor al que sellaste el día 8', 'Para cada palanca, una acción tuya: más resultado, más certeza, menos tiempo, menos esfuerzo'], 'lleva': 'Tu oferta en una página, con su garantía.', 'veredicto': 'Dejaste de vender horas. Desde hoy vendes un resultado con plazo y precio.'},
    {'dia': 11, 'origen': [22, 26], 'titulo': 'Tus guiones', 'sistema': 3, 'minutos': 90, 'pasos': ['Escribe el guion del video de tu página', 'Escribe tres piezas que abren distinto y terminan igual', 'Escribe el mensaje para tu entorno', 'Dibuja la W de tu llamada', 'Arma la lista de lo que grabas el lunes'], 'lleva': 'Todos los guiones que grabas el lunes, escritos.', 'veredicto': 'El lunes no improvisas: grabas lo que ya está escrito.'},
    {'dia': 12, 'origen': [16], 'titulo': 'Tu método aprobado y todo listo', 'sistema': 2, 'minutos': 45, 'pasos': ['Presenta tu método a Diego', 'Examen 1: ¿se puede medir? Si no hay número al principio y al final, no es método', 'Examen 2: el qué y el cómo, separados', 'Examen 3: ¿importa el orden de las etapas?', 'Corrige lo que te devuelva y vuelve a presentarlo. Puedes reprobar las veces que haga falta'], 'lleva': 'Tu método pasado por los tres exámenes de Diego.', 'veredicto': 'Aprobado. Lo que aprobó Diego es lo que vas a poder cobrar sin justificarte.'},
    {'dia': 15, 'origen': [27], 'titulo': 'Tu día de rodaje', 'sistema': 3, 'minutos': 210, 'pasos': ['Graba primero los tres anuncios, uno detrás del otro', 'Después el video de tu página, de corrido y sin leer. Tres tomas y sigues', 'Al final, el de preparación para la llamada', 'No revises nada hasta terminar el día: mirar en el medio es la forma más eficiente de no grabar el resto', 'Sube los cinco archivos'], 'lleva': 'Cinco piezas grabadas en un solo día.', 'veredicto': 'Un día de grabación, un mes de contenido. Así se hace siempre.'},
    {'dia': 16, 'origen': [24, 25], 'titulo': 'Tu perfil y tu página, publicados', 'sistema': 3, 'minutos': 90, 'pasos': ['Foto: tu cara, fondo limpio, que se entienda en miniatura', 'Nombre buscable: cómo te buscarían, no tu título completo', 'Frase: tu promesa, no tu profesión. Ejemplo: ayudo a X a lograr Y', 'Enlace a tu página', 'Cierra y no toques nada más hoy'], 'lleva': 'Tu perfil con foto, nombre, frase y enlace.', 'veredicto': 'Con esas cuatro alcanza. El resto de tu perfil se trabaja el día 85, con tu ecosistema.'},
    {'dia': 17, 'origen': [28, 2], 'titulo': 'Tu agenda y tu cobro, andando', 'sistema': 3, 'minutos': 75, 'pasos': ['Sube el video a tu página', 'Arma el formulario con las cinco preguntas que filtran', 'Arma el calendario en dos pasos y conéctalo a tu correo', 'Arma la página de preparación que ve después de agendar', 'Agéndate a ti mismo desde el teléfono, de punta a punta, como si fueras un desconocido'], 'lleva': 'Tu circuito probado de punta a punta: formulario, agenda y confirmación.', 'veredicto': 'Te agendaste a ti mismo y funcionó. Desde ahora alguien puede llegar sin que tú hagas nada.'},
    {'dia': 18, 'origen': [14, 10], 'titulo': 'Le avisas a tu entorno', 'sistema': 3, 'minutos': 60, 'pasos': ['Edita la plantilla con tu voz: no vende, pide veinte minutos', 'Manda veinte hoy, empezando por los más fáciles', 'Marca en la app a quién le escribiste', 'Abre la plantilla del grupo uno y escríbela con tu voz', 'Escribe desde cuándo rige el precio nuevo. Ejemplo: desde el 1 del mes que viene'], 'lleva': 'Tus primeros veinte mensajes enviados y tu primera pieza publicada.', 'veredicto': 'Ya estás vendiendo. Sin pauta y con tu nombre.'},
    {'dia': 19, 'origen': [21, 36], 'titulo': 'Tu número y tu llamada', 'sistema': 3, 'minutos': 60, 'pasos': ['Elige un gesto físico chico y repetible. Ejemplo: apoyar la mano en la mesa', 'Grábate diciendo tu número veinte veces, con el gesto antes de cada una', 'Escucha la primera y la veinte, una después de la otra', 'Dibuja tu W sobre la plantilla', 'Escribe tus preguntas de cada tramo'], 'lleva': 'Tu precio dicho sin que tiemble y tu llamada ensayada.', 'veredicto': 'Escucha la primera y la última: ahí se oye si el precio ya es tuyo.'},
    {'dia': 22, 'origen': [37, 38], 'titulo': 'Tus primeras llamadas', 'sistema': 3, 'minutos': 60, 'pasos': ['Elige a quién de tu red le ofreciste y todavía no cerraste', 'Repasa tu W una vez, no más', 'Haz la llamada', 'Escribe qué objeción apareció', 'Escribe tu mensaje previo'], 'lleva': 'La primera objeción real, dicha por alguien, no imaginada.', 'veredicto': 'Esa objeción vale más que un mes de pensar la oferta. Aparece después de ofrecer, nunca antes.'},
    {'dia': 23, 'origen': [39, 42], 'titulo': 'Grabar y revisar tus llamadas', 'sistema': 3, 'minutos': 30, 'pasos': ['Activa la grabación en el Sistema', 'Escribe la frase con la que avisas', 'Sube o elige una llamada real', 'Escúchala entera: la app no deja saltar', 'Anota los cuatro números'], 'lleva': 'Tus llamadas grabadas desde hoy, con tu aviso escrito.', 'veredicto': 'Tu llamada mejora escuchándote. Desde hoy tienes con qué.'},
    {'dia': 25, 'origen': [44], 'titulo': 'Tu recuperador', 'sistema': 3, 'minutos': 60, 'pasos': ['Arma tu bandeja con los cuatro estados', "A cada 'no ahora' ponle fecha de vuelta", 'Arma las respuestas automáticas', 'Protocolo: escribe la lista de lo que te deben y táchala'], 'lleva': 'Tu bandeja clasificada y el recuperador andando.', 'veredicto': 'El que comentó y no avanzó vuelve solo. Deja de depender de tu memoria.'},
    {'dia': 26, 'origen': [12, 33], 'titulo': 'Tu primera venta y tus números', 'sistema': 3, 'minutos': 45, 'pasos': ['Manda el link a quien ya dijo que sí', 'Cuando entre el cobro, sube el comprobante', 'Escribe al lado quién viene después, con nombre y fecha. Eso evita que lo bajes', 'Arma la vista con cuatro columnas y nada más: gasto, entradas, agendas y costo por agenda', 'Anota tu costo por agenda de hoy'], 'lleva': 'Un cobro entrado a tu precio digno, con su comprobante.', 'veredicto': 'Cobraste tu precio antes de gastar un peso en publicidad. Ese es el orden correcto.'},
    {'dia': 29, 'origen': [29], 'titulo': 'Meta conectado y tu pixel midiendo', 'sistema': 3, 'minutos': 90, 'pasos': ['Conecta tu página y tu perfil profesional', 'Crea tu cuenta publicitaria dentro de tu business', 'Carga tu forma de pago', 'Instala el pixel en tu página y pruébalo abriéndola desde el teléfono'], 'lleva': 'Tu cuenta publicitaria, tu forma de pago y tu pixel disparando.', 'veredicto': 'Tu pixel ya le avisa a Meta quién sirve y quién no. Sin eso, la plataforma te trae a cualquiera.'},
    {'dia': 30, 'origen': [30], 'titulo': 'Tus tres anuncios, listos para salir', 'sistema': 3, 'minutos': 60, 'pasos': ['Edita corto: sin música, sin intro y sin logo animado', 'Ponles subtítulos quemados: la mayoría los mira sin sonido', 'Súbelos al banco de creativos y márcalos como listos'], 'lleva': 'Los tres anuncios editados y cargados, listos para encender.', 'veredicto': 'Tres anuncios distintos compitiendo entre sí. El que gane lo decide el número, no tu gusto.'},
    {'dia': 31, 'origen': [31], 'titulo': 'Encender tus dos campañas', 'sistema': 3, 'minutos': 90, 'pasos': ['Campaña 1, frío amplio: sin intereses, solo país, ciudad y edad. Va a tu recurso gratuito', 'Campaña 2, retargeting: quienes vieron tu recurso, tus videos o tu perfil. Va directo a tu video de venta', 'Reparte el presupuesto mitad y mitad', 'Los tres anuncios adentro del mismo conjunto, para que compitan entre ellos', 'Enciende y anota la fecha y la hora'], 'lleva': 'Tus dos campañas corriendo: la que atrae y la que vende.', 'veredicto': 'Están encendidas. Ahora vienen catorce días sin tocar nada: al tercero vas a querer cambiar algo, y por eso a la mayoría no le funciona.'},
    {'dia': 32, 'origen': [11, 20], 'titulo': 'Cerrar y derivar sin culpa', 'sistema': 1, 'minutos': 45, 'pasos': ['A quien termina, escríbele cuándo cierra su proceso y qué se lleva', 'A quien se deriva, pásale un nombre concreto y preséntalos', 'Carga las fechas de cierre en tu agenda', 'Escribe qué recibe tu consultante a cambio del dinero', 'Escribe qué se libera él al pagar. Ejemplo: deja de deberse a sí mismo empezar'], 'lleva': 'Cada proceso que termina, con su fecha de alta.', 'veredicto': 'Nadie queda a medias. Eso también es parte de tu trabajo.'},
    {'dia': 33, 'origen': [34], 'titulo': 'Mientras la pauta aprende', 'sistema': 3, 'minutos': 20, 'pasos': ['Mira tu tablero una vez. Anota el costo por agenda de hoy', 'No toques nada de la campaña. Al tercer día vas a querer: por eso a la mayoría no le funciona', 'Sigue escribiendo a tu red: dos mensajes nuevos'], 'lleva': 'Un día más de datos, sin tocar nada.', 'veredicto': 'Catorce días juntos valen más que catorce cambios sueltos. Falta menos.'},
    {'dia': 36, 'origen': [47], 'titulo': 'La cinta', 'sistema': 4, 'minutos': 45, 'pasos': ['Parte tu programa en dos columnas: grabado y en vivo', 'Nombra tus estaciones, en orden', 'Define tu línea base', 'Haz la cuenta: horas para uno, horas para diez'], 'lleva': 'Tus dos columnas, tus estaciones y tu línea base.', 'veredicto': 'Ya sabes qué se graba y qué va en vivo. Eso es lo que te deja atender diez sin quemarte.'},
    {'dia': 37, 'origen': [48], 'titulo': 'El alta', 'sistema': 4, 'minutos': 45, 'pasos': ['Escribe tu mensaje de bienvenida', 'Escribe tus tres límites', 'Ordena tus siete pasos del alta', 'Conecta la línea base al triage'], 'lleva': 'Tu bienvenida, tus tres límites y tus siete pasos del alta.', 'veredicto': 'Un límite dicho el primer día es un acuerdo. El mismo límite en la semana seis es un reclamo.'},
    {'dia': 38, 'origen': [50], 'titulo': 'Tu app, con tu marca', 'sistema': 4, 'minutos': 45, 'pasos': ['Carga tu nombre, tu color y tu logo. Nada más por hoy', 'La app se publica sola en tu dirección', 'Ábrela desde tu teléfono y mírala como la va a ver tu consultante', 'Guarda tus dos accesos: el del código y el de la publicación'], 'lleva': 'Tu app publicada, con tu nombre, tu color y tu logo.', 'veredicto': 'Es tuya: el repositorio y la cuenta están a tu nombre. Puedes llevártela cuando quieras.'},
    {'dia': 39, 'origen': [51], 'titulo': 'Tus etapas, con lo que pidieron los tres', 'sistema': 4, 'minutos': 90, 'pasos': ['Aprieta el botón que trae todo desde tu ADN', 'Revisa que haya llegado bien y corrige', 'Arma cuatro semanas con lo que desbloquea cada una', 'Carga cuatro, no doce'], 'lleva': 'Tus cuatro etapas cargadas, en orden.', 'veredicto': 'Tu método entró a tu app. Lo que enseñas ya no se repite: se abre.'},
    {'dia': 40, 'origen': [53], 'titulo': 'Invitar al primero y tocar algo tú', 'sistema': 4, 'minutos': 60, 'pasos': ['Cómprate a ti mismo con una tarjeta real y recorre lo que recorre tu consultante', 'Invita a tu primer consultante y mándale la frase exacta', 'Cambia un texto de tu app con Claude: pídeselo en una línea y publica', 'Sácale captura a lo que cambiaste'], 'lleva': 'Tu primer consultante adentro, y un cambio hecho por ti en la app.', 'veredicto': 'Ya entregas por tu app y ya sabes cambiarle algo. Eso es no depender de nadie.'},
    {'dia': 43, 'origen': [46], 'titulo': 'Escalar o apagar', 'sistema': 3, 'minutos': 45, 'pasos': ['Mira tu costo por agenda de los catorce días', 'La app habilita un solo botón según tu número', 'Escribe la decisión y el número que la justifica'], 'lleva': 'Tu decisión escrita: qué sigue, qué se apaga y con cuánto.', 'veredicto': 'Decidiste con el número, no con la sensación. Así se sube el presupuesto sin miedo.'},
    {'dia': 44, 'origen': [52], 'titulo': 'Rodaje de tu app', 'sistema': 4, 'minutos': 150, 'pasos': ["Elige de tu columna 'va grabado' del día 47", 'Uno por etapa, de tres a siete minutos', 'Una sola toma por video', 'Sin edición: se sube como salió'], 'lleva': 'Tus cuatro videos de entrega grabados.', 'veredicto': 'Un día de rodaje, un mes tranquilo. Eso que grabaste hoy lo vas a usar con cada consultante.'},
    {'dia': 45, 'origen': [45], 'titulo': 'Tu primer consultante nuevo', 'sistema': 3, 'minutos': 30, 'pasos': [], 'lleva': 'El cobro de alguien que no te conocía, con su origen.', 'veredicto': 'La máquina camina: alguien pagó sin conocerte. Eso ya no depende de tu agenda.'},
    {'dia': 46, 'origen': [19], 'titulo': 'Tus cinco niveles', 'sistema': 2, 'minutos': 45, 'pasos': ['Diseña los cinco niveles, de la puerta de entrada al acompañamiento más completo', 'Marca el tercero: es el único que vendes hoy', 'Elige qué nivel ofreces primero después de tu programa'], 'lleva': 'Tu escalera de cinco niveles, con el tercero marcado, y tu rodaje agendado.', 'veredicto': 'Vendes uno solo: el tercero. Los otros existen para que ese se entienda.'},
    {'dia': 47, 'origen': [55], 'titulo': 'La máquina de 10', 'sistema': 3, 'minutos': 45, 'pasos': ['La app trae tus números reales del tablero', 'Escribe la cadena: conversaciones, agendas, llamadas, ventas', 'Tradúcelo a lo que tiene que pasar cada semana', 'Marca cuál de los tres cuellos tienes'], 'lleva': 'Tu cadena con tus números: conversaciones, agendas, llamadas y ventas.', 'veredicto': 'Ahí está tu cuello. Se arregla uno a la vez, y siempre el de más arriba.'},
    {'dia': 50, 'origen': [56], 'titulo': 'Tu semana 8', 'sistema': 3, 'minutos': 45, 'pasos': ['Publica la pieza que ya tenías escrita. Hoy sale, no se escribe', 'Contesta a todos los que escribieron, cada uno con una pregunta', 'Da las llamadas de la semana con tu W adelante', 'Atiende a tus consultantes activos: marca quién está en su semana 2 y quién en la 7', 'Carga tus cuatro números: conversaciones, agendas, llamadas y ventas'], 'lleva': 'Una semana cerrada, con sus cuatro números.', 'veredicto': 'Ahí está tu cuello de esta semana. Se arregla uno a la vez, y siempre el de más arriba.'},
    {'dia': 57, 'origen': [56], 'titulo': 'Tu semana 9', 'sistema': 3, 'minutos': 45, 'pasos': ['Publica la pieza que ya tenías escrita. Hoy sale, no se escribe', 'Contesta a todos los que escribieron, cada uno con una pregunta', 'Da las llamadas de la semana con tu W adelante', 'Atiende a tus consultantes activos: marca quién está en su semana 2 y quién en la 7', 'Carga tus cuatro números: conversaciones, agendas, llamadas y ventas'], 'lleva': 'Una semana cerrada, con sus cuatro números.', 'veredicto': 'Ahí está tu cuello de esta semana. Se arregla uno a la vez, y siempre el de más arriba.'},
    {'dia': 64, 'origen': [56], 'titulo': 'Tu semana 10', 'sistema': 3, 'minutos': 45, 'pasos': ['Publica la pieza que ya tenías escrita. Hoy sale, no se escribe', 'Contesta a todos los que escribieron, cada uno con una pregunta', 'Da las llamadas de la semana con tu W adelante', 'Atiende a tus consultantes activos: marca quién está en su semana 2 y quién en la 7', 'Carga tus cuatro números: conversaciones, agendas, llamadas y ventas'], 'lleva': 'Una semana cerrada, con sus cuatro números.', 'veredicto': 'Ahí está tu cuello de esta semana. Se arregla uno a la vez, y siempre el de más arriba.'},
    {'dia': 66, 'origen': [86], 'titulo': 'Agrandar el vaso', 'sistema': 1, 'minutos': 30, 'pasos': ['Escribe tu día completo con el ingreso siguiente, en detalle físico', 'En presente, no en condicional'], 'lleva': 'Tu día siguiente escrito, con lo que sostiene el ritmo.', 'veredicto': 'Lo que aguanta no es la motivación: es el tamaño del vaso que construiste.'},
    {'dia': 71, 'origen': [56], 'titulo': 'Tu semana 11', 'sistema': 3, 'minutos': 45, 'pasos': ['Publica la pieza que ya tenías escrita. Hoy sale, no se escribe', 'Contesta a todos los que escribieron, cada uno con una pregunta', 'Da las llamadas de la semana con tu W adelante', 'Atiende a tus consultantes activos: marca quién está en su semana 2 y quién en la 7', 'Carga tus cuatro números: conversaciones, agendas, llamadas y ventas'], 'lleva': 'Una semana cerrada, con sus cuatro números.', 'veredicto': 'Ahí está tu cuello de esta semana. Se arregla uno a la vez, y siempre el de más arriba.'},
    {'dia': 78, 'origen': [56], 'titulo': 'Tu semana 12', 'sistema': 3, 'minutos': 45, 'pasos': ['Publica la pieza que ya tenías escrita. Hoy sale, no se escribe', 'Contesta a todos los que escribieron, cada uno con una pregunta', 'Da las llamadas de la semana con tu W adelante', 'Atiende a tus consultantes activos: marca quién está en su semana 2 y quién en la 7', 'Carga tus cuatro números: conversaciones, agendas, llamadas y ventas'], 'lleva': 'Una semana cerrada, con sus cuatro números.', 'veredicto': 'Ahí está tu cuello de esta semana. Se arregla uno a la vez, y siempre el de más arriba.'},
    {'dia': 85, 'origen': [61], 'titulo': 'Tu ecosistema circular', 'sistema': 5, 'minutos': 45, 'pasos': ['Saca tus tres enfoques de la Matriz ABC', 'Para cada enfoque, escribe a quién filtra y a quién atrae'], 'lleva': 'Tus tres enfoques de marca, con a quién filtra cada uno.', 'veredicto': 'Sesenta días sin publicar fue a propósito. Ahora tienes qué vender y cómo venderlo: recién ahora el contenido rinde.'},
    {'dia': 86, 'origen': [67], 'titulo': 'Las doce semanas escritas', 'sistema': 5, 'minutos': 90, 'pasos': ['Reparte tus tres enfoques en doce semanas', 'Para cada semana, el gancho y el ángulo', 'Marca cuáles son de filtro y cuáles de autoridad', 'No grabes nada todavía'], 'lleva': 'Tus doce semanas escritas, con su gancho y su ángulo.', 'veredicto': 'Lo escribiste todo hoy. Se graba en un solo día y te deja un mes tranquilo.'},
    {'dia': 87, 'origen': [87], 'titulo': 'Tu foto de llegada', 'sistema': 0, 'minutos': 45, 'pasos': ['Contesta las mismas preguntas del día 3', 'Recalcula tu hora real neta con los datos de Mi Clínica', 'Recién ahí la app destapa el número del día 3'], 'lleva': 'Tus dos números lado a lado: el del día 3 y el de hoy.', 'veredicto': 'Ese es el cambio, medido. No te lo cuenta nadie: lo ves.'},
    {'dia': 88, 'origen': [88], 'titulo': 'Tu plan de 180 días', 'sistema': 0, 'minutos': 45, 'pasos': ['La app arma el borrador de tu plan de 180', 'Edítalo, apruébalo y descárgalo', 'Te lo llevas lo tomes o no lo tomes'], 'lleva': 'Tu plan de 180 días, tuyo, lo uses con nosotros o solo.', 'veredicto': 'Tienes la máquina andando. Lo que sigue es que te conozcan más personas, y eso es otro trabajo.'},
    {'dia': 89, 'origen': [89], 'titulo': 'El cierre', 'sistema': 0, 'minutos': 45, 'pasos': ['Mira cuántas ventas tienes y cuántas te faltan', 'Escribe qué puedes cerrar esta semana con lo que ya está en la bandeja'], 'lleva': 'Lo que se puede cerrar antes de que termine, con nombre y fecha.', 'veredicto': 'Los últimos días valen: hay ventas que solo se cierran cuando hay fecha.'}]

NUEVAS = [
  dict(dia=2, tipo="sesion", titulo="Tu árbol y el dinero", sistema=1, minutos=75,
       agente="espejo", piezas=["P1.3"],
       lleva="Tu linaje del dinero en una página y tu permiso escrito.",
       veredicto="Lo que heredaste ya tiene nombre. Desde hoy es una decisión, no un destino.",
       pasos=["Escribe las frases sobre el dinero que escuchaste en tu casa",
              "Arma tu árbol: padres y abuelos, y cómo vivió cada uno el dinero",
              "Marca el techo: lo máximo que ganó alguien de tu familia",
              "Contesta: si te fuera muy bien, ¿a quién sentirías que traicionas?",
              "Escribe tu permiso: gano más y sigo siendo de mi familia"],
       evidencias=[("texto", "Tu permiso escrito",
                    "nombra a alguien concreto y está escrito en primera persona",
                    "Pega tu permiso escrito.")],
       adn=["linaje", "reset.permiso"]),

  dict(dia=3, tipo="sesion", titulo="Cómo te frenas y cómo te empujas", sistema=1, minutos=60,
       agente="espejo", piezas=["P1.4"],
       lleva="Tu tipo, tus tres disparadores y dónde los sientes.",
       veredicto="Ya sabes qué te saca de eje. Mañana escribes qué haces cuando pasa.",
       pasos=["Contesta el test y mira tu tipo",
              "Lee cómo se ve tu tipo cuando estás entero y cuando estás cansado",
              "Anota tres situaciones de tu semana que te sacan de eje",
              "Escribe qué haces hoy en cada una",
              "Marca dónde lo sientes en el cuerpo"],
       evidencias=[("texto", "Tus tres disparadores",
                    "tres situaciones concretas, con qué hace hoy en cada una",
                    "Escribe tus tres disparadores.")],
       adn=["eneagrama", "reset.disparadores"]),

  dict(dia=24, tipo="sesion", titulo="Tu preventa: los tres primeros", sistema=2, minutos=60,
       agente="vera",
       lleva="Tu preventa escrita y enviada.",
       veredicto="Los tres primeros compran lo mismo que el resto, y construyen contigo lo que viene.",
       pasos=["Elige dos bonos del menú para los tres primeros",
              "Al mismo precio que el resto",
              "Escribe el mensaje de preventa con esos dos bonos adentro",
              "Envíalo a quienes ya te dijeron que sí o casi",
              "Anota a quién le escribiste y qué te contestó"],
       evidencias=[("texto", "Tu mensaje de preventa",
                    "nombra los dos bonos elegidos y el precio completo",
                    "Pega tu mensaje de preventa.")],
       adn=["oferta.bonos_preventa"]),

  dict(dia=52, tipo="sesion", titulo="Tu entrega, revisada con los primeros", sistema=4, minutos=45,
       lleva="Una mejora real en tu entrega.",
       veredicto="Tu producto ahora tiene la forma que pidieron los que pagaron.",
       pasos=["Pregúntale a cada uno qué le sirvió y qué le faltó",
              "Anota lo que se repite",
              "Cambia una cosa de tu entrega esta semana"],
       evidencias=[("texto", "Lo que cambiaste",
                    "un cambio concreto, con el pedido que lo originó",
                    "Escribe qué cambiaste y por qué.")]),

  dict(dia=59, tipo="sesion", titulo="Tus ejercicios en la app", sistema=4, minutos=45,
       lleva="Tres ejercicios tuyos, adentro de tu app.",
       veredicto="Lo que antes explicabas en cada sesión ahora vive en tu app.",
       pasos=["Elige los tres ejercicios que más te piden",
              "Súbelos a tu app con sus instrucciones",
              "Pídeles a tus consultantes que los prueben esta semana"],
       evidencias=[("captura", "Tus ejercicios cargados",
                    "se ven los tres adentro de su app",
                    "Sube la captura de tus tres ejercicios cargados.")]),

  dict(dia=73, tipo="sesion", titulo="Sus resultados, contados por ellos", sistema=3, minutos=45,
       lleva="Tres resultados con permiso para usarlos.",
       veredicto="Desde hoy tu oferta la cuentan ellos, no solo tú.",
       pasos=["Pídele a cada uno su resultado en una frase",
              "Pide permiso por escrito para usarlo",
              "Guárdalo en tu ADN, con su nombre y su fecha"],
       evidencias=[("texto", "Tres resultados con permiso",
                    "tres frases de tres personas, con permiso escrito",
                    "Pega los tres resultados.")],
       adn=["prueba.testimonios"]),

  dict(dia=90, tipo="cierre", titulo="Tu graduación", sistema=0, minutos=0, cinturon="1dan",
       lleva="Tus noventa días cerrados, con tus dos números lado a lado.",
       veredicto="Terminaste. Tienes número, precio, método, oferta, embudo, app y tu ecosistema andando.",
       pasos=["Mira tu medición de entrada y la de llegada, una al lado de la otra"],
       evidencias=[("evento", "Tus noventa días",
                    "medición de entrada y de llegada, las dos cargadas",
                    "Se marca sola cuando cierras el día 89.")]),

  dict(dia=80, tipo="sesion", titulo="Tu control de 7.000 USD", sistema=1, minutos=45,
       agente="ramiro",
       lleva="Tu número vendido y tus horas recuperadas.",
       veredicto="Con ese número se abre tu ecosistema, o se ve exactamente qué corregir antes.",
       pasos=["Suma todo lo que vendiste desde el día 1",
              "Cuenta cuántas horas recuperaste por semana",
              "Si pasaste los 7.000, tu ecosistema se abre el día 85",
              "Si todavía no, elige qué corriges: anuncios, VSL, oferta, triage o perfil"],
       evidencias=[("numero", "Tu total vendido",
                    "la suma de todo lo cobrado desde el día 1",
                    "Escribe cuánto vendiste en total.")],
       adn=["numeros.total_vendido"]),
]
