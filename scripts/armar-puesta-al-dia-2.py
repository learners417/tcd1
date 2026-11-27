#!/usr/bin/env python3
"""ARMA EL SEGUNDO «PONER AL DÍA LA BASE», Y NO LO DEJA EN EL REPOSITORIO.

Qué arma: los once archivos de SQL que el repositorio escribió DESPUÉS del
primer `poner-al-dia-la-base.sql` (que llega al 3 de noviembre), uno detrás del
otro en orden de fecha, con un prevuelo adelante y la consulta de «qué quedó»
al final. Javo lo pega una vez en el SQL Editor de Supabase.

POR QUÉ NO QUEDA GUARDADO EN EL REPO, y esto es lo importante de este archivo:

El 27 de noviembre se guardó como `poner-al-dia-la-base-2.sql` y la batería se
puso roja con cinco fallos. Ninguno era del SQL: los cinco eran de los ARNESES,
que es como esta casa comprueba que cada lente ve el defecto que dice ver. El
arnés mete un defecto a propósito en una migración y espera que la lente se
ponga roja. Con el paquete guardado al lado, el defecto quedaba curado por la
copia —«fallas_vistas sigue encendida por poner-al-dia-la-base-2.sql», dijo la
batería— y tres lentes se volvieron ciegas de golpe.

Es la misma trampa que `prueba-los-archivos-son-de-su-dueno.sh` ya tiene
escrita para el primer paquete: con dos copias de la misma regla, cuál manda
depende del orden en que se pegaron los archivos, y nada lo avisa. El primer
paquete está en el repo y cada lente que lo necesita lo nombra a mano; sumar un
segundo paquete era pedirle lo mismo a cuatro o cinco mediciones más, o sea
editar las mediciones para que toleren una copia. No se hace.

Así que el paquete se DERIVA cuando se lo necesita y no se guarda: una sola
copia de cada migración vive en el repositorio, y el paquete sale de acá.

    python3 scripts/armar-puesta-al-dia-2.py [ruta/de/salida.sql]

Sin ruta escribe en un archivo temporal y la imprime. La ruta NO puede ser la
raíz del repositorio: el programa se niega, por lo de arriba.
"""
import os
import sys
import tempfile

FILES = [
    "20261104_las_columnas_que_el_candado_lee",
    "20261105_donde_cae_lo_que_se_rompe",
    "20261111_las_transcripciones_que_llegan_solas",
    "20261117_la_devolucion_no_era_una_fuente",
    "20261117_la_sala_guardaba_decisiones_en_columnas_que_no_existen",
    "20261118_el_borrado_del_equipo_se_trababa_en_el_log",
    "20261118_la_portada_de_youtube_no_entraba",
    "20261118_las_funciones_no_preguntaban_quien_llama",
    "20261118_los_archivos_eran_de_cualquiera",
    "20261119_tu_canal_en_la_comunidad",
    "20261127_las_cuatro_columnas_del_tablero",
]

