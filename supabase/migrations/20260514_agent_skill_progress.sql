-- ═══════════════════════════════════════════════════════════════════════════
-- Agent Skill Progress · tracking de niveles, prácticas y scores por
-- entrenador (Caro, Mateo, Vera, Sofi, Ramiro, Lucas, Bruno).
--
-- Una fila por (user_id, agent_id). El entrenador emite "SCORE: X" al final
-- de cada práctica · el cliente parsea y hace upsert.
--
-- Niveles 1-4: Principiante → Practicante → Competente → Autónomo.
-- Thresholds por entrenador viven en el código (level_thresholds en cada
-- archivo TS de agente) · acá solo guardamos el estado calculado.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_skill_progress (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id         TEXT        NOT NULL,
  practice_count   INT         NOT NULL DEFAULT 0,
  scores           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  current_level    INT         NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 4),
  last_practice_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_skill_progress_user
  ON agent_skill_progress(user_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE agent_skill_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skill_progress_own_read" ON agent_skill_progress;
CREATE POLICY "skill_progress_own_read" ON agent_skill_progress
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "skill_progress_own_insert" ON agent_skill_progress;
CREATE POLICY "skill_progress_own_insert" ON agent_skill_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "skill_progress_own_update" ON agent_skill_progress;
CREATE POLICY "skill_progress_own_update" ON agent_skill_progress
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "skill_progress_own_delete" ON agent_skill_progress;
CREATE POLICY "skill_progress_own_delete" ON agent_skill_progress
  FOR DELETE USING (user_id = auth.uid());
