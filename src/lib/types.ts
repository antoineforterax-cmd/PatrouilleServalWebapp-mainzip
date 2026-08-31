export type RoleSysteme = 'CT' | 'CP' | 'SP' | 'HP' | 'MEMBRE' | 'PARENT';
export type PlacePatrouille = 'CP' | 'SP' | 'TROISIEME' | 'QUATRIEME' | 'CINQUIEME' | 'SIXIEME' | 'SEPTIEME' | 'HUITIEME' | 'AUTRE';
export type RoleTechnique = 'AUCUN' | 'TOPOGRAPHE' | 'TRESORIER' | 'MATERIALISTE' | 'SECOURISTE' | 'INTENDANT' | 'CUISINIER' | 'MAITRE_FEU' | 'RESP_PROPRETE' | 'PIONNIER';
export type NiveauProgression = 'AUCUNE' | 'PROMESSE' | 'ASPIRANCE' | 'SECONDE_CLASSE' | 'PREMIERE_CLASSE';
export type StatutMateriel = 'EN_STOCK' | 'A_REPARER' | 'A_REMPLACER' | 'A_ACHETER';
export type CategoriePharmacie = 'TRAUMATOLOGIE' | 'BOBOLOGIE' | 'MEDICAMENTS';
export type TypeTransaction = 'ENTREE' | 'DEPENSE';
export type CategorieTransaction = 'EXTRA_JOB' | 'CAGNOTTE' | 'AUTRE_ENTREE' | 'COURSES' | 'MATERIEL' | 'AUTRE_DEPENSE';
export type StatutBadge = 'A_COMMENCER' | 'EN_COURS' | 'VALIDE';
export type StatutUser = 'ACTIF' | 'DESACTIVE';
export type CategorieMateriel = 'TENTES' | 'FROISSARTAGE' | 'OUTILLAGE' | 'POPOTE' | 'FEU' | 'CAMPEMENT' | 'DIVERS';

export type Patrouille = {
  id: string;
  nom: string;
  logo_url: string | null;
  created_at: string;
};

export type User = {
  id: string;
  prenom: string;
  code_secret: string;
  role: RoleSysteme;
  place: PlacePatrouille;
  role_technique: RoleTechnique;
  progression: NiveauProgression;
  badges: string | null;
  aspirations: string | null;
  photo_url: string | null;
  patrouille_id: string | null;
  statut: StatutUser;
  created_at: string;
};

export type Annonce = {
  id: string;
  titre: string;
  contenu: string;
  image_url: string | null;
  auteur_id: string | null;
  patrouille_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  auteur_id: string | null;
  patrouille_id: string;
  contenu: string;
  image_url: string | null;
  created_at: string;
};

export type Badge = {
  id: string;
  nom: string;
  patrouille_id: string | null;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  statut: StatutBadge;
  created_at: string;
};

export type ParentRelation = {
  id: string;
  parent_id: string;
  enfant_id: string;
  created_at: string;
};

export type Course = {
  id: string;
  nom: string;
  quantite: number;
  montant_estime: number | null;
  montant_reel: number | null;
  achete: boolean;
  ticket_url: string | null;
  valide: boolean;
  patrouille_id: string;
  created_at: string;
};

export type Materiel = {
  id: string;
  nom: string;
  categorie: string;
  statut: StatutMateriel;
  quantite: number;
  prix_estime: number | null;
  fournisseur: string | null;
  notes: string | null;
  patrouille_id: string;
  created_at: string;
};

export type Pharmacie = {
  id: string;
  nom: string;
  categorie: CategoriePharmacie;
  quantite: number;
  date_peremption: string | null;
  patrouille_id: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  titre: string;
  montant: number;
  type: TypeTransaction;
  categorie: string;
  date: string;
  patrouille_id: string;
};

export type Weekend = {
  id: string;
  titre: string;
  date_debut: string | null;
  date_fin: string | null;
  lieu_depart: string | null;
  lieu_retour: string | null;
  affaires: string | null;
  urgences: string | null;
  patrouille_id: string;
  created_at: string;
};

export type View = 'overview' | 'annonces' | 'chat' | 'members' | 'weekends' | 'pharmacy' | 'materiel' | 'courses' | 'treasury' | 'urgences' | 'settings' | 'accounts';

export type Session = {
  user: User;
  patrouille: Patrouille | null;
};
