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
 ("7gup","Amarillo punta verde","#E8C24A","#4E8C57",16,"Asoma el tallo","Método aprobado por el Crítico",False),
 ("6gup","Verde","#4E8C57",None,19,"La planta en pie","Oferta completa en una página",False),
 ("5gup","Verde punta azul","#4E8C57","#3A6EA5",25,"La planta busca el cielo","El enlace vivo de su página",False),
 ("4gup","Azul","#3A6EA5",None,28,"El cielo","Agendarse a sí mismo de punta a punta",False),
 ("3gup","Azul punta roja","#3A6EA5","#A6392E",31,"Se acerca el peligro","Campaña activa, con fecha y hora",False),
 ("2gup","Rojo","#A6392E",None,45,"El sol, y el aviso","Cobro de alguien que no lo conocía",True),
 ("1gup","Rojo punta negra","#A6392E","#1A1815",55,"Controla la fuerza","Captura desde el celular de su consultante",False),
 ("1dan","Negro","#1A1815",None,90,"Lo que ya no se altera","Los dos números lado a lado",True),
]

AGENTES = [
 ("espejo","El Espejo",3,"hora_real_neta_cargada"),
 ("critico","El Crítico",15,"metodo_escrito"),
 ("escriba","El Escriba",22,"oferta_sellada"),
 ("camara","La Cámara",24,"perfil_cerrado"),
 ("sparring","El Sparring",28,"agenda_de_prueba"),
 ("tablero","El Tablero",33,"campana_activa"),
 ("arquitecto","El Arquitecto",47,"primer_cobro_sistema"),
 ("estratega","El Estratega",61,"cinturon_2gup"),
]

FRENOS = [
 ("F-ORDEN","No se abre una sesión sin cerrar la anterior","evidencia_anterior_aprobada",
  "El orden es el método. Terminá la de ayer."),
 ("F-PAGINA","El día 26 no abre sin el enlace de la página","adn.sistema.url_pagina",
  "Sin página publicada, el guion del video no tiene dónde vivir."),
 ("F-RODAJE","La fecha de rodaje se elige el día 19","evento.rodaje_agendado",
  "Elegí el día. El rodaje que no tiene fecha no ocurre."),
 ("F-14DIAS","Escalar o apagar queda cerrado del 31 al 45","dia>=46",
  "Faltan {n} días. Tu campaña está aprendiendo."),
 ("F-TABLERO","El Tablero responde 'todavía no' del 31 al 45","dia>=46",None),
 ("F-COMPRA","No invita sin hacer la compra de prueba","evento.compra_de_prueba",
  "Comprate a vos mismo antes de invitar a nadie."),
 ("F-PRECIO","El precio del día 17 no puede ser menor al del día 9","oferta.precio>=numeros.precio_digno",
  "Tu oferta no puede valer menos que lo que ya cobrás."),
 ("F-ADN","Ningún agente arranca con campos requeridos vacíos","adn.campos_requeridos",
  "{agente} necesita {campo}. Volvé al día {dia}."),
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
         "acciones_campo": kw.get("campo", []), "nota": kw.get("nota"),
         # modo 15 minutos: el índice del paso que produce la evidencia.
         # Por defecto el último; se puede fijar con esencial=N (base 1).
         "paso_esencial": kw.get("esencial", len(kw.get("pasos", [])) or None)}
    J[dia] = j

def ev(tipo, nombre, valida):
    return {"tipo": tipo, "nombre": nombre, "valida": valida}

add(0,"entrega_tecnica","Entrega técnica y llamada de bienvenida",minutos=20,
    evidencias=[ev("evento","Primer ingreso","alta en TCD y MCD registrada")],
    nota="Lo ejecuta el equipo. Subcuenta, número nuevo de WhatsApp, permisos solo de pagos y calendario.")

