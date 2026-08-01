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
    # La cola vieja se borró: su trabajo lo hace ListaDeHoy.
    _cd = rd('src/components/admin/ListaDeHoy.tsx')
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
    _lh22 = rd('src/components/admin/ListaDeHoy.tsx')
    # Copiar y marcar viven ahora en TarjetaCliente, que es la que dibuja
    # cada ítem de la lista.
    check('se puede copiar el mensaje y marcar lo hecho',
          'Copy' in rd('src/components/admin/TarjetaCliente.tsx')
          and 'Marcarla hecha' in _lh22)
    check('cuando falla la consulta lo dice en vez de verse vacía',
          'mensajeDeFalla' in _lh22)
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
          'peso' in rd('src/lib/cerebro.ts')
          and 'semanasIgual' in rd('src/lib/cerebro.ts'),
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
    _cd22 = rd('src/components/admin/ListaDeHoy.tsx')
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
          'mandarleAlCliente' in rd('src/lib/cerebroStorage.ts'))
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
for _c23 in ('ListaDeHoy', 'Supervision', 'TableroPlata', 'PanelMotorIA'):
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
    _pantallas24 = ['TableroPlata', 'ListaDeHoy', 'Supervision', 'PanelMotorIA']
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
      all(c in _pant35 for c in ('TableroCupos', 'MontajeCupos', 'MiRol', 'ListaDeHoy',
                                 'Supervision', 'SalaDeMando', 'PanelMotorIA',
                                 'TableroPlata', 'CargarSesion')))
check('se prueban con datos vacíos, que es como llegan la primera vez',
      'clientes={[]}' in _pant35)
check('una pantalla que dibuja casi nada se marca como muda',
      'PANTALLA MUDA' in _pant35)
