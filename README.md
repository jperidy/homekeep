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
```

> `db:studio` se lance en local et se connecte à la base via le port 5432 exposé par Docker.

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
src/
├── lib/
│   ├── auth-client.ts          # Client better-auth (browser)
│   └── server/
│       ├── auth.ts             # Configuration better-auth (serveur)
│       ├── prisma.ts           # Instance Prisma (driver PostgreSQL natif)
│       └── mailer.ts           # Envoi d'emails via nodemailer
├── routes/
│   ├── +page.svelte            # Landing page publique
│   ├── app/                    # Zone authentifiée (/app/*)
│   │   ├── +layout.server.ts   # Guard : redirige vers /login si non connecté
│   │   ├── +layout.svelte      # Shell de l'app (nav + déconnexion)
│   │   └── +page.svelte        # Dashboard
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

## Tests

Les tests sont co-localisés avec les fichiers sources (convention `.spec.ts`, sans préfixe `+`).

```sh
pnpm test
```

| Fichier | Ce qui est testé |
|---------|-----------------|
| `src/lib/server/mailer.spec.ts` | Envoi d'emails, propagation d'erreurs SMTP |
| `src/routes/(auth)/login/page.spec.ts` | Formulaire, mode magic link, messages d'erreur |
| `src/routes/(auth)/register/page.spec.ts` | Inscription, état succès, validation, liens |
