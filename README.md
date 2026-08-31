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

## Fonctionnement simple par défaut

Sans configuration supplémentaire, SquadCraft fonctionne en mode local :
les prénoms, codes et modifications sont enregistrés dans le stockage du
navigateur. Les données restent donc sur cet appareil et ce navigateur.

Au premier lancement, crée ton propre compte CP et le nom de ta patrouille.
Le CP peut ensuite créer les patrouillards et les comptes parents depuis
**Comptes & Accès**.

## Connexion Supabase (optionnelle)

Pour partager les mêmes données entre plusieurs appareils, il est possible
d’activer Supabase. Renseigner alors ces variables dans les variables
d’environnement Replit (ou dans un fichier `.env.local` local) :

```env
VITE_SUPABASE_URL=https://<projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé-publique-anon>
```

Appliquer ensuite les migrations dans l’ordre depuis `supabase/migrations/`.
La migration v4 ajoute les données GPS et notes des week-ends ainsi que la
fonction de transfert atomique de CP.

Sans ces variables, l’application reste en mode local et ne tente pas de
contacter une URL Supabase fictive.

## Vérifications

```bash
npm run typecheck
npm run build
npm run lint
```

## Publier sur Vercel

Le projet est exportable tel quel vers Vercel :

1. Importer le dépôt dans Vercel.
2. Laisser le framework détecté sur **Vite**.
3. Utiliser `npm run build` comme commande de build.
4. Utiliser `dist` comme dossier de sortie.
5. Publier.

Le fichier `vercel.json` est déjà présent pour que les pages React restent
accessibles après un rechargement direct.