-- ══════════════════════════════════════════════════════════════════
-- LA PAUSA GLOBAL — parar el Camino de todos a la vez.
--
-- Primer uso: del 15 de diciembre al 15 de enero. Durante la pausa el
-- Camino queda a la vista, pero nadie acumula atraso ni aparece en el
-- semáforo. Al terminar, las fechas de todos se corren los días que
-- duró, con el progreso intacto.
--
-- Una sola fila activa por vez. Se guardan las anteriores para poder
-- mirar hacia atrás y para que las fechas sigan cuadrando después.
-- ══════════════════════════════════════════════════════════════════

create table if not exists public.pausas_globales (
  id uuid primary key default gen_random_uuid(),
  desde date not null,
  hasta date not null,
  motivo text,
  creada_por text,
  creada_el timestamptz default now(),
  check (hasta >= desde)
);

alter table public.pausas_globales enable row level security;

-- Todos la leen: el cliente necesita ver cuándo retoma su Camino.
drop policy if exists "pausas visibles para todos" on public.pausas_globales;
create policy "pausas visibles para todos"
  on public.pausas_globales for select
  to authenticated using (true);

-- Solo el equipo la crea o la levanta. Se mira la columna `rol`, igual que
-- todas las demás políticas de la base: `es_admin` no existe en profiles.
drop policy if exists "pausas las maneja el equipo" on public.pausas_globales;
create policy "pausas las maneja el equipo"
  on public.pausas_globales for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and rol = 'admin'));

comment on table public.pausas_globales is
  'Los tramos en que el Camino se detuvo para todos. Las fechas de cada cliente se corren esos días.';
