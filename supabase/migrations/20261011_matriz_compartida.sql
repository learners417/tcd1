-- ════════════════════════════════════════════════════════════════════
--  LA MATRIZ, COMPARTIDA DE VERDAD
--
--  La pantalla promete que el estado de cada celda, la nota y el link
--  del anuncio los ve todo el equipo. No era así.
--
--  DOS COSAS ESTABAN ROTAS, Y LAS DOS EN SILENCIO:
--
--  1 · LAS COLUMNAS NO EXISTÍAN. El código escribe `estado`, `nota` y
--      `link`; la tabla solo tiene `notas`. El error se descartaba y
--      todo caía a localStorage: Lupe cargaba el link de un anuncio y
--      Javo, desde su teléfono, no veía nada.
--
--  2 · SE GUARDABA CON UN UPDATE, Y LA FILA SOLO EXISTE SI EL PASO ESTÁ
--      TILDADO. Así que poner una nota en un paso pendiente —que es
--      justo cuando una nota sirve— no guardaba nada, ni siquiera con
--      las columnas creadas.
--
--  El arreglo de fondo: una fila ahora puede existir SIN estar tildada.
--  `completado_at` pasa a poder ser nulo, y eso es lo que distingue
--  «tildado» de «tiene una nota y sigue pendiente».
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 · Una fila puede existir sin estar tildada ───────────────────
alter table public.cliente_preactivacion_check
  alter column completado_at drop not null,
  alter column completado_at drop default;

comment on column public.cliente_preactivacion_check.completado_at is
  'Cuándo se tildó. NULL = la fila existe por su nota, su link o su estado, y el paso sigue pendiente.';

-- ── 2 · Lo que cada celda guarda ───────────────────────────────────
alter table public.cliente_preactivacion_check
  add column if not exists estado text,
  add column if not exists nota   text,
  add column if not exists link   text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'preactivacion_estado_check'
  ) then
    alter table public.cliente_preactivacion_check
      add constraint preactivacion_estado_check
      check (estado is null or estado in ('pendiente', 'proceso', 'listo', 'na'));
  end if;
end $$;

-- `notas` (plural) es la columna vieja, que ninguna pantalla escribió
-- nunca. Lo que haya adentro se pasa a la nueva antes de dejarla quieta.
update public.cliente_preactivacion_check
   set nota = notas
 where nota is null and notas is not null;

-- ── 3 · Guardar sin pisar el tilde ─────────────────────────────────
-- Crea la fila si no está, y deja `completado_at` como esté: poner una
-- nota no tilda el paso, y tildarlo no borra la nota.

create or replace function public.guardar_extra_celda(
  p_cliente uuid,
  p_step    text,
  p_estado  text default null,
  p_nota    text default null,
  p_link    text default null
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
    raise exception 'Solo el equipo puede escribir en la matriz';
  end if;

  insert into public.cliente_preactivacion_check
         (cliente_id, step_id, completado_at, completado_por, estado, nota, link)
  values (p_cliente, p_step, null, auth.uid(), p_estado, p_nota, p_link)
  on conflict (cliente_id, step_id) do update
    set estado = coalesce(excluded.estado, cliente_preactivacion_check.estado),
        nota   = coalesce(excluded.nota,   cliente_preactivacion_check.nota),
        link   = coalesce(excluded.link,   cliente_preactivacion_check.link);

  -- Una celda que se queda sin nada y sin tilde no deja basura atrás.
  delete from public.cliente_preactivacion_check
   where cliente_id = p_cliente and step_id = p_step
     and completado_at is null
     and coalesce(estado, '') = '' and coalesce(nota, '') = '' and coalesce(link, '') = '';
end $$;

grant execute on function public.guardar_extra_celda(uuid, text, text, text, text) to authenticated;

-- ── 4 · El equipo puede leer el Camino de sus clientes ─────────────
--
-- Diecinueve de los 62 pasos se tildan solos cuando el cliente completa
-- su sesión. La única política de `hoja_de_ruta` era
-- `auth.uid() = usuario_id`, así que esa consulta devolvía las filas del
-- propio admin y nada más: los tildes automáticos no aparecían nunca.

do $$
begin
  if to_regclass('public.hoja_de_ruta') is not null then
    drop policy if exists "hoja_de_ruta_equipo_lee" on public.hoja_de_ruta;
    create policy "hoja_de_ruta_equipo_lee" on public.hoja_de_ruta
      for select using (
        exists (
          select 1 from public.profiles
           where id = auth.uid()
             and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
        )
      );
  end if;
end $$;

-- Solo lectura, a propósito: el Camino lo cierra el cliente. Si el
-- equipo pudiera tildarlo por él, el avance dejaría de querer decir algo.

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) from public.cliente_preactivacion_check
--  where completado_at is null;     -- celdas con nota y sin tildar
