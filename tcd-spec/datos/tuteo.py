# -*- coding: utf-8 -*-
"""
tuteo.py — pasa el texto del camino de voseo a castellano neutro (tú).

La app se usa en Ecuador, Panamá, Chile, Venezuela y España. El texto de las
jornadas estaba escrito con voseo ("Escribí", "tenés", "Comprate a vos mismo").
generar_seed.py lo pasa por aquí antes de escribir el JSON, y auditoria.py
revisa que el JSON no tenga ninguna de estas formas.
"""
import re

VOSEO_A_TU = {
    # imperativos
    'Escribí': 'Escribe', 'Elegí': 'Elige', 'Cargá': 'Carga', 'Marcá': 'Marca', 'Armá': 'Arma',
    'Mirá': 'Mira', 'Subí': 'Sube', 'Sumá': 'Suma', 'Nombrá': 'Nombra', 'Definí': 'Define',
    'Contestá': 'Contesta', 'Terminá': 'Termina', 'Sacá': 'Saca', 'Abrí': 'Abre', 'Contá': 'Cuenta',
    'Editá': 'Edita', 'Dibujá': 'Dibuja', 'Revisá': 'Revisa', 'Leé': 'Lee', 'Anotá': 'Anota',
    'Hacé': 'Haz', 'Volvé': 'Vuelve', 'Firmá': 'Firma', 'Publicá': 'Publica', 'Completá': 'Completa',
    'Arrastrá': 'Arrastra', 'Confirmá': 'Confirma', 'Creá': 'Crea', 'Cobrá': 'Cobra', 'Mandá': 'Manda',
    'Corregí': 'Corrige', 'Diseñá': 'Diseña', 'Escuchá': 'Escucha', 'Repetí': 'Repite', 'Cerrá': 'Cierra',
    'Pedí': 'Pide', 'Practicá': 'Practica', 'Repasá': 'Repasa', 'Activá': 'Activa', 'Compará': 'Compara',
    'Partí': 'Parte', 'Ordená': 'Ordena', 'Conectá': 'Conecta', 'Aplicá': 'Aplica', 'Apretá': 'Aprieta',
    'Recorré': 'Recorre', 'Invitá': 'Invita', 'Acompañá': 'Acompaña', 'Repartí': 'Reparte',
    'Recalculá': 'Recalcula',
    # con pronombre pegado
    'Agendate': 'Agéndate', 'Cobrate': 'Cóbrate', 'Comprate': 'Cómprate', 'Decilo': 'Dilo',
    'Editalo': 'Edítalo', 'Escribilo': 'Escríbelo', 'Escuchala': 'Escúchala', 'Grabate': 'Grábate',
    'Mandala': 'Mándala', 'Mandale': 'Mándale', 'Ordenalos': 'Ordénalos', 'Quedate': 'Quédate',
    'Subilos': 'Súbelos', 'Traducilo': 'Tradúcelo', 'Aprobalo': 'Apruébalo', 'Descargalo': 'Descárgalo',
    'Editala': 'Edítala', 'Grabalo': 'Grábalo', 'Hacele': 'Hazle', 'Marcalos': 'Márcalos',
    'Ponele': 'Ponle', 'Practicala': 'Practícala', 'Tachala': 'Táchala', 'Tapalo': 'Tápalo',
    # presente
    'Tenés': 'Tienes', 'Escribís': 'Escribes', 'Hacés': 'Haces', 'Cobrás': 'Cobras',
    'Escuchás': 'Escuchas', 'Usás': 'Usas', 'Vendés': 'Vendes', 'Trabajás': 'Trabajas',
    'Avisás': 'Avisas', 'Llevás': 'Llevas', 'Podés': 'Puedes',
    # los que aparecieron en el código de la app
    'Repetí': 'Repite', 'Guardá': 'Guarda', 'Empezá': 'Empieza', 'Copiá': 'Copia',
    'Contanos': 'Cuéntanos', 'Creá': 'Crea', 'Llevás': 'Llevas', 'Cuidalo': 'Cuídalo',
    'Recordá': 'Recuerda',
}
# "a vos mismo" y "por vos" van antes que el "vos" suelto.
FRASES = [('a vos mismo', 'a ti mismo'), ('por vos', 'por ti'), ('para vos', 'para ti'),
          ('con vos', 'contigo'), (' y vos no', ' y tú no'), ('vos', 'tú')]


def _con_mayuscula(orig: str, nuevo: str) -> str:
    if len(orig) > 1 and orig.isupper():
        return nuevo.upper()
    return nuevo[0].upper() + nuevo[1:] if orig[0].isupper() else nuevo[0].lower() + nuevo[1:]


_PATRON = re.compile(r'\b(' + '|'.join(sorted({k.lower() for k in VOSEO_A_TU}, key=len, reverse=True)) + r')\b', re.I)
_MIN = {k.lower(): v for k, v in VOSEO_A_TU.items()}


def tutear_palabras(texto: str) -> str:
    """Solo las formas verbales (sin tocar 'vos'): segura para código fuente."""
    return _PATRON.sub(lambda m: _con_mayuscula(m.group(0), _MIN[m.group(0).lower()]), texto)


def tutear(texto: str) -> str:
    if not isinstance(texto, str) or not texto:
        return texto
    t = tutear_palabras(texto)
    for a, b in FRASES:
        t = re.sub(r'(?<!\w)' + re.escape(a) + r'(?!\w)', b, t)
    return t


def tutear_todo(dato):
    """Recorre el JSON entero y tutea cada texto."""
    if isinstance(dato, str):
        return tutear(dato)
    if isinstance(dato, list):
        return [tutear_todo(x) for x in dato]
    if isinstance(dato, dict):
        return {k: tutear_todo(v) for k, v in dato.items()}
    return dato


# Formas que NO pueden aparecer en el JSON final (lo usa auditoria.py).
PROHIBIDAS = re.compile(
    r'\b(' + '|'.join(sorted({k.lower() for k in VOSEO_A_TU}, key=len, reverse=True)) + r'|vos)\b', re.I)
