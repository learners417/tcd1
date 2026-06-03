-- ============================================================================
-- MIGRACIÓN: Actividad de usuario — "Días conectados esta semana"
-- Registra UNA fila por (usuario, día) la primera vez que abre la app ese día.
-- Idempotente: el upsert con onConflict no duplica ni reescribe nada.
-- Aditiva: tabla NUEVA, no toca ninguna estructura ni dato existente.
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha      DATE NOT NULL,                          -- fecha local del usuario (YYYY-MM-DD)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, fecha)                        -- una sola fila por usuario y día
);

-- La PK (user_id, fecha) ya indexa la consulta semanal (filtro por user_id + rango de fecha).

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- El usuario lee/inserta solo su propia actividad.
CREATE POLICY "user_activity_user_all" ON user_activity
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los admins pueden leer la actividad de todos (para métricas internas).
CREATE POLICY "user_activity_admin_select" ON user_activity
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