add(1,"sesion","Entrar y abrir el búnker",sistema=1,minutos=50,
    piezas=["P0.0","P0.3"],tutoriales=["L-01"],manual="LID-1",
    pasos=["Elegí el lugar físico","Elegí la hora fija","Sacá la foto del lugar con el cuaderno",
           "Escribí a mano por qué empezaste","Firmá el pacto","Publicá el pacto"],
    evidencias=[ev("imagen","Foto del búnker","mesa, cuaderno visible, sin pantalla encendida"),
                ev("imagen","Pacto publicado","se lee nombre y fecha"),
                ev("texto","El por qué","mínimo 8 palabras, primera persona")],
    adn=["identidad","historia.por_que_empezo"],cinturon="10gup")

add(2,"sesion","Cargar tu clínica",sistema=4,minutos=90,piezas=["P0.4"],tutoriales=["L-02"],
    pasos=["Abrí MCD desde el tab Clínica","Cargá todos tus consultantes activos",
           "Cargá tu agenda de esta semana","Cargá los ingresos de los últimos tres meses",
           "Cargá tus gastos fijos","No ordenes nada: hoy solo entra información"],
    evidencias=[ev("imagen","Panel con consultantes","al menos 5 filas con nombre y monto"),
                ev("numero","Consultantes activos","entero > 0"),
                ev("numero","Ingreso promedio 3 meses","> 0")],
    adn=["numeros.ingreso_mensual_actual","numeros.precio_viejo"])

add(3,"sesion","Tu número",sistema=1,minutos=45,piezas=["P1.0"],agente="espejo",
    pasos=["La app trae los datos del día 2","Sumá tus horas reales de la semana",
           "La app calcula tu hora real neta","Quedate diez segundos con el número",
           "Escribí dónde lo sentiste","Escribilo a mano y tapalo"],
    evidencias=[ev("numero","Hora real neta","0 < x < 500, coherente ±20% con día 2"),
                ev("imagen","El número a mano","se lee un número manuscrito"),
                ev("texto","La palabra del cuerpo","una palabra")],
    adn=["numeros.hora_real_neta_inicial","cuaderno"],cinturon="9gup",
    nota="Acá y solo acá: 'esto es entrenamiento para dirigir un negocio, no es terapia'.")

add(4,"sesion","Para qué te sirve cobrar poco",sistema=1,minutos=45,piezas=["P1.1"],
    agente="espejo",manual="LID-2",
    pasos=["Completá tres veces: mientras cobre poco, no tengo que…",
           "Elegí la que más te incomodó y escribí dos líneas",
           "Escribí las tres frases sobre el dinero de tu casa antes de los doce"],
    evidencias=[ev("texto","Las tres frases","primera persona, sin generalidades")],
    adn=["cuaderno"],nota="Examen: día 18, la garantía.")

add(5,"sesion","El dinero en el cuerpo",sistema=1,minutos=60,piezas=["P1.4"],agente="espejo",
    pasos=["Auriculares, luz baja, ojos cerrados","No escribas mientras escuchás",
           "Al terminar, escribí lo que apareció sin corregirlo"],
    evidencias=[ev("imagen","La página del cuaderno","foto legible")],adn=["cuaderno"],
    nota="Reproductor sin barra de avance los primeros 40 minutos. Se pausa, no se adelanta.")

add(6,"protocolo","Los tres que te formaron",sistema=1,minutos=20,agente="espejo",
    pasos=["Nombrá tres personas que te enseñaron qué es trabajar bien",
           "Escribí la frase exacta que cada una decía sobre el dinero",
           "Marcá cuál de las tres todavía usás"],
    evidencias=[ev("texto","Tres nombres y tres frases","una marcada")],
    adn=["historia.los_tres_que_formaron"],nota="Examen: día 43, el permiso.")

add(7,"protocolo","El que te parece un vendehumo",sistema=1,minutos=20,agente="espejo",
    pasos=["Escribí tres profesionales que te parecen exagerados",
           "Al lado de cada uno, una cosa que hace y vos no",
           "Elegí una capacidad y practicala esta semana"],
    evidencias=[ev("texto","Tres nombres y una capacidad","capacidad en infinitivo")],
    adn=["cuaderno"],nota="Examen: día 10, los mensajes de subida de precio.")

