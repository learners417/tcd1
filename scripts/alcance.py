#!/usr/bin/env python3
"""
EL ALCANCE — qué módulos de src/ puede tocar el cliente, y cuáles no.

═══ POR QUÉ EXISTE ═══

El patrón que más veces apareció en estas revisiones es siempre el mismo: un
módulo completo, exportado, con su prueba en verde, que ninguna pantalla
importa. El cliente paga por algo que existe en el código y no se puede usar.

La auditoría tenía una lente para esto y era una lista escrita a mano de
cuatro funciones ya arregladas. O sea que protegía cuatro arreglos del pasado
y no el patrón: con ocho módulos sueltos, la lente seguía en verde.

Esto camina el grafo de imports desde `src/main.tsx` y dice qué queda afuera.

═══ LAS TRAMPAS, QUE YA ME COSTARON DOS VERSIONES ═══

  · La extensión explícita: `./App.tsx` y no `./App`.
  · El sufijo `.js` que en TypeScript resuelve al `.ts` (lo usa api/).
  · Los imports dinámicos: `import('./x')`.
  · `export ... from './x'`, que importa igual aunque no diga «import».
  · Las carpetas con `index.ts`.
  · Los comentarios: un import comentado no importa nada.

Correr con: python3 scripts/alcance.py
Devuelve 1 si hay módulos fuera del alcance que no estén en la lista de abajo.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SRC = RAIZ / 'src'

# ── Lo que legítimamente NO cuelga de main.tsx ──────────────────────────
#
# Cada excepción dice quién lo usa. Sin esa razón escrita, una excepción es
# la forma más cómoda de que la lente deje de servir.
FUERA_A_PROPOSITO = {
    'src/lib/entregasDelEquipo.ts': 'lo usa el cron de Vercel (api/cron/alarmas-inactividad.ts)',
    'src/lib/topeDelEscalon.ts': 'lo usan las pantallas Y el cron; el cron lo importa aparte',
    'src/lib/cerebroCliente.ts': 'lo usa el Admin a través de su prueba de escenario; pendiente de cablear',
    'src/lib/libroYPacientes.ts': 'material del libro: lo leen los scripts que arman los PDF',
}

#   · Y los imports de varias líneas, que son la mayoría:
#         import {
#           a, b, c,
#         } from './x';
#     La primera versión de esto pedía que no hubiera saltos de línea antes
#     del `from`, así que se perdía 36 módulos y los contaba como muertos.
IMPORTA = re.compile(
    r"""(?:^|\n)[ \t]*(?:import|export)\b[^;]*?from\s*['"]([^'"]+)['"]"""
    r"""|(?:^|\n)[ \t]*import\s*['"]([^'"]+)['"]"""
    r"""|import\s*\(\s*['"]([^'"]+)['"]\s*\)""",
    re.M,
)
EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '.json',
        '/index.ts', '/index.tsx', '/index.js']


def sin_comentarios(s: str) -> str:
    s = re.sub(r'/\*[\s\S]*?\*/', '', s)
    return re.sub(r'^\s*//.*$', '', s, flags=re.M)


def resolver(desde: Path, spec: str) -> Path | None:
    if not spec.startswith('.'):
        return None  # un paquete de node_modules
    base = (desde.parent / spec).resolve()
    candidatos = [base]
    # El `.js` de los imports ESM resuelve al `.ts` del fuente.
    if base.suffix == '.js':
        candidatos += [base.with_suffix('.ts'), base.with_suffix('.tsx')]
    for c in candidatos:
        for ext in EXTS:
            p = Path(str(c) + ext)
            if p.is_file():
                return p.resolve()
    return None


def imports_de(p: Path) -> list[Path]:
    try:
        texto = sin_comentarios(p.read_text(encoding='utf-8'))
    except (OSError, UnicodeDecodeError):
        return []
    salida = []
    for m in IMPORTA.finditer(texto):
        spec = m.group(1) or m.group(2) or m.group(3)
        if not spec:
            continue
        r = resolver(p, spec)
        if r:
            salida.append(r)
    return salida


def caminar(semillas: list[Path]) -> set[Path]:
    vistos: set[Path] = set()
    cola = [s.resolve() for s in semillas if s.is_file()]
    while cola:
        p = cola.pop()
        if p in vistos:
            continue
        vistos.add(p)
        cola.extend(imports_de(p))
    return vistos


def rel(p: Path) -> str:
    return str(p.relative_to(RAIZ))


def main() -> int:
    entrada = SRC / 'main.tsx'
    if not entrada.is_file():
        print('✗ no está src/main.tsx')
        return 1

    alcanzables = caminar([entrada])
    # Todo lo que es código de la app
    todos = {p.resolve() for p in SRC.rglob('*')
             if p.is_file() and p.suffix in ('.ts', '.tsx')
             and not p.name.endswith('.d.ts')}

    fuera = sorted(todos - alcanzables, key=rel)
    desde_api = caminar(sorted((RAIZ / 'api').rglob('*.ts')))
    desde_scripts = caminar(sorted((RAIZ / 'scripts').glob('*.ts'))
                            + sorted((RAIZ / 'scripts' / 'visor').glob('*.tsx')))

    print(f'módulos de src/: {len(todos)}')
    print(f'alcanzables desde main.tsx: {len(alcanzables & todos)}')
    print(f'fuera del alcance: {len(fuera)}\n')

    rotos = []
    for p in fuera:
        r = rel(p)
        if r in FUERA_A_PROPOSITO:
            print(f'  · {r}\n      a propósito: {FUERA_A_PROPOSITO[r]}')
            continue
        quien = []
        if p in desde_api:
            quien.append('api/')
        if p in desde_scripts:
            quien.append('scripts/')
        print(f'  ✗ {r}'
              + (f'\n      solo lo alcanza: {", ".join(quien)}' if quien
                 else '\n      no lo alcanza nada'))
        rotos.append(r)

    # ── LO QUE ESTO NO MIDE, A PROPÓSITO ──
    #
    # Tuvo una segunda parte que buscaba imports traídos y no usados, y daba
    # falsos positivos: para encontrarlos hay que sacar los comentarios, y
    # sacarlos con una expresión regular sobre 280.000 caracteres de JSX se
    # come código de verdad. Marcó como muertos cuatro imports de Admin.tsx
    # que se usan trescientas líneas más abajo.
    #
    # Eso ya lo contesta bien `tsc` con `noUnusedLocals`, que es la autoridad
    # y no se equivoca. Correr:
    #
    #     npx tsc --noEmit -p tsconfig.json --noUnusedLocals
    #
    # Acá queda solo lo que el grafo de imports sí sostiene: qué módulo de
    # src/ no cuelga de main.tsx.
    print()
    if rotos:
        print(f'✗ {len(rotos)} módulos de src/ que ninguna pantalla puede alcanzar')
        return 1
    print('✓ todo lo que existe en src/ cuelga de main.tsx o dice por qué no')
    return 0


if __name__ == '__main__':
    sys.exit(main())
