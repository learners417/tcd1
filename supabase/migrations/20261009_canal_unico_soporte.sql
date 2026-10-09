-- ════════════════════════════════════════════════════════════════════
--  UN SOLO CANAL PARA EL SOPORTE
--
--  Hasta hoy había tres nombres de canal para la misma conversación:
--
--    · el cliente escribía en   'Consultas Generales'
--    · el Admin leía            'privado'
--    · la Bandeja de Soporte    'humano'
--
--  Resultado: el mensaje del cliente quedaba guardado acá y no aparecía
--  en ninguna pantalla del equipo. Y como 'Consultas Generales' no es
--  'privado', la política de lectura lo dejaba a la vista de CUALQUIER
--  cliente autenticado.
--
--  El canal único es 'privado', que es el que la política ya protege:
--  lo ven el emisor, el receptor y el equipo. Nadie más.
--
--    cliente → equipo:  canal='privado', emisor=cliente, receptor=NULL
--    equipo → cliente:  canal='privado', emisor=quien responde, receptor=cliente
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 · Las columnas del reloj de respuesta ─────────────────────────
-- Viven en sala-de-mando.sql, que quedó fuera de las migraciones y puede
-- no haber corrido nunca. Sin ellas el compromiso de 24 h es decorativo.

alter table public.mensajes add column if not exists tipo text;
alter table public.mensajes add column if not exists respondido_en timestamptz;

-- 'duda' espera un día; 'roto' le está costando dinero ahora.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mensajes_tipo_check'
  ) then
    alter table public.mensajes
      add constraint mensajes_tipo_check
      check (tipo is null or tipo in ('duda', 'roto'));
  end if;
end $$;

-- ── 2 · Mudar lo que ya está escrito ───────────────────────────────
-- Los mensajes que los clientes mandaron y nadie vio. Pasan a 'privado'
-- con receptor NULL, que es como se escribe de ahora en más.

update public.mensajes
   set canal = 'privado',
       receptor_id = null
 where canal = 'Consultas Generales';

-- Lo que el equipo mandó por el canal viejo. Acá el receptor ya venía
-- cargado; si no, no hay a quién devolvérselo y se deja como está.
update public.mensajes
   set canal = 'privado'
 where canal = 'humano'
   and receptor_id is not null;

-- ── 3 · Que el equipo entero reciba el aviso ───────────────────────
-- La función que avisa buscaba solo perfiles con rol='admin', así que
-- quien tiene admin_rol pero no ese rol no recibía nada, aunque la
-- política de lectura sí lo deje leer. Mismo criterio que is_team_member().

create or replace function public.ids_del_equipo()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles
   where rol = 'admin'
      or admin_rol in ('owner', 'manager', 'staff');
$$;

grant execute on function public.ids_del_equipo() to authenticated;

-- ── 4 · Buscar lo que espera respuesta, rápido ─────────────────────
create index if not exists idx_mensajes_soporte_pendiente
  on public.mensajes (created_at desc)
  where canal = 'privado' and receptor_id is null and respondido_en is null;

-- ── 5 · Marcar respondido ──────────────────────────────────────────
-- La versión de sala-de-mando.sql filtraba por canal='humano', así que
-- nunca marcaba nada. Esta trabaja sobre el canal único.

create or replace function public.marcar_respondido(p_cliente uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede marcar un mensaje como respondido';
  end if;

  update public.mensajes
     set respondido_en = now()
   where canal = 'privado'
     and emisor_id = p_cliente
     and receptor_id is null
     and respondido_en is null;

  get diagnostics v_filas = row_count;
  return v_filas;
end $$;

grant execute on function public.marcar_respondido(uuid) to authenticated;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) as sin_mudar from public.mensajes
--  where canal in ('Consultas Generales', 'humano');   -- debe dar 0
