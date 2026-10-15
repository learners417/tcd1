-- ════════════════════════════════════════════════════════════════════════
--  LOS MENSAJES, EN VIVO
--
--  Hay SEIS suscripciones en tiempo real sobre `public.mensajes`:
--
--    · Topbar.tsx          el contador de respuestas sin abrir del cliente
--    · BottomTabBar.tsx    el globo sobre «Contacto» en el teléfono
--    · Mensajes.tsx        su conversación, mientras la tiene abierta
--    · Admin.tsx (×3)      el aviso al equipo y las dos conversaciones
--
--  Y `mensajes` no estaba en la publicación `supabase_realtime`. Solo
--  `notificaciones`, que la agregó 20260519 con este mismo bloque.
--
--  Supabase solo empuja los cambios de las tablas publicadas, así que las seis
--  escuchaban una tabla que no habla. El síntoma no es «no me enteré»: los
--  contadores se recuperan al recargar porque además consultan directo. El
--  síntoma es «me enteré tarde» — el cliente escribe, el equipo contesta, y
--  ninguno de los dos ve la respuesta hasta que cierra y abre la app.
--
--  Lo mismo con `user_credits`, que tiene su suscripción en credits.ts.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════════

do $$
declare
  t text;
begin
  foreach t in array array['mensajes', 'user_credits']
  loop
    -- Si la tabla no existe todavía, se saltea en vez de cortar la corrida:
    -- `user_credits` vive detrás del sistema de créditos, que está apagado.
    if not exists (
      select 1 from information_schema.tables
       where table_schema = 'public' and table_name = t
    ) then
      raise notice 'public.% no existe todavía: se saltea', t;
      continue;
    end if;

    -- ADD TABLE no es idempotente si la tabla ya está en la publicación.
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
      raise notice 'public.% agregada a supabase_realtime', t;
    end if;

    -- Para que el payload de un UPDATE traiga también la fila vieja. Hace
    -- falta para «marcar leído» entre pestañas, que es justo lo que el
    -- contador del cliente necesita para no quedar desfasado.
    execute format('alter table public.%I replica identity full', t);
  end loop;
end $$;
