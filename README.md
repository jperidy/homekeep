# HomeKeep

Application de gestion de la maintenance résidentielle. HomeKeep permet aux propriétaires de suivre leurs équipements, planifier leurs entretiens et ne jamais rater une maintenance.

**Stack :** SvelteKit 2 · Svelte 5 · TypeScript · Prisma 7 · PostgreSQL · better-auth · Tailwind CSS 4 · Vitest

---

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose
- [Node.js](https://nodejs.org/) 22+ et [pnpm](https://pnpm.io/) 11+

---

## Premier démarrage

### 1. Installer les dépendances

```sh
pnpm install
```

### 2. Configurer l'environnement

```sh
cp .env.example .env
```

Ouvrir `.env` et renseigner `BETTER_AUTH_SECRET` avec une clé aléatoire :

```sh
openssl rand -base64 32
# Copier la valeur dans .env → BETTER_AUTH_SECRET="..."
```

Toutes les autres valeurs sont pré-remplies pour fonctionner en local.

### 3. Démarrer l'application

```sh
pnpm docker:build
```

Docker Compose démarre trois services :

| Service | URL |
|---------|-----|
| App SvelteKit | http://localhost:5173 |
| Interface mail (Mailpit) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |

Les migrations de base de données sont appliquées automatiquement au démarrage.

### 4. Seed (optionnel, recommandé pour les tests manuels)

```sh
pnpm seed
```

Crée un compte admin, provisionne le catalogue d'équipements et génère une propriété de démonstration avec des tâches de maintenance :

| Compte | Email | Mot de passe |
|--------|-------|--------------|
| Admin  | `admin@homekeep.dev` | `admin1234` |

La propriété démo **Mon appartement de test** est créée pour le compte admin, avec 3 équipements et un mix de tâches en retard et à venir pour tester le planning.

Le seed est **idempotent** : il peut être relancé sans risque de doublons.

---

## Variables d'environnement

Le fichier `.env` est lu par Docker Compose et transmis au container.

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `BETTER_AUTH_SECRET` | ✅ | Clé secrète pour les sessions (`openssl rand -base64 32`) |
| `DATABASE_URL` | ✅ | URL PostgreSQL (pré-remplie pour Docker) |
| `BETTER_AUTH_URL` | — | URL serveur de l'app (défaut : `http://localhost:5173`) |
| `PUBLIC_BETTER_AUTH_URL` | — | URL navigateur de l'app (défaut : `http://localhost:5173`) |
| `SMTP_HOST` | — | Hôte SMTP (défaut : `mailpit` via Docker) |
| `SMTP_PORT` | — | Port SMTP (défaut : `1025`) |
| `SMTP_FROM` | — | Adresse expéditeur des emails |
| `GOOGLE_CLIENT_ID` | — | OAuth Google (optionnel) |
| `GOOGLE_CLIENT_SECRET` | — | OAuth Google (optionnel) |
| `PUBLIC_GOOGLE_ENABLED` | — | Afficher le bouton Google (`true`/`false`) |

---

## Commandes

### Docker

```sh
pnpm docker:build    # Premier démarrage ou après modification du Dockerfile
pnpm docker:up       # Démarrer les conteneurs (sans rebuild)
pnpm docker:down     # Arrêter les conteneurs
```

### Base de données

Ces commandes s'exécutent dans le container Docker (les containers doivent être démarrés).

```sh
pnpm db:migrate      # Créer et appliquer une nouvelle migration (interactif)
pnpm db:reset        # Réinitialiser la base ⚠ supprime toutes les données
pnpm db:studio       # Ouvrir Prisma Studio sur http://localhost:5555
pnpm seed            # Insérer les données de développement (admin + catalogue + démo)
```

> `db:studio` se lance en local et se connecte à la base via le port 5432 exposé par Docker.

### Admin

```sh
pnpm make-admin <email>   # Promouvoir un compte existant en ADMIN
```

### Ajouter une dépendance

L'environnement d'exécution est le container Docker. Pour s'assurer que la bonne version de Node est utilisée lors de l'installation :

```sh
pnpm add <package>           # met à jour package.json + pnpm-lock.yaml sur le host
docker compose restart app   # l'entrypoint relance pnpm install dans le container
```

> Ne pas installer directement dans le container via `docker compose exec app pnpm add` : les modifications de `node_modules` seraient perdues au prochain restart.

### Tests et qualité

```sh
pnpm test            # Lancer les tests (vitest)
pnpm test:watch      # Tests en mode watch
pnpm check           # Vérification TypeScript + Svelte
pnpm check:watch     # Vérification en mode watch
```

---

## Structure du projet

```
scripts/
├── seed.ts                     # Seed dev : admin + catalogue + propriété démo
└── make-admin.ts               # Promote un utilisateur en ADMIN
src/
├── lib/
│   ├── components/
│   │   └── Logo.svelte         # Logo HomeKeep (SVG)
│   ├── auth-client.ts          # Client better-auth (browser)
│   └── server/
│       ├── auth.ts             # Configuration better-auth (serveur)
│       ├── prisma.ts           # Instance Prisma (driver PostgreSQL natif)
│       ├── mailer.ts           # Envoi d'emails via nodemailer
│       └── maintenance.ts      # Logique planning : génération de tâches, calcul d'échéances
├── routes/
│   ├── +page.svelte            # Landing page publique
│   ├── app/                    # Zone authentifiée (/app/*)
│   │   ├── +layout.server.ts   # Guard auth → /login si non connecté
│   │   ├── +layout.svelte      # Shell de l'app (nav + déconnexion)
│   │   ├── +page.svelte        # Dashboard (propriétés, stats)
│   │   ├── admin/              # Zone admin (/app/admin/*)
│   │   │   ├── +layout.server.ts          # Guard rôle → /app si non ADMIN
│   │   │   └── equipment-types/           # CRUD catalogue équipements
│   │   │       ├── +page.svelte           # Liste par catégorie
│   │   │       ├── new/                   # Créer un type
│   │   │       └── [id]/edit/             # Modifier / supprimer un type
│   │   └── properties/
│   │       ├── new/                       # Ajouter une propriété
│   │       └── [id]/                      # Détail d'une propriété + planning de maintenance
│   │           └── equipment/new/         # Ajouter un équipement (génère le planning auto)
│   ├── (auth)/                 # Pages auth (layout carte centrée)
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── terms/                  # Conditions d'utilisation
│   └── api/auth/[...all]/      # Route API better-auth
├── hooks.server.ts             # Middleware : injection session dans locals
└── app.d.ts                    # Types globaux SvelteKit (App.Locals)
prisma/
├── schema.prisma               # Schéma de base de données
└── migrations/                 # Historique des migrations SQL
```

---

## Authentification

Gérée par [better-auth](https://www.better-auth.com/) avec :

- **Email + mot de passe** — vérification email obligatoire à l'inscription
- **Magic link** — connexion sans mot de passe par email
- **Réinitialisation de mot de passe** — lien par email (expire en 1h)
- **Google OAuth** — optionnel, activer via `PUBLIC_GOOGLE_ENABLED=true` et les credentials Google

En développement, tous les emails sont capturés par **Mailpit** : http://localhost:8025

---

## Sécurité des routes

La sécurité est factoriée via le système de **layouts SvelteKit** : chaque layout protège automatiquement toutes les routes enfants.

| Layout | Garde | Comportement si rejeté |
|--------|-------|------------------------|
| `/app/+layout.server.ts` | Session valide requise | Redirect → `/login` |
| `/app/admin/+layout.server.ts` | Rôle `ADMIN` requis | Redirect → `/app` |

Les pages individuelles gèrent uniquement les vérifications de **propriété des ressources** (ex : une propriété appartient bien à l'utilisateur courant), ce qui est distinct de l'authentification/autorisation.

---

## Tests

Les tests sont co-localisés avec les fichiers sources (convention `.spec.ts`, sans préfixe `+`).

```sh
pnpm test
```

| Fichier | Ce qui est testé |
|---------|-----------------|
| `src/lib/server/mailer.spec.ts` | Envoi d'emails, propagation d'erreurs SMTP |
| `src/lib/server/maintenance.spec.ts` | `getNextDueDate` (logique d'échéance), `generatePlan` (création plan + tâches) |
| `src/routes/(auth)/login/page.spec.ts` | Formulaire, mode magic link, messages d'erreur |
| `src/routes/(auth)/register/page.spec.ts` | Inscription, état succès, validation, liens |
| `src/routes/app/layout.server.spec.ts` | **Guard auth** : session requise, flag `isAdmin` |
| `src/routes/app/page.spec.ts` | Dashboard : comptage équipements, tâches en attente |
| `src/routes/app/admin/layout.server.spec.ts` | **Guard rôle** : ADMIN requis, rejet USER/null |
| `src/routes/app/properties/new/page.spec.ts` | Action création propriété (validation, redirect) |
| `src/routes/app/properties/[id]/page.spec.ts` | Load propriété + tâches, action `completeTask` |
| `src/routes/app/admin/equipment-types/new/page.spec.ts` | Action création type (validation, unicité, UI) |
| `src/routes/app/admin/equipment-types/[id]/edit/page.spec.ts` | Actions update, delete, addRule, deleteRule |
| `src/routes/app/properties/[id]/equipment/new/page.spec.ts` | Action ajout équipement + génération du plan (validation, redirect, UI) |
