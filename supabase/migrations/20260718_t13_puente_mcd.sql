-- ============================================================================
-- T13 · EL PUENTE MCD — tabla compartida de artefactos del Camino
-- ----------------------------------------------------------------------------
-- La casa se amuebla sola: TCD escribe (upsert) los artefactos del fundador
-- —protocolo, paciente ideal, catálogo— y Mi Clínica Digital los LEE. Ambas
-- apps corren sobre el MISMO proyecto Supabase (misma identidad), así que es
-- el mismo user en las dos: RLS del dueño alcanza. Aditivo e idempotente.
--
-- REQUISITO: MCD debe apuntar a este mismo proyecto Supabase (misma
-- NEXT_PUBLIC_SUPABASE_URL / ANON_KEY que TCD). La app corre sin la tabla:
-- MCD muestra "aún no llegó de tu Camino" y no rompe.
--
-- Rollback:  DROP TABLE IF EXISTS clinica_artefactos;
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinica_artefactos (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  metodo_nombre  text,
  protocolo      text,                              -- protocolo de entrega → plantilla
  paciente_ideal jsonb,                             -- avatar estructurado → ficha
  catalogo       jsonb NOT NULL DEFAULT '[]'::jsonb, -- ofertas → catálogo [{nombre,descripcion,precio}]
  actualizado_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clinica_artefactos ENABLE ROW LEVEL SECURITY;

-- El dueño lee y escribe SU propio row. TCD hace upsert, MCD hace select —
-- el mismo usuario autenticado en ambas apps.
DROP POLICY IF EXISTS "clinica_artefactos_owner_all" ON clinica_artefactos;
CREATE POLICY "clinica_artefactos_owner_all" ON clinica_artefactos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
