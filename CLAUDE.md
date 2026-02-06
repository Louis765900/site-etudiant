# Site Etudiant - Plateforme educative

## Stack technique
- **Framework**: Next.js 16.1.6 (App Router)
- **Bundler**: Turbopack (dev) / Webpack (build, car Turbopack crash avec accents dans le chemin)
- **Auth**: Firebase Authentication (email/password + Google OAuth)
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **AI**: Google Gemini via @google/generative-ai

## Structure du projet
```
app/
  page.tsx              # Landing page (publique)
  layout.tsx            # Root layout (fonts, metadata)
  auth/
    login/page.tsx      # Page de connexion
    signup/page.tsx     # Page d'inscription (2 etapes)
  app/
    layout.tsx          # Layout authentifie (header + nav)
    loading.tsx         # Loading state global app
    dashboard/
      page.tsx          # Tableau de bord principal
      loading.tsx       # Skeleton loading dashboard
      tasks/page.tsx    # Gestion des devoirs
      ai-chat/page.tsx  # Chat avec IA Gemini
    onboarding/
      personality-test/page.tsx  # Test de personnalite
  api/
    chat/route.ts       # API route pour Gemini AI
```

## Conventions
- Langue de l'interface: Francais
- Cookie `token` pour l'authentification middleware
- `useUser()` hook pour acceder a l'utilisateur et son profil
- Firestore collections: `profiles`, `tasks`, `stage_activities`, `conversations`
- Pas de dark mode
- Build avec `--webpack` (pas Turbopack) a cause du caractere accent dans le chemin

## Commandes
- `npm run dev` - Serveur de dev (port 3000 ou 3001)
- `npm run build` - Build production (webpack)
- `npm run lint` - ESLint

## Regles
- Ne pas utiliser `getRedirectResult` dans les pages auth
- Utiliser `onSnapshot` au lieu de `getDocs` + refetch pour les donnees temps reel
- Le middleware ne doit matcher que `/app/:path*` et les routes auth
- Firebase gere le token refresh automatiquement, pas besoin d'interval
