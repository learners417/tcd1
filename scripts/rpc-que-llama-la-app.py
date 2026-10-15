#!/usr/bin/env python3
"""
LOS RPC QUE LLAMA LA APP, Y CON QUÉ NOMBRES.

PostgREST resuelve los RPC POR NOMBRE DE ARGUMENTO. `tableroSync.ts` llamaba a
`guardar_semana_cliente` con `p_cliente` y `p_semana` —la función los llama
`p_cliente_id` y `p_semana_iso`— y el `return !error` daba la llamada por
buena. Los números que cargaba el cliente no llegaban nunca a la base.

Esto lee todas las llamadas de src/ y las imprime como `funcion:p_a,p_b`, para
que `prueba-sql.sh` las compare contra lo que declara la base de verdad.

Antes esa lista estaba escrita a mano con cuatro funciones, así que la prueba
en verde no decía nada de la quinta.

    python3 scripts/rpc-que-llama-la-app.py
"""
import glob
import io
import re

LLAMADA = re.compile(r"\.rpc\(\s*'([a-z_0-9]+)'")
CLAVE = re.compile(r"(?:^|[{,])\s*(p_[a-z_0-9]+)\s*:")


def argumentos_de(texto: str, desde: int) -> str:
    """Lo que hay entre el nombre y el paréntesis que cierra la llamada."""
    profundidad, partes, i = 0, [], desde
    while i < len(texto):
        c = texto[i]
        if c in '({[':
            profundidad += 1
        elif c in ')}]':
            if profundidad == 0:
                break
            profundidad -= 1
        partes.append(c)
        i += 1
    return ''.join(partes)


def main() -> None:
    llamadas: dict[str, set[str]] = {}
    archivos = sorted(
        glob.glob('src/**/*.ts', recursive=True)
        + glob.glob('src/**/*.tsx', recursive=True))
    for ruta in archivos:
        texto = io.open(ruta, encoding='utf-8').read()
        for m in LLAMADA.finditer(texto):
            fn = m.group(1)
            llamadas.setdefault(fn, set())
            for k in CLAVE.finditer(argumentos_de(texto, m.end())):
                llamadas[fn].add(k.group(1))
    for fn in sorted(llamadas):
        print(fn + ':' + ','.join(sorted(llamadas[fn])))


if __name__ == '__main__':
    main()
