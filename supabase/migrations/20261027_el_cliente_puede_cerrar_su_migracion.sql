-- ════════════════════════════════════════════════════════════════════════
--  EL CLIENTE PUEDE CERRAR SU MIGRACIÓN
--
--  ═══ QUÉ ESTABA PASANDO ═══
--
--  La migración del cliente entró el 17 de octubre. El disparador que impide
--  que un cliente se cambie a sí mismo lo que compró entró el 18.
--
--  Ese disparador prohíbe que alguien que no es del equipo toque
--  `migrado_en`. Y `migrado_en` es justo la columna que escribe
--  `cerrar_mi_migracion()`, que es la función oficial para cerrarla.
--
--  `cerrar_mi_migracion` es SECURITY DEFINER, pero el disparador no mira con
--  qué rol corre: mira `auth.uid()`, que sigue siendo el cliente. Así que el
--  disparador bloqueaba a la función que él mismo señala como la única manera
--  de hacerlo.
--
--  El efecto, desde el 18 de octubre: el cliente pegaba su material, su ADN
--  se guardaba —esas columnas el disparador no las mira— y el cierre fallaba.
--  Recibía un error, quedaba sin fechar, y la tarjeta «Trae tu trabajo» le
--  seguía apareciendo en su HOY. Para siempre.
--
--  ═══ CÓMO SE ARREGLA ═══
--
--  La función avisa, dentro de su propia transacción, que la que está
--  escribiendo es ella. El disparador lee ese aviso y deja pasar esa columna.
--
--  El candado no se afloja: un update a mano desde el navegador no trae el
--  aviso, y sigue rebotando con el mismo mensaje. Y el aviso es `is_local`,
--  así que muere con la transacción y no puede quedar encendido.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1 · La función avisa que es ella ──────────────────────────────────
create or replace function public.cerrar_mi_migracion()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- La guarda importa: sin ella, un cliente al que nunca se le habilitó la
  -- migración podría marcarse como migrado y saltearse su Camino entero.
  if not exists (
    select 1 from public.profiles
     where id = auth.uid() and migracion_habilitada = true
  ) then
    raise exception 'Tu migración no está habilitada';
  end if;

  -- El aviso para el disparador. El tercer argumento en `true` lo hace local
  -- a esta transacción: termina con ella, y no hay forma de dejarlo prendido.
  perform set_config('app.cerrando_migracion', 'si', true);

  update public.profiles
     set migrado_en = now()
   where id = auth.uid()
     -- Una sola vez. Volver a correrla pisaría la fecha original, que es el
     -- dato con el que el equipo sabe quién pasó y cuándo.
     and migrado_en is null;
end;
$$;

comment on function public.cerrar_mi_migracion is
  'El cliente cierra su propia migración. Avisa al disparador de profiles que la escritura viene de acá, dentro de su propia transacción.';

revoke all on function public.cerrar_mi_migracion() from public;
grant execute on function public.cerrar_mi_migracion() to authenticated;

-- ── 2 · El disparador escucha ese aviso ───────────────────────────────
--
-- Se recrea entero y no se parchea: la función del 18 de octubre cubre nueve
-- columnas, y dejar dos versiones de la misma lista es cómo se pierde una.
create or replace function public.profiles_solo_el_equipo_cambia_lo_que_compro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.es_del_equipo(auth.uid()) then
    return new;
  end if;

  -- `is distinct from` y no `<>`: con nulos, `<>` devuelve nulo y la
  -- comparación no detecta el cambio.
  if new.servicio_contratado is distinct from old.servicio_contratado then
    raise exception 'El escalón de servicio lo marca el equipo';
  end if;
  if new.cima_incluida is distinct from old.cima_incluida then
    raise exception 'La Cima la marca el equipo';
  end if;
  if new.migracion_habilitada is distinct from old.migracion_habilitada then
    raise exception 'La migración la habilita el equipo';
  end if;
  -- La única excepción de toda la lista: cerrar su propia migración. Pasa
  -- cuando la escritura viene de `cerrar_mi_migracion()`, que es la que pone
  -- el aviso. Un update a mano no lo trae y rebota igual que antes.
  if new.migrado_en is distinct from old.migrado_en
     and coalesce(current_setting('app.cerrando_migracion', true), '') <> 'si' then
    raise exception 'La migración se cierra con cerrar_mi_migracion()';
  end if;
  if new.biblioteca_abierta is distinct from old.biblioteca_abierta then
    raise exception 'La Biblioteca la abre el equipo';
  end if;
  if new.rol is distinct from old.rol or new.admin_rol is distinct from old.admin_rol then
    raise exception 'Los permisos los cambia el equipo';
  end if;
  if new.plan_comercial is distinct from old.plan_comercial then
    raise exception 'El plan lo marca el equipo';
  end if;
  if new.acceso_tipo is distinct from old.acceso_tipo
     or new.acceso_hasta is distinct from old.acceso_hasta then
    raise exception 'La ventana de acceso la marca el equipo';
  end if;

  return new;
end;
$$;

comment on function public.profiles_solo_el_equipo_cambia_lo_que_compro is
  'Lo que compró un cliente lo marca el equipo. Única excepción: cerrar su propia migración, y solo cuando la escritura viene de cerrar_mi_migracion().';
