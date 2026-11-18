#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  EL ARNÉS: ¿LA LENTE DE LOS ARCHIVOS VE EL DEFECTO?                        ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# Una lente verde no dice nada hasta que se le pone el defecto: este repo lo
# aprendió once veces entre el 13 y el 18 de noviembre. A cada afirmación de
# `prueba-los-archivos-son-de-su-dueno.sh` se le reintroduce SU defecto a
# propósito —los seis que estaban vivos esta mañana, y los que podrían entrar
# mañana— y se comprueba que se pone roja.
#
# Y la trampa que ya se comió el arnés de la RLS el 17 de noviembre: si el
# defecto no LANDEA, la lente sale verde y el arnés canta «aprobada» por un
# ejercicio que nunca ocurrió. Por eso cada defecto comprueba que cambió algo.
#
#   bash scripts/probar-que-la-lente-de-los-archivos-ve-el-defecto.sh

set -u
cd "$(dirname "$0")/.." || exit 1
RAIZ=$(pwd)
LENTE=scripts/prueba-los-archivos-son-de-su-dueno.sh
MIG=supabase/migrations/20261118_los_archivos_eran_de_cualquiera.sql

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -1)
if [ -z "$PGBIN" ]; then
  echo "sin PostgreSQL local: no se puede probar acá"
  exit 0
fi

fallas=0
ok() { if [ "$1" = 0 ]; then echo "  ✓ $2"; else echo "  ✗ $2"; fallas=$((fallas + 1)); fi; }

bash "$LENTE" > /tmp/lente-archivos-sana.txt 2>&1
ok "$?" "con el repo sano, la lente da verde"

defecto() {
  local nombre="$1" archivo="$2" receta="$3" espera="${4:-}"
  local TMP; TMP=$(mktemp -d)
  tar -c --exclude=node_modules --exclude=.git --exclude=dist -C "$RAIZ" . | tar -x -C "$TMP"
  if ! python3 - "$TMP/$archivo" "$receta" << 'PY'
import sys
ruta, receta = sys.argv[1], sys.argv[2]
t = open(ruta, encoding='utf-8').read()
g = {'t': t}
exec(receta, g)
if g['t'] == t:
    sys.exit(7)
open(ruta, 'w', encoding='utf-8').write(g['t'])
PY
  then
    echo "  ✗ $nombre — EL DEFECTO NO LANDEÓ en $archivo (la lente no se ejercitó)"
    fallas=$((fallas + 1)); rm -rf "$TMP"; return
  fi
  local salida; salida=$(cd "$TMP" && bash "$LENTE" 2>&1); local rc=$?
  if [ "$rc" = 0 ]; then
    echo "  ✗ $nombre — la lente dio VERDE con el defecto puesto"
    fallas=$((fallas + 1))
  elif [ -n "$espera" ] && ! echo "$salida" | grep -q "$espera"; then
    echo "  ✗ $nombre — se puso roja, pero no por lo que tenía que: falta «$espera»"
    echo "$salida" | grep '✗' | head -3 | sed 's/^/        /'
    fallas=$((fallas + 1))
  else
    echo "  ✓ $nombre"
  fi
  rm -rf "$TMP"
}

echo ""
echo "══ los defectos, puestos a propósito ══"

# ── Los seis que estaban vivos el 18 de noviembre a la mañana ──────────────

defecto "1 · el chat de soporte se lista SIN SESIÓN (la política sin su rol)" \
  "$MIG" \
  "t = t.replace('''drop policy if exists \"mensajes_archivos_read\" on storage.objects;
create policy \"mensajes_archivos_read\"
  on storage.objects for select to authenticated''', '''drop policy if exists \"mensajes_archivos_read\" on storage.objects;
create policy \"mensajes_archivos_read\"
  on storage.objects for select''').replace('''    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )
  );

-- ── 2 · Los creativos''', '''  );

