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

for j in seed["jornadas"]:
    for c in j["piezas"]:
        if c not in {p["codigo"] for p in seed["piezas"]}:
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
        errores.append(f"pieza {p['codigo']} no se usa en ninguna jornada")
    elif usada[p["codigo"]] != p["dia"]:
        errores.append(
            f"pieza {p['codigo']}: catálogo dice día {p['dia']}, "
            f"jornadas la usan el {usada[p['codigo']]}")

# ── 3 · cada agente se abre en su día ───────────────────────────────────────
for a in seed["agentes"]:
    j = next((x for x in seed["jornadas"] if x["dia"] == a["dia"]), None)
    if not j:
        errores.append(f"agente {a['id']}: no hay jornada el día {a['dia']}")

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

ag_md = leer("agentes/02-AGENTES.md")
for a in seed["agentes"]:
    if a["nombre"] not in ag_md:
        errores.append(f"02-AGENTES.md no nombra {a['nombre']}")
    f = f"agentes/prompts/{'%02d' % (seed['agentes'].index(a)+1)}-{a['id']}.md"
    if not os.path.exists(os.path.join(RAIZ, f)):
        errores.append(f"falta el prompt suelto {f}")

# ── 5 · los números declarados en prosa ─────────────────────────────────────
carga = sum(j["minutos"] for j in seed["jornadas"])
evid = sum(len(j["evidencias"]) for j in seed["jornadas"])
minutos_piezas = sum(p["minutos"] for p in seed["piezas"])

esperado = {
    "4.265": carga == 4265,
    "71 horas": round(carga/60) == 71,
    "69 evidencias": evid == 69,
    "279 minutos de piezas": minutos_piezas == 279,
    "43 piezas": len(seed["piezas"]) == 43,
    "21 tutoriales": len(seed["tutoriales"]) == 21,
    "11 cinturones": len(seed["cinturones"]) == 11,
    "8 agentes": len(seed["agentes"]) == 8,
    "9 frenos": len(seed["frenos"]) == 9,
    "91 jornadas": len(seed["jornadas"]) == 91,
}
for k, ok in esperado.items():
    if not ok:
        errores.append(f"el total '{k}' ya no coincide con el seed")

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
