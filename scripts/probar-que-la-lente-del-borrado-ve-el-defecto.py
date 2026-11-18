#!/usr/bin/env python3
"""
¿LA LENTE DEL BORRADO VE EL DEFECTO? — el otro lado de sus dos mitades.

Una lente verde no dice nada: dice que hoy no se cayó. Esto le pone cada
defecto que dice cuidar y exige que se ponga ROJA, y dos canarios al revés que
tienen que dejarla VERDE. El repo de verdad no se toca: se copia a una carpeta
temporal y el defecto se pone sobre la copia.

LOS CINCO DEFECTOS:

  1 · el de hoy, puesto de nuevo: `adn_audit_log.edited_by` apuntando a
      `auth.users(id)` sin acción de borrado, que es como estuvo del 29 de
      abril al 18 de noviembre. Tiene que ponerse roja por las DOS mitades:
      la regla del catálogo y el `delete from auth.users` ejecutado.
  2 · una tabla que HOY cascadea y deja de hacerlo: `credit_transactions`,
      el log de la plata. Es la forma más común de que esto vuelva: alguien
      reescribe un `create table` y se come las tres palabras del final.
  3 · lo mismo escrito como `ON DELETE RESTRICT`. Una lente que buscara la
      AUSENCIA del texto «ON DELETE» daría verde acá, y RESTRICT bloquea
      igual que NO ACTION. Por eso la acción se le pregunta al catálogo
      (`confdeltype`) y no al .sql.
  4 · la lista escrita a mano que se queda corta: se le saca a
      `admin_delete_team_member` —a una sola de las dos funciones— la línea
      que limpia `admin_notes`. Es EXACTAMENTE lo que pasó en abril, y la
      mitad ejecutada no lo ve (el borrado de la prueba no pasa por la
      función): lo tiene que ver la regla.
  5 · una tabla NUEVA que nace bloqueando, con un nombre que esta lente no
      vio nunca. Si sólo se pusiera roja con `adn_audit_log`, estaría
      midiendo el defecto de hoy y no la clase.

Y LOS DOS CANARIOS, que tienen que quedar VERDES:

  A · una tabla nueva con una columna obligatoria que apunta a otra tabla
      —`credit_packs`— sin acción de borrado. No es una cuenta: no bloquea
      ningún borrado de usuario. Si esto la pone roja, la lente está midiendo
      todos los FK del esquema y no los que importan.
  B · el `edited_by` de hoy con CASCADE en vez de SET NULL. Las dos cosas
      dejan borrar; la lente no tiene que exigir UNA, sino que no bloquee.
      (El repo elige SET NULL porque conserva el historial, pero eso es
      criterio, no regla.)

Corre: python3 scripts/probar-que-la-lente-del-borrado-ve-el-defecto.py
(Necesita PostgreSQL: la lente levanta una base y ejecuta el borrado.)
"""
import glob
import os
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LENTE = 'scripts/prueba-el-borrado-del-usuario-no-se-traba.py'

MIGRA_HOY = 'supabase/migrations/20261118_el_borrado_del_equipo_se_trababa_en_el_log.sql'
FK_ARREGLADO = ('  FOREIGN KEY (edited_by) REFERENCES auth.users(id) '
                'ON DELETE SET NULL;')
COLA_DE_HOY = """COMMENT ON COLUMN public.adn_audit_log.edited_by"""

# El bloque que limpia a mano, dentro de admin_delete_team_member. El mismo
# texto está en admin_delete_cliente, así que el ancla lleva las líneas de
# arriba, que son las únicas distintas entre las dos funciones.
BLOQUE_EQUIPO = """    RAISE EXCEPTION 'El usuario no es un miembro del equipo';
  END IF;

  -- FKs sin CASCADE sobre profiles(id): limpiar manualmente.
  DELETE FROM public.mensajes WHERE emisor_id = p_user_id OR receptor_id = p_user_id;
  DELETE FROM public.admin_notes WHERE author_id = p_user_id;"""

# (nombre, [(archivo, lo que dice, lo que va a decir)], qué es)
DEFECTOS = [
    ('el-log-del-adn-sin-accion',
     [(MIGRA_HOY, FK_ARREGLADO,
       '  FOREIGN KEY (edited_by) REFERENCES auth.users(id);')],
     'el defecto de hoy: el log del ADN traba el borrado del equipo'),
    ('un-cascade-que-se-pierde',
     [('supabase/migrations/20260513_credits_system.sql',
       '  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n'
       '  delta               INTEGER NOT NULL,',
       '  user_id             UUID NOT NULL REFERENCES auth.users(id),\n'
       '  delta               INTEGER NOT NULL,')],
     'el log de la plata deja de cascadear y traba el borrado'),
    ('bloquea-escrito-como-restrict',
     [('supabase/migrations/20260518_admin_roles_notifications.sql',
       '  usuario_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,',
       '  usuario_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,')],
     'RESTRICT bloquea igual, y el texto «ON DELETE» está escrito'),
    ('la-lista-a-mano-se-queda-corta',
     [('supabase/migrations/20260419_delete_usuarios.sql', BLOQUE_EQUIPO,
       BLOQUE_EQUIPO.replace(
           '\n  DELETE FROM public.admin_notes WHERE author_id = p_user_id;', ''))],
     'una de las dos funciones deja de limpiar admin_notes'),
    ('una-tabla-nueva-que-nace-bloqueando',
     [(MIGRA_HOY, COLA_DE_HOY,
       """CREATE TABLE IF NOT EXISTS public.rastro_de_prueba (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quien UUID NOT NULL REFERENCES auth.users(id)
);

COMMENT ON COLUMN public.adn_audit_log.edited_by""")],
     'una tabla con un nombre que la lente no vio nunca'),
]

