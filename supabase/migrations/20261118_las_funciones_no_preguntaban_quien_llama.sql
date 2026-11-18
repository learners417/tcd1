-- ═══════════════════════════════════════════════════════════════════════════
-- LAS FUNCIONES QUE NO PREGUNTABAN QUIÉN LLAMA
--
-- Medido el 17 de noviembre de 2026 a las 23:25, contra un PostgreSQL de
-- verdad levantado con el esquema del repo:
--
--   · de las 51 funciones SECURITY DEFINER de `public`, **49 las puede
--     ejecutar `authenticated` y 42 `anon`**. No por un `grant` del repo: el
--     permiso de fábrica de PostgreSQL es EXECUTE para PUBLIC, y PostgREST
--     expone toda función de `public` como `/rest/v1/rpc/<nombre>`.
--   · 25 de esas 51 no preguntaban quién llamaba.
--
-- Y una función SECURITY DEFINER corre con los permisos de SU DUEÑO: **pasa
-- por encima de la RLS**. Así que la RLS puede estar perfecta —y lo está, se
-- midió el 17 a las 19:30: las 60 tablas encendidas y las 210 políticas
-- acotadas— y no servir de nada. Probado ejecutando, no leyendo:
--
--   · `carga_semanal` le negó la fila a un cliente (0 filas, la RLS cumplió)
--     y `carga_de_semana('<otro cliente>')` se la entregó entera —y también
--     al rol `anon`, sin ninguna sesión—.
--   · un cliente llamó `devolver_credito('<otro>', 'robo')` cinco veces y el
--     saldo comprado de ese otro pasó de 0 a 5; una sexta llamada **sin
--     sesión ninguna** (rol `anon`, la llave publicable que viaja en el
--     bundle) lo dejó en 6, con sus seis asientos en `credit_transactions`.
--   · `guardar_campo` dejó a un cliente escribir sobre el número que el
--     equipo había cargado en la semana de otro.
--
-- Esta migración cierra lo que NO vive en `sala-de-mando.sql` (ahí se cerró
-- en su propio archivo, con las dos funciones nuevas `solo_el_equipo` y
-- `el_que_llama_es_del_equipo`, que son la única copia de la regla).
--
-- Pegar en Supabase → SQL Editor → Run. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1 · El gasto de un crédito no lo pide el navegador ─────────────────────
--
-- `consume_credit` lo llama `/api/ai/image` y `api/_lib/guardian.ts` con el
-- service_role. El envoltorio del navegador —`consumeCredit` en
-- `src/lib/credits.ts`— no tiene ni un llamador, y su propio comentario dice
-- «el cliente NO debe llamar esto directamente». Mismo cierre que
-- `grant_credits` y `monthly_reset_all`.
revoke all on function public.consume_credit(uuid, jsonb) from public;
revoke all on function public.consume_credit(uuid, jsonb) from authenticated;
grant execute on function public.consume_credit(uuid, jsonb) to service_role;


-- ── 2 · La fila de créditos: la suya, no la de otro ────────────────────────
--
-- Esta SÍ la llama el navegador (`src/lib/credits.ts`, al abrir la app), así
-- que no se puede cerrar: se acota. Sentado en la silla de un cliente,
-- `ensure_user_credits_row('<otro>')` devolvía la fila de créditos de ese
-- otro —su cuota, su saldo comprado y sus fechas— que la RLS le negaba.
create or replace function ensure_user_credits_row(p_user_id uuid)
returns user_credits
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row user_credits;
begin
  if p_user_id is distinct from auth.uid()
     and not public.el_que_llama_es_del_equipo() then
    raise exception 'Cada uno ve su propia fila de créditos';
  end if;

  insert into user_credits (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_row from user_credits where user_id = p_user_id;
  return v_row;
end;
$$;


-- ── 3 · Las cinco de la ficha del cliente: el diario, lo primero ───────────
--
-- `get_user_diary`, `get_user_tasks`, `get_user_metrics` (de
-- `fix-supabase.sql`) y `get_user_ventas`, `get_user_hoja_de_ruta` (de
-- `v2-migration.sql`) existen para que el EQUIPO pueda leer la ficha de un
-- cliente: las llama `src/pages/Admin.tsx` con `target_user_id`. Las cinco
-- son SECURITY DEFINER y ninguna preguntaba quién llamaba, así que lo único
-- que protegía el diario de un cliente —lo más íntimo que guarda la app— era
-- que la pantalla del Admin no se abra. Con la llave publicable y cualquier
-- sesión, `rpc('get_user_diary', { target_user_id })` lo entregaba.
--
-- Con `execute` y no escritas de corrido: cuatro de las cinco tablas
-- (`diario_entradas`, `tareas_usuario`, `metricas`, `ventas_registradas`) no
-- las crea ningún `.sql` del repo —nacieron en el panel de Supabase, igual
-- que `session_logs`, y así quedó anotado el 17 a las 19:30—. Un
-- `create function … returns setof <tabla>` sobre una tabla que no está no se
-- crea: revienta. Así que cada una se crea SI su tabla existe, y la que no
-- exista deja su aviso en vez de frenar la migración entera.
do $cinco$
declare
  v record;
begin
  for v in
    select * from (values
      ('get_user_diary',        'diario_entradas',     'user_id',
       'select * from diario_entradas where user_id = target_user_id order by fecha desc limit 10'),
      ('get_user_tasks',        'tareas_usuario',      'user_id',
       'select * from tareas_usuario where user_id = target_user_id'),
      ('get_user_metrics',      'metricas',            'user_id',
       'select * from metricas where user_id = target_user_id order by semana'),
      ('get_user_ventas',       'ventas_registradas',  'usuario_id',
       'select * from ventas_registradas where usuario_id = target_user_id order by fecha desc'),
      ('get_user_hoja_de_ruta', 'hoja_de_ruta',        'usuario_id',
       'select * from hoja_de_ruta where usuario_id = target_user_id order by pilar_numero, meta_codigo')
    ) as t(fn, tabla, col, cuerpo)
  loop
    if to_regclass('public.' || v.tabla) is null then
      raise notice 'sin %: % queda como está (la tabla vive solo en el panel)', v.tabla, v.fn;
      continue;
    end if;
    execute format($f$
      create or replace function public.%I(target_user_id uuid)
      returns setof public.%I
      language sql
      stable
      security definer
      set search_path = public
      as $cuerpo$
        select * from (%s) as q
         where target_user_id = auth.uid()
            or public.el_que_llama_es_del_equipo();
      $cuerpo$;
    $f$, v.fn, v.tabla, v.cuerpo);
  end loop;
end $cinco$;


-- ── 4 · La poda del registro de fallas: la abre el Admin, no un cliente ────
--
-- Esta la encontró la lente nueva, no yo: `podar_fallas_viejas` ya estaba
-- revocada de PUBLIC el 5 de noviembre —bien— y concedida a `authenticated`,
-- que es el rol de CUALQUIER cliente con sesión. Borra todo lo anterior a
-- treinta días de `fallas_vistas`, que es el único registro de lo que se le
-- rompe a un cliente. La llama `src/components/admin/LoQueSeRompio.tsx` al
-- abrir el panel, así que el permiso se queda y la guarda va adentro.
create or replace function public.podar_fallas_viejas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  perform public.solo_el_equipo('podar el registro de fallas');
  delete from public.fallas_vistas where creado_en < now() - interval '30 days';
  get diagnostics n = row_count;
  return n;
end;
$$;
