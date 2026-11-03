-- ════════════════════════════════════════════════════════════════════════
--  LA BIBLIOTECA ABIERTA, CLIENTE POR CLIENTE
--
--  La Biblioteca junta todos los videos y tutoriales en un solo lugar, más
--  allá del día del Camino en que vaya cada uno. Hasta ahora lo único que
--  decidía qué podía ver era su avance: `minPilar: 2` para entrar y, adentro,
--  lo que ya hubiera desbloqueado.
--
--  Eso está bien como regla general —el Camino se recorre, no se saltea— pero
--  no deja hacer lo único que el equipo necesita: darle acceso completo a un
--  cliente puntual. Al de La Instalación, que no recorre el Camino. Al que
--  renovó. Al que pidió ver una clase que todavía no le toca.
--
--  Así que es un permiso explícito, no derivado del plan: se marca por
--  cliente y queda escrito quién lo dio y cuándo. Un permiso que se deduce de
--  otra cosa es un permiso que nadie puede explicar cuando hay que revisarlo.
--
--  Idempotente: correrla dos veces no rompe nada.
-- ════════════════════════════════════════════════════════════════════════

alter table profiles
  add column if not exists biblioteca_abierta boolean not null default false,
  add column if not exists biblioteca_abierta_por uuid references auth.users(id),
  add column if not exists biblioteca_abierta_el timestamptz;

comment on column profiles.biblioteca_abierta is
  'true = ve la Biblioteca completa, sin esperar su día del Camino. Se marca a mano desde el Admin.';

-- Abre o cierra la Biblioteca de un cliente.
--
-- Solo el equipo. Y queda la firma: quién la abrió y cuándo. Al cerrarla se
-- borra la firma, porque una firma vieja sobre un permiso que ya no está
-- cuenta una historia que no es.
-- Se suelta antes de crear porque la migración que la endurece después
-- (20261018) le deja un default en `p_quien`, y `create or replace` no puede
-- quitarle un default a una función que ya está. Sin este drop la corrida
-- funciona la primera vez y falla la segunda, que es la peor forma de fallar:
-- se descubre reaplicando, con la base a medio actualizar.
drop function if exists public.marcar_biblioteca(uuid, boolean, uuid);

create or replace function marcar_biblioteca(
  p_cliente uuid,
  p_abierta boolean,
  p_quien uuid
) returns void
language plpgsql security definer as $$
begin
  if not exists (
    select 1 from profiles p
    where p.id = p_quien
      and (p.rol = 'admin' or p.admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede abrir la Biblioteca de un cliente';
  end if;

  update profiles
  set biblioteca_abierta = p_abierta,
      biblioteca_abierta_por = case when p_abierta then p_quien else null end,
      biblioteca_abierta_el  = case when p_abierta then now() else null end
  where id = p_cliente;
end $$;
