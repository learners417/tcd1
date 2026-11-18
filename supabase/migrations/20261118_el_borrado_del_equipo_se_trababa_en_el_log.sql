-- ═══════════════════════════════════════════════════════════════════════════
-- EL BORRADO DEL EQUIPO SE TRABABA EN EL LOG DEL ADN
--
-- Medido el 18 de noviembre, ejecutando contra un PostgreSQL con las 82
-- migraciones puestas:
--
--   delete from auth.users where id = <el manager>;
--   ERROR:  update or delete on table "users" violates foreign key constraint
--           "adn_audit_log_edited_by_fkey" on table "adn_audit_log"
--
-- `admin_delete_team_member` y `admin_delete_cliente` nacieron el 19 de abril
-- y limpian a mano las dos tablas que entonces no tenían CASCADE —`mensajes`
-- y `admin_notes`—. `adn_audit_log` nació el 29 de abril, diez días después,
-- con `edited_by` apuntando a `auth.users(id)` SIN acción de borrado: nadie
-- volvió a esa lista. O sea que justo los miembros del equipo que SÍ
-- trabajaron —los que editaron el ADN de algún cliente— eran los únicos que
-- no se podían borrar. Siete meses así.
--
-- EL ARREGLO, Y POR QUÉ ESTE Y NO OTRO
--
-- No se limpia a mano en la función: eso borraría el historial del ADN del
-- cliente, que no tiene nada que ver con que un miembro del equipo se vaya.
-- Se usa la convención que el propio repo ya tiene para las columnas de
-- «quién lo hizo»: ON DELETE SET NULL.
--
--   admin_tareas_adjuntos.autor_id        → SET NULL
--   evidencia_veredictos.decidido_por     → SET NULL
--   transcripciones_recibidas.revisada_por→ SET NULL
--   sesiones.quien_la_cargo               → SET NULL
--   fallas_vistas.usuario_id              → SET NULL
--
-- La fila del historial queda; lo que se pierde es el nombre de una cuenta
-- que ya no existe. La pantalla del ADN ya lo resuelve sola desde antes de
-- esto —`{ultima.editor?.nombre ?? 'equipo'}`—, así que un editor borrado se
-- lee «Editado por equipo» y no se rompe nada.
--
-- `target_user_id` NO se toca: ya tiene CASCADE y está bien, porque el
-- historial del ADN de un cliente borrado no le sirve a nadie.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.adn_audit_log ALTER COLUMN edited_by DROP NOT NULL;

ALTER TABLE public.adn_audit_log
  DROP CONSTRAINT IF EXISTS adn_audit_log_edited_by_fkey;

ALTER TABLE public.adn_audit_log
  ADD CONSTRAINT adn_audit_log_edited_by_fkey
  FOREIGN KEY (edited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.adn_audit_log.edited_by
  IS 'Quién editó. Queda en NULL si esa cuenta se borra: la pantalla lo lee «equipo». Nunca bloquea el borrado del usuario.';
