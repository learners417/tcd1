#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera datos/roadmap.seed.json — las 90 jornadas del camino TCD."""
import json, collections

S = lambda **k: k

PIEZAS = [
 ("P0.0","Bienvenida: de profesional a director",1,1,"montaña",5,"CERO"),
 ("P0.3","El Búnker de Luz",1,1,"oficina",4,"REGRABAR"),
 ("P0.4","Tu clínica de hoy, adentro",2,4,"pantalla",6,"NUEVO"),
 ("P1.0","Tu hora real neta",3,1,"pizarra",6,"NUEVO"),
 ("P1.1","Por qué el dinero se sana primero",4,1,"oficina",6,"MANTIENE"),
 ("P1.4","El dinero en el cuerpo",5,1,"voz",45,"MANTIENE"),
 ("P3.7","La transición de tu cartera",8,1,"oficina",8,"NUEVO"),
 ("P3.8","Tu precio digno",9,1,"pizarra",6,"NUEVO"),
 ("P3.9","Tu primer cobro al precio nuevo",12,1,"oficina",4,"NUEVO"),
 ("P2.1","Tu método propio",15,2,"pizarra",6,"MANTIENE"),
 ("P2.4b","La prueba de tu método",16,2,"pizarra",6,"NUEVO"),
 ("P3.1","La oferta que se vende sola",17,2,"pizarra",7,"REGRABAR"),
 ("P3.2b","Tu garantía de extensión",18,2,"oficina",6,"NUEVO"),
 ("P3.3b","Tu escalera de cinco niveles",19,2,"pizarra",6,"NUEVO"),
 ("P4.1a","Apertura del circuito",22,3,"lago",1,"NUEVO"),
 ("P4.1","El circuito completo",22,3,"pizarra",7,"CERO"),
 ("P4.1c","Frío o tibio, tu camino",23,3,"pizarra",5,"NUEVO"),
 ("P4.2b","Tu perfil en veinte minutos",24,3,"pantalla",3,"NUEVO"),
 ("P4.2d","Crear tu página con Claude",25,3,"pantalla",10,"NUEVO"),
 ("P4.3e","Cómo se arma tu VSL",26,3,"pantalla",8,"NUEVO"),
 ("P4.2e-i","Intro · antes del formulario",28,3,"oficina",1.5,"NUEVO"),
 ("P4.4","ENCIENDE, tu campaña única",31,3,"pizarra",7,"NUEVO"),
 ("P4.4b","Crear tu campaña en Meta",31,3,"pantalla",7,"NUEVO"),
 ("P4.7","Leer tu tablero",33,3,"pantalla",8,"NUEVO"),
 ("P5.1","Anatomía de la llamada, la W",36,3,"pizarra",8,"REGRABAR"),
 ("P5.2","La venta empieza en la agenda",38,3,"pantalla",5,"MANTIENE"),
 ("P5.4-i","Intro · antes de grabar llamadas",39,3,"oficina",1.5,"NUEVO"),
 ("P5.6","La autopsia de tu llamada",42,3,"pizarra",5,"NUEVO"),
 ("P4.5","Tu recuperador",44,3,"pantalla",5,"REGRABAR"),
 ("P6.3","Tu primer consultante nuevo",45,3,"oficina",5,"NUEVO"),
 ("P4.4c","Cuándo escalar y cuándo apagar",46,3,"pantalla",7,"NUEVO"),
 ("P6.1","Entregar sin quemarte, la cinta",47,4,"oficina",7,"CERO"),
 ("P6.2","El alta, siete pasos y tres límites",48,4,"oficina",6,"NUEVO"),
 ("P8.1","Tu app con tu marca",50,4,"pantalla",5,"NUEVO"),
 ("P8.2","Traer tu método y armar tus etapas",51,4,"pantalla",7,"NUEVO"),
 ("P8.4","Subir tus videos y materiales",52,4,"pantalla",6,"NUEVO"),
 ("P8.5","Invitar a tu primer consultante",53,4,"pantalla",6,"NUEVO"),
 ("P7.1a","Apertura de la máquina de 10",55,3,"montaña",1,"NUEVO"),
 ("P7.1","La máquina de 10 por mes",55,3,"pizarra",6,"NUEVO"),
 ("P9.1","Por qué la marca va última",61,5,"montaña",6,"NUEVO"),
 ("P9.4","Las doce semanas escritas",67,5,"pizarra",5,"NUEVO"),
 ("P10.2","Tu foto de llegada",87,0,"montaña",2,"NUEVO"),
 ("P10.3","Qué sigue, a Desafío Matrix",88,0,"lago",7,"NUEVO"),
]

TUTORIALES = [
 ("L-01","Tu primer ingreso a la plataforma",1,4,"TCD"),
 ("L-02","Cargar consultantes, agenda y cobros",2,9,"MCD"),
 ("L-03","Tu link de pago",9,5,"Sistema"),
 ("L-04","Facturar y llevar la cuenta",9,5,"Sistema"),
 ("L-05","Subir tu página y publicarla",25,4,"Sistema"),
 ("L-06","Tu subdominio",25,3,"Sistema"),
 ("L-07","Subir tu video a la página",28,4,"Sistema"),
 ("L-08","Tu formulario de filtro",28,6,"Sistema"),
 ("L-09","Tu calendario en dos pasos",28,5,"Sistema"),
 ("L-10","Tu página de preparación",28,4,"Sistema"),
 ("L-11","Tu página y perfil profesional",29,6,"Meta"),
 ("L-12","Business y cuenta publicitaria",29,7,"Meta"),
 ("L-13","Tarjeta o PayPal",29,4,"Meta"),
 ("L-14","Tu pixel",29,5,"Meta"),
 ("L-15","Tu evento de agenda calificada",31,5,"Meta"),
 ("L-16","Tu público de retargeting",31,4,"Meta"),
 ("L-17","Grabar tus llamadas",39,4,"Sistema"),
 ("L-18","Tu bandeja y tu embudo",44,7,"Sistema"),
 ("L-19","Tus respuestas automáticas",44,5,"Sistema"),
 ("L-20","Grabar y editar con el celular",67,5,"Celular"),
 ("L-21","Programar tu contenido del mes",67,5,"Sistema"),
]

CINTURONES = [
 ("10gup","Blanco","#FFFFFF",None,1,"La semilla bajo la nieve","Búnker abierto y pacto publicado",False),
 ("9gup","Blanco punta amarilla","#FFFFFF","#E8C24A",3,"La semilla toca la tierra","Su hora real neta escrita a mano",False),
 ("8gup","Amarillo","#E8C24A",None,12,"La tierra","Primer cobro a su cartera al precio nuevo",True),
 ("7gup","Amarillo punta verde","#E8C24A","#4E8C57",16,"Asoma el tallo","Método aprobado por Diego",False),
 ("6gup","Verde","#4E8C57",None,19,"La planta en pie","Oferta completa en una página",False),
 ("5gup","Verde punta azul","#4E8C57","#3A6EA5",25,"La planta busca el cielo","El enlace vivo de su página",False),
 ("4gup","Azul","#3A6EA5",None,28,"El cielo","Agendarse a sí mismo de punta a punta",False),
 ("3gup","Azul punta roja","#3A6EA5","#A6392E",31,"Se acerca el peligro","Campaña activa, con fecha y hora",False),
 ("2gup","Rojo","#A6392E",None,45,"El sol, y el aviso","Cobro de alguien que no lo conocía",True),
 ("1gup","Rojo punta negra","#A6392E","#1A1815",55,"Controla la fuerza","Captura desde el celular de su consultante",False),
 ("1dan","Negro","#1A1815",None,90,"Lo que ya no se altera","Los dos números lado a lado",True),
]

# Nueve entrenadores. Ocho son los que ya existen como código en src/lib/agents
# (diego, sofi, vera, mateo, caro, bruno, lucas, ramiro) y el Espejo, que no
# tiene equivalente y sostiene once jornadas del trabajo interno.
# El día es ESTIMACIÓN. Lo que abre al entrenador es "se_abre_con".
AGENTES = [
 ("espejo","El Espejo","el trabajo interno",3,"hora_real_neta_cargada"),
 ("vera","Vera","tu precio",9,"precio_digno_sellado"),
 ("sofi","Sofi","tus mensajes",14,"veinte_mensajes_enviados"),
 ("diego","Diego","tu producto",15,"metodo_escrito"),
 ("mateo","Mateo","tu contenido",22,"oferta_sellada"),
 ("caro","Caro","tu cámara",24,"perfil_cerrado"),
 ("lucas","Lucas","tus llamadas",36,"w_dibujada"),
 ("ramiro","Ramiro","tu embudo",33,"campana_activa"),
 ("bruno","Bruno","tu entrega",47,"primer_cobro_sistema"),
]

