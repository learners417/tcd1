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

# ── Ayudante: ¿una tab del Admin está en sus 5 superficies? ─────────────
# Se comprueba PERTENENCIA al array, nunca una cadena con el corchete
# pegado: anclar a la posición hizo que agregar una tab después rompiera
# el chequeo de la anterior. Pasó tres veces (plata, motor, hoy).
def _tab_completa(tab: str, titulo: str) -> bool:
    _a = rd('src/pages/Admin.tsx')
    _m = re.search(r'VALID_MAIN_TABS: MainTab\[\] = \[(.*?)\]', _a, re.S)
    en_array = bool(_m) and f"'{tab}'" in _m.group(1)
    return (f"| '{tab}'" in _a and en_array and f"id: '{tab}'" in _a
            and titulo in _a and f"mainTab === '{tab}'" in _a)


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

guiones = rd('src/lib/sesionesGuiadas.ts')
player = rd('src/components/SesionGuiadaPlayer.tsx')
tipos_input = set(re.findall(r"tipo: '(\w+)'", guiones)) - {'intro', 'ritual', 'cierre'}
bloque_red = player[player.find('CONSIGNA_POR_TIPO'):player.find('CONSIGNA_POR_TIPO') + 1200]
sin_red = [t for t in tipos_input if (t + ':') not in bloque_red]
check('ningún paso puede quedar sin consigna', not sin_red, str(sorted(sin_red)))

SESION_FILES = ['SesionGuiadaPlayer.tsx', 'TaskCoach.tsx', 'TaskHerramientaIA.tsx', 'TaskVideo.tsx', 'SesionViva.tsx']
fugas = []
for f, src in todo.items():
    if f.split('/')[-1] not in SESION_FILES: continue
    for m in re.finditer(r"onClick=\{[^}]{0,120}(setCurrentPage\('coach'\)|onNavigateToCoach\(\)|onMentor\(\))", src):
        fugas.append(f.split('/')[-1])
check('ninguna sesión expulsa al Mentor', not fugas, str(sorted(set(fugas))))

# Toda página nombrada en un título o en el buscador tiene que existir en el router
app_src = rd('src/App.tsx')
rutas = set(re.findall(r"currentPage === '(\w+)'", app_src))
tb = rd('src/components/Topbar.tsx')
nombradas = set(re.findall(r"^  (\w+): '", tb, re.M)) | set(re.findall(r"id: '(\w+)', label:", tb))
fantasmas = sorted(p for p in nombradas - rutas if p not in ('ajustes', 'salir'))
check('sin páginas fantasma en títulos/buscador', not fantasmas, str(fantasmas))

# La lib madre de anuncios: 18 fórmulas, ninguna incompleta
fa = rd('src/lib/formulasAnuncios.ts')
import re as _re
ids = _re.findall(r"\n    id: (\d+),", fa)
campos_ok = all(fa.count(c) >= 18 for c in ['cuando:', 'porque:', 'estructura: [', 'caption:', 'ejemplo:', 'errorComun:'])
familias = _re.findall(r"familia: '(\w+)'", fa)
reparto = (familias.count('piedras'), familias.count('dolor_historia'), familias.count('resultado_metodo'), familias.count('acompana'))
check('las 18 fórmulas completas (6 campos c/u, familias 6+5+6+1)', len(ids) == 18 and campos_ok and reparto == (6, 5, 6, 1), f'ids={len(ids)} campos={campos_ok} reparto={reparto}')

# La estrategia de cupos, sin restos del sistema viejo en lo que ve el cliente
VIEJO_ADS = ['CTWA', 'follow-me', 'agente de WhatsApp', 'lead magnet']
restos = []
for f, src in todo.items():
    # preactivacionSteps es el checklist interno del equipo: ahí el agente de
    # WhatsApp SÍ existe como activo de operación (no como camino de anuncios).
    if any(x in f for x in ['Admin', 'estrategia.ts', 'preactivacionSteps']): continue
    for pal in VIEJO_ADS:
        if pal in src: restos.append(f.split('/')[-1] + ':' + pal)
check('sin restos del sistema de anuncios viejo', not restos, str(sorted(set(restos))[:6]))

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

# ── 6.4 · voseo en TODO el repo, no solo en el copy visible ────────────
# La lente vieja miraba solo texto user-facing y dejo pasar los prompts de
# los 8 entrenadores: hablaban en argentino a clientes de toda LATAM y
# Espana. La app va en castellano neutro (tu/tienes). vozLocalizada.ts se
# excluye a proposito: documenta ambos registros.
_BLANCO = {'más','quizás','estás','jamás','atrás','detrás','demás','además','país',
 'después','través','revés','cortés','interés','inglés','francés','mes','vas','das',
 'tras','análisis','crisis','compás','estés','estrés','clichés',
 # futuros IRREGULARES de tuteo — correctos, no voseo
 'sabrás','podrás','tendrás','harás','querrás','vendrás','pondrás','saldrás',
 'dirás','valdrás','cabrás'}
_vos = []
for _f, _src in todo.items():
    if _f.endswith('vozLocalizada.ts'):
        continue
    for _w in re.findall(r'\b\w+(?:ás|és|ís)\b', _src):
        _wl = _w.lower()
        # -arás/-erás/-irás es futuro de TUTEO y es correcto (sabrás, podrás)
        if _wl in _BLANCO or re.search(r'(arás|erás|irás)$', _wl):
            continue
        _vos.append(f"{_f.split('/')[-1]}:{_wl}")
    for _w in re.findall(r'\b(?:vos|sos|contame|decime|escribime|acordate|fijate|pasame|mandame|mostrame|compartilo|agendate)\b', _src, re.I):
        _vos.append(f"{_f.split('/')[-1]}:{_w.lower()}")
check('voseo = 0 en TODO el repo (prompts incluidos)', not _vos, '; '.join(sorted(set(_vos))[:5]))

# ── 6.5 · Todo endpoint de IA pasa por el enrutador ────────────────────
# Antes había una cadena copiada en cada endpoint: DeepSeek→Claude escrita
# dos veces. Si mañana alguien agrega api/ai/otro.ts con su propia cadena,
# ese endpoint queda fuera del enrutado, fuera del registro de costo y
# fuera de la elección de modelo por tarea. La lente lo caza acá.
import os as _os6
_ENDPOINTS_IA = [
    f for f in _os6.listdir('api/ai')
    if f.endswith('.ts') and f not in ('image.ts', 'describe-image.ts')
] if _os6.path.isdir('api/ai') else []
_sin_router = []
for _f in _ENDPOINTS_IA:
    _src = rd(f'api/ai/{_f}')
    # si llama a un proveedor de texto, tiene que usar el enrutador
    if ('callClaude' in _src or 'callDeepSeek' in _src) and 'rutaDe(' not in _src:
        _sin_router.append(_f)
check('todo endpoint de IA de texto usa el enrutador por tarea',
      not _sin_router, '; '.join(_sin_router))

# El enrutador es el único lugar donde se decide el modelo.
_router = rd('api/_lib/router.ts') if _os6.path.exists('api/_lib/router.ts') else ''
check('el enrutador declara las 5 tareas',
      all(f"  {t}: {{" in _router for t in
          ('guion', 'chat', 'estructura', 'auditoria', 'general')))
check('cada ruta explica por qué ese modelo',
      _router.count('porQue:') >= 5)
check('los precios estimados quedan marcados como tales',
      'verificado: false' in _router)

# ── 6.6 · El freno del cliente y el del servidor dicen lo mismo ────────
# Los topes viven en dos lados: src/lib/planes.ts avisa en pantalla y
# api/_lib/uso-server.ts frena de verdad. Si se separan, el cliente ve un
# número y el servidor aplica otro — y eso es peor que no avisar nada.
import re as _re6
import os as _os66
if _os66.path.exists('api/_lib/uso-server.ts'):
    _srv = rd('api/_lib/uso-server.ts')
    _cli = rd('src/lib/planes.ts')
    def _num(txt, patron):
        m = _re6.search(patron, txt)
        return int(m.group(1)) if m else None
    _pares = [
        ('mentor', _num(_srv, r"mentor:\s*(\d+)"), _num(_cli, r'TOPE_MENTOR_SEMANAL = (\d+)')),
        ('agentes', _num(_srv, r"agentes:\s*(\d+)"), _num(_cli, r'TOPE_AGENTE_SEMANAL = (\d+)')),
    ]
    _desalineados = [f'{k}: servidor {a} vs cliente {b}' for k, a, b in _pares if a != b]
    check('el tope que avisa el cliente es el que aplica el servidor',
          not _desalineados, '; '.join(_desalineados))
    check('todo endpoint de IA de texto pasa por el guardián',
          all('guardarLlamada' in rd(f'api/ai/{f}')
              for f in ('generate.ts', 'stream.ts')))
    check('el guardián distingue crédito de tope',
          'FEATURES_CON_CREDITO' in _srv and 'FEATURES_CON_TOPE' in _srv)
    check('el freno degrada dejando pasar, nunca bloqueando por infraestructura',
          'se deja pasar' in _srv)

# ── 6.7 · Nada se cuelga ni se cobra sin entregar ──────────────────────
# Tres cosas que no se ven compilando y dejan al cliente pagando por aire
# o mirando una pantalla girando.
import os as _os67
if _os67.path.exists('src/lib/aiProvider.ts'):
    _ai = rd('src/lib/aiProvider.ts')
    check('las llamadas de IA tienen corte duro (AbortController)',
          'AbortController' in _ai and 'TIMEOUT_MS' in _ai,
          'sin timeout, un modelo colgado deja la pantalla girando para siempre')
    check('no se reintenta lo que ya es una decisión o ya se reintentó',
          'e.status === 402' in _ai and 'e.status === 502' in _ai,
          'reintentar un 502 multiplica las llamadas al modelo por un solo clic')
    _guard = rd('api/_lib/guardian.ts') if _os67.path.exists('api/_lib/guardian.ts') else ''
    check('existe la devolución de crédito cuando nadie entregó nada',
          'deshacerCobro' in _guard)
    check('los dos endpoints devuelven el crédito si falla la cadena',
          all('deshacerCobro' in rd(f'api/ai/{f}') for f in ('generate.ts', 'stream.ts')))
    check('una respuesta vacía se trata como falla, no como éxito',
          all('respuesta vacía del proveedor' in rd(f'api/ai/{f}')
              for f in ('generate.ts', 'stream.ts')))

    # Ningún catch alrededor de una llamada de IA puede quedar mudo.
    import re as _re67, glob as _g67
    _mudos = []
    for _f in _g67.glob('src/**/*.ts*', recursive=True):
        _src = rd(_f)
        if 'generateText(' not in _src and 'streamText(' not in _src:
            continue
        for _m in _re67.finditer(r'(generateText|streamText)\(', _src):
            _v = _src[_m.start(): _m.start() + 2500]
            _c = _re67.search(r'\}\s*catch\s*(\([^)]*\))?\s*\{\s*/\*\s*noop\s*\*/\s*\}', _v)
            if _c and 'localStorage' not in _v[max(0, _c.start() - 200):_c.start()]:
                _mudos.append(_f.split('/')[-1])
            break
    check('ninguna llamada de IA falla en silencio', not _mudos, '; '.join(sorted(set(_mudos))))