_cola35 = rd('src/components/admin/ListaDeHoy.tsx')
check('las pantallas que cargan datos lo dicen desde el primer dibujo',
      'Mirando tu lista' in _cola35,
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
    # El texto pasó a usar el glosario: «¿Alguna <Termino p="traba" />?»
    check('el cierre pregunta qué trabó, no cuántas horas',
          'Termino p="traba"' in _js and 'se mira el viernes' in _js)
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
# `plata` ya no necesita puerta propia: se dibuja DENTRO de Supervisión, al
# tocar una fila. Antes eran dos tabs mostrando lo mismo.
_dentroDeOtra42 = {'plata'} if '<TableroPlata' in rd('src/components/admin/Supervision.tsx') else set()
_perdidas42 = sorted(_render42 - _menu42 - _dentro42 - _dentroDeOtra42)
check('ninguna pantalla quedó inalcanzable',
      not _perdidas42, ', '.join(_perdidas42))
check('el menú marca el MOMENTO, no la pantalla exacta',
      'momentoActual === item.id' in _adm42,
      'si marcara la pantalla, entrar a una pestaña interna apagaría el menú entero')

# ── 6.43 · El diagnóstico no miente ────────────────────────────────────
# El mismo CPM de $11,67 es NORMAL en España y casi el triple del techo en
# Argentina. Antes los dos se medían igual, y eso se equivoca en las dos
# direcciones: le dice "caro" a quien está bien, y "barato" a quien trae
# gente que no puede pagarle.
import os as _os43
if _os43.path.exists('src/lib/mercados.ts'):
    _mk = rd('src/lib/mercados.ts')
    _vc43 = rd('src/lib/valueChain.ts')
    _sm43 = rd('src/lib/salaDeMando.ts')
    check('los mercados son DÓNDE CORRE LA PAUTA, no dónde vive el sanador',
          'mercados?: string[]' in _vc43 and 'NO es donde vive el sanador' in _vc43)
    check('la banda del CPM sale del mercado',
          "add('cpm'" in _vc43 and 'banda.cpmMin' in _vc43)
    check('con varios países se toma el rango que abarca a todos',
          'Math.min(min' in _mk and 'Math.max(max' in _mk)
    check('y el poder de compra, del MÁS BAJO',
          'poder = Math.min' in _mk,
          'si la mitad de la audiencia no puede pagar, eso ya explica una conversión floja')
    check('existe la frecuencia y dice que NO es el creativo',
          "add('frecuencia'" in _vc43 and 'No es el creativo' in _vc43,
          'sin ese número parece que la pieza se gastó cuando el público es angosto')
    check('la app acumula sus propios datos desde el día uno',
          'export function aprenderDeSemana' in _mk)
    check('los datos propios ganan sobre la referencia',
          'SEMANAS_PARA_CONFIAR' in _mk and 'propia = true' in _mk)
    check('sin datos propios NO recomienda mercados',
          'Todavía no tengo datos propios' in _mk,
          'una recomendación inventada es peor que ninguna, y ya nos costó una vez')
    check('recomienda el que MÁS COMPRA, no el más barato',
          'pctCompra / Math.max' in _mk)
    check('existe lanzado o instalando',
          'export function situacionDe' in _sm43 and 'EstadoCampana' in _sm43)
    check('al que no encendió NUNCA se le habla de sus números',
          'export function sePuedeDiagnosticar' in _sm43
          and "estado !== 'instalando'" in _sm43,
          'no tiene conversaciones: se le dice qué le falta para encender')
    check('la ficha abre en la conversación que corresponde',
          "conversacion: 'activacion'" in _sm43 and "conversacion: 'metricas'" in _sm43)
    check('los mercados están probados',
          _os43.path.exists('scripts/prueba-mercados.ts'))

# ── 6.44 · Que el dato entre, y que se sepa qué falta ──────────────────
# Había DOS tableros cargando lo mismo sin enterarse uno del otro. Y si
# ninguno cargaba, la cola quedaba ciega: no mostraba menos, MOSTRABA QUE
# TODO ESTABA BIEN.
import os as _os44
if _os44.path.exists('src/lib/cargaCompartida.ts'):
    _cc = rd('src/lib/cargaCompartida.ts')
    _sql44 = rd('sala-de-mando.sql')
    _wh44 = rd('api/ghl-agenda.ts')
    check('cada campo sabe quién lo cargó y cuándo',
          'ValorConFirma' in _cc and 'export function firmaDe' in _cc,
          'el que entra ve qué falta y lo completa, sin coordinar nada')
    check('un campo vacío lo dice, no queda en blanco',
          'nadie lo cargó todavía' in _cc)
    check('la app NUNCA se calla: dice hasta dónde puede opinar',
          'export function hastaDondePuedoOpinar' in _cc
          and 'Todavía no puedo decirte nada' in _cc,
          'sin esto la cola mostraba «todo bien» cuando no sabía nada')
    check('y qué le falta para llegar más lejos',
          'Para seguir me' in _cc,
          'convierte el dato faltante en una tarea concreta en vez de un vacío')
    check('CERO es un dato: cargar cero no es no cargar',
          'carga[c] !== undefined' in _cc)
    check('se sabe de quién se espera cada campo',
          'SE_ESPERA_DE' in _cc,
          'sirve para saber a quién recordarle, no para bloquear a nadie')
    check('la carga vive en la base con firma por campo',
          'create table if not exists carga_semanal' in _sql44
          and 'por_quien' in _sql44)
    check('corregir un campo REEMPLAZA y el webhook SUMA',
          'guardar_campo' in _sql44 and 'sumar_campo' in _sql44
          and 'carga_semanal.valor + p_cuanto' in _sql44,
          'si el webhook reemplazara, tres agendas contarían como una')
    check('el equipo puede cargar la de cualquiera',
          'carga_equipo' in _sql44,
          'es la mitad del punto: que la cola no quede ciega')
    check('existe el webhook de agendas',
          _os44.path.exists('api/ghl-agenda.ts') and 'sumar_campo' in _wh44)
    check('el webhook nunca falla ruidosamente',
          'GHL reintenta' in _wh44,
          'un reintento que suma dos veces ensucia la semana entera: mejor perder una agenda que contar de más')
    check('los mercados y el estado de campaña están en la base',
          'add column if not exists mercados text[]' in _sql44
          and 'campana_desde' in _sql44)
    check('la carga compartida está probada',
          _os44.path.exists('scripts/prueba-carga.ts'))

# ── 6.45 · Un mapa único: la cola y los entrenadores ───────────────────
# La cadena habla en idioma de tablero («conversan mucho y agendan poco») y
# eso no le alcanza a nadie para organizarse: quien atiende piensa en ÁREAS,
# porque cada una se atiende distinto y con otra persona.
import os as _os45, re as _re45
if _os45.path.exists('src/lib/microPasos.ts'):
    _mp45 = rd('src/lib/microPasos.ts')
    _ag45 = rd('src/pages/Agentes.tsx')

    # TODO indicador de la cadena tiene que tener su micro-paso, y ninguno
    # del mapa puede apuntar a un indicador que no existe.
    _cuellosVC = set(_re45.findall(r"add\('([a-z_]+)'", rd('src/lib/valueChain.ts')))
    _cuellosMP = set(_re45.findall(r"cuello: '([a-z_]+)'", _mp45))
    check('todo indicador de la cadena tiene su micro-paso',
          not (_cuellosVC - _cuellosMP), str(sorted(_cuellosVC - _cuellosMP)))
    check('y el mapa no apunta a indicadores que no existen',
          not (_cuellosMP - _cuellosVC), str(sorted(_cuellosMP - _cuellosVC)))

    # Los entrenadores del mapa tienen que ser los que existen de verdad.
    _reales = set()
    for _f in _os45.listdir('src/lib/agents'):
        if _f.endswith('.ts') and _f not in ('index.ts', 'types.ts'):
            if 'ConfigAgente' in rd(f'src/lib/agents/{_f}'):
                _reales.add(_f[:-3])
    # Solo el bloque DE_QUE_SE_OCUPA: el patrón ancho agarraba también los
    # nombres de las ÁREAS, que no son entrenadores.
    _bloque45 = _re45.search(r'DE_QUE_SE_OCUPA[^=]*= \{(.*?)\n\};', _mp45, _re45.S)
    _delMapa = set(_re45.findall(r"^  ([a-z]+):", _bloque45.group(1), _re45.M)) if _bloque45 else set()
    check('los entrenadores del mapa existen de verdad',
          _delMapa <= _reales or not (_delMapa - _reales),
          str(sorted(_delMapa - _reales)))

    check('cada micro-paso dice qué significa en idioma de negocio',
          _mp45.count('significa:') >= 15)
    check('lo que no es de un entrenador dice a quién va',
          "a: 'dev'" in _mp45)
    check('el entrenador abre sabiendo, sin preguntar lo que ya sabe',
          'export function briefingPara' in _mp45 and 'no se lo preguntes' in _mp45,
          'el que no sabe qué preguntar es el que más ayuda necesita')
    check('los ocho reciben la MISMA regla de derivación',
          'export function bloqueDeDerivacion' in _mp45
          and 'bloqueDeDerivacion(' in _ag45,
          'antes cada uno tenía su lista a mano y Diego no tenía ninguna')
    check('un entrenador no se deriva a sí mismo',
          'filter((e) => e !== yo)' in _mp45)
    check('la cola se agrupa por área, en el orden del embudo',
          'export function agruparPorArea' in _mp45,
          'tres casos de setting juntos cuestan menos que saltar entre temas')
    check('un cuello desconocido no se pierde de la cola',
          'sinArea.length > 0' in _mp45)
    check('el mapa está probado contra la cadena real',
          _os45.path.exists('scripts/prueba-micropasos.ts'))

# ── 6.46 · Nada construido queda suelto ────────────────────────────────
# La clase de error más silenciosa de todas: un motor probado, verde en toda
# la batería, que ninguna pantalla usa. Pasó con «lanzado o instalando»: el
# modelo funcionaba y NADIE PODÍA MARCAR UNA CAMPAÑA COMO ENCENDIDA, así que
# todos los clientes quedaban «instalando» para siempre.
import glob as _g46, re as _re46, os as _os46
_SRC46 = {f: rd(f) for f in _g46.glob('src/**/*.ts*', recursive=True)}
_SCR46 = {f: rd(f) for f in _g46.glob('scripts/*.ts*')}

# Todo campo del modelo que se LEE tiene que poder ESCRIBIRSE desde algún lado.
_camposClave = ['campana_desde', 'mercados', 'impresiones']
_sinEscribir = []
for _c46 in _camposClave:
    _escribe = any(_re46.search(rf'{_c46}:\s*(new Date|\[|[a-z])', _s)
                   for _f, _s in _SRC46.items() if '/lib/' in _f or '/components/' in _f)
    if not _escribe: _sinEscribir.append(_c46)
check('todo campo que la app lee se puede escribir desde algún lado',
      not _sinEscribir, ', '.join(_sinEscribir))

check('se puede marcar una campaña como encendida',
      'export async function marcarEncendida' in rd('src/lib/salaDeMandoStorage.ts')
      and 'marcarEncendida' in rd('src/components/admin/Supervision.tsx'),
      'sin esto, todos los clientes quedan «instalando» para siempre')
check('pausar conserva desde cuándo estuvo al aire',
      'sin borrar desde cuándo' in rd('src/lib/salaDeMandoStorage.ts'),
      'al reanudar, saber que ya estuvo 20 días corriendo cambia el diagnóstico')

# ── 6.47 · El Admin mide reducción, no esfuerzo ────────────────────────
# La app medía los minutos de humano por cliente EN TOTAL. Y en total no sirve
# para decidir nada: si bajaron de 44 a 38, ¿fue porque una instalación
# terminó o porque un aviso automático destrabó tres cuentas? La primera es
# aritmética. La segunda es que el negocio escaló.
import os as _os47
if _os47.path.exists('src/lib/funciones.ts'):
    _fn = rd('src/lib/funciones.ts')
    _tf = rd('src/components/admin/TablaFunciones.tsx')
    # 7 y no 6: la interfaz declara el campo una vez y suma uno. Es el mismo
    # error de conteo que ya cometí con los roles.
    check('las seis funciones se definen por lo que pasa si NADIE las hace',
          _fn.count('siNadie:') == 7)
    check('cada función declara su DESTINO con el porqué escrito',
          _fn.count('destino:') >= 7 and _fn.count('porQue:') >= 6,
          'una que debe reducirse y no se reduce en seis meses es una que nadie está atacando')
    check('el criterio queda humano y absorber es la única que crece',
          "destino: 'permanente'" in _fn and "destino: 'crece'" in _fn)
    check('la lectura sale del DESTINO, no del número',
          "case 'crece':" in _fn and "case 'permanente':" in _fn,
          'que absorber baje es una mala noticia disfrazada de buena')
    check('absorber en cero es la peor noticia de la tabla',
          'Nadie trabajó en absorber' in _fn)
    check('bajar CON hito declarado se distingue de bajar sin explicación',
          'haber construido algo' in _fn and 'aritmética' in _fn,
          'es la única forma de saber si el negocio escaló')
    check('LA DECLARACIÓN SE VERIFICA CONTRA LA REALIDAD',
          'La estimación estaba mal' in _fn,
          'sin esta verificación, «lo automatizamos» es una frase; con ella, es un dato')
    check('que el criterio suba NO es una alarma, y se dice por qué',
          'no un problema' in _fn and 'tres meses seguidos' in _fn)
    check('el gradiente por ticket está declarado',
          'MINUTOS_QUE_PERMITE' in _fn and 'mil: 0' in _fn,
          'un cliente de $1.000 tiene que costar cero: es el modelo de negocio')
    check('el exceso se convierte en tarea, no en queja sobre el cliente',
          'deuda que absorber tiene que pagar' in _fn)
    check('la reunión abre con UNA sola pregunta',
          '¿Qué función bajó sus minutos, y por qué?' in _tf)
    check('la tabla solo la ve quien ve el rendimiento del equipo',
          'veRendimiento && (' in rd('src/components/admin/LaSemana.tsx'),
          'es información de dirección, no de todo el equipo')
    check('la medición por función está probada',
          _os47.path.exists('scripts/prueba-funciones.ts'))

# ── 6.48 · El criterio escrito y el glosario en su lugar ────────────────
# De las diez situaciones que van a pasar, siete las resuelve la cola. LAS
# TRES QUE QUEDAN SON TODAS DE CRITERIO — y eso explicaba por qué terminaban
# en una pregunta hacia dirección: no había criterio escrito para ellas.
import os as _os48
if _os48.path.exists('src/lib/criterio.ts'):
    _cr = rd('src/lib/criterio.ts')
    _gl = rd('src/lib/glosario.ts')
    check('las tres situaciones de criterio están escritas',
          _cr.count('cuando:') >= 3 and 'trabado_en_su_metodo' in _cr
          and 'pide_fuera_de_plan' in _cr and 'quiere_pausar' in _cr)
    check('cada una dice lo que PASA DE VERDAD, no solo qué hacer',
          _cr.count('loQuePasa:') >= 4)
    check('cada una trae el mensaje listo y su LÍMITE',
          _cr.count('comoSeDice:') >= 4 and _cr.count('hastaCuando:') >= 4,
          'una salida por defecto sin límite se vuelve la regla')
    check('cada negativa tiene su porqué',
          _cr.count('porque:') >= 7)
    check('prohíbe retener con descuento, con el motivo',
          'descuento' in _cr and 'se va igual el mes que viene' in _cr)
    check('una pausa sin fecha se llama por su nombre',
          'baja que nadie quiso decir' in _cr)
    check('y nombra lo incómodo: aceptar la baja sin mirar la cadena es falla nuestra',
          'falla de seguimiento' in _cr)
    check('tres pedidos iguales dejan de ser excepción',
          'VECES_PARA_SER_PRODUCTO' in _cr and 'señal de producto' in _cr)
    check('REUSA el agrupador de trabas en vez de escribir otro',
          'agruparTrabas' in _cr,
          'dos agrupadores de texto parecido agrupan distinto y el mismo pedido cuenta dos veces')
    check('y su límite está documentado',
          'no por significado' in _cr,
          'agrupa palabras parecidas; agrupar por significado pediría una llamada de modelo')

if _os48.path.exists('src/lib/glosario.ts'):
    _gl48 = rd('src/lib/glosario.ts')
    import re as _re48
    _terminos48 = _re48.findall(r"^  ([a-z_]+): \{", _gl48, _re48.M)
    check(f'el glosario tiene 12 términos, no más ({len(_terminos48)})',
          len(_terminos48) == 12,
          'si crece deja de ser un glosario y se vuelve otro documento que nadie lee')
    check('cada término se explica sin jerga',
          _gl48.count('que:') >= 12)
    check('la mayoría dice POR QUÉ está definido así',
          _gl48.count('porQue:') >= 9)
    check('la palabra se explica DONDE aparece',
          _os48.path.exists('src/components/Termino.tsx'))
    check('si la palabra no está, no rompe la frase',
          'if (!t) return <>{texto}</>' in rd('src/components/Termino.tsx'))
    check('el criterio y el glosario están probados',
          _os48.path.exists('scripts/prueba-criterio.ts'))

# ── 6.49 · EL TEST DE GERBER, AUTOMATIZADO ─────────────────────────────
#
# Michael Gerber, en The E-Myth Revisited: «si no podés escribir exactamente
# cómo se hace algo, darle ese documento a alguien nuevo, y que produzca el
# mismo resultado — no tenés un sistema, tenés una dependencia».
#
# Esta lente lo convierte en un chequeo: TODO CONCEPTO DEL SISTEMA QUE UNA
# PANTALLA DEL EQUIPO MUESTRE TIENE QUE PODER EXPLICARSE AHÍ MISMO. Si aparece
# «cuello de botella» y no hay forma de saber qué es sin preguntarle a alguien,
# eso es una dependencia.
import os as _os49, re as _re49, glob as _g49
if _os49.path.exists('src/lib/glosario.ts'):
    _gl49 = rd('src/lib/glosario.ts')
    # Las palabras del glosario, como aparecen en pantalla.
    _palabras49 = [m.lower() for m in _re49.findall(r"palabra: '([^']+)'", _gl49)]
    # Las pantallas del equipo.
    _pantallas49 = _g49.glob('src/components/admin/*.tsx')
    _sinExplicar49 = []
    for _f49 in _pantallas49:
        _s49 = rd(_f49)
        # El texto que ve el usuario: entre etiquetas y en cadenas.
        _visible49 = ' '.join(_re49.findall(r'>([^<>{}]{3,120})<', _s49)).lower()
        _tieneTermino = 'Termino' in _s49 or 'buscarTermino' in _s49
        for _p49 in _palabras49:
            # Palabra completa: «traba» estaba dentro de «trabajando» y de
            # «trabajo», y la lente marcaba pantallas que no la usaban.
            if _re49.search(rf'\b{_re49.escape(_p49)}\b', _visible49) and not _tieneTermino:
                _sinExplicar49.append(f'{_os49.path.basename(_f49)[:-4]}: «{_p49}»')
    check('todo concepto del sistema se puede explicar donde aparece',
          not _sinExplicar49, '; '.join(sorted(set(_sinExplicar49))[:4]))

# Y el objetivo y los principios tienen que estar DENTRO de la app, no solo en
# un archivo de la raíz que nadie que no sea programador va a abrir.
if _os49.path.exists('src/lib/casa.ts'):
    _ca49 = rd('src/lib/casa.ts')
    check('el objetivo estratégico vive dentro de la app',
          'export const OBJETIVO' in _ca49 and 'elNumero' in _ca49,
          'un archivo en la raíz de un repo no lo abre nadie que no sea programador')
    check('los principios dicen qué discusión resuelve cada uno',
          _ca49.count('resuelve:') >= 7,
          'si no resuelven una discusión concreta, son valores de pared')
    check('la inducción son dos horas de contenido, no un mes',
          'MINUTOS_DE_CONTENIDO' in _ca49 and _ca49.count('minutos: 20') == 6)
    check('cada sesión termina en una acción real, no en un quiz',
          _ca49.count('accion:') >= 6)
    check('y cada una justifica por qué no se puede aprender trabajando',
          _ca49.count('porQueAntes:') >= 6,
          'lo que se puede aprender haciendo no va en la inducción')
    check('lo que queda afuera dice dónde se aprende',
          'SE_APRENDE_EN_EL_LUGAR' in _ca49,
          'para que nadie sienta que le falta algo por olvido')
    check('la inducción está dentro de la app y montada',
          _os49.path.exists('src/components/admin/LaCasa.tsx')
          and 'LaCasa' in rd('src/pages/Admin.tsx'))
    check('el objetivo y los principios están probados',
          _os49.path.exists('scripts/prueba-casa.ts'))

# ── 6.50 · Lo que el cliente escribe no se pierde ──────────────────────
# El cronómetro y la emoción ya vivían en session_logs. Lo que el cliente
# ESCRIBE —su método, su oferta, su avatar— vivía SOLO en el navegador. Si
# cambiaba de teléfono o limpiaba el navegador, lo perdía. Y LAS SESIONES
# GUIADAS SON EL PRODUCTO.
import os as _os50
if _os50.path.exists('src/lib/respuestasSesion.ts'):
    _rs = rd('src/lib/respuestasSesion.ts')
    _pl = rd('src/components/SesionGuiadaPlayer.tsx')
    _sq = rd('sala-de-mando.sql')
    check('lo que el cliente escribe se guarda en la base',
          'create table if not exists sesion_respuestas' in _sq
          and 'guardarEnLaBase' in _rs)
    check('y el player lo sube en cada paso',
          'subir(st)' in _pl,
          'antes solo escribía en localStorage')
    check('la base manda sobre el navegador',
          'leerLoQueEscribio' in _pl and 'La base manda' in _rs,
          'si empezó en el teléfono y sigue en la computadora, tiene que ver lo que escribió')
    check('si el guardado no llegó, se avisa',
          'sinSubir' in _pl and 'seguir en silencio' in _rs,
          'un guardado que no llegó y nadie dijo nada es la peor forma de perder algo')
    check('el equipo puede leer lo que escribió sin pedirle que lo reenvíe',
          'sesion_resp_equipo' in _sq)

# ── 6.51 · Un solo vocabulario de ticket ───────────────────────────────
# planes.ts gobierna el acceso con colores y cuadroTickets con montos, y NADA
# traducía entre los dos. Por eso el cuadro estaba construido, probado y sin
# montar: la app no sabía que un cliente «verde» es uno de $5.000.
if _os50.path.exists('src/lib/cuadroTickets.ts'):
    _ct50 = rd('src/lib/cuadroTickets.ts')
    check('existe el puente plan ↔ ticket',
          'TICKET_DE_PLAN' in _ct50 and 'export function ticketDe' in _ct50)
    check('un plan desconocido cae en el ticket MÁS BAJO',
          "?? 'mil'" in _ct50,
          'mostrar de menos se arregla con un mensaje; mostrar de más enseña que no hacía falta pagar')
    check('el cuadro está MONTADO, no suelto',
          _os50.path.exists('src/components/admin/CuadroDelCliente.tsx')
          and 'CuadroDelCliente' in rd('src/pages/Admin.tsx'),
          'el de $5.000 tiene que ver lo que compró')

# ── 6.52 · El soporte, con reloj y compromiso ──────────────────────────
# El circuito funcionaba, pero si nadie respondía NADA lo señalaba. Tres días
# de silencio en un producto de miles es la diferencia entre un cliente y un
# reembolso.
if _os50.path.exists('src/lib/soporte.ts'):
    _so = rd('src/lib/soporte.ts')
    check('hay un compromiso de respuesta, con número',
          'COMPROMISO' in _so and 'horas: 24' in _so and 'horas: 4' in _so,
          'un número que se puede fallar es mejor que ninguno')
    check('una duda y algo roto se tratan distinto',
          "'duda'" in _so and "'roto'" in _so
          and "vaA: 'absorber'" in _so,
          'una espera un día; algo roto le está costando dinero ahora')
    check('el mensaje sin responder aparece, con su reloj',
          'export function mensajesQueEsperan' in _so and 'vencido' in _so)
    check('lo vencido va primero, no lo que llegó primero',
          'vencido ? 10_000 : 0' in _so)
    check('y NO se ordena por ticket',
          'ticket a propósito' in _so,
          'quien pagó menos y lleva tres días esperando está más cerca de irse')
    check('el marcador mide el % respondido dentro de lo prometido',
          'pctATiempo' in _so)
    check('una bandeja vacía con mal porcentaje IGUAL es alarma',
          'pct < 80' in _so,
          'se responde tarde y después se pone al día, y el cliente ya lo sintió')
    check('el soporte y el puente están probados',
          _os50.path.exists('scripts/prueba-soporte.ts'))

# ── 6.53 · Lo que el cliente carga LLEGA AL EQUIPO ─────────────────────
#
# LA PEOR FORMA DE FALLAR: el cliente hace su parte y el sistema no se entera.
# El tablero guardaba los números solo en el navegador, y la cola del equipo
# lee de la base — así que el cliente podía cargar todas las semanas y LA COLA
# QUEDABA CIEGA IGUAL, mostrando «todo bien» sobre una cuenta de la que no
# sabía nada.
import os as _os53
if _os53.path.exists('src/lib/tableroSync.ts'):
    _ts53 = rd('src/lib/tableroSync.ts')
    _tc53 = rd('src/components/campanas/TableroCupos.tsx')
    check('los números del tablero suben a la base',
          'subirNumerosDelCliente' in _ts53 and 'subirNumerosDelCliente' in _tc53)
    check('y la cadena de props llega hasta el tablero',
          'clienteId' in rd('src/components/campanas/MontajeCupos.tsx')
          and 'clienteId={userId}' in rd('src/pages/Campanas.tsx'),
          'sin el id, sube a la nada')
    check('subir no corta la pantalla si falla la red',
          'no lanza si falla' in _ts53 or 'No lanza si falla' in _ts53,
          'el cliente ya vio su número guardado: cortarle la pantalla sería peor')
    check('el tipo no se duplica entre el tablero y la subida',
          'NO define la forma' in _ts53,
          'dos tipos con el mismo nombre terminan separándose')

# Y la regla general de esta clase, para que no vuelva a pasar:
# toda pantalla del CLIENTE que guarde algo que el EQUIPO necesita ver tiene
# que subirlo. Se verifican las tres que cargan datos de negocio.
import re as _re53
for _f53, _que53 in [
    ('src/components/campanas/TableroCupos.tsx', 'los números de la semana'),
    ('src/components/SesionGuiadaPlayer.tsx', 'lo que escribe en sus sesiones'),
    # El brief y los anuncios los PAGÓ CON CRÉDITOS: perderlos significa
    # volver a pagar por generarlos.
    ('src/components/campanas/ConstructorAnuncios.tsx', 'el brief y los anuncios que pagó'),
]:
    if _os53.path.exists(_f53):
        _s53 = rd(_f53)
        _sube = bool(_re53.search(r'subir|guardarEnLaBase|subirNumeros|guardarTrabajoDeCampanas', _s53))
        check(f'{_os53.path.basename(_f53)[:-4]} sube {_que53}',
              _sube, 'si no sube, el cliente hace su parte y nadie se entera')

# ── 6.54 · La venta automática aguanta el crecimiento ──────────────────
# `listUsers()` sin paginar devuelve SOLO LA PRIMERA PÁGINA —cincuenta
# usuarios—, así que a partir del cliente 51 no encontraba a quien ya existía
# e intentaba crearlo de nuevo. Un error que no se ve hasta que el negocio
# crece, que es exactamente cuando peor duele.
import os as _os54
if _os54.path.exists('api/ghl-webhook.ts'):
    _wh54 = rd('api/ghl-webhook.ts')
    check('el webhook de pago busca por perfil, no por la primera página',
          "from('profiles').select('id').eq('email'" in _wh54)
    check('y si tiene que paginar, pagina de verdad',
          'perPage: 200' in _wh54 and 'pagina <= 20' in _wh54,
          'listUsers() sin argumentos trae 50 y calla el resto')
    check('el motivo está escrito, para que nadie lo vuelva atrás',
          'a partir del cliente 51' in _wh54)

# ── 6.55 · Fallar no puede costar dinero ───────────────────────────────
#
# INCIDENTE REAL: una clienta recibió FUNCTION_INVOCATION_FAILED y después «ya
# no me deja hacer nada». La cadena: el modelo tardó de más → Vercel MATÓ la
# función → como el proceso murió, `deshacerCobro` NUNCA CORRIÓ → el crédito
# quedó cobrado por una llamada que no respondió → reintentó → se quedó sin
# créditos.
#
# El problema no era la lentitud: era que FALLAR COSTABA DINERO.
import os as _os55, glob as _g55, re as _re55
if _os55.path.exists('api/_lib/tope.ts'):
    _tp55 = rd('api/_lib/tope.ts')
    check('las llamadas a la IA tienen su propio tope de tiempo',
          'TOPE_MS' in _tp55 and 'AbortController' in _tp55)
    check('y el tope es MÁS CORTO que el de la plataforma',
          '45_000' in _tp55,
          'así la función siempre llega a responder y a devolver el crédito')
    check('el tope está aplicado a la llamada real',
          'signal,' in rd('api/_lib/deepseek.ts')
          and 'limpiar()' in rd('api/_lib/deepseek.ts'))
    # TODA llamada a un proveedor de IA, no solo la de texto. Generar una
    # imagen tarda MÁS, así que ese endpoint es todavía más propenso.
    _sinTope55 = []
    for _f55 in _g55.glob('api/**/*.ts', recursive=True):
        _s55 = rd(_f55)
        if _re55.search(r'fetch\([\'"`]https://api\.(openai|anthropic|deepseek|generativelanguage)', _s55):
            if 'signal' not in _s55: _sinTope55.append(_os55.path.basename(_f55))
    check('NINGUNA llamada a un proveedor de IA queda sin tope',
          not _sinTope55, ', '.join(_sinTope55))
    _largos55 = [f for f in _g55.glob('api/ai/*.ts') if 'maxDuration: 120' in rd(f)]
    check('ninguna función pide más tiempo del que la plataforma da',
          not _largos55, ', '.join(_largos55))
    check('el motivo está escrito, para que nadie lo suba de nuevo',
          'deshacerCobro' in rd('api/ai/generate.ts'))

# ── 6.56 · EL CEREBRO: una sola lista de trabajo ───────────────────────
#
# La cola detectaba, escribía la acción, y ahí se terminaba: no creaba tarea,
# no quedaba asignada, no se podía modificar, desaparecía al recargar. Eran
# DOS LISTAS QUE NUNCA SE VEÍAN JUNTAS, y por eso nadie podía entender su día
# ni contestar «¿por qué esta tarea?».
import os as _os56
if _os56.path.exists('src/lib/cerebro.ts'):
    _cb = rd('src/lib/cerebro.ts')
    _cs = rd('src/lib/cerebroStorage.ts')
    _sq56 = rd('sala-de-mando.sql')
    check('la cola CREA tareas, no las muestra y las olvida',
          'crear_tarea_del_sistema' in _sq56 and 'crearDesdeElSistema' in _cs)
    check('una causa, una tarea: no se duplica',
          'tarea_por_causa' in _sq56 and 'on conflict' in _sq56,
          'cada recálculo crearía otra tarea por el mismo cuello y la lista sería inusable')
    check('las cinco fuentes están, cada una con su origen',
          all(f'desde{x}' in _cb for x in ('LaCadena', 'ElSoporte', 'ElRecorrido', 'UnaSesion')))
    check('cada origen se explica solo',
          'export const POR_QUE' in _cb,
          'es lo que contesta «¿por qué esta tarea?» sin que nadie pregunte')
    check('cada tarea sabe A DÓNDE LLEVA',
          'ETIQUETA_DESTINO' in _cb and 'Abrir el Creador' in _cb,
          'nunca «buscalo vos»: siempre un botón que abre lo que hace falta')
    check('lo VENCIDO va primero, venga de donde venga',
          'a.vencida ? -1 : 1' in _cb,
          'una tarea vencida ya falló una vez')
    check('alguien esperando respuesta pesa más que el peor cuello',
          'vencido ? 100_000' in _cb,
          'una cuenta rota se destraba mañana; una persona esperando se va hoy')
    check('lo técnico y lo de criterio NO se resuelven con un mensaje al cliente',
          "esTecnico || esCriterio ? 'escalar'" in _cb)
    check('la lista de Hoy es LA MISMA que la de Tareas',
          'mi_lista_de_hoy' in _sq56 and 'miListaDeHoy' in _cs,
          'tener dos listas es lo que hizo que nadie entendiera su día')

    # EL BOTÓN QUE MENTÍA.
    check('«Mandárselo» manda de verdad',
          'export async function mandarleAlCliente' in _cs
          and "from('mensajes').insert" in _cs,
          'antes solo tachaba el ítem: el botón prometía algo y quien lo tocaba creía que pasó')
    check('y el cliente se entera aunque no tenga la app abierta',
          "from('notificaciones').insert" in _cs)
    check('el cerebro está probado',
          _os56.path.exists('scripts/prueba-cerebro.ts'))

# ── 6.57 · Cada tarea lleva a donde se resuelve ────────────────────────
# Es lo que la vuelve útil en vez de una lista de recordatorios. Y el destino
# es un CONTRATO, no una URL: una URL suelta obliga a quien la escribe a saber
# cómo está armada la app, y el día que una pantalla cambia de nombre los
# botones dejan de andar EN SILENCIO.
import os as _os57
if _os57.path.exists('src/lib/cerebro.ts'):
    _cb57 = rd('src/lib/cerebro.ts')
    _lh57 = rd('src/components/admin/ListaDeHoy.tsx')
    _ad57 = rd('src/pages/Admin.tsx')
    check('el destino es un contrato, no una URL',
          'AperturaDeTarea' in _cb57 and 'export function comoSeResuelve' in _cb57)
    check('y la pantalla que sabe navegar decide CÓMO',
          'abrirDestino' in _ad57 and 'onAbrir' in _lh57)
    check('un mensaje NO navega: se manda desde donde está',
          'Sacarla de su lista para escribir' in _cb57,
          'mandar a alguien a otra pantalla a escribir un mensaje que ya está escrito es trabajo inventado')
    check('el creador se abre CON EL BRIEF CARGADO',
          'con su brief cargado' in _cb57,
          'pedirle a alguien que copie el brief de una pantalla a otra es el trabajo que sobra')
    check('el escalado sabe a quién va y por qué',
          'export function aQuienEscala' in _cb57)
    check('y al cliente se le avisa siempre que se escala',
          'export function avisoDeEscalado' in _cb57,
          'el silencio mientras alguien espera es lo que rompe la confianza')
    check('la lista dice POR QUÉ está cada tarea y por qué ahí',
          'porQueAca' in _lh57 and 'POR_QUE[t.origen]' in _lh57)
    check('si el mensaje no salió, se dice',
          'No salió: prueba de nuevo' in _lh57,
          'creer que salió cuando no salió es el error que esta pantalla vino a arreglar')
    check('sin persona identificada no queda un cargando eterno',
          'No se pudo identificar tu usuario' in _lh57,
          'un «mirando…» que nunca termina parece que la app se colgó')

# ── 6.58 · Los frenos de atención ──────────────────────────────────────
# LA REGLA QUE LOS HACE FUNCIONAR: si aparecen siempre, dejan de frenar a
# nadie. Un diálogo que sale en cada clic se contesta sin leerlo en tres días,
# y ahí es PEOR que no tenerlo: da una sensación de control que no existe.
import os as _os58
if _os58.path.exists('src/lib/frenos.ts'):
    _fr = rd('src/lib/frenos.ts')
    check('son tres niveles y nada más',
          "'confirmar' | 'escribir' | 'testigo'" in _fr)
    check('la pregunta para asignar nivel es qué pasa SI SE HACE POR ERROR',
          '¿Qué pasa si se hace por error?' in _fr,
          'no «¿esto es importante?», porque todo parece importante')
    check('NINGÚN freno pregunta «¿estás seguro?»',
          'estás seguro' not in _fr.lower(),
          'preguntar eso no informa nada: el título tiene que decir QUÉ VA A PASAR')
    check('encender una campaña pide escribir la palabra',
          "palabra: 'ENCENDER'" in _fr,
          'el gasto empieza en ese momento y quien lo aprueba tiene que estar mirando')
    check('lo que le pasa a un tercero deja constancia',
          "nivel: 'testigo'" in _fr and 'lo va a ver' in _fr,
          'el registro no es control: es que el que decide sepa que decide')
    check('escribir la palabra no exige teclear bien',
          'toUpperCase()' in _fr,
          'el freno es para que lea, no para que teclee')
    check('la lista de frenos tiene tope',
          'TOPE_POR_NIVEL' in _fr,
          'cada freno nuevo le quita fuerza a los que ya están')
    check('el diálogo existe y distingue los tres niveles',
          _os58.path.exists('src/components/Freno.tsx')
          and 'ShieldAlert' in rd('src/components/Freno.tsx'))

# ── 6.59 · La Casa, completa ───────────────────────────────────────────
if _os58.path.exists('src/lib/casa.ts'):
    _ca59 = rd('src/lib/casa.ts')
    _lc59 = rd('src/components/admin/LaCasa.tsx')
    check('cada sesión trae números concretos',
          _ca59.count('datos:') >= 6,
          'no «el presupuesto importa» sino los $6,50 por día y los 50 eventos semanales')
    check('el espacio del video existe aunque el video no',
          'Video pendiente de grabar' in _lc59,
          'así se sabe qué falta, en vez de no saber que faltaba')
    check('está la historia, con lo pendiente marcado',
          'HISTORIA' in _ca59 and 'pendiente?: boolean' in _ca59,
          'sin esto el equipo vende un sistema; con esto vende una convicción')
    check('y lo que solo puede escribir Javo está señalado',
          _ca59.count('pendiente: true') == 3)
    check('el sistema por dentro contesta las siete preguntas',
          'SISTEMA_POR_DENTRO' in _ca59 and _ca59.count('pregunta:') >= 7,
          'es lo que permite defender una decisión de la app ante un cliente que la cuestiona')
    check('admite el error propio del benchmark ajeno',
          'nos pasó' in _ca59)
    check('los valores dicen QUÉ CUESTAN',
          'cuestaEsto' in _ca59 and 'loAceptamosPorque' in _ca59,
          'un valor sin costo es una frase')
    check('los frenos y La Casa están probados',
          _os58.path.exists('scripts/prueba-frenos.ts'))

# ── 6.60 · El cliente también tiene UNA lista ──────────────────────────
# Tenía cinco lugares distintos —su Camino, su cuadro, su tablero, sus piezas
# y sus avisos—. Cada uno le decía algo cierto y ninguno le decía QUÉ HACER
# AHORA. Y EL QUE ABRE LA APP SIN SABER QUÉ HACER, CIERRA LA APP.
import os as _os60
if _os60.path.exists('src/lib/cerebroCliente.ts'):
    _cc60 = rd('src/lib/cerebroCliente.ts')
    check('la lista del cliente es CORTA a propósito',
          'CUANTAS_A_LA_VEZ' in _cc60 and 'paraliza' in _cc60,
          'un sanador que ve quince pendientes no elige el más importante: cierra la app')
    check('cargar los números gana a todo lo demás',
          'es lo único que desbloquea' in _cc60 or 'desbloquea a las otras' in _cc60,
          'no porque sea lo más importante: porque sin números la app no puede decirle nada más')
    check('publicar va ÚLTIMO, con su motivo',
          'generar piezas nuevas es más fácil' in _cc60.lower()
          or 'Generar otra no sirve' in _cc60,
          'por eso mucha gente se queda generando en vez de publicar')
    check('al que no lanzó NUNCA se le piden números',
          'x.lanzado && x.numerosSinCargar' in _cc60)
    check('los primeros días mandan sobre el «todo al día»',
          'no necesita que lo feliciten' in _cc60,
          'sin eso apaga la campaña el martes porque «no estaba pasando nada»')
    check('cada tarea dice CUÁNTO le lleva',
          'minutos: number' in _cc60,
          'no saber cuánto tarda algo es lo que frena a la gente')
    check('y el botón del entrenador no dice «agente» ni «IA»',
          "entrenador: 'Hablar con quien sabe'" in _cc60)
    check('el orden del cliente NO es por dinero en riesgo',
          'qué lo desbloquea' in _cc60,
          'el equipo elige CUÁL cuenta atender; el cliente necesita saber QUÉ PASO SIGUE')
    check('la lista del cliente está probada',
          _os60.path.exists('scripts/prueba-cliente.ts'))

# ── 6.61 · Una sola fuente de verdad para «la campaña está encendida» ──
#
# El cliente encendía desde su pantalla y guardaba la fecha SOLO en su
# navegador, mientras `campana_desde` vivía en la base. DOS FUENTES DE VERDAD
# para el mismo hecho: el cliente encendía, el equipo no se enteraba, la
# cuenta quedaba «instalando» para siempre, su diagnóstico nunca se activaba,
# y NADIE MIRABA UNA CUENTA QUE YA ESTABA GASTANDO DINERO.
import os as _os61
if _os61.path.exists('src/components/campanas/MontajeCupos.tsx'):
    _mc61 = rd('src/components/campanas/MontajeCupos.tsx')
    check('encender avisa a la base, no solo al navegador',
          'marcarEncendida' in _mc61,
          'si no, el cliente enciende y el equipo no se entera')
    check('y pausar también',
          'marcarPausada' in _mc61)
    check('encender pasa por el freno de escribir la palabra',
          "frenoDe('encender_campana'" in _mc61 and 'confirmando' in _mc61,
          'es lo más caro que hace la app: el gasto empieza en ese momento')
    check('el freno se usa de verdad en algún lado',
          'from \'../Freno\'' in _mc61 or "from '../Freno'" in _mc61,
          'un freno construido y sin usar no frena nada')
    check('el cuadro por ticket está MONTADO de verdad',
          '<CuadroDelCliente' in rd('src/pages/Admin.tsx'),
          'estuvo construido, probado y con el import puesto, pero sin dibujarse')

# ── 6.62 · No hay dos listas dibujadas a la vez ────────────────────────
#
# Construí ListaDeHoy y NO SAQUÉ ColaDelDia: quedaron las dos apiladas en la
# misma pantalla, mostrando lo mismo, con un botón que decía «Mandárselo» y
# no mandaba nada al lado de uno que sí. Agregar sin sacar es exactamente el
# error que esta app existe para evitar.
import re as _re62, os as _os62
_adm62 = rd('src/pages/Admin.tsx')
check('la cola vieja no se monta en ningún lado',
      '<ColaDelDia' not in _adm62,
      'quien tocaba su botón creía que el mensaje había salido')
check('y en Hoy hay UNA sola lista',
      _adm62.count('<ListaDeHoy') == 1)
check('el archivo viejo se borró, no se dejó dando vueltas',
      not _os62.path.exists('src/components/admin/ColaDelDia.tsx'),
      'un archivo que nadie monta es lo que alguien vuelve a montar por error')

# ── 6.63 · NINGÚN cliente de IA queda sin tope ─────────────────────────
#
# Lo arreglé tres veces, de a uno: primero deepseek (le pasó a Ale), después
# el endpoint de imágenes, y ahora claude vía SDK (le estaba pasando a Mariana
# con el Mentor). LA LECCIÓN: arreglarlo archivo por archivo garantiza que el
# próximo también nazca sin tope. Esta lente barre TODOS los caminos.
import os as _os63, glob as _g63, re as _re63
_sinTope63 = []
for _f63 in _g63.glob('api/**/*.ts', recursive=True):
    _s63 = rd(_f63)
    # Camino 1: fetch directo a un proveedor.
    if _re63.search(r"fetch\(['\"`]https://api\.(openai|anthropic|deepseek|generativelanguage)", _s63):
        if 'signal' not in _s63: _sinTope63.append(f'{_os63.path.basename(_f63)} (fetch)')
    # Camino 2: un SDK que hace la llamada por vos. Es el que se me escapó.
    if _re63.search(r"new (Anthropic|OpenAI|GoogleGenerativeAI)\(", _s63):
        if 'timeout' not in _s63: _sinTope63.append(f'{_os63.path.basename(_f63)} (SDK)')
check('ninguna llamada a un proveedor de IA queda sin tope',
      not _sinTope63, ', '.join(_sinTope63))

check('el tope del SDK se reparte entre los reintentos',
      'TOPE_MS / (MAX_RETRIES + 1)' in rd('api/_lib/claude.ts'),
      'tres intentos con el tope entero sumarían el triple y la plataforma mataría igual')

# Y EL MENSAJE QUE MENTÍA.
check('el Mentor dice la causa real, no «error de red»',
      'mensajeDeFalla' in rd('src/pages/Coach.tsx')
      and 'Hubo un error de red' not in rd('src/pages/Coach.tsx'),
      'si se quedó sin créditos reintentar no sirve; decirle mal la causa lo deja probando lo que no funciona')

# ── 6.64 · FALLAR NUNCA PUEDE COSTARLE PLATA AL CLIENTE ────────────────
#
# Dos clientas reportaron lo mismo por caminos distintos: la función moría, el
# crédito quedaba cobrado, reintentaban y se quedaban sin créditos. Lo arreglé
# CUATRO VECES DE A UNA —deepseek, imágenes, claude vía SDK, describir imagen—
# y cada vez apareció otro camino.
#
# Esta lente barre TODOS los caminos a la vez: es la única forma de que el
# próximo no nazca roto.
import os as _os64, glob as _g64, re as _re64
_API64 = {f: rd(f) for f in _g64.glob('api/**/*.ts', recursive=True)}

# 1 · Ninguna llamada externa sin tope, por la vía que sea.
_sinTope64 = []
for _f64, _s64 in _API64.items():
    _n64 = _os64.path.basename(_f64)
    for _m in _re64.finditer(r"fetch\(\s*['\"`](https://[^'\"`\s]+)", _s64):
        if 'supabase' in _m.group(1): continue
        if 'signal' not in _s64[max(0, _m.start()-500):_m.start()+400]:
            _sinTope64.append(f'{_n64} (fetch)')
    for _m in _re64.finditer(r'new (Anthropic|OpenAI|GoogleGenerativeAI|Groq|Mistral)\(', _s64):
        _tramo = _s64[_m.start():_m.start()+200]
        if 'timeout' not in _tramo: _sinTope64.append(f'{_n64} (SDK {_m.group(1)})')
check('ninguna llamada externa queda sin tope de tiempo',
      not _sinTope64, ', '.join(sorted(set(_sinTope64))))

# 2 · Todo endpoint que cobra tiene que poder devolver.
# HAY DOS SISTEMAS DE COBRO y yo solo miraba uno. `image.ts` no pasa por el
# guardián: cobra directo con consumeCreditServer, y por eso no aparecía en el
# barrido anterior aunque llevaba un «TODO: auto-refund» escrito en el archivo.
_cobranSinDevolver = [
    _os64.path.basename(_f) for _f, _s in _API64.items()
    if ('guardarLlamada' in _s and 'deshacerCobro' not in _s)
    or ('consumeCreditServer(' in _s and 'devolverCreditoServer' not in _s
        and '_lib/' not in _f)]
check('todo endpoint que cobra puede devolver el crédito',
      not _cobranSinDevolver, ', '.join(_cobranSinDevolver),
      )

# 3 · Y la devolución tiene que estar en el catch, no solo en un camino feliz.
_sinEnCatch64 = []
for _f64, _s64 in _API64.items():
    if 'deshacerCobro' not in _s64: continue
    for _m in _re64.finditer(r'catch\s*\([^)]*\)\s*\{([\s\S]{0,400}?)\n  \}', _s64):
        if 'deshacerCobro' not in _m.group(1) and 'status(5' in _m.group(1):
            _sinEnCatch64.append(_os64.path.basename(_f64))
check('image.ts devuelve el crédito si no entregó la imagen',
      'devolverCreditoServer' in rd('api/ai/image.ts')
      and 'cobrado = true' in rd('api/ai/image.ts'),
      'el archivo decía «TODO: si quisiéramos auto-refund…» y esa deuda dejó sin créditos a dos clientas')

check('la devolución está en el catch, donde de verdad falla',
      not _sinEnCatch64, ', '.join(sorted(set(_sinEnCatch64))))

# 4 · Ningún mensaje al cliente inventa la causa.
_mienten64 = []
for _f64 in _g64.glob('src/**/*.tsx', recursive=True):
    _s64 = rd(_f64)
    for _m in _re64.finditer(r"content: '[^']*error de red[^']*'", _s64):
        _mienten64.append(_os64.path.basename(_f64))
check('ningún mensaje dice «error de red» sin haber mirado la causa',
      not _mienten64, ', '.join(sorted(set(_mienten64))),
      )

# ── 6.65 · LA LETRA SE LEE ─────────────────────────────────────────────
#
# Medí y tenía razón la queja: **473 usos de 12px o menos contra 298 de 14 o
# más — el 61%**. El estándar para tableros es 14-16 de cuerpo y 18-24 de
# título; el mínimo accesible son 15-16.
#
# Y la advertencia que describe exactamente lo que hice: «achicar la
# tipografía para meter más filas cambia legibilidad por cantidad; usá un modo
# compacto con tipografía sana, no letra diminuta».
import glob as _g65, re as _re65, os as _os65
_chico65 = []
for _f65 in _g65.glob('src/**/*.tsx', recursive=True):
    _s65 = rd(_f65)
    for _m in _re65.finditer(r'text-\[(\d+)px\]', _s65):
        if int(_m.group(1)) < 12:
            _chico65.append(f'{_os65.path.basename(_f65)[:-4]} ({_m.group(1)}px)')
check('ningún texto por debajo de 12px en toda la app',
      not _chico65, ', '.join(sorted(set(_chico65))[:5]))

# Y la proporción: el cuerpo tiene que ganarle a lo diminuto.
_admin65 = ' '.join(rd(f) for f in _g65.glob('src/components/admin/*.tsx'))
_admin65 += rd('src/pages/Admin.tsx')
_min65 = len(_re65.findall(r'text-xs\b', _admin65))
_sano65 = len(_re65.findall(r'text-sm\b|text-base\b|text-lg\b|text-xl\b|text-2xl\b|text-3xl\b', _admin65))
check(f'el texto sano le gana al chico en el Admin ({_sano65} contra {_min65})',
      _sano65 > _min65 * 3,
      'un tablero se lee de un vistazo o no se lee')

# ── 6.66 · El reloj del soporte, conectado ─────────────────────────────
# El modelo estaba probado y SIN USAR: un mensaje sin responder no aparecía en
# ningún lado. Podía quedar tres días esperando sin que la cola, la
# supervisión ni el marcador lo señalaran.
import os as _os66
if _os66.path.exists('src/lib/soporteStorage.ts'):
    _ss66 = rd('src/lib/soporteStorage.ts')
    _lh66 = rd('src/components/admin/ListaDeHoy.tsx')
    check('los mensajes esperando se convierten en tareas',
          'crearTareasDeSoporte' in _ss66 and 'crearTareasDeSoporte' in _lh66)
    check('«respondido» se deduce, no se marca a mano',
          'resp > m.created_at' in _ss66,
          'marcar es una tarea más que alguien olvida, y entonces el reloj miente')
    check('las tareas se crean ANTES de traer la lista',
          'Va ANTES de traer la lista' in _lh66,
          'si se crearan después, habría que recargar para verlas y quien no recarga no se entera')

# ── 6.67 · Un formulario, dos puertas, con firma ───────────────────────
# Había DOS tableros cargando lo mismo sin enterarse uno del otro, y si
# ninguno cargaba LA COLA QUEDABA CIEGA — no mostraba menos, mostraba que todo
# estaba bien.
import os as _os67
if _os67.path.exists('src/components/admin/NumerosDeLaSemana.tsx'):
    _nds = rd('src/components/admin/NumerosDeLaSemana.tsx')
    _sup67 = rd('src/components/admin/Supervision.tsx')
    check('el formulario con firma existe y está montado',
          'firmaDe' in _nds and '<NumerosDeLaSemana' in _sup67)
    check('se carga DENTRO del cliente, sin cambiar de pantalla',
          'sin cambiar de pantalla' in _sup67,
          'antes había que ir a otra tab, cargar ahí, y volver')
    check('cada campo dice quién lo cargó',
          'firmaDe(v)' in _nds)
    check('dice de quién se espera, no quién puede',
          'de quién se espera, no quién puede' in _nds,
          'cualquiera puede cargar cualquiera: la regla es para recordar, no para bloquear')
    check('si un número no se guardó, se dice',
          'Ese número no quedó' in _nds,
          'creer que se guardó cuando no se guardó es peor que un error')
    check('y dice hasta dónde se puede opinar con lo que hay',
          'hastaDondePuedoOpinar' in _nds)

# ── 6.66 · Nadie espera en silencio ────────────────────────────────────
#
# El circuito de soporte funcionaba de punta a punta, pero SI NADIE RESPONDÍA
# NADA LO SEÑALABA. En un producto de miles, tres días de silencio es la
# diferencia entre un cliente y un reembolso.
import os as _os66
if _os66.path.exists('src/components/admin/BandejaSoporte.tsx'):
    _bs66 = rd('src/components/admin/BandejaSoporte.tsx')
    _sql66 = rd('sala-de-mando.sql')
    _adm66 = rd('src/pages/Admin.tsx')
    check('los mensajes sin responder se ven',
          'mensajesQueEsperan' in _bs66 and 'respondido_en' in _sql66)
    check('y la bandeja va ARRIBA de la lista de tareas',
          _adm66.index('<BandejaSoporte') < _adm66.index('<ListaDeHoy'),
          'alguien esperando manda sobre cualquier cuello: una cuenta rota se destraba mañana, una persona esperando se va hoy')
    check('el compromiso se dice en la pantalla',
          'Prometemos' in _bs66,
          'un número que se puede fallar es mejor que ninguno')
    check('responder marca a TODOS los mensajes de esa persona',
          'marcar_respondido' in _sql66 and 'marcar_respondido' in rd('src/lib/cerebroStorage.ts'),
          'dejarlos abiertos haría que la bandeja muestre gente que ya fue atendida')
    check('se refresca sola, sin recargar la pantalla',
          'setInterval' in _bs66,
          'alguien esperando no puede depender de que alguien recargue a mano')
    check('el primer dibujo dice PARA QUÉ SIRVE, no solo «cargando»',
          'Acá aparece todo el que escribió' in _bs66)

# ── 6.67 · Un formulario, DOS puertas ──────────────────────────────────
#
# Se llamaba «un formulario, dos puertas» y SOLO TENÍA UNA: el equipo cargaba
# en Supervisión y el cliente seguía con su tablero viejo. Los dos lados no
# se enteraban — que es exactamente el problema que este componente vino a
# arreglar.
import os as _os67
if _os67.path.exists('src/components/admin/NumerosDeLaSemana.tsx'):
    _mc67 = rd('src/components/campanas/MontajeCupos.tsx')
    _sv67 = rd('src/components/admin/Supervision.tsx')
    check('el EQUIPO carga por su puerta',
          '<NumerosDeLaSemana' in _sv67)
    check('y el CLIENTE por la suya',
          '<NumerosDeLaSemana' in _mc67 or 'NumerosDeLaSemana' in _mc67,
          'si solo carga uno, los dos lados siguen sin enterarse')
    check('los dos escriben en el MISMO lugar',
          'guardar_campo' in rd('src/components/admin/NumerosDeLaSemana.tsx'),
          'dos formularios distintos es lo que dejaba la cola ciega')
    check('cada campo dice quién lo cargó',
          'firmaDe' in rd('src/components/admin/NumerosDeLaSemana.tsx'))

# ── 6.68 · La app empuja sola ──────────────────────────────────────────
#
# `avisosCliente` estaba CONSTRUIDO, PROBADO Y SIN DISPARAR. Es el módulo que
# hace que la app empuje: sin él, toda cuenta que se traba espera a que una
# persona la mire, y el modelo entero deja de escalar.
import os as _os68
_cron68 = rd('api/cron/alarmas-inactividad.ts')
check('los avisos al cliente se disparan solos',
      'AVISOS[' in _cron68 and 'clientes_para_avisar' in _cron68,
      'estaban construidos y nadie los mandaba')
check('van en el cron que ya existe, no en uno nuevo',
      'sumar otro cron sería otro lugar' in _cron68,
      'otro cron es otro lugar donde algo puede fallar en silencio')
check('si fallan los avisos, las alarmas del equipo igual salieron',
      'No tumba el cron' in _cron68,
      'perder las alarmas por un fallo de los avisos sería cambiar un problema por dos')
check('sin datos no se opina: se le pide que cargue',
      "!it.cargo ? 'no_cargo'" in _cron68)
check('el mapa de avisos se exporta, no se duplica',
      'export const AVISOS' in rd('src/lib/avisosCliente.ts'))

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