FRENOS = [
 ("F-ORDEN","No se abre una sesión sin cerrar la anterior, salvo que su evidencia dependa de que otro pague",
  "evidencia_anterior_aprobada or anterior.avanza_sin_evidencia",
  "El orden es el método. Terminá la de ayer."),
 ("F-PAGINA","El día 26 no abre sin el enlace de la página","adn.sistema.url_pagina",
  "Sin página publicada, el guion del video no tiene dónde vivir."),
 ("F-RODAJE","La fecha de rodaje se elige el día 19","evento.rodaje_agendado",
  "Elegí el día. El rodaje que no tiene fecha no ocurre."),
 ("F-14DIAS","Escalar o apagar queda cerrado del 31 al 45","dia>=46",
  "Faltan {n} días. Tu campaña está aprendiendo."),
 ("F-TABLERO","Ramiro responde 'todavía no' del 31 al 45","dia>=46",None),
 ("F-COMPRA","No invita sin hacer la compra de prueba","evento.compra_de_prueba",
  "Comprate a vos mismo antes de invitar a nadie."),
 ("F-PRECIO","El precio del día 17 no puede ser menor al del día 9","oferta.precio>=numeros.precio_digno",
  "Tu oferta no puede valer menos que lo que ya cobrás."),
 ("F-ADN","Ningún agente arranca con campos requeridos vacíos","adn.campos_requeridos",
  "{agente} necesita {campo}. Volvé al día {dia}."),
 ("F-GRADO-ESPERA","El grado que depende de que otro pague queda pendiente y visible; el camino sigue",
  "cinturon.en_ventana",
  "Sigues en {grado_actual}. Te falta {lo_que_falta} para el siguiente. Mientras tanto, el paso de hoy es este."),
 ("F-ORGANICO","No se graba contenido de marca dentro de los 90 días","dia>90",
  "Hoy escribís las doce. Se graban en un solo día, después del 90."),
]

# ── jornadas ────────────────────────────────────────────────────────────────
J = {}

def add(dia, tipo, titulo, **kw):
    j = {"dia": dia, "tipo": tipo, "titulo": titulo,
         "sistema": kw.get("sistema"), "minutos": kw.get("minutos", 0),
         "piezas": kw.get("piezas", []), "tutoriales": kw.get("tutoriales", []),
         "agente": kw.get("agente"), "manual": kw.get("manual"),
         "acceso": kw.get("acceso"), "pasos": kw.get("pasos", []),
         "evidencias": kw.get("evidencias", []), "adn_escribe": kw.get("adn", []),
         "freno_activa": kw.get("activa", []), "freno_levanta": kw.get("levanta", []),
         "cinturon": kw.get("cinturon"), "jornada_larga": kw.get("larga", False),
         # Lo que el cliente se lleva, en una línea (lo primero que lee).
         "lleva": kw.get("lleva"),
         # Lo que la app le devuelve cuando sube su evidencia: una lectura, no
         # un "listo". Sin esto, subir algo es teatro.
         "veredicto": kw.get("veredicto"),
         "acciones_campo": kw.get("campo", []), "nota": kw.get("nota"),
         # modo 15 minutos: el índice del paso que produce la evidencia.
         # Por defecto el último; se puede fijar con esencial=N (base 1).
         "paso_esencial": kw.get("esencial", len(kw.get("pasos", [])) or None)}
    # Si TODA la evidencia depende de que otro pague, el paso se puede dar igual
    # y lo que queda pendiente es el grado, no el camino.
    evs = j["evidencias"]
    j["avanza_sin_evidencia"] = bool(evs) and all(e.get("del_mercado") for e in evs)
    J[dia] = j

def pedido(tipo, nombre):
    """Lo que la app le PIDE al cliente, en sus palabras. `valida` es la regla
    con la que el sistema revisa, y nunca se le muestra a él."""
    n = nombre[0].lower() + nombre[1:] if nombre[:2] != nombre[:2].upper() else nombre
    ya_es_imagen = n.startswith(("foto", "captura", "pantallazo", "imagen"))
    return {
        "imagen": f"Sube {n}." if ya_es_imagen else f"Sube una foto de {n}.",
        "captura": f"Sube {n}." if ya_es_imagen else f"Sube la captura de {n}.",
        "numero": f"Escribe el número: {n}.",
        "texto": f"Escribe {n}.",
        "url": f"Pega el enlace: {n}.",
        "enlace": f"Pega el enlace: {n}.",
        "archivo": f"Sube el archivo: {n}.",
        "audio": f"Sube el audio: {n}.",
        "video": f"Sube el video: {n}.",
        "evento": f"Se marca solo: {n}.",
        "cobro": f"Sube el comprobante: {n}.",
    }.get(tipo, f"Sube {n}.")


def ev(tipo, nombre, valida, mercado=False, pide=None):
    """mercado=True: la evidencia depende de que otro pague. No traba el camino."""
    return {"tipo": tipo, "nombre": nombre, "valida": valida, "del_mercado": mercado,
            "pide": pide or pedido(tipo, nombre)}

add(0,"entrega_tecnica","Entrega técnica y llamada de bienvenida",minutos=20,
    evidencias=[ev("evento","Primer ingreso","alta en TCD y MCD registrada")],
    nota="Lo ejecuta el equipo. Subcuenta, número nuevo de WhatsApp, permisos solo de pagos y calendario.")

add(1,"sesion","Dónde y cuándo vas a construir esto",sistema=1,minutos=60,
    lleva="Tu lugar y tu hora fija, tu pacto publicado, y tus diez números de hoy.",
    veredicto="Guardamos tus diez números. El día 87 vuelves a contestar las mismas preguntas y ves el cambio con tus propios datos.",
    piezas=["P0.0","P0.3"],tutoriales=["L-01"],manual="LID-1",
    pasos=["Contesta las diez preguntas con número: tu descanso, tu energía, cuánto te pesa cobrar, qué tan claro tienes a quién sirves",
           "Elige el lugar: una mesa, una silla y una puerta que se cierre",
           "Elige la hora y ponla en tu calendario real, todos los días. Ejemplo: 7 a 9",
           "Saca la foto del lugar con tu cuaderno sobre la mesa",
           "Firma tu pacto y publícalo donde lo vean"],
    evidencias=[ev("numero","Tus diez números de entrada","las diez respuestas, 1 a 10",
                   pide="Contesta las diez preguntas. Quedan guardadas hasta el día 87."),
                ev("imagen","Foto del búnker","mesa, cuaderno visible, sin pantalla encendida",
                   pide="Sube la foto de tu lugar, con el cuaderno sobre la mesa."),
                ev("imagen","Pacto publicado","se lee nombre y fecha",
                   pide="Sube la captura de tu pacto publicado, donde se lea tu nombre y la fecha.")],
    adn=["identidad","historia.por_que_empezo","reset.medicion_entrada"],cinturon="10gup")

add(2,"sesion","Toda tu clínica en un solo lugar",sistema=4,minutos=90,piezas=["P0.4","P1.2"],tutoriales=["L-02"],
    lleva="Tus consultantes, tu agenda y tus números de tres meses, adentro.",
    veredicto="Con esto la app ya puede calcular mañana lo que ganas por hora. Sin esto, no hay número.",
    pasos=["Abre Mi Clínica desde la pestaña Clínica",
           "Carga a cada consultante activo con su nombre y cuánto paga",
           "Carga tu agenda de esta semana, tal como está",
           "Carga los ingresos de los últimos tres meses y tus gastos fijos",
           "Hoy no ordenas nada: hoy solo entra información"],
    evidencias=[ev("imagen","Panel con consultantes","al menos 5 filas con nombre y monto",
                   pide="Sube la captura de tu panel con tus consultantes cargados."),
                ev("numero","Consultantes activos","entero > 0",
                   pide="Escribe cuántos consultantes activos tienes hoy."),
                ev("numero","Ingreso promedio 3 meses","> 0",
                   pide="Escribe tu ingreso promedio de los últimos tres meses.")],
    adn=["numeros.ingreso_mensual_actual","numeros.precio_viejo"])

add(3,"sesion","Cuánto ganas de verdad por cada hora",sistema=1,minutos=45,
    lleva="Tu ganancia real por hora. Con ese número decides tu precio.",
    veredicto="Ese es tu número. Todo lo que decidas de acá en adelante se mide contra él.",
    piezas=["P1.0","P1.2b"],agente="espejo",manual="LID-2",
    pasos=["Revisa los ingresos y gastos que cargaste ayer. Ya están acá",
           "Suma las horas que trabajaste esta semana: sesiones, mensajes, papeles y traslados. Ejemplo: 18 de consulta + 6 de todo lo demás",
           "Toca Calcular. La app divide lo que te queda por tus horas",
           "Mira el número diez segundos y anota dónde lo sientes: pecho, garganta, estómago o ninguna parte",
           "Escríbelo a mano en tu cuaderno y tápalo con una hoja. Lo destapamos el día 87"],
    evidencias=[ev("numero","Hora real neta","0 < x < 500, coherente ±20% con día 2",
                   pide="Escribe el número que te dio la app: tu ganancia por hora."),
                ev("numero","Horas reales de la semana","> 0",
                   pide="Escribe las horas que sumaste, contando todo."),
                ev("texto","Dónde lo sentiste","una palabra",
                   pide="Escribe en una palabra dónde lo sentiste.")],
    adn=["numeros.hora_real_neta"],cinturon="9gup")

