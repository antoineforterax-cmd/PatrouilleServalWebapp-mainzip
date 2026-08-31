/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const LOCAL_DB_KEY = 'squadcraft_local_database_v2';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key'),
);
export const isLocalMode = !isSupabaseConfigured;

type LocalRow = Record<string, any>;
type LocalDatabase = Record<string, LocalRow[]>;

function emptyDatabase(): LocalDatabase {
  return {
    patrouilles: [], users: [], annonces: [], messages: [], badges: [],
    user_badges: [], parent_relations: [], materiels: [], pharmacies: [],
    transactions: [], courses: [], weekends: [],
  };
}

function readLocalDatabase(): LocalDatabase {
  try {
    const stored = localStorage.getItem(LOCAL_DB_KEY);
    if (stored) return JSON.parse(stored) as LocalDatabase;
  } catch {
    // Recreate a readable demo database if browser storage is unavailable.
  }
  const seeded = emptyDatabase();
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