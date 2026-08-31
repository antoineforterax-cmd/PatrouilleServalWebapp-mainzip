import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Megaphone,
  MessageSquare,
  Navigation,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  TentTree,
  TriangleAlert,
  UserCog,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { isLocalMode, supabase } from '@/lib/supabase';
import type {
  User, Weekend, Materiel, Pharmacie, Transaction,
  Annonce, Message as ChatMessage, Badge, UserBadge, ParentRelation,
  Course, View, Session,
} from '@/lib/types';
import {
  clearSession, checkAnyUserExists, getStoredSession, initCT,
  isCP, isParent, canManageMembers, canManageLogistics, canManageTreasury,
  canManageAnnonces, canManageChat, login, storeSession, transferCP,
} from '@/lib/auth';

const BADGE_CATALOG = [
  'Artisan', 'Astronome', 'Boute-en-train', 'Campeur', 'Cuisinier',
  'Gabier', 'Pionnier', 'Reporter', 'Secouriste', 'Serviteur de la liturgie',
  'Sportif', 'Topographe', 'Transmetteur', 'Trappeur',
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsInit, setNeedsInit] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = getStoredSession();
      if (stored) { setSession(stored); setLoading(false); return; }
      if (isLocalMode) {
        const demo = await login('Antoine', 'SERVAL');
        if (demo.session) { setSession(demo.session); setLoading(false); return; }
      }
      const exists = await checkAnyUserExists();
      if (!exists) setNeedsInit(true);
      setLoading(false);
    })();
  }, []);

  const handleLogin = (s: Session) => { setSession(s); setNeedsInit(false); };
  const handleLogout = () => { clearSession(); setSession(null); };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (needsInit && !session) return <InitScreen onDone={handleLogin} />;
  if (!session) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard session={session} onLogout={handleLogout} />;
}

/* ── Init ──────────────────────────────────────────────── */

