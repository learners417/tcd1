-- ════════════════════════════════════════════════════════════════════════
--  ANUNCIOS QUE AGENDAN — las fichas, guardadas en la cuenta
--
--  La herramienta guardaba en el navegador. O sea que el trabajo vivía en la
--  computadora donde se escribió: el cliente cargaba su ficha, abría la app en
--  el teléfono y no había nada. Y si limpiaba el historial, tampoco.
--
--  Acá vive en su cuenta. Entra desde donde entre y está.
--
--  Una columna jsonb y no veinte columnas: la ficha va a cambiar —cada regla
--  nueva puede traer un campo— y con veinte columnas cada cambio sería una
--  migración más. Lo que sí va en columnas es lo que se consulta de afuera: de
--  quién es y cuándo se tocó. Nadie busca una ficha por el texto de su gancho.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.anuncios_fichas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  nombre          text,
  datos           jsonb not null default '{}'::jsonb,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

comment on table public.anuncios_fichas is
  'Las fichas de «Anuncios que Agendan»: la ficha del cliente, sus candidatas a EL 20, las plantillas elegidas y los anuncios escritos.';
comment on column public.anuncios_fichas.datos is
  'La ficha entera. En jsonb para que una ficha guardada antes de que existiera un campo abra igual, con ese campo vacío.';

-- La lista se pide siempre por dueño y ordenada por lo último tocado.
create index if not exists idx_anuncios_fichas_duenio
  on public.anuncios_fichas (user_id, actualizado_en desc);

alter table public.anuncios_fichas enable row level security;

-- ── Cada cliente, lo suyo ─────────────────────────────────────────
drop policy if exists anuncios_fichas_propias on public.anuncios_fichas;
create policy anuncios_fichas_propias on public.anuncios_fichas
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Y el equipo, todas ────────────────────────────────────────────
--
-- Porque acompañar a un cliente con sus anuncios es la mitad del servicio, y
-- sin esto Lupe tendría que pedirle que le pase capturas de su propia ficha.
drop policy if exists anuncios_fichas_equipo on public.anuncios_fichas;
create policy anuncios_fichas_equipo on public.anuncios_fichas
  for all to authenticated
  using (public.es_del_equipo(auth.uid()))
  with check (public.es_del_equipo(auth.uid()));

-- ── La fecha se pone sola ─────────────────────────────────────────
--
-- Va en un trigger y no en el código: con la fecha puesta desde el navegador,
-- un reloj mal configurado manda una ficha al futuro y queda primera en la
-- lista para siempre.
create or replace function public.anuncios_fichas_marcar_fecha()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists anuncios_fichas_fecha on public.anuncios_fichas;
create trigger anuncios_fichas_fecha
  before insert or update on public.anuncios_fichas
  for each row execute function public.anuncios_fichas_marcar_fecha();