add(8,"sesion","Los tres grupos",sistema=1,minutos=60,piezas=["P3.7"],
    pasos=["La app trae tu lista del día 2 en tres columnas vacías",
           "Arrastrá a cada persona a su columna","Ninguna persona queda sin columna",
           "Contá cuántos hay en cada una"],
    evidencias=[ev("texto","Las tres listas","suma igual a la cantidad del día 2")],
    adn=["transicion"],nota="Pantalla de arrastrar, no de escribir.")

add(9,"sesion","El precio nuevo y el link",sistema=1,minutos=75,piezas=["P3.8"],
    tutoriales=["L-03","L-04"],acceso="Entrega 1 del Sistema — pagos y calendario",
    pasos=["Mirá tu hora real neta y tu precio viejo","Escribí el precio nuevo",
           "La app te muestra qué hora real neta te daría","Confirmá: el número queda sellado",
           "Creá tu link de pago","Cobrate un peso para probarlo"],
    evidencias=[ev("numero","Precio digno","> precio_viejo"),
                ev("url","Link de pago","responde 200 y muestra el monto"),
                ev("evento","Cobro de prueba","registrado en el Sistema")],
    adn=["numeros.precio_digno","sistema.link_pago"],activa=["F-PRECIO"])

add(10,"sesion","Los que suben",sistema=1,minutos=45,
    pasos=["Abrí la plantilla del grupo uno y editala con tu voz",
           "Mandala a todos los del grupo, el mismo día","Marcá en la app quién recibió"],
    evidencias=[ev("imagen","Tres mensajes enviados","capturas legibles")])

add(11,"sesion","Los que terminan y los que se derivan",sistema=1,minutos=45,
    pasos=["Mensaje del grupo dos con fecha de cierre para cada persona",
           "Cargá esas fechas en la agenda de MCD",
           "Mensaje del grupo tres con nombre de colega, nunca una lista"],
    evidencias=[ev("imagen","Agenda con fechas de cierre","al menos una fecha cargada")])

add(12,"sesion","El primer cobro al precio nuevo",sistema=1,minutos=30,piezas=["P3.9"],
    pasos=["Cobrá","Escribí al lado del número quién viene después"],
    evidencias=[ev("evento","Cobro al precio nuevo","monto >= precio_digno")],
    cinturon="8gup",nota="No se sube captura: se detecta. Si el monto es menor, se registra sin otorgar el grado.")

add(13,"campo","Campo",campo=["Contestá a quienes respondieron los mensajes de la transición",
    "Cerrá los cobros que quedaron en camino","Leé La Clínica hasta CLI-1"])
add(14,"campo","Campo",campo=["Contestá a quienes respondieron los mensajes de la transición",
    "Cerrá los cobros que quedaron en camino","Leé La Clínica hasta CLI-1"])

add(15,"sesion","Tu método propio",sistema=2,minutos=60,piezas=["P2.1"],agente="critico",manual="CLI-1",
    pasos=["Escribí las etapas de lo que ya hacés, en orden","Definí punto inicial y punto final",
           "Definí cómo se mide","Armá las siglas: una letra por etapa"],
    evidencias=[ev("texto","Método con nombre, siglas y etapas","el Crítico devuelve faltantes")],
    adn=["metodo"])

add(16,"sesion","La prueba de tu método",sistema=2,minutos=45,piezas=["P2.4b"],agente="critico",manual="CLI-1B",
    pasos=["Examen 1: ¿se puede medir?","Examen 2: la regla del QUÉ y el CÓMO",
           "Examen 3: ¿importa el orden?","Corregí y volvé a presentar"],
    evidencias=[ev("texto","Método aprobado","veredicto aprobado en los tres exámenes")],
    adn=["metodo.aprobado_por_critico"],cinturon="7gup")

