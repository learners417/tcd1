#!/usr/bin/env python3
"""
LO QUE EL CLIENTE VE CUANDO ALGO FALLA, Y CON QUÉ PALABRAS.

═══ POR QUÉ ESTAS TRES ═══

Las tres salieron de la revisión final del 15 de octubre, y ninguna la veía
ninguna otra prueba: no rompen nada, no salen en la consola, y la batería
entera estaba en verde con las tres adentro.

1 · VOSEO. Los entregables van en castellano neutro, porque sus clientes son
    de Ecuador, Panamá, Chile y Venezuela. Había un «Probá de nuevo» justo en
    el mensaje que ve el cliente cuando falla la lectura de su material, que
    es el primer paso de su migración.

2 · ERRORES TÉCNICOS EN CRUDO. `toast.error(e.message)` le muestra «IA API
    error: 500» o «new row violates row-level security policy» a alguien que
    pagó entre mil y cinco mil dólares. Para eso está `mensajeDeFalla`, que
    dice qué pasó y qué hacer.

3 · ESCRITURAS QUE DECLARAN ÉXITO SIN COMPROBAR. Supabase DEVUELVE el error,
    no lo lanza. Así que `await supabase.from(x).update(y)` sin mirar el
    resultado sigue como si hubiera guardado, y un `catch` alrededor no ve
    nada. En el wizard eso dejaba al cliente dando vueltas en el onboarding
    para siempre, porque la pantalla se dibuja según la base.

    Varias se tragan el fallo A PROPÓSITO —el progreso del cliente no se
    bloquea por la red— y esas están nombradas abajo con su razón.

    python3 scripts/prueba-lo-que-el-cliente-ve.py
"""
import glob
import io
import re

# ── 1 · Voseo ─────────────────────────────────────────────────────────────
VOSEO = [
    'podés', 'tenés', 'querés', 'sabés', 'debés', 'hacés', 'decís', 'venís',
    'sentís', 'ponés', 'salís', 'seguís', 'elegís', 'escribís', 'mirás',
    'pensás', 'necesitás', 'aprendés', 'andá', 'mirá', 'fijate', 'fíjate',
    'decime', 'contame', 'avisame', 'escribime', 'mandame', 'pasame',
    'acordate', 'quedate', 'llevate', 'tomate', 'anotá', 'escribí', 'marcá',
    'revisá', 'probá', 'cambiá', 'cerrá', 'elegí', 'intentá', 'esperá',
    'seguí', 'hacelo', 'ponelo', 'dejalo', 'usala', 'armá', 'cargá', 'tildá',
    'empezá', 'terminá', 'guardá', 'pegá', 'copiá', 'sumá', 'preguntá',
    'respondé', 'mandá', 'tocá', 'dejá', 'poné', 'sacá',
    # SIN TILDE. Buena parte del código viejo escribe sin acentos, y así el
    # voseo pasa por debajo: «No tenes creditos suficientes» le llegaba al
    # cliente desde el cobro de imágenes y este barrido lo daba por limpio.
    #
    # Solo las formas cuya versión sin tilde NO es una palabra correcta con
    # «tú»: «sabes» y «debes» son correctas y no entran; «tenes» y «podes» no
    # existen con tú —serían «tienes» y «puedes»— así que sí.
    'tenes', 'podes', 'queres', 'venis', 'decis', 'sentis', 'vivis', 'salis',
    'seguis', 'elegis', 'escribis', 'subis', 'preferis', 'conseguis',
]
VOSEO_RE = re.compile(
    r'(?<![a-záéíóúüñA-ZÁÉÍÓÚÜÑ])(' + '|'.join(VOSEO)
    + r')(?![a-záéíóúüñA-ZÁÉÍÓÚÜÑ])', re.I)

# Dónde el voseo NO es un error, con su razón.
VOSEO_A_PROPOSITO = {
    'src/lib/vozLocalizada.ts':
        'es el módulo que DESCRIBE el voseo: nombrarlo es su trabajo',
    'src/lib/casa.ts':
        'primera persona del pasado («abrí un centro cultural»), no voseo',
    'src/lib/formulasAnuncios.ts':
        'primera persona del pasado («la escribí yo»), no voseo',
    'supabase/migrations/20260601_diario_fundador_v3.sql':
        'un «Revisá» en un aviso interno para Lupe. Migración de junio que ya '
        'corrió en la base: cambiarlo pide reescribir toda la función de '
        'alarmas del diario, y no vale el riesgo por una palabra que no lee '
        'ningún cliente',
    'supabase/migrations/20260419_delete_usuarios.sql':
        'un «No podes» en una excepción que solo ve el equipo al intentar '
        'borrarse su propia cuenta de owner. Migración de abril que ya corrió: '
        'las migraciones no se reescriben',
}