# El techo de la función tiene que estar declarado y por encima del corte del cliente.
if _os67.path.exists('vercel.json'):
    import json as _j67
    _v = _j67.loads(rd('vercel.json'))
    _fns = _v.get('functions', {})
    check('los endpoints de IA declaran su techo de duración',
          all(k in _fns for k in ('api/ai/generate.ts', 'api/ai/stream.ts')),
          'sin maxDuration, una generación larga muere con 504 de la plataforma')
    _ai2 = rd('src/lib/aiProvider.ts')
    _m67 = _re67.search(r'TIMEOUT_MS = ([\d_]+)', _ai2) if _os67.path.exists('src/lib/aiProvider.ts') else None
    _corte = int(_m67.group(1).replace('_', '')) / 1000 if _m67 else None
    _techo = _fns.get('api/ai/generate.ts', {}).get('maxDuration')
    check('el cliente corta ANTES que la plataforma',
          _corte is not None and _techo is not None and _corte < _techo,
          f'corte {_corte}s vs techo {_techo}s')

# ── 6.8 · El gasto se mide y el plan lo decide el servidor ─────────────
import os as _os68
if _os68.path.exists('api/_lib/gasto-server.ts'):
    _g68 = rd('api/_lib/gasto-server.ts')
    _guard68 = rd('api/_lib/guardian.ts')
    check('el plan se lee de la base, no de lo que dice el navegador',
          "from('profiles')" in _g68 and 'plan_comercial' in _g68,
          'el plan decide cuánto puede gastar: no puede venir del cliente')
    check('sin plan conocido se asume el más chico, nunca el más grande',
          "PLAN_POR_DEFECTO: PlanComercial = 'blanco'" in _g68)
    check('el techo de gasto se aplica antes que cualquier otro freno',
          _guard68.index('verificarTecho') < _guard68.index("freno === 'credito'"))
    check('el costo se anota DESPUÉS del éxito, no antes',
          all('anotarCosto' in rd(f'api/ai/{f}') for f in ('generate.ts', 'stream.ts')))
    check('el tope del plan blanco se cuenta en el servidor',
          'verificarTopeBlanco' in rd('api/_lib/uso-server.ts')
          and 'verificarTopeBlanco' in _guard68,
          'antes vivía en localStorage y se esquivaba borrándolo')
    check('el medidor degrada dejando pasar, nunca frenando por infraestructura',
          _g68.count('se deja pasar') >= 2)

# ── 6.9 · El motor se puede mirar ──────────────────────────────────────
# Sin panel, quien mantenga la app optimiza a ciegas: no sabe qué modelo se
# usa, qué cuesta, qué falla ni qué tarda.
import os as _os69
if _os69.path.exists('src/components/admin/PanelMotorIA.tsx'):
    _pan = rd('src/components/admin/PanelMotorIA.tsx')
    _adm69 = rd('src/pages/Admin.tsx')
    check('el panel del motor está en las 5 superficies del Admin',
          _tab_completa('motor', "motor: 'Motor de IA"))
    check('el panel responde las 4 preguntas (uso, costo, fallas, latencia)',
          all(k in _pan for k in ('panel_ia_por_modelo', 'panel_ia_fallas',
                                  'panel_ia_total', 'ms_p95')))
    check('el panel dice qué hacer cuando no hay datos, en vez de verse vacío',
          'sala-de-mando.sql' in _pan,
          'un panel vacío parece un bug; tiene que decir que falta correr el SQL')
    check('el panel avisa cuándo el costo está calculado con precios estimados',
          'estimados' in _pan)
    _ga = rd('api/_lib/gasto-server.ts')
    check('se anotan también las llamadas que FALLAN',
          'ok: false' in rd('api/ai/generate.ts') and 'ok?: boolean' in _ga,
          'un modelo que falla el 30% no se ve en la factura, se ve en clientes trabados')
    check('se mide cuánto tarda cada llamada',
          'const t0 = Date.now()' in rd('api/ai/generate.ts')
          and 'const t0 = Date.now()' in rd('api/ai/stream.ts'))

# ── 6.10 · La app elige, no ofrece un menú ─────────────────────────────
# "Las opciones matan al principiante": el cliente de $1.000 no tiene a
# nadie al lado que le explique cuál de las 18 fórmulas le sirve.
import os as _os610
_fa = rd('src/lib/formulasAnuncios.ts')
_con = rd('src/components/campanas/ConstructorAnuncios.tsx')
check('existe el recomendador de fórmulas',
      'export function recomendarFormulas' in _fa)
check('cada recomendación explica POR QUÉ esa y no otra',
      'porQue:' in _fa and _fa.count('porQue:') >= 8)
check('el Constructor arranca con lo recomendado, no con un default fijo',
      'recomendarFormulas(senales)' in _con
      and "{ piedras: 1, dolor_historia: 15, resultado_metodo: 10 }" not in _con,
      'el default viejo era el mismo para todos sin mirar el ADN')
check('se le explica qué fórmulas todavía no le sirven y qué le falta',
      'formulasBloqueadas' in _fa and 'formulasBloqueadas' in _con)
check('el menú de las 18 sigue disponible, pero detrás de una puerta',
      'Prefiero elegirlas yo' in _con)
check('Familia3 se define en un solo lugar',
      _fa.count('export type Familia3') == 1
      and 'type Familia3 = Exclude' not in _con)

# ── 6.11 · El compilador de verdad, y la auditoría que bloquea ─────────
import json as _j611, re as _re611
_tsc = _j611.loads(_re611.sub(r'//.*', '', rd('tsconfig.json')))
check('TypeScript corre en modo estricto',
      _tsc.get('compilerOptions', {}).get('strict') is True,
      'sin strict, acceder a algo nulo compila igual y revienta en producción')
_sb = rd('src/lib/supabase.ts')
check('existe db(): el cliente de base garantizado',
      'export function db()' in _sb,
      'supabase es null si faltan las variables de entorno')
check('el Admin no toca supabase sin garantía',
      not _re611.search(r'\bsupabase\.(from|rpc|storage|channel)\b', rd('src/pages/Admin.tsx')))

_cr = rd('src/lib/criticoPieza.ts') if _os67.path.exists('src/lib/criticoPieza.ts') else ''
check('el crítico usa la tarea auditoria, no la de escribir',
      "tarea: 'auditoria'" in _cr,
      'un modelo aprueba su propio texto casi siempre: el que juzga tiene que ser otro')
check('el crítico escribe lo que falta, no solo lo señala',
      'correcciones' in _cr and 'linea' in _cr)
check('el crítico revisa además las reglas de publicación',
      'REGLAS_META' in _cr and 'alertasMeta' in _cr)
check('el crítico nunca deja al sanador sin veredicto',
      'const base = auditarPieza(texto)' in _cr and 'correcciones: null' in _cr)
_con611 = rd('src/components/campanas/ConstructorAnuncios.tsx')
check('no se puede copiar una pieza que no está lista',
      'disabled={!listaParaPublicar}' in _con611)
check('el hook se juzga de verdad, no se da por presente',
      'hook: /./' not in rd('src/lib/formulasAnuncios.ts'),
      'antes cualquier primera línea aprobaba, incluidas las genéricas')

# ── 6.11 · La auditoría bloquea de verdad ──────────────────────────────
_cri = rd('src/lib/criticoPieza.ts') if _os610.path.exists('src/lib/criticoPieza.ts') else ''
_mon = rd('src/components/campanas/MontajeCupos.tsx')
check('el crítico usa un modelo DISTINTO del que escribió la pieza',
      "tarea: 'auditoria'" in _cri,
      'un modelo aprueba su propio texto casi siempre')
check('las correcciones se aplican DONDE van, no siempre al final',
      "posicion: 'inicio' | 'final'" in _cri
      and "posicion === 'inicio'" in _con,
      'un gancho pegado al final deja el anuncio al revés')
check('el candado de los anuncios se verifica solo, no se tilda a mano',
      'estadoDeLasPiezas' in _mon and "c.id !== 'anuncios'" in _mon,
      'detrás de esa casilla se enciende una campaña con dinero real')
check('el candado dice QUÉ le falta a cuál pieza',
      'estadoPiezas.pendientes' in _mon)

# ── 6.12 · Las políticas de publicación se aplican, no solo se escriben ─
# Lo que está en juego es la cuenta publicitaria del sanador: recuperarla
# tarda semanas y a veces no se recupera. Las reglas ya se le contaban al
# modelo en el prompt, pero eso no es aplicarlas.
check('existe el chequeo determinista de políticas',
      'export function revisarPoliticas' in _fa
      and 'export function puedePublicarse' in _fa,
      'contarle las reglas al modelo no es lo mismo que verificarlas')
check('cada alerta dice CÓMO se escribe lo mismo sin romper la regla',
      _fa.count('comoSeArregla:') >= 7,
      'señalar el problema sin dar la salida deja al cliente trabado')
check('las políticas bloquean el copiado en el Constructor',
      'revisarPoliticas' in _con and 'bloqueantes.length === 0' in _con)
check('el candado del montaje mira políticas Y no solo ingredientes',
      'revisarPoliticas' in _fa
      and 'no se puede publicar' in _fa,
      'una pieza puede tener los 8 ingredientes y aun así ser irpublicable')
check('se distingue lo que bloquea de lo que solo hay que revisar',
      "'bloquea' | 'revisa'" in _fa)

# ── 6.13 · El guion llega como carrusel, no como bloque de texto ───────
check('existe el armado de láminas',
      'export function armarCarrusel' in _fa)
check('el guion se parte solo, sin una segunda llamada al modelo',
      'PANTALLA' in _fa and 'armarCarrusel' in _con,
      'el prompt ya pedía PANTALLA N: — faltaba leerlo')
check('cada lámina se copia sola',
      'carrusel.laminas.map' in _con and 'writeText(l.texto)' in _con)
check('se avisa cuando una lámina no entra en el teléfono',
      'LARGO_MAX_LAMINA' in _fa and 'muy larga para el teléfono' in _con)
check('la palabra clave se exige en el cierre o en el post',
      'palabraPresente' in _fa and 'palabraClave' in _fa,
      'sin la palabra, el comentario no dispara el mensaje y la campaña queda muda')
check('el candado del montaje también la exige',
      'falta tu palabra' in _fa)

