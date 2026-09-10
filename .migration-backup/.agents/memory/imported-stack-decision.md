---
name: Imported stack decision
description: Why the existing frontend and Supabase architecture is retained for SquadCraft.
---

SquadCraft reste sur la stack importée Vite + React + TypeScript + Supabase ; ne pas migrer vers Next.js/Prisma sans demande explicite.

**Why:** Une partie fonctionnelle existait déjà et une migration structurelle aurait augmenté le risque de régression tout en sortant du périmètre de finition.

**How to apply:** Ajouter les évolutions aux composants et migrations Supabase existants, en gardant les migrations séquentielles et la compatibilité avec le workflow Vite sur le port 5000.