-- ── 2 · Los creativos''')" \
  "sin sesión no ve ni un archivo de mensajes-archivos"

defecto "2 · los creativos se listan SIN SESIÓN" \
  "$MIG" \
  "t = t.replace('''create policy \"creativos_assets_select\"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'creativos-assets'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )
  );''', '''create policy \"creativos_assets_select\"
  on storage.objects for select
  using (bucket_id = 'creativos-assets');''')" \
  "sin sesión no ve ni un archivo de creativos-assets"

defecto "3 · un cliente lee el chat de soporte de otro (sin el predicado del dueño)" \
  "$MIG" \
  "t = t.replace('''    bucket_id = 'mensajes-archivos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )''', '''    bucket_id = 'mensajes-archivos\'''')" \
  "el cliente A ve su archivo de mensajes"

defecto "4 · un cliente sube a la carpeta de otro (la insert de creativos, como estaba)" \
  "$MIG" \
  "t = t.replace('''create policy \"creativos_assets_insert\"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'creativos-assets'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )
  );''', '''create policy \"creativos_assets_insert\"
  on storage.objects for insert
  with check (bucket_id = 'creativos-assets' and auth.role() = 'authenticated');''')" \
  "un cliente no sube a la carpeta de otro en creativos-assets"

defecto "5 · el bucket privado deja de ser privado" \
  "supabase/migrations/20260515_admin_tareas_comments_attachments.sql" \
  "t = t.replace(\"VALUES ('task-attachments', 'task-attachments', false)\", \"VALUES ('task-attachments', 'task-attachments', true)\")" \
  "task-attachments es privado"

defecto "6 · la evidencia del cliente, abierta a cualquier carpeta" \
  "poner-al-dia-la-base.sql" \
  "t = t.replace('''        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_lee') then''', '''        and (storage.foldername(name))[1] = 'evidencias'
      );
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname='storage' and tablename='objects'
                   and policyname='evidencia_del_cliente_lee') then''')" \
  "un cliente no sube a la evidencia de otro"

# ── Y los que podrían entrar mañana, por el otro lado: que la lente no se ──
#    quede verde cuando lo que se rompe es lo que la app NECESITA hacer.

defecto "7 · el portazo al cliente: su evidencia solo la lee el equipo" \
  "poner-al-dia-la-base.sql" \
  "t = t.replace('''    create policy \"evidencia_del_cliente_lee\"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'task-attachments'
        and (storage.foldername(name))[1] = 'evidencias'
        and auth.uid()::text = (storage.foldername(name))[2]
      );''', '''    create policy \"evidencia_del_cliente_lee\"
      on storage.objects for select to authenticated
      using (bucket_id = 'task-attachments' and public.el_que_llama_es_del_equipo());''')" \
  "el cliente A ve su evidencia"

defecto "8 · el portazo al equipo: el Admin ya no guarda el creativo de un cliente" \
  "$MIG" \
  "t = t.replace('''  with check (
    bucket_id = 'creativos-assets'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.el_que_llama_es_del_equipo()
    )
  );''', '''  with check (
    bucket_id = 'creativos-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );''')" \
  "el equipo guarda un creativo EN la carpeta de un cliente"

defecto "9 · el equipo deja de leer los adjuntos de sus tareas" \
  "$MIG" \
  "t = t.replace('''create policy \"task_attachments_read\"
  on storage.objects for select to authenticated
  using (bucket_id = 'task-attachments' and public.el_que_llama_es_del_equipo());''', '''create policy \"task_attachments_read\"
  on storage.objects for select to authenticated
  using (bucket_id = 'task-attachments' and false);''')" \
  "el equipo lee las tres carpetas de task-attachments"

defecto "10 · la RLS de storage, apagada en el andamiaje de la propia lente" \
  "$LENTE" \
  "t = t.replace('alter table storage.objects enable row level security;', '-- defecto a proposito')" \
  "sin sesión no ve ni un archivo"

echo ""
if [ "$fallas" -eq 0 ]; then
  echo "SIN FALLAS — la lente ve sus diez defectos"
else
  echo "$fallas DEFECTO(S) QUE LA LENTE NO VE"
fi
exit $([ "$fallas" -eq 0 ] && echo 0 || echo 1)
