# Configuration Supabase

Guide complet pour configurer Supabase avec votre projet Site Étudiant.

## 🚀 Étape 1: Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Cliquez sur "New Project"
3. Configurez votre projet:
   - **Project name**: Site Étudiant
   - **Database password**: Choisissez un mot de passe sécurisé
   - **Region**: Sélectionnez la région la plus proche
4. Attendez que le projet soit créé (2-3 minutes)

## 🔑 Étape 2: Récupérer vos clés

1. Allez dans les **Settings** du projet
2. Cliquez sur **API** dans le menu gauche
3. Copiez:
   - `NEXT_PUBLIC_SUPABASE_URL`: L'URL du projet
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clé anonyme (Anon Key)
4. Allez dans **Settings > Database > Connection Pooling**:
   - Copiez la `SUPABASE_SERVICE_ROLE_KEY`

## 📊 Étape 3: Créer les tables

1. Dans Supabase, cliquez sur **SQL Editor**
2. Créez une nouvelle requête
3. Copiez tout le contenu du fichier `sql/schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter le script

Cela va créer:
- ✅ Table `profiles`
- ✅ Table `courses`
- ✅ Table `tasks`
- ✅ Table `stage_activities`
- ✅ Table `conversations`
- ✅ Table `parental_consents`
- ✅ Toutes les politiques RLS
- ✅ Les triggers automatiques

## 🔐 Étape 4: Configurer l'authentification Google (Optionnel mais recommandé)

### Sur Google Cloud:

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Allez à **APIs & Services > Credentials**
4. Cliquez sur **Create Credentials > OAuth 2.0 Client ID**
5. Choisissez **Web application**
6. Dans **Authorized redirect URIs**, ajoutez:
   ```
   https://votre-projet.supabase.co/auth/v1/callback
   ```
7. Copiez votre **Client ID** et **Client Secret**

### Dans Supabase:

1. Allez dans **Authentication > Providers**
2. Cliquez sur **Google**
3. Activez le provider
4. Collez votre Client ID et Client Secret
5. Cliquez sur **Save**

## 📝 Étape 5: Remplir vos variables d'environnement

Ouvrez le fichier `.env.local` et remplissez:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-ici
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role-ici

# API IA (Gemini)
GEMINI_API_KEY=votre-clé-gemini-ici

# Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🤖 Étape 6: Obtenir une clé API Gemini

1. Allez sur [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Cliquez sur **Create API Key**
3. Copiez la clé et collez-la dans `.env.local`

## 💻 Étape 7: Installer et lancer

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Ouvrir dans le navigateur
http://localhost:3000
```

## 🧪 Étape 8: Tester

### Créer un compte:
1. Allez sur `/auth/signup`
2. Remplissez le formulaire
3. Confirmez l'email (vérifiez dans Supabase > Authentication > Users)

### Tester le dashboard:
1. Connectez-vous
2. Allez sur `/app/dashboard`
3. Testez la création d'un devoir
4. Testez le chat IA

## 📚 Structure des tables

### profiles
```sql
- id (UUID) - Référence auth.users
- first_name (TEXT)
- birth_date (DATE)
- filiere (TEXT)
- learning_style (TEXT)
- preferences (JSONB)
- parental_consent_validated (BOOLEAN)
- parent_email (TEXT)
- created_at, updated_at
```

### tasks
```sql
- id (UUID)
- user_id (UUID)
- title (TEXT)
- description (TEXT)
- deadline (DATE)
- completed (BOOLEAN)
- priority (TEXT) - 'low', 'medium', 'high'
- created_at
```

### conversations
```sql
- id (UUID)
- user_id (UUID)
- message (TEXT)
- response (TEXT)
- model_used (TEXT)
- created_at
```

## 🔒 Sécurité avec RLS

Toutes les tables ont des politiques Row Level Security:
- Les utilisateurs ne peuvent voir que leurs propres données
- Les utilisateurs ne peuvent modifier que leurs propres données
- Les données sont automatiquement filtrées au niveau de la base de données

## ⚙️ Configuration avancée

### Email pour consentement parental

1. Configurez SMTP dans `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASSWORD=votre-mot-de-passe
FROM_EMAIL=noreply@site-etudiant.fr
```

2. Les emails seront envoyés automatiquement aux parents des mineurs

### Webhooks Supabase

Pour des fonctionnalités avancées, vous pouvez configurer des webhooks:
1. **Authentication Events**: Déclencher des actions lors de signup/signin
2. **Database Webhooks**: Déclencher des actions lors de modifications de données

## 🐛 Troubleshooting

### Erreur: "401 Unauthorized"
- Vérifiez que vos variables d'environnement sont correctes
- Assurez-vous d'être connecté
- Vérifiez les politiques RLS dans Supabase

### Erreur: "Invalid API key"
- Vérifiez que votre GEMINI_API_KEY est correct
- Assurez-vous que l'API est activée dans Google Cloud

### Erreur: "User not found"
- Vérifiez que l'utilisateur est créé dans auth.users
- Vérifiez que le profil est créé dans la table profiles

## 📞 Support

Pour plus d'aide:
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Google Gemini](https://ai.google.dev/docs)