# ── 6.14 · El paquete para encender está en un solo lugar ──────────────
# Las piezas de una campaña viven repartidas: los anuncios en el Constructor,
# la palabra en el brief, el DM y la página en sesiones distintas del Camino.
# Recorrer cinco pantallas y armar el rompecabezas a mano es justo lo que un
# cliente de $1.000 no puede hacer solo.
import os as _os614
if _os614.path.exists('src/lib/paqueteCampana.ts'):
    _paq = rd('src/lib/paqueteCampana.ts')
    check('existe el armado del paquete', 'export function armarPaquete' in _paq)
    check('el paquete NO genera nada nuevo, junta lo que existe',
          'generateText' not in _paq,
          'volver a generar lo ya sellado gastaría IA y daría otro texto')
    check('cada pieza dice DÓNDE se consigue si falta', 'donde:' in _paq)
    check('se distingue lo obligatorio de lo opcional', 'obligatoria' in _paq)
    check('una pieza con problema se muestra igual, no se esconde',
          "estado: problemas.length ? 'revisar' : 'listo'" in _paq)
    check('el paquete está en el Constructor con copiar todo y copiar por pieza',
          'armarPaquete' in _con and 'paquete.textoCompleto' in _con
          and 'writeText(x.contenido)' in _con)

# ── 6.15 · Cada candado del montaje lleva lo que lo resuelve ───────────
# Antes eran ocho casillas y nada más. Un cliente que no sabe instalar un
# píxel tildaba igual, o se quedaba trabado sin a quién preguntarle.
_mon15 = rd('src/components/campanas/MontajeCupos.tsx')
_tut15 = rd('src/lib/tutorialesTecnicos.ts')
import re as _re15
_claves = set(_re15.findall(r"^  '([^']+)': \{", _tut15, _re15.M))
_usadas = set(_re15.findall(r"tutorial: '([^']+)'", _mon15))
check('todo tutorial que referencia el montaje existe de verdad',
      _usadas <= _claves, f'inexistentes: {sorted(_usadas - _claves)}')
check('el montaje pide el tutorial por CLAVE, no por código',
      'clave={c.tutorial}' in _mon15 and 'codigo={c.tutorial}' not in _mon15,
      'dos tutoriales comparten codigo P4.5: por código se muestran los dos')
check('los candados nombran la sesión del Camino donde se sellan',
      _mon15.count("sesion: '") >= 4)
check('el paso a paso no se traga el clic del candado',
      'onClick={(e) => e.stopPropagation()}' in _mon15,
      'abrir el tutorial marcaría el candado sin querer')

# ── 6.16 · La carga se puede hacer desde el teléfono ───────────────────
# Es lo que el cliente hace todos los días: si cuesta, deja de cargar, y sin
# datos todo el resto del sistema queda ciego.
_tab16 = rd('src/components/campanas/TableroCupos.tsx')
check('la carga semanal va de a un dato por pantalla',
      'PASOS[paso]' in _tab16 and 'setPaso' in _tab16,
      '12 casillas en una grilla de 4 columnas no se cargan en un teléfono')
check('el orden sigue cómo se leen los números en el administrador',
      "donde: 'Columna" in _tab16,
      'se lee por columna, no anuncio por anuncio: preguntar así evita ir y volver')
check('cada paso dice DÓNDE está ese número',
      _tab16.count('donde:') >= 4)
check('los campos numéricos abren el teclado numérico',
      _tab16.count('inputMode=') >= 2)
check('el botón de guardar confirma que guardó',
      "guardado ? 'Guardado" in _tab16,
      'un botón mudo hace que el cliente cargue dos veces o ninguna')
check('se guarda solo mientras escribe, no al final',
      'Se guarda solo a medida que escribes' in _tab16)
check('la tabla completa sigue disponible para quien la prefiera',
      'Ver la tabla' in _tab16)

# ── 6.17 · Las reglas deciden solas ────────────────────────────────────
# Estaban escritas como TEXTO: "el ganador queda corriendo, los otros dos se
# apagan" era una frase que nadie leía, y semanasRefresh un dato que nadie
# usaba. Decidir seguía siendo trabajo de una persona con criterio.
import os as _os17
if _os17.path.exists('src/lib/decidirCampana.ts'):
    _dec = rd('src/lib/decidirCampana.ts')
    _tab17 = rd('src/components/campanas/TableroCupos.tsx')
    check('existe el motor de decisión', 'export function decidirCampana' in _dec)
    check('el motor NO usa IA: es determinista',
          'generateText' not in _dec and 'aiProvider' not in _dec,
          'un modelo que opina sobre números responde distinto el martes y el jueves')
    check('la regla del creativo muerto existe de verdad',
          'DIAS_PARA_MUERTO' in _dec and "estado: 'muerto'" in _dec)
    check('un anuncio muerto se apaga aunque esté en medición',
          _dec.index('DIAS_PARA_MUERTO') < _dec.index('if (enMedicion)'),
          'esperar 14 días con cero conversaciones es tirar 11 de presupuesto')
    check('una conversación cara NO mata sola a un anuncio que convierte',
          'a.agendas === 0 && a.conversaciones >= 10' in _dec,
          'el tope de UMBRALES es de mercado; un ticket alto sostiene conversaciones más caras')
    check('semanasRefresh dejó de ser un dato muerto',
          'semanasRefresh' in _dec and 'tocaRefrescar' in _dec)
    check('hay UNA sola acción principal por día',
          'accionPrincipal' in _dec and 'decision.accionPrincipal' in _tab17)
    check('se cargan las ventas, que es lo que decide el ganador',
          "k: 'ventas'" in _tab17,
          'sin ventas el ganador solo puede decidirse por agendas')

# ── 6.17 · Las reglas deciden solas, y en un solo lugar ────────────────
# Estaban escritas como TEXTO en un objeto que nadie leía. Decidir seguía
# siendo trabajo de una persona con criterio, y el cliente de $1.000 no
# tiene esa persona al lado.
import os as _os17
if _os17.path.exists('src/lib/decidirCampana.ts'):
    _dec = rd('src/lib/decidirCampana.ts')
    check('el motor de decisión existe y es determinista',
          'export function decidirCampana' in _dec and 'generateText' not in _dec,
          'mismas cifras, misma decisión, siempre: un modelo daría otra el jueves')
    check('el muerto se apaga aunque siga en medición',
          'DIAS_PARA_MUERTO' in _dec,
          'tres días de gasto sin una conversación no es ruido')
    check('el ganador exige venta, con la agenda como respaldo declarado',
          'costoPorVenta' in _dec and 'costo por agenda' in _dec)
    check('el comentario de arriba no contradice la regla de abajo',
          'Si TODAVÍA no vendió ninguno' in _dec,
          'decía que el ganador debe haber vendido y hay un respaldo que no lo exige')
    check('hay UN solo motor de decisión en todo el repo',
          'export function decidirCampana' not in _fa,
          'duplicar criterio es peor que no tenerlo')
    check('el motor está probado con escenarios, no solo compilado',
          _os17.path.exists('scripts/prueba-decision.ts'))

# ── 6.18 · El testeo cierra el círculo y la historia no se pisa ────────
# Antes: los números de la semana vivían en UNA clave que se sobrescribía
# cada viernes. La semana pasada no existía, así que nadie podía aprender de
# una a la otra ni saber qué fórmula funciona en SU cuenta.
import os as _os18
if _os18.path.exists('src/lib/bitacoraCampana.ts'):
    _bit = rd('src/lib/bitacoraCampana.ts')
    _tab18 = rd('src/components/campanas/TableroCupos.tsx')
    check('existe la bitácora y guarda por semana',
          'export function anotarSemana' in _bit and 'semanaISO' in _bit)
    check('volver a cargar la misma semana reemplaza, no duplica',
          'fuera.has' in _bit,
          'el viernes se carga, se corrige y se vuelve a cargar')
    check('la historia no se pisa: clave propia y separada',
          "KEY_BIT = 'tcd_bitacora_campana_v1'" in _tab18
          and 'KEY_SEM' in _tab18)
    check('cada anuncio se compara contra SÍ MISMO, no contra los otros',
          'anterior.set(e.indice' in _bit)
    check('la bitácora dice qué fórmula gana en ESTA cuenta',
          'mejorFormula' in _bit and 'formulasQueFallaron' in _bit)
    check('fallar una vez no descarta una fórmula: hacen falta dos',
          'veces >= 2' in _bit,
          'descartar con un solo intento tira fórmulas que solo tuvieron mala semana')
    check('cuando hay ganador, el siguiente paso está a un toque',
          'decision.ganador !== null && onIrAnuncios' in _tab18,
          'declarar el ganador sin ofrecer qué hacer deja el círculo abierto')
    check('el Tablero puede volver al Constructor',
          'onIrAnuncios' in _tab18 and 'onIrAnuncios={onIrAnuncios}' in rd('src/components/campanas/MontajeCupos.tsx'))
    check('la bitácora está probada con escenarios',
          _os18.path.exists('scripts/prueba-bitacora.ts'))


# ── 6.19 · La Mesa de plata guarda de verdad ───────────────────────────
# Calculaba y diagnosticaba en vivo, pero al cerrar la pantalla se perdía
# todo — y la Mesa de plata del viernes no es mirar los números de hoy: es
# ver cómo se movió cada cuenta desde la semana pasada.
import os as _os19
if _os19.path.exists('src/lib/mesaPlataStorage.ts'):
    _mp = rd('src/lib/mesaPlataStorage.ts')
    _tp19 = rd('src/components/admin/TableroPlata.tsx')
    _adm19 = rd('src/pages/Admin.tsx')
    check('la Mesa de plata carga y guarda por cliente y semana',
          'export async function cargarSemana' in _mp
          and 'export async function guardarSemana' in _mp)
    check('al cambiar de cliente se trae SU semana',
          'clienteId' in _tp19 and '[clienteId, semana]' in _tp19,
          'mostrar los números del cliente anterior es la peor forma de equivocarse')
    check('un error al guardar NO limpia lo cargado',
          'Tus números siguen acá' in _tp19,
          'perder veinte minutos de carga por un problema de red los hace dejar de cargar')
    check('existe el historial por cliente', 'historialCliente' in _mp)
    check('existe la comparativa entre cuentas',
          'export async function comparativaSemana' in _mp)
    check('la comparativa ordena por DINERO EN RIESGO, no alfabético',
          'facturado * Math.min' in _mp)
    check('el que no cargó sus números sube primero',
          'sinCargar' in _mp,
          'sin datos no hay diagnóstico posible para esa cuenta')
    check('la tab tiene su propio selector de cliente',
          _adm19.count('De qué cliente') >= 1,
          'decía "elige un cliente arriba" y arriba no había nada que elegir')
    check('el total de la semana usa índice parcial, no unique con NULL',
          'sala_metricas_total_semana' in rd('sala-de-mando.sql')
          and 'where anuncio is null' in rd('sala-de-mando.sql'))

