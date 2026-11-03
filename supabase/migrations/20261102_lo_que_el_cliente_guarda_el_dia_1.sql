-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  LO QUE EL CLIENTE GUARDA EL DÍA 1, Y NO SE GUARDABA                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Encontrado el 2 de nov, revisando qué se rompe cuando entra un cliente real.
-- Tres tablas y cinco columnas que el código escribe y que NINGÚN .sql del
-- repositorio crea. Comprobado contra los 69 archivos de migraciones y los 7
-- sueltos de la raíz: `el_numero`, `hitos_cinturon` y `diario_resumen` no
-- aparecen nombradas ni una vez, mientras `profiles` aparece en 61.
--
-- Por qué no lo vio ningún instrumento: el medidor mide pantallas y
-- `prueba-sql.sh` arma su propia base de prueba con las tablas que necesita.
-- Un hueco de esquema no se ve desde ninguno de los dos.
--
-- Y por qué no se veía EN LA APP: todas esas escrituras van con `void` o
-- dentro de un try/catch silencioso. El cliente toca «Guardar mi punto de
-- partida», lee que quedó guardado, y el dato no sale del teléfono.
--
-- Todo es `if not exists`: se puede correr más de una vez sin romper nada.

-- ── 1 · SU NÚMERO ──────────────────────────────────────────────────────────
-- El precio, los consultantes y las horas que carga el día 1, y su hora real
-- neta. Lo lee también la preventa del día 24. Hoy vivía solo en el navegador.
create table if not exists public.el_numero (
  usuario_id        uuid primary key references auth.users(id) on delete cascade,
  precio_sesion     numeric      not null default 0,
  pacientes_semana  numeric      not null default 0,
  horas_semana      numeric      not null default 0,
  phr               numeric      not null default 0,
  precio_nuevo      numeric,
  fecha_cambio      date,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

alter table public.el_numero enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='el_numero'
                   and policyname='el_numero_es_suyo') then
    create policy "el_numero_es_suyo" on public.el_numero
      for all to authenticated
      using (auth.uid() = usuario_id)
      with check (auth.uid() = usuario_id);
  end if;

  -- Y el equipo lo ve, que es lo que mira el Admin en la ficha del cliente.
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='el_numero'
                   and policyname='el_numero_lo_ve_el_equipo') then
    create policy "el_numero_lo_ve_el_equipo" on public.el_numero
      for select to authenticated
      using (exists (select 1 from public.profiles p
                      where p.id = auth.uid()
                        and (p.rol = 'admin' or p.admin_rol in ('owner','manager','staff'))));
  end if;
end $$;


-- ── 2 · LOS HITOS DE CINTURÓN ──────────────────────────────────────────────
-- La evidencia de cada grado: quién lo aprobó, cuándo y con qué comentario.
-- Sin esto, un cinturón ganado no deja rastro.
create table if not exists public.hitos_cinturon (
  id                 uuid primary key default gen_random_uuid(),
  usuario_id         uuid         not null references auth.users(id) on delete cascade,
  cinturon           text         not null,
  fase               int,
  tipo_verificacion  text,
  estado             text         not null default 'aprobado',
  agente             text,
  feedback_agente    text,
  aprobado_at        timestamptz,
  created_at         timestamptz  not null default now(),
  -- El código inserta sin mirar si ya estaba: un mismo grado no se gana dos
  -- veces, y el comentario del propio insert dice «duplicados: se ignoran».
  unique (usuario_id, cinturon)
);

alter table public.hitos_cinturon enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='hitos_cinturon'
                   and policyname='hitos_cinturon_son_suyos') then
    create policy "hitos_cinturon_son_suyos" on public.hitos_cinturon
      for all to authenticated
      using (auth.uid() = usuario_id)
      with check (auth.uid() = usuario_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='hitos_cinturon'
                   and policyname='hitos_cinturon_los_ve_el_equipo') then
    create policy "hitos_cinturon_los_ve_el_equipo" on public.hitos_cinturon
      for select to authenticated
      using (exists (select 1 from public.profiles p
                      where p.id = auth.uid()
                        and (p.rol = 'admin' or p.admin_rol in ('owner','manager','staff'))));
  end if;
end $$;


-- ── 3 · EL RESUMEN DE LA SEMANA ────────────────────────────────────────────
-- Lo que el Mentor escribe sobre el diario de la semana.
create table if not exists public.diario_resumen (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid         not null references auth.users(id) on delete cascade,
  semana_inicio  date         not null,
  resumen_texto  text         not null default '',
  created_at     timestamptz  not null default now(),
  unique (user_id, semana_inicio)
);

alter table public.diario_resumen enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='public' and tablename='diario_resumen'
                   and policyname='diario_resumen_es_suyo') then
    create policy "diario_resumen_es_suyo" on public.diario_resumen
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;


-- ── 4 · LAS CINCO COLUMNAS DE `profiles` ───────────────────────────────────
--
-- Las dos primeras son las que más duelen: PostgREST rechaza el UPDATE ENTERO
-- si una columna del payload no está en el schema cache (PGRST204). El wizard
-- de bienvenida manda `avatar_tipo`, `diagnostico`, `adn_nicho` y
-- `adn_diagnostico_capa` en una sola llamada, así que faltando las dos
-- primeras tampoco se guardaban las otras dos, que sí existen. Y el Mentor lee
-- `avatar_tipo` para saber a quién le habla: sin dato, cae al avatar 'A' por
-- defecto desde el primer mensaje.
alter table public.profiles add column if not exists avatar_tipo  text;
alter table public.profiles add column if not exists diagnostico  jsonb;

-- La medición de entrada del día 1 y la de salida del día 83. Son los seis
-- números con los que el cliente se compara a sí mismo al final: el día 90 le
-- muestra el antes y el después, y el «antes» no se estaba guardando.
alter table public.profiles add column if not exists adn_medicion_entrada jsonb;
alter table public.profiles add column if not exists adn_medicion_salida  jsonb;

-- El grado visible en su ficha.
alter table public.profiles add column if not exists cinturon text;

comment on column public.profiles.avatar_tipo is
  'Qué avatar es, del diagnóstico del wizard. Lo lee el Mentor para saber a quién le habla.';
comment on column public.profiles.adn_medicion_entrada is
  'Los seis números del día 1 (src/lib/medicion.ts). El «antes» de la Foto del Día 90.';
comment on column public.profiles.adn_medicion_salida is
  'Los mismos seis números el día 83. El «después».';


-- ── 5 · LA EVIDENCIA DEL CLIENTE, QUE NO PODÍA SUBIR ───────────────────────
--
-- El día 1 pide dos evidencias con foto: «Foto del búnker» y «Pacto
-- publicado». Van al bucket `task-attachments`, bajo
-- `evidencias/{uid}/{meta_codigo}/`.
--
-- Ese bucket tenía sus tres políticas escritas para el EQUIPO
-- (20260515_admin_tareas_comments_attachments.sql): exigen rol admin. Un
-- cliente no podía subir, ni listar lo suyo, ni verlo. Y la pantalla le decía
-- que había quedado guardado.
--
-- Estas tres son solo para SU carpeta. La ruta empieza con `evidencias/`, así
-- que el uid es el SEGUNDO segmento, no el primero.
do $$
begin
  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_sube') then
    create policy "evidencia_del_cliente_sube"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_lee') then
    create policy "evidencia_del_cliente_lee"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );
  end if;

  -- Puede borrar lo suyo mientras la jornada no cerró: subir la foto
  -- equivocada el día 1 no puede ser definitivo.
  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_borra') then
    create policy "evidencia_del_cliente_borra"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );
  end if;
end $$;
