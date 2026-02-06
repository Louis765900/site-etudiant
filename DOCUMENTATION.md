# Site Étudiant - Documentation complète du projet

## 📖 Vue d'ensemble

Site Étudiant est une plateforme éducative moderne conçue pour aider les étudiants de tous niveaux (Collège, Lycée Général, BTS) à gérer leur scolarité avec l'aide de l'intelligence artificielle.

**Technologies**: Next.js 15, TypeScript, Tailwind CSS, Supabase, Google Gemini

## 🏗️ Architecture globale

```
┌─────────────────────────────────────────────────────┐
│            Next.js 15 App Router                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  Frontend (React Components)                 │   │
│  │  - Pages d'authentification                  │   │
│  │  - Tableau de bord                           │   │
│  │  - Gestion des tâches                        │   │
│  │  - Interface Chat IA                         │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  API Routes (/api/*)                         │   │
│  │  - /api/chat (streaming Gemini)              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Middleware (Route Protection)               │   │
│  │  - Authentification                          │   │
│  │  - Redirection automatique                   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
           ↓                              ↓
    ┌──────────────┐            ┌─────────────────┐
    │  Supabase    │            │ Google Gemini   │
    │  - Auth      │            │ - Chat IA       │
    │  - Database  │            │ - Streaming     │
    │  - Real-time │            │ - Adaptation    │
    └──────────────┘            └─────────────────┘
```

## 📁 Structure des fichiers

```
site-etudiant/
│
├── app/                                    # App Router
│   ├── (auth)/                            # Routes publiques (groupe)
│   │   ├── login/
│   │   │   └── page.tsx                  # Page de connexion
│   │   └── signup/
│   │       └── page.tsx                  # Page d'inscription
│   │
│   ├── app/                              # Routes protégées (groupe)
│   │   ├── layout.tsx                    # Layout avec AuthButton
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # Dashboard principal
│   │   │   │
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx              # Gestion des devoirs
│   │   │   │
│   │   │   └── ai-chat/
│   │   │       └── page.tsx              # Interface Chat IA
│   │   │
│   │   ├── courses/                      # À implémenter
│   │   │   └── page.tsx
│   │   │
│   │   └── onboarding/
│   │       └── personality-test/
│   │           └── page.tsx              # Test de personnalité
│   │
│   ├── api/                              # API Routes
│   │   └── chat/
│   │       └── route.ts                  # API Chat (streaming Gemini)
│   │
│   ├── layout.tsx                        # Layout global
│   ├── page.tsx                          # Page d'accueil
│   └── globals.css                       # Styles globaux
│
├── components/                            # Composants réutilisables
│   ├── AuthButton.tsx                    # Bouton avec dropdown user
│   ├── Sidebar.tsx                       # Sidebar (à implémenter)
│   └── ...
│
├── lib/                                  # Utilitaires
│   ├── supabase.ts                      # Client Supabase
│   └── env.ts                           # Validation variables d'env
│
├── types/
│   └── database.types.ts                # Types TypeScript Supabase
│
├── hooks/                                # Hooks React custom
│   └── useUser.ts                       # Hook pour user + profile
│
├── sql/
│   └── schema.sql                       # Schéma complet Supabase
│
├── middleware.ts                         # Protection des routes
├── next.config.ts                        # Configuration Next.js
├── tsconfig.json                         # Configuration TypeScript
├── tailwind.config.ts                    # Configuration Tailwind
├── .env.example                          # Template variables
├── .env.local                            # Variables locales (gitignored)
├── README.md                             # Documentation complète
├── QUICKSTART.md                         # Guide de démarrage
├── SUPABASE_SETUP.md                     # Configuration Supabase
└── package.json                          # Dépendances
```

## 🔐 Système d'authentification

### Flow d'authentification

```
1. User → /auth/signup
   ↓
2. Email/Password Registration
   ↓
3. Créer profil dans DB
   ↓
4. Redirection vers /auth/login
   ↓
5. User → /auth/login
   ↓
6. Email/Password Login
   ↓
7. Middleware check
   ↓
8. Redirect to /app/dashboard
```

### Middleware.ts

```typescript
- Vérifie le token Supabase
- Protège les routes /app/*
- Redirige les utilisateurs auth vers /app/dashboard
- Redirige les non-auth vers /auth/login
```

## 🗄️ Schéma de la base de données

### Profiles (extends auth.users)
```sql
id (UUID) → auth.users.id
first_name
birth_date
filiere ('BTS MCO', 'BTS SAM', 'Bac Pro', 'Lycée', 'Collège')
learning_style ('Visuel Structuré', 'Auditif', 'Pragmatique', 'Analytique')
preferences (JSONB) → {completed_test: true, test_date: ...}
parental_consent_validated
parent_email
created_at, updated_at
```

### Tasks
```sql
id
user_id → profiles.id
title
description
deadline
completed
priority ('low', 'medium', 'high')
created_at

Indexes: user_id, deadline, completed
```

### Conversations (AI Chat)
```sql
id
user_id → profiles.id
message (question utilisateur)
response (réponse IA)
model_used ('gemini-2.5-flash')
created_at

Indexes: user_id, created_at
```

### Autres tables
- **courses**: Cours et documents
- **stage_activities**: Suivi d'heures de stage
- **parental_consents**: Gestion consentement parental

### RLS (Row Level Security)
```
✅ Chaque utilisateur ne voit QUE ses propres données
✅ Appliqué au niveau base de données
✅ Sécurité garantie même avec compromise du client
```

## 🤖 Système IA

### Profils d'apprentissage