# ── 6.20 · La cola: ejecutar, no diagnosticar ──────────────────────────
# Quien la trabaja empezó hace dos meses y no sabe de pauta. Si la app le
# entrega números y espera que deduzca qué hacer, la respuesta va a ser
# preguntarle a alguien — y ese alguien es el cuello de botella que se está
# sacando.
import os as _os20
if _os20.path.exists('src/lib/colaExcepciones.ts'):
    _cola = rd('src/lib/colaExcepciones.ts')
    _cd = rd('src/components/admin/ColaDelDia.tsx')
    _adm20 = rd('src/pages/Admin.tsx')
    check('existe la cola y arma acciones, no diagnósticos',
          'export function armarCola' in _cola and 'accion:' in _cola and 'como:' in _cola)
    check('cada situación trae el mensaje listo para mandar',
          _cola.count('como:') >= 12,
          'señalar el problema sin dar la salida obliga a preguntar')
    check('una cuenta sana NO entra en la cola',
          'if (!id) continue' in _cola,
          'si aparecieran todas volvería a ser un tablero')
    check('el plan decide quién atiende',
          'function quienAtiende' in _cola and 'SEMANAS_ANTES_DE_ESCALAR' in _cola,
          'el de $1.000 tiene que costar cero minutos cuando todo va bien')
    check('lo que necesita persona va antes que lo que resuelve la app',
          "a.quien === 'la app' ? 0 : 1" in _cola)
    check('la tab Hoy está en las 5 superficies del Admin',
          _tab_completa('hoy', "hoy: 'Hoy —"))
    check('la cola es la PRIMERA tab del menú',
          _adm20.index("id: 'hoy'") < _adm20.index("id: 'clientes'"),
          'es lo primero que se abre cada día')
    check('se puede copiar el mensaje y marcar lo hecho',
          'Copiar el mensaje' in _cd and 'Ya lo hice' in _cd)
    check('cuando falta el SQL lo dice en vez de verse vacía',
          'sala-de-mando.sql' in _cd)
    check('la cola está probada con escenarios',
          _os20.path.exists('scripts/prueba-cola.ts'))

# ── 6.21 · El Admin supervisa, ya no espeja ────────────────────────────
# La tab Campañas montaba EL MISMO COMPONENTE DEL CLIENTE con su id: el
# admin veía lo que ve el cliente. Eso sirve para ayudarlo con algo puntual,
# no para saber a quién atender entre once.
import os as _os21
if _os21.path.exists('src/components/admin/Supervision.tsx'):
    _sup = rd('src/components/admin/Supervision.tsx')
    _mp21 = rd('src/lib/mesaPlataStorage.ts')
    _cola21 = rd('src/lib/colaExcepciones.ts')
    _adm21 = rd('src/pages/Admin.tsx')
    check('existe la pantalla de supervisión con todas las cuentas a la vez',
          'export async function supervision' in _mp21 and 'FilaSupervision' in _mp21)
    check('un punto por tramo de la cadena, no una tabla de números',
          "'atraccion', 'conversion', 'retencion'" in _sup)
    # El cálculo se mudó a colaExcepciones para poder probarlo: acá se
    # verifica que la supervisión lo USE, no que lo repita.
    check('lo que no cargó números va primero',
          'pesoDeLaCuenta' in _mp21 and 'PESO_SIN_DATOS' in _cola21,
          'sin datos no se puede decidir nada sobre esa cuenta')
    check('el orden pesa la insistencia, no solo lo roto',
          'semanasIgual' in _mp21 and 'semanasIgual) * 0.5' in _cola21,
          'tres semanas con el mismo problema pesa más que una')
    check('existe el contador de semanas seguidas',
          'export function contarRacha' in _cola21)
    check('la racha se corta cuando el cuello cambia',
          'if (c !== actual) break' in _cola21,
          'si el cuello se movió, el problema anterior se resolvió')
    check('una semana sana borra la racha',
          'if (!actual) return { cuello: null, semanas: 0 }' in _cola21)
    check('la cola YA USA la racha real, no un cero fijo',
          'rachasDeTodos' in rd('src/components/admin/ColaDelDia.tsx')
          and 'semanasIgual: 0,' not in rd('src/components/admin/ColaDelDia.tsx'),
          'sin esto nada escalaba nunca de la app a una persona')
    check('el contador es lógica pura y se puede probar sin la base',
          'contarRacha' in _cola21 and 'from ./supabase' not in _cola21)
    check('la tab Supervisión está en las 5 superficies',
          _tab_completa('supervision', "supervision: 'Supervisión"))

# ── 6.22 · La app empuja; la persona atiende lo que la app no pudo ─────
# El sistema de notificaciones existía completo pero NADIE LO DISPARABA
# desde el estado real de la cuenta: un cliente podía pasar tres semanas sin
# publicar y el aviso salía cuando alguien se acordaba de mirar.
import os as _os22
if _os22.path.exists('src/lib/avisosCliente.ts'):
    _av = rd('src/lib/avisosCliente.ts')
    _cd22 = rd('src/components/admin/ColaDelDia.tsx')
    _cola22 = rd('src/lib/colaExcepciones.ts')
    check('existe el planificador de avisos', 'export function planificarAvisos' in _av)
    check('el aviso se elige por el ID del cuello, no leyendo texto',
          'cuello: string;' in _cola22 and 'const clave = item.cuello;' in _av,
          'deducir el problema del texto de la situación es frágil')
    check('el mismo aviso NO sale dos veces en la misma semana',
          'ultimaSemana[id] === semana' in _av,
          'un aviso diario por el mismo motivo deja de leerse al segundo día')
    check('tras insistir sin resultado, escala en vez de repetir',
          'AVISOS_ANTES_DE_ESCALAR' in _av and 'aEscalar' in _av)
    check('lo que ya atiende una persona no se le avisa al cliente',
          "item.quien !== 'la app'" in _av,
          'sería pedirle que se ocupe de algo de lo que ya se ocupa alguien')
    check('resuelto el problema, el contador vuelve a cero',
          'export function olvidarAviso' in _av)
    check('un cuello sin aviso escrito no se inventa',
          'if (!plantilla) continue' in _av)
    check('el aviso lleva a la pantalla donde se resuelve',
          'accion_url: aviso.destino' in _av)
    check('una persona puede escribirle por el mismo canal',
          'export async function mandarMensajeDelEquipo' in _av
          and "tipo: 'admin'" in _av,
          'para el cliente no deberían sentirse como dos sistemas distintos')
    check('mandar nunca lanza: el trabajo de la persona no se pierde',
          _av.count('return false;') >= 2)
    check('la cola puede mandar el aviso dentro de la app',
          'Mandárselo en la app' in _cd22 and 'mandarLosAutomaticos' in _cd22,
          'antes viajaba por WhatsApp y se perdía entre mensajes')
    check('los avisos están probados con escenarios',
          _os22.path.exists('scripts/prueba-avisos.ts'))

# ── 6.23 · Nada que el cliente escribe se tira ─────────────────────────
# Barrido del turno 5.1. La primera versión de esta lente daba 204
# hallazgos y casi todos eran ruido — una lente que grita lobo es peor que
# ninguna, porque enseña a ignorarla. Quedó acotada a lo verificado a mano.
import re as _re23
_esc23, _lee23 = {}, set()
for _f, _s in todo.items():
    for _k in _re23.findall(r"['\"](tcd_[a-z0-9_]+)['\"]", _s):
        if _re23.search(rf"setItem\([^)]*{_re23.escape(_k)}", _s):
            _esc23.setdefault(_k, set()).add(_f.split('/')[-1])
    # Se cuentan TODAS las formas de leer que usa la app, no solo getItem:
    # ignorar safeGet o leer() daba falsos positivos.
    # `[^(]*` y no `[^>]*`: safeGet<Record<string, string>>(...) tiene dos
    # cierres de genérico y el patrón viejo cortaba en el primero.
    for _k in _re23.findall(
            r"(?:getItem|safeGet|leer|leerJSON)\w*(?:<[^(]*>)?\(\s*['\"](tcd_[a-z0-9_]+)['\"]", _s):
        _lee23.add(_k)
    for _m in _re23.finditer(r"const ([A-Z_]+) = '(tcd_[a-z0-9_]+)'", _s):
        if _re23.search(rf"(?:getItem|safeGet|leer|leerJSON)\w*(?:<[^(]*>)?\(\s*{_m.group(1)}\b", _s):
            _lee23.add(_m.group(2))
# Una clave que termina en '_' es el prefijo de una plantilla
# (`tcd_herramienta_${id}`), no una clave: no se puede buscar literal.
_huerfanas = sorted(k for k in (set(_esc23) - _lee23) if not k.endswith('_'))
check('nada que el cliente escribe se guarda y se tira',
      not _huerfanas,
      '; '.join(f'{k} ({",".join(sorted(_esc23[k]))})' for k in _huerfanas[:4]))

# La puerta que elige el sanador tiene que llegar a la regla que lo mide.
_th23 = rd('src/components/campanas/TableroCupos.tsx')
check('la puerta elegida preselecciona la regla de medición',
      "leer<string | null>('tcd_campana_objetivo'" in _th23,
      'elegía una puerta y esa decisión no llegaba a ningún lado')
check('el pacto que el sanador firma vuelve a su pantalla',
      'tcd_pacto' in rd('src/pages/Dashboard.tsx'),
      'pedirle que firme algo y no volver a mostrárselo es lo contrario de un compromiso')

# Los efectos asíncronos del código nuevo no tocan estado tras desmontar.
for _c23 in ('ColaDelDia', 'Supervision', 'TableroPlata', 'PanelMotorIA'):
    _p23 = f'src/components/admin/{_c23}.tsx'
    if not _os610.path.exists(_p23): continue
    _src23 = rd(_p23)
    _m23 = _re23.search(r'useEffect\((.{0,900})', _src23, _re23.S)
    _asinc = bool(_m23) and ('await' in _m23.group(1) or 'async' in _m23.group(1))
    check(f'{_c23}: el efecto asíncrono no toca estado tras desmontar',
          not _asinc or _re23.search(r'vivo|cancel|abort', _src23, _re23.I) is not None)

