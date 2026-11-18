#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════════════╗
# ║   BORRAR UNA CUENTA: QUE NINGUNA TABLA QUE LA REFERENCIA LO TRABE       ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# POR QUÉ EXISTE
#
# Las lentes del esquema miran NOMBRES (que la tabla exista, que la columna
# exista, que el parámetro exista) y la del 18 de noviembre mira el VALOR
# (que entre en la lista cerrada). Ninguna mira lo que pasa cuando una fila
# se VA: un `REFERENCES auth.users(id)` sin acción de borrado no molesta
# nunca al escribir, y el día que hay que borrar esa cuenta la base dice 23503
# y el borrado entero se cae.
#
# Ya pasó, medido el 18 de noviembre ejecutando:
#
#   delete from auth.users where id = <el manager>;
#   ERROR:  update or delete on table "users" violates foreign key constraint
#           "adn_audit_log_edited_by_fkey" on table "adn_audit_log"
#
# `admin_delete_cliente` y `admin_delete_team_member` nacieron el 19 de abril
# y limpian A MANO las dos tablas que entonces bloqueaban —`mensajes` y
# `admin_notes`—. `adn_audit_log` nació el 29 de abril con `edited_by` sin
# acción de borrado, y a esa lista escrita a mano nadie volvió. Justo los
# miembros del equipo que habían trabajado —los que editaron el ADN de algún
# cliente— eran los únicos que no se podían borrar. Siete meses.
#
# La clase no es «falta un CASCADE»: es **una lista escrita a mano dentro de
# una función de abril que tiene que seguir al esquema de noviembre**. Esta
# lente mide las dos mitades, y la segunda EJECUTANDO.
#
# CÓMO
#
#   1 · EL CATÁLOGO. Se levanta un PostgreSQL, se corre TODO el SQL del repo
#       y se le pregunta a `pg_constraint` por cada FK que apunta a
#       `auth.users(id)` o a `public.profiles(id)` y por su `confdeltype`.
#       Una que bloquea (NO ACTION o RESTRICT) sólo pasa si las DOS funciones
#       de borrado la limpian a mano — y eso también se pregunta al catálogo,
#       leyendo `pg_proc.prosrc`, no el .sql: la función se redefine en varias
#       migraciones y la que vale es la última que quedó puesta.
#
#   2 · EL BORRADO DE VERDAD. Se crean tres cuentas (el owner, el que se va y
#       un cliente), se planta una fila en CADA tabla que las referencia
#       —armando el insert desde el catálogo, con las listas cerradas
#       respetadas— y se ejecuta el `delete from auth.users`. Tiene que salir.
#       Las tablas que no se pueden plantar (porque otra columna obligatoria
#       apunta a un padre que no existe) se DICEN, no se esconden.
#
# Las listas de valores NO se leen con una expresión regular sobre el .sql:
# es la lección del 18 de noviembre (un paréntesis dentro de un comentario
# corta la lista) y la del 15 (el `--` que la batería no sabía leer). Todo
# sale del catálogo de una base levantada.
#
#     python3 scripts/prueba-el-borrado-del-usuario-no-se-traba.py
#
# Si no hay PostgreSQL en esta máquina, lo dice y sale en 0.
import glob
import os
import re
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
fallas = 0

OWNER = '11111111-1111-1111-1111-111111111111'
EL_QUE_SE_VA = '22222222-2222-2222-2222-222222222222'
EL_CLIENTE = '33333333-3333-3333-3333-333333333333'

# Las funciones que borran una cuenta. Si mañana hay otra, va acá.
FUNCIONES_DE_BORRADO = ('admin_delete_cliente', 'admin_delete_team_member')


def ok(nombre, cond, detalle=''):
    global fallas
    if cond:
        print(f'  ✓ {nombre}')
    else:
        fallas += 1
        print(f'  ✗ {nombre}' + (f' — {detalle}' if detalle else ''))


# ── El andamiaje, cortado de prueba-sql.sh en su marcador ──────────────────
sh = open('scripts/prueba-sql.sh', encoding='utf-8', errors='replace').read()
MARCADOR = '══ el SQL contra PostgreSQL real ══'
ok('el andamiaje de prueba-sql.sh tiene su marcador', MARCADOR in sh,
   f'no encontré «{MARCADOR}»')