CABECERA = """-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  PONER AL DÍA LA BASE · SEGUNDA PARTE                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- 27 de noviembre de 2026.
--
-- `poner-al-dia-la-base.sql` —el del 4 de noviembre— llega hasta el archivo
-- del 3 de noviembre. Desde entonces el repositorio escribió ONCE archivos más
-- de SQL, y hay una razón para juntarlos ahora: **producción no corre esta
-- rama.** El dominio `app.tuclinica.digital` apunta a un despliegue de la rama
-- `mejoras`, y `mejoras` no tiene estos once archivos.
--
-- O sea que nadie sabe si están corridos. Si no lo están y la app pasa a
-- servirse de `main`, el código le va a pedir a la base columnas y funciones
-- que no existen, y PostgREST no devuelve «falta la columna»: rechaza el
-- UPDATE entero. El cliente guarda, lee que guardó, y no se guardó nada.
--
-- Esto contesta esa pregunta sin tocar producción. Son los once archivos del
-- repositorio, uno detrás del otro, en orden de fecha:
--
--   04 nov · las columnas que el candado lee        (15 columnas de `profiles`)
--   05 nov · donde cae lo que se rompe              (`fallas_vistas` + poda)
--   11 nov · las transcripciones que llegan solas   (`transcripciones_recibidas`)
--   17 nov · la devolución no era una fuente        (`devolver_credito`)
--   17 nov · la sala guardaba decisiones            (`sala_decisiones.contexto`)
--   18 nov · el borrado se trababa en el log        (`adn_audit_log`)
--   18 nov · la portada de YouTube no entraba       (`creativos_tipo_check`)
--   18 nov · las funciones no preguntaban quién llama
--   18 nov · los archivos eran de cualquiera        (políticas de storage)
--   19 nov · tu canal en la comunidad               (`profiles.canal_comunidad`)
--   27 nov · las cuatro columnas del tablero        (las de la cuenta de agendas)
--
-- SE PUEDE CORRER AUNQUE PARTE YA ESTÉ HECHA. Cada tabla con `if not exists`,
-- cada columna igual, cada función con `create or replace`, cada política y
-- cada restricción mirando antes si ya existe. Lo que ya está, no se toca, y
-- correrlo dos veces da el mismo resultado que correrlo una.
--
-- NO BORRA NINGÚN DATO. Medido línea por línea sobre este archivo: no hay un
-- `drop table`, ni un `truncate`, ni un `delete` ni un `update` que se corra.
-- Lo que sí hay son 14 `drop ... if exists`, y los 14 son de políticas y de
-- restricciones, que es la única forma de reemplazar una: se borra la regla y
-- se escribe de nuevo en la línea siguiente, dentro de la misma operación.
-- El único `delete` del archivo está DENTRO del cuerpo de
-- `podar_fallas_viejas`, y ese cuerpo corre cuando alguien llama a la función,
-- no al instalarla.
--
-- Corre todo junto o no corre nada: el editor de Supabase lo mete en una sola
-- operación. Si algo falla, la base queda como estaba.
--
-- ── EL PREVUELO ──
--
-- Lo primero del archivo es un chequeo: si falta alguna de las cuatro tablas
-- que estos once archivos tocan sin crear —`profiles`, `sala_decisiones`,
-- `adn_audit_log` y `creativos`—, corta en la primera línea y dice cuál y qué
-- correr antes, en vez de cortarse 400 líneas adentro con un mensaje de
-- PostgreSQL que no dice qué hacer.
--
-- ── CÓMO ──
--
--   1. Supabase → SQL Editor → pegar este archivo entero → Run.
--   2. Mirar la última tabla de resultados. Cada línea que empiece con FALTA
--      es algo que no quedó. Sin líneas FALTA, la base está al día.
--
-- Y recién entonces tiene sentido pasar producción a `main`.
"""

