#!/usr/bin/env python3
"""
¿LA LENTE DE LA RLS VE EL DEFECTO? — el otro lado de sus ocho miradas.

Una lente verde no dice nada: dice que hoy no se cayó. Esto le pone cada
defecto que dice cuidar y exige que se ponga ROJA. El repo de verdad no se
toca: se copia a una carpeta temporal y el defecto se pone sobre la copia.

LOS NUEVE DEFECTOS, y por qué cada uno (los dos últimos son del 18 de
noviembre, cuando la lente aprendió a preguntar si la tabla que el repo CUIDA
el repo la sabe CREAR):

  1 · la RLS apagada sobre una tabla que SÍ tiene política escrita. Es el
      defecto que esta lente nació midiendo: PostgreSQL acepta la política,
      la guarda, y no filtra ni una fila.
  2 · lo mismo con el SQL en MAYÚSCULAS, que es como está escrita la mitad
      de este repo. El primer intento de medir esto buscaba en minúsculas y
      daba por abiertas tres tablas cerradas.
  3 · una pantalla nueva que lee una tabla que ningún `.sql` enciende. Es el
      caso de todos los días: nadie apaga una RLS a mano, pero cualquiera
      agrega un `.from('tabla_nueva')`. Acá no hay política inerte que
      delate: solo la tabla desnuda.
  4 · el `alter table` comentado con `--`. El 15 de noviembre esta misma
      forma —la guarda comentada en el idioma del archivo— dejó verde a la
      lente que decía medirla. Acá tiene que ponerse roja.
  5 · una tabla sacada del array del `do $$` de la sala: la tabla doce que
      nace abierta y en silencio.
  6 · una excepción que sobra: `diario_entradas` encendida por un `.sql` y
      la línea de SOLO_EN_EL_PANEL todavía escrita. Es el defecto de la
      lista a mano que este repo ya se comió dos veces —los nueve nombres
      del 14 de noviembre, las tres copias del puente del 16—: lo que le
      sobra deja una tabla fuera de la medición para siempre.
  7 · y el canario: sin .sql que leer, la lente NO puede ponerse verde. Una
      lente que aprueba porque no pudo preguntar es peor que no tenerla.

Corre: python3 scripts/probar-que-la-lente-de-la-rls-ve-el-defecto.py
"""
import os
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LENTE = 'scripts/prueba-la-rls-esta-encendida.py'

# (nombre, archivo, lo que dice, lo que va a decir, qué es)
#
# Cada tabla elegida está encendida en UN SOLO archivo, medido: apagarla en
# `20260930_pausa_global.sql` no la apagaba, porque `poner-al-dia-la-base.sql`
# la vuelve a encender, y el defecto quedaba sin poner con la lente en verde
# por el motivo correcto. Eso ahora lo vigila `sigue_encendida()`.
DEFECTOS = [
    ('politica-inerte', 'sala-de-mando.sql',
     'alter table uso_ia enable row level security;',
     '-- (apagada a proposito por el arnes)',
     'la RLS apagada con la política escrita: la tabla parece cuidada y está '
     'abierta'),
    ('politica-inerte-en-mayusculas', 'supabase/migrations/20260505_rls_advisor_fixes.sql',
     'ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;',
     '-- (apagada a proposito por el arnes)',
     'lo mismo con el SQL en MAYÚSCULAS, que es como está escrita la mitad '
     'de este repo'),
    ('tabla-nueva-en-el-navegador', 'src/lib/avisarFalla.ts',
     "void supabase.from('fallas_vistas').insert(fila).then(",
     "void supabase.from('tabla_que_nadie_enciende').select('*');\n"
     "    void supabase.from('fallas_vistas').insert(fila).then(",
     'una pantalla nueva que lee una tabla que ningún .sql enciende: la clave '
     'anónima viaja en el bundle, así que la lee cualquiera'),
    ('encendida-comentada', 'supabase/migrations/20261105_donde_cae_lo_que_se_rompe.sql',
     'alter table public.fallas_vistas enable row level security;',
     '-- alter table public.fallas_vistas enable row level security;',
     'el `alter table` comentado con `--`: el idioma del archivo, que es la '
     'forma que dejó verde a una lente el 15 de noviembre'),
    ('fuera-del-array', 'sala-de-mando.sql',
     "'sala_decisiones','sala_etapas','sala_riesgos','sala_alertas','sala_motor',",
     "'sala_etapas','sala_riesgos','sala_alertas','sala_motor',",
     'una tabla que sala-de-mando.sql crea y deja fuera de su propio array: '
     'nace abierta y en silencio'),
    ('excepcion-que-sobra', 'fix-supabase.sql',
     'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;',
     'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;\n'
     'alter table public.diario_entradas enable row level security;',
     'el repo ya enciende una tabla declarada «solo en el panel»: la línea '
     'sobra y la deja fuera de la medición'),
    # Los dos del 18 de noviembre, del punto 4.5: la tabla que el repo CUIDA
    # y no sabe CREAR. Sobre la base de Javo una política así corre bien; de
    # cero corta la migración ahí, y hasta el 18 no había dónde leerlo.
    ('cuidada-y-sin-crear', 'sala-de-mando.sql',
     'create table if not exists jornadas (',
     'create table if not exists jornadas_renombrada_por_el_arnes (',
     'una tabla con la RLS encendida y una política escrita que ningún .sql '
     'del repo crea: el repo no se puede levantar de cero'),
    ('hueco-de-crear-que-ya-no-es-hueco', 'scripts/prueba-la-rls-esta-encendida.py',
     'NO_LAS_CREA_NINGUN_SQL = {\n',
     "NO_LAS_CREA_NINGUN_SQL = {\n    'jornadas': 'puesta por el arnes',\n",
     'una excepción de las de crear que sobra: el repo ya crea esa tabla'),
]

