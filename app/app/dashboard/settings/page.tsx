'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { db, googleProvider } from '@/lib/firebase'
import {
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  updateDoc,
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
  Edit2,
  Save,
  X,
  Check,
  Lock,
  Calendar,
} from 'lucide-react'
import { FILIERES } from '@/lib/filieres'

const clearAuthCookie = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

async function deleteUserData(uid: string) {
  const collectionsToClean = ['tasks', 'conversations', 'stage_activities', 'notes']

  for (const col of collectionsToClean) {
    const q = query(collection(db, col), where('user_id', '==', uid))
    const snapshot = await getDocs(q)

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

  await deleteDoc(doc(db, 'profiles', uid))
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, loading } = useUser()

  // Profile editing
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    first_name: '',
    birth_date: '',
    filiere: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [filiereSearch, setFiliereSearch] = useState('')
  const [showFiliereDropdown, setShowFiliereDropdown] = useState(false)

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Delete account
  const [showDeleteSection, setShowDeleteSection] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'confirm' | 'reauth'>('confirm')

  const isGoogleUser = user?.providerData[0]?.providerId === 'google.com'
  const confirmWord = 'SUPPRIMER'

  useEffect(() => {
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        birth_date: profile.birth_date || '',
        filiere: profile.filiere || '',
      })
    }
  }, [profile])

  const handleStartEdit = () => {
    setIsEditing(true)
    setSaveSuccess(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        birth_date: profile.birth_date || '',
        filiere: profile.filiere || '',
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !editData.first_name.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        first_name: editData.first_name.trim(),
        birth_date: editData.birth_date || null,
        filiere: editData.filiere || null,
        updated_at: new Date().toISOString(),
      })
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return
    setPasswordError('')
    setPasswordSuccess(false)

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caracteres')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    setChangingPassword(true)
    try {
      const credential = EmailAuthProvider.credential(user.email!, passwordData.currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passwordData.newPassword)
      setPasswordSuccess(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        setPasswordSuccess(false)
        setShowPasswordChange(false)
      }, 3000)
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      const code = firebaseErr?.code || ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setPasswordError('Mot de passe actuel incorrect')
      } else if (code === 'auth/too-many-requests') {
        setPasswordError('Trop de tentatives. Reessaye dans quelques minutes')
      } else {
        setPasswordError('Une erreur est survenue')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    if (step === 'confirm') {
      if (confirmText !== confirmWord) return
      setStep('reauth')
      setError('')
      return
    }

    setDeleting(true)
    setError('')

    try {
      if (isGoogleUser) {
        await reauthenticateWithPopup(user, googleProvider)
      } else {
        const credential = EmailAuthProvider.credential(user.email!, password)
        await reauthenticateWithCredential(user, credential)
      }

      await deleteUserData(user.uid)
      await deleteUser(user)

      clearAuthCookie()
      router.replace('/?deleted=1')
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      const code = firebaseErr?.code || ''

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Mot de passe incorrect')
      } else if (code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Reessayez dans quelques minutes')
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Authentification Google annulee')
      } else if (code === 'auth/network-request-failed') {
        setError('Erreur de connexion. Verifiez votre internet')
      } else {
        setError('Une erreur est survenue. Veuillez reessayer')
        console.error('Delete account error:', err)
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteSection(false)
    setConfirmText('')
    setPassword('')
    setError('')
    setStep('confirm')
  }

  // Filiere search/filter
  const allFilieres = FILIERES.map((f) => f.label)
  const filteredFilieres = filiereSearch
    ? allFilieres.filter((f) => f.toLowerCase().includes(filiereSearch.toLowerCase()))
    : allFilieres.slice(0, 20)

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 skeleton rounded-lg" />
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="space-y-4">
              <div className="h-6 w-32 skeleton rounded-lg" />
              <div className="h-4 w-64 skeleton rounded-lg" />
              <div className="h-4 w-48 skeleton rounded-lg" />
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
          <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
        </div>
        <p className="text-gray-500">Gere ton compte et tes preferences</p>
      </div>

      {/* Save Success Message */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">Profil mis a jour avec succes !</p>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Informations du compte
          </h2>
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sauvegarder
              </button>
            </div>
          )}
        </div>
        <div className="p-6 space-y-4">
          {/* First Name */}
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Prenom</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.first_name}
                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                  placeholder="Ton prenom"
                />
              ) : (
                <p className="font-medium text-gray-900">{profile?.first_name || 'Non renseigne'}</p>
              )}
            </div>
          </div>

          {/* Birth Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Date de naissance</p>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.birth_date}
                  onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                />
              ) : (
                <p className="font-medium text-gray-900">
                  {profile?.birth_date
                    ? new Date(profile.birth_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Non renseignee'}
                </p>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email || 'Non renseigne'}</p>
            </div>
          </div>

          {/* Filiere */}
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Filiere</p>
              {isEditing ? (
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={filiereSearch || editData.filiere}
                    onChange={(e) => {
                      setFiliereSearch(e.target.value)
                      setShowFiliereDropdown(true)
                    }}
                    onFocus={() => setShowFiliereDropdown(true)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                    placeholder="Rechercher une filiere..."
                  />
                  {showFiliereDropdown && (
                    <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                      {filteredFilieres.map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setEditData({ ...editData, filiere: f })
                            setFiliereSearch('')
                            setShowFiliereDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 transition-colors ${
                            editData.filiere === f ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-medium text-gray-900">{profile?.filiere || 'Non renseignee'}</p>
              )}
            </div>
          </div>

          {/* Learning Style (read-only) */}
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Style d&apos;apprentissage</p>
              <p className="font-medium text-gray-900">{profile?.learning_style || 'Test non effectue'}</p>
            </div>
          </div>

          {/* Auth Method (read-only) */}
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Methode de connexion</p>
              <p className="font-medium text-gray-900">
                {isGoogleUser ? 'Google' : 'Email / Mot de passe'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password (only for email users) */}
      {!isGoogleUser && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              Securite
            </h2>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Changer le mot de passe
              </button>
            )}
          </div>
          {showPasswordChange && (
            <div className="p-6 space-y-4 animate-fade-in">
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">Mot de passe modifie avec succes !</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all pr-12"
                    placeholder="Minimum 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm text-rose-700 font-medium">{passwordError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordChange(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    setPasswordError('')
                  }}
                  className="flex-1 py-3 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Changer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                Supprime definitivement ton compte et toutes tes donnees (profil, devoirs, conversations IA).
                Cette action est irreversible.
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
                        Es-tu absolument sur ?
                      </p>
                      <p className="text-sm text-rose-700 mt-1">
                        Cette action va supprimer definitivement :
                      </p>
                      <ul className="text-sm text-rose-700 mt-2 space-y-1 list-disc list-inside">
                        <li>Ton profil et tes preferences</li>
                        <li>Tous tes devoirs</li>
                        <li>Ton historique de conversations IA</li>
                        <li>Tes heures de stage</li>
                        <li>Tes notes de cours</li>
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
                        Verification d&apos;identite
                      </p>
                      <p className="text-sm text-rose-700 mt-1">
                        {isGoogleUser
                          ? 'Clique sur le bouton ci-dessous pour confirmer ton identite via Google.'
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
                  onClick={handleCancelDelete}
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
                      Supprimer definitivement
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
