/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const LOCAL_DB_KEY = 'squadcraft_local_database';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key'),
);
export const isLocalMode = !isSupabaseConfigured;

type LocalRow = Record<string, any>;
type LocalDatabase = Record<string, LocalRow[]>;

const badgeNames = [
  'Artisan', 'Astronome', 'Boute-en-train', 'Campeur', 'Cuisinier',
  'Gabier', 'Pionnier', 'Reporter', 'Secouriste', 'Serviteur de la liturgie',
  'Sportif', 'Topographe', 'Transmetteur', 'Trappeur',
];

function demoDatabase(): LocalDatabase {
  const patrolId = 'patrol-serval';
  const createdAt = '2026-08-31T08:00:00.000Z';
  return {
    patrouilles: [{ id: patrolId, nom: 'Patrouille du Serval', logo_url: null, created_at: createdAt }],
    users: [
      { id: 'user-antoine', prenom: 'Antoine', code_secret: 'SERVAL', role: 'CP', place: 'CP', role_technique: 'AUCUN', progression: 'PREMIERE_CLASSE', badges: null, aspirations: 'Faire grandir la patrouille et préparer le prochain camp.', photo_url: null, patrouille_id: patrolId, statut: 'ACTIF', created_at: createdAt },
      { id: 'user-lucas', prenom: 'Lucas', code_secret: 'LUCAS', role: 'SP', place: 'SP', role_technique: 'PIONNIER', progression: 'SECONDE_CLASSE', badges: null, aspirations: 'Progresser en froissartage.', photo_url: null, patrouille_id: patrolId, statut: 'ACTIF', created_at: '2026-08-31T08:05:00.000Z' },
      { id: 'user-emma', prenom: 'Emma', code_secret: 'EMMA', role: 'MEMBRE', place: 'TROISIEME', role_technique: 'SECOURISTE', progression: 'ASPIRANCE', badges: null, aspirations: 'Obtenir le badge Secouriste.', photo_url: null, patrouille_id: patrolId, statut: 'ACTIF', created_at: '2026-08-31T08:10:00.000Z' },
      { id: 'user-marie', prenom: 'Marie', code_secret: 'PARENT', role: 'PARENT', place: 'AUTRE', role_technique: 'AUCUN', progression: 'AUCUNE', badges: null, aspirations: null, photo_url: null, patrouille_id: patrolId, statut: 'ACTIF', created_at: '2026-08-31T08:15:00.000Z' },
    ],
    annonces: [{ id: 'annonce-rentree', titre: 'Préparation du prochain week-end', contenu: 'Rendez-vous samedi à 8h au local. N’oubliez pas votre duvet et votre gourde.', image_url: null, auteur_id: 'user-antoine', patrouille_id: patrolId, created_at: '2026-08-30T18:00:00.000Z' }],
    messages: [
      { id: 'message-1', auteur_id: 'user-antoine', patrouille_id: patrolId, contenu: 'Rendez-vous samedi à 8h.', image_url: null, created_at: '2026-08-30T17:30:00.000Z' },
      { id: 'message-2', auteur_id: 'user-lucas', patrouille_id: patrolId, contenu: 'Je prends la tente.', image_url: null, created_at: '2026-08-30T17:35:00.000Z' },
    ],
    badges: badgeNames.map((nom, index) => ({ id: `badge-${index}`, nom, patrouille_id: null, created_at: createdAt })),
    user_badges: [{ id: 'user-badge-1', user_id: 'user-emma', badge_id: 'badge-8', statut: 'VALIDE', created_at: createdAt }],
    parent_relations: [{ id: 'relation-1', parent_id: 'user-marie', enfant_id: 'user-emma', created_at: createdAt }],
    materiels: [
      { id: 'material-1', nom: 'Tente 6 places', categorie: 'TENTES', statut: 'EN_STOCK', quantite: 1, prix_estime: null, fournisseur: null, notes: null, patrouille_id: patrolId, created_at: createdAt },
      { id: 'material-2', nom: 'Scie pliante', categorie: 'OUTILLAGE', statut: 'A_ACHETER', quantite: 2, prix_estime: 18, fournisseur: 'Decathlon', notes: null, patrouille_id: patrolId, created_at: createdAt },
    ],
    pharmacies: [
      { id: 'pharmacy-1', nom: 'Compresses stériles', categorie: 'BOBOLOGIE', quantite: 12, date_peremption: '2028-06-01', patrouille_id: patrolId, created_at: createdAt },
      { id: 'pharmacy-2', nom: 'Désinfectant', categorie: 'BOBOLOGIE', quantite: 1, date_peremption: '2026-09-10', patrouille_id: patrolId, created_at: createdAt },
    ],
    transactions: [
      { id: 'transaction-1', titre: 'Cagnotte de rentrée', montant: 470, type: 'ENTREE', categorie: 'CAGNOTTE', date: '2026-08-01T12:00:00.000Z', patrouille_id: patrolId },
      { id: 'transaction-2', titre: 'Achat popote', montant: 230, type: 'DEPENSE', categorie: 'MATERIEL', date: '2026-08-15T12:00:00.000Z', patrouille_id: patrolId },
    ],
    courses: [
      { id: 'course-1', nom: 'Pain', quantite: 2, montant_estime: 4, montant_reel: null, achete: false, ticket_url: null, valide: false, patrouille_id: patrolId, created_at: createdAt },
      { id: 'course-2', nom: 'Pâtes', quantite: 4, montant_estime: 6, montant_reel: null, achete: true, ticket_url: null, valide: false, patrouille_id: patrolId, created_at: createdAt },
    ],
    weekends: [{ id: 'weekend-1', titre: 'Week-end de rentrée', date_debut: '2026-09-12T08:00:00.000Z', date_fin: '2026-09-13T17:00:00.000Z', lieu_depart: 'Local scout', lieu_retour: 'Local scout', gps_depart: 'Local scout', gps_retour: 'Local scout', affaires: 'Duvet\nGourde\nSac à dos\nChaussures de marche', urgences: 'Prévenir le CP en cas de retard.', notes: 'Prévoir une tenue chaude.', patrouille_id: patrolId, created_at: createdAt }],
  };
}