# Las tablas que cada defecto DEJA APAGADAS, para comprobar que el defecto se
# puso de verdad. Sin esto, un defecto que no apaga nada se mide igual y la
# lente queda «aprobada» por un ejercicio que nunca ocurrió.
APAGA = {
    'politica-inerte': 'uso_ia',
    'politica-inerte-en-mayusculas': 'mensajes',
    'encendida-comentada': 'fallas_vistas',
}


def sigue_encendida(cwd, tabla):
    """¿Algún .sql de la copia sigue encendiendo esta tabla? Se pregunta a la
    lente misma, no a una regular propia: si las dos no coinciden, el que
    manda es el que mide."""
    import glob as _gg
    import re as _rr
    patron = _rr.compile(
        r'alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?"?' + tabla
        + r'"?\s+enable\s+row\s+level\s+security', _rr.I)
    for f in (_gg.glob(os.path.join(cwd, 'supabase/migrations/*.sql'))
              + _gg.glob(os.path.join(cwd, '*.sql'))):
        texto = open(f, encoding='utf-8', errors='replace').read()
        for linea in texto.split('\n'):
            if linea.lstrip().startswith('--'):
                continue
            if patron.search(linea):
                return os.path.basename(f)
    return None


fallas = []


def correr(cwd):
    """Roja si sale con código distinto de cero o imprime algún ✗."""
    r = subprocess.run([sys.executable, '-I', LENTE],
                       capture_output=True, text=True, cwd=cwd)
    salida = r.stdout + r.stderr
    roja = r.returncode != 0 or any('✗' in l for l in salida.splitlines())
    return roja, salida


def main():
    copia = tempfile.mkdtemp(prefix='rls-ve-el-defecto-')
    try:
        subprocess.run(
            f'tar -cf - --exclude=node_modules --exclude=.git -C {RAIZ} . '
            f'| tar -xf - -C {copia}', shell=True, check=True)

        # 1 · Sin defecto, VERDE. Si acá está roja, lo de abajo no mide nada.
        roja, salida = correr(copia)
        if roja:
            fallas.append('la lente ya está ROJA sin ningún defecto puesto: '
                          + '; '.join(l.strip() for l in salida.splitlines()
                                      if '✗' in l)[:200])
            print('  ✗ la lente ya está roja sin defecto: no se puede medir nada')
        else:
            print('  ✓ la lente está verde sin defecto')

        # 2 · Con cada defecto, ROJA.
        for nombre, rel, viejo, nuevo, que in DEFECTOS:
            p = os.path.join(copia, rel)
            original = open(p, encoding='utf-8').read()
            if original.count(viejo) != 1:
                fallas.append(
                    f'{nombre}: el texto del defecto aparece '
                    f'{original.count(viejo)} veces en {rel}, no una. El '
                    f'defecto no se pudo poner, así que no se midió nada.')
                print(f'  ✗ {nombre}: no se pudo poner el defecto en {rel}')
                continue
            open(p, 'w', encoding='utf-8').write(original.replace(viejo, nuevo))
            try:
                otra = (sigue_encendida(copia, APAGA[nombre])
                        if nombre in APAGA else None)
                if otra:
                    fallas.append(
                        f'{nombre}: {APAGA[nombre]} sigue encendida por '
                        f'{otra}, así que el defecto no se puso y no se '
                        f'midió nada.')
                    print(f'  ✗ {nombre}: el defecto no apagó nada '
                          f'({APAGA[nombre]} sigue encendida por {otra})')
                    continue
                roja, _ = correr(copia)
            finally:
                open(p, 'w', encoding='utf-8').write(original)
            if roja:
                print(f'  ✓ {nombre} — {que}')
            else:
                fallas.append(f'{nombre} ({que}): la lente sigue VERDE')
                print(f'  ✗ {nombre} — la lente NO lo ve: {que}')

        # 3 · El canario: sin .sql, NO puede dar verde.
        guardados = tempfile.mkdtemp(prefix='rls-sql-')
        movidos = []
        try:
            import glob as _g
            for f in (_g.glob(os.path.join(copia, 'supabase/migrations/*.sql'))
                      + _g.glob(os.path.join(copia, '*.sql'))):
                destino = os.path.join(guardados, os.path.basename(f))
                shutil.move(f, destino)
                movidos.append((destino, f))
            roja, salida = correr(copia)
        finally:
            for destino, f in movidos:
                shutil.move(destino, f)
            shutil.rmtree(guardados, ignore_errors=True)
        if roja:
            print('  ✓ canario — sin .sql que leer, la lente NO da verde')
        else:
            fallas.append('canario: sin ningún .sql la lente dio VERDE. Una '
                          'lente que aprueba por no haber podido preguntar es '
                          'peor que no tenerla.')
            print('  ✗ canario — sin ningún .sql la lente dio verde')
    finally:
        shutil.rmtree(copia, ignore_errors=True)

    print()
    if fallas:
        print(f'✗ {len(fallas)} cosa(s) que la lente de la RLS no ve:')
        for f in fallas:
            print(f'   · {f}')
        return 1
    print(f'✓ los {len(DEFECTOS)} defectos y el canario ponen roja a la lente')
    return 0


if __name__ == '__main__':
    sys.exit(main())
