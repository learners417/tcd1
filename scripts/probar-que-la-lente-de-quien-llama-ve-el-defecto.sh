#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  EL ARNÉS: ¿LA LENTE DE «QUIÉN LLAMA» VE EL DEFECTO?                       ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# Una lente verde no dice nada hasta que se le pone el defecto. Este repo lo
# aprendió nueve veces entre el 13 y el 17 de noviembre: la lente del `//`, la
# de la puerta, la del punto y coma, la de la RLS —todas verdes, todas ciegas—.
# Así que a cada afirmación de `prueba-las-funciones-preguntan-quien-llama.sh`
# se le reintroduce SU defecto a propósito y se comprueba que se pone roja.
#
# Y hay una trampa que ya se comió el arnés de la RLS el 17 de noviembre: si
# el defecto no LANDEA —el `sed` no encontró su texto—, la lente sale verde y
# el arnés canta «aprobada» por un ejercicio que nunca ocurrió. Por eso cada
# defecto comprueba primero que cambió algo.
#
#   bash scripts/probar-que-la-lente-de-quien-llama-ve-el-defecto.sh

set -u
cd "$(dirname "$0")/.." || exit 1
RAIZ=$(pwd)
LENTE=scripts/prueba-las-funciones-preguntan-quien-llama.sh

PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -1)
if [ -z "$PGBIN" ]; then
  echo "sin PostgreSQL local: no se puede probar acá"
  exit 0
fi

fallas=0
ok()  { if [ "$1" = 0 ]; then echo "  ✓ $2"; else echo "  ✗ $2"; fallas=$((fallas + 1)); fi; }

# ── Con el repo sano, la lente tiene que estar VERDE ───────────────────────
bash "$LENTE" > /tmp/lente-sana.txt 2>&1
ok "$?" "con el repo sano, la lente da verde"

# ── Y cada defecto, uno por uno, en una copia ──────────────────────────────
#
# defecto <nombre> <archivo> <python-de-reemplazo> — el python recibe el texto
# en `t` y devuelve `t`; si no cambia nada, el arnés lo canta y no le cree a
# la medición.
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
echo "══ los diez defectos, puestos a propósito ══"

defecto "1 · la plata: devolver_credito vuelve a estar abierta a PUBLIC" \
  "sala-de-mando.sql" \
  "t = t.replace('revoke all on function public.devolver_credito(uuid, text) from public;', '-- defecto a proposito')" \
  "saldo comprado de otro"

defecto "2 · la semana de otro cliente: carga_de_semana sin su predicado" \
  "sala-de-mando.sql" \
  "t = t.replace('  where public.el_que_llama_es_del_equipo()\n    and c.cliente_id = p_cliente', '  where c.cliente_id = p_cliente')" \
  "carga_de_semana tampoco"

defecto "3 · escribir sobre lo de otro: guardar_campo sin su guarda" \
  "sala-de-mando.sql" \
  "t = t.replace(\"  perform public.solo_el_equipo('los números de la semana de un cliente');\n\", '')" \
  "sigue siendo el del equipo"

defecto "4 · la fila de créditos de otro: ensure_user_credits_row sin guarda" \
  "supabase/migrations/20261118_las_funciones_no_preguntaban_quien_llama.sql" \
  "t = t.replace(\"    raise exception 'Cada uno ve su propia fila de créditos';\", 'null;')" \
  "fila de créditos de otro"

defecto "5 · gastar el crédito de otro: consume_credit concedida otra vez" \
  "supabase/migrations/20261118_las_funciones_no_preguntaban_quien_llama.sql" \
  "t = t.replace('revoke all on function public.consume_credit(uuid, jsonb) from authenticated;', 'grant execute on function public.consume_credit(uuid, jsonb) to authenticated;')" \
  "crédito de otro"

defecto "6 · la poda del registro de fallas, sin su guarda (solo la ve el catálogo)" \
  "supabase/migrations/20261118_las_funciones_no_preguntaban_quien_llama.sql" \
  "t = t.replace(\"  perform public.solo_el_equipo('podar el registro de fallas');\n\", '')" \
  "no pregunta: podar_fallas_viejas"

defecto "7 · el portazo al service_role: la guarda vuelve a current_user" \
  "sala-de-mando.sql" \
  "t = t.replace(\"select coalesce(auth.role(), '') = 'service_role'\", \"select current_user = 'service_role'\")" \
  "service_role"

defecto "8 · el PERDÓN inflado con una función que no existe" \
  "$LENTE" \
  "t = t.replace(\"('es_del_equipo','solo dice si alguien es del equipo'),\", \"('es_del_equipo','solo dice si alguien es del equipo'),\n  ('una_que_no_existe','para ganar verde'),\")" \
  "perdón sin función"

defecto "9 · una SECURITY DEFINER nueva, sin guarda, agregada al final" \
  "sala-de-mando.sql" \
  "t = t + '\ncreate or replace function public.la_nueva_sin_guarda(p_cliente uuid)\nreturns table (campo text)\nlanguage sql security definer as \$x\$\n  select c.campo from carga_semanal c where c.cliente_id = p_cliente;\n\$x\$;\n'" \
  "no pregunta: la_nueva_sin_guarda"

defecto "10 · el portazo al propio cliente: respuestas_de solo para el equipo" \
  "sala-de-mando.sql" \
  "t = t.replace('  where (p_cliente = auth.uid() or public.el_que_llama_es_del_equipo())\n    and r.cliente_id = p_cliente;', '  where public.el_que_llama_es_del_equipo()\n    and r.cliente_id = p_cliente;')" \
  "PROPIAS"

echo ""
if [ "$fallas" -eq 0 ]; then
  echo "SIN FALLAS — la lente ve sus diez defectos"
else
  echo "FALLAS: $fallas"
fi
exit "$fallas"