# ── 6.24 · Los bordes no dejan pantallas mudas ─────────────────────────
# Sin internet la app no se enteraba: los pedidos fallaban con mensajes
# técnicos («Failed to fetch») y el sanador quedaba mirando un error que no
# le decía nada. Y el que carga sus números desde el teléfono, con mala
# señal, es exactamente el caso.
import os as _os24
if _os24.path.exists('src/lib/conexion.ts'):
    _cx = rd('src/lib/conexion.ts')
    check('la app sabe cuándo no hay internet',
          'useConexion' in _cx and "addEventListener('offline'" in _cx)
    check('se distingue sin internet de servidor caído de sesión vencida',
          all(x in _cx for x in ("'sin_internet'", "'servidor'", "'permiso'")),
          'la acción es distinta: esperar, avisar o volver a entrar')
    check('el sanador nunca ve el error técnico',
          'mensajeDeFalla' in _cx and 'Failed to fetch' not in
          rd('src/components/admin/TableroPlata.tsx'))
    check('sin internet se le dice que su trabajo no se perdió',
          'no se perdió' in _cx,
          'es lo único que evita que vuelva a escribir todo o abandone')
    check('la barra de sin internet está en la pantalla que se ve siempre',
          'useConexion' in rd('src/components/Topbar.tsx'))
    _pantallas24 = ['TableroPlata', 'ColaDelDia', 'Supervision', 'PanelMotorIA']
    _sin = [c for c in _pantallas24
            if 'mensajeDeFalla' not in rd(f'src/components/admin/{c}.tsx')]
    check('las pantallas nuevas traducen sus fallas', not _sin, ', '.join(_sin))
    check('la lectura de fallas está probada',
          _os24.path.exists('scripts/prueba-conexion.ts'))

# ── 6.25 · Se puede usar desde un teléfono ─────────────────────────────
# El cliente vive en el móvil: carga su número ahí todos los días. Un campo
# que abre el teclado completo en vez del numérico convierte 30 segundos en
# una pelea, y a la tercera vez deja de cargar.
import re as _re25, glob as _g25
_sinTeclado = []
for _f25 in _g25.glob('src/**/*.tsx', recursive=True):
    _s25 = rd(_f25)
    for _m25 in _re25.finditer(r'<input[^>]{0,300}?type="number"[^>]{0,300}?>', _s25, _re25.S):
        if 'inputMode' not in _m25.group(0):
            _sinTeclado.append(_f25.split('/')[-1])
check('todo campo numérico abre el teclado numérico',
      not _sinTeclado, ', '.join(sorted(set(_sinTeclado))))

# Grillas de 3+ columnas sin punto de quiebre, solo donde hay campos de carga.
_grillas = []
for _f25 in _g25.glob('src/components/campanas/*.tsx') + _g25.glob('src/components/admin/*.tsx'):
    _s25 = rd(_f25)
    if '<input' not in _s25: continue
    for _m25 in _re25.finditer(r'(?<![a-z:-])grid-cols-([4-9]|1[0-2])\b', _s25):
        if not _re25.search(r'(sm|md|lg|xl):$', _s25[max(0, _m25.start() - 12):_m25.start()]):
            _grillas.append(f"{_f25.split('/')[-1]}: grid-cols-{_m25.group(1)}")
check('ninguna pantalla de carga apila 4+ campos sin punto de quiebre',
      not _grillas, ', '.join(sorted(set(_grillas))))

# La carga semanal tiene que ser de a un dato por pantalla.
check('la carga del viernes sigue siendo guiada, no una grilla',
      'PASOS[paso]' in rd('src/components/campanas/TableroCupos.tsx'))

# ── 6.26 · Todo lo que el tablero señala tiene respuesta ───────────────
# Un cuello de botella que se señala y no tiene ni acción para el equipo ni
# aviso para el cliente deja a los dos mirando un problema sin salida. Lo
# encontró la verificación final: tres de diecisiete estaban así.
import re as _re26
_vc26 = rd('src/lib/valueChain.ts')
_co26 = rd('src/lib/colaExcepciones.ts')
_av26 = rd('src/lib/avisosCliente.ts')
_cuellos26 = set(_re26.findall(r"add\('([a-z_]+)',", _vc26))
_acc26 = set(_re26.findall(r'^  ([a-z_]+): \{', _co26, _re26.M))
_avi26 = set(_re26.findall(r'^  ([a-z_]+): \{', _av26, _re26.M))
check('todo cuello de botella tiene su acción para el equipo',
      not (_cuellos26 - _acc26), str(sorted(_cuellos26 - _acc26)))
check('todo cuello de botella tiene su aviso para el cliente',
      not (_cuellos26 - _avi26), str(sorted(_cuellos26 - _avi26)))
check('el diagnóstico nunca usa IA',
      all('generateText' not in rd(f'src/lib/{f}') for f in
          ('valueChain.ts', 'decidirCampana.ts', 'bitacoraCampana.ts', 'colaExcepciones.ts')),
      'un modelo daría otra respuesta el jueves')
check('un solo motor de cada cosa',
      sum('export function decidirCampana' in rd(f) for f in _g25.glob('src/lib/*.ts')) == 1
      and sum('export function calcularCadena' in rd(f) for f in _g25.glob('src/lib/*.ts')) == 1
      and sum('export function auditarPieza' in rd(f) for f in _g25.glob('src/lib/*.ts')) == 1,
      'duplicar criterio es peor que no tenerlo')

# ── 6.27 · Ninguna clave de IA vive en el navegador ────────────────────
# Todo lo que lleva el prefijo VITE_ se empaqueta DENTRO del bundle: lo puede
# leer y gastar cualquiera que abra la app. No rompe nada — es una cuenta
# abierta al público. VITE_SUPABASE_ANON_KEY es la excepción: está diseñada
# para ser pública y sin ella no hay app.
import re as _re27, glob as _g27
_PUBLICAS = ('VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_PAYPAL_CLIENT_ID',
             'VITE_PAYPAL_ENV', 'VITE_SENTRY_DSN', 'VITE_SENTRY_ENVIRONMENT',
             'VITE_APP_VERSION', 'VITE_CREDITS_ENABLED', 'VITE_CHECKOUT_AMARILLO',
             'VITE_CHECKOUT_VERDE', 'VITE_CHECKOUT_NEGRO')
_expuestas = set()
for _f27 in _g27.glob('src/**/*.ts*', recursive=True):
    _s27 = rd(_f27)
    for _m27 in _re27.finditer(r'import\.meta\.env\.(VITE_[A-Z0-9_]+)', _s27):
        _v = _m27.group(1)
        if _v in _PUBLICAS: continue
        if _re27.search(r'(API_)?KEY|SECRET|TOKEN', _v):
            _expuestas.add(f'{_v} ({_f27.split("/")[-1]})')
check('ninguna clave de IA o secreto vive en el navegador',
      not _expuestas, '; '.join(sorted(_expuestas)),)

# Y las llamadas directas a proveedores de IA tampoco: van por api/.
_directas = []
for _f27 in _g27.glob('src/**/*.ts*', recursive=True):
    _s27 = rd(_f27)
    for _pat, _quien in ((r'generativelanguage\.googleapis\.com', 'Google'),
                         (r'api\.openai\.com', 'OpenAI'),
                         (r'api\.anthropic\.com', 'Anthropic'),
                         (r'new GoogleGenAI\(', 'Google')):
        if _re27.search(_pat, _s27):
            _directas.append(f'{_f27.split("/")[-1]} → {_quien}')
check('el navegador no llama a ningún proveedor de IA directo',
      not _directas, '; '.join(sorted(set(_directas))),)

# ── 6.28 · La Sala de Mando ────────────────────────────────────────────
# No es un tablero: es la máquina que se instala sola con un equipo
# atendiendo excepciones. Contesta una pregunta cada mañana: qué está
# frenado y quién lo destraba.
import os as _os28
if _os28.path.exists('src/lib/salaDeMando.ts'):
    _sm = rd('src/lib/salaDeMando.ts')
    _smc = rd('src/components/admin/SalaDeMando.tsx')
    _adm28 = rd('src/pages/Admin.tsx')
    check('las nueve etapas están declaradas con su criterio de salida',
          _sm.count('criterioSalida:') >= 9 and 'ETAPAS' in _sm)
    check('cada etapa dice quién es el dueño', _sm.count('dueno:') >= 9)
    check('de la prueba de cadena no se sale sin el cobro',
          'ETAPA_CON_CANDADO' in _sm and 'COBRO DE PRUEBA' in _sm
          and 'ETAPA_CON_CANDADO' in _smc,
          'encender con la cadena sin probar es tirar el presupuesto')
    check('la etapa destino no marca atraso',
          'diasMax: 0, dueno: \'Cliente\'' in _sm,
          'un cliente en ritmo propio hace 200 días no está atrasado: está donde queremos')
    check('la ventana de 21 días hasta la activación se mide',
          'DIAS_HASTA_ACTIVACION' in _sm and 'fueraDeVentana' in _sm)
    check('el freno de la pauta existe y manda sobre todo',
          'DIAS_PAUTA_SIN_AGENDA' in _sm and 'cortar: true' in _sm,
          'siete días sin una agenda no es mala suerte: es que el anuncio no funciona')
    check('la reinversión tiene tope',
          'TOPE_REINVERSION' in _sm)
    check('una decisión no se borra, se deja de aplicar',
          'derogarDecision' in rd('src/lib/salaDeMandoStorage.ts')
          and 'vigente: false' in rd('src/lib/salaDeMandoStorage.ts'),
          'la historia de por qué se decidió algo importa')
    check('la lógica de la Sala se puede probar sin la base',
          'supabase' not in _sm,
          'la que habla con la base vive en salaDeMandoStorage')
    check('la Sala está en las 5 superficies del Admin',
          _tab_completa('sala', "sala: 'Sala de Mando"))
    check('la Sala está probada con escenarios',
          _os28.path.exists('scripts/prueba-sala.ts'))

# ── 6.29 · La app no le miente al cliente ──────────────────────────────
# Los cinco errores del turno F.1. Ninguno rompía nada —la batería los daba
# verdes— y por eso nadie los veía. Se encontraron corriendo el viaje real
# de un sanador contra su objetivo, semana por semana.
_vc29 = rd('src/lib/valueChain.ts')
_dc29 = rd('src/lib/decidirCampana.ts')
_tc29 = rd('src/components/campanas/TableroCupos.tsx')
_con29 = rd('src/components/campanas/ConstructorAnuncios.tsx')

check('el presupuesto NO usa el benchmark de comercio electrónico',
      '0.50;' not in _vc29 and 'CAC_MEDIO' in _vc29,
      'decía $7 por semana donde hacen falta $154')
check('el costo por conversación se deriva del CAC objetivo',
      'costoConvReferencia' in _vc29 and 'convsPorVenta' in _vc29,
      'la cadena se dice a sí misma cuánto puede pagar')
check('el colchón va a la actividad, no al presupuesto',
      'ventasObjetivo * real.precio * CAC_MEDIO' in _vc29,
      'contarlo dos veces daba $300 donde hacen falta $154')
check('cada tasa declara cuántos datos necesita para opinar',
      _vc29.count('necesita:') >= 12,
      'juzgar un cierre sobre dos llamadas es leer ruido')
check('sin muestra suficiente el indicador no puede ser el dominó',
      'insuficiente' in _vc29 and 'valor: insuficiente ? null : valor' in _vc29)
check('la base del referido son los que TERMINARON, no los activos',
      'n.clientesQueTerminan, necesita: 3 });' in _vc29,
      'a alguien que empezó hace dos semanas no se le pide un referido')
