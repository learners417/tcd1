-- ═══════════════════════════════════════════════════════════════════════════
-- Coach IA Conversations · persistencia del clon digital de Javo.
-- Una fila por sanador (UNIQUE user_id). messages es el array completo de la
-- conversación · summary es el resumen rotativo que se regenera cada 20
-- mensajes nuevos · last_summary_at_msg_count guarda el largo de messages
-- cuando se generó el último summary.
--
-- Migración desde localStorage `tcd_coach_messages_v2` se hace en el cliente
-- al primer load: si no existe row, se inserta con el array de localStorage,
-- luego se borra el localStorage.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coach_conversations (
  id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  messages                   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  summary                    TEXT,
  last_summary_at_msg_count  INT         NOT NULL DEFAULT 0,
  last_message_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_conversations_user
  ON coach_conversations(user_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_conv_own_read" ON coach_conversations;
CREATE POLICY "coach_conv_own_read" ON coach_conversations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "coach_conv_own_insert" ON coach_conversations;
CREATE POLICY "coach_conv_own_insert" ON coach_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "coach_conv_own_update" ON coach_conversations;
CREATE POLICY "coach_conv_own_update" ON coach_conversations
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "coach_conv_own_delete" ON coach_conversations;
CREATE POLICY "coach_conv_own_delete" ON coach_conversations
  FOR DELETE USING (user_id = auth.uid());