add(4,"sesion","Para qué te sirve cobrar poco",sistema=1,minutos=45,piezas=["P1.1","P1.3"],agente="espejo",
    lleva="Las tres frases sobre el dinero que traes de tu casa, escritas.",
    veredicto="Eso no lo pensaste: lo heredaste. Ahora que está escrito, puedes discutirlo.",
    pasos=["Escribe qué se decía del dinero en tu casa cuando eras chico. Tres frases, textuales",
           "Al lado de cada una, qué te hace hacer hoy. Ejemplo: por eso no mando el presupuesto",
           "Elige la que más te apriete y léela en voz alta"],
    evidencias=[ev("texto","Las tres frases","tres frases en primera persona",
                   pide="Escribe las tres frases y qué te hace hacer cada una.")],
    adn=["mindset.creencias_dinero"])

add(5,"sesion","El dinero en el cuerpo",sistema=1,minutos=60,piezas=["P1.4"],agente="espejo",
    lleva="Dónde se te aprieta el cuerpo cuando dices tu precio, por escrito.",
    veredicto="Tu cuerpo avisa antes que tu cabeza. Sabiendo dónde avisa, lo puedes atravesar.",
    pasos=["Escucha el audio completo, con los ojos cerrados y sin hacer nada más",
           "Di tu precio nuevo en voz alta y quédate quieto cinco segundos",
           "Escribe en tu cuaderno dónde lo sentiste y qué pensaste justo antes"],
    evidencias=[ev("imagen","La página del cuaderno","escrito a mano, se lee",
                   pide="Sube la foto de la página de tu cuaderno.")],
    adn=["mindset.cuerpo"])

add(6,"protocolo","Qué haces cuando algo te incomoda",sistema=1,minutos=30,agente="espejo",
    lleva="Tus tres disparadores, con lo que haces hoy cuando aparecen.",
    veredicto="Eso que haces no es falta de voluntad: es tu forma de bajar la incomodidad rápido. Mañana le pones un reemplazo tuyo.",
    pasos=["Escribe las tres situaciones que más te incomodan en tu trabajo. Ejemplo: mandar un presupuesto, que te pidan rebaja, grabarte",
           "Al lado de cada una, qué haces cuando aparece. Sin adornos: postergar, comer, fumar, scrollear, contestar a las corridas",
           "Marca cuál de las tres te cuesta más plata al mes"],
    evidencias=[ev("texto","Tus tres disparadores","tres pares situación-conducta",
                   pide="Escribe las tres situaciones y qué haces hoy con cada una.")],
    adn=["reset.disparadores"])

add(7,"protocolo","Tu reset, escrito por ti",sistema=1,minutos=45,piezas=["P1.6"],agente="espejo",
    lleva="Tu protocolo: si pasa esto, hago esto otro. Con tu gesto para arrancarlo.",
    veredicto="Ese es tu reset y es tuyo: nadie te va a decir qué comer ni a qué hora levantarte. Lo pruebas esta semana y lo corriges el día 20.",
    pasos=["Para cada disparador de ayer, elige un reemplazo que ya te guste. Ejemplo: en vez del postre, salgo a caminar veinte minutos",
           "Que el reemplazo se pueda hacer en menos de cinco minutos y no dependa de nadie",
           "Elige un gesto físico chico que lo arranque. Ejemplo: apoyar las dos manos en la mesa y respirar hondo una vez",
           "Escribe tu protocolo en tres líneas: si pasa X, hago Y, y empiezo con este gesto",
           "Pégalo donde trabajas y pruébalo esta semana"],
    evidencias=[ev("imagen","Tu protocolo pegado","tres reemplazos escritos, con su gesto",
                   pide="Sube la foto de tu protocolo pegado donde trabajas."),
                ev("texto","Tus tres reemplazos","tres pares disparador-reemplazo",
                   pide="Escribe tus tres reemplazos, uno por disparador.")],
    adn=["reset.protocolo"])

add(8,"sesion","Tu precio nuevo, decidido y cobrable",sistema=1,minutos=60,
    lleva="Tu precio digno sellado y tu link de pago andando.",
    veredicto="Tu precio está sellado y probado. Desde hoy, ese es el número que dices en voz alta.",
    piezas=["P3.8","P1.5"],agente="vera",manual="LID-3",
    pasos=["Mira lado a lado tu hora real neta y tu precio viejo",
           "Escribe un precio nuevo y mira qué hora real neta te daría con las mismas horas",
           "Dilo en voz alta tres veces, de pie, y cuenta cinco segundos en silencio",
           "Sella el precio. Para moverlo vas a tener que hablarlo con El Espejo",
           "Crea tu link de pago en el Sistema y cóbrate un peso a ti mismo para probarlo"],
    evidencias=[ev("numero","Precio digno","> precio_viejo, hora real neta objetivo alcanzable",
                   pide="Escribe tu precio nuevo."),
                ev("url","Link de pago","enlace que abre el cobro",
                   pide="Pega el enlace de pago que creaste."),
                ev("evento","Cobro de prueba","registrado en el Sistema",
                   pide="Se marca solo cuando entre tu cobro de prueba.")],
    adn=["numeros.precio_digno","sistema.link_pago"],activa=["F-PRECIO"])

add(9,"sesion","Tu cartera, ordenada en tres grupos",sistema=1,minutos=45,
    lleva="Cada persona que atiendes, en su grupo, con su monto.",
    veredicto="Así queda tu mes si se cumple. Ordenar no es abandonar: es decidir con cuidado.",
    piezas=["P3.7"],
    pasos=["Arrastra a cada consultante al grupo que le toca: sube de precio, termina su proceso o se deriva",
           "Escribe al lado de cada uno cuánto paga hoy",
           "A quien se deriva, escríbele el nombre de quien lo puede atender mejor",
           "Mira el total de cada grupo. Ese es tu mes cuando esto se cumpla",
           "Hoy solo los ordenas. Las conversaciones vienen mañana, con tu precio ya sellado"],
    evidencias=[ev("imagen","Las tres listas","cada consultante activo en un grupo, con monto",
                   pide="Sube la captura de tus tres grupos, con el monto de cada persona.")],
    adn=["cartera.grupos"])

add(10,"sesion","Las conversaciones de subida",sistema=1,minutos=45,
    lleva="Los mensajes del grupo uno, enviados el mismo día.",
    veredicto="Ya está dicho. Lo que sigue es su respuesta, no tu duda.",
    pasos=["Abre la plantilla del grupo uno y escríbela con tu voz",
           "Escribe desde cuándo rige el precio nuevo. Ejemplo: desde el 1 del mes que viene",
           "Mándala el mismo día a todos los del grupo, uno por uno",
           "Marca en la app quién la recibió"],
    evidencias=[ev("imagen","Tres mensajes enviados","capturas con fecha visible",
                   pide="Sube tres capturas de los mensajes enviados, con la fecha a la vista.")],
    adn=["cartera.avisados"])

add(11,"sesion","Los cierres y las derivaciones",sistema=1,minutos=45,
    lleva="Cada proceso que termina, con su fecha de alta.",
    veredicto="Nadie queda a medias. Eso también es parte de tu trabajo.",
    pasos=["A quien termina, escríbele cuándo cierra su proceso y qué se lleva",
           "A quien se deriva, pásale un nombre concreto y preséntalos",
           "Carga las fechas de cierre en tu agenda"],
    evidencias=[ev("imagen","Agenda con fechas de cierre","al menos una fecha por persona del grupo",
                   pide="Sube la captura de tu agenda con las fechas de cierre cargadas.")],
    adn=["cartera.cierres"])

add(12,"sesion","Tu primer cobro al precio nuevo",sistema=1,minutos=30,
    lleva="Un cobro entrado a tu precio digno, con su comprobante.",
    veredicto="Cobraste tu precio antes de gastar un peso en publicidad. Ese es el orden correcto.",
    piezas=["P3.9"],
    pasos=["Manda el link a quien ya dijo que sí",
           "Cuando entre el cobro, sube el comprobante",
           "Escribe al lado quién viene después, con nombre y fecha. Eso evita que lo bajes"],
    evidencias=[ev("imagen","Cobro al precio nuevo","monto >= precio digno, comprobante visible",
                   pide="Sube el comprobante del cobro, donde se lea el monto."),
                ev("texto","Quién viene después","nombre y fecha",
                   pide="Escribe quién viene después, con nombre y fecha.")],
    adn=["numeros.primer_cobro_precio_nuevo"],cinturon="8gup")

