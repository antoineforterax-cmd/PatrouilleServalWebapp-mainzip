/*
  SquadCraft v4
  Ajoute les informations GPS et les notes détaillées des week-ends.
*/

ALTER TABLE weekends ADD COLUMN IF NOT EXISTS gps_depart text;
ALTER TABLE weekends ADD COLUMN IF NOT EXISTS gps_retour text;
ALTER TABLE weekends ADD COLUMN IF NOT EXISTS notes text;

/*
  Le transfert est réalisé dans une seule transaction afin qu'une patrouille
  ne puisse jamais rester sans CP entre deux mises à jour.
*/
CREATE OR REPLACE FUNCTION public.transfer_cp(new_cp_id uuid, old_cp_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  patrol_id uuid;
BEGIN
  IF new_cp_id = old_cp_id THEN
    RAISE EXCEPTION 'Le nouveau CP doit être différent de l’ancien';
  END IF;

  SELECT patrouille_id INTO patrol_id
  FROM users
  WHERE id = old_cp_id AND role = 'CP' AND statut = 'ACTIF'
  FOR UPDATE;

  IF patrol_id IS NULL THEN
    RAISE EXCEPTION 'Le CP actuel est introuvable ou désactivé';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = new_cp_id AND patrouille_id = patrol_id AND statut = 'ACTIF'
  ) THEN
    RAISE EXCEPTION 'Le nouveau CP doit être un membre actif de la patrouille';
  END IF;

  UPDATE users SET role = 'CP', place = 'CP' WHERE id = new_cp_id;
  UPDATE users SET role = 'MEMBRE', place = 'AUTRE' WHERE id = old_cp_id;
END;
$$;