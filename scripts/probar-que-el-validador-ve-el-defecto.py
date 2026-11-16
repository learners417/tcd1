#!/usr/bin/env python3
"""¿El validador del paquete VE el defecto, o solo dice que mira?

`tcd-spec/datos/validar.py` estuvo dos meses sin que nadie lo corriera, y
cuando se corrió el 16 de noviembre de 2026 se cayó con un KeyError en su línea
63 antes de imprimir nada. O sea: no alcanza con que la batería lo corra, hay
que probar que se pone ROJO cuando el defecto está puesto. Si no, es otro
cartel.

Cada defecto de abajo se pone sobre una COPIA del paquete y nombra lo que el
validador tiene que decir. El paquete de verdad no se toca nunca.

Correr con: python3 scripts/probar-que-el-validador-ve-el-defecto.py
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

fallas = []


def _preparar(tmp):
    """El paquete copiado, con `src/` al lado: validar.py mira ../src/lib/agents."""
    shutil.copytree(os.path.join(RAIZ, 'tcd-spec'), os.path.join(tmp, 'spec'))
    os.symlink(os.path.join(RAIZ, 'src'), os.path.join(tmp, 'src'))
    return os.path.join(tmp, 'spec')


def _correr(spec):
    r = subprocess.run([sys.executable, 'datos/validar.py'], cwd=spec,
                       capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr)


def _con_seed_tocado(nombre, toca, espera):
    """Pone el defecto sobre el seed de la copia y exige que el validador lo diga."""
    with tempfile.TemporaryDirectory(prefix='valida-') as tmp:
        spec = _preparar(tmp)
        p = os.path.join(spec, 'datos', 'roadmap.seed.json')
        with open(p, encoding='utf-8') as f:
            seed = json.load(f)
        toca(seed)
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(seed, f, ensure_ascii=False, indent=2)
        codigo, salida = _correr(spec)
        if codigo == 0:
            fallas.append(f'{nombre}: el validador dio VERDE con el defecto puesto')
            print(f'  ✗ {nombre}: pasa en verde')
        elif espera not in salida:
            fallas.append(f'{nombre}: se puso rojo pero no nombró «{espera}»')
            print(f'  ✗ {nombre}: rojo sin nombrar «{espera}»')
        else:
            print(f'  ✓ {nombre}: lo ve y lo nombra')


def _dia_de_una_pieza(seed):
    """El defecto que estuvo vivo dos meses: el catálogo con el día viejo."""
    for p in seed['piezas']:
        if p['codigo'] == 'P2.1':
            p['dia'] = 15


def _referencia_rota(seed):
    """Una jornada pide una pieza que no existe y que no es de las declaradas."""
    for j in seed['jornadas']:
        if j['dia'] == 9:
            j['piezas'] = list(j['piezas']) + ['P99.9']


def _pieza_que_nadie_pide(seed):
    """Una pieza fichada que ninguna jornada pide: el cliente no la ve nunca."""
    for j in seed['jornadas']:
        j['piezas'] = [c for c in j['piezas'] if c != 'P2.1']


def _deuda_que_crece(seed):
    """Un código sin ficha más, sin declararlo: la deuda no puede crecer sola."""
    for j in seed['jornadas']:
        if j['dia'] == 10:
            j['piezas'] = list(j['piezas']) + ['P1.7']


def _total_estructural(seed):
    """Un freno que desaparece sin que nadie lo decida."""
    seed['frenos'] = seed['frenos'][:-1]


def _desacuerdo_movido(seed):
    """El seed se mueve de un lado del desacuerdo declarado con la prosa."""
    seed['jornadas'][30]['minutos'] = seed['jornadas'][30]['minutos'] + 200


def main():
    # 0 · sin defecto, el paquete tiene que cerrar.
    with tempfile.TemporaryDirectory(prefix='valida-') as tmp:
        spec = _preparar(tmp)
        codigo, salida = _correr(spec)
        if codigo != 0:
            fallas.append('el paquete NO cierra sin ningún defecto puesto: '
                          + salida.strip().splitlines()[-1][:200])
            print('  ✗ el paquete no cierra sin defecto')
        else:
            print('  ✓ el paquete cierra sin defecto')

    _con_seed_tocado('el dia de una pieza vuelve al viejo', _dia_de_una_pieza,
                     'catálogo dice día 15')
    _con_seed_tocado('una jornada pide una pieza que no existe', _referencia_rota,
                     'P99.9 no existe en el catálogo')
    _con_seed_tocado('una pieza fichada que ninguna jornada pide',
                     _pieza_que_nadie_pide, 'P2.1')
    _con_seed_tocado('la deuda de codigos sin ficha crece sola', _deuda_que_crece,
                     'P1.7 no existe en el catálogo')
    _con_seed_tocado('desaparece un freno', _total_estructural, '10 frenos')
    _con_seed_tocado('la carga del cliente se mueve', _desacuerdo_movido,
                     'decidir cuál manda')

    if fallas:
        print(f'\n✗ {len(fallas)} defecto(s) que el validador no ve:')
        for f in fallas:
            print(f'   · {f}')
        return 1
    print('\n✓ el validador se pone rojo con cada defecto, y nombra cuál es')
    return 0


if __name__ == '__main__':
    sys.exit(main())
