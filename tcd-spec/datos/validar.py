#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Valida el paquete contra sí mismo. Sale con código 1 si algo no cierra.

    python3 datos/validar.py

Sirve como paso de CI: si un número de la documentación deja de coincidir con el
seed, esto lo encuentra antes que un cliente.
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errores, avisos = [], []

def leer(rel):
    p = os.path.join(RAIZ, rel)
    if not os.path.exists(p):
        errores.append(f"falta el archivo {rel}")
        return ""
    return open(p, encoding="utf-8").read()

seed = json.loads(leer("datos/roadmap.seed.json") or "{}")
if not seed:
    print("✗ no se pudo leer el seed"); sys.exit(1)

# ── 1 · integridad del seed ─────────────────────────────────────────────────
dias = [j["dia"] for j in seed["jornadas"]]
if dias != list(range(0, 91)):
    errores.append(f"jornadas con hueco o fuera de orden: {len(dias)} entradas")

# Las deudas del catálogo las declara el generador y viajan en el seed: acá se
# leen de ahí, no se copian. Lo que importa es que no CREZCAN.
DEUDAS = seed.get("deudas_del_catalogo", {"sin_ficha": [], "sin_jornada": []})
SIN_FICHA, SIN_JORNADA = set(DEUDAS["sin_ficha"]), set(DEUDAS["sin_jornada"])

for j in seed["jornadas"]:
    for c in j["piezas"]:
        if c not in {p["codigo"] for p in seed["piezas"]} and c not in SIN_FICHA:
            errores.append(f"día {j['dia']}: pieza {c} no existe en el catálogo")
    for c in j["tutoriales"]:
        if c not in {t["codigo"] for t in seed["tutoriales"]}:
            errores.append(f"día {j['dia']}: tutorial {c} no existe")
    if j["agente"] and j["agente"] not in {a["id"] for a in seed["agentes"]}:
        errores.append(f"día {j['dia']}: agente {j['agente']} no existe")
    if j["cinturon"] and j["cinturon"] not in {c["id"] for c in seed["cinturones"]}:
        errores.append(f"día {j['dia']}: cinturón {j['cinturon']} no existe")
    for f in j["freno_activa"] + j["freno_levanta"]:
        if f not in {x["id"] for x in seed["frenos"]}:
            errores.append(f"día {j['dia']}: freno {f} no existe")
    if j["tipo"] == "sesion" and not j["evidencias"] and j["dia"] not in (29,):
        avisos.append(f"día {j['dia']} es sesión y no pide evidencia")

# ── 2 · el día de cada pieza coincide con la jornada que la usa ─────────────
usada = {}
for j in seed["jornadas"]:
    for c in j["piezas"]:
        usada.setdefault(c, j["dia"])
for p in seed["piezas"]:
    if p["codigo"] not in usada:
        if p["codigo"] not in SIN_JORNADA:
            errores.append(f"pieza {p['codigo']} no se usa en ninguna jornada")
    elif usada[p["codigo"]] != p["dia"]:
        errores.append(
            f"pieza {p['codigo']}: catálogo dice día {p['dia']}, "
            f"jornadas la usan el {usada[p['codigo']]}")

# ── 3 · cada agente se abre en su día ───────────────────────────────────────
#
# El campo se llama `dia_estimado` desde que el día del entrenador sale del
# Camino y no de una lista aparte. Acá seguía pidiendo `dia`, así que este
# archivo se caía con un KeyError en esta línea y no llegaba a imprimir ni uno
# de los problemas de arriba. Nadie se enteró porque nadie lo corría: lo
# corre la batería desde el 16 de noviembre de 2026.
for a in seed["agentes"]:
    j = next((x for x in seed["jornadas"] if x["dia"] == a["dia_estimado"]), None)
    if not j:
        errores.append(f"agente {a['id']}: no hay jornada el día {a['dia_estimado']}")

# ── 4 · los documentos nombran todo lo del seed ─────────────────────────────
piezas_md = leer("01-PIEZAS.md")
for p in seed["piezas"]:
    if p["codigo"] not in piezas_md:
        errores.append(f"01-PIEZAS.md no lista la pieza {p['codigo']}")
for t in seed["tutoriales"]:
    if t["codigo"] not in piezas_md:
        errores.append(f"01-PIEZAS.md no lista el tutorial {t['codigo']}")

cint_md = leer("03-CINTURONES.md")
for c in seed["cinturones"]:
    if c["nombre"] not in cint_md:
        errores.append(f"03-CINTURONES.md no nombra {c['nombre']}")

# ── 4b · LOS NUEVE ENTRENADORES ────────────────────────────────────────────
#
# Esto pedía un `agentes/prompts/NN-id.md` por entrenador, y los ocho que hay
# en esa carpeta son los nombres VIEJOS (critico, escriba, camara, sparring,
# tablero, arquitecto, estratega): los prompts de verdad viven desde hace
# tiempo en `src/lib/agents/<id>.ts`, que es lo que la app carga. Así que el
# archivo pedía una copia muerta y no miraba la viva. Ahora mira la viva.
#
# Las dos deudas que quedan son de Javo y están declaradas: mientras sean
# exactamente éstas, pasa; si aparece una más, esto se pone rojo.
#  · 02-AGENTES.md no nombra a Vera ni a Sofi (texto de los entrenadores);
#  · Espejo es el entrenador de ocho jornadas en el seed —los días 1, 2, 3, 4,
#    19, 25, 32 y 66— y es el único de los nueve sin módulo vivo: el registro
#    `AGENTES` de la app tiene ocho. Si Espejo es un entrenador o no, lo dice
#    Javo.
SIN_NOMBRE_EN_EL_DOC = {"Vera", "Sofi"}
SIN_MODULO_VIVO = {"espejo"}

ag_md = leer("agentes/02-AGENTES.md")
for a in seed["agentes"]:
    if a["nombre"] not in ag_md and a["nombre"] not in SIN_NOMBRE_EN_EL_DOC:
        errores.append(f"02-AGENTES.md no nombra {a['nombre']}")
    vivo = os.path.join(RAIZ, "..", "src", "lib", "agents", f"{a['id']}.ts")
    if not os.path.exists(vivo) and a["id"] not in SIN_MODULO_VIVO:
        errores.append(f"el entrenador {a['id']} no tiene su módulo en src/lib/agents/{a['id']}.ts")
_nombrados = {n for n in SIN_NOMBRE_EN_EL_DOC if n in ag_md}
if _nombrados:
    avisos.append(f"02-AGENTES.md ya nombra a {', '.join(sorted(_nombrados))}: "
                  "sacarlos de SIN_NOMBRE_EN_EL_DOC")
_conModulo = {i for i in SIN_MODULO_VIVO
              if os.path.exists(os.path.join(RAIZ, "..", "src", "lib", "agents", f"{i}.ts"))}
if _conModulo:
    avisos.append(f"{', '.join(sorted(_conModulo))} ya tiene módulo vivo: "
                  "sacarlo de SIN_MODULO_VIVO")

# ── 5 · los números declarados en prosa ─────────────────────────────────────
carga = sum(j["minutos"] for j in seed["jornadas"])
evid = sum(len(j["evidencias"]) for j in seed["jornadas"])
minutos_piezas = sum(p["minutos"] for p in seed["piezas"])

# Los conteos estructurales: una pieza, un grado o un freno que desaparece sin
# que nadie lo decida tiene que doler acá.
esperado = {
    "43 piezas": len(seed["piezas"]) == 43,
    "21 tutoriales": len(seed["tutoriales"]) == 21,
    "11 cinturones": len(seed["cinturones"]) == 11,
    "9 entrenadores": len(seed["agentes"]) == 9,
    "10 frenos": len(seed["frenos"]) == 10,
    "91 jornadas": len(seed["jornadas"]) == 91,
    "279 minutos de piezas": round(minutos_piezas) == 279,
}
for k, ok in esperado.items():
    if not ok:
        errores.append(f"el total '{k}' ya no coincide con el seed")

# ── 5b · LO QUE LA PROSA DICE Y EL SEED NO ─────────────────────────────────
#
# Esta lista decía "4.265 minutos", "71 horas", "69 evidencias", "8 agentes" y
# "9 frenos", y el seed dice otra cosa desde que el Camino se reordenó. O sea:
# el archivo que existe para que "un número de la documentación no deje de
# coincidir con el seed" tenía él mismo los números viejos, y como nadie lo
# corría nadie lo vio.
#
# Cuál de los dos lados se corrige NO lo decide esta máquina: 71 horas contra
# 56 es cuánto trabajo dice el programa que lleva, y eso lo dice Javo. Así que
# el desacuerdo queda DECLARADO, con los dos números: mientras sea exactamente
# éste, pasa; si cualquiera de los dos lados se mueve, esto se pone rojo y
# alguien decide. Los documentos que lo dicen: 00-MAESTRO.md §3,
# 11-REVISION-FINAL.md y README.md.
DESACUERDO = {
    "carga del cliente": (carga, 4265),
    "horas de carga": (round(carga / 60), 71),
    "evidencias": (evid, 69),
    "entrenadores nombrados en README y MAESTRO": (len(seed["agentes"]), 8),
}
for que, (en_el_seed, en_la_prosa) in DESACUERDO.items():
    if en_el_seed == en_la_prosa:
        avisos.append(f"{que}: la prosa y el seed ya coinciden ({en_el_seed}). "
                      "Sacar la fila de DESACUERDO.")
    elif en_el_seed != {"carga del cliente": 3375, "horas de carga": 56,
                        "evidencias": 87,
                        "entrenadores nombrados en README y MAESTRO": 9}[que]:
        errores.append(f"{que}: el seed dice {en_el_seed} y el desacuerdo declarado "
                       f"era contra {en_la_prosa}. Se movió un lado: decidir cuál "
                       "manda y corregir el otro.")

# ── 6 · contradicciones conocidas que no pueden volver ──────────────────────
prohibidas = [
    (r"Nueve grados", "el conteo viejo de cinturones"),
    (r"cuarenta y tres evidencias", "el conteo viejo de evidencias"),
    (r"ochenta horas|Ochenta horas", "la estimación vieja de carga"),
    (r"75 sesiones", "el conteo viejo de sesiones"),
]
# 10-DISENO y 11-REVISION citan los valores viejos a propósito, para corregirlos
for rel in ["00-MAESTRO.md","01-PIEZAS.md","03-CINTURONES.md","04-PROTOCOLO.md",
            "README.md","camino/MES-1.md","camino/MES-2.md",
            "camino/MES-3.md","datos/09-ESQUEMA.md"]:
    txt = leer(rel)
    for pat, que in prohibidas:
        if re.search(pat, txt):
            errores.append(f"{rel}: reapareció {que}")

# ── salida ──────────────────────────────────────────────────────────────────
print(f"jornadas {len(seed['jornadas'])} · piezas {len(seed['piezas'])} · "
      f"tutoriales {len(seed['tutoriales'])} · evidencias {evid} · "
      f"carga {carga} min ≈ {round(carga/60,1)} h")
for a in avisos:
    print(f"  aviso · {a}")
if errores:
    print(f"\n✗ {len(errores)} problemas:")
    for e in errores:
        print(f"  · {e}")
    sys.exit(1)
print("\n✓ el paquete cierra")