add(17,"sesion","Tu oferta",sistema=2,minutos=60,piezas=["P3.1"],manual="CLI-2",
    pasos=["Promesa: un resultado, no una actividad","Plazo escrito",
           "Entregables que la persona recibe","Precio con número",
           "La ecuación de valor aplicada: una acción por cada palanca"],
    evidencias=[ev("texto","La oferta en una página","precio >= precio_digno")],
    adn=["oferta"])

add(18,"sesion","Tu garantía",sistema=2,minutos=45,piezas=["P3.2b"],manual="CLI-2B",agente="espejo",
    pasos=["Escribí la garantía en una frase, en positivo",
           "Escribí los tres compromisos que firma al lado, medibles",
           "Escribí qué pasa si no los cumplió"],
    evidencias=[ev("texto","Garantía y compromisos","no promete resultado; compromisos con verbo y número")],
    adn=["garantia"],nota="El Espejo devuelve textual lo del día 4.")

add(19,"sesion","Tu escalera y la fecha del rodaje",sistema=2,minutos=45,piezas=["P3.3b"],manual="CLI-3",
    pasos=["Diseñá los cinco niveles","Marcá el tercero: es el único que vendés hoy",
           "Elegí la fecha y la hora de tu rodaje: es el día 27"],
    evidencias=[ev("texto","Los cinco niveles","el tercero marcado"),
                ev("evento","Rodaje agendado","fecha y hora bloqueadas")],
    adn=["oferta.escalera"],cinturon="6gup",activa=["F-RODAJE"])

add(20,"protocolo","Cobrar libera al otro",sistema=1,minutos=20,agente="espejo",
    pasos=["Escribí qué recibe tu consultante a cambio del dinero",
           "Escribí qué se libera él al pagar"],
    evidencias=[ev("texto","Dos columnas","ambas completas")],adn=["cuaderno"],
    nota="Examen: día 27, cuando diga el precio en cámara.")

add(21,"protocolo","El ancla del precio",sistema=1,minutos=20,agente="espejo",
    pasos=["Elegí un gesto físico chico y repetible",
           "Grabate diciendo tu número veinte veces, con el gesto antes de cada una",
           "Escuchá la uno y la veinte"],
    evidencias=[ev("archivo","Audio del ancla","compara tono y velocidad de la primera y la última")],
    adn=["cuaderno"],nota="Si todavía sube el tono, devuelve 'repetí mañana' y no aprueba.")

add(22,"sesion","El circuito",sistema=3,minutos=60,piezas=["P4.1a","P4.1"],agente="escriba",
    manual="CAM-1",acceso="Entrega 2 del Sistema — sitios, formularios y contactos",
    pasos=["Dibujá tu circuito con las cinco piezas","Marcá cuáles ya tenés",
           "Si trabajás con una agencia, hacele las tres preguntas"],
    evidencias=[ev("imagen","El circuito dibujado","cinco piezas unidas")])

add(23,"sesion","Frío o tibio",sistema=3,minutos=30,piezas=["P4.1c"],
    pasos=["Contá seguidores activos","Sumá contactos de consultantes pasados",
           "Sumá tu lista de correo","La app te muestra tu rama"],
    evidencias=[ev("numero","Audiencia contada",">= 0")],
    adn=["trafico.audiencia_contada","trafico.rama"],
    nota="Menos de 500 → frío. 500 o más → tibio. Cambia solo los días 31 y 32.")

add(24,"sesion","Tu perfil, cuatro cosas",sistema=3,minutos=30,piezas=["P4.2b"],agente="camara",
    pasos=["Foto: cara, fondo limpio, legible en miniatura","Nombre buscable",
           "Bio con tu promesa, no con tu título","Enlace a tu página","Cerrá"],
    evidencias=[ev("imagen","Captura del perfil","los cuatro elementos presentes")])

add(25,"sesion","Tu página, publicada",sistema=3,minutos=120,piezas=["P4.2d"],
    tutoriales=["L-05","L-06"],agente="escriba",larga=True,
    pasos=["Revisá que tengas promesa, cinco filas, garantía y precio",
           "El Escriba arma el pedido inicial: leelo entero antes de mandarlo",
           "Pedí los tres cambios: celular, letra grande, aviso legal",
           "Subí y publicá en tu subdominio"],
    evidencias=[ev("url","El enlace vivo","200, contiene la promesa, botón de agenda, carga en móvil")],
    adn=["sistema.url_pagina"],cinturon="5gup",activa=["F-PAGINA"])

