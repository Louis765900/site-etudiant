'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { auth, db, googleProvider } from '@/lib/firebase'
import {
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
} from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore'
import {
  Settings,
  AlertTriangle,
  Trash2,
  Shield,
  User,
  Mail,
  GraduationCap,
  Brain,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'

const clearAuthCookie = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

async function deleteUserData(uid: string) {
  const collectionsToClean = ['tasks', 'conversations', 'stage_activities']

  for (const col of collectionsToClean) {
    const q = query(collection(db, col), where('user_id', '==', uid))
    const snapshot = await getDocs(q)

    // Firestore batch supports max 500 ops
    const batches: ReturnType<typeof writeBatch>[] = []
    let currentBatch = writeBatch(db)
    let count = 0

    snapshot.docs.forEach((d) => {
      currentBatch.delete(d.ref)
      count++
      if (count % 499 === 0) {
        batches.push(currentBatch)
        currentBatch = writeBatch(db)
      }
    })
    batches.push(currentBatch)

    for (const batch of batches) {
      await batch.commit()
    }
  }

  // Delete user profile document
  await deleteDoc(doc(db, 'profiles', uid))
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, loading } = useUser()

  const [showDeleteSection, setShowDeleteSection] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'confirm' | 'reauth'>('confirm')

  const isGoogleUser = user?.providerData[0]?.providerId === 'google.com'
  const confirmWord = 'SUPPRIMER'

  const handleDelete = async () => {
    if (!user) return

    if (step === 'confirm') {
      if (confirmText !== confirmWord) return
      setStep('reauth')
      setError('')
      return
    }

    // Step: reauth then delete
    setDeleting(true)
    setError('')

    try {
      // Re-authenticate
      if (isGoogleUser) {
        await reauthenticateWithPopup(user, googleProvider)
      } else {
        const credential = EmailAuthProvider.credential(user.email!, password)
        await reauthenticateWithCredential(user, credential)
      }

      // Delete all Firestore data
      await deleteUserData(user.uid)

      // Delete Firebase Auth account
      await deleteUser(user)

      // Clean up and redirect
      clearAuthCookie()
      router.replace('/?deleted=1')
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      const code = firebaseErr?.code || ''

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Mot de passe incorrect')
      } else if (code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Réessayez dans quelques minutes')
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Authentification Google annulée')
      } else if (code === 'auth/network-request-failed') {
        setError('Erreur de connexion. Vérifiez votre internet')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer')
        console.error('Delete account error:', err)
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    setShowDeleteSection(false)
    setConfirmText('')
    setPassword('')
    setError('')
    setStep('confirm')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 skeleton" />
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="space-y-4">
              <div className="h-6 w-32 skeleton" />
              <div className="h-4 w-64 skeleton" />
              <div className="h-4 w-48 skeleton" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        </div>
        <p className="text-gray-500">Gère ton compte et tes préférences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Informations du compte
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Prénom</p>
              <p className="font-medium text-gray-900">{profile?.first_name || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Filière</p>
              <p className="font-medium text-gray-900">{profile?.filiere || 'Non renseignée'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Style d&apos;apprentissage</p>
              <p className="font-medium text-gray-900">{profile?.learning_style || 'Test non effectué'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Méthode de connexion</p>
              <p className="font-medium text-gray-900">
                {isGoogleUser ? 'Google' : 'Email / Mot de passe'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de Danger */}
      <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-200 bg-rose-50">
          <h2 className="font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Zone de danger
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Supprimer mon compte</h3>
              <p className="text-sm text-gray-500 mt-1">
                Supprime définitivement ton compte et toutes tes données (profil, devoirs, conversations IA).
                Cette action est irréversible.
              </p>
            </div>
            {!showDeleteSection && (
              <button
                onClick={() => setShowDeleteSection(true)}
                className="shrink-0 px-5 py-2.5 bg-white border-2 border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl transition-all"
              >
                Supprimer le compte
              </button>
            )}
          </div>

          {showDeleteSection && (
            <div className="mt-6 p-5 bg-rose-50 rounded-2xl border border-rose-200 space-y-4 animate-fade-in">
              {step === 'confirm' && (
                <>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-800">
                        Es-tu absolument sûr ?
                      </p>
                      <p className="text-sm text-rose-700 mt-1">
                        Cette action va supprimer définitivement :
                      </p>
                      <ul className="text-sm text-rose-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Ton profil et tes préférences</li>
                        <li>Tous tes devoirs</li>
                        <li>Ton historique de conversations IA</li>
                        <li>Ton compte d&apos;authentification</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-rose-800 mb-2">
                      Tape <span className="font-mono bg-rose-200 px-1.5 py-0.5 rounded">{confirmWord}</span> pour confirmer
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-rose-300 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition-all bg-white"
                      placeholder={confirmWord}
                      autoComplete="off"
                    />
                  </div>
                </>
              )}

              {step === 'reauth' && (
                <>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-800">
                        Vérification d&apos;identité
                      </p>
                      <p className="text-sm text-rose-700 mt-1">
                        {isGoogleUser
                          ? 'Clique sur le bouton ci-dessous pour confirmer ton identité via Google.'
                          : 'Entre ton mot de passe actuel pour confirmer la suppression.'}
                      </p>
                    </div>
                  </div>

                  {!isGoogleUser && (
                    <div>
                      <label className="block text-sm font-semibold text-rose-800 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-rose-300 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition-all bg-white pr-12"
                          placeholder="Ton mot de passe"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl">
                  <p className="text-sm text-rose-700 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  disabled={deleting}
                  className="flex-1 py-3 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={
                    deleting ||
                    (step === 'confirm' && confirmText !== confirmWord) ||
                    (step === 'reauth' && !isGoogleUser && !password)
                  }
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suppression...
                    </>
                  ) : step === 'confirm' ? (
                    'Continuer'
                  ) : isGoogleUser ? (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirmer avec Google
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer définitivement
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
