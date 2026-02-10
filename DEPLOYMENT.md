# Déploiement sur Railway

## Prérequis

1. Créer un compte sur [Railway](https://railway.app)
2. Installer Railway CLI : `npm install -g @railway/cli`
3. Se connecter : `railway login`

---

## Architecture sur Railway

```
Projet Railway
├── Service: PostgreSQL (database)
├── Service: backend (API Symfony)
└── Service: frontend (React)
```

---

## Étape 1 : Créer le projet et la base de données

1. Aller sur [railway.app](https://railway.app)
2. Cliquer sur **"New Project"**
3. Sélectionner **"Provision PostgreSQL"**
4. Noter les variables de connexion (elles seront auto-injectées)

---

## Étape 2 : Déployer le Backend

### Option A : Via l'interface Railway (Recommandé)

1. Dans ton projet Railway, cliquer sur **"New Service"**
2. Sélectionner **"GitHub Repo"**
3. Choisir le repo `Nimaa31/HeatChek`
4. Configurer le service :
   - **Root Directory** : `backend`
   - **Builder** : Dockerfile
   - **Dockerfile Path** : `Dockerfile.prod`

### Option B : Via CLI

```bash
cd backend
railway link  # Sélectionner ton projet
railway up
```

### Variables d'environnement Backend

Dans Railway > Service Backend > Variables, ajouter :

| Variable | Valeur |
|----------|--------|
| `APP_ENV` | `prod` |
| `APP_SECRET` | `(générer une chaîne aléatoire de 32+ caractères)` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (référence auto) |
| `JWT_PASSPHRASE` | `(votre passphrase JWT)` |
| `CORS_ALLOW_ORIGIN` | `^https://votre-frontend\.up\.railway\.app$` |

> **Note** : `${{Postgres.DATABASE_URL}}` est une référence Railway qui injecte automatiquement l'URL PostgreSQL.

---

## Étape 3 : Déployer le Frontend

1. Dans ton projet Railway, cliquer sur **"New Service"**
2. Sélectionner **"GitHub Repo"**
3. Choisir le repo `Nimaa31/HeatChek`
4. Configurer le service :
   - **Root Directory** : `frontend`
   - **Builder** : Dockerfile
   - **Dockerfile Path** : `Dockerfile.prod`

### Variables d'environnement Frontend (Build Args)

Dans Railway > Service Frontend > Variables :

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://votre-backend.up.railway.app/api` |

---

## Étape 4 : Configurer les domaines

1. Pour chaque service (backend et frontend) :
   - Aller dans **Settings** > **Networking**
   - Cliquer sur **"Generate Domain"**

2. Tu obtiendras des URLs comme :
   - Backend : `https://heatchek-backend-production.up.railway.app`
   - Frontend : `https://heatchek-frontend-production.up.railway.app`

3. **Important** : Mettre à jour `CORS_ALLOW_ORIGIN` du backend avec l'URL exacte du frontend

---

## Étape 5 : Vérification

1. Tester l'API : `https://votre-backend.up.railway.app/api`
2. Tester le frontend : `https://votre-frontend.up.railway.app`
3. Vérifier les logs dans Railway si erreur

---

## Variables d'environnement Récapitulatif

### Backend (Service Symfony)

```env
APP_ENV=prod
APP_SECRET=votre_secret_32_caracteres_minimum
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_PASSPHRASE=votre_passphrase_jwt
CORS_ALLOW_ORIGIN=^https://heatchek-frontend-production\.up\.railway\.app$
```

### Frontend (Service React)

```env
VITE_API_URL=https://heatchek-backend-production.up.railway.app/api
```

---

## Commandes utiles

```bash
# Voir les logs
railway logs

# Ouvrir le service dans le navigateur
railway open

# Exécuter une commande dans le service
railway run php bin/console doctrine:migrations:status

# Redéployer
railway up
```

---

## Troubleshooting

### Erreur CORS
- Vérifier que `CORS_ALLOW_ORIGIN` correspond exactement à l'URL du frontend
- Format regex : `^https://exact-url\.up\.railway\.app$`

### Erreur Database
- Vérifier que PostgreSQL est bien provisionné
- Utiliser `${{Postgres.DATABASE_URL}}` pour la référence automatique

### Erreur JWT
- Les clés JWT sont générées automatiquement au démarrage
- Vérifier que `JWT_PASSPHRASE` est défini

### Build échoue
- Vérifier les logs de build dans Railway
- S'assurer que le `Root Directory` pointe vers le bon dossier

---

## Coût estimé

Railway offre $5/mois de crédit gratuit :
- PostgreSQL : ~$0.50/mois (usage minimal)
- Backend : ~$1-2/mois (selon trafic)
- Frontend : ~$1-2/mois (selon trafic)

**Total estimé : ~$3-5/mois** (couvert par le tier gratuit pour un usage modéré)