add(13,"sesion","A quién le vas a escribir",sistema=1,minutos=60,piezas=["P7.2"],
    lleva="Sesenta nombres con su canal, ordenados por quién te contesta.",
    veredicto="Esa es tu primera fuente de consultantes, y es gratis. Los diez de arriba son los de mañana.",
    pasos=["Tu red no es tu cartera: colegas, egresados y contactos del rubro",
           "Escribe sesenta nombres con apellido y por dónde le escribes a cada uno. Ejemplo: Ana Pérez · Instagram",
           "Ordénalos por quién te contesta más fácil",
           "Marca los diez primeros: esos son los de mañana"],
    evidencias=[ev("texto","Los sesenta nombres","sesenta filas con nombre y canal",
                   pide="Escribe tu lista, con el canal de cada uno."),
                ev("numero","Tamaño de la red",">= 20",
                   pide="Escribe cuántos nombres juntaste.")],
    adn=["trafico.red_propia"],
    nota="Sale del campo red_propia del formulario. Si declaró menos de veinte, el equipo lo ve en el Admin.")

add(14,"sesion","Los primeros veinte mensajes",sistema=1,minutos=60,agente="sofi",
    lleva="Veinte mensajes escritos con tu voz, enviados hoy.",
    veredicto="Veinte mensajes por día son la diferencia entre esperar y buscar. Sofi te ayuda con lo que conteste cada uno.",
    pasos=["Edita la plantilla con tu voz: no vende, pide veinte minutos",
           "Manda veinte hoy, empezando por los más fáciles",
           "Marca en la app a quién le escribiste"],
    evidencias=[ev("imagen","Veinte mensajes enviados","capturas legibles",
                   pide="Sube las capturas de los mensajes enviados."),
                ev("numero","Mensajes enviados",">= 20",
                   pide="Escribe cuántos mandaste hoy.")],
    adn=["trafico.mensajes_enviados"],
    nota="Desde hoy son dos por día, sostenidos. Deja de ser tarea y pasa a ser estado.")

add(15,"sesion","Tu método, escrito con sus etapas",sistema=2,minutos=60,piezas=["P2.1"],agente="diego",manual="CLI-1",
    lleva="Tu forma de trabajar, con etapas en orden y un nombre.",
    veredicto="Eso que ya hacías ahora se puede explicar, vender y repetir sin ti adelante.",
    pasos=["Escribe las etapas de lo que ya haces, en orden. Ejemplo: entrevista, medición, devolución",
           "Define con qué entra la persona y con qué sale",
           "Define cómo se mide: qué número miras al empezar y al terminar",
           "Arma las siglas con una letra por etapa y ponle nombre"],
    evidencias=[ev("texto","Método con nombre, siglas y etapas","Diego devuelve lo que falta",
                   pide="Escribe tu método: nombre, etapas en orden y cómo se mide.")],
    adn=["metodo"])

add(16,"sesion","Tu método, aprobado",sistema=2,minutos=45,piezas=["P2.4b","P2.5"],agente="diego",manual="CLI-1B",
    lleva="Tu método pasado por los tres exámenes de Diego.",
    veredicto="Aprobado. Lo que aprobó Diego es lo que vas a poder cobrar sin justificarte.",
    pasos=["Presenta tu método a Diego",
           "Examen 1: ¿se puede medir? Si no hay número al principio y al final, no es método",
           "Examen 2: el qué y el cómo, separados",
           "Examen 3: ¿importa el orden de las etapas?",
           "Corrige lo que te devuelva y vuelve a presentarlo. Puedes reprobar las veces que haga falta"],
    evidencias=[ev("texto","Método aprobado","veredicto aprobado en los tres exámenes",
                   pide="Se marca solo cuando Diego apruebe tu método.")],
    adn=["metodo.aprobado_por_critico"],cinturon="7gup")

add(17,"sesion","Tu oferta en una página",sistema=2,minutos=60,piezas=["P3.1","P3.3"],agente="vera",manual="CLI-2",
    lleva="Tu oferta completa: promesa, plazo, entregables y precio.",
    veredicto="Con esto ya se puede vender. Si algo acá te incomoda, es lo que te va a temblar en la llamada.",
    pasos=["Promesa: un resultado, no una actividad. Ejemplo: duermes seis horas seguidas, no diez sesiones",
           "Plazo, con fecha de cierre",
           "Entregables: lo que la persona recibe, no lo que tú haces",
           "Precio con número, nunca menor al que sellaste el día 8",
           "Para cada palanca, una acción tuya: más resultado, más certeza, menos tiempo, menos esfuerzo"],
    evidencias=[ev("texto","La oferta en una página","precio >= precio_digno",
                   pide="Escribe tu oferta completa, en una página.")],
    adn=["oferta"])

add(18,"sesion","Tu garantía, en una frase",sistema=2,minutos=45,piezas=["P3.2b"],manual="CLI-2B",agente="espejo",
    lleva="Tu garantía en positivo y los tres compromisos que firma tu consultante.",
    veredicto="Una garantía que puedes cumplir sube el precio más que cualquier descuento.",
    pasos=["Escribe tu garantía en una frase, diciendo lo que la persona sí consigue",
           "Escribe los tres compromisos que firma al lado, cada uno con verbo y número",
           "Escribe qué pasa si no los cumplió"],
    evidencias=[ev("texto","Garantía y compromisos","no promete resultado; compromisos con verbo y número",
                   pide="Escribe tu garantía y los tres compromisos.")],
    adn=["garantia"],nota="El Espejo devuelve textual lo del día 4.")

add(19,"sesion","Tus cinco niveles y la fecha del rodaje",sistema=2,minutos=45,piezas=["P3.3b","P3.4"],manual="CLI-3",
    lleva="Tu escalera de cinco niveles, con el tercero marcado, y tu rodaje agendado.",
    veredicto="Vendes uno solo: el tercero. Los otros existen para que ese se entienda.",
    pasos=["Diseña los cinco niveles, de la puerta de entrada al acompañamiento más completo",
           "Marca el tercero: es el único que vendes hoy",
           "Elige la fecha y la hora de tu rodaje del día 27 y bloquéala en tu calendario"],
    evidencias=[ev("texto","Los cinco niveles","el tercero marcado",
                   pide="Escribe tus cinco niveles y marca el tercero."),
                ev("evento","Rodaje agendado","fecha y hora bloqueadas",
                   pide="Se marca solo cuando bloquees la fecha del rodaje.")],
    adn=["oferta.escalera"],cinturon="6gup",activa=["F-RODAJE"])

add(20,"protocolo","Cobrar libera al otro",sistema=1,minutos=20,agente="espejo",
    lleva="Dos columnas: qué recibe tu consultante y qué se libera al pagar.",
    veredicto="Cuando ves lo que el otro gana al pagar, el precio deja de ser un pedido.",
    pasos=["Escribe qué recibe tu consultante a cambio del dinero",
           "Escribe qué se libera él al pagar. Ejemplo: deja de deberse a sí mismo empezar"],
    evidencias=[ev("texto","Dos columnas","ambas completas",
                   pide="Escribe las dos columnas.")],adn=["cuaderno"],
    nota="Examen: día 27, cuando diga el precio en cámara.")

add(21,"protocolo","Decir tu número sin que te tiemble",sistema=1,minutos=20,agente="espejo",
    lleva="Tu número dicho veinte veces, grabado, con un gesto que lo ancla.",
    veredicto="Escucha la primera y la última: ahí se oye si el precio ya es tuyo.",
    pasos=["Elige un gesto físico chico y repetible. Ejemplo: apoyar la mano en la mesa",
           "Grábate diciendo tu número veinte veces, con el gesto antes de cada una",
           "Escucha la primera y la veinte, una después de la otra"],
    evidencias=[ev("archivo","Audio del ancla","compara tono y velocidad de la primera y la última",
                   pide="Sube el audio de las veinte repeticiones.")],
    adn=["cuaderno"],nota="Si todavía sube el tono, devuelve 'repite mañana' y no aprueba.")

add(22,"sesion","Tu embudo, en dos piezas",sistema=3,minutos=60,piezas=["P4.1a","P4.1"],agente="mateo",
    manual="CAM-1",acceso="Entrega 2 del Sistema — sitios, formularios y contactos",
    lleva="Tu embudo dibujado: el recurso que atrae y el video que vende.",
    veredicto="Dos piezas, no diez. El frío va al recurso; el que ya te vio, al video de venta. Ese es todo tu embudo.",
    pasos=["Dibuja las dos ramas: público frío → tu recurso gratuito · quienes ya te vieron → tu video de venta",
           "Elige tu recurso: masterclass grabada de 15 minutos, una guía de una página, o un diagnóstico de cinco preguntas",
           "Mi recomendación es la masterclass: califica mejor y de ahí salen los clips de todo lo demás",
           "Marca en verde lo que ya tienes y en rojo la primera pieza que falta",
           "Escribe al lado de cada caja quién la hace: tú, tu equipo o la app"],
    evidencias=[ev("imagen","Tu embudo dibujado","dos ramas: recurso y video de venta",
                   pide="Sube la foto de tu embudo, con las dos ramas."),
                ev("texto","Tu recurso elegido","masterclass, guía o diagnóstico",
                   pide="Escribe cuál de los tres recursos eliges.")],
    adn=["trafico.recurso"])