CANARIOS = [
    ('fk-sin-accion-que-no-es-de-cuentas',
     [(MIGRA_HOY, COLA_DE_HOY,
       """CREATE TABLE IF NOT EXISTS public.hijo_de_prueba (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack TEXT NOT NULL REFERENCES public.credit_packs(id)
);

COMMENT ON COLUMN public.adn_audit_log.edited_by""")],
     'un FK sin acción hacia una tabla que no es una cuenta'),
    ('cascade-en-vez-de-set-null',
     [(MIGRA_HOY, FK_ARREGLADO,
       '  FOREIGN KEY (edited_by) REFERENCES auth.users(id) ON DELETE CASCADE;')],
     'la otra acción que tampoco bloquea'),
]

fallas = []


def correr(cwd):
    """Roja si sale con código distinto de cero o imprime algún ✗."""
    r = subprocess.run([sys.executable, '-I', LENTE],
                       capture_output=True, text=True, cwd=cwd)
    salida = r.stdout + r.stderr
    roja = r.returncode != 0 or any('✗' in l for l in salida.splitlines())
    return roja, salida


def poner(copia, cambios):
    """Pone los cambios y devuelve cómo deshacerlos, o None si alguno no se
    pudo poner: un defecto que no se puso no mide nada, y es la forma más
    común de que un arnés diga que todo anda."""
    originales = []
    for rel, viejo, nuevo in cambios:
        p = os.path.join(copia, rel)
        txt = open(p, encoding='utf-8').read()
        if txt.count(viejo) != 1:
            for q, t in originales:
                open(q, 'w', encoding='utf-8').write(t)
            return None, f'{rel}: el texto aparece {txt.count(viejo)} veces, no una'
        originales.append((p, txt))
        open(p, 'w', encoding='utf-8').write(txt.replace(viejo, nuevo))
    return originales, ''


def main():
    if not any(os.path.isfile(os.path.join(d, 'initdb'))
               for d in glob.glob('/usr/lib/postgresql/*/bin')):
        print('  ⧗ sin PostgreSQL local: la lente no puede levantar nada, '
              'así que el arnés no mide nada')
        return 0

    copia = tempfile.mkdtemp(prefix='borrado-ve-el-defecto-')
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
        for nombre, cambios, que in DEFECTOS:
            originales, porque = poner(copia, cambios)
            if originales is None:
                fallas.append(f'{nombre}: el defecto no se pudo poner ({porque}), '
                              f'así que no se midió nada')
                print(f'  ✗ {nombre}: no se pudo poner el defecto — {porque}')
                continue
            try:
                roja, _ = correr(copia)
            finally:
                for p, txt in originales:
                    open(p, 'w', encoding='utf-8').write(txt)
            if roja:
                print(f'  ✓ {nombre} — {que}')
            else:
                fallas.append(f'{nombre} ({que}): la lente sigue VERDE')
                print(f'  ✗ {nombre} — la lente NO lo ve: {que}')

        # 3 · Y los canarios, al revés: tienen que quedar VERDES.
        for nombre, cambios, que in CANARIOS:
            originales, porque = poner(copia, cambios)
            if originales is None:
                fallas.append(f'canario {nombre}: no se pudo poner ({porque})')
                print(f'  ✗ canario {nombre}: no se pudo poner — {porque}')
                continue
            try:
                roja, salida = correr(copia)
            finally:
                for p, txt in originales:
                    open(p, 'w', encoding='utf-8').write(txt)
            if not roja:
                print(f'  ✓ canario {nombre} — {que}: la lente queda verde')
            else:
                fallas.append(f'canario {nombre} ({que}): la lente se puso ROJA — '
                              + '; '.join(l.strip() for l in salida.splitlines()
                                          if '✗' in l)[:200])
                print(f'  ✗ canario {nombre} — la lente se puso roja sin defecto: {que}')
    finally:
        shutil.rmtree(copia, ignore_errors=True)

    print()
    if fallas:
        print(f'✗ {len(fallas)} cosa(s) que el arnés del borrado encontró:')
        for f in fallas:
            print(f'   · {f}')
        return 1
    print('✓ la lente del borrado ve sus cinco defectos y deja pasar los dos canarios')
    return 0


if __name__ == '__main__':
    sys.exit(main())