add(26,"sesion","Preproducción",sistema=3,minutos=90,piezas=["P4.3e"],agente="camara",larga=True,
    pasos=["El Escriba arma el guion del VSL con tu ADN",
           "El Escriba arma los tres anuncios según tu rama",
           "Subí fotos del lugar: la Cámara corrige luz, fondo y altura",
           "Leé el guion en voz alta tres veces"],
    evidencias=[ev("texto","Guion del VSL y tres anuncios","completos"),
                ev("imagen","Set armado","aprobado por la Cámara")],
    levanta=["F-PAGINA"],nota="Único día con dos agentes.")

add(27,"rodaje","Jornada de rodaje A",sistema=3,minutos=240,larga=True,
    pasos=["Los tres anuncios primero","El VSL después, de corrido y sin leer, tres tomas",
           "El de preparación al final","No revises nada hasta terminar el día"],
    evidencias=[ev("archivo","Cinco archivos","duración mínima por pieza, audio presente")],
    levanta=["F-RODAJE"],
    nota="Misma ropa · plano de pecho · luz de ventana · teléfono en modo avión · número y palmada · tres tomas.")

add(28,"sesion","El filtro",sistema=3,minutos=90,piezas=["P4.2e-i"],
    tutoriales=["L-07","L-08","L-09","L-10"],agente="sparring",
    pasos=["Subí el VSL a tu página","Armá el formulario con las cinco preguntas",
           "Armá el calendario en dos pasos","Armá la página de preparación",
           "Agendate a vos mismo de punta a punta desde el teléfono"],
    evidencias=[ev("evento","Agenda de prueba","formulario + calendario + confirmación del mismo contacto")],
    adn=["sistema.url_vsl","sistema.url_formulario","sistema.url_agenda"],cinturon="4gup")

add(29,"sesion","Los cuatro de Meta",sistema=3,minutos=90,
    tutoriales=["L-11","L-12","L-13","L-14"],
    acceso="Entrega 3 del Sistema — conversaciones, automatizaciones, reportes y WhatsApp",
    evidencias=[ev("evento","Pixel disparando","verificado desde la app")],
    adn=["sistema.pixel_id","sistema.cuenta_ads","sistema.whatsapp"])

add(30,"sesion","Los tres anuncios listos",sistema=3,minutos=60,
    pasos=["Editá corto: sin música, sin intro, sin logo animado","Subtítulos quemados",
           "Subilos al banco de creativos y marcalos como listos"],
    evidencias=[ev("archivo","Tres anuncios","estado listo en el banco")])

add(31,"sesion","Encender",sistema=3,minutos=90,piezas=["P4.4","P4.4b"],tutoriales=["L-15","L-16"],
    pasos=["Un conjunto, uno solo","Presupuesto entero adentro","Los tres anuncios adentro",
           "El público de tu rama","Objetivo a la página, nunca a mensajes"],
    evidencias=[ev("evento","Campaña activa","detectada por la conexión con Meta")],
    cinturon="3gup",activa=["F-14DIAS","F-TABLERO"])

add(32,"campo","Campo",campo=["Contestá en menos de dos horas cualquier agenda que entre",
    "Terminá de cerrar la transición de cartera","No abras el administrador de anuncios"])

add(33,"sesion","Leer tu tablero",sistema=3,minutos=45,piezas=["P4.7"],agente="tablero",
    pasos=["Armá la vista con cuatro columnas y nada más","Anotá tu costo por agenda de hoy",
           "Leé los tres cuellos y marcá cuál tenés"],
    evidencias=[ev("imagen","Tablero con cuatro columnas","gasto, entradas, agendas, costo por agenda"),
                ev("numero","Costo por agenda","> 0")])

