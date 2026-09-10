/*
# SquadCraft — Schéma complet v2

## Vue d'ensemble
Reconstruit complètement la base de données selon le cahier des charges SquadCraft.
Les anciennes tables vides (patrol_config, members, weekends, weekend_checklist,
pharmacy_items, pharmacy_checkout, shopping_list) sont supprimées et remplacées
par le nouveau schéma basé sur le modèle Prisma fourni.

## Nouvelles tables

1. **patrouilles** — Groupes scoutes (nom, logo)
2. **users** — Utilisateurs avec connexion par identifiant + code secret
   - prenom, codeSecret (unique), role (CT/CP/SP/MEMBRE/PARENT)
   - place (CP/SECOND/TROISIEME/...), roleTechnique (INTENDANT/SECOURISTE/...)
   - progression (AUCUNE/PROMESSE/ASPIRANCE/...), badges, aspirations, photoUrl
   - patrouilleId (FK vers patrouilles)
3. **materiels** — Inventaire de la malle & matériel
   - nom, categorie, statut (EN_STOCK/A_REPARER/A_REMPLACER/A_ACHETER)
   - prixEstime, fournisseur, patrouilleId
4. **pharmacies** — Trousse à pharmacie
   - nom, categorie (TRAUMATOLOGIE/BOBOLOGIE/MEDICAMENTS)
   - quantite, datePeremption, patrouilleId
5. **transactions** — Trésorerie (entrées et dépenses)
   - titre, montant, type (ENTREE/DEPENSE), date, patrouilleId
6. **weekends** — Fiches d'activités
   - titre, dateDebut, dateFin, lieuDepart, lieuRetour, affaires, urgences, patrouilleId

## Sécurité (RLS)
- Toutes les tables ont RLS activé.
- L'application utilise un système de connexion personnalisé (pas Supabase Auth),
  donc toutes les politiques utilisent `TO anon, authenticated` avec `USING (true)`.
- Le contrôle d'accès et l'isolation par patrouille sont gérés côté application.
*/

-- Supprimer les anciennes tables vides
DROP TABLE IF EXISTS shopping_list CASCADE;
DROP TABLE IF EXISTS pharmacy_checkout CASCADE;
DROP TABLE IF EXISTS pharmacy_items CASCADE;
DROP TABLE IF EXISTS weekend_checklist CASCADE;
DROP TABLE IF EXISTS weekends CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS patrol_config CASCADE;

-- 1. Patrouilles
CREATE TABLE IF NOT EXISTS patrouilles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- 2. Users (avec code secret au lieu d'email)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  code_secret text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'MEMBRE',
  place text NOT NULL DEFAULT 'AUTRE',
  role_technique text NOT NULL DEFAULT 'AUCUN',
  progression text NOT NULL DEFAULT 'AUCUNE',
  badges text,
  aspirations text,
  photo_url text,
  patrouille_id uuid REFERENCES patrouilles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_patrouille ON users(patrouille_id);
CREATE INDEX IF NOT EXISTS idx_users_code_secret ON users(code_secret);

-- 3. Matériels
CREATE TABLE IF NOT EXISTS materiels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  categorie text NOT NULL DEFAULT 'Divers',
  statut text NOT NULL DEFAULT 'EN_STOCK',
  prix_estime numeric,
  fournisseur text,
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materiels_patrouille ON materiels(patrouille_id);

-- 4. Pharmacies
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  categorie text NOT NULL DEFAULT 'BOBOLOGIE',
  quantite int NOT NULL DEFAULT 1,
  date_peremption date,
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pharmacies_patrouille ON pharmacies(patrouille_id);

-- 5. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  montant numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'DEPENSE',
  date timestamptz DEFAULT now(),
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_patrouille ON transactions(patrouille_id);

-- 6. Weekends
CREATE TABLE IF NOT EXISTS weekends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  date_debut timestamptz,
  date_fin timestamptz,
  lieu_depart text,
  lieu_retour text,
  affaires text,
  urgences text,
  patrouille_id uuid NOT NULL REFERENCES patrouilles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekends_patrouille ON weekends(patrouille_id);

-- RLS sur toutes les tables
ALTER TABLE patrouilles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekends ENABLE ROW LEVEL SECURITY;

-- Politiques patrouilles (anon + authenticated, contrôle app-side)
DROP POLICY IF EXISTS "anon_all_patrouilles" ON patrouilles;
CREATE POLICY "anon_all_patrouilles" ON patrouilles FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_patrouilles" ON patrouilles;
CREATE POLICY "anon_insert_patrouilles" ON patrouilles FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_patrouilles" ON patrouilles;
CREATE POLICY "anon_update_patrouilles" ON patrouilles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_patrouilles" ON patrouilles;
CREATE POLICY "anon_delete_patrouilles" ON patrouilles FOR DELETE
  TO anon, authenticated USING (true);

-- Politiques users
DROP POLICY IF EXISTS "anon_all_users" ON users;
CREATE POLICY "anon_all_users" ON users FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE
  TO anon, authenticated USING (true);

-- Politiques materiels
DROP POLICY IF EXISTS "anon_all_materiels" ON materiels;
CREATE POLICY "anon_all_materiels" ON materiels FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_materiels" ON materiels;
CREATE POLICY "anon_insert_materiels" ON materiels FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_materiels" ON materiels;
CREATE POLICY "anon_update_materiels" ON materiels FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_materiels" ON materiels;
CREATE POLICY "anon_delete_materiels" ON materiels FOR DELETE
  TO anon, authenticated USING (true);

-- Politiques pharmacies
DROP POLICY IF EXISTS "anon_all_pharmacies" ON pharmacies;
CREATE POLICY "anon_all_pharmacies" ON pharmacies FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pharmacies" ON pharmacies;
CREATE POLICY "anon_insert_pharmacies" ON pharmacies FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pharmacies" ON pharmacies;
CREATE POLICY "anon_update_pharmacies" ON pharmacies FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pharmacies" ON pharmacies;
CREATE POLICY "anon_delete_pharmacies" ON pharmacies FOR DELETE
  TO anon, authenticated USING (true);

-- Politiques transactions
DROP POLICY IF EXISTS "anon_all_transactions" ON transactions;
CREATE POLICY "anon_all_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

-- Politiques weekends
DROP POLICY IF EXISTS "anon_all_weekends" ON weekends;
CREATE POLICY "anon_all_weekends" ON weekends FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_weekends" ON weekends;
CREATE POLICY "anon_insert_weekends" ON weekends FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_weekends" ON weekends;
CREATE POLICY "anon_update_weekends" ON weekends FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_weekends" ON weekends;
CREATE POLICY "anon_delete_weekends" ON weekends FOR DELETE
  TO anon, authenticated USING (true);