# 🚀 Guide de Démarrage Rapide

Commencez à utiliser Site Étudiant en 5 minutes!

## 📋 Pré-requis

- Node.js 18.17+ installé
- Un compte Supabase (gratuit)
- Une clé API Gemini (gratuite)

## ⚡ Installation en 5 étapes

### 1️⃣ Clonez le projet

```bash
cd votre-dossier
git clone <url-du-repo>
cd site-etudiant
```

### 2️⃣ Installez les dépendances

```bash
npm install
```

### 3️⃣ Configurez les variables d'environnement

1. Créez un compte [Supabase](https://supabase.com) (gratuit)
2. Créez un nouveau projet
3. Copiez `.env.example` en `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Remplissez les variables dans `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
   SUPABASE_SERVICE_ROLE_KEY=votre-clé-service
   GEMINI_API_KEY=votre-clé-gemini
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4️⃣ Créez les tables Supabase

1. Dans votre dashboard Supabase
2. Allez à **SQL Editor**
3. Créez une nouvelle requête
4. Copiez-collez le contenu du fichier `sql/schema.sql`
5. Cliquez sur **Run**

### 5️⃣ Lancez le serveur

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## 🎯 Premiers pas

### S'inscrire
1. Cliquez sur "S'inscrire"
2. Remplissez le formulaire (email, mot de passe, prénom, date de naissance, filière)
3. Acceptez les conditions
4. Cliquez sur "S'inscrire"

### Découvrir le profil d'apprentissage
1. Allez sur le tableau de bord
2. Cliquez sur "Mon profil"
3. Répondez aux 15 questions
4. Découvrez votre profil d'apprentissage!

### Créer un devoir
1. Allez sur "Mes devoirs"
2. Cliquez sur "+ Nouveau devoir"
3. Remplissez les infos (titre, matière, deadline, priorité)
4. Cliquez sur "Créer"

### Discuter avec l'IA
1. Allez sur "Chat IA"
2. Posez une question
3. L'IA répondra en s'adaptant à votre style d'apprentissage!

## 📚 Architecture du projet

```
site-etudiant/
├── app/
│   ├── (auth)/           # Pages authentification
│   │   ├── login/
│   │   └── signup/
│   ├── app/              # Routes protégées
│   │   ├── dashboard/
│   │   ├── dashboard/tasks/
│   │   ├── dashboard/ai-chat/
│   │   └── onboarding/personality-test/
│   ├── api/              # Routes API
│   │   └── chat/
│   ├── layout.tsx
│   └── page.tsx
├── components/           # Composants réutilisables
├── lib/
│   ├── supabase.ts      # Client Supabase
│   └── env.ts           # Validation variables
├── types/               # Types TypeScript
├── hooks/               # Hooks custom
│   └── useUser.ts
├── sql/                 # Schéma base de données
│   └── schema.sql
└── middleware.ts        # Protection des routes
```

## 🔐 Authentification

Deux méthodes de connexion:
- ✅ Email / Mot de passe
- ✅ Google OAuth (si configuré)

Les routes `/app/*` sont automatiquement protégées!

## 🤖 Fonctionnalités IA

- **Chat adaptatif**: L'IA s'adapte à votre style d'apprentissage
- **Styles reconnus**:
  - 📊 Visuel Structuré
  - 🎙️ Auditif Conversationnel
  - ⚡ Pragmatique Rapide
  - 📚 Analytique Approfondi

## 📊 Gestion des tâches

- ✅ Créer des devoirs
- ✅ Définir des priorités (Basse, Moyenne, Haute)
- ✅ Fixer des deadlines
- ✅ Marquer comme terminé
- ✅ Filtrer par statut

## 🎯 Intégrations

- **Supabase**: Auth + Database + Real-time
- **Google Gemini**: Chat IA
- **Tailwind CSS**: Styling
- **TypeScript**: Type-safety

## 🚀 Déploiement

### Sur Vercel (recommandé)

```bash
npm install -g vercel
vercel
```

Suivez les instructions pour configurer les variables d'environnement.

### Variables d'environnement en production

N'oubliez pas de configurer:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🐛 Dépannage

| Problème | Solution |
|----------|----------|
| "Variables d'env invalides" | Vérifiez `.env.local` |
| "Connexion échouée" | Attendez que Supabase soit prêt |
| "Chat IA ne répond pas" | Vérifiez votre `GEMINI_API_KEY` |
| "Tableau de bord vide" | Créez un devoir pour voir les données |

## 📖 Documentation complète

- [Supabase Setup](./SUPABASE_SETUP.md)
- [README](./README.md)

## 💬 Support

Pour des questions ou des bugs:
- Vérifiez les logs du terminal
- Consultez la documentation Supabase
- Vérifiez les politiques RLS dans Supabase

---

**Bienvenue! Commencez maintenant et améliorez votre apprentissage! 🎓**