for d in (34,35,37,40,41):
    add(d,"campo","Los catorce sin tocar",
        campo=["Mirá el tablero una vez por día, dos minutos, sin cambiar nada",
               "Contestá en menos de dos horas a cada agenda que entra",
               "Seguí cerrando la transición de cartera que quedó abierta"])

add(36,"sesion","La llamada dibujada",sistema=3,minutos=60,piezas=["P5.1"],agente="sparring",manual="LLA-1",
    pasos=["Dibujá tu W sobre la plantilla","Escribí tus preguntas de cada tramo",
           "Marcá el minuto del precio","Escribí qué hacés después del número: nada",
           "Practicá una llamada completa con el Sparring"],
    evidencias=[ev("texto","Tu W con tus preguntas","los siete tramos"),
                ev("evento","Sesión de sparring","completada")],
    adn=["voz.frases_propias"])

add(38,"sesion","Antes de la llamada",sistema=3,minutos=45,piezas=["P5.2"],
    pasos=["Escribí tu mensaje previo","Escribí tu criterio de cancelación",
           "Cargá las dos cosas como plantillas en el Sistema"],
    evidencias=[ev("texto","Mensaje previo y criterio","el criterio con dos condiciones objetivas")])

add(39,"sesion","Grabar las llamadas",sistema=3,minutos=30,piezas=["P5.4-i"],tutoriales=["L-17"],
    pasos=["Activá la grabación en el Sistema","Escribí la frase con la que avisás"],
    evidencias=[ev("evento","Grabación activada","en el Sistema")])

add(42,"sesion","La autopsia",sistema=3,minutos=60,piezas=["P5.6"],agente="sparring",manual="LLA-4",
    pasos=["Subí o elegí una llamada real","Escuchala entera: la app no deja saltar",
           "Anotá los cuatro números","Compará con los que midió el Sparring",
           "Elegí una sola cosa para cambiar"],
    evidencias=[ev("numero","Los cuatro números","minuto, preguntas, silencio, pidió decisión"),
                ev("texto","La cosa que cambia","una sola")])

add(43,"protocolo","A quién traicionarías ganando más",sistema=1,minutos=20,agente="espejo",
    pasos=["El Espejo te devuelve lo del día 6","Nombrá a la persona",
           "Escribí qué hizo por vos","Escribí el permiso en primera persona con su nombre",
           "Decilo en voz alta y grabalo"],
    evidencias=[ev("texto","El permiso escrito","contiene un nombre propio"),
                ev("archivo","El permiso dicho","audio")],
    adn=["historia.el_permiso"])

add(44,"sesion","Tu recuperador",sistema=3,minutos=60,piezas=["P4.5"],tutoriales=["L-18","L-19"],
    agente="espejo",
    pasos=["Armá tu bandeja con los cuatro estados","A cada 'no ahora' ponele fecha de vuelta",
           "Armá las respuestas automáticas",
           "Protocolo: escribí la lista de lo que te deben y tachala"],
    evidencias=[ev("evento","Bandeja clasificada","al menos cinco conversaciones con estado y fecha"),
                ev("imagen","La lista tachada","tachado visible")])

add(45,"sesion","Tu primer consultante nuevo",sistema=3,minutos=30,piezas=["P6.3"],
    evidencias=[ev("evento","Cobro del sistema","contacto con origen campaña")],
    cinturon="2gup",
    nota="Si no llega, el camino no se frena. El grado queda en ventana.")

add(46,"sesion","Escalar o apagar",sistema=3,minutos=45,piezas=["P4.4c"],agente="tablero",
    pasos=["Mirá tu costo por agenda de los catorce días",
           "La app habilita un solo botón según tu número","Escribí la decisión y el número que la justifica"],
    evidencias=[ev("texto","La decisión","con el costo por agenda al lado")],
    levanta=["F-14DIAS","F-TABLERO"],
    nota="Desde hoy se repite todos los lunes. Un escalón por semana, +20%, nunca duplicar.")

