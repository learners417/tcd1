-- ════════════════════════════════════════════════════════════════════
--  EL SERVICIO CONTRATADO, SEPARADO DEL PLAN DE ACCESO
--
--  Había una sola columna haciendo dos trabajos. `plan_comercial`
--  gobierna qué pantallas ve el cliente ($27 / $497 / $997), y el
--  código la traducía además a un escalón de servicio humano:
--
--      verde  → $5.000 de instalación
--      negro  → $10.000 con sesiones de dirección
--
--  O sea que alguien que pagó $497 de acceso aparecía en su ficha como
--  «la agencia instala 51 de 62 ítems». Quien trabajara contra ese
--  cuadro instalaba de regalo.
--
--  Son dos preguntas distintas y ahora son dos columnas distintas:
--
--      plan_comercial       → qué ve.    La decide el checkout.
--      servicio_contratado  → qué debe.  La marca una persona.
--
--  TODOS los clientes actuales quedan en el escalón más bajo. Es a
--  propósito: mostrarle de menos a quien pagó se arregla con un
--  mensaje; mostrarle de más hace trabajar al equipo gratis y nadie se
--  entera hasta que es tarde. Hay que marcar uno por uno en su ficha.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── El escalón de servicio ─────────────────────────────────────────
--   base         $1.000  los cuatro manuales, su plan, 3 sesiones 1-1, la app
--   ascenso      $3.000  los 90 días completos, grupales 3x semana, garantía
--   instalacion  $5.000  el equipo monta todo

alter table public.profiles
  add column if not exists servicio_contratado text not null default 'base';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_servicio_contratado_check'
  ) then
    alter table public.profiles
      add constraint profiles_servicio_contratado_check
      check (servicio_contratado in ('base', 'ascenso', 'instalacion'));
  end if;
end $$;

comment on column public.profiles.servicio_contratado is
  'Qué le debe el equipo. Se marca a mano en la ficha del cliente. NUNCA se deriva de plan_comercial: son dos escaleras distintas.';

-- ── La Cima, que se suma a cualquiera de los tres ──────────────────
-- Los cinco días en Bariloche. No cambia el reparto de los 62 ítems,
-- así que es un sí o no aparte y no un cuarto escalón.

alter table public.profiles
  add column if not exists cima_incluida boolean not null default false;

comment on column public.profiles.cima_incluida is
  'Los cinco días en Bariloche. Se suma a cualquier escalón de servicio.';

-- ── Quién puede cambiarlo ──────────────────────────────────────────
-- Solo el equipo, y queda registrado quién lo marcó y cuándo: es una
-- columna que decide trabajo pagado, no una preferencia.

alter table public.profiles
  add column if not exists servicio_marcado_por uuid references public.profiles(id),
  add column if not exists servicio_marcado_el timestamptz;

create or replace function public.marcar_servicio(
  p_cliente uuid,
  p_servicio text,
  p_cima boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede marcar el servicio contratado';
  end if;

  if p_servicio not in ('base', 'ascenso', 'instalacion') then
    raise exception 'Escalón desconocido: %', p_servicio;
  end if;

  update public.profiles
     set servicio_contratado  = p_servicio,
         cima_incluida        = coalesce(p_cima, cima_incluida),
         servicio_marcado_por = auth.uid(),
         servicio_marcado_el  = now()
   where id = p_cliente;
end $$;

grant execute on function public.marcar_servicio(uuid, text, boolean) to authenticated;

-- ── La ventana de acceso ───────────────────────────────────────────
-- Treinta días, noventa, o en cuotas. Hasta hoy esto solo se podía
-- cargar a mano en la base o por script: el alta no lo pedía y no había
-- dónde editarlo después, así que los clientes quedaban sin ventana.

create or replace function public.marcar_acceso(
  p_cliente uuid,
  p_tipo    text,
  p_hasta   date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede cambiar la ventana de acceso';
  end if;

  if p_tipo not in ('treinta', 'noventa', 'cuotas') then
    raise exception 'Ventana desconocida: %', p_tipo;
  end if;

  update public.profiles
     set acceso_tipo  = p_tipo,
         acceso_hasta = p_hasta
   where id = p_cliente;
end $$;

grant execute on function public.marcar_acceso(uuid, text, date) to authenticated;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select servicio_contratado, count(*) from public.profiles
--  group by 1 order by 1;        -- al principio: todos en 'base'