if MARCADOR not in sh:
    sys.exit(1)
# El corte va por LÍNEA: el marcador vive dentro de un `echo "..."`, y cortar
# en medio de esa línea deja la comilla abierta y el andamiaje no arranca.
_lineas = sh.split('\n')
_corte = next(i for i, l in enumerate(_lineas) if MARCADOR in l)
ANDAMIAJE = '\n'.join(_lineas[:_corte]) + '\n'

PGBIN = None
for d in sorted(glob.glob('/usr/lib/postgresql/*/bin'), reverse=True):
    if os.path.isfile(os.path.join(d, 'initdb')):
        PGBIN = d
        break
if not PGBIN:
    print('  ⧗ sin PostgreSQL local: no se puede levantar la base acá')
    sys.exit(1 if fallas else 0)

# ── El SQL de la corrida: catálogo + plantado + borrado, en una sola base ──
# Un `\echo` de psql no sale por el mismo canal que un `raise notice`, así que
# todo lo que esta lente lee se escribe como filas con prefijo.
SQL = r"""
insert into auth.users (id,email) values
  ('@@OWNER@@','owner@prueba.local'),
  ('@@VA@@','elquesefue@prueba.local'),
  ('@@CLI@@','elcliente@prueba.local');
insert into profiles (id,email,rol) values
  ('@@OWNER@@','owner@prueba.local','admin'),
  ('@@VA@@','elquesefue@prueba.local','admin'),
  ('@@CLI@@','elcliente@prueba.local','cliente');

-- ── 1 · EL CATÁLOGO: quién referencia a una cuenta, y con qué acción ──────
select 'FK|' || cl.relname || '|' || a.attname || '|' || x.confdeltype::text
  from pg_constraint x
  join pg_class cl on cl.oid = x.conrelid
  join pg_namespace n on n.oid = cl.relnamespace
  join pg_class rc on rc.oid = x.confrelid
  join pg_namespace rn on rn.oid = rc.relnamespace
  join pg_attribute a on a.attrelid = x.conrelid and a.attnum = x.conkey[1]
 where x.contype = 'f' and n.nspname = 'public' and cardinality(x.conkey) = 1
   and ((rn.nspname = 'auth' and rc.relname = 'users')
     or (rn.nspname = 'public' and rc.relname = 'profiles'))
 order by cl.relname, a.attname;

-- El cuerpo VIVO de cada función de borrado, en una línea.
select 'FN|' || p.proname || '|' || replace(replace(p.prosrc, chr(10), ' '), chr(13), ' ')
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname in (@@FNS@@);

-- ── 2 · PLANTAR UNA FILA EN CADA TABLA QUE REFERENCIA A LA CUENTA ─────────
create temp table plantada(tabla text, col text, estado text, detalle text);

-- `fila()` arma e inserta una fila mínima en una tabla, llenando cada
-- columna obligatoria sin defecto desde el catálogo: la lista cerrada si la
-- tiene, un valor nuevo si está en un índice único, y —si la columna apunta
-- a otra tabla— una fila PADRE creada por esta misma función, hasta tres
-- niveles. Sin esa recursión siete tablas quedaban sin plantar sólo porque
-- su `tarea_id` o su `sesion_id` no existía, y el borrado se medía con un
-- agujero justo en las tablas más entreveradas.
create or replace function pg_temp.fila(
  tab text, col_obj text, val_obj uuid, relleno uuid, prof int)
returns uuid language plpgsql as $fila$
declare c record; cols text; vals text; val text; lista text[]; unico boolean;
        reft text; refc text; refn text; padre uuid; padre_txt text;
        pk text; devuelto uuid;
begin
  cols := null; vals := null;
  if col_obj is not null then
    cols := quote_ident(col_obj);
    vals := quote_literal(val_obj) || '::uuid';
  end if;
  for c in
    select col.column_name as nom, col.data_type as tipo
      from information_schema.columns col
     where col.table_schema = 'public' and col.table_name = tab
       and col.is_nullable = 'NO' and col.column_default is null
       and (col_obj is null or col.column_name <> col_obj)
     order by col.ordinal_position
  loop
    select array_agg(m[1]) into lista
      from pg_constraint x
      join pg_class cl2 on cl2.oid = x.conrelid
      cross join lateral regexp_matches(pg_get_constraintdef(x.oid),
                   '''([^'']+)''', 'g') as m
     where x.contype = 'c' and cl2.relname = tab
       and pg_get_constraintdef(x.oid) ~ ('\(?' || c.nom || '\)?(::text)?\s*=\s*ANY');
    select exists (
      select 1 from pg_index i
      join pg_attribute a2 on a2.attrelid = i.indrelid and a2.attnum = any(i.indkey)
      join pg_class cl3 on cl3.oid = i.indrelid
     where i.indisunique and cl3.relname = tab and a2.attname = c.nom
    ) into unico;
    -- ¿esta columna apunta a otra tabla? Entonces el valor tiene que ser una
    -- fila que exista, no un uuid inventado.
    reft := null;
    select rc.relname, rn.nspname, a2.attname into reft, refn, refc
      from pg_constraint x
      join pg_class cl4 on cl4.oid = x.conrelid
      join pg_namespace n4 on n4.oid = cl4.relnamespace
      join pg_class rc on rc.oid = x.confrelid
      join pg_namespace rn on rn.oid = rc.relnamespace
      join pg_attribute a1 on a1.attrelid = x.conrelid and a1.attnum = x.conkey[1]
      join pg_attribute a2 on a2.attrelid = x.confrelid and a2.attnum = x.confkey[1]
     where x.contype = 'f' and n4.nspname = 'public' and cl4.relname = tab
       and cardinality(x.conkey) = 1 and a1.attname = c.nom
     limit 1;
    padre := null; padre_txt := null;
    -- Una columna obligatoria que apunta a una tabla de catálogo con clave
    -- de TEXTO —`paypal_orders.pack_id` → `credit_packs.id`— no se puede
    -- inventar ni recursar: se toma una fila que ya exista.
    if reft is not null and c.tipo <> 'uuid' and refn = 'public' then
      begin
        execute format('select %I::text from public.%I limit 1', refc, reft)
          into padre_txt;
      exception when others then padre_txt := null;
      end;
    end if;
    if reft is not null and c.tipo = 'uuid' then
      if (refn = 'auth' and reft = 'users') or (refn = 'public' and reft = 'profiles') then
        padre := relleno;
      elsif prof < 3 and refn = 'public' then
        padre := pg_temp.fila(reft, null, null, relleno, prof + 1);
      end if;
    end if;
    val := case
      when padre is not null then quote_literal(padre) || '::uuid'
      when padre_txt is not null then quote_literal(padre_txt)
      when lista is not null and array_length(lista,1) > 0 then quote_literal(lista[1])
      when unico and c.tipo = 'uuid' then 'gen_random_uuid()'
      when unico and c.tipo in ('text','character varying','character')
        then quote_literal('x') || ' || gen_random_uuid()::text'
      when c.tipo = 'uuid' then quote_literal(relleno) || '::uuid'
      when c.tipo in ('text','character varying','character') then quote_literal('x')
      when c.tipo in ('integer','bigint','smallint','numeric','real',
                      'double precision') then '1'
      when c.tipo = 'boolean' then 'false'
      when c.tipo = 'date' then 'current_date'
      when c.tipo like 'timestamp%' then 'now()'
      when c.tipo in ('json','jsonb') then quote_literal('{}') || '::' || c.tipo
      when c.tipo = 'ARRAY' then quote_literal('{}')
      else null end;
    if val is null then
      raise exception 'no sé con qué llenar %.% (%)', tab, c.nom, c.tipo;
    end if;
    cols := coalesce(cols || ', ', '') || quote_ident(c.nom);
    vals := coalesce(vals || ', ', '') || val;
    lista := null;
  end loop;
  -- La clave primaria de una sola columna uuid, para devolvérsela al hijo.
  select a.attname into pk
    from pg_index i
    join pg_class cl on cl.oid = i.indrelid
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = i.indkey[0]
   where i.indisprimary and cl.relname = tab
     and cardinality(string_to_array(i.indkey::text, ' ')) = 1
     and format_type(a.atttypid, null) = 'uuid'
   limit 1;
  if cols is null then
    execute format('insert into public.%I default values', tab);
    return null;
  end if;
  if pk is not null then
    execute format('insert into public.%I (%s) values (%s) returning %I',
                   tab, cols, vals, pk) into devuelto;
    return devuelto;
  end if;
  execute format('insert into public.%I (%s) values (%s)', tab, cols, vals);
  return null;
end
$fila$;

create or replace function pg_temp.plantar_para(objetivo uuid, relleno uuid)
returns void language plpgsql as $plant$
declare r record; ya int;
begin
  for r in
    select cl.relname as tabla, a.attname as col
      from pg_constraint x
      join pg_class cl on cl.oid = x.conrelid
      join pg_namespace n on n.oid = cl.relnamespace
      join pg_class rc on rc.oid = x.confrelid
      join pg_namespace rn on rn.oid = rc.relnamespace
      join pg_attribute a on a.attrelid = x.conrelid and a.attnum = x.conkey[1]
     where x.contype = 'f' and n.nspname = 'public' and cardinality(x.conkey) = 1
       and ((rn.nspname = 'auth' and rc.relname = 'users')
         or (rn.nspname = 'public' and rc.relname = 'profiles'))
     order by cl.relname, a.attname
  loop
    begin
      perform pg_temp.fila(r.tabla, r.col, objetivo, relleno, 0);
      insert into plantada values (r.tabla, r.col, 'plantada', null);
    exception when others then
      -- Si ya había una fila apuntando a la cuenta, la referencia existe
      -- igual y el borrado la tiene que atravesar: eso es plantado.
      execute format('select count(*) from public.%I where %I = $1', r.tabla, r.col)
        into ya using objetivo;
      if ya > 0 then
        insert into plantada values (r.tabla, r.col, 'plantada', 'ya estaba');
      else
        insert into plantada values (r.tabla, r.col, 'no-plantada', sqlerrm);
      end if;
    end;
  end loop;
end
$plant$;

select pg_temp.plantar_para('@@VA@@'::uuid, '@@CLI@@'::uuid);
select 'PLANT|' || tabla || '.' || col || '|' || estado || '|' || coalesce(detalle,'')
  from plantada order by tabla, col;

-- ── 3 · EL BORRADO, EJECUTADO ─────────────────────────────────────────────
create or replace function pg_temp.borrar(objetivo uuid)
returns text language plpgsql as $b$
begin
  delete from auth.users where id = objetivo;
  return 'ok';
exception when others then
  return 'trabado|' || sqlstate || '|' || sqlerrm;
end
$b$;

select 'BORRA|el que se va|' || pg_temp.borrar('@@VA@@'::uuid);

-- Y ahora el cliente, con su propia tanda de filas plantadas.
delete from plantada;
select pg_temp.plantar_para('@@CLI@@'::uuid, '@@OWNER@@'::uuid);
select 'BORRA|el cliente|' || pg_temp.borrar('@@CLI@@'::uuid);
"""
# Con .replace() y no con %: el SQL usa `%` por su cuenta —`timestamp%` en un
# LIKE y `%I`/`%s` dentro de format()—, y un `%` de Python los come.
for _t, _v in (('@@OWNER@@', OWNER), ('@@VA@@', EL_QUE_SE_VA),
               ('@@CLI@@', EL_CLIENTE),
               ('@@FNS@@', ','.join(f"'{f}'" for f in FUNCIONES_DE_BORRADO))):
    SQL = SQL.replace(_t, _v)