# ── 2 · El error técnico que llega al cliente ─────────────────────────────
CRUDO_RE = re.compile(
    r'(?:toast\.error|setError|setProblema|setErrorSubida)\([^)]*?'
    r'\b(?:e|err|error|ex)\.message', re.S)

# ── 2b · El mismo error, por las otras tres puertas ───────────────────────
# El lente de arriba mira `toast.error(err.message)` y daba verde mientras seis
# pantallas seguían mostrando el error en crudo, porque llegaba de otra forma:
#   · interpolado entero en el texto      → toast.error(`Error: ${error}`)
#   · guardado antes en una variable      → const msg = err.message; …`· ${msg}`
#   · en una función de estado sin listar → setFallo(err.message)
# Y en un caso lo que se mostraba era una sentencia SQL: «Falta correr la
# migracion: ALTER TABLE profiles ADD COLUMN país text», en la pantalla de un
# cliente que no puede correr una migración.
MOSTRAR = r'(?:toast\.error|setError|setProblema|setErrorSubida|setFallo|setIaFallo)'
CRUDO_INTERPOLADO_RE = re.compile(
    MOSTRAR + r'\(\s*`[^`]*\$\{\s*(?:e|err|error|ex|msg)\b', re.S)
CRUDO_INDIRECTO_RE = re.compile(
    r'\b(?:const|let)\s+(\w+)\s*=\s*\w+\s+instanceof\s+Error\s*\?[^;]*?\.message[^;]*;'
    r'[\s\S]{0,200}?' + MOSTRAR + r'\([^)]*\b\1\b', re.S)
SQL_AL_CLIENTE_RE = re.compile(
    r'[\'"`][^\'"`\n]*\b(?:ALTER TABLE|CREATE TABLE|INSERT INTO|DROP TABLE|ADD COLUMN)\b',
    re.I)

# ── 3 · Escrituras cuyo resultado no se mira ──────────────────────────────
ESCRITURA_RE = re.compile(
    r'await\s+(?:db\(\)|supabase)[\s\S]{0,40}?\.from\([\'"]([a-z_0-9]+)[\'"]\)'
    r'([\s\S]{0,260}?);')
RESULTADO_RE = re.compile(r'(const|let)\s*(?:\{[^}]*\}|\w+)\s*=\s*$')

# Las que se tragan el fallo a propósito, con su razón escrita.
SIN_MIRAR_A_PROPOSITO = {
    'src/lib/campanasStorage.ts':
        'el montaje de campaña vive en el navegador y se sincroniza después',
    'src/lib/supabase.ts':
        'borrados de conversaciones: si no llegan, se reintentan al volver',
    'src/lib/notifications.ts':
        'marcar un aviso como leído: si no llega, vuelve a aparecer y es correcto',
    'src/lib/ventanasDatos.ts':
        'pausas globales, pantalla del equipo con recarga a la vista',
    'src/lib/elNumero.ts':
        'el cinturón: el progreso local nunca se bloquea por la red',
    'src/lib/numerosDatos.ts':
        'su diagnóstico se vuelve a pedir si no quedó guardado',
    'src/lib/hechoAfuera.ts':
        'lo cierra el equipo mirando la pantalla, que se recarga sola',
    'src/components/admin/TableroGrabacion.tsx':
        'tablero del equipo: el resultado se ve en la lista al recargar',
    'src/lib/sessionLog.ts':
        'el registro de la sesión: queda en consola y no bloquea al cliente',
    'src/lib/cinturones.ts':
        'el cinturón: queda en consola y el progreso local no se bloquea',
}


def archivos():
    # `api/` también: de ahí salen los mensajes que el servidor le DEVUELVE al
    # cliente, y `safeReadError` los muestra tal cual. El «No tenes creditos
    # suficientes» del cobro de imágenes vivía ahí, fuera de este barrido.
    return sorted(glob.glob('src/**/*.ts', recursive=True)
                  + glob.glob('src/**/*.tsx', recursive=True)
                  + glob.glob('api/**/*.ts', recursive=True))