add(23,"sesion","A quién le van a hablar tus anuncios",sistema=3,minutos=30,piezas=["P4.1c"],
    lleva="Tu audiencia contada y tu camino elegido por la app.",
    veredicto="Con ese número, la app decide a quién mostrarle tus anuncios el día 31. Nada más cambia.",
    pasos=["Cuenta tus seguidores activos",
           "Suma los consultantes que ya pasaron por tu consulta",
           "Suma tu lista de correo",
           "Escribe el total. La app te dice si tu camino es frío o tibio"],
    evidencias=[ev("numero","Audiencia contada",">= 0",
                   pide="Escribe el total de tu audiencia.")],
    adn=["trafico.audiencia_contada","trafico.rama"],
    nota="Menos de 500 → frío. 500 o más → tibio. Cambia solo los días 31 y 32.")

add(24,"sesion","Tu perfil, cuatro cosas y listo",sistema=3,minutos=30,piezas=["P4.2b"],agente="caro",
    lleva="Tu perfil con foto, nombre, frase y enlace.",
    veredicto="Con esas cuatro alcanza. El resto de tu perfil se trabaja el día 61, con su porqué.",
    pasos=["Foto: tu cara, fondo limpio, que se entienda en miniatura",
           "Nombre buscable: cómo te buscarían, no tu título completo",
           "Frase: tu promesa, no tu profesión. Ejemplo: ayudo a X a lograr Y",
           "Enlace a tu página",
           "Cierra y no toques nada más hoy"],
    evidencias=[ev("imagen","Captura del perfil","los cuatro elementos presentes",
                   pide="Sube la captura de tu perfil con las cuatro cosas.")])

add(25,"sesion","Tu página, publicada y viva",sistema=3,minutos=90,piezas=["P4.2d"],
    tutoriales=["L-05","L-06"],agente="mateo",larga=True,
    lleva="El enlace de tu página, funcionando en el teléfono.",
    veredicto="Ya tienes a dónde mandar a alguien. Ese enlace es el que va a llevar tus anuncios.",
    pasos=["Revisa que tengas promesa, los cinco bloques, garantía y precio",
           "Mateo arma el pedido inicial con tu ADN: léelo entero antes de mandarlo",
           "Pide los tres cambios de siempre: que se vea bien en el celular, letra grande y aviso legal",
           "Publícala en tu subdominio",
           "Ábrela en tu teléfono y agéndate: si algo no se entiende, se corrige hoy"],
    evidencias=[ev("url","El enlace vivo","200, contiene la promesa, botón de agenda, carga en móvil",
                   pide="Pega el enlace de tu página publicada.")],
    adn=["sistema.url_pagina"],cinturon="5gup",activa=["F-PAGINA"])

add(26,"sesion","Todo listo para grabar mañana",sistema=3,minutos=60,piezas=["P4.3e","P4.3"],agente="caro",larga=True,
    lleva="Tu guion y tus tres anuncios escritos, y el lugar de grabación aprobado.",
    veredicto="Mañana grabas sin decidir nada. Lo único que queda es hablar.",
    pasos=["Mateo arma el guion del video de tu página con tu ADN",
           "Mateo arma los tres anuncios según tu camino",
           "Sube fotos del lugar donde vas a grabar: Caro te corrige luz, fondo y altura",
           "Lee el guion en voz alta tres veces. No lo memorices",
           "Deja la ropa, el teléfono cargado y el lugar armado desde hoy"],
    evidencias=[ev("texto","Guion y tres anuncios","completos",
                   pide="Sube tu guion y los tres anuncios escritos."),
                ev("imagen","Set armado","aprobado por Caro",
                   pide="Sube la foto del lugar armado.")],
    levanta=["F-PAGINA"])

add(27,"rodaje","Tu día de rodaje",sistema=3,minutos=240,larga=True,
    lleva="Cinco piezas grabadas en un solo día.",
    veredicto="Un día de grabación, un mes de contenido. Así se hace siempre.",
    pasos=["Graba primero los tres anuncios, uno detrás del otro",
           "Después el video de tu página, de corrido y sin leer. Tres tomas y sigues",
           "Al final, el de preparación para la llamada",
           "No revises nada hasta terminar el día: mirar en el medio es la forma más eficiente de no grabar el resto",
           "Sube los cinco archivos"],
    evidencias=[ev("archivo","Cinco archivos","duración mínima por pieza, audio presente",
                   pide="Sube los cinco archivos que grabaste.")],
    levanta=["F-RODAJE"],
    nota="Misma ropa · plano de pecho · luz de ventana · teléfono en modo avión · número y palmada · tres tomas.")

add(28,"sesion","Que cualquiera pueda agendarse solo",sistema=3,minutos=60,piezas=["P4.2e-i"],
    tutoriales=["L-07","L-08","L-09","L-10"],agente="lucas",
    lleva="Tu circuito probado de punta a punta: formulario, agenda y confirmación.",
    veredicto="Te agendaste a ti mismo y funcionó. Desde ahora alguien puede llegar sin que tú hagas nada.",
    pasos=["Sube el video a tu página",
           "Arma el formulario con las cinco preguntas que filtran",
           "Arma el calendario en dos pasos y conéctalo a tu correo",
           "Arma la página de preparación que ve después de agendar",
           "Agéndate a ti mismo desde el teléfono, de punta a punta, como si fueras un desconocido"],
    evidencias=[ev("evento","Agenda de prueba","formulario + calendario + confirmación del mismo contacto",
                   pide="Se marca solo cuando entre tu propia agenda de prueba.")],
    adn=["sistema.url_vsl","sistema.url_formulario"],cinturon="4gup")

add(29,"sesion","Meta conectado y tu pixel midiendo",sistema=3,minutos=90,
    tutoriales=["L-11","L-12","L-13","L-14"],
    acceso="Entrega 3 del Sistema — conversaciones, automatizaciones, reportes y WhatsApp",
    lleva="Tu cuenta publicitaria, tu forma de pago y tu pixel disparando.",
    veredicto="Tu pixel ya le avisa a Meta quién sirve y quién no. Sin eso, la plataforma te trae a cualquiera.",
    pasos=["Conecta tu página y tu perfil profesional",
           "Crea tu cuenta publicitaria dentro de tu business",
           "Carga tu forma de pago",
           "Instala el pixel en tu página y pruébalo abriéndola desde el teléfono"],
    evidencias=[ev("evento","Pixel disparando","verificado desde la app",
                   pide="Se marca solo cuando la app vea tu pixel disparar.")],
    adn=["sistema.pixel_id","sistema.cuenta_ads","sistema.whatsapp"])

add(30,"sesion","Tus tres anuncios, listos para salir",sistema=3,minutos=60,
    lleva="Los tres anuncios editados y cargados, listos para encender.",
    veredicto="Tres anuncios distintos compitiendo entre sí. El que gane lo decide el número, no tu gusto.",
    pasos=["Edita corto: sin música, sin intro y sin logo animado",
           "Ponles subtítulos quemados: la mayoría los mira sin sonido",
           "Súbelos al banco de creativos y márcalos como listos"],
    evidencias=[ev("archivo","Tres anuncios","estado listo en el banco",
                   pide="Sube los tres anuncios editados.")])

add(31,"sesion","Encender tus dos campañas",sistema=3,minutos=90,piezas=["P4.4","P4.4b","P4.8"],tutoriales=["L-15","L-16"],
    lleva="Tus dos campañas corriendo: la que atrae y la que vende.",
    veredicto="Están encendidas. Ahora vienen catorce días sin tocar nada: al tercero vas a querer cambiar algo, y por eso a la mayoría no le funciona.",
    pasos=["Campaña 1, frío amplio: sin intereses, solo país, ciudad y edad. Va a tu recurso gratuito",
           "Campaña 2, retargeting: quienes vieron tu recurso, tus videos o tu perfil. Va directo a tu video de venta",
           "Reparte el presupuesto mitad y mitad",
           "Los tres anuncios adentro del mismo conjunto, para que compitan entre ellos",
           "Enciende y anota la fecha y la hora"],
    evidencias=[ev("evento","Campaña activa","detectada por la conexión con Meta",
                   pide="Se marca solo cuando la app vea tus campañas activas.")],
    cinturon="3gup",activa=["F-14DIAS","F-TABLERO"])

