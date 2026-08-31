# SquadCraft — Patrouille du Serval

Centre de gestion privé de la Patrouille du Serval : membres, progression,
badges, annonces, chat, week-ends, pharmacie, matériel, courses, trésorerie
et accès parents.

## Démarrage

```bash
npm install
npm run dev
```

L’application est servie sur le port `5000`.

## Connexion Supabase

Le projet utilise Supabase pour la persistance. Renseigner ces variables dans
les variables d’environnement Replit (ou dans un fichier `.env.local` local) :

```env
VITE_SUPABASE_URL=https://<projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé-publique-anon>
```

Appliquer ensuite les migrations dans l’ordre depuis `supabase/migrations/`.
La migration v4 ajoute les données GPS et notes des week-ends ainsi que la
fonction de transfert atomique de CP.

Sans ces variables, l’application affiche volontairement un écran de
configuration au lieu de tenter de contacter une URL Supabase fictive.

## Vérifications

```bash
npm run typecheck
npm run build
npm run lint
```