---
name: npm registry portability
description: Registry behavior to account for when validating imported projects outside Replit.
---

Dans l’environnement Replit, la variable npm_config_registry peut imposer un registre interne même lorsqu’aucun fichier `.npmrc` n’existe dans le projet ; un test portable doit forcer le registre npm public.

**Why:** Le lockfile peut être entièrement public tout en laissant les commandes npm locales utiliser une configuration injectée par l’environnement.

**How to apply:** Distinguer la configuration du dépôt de celle de l’environnement d’exécution ; pour une validation Vercel, utiliser le registre public et vérifier les URL `resolved` du lockfile.