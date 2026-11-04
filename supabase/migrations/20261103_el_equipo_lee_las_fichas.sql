-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  EL EQUIPO PODÍA EDITAR CUALQUIER FICHA, PERO NO PODÍA LEERLA            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Encontrado el 3 de nov, dando de alta al primer cliente real desde el Admin.
-- El alta terminaba en «La cuenta se creó, pero su ficha todavía no apareció
-- en la base», con la ficha ya creada y visible desde el editor SQL.
--
-- `profiles` tenía una sola política de lectura, la de
-- `fix-supabase.sql`:
--
--     "Authenticated users can view own profile"  FOR SELECT  (auth.uid() = id)
--
-- O sea: cada uno ve SU ficha y ninguna otra. Para el equipo había una de
-- escritura sobre todas (`el equipo edita cualquier ficha`,
-- 20261018_cerrar_antes_de_abrir.sql) pero NINGUNA de lectura. El Admin no se
-- daba cuenta porque la lista de clientes la trae el RPC `get_all_profiles`,
-- que es `security definer` y pasa por encima de RLS.
--
-- Lo que sí pasaba por RLS, y devolvía cero filas sin devolver error:
--
--   1 · La espera del alta (Admin.tsx): pregunta diez veces por la ficha con
--       un select directo. Nunca la veía, y el alta se cortaba ANTES de
--       marcar el servicio y antes de abrir la llave de la migración.
--
--   2 · El `update ... .select('id')` de la misma función. El UPDATE estaba
--       permitido, pero en Postgres el RETURNING necesita además permiso de
--       lectura sobre la fila: habría devuelto cero filas y el cartel
--       siguiente, «sus datos no se guardaron», con los datos guardados.
--
--   3 · El merge de columnas del plan en `cargarClientes()`. Trae
--       `servicio_contratado`, `acceso_tipo`, `cima_incluida`,
--       `biblioteca_abierta` y las demás con un select directo, y venía vacío
--       para TODOS los clientes. Es justo lo que su propio comentario dice que
--       evita: «sin estas tres, la ficha no sabe qué contrató y la matriz le
--       pide los 62 ítems a todo el mundo».
--
-- Es una línea: la lectura que faltaba, con el mismo criterio que la escritura
-- que ya estaba dada. No abre nada nuevo —quien ya podía editar cualquier
-- ficha ahora también puede leerla— y el cliente sigue viendo solo la suya,
-- porque las políticas se suman.

drop policy if exists "el equipo lee cualquier ficha" on public.profiles;
create policy "el equipo lee cualquier ficha" on public.profiles
  for select to authenticated
  using (public.es_del_equipo(auth.uid()));

comment on policy "el equipo lee cualquier ficha" on public.profiles is
  'La lectura que le faltaba al equipo. `es_del_equipo` es security definer, así que una política sobre profiles que la usa no se muerde la cola. Sin esto, el alta de un cliente desde el Admin no encontraba la ficha que el disparador acababa de crear.';