VERIFICACION = """

-- ═══════════════════════════════════════════════════════════════════════════
-- QUÉ QUEDÓ
--
-- Una línea por cosa. `FALTA` es lo único que hay que leer: si no aparece
-- ninguna, los once archivos están puestos.
-- ═══════════════════════════════════════════════════════════════════════════

with esperado(clase, objeto, existe) as (
  -- Las dos tablas nuevas.
  select 'tabla', t, exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = t)
    from (values ('fallas_vistas'), ('transcripciones_recibidas')) as x(t)

  union all
  -- Las columnas de `profiles` que el candado, la comunidad y el tablero leen.
  select 'columna', 'profiles.' || c, exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name = c)
    from (values
      ('acceso_hasta'), ('acceso_tipo'), ('admin_rol'), ('biblioteca_abierta'),
      ('cima_incluida'), ('migracion_habilitada'), ('migrado_en'),
      ('plan_comercial'), ('rol'), ('servicio_contratado'),
      ('canal_comunidad'),
      ('agendas_count'), ('processed_appointment_ids'),
      ('campaign_status'), ('launched_at')
    ) as x(c)

  union all
  select 'columna', 'sala_decisiones.contexto', exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'sala_decisiones'
       and column_name = 'contexto')

  union all
  -- Las funciones.
  select 'función', f, exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = f)
    from (values
      ('devolver_credito'), ('ensure_user_credits_row'), ('podar_fallas_viejas')
    ) as x(f)

  union all
  -- Las dos restricciones que se cambiaron, no que se crearon.
  select 'restricción', r, exists (
    select 1 from pg_constraint where conname = r)
    from (values ('creativos_tipo_check'), ('adn_audit_log_edited_by_fkey')) as x(r)

  union all
  -- Y que el log acepte quedarse sin autor: sin esto, borrar a alguien del
  -- equipo se traba.
  select 'regla', 'adn_audit_log.edited_by acepta nulo', exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'adn_audit_log'
       and column_name = 'edited_by' and is_nullable = 'YES')

  union all
  -- Las políticas de las dos tablas nuevas y la del equipo sobre las fichas.
  select 'política', tabla || ' · ' || nombre, exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = tabla and policyname = nombre)
    from (values
      ('fallas_vistas', 'cualquiera deja su falla'),
      ('fallas_vistas', 'el equipo lee las fallas'),
      ('profiles', 'el equipo lee cualquier ficha'),
      ('transcripciones_recibidas', 'transcripciones_recibidas_equipo')
    ) as x(tabla, nombre)
)
select case when existe then 'ok' else 'FALTA' end as estado,
       clase, objeto
  from esperado
 order by existe, clase, objeto;
"""

PREVUELO = """
-- ═══════════════════════════════════════════════════════════════════════════
-- ANTES DE EMPEZAR: QUE ESTÉN LAS CUATRO TABLAS QUE ESTE ARCHIVO TOCA
--
-- Los once archivos agregan columnas y reglas sobre `profiles`,
-- `sala_decisiones`, `adn_audit_log` y `creativos`. Ninguno de los once crea
-- esas tablas: las crean migraciones de abril y `sala-de-mando.sql`, y se dan
-- por corridas.
--
-- Si alguna no estuviera, un `alter table` sobre ella corta la pegada por la
-- mitad. Eso no rompe nada —todo va en una sola operación y la base vuelve a
-- como estaba— pero el mensaje de PostgreSQL llega 400 líneas adentro y no
-- dice qué hacer. Esto corta en la primera línea y sí lo dice.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare falta text;
begin
  select string_agg(t, ', ') into falta
    from (values ('profiles'), ('sala_decisiones'), ('adn_audit_log'), ('creativos')) as x(t)
   where not exists (
     select 1 from information_schema.tables
      where table_schema = 'public' and table_name = x.t);

  if falta is not null then
    raise exception
      'Falta(n) en la base: %. Este archivo las toca pero no las crea. Correr primero poner-al-dia-la-base.sql (y, si tampoco estuvieran, sala-de-mando.sql); las de abril las crean 20260410_campanas_creativos.sql y 20260429_admin_adn_edit.sql.', falta;
  end if;
end $$;
"""

raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
partes = [CABECERA, PREVUELO]
for i, f in enumerate(FILES, 1):
    ruta = os.path.join(raiz, "supabase/migrations", f + ".sql")
    cuerpo = open(ruta).read().rstrip()
    partes.append(
        "\n\n-- ───────────────────────────────────────────────────────────────────────────\n"
        f"-- {i} de {len(FILES)} · {f}.sql\n"
        "-- ───────────────────────────────────────────────────────────────────────────\n\n"
        + cuerpo + "\n"
    )
partes.append(VERIFICACION)
if len(sys.argv) > 1:
    salida = os.path.abspath(sys.argv[1])
    if os.path.dirname(salida) == os.path.abspath(raiz):
        sys.exit("no: el paquete no se guarda en la raíz del repositorio (ver el encabezado de este archivo)")
else:
    salida = os.path.join(tempfile.mkdtemp(prefix="puesta-al-dia-"), "poner-al-dia-la-base-2.sql")

with open(salida, "w", encoding="utf-8") as f:
    f.write("".join(partes))
print(salida)
