/*
# SquadCraft v3 — Mono-patrouille (Serval)

## Vue d'ensemble
Évolution du schéma pour la version mono-patrouille complète.
Ajoute les modules manquants : annonces, chat, badges, relations parents,
courses avec validation, et colonne statut sur les utilisateurs.

## Nouvelles tables

1. **annonces** — Annonces de la patrouille (titre, contenu, image, auteur)
2. **messages** — Chat de patrouille (auteur, contenu, image)
3. **badges** — Catalogue des badges de spécialité SUF
4. **user_badges** — Association membre/badge avec statut (A_COMMENCER, EN_COURS, VALIDE)
5. **parent_relations** — Association parent/enfant (un parent peut avoir plusieurs enfants)
6. **courses** — Listes de courses avec montants estimé/réel et validation

## Tables modifiées
- **users** : ajout colonne `statut` (ACTIF / DESACTIVE)
- **materiels** : ajout colonnes `quantite` et `notes`
- **transactions** : ajout colonne `categorie` (EXTRA_JOB, CAGNOTTE, COURSES, MATERIEL, etc.)

## Sécurité (RLS)
- Toutes les nouvelles tables ont RLS activé.
- Politiques `TO anon, authenticated` (contrôle d'accès côté application).
*/

-- Ajouter colonne statut sur users
ALTER TABLE users ADD COLUMN IF NOT EXISTS statut text NOT NULL DEFAULT 'ACTIF';

-- Ajouter colonnes sur materiels
ALTER TABLE materiels ADD COLUMN IF NOT EXISTS quantite int NOT NULL DEFAULT 1;
ALTER TABLE materiels ADD COLUMN IF NOT EXISTS notes text;

-- Ajouter colonne categorie sur transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS categorie text NOT NULL DEFAULT 'AUTRE_DEPENSE';

-- 1. Annonces
CREATE TABLE IF NOT EXISTS annonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  contenu text NOT NULL,
  image_url text,
  auteur_id uuid REFERENCES users(id) ON DELETE SET NULL,
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_annonces_patrouille ON annonces(patrouille_id);

-- 2. Messages (chat)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auteur_id uuid REFERENCES users(id) ON DELETE SET NULL,
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE,
  contenu text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_patrouille ON messages(patrouille_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- 3. Badges (catalogue)
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL UNIQUE,
  patrouille_id uuid REFERENCES patrouilles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 4. User-badges (association)
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  statut text NOT NULL DEFAULT 'A_COMMENCER',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- 5. Parent-relations
CREATE TABLE IF NOT EXISTS parent_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enfant_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, enfant_id)
);

-- 6. Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  quantite int NOT NULL DEFAULT 1,
  montant_estime numeric,
  montant_reel numeric,
  achete boolean NOT NULL DEFAULT false,
  ticket_url text,
  valide boolean NOT NULL DEFAULT false,
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_patrouille ON courses(patrouille_id);

-- RLS sur toutes les nouvelles tables
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Politiques annonces
DROP POLICY IF EXISTS "anon_all_annonces" ON annonces;
CREATE POLICY "anon_all_annonces" ON annonces FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_annonces" ON annonces;
CREATE POLICY "anon_insert_annonces" ON annonces FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_annonces" ON annonces;
CREATE POLICY "anon_update_annonces" ON annonces FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_annonces" ON annonces;
CREATE POLICY "anon_delete_annonces" ON annonces FOR DELETE TO anon, authenticated USING (true);

-- Politiques messages
DROP POLICY IF EXISTS "anon_all_messages" ON messages;
CREATE POLICY "anon_all_messages" ON messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE TO anon, authenticated USING (true);

-- Politiques badges
DROP POLICY IF EXISTS "anon_all_badges" ON badges;
CREATE POLICY "anon_all_badges" ON badges FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_badges" ON badges;
CREATE POLICY "anon_insert_badges" ON badges FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_badges" ON badges;
CREATE POLICY "anon_delete_badges" ON badges FOR DELETE TO anon, authenticated USING (true);

-- Politiques user_badges
DROP POLICY IF EXISTS "anon_all_user_badges" ON user_badges;
CREATE POLICY "anon_all_user_badges" ON user_badges FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_user_badges" ON user_badges;
CREATE POLICY "anon_insert_user_badges" ON user_badges FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_user_badges" ON user_badges;
CREATE POLICY "anon_update_user_badges" ON user_badges FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_user_badges" ON user_badges;
CREATE POLICY "anon_delete_user_badges" ON user_badges FOR DELETE TO anon, authenticated USING (true);

-- Politiques parent_relations
DROP POLICY IF EXISTS "anon_all_parent_relations" ON parent_relations;
CREATE POLICY "anon_all_parent_relations" ON parent_relations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_parent_relations" ON parent_relations;
CREATE POLICY "anon_insert_parent_relations" ON parent_relations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_parent_relations" ON parent_relations;
CREATE POLICY "anon_delete_parent_relations" ON parent_relations FOR DELETE TO anon, authenticated USING (true);

-- Politiques courses
DROP POLICY IF EXISTS "anon_all_courses" ON courses;
CREATE POLICY "anon_all_courses" ON courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE TO anon, authenticated USING (true);