add(47,"sesion","La cinta",sistema=4,minutos=45,piezas=["P6.1"],agente="arquitecto",manual="CLI-4",
    pasos=["Partí tu programa en dos columnas: grabado y en vivo",
           "Nombrá tus estaciones, en orden","Definí tu línea base",
           "Hacé la cuenta: horas para uno, horas para diez"],
    evidencias=[ev("texto","Dos columnas, estaciones y línea base","completas"),
                ev("numero","Horas por consultante al mes","> 0")],
    adn=["entrega.estaciones","entrega.que_va_grabado","entrega.que_va_en_vivo","entrega.linea_base"])

add(48,"sesion","El alta",sistema=4,minutos=45,piezas=["P6.2"],manual="CLI-5",
    pasos=["Escribí tu mensaje de bienvenida","Escribí tus tres límites",
           "Ordená tus siete pasos del alta","Conectá la línea base al triage"],
    evidencias=[ev("texto","Bienvenida, tres límites y siete pasos","completos")],
    adn=["entrega.alta_7_pasos","entrega.tres_limites"])

add(49,"campo","Campo",campo=["Aplicá el alta completa a quien haya entrado",
    "Llamadas de la semana con tu W","Lunes de números, si cae lunes"])

add(50,"sesion","Tu app con tu marca",sistema=4,minutos=45,piezas=["P8.1"],
    pasos=["Cargá nombre, color y logo. Nada más","Mirá cómo se ve desde un celular"],
    evidencias=[ev("imagen","Tu app con tu marca","logo y color visibles")])

add(51,"sesion","Tus etapas",sistema=4,minutos=90,piezas=["P8.2"],agente="arquitecto",larga=True,
    pasos=["Apretá el botón que trae todo desde tu ADN","Revisá que haya llegado bien y corregí",
           "Armá cuatro semanas con lo que desbloquea cada una","Cargá cuatro, no doce"],
    evidencias=[ev("evento","Cuatro etapas cargadas","con contenido asignado")])

add(52,"rodaje","Jornada de rodaje B",sistema=4,minutos=180,piezas=["P8.4"],larga=True,
    pasos=["Elegí de tu columna 'va grabado' del día 47","Uno por etapa, de tres a siete minutos",
           "Una sola toma por video","Sin edición: se sube como salió"],
    evidencias=[ev("archivo","Cuatro videos","subidos y asignados a su etapa")])

add(53,"sesion","Invitar al primero",sistema=4,minutos=60,piezas=["P8.5"],manual="CLI-6",
    pasos=["Compra de prueba: comprate a vos mismo con una tarjeta real",
           "Recorré lo que recorre tu consultante","Invitá a tu primer consultante",
           "Mandale la frase exacta del video"],
    evidencias=[ev("evento","Compra de prueba","pago propio registrado"),
                ev("imagen","Consultante adentro","captura desde celular con tu marca")],
    activa=["F-COMPRA"])

add(54,"campo","Campo",campo=["Acompañá a tu primer consultante en su etapa 1",
    "Llamadas de la semana","Tablero, dos minutos"])

add(55,"sesion","La máquina de 10",sistema=3,minutos=45,piezas=["P7.1a","P7.1"],manual="CAM-7",
    pasos=["La app trae tus números reales del tablero",
           "Escribí la cadena: conversaciones, agendas, llamadas, ventas",
           "Traducilo a lo que tiene que pasar cada semana","Marcá cuál de los tres cuellos tenés"],
    evidencias=[ev("texto","Tu cadena con tus números","los cuatro escalones")],
    cinturon="1gup")

CICLO = ["Lunes · los números: costo por agenda y la decisión",
         "Martes · las llamadas, con tu W adelante",
         "Miércoles · el recuperador: los 'no ahora' con fecha vencida",
         "Jueves · la entrega: tus consultantes en tu app",
         "Viernes · la autopsia: una llamada, cuatro números"]