check('el refresco cuenta las semanas del GANADOR, no de la campaña',
      'semanasGanando' in _tc29 and 'Math.floor(diasCampana / 7)' not in _tc29,
      'le pedía refrescar el ganador el día que lo encontraba')
check('con números empatados no se corona a nadie',
      'hayEmpate' in _dc29,
      'coronar al primero le hace apagar dos que estaban igual')
check('una tanda de anuncios cuesta UN crédito',
      _con29.count("feature: 'constructor'") <= 2
      and 'primera ? { feature' in _con29,
      'cobraba cuatro donde la app promete uno')
check('el cliente ve su marcador de los 90 días',
      'Tus 90 días' in _tc29 and 'conversacionesNecesarias' in _tc29,
      'la proyección vivía en el Admin y él nunca la leía')
check('los cinco están probados con el viaje real',
      _os610.path.exists('scripts/prueba-verdad.ts'))

# ── 6.29 · Los roles son roles, no permisos ────────────────────────────
# Antes eran tres nombres usados quince veces para esconder tabs. Un rol de
# verdad contesta tres preguntas: qué me toca, qué NO me toca (para que dos
# personas no hagan lo mismo) y cuánto puedo sostener.
import os as _os29
if _os29.path.exists('src/lib/roles.ts'):
    _rl = rd('src/lib/roles.ts')
    _mr = rd('src/components/admin/MiRol.tsx')
    _adm29 = rd('src/pages/Admin.tsx')
    # Se cuentan las DEFINICIONES, no las apariciones: la interfaz declara
    # cada campo una vez y eso sumaba uno de más.
    _defsRol = _re25.findall(r'^  (direccion|acompanamiento|desarrollo): \{', _rl, _re25.M)
    check('los tres roles existen con su propósito',
          len(_defsRol) == 3 and _rl.count('proposito:') == 4)
    check('cada rol declara qué NO le toca y por qué',
          _rl.count('noLeToca:') == 4 and _rl.count('porque:') >= 7,
          'sin esto, dos personas hacen lo mismo y una tercera cosa no la hace nadie')
    check('desarrollo NO atiende clientes',
          'Atender clientes' in _rl and 'deja de construir' in _rl,
          'cada vez que lo hace deja de construir lo que evitaría atenderlos')
    check('cada rol tiene UN número que lo mide',
          _rl.count('indicador:') == 4)
    check('el techo de carga avisa lo correcto, no "trabaja más"',
          'no se arregla con más horas' in _rl,
          'decirle que trabaje más rompe el modelo en silencio')
    check('sin rol cargado se asume el más acotado, nunca dirección',
          "default: return 'acompanamiento'" in _rl)
    # El menú pasó a ser cuatro momentos con un orden fijo —el del día—, así
    # que ya no se ordena por rol. Lo que el rol decide es QUÉ VE, y eso lo
    # verifica la lente 6.38 sobre las categorías de dato.
    check('el rol decide qué ve, y eso se verifica por categoría de dato',
          'puedeVer' in rd('src/lib/permisos.ts'))
    check('el traspaso está escrito, con el porqué de cada paso',
          'TRASPASO' in _rl and _rl.count('porque:') >= 7,
          'una conversación se olvida y el que la dio se vuelve necesario para siempre')
    check('la pantalla del rol está en las 5 superficies',
          _tab_completa('mirol', "mirol: 'Mi rol"))
    check('los roles están probados con escenarios',
          _os29.path.exists('scripts/prueba-roles.ts'))

# ── 6.30 · Las transcripciones se heredan ──────────────────────────────
# Sin esto, lo que se dijo en una sesión vive en la cabeza de quien la dio:
# el que sigue no sabe qué se acordó, el cliente vuelve a explicar lo mismo,
# y quien la dio se vuelve necesario para siempre.
import os as _os30
if _os30.path.exists('src/lib/transcripcion.ts'):
    _tr = rd('src/lib/transcripcion.ts')
    _cs = rd('src/components/admin/CargarSesion.tsx')
    _adm30 = rd('src/pages/Admin.tsx')
    check('se extraen TRES cosas y solo tres',
          all(k in _tr for k in ('decisiones', 'pendientes', 'cambios')),
          'un resumen largo no se lee, y lo que no se lee no se hereda')
    check('cada pendiente sabe de quién es',
          "'cliente' | 'equipo' | 'sin_asignar'" in _tr)
    check('un dueño inventado cae en sin_asignar',
          'DUENOS.has(d)' in _tr,
          'aceptar cualquier valor mete basura en las tareas')
    check('el prompt le prohíbe inventar y distingue conversar de decidir',
          'NO inventes' in _tr and 'NO es una decisión' in _tr)
    check('usa la tarea estructura, no la de escribir',
          "tarea: 'estructura'" in _cs,
          'no necesita voz: necesita obedecer el esquema')
    check('NADA se guarda sin que un humano lo confirme',
          'Confirmar y guardar' in _cs and 'setFuera' in _cs,
          'una transcripción mal leída que se guarda sola es un dato falso con cara de registro')
    check('lee el JSON aunque el modelo lo envuelva',
          "indexOf('{')" in _tr and "lastIndexOf('}')" in _tr,
          'perder una extracción por unas comillas sería tirar el trabajo de la sesión')
    check('una respuesta rota nunca revienta la pantalla',
          _tr.count('return EXTRACCION_VACIA') >= 3)
    check('el cliente recibe el resumen dentro de la app',
          'resumenParaElCliente' in _tr and 'crearNotificacion' in _cs)
    check('un error al guardar no pierde lo leído',
          'Lo leído sigue acá' in _cs)
    check('la tab está en las 5 superficies',
          _tab_completa('sesiones', "sesiones: 'Cargar sesión"))
    check('cargar la sesión le toca a acompañamiento',
          "'sesiones'" in rd('src/lib/roles.ts'))
    check('la extracción está probada',
          _os30.path.exists('scripts/prueba-transcripcion.ts'))

# ── 6.31 · El cuadro sirve a los cuatro tickets ────────────────────────
# Los 62 ítems estaban pensados para un solo caso. Al de $1.000 le mostraban
# 42 tareas que nadie iba a hacer por él.
import os as _os31
if _os31.path.exists('src/lib/cuadroTickets.ts'):
    _ct = rd('src/lib/cuadroTickets.ts')
    _ps31 = rd('src/lib/preactivacionSteps.ts')
    # NINGÚN ID INVENTADO. Son cadenas de texto: el compilador no las mira,
    # y al construir esto se inventaron 41 de 47 y compilaba perfecto.
    _realesIds = set(_re25.findall(r"\{ id: '([a-z0-9_]+)'", _ps31))
    _usadosIds = set(_re25.findall(r"^\s+'([a-z0-9_]+)',", _ct, _re25.M))
    check('ningún id del cuadro es inventado',
          _usadosIds <= _realesIds,
          f'inventados: {sorted(_usadosIds - _realesIds)[:6]}')
    check('los cuatro tickets tienen su criterio escrito',
          _ct.count('criterio:') >= 4)
    check('al que va solo no se le muestran las tareas de instalador',
          'NECESITA_INSTALADOR' in _ct and 'noAplica' in _ct,
          'mostrarle una tarea que no puede hacer y que nadie hará por él lo hace abandonar el cuadro')
    check('el avance cuenta solo lo que le aplica',
          'i.noAplica' in _ct and 'export function avanceDe' in _ct)
    check('el cliente viejo entra marcando bloques enteros',
          'export function marcarBloques' in _ct,
          'no arranca de cero: arranca de donde está')

# ── 6.32 · El libro y el puente con los pacientes ──────────────────────
if _os31.path.exists('src/lib/libroYPacientes.ts'):
    _lp = rd('src/lib/libroYPacientes.ts')
    check('el libro está por capítulos, atado al pilar',
          'CAPITULOS' in _lp and _lp.count('pilar:') >= 10)
    check('cada capítulo dice de qué trata y cuánto tarda',
          _lp.count('sobre:') >= 10 and _lp.count('minutos:') >= 10)
    check('un capítulo cerrado explica por qué conviene esperar',
          'es teoría' in _lp,
          'leerlo antes es teoría; leerlo en su momento es la explicación de lo que le pasa')
    check('existe el puente para sostener a sus pacientes',
          'estadoDePacientes' in _lp,
          'el objetivo son diez PACIENTES, no diez ventas')
    check('el que está por terminar va primero',
          "'por terminar': 0" in _lp,
          'es lo único con fecha de vencimiento')
    check('la renovación se habla ANTES de que termine',
          'después ya decidió' in _lp)
    check('el cuadro y el libro están probados',
          _os31.path.exists('scripts/prueba-cuadro.ts')
          and _os31.path.exists('scripts/prueba-libro.ts'))

# ── 6.33 · Ningún identificador inventado ──────────────────────────────
# La clase de error que compila perfecto: son cadenas de texto y el
# compilador no las mira. Construyendo el cuadro se inventaron 41 de 47 ids
# y todo compilaba. Se cruzan los espacios QUE TIENEN SU FUENTE EN EL REPO;
# las tablas y funciones de Supabase quedan afuera a propósito, porque el
# esquema histórico no está declarado acá y un chequeo que no puede
# distinguir es peor que no tenerlo.
import re as _re33, glob as _g33
_TODO33 = {f: rd(f) for f in _g33.glob('src/**/*.ts*', recursive=True) + _g33.glob('api/**/*.ts', recursive=True)}
_malos33 = []

# Las tabs que un rol declara tienen que existir.
_adm33 = rd('src/pages/Admin.tsx')
_m33 = _re33.search(r'VALID_MAIN_TABS: MainTab\[\] = \[(.*?)\]', _adm33, _re33.S)
_tabs33 = set(_re33.findall(r"'([a-z]+)'", _m33.group(1))) if _m33 else set()
for _b in _re33.findall(r'leToca: \[(.*?)\]', rd('src/lib/roles.ts'), _re33.S):
    for _x in set(_re33.findall(r"'([a-z]+)'", _b)) - _tabs33:
        _malos33.append(f'rol → tab {_x}')

# Toda feature declarada tiene que estar en el guardián: si no, no se cobra
# ni se cuenta, y nadie se entera.
_conocidas33 = set(_re33.findall(r"'([a-z_]+)'", rd('api/_lib/uso-server.ts')))
for _f, _s in _TODO33.items():
    for _x in set(_re33.findall(r"feature: '([a-z_]+)'", _s)) - _conocidas33:
        _malos33.append(f'feature {_x} ({_f.split("/")[-1]})')
    for _x in set(_re33.findall(r"tarea: '([a-z]+)'", _s)) - set(
            _re33.findall(r'^  ([a-z]+): \{', rd('api/_lib/router.ts'), _re33.M)):
        _malos33.append(f'tarea {_x} ({_f.split("/")[-1]})')