def sin_comentarios(t: str) -> str:
    return re.sub(r'^\s*//.*$', '', re.sub(r'/\*[\s\S]*?\*/', '', t), flags=re.M)


def main() -> int:
    fallas = 0

    print('══ voseo en lo que se lee ══')
    hits = []
    for f in archivos() + sorted(glob.glob('supabase/migrations/*.sql')):
        if f in VOSEO_A_PROPOSITO:
            continue
        for n, linea in enumerate(io.open(f, encoding='utf-8'), 1):
            # Solo texto, no comentarios: el comentario que explica un arreglo
            # nombra la frase vieja a propósito.
            if re.match(r'\s*(//|--|\*)', linea):
                continue
            for m in VOSEO_RE.finditer(linea):
                hits.append(f'{f}:{n} «{m.group(1)}»')
    if hits:
        fallas += 1
        print(f'✗ {len(hits)} formas de voseo en texto que alguien lee')
        for h in hits[:12]:
            print(f'    {h}')
    else:
        print('✓ ninguna forma de voseo en el texto que lee el cliente o el equipo')

    print('\n══ el error técnico que le llega al cliente ══')
    crudos = []
    for f in archivos():
        if '/admin/' in f or 'Admin' in f:
            continue
        t = sin_comentarios(io.open(f, encoding='utf-8').read())
        for m in CRUDO_RE.finditer(t):
            n = t[:m.start()].count('\n') + 1
            crudos.append(f'{f}:{n}')
    if crudos:
        fallas += 1
        print(f'✗ {len(crudos)} pantallas del cliente muestran el error técnico en crudo')
        for c in crudos[:10]:
            print(f'    {c}  (usar mensajeDeFalla)')
    else:
        print('✓ ninguna pantalla del cliente muestra «IA API error: 500» ni la RLS en crudo')

    print('\n══ el mismo error, por las otras tres puertas ══')
    otras = []
    for f in archivos():
        if '/admin/' in f or 'Admin' in f:
            continue
        t = sin_comentarios(io.open(f, encoding='utf-8').read())
        for rx, puerta in ((CRUDO_INTERPOLADO_RE, 'interpolado en el texto'),
                           (CRUDO_INDIRECTO_RE, 'guardado antes en una variable'),
                           (SQL_AL_CLIENTE_RE, 'una sentencia de la base en pantalla')):
            for m in rx.finditer(t):
                n = t[:m.start()].count('\n') + 1
                otras.append(f'{f}:{n}  ({puerta})')
    if otras:
        fallas += 1
        print(f'✗ {len(otras)} lugares le pasan el error técnico al cliente')
        for o in otras[:10]:
            print(f'    {o}  (usar mensajeDeFalla)')
    else:
        print('✓ ni interpolado, ni guardado antes, ni una sentencia de la base')

    print('\n══ escrituras que declaran éxito sin comprobar ══')
    sueltas = []
    for f in archivos():
        t = io.open(f, encoding='utf-8').read()
        for m in ESCRITURA_RE.finditer(t):
            trozo = m.group(0)
            if not re.search(r'\.(update|insert|upsert|delete)\(', trozo):
                continue
            if RESULTADO_RE.search(t[max(0, m.start() - 60):m.start()]):
                continue
            if f in SIN_MIRAR_A_PROPOSITO:
                continue
            n = t[:m.start()].count('\n') + 1
            sueltas.append(f'{f}:{n}  [{m.group(1)}]')
    if sueltas:
        fallas += 1
        print(f'✗ {len(sueltas)} escrituras sin mirar el resultado y sin razón escrita')
        for s in sueltas[:10]:
            print(f'    {s}')
        print('    (si es a propósito, va en SIN_MIRAR_A_PROPOSITO con su razón)')
    else:
        print(f'✓ las escrituras que no miran el resultado son las '
              f'{len(SIN_MIRAR_A_PROPOSITO)} que lo hacen a propósito, cada una con su razón')

    print(f'\n{"✓ TODO EN VERDE" if fallas == 0 else f"✗ {fallas} FALLAS"}')
    return 0 if fallas == 0 else 1


if __name__ == '__main__':
    raise SystemExit(main())
