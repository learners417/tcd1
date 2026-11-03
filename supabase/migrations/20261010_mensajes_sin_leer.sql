-- ════════════════════════════════════════════════════════════════════
--  LOS MENSAJES SIN LEER, Y LOS ADJUNTOS DEL CLIENTE
--
--  Dos cosas que faltaban para que la app reemplace a Discord.
--
--  1 · NADIE SABÍA QUE TENÍA UN MENSAJE SIN LEER.
--      El contador del cliente estaba fijado en cero dentro del código,
--      y el del equipo se suscribía a una lista vacía. Los dos lados
--      dependían de abrir la pantalla por las dudas.
--
--  2 · EL CLIENTE SOLO PODÍA ESCRIBIR TEXTO.
--      La mitad de lo que manda alguien pidiendo ayuda es una captura
--      de pantalla. El bucket y las columnas existían en un archivo
--      suelto en la raíz del repo, fuera de las migraciones, así que no
--      hay forma de saber si llegaron a correr.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 · Cuándo lo leyó quien lo recibió ────────────────────────────
alter table public.mensajes add column if not exists leido_en timestamptz;

comment on column public.mensajes.leido_en is
  'Cuándo lo abrió quien lo recibió. Null = sin leer.';

create index if not exists idx_mensajes_sin_leer
  on public.mensajes (receptor_id)
  where canal = 'privado' and leido_en is null;

-- ── 2 · Marcar leída la conversación ───────────────────────────────
-- Se llama al abrir Soporte. Marca solo lo que le llegó a esa persona:
-- lo que ella misma escribió nunca cuenta como sin leer.

create or replace function public.marcar_leidos()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
begin
  update public.mensajes
     set leido_en = now()
   where canal = 'privado'
     and receptor_id = auth.uid()
     and leido_en is null;

  get diagnostics v_filas = row_count;
  return v_filas;
end $$;

grant execute on function public.marcar_leidos() to authenticated;

-- ── 3 · Cuántos esperan al equipo ──────────────────────────────────
-- Lo que escribió un cliente y todavía nadie respondió. El equipo no
-- tiene un receptor propio: los mensajes entrantes llegan sin destinatario.

create or replace function public.cuantos_esperan()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from public.profiles
       where id = auth.uid()
         and (rol = 'admin' or admin_rol in ('owner', 'manager', 'staff'))
    )
    then (
      select count(*)::integer from public.mensajes
       where canal = 'privado'
         and receptor_id is null
         and respondido_en is null
    )
    else 0
  end;
$$;

grant execute on function public.cuantos_esperan() to authenticated;

-- ── 4 · Los adjuntos ───────────────────────────────────────────────
-- Estas dos columnas y el bucket vivían en media-migration.sql, en la
-- raíz del repo. Se repiten acá para que el estado quede garantizado.

alter table public.mensajes add column if not exists tipo_archivo text;
alter table public.mensajes add column if not exists archivo_url  text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mensajes_tipo_archivo_check'
  ) then
    alter table public.mensajes
      add constraint mensajes_tipo_archivo_check
      check (tipo_archivo is null or tipo_archivo in ('imagen', 'audio', 'archivo'));
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('mensajes-archivos', 'mensajes-archivos', true)
on conflict (id) do nothing;

-- Cada quien sube a su propia carpeta, que lleva su id. Así el borrado
-- por dueño funciona y nadie pisa los archivos de otro.
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'mensajes_archivos_upload'
  ) then
    create policy "mensajes_archivos_upload"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'mensajes-archivos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'mensajes_archivos_read'
  ) then
    create policy "mensajes_archivos_read"
      on storage.objects for select
      using (bucket_id = 'mensajes-archivos');
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'mensajes_archivos_delete'
  ) then
    create policy "mensajes_archivos_delete"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'mensajes-archivos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- ── Para confirmar que corrió ──────────────────────────────────────
-- select public.cuantos_esperan();   -- desde una cuenta del equipo