TMP = tempfile.mkdtemp()
os.chmod(TMP, 0o755)  # `su postgres` tiene que poder entrar a leer los .sql
SALIDA = os.path.join(TMP, 'salida.txt')
sql = os.path.join(TMP, 'prueba.sql')
with open(sql, 'w', encoding='utf-8') as h:
    h.write(SQL)
os.chmod(sql, 0o644)
corrida = os.path.join(TMP, 'corrida.sh')
with open(corrida, 'w', encoding='utf-8') as h:
    h.write(ANDAMIAJE)
    h.write(f"""
psqlq -f sala-de-mando.sql > /dev/null 2>&1
for f in $(ls supabase/migrations/*.sql | sort) $(ls *.sql 2>/dev/null); do
  psqlq -f "$f" > /dev/null 2>&1
done
su postgres -c "psql -h $SOCK -p $PORT -U postgres -tA -f {sql}" > {SALIDA} 2>&1
""")

_r = subprocess.run(['bash', corrida], capture_output=True, text=True)
salida = (open(SALIDA, encoding='utf-8', errors='replace').read().split('\n')
          if os.path.exists(SALIDA) else [])


def filas(pref):
    return [l[len(pref):] for l in salida if l.startswith(pref)]


FK = [l.split('|') for l in filas('FK|')]
FN = {l.split('|', 1)[0]: l.split('|', 1)[1] for l in filas('FN|')}
PLANT = [l.split('|', 2) for l in filas('PLANT|')]
BORRA = [l.split('|', 1) for l in filas('BORRA|')]

