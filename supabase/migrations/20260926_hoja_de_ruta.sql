-- ══════════════════════════════════════════════════════════════════
-- LA HOJA DE RUTA — lo que la app nueva necesita guardar.
--
-- Sin esto, cinco cosas se pierden en silencio: lo que el cliente ya
-- traía hecho, su tipo de eneagrama, los bonos que eligió para su
-- preventa, su ventana de acceso y el día en que entregó cada jornada.
--
-- Todo es opcional: quien ya está adentro sigue igual, con estos
-- campos vacíos hasta que los use.
-- ══════════════════════════════════════════════════════════════════

-- ── Lo que ya trae hecho: esas jornadas van en modo revisión ──
alter table public.profiles
  add column if not exists ya_tiene jsonb default '[]'::jsonb;

-- ── Su tipo, del test del día 3, y los dos bonos del día 24 ──
alter table public.profiles
  add column if not exists adn_eneagrama text,
  add column if not exists adn_bonos_preventa jsonb default '[]'::jsonb;

-- ── La ventana de acceso: treinta días, noventa o cuotas ──
alter table public.profiles
  add column if not exists acceso_tipo text default 'noventa',
  add column if not exists acceso_cuotas jsonb default '[]'::jsonb,
  add column if not exists acceso_dias_devueltos integer default 0;

-- ── El día en que entregó cada jornada, para medir el atraso ──
alter table public.profiles
  add column if not exists entregas jsonb default '{}'::jsonb;

-- Solo esos tres valores: lo que se carga por cliente al darle acceso.
alter table public.profiles
  drop constraint if exists profiles_acceso_tipo_check;
alter table public.profiles
  add constraint profiles_acceso_tipo_check
  check (acceso_tipo is null or acceso_tipo in ('treinta', 'noventa', 'cuotas'));

comment on column public.profiles.ya_tiene is
  'Lo que el cliente ya traía hecho al entrar. Esas jornadas se revisan, no se saltan.';
comment on column public.profiles.acceso_tipo is
  'treinta | noventa | cuotas. El Camino se cierra al vencer y el día 90 siempre.';
comment on column public.profiles.entregas is
  'clave de jornada -> fecha de entrega. Con esto se mide el atraso en el cierre de cuentas.';
