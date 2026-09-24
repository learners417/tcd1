"""Verifica que la Sala de Mando se apoye en cosas que EXISTEN."""
import re, glob, sys
def rd(f): return open(f, encoding='utf-8', errors='replace').read()
todo = {f: rd(f) for f in glob.glob('src/**/*.ts*', recursive=True)}
ok = fail = 0
def chk(nombre, cond, det=''):
    global ok, fail
    print(('  ✓ ' if cond else '  ✗ ') + nombre + ('' if cond else f' — {det}'))
    if cond: ok += 1
    else: fail += 1

admin = todo['src/pages/Admin.tsx']
print('══ lo que la Sala reusa ══')
chk('tab tareas existe en Admin', "mainTab === 'tareas'" in admin)
chk('tab campanas existe', "mainTab === 'campanas'" in admin)
chk('tab creativos existe', "mainTab === 'creativos'" in admin)
chk('tab equipo existe (solo owner)', "mainTab === 'equipo'" in admin and 'adminRol' in admin)
chk('TasksPipeline montable', 'src/components/admin/TasksPipeline.tsx' in todo)
chk('componentes de tasks existen',
    len([f for f in todo if '/admin/tasks/' in f]) >= 3)
chk('adminTasks.ts expone CRUD', 'src/lib/adminTasks.ts' in todo
    and 'cliente_id' in todo['src/lib/adminTasks.ts'])

print('══ contratos que la Sala no puede romper ══')
sup = todo['src/lib/supabase.ts']
estados = re.search(r"AdminTareaStatus\s*=\s*((?:\s*\|\s*'[a-z_]+')+)", sup)
lista = re.findall(r"'([a-z_]+)'", estados.group(1)) if estados else []
chk('AdminTareaStatus tiene 4 estados', len(lista) == 4, str(lista))
chk('el doc usa esos 4 y no los inventados',
    all(e in rd('planes-archivados/SALA-DE-MANDO.md') for e in lista))
chk('el doc NO manda crear sala_tareas',
    'NO se crea.** Se usa `admin_tareas`' in rd('planes-archivados/SALA-DE-MANDO.md'))
chk('espejo de perfil advertido en el doc',
    'syncProfileToLocalStorage' in rd('planes-archivados/SALA-DE-MANDO.md'))
chk('profiles es la tabla de clientes', "from('profiles')" in admin)

print('══ umbrales por objetivo (la Sala los importa, no los reinventa) ══')
fa = todo['src/lib/formulasAnuncios.ts']
chk('UMBRALES existe con los 3 objetivos',
    all(o in fa for o in ["perfil:", "mensajes:", "mensajes_alto:"]))
chk('veredictoAnuncio() exportado', 'export function veredictoAnuncio' in fa)
chk('diasDeMedicion() exportado', 'export function diasDeMedicion' in fa)
chk('el tablero usa el veredicto de la lib, no el suyo',
    'veredictoAnuncio(objetivo' in todo['src/components/campanas/TableroCupos.tsx'])
chk('mensajes NO se juzga con el umbral de perfil',
    "sano: [0.25, 0.70]" in fa and "alarma: 1.50" in fa)
chk('el doc prohibe escribir umbrales propios',
    'no escribe umbrales propios' in rd('planes-archivados/SALA-DE-MANDO.md'))

print('══ el eje del doc ══')
doc = rd('planes-archivados/SALA-DE-MANDO.md')
chk('define cargos, no personas', 'Los cargos — no las personas' in doc)
chk('Hoy es cola de excepciones', 'la cola de excepciones' in doc)
chk('orden de construccion explicito', 'El orden importa y no es negociable' in doc)
chk('ningun item de traspaso sin dueno', 'Ningún ítem sin dueño' in doc)

print('══ coherencia doc ↔ SQL ↔ manual ══')
import os as _os
_doc = rd('planes-archivados/SALA-DE-MANDO.md')
_sql = rd('sala-de-mando.sql') if _os.path.exists('sala-de-mando.sql') else ''
_man = rd('MANUAL-OPERATIVO.html') if _os.path.exists('MANUAL-OPERATIVO.html') else ''
_NO_CREAR = {'sala_tareas', 'sala_clientes', 'sala_campanas', 'sala_campana_metricas'}
_prom = set(re.findall(r'`(sala_\w+)`', _doc))
_crea = set(re.findall(r'create table if not exists (sala_\w+)', _sql))
_falt = _prom - _crea - _NO_CREAR
chk('toda tabla que el doc nombra, el SQL la crea', not _falt, str(sorted(_falt)))
chk('el SQL no crea las tablas que duplicarían lo existente',
    not (_crea & _NO_CREAR), str(sorted(_crea & _NO_CREAR)))
chk('el RLS filtra por la columna real (profiles.rol)',
    "p.rol = ''admin''" in _sql, 'usa un rol que no existe en la columna')
chk('la alerta única usa índice parcial, no unique con NULL',
    'where resuelta_en is null' in _sql)
chk('el manual no promete la Sala como construida',
    'todavía no está construida' in _man)

