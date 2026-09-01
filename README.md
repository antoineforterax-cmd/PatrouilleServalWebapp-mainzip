# SquadCraft — Patrouille du Serval

Centre de gestion privé de la Patrouille du Serval : membres, progression,
badges cumulables, annonces avec images, chat privé, week-ends, repas,
pharmacie, matériel, courses, trésorerie et accès parents.

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

Au premier lancement, le formulaire propose le compte CP initial **Antoine**
avec le code **Nautiques70+** (le CP peut ensuite changer ce code depuis
Paramètres). Le CP peut ensuite créer les patrouillards et les comptes parents
depuis **Comptes & Accès**, attribuer le rôle Second et les responsabilités
techniques.

Le CP est le seul administrateur des comptes, des codes et des rôles. Le Second
peut gérer les modules opérationnels. Plusieurs responsabilités techniques
peuvent être attribuées à la même personne : **Secouriste**, **Matérialiste**,
**Intendant**, **Trésorier** et **Cuisinier** donnent respectivement accès à la
pharmacie, à la malle, aux week-ends/courses, à la trésorerie et aux repas.
Le CP et le Second conservent leur accès opérationnel sur les autres modules ;
la modification des repas reste volontairement réservée aux responsabilités
**Cuisinier** et **Intendant**.

Les badges se gèrent indépendamment les uns des autres dans la fiche de chaque
patrouillard : chaque badge possède son propre état (à commencer, en cours ou
validé), et plusieurs badges peuvent donc être suivis en même temps. Les
annonces et messages acceptent jusqu’à quatre images importées depuis
l’ordinateur, de 500 Ko maximum par image afin de rester compatible avec le
stockage local du navigateur.

Le chat ne mélange plus les messages : il faut choisir un autre patrouillard
pour ouvrir la conversation privée correspondante. Les week-ends proposent
également de récupérer la position GPS actuelle du téléphone ou de l’ordinateur
pour remplir un point de départ ou de retour, puis d’ouvrir ce point dans une
carte.

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
fonction de transfert atomique de CP. La migration v5 ajoute le destinataire
des messages privés et la table des repas.

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
accessibles après un rechargement direct. Pour un usage multi-appareils sur
Vercel, renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les
variables d’environnement de Vercel avant le build, puis appliquer les
migrations Supabase. Sans ces deux variables, le déploiement Vercel reste
fonctionnel en mode local : chaque navigateur conserve ses propres données
dans son stockage local, sans partage entre appareils.