function InitScreen({ onDone }: { onDone: (s: Session) => void }) {
  const [prenom, setPrenom] = useState('');
  const [code, setCode] = useState('');
  const [patrouille, setPatrouille] = useState('Patrouille du Serval');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    const { session, error: err } = await initCT(prenom, code, patrouille);
    if (err) setError(err);
    else if (session) onDone(session);
    setBusy(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-visual">
        <div className="auth-visual-copy">
          <span className="eyebrow"><ShieldCheck size={15} /> Première installation</span>
          <h1>SquadCraft<br /><em>Serval.</em></h1>
          <p>Configure le compte Chef de Patrouille. Tu pourras ensuite créer les fiches de tes patrouillards et leurs parents.</p>
        </div>
        <div className="auth-sun" />
        <div className="auth-forest forest-one" />
        <div className="auth-forest forest-two" />
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <img src="/image.png" alt="SquadCraft" className="auth-logo" />
          <span className="auth-kicker">Configuration initiale</span>
          <h2>Créer le compte CP</h2>
          <p className="auth-intro">Le CP a tous les droits de gestion sur la patrouille.</p>
          <form onSubmit={submit} className="auth-form">
            <label>
              <span className="input-label">Ton prénom</span>
              <div className="input-wrap">
                <UserRound size={17} className="input-icon" />
                <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Ex: Antoine" required autoFocus />
              </div>
            </label>
            <label>
              <span className="input-label">Nom de patrouille</span>
              <div className="input-wrap">
                <ShieldCheck size={17} className="input-icon" />
                <input value={patrouille} onChange={(e) => setPatrouille(e.target.value)} required />
              </div>
            </label>
            <label>
              <span className="input-label">Code d'accès</span>
              <div className="input-wrap">
                <ShieldCheck size={17} className="input-icon" />
                <input type={show ? 'text' : 'password'} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: SERVAL-2026" minLength={4} required />
                <button type="button" className="password-toggle" onClick={() => setShow((v) => !v)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            </label>
            {error && <p className="form-error">{error}</p>}
            {isLocalMode && <p className="local-mode-note"><strong>Mode simple activé</strong><br />Pour essayer : Antoine · SERVAL</p>}
            <button className="primary-button auth-submit" disabled={busy}>
              {busy ? <><Loader2 size={18} className="spin" /> Configuration…</> : <>Configurer <ArrowUpRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Login ────────────────────────────────────────────── */

function LoginScreen({ onLogin }: { onLogin: (s: Session) => void }) {
  const [identifiant, setIdentifiant] = useState('');
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    const { session, error: err } = await login(identifiant, code);
    if (err) setError(err);
    else if (session) onLogin(session);
    setBusy(false);
  };

  const enterDemo = async () => {
    setBusy(true); setError('');
    const { session, error: err } = await login('Antoine', 'SERVAL');
    if (err) setError(err);
    else if (session) onLogin(session);
    setBusy(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-visual">
        <div className="auth-visual-copy">
          <span className="eyebrow"><ShieldCheck size={15} /> Espace privé scout</span>
          <h1>SquadCraft<br /><em>Serval.</em></h1>
          <p>La gestion numérique de la Patrouille du Serval.</p>
        </div>
        <div className="auth-sun" />
        <div className="auth-forest forest-one" />
        <div className="auth-forest forest-two" />
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <img src="/image.png" alt="SquadCraft" className="auth-logo" />
          <span className="auth-kicker">SquadCraft</span>
          <h2>Connexion</h2>
          <p className="auth-intro">Saisis ton prénom et ton code d'accès.</p>
          <form onSubmit={submit} className="auth-form">
            <label>
              <span className="input-label">Prénom</span>
              <div className="input-wrap">
                <UserRound size={17} className="input-icon" />
                <input value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} placeholder="Ex: Antoine" required autoFocus />
              </div>
            </label>
            <label>
              <span className="input-label">Code d'accès</span>
              <div className="input-wrap">
                <ShieldCheck size={17} className="input-icon" />
                <input type={show ? 'text' : 'password'} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code d'accès" required />
                <button type="button" className="password-toggle" onClick={() => setShow((v) => !v)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            </label>
            {error && <p className="form-error">{error}</p>}
            {isLocalMode && <p className="local-mode-note"><strong>Mode simple activé</strong><br />Pour essayer : Antoine · SERVAL</p>}
            <button className="primary-button auth-submit" disabled={busy}>
              {busy ? <><Loader2 size={18} className="spin" /> Connexion…</> : <>Se connecter <ArrowUpRight size={18} /></>}
            </button>
            {isLocalMode && <button type="button" className="secondary-button auth-demo-button" onClick={enterDemo} disabled={busy}>Voir l’application <ChevronRight size={17} /></button>}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────── */

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [view, setView] = useState<View>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const parent = isParent(session);
  const cp = isCP(session);

  const navItems: { id: View; label: string; icon: typeof BarChart3 }[] = parent
    ? [
        { id: 'overview', label: 'Tableau de bord', icon: BarChart3 },
        { id: 'annonces', label: 'Annonces', icon: Megaphone },
        { id: 'weekends', label: 'Week-ends', icon: TentTree },
        { id: 'urgences', label: 'Urgences', icon: TriangleAlert },
      ]
    : [
        { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
        { id: 'annonces', label: 'Annonces', icon: Megaphone },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'members', label: 'Patrouillards', icon: Users },
        { id: 'weekends', label: 'Week-ends', icon: CalendarDays },
        { id: 'pharmacy', label: 'Pharmacie', icon: Heart },
        { id: 'materiel', label: 'Malle & Matériel', icon: Package },
        { id: 'courses', label: 'Courses', icon: ShoppingBag },
        { id: 'treasury', label: 'Trésorerie', icon: Wallet },
        { id: 'urgences', label: 'Urgences', icon: TriangleAlert },
        ...(cp ? [{ id: 'accounts' as View, label: 'Comptes & Accès', icon: UserCog }] : []),
        { id: 'settings', label: 'Paramètres', icon: Settings },
      ];

  const activeLabel = navItems.find((n) => n.id === view)?.label ?? 'Vue d\'ensemble';
  const selectView = (v: View) => { setView(v); setMobileOpen(false); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <img src={session.patrouille?.logo_url ?? '/image.png'} alt="Serval" className="brand-mark" />
          <div><strong>Squad</strong><span>Craft</span></div>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="sidebar-label">Navigation</div>
        <nav className="main-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'nav-item active' : 'nav-item'} onClick={() => selectView(id)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="profile-mini" onClick={onLogout}>
            <span className={`avatar avatar-${avatarColor(session.user.role)}`}>{initials(session.user.prenom)}</span>
            <span><b>{session.user.prenom}</b><small>{session.user.role}</small></span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Fermer" />}
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Menu"><Menu size={22} /></button>
          <div className="breadcrumb"><span>SquadCraft</span><ChevronRight size={15} /><b>{activeLabel}</b></div>
          <div className="topbar-actions">
            <button className="icon-button logout-button" onClick={onLogout} aria-label="Déconnexion"><LogOut size={18} /></button>
          </div>
        </header>
        <div className="content-wrap">
          {view === 'overview' && <Overview session={session} onNavigate={selectView} />}
          {view === 'annonces' && <Annonces session={session} onToast={setToast} />}
          {view === 'chat' && <Chat session={session} onToast={setToast} />}
          {view === 'members' && <Members session={session} onToast={setToast} />}
          {view === 'weekends' && <Weekends session={session} onToast={setToast} />}
          {view === 'pharmacy' && <Pharmacy session={session} onToast={setToast} />}
          {view === 'materiel' && <MaterielView session={session} onToast={setToast} />}
          {view === 'courses' && <Courses session={session} onToast={setToast} />}
          {view === 'treasury' && <Treasury session={session} onToast={setToast} />}
          {view === 'urgences' && <Urgences session={session} />}
          {view === 'accounts' && <Accounts session={session} onToast={setToast} />}
          {view === 'settings' && <SettingsView session={session} onToast={setToast} />}
        </div>
      </main>
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────── */

function Overview({ session, onNavigate }: { session: Session; onNavigate: (v: View) => void }) {
  const [stats, setStats] = useState({ members: null as number | null, balance: null as number | null, toBuy: null as number | null, pharmacyAlerts: null as number | null, nextWeekend: null as string | null, lastAnnonce: null as string | null, unreadMessages: null as number | null });
  const [children, setChildren] = useState<User[]>([]);
  const [childBadges, setChildBadges] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!session.patrouille) return;
    const pid = session.patrouille.id;
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      if (isParent(session)) {
        const [{ data: wk }, { data: an }, { data: relations }] = await Promise.all([
          supabase.from('weekends').select('*').eq('patrouille_id', pid).gte('date_debut', today).order('date_debut').limit(1),
          supabase.from('annonces').select('*').eq('patrouille_id', pid).order('created_at', { ascending: false }).limit(1),
          supabase.from('parent_relations').select('*').eq('parent_id', session.user.id),
        ]);
        setStats({ members: null, balance: null, toBuy: null, pharmacyAlerts: null, nextWeekend: wk?.[0]?.titre ?? null, lastAnnonce: an?.[0]?.titre ?? null, unreadMessages: null });
        const childIds = (relations as ParentRelation[] | null ?? []).map((relation) => relation.enfant_id);
        if (childIds.length === 0) {
          setChildren([]);
          setChildBadges({});
          return;
        }
        const [{ data: childUsers }, { data: userBadges }, { data: badges }] = await Promise.all([
          supabase.from('users').select('*').in('id', childIds).eq('statut', 'ACTIF'),
          supabase.from('user_badges').select('*').in('user_id', childIds),
          supabase.from('badges').select('*'),
        ]);
        setChildren(childUsers ?? []);
        const badgeNames = Object.fromEntries((badges ?? []).map((badge) => [badge.id, badge.nom]));
        const grouped: Record<string, string[]> = {};
        (userBadges ?? []).filter((badge) => badge.statut === 'VALIDE').forEach((badge) => {
          const name = badgeNames[badge.badge_id];
          if (name) grouped[badge.user_id] = [...(grouped[badge.user_id] ?? []), name];
        });
        setChildBadges(grouped);
        return;
      }
      const [{ count: m }, { count: mb }, { count: pa }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('patrouille_id', pid).neq('role', 'PARENT').eq('statut', 'ACTIF'),
        supabase.from('materiels').select('*', { count: 'exact', head: true }).eq('patrouille_id', pid).in('statut', ['A_ACHETER', 'A_REMPLACER']),
        supabase.from('pharmacies').select('*', { count: 'exact', head: true }).eq('patrouille_id', pid).lt('date_peremption', today),
      ]);
      const { data: tx } = await supabase.from('transactions').select('*').eq('patrouille_id', pid);
      const bal = (tx ?? []).reduce((s, t) => s + (t.type === 'ENTREE' ? t.montant : -t.montant), 0);
      const { data: wk } = await supabase.from('weekends').select('*').eq('patrouille_id', pid).gte('date_debut', today).order('date_debut').limit(1);
      const { data: an } = await supabase.from('annonces').select('*').eq('patrouille_id', pid).order('created_at', { ascending: false }).limit(1);
      setStats({
        members: m ?? 0, balance: bal, toBuy: mb ?? 0, pharmacyAlerts: pa ?? 0,
        nextWeekend: wk?.[0]?.titre ?? null,
        lastAnnonce: an?.[0]?.titre ?? null,
        unreadMessages: null,
      });

    })();
  }, [session]);

  if (isParent(session)) {
    return (
      <>
        <PageHeading eyebrow="Espace parent" title={`Bonjour ${session.user.prenom}`} description="Voici les informations utiles pour le Serval." />
        <div className="stats-grid">
          <div className="stat-card green"><div className="stat-card-top"><span>Week-ends à venir</span><span className="stat-icon"><TentTree size={19} /></span></div><strong>{stats.nextWeekend ? 'Planifié' : '—'}</strong><small>{stats.nextWeekend ?? 'Aucun'}</small></div>
          <div className="stat-card gold"><div className="stat-card-top"><span>Dernière annonce</span><span className="stat-icon"><Megaphone size={19} /></span></div><strong>{stats.lastAnnonce ? 'Nouvelle' : '—'}</strong><small>{stats.lastAnnonce ?? 'Aucune'}</small></div>
        </div>
        <button className="primary-button" onClick={() => onNavigate('weekends')} style={{ marginTop: '20px' }}><TentTree size={18} /> Voir les week-ends</button>
        <section className="panel" style={{ marginTop: '24px' }}>
          <div className="panel-heading"><div><span className="eyebrow">Suivi famille</span><h2>Informations sur vos enfants</h2></div></div>
          {children.length === 0 ? <p className="panel-footnote">Aucun enfant n’est encore associé à ce compte.</p> : (
            <div className="children-list">
              {children.map((child) => (
                <div className="child-row" key={child.id}>
                  <span className={`avatar avatar-${avatarColor(child.role)}`}>{initials(child.prenom)}</span>
                  <div><b>{child.prenom}</b><small>{placeLabel(child.place)} · {progressionLabel(child.progression) || 'Progression à venir'}</small></div>
                  <span className="child-badges">{childBadges[child.id]?.length ? `${childBadges[child.id].length} badge${childBadges[child.id].length > 1 ? 's' : ''}` : 'Aucun badge validé'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeading eyebrow={session.patrouille?.nom ?? 'SquadCraft'} title={`Bonjour ${session.user.prenom}`} description="Voici l'état de la Patrouille du Serval." />
      <div className="stats-grid">
        <div className="stat-card green"><div className="stat-card-top"><span>Caisse</span><span className="stat-icon"><Wallet size={19} /></span></div><strong>{stats.balance != null ? `${stats.balance.toFixed(2)} €` : '—'}</strong><small>Solde actuel</small></div>
        <div className="stat-card gold"><div className="stat-card-top"><span>Membres</span><span className="stat-icon"><Users size={19} /></span></div><strong>{stats.members ?? '—'}</strong><small>Patrouillards actifs</small></div>
        <div className="stat-card blue"><div className="stat-card-top"><span>Matériel</span><span className="stat-icon"><Package size={19} /></span></div><strong>{stats.toBuy ?? '—'}</strong><small>Achats nécessaires</small></div>
        <div className="stat-card coral"><div className="stat-card-top"><span>Pharmacie</span><span className="stat-icon"><Heart size={19} /></span></div><strong>{stats.pharmacyAlerts ?? '—'}</strong><small>Alertes péremption</small></div>
      </div>
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">Prochain week-end</span><h2>{stats.nextWeekend ?? 'Aucun planifié'}</h2></div><button className="text-button" onClick={() => onNavigate('weekends')}>Voir <ArrowUpRight size={16} /></button></div>
          <p className="panel-footnote"><TentTree size={15} /> Consulte les dates, lieux et checklists.</p>
        </section>
        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">Dernière annonce</span><h2>{stats.lastAnnonce ?? 'Aucune'}</h2></div><button className="text-button" onClick={() => onNavigate('annonces')}>Voir <ArrowUpRight size={16} /></button></div>
          <p className="panel-footnote"><Megaphone size={15} /> Reste informé des actualités du Serval.</p>
        </section>
      </div>
    </>
  );
}

/* ── Annonces ─────────────────────────────────────────── */

function Annonces({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState<Annonce | null>(null);
  const [form, setForm] = useState({ titre: '', contenu: '', imageUrl: '' });

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('annonces').select('*').eq('patrouille_id', session.patrouille.id).order('created_at', { ascending: false });
    setAnnonces(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.contenu.trim() || !session.patrouille) return;
    const payload = {
      titre: form.titre.trim(), contenu: form.contenu.trim(),
      image_url: form.imageUrl.trim() || null,
    };
    const { error } = editingAnnonce
      ? await supabase.from('annonces').update(payload).eq('id', editingAnnonce.id)
      : await supabase.from('annonces').insert({ ...payload, auteur_id: session.user.id, patrouille_id: session.patrouille.id });
    if (error) { onToast('Erreur'); return; }
    setForm({ titre: '', contenu: '', imageUrl: '' }); setShowAdd(false); setEditingAnnonce(null);
    onToast(editingAnnonce ? 'Annonce modifiée' : 'Annonce publiée'); load();
  };

  const del = async (id: string) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    const { error } = await supabase.from('annonces').delete().eq('id', id);
    if (error) { onToast('Impossible de supprimer cette annonce'); return; }
    onToast('Annonce supprimée'); load();
  };

  const startEdit = (annonce: Annonce) => {
    setEditingAnnonce(annonce);
    setForm({ titre: annonce.titre, contenu: annonce.contenu, imageUrl: annonce.image_url ?? '' });
    setShowAdd(true);
  };

  const canManage = canManageAnnonces(session);

  return (
    <>
      <PageHeading eyebrow="Actualités" title="Annonces" description="Les communications de la patrouille." action={canManage ? <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={18} /> Publier</button> : undefined} />
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : annonces.length === 0 ? <div className="empty-state"><Megaphone size={40} /><p>Aucune annonce pour l'instant.</p></div>
        : (
          <div className="annonces-list">
            {annonces.map((a) => (
              <div className="annonce-card" key={a.id}>
                <div className="annonce-header">
                  <div><span className="eyebrow">{new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span><h2>{a.titre}</h2></div>
                  {canManage && <div className="card-actions"><button className="row-menu" onClick={() => startEdit(a)}>Modifier</button><button className="row-menu" onClick={() => del(a.id)}><X size={16} /></button></div>}
                </div>
                <p className="annonce-contenu">{a.contenu}</p>
                {a.image_url && <img src={a.image_url} alt={a.titre} className="annonce-image" />}
              </div>
            ))}
          </div>
        )}
      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">{editingAnnonce ? 'Modifier l’annonce' : 'Nouvelle annonce'}</span><h2>{editingAnnonce ? 'Modifier' : 'Publier'}</h2></div><button className="icon-button" onClick={() => { setShowAdd(false); setEditingAnnonce(null); }}><X size={18} /></button></div>
            <form onSubmit={add}>
              <label>Titre<input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Matériel du week-end" autoFocus /></label>
              <label>Contenu<textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} placeholder="N'oubliez pas les scies et les outils." rows={4} /></label>
              <label>Image (URL, optionnel)<input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => { setShowAdd(false); setEditingAnnonce(null); }}>Annuler</button><button className="primary-button" disabled={!form.titre.trim() || !form.contenu.trim()}><Check size={17} /> {editingAnnonce ? 'Enregistrer' : 'Publier'}</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Chat ────────────────────────────────────────────── */

function Chat({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [showClear, setShowClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data: msgs } = await supabase.from('messages').select('*').eq('patrouille_id', session.patrouille.id).order('created_at', { ascending: true });
    setMessages(msgs ?? []);
    const { data: us } = await supabase.from('users').select('*').eq('patrouille_id', session.patrouille.id);
    const map: Record<string, User> = {};
    (us ?? []).forEach((u) => { map[u.id] = u; });
    setUsers(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !session.patrouille) return;
    const { error } = await supabase.from('messages').insert({
      auteur_id: session.user.id, patrouille_id: session.patrouille.id, contenu: text.trim(),
      image_url: imageUrl.trim() || null,
    });
    if (error) { onToast('Erreur'); return; }
    setText(''); setImageUrl(''); load();
  };

  const delMsg = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
    load();
  };

  const clearHistory = async () => {
    if (!session.patrouille) return;
    await supabase.from('messages').delete().eq('patrouille_id', session.patrouille.id);
    setShowClear(false);
    onToast('Historique vidé');
    load();
  };

  const canMod = canManageChat(session);

  return (
    <>
      <PageHeading eyebrow="Patrouille" title="Chat du Serval" description="Messagerie privée de la patrouille." action={canMod ? <button className="secondary-button" onClick={() => setShowClear(true)}><TriangleAlert size={16} /> Vider l'historique</button> : undefined} />
      <div className="chat-container">
        <div className="chat-messages" ref={scrollRef}>
          {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
            : messages.length === 0 ? <div className="empty-state"><MessageSquare size={40} /><p>Aucun message. Lance la conversation !</p></div>
            : messages.map((m) => {
              const author = users[m.auteur_id ?? ''];
              const isMe = m.auteur_id === session.user.id;
              return (
                <div className={`chat-msg ${isMe ? 'me' : ''}`} key={m.id}>
                   <span className={`avatar avatar-${avatarColor(author?.role ?? 'MEMBRE')}`}>{author?.photo_url ? <img src={author.photo_url} alt="" /> : initials(author?.prenom ?? '?')}</span>
                  <div className="chat-msg-body">
                    <div className="chat-msg-header"><b>{author?.prenom ?? 'Inconnu'}</b><small>{new Date(m.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div>
                    <p>{m.contenu}</p>
                     {m.image_url && <img src={m.image_url} alt="Image partagée dans le chat" className="chat-image" />}
                    {canMod && <button className="chat-delete" onClick={() => delMsg(m.id)}><X size={12} /></button>}
                  </div>
                </div>
              );
            })
          }
        </div>
        <form className="chat-input-bar" onSubmit={send}>
           <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écris ton message…" />
           <input className="chat-image-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL image" aria-label="URL d'une image" />
          <button className="primary-button" type="submit" disabled={!text.trim()}><ArrowUpRight size={18} /></button>
        </form>
      </div>
      {showClear && (
        <div className="modal-backdrop" onMouseDown={() => setShowClear(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Attention</span><h2>Vider l'historique</h2></div><button className="icon-button" onClick={() => setShowClear(false)}><X size={18} /></button></div>
            <p style={{ color: '#84938a', fontSize: '13px', lineHeight: 1.6 }}>Voulez-vous vraiment supprimer tout l'historique du chat ? Cette action est irréversible.</p>
            <div className="modal-actions"><button className="secondary-button" onClick={() => setShowClear(false)}>Annuler</button><button className="primary-button danger" onClick={clearHistory}><TriangleAlert size={17} /> Supprimer</button></div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Members ──────────────────────────────────────────── */

function Members({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ prenom: '', code: '', role: 'MEMBRE', place: 'AUTRE', roleTechnique: 'AUCUN', allergies: '' });
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('users').select('*').eq('patrouille_id', session.patrouille.id).neq('role', 'PARENT').order('created_at');
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom.trim() || !form.code.trim() || !session.patrouille) return;
    const { error } = await supabase.from('users').insert({
      prenom: form.prenom.trim(), code_secret: form.code.trim(), role: form.role,
      place: form.place, role_technique: form.roleTechnique,
      aspirations: form.allergies.trim() || null, patrouille_id: session.patrouille.id, statut: 'ACTIF',
    });
    if (error) { onToast(error.message.includes('duplicate') ? 'Ce code existe déjà' : 'Erreur'); return; }
    setForm({ prenom: '', code: '', role: 'MEMBRE', place: 'AUTRE', roleTechnique: 'AUCUN', allergies: '' });
    setShowAdd(false); onToast('Membre ajouté'); load();
  };

  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    onToast('Membre supprimé'); load();
  };

  const filtered = users.filter((u) => u.prenom.toLowerCase().includes(search.toLowerCase()));
  const canManage = canManageMembers(session);

  return (
    <>
      <PageHeading eyebrow="Annuaire" title="Patrouillards" description="Les membres, leurs places, rôles et progressions." action={canManage ? <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={18} /> Ajouter</button> : undefined} />
      <div className="member-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher" /></div></div>
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : filtered.length === 0 ? <div className="empty-state"><Users size={40} /><p>{canManage ? 'Aucun membre. Clique sur « Ajouter ».' : 'Aucun membre.'}</p></div>
        : (
          <div className="members-grid">
            {filtered.map((u) => (
              <div className="member-card" key={u.id} onClick={() => setEditingUser(u)} style={{ cursor: 'pointer' }}>
                <div className="member-card-top">
                  <span className={`avatar avatar-${avatarColor(u.role)}`}>{u.photo_url ? <img src={u.photo_url} alt="" /> : initials(u.prenom)}</span>
                  {canManage && u.role !== 'CP' && <button className="more-button" onClick={(e) => { e.stopPropagation(); deleteUser(u.id); }}><X size={16} /></button>}
                  {u.statut === 'DESACTIVE' && <span className="status-dot disabled" />}
                </div>
                <h3>{u.prenom}</h3>
                <p>{placeLabel(u.place)} · {u.role}</p>
                <span className="role-tag">{u.role_technique !== 'AUCUN' ? roleTechLabel(u.role_technique) : u.role}</span>
                {u.progression !== 'AUCUNE' && <span className="progression-badge">{progressionLabel(u.progression)}</span>}
              </div>
            ))}
          </div>
        )}
      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Nouveau membre</span><h2>Ajouter un patrouillard</h2></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <form onSubmit={addUser}>
              <label>Prénom<input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} placeholder="Ex: Antoine" autoFocus /></label>
              <label>Code d'accès<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ex: ANTOINE-2026" /></label>
              <div className="form-row">
                <label>Rôle<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="MEMBRE">Membre</option><option value="SP">Second</option><option value="HP">HP</option></select></label>
                <label>Place<select value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}><option value="AUTRE">Autre</option><option value="CP">CP</option><option value="SP">SP</option><option value="TROISIEME">3e</option><option value="QUATRIEME">4e</option><option value="CINQUIEME">5e</option><option value="SIXIEME">6e</option><option value="SEPTIEME">7e</option><option value="HUITIEME">8e</option></select></label>
              </div>
              <label>Rôle technique<select value={form.roleTechnique} onChange={(e) => setForm({ ...form, roleTechnique: e.target.value })}><option value="AUCUN">Aucun</option><option value="INTENDANT">Intendant</option><option value="SECOURISTE">Secouriste</option><option value="TRESORIER">Trésorier</option><option value="MATERIALISTE">Matérialiste</option><option value="CUISINIER">Cuisinier</option><option value="MAITRE_FEU">Maître du feu</option><option value="RESP_PROPRETE">Resp. propreté</option><option value="TOPOGRAPHE">Topographe</option><option value="PIONNIER">Pionnier</option></select></label>
              <label>Allergies / infos (optionnel)<input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Ex: allergie piqûres de guêpes" /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowAdd(false)}>Annuler</button><button className="primary-button" disabled={!form.prenom.trim() || !form.code.trim()}><Check size={17} /> Ajouter</button></div>
            </form>
          </div>
        </div>
      )}
      {editingUser && <UserDetailModal user={editingUser} session={session} onClose={() => setEditingUser(null)} onToast={onToast} onUpdate={load} />}
    </>
  );
}

function UserDetailModal({ user, session, onClose, onToast, onUpdate }: { user: User; session: Session; onClose: () => void; onToast: (m: string) => void; onUpdate: () => void }) {
  const [aspirations, setAspirations] = useState(user.aspirations ?? '');
  const [progression, setProgression] = useState(user.progression);
  const [place, setPlace] = useState(user.place);
  const [roleTechnique, setRoleTechnique] = useState(user.role_technique);
  const [photoUrl, setPhotoUrl] = useState(user.photo_url ?? '');
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const canEdit = canManageMembers(session) || session.user.id === user.id;

  useEffect(() => {
    (async () => {
      const { data: ub } = await supabase.from('user_badges').select('*').eq('user_id', user.id);
      setUserBadges(ub ?? []);
      let { data: ab } = await supabase.from('badges').select('*').order('nom');
      if (!ab || ab.length === 0) {
        await supabase.from('badges').upsert(BADGE_CATALOG.map((nom) => ({ nom })), { onConflict: 'nom', ignoreDuplicates: true });
        const seeded = await supabase.from('badges').select('*').order('nom');
        ab = seeded.data;
      }
      setAllBadges(ab ?? []);
    })();
  }, [user.id]);

  const save = async () => {
    const changes: Record<string, unknown> = {
      aspirations: aspirations.trim() || null, progression,
    };
    if (canManageMembers(session)) {
      changes.place = place;
      changes.role_technique = roleTechnique;
      changes.photo_url = photoUrl.trim() || null;
    }
    const { error } = await supabase.from('users').update(changes).eq('id', user.id);
    if (error) { onToast('Erreur'); return; }
    onToast('Profil mis à jour'); onUpdate(); onClose();
  };

  const toggleBadge = async (badgeId: string, currentStatut: string | null) => {
    if (currentStatut) {
      await supabase.from('user_badges').delete().eq('user_id', user.id).eq('badge_id', badgeId);
    } else {
      await supabase.from('user_badges').insert({ user_id: user.id, badge_id: badgeId, statut: 'A_COMMENCER' });
    }
    const { data: ub } = await supabase.from('user_badges').select('*').eq('user_id', user.id);
    setUserBadges(ub ?? []);
  };

  const cycleBadgeStatut = async (badgeId: string, current: string) => {
    const next = current === 'A_COMMENCER' ? 'EN_COURS' : current === 'EN_COURS' ? 'VALIDE' : 'A_COMMENCER';
    await supabase.from('user_badges').update({ statut: next }).eq('user_id', user.id).eq('badge_id', badgeId);
    const { data: ub } = await supabase.from('user_badges').select('*').eq('user_id', user.id);
    setUserBadges(ub ?? []);
  };

  const badgeStatut = (badgeId: string) => userBadges.find((ub) => ub.badge_id === badgeId)?.statut ?? null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal modal-wide" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-heading"><div><span className="eyebrow">Fiche membre</span><h2>{user.prenom}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
        <div className="user-detail-info">
           <span className={`avatar avatar-${avatarColor(user.role)}`}>{user.photo_url ? <img src={user.photo_url} alt="" /> : initials(user.prenom)}</span>
          <div><b>{user.prenom}</b><small>{placeLabel(user.place)} · {user.role}</small>{user.role_technique !== 'AUCUN' && <small>{roleTechLabel(user.role_technique)}</small>}</div>
        </div>
        {canEdit ? (
          <>
            {canManageMembers(session) && (
              <>
                <div className="form-row">
                  <label>Place<select value={place} onChange={(e) => setPlace(e.target.value as User['place'])}><option value="AUTRE">Autre</option><option value="SP">SP</option><option value="TROISIEME">3e</option><option value="QUATRIEME">4e</option><option value="CINQUIEME">5e</option><option value="SIXIEME">6e</option><option value="SEPTIEME">7e</option><option value="HUITIEME">8e</option></select></label>
                  <label>Rôle technique<select value={roleTechnique} onChange={(e) => setRoleTechnique(e.target.value as User['role_technique'])}><option value="AUCUN">Aucun</option><option value="TOPOGRAPHE">Topographe</option><option value="TRESORIER">Trésorier</option><option value="MATERIALISTE">Matérialiste</option><option value="SECOURISTE">Secouriste</option><option value="INTENDANT">Intendant</option><option value="CUISINIER">Cuisinier</option><option value="MAITRE_FEU">Maître du feu</option><option value="RESP_PROPRETE">Resp. propreté</option><option value="PIONNIER">Pionnier</option></select></label>
                </div>
                <label>Photo (URL, optionnel)<input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" /></label>
              </>
            )}
            <label>Progression<select value={progression} onChange={(e) => setProgression(e.target.value as User['progression'])}><option value="AUCUNE">Aucune</option><option value="PROMESSE">Promesse</option><option value="ASPIRANCE">Aspirance</option><option value="SECONDE_CLASSE">Seconde classe</option><option value="PREMIERE_CLASSE">Première classe</option></select></label>
            <label>Aspirations / objectifs<textarea value={aspirations} onChange={(e) => setAspirations(e.target.value)} placeholder="Cette année je veux…" rows={3} /></label>
            {canManageMembers(session) && (
              <div className="badge-section">
                <span className="input-label">Badges de spécialité</span>
                <div className="badge-grid">
                  {BADGE_CATALOG.map((bn) => {
                    const st = badgeStatut(allBadges.find((b) => b.nom === bn)?.id ?? '');
                    return (
                      <button key={bn} className={`badge-chip ${st ? `badge-${st.toLowerCase()}` : ''}`} onClick={() => {
                        const bid = allBadges.find((b) => b.nom === bn)?.id;
                        if (bid) { if (st) cycleBadgeStatut(bid, st); else toggleBadge(bid, null); }
                      }}>
                        {st === 'VALIDE' && <Check size={12} />}{bn}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="modal-actions"><button className="primary-button" onClick={save}><Check size={17} /> Enregistrer</button></div>
          </>
        ) : (
          <>
            <div className="detail-row"><span className="input-label">Progression</span><b>{progressionLabel(user.progression)}</b></div>
            {user.aspirations && <div className="detail-row"><span className="input-label">Aspirations</span><p>{user.aspirations}</p></div>}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Weekends ─────────────────────────────────────────── */

function Weekends({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [weekends, setWeekends] = useState<Weekend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ titre: '', dateDebut: '', dateFin: '', lieuDepart: '', lieuRetour: '', gpsDepart: '', gpsRetour: '', affaires: '', urgences: '', notes: '' });

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('weekends').select('*').eq('patrouille_id', session.patrouille.id).order('date_debut');
    setWeekends(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim() || !session.patrouille) return;
    const { error } = await supabase.from('weekends').insert({
      titre: form.titre.trim(), date_debut: form.dateDebut || null, date_fin: form.dateFin || null,
      lieu_depart: form.lieuDepart || null, lieu_retour: form.lieuRetour || null,
      gps_depart: form.gpsDepart || null, gps_retour: form.gpsRetour || null,
      affaires: form.affaires || null, urgences: form.urgences || null, notes: form.notes || null,
      patrouille_id: session.patrouille.id,
    });
    if (error) { onToast('Erreur'); return; }
    setForm({ titre: '', dateDebut: '', dateFin: '', lieuDepart: '', lieuRetour: '', gpsDepart: '', gpsRetour: '', affaires: '', urgences: '', notes: '' });
    setShowAdd(false); onToast('Week-end créé'); load();
  };

  const del = async (id: string) => {
    await supabase.from('weekends').delete().eq('id', id);
    onToast('Week-end supprimé'); load();
  };

  const canManage = canManageLogistics(session);
  const openGPS = (lieu: string) => window.open(`https://www.google.com/maps?q=${encodeURIComponent(lieu)}`, '_blank');

  return (
    <>
      <PageHeading eyebrow="Activités" title="Week-ends" description="Dates, lieux GPS, affaires et urgences." action={canManage ? <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={18} /> Planifier</button> : undefined} />
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : weekends.length === 0 ? <div className="empty-state"><TentTree size={40} /><p>Aucun week-end planifié.</p></div>
        : (
          <div className="weekend-detail">
            {weekends.map((w) => (
              <div className="weekend-info-card" key={w.id}>
                <div className="weekend-header"><div><span className="eyebrow">Week-end</span><h2>{w.titre}</h2></div>{canManage && <button className="row-menu" onClick={() => del(w.id)}><X size={16} /></button>}</div>
                <div className="weekend-info-row"><CalendarDays size={20} /><div><span className="input-label">Début</span><b>{w.date_debut ? new Date(w.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'À définir'}</b></div></div>
                <div className="weekend-info-row"><CalendarDays size={20} /><div><span className="input-label">Fin</span><b>{w.date_fin ? new Date(w.date_fin).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'À définir'}</b></div></div>
                 {w.lieu_depart && <div className="weekend-info-row"><Navigation size={20} /><div><span className="input-label">Départ</span><b>{w.lieu_depart}</b>{w.gps_depart && <small>{w.gps_depart}</small>}</div><button className="gps-button-small" onClick={() => openGPS(w.gps_depart || w.lieu_depart!)}><Navigation size={15} /> GPS</button></div>}
                 {w.lieu_retour && <div className="weekend-info-row"><MapPin size={20} /><div><span className="input-label">Retour</span><b>{w.lieu_retour}</b>{w.gps_retour && <small>{w.gps_retour}</small>}</div><button className="gps-button-small" onClick={() => openGPS(w.gps_retour || w.lieu_retour!)}><MapPin size={15} /> GPS</button></div>}
                {w.affaires && <div className="weekend-section"><span className="input-label">Affaires à prendre</span><p className="checklist-text">{w.affaires}</p></div>}
                {w.urgences && <div className="weekend-section alert"><TriangleAlert size={15} /><p>{w.urgences}</p></div>}
                 {w.notes && <div className="weekend-section"><span className="input-label">Notes</span><p className="checklist-text">{w.notes}</p></div>}
              </div>
            ))}
          </div>
        )}
      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <div className="modal modal-wide" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Nouveau week-end</span><h2>Planifier</h2></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <form onSubmit={add}>
              <label>Titre<input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Week-end de rentrée" autoFocus /></label>
              <div className="form-row"><label>Début<input type="datetime-local" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} /></label><label>Fin<input type="datetime-local" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} /></label></div>
              <div className="form-row"><label>Lieu de départ<input value={form.lieuDepart} onChange={(e) => setForm({ ...form, lieuDepart: e.target.value })} placeholder="Ex: Parking du local" /></label><label>Lieu de retour<input value={form.lieuRetour} onChange={(e) => setForm({ ...form, lieuRetour: e.target.value })} placeholder="Ex: Forêt" /></label></div>
               <div className="form-row"><label>GPS départ<input value={form.gpsDepart} onChange={(e) => setForm({ ...form, gpsDepart: e.target.value })} placeholder="Adresse ou coordonnées" /></label><label>GPS retour<input value={form.gpsRetour} onChange={(e) => setForm({ ...form, gpsRetour: e.target.value })} placeholder="Adresse ou coordonnées" /></label></div>
              <label>Affaires (une par ligne)<textarea value={form.affaires} onChange={(e) => setForm({ ...form, affaires: e.target.value })} placeholder={'Duvet\nGamelle\nBottes'} rows={4} /></label>
              <label>Urgences / infos (optionnel)<textarea value={form.urgences} onChange={(e) => setForm({ ...form, urgences: e.target.value })} placeholder="Ex: Contact d'urgence" rows={2} /></label>
               <label>Notes (optionnel)<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informations pratiques supplémentaires" rows={2} /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowAdd(false)}>Annuler</button><button className="primary-button" disabled={!form.titre.trim()}><Check size={17} /> Créer</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Pharmacy ─────────────────────────────────────────── */

function Pharmacy({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [items, setItems] = useState<Pharmacie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nom: '', categorie: 'BOBOLOGIE', quantite: '1', datePeremption: '' });

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('pharmacies').select('*').eq('patrouille_id', session.patrouille.id).order('categorie').order('nom');
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !session.patrouille) return;
    const { error } = await supabase.from('pharmacies').insert({
      nom: form.nom.trim(), categorie: form.categorie, quantite: parseInt(form.quantite) || 1,
      date_peremption: form.datePeremption || null, patrouille_id: session.patrouille.id,
    });
    if (error) { onToast('Erreur'); return; }
    setForm({ nom: '', categorie: 'BOBOLOGIE', quantite: '1', datePeremption: '' });
    setShowAdd(false); onToast('Produit ajouté'); load();
  };

  const del = async (id: string) => {
    await supabase.from('pharmacies').delete().eq('id', id);
    onToast('Produit supprimé'); load();
  };

  const updateQty = async (item: Pharmacie, delta: number) => {
    await supabase.from('pharmacies').update({ quantite: Math.max(0, item.quantite + delta) }).eq('id', item.id);
    load();
  };

  const canManage = canManageLogistics(session);
  const today = new Date().toISOString().split('T')[0];
  const soon = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const cats = [{ k: 'BOBOLOGIE', l: 'Bobologie & Soins' }, { k: 'TRAUMATOLOGIE', l: 'Traumatologie' }, { k: 'MEDICAMENTS', l: 'Médicaments' }];

  return (
    <>
      <PageHeading eyebrow="Secourisme" title="Trousse à pharmacie" description="Inventaire et alertes de péremption." action={canManage ? <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={18} /> Ajouter</button> : undefined} />
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : items.length === 0 ? <div className="empty-state"><Heart size={40} /><p>Aucun produit dans la pharmacie.</p></div>
        : cats.map((cat) => {
          const ci = items.filter((i) => i.categorie === cat.k);
          if (ci.length === 0) return null;
          return (
            <section className="panel" key={cat.k} style={{ marginBottom: '20px' }}>
              <div className="panel-heading"><div><span className="eyebrow">{cat.l}</span><h2>{ci.length} produit{ci.length > 1 ? 's' : ''}</h2></div></div>
              <div className="pharmacy-list">
                {ci.map((item) => {
                  const exp = item.date_peremption && item.date_peremption < today;
                  const soonExp = item.date_peremption && item.date_peremption >= today && item.date_peremption <= soon;
                  return (
                    <div className={`pharmacy-row ${exp ? 'expired' : soonExp ? 'expiring' : ''}`} key={item.id}>
                      <div className="pharmacy-info">
                        <b>{item.nom}</b>
                        <small>Quantité: {item.quantite}{item.date_peremption && ` · Péremption: ${new Date(item.date_peremption).toLocaleDateString('fr-FR')}`}</small>
                        {exp && <span className="expiry-badge"><TriangleAlert size={12} /> Périmé</span>}
                        {soonExp && !exp && <span className="expiry-badge warning"><Bell size={12} /> Bientôt périmé</span>}
                      </div>
                      {canManage && <div className="pharmacy-actions"><button className="qty-btn" onClick={() => updateQty(item, -1)}>−</button><button className="qty-btn" onClick={() => updateQty(item, 1)}>+</button><button className="row-menu" onClick={() => del(item.id)}><X size={14} /></button></div>}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Pharmacie</span><h2>Ajouter un produit</h2></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <form onSubmit={add}>
              <label>Nom<input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Compresses stériles" autoFocus /></label>
              <div className="form-row"><label>Catégorie<select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}><option value="BOBOLOGIE">Bobologie</option><option value="TRAUMATOLOGIE">Traumatologie</option><option value="MEDICAMENTS">Médicaments</option></select></label><label>Quantité<input type="number" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} /></label></div>
              <label>Date de péremption<input type="date" value={form.datePeremption} onChange={(e) => setForm({ ...form, datePeremption: e.target.value })} /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowAdd(false)}>Annuler</button><button className="primary-button" disabled={!form.nom.trim()}><Check size={17} /> Ajouter</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Materiel ─────────────────────────────────────────── */

function MaterielView({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [items, setItems] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nom: '', categorie: 'TENTES', statut: 'EN_STOCK', quantite: '1', prixEstime: '', fournisseur: '', notes: '' });

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('materiels').select('*').eq('patrouille_id', session.patrouille.id).order('statut').order('nom');
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !session.patrouille) return;
    const { error } = await supabase.from('materiels').insert({
      nom: form.nom.trim(), categorie: form.categorie, statut: form.statut, quantite: parseInt(form.quantite) || 1,
      prix_estime: form.prixEstime ? parseFloat(form.prixEstime) : null, fournisseur: form.fournisseur || null,
      notes: form.notes || null, patrouille_id: session.patrouille.id,
    });
    if (error) { onToast('Erreur'); return; }
    setForm({ nom: '', categorie: 'TENTES', statut: 'EN_STOCK', quantite: '1', prixEstime: '', fournisseur: '', notes: '' });
    setShowAdd(false); onToast('Matériel ajouté'); load();
  };

  const updateStatut = async (item: Materiel, statut: string) => {
    await supabase.from('materiels').update({ statut }).eq('id', item.id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from('materiels').delete().eq('id', id);
    onToast('Supprimé'); load();
  };

  const canManage = canManageLogistics(session);
  const statuts = [{ k: 'EN_STOCK', l: 'En stock', c: 'green' }, { k: 'A_REPARER', l: 'À réparer', c: 'gold' }, { k: 'A_REMPLACER', l: 'À remplacer', c: 'coral' }, { k: 'A_ACHETER', l: 'À acheter', c: 'blue' }];
  const toBuy = items.filter((i) => i.statut === 'A_ACHETER' || i.statut === 'A_REMPLACER');
  const totalEstimate = toBuy.reduce((s, i) => s + (i.prix_estime ?? 0) * i.quantite, 0);

  const validatePurchase = async (item: Materiel) => {
    if (!item.prix_estime || item.prix_estime <= 0 || !session.patrouille) {
      onToast('Ajoute un prix estimé avant de valider l’achat');
      return;
    }
    const { error: transactionError } = await supabase.from('transactions').insert({
      titre: `Matériel : ${item.nom}`,
      montant: item.prix_estime * item.quantite,
      type: 'DEPENSE',
      categorie: 'MATERIEL',
      patrouille_id: session.patrouille.id,
    });
    if (transactionError) { onToast('Dépense non enregistrée'); return; }
    const { error } = await supabase.from('materiels').update({ statut: 'EN_STOCK' }).eq('id', item.id);
    if (error) { onToast('Achat enregistré, statut à vérifier'); return; }
    onToast('Achat validé — dépense enregistrée'); load();
  };

  return (
    <>
      <PageHeading eyebrow="Logistique" title="Malle & Matériel" description="Inventaire de l'équipement." action={canManage ? <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={18} /> Ajouter</button> : undefined} />
      {toBuy.length > 0 && (
        <div className="panel" style={{ marginBottom: '20px', background: '#fef9ed', borderColor: '#eab747' }}>
          <div className="panel-heading"><div><span className="eyebrow">Liste d'achats</span><h2>{toBuy.length} objet{toBuy.length > 1 ? 's' : ''} · {totalEstimate.toFixed(2)} €</h2></div></div>
          <div className="pharmacy-list">
            {toBuy.map((item) => (
              <div className="pharmacy-row" key={item.id}>
                 <div className="pharmacy-info"><b>{item.nom}</b><small>Qté : {item.quantite}{item.prix_estime ? ` · ${item.prix_estime} € / unité` : ''}{item.fournisseur ? ` · ${item.fournisseur}` : ''}</small></div>
                 {canManage && <button className="secondary-button" onClick={() => validatePurchase(item)}><Check size={14} /> Achat validé</button>}
              </div>
            ))}
          </div>
        </div>
      )}
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : items.length === 0 ? <div className="empty-state"><Package size={40} /><p>Aucun matériel.</p></div>
        : (
          <div className="table-panel">
            <div className="inventory-table">
              <div className="table-header"><span>Article</span><span>Catégorie</span><span>Statut</span><span /></div>
              {items.map((item) => (
                <div className="table-row" key={item.id}>
                  <div className="item-name"><span className="item-icon"><Package size={18} /></span><span><b>{item.nom}</b><small>Qt: {item.quantite}{item.prix_estime ? ` · ${item.prix_estime} €` : ''}</small></span></div>
                  <span className="location">{item.categorie}</span>
                  {canManage ? <select className="status-select" value={item.statut} onChange={(e) => updateStatut(item, e.target.value)}>{statuts.map((s) => <option key={s.k} value={s.k}>{s.l}</option>)}</select>
                    : <span className={`status status-${statuts.find((s) => s.k === item.statut)?.c ?? 'green'}`}><i />{statuts.find((s) => s.k === item.statut)?.l ?? item.statut}</span>}
                  {canManage && <button className="row-menu" onClick={() => del(item.id)}><X size={14} /></button>}
                </div>
              ))}
            </div>
          </div>
        )}
      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Matériel</span><h2>Ajouter</h2></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <form onSubmit={add}>
              <label>Nom<input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Tente 6 places" autoFocus /></label>
              <div className="form-row"><label>Catégorie<select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}><option value="TENTES">Tentes</option><option value="FROISSARTAGE">Froissartage</option><option value="OUTILLAGE">Outillage</option><option value="POPOTE">Popote</option><option value="FEU">Feu</option><option value="CAMPEMENT">Campement</option><option value="DIVERS">Divers</option></select></label><label>Statut<select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}><option value="EN_STOCK">En stock</option><option value="A_REPARER">À réparer</option><option value="A_REMPLACER">À remplacer</option><option value="A_ACHETER">À acheter</option></select></label></div>
              <div className="form-row"><label>Quantité<input type="number" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} /></label><label>Prix estimé (€)<input type="number" value={form.prixEstime} onChange={(e) => setForm({ ...form, prixEstime: e.target.value })} placeholder="0" /></label></div>
              <label>Fournisseur<input value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} placeholder="Ex: Decathlon" /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowAdd(false)}>Annuler</button><button className="primary-button" disabled={!form.nom.trim()}><Check size={17} /> Ajouter</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Courses ──────────────────────────────────────────── */

function Courses({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newEstimate, setNewEstimate] = useState('');

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').eq('patrouille_id', session.patrouille.id).order('achete').order('created_at');
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const add = async () => {
    if (!newItem.trim() || !session.patrouille) return;
    const { error } = await supabase.from('courses').insert({
      nom: newItem.trim(), quantite: 1,
      montant_estime: newEstimate ? parseFloat(newEstimate) : null,
      patrouille_id: session.patrouille.id,
    });
    if (error) { onToast('Erreur'); return; }
    setNewItem(''); setNewEstimate(''); onToast('Ajouté'); load();
  };

  const toggle = async (item: Course) => {
    await supabase.from('courses').update({ achete: !item.achete }).eq('id', item.id);
    load();
  };

  const validate = async (item: Course) => {
    if (!item.montant_reel || item.valide) return;
    await supabase.from('courses').update({ valide: true }).eq('id', item.id);
    if (session.patrouille) {
      await supabase.from('transactions').insert({ titre: `Courses: ${item.nom}`, montant: item.montant_reel, type: 'DEPENSE', categorie: 'COURSES', patrouille_id: session.patrouille.id });
    }
    onToast('Course validée — dépense enregistrée'); load();
  };

  const remove = async (id: string) => {
    await supabase.from('courses').delete().eq('id', id);
    load();
  };

  const canManage = canManageLogistics(session);
  const estimatedTotal = items.reduce((sum, item) => sum + (item.montant_estime ?? 0) * item.quantite, 0);

  return (
    <>
      <PageHeading eyebrow="Intendance" title="Courses" description="Liste de courses et validation des dépenses." />
      <div className="add-checklist-row" style={{ marginBottom: '20px' }}>
        <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Ex: Pain" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
        <input type="number" step="0.01" value={newEstimate} onChange={(e) => setNewEstimate(e.target.value)} placeholder="Estimé €" aria-label="Montant estimé" />
        <button className="primary-button" onClick={add}><Plus size={16} /> Ajouter</button>
      </div>
      {items.length > 0 && <p className="list-summary"><ShoppingBag size={15} /> {items.filter((item) => !item.achete).length} article{items.filter((item) => !item.achete).length > 1 ? 's' : ''} restant{items.filter((item) => !item.achete).length > 1 ? 's' : ''} · estimé {estimatedTotal.toFixed(2)} €</p>}
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : items.length === 0 ? <div className="empty-state"><ShoppingBag size={40} /><p>La liste est vide.</p></div>
        : (
          <div className="task-list">
            {items.map((i) => (
              <div className={`task-item ${i.achete ? 'done' : ''}`} key={i.id}>
                <button className="task-check" onClick={() => toggle(i)}>{i.achete && <Check size={14} />}</button>
                <span><b>{i.nom}</b><small>{i.quantite > 1 ? `Qté : ${i.quantite} · ` : ''}{i.montant_estime ? `Estimé : ${i.montant_estime.toFixed(2)} €` : 'Pas d’estimation'}</small></span>
                {canManage && !i.valide && i.achete && <input type="number" step="0.01" placeholder="Prix réel €" onBlur={(e) => supabase.from('courses').update({ montant_reel: parseFloat(e.target.value) || null }).eq('id', i.id).then(() => load())} style={{ width: '90px' }} />}
                {canManage && !i.valide && i.achete && <input className="ticket-input" value={i.ticket_url ?? ''} onChange={(e) => setItems((current) => current.map((course) => course.id === i.id ? { ...course, ticket_url: e.target.value } : course))} onBlur={(e) => supabase.from('courses').update({ ticket_url: e.target.value.trim() || null }).eq('id', i.id)} placeholder="Ticket URL" aria-label={`Ticket de ${i.nom}`} />}
                {canManage && i.achete && i.montant_reel && !i.valide && <button className="primary-button" onClick={() => validate(i)}><Check size={14} /> Valider</button>}
                {i.valide && <span className="role-tag" style={{ marginLeft: 'auto' }}>Validé {i.montant_reel}€</span>}
                {canManage && <button className="row-menu" onClick={() => remove(i.id)}><X size={14} /></button>}
              </div>
            ))}
          </div>
        )}
    </>
  );
}

/* ── Treasury ─────────────────────────────────────────── */

function Treasury({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ titre: '', montant: '', type: 'DEPENSE', categorie: 'AUTRE_DEPENSE' });

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('transactions').select('*').eq('patrouille_id', session.patrouille.id).order('date', { ascending: false });
    setTransactions(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.montant || !session.patrouille) return;
    const { error } = await supabase.from('transactions').insert({
      titre: form.titre.trim(), montant: parseFloat(form.montant), type: form.type, categorie: form.categorie,
      patrouille_id: session.patrouille.id,
    });
    if (error) { onToast('Erreur'); return; }
    setForm({ titre: '', montant: '', type: 'DEPENSE', categorie: 'AUTRE_DEPENSE' });
    setShowAdd(false); onToast('Opération enregistrée'); load();
  };

  const del = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    load();
  };

  const canManage = canManageTreasury(session);
  const balance = transactions.reduce((s, t) => s + (t.type === 'ENTREE' ? t.montant : -t.montant), 0);
  const entrees = transactions.filter((t) => t.type === 'ENTREE').reduce((s, t) => s + t.montant, 0);
  const depenses = transactions.filter((t) => t.type === 'DEPENSE').reduce((s, t) => s + t.montant, 0);

  // Chart data: group by month
  const monthlyData: Record<string, { entrees: number; depenses: number }> = {};
  transactions.forEach((t) => {
    const month = new Date(t.date).toLocaleDateString('fr-FR', { month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = { entrees: 0, depenses: 0 };
    if (t.type === 'ENTREE') monthlyData[month].entrees += t.montant;
    else monthlyData[month].depenses += t.montant;
  });
  const months = Object.keys(monthlyData).slice(-6);
  const maxVal = Math.max(...months.map((m) => Math.max(monthlyData[m].entrees, monthlyData[m].depenses)), 1);

  return (
    <>
      <PageHeading eyebrow="Gestion financière" title="Trésorerie" description="Caisse du Serval, entrées et dépenses." action={canManage ? <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={18} /> Nouvelle opération</button> : undefined} />
      <div className="treasury-hero">
        <div><span className="eyebrow">Solde de la caisse</span><strong>{balance.toFixed(2)} €</strong><p><ArrowUpRight size={15} /> {entrees.toFixed(2)} € entrées · {depenses.toFixed(2)} € dépenses</p></div>
        <div className="treasury-illustration"><Wallet size={39} /><span>€</span></div>
      </div>
      <div className="finance-grid">
        <div className="finance-stat"><span className="finance-icon positive"><ArrowUpRight size={18} /></span><div><small>Entrées</small><b>+ {entrees.toFixed(2)} €</b></div></div>
        <div className="finance-stat"><span className="finance-icon negative"><ArrowUpRight size={18} /></span><div><small>Dépenses</small><b>− {depenses.toFixed(2)} €</b></div></div>
      </div>
      {months.length > 0 && (
        <section className="panel" style={{ marginTop: '20px' }}>
          <div className="panel-heading"><div><span className="eyebrow">Évolution</span><h2>Entrées et dépenses par mois</h2></div></div>
          <div className="chart-container">
            {months.map((m) => (
              <div className="chart-bar-group" key={m}>
                <div className="chart-bars">
                  <div className="chart-bar positive" style={{ height: `${(monthlyData[m].entrees / maxVal) * 100}%` }} title={`${monthlyData[m].entrees.toFixed(2)} €`} />
                  <div className="chart-bar negative" style={{ height: `${(monthlyData[m].depenses / maxVal) * 100}%` }} title={`${monthlyData[m].depenses.toFixed(2)} €`} />
                </div>
                <span className="chart-label">{m}</span>
              </div>
            ))}
          </div>
          <div className="chart-legend"><span><i className="dot dot-green" /> Entrées</span><span><i className="dot dot-coral" /> Dépenses</span></div>
        </section>
      )}
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : transactions.length === 0 ? <div className="empty-state"><Wallet size={40} /><p>Aucune opération.</p></div>
        : (
          <div className="table-panel operations" style={{ marginTop: '20px' }}>
            <div className="panel-heading"><div><span className="eyebrow">Journal</span><h2>Derniers mouvements</h2></div></div>
            {transactions.map((t) => (
              <div className="operation-row" key={t.id}>
                <span className={`operation-icon ${t.type === 'ENTREE' ? 'positive' : 'negative'}`}><ArrowUpRight size={17} /></span>
                <span><b>{t.titre}</b><small>{new Date(t.date).toLocaleDateString('fr-FR')} · {catLabel(t.categorie)}</small></span>
                <strong className={t.type === 'ENTREE' ? 'positive-text' : ''}>{t.type === 'ENTREE' ? '+ ' : '− '}{t.montant.toFixed(2)} €</strong>
                {canManage && <button className="row-menu" onClick={() => del(t.id)}><X size={14} /></button>}
              </div>
            ))}
          </div>
        )}
      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Trésorerie</span><h2>Nouvelle opération</h2></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <form onSubmit={add}>
              <label>Titre<input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Extra-job lavage" autoFocus /></label>
              <div className="form-row"><label>Montant (€)<input type="number" step="0.01" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} placeholder="0.00" /></label><label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, categorie: e.target.value === 'ENTREE' ? 'EXTRA_JOB' : 'AUTRE_DEPENSE' })}><option value="DEPENSE">Dépense</option><option value="ENTREE">Entrée</option></select></label></div>
              <label>Catégorie<select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>{form.type === 'ENTREE' ? <><option value="EXTRA_JOB">Extra-job</option><option value="CAGNOTTE">Cagnotte</option><option value="AUTRE_ENTREE">Autre</option></> : <><option value="COURSES">Courses</option><option value="MATERIEL">Matériel</option><option value="AUTRE_DEPENSE">Autre</option></>}</select></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowAdd(false)}>Annuler</button><button className="primary-button" disabled={!form.titre.trim() || !form.montant}><Check size={17} /> Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Urgences ─────────────────────────────────────────── */

function Urgences({ session }: { session: Session }) {
  const [members, setMembers] = useState<User[]>([]);
  const [weekend, setWeekend] = useState<Weekend | null>(null);

  useEffect(() => {
    if (!session.patrouille) return;
    (async () => {
      let childIds: string[] | null = null;
      if (isParent(session)) {
        const { data: relations } = await supabase.from('parent_relations').select('enfant_id').eq('parent_id', session.user.id);
        childIds = (relations ?? []).map((relation) => relation.enfant_id);
      }
      let usersQuery = supabase.from('users').select('*').eq('patrouille_id', session.patrouille!.id).neq('role', 'PARENT').order('prenom');
      if (childIds) usersQuery = usersQuery.in('id', childIds);
      const { data: us } = await usersQuery;
      setMembers(us ?? []);
      const today = new Date().toISOString();
      const { data: wk } = await supabase.from('weekends').select('*').eq('patrouille_id', session.patrouille!.id).gte('date_debut', today).order('date_debut').limit(1).maybeSingle();
      setWeekend(wk);
    })();
  }, [session]);

  const allergic = members.filter((m) => m.aspirations && m.aspirations.toLowerCase().includes('allerg'));

  return (
    <>
      <PageHeading eyebrow="Sécurité" title="Urgences" description="Contacts, consignes et informations de secours." />
      <div className="emergency-grid">
        <div className="emergency-card urgent"><div className="emergency-icon"><TriangleAlert size={28} /></div><div><span className="input-label">Urgences européennes</span><b>112</b></div></div>
        <div className="emergency-card"><div className="emergency-icon"><Heart size={28} /></div><div><span className="input-label">SAMU</span><b>15</b></div></div>
        <div className="emergency-card"><div className="emergency-icon"><ShieldCheck size={28} /></div><div><span className="input-label">Pompiers</span><b>18</b></div></div>
      </div>
      {weekend && (
        <section className="panel" style={{ marginTop: '24px' }}>
          <div className="panel-heading"><div><span className="eyebrow">Prochain week-end</span><h2>{weekend.titre}</h2></div></div>
          {weekend.urgences && <p className="panel-footnote"><TriangleAlert size={15} /> {weekend.urgences}</p>}
          {weekend.lieu_depart && <p className="panel-footnote"><MapPin size={15} /> Départ: {weekend.lieu_depart}</p>}
        </section>
      )}
      <section className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-heading"><div><span className="eyebrow">Allergies</span><h2>Membres concernés</h2></div></div>
        {allergic.length === 0 ? <p className="panel-footnote">Aucune allergie signalée.</p>
          : <div className="task-list">{allergic.map((m) => <div className="task-item" key={m.id}><span className="task-check alert"><TriangleAlert size={14} /></span><span><b>{m.prenom}</b> — {m.aspirations}</span></div>)}</div>}
      </section>
    </>
  );
}

/* ── Accounts (CP only) ───────────────────────────────── */

function Accounts({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ prenom: '', code: '', role: 'MEMBRE', place: 'AUTRE' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ prenom: '', role: 'MEMBRE', place: 'AUTRE' });
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [showDelete, setShowDelete] = useState<User | null>(null);
  const [relationParent, setRelationParent] = useState<User | null>(null);
  const [relationChildren, setRelationChildren] = useState<string[]>([]);

  const load = async () => {
    if (!session.patrouille) return;
    setLoading(true);
    const { data } = await supabase.from('users').select('*').eq('patrouille_id', session.patrouille.id).order('created_at');
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom.trim() || !form.code.trim() || !session.patrouille) return;
    const { error } = await supabase.from('users').insert({
      prenom: form.prenom.trim(), code_secret: form.code.trim(), role: form.role, place: form.place,
      patrouille_id: session.patrouille.id, statut: 'ACTIF',
    });
    if (error) { onToast(error.message.includes('duplicate') ? 'Code existant' : 'Erreur'); return; }
    setForm({ prenom: '', code: '', role: 'MEMBRE', place: 'AUTRE' }); setShowAdd(false); onToast('Compte créé'); load();
  };

  const toggleStatut = async (u: User) => {
    if (u.role === 'CP' && u.statut === 'ACTIF' && cpCount <= 1) {
      onToast('Désigne un nouveau CP avant de désactiver le dernier CP');
      return;
    }
    const newStatut = u.statut === 'ACTIF' ? 'DESACTIVE' : 'ACTIF';
    const { error } = await supabase.from('users').update({ statut: newStatut }).eq('id', u.id);
    if (error) { onToast('Impossible de modifier ce compte'); return; }
    onToast(newStatut === 'ACTIF' ? 'Compte réactivé' : 'Compte désactivé'); load();
  };

  const resetCode = async (u: User) => {
    const newCode = prompt(`Nouveau code d'accès pour ${u.prenom}:`);
    if (!newCode || newCode.length < 4) { onToast('Code trop court'); return; }
    const { error } = await supabase.from('users').update({ code_secret: newCode.trim() }).eq('id', u.id);
    if (error) { onToast('Ce code est déjà utilisé'); return; }
    onToast('Code réinitialisé'); load();
  };

  const startEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({ prenom: u.prenom, role: u.role, place: u.place });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editForm.prenom.trim()) return;
    if (editingUser.role === 'CP' && editForm.role !== 'CP' && cpCount <= 1) {
      onToast('Désigne un nouveau CP avant de modifier ce rôle');
      return;
    }
    const { error } = await supabase.from('users').update({
      prenom: editForm.prenom.trim(), role: editForm.role, place: editForm.role === 'CP' ? 'CP' : editForm.place,
    }).eq('id', editingUser.id);
    if (error) { onToast('Impossible de modifier ce compte'); return; }
    setEditingUser(null); onToast('Compte mis à jour'); load();
  };

  const openRelations = async (parent: User) => {
    const { data } = await supabase.from('parent_relations').select('enfant_id').eq('parent_id', parent.id);
    setRelationParent(parent);
    setRelationChildren((data ?? []).map((relation) => relation.enfant_id));
  };

  const toggleRelation = async (childId: string) => {
    if (!relationParent) return;
    if (relationChildren.includes(childId)) {
      const { error } = await supabase.from('parent_relations').delete().eq('parent_id', relationParent.id).eq('enfant_id', childId);
      if (error) { onToast('Impossible de dissocier cet enfant'); return; }
      setRelationChildren((current) => current.filter((id) => id !== childId));
    } else {
      const { error } = await supabase.from('parent_relations').insert({ parent_id: relationParent.id, enfant_id: childId });
      if (error) { onToast('Impossible d’associer cet enfant'); return; }
      setRelationChildren((current) => [...current, childId]);
    }
  };

  const deleteAccount = async () => {
    if (!showDelete) return;
    const { error } = await supabase.from('users').delete().eq('id', showDelete.id);
    if (error) { onToast('Impossible de supprimer ce compte'); return; }
    onToast('Compte supprimé'); setShowDelete(null); load();
  };

  const doTransfer = async () => {
    if (!transferTarget) { onToast('Sélectionne un membre'); return; }
    const { error } = await transferCP(transferTarget, session.user.id);
    if (error) { onToast(error); return; }
    onToast('Responsabilité CP transférée');
    setShowTransfer(false);
    clearSession(); setSessionNull();
  };

  const cpCount = users.filter((u) => u.role === 'CP' && u.statut === 'ACTIF').length;
  const memberUsers = users.filter((u) => u.role !== 'PARENT' && u.id !== session.user.id && u.statut === 'ACTIF');

  return (
    <>
      <PageHeading eyebrow="Administration" title="Comptes & Accès" description="Gère les comptes, codes et statuts." action={<div style={{ display: 'flex', gap: '8px' }}><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={18} /> Créer</button><button className="secondary-button" onClick={() => setShowTransfer(true)}>Transférer CP</button></div>} />
      {loading ? <div className="loading-screen" style={{ minHeight: '200px' }}><div className="spinner" /></div>
        : (
          <div className="accounts-list">
            {users.map((u) => (
              <div className="account-row" key={u.id}>
                <span className={`avatar avatar-${avatarColor(u.role)}`}>{initials(u.prenom)}</span>
                <div className="account-info"><b>{u.prenom}</b><small>{u.role} · {placeLabel(u.place)}</small></div>
                <span className={`status-badge ${u.statut === 'ACTIF' ? 'active' : 'disabled'}`}>{u.statut === 'ACTIF' ? '🟢 Actif' : '🔴 Désactivé'}</span>
                <div className="account-actions">
                  <button className="row-menu" onClick={() => startEdit(u)}>Modifier</button>
                  <button className="row-menu" onClick={() => resetCode(u)}>Code</button>
                  <button className="row-menu" onClick={() => toggleStatut(u)}>{u.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}</button>
                  {u.role === 'PARENT' && <button className="row-menu" onClick={() => openRelations(u)}>Enfants</button>}
                  {u.role !== 'CP' && <button className="row-menu" onClick={() => setShowDelete(u)}>Supprimer</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      {showAdd && (
        <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Nouveau compte</span><h2>Créer un accès</h2></div><button className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <form onSubmit={addUser}>
              <label>Prénom<input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} autoFocus /></label>
              <label>Code d'accès<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ex: LUCAS-2026" /></label>
              <div className="form-row"><label>Rôle<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="MEMBRE">Membre</option><option value="SP">Second</option><option value="HP">HP</option><option value="PARENT">Parent</option></select></label><label>Place<select value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}><option value="AUTRE">Autre</option><option value="SP">SP</option><option value="TROISIEME">3e</option><option value="QUATRIEME">4e</option><option value="CINQUIEME">5e</option><option value="SIXIEME">6e</option><option value="SEPTIEME">7e</option><option value="HUITIEME">8e</option></select></label></div>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowAdd(false)}>Annuler</button><button className="primary-button" disabled={!form.prenom.trim() || !form.code.trim()}><Check size={17} /> Créer</button></div>
            </form>
          </div>
        </div>
      )}
      {showTransfer && (
        <div className="modal-backdrop" onMouseDown={() => setShowTransfer(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Transfert de responsabilité</span><h2>Transférer le CP</h2></div><button className="icon-button" onClick={() => setShowTransfer(false)}><X size={18} /></button></div>
            <p style={{ color: '#84938a', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>Sélectionne le membre qui deviendra le nouveau CP. Tu deviendras MEMBRE après le transfert.</p>
             <label>Nouveau CP<select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}><option value="">Sélectionner…</option>{memberUsers.map((u) => <option key={u.id} value={u.id}>{u.prenom}</option>)}</select></label>
            <div className="modal-actions"><button className="secondary-button" onClick={() => setShowTransfer(false)}>Annuler</button><button className="primary-button danger" disabled={!transferTarget} onClick={doTransfer}><ShieldCheck size={17} /> Transférer</button></div>
          </div>
        </div>
      )}
      {editingUser && (
        <div className="modal-backdrop" onMouseDown={() => setEditingUser(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Compte</span><h2>Modifier {editingUser.prenom}</h2></div><button className="icon-button" onClick={() => setEditingUser(null)}><X size={18} /></button></div>
            <form onSubmit={saveEdit}>
              <label>Prénom<input value={editForm.prenom} onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })} autoFocus /></label>
              <div className="form-row">
                <label>Rôle<select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}><option value="CP">CP</option><option value="SP">SP</option><option value="HP">HP</option><option value="MEMBRE">Membre</option><option value="PARENT">Parent</option></select></label>
                <label>Place<select value={editForm.place} disabled={editForm.role === 'CP'} onChange={(e) => setEditForm({ ...editForm, place: e.target.value })}><option value="AUTRE">Autre</option><option value="SP">SP</option><option value="TROISIEME">3e</option><option value="QUATRIEME">4e</option><option value="CINQUIEME">5e</option><option value="SIXIEME">6e</option><option value="SEPTIEME">7e</option><option value="HUITIEME">8e</option></select></label>
              </div>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setEditingUser(null)}>Annuler</button><button className="primary-button"><Check size={17} /> Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}
      {relationParent && (
        <div className="modal-backdrop" onMouseDown={() => setRelationParent(null)}>
          <div className="modal modal-wide" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Famille</span><h2>Enfants de {relationParent.prenom}</h2></div><button className="icon-button" onClick={() => setRelationParent(null)}><X size={18} /></button></div>
            <p className="modal-help">Coche les membres visibles par ce parent dans son espace.</p>
            <div className="relation-list">
              {users.filter((u) => u.role !== 'PARENT').map((child) => (
                <label className="relation-row" key={child.id}>
                  <input type="checkbox" checked={relationChildren.includes(child.id)} onChange={() => toggleRelation(child.id)} />
                  <span className={`avatar avatar-${avatarColor(child.role)}`}>{initials(child.prenom)}</span>
                  <span><b>{child.prenom}</b><small>{placeLabel(child.place)} · {child.role}</small></span>
                </label>
              ))}
            </div>
            <div className="modal-actions"><button className="primary-button" onClick={() => setRelationParent(null)}>Terminer</button></div>
          </div>
        </div>
      )}
      {showDelete && (
        <div className="modal-backdrop" onMouseDown={() => setShowDelete(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">Attention</span><h2>Supprimer l'accès</h2></div><button className="icon-button" onClick={() => setShowDelete(null)}><X size={18} /></button></div>
            <p style={{ color: '#84938a', fontSize: '13px', lineHeight: 1.6 }}>Êtes-vous certain de vouloir supprimer l'accès de {showDelete.prenom} ? Son compte ne pourra plus se connecter.</p>
            <div className="modal-actions"><button className="secondary-button" onClick={() => setShowDelete(null)}>Annuler</button><button className="primary-button danger" onClick={deleteAccount}><TriangleAlert size={17} /> Supprimer</button></div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper for CP transfer logout
function setSessionNull() {
  window.location.reload();
}

/* ── Settings ─────────────────────────────────────────── */

function SettingsView({ session, onToast }: { session: Session; onToast: (m: string) => void }) {
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [logoUrl, setLogoUrl] = useState(session.patrouille?.logo_url ?? '');
  const [busy, setBusy] = useState(false);

  const changeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oldCode !== session.user.code_secret) { onToast('Ancien code incorrect'); return; }
    if (newCode.trim().length < 4) { onToast('Code trop court'); return; }
    setBusy(true);
    const { error } = await supabase.from('users').update({ code_secret: newCode.trim() }).eq('id', session.user.id);
    setBusy(false);
    if (error) { onToast('Erreur'); return; }
    session.user.code_secret = newCode.trim(); storeSession(session);
    setOldCode(''); setNewCode(''); onToast('Code mis à jour');
  };

  const saveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.patrouille || !isCP(session)) return;
    setBusy(true);
    const { error } = await supabase.from('patrouilles').update({ logo_url: logoUrl.trim() || null }).eq('id', session.patrouille.id);
    setBusy(false);
    if (error) { onToast('Impossible de mettre à jour le logo'); return; }
    session.patrouille.logo_url = logoUrl.trim() || null;
    storeSession(session);
    onToast('Logo mis à jour');
  };

  return (
    <>
      <PageHeading eyebrow="Mon compte" title="Paramètres" description="Modifie ton code d'accès." />
      <section className="panel" style={{ maxWidth: '500px' }}>
        <div className="panel-heading"><div><span className="eyebrow">Sécurité</span><h2>Changer mon code</h2></div></div>
        <form onSubmit={changeCode} className="auth-form" style={{ maxWidth: '400px' }}>
          <label><span className="input-label">Ancien code</span><div className="input-wrap"><ShieldCheck size={17} className="input-icon" /><input type="password" value={oldCode} onChange={(e) => setOldCode(e.target.value)} required /></div></label>
          <label><span className="input-label">Nouveau code</span><div className="input-wrap"><ShieldCheck size={17} className="input-icon" /><input type="password" value={newCode} onChange={(e) => setNewCode(e.target.value)} minLength={4} required /></div></label>
          <button className="primary-button" disabled={busy}><Check size={17} /> Mettre à jour</button>
        </form>
      </section>
      {isCP(session) && (
        <section className="panel" style={{ maxWidth: '500px', marginTop: '20px' }}>
          <div className="panel-heading"><div><span className="eyebrow">Identité</span><h2>Logo de la patrouille</h2></div></div>
          <p className="modal-help">Le logo est affiché à la connexion et dans la navigation.</p>
          <form onSubmit={saveLogo} className="auth-form" style={{ maxWidth: '400px' }}>
            <label><span className="input-label">URL du logo</span><input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" /></label>
            <div className="logo-preview">{logoUrl ? <img src={logoUrl} alt="Aperçu du logo" /> : <span>🐆</span>}<small>{logoUrl ? 'Aperçu' : 'Logo Serval par défaut'}</small></div>
            <button className="primary-button" disabled={busy}><Check size={17} /> Enregistrer le logo</button>
          </form>
        </section>
      )}
    </>
  );
}

/* ── Helpers ───────────────────────────────────────────── */

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(role: string): string {
  switch (role) { case 'CP': return 'gold'; case 'SP': return 'blue'; case 'PARENT': return 'sage'; default: return 'blue'; }
}

function placeLabel(place: string): string {
  const l: Record<string, string> = { CP: 'CP', SP: 'SP', TROISIEME: '3e', QUATRIEME: '4e', CINQUIEME: '5e', SIXIEME: '6e', SEPTIEME: '7e', HUITIEME: '8e', AUTRE: 'Membre' };
  return l[place] ?? place;
}

function roleTechLabel(rt: string): string {
  const l: Record<string, string> = { TOPOGRAPHE: 'Topographe', TRESORIER: 'Trésorier', MATERIALISTE: 'Matérialiste', SECOURISTE: 'Secouriste', INTENDANT: 'Intendant', CUISINIER: 'Cuisinier', MAITRE_FEU: 'Maître du feu', RESP_PROPRETE: 'Resp. propreté', PIONNIER: 'Pionnier', AUCUN: '' };
  return l[rt] ?? rt;
}

function progressionLabel(p: string): string {
  const l: Record<string, string> = { AUCUNE: '', PROMESSE: 'Promesse', ASPIRANCE: 'Aspirance', SECONDE_CLASSE: 'Seconde classe', PREMIERE_CLASSE: 'Première classe' };
  return l[p] ?? p;
}

function catLabel(c: string): string {
  const l: Record<string, string> = { EXTRA_JOB: 'Extra-job', CAGNOTTE: 'Cagnotte', AUTRE_ENTREE: 'Autre entrée', COURSES: 'Courses', MATERIEL: 'Matériel', AUTRE_DEPENSE: 'Autre dépense' };
  return l[c] ?? c;
}