# Los ítems del cuadro y los tutoriales.
_items33 = set(_re33.findall(r"\{ id: '([a-z0-9_]+)'", rd('src/lib/preactivacionSteps.ts')))
for _x in set(_re33.findall(r"^\s+'([a-z0-9_]+)',", rd('src/lib/cuadroTickets.ts'), _re33.M)) - _items33:
    _malos33.append(f'ítem del cuadro {_x}')
_tut33 = set(_re33.findall(r"^  '([^']+)': \{", rd('src/lib/tutorialesTecnicos.ts'), _re33.M))
for _f, _s in _TODO33.items():
    for _x in set(_re33.findall(r"tutorial: '([^']+)'", _s)) - _tut33:
        _malos33.append(f'tutorial {_x} ({_f.split("/")[-1]})')

# TODA SESIÓN CON GUION TIENE QUE ESTAR EN EL CAMINO. Si no, está escrita y
# nadie llega nunca — le pasó a P4.8, la Prueba de Fuego.
_cam33 = set(_re33.findall(r"codigo: '([A-Z][0-9]+\.[0-9]+[a-z]?)'", rd('src/lib/roadmapSeed.ts')))
_gui33 = set(_re33.findall(r"^  '([A-Z][0-9]+\.[0-9]+[a-z]?)': \{", rd('src/lib/sesionesGuiadas.ts'), _re33.M))
for _x in _gui33 - _cam33:
    _malos33.append(f'sesión {_x} tiene guion y NO está en el Camino')

check('ningún identificador inventado en todo el repo',
      not _malos33, '; '.join(sorted(set(_malos33))[:5]))

# ── 6.34 · Todo motor tiene prueba, y la lógica no vive con la base ────
# La regla que ya mordió dos veces: si la lógica está en el archivo que
# importa supabase, la prueba no puede ni cargarlo (import.meta.env no existe
# fuera del navegador). Y sin prueba, la decisión más importante del día
# —a quién se atiende primero— quedaba sin verificar.
import glob as _g34, os as _os34
_SCR34 = {f: rd(f) for f in _g34.glob('scripts/*.ts')}
_MOTORES = ['valueChain', 'decidirCampana', 'bitacoraCampana', 'colaExcepciones',
            'avisosCliente', 'paqueteCampana', 'conexion', 'salaDeMando', 'roles',
            'transcripcion', 'cuadroTickets', 'libroYPacientes', 'formulasAnuncios']
_sinPrueba = [m for m in _MOTORES if not any(m in _s for _s in _SCR34.values())]
check('todo motor tiene al menos una prueba', not _sinPrueba, ', '.join(_sinPrueba))

check('el peso de la cola es lógica pura y está probado',
      'export function pesoDeLaCuenta' in rd('src/lib/colaExcepciones.ts')
      and 'pesoDeLaCuenta' in rd('scripts/prueba-cola.ts'),
      'es la decisión más importante del día: a quién se atiende primero')
check('el peso no se repite en dos lados',
      'Math.min(c.urgencia, 5)' not in rd('src/lib/mesaPlataStorage.ts'),
      'dos cálculos que se separan dan dos órdenes distintos')
check('una cuenta que no facturó no desaparece de la lista',
      '(x.facturado || 1)' in rd('src/lib/colaExcepciones.ts'))

# ── 6.35 · Las pantallas se montan de verdad ───────────────────────────
# LA LENTE QUE FALTABA. Todo lo demás verifica el código SIN EJECUTARLO: el
# compilador mira los tipos, esta batería mira el texto de los archivos, las
# pruebas de modelo corren funciones sueltas. Ninguna montaba un componente
# — y una pantalla puede compilar perfecto y reventar al abrirse.
import os as _os35
check('existe la prueba que monta las pantallas',
      _os35.path.exists('scripts/prueba-pantallas.tsx')
      and _os35.path.exists('scripts/entorno-navegador.mjs'),
      'sin esto, que una pantalla explote al abrirse lo descubre el cliente')
check('supabase.ts carga fuera del navegador',
      'import.meta.env ?? process.env' in rd('src/lib/supabase.ts'),
      'leer import.meta.env sin guarda hacía imposible montar cualquier pantalla en una prueba')
_pant35 = rd('scripts/prueba-pantallas.tsx') if _os35.path.exists('scripts/prueba-pantallas.tsx') else ''
check('se montan todas las pantallas nuevas',
      all(c in _pant35 for c in ('TableroCupos', 'MontajeCupos', 'MiRol', 'ColaDelDia',
                                 'Supervision', 'SalaDeMando', 'PanelMotorIA',
                                 'TableroPlata', 'CargarSesion')))
check('se prueban con datos vacíos, que es como llegan la primera vez',
      'clientes={[]}' in _pant35)
check('una pantalla que dibuja casi nada se marca como muda',
      'PANTALLA MUDA' in _pant35)
_cola35 = rd('src/components/admin/ColaDelDia.tsx')
check('las pantallas que cargan datos lo dicen desde el primer dibujo',
      'useState(true)' in _cola35,
      'con false, mostraban un guion hasta que llegaban los datos')

# ── 6.36 · Ningún aviso queda mudo ─────────────────────────────────────
# Si un destino no está en URL_TO_PAGE del Topbar, el botón «Ver» NO APARECE
# y el clic no hace nada. No rompe nada: simplemente no pasa nada, y por eso
# no se veía. Pasó con 18 de los 26 destinos, incluidos los once avisos
# automáticos que apuntan a Campañas.
import re as _re36, glob as _g36
_tb36 = rd('src/components/Topbar.tsx')
_mapa36 = set(_re36.findall(r"^  '(/[a-z/-]+)':", _tb36, _re36.M))
_usados36 = set()
for _f36 in _g36.glob('src/**/*.ts*', recursive=True):
    _usados36 |= set(_re36.findall(r"(?:accion_url|destino): '(/[a-z-]+)'", rd(_f36)))
_mudos36 = sorted(_usados36 - _mapa36)
check('todo destino de aviso lleva a algún lado',
      not _mudos36, ', '.join(_mudos36))

# Y toda página del mapa tiene que existir en el router.
_app36 = rd('src/App.tsx')
_paginas36 = set(_re36.findall(r"currentPage === '([a-z-]+)'", _app36))
_apunta36 = set(_re36.findall(r"^  '/[a-z/-]+': '([a-z-]+)'", _tb36, _re36.M))
_rotos36 = sorted(x for x in _apunta36 - _paginas36 if not x.startswith('admin-'))
check('todo destino apunta a una página que existe',
      not _rotos36, ', '.join(_rotos36))

# ── 6.37 · El cliente en desorden ──────────────────────────────────────
# Nadie recorre el Camino en línea recta: entra a Campañas antes de sellar
# el ADN, carga números antes de encender, abre el tablero el día uno,
# escribe cifras imposibles. Ninguna de esas puede dejarlo mirando algo roto.
check('se prueba el uso en desorden y con datos imposibles',
      _os35.path.exists('scripts/prueba-desorden.ts'))

# ── 6.38 · Los permisos: lo más delicado de la app ─────────────────────
# Si esto falla, un empleado ve las ventas del dueño o el rendimiento de un
# compañero. No hay forma de deshacerlo: una vez que alguien lo vio, lo vio.
# El permiso va sobre EL DATO, no sobre la pantalla: si se esconden tabs,
# alcanza con que alguien agregue un número a una pantalla compartida.
import os as _os38
if _os38.path.exists('src/lib/permisos.ts'):
    _pm = rd('src/lib/permisos.ts')
    # Las tres categorías que ningún empleado puede ver, verificadas leyendo
    # las listas `ve:` de cada rol que no sea dirección.
    import re as _re38
    _bloques38 = _re38.findall(r"^  (acompanamiento|desarrollo|produccion): \{(.*?)\n  \},",
                               _pm, _re38.S | _re38.M)
    _fugas38 = []
    for _rol, _cuerpo in _bloques38:
        _ve = _re38.search(r've: \[(.*?)\]', _cuerpo, _re38.S)
        _lista = _ve.group(1) if _ve else ''
        for _prohibida in ('dinero_tcd', 'motor_propio', 'rendimiento_equipo'):
            if f"'{_prohibida}'" in _lista:
                _fugas38.append(f'{_rol} ve {_prohibida}')
    check('ningún empleado ve el dinero del dueño ni el rendimiento del equipo',
          not _fugas38, '; '.join(_fugas38))
    check('el permiso va sobre el DATO, no sobre la pantalla',
          'export function puedeVer' in _pm and 'Categoria' in _pm,
          'si se esconden tabs, un número nuevo en una pantalla compartida se filtra')
    check('cada negativa tiene su porqué escrito',
          _pm.count('porQueNoVe') >= 4 and _pm.count(':') > 40,
          'para que nadie la afloje sin pensar')
    check('lo desconocido NUNCA cae en dirección',
          "default: return 'acompanamiento'" in _pm)
    check('El Negocio no depende del costo de la IA',
          "requiere: ['dinero_tcd', 'motor_propio', 'rendimiento_equipo']" in _pm,
          'si dependiera, desarrollo entraría a la pantalla donde están las ventas del dueño')
    check('son cuatro momentos, no dieciséis tabs',
          _pm.count("{ id: '") >= 4 and 'MOMENTOS' in _pm)
    check('los permisos están probados',
          _os38.path.exists('scripts/prueba-permisos.ts'))

# ── 6.39 · El cierre del día ───────────────────────────────────────────
if _os38.path.exists('src/lib/cierreDelDia.ts'):
    _cd39 = rd('src/lib/cierreDelDia.ts')
    check('las trabas se agrupan aunque estén escritas distinto',
          'PARECIDO_MINIMO' in _cd39 and 'function raiz' in _cd39,
          'una traba que no se agrupa nunca llega a las tres veces y nunca se detecta')
    check('a las tres veces la traba pasa a ser del sistema',
          'VECES_PARA_SER_SISTEMA' in _cd39,
          'deja de ser un problema de esfuerzo: no se arregla insistiendo')
    check('los minutos se calculan, no se le preguntan a nadie',
          'export function minutosDelDia' in _cd39)
    check('el cierre está probado',
          _os38.path.exists('scripts/prueba-cierre.ts'))

