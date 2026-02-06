# 🔥 Firebase Setup Guide

Guide complet pour configurer Firebase avec le projet Site Étudiant.

## 📋 Prérequis

- Compte Google
- Accès à [Firebase Console](https://console.firebase.google.com)
- Node.js 18+
- npm ou yarn

---

## 🚀 Étape 1: Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Cliquez sur **"Créer un projet"**
3. Entrez le nom: `site-etudiant`
4. Acceptez les conditions d'utilisation
5. Sélectionnez **Google Analytics** (recommandé, optionnel)
6. Complétez la configuration et cliquez **"Créer le projet"**

---

## 🔑 Étape 2: Récupérer les Clés Firebase

### Configuration Web

1. Dans Firebase Console, cliquez sur ⚙️ **Paramètres du projet**
2. Onglet **"Applications"**
3. Sous "Vos applications", cliquez sur l'icône **`</>`** (Web)
4. Enregistrez l'application: `Site Étudiant`
5. Copiez la configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.firebasestorage.app",
  messagingSenderId: "xxx",
  appId: "xxx:web:xxx",
  measurementId: "G-xxx"
}
```

### Remplir le `.env.local`

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<votre_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<votre_auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<votre_project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<votre_storage_bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<votre_messaging_sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<votre_app_id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<votre_measurement_id>
```

---

## 🔐 Étape 3: Configurer l'Authentification

### Email/Mot de passe

1. Dans Firebase Console, allez à **Authentication**
2. Onglet **"Sign-in method"**
3. Cliquez sur **"Email/Mot de passe"**
4. Activez **"Email/Mot de passe"**
5. Sauvegardez

### Google OAuth

1. Dans **Sign-in method**, cliquez sur **"Google"**
2. Activez Google
3. Sélectionnez votre email de support
4. Sauvegardez

**URL de redirection autorisée:**
```
http://localhost:3000/auth/login
http://localhost:3000
```

---

## 📊 Étape 4: Créer les Collections Firestore

### Initialiser Firestore

1. Allez à **Firestore Database**
2. Cliquez **"Créer une base de données"**
3. Mode de démarrage: **"Mode de test"** (pour le développement)
4. Région: **"europe-west1"** (ou proche de vous)
5. Cliquez **"Créer"**

### Créer les Collections

Vous avez deux options:

**Option A: Manuel via Console**
1. Créez les collections dans l'ordre:
   - `profiles`
   - `tasks`
   - `courses`
   - `stage_activities`
   - `conversations`
   - `parental_consents`

2. Pour chaque collection:
   - Cliquez **"Commencer une collection"**
   - Entrez le nom
   - Cliquez **"Suivant"**
   - Laissez vide (les docs seront créés par l'app)
   - Cliquez **"Enregistrer"**

**Option B: Script Node.js (recommandé)**

Créez `scripts/init-firestore.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const collections = [
  'profiles',
  'tasks',
  'courses',
  'stage_activities',
  'conversations',
  'parental_consents'
];

async function initCollections() {
  for (const collection of collections) {
    await db.collection(collection).doc('_init').set({
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection(collection).doc('_init').delete();
    console.log(`✓ Collection "${collection}" créée`);
  }
  console.log('✓ Firestore initialisé!');
}

initCollections().catch(console.error);
```

Puis:
```bash
FIREBASE_SERVICE_ACCOUNT='...' node scripts/init-firestore.js
```

---

## 🛡️ Étape 5: Configurer les Règles Firestore

### Mode Test → Production

1. Allez à **Firestore Database**
2. Onglet **"Rules"**
3. Remplacez le contenu par:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles: utilisateurs lisent/modifient leur propre profil
    match /profiles/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
    }

    // Tasks: utilisateurs gèrent leurs propres tâches
    match /tasks/{taskId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Courses: lecture publique
    match /courses/{courseId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    // Stage activities
    match /stage_activities/{activityId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Conversations
    match /conversations/{convId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Parental consents
    match /parental_consents/{consentId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.user_id || request.auth.token.admin == true);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && (request.auth.uid == resource.data.user_id || request.auth.token.admin == true);
    }

    // Fallback: refuse tout
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Cliquez **"Publier"**

---

## 🔑 Étape 6: Créer une Clé Service (optionnel, pour Admin SDK)

Pour utiliser Firebase Admin SDK côté serveur:

1. Allez à **Paramètres du projet** → **Comptes de service**
2. Cliquez **"Générer une nouvelle clé privée"**
3. Téléchargez le fichier JSON
4. Copiez le contenu
5. Dans `.env.local`:

```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","...":"..."}'
```

⚠️ **Sécurité:** Ne committez JAMAIS cette clé dans Git!

---

## 🧪 Étape 7: Tester la Configuration

### Démarrer l'app

```bash
npm install
npm run dev
```

### Test de Signup

1. Allez à `http://localhost:3000/auth/signup`
2. Remplissez le formulaire:
   - Email: `test@example.com`
   - Prénom: `Test`
   - Date de naissance: `01/01/2000`
   - Filière: `BTS MCO`
   - Mot de passe: `TestPassword123!`
3. Cliquez **"S'inscrire"**
4. Vous devriez être redirigé vers le dashboard

### Vérifier Firestore

1. Dans Firebase Console, allez à **Firestore Database**
2. Vérifiez que les collections contiennent:
   - `profiles/{uid}` — avec vos données
   - Autres collections vides (normales au départ)

### Test de Login

1. Allez à `http://localhost:3000/auth/login`
2. Entrez vos identifiants
3. Cliquez **"Se connecter"**
4. Dashboard devrait charger

---

## 🌐 Déploiement Production

### Firebase Hosting

1. Installez Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Initialisez pour votre projet:
   ```bash
   firebase init hosting
   ```

3. Sélectionnez votre projet Firebase

4. Déployez:
   ```bash
   npm run build
   firebase deploy
   ```

### Vercel (recommandé pour Next.js)

1. Poussez votre code vers GitHub
2. Connectez Vercel à votre repo
3. Ajoutez les env vars:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Etc.
4. Déployez!

---

## ⚠️ Sécurité en Production

- [ ] Activez **reCAPTCHA** pour l'authentification
- [ ] Configurez **domaines autorisés** pour OAuth
- [ ] Limites de débit (**quotas**) dans Firebase Console
- [ ] Sauvegardes automatiques activées
- [ ] Chiffrement au repos activé
- [ ] Monitoring & alertes configurés

---

## 📚 Ressources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Pricing](https://firebase.google.com/pricing)
- [Firebase Security Best Practices](https://firebase.google.com/docs/database/security)
- [Authentication Docs](https://firebase.google.com/docs/auth)

---

## 🆘 Troubleshooting

### "Missing environment variables"
→ Vérifiez `.env.local` et rechargez `npm run dev`

### "Permission denied" sur Firestore
→ Vérifiez les Rules Firestore et que vous êtes authentifié

### "Auth not initialized"
→ Vérifiez que les clés Firebase sont correctes

### Google OAuth ne fonctionne pas
→ Vérifiez l'URL de redirection dans Google Cloud Console