Après inscription, l'utilisateur fait un test (15 questions) pour découvrir son profil:

1. **Visuel Structuré** 📊
   - Préfère schémas et diagrammes
   - Aime les listes organisées
   - Adapte: visuels, symboles, code couleur

2. **Auditif Conversationnel** 🎙️
   - Apprend en discutant
   - Préfère explications orales
   - Adapte: conversation, questions, débat

3. **Pragmatique Rapide** ⚡
   - Veut des résultats immédiats
   - Apprend en faisant
   - Adapte: cas concrets, exercices rapides

4. **Analytique Approfondi** 📚
   - Aime comprendre le fond
   - Veut des détails complets
   - Adapte: analyses, contexte, ressources approfondies

### Intégration Gemini

```
User Question
    ↓
Récupère learning_style du profil
    ↓
Construit system_prompt adapté
    ↓
Récupère 5 derniers messages (contexte)
    ↓
Appelle Gemini 2.5 Flash avec streaming
    ↓
Sauvegarde dans DB (conversations)
    ↓
Retourne réponse adaptée
```

## 🔄 Real-time Features

### Supabase Real-time subscriptions

```typescript
// Dans dashboard/page.tsx
supabase
  .channel('tasks-channel')
  .on('postgres_changes', {
    event: '*',
    table: 'tasks',
    filter: `user_id=eq.${user.id}`
  }, () => loadDashboardData())
  .subscribe()
```

Si un devoir est modifié, le dashboard se met à jour automatiquement!

## 📱 Pages et features

### /auth/login
- ✅ Email/Password
- ✅ Google OAuth (si configuré)
- ✅ Gestion erreurs
- ✅ Lien vers signup

### /auth/signup
- ✅ Email/Password/Confirm
- ✅ Prénom, date de naissance
- ✅ Sélection filière
- ✅ Si mineur: email parent
- ✅ Checkbox conditions
- ✅ Profile création auto

### /app/dashboard
- ✅ Vue d'ensemble (4 stats cartes)
- ✅ Devoirs urgents (5 tâches)
- ✅ Planning semaine
- ✅ Actions rapides
- ✅ Activités récentes
- ✅ Real-time updates

### /app/dashboard/tasks
- ✅ CRUD complet
- ✅ Filtres (Tous, À faire, Terminés, Urgent)
- ✅ Groupage par date
- ✅ Modal création/édition
- ✅ Suppression avec confirmation

### /app/dashboard/ai-chat
- ✅ Interface chat moderne
- ✅ Messages utilisateur/IA
- ✅ Historique conversations
- ✅ Streaming réponses
- ✅ Adaptation au profil

### /app/onboarding/personality-test
- ✅ 15 questions
- ✅ Progression visuelle
- ✅ Résultat avec description
- ✅ Sauvegarde du profil
- ✅ Points d'adaptation

## 🔌 API Routes

### POST /api/chat
```javascript
Request: { message: "string" }

Response: {
  response: "string (texte adapté au profil)"
}

Features:
- ✅ Récupère user depuis auth
- ✅ Récupère profil utilisateur
- ✅ Récupère historique (5 derniers)
- ✅ Construit prompt système
- ✅ Appelle Gemini en streaming
- ✅ Sauvegarde conversation
- ✅ Adapte réponse
```

## 📦 Dépendances principales

```json
{
  "next": "^16.1.6",
  "react": "^19",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@supabase/supabase-js": "^2",
  "@supabase/ssr": "^0",
  "@google/generative-ai": "^0",
  "zod": "^3"
}
```

## 🔧 Configuration

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Gemini
GEMINI_API_KEY

# App
NEXT_PUBLIC_APP_URL
```

### TypeScript
- ✅ Strict mode activé
- ✅ Types Supabase générés
- ✅ Types custom pour Database

### Tailwind CSS
- ✅ Responsive design
- ✅ Dark mode ready
- ✅ Custom colors

## 🚀 Déploiement

### Sur Vercel

```bash
vercel login
vercel
```

Configure automatiquement:
- Build settings
- Environment variables
- Deployments automatiques depuis Git

### Variables de production
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 🧪 Testing

À implémenter:
- Unit tests (Jest)
- Integration tests (Playwright)
- E2E tests

## 📈 Roadmap

### Phase 8: Fichiers et stockage
- Upload documents
- Stockage Supabase Storage
- Gestion fichiers

### Phase 9: Notifications
- Toast notifications
- Email notifications
- Push notifications

### Phase 10: Admin Panel
- Gestion utilisateurs
- Statistiques
- Modération

### Phase 11: Mobile App
- React Native
- Synchronisation offline

## 🐛 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token expiré | Refresh la page |
| RLS error | Politiques RLS restrictives | Vérifier settings RLS |
| Gemini error | Quota dépassé | Vérifier usage Gemini |
| Build fail | Caractères spéciaux chemin | Utiliser `--webpack` |

## 📚 Resources

- [Next.js Docs](https://nextjs.org)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com)
- [Google Gemini API](https://ai.google.dev)

## 💡 Best Practices

1. **Sécurité**
   - Toujours valider côté serveur
   - Utiliser RLS pour données sensibles
   - Jamais d'API key en client

2. **Performance**
   - Optimiser images
   - Code splitting automatique
   - Caching Supabase

3. **UX**
   - Feedback immédiat utilisateur
   - Loading states clairs
   - Erreurs explicites

4. **Code**
   - Types TypeScript strict
   - Composants réutilisables
   - Env validation au démarrage

---

**Version**: 1.0.0
**Dernière mise à jour**: Février 2026