function readLocalDatabase(): LocalDatabase {
  try {
    const stored = localStorage.getItem(LOCAL_DB_KEY);
    if (stored) return JSON.parse(stored) as LocalDatabase;
  } catch {
    // Recreate a readable demo database if browser storage is unavailable.
  }
  const seeded = demoDatabase();
  try { localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(seeded)); } catch { /* memory-only fallback */ }
  return seeded;
}

function saveLocalDatabase(database: LocalDatabase) {
  try { localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(database)); } catch { /* memory-only fallback */ }
}

function localId(table: string) {
  return `${table.slice(0, -1)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class LocalQuery implements PromiseLike<any> {
  private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private payload: LocalRow | LocalRow[] | null = null;
  private filters: ((row: LocalRow) => boolean)[] = [];
  private orderings: { column: string; ascending: boolean }[] = [];
  private maxRows: number | null = null;
  private resultMode: 'many' | 'single' | 'maybeSingle' = 'many';
  private selectAfterMutation = false;
  private head = false;

  constructor(private readonly database: LocalDatabase, private readonly table: string) {}

  select(columns = '*', options?: { head?: boolean }) { void columns; this.selectAfterMutation = this.operation !== 'select'; this.head = Boolean(options?.head); return this; }
  insert(payload: LocalRow | LocalRow[]) { this.operation = 'insert'; this.payload = payload; return this; }
  update(payload: LocalRow) { this.operation = 'update'; this.payload = payload; return this; }
  delete() { this.operation = 'delete'; return this; }
  upsert(payload: LocalRow | LocalRow[]) { this.operation = 'upsert'; this.payload = payload; return this; }
  eq(column: string, value: any) { this.filters.push((row) => row[column] === value); return this; }
  neq(column: string, value: any) { this.filters.push((row) => row[column] !== value); return this; }
  ilike(column: string, value: string) { const expected = value.toLowerCase().replace(/%/g, ''); this.filters.push((row) => String(row[column] ?? '').toLowerCase() === expected); return this; }
  in(column: string, values: any[]) { this.filters.push((row) => values.includes(row[column])); return this; }
  lt(column: string, value: any) { this.filters.push((row) => row[column] != null && row[column] < value); return this; }
  gte(column: string, value: any) { this.filters.push((row) => row[column] != null && row[column] >= value); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderings.push({ column, ascending: options?.ascending !== false }); return this; }
  limit(count: number) { this.maxRows = count; return this; }
  single() { this.resultMode = 'single'; return this; }
  maybeSingle() { this.resultMode = 'maybeSingle'; return this; }

  private matchingRows() {
    const rows = [...(this.database[this.table] ?? [])].filter((row) => this.filters.every((filter) => filter(row)));
    this.orderings.slice().reverse().forEach(({ column, ascending }) => {
      rows.sort((a, b) => {
        if (a[column] === b[column]) return 0;
        return (a[column] < b[column] ? -1 : 1) * (ascending ? 1 : -1);
      });
    });
    return this.maxRows == null ? rows : rows.slice(0, this.maxRows);
  }

  private async execute() {
    const rows = this.database[this.table] ?? (this.database[this.table] = []);
    if (this.operation === 'insert' || this.operation === 'upsert') {
      const incoming = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
      const inserted: LocalRow[] = [];
      incoming.forEach((item) => {
        const existing = this.operation === 'upsert' && item.nom ? rows.find((row) => row.nom === item.nom) : null;
        if (existing) Object.assign(existing, item);
        else {
          const row = { id: item.id ?? localId(this.table), created_at: new Date().toISOString(), ...item };
          rows.push(row); inserted.push(row);
        }
      });
      saveLocalDatabase(this.database);
      if (!this.selectAfterMutation) return { data: null, error: null };
      const data = this.resultMode === 'many' ? inserted : inserted[0] ?? null;
      return { data, error: null };
    }
    if (this.operation === 'update') {
      this.matchingRows().forEach((row) => Object.assign(row, this.payload ?? {}));
      saveLocalDatabase(this.database);
      return { data: null, error: null };
    }
    if (this.operation === 'delete') {
      const toDelete = new Set(this.matchingRows());
      this.database[this.table] = rows.filter((row) => !toDelete.has(row));
      saveLocalDatabase(this.database);
      return { data: null, error: null };
    }
    if (this.head) return { data: null, count: this.matchingRows().length, error: null };
    const found = this.matchingRows();
    if (this.resultMode === 'single' || this.resultMode === 'maybeSingle') return { data: found[0] ?? null, error: null };
    return { data: found, error: null };
  }

  then<TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class LocalSupabase {
  from(table: string) { return new LocalQuery(readLocalDatabase(), table); }

  async rpc(name: string, args: Record<string, string>) {
    if (name !== 'transfer_cp') return { data: null, error: { message: 'Fonction inconnue' } };
    const database = readLocalDatabase();
    const users = database.users ?? [];
    const oldCP = users.find((user) => user.id === args.old_cp_id && user.role === 'CP' && user.statut === 'ACTIF');
    const newCP = users.find((user) => user.id === args.new_cp_id && user.patrouille_id === oldCP?.patrouille_id && user.statut === 'ACTIF');
    if (!oldCP || !newCP) return { data: null, error: { message: 'Transfert impossible' } };
    Object.assign(newCP, { role: 'CP', place: 'CP' });
    Object.assign(oldCP, { role: 'MEMBRE', place: 'AUTRE' });
    saveLocalDatabase(database);
    return { data: null, error: null };
  }
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = isSupabaseConfigured
      ? createClient(supabaseUrl, supabaseAnonKey)
      : new LocalSupabase() as unknown as SupabaseClient;
  }
  return client;
}

export const supabase = getSupabase();