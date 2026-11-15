#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LOS TRES HILOS DE CADA DÍA · adentro, afuera y sistema.

Lo que entra al seed desde acá:

  · `leccion`     — la lección del libro que se lee ese día (número, título,
                    el freno que trabaja y el logro). Puede haber dos en un
                    día: la semana 1 lee dos por día, y los sábados 6 y 13
                    también.
  · `pausa`       — la práctica de 5 minutos de ese día, con su marca de
                    evidencia (● sólido · ◐ prometedor · ○ juego o tradición).
  · `paso_afuera` — la micro-tarea opcional de 10 minutos, SOLO los días en
                    que la app no pide nada visible.

El tercer hilo —el sistema— ya estaba: son los `pasos` de la jornada. Este
módulo no los toca, igual que no toca días, títulos ni nombres.

FUENTE. Las tres tablas las pasa el frente LIBROS, no se inventan acá:
  · las 33 lecciones del Lago con su día, su freno, su pausa y su logro:
    claude/ARQUITECTURA-COLECCION.md §4;
  · el repertorio de pausas con su marca y su base:
    claude/ARQUITECTURA-COLECCION.md §7;
  · los 28 días sin nada visible y los cinco pasos afuera:
    claude/ARQUITECTURA-COLECCION.md §2 y claude/APP-ALINEACION.md §4.

LO QUE FALTA, Y ES DE LIBROS. Montaña, Viento, Río y Bosque todavía no
tienen su tabla: llega cuando cierre cada libro. Hasta entonces, 27 de los
91 días traen lección y el resto viene vacío — la app lo dibuja solo cuando
hay algo, nunca anuncia lo que falta. Los 28 pasos afuera sí están los 28,
uno por día y escrito contra la tarea de ese día: si LIBROS pasa los suyos,
se reemplazan los textos de `PASOS_AFUERA` y nada más cambia.