for d in range(56,91):
    if d in J: continue
    if d == 61:
        add(61,"sesion","Por qué la marca va última",sistema=5,minutos=45,piezas=["P9.1"],
            agente="estratega",manual="CAM-9",
            pasos=["Sacá tus tres enfoques de la Matriz ABC",
                   "Para cada enfoque, escribí a quién filtra y a quién atrae"],
            evidencias=[ev("texto","Los tres enfoques","con su filtro")],
            adn=["avatar.matriz_abc"])
    elif d == 67:
        add(67,"sesion","Las doce semanas escritas",sistema=5,minutos=90,piezas=["P9.4"],
            tutoriales=["L-20","L-21"],agente="estratega",larga=True,
            pasos=["Repartí tus tres enfoques en doce semanas",
                   "Para cada semana, el gancho y el ángulo",
                   "Marcá cuáles son de filtro y cuáles de autoridad","No grabes nada todavía"],
            evidencias=[ev("texto","Doce semanas con sus ganchos","doce filas")],
            activa=["F-ORGANICO"])
    elif d == 86:
        add(86,"protocolo","Agrandar el vaso",sistema=1,minutos=30,agente="espejo",
            pasos=["Escribí tu día completo con el ingreso siguiente, en detalle físico",
                   "En presente, no en condicional"],
            evidencias=[ev("texto","Tu día siguiente","en presente")],adn=["cuaderno"])
    elif d == 87:
        add(87,"sesion","Tu foto de llegada",sistema=0,minutos=45,piezas=["P10.2"],
            pasos=["Contestá las mismas preguntas del día 3",
                   "Recalculá tu hora real neta con los datos de Mi Clínica",
                   "Recién ahí la app destapa el número del día 3"],
            evidencias=[ev("numero","Hora real neta final","> 0")],
            adn=["numeros.hora_real_neta_final"])
    elif d == 88:
        add(88,"sesion","Qué sigue",sistema=0,minutos=45,piezas=["P10.3"],
            pasos=["La app arma el borrador de tu plan de 180",
                   "Editalo, aprobalo y descargalo","Te lo llevás lo tomes o no lo tomes"],
            evidencias=[ev("texto","Plan de 180 aprobado","doce semanas + tres meses")])
    elif d == 90:
        add(90,"cierre","El cierre",sistema=0,minutos=0,
            evidencias=[ev("evento","Diez consultantes","contados desde MCD, todos al precio digno")],
            cinturon="1dan",
            nota="Si no llegó, el camino no se cierra: el ciclo queda abierto sin fecha.")
    else:
        add(d,"ciclo","Ciclo de la semana",minutos=45,campo=CICLO)

for d in range(0,91):
    if d not in J:
        add(d,"campo","Campo",campo=["El dojo descansa"])

out = {
  "version":"2026.09","idioma":"es-neutro","dias":90,
  "promesa":{"consultantes":10,"jornada_horas":4,"dias_semana":5},
  "sistemas":[
    {"n":1,"nombre":"Tú","dias":"1-12"},
    {"n":2,"nombre":"Tu programa","dias":"15-19"},
    {"n":3,"nombre":"Tu sistema de venta","dias":"22-46"},
    {"n":4,"nombre":"Tu clínica adentro","dias":"2 y 47-53"},
    {"n":5,"nombre":"Tu plan de marca","dias":"61-67"}],
  "piezas":[{"codigo":c,"titulo":t,"dia":d,"sistema":s,"set":st,"minutos":m,"estado":e}
            for c,t,d,s,st,m,e in PIEZAS],
  "tutoriales":[{"codigo":c,"titulo":t,"dia":d,"minutos":m,"donde":w}
                for c,t,d,m,w in TUTORIALES],
  "cinturones":[{"id":i,"nombre":n,"color":c,"punta":p,"dia":d,"significado":s,"forma":f,"en_ventana":v}
                for i,n,c,p,d,s,f,v in CINTURONES],
  "agentes":[{"id":i,"nombre":n,"dia":d,"se_abre_con":k} for i,n,d,k in AGENTES],
  "frenos":[{"id":i,"regla":r,"apertura":a,"mensaje":m} for i,r,a,m in FRENOS],
  "jornadas":[J[d] for d in sorted(J)]
}

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
