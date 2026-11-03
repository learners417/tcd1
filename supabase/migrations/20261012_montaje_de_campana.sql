-- ════════════════════════════════════════════════════════════════════
--  EL MONTAJE DE LA CAMPAÑA, CON LOS DATOS ADENTRO
--
--  ═══ LOS DOS PROBLEMAS QUE RESUELVE ═══
--
--  1 · LOS OCHO CANDADOS VIVÍAN EN EL NAVEGADOR.
--      Lo que el cliente tilda antes de encender estaba en localStorage:
--      cambia de teléfono o limpia el navegador y lo pierde todo. Y el
--      equipo no lo veía nunca, aunque es el único gate real del botón
--      de encender.
--
--  2 · LA PIEZA REAL DE LA CAMPAÑA NO SE CARGABA EN NINGÚN LADO.
--      El link del anuncio corriendo en Meta, el píxel, el dominio, la
--      página de captura, el formulario y el calendario: ninguno tenía
--      dónde guardarse. Cuatro de ellos existían solo como un tilde de
--      sí o no, sin el dato.
--
--  La decisión que une las dos: EL CANDADO ES EL DATO. «Tu píxel está
--  activo» no se tilda a mano — se tilda porque el id del píxel está
--  cargado. Un tilde vacío no prueba nada y nadie lo puede verificar;
--  un dato sí, y además le sirve al equipo para mirarlo.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.montaje_campana (
  user_id uuid primary key references public.profiles(id) on delete cascade,

  -- ── Lo que se tilda porque el dato está ──────────────────────────
  palabra          text,   -- la palabra que dispara el recuperador
  url_pagina       text,   -- su página de venta, con precio y agenda
  pixel_id         text,   -- el píxel instalado y verificado
  url_perfil       text,   -- el link de su bio
  presupuesto_diario numeric,
  dias_sostenidos    integer,

  -- ── Lo que es una acción, no un dato ─────────────────────────────
  dm_probado  boolean not null default false,  -- escribió desde otra cuenta y le llegó
  trabajo_claro boolean not null default false,

  -- ── La pieza real, que hasta hoy no tenía dónde vivir ────────────
  url_anuncio_meta text,   -- el anuncio corriendo, para poder mirarlo
  dominio          text,
  url_formulario   text,
  url_calendario   text,

  actualizado_el timestamptz not null default now()
);

comment on table public.montaje_campana is
  'Lo que el cliente montó antes de encender. Cada candado guarda el dato que lo prueba, no un tilde suelto.';

create or replace function public.montaje_toca_fecha()
returns trigger language plpgsql as $$
begin
  new.actualizado_el := now();
  return new;
end $$;

drop trigger if exists montaje_campana_touch on public.montaje_campana;
create trigger montaje_campana_touch
  before update on public.montaje_campana
  for each row execute function public.montaje_toca_fecha();

-- ── Quién ve y quién escribe ───────────────────────────────────────
-- El cliente carga lo suyo. El equipo lee todo: es lo que necesita para
-- saber si alguien está listo para encender, y para mirar el anuncio.

alter table public.montaje_campana enable row level security;

drop policy if exists "montaje_cliente" on public.montaje_campana;
create policy "montaje_cliente" on public.montaje_campana
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "montaje_equipo_lee" on public.montaje_campana;
create policy "montaje_equipo_lee" on public.montaje_campana
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = auth.uid()
         and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
    )
  );

-- El equipo lee, no escribe: lo monta el cliente, y si lo cargara el
-- equipo por él nadie sabría si de verdad está hecho.

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select count(*) from public.montaje_campana;
