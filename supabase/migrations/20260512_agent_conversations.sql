-- ═══════════════════════════════════════════════════════════════════════════
-- Agent Conversations · persistencia de los chats con los 6 agentes IA TCD.
-- Una fila por (user_id, agent_id) · messages es el array completo (JSONB).
-- Se UPSERTea después de cada turno y se DELETEa cuando el sanador da
-- "Empezar de nuevo".
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_conversations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id        TEXT        NOT NULL,
  messages        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_user
  ON agent_conversations(user_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

-- El sanador solo lee/escribe sus propias conversaciones.
DROP POLICY IF EXISTS "agent_conv_own_read" ON agent_conversations;
CREATE POLICY "agent_conv_own_read" ON agent_conversations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "agent_conv_own_insert" ON agent_conversations;
CREATE POLICY "agent_conv_own_insert" ON agent_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "agent_conv_own_update" ON agent_conversations;
CREATE POLICY "agent_conv_own_update" ON agent_conversations
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "agent_conv_own_delete" ON agent_conversations;
CREATE POLICY "agent_conv_own_delete" ON agent_conversations
  FOR DELETE USING (user_id = auth.uid());
