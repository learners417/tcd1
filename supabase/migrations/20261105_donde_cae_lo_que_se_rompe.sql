-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  LA APP PROMETÍA UN AVISO QUE NO SALÍA DE NINGÚN LADO                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- 5 de noviembre, revisando qué puede pasarle a un cliente en vivo.
--
-- Cuando una pantalla se traba, el cliente lee esto, en `src/main.tsx`:
--
--     Esta pantalla se trabó
--     Ya nos llegó el aviso y lo estamos mirando.
--
-- El aviso sale por Sentry. Y Sentry arranca solo si existe `VITE_SENTRY_DSN`
-- (`src/lib/sentry.ts` línea 22: `if (!DSN) return`). En `.env.example` esa
-- variable está VACÍA. O sea: si no está cargada en Vercel, no se inicializa
-- nada, no sale ningún aviso, y la frase es mentira — el cliente se queda
-- esperando una respuesta que nadie pidió, y del otro lado nadie se entera.
--
-- Es el peor momento posible para no enterarse: con clientes reales adentro,
-- lo que no se ve no se arregla, y el que se traba no vuelve a abrir la app.
--
-- Esta tabla es la red de abajo. No reemplaza a Sentry —si el DSN está, los
-- dos reciben— pero no depende de que nadie configure nada: la app escribe
-- acá con la misma conexión que ya usa para todo lo demás.
--
-- ─── POR QUÉ UN CLIENTE PUEDE ESCRIBIR Y NO PUEDE LEER ───────────────────
--
-- Escribir: el que se rompió es el único que tiene el error. Si no puede
-- dejarlo, no hay nada que mirar.
--
-- Leer: lo que cae acá es la pila de llamadas y la URL del momento — de
-- CUALQUIER cliente. Un cliente no tiene por qué ver lo que le pasó a otro.
-- La lectura es del equipo, con la misma `es_del_equipo` que ya decide quién
-- ve las fichas (20261103).
--
-- ─── LO QUE NO GUARDA ────────────────────────────────────────────────────
--
-- Nada que el cliente haya escrito. Ni el texto de su diario, ni su ADN, ni
-- lo que le dijo al Mentor. Solo dónde se rompió y qué dijo el navegador:
-- pantalla, mensaje, pila, el navegador y la dirección. Lo demás no hace
-- falta para arreglarlo, y guardarlo sería guardar su trabajo sin pedírselo.

create table if not exists public.fallas_vistas (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid references auth.users(id) on delete set null,
  pantalla    text,
  mensaje     text not null,
  pila        text,
  navegador   text,
  direccion   text,
  -- `rotura` = la pantalla entera se cayó (el ErrorBoundary de main.tsx).
  -- `suelto` = algo falló sin tumbar la pantalla (onerror / promesa colgada).
  clase       text not null default 'rotura',
  creado_en   timestamptz not null default now()
);

-- Para abrir el Admin en lo último que pasó, que es lo que se mira primero.
create index if not exists fallas_vistas_creado_en_idx
  on public.fallas_vistas (creado_en desc);

alter table public.fallas_vistas enable row level security;

drop policy if exists "cualquiera deja su falla" on public.fallas_vistas;
create policy "cualquiera deja su falla" on public.fallas_vistas
  for insert to anon, authenticated
  with check (true);

-- `anon` también escribe: una pantalla se puede romper ANTES de que el
-- cliente entre —en el alta, en la bienvenida, al volver de un pago— y esos
-- son justo los momentos en los que se pierde a alguien para siempre.

drop policy if exists "el equipo lee las fallas" on public.fallas_vistas;
create policy "el equipo lee las fallas" on public.fallas_vistas
  for select to authenticated
  using (public.es_del_equipo(auth.uid()));

-- ─── LO QUE SE BORRA SOLO ────────────────────────────────────────────────
--
-- Una tabla de errores sin poda se come la base: un bucle de render puede
-- escribir miles de filas en un minuto. Esto se llama desde el Admin cuando
-- se abre el panel, y deja los últimos treinta días.

create or replace function public.podar_fallas_viejas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  delete from public.fallas_vistas where creado_en < now() - interval '30 days';
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.podar_fallas_viejas() from public;
grant execute on function public.podar_fallas_viejas() to authenticated;
