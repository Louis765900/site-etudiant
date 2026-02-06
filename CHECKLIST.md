# ✅ Checklist de Configuration - Site Étudiant

Suivez cette checklist pour configurer complètement votre projet!

## 🔧 Configuration Initiale

### 1. Repository et Installation
- [ ] Cloner/télécharger le projet
- [ ] Ouvrir le dossier dans VS Code
- [ ] Terminal: `npm install`
- [ ] Attendre la fin de l'installation

### 2. Supabase Setup

#### Créer le projet
- [ ] Aller sur [supabase.com](https://supabase.com)
- [ ] Cliquer "New Project"
- [ ] Nom: "Site Étudiant"
- [ ] Choisir password sécurisé
- [ ] Choisir région (France = Europe - Paris)
- [ ] Attendre création (2-3 min)

#### Récupérer les clés
- [ ] Aller dans Settings → API
- [ ] Copier `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copier `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Aller dans Settings → Database → Connection Pooling
- [ ] Copier `SUPABASE_SERVICE_ROLE_KEY`

#### Créer la base de données
- [ ] Aller dans SQL Editor
- [ ] Créer nouvelle requête
- [ ] Ouvrir le fichier `sql/schema.sql` du projet
- [ ] Copier tout le contenu
- [ ] Coller dans Supabase
- [ ] Cliquer "Run"
- [ ] ✅ Vérifier que toutes les tables sont créées

### 3. Configuration Google Gemini

#### Obtenir la clé API
- [ ] Aller sur [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- [ ] Cliquer "Create API Key"
- [ ] Copier la clé
- [ ] Note: la clé sera utilisée plus tard

#### Optionnel: Google OAuth
- [ ] Aller sur [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Créer nouveau projet
- [ ] APIs & Services → Credentials
- [ ] Create Credentials → OAuth 2.0 Client ID
- [ ] Web application
- [ ] Authorized redirect URIs: `https://votre-projet.supabase.co/auth/v1/callback`
- [ ] Copier Client ID et Secret
- [ ] Dans Supabase: Authentication → Providers → Google
- [ ] Ajouter Client ID et Secret

### 4. Variables d'Environnement

- [ ] Ouvrir `.env.local` dans le projet
- [ ] Remplir `NEXT_PUBLIC_SUPABASE_URL` (depuis Supabase)
- [ ] Remplir `NEXT_PUBLIC_SUPABASE_ANON_KEY` (depuis Supabase)
- [ ] Remplir `SUPABASE_SERVICE_ROLE_KEY` (depuis Supabase)
- [ ] Remplir `GEMINI_API_KEY` (depuis Google Gemini)
- [ ] Laisser `NEXT_PUBLIC_APP_URL=http://localhost:3000` (développement)

### 5. Build et Test

- [ ] Terminal: `npm run build -- --webpack`
- [ ] Vérifier qu'il n'y a pas d'erreurs
- [ ] Terminal: `npm run dev`
- [ ] Ouvrir [http://localhost:3000](http://localhost:3000)

## 🧪 Tests Fonctionnels

### Test d'Authentification
- [ ] Cliquer "S'inscrire"
- [ ] Email: `test@example.com`
- [ ] Mot de passe: `Test123!@`
- [ ] Prénom: `Étudiant`
- [ ] Date naissance: `01/01/2005` (≥15 ans)
- [ ] Filière: `Lycée Général`
- [ ] Cocher "J'accepte les conditions"
- [ ] Cliquer "S'inscrire"
- [ ] ✅ Vérifier redirection vers login
- [ ] Tester connexion avec identifiants

### Test du Dashboard
- [ ] ✅ Connecté et sur le dashboard
- [ ] Vérifier les 4 cartes statistiques
- [ ] Vérifier "Actions rapides"
- [ ] Cliquer sur "Mes devoirs"

### Test Gestion des Tâches
- [ ] Cliquer "+ Nouveau devoir"
- [ ] Titre: "Test Mathématiques"
- [ ] Matière: "Mathématiques"
- [ ] Deadline: demain
- [ ] Priorité: "Haute"
- [ ] Cliquer "Créer"
- [ ] ✅ Voir le devoir dans la liste
- [ ] Cliquer la checkbox pour marquer complété
- [ ] ✅ Vérifier que le devoir disparaît
- [ ] Créer 3-4 devoirs supplémentaires
- [ ] Tester les filtres (Tous, À faire, Terminés, Urgent)

### Test Profil d'Apprentissage
- [ ] Dashboard → "Mon profil"
- [ ] Cliquer "Commencer le test"
- [ ] Répondre aux 15 questions
- [ ] ✅ Voir le résultat (un des 4 profils)
- [ ] Lire la description
- [ ] Cliquer "Enregistrer et continuer"
- [ ] ✅ Retour au dashboard

### Test Chat IA
- [ ] Dashboard → "Chat IA"
- [ ] Taper question: "Explique-moi les dérivées"
- [ ] Cliquer envoyer
- [ ] ✅ L'IA répond (adaptation au profil)
- [ ] Taper nouvelle question
- [ ] Vérifier historique à gauche
- [ ] ✅ Vérifier streaming réponse

### Test Détails Techniques
- [ ] Ouvrir DevTools (F12)
- [ ] Onglet Network → rechargez
- [ ] Vérifier appels API
- [ ] Onglet Console → pas d'erreurs rouges
- [ ] Vérifier RLS: essayez de modifier une tâche d'un autre user (DB)

## 📱 Tests Mobile

- [ ] Ouvrir DevTools (F12)
- [ ] Clicker icône mobile
- [ ] Choisir "iPhone 12"
- [ ] Recharger la page
- [ ] ✅ Interface responsive
- [ ] Tester navigation sur mobile
- [ ] Tester formulaires sur mobile

## 🔐 Tests de Sécurité

- [ ] Essayer d'accéder `/app/dashboard` sans se connecter
  - ✅ Devrait rediriger vers `/auth/login`
- [ ] Créer un autre compte
- [ ] Vérifier qu'on ne voit pas les données de l'autre utilisateur
  - ✅ RLS doit empêcher ça
- [ ] Tester Google OAuth (si configuré)

## 🚀 Prêt pour la Production?

### Avant le déploiement
- [ ] Tester tous les flows utilisateur
- [ ] Vérifier logs Supabase
- [ ] Vérifier usage Gemini API
- [ ] Tester sur connexion lente
- [ ] Tester sur différents navigateurs

### Configuration Production

#### Vercel (recommandé)
- [ ] Terminal: `npm install -g vercel`
- [ ] Terminal: `vercel` (login si nécessaire)
- [ ] Configurer variables d'environnement
- [ ] Déploiement automatique depuis Git

#### Variables en Production
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Ajouter `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Ajouter `GEMINI_API_KEY`
- [ ] Ajouter `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Ajouter `NEXT_PUBLIC_APP_URL` (votre domaine)

#### DNS et SSL
- [ ] Configurer le domaine (si vous en avez un)
- [ ] SSL automatique (Vercel gère)
- [ ] Tester HTTPS

### Post-Déploiement
- [ ] Tester l'URL en production
- [ ] Vérifier authentification
- [ ] Vérifier chat IA
- [ ] Monitorer les erreurs (Vercel Analytics)
- [ ] Configurer une sauvegarde Supabase
- [ ] Mettre en place alertes (erreurs)

## 📊 Configuration Avancée (Optionnel)

- [ ] Email SMTP (consentement parental)
- [ ] Webhooks Supabase
- [ ] Analytics
- [ ] CDN pour images
- [ ] Caching stratégies

## 🎯 Fonctionnalités à Ajouter

### Phase 8+
- [ ] Gestion fichiers / Storage
- [ ] Cours et documents
- [ ] Stage tracking
- [ ] Notifications
- [ ] Admin panel
- [ ] Mobile app (React Native)

## 📞 Support et Aide

Si vous avez des problèmes:

1. **Vérifier les logs**
   - Terminal Next.js
   - Console navigateur (F12)
   - Logs Supabase (Dashboard)

2. **Erreurs courantes**
   - "Unauthorized": vérifier `.env.local`
   - "Invalid API key": vérifier Gemini API key
   - "RLS error": vérifier politiques Supabase
   - "Build error": utiliser `npm run build -- --webpack`

3. **Resources**
   - [README.md](./README.md)
   - [QUICKSTART.md](./QUICKSTART.md)
   - [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - [DOCUMENTATION.md](./DOCUMENTATION.md)

## ✅ Checklist Finale

- [ ] Installation complète
- [ ] Variables d'env configurées
- [ ] BD créée dans Supabase
- [ ] Tous les tests fonctionnels passent
- [ ] Interface responsive
- [ ] Chat IA fonctionne
- [ ] Prêt pour déploiement
- [ ] Déploiement en production

---

**Félicitations! 🎉 Votre plateforme est prête!**

Consultez [QUICKSTART.md](./QUICKSTART.md) pour les prochaines étapes.
