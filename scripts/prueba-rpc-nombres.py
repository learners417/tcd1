#!/usr/bin/env python3
"""
CADA RPC QUE LLAMA LA APP, CONTRA LO QUE DECLARA EL SQL.

═══ POR QUÉ ESTA PRUEBA ═══

PostgREST resuelve los RPC POR NOMBRE DE ARGUMENTO. Un nombre mal escrito no
rompe nada: la llamada sale, la base no encuentra la función con esa firma, y
el código que hacía `return !error` daba la llamada por buena. Así los números
que cargaba el cliente no llegaron nunca a la base durante semanas.

`prueba-sql.sh` ya compara los nombres contra un PostgreSQL de verdad, que es
la prueba más fuerte: valida tipos y defaults. Pero levanta solo las
migraciones desde 20261009, así que de las 56 llamadas de la app mira 32. Las
otras 24 las crean migraciones viejas, y nadie las estaba verificando.

Esta compara contra el TEXTO de las migraciones del repo. Más débil —no sabe
de tipos— y cubre las 56.

    python3 scripts/prueba-rpc-nombres.py
"""
import glob
import io
import re
import sys

sys.path.insert(0, 'scripts')

LLAMADA = re.compile(r"\.rpc\(\s*'([a-z_0-9]+)'")
CLAVE = re.compile(r"(?:^|[{,])\s*(p_[a-z_0-9]+)\s*:")
DECLARA = re.compile(
    r"create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_0-9]+)\s*\(",
    re.I)


def hasta_el_cierre(texto: str, desde: int, abre: str, cierra: str) -> str:
    """Lo que hay entre `desde` y el cierre que lo equilibra."""
    profundidad, partes, i = 0, [], desde
    while i < len(texto):
        c = texto[i]
        if c in abre:
            profundidad += 1
        elif c in cierra:
            if profundidad == 0:
                break
            profundidad -= 1
        partes.append(c)
        i += 1
    return ''.join(partes)


def llamadas_de_la_app() -> dict:
    """Lo que la app manda: {funcion: {p_a, p_b}}."""
    salida: dict = {}
    for ruta in sorted(glob.glob('src/**/*.ts', recursive=True)
                       + glob.glob('src/**/*.tsx', recursive=True)):
        texto = io.open(ruta, encoding='utf-8').read()
        for m in LLAMADA.finditer(texto):
            fn = m.group(1)
            salida.setdefault(fn, set())
            args = hasta_el_cierre(texto, m.end(), '({[', ')}]')
            for k in CLAVE.finditer(args):
                salida[fn].add(k.group(1))
    return salida


def archivos_sql() -> list:
    """
    Todo el SQL del repo, no solo las migraciones.

    `sala-de-mando.sql` está en la raíz —se pega entero en el editor de
    Supabase— y declara veintitrés funciones: `abrir_jornada`,
    `mi_lista_de_hoy`, `carga_de_semana`, `guardar_campo` y las demás del
    panel de la mañana. Mirando solo `supabase/migrations/` esta prueba daba
    diecisiete llamadas por «sin declaración», que es la lista donde un nombre
    mal escrito se esconde.
    """
    return sorted(glob.glob('supabase/migrations/*.sql')) + sorted(glob.glob('*.sql'))


def lo_que_declara_el_sql() -> dict:
    """Lo que la base acepta: {funcion: {p_a, p_b}}, de todo el SQL del repo."""
    salida: dict = {}
    for ruta in archivos_sql():
        texto = io.open(ruta, encoding='utf-8').read()
        for m in DECLARA.finditer(texto):
            fn = m.group(1)
            firma = hasta_el_cierre(texto, m.end(), '(', ')')
            nombres = set()
            # Cada parámetro es `nombre tipo [default …]`, separados por coma
            # en el primer nivel. El default puede traer paréntesis adentro.
            for trozo in re.split(r',(?![^(]*\))', firma):
                t = trozo.strip()
                if not t:
                    continue
                primera = t.split()[0].lower()
                if primera in ('in', 'out', 'inout', 'variadic'):
                    partes = t.split()
                    if len(partes) > 1:
                        nombres.add(partes[1].lower())
                else:
                    nombres.add(primera)
            # Una función puede estar declarada varias veces (create or
            # replace en migraciones sucesivas): vale la unión, porque
            # cualquiera de las firmas pudo quedar en la base.
            salida.setdefault(fn, set()).update(nombres)
    return salida


def main() -> int:
    manda = llamadas_de_la_app()
    declara = lo_que_declara_el_sql()
    fallas = 0
    sin_sql = []
    for fn in sorted(manda):
        if fn not in declara:
            sin_sql.append(fn)
            continue
        faltan = sorted(manda[fn] - declara[fn])
        if faltan:
            print(f'✗ {fn}: la app manda {", ".join(faltan)} y la función no '
                  f'los declara (declara: {", ".join(sorted(declara[fn])) or "ninguno"})')
            fallas += 1
    print(f'✓ los {len(manda)} RPC que llama la app: '
          f'{len(manda) - fallas - len(sin_sql)} verificados contra el SQL del repo')
    if sin_sql:
        # No es una falla: varias las crea una migración vieja que ya corrió en
        # la base y no quedó en el repo. Se nombran para que un nombre mal
        # escrito no se esconda entre ellas.
        print(f'   sin declaración en el repo ({len(sin_sql)}): {" ".join(sin_sql)}')
    print(f'\n{"✓ TODO EN VERDE" if fallas == 0 else f"✗ {fallas} FALLAS"}')
    return 0 if fallas == 0 else 1


if __name__ == '__main__':
    raise SystemExit(main())
