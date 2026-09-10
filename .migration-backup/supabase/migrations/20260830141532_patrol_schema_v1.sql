/*
# Patrouille Serval — Schéma complet v1

## Vue d'ensemble
Crée toutes les tables nécessaires au fonctionnement de l'application de patrouille :
- Connexion sans e-mail (prénom + mot de passe commun)
- Gestion des membres et de leurs rôles
- Planning des week-ends avec infos parents
- Module pharmacie / secourisme
- Liste de courses partagée

## Nouvelles tables

1. **patrol_config** — Configuration de la patrouille (mot de passe commun, nom)
2. **members** — Membres de la patrouille (prénom, rôle, allergies, progression)
3. **weekends** — Week-ends et activités (dates, lieux, GPS, participation financière)
4. **weekend_checklist** — Checklist d'affaires à prendre pour un week-end
5. **pharmacy_items** — Inventaire de la trousse à pharmacie (catégorisé, péremption)
6. **pharmacy_checkout** — Consommation de matériel après un week-end
7. **shopping_list** — Liste de courses partagée

## Sécurité (RLS)
- Toutes les tables ont RLS activé.
- L'application utilise un système de connexion personnalisé (pas Supabase Auth),
  donc toutes les politiques utilisent `TO anon, authenticated` avec `USING (true)`.
- Le contrôle d'accès est géré côté application (rôles dans la table members).
*/

-- Configuration de la patrouille
CREATE TABLE IF NOT EXISTS patrol_config (
  id int PRIMARY KEY DEFAULT 1,
  patrol_name text NOT NULL DEFAULT 'Patrouille Serval',
  common_password text NOT NULL DEFAULT 'SERVAL-2026',
  cp_member_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Membres
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  role text NOT NULL DEFAULT 'Membre',
  parent_of uuid REFERENCES members(id) ON DELETE SET NULL,
  progression int NOT NULL DEFAULT 0,
  allergies text,
  created_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'patrol_config_cp_fk' AND table_name = 'patrol_config') THEN
    ALTER TABLE patrol_config ADD CONSTRAINT patrol_config_cp_fk
      FOREIGN KEY (cp_member_id) REFERENCES members(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrol_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_members" ON members;
CREATE POLICY "anon_select_members" ON members FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_members" ON members;
CREATE POLICY "anon_insert_members" ON members FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_members" ON members;
CREATE POLICY "anon_update_members" ON members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_members" ON members;
CREATE POLICY "anon_delete_members" ON members FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_patrol_config" ON patrol_config;
CREATE POLICY "anon_select_patrol_config" ON patrol_config FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_update_patrol_config" ON patrol_config;
CREATE POLICY "anon_update_patrol_config" ON patrol_config FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_patrol_config" ON patrol_config;
CREATE POLICY "anon_insert_patrol_config" ON patrol_config FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Week-ends
CREATE TABLE IF NOT EXISTS weekends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Week-end',
  start_date timestamptz,
  end_date timestamptz,
  meetup_location text,
  meetup_coords text,
  end_location text,
  end_coords text,
  financial_contribution numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_weekends" ON weekends;
CREATE POLICY "anon_select_weekends" ON weekends FOR SELECT
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

-- Checklist week-end
CREATE TABLE IF NOT EXISTS weekend_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekend_id uuid NOT NULL REFERENCES weekends(id) ON DELETE CASCADE,
  item text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekend_checklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_weekend_checklist" ON weekend_checklist;
CREATE POLICY "anon_select_weekend_checklist" ON weekend_checklist FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_weekend_checklist" ON weekend_checklist;
CREATE POLICY "anon_insert_weekend_checklist" ON weekend_checklist FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_weekend_checklist" ON weekend_checklist;
CREATE POLICY "anon_update_weekend_checklist" ON weekend_checklist FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_weekend_checklist" ON weekend_checklist;
CREATE POLICY "anon_delete_weekend_checklist" ON weekend_checklist FOR DELETE
  TO anon, authenticated USING (true);

-- Pharmacie
CREATE TABLE IF NOT EXISTS pharmacy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Bobologie',
  quantity int NOT NULL DEFAULT 1,
  expiry_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pharmacy_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pharmacy_items" ON pharmacy_items;
CREATE POLICY "anon_select_pharmacy_items" ON pharmacy_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pharmacy_items" ON pharmacy_items;
CREATE POLICY "anon_insert_pharmacy_items" ON pharmacy_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pharmacy_items" ON pharmacy_items;
CREATE POLICY "anon_update_pharmacy_items" ON pharmacy_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pharmacy_items" ON pharmacy_items;
CREATE POLICY "anon_delete_pharmacy_items" ON pharmacy_items FOR DELETE
  TO anon, authenticated USING (true);

-- Check-out pharmacie
CREATE TABLE IF NOT EXISTS pharmacy_checkout (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES pharmacy_items(id) ON DELETE CASCADE,
  quantity_used int NOT NULL,
  checkout_date timestamptz DEFAULT now(),
  weekend_id uuid REFERENCES weekends(id) ON DELETE SET NULL
);

ALTER TABLE pharmacy_checkout ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pharmacy_checkout" ON pharmacy_checkout;
CREATE POLICY "anon_select_pharmacy_checkout" ON pharmacy_checkout FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pharmacy_checkout" ON pharmacy_checkout;
CREATE POLICY "anon_insert_pharmacy_checkout" ON pharmacy_checkout FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pharmacy_checkout" ON pharmacy_checkout;
CREATE POLICY "anon_delete_pharmacy_checkout" ON pharmacy_checkout FOR DELETE
  TO anon, authenticated USING (true);

-- Liste de courses
CREATE TABLE IF NOT EXISTS shopping_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item text NOT NULL,
  category text NOT NULL DEFAULT 'Courses',
  quantity int NOT NULL DEFAULT 1,
  purchased boolean NOT NULL DEFAULT false,
  added_by uuid REFERENCES members(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shopping_list" ON shopping_list;
CREATE POLICY "anon_select_shopping_list" ON shopping_list FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_shopping_list" ON shopping_list;
CREATE POLICY "anon_insert_shopping_list" ON shopping_list FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_shopping_list" ON shopping_list;
CREATE POLICY "anon_update_shopping_list" ON shopping_list FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_shopping_list" ON shopping_list;
CREATE POLICY "anon_delete_shopping_list" ON shopping_list FOR DELETE
  TO anon, authenticated USING (true);