add(32,"campo","Campo",campo=["Contestá en menos de dos horas cualquier agenda que entre",
    "Terminá de cerrar la transición de cartera","No abras el administrador de anuncios"],
    lleva='Un día de consulta, sin tarea de app.', veredicto='El camino sigue mañana. Hoy tu trabajo es atender bien.')

add(33,"sesion","Leer tus cuatro números",sistema=3,minutos=45,piezas=["P4.7"],agente="ramiro",
    lleva="Tu tablero con cuatro números y tu cuello de esta semana marcado.",
    veredicto="Ramiro te dice cuál de los tres cuellos tienes. Se arregla uno a la vez, y recién el día 46.",
    pasos=["Arma la vista con cuatro columnas y nada más: gasto, entradas, agendas y costo por agenda",
           "Anota tu costo por agenda de hoy",
           "Lee los tres cuellos con Ramiro y marca cuál tienes",
           "Mirar sí, tocar no: faltan doce días"],
    evidencias=[ev("imagen","Tablero con cuatro columnas","gasto, entradas, agendas, costo por agenda",
                   pide="Sube la captura de tu tablero."),
                ev("numero","Costo por agenda","> 0",
                   pide="Escribe tu costo por agenda de hoy.")])

add(36,"sesion","La llamada dibujada",sistema=3,minutos=60,piezas=["P5.1"],agente="lucas",manual="LLA-1",
    pasos=["Dibujá tu W sobre la plantilla","Escribí tus preguntas de cada tramo",
           "Marcá el minuto del precio","Escribí qué hacés después del número: nada",
           "Practica una llamada completa con Lucas"],
    evidencias=[ev("texto","Tu W con tus preguntas","los siete tramos"),
                ev("evento","Sesión de sparring","completada")],
    adn=["voz.frases_propias"],
    lleva='Tu llamada dibujada entera, con tus preguntas escritas.', veredicto='Ya no improvisas. La próxima llamada la das con esto adelante.')

add(37,"sesion","Tu primera llamada real",sistema=3,minutos=60,piezas=["P5.4"],agente="lucas",
    pasos=["Elegí a quién de tu red le ofreciste y todavía no cerraste",
           "Repasá tu W una vez, no más","Hacé la llamada","Escribí qué objeción apareció"],
    evidencias=[ev("texto","La primera objeción real","textual, con las palabras de la persona")],
    adn=["voz.objeciones_reales"],
    nota="Esa objeción vale más que veinte sesiones de teoría. Alimenta el día 42.",
    lleva='La primera objeción real, dicha por alguien, no imaginada.', veredicto='Esa objeción vale más que un mes de pensar la oferta. Aparece después de ofrecer, nunca antes.')

add(38,"sesion","Antes de la llamada",sistema=3,minutos=45,piezas=["P5.2"],agente="sofi",
    pasos=["Escribí tu mensaje previo","Escribí tu criterio de cancelación",
           "Cargá las dos cosas como plantillas en el Sistema"],
    evidencias=[ev("texto","Mensaje previo y criterio","el criterio con dos condiciones objetivas")],
    lleva='Tu mensaje previo y el criterio con el que decides antes de entrar.', veredicto='Menos ausencias y llamadas que empiezan en tema. El que llega leído, llega decidido.')

add(39,"sesion","Grabar las llamadas",sistema=3,minutos=30,piezas=["P5.4-i"],tutoriales=["L-17"],
    pasos=["Activá la grabación en el Sistema","Escribí la frase con la que avisás"],
    evidencias=[ev("evento","Grabación activada","en el Sistema")],
    lleva='Tus llamadas grabadas desde hoy, con tu aviso escrito.', veredicto='Tu llamada mejora escuchándote. Desde hoy tienes con qué.')

add(42,"sesion","La autopsia",sistema=3,minutos=60,piezas=["P5.6"],agente="lucas",manual="LLA-4",
    pasos=["Subí o elegí una llamada real","Escuchala entera: la app no deja saltar",
           "Anotá los cuatro números","Compara con los que midió Lucas",
           "Elegí una sola cosa para cambiar"],
    evidencias=[ev("numero","Los cuatro números","minuto, preguntas, silencio, pidió decisión"),
                ev("texto","La cosa que cambia","una sola")],
    lleva='Tus cuatro números de la llamada, medidos, no recordados.', veredicto='Ahí está tu llamada real. Elige una sola cosa para cambiar en la próxima.')

add(43,"protocolo","A quién traicionarías ganando más",sistema=1,minutos=20,agente="espejo",
    pasos=["El Espejo te devuelve lo del día 6","Nombrá a la persona",
           "Escribí qué hizo por vos","Escribí el permiso en primera persona con su nombre",
           "Decilo en voz alta y grabalo"],
    evidencias=[ev("texto","El permiso escrito","contiene un nombre propio"),
                ev("archivo","El permiso dicho","audio")],
    adn=["historia.el_permiso"],
    lleva='Tu permiso escrito: a quién creías que traicionabas ganando más.', veredicto='Léelo antes de tu próxima llamada. El segundo consultante es donde la mayoría se negocia sola.')

add(44,"sesion","Tu recuperador",sistema=3,minutos=60,piezas=["P4.5"],tutoriales=["L-18","L-19"],
    agente="espejo",
    pasos=["Armá tu bandeja con los cuatro estados","A cada 'no ahora' ponele fecha de vuelta",
           "Armá las respuestas automáticas",
           "Protocolo: escribí la lista de lo que te deben y tachala"],
    evidencias=[ev("evento","Bandeja clasificada","al menos cinco conversaciones con estado y fecha"),
                ev("imagen","La lista tachada","tachado visible")],
    lleva='Tu bandeja clasificada y el recuperador andando.', veredicto='El que comentó y no avanzó vuelve solo. Deja de depender de tu memoria.')

add(45,"sesion","Tu primer consultante nuevo",sistema=3,minutos=30,piezas=["P6.3"],
    evidencias=[ev("evento","Cobro del sistema","contacto con origen campaña",mercado=True)],
    cinturon="2gup",
    nota="Si no llega, el camino no se frena. El grado queda en ventana.",
    lleva='El cobro de alguien que no te conocía, con su origen.', veredicto='La máquina camina: alguien pagó sin conocerte. Eso ya no depende de tu agenda.')

add(46,"sesion","Escalar o apagar",sistema=3,minutos=45,piezas=["P4.4c"],agente="ramiro",
    pasos=["Mirá tu costo por agenda de los catorce días",
           "La app habilita un solo botón según tu número","Escribí la decisión y el número que la justifica"],
    evidencias=[ev("texto","La decisión","con el costo por agenda al lado")],
    levanta=["F-14DIAS","F-TABLERO"],
    nota="Desde hoy se repite todos los lunes. Un escalón por semana, +20%, nunca duplicar.",
    lleva='Tu decisión escrita: qué sigue, qué se apaga y con cuánto.', veredicto='Decidiste con el número, no con la sensación. Así se sube el presupuesto sin miedo.')

add(47,"sesion","La cinta",sistema=4,minutos=45,piezas=["P6.1"],agente="bruno",manual="CLI-4",
    pasos=["Partí tu programa en dos columnas: grabado y en vivo",
           "Nombrá tus estaciones, en orden","Definí tu línea base",
           "Hacé la cuenta: horas para uno, horas para diez"],
    evidencias=[ev("texto","Dos columnas, estaciones y línea base","completas"),
                ev("numero","Horas por consultante al mes","> 0")],
    adn=["entrega.estaciones","entrega.que_va_grabado","entrega.que_va_en_vivo","entrega.linea_base"],
    lleva='Tus dos columnas, tus estaciones y tu línea base.', veredicto='Ya sabes qué se graba y qué va en vivo. Eso es lo que te deja atender diez sin quemarte.')

add(48,"sesion","El alta",sistema=4,minutos=45,piezas=["P6.2"],manual="CLI-5",
    pasos=["Escribí tu mensaje de bienvenida","Escribí tus tres límites",
           "Ordená tus siete pasos del alta","Conectá la línea base al triage"],
    evidencias=[ev("texto","Bienvenida, tres límites y siete pasos","completos")],
    adn=["entrega.alta_7_pasos","entrega.tres_limites"],
    lleva='Tu bienvenida, tus tres límites y tus siete pasos del alta.', veredicto='Un límite dicho el primer día es un acuerdo. El mismo límite en la semana seis es un reclamo.')

add(49,"campo","Campo",campo=["Aplicá el alta completa a quien haya entrado",
    "Llamadas de la semana con tu W","Lunes de números, si cae lunes"],
    lleva='Un día de consulta, con el alta aplicada a quien entró.', veredicto='Tu alta ya se usa con personas reales. Eso es la entrega funcionando.')

add(50,"sesion","Tu app, con tu marca",sistema=4,minutos=45,piezas=["P8.1"],
    lleva="Tu app publicada, con tu nombre, tu color y tu logo.",
    veredicto="Es tuya: el repositorio y la cuenta están a tu nombre. Puedes llevártela cuando quieras.",
    pasos=["Carga tu nombre, tu color y tu logo. Nada más por hoy",
           "La app se publica sola en tu dirección",
           "Ábrela desde tu teléfono y mírala como la va a ver tu consultante",
           "Guarda tus dos accesos: el del código y el de la publicación"],
    evidencias=[ev("imagen","Tu app con tu marca","logo y color visibles",
                   pide="Sube la captura de tu app con tu marca."),
                ev("url","La dirección de tu app","abre en el teléfono",
                   pide="Pega la dirección de tu app.")],
    adn=["app.url","app.marca"])

add(51,"sesion","Tus etapas",sistema=4,minutos=90,piezas=["P8.2"],agente="bruno",larga=True,
    pasos=["Apretá el botón que trae todo desde tu ADN","Revisá que haya llegado bien y corregí",
           "Armá cuatro semanas con lo que desbloquea cada una","Cargá cuatro, no doce"],
    evidencias=[ev("evento","Cuatro etapas cargadas","con contenido asignado")],
    lleva='Tus cuatro etapas cargadas, en orden.', veredicto='Tu método entró a tu app. Lo que enseñas ya no se repite: se abre.')

add(52,"rodaje","Jornada de rodaje B",sistema=4,minutos=180,piezas=["P8.4"],larga=True,
    pasos=["Elegí de tu columna 'va grabado' del día 47","Uno por etapa, de tres a siete minutos",
           "Una sola toma por video","Sin edición: se sube como salió"],
    evidencias=[ev("archivo","Cuatro videos","subidos y asignados a su etapa")],
    lleva='Tus cuatro videos de entrega grabados.', veredicto='Un día de rodaje, un mes tranquilo. Eso que grabaste hoy lo vas a usar con cada consultante.')

add(53,"sesion","Invitar al primero y tocar algo tú",sistema=4,minutos=60,piezas=["P8.5"],manual="CLI-6",
    lleva="Tu primer consultante adentro, y un cambio hecho por ti en la app.",
    veredicto="Ya entregas por tu app y ya sabes cambiarle algo. Eso es no depender de nadie.",
    pasos=["Cómprate a ti mismo con una tarjeta real y recorre lo que recorre tu consultante",
           "Invita a tu primer consultante y mándale la frase exacta",
           "Cambia un texto de tu app con Claude: pídeselo en una línea y publica",
           "Sácale captura a lo que cambiaste"],
    evidencias=[ev("imagen","Captura desde el celular de tu consultante","se ve tu marca y su etapa 1",
                   pide="Sube la captura de cómo la ve tu consultante."),
                ev("imagen","Tu primer cambio publicado","el texto nuevo, en vivo",
                   pide="Sube la captura del cambio que hiciste tú.")],
    adn=["app.primer_consultante"])

add(54,"campo","Campo",campo=["Acompañá a tu primer consultante en su etapa 1",
    "Llamadas de la semana","Tablero, dos minutos"],
    lleva='Un día de consulta, acompañando a tu primer consultante.', veredicto='Ese acompañamiento es tu producto. Mañana lo conviertes en máquina.')

add(55,"sesion","La máquina de 10",sistema=3,minutos=45,piezas=["P7.1a","P7.1"],manual="CAM-7",
    pasos=["La app trae tus números reales del tablero",
           "Escribí la cadena: conversaciones, agendas, llamadas, ventas",
           "Traducilo a lo que tiene que pasar cada semana","Marcá cuál de los tres cuellos tenés"],
    evidencias=[ev("texto","Tu cadena con tus números","los cuatro escalones")],
    cinturon="1gup",
    lleva='Tu cadena con tus números: conversaciones, agendas, llamadas y ventas.', veredicto='Ahí está tu cuello. Se arregla uno a la vez, y siempre el de más arriba.')

CICLO = ["Todos los días · dos mensajes nuevos a tu red",
         "Lunes · los números: costo por agenda y la decisión",
         "Martes · las llamadas, con tu W adelante",
         "Miércoles · el recuperador: los 'no ahora' con fecha vencida",
         "Jueves · la entrega: tus consultantes en tu app",
         "Viernes · la autopsia: una llamada, cuatro números"]

for d in range(56,91):
    if d in J: continue
    if d == 61:
        add(61,"sesion","Por qué la marca va última",sistema=5,minutos=45,piezas=["P9.1","P2.3"],
            agente="mateo",manual="CAM-9",
            pasos=["Sacá tus tres enfoques de la Matriz ABC",
                   "Para cada enfoque, escribí a quién filtra y a quién atrae"],
            evidencias=[ev("texto","Los tres enfoques","con su filtro")],
            adn=["avatar.matriz_abc"],
    lleva='Tus tres enfoques de marca, con a quién filtra cada uno.', veredicto='Sesenta días sin publicar fue a propósito. Ahora tienes qué vender y cómo venderlo: recién ahora el contenido rinde.')
    elif d == 67:
        add(67,"sesion","Las doce semanas escritas",sistema=5,minutos=90,piezas=["P9.4"],
            tutoriales=["L-20","L-21"],agente="mateo",larga=True,
            pasos=["Repartí tus tres enfoques en doce semanas",
                   "Para cada semana, el gancho y el ángulo",
                   "Marcá cuáles son de filtro y cuáles de autoridad","No grabes nada todavía"],
            evidencias=[ev("texto","Doce semanas con sus ganchos","doce filas")],
            activa=["F-ORGANICO"],
    lleva='Tus doce semanas escritas, con su gancho y su ángulo.', veredicto='Lo escribiste todo hoy. Se graba en un solo día y te deja un mes tranquilo.')
    elif d == 86:
        add(86,"protocolo","Agrandar el vaso",sistema=1,minutos=30,agente="espejo",
            pasos=["Escribí tu día completo con el ingreso siguiente, en detalle físico",
                   "En presente, no en condicional"],
            evidencias=[ev("texto","Tu día siguiente","en presente")],adn=["cuaderno"],
    lleva='Tu día siguiente escrito, con lo que sostiene el ritmo.', veredicto='Lo que aguanta no es la motivación: es el tamaño del vaso que construiste.')
    elif d == 87:
        add(87,"sesion","Tu foto de llegada",sistema=0,minutos=45,piezas=["P10.2"],
            pasos=["Contestá las mismas preguntas del día 3",
                   "Recalculá tu hora real neta con los datos de Mi Clínica",
                   "Recién ahí la app destapa el número del día 3"],
            evidencias=[ev("numero","Hora real neta final","> 0")],
            adn=["numeros.hora_real_neta_final"],
    lleva='Tus dos números lado a lado: el del día 3 y el de hoy.', veredicto='Ese es el cambio, medido. No te lo cuenta nadie: lo ves.')
    elif d == 88:
        add(88,"sesion","Qué sigue",sistema=0,minutos=45,piezas=["P10.3"],
            pasos=["La app arma el borrador de tu plan de 180",
                   "Editalo, aprobalo y descargalo","Te lo llevás lo tomes o no lo tomes"],
            evidencias=[ev("texto","Plan de 180 aprobado","doce semanas + tres meses")],
    lleva='Tu plan de 180 días, tuyo, lo uses con nosotros o solo.', veredicto='Tienes la máquina andando. Lo que sigue es que te conozcan más personas, y eso es otro trabajo.')
    elif d == 89:
        add(89,"sesion","La última recta",sistema=0,minutos=45,piezas=["P7.3"],
            pasos=["Mirá cuántas ventas tenés y cuántas te faltan",
                   "Escribí qué podés cerrar esta semana con lo que ya está en la bandeja"],
            evidencias=[ev("texto","Lo que se puede cerrar","con nombres")],
    lleva='Lo que se puede cerrar antes de que termine, con nombre y fecha.', veredicto='Los últimos días valen: hay ventas que solo se cierran cuando hay fecha.')
    elif d == 90:
        add(90,"cierre","El cierre",sistema=0,minutos=0,
            evidencias=[ev("evento","Diez consultantes","contados desde MCD, todos al precio digno",mercado=True)],
            cinturon="1dan",
            nota="Si no llegó, el camino no se cierra: el ciclo queda abierto sin fecha.",
    lleva='Tus diez consultantes y tu clínica funcionando.', veredicto='Terminaste los noventa días. Tienes número, precio, método, oferta, sistema de venta, entrega y plan de marca.')
    else:
        # Una semana, cinco movimientos, siempre los mismos. Antes eran treinta
        # pantallas distintas y vacías: el cliente no sabía qué hacer ni con qué
        # comparar. Ahora cada semana se cierra con sus cuatro números y se
        # compara con la anterior.
        # Una jornada por semana, no cinco iguales: el cliente abre la semana,
        # la cierra con sus números, y los otros días atiende.
        if (d - 56) % 7 != 0:
            continue
        semana = (d - 56) // 7 + 9
        add(d,"ciclo",f"Tu semana {semana}",minutos=45,campo=CICLO,
            pasos=["Publica la pieza que ya tenías escrita. Hoy sale, no se escribe",
                   "Contesta a todos los que escribieron, cada uno con una pregunta",
                   "Da las llamadas de la semana con tu W adelante",
                   "Atiende a tus consultantes activos: marca quién está en su semana 2 y quién en la 7",
                   "Carga tus cuatro números: conversaciones, agendas, llamadas y ventas"],
            evidencias=[ev("numero","Tus cuatro números de la semana",
                           "conversaciones, agendas, llamadas y ventas, con la semana anterior al lado",
                           pide="Carga tus cuatro números de esta semana.")],
            lleva="Una semana cerrada, con sus cuatro números.",
            veredicto="Ahí está tu cuello de esta semana. Se arregla uno a la vez, y siempre el de más arriba.")

# La espera de los catorce días es UNA pantalla, no cuatro iguales. Los otros
# días quedan libres para atender.
ESPERA = [34]
for d in ESPERA:
    if d in J: continue
    add(d,"espera","La espera de los catorce días",minutos=10,
        campo=["Mira los números una vez al día","No toques la campaña","Sigue con tus conversaciones"],
        pasos=["Mira tu tablero una vez. Anota el costo por agenda de hoy",
               "No toques nada de la campaña. Al tercer día vas a querer: por eso a la mayoría no le funciona",
               "Sigue escribiendo a tu red: dos mensajes nuevos"],
        evidencias=[ev("numero","Costo por agenda de hoy","un número por día de espera",
                       pide="Escribe el costo por agenda de hoy.")],
        lleva="Un día más de datos, sin tocar nada.",
        veredicto="Catorce días juntos valen más que catorce cambios sueltos. Falta menos.")

for d in range(0,91):
    if d not in J:
        add(d,"campo","Día de atender",campo=["Hoy atiendes. La app no te pide nada"],
            lleva="Un día de consulta, sin tarea de app.",
            veredicto="El camino sigue mañana. Hoy tu trabajo es atender bien.")

# ── LA HOJA DE RUTA ────────────────────────────────────────────────
# El orden de los 90 días vive en hoja_de_ruta.py. Acá se aplica: cada jornada
# viaja a su día nuevo con todo lo suyo, las que nacen de dos se suman, y los
# fines de semana quedan libres.
from hoja_de_ruta import REUBICADAS, NUEVAS, GRADOS

def _finde(d):
    """El día 1 es lunes, así que sábado y domingo caen en estos restos."""
    return d >= 1 and (d - 1) % 7 in (5, 6)

VIEJO = dict(J)
J = {}

for r in REUBICADAS:
    base = dict(VIEJO[r["origen"][0]])
    for otro in r["origen"][1:]:
        o = VIEJO[otro]
        for campo in ("piezas", "tutoriales", "adn_escribe", "acciones_campo",
                      "freno_activa", "freno_levanta"):
            base[campo] = base[campo] + [x for x in o[campo] if x not in base[campo]]
        tipos = {e["tipo"] for e in base["evidencias"]}
        base["evidencias"] = base["evidencias"] + [e for e in o["evidencias"]
                                                   if e["tipo"] not in tipos][:1]
        base["cinturon"] = base["cinturon"] or o["cinturon"]
        base["agente"] = base["agente"] or o["agente"]
        base["manual"] = base["manual"] or o["manual"]
    base.update(dia=r["dia"], titulo=r["titulo"], sistema=r["sistema"],
                minutos=r["minutos"], pasos=r["pasos"], checklist=r["pasos"],
                lleva=r["lleva"], veredicto=r["veredicto"])
    base["paso_esencial"] = len(r["pasos"]) or None
    if r.get("cinturon"): base["cinturon"] = r["cinturon"]
    J[r["dia"]] = base

for n in NUEVAS:
    add(n["dia"], n["tipo"], n["titulo"], sistema=n["sistema"], minutos=n["minutos"],
        agente=n.get("agente"), piezas=n.get("piezas", []), pasos=n["pasos"],
        lleva=n["lleva"], veredicto=n["veredicto"], adn=n.get("adn", []),
        cinturon=n.get("cinturon"),
        evidencias=[ev(t, nom, val, pide=pide) for t, nom, val, pide in n["evidencias"]])

# Los grados suben con los hitos: uno por hito, en orden de día.
for d, g in GRADOS.items():
    if d in J: J[d]["cinturon"] = g
for d in list(J):
    if J[d]["cinturon"] and d not in GRADOS: J[d]["cinturon"] = None

for d in range(0, 91):
    if d in J: continue
    if _finde(d):
        add(d, "campo", "Fin de semana",
            campo=["Hoy descansas. El lunes sigue tu camino"],
            lleva="Un fin de semana tuyo.",
            veredicto="El descanso también construye. El lunes retomas donde quedaste.")
    else:
        add(d, "campo", "Día de atender",
            campo=["Hoy atiendes. La app no te pide nada"],
            lleva="Un día de consulta, sin tarea de app.",
            veredicto="El camino sigue mañana. Hoy tu trabajo es atender bien.")

def _dia_grado(gid, porDefecto):
    for d, g in GRADOS.items():
        if g == gid: return d
    return porDefecto

def _forma_grado(gid, porDefecto):
    d = _dia_grado(gid, None)
    j = J.get(d) if d else None
    if j and j["evidencias"]: return j["evidencias"][0]["nombre"]
    return porDefecto

out = {
  "version":"2026.09","idioma":"es-neutro","dias":90,
  "promesa":{"consultantes":10,"jornada_horas":4,"dias_semana":5},
  "sistemas":[
    # Los cinco sistemas se llaman igual que en la landing: el cliente compra
    # una cosa y tiene que entrar exactamente a esa.
    {"n":1,"nombre":"Tu reset","dias":"1-5"},
    {"n":2,"nombre":"Tu programa de alto impacto","dias":"8-12"},
    {"n":3,"nombre":"Tu captación automática","dias":"15-33"},
    {"n":4,"nombre":"Tu propia app","dias":"36-44"},
    {"n":5,"nombre":"Tu ecosistema circular","dias":"85-86"}],
  "piezas":[{"codigo":c,"titulo":t,"dia":d,"sistema":s,"set":st,"minutos":m,"estado":e}
            for c,t,d,s,st,m,e in PIEZAS],
  "tutoriales":[{"codigo":c,"titulo":t,"dia":d,"minutos":m,"donde":w}
                for c,t,d,m,w in TUTORIALES],
  # El día es ESTIMACIÓN, nunca la razón del otorgamiento. Lo que otorga es
  # "se_gana_con": la evidencia. Ningún grado se da por fecha.
  # El día de cada grado y la evidencia que lo gana salen de su jornada: si el
  # Camino se reordena, el grado se mueve con su hito.
  "cinturones":[{"id":i,"nombre":n,"color":c,"punta":p,
                 "dia":_dia_grado(i,d),"dia_estimado":_dia_grado(i,d),
                 "significado":s,"forma":_forma_grado(i,f),
                 "se_gana_con":_forma_grado(i,f),"por_evidencia":True,
                 "en_ventana":v}
                for i,n,c,p,d,s,f,v in CINTURONES],
  # El día estimado del entrenador sale del Camino, no de una lista aparte:
  # cuando el orden cambia, el entrenador se mueve con su jornada.
  "agentes":[{"id":i,"nombre":n,"rol":r,
              "dia_estimado":min([j["dia"] for j in J.values() if j["agente"]==i] or [d]),
              "se_abre_con":k}
             for i,n,r,d,k in AGENTES],
  "frenos":[{"id":i,"regla":r,"apertura":a,"mensaje":m} for i,r,a,m in FRENOS],
  "jornadas":[J[d] for d in sorted(J)]
}

# Castellano neutro (tú): la app se usa en toda Latinoamérica y España.
from tuteo import tutear_todo
out = tutear_todo(out)

with open("datos/roadmap.seed.json","w",encoding="utf-8") as f:
    json.dump(out,f,ensure_ascii=False,indent=2)

tipos = collections.Counter(j["tipo"] for j in out["jornadas"])
print("jornadas:",len(out["jornadas"]))
for k,v in tipos.most_common(): print(f"  {k:16} {v}")
print("piezas:",len(out["piezas"]),"| tutoriales:",len(out["tutoriales"]),
      "| cinturones:",len(out["cinturones"]),"| agentes:",len(out["agentes"]),
      "| frenos:",len(out["frenos"]))
print("evidencias totales:",sum(len(j["evidencias"]) for j in out["jornadas"]))
print("minutos de trabajo del cliente:",sum(j["minutos"] for j in out["jornadas"]),
      "≈",round(sum(j["minutos"] for j in out["jornadas"])/60,1),"horas")