La regla que no se toca: los días y los nombres de `roadmap.seed.json`
mandan. Acá se cuelgan hilos de esos días; si un día de esta tabla no
existe en el camino, el generador se cae en vez de escribir un seed mudo.
"""

# ── el repertorio de pausas (§7) ────────────────────────────────────────────
# id, nombre, marca, base. La marca es la del libro: lo que no tiene marca
# no es un dato.
PAUSAS = [
    ("seis-por-minuto", "Seis por minuto", "●",
     "Lehrer y Gevirtz 2014 (revisión); Marchant y otros 2025"),
    ("suspiro-ciclico", "Suspiro cíclico", "◐",
     "Balban y otros, Cell Reports Medicine 2023 (ensayo aleatorizado)"),
    ("tararear", "Tararear", "◐",
     "Weitzberg y Lundberg 2002; Hatha Yoga Pradipika, s. XV (bhramari)"),
    ("hablarte-por-tu-nombre", "Hablarte por tu nombre", "●",
     "Kross y otros 2014 (seis estudios con metaanálisis interno)"),
    ("sonreir-al-espejo", "Sonreír al espejo un minuto", "◐",
     "Many Smiles Collaboration 2022: 3.878 personas, 19 países; efecto chico"),
    ("caminata-de-asombro", "Caminata de asombro", "◐",
     "Sturm y otros 2020: 60 adultos mayores, 8 semanas"),
    ("bailar-tu-cancion", "Bailar tu canción", "◐",
     "Noetel y otros, BMJ 2024; Salimpoor y otros 2011"),
    ("moverte-fuerte", "Moverte fuerte", "●",
     "Noetel 2024: el efecto crece con la intensidad"),
    ("gratitud", "Gratitud de tres líneas", "●",
     "Emmons y McCullough 2003"),
    ("escribirle-a-alguien", "Escribirle a alguien que te importa", "●",
     "Holt-Lunstad y otros 2010; Harvard Study of Adult Development"),
    ("gastar-en-otro", "Gastar en otro", "◐",
     "Dunn, Aknin y Norton, Science 2008"),
    ("pies-en-la-tierra", "Pies descalzos en la tierra", "○",
     "Evidencia débil: va como ritual de pausa, no como terapia"),
    ("reirte-solo", "Reírte solo", "○", "Ritual; sin dato firme"),
    ("protocolo-777", "Tu protocolo 7-7-7", "○", "Práctica de Javo"),
]

# ── las 33 del Lago (§4) ────────────────────────────────────────────────────
# libro, número, título, día del camino, el freno, id de la pausa, la pausa
# como la dice esa lección, el logro.
#
# El número y el título NO cambian nunca: 19 videos del rodaje los nombran y
# muestran el libro abierto en esa página. Lo único que cambia es el día.
LECCIONES = [
    ("lago", 1, "Te ves cuando te calmas", 1, "El ruido",
     "seis-por-minuto", "Seis por minuto",
     "Tu foto de partida: tu cara, tu número y lo que sientes hoy."),
    ("lago", 2, "Tu hora real", 1, "«Trabajo mucho y gano bien»", None, None,
     "Tu hora real neta del último mes, pegada donde la veas."),
    ("lago", 9, "Lo que crees está más hondo de lo que piensas", 2,
     "La frase de abajo", "tararear", "Tararear",
     "Tu frase del dinero de abajo, en una línea."),
    ("lago", 13, "Tu cuenca", 2, "Lo heredado",
     "gratitud", "Gratitud de tres líneas",
     "Quién te dijo qué del dinero, con nombre y edad."),
    ("lago", 16, "Mírate sin castigarte", 3, "El juez interno",
     "hablarte-por-tu-nombre", "Hablarte por tu nombre",
     "Tu rueda en ocho números, sin un solo adjetivo."),
    ("lago", 18, "Corta la ola cuando es chica", 3, "El disparador",
     "suspiro-ciclico", "Suspiro cíclico",
     "Tus tres disparadores, con dónde los sientes en el cuerpo."),
    ("lago", 21, "Respira antes de abrir la puerta", 4, "El piloto automático",
     "protocolo-777", "Tu protocolo (el 7-7-7 de Javo)",
     "Tu protocolo en tres líneas, con su gesto, pegado."),
    ("lago", 22, "Tu cuerpo va en la agenda", 4, "«No tengo tiempo»",
     "moverte-fuerte", "Moverte fuerte",
     "Tu cuerpo con hora fija, agendado cuatro semanas."),
    ("lago", 26, "Tu precio nuevo, por escrito", 5,
     "El número que da vergüenza",
     "seis-por-minuto", "Seis por minuto, antes de escribirlo",
     "Tu precio en una servilleta, con fecha y firma, y tu link de pago creado."),
    ("lago", 28, "Lo que sueltas", 5, "La culpa de soltar",
     "gratitud", "Gratitud",
     "Tu cartera en tres grupos: siguen, suben, sueltas."),
    ("lago", 7, "Tu para qué, en una frase", 6, "El sentido perdido",
     "caminata-de-asombro", "Caminata de asombro",
     "Tu para qué en menos de quince palabras."),
    ("lago", 15, "Tu techo se puede mover", 6, "El techo heredado",
     "bailar-tu-cancion", "Bailar tu canción",
     "Tu permiso nuevo, escrito y dicho en voz alta."),
    ("lago", 5, "Lo que sanaste primero", 10, "El impostor",
     "hablarte-por-tu-nombre", "Hablarte por tu nombre",
     "Tu programa leído entero en voz alta, grabado, sin pedir perdón ni una vez."),
    ("lago", 11, "Las capas se leen de a una", 12,
     "La perfección: el ego como falso centro",
     "suspiro-ciclico", "Suspiro cíclico",
     "Tu método enviado hoy, con lo que todavía no te convence anotado aparte."),
    ("lago", 27, "Tu tono llega antes que tus palabras", 13, "Exponerte",
     "tararear", "Tararear y sonreír al espejo",
     "Una historia con tu cara publicada hoy."),
    ("lago", 10, "Lo que crees tiene un origen", 18, "El juicio ajeno",
     "caminata-de-asombro", "Caminata de asombro",
     "Tus mensajes enviados y la respuesta que más miedo te daba, anotada al lado de la que llegó."),
    ("lago", 31, "Ensaya antes de la llamada", 19, "El miedo escénico",
     "hablarte-por-tu-nombre", "Hablarte por tu nombre",
     "Tu llamada ensayada dos veces en voz alta."),
    ("lago", 30, "Tu Guardián", 22, "El rechazo",
     "suspiro-ciclico", "Suspiro cíclico al colgar",
     "Tu primera llamada hecha y su objeción con las palabras exactas, junto a tu respuesta escrita."),
    ("lago", 25, "Lo que pides, hazlo tú primero", 24, "Merecer",
     "gratitud", "Gratitud",
     "Tu preventa enviada a tres, sin «perdón por molestar»."),
    ("lago", 32, "Celebrarte también se entrena", 26, "«No fue para tanto»",
     "bailar-tu-cancion", "Bailar tu canción",
     "Tu primera venta celebrada en voz alta con una persona."),
    ("lago", 6, "Tu consultante inolvidable", 32, "La culpa de decir no",
     "seis-por-minuto", "Seis por minuto",
     "Tu primer derivado, con el mensaje guardado, y tu consultante inolvidable descrito en tres líneas."),
    ("lago", 20, "Deja que el agua se asiente", 33, "La ansiedad de tocar",
     "tararear", "Tararear",
     "Tres días sin tocar la campaña; lo que querías cambiar, escrito."),
    ("lago", 17, "Sanarte es el requisito técnico", 37, "El miedo a molestar",
     "hablarte-por-tu-nombre", "Hablarte por tu nombre",
     "Tus tres límites dentro de tu mensaje de bienvenida."),
    ("lago", 4, "Lo que buscas con las herramientas justas, aparece", 40,
     "Pedir ayuda", "escribirle-a-alguien", "Escribirle a alguien que te importa",
     "Una ayuda pedida y aceptada esta semana."),
    ("lago", 29, "Tu empresa de uno, en una página", 45, "«Fue suerte»",
     "gratitud", "Gratitud",
     "Tu empresa de uno en una página, y lo que sentiste al ver ese cobro, contado a alguien."),
    ("lago", 8, "Diez de 1.000, en 90 días", 47, "El miedo a los números",
     "suspiro-ciclico", "Suspiro cíclico",
     "Tus cuatro números cargados, sin un adjetivo."),
    ("lago", 12, "Lo que entró de afuera se puede revisar", 52, "La crítica",
     "sonreir-al-espejo", "Sonreír al espejo",
     "Tres devoluciones pedidas y agradecidas por escrito."),
    ("lago", 23, "Saca a tu cuerpo de la alerta", 58, "Pedir más",
     "seis-por-minuto", "Seis por minuto",
     "Tu conversación de renovación hecha con uno."),
    ("lago", 19, "Lo que consumes te tiñe", 59, "Lo que entra sin filtro",
     "pies-en-la-tierra", "Pies en la tierra",
     "Una semana sin lo que más te tiñe, y lo que entra en su lugar."),
    ("lago", 24, "Descansar es parte del trabajo", 60, "La culpa de parar",
     "caminata-de-asombro", "Caminata de asombro",
     "Tu medio día libre agendado y cuidado."),
    ("lago", 14, "El tamaño de tu vaso", 66, "El vaso chico",
     "gastar-en-otro", "Gastar en otro",
     "Tu vaso más grande, dibujado en una página."),
    ("lago", 3, "Tu hora y tu búnker", 74, "Compararte",
     "seis-por-minuto", "Seis por minuto",
     "Tu hora real de hoy al lado de la del día 1, y tu búnker armado."),
    ("lago", 33, "Tu calma llega más lejos", 90, "Terminar sin celebrar",
     "bailar-tu-cancion", "Bailar tu canción",
     "Tres cartas de gracias enviadas a quienes te sostuvieron."),
]

# ── el paso afuera (§2) ─────────────────────────────────────────────────────
# Exponerse como músculo: poco, todos los días. Diez minutos, opcional, y
# solo los días en que la app no pide nada visible. Los cinco son los de
# LIBROS; el reparto es una rotación por día hasta que pasen su tabla.
# El segundo dice «publícala» y no «publica una historia»: el medidor de
# pantallas marca `publica` como palabra sin su tilde —su regla no distingue
# el verbo en imperativo de «pública», el adjetivo—, y la forma con pronombre
# lleva la tilde de verdad. Es la misma palabra de LIBROS, dicha como orden
# para hoy. Si alguien la devuelve a «Publica una historia», el medidor
# cuenta una falta en `roadmap>jornada`.
# 15 nov 2026 · DEJÓ DE SER UNA ROTACIÓN. Cinco pasos repartidos entre 28
# días le daban al cliente «Cambia una línea de tu perfil» seis veces en los
# 90 días, y la sexta ya no expone nada: expone que el paso no mira el día.
#
# Ahora cada uno está escrito contra la tarea de ESE día. El día 8 arma su
# lista de veinte, así que su paso es escribirle a uno de esa lista; el 74
# vuelve a medir su hora real, así que su paso es ponerla al lado de la del
# día 1. Si LIBROS pasa su tabla, se reemplazan estos textos y nada más
# cambia: los días son los mismos de abajo.
PASOS_AFUERA = {
    1:  "Dile a una sola persona que empezaste. Por mensaje, hoy, con la fecha de tu día 90.",
    2:  "Pregúntale a quien te crió qué pensaba del dinero. Escucha sin discutir.",
    3:  "Escríbele a un colega y pregúntale qué hace él cuando se le va el día.",
    4:  "Pega tu protocolo donde alguien de tu casa lo vea, y cuéntale qué es.",
    8:  "Escribe a uno de los veinte de tu lista. Sin ofrecer nada: solo cómo está.",
    9:  "Cuéntale las etapas de tu método a alguien que no sea de tu rubro. Si no se entiende, anótalo.",
    10: "Dile tu precio nuevo en voz alta a una persona de confianza. Mira qué te pasa en el cuerpo.",
    12: "Anuncia en una historia que terminaste tu método. Sin vender.",
    18: "Responde todos los mensajes que te llegaron hoy, cada uno con una pregunta.",
    19: "Grábate diciendo tu número y mándaselo a alguien que te vaya a decir la verdad.",
    25: "Escríbele a uno que te dijo «después» y ponle fecha de vuelta.",
    30: "Muéstrale tus tres anuncios a alguien que no te conoce y pregúntale qué entendió.",
    32: "Preséntale por mensaje a dos colegas que se puedan derivar entre ellos.",
    43: "Cuenta en una historia qué número estás mirando esta semana. Sin resultado todavía.",
    51: "Escríbele hoy a cada uno que no pagó. Uno por uno, con la fecha.",
    52: "Pídele a un consultante que te diga una cosa que le faltó. Agradécesela por escrito.",
    59: "Comparte uno de tus ejercicios. El que más te piden.",
    60: "Avísale a tu casa en qué bloques no estás disponible la semana que viene.",
    65: "Pregúntale a un colega cuánto le cuesta a él una agenda. Comparen los dos números.",
    66: "Gasta algo en otra persona hoy, sin motivo y sin avisar.",
    73: "Pídele a cada uno de los primeros su resultado en una frase, y el permiso para usarlo.",
    74: "Pon tu hora real de hoy al lado de la del día 1 y muéstrasela a alguien.",
    82: "Muestra los dos números: el de entrada y el de hoy. Sin explicar.",
    85: "Escríbele a alguien que admires de otra disciplina y preséntate en tres líneas.",
    87: "Cuenta tu foto de llegada en una historia, con tu cara.",
    88: "Mándale tu plan de 180 días a una persona que te lo vaya a recordar.",
    89: "Escríbeles hoy a los que quedaron en la bandeja. Nombre y fecha, uno por uno.",
    90: "Manda tres cartas de gracias a quienes te sostuvieron estos noventa días.",
}

# Los 28 días sin nada visible, tal como los pasó LIBROS. No se derivan del
# seed: medido el 15 de noviembre, 59 días no piden acciones de campo, así
# que estos 28 son el criterio de LIBROS y no una cuenta. Lo que sí se mide
# —y es la guarda de abajo— es que ninguno de los 28 tenga acciones de campo.
DIAS_PASO_AFUERA = [
    1, 2, 3, 4, 8, 9, 10, 12, 18, 19, 25, 30, 32, 43, 51, 52,
    59, 60, 65, 66, 73, 74, 82, 85, 87, 88, 89, 90,
]

_PAUSA = {p[0]: p for p in PAUSAS}


def pausas_del_seed():
    """El repertorio, como lo lee la app."""
    return [{"id": i, "nombre": n, "marca": m, "base": b} for i, n, m, b in PAUSAS]


def colgar_los_hilos(J):
    """Cuelga los tres hilos de cada jornada de `J`, en su sitio.

    Se cae a propósito —y con el nombre de lo que falta— en vez de escribir
    un seed mudo: una lección en un día que no existe, una pausa que no está
    en el repertorio o un paso afuera en un día que ya pide salir al mundo
    son errores de la tabla, no cosas para descubrir en el teléfono.
    """
    for d in J:
        J[d]["leccion"] = []
        J[d]["pausa"] = None
        J[d]["paso_afuera"] = None

    vistas = set()
    for libro, num, tit, dia, freno, pid, dicha, logro in LECCIONES:
        if dia not in J:
            raise SystemExit(
                f"La lección {libro} {num} cae en el día {dia} y ese día no "
                "existe en el camino. Los días mandan: corregir la tabla.")
        if (libro, num) in vistas:
            raise SystemExit(f"La lección {libro} {num} está dos veces.")
        vistas.add((libro, num))
        if pid is not None and pid not in _PAUSA:
            raise SystemExit(
                f"La lección {libro} {num} pide la pausa «{pid}», que no está "
                "en el repertorio (§7).")
        J[dia]["leccion"].append({
            "libro": libro, "numero": num, "titulo": tit, "freno": freno,
            "pausa": pid, "pausa_dicha": dicha, "logro": logro,
        })

    # La pausa del día es la de su primera lección que trae una: la lección 2
    # no tiene, y el día 1 se queda con la de la lección 1.
    for d, j in J.items():
        for l in j["leccion"]:
            if l["pausa"]:
                _i, _n, _m, _b = _PAUSA[l["pausa"]]
                j["pausa"] = {"id": _i, "nombre": _n, "marca": _m, "base": _b,
                              "dicha": l["pausa_dicha"] or _n}
                break

    sin_texto = sorted(set(DIAS_PASO_AFUERA) - set(PASOS_AFUERA))
    if sin_texto:
        raise SystemExit(
            f"Días con paso afuera y sin texto: {sin_texto}. Cada uno se "
            "escribe contra la tarea de su día; no hay repertorio del que sacar.")
    for dia in sorted(DIAS_PASO_AFUERA):
        if dia not in J:
            raise SystemExit(f"El día {dia} del paso afuera no existe en el camino.")
        if J[dia]["acciones_campo"]:
            raise SystemExit(
                f"El día {dia} ya pide salir al mundo (acciones de campo): "
                "el paso afuera va solo donde la app no pide nada visible.")
        J[dia]["paso_afuera"] = PASOS_AFUERA[dia]
