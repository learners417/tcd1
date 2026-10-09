-- ════════════════════════════════════════════════════════════════════
--  LAS SESIONES CON PERSONAS
--
--  ═══ EL HUECO QUE CIERRA ═══
--
--  Lo que se vende es acompañamiento: la sesión uno a uno de arranque y
--  las mentorías grupales tres veces por semana durante 90 días. Es el
--  corazón de la oferta, y era **lo único que no dejaba rastro en la
--  app**: no había tabla, ni pantalla, ni registro de una sola sesión.
--
--  Lo más parecido que existía era «Cargar sesión», que guarda las
--  DECISIONES de una sesión. Útil, pero si una sesión no produjo una
--  decisión no quedaba nada — y el hecho de que la sesión ocurrió es lo
--  que sostiene la garantía y lo que el cliente necesita ver.
--
--  Dos tablas porque una grupal tiene varios asistentes: la sesión
--  ocurre una vez, y a ella va quien va.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.sesiones (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,

  -- 'arranque'   la uno a uno que abre los 90 días
  -- 'grupal'     las mentorías de tres veces por semana
  -- 'uno_a_uno'  cualquier otra sesión individual
  tipo text not null check (tipo in ('arranque', 'grupal', 'uno_a_uno')),

  quien_la_dio   text not null,
  quien_la_cargo uuid references public.profiles(id) on delete set null,

  /* Lo que pasó, en las palabras de quien la dio. */
  notas text,
  /* Lo que quedó para la próxima. */
  pendiente text,

  minutos integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_sesiones_fecha on public.sesiones (fecha desc);

comment on table public.sesiones is
  'Cada sesión con personas que ocurrió. Es lo que sostiene la promesa de acompañamiento.';

-- ── Quién estuvo ───────────────────────────────────────────────────
create table if not exists public.sesiones_asistentes (
  sesion_id  uuid not null references public.sesiones(id) on delete cascade,
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  /* Falso = estaba invitado y no vino. Se guarda igual: una grupal a la
     que alguien falta tres veces seguidas dice algo. */
  asistio boolean not null default true,
  primary key (sesion_id, cliente_id)
);

create index if not exists idx_sesiones_asistentes_cliente
  on public.sesiones_asistentes (cliente_id);

-- ── Quién ve y quién escribe ───────────────────────────────────────
-- Las carga el equipo. El cliente ve las suyas, y nada más: en una
-- grupal no tiene por qué saber quiénes fueron los demás.

alter table public.sesiones enable row level security;
alter table public.sesiones_asistentes enable row level security;

drop policy if exists "sesiones_equipo" on public.sesiones;
create policy "sesiones_equipo" on public.sesiones
  for all to authenticated
  using (
    exists (select 1 from public.profiles
             where id = auth.uid()
               and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff')))
  )
  with check (
    exists (select 1 from public.profiles
             where id = auth.uid()
               and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff')))
  );

drop policy if exists "sesiones_cliente_lee_las_suyas" on public.sesiones;
create policy "sesiones_cliente_lee_las_suyas" on public.sesiones
  for select to authenticated
  using (
    exists (select 1 from public.sesiones_asistentes a
             where a.sesion_id = sesiones.id and a.cliente_id = auth.uid())
  );

drop policy if exists "asistentes_equipo" on public.sesiones_asistentes;
create policy "asistentes_equipo" on public.sesiones_asistentes
  for all to authenticated
  using (
    exists (select 1 from public.profiles
             where id = auth.uid()
               and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff')))
  )
  with check (
    exists (select 1 from public.profiles
             where id = auth.uid()
               and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff')))
  );

drop policy if exists "asistentes_cliente_ve_su_fila" on public.sesiones_asistentes;
create policy "asistentes_cliente_ve_su_fila" on public.sesiones_asistentes
  for select to authenticated
  using (cliente_id = auth.uid());

-- ── Cargar una sesión con sus asistentes, de una sola vez ──────────
-- Si se hiciera en dos pasos desde la pantalla y el segundo fallara,
-- quedaría una sesión sin nadie adentro: un registro que dice que algo
-- pasó, sin decir a quién. Peor que no tenerlo.

create or replace function public.cargar_sesion(
  p_tipo       text,
  p_fecha      date,
  p_quien      text,
  p_clientes   uuid[],
  p_notas      text default null,
  p_pendiente  text default null,
  p_minutos    integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_cliente uuid;
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid()
       and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
  ) then
    raise exception 'Solo el equipo puede cargar una sesión';
  end if;

  if p_clientes is null or array_length(p_clientes, 1) is null then
    raise exception 'Una sesión sin asistentes no dice nada: elige al menos uno';
  end if;

  insert into public.sesiones (tipo, fecha, quien_la_dio, quien_la_cargo, notas, pendiente, minutos)
  values (p_tipo, coalesce(p_fecha, current_date), p_quien, auth.uid(), p_notas, p_pendiente, p_minutos)
  returning id into v_id;

  foreach v_cliente in array p_clientes loop
    insert into public.sesiones_asistentes (sesion_id, cliente_id)
    values (v_id, v_cliente)
    on conflict do nothing;
  end loop;

  return v_id;
end $$;

grant execute on function public.cargar_sesion(text, date, text, uuid[], text, text, integer) to authenticated;

-- ── Hace cuánto que cada cliente no tiene una sesión ───────────────
-- El número que le sirve al equipo: quien lleva tres semanas sin una
-- está dejando de recibir lo que compró, y nadie se entera solo.

create or replace function public.dias_sin_sesion()
returns table (cliente_id uuid, ultima date, dias integer)
language sql
stable
security definer
set search_path = public
as $$
  select p.id,
         max(s.fecha) as ultima,
         (current_date - max(s.fecha))::integer as dias
    from public.profiles p
    left join public.sesiones_asistentes a on a.cliente_id = p.id and a.asistio
    left join public.sesiones s on s.id = a.sesion_id
   where exists (
     select 1 from public.profiles q
      where q.id = auth.uid()
        and (q.rol = 'admin' or q.admin_rol in ('owner', 'manager', 'staff'))
   )
   group by p.id;
$$;

grant execute on function public.dias_sin_sesion() to authenticated;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) from public.sesiones;
