#!/usr/bin/env bash
# ╔════════════════════════════════════════════════════════════════════════════╗
# ║  VOLVER ATRÁS — con clientes adentro                                       ║
# ╚════════════════════════════════════════════════════════════════════════════╝
#
# Esto existe para que, el día que algo salga mal con clientes usando la app,
# nadie tenga que pensar bajo presión. Se lee entero en un minuto.
#
# ─── PRIMERO: LA FORMA RÁPIDA, Y NO ES ESTE ARCHIVO ────────────────────────
#
# Vercel guarda cada despliegue. Volver al anterior son tres clics y tarda
# SEGUNDOS, porque no reconstruye nada:
#
#     vercel.com → el proyecto → Deployments → el de antes → ⋯ → Promote to
#     Production
#
# Eso es lo primero que hay que hacer si la app está rota en vivo. Deja el
# código del repositorio como está —no revierte nada— así que después, con
# tiempo, se arregla de verdad y se vuelve a subir.
#
# ─── ESTE ARCHIVO: DESHACER EN EL REPOSITORIO ──────────────────────────────
#
# Para cuando ya se sabe QUÉ commit rompió y se lo quiere sacar de `main`.
# Tarda lo que tarda el build de Vercel, unos dos minutos.
#
# Usa `git revert`, que agrega un commit nuevo que deshace al anterior. NUNCA
# `reset --hard` ni `push --force`: `main` es la rama desplegada, y reescribir
# su historia con clientes adentro deja a Vercel y al repositorio contando
# historias distintas, que es un problema peor que el original.
#
#     bash scripts/volver-atras.sh              → muestra qué haría
#     bash scripts/volver-atras.sh <commit>     → deshace ese commit
#
# ─── LO QUE NO VUELVE ATRÁS: LA BASE ───────────────────────────────────────
#
# Revertir el código NO deshace el SQL que ya corrió, y está bien que sea así.
# Las migraciones de esta casa solo AGREGAN —`create table if not exists`,
# `add column if not exists`— así que una versión vieja del código convive sin
# problema con una base más nueva: no ve las columnas que no conoce.
#
# Al revés sí duele: si una migración nueva NO corrió y el código sí subió, el
# código busca algo que no está. Por eso el SQL va SIEMPRE antes que el push.

set -u
cd "$(dirname "$0")/.." || exit 1

echo "══ dónde estamos ══"
git log --oneline -5
echo ""

if [ $# -eq 0 ]; then
  cat <<'FIN'
══ cómo se usa ══

  1 · Si la app está rota AHORA y hay clientes adentro:
      NO uses este archivo. Ve a Vercel → Deployments → el despliegue
      anterior → Promote to Production. Son segundos y no reconstruye nada.

  2 · Cuando ya sabes qué commit rompió y lo quieres sacar de main:
      bash scripts/volver-atras.sh <commit>

  3 · Antes de volver a subir el arreglo:
      python3 auditoria.py     (la batería entera tiene que estar en verde)

FIN
  exit 0
fi

OBJETIVO="$1"

if ! git cat-file -e "${OBJETIVO}^{commit}" 2>/dev/null; then
  echo "✗ «$OBJETIVO» no es un commit de este repositorio."
  exit 1
fi

echo "══ lo que se va a deshacer ══"
git log --oneline -1 "$OBJETIVO"
echo ""
echo "   archivos que toca:"
git show --stat --oneline "$OBJETIVO" | tail -n +2 | sed 's/^/   /'
echo ""

# Una migración revertida es la trampa de este archivo: el SQL ya corrió en la
# base de Javo y sacar el .sql del repositorio no lo deshace. Peor: deja el
# repositorio diciendo que esa tabla no existe cuando sí existe.
# `--name-only` y no `--stat`: el stat ABREVIA las rutas largas —muestra
# «.../20261105_donde_cae….sql»— así que el prefijo `supabase/migrations/`
# no aparece y este aviso no saltaba nunca. Probado con el commit que SÍ
# trae SQL, que era la única forma de verlo.
if git show --name-only --format= "$OBJETIVO" | grep -q '^supabase/migrations/'; then
  echo "   ⚠ ESTE COMMIT TRAE SQL."
  echo "     Sacarlo del repositorio NO deshace lo que ya corrió en la base."
  echo "     Si el problema es el SQL, se arregla con SQL nuevo, no revirtiendo."
  echo ""
fi

printf '   ¿Deshacer este commit en main? (escribe SI): '
read -r RESPUESTA
[ "$RESPUESTA" = "SI" ] || { echo "   — no se hizo nada."; exit 0; }

git revert --no-edit "$OBJETIVO" || {
  echo ""
  echo "✗ el revert chocó. Los archivos en conflicto están marcados."
  echo "  Resuélvelos, 'git add' y 'git revert --continue'."
  echo "  Para abandonar: git revert --abort"
  exit 1
}

echo ""
echo "══ hecho en local. Falta subirlo ══"
git log --oneline -2
echo ""
echo "   Antes de empujar, la batería:   python3 auditoria.py"
echo "   Y después:                      git push origin main"
echo ""
echo "   (No se empuja solo a propósito: subir a main despliega a los"
echo "    clientes, y eso lo decide una persona.)"