ok('la base levanta y contesta quién referencia a una cuenta',
   len(FK) >= 40 and len(FN) == len(FUNCIONES_DE_BORRADO),
   f'{len(FK)} FKs, {len(FN)} funciones de borrado — '
   + (_r.stderr or _r.stdout or '\n'.join(salida[-3:])).strip()
     .split('\n')[-1][:160])
if not FK or len(FN) != len(FUNCIONES_DE_BORRADO):
    sys.exit(1)
print(f'  · {len(FK)} columnas apuntan a una cuenta, preguntadas al catálogo')

# ── 1 · LA REGLA: ninguna puede bloquear sin estar limpiada a mano ─────────
# confdeltype: a = NO ACTION, r = RESTRICT (las dos bloquean), c = CASCADE,
# n = SET NULL, d = SET DEFAULT.
NOMBRE_ACCION = {'a': 'NO ACTION', 'r': 'RESTRICT', 'c': 'CASCADE',
                 'n': 'SET NULL', 'd': 'SET DEFAULT'}
sin_tapar = []
for tabla, col, acc in FK:
    if acc not in ('a', 'r'):
        continue
    limpian = []
    for fn, src in FN.items():
        s = src.lower()
        m = re.search(r'delete\s+from\s+(?:public\.)?' + re.escape(tabla) + r'\b([^;]*)', s)
        if m and col.lower() in m.group(1):
            limpian.append(fn)
    if len(limpian) != len(FUNCIONES_DE_BORRADO):
        sin_tapar.append(f'{tabla}.{col} ({NOMBRE_ACCION[acc]}) — '
                         + (f'sólo lo limpia {", ".join(limpian)}' if limpian
                            else 'ninguna función lo limpia'))
