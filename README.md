# Site Étudiant - Plateforme Éducative d'Aide aux Étudiants

Une plateforme moderne conçue pour aider les étudiants dans leur scolarité avec l'aide de l'intelligence artificielle.

## 🚀 Fonctionnalités

- **Authentification** : Inscription/connexion sécurisée avec Google OAuth
- **Tableau de bord** : Vue d'ensemble de vos devoirs, stages et activités
- **Gestion des devoirs** : Créez, organisez et suivez vos tâches
- **Chat IA** : Assistant pédagogique adapté à votre style d'apprentissage
- **Profil d'apprentissage** : Questionnaire personnalisé pour adapter l'IA
- **Gestion de stage** : Suivez vos heures et compétences acquises
- **Cours** : Organisez vos matières et documents

## 📋 Prérequis

- **Node.js** 18.17+ (ou version supérieure)
- **npm**, **yarn**, **pnpm** ou **bun**
- Un compte **Supabase** (gratuit sur [supabase.com](https://supabase.com))
- Une clé API **Gemini** (gratuite sur [makersuite.google.com](https://makersuite.google.com))

## 🛠️ Installation

### 1. Clonez le dépôt

```bash
git clone <your-repo-url>
cd site-etudiant
```

### 2. Installez les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configuration Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet
2. Récupérez votre `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans les paramètres du projet
3. Copiez le fichier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

4. Remplissez les variables d'environnement dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
GEMINI_API_KEY=votre-clé-gemini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configuration de la base de données

Dans votre projet Supabase, exécutez le script SQL fourni dans `sql/schema.sql` pour créer toutes les tables et politiques RLS.

### 5. Démarrez le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
site-etudiant/
├── app/
│   ├── (auth)/                    # Routes d'authentification
│   │   ├── login/
│   │   └── signup/
│   ├── app/                       # Routes protégées (après login)
│   │   ├── dashboard/
│   │   ├── dashboard/tasks/
│   │   ├── dashboard/ai-chat/
│   │   └── onboarding/
│   ├── api/                       # Routes API
│   │   └── chat/
│   ├── layout.tsx
│   └── page.tsx
├── components/                    # Composants React réutilisables
│   ├── AuthButton.tsx
│   ├── Sidebar.tsx
│   └── ...
├── lib/
│   ├── supabase.ts               # Client Supabase
│   └── env.ts                    # Validation des variables d'env
├── types/
│   └── database.types.ts         # Types TypeScript Supabase
├── hooks/                        # Hooks React custom
│   └── useUser.ts
├── .env.example                  # Template des variables d'env
├── .env.local                    # Variables d'env locales (gitignored)
└── package.json
```

## 🔐 Variables d'environnement

Voir `.env.example` pour la liste complète des variables requises.

### Variables Supabase
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme (client-side)
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service (server-side only)

### Variables API IA
- `GEMINI_API_KEY` : Clé API Google Gemini

### Variables Email
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` : Configuration SMTP pour les emails de consentement parental

## 🚀 Déploiement

### Vercel (recommandé)

```bash
npm install -g vercel
vercel
```

### Autres plateformes

Le projet peut être déployé sur n'importe quelle plateforme supportant Node.js :
- Netlify
- Railway
- Heroku
- Self-hosted

## 📚 Documentation des phases

### Phase 1 : Structure de base ✅
Projet Next.js 15, TypeScript, Tailwind CSS, Supabase

### Phase 2 : Authentification
Pages login/signup, middleware, composant AuthButton, hook useUser

### Phase 3 : Schéma de base de données
Tables Supabase, RLS policies, triggers

### Phase 4 : Dashboard principal
Vue d'ensemble, statistiques, devoirs urgents, planning

### Phase 5 : Gestion des tâches
CRUD complet, filtres, réaltime

### Phase 6 : Test de personnalité
Questionnaire d'apprentissage, calcul de profil

### Phase 7 : Chat IA
Interface chat, historique, intégration Gemini

## 🧪 Tests

```bash
# À implémenter
npm run test
```

## 🐛 Signaler un bug

Créez une issue sur le dépôt GitHub avec une description détaillée.

## 📄 Licence

MIT

## 👥 Auteur

Site Étudiant Team

---

**Prochaines étapes** : Accédez à [http://localhost:3000](http://localhost:3000) et commencez par créer un compte !
