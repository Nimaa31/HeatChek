# HeatCheck

Application de vote pour les sorties rap FR. Vote pour tes sons préférés et découvre les tracks les plus chaudes de la communauté.

## Stack Technique

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- React Query (TanStack)
- Zustand (State Management)
- React Router DOM

### Backend
- Symfony 6
- API Platform 3
- PostgreSQL 15
- LexikJWTAuthenticationBundle

### Infrastructure
- Docker + Docker Compose

## Prérequis

- Docker & Docker Compose
- Node.js 20+ (pour le développement local)
- PHP 8.2+ (pour le développement local)
- Composer (pour le développement local)

## Installation

### 1. Cloner le projet

```bash
git clone <repo-url>
cd heatcheck
```

### 2. Lancer avec Docker

```bash
docker-compose up -d --build
```

### 3. Initialiser le backend

```bash
# Entrer dans le container backend
docker-compose exec backend bash

# Installer les dépendances
composer install

# Générer les clés JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

# Créer la base de données et exécuter les migrations
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate --no-interaction

# (Optionnel) Charger des données de test
php bin/console doctrine:fixtures:load --no-interaction
```

### 4. Accéder à l'application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api
- **Documentation API**: http://localhost:8000/api/docs

## Structure du Projet

```
heatcheck/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # API clients
│   │   ├── stores/         # État global (Zustand)
│   │   ├── lib/            # Utilitaires
│   │   └── App.tsx
│   └── tailwind.config.js
├── backend/
│   ├── Dockerfile
│   ├── composer.json
│   ├── src/
│   │   ├── Entity/         # Entités Doctrine
│   │   ├── Controller/     # Controllers
│   │   ├── Repository/     # Repositories
│   │   └── State/          # API Platform State Processors/Providers
│   ├── config/
│   └── migrations/
└── README.md
```

## API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion (retourne JWT) |
| GET | `/api/users/me` | Profil utilisateur (auth) |
| GET | `/api/users/me/votes` | Mes votes (auth) |

### Tracks
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tracks` | Liste paginée |
| GET | `/api/tracks/{id}` | Détail avec score |
| GET | `/api/tracks/ranking?period=week\|month\|all` | Classement |

### Artists
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/artists` | Liste |
| GET | `/api/artists/{id}` | Détail + tracks |

### Votes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/votes` | Voter (auth) |
| PUT | `/api/votes/{id}` | Modifier vote (auth) |
| DELETE | `/api/votes/{id}` | Supprimer vote (auth) |

## Modèles de données

### User
- `id` (UUID)
- `email` (unique)
- `username`
- `password` (hashé)
- `avatarUrl`
- `createdAt`
- `roles`

### Artist
- `id` (UUID)
- `name`
- `imageUrl`
- `createdAt`

### Track
- `id` (UUID)
- `title`
- `artist` (ManyToOne)
- `coverUrl`
- `spotifyUrl`
- `youtubeUrl`
- `releaseDate`
- `createdAt`

### Vote
- `id` (UUID)
- `user` (ManyToOne)
- `track` (ManyToOne)
- `value` (+1 ou -1)
- `createdAt`
- `updatedAt`
- Contrainte: UNIQUE(user, track)

## Développement

### Frontend (sans Docker)

```bash
cd frontend
npm install
npm run dev
```

### Backend (sans Docker)

```bash
cd backend
composer install
symfony server:start
```

## Variables d'environnement

### Backend (.env)
```
APP_ENV=dev
APP_SECRET=your_secret
DATABASE_URL=postgresql://user:pass@localhost:5432/heatcheck
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_passphrase
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

## Licence

Propriétaire - Tous droits réservés