print('══ la Mesa de plata está enchufada ══')
_adm = todo['src/pages/Admin.tsx']
# Se comprueba la PERTENENCIA al array, no una cadena con el corchete pegado:
# anclar a la posición hacía que agregar una tab después rompiera el chequeo.
def _en_tabs_validas(tab: str) -> bool:
    m = re.search(r'VALID_MAIN_TABS: MainTab\[\] = \[(.*?)\]', _adm, re.S)
    return bool(m) and f"'{tab}'" in m.group(1)

def _superficies(tab: str, titulo: str) -> bool:
    return (f"| '{tab}'" in _adm and _en_tabs_validas(tab)
            and f"id: '{tab}'" in _adm and titulo in _adm
            and f"mainTab === '{tab}'" in _adm)

# `plata` YA NO ES UNA SUPERFICIE del menú: se dibuja dentro de Supervisión al
# tocar una fila, porque las dos mostraban lo mismo —el cuello y las semanas—
# una para todos y otra para uno. No son dos pantallas: son una lista y su
# detalle.
chk('la mesa de plata vive dentro de Supervisión',
    '<TableroPlata' in rd('src/components/admin/Supervision.tsx'))
chk('motor IA en las 5 superficies del Admin', _superficies('motor', "motor: 'Motor de IA"))
chk('las tabs de dueño no dejan pantalla vacía (equipo, plata, motor)',
    "TABS_SOLO_DUENO" in _adm and "'motor'" in _adm.split('TABS_SOLO_DUENO')[1][:80])
chk('ningún campo del modelo queda muerto',
    'casosDeExito' in todo['src/components/admin/TableroPlata.tsx']
    and 'comentario_a_conversacion' in todo['src/lib/valueChain.ts'])

print('══ la carga no produce diagnósticos sobre datos imposibles ══')
_vc = todo['src/lib/valueChain.ts']
_tp = todo['src/components/admin/TableroPlata.tsx']
chk('validarNumeros() existe', 'export function validarNumeros' in _vc)
chk('el tablero frena antes de diagnosticar',
    'validarNumeros' in _tp and 'Estos números no cierran' in _tp)
chk('las brechas se miden en veces, no en anchos de zona',
    'BRECHA_MAX' in _vc and 'v / max - 1' in _vc and 'min / v - 1' in _vc)
chk('cada indicador declara hacia qué lado duele',
    _vc.count("'menor_mejor'") >= 3 and _vc.count("'mayor_mejor'") >= 6)
chk('las tabs de dueño no dejan pantalla vacía',
    'TABS_SOLO_DUENO' in todo['src/pages/Admin.tsx'])
import os as _os2
chk('pruebas del modelo en el repo',
    _os2.path.exists('scripts/prueba-cadena.ts') and _os2.path.exists('scripts/prueba-bordes.ts'))

print('══ la documentación de quien mantiene la app ══')
import os as _osd
if _osd.path.exists('COMO-FUNCIONA.md'):
    _doc2 = rd('COMO-FUNCIONA.md')
    chk('existe el mapa de los motores',
        all(m in _doc2 for m in ('router.ts', 'guardian.ts', 'valueChain.ts',
                                 'formulasAnuncios.ts', 'bitacoraCampana.ts',
                                 'colaExcepciones.ts', 'avisosCliente.ts')))
    chk('todo archivo que la documentación nombra existe de verdad',
        all(_osd.path.exists(p) for p in re.findall(r'`(src/lib/\w+\.ts|api/_lib/\w+\.ts)`', _doc2)),
        'una documentación que apunta a archivos inexistentes es peor que ninguna')
    chk('el SQL se prueba contra un PostgreSQL real, no solo se parsea',
        _osd.path.exists('scripts/prueba-sql.sh') and 'prueba-sql.sh' in _doc2,
        'pglast valida la sintaxis pero no los tipos')
    chk('todo script de la batería que nombra existe',
        # `\.tsx?` y no `\.ts`: el patrón viejo cortaba prueba-pantallas.tsx
        # en «.ts» y después buscaba un archivo que no existe.
        all(_osd.path.exists(f'scripts/{m}') for m in re.findall(r'scripts/(prueba-[\w-]+\.tsx?)', _doc2)))
    chk('explica cómo agregar cosas, no solo cómo está hecho',
        'Cómo agregar cosas' in _doc2 and 'herramienta de IA nueva' in _doc2)
    chk('dice qué NO se toca y por qué',
        'NO se toca sin pensarlo' in _doc2)
    chk('el documento no dice que la Sala está sin construir',
        'no está construida' not in _doc2,
        'ya se construyó: el documento quedaría mintiendo')
    chk('admite lo que falta en vez de sonar terminado',
        'Lo que falta' in _doc2 and 'no existe' in _doc2)
    chk('la tarea de cada modelo coincide con el enrutador real',
        all(t in _doc2 for t in ('guion', 'chat', 'estructura', 'auditoria', 'general')))

print('══ las lentes que el doc invoca existen ══')
aud = rd('auditoria.py')
for n, marca in [('6.4 voseo en todo el repo', 'voseo = 0 en TODO el repo'),
                 ('8.1 espejo del perfil', 'el espejo de tcd_profile cubre todo'),
                 ('8.4 promesas de datos', 'sin promesas de datos')]:
    chk(f'lente {n}', marca in aud)

print(f'\n{"═"*46}\n  {ok} verdes · {fail} rojos')
sys.exit(1 if fail else 0)