# ── 6.40 · La jornada y el círculo del negocio ─────────────────────────
# Check-in al empezar, check-out al cerrar. No es control horario: a nadie se
# le pide que cargue horas. Lo que se mira es cuántos minutos de humano costó
# cada cliente, y eso tiene que bajar mes a mes.
import os as _os40
if _os40.path.exists('src/lib/jornada.ts'):
    _jo = rd('src/lib/jornada.ts')
    _js = rd('src/components/admin/Jornada.tsx')
    _ls = rd('src/components/admin/LaSemana.tsx')
    check('hay check-in y check-out, a la hora que sea',
          'export function iniciarJornada' in _jo and 'export function cerrarJornada' in _jo)
    check('una jornada olvidada no ensucia el número',
          'HORAS_PARA_CERRAR_SOLA' in _jo,
          'una abierta 30 horas es alguien que se olvidó de cerrar, no que trabajó 30 horas')
    check('la app avisa si dos atienden la misma cuenta',
          'export function cuentasPisadas' in _jo,
          'es lo único que el check-in resuelve y el cierre solo no puede')
    check('el objetivo es UNO: que todos los clientes vendan',
          'pctVendiendo' in _jo and 'clientesQueVendieron' in _jo)
    check('el círculo se mide con dos números a la vez',
          'export function comoVaElCirculo' in _jo
          and 'no escala' in _jo and 'todavía no está resolviendo' in _jo,
          'si venden más pero cuesta más trabajo, se está comprando resultado con horas')
    check('una traba repetida manda sobre todo lo demás en el titular',
          'trabasDelSistema > 0' in _jo)
    check('el cierre pregunta qué trabó, no cuántas horas',
          '¿Algo te trabó?' in _js and 'se mira el viernes' in _js)
    check('el dinero y el rendimiento se ocultan POR DATO en La Semana',
          "puedeVer(rol, 'dinero_tcd')" in _ls
          and "puedeVer(rol, 'rendimiento_equipo')" in _ls,
          'si se ocultara la pantalla entera, un número nuevo se filtraría')
    check('se verifica que el dinero NO viaje al navegador del empleado',
          'el dinero NO viaja al navegador' in rd('scripts/prueba-pantallas.tsx'),
          'no alcanza con esconderlo: si está en el HTML, cualquiera lo lee')
    check('la jornada está probada',
          _os40.path.exists('scripts/prueba-jornada.ts'))

# ── 6.41 · La jornada llega al equipo ──────────────────────────────────
# Las trabas viven en la BASE y no en el navegador: si vivieran en el
# navegador de cada uno, la lista del viernes estaría vacía para todos menos
# para quien la escribió — y esa lista es para lo que existe todo esto.
import os as _os41
if _os41.path.exists('src/lib/jornadaStorage.ts'):
    _jst = rd('src/lib/jornadaStorage.ts')
    _sql41 = rd('sala-de-mando.sql')
    _jp41 = rd('src/components/admin/Jornada.tsx')
    _adm41 = rd('src/pages/Admin.tsx')
    check('las jornadas viven en la base, no en el navegador',
          'create table if not exists jornadas' in _sql41
          and 'export async function jornadasRecientes' in _jst,
          'las trabas de uno tienen que llegarle al resto el viernes')
    check('abrir el día dos veces no duplica la jornada',
          'jornada_persona_dia' in _sql41 and 'on conflict (persona_id, dia)' in _sql41,
          'contaría el trabajo dos veces')
    check('todo el equipo lee las jornadas de todos',
          'jornada_equipo_lee' in _sql41,
          'sin eso no hay lista de trabas compartida')
    check('el día arranca aunque falle la red',
          'Tu día arrancó igual' in _jp41)
    check('si la traba no subió, se avisa',
          'Tu traba no llegó al equipo' in _jp41,
          'es lo más valioso del cierre: perderla en silencio es lo peor que puede pasar')
    check('la base manda sobre el navegador',
          'jornadaDeHoy' in _jp41,
          'si abrió el día en el teléfono y entra por la computadora, tiene que ver su día abierto')
    check('Hoy envuelve la cola en la jornada',
          '<JornadaPanel' in _adm41 and '</JornadaPanel>' in _adm41)
    check('La Semana recibe datos reales, no vacíos',
          'jornadas={jornadasEquipo}' in _adm41
          and 'clientesQueVendieron={semanaClientes.vendieron}' in _adm41)
    check('las jornadas se cargan solo cuando hacen falta',
          "mainTab !== 'semana' && mainTab !== 'hoy'" in _adm41,
          'son dos consultas que no le sirven a quien está mirando otra cosa')

# ── 6.42 · El menú son CUATRO momentos ─────────────────────────────────
# Llegó a tener diecisiete entradas planas y nadie sabía cuál abrir primero.
# Están ordenadas por CUÁNDO se usan, no por lo que son.
import re as _re42
_adm42 = rd('src/pages/Admin.tsx')
_m42 = _re42.search(r'sidebarItems: .*?= \[(.*?)\n  \];', _adm42, _re42.S)
_menu42 = set(_re42.findall(r"id: '([a-z]+)'", _m42.group(1))) if _m42 else set()
check(f'el menú tiene cuatro entradas, no diecisiete (tiene {len(_menu42)})',
      len(_menu42) == 4,
      'el problema de un equipo no es encontrar información: es saber qué hacer ahora')
check('las cuatro son los momentos del día, en orden',
      _menu42 == {'hoy', 'semana', 'clientes', 'sala'})
check('la primera es Hoy',
      _adm42.index("id: 'hoy',      label: 'Hoy'") < _adm42.index("id: 'semana'"),
      'es la única que se abre todos los días')

# NADA puede quedar inalcanzable: toda pantalla que se dibuja tiene que estar
# en el menú o en las pestañas de algún momento.
_d42 = _re42.search(r'DENTRO_DE: .*?= \{(.*?)\n  \};', _adm42, _re42.S)
_dentro42 = set(_re42.findall(r"id: '([a-z]+)'", _d42.group(1))) if _d42 else set()
_render42 = set(_re42.findall(r"mainTab === '([a-z]+)'", _adm42))
_perdidas42 = sorted(_render42 - _menu42 - _dentro42)
check('ninguna pantalla quedó inalcanzable',
      not _perdidas42, ', '.join(_perdidas42))
check('el menú marca el MOMENTO, no la pantalla exacta',
      'momentoActual === item.id' in _adm42,
      'si marcara la pantalla, entrar a una pestaña interna apagaría el menú entero')

print('══ 7) UI ══')
botones = [f"{f.split('/')[-1]}" for f, src in todo.items() if f.endswith('.tsx')
           for m in re.finditer(r"<button(?![^>]*onClick)(?![^>]*onMouseDown)(?![^>]*type=\"submit\")[^>]*>", src)]
check('sin botones sin acción', not botones, str(botones[:4]))


print('══ 8) CONTRATOS DE DATOS (la clase de bug del brief vacío) ══')

# ── 8.1 · El espejo de tcd_profile vs lo que la app le pide ──────────────
# Historia: syncProfileToLocalStorage copiaba 7 campos. El Constructor pedía
# adn_avatar / metodo_nombre / oferta_mid y planActual() pedía plan_comercial.
# Ninguno viajaba: brief vacío para todos y TODO cliente tratado como
# 'completo' (pilar 99) sin importar qué plan compró.
_auth = rd('src/lib/auth.ts')
_m = re.search(r"localStorage\.setItem\('tcd_profile', JSON\.stringify\(\{(.*?)\}\)\);", _auth, re.S)
_escritos = set(re.findall(r'^\s*(\w+):', _m.group(1), re.M)) if _m else set()
_leidos = {}
for _f, _src in todo.items():
    if 'tcd_profile' not in _src:
        continue
    _ls = _src.split('\n')
    for _i, _l in enumerate(_ls):
        _mv = re.search(r"(?:const|let)\s+(\w+)\s*[:=][^\n]*tcd_profile", _l)
        if not _mv:
            continue
        _v = _mv.group(1)
        # Solo el bloque donde vive esa variable: mas alla hay homonimos.
        for _l2 in _ls[_i:_i + 40]:
            for _c in re.findall(rf'\b{re.escape(_v)}[?]?\.(\w+)', _l2):
                _leidos.setdefault(_c, set()).add(_f.split('/')[-1])
# El tipo manda: solo cuentan los campos que ProfileV2 declara de verdad.
_tipos = rd('src/lib/supabase.ts')
_reales = set(re.findall(r'^\s{2}(\w+)\??:', _tipos, re.M))
_falta = {k: v for k, v in _leidos.items()
          if k not in _escritos and k in _reales and k != 'plan'}
check('el espejo de tcd_profile cubre todo lo que se lee', not _falta,
      '; '.join(f'{k} ({",".join(sorted(v))})' for k, v in sorted(_falta.items())))

# ── 8.2 · `??` que muere con string vacío ───────────────────────────────
# '' NO es nullish: un campo guardado vacío se lleva puesta la cadena entera
# y el fallback no corre nunca. Usar primero() de src/lib/primero.ts.
_nn = []
for _f, _src in todo.items():
    if _f.endswith('primero.ts'):
        continue
    for _i, _l in enumerate(_src.split('\n'), 1):
        if _l.lstrip().startswith(('*', '//', '/*')):
            continue
        for _m2 in re.finditer(r"\b(guardado|stored|saved|cache|prev|perfil|profile)\.(\w+)\s*\?\?(?!\s*(?:null\b|undefined\b|''|\"\"|\[\]|\{\}|-?\d))", _l):
            # Campos numericos donde 0 es un valor legitimo del servidor.
            if _m2.group(2) in ('diario_score',):
                continue
            _nn.append(f"{_f.split('/')[-1]}:{_i} {_m2.group(1)}.{_m2.group(2)}")
check('sin `??` frágil sobre campos que pueden venir vacíos', not _nn, '; '.join(_nn[:4]))

# ── 8.3 · Campo OBJETO mostrado como texto → "[object Object]" ──────────
# adn_avatar es {edad, dolores, objeciones...}: String() lo volvía
# "[object Object]" en la cara del cliente.
_objs = set(re.findall(r'^\s{2}(\w+)\??:\s*\{', _tipos, re.M))
_oo = []
for _f, _src in todo.items():
    for _c in _objs:
        if re.search(rf'String\(\s*\w+\.{re.escape(_c)}\b', _src):
            _oo.append(f"{_f.split('/')[-1]}: String(...{_c})")
check('sin campo objeto renderizado como texto', not _oo, '; '.join(_oo[:4]))

# ── 8.4 · La pantalla no promete datos que puede no tener ───────────────
# "lo trajimos de tu ADN" sobre un formulario vacío es una mentira al cliente.
# Toda promesa debe estar dentro de un condicional que compruebe el dato.
_PROM = re.compile(r'(lo trajimos|ya está cargado desde tu ADN|autocompletado desde tu ADN)', re.I)
_pr = []
for _f, _src in todo.items():
    for _i, _l in enumerate(_src.split('\n'), 1):
        if _l.lstrip().startswith(('*', '//', '/*')):
            continue
        if _PROM.search(_l) and not re.search(r'\?|&&|length\s*===|falta', _l):
            _pr.append(f"{_f.split('/')[-1]}:{_i}")
check('sin promesas de datos sin condicional que las respalde', not _pr, '; '.join(_pr[:4]))

print()
if F == 0:
    print('════ BATERÍA EN VERDE — el ZIP puede salir ════')
else:
    print(f'════ {F} FALLOS — NO EMPAQUETAR ════'); sys.exit(1)
