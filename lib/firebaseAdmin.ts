import admin from 'firebase-admin'

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccount) {
    // If no service account is provided, initialize with default credentials
    admin.initializeApp()
  } else {
    try {
      const cred = JSON.parse(serviceAccount)
      admin.initializeApp({
        credential: admin.credential.cert(cred),
      })
    } catch {
      // Fallback to default initialization
      admin.initializeApp()
    }
  }
}

const adminAuth = admin.auth()
const adminDb = admin.firestore()

export { admin, adminAuth, adminDb }