bloquean = [f'{t}.{c}' for t, c, a in FK if a in ('a', 'r')]
print(f'  · {len(bloquean)} bloquean si no se limpian a mano: '
      + (', '.join(bloquean) or '—'))
ok('ninguna tabla bloquea el borrado sin que las dos funciones la limpien',
   not sin_tapar, ' · '.join(sin_tapar))

# ── 2 · EL BORRADO, EJECUTADO ─────────────────────────────────────────────
puestas = [p for p in PLANT if p[1] == 'plantada']
faltaron = [f'{p[0]}: {p[2][:90]}' for p in PLANT if p[1] == 'no-plantada']
# El 18 de noviembre se plantan las 48 de 48. El umbral no es 48 porque una
# tabla nueva con un padre que no se puede armar no es un defecto del borrado
# y no tiene que poner roja a esta lente: lo que sí es un defecto es que se
# caiga el armado de filas y el borrado se mida sobre una base vacía.
ok('se planta una fila en casi todas las tablas que referencian la cuenta',
   len(puestas) >= len(PLANT) - 2, f'{len(puestas)} de {len(PLANT)}')
# Y las que BLOQUEAN tienen que estar plantadas sin excusa: si justo esa fila
# no se plantó, el borrado sale bien por no tener a quién chocar.
sin_fila = sorted({p[0].split('.')[0] for p in PLANT if p[1] == 'no-plantada'}
                  & {b.split('.')[0] for b in bloquean})
ok('las tablas que bloquean tienen su fila plantada', not sin_fila,
   ', '.join(sin_fila))
print(f'  · {len(puestas)} de {len(PLANT)} tablas con fila plantada')
for f in faltaron:
    print(f'    ⧗ sin plantar — {f}')

ok('las dos cuentas se pudieron borrar de verdad', len(BORRA) == 2,
   f'{len(BORRA)} borrados medidos')
for quien, res in BORRA:
    ok(f'borrar «{quien}» no se traba', res == 'ok', res)

print()
print('✓ TODO EN VERDE' if not fallas else f'✗ {fallas} FALLA(S)')
sys.exit(1 if fallas else 0)
