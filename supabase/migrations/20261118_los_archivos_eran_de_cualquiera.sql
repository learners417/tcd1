-- ═══════════════════════════════════════════════════════════════════════════
-- LOS ARCHIVOS ERAN DE CUALQUIERA
--
-- Medido el 18 de noviembre de 2026, ejecutando las 27 sentencias de storage
-- del repo contra un PostgreSQL de verdad, con la RLS de `storage.objects`
-- encendida como la trae Supabase y sentándose en cuatro sillas (sin sesión,
-- dos clientes distintos, el equipo):
--
--   · SIN NINGUNA SESIÓN —rol `anon`, que es la llave publicable que viaja en
--     el bundle del navegador— se listaban los 2 de 2 archivos de
--     `mensajes-archivos` y los 2 de 2 de `creativos-assets`. Y los dos
--     buckets son `public = true`: con el nombre en la mano, el archivo se
--     descarga. `mensajes-archivos` es lo que un cliente le MANDA a Javo en
--     el chat de soporte.
--   · UN CLIENTE veía los archivos de los demás en esos dos buckets.
--   · UN CLIENTE podía SUBIR a la carpeta de otro cliente en
--     `creativos-assets`, y a cualquier carpeta inventada.
--
-- POR QUÉ NO SE VEÍA MIRANDO. Las tres políticas de esos dos buckets se
-- escribieron sin `to <rol>`, y una política sin `to` vale para TODOS los
-- roles: PostgreSQL la guarda como `{public}` y no avisa nada.
-- `creativos_assets_insert` además pregunta `auth.role() = 'authenticated'`
-- y nada más: no pregunta de quién es la carpeta.
--
-- LO QUE NO CAMBIA. Las rutas siguen siendo las mismas y la app no se toca:
-- el chat de soporte muestra el archivo por su URL pública (`getPublicUrl`,
-- que no pasa por esta política) y la galería de creativos lo mismo. Nadie en
-- el código LISTA esos dos buckets. Lo que se cierra es poder averiguar qué
-- subió el otro.
--
-- LO QUE SIGUE SIENDO TUYO, Javo: los dos buckets siguen siendo `public`, así
-- que un archivo cuya URL ya salió —un enlace reenviado, un historial— sigue
-- abriéndose sin sesión. Pasarlos a privados obliga a firmar cada URL y es un
-- cambio de comportamiento, no una cerradura: queda anotado en el mapa con su
-- botón y no se toca solo.
--
-- `el_que_llama_es_del_equipo()` la crea `sala-de-mando.sql`, que es la única
-- copia de «quién es del equipo». Por eso ese archivo va ANTES de este.
--
-- Pegar en Supabase → SQL Editor → Run. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1 · El chat de soporte: cada uno ve su carpeta ─────────────────────────
drop policy if exists "mensajes_archivos_read" on storage.objects;
create policy "mensajes_archivos_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'mensajes-archivos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )
  );

-- ── 2 · Los creativos: cada uno ve su carpeta ──────────────────────────────
drop policy if exists "creativos_assets_select" on storage.objects;
create policy "creativos_assets_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'creativos-assets'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )
  );

-- ── 3 · Y escribe en su carpeta, no en la de al lado ───────────────────────
--
-- La rama del equipo no es de adorno: `uploadCreativeImage(userId, …)` se
-- llama también desde el Admin con el id DEL CLIENTE, así que el equipo
-- escribe dentro de carpetas ajenas a propósito. Es la misma razón por la que
-- `20260422_creativos_admin_rls.sql` le dio su rama al borrado.
drop policy if exists "creativos_assets_insert" on storage.objects;
create policy "creativos_assets_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'creativos-assets'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )
  );

-- ── 4 · Las tres del bucket privado: el rol, escrito ───────────────────────
--
-- Estas tres MIDEN BIEN hoy —se ejercieron: sin sesión no ve nada— porque su
-- condición pregunta por una fila de `profiles` con `auth.uid()`, y sin
-- sesión `auth.uid()` es null. Pero están escritas `{public}` igual que las
-- de arriba, o sea que lo único que las cierra es la condición: el día que
-- alguien la toque, `anon` entra por la puerta de atrás sin que se note. Se
-- les escribe el rol, y la condición queda en una sola copia de la regla.
drop policy if exists "task_attachments_read" on storage.objects;
create policy "task_attachments_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'task-attachments' and public.el_que_llama_es_del_equipo());

drop policy if exists "task_attachments_insert" on storage.objects;
create policy "task_attachments_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'task-attachments' and public.el_que_llama_es_del_equipo());

drop policy if exists "task_attachments_delete" on storage.objects;
create policy "task_attachments_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'task-attachments' and public.el_que_llama_es_del_equipo());

-- ── 5 · El borrado y la actualización de creativos, con su rol ─────────────
drop policy if exists "creativos_assets_delete" on storage.objects;
create policy "creativos_assets_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'creativos-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "creativos_assets_admin_delete" on storage.objects;
create policy "creativos_assets_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'creativos-assets' and public.el_que_llama_es_del_equipo());

drop policy if exists "creativos_assets_admin_update" on storage.objects;
create policy "creativos_assets_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'creativos-assets' and public.el_que_llama_es_del_equipo())
  with check (bucket_id = 'creativos-assets' and public.el_que_llama_es_del_equipo());

-- ── Para confirmar que corrió ──────────────────────────────────────────────
-- Ninguna fila con `{public}`:
--   select policyname, cmd, roles from pg_policies
--    where schemaname='storage' and roles::text like '%public%';
