import { supabase } from './supabase';
import type { Session, User, Patrouille } from './types';

const STORAGE_KEY = 'squadcraft_session_v2';

export function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function storeSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(
  identifiant: string,
  codeSecret: string
): Promise<{ session?: Session; error?: string }> {
  const cleanId = identifiant.trim();
  if (!cleanId || !codeSecret.trim()) {
    return { error: 'Saisis ton prénom et ton code d\'accès.' };
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('code_secret', codeSecret.trim())
    .ilike('prenom', cleanId)
    .maybeSingle();

  if (error || !user) {
    return { error: 'Identifiant ou code d\'accès incorrect.' };
  }

  if (user.statut === 'DESACTIVE') {
    return { error: 'Ce compte est désactivé. Contacte ton CP.' };
  }

  let patrouille: Patrouille | null = null;
  if (user.patrouille_id) {
    const { data: pat } = await supabase
      .from('patrouilles')
      .select('*')
      .eq('id', user.patrouille_id)
      .maybeSingle();
    patrouille = pat;
  }

  const session: Session = { user: user as User, patrouille };
  storeSession(session);
  return { session };
}

export async function checkAnyUserExists(): Promise<boolean> {
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  return (count ?? 0) > 0;
}

export async function initCT(
  prenom: string,
  codeSecret: string,
  patrouilleNom: string
): Promise<{ session?: Session; error?: string }> {
  if (!prenom.trim() || !codeSecret.trim() || !patrouilleNom.trim()) {
    return { error: 'Tous les champs sont obligatoires.' };
  }

  const { data: patrouille, error: patErr } = await supabase
    .from('patrouilles')
    .insert({ nom: patrouilleNom.trim() })
    .select()
    .single();

  if (patErr || !patrouille) {
    return { error: 'Impossible de créer la patrouille.' };
  }

  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({
      prenom: prenom.trim(),
      code_secret: codeSecret.trim(),
      role: 'CP',
      place: 'CP',
      patrouille_id: patrouille.id,
      statut: 'ACTIF',
    })
    .select()
    .single();

  if (userErr || !user) {
    return { error: 'Impossible de créer le compte CP.' };
  }

  const session: Session = { user, patrouille };
  storeSession(session);
  return { session };
}

export function canManageMembers(s: Session): boolean {
  return s.user.role === 'CP';
}

export function canManageLogistics(s: Session): boolean {
  return s.user.role === 'CP' || s.user.role === 'SP';
}

export function hasTechnicalRole(session: Session, role: string): boolean {
  return session.user.role === 'CP'
    || session.user.role === 'SP'
    || String(session.user.role_technique ?? '')
      .split(',')
      .map((item) => item.trim())
      .includes(role);
}

function hasAssignedTechnicalRole(session: Session, role: string): boolean {
  return String(session.user.role_technique ?? '')
    .split(',')
    .map((item) => item.trim())
    .includes(role);
}

/**
 * Le CP garde l'administration des comptes et des rôles.
 * Le SP peut piloter les modules opérationnels, tandis que les rôles
 * techniques donnent accès uniquement à leur domaine de responsabilité.
 */
export function canManageWeekends(s: Session): boolean {
  return hasTechnicalRole(s, 'INTENDANT');
}

export function canManagePharmacy(s: Session): boolean {
  return hasTechnicalRole(s, 'SECOURISTE');
}

export function canManageMateriel(s: Session): boolean {
  return hasTechnicalRole(s, 'MATERIALISTE');
}

export function canManageCourses(s: Session): boolean {
  return hasTechnicalRole(s, 'INTENDANT');
}

export function canManageMeals(s: Session): boolean {
  return hasAssignedTechnicalRole(s, 'CUISINIER') || hasAssignedTechnicalRole(s, 'INTENDANT');
}

export function canManageTreasury(s: Session): boolean {
  return hasTechnicalRole(s, 'TRESORIER');
}

export function canManageAnnonces(s: Session): boolean {
  return s.user.role === 'CP' || s.user.role === 'SP';
}

export function canManageChat(s: Session): boolean {
  return s.user.role === 'CP' || s.user.role === 'SP';
}

export function isParent(s: Session): boolean {
  return s.user.role === 'PARENT';
}

export function isCP(s: Session): boolean {
  return s.user.role === 'CP';
}

export async function transferCP(
  newCPUserId: string,
  oldCPUserId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc('transfer_cp', {
    new_cp_id: newCPUserId,
    old_cp_id: oldCPUserId,
  });
  return error ? { error: 'Erreur lors du transfert. Vérifie que la migration v4 est appliquée.' } : {};
}
