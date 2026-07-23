#!/usr/bin/env python3
"""
auditoria.py — LA BATERÍA COMPLETA DE TCD.
Regla de la casa: ningún ZIP sale sin esto en verde.
Corre: python3 auditoria.py   (desde la raíz del repo, con node_modules instalado)
"""
import re, glob, subprocess, sys
from collections import defaultdict

F = 0
def check(nombre, ok, detalle=''):
    global F
    print(('  ✓ ' if ok else '  ✗ ') + nombre + (f' — {detalle}' if detalle and not ok else ''))
    if not ok: F += 1
def rd(f): return open(f, encoding='utf-8', errors='replace').read()

print('══ 1) COMPILACIÓN ══')
r = subprocess.run(['npx','tsc','--noEmit'], capture_output=True, text=True)
errs = len(re.findall(r'error TS', r.stdout + r.stderr))
check('tsc sin errores', errs == 0, f'{errs} errores')

print('══ 2) SEED ══')
s = rd('src/lib/roadmapSeed.ts')
pos = [(m.group(1), m.start()) for m in re.finditer(r"\n        codigo: '(P[\w\.]+)',", s)]
cods = [c for c,_ in pos]
check(f'{len(cods)} tareas, sin duplicadas', len(cods) == len(set(cods)))
check('sin órdenes decimales', not re.findall(r"orden: \d+\.\d+", s))
dd = defaultdict(list)
for k,(cod,i) in enumerate(pos):
    fin = pos[k+1][1] if k+1 < len(pos) else len(s)
    v = s[i:fin]
    o = re.search(r"\n[ \t]*orden: (\d+),", v); d = re.search(r"\n[ \t]*dia_asignado: (\d+),", v)
    dd[cod.split('.')[0]].append((int(o.group(1)) if o else -1, int(d.group(1)) if d else 0, cod))
prob = []
for p, ts in dd.items():
    ts.sort(); ords = [t[0] for t in ts]
    if -1 in ords: prob.append(f'{p}: sin campo orden')
    if len(ords) != len(set(ords)): prob.append(f'{p}: colisión')
    if any(ts[i][1] and ts[i-1][1] and ts[i][1] < ts[i-1][1] for i in range(1,len(ts))): prob.append(f'{p}: desfase día/orden')
check('órdenes coherentes en los 8 pilares', not prob, '; '.join(prob))
sup = rd('src/lib/supabase.ts')
m = re.search(r"export type MetaCodigo\s*=([\s\S]{0,5000}?);", sup)
falt = set(cods) - set(re.findall(r"'(P[\w\.]+)'", m.group(1)))
check('MetaCodigo completo', not falt, str(sorted(falt)))

print('══ 3) HERRAMIENTAS ══')
h = rd('src/lib/herramientas.ts')
cat = set(re.findall(r"id: '(H-[\w\.]+)'", h))
usadas = set(re.findall(r"herramienta_id: '([^']+)'", s))
check('todas las usadas existen en el catálogo', not (usadas - cat), str(sorted(usadas - cat)))

print('══ 4) COMPONENTES ══')
todo = {f: rd(f) for f in glob.glob('src/**/*.ts*', recursive=True)}
todos_str = ''.join(todo.values())
huerf = []
for f in glob.glob('src/components/**/*.tsx', recursive=True) + glob.glob('src/pages/*.tsx'):
    n = f.split('/')[-1].replace('.tsx','')
    if n in ('App','main'): continue
    if not re.search(r'\b' + re.escape(n) + r'\b', todos_str.replace(rd(f), '')): huerf.append(n)
check('sin componentes huérfanos', not huerf, str(huerf))
rotas = [m.group(0) for src in todo.values() for m in re.finditer(r"from '[^']*/(SesionPasos|TaskDetailModal|Liga|Red|ModoHueco|Plan|Oferta|Onboarding)'", src)]
check('sin imports a componentes borrados', not rotas, str(rotas[:3]))

print('══ 5) DATOS (localStorage productor↔consumidor) ══')
claves = defaultdict(lambda: {'g': set(), 's': set()})
for f, src in todo.items():
    for m in re.finditer(r"localStorage\.(getItem|setItem)\('(tcd_[\w-]+)'", src):
        claves[m.group(2)]['g' if m.group(1)=='getItem' else 's'].add(f.split('/')[-1])
LEGADO_OK = {'tcd_racha','tcd_diary_weekly','tcd_pacto','tcd_campana_objetivo',
             'tcd_metrics_v2','tcd_diario_v2',   # fallbacks legítimos (v3 || v2)
             'tcd_ultima_sesion_v1'}             # se escribe vía constante KEY_ULTIMA
mismatch = [k for k,v in claves.items() if v['g'] and not v['s'] and k not in LEGADO_OK]
check('sin claves leídas que nadie escribe', not mismatch, str(mismatch))

fragiles = []
for f, src in todo.items():
    if f.endswith('lib/supabase.ts'): continue
    if re.search(r"onConflict", src): fragiles.append(f.split('/')[-1])
check('sin upserts frágiles (bomba 42P10)', not fragiles, str(fragiles))

print('══ 6) COPY ══')
cf = {f: src for f, src in todo.items() if 'Admin' not in f and 'lib/agents/' not in f
      and not any(x in f for x in ['coachPrompt','mentorPanelPrompt','vozLocalizada','voz-javo','adn-context','coachConversation',
          'TasksPipeline','TaskModal','MigrationWizard','TaskDescriptionEditor','TaskComments','components/editor/'])}
VOS = re.compile(r"(?<![a-záéíóúñ])(tenés|podés|querés|entrá|tocá|revisá|esperá|pegá|volvé|mandá|cargá|fijate|acordate)(?![a-záéíóúñ])")
vos = []
for f, src in cf.items():
    if 'roadmapSeed' in f:
        for p in re.findall(r"coach_instruccion: '[^']*'", src): src = src.replace(p, '')
    for m in VOS.finditer(src):
        ctx = src[max(0,m.start()-70):m.start()]
        if '*' not in ctx and '//' not in ctx: vos.append(f"{f.split('/')[-1]}:{m.group(0)}")
check('voseo user-facing = 0', not vos, str(vos[:4]))
sb = [f.split('/')[-1] for f, src in cf.items() for m in re.finditer(r"['\">][^'\"<>\n]{0,60}Semana Blanca", src) if '*' not in m.group(0)]
check('"Semana Blanca" customer-facing = 0', not sb, str(sb))
AVATAR = re.compile(r'(miedo a cobrar|ya lo sab[ií]as|te da miedo cobrar|llegar a fin de mes)', re.I)
av = [f.split('/')[-1] for f, src in cf.items() if AVATAR.search(src)]
check('regla de avatar (la brecha, nunca la culpa)', not av, str(av))

print('══ 7) UI ══')
botones = [f"{f.split('/')[-1]}" for f, src in todo.items() if f.endswith('.tsx')
           for m in re.finditer(r"<button(?![^>]*onClick)(?![^>]*onMouseDown)(?![^>]*type=\"submit\")[^>]*>", src)]
check('sin botones sin acción', not botones, str(botones[:4]))

print()
if F == 0:
    print('════ BATERÍA EN VERDE — el ZIP puede salir ════')
else:
    print(f'════ {F} FALLOS — NO EMPAQUETAR ════'); sys.exit(1)
