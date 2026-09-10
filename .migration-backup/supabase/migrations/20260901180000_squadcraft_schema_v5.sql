/*
  SquadCraft v5
  Conversations privées, planning des repas et coordonnées locales.
*/

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS destinataire_id uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_private_pair
  ON messages(patrouille_id, auteur_id, destinataire_id, created_at);

CREATE TABLE IF NOT EXISTS repas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  moment text NOT NULL DEFAULT 'Dîner',
  date timestamptz,
  details text,
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repas_patrouille_date
  ON repas(patrouille_id, date);

ALTER TABLE repas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_repas" ON repas;
CREATE POLICY "anon_all_repas" ON repas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_repas" ON repas;
CREATE POLICY "anon_insert_repas" ON repas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_repas" ON repas;
CREATE POLICY "anon_update_repas" ON repas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_repas" ON repas;
CREATE POLICY "anon_delete_repas" ON repas FOR DELETE
  TO anon, authenticated USING (true);