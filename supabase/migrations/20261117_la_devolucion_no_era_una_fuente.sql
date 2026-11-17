-- ════════════════════════════════════════════════════════════════════
--  EL CRÉDITO QUE SE COBRÓ Y NO SE DEVOLVÍA NUNCA
--
--  El guardián cobra el crédito ANTES de llamar al modelo —es la única
--  forma de que dos pedidos a la vez no gasten el mismo saldo—. Si
--  después la cadena falla, `devolver_credito` lo repone. Eso no
--  funcionaba, y fallaba en silencio.
--
--  `credit_transactions.source` es una lista cerrada: la migración
--  20260513 la declara con un CHECK de siete valores, y
--  `src/lib/credits.ts` escribe la misma lista en TypeScript.
--  «devolucion» no está en ninguna de las dos. Así que el insert de
--  `devolver_credito` rompía el CHECK, y como el insert y el
--  `update user_credits` van en la MISMA función, el rechazo se llevaba
--  también la devolución del saldo: el cliente pagaba por aire.
--
--  No se veía por dos motivos, los dos medidos el 17 de noviembre:
--    · el andamiaje de `scripts/prueba-sql.sh` declaraba
--      `credit_transactions` a mano y SIN el CHECK, así que la función
--      pasaba la prueba de «las 17 funciones se ejecutan»;
--    · del lado de la app, `devolverCreditoServer` solo hace
--      `console.warn` con el error.
--
--  El valor correcto ya existe y ya se usa en el otro camino de
--  devolución (`api/_lib/credits-server.ts`, el ajuste del admin):
--  `refund`. No se afloja el CHECK: se usa la palabra que el sistema
--  de créditos ya tiene.
--
--  Correr en el editor SQL de Supabase. Es idempotente.
-- ════════════════════════════════════════════════════════════════════

create or replace function devolver_credito(
  p_user_id uuid,
  p_motivo text
) returns void
language plpgsql security definer as $$
begin
  -- Vuelve al saldo comprado (topup), no a la cuota mensual: la cuota se
  -- repone sola el día 1 y devolverle ahí sería regalarle un crédito extra
  -- que el mes que viene se pisa igual.
  update user_credits
     set topup_balance = coalesce(topup_balance, 0) + 1
   where user_id = p_user_id;

  -- `refund` y no `devolucion`: la lista de `source` es cerrada.
  insert into credit_transactions (user_id, delta, source, reason)
  values (p_user_id, 1, 'refund', p_motivo);
end $$;
