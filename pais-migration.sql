-- pais-migration.sql
-- Agrega el campo `pais` al perfil del profesional para que la IA adapte el
-- dialecto (voseo / tuteo) del contenido publicable (landings, anuncios,
-- copies, guiones) al país del sanador.
--
-- Origen: feedback Sol (peruana viviendo entre Panamá e Italia) reportó que
-- la app generaba landings en voseo argentino. La voz del Coach IA (Javo)
-- se mantiene en voseo · pero el contenido que el cliente publica usa el
-- dialecto del país del sanador.
--
-- Para los valores válidos ver src/lib/vozLocalizada.ts (PAISES).
-- Ejemplos: AR, UY, MX, PE, CO, CL, ES, PA, etc.
--
-- Ejecutar una sola vez en el SQL editor de Supabase.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pais text;

COMMENT ON COLUMN public.profiles.pais IS
  'Código ISO-like del país del profesional. Define el dialecto del contenido publicable (voseo / tuteo). Ver src/lib/vozLocalizada.